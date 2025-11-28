import DefaultTheme from 'vitepress/theme';
import ChangelogsList from './components/ChangelogsList.vue';
import type { Theme } from 'vitepress';

export default {
	extends: DefaultTheme,
	enhanceApp( { app } ) {
		app.component( 'ChangelogsList', ChangelogsList );
	},
} satisfies Theme;
