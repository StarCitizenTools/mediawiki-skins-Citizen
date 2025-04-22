<template>
	<div
		v-if="isOpen"
		class="citizen-command-palette-backdrop"
		@click="close"></div>
	<div v-if="isOpen" class="citizen-command-palette">
		<command-palette-header
			ref="searchHeader"
			v-model="searchQuery"
			:is-pending="isPending"
			:show-pending="showPending"
			@keydown="onKeydown"
			@close="close"
		></command-palette-header>
		<div
			ref="resultsContainer"
			class="citizen-command-palette__results"
		>
			<template v-if="!searchQuery">
				<command-palette-presults
					:recent-items="currentItems"
					:highlighted-item-index="highlightedItemIndex"
					:search-query="searchQuery"
					@update:highlighted-item-index="updateHighlightedItemIndex"
					@select="selectResult"
					@update:recent-items="loadRecentItems"
				></command-palette-presults>
			</template>
			<template v-else-if="currentItems.length === 0 && !isPending">
				<command-palette-empty-state
					:title="$i18n( 'citizen-search-noresults-title' ).params( [ searchQuery ] ).text()"
					:description="$i18n( 'search-nonefound' ).text()"
					:icon="cdxIconArticleNotFound"
				></command-palette-empty-state>
			</template>
			<template v-else>
				<command-palette-list
					v-if="currentItems.length > 0"
					:items="currentItems"
					:highlighted-item-index="highlightedItemIndex"
					:search-query="searchQuery"
					@update:highlighted-item-index="updateHighlightedItemIndex"
					@select="selectResult"
					@action="handleAction"
				></command-palette-list>
			</template>
		</div>
		<command-palette-footer
			:has-highlighted-item-with-actions="hasHighlightedItemWithActions"
			:is-action-button-focused="isActionButtonFocused"
		></command-palette-footer>
	</div>
</template>

<script>
const { defineComponent, ref, watch, nextTick, onUnmounted, computed } = require( 'vue' );
const createSearchService = require( '../searchService.js' );
const createSearchHistoryService = require( '../searchHistoryService.js' );
const urlGenerator = require( '../urlGenerator.js' )();
const CommandPaletteList = require( './CommandPaletteList.vue' );
const CommandPaletteEmptyState = require( './CommandPaletteEmptyState.vue' );
const CommandPalettePresults = require( './CommandPalettePresults.vue' );
const CommandPaletteFooter = require( './CommandPaletteFooter.vue' );
const CommandPaletteHeader = require( './CommandPaletteHeader.vue' );
const useKeyboardNavigation = require( '../composables/navigation/useKeyboardNavigation.js' );
const useSearch = require( '../composables/search/useSearch.js' );
const { cdxIconArticleNotFound } = require( '../icons.json' );

/**
 * Enhance actions with keyboard hints
 *
 * @param {Array} actions - The actions to enhance
 * @return {Array} - Enhanced actions with keyboard hints
 */
const enhanceActionsWithHints = ( actions ) => {
	if ( !actions || !Array.isArray( actions ) ) {
		return [];
	}

	return actions.map( ( action, index ) => {
		// Clone the action to avoid modifying the original
		const enhancedAction = { ...action };

		// Add keyboard hint metadata
		enhancedAction.keyHint = {
			key: index === 0 ? '→' : '',
			label: action.label || '',
			ariaLabel: action.ariaLabel || action.label || ''
		};

		return enhancedAction;
	} );
};

// @vue/component
module.exports = exports = defineComponent( {
	name: 'App',
	compilerOptions: {
		whitespace: 'condense'
	},
	components: {
		CommandPaletteList,
		CommandPaletteEmptyState,
		CommandPalettePresults,
		CommandPaletteFooter,
		CommandPaletteHeader
	},
	setup() {
		// State refs - group related state
		const uiState = {
			isOpen: ref( false ),
			isPending: ref( false ),
			showPending: ref( false )
		};

		const searchState = {
			query: ref( '' ),
			currentItems: ref( [] ),
			highlightedItemIndex: ref( -1 ),
			focusState: ref( 'none' )
		};

		// DOM refs
		const domRefs = {
			searchHeader: ref( null ),
			resultsContainer: ref( null )
		};

		// Service initialization
		const services = {
			searchService: createSearchService( mw.config ),
			searchHistoryService: createSearchHistoryService(),
			urlGenerator
		};

		// Combine state for composables
		const state = {
			currentItems: searchState.currentItems,
			highlightedItemIndex: searchState.highlightedItemIndex,
			focusState: searchState.focusState,
			isPending: uiState.isPending,
			showPending: uiState.showPending,
			searchQuery: searchState.query
		};

		// Initialize composables
		const {
			selectResult,
			handleAction,
			loadRecentItems,
			watchSearchQuery: createSearchQueryWatcher
		} = useSearch( { state, enhanceActionsWithHints, services } );

		// Initialize keyboard navigation with the real selectResult
		const keyboardNavigation = useKeyboardNavigation( {
			state,
			refs: domRefs,
			selectResult,
			close: () => {
				uiState.isOpen.value = false;
			}
		} );

		// Computed properties
		const hasHighlightedItemWithActions = computed( () => keyboardNavigation.hasHighlightedItemWithActions() );

		// Backward compatibility computed property
		const isActionButtonFocused = computed( () => state.focusState.value === keyboardNavigation.FOCUS_STATES.ACTION );

		// Methods
		const updateHighlightedItemIndex = ( index ) => {
			searchState.highlightedItemIndex.value = index;
		};

		// Watchers
		watch( searchState.query, createSearchQueryWatcher( nextTick ) );

		// Watch for highlighted index changes to scroll as needed
		watch( searchState.highlightedItemIndex, () => {
			nextTick( () => {
				keyboardNavigation.maybeScrollIntoView();
			} );
		} );

		// Watch for changes to results to update scroll
		watch( searchState.currentItems, () => {
			nextTick( () => {
				keyboardNavigation.maybeScrollIntoView();
			} );
		}, { deep: true } );

		// Set up and clean up keyboard navigation when component opens/closes
		watch( uiState.isOpen, ( newValue ) => {
			if ( newValue ) {
				nextTick( () => {
					keyboardNavigation.setup();
				} );
			} else {
				keyboardNavigation.cleanup();
			}
		} );

		// Clean up event listeners when component is unmounted
		onUnmounted( () => {
			keyboardNavigation.cleanup();
		} );

		const open = () => {
			uiState.isOpen.value = true;
			loadRecentItems();
			nextTick( () => {
				domRefs.searchHeader.value?.focus();
			} );
		};

		const close = () => {
			uiState.isOpen.value = false;
			searchState.query.value = '';
			searchState.currentItems.value = [];
			searchState.highlightedItemIndex.value = -1;
		};

		return {
			// UI State
			isOpen: uiState.isOpen,
			isPending: uiState.isPending,
			showPending: uiState.showPending,

			// Search state
			searchQuery: searchState.query,
			currentItems: searchState.currentItems,
			highlightedItemIndex: searchState.highlightedItemIndex,

			// DOM Refs
			searchHeader: domRefs.searchHeader,
			resultsContainer: domRefs.resultsContainer,

			// Icons
			cdxIconArticleNotFound,

			// Methods
			onKeydown: keyboardNavigation.onKeydown,
			updateHighlightedItemIndex,
			selectResult,
			handleAction,
			loadRecentItems,
			hasHighlightedItemWithActions,
			isActionButtonFocused,
			/** @public */
			open,
			close
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.citizen-command-palette {
	--citizen-command-palette-side-padding: var( --space-md );
	position: fixed;
	top: var( --space-xs );
	right: var( --space-xs );
	left: var( --space-xs );
	max-width: @size-5600;
	margin-inline: auto;
	overflow: hidden;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-xx-small );
	background-color: var( --color-surface-1 );
	border: var( --border-base );
	border-radius: var( --border-radius-medium );
	box-shadow: var( --box-shadow-drop-xx-large );

	@media ( min-width: @max-width-breakpoint-tablet ) {
		top: 3rem;
	}

	&-overlay {
		position: absolute;
		top: 0;
		left: 0;
	}

	&-backdrop {
		position: fixed;
		inset: 0;
		background-color: var( --background-color-backdrop-light );
	}

	&__results {
		max-height: calc( 100vh - 16rem );
		overflow-y: auto;
		border-top: var( --border-subtle );
	}

	&__no-results {
		padding: var( --space-md ) var( --citizen-command-palette-side-padding );
		text-align: center;
	}
}
</style>
