/**
 * Deletes R2 objects that left the shots manifest.
 *
 * wrangler exposes no list subcommand for R2 objects, so the delete set comes
 * from a manifest diff rather than a bucket listing. It runs post-merge because
 * while a capture PR is open both the old images (served by main) and the new
 * ones (served by the preview) must stay live.
 *
 * wrangler is invoked off PATH, where the installed CLI is one pinned version,
 * so this cannot resolve a different one while holding a token that can
 * permanently delete published objects.
 */
import { execFileSync } from "node:child_process";
import { supersededKeys } from "./lib.js";

const R2_BUCKET = process.env.R2_BUCKET ?? "mwcitizen-media";
const MANIFEST = "docs/data/showcase-shots.json";

/**
 * The manifest at a ref, or null when it cannot be read.
 *
 * Unreadable means opposite things on the two sides of the diff, so this
 * reports the fact and leaves the meaning to the caller: nothing to collect
 * when diffing from a ref, a hard stop when diffing to one.
 *
 * @param {string} ref
 * @returns {string|null}
 */
function manifestAt(ref) {
	try {
		return execFileSync("git", ["show", `${ref}:${MANIFEST}`], { encoding: "utf8" });
	} catch {
		return null;
	}
}

/**
 * The commit to diff the manifest from.
 *
 * HEAD~1 assumes one manifest commit since the last collection, which is what a
 * squash-merged refresh leaves. `GC_BEFORE_SHA` is for when that does not hold —
 * two refreshes merged before anyone ran this, say, where HEAD~1 would see only
 * the later one's deletions and leak the earlier one's objects.
 */
const beforeRef = process.env.GC_BEFORE_SHA || "HEAD~1";

/**
 * A ref that cannot be read — a mistyped override, a force-pushed-away commit,
 * the first run of all — means there is no predecessor to have dropped
 * anything, so nothing is deleted. The error direction on this side is always a
 * leaked object, never a deleted one still in use.
 */
const before = manifestAt(beforeRef) ?? "{}";

/**
 * The same failure at HEAD means the opposite, and is why it is fatal rather
 * than a fallback: an empty manifest here reads as "every object was dropped",
 * which would delete the entire bucket with no listing to rebuild it from.
 */
const after = manifestAt("HEAD");

if (after === null) {
	throw new Error(`Cannot read ${MANIFEST} at HEAD; refusing to delete anything.`);
}

const dropped = supersededKeys(before, after);

for (const key of dropped) {
	console.log(`Deleting ${key}`);
	execFileSync("wrangler", ["r2", "object", "delete", `${R2_BUCKET}/${key}`, "--remote"], {
		stdio: "inherit",
	});
}

console.log(`Deleted ${dropped.length} superseded object(s).`);
