import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import CopyCode from './components/CopyCode.vue';
import './styles.less';

export default {
	extends: DefaultTheme,
	enhanceApp( { app } ) {
		app.component( 'CopyCode', CopyCode );
	}
} satisfies Theme;
