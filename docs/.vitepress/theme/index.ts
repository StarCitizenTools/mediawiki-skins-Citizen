import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "virtual:group-icons.css";
import { enhanceAppWithTabs } from "vitepress-plugin-tabs/client";
import CopyOrDownloadAsMarkdownButtons from "vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue";
import CopyCode from "./components/CopyCode.vue";
import LinkGrid from "./components/LinkGrid.vue";
import LinkCard from "./components/LinkCard.vue";
import VersionSwitcher from "./components/VersionSwitcher.vue";
import "./styles.less";

export default {
	extends: DefaultTheme,
	enhanceApp({ app }) {
		enhanceAppWithTabs(app);
		app.component("CopyCode", CopyCode);
		app.component("LinkGrid", LinkGrid);
		app.component("LinkCard", LinkCard);
		app.component("VersionSwitcher", VersionSwitcher);
		app.component("CopyOrDownloadAsMarkdownButtons", CopyOrDownloadAsMarkdownButtons);
	},
} satisfies Theme;
