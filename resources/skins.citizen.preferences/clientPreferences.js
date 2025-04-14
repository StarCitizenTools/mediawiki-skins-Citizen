/**
 * Based on @wikimedia/mediawiki.skins.clientpreferences 1.1.1
 *
 * @see https://github.com/wikimedia/mediawiki-skins-Vector/tree/master/resources/skins.vector.clientPreferences
 *
 * Modificactions
 * - Use localStoarge instead of cookies
 * - Add mw.message wrapper to replace message keys
 */

/**
 * @typedef {Object} ClientPreference
 * @property {string[]} options that are valid for this client preference
 * @property {string} preferenceKey for registered users.
 * @property {string} [type] defaults to radio. Supported: radio, switch
 * @property {Function} [callback] callback executed after a client preference has been modified.
 */

/**
 * @typedef {Object} PreferenceOption
 * @property {string} label
 * @property {string} value
 */

const portlets = require( './addPortlet.polyfill.js' );
const clientPrefs = require( './clientPrefs.polyfill.js' )();

/**
 * Wrapper for mw.message to replace some message keys with citizen-specific messages
 * * Some message keys are not merged into core upstream
 * * Translatewiki does not allow for duplicated message keys
 * * @see https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a741639085d70c22a9f49890542a142a223bf981#r141359264
 *
 * @param {string} messageKey
 * @return {string}
 */
function getMessage( messageKey ) {
	if ( messageKey.startsWith( 'skin-theme-' ) ) {
		messageKey = messageKey.replace( 'skin-theme-', 'citizen-theme-' );
	}
	return mw.message( messageKey );
}

/**
 * Get the list of client preferences that are active on the page, including hidden.
 *
 * @return {string[]} of active client preferences
 */
function getClientPreferences() {
	return Array.from( document.documentElement.classList ).filter(
		( className ) => className.match( /-clientpref-/ )
	).map( ( className ) => className.split( '-clientpref-' )[ 0 ] );
}

/**
 * Check if the feature is excluded from the current page.
 *
 * @param {string} featureName
 * @return {boolean}
 */
function isFeatureExcluded( featureName ) {
	return document.documentElement.classList.contains( featureName + '-clientpref-excluded' );
}

/**
 * Get the list of client preferences that are active on the page and not hidden.
 *
 * @param {Record<string,ClientPreference>} config
 * @return {string[]} of user facing client preferences
 */
function getVisibleClientPreferences( config ) {
	const active = getClientPreferences();
	// Order should be based on key in config.json
	return Object.keys( config ).filter( ( key ) => active.includes( key ) );
}

/**
 * @param {string} featureName
 * @param {string} value
 * @param {Record<string,ClientPreference>} config
 */
function toggleDocClassAndSave( featureName, value, config ) {
	const pref = config[ featureName ];
	const callback = pref.callback || ( () => {} );
	clientPrefs.set( featureName, value );
	// Client preferences often change the layout of the page significantly, so emit
	// a window resize event for other apps that need to update (T374092).
	window.dispatchEvent( new Event( 'resize' ) );
	callback();
}

/**
 * @param {string} featureName
 * @param {string} value
 * @return {string}
 */
const getInputId = ( featureName, value ) => `skin-client-pref-${ featureName }-value-${ value }`;

/**
 * @param {string} type
 * @param {string} featureName
 * @param {string} value
 * @return {HTMLInputElement}
 */
function makeInputElement( type, featureName, value ) {
	const input = document.createElement( 'input' );
	const name = `skin-client-pref-${ featureName }-group`;
	const id = getInputId( featureName, value );
	input.name = name;
	input.id = id;
	input.type = type;
	if ( type === 'checkbox' ) {
		input.checked = value === '1';
	} else {
		input.value = value;
	}
	input.setAttribute( 'data-event-name', id );
	return input;
}

/**
 * @param {string} featureName
 * @param {string} value
 * @return {HTMLLabelElement}
 */
function makeLabelElement( featureName, value ) {
	const label = document.createElement( 'label' );

	label.textContent = getMessage( `${ featureName }-${ value }-label` );
	label.setAttribute( 'for', getInputId( featureName, value ) );
	return label;
}

/**
 * Create an element that informs users that a feature is not functional
 * on a given page. This message is hidden by default and made visible in
 * CSS if a specific exclusion class exists.
 *
 * @param {string} featureName
 * @return {HTMLElement}
 */
function makeExclusionNotice( featureName ) {
	const p = document.createElement( 'p' );

	const noticeMessage = getMessage( `${ featureName }-exclusion-notice` );
	p.classList.add( 'exclusion-notice', `${ featureName }-exclusion-notice` );
	p.textContent = noticeMessage.text();
	return p;
}

/**
 * @param {Element} parent
 * @param {string} featureName
 * @param {string} value
 * @param {string} currentValue
 * @param {Record<string,ClientPreference>} config
 */
function appendRadioToggle( parent, featureName, value, currentValue, config ) {
	const input = makeInputElement( 'radio', featureName, value );
	// input.classList.add( 'cdx-radio__input' );
	input.classList.add( 'citizen-client-prefs-radio__input' );
	if ( currentValue === value ) {
		input.checked = true;
	}

	if ( isFeatureExcluded( featureName ) ) {
		input.disabled = true;
	}

	const icon = document.createElement( 'span' );
	// icon.classList.add( 'cdx-radio__icon' );
	icon.classList.add( 'citizen-client-prefs-radio__icon' );
	const label = makeLabelElement( featureName, value );
	// label.classList.add( 'cdx-radio__label' );
	label.classList.add( 'citizen-client-prefs-radio__label' );
	const container = document.createElement( 'div' );
	// container.classList.add( 'cdx-radio' );
	container.classList.add( 'citizen-client-prefs-radio' );
	container.appendChild( input );
	container.appendChild( icon );
	container.appendChild( label );
	parent.appendChild( container );
	input.addEventListener( 'change', () => {
		toggleDocClassAndSave( featureName, value, config );
	} );
}

/**
 * @param {Element} form
 * @param {string} featureName
 * @param {HTMLElement} labelElement
 * @param {string} currentValue
 * @param {Record<string,ClientPreference>} config
 */
function appendToggleSwitch( form, featureName, labelElement, currentValue, config ) {
	const input = makeInputElement( 'checkbox', featureName, currentValue );
	// input.classList.add( 'cdx-toggle-switch__input' );
	input.classList.add( 'citizen-client-prefs-toggle-switch__input' );
	const switcher = document.createElement( 'span' );
	// switcher.classList.add( 'cdx-toggle-switch__switch' );
	switcher.classList.add( 'citizen-client-prefs-toggle-switch__switch' );
	const grip = document.createElement( 'span' );
	// grip.classList.add( 'cdx-toggle-switch__switch__grip' );
	grip.classList.add( 'citizen-client-prefs-toggle-switch__switch__grip' );
	switcher.appendChild( grip );
	const label = labelElement || makeLabelElement( featureName, currentValue );
	// label.classList.add( 'cdx-toggle-switch__label' );
	label.classList.add( 'citizen-client-prefs-toggle-switch__label' );
	const toggleSwitch = document.createElement( 'span' );
	// toggleSwitch.classList.add( 'cdx-toggle-switch' );
	toggleSwitch.classList.add( 'citizen-client-prefs-toggle-switch' );
	toggleSwitch.appendChild( input );
	toggleSwitch.appendChild( switcher );
	toggleSwitch.appendChild( label );
	input.addEventListener( 'change', () => {
		toggleDocClassAndSave( featureName, input.checked ? '1' : '0', config );
	} );
	form.appendChild( toggleSwitch );
}

/**
 * @param {string} className
 * @return {Element}
 */
function createRow( className ) {
	const row = document.createElement( 'div' );
	row.setAttribute( 'class', className );
	return row;
}

/**
 * Get the label for the feature.
 *
 * @param {string} featureName
 * @return {MwMessage}
 */
const getFeatureLabelMsg = ( featureName ) => getMessage( `${ featureName }-name` );

/**
 * adds a toggle button
 *
 * @param {string} featureName
 * @param {Record<string,ClientPreference>} config
 * @return {Element|null}
 */
function makeControl( featureName, config ) {
	const pref = config[ featureName ];
	if ( !pref ) {
		return null;
	}
	const currentValue = clientPrefs.get( featureName );
	// The client preference was invalid. This shouldn't happen unless a gadget
	// or script has modified the documentElement.
	if ( typeof currentValue === 'boolean' ) {
		return null;
	}
	const row = createRow( '' );
	const form = document.createElement( 'form' );
	const type = pref.type || 'radio';
	switch ( type ) {
		case 'radio':
			pref.options.forEach( ( value ) => {
				appendRadioToggle( form, featureName, value, currentValue, config );
			} );
			break;
		case 'switch': {
			const labelElement = document.createElement( 'label' );
			labelElement.textContent = getFeatureLabelMsg( featureName ).text();
			appendToggleSwitch( form, featureName, labelElement, currentValue, config );
			break;
		} default:
			throw new Error( 'Unknown client preference! Only switch or radio are supported.' );
	}
	row.appendChild( form );

	if ( isFeatureExcluded( featureName ) ) {
		const exclusionNotice = makeExclusionNotice( featureName );
		row.appendChild( exclusionNotice );
	}
	return row;
}

/**
 * @param {Element} parent
 * @param {string} featureName
 * @param {Record<string,ClientPreference>} config
 */
function makeClientPreference( parent, featureName, config ) {
	const labelMsg = getFeatureLabelMsg( featureName );
	// If the user is not debugging messages and no language exists,
	// exit as its a hidden client preference.
	if ( !labelMsg.exists() && mw.config.get( 'wgUserLanguage' ) !== 'qqx' ) {
		return;
	} else {
		const id = `skin-client-prefs-${ featureName }`;
		const portlet = portlets.addDefaultPortlet( portlets.addPortlet( id, labelMsg.text() ) );
		const labelElement = portlet.querySelector( 'label' );

		const descriptionMsg = getMessage( `${ featureName }-description` );
		if ( descriptionMsg.exists() ) {
			const desc = document.createElement( 'span' );
			desc.classList.add( 'skin-client-pref-description' );
			desc.textContent = descriptionMsg.text();
			if ( labelElement && labelElement.parentNode ) {
				labelElement.appendChild( desc );
			}
		}
		const row = makeControl( featureName, config );
		parent.appendChild( portlet );
		if ( row ) {
			const tmp = mw.util.addPortletLink( id, '', '' );
			// create a dummy link
			if ( tmp ) {
				const link = tmp.querySelector( 'a' );
				if ( link ) {
					link.replaceWith( row );
				}
			}
		}
	}
}

/**
 * Fills the client side preference dropdown with controls.
 *
 * @param {string} selector of element to fill with client preferences
 * @param {Record<string,ClientPreference>} config
 * @return {Promise<Node>}
 */
function render( selector, config ) {
	const node = document.querySelector( selector );
	if ( !node ) {
		return Promise.reject();
	}
	return new Promise( ( resolve ) => {
		getVisibleClientPreferences( config ).forEach( ( pref ) => {
			makeClientPreference( node, pref, config );
		} );
		mw.requestIdleCallback( () => {
			resolve( node );
		} );
	} );
}

/**
 * @param {string} clickSelector what to click
 * @param {string} renderSelector where to render
 * @param {Record<string,ClientPreference>} config
 */
function bind( clickSelector, renderSelector, config ) {
	let enhanced = false;
	const chk = /** @type {HTMLInputElement} */ (
		document.querySelector( clickSelector )
	);
	if ( !chk ) {
		return;
	}
	if ( chk.checked ) {
		render( renderSelector, config );
		enhanced = true;
	} else {
		chk.addEventListener( 'input', () => {
			if ( enhanced ) {
				return;
			}
			render( renderSelector, config );
			enhanced = true;
		} );
	}
}
module.exports = {
	bind,
	toggleDocClassAndSave,
	render
};
