<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Menu;

use MediaWiki\SpecialPage\SpecialPageFactory;
use SkinTemplate;

/**
 * Applies Citizen's decoration to the navigation menus MediaWiki builds
 * for a page: icons, Codex button classes, and the menu reshuffling the
 * skin's header and user menu expect.
 *
 * This is not a hook handler. MediaWiki has no hook that fires late
 * enough to see every other extension's SkinTemplateNavigation changes
 * (T287622), so SkinCitizen invokes this directly after the core hooks
 * have run.
 *
 * transform() checks the skin name because
 * SkinCitizen::runOnSkinTemplateNavigationHooks() is protected and
 * inherited: a skin declared as `class SkinFoo extends SkinCitizen` and
 * registered under its own name reaches this code, and decorating its
 * menus would land Citizen's markup in the HTML cached for that skin.
 */
final class NavigationMenuTransformer {

	/**
	 * Rows the notification placeholder previews at most. Enough to fill the
	 * panel's minimum height; the list itself scrolls once mounted.
	 *
	 * The mounted panel previews the same number while it fetches — keep in
	 * step with PLACEHOLDER_ROWS in
	 * resources/skins.citizen.notifications/components/App.vue.
	 */
	private const NOTIFICATIONS_PLACEHOLDER_ROWS = 5;

	public function __construct(
		private readonly SpecialPageFactory $specialPageFactory
	) {
	}

	/**
	 * Decorate every navigation menu present in $links, and return the
	 * merged notification data for the skin's own bell. The notification
	 * data comes back as a return value rather than as a menu because the
	 * skin renders it as template data.
	 *
	 * @internal
	 *
	 * @param SkinTemplate $skin
	 * @param array &$links Navigation menus, modified in place
	 * @return array|null Merged notification data, or null when the skin is not
	 *   Citizen (in which case $links is untouched) or Echo supplied no badges.
	 */
	public function transform( SkinTemplate $skin, array &$links ): ?array {
		// Be extra safe because it might be active on other skins with caching
		if ( $skin->getSkinName() !== 'citizen' ) {
			return null;
		}

		$notificationData = null;

		if ( isset( $links['actions'] ) ) {
			$this->updateActionsMenu( $links );
		}

		if ( isset( $links['associated-pages'] ) ) {
			$this->updateAssociatedPagesMenu( $links );
		}

		if ( isset( $links['notifications'] ) ) {
			$notificationData = $this->updateNotificationsMenu( $links );
		}

		if ( isset( $links['user-menu'] ) ) {
			$this->updateUserMenu( $skin, $links );
		}

		if ( isset( $links['user-interface-preferences'] ) ) {
			$this->updateUserInterfacePreferencesMenu( $links );
		}

		if ( isset( $links['views'] ) ) {
			$this->updateViewsMenu( $links );
		}

		return $notificationData;
	}

	/**
	 * Update actions menu items
	 */
	private function updateActionsMenu( array &$links ): void {
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
	 */
	private function updateAssociatedPagesMenu( array &$links ): void {
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
	 * Capture Echo's two notification badges (alert + notice) as merged data
	 * for Citizen's own notifications dropdown (Notifications.mustache), then
	 * drop Echo's portlet so there is no duplicate control. The merged unread
	 * count is returned to the caller, which exposes it as template data; the
	 * dropdown renders a single bell that opens a panel showing both streams
	 * (and links to Special:Notifications without JS).
	 */
	private function updateNotificationsMenu( array &$links ): ?array {
		$alert = $links['notifications']['notifications-alert'] ?? null;
		$notice = $links['notifications']['notifications-notice'] ?? null;

		// Nothing to do if Echo did not provide its badges.
		if ( $alert === null && $notice === null ) {
			return null;
		}

		$alertCount = (int)( $alert['data']['counter-num'] ?? 0 );
		$noticeCount = (int)( $notice['data']['counter-num'] ?? 0 );
		// Clamped because the count sizes an array below, where a negative
		// would be fatal rather than merely wrong — and this runs on every page
		// view for every logged-in user.
		$count = max( 0, $alertCount + $noticeCount );

		$data = [
			'count' => $count,
			'href' => $alert['href'] ?? $notice['href']
				?? $this->getSpecialPageUrl( 'Notifications' ),
			// The fragment is concatenated rather than passed as a Title
			// fragment, because getLocalURL() omits the fragment and would
			// silently drop it.
			'prefs-href' => $this->getSpecialPageUrl( 'Preferences', '#mw-prefsection-echo' ),
			// The panel's pre-mount placeholder previews what is waiting:
			// rows when something is, the empty state when nothing is.
			// Mustache cannot count, so the row list is built here.
			'has-unread' => $count > 0,
			'placeholder-rows' => array_fill(
				0, min( $count, self::NOTIFICATIONS_PLACEHOLDER_ROWS ), true
			),
		];

		// Citizen renders its own notifications dropdown, so drop Echo's
		// portlet badges to avoid a duplicate control in the header.
		unset( $links['notifications'] );

		return $data;
	}

	/**
	 * Local URL of a special page with $fragment appended verbatim (leading
	 * '#' included), or the empty string when the page is not registered.
	 *
	 * getTitleForAlias() resolves against the registered special-page list and
	 * returns null for an unregistered name, where SpecialPage::getTitleFor()
	 * minted a Title unconditionally. Neither caller can reach that: Echo's
	 * badges imply Special:Notifications exists and Special:Preferences is
	 * core.
	 */
	private function getSpecialPageUrl( string $name, string $fragment = '' ): string {
		$title = $this->specialPageFactory->getTitleForAlias( $name );

		return $title === null ? '' : $title->getLocalURL() . $fragment;
	}

	/**
	 * Update user menu
	 */
	private function updateUserMenu( SkinTemplate $skin, array &$links ): void {
		$user = $skin->getUser();
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
	 */
	private function updateUserInterfacePreferencesMenu( array &$links ): void {
		MenuItemDecorator::addIconsToMenuItems( $links, 'user-interface-preferences' );
	}

	/**
	 * Update views menu items
	 */
	private function updateViewsMenu( array &$links ): void {
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
