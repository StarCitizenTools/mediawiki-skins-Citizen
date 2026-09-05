const
	MOBILE_QUERY = '( max-width: 1119.98px )',
	BAR_SELECTOR = '.citizen-page-actions',
	COLLAPSED_CLASS = 'citizen-page-actions--collapsed',
	CARD_SELECTOR = '#citizen-page-actions-more__card .citizen-menu__card-content',
	VIEWS_ID = 'p-views',
	ASSOCIATED_ID = 'p-associated-pages',
	LIST_SELECTOR = '.citizen-menu__content-list',
	// The one action worth a permanent slot. Both ids can be present; the
	// merged-button rule in Pagetools.less decides which of them is drawn.
	KEEP_SELECTOR = '#ca-ve-edit, #ca-edit',
	// What MenuItemDecorator::addButtonClassesToMenuItems adds. A list, not a
	// prefix match, so nothing else can be taken by mistake.
	BUTTON_CLASSES = [
		'citizen-cdx-button--size-large',
		'cdx-button',
		'cdx-button--fake-button',
		'cdx-button--fake-button--enabled',
		'cdx-button--weight-quiet'
	];

/**
 * Below tablet the page-actions bar is reduced to the one action worth a
 * permanent slot plus the way to everything else, and the menus it drops are
 * relocated into the overflow card so nothing becomes unreachable.
 *
 * The nodes are moved rather than copied. A copy would duplicate every id in
 * the menu, and `mw.util.addPortletLink( 'p-views', … )` would keep targeting
 * the original — so a gadget's tab would land in whichever of the two the
 * skin happened not to be showing. Moving keeps one DOM and one target.
 *
 * Nothing here runs without script, which is the intended fallback: the bar
 * stays as it renders, and the label fix already makes that legible.
 */
class PageTools {
	constructor( { document, window } ) {
		this.document = document;
		this.window = window;
		/** @type {{node: Element, parent: Element, next: Node|null}[]} */
		this.moves = [];
		/** @type {WeakMap<Element, string[]>} */
		this.buttonChrome = new WeakMap();
		this.shell = null;
		this.isCollapsed = false;
		this.sync = this.sync.bind( this );
	}

	/**
	 * The narrow-viewport media query, or null where matchMedia is unavailable.
	 *
	 * @return {MediaQueryList|null}
	 */
	getMobileQuery() {
		return typeof this.window.matchMedia === 'function' ?
			this.window.matchMedia( MOBILE_QUERY ) :
			null;
	}

	/**
	 * Move a node, remembering where it came from so it can go back. A node
	 * with no parent cannot be put back, so it is not moved either.
	 *
	 * @param {Element} node
	 * @param {Element} parent
	 * @param {Node|null} before
	 */
	moveNode( node, parent, before ) {
		const origin = node.parentElement;
		if ( !origin ) {
			return;
		}
		this.moves.push( { node, parent: origin, next: node.nextSibling } );
		parent.insertBefore( node, before );
	}

	/**
	 * In the bar these links are buttons; in the card they are rows, and
	 * Codex's button styles would set them apart from every row beside them.
	 *
	 * @param {Element} scope
	 */
	undress( scope ) {
		scope.querySelectorAll( 'a' ).forEach( ( link ) => {
			const worn = BUTTON_CLASSES.filter( ( name ) => link.classList.contains( name ) );
			if ( worn.length > 0 ) {
				this.buttonChrome.set( link, worn );
				link.classList.remove( ...worn );
			}
		} );
	}

	/**
	 * Put it back on the way out.
	 *
	 * @param {Element} scope
	 */
	dress( scope ) {
		scope.querySelectorAll( 'a' ).forEach( ( link ) => {
			const worn = this.buttonChrome.get( link );
			if ( worn ) {
				link.classList.add( ...worn );
				this.buttonChrome.delete( link );
			}
		} );
	}

	/**
	 * An empty copy of a portlet's chrome — heading and list, no items and no
	 * id, since the original keeps both.
	 *
	 * @param {Element} portlet
	 * @return {Element}
	 */
	buildShell( portlet ) {
		const shell = this.document.createElement( 'nav' );
		shell.className = portlet.className;
		const label = portlet.getAttribute( 'aria-label' );
		if ( label ) {
			shell.setAttribute( 'aria-label', label );
		}
		const heading = portlet.querySelector( '.citizen-menu__heading' );
		if ( heading ) {
			shell.appendChild( heading.cloneNode( true ) );
		}
		const content = this.document.createElement( 'div' );
		content.className = 'citizen-menu__content';
		const list = this.document.createElement( 'ul' );
		list.className = 'citizen-menu__content-list';
		content.appendChild( list );
		shell.appendChild( content );
		return shell;
	}

	/**
	 * The card's list for the views that no longer fit in the bar, built on
	 * first use — a page whose only view is the editor never needs one.
	 *
	 * @return {Element|null}
	 */
	ensureShell() {
		if ( this.shell ) {
			return this.shell.querySelector( LIST_SELECTOR );
		}
		const views = this.document.getElementById( VIEWS_ID );
		const card = this.document.querySelector( CARD_SELECTOR );
		if ( !views || !card ) {
			return null;
		}
		this.shell = this.buildShell( views );
		card.insertBefore( this.shell, card.firstChild );
		return this.shell.querySelector( LIST_SELECTOR );
	}

	collapse() {
		if ( this.isCollapsed ) {
			return;
		}
		const
			bar = this.document.querySelector( BAR_SELECTOR ),
			card = this.document.querySelector( CARD_SELECTOR );
		// No card means no sink, and the bar is then the only place these menus
		// exist. Leaving it whole is the right failure: it is the bar this
		// change replaces, not a broken one, and nothing is unreachable.
		if ( !bar || !card ) {
			return;
		}
		this.isCollapsed = true;
		bar.classList.add( COLLAPSED_CLASS );

		const associated = this.document.getElementById( ASSOCIATED_ID );
		if ( associated && associated.parentElement === bar ) {
			this.moveNode( associated, card, card.firstChild );
			this.undress( associated );
		}

		const views = this.document.getElementById( VIEWS_ID );
		const list = views && views.querySelector( LIST_SELECTOR );
		if ( !list ) {
			return;
		}
		// Read the whole list before moving any of it: children is live.
		const spare = Array.from( list.children )
			.filter( ( item ) => !item.matches( KEEP_SELECTOR ) );
		spare.forEach( ( item ) => this.adopt( item ) );
	}

	/**
	 * Send one view into the card.
	 *
	 * @param {Element} item
	 */
	adopt( item ) {
		const target = this.ensureShell();
		if ( target ) {
			this.moveNode( item, target, null );
			this.undress( item );
		}
	}

	restore() {
		if ( !this.isCollapsed ) {
			return;
		}
		this.isCollapsed = false;
		const bar = this.document.querySelector( BAR_SELECTOR );
		if ( bar ) {
			bar.classList.remove( COLLAPSED_CLASS );
		}
		// Reverse order, so each node's remembered next sibling is back in
		// place before it is reinserted.
		this.moves.reverse().forEach( ( { node, parent, next } ) => {
			this.dress( node );
			parent.insertBefore( node, next );
		} );
		this.moves = [];
		if ( this.shell ) {
			this.shell.remove();
			this.shell = null;
		}
	}

	sync() {
		const query = this.getMobileQuery();
		if ( query && query.matches ) {
			this.collapse();
		} else {
			this.restore();
		}
	}

	/**
	 * A gadget calling addPortletLink after this has run would drop a tab back
	 * into the bar, which is the one thing the collapse is for.
	 */
	observeLateViews() {
		const views = this.document.getElementById( VIEWS_ID );
		const list = views && views.querySelector( LIST_SELECTOR );
		// Bound to a local first: a guard on the property does not narrow the
		// type at the construction site.
		const Observer = this.window.MutationObserver;
		if ( !list || typeof Observer !== 'function' ) {
			return;
		}
		const observer = new Observer( ( records ) => {
			if ( !this.isCollapsed ) {
				return;
			}
			records.forEach( ( record ) => {
				record.addedNodes.forEach( ( node ) => {
					if ( node.nodeType === 1 && !node.matches( KEEP_SELECTOR ) ) {
						this.adopt( /** @type {Element} */ ( node ) );
					}
				} );
			} );
		} );
		observer.observe( list, { childList: true } );
	}

	init() {
		this.sync();
		this.observeLateViews();
		const query = this.getMobileQuery();
		if ( query && typeof query.addEventListener === 'function' ) {
			query.addEventListener( 'change', this.sync );
		}
	}
}

/**
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Window} deps.window
 * @return {PageTools}
 */
function createPageTools( { document, window } ) {
	return new PageTools( { document, window } );
}

module.exports = { createPageTools };
