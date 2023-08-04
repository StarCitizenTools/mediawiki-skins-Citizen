function searchHistory( config ) {
	return {
		data: [],
		/* TODO: Should probably create a separate config */
		limit: config.wgCitizenMaxSearchResults,
		get: function () {
			return this.data;
		},
		add: function ( query ) {
			if ( typeof query === 'string' ) {
				let history = this.data;
				history.unshift( query );
				history = history.filter( ( value, index ) => {
					return history.indexOf( value ) === index;
				} );
				if ( history.length > this.limit ) {
					history.splice( this.limit );
				}
				this.data = history;
				/* NOTE: Should we set an expiry? This data only exists locally though */
				mw.storage.set( 'skin-citizen-search-history', JSON.stringify( this.data ) );
			}
		},
		init: function () {
			const storedData = mw.storage.get( 'skin-citizen-search-history' );
			this.data = storedData ? JSON.parse( storedData ) : [];
		}
	};
}

/** @module searchHistory */
module.exports = searchHistory;
