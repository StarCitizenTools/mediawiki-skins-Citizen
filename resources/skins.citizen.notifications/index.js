const Vue = require( 'vue' );
const App = require( './components/App.vue' );
const { createEchoSource } = require( './sources/echo.js' );

/**
 * Mount the notification panel into the provided element.
 *
 * The caller (notifications.js) owns the trigger lifecycle: this function
 * only builds the Echo-backed source, wires the optional count bridge back
 * to the trigger, and mounts. The dropdown's open/close is the caller's
 * responsibility; on reopen the caller calls `refresh()` on the returned
 * instance to refetch silently.
 *
 * @param {HTMLElement} mountEl
 * @param {Object} [options]
 * @param {Function} [options.onCountsChange] Called with `{ alert, message, total }`
 *   whenever unread counts change, so the trigger can update the bell badge.
 * @return {Object} mounted instance exposing `refresh()`
 */
function initApp( mountEl, options ) {
	const opts = options || {};

	const app = Vue.createMwApp( App );
	app.provide( 'source', createEchoSource( mw.Api ) );
	if ( typeof opts.onCountsChange === 'function' ) {
		app.provide( 'onCountsChange', opts.onCountsChange );
	}

	return app.mount( mountEl );
}

module.exports = { initApp };
