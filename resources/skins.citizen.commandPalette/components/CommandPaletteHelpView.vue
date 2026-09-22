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
		:detail="activeModeDetail"
	></command-palette-detail-panel>
	<command-palette-detail-panel
		v-if="!activeMode && highlightedModeDetail"
		class="citizen-command-palette-help citizen-command-palette__detail"
		:detail="highlightedModeDetail"
	></command-palette-detail-panel>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );
const CommandPaletteList = require( './CommandPaletteList.vue' );
const CommandPaletteDetailPanel = require( './CommandPaletteDetailPanel.vue' );
const modeHelpDetail = require( '../utils/modeHelpDetail.js' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteHelpView',
	compilerOptions: {
		whitespace: 'condense'
	},
	components: {
		CommandPaletteList,
		CommandPaletteDetailPanel
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
		const activeModeDetail = computed(
			() => props.activeMode ? modeHelpDetail( props.activeMode ) : null
		);
		const highlightedModeDetail = computed(
			() => props.highlightedHelpMode ? modeHelpDetail( props.highlightedHelpMode ) : null
		);

		return {
			activeModeDetail,
			highlightedModeDetail
		};
	}
} );
</script>
