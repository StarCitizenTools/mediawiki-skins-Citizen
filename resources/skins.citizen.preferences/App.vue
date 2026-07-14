<template>
	<template
		v-for="section in sections"
		:key="section.key"
	>
		<section
			v-if="section.preferences.length"
			class="citizen-preferences-section"
		>
			<div class="citizen-preferences-section__heading">
				{{ section.label }}
			</div>
			<div class="citizen-preferences-section__content">
				<template
					v-for="pref in section.preferences"
					:key="pref.featureName"
				>
					<cdx-toggle-switch
						v-if="pref.type === 'switch'"
						v-show="visibilities[ pref.featureName ]"
						:id="'skin-client-prefs-' + pref.featureName"
						:model-value="values[ pref.featureName ] === '1'"
						:align-switch="true"
						class="citizen-preferences-group"
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
						class="citizen-preferences-group"
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
						<theme-picker
							v-else-if="pref.featureName === 'skin-theme' && isV4"
							:model-value="values[ pref.featureName ]"
							:options="pref.options"
							:feature-name="pref.featureName"
							@update:model-value="setValue( pref.featureName, $event )"
						></theme-picker>
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
			</div>
		</section>
	</template>
</template>

<script>
const { defineComponent, computed, inject, reactive, ref, watch } = require( 'vue' );
const { NormalizedPreferencesConfig } = require( './types.js' );
const { CdxField, CdxSelect, CdxToggleSwitch } = mw.loader.require( 'skins.citizen.preferences.codex' );
const RadioGroup = require( './RadioGroup.vue' );
const ThemePicker = require( './ThemePicker.vue' );
const useVisibility = require( './useVisibility.js' );
const { resolveLabel } = require( './configRegistry.js' );
const clientPrefs = require( './clientPrefs.polyfill.js' )();

/**
 * Map a theme-pref value to a CSS `color-scheme` value. The preview
 * element sets this on itself, which causes the inherited light-dark()
 * tokens (--color-surface-0, --color-base) to resolve to the correct
 * side per preview — without swapping classes or reading computed
 * styles.
 *
 * citizen-v4-remove — legacy-only. The v4 ThemePicker paints the real
 * theme via its class, so this whole function dies at the 4.0 flip.
 *
 * @param {string} value - Theme value, e.g. 'os', 'day', 'night', 'black'
 * @return {string}
 */
function getThemeColorScheme( value ) {
	if ( value === 'day' ) {
		return 'light';
	}
	// Shipped themes — their scheme is known, hardcode it.
	if ( value === 'night' || value === 'black' ) {
		return 'dark';
	}
	// 'os' — and wiki-defined themes, whose real scheme lives in their
	// CSS where the swatch can't read it. Adaptive is the least-wrong
	// preview for both.
	return 'light dark';
}

/**
 * Capitalize the first letter of a theme value for a display label.
 * Theme values are already [a-zA-Z0-9]+ (clientPrefs enforces this), so the
 * result is safe to render as escaped text.
 *
 * @param {string} value
 * @return {string}
 */
function titleCase( value ) {
	return value.charAt( 0 ).toUpperCase() + value.slice( 1 );
}

// @vue/component
module.exports = exports = defineComponent( {
	name: 'App',
	components: {
		CdxField,
		CdxSelect,
		CdxToggleSwitch,
		RadioGroup,
		ThemePicker
	},
	setup() {
		/** @type {NormalizedPreferencesConfig} */
		const config = inject( 'preferencesConfig' );
		// The v4 theme picker (ThemePicker) replaces the legacy RadioGroup
		// swatch grid for skin-theme. citizen-v4-remove — at the 4.0 flip,
		// drop the `&& isV4` from ThemePicker's template condition so it
		// always claims skin-theme, and delete this const. RadioGroup.vue
		// itself stays: it still renders wiki-defined radio preferences.
		const isV4 = document.documentElement.classList.contains( 'citizen-v4' );

		// A theme applied to <html> but absent from the picker options
		// (e.g. an unregistered default) is surfaced as a real, selectable
		// card so the panel shows the true selection. Captured once so it
		// persists even after switching to another theme.
		const themeOptionValues = new Set(
			( ( config.preferences[ 'skin-theme' ] &&
				config.preferences[ 'skin-theme' ].options ) || [] )
				.map( ( opt ) => opt.value )
		);
		const activeTheme = clientPrefs.get( 'skin-theme' );
		const syntheticTheme = (
			isV4 && typeof activeTheme === 'string' &&
			!themeOptionValues.has( activeTheme )
		) ? { value: activeTheme, label: titleCase( activeTheme ) } : null;

		const values = reactive( {} );
		const visibilities = reactive( {} );

		const themeDefault = inject( 'themeDefault', 'os' );
		const themeValue = ref( themeDefault );

		/**
		 * Resolve the stored (or default) value for a preference and
		 * store it in the reactive `values` map.
		 *
		 * @param {string} featureName
		 * @param {Object} prefConfig
		 */
		function initValue( featureName, prefConfig ) {
			if ( !Array.isArray( prefConfig.options ) || prefConfig.options.length === 0 ) {
				return;
			}
			const storedValue = clientPrefs.get( featureName );
			const allowedValues = new Set(
				prefConfig.options.map( ( opt ) => opt.value )
			);
			// On Citizen 4 the theme applied to <html> is authoritative
			// even when it isn't a registered option (e.g. an unregistered
			// $wgCitizenThemeDefault): surface it as the selection instead
			// of snapping to the first theme.
			if ( featureName === 'skin-theme' && isV4 && typeof storedValue === 'string' ) {
				values[ featureName ] = storedValue;
				return;
			}
			values[ featureName ] = (
				typeof storedValue === 'string' && allowedValues.has( storedValue )
			) ? storedValue : prefConfig.options[ 0 ].value;
		}

		// Initialize all preferences that exist at mount time.
		// useVisibility composables must be called during setup() so that
		// their onMounted/onUnmounted lifecycle hooks register correctly.
		for ( const [ featureName, prefConfig ] of Object.entries( config.preferences ) ) {
			initValue( featureName, prefConfig );
			const condition = prefConfig.visibilityCondition || 'always';
			const { isVisible } = useVisibility( condition, themeValue );
			visibilities[ featureName ] = isVisible;
		}

		// Set the actual theme value now that values are populated.
		// This must happen synchronously before setup() returns so that
		// useVisibility composables (which depend on themeValue) compute
		// correct initial visibility for dark-theme conditions.
		themeValue.value = values[ 'skin-theme' ] || themeDefault;

		// Watch for dynamically-added preferences and initialize their
		// values and visibilities. Dynamic preferences are registered after
		// mount, so useVisibility lifecycle hooks (onMounted/onUnmounted)
		// would not fire. Instead, set visibility to a static computed
		// that returns true — dynamic preferences are always visible.
		watch(
			() => Object.keys( config.preferences ),
			() => {
				for ( const [ featureName, prefConfig ] of Object.entries( config.preferences ) ) {
					if ( !( featureName in values ) ) {
						initValue( featureName, prefConfig );
						visibilities[ featureName ] = computed( () => true );
					}
				}
			}
		);

		// eslint-disable-next-line arrow-body-style
		const sections = computed( () => {
			return Object.entries( config.sections )
				.map( ( [ key, sectionDef ] ) => {
					const sectionPrefs = Object.entries( config.preferences )
						.filter( ( [ , pref ] ) => pref.section === key )
						.map( ( [ featureName, prefConfig ] ) => {
							const options = prefConfig.options.map( ( opt ) => {
								const option = {
									value: opt.value,
									label: resolveLabel( opt, 'label' )
								};
								// Legacy swatch hint only — the v4 ThemePicker paints
								// the real theme, so it needs no colorScheme.
								// citizen-v4-remove
								if ( featureName === 'skin-theme' && !isV4 ) {
									option.colorScheme =
										getThemeColorScheme( opt.value );
								}
								return option;
							} );

							if (
								featureName === 'skin-theme' && syntheticTheme &&
								!options.some( ( o ) => o.value === syntheticTheme.value )
							) {
								options.push( syntheticTheme );
							}

							const pref = {
								featureName,
								heading: resolveLabel( prefConfig, 'label' ),
								description: resolveLabel(
									prefConfig, 'description'
								),
								type: prefConfig.type,
								columns: prefConfig.columns || 2,
								options
							};

							if ( pref.type === 'select' ) {
								pref.menuItems = options;
							}

							return pref;
						} );

					return {
						key,
						label: resolveLabel( sectionDef, 'label' ),
						preferences: sectionPrefs
					};
				} );
		} );

		// Fires mw.hook( 'citizen.preferences.changed' ) with ( featureName, value )
		function setValue( featureName, value ) {
			clientPrefs.set( featureName, value );
			values[ featureName ] = value;

			if ( featureName === 'skin-theme' ) {
				themeValue.value = value;
			}

			mw.hook( 'citizen.preferences.changed' ).fire( featureName, value );
			window.dispatchEvent( new Event( 'resize' ) );
		}

		return {
			sections,
			values,
			visibilities,
			setValue,
			isV4
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';
@import '../mixins.less';

.citizen-preferences {
	display: flex;
	flex-direction: column;
	gap: var( --space-sm );
	min-width: 20rem;
	padding-block: var( --space-md );
}

.citizen-preferences-section {
	margin-inline: var( --space-md );

	&__heading {
		margin-bottom: var( --space-sm );
		color: var( --color-subtle );
		.mixin-citizen-font-styles( 'overline' );
	}

	&__content {
		display: flex;
		flex-direction: column;
		row-gap: var( --space-sm );
	}

	+ .citizen-preferences-section {
		margin-top: var( --space-md );
	}
}

.citizen-preferences-group {
	display: flex;
	margin-top: 0;

	.cdx-label {
		padding-bottom: var( --space-xs );
	}

	.cdx-label__label__text {
		font-size: var( --font-size-small );
		font-weight: var( --font-weight-medium );
		color: var( --color-base );
	}

	.cdx-label__description {
		font-size: var( --font-size-small );
	}

	.cdx-field__control {
		width: 100%;
	}
}
</style>
