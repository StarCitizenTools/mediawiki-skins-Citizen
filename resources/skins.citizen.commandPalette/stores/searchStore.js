const { CommandPaletteItem, CommandPaletteActionResult, CommandPaletteProvider } = require( '../types.js' );
const { defineStore } = require( 'pinia' );
const createRecentItems = require( '../services/recentItems.js' );
const urlGenerator = require( '../utils/urlGenerator.js' )();

const RecentItemsProvider = require( '../providers/RecentItemsProvider.js' );
const CommandProvider = require( '../providers/CommandProvider.js' );
const SearchProvider = require( '../providers/SearchProvider.js' );
const RelatedArticlesProvider = require( '../providers/RelatedArticlesProvider.js' );
const { cdxIconArticleSearch } = require( '../icons.json' );

const recentItemsService = createRecentItems();

// Cache the localized description for full-text search
const FULLTEXT_SEARCH_DESCRIPTION = mw.message( 'citizen-command-palette-type-fulltext-search-description' ).text();

// Delay for showing the pending indicator, in milliseconds.
const SHOW_PENDING_DELAY_MS = 300;

// List of providers in order of priority
/** @type {Array<CommandPaletteProvider>} */
const providers = [
	RecentItemsProvider,
	CommandProvider,
	SearchProvider,
	RelatedArticlesProvider
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
		searchUrl: ( state ) => urlGenerator.generateUrl( 'Special:Search', {
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
		 * Creates the command palette item for initiating a full-text search.
		 *
		 * @param {string} query The search query to use.
		 * @return {CommandPaletteItem} The full-text search item.
		 * @private
		 */
		createFulltextSearchItem( query ) {
			return {
				label: query,
				description: FULLTEXT_SEARCH_DESCRIPTION,
				type: 'fulltext-search',
				url: urlGenerator.generateUrl( 'Special:Search', { search: query } ), // Generate URL directly
				thumbnailIcon: cdxIconArticleSearch,
				actions: [],
				source: 'fulltext-search' // Add source property
			};
		},

		/**
		 * Sets the results from a provider, combining them with the fulltext search item if necessary.
		 *
		 * @param {Array<CommandPaletteItem>} providerItems Items returned by the provider.
		 * @private
		 */
		setProviderResults( providerItems ) {
			// Source is now added by providers themselves
			const items = Array.isArray( providerItems ) ? providerItems : [];
			let finalItems = items;

			// Add fulltext search item if applicable
			if (
				this.searchQuery &&
				!CommandProvider.canProvide( this.searchQuery )
			) {
				const fulltextSearchItem = this.createFulltextSearchItem( this.searchQuery );
				// Ensure fulltext item is always at the end
				finalItems = [ ...items, fulltextSearchItem ];
			}

			// Update the single displayedItems list
			this.displayedItems = finalItems;
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
					// Pass a source hint based on whether it's a command
					this.setProviderResults( results, provider === CommandProvider ? 'command' : 'search' );
				}
			} catch ( error ) {
				mw.log.error( `[skins.citizen.commandPalette] Sync Provider failed for query "${ query }":`, error );
				if ( this.searchQuery === query ) {
					this.setProviderResults( [], 'error' ); // Clear results on error
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
					// Query changed before timeout completed, reset pending state and bail.
					this.resetPendingState();
					return;
				}

				try {
					const results = typeof provider.getResults === 'function' ? await provider.getResults( query ) : [];
					if ( this.searchQuery === query ) {
						this.setProviderResults( results, provider === CommandProvider ? 'command' : 'search' );
					}
				} catch ( error ) {
					mw.log.error( `[skins.citizen.commandPalette] Async Provider failed for query "${ query }":`, error );
					if ( this.searchQuery === query ) {
						this.setProviderResults( [], 'error' ); // Clear results on error
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
			this.searchQuery = query;

			// If query is empty, switch to presults mode via clearSearch
			if ( !query ) {
				this.clearSearch();
				return;
			}

			this.resetOperationState();

			// Immediately update or add the fulltext search item if applicable
			// Use CommandProvider.canProvide to check if it's NOT a command query
			if ( query && !CommandProvider.canProvide( query ) ) {
				const newFulltextItem = this.createFulltextSearchItem( query );
				const existingFulltextIndex = this.displayedItems.findIndex( ( item ) => item.type === 'fulltext-search' );

				if ( existingFulltextIndex !== -1 ) {
					const newItems = [ ...this.displayedItems ];
					newItems.splice( existingFulltextIndex, 1, newFulltextItem );
					this.displayedItems = newItems;
				} else {
					this.displayedItems = [ ...this.displayedItems, newFulltextItem ];
				}
			} else {
				// If it's a command query or became one, remove any existing fulltext item immediately
				const existingFulltextIndex = this.displayedItems.findIndex( ( item ) => item.type === 'fulltext-search' );
				if ( existingFulltextIndex !== -1 ) {
					this.displayedItems = this.displayedItems.filter( ( _, index ) => index !== existingFulltextIndex );
				}
			}

			const provider = providers.find( ( p ) => p.canProvide( query ) );

			if ( !provider ) {
				// No specific provider, displayedItems might just contain the fulltext item
				return;
			}

			if ( provider.isAsync ) {
				this.handleAsyncProvider( provider, query );
			} else {
				this.handleSyncProvider( provider, query );
			}
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

			// Fetch recent items synchronously and display them immediately
			const fetchedRecentItems = this.fetchRecentItems();
			this.displayedItems = [ ...fetchedRecentItems ]; // Show recent items first

			// Asynchronously fetch related articles
			const fetchedRelatedArticles = await this.fetchRelatedArticles();

			// Filter recent items to remove duplicates already present in related articles (based on URL)
			const relatedUrls = new Set( fetchedRelatedArticles.map( ( item ) => item.url ).filter( Boolean ) );
			// Use the originally fetched recent items for filtering, not the potentially modified displayedItems
			const filteredRecentItems = fetchedRecentItems.filter( ( item ) => !item.url || !relatedUrls.has( item.url ) );

			// Only update when we are still in presults
			if ( this.searchQuery === '' ) {
				this.displayedItems = [ ...fetchedRelatedArticles, ...filteredRecentItems ];
			}
		},

		/**
		 * Handles the selection of a result item.
		 * Determines the appropriate action based on the item type and returns instructions
		 * for the UI component.
		 *
		 * @param {CommandPaletteItem|null} result The selected item, or null if Enter was pressed with no selection.
		 * @return {CommandPaletteActionResult} An object describing the next UI action.
		 */
		async handleSelection( result ) {
			// Case 1: Enter pressed with no selection (handle fulltext search)
			if ( !result ) {
				if ( this.searchQuery && !this.searchQuery.startsWith( '/' ) ) {
					// Save the fulltext search query as a recent item
					recentItemsService.saveSearchQuery( this.searchQuery, this.searchUrl );
					return { action: 'navigate', payload: this.searchUrl };
				}
				return { action: 'none' }; // Nothing to do if query is empty or a command stub
			}

			// Case 2: An item was selected

			// Handle the special fulltext-search item type directly
			if ( result.type === 'fulltext-search' ) {
				recentItemsService.saveSearchQuery( this.searchQuery, result.url );
				return { action: 'navigate', payload: result.url };
			}

			// Find the provider responsible for the item based on its source
			// Handle structured source 'provider:handlerId' by taking the first part
			const providerId = result.source?.match( /^([^:]+)(?::.*)?$/ )?.[ 1 ] || result.source;
			const sourceProvider = providerId ? providerMap.get( providerId ) : null;

			let actionResult = { action: 'none' }; // Default action

			if ( sourceProvider && typeof sourceProvider.onResultSelect === 'function' ) {
				try {
					// Delegate selection handling to the provider
					actionResult = await sourceProvider.onResultSelect( result );
					if ( !actionResult ) {
						return { action: 'none' };
					}

					switch ( actionResult.action ) {
						case 'navigate':
							recentItemsService.saveRecentItem( result );
							break;
						case 'updateQuery':
							if ( actionResult.payload !== undefined ) {
								this.updateQuery( actionResult.payload );
							}
							this.triggerFocusSearchInput();
							break;
					}

					// Return the provider's result
					return actionResult;
				} catch ( error ) {
					mw.log.error( `[skins.citizen.commandPalette|searchStore] Error handling selection for source: ${ result.source }`, error );
					return { action: 'none' };
				}
			} else {
				mw.log.warn( `[skins.citizen.commandPalette|searchStore] No provider or onResultSelect found for source: ${ result.source }`, result );
				// Default fallback: navigate if URL exists
				if ( result.url ) {
					// Save generic non-command items before navigating
					if ( result.source !== 'command' ) {
						recentItemsService.saveRecentItem( result );
					}
					return { action: 'navigate', payload: result.url };
				}
				return { action: 'none' };
			}
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
