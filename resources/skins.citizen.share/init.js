const Vue = require( 'vue' );
const App = require( './App.vue' );
const config = require( './config.json' );

function initApp() {
	const mountPoint = document.getElementById( 'citizen-share-content' );
	if ( !mountPoint ) {
		return;
	}

	const app = Vue.createMwApp( App );
	app.provide( 'shareServiceOptions', config.wgCitizenShareServiceOptions || [] );
	app.mount( mountPoint );
}

module.exports = { initApp };

initApp();
