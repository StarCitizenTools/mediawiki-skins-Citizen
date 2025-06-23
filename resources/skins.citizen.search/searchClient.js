const searchClientsData = require( './searchClients/searchClients.json' );

function searchClient( config ) {
	return {
		active: null,
		getData: function ( key, value ) {
			return Object.values( searchClientsData ).find( ( item ) => item[ key ] === value );
		},
		setActive: function ( id ) {
			const data = this.getData( 'id', id );
			if ( data && data !== this.active ) {
				const client = require( `./searchClients/${ data.id }.js` );
				this.active = data;
				this.active.client = client( config );
			}
		}
	};
}

/** @module searchClient */
module.exports = searchClient;
