const { ref, nextTick } = require( 'vue' );

const usePendingActivation = require(
	'../../../../resources/skins.citizen.commandPalette/composables/usePendingActivation.js'
);
const { PENDING_ACTIVATION_TIMEOUT_MS } = usePendingActivation;

const surfaceOf = ( query, mode, context, help ) => JSON.stringify( [
	query, mode || null, context || [], !!help
] );

function setup( overrides = {} ) {
	const state = {
		surfaceKey: ref( surfaceOf( 'sun' ) ),
		isLeadReady: ref( false ),
		items: ref( [] ),
		defaultHighlightIndex: ref( -1 ),
		onActivate: vi.fn(),
		...overrides
	};

	return { state, pending: usePendingActivation( state ) };
}

/**
 * Settle the lead group with the given items, as the orchestration would.
 *
 * @param {Object} state
 * @param {Array} items
 * @return {Promise}
 */
async function settle( state, items ) {
	state.items.value = items;
	state.defaultHighlightIndex.value = items.length > 0 ? 0 : -1;
	state.isLeadReady.value = true;
	await nextTick();
}

describe( 'usePendingActivation', () => {
	beforeEach( () => {
		vi.useFakeTimers();
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	} );

	it( 'fires with the default item once the lead group settles', async () => {
		const { state, pending } = setup();

		pending.arm();
		await settle( state, [ { id: 'sunset', label: 'Sunset' } ] );

		expect( state.onActivate ).toHaveBeenCalledWith( { id: 'sunset', label: 'Sunset' } );
	} );

	it( 'carries the intent it was armed with onto the item', async () => {
		const { state, pending } = setup();

		pending.arm( { newTab: true } );
		await settle( state, [ { id: 'sunset' } ] );

		expect( state.onActivate ).toHaveBeenCalledWith( { id: 'sunset', newTab: true } );
	} );

	it( 'leaves the settled item itself unflagged', async () => {
		// The item comes out of the live result list, so decorating it in
		// place would make every later activation of that row inherit it.
		const items = [ { id: 'sunset' } ];
		const { state, pending } = setup();

		pending.arm( { newTab: true } );
		await settle( state, items );

		expect( items[ 0 ] ).toEqual( { id: 'sunset' } );
	} );

	it( 'drops the intent with the hold, so the next plain Enter is plain', async () => {
		const { state, pending } = setup();

		pending.arm( { newTab: true } );
		await settle( state, [ { id: 'sunset' } ] );
		state.isLeadReady.value = false;
		await nextTick();
		pending.arm();
		state.onActivate.mockClear();
		await settle( state, [ { id: 'sunrise' } ] );

		expect( state.onActivate ).toHaveBeenCalledWith( { id: 'sunrise' } );
	} );

	it( 'raises its own queued flag immediately', () => {
		const { pending } = setup();

		pending.arm();

		expect( pending.isActivationQueued.value ).toBe( true );
	} );

	it( 'does nothing until the lead group settles', async () => {
		const { state, pending } = setup();

		pending.arm();
		state.items.value = [ { id: 'stale' } ];
		await nextTick();

		expect( state.onActivate ).not.toHaveBeenCalled();
	} );

	it( 'is discarded when the query changes again', async () => {
		const { state, pending } = setup();

		pending.arm();
		state.surfaceKey.value = surfaceOf( 'sunse' );
		await nextTick();
		await settle( state, [ { id: 'sunset' } ] );

		expect( state.onActivate ).not.toHaveBeenCalled();
		expect( pending.isActivationQueued.value ).toBe( false );
	} );

	// The bug this binding exists to prevent: entering a mode, drilling in or
	// out, and opening help all leave the query at '', so a query-only binding
	// would let an activation armed on one level fire against another.
	it( 'is discarded when the mode context changes without the query changing', async () => {
		const { state, pending } = setup( {
			surfaceKey: ref( surfaceOf( '', 'category', [ 'Animals' ] ) )
		} );

		pending.arm();
		state.surfaceKey.value = surfaceOf( '', 'category', [] );
		await nextTick();
		await settle( state, [ { id: 'abandoned-member' } ] );

		expect( state.onActivate ).not.toHaveBeenCalled();
	} );

	it( 'is discarded when help opens without the query changing', async () => {
		const { state, pending } = setup( {
			surfaceKey: ref( surfaceOf( '', 'file', [] ) )
		} );

		pending.arm();
		state.surfaceKey.value = surfaceOf( '', 'file', [], true );
		await nextTick();
		await settle( state, [ { id: 'never-seen' } ] );

		expect( state.onActivate ).not.toHaveBeenCalled();
	} );

	it( 'is discarded when the lead group settles with no items', async () => {
		const { state, pending } = setup();

		pending.arm();
		await settle( state, [] );

		expect( state.onActivate ).not.toHaveBeenCalled();
		expect( pending.isActivationQueued.value ).toBe( false );
	} );

	it( 'expires without navigating when the fetch never lands', async () => {
		const { state, pending } = setup();

		pending.arm();
		vi.advanceTimersByTime( PENDING_ACTIVATION_TIMEOUT_MS );
		await settle( state, [ { id: 'late' } ] );

		expect( state.onActivate ).not.toHaveBeenCalled();
		expect( pending.isActivationQueued.value ).toBe( false );
	} );

	it( 'cancel() drops the queued activation', async () => {
		const { state, pending } = setup();

		pending.arm();
		pending.cancel();
		await settle( state, [ { id: 'sunset' } ] );

		expect( state.onActivate ).not.toHaveBeenCalled();
		expect( pending.isActivationQueued.value ).toBe( false );
	} );

	it( 'does not fire when nothing was ever armed', async () => {
		const { state } = setup();

		await settle( state, [ { id: 'sunset' } ] );

		expect( state.onActivate ).not.toHaveBeenCalled();
	} );

	it( 'only fires once per arm', async () => {
		const { state, pending } = setup();

		pending.arm();
		await settle( state, [ { id: 'sunset' } ] );
		state.isLeadReady.value = false;
		await nextTick();
		state.isLeadReady.value = true;
		await nextTick();

		expect( state.onActivate ).toHaveBeenCalledTimes( 1 );
	} );
} );
