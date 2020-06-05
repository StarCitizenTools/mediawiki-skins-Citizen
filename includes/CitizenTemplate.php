<?php

use MediaWiki\MediaWikiServices;

/**
 * BaseTemplate class for the Citizen skin
 * @ingroup Skins
 */
class CitizenTemplate extends BaseTemplate {
	/** @var array of alternate message keys for menu labels */
	private const MENU_LABEL_KEYS = [
		'tb' => 'toolbox',
		'personal' => 'personaltools',
	];

	/**
	 * Outputs the entire contents of the page
	 */
	public function execute() {
		// Naming conventions for Mustache parameters:
		// - Prefix "is" for boolean values.
		// - Prefix "msg-" for interface messages.
		// - Prefix "html-" for raw HTML (in front of other keys, if applicable).
		// - Prefix "data-" for an array of template parameters that should be passed directly
		//   to a template partial.
		// - Prefix "array-" for lists of any values.
		//
		// Source of value (first or second segment)
		// - Segment "page-" for data relating to the current page (e.g. Title, WikiPage, or OutputPage).
		// - Segment "hook-" for any thing generated from a hook.
		//   It should be followed by the name of the hook in hyphenated lowercase.
		//
		// Conditionally used values must use null to indicate absence (not false or '').
		$params = [
			'html-headelement' => $this->get( 'headelement', '' ),

			'msg-sitetitle' => $this->getMsg( 'sitetitle' )->text(),
			'html-mainpage-attributes' => Xml::expandAttributes(
				Linker::tooltipAndAccesskeyAttribs( 'p-logo' ) + [
					'href' => Skin::makeMainPageUrl(),
				]
			),

			'data-header' => [
				'msg-citizen-header-menu-toggle' => $this->getMsg( 'citizen-header-menu-toggle' )->text(),
				'data-menu' => $this->buildMenu(),
				'msg-citizen-header-search-toggle' => $this->getMsg( 'citizen-header-search-toggle' )->text(),
				'data-searchbox' => $this->buildSearchbox(),

				'html-unported-usericons' => $htmlUnportedUsericons,
			],

			'html-sitenotice' => $this->get( 'sitenotice', null ),
			'html-indicators' => $this->getIndicators(),
			// From Skin::getNewtalks(). Always returns string, cast to null if empty
			'html-newtalk' => $this->get( 'newtalk', '' ) ?: null,
			'page-langcode' => $this->getSkin()->getTitle()->getPageViewLanguage()->getHtmlCode(),

			// Remember that the string '0' is a valid title.
			// From OutputPage::getPageTitle, via ::setPageTitle().
			'html-title' => $this->get( 'title', '' ),

			'html-prebodyhtml' => $this->get( 'prebodyhtml', '' ),
			'msg-tagline' => $this->getMsg( 'tagline' )->text(),
			// TODO: mediawiki/SkinTemplate should expose langCode and langDir properly.
			'html-userlangattributes' => $this->get( 'userlangattributes', '' ),
			// From OutputPage::getSubtitle()
			'html-subtitle' => $this->get( 'subtitle', '' ),

			// TODO: Use directly Skin::getUndeleteLink() directly.
			// Always returns string, cast to null if empty.
			'html-undelete' => $this->get( 'undelete', null ) ?: null,

			// Result of OutputPage::addHTML calls
			'html-bodycontent' => $this->get( 'bodycontent' ),

			'html-printfooter' => $this->get( 'printfooter', null ),
			'html-catlinks' => $this->get( 'catlinks', '' ),
			'html-dataAfterContent' => $this->get( 'dataAfterContent', '' ),
			// From MWDebug::getHTMLDebugLog (when $wgShowDebug is enabled)
			'html-debuglog' => $this->get( 'debughtml', '' ),

			// From BaseTemplate::getTrail (handles bottom JavaScript)
			'html-printtail' => $this->getTrail() . '</body></html>',

			'data-footer' => [
				'html-userlangattributes' => $this->get( 'userlangattributes', '' ),
				'html-lastmodified' => $this->getLastMod(),
				'msg-sitetitle' => $this->getMsg( 'sitetitle' )->text(),
				'msg-citizen-footer-desc' => $this->getMsg( 'citizen-footer-desc' )->text(),
				'array-footer-rows' => $this->getFooterRows(),
				'msg-citizen-footer-tagline' => $this->getMsg( 'citizen-footer-tagline' )->text(),
				'array-footer-icons' => $this->getFooterIconsRow(),
			],

			'data-bottombar' => $this->buildBottombar(),
		];

		// TODO: Convert to Mustache
		ob_start();

		$html = $this->getUserIcons();

		echo $html;
		$htmlUnportedUsericons = ob_get_contents();
		ob_end_clean();

		ob_start();

		$html = $this->getPageTools();

		echo $html;
		$params['html-unported-pagetools'] = ob_get_contents();
		ob_end_clean();

		ob_start();

		$html = $this->getPageLinks();

		echo $html;
		$params['html-unported-pagelinks'] = ob_get_contents();
		ob_end_clean();

		// Prepare and output the HTML response
		$templates = new TemplateParser( __DIR__ . '/templates' );
		echo $templates->processTemplate( 'skin', $params );
	}

	/**
	 * Render the navigation menu
	 * TODO: Convert the rest to Mustache
	 * @return array
	 */
	private function buildMenu() : array {
		$skin = $this->getSkin();
		$portals = $skin->buildSidebar();
		$props = [];

		// Render portals
		foreach ( $portals as $name => $content ) {
			if ( $content === false ) {
				continue;
			}

			// Numeric strings gets an integer when set as key, cast back - T73639
			$name = (string)$name;

			switch ( $name ) {
				case 'SEARCH':
					break;
				case 'TOOLBOX':
					$portal = $this->getMenuData( 'tb',  $this->getToolbox() );
					// Run deprecated hooks.
					$citizenTemplate = $this;
					ob_start();
					// Use SidebarBeforeOutput instead.
					Hooks::run( 'SkinTemplateToolboxEnd', [ &$citizenTemplate, true ] );
					$htmlhookitems = ob_get_clean();
					$portal['html-items'] .= $htmlhookitems;
					$props[] = $portal;
					break;
				case 'LANGUAGES':
					$languages = $skin->getLanguages();
					$portal = $this->getMenuData( 'lang', $languages);
					// The language portal will be added provided either
					// languages exist or there is a value in html-after-portal
					// for example to show the add language wikidata link (T252800)
					if ( count( $languages ) || $portal['html-after-portal'] ) {
						$props[] = $portal;
					}
					break;
				default:
					// Historically some portals have been defined using HTML rather than arrays.
					// Let's move away from that to a uniform definition.
					if ( !is_array( $content ) ) {
						$html = $content;
						$content = [];
						wfDeprecated(
							"`content` field in portal $name must be array."
								. "Previously it could be a string but this is no longer supported.",
							'1.35.0'
						);
					} else {
						$html = false;
					}
					$portal = $this->getMenuData( $name, $content );
					if ( $html ) {
						$portal['html-items'] .= $html;
					}
					$props[] = $portal;
					break;
			}
		}

		$firstPortal = $props[0] ?? null;
		if ( $firstPortal ) {
			$firstPortal[ 'class' ] .= ' portal-first';
		}

		$personalTools = $this->getPersonalTools();
		// Move the Echo badges and ULS out of default list
		if ( isset( $personalTools['notifications-alert'] ) ) {
			unset( $personalTools['notifications-alert'] );
		}
		if ( isset( $personalTools['notifications-notice'] ) ) {
			unset( $personalTools['notifications-notice'] );
		}
		if ( isset( $personalTools['uls'] ) ) {
			unset( $personalTools['uls'] );
		}

		return [
			'data-logo' => $this->buildLogo(),
			'array-portals-rest' => array_slice( $props, 1 ),
			'data-portals-first' => $firstPortal,
			'data-personal-menu' => $this->getMenuData( 'personal', $personalTools ),
		];
	}

	/**
	 * Render the logo
	 * TODO: Use standardize classes and IDs
	 * TODO: Rebuild icon function based on Desktop Improvement Project
	 * @return array
	 */
	private function buildLogo() : array {
		$props = [
			'msg-sitetitle' => $this->getMsg( 'sitetitle' )->text(),
			'html-mainpage-attributes' => Xml::expandAttributes(
				Linker::tooltipAndAccesskeyAttribs( 'p-logo' ) + [
					'href' => Skin::makeMainPageUrl(),
				]
			),
		];
		return $props;
	}

	/**
	 * Render the search box
	 * TODO: Use standardized classes and IDs
	 * @return array
	 */
	private function buildSearchbox() : array {
		$config = $this->config;
		$props = [
			'form-action' => $config->get( 'Script' ),
			'html-input' => $this->makeSearchInput( [ 'id' => 'search-input' ] ),
			'html-button-search' => $this->makeSearchButton(
				'image',
				[ 'id' => 'search-button',
					'src' => $this->getSkin()->getSkinStylePath( 'resources/images/icons/search.svg' ),
				]
			),
			'msg-search' => $this->getMsg( 'search' )->text(),
			'page-title' => SpecialPage::getTitleFor( 'Search' )->getPrefixedDBkey(),
		];
		return $props;
	}

	/**
	 * Render the bottom bar
	 * TODO: Convert button text to i18n message.
	 * TODO: Refactor the bottom bar to be customizable
	 * @return array
	 */
	private function buildBottombar() : array {
		$config = $this->config;
		$buttonEnabled = $config->get( 'CitizenEnableButton' );
		if ( $buttonEnabled === false ) {
			return '';
		}
		$props = [
			'html-citizen-bottombar-button-href' => $config->get( 'CitizenButtonLink' ),
			'html-citizen-bottombar-button-title' => $config->get( 'CitizenButtonTitle' ),
			'html-citizen-bottombar-button-text' => $config->get( 'CitizenButtonText' ),
		];
		return $props;
	}

	/**
	 * Generates user icon bar
	 * @return string html
	 */
	protected function getUserIcons() {
		$personalTools = $this->getPersonalTools();
		$html = '';

		// Create the Echo badges and ULS
		$extraTools = [];
		if ( isset( $personalTools['notifications-alert'] ) ) {
			$extraTools['notifications-alert'] = $personalTools['notifications-alert'];
		}
		if ( isset( $personalTools['notifications-notice'] ) ) {
			$extraTools['notifications-notice'] = $personalTools['notifications-notice'];
		}
		if ( isset( $personalTools['uls'] ) ) {
			$extraTools['uls'] = $personalTools['uls'];
		}

		// Place the extra icons/outside stuff
		if ( !empty( $extraTools ) ) {
			$iconList = '';
			foreach ( $extraTools as $key => $item ) {
				$iconList .= $this->makeListItem( $key, $item );
			}

			$html .= Html::rawElement( 'div', [ 'id' => 'p-personal-extra', 'class' => 'p-body' ],
				Html::rawElement( 'ul', [], $iconList ) );
		}

		return $html;
	}

	/**
	 * Language variants. Displays list for converting between different scripts in the same language,
	 * if using a language where this is applicable (such as latin vs cyric display for serbian).
	 *
	 * @return string html
	 */
	protected function getVariants() {
		$html = '';
		if ( count( $this->data['content_navigation']['variants'] ) > 0 ) {
			$html .= $this->getPortlet( 'variants', $this->data['content_navigation']['variants'] );
		}

		return $html;
	}

	/**
	 * Generates page-related tools
	 * Possible visibility conditions:
	 * * true: always visible (bool)
	 * * false: never visible (bool)
	 * * 'login': only visible if logged in (string)
	 * * 'permission-*': only visible if user has permission
	 *   e.g. permission-edit = only visible if user can edit pages
	 * @return string html
	 */
	protected function getPageTools() {
		$html = '';

		try {
			$condition = $this->config->get( 'CitizenShowPageTools' );
		} catch ( ConfigException $e ) {
			$condition = false;
		}

		if ( $condition === 'login' ) {
			$condition = $this->getSkin()->getUser()->isLoggedIn();
		}

		if ( is_string( $condition ) && strpos( $condition, 'permission' ) === 0 ) {
			$permission = substr( $condition, 11 );
			try {
				$condition = MediaWikiServices::getInstance()->getPermissionManager()->userCan(
					$permission, $this->getSkin()->getUser(), $this->getSkin()->getTitle() );
			} catch ( Exception $e ) {
				$condition = false;
			}
		}

		// Only display if user is logged in
		if ( $condition === true ) {
			$html .= Html::openElement( 'div', [ 'class' => 'mw-side', 'id' => 'page-tools' ] );
			// 'View' actions for the page: view, edit, view history, etc
			$html .= $this->getPortlet( 'views', $this->data['content_navigation']['views'] );
			// Other actions for the page: move, delete, protect, everything else
			$html .= $this->getPortlet( 'actions', $this->data['content_navigation']['actions'] );
			$html .= Html::closeElement( 'div' );
		}

		return $html;
	}

	/**
	 * Generates page-related links at the bottom
	 * @return string html
	 */
	protected function getPageLinks() {
		// Namespaces: links for 'content' and 'talk' for namespaces with talkpages.
		// Otherwise is just the content.
		// Usually rendered as tabs on the top of the page.
		$html = $this->getPortlet( 'namespaces', $this->data['content_navigation']['namespaces'] );

		// Language variant options

		return $html . $this->getVariants();
	}

	/**
	 * Generates a block of navigation links with a header
	 *
	 * @param string $name
	 * @param array|string $content array of links for use with makeListItem, or a block of text
	 * @param null|string|array $msg
	 * @param array $setOptions random crap to rename/do/whatever
	 *
	 * @return string html
	 */
	protected function getPortlet( $name, $content, $msg = null, $setOptions = [] ) {
		// random stuff to override with any provided options
		$options = $setOptions + [
				// extra classes/ids
				'id' => 'p-' . $name,
				'class' => 'mw-portlet',
				'extra-classes' => '',
				// what to wrap the body list in, if anything
				'body-wrapper' => 'nav',
				'body-id' => null,
				'body-class' => 'mw-portlet-body',
				// makeListItem options
				'list-item' => [ 'text-wrapper' => [ 'tag' => 'span' ] ],
				// option to stick arbitrary stuff at the beginning of the ul
				'list-prepend' => '',
				// old toolbox hook support (use: [ 'SkinTemplateToolboxEnd' => [ &$skin, true ] ])
				'hooks' => '',
			];

		// Handle the different $msg possibilities
		if ( $msg === null ) {
			$msg = $name;
		} elseif ( is_array( $msg ) ) {
			$msgString = array_shift( $msg );
			$msgParams = $msg;
			$msg = $msgString;
		}
		$msgObj = $this->getMsg( $msg );
		if ( $msgObj->exists() ) {
			if ( isset( $msgParams ) && !empty( $msgParams ) ) {
				$msgString = $this->getMsg( $msg, $msgParams )->parse();
			} else {
				$msgString = $msgObj->parse();
			}
		} else {
			$msgString = htmlspecialchars( $msg );
		}

		$labelId = Sanitizer::escapeIdForAttribute( "p-$name-label" );

		if ( is_array( $content ) ) {
			$contentText =
				Html::openElement( 'ul',
					[ 'lang' => $this->get( 'userlang' ), 'dir' => $this->get( 'dir' ) ] );
			$contentText .= $options['list-prepend'];
			foreach ( $content as $key => $item ) {
				$contentText .= $this->makeListItem( $key, $item, $options['list-item'] );
			}
			// Compatibility with extensions still using SkinTemplateToolboxEnd or similar
			if ( is_array( $options['hooks'] ) ) {
				foreach ( $options['hooks'] as $hook ) {
					if ( is_string( $hook ) ) {
						$hookOptions = [];
					} else {
						// it should only be an array otherwise
						$hookOptions = array_values( $hook )[0];
						$hook = array_keys( $hook )[0];
					}
					$contentText .= $this->deprecatedHookHack( $hook, $hookOptions );
				}
			}

			$contentText .= Html::closeElement( 'ul' );
		} else {
			$contentText = $content;
		}

		// Special handling for role=search and other weird things
		$divOptions = [
			'role' => 'navigation',
			'id' => Sanitizer::escapeIdForAttribute( $options['id'] ),
			'title' => Linker::titleAttrib( $options['id'] ),
			'aria-labelledby' => $labelId,
		];
		if ( !is_array( $options['class'] ) ) {
			$class = [ $options['class'] ];
		}
		if ( !is_array( $options['extra-classes'] ) ) {
			$extraClasses = [ $options['extra-classes'] ];
		}
		$divOptions['class'] =
			array_merge( $class ?? $options['class'], $extraClasses ?? $options['extra-classes'] );

		$labelOptions = [
			'id' => $labelId,
			'lang' => $this->get( 'userlang' ),
			'dir' => $this->get( 'dir' ),
		];

		if ( $options['body-wrapper'] !== 'none' ) {
			$bodyDivOptions = [ 'class' => $options['body-class'] ];
			if ( is_string( $options['body-id'] ) ) {
				$bodyDivOptions['id'] = $options['body-id'];
			}
			$body =
				Html::rawElement( $options['body-wrapper'], $bodyDivOptions,
					$contentText . $this->getAfterPortlet( $name ) );
		} else {
			$body = $contentText . $this->getAfterPortlet( $name );
		}

		return Html::rawElement( 'div', $divOptions,
			Html::rawElement( 'h3', $labelOptions, $msgString ) . $body );
	}

	/**
	 * Wrapper to catch output of old hooks expecting to write directly to page
	 * We no longer do things that way.
	 *
	 * @param string $hook event
	 * @param array $hookOptions args
	 *
	 * @return string html
	 */
	protected function deprecatedHookHack( $hook, $hookOptions = [] ) {
		ob_start();
		try {
			Hooks::run( $hook, $hookOptions );
		} catch ( Exception $e ) {
			// Do nothing
		}

		$hookContents = ob_get_clean();
		if ( !trim( $hookContents ) ) {
			$hookContents = '';
		}

		return $hookContents;
	}

	/**
	 * @param string $label to be used to derive the id and human readable label of the menu
	 *  If the key has an entry in the constant MENU_LABEL_KEYS then that message will be used for the
	 *  human readable text instead.
	 * @param array $urls to convert to list items stored as string in html-items key
	 * @param array $options (optional) to be passed to makeListItem
	 * @return array
	 */
	private function getMenuData(
		string $label,
		array $urls = [],
		array $options = []
	) : array {
		// For some menu items, there is no language key corresponding with its menu key.
		// These inconsitencies are captured in MENU_LABEL_KEYS
		$msgObj = $this->getMsg( self::MENU_LABEL_KEYS[ $label ] ?? $label );
		$props = [
			'id' => "p-$label",
			'label-id' => "p-{$label}-label",
			// If no message exists fallback to plain text (T252727)
			'label' => $msgObj->exists() ? $msgObj->text() : $label,
			'html-items' => '',
			'html-tooltip' => Linker::tooltip( 'p-' . $label ),
		];

		foreach ( $urls as $key => $item ) {
			$props['html-items'] .= $this->makeListItem( $key, $item, $options );
		}

		$props['html-after-portal'] = $this->getAfterPortlet( $label );

		// Mark the portal as empty if it has no content
		$class = ( count( $urls ) == 0 && !$props['html-after-portal'] )
			? 'vector-menu-empty emptyPortlet' : '';
		$props['class'] = $class;
		return $props;
	}

	/**
	 * Get last modified message
	 * @return string html
	 */
	private function getLastMod() {
		$html = null;
		$footerLinks = $this->getFooterLinks();

		if ( isset( $footerLinks['info'] ) ) {
			if ( in_array( 'lastmod', $footerLinks['info'] ) ) {
				$key = array_search( 'lastmod', $footerLinks['info'] );
				$html = $this->get( $footerLinks['info'][$key], '' );
			}
		}

		return $html;
	}

	/**
	 * Get rows that make up the footer
	 * @return array for use in Mustache template describing the footer elements.
	 */
	private function getFooterRows() : array {
		$footerRows = [];
		$footerLinks = $this->getFooterLinks();

		foreach ( $footerLinks as $category => $links ) {
			$items = [];
			$rowId = "footer-$category";

			// Unset footer-info
			if ( $category !== 'info' ) {
				foreach ( $links as $link ) {
					$items[] = [
						'id' => "$rowId-$link",
						'html' => $this->get( $link, '' ),
					];
				}

				$footerRows[] = [
					'id' => $rowId,
					'className' => '',
					'array-items' => $items
				];
			}
		}

		// Append footer-info after links
		if ( isset( $footerLinks['info'] ) ) {
			$items = [];
			$rowId = "footer-info";

			foreach ( $footerLinks['info'] as $link ) {
				// Unset lastmod from footer link
				if ( $link !== 'lastmod' ) {
					$items[] = [
						'id' => "$rowId-$link",
						'html' => $this->get( $link, '' ),
					];
				}
			}

			$footerRows[] = [
				'id' => $rowId,
				'className' => '',
				'array-items' => $items
			];
		}

		return $footerRows;
	}

	/**
	 * Get footer icons
	 * @return array for use in Mustache template describing the footer icons.
	 */
	private function getFooterIconsRow() : array {
		$footerRows = [];

		// If footer icons are enabled append to the end of the rows
		$footerIcons = $this->getFooterIcons( 'icononly' );
		if ( count( $footerIcons ) > 0 ) {
			$items = [];
			foreach ( $footerIcons as $blockName => $blockIcons ) {
				$html = '';
				foreach ( $blockIcons as $icon ) {
					$html .= $this->getSkin()->makeFooterIcon( $icon );
				}
				$items[] = [
					'id' => 'footer-' . htmlspecialchars( $blockName ) . 'ico',
					'html' => $html,
				];
			}

			$footerRows[] = [
				'id' => 'footer-icons',
				'className' => 'noprint',
				'array-items' => $items,
			];
		}

		return $footerRows;
	}
}
