/**
 * Whether a caught value is an abort signal firing rather than a real failure.
 *
 * Catch bindings are `unknown`: a rejected promise can carry anything, so the
 * value is not necessarily an object and reading `.name` off it directly can
 * throw. Callers abort in-flight requests on every keystroke, so this runs on
 * the common path.
 *
 * @param {unknown} error
 * @return {boolean}
 */
function isAbortError( error ) {
	if ( typeof error !== 'object' || error === null ) {
		return false;
	}
	return /** @type {{ name?: unknown }} */ ( error ).name === 'AbortError';
}

module.exports = isAbortError;
