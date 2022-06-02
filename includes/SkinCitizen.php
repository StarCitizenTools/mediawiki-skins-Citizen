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

namespace MediaWiki\Skins\Citizen;

use Html;
use Linker;
use MediaWiki\Skins\Citizen\Partials\BodyContent;
use MediaWiki\Skins\Citizen\Partials\Drawer;
use MediaWiki\Skins\Citizen\Partials\Footer;
use MediaWiki\Skins\Citizen\Partials\Header;
use MediaWiki\Skins\Citizen\Partials\Logos;
use MediaWiki\Skins\Citizen\Partials\Metadata;
use MediaWiki\Skins\Citizen\Partials\PageTools;
use MediaWiki\Skins\Citizen\Partials\Tagline;
use MediaWiki\Skins\Citizen\Partials\Theme;
use MediaWiki\Skins\Citizen\Partials\Title;
use Sanitizer;
use SkinMustache;

/**
 * Skin subclass for Citizen
 * @ingroup Skins
 */
class SkinCitizen extends SkinMustache {
	use GetConfigTrait;

	/**
	 * @var array|null
	 */
	private $contentNavigationUrls;

	/**
	 * Overrides template, styles and scripts module
	 *
	 * @inheritDoc
	 */
	public function __construct( $options = [] ) {
		// Add skin-specific features
		$this->buildSkinFeatures( $options );
		// Can't use templateDirectory inside skin.json
		// Relative path does not work well with 1.35
		// TODO: Replace with templateDirectory when 1.39
		$options['templateDirectory'] = dirname( __DIR__, 1 ) . '/templates';
		parent::__construct( $options );
	}

	/**
	 * @return array Returns an array of data used by Citizen skin.
	 * @throws MWException
	 */
	public function getTemplateData(): array {
		$data = [];
		$out = $this->getOutput();
		$title = $out->getTitle();
		$parentData = parent::getTemplateData();

		$header = new Header( $this );
		$logos = new Logos( $this );
		$drawer = new Drawer( $this );
		$pageTitle = new Title( $this );
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

		// Polyfill for 1.35
		if ( version_compare( MW_VERSION, '1.36', '<' ) ) {
			$data += [
				'data-logos' => $logos->getLogoData(),
				'html-user-message' => $newTalksHtml ?
					Html::rawElement( 'div', [ 'class' => 'usermessage' ], $newTalksHtml ) : null,
				'link-mainpage' => $title->newMainPage()->getLocalUrl(),
			];

			foreach ( $this->options['messages'] ?? [] as $message ) {
				$data["msg-{$message}"] = $this->msg( $message )->text();
			}
		}

		$data += [
			// Booleans
			'toc-enabled' => $out->isTOCEnabled(),
			// Data objects
			'data-header' => [
				'data-drawer' => $drawer->getDrawerTemplateData(),
				'data-notifications' => $header->getNotifications(),
				'data-personal-menu' => $header->buildPersonalMenu(),
				'data-search-box' => $header->buildSearchProps(),
				'html-citizen-jumptotop' => $this->msg( 'citizen-jumptotop' )->text() . ' [home]',
			],
			'data-pagetools' => $tools->buildPageTools( $parentData ),
			'data-citizen-footer' => $footer->getFooterData(),
			// HTML strings
			'html-title-heading--formatted' => $pageTitle->buildTitle( $parentData, $title ),
			'html-body-content--formatted' => $bodycontent->buildBodyContent(),
			'html-tagline' => $tagline->getTagline(),
		];

		return array_merge( $parentData, $data );
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
	 * @inheritDoc
	 */
	protected function runOnSkinTemplateNavigationHooks( $skin, &$contentNavigationUrls ) {
		parent::runOnSkinTemplateNavigationHooks( $skin, $contentNavigationUrls );
		// There are some SkinTemplate modifications that occur after the execution of this hook
		// to add rel attributes and ID attributes.
		// The only one Minerva needs is this one so we manually add it.
		foreach ( array_keys( $contentNavigationUrls['namespaces'] ) as $id ) {
			if ( in_array( $id, [ 'user_talk', 'talk' ] ) ) {
					$contentNavigationUrls['namespaces'][ $id ]['rel'] = 'discussion';
			}
		}
		$this->contentNavigationUrls = $contentNavigationUrls;
	}

	/**
	 * Change access to public, as it is used in partials
	 *
	 * @return array
	 */
	final public function buildContentNavigationUrlsPublic() {
		if ( !method_exists( parent::class, 'runOnSkinTemplateNavigationHooks' ) ) {
			// Support for MediaWiki versions < 1.37
			return parent::buildContentNavigationUrls();
		} else {
			// Works with mediawiki version >= 1.37
			return $this->contentNavigationUrls;
		}
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
	 * Polyfill for 1.35 from SkinTemplate
	 *
	 * @since 1.36
	 * @stable for overriding
	 * @param string $name of the portal e.g. p-personal the name is personal.
	 * @param array $items that are accepted input to Skin::makeListItem
	 * @return array data that can be passed to a Mustache template that
	 *   represents a single menu.
	 */
	public function getPortletData( $name, array $items ) {
		// Monobook and Vector historically render this portal as an element with ID p-cactions
		// This inconsistency is regretful from a code point of view
		// However this ensures compatibility with gadgets.
		// In future we should port p-#cactions to #p-actions and drop this rename.
		if ( $name === 'actions' ) {
			$name = 'cactions';
		}

		// user-menu is the new personal tools, without the notifications.
		// A lot of user code and gadgets relies on it being named personal.
		// This allows it to function as a drop-in replacement.
		if ( $name === 'user-menu' ) {
			$name = 'personal';
		}

		$legacyClasses = '';
		if ( $name === 'category-normal' ) {
			// retain historic category IDs and classes
			$id = 'mw-normal-catlinks';
			$legacyClasses .= ' mw-normal-catlinks';
		} elseif ( $name === 'category-hidden' ) {
			// retain historic category IDs and classes
			$id = 'mw-hidden-catlinks';
			$legacyClasses .= ' mw-hidden-catlinks mw-hidden-cats-hidden';
		} else {
			$id = Sanitizer::escapeIdForAttribute( "p-$name" );
		}

		$data = [
			'id' => $id,
			'class' => 'mw-portlet ' . Sanitizer::escapeClass( "mw-portlet-$name" ) . $legacyClasses,
			'html-tooltip' => Linker::tooltip( $id ),
			'html-items' => '',
			// Will be populated by SkinAfterPortlet hook.
			'html-after-portal' => '',
			'html-before-portal' => '',
		];
		// Run the SkinAfterPortlet
		// hook and if content is added appends it to the html-after-portal
		// for output.
		// Currently in production this supports the wikibase 'edit' link.
		$content = $this->getAfterPortlet( $name );
			if ( $content !== '' ) {
				$data['html-after-portal'] = Html::rawElement(
				'div',
				[
					'class' => [
						'after-portlet',
						Sanitizer::escapeClass( "after-portlet-$name" ),
					],
				],
			$content
			);
			}

		foreach ( $items as $key => $item ) {
			$data['html-items'] .= $this->makeListItem( $key, $item );
		}

		$data['label'] = $this->getPortletLabel( $name );
		$data['is-empty'] = count( $items ) === 0 && $content === '';
		$data['class'] .= $data['is-empty'] ? ' emptyPortlet' : '';
		return $data;
	}

	/**
	 * Polyfill for 1.35 from SkinTemplate
	 *
	 * @since 1.36
	 * @param string $name of the portal e.g. p-personal the name is personal.
	 * @return string that is human readable corresponding to the menu
	 */
	public function getPortletLabel( $name ) {
		// For historic reasons for some menu items,
		// there is no language key corresponding with its menu key.
		$mappings = [
			'tb' => 'toolbox',
			'personal' => 'personaltools',
			'lang' => 'otherlanguages',
		];

		$msgObj = $this->msg( $mappings[ $name ] ?? $name );
		// If no message exists fallback to plain text (T252727)
		$labelText = $msgObj->exists() ? $msgObj->text() : $name;
		return $labelText;
	}

	/**
	 * @inheritDoc
	 *
	 * Manually disable some site-wide tools in TOOLBOX
	 * They are re-added in the drawer
	 *
	 * TODO: Remove this hack when Desktop Improvements separate page and site tools
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
		$options['styles'][] = 'skins.citizen.styles.toc';

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
