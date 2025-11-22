/**
 * Turn off performance mode if GPU acceleration is available
 * Skip the check if a user preference is already set.
 *
 * @return {void}
 */
function initPerformanceMode() {
	const prefName = 'citizen-feature-performance-mode-clientpref-';
	const clientPrefs = mw.storage.get( 'mwclientpreferences' );

	if ( clientPrefs && ( clientPrefs.includes( prefName + '0' ) || clientPrefs.includes( prefName + '1' ) ) ) {
		return;
	}

	const canvas = document.createElement( 'canvas' );
	const contextNames = [ 'webgl', 'experimental-webgl', 'webgl2' ];
	const hasGpu = contextNames.some( ( name ) => {
		try {
			const gl = canvas.getContext( name );
			return !!( gl && typeof gl.getParameter === 'function' );
		} catch ( e ) {
			return false;
		}
	} );

	if ( !hasGpu ) {
		// Performance mode ON is default, so we don't need to do anything
		return;
	}

	document.documentElement.classList.remove( prefName + '1' );
	document.documentElement.classList.add( prefName + '0' );
	mw.storage.set( 'mwclientpreferences', clientPrefs ? `${ clientPrefs },${ prefName }0` : `${ prefName }0` );
}

module.exports = {
	init: initPerformanceMode
};
