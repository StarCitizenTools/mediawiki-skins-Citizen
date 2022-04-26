/*
 * Citizen
 * Inline script used in includes/Hooks/SkinHooks.php
 *
 * https://starcitizen.tools
 *
 * Mangle using https://jscompress.com/
 */
window.applyPref = () => {
	const prefix = 'skin-citizen-';
	const cssProps = {
		fontsize: 'font-size',
		pagewidth: '--width-layout',
		lineheight: '--line-height'
	};

	// Generates an array of prefix-(auto|dark|light) strings
	const classNames = () => {
		return [ 'auto', 'dark', 'light' ].map( ( themeType ) => {
			return prefix + themeType;
		} );
	};

	const injectStyles = ( css ) => {
		const styleId = 'citizen-style';
		let style = document.getElementById( styleId );

		if ( style === null ) {
			style = document.createElement( 'style' );
			style.setAttribute( 'id', styleId );
			document.head.appendChild( style );
		}
		style.textContent = `:root{${css}}`;
	};

	try {
		const theme = window.localStorage.getItem( prefix + 'theme' );

		let cssDeclaration = '';

		// Apply pref by changing class
		if ( theme !== null ) {
			const htmlElement = document.documentElement;
			// Remove all theme classes then add the right one
			// The following classes are used here:
			// * skin-citizen-auto
			// * skin-citizen-light
			// * skin-citizen-dark
			htmlElement.classList.remove( ...classNames( prefix ) );
			/* eslint-disable-next-line mediawiki/class-doc */
			htmlElement.classList.add( prefix + theme );
		}

		// Apply pref by adding CSS to root
		/* eslint-disable-next-line compat/compat */
		for ( const [ key, property ] of Object.entries( cssProps ) ) {
			const value = window.localStorage.getItem( prefix + key );

			if ( value !== null ) {
				cssDeclaration += `${property}:${value};`;
			}
		}

		if ( cssDeclaration ) {
			injectStyles( cssDeclaration );
		}
	} catch ( e ) {
	}
};

( () => {
	const themeId = 'skin-citizen-theme';
	// Set up auto theme based on prefers-color-scheme
	if ( window.localStorage.getItem( themeId ) === 'auto' ) {
		const autoTheme = window.matchMedia( '(prefers-color-scheme: dark)' ) ? 'dark' : 'light';
		// Set to the right theme temporarily
		window.localStorage.setItem( themeId, autoTheme );
		window.applyPref();
		// Reset back to auto
		window.localStorage.setItem( themeId, 'auto' );
	} else {
		window.applyPref();
	}
} )();
