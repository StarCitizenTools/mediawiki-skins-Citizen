// @vitest-environment jsdom

const { mount, flushPromises } = require( '@vue/test-utils' );
// Require vue (CJS) before the SFC dynamic import so both resolve to one
// Vue instance — otherwise @vue/test-utils' mount throws `app.onUnmount`.
require( 'vue' );
const mw = require( '../mocks/mw.js' );
const { setCodexStubs } = require( '../mocks/codex.js' );
globalThis.mw = mw;

setCodexStubs( {
	CdxIcon: {
		name: 'CdxIcon',
		template: '<span class="cdx-icon"></span>',
		props: [ 'icon' ]
	}
} );

let WikiList;

beforeAll( async () => {
	const mod = await import( '../../../resources/skins.citizen.notifications/components/WikiList.vue' );
	WikiList = mod.default;
} );

const COMMONS = {
	id: 'commons',
	name: 'Wikimedia Commons',
	url: 'https://commons.example/wiki/Special:Notifications',
	apiUrl: 'https://commons.example/w/api.php',
	timestamp: 1700000500
};
const META = {
	id: 'meta',
	name: 'Meta',
	url: 'https://meta.example/wiki/Special:Notifications',
	apiUrl: 'https://meta.example/w/api.php',
	timestamp: 1700000100
};

function makeItem( id ) {
	return {
		id: id,
		category: 'mention',
		categoryLabel: 'Mention',
		read: false,
		timestamp: 1700000900,
		iconUrl: '',
		header: 'Notification ' + id,
		body: '',
		primaryUrl: '',
		secondaryLinks: []
	};
}

/**
 * Mount the list with a controllable fetch.
 *
 * @param {Object} [options]
 * @param {Array} [options.wikis]
 * @param {Function} [options.fetchWiki]
 * @return {Object} wrapper
 */
function mountList( options = {} ) {
	return mount( WikiList, {
		props: {
			wikis: options.wikis || [ COMMONS, META ],
			fetchWiki: options.fetchWiki ||
				vi.fn().mockResolvedValue( { items: [ makeItem( 1 ) ] } )
		}
	} );
}

const rows = ( wrapper ) => wrapper.findAll( '.citizen-notifications__wiki' );

/**
 * Capture unhandled promise rejections for the duration of a test. A late
 * reply writing to state that has been cleared throws inside the promise
 * chain, where nothing surfaces it — so it has to be watched for explicitly.
 *
 * @return {{ errors: Error[], stop: Function }}
 */
function watchUnhandled() {
	const errors = [];
	const onRejection = ( error ) => errors.push( error );
	process.on( 'unhandledRejection', onRejection );
	return {
		errors,
		stop: () => process.off( 'unhandledRejection', onRejection )
	};
}

describe( 'WikiList', () => {
	it( 'lists every wiki, collapsed, without fetching anything', async () => {
		const fetchWiki = vi.fn();
		const wrapper = mountList( { fetchWiki } );

		expect( rows( wrapper ) ).toHaveLength( 2 );
		expect( rows( wrapper )[ 0 ].attributes( 'aria-expanded' ) ).toBe( 'false' );
		expect( fetchWiki ).not.toHaveBeenCalled();
	} );

	it( 'fetches a wiki when it is opened, and shows what came back', async () => {
		const fetchWiki = vi.fn().mockResolvedValue( { items: [ makeItem( 1 ), makeItem( 2 ) ] } );
		const wrapper = mountList( { fetchWiki } );

		await rows( wrapper )[ 0 ].trigger( 'click' );
		await flushPromises();

		expect( fetchWiki ).toHaveBeenCalledTimes( 1 );
		expect( fetchWiki.mock.calls[ 0 ][ 0 ].id ).toBe( 'commons' );
		expect( wrapper.findAll( '.citizen-notifications__item' ) ).toHaveLength( 2 );
	} );

	it( 'offers the wiki itself alongside the preview, not only instead of it', async () => {
		const wrapper = mountList();

		await rows( wrapper )[ 0 ].trigger( 'click' );
		await flushPromises();

		expect( wrapper.findAll( '.citizen-notifications__item' ).length ).toBeGreaterThan( 0 );
		expect( wrapper.find( '.citizen-notifications__wiki-open' ).attributes( 'href' ) )
			.toBe( COMMONS.url );
	} );

	it( 'offers the wiki when it refuses to answer', async () => {
		const fetchWiki = vi.fn().mockRejectedValue( new Error( 'no shared login' ) );
		const wrapper = mountList( { fetchWiki } );

		await rows( wrapper )[ 0 ].trigger( 'click' );
		await flushPromises();

		expect( wrapper.find( '.citizen-notifications__wiki-status' ).text() )
			.toContain( 'citizen-notifications-wiki-unavailable' );
		expect( wrapper.find( '.citizen-notifications__wiki-open' ).exists() ).toBe( true );
	} );

	it( 'collapses and reopens without asking again', async () => {
		const fetchWiki = vi.fn().mockResolvedValue( { items: [ makeItem( 1 ) ] } );
		const wrapper = mountList( { fetchWiki } );

		await rows( wrapper )[ 0 ].trigger( 'click' );
		await flushPromises();
		await rows( wrapper )[ 0 ].trigger( 'click' );
		await rows( wrapper )[ 0 ].trigger( 'click' );
		await flushPromises();

		expect( fetchWiki ).toHaveBeenCalledTimes( 1 );
		expect( rows( wrapper )[ 0 ].attributes( 'aria-expanded' ) ).toBe( 'true' );
	} );

	it( 'keeps an open wiki open when the panel refetches the same wikis', async () => {
		const fetchWiki = vi.fn().mockResolvedValue( { items: [ makeItem( 1 ) ] } );
		const wrapper = mountList( { fetchWiki } );
		await rows( wrapper )[ 0 ].trigger( 'click' );
		await flushPromises();

		// Every fetch hands over a fresh array; the roster is unchanged.
		await wrapper.setProps( { wikis: [ Object.assign( {}, COMMONS ), Object.assign( {}, META ) ] } );
		await flushPromises();

		expect( rows( wrapper )[ 0 ].attributes( 'aria-expanded' ) ).toBe( 'true' );
		expect( fetchWiki ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'starts over when the wikis themselves change', async () => {
		const wrapper = mountList();
		await rows( wrapper )[ 0 ].trigger( 'click' );
		await flushPromises();
		expect( rows( wrapper )[ 0 ].attributes( 'aria-expanded' ) ).toBe( 'true' );

		await wrapper.setProps( { wikis: [ META ] } );
		await flushPromises();

		expect( rows( wrapper ) ).toHaveLength( 1 );
		expect( rows( wrapper )[ 0 ].attributes( 'aria-expanded' ) ).toBe( 'false' );
	} );

	it( 'survives the wikis changing while a wiki is still loading', async () => {
		const watcher = watchUnhandled();
		let settle;
		const fetchWiki = vi.fn( () => new Promise( ( resolve ) => {
			settle = resolve;
		} ) );
		const wrapper = mountList( { fetchWiki } );
		await rows( wrapper )[ 0 ].trigger( 'click' );

		// The roster changes out from under the in-flight request.
		await wrapper.setProps( { wikis: [ META ] } );
		settle( { items: [ makeItem( 1 ) ] } );
		await flushPromises();
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
		watcher.stop();

		// The late reply must not throw, nor resurrect a wiki no longer listed.
		expect( watcher.errors ).toEqual( [] );
		expect( rows( wrapper ) ).toHaveLength( 1 );
		expect( wrapper.findAll( '.citizen-notifications__item' ) ).toHaveLength( 0 );
	} );

	it( 'survives a refusal arriving after the wikis changed', async () => {
		const watcher = watchUnhandled();
		let fail;
		const fetchWiki = vi.fn( () => new Promise( ( resolve, reject ) => {
			fail = reject;
		} ) );
		const wrapper = mountList( { fetchWiki } );
		await rows( wrapper )[ 0 ].trigger( 'click' );

		await wrapper.setProps( { wikis: [ META ] } );
		fail( new Error( 'no shared login' ) );
		await flushPromises();
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
		watcher.stop();

		expect( watcher.errors ).toEqual( [] );
		expect( rows( wrapper ) ).toHaveLength( 1 );
		expect( wrapper.find( '.citizen-notifications__wiki-status' ).exists() ).toBe( false );
	} );

	it( 'marks every listed wiki as having something waiting', () => {
		const wrapper = mountList();

		expect( wrapper.findAll( '.citizen-notifications__wiki-dot' ) ).toHaveLength( 2 );
	} );
} );
