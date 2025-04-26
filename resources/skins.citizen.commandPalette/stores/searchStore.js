const { CommandPaletteItem, CommandPaletteActionResult, CommandPaletteProvider } = require( '../types.js' );
const { defineStore } = require( 'pinia' );
const createRecentItems = require( '../services/recentItems.js' );
const urlGenerator = require( '../utils/urlGenerator.js' )();

const RecentItemsProvider = require( '../providers/RecentItemsProvider.js' );
const CommandProvider = require( '../providers/CommandProvider.js' );
const SearchProvider = require( '../providers/SearchProvider.js' );
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
	SearchProvider
];

/**
 * Pinia store for managing command palette search state using providers.
 *
 * @property {string} searchQuery - The current search input value.
 * @property {Array<Object>} displayedItems - The currently displayed list items.
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
		displayedItems: [], // Unified list for all items
		/** @type {boolean} */
		isPending: false,
		/** @type {boolean} */
		showPending: false,
		/** @type {?number} */
		debounceTimeout: null,
		/** @type {?number} */
		pendingDelayTimeout: null, // Separate timeout for loading animation delay, it should only be shown when the provider is slow
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
		 * Resets state related to ongoing or previous search operations.
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
				actions: []
			};
		},

		/**
		 * Sets the results from a provider, combining them with the fulltext search item if necessary.
		 *
		 * @param {Array<CommandPaletteItem>} providerItems Items returned by the provider.
		 * @private
		 */
		setProviderResults( providerItems ) {
			const items = Array.isArray( providerItems ) ? providerItems : [];
			let finalItems = items;

			// Check if the current query qualifies for a fulltext search link
			if ( this.searchQuery && !this.searchQuery.startsWith( '/' ) ) {
				const fulltextSearchItem = this.createFulltextSearchItem( this.searchQuery );
				// Ensure fulltext item is always at the end
				finalItems = [ ...items, fulltextSearchItem ];
			}

			this.displayedItems = finalItems;
			// Note: Pending state is reset separately by resetPendingState or resetOperationState
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
				// Ensure getResults exists and call it
				const results = typeof provider.getResults === 'function' ? provider.getResults( query ) : [];
				// Check if query changed during sync execution (minimal risk, but safe)
				if ( this.searchQuery === query ) {
					// Set results from the provider
					this.setProviderResults( results );
					// Sync operations don't have a pending state to reset here
				}
			} catch ( error ) {
				mw.log.error( `[skins.citizen.commandPalette] Sync Provider failed for query "${ query }":`, error );
				// Ensure we clear provider results only if the query hasn't changed
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
			this.isPending = true; // Set pending state immediately for the async operation

			// Clear any previous pending delay timeout
			clearTimeout( this.pendingDelayTimeout );
			this.pendingDelayTimeout = null;
			// Setup delayed pending indicator
			this.pendingDelayTimeout = setTimeout( () => {
				// Show pending indicator only if the operation is still relevant (query hasn't changed) and marked as pending
				if ( this.isPending && this.searchQuery === query ) {
					this.showPending = true;
				}
			}, SHOW_PENDING_DELAY_MS );

			// Clear previous debounce timeout and set a new one
			clearTimeout( this.debounceTimeout );
			this.debounceTimeout = null;
			// eslint-disable-next-line es-x/no-async-functions
			this.debounceTimeout = setTimeout( async () => {
				// Abort if the query changed during the debounce period
				if ( this.searchQuery !== query ) {
					// The new updateQuery call will handle the state for the new query.
					// We might need to reset pending state if the new query doesn't trigger an async op.
					// However, updateQuery calls resetOperationState which handles this.
					return;
				}

				// No need to set isPending = true again, it was set before the timeout.

				try {
					// Ensure getResults exists before calling
					const results = typeof provider.getResults === 'function' ? await provider.getResults( query ) : [];

					// Check query *again* after await, as it might have changed
					if ( this.searchQuery === query ) {
						// Operation successful for the current query
						this.setProviderResults( results );
					}
					// If query changed while awaiting, the new updateQuery call manages state.
				} catch ( error ) {
					mw.log.error( `[skins.citizen.commandPalette] Async Provider failed for query "${ query }":`, error );
					// Only clear provider results if this error corresponds to the current query
					if ( this.searchQuery === query ) {
						this.setProviderResults( [] );
					}
					// If query changed, the new updateQuery call manages state.
				} finally {
					// Regardless of success or error, if the query is still the one we started with,
					// reset the pending state now that the async operation is complete.
					if ( this.searchQuery === query ) {
						this.resetPendingState();
					}
					// If the query changed, the *new* updateQuery -> handleProvider flow
					// is responsible for managing the pending state. resetOperationState
					// called by updateQuery handles clearing any lingering state from this cancelled op.
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

			// Reset debounce/pending state from any previous operation
			this.resetOperationState();

			// Immediately update displayed items with fulltext search item if applicable
			if ( query && !query.startsWith( '/' ) ) {
				const fulltextSearchItem = this.createFulltextSearchItem( query );
				// Display just the fulltext item for now. Provider results will be added later.
				this.displayedItems = [ fulltextSearchItem ];
			} else {
				// No query or it's a command, clear items initially. Provider might add some.
				this.displayedItems = [];
			}

			const provider = providers.find( ( p ) => p.canProvide( query ) );

			if ( !provider ) {
				this.setProviderResults( [] );
				return;
			}

			if ( provider.isAsync ) {
				this.handleAsyncProvider( provider, query );
			} else {
				this.handleSyncProvider( provider, query );
			}
		},

		/**
		 * Clears the search query and shows recent items.
		 *
		 * @return {void}
		 */
		clearSearch() {
			this.updateQuery( '' );
		},

		/**
		 * Handles the selection of a result item.
		 * Determines the appropriate action based on the item type and returns instructions
		 * for the UI component.
		 *
		 * @param {CommandPaletteItem|null} result The selected item, or null if Enter was pressed with no selection.
		 * @return {CommandPaletteActionResult} An object describing the next UI action.
		 */
		handleSelection( result ) {
			if ( !result ) {
				// Handle Enter press with no selection (direct search)
				if ( this.searchQuery && !this.searchQuery.startsWith( '/' ) ) {
					recentItemsService.saveSearchQuery( this.searchQuery, this.searchUrl );
					return { action: 'navigate', payload: this.searchUrl };
				}
				return { action: 'none' };
			}

			switch ( result.type ) {
				case 'command':
				case 'namespace':
					this.updateQuery( result.value );
					this.triggerFocusSearchInput();
					return { action: 'updateQuery' };
				case 'fulltext-search':
					// Save only the query for fulltext search actions
					recentItemsService.saveSearchQuery( this.searchQuery, this.searchUrl );
					return { action: 'navigate', payload: result.url };
				default:
					// Save the whole item for other types
					if ( result ) {
						recentItemsService.saveRecentItem( result );
					}
					return { action: 'navigate', payload: result.url };
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
