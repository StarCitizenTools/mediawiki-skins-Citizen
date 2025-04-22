const { defineStore } = require( 'pinia' );
const createSearch = require( '../services/search.js' );
const createSearchHistory = require( '../services/searchHistory.js' );
const urlGenerator = require( '../utils/urlGenerator.js' )();

// Get a reference to the search service
// We assume mw.config is available globally here, adjust if needed
const searchService = createSearch( window.mw ? window.mw.config : {} );
const searchHistoryService = createSearchHistory();

/**
 * Pinia store for managing command palette search state.
 *
 * @property {string} searchQuery - The current search input value.
 * @property {Array<Object>} results - The array of search results.
 * @property {boolean} isPending - Whether a search request is currently in progress.
 * @property {boolean} showPending - Whether to show the pending indicator (allows for delay).
 * @property {?number} debounceTimeout - Timeout ID for debouncing search requests.
 * @property {Array<Object>} recentItems - The array of recently visited/searched items.
 */
exports.useSearchStore = defineStore( 'search', {
	// State: Use functions for state properties to ensure reactivity
	state: () => ( {
		/** @type {string} */
		searchQuery: '',
		/** @type {Array<Object>} */
		results: [],
		/** @type {boolean} */
		isPending: false,
		/** @type {boolean} */
		showPending: false,
		/** @type {?number} */
		debounceTimeout: null,
		/** @type {Array<Object>} */
		recentItems: searchHistoryService.getRecentItems() // Initialize recent items
	} ),

	// Getters: Computed properties based on state
	getters: {
		/**
		 * Check if there are any results.
		 *
		 * @param {Object} state The store state.
		 * @return {boolean}
		 */
		hasResults: ( state ) => state.results.length > 0,

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

	// Actions: Functions to modify state (can be async)
	actions: {
		/**
		 * Update the search query and trigger a debounced search.
		 *
		 * @param {string} query The new search query.
		 * @return {void}
		 */
		updateQuery( query ) {
			this.searchQuery = query;
			// Clear previous debounce timer
			if ( this.debounceTimeout ) {
				clearTimeout( this.debounceTimeout );
			}
			// Clear previous results immediately if query is empty
			if ( !query ) {
				this.results = [];
				this.isPending = false;
				this.showPending = false;
				// Show recent items when query is cleared
				this.loadRecentItems();
				return;
			}

			// Reset results and set pending state immediately
			this.isPending = true;
			this.showPending = false; // Don't show spinner immediately

			// Set a timer to show the spinner after a short delay (e.g., 300ms)
			// Only makes sense if search takes longer than the delay
			setTimeout( () => {
				if ( this.isPending ) { // Only show if still pending
					this.showPending = true;
				}
			}, 300 );

			// Debounce the actual search API call (e.g., 250ms)
			// eslint-disable-next-line es-x/no-async-functions
			this.debounceTimeout = setTimeout( async () => {
				if ( this.searchQuery === query ) { // Ensure query hasn't changed again
					try {
						// Perform the actual search using the service
						this.results = await searchService.search( query );
					} catch ( error ) {
						mw.log.error( '[skins.citizen.commandPalette] Search failed:', error );
						this.results = []; // Clear results ONLY on error
					} finally {
						this.isPending = false;
						this.showPending = false;
					}
				}
			}, 250 );
		},

		/**
		 * Clears the search query and results.
		 *
		 * @return {void}
		 */
		clearSearch() {
			this.searchQuery = '';
			this.results = [];
			this.isPending = false;
			this.showPending = false;
			if ( this.debounceTimeout ) {
				clearTimeout( this.debounceTimeout );
			}
			this.loadRecentItems(); // Show recents when cleared
		},

		/**
		 * Loads recent items from the history service.
		 *
		 * @return {void}
		 */
		loadRecentItems() {
			this.recentItems = searchHistoryService.getRecentItems();
		},

		/**
		 * Saves a selected result or search query to history.
		 *
		 * @param {Object|null} result The selected result object, or null if searching directly.
		 * @return {void}
		 */
		saveToHistory( result ) {
			if ( result && result.url ) {
				// Save the full result object if available
				searchHistoryService.saveRecentItem( result );
			} else if ( this.searchQuery.trim() !== '' ) {
				// Otherwise, save the search query itself
				searchHistoryService.saveSearchQuery( this.searchQuery, this.searchUrl );
			}
		}
	}
} );
