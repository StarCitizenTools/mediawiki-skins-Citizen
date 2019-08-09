<?php
/**
 * BaseTemplate class for the Citizen skin
 *
 * @ingroup Skins
 */
 //TODO: Add missing title to buttons
class CitizenTemplate extends BaseTemplate {
	/**
	 * Outputs the entire contents of the page
	 */
	public function execute() {
		$html = '';
		$html .= $this->get( 'headelement' );
		$loggedinclass = 'not-logged';

		// Add class if logged in
		if ( $this->getSkin()->getUser()->isLoggedIn() ) {
			$loggedinclass .= 'logged-in';
		}

		$html .= Html::rawElement( 'div', [ 'class' => $loggedinclass, 'id' => 'mw-wrapper' ],
			// Header
			Html::rawElement( 'header', [ 'class' => 'mw-header-container', 'id' => 'mw-navigation' ],
				Html::rawElement( 'div', [ 'class' => 'mw-header-icons'],
					// Site navigation menu
					$this->getHamburgerMenu()
				) .
				Html::rawElement( 'div', [ 'class' => 'mw-header-icons'],
					// User icons
					Html::rawElement( 'div', [ 'class' => 'mw-header', 'id' => 'user-icons' ],
						$this->getUserIcons()
					) .
					// Search bar
					$this->getSearchButton()
				)
			) .
			// Main body
			Html::rawElement( 'main', [ 'class' => 'mw-body', 'id' => 'content', 'role' => 'main' ],
			  // Container for compatiblity with extensions
				Html::rawElement( 'section', [ 'id' => 'mw-body-container' ],
					$this->getSiteNotice() .
					$this->getNewTalk() .
					$this->getIndicators() .
					// Page editing and tools
					$this->getPageTools() .
					Html::rawElement( 'h1',
						[
							'class' => 'firstHeading',
							'lang' => $this->get( 'pageLanguage' )
						],
						$this->get( 'title' )
					) .
					Html::rawElement( 'div', [ 'id' => 'siteSub' ],
						$this->getMsg( 'tagline' )->parse()
					) .
					Html::rawElement( 'div', [ 'class' => 'mw-body-content' ],
						Html::rawElement( 'div', [ 'id' => 'contentSub' ],
							$this->getPageSubtitle() .
							Html::rawElement(
								'p',
								[],
								$this->get( 'undelete' )
							)
						) .
						$this->get( 'bodycontent' ) .
						$this->getClear() .
						Html::rawElement( 'div', [ 'class' => 'printfooter' ],
							$this->get( 'printfooter' )
						) .
						$this->getCategoryLinks() .
						$this->getPageLinks()
					) .
					$this->getDataAfterContent() .
					$this->get( 'debughtml' )
					)
				) .
				$this->getFooterBlock() .
				// Site title for sidebar
				Html::rawElement( 'div', [ 'id' => 'mw-sidebar-sitename', 'role' => 'banner' ],
					$this->getSiteTitle('link')
				) .
				$this->getBottomBar()
		);

		$html .= $this->getTrail();
		$html .= Html::closeElement( 'body' );
		$html .= Html::closeElement( 'html' );

		echo $html;
	}

	/**
	 * Generates the bottom bar
	 * @return string html
	 */
	protected function getBottomBar() {

		$linkDiscord = 'https://discord.gg/3kjftWK';
		$titleDiscord = 'Contact Us on Discord';
		$textDiscord = 'Discord';
		/*
		$linkReddit = 'https://www.reddit.com/r/starcitizen';
		$titleReddit = 'Visit /r/starcitizen';
		$textReddit = 'Reddit';
		*/

		$html = Html::openElement( 'div', [ 'id' => 'mw-bottombar' ] );

		$html .= Html::rawElement( 'div', [ 'id' => 'mw-bottombar-contact' ],
			Html::rawElement( 'div', [ 'class' => 'citizen-ui-icon', 'id' => 'citizen-ui-discord' ],
				Html::rawElement( 'a', [ 'href' => $linkDiscord, 'title' => $titleDiscord, 'rel' => 'noopener noreferrer', 'target' => '_blank' ], $textDiscord )
			)
			/*
			Html::rawElement( 'div', [ 'class' => 'citizen-ui-icon', 'id' => 'citizen-ui-reddit' ],
				Html::rawElement( 'a', [ 'href' => $linkReddit, 'title' => $titleReddit, 'target' => '_blank' ], $textReddit )
			)
			*/
		);
		$html .= Html::closeElement( 'div' );

		return $html;
	}

	/**
	 * Generates the search button
	 * @return string html
	 */
	 protected function getSearchButton() {
		$titleButton = 'Toggle Search';

 		$html = Html::rawElement( 'div', [ 'class' => 'mw-header-end', 'id' => 'site-search' ],
			Html::rawElement( 'input', [ 'type' => 'checkbox', 'role' => 'button', 'title' => $titleButton ]) .

			// Search button
			Html::rawElement( 'div', [ 'id' => 'search-icon-container' ],
				Html::rawElement( 'div', [ 'id' => 'search-icon' ] )
			) .

			// Search form
			$this->getSearch()
		);
 		return $html;
 	}

	/**
	 * Generates the hamburger menu
	 * @return string html
	 */
	 protected function getHamburgerMenu() {
		$titleButton = 'Toggle Menu';

 		$html = Html::openElement( 'div', [ 'class' => 'mw-header-end', 'id' => 'mw-header-menu' ]);
		$html .= Html::rawElement( 'input', [ 'type' => 'checkbox', 'role' => 'button', 'title' => $titleButton ]);

		// Actual hamburger
		$html .= Html::openElement( 'div', [ 'id' => 'mw-header-menu-toggle' ]);
		for ($i = 1; $i <= 3; $i++) {
			$html .= Html::rawElement( 'span' );
		}
		$html .= Html::closeElement( 'div' );
		// Get sidebar links
		$html .= Html::rawElement( 'div', [ 'id' => 'mw-header-menu-drawer' ],
			Html::rawElement( 'div', [ 'id' => 'mw-header-menu-drawer-container' ],
				$this->getSiteTitle('text') .
				// Container for navigation and tools
				Html::rawElement( 'div', [ 'id' => 'p-nt-container' ],
					$this->getSiteNavigation()
				) .
				$this->getUserLinks()
			)
		);
 		$html .= Html::closeElement( 'div' );

 		return $html;
 	}

	/**
	 * Generates the sitetitle
	 * @return string html
	 */
	protected function getSiteTitle( $option ) {
		$html = '';
		$language = $this->getSkin()->getLanguage();
		$siteTitle = $language->convert( $this->getMsg( 'sitetitle' )->escaped() );

		switch ( $option ) {
			case 'link':
				$html .= Html::rawElement(
					'a',
					[
						'id' => 'p-banner',
						'class' => 'mw-wiki-title',
						'href' => $this->data['nav_urls']['mainpage']['href']
					] + Linker::tooltipAndAccesskeyAttribs( 'p-logo' ),
					$siteTitle
				);
				break;
			case 'text':
				$html .= Html::rawElement(
					'span',
					[
						'id' => 'p-banner',
						'class' => 'mw-wiki-title',
					],
					$siteTitle
				);
				break;
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

			$html .= Html::rawElement(
				'span',
				[
					'id' => 'mw-footer-desc'
				],
				$siteDesc
			);

		return $html;
	}

	/**
	 * Generates the tagline for footer
	 * @return string html
	 */
	protected function getFooterTagline() {
		$html = '';
		$language = $this->getSkin()->getLanguage();
		$siteTagline = $language->convert( $this->getMsg( 'citizen-footer-tagline' )->escaped() );

			$html .= Html::rawElement(
				'span',
				[
					'id' => 'mw-footer-tagline'
				],
				$siteTagline
			);

		return $html;
	}

	/**
	 * Generates the logo
	 * @param string $id
	 *
	 * @return string html
	 */
	protected function getLogo( $id = 'p-logo' ) {
		$html = Html::openElement(
			'div',
			[
				'id' => $id,
				'class' => 'mw-portlet',
				'role' => 'banner'
			]
		);
		$html .= Html::element(
			'a',
			[
				'href' => $this->data['nav_urls']['mainpage']['href'],
				'class' => 'mw-wiki-logo',
			] + Linker::tooltipAndAccesskeyAttribs( 'p-logo' )
		);
		$html .= Html::closeElement( 'div' );

		return $html;
	}

	/**
	 * Generates the search form
	 * @return string html
	 */
	protected function getSearch() {
		$html = Html::openElement(
			'form',
			[
				'action' => $this->get( 'wgScript' ),
				'role' => 'search',
				'class' => 'mw-portlet',
				'id' => 'p-search'
			]
		);
		$html .= Html::hidden( 'title', $this->get( 'searchtitle' ) );
		$html .= Html::rawElement(
			'h3',
			[],
			Html::label( $this->getMsg( 'search' )->text(), 'searchInput' )
		);
		$html .= $this->makeSearchInput( [ 'id' => 'searchInput' ] );
		$html .= $this->makeSearchButton( 'go', [ 'id' => 'searchGoButton', 'class' => 'searchButton' ] );
		$html .= Html::closeElement( 'form' );

		return $html;
	}

	/**
	 * Generates the sidebar
	 * Set the elements to true to allow them to be part of the sidebar
	 * Or get rid of this entirely, and take the specific bits to use wherever you actually want them
	 *  * Toolbox is the page/site tools that appears under the sidebar in vector
	 *  * Languages is the interlanguage links on the page via en:... es:... etc
	 *  * Default is each user-specified box as defined on MediaWiki:Sidebar; you will still need a foreach loop
	 *    to parse these.
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

			$html .= Html::rawElement(
				'div',
				[ 'id' => 'p-personal-extra', 'class' => 'p-body' ],
				Html::rawElement( 'ul', [], $iconList )
			);
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
		$extraTools = [];
		if ( isset( $personalTools['notifications-alert'] ) ) {
			unset( $personalTools['notifications-alert'] );
		}
		if ( isset( $personalTools['notifications-notice'] ) ) {
			unset( $personalTools['notifications-notice'] );
		}
		if ( isset( $personalTools['uls'] ) ) {
			unset( $personalTools['uls'] );
		}

		$html .= Html::openElement( 'div', [ 'id' => 'mw-user-links' ] );
		$html .= $this->getPortlet( 'personal', $personalTools, 'personaltools' );
		$html .= Html::closeElement( 'div' );

		return $html;
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
			$html .= $this->getPortlet(
				'variants',
				$this->data['content_navigation']['variants']
			);
		}

		return $html;
	}

	/**
	 * Generates page-related tools
	 * @return string html
	 */
	protected function getPageTools() {
		$html = '';
		// Only display if user is logged in
		// TODO: Make it check for EDIT permission instead
		if ( $this->getSkin()->getUser()->isLoggedIn() ) {

			$html .= Html::openElement( 'div', [ 'class' => 'mw-side', 'id' => 'page-tools' ]);
			// 'View' actions for the page: view, edit, view history, etc
			$html .= $this->getPortlet(
				'views',
				$this->data['content_navigation']['views']
			);
			// Other actions for the page: move, delete, protect, everything else
			$html .= $this->getPortlet(
				'actions',
				$this->data['content_navigation']['actions']
			);
			$html .= Html::closeElement( 'div' );
		}
		return $html;
	}

	/**
	 * Generates page-related links at the bottom
	 * @return string html
	 */
	protected function getPageLinks() {
		// Namespaces: links for 'content' and 'talk' for namespaces with talkpages. Otherwise is just the content.
		// Usually rendered as tabs on the top of the page.
		$html = $this->getPortlet(
			'namespaces',
			$this->data['content_navigation']['namespaces']
		);
		// Language variant options
		$html .= $this->getVariants();

		return $html;
	}

	/**
	 * Generates siteNotice, if any
	 * @return string html
	 */
	protected function getSiteNotice() {
		return $this->getIfExists( 'sitenotice', [
			'wrapper' => 'div',
			'parameters' => [ 'id' => 'siteNotice' ]
		] );
	}

	/**
	 * Generates new talk message banner, if any
	 * @return string html
	 */
	protected function getNewTalk() {
		return $this->getIfExists( 'newtalk', [
			'wrapper' => 'div',
			'parameters' => [ 'class' => 'usermessage' ]
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
			'parameters' => []
		];

		$html = '';

		if ( $this->data[$object] ) {
			if ( $options['wrapper'] == 'none' ) {
				$html .= $this->get( $object );
			} else {
				$html .= Html::rawElement(
					$options['wrapper'],
					$options['parameters'],
					$this->get( $object )
				);
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
			'hooks' => ''
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
			$contentText = Html::openElement( 'ul',
				[ 'lang' => $this->get( 'userlang' ), 'dir' => $this->get( 'dir' ) ]
			);
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
			'aria-labelledby' => $labelId
		];
		if ( !is_array( $options['class'] ) ) {
			$class = [ $options['class'] ];
		}
		if ( !is_array( $options['extra-classes'] ) ) {
			$extraClasses = [ $options['extra-classes'] ];
		}
		$divOptions['class'] = array_merge( $class, $extraClasses );

		$labelOptions = [
			'id' => $labelId,
			'lang' => $this->get( 'userlang' ),
			'dir' => $this->get( 'dir' )
		];

		if ( $options['body-wrapper'] !== 'none' ) {
			$bodyDivOptions = [ 'class' => $options['body-class'] ];
			if ( is_string( $options['body-id'] ) ) {
				$bodyDivOptions['id'] = $options['body-id'];
			}
			$body = Html::rawElement( $options['body-wrapper'], $bodyDivOptions,
				$contentText .
				$this->getAfterPortlet( $name )
			);
		} else {
			$body = $contentText . $this->getAfterPortlet( $name );
		}

		$html = Html::rawElement( 'div', $divOptions,
			Html::rawElement( 'h3', $labelOptions, $msgString ) .
			$body
		);

		return $html;
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
		$hookContents = '';
		ob_start();
		Hooks::run( $hook, $hookOptions );
		$hookContents = ob_get_contents();
		ob_end_clean();
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
	 * * 'link-style' to pass to getFooterLinks: "flat" to disable categorisation of links in a
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
			'link-style' => 'flat'
		];

		$validFooterIcons = $this->getFooterIcons( $options['icon-style'] );
		$validFooterLinks = $this->getFooterLinks( $options['link-style'] );
		$html = '';

		$html .= Html::openElement( 'footer', [
			'id' => $options['id'],
			'role' => 'contentinfo',
			'lang' => $this->get( 'userlang' ),
			'dir' => $this->get( 'dir' )
		] );

		$iconsHTML = '';
		if ( count( $validFooterIcons ) > 0 ) {
			$iconsHTML .= Html::openElement( 'div', [ 'id' => "{$options['link-prefix']}-container-icons"] );
			$iconsHTML .= Html::openElement( 'div', [ 'id' => "footer-bottom-container"] );

			// Get tagline
			$iconsHTML .= $this -> getFooterTagline();

			$iconsHTML .= Html::openElement( 'ul', [ 'id' => "{$options['link-prefix']}-icons" ] );
			foreach ( $validFooterIcons as $blockName => $footerIcons ) {
				$iconsHTML .= Html::openElement( 'li', [
					'id' => Sanitizer::escapeIdForAttribute(
						"{$options['link-prefix']}-{$blockName}ico"
					),
					'class' => 'footer-icons'
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
			$linksHTML .= Html::openElement( 'div', [ 'id' => "{$options['link-prefix']}-container-list" ] );
			if ( $options['link-style'] == 'flat' ) {
				$linksHTML .= Html::openElement( 'ul', [
					'id' => "{$options['link-prefix']}-list",
					'class' => 'footer-places'
				] );

				// Site logo
				$linksHTML .= Html::rawElement( 'li', [ 'id' => 'sitelogo' ],
					$this->getLogo()
				);
				// Site title
				$linksHTML .= Html::rawElement( 'li', [ 'id' => 'sitetitle' ],
					$this->getSiteTitle('text')
				);
				// Site description
				$linksHTML .= Html::rawElement( 'li', [ 'id' => 'sitedesc' ],
					$this->getFooterDesc()
				);

				foreach ( $validFooterLinks as $link ) {
					$linksHTML .= Html::rawElement(
						'li',
						[ 'id' => Sanitizer::escapeIdForAttribute( $link ) ],
						$this->get( $link )
					);
				}
				$linksHTML .= Html::closeElement( 'ul' );
			} else {
				$linksHTML .= Html::openElement( 'div', [ 'id' => "{$options['link-prefix']}-list" ] );
				foreach ( $validFooterLinks as $category => $links ) {
					$linksHTML .= Html::openElement( 'ul',
						[ 'id' => Sanitizer::escapeIdForAttribute(
							"{$options['link-prefix']}-{$category}"
						) ]
					);
					foreach ( $links as $link ) {
						$linksHTML .= Html::rawElement(
							'li',
							[ 'id' => Sanitizer::escapeIdForAttribute(
								"{$options['link-prefix']}-{$category}-{$link}"
							) ],
							$this->get( $link )
						);
					}
					$linksHTML .= Html::closeElement( 'ul' );
				}
				// Site title
				$linksHTML .= Html::rawElement( 'li', [ 'id' => 'footer-sitetitle' ],
					$this->getSiteTitle('text')
				);
				// Site logo
				$linksHTML .= Html::rawElement( 'li', [ 'id' => 'footer-sitelogo' ],
					$this->getLogo()
				);
				$linksHTML .= Html::closeElement( 'div' );
			}
			$linksHTML .= Html::closeElement( 'div' );
		}

		if ( $options['order'] == 'iconsfirst' ) {
			$html .= $iconsHTML . $linksHTML;
		} else {
			$html .= $linksHTML . $iconsHTML;
		}

		$html .= $this->getClear() . Html::closeElement( 'footer' );

		return $html;
	}
}
