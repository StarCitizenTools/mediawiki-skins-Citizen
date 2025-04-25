const { CommandPaletteItem, CommandPaletteActionResult, CommandPaletteProvider } = require( '../types.js' );
const { defineStore } = require( 'pinia' );
const createRecentItems = require( '../services/recentItems.js' );
const urlGenerator = require( '../utils/urlGenerator.js' )();

const RecentItemsProvider = require( '../providers/RecentItemsProvider.js' );
const SlashCommandProvider = require( '../providers/SlashCommandProvider.js' );
const SearchProvider = require( '../providers/SearchProvider.js' );

const recentItemsService = createRecentItems();

// Delay for showing the pending indicator, in milliseconds.
const SHOW_PENDING_DELAY_MS = 300;

// List of providers in order of priority
/** @type {Array<CommandPaletteProvider>} */
const providers = [
	RecentItemsProvider,
	SlashCommandProvider,
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
 * @property {boolean} autoSelectFirst - Whether the first item should be automatically selected.
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
		autoSelectFirst: false,
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
					this.setResults( Array.isArray( results ) ? results : [], !!provider.shouldAutoSelectFirst, false );
				}
			} catch ( error ) {
				mw.log.error( `[skins.citizen.commandPalette] Sync Provider failed for query "${ query }":`, error );
				// Ensure we clear results only if the query hasn't changed
				if ( this.searchQuery === query ) {
					this.setResults( [], false, false );
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
			this.isPending = true; // Set pending state for the duration of the async operation

			// Setup delayed pending indicator
			this.pendingDelayTimeout = setTimeout( () => {
				// Show pending indicator only if the operation is still relevant and marked as pending
				if ( this.isPending && this.searchQuery === query ) {
					this.showPending = true;
				}
			}, SHOW_PENDING_DELAY_MS );

			// Debounce the async provider call
			// eslint-disable-next-line es-x/no-async-functions
			this.debounceTimeout = setTimeout( async () => {
				// Abort if the query changed during the debounce period
				if ( this.searchQuery !== query ) {
					// The new updateQuery call will handle the state for the new query.
					return;
				}

				// No need to set isPending = true again, it was set before the timeout.

				try {
					// Ensure getResults exists before calling
					const results = typeof provider.getResults === 'function' ? await provider.getResults( query ) : [];

					// Check query *again* after await, as it might have changed
					if ( this.searchQuery === query ) {
						// Operation successful for the current query
						this.setResults( Array.isArray( results ) ? results : [], !!provider.shouldAutoSelectFirst, false );
					}
					// If query changed while awaiting, the new updateQuery call manages state.
				} catch ( error ) {
					mw.log.error( `[skins.citizen.commandPalette] Async Provider failed for query "${ query }":`, error );
					// Only clear results if this error corresponds to the current query
					if ( this.searchQuery === query ) {
						this.setResults( [], false, false );
					}
					// If query changed, the new updateQuery call manages state.
				}
				// setResults handles resetting pending flags and clearing pendingDelayTimeout
			}, provider.debounceMs ?? 250 );
		},

		/**
		 * Resets state related to ongoing or previous search operations.
		 *
		 * @private
		 */
		resetOperationState() {
			clearTimeout( this.debounceTimeout );
			clearTimeout( this.pendingDelayTimeout );
			this.isPending = false;
			this.showPending = false;
		},

		/**
		 * Update the search query and trigger the appropriate provider.
		 *
		 * @param {string} query The new search query.
		 * @return {void}
		 */
		updateQuery( query ) {
			this.searchQuery = query;

			this.resetOperationState();

			const provider = providers.find( ( p ) => p.canProvide( query ) );

			if ( !provider ) {
				this.setResults( [], false, false ); // No provider -> clear results
				return;
			}

			// Delegate to the appropriate handler
			// Use module-level constant SHOW_PENDING_DELAY_MS
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
					return { action: 'updateQuery' };
				default:
					if ( result ) {
						recentItemsService.saveRecentItem( result );
					}
					return { action: 'navigate', payload: result.url };
			}
		},

		/**
		 * Internal helper to set result state consistently.
		 *
		 * @param {Array<Object>} items The items to display.
		 * @param {boolean} autoSelect Whether to auto-select the first item.
		 * @param {boolean} isPending Whether the store should be in a pending state.
		 * @private
		 */
		setResults( items, autoSelect, isPending ) {
			this.displayedItems = items;
			this.autoSelectFirst = autoSelect;
			this.isPending = isPending;
			// Always hide spinner when setting results (or error)
			this.showPending = false;
			// If we are setting final results, any pending delay timeout is irrelevant
			clearTimeout( this.pendingDelayTimeout );
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
