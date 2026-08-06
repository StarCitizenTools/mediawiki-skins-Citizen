// @vitest-environment jsdom

const { mount, flushPromises } = require( '@vue/test-utils' );
// Require vue (CJS) before the SFC dynamic import so both resolve to one
// Vue instance — otherwise @vue/test-utils' mount throws `app.onUnmount`.
require( 'vue' );
const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

// Stub the Codex components the panel pulls via mw.loader.require.
mw.loader.require = vi.fn( () => ( {
	CdxButton: {
		name: 'CdxButton',
		template: '<button class="cdx-button" :disabled="disabled" @click="$emit( \'click\', $event )"><slot /></button>',
		props: [ 'disabled', 'weight', 'action' ],
		emits: [ 'click' ]
	},
	CdxIcon: {
		name: 'CdxIcon',
		template: '<span class="cdx-icon"></span>',
		props: [ 'icon' ]
	},
} ) );

let App;

beforeAll( async () => {
	const mod = await import( '../../../resources/skins.citizen.notifications/components/App.vue' );
	App = mod.default;
} );

function makeItem( id, read, timestamp ) {
	return {
		id: id,
		category: 'mention',
		categoryLabel: 'Mention',
		read: read,
		timestamp: timestamp,
		iconUrl: '',
		header: 'Notification ' + id,
		body: '',
		primaryUrl: '',
		secondaryLinks: []
	};
}
const ITEMS = [
	makeItem( 12, false, 1700000400 ),
	makeItem( 21, false, 1700000300 ),
	makeItem( 11, true, 1700000200 )
];
const COUNTS = { total: 2, local: 2, foreign: 0 };

function cloneItems() {
	return ITEMS.map( ( item ) => Object.assign( {}, item ) );
}

function makeSource( overrides ) {
	return Object.assign( {
		fetch: vi.fn().mockResolvedValue( { items: cloneItems(), counts: Object.assign( {}, COUNTS ) } ),
		markSeen: vi.fn().mockResolvedValue(),
		markRead: vi.fn().mockResolvedValue(),
		markAllRead: vi.fn().mockResolvedValue()
	}, overrides );
}

function mountApp( source, extraProvide ) {
	return mount( App, {
		global: {
			provide: Object.assign( { source: source }, extraProvide )
		}
	} );
}

describe( 'notifications App', () => {
	const rows = ( wrapper ) => wrapper.findAll( '.citizen-notifications__item' );

	it( 'fetches and marks seen on mount, swapping skeleton for the list', async () => {
		const source = makeSource();
		const wrapper = mountApp( source );

		// onMounted -> load() sets status loading synchronously.
		expect( wrapper.find( '.citizen-notifications__skeleton' ).exists() ).toBe( true );

		await flushPromises();

		expect( source.fetch ).toHaveBeenCalledTimes( 1 );
		expect( source.markSeen ).toHaveBeenCalledWith( 'all' );
		expect( wrapper.find( '.citizen-notifications__skeleton' ).exists() ).toBe( false );
		expect( rows( wrapper ) ).toHaveLength( 3 );
	} );

	it( 'renders one list, in the order the source gave', async () => {
		const source = makeSource();
		const wrapper = mountApp( source );
		await flushPromises();

		expect( rows( wrapper ) ).toHaveLength( 3 );
		expect( wrapper.findAll( '.cdx-tabs' ) ).toHaveLength( 0 );
	} );

	it( 'shows an empty state when there is nothing waiting', async () => {
		const source = makeSource( {
			fetch: vi.fn().mockResolvedValue( { items: [], counts: { total: 0, local: 0, foreign: 0 } } )
		} );
		const wrapper = mountApp( source );
		await flushPromises();

		expect( wrapper.find( '.citizen-notifications__empty' ).exists() ).toBe( true );
		expect( wrapper.findAll( '.citizen-notifications__item' ) ).toHaveLength( 0 );
	} );

	it( 'shows a retry control on fetch failure and refetches when clicked', async () => {
		const source = makeSource( {
			fetch: vi.fn()
				.mockRejectedValueOnce( new Error( 'network' ) )
				.mockResolvedValueOnce( { items: cloneItems(), counts: Object.assign( {}, COUNTS ) } )
		} );
		const wrapper = mountApp( source );
		await flushPromises();

		expect( wrapper.find( '.citizen-notifications__error' ).exists() ).toBe( true );

		await wrapper.find( '.citizen-notifications__retry' ).trigger( 'click' );
		await flushPromises();

		expect( source.fetch ).toHaveBeenCalledTimes( 2 );
		expect( wrapper.find( '.citizen-notifications__error' ).exists() ).toBe( false );
		expect( rows( wrapper ) ).toHaveLength( 3 );
	} );

	it( 'marks an item read on click and clears its unread state', async () => {
		const source = makeSource();
		const wrapper = mountApp( source );
		await flushPromises();

		// First row is the newest unread notification (id 12).
		await rows( wrapper )[ 0 ].trigger( 'click' );

		expect( source.markRead ).toHaveBeenCalledWith( [ 12 ] );
		await wrapper.vm.$nextTick();
		// The row stays put but fades, marking what has been dealt with.
		expect( wrapper.findAll( '.citizen-notifications__item--read' ).length ).toBe( 2 );
	} );

	it( 'marks everything read, unscoped', async () => {
		const source = makeSource();
		const wrapper = mountApp( source );
		await flushPromises();

		await wrapper.find( '.citizen-notifications__mark-all' ).trigger( 'click' );

		expect( source.markAllRead ).toHaveBeenCalledWith();
	} );

	it( 'reports count changes to the injected callback', async () => {
		const onCountsChange = vi.fn();
		const source = makeSource();
		const wrapper = mountApp( source, { onCountsChange: onCountsChange } );
		await flushPromises();

		expect( onCountsChange ).toHaveBeenCalledWith( { total: 2, local: 2, foreign: 0 } );

		await wrapper.find( '.citizen-notifications__mark-all' ).trigger( 'click' );
		await wrapper.vm.$nextTick();
		expect( onCountsChange ).toHaveBeenLastCalledWith( { total: 0, local: 0, foreign: 0 } );
	} );

	it( 'refresh() refetches without showing the skeleton', async () => {
		const source = makeSource();
		const wrapper = mountApp( source );
		await flushPromises();
		expect( source.fetch ).toHaveBeenCalledTimes( 1 );

		wrapper.vm.refresh();
		expect( wrapper.find( '.citizen-notifications__skeleton' ).exists() ).toBe( false );
		await flushPromises();
		expect( source.fetch ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'renders footer links to the notifications and preferences pages', async () => {
		const source = makeSource();
		const wrapper = mountApp( source );
		await flushPromises();

		expect( wrapper.find( '.citizen-notifications__see-all' ).attributes( 'href' ) ).toContain( 'Special:Notifications' );
		expect( wrapper.find( '.citizen-notifications__prefs' ).attributes( 'href' ) ).toContain( 'Special:Preferences' );
	} );

	it( 'gives each item a stretched primary link labelled by its plain-text header', async () => {
		const item = makeItem( 5, false, 1700000500 );
		item.primaryUrl = '/wiki/Target?markasread=5';
		item.header = '<strong>NotifBot</strong> mentioned you';
		const source = makeSource( {
			fetch: vi.fn().mockResolvedValue( { items: [ item ], counts: { total: 1, local: 1, foreign: 0 } } )
		} );
		const wrapper = mountApp( source );
		await flushPromises();

		const link = wrapper.find( '.citizen-notifications__item-primary' );
		expect( link.exists() ).toBe( true );
		expect( link.attributes( 'href' ) ).toBe( '/wiki/Target?markasread=5' );
		// Accessible name is the header with markup stripped.
		expect( link.attributes( 'aria-label' ) ).toBe( 'NotifBot mentioned you' );
	} );

	describe( 'cross-wiki roll-up', () => {
		function makeSummary( count ) {
			return {
				id: 'summary-foreign',
				isSummary: true,
				count: count,
				category: '',
				categoryLabel: '',
				read: false,
				timestamp: 1700000500,
				iconUrl: '',
				header: 'More notifications from another wiki',
				body: 'Example Wiki',
				primaryUrl: 'https://example.org/wiki/Special:Notifications',
				secondaryLinks: []
			};
		}

		function sourceWithSummary( extraItems = [] ) {
			const local = extraItems.filter( ( i ) => !i.read ).length;
			return makeSource( {
				fetch: vi.fn().mockResolvedValue( {
					items: [ makeSummary( 3 ) ].concat( extraItems ),
					counts: { total: 3 + local, local: local, foreign: 3 }
				} )
			} );
		}

		it( 'never sends a summary row to markRead when clicked', async () => {
			const source = sourceWithSummary();
			const wrapper = mountApp( source );
			await flushPromises();

			await rows( wrapper )[ 0 ].trigger( 'click' );

			expect( source.markRead ).not.toHaveBeenCalled();
		} );

		it( 'never fades a roll-up row, however often it is clicked', async () => {
			const source = sourceWithSummary();
			const wrapper = mountApp( source );
			await flushPromises();

			await rows( wrapper )[ 0 ].trigger( 'click' );
			await wrapper.vm.$nextTick();

			expect( wrapper.findAll( '.citizen-notifications__item--read' ) ).toHaveLength( 0 );
		} );

		it( 'leaves mark-all disabled when only a summary row is unread', async () => {
			const source = sourceWithSummary();
			const wrapper = mountApp( source );
			await flushPromises();

			expect( wrapper.find( '.citizen-notifications__mark-all' ).attributes( 'disabled' ) )
				.toBeDefined();
		} );

		it( 'keeps the summary count in the badge after a local mark-read', async () => {
			const onCountsChange = vi.fn();
			const local = makeItem( 12, false, 1700000400 );
			const source = sourceWithSummary( [ local ] );
			const wrapper = mountApp( source, { onCountsChange } );
			await flushPromises();
			onCountsChange.mockClear();

			// Click the real notification, not the pinned summary.
			await rows( wrapper )[ 1 ].trigger( 'click' );

			expect( source.markRead ).toHaveBeenCalledWith( [ 12 ] );
			// 3 cross-wiki alerts survive; only the local one is cleared.
			expect( onCountsChange ).toHaveBeenLastCalledWith( { total: 3, local: 0, foreign: 3 } );
		} );

		it( 'keeps the summary count after mark-all clears the local rows', async () => {
			const onCountsChange = vi.fn();
			const local = makeItem( 12, false, 1700000400 );
			const source = sourceWithSummary( [ local ] );
			const wrapper = mountApp( source, { onCountsChange } );
			await flushPromises();
			onCountsChange.mockClear();

			await wrapper.find( '.citizen-notifications__mark-all' ).trigger( 'click' );

			expect( onCountsChange ).toHaveBeenLastCalledWith( { total: 3, local: 0, foreign: 3 } );
		} );
	} );
} );
