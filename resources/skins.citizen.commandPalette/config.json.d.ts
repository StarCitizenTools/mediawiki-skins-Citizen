// The checked-in config.json is a development stub; ResourceLoader replaces it
// per request from ResourceLoaderHooks::getCitizenCommandPaletteResourceLoaderConfig.
// This declaration describes what that callback returns, not the stub.
declare const config: {
	isSemanticMediaWikiEnabled: boolean;
	wgSearchSuggestCacheExpiry: number;
};

export = config;
