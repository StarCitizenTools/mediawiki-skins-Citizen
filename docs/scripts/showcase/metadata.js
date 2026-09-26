import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { apiCandidates, findApiUrl, mergeRecord, parseSiteinfo, shouldAlert } from "./lib.js";

const dataDir = resolve(import.meta.dirname, "../../data");
const sourcesPath = resolve(dataDir, "showcase.json");
const metadataPath = resolve(dataDir, "showcase-metadata.json");
const alertsPath = resolve(import.meta.dirname, "../../showcase-alerts.json");

/**
 * An honest bot User-Agent rather than a browser-shaped one. The hosts that
 * refuse this script answer a Chrome string with the same 403, so disguising
 * the client buys nothing and misstates who is calling.
 */
const HEADERS = {
	"User-Agent":
		"CitizenShowcaseBot/1.0 (https://mwcitizen.skin; refreshes the Citizen skin showcase)",
};

const TIMEOUT_MS = 25_000;

async function get(url) {
	const response = await fetch(url, {
		headers: HEADERS,
		signal: AbortSignal.timeout(TIMEOUT_MS),
		redirect: "follow",
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response;
}

/**
 * A 200 is not proof of an API. A host that serves the same page for every path
 * answers a candidate endpoint just as happily as a real api.php, so the
 * response has to look like siteinfo before any of it is believed.
 */
async function querySiteinfo(api) {
	const query = `${api}?action=query&meta=siteinfo&siprop=general%7Cstatistics%7Cskins&format=json`;
	const payload = await (await get(query)).json();

	if (!payload?.query?.general) {
		throw new Error("answered without siteinfo");
	}

	return parseSiteinfo(payload);
}

async function fetchSiteinfo(url) {
	const failures = [];
	let discovered = null;

	try {
		const home = await (await get(url)).text();

		discovered = findApiUrl(home, url);

		if (!discovered) {
			failures.push("home page carries no usable EditURI link");
		}
	} catch (error) {
		failures.push(`home page: ${error.message}`);
	}

	if (discovered) {
		return querySiteinfo(discovered);
	}

	/**
	 * Only reached once discovery has already failed, so a wiki that advertises
	 * its API normally never takes this path and never changes behaviour.
	 */
	for (const candidate of apiCandidates(url)) {
		try {
			return await querySiteinfo(candidate);
		} catch (error) {
			failures.push(`${candidate}: ${error.message}`);
		}
	}

	throw new Error(failures.join("; "));
}

const sources = JSON.parse(readFileSync(sourcesPath, "utf8"));
const previous = JSON.parse(readFileSync(metadataPath, "utf8"));
const timestamp = new Date().toISOString();

const next = {};
const alerts = [];

/**
 * Sequential on purpose: 24 requests is nothing, and hammering two dozen
 * community wikis in parallel is rude.
 */
for (const entry of sources) {
	let fresh = null;

	try {
		fresh = await fetchSiteinfo(entry.url);
	} catch (error) {
		console.warn(`${entry.name}: ${error.message}`);
	}

	const record = mergeRecord(previous[entry.url], fresh, timestamp);
	next[entry.url] = record;

	const reason = shouldAlert(entry, record);

	if (reason) {
		alerts.push(reason);
	}
}

writeFileSync(metadataPath, `${JSON.stringify(next, null, "\t")}\n`);
writeFileSync(alertsPath, `${JSON.stringify(alerts, null, "\t")}\n`);

console.log(`Checked ${sources.length} wikis, ${alerts.length} need attention.`);
