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

	describe( 'onReady', () => {
		let req;
		let onReady;

		beforeEach( () => {
			req = vi.fn();
			onReady = vi.fn();
		} );

		afterEach( () => {
			mw.loader.using.mockReset();
			mw.loader.using.mockImplementation( () => Promise.resolve() );
		} );

		it( 'loads via mw.loader.using and calls onReady with the require function and event type', async () => {
			const trigger = makeTrigger();
			mw.loader.using.mockReturnValue( Promise.resolve( req ) );

			bindIntentPrefetch( trigger, 'foo.module', mw, { onReady } );
			trigger.dispatchEvent( new Event( 'pointerenter' ) );
			await new Promise( ( r ) => setTimeout( r, 0 ) );

			expect( mw.loader.using ).toHaveBeenCalledWith( 'foo.module' );
			expect( mw.loader.load ).not.toHaveBeenCalled();
			expect( onReady ).toHaveBeenCalledWith( req, 'pointerenter' );
		} );

		it( 'reports the event type that actually fired the prefetch', async () => {
			const trigger = makeTrigger();
			mw.loader.using.mockReturnValue( Promise.resolve( req ) );

			bindIntentPrefetch( trigger, 'foo.module', mw, { onReady } );
			trigger.dispatchEvent( new Event( 'touchstart' ) );
			await new Promise( ( r ) => setTimeout( r, 0 ) );

			expect( onReady ).toHaveBeenCalledWith( req, 'touchstart' );
		} );

		it( 'stays silent and skips onReady when the load fails', async () => {
			const trigger = makeTrigger();
			mw.loader.using.mockReturnValue( Promise.reject( new Error( 'offline' ) ) );

			bindIntentPrefetch( trigger, 'foo.module', mw, { onReady } );
			trigger.dispatchEvent( new Event( 'pointerenter' ) );
			await new Promise( ( r ) => setTimeout( r, 0 ) );

			expect( onReady ).not.toHaveBeenCalled();
		} );

		it( 'cancel() after the prefetch fired suppresses a pending onReady', async () => {
			const trigger = makeTrigger();
			let resolveUsing;
			mw.loader.using.mockReturnValue( new Promise( ( resolve ) => {
				resolveUsing = resolve;
			} ) );

			const cancel = bindIntentPrefetch( trigger, 'foo.module', mw, { onReady } );
			trigger.dispatchEvent( new Event( 'pointerenter' ) );
			cancel();
			resolveUsing( req );
			await new Promise( ( r ) => setTimeout( r, 0 ) );

			expect( onReady ).not.toHaveBeenCalled();
		} );
	} );
} );
