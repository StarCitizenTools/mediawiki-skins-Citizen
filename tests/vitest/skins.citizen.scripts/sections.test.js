// @vitest-environment jsdom
/* global document */

const { createSections } = require( '../../../resources/skins.citizen.scripts/sections.js' );

/**
 * @param {string} innerHTML
 * @return {HTMLElement}
 */
function createBodyContent( innerHTML ) {
	document.body.classList.add( 'citizen-sections-enabled' );
	const bodyContent = document.createElement( 'div' );
	bodyContent.innerHTML = innerHTML;
	document.body.appendChild( bodyContent );
	createSections( { document, bodyContent } ).init();
	return bodyContent;
}

function click( el ) {
	el.dispatchEvent( new Event( 'click', { bubbles: true } ) );
}

afterEach( () => {
	document.body.className = '';
	document.body.innerHTML = '';
} );

describe( 'createSections', () => {
	describe( 'converged legacy sections (heading inside section)', () => {
		const CONVERGED = `
			<div class="mw-parser-output">
				<section id="citizen-section-0" class="citizen-section"><p>Lead</p></section>
				<section id="citizen-section-1" class="citizen-section">
					<div class="mw-heading citizen-section-heading"><h2 id="Foo">Foo</h2>
						<span class="mw-editsection"><a href="#">edit</a></span>
					</div>
					<p>Bar</p>
					<section id="citizen-section-2" class="citizen-section">
						<h3 class="citizen-section-heading" id="Sub">Sub</h3>
						<p>Nested</p>
					</section>
				</section>
			</div>
		`;

		it( 'should toggle a converged section from its heading', () => {
			const bodyContent = createBodyContent( CONVERGED );
			const section = bodyContent.querySelector( '#citizen-section-1' );
			const heading = section.querySelector( ':scope > .mw-heading' );

			click( heading );

			expect( section.classList.contains( 'citizen-section--collapsed' ) ).toBe( true );
			expect( section.querySelector( ':scope > p' ).hidden ).toBeTruthy();
			expect( section.querySelector( '#citizen-section-2' ).hidden ).toBeTruthy();
			expect( heading.hidden ).toBeFalsy();

			click( heading );

			expect( section.classList.contains( 'citizen-section--collapsed' ) ).toBe( false );
			expect( section.querySelector( ':scope > p' ).hidden ).toBeFalsy();
		} );

		it( 'should toggle a bare heading section without an mw-heading wrapper', () => {
			const bodyContent = createBodyContent( CONVERGED );
			const nested = bodyContent.querySelector( '#citizen-section-2' );
			const bareHeading = nested.querySelector( ':scope > h3' );

			click( bareHeading );

			expect( nested.classList.contains( 'citizen-section--collapsed' ) ).toBe( true );
			expect( nested.querySelector( 'p' ).hidden ).toBeTruthy();
			expect( bareHeading.hidden ).toBeFalsy();
		} );

		it( 'should not toggle when the edit link is clicked', () => {
			const bodyContent = createBodyContent( CONVERGED );
			const section = bodyContent.querySelector( '#citizen-section-1' );

			click( section.querySelector( '.mw-editsection a' ) );

			expect( section.classList.contains( 'citizen-section--collapsed' ) ).toBe( false );
		} );

		it( 'should expand collapsed converged ancestors on find-in-page', () => {
			const bodyContent = createBodyContent( CONVERGED );
			const section = bodyContent.querySelector( '#citizen-section-1' );
			click( section.querySelector( ':scope > .mw-heading' ) );

			const hidden = section.querySelector( ':scope > p' );
			hidden.dispatchEvent( new Event( 'beforematch', { bubbles: true } ) );

			expect( section.classList.contains( 'citizen-section--collapsed' ) ).toBe( false );
			expect( hidden.hidden ).toBeFalsy();
		} );
	} );

	describe( 'parsoid sections (native markup)', () => {
		const PARSOID = `
			<div class="mw-parser-output">
				<section data-mw-section-id="0"><p>Lead</p></section>
				<section data-mw-section-id="1">
					<div class="mw-heading mw-heading2"><h2 id="Foo">Foo</h2>
						<span class="mw-editsection"><a href="#">edit</a></span>
					</div>
					<p>Bar</p>
					<table><tbody><tr><td>Baz</td></tr></tbody></table>
					<section data-mw-section-id="2">
						<div class="mw-heading mw-heading3"><h3 id="Sub">Sub</h3></div>
						<p>Nested content</p>
					</section>
				</section>
			</div>
		`;

		it( 'should collapse all non-heading children on heading click', () => {
			const bodyContent = createBodyContent( PARSOID );
			const section = bodyContent.querySelector( 'section[data-mw-section-id="1"]' );
			const heading = section.querySelector( '.mw-heading2' );

			click( heading );

			expect( section.classList.contains( 'citizen-section--collapsed' ) ).toBe( true );
			expect( section.querySelector( 'p' ).hidden ).toBeTruthy();
			expect( section.querySelector( 'table' ).hidden ).toBeTruthy();
			expect( section.querySelector( 'section[data-mw-section-id="2"]' ).hidden ).toBeTruthy();
			// The heading itself stays visible
			expect( heading.hidden ).toBeFalsy();
		} );

		it( 'should expand back on second click', () => {
			const bodyContent = createBodyContent( PARSOID );
			const section = bodyContent.querySelector( 'section[data-mw-section-id="1"]' );
			const heading = section.querySelector( '.mw-heading2' );

			click( heading );
			click( heading );

			expect( section.classList.contains( 'citizen-section--collapsed' ) ).toBe( false );
			expect( section.querySelector( 'p' ).hidden ).toBeFalsy();
			expect( section.querySelector( 'table' ).hidden ).toBeFalsy();
		} );

		it( 'should toggle nested subsections independently', () => {
			const bodyContent = createBodyContent( PARSOID );
			const outer = bodyContent.querySelector( 'section[data-mw-section-id="1"]' );
			const nested = bodyContent.querySelector( 'section[data-mw-section-id="2"]' );
			const nestedHeading = nested.querySelector( '.mw-heading3' );

			click( nestedHeading );

			expect( nested.classList.contains( 'citizen-section--collapsed' ) ).toBe( true );
			expect( nested.querySelector( 'p' ).hidden ).toBeTruthy();
			// The outer section is unaffected
			expect( outer.classList.contains( 'citizen-section--collapsed' ) ).toBe( false );
			expect( outer.querySelector( ':scope > p' ).hidden ).toBeFalsy();
		} );

		it( 'should not toggle when the edit link is clicked', () => {
			const bodyContent = createBodyContent( PARSOID );
			const section = bodyContent.querySelector( 'section[data-mw-section-id="1"]' );
			const editLink = section.querySelector( '.mw-editsection a' );

			click( editLink );

			expect( section.classList.contains( 'citizen-section--collapsed' ) ).toBe( false );
		} );

		it( 'should preserve a nested collapsed state across parent toggles', () => {
			const bodyContent = createBodyContent( PARSOID );
			const outer = bodyContent.querySelector( 'section[data-mw-section-id="1"]' );
			const nested = bodyContent.querySelector( 'section[data-mw-section-id="2"]' );

			click( nested.querySelector( '.mw-heading3' ) );
			click( outer.querySelector( '.mw-heading2' ) );
			click( outer.querySelector( '.mw-heading2' ) );

			// The nested section is visible again, but its own collapsed
			// state survived the parent's collapse/expand cycle
			expect( nested.hidden ).toBeFalsy();
			expect( nested.classList.contains( 'citizen-section--collapsed' ) ).toBe( true );
			expect( nested.querySelector( 'p' ).hidden ).toBeTruthy();
		} );

		it( 'should expand collapsed ancestors when find-in-page matches inside', () => {
			const bodyContent = createBodyContent( PARSOID );
			const section = bodyContent.querySelector( 'section[data-mw-section-id="1"]' );
			const heading = section.querySelector( '.mw-heading2' );

			click( heading );
			expect( section.classList.contains( 'citizen-section--collapsed' ) ).toBe( true );

			const hiddenParagraph = section.querySelector( ':scope > p' );
			hiddenParagraph.dispatchEvent( new Event( 'beforematch', { bubbles: true } ) );

			expect( section.classList.contains( 'citizen-section--collapsed' ) ).toBe( false );
			expect( hiddenParagraph.hidden ).toBeFalsy();
		} );
	} );

	describe( 'stale pre-convergence markup (heading outside section)', () => {
		// Cached pages from before the sections were converged: the heading
		// precedes a sibling section that wraps only the body. Collapsing is
		// unsupported — clicking the heading must be a harmless no-op.
		const STALE = `
			<div class="mw-parser-output">
				<h2 class="citizen-section-heading" id="Old">Old</h2>
				<section id="citizen-section-1" class="citizen-section"><p>Body</p></section>
			</div>
		`;

		it( 'should leave cached pre-convergence sections inert', () => {
			const bodyContent = createBodyContent( STALE );
			const heading = bodyContent.querySelector( '.citizen-section-heading' );
			const section = bodyContent.querySelector( '#citizen-section-1' );

			click( heading );

			expect( section.hidden ).toBeFalsy();
			expect( section.classList.contains( 'citizen-section--collapsed' ) ).toBe( false );
		} );
	} );
} );
