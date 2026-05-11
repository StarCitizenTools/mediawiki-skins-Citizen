import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { ref } from "vue";
import VersionSwitcher from "../.vitepress/theme/components/VersionSwitcher.vue";

const route = { path: "/customization/share" };
const site = ref({ base: "/" });
const theme = ref({ docsVersion: "main" });

vi.mock("vitepress", () => ({
	useData: () => ({ theme, site }),
	useRoute: () => route,
}));

const manifest = {
	main: "/",
	stable: "v3.15",
	versions: [
		{ id: "v3.15", label: "v3.15", path: "/v3.15/" },
		{ id: "v3.14", label: "v3.14", path: "/v3.14/" },
	],
};

function manifestResponse() {
	return Response.json(manifest);
}

function stubFetch(headStatus: number) {
	const handler = vi.fn((url: string, init?: RequestInit) => {
		if (url.endsWith("/versions.json")) {
			return Promise.resolve(manifestResponse());
		}
		if (init?.method === "HEAD") {
			return Promise.resolve(new Response(undefined, { status: headStatus }));
		}
		return Promise.resolve(new Response(undefined, { status: 404 }));
	});
	vi.stubGlobal("fetch", handler);
	return handler;
}

function stubLocation() {
	Object.defineProperty(globalThis, "location", {
		configurable: true,
		writable: true,
		value: { href: "" },
	});
}

async function openSwitcher() {
	const wrapper = mount(VersionSwitcher);
	await flushPromises();
	await wrapper.find("button.VersionSwitcher__button").trigger("click");
	return wrapper;
}

beforeEach(() => {
	route.path = "/customization/share";
	site.value = { base: "/" };
	theme.value = { docsVersion: "main" };
	stubLocation();
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe("VersionSwitcher rendering", () => {
	it("renders the current version label", async () => {
		stubFetch(200);

		const wrapper = mount(VersionSwitcher);
		await flushPromises();

		expect(wrapper.find(".VersionSwitcher__text").text()).toBe("main");
	});

	it("lists main + manifest entries in the dropdown", async () => {
		stubFetch(200);

		const wrapper = await openSwitcher();
		const items = wrapper.findAll(".VersionSwitcher__item");

		expect(items).toHaveLength(3);
		expect(items[0].text()).toContain("main");
		expect(items[1].text()).toContain("v3.15");
		expect(items[1].text()).toContain("stable");
		expect(items[2].text()).toContain("v3.14");
	});

	it("shows unavailable state when manifest fetch fails", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(() => Promise.resolve(new Response(undefined, { status: 500 }))),
		);

		const wrapper = await openSwitcher();

		expect(wrapper.find(".VersionSwitcher__item--disabled").text()).toContain(
			"Other versions unavailable",
		);
	});
});

describe("VersionSwitcher navigation (root deploy)", () => {
	it("navigates path-preserving when target page exists", async () => {
		const fetchSpy = stubFetch(200);

		const wrapper = await openSwitcher();
		await wrapper.findAll(".VersionSwitcher__item")[1].trigger("click");
		await flushPromises();

		expect(fetchSpy).toHaveBeenCalledWith(
			"/v3.15/customization/share",
			expect.objectContaining({ method: "HEAD" }),
		);
		expect(globalThis.location.href).toBe("/v3.15/customization/share");
	});

	it("falls back to target root on HEAD 404", async () => {
		stubFetch(404);

		const wrapper = await openSwitcher();
		await wrapper.findAll(".VersionSwitcher__item")[1].trigger("click");
		await flushPromises();

		expect(globalThis.location.href).toBe("/v3.15/");
	});
});

const PROJECT_BASE = "/mediawiki-skins-Citizen/";

function setProjectMain() {
	site.value = { base: PROJECT_BASE };
	route.path = `${PROJECT_BASE}customization/share`;
	theme.value = { docsVersion: "main" };
}

function setProjectVersion(version: string) {
	site.value = { base: `${PROJECT_BASE}${version}/` };
	route.path = `${PROJECT_BASE}${version}/customization/share`;
	theme.value = { docsVersion: version };
}

describe("VersionSwitcher manifest fetch (project subpath deploy)", () => {
	it("fetches versions.json from the project root when on main", async () => {
		setProjectMain();
		const fetchSpy = stubFetch(200);

		mount(VersionSwitcher);
		await flushPromises();

		expect(fetchSpy).toHaveBeenCalledWith(
			"/mediawiki-skins-Citizen/versions.json",
			expect.objectContaining({ cache: "no-cache" }),
		);
	});

	it("strips the version segment from base when on a versioned build", async () => {
		setProjectVersion("v3.15");
		const fetchSpy = stubFetch(200);

		mount(VersionSwitcher);
		await flushPromises();

		expect(fetchSpy).toHaveBeenCalledWith(
			"/mediawiki-skins-Citizen/versions.json",
			expect.objectContaining({ cache: "no-cache" }),
		);
	});
});

describe("VersionSwitcher navigation (project subpath deploy)", () => {
	it("navigates path-preserving with the project prefix from main", async () => {
		setProjectMain();
		const fetchSpy = stubFetch(200);

		const wrapper = await openSwitcher();
		await wrapper.findAll(".VersionSwitcher__item")[1].trigger("click");
		await flushPromises();

		expect(fetchSpy).toHaveBeenCalledWith(
			"/mediawiki-skins-Citizen/v3.15/customization/share",
			expect.objectContaining({ method: "HEAD" }),
		);
		expect(globalThis.location.href).toBe("/mediawiki-skins-Citizen/v3.15/customization/share");
	});

	it("falls back to versioned root on HEAD 404 with project base", async () => {
		setProjectMain();
		stubFetch(404);

		const wrapper = await openSwitcher();
		await wrapper.findAll(".VersionSwitcher__item")[1].trigger("click");
		await flushPromises();

		expect(globalThis.location.href).toBe("/mediawiki-skins-Citizen/v3.15/");
	});
});
