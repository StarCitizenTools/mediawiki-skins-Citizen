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
		replace: function ( pattern, s ) {
			this.setValue( this.value.replace( pattern, s ) );
		},
		remove: function ( pattern ) {
			this.replace( pattern, '' );
		}
	};
}

/** @module searchQuery */
module.exports = searchQuery;
