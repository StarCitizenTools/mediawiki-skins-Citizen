// @vitest-environment jsdom

const { mount } = require( '@vue/test-utils' );
// Require vue (CJS) before the SFC dynamic import so both resolve to one
// Vue instance — otherwise @vue/test-utils' mount throws `app.onUnmount`.
require( 'vue' );
const mw = require( '../mocks/mw.js' );
const { setCodexStubs } = require( '../mocks/codex.js' );
globalThis.mw = mw;

// Stub the Codex components the footer pulls from the module's codex.js.
setCodexStubs( {
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
	}
} );

let PanelFooter;

beforeAll( async () => {
	const mod = await import( '../../../resources/skins.citizen.notifications/components/PanelFooter.vue' );
	PanelFooter = mod.default;
} );

// The shared mw mock resolves every message to its own key, so each label is
// assertable by the key it came from.
function mountFooter( props ) {
	return mount( PanelFooter, { props: props } );
}

describe( 'PanelFooter with notifications listed', () => {
	it( 'should render history link, clear-all button and settings link in order', () => {
		const wrapper = mountFooter( { hasItems: true } );

		const children = Array.from( wrapper.element.children );

		expect( children.map( ( el ) => el.tagName ) ).toEqual( [ 'A', 'BUTTON', 'A' ] );
		expect( children[ 0 ].getAttribute( 'href' ) ).toContain( 'Special:Notifications' );
		expect( children[ 2 ].getAttribute( 'href' ) ).toContain( 'Special:Preferences' );
	} );

	it( 'should style both icon links as normal-weight icon-only buttons', () => {
		const wrapper = mountFooter( { hasItems: true } );

		const links = wrapper.findAll( 'a' );

		expect( links ).toHaveLength( 2 );
		links.forEach( ( link ) => {
			expect( link.classes() ).toContain( 'cdx-button' );
			expect( link.classes() ).toContain( 'cdx-button--icon-only' );
			expect( link.classes() ).not.toContain( 'cdx-button--weight-quiet' );
		} );
	} );

	it( 'should leave the history link unlabelled beyond its icon', () => {
		const wrapper = mountFooter( { hasItems: true } );

		const history = wrapper.find( '.citizen-notifications__footer-history' );

		expect( history.text() ).toBe( '' );
		expect( history.classes() )
			.not.toContain( 'citizen-notifications__footer-history--expanded' );
	} );

	it( 'should label the clear-all button and title it with the mark-all-read text', () => {
		const wrapper = mountFooter( { hasItems: true, canClear: true } );

		const button = wrapper.find( 'button' );

		expect( button.text() ).toBe( 'citizen-notifications-clear-all' );
		expect( button.attributes( 'title' ) ).toBe( 'citizen-notifications-mark-all-read' );
	} );

	it( 'should emit clear when the clear-all button is clicked', async () => {
		const wrapper = mountFooter( { hasItems: true, canClear: true } );

		await wrapper.find( 'button' ).trigger( 'click' );

		expect( wrapper.emitted( 'clear' ) ).toHaveLength( 1 );
	} );

	it( 'should disable the clear-all button when canClear is false', () => {
		const wrapper = mountFooter( { hasItems: true, canClear: false } );

		const button = wrapper.find( 'button' );

		expect( button.attributes( 'disabled' ) ).toBeDefined();
	} );

	it( 'should enable the clear-all button when canClear is true', () => {
		const wrapper = mountFooter( { hasItems: true, canClear: true } );

		const button = wrapper.find( 'button' );

		expect( button.attributes( 'disabled' ) ).toBeUndefined();
	} );

	it( 'should label the icon links for assistive tech', () => {
		const wrapper = mountFooter( { hasItems: true } );

		const links = wrapper.findAll( 'a' );

		links.forEach( ( link ) => {
			expect( link.attributes( 'aria-label' ) ).toBeTruthy();
			expect( link.attributes( 'title' ) ).toBe( link.attributes( 'aria-label' ) );
		} );
	} );
} );

describe( 'PanelFooter with an empty list', () => {
	it( 'should drop the clear-all button rather than disable it', () => {
		const wrapper = mountFooter( { hasItems: false } );

		expect( wrapper.find( 'button' ).exists() ).toBe( false );
		expect( wrapper.find( '.citizen-notifications__footer-clear' ).exists() ).toBe( false );
	} );

	it( 'should expand the history link into the freed row, label and all', () => {
		const wrapper = mountFooter( { hasItems: false } );

		const history = wrapper.find( '.citizen-notifications__footer-history' );

		expect( history.text() ).toBe( 'citizen-notifications-see-all' );
		expect( history.classes() ).toContain( 'citizen-notifications__footer-history--expanded' );
		expect( history.classes() ).not.toContain( 'cdx-button--icon-only' );
		expect( history.find( '.cdx-icon' ).exists() ).toBe( true );
	} );

	it( 'should keep the settings link icon-only', () => {
		const wrapper = mountFooter( { hasItems: false } );

		const prefs = wrapper.find( '.citizen-notifications__footer-prefs' );

		expect( prefs.classes() ).toContain( 'cdx-button--icon-only' );
		expect( prefs.text() ).toBe( '' );
	} );
} );
