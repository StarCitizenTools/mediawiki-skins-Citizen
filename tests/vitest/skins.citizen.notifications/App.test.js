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
		template: '<div class="cdx-tab" :data-tab="name"><slot /></div>',
		props: [ 'name', 'label' ]
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

// The seen marker sits behind the newest notification, so the panel has
// something to mark; the tests that care override these.
const SEEN_TIME = 1700000000;
const NEWEST_WAITING = 1700000400;

function makeSource( overrides ) {
	return Object.assign( {
		fetch: vi.fn().mockResolvedValue( {
			items: cloneItems(),
			counts: Object.assign( {}, COUNTS ),
			wikis: [],
			seenTime: SEEN_TIME,
			newestWaiting: NEWEST_WAITING
		} ),
		fetchWiki: vi.fn().mockResolvedValue( { items: [] } ),
		// Echo answers with the marker it recorded.
		markSeen: vi.fn().mockResolvedValue( NEWEST_WAITING + 10 ),
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

	it( 'fetches on mount, swapping the skeleton for the list', async () => {
		const source = makeSource();
		const wrapper = mountApp( source );

		// onMounted -> load() sets status loading synchronously.
		expect( wrapper.find( '.citizen-notifications__placeholder-body' ).exists() ).toBe( true );

		await flushPromises();

		expect( source.fetch ).toHaveBeenCalledTimes( 1 );
		expect( wrapper.find( '.citizen-notifications__placeholder-body' ).exists() ).toBe( false );
		expect( rows( wrapper ) ).toHaveLength( 3 );
	} );

	it( 'leaves marking seen to the trigger, which knows when the panel is shown', async () => {
		const source = makeSource();
		const wrapper = mountApp( source );
		await flushPromises();

		// The panel now mounts on hover, so a fetch must not clear the streams.
		expect( source.markSeen ).not.toHaveBeenCalled();

		wrapper.vm.markSeen();

		expect( source.markSeen ).toHaveBeenCalledWith( 'all' );
	} );

	describe( 'marking seen', () => {
		it( 'marks seen on a cold open, before its own first fetch has landed', () => {
			// The trigger marks seen straight after mounting, so this runs with
			// no fetch result yet. Treating that as "nothing waiting" would
			// drop the marker for the whole visit.
			const source = makeSource();
			const wrapper = mountApp( source );

			wrapper.vm.markSeen();

			expect( source.markSeen ).toHaveBeenCalledWith( 'all' );
		} );

		it( 'trusts a server-confirmed zero without waiting for the fetch', () => {
			// The one thing we can answer before fetching: the server rendered
			// a count of zero, so there is nothing for a marker to cover.
			const source = makeSource();
			const wrapper = mountApp( source, { initialCount: 0 } );

			wrapper.vm.markSeen();

			expect( source.markSeen ).not.toHaveBeenCalled();
		} );

		it( 'skips the request when the marker sits exactly on the newest item', async () => {
			const source = makeSource( {
				fetch: vi.fn().mockResolvedValue( {
					items: cloneItems(), counts: Object.assign( {}, COUNTS ), wikis: [],
					seenTime: NEWEST_WAITING, newestWaiting: NEWEST_WAITING
				} )
			} );
			const wrapper = mountApp( source );
			await flushPromises();

			wrapper.vm.markSeen();

			expect( source.markSeen ).not.toHaveBeenCalled();
		} );

		it( 'keeps its own marker when a refresh answers with an older one', async () => {
			const source = makeSource();
			const wrapper = mountApp( source );
			await flushPromises();

			wrapper.vm.markSeen();
			await flushPromises();
			expect( source.markSeen ).toHaveBeenCalledTimes( 1 );

			// A refresh already in flight when the marker was set comes back
			// carrying the older value; adopting it would cost a second mark.
			wrapper.vm.refresh();
			await flushPromises();
			wrapper.vm.markSeen();

			expect( source.markSeen ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'asks once while a mark is still in flight', async () => {
			// Echo marks up to its own clock, so the call already on its way
			// covers anything a second would.
			let settle;
			const source = makeSource( {
				markSeen: vi.fn( () => new Promise( ( resolve ) => {
					settle = resolve;
				} ) )
			} );
			const wrapper = mountApp( source );
			await flushPromises();

			wrapper.vm.markSeen();
			wrapper.vm.markSeen();
			wrapper.vm.markSeen();

			expect( source.markSeen ).toHaveBeenCalledTimes( 1 );

			// Once it lands the guard lifts again, though the marker it carried
			// forward now covers everything waiting.
			settle( NEWEST_WAITING + 10 );
			await flushPromises();
			expect( source.markSeen ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'keeps its previous marker when Echo answers without one', async () => {
			const source = makeSource( { markSeen: vi.fn().mockResolvedValue( 0 ) } );
			const wrapper = mountApp( source );
			await flushPromises();

			wrapper.vm.markSeen();
			await flushPromises();

			// Nothing to carry forward, so the next open asks again rather than
			// recording a marker of zero and skipping forever.
			wrapper.vm.markSeen();

			expect( source.markSeen ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'skips the request when the marker already covers everything waiting', async () => {
			const source = makeSource( {
				fetch: vi.fn().mockResolvedValue( {
					items: cloneItems(),
					counts: Object.assign( {}, COUNTS ),
					wikis: [],
					// Already past the newest notification.
					seenTime: NEWEST_WAITING + 1,
					newestWaiting: NEWEST_WAITING
				} )
			} );
			const wrapper = mountApp( source );
			await flushPromises();

			wrapper.vm.markSeen();

			expect( source.markSeen ).not.toHaveBeenCalled();
		} );

		it( 'skips the request when nothing is waiting at all', async () => {
			const source = makeSource( {
				fetch: vi.fn().mockResolvedValue( {
					items: [], counts: { total: 0, local: 0, foreign: 0 }, wikis: [],
					seenTime: 0, newestWaiting: 0
				} )
			} );
			const wrapper = mountApp( source );
			await flushPromises();

			wrapper.vm.markSeen();

			expect( source.markSeen ).not.toHaveBeenCalled();
		} );

		it( 'marks once, then stops asking until something newer arrives', async () => {
			const source = makeSource();
			const wrapper = mountApp( source );
			await flushPromises();

			// First open: the marker is behind, so Echo is told.
			wrapper.vm.markSeen();
			await flushPromises();
			expect( source.markSeen ).toHaveBeenCalledTimes( 1 );

			// Reopening with nothing new must not ask again — this is the
			// second request per open that the guard exists to remove.
			wrapper.vm.markSeen();
			wrapper.vm.markSeen();

			expect( source.markSeen ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'marks again once a newer notification lands', async () => {
			const source = makeSource();
			const wrapper = mountApp( source );
			await flushPromises();

			wrapper.vm.markSeen();
			await flushPromises();
			expect( source.markSeen ).toHaveBeenCalledTimes( 1 );

			// A refresh brings something newer than the marker Echo returned.
			source.fetch.mockResolvedValueOnce( {
				items: cloneItems(),
				counts: Object.assign( {}, COUNTS ),
				wikis: [],
				seenTime: NEWEST_WAITING + 10,
				newestWaiting: NEWEST_WAITING + 500
			} );
			wrapper.vm.refresh();
			await flushPromises();

			wrapper.vm.markSeen();

			expect( source.markSeen ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'keeps asking when the request fails, rather than assuming it landed', async () => {
			const source = makeSource( {
				markSeen: vi.fn().mockRejectedValue( new Error( 'network' ) )
			} );
			const wrapper = mountApp( source );
			await flushPromises();

			wrapper.vm.markSeen();
			await flushPromises();
			wrapper.vm.markSeen();

			expect( source.markSeen ).toHaveBeenCalledTimes( 2 );
		} );
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
			fetch: vi.fn().mockResolvedValue( { items: [], counts: { total: 0, local: 0, foreign: 0 }, wikis: [] } )
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

		await wrapper.find( '.citizen-notifications__footer-clear' ).trigger( 'click' );

		expect( source.markAllRead ).toHaveBeenCalledWith();
	} );

	it( 'sweeps the rows on clear-all, then empties and flips to caught-up', async () => {
		vi.useFakeTimers();
		try {
			const source = makeSource();
			const wrapper = mountApp( source );
			await flushPromises();

			await wrapper.find( '.citizen-notifications__footer-clear' ).trigger( 'click' );

			// The sweep plays first: rows still present, marked as clearing,
			// and the button is disabled against double fire.
			expect( wrapper.find( '.citizen-notifications__list--clearing' ).exists() ).toBe( true );
			expect( wrapper.findAll( '.citizen-notifications__item' ).length ).toBeGreaterThan( 0 );
			expect( wrapper.find( '.citizen-notifications__footer-clear' ).attributes( 'disabled' ) ).toBeDefined();

			vi.advanceTimersByTime( 600 );
			await wrapper.vm.$nextTick();

			// The emptied panel follows.
			expect( wrapper.findAll( '.citizen-notifications__item' ) ).toHaveLength( 0 );
			expect( wrapper.find( '.citizen-notifications__empty' ).exists() ).toBe( true );
			expect( wrapper.find( '.citizen-notifications__footer-clear' ).exists() ).toBe( false );
			expect( wrapper.find( '.citizen-notifications__footer-history--expanded' ).exists() ).toBe( true );
		} finally {
			vi.useRealTimers();
		}
	} );

	it( 'lets a reopen refetch cancel an in-flight clear-all sweep', async () => {
		vi.useFakeTimers();
		try {
			const source = makeSource();
			const wrapper = mountApp( source );
			await flushPromises();

			await wrapper.find( '.citizen-notifications__footer-clear' ).trigger( 'click' );
			// Reopen mid-sweep: refresh() resolves fresh server data before
			// the sweep's pending swap fires.
			wrapper.vm.refresh();
			await flushPromises();

			expect( wrapper.find( '.citizen-notifications__list--clearing' ).exists() ).toBe( false );
			expect( wrapper.findAll( '.citizen-notifications__item' ) ).toHaveLength( 3 );

			// The cancelled swap must not wipe the fresh list afterwards.
			vi.advanceTimersByTime( 1000 );
			await wrapper.vm.$nextTick();
			expect( wrapper.findAll( '.citizen-notifications__item' ) ).toHaveLength( 3 );
		} finally {
			vi.useRealTimers();
		}
	} );

	it( 'reports count changes to the injected callback', async () => {
		const onCountsChange = vi.fn();
		const source = makeSource();
		const wrapper = mountApp( source, { onCountsChange: onCountsChange } );
		await flushPromises();

		expect( onCountsChange ).toHaveBeenCalledWith( { total: 2, local: 2, foreign: 0 } );

		await wrapper.find( '.citizen-notifications__footer-clear' ).trigger( 'click' );
		await wrapper.vm.$nextTick();
		expect( onCountsChange ).toHaveBeenLastCalledWith( { total: 0, local: 0, foreign: 0 } );
	} );

	it( 'refresh() refetches without showing the skeleton', async () => {
		const source = makeSource();
		const wrapper = mountApp( source );
		await flushPromises();
		expect( source.fetch ).toHaveBeenCalledTimes( 1 );

		wrapper.vm.refresh();
		expect( wrapper.find( '.citizen-notifications__placeholder-body' ).exists() ).toBe( false );
		await flushPromises();
		expect( source.fetch ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'rides an in-flight fetch instead of stacking a second one', async () => {
		// A hover mounts the panel and a click follows before the first fetch
		// has landed: the open must not cost a second request.
		const source = makeSource();
		const wrapper = mountApp( source );

		wrapper.vm.refresh();

		expect( source.fetch ).toHaveBeenCalledTimes( 1 );

		await flushPromises();

		expect( rows( wrapper ) ).toHaveLength( 3 );
	} );

	it( 'keeps a populated panel when a refresh fails', async () => {
		const source = makeSource();
		const wrapper = mountApp( source );
		await flushPromises();

		source.fetch.mockRejectedValueOnce( new Error( 'network' ) );
		wrapper.vm.refresh();
		await flushPromises();

		expect( wrapper.find( '.citizen-notifications__error' ).exists() ).toBe( false );
		expect( rows( wrapper ) ).toHaveLength( 3 );
	} );

	describe( 'server-rendered count', () => {
		const mountWithCount = ( source, initialCount ) => mountApp( source, { initialCount } );

		it( 'opens straight into the empty state when the server says nothing is waiting', async () => {
			const source = makeSource( {
				fetch: vi.fn().mockResolvedValue( {
					items: [], counts: { total: 0, local: 0, foreign: 0 }, wikis: []
				} )
			} );
			const wrapper = mountWithCount( source, 0 );

			// No shimmer at any point: the empty state is the answer, not a
			// step on the way to it.
			expect( wrapper.find( '.citizen-notifications__placeholder-body' ).exists() ).toBe( false );
			expect( wrapper.find( '.citizen-notifications__empty' ).exists() ).toBe( true );

			await flushPromises();

			expect( source.fetch ).toHaveBeenCalledTimes( 1 );
			expect( wrapper.find( '.citizen-notifications__empty' ).exists() ).toBe( true );
		} );

		it( 'fills in a notification that arrived after the page was rendered', async () => {
			const source = makeSource();
			const wrapper = mountWithCount( source, 0 );
			await flushPromises();

			expect( rows( wrapper ) ).toHaveLength( 3 );
		} );

		it( 'keeps the server-confirmed empty state when the confirming fetch fails', async () => {
			const source = makeSource( {
				fetch: vi.fn().mockRejectedValue( new Error( 'network' ) )
			} );
			const wrapper = mountWithCount( source, 0 );
			await flushPromises();

			// The server counted zero; that is a fact worth more than an error.
			expect( wrapper.find( '.citizen-notifications__error' ).exists() ).toBe( false );
			expect( wrapper.find( '.citizen-notifications__empty' ).exists() ).toBe( true );
		} );

		it( 'previews only as many skeleton rows as there are notifications', () => {
			const wrapper = mountWithCount( makeSource(), 2 );

			expect( wrapper.findAll( '.citizen-notifications__placeholder-item' ) ).toHaveLength( 2 );
		} );

		it( 'caps the preview at a panelful for a large count', () => {
			const wrapper = mountWithCount( makeSource(), 40 );

			expect( wrapper.findAll( '.citizen-notifications__placeholder-item' ) ).toHaveLength( 5 );
		} );

		it( 'falls back to a full preview when the count is unknown', () => {
			const wrapper = mountWithCount( makeSource(), null );

			expect( wrapper.findAll( '.citizen-notifications__placeholder-item' ) ).toHaveLength( 5 );
		} );
	} );

	it( 'renders footer links to the notifications and preferences pages', async () => {
		const source = makeSource();
		const wrapper = mountApp( source );
		await flushPromises();

		expect( wrapper.find( '.citizen-notifications__footer-history' ).attributes( 'href' ) ).toContain( 'Special:Notifications' );
		expect( wrapper.find( '.citizen-notifications__footer-prefs' ).attributes( 'href' ) ).toContain( 'Special:Preferences' );
	} );

	describe( 'footer placement', () => {
		const footer = ( wrapper ) => wrapper.find( '.citizen-notifications__footer' );

		it( 'gives the list a footer', async () => {
			const wrapper = mountApp( makeSource() );
			await flushPromises();

			expect( footer( wrapper ).exists() ).toBe( true );
		} );

		it( 'keeps the footer on the empty state', async () => {
			const source = makeSource( {
				fetch: vi.fn().mockResolvedValue( { items: [], counts: { total: 0, local: 0, foreign: 0 }, wikis: [] } )
			} );
			const wrapper = mountApp( source );
			await flushPromises();

			expect( wrapper.find( '.citizen-notifications__empty' ).exists() ).toBe( true );
			expect( footer( wrapper ).exists() ).toBe( true );
		} );

		it( 'leaves the empty state nothing to clear, so the link out takes the row', async () => {
			const source = makeSource( {
				fetch: vi.fn().mockResolvedValue( { items: [], counts: { total: 0, local: 0, foreign: 0 }, wikis: [] } )
			} );
			const wrapper = mountApp( source );
			await flushPromises();

			expect( wrapper.find( '.citizen-notifications__footer-clear' ).exists() ).toBe( false );
			expect( wrapper.find( '.citizen-notifications__footer-history' ).classes() )
				.toContain( 'citizen-notifications__footer-history--expanded' );
		} );

		it( 'scrolls the list under the footer rather than the whole view', async () => {
			const wrapper = mountApp( makeSource() );
			await flushPromises();

			const scroller = wrapper.find( '.citizen-notifications__scroll' );

			expect( scroller.find( '.citizen-notifications__item' ).exists() ).toBe( true );
			expect( scroller.element.nextElementSibling ).toBe( footer( wrapper ).element );
		} );

		it( 'shows the footer while loading, so it does not pop in when the fetch lands', () => {
			const wrapper = mountApp( makeSource() );

			expect( footer( wrapper ).exists() ).toBe( true );
			// Nothing to clear yet, so only the history and preferences links.
			expect( wrapper.find( '.citizen-notifications__footer-clear' ).exists() ).toBe( false );
		} );

		it( 'shows no footer on the error state', async () => {
			const source = makeSource( { fetch: vi.fn().mockRejectedValue( new Error( 'network' ) ) } );
			const wrapper = mountApp( source );
			await flushPromises();

			expect( wrapper.find( '.citizen-notifications__error' ).exists() ).toBe( true );
			expect( footer( wrapper ).exists() ).toBe( false );
		} );
	} );

	it( 'gives each item a stretched primary link labelled by its plain-text header', async () => {
		const item = makeItem( 5, false, 1700000500 );
		item.primaryUrl = '/wiki/Target?markasread=5';
		item.header = '<strong>NotifBot</strong> mentioned you';
		const source = makeSource( {
			fetch: vi.fn().mockResolvedValue( { items: [ item ], counts: { total: 1, local: 1, foreign: 0 }, wikis: [] } )
		} );
		const wrapper = mountApp( source );
		await flushPromises();

		const link = wrapper.find( '.citizen-notifications__item-primary' );
		expect( link.exists() ).toBe( true );
		expect( link.attributes( 'href' ) ).toBe( '/wiki/Target?markasread=5' );
		// Accessible name is the header with markup stripped.
		expect( link.attributes( 'aria-label' ) ).toBe( 'NotifBot mentioned you' );
	} );

	describe( 'other wikis', () => {
		const WIKIS = [
			{ id: 'commons', name: 'Wikimedia Commons', url: 'https://commons.example/wiki/Special:Notifications', apiUrl: 'https://commons.example/w/api.php', timestamp: 1700000500 },
			{ id: 'meta', name: 'Meta', url: 'https://meta.example/wiki/Special:Notifications', apiUrl: 'https://meta.example/w/api.php', timestamp: 1700000100 }
		];

		function sourceWithWikis( wikis = WIKIS ) {
			return makeSource( {
				fetch: vi.fn().mockResolvedValue( {
					items: cloneItems(),
					counts: { total: 7, local: 2, foreign: 5 },
					wikis: wikis
				} )
			} );
		}

		it( 'hides the source switch when there are no other wikis', async () => {
			const wrapper = mountApp( makeSource() );
			await flushPromises();

			expect( wrapper.find( '.cdx-tabs' ).exists() ).toBe( false );
		} );

		it( 'shows the source switch once another wiki has something waiting', async () => {
			const wrapper = mountApp( sourceWithWikis() );
			await flushPromises();

			expect( wrapper.find( '.cdx-tabs' ).exists() ).toBe( true );
		} );

		it( 'keeps this wiki\'s notifications and the wikis in separate tabs', async () => {
			const wrapper = mountApp( sourceWithWikis() );
			await flushPromises();

			expect( wrapper.findAll( '[data-tab="local"] .citizen-notifications__item' ) )
				.toHaveLength( 3 );
			expect( wrapper.findAll( '[data-tab="foreign"] .citizen-notifications__wiki' ) )
				.toHaveLength( 2 );
		} );

		it( 'gives only this wiki\'s tab a footer', async () => {
			const wrapper = mountApp( sourceWithWikis() );
			await flushPromises();

			expect( wrapper.findAll( '[data-tab="local"] .citizen-notifications__footer' ) )
				.toHaveLength( 1 );
			expect( wrapper.findAll( '[data-tab="foreign"] .citizen-notifications__footer' ) )
				.toHaveLength( 0 );
		} );

		it( 'marks every listed wiki as having something waiting', async () => {
			const wrapper = mountApp( sourceWithWikis() );
			await flushPromises();

			// Echo only reports wikis that have unread, so every row is marked.
			expect( wrapper.findAll( '.citizen-notifications__wiki-dot' ) ).toHaveLength( 2 );
		} );

		it( 'names each wiki, most recently active first', async () => {
			const wrapper = mountApp( sourceWithWikis() );
			await flushPromises();
			expect( wrapper.findAll( '.citizen-notifications__wiki-name' ).map( ( w ) => w.text() ) )
				.toEqual( [ 'Wikimedia Commons', 'Meta' ] );
		} );

		it( 'fetches a wiki only when it is opened, and only once', async () => {
			const source = sourceWithWikis();
			source.fetchWiki = vi.fn().mockResolvedValue( {
				items: [ makeItem( 99, false, 1700000900 ) ]
			} );
			const wrapper = mountApp( source );
			await flushPromises();
			expect( source.fetchWiki ).not.toHaveBeenCalled();

			await wrapper.findAll( '.citizen-notifications__wiki' )[ 0 ].trigger( 'click' );
			await flushPromises();

			expect( source.fetchWiki ).toHaveBeenCalledTimes( 1 );
			expect( source.fetchWiki.mock.calls[ 0 ][ 0 ].id ).toBe( 'commons' );
			expect( wrapper.findAll( '[data-tab="foreign"] .citizen-notifications__item' ) )
				.toHaveLength( 1 );

			// Collapse and reopen: still one request.
			await wrapper.findAll( '.citizen-notifications__wiki' )[ 0 ].trigger( 'click' );
			await wrapper.findAll( '.citizen-notifications__wiki' )[ 0 ].trigger( 'click' );
			await flushPromises();

			expect( source.fetchWiki ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'offers the wiki itself when its notifications cannot be fetched', async () => {
			const source = sourceWithWikis();
			source.fetchWiki = vi.fn().mockRejectedValue( new Error( 'no shared login' ) );
			const wrapper = mountApp( source );
			await flushPromises();
			await wrapper.findAll( '.citizen-notifications__wiki' )[ 0 ].trigger( 'click' );
			await flushPromises();

			const link = wrapper.find( '.citizen-notifications__wiki-open' );
			expect( link.exists() ).toBe( true );
			expect( link.attributes( 'href' ) ).toBe( 'https://commons.example/wiki/Special:Notifications' );
		} );

		it( 'offers the wiki itself when it has nothing to show', async () => {
			const source = sourceWithWikis();
			source.fetchWiki = vi.fn().mockResolvedValue( { items: [] } );
			const wrapper = mountApp( source );
			await flushPromises();
			await wrapper.findAll( '.citizen-notifications__wiki' )[ 0 ].trigger( 'click' );
			await flushPromises();

			expect( wrapper.find( '.citizen-notifications__wiki-open' ).exists() ).toBe( true );
		} );

		it( 'marks the open wiki as expanded for assistive tech', async () => {
			const wrapper = mountApp( sourceWithWikis() );
			await flushPromises();
			const first = wrapper.findAll( '.citizen-notifications__wiki' )[ 0 ];
			expect( first.attributes( 'aria-expanded' ) ).toBe( 'false' );

			await first.trigger( 'click' );
			await flushPromises();

			expect( wrapper.findAll( '.citizen-notifications__wiki' )[ 0 ].attributes( 'aria-expanded' ) )
				.toBe( 'true' );
		} );

		it( 'falls back to this wiki when the other wikis go away', async () => {
			const source = sourceWithWikis();
			const wrapper = mountApp( source );
			await flushPromises();
			expect( wrapper.find( '.citizen-notifications__wikis' ).exists() ).toBe( true );

			source.fetch.mockResolvedValue( {
				items: cloneItems(), counts: { total: 2, local: 2, foreign: 0 }, wikis: []
			} );
			wrapper.vm.refresh();
			await flushPromises();

			expect( wrapper.find( '.cdx-tabs' ).exists() ).toBe( false );
			expect( wrapper.findAll( '.citizen-notifications__item' ) ).toHaveLength( 3 );
		} );

		it( 'keeps the elsewhere count in the badge after a local mark-read', async () => {
			const onCountsChange = vi.fn();
			const source = sourceWithWikis();
			const wrapper = mountApp( source, { onCountsChange } );
			await flushPromises();
			onCountsChange.mockClear();

			await rows( wrapper )[ 0 ].trigger( 'click' );

			// One local notification cleared; the five elsewhere are untouched.
			expect( onCountsChange ).toHaveBeenLastCalledWith( { total: 6, local: 1, foreign: 5 } );
		} );

		it( 'keeps the elsewhere count after mark-all clears the local rows', async () => {
			const onCountsChange = vi.fn();
			const source = sourceWithWikis();
			const wrapper = mountApp( source, { onCountsChange } );
			await flushPromises();
			onCountsChange.mockClear();

			await wrapper.find( '.citizen-notifications__footer-clear' ).trigger( 'click' );

			expect( onCountsChange ).toHaveBeenLastCalledWith( { total: 5, local: 0, foreign: 5 } );
		} );
	} );
} );
