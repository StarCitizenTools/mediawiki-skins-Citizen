/* global globalThis */
// @vitest-environment jsdom

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

// Minimal jQuery stub. The real one wraps DOM nodes and exposes a `.jquery`
// version string; the helper sniffs that property to decide whether to
// re-wrap. We just need it to leave inputs untouched and mark wrapped ones.
globalThis.$ = vi.fn( ( node ) => {
	const wrapper = { jquery: '3.0.0', 0: node, length: 1 };
	return wrapper;
} );

const instantDiffs = require( '../../../../resources/skins.citizen.commandPalette/services/instantDiffs.js' );

describe( 'instantDiffs helper', () => {
	beforeEach( () => {
		delete globalThis.window.instantDiffs;
		mw.hook( 'instantDiffs.process' )._reset();
		mw.hook( 'instantDiffs.ready' )._reset();
		globalThis.$.mockClear();
	} );

	describe( 'isAvailable', () => {
		it( 'returns false when window.instantDiffs is undefined', () => {
			expect( instantDiffs.isAvailable() ).toBe( false );
		} );

		it( 'returns false when instantDiffs exists but isReady is not true', () => {
			globalThis.window.instantDiffs = { isReady: false };

			expect( instantDiffs.isAvailable() ).toBe( false );
		} );

		it( 'returns true when instantDiffs.isReady is true', () => {
			globalThis.window.instantDiffs = { isReady: true };

			expect( instantDiffs.isAvailable() ).toBe( true );
		} );
	} );

	describe( 'processContext', () => {
		it( 'does not fire the hook when gadget is unavailable', () => {
			const container = document.createElement( 'div' );

			instantDiffs.processContext( container );

			expect( mw.hook( 'instantDiffs.process' ).fire ).not.toHaveBeenCalled();
		} );

		it( 'wraps a raw DOM container in jQuery before firing the hook', () => {
			globalThis.window.instantDiffs = { isReady: true };
			const container = document.createElement( 'div' );

			instantDiffs.processContext( container );

			expect( globalThis.$ ).toHaveBeenCalledWith( container );
			const firedArg = mw.hook( 'instantDiffs.process' ).fire.mock.calls[ 0 ][ 0 ];
			expect( firedArg.jquery ).toBeDefined();
			expect( firedArg[ 0 ] ).toBe( container );
		} );

		it( 'forwards an existing jQuery container without re-wrapping', () => {
			globalThis.window.instantDiffs = { isReady: true };
			const container = document.createElement( 'div' );
			const $container = { jquery: '3.0.0', 0: container, length: 1 };

			instantDiffs.processContext( $container );

			expect( globalThis.$ ).not.toHaveBeenCalled();
			expect( mw.hook( 'instantDiffs.process' ).fire ).toHaveBeenCalledWith( $container );
		} );
	} );

	describe( 'triggerForAnchor', () => {
		it( 'returns true when a listener calls preventDefault', () => {
			document.body.innerHTML = '<a href="#x" id="t">link</a>';
			const anchor = document.getElementById( 't' );
			anchor.addEventListener( 'click', ( e ) => e.preventDefault() );

			const result = instantDiffs.triggerForAnchor( anchor );

			expect( result ).toBe( true );
		} );

		it( 'returns false when no listener prevents default', () => {
			document.body.innerHTML = '<a href="#x" id="t">link</a>';
			const anchor = document.getElementById( 't' );

			const result = instantDiffs.triggerForAnchor( anchor );

			expect( result ).toBe( false );
		} );

		it( 'dispatches a bubbling cancelable left-click MouseEvent', () => {
			document.body.innerHTML = '<a href="#x" id="t">link</a>';
			const anchor = document.getElementById( 't' );
			let captured = null;
			anchor.addEventListener( 'click', ( e ) => {
				captured = { type: e.type, bubbles: e.bubbles, cancelable: e.cancelable, button: e.button };
			} );

			instantDiffs.triggerForAnchor( anchor );

			expect( captured ).toEqual( { type: 'click', bubbles: true, cancelable: true, button: 0 } );
		} );
	} );
} );
