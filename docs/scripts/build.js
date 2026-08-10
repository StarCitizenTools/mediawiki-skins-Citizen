/**
 * Runs `vitepress build` and fails when a page threw during server-side
 * rendering. VitePress logs those errors but still exits 0, so without this
 * wrapper a broken docs site deploys behind a green CI run.
 */

import { spawn } from "node:child_process";
import { findSsrErrors } from "./ssr-errors.js";

const child = spawn("vitepress", ["build", ...process.argv.slice(2)], {
	shell: process.platform === "win32",
	stdio: ["inherit", "pipe", "pipe"],
});

let log = "";

/**
 * Forwards a stream to the terminal unchanged while buffering it for analysis.
 *
 * @param {import("node:stream").Readable} source
 * @param {NodeJS.WriteStream} target
 */
function tee(source, target) {
	source.setEncoding("utf8");
	source.on("data", (chunk) => {
		log += chunk;
		target.write(chunk);
	});
}

tee(child.stdout, process.stdout);
tee(child.stderr, process.stderr);

child.on("error", (error) => {
	console.error(`Failed to start vitepress build: ${error.message}`);
	process.exit(1);
});

child.on("close", (code, signal) => {
	if (signal) {
		process.exit(1);
	}

	if (code !== 0) {
		process.exit(code ?? 1);
	}

	const hits = findSsrErrors(log);

	if (hits.length > 0) {
		console.error(
			`\nvitepress build reported success, but ${hits.length} line(s) show a server-side render failure.\n` +
				"The affected pages ship with missing content, so this is treated as a build failure:\n",
		);

		for (const hit of hits) {
			console.error(`  line ${hit.line}: ${hit.text.trim()}`);
		}

		process.exit(1);
	}
});
