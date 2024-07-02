/**
 * Represents a search history object that stores search queries and provides methods to manipulate the history.
 *
 * @param {Object} config - The configuration object containing the maximum number of search results allowed.
 * @return {Object} An object with methods to get, set, add, clear, and initialize the search history.
 */
function searchHistory( config ) {
	return {
		data: [],
		limit: config.wgCitizenMaxSearchResults,
		isValidSearchHistory: function ( arr ) {
			return Array.isArray( arr ) && arr.length <= this.limit;
		},
		get: function () {
			if ( this.data.length === 0 ) {
				this.init();
			}
			return this.data;
		},
		set: function ( arr ) {
			if ( arr && this.isValidSearchHistory( arr ) ) {
				this.data = arr;
				mw.storage.set( 'skin-citizen-search-history', JSON.stringify( this.data ) );
			}
		},
		add: function ( query ) {
			if ( typeof query === 'string' ) {
				let history = [ ...this.data ];
				history.unshift( query );
				history = [ ...new Set( history ) ]; // Remove duplicates
				if ( history.length > this.limit ) {
					history.length = this.limit;
				}
				this.set( history );
			}
		},
		clear: function () {
			this.set( [] );
			mw.storage.remove( 'skin-citizen-search-history' );
		},
		init: function () {
			const storedData = mw.storage.get( 'skin-citizen-search-history' );
			if ( storedData ) {
				try {
					this.data = JSON.parse( storedData );
				} catch ( error ) {
					mw.log.error( `[Citizen] Error parsing search history. Stored data: ${ storedData }`, error );
				}
			}
		}
	};
}

/** @module searchHistory */
module.exports = searchHistory;
