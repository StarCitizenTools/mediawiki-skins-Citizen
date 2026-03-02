// @vitest-environment jsdom

/**
 * Tests for the inline clientPrefs restoration script.
 *
 * inline.js defines window.clientPrefs() which reads localStorage
 * and applies saved clientpref classes to <html> before paint.
 */

let clientPrefsRestore;

beforeAll( async () => {
	// inline.js assigns to window.clientPrefs and auto-executes.
	// Import it to get the function registered on window.
	await import( '../../../resources/skins.citizen.scripts/inline.js' );
	clientPrefsRestore = window.clientPrefs;
} );

afterEach( () => {
	document.documentElement.className = '';
	localStorage.clear();
} );

describe( 'clientPrefs (inline)', () => {
	it( 'should replace existing clientpref classes with stored values', () => {
		document.documentElement.className = 'skin-theme-clientpref-os other-class';
		localStorage.setItem(
			'mwclientpreferences',
			'skin-theme-clientpref-night'
		);

		clientPrefsRestore();

		expect( document.documentElement.className ).toContain( 'skin-theme-clientpref-night' );
		expect( document.documentElement.className ).not.toContain( 'skin-theme-clientpref-os' );
		expect( document.documentElement.className ).toContain( 'other-class' );
	} );

	it( 'should append classes for custom prefs not rendered server-side', () => {
		document.documentElement.className = 'skin-theme-clientpref-os';
		localStorage.setItem(
			'mwclientpreferences',
			'skin-theme-clientpref-night,my-extension-dark-reader-clientpref-1'
		);

		clientPrefsRestore();

		expect( document.documentElement.className ).toContain( 'skin-theme-clientpref-night' );
		expect( document.documentElement.className ).toContain( 'my-extension-dark-reader-clientpref-1' );
	} );

	it( 'should do nothing when localStorage is empty', () => {
		document.documentElement.className = 'skin-theme-clientpref-os';

		clientPrefsRestore();

		expect( document.documentElement.className ).toBe( 'skin-theme-clientpref-os' );
	} );

	it( 'should handle multiple stored preferences', () => {
		document.documentElement.className =
			'skin-theme-clientpref-os citizen-feature-pure-black-clientpref-0';
		localStorage.setItem(
			'mwclientpreferences',
			'skin-theme-clientpref-night,citizen-feature-pure-black-clientpref-1,custom-pref-clientpref-enabled'
		);

		clientPrefsRestore();

		expect( document.documentElement.className ).toContain( 'skin-theme-clientpref-night' );
		expect( document.documentElement.className ).toContain( 'citizen-feature-pure-black-clientpref-1' );
		expect( document.documentElement.className ).toContain( 'custom-pref-clientpref-enabled' );
		expect( document.documentElement.className ).not.toContain( 'clientpref-os' );
		expect( document.documentElement.className ).not.toContain( 'clientpref-0' );
	} );
} );
