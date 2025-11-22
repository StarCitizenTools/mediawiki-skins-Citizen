/**
 * Register service worker
 *
 * @return {void}
 */
function registerServiceWorker() {
	const scriptPath = mw.config.get( 'wgScriptPath' );
	// Only allow serviceWorker when the scriptPath is at root because of its scope
	// I can't figure out how to add the Service-Worker-Allowed HTTP header
	// to change the default scope
	if ( scriptPath !== '' ) {
		return;
	}

	if ( 'serviceWorker' in navigator ) {
		const SW_MODULE_NAME = 'skins.citizen.serviceWorker',
			version = mw.loader.moduleRegistry[ SW_MODULE_NAME ].version,
			// HACK: Faking a RL link
			swUrl = scriptPath +
				'/load.php?modules=' + SW_MODULE_NAME +
				'&only=scripts&raw=true&skin=citizen&version=' + version;
		navigator.serviceWorker.register( swUrl, { scope: '/' } );
	}
}

module.exports = {
	register: registerServiceWorker
};
