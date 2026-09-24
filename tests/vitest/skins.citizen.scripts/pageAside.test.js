// @vitest-environment jsdom

const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

const { createPageAside } = require( '../../../resources/skins.citizen.scripts/pageAside.js' );

const HOOK = 'citizen.pageAside.register';

const LASTMOD = `
	<div id="citizen-page-aside-lastmod" class="citizen-page-aside__panel citizen-page-aside__panel--lastmod" data-order="10">
		<div id="citizen-page-aside-lastmod-heading" class="citizen-page-aside__heading">Last modified</div>
		<div class="citizen-page-aside__body"></div>
	</div>`;

const TOC = `
	<nav id="citizen-toc" class="citizen-toc citizen-dropdown citizen-page-aside__panel citizen-page-aside__panel--toc" data-order="20" aria-labelledby="citizen-page-aside-toc-heading">
		<div id="citizen-page-aside-toc-heading" class="citizen-page-aside__heading">Contents</div>
		<details class="citizen-dropdown-details"><summary class="citizen-dropdown-summary">Contents</summary></details>
		<div id="mw-panel-toc" class="citizen-page-aside__body citizen-toc-card citizen-menu__card"></div>
	</nav>`;

const ASIDE = `
<aside class="citizen-page-aside" aria-label="Side column">${ LASTMOD }
	<div class="citizen-page-aside__sticky">${ TOC }
	</div>
</aside>`;

// A page whose only panel scrolls with it, so no sticky block is rendered.
const STICKY_LESS_ASIDE = `
<aside class="citizen-page-aside" aria-label="Side column">${ LASTMOD }
</aside>`;

// Markup from before the sticky block and data-order existed: the outline is
// a direct child of the aside and no panel carries the attribute.
const STALE_ASIDE = `
<aside class="citizen-page-aside" aria-label="Side column">${ LASTMOD }${ TOC }
</aside>`.replace( / data-order="\d+"/g, '' );

/**
 * @param {string} html
 * @return {Function} the register function the hook delivered
 */
function initWith( html ) {
	document.body.innerHTML = html;
	createPageAside( { document, mw } ).init();
	let register;
	mw.hook( HOOK ).add( ( data ) => {
		register = data.register;
	} );
	return register;
}

const panelIds = () => Array.from( document.querySelector( '.citizen-page-aside' ).children ).map( ( el ) => el.id );

describe( 'createPageAside', () => {
	beforeEach( () => {
		mw.hook( HOOK )._reset();
		mw.log.warn.mockClear();
	} );

	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'fires the hook once with an object exposing register', () => {
		document.body.innerHTML = ASIDE;

		createPageAside( { document, mw } ).init();

		const hook = mw.hook( HOOK );
		expect( hook.fire ).toHaveBeenCalledTimes( 1 );
		expect( typeof hook.fire.mock.calls[ 0 ][ 0 ].register ).toBe( 'function' );
	} );

	it( 'fires the hook even when the page has no aside', () => {
		document.body.innerHTML = '<div id="content"></div>';

		createPageAside( { document, mw } ).init();

		expect( mw.hook( HOOK ).fire ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'builds the panel chrome and returns its body', () => {
		const register = initWith( ASIDE );

		const body = register( { id: 'recent-changes', label: 'Recent changes', order: 15 } );

		const root = document.getElementById( 'citizen-page-aside-recent-changes' );
		expect( root.tagName ).toBe( 'DIV' );
		expect( root.className ).toBe( 'citizen-page-aside__panel citizen-page-aside__panel--recent-changes' );
		expect( root.dataset.order ).toBe( '15' );
		expect( root.children.length ).toBe( 2 );
		const [ heading, actualBody ] = root.children;
		expect( heading.tagName ).toBe( 'DIV' );
		expect( heading.id ).toBe( 'citizen-page-aside-recent-changes-heading' );
		expect( heading.className ).toBe( 'citizen-page-aside__heading' );
		expect( heading.textContent ).toBe( 'Recent changes' );
		expect( actualBody ).toBe( body );
		expect( body.tagName ).toBe( 'DIV' );
		expect( body.className ).toBe( 'citizen-page-aside__body' );
		expect( body.children.length ).toBe( 0 );
		expect( mw.log.warn ).not.toHaveBeenCalled();
	} );

	it( 'sets the label as text, never markup', () => {
		const register = initWith( ASIDE );

		register( { id: 'x', label: '<b>Bold</b>' } );

		const heading = document.getElementById( 'citizen-page-aside-x-heading' );
		expect( heading.textContent ).toBe( '<b>Bold</b>' );
		expect( heading.children.length ).toBe( 0 );
	} );

	it( 'places flow panels by order but never past the sticky block', () => {
		const register = initWith( ASIDE );

		register( { id: 'after', label: 'After' } );
		register( { id: 'early', label: 'Early', order: 5 } );
		register( { id: 'huge', label: 'Huge', order: 500 } );

		expect( panelIds() ).toEqual( [
			'citizen-page-aside-early',
			'citizen-page-aside-lastmod',
			'citizen-page-aside-after',
			'citizen-page-aside-huge',
			''
		] );
		expect( document.querySelector( '.citizen-page-aside__sticky' ) ).toBe( document.querySelector( '.citizen-page-aside' ).lastElementChild );
		expect( document.getElementById( 'citizen-page-aside-after' ).dataset.order ).toBe( '100' );
	} );

	it( 'places an explicit flow panel exactly like an omitted placement', () => {
		const register = initWith( ASIDE );

		const body = register( { id: 'notes', label: 'Notes', placement: 'flow' } );

		expect( body.parentElement.parentElement ).toBe( document.querySelector( '.citizen-page-aside' ) );
		expect( panelIds() ).toEqual( [ 'citizen-page-aside-lastmod', 'citizen-page-aside-notes', '' ] );
		expect( document.querySelector( '.citizen-page-aside__sticky' ).children.length ).toBe( 1 );
		expect( mw.log.warn ).not.toHaveBeenCalled();
	} );

	it( 'places sticky panels by order inside the sticky block', () => {
		const register = initWith( ASIDE );

		register( { id: 'top', label: 'Top', placement: 'sticky', order: 10 } );
		register( { id: 'bottom', label: 'Bottom', placement: 'sticky' } );

		const block = document.querySelector( '.citizen-page-aside__sticky' );
		expect( Array.from( block.children ).map( ( el ) => el.id ) ).toEqual( [ 'citizen-page-aside-top', 'citizen-toc', 'citizen-page-aside-bottom' ] );
		expect( panelIds() ).toEqual( [ 'citizen-page-aside-lastmod', '' ] );
	} );

	it( 'creates the sticky block when the page has none', () => {
		const register = initWith( STICKY_LESS_ASIDE );

		const body = register( { id: 'notes', label: 'Notes', placement: 'sticky' } );

		const aside = document.querySelector( '.citizen-page-aside' );
		const block = aside.lastElementChild;
		expect( block.className ).toBe( 'citizen-page-aside__sticky' );
		expect( block.children.length ).toBe( 1 );
		expect( block.firstElementChild ).toBe( body.parentElement );
		expect( aside.children.length ).toBe( 2 );
	} );

	it( 'keeps registration order for equal orders and places before the first greater', () => {
		const register = initWith( ASIDE );

		register( { id: 'first', label: 'First', order: 15 } );
		register( { id: 'second', label: 'Second', order: 15 } );
		register( { id: 'early', label: 'Early', order: 5 } );

		expect( panelIds() ).toEqual( [
			'citizen-page-aside-early',
			'citizen-page-aside-lastmod',
			'citizen-page-aside-first',
			'citizen-page-aside-second',
			''
		] );
	} );

	it( 'keeps flow panels ahead of an outline that is still a direct child', () => {
		const register = initWith( STALE_ASIDE );

		register( { id: 'between', label: 'Between' } );

		expect( panelIds() ).toEqual( [ 'citizen-page-aside-lastmod', 'citizen-page-aside-between', 'citizen-toc' ] );
	} );

	it( 'returns null without warning when the page has no aside', () => {
		const register = initWith( '<div id="content"></div>' );

		expect( register( { id: 'x', label: 'X' } ) ).toBeNull();
		expect( mw.log.warn ).not.toHaveBeenCalled();
	} );

	it( 'still warns about a malformed definition when the page has no aside', () => {
		const register = initWith( '<div id="content"></div>' );

		const result = register( { id: 'Bad', label: 'X' } );

		expect( result ).toBeNull();
		expect( mw.log.warn ).toHaveBeenCalledTimes( 1 );
		expect( mw.log.warn.mock.calls[ 0 ][ 0 ] ).toMatch( /^citizen\.pageAside\.register: / );
	} );

	it.each( [
		[ 'a non-object', 'nope' ],
		[ 'an array', [ 'x', 'X' ] ],
		[ 'an uppercase id', { id: 'Recent', label: 'X' } ],
		[ 'an id starting with a digit', { id: '1x', label: 'X' } ],
		[ 'an empty id', { id: '', label: 'X' } ],
		[ 'a missing label', { id: 'x' } ],
		[ 'a blank label', { id: 'x', label: '   ' } ],
		[ 'a NaN order', { id: 'x', label: 'X', order: NaN } ],
		[ 'a string order', { id: 'x', label: 'X', order: '15' } ],
		[ 'an unknown placement', { id: 'x', label: 'X', placement: 'pinned' } ]
	] )( 'refuses %s with one warning and adds nothing', ( _name, definition ) => {
		const register = initWith( ASIDE );

		const result = register( definition );

		expect( result ).toBeNull();
		expect( mw.log.warn ).toHaveBeenCalledTimes( 1 );
		expect( mw.log.warn.mock.calls[ 0 ][ 0 ] ).toMatch( /^citizen\.pageAside\.register: / );
		expect( panelIds() ).toEqual( [ 'citizen-page-aside-lastmod', '' ] );
		expect( document.querySelectorAll( '.citizen-page-aside__panel' ).length ).toBe( 2 );
	} );

	it( 'refuses a duplicate id, including a built-in one', () => {
		const register = initWith( ASIDE );

		register( { id: 'x', label: 'X' } );
		mw.log.warn.mockClear();

		expect( register( { id: 'x', label: 'Again' } ) ).toBeNull();
		expect( register( { id: 'lastmod', label: 'Again' } ) ).toBeNull();
		expect( register( { id: 'toc', label: 'Again' } ) ).toBeNull();
		expect( mw.log.warn ).toHaveBeenCalledTimes( 3 );
		expect( mw.log.warn.mock.calls[ 0 ][ 0 ] ).toContain( '"x"' );
		expect( document.querySelectorAll( '.citizen-page-aside__panel--x' ).length ).toBe( 1 );
		expect( document.querySelectorAll( '#citizen-page-aside-toc-heading' ).length ).toBe( 1 );
	} );

	it( 'delivers register to a late subscriber', () => {
		document.body.innerHTML = ASIDE;
		createPageAside( { document, mw } ).init();

		let received;
		mw.hook( HOOK ).add( ( data ) => {
			received = data;
		} );

		expect( typeof received.register ).toBe( 'function' );
	} );
} );
