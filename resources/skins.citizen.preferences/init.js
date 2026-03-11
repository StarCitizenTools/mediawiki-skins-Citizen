const Vue = require( 'vue' );
const { reactive } = Vue;
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
 *
 * After mounting, fires `mw.hook('citizen.preferences.register')` with a
 * `register( config )` callback that gadgets/extensions can use to add
 * sections and preferences at runtime.
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
	const config = reactive(
		normalizeConfig( mergeConfigs( defaults, overrideData.overrides ) )
	);

	/**
	 * Merge a registration object into the live reactive config.
	 *
	 * @param {Object} registration - Same shape as PreferencesConfig
	 */
	function register( registration ) {
		if (
			!registration ||
			typeof registration !== 'object' ||
			Array.isArray( registration )
		) {
			mw.log.warn( 'citizen.preferences.register: expected an object, got ' + typeof registration );
			return;
		}
		const updated = normalizeConfig(
			mergeConfigs( config, registration )
		);
		Object.assign( config.sections, updated.sections );
		Object.assign( config.preferences, updated.preferences );
	}

	const themeDefault = THEME_CONFIG_MAP[ serverConfig.wgCitizenThemeDefault ] || 'os';

	const app = Vue.createMwApp( App );
	app.provide( 'preferencesConfig', config );
	app.provide( 'themeDefault', themeDefault );
	app.mount( mountPoint );

	mw.hook( 'citizen.preferences.register' ).fire( register );
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
