const { CommandPaletteItem, CommandPaletteActionResult, CommandPaletteProvider } = require( '../types.js' );
const { defineStore } = require( 'pinia' );
const createRecentItems = require( '../services/recentItems.js' );
const { getNavigationAction } = require( '../utils/providerActions.js' );

const RecentItemsProvider = require( '../providers/RecentItemsProvider.js' );
const CommandProvider = require( '../providers/CommandProvider.js' );
const SearchProvider = require( '../providers/SearchProvider.js' );
const RelatedArticlesProvider = require( '../providers/RelatedArticlesProvider.js' );
const QueryActionProvider = require( '../providers/QueryActionProvider.js' );

const recentItemsService = createRecentItems();

// Delay for showing the pending indicator, in milliseconds.
const SHOW_PENDING_DELAY_MS = 300;

// List of providers in order of priority
/** @type {Array<CommandPaletteProvider>} */
const providers = [
	RecentItemsProvider,
	CommandProvider,
	SearchProvider,
	RelatedArticlesProvider,
	QueryActionProvider
];

/**
 * Map of provider IDs to providers for faster lookups.
 *
 * @type {Map<string, CommandPaletteProvider>}
 */
const providerMap = new Map( providers.map( ( p ) => [ p.id, p ] ) );

/**
 * Pinia store for managing command palette search state using providers.
 *
 * @property {string} searchQuery - The current search input value.
 * @property {Array<Object>} searchResults - Results from search/command providers.
 * @property {Array<Object>} recentItems - Recently visited/searched items for presults.
 * @property {Array<Object>} relatedArticles - Related articles for presults.
 * @property {Array<Object>} displayedItems - Unified list of items to display.
 * @property {boolean} isPending - Whether a result fetch is currently in progress.
 * @property {boolean} showPending - Whether to show the pending indicator (allows for delay).
 * @property {?number} debounceTimeout - Timeout ID for debouncing search requests.
 * @property {?number} pendingDelayTimeout - Timeout ID for delaying the pending indicator.
 * @property {boolean} needsInputFocus - Flag to signal App.vue to focus input
 */
exports.useSearchStore = defineStore( 'search', {
	state: () => ( {
		/** @type {string} */
		searchQuery: '',
		/** @type {Array<Object>} */
		displayedItems: [],
		/** @type {boolean} */
		isPending: false,
		/** @type {boolean} */
		showPending: false,
		/** @type {?number} */
		debounceTimeout: null,
		/** @type {?number} */
		pendingDelayTimeout: null, // Separate timeout for loading animation delay
		/** @type {boolean} */
		needsInputFocus: false
	} ),

	getters: {
		/**
		 * Check if there are any displayed items.
		 *
		 * @param {Object} state The store state.
		 * @return {boolean}
		 */
		hasDisplayedItems: ( state ) => state.displayedItems.length > 0,

		/**
		 * Gets the full search URL for the current query.
		 *
		 * @param {Object} state The store state.
		 * @return {string}
		 */
		searchUrl: ( state ) => mw.util.getUrl( 'Special:Search', {
			search: state.searchQuery
		} )
	},

	actions: {
		/**
		 * Resets state related to ongoing or previous search/presults operations.
		 *
		 * @private
		 */
		resetOperationState() {
			clearTimeout( this.debounceTimeout );
			this.debounceTimeout = null;
			clearTimeout( this.pendingDelayTimeout );
			this.pendingDelayTimeout = null;
			this.isPending = false;
			this.showPending = false;
		},

		/**
		 * Resets the pending indicators and timeouts.
		 * Should be called when an async operation concludes or is cancelled.
		 *
		 * @private
		 */
		resetPendingState() {
			this.isPending = false;
			this.showPending = false;
			clearTimeout( this.pendingDelayTimeout );
			this.pendingDelayTimeout = null;
		},

		/**
		 * Sets the results, combining items from a content provider with items from QueryActionProvider.
		 *
		 * @param {Array<CommandPaletteItem>} contentItems Items from the main content provider (e.g., SearchProvider, CommandProvider).
		 * @private
		 */
		setProviderResults( contentItems ) {
			const currentContentItems = Array.isArray( contentItems ) ? contentItems : [];
			const queryActionItems = QueryActionProvider.getResults( this.searchQuery );

			this.displayedItems = [ ...currentContentItems, ...queryActionItems ];
		},

		/**
		 * Handles fetching results from a synchronous provider.
		 *
		 * @param {CommandPaletteProvider} provider The synchronous provider.
		 * @param {string} query The search query.
		 * @private
		 */
		handleSyncProvider( provider, query ) {
			try {
				const results = typeof provider.getResults === 'function' ? provider.getResults( query ) : [];
				if ( this.searchQuery === query ) {
					this.setProviderResults( results );
				}
			} catch ( error ) {
				mw.log.error( `[skins.citizen.commandPalette] Sync Provider failed for query "${ query }":`, error );
				if ( this.searchQuery === query ) {
					this.setProviderResults( [] );
				}
			}
		},

		/**
		 * Handles fetching results from an asynchronous provider with debouncing and pending state.
		 *
		 * @param {CommandPaletteProvider} provider The asynchronous provider.
		 * @param {string} query The search query.
		 * @private
		 */
		handleAsyncProvider( provider, query ) {
			this.isPending = true;

			clearTimeout( this.pendingDelayTimeout );
			this.pendingDelayTimeout = null;
			this.pendingDelayTimeout = setTimeout( () => {
				if ( this.isPending && this.searchQuery === query ) {
					this.showPending = true;
				}
			}, SHOW_PENDING_DELAY_MS );

			clearTimeout( this.debounceTimeout );
			this.debounceTimeout = null;
			this.debounceTimeout = setTimeout( async () => {
				if ( this.searchQuery !== query ) {
					this.resetPendingState();
					return;
				}

				try {
					const results = typeof provider.getResults === 'function' ? await provider.getResults( query ) : [];
					if ( this.searchQuery === query ) {
						this.setProviderResults( results );
					}
				} catch ( error ) {
					mw.log.error( `[skins.citizen.commandPalette] Async Provider failed for query "${ query }":`, error );
					if ( this.searchQuery === query ) {
						this.setProviderResults( [] );
					}
				} finally {
					if ( this.searchQuery === query ) {
						this.resetPendingState();
					}
				}
			}, provider.debounceMs ?? 250 );
		},

		/**
		 * Update the search query and trigger the appropriate provider.
		 *
		 * @param {string} query The new search query.
		 * @return {void}
		 */
		updateQuery( query ) {
			const previousSearchQuery = this.searchQuery;
			this.searchQuery = query;

			this.resetOperationState();

			if ( !query ) {
				this.clearSearch();
				return;
			}

			const contentProvider = providers.find( ( p ) => p.id !== QueryActionProvider.id && p.canProvide( query ) );
			let initialContentItems = [];

			// Determine initial content items: stale items from the contentProvider if applicable, otherwise empty.
			if ( contentProvider && previousSearchQuery && contentProvider.keepStaleResultsOnQueryChange !== false ) {
				// Filter displayedItems to keep only those from the *current contentProvider* that is about to be re-queried.
				// This avoids keeping stale items from a different previous content provider.
				initialContentItems = this.displayedItems.filter(
					( item ) => item.source && ( item.source.startsWith( contentProvider.id + ':' ) || item.source === contentProvider.id )
				);
			}
			// If conditions above aren't met (no contentProvider, not keeping stale, or no previous query),
			// initialContentItems remains [].

			// Set the initial display. This combines initialContentItems (stale or empty)
			// with fresh items from QueryActionProvider (e.g., the full-text search link).
			this.setProviderResults( initialContentItems );

			// If a content provider was found, invoke its handler to fetch new data.
			if ( contentProvider ) {
				if ( contentProvider.isAsync ) {
					this.handleAsyncProvider( contentProvider, query );
				} else {
					this.handleSyncProvider( contentProvider, query );
				}
			} // If no contentProvider, displayedItems is already set (likely with only QueryActionProvider items).
		},

		/**
		 * Fetches and processes related articles, adding a 'source' property.
		 * Returns an empty array on failure.
		 *
		 * @return {Promise<Array<CommandPaletteItem>>} Processed related articles.
		 * @private
		 */
		async fetchRelatedArticles() {
			try {
				const articles = await RelatedArticlesProvider.getResults( '' );
				// Source is now added by the provider
				return Array.isArray( articles ) ? articles : [];
			} catch ( error ) {
				mw.log.error( '[skins.citizen.commandPalette] Failed to get related articles:', error );
				return [];
			}
		},

		/**
		 * Fetches and processes recent items, adding a 'source' property.
		 * Returns an empty array on failure.
		 *
		 * @return {Array<CommandPaletteItem>} Processed recent items.
		 * @private
		 */
		fetchRecentItems() {
			try {
				// Pass empty query for interface consistency
				const items = RecentItemsProvider.getResults( '' );
				// Source is now added by the provider
				return Array.isArray( items ) ? items : [];
			} catch ( error ) {
				mw.log.error( '[skins.citizen.commandPalette] Failed to get recent items:', error );
				return [];
			}
		},

		/**
		 * Clears the search query and populates displayedItems for presults.
		 * Fetches recent items first for immediate display, then fetches related articles.
		 * removing duplicate recent items based on URL.
		 *
		 * @return {void}
		 */
		async clearSearch() {
			this.searchQuery = '';
			this.resetOperationState();

			const fetchedRecentItems = this.fetchRecentItems();
			// For presults, QueryActionProvider won't return items if its canProvide is query-dependent.
			// So, setProviderResults will just display recent items.
			this.setProviderResults( [ ...fetchedRecentItems ] );

			const fetchedRelatedArticles = await this.fetchRelatedArticles();
			const relatedUrls = new Set( fetchedRelatedArticles.map( ( item ) => item.url ).filter( Boolean ) );
			const filteredRecentItems = fetchedRecentItems.filter( ( item ) => !item.url || !relatedUrls.has( item.url ) );

			if ( this.searchQuery === '' ) { // Only update if still in presults
				// For presults, QueryActionProvider results will be empty.
				this.setProviderResults( [ ...fetchedRelatedArticles, ...filteredRecentItems ] );
			}
		},

		/**
		 * Handles the selection of a result item.
		 * Determines the appropriate action based on the item type and returns instructions
		 * for the UI component.
		 *
		 * @param {CommandPaletteItem|null} result The selected item or null if Enter was pressed with no selection.
		 * @return {Promise<CommandPaletteActionResult>} An object describing the next UI action.
		 */
		async handleSelection( result ) {
			if ( !result ) {
				return { action: 'none' };
			}

			// Find the provider responsible for the item based on its source
			const providerId = ( /^([^:]+)(?::.*)?$/ ).exec( result.source ?? '' )?.[ 1 ] || result.source;
			const sourceProvider = providerId ? providerMap.get( providerId ) : null;

			if ( sourceProvider && typeof sourceProvider.onResultSelect === 'function' ) {
				try {
					// Delegate selection handling to the provider
					const actionResult = await sourceProvider.onResultSelect( result );
					return this.processProviderAction( actionResult, result );
				} catch ( error ) {
					mw.log.error( `[skins.citizen.commandPalette|searchStore] Error handling selection for source: ${ result.source }`, error );
					return { action: 'none' };
				}
			} else {
				return this.handleFallbackSelection( result );
			}
		},

		/**
		 * Processes the action result from a provider after a selection.
		 * Saves the item if it's a navigation action and handles query updates.
		 *
		 * @param {CommandPaletteActionResult|null} actionResult The result from the provider.
		 * @param {CommandPaletteItem} result The originally selected item.
		 * @return {CommandPaletteActionResult} The final action result for the UI.
		 */
		processProviderAction( actionResult, result ) {
			if ( !actionResult ) {
				return { action: 'none' };
			}

			// Save item on navigation, unless it's a command
			if ( actionResult.action === 'navigate' && result.type !== 'command' ) {
				recentItemsService.saveRecentItem( result );
			}

			// Handle query updates
			if ( actionResult.action === 'updateQuery' ) {
				if ( actionResult.payload !== undefined ) {
					this.updateQuery( actionResult.payload );
				}
				this.triggerFocusSearchInput();
			}

			return actionResult;
		},

		/**
		 * Handles selection when no specific provider is found.
		 * Generates a default navigation action and saves the item if applicable.
		 *
		 * @param {CommandPaletteItem} result The selected item.
		 * @return {CommandPaletteActionResult} An object describing the next UI action.
		 */
		handleFallbackSelection( result ) {
			mw.log.warn( `[skins.citizen.commandPalette|searchStore] No provider or onResultSelect found for source: ${ result.source }`, result );
			const actionResult = getNavigationAction( result );
			// Process the fallback action (e.g., to save recent item)
			return this.processProviderAction( actionResult, result );
		},

		/**
		 * Removes a recent item and refreshes the presults list.
		 *
		 * @param {string|number} itemId The ID of the item to dismiss.
		 */
		dismissRecentItem( itemId ) {
			// Find the item in the current list (it should be there if the dismiss button was visible)
			const itemToRemove = this.displayedItems.find(
				( item ) => String( item.id ) === String( itemId ) && item.source === 'recent'
			);

			if ( itemToRemove ) {
				recentItemsService.removeRecentItem( itemToRemove );
				// Refresh the presults list by calling clearSearch
				this.clearSearch();
				// Optionally trigger focus back to input after list update
				this.triggerFocusSearchInput();
			}
		},

		/**
		 * Sets the `needsInputFocus` state flag.
		 * Used by components to request that the search input be focused.
		 *
		 * @param {boolean} value Whether focus is needed.
		 * @return {void}
		 */
		setNeedsInputFocus( value ) {
			this.needsInputFocus = value;
		},

		/**
		 * Action to signal that the input focus request has been handled.
		 * Resets the `needsInputFocus` flag to false.
		 *
		 * @return {void}
		 */
		focusHandled() {
			this.needsInputFocus = false;
		},

		/**
		 * Sets the `needsInputFocus` flag to true, signaling App.vue to focus the search input.
		 * This is typically called after an action that changes the query (like selecting a command).
		 *
		 * @return {void}
		 */
		triggerFocusSearchInput() {
			this.needsInputFocus = true;
		}
	}
} );
