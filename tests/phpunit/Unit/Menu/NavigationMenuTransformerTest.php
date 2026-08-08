<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit\Menu;

use MediaWiki\Message\Message;
use MediaWiki\Skins\Citizen\Menu\NavigationMenuTransformer;
use MediaWiki\SpecialPage\SpecialPageFactory;
use MediaWiki\Title\Title;
use MediaWiki\User\User;
use MediaWikiUnitTestCase;
use SkinTemplate;

/**
 * @group Citizen
 * @covers \MediaWiki\Skins\Citizen\Menu\NavigationMenuTransformer
 */
class NavigationMenuTransformerTest extends MediaWikiUnitTestCase {

	/**
	 * Resolves every alias to a Title whose local URL is /wiki/Special:<alias>,
	 * so assertions can name the expected link target outright.
	 */
	private function newTransformer(): NavigationMenuTransformer {
		$specialPageFactory = $this->createMock( SpecialPageFactory::class );
		$specialPageFactory->method( 'getTitleForAlias' )->willReturnCallback(
			function ( string $alias ): Title {
				$title = $this->createMock( Title::class );
				$title->method( 'getLocalURL' )->willReturn( '/wiki/Special:' . $alias );

				return $title;
			}
		);

		return new NavigationMenuTransformer( $specialPageFactory );
	}

	/**
	 * A transformer whose special pages are all unregistered, which is what
	 * SpecialPageFactory reports by returning null.
	 */
	private function newTransformerWithoutSpecialPages(): NavigationMenuTransformer {
		$specialPageFactory = $this->createMock( SpecialPageFactory::class );
		$specialPageFactory->method( 'getTitleForAlias' )->willReturn( null );

		return new NavigationMenuTransformer( $specialPageFactory );
	}

	private function createSkinTemplateMock( string $skinName = 'citizen' ): SkinTemplate {
		$user = $this->createMock( User::class );
		$user->method( 'isRegistered' )->willReturn( true );
		$user->method( 'isTemp' )->willReturn( false );

		$sktemplate = $this->createMock( SkinTemplate::class );
		$sktemplate->method( 'getSkinName' )->willReturn( $skinName );
		$sktemplate->method( 'getUser' )->willReturn( $user );
		$sktemplate->method( 'msg' )->willReturnCallback(
			fn ( string $key ): Message => $this->createConfiguredMock( Message::class, [ 'text' => $key ] )
		);

		return $sktemplate;
	}

	public function testViewsMenuMapsIcons(): void {
		$sktemplate = $this->createSkinTemplateMock();
		$links = [
			'views' => [
				'view' => [ 'id' => 'ca-view' ],
				'edit' => [ 'id' => 'ca-edit', 'class' => '' ],
				'history' => [ 'id' => 'ca-history' ],
			],
		];

		$this->newTransformer()->transform( $sktemplate, $links );

		$this->assertSame( 'eye', $links['views']['view']['icon'] );
		$this->assertSame( 'edit', $links['views']['edit']['icon'] );
		$this->assertSame( 'history', $links['views']['history']['icon'] );
	}

	public function testViewsMenuMergesVeAndSourceEdit(): void {
		$sktemplate = $this->createSkinTemplateMock();
		$links = [
			'views' => [
				've-edit' => [ 'id' => 'ca-ve-edit', 'class' => '' ],
				'edit' => [ 'id' => 'ca-edit', 'class' => '' ],
			],
		];

		$this->newTransformer()->transform( $sktemplate, $links );

		// When both exist, source edit should use wikiText icon
		$this->assertSame( 'wikiText', $links['views']['edit']['icon'] );
		$this->assertSame( 'edit', $links['views']['ve-edit']['icon'] );
		// Both should have the merged CSS class
		$this->assertStringContainsString( 'citizen-ve-edit-merged', $links['views']['ve-edit']['class'] );
		$this->assertStringContainsString( 'citizen-ve-edit-merged', $links['views']['edit']['class'] );
	}

	public function testViewsMenuWithOnlySourceEdit(): void {
		$sktemplate = $this->createSkinTemplateMock();
		$links = [
			'views' => [
				'edit' => [ 'id' => 'ca-edit', 'class' => '' ],
			],
		];

		$this->newTransformer()->transform( $sktemplate, $links );

		// Without VE, source edit should keep the edit icon
		$this->assertSame( 'edit', $links['views']['edit']['icon'] );
	}

	public function testTransformSkipsNonCitizenSkins(): void {
		// A skin that extends SkinCitizen inherits the call but is not Citizen;
		// decorating its menus would pollute the HTML cached for it.
		$sktemplate = $this->createSkinTemplateMock( 'vector' );
		$links = [
			'views' => [
				'edit' => [ 'id' => 'ca-edit', 'class' => '' ],
			],
		];

		$data = $this->newTransformer()->transform( $sktemplate, $links );

		$this->assertArrayNotHasKey( 'icon', $links['views']['edit'] );
		$this->assertNull( $data );
	}

	public function testActionsMenuMapsIcons(): void {
		$sktemplate = $this->createSkinTemplateMock();
		$links = [
			'actions' => [
				'delete' => [ 'id' => 'ca-delete' ],
				'move' => [ 'id' => 'ca-move' ],
				'protect' => [ 'id' => 'ca-protect' ],
			],
		];

		$this->newTransformer()->transform( $sktemplate, $links );

		$this->assertSame( 'trash', $links['actions']['delete']['icon'] );
		$this->assertSame( 'move', $links['actions']['move']['icon'] );
		$this->assertSame( 'lock', $links['actions']['protect']['icon'] );
	}

	public function testAssociatedPagesMenuMapsTalkPageIcons(): void {
		$sktemplate = $this->createSkinTemplateMock();
		$links = [
			'associated-pages' => [
				'main' => [ 'id' => 'ca-nstab-main' ],
				'main_talk' => [ 'id' => 'ca-talk' ],
			],
		];

		$this->newTransformer()->transform( $sktemplate, $links );

		$this->assertSame( 'speechBubbles', $links['associated-pages']['main_talk']['icon'] );
		$this->assertSame( 'arrowPrevious', $links['associated-pages']['main']['icon'] );
	}

	public function testAssociatedPagesMenuMapsFileIcon(): void {
		$sktemplate = $this->createSkinTemplateMock();
		$links = [
			'associated-pages' => [
				'file' => [ 'id' => 'ca-nstab-image' ],
			],
		];

		$this->newTransformer()->transform( $sktemplate, $links );

		$this->assertSame( 'image', $links['associated-pages']['file']['icon'] );
	}

	private function createSkinTemplateWithUser(
		bool $isRegistered,
		bool $isTemp
	): SkinTemplate {
		$user = $this->createMock( User::class );
		$user->method( 'isRegistered' )->willReturn( $isRegistered );
		$user->method( 'isTemp' )->willReturn( $isTemp );

		$sktemplate = $this->createMock( SkinTemplate::class );
		$sktemplate->method( 'getSkinName' )->willReturn( 'citizen' );
		$sktemplate->method( 'getUser' )->willReturn( $user );

		return $sktemplate;
	}

	public function testUserMenuRemovesUserpageForRegistered(): void {
		$sktemplate = $this->createSkinTemplateWithUser( true, false );
		$links = [
			'user-menu' => [
				'userpage' => [ 'id' => 'pt-userpage' ],
				'preferences' => [ 'id' => 'pt-preferences' ],
			],
		];

		$this->newTransformer()->transform( $sktemplate, $links );

		$this->assertArrayNotHasKey( 'userpage', $links['user-menu'] );
		$this->assertArrayHasKey( 'preferences', $links['user-menu'] );
	}

	public function testUserMenuRemovesTmpuserpageAndUserpageForTemp(): void {
		$sktemplate = $this->createSkinTemplateWithUser( true, true );
		$links = [
			'user-menu' => [
				'tmpuserpage' => [ 'id' => 'pt-tmpuserpage' ],
				'userpage' => [ 'id' => 'pt-userpage' ],
				'mytalk' => [ 'id' => 'pt-mytalk' ],
			],
		];

		$this->newTransformer()->transform( $sktemplate, $links );

		$this->assertArrayNotHasKey( 'tmpuserpage', $links['user-menu'] );
		$this->assertArrayNotHasKey( 'userpage', $links['user-menu'] );
		$this->assertArrayHasKey( 'mytalk', $links['user-menu'] );
	}

	public function testUserMenuMovesAccountLinksBeforeLogoutForTemp(): void {
		$sktemplate = $this->createSkinTemplateWithUser( true, true );
		$links = [
			'user-menu' => [
				'userpage' => [ 'id' => 'pt-userpage' ],
				'createaccount' => [ 'id' => 'pt-createaccount' ],
				'login' => [ 'id' => 'pt-login' ],
				'mytalk' => [ 'id' => 'pt-mytalk' ],
				'mycontris' => [ 'id' => 'pt-mycontris' ],
				'logout' => [ 'id' => 'pt-logout' ],
			],
		];

		$this->newTransformer()->transform( $sktemplate, $links );

		$this->assertSame(
			[ 'mytalk', 'mycontris', 'createaccount', 'login', 'logout' ],
			array_keys( $links['user-menu'] )
		);
	}

	public function testUserMenuRemovesAnonuserpageForAnon(): void {
		$sktemplate = $this->createSkinTemplateWithUser( false, false );
		$links = [
			'user-menu' => [
				'anonuserpage' => [ 'id' => 'pt-anonuserpage' ],
				'login' => [ 'id' => 'pt-login' ],
			],
		];

		$this->newTransformer()->transform( $sktemplate, $links );

		$this->assertArrayNotHasKey( 'anonuserpage', $links['user-menu'] );
		$this->assertArrayHasKey( 'login', $links['user-menu'] );
	}

	public function testViewsMenuAddsCdxButtonClasses(): void {
		$sktemplate = $this->createSkinTemplateMock();
		$links = [
			'views' => [
				'view' => [ 'id' => 'ca-view' ],
				'history' => [ 'id' => 'ca-history' ],
			],
		];

		$this->newTransformer()->transform( $sktemplate, $links );

		$expectedClasses = [
			'citizen-cdx-button--size-large',
			'cdx-button',
			'cdx-button--fake-button',
			'cdx-button--fake-button--enabled',
			'cdx-button--weight-quiet',
		];
		foreach ( $expectedClasses as $class ) {
			$this->assertContains( $class, $links['views']['view']['link-class'] );
			$this->assertContains( $class, $links['views']['history']['link-class'] );
		}
	}

	public function testViewsMenuPromotesEditButtonsToProgressive(): void {
		$sktemplate = $this->createSkinTemplateMock();
		$links = [
			'views' => [
				'edit' => [ 'id' => 'ca-edit', 'class' => '' ],
			],
		];

		$this->newTransformer()->transform( $sktemplate, $links );

		$linkClass = $links['views']['edit']['link-class'];
		$this->assertContains( 'cdx-button--weight-primary', $linkClass );
		$this->assertContains( 'cdx-button--action-progressive', $linkClass );
		$this->assertNotContains( 'cdx-button--weight-quiet', $linkClass );
	}

	public function testAssociatedPagesMenuAddsCdxButtonClasses(): void {
		$sktemplate = $this->createSkinTemplateMock();
		$links = [
			'associated-pages' => [
				'main' => [ 'id' => 'ca-nstab-main' ],
			],
		];

		$this->newTransformer()->transform( $sktemplate, $links );

		$this->assertContains( 'cdx-button', $links['associated-pages']['main']['link-class'] );
		$this->assertContains( 'citizen-cdx-button--size-large', $links['associated-pages']['main']['link-class'] );
	}

	public function testNotificationsMenuReturnsMergedDataAndDropsPortlet(): void {
		$sktemplate = $this->createSkinTemplateMock();
		$links = [
			'notifications' => [
				'notifications-alert' => [
					'id' => 'pt-notifications-alert',
					'href' => '/wiki/Special:Notifications',
					'data' => [ 'counter-num' => 3 ],
				],
				'notifications-notice' => [
					'id' => 'pt-notifications-notice',
					'href' => '/wiki/Special:Notifications',
					'data' => [ 'counter-num' => 2 ],
				],
			],
		];

		$data = $this->newTransformer()->transform( $sktemplate, $links );

		// Echo's portlet is dropped; Citizen renders its own dropdown.
		$this->assertArrayNotHasKey( 'notifications', $links );

		// The merged data is returned to the skin: combined count (alert +
		// notice) and the Special:Notifications target.
		$this->assertSame( 5, $data['count'] );
		$this->assertSame( '/wiki/Special:Notifications', $data['href'] );

		// The panel's pre-mount placeholder previews what is waiting.
		$this->assertTrue( $data['has-unread'] );
		$this->assertCount( 5, $data['placeholder-rows'] );
		$this->assertStringContainsString( '#mw-prefsection-echo', $data['prefs-href'] );
	}

	public function testNotificationsPlaceholderPreviewsNothingWhenNothingIsWaiting(): void {
		$sktemplate = $this->createSkinTemplateMock();
		// Echo still renders its badges at zero; the panel has nothing to preview.
		$links = [
			'notifications' => [
				'notifications-alert' => [
					'id' => 'pt-notifications-alert',
					'href' => '/wiki/Special:Notifications',
					'data' => [ 'counter-num' => 0 ],
				],
			],
		];

		$data = $this->newTransformer()->transform( $sktemplate, $links );

		// No rows and has-unread false, so the template renders the empty state
		// outright rather than a shimmer that resolves into it.
		$this->assertSame( 0, $data['count'] );
		$this->assertFalse( $data['has-unread'] );
		$this->assertSame( [], $data['placeholder-rows'] );
	}

	public function testNotificationsPlaceholderCapsItsPreviewAtAPanelful(): void {
		$sktemplate = $this->createSkinTemplateMock();
		$links = [
			'notifications' => [
				'notifications-alert' => [
					'id' => 'pt-notifications-alert',
					'href' => '/wiki/Special:Notifications',
					'data' => [ 'counter-num' => 40 ],
				],
			],
		];

		$data = $this->newTransformer()->transform( $sktemplate, $links );

		// The preview fills the panel; the list itself scrolls once mounted.
		$this->assertSame( 40, $data['count'] );
		$this->assertCount( 5, $data['placeholder-rows'] );
	}

	public function testNotificationsPlaceholderPreviewsOneRowPerNotification(): void {
		$sktemplate = $this->createSkinTemplateMock();
		$links = [
			'notifications' => [
				'notifications-alert' => [
					'id' => 'pt-notifications-alert',
					'href' => '/wiki/Special:Notifications',
					'data' => [ 'counter-num' => 2 ],
				],
			],
		];

		$data = $this->newTransformer()->transform( $sktemplate, $links );

		// Below the cap the preview matches the count, so two notifications do
		// not look like five on the way in.
		$this->assertCount( 2, $data['placeholder-rows'] );
	}

	public function testNotificationsMenuLeavesEmptyPortletAlone(): void {
		$sktemplate = $this->createSkinTemplateMock();
		// Echo's portlet is present but provided neither badge.
		$links = [ 'notifications' => [] ];

		$data = $this->newTransformer()->transform( $sktemplate, $links );

		// Nothing to merge: no data is returned and the empty portlet is left
		// untouched (not dropped).
		$this->assertNull( $data );
		$this->assertArrayHasKey( 'notifications', $links );
	}

	public function testNotificationsMenuWithOnlyNoticeBadge(): void {
		$sktemplate = $this->createSkinTemplateMock();
		$links = [
			'notifications' => [
				'notifications-notice' => [
					'id' => 'pt-notifications-notice',
					'href' => '/wiki/Special:Notifications?notice',
					'data' => [ 'counter-num' => 2 ],
				],
			],
		];

		$data = $this->newTransformer()->transform( $sktemplate, $links );

		// A single badge is enough: count is the notice count, and the href
		// falls back to the notice badge's target.
		$this->assertSame( 2, $data['count'] );
		$this->assertSame( '/wiki/Special:Notifications?notice', $data['href'] );
		$this->assertArrayNotHasKey( 'notifications', $links );
	}

	public function testNotificationsLinksResolveThroughTheSpecialPageFactory(): void {
		$sktemplate = $this->createSkinTemplateMock();
		// A badge with no target of its own, so the see-all link falls back to
		// Special:Notifications.
		$links = [
			'notifications' => [
				'notifications-alert' => [
					'id' => 'pt-notifications-alert',
					'data' => [ 'counter-num' => 1 ],
				],
			],
		];

		$data = $this->newTransformer()->transform( $sktemplate, $links );

		$this->assertSame( '/wiki/Special:Notifications', $data['href'] );
		// The fragment is appended to the URL rather than carried on the Title,
		// which would drop it.
		$this->assertSame( '/wiki/Special:Preferences#mw-prefsection-echo', $data['prefs-href'] );
	}

	public function testNotificationsLinksAreEmptyWhenSpecialPagesAreUnregistered(): void {
		$sktemplate = $this->createSkinTemplateMock();
		$links = [
			'notifications' => [
				'notifications-alert' => [
					'id' => 'pt-notifications-alert',
					'data' => [ 'counter-num' => 1 ],
				],
			],
		];

		$data = $this->newTransformerWithoutSpecialPages()->transform( $sktemplate, $links );

		// Empty rather than a half-built link: '#mw-prefsection-echo' on its own
		// would be a fragment pointing at the current page.
		$this->assertSame( '', $data['href'] );
		$this->assertSame( '', $data['prefs-href'] );
	}
}
