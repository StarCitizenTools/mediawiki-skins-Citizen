import { describe, expect, it } from "vitest";
import { shotKey } from "../scripts/showcase/capture.js";

describe("shotKey", () => {
	it("derives a 16-hex-character key from the bytes", () => {
		const key = shotKey(Buffer.from("some image bytes"));

		expect(key).toMatch(/^shots\/[0-9a-f]{16}\.webp$/);
	});

	it("is stable for identical bytes", () => {
		const bytes = Buffer.from("same");

		expect(shotKey(bytes)).toBe(shotKey(Buffer.from("same")));
	});

	it("changes when a single byte changes", () => {
		expect(shotKey(Buffer.from("abc"))).not.toBe(shotKey(Buffer.from("abd")));
	});
});
