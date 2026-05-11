const Vue = require( 'vue' );
const App = require( './App.vue' );
const config = require( './config.json' );

const DEFAULT_URL_SHORTENER_CONFIG = {
	available: false,
	qrAvailable: false
};

const services = Array.isArray( config.services ) ? config.services : [];
const urlShortener = Object.assign(
	{},
	DEFAULT_URL_SHORTENER_CONFIG,
	config.urlShortener || {}
);

/**
 * Mount the share dialog content into the given target.
 *
 * The host is a server-rendered native `<dialog>` that share.js opens with
 * `showModal()`. Vue takes over the dialog body — the skeleton inside the
 * mount target is replaced by the real share UI when this function returns.
 * The dialog stays open through and after mount; subsequent open/close
 * cycles are handled entirely by the native `<dialog>` element.
 *
 * @param {HTMLElement} mountPoint
 * @return {void}
 */
function initApp( mountPoint ) {
	const app = Vue.createMwApp( App );
	app.provide( 'shareServiceOptions', services );
	app.provide( 'urlShortenerConfig', urlShortener );
	app.mount( mountPoint );
}

module.exports = { initApp };
