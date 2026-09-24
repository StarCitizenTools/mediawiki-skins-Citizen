/**
 * The side column's client-side panel registry.
 *
 * Fires `citizen.pageAside.register` once with `{ register }`. A registration
 * builds the same chrome the server renders for its own panels — root,
 * heading and body as direct children in that order — and returns the body
 * for the caller to fill. The aside is server-rendered only on pages that
 * have a panel of their own, so anywhere else `register()` returns null —
 * silently for a valid definition, with a warning for a malformed one, so a
 * mistake shows up on whatever page its author tests on.
 */

const ASIDE_SELECTOR = '.citizen-page-aside';
const ID_PREFIX = 'citizen-page-aside-';
const ID_PATTERN = /^[a-z][a-z0-9-]*$/;
const DEFAULT_ORDER = 100;
const STICKY_CLASS = 'citizen-page-aside__sticky';
const PLACEMENTS = [ 'flow', 'sticky' ];
const WARN_PREFIX = 'citizen.pageAside.register: ';

/**
 * @typedef {Object} PanelDefinition
 * @property {string} id Lowercase letters, digits and hyphens, starting with a letter
 * @property {string} label Plain-text heading
 * @property {'flow'|'sticky'} [placement] Scrolls with the page (default) or rides in the
 *  sticky block
 * @property {number} [order] Position within its zone; the built-ins are 10 (flow) and 20
 *  (sticky), default 100
 */

/**
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Object} deps.mw
 * @return {{ init: () => void }}
 */
function createPageAside( { document, mw } ) {
	/**
	 * @param {string} message
	 * @return {null}
	 */
	function refuse( message ) {
		mw.log.warn( WARN_PREFIX + message );
		return null;
	}

	/**
	 * Before the first sibling with a greater order. Siblings without
	 * data-order predate the attribute and keep their place. Flow panels
	 * also stop at the sticky block — or at an outline that is still a
	 * direct child on older markup — whatever their order, so nothing ever
	 * lands under the sticky element.
	 *
	 * @param {Element} zone
	 * @param {HTMLElement} panel
	 * @param {number} order
	 * @param {boolean} stopAtSticky
	 */
	function insertByOrder( zone, panel, order, stopAtSticky ) {
		const next = Array.from( zone.children ).find(
			( child ) => ( stopAtSticky && ( child.classList.contains( STICKY_CLASS ) || child.classList.contains( 'citizen-toc' ) ) ) ||
				( child.hasAttribute( 'data-order' ) && Number( child.getAttribute( 'data-order' ) ) > order )
		);
		zone.insertBefore( panel, next || null );
	}

	/**
	 * @param {Element} aside
	 * @return {Element} The sticky block, created at the end of the aside when the page has none
	 */
	function stickyZone( aside ) {
		let zone = aside.querySelector( ':scope > .' + STICKY_CLASS );
		if ( !zone ) {
			zone = document.createElement( 'div' );
			zone.className = STICKY_CLASS;
			aside.append( zone );
		}
		return zone;
	}

	/**
	 * @param {PanelDefinition} definition
	 * @return {HTMLElement|null} The new panel's body, or null when nothing was added
	 */
	function register( definition ) {
		if ( !definition || typeof definition !== 'object' || Array.isArray( definition ) ) {
			return refuse( 'expected an object, got ' + typeof definition );
		}
		const { id, label } = definition;
		const order = definition.order === undefined ? DEFAULT_ORDER : definition.order;
		if ( typeof id !== 'string' || !ID_PATTERN.test( id ) ) {
			return refuse( 'id must be lowercase letters, digits and hyphens, starting with a letter' );
		}
		if ( typeof label !== 'string' || label.trim() === '' ) {
			return refuse( 'label must be a non-empty string (' + id + ')' );
		}
		if ( typeof order !== 'number' || !Number.isFinite( order ) ) {
			return refuse( 'order must be a finite number (' + id + ')' );
		}
		const placement = definition.placement === undefined ? 'flow' : definition.placement;
		if ( !PLACEMENTS.includes( placement ) ) {
			return refuse( 'placement must be "flow" or "sticky" (' + id + ')' );
		}
		const aside = document.querySelector( ASIDE_SELECTOR );
		if ( !aside ) {
			return null;
		}
		// A taken id shows on the root (`citizen-page-aside-{id}`) of every panel
		// but Contents, whose root is `citizen-toc` and which carries it only on
		// its heading, so refusing every taken id needs both lookups.
		if ( document.getElementById( ID_PREFIX + id ) || document.getElementById( ID_PREFIX + id + '-heading' ) ) {
			return refuse( 'a panel with id "' + id + '" already exists' );
		}

		const panel = document.createElement( 'div' );
		panel.id = ID_PREFIX + id;
		panel.className = 'citizen-page-aside__panel citizen-page-aside__panel--' + id;
		panel.dataset.order = String( order );

		const heading = document.createElement( 'div' );
		heading.id = ID_PREFIX + id + '-heading';
		heading.className = 'citizen-page-aside__heading';
		heading.textContent = label;

		const body = document.createElement( 'div' );
		body.className = 'citizen-page-aside__body';

		panel.append( heading, body );
		if ( placement === 'sticky' ) {
			insertByOrder( stickyZone( aside ), panel, order, false );
		} else {
			insertByOrder( aside, panel, order, true );
		}
		return body;
	}

	function init() {
		mw.hook( 'citizen.pageAside.register' ).fire( { register } );
	}

	return { init };
}

module.exports = { createPageAside };
