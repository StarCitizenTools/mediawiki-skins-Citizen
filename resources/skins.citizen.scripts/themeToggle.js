function init() {
	var theme = window.mw.cookie.get( 'skin-citizen-theme' );
	var toggleBtn = document.getElementById( 'theme-toggle' );

	// * theme-toggle-light
	// * theme-toggle-dark
	toggleBtn.classList.add( 'theme-toggle-' + theme );

	toggleBtn.addEventListener( 'click', function ( clickEvent ) {
		try {
			theme = theme === 'dark' ? 'light' : 'dark';

			clickEvent.target.classList.remove( 'theme-toggle-light', 'theme-toggle-dark' );
			// * theme-toggle-light
			// * theme-toggle-dark
			clickEvent.target.classList.add( 'theme-toggle-' + theme );

			try {
				window.mw.cookie.set( 'skin-citizen-theme', null );
				window.mw.cookie.set( 'skin-citizen-theme', theme );
				window.mw.cookie.set( 'skin-citizen-theme-override', '1' );
			} catch ( e ) {
			}

			window.switchTheme();
		} catch ( e ) {
		}
	} );
}

module.exports = {
	init: init
};
