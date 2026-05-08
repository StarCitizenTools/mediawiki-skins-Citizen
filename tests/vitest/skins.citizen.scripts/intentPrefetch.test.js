// @vitest-environment jsdom

const mw = require( '../mocks/mw.js' );
const { bindIntentPrefetch } = require( '../../../resources/skins.citizen.scripts/intentPrefetch.js' );

afterEach( () => {
	vi.restoreAllMocks();
	mw.loader.load.mockClear();
	document.body.innerHTML = '';
} );

describe( 'bindIntentPrefetch', () => {
	function makeTrigger() {
		document.body.innerHTML = '<button id="trigger">Trigger</button>';
		return document.getElementById( 'trigger' );
	}

	it( 'fires mw.loader.load once on pointerenter', () => {
		const trigger = makeTrigger();

		bindIntentPrefetch( trigger, 'foo.module', mw );
		trigger.dispatchEvent( new Event( 'pointerenter' ) );

		expect( mw.loader.load ).toHaveBeenCalledTimes( 1 );
		expect( mw.loader.load ).toHaveBeenCalledWith( 'foo.module' );
	} );

	it( 'fires mw.loader.load once on focus', () => {
		const trigger = makeTrigger();

		bindIntentPrefetch( trigger, 'foo.module', mw );
		trigger.dispatchEvent( new Event( 'focus' ) );

		expect( mw.loader.load ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'fires mw.loader.load once on touchstart', () => {
		const trigger = makeTrigger();

		bindIntentPrefetch( trigger, 'foo.module', mw );
		trigger.dispatchEvent( new Event( 'touchstart' ) );

		expect( mw.loader.load ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'dedupes across multiple events on the same trigger', () => {
		const trigger = makeTrigger();

		bindIntentPrefetch( trigger, 'foo.module', mw );
		trigger.dispatchEvent( new Event( 'pointerenter' ) );
		trigger.dispatchEvent( new Event( 'focus' ) );
		trigger.dispatchEvent( new Event( 'touchstart' ) );

		expect( mw.loader.load ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'suppresses fires after cancel() is called', () => {
		const trigger = makeTrigger();

		const cancel = bindIntentPrefetch( trigger, 'foo.module', mw );
		cancel();
		trigger.dispatchEvent( new Event( 'pointerenter' ) );

		expect( mw.loader.load ).not.toHaveBeenCalled();
	} );
} );
