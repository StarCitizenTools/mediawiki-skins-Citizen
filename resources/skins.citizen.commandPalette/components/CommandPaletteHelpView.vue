<template>
	<div
		v-if="!activeMode"
		class="citizen-command-palette-help citizen-command-palette__results"
	>
		<command-palette-list
			v-if="displayedItems.length > 0"
			:sections="displayedItems"
			:highlighted-item-index="highlightedItemIndex"
			:search-query="searchQuery"
			:set-item-ref="setItemRef"
			:compact="true"
			@select="( result ) => $emit( 'select', result )"
			@hover="( index ) => $emit( 'hover', index )"
		></command-palette-list>
	</div>
	<command-palette-detail-panel
		v-else
		class="citizen-command-palette-help citizen-command-palette__results"
		:detail="{ pairs: activeModePairs }"
	>
		<template #header>
			<command-palette-help-mode-summary
				:mode="activeMode"
			></command-palette-help-mode-summary>
		</template>
		<template #triggers>
			<command-palette-help-triggers
				:triggers="activeMode.triggers || []"
			></command-palette-help-triggers>
		</template>
		<template #description>
			<!-- eslint-disable vue/no-v-html -- Long description is a localised message with safe inline markup. -->
			<div
				class="citizen-command-palette-help__long-description"
				v-html="activeModeLongDescription"
			></div>
			<!-- eslint-enable vue/no-v-html -->
		</template>
	</command-palette-detail-panel>
	<command-palette-detail-panel
		v-if="!activeMode && highlightedHelpMode"
		class="citizen-command-palette-help citizen-command-palette__detail"
		:detail="{ pairs: highlightedModePairs }"
	>
		<template #header>
			<command-palette-help-mode-summary
				:mode="highlightedHelpMode"
			></command-palette-help-mode-summary>
		</template>
		<template #triggers>
			<command-palette-help-triggers
				:triggers="highlightedHelpMode.triggers || []"
			></command-palette-help-triggers>
		</template>
		<template #description>
			<!-- eslint-disable vue/no-v-html -- Long description is a localised message with safe inline markup. -->
			<div
				class="citizen-command-palette-help__long-description"
				v-html="highlightedModeLongDescription"
			></div>
			<!-- eslint-enable vue/no-v-html -->
		</template>
	</command-palette-detail-panel>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );
const CommandPaletteList = require( './CommandPaletteList.vue' );
const CommandPaletteDetailPanel = require( './CommandPaletteDetailPanel.vue' );
const CommandPaletteHelpModeSummary = require( './CommandPaletteHelpModeSummary.vue' );
const CommandPaletteHelpTriggers = require( './CommandPaletteHelpTriggers.vue' );

/**
 * Resolves the mode's long-form description i18n key to parsed HTML.
 *
 * @param {Object|null} mode
 * @return {string} Parsed HTML, or empty string if no description is declared.
 */
function getLongDescription( mode ) {
	const key = mode && mode.help && mode.help.description;
	if ( !key ) {
		return '';
	}

	return mw.message( key ).parse();
}

/**
 * Builds the DetailPanel pairs array for a given mode. Triggers come first
 * because they tell the user how to invoke the mode; the long description
 * follows for users who want to understand what the mode does.
 *
 * @param {Object|null} mode The mode being described.
 * @return {Array<{key: string, label: string}>}
 */
function buildPairs( mode ) {
	if ( !mode ) {
		return [];
	}
	const pairs = [];
	if ( Array.isArray( mode.triggers ) && mode.triggers.length > 0 ) {
		pairs.push( {
			key: 'triggers',
			label: mw
				.message( 'citizen-command-palette-help-section-triggers' )
				.text()
		} );
	}
	if ( mode.help && mode.help.description ) {
		pairs.push( {
			key: 'description',
			label: mw
				.message( 'citizen-command-palette-help-section-description' )
				.text()
		} );
	}
	return pairs;
}

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteHelpView',
	compilerOptions: {
		whitespace: 'condense'
	},
	components: {
		CommandPaletteList,
		CommandPaletteDetailPanel,
		CommandPaletteHelpModeSummary,
		CommandPaletteHelpTriggers
	},
	props: {
		activeMode: {
			type: Object,
			default: null
		},
		highlightedHelpMode: {
			type: Object,
			default: null
		},
		displayedItems: {
			type: Array,
			default: () => []
		},
		highlightedItemIndex: {
			type: Number,
			default: -1
		},
		searchQuery: {
			type: String,
			default: ''
		},
		setItemRef: {
			type: Function,
			default: null
		}
	},
	emits: [ 'select', 'hover' ],
	setup( props ) {
		const activeModePairs = computed( () => buildPairs( props.activeMode ) );
		const highlightedModePairs = computed( () => buildPairs( props.highlightedHelpMode )
		);

		const activeModeLongDescription = computed( () => getLongDescription( props.activeMode )
		);
		const highlightedModeLongDescription = computed( () => getLongDescription( props.highlightedHelpMode )
		);

		return {
			activeModePairs,
			highlightedModePairs,
			activeModeLongDescription,
			highlightedModeLongDescription
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';
@import '../../mixins.less';

.citizen-command-palette-help {
	// Typography intentionally mirrors a catalog row but stays independent
	// of CommandPaletteListItemContent's internal class names. If list-row
	// typography changes, update both deliberately.
	&__mode-summary {
		display: flex;
		gap: var( --space-sm );
		align-items: flex-start;
		padding-block-end: var( --space-md );
	}

	&__mode-thumbnail {
		flex-shrink: 0;
	}

	&__mode-text {
		flex: 1;
		min-width: 0;
	}

	&__mode-label {
		.mixin-citizen-font-styles( 'body' );
		font-weight: var( --font-weight-semi-bold );
		color: var( --color-emphasized );
	}

	&__mode-description {
		color: var( --color-subtle );
	}

	&__triggers {
		display: flex;
		flex-wrap: wrap;
		gap: var( --space-xs );
	}

	&__trigger-chip {
		padding: var( --space-xxs ) var( --space-sm );
		font-family: var( --font-family-monospace );
		font-size: var( --font-size-medium );
		color: var( --color-base );
		background-color: var( --background-color-interactive );
		border: var( --border-subtle );
		border-radius: var( --border-radius-pill );
	}

	&__long-description {
		code {
			padding: 0 var( --space-xxs );
			background-color: var( --background-color-interactive );
			border-radius: var( --border-radius-base );
		}
	}
}
</style>
