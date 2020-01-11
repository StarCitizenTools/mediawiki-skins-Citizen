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
		$html = $this->get( 'headelement' );
		$loggedInClass = 'not-logged';

		// Add class if logged in
		if ( $this->getSkin()->getUser()->isLoggedIn() ) {
			$loggedInClass = 'logged-in';
		}

		$html .= Html::rawElement(
			'div',
			[ 'class' => $loggedInClass, 'id' => 'mw-wrapper' ],
			$this->getHeader() .
			$this->getMainBody() .
			$this->getFooterBlock() .
			$this->getSideTitle() .
			$this->getBottomBar()
		);

		$html .= $this->getTrail();
		$html .= Html::closeElement( 'body' );
		$html .= Html::closeElement( 'html' );

		echo $html;
	}

	/**
	 * The header containing the mobile site navigation and user icons + search
	 *
	 * @return string Header
	 */
	protected function getHeader() {
		$header =
			Html::openElement( 'header',
				[ 'class' => 'mw-header-container', 'id' => 'mw-navigation' ] );

		// Site navigation menu
		$navigation =
			Html::rawElement(
				'div',
				[ 'class' => 'mw-header-icons' ],
				$this->getHamburgerMenu()
			);

		// User icons and Search bar
		$userIconsSearchBar =
			Html::rawElement(
				'div',
				[ 'class' => 'mw-header-icons' ],
				Html::rawElement(
					'div',
					[ 'class' => 'mw-header', 'id' => 'user-icons' ],
					$this->getUserIcons()
				) .
				$this->getSearchToggle()
			);

		return $header . $navigation . $userIconsSearchBar . Html::closeElement( 'header' );
	}

	/**
	 * The main body holding all content
	 *
	 * @return string Main Body
	 */
	protected function getMainBody() {
		return Html::rawElement(
			'main',
			[ 'class' => 'mw-body', 'id' => 'content', 'role' => 'main' ],
			// Container for compatibility with extensions
			Html::rawElement(
				'section',
				[ 'id' => 'mw-body-container' ],
				$this->getSiteNotice() .
				$this->getNewTalk() .
				$this->getIndicators() .
				$this->getPageTools() .
				Html::rawElement(
					'h1',
					[ 'class' => 'firstHeading', 'lang' => $this->get( 'pageLanguage' ) ],
					$this->get( 'title' )
				) .
				Html::rawElement(
					'div',
					[ 'id' => 'siteSub' ],
					$this->getMsg( 'tagline' )->parse()
				) .
				Html::rawElement(
					'div',
					[ 'class' => 'mw-body-content' ],
					Html::rawElement(
						'div',
						[ 'id' => 'contentSub' ],
						$this->getPageSubtitle() .
						Html::rawElement(
							'p',
							[],
							$this->get( 'undelete' )
						)
					) .
					$this->get( 'bodycontent' ) .
					$this->getClear() .
					Html::rawElement(
						'div',
						[ 'class' => 'printfooter' ],
						$this->get( 'printfooter' )
					) .
					$this->getPageLinks() .
					$this->getCategoryLinks()
				) .
				$this->getDataAfterContent() .
				$this->get( 'debughtml' )
			)
		);
	}

	/**
	 * The rotated site title
	 *
	 * @return string
	 */
	protected function getSideTitle() {
		return Html::rawElement(
			'div',
			[ 'class' => 'mw-sidebar-sitename', 'role' => 'banner' ],
			$this->getSiteTitle( 'link' )
		);
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
	 * Generates the search button
	 * @return string html
	 */
	protected function getSearchToggle() {
		return Html::rawElement(
			'div',
			[ 'class' => 'mw-header-end', 'id' => 'site-search' ],
			Html::rawElement(
				'input',
				[
					'type' => 'checkbox',
					'role' => 'button',
					'title' => 'Toggle Search',
					'id' => 'search-toggle',
				]
			) .
			// Search button
			Html::rawElement(
				'div',
				[ 'id' => 'search-toggle-icon-container' ],
				Html::rawElement(
					'div',
					[ 'id' => 'search-toggle-icon' ]
				)
			) .
			// Search form
			$this->getSearch()
		);
	}

	/**
	 * Generates the hamburger menu
	 * @return string html
	 */
	protected function getHamburgerMenu() {
		$html = Html::openElement(
			'div',
			[ 'class' => 'mw-header-end mw-header-menu' ]
		);

		$html .= Html::rawElement(
			'input',
			[ 'type' => 'checkbox', 'role' => 'button', 'title' => 'Toggle Menu' ]
		);

		// Actual hamburger
		$html .= Html::openElement( 'div', [ 'class' => 'mw-header-menu-toggle' ] );

		for ( $i = 1; $i <= 3; $i++ ) {
			$html .= Html::rawElement( 'span' );
		}
		$html .= Html::closeElement( 'div' );

		// Get sidebar links
		$html .= Html::rawElement(
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
					[ 'id' => 'p-nt-container' ],
					$this->getSiteNavigation()
				) .
				$this->getUserLinks()
			)
		);

		return $html . Html::closeElement( 'div' );
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
	 * Generates the description for footer
	 * @return string html
	 */
	protected function getFooterDesc() {
		$html = '';
		$language = $this->getSkin()->getLanguage();
		$siteDesc = $language->convert( $this->getMsg( 'citizen-footer-desc' )->escaped() );

		return $html . Html::rawElement( 'span', [
				'id' => 'mw-footer-desc',
			], $siteDesc );
	}

	/**
	 * Generates the tagline for footer
	 * @return string html
	 */
	protected function getFooterTagline() {
		$html = '';
		$language = $this->getSkin()->getLanguage();
		$siteTagline = $language->convert( $this->getMsg( 'citizen-footer-tagline' )->escaped() );

		return $html . Html::rawElement( 'span', [
				'id' => 'mw-footer-tagline',
			], $siteTagline );
	}

	/**
	 * Generates the logo
	 * @param string $id
	 *
	 * @return string html
	 */
	protected function getLogo( $id = 'p-logo' ) {
		$html = Html::element( 'a', [
				'href' => $this->data['nav_urls']['mainpage']['href'],
				'id' => 'p-logo',
				'class' => 'mw-wiki-logo',
			] + Linker::tooltipAndAccesskeyAttribs( 'p-logo' ) );
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
	 * Generates siteNotice, if any
	 * @return string html
	 */
	protected function getSiteNotice() {
		return $this->getIfExists( 'sitenotice', [
			'wrapper' => 'div',
			'parameters' => [ 'id' => 'siteNotice' ],
		] );
	}

	/**
	 * Generates new talk message banner, if any
	 * @return string html
	 */
	protected function getNewTalk() {
		return $this->getIfExists( 'newtalk', [
			'wrapper' => 'div',
			'parameters' => [ 'class' => 'usermessage' ],
		] );
	}

	/**
	 * Generates subtitle stuff, if any
	 * @return string html
	 */
	protected function getPageSubtitle() {
		return $this->getIfExists( 'subtitle', [ 'wrapper' => 'p' ] );
	}

	/**
	 * Generates category links, if any
	 * @return string html
	 */
	protected function getCategoryLinks() {
		return $this->getIfExists( 'catlinks' );
	}

	/**
	 * Generates data after content stuff, if any
	 * @return string html
	 */
	protected function getDataAfterContent() {
		return $this->getIfExists( 'dataAfterContent' );
	}

	/**
	 * Simple wrapper for random if-statement-wrapped $this->data things
	 *
	 * @param string $object name of thing
	 * @param array $setOptions
	 *
	 * @return string html
	 */
	protected function getIfExists( $object, $setOptions = [] ) {
		$options = $setOptions + [
				'wrapper' => 'none',
				'parameters' => [],
			];

		$html = '';

		if ( $this->data[$object] ) {
			if ( $options['wrapper'] === 'none' ) {
				$html .= $this->get( $object );
			} else {
				$html .= Html::rawElement( $options['wrapper'], $options['parameters'],
					$this->get( $object ) );
			}
		}

		return $html;
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
	 * Better renderer for getFooterIcons and getFooterLinks, based on Vector
	 *
	 * @param array $setOptions Miscellaneous other options
	 * * 'id' for footer id
	 * * 'order' to determine whether icons or links appear first: 'iconsfirst' or links, though in
	 *   practice we currently only check if it is or isn't 'iconsfirst'
	 * * 'link-prefix' to set the prefix for all link and block ids; most skins use 'f' or 'footer',
	 *   as in id='f-whatever' vs id='footer-whatever'
	 * * 'icon-style' to pass to getFooterIcons: "icononly", "nocopyright"
	 *   nested array
	 *
	 * @return string html
	 */
	protected function getFooterBlock( $setOptions = [] ) {
		// Set options and fill in defaults
		$options = $setOptions + [
				'id' => 'footer',
				'order' => 'linksfirst',
				'link-prefix' => 'footer',
				'icon-style' => 'icononly',
			];

		$validFooterIcons = $this->getFooterIcons( $options['icon-style'] );
		$validFooterLinks = $this->getFooterLinks();
		$html = '';

		$html .= Html::openElement( 'footer', [
			'id' => $options['id'],
			'role' => 'contentinfo',
			'lang' => $this->get( 'userlang' ),
			'dir' => $this->get( 'dir' ),
		] );

		$iconsHTML = '';
		if ( count( $validFooterIcons ) > 0 ) {
			$iconsHTML .= Html::openElement( 'div',
				[ 'id' => "{$options['link-prefix']}-container-icons" ] );
			$iconsHTML .= Html::openElement( 'div', [ 'id' => 'footer-bottom-container' ] );

			// Get tagline
			$iconsHTML .= $this->getFooterTagline();

			$iconsHTML .= Html::openElement( 'ul', [ 'id' => "{$options['link-prefix']}-icons" ] );
			foreach ( $validFooterIcons as $blockName => $footerIcons ) {
				$iconsHTML .= Html::openElement( 'li', [
					'id' => Sanitizer::escapeIdForAttribute( "{$options['link-prefix']}-{$blockName}ico" ),
					'class' => 'footer-icons',
				] );
				foreach ( $footerIcons as $icon ) {
					$iconsHTML .= $this->getSkin()->makeFooterIcon( $icon );
				}
				$iconsHTML .= Html::closeElement( 'li' );
			}
			$iconsHTML .= Html::closeElement( 'ul' );
			$iconsHTML .= Html::closeElement( 'div' );
			$iconsHTML .= Html::closeElement( 'div' );
		}

		$linksHTML = '';
		if ( count( $validFooterLinks ) > 0 ) {
			$linksHTML .= Html::openElement( 'div',
				[ 'id' => "{$options['link-prefix']}-container-list" ] );
			$linksHTML .= Html::openElement( 'ul', [
				'id' => "{$options['link-prefix']}-list",
				'class' => 'footer-places',
			] );

			// Site title
			$linksHTML .= Html::rawElement( 'li', [ 'id' => 'sitetitle' ],
				$this->getSiteTitle( 'text' ) );
			// Site description
			$linksHTML .= Html::rawElement( 'li', [ 'id' => 'sitedesc' ],
				$this->getFooterDesc() );

			foreach ( $validFooterLinks as $link ) {
				$linksHTML .= Html::rawElement( 'li',
					[ 'id' => Sanitizer::escapeIdForAttribute( $link ) ], $this->get( $link ) );
			}
			$linksHTML .= Html::closeElement( 'ul' );
			$linksHTML .= Html::closeElement( 'div' );
		}

		if ( $options['order'] === 'iconsfirst' ) {
			$html .= $iconsHTML . $linksHTML;
		} else {
			$html .= $linksHTML . $iconsHTML;
		}

		return $html . $this->getClear() . Html::closeElement( 'footer' );
	}
}
