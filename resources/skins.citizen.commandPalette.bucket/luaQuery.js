/**
 * Lua query construction for Extension:Bucket.
 *
 * `action=bucket` executes the expression it is handed, so this file is the
 * single place one is assembled, under two rules: identifiers come only from
 * a bucket's own schema, never from typed text, and every interpolated
 * string — identifier or value — goes through `escapeLuaString`.
 */

const NUMERIC_TYPES = [ 'INTEGER', 'DOUBLE' ];
const DEFAULT_LIMIT = 20;

/**
 * Escapes a string for a single-quoted Lua literal. Backslashes go first,
 * so the escapes added after are not themselves doubled.
 *
 * @param {*} value
 * @return {string}
 */
function escapeLuaString( value ) {
	return String( value )
		.replace( /\\/g, '\\\\' )
		.replace( /'/g, '\\\'' )
		.replace( /\n/g, '\\n' )
		.replace( /\r/g, '\\r' );
}

/**
 * Wraps a value in an escaped, single-quoted Lua literal.
 *
 * @param {*} value
 * @return {string}
 */
function quote( value ) {
	return '\'' + escapeLuaString( value ) + '\'';
}

/**
 * Renders a value as Lua, the field's type deciding between a bare literal
 * and a quoted string. A value that does not fit its type — a word typed
 * into a numeric field — stays quoted, since Lua would read a bare word as
 * an identifier.
 *
 * @param {*} value
 * @param {string} type Bucket value type (TEXT, PAGE, INTEGER, DOUBLE, BOOLEAN).
 * @return {string}
 */
function formatLuaValue( value, type ) {
	if ( type === 'BOOLEAN' ) {
		return ( value === true || value === 'true' ) ? 'true' : 'false';
	}

	if ( NUMERIC_TYPES.includes( type ) && value !== '' && value !== null ) {
		const number = Number( value );
		if ( Number.isFinite( number ) ) {
			return String( number );
		}
	}

	return quote( value );
}

/**
 * Coerces a row limit to a positive integer.
 *
 * @param {*} value
 * @return {number}
 */
function toLimit( value ) {
	const number = parseInt( value, 10 );
	return Number.isFinite( number ) && number > 0 ? number : DEFAULT_LIMIT;
}

/**
 * @typedef {Object} BucketFilter
 * @property {string} field Schema field name.
 * @property {string} op One of Bucket's where operators (= != > < >= <=).
 * @property {*} value
 * @property {string} type Bucket value type of the field.
 */

/**
 * Builds a complete Lua query expression.
 *
 * @param {Object} spec
 * @param {string} spec.bucket Bucket name (lowercase, as Bucket stores it).
 * @param {string[]} spec.select Fields to select.
 * @param {BucketFilter[]} [spec.filters] Conditions, ANDed together by Bucket.
 * @param {string} [spec.orderBy] Field to sort by.
 * @param {number} [spec.limit] Row limit; omitted entirely when absent.
 * @return {string} Lua expression ready for `action=bucket&query=`.
 */
function buildQuery( spec ) {
	const parts = [
		'bucket(' + quote( spec.bucket ) + ')',
		'.select(' + ( spec.select || [] ).map( quote ).join( ',' ) + ')'
	];

	( spec.filters || [] ).forEach( ( filter ) => {
		parts.push(
			'.where(' + quote( filter.field ) + ',' + quote( filter.op ) + ',' +
			formatLuaValue( filter.value, filter.type ) + ')'
		);
	} );

	if ( spec.orderBy ) {
		parts.push( '.orderBy(' + quote( spec.orderBy ) + ')' );
	}

	// No limit asked for, no clause: Bucket applies its own default, and a
	// snippet bound for a module should not carry the palette's display cap.
	if ( spec.limit !== undefined ) {
		parts.push( '.limit(' + toLimit( spec.limit ) + ')' );
	}
	parts.push( '.run()' );

	return parts.join( '' );
}

module.exports = { escapeLuaString, formatLuaValue, buildQuery };
