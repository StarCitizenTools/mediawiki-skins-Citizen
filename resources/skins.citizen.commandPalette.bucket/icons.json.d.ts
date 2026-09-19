// The checked-in icons.json is a development stub; ResourceLoader replaces it
// per request from CodexModule::getIcons. Keep these keys in step with the
// `callbackParam` list for icons.json in skin.json.
declare const icons: {
	cdxIconArticle: string;
	cdxIconCopy: string | { ltr: string; rtl: string };
	cdxIconDatabase: string;
	cdxIconEdit: string;
	cdxIconFunnel: string;
	cdxIconListBullet: string;
	cdxIconTable: string;
};

export = icons;
