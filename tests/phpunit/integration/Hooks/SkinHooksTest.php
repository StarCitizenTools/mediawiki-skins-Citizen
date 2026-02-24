<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration\Hooks;

use MediaWiki\Output\OutputPage;
use MediaWiki\ResourceLoader\Context;
use MediaWiki\Skins\Citizen\Hooks\SkinHooks;
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
}
