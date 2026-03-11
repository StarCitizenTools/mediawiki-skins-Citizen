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
const useVisibility = require( './useVisibility.js' );
const { resolveLabel } = require( './configRegistry.js' );
const clientPrefs = require( './clientPrefs.polyfill.js' )();

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
		/** @type {NormalizedPreferencesConfig} */
		const config = inject( 'preferencesConfig' );
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
								if ( featureName === 'skin-theme' ) {
									option.previewColors =
										getThemePreviewColors( opt.value );
								}
								return option;
							} );

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
			setValue
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
