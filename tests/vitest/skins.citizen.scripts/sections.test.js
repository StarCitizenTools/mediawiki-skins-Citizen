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

	describe( 'sections with a body wrapper', () => {
		const WRAPPED = `
			<div class="mw-parser-output">
				<section id="citizen-section-0" class="citizen-section"><p>Lead</p></section>
				<section id="citizen-section-1" class="citizen-section">
					<div class="mw-heading citizen-section-heading"><h2 id="Foo">Foo</h2></div>
					<div class="citizen-section-body">
						<p>Bar</p>
						<section id="citizen-section-2" class="citizen-section">
							<h3 class="citizen-section-heading" id="Sub">Sub</h3>
							<div class="citizen-section-body"><p>Nested</p></div>
						</section>
					</div>
				</section>
			</div>
		`;

		it( 'should hide the body wrapper and nothing else', () => {
			const bodyContent = createBodyContent( WRAPPED );
			const section = bodyContent.querySelector( '#citizen-section-1' );
			const heading = section.querySelector( ':scope > .mw-heading' );
			const body = section.querySelector( ':scope > .citizen-section-body' );

			click( heading );

			expect( section.classList.contains( 'citizen-section--collapsed' ) ).toBe( true );
			expect( body.hidden ).toBeTruthy();
			expect( heading.hidden ).toBeFalsy();
			// The content itself is untouched, which is the whole point: only a
			// skin-owned box carries the attribute, so no wiki styling leaks out.
			expect( body.querySelector( 'p' ).hidden ).toBeFalsy();

			click( heading );

			expect( section.classList.contains( 'citizen-section--collapsed' ) ).toBe( false );
			expect( body.hidden ).toBeFalsy();
		} );

		it( 'should toggle a subsection independently of its parent', () => {
			const bodyContent = createBodyContent( WRAPPED );
			const nested = bodyContent.querySelector( '#citizen-section-2' );
			const nestedBody = nested.querySelector( ':scope > .citizen-section-body' );
			const parentBody = bodyContent.querySelector( '#citizen-section-1 > .citizen-section-body' );

			click( nested.querySelector( ':scope > h3' ) );

			expect( nested.classList.contains( 'citizen-section--collapsed' ) ).toBe( true );
			expect( nestedBody.hidden ).toBeTruthy();
			expect( parentBody.hidden ).toBeFalsy();
		} );

		it( 'should expand the whole chain on a find-in-page match', () => {
			const bodyContent = createBodyContent( WRAPPED );
			const parent = bodyContent.querySelector( '#citizen-section-1' );
			const nested = bodyContent.querySelector( '#citizen-section-2' );

			click( parent.querySelector( ':scope > .mw-heading' ) );
			click( nested.querySelector( ':scope > h3' ) );
			nested.querySelector( 'p' ).dispatchEvent( new Event( 'beforematch', { bubbles: true } ) );

			expect( parent.classList.contains( 'citizen-section--collapsed' ) ).toBe( false );
			expect( nested.classList.contains( 'citizen-section--collapsed' ) ).toBe( false );
			expect( parent.querySelector( ':scope > .citizen-section-body' ).hidden ).toBeFalsy();
			expect( nested.querySelector( ':scope > .citizen-section-body' ).hidden ).toBeFalsy();
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

	describe( 'toggle control', () => {
		// Legacy heading markup: no wrapper, so the heading tag itself is
		// both the heading and the row that holds the edit links.
		const LEGACY = `
			<div class="mw-parser-output">
				<section id="citizen-section-1" class="citizen-section">
					<h2 class="citizen-section-heading"><span class="mw-headline" id="Foo">Foo</span>
						<span class="mw-editsection"><a href="#">edit</a></span>
					</h2>
					<p>Bar</p>
				</section>
			</div>
		`;

		// Newer markup wraps the heading tag, so the row is the wrapper.
		const WRAPPED = `
			<div class="mw-parser-output">
				<section data-mw-section-id="1">
					<div class="mw-heading mw-heading2"><h2 id="Foo">Foo</h2>
						<span class="mw-editsection"><a href="#">edit</a></span>
					</div>
					<p>Bar</p>
				</section>
			</div>
		`;

		const PARSOID_NESTED = `
			<div class="mw-parser-output">
				<section data-mw-section-id="1">
					<div class="mw-heading mw-heading2"><h2 id="Outer">Outer</h2></div>
					<p>Bar</p>
					<section data-mw-section-id="2">
						<div class="mw-heading mw-heading3"><h3 id="Inner">Inner</h3></div>
						<p>Nested</p>
					</section>
				</section>
			</div>
		`;

		it( 'should leave the markup alone when collapsible sections are off', () => {
			// Without the body class the feature is disabled, so the server's
			// markup has to survive untouched — no button, and no interactive
			// class for the styles to hand the chevron over on.
			const bodyContent = document.createElement( 'div' );
			bodyContent.innerHTML = WRAPPED;
			document.body.appendChild( bodyContent );

			createSections( { document, bodyContent } ).init();

			expect( bodyContent.querySelector( '.citizen-section-toggle' ) ).toBeNull();
			expect( document.body.classList.contains( 'citizen-sections-interactive' ) ).toBe( false );
		} );

		it( 'should give every collapsible heading a button', () => {
			const bodyContent = createBodyContent( WRAPPED );

			const toggle = bodyContent.querySelector( '.citizen-section-toggle' );

			expect( toggle.tagName ).toBe( 'BUTTON' );
			expect( toggle.type ).toBe( 'button' );
			expect( toggle.getAttribute( 'aria-expanded' ) ).toBe( 'true' );
		} );

		it( 'should name the button after its section', () => {
			const bodyContent = createBodyContent( WRAPPED );

			const toggle = bodyContent.querySelector( '.citizen-section-toggle' );

			expect( toggle.getAttribute( 'aria-labelledby' ) ).toBe( 'Foo' );
		} );

		it( 'should place the button after the edit links when markup wraps the heading', () => {
			const bodyContent = createBodyContent( WRAPPED );
			const h2 = bodyContent.querySelector( 'h2' );
			const editSection = bodyContent.querySelector( '.mw-editsection' );

			const toggle = bodyContent.querySelector( '.citizen-section-toggle' );

			// Outside the h2, so the heading keeps a clean accessible name
			expect( toggle.closest( 'h2' ) ).toBeNull();
			expect( h2.hasAttribute( 'aria-labelledby' ) ).toBe( false );
			// Outboard of the controls that act on the section's content, and in
			// the order the styles render it, so reading order matches
			expect( editSection.nextElementSibling ).toBe( toggle );
		} );

		it( 'should place the button after the heading tag when there are no edit links', () => {
			const bodyContent = createBodyContent( PARSOID_NESTED );
			const h2 = bodyContent.querySelector( 'h2' );

			const toggle = bodyContent.querySelector( '.citizen-section-toggle' );

			expect( h2.nextElementSibling ).toBe( toggle );
		} );

		it( 'should carry the same Codex button classes as the edit links', () => {
			const bodyContent = createBodyContent( WRAPPED );

			const toggle = bodyContent.querySelector( '.citizen-section-toggle' );

			expect( toggle.classList.contains( 'cdx-button' ) ).toBe( true );
			expect( toggle.classList.contains( 'cdx-button--weight-quiet' ) ).toBe( true );
			expect( toggle.classList.contains( 'cdx-button--icon-only' ) ).toBe( true );
		} );

		it( 'should not mistake a subscribe control for the edit links', () => {
			// DiscussionTools inserts .mw-editsection-like as the heading's first
			// child, so placing after it would land the button ahead of the title.
			const bodyContent = createBodyContent( `
				<div class="mw-parser-output">
					<section data-mw-section-id="1">
						<div class="mw-heading mw-heading2">
							<span class="mw-editsection-like">subscribe</span>
							<h2 id="Foo">Foo</h2>
						</div>
						<p>Bar</p>
					</section>
				</div>
			` );
			const h2 = bodyContent.querySelector( 'h2' );

			const toggle = bodyContent.querySelector( '.citizen-section-toggle' );

			expect( h2.nextElementSibling ).toBe( toggle );
		} );

		it( 'should stay a sibling of the edit links, not a descendant', () => {
			// The delegated click handler returns early inside .mw-editsection,
			// so a nested toggle would never fire.
			const bodyContent = createBodyContent( WRAPPED );

			const toggle = bodyContent.querySelector( '.citizen-section-toggle' );

			expect( toggle.closest( '.mw-editsection' ) ).toBeNull();
		} );

		it( 'should pin the heading name when the button lands inside the heading tag', () => {
			const bodyContent = createBodyContent( LEGACY );
			const heading = bodyContent.querySelector( '.citizen-section-heading' );

			const toggle = heading.querySelector( '.citizen-section-toggle' );

			expect( toggle.closest( 'h2' ) ).toBe( heading );
			expect( heading.getAttribute( 'aria-labelledby' ) ).toBe( 'Foo' );
			// Last, after the edit links it renders outboard of
			expect( heading.lastElementChild ).toBe( toggle );
		} );

		it( 'should give every heading on the page its own button', () => {
			const bodyContent = createBodyContent( `
				<div class="mw-parser-output">
					<section data-mw-section-id="1">
						<div class="mw-heading"><h2 id="One">One</h2></div>
						<p>First</p>
						<section data-mw-section-id="2">
							<div class="mw-heading"><h3 id="Two">Two</h3></div>
							<p>Nested</p>
						</section>
					</section>
					<section data-mw-section-id="3">
						<div class="mw-heading"><h2 id="Three">Three</h2></div>
						<p>Third</p>
					</section>
				</div>
			` );

			const toggles = [ ...bodyContent.querySelectorAll( '.citizen-section-toggle' ) ];
			const names = toggles.map( ( t ) => t.getAttribute( 'aria-labelledby' ) );

			expect( toggles ).toHaveLength( 3 );
			expect( new Set( names ).size ).toBe( 3 );
			expect( names ).toEqual( [ 'One', 'Two', 'Three' ] );
		} );

		it( 'should leave other sections alone when one is toggled', () => {
			const bodyContent = createBodyContent( PARSOID_NESTED );
			const outer = bodyContent.querySelector( 'section[data-mw-section-id="1"]' );
			const nested = bodyContent.querySelector( 'section[data-mw-section-id="2"]' );
			const nestedToggle = nested.querySelector( '.citizen-section-toggle' );

			click( nestedToggle );

			expect( nestedToggle.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
			expect( outer.querySelector( ':scope > .mw-heading > .citizen-section-toggle' )
				.getAttribute( 'aria-expanded' ) ).toBe( 'true' );
		} );

		it( 'should not add a second button when run again over the same content', () => {
			const bodyContent = createBodyContent( WRAPPED );

			// wikipage.content can fire more than once per page view
			createSections( { document, bodyContent } ).init();

			expect( bodyContent.querySelectorAll( '.citizen-section-toggle' ) ).toHaveLength( 1 );
		} );

		it( 'should still toggle once per click after running again', () => {
			const bodyContent = createBodyContent( WRAPPED );
			const section = bodyContent.querySelector( 'section[data-mw-section-id="1"]' );
			const toggle = section.querySelector( '.citizen-section-toggle' );

			// A second set of delegated handlers would toggle twice per click
			createSections( { document, bodyContent } ).init();
			click( toggle );

			expect( section.classList.contains( 'citizen-section--collapsed' ) ).toBe( true );
			expect( toggle.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
		} );

		it( 'should keep toggling after several re-runs', () => {
			const bodyContent = createBodyContent( WRAPPED );
			const section = bodyContent.querySelector( 'section[data-mw-section-id="1"]' );
			const toggle = section.querySelector( '.citizen-section-toggle' );

			createSections( { document, bodyContent } ).init();
			createSections( { document, bodyContent } ).init();
			createSections( { document, bodyContent } ).init();

			click( toggle );
			expect( section.classList.contains( 'citizen-section--collapsed' ) ).toBe( true );

			click( toggle );
			expect( section.classList.contains( 'citizen-section--collapsed' ) ).toBe( false );
		} );

		it( 'should reach content rendered into the root after the first run', () => {
			const bodyContent = createBodyContent( WRAPPED );
			bodyContent.insertAdjacentHTML( 'beforeend', `
				<section data-mw-section-id="2">
					<div class="mw-heading mw-heading2"><h2 id="Later">Later</h2></div>
					<p>Rendered later</p>
				</section>
			` );

			createSections( { document, bodyContent } ).init();

			const later = bodyContent.querySelector( 'section[data-mw-section-id="2"]' );
			const toggle = later.querySelector( '.citizen-section-toggle' );
			expect( toggle ).not.toBeNull();
			expect( toggle.getAttribute( 'aria-labelledby' ) ).toBe( 'Later' );

			// The handlers bound on the first run drive content that did not
			// exist when they were attached
			click( toggle );

			expect( later.classList.contains( 'citizen-section--collapsed' ) ).toBe( true );
			expect( toggle.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
		} );

		it( 'should bind a content root it has not seen before', () => {
			const first = createBodyContent( WRAPPED );
			const second = createBodyContent( WRAPPED );
			const section = second.querySelector( 'section[data-mw-section-id="1"]' );

			click( section.querySelector( '.citizen-section-toggle' ) );

			expect( first.querySelector( 'section' ).classList.contains( 'citizen-section--collapsed' ) ).toBe( false );
			expect( section.classList.contains( 'citizen-section--collapsed' ) ).toBe( true );
		} );

		it( 'should not reuse an id the page already claims', () => {
			const bodyContent = createBodyContent( `
				<div class="mw-parser-output">
					<p id="citizen-section-label-1">Content that took the id first</p>
					<section data-mw-section-id="1">
						<div class="mw-heading"><h2>No anchor</h2></div>
						<p>Bar</p>
					</section>
				</div>
			` );

			const toggle = bodyContent.querySelector( '.citizen-section-toggle' );
			const labelId = toggle.getAttribute( 'aria-labelledby' );

			expect( labelId ).not.toBe( 'citizen-section-label-1' );
			expect( document.querySelectorAll( `#${ labelId }` ) ).toHaveLength( 1 );
		} );

		it( 'should toggle the section when the button is activated', () => {
			const bodyContent = createBodyContent( WRAPPED );
			const section = bodyContent.querySelector( 'section[data-mw-section-id="1"]' );
			const toggle = section.querySelector( '.citizen-section-toggle' );

			// Enter and Space on a native button produce a click
			click( toggle );

			expect( section.classList.contains( 'citizen-section--collapsed' ) ).toBe( true );
			expect( section.querySelector( ':scope > p' ).hidden ).toBeTruthy();
		} );

		it( 'should track the collapsed state in aria-expanded', () => {
			const bodyContent = createBodyContent( WRAPPED );
			const section = bodyContent.querySelector( 'section[data-mw-section-id="1"]' );
			const toggle = section.querySelector( '.citizen-section-toggle' );

			click( toggle );

			expect( toggle.getAttribute( 'aria-expanded' ) ).toBe( 'false' );

			click( toggle );

			expect( toggle.getAttribute( 'aria-expanded' ) ).toBe( 'true' );
		} );

		it( 'should restore aria-expanded when find-in-page expands the section', () => {
			const bodyContent = createBodyContent( WRAPPED );
			const section = bodyContent.querySelector( 'section[data-mw-section-id="1"]' );
			const toggle = section.querySelector( '.citizen-section-toggle' );
			click( toggle );

			section.querySelector( ':scope > p' )
				.dispatchEvent( new Event( 'beforematch', { bubbles: true } ) );

			expect( toggle.getAttribute( 'aria-expanded' ) ).toBe( 'true' );
		} );

		it( 'should generate an id when the section title has no anchor', () => {
			const bodyContent = createBodyContent( `
				<div class="mw-parser-output">
					<section data-mw-section-id="1">
						<div class="mw-heading"><h2>Foo</h2></div>
						<p>Bar</p>
					</section>
				</div>
			` );

			const toggle = bodyContent.querySelector( '.citizen-section-toggle' );

			expect( toggle.getAttribute( 'aria-labelledby' ) )
				.toBe( bodyContent.querySelector( 'h2' ).id );
			expect( toggle.getAttribute( 'aria-labelledby' ) ).toBeTruthy();
		} );

		it( 'should not add a button to a heading that owns no section', () => {
			const bodyContent = createBodyContent( `
				<div class="mw-parser-output">
					<div class="mw-heading"><h2 id="Foo">Foo</h2></div>
					<section class="citizen-section"><p>Bar</p></section>
				</div>
			` );

			expect( bodyContent.querySelector( '.citizen-section-toggle' ) ).toBeNull();
		} );

		it( 'should mark the body once the toggles are in place', () => {
			createBodyContent( WRAPPED );

			expect( document.body.classList.contains( 'citizen-sections-interactive' ) ).toBe( true );
		} );
	} );
} );
