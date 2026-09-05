// @vitest-environment jsdom
/* global document */

const { createPageTools } = require( '../../../resources/skins.citizen.scripts/pageTools.js' );

const BAR = `
<div class="citizen-page-actions">
	<nav id="p-views" class="citizen-menu mw-portlet mw-portlet-views" aria-label="Views">
		<div class="citizen-menu__heading">Views</div>
		<div class="citizen-menu__content">
			<ul class="citizen-menu__content-list">
				<li id="ca-view" class="mw-list-item"><a href="/wiki/Foo" class="citizen-cdx-button--size-large cdx-button cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--weight-quiet">Read</a></li>
				<li id="ca-ve-edit" class="mw-list-item"><a href="#" class="cdx-button cdx-button--weight-quiet">Edit</a></li>
				<li id="ca-history" class="mw-list-item"><a href="#" class="citizen-cdx-button--size-large cdx-button cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--weight-quiet">View history</a></li>
			</ul>
		</div>
	</nav>
	<nav id="p-associated-pages" class="citizen-menu mw-portlet" aria-label="Associated">
		<div class="citizen-menu__content">
			<ul class="citizen-menu__content-list">
				<li id="ca-talk" class="mw-list-item"><a href="#" class="new citizen-cdx-button--size-large cdx-button cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--weight-quiet">Discussion</a></li>
			</ul>
		</div>
	</nav>
	<div id="citizen-page-more-dropdown">
		<div id="citizen-page-actions-more__card" class="citizen-menu__card">
			<div class="citizen-menu__card-content">
				<nav id="p-cactions"><ul class="citizen-menu__content-list"><li id="ca-move"></li></ul></nav>
			</div>
		</div>
	</div>
</div>`;

function makeWindow( matches ) {
	return {
		matchMedia: () => ( { matches, addEventListener: () => {} } ),
		MutationObserver: class {
			observe() {}
			disconnect() {}
		}
	};
}

const card = () => document.querySelector( '#citizen-page-actions-more__card .citizen-menu__card-content' );
const barIds = () => Array.from( document.querySelectorAll( '.citizen-page-actions > *' ) ).map( ( n ) => n.id );
const cardViewIds = () => Array.from( card().querySelectorAll( 'li' ) ).map( ( n ) => n.id );

describe( 'pageTools', () => {
	beforeEach( () => {
		document.body.innerHTML = BAR;
	} );

	it( 'leaves the bar alone above tablet', () => {
		const tools = createPageTools( { document, window: makeWindow( false ) } );

		tools.init();

		expect( barIds() ).toEqual( [ 'p-views', 'p-associated-pages', 'citizen-page-more-dropdown' ] );
		expect( cardViewIds() ).toEqual( [ 'ca-move' ] );
	} );

	it( 'keeps only the editor in the bar below tablet', () => {
		const tools = createPageTools( { document, window: makeWindow( true ) } );

		tools.init();

		const remaining = Array.from(
			document.querySelectorAll( '#p-views .citizen-menu__content-list > li' )
		).map( ( n ) => n.id );
		expect( remaining ).toEqual( [ 'ca-ve-edit' ] );
	} );

	it( 'moves the displaced views and the associated pages into the card', () => {
		const tools = createPageTools( { document, window: makeWindow( true ) } );

		tools.init();

		expect( cardViewIds() ).toEqual( [ 'ca-view', 'ca-history', 'ca-talk', 'ca-move' ] );
		expect( document.getElementById( 'p-associated-pages' ).closest( '.citizen-menu__card' ) ).not.toBeNull();
	} );

	it( 'gives the displaced views the portlet chrome, without repeating its id', () => {
		const tools = createPageTools( { document, window: makeWindow( true ) } );

		tools.init();

		const shell = document.getElementById( 'ca-view' ).closest( 'nav' );
		expect( shell.id ).toBe( '' );
		expect( shell.getAttribute( 'aria-label' ) ).toBe( 'Views' );
		expect( shell.querySelector( '.citizen-menu__heading' ).textContent.trim() ).toBe( 'Views' );
		expect( document.querySelectorAll( '#p-views' ) ).toHaveLength( 1 );
	} );

	it( 'puts everything back in its original order on the way to desktop', () => {
		const query = { matches: true, addEventListener: () => {} };
		const tools = createPageTools( {
			document,
			window: { matchMedia: () => query, MutationObserver: class {
				observe() {}
			} }
		} );
		tools.init();

		query.matches = false;
		tools.sync();

		expect( barIds() ).toEqual( [ 'p-views', 'p-associated-pages', 'citizen-page-more-dropdown' ] );
		const views = Array.from(
			document.querySelectorAll( '#p-views .citizen-menu__content-list > li' )
		).map( ( n ) => n.id );
		expect( views ).toEqual( [ 'ca-view', 'ca-ve-edit', 'ca-history' ] );
		expect( cardViewIds() ).toEqual( [ 'ca-move' ] );
	} );

	it( 'marks the bar collapsed so the scroll fade can stand down', () => {
		const query = { matches: true, addEventListener: () => {} };
		const tools = createPageTools( {
			document,
			window: { matchMedia: () => query, MutationObserver: class {
				observe() {}
			} }
		} );
		tools.init();
		const bar = document.querySelector( '.citizen-page-actions' );

		expect( bar.classList.contains( 'citizen-page-actions--collapsed' ) ).toBe( true );

		query.matches = false;
		tools.sync();

		expect( bar.classList.contains( 'citizen-page-actions--collapsed' ) ).toBe( false );
	} );

	it( 'builds no shell when the editor is the only view', () => {
		document.getElementById( 'ca-view' ).remove();
		document.getElementById( 'ca-history' ).remove();
		const tools = createPageTools( { document, window: makeWindow( true ) } );

		tools.init();

		expect( card().querySelector( 'nav:not( #p-cactions ):not( #p-associated-pages )' ) ).toBeNull();
	} );

	it( 'sends a tab added after the split into the card, not the bar', async () => {
		// A real observer: the whole point of this path is that it fires on a
		// mutation the skin did not make.
		const tools = createPageTools( {
			document,
			window: { matchMedia: () => ( { matches: true, addEventListener: () => {} } ), MutationObserver }
		} );
		tools.init();

		// what mw.util.addPortletLink does, reduced to its effect
		const late = document.createElement( 'li' );
		late.id = 'ca-gadget';
		late.className = 'mw-list-item';
		late.innerHTML = '<a href="#"><span>Gadget tab</span></a>';
		document.querySelector( '#p-views .citizen-menu__content-list' ).appendChild( late );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( document.getElementById( 'ca-gadget' ).closest( '.citizen-menu__card' ) ).not.toBeNull();
		const inBar = Array.from(
			document.querySelectorAll( '#p-views .citizen-menu__content-list > li' )
		).map( ( n ) => n.id );
		expect( inBar ).toEqual( [ 'ca-ve-edit' ] );
	} );

	it( 'leaves a late editor button in the bar', async () => {
		const tools = createPageTools( {
			document,
			window: { matchMedia: () => ( { matches: true, addEventListener: () => {} } ), MutationObserver }
		} );
		tools.init();

		const late = document.createElement( 'li' );
		late.id = 'ca-edit';
		document.querySelector( '#p-views .citizen-menu__content-list' ).appendChild( late );
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

		expect( document.getElementById( 'ca-edit' ).closest( '.citizen-menu__card' ) ).toBeNull();
	} );

	it( 'takes the button chrome off the rows it moves into the card', () => {
		const tools = createPageTools( { document, window: makeWindow( true ) } );

		tools.init();

		const moved = [ ...card().querySelectorAll( 'li > a' ) ]
			.filter( ( a ) => a.closest( 'li' ).id !== 'ca-move' );
		expect( moved.length ).toBeGreaterThan( 0 );
		moved.forEach( ( a ) => {
			expect( a.className ).not.toMatch( /cdx-button/ );
		} );
		// classes the decorator did not add are left alone
		expect( document.querySelector( '#ca-talk > a' ).classList.contains( 'new' ) ).toBe( true );
	} );

	it( 'leaves the button chrome on what stays in the bar', () => {
		const tools = createPageTools( { document, window: makeWindow( true ) } );

		tools.init();

		expect( document.querySelector( '#ca-ve-edit > a' ).className ).toMatch( /cdx-button/ );
	} );

	it( 'puts the button chrome back on the way to desktop', () => {
		const query = { matches: true, addEventListener: () => {} };
		const tools = createPageTools( {
			document,
			window: { matchMedia: () => query, MutationObserver: class {
				observe() {}
			} }
		} );
		const original = document.querySelector( '#ca-view > a' ).className;
		tools.init();

		query.matches = false;
		tools.sync();

		expect( document.querySelector( '#ca-view > a' ).className ).toBe( original );
		expect( document.querySelector( '#ca-talk > a' ).className ).toMatch( /^new / );
	} );

	it( 'survives a viewport with no matchMedia', () => {
		const tools = createPageTools( { document, window: {} } );

		expect( () => tools.init() ).not.toThrow();
		expect( barIds() ).toEqual( [ 'p-views', 'p-associated-pages', 'citizen-page-more-dropdown' ] );
	} );
} );
