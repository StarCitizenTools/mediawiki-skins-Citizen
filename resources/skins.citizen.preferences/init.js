const Vue = require( 'vue' );
const App = require( './App.vue' );
const getDefaultConfig = require( './defaultConfig.js' );
const serverConfig = require( './config.json' );
const overrideData = require( './overrides.json' );
const {
	mergeConfigs, normalizeConfig
} = require( './configRegistry.js' );

const THEME_CONFIG_MAP = { auto: 'os', light: 'day', dark: 'night' };

/**
 * Initialize the preferences panel Vue app.
 *
 * Overrides and their i18n messages are injected at module-build time
 * by the PHP ResourceLoader callback, so no runtime API call is needed.
 */
function initApp() {
	const mountPoint = document.getElementById( 'citizen-preferences-content' );
	if ( !mountPoint ) {
		return;
	}

	// Register pre-resolved message texts from admin overrides
	if ( overrideData.messages && Object.keys( overrideData.messages ).length ) {
		mw.messages.set( overrideData.messages );
	}

	const defaults = getDefaultConfig();
	const merged = normalizeConfig( mergeConfigs( defaults, overrideData.overrides ) );

	const themeDefault = THEME_CONFIG_MAP[ serverConfig.wgCitizenThemeDefault ] || 'os';

	const app = Vue.createMwApp( App );
	app.provide( 'preferencesConfig', merged );
	app.provide( 'themeDefault', themeDefault );
	app.mount( mountPoint );
}

// Export for testing.
// Note: initApp() auto-executes at import time below. In tests, the import
// happens in beforeAll when no mount point exists, so it safely no-ops.
// Tests then call initApp() explicitly with their own DOM fixtures.
// The overrideData reference is shared with the mock, so mutations in
// tests are visible to subsequent initApp() calls.
module.exports = { initApp };

// Auto-execute
initApp();
