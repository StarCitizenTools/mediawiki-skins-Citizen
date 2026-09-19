import { describe, expect, it } from "vitest";
import {
	apiCandidates,
	findApiUrl,
	mergeRecord,
	parseSiteinfo,
	shouldAlert,
	supersededKeys,
} from "../scripts/showcase/lib.js";

describe("findApiUrl", () => {
	it("extracts the api endpoint from an EditURI link", () => {
		const html = `<link rel="EditURI" type="application/rsd+xml" href="https://coasterpedia.net/w/api.php?action=rsd" />`;

		expect(findApiUrl(html, "https://coasterpedia.net")).toBe(
			"https://coasterpedia.net/w/api.php",
		);
	});

	it("resolves a protocol-relative href", () => {
		const html = `<link rel="EditURI" href="//utg.miraheze.org/w/api.php?action=rsd" />`;

		expect(findApiUrl(html, "https://utg.miraheze.org")).toBe(
			"https://utg.miraheze.org/w/api.php",
		);
	});

	it("resolves a root-relative href against the site URL", () => {
		const html = `<link rel="EditURI" href="/w/api.php?action=rsd" />`;

		expect(findApiUrl(html, "https://voca.wiki/wiki/Main_Page")).toBe(
			"https://voca.wiki/w/api.php",
		);
	});

	it("returns null when there is no EditURI link", () => {
		expect(findApiUrl("<html><head></head></html>", "https://voca.wiki")).toBeNull();
	});

	it("returns null rather than an href nothing can fetch", () => {
		const html = `<link rel="EditURI" href="?action=rsd" />`;

		expect(findApiUrl(html, "not a url")).toBeNull();
	});
});

describe("apiCandidates", () => {
	it("offers the two conventional paths, root first", () => {
		expect(apiCandidates("https://voca.wiki")).toEqual([
			"https://voca.wiki/api.php",
			"https://voca.wiki/w/api.php",
		]);
	});

	it("drops the path of the listed URL and keeps the origin", () => {
		expect(apiCandidates("https://chaotic-ground.github.io/wikven/citizen/index.html")).toEqual(
			[
				"https://chaotic-ground.github.io/api.php",
				"https://chaotic-ground.github.io/w/api.php",
			],
		);
	});

	it("keeps a non-default port", () => {
		expect(apiCandidates("https://example.test:8443/wiki")[0]).toBe(
			"https://example.test:8443/api.php",
		);
	});

	it("throws on a URL it cannot parse, rather than inventing an endpoint", () => {
		expect(() => apiCandidates("not a url")).toThrow();
	});
});

describe("parseSiteinfo", () => {
	const response = {
		query: {
			general: { lang: "en", generator: "MediaWiki 1.46.0" },
			statistics: { articles: 25_599 },
			skins: [{ code: "citizen", default: "" }, { code: "vector-2022" }],
		},
	};

	it("pulls the fields the showcase displays", () => {
		expect(parseSiteinfo(response)).toEqual({
			articles: 25_599,
			lang: "en",
			generator: "MediaWiki 1.46.0",
			defaultSkin: "citizen",
		});
	});

	it("reports the default skin even when it is not citizen", () => {
		const migrated = structuredClone(response);
		migrated.query.skins = [{ code: "vector-2022", default: "" }, { code: "citizen" }];

		expect(parseSiteinfo(migrated).defaultSkin).toBe("vector-2022");
	});

	it("returns a null default skin when none is flagged", () => {
		const none = structuredClone(response);
		none.query.skins = [{ code: "citizen" }];

		expect(parseSiteinfo(none).defaultSkin).toBeNull();
	});
});

/*
 * The `null` below is mergeRecord's documented failure sentinel, not a stand-in
 * for a missing value: the function branches on `fresh === null`, so passing
 * `undefined` would take the success path and merge nothing. It also keeps the
 * module consistent, since findApiUrl, parseSiteinfo and shouldAlert all return
 * `null` too. Hence the per-line unicorn/no-null suppressions.
 */
describe("mergeRecord", () => {
	const previous = { articles: 100, lang: "en", consecutiveFailures: 0 };

	it("writes fresh fields and clears the failure count on success", () => {
		const merged = mergeRecord(previous, { articles: 120, lang: "en" }, "2026-09-19T00:00:00Z");

		expect(merged.articles).toBe(120);
		expect(merged.consecutiveFailures).toBe(0);
		expect(merged.checkedAt).toBe("2026-09-19T00:00:00Z");
	});

	it("keeps the previous values and increments the count on failure", () => {
		// oxlint-disable-next-line unicorn/no-null
		const merged = mergeRecord(previous, null, "2026-09-19T00:00:00Z");

		expect(merged.articles).toBe(100);
		expect(merged.consecutiveFailures).toBe(1);
	});

	it("starts a record from nothing when a wiki is newly added", () => {
		// oxlint-disable-next-line unicorn/no-null
		const merged = mergeRecord(undefined, null, "2026-09-19T00:00:00Z");

		expect(merged.consecutiveFailures).toBe(1);
		expect(merged.articles).toBeUndefined();
	});

	it("counts on from a streak already in progress", () => {
		// oxlint-disable-next-line unicorn/no-null
		const merged = mergeRecord({ consecutiveFailures: 3 }, null, "2026-09-19T00:00:00Z");

		expect(merged.consecutiveFailures).toBe(4);
	});

	it("clears a streak already in progress once the wiki answers", () => {
		const merged = mergeRecord(
			{ consecutiveFailures: 3 },
			{ articles: 120 },
			"2026-09-19T00:00:00Z",
		);

		expect(merged.consecutiveFailures).toBe(0);
	});
});

describe("shouldAlert", () => {
	const entry = { name: "Some Wiki", url: "https://some.example" };

	it("flags a wiki that migrated to another skin", () => {
		const reason = shouldAlert(entry, { defaultSkin: "vector-2022", consecutiveFailures: 0 });

		expect(reason).toMatch(/vector-2022/);
	});

	it("stays quiet while the default skin is citizen", () => {
		expect(shouldAlert(entry, { defaultSkin: "citizen", consecutiveFailures: 0 })).toBeNull();
	});

	it("fires at four consecutive failures, not three", () => {
		expect(shouldAlert(entry, { consecutiveFailures: 3 })).toBeNull();
		expect(shouldAlert(entry, { consecutiveFailures: 4 })).toMatch(/4/);
	});

	it("never fires for an entry known to be unreachable", () => {
		const pinned = { ...entry, expectUnreachable: true };

		expect(shouldAlert(pinned, { consecutiveFailures: 99 })).toBeNull();
	});

	it("still flags an unreachable-by-design entry that answers with another skin", () => {
		const pinned = { ...entry, expectUnreachable: true };

		expect(shouldAlert(pinned, { defaultSkin: "vector-2022", consecutiveFailures: 0 })).toMatch(
			/vector-2022/,
		);
	});
});

/** A shots manifest naming one wiki per key given. */
function manifest(...shots: string[]): string {
	return JSON.stringify(
		Object.fromEntries(shots.map((shot, index) => [`https://w${index}.example`, { shot }])),
	);
}

describe("supersededKeys", () => {
	it("returns a key the new manifest no longer names", () => {
		const dropped = supersededKeys(
			manifest("shots/old.webp", "shots/keep.webp"),
			manifest("shots/new.webp", "shots/keep.webp"),
		);

		expect(dropped).toEqual(["shots/old.webp"]);
	});

	it("keeps a key both manifests name", () => {
		const dropped = supersededKeys(manifest("shots/keep.webp"), manifest("shots/keep.webp"));

		expect(dropped).toEqual([]);
	});

	it("never returns a key only the new manifest names", () => {
		const dropped = supersededKeys(
			manifest("shots/keep.webp"),
			manifest("shots/keep.webp", "shots/brand-new.webp"),
		);

		expect(dropped).toEqual([]);
	});

	it("collects a key whose record survived without a shot", () => {
		const after = JSON.stringify({
			"https://w0.example": { checkedAt: "2026-01-01T00:00:00.000Z", consecutiveFailures: 1 },
			"https://w1.example": { shot: "shots/keep.webp" },
		});

		expect(supersededKeys(manifest("shots/gone.webp", "shots/keep.webp"), after)).toEqual([
			"shots/gone.webp",
		]);
	});

	it("deletes nothing when there is no predecessor manifest", () => {
		expect(supersededKeys("{}", manifest("shots/first.webp"))).toEqual([]);
	});

	it("deletes nothing when neither manifest names a shot", () => {
		expect(supersededKeys("{}", "{}")).toEqual([]);
	});
});

/**
 * The whole bucket is what these inputs delete without the guard, and nothing
 * can list R2 to put it back.
 */
describe("supersededKeys refusals", () => {
	it("refuses to run when the new manifest names nothing and the old named something", () => {
		expect(() => supersededKeys(manifest("shots/a.webp", "shots/b.webp"), "{}")).toThrow(
			/refusing to delete/,
		);
	});

	it("refuses just as firmly when the new manifest has records but no shots", () => {
		const after = JSON.stringify({ "https://w0.example": { consecutiveFailures: 1 } });

		expect(() => supersededKeys(manifest("shots/a.webp"), after)).toThrow(/refusing to delete/);
	});

	it("throws rather than deleting everything when a manifest will not parse", () => {
		expect(() => supersededKeys(manifest("shots/a.webp"), "not json")).toThrow();
	});
});

/**
 * The bucket holds the whole docs site's media, so the delete set is checked
 * against the prefix the showcase writes under rather than trusted because of
 * where it came from.
 */
describe("supersededKeys key prefix", () => {
	it("refuses to delete a key that climbs back out of the prefix, and names it", () => {
		expect(() =>
			supersededKeys(
				manifest("shots/a.webp", "shots/../og/card.png"),
				manifest("shots/a.webp"),
			),
		).toThrow(/shots\/\.\.\/og\/card\.png/);
	});

	it("refuses to delete a key from outside the shots prefix, and names it", () => {
		expect(() =>
			supersededKeys(manifest("shots/a.webp", "og/card.png"), manifest("shots/a.webp")),
		).toThrow(/og\/card\.png/);
	});

	it("leaves a key outside the prefix alone while the new manifest still names it", () => {
		const both = manifest("shots/keep.webp", "og/card.png");

		expect(supersededKeys(both, both)).toEqual([]);
	});
});
