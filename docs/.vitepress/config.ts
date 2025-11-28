import { defineConfig } from 'vitepress';

export default defineConfig( {
	base: '/mediawiki-skins-Citizen/',
	title: 'Citizen',
	description: 'Documentation for Citizen Skin',
	srcDir: 'src',
	cleanUrls: true,
	lastUpdated: true,
	themeConfig: {
		nav: [
			{
				text: 'Docs',
				link: '/changelogs',
				activeMatch: '/changelogs/',
			},
		],

		sidebar: [
			{
				items: [
					{
						text: 'Changelogs',
						link: '/changelogs/',
					},
				],
			},
		],

		socialLinks: [
			{
				icon: 'github',
				link: 'https://github.com/StarCitizenTools/mediawiki-skins-Citizen',
				ariaLabel: 'GitHub repository',
			},
			{
				icon: 'discord',
				link: 'https://discord.gg/XcKwqyD4sc',
				ariaLabel: 'Discord server',
			},
			{
				icon: {
					// From codex-icons
					svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><!----><g><g xmlns:xlink="http://www.w3.org/1999/xlink" transform="translate(10 10)"><g id="cdx-icon-logo-MediaWiki-b"><path id="cdx-icon-logo-MediaWiki-a" d="M0 10c-2.9-3.3-.8-5.9 0-5.9S2.9 6.7 0 10"></path><use xlink:href="#cdx-icon-logo-MediaWiki-a" transform="rotate(15)"></use><use xlink:href="#cdx-icon-logo-MediaWiki-a" transform="rotate(30)"></use><use xlink:href="#cdx-icon-logo-MediaWiki-a" transform="rotate(45)"></use><use xlink:href="#cdx-icon-logo-MediaWiki-a" transform="rotate(60)"></use><use xlink:href="#cdx-icon-logo-MediaWiki-a" transform="rotate(75)"></use></g><use xlink:href="#cdx-icon-logo-MediaWiki-b" transform="rotate(90)"></use><use xlink:href="#cdx-icon-logo-MediaWiki-b" transform="rotate(180)"></use><use xlink:href="#cdx-icon-logo-MediaWiki-b" transform="rotate(270)"></use></g></g></svg>',
				},
				link: 'https://www.mediawiki.org/wiki/Skin:Citizen',
				ariaLabel: 'MediaWiki skin page',
			},
		],

		search: {
			provider: 'local',
		},
	},
} );
