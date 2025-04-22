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
			@focus-active-item="focusItem( highlightedItemIndex )"
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
					:set-item-ref="setItemRef"
					@update:highlighted-item-index="updatehighlightedItemIndex"
					@select="selectResult"
					@update:recent-items="loadRecentItems"
					@focus-input="focusInput"
					@navigate-list="handleListNavigation"
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
					:set-item-ref="setItemRef"
					@update:highlighted-item-index="updatehighlightedItemIndex"
					@select="selectResult"
					@action="handleAction"
					@focus-input="focusInput"
					@navigate-list="handleListNavigation"
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
const { defineComponent, ref, watch, nextTick, onBeforeUpdate } = require( 'vue' );
const createSearch = require( '../services/search.js' );
const createSearchHistory = require( '../services/searchHistory.js' );
const urlGenerator = require( '../utils/urlGenerator.js' )();
const CommandPaletteList = require( './CommandPaletteList.vue' );
const CommandPaletteEmptyState = require( './CommandPaletteEmptyState.vue' );
const CommandPalettePresults = require( './CommandPalettePresults.vue' );
const CommandPaletteFooter = require( './CommandPaletteFooter.vue' );
const CommandPaletteHeader = require( './CommandPaletteHeader.vue' );
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
		const search = ref( createSearch( mw.config ) );
		const searchHistory = ref( createSearchHistory() );
		const currentItems = ref( [] );
		// Track if an action button is currently focused
		const isActionButtonFocused = ref( false );
		// Refs for list items
		const itemRefs = ref( [] );

		// Ensure refs are cleared before each update
		onBeforeUpdate( () => {
			itemRefs.value = [];
		} );

		// Function passed to CommandPaletteList to collect refs
		const setItemRef = ( el, index ) => {
			if ( el ) {
				itemRefs.value[ index ] = el;
			}
		};

		// Load recent items
		const loadRecentItems = () => {
			currentItems.value = searchHistory.value.getRecentItems();
		};

		// Navigation methods
		const highlightNext = () => {
			if ( !currentItems.value.length ) {
				return;
			}
			highlightedItemIndex.value = ( highlightedItemIndex.value + 1 ) % currentItems.value.length;
		};

		const highlightPrevious = () => {
			if ( !currentItems.value.length ) {
				return;
			}
			highlightedItemIndex.value = ( highlightedItemIndex.value - 1 + currentItems.value.length ) % currentItems.value.length;
		};

		const highlightFirst = () => {
			if ( currentItems.value.length > 0 ) {
				highlightedItemIndex.value = 0;
			} else {
				highlightedItemIndex.value = -1;
			}
		};

		const highlightLast = () => {
			if ( currentItems.value.length > 0 ) {
				highlightedItemIndex.value = currentItems.value.length - 1;
			}
		};

		// Check if there's a valid highlighted item with actions
		const hasHighlightedItemWithActions = () => {
			if ( currentItems.value.length === 0 || highlightedItemIndex.value < 0 ) {
				return false;
			}

			const highlightedItem = currentItems.value[ highlightedItemIndex.value ];
			return Boolean(
				highlightedItem &&
				highlightedItem.actions &&
				highlightedItem.actions.length > 0
			);
		};

		const getSearchUrl = () => urlGenerator.generateUrl( 'Special:Search', {
			search: searchQuery.value
		} );

		const selectResult = ( result ) => {
			if ( !result ) {
				window.location.href = getSearchUrl();
				// Save the search query as a recent item when there are no results
				if ( searchQuery.value.trim() !== '' ) {
					searchHistory.value.saveSearchQuery( searchQuery.value, getSearchUrl() );
				}
				isOpen.value = false;
				return;
			}

			// If we have a valid result with URL, navigate to it
			if ( result.url ) {
				window.location.href = result.url;
				// Save the entire result object to recent items
				searchHistory.value.saveRecentItem( result );
			} else {
				// If no URL, fall back to search and save the query
				window.location.href = getSearchUrl();
				searchHistory.value.saveSearchQuery( searchQuery.value, getSearchUrl() );
			}
			isOpen.value = false;
		};

		// Scroll to highlighted item
		const scrollToHighlightedItem = () => {
			if ( !resultsContainer.value ) {
				return;
			}

			const isResultsScrollable =
				resultsContainer.value.scrollHeight > resultsContainer.value.clientHeight;

			if ( !isResultsScrollable ) {
				return;
			}

			const highlightedElement = resultsContainer.value.querySelector( '.citizen-command-palette-list-item--highlighted' );
			highlightedElement?.scrollIntoView( {
				block: 'nearest',
				behavior: 'smooth'
			} );
		};

		// This handler now only deals with list navigation received from the header
		const onKeydown = ( event ) => {
			// Map keys to actions for list navigation
			const listNavActions = {
				ArrowUp: highlightPrevious,
				ArrowDown: highlightNext,
				Home: highlightFirst,
				End: highlightLast
			};

			if ( listNavActions[ event.key ] ) {
				event.preventDefault(); // Prevent default browser behavior (e.g., scrolling page)
				listNavActions[ event.key ]();
				nextTick( scrollToHighlightedItem ); // Ensure DOM is updated before scrolling
			} else if ( event.key === 'Enter' ) {
				event.preventDefault();
				const selectedItem = highlightedItemIndex.value >= 0 ?
					currentItems.value[ highlightedItemIndex.value ] :
					null;
				selectResult( selectedItem );
			}
			// Note: ArrowRight is no longer handled here.
			// Note: isActionButtonFocused might need re-evaluation based on new flow.
		};

		// Scroll handling
		const maybeScrollIntoView = () => {
			if ( !resultsContainer.value ) {
				return;
			}

			const isResultsScrollable =
				resultsContainer.value.scrollHeight > resultsContainer.value.clientHeight;

			if ( !isResultsScrollable ) {
				return;
			}

			const highlightedElement = resultsContainer.value.querySelector( '.citizen-command-palette-list-item--highlighted' );
			highlightedElement?.scrollIntoView( {
				block: 'nearest',
				behavior: 'smooth'
			} );
		};

		// Selection handling
		const updatehighlightedItemIndex = ( index ) => {
			highlightedItemIndex.value = index;
		};

		const handleAction = ( { actionUrl, onClick, itemId } ) => {
			// Find the item associated with this action
			const item = currentItems.value.find( ( result ) => result.id === itemId );

			// Process the action
			if ( onClick ) {
				onClick();

				// Save item to recent items when performing action with onClick
				if ( item ) {
					searchHistory.value.saveRecentItem( item );
				}
				return;
			}

			if ( actionUrl ) {
				// Save item to recent items before navigating
				if ( item ) {
					searchHistory.value.saveRecentItem( item );
				}

				window.location.href = actionUrl;
				isOpen.value = false;
			}
		};

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

		// Search method
		// eslint-disable-next-line es-x/no-async-functions
		const performSearch = async ( query ) => {
			highlightedItemIndex.value = -1;

			if ( !query ) {
				// Clear any pending state immediately
				isPending.value = false;
				showPending.value = false;
				// Load recent items synchronously
				loadRecentItems();
				return;
			}

			showPending.value = true;

			try {
				const results = await search.value.search( query, 10 );
				const items = results?.map( ( result ) => {
					if ( !result || typeof result !== 'object' ) {
						return null;
					}

					// Enhance actions with keyboard hints
					const enhancedActions = enhanceActionsWithHints( result.actions );

					return {
						type: 'page',
						id: `citizen-command-palette-result-page-${ result.id || result.title }`,
						label: result.label || result.title,
						description: result.description,
						url: result.url,
						thumbnail: result.thumbnail,
						thumbnailIcon: result.thumbnailIcon,
						metadata: result.metadata || [],
						actions: enhancedActions
					};
				} ).filter( Boolean ) || [];

				currentItems.value = items;
			} catch ( error ) {
				mw.log.error( 'Error searching:', error );
				currentItems.value = [];
			} finally {
				isPending.value = false;
				// Delay hiding the pending state to prevent flicker
				setTimeout( () => {
					showPending.value = false;
				}, 300 );
			}
		};

		// Watchers
		watch( searchQuery, ( newQuery ) => {
			if ( debounceTimeout.value ) {
				clearTimeout( debounceTimeout.value );
			}
			isPending.value = true;

			if ( !newQuery ) {
				// Clear items immediately when query is emptied
				currentItems.value = [];
				// Load recent items in next tick to prevent flash
				nextTick( () => {
					loadRecentItems();
				} );
				return;
			}

			debounceTimeout.value = setTimeout( () => {
				performSearch( newQuery );
			}, 300 );
		} );

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

		const focusInput = () => {
			searchHeader.value?.focus();
		};

		const focusItem = ( index ) => {
			if ( index >= 0 && index < itemRefs.value.length ) {
				const item = itemRefs.value[ index ];
				if ( item && typeof item.focusFirstButton === 'function' ) {
					item.focusFirstButton();
					// Update parent state if needed (e.g., isActionButtonFocused)
					// isActionButtonFocused.value = true; // Re-evaluate if needed
				} else if ( item && typeof item.focus === 'function' ) {
					// Fallback: focus the item itself if focusFirstButton isn't available/applicable
					item.focus();
				}
			}
		};

		// Handle navigation triggered from within a list item's action button
		const handleListNavigation = ( direction ) => {
			if ( direction === 'up' ) {
				highlightPrevious();
			} else if ( direction === 'down' ) {
				highlightNext();
			}
			// Return focus to the input field after navigating
			focusInput();
			// Ensure the newly highlighted item is visible
			nextTick( scrollToHighlightedItem );
		};

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
			onKeydown,
			updatehighlightedItemIndex,
			selectResult,
			handleAction,
			loadRecentItems,
			hasHighlightedItemWithActions,
			setItemRef,
			focusInput,
			focusItem,
			handleListNavigation
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
