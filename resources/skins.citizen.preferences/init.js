const Vue = require( 'vue' );
const { reactive } = Vue;
const App = require( './App.vue' );
const getDefaultConfig = require( './defaultConfig.js' );
const serverConfig = require( './config.json' );
const overrideData = require( './overrides.json' );
const {
	mergeConfigs, normalizeConfig
} = require( './configRegistry.js' );

// citizen-v4-remove — legacy $wgCitizenThemeDefault vocabulary; dies with
// the config at the 4.0 flip.
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

	// The panel's fallback theme when no clientpref class is present:
	// the on-wiki JSON default wins, then the deprecated
	// $wgCitizenThemeDefault. Belt-and-braces: skin-theme normally always
	// resolves from the class or its options, so this seed only decides
	// theme-dependent visibility in degenerate configs (e.g. skin-theme
	// with an empty options list). No charset check here, unlike the PHP side:
	// the value never reaches the DOM raw — App.vue validates it against
	// the registered options list, so an unregistered value safely falls
	// back to the first option.
	const overrides = overrideData.overrides;
	const jsonThemeDefault = overrides && overrides.preferences &&
		overrides.preferences[ 'skin-theme' ] &&
		overrides.preferences[ 'skin-theme' ].default;
	// citizen-v4-remove — the config fallback dies with
	// $wgCitizenThemeDefault at the 4.0 flip (along with THEME_CONFIG_MAP
	// above, the config.json require, and the RL callback in
	// ResourceLoaderHooks).
	const configThemeDefault = THEME_CONFIG_MAP[ serverConfig.wgCitizenThemeDefault ] ||
		serverConfig.wgCitizenThemeDefault;
	const themeDefault = ( typeof jsonThemeDefault === 'string' && jsonThemeDefault ) ||
		configThemeDefault || 'os';

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
