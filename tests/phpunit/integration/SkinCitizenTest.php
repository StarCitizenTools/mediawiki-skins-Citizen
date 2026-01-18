<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Integration\Tests;

use Exception;
use MediaWiki\Skins\Citizen\SkinCitizen;
use MediaWiki\Title\Title;
use MediaWikiIntegrationTestCase;
use RequestContext;

/**
 * TODO: Fully test tagline logic
 * @group Citizen
 */
class SkinCitizenTest extends MediaWikiIntegrationTestCase {

	/**
	 * @return SkinCitizen
	 */
	private function createSkinInstance() {
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

	/**
	 * @covers \MediaWiki\Skins\Citizen\SkinCitizen
	 * @return void
	 */
	public function testConstructor() {
		$skin = $this->createSkinInstance();

		$this->assertInstanceOf( SkinCitizen::class, $skin );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\SkinCitizen
	 * @covers \MediaWiki\Skins\Citizen\SkinCitizen::buildSkinFeatures
	 * @covers \MediaWiki\Skins\Citizen\Partials\Metadata
	 * @covers \MediaWiki\Skins\Citizen\Partials\Theme
	 * @return void
	 * @throws Exception
	 */
	public function testBuildSkinFeatures() {
		$this->overrideConfigValues( [
			'CitizenThemeDefault' => 'dark',
			'CitizenThemeColor' => '#ffaabb',
			'CitizenEnableManifest' => true,
		] );

		$skin = $this->createSkinInstance();
		$title = Title::newFromText( 'TestTitle' );
		$skin->setRelevantTitle( $title );

		$out = $skin->getOutput();

		$this->assertContains( [ 'theme-color', '#ffaabb' ], $out->getMetaTags() );
		$this->assertContains( [
			'rel' => 'manifest',
			'href' => $this->getServiceContainer()->getUrlUtils()->expand( wfAppendQuery( wfScript( 'api' ),
				[ 'action' => 'appmanifest' ] ), PROTO_RELATIVE ),
			], $out->getLinkTags() );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\SkinCitizen
	 * @covers \MediaWiki\Skins\Citizen\SkinCitizen::buildSkinFeatures
	 * @covers \MediaWiki\Skins\Citizen\Partials\Metadata
	 * @covers \MediaWiki\Skins\Citizen\Partials\Theme
	 * @return void
	 * @throws Exception
	 */
	public function testBuildSkinFeaturesNotAddManifest() {
		$this->overrideConfigValues( [
			'CitizenEnableManifest' => false,
		] );

		$skin = $this->createSkinInstance();

		$this->assertSame( [], $skin->getOutput()->getLinkTags() );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\SkinCitizen
	 * @covers \MediaWiki\Skins\Citizen\SkinCitizen::buildSkinFeatures
	 * @return void
	 * @throws Exception
	 */
	public function testBuildSkinFeaturesEnableCjk() {
		$this->overrideConfigValues( [
			'CitizenEnableCJKFonts' => true,
		] );

		$skin = $this->createSkinInstance();

		$this->assertArrayHasKey( 'styles', $skin->getOptions() );
		$this->assertContains( 'skins.citizen.styles.fonts.cjk', $skin->getOptions()['styles'] );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\SkinCitizen
	 * @covers \MediaWiki\Skins\Citizen\SkinCitizen::buildSkinFeatures
	 * @return void
	 * @throws Exception
	 */
	public function testBuildSkinFeaturesEnableCollapsibleSections() {
		$title = Title::newFromText( 'BuildSkinFeaturesEnableCollapsibleSections' );
		RequestContext::resetMain();
		RequestContext::getMain()->setTitle( $title );

		$this->overrideConfigValues( [
			'CitizenEnableCollapsibleSections' => true,
		] );

		$skin = $this->createSkinInstance();

		$this->assertArrayHasKey( 'bodyClasses', $skin->getOptions() );
		$this->assertContains( 'citizen-sections-enabled', $skin->getOptions()['bodyClasses'] );
	}
}
