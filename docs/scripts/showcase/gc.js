/**
 * Deletes R2 objects that left the shots manifest.
 *
 * wrangler exposes no list subcommand for R2 objects, so the delete set comes
 * from a manifest diff rather than a bucket listing. It runs post-merge because
 * while a capture PR is open both the old images (served by main) and the new
 * ones (served by the preview) must stay live.
 *
 * wrangler is invoked off PATH, installed at a pinned version by the workflow,
 * so this job cannot resolve a different CLI at run time while holding a token
 * that can permanently delete published objects.
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

/** The all-zero "nothing was here" SHA a branch-creating push sends as `before`. */
const NULL_SHA = "0".repeat(40);

/**
 * The commit main was at before this push.
 *
 * A push can carry several manifest commits, and HEAD~1 would only ever see the
 * last one's deletions. The push event's `before` SHA spans the whole range.
 * HEAD~1 is the fallback for a run with no push event behind it.
 */
const pushed = process.env.GC_BEFORE_SHA ?? "";
const beforeRef = pushed && pushed !== NULL_SHA ? pushed : "HEAD~1";

/**
 * A ref that cannot be read — the null SHA, a force-pushed-away commit, a clone
 * too shallow to reach it, the first run of all — means there is no predecessor
 * to have dropped anything, so nothing is deleted. The error direction on this
 * side is always a leaked object, never a deleted one still in use.
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
