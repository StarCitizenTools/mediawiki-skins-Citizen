import { describe, expect, it } from "vitest";
import {
	buildReference,
	channelRows,
	parseClientPrefDefaults,
	union,
} from "../scripts/generate-preferences-reference.js";

const MESSAGES = {
		"section-appearance": "Appearance",
		"theme-stable": "Color",
		"theme-preview": "Theme",
		"pure-black": "Pure black mode",
		"option-day": "Day",
	},
	// Grouped, because lint:fix chains consecutive top-level consts together.
	PREFS = {
		theme: {
			section: "appearance",
			type: "radio",
			labelMsg: "theme-stable",
			options: [{ value: "day", labelMsg: "option-day" }],
		},
		pureBlack: {
			section: "appearance",
			type: "switch",
			labelMsg: "pure-black",
			options: [],
		},
		unlabelledSwitch: {
			section: "appearance",
			type: "switch",
			labelMsg: "pure-black",
			options: [{ value: "0" }, { value: "1" }],
		},
	};

/** A normalized-shaped config pair; both channels are the same unless given. */
function channels(stablePrefs: object, previewPrefs: object = stablePrefs) {
	const sections = { appearance: { labelMsg: "section-appearance" } };
	return {
		stable: { sections, preferences: stablePrefs },
		preview: { sections, preferences: previewPrefs },
	};
}

describe("union", () => {
	it("keeps the first list's order and appends what only the second has", () => {
		expect(union(["a", "b"], ["b", "c"])).toEqual(["a", "b", "c"]);
	});
});

describe("channelRows", () => {
	it("collapses to one row when both channels render the same", () => {
		expect(channelRows({ label: "Color" }, { label: "Color" })).toEqual([
			{ fields: { label: "Color" }, channel: "—" },
		]);
	});

	it("splits into one row per channel when they diverge", () => {
		expect(channelRows({ label: "Color" }, { label: "Theme" })).toEqual([
			{ fields: { label: "Color" }, channel: "Stable" },
			{ fields: { label: "Theme" }, channel: "Preview" },
		]);
	});

	it("marks an entry that only one channel has", () => {
		expect(channelRows({ label: "Pure black" })[0].channel).toBe("Stable only");
		expect(channelRows(undefined, { label: "Black" })[0].channel).toBe("Preview only");
	});
});

describe("parseClientPrefDefaults", () => {
	it("reads the pairs out of the PHP constant", () => {
		const defaults = parseClientPrefDefaults(
			[
				"class SkinCitizen extends SkinMustache {",
				"\tprivate const DEFAULT_CLIENT_PREFS = [",
				"\t\t'skin-theme' => 'os',",
				"\t\t'citizen-feature-image-dimming' => '0',",
				"\t];",
				"}",
			].join("\n"),
		);

		expect(defaults).toEqual({
			"skin-theme": "os",
			"citizen-feature-image-dimming": "0",
		});
	});

	it("refuses to carry on when the constant is gone", () => {
		expect(() => parseClientPrefDefaults("class SkinCitizen {}")).toThrow(
			/DEFAULT_CLIENT_PREFS is gone/,
		);
	});

	it("refuses to carry on when the constant holds nothing it recognises", () => {
		expect(() =>
			parseClientPrefDefaults("private const DEFAULT_CLIENT_PREFS = [\n\t...SOMETHING,\n];"),
		).toThrow(/no entries/);
	});
});

describe("buildReference", () => {
	it("reports a label that differs per channel as two rows, not as agreement", () => {
		const markdown = buildReference(
			channels(
				{ "skin-theme": PREFS.theme },
				{ "skin-theme": { ...PREFS.theme, labelMsg: "theme-preview" } },
			),
			MESSAGES,
			{ "skin-theme": "os" },
		);

		expect(markdown).toContain("| `skin-theme` | Color | `radio` | `os` | `always` | Stable |");
		expect(markdown).toContain(
			"| `skin-theme` | Theme | `radio` | `os` | `always` | Preview |",
		);
		expect(markdown).not.toContain("| `skin-theme` | Color | `radio` | `os` | `always` | — |");
	});

	it("marks a preference only the stable channel has", () => {
		const markdown = buildReference(
			channels({ "citizen-feature-pure-black": PREFS.pureBlack }, {}),
			MESSAGES,
			{ "citizen-feature-pure-black": "0" },
		);

		expect(markdown).toContain(
			"| `citizen-feature-pure-black` | Pure black mode | `switch` | `0` | `always` | Stable only |",
		);
	});

	it("leaves out preferences whose options carry no label message", () => {
		const markdown = buildReference(
			channels({ "a-switch": PREFS.unlabelledSwitch, "skin-theme": PREFS.theme }),
			MESSAGES,
			{ "a-switch": "0", "skin-theme": "os" },
		);

		expect(markdown).not.toContain("| `a-switch` | `0` |");
		expect(markdown).toContain("| `skin-theme` | `day` | `option-day` |");
	});
});

describe("buildReference escaping", () => {
	it("escapes a pipe so a label cannot shift the table's columns", () => {
		const markdown = buildReference(
			channels({
				"skin-theme": { ...PREFS.theme, labelMsg: undefined, label: "Color | Theme" },
			}),
			MESSAGES,
			{ "skin-theme": "os" },
		);

		expect(markdown).toContain(String.raw`Color \| Theme`);
	});
});

describe("buildReference guards", () => {
	it("refuses to write a reference when a label message is missing", () => {
		const config = channels({ "skin-theme": { ...PREFS.theme, labelMsg: "not-in-en-json" } });

		expect(() => buildReference(config, MESSAGES, { "skin-theme": "os" })).toThrow(
			/not-in-en-json/,
		);
	});

	it("refuses to write a reference when a preference changes section", () => {
		const config = channels(
			{ "skin-theme": PREFS.theme },
			{ "skin-theme": { ...PREFS.theme, section: "behavior" } },
		);

		expect(() => buildReference(config, MESSAGES, { "skin-theme": "os" })).toThrow(
			/cannot show/,
		);
	});

	it("refuses a preference the server has no default for", () => {
		const config = channels({ "skin-theme": PREFS.theme });

		expect(() => buildReference(config, MESSAGES, {})).toThrow(/no entry in SkinCitizen/);
	});

	it("refuses a default whose preference no longer exists", () => {
		const config = channels({ "skin-theme": PREFS.theme });

		expect(() =>
			buildReference(config, MESSAGES, { "skin-theme": "os", "citizen-feature-ghost": "1" }),
		).toThrow(/not a preference/);
	});
});
