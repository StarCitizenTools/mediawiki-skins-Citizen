<?php
/**
 * Citizen - A responsive skin developed for the Star Citizen Wiki
 *
 * This file is part of Citizen.
 *
 * Citizen is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Citizen is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Citizen.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @file
 * @ingroup Skins
 */

use Citizen\GetConfigTrait;
use Citizen\Partials\BodyContent;
use Citizen\Partials\Drawer;
use Citizen\Partials\Footer;
use Citizen\Partials\Header;
use Citizen\Partials\Logos;
use Citizen\Partials\Metadata;
use Citizen\Partials\PageTools;
use Citizen\Partials\Tagline;
use Citizen\Partials\Theme;

/**
 * Skin subclass for Citizen
 * @ingroup Skins
 */
class SkinCitizen extends SkinMustache {
	use GetConfigTrait;

	/** @var array of alternate message keys for menu labels */
	private const MENU_LABEL_KEYS = [
		'tb' => 'toolbox',
		'personal' => 'personaltools',
		'lang' => 'otherlanguages',
	];

	/**
	 * Overrides template, styles and scripts module
	 *
	 * @inheritDoc
	 */
	public function __construct( $options = [] ) {
		// Add skin-specific features
		$this->buildSkinFeatures( $options );

		$options['templateDirectory'] = dirname( __DIR__, 1 ) . '/templates';
		parent::__construct( $options );
	}

	/**
	 * @return array Returns an array of data used by Citizen skin.
	 * @throws MWException
	 */
	public function getTemplateData(): array {
		$out = $this->getOutput();
		$title = $out->getTitle();

		$header = new Header( $this );
		$logos = new Logos( $this );
		$drawer = new Drawer( $this );
		$tagline = new Tagline( $this );
		$bodycontent = new BodyContent( $this );
		$footer = new Footer( $this );
		$tools = new PageTools( $this );

		// Naming conventions for Mustache parameters.
		//
		// Value type (first segment):
		// - Prefix "is" or "has" for boolean values.
		// - Prefix "msg-" for interface message text.
		// - Prefix "html-" for raw HTML.
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
		$newTalksHtml = $this->getNewtalks() ?: null;

		return parent::getTemplateData() + [
			'msg-sitetitle' => $this->msg( 'sitetitle' )->text(),
			'html-mainpage-attributes' => Xml::expandAttributes(
				Linker::tooltipAndAccesskeyAttribs( 'p-logo' ) + [
					'href' => Skin::makeMainPageUrl(),
				]
			),
			'data-logos' => $logos->getLogoData(),

			'data-header' => [
				'data-drawer' => $drawer->buildDrawer(),
				'data-extratools' => $header->getExtraTools(),
				'data-personal-menu' => $header->buildPersonalMenu(),
				'data-search-box' => $header->buildSearchProps(),
				'msg-citizen-jumptotop' => $this->msg( 'citizen-jumptotop' )->text() . ' [home]',
			],

			'data-pagetools' => $tools->buildPageTools(),

			'html-newtalk' => $newTalksHtml ? '<div class="usermessage">' . $newTalksHtml . '</div>' : '',
			'page-langcode' => $title->getPageViewLanguage()->getHtmlCode(),

			'msg-tagline' => $tagline->getTagline( $out ),

			'html-body-content--formatted' => $bodycontent->buildBodyContent( $out ),

			'data-citizen-footer' => $footer->getFooterData(),
		];
	}

	/**
	 * Change access to public, as it is used in partials
	 *
	 * @return array
	 */
	final public function buildPersonalUrlsPublic() {
		return parent::buildPersonalUrls();
	}

	/**
	 * Change access to public, as it is used in partials
	 *
	 * @return array
	 */
	final public function getFooterLinksPublic() {
		return parent::getFooterLinks();
	}

	/**
	 * Change access to public, as it is used in partials
	 *
	 * @return array
	 */
	final public function getFooterIconsPublic() {
		return parent::getFooterIcons();
	}

	/**
	 * Change access to public, as it is used in partials
	 *
	 * @return array
	 */
	final public function buildContentNavigationUrlsPublic() {
		return parent::buildContentNavigationUrls();
	}

	/**
	 * Change access to public, as it is used in partials
	 *
	 * @param Title $title
	 * @param string $html body text
	 * @return string
	 */
	final public function wrapHTMLPublic( $title, $html ) {
		return parent::wrapHTML( $title, $html );
	}

	/**
	 * @param string $label to be used to derive the id and human readable label of the menu
	 *  If the key has an entry in the constant MENU_LABEL_KEYS then that message will be used for the
	 *  human readable text instead.
	 * @param array $urls to convert to list items stored as string in html-items key
	 * @param array $options (optional) to be passed to makeListItem
	 * @return array
	 */
	public function getMenuData(
		string $label,
		array $urls = [],
		array $options = []
	): array {
		$skin = $this->getSkin();

		// For some menu items, there is no language key corresponding with its menu key.
		// These inconsitencies are captured in MENU_LABEL_KEYS
		$msgObj = $skin->msg( self::MENU_LABEL_KEYS[ $label ] ?? $label );
		$props = [
			'id' => "p-$label",
			'label-class' => null,
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
		$class = ( empty( $urls ) && !$props['html-after-portal'] )
			? ' mw-portal-empty' : '';
		$props['class'] = $class;
		return $props;
	}

	/**
	 * @inheritDoc
	 *
	 * Manually disable links to upload and special pages
	 * as they are moved from the toolbox to the drawer
	 *
	 * @return array
	 */
	protected function buildNavUrls() {
		$urls = parent::buildNavUrls();

		$urls['upload'] = false;
		$urls['specialpages'] = false;

		return $urls;
	}

	/**
	 * Returns the javascript entry modules to load. Only modules that need to
	 * be overriden or added conditionally should be placed here.
	 * @return array
	 */
	public function getDefaultModules() {
		$modules = parent::getDefaultModules();

		$modules['content'] = array_diff( $modules['content'], [
			// Citizen provides its own implementation. Loading this will break display.
			'mediawiki.toc'
		] );

		return $modules;
	}

	/**
	 * Set up optional skin features
	 *
	 * @param array &$options
	 */
	private function buildSkinFeatures( array &$options ) {
		$out = $this->getOutput();
		$title = $out->getTitle();

		$metadata = new Metadata( $this );
		$skinTheme = new Theme( $this );

		// Add metadata
		$metadata->addMetadata();

		// Add theme handler
		$skinTheme->setSkinTheme( $options );

		// Collapsible sections
		// Load in content pages
		if ( $title !== null && $title->isContentPage() ) {
			// Load Citizen collapsible sections modules if enabled
			if ( $this->getConfigValue( 'CitizenEnableCollapsibleSections' ) === true ) {
				$options['scripts'][] = 'skins.citizen.scripts.sections';
				$options['styles'][] = 'skins.citizen.styles.sections';
				$options['styles'][] = 'skins.citizen.icons.sections';
			}
		}

		// Table of content highlight
		// Load if ToC presents
		if ( $out->isTOCEnabled() ) {
			// Add class to body that notifies the page has TOC
			$out->addBodyClasses( 'skin-citizen-has-toc' );
			$options['scripts'][] = 'skins.citizen.scripts.toc';
			$options['styles'][] = 'skins.citizen.styles.toc';
		}

		// Drawer sitestats
		if ( $this->getConfigValue( 'CitizenEnableDrawerSiteStats' ) === true ) {
			$options['styles'][] = 'skins.citizen.styles.sitestats';
		}

		// Drawer subsearch
		if ( $this->getConfigValue( 'CitizenEnableDrawerSubSearch' ) === true ) {
			$options['scripts'][] = 'skins.citizen.scripts.drawer';
		}

		// Debug styles
		if (
			$this->getConfigValue( 'ShowDebug' ) === true
			|| $this->getConfigValue( 'ShowExceptionDetails' ) === true
		) {
			$options['styles'][] = 'skins.citizen.styles.debug';
		}
	}
}
