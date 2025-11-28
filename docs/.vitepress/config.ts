import { defineConfig } from 'vitepress';
import pkg from '../../package.json';

export default defineConfig( {
	base: '/mediawiki-skins-Citizen/',
	title: 'Citizen',
	description: 'Documentation for Citizen Skin',
	srcDir: 'src',
	cleanUrls: true,
	lastUpdated: true,
	themeConfig: {
		logo: '/img/layout.svg',
		nav: [
			{
				text: 'Guide',
				link: '/guide/introduction',
			},
			{
				text: pkg.version,
				items: [
					{
						text: 'Releases',
						link: 'https://github.com/StarCitizenTools/mediawiki-skins-Citizen/releases',
						target: '_blank',
					},
					{
						text: 'Changelogs',
						link: '/changelogs/',
						activeMatch: '/changelogs/',
					},
				],
			},
		],

		sidebar: [
			{
				text: 'Guide',
				collapsed: false,
				items: [
					{
						text: 'Introduction 🚧',
						link: '/guide/introduction',
					},
					{
						text: 'Installation 🚧',
						link: '/guide/installation',
					},
				],
			},
			{
				text: 'Configuration',
				collapsed: false,
				items: [
					{
						text: 'Site config',
						link: '/config/',
					},
					{
						text: 'Extensions 🚧',
						link: '/config/extensions',
					},
				],
			},
			{
				text: 'Customization',
				collapsed: false,
				items: [
					{
						text: 'Theming 🚧',
						link: '/customization/theming',
					},
					{
						text: 'Command palette 🚧',
						link: '/customization/command-palette',
					},
					{
						text: 'Utility classes',
						link: '/customization/utility-classes',
					},
					{
						text: 'Wiki templates 🚧',
						link: '/customization/wiki-templates',
					},
				],
			},
			{
				text: 'Community',
				collapsed: false,
				items: [
					{
						text: 'Showcase',
						link: '/community/showcase',
					},
					{
						text: 'Tips and tricks 🚧',
						link: '/community/tips',
					},
				],
			},
			{
				text: 'Project',
				items: [
					{
						text: 'Changelogs',
						link: '/changelogs/',
					},
					{
						text: 'Contribute',
						link: '/contribute/',
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

		editLink: {
			pattern: 'https://github.com/StarCitizenTools/mediawiki-skins-Citizen/edit/main/docs/src/:path',
			text: 'Help us improve this page',
		},
	},
} );
