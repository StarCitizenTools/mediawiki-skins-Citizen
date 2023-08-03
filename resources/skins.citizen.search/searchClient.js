const searchClientsData = require( './searchClients/searchClients.json' );

function searchClient( config ) {
	return {
		active: null,
		getData: function ( id ) {
			const data = Object.values( searchClientsData ).find( ( item ) => item.id === id );
			return data;
		},
		setActive: function ( id ) {
			const data = this.getData( id );
			if ( data ) {
				const client = require( `./searchClients/${data.id}.js` );
				this.active = data;
				this.active.client = client( config );
			}
		}
	};
}

/** @module searchClient */
module.exports = searchClient;
