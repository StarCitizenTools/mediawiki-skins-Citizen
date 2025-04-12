const
	Vue = require( 'vue' ),
	App = require( './components/App.vue' );

function initApp() {
	const teleportTarget = require( 'mediawiki.page.ready' ).teleportTarget;

	const app = Vue.createMwApp( App );
	const commandPalette = app.mount( teleportTarget );

	console.log( '[skins.citizen.commandPalette] Command palette initialized' );

	// Add keyboard shortcut (Cmd/Ctrl + K)
	// TODO: Placeholder entry point, this should replace the slash search shortcut
	document.addEventListener( 'keydown', ( event ) => {
		if ( ( event.metaKey || event.ctrlKey ) && event.key === 'k' ) {
			event.preventDefault();
			commandPalette.open();
		}
	} );
}

initApp();
