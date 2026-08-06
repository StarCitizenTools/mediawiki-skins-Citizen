// @vitest-environment jsdom

const { mount } = require( '@vue/test-utils' );
// Require vue (CJS) before the SFC dynamic import so both resolve to one
// Vue instance — otherwise @vue/test-utils' mount throws `app.onUnmount`.
require( 'vue' );
const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

let NotificationItem;

beforeAll( async () => {
	const mod = await import( '../../../resources/skins.citizen.notifications/components/NotificationItem.vue' );
	NotificationItem = mod.default;
} );

function makeItem( overrides ) {
	return Object.assign( {
		id: 1,
		read: false,
		timestamp: Math.floor( Date.now() / 1000 ) - 3600,
		categoryLabel: 'Mention',
		header: 'A notification',
		body: '',
		iconUrl: '',
		primaryUrl: '',
		secondaryLinks: []
	}, overrides );
}

describe( 'NotificationItem relative time', () => {
	afterEach( () => {
		mw.config.get.mockReset();
		mw.config.get.mockReturnValue( null );
		mw.log.warn.mockClear();
	} );

	it( 'should render without throwing when the user language is not a valid BCP 47 tag', () => {
		mw.config.get.mockImplementation( ( key ) => ( key === 'wgUserLanguage' ? 'x-xss' : null ) );
		const oneHourAgo = Math.floor( Date.now() / 1000 ) - 3600;

		const mountItem = () => mount( NotificationItem, { props: { item: makeItem( { timestamp: oneHourAgo } ) } } );

		expect( mountItem ).not.toThrow();
	} );

	it( 'should leave the relative time empty and warn when the language tag is invalid', () => {
		mw.config.get.mockImplementation( ( key ) => ( key === 'wgUserLanguage' ? 'x-xss' : null ) );
		const oneHourAgo = Math.floor( Date.now() / 1000 ) - 3600;

		const wrapper = mount( NotificationItem, { props: { item: makeItem( { timestamp: oneHourAgo } ) } } );

		expect( wrapper.find( '.citizen-notifications__item-time' ).text() ).toBe( '' );
		expect( mw.log.warn ).toHaveBeenCalled();
	} );

	it( 'should render a relative time for a valid language tag', () => {
		mw.config.get.mockImplementation( ( key ) => ( key === 'wgUserLanguage' ? 'en' : null ) );
		const oneHourAgo = Math.floor( Date.now() / 1000 ) - 3600;

		const wrapper = mount( NotificationItem, { props: { item: makeItem( { timestamp: oneHourAgo } ) } } );

		expect( wrapper.find( '.citizen-notifications__item-time' ).text() ).not.toBe( '' );
	} );
} );

describe( 'NotificationItem icon', () => {
	beforeEach( () => {
		mw.config.get.mockImplementation( ( key ) => ( key === 'wgUserLanguage' ? 'en' : null ) );
	} );

	afterEach( () => {
		mw.config.get.mockReset();
		mw.config.get.mockReturnValue( null );
	} );

	it( 'should render a decorative badge on every row', () => {
		const wrapper = mount( NotificationItem, { props: { item: makeItem( {} ) } } );

		const badge = wrapper.find( '.citizen-notifications__item-badge' );

		expect( badge.exists() ).toBe( true );
		expect( badge.attributes( 'aria-hidden' ) ).toBe( 'true' );
	} );

	it( 'should expose an allowlisted icon URL as the mask custom property', () => {
		const iconUrl = '/w/extensions/Echo/modules/icons/mention-progressive.svg';

		const wrapper = mount( NotificationItem, { props: { item: makeItem( { iconUrl } ) } } );

		const icon = wrapper.find( '.citizen-notifications__item-icon' );
		expect( icon.exists() ).toBe( true );
		expect( icon.element.style.getPropertyValue( '--citizen-notification-icon' ) )
			.toBe( `url( "${ iconUrl }" )` );
	} );

	it.each( [
		[ 'absolute http(s)', 'https://wiki.example.org/icons/mention.svg' ],
		[ 'protocol-relative', '//wiki.example.org/icons/mention.svg' ]
	] )( 'should accept a %s URL', ( _name, iconUrl ) => {
		const wrapper = mount( NotificationItem, { props: { item: makeItem( { iconUrl } ) } } );

		expect( wrapper.find( '.citizen-notifications__item-icon' ).exists() ).toBe( true );
	} );

	it.each( [
		[ 'empty', '' ],
		[ 'javascript scheme', 'javascript:alert(1)' ],
		[ 'data scheme', 'data:image/svg+xml,<svg/>' ],
		[ 'relative without slash', 'icons/mention.svg' ],
		[ 'embedded double quote', '/icons/a".svg' ],
		[ 'embedded backslash', '/icons/a\\.svg' ],
		[ 'embedded whitespace', '/icons/a b.svg' ]
	] )( 'should render no icon for a %s URL', ( _name, iconUrl ) => {
		const wrapper = mount( NotificationItem, { props: { item: makeItem( { iconUrl } ) } } );

		expect( wrapper.find( '.citizen-notifications__item-icon' ).exists() ).toBe( false );
	} );
} );
