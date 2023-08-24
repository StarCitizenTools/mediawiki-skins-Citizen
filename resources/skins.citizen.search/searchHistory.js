function searchHistory( config ) {
	return {
		data: [],
		/* TODO: Should probably create a separate config */
		limit: config.wgCitizenMaxSearchResults,
		get: function () {
			// IDK why this.data keeps returning an empty array without init
			this.init();
			return this.data;
		},
		set: function ( arr ) {
			this.data = arr;
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
				this.set( history );
				/* NOTE: Should we set an expiry? This data only exists locally though */
				mw.storage.set( 'skin-citizen-search-history', JSON.stringify( this.data ) );
			}
		},
		init: function () {
			const storedData = mw.storage.get( 'skin-citizen-search-history' );
			if ( storedData ) {
				this.set( JSON.parse( storedData ) );
			}
		}
	};
}

/** @module searchHistory */
module.exports = searchHistory;
