import { defineConfig } from 'vitepress';

export default defineConfig( {
	base: '/mediawiki-skins-Citizen/',
	title: 'Citizen',
	description: 'Documentation for Citizen Skin',
	srcDir: 'src',
	themeConfig: {
		nav: [
			{ text: 'Home', link: '/' }
		],

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/StarCitizenTools/mediawiki-skins-Citizen' },
			{ icon: 'discord', link: 'https://discord.gg/XcKwqyD4sc' }
		]
	}
} );
