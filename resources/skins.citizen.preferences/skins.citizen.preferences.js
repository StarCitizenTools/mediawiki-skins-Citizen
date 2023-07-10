/* global applyPref */

/**
 * TODO: Maybe combine the localStorage keys into one object
 */

const
	CLASS = 'citizen-pref',
	PREFIX_KEY = 'skin-citizen-';

/**
 * Set the value of the input element
 *
 * @param {string} key
 * @param {string} value
 */
function setInputValue( key, value ) {
	const element = document.getElementById( CLASS + '-' + key + '__input' );

	if ( element ) {
		element.value = value;
	}
}

/**
 * Set the text of the indicator element
 *
 * @param {string} key
 * @param {string} value
 */
function setIndicator( key, value ) {
	const element = document.getElementById( CLASS + '-' + key + '__value' );

	if ( element ) {
		element.innerText = value;
	}
}

/**
 * Convert the pref values for use with the form input
 *
 * @param {Object} pref
 * @return {Object}
 */
function convertForForm( pref ) {
	return {
		theme: pref.theme,
		fontsize: Number( pref.fontsize.slice( 0, -1 ) ) / 10 - 8,
		pagewidth: Number( pref.pagewidth.slice( 0, -2 ) ) / 120 - 6,
		lineheight: ( pref.lineheight - 1 ) * 10
	};
}

/**
 * Retrieve localstorage or default preferences
 *
 * @return {Object} pref
 */
function getPref() {
	const rootStyle = window.getComputedStyle( document.documentElement );

	// Create an initial value for font size
	const initFontSize = () => {
		// Get browser default font size
		const getDefaultFontSize = () => {
			const element = document.createElement( 'div' );
			element.style.width = '1rem';
			element.style.display = 'none';
			document.body.append( element );

			const widthMatch = window
				.getComputedStyle( element )
				.getPropertyValue( 'width' )
				.match( /\d+/ );

			element.remove();

			if ( !widthMatch || widthMatch.length < 1 ) {
				return null;
			}

			const result = Number( widthMatch[ 0 ] );
			return !isNaN( result ) ? result : null;
		};

		const browserFontSize = getDefaultFontSize() + 'px',
			rootFontSize = rootStyle.getPropertyValue( 'font-size' );

		// If browser font size is same as HTML font size, return 100%
		// Some wiki might have custom font size defined in root/HTML,
		// in that case return the defined value
		return ( ( browserFontSize === rootFontSize ) ? '100%' : rootFontSize );
	};

	const pref = {
		theme: localStorage.getItem( PREFIX_KEY + 'theme' ),
		fontsize: localStorage.getItem( PREFIX_KEY + 'fontsize' ) || initFontSize(),
		pagewidth: localStorage.getItem( PREFIX_KEY + 'pagewidth' ) || rootStyle.getPropertyValue( '--width-layout' ),
		lineheight: localStorage.getItem( PREFIX_KEY + 'lineheight' ) || rootStyle.getPropertyValue( '--line-height' )
	};

	return pref;
}

/**
 * Save to localstorage if preference is changed
 *
 * @return {void}
 */
function setPref() {
	const
		// eslint-disable-next-line compat/compat
		formData = Object.fromEntries( new FormData( document.getElementById( CLASS + '-form' ) ) ),
		currentPref = convertForForm( getPref() ),
		newPref = {
			theme: formData[ CLASS + '-theme' ],
			fontsize: Number( formData[ CLASS + '-fontsize' ] ),
			pagewidth: Number( formData[ CLASS + '-pagewidth' ] ),
			lineheight: Number( formData[ CLASS + '-lineheight' ] )
		};

	if ( currentPref.theme !== newPref.theme ) {
		localStorage.setItem( PREFIX_KEY + 'theme', newPref.theme );

	} else if ( currentPref.fontsize !== newPref.fontsize ) {
		const formattedFontSize = ( newPref.fontsize + 8 ) * 10 + '%';
		localStorage.setItem( PREFIX_KEY + 'fontsize', formattedFontSize );
		setIndicator( 'fontsize', formattedFontSize );

	} else if ( currentPref.pagewidth !== newPref.pagewidth ) {
		let formattedPageWidth;
		// Max setting would be full browser width
		if ( newPref.pagewidth === 10 ) {
			formattedPageWidth = '100vw';
		} else {
			formattedPageWidth = ( newPref.pagewidth + 6 ) * 120 + 'px';
		}
		localStorage.setItem( PREFIX_KEY + 'pagewidth', formattedPageWidth );
		setIndicator( 'pagewidth', formattedPageWidth );

	} else if ( currentPref.lineheight !== newPref.lineheight ) {
		const formattedLineHeight = newPref.lineheight / 10 + 1;
		localStorage.setItem( PREFIX_KEY + 'lineheight', formattedLineHeight );
		setIndicator( 'lineheight', formattedLineHeight );
	}

	applyPref();
}

/**
 * Reset preference by clearing localStorage and inline styles
 *
 * @return {void}
 */
function resetPref() {
	// Do not reset theme as its default value is defined somewhere else
	const keys = [ 'fontsize', 'pagewidth', 'lineheight' ];

	// Remove style
	if ( document.getElementById( 'citizen-style' ) ) {
		document.getElementById( 'citizen-style' ).remove();
	}

	// Remove localStorage
	keys.forEach( ( key ) => {
		const keyName = PREFIX_KEY + key;

		if ( localStorage.getItem( keyName ) ) {
			localStorage.removeItem( keyName );
		}
	} );

	const pref = getPref(),
		prefValue = convertForForm( pref );

	keys.forEach( ( key ) => {
		const keyName = PREFIX_KEY + key;

		localStorage.setItem( keyName, pref[ key ] );
		setIndicator( key, pref[ key ] );
		setInputValue( key, prefValue[ key ] );
	} );

	applyPref();
}

/**
 * Dismiss the prefernce panel when clicked outside
 *
 * @param {Event} event
 */
function dismissOnClickOutside( event ) {
	const pref = document.getElementById( CLASS );

	if ( event.target instanceof Node && !pref.contains( event.target ) ) {
		const panel = document.getElementById( CLASS + '-panel' );

		if ( panel.classList.contains( CLASS + '-panel--active' ) ) {
			togglePanel();
		}
	}
}

/**
 * Dismiss the prefernce panel when ESCAPE is pressed
 *
 * @param {Event} event
 */
function dismissOnEscape( event ) {
	if ( event.key !== 'Escape' ) {
		return;
	}

	togglePanel();
}

/**
 * Add/remove toggle class and form input eventlistener
 *
 * @return {void}
 */
function togglePanel() {
	// .citizen-pref-panel--active
	const CLASS_PANEL_ACTIVE = CLASS + '-panel--active';
	const
		toggle = document.getElementById( CLASS + '-toggle' ),
		panel = document.getElementById( CLASS + '-panel' ),
		form = document.getElementById( CLASS + '-form' ),
		themeOption = document.getElementById( CLASS + '-theme' ),
		resetButton = document.getElementById( CLASS + '-resetbutton' );

	if ( !panel.classList.contains( CLASS_PANEL_ACTIVE ) ) {
		panel.classList.add( CLASS_PANEL_ACTIVE );
		toggle.setAttribute( 'aria-expanded', true );
		form.addEventListener( 'input', setPref );
		// Some browser doesn't fire input events when checking radio buttons
		themeOption.addEventListener( 'click', setPref );
		resetButton.addEventListener( 'click', resetPref );
		window.addEventListener( 'click', dismissOnClickOutside );
		window.addEventListener( 'keydown', dismissOnEscape );
	} else {
		panel.classList.remove( CLASS_PANEL_ACTIVE );
		toggle.setAttribute( 'aria-expanded', false );
		form.removeEventListener( 'input', setPref );
		themeOption.removeEventListener( 'click', setPref );
		resetButton.removeEventListener( 'click', resetPref );
		window.removeEventListener( 'click', dismissOnClickOutside );
		window.removeEventListener( 'keydown', dismissOnEscape );
	}
}

/**
 * Get MW message and return as object to be used in Mustache
 *
 * @return {Object}
 */
function getMessages() {
	const keys = [
			'preferences',
			'prefs-citizen-theme-label',
			'prefs-citizen-theme-option-auto',
			'prefs-citizen-theme-option-light',
			'prefs-citizen-theme-option-dark',
			'prefs-citizen-fontsize-label',
			'prefs-citizen-pagewidth-label',
			'prefs-citizen-lineheight-label',
			'prefs-citizen-resetbutton-label'
		],
		data = {};

	keys.forEach( ( key ) => {
		const templateKey = 'msg-' + key;

		// Message keys already defined above
		// eslint-disable-next-line mediawiki/msg-doc
		data[ templateKey ] = mw.message( key ).text();
	} );

	return data;
}

/**
 * Set up the DOM and initial input states for the panel
 * It only loads when user first clicked the toggle
 *
 * @param {Event} event
 * @return {void}
 */
function initPanel( event ) {
	const template = mw.template.get(
			'skins.citizen.preferences',
			'resources/skins.citizen.preferences/templates/preferences.mustache'
		),
		data = getMessages(),
		pref = getPref(),
		prefValue = convertForForm( pref ),
		keys = [ 'fontsize', 'pagewidth', 'lineheight' ];

	// To Mustache is to jQuery sigh
	// TODO: Use ES6 template literals when RL does not screw up multiline
	const panel = template.render( data ).get()[ 1 ];

	// The priorities is as follow:
	// 1. User-set theme (localStorage)
	// 2. Site default theme (wgCitizenThemeDefault)
	// 3. Fallback to auto
	const currentTheme = prefValue.theme ||
		require( './config.json' ).wgCitizenThemeDefault ||
		'auto';

	// Attach panel after button
	event.currentTarget.parentNode.insertBefore( panel, event.currentTarget.nextSibling );

	// Set up initial state
	document.getElementById( CLASS + '-theme__input__' + currentTheme ).checked = true;
	keys.forEach( ( key ) => {
		setIndicator( key, pref[ key ] );
		setInputValue( key, prefValue[ key ] );
	} );

	togglePanel();
	event.currentTarget.addEventListener( 'click', togglePanel );
	event.currentTarget.removeEventListener( 'click', initPanel );
}

/**
 * Test if storage is avaliable
 * Taken from https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
 *
 * @param {string} type
 * @return {boolean|Error}
 */
function storageAvailable( type ) {
	let storage;

	try {
		storage = window[ type ];
		const x = '__storage_test__';
		storage.setItem( x, x );
		storage.removeItem( x );
		return true;
	} catch ( /** @type {Error} */ e ) {
		return e instanceof DOMException && (
			// everything except Firefox
			e.code === 22 ||
			// Firefox
			e.code === 1014 ||
			// test name field too, because code might not be present
			// everything except Firefox
			e.name === 'QuotaExceededError' ||
			// Firefox
			e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ) &&
			// acknowledge QuotaExceededError only if there's something already stored
			( storage && storage.length !== 0 );
	}
}

/**
 * Set up the container and toggle
 *
 * @param {Window} window
 * @return {void}
 */
function initPref( window ) {
	// Object.fromEntries() polyfill https://github.com/feross/fromentries
	// MIT. Copyright (c) Feross Aboukhadijeh.
	if ( typeof Object.fromEntries !== 'function' ) {
		Object.defineProperty( Object, 'fromEntries', {
			value( iterable ) {
				return Array.from( iterable ).reduce( ( obj, [ key, val ] ) => {
					obj[ key ] = val;
					return obj;
				}, {} );
			}
		} );
	}

	if ( storageAvailable( 'localStorage' ) ) {
		if ( typeof window.mw !== 'undefined' ) {
			const headerTools = document.querySelector( '.citizen-header__end' ),
				container = document.createElement( 'div' ),
				button = document.createElement( 'button' ),
				icon = document.createElement( 'span' );

			// citizen-pref
			container.id = CLASS;

			container.classList.add( CLASS, 'citizen-header__item' );
			button.id = CLASS + '-toggle';

			button.classList.add( CLASS + '__button', 'citizen-header__button', 'citizen-button' );
			button.setAttribute( 'title', mw.message( 'preferences' ).text() );
			button.setAttribute( 'aria-label', mw.message( 'preferences' ).text() );
			button.setAttribute( 'aria-controls', CLASS + '-panel' );
			button.setAttribute( 'aria-expanded', false );
			icon.classList.add( 'citizen-ui-icon', 'mw-ui-icon-wikimedia-settings' );
			button.prepend( icon );
			container.prepend( button );
			headerTools.prepend( container );

			button.addEventListener( 'click', initPanel, { once: true } );
		}
	} else {
		// eslint-disable-next-line no-console
		console.log( 'Preference module is disabled due to localStoarge being not avaliable.' );
	}
}

initPref( window );
