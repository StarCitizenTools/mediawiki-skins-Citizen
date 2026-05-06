// Browser console snippet — paste into DevTools while viewing a Citizen page.
// Captures all color-related CSS variables resolved on :root and downloads
// as JSON. Use to compare legacy vs v2 token output:
//   1. Visit ?citizenusenewtoken=0 → run snippet → save as legacy.json
//   2. Visit ?citizenusenewtoken=1 → run snippet → save as v2.json
//   3. From repo root: node tests/scripts/diff-tokens.mjs legacy.json v2.json
( () => {
	const root = document.documentElement;
	const styles = getComputedStyle( root );
	const prefixes = [
		'--color-',
		'--background-color-',
		'--border-color-',
		'--box-shadow-color-',
		'--outline-color-',
		'--accent-color-'
	];

	const tokens = {};
	for ( const name of styles ) {
		if ( prefixes.some( ( p ) => name.startsWith( p ) ) ) {
			tokens[ name ] = styles.getPropertyValue( name ).trim();
		}
	}

	const json = JSON.stringify( {
		theme: root.classList.contains( 'skin-theme-clientpref-night' ) ? 'dark' : 'light',
		mode: root.classList.contains( 'citizen-color-v2' ) ? 'v2' : 'legacy',
		captured: new Date().toISOString(),
		url: location.href,
		tokens
	}, null, '\t' );

	const blob = new Blob( [ json ], { type: 'application/json' } );
	const url = URL.createObjectURL( blob );
	const a = document.createElement( 'a' );
	a.href = url;
	a.download = `citizen-tokens-${ root.classList.contains( 'citizen-color-v2' ) ? 'v2' : 'legacy' }-${ root.classList.contains( 'skin-theme-clientpref-night' ) ? 'dark' : 'light' }-${ Date.now() }.json`;
	a.click();
	URL.revokeObjectURL( url );

	console.log( `Captured ${ Object.keys( tokens ).length } tokens (${ root.classList.contains( 'citizen-color-v2' ) ? 'v2' : 'legacy' } mode).` );
} )();
