/*
 * Citizen
 *
 * Inline script used in includes/Hooks/SkinHooks.php
 * Mangle using https://jscompress.com/
 */
window.applyPref = () => {
	const
		prefix = 'skin-citizen-',
		themeKey = prefix + 'theme';

	const getStorage = ( key ) => {
		return window.localStorage.getItem( key );
	};

	// Default to auto if no key is present
	const targetTheme = getStorage( themeKey );

	const apply = () => {
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
			const theme = getStorage( themeKey );

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

				htmlElement.classList.add( prefix + theme );
			}

			// Apply pref by adding CSS to root

			for ( const [ key, property ] of Object.entries( cssProps ) ) {
				const value = getStorage( prefix + key );

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

	// Set up auto theme based on prefers-color-scheme
	if ( targetTheme === 'auto' ) {
		const prefersDark = window.matchMedia( '(prefers-color-scheme: dark)' );
		const autoTheme = prefersDark.matches ? 'dark' : 'light';

		const setStorage = ( key, value ) => {
			return window.localStorage.setItem( key, value );
		};

		// Set to the right theme temporarily
		setStorage( themeKey, autoTheme );
		apply();

		// Attach listener for future changes
		prefersDark.addListener( () => {
			apply();
		} );

		// Reset back to auto
		setStorage( themeKey, 'auto' );
	} else {
		apply();
	}
};

( () => {
	window.applyPref();
} )();
