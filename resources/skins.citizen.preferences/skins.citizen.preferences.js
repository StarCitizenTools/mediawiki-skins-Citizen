/* global applyPref */

/**
 * TODO: Maybe combine the localStorage keys into one object
 */

/**
 * Set the value of the input element
 *
 * @param {string} key
 * @param {string} value
 */
function setInputValue( key, value ) {
	const element = document.getElementById( 'citizen-pref-' + key + '__input' );

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
	const element = document.getElementById( 'citizen-pref-' + key + '__value' );

	if ( element ) {
		element.innerText = value;
	}
}

/**
 * Format the pref for use with the form input
 *
 * @param {Object} pref
 * @return {Object}
 */
function convertPref( pref ) {
	return {
		theme: pref.theme,
		fontsize: Number( pref.fontsize.slice( 0, -1 ) ) / 10 - 5,
		pagewidth: Number( pref.pagewidth.slice( 0, -2 ) ) / 120 - 6
	};
}

/**
 * Retrieve localstorage or default preferences
 *
 * @return {Object} pref
 */
function getPref() {
	const htmlStyle = window.getComputedStyle( document.documentElement ),
		pref = {};

	// It is already set in theme.js in skins.citizen.scripts
	pref.theme = localStorage.getItem( 'skin-citizen-theme' );
	pref.fontsize = localStorage.getItem( 'skin-citizen-fontsize' ) ?? htmlStyle.getPropertyValue( 'font-size' );
	pref.pagewidth = localStorage.getItem( 'skin-citizen-pagewidth' ) ?? htmlStyle.getPropertyValue( '--width-layout' );

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
		currentPref = convertPref( getPref() ),
		newPref = {
			theme: formData[ 'citizen-pref-theme' ],
			fontsize: Number( formData[ 'citizen-pref-fontsize' ] ),
			pagewidth: Number( formData[ 'citizen-pref-pagewidth' ] )
		};

	if ( currentPref.theme !== newPref.theme ) {
		localStorage.setItem( 'skin-citizen-theme', newPref.theme );

	} else if ( currentPref.fontsize !== newPref.fontsize ) {
		const formattedFontSize = ( newPref.fontsize + 5 ) * 10 + '%';

		localStorage.setItem( 'skin-citizen-fontsize', formattedFontSize );
		setIndicator( 'fontsize', formattedFontSize );
	} else if ( currentPref.pagewidth !== newPref.pagewidth ) {
		let formattedPageWidth;

		// Max setting would be full browser width
		if ( newPref.pagewidth === 10 ) {
			formattedPageWidth = '100vw';
		} else {
			formattedPageWidth = ( newPref.pagewidth + 6 ) * 120 + 'px';
		}
		localStorage.setItem( 'skin-citizen-pagewidth', formattedPageWidth );
		setIndicator( 'pagewidth', formattedPageWidth );
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
	const keys = [ 'fontsize', 'pagewidth' ],
		keyPrefix = 'skin-citizen-';

	// Remove inline style
	document.documentElement.removeAttribute( 'style' );

	// Remove localStorage
	keys.forEach( ( key ) => {
		const keyName = keyPrefix + key;

		if ( localStorage.getItem( keyName ) ) {
			localStorage.removeItem( keyName );
		}
	} );

	const pref = getPref(),
		prefValue = convertPref( pref );

	keys.forEach( ( key ) => {
		const keyName = keyPrefix + key;

		localStorage.setItem( keyName, pref[ key ] );
		setIndicator( key, pref[ key ] );
		setInputValue( key, prefValue[ key ] );
	} );

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
		pref = getPref(),
		prefValue = convertPref( pref ),
		keys = [ 'fontsize', 'pagewidth' ];

	// To Mustache is to jQuery sigh
	// TODO: Use ES6 template literals when RL does not screw up multiline
	const panel = template.render( data ).get()[ 1 ];
	// Attach panel after button
	event.currentTarget.parentNode.insertBefore( panel, event.currentTarget.nextSibling );

	// Set up initial state
	document.getElementById( 'citizen-pref-theme__input__' + prefValue.theme ).checked = true;
	keys.forEach( ( key ) => {
		setIndicator( key, pref[ key ] );
		setInputValue( key, prefValue[ key ] );
	} );

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
