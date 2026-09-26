/**
 * Shared logic for the showcase refresh scripts. Kept free of network and
 * filesystem calls so it can be unit-tested; the entry points do the I/O.
 */

/** Several runs deep, so a wiki that is merely blocked today doesn't read as dead. */
export const FAILURE_ALERT_THRESHOLD = 4;

/**
 * The key prefix every screenshot is written under.
 *
 * The bucket is the docs site's media store, so anything else it grows holds
 * a prefix of its own. Both the writer in capture.js and the delete guard
 * below read this one constant: were they to drift, the cleanup job could name
 * a key nothing in the showcase ever wrote.
 *
 * Changing the value wedges collection permanently. Every legacy `shots/…` key
 * that later leaves the manifest throws at the guard instead of being deleted,
 * and nothing can list R2 to rewrite the keys, so the old prefix would have to
 * stay accepted there until the last legacy key had gone.
 */
export const SHOT_KEY_PREFIX = "shots/";

const EDIT_URI = /<link[^>]+rel=["']EditURI["'][^>]*href=["']([^"']+)["']/i;

/**
 * Finds a wiki's api.php from its home page HTML.
 *
 * The path varies per host (/w/api.php, /api.php, /wiki/api.php), so it is
 * discovered rather than guessed wherever the home page can be read. Every
 * MediaWiki install advertises it through the RSD link. Discovery stays the
 * first choice; apiCandidates below is the bounded fallback for when it fails.
 *
 * The href is absolute on all 24 listed wikis, but the RSD link is written by
 * the install and root-relative and protocol-relative forms both occur, so it
 * is resolved against the site URL. Returning one of those unresolved would
 * hand the caller a string fetch rejects outright, skipping the fallback.
 *
 * @param {string} html
 * @param {string} siteUrl Site URL from showcase.json, the base to resolve against.
 * @returns {string|null}
 */
export function findApiUrl(html, siteUrl) {
	const match = EDIT_URI.exec(html);

	if (!match) {
		return null;
	}

	const href = match[1].replace(/\?action=rsd.*$/i, "");

	try {
		return new URL(href, siteUrl).href;
	} catch {
		return null;
	}
}

/**
 * Conventional api.php locations to try when discovery fails, in order.
 *
 * A wiki can be perfectly healthy and still refuse the home page: a Cloudflare
 * managed challenge fires on the HTML document while leaving api.php open, so
 * the RSD link is unreadable even though the API answers. That shape will recur
 * as wikis are added, and the two paths below cover the overwhelming majority
 * of MediaWiki installs.
 *
 * Bounded on purpose. The caller must confirm a candidate actually returned
 * siteinfo before believing it, because a host that answers 200 for every path
 * would otherwise hand back something that is not this wiki's data at all.
 *
 * @param {string} url Site URL from showcase.json.
 * @returns {string[]}
 */
export function apiCandidates(url) {
	const { origin } = new URL(url);

	return [`${origin}/api.php`, `${origin}/w/api.php`];
}

/**
 * Reads the fields the showcase needs out of a siteinfo response.
 *
 * The default skin is the liveness signal: a wiki that migrated away still has
 * "citizen" in its HTML (Star Citizen Wiki has it in the site name), but its
 * default skin changes.
 *
 * @param {object} response
 */
export function parseSiteinfo(response) {
	const query = response.query;
	const defaultSkin = query.skins?.find((skin) => "default" in skin)?.code ?? null;

	return {
		articles: query.statistics.articles,
		lang: query.general.lang,
		generator: query.general.generator,
		defaultSkin,
	};
}

/**
 * Folds a fetch result into the stored record.
 *
 * A failed fetch never blanks what is already known — a transient outage would
 * otherwise wipe a wiki's counts out of the published page.
 *
 * @param {object|undefined} previous
 * @param {object|null} fresh Null when the fetch failed.
 * @param {string} timestamp
 */
export function mergeRecord(previous, fresh, timestamp) {
	if (fresh === null) {
		return {
			...previous,
			checkedAt: timestamp,
			consecutiveFailures: (previous?.consecutiveFailures ?? 0) + 1,
		};
	}

	return {
		...previous,
		...fresh,
		checkedAt: timestamp,
		consecutiveFailures: 0,
	};
}

/**
 * The shot keys a manifest names.
 *
 * @param {string} json
 * @returns {Set<string>}
 */
function shotKeysIn(json) {
	return new Set(
		Object.values(JSON.parse(json))
			.map((record) => record.shot)
			.filter(Boolean),
	);
}

/**
 * The shot keys that left the manifest between two commits.
 *
 * These are what the cleanup job deletes from R2. wrangler has no list
 * subcommand for R2 objects, so this diff is the only record of what the bucket
 * holds — which makes every key it returns unrecoverable once acted on.
 *
 * @param {string} before Manifest JSON at the commit being diffed from.
 * @param {string} after Manifest JSON at the commit being diffed to.
 * @returns {string[]}
 */
export function supersededKeys(before, after) {
	const previouslyHeld = shotKeysIn(before);
	const held = shotKeysIn(after);

	/**
	 * A manifest naming nothing where its predecessor named something is the one
	 * input that turns this function into "delete the whole bucket". Every way of
	 * producing it is a fault — a truncated read, a checkout at the wrong ref, a
	 * commit that removed the file — and none is a reason to delete objects that
	 * cannot be listed, let alone restored. An empty predecessor is fine: that is
	 * simply the first run.
	 */
	if (held.size === 0 && previouslyHeld.size > 0) {
		throw new Error(
			`Manifest names no screenshots where the previous one named ${previouslyHeld.size}; refusing to delete.`,
		);
	}

	const dropped = [...previouslyHeld].filter((key) => !held.has(key));

	/**
	 * Nothing but a manifest bug can put a key from another prefix here, and the
	 * bucket holds the whole docs site's media, so acting on one would delete an
	 * object this job never wrote and cannot list to recover. Refusing outright
	 * rather than skipping the odd key out: the delete set is derived from a
	 * manifest that has already proven untrustworthy, so the rest of it is not
	 * worth acting on either.
	 *
	 * A traversal segment is refused alongside, because "shots/../og/card.png"
	 * satisfies the prefix while naming something else. Nothing further about the
	 * key's shape is pinned: a guard that knew the hash format would need a
	 * migration the day that format changed, which is the wedge described on
	 * SHOT_KEY_PREFIX.
	 */
	for (const key of dropped) {
		if (!key.startsWith(SHOT_KEY_PREFIX) || key.includes("..")) {
			throw new Error(
				`Manifest names "${key}", which is outside "${SHOT_KEY_PREFIX}"; refusing to delete.`,
			);
		}
	}

	return dropped;
}

/**
 * Decides whether a wiki warrants a GitHub issue.
 *
 * @param {object} entry Source entry from showcase.json.
 * @param {object} record Merged record.
 * @returns {string|null} Reason, or null to stay quiet.
 */
export function shouldAlert(entry, record) {
	if (record.defaultSkin && record.defaultSkin !== "citizen") {
		return `${entry.name} (${entry.url}) now defaults to the "${record.defaultSkin}" skin, not Citizen.`;
	}

	/**
	 * Two entries fail forever by nature: Tolkien Gateway's WAF blocks automated
	 * requests, and Wikven is a static site with no API. Alerting on those every
	 * week would train the maintainer to ignore the alert that matters.
	 */
	if (entry.expectUnreachable) {
		return null;
	}

	if ((record.consecutiveFailures ?? 0) >= FAILURE_ALERT_THRESHOLD) {
		return `${entry.name} (${entry.url}) has failed ${record.consecutiveFailures} consecutive checks.`;
	}

	return null;
}
