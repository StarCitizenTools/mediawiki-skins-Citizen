<?php
declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Hooks;

use MediaWiki\Hook\SidebarBeforeOutputHook;
use MediaWiki\Hook\SkinBuildSidebarHook;
use MediaWiki\Html\Html;
use MediaWiki\Output\Hook\BeforePageDisplayHook;
use MediaWiki\Output\Hook\OutputPageAfterGetHeadLinksArrayHook;
use MediaWiki\Output\OutputPage;
use MediaWiki\Registration\ExtensionRegistry;
use MediaWiki\ResourceLoader as RL;
use MediaWiki\Skin\SkinComponentUtils;
use MediaWiki\Skins\Citizen\Menu\MenuItemDecorator;
use MediaWiki\Skins\Citizen\PreviewChannel;
use MediaWiki\Skins\Hook\SkinPageReadyConfigHook;
use Skin;

/**
 * Hooks to run relating the skin
 */
class SkinHooks implements
	BeforePageDisplayHook,
	OutputPageAfterGetHeadLinksArrayHook,
	SidebarBeforeOutputHook,
	SkinBuildSidebarHook,
	SkinPageReadyConfigHook
{
	private static ?string $inlineScript = null;

	/**
	 * Adds the inline theme switcher script and applies the preview
	 * channel for the current request.
	 *
	 * @param OutputPage $out
	 * @param Skin $skin
	 */
	public function onBeforePageDisplay( $out, $skin ): void {
		// It's better to exit before any additional check
		if ( $skin->getSkinName() !== 'citizen' ) {
			return;
		}

		if ( $out->getConfig()->get( 'CitizenEnablePreferences' ) === true ) {
			self::$inlineScript ??= Html::inlineScript(
				RL\ResourceLoader::filter(
					'minify-js',
					file_get_contents( __DIR__ . '/../../resources/skins.citizen.scripts/inline.js' )
				)
			);
			$out->addHeadItem( 'skin.citizen.inline', self::$inlineScript );
		}

		self::applyPreviewChannel( $out );
	}

	/**
	 * Resolve the preview channel for this request and apply it: pick
	 * the color-token module and stamp the generation class.
	 *
	 * Priority: ?citizenpreview= URL param > citizenpreview cookie >
	 * $wgCitizenPreview config. An explicit URL choice also writes a
	 * 24-hour cookie, so a flip takes effect on subsequent requests —
	 * exactly one token module ships per request.
	 */
	private static function applyPreviewChannel( OutputPage $out ): void {
		$request = $out->getRequest();
		$config = $out->getConfig();
		$urlVal = $request->getRawVal( PreviewChannel::REQUEST_KEY );
		$cookieVal = $request->getCookie( PreviewChannel::REQUEST_KEY );

		if ( PreviewChannel::isExplicitValue( $urlVal ) ) {
			$request->response()->setCookie(
				PreviewChannel::REQUEST_KEY,
				(string)$urlVal,
				time() + 86400
			);
		}

		if ( PreviewChannel::isPreview( $urlVal, $cookieVal, $config ) ) {
			$out->addModuleStyles( [ 'skins.citizen.tokens.new' ] );
			$out->addHtmlClasses( [ PreviewChannel::HTML_CLASS ] );
		} else {
			// citizen-v4-remove — legacy pipeline, deleted at the 4.0 flip
			$out->addModuleStyles( [ 'skins.citizen.tokens' ] );
		}
	}

	/**
	 * Replace the viewport meta tag with a more sane one
	 *
	 * @param array &$tags
	 * @param OutputPage $out
	 */
	public function onOutputPageAfterGetHeadLinksArray( &$tags, $out ): void {
		if ( $out->getSkin()->getSkinName() !== 'citizen' ) {
			return;
		}

		if ( !isset( $tags['meta-viewport'] ) ) {
			return;
		}

		/**
		 * The MW default tag was created from T258290, our changes include:
		 * Added: viewport-fit=cover - #1036
		 * Removed: user-scalable=yes - This is the default value
		 * Removed: minimum-scale=0.25 - Seems like an old workaround for iOS that is no longer needed
		 * Removed: maximum-scale=5.0 - Seems like an old workaround for iOS that is no longer needed
		 */
		$tags['meta-viewport'] = Html::element( 'meta', [
			'name' => 'viewport',
			'content' => 'width=device-width,initial-scale=1,viewport-fit=cover',
		] );
	}

	/**
	 * Modify toolbox links
	 * For some reason onSkinBuildSidebar was not able to get toolbox
	 * So we need to use this hook instead
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SidebarBeforeOutput
	 * @param Skin $skin
	 * @param array &$sidebar
	 */
	public function onSidebarBeforeOutput( $skin, &$sidebar ): void {
		// Be extra safe because it might be active on other skins with caching
		if ( $skin->getSkinName() !== 'citizen' ) {
			return;
		}

		if ( isset( $sidebar['TOOLBOX'] ) ) {
			self::updateToolboxMenu( $sidebar );
		}
	}

	/**
	 * Modify sidebar links
	 * This is cached compared to onSidebarBeforeOutput
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SkinBuildSidebar
	 * @param Skin $skin
	 * @param array &$bar
	 */
	public function onSkinBuildSidebar( $skin, &$bar ): void {
		// Be extra safe because it might be active on other skins with caching
		if ( $skin->getSkinName() !== 'citizen' ) {
			return;
		}

		$this->addSiteTools( $skin, $bar );

		$iconMap = [
			// TODO: Remove when we drop MW 1.43 support AND T405413 is resolved
			'n-specialpages' => 'specialPages',
			// TODO: Remove when we drop MW 1.43 support
			't-specialpages' => 'specialPages',
			't-upload' => 'upload',
		];

		foreach ( $bar as &$menu ) {
			// Sidebar links do not have a string as key, so we need to loop through each item
			foreach ( $menu as &$item ) {
				if ( isset( $item['id'] ) && array_key_exists( $item['id'], $iconMap ) ) {
					$item['icon'] = $iconMap[$item['id']];
				}

				if ( !empty( $item['icon'] ) ) {
					$item['link-html'] = MenuItemDecorator::getIconHtml( $item['icon'] );
				}
			}
		}
		unset( $menu, $item );
	}

	private function addSiteTools( Skin $skin, array &$bar ): void {
		$out = $skin->getOutput();
		$customSiteToolsMenuId = $out->getConfig()->get( 'CitizenGlobalToolsPortlet' );

		$siteToolsMenuId = $customSiteToolsMenuId === ''
			? array_key_first( $bar )
			// remove initial p- for backward compatibility
			: preg_replace( '/^p-/', '', $customSiteToolsMenuId );

		// Do not override specialpages if it already exists (#1116)
		// TODO: Revisit in next LTS release (T333211)
		if ( version_compare( MW_VERSION, '1.44', '<' ) ) {
			$bar[$siteToolsMenuId][] = [
				'text'  => $skin->msg( 'specialpages' ),
				'href'  => SkinComponentUtils::makeSpecialUrl( 'Specialpages' ),
				'title' => $skin->msg( 'tooltip-t-specialpages' ),
				'id'    => 't-specialpages',
			];
		}

		if ( !isset( $bar[$siteToolsMenuId]['upload'] ) && $out->getConfig()->get( 'EnableUploads' ) === true ) {
			$isUploadWizardEnabled = ExtensionRegistry::getInstance()->isLoaded( 'Upload Wizard' );
			$bar[$siteToolsMenuId][] = [
				'text'  => $skin->msg( 'upload' ),
				'href'  => SkinComponentUtils::makeSpecialUrl( $isUploadWizardEnabled ?
					'UploadWizard' :
					'Upload'
				),
				'title' => $skin->msg( 'tooltip-t-upload' ),
				'id'    => 't-upload',
			];
		}
	}

	/**
	 * SkinPageReadyConfig hook handler
	 *
	 * Replace searchModule provided by skin.
	 *
	 * @since 1.36
	 * @param RL\Context $context
	 * @param mixed[] &$config Associative array of configurable options
	 * @return void This hook must not abort, it must return no value
	 */
	public function onSkinPageReadyConfig( $context, array &$config ): void {
		// It's better to exit before any additional check
		if ( $context->getSkin() !== 'citizen' ) {
			return;
		}

		// Tell the `mediawiki.page.ready` module not to wire up search.
		$config['search'] = false;
	}

	/**
	 * Update toolbox menu items
	 *
	 * @internal used inside Hooks\SkinHooks::onSidebarBeforeOutput
	 */
	private static function updateToolboxMenu( array &$links ): void {
		// Most icons are not mapped yet in the toolbox menu
		$iconMap = [
			'recentchangeslinked' => 'recentChanges',
			'print' => 'printer',
			'contributions' => 'userContributions',
			'emailuser' => 'message',
			// Extension:Cargo
			'cargo-pagevalues' => 'table',
			// Extension:CiteThisPage
			'citethispage' => 'quotes',
			// Extension:CreateRedirect
			'createredirect' => 'articleRedirect',
			// Extension:SemanticMediaWiki
			'smwbrowselink' => 'table',
			// Extension:UrlShortener
			'urlshortener' => 'link',
			'urlshortener-qrcode' => 'qrCode',
			// Extension:Wikibase
			'wikibase' => 'logoWikidata'
		];

		// Remove upload and specialpages from toolbox as we moved them to drawer
		// TODO: Check again in the next LTS release, in case it's handled there
		$siteTools = [
			'upload',
			'specialpages'
		];

		foreach ( $siteTools as $siteTool ) {
			unset( $links['TOOLBOX'][$siteTool] );
		}

		MenuItemDecorator::mapIconsToMenuItems( $links, 'TOOLBOX', $iconMap );
		MenuItemDecorator::addIconsToMenuItems( $links, 'TOOLBOX' );
	}
}
