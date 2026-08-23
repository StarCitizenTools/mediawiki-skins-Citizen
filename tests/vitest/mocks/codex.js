/**
 * Stand-in for the `codex.js` that ResourceLoader synthesises inside a
 * CodexModule from its `codexComponents` list. The real file is generated at
 * request time and has no on-disk counterpart, so `tests/vitest/setup.js`
 * resolves the components' `require( '…/codex.js' )` here instead.
 *
 * Components destructure this at module-evaluation time, so a test must call
 * `setCodexStubs()` before it imports the component under test.
 */

const stubs = {};

/**
 * Replace the registered stubs.
 *
 * Consumers destructure this module as they evaluate, so re-registering only
 * reaches components imported afterwards — never one that is already loaded.
 *
 * @param {Object} components Map of Codex component name to Vue stub
 */
function setCodexStubs( components ) {
	for ( const key of Object.keys( stubs ) ) {
		if ( key !== 'setCodexStubs' ) {
			delete stubs[ key ];
		}
	}
	Object.assign( stubs, components );
}

stubs.setCodexStubs = setCodexStubs;

module.exports = stubs;
