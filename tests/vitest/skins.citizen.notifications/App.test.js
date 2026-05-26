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
	CdxTabs: {
		name: 'CdxTabs',
		template: '<div class="cdx-tabs"><slot /></div>',
		props: [ 'active', 'framed' ],
		emits: [ 'update:active' ]
	},
	CdxTab: {
		name: 'CdxTab',
		// Renders its panel slot in a [data-tab] wrapper so each tab's
		// filtered list is queryable (the stub does not hide inactive tabs).
		template: '<div class="cdx-tab" :data-tab="name"><slot /></div>',
		props: [ 'name', 'label' ]
	}
} ) );

let App;

beforeAll( async () => {
	const mod = await import( '../../../resources/skins.citizen.notifications/components/App.vue' );
	App = mod.default;
} );

function makeItem( id, section, read, timestamp ) {
	return {
		id: id,
		section: section,
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
	makeItem( 12, 'alert', false, 1700000400 ),
	makeItem( 21, 'message', false, 1700000300 ),
	makeItem( 11, 'alert', true, 1700000200 )
];
const COUNTS = { alert: 1, message: 1, total: 2 };

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
	const inTab = ( wrapper, name ) => wrapper.findAll( `[data-tab="${ name }"] .citizen-notifications__item` );

	it( 'fetches and marks seen on mount, swapping skeleton for the tabs', async () => {
		const source = makeSource();
		const wrapper = mountApp( source );

		// onMounted -> load() sets status loading synchronously.
		expect( wrapper.find( '.citizen-notifications__skeleton' ).exists() ).toBe( true );

		await flushPromises();

		expect( source.fetch ).toHaveBeenCalledTimes( 1 );
		expect( source.markSeen ).toHaveBeenCalledWith( 'all' );
		expect( wrapper.find( '.citizen-notifications__skeleton' ).exists() ).toBe( false );
		expect( wrapper.find( '.cdx-tabs' ).exists() ).toBe( true );
		expect( inTab( wrapper, 'all' ) ).toHaveLength( 3 );
	} );

	it( 'renders each tab filtered to its section', async () => {
		const source = makeSource();
		const wrapper = mountApp( source );
		await flushPromises();

		expect( inTab( wrapper, 'all' ) ).toHaveLength( 3 );
		expect( inTab( wrapper, 'alert' ) ).toHaveLength( 2 );
		expect( inTab( wrapper, 'message' ) ).toHaveLength( 1 );
	} );

	it( 'shows an empty state when the active segment has no items', async () => {
		const source = makeSource( {
			fetch: vi.fn().mockResolvedValue( { items: [], counts: { alert: 0, message: 0, total: 0 } } )
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
		expect( inTab( wrapper, 'all' ) ).toHaveLength( 3 );
	} );

	it( 'marks an item read on click and clears its unread state', async () => {
		const source = makeSource();
		const wrapper = mountApp( source );
		await flushPromises();

		// First item in the All tab is the newest unread alert (id 12).
		await inTab( wrapper, 'all' )[ 0 ].trigger( 'click' );

		expect( source.markRead ).toHaveBeenCalledWith( [ 12 ] );
		await wrapper.vm.$nextTick();
		expect( wrapper.findAll( '[data-tab="all"] .citizen-notifications__item--unread' ).length ).toBe( 1 );
	} );

	it( 'marks all read with a null scope on the All segment', async () => {
		const source = makeSource();
		const wrapper = mountApp( source );
		await flushPromises();

		await wrapper.find( '.citizen-notifications__mark-all' ).trigger( 'click' );

		expect( source.markAllRead ).toHaveBeenCalledWith( null );
	} );

	it( 'scopes mark-all to a section when a section segment is active', async () => {
		const source = makeSource();
		const wrapper = mountApp( source );
		await flushPromises();

		wrapper.vm.activeTab = 'alert';
		await wrapper.vm.$nextTick();
		await wrapper.find( '.citizen-notifications__mark-all' ).trigger( 'click' );

		expect( source.markAllRead ).toHaveBeenCalledWith( 'alert' );
	} );

	it( 'reports count changes to the injected callback', async () => {
		const onCountsChange = vi.fn();
		const source = makeSource();
		const wrapper = mountApp( source, { onCountsChange: onCountsChange } );
		await flushPromises();

		expect( onCountsChange ).toHaveBeenCalledWith( { alert: 1, message: 1, total: 2 } );

		await wrapper.find( '.citizen-notifications__mark-all' ).trigger( 'click' );
		await wrapper.vm.$nextTick();
		expect( onCountsChange ).toHaveBeenLastCalledWith( { alert: 0, message: 0, total: 0 } );
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
		const item = makeItem( 5, 'alert', false, 1700000500 );
		item.primaryUrl = '/wiki/Target?markasread=5';
		item.header = '<strong>NotifBot</strong> mentioned you';
		const source = makeSource( {
			fetch: vi.fn().mockResolvedValue( { items: [ item ], counts: { alert: 1, message: 0, total: 1 } } )
		} );
		const wrapper = mountApp( source );
		await flushPromises();

		const link = wrapper.find( '.citizen-notifications__item-primary' );
		expect( link.exists() ).toBe( true );
		expect( link.attributes( 'href' ) ).toBe( '/wiki/Target?markasread=5' );
		// Accessible name is the header with markup stripped.
		expect( link.attributes( 'aria-label' ) ).toBe( 'NotifBot mentioned you' );
	} );
} );
