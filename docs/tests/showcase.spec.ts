import { describe, expect, it } from "vitest";
import {
	formatArticleCount,
	formatGenerator,
	joinShowcase,
	monogramFor,
	SHOWCASE_TAGS,
} from "../.vitepress/theme/utils/showcase.ts";
import showcaseSources from "../data/showcase.json";

describe("formatArticleCount", () => {
	it("shows counts below 1000 exactly", () => {
		expect(formatArticleCount(44)).toBe("44 articles");
		expect(formatArticleCount(999)).toBe("999 articles");
	});

	it("rounds down to two significant figures with a plus", () => {
		expect(formatArticleCount(1000)).toBe("1K+ articles");
		expect(formatArticleCount(6648)).toBe("6.6K+ articles");
		expect(formatArticleCount(13_183)).toBe("13K+ articles");
		expect(formatArticleCount(25_599)).toBe("25K+ articles");
		expect(formatArticleCount(1_184_247)).toBe("1.1M+ articles");
	});

	it("never rounds up, so the plus stays true", () => {
		expect(formatArticleCount(6699)).toBe("6.6K+ articles");
		expect(formatArticleCount(19_999)).toBe("19K+ articles");
	});
});

describe("formatGenerator", () => {
	it("shortens a MediaWiki version to major.minor", () => {
		expect(formatGenerator("MediaWiki 1.46.0")).toBe("MW 1.46");
		expect(formatGenerator("MediaWiki 1.39.8")).toBe("MW 1.39");
	});

	it("returns undefined for anything unrecognised", () => {
		expect(formatGenerator()).toBeUndefined();
		expect(formatGenerator("Wibble 3")).toBeUndefined();
	});
});

describe("monogramFor", () => {
	it("takes initials of the first two significant words", () => {
		expect(monogramFor("Star Citizen Wiki")).toBe("SC");
		expect(monogramFor("Tolkien Gateway")).toBe("TG");
	});

	it("ignores the, official and wiki", () => {
		expect(monogramFor("The Apple Wiki")).toBe("AP");
		expect(monogramFor("Official DOORS Wiki")).toBe("DO");
	});

	it("uses a single glyph for CJK names", () => {
		expect(monogramFor("求聞百科")).toBe("求");
	});
});

describe("joinShowcase", () => {
	const entries = [
			{ name: "Big Wiki", url: "https://big.example", tags: ["games"] },
			{ name: "Small Wiki", url: "https://small.example", tags: ["media"] },
			{ name: "Unknown Wiki", url: "https://unknown.example", tags: ["games"] },
		],
		metadata = {
			"https://big.example": { articles: 25_599, lang: "en", generator: "MediaWiki 1.46.0" },
			"https://small.example": { articles: 89, lang: "en", generator: "MediaWiki 1.45.1" },
		},
		shots = {
			"https://big.example": { shot: "shots/abc123.webp", shotW: 1440, shotH: 900 },
		};

	it("sorts largest first and puts countless entries last", () => {
		const result = joinShowcase(entries, metadata, shots);

		expect(result.map((entry) => entry.name)).toEqual([
			"Big Wiki",
			"Small Wiki",
			"Unknown Wiki",
		]);
	});

	it("merges metadata and shot records onto the entry", () => {
		const [big] = joinShowcase(entries, metadata, shots);

		expect(big.articles).toBe(25_599);
		expect(big.shot).toBe("shots/abc123.webp");
		expect(big.shotW).toBe(1440);
	});

	it("leaves generated fields undefined when no record exists", () => {
		const unknown = joinShowcase(entries, metadata, shots).at(-1);

		expect(unknown?.articles).toBeUndefined();
		expect(unknown?.shot).toBeUndefined();
	});

	it("throws naming the wiki and the bad tag", () => {
		const bad = [{ name: "Bad Wiki", url: "https://bad.example", tags: ["fandom"] }];

		expect(() => joinShowcase(bad, {}, {})).toThrow(/Bad Wiki.*fandom/s);
	});

	it("exposes exactly four tags", () => {
		expect(Object.keys(SHOWCASE_TAGS)).toEqual(["games", "media", "technology", "real-world"]);
	});
});

describe("joinShowcase generated records", () => {
	const entries = [{ name: "Listed Wiki", url: "https://listed.example", tags: ["games"] }];

	it("ignores a record for a wiki that is no longer listed", () => {
		const result = joinShowcase(
			entries,
			{ "https://removed.example": { articles: 700 } },
			{ "https://removed.example": { shot: "shots/stale.webp" } },
		);

		expect(result.map((entry) => entry.url)).toEqual(["https://listed.example"]);
	});
});

describe("showcase.json", () => {
	it("tags every wiki from the vocabulary", () => {
		expect(() => joinShowcase(showcaseSources, {}, {})).not.toThrow();
	});
});
