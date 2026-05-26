<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration\Hooks;

use MediaWiki\Message\Message;
use MediaWiki\Output\OutputPage;
use MediaWiki\ResourceLoader\Context;
use MediaWiki\Skins\Citizen\Hooks\SkinHooks;
use MediaWiki\Skins\Citizen\SkinCitizen;
use MediaWiki\User\User;
use MediaWikiIntegrationTestCase;
use Skin;
use SkinTemplate;

/**
 * @group Citizen
 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
 */
class SkinHooksTest extends MediaWikiIntegrationTestCase {

	private function newSkinHooks(): SkinHooks {
		return new SkinHooks();
	}

	public function testOnSkinPageReadyConfigDisablesSearch(): void {
		$rlCtxMock = $this->createMock( Context::class );
		$rlCtxMock->method( 'getSkin' )->willReturn( 'citizen' );

		$config = [ 'search' => true ];
		$this->newSkinHooks()->onSkinPageReadyConfig( $rlCtxMock, $config );

		$this->assertFalse( $config['search'] );
	}

	public function testOnSkinPageReadyConfigSkipsNonCitizen(): void {
		$rlCtxMock = $this->createMock( Context::class );
		$rlCtxMock->method( 'getSkin' )->willReturn( 'vector' );

		$config = [ 'search' => true ];
		$this->newSkinHooks()->onSkinPageReadyConfig( $rlCtxMock, $config );

		$this->assertTrue( $config['search'] );
	}

	public function testOnOutputPageAfterGetHeadLinksArrayReplacesViewport(): void {
		$skinMock = $this->createMock( Skin::class );
		$skinMock->method( 'getSkinName' )->willReturn( 'citizen' );

		$out = $this->createMock( OutputPage::class );
		$out->method( 'getSkin' )->willReturn( $skinMock );

		$tags = [
			'meta-viewport' => '<meta name="viewport" content="width=device-width,' .
				'initial-scale=1,user-scalable=yes,minimum-scale=0.25,maximum-scale=5.0">',
		];

		$this->newSkinHooks()->onOutputPageAfterGetHeadLinksArray( $tags, $out );

		$this->assertStringContainsString( 'viewport-fit=cover', $tags['meta-viewport'] );
		$this->assertStringNotContainsString( 'user-scalable', $tags['meta-viewport'] );
		$this->assertStringNotContainsString( 'minimum-scale', $tags['meta-viewport'] );
		$this->assertStringNotContainsString( 'maximum-scale', $tags['meta-viewport'] );
	}

	public function testOnOutputPageAfterGetHeadLinksArraySkipsNonCitizen(): void {
		$skinMock = $this->createMock( Skin::class );
		$skinMock->method( 'getSkinName' )->willReturn( 'vector' );

		$out = $this->createMock( OutputPage::class );
		$out->method( 'getSkin' )->willReturn( $skinMock );

		$original = '<meta name="viewport" content="original">';
		$tags = [ 'meta-viewport' => $original ];

		$this->newSkinHooks()->onOutputPageAfterGetHeadLinksArray( $tags, $out );

		$this->assertSame( $original, $tags['meta-viewport'] );
	}

	public function testOnOutputPageAfterGetHeadLinksArraySkipsWhenNoViewportTag(): void {
		$skinMock = $this->createMock( Skin::class );
		$skinMock->method( 'getSkinName' )->willReturn( 'citizen' );

		$out = $this->createMock( OutputPage::class );
		$out->method( 'getSkin' )->willReturn( $skinMock );

		$tags = [];

		$this->newSkinHooks()->onOutputPageAfterGetHeadLinksArray( $tags, $out );

		$this->assertArrayNotHasKey( 'meta-viewport', $tags );
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

		SkinHooks::onSkinTemplateNavigation( $sktemplate, $links );

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

		SkinHooks::onSkinTemplateNavigation( $sktemplate, $links );

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

		SkinHooks::onSkinTemplateNavigation( $sktemplate, $links );

		// Without VE, source edit should keep the edit icon
		$this->assertSame( 'edit', $links['views']['edit']['icon'] );
	}

	public function testNavigationSkipsNonCitizen(): void {
		$sktemplate = $this->createSkinTemplateMock( 'vector' );
		$links = [
			'views' => [
				'edit' => [ 'id' => 'ca-edit', 'class' => '' ],
			],
		];

		SkinHooks::onSkinTemplateNavigation( $sktemplate, $links );

		$this->assertArrayNotHasKey( 'icon', $links['views']['edit'] );
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

		SkinHooks::onSkinTemplateNavigation( $sktemplate, $links );

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

		SkinHooks::onSkinTemplateNavigation( $sktemplate, $links );

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

		SkinHooks::onSkinTemplateNavigation( $sktemplate, $links );

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

		SkinHooks::onSkinTemplateNavigation( $sktemplate, $links );

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

		SkinHooks::onSkinTemplateNavigation( $sktemplate, $links );

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

		SkinHooks::onSkinTemplateNavigation( $sktemplate, $links );

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

		SkinHooks::onSkinTemplateNavigation( $sktemplate, $links );

		$this->assertArrayNotHasKey( 'anonuserpage', $links['user-menu'] );
		$this->assertArrayHasKey( 'login', $links['user-menu'] );
	}

	public function testToolboxMenuRemovesSiteTools(): void {
		$skinMock = $this->createMock( Skin::class );
		$skinMock->method( 'getSkinName' )->willReturn( 'citizen' );

		$sidebar = [
			'TOOLBOX' => [
				'whatlinkshere' => [ 'id' => 't-whatlinkshere' ],
				'upload' => [ 'id' => 't-upload' ],
				'specialpages' => [ 'id' => 't-specialpages' ],
				'print' => [ 'id' => 't-print' ],
			],
		];

		$this->newSkinHooks()->onSidebarBeforeOutput( $skinMock, $sidebar );

		$this->assertArrayNotHasKey( 'upload', $sidebar['TOOLBOX'] );
		$this->assertArrayNotHasKey( 'specialpages', $sidebar['TOOLBOX'] );
		$this->assertArrayHasKey( 'whatlinkshere', $sidebar['TOOLBOX'] );
		$this->assertArrayHasKey( 'print', $sidebar['TOOLBOX'] );
	}

	public function testToolboxMenuMapsIcons(): void {
		$skinMock = $this->createMock( Skin::class );
		$skinMock->method( 'getSkinName' )->willReturn( 'citizen' );

		$sidebar = [
			'TOOLBOX' => [
				'print' => [ 'id' => 't-print' ],
				'recentchangeslinked' => [ 'id' => 't-recentchangeslinked' ],
			],
		];

		$this->newSkinHooks()->onSidebarBeforeOutput( $skinMock, $sidebar );

		$this->assertSame( 'printer', $sidebar['TOOLBOX']['print']['icon'] );
		$this->assertSame( 'recentChanges', $sidebar['TOOLBOX']['recentchangeslinked']['icon'] );
	}

	public function testViewsMenuAddsCdxButtonClasses(): void {
		$sktemplate = $this->createSkinTemplateMock();
		$links = [
			'views' => [
				'view' => [ 'id' => 'ca-view' ],
				'history' => [ 'id' => 'ca-history' ],
			],
		];

		SkinHooks::onSkinTemplateNavigation( $sktemplate, $links );

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

		SkinHooks::onSkinTemplateNavigation( $sktemplate, $links );

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

		SkinHooks::onSkinTemplateNavigation( $sktemplate, $links );

		$this->assertContains( 'cdx-button', $links['associated-pages']['main']['link-class'] );
		$this->assertContains( 'citizen-cdx-button--size-large', $links['associated-pages']['main']['link-class'] );
	}

	/**
	 * Build a SkinCitizen mock whose setNotificationData() records the merged
	 * data into $captured, so the notifications tests can assert what the hook
	 * captured.
	 *
	 * @param ?array &$captured Receives the data passed to setNotificationData
	 * @return SkinCitizen
	 */
	private function createCitizenMockCapturing( ?array &$captured ): SkinCitizen {
		$skin = $this->createMock( SkinCitizen::class );
		$skin->method( 'getSkinName' )->willReturn( 'citizen' );
		$skin->method( 'setNotificationData' )->willReturnCallback(
			static function ( array $data ) use ( &$captured ): void {
				$captured = $data;
			}
		);
		return $skin;
	}

	public function testNotificationsMenuCapturesMergedDataAndDropsPortlet(): void {
		$captured = null;
		$skin = $this->createCitizenMockCapturing( $captured );
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

		SkinHooks::onSkinTemplateNavigation( $skin, $links );

		// Echo's portlet is dropped; Citizen renders its own dropdown.
		$this->assertArrayNotHasKey( 'notifications', $links );

		// The merged data is handed to the skin: combined count (alert + notice)
		// and the Special:Notifications target.
		$this->assertSame( 5, $captured['count'] );
		$this->assertSame( '/wiki/Special:Notifications', $captured['href'] );
	}

	public function testNotificationsMenuLeavesEmptyPortletAlone(): void {
		$captured = null;
		$skin = $this->createCitizenMockCapturing( $captured );
		// Echo's portlet is present but provided neither badge.
		$links = [ 'notifications' => [] ];

		SkinHooks::onSkinTemplateNavigation( $skin, $links );

		// Nothing to merge: the skin gets no data and the empty portlet is left
		// untouched (not dropped).
		$this->assertNull( $captured );
		$this->assertArrayHasKey( 'notifications', $links );
	}

	public function testNotificationsMenuWithOnlyNoticeBadge(): void {
		$captured = null;
		$skin = $this->createCitizenMockCapturing( $captured );
		$links = [
			'notifications' => [
				'notifications-notice' => [
					'id' => 'pt-notifications-notice',
					'href' => '/wiki/Special:Notifications?notice',
					'data' => [ 'counter-num' => 2 ],
				],
			],
		];

		SkinHooks::onSkinTemplateNavigation( $skin, $links );

		// A single badge is enough: count is the notice count, and the href
		// falls back to the notice badge's target.
		$this->assertSame( 2, $captured['count'] );
		$this->assertSame( '/wiki/Special:Notifications?notice', $captured['href'] );
		$this->assertArrayNotHasKey( 'notifications', $links );
	}
}
