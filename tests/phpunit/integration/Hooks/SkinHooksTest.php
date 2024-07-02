<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration\Hooks;

use MediaWiki\Request\ContentSecurityPolicy;
use MediaWiki\Skins\Citizen\Hooks\SkinHooks;
use MediaWiki\Skins\Citizen\SkinCitizen;
use MediaWiki\Title\Title;
use MediaWikiIntegrationTestCase;
use OutputPage;
use RequestContext;
use ResourceLoaderContext;
use SkinTemplate;

/**
 * @group Citizen
 */
class SkinHooksTest extends MediaWikiIntegrationTestCase {
	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testOnBeforePageDisplayNameMissmatch() {
		$outMock = $this->getMockBuilder( OutputPage::class )->disableOriginalConstructor()->getMock();
		$outMock->expects( $this->never() )->method( 'getCSP' );
		$hooks = new SkinHooks();

		$hooks->onBeforePageDisplay( $outMock, new SkinCitizen( [ 'name' => 'foo' ] ) );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testOnBeforePageDisplay() {
		if ( version_compare( '1.39', MW_VERSION, '<=' ) ) {
			$this->markTestSkipped( 'Failing on 1.39?' );
		}

		$cspMock = $this->getMockBuilder( ContentSecurityPolicy::class )->disableOriginalConstructor()->getMock();
		$cspMock->expects( $this->once() )->method( 'getNonce' )->willReturn( 'faux-nonce' );

		$outMock = $this->getMockBuilder( OutputPage::class )
			->setConstructorArgs( [ RequestContext::getMain() ] )
			->onlyMethods( [ 'getCSP' ] )
			->getMock();
		$outMock->expects( $this->once() )->method( 'getCSP' )->willReturn( $cspMock );

		$hooks = new SkinHooks();

		$hooks->onBeforePageDisplay( $outMock, new SkinCitizen() );

		$this->assertArrayHasKey( 'skin.citizen.inline', $outMock->getHeadItemsArray() );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSidebarBeforeOutputNameMissmatch() {
		$sidebar = [];
		$hooks = new SkinHooks();

		$hooks->onSidebarBeforeOutput( new SkinCitizen( [ 'name' => 'foo' ] ), $sidebar );

		$this->assertEmpty( $sidebar );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSidebarBeforeOutput() {
		$sidebar = [
			'TOOLBOX' => [
				'whatlinkshere' => [],
				'recentchangeslinked' => [],
				'print' => [],
			]
		];
		$hooks = new SkinHooks();

		$hooks->onSidebarBeforeOutput( new SkinCitizen(), $sidebar );

		$this->assertArrayHasKey( 'TOOLBOX', $sidebar );
		$this->assertArrayHasKey( 'whatlinkshere', $sidebar['TOOLBOX'] );
		$this->assertArrayHasKey( 'icon', $sidebar['TOOLBOX']['whatlinkshere'] );
		$this->assertEquals( 'articleRedirect', $sidebar['TOOLBOX']['whatlinkshere']['icon'] );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSkinBuildSidebarNameMissmatch() {
		$hooks = new SkinHooks();
		$bar = [];
		$hooks->onSkinBuildSidebar( new SkinCitizen( [ 'name' => 'foo' ] ), $bar );

		$this->assertEmpty( $bar );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSkinBuildSidebarDisabledUploads() {
		$this->overrideConfigValues( [
			'EnableUploads' => false,
		] );

		$hooks = new SkinHooks();
		$bar = [
			'foo' => [],
		];
		$hooks->onSkinBuildSidebar( new SkinCitizen(), $bar );

		$this->assertArrayHasKey( 'navigation', $bar );
		$this->assertArrayHasKey( 'specialpages', $bar['navigation'] );
		$this->assertIsArray( $bar['navigation']['specialpages'] );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSkinBuildSidebarEnabledUploads() {
		$this->overrideConfigValues( [
			'EnableUploads' => true,
		] );

		$hooks = new SkinHooks();
		$bar = [
			'foo' => [],
		];
		$hooks->onSkinBuildSidebar( new SkinCitizen(), $bar );

		$this->assertArrayHasKey( 'navigation', $bar );
		$this->assertArrayHasKey( 'upload', $bar['navigation'] );
		$this->assertIsArray( $bar['navigation']['upload'] );
		$this->assertEquals( 'upload', $bar['navigation']['upload']['icon'] );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSkinEditSectionLinksNameMissmatch() {
		$res = [];

		$hooks = new SkinHooks();
		$hooks->onSkinEditSectionLinks(
			new SkinCitizen( [ 'name' => 'foo' ] ),
			Title::makeTitle( NS_MAIN, 'Foo' ),
			'',
			'',
			$res,
			$this->getServiceContainer()->getContentLanguage()
		);

		$this->assertEmpty( $res );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSkinEditSectionLinksVEEditSection() {
		$res = [
			'editsection' => [
				'attribs' => [
					'class' => 'foo',
				],
			],
			'veeditsection' => [
				'attribs' => [
					'class' => 've-foo',
				],
			],
		];

		$hooks = new SkinHooks();
		$hooks->onSkinEditSectionLinks(
			new SkinCitizen(),
			Title::makeTitle( NS_MAIN, 'Foo' ),
			'',
			'',
			$res,
			$this->getServiceContainer()->getContentLanguage()
		);

		$this->assertStringContainsString(
			'citizen-editsection-icon',
			$res['veeditsection']['attribs']['class']
		);
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSkinEditSectionLinksEditSection() {
		$res = [
			'editsection' => [
				'attribs' => [
					'class' => 'foo',
				],
			],
		];

		$hooks = new SkinHooks();
		$hooks->onSkinEditSectionLinks(
			new SkinCitizen(),
			Title::makeTitle( NS_MAIN, 'Foo' ),
			'',
			'',
			$res,
			$this->getServiceContainer()->getContentLanguage()
		);

		$this->assertStringContainsString(
			'citizen-editsection-icon',
			$res['editsection']['attribs']['class']
		);
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSkinPageReadyConfigNameMissmatch() {
		$ctx = $this->getMockBuilder( ResourceLoaderContext::class )->disableOriginalConstructor()->getMock();
		$ctx->expects( $this->once() )->method( 'getSkin' )->willReturn( 'foo' );
		$res = [];

		$hooks = new SkinHooks();
		$hooks->onSkinPageReadyConfig(
			$ctx,
			$res
		);

		$this->assertEmpty( $res );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSkinPageReadyConfig() {
		$ctx = $this->getMockBuilder( ResourceLoaderContext::class )->disableOriginalConstructor()->getMock();
		$ctx->expects( $this->once() )->method( 'getSkin' )->willReturn( 'citizen' );
		$res = [];

		$hooks = new SkinHooks();
		$hooks->onSkinPageReadyConfig(
			$ctx,
			$res
		);

		$this->assertArrayHasKey( 'search', $res );
		$this->assertFalse( $res['search'] );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSkinTemplateNavigationNameMissmatch() {
		$template = $this->getMockBuilder( SkinTemplate::class )->disableOriginalConstructor()->getMock();
		$template->expects( $this->once() )->method( 'getSkinName' )->willReturn( 'foo' );

		$links = [];

		$hooks = new SkinHooks();
		$hooks->onSkinTemplateNavigation( $template, $links );

		$this->assertEmpty( $links );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSkinTemplateNavigationActions() {
		$template = $this->getMockBuilder( SkinTemplate::class )->disableOriginalConstructor()->getMock();
		$template->expects( $this->once() )->method( 'getSkinName' )->willReturn( 'citizen' );

		$links = [
			'actions' => [
				'delete' => [],
			],
		];

		$hooks = new SkinHooks();
		$hooks->onSkinTemplateNavigation( $template, $links );

		$this->assertArraySubmapSame( [
			'actions' => [
				'delete' => [
					'icon' => 'trash',
					'link-html' => '<span class="citizen-ui-icon mw-ui-icon-trash mw-ui-icon-wikimedia-trash"></span>'
				]
			]
		], $links );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSkinTemplateNavigationAssociatedPagesMenu() {
		$template = $this->getMockBuilder( SkinTemplate::class )->disableOriginalConstructor()->getMock();
		$template->expects( $this->once() )->method( 'getSkinName' )->willReturn( 'citizen' );

		$links = [
			'associated-pages' => [
				'main' => [],
			],
		];

		$hooks = new SkinHooks();
		$hooks->onSkinTemplateNavigation( $template, $links );

		$this->assertArraySubmapSame( [
			'associated-pages' => [
				'main' => [
					'icon' => 'article',
					'link-html' => '<span class="citizen-ui-icon mw-ui-icon-article mw-ui-icon-wikimedia-article"></span>'
				]
			]
		], $links );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSkinTemplateNavigationUserMenuTemp() {
		$mockUser = $this->getMockBuilder( \User::class )->disableOriginalConstructor()->getMock();
		$mockUser->expects( $this->once() )->method( 'isTemp' )->willReturn( true );

		$template = $this->getMockBuilder( SkinTemplate::class )->disableOriginalConstructor()->getMock();
		$template->expects( $this->once() )->method( 'getSkinName' )->willReturn( 'citizen' );
		$template->expects( $this->once() )->method( 'getUser' )->willReturn( $mockUser );

		$links = [
			'user-menu' => [
				'tmpuserpage' => [],
			],
		];

		$hooks = new SkinHooks();
		$hooks->onSkinTemplateNavigation( $template, $links );

		$this->assertArrayNotHasKey( 'tmpuserpage', $links['user-menu'] );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSkinTemplateNavigationUserMenuAnon() {
		$template = $this->getMockBuilder( SkinTemplate::class )->disableOriginalConstructor()->getMock();
		$template->expects( $this->once() )->method( 'getSkinName' )->willReturn( 'citizen' );
		$template->expects( $this->once() )->method( 'getUser' )->willReturn(
			$this->getServiceContainer()->getUserFactory()->newAnonymous()
		);

		$links = [
			'user-menu' => [
				'anonuserpage' => [],
			],
		];

		$hooks = new SkinHooks();
		$hooks->onSkinTemplateNavigation( $template, $links );

		$this->assertArrayNotHasKey( 'anonuserpage', $links['user-menu'] );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSkinTemplateNavigationUserMenuRegistered() {
		$mockUser = $this->getMockBuilder( \User::class )->disableOriginalConstructor()->getMock();
		$mockUser->expects( $this->once() )->method( 'isRegistered' )->willReturn( true );

		$template = $this->getMockBuilder( SkinTemplate::class )->disableOriginalConstructor()->getMock();
		$template->expects( $this->once() )->method( 'getSkinName' )->willReturn( 'citizen' );
		$template->expects( $this->once() )->method( 'getUser' )->willReturn( $mockUser );

		$links = [
			'user-menu' => [
				'userpage' => [],
			],
		];

		$hooks = new SkinHooks();
		$hooks->onSkinTemplateNavigation( $template, $links );

		$this->assertArrayNotHasKey( 'userpage', $links['user-menu'] );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSkinTemplateNavigationUserInterfacePreferencesMenu() {
		$template = $this->getMockBuilder( SkinTemplate::class )->disableOriginalConstructor()->getMock();
		$template->expects( $this->once() )->method( 'getSkinName' )->willReturn( 'citizen' );

		$links = [
			'user-interface-preferences' => [],
		];

		$hooks = new SkinHooks();
		$hooks->onSkinTemplateNavigation( $template, $links );

		$this->assertArrayHasKey( 'user-interface-preferences', $links );
		$this->assertEmpty( $links['user-interface-preferences'] );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSkinTemplateNavigationViews() {
		$template = $this->getMockBuilder( SkinTemplate::class )->disableOriginalConstructor()->getMock();
		$template->expects( $this->once() )->method( 'getSkinName' )->willReturn( 'citizen' );

		$links = [
			'views' => [
				'view' => [],
			],
		];

		$hooks = new SkinHooks();
		$hooks->onSkinTemplateNavigation( $template, $links );

		$this->assertArraySubmapSame( [
			'views' => [
				'view' => [
					'icon' => 'article',
					'link-html' => '<span class="citizen-ui-icon mw-ui-icon-article mw-ui-icon-wikimedia-article"></span>'
				]
			]
		], $links );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\SkinHooks
	 * @return void
	 */
	public function testSkinTemplateNavigationViewsVEEdit() {
		$template = $this->getMockBuilder( SkinTemplate::class )->disableOriginalConstructor()->getMock();
		$template->expects( $this->once() )->method( 'getSkinName' )->willReturn( 'citizen' );

		$links = [
			'views' => [
				've-edit' => [
					'class' => ''
				],
				'edit' => [
					'class' => ''
				],
			],
		];

		$hooks = new SkinHooks();
		$hooks->onSkinTemplateNavigation( $template, $links );

		$this->assertArraySubmapSame( [
			'views' => [
				've-edit' => [
					'class' => 'citizen-ve-edit-merged',
				],
				'edit' => [
					'class' => 'citizen-ve-edit-merged',
				],
			],
		], $links );
	}
}
