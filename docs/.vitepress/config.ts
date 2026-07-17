import { defineConfig } from "vitepress";
import { routex } from "@itznotabug/routex";
import { groupIconMdPlugin, groupIconVitePlugin } from "vitepress-plugin-group-icons";
import llmstxt, { copyOrDownloadAsMarkdownButtons } from "vitepress-plugin-llms";
import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";

const BASE_URL = process.env.BASE_URL ?? "/";

function withBase(path: string): string {
	return `${BASE_URL}${path}`.replaceAll(/\/+/g, "/");
}

const redirects = {
	"/customization/features": withBase("/reference/classes"),
	"/features/": withBase("/reference/classes"),
	"/customization/utility-classes": withBase("/reference/classes"),
	"/customization/hooks": withBase("/reference/hooks"),
	"/customization/command-palette": withBase("/features/command-palette"),
	"/customization/performance-mode": withBase("/features/performance-mode"),
	"/customization/preferences": withBase("/features/preferences"),
	"/customization/share": withBase("/features/share"),
};

export default defineConfig({
	base: BASE_URL,
	title: "Citizen",
	description: "Documentation for Citizen Skin",
	srcDir: "src",
	cleanUrls: true,
	lastUpdated: true,
	sitemap: {
		hostname: "https://starcitizentools.github.io/mediawiki-skins-Citizen/",
	},
	themeConfig: {
		docsVersion: process.env.DOCS_VERSION ?? "main",
		logo: "/img/layout.svg",
		outline: [2, 3],
		nav: [
			{
				text: "Guide",
				link: "/guide/introduction",
			},
			{
				text: "Resources",
				items: [
					{
						text: "Releases",
						link: "https://github.com/StarCitizenTools/mediawiki-skins-Citizen/releases",
						target: "_blank",
					},
					{
						text: "Changelogs",
						link: "/changelogs/",
						activeMatch: "/changelogs/",
					},
				],
			},
			{
				component: "VersionSwitcher",
			},
		],

		sidebar: [
			{
				text: "Guide",
				collapsed: false,
				items: [
					{
						text: "Introduction",
						link: "/guide/introduction",
					},
					{
						text: "Installation",
						link: "/guide/installation",
					},
				],
			},
			{
				text: "Configuration",
				collapsed: false,
				items: [
					{
						text: "Skin",
						link: "/config/",
					},
					{
						text: "Extensions and gadgets",
						link: "/config/extensions",
					},
				],
			},
			{
				text: "Features",
				collapsed: false,
				items: [
					{
						text: "Command palette",
						link: "/features/command-palette",
					},
					{
						text: "Overflow handling",
						link: "/features/overflow",
					},
					{
						text: "Performance mode",
						link: "/features/performance-mode",
					},
					{
						text: "Preferences",
						link: "/features/preferences",
					},
					{
						text: "Share",
						link: "/features/share",
					},
				],
			},
			{
				text: "Customization",
				collapsed: false,
				items: [
					{
						text: "Theming",
						link: "/customization/theming",
					},
					{
						text: "Recipes",
						link: "/customization/recipes",
					},
				],
			},
			{
				text: "Reference",
				collapsed: false,
				items: [
					{
						text: "Classes",
						link: "/reference/classes",
					},
					{
						text: "Hooks",
						link: "/reference/hooks",
					},
				],
			},
			{
				text: "Community",
				collapsed: false,
				items: [
					{
						text: "Showcase",
						link: "/community/showcase",
					},
				],
			},
			{
				text: "Project",
				items: [
					{
						text: "Changelogs",
						link: "/changelogs/",
					},
					{
						text: "Migrating to Citizen 4",
						link: "/guide/migrating-to-citizen-4",
					},
					{
						text: "Contribute",
						link: "/contribute/",
					},
					{
						text: "Preview channel",
						link: "/contribute/preview-channel",
					},
				],
			},
		],

		socialLinks: [
			{
				icon: "github",
				link: "https://github.com/StarCitizenTools/mediawiki-skins-Citizen",
				ariaLabel: "GitHub repository",
			},
			{
				icon: "discord",
				link: "https://discord.gg/XcKwqyD4sc",
				ariaLabel: "Discord server",
			},
			{
				icon: {
					// From codex-icons
					svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><!----><g><g xmlns:xlink="http://www.w3.org/1999/xlink" transform="translate(10 10)"><g id="cdx-icon-logo-MediaWiki-b"><path id="cdx-icon-logo-MediaWiki-a" d="M0 10c-2.9-3.3-.8-5.9 0-5.9S2.9 6.7 0 10"></path><use xlink:href="#cdx-icon-logo-MediaWiki-a" transform="rotate(15)"></use><use xlink:href="#cdx-icon-logo-MediaWiki-a" transform="rotate(30)"></use><use xlink:href="#cdx-icon-logo-MediaWiki-a" transform="rotate(45)"></use><use xlink:href="#cdx-icon-logo-MediaWiki-a" transform="rotate(60)"></use><use xlink:href="#cdx-icon-logo-MediaWiki-a" transform="rotate(75)"></use></g><use xlink:href="#cdx-icon-logo-MediaWiki-b" transform="rotate(90)"></use><use xlink:href="#cdx-icon-logo-MediaWiki-b" transform="rotate(180)"></use><use xlink:href="#cdx-icon-logo-MediaWiki-b" transform="rotate(270)"></use></g></g></svg>',
				},
				link: "https://www.mediawiki.org/wiki/Skin:Citizen",
				ariaLabel: "MediaWiki skin page",
			},
		],

		search:
			process.env.ALGOLIA_APP_ID &&
			process.env.ALGOLIA_API_KEY &&
			process.env.ALGOLIA_INDEX_NAME
				? {
						provider: "algolia",
						options: {
							appId: process.env.ALGOLIA_APP_ID,
							apiKey: process.env.ALGOLIA_API_KEY,
							indexName: process.env.ALGOLIA_INDEX_NAME,
						},
					}
				: { provider: "local" },

		editLink: {
			pattern:
				"https://github.com/StarCitizenTools/mediawiki-skins-Citizen/edit/main/docs/src/:path",
			text: "Help us improve this page",
		},
	},
	markdown: {
		config: (md) => {
			md.use(groupIconMdPlugin);
			md.use(tabsMarkdownPlugin);
			md.use(copyOrDownloadAsMarkdownButtons);
		},
	},
	vite: {
		plugins: [
			groupIconVitePlugin(),
			llmstxt(),
			routex({
				rules: redirects,
				options: { addCanonical: true, ignoreDeadLinks: true },
			}),
		],
	},
});
