// @vitest-environment jsdom
/* global document */

const { createSectionLabel } = require( '../../../resources/skins.citizen.toc/sectionLabel.js' );

const FIXTURE = `
<div id="citizen-toc" class="citizen-toc citizen-dropdown">
	<details class="citizen-dropdown-details">
		<summary class="citizen-dropdown-summary">
			<span class="citizen-ui-icon mw-ui-icon-wikimedia-listBullet"></span>
			<span>Contents</span>
		</summary>
	</details>
	<nav id="mw-panel-toc">
		<li id="toc-History" class="citizen-toc-list-item"><a><span class="citizen-toc-heading">History</span></a></li>
		<li id="toc-Care" class="citizen-toc-list-item"><a><span class="citizen-toc-heading">Care</span></a></li>
		<li id="toc-Health" class="citizen-toc-list-item"><a><span class="citizen-toc-heading">Health</span></a></li>
	</nav>
</div>`;

const win = ( reduced = false ) => ( {
	matchMedia: () => ( { matches: reduced } )
} );

const toc = () => document.getElementById( 'citizen-toc' );
const track = () => document.querySelector( '.citizen-toc-current__track' );
const lines = () => Array.from( document.querySelectorAll( '.citizen-toc-current__line' ) );

describe( 'sectionLabel', () => {
	beforeEach( () => {
		document.body.innerHTML = FIXTURE;
	} );

	it( 'gives the control a value slot without disturbing its label', () => {
		const label = createSectionLabel( { document, window: win() } );

		expect( label.init() ).toBe( true );

		const summary = document.querySelector( '.citizen-dropdown-summary' );
		// A span here would be caught by the rule that screen-reader-onlys the
		// "Contents" label beside it.
		expect( document.querySelector( '.citizen-toc-current' ).tagName ).toBe( 'DIV' );
		expect( summary.querySelector( '.citizen-toc-current' ).getAttribute( 'aria-hidden' ) ).toBe( 'true' );
		expect( summary.textContent ).toContain( 'Contents' );
	} );

	it( 'does nothing on a page with no contents control', () => {
		document.body.innerHTML = '<div></div>';
		const label = createSectionLabel( { document, window: win() } );

		expect( label.init() ).toBe( false );
		expect( () => label.update( 'toc-History' ) ).not.toThrow();
	} );

	it( 'shows the section and marks the control as tracking', () => {
		const label = createSectionLabel( { document, window: win() } );
		label.init();

		label.update( 'toc-Care' );

		expect( track().textContent ).toBe( 'Care' );
		expect( toc().classList.contains( 'citizen-toc--tracking' ) ).toBe( true );
	} );

	it( 'falls back to no value in the lead, where there is no section yet', () => {
		const label = createSectionLabel( { document, window: win() } );
		label.init();
		label.update( 'toc-Care' );

		label.update( null );

		expect( track().textContent ).toBe( '' );
		expect( toc().classList.contains( 'citizen-toc--tracking' ) ).toBe( false );
	} );

	it( 'pushes the arriving label the way the reader is travelling', () => {
		const label = createSectionLabel( { document, window: win() } );
		label.init();
		label.update( 'toc-History' );

		label.update( 'toc-Health' );

		const [ leaving, entering ] = lines();
		expect( leaving.classList.contains( 'is-leaving-above' ) ).toBe( true );
		expect( entering.classList.contains( 'is-entering-below' ) ).toBe( true );
	} );

	it( 'reverses the push when the reader scrolls back up', () => {
		const label = createSectionLabel( { document, window: win() } );
		label.init();
		label.update( 'toc-Health' );

		label.update( 'toc-History' );

		const [ leaving, entering ] = lines();
		expect( leaving.classList.contains( 'is-leaving-below' ) ).toBe( true );
		expect( entering.classList.contains( 'is-entering-above' ) ).toBe( true );
	} );

	it( 'swaps without animating under reduced motion', () => {
		const label = createSectionLabel( { document, window: win( true ) } );
		label.init();
		label.update( 'toc-History' );

		label.update( 'toc-Care' );

		expect( lines() ).toHaveLength( 1 );
		expect( lines()[ 0 ].className ).toBe( 'citizen-toc-current__line' );
		expect( track().textContent ).toBe( 'Care' );
	} );

	it( 'takes the leaving label out once its animation ends', () => {
		const label = createSectionLabel( { document, window: win() } );
		label.init();
		label.update( 'toc-History' );
		label.update( 'toc-Care' );
		const leaving = lines().find( ( l ) => l.classList.contains( 'is-leaving' ) );

		leaving.dispatchEvent( new window.Event( 'animationend' ) );

		expect( lines() ).toHaveLength( 1 );
		expect( track().textContent ).toBe( 'Care' );
	} );

	it( 'follows the row the card marks active, whoever activated it', () => {
		const label = createSectionLabel( { document, window: win() } );
		label.init();
		// what a hash load or a post-VisualEditor rebuild leaves behind: the
		// card marked, with no scroll event to follow
		document.getElementById( 'toc-Health' ).classList.add( 'citizen-toc-list-item--active' );

		label.syncFromCard();

		expect( track().textContent ).toBe( 'Health' );
		expect( toc().classList.contains( 'citizen-toc--tracking' ) ).toBe( true );
	} );

	it( 'clears the value when the card marks nothing', () => {
		const label = createSectionLabel( { document, window: win() } );
		label.init();
		label.update( 'toc-Care' );

		label.syncFromCard();

		expect( track().textContent ).toBe( '' );
		expect( toc().classList.contains( 'citizen-toc--tracking' ) ).toBe( false );
	} );

	it( 'ignores a repeat of the section already shown', () => {
		const label = createSectionLabel( { document, window: win() } );
		label.init();
		label.update( 'toc-Care' );

		label.update( 'toc-Care' );

		expect( lines() ).toHaveLength( 1 );
	} );
} );
