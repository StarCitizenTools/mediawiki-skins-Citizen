const { CommandPaletteItem } = require( '../types.js' );

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
			if ( this.debounceTimeout ) {
				clearTimeout( this.debounceTimeout );
			}
			if ( this.pendingDelayTimeout ) {
				clearTimeout( this.pendingDelayTimeout );
			}
			this.showPending = false; // Hide pending indicator immediately

			// Find the appropriate provider
			const provider = providers.find( ( p ) => p.canProvide( query ) );

			if ( !provider ) {
				this.displayedItems = []; // No provider found, clear items
				this.autoSelectFirst = false;
				this.isPending = false;
				return;
			}

			// Determine debounce time (e.g., longer for search, shorter/none for others)
			const debounceMs = provider === SearchProvider ? 250 :
				( provider === SlashCommandProvider ? 0 : 0 ); // Adjust as needed
			const showPendingDelayMs = 300;

			// Set pending state immediately if the provider might be slow
			const isPotentiallyAsync = provider === SearchProvider; // Add other async providers here
			if ( isPotentiallyAsync ) {
				this.isPending = true;
				// Delay showing the spinner
				this.pendingDelayTimeout = setTimeout( () => {
					if ( this.isPending ) { // Only show if still pending after delay
						this.showPending = true;
					}
				}, showPendingDelayMs );
			} else {
				this.isPending = false;
			}

			// Debounce the call to the provider
			// eslint-disable-next-line es-x/no-async-functions
			this.debounceTimeout = setTimeout( async () => {
				// Check if query is still the same after debounce
				if ( this.searchQuery !== query ) {
					// Query changed during debounce, stop processing this request
					if ( !isPotentiallyAsync ) {
						this.isPending = false; // Ensure pending is false if we bail early
					}
					// Do not clear pendingDelayTimeout here, let the new updateQuery call handle it
					return;
				}

				try {
					// Get results from the chosen provider
					const results = await provider.getResults( query );
					// Check again if query changed while waiting for async results
					if ( this.searchQuery === query ) {
						// Process results: add prefix and handle undefined IDs
						const processedResults = Array.isArray( results ) ? results.map( ( item ) => {
							const newItem = { ...item }; // Avoid mutating original item

							// Only prefix IDs if the provider is NOT RecentItemsProvider
							if ( provider !== RecentItemsProvider ) {
								// Use a consistent prefix and handle null/undefined IDs
								newItem.id = item.id !== null && item.id !== undefined ?
									`citizen-command-palette-item-${ item.id }` :
									`citizen-command-palette-item-unknown-${ Date.now() }-${ Math.random().toString( 36 ).slice( 2 ) }`; // Fallback ID
							} else {
								// For RecentItemsProvider, just use the original ID
								newItem.id = item.id;
							}
							// Ensure ID is a string, regardless of source
							newItem.id = String( newItem.id );

							return newItem;
						} ) : [];

						// Determine if first item should be selected based on provider type
						// SlashCommandProvider handles all slash commands, so check only for it.
						const shouldAutoSelect = provider === SlashCommandProvider;
						this.displayedItems = processedResults; // Assign processed results
						this.autoSelectFirst = shouldAutoSelect;
					}
				} catch ( error ) {
					// Log error specific to provider if possible, otherwise generic
					mw.log.error( `[skins.citizen.commandPalette] Provider failed for query "${ query }":`, error );
					// Check again if query changed before clearing results on error
					if ( this.searchQuery === query ) {
						this.displayedItems = [];
						this.autoSelectFirst = false;
					}
				} finally {
					// Clear pending state only if the query hasn't changed again
					if ( this.searchQuery === query ) {
						this.isPending = false;
						this.showPending = false;
						if ( this.pendingDelayTimeout ) {
							clearTimeout( this.pendingDelayTimeout );
						}
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
		 * Saves a selected result or search query to history.
		 * Relies on items having a standard structure (e.g., url, label, description).
		 *
		 * @param {CommandPaletteItem} item
		 * @return {void}
		 */
		saveToHistory( item ) {
			// Don't save intermediate command selections (like '/ns' itself or namespaces)
			if ( item?.type === 'command' || item?.type === 'commandSuggestion' ) {
				return;
			}

			if ( item && item.url ) {
				searchHistoryService.saveRecentItem( item );
			} else if ( this.searchQuery.trim() !== '' && !this.searchQuery.startsWith( '/' ) ) {
				// Save the search query itself if it was a direct search (not a slash command)
				searchHistoryService.saveSearchQuery( this.searchQuery, this.searchUrl );
			}
		}
	}
} );
