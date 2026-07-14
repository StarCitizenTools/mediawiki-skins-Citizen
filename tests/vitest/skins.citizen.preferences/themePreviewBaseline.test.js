// @vitest-environment jsdom

const MODULE_PATH = '../../../resources/skins.citizen.preferences/themePreviewBaseline.js';

/**
 * The module caches its measurement at module level, so each test
 * imports a fresh copy via vi.resetModules() + dynamic import.
 *
 * @return {Promise<Object>}
 */
async function importFresh() {
	vi.resetModules();
	const mod = await import( MODULE_PATH );
	return mod.default || mod;
}

/**
 * Stub getComputedStyle to serve the given knob values and record what
 * the root's classList contained at read time.
 *
 * @param {Object.<string,string>} values knob name -> served value
 * @return {{ spy: Object, classListAtRead: Array }}
 */
function stubComputedStyle( values ) {
	const classListAtRead = [];
	const spy = vi.spyOn( window, 'getComputedStyle' ).mockImplementation( () => {
		classListAtRead.push( Array.from( document.documentElement.classList ) );
		return {
			getPropertyValue: ( name ) => (
				Object.prototype.hasOwnProperty.call( values, name ) ? values[ name ] : ''
			)
		};
	} );
	return { spy, classListAtRead };
}

afterEach( () => {
	vi.restoreAllMocks();
	document.documentElement.className = '';
} );

describe( 'themePreviewBaseline', () => {
	it( 'exports the six identity knobs the preview scope bridges', async () => {
		const { IDENTITY_KNOBS } = await importFresh();

		expect( IDENTITY_KNOBS ).toEqual( [
			'--color-primary-oklch__h',
			'--color-neutral-oklch__h',
			'--color-progressive-oklch__h',
			'--color-progressive-hsl__h',
			'--color-progressive-hsl__s',
			'--color-progressive-hsl__l'
		] );
	} );

	it( 'measures the knobs, trimming values and omitting empty ones', async () => {
		document.documentElement.className = 'citizen-v4';
		stubComputedStyle( {
			'--color-primary-oklch__h': ' 30 ',
			'--color-progressive-hsl__s': '60%'
		} );
		const { measureIdentityBaseline } = await importFresh();

		const baseline = measureIdentityBaseline();

		expect( baseline ).toEqual( {
			'--color-primary-oklch__h': '30',
			'--color-progressive-hsl__s': '60%'
		} );
	} );

	it( 'removes the active theme class for the read and restores it after', async () => {
		document.documentElement.className = 'citizen-v4 skin-theme-clientpref-night';
		const { classListAtRead } = stubComputedStyle( {
			'--color-primary-oklch__h': '262.29'
		} );
		const { measureIdentityBaseline } = await importFresh();

		measureIdentityBaseline();

		expect( classListAtRead ).toHaveLength( 1 );
		expect( classListAtRead[ 0 ] ).not.toContain( 'skin-theme-clientpref-night' );
		expect( classListAtRead[ 0 ] ).toContain( 'citizen-v4' );
		expect(
			document.documentElement.classList.contains( 'skin-theme-clientpref-night' )
		).toBe( true );
	} );

	it( 'restores the theme class even when the read throws', async () => {
		document.documentElement.className = 'citizen-v4 skin-theme-clientpref-black';
		vi.spyOn( window, 'getComputedStyle' ).mockImplementation( () => {
			throw new Error( 'boom' );
		} );
		const { measureIdentityBaseline } = await importFresh();

		expect( () => measureIdentityBaseline() ).toThrow( 'boom' );

		expect(
			document.documentElement.classList.contains( 'skin-theme-clientpref-black' )
		).toBe( true );
	} );

	it( 'caches the measurement so a second call does not re-read', async () => {
		document.documentElement.className = 'citizen-v4 skin-theme-clientpref-day';
		const { spy } = stubComputedStyle( {
			'--color-primary-oklch__h': '262.29'
		} );
		const { measureIdentityBaseline } = await importFresh();

		const first = measureIdentityBaseline();
		const second = measureIdentityBaseline();

		expect( spy ).toHaveBeenCalledTimes( 1 );
		expect( second ).toBe( first );
	} );

	it( 'measures without touching classes when no theme class is present', async () => {
		document.documentElement.className = 'citizen-v4';
		const { classListAtRead } = stubComputedStyle( {
			'--color-neutral-oklch__h': '220'
		} );
		const { measureIdentityBaseline } = await importFresh();

		const baseline = measureIdentityBaseline();

		expect( baseline ).toEqual( { '--color-neutral-oklch__h': '220' } );
		expect( classListAtRead[ 0 ] ).toEqual( [ 'citizen-v4' ] );
		expect( document.documentElement.className ).toBe( 'citizen-v4' );
	} );
} );
