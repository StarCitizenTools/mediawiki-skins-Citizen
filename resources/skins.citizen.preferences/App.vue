<template>
	<template
		v-for="pref in preferences"
		:key="pref.featureName"
	>
		<cdx-toggle-switch
			v-if="pref.type === 'switch'"
			v-show="visibilities[ pref.featureName ]"
			:id="'skin-client-prefs-' + pref.featureName"
			:model-value="values[ pref.featureName ] === '1'"
			:align-switch="true"
			class="citizen-pref-group"
			@update:model-value="setValue( pref.featureName, $event ? '1' : '0' )"
		>
			{{ pref.heading }}
			<template
				v-if="pref.description"
				#description
			>
				{{ pref.description }}
			</template>
		</cdx-toggle-switch>
		<cdx-field
			v-else
			v-show="visibilities[ pref.featureName ]"
			:id="'skin-client-prefs-' + pref.featureName"
			:is-fieldset="true"
			class="citizen-pref-group"
		>
			<template #label>
				{{ pref.heading }}
			</template>
			<template
				v-if="pref.description"
				#description
			>
				{{ pref.description }}
			</template>
			<cdx-select
				v-if="pref.type === 'select'"
				:menu-items="pref.menuItems"
				:selected="values[ pref.featureName ]"
				@update:selected="setValue( pref.featureName, $event )"
			></cdx-select>
			<radio-group
				v-else
				:model-value="values[ pref.featureName ]"
				:options="pref.options"
				:feature-name="pref.featureName"
				:columns="pref.columns"
				@update:model-value="setValue( pref.featureName, $event )"
			></radio-group>
		</cdx-field>
	</template>
</template>

<script>
const { defineComponent, reactive, ref } = require( 'vue' );
const { CdxField, CdxSelect, CdxToggleSwitch } = mw.loader.require( 'skins.citizen.preferences.codex' );
const RadioGroup = require( './RadioGroup.vue' );
const useVisibility = require( './useVisibility.js' );
const clientPreferenceConfig = require( './clientPreferences.json' );
const clientPrefs = require( './clientPrefs.polyfill.js' )();
const serverConfig = require( './config.json' );

/**
 * Preference display configuration.
 * Maps feature names to their UI-specific settings.
 */
const PREF_CONFIG = {
	'skin-theme': { columns: 3, type: 'radio', visibilityCondition: 'always' },
	'citizen-feature-custom-font-size': { type: 'select', visibilityCondition: 'always' },
	'citizen-feature-custom-width': { type: 'select', visibilityCondition: 'always' },
	'citizen-feature-pure-black': { columns: 2, type: 'switch', visibilityCondition: 'dark-theme' },
	'citizen-feature-autohide-navigation': { columns: 2, type: 'switch', visibilityCondition: 'tablet-viewport' },
	'citizen-feature-performance-mode': { columns: 2, type: 'switch', visibilityCondition: 'always' }
};

/**
 * Maps PHP config values ('auto', 'light', 'dark') to the clientpref class
 * values ('os', 'day', 'night') used in the skin-theme-clientpref-* classes.
 */
const THEME_CONFIG_MAP = { auto: 'os', light: 'day', dark: 'night' };

/**
 * Wrapper for mw.message to translate skin-theme- keys to citizen-theme- keys.
 *
 * @param {string} messageKey
 * @return {string}
 */
function getMessage( messageKey ) {
	if ( messageKey.startsWith( 'skin-theme-' ) ) {
		messageKey = messageKey.replace( 'skin-theme-', 'citizen-theme-' );
	}
	return mw.message( messageKey ).text();
}

/**
 * Read computed theme colors for a given theme value.
 * Swaps the theme class on <html>, reads computed styles, then restores.
 * Synchronous — no visual flash occurs.
 *
 * @param {string} value - 'os', 'day', or 'night'
 * @return {{ surface: string, text: string }}
 */
function getThemePreviewColors( value ) {
	const root = document.documentElement;
	const themeClassPattern = /^skin-theme-clientpref-/;

	const existing = Array.from( root.classList ).filter(
		( cls ) => themeClassPattern.test( cls )
	);
	existing.forEach( ( cls ) => root.classList.remove( cls ) );
	root.classList.add( `skin-theme-clientpref-${ value }` );

	const styles = getComputedStyle( root );
	const surface = styles.getPropertyValue( '--color-surface-0' );
	const text = styles.getPropertyValue( '--color-base' );

	root.classList.remove( `skin-theme-clientpref-${ value }` );
	existing.forEach( ( cls ) => root.classList.add( cls ) );

	return { surface, text };
}

/**
 * Get active client preferences from the HTML element's class list.
 *
 * @return {string[]}
 */
function getActivePreferences() {
	return Array.from( document.documentElement.classList )
		.filter( ( cls ) => cls.includes( '-clientpref-' ) )
		.map( ( cls ) => cls.split( '-clientpref-' )[ 0 ] );
}

/**
 * Get the description for a preference, if it exists.
 *
 * @param {string} featureName
 * @return {string}
 */
function getDescription( featureName ) {
	const key = featureName === 'skin-theme' ?
		'citizen-theme-description' :
		featureName + '-description';
	// Key is dynamically constructed; all possible keys are registered in skin.json messages.
	const msg = mw.message( key ); // eslint-disable-line mediawiki/msg-doc
	return msg.exists() ? msg.text() : '';
}

// @vue/component
module.exports = exports = defineComponent( {
	name: 'App',
	components: {
		CdxField,
		CdxSelect,
		CdxToggleSwitch,
		RadioGroup
	},
	setup() {
		const activePrefs = getActivePreferences();
		const values = reactive( {} );
		const visibilities = reactive( {} );

		// Map config value (auto/light/dark) to clientpref value (os/day/night).
		const rawDefault = serverConfig.wgCitizenThemeDefault || 'auto';
		const themeValue = ref( THEME_CONFIG_MAP[ rawDefault ] || rawDefault );

		const preferences = Object.keys( clientPreferenceConfig )
			.filter( ( key ) => activePrefs.includes( key ) )
			.map( ( featureName ) => {
				const config = clientPreferenceConfig[ featureName ];
				const uiConfig = PREF_CONFIG[ featureName ] || {};
				const currentValue = clientPrefs.get( featureName );

				values[ featureName ] = typeof currentValue === 'string' ? currentValue : config.options[ 0 ];

				const condition = uiConfig.visibilityCondition || 'always';
				const { isVisible } = useVisibility( condition, themeValue );
				visibilities[ featureName ] = isVisible;

				const options = config.options.map( ( value ) => {
					const option = {
						value,
						label: getMessage( `${ featureName }-${ value }-label` )
					};

					if ( featureName === 'skin-theme' ) {
						option.previewColors = getThemePreviewColors( value );
					}

					return option;
				} );

				const pref = {
					featureName,
					heading: getMessage( `${ featureName }-name` ),
					description: getDescription( featureName ),
					type: uiConfig.type || 'radio',
					columns: uiConfig.columns || 2,
					options
				};

				if ( pref.type === 'select' ) {
					pref.menuItems = options;
				}

				return pref;
			} );

		// Now that values are populated, set the actual theme value.
		if ( values[ 'skin-theme' ] ) {
			themeValue.value = values[ 'skin-theme' ];
		}

		function setValue( featureName, value ) {
			clientPrefs.set( featureName, value );
			values[ featureName ] = value;

			if ( featureName === 'skin-theme' ) {
				themeValue.value = value;
			}

			window.dispatchEvent( new Event( 'resize' ) );
		}

		return {
			preferences,
			values,
			visibilities,
			setValue
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.citizen-pref {
	display: flex;
	flex-direction: column;
	gap: var( --space-sm );
	min-width: 20rem;
	padding-block: var( --space-md );
}

.citizen-pref-group {
	display: flex;
	padding-inline: var( --space-md );
	margin-block: 0;

	.cdx-label {
		padding-bottom: var( --space-xs );
	}

	.cdx-label__label__text {
		font-size: var( --font-size-small );
		font-weight: var( --font-weight-semi-bold );
		color: var( --color-emphasized );
	}

	.cdx-label__description {
		font-size: var( --font-size-small );
	}

	.cdx-field__control {
		width: 100%;
	}
}
</style>
