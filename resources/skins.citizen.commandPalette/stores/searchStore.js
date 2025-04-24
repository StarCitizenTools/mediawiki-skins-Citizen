const { CommandPaletteItem, CommandPaletteActionResult } = require( '../types.js' );

const { defineStore } = require( 'pinia' );
const createSearchHistory = require( '../services/searchHistory.js' );
const urlGenerator = require( '../utils/urlGenerator.js' )();

const RecentItemsProvider = require( '../providers/RecentItemsProvider.js' );
const SearchProvider = require( '../providers/SearchProvider.js' );
const SlashCommandProvider = require( '../providers/SlashCommandProvider.js' );

const searchHistoryService = createSearchHistory();

// List of providers in order of priority
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
		autoSelectFirst: false
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
			// Don't reset showPending here, let _setResults handle it or the pendingDelayTimeout

			const provider = providers.find( ( p ) => p.canProvide( query ) );

			if ( !provider ) {
				this.setResults( [], false, false );
				return;
			}

			// --- Synchronous handling for initial recent items ---
			const isInitialRecent = provider === RecentItemsProvider && query === '';
			if ( isInitialRecent ) {
				let results = [];
				try {
					// RecentItemsProvider.getResults should be synchronous
					const rawResults = provider.getResults( query );
					results = Array.isArray( rawResults ) ? rawResults : [];
				} catch ( error ) {
					mw.log.error( '[skins.citizen.commandPalette] RecentItemsProvider failed on initial load:', error );
					// results is already []
				}
				this.setResults( results, false, false ); // Update state via helper
				// Important: Return early to bypass the async/debounce logic below
				return;
			}
			// --- End synchronous handling ---

			const isAsync = provider === SearchProvider;
			const debounceMs = isAsync ? 250 : 0; // 0 debounce for sync providers (uses setTimeout(0))
			const showPendingDelayMs = 300;

			// Set pending state only for truly async providers
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

			// Debounce the provider call (or run after 0ms for sync providers)
			// eslint-disable-next-line es-x/no-async-functions
			this.debounceTimeout = setTimeout( async () => {
				// Abort if the query changed during the debounce/async operation
				if ( this.searchQuery !== query ) {
					return;
				}

				try {
					const results = await provider.getResults( query );
					// Check query *again* after await, in case it changed while fetching
					if ( this.searchQuery === query ) {
						const autoSelect = provider === SlashCommandProvider;
						this.setResults( Array.isArray( results ) ? results : [], autoSelect, false );
					}
				} catch ( error ) {
					mw.log.error( `[skins.citizen.commandPalette] Provider failed for query "${ query }":`, error );
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
					this.saveToHistory( null ); // Save the query itself
					return { action: 'navigate', payload: this.searchUrl };
				}
				// If no result and it's a slash command or empty, do nothing specific on Enter
				return { action: 'none' };
			}

			switch ( result.type ) {
				case 'command':
				case 'namespace':
					// Let the store handle the query update, return instruction to focus input
					this.updateQuery( result.value );
					return { action: 'updateQuery' };
				default:
					// Save to history and return instruction to navigate
					this.saveToHistory( result );
					return { action: 'navigate', payload: result.url };
			}
		},

		/**
		 * Saves a selected result or search query to history.
		 * Relies on items having a standard structure (e.g., url, label, description).
		 *
		 * @param {CommandPaletteItem|null} item The item to save, or null to save the current search query.
		 * @return {void}
		 */
		saveToHistory( item ) {
			// Don't save intermediate command selections (like '/ns' itself or namespaces)
			const excludedTypes = [ 'command', 'namespace' ];
			if ( item?.type && excludedTypes.includes( item.type ) ) {
				return;
			}

			if ( item?.url ) {
				// Save a specific item (recent, search result)
				searchHistoryService.saveRecentItem( {
					label: item.label,
					description: item.description,
					url: item.url,
					type: item.type || 'recent' // Default to recent if type is missing
				} );
			} else if ( !item && this.searchQuery.trim() !== '' && !this.searchQuery.startsWith( '/' ) ) {
				// Save the search query itself if it was a direct search (not a slash command)
				// and item is null (indicating direct search submission)
				searchHistoryService.saveSearchQuery( this.searchQuery, this.searchUrl );
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
		}
	}
} );
