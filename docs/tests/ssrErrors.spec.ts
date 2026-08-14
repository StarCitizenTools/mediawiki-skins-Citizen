import { describe, expect, it } from "vitest";
import { findSsrErrors } from "../scripts/ssr-errors.js";

const SUCCESSFUL_BUILD = [
		"vitepress v2.0.0-alpha.19",
		"- building client + server bundles...",
		"✓ building client + server bundles...",
		"- rendering pages...",
		"✓ rendering pages...",
		"build complete in 7.15s.",
	].join("\n"),
	THROWN_IN_SETUP = [
		"- rendering pages...",
		"TypeError: Cannot read properties of undefined (reading 'location')",
		"    at setup (file:///docs/.vitepress/.temp/app.js:4286:34)",
		"build complete in 7.20s.",
	].join("\n"),
	UNUSUAL_HEADER = [
		"- rendering pages...",
		"something went wrong",
		"    at renderComponentVNode (/docs/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:407:15)",
	].join("\n"),
	COLOURED_HEADER = "\u001B[31mReferenceError: window is not defined\u001B[39m",
	PROSE_MENTIONING_ERRORS = [
		"llmstxt » ✓ Processed guide/error-handling.md",
		"(!) Some chunks are larger than 500 kB after minification.",
		"Set `VITE_CONFIG_NATIVE_IGNORE_WARNING=true` to suppress this warning.",
		"  - Error handling is described in the troubleshooting guide.",
	].join("\n");

describe("findSsrErrors", () => {
	it("reports nothing for a successful build", () => {
		const hits = findSsrErrors(SUCCESSFUL_BUILD);

		expect(hits).toEqual([]);
	});

	it("reports an uncaught error thrown while rendering pages", () => {
		const hits = findSsrErrors(THROWN_IN_SETUP);

		expect(hits).toHaveLength(1);
		expect(hits[0]).toEqual({
			line: 2,
			text: "TypeError: Cannot read properties of undefined (reading 'location')",
		});
	});

	it("reports a Vue SSR stack frame even when the error header is unusual", () => {
		const hits = findSsrErrors(UNUSUAL_HEADER);

		expect(hits).toHaveLength(1);
		expect(hits[0].line).toBe(3);
	});

	it("matches error headers that are wrapped in ANSI colour codes", () => {
		const hits = findSsrErrors(COLOURED_HEADER);

		expect(hits).toHaveLength(1);
		expect(hits[0].text).toBe("ReferenceError: window is not defined");
	});

	it("ignores prose that merely mentions an error", () => {
		const hits = findSsrErrors(PROSE_MENTIONING_ERRORS);

		expect(hits).toEqual([]);
	});
});
