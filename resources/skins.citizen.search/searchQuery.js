function searchQuery() {
	return {
		value: null,
		valueHtml: null,
		isValid: false,
		setValue: function ( s ) {
			this.value = s;
			this.valueHtml = mw.html.escape( s );
			this.isValid = this.checkValid( s );
		},
		checkValid: function ( s ) {
			return s.length > 0;
		},
		removeCommand: function ( s ) {
			this.setValue( this.value.replace( `/${s} `, '' ) );
		}
	};
}

/** @module searchQuery */
module.exports = searchQuery;
