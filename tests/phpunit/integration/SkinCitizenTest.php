<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Integration\Tests;

use MediaWiki\Skins\Citizen\SkinCitizen;
use MediaWiki\Title\Title;
use MediaWikiIntegrationTestCase;
use RequestContext;

/**
 * @group Citizen
 * @covers \MediaWiki\Skins\Citizen\SkinCitizen
 */
class SkinCitizenTest extends MediaWikiIntegrationTestCase {

	private function createSkinInstance(): SkinCitizen {
		return new SkinCitizen(
			$this->getServiceContainer()->getUserFactory(),
			$this->getServiceContainer()->getGenderCache(),
			$this->getServiceContainer()->getUserIdentityLookup(),
			$this->getServiceContainer()->getLanguageConverterFactory(),
			$this->getServiceContainer()->getLanguageNameUtils(),
			$this->getServiceContainer()->getPermissionManager(),
			$this->getServiceContainer()->getExtensionRegistry(),
			$this->getServiceContainer()->getUserGroupManager(),
			$this->getServiceContainer()->getUrlUtils(),
			null,
			[
				'name' => 'Citizen',
			]
		);
	}

	public function testThemeColorMetaTag(): void {
		$this->overrideConfigValues( [
			'CitizenThemeColor' => '#ffaabb',
		] );

		$skin = $this->createSkinInstance();

		$this->assertContains(
			[ 'theme-color', '#ffaabb' ],
			$skin->getOutput()->getMetaTags()
		);
	}

	public function testManifestLinkAddedWhenEnabled(): void {
		$this->overrideConfigValues( [
			'CitizenEnableManifest' => true,
		] );

		$skin = $this->createSkinInstance();
		$expected = [
			'rel' => 'manifest',
			'href' => $this->getServiceContainer()->getUrlUtils()->expand(
				wfAppendQuery( wfScript( 'api' ), [ 'action' => 'appmanifest' ] ),
				PROTO_RELATIVE
			),
		];

		$this->assertContains( $expected, $skin->getOutput()->getLinkTags() );
	}

	public function testManifestLinkNotAddedWhenDisabled(): void {
		$this->overrideConfigValues( [
			'CitizenEnableManifest' => false,
		] );

		$skin = $this->createSkinInstance();

		$this->assertSame( [], $skin->getOutput()->getLinkTags() );
	}

	public function testManifestLinkNotAddedOnPrivateWiki(): void {
		$this->overrideConfigValues( [
			'CitizenEnableManifest' => true,
			'GroupPermissions' => [ '*' => [ 'read' => false ] ],
		] );

		$skin = $this->createSkinInstance();

		$this->assertSame( [], $skin->getOutput()->getLinkTags() );
	}

	public function testCjkFontModuleEnabled(): void {
		$this->overrideConfigValues( [
			'CitizenEnableCJKFonts' => true,
		] );

		$skin = $this->createSkinInstance();

		$this->assertContains(
			'skins.citizen.styles.fonts.cjk',
			$skin->getOptions()['styles']
		);
	}

	public function testArFontModuleEnabled(): void {
		$this->overrideConfigValues( [
			'CitizenEnableARFonts' => true,
		] );

		$skin = $this->createSkinInstance();

		$this->assertContains(
			'skins.citizen.styles.fonts.ar',
			$skin->getOptions()['styles']
		);
	}

	public function testCollapsibleSectionsBodyClass(): void {
		$title = Title::newFromText( 'CollapsibleSectionsTest' );
		RequestContext::resetMain();
		RequestContext::getMain()->setTitle( $title );

		$this->overrideConfigValues( [
			'CitizenEnableCollapsibleSections' => true,
		] );

		$skin = $this->createSkinInstance();

		$this->assertContains(
			'citizen-sections-enabled',
			$skin->getOptions()['bodyClasses']
		);
	}
}
