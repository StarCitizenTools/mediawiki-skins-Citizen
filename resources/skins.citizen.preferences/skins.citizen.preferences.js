/* global applyPref */

/**
 * TODO: Maybe combine the localStorage keys into one object
 */

/**
 * Convert localstorage preferences into input values and return the object
 *
 * @return {Object} pref
 */
function getPref() {
	const htmlStyle = window.getComputedStyle( document.documentElement ),
		pref = {};

	// It is already set somewhere else
	pref.theme = localStorage.getItem( 'skin-citizen-theme' );

	// e.g. remove the unit from 100%, then divide 10 and minus 5, equal to 5
	pref.fontsize = Number(
		( localStorage.getItem( 'skin-citizen-fontsize' ) ?? htmlStyle.getPropertyValue( 'font-size' ) )
			.slice( 0, -1 )
	) / 10 - 5;

	// e.g. remove the unit from 960px, then divide 120 and minus 6, equal to 3
	pref.pagewidth = Number(
		( localStorage.getItem( 'skin-citizen-pagewidth' ) ?? htmlStyle.getPropertyValue( '--width-layout' ) ).slice( 0, -2 )
	) / 120 - 6;

	return pref;
}

/**
 * Save to localstorage if preference is changed
 *
 * @param {Event} event
 * @return {void}
 */
function setPref( event ) {
	// eslint-disable-next-line compat/compat
	const formData = Object.fromEntries( new FormData( event.currentTarget ) ),
		currentPref = getPref(),
		newPref = {
			theme: formData[ 'citizen-pref-theme' ],
			fontsize: Number( formData[ 'citizen-pref-fontsize' ] ),
			pagewidth: Number( formData[ 'citizen-pref-pagewidth' ] )
		};

	if ( currentPref.theme !== newPref.theme ) {
		localStorage.setItem( 'skin-citizen-theme', newPref.theme );

	} else if ( currentPref.fontsize !== newPref.fontsize ) {
		const formattedFontSize = ( newPref.fontsize + 5 ) * 10 + '%',
			indicatorElement = document.getElementById( 'citizen-pref-fontsize__value' );

		indicatorElement.innerText = formattedFontSize;
		localStorage.setItem( 'skin-citizen-fontsize', formattedFontSize );
	} else if ( currentPref.pagewidth !== newPref.pagewidth ) {
		const indicatorElement = document.getElementById( 'citizen-pref-pagewidth__value' );

		let formattedPageWidth;

		// Max setting would be full browser width
		if ( newPref.pagewidth === 10 ) {
			formattedPageWidth = '100vw';
		} else {
			formattedPageWidth = ( newPref.pagewidth + 6 ) * 120 + 'px';
		}

		indicatorElement.innerText = formattedPageWidth;
		localStorage.setItem( 'skin-citizen-pagewidth', formattedPageWidth );
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
	const inlineStyles = {
		fontsize: 'font-size',
		pagewidth: '--width-layout'
	};

	// Remove inline style
	document.documentElement.removeAttribute( 'style' );

	// Retrieve default value and set it to localStorage
	const htmlStyle = window.getComputedStyle( document.documentElement );

	// eslint-disable-next-line compat/compat
	for ( const [ key, prop ] of Object.entries( inlineStyles ) ) {
		const keyName = 'skin-citizen-' + key,
			propValue = htmlStyle.getPropertyValue( prop );

		localStorage.setItem( keyName, propValue );
		document.getElementById( 'citizen-pref-' + key + '__value' ).innerText = propValue;
		document.getElementById( 'citizen-pref-' + key + '__input' ).value = getPref()[ key ];
	}

	applyPref();
}

/**
 * Add/remove toggle class and form input eventlistener
 *
 * @param {Event} event
 * @return {void}
 */
function togglePanel( event ) {
	const panel = document.getElementById( 'citizen-pref-panel' ),
		form = document.getElementById( 'citizen-pref-form' ),
		resetButton = document.getElementById( 'citizen-pref-resetbutton' );

	if ( !panel.classList.contains( 'citizen-pref-panel--active' ) ) {
		panel.classList.add( 'citizen-pref-panel--active' );
		event.currentTarget.setAttribute( 'aria-expanded', true );
		form.addEventListener( 'input', setPref );
		resetButton.addEventListener( 'click', resetPref );
	} else {
		panel.classList.remove( 'citizen-pref-panel--active' );
		event.currentTarget.setAttribute( 'aria-expanded', false );
		form.removeEventListener( 'input', setPref );
		resetButton.removeEventListener( 'click', resetPref );
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
			'prefs-citizen-theme-option-light',
			'prefs-citizen-theme-option-dark',
			'prefs-citizen-fontsize-label',
			'prefs-citizen-pagewidth-label',
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
		currentPref = getPref();

	// To Mustache is to jQuery sigh
	// TODO: Use ES6 template literals when RL does not screw up multiline
	const panel = template.render( data ).get()[ 1 ];
	// Attach panel after button
	event.currentTarget.parentNode.insertBefore( panel, event.currentTarget.nextSibling );

	// Set up initial state
	document.getElementById( 'citizen-pref-theme__input__' + currentPref.theme ).checked = true;
	document.getElementById( 'citizen-pref-fontsize__input' ).value = currentPref.fontsize;
	document.getElementById( 'citizen-pref-pagewidth__input' ).value = currentPref.pagewidth;

	togglePanel( event );
	event.currentTarget.addEventListener( 'click', togglePanel );
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
	if ( storageAvailable( 'localStorage' ) ) {
		if ( typeof window.mw !== 'undefined' ) {
			const headerTools = document.getElementById( 'mw-header-tools' ),
				container = document.createElement( 'div' ),
				button = document.createElement( 'button' );

			mw.loader.load( 'skins.citizen.icons.preferences' );

			container.id = 'citizen-pref';
			button.id = 'citizen-pref-toggle';
			button.setAttribute( 'aria-controls', 'citizen-pref-panel' );
			button.setAttribute( 'aria-expanded', false );
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
