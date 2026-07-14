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

function makeItem( timestamp ) {
	return {
		id: 1,
		read: false,
		timestamp: timestamp,
		categoryLabel: 'Mention',
		header: 'A notification',
		body: '',
		primaryUrl: '',
		secondaryLinks: []
	};
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

		const mountItem = () => mount( NotificationItem, { props: { item: makeItem( oneHourAgo ) } } );

		expect( mountItem ).not.toThrow();
	} );

	it( 'should leave the relative time empty and warn when the language tag is invalid', () => {
		mw.config.get.mockImplementation( ( key ) => ( key === 'wgUserLanguage' ? 'x-xss' : null ) );
		const oneHourAgo = Math.floor( Date.now() / 1000 ) - 3600;

		const wrapper = mount( NotificationItem, { props: { item: makeItem( oneHourAgo ) } } );

		expect( wrapper.find( '.citizen-notifications__item-time' ).text() ).toBe( '' );
		expect( mw.log.warn ).toHaveBeenCalled();
	} );

	it( 'should render a relative time for a valid language tag', () => {
		mw.config.get.mockImplementation( ( key ) => ( key === 'wgUserLanguage' ? 'en' : null ) );
		const oneHourAgo = Math.floor( Date.now() / 1000 ) - 3600;

		const wrapper = mount( NotificationItem, { props: { item: makeItem( oneHourAgo ) } } );

		expect( wrapper.find( '.citizen-notifications__item-time' ).text() ).not.toBe( '' );
	} );
} );
