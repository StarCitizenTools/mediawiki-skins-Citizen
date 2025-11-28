import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import CopyCode from './components/CopyCode.vue';
import LinkGrid from './components/LinkGrid.vue';
import LinkCard from './components/LinkCard.vue';
import './styles.less';

export default {
	extends: DefaultTheme,
	enhanceApp( { app } ) {
		app.component( 'CopyCode', CopyCode );
		app.component( 'LinkGrid', LinkGrid );
		app.component( 'LinkCard', LinkCard );
	},
} satisfies Theme;
