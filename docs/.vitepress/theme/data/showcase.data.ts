import { defineLoader } from "vitepress";
import metadata from "../../../data/showcase-metadata.json";
import shots from "../../../data/showcase-shots.json";
import sources from "../../../data/showcase.json";
import { joinShowcase, type ShowcaseEntry } from "../utils/showcase.ts";

declare const data: ShowcaseEntry[];
export { data };

export default defineLoader({
	// Rebuild the page when any of the three inputs changes.
	watch: ["../../../data/showcase*.json"],
	load(): ShowcaseEntry[] {
		return joinShowcase(sources, metadata, shots);
	},
});
