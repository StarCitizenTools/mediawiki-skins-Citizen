const Vue = require( 'vue' );
const App = require( './App.vue' );

/**
 * Initialize the preferences panel Vue app.
 *
 * @return {void}
 */
function initApp() {
	const mountPoint = document.getElementById( 'citizen-preferences-content' );
	if ( !mountPoint ) {
		return;
	}

	Vue.createMwApp( App ).mount( mountPoint );
}

initApp();
