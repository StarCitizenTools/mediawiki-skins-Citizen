<?php

use MediaWiki\MediaWikiServices;

/**
 * BaseTemplate class for the Citizen skin
 * TODO: Add missing title to buttons
 * @ingroup Skins
 */
class CitizenTemplate extends BaseTemplate {
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

			'msg-citizen-header-menu-toggle' => $this->getMsg( 'citizen-header-menu-toggle' )->text(),
			'msg-citizen-header-search-toggle' => $this->getMsg( 'citizen-header-search-toggle' )->text(),

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

			'msg-sitetitle' => $this->getMsg( 'sitetitle' )->text(),
			'html-mainpage-attributes' => Xml::expandAttributes(
				Linker::tooltipAndAccesskeyAttribs( 'p-logo' ) + [
					'href' => Skin::makeMainPageUrl(),
				]
			),
		];

		// TODO: Convert the rest of the header to Mustache
		ob_start();

		$html = $this->getHamburgerMenu();

		echo $html;
		$params['html-unported-hamburgermenu'] = ob_get_contents();
		ob_end_clean();

		ob_start();

		$html = $this->getUserIcons();

		echo $html;
		$params['html-unported-usericons'] = ob_get_contents();
		ob_end_clean();

		ob_start();

		$html = $this->getSearch();

		echo $html;
		$params['html-unported-search'] = ob_get_contents();
		ob_end_clean();

		// TODO: Convert the page tools to Mustache
		ob_start();

		$html = $this->getPageTools();

		echo $html;
		$params['html-unported-pagetools'] = ob_get_contents();
		ob_end_clean();

		// TODO: Convert the page links to Mustache
		ob_start();

		$html = $this->getPageLinks();

		echo $html;
		$params['html-unported-pagelinks'] = ob_get_contents();
		ob_end_clean();

		// TODO: Convert the rest to Mustache
		ob_start();

		$html = $this->getBottomBar();

		echo $html;
		$params['html-unported'] = ob_get_contents();
		ob_end_clean();

		// Prepare and output the HTML response
		$templates = new TemplateParser( __DIR__ . '/templates' );
		echo $templates->processTemplate( 'skin', $params );
	}

	/**
	 * Generates the bottom bar
	 * @return string html
	 */
	protected function getBottomBar() {
		try {
			$buttonEnabled = $this->config->get( 'CitizenEnableButton' );
			$buttonLink = $this->config->get( 'CitizenButtonLink' );
			$buttonTitle = $this->config->get( 'CitizenButtonTitle' );
			$buttonText = $this->config->get( 'CitizenButtonText' );
		} catch ( ConfigException $e ) {
			return '';
		}

		if ( $buttonEnabled === false ) {
			return '';
		}

		return Html::rawElement(
			'div',
			[ 'id' => 'mw-bottombar' ],
			Html::rawElement(
		'div',
				[ 'id' => 'mw-bottombar-buttons' ],
				Html::rawElement(
					'div',
					[ 'class' => 'citizen-ui-icon', 'id' => 'citizen-ui-button' ],
					Html::rawElement(
						'a',
						[
							'href' => $buttonLink,
							'title' => $buttonTitle,
							'rel' => 'noopener noreferrer',
							'target' => '_blank',
						],
						$buttonText
					)
				)
			)
		);
	}

	/**
	 * Generates the hamburger menu
	 * @return string html
	 */
	protected function getHamburgerMenu() {
		// Get sidebar links
		$html = Html::rawElement(
			'div',
			[ 'class' => 'mw-header-menu-drawer' ],
			Html::rawElement(
				'div',
				[ 'class' => 'mw-header-menu-drawer-container' ],
				Html::rawElement(
				'div',
				[ 'class' => 'mw-header-banner', 'role' => 'banner' ],
					$this->getLogo() .
					$this->getSiteTitle( 'text' )
				) .
				// Container for navigation and tools
				Html::rawElement(
					'div',
					[ 'class' => 'mw-nav-links' ],
					$this->getSiteNavigation()
				) .
				$this->getUserLinks()
			)
		);

		return $html;
	}

	/**
	 * Generates the sitetitle
	 * @param string $option
	 * @return string html
	 */
	protected function getSiteTitle( $option ) {
		$html = '';
		$language = $this->getSkin()->getLanguage();
		$siteTitle = $language->convert( $this->getMsg( 'sitetitle' )->escaped() );

		if ( $option === 'link' ) {
			$html .= Html::rawElement(
				'a',
				[
					'id' => 'p-banner',
					'class' => 'mw-wiki-title',
					'href' => $this->data['nav_urls']['mainpage']['href'],
				] + Linker::tooltipAndAccesskeyAttribs( 'p-logo' ),
				$siteTitle
			);
		} elseif ( $option === 'text' ) {
			$html .= Html::rawElement(
				'span',
				[
					'id' => 'p-banner',
					'class' => 'mw-wiki-title',
				],
				$siteTitle
			);
		}

		return $html;
	}

	/**
	 * Generates the logo
	 * @return string html
	 */
	protected function getLogo() {
		$html = Html::rawElement( 'a', [
				'href' => $this->data['nav_urls']['mainpage']['href'],
				'id' => 'p-logo',
				'class' => 'mw-wiki-logo',
			] + Linker::tooltipAndAccesskeyAttribs( 'p-logo' ) );
		return $html;
	}

	/**
	 * Generates the search form
	 * In order to use the old opensearch, change search-input to searchInput
	 * See T219590 for more details
	 * @return string html
	 */
	protected function getSearch() {
		$html = Html::openElement( 'form', [
			'action' => $this->get( 'wgScript' ),
			'role' => 'search',
			'id' => 'search-form',
			'autocomplete' => 'off',
		] );
		$html .= Html::hidden( 'title', $this->get( 'searchtitle' ) );
		$html .= Html::label( $this->getMsg( 'search' )->text(), 'search-input',
			[ 'class' => 'screen-reader-text' ] );
		$html .= $this->makeSearchInput( [ 'id' => 'search-input', 'type' => 'search' ] );
		$html .= $this->makeSearchButton( 'image', [
			'id' => 'search-button',
			'src' => $this->getSkin()->getSkinStylePath( 'resources/images/icons/search.svg' ),
		] );

		return $html . Html::closeElement( 'form' );
	}

	/**
	 * Generates the sidebar
	 * Set the elements to true to allow them to be part of the sidebar
	 * Or get rid of this entirely, and take the specific bits to use wherever you actually want them
	 *  * Toolbox is the page/site tools that appears under the sidebar in vector
	 *  * Languages is the interlanguage links on the page via en:... es:... etc
	 *  * Default is each user-specified box as defined on MediaWiki:Sidebar;
	 *    you will still need a foreach loop to parse these.
	 * @return string html
	 */
	protected function getSiteNavigation() {
		$html = '';

		$sidebar = $this->getSidebar();
		$sidebar['SEARCH'] = false;
		$sidebar['TOOLBOX'] = true;
		$sidebar['LANGUAGES'] = false;

		foreach ( $sidebar as $name => $content ) {
			if ( $content === false ) {
				continue;
			}
			// Numeric strings gets an integer when set as key, cast back - T73639
			$name = (string)$name;

			switch ( $name ) {
				case 'SEARCH':
					$html .= $this->getSearch();
					break;
				case 'TOOLBOX':
					$html .= $this->getPortlet( 'tb', $this->getToolbox(), 'toolbox' );
					break;
				case 'LANGUAGES':
					$html .= $this->getLanguageLinks();
					break;
				default:
					$html .= $this->getPortlet( $name, $content['content'] );
					break;
			}
		}

		return $html;
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
	 * Generates user tools menu
	 * @return string html
	 */
	protected function getUserLinks() {
		$personalTools = $this->getPersonalTools();

		$html = '';

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

		$html .= Html::openElement( 'div', [ 'class' => 'mw-user-links' ] );
		$html .= $this->getPortlet( 'personal', $personalTools, 'personaltools' );

		return $html . Html::closeElement( 'div' );
	}

	/**
	 * In other languages list
	 *
	 * @return string html
	 */
	protected function getLanguageLinks() {
		$html = '';
		if ( $this->data['language_urls'] !== false ) {
			$html .= $this->getPortlet( 'lang', $this->data['language_urls'], 'otherlanguages' );
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
