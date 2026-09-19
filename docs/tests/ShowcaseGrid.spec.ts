import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import ShowcaseGrid from "../.vitepress/theme/components/ShowcaseGrid.vue";

vi.mock("../.vitepress/theme/data/showcase.data.ts", () => ({
	data: [
		{
			name: "Big Wiki",
			url: "https://big.example",
			// Shares "media" with Bare Wiki, so one filtered view holds two cards.
			tags: ["games", "media"],
			articles: 25_599,
			lang: "en",
			generator: "MediaWiki 1.46.0",
			shot: "shots/abc123.webp",
			shotW: 1440,
			shotH: 900,
		},
		{
			name: "Bare Wiki",
			url: "https://bare.example",
			tags: ["media"],
		},
		{
			name: "Other Wiki",
			url: "https://other.example",
			tags: ["technology"],
			shot: "shots/def456.webp",
			shotW: 1440,
			shotH: 900,
		},
	],
}));

describe("ShowcaseGrid cards", () => {
	it("renders a card per wiki", () => {
		const wrapper = mount(ShowcaseGrid);

		expect(wrapper.findAll(".showcase-card")).toHaveLength(3);
	});

	it("renders a lazy image with explicit dimensions when a shot exists", () => {
		const wrapper = mount(ShowcaseGrid),
			image = wrapper.find(".showcase-card img");

		expect(image.attributes("loading")).toBe("lazy");
		expect(image.attributes("width")).toBe("1440");
		expect(image.attributes("height")).toBe("900");
		expect(image.attributes("alt")).toBe("The Big Wiki home page");
	});

	it("falls back to a monogram tile when there is no shot", () => {
		const wrapper = mount(ShowcaseGrid),
			cards = wrapper.findAll(".showcase-card");

		expect(cards[1].find("img").exists()).toBe(false);
		expect(cards[1].find(".showcase-card__monogram").text()).toBe("BA");
	});

	it("omits the metadata strip when there is no metadata", () => {
		const wrapper = mount(ShowcaseGrid),
			cards = wrapper.findAll(".showcase-card");

		expect(cards[0].find(".showcase-card__meta").text()).toContain("25K+ articles");
		expect(cards[1].find(".showcase-card__meta").exists()).toBe(false);
	});
});

describe("ShowcaseGrid missing screenshots", () => {
	it("degrades to the monogram tile when the screenshot fails to load", async () => {
		const wrapper = mount(ShowcaseGrid),
			card = wrapper.findAll(".showcase-card")[0];

		await card.find("img").trigger("error");

		expect(card.find("img").exists()).toBe(false);
		expect(card.find(".showcase-card__monogram").text()).toBe("BI");
	});

	it("leaves every other card's screenshot alone when one fails", async () => {
		const wrapper = mount(ShowcaseGrid);

		await wrapper.findAll(".showcase-card")[0].find("img").trigger("error");
		const cards = wrapper.findAll(".showcase-card");

		expect(cards[0].find("img").exists()).toBe(false);
		expect(cards[2].find("img").attributes("alt")).toBe("The Other Wiki home page");
	});
});

const imageProperties = {
	complete: Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "complete")!,
	naturalWidth: Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "naturalWidth")!,
};

/**
 * Makes every rendered image report itself as already loaded, and the one whose
 * key matches as already broken.
 *
 * Nothing fetches an image under jsdom, so the two properties that say "this one
 * failed" have to be driven by hand — and they have to be in place before mount,
 * which is when the component reads them.
 */
function breakImage(key: string) {
	Object.defineProperty(HTMLImageElement.prototype, "complete", {
		configurable: true,
		get: () => true,
	});
	Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", {
		configurable: true,
		get(this: HTMLImageElement) {
			return this.src.includes(key) ? 0 : 1440;
		},
	});
}

describe("ShowcaseGrid screenshots that failed before hydration", () => {
	afterEach(() => {
		Object.defineProperty(HTMLImageElement.prototype, "complete", imageProperties.complete);
		Object.defineProperty(
			HTMLImageElement.prototype,
			"naturalWidth",
			imageProperties.naturalWidth,
		);
	});

	it("degrades to the monogram tile without waiting for an error event", async () => {
		breakImage("abc123");

		const wrapper = mount(ShowcaseGrid);

		await nextTick();
		const cards = wrapper.findAll(".showcase-card");

		expect(cards[0].find("img").exists()).toBe(false);
		expect(cards[0].find(".showcase-card__monogram").text()).toBe("BI");
	});

	it("leaves the images that did load alone", async () => {
		breakImage("abc123");

		const wrapper = mount(ShowcaseGrid);

		await nextTick();

		expect(wrapper.findAll(".showcase-card")[2].find("img").attributes("alt")).toBe(
			"The Other Wiki home page",
		);
	});

	it("keeps every card when nothing failed", async () => {
		breakImage("no-such-key");

		const wrapper = mount(ShowcaseGrid);

		await nextTick();
		const cards = wrapper.findAll(".showcase-card");

		expect(cards[0].find("img").exists()).toBe(true);
		expect(cards[2].find("img").exists()).toBe(true);
	});
});

describe("ShowcaseGrid filters", () => {
	it("names the filter row as a group", () => {
		const wrapper = mount(ShowcaseGrid),
			filter = wrapper.find(".showcase-filter");

		expect(filter.attributes("role")).toBe("group");
		expect(filter.attributes("aria-label")).toBe("Filter by topic");
	});

	it("marks filter buttons with aria-pressed", () => {
		const wrapper = mount(ShowcaseGrid),
			all = wrapper.find(".showcase-filter button");

		expect(all.attributes("aria-pressed")).toBe("true");
	});

	it("narrows the cards when a tag filter is chosen", async () => {
		const wrapper = mount(ShowcaseGrid),
			games = wrapper.findAll(".showcase-filter button")[1];

		await games.trigger("click");

		expect(wrapper.findAll(".showcase-card")).toHaveLength(1);
		expect(wrapper.text()).toContain("Big Wiki");
	});
});

function names(wrapper: ReturnType<typeof mount>): string[] {
	return wrapper.findAll(".showcase-card__name").map((n) => n.text());
}

describe("ShowcaseGrid sorting", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("names the sort control for assistive technology", () => {
		const wrapper = mount(ShowcaseGrid);

		expect(wrapper.find(".showcase-sort").text()).toContain("Sort");
		expect(wrapper.find(".showcase-sort select").exists()).toBe(true);
	});

	it("leaves the source order alone by default, which is what the server rendered", () => {
		const wrapper = mount(ShowcaseGrid);

		expect(names(wrapper)).toEqual(["Big Wiki", "Bare Wiki", "Other Wiki"]);
	});

	it("reorders alphabetically on A-Z", async () => {
		const wrapper = mount(ShowcaseGrid);

		await wrapper.find(".showcase-sort select").setValue("alpha");

		expect(names(wrapper)).toEqual(["Bare Wiki", "Big Wiki", "Other Wiki"]);
	});

	/*
	 * A shuffle asserted against a sorted copy of its own output passes whether or
	 * not anything shuffled, so the deal is pinned instead: with Math.random fixed
	 * at 0 the Fisher-Yates pass is fully determined.
	 */
	it("deals the cards into the shuffled order", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const wrapper = mount(ShowcaseGrid);

		await wrapper.find(".showcase-sort select").setValue("random");

		expect(names(wrapper)).toEqual(["Bare Wiki", "Other Wiki", "Big Wiki"]);
	});
});

describe("ShowcaseGrid sorting under a filter", () => {
	it("still filters by tag once shuffled", async () => {
		const wrapper = mount(ShowcaseGrid);

		await wrapper.find(".showcase-sort select").setValue("random");
		await wrapper.findAll(".showcase-filter button")[1].trigger("click");

		expect(names(wrapper)).toEqual(["Big Wiki"]);
	});

	// Source order inside the Media filter is Big then Bare, so A-Z is visible here.
	it("keeps the chosen order inside a filtered view", async () => {
		const wrapper = mount(ShowcaseGrid);

		await wrapper.find(".showcase-sort select").setValue("alpha");
		await wrapper.findAll(".showcase-filter button")[2].trigger("click");

		expect(names(wrapper)).toEqual(["Bare Wiki", "Big Wiki"]);
	});
});
