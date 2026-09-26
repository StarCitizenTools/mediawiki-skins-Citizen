import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { mergeRecord, SHOT_KEY_PREFIX } from "./lib.js";

const VIEWPORT = { width: 1440, height: 900 };

/**
 * Content-addresses a capture.
 *
 * Because the key is the hash, a republished image is a new URL, which is what
 * makes a one-year immutable cache header safe and removes any need to stage
 * images while a PR is in review.
 *
 * @param {Buffer} bytes
 */
export function shotKey(bytes) {
	return `${SHOT_KEY_PREFIX}${createHash("sha256").update(bytes).digest("hex").slice(0, 16)}.webp`;
}

/**
 * MediaWiki's CookieWarning extension; confirmed live on doorsgame.wiki. Kept
 * with the generic consent selectors so one list covers every wiki.
 */
const BANNER_CSS = `
	.mw-cookiewarning-container,
	#cookiewarning,
	[id*="cookie-banner"],
	[class*="cookie-consent"],
	[aria-label*="cookie" i] { display: none !important; }
`;

const NAVIGATION_TIMEOUT_MS = 45_000;
const SETTLE_TIMEOUT_MS = 15_000;

/**
 * An ordinary desktop Chrome User-Agent for the Chrome actually driving the run.
 *
 * Headless Chromium advertises a HeadlessChrome token by default, which is one
 * of the cheapest bot signals there is to match on. Two listed wikis refuse it:
 * 求聞百科 answers it with a 502 and an empty body, and Tolkien Gateway with a
 * Cloudflare 403 challenge. Both serve their front page to the identical request
 * carrying this string. The version comes from the running browser and is
 * reduced to the major-only form current Chrome sends, so the string stays true
 * as Playwright updates rather than rotting into a signal of its own.
 *
 * @param {object} browser
 */
function desktopUserAgent(browser) {
	const major = browser.version().split(".")[0];

	return `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 Safari/537.36`;
}

const R2_BUCKET = process.env.R2_BUCKET ?? "mwcitizen-media";

/**
 * Puts one object into R2.
 *
 * Immutable caching is safe because the key is the content hash, so a changed
 * screenshot is always a different URL.
 *
 * Invokes wrangler off PATH, not through npx: the installed CLI is one pinned
 * version, so a run holding a token that can write and delete published objects
 * cannot resolve a different one. Absent, this throws rather than fetching it.
 *
 * @param {string} key
 * @param {string} file
 */
function upload(key, file) {
	execFileSync(
		"wrangler",
		[
			"r2",
			"object",
			"put",
			`${R2_BUCKET}/${key}`,
			`--file=${file}`,
			"--content-type=image/webp",
			"--cache-control=public, max-age=31536000, immutable",
			"--remote",
		],
		{ stdio: "inherit" },
	);
}

// oxlint-disable-next-line no-control-regex
const ANSI_ESCAPE = /\u001B\[[\d;]*m/g;

/**
 * The reason, without the call log.
 *
 * Playwright reports a navigation failure as a multi-line message whose tail is
 * an ANSI-coloured call log. Only the first line names the fault, and the list
 * this feeds is Markdown bullets in a pull request body.
 *
 * @param {string} message
 */
function firstLine(message) {
	return message.split("\n")[0].replaceAll(ANSI_ESCAPE, "").trim();
}

async function capture(page, url) {
	const response = await page.goto(url, {
		waitUntil: "load",
		timeout: NAVIGATION_TIMEOUT_MS,
	});

	/**
	 * goto resolves for an error page as readily as for a wiki, so an unchecked
	 * capture content-addresses a 502 or a bot challenge and publishes it as that
	 * wiki's screenshot. No shot is better than a wrong one.
	 */
	if (!response?.ok()) {
		throw new Error(`HTTP ${response?.status() ?? "no response"}`);
	}

	/**
	 * Settling is worth waiting for and never worth failing over: a single
	 * analytics host that refuses connections keeps the network busy for as long
	 * as anything is willing to wait, and the wiki behind it renders fine.
	 */
	await page
		.waitForLoadState("networkidle", { timeout: SETTLE_TIMEOUT_MS })
		.catch(() => undefined);

	await page.addStyleTag({ content: BANNER_CSS });
	await page.evaluate(() => document.fonts.ready);

	return page.screenshot({ type: "webp", quality: 78 });
}

async function main() {
	const { values } = parseArgs({
		options: {
			out: { type: "string", default: "" },
			upload: { type: "boolean", default: false },
		},
	});

	const dataDir = resolve(import.meta.dirname, "../../data");
	/** Scratch. Gitignored; outlives the run's console output, which wrangler floods. */
	const failuresPath = resolve(import.meta.dirname, "../../showcase-failures.json");
	const sources = JSON.parse(readFileSync(resolve(dataDir, "showcase.json"), "utf8"));
	const previous = JSON.parse(readFileSync(resolve(dataDir, "showcase-shots.json"), "utf8"));
	const timestamp = new Date().toISOString();

	const outDir = values.out ? resolve(process.cwd(), values.out) : null;

	/**
	 * wrangler puts a file, so there is nothing to send without one on disk.
	 * Refusing the combination outright beats capturing to nowhere and reporting
	 * a clean run that published no object at all.
	 */
	if (values.upload && !outDir) {
		throw new Error("--upload needs --out, because wrangler puts a file from disk.");
	}

	if (outDir) {
		mkdirSync(resolve(outDir, SHOT_KEY_PREFIX), { recursive: true });
	}

	// Identical bytes hash to an identical key, so re-uploading is wasted work.
	const previousKeys = new Set(Object.values(previous).map((record) => record.shot));

	/**
	 * Seeded as a failure for every wiki and overwritten on success, so a run that
	 * dies part-way still writes a record for all of them. A URL absent from the
	 * manifest is a URL whose object the next gc run deletes.
	 */
	const next = Object.fromEntries(
		sources.map((entry) => [entry.url, mergeRecord(previous[entry.url], null, timestamp)]),
	);

	const browser = await chromium.launch();

	/**
	 * A wiki that refuses keeps the screenshot it already had, so the manifest
	 * diff of a run where every capture failed is nothing but timestamps. Without
	 * this list the only evidence is a line in the run log, and the pull request
	 * asks a human to check a preview that looks entirely correct.
	 */
	const failures = [];
	let captured = 0;

	try {
		const context = await browser.newContext({
			viewport: VIEWPORT,
			userAgent: desktopUserAgent(browser),
			/**
			 * As served. newContext defaults to light, which forces a wiki whose
			 * own default is dark into a scheme its readers never see.
			 */
			colorScheme: null,
		});

		for (const entry of sources) {
			let page = null;
			let shot = null;

			try {
				page = await context.newPage();

				const bytes = await capture(page, entry.url);

				shot = shotKey(bytes);

				if (outDir) {
					writeFileSync(resolve(outDir, shot), bytes);
				}

				console.log(`${entry.name}: ${shot} (${bytes.length} bytes)`);
			} catch (error) {
				console.warn(`${entry.name}: ${error.message}`);
				failures.push(`${entry.name} (${entry.url}): ${firstLine(error.message)}`);
			} finally {
				await page?.close();
			}

			if (shot === null) {
				continue;
			}

			/**
			 * Deliberately outside the per-wiki try, so a refused put aborts the run
			 * on the first one. A wrangler failure is the credentials, the scope or
			 * the bucket, never this wiki: swallowing it would log the same failure
			 * 23 more times, ask 23 more community wikis for a screenshot nothing
			 * will publish, and finish green.
			 */
			if (values.upload && !previousKeys.has(shot)) {
				upload(shot, resolve(outDir, shot));
			}

			/**
			 * Recorded only once the object is in the bucket, and as one literal: a
			 * record carrying `shot` without both dimensions makes the grid omit the
			 * width/height attributes, reintroducing the layout shift they prevent.
			 */
			next[entry.url] = mergeRecord(
				previous[entry.url],
				{ shot, shotW: VIEWPORT.width, shotH: VIEWPORT.height },
				timestamp,
			);
			captured += 1;
		}
	} finally {
		/** A browser that crashed cannot be closed cleanly, and must not take the run's captures with it. */
		await browser.close().catch(() => undefined);

		const manifest = `${JSON.stringify(next, null, "\t")}\n`;

		writeFileSync(resolve(dataDir, "showcase-shots.json"), manifest);
		writeFileSync(failuresPath, `${JSON.stringify(failures, null, "\t")}\n`);

		if (outDir) {
			writeFileSync(resolve(outDir, "manifest.json"), manifest);
		}
	}

	/**
	 * Counts this run's captures, not records holding a shot: a record keeps the
	 * shot an earlier run took, so counting those would report a run where every
	 * wiki failed as a run where every wiki succeeded.
	 */
	console.log(`Captured ${captured} of ${sources.length}.`);

	for (const failure of failures) {
		console.warn(`Not captured: ${failure}`);
	}
}

/**
 * Guarded so the test can import shotKey without launching a browser and
 * capturing two dozen live wikis as a side effect of the import.
 */
if (process.argv[1] === import.meta.filename) {
	await main();
}
