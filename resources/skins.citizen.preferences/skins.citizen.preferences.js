/**
 * Clientprefs names theme differently from Citizen, we will need to translate it
 * TODO: Migrate to clientprefs fully on MW 1.43
 */
const CLIENTPREFS_THEME_MAP = {
	auto: 'os',
	light: 'day',
	dark: 'night'
};

const clientPrefs = require( './clientPrefs.polyfill.js' )();

/**
 * Dismiss the preference panel when clicked outside
 *
 * @param {Event} event
 */
function dismissOnClickOutside( event ) {
	const pref = document.getElementById( 'citizen-pref' );

	if ( event.target instanceof Node && !pref.contains( event.target ) ) {
		const panel = document.getElementById( 'citizen-pref-panel' );

		if ( panel.classList.contains( 'citizen-pref-panel--active' ) ) {
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
	const CLASS_PANEL_ACTIVE = 'citizen-pref-panel--active';
	const
		toggle = document.getElementById( 'citizen-pref-toggle' ),
		panel = document.getElementById( 'citizen-pref-panel' );

	if ( !panel.classList.contains( CLASS_PANEL_ACTIVE ) ) {
		panel.classList.add( CLASS_PANEL_ACTIVE );
		toggle.setAttribute( 'aria-expanded', true );
		window.addEventListener( 'mousedown', dismissOnClickOutside );
		window.addEventListener( 'touchstart', dismissOnClickOutside, { passive: true } );
		window.addEventListener( 'keydown', dismissOnEscape );
	} else {
		panel.classList.remove( CLASS_PANEL_ACTIVE );
		toggle.setAttribute( 'aria-expanded', false );
		window.removeEventListener( 'mousedown', dismissOnClickOutside );
		window.removeEventListener( 'touchstart', dismissOnClickOutside );
		window.removeEventListener( 'keydown', dismissOnEscape );
	}
}

/**
 * Creates a panel element for user preferences.
 * The panel includes a header with the text retrieved from mw.message('preferences').text()
 * and a container element with the id 'citizen-client-prefs'.
 *
 * @return {Element} The created panel element.
 */
function createPanel() {
	const panel = document.createElement( 'aside' );
	panel.id = 'citizen-pref-panel';
	panel.classList.add( 'citizen-pref-panel' );
	panel.classList.add( 'citizen-menu__card' );

	const header = document.createElement( 'header' );
	header.id = 'citizen-pref-header';
	header.textContent = mw.message( 'preferences' ).text();

	const container = document.createElement( 'div' );
	container.id = 'citizen-client-prefs';
	container.classList.add( 'citizen-client-prefs' );

	panel.append( header, container );

	return panel;
}

/**
 * Attaches a panel element to a target button element.
 *
 * @param {Element} panel - The panel element to attach.
 * @param {Element} button - The button element to attach the panel to.
 * @return {void}
 */
function attachPanel( panel, button ) {
	button.parentNode.insertBefore( panel, button.nextSibling );
}

/**
 * Initializes the click event listener for a given button element.
 * Toggles the panel visibility when the button is clicked.
 *
 * @param {Element} button - The button element to attach the click event listener to.
 * @return {void}
 */
function initPanelClick( button ) {
	togglePanel();
	button.addEventListener( 'click', togglePanel );
	button.removeEventListener( 'click', initPanelClick );
}

/**
 * Function to handle client preferences based on the existence of 'citizen-client-prefs' element.
 * If the element exists, it loads client preferences and config, sets a callback for skin theme change,
 * updates the document's classes based on the theme, and renders the client preferences.
 */
function handleClientPreferences() {
	const clientPreferenceExists = document.getElementById( 'citizen-client-prefs' ) !== null;
	if ( clientPreferenceExists ) {
		const clientPreferences = require( /** @type {string} */( './clientPreferences.js' ) );
		const clientPreferenceConfig = ( require( './clientPreferences.json' ) );

		clientPreferenceConfig[ 'skin-theme' ].callback = () => {
			const LEGACY_THEME_CLASSES = [
				'skin-citizen-auto',
				'skin-citizen-light',
				'skin-citizen-dark'
			];
			const legacyThemeKey = Object.keys( CLIENTPREFS_THEME_MAP ).find( ( key ) => CLIENTPREFS_THEME_MAP[ key ] === clientPrefs.get( 'skin-theme' ) );
			document.documentElement.classList.remove( ...LEGACY_THEME_CLASSES );
			document.documentElement.classList.add( `skin-citizen-${ legacyThemeKey }` );
		};

		clientPreferences.render( '#citizen-client-prefs', clientPreferenceConfig );
	}
}

/**
 * Initializes a panel by creating it, attaching it to a target element,
 * setting up click event listeners, and handling client preferences.
 *
 * @param {Event} event - The event triggering the initialization.
 */
function initPanel( event ) {
	const panel = createPanel();
	attachPanel( panel, event.currentTarget );
	initPanelClick( event.currentTarget );
	handleClientPreferences();
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

	if ( typeof window.localStorage !== 'undefined' && typeof window.mw !== 'undefined' ) {
		const headerTools = document.querySelector( '.citizen-header__end' );
		const container = document.createElement( 'div' );
		const button = document.createElement( 'button' );
		const icon = document.createElement( 'span' );

		// citizen-pref
		container.id = 'citizen-pref';

		container.classList.add( 'citizen-pref', 'citizen-header__item' );
		button.id = 'citizen-pref-toggle';

		button.classList.add( 'citizen-pref__button', 'citizen-header__button', 'citizen-button' );
		button.setAttribute( 'title', mw.message( 'preferences' ).text() );
		button.setAttribute( 'aria-label', mw.message( 'preferences' ).text() );
		button.setAttribute( 'aria-controls', 'citizen-pref-panel' );
		button.setAttribute( 'aria-expanded', false );
		icon.classList.add( 'citizen-ui-icon', 'mw-ui-icon-wikimedia-settings' );
		button.prepend( icon );
		container.prepend( button );
		headerTools.prepend( container );

		button.addEventListener( 'click', initPanel, { once: true } );
	} else {
		// eslint-disable-next-line no-console
		console.error( 'Preference module is disabled due to localStoarge being not avaliable.' );
	}
}

initPref( window );
