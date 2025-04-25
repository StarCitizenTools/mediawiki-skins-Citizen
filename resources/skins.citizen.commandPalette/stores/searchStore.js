const { CommandPaletteItem, CommandPaletteActionResult, CommandPaletteProvider } = require( '../types.js' );
const { defineStore } = require( 'pinia' );
const createRecentItems = require( '../services/recentItems.js' );
const urlGenerator = require( '../utils/urlGenerator.js' )();

const RecentItemsProvider = require( '../providers/RecentItemsProvider.js' );
const SlashCommandProvider = require( '../providers/SlashCommandProvider.js' );
const SearchProvider = require( '../providers/SearchProvider.js' );

const recentItemsService = createRecentItems();

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
		 * Update the search query and trigger the appropriate provider.
		 *
		 * @param {string} query The new search query.
		 * @return {void}
		 */
		updateQuery( query ) {
			this.searchQuery = query;

			// Clear existing timeouts
			clearTimeout( this.debounceTimeout );
			clearTimeout( this.pendingDelayTimeout );
			// Don't reset showPending here, let setResults handle it or the pendingDelayTimeout

			/** @type {CommandPaletteProvider|undefined} */
			const provider = providers.find( ( p ) => p.canProvide( query ) );

			if ( !provider ) {
				this.setResults( [], false, false );
				return;
			}

			const isAsync = !!provider.isAsync;
			const debounceMs = provider.debounceMs ?? ( isAsync ? 250 : 0 );
			const showPendingDelayMs = 300; // Keep UI delay consistent for now

			// Set pending state immediately only if the provider is async
			this.isPending = isAsync;

			// Delay showing the spinner only for async providers
			if ( isAsync ) {
				this.pendingDelayTimeout = setTimeout( () => {
					// Only show if the query hasn't changed *and* we are still marked as pending
					if ( this.isPending && this.searchQuery === query ) {
						this.showPending = true;
					}
				}, showPendingDelayMs );
			}

			// Handle sync providers immediately (or after 0ms timeout if preferred)
			if ( !isAsync ) {
				try {
					// Ensure getResults exists and call it
					const results = typeof provider.getResults === 'function' ? provider.getResults( query ) : [];
					// Race condition check: Ensure query didn't change during sync execution (unlikely but safe)
					if ( this.searchQuery === query ) {
						this.setResults( Array.isArray( results ) ? results : [], !!provider.shouldAutoSelectFirst, false );
					}
				} catch ( error ) {
					mw.log.error( `[skins.citizen.commandPalette] Sync Provider failed for query "${ query }":`, error );
					if ( this.searchQuery === query ) {
						this.setResults( [], false, false );
					}
				}
				return; // Handled synchronously
			}

			// Debounce the async provider call
			// eslint-disable-next-line es-x/no-async-functions
			this.debounceTimeout = setTimeout( async () => {
				// Abort if the query changed during the debounce/async operation
				if ( this.searchQuery !== query ) {
					return;
				}

				try {
					// Ensure getResults exists before calling
					const results = typeof provider.getResults === 'function' ? await provider.getResults( query ) : [];
					// Check query *again* after await, in case it changed while fetching
					if ( this.searchQuery === query ) {
						this.setResults( Array.isArray( results ) ? results : [], !!provider.shouldAutoSelectFirst, false );
					}
				} catch ( error ) {
					mw.log.error( `[skins.citizen.commandPalette] Async Provider failed for query "${ query }":`, error );
					// Only clear results if the query is still the same one that caused the error
					if ( this.searchQuery === query ) {
						this.setResults( [], false, false );
					}
				}
			}, debounceMs );
		},

		/**
		 * Clears the search query and shows recent items.
		 *
		 * @return {void}
		 */
		clearSearch() {
			// Setting query to empty triggers RecentItemsProvider via updateQuery
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
		 * Updates the `needsInputFocus` state flag.
		 *
		 * @param {boolean} value The new value for the flag.
		 */
		setNeedsInputFocus( value ) {
			this.needsInputFocus = value;
		},

		/**
		 * Action called externally (e.g., from useActionNavigation) to signal
		 * that the search input should be focused.
		 */
		triggerFocusSearchInput() {
			this.setNeedsInputFocus( true );
		}
	}
} );
