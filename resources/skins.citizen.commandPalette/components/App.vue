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
					@update:highlighted-item-index="updatehighlightedItemIndex"
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
					@update:highlighted-item-index="updatehighlightedItemIndex"
					@select="selectResult"
					@action="handleAction"
				></command-palette-list>
			</template>
		</div>
		<command-palette-footer
			:has-highlighted-item-with-actions="hasHighlightedItemWithActions()"
			:is-action-button-focused="isActionButtonFocused"
		></command-palette-footer>
	</div>
</template>

<script>
const { defineComponent, ref, watch, nextTick, onUnmounted } = require( 'vue' );
const createSearchService = require( '../searchService.js' );
const createSearchHistoryService = require( '../searchHistoryService.js' );
const urlGenerator = require( '../urlGenerator.js' )();
const CommandPaletteList = require( './CommandPaletteList.vue' );
const CommandPaletteEmptyState = require( './CommandPaletteEmptyState.vue' );
const CommandPalettePresults = require( './CommandPalettePresults.vue' );
const CommandPaletteFooter = require( './CommandPaletteFooter.vue' );
const CommandPaletteHeader = require( './CommandPaletteHeader.vue' );
const useKeyboardNavigation = require( '../composables/useKeyboardNavigation.js' );
const useSearch = require( '../composables/useSearch.js' );
const { cdxIconArticleNotFound } = require( '../icons.json' );

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
	props: {},
	setup() {
		// State
		const isOpen = ref( false );
		const isPending = ref( false );
		const showPending = ref( false );
		const searchQuery = ref( '' );
		const highlightedItemIndex = ref( -1 );
		const debounceTimeout = ref( null );
		const searchHeader = ref( null );
		const resultsContainer = ref( null );
		const searchService = ref( createSearchService( mw.config ) );
		const searchHistoryService = ref( createSearchHistoryService() );
		const currentItems = ref( [] );
		// Track if an action button is currently focused
		const isActionButtonFocused = ref( false );

		// Enhanced action objects - Add keyboard hint metadata to actions when building the search results
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

		// Initialize keyboard navigation
		const state = {
			currentItems,
			highlightedItemIndex,
			isActionButtonFocused,
			isPending,
			showPending,
			debounceTimeout,
			searchQuery
		};
		const refs = {
			searchHeader,
			resultsContainer
		};
		const services = {
			searchService: searchService.value,
			searchHistoryService: searchHistoryService.value,
			urlGenerator
		};

		// Initialize composables
		const {
			setupActionButtonKeyNavigation,
			maybeScrollIntoView
		} = useKeyboardNavigation( { state, refs, selectResult: null } );

		const {
			selectResult,
			handleAction,
			loadRecentItems,
			watchSearchQuery: createSearchQueryWatcher
		} = useSearch( { state, enhanceActionsWithHints, services } );

		// Update keyboard navigation with selectResult
		const keyboardNavigation = useKeyboardNavigation( {
			state,
			refs,
			selectResult
		} );

		// Selection handling
		const updatehighlightedItemIndex = ( index ) => {
			highlightedItemIndex.value = index;
		};

		// Watchers
		watch( searchQuery, createSearchQueryWatcher( nextTick ) );

		watch( highlightedItemIndex, () => {
			nextTick( () => {
				maybeScrollIntoView();
			} );
		} );

		watch( currentItems, () => {
			nextTick( () => {
				maybeScrollIntoView();
			} );
		}, { deep: true } );

		// Watch isOpen to set up event listeners when the command palette opens
		watch( isOpen, ( newValue ) => {
			if ( newValue ) {
				nextTick( () => {
					setupActionButtonKeyNavigation();
				} );
			} else {
				// Clean up event listeners when closing
				keyboardNavigation.cleanup();
			}
		} );

		// Clean up event listeners when component is unmounted
		onUnmounted( () => {
			keyboardNavigation.cleanup();
		} );

		return {
			// State
			isOpen,
			isPending,
			showPending,
			searchQuery,
			currentItems,
			highlightedItemIndex,
			searchHeader,
			resultsContainer,
			isActionButtonFocused,

			// Icons
			cdxIconArticleNotFound,

			// Methods
			onKeydown: keyboardNavigation.onKeydown,
			updatehighlightedItemIndex,
			selectResult,
			handleAction,
			loadRecentItems,
			hasHighlightedItemWithActions: keyboardNavigation.hasHighlightedItemWithActions
		};
	},
	methods: {
		/**
		 * @public
		 */
		open() {
			this.isOpen = true;
			this.loadRecentItems();
			this.$nextTick( () => {
				this.$refs.searchHeader?.focus();
			} );
		},
		close() {
			this.isOpen = false;
			this.searchQuery = '';
			this.currentItems = [];
			this.highlightedItemIndex = -1;
		}
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
