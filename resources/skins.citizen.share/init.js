const Vue = require( 'vue' );
// const { reactive } = Vue;
const App = require( './App.vue' );

function initApp() {
	const mountPoint = document.getElementById( 'citizen-share-content' );
	if ( !mountPoint ) {
		return;
	}

    const app = Vue.createMwApp( App );
    // app.provide( 'preferencesConfig', config );
    // app.provide( 'themeDefault', themeDefault );
    app.mount( mountPoint );
}

module.exports = { initApp };

initApp();
