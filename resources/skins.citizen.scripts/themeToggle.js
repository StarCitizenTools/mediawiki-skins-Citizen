function init() {
	var theme = window.localStorage.getItem( 'skin-citizen-theme' );
	var toggleBtn = document.getElementById( 'theme-toggle' );

	toggleBtn.addEventListener( 'click', function ( clickEvent ) {
		theme = window.localStorage.getItem( 'skin-citizen-theme' );

		try {
			theme = theme === 'dark' ? 'light' : 'dark';

			clickEvent.target.classList.remove( 'theme-toggle-light', 'theme-toggle-dark', 'theme-toggle-auto' );
			// * theme-toggle-light
			// * theme-toggle-dark
			clickEvent.target.classList.add( 'theme-toggle-' + theme );

			try {
				window.localStorage.setItem( 'skin-citizen-theme', theme );
				window.mw.cookie.set( 'skin-citizen-theme-override', '1' );
			} catch ( e ) {
			}

			window.switchTheme();
		} catch ( e ) {
		}
	} );

	if ( theme !== 'auto' ) {
		// * theme-toggle-light
		// * theme-toggle-dark
		toggleBtn.classList.add( 'theme-toggle-' + theme );
	}
}

module.exports = {
	init: init
};
