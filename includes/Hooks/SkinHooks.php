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
use MediaWiki\Skins\Citizen\SkinCitizen;
use MediaWiki\Skins\Hook\SkinPageReadyConfigHook;
use MediaWiki\SpecialPage\SpecialPage;
use Skin;
use SkinTemplate;

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
	/**
	 * Rows the notification placeholder previews at most. Enough to fill the
	 * panel's minimum height; the list itself scrolls once mounted.
	 *
	 * The mounted panel previews the same number while it fetches — keep in
	 * step with PLACEHOLDER_ROWS in
	 * resources/skins.citizen.notifications/components/App.vue.
	 */
	private const NOTIFICATIONS_PLACEHOLDER_ROWS = 5;

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
	 * Modify navigation links
	 *
	 * TODO: Update to a proper hook when T287622 is resolved
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SkinTemplateNavigation::Universal
	 * @param SkinTemplate $sktemplate
	 * @param array &$links
	 */
	public static function onSkinTemplateNavigation( $sktemplate, &$links ): void {
		// Be extra safe because it might be active on other skins with caching
		if ( $sktemplate->getSkinName() !== 'citizen' ) {
			return;
		}

		if ( isset( $links['actions'] ) ) {
			self::updateActionsMenu( $links );
		}

		if ( isset( $links['associated-pages'] ) ) {
			self::updateAssociatedPagesMenu( $links );
		}

		if ( isset( $links['notifications'] ) ) {
			self::updateNotificationsMenu( $sktemplate, $links );
		}

		if ( isset( $links['user-menu'] ) ) {
			self::updateUserMenu( $sktemplate, $links );
		}

		if ( isset( $links['user-interface-preferences'] ) ) {
			self::updateUserInterfacePreferencesMenu( $links );
		}

		if ( isset( $links['views'] ) ) {
			self::updateViewsMenu( $links );
		}
	}

	/**
	 * Update actions menu items
	 *
	 * @internal used inside Hooks\SkinHooks::onSkinTemplateNavigation
	 */
	private static function updateActionsMenu( array &$links ): void {
		// Most icons are not mapped yet in the actions menu
		$iconMap = [
			'delete' => 'trash',
			'move' => 'move',
			'protect' => 'lock',
			'unprotect' => 'unLock',
			// Extension:Purge
			// Extension:SemanticMediaWiki
			'purge' => 'reload',
			// Extension:Cargo
			'cargo-purge'  => 'reload',
			// Extension:DiscussionTools
			'dt-page-subscribe' => 'bell'
		];

		MenuItemDecorator::mapIconsToMenuItems( $links, 'actions', $iconMap );
		MenuItemDecorator::addIconsToMenuItems( $links, 'actions' );
	}

	/**
	 * Update associated pages menu items
	 *
	 * @internal used inside Hooks\SkinHooks::onSkinTemplateNavigation
	 */
	private static function updateAssociatedPagesMenu( array &$links ): void {
		// Most icons are not mapped yet in the associated pages menu
		$iconMap = [
			'main' => 'article',
			'file' => 'image',
			'talk' => 'speechBubbles',
			'user' => 'userAvatar'
		];

		// Special handling for talk pages
		// Since talk keys have namespace as prefix
		foreach ( $links['associated-pages'] as $key => $item ) {
			$keyStr = (string)$key;
			if ( str_ends_with( $keyStr, '_talk' ) ) {
				// Extract the namespace key from the talk key (e.g. Project from Project_talk)
				$namespace = substr( $keyStr, 0, -strlen( '_talk' ) );
				$links['associated-pages'][$key]['icon'] = 'speechBubbles';
				$links['associated-pages'][$namespace]['icon'] = 'arrowPrevious';
			}
		}

		MenuItemDecorator::mapIconsToMenuItems( $links, 'associated-pages', $iconMap );
		MenuItemDecorator::addIconsToMenuItems( $links, 'associated-pages' );
		MenuItemDecorator::addButtonClassesToMenuItems( $links, 'associated-pages' );
	}

	/**
	 * Update toolbox menu items
	 *
	 * @internal used inside Hooks\SkinHooks::onSkinTemplateNavigation
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

	/**
	 * Capture Echo's two notification badges (alert + notice) as merged data
	 * for Citizen's own notifications dropdown (Notifications.mustache), then
	 * drop Echo's portlet so there is no duplicate control. The merged unread
	 * count is handed to the skin, which exposes it as template data; the
	 * dropdown renders a single bell that opens a panel showing both streams
	 * (and links to Special:Notifications without JS).
	 *
	 * @internal used inside Hooks\SkinHooks::onSkinTemplateNavigation
	 */
	private static function updateNotificationsMenu( SkinTemplate $sktemplate, array &$links ): void {
		$alert = $links['notifications']['notifications-alert'] ?? null;
		$notice = $links['notifications']['notifications-notice'] ?? null;

		// Nothing to do if Echo did not provide its badges.
		if ( $alert === null && $notice === null ) {
			return;
		}

		$alertCount = (int)( $alert['data']['counter-num'] ?? 0 );
		$noticeCount = (int)( $notice['data']['counter-num'] ?? 0 );
		// Clamped because the count sizes an array below, where a negative
		// would be fatal rather than merely wrong — and this runs on every page
		// view for every logged-in user.
		$count = max( 0, $alertCount + $noticeCount );

		if ( $sktemplate instanceof SkinCitizen ) {
			$sktemplate->setNotificationData( [
				'count' => $count,
				'href' => $alert['href'] ?? $notice['href']
					?? SpecialPage::getTitleFor( 'Notifications' )->getLocalURL(),
				// Concatenated rather than passed as a Title fragment, because
				// getLocalURL() omits the fragment and would silently drop it.
				'prefs-href' => SpecialPage::getTitleFor( 'Preferences' )
					->getLocalURL() . '#mw-prefsection-echo',
				// The panel's pre-mount placeholder previews what is waiting:
				// rows when something is, the empty state when nothing is.
				// Mustache cannot count, so the row list is built here.
				'has-unread' => $count > 0,
				'placeholder-rows' => array_fill(
					0, min( $count, self::NOTIFICATIONS_PLACEHOLDER_ROWS ), true
				),
			] );
		}

		// Citizen renders its own notifications dropdown, so drop Echo's
		// portlet badges to avoid a duplicate control in the header.
		unset( $links['notifications'] );
	}

	/**
	 * Update user menu
	 *
	 * @internal used inside Hooks\SkinHooks::onSkinTemplateNavigation
	 */
	private static function updateUserMenu( SkinTemplate $sktemplate, array &$links ): void {
		$user = $sktemplate->getUser();
		$isRegistered = $user->isRegistered();
		$isTemp = $user->isTemp();

		if ( $isTemp ) {
			// Remove temporary user page text and the temp username link from
			// user menu — both are already shown in the user info header
			unset( $links['user-menu']['tmpuserpage'] );
			unset( $links['user-menu']['userpage'] );

			// Move account links to appear right before the exit session link
			$tail = [];
			foreach ( [ 'createaccount', 'login', 'logout' ] as $key ) {
				if ( isset( $links['user-menu'][$key] ) ) {
					$tail[$key] = $links['user-menu'][$key];
					unset( $links['user-menu'][$key] );
				}
			}
			$links['user-menu'] += $tail;
		} elseif ( $isRegistered ) {
			// Remove user page link from user menu and recreate it in user info
			unset( $links['user-menu']['userpage'] );
		} else {
			// Remove anon user page text from user menu and recreate it in user info
			unset( $links['user-menu']['anonuserpage'] );
		}

		MenuItemDecorator::addIconsToMenuItems( $links, 'user-menu' );
	}

	/**
	 * Update user interface preferences menu
	 *
	 * @internal used inside Hooks\SkinHooks::onSkinTemplateNavigation
	 */
	private static function updateUserInterfacePreferencesMenu( array &$links ): void {
		MenuItemDecorator::addIconsToMenuItems( $links, 'user-interface-preferences' );
	}

	/**
	 * Update views menu items
	 *
	 * @internal used inside Hooks\SkinHooks::onSkinTemplateNavigation
	 */
	private static function updateViewsMenu( array &$links ): void {
		// Most icons are not mapped yet in the views menu
		$iconMap = [
			'view' => 'eye',
			// View source button only appears when the user do not have permission
			'viewsource' => 'editLock',
			'history' => 'history',
			'edit' => 'edit',
			'view-foreign' => 'linkExternal',
			// Extension:VisualEditor
			've-edit' => 'edit',
			// Extension:DiscussionTools
			'addsection' => 'speechBubbleAdd',
			// Extension:Page Forms
			'formedit' => 'tableAddRowBefore'
		];

		// If both visual edit and source edit buttons are present
		if ( isset( $links['views']['ve-edit'] ) && isset( $links['views']['edit'] ) ) {
			// Add a class so that we can make a merged button through CSS
			MenuItemDecorator::appendClassToItem( $links['views']['ve-edit']['class'], [ 'citizen-ve-edit-merged' ] );
			MenuItemDecorator::appendClassToItem( $links['views']['edit']['class'], [ 'citizen-ve-edit-merged' ] );
			// Use wikiText icon instead of edit icon for source edit
			$iconMap['edit'] = 'wikiText';
		}

		MenuItemDecorator::mapIconsToMenuItems( $links, 'views', $iconMap );
		MenuItemDecorator::addIconsToMenuItems( $links, 'views' );
		MenuItemDecorator::addButtonClassesToMenuItems( $links, 'views' );

		// Make edit buttons progressive primary instead of quiet
		foreach ( [ 'edit', 've-edit' ] as $key ) {
			if ( isset( $links['views'][$key] ) ) {
				MenuItemDecorator::setProgressiveAction( $links['views'][$key]['link-class'] );
			}
		}
	}
}
