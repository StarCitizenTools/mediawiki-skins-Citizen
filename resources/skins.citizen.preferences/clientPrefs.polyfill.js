/**
 * Polyfill for mw.user.clientPrefs for < MW 1.42
 * Modified to use localStorage for all users
 * TODO: Revisit when we move to MW 1.43 and the interface is more stable
 */

const CLIENTPREF_STORAGE_NAME = 'mwclientpreferences';
const CLIENTPREF_SUFFIX = '-clientpref-';
const CLIENTPREF_DELIMITER = ',';

/**
 * Check if the feature name is composed of valid characters.
 *
 * A valid feature name may contain letters, numbers, and "-" characters.
 *
 * @private
 * @param {string} value
 * @return {boolean}
 */
function isValidFeatureName( value ) {
	return value.match( /^[a-zA-Z0-9-]+$/ ) !== null;
}

/**
 * Check if the value is composed of valid characters.
 *
 * @private
 * @param {string} value
 * @return {boolean}
 */
function isValidFeatureValue( value ) {
	return value.match( /^[a-zA-Z0-9]+$/ ) !== null;
}

/**
 * Save the feature value to the client preferences localStorage.
 * Modified from the original to use localStorage instead of cookie.
 *
 * @private
 * @param {string} feature
 * @param {string} value
 */
function saveClientPrefs( feature, value ) {
	const existingStorage = mw.storage.get( CLIENTPREF_STORAGE_NAME ) || '';
	const data = {};
	existingStorage.split( CLIENTPREF_DELIMITER ).forEach( ( keyValuePair ) => {
		const m = keyValuePair.match( /^([\w-]+)-clientpref-(\w+)$/ );
		if ( m ) {
			data[ m[ 1 ] ] = m[ 2 ];
		}
	} );
	data[ feature ] = value;

	const newStorage = Object.keys( data ).map( ( key ) => key + CLIENTPREF_SUFFIX + data[ key ] ).join( CLIENTPREF_DELIMITER );
	mw.storage.set( CLIENTPREF_STORAGE_NAME, newStorage );
}

function clientPrefs() {
	return {
		/**
		 * Change the class on the HTML document element, and save the value in a localStorage.
		 *
		 * @memberof mw.user.clientPrefs
		 * @param {string} feature
		 * @param {string} value
		 * @return {boolean} True if feature was stored successfully, false if the value
		 *   uses a forbidden character or the feature is not recognised
		 *   e.g. a matching class was not defined on the HTML document element.
		 */
		set: function ( feature, value ) {
			if ( !isValidFeatureName( feature ) || !isValidFeatureValue( value ) ) {
				return false;
			}
			const currentValue = this.get( feature );

			const oldFeatureClass = feature + CLIENTPREF_SUFFIX + currentValue;
			const newFeatureClass = feature + CLIENTPREF_SUFFIX + value;
			// The following classes are removed here:
			// * feature-name-clientpref-<old-feature-value>
			// * e.g. vector-font-size--clientpref-small
			document.documentElement.classList.remove( oldFeatureClass );
			// The following classes are added here:
			// * feature-name-clientpref-<feature-value>
			// * e.g. vector-font-size--clientpref-xlarge
			document.documentElement.classList.add( newFeatureClass );
			saveClientPrefs( feature, value );
			return true;
		},

		/**
		 * Retrieve the current value of the feature from the HTML document element.
		 *
		 * @memberof mw.user.clientPrefs
		 * @param {string} feature
		 * @return {string|boolean} returns boolean if the feature is not recognized
		 *  returns string if a feature was found.
		 */
		get: function ( feature ) {
			const featurePrefix = feature + CLIENTPREF_SUFFIX;
			const docClass = document.documentElement.className;

			const featureRegEx = new RegExp(
				'(^| )' + mw.util.escapeRegExp( featurePrefix ) + '([a-zA-Z0-9]+)( |$)'
			);
			const match = docClass.match( featureRegEx );

			// check no further matches if we replaced this occurance.
			const isAmbiguous = docClass.replace( featureRegEx, '$1$3' ).match( featureRegEx ) !== null;
			return !isAmbiguous && match ? match[ 2 ] : false;
		}
	};
}

/** @module clientPrefs */
module.exports = clientPrefs;
