<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration\Hooks;

use MediaWiki\Config\HashConfig;
use MediaWiki\MainConfigNames;
use MediaWiki\Output\OutputPage;
use MediaWiki\Request\FauxRequest;
use MediaWiki\ResourceLoader\Context;
use MediaWiki\Skins\Citizen\Hooks\SkinHooks;
use MediaWikiIntegrationTestCase;
use PHPUnit\Framework\MockObject\MockObject;
use Skin;

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

	public function testToolboxMenuRemovesSiteTools(): void {
		$sidebar = [
			'navigation' => [],
			'TOOLBOX' => [
				'whatlinkshere' => [ 'id' => 't-whatlinkshere' ],
				'upload' => [ 'id' => 't-upload' ],
				'specialpages' => [ 'id' => 't-specialpages' ],
				'print' => [ 'id' => 't-print' ],
			],
		];

		$this->newSkinHooks()->onSidebarBeforeOutput( $this->createCitizenSkinMock(), $sidebar );

		$this->assertArrayNotHasKey( 'upload', $sidebar['TOOLBOX'] );
		$this->assertArrayNotHasKey( 'specialpages', $sidebar['TOOLBOX'] );
		$this->assertArrayHasKey( 'whatlinkshere', $sidebar['TOOLBOX'] );
		$this->assertArrayHasKey( 'print', $sidebar['TOOLBOX'] );
	}

	public function testToolboxMenuMapsIcons(): void {
		$sidebar = [
			'TOOLBOX' => [
				'print' => [ 'id' => 't-print' ],
				'recentchangeslinked' => [ 'id' => 't-recentchangeslinked' ],
			],
		];

		$this->newSkinHooks()->onSidebarBeforeOutput( $this->createCitizenSkinMock(), $sidebar );

		$this->assertSame( 'printer', $sidebar['TOOLBOX']['print']['icon'] );
		$this->assertSame( 'recentChanges', $sidebar['TOOLBOX']['recentchangeslinked']['icon'] );
	}

	public function testUploadMovesToFirstSidebarMenuWithItsIcon(): void {
		$sidebar = [
			'navigation' => [ [ 'id' => 'n-mainpage' ] ],
			'TOOLBOX' => [
				'upload' => [ 'id' => 't-upload', 'href' => '/wiki/Special:Upload' ],
			],
			'LANGUAGES' => [],
		];

		$this->newSkinHooks()->onSidebarBeforeOutput( $this->createCitizenSkinMock(), $sidebar );

		$this->assertArrayNotHasKey( 'upload', $sidebar['TOOLBOX'] );
		$moved = end( $sidebar['navigation'] );
		$this->assertSame( 't-upload', $moved['id'] );
		$this->assertSame( '/wiki/Special:Upload', $moved['href'] );
		$this->assertSame( 'upload', $moved['icon'] );
		$this->assertStringContainsString( 'mw-ui-icon-upload', $moved['link-html'] );
	}

	public function testUploadCarriesItsLabelMessageOutOfTheToolbox(): void {
		$sidebar = [
			'navigation' => [ [ 'id' => 'n-mainpage' ], [ 'id' => 'n-help' ] ],
			'TOOLBOX' => [
				'upload' => [ 'id' => 't-upload', 'href' => '/wiki/Special:Upload' ],
			],
		];

		$this->newSkinHooks()->onSidebarBeforeOutput( $this->createCitizenSkinMock(), $sidebar );

		$this->assertSame( 'upload', end( $sidebar['navigation'] )['msg'] );
	}

	public function testUploadKeepsTheHrefMediaWikiResolved(): void {
		$sidebar = [
			'navigation' => [],
			'TOOLBOX' => [
				'upload' => [
					'id' => 't-upload',
					'href' => 'https://commons.example.org/wiki/Special:UploadWizard',
				],
			],
		];

		$this->newSkinHooks()->onSidebarBeforeOutput( $this->createCitizenSkinMock(), $sidebar );

		$this->assertSame(
			'https://commons.example.org/wiki/Special:UploadWizard',
			$sidebar['navigation'][0]['href']
		);
	}

	public function testUploadMovesToTheConfiguredGlobalToolsPortlet(): void {
		$sidebar = [
			'navigation' => [],
			'TOOLBOX' => [
				'upload' => [ 'id' => 't-upload', 'href' => '/wiki/Special:Upload' ],
			],
		];

		$this->newSkinHooks()->onSidebarBeforeOutput(
			$this->createCitizenSkinMock( 'p-mytools' ),
			$sidebar
		);

		$this->assertSame( [], $sidebar['navigation'] );
		$this->assertSame( 't-upload', $sidebar['mytools'][0]['id'] );
	}

	public function testUploadSkipsSkinProvidedMenusWhenPickingTheDefault(): void {
		$sidebar = [
			'TOOLBOX' => [
				'upload' => [ 'id' => 't-upload', 'href' => '/wiki/Special:Upload' ],
			],
			'navigation' => [],
		];

		$this->newSkinHooks()->onSidebarBeforeOutput( $this->createCitizenSkinMock(), $sidebar );

		$this->assertSame( 't-upload', $sidebar['navigation'][0]['id'] );
	}

	public function testUploadFallsBackToNavigationWhenTheSidebarHasNoMenus(): void {
		$sidebar = [
			'TOOLBOX' => [
				'upload' => [ 'id' => 't-upload', 'href' => '/wiki/Special:Upload' ],
			],
		];

		$this->newSkinHooks()->onSidebarBeforeOutput( $this->createCitizenSkinMock(), $sidebar );

		$this->assertSame( 't-upload', $sidebar['navigation'][0]['id'] );
	}

	public function testNoUploadLinkIsAddedWhenMediaWikiOmitsIt(): void {
		$sidebar = [
			'navigation' => [ [ 'id' => 'n-mainpage' ] ],
			'TOOLBOX' => [ 'print' => [ 'id' => 't-print' ] ],
		];

		$this->newSkinHooks()->onSidebarBeforeOutput( $this->createCitizenSkinMock(), $sidebar );

		$this->assertSame( [ [ 'id' => 'n-mainpage' ] ], $sidebar['navigation'] );
	}

	/**
	 * Build an OutputPage mock wired for the preview channel: the hook
	 * reads the request (URL params, cookies, response recorder) and the
	 * skin config from it.
	 *
	 * @param FauxRequest $request
	 * @param array $config Preview-related config overrides
	 * @return OutputPage&MockObject
	 */
	private function createPreviewOutputPage( FauxRequest $request, array $config = [] ): OutputPage&MockObject {
		$out = $this->createMock( OutputPage::class );
		$out->method( 'getRequest' )->willReturn( $request );
		$out->method( 'getConfig' )->willReturn( new HashConfig( $config + [
			'CitizenEnablePreferences' => false,
			'CitizenPreview' => 0,
		] ) );

		return $out;
	}

	private function createCitizenSkinMock( string $globalToolsPortlet = '' ): Skin {
		$skin = $this->createMock( Skin::class );
		$skin->method( 'getSkinName' )->willReturn( 'citizen' );
		$skin->method( 'getConfig' )->willReturn( new HashConfig( [
			'CitizenGlobalToolsPortlet' => $globalToolsPortlet,
		] ) );

		return $skin;
	}

	public function testOnBeforePageDisplayPreviewLoadsNewTokensAndStampsClasses(): void {
		$request = new FauxRequest( [ 'citizenpreview' => '4' ] );
		$out = $this->createPreviewOutputPage( $request );
		$out->expects( $this->once() )->method( 'addModuleStyles' )
			->with( [ 'skins.citizen.tokens.new' ] );
		$out->expects( $this->once() )->method( 'addHtmlClasses' )
			->with( [ 'citizen-v4' ] );

		$this->newSkinHooks()->onBeforePageDisplay( $out, $this->createCitizenSkinMock() );
	}

	public function testOnBeforePageDisplayStableLoadsLegacyTokensAndNoClasses(): void {
		$request = new FauxRequest();
		$out = $this->createPreviewOutputPage( $request );
		$out->expects( $this->once() )->method( 'addModuleStyles' )
			->with( [ 'skins.citizen.tokens' ] );
		$out->expects( $this->never() )->method( 'addHtmlClasses' );

		$this->newSkinHooks()->onBeforePageDisplay( $out, $this->createCitizenSkinMock() );
	}

	public function testOnBeforePageDisplayCookieActivatesPreview(): void {
		$request = new FauxRequest();
		$request->setCookie( 'citizenpreview', '4' );
		$out = $this->createPreviewOutputPage( $request );
		$out->expects( $this->once() )->method( 'addModuleStyles' )
			->with( [ 'skins.citizen.tokens.new' ] );

		$this->newSkinHooks()->onBeforePageDisplay( $out, $this->createCitizenSkinMock() );
	}

	public function testOnBeforePageDisplayExplicitUrlValueWritesCookie(): void {
		$this->overrideConfigValue( MainConfigNames::CookiePrefix, '' );
		$request = new FauxRequest( [ 'citizenpreview' => '0' ] );
		$out = $this->createPreviewOutputPage( $request );

		$this->newSkinHooks()->onBeforePageDisplay( $out, $this->createCitizenSkinMock() );

		$response = $request->response();
		$this->assertSame( '0', $response->getCookie( 'citizenpreview' ) );
		$cookie = $response->getCookieData( 'citizenpreview' );
		$this->assertGreaterThan( time(), $cookie['expire'] ?? 0 );
	}

	public function testOnBeforePageDisplayNonExplicitValueWritesNoCookie(): void {
		$request = new FauxRequest( [ 'citizenpreview' => 'banana' ] );
		$out = $this->createPreviewOutputPage( $request );

		$this->newSkinHooks()->onBeforePageDisplay( $out, $this->createCitizenSkinMock() );

		$this->assertSame( [], $request->response()->getCookies() );
	}

	public function testOnBeforePageDisplaySkipsNonCitizen(): void {
		$out = $this->createMock( OutputPage::class );
		$out->expects( $this->never() )->method( 'addModuleStyles' );
		$skin = $this->createMock( Skin::class );
		$skin->method( 'getSkinName' )->willReturn( 'vector' );

		$this->newSkinHooks()->onBeforePageDisplay( $out, $skin );
	}
}
