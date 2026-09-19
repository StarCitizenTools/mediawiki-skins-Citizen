/**
 * Shared request handling for the Bucket mode.
 *
 * `mw.Api` rejects jQuery-style with `( code, details )`, so a `catch`
 * around `await` keeps the code and drops the rest — including the string
 * at `details.error` that is the only account Bucket gives of a failed
 * query ("Bucket name item drop is invalid").
 */

/**
 * Whether a rejection is an abort rather than a failure. A signal aborted
 * before the request rejects with its own reason, usually a DOMException;
 * one aborted in flight rejects with an abort textStatus.
 *
 * @param {*} code
 * @param {*} details
 * @return {boolean}
 */
function isAbort( code, details ) {
	if ( code && typeof code === 'object' && code.name === 'AbortError' ) {
		return true;
	}
	if ( details && typeof details === 'object' ) {
		return details.textStatus === 'abort' || details.exception === 'abort';
	}
	return false;
}

/**
 * The most useful thing a rejection carries: Bucket's own message when
 * there is one, the code otherwise.
 *
 * @param {*} code
 * @param {*} details
 * @return {*}
 */
function errorMessage( code, details ) {
	if ( details && typeof details === 'object' && 'error' in details ) {
		return details.error;
	}
	return code;
}

/**
 * Creates a request function bound to an API constructor.
 *
 * @param {typeof mw.Api} ApiConstructor
 * @return {function(Object, Object=, string=): Promise<?Object>} Resolves to
 *   the response, or to null when the request failed or was aborted.
 */
function createApiClient( ApiConstructor ) {
	return function request( params, ajaxOptions, context ) {
		const api = new ApiConstructor();
		// Adopted as a native promise; nothing here needs jQuery's `.abort()`,
		// since requests are cancelled through the AbortSignal.
		return Promise.resolve( api.get( params, ajaxOptions ).then(
			( data ) => data,
			( code, details ) => {
				if ( !isAbort( code, details ) ) {
					mw.log.error(
						'[commandPalette] ' + ( context || 'Bucket request' ) + ' failed:',
						errorMessage( code, details )
					);
				}
				return null;
			}
		) );
	};
}

module.exports = createApiClient;
