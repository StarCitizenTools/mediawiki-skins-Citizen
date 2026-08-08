<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration;

use MediaWiki\Skins\Citizen\CompatSlices;
use MediaWiki\Skins\Citizen\ResourceLoader\CompatSkinModule;
use MediaWiki\Skins\Citizen\SkinCitizen;
use MediaWiki\Title\Title;
use MediaWikiIntegrationTestCase;
use RequestContext;
use Wikimedia\TestingAccessWrapper;

/**
 * @group Citizen
 * @covers \MediaWiki\Skins\Citizen\SkinCitizen
 */
class SkinCitizenTest extends MediaWikiIntegrationTestCase {

	protected function tearDown(): void {
		// Undoes primeSliceVersions() — the cache is static and outlives the test.
		TestingAccessWrapper::newFromClass( CompatSlices::class )->versionCache = [];

		parent::tearDown();
	}

	/**
	 * Fills CompatSlices' memoized directory scan for the real skin base path.
	 *
	 * The marker has to be exercised with slices present, and resources/compat/ is the
	 * live registry: a file dropped there would move the marker the skin really ships.
	 *
	 * @param string[] $versions
	 */
	private function primeSliceVersions( array $versions ): void {
		TestingAccessWrapper::newFromClass( CompatSlices::class )->versionCache = [
			CompatSlices::getBasePath() => $versions,
		];
	}

	private function createSkinInstance(): SkinCitizen {
		return new SkinCitizen(
			$this->getServiceContainer()->getUserFactory(),
			$this->getServiceContainer()->getGenderCache(),
			$this->getServiceContainer()->getUserIdentityLookup(),
			$this->getServiceContainer()->getLanguageConverterFactory(),
			$this->getServiceContainer()->getLanguageNameUtils(),
			$this->getServiceContainer()->getPermissionManager(),
			$this->getServiceContainer()->getUserGroupManager(),
			$this->getServiceContainer()->getUrlUtils(),
			$this->getServiceContainer()->getTempUserConfig(),
			$this->getServiceContainer()->getSpecialPageFactory(),
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
		$out = $skin->getOutput();
		$skin->initPage( $out );

		$this->assertContains(
			[ 'theme-color', '#ffaabb' ],
			$out->getMetaTags()
		);
	}

	public function testManifestLinkAddedWhenEnabled(): void {
		$this->overrideConfigValues( [
			'CitizenEnableManifest' => true,
		] );

		$skin = $this->createSkinInstance();
		$out = $skin->getOutput();
		$skin->initPage( $out );

		$expected = [
			'rel' => 'manifest',
			'href' => $this->getServiceContainer()->getUrlUtils()->expand(
				wfAppendQuery( wfScript( 'api' ), [ 'action' => 'appmanifest' ] ),
				PROTO_RELATIVE
			),
		];

		$this->assertContains( $expected, $out->getLinkTags() );
	}

	public function testManifestLinkNotAddedWhenDisabled(): void {
		$this->overrideConfigValues( [
			'CitizenEnableManifest' => false,
		] );

		$skin = $this->createSkinInstance();
		$out = $skin->getOutput();
		$skin->initPage( $out );

		$this->assertSame( [], $out->getLinkTags() );
	}

	public function testManifestLinkNotAddedOnPrivateWiki(): void {
		$this->overrideConfigValues( [
			'CitizenEnableManifest' => true,
			'GroupPermissions' => [ '*' => [ 'read' => false ] ],
		] );

		$skin = $this->createSkinInstance();
		$out = $skin->getOutput();
		$skin->initPage( $out );

		$this->assertSame( [], $out->getLinkTags() );
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

	public function testSetSkinThemeWithInvalidValueFallsBackToOs(): void {
		$this->overrideConfigValues( [
			'CitizenThemeDefault' => 'invalid-value',
		] );

		// A config value outside the clientpref charset falls back to the
		// built-in os default instead of leaving the page with no theme class.
		$skin = $this->createSkinInstance();
		$attrs = $skin->getHtmlElementAttributes();
		$this->assertStringContainsString( 'skin-theme-clientpref-os', $attrs['class'] );
	}

	public function testSetSkinThemeWithCustomValue(): void {
		$this->overrideConfigValues( [
			'CitizenThemeDefault' => 'black',
		] );

		$skin = $this->createSkinInstance();
		$attrs = $skin->getHtmlElementAttributes();

		$this->assertStringContainsString( 'skin-theme-clientpref-black', $attrs['class'] );
	}

	public function testHeaderPositionMobileDefault(): void {
		$skin = $this->createSkinInstance();

		$attrs = $skin->getHtmlElementAttributes();

		$this->assertStringContainsString( 'citizen-header-position-mobile-bottom', $attrs['class'] );
	}

	public function testHeaderPositionMobileTop(): void {
		$this->overrideConfigValues( [
			'CitizenHeaderPositionMobile' => 'top',
		] );
		$skin = $this->createSkinInstance();

		$attrs = $skin->getHtmlElementAttributes();

		$this->assertStringContainsString( 'citizen-header-position-mobile-top', $attrs['class'] );
	}

	public function testHeaderPositionMobileInvalidValue(): void {
		$this->overrideConfigValues( [
			'CitizenHeaderPositionMobile' => 'left',
		] );
		$skin = $this->createSkinInstance();

		$attrs = $skin->getHtmlElementAttributes();

		$this->assertStringContainsString( 'citizen-header-position-mobile-bottom', $attrs['class'] );
	}

	/**
	 * With no slices in resources/compat/, there is no HTML generation to mark —
	 * unmarked HTML always predates any compat gate.
	 *
	 * @covers \MediaWiki\Skins\Citizen\SkinCitizen::getHtmlElementAttributes
	 */
	public function testNoGenerationMarkerWithoutSlices(): void {
		if ( glob( CompatSlices::getBasePath() . '/resources/compat/*.less' ) ) {
			$this->markTestSkipped( 'compat slices are present, so a generation marker is expected' );
		}

		$skin = $this->createSkinInstance();

		$attrs = $skin->getHtmlElementAttributes();

		$this->assertArrayNotHasKey( CompatSlices::GENERATION_ATTRIBUTE, $attrs );
		$this->assertStringNotContainsString( 'citizen-html', $attrs['class'] );
	}

	/**
	 * Every slice version is listed, oldest first, in one attribute. A gate then names
	 * its own version — which lives in the same file as the gate — so expiring a slice
	 * cannot orphan one.
	 *
	 * @covers \MediaWiki\Skins\Citizen\SkinCitizen::getHtmlElementAttributes
	 * @covers \MediaWiki\Skins\Citizen\CompatSlices
	 */
	public function testGenerationMarkerListsEverySlice(): void {
		$this->primeSliceVersions( [ '3.15', '3.18', '3.22' ] );

		$attrs = $this->createSkinInstance()->getHtmlElementAttributes();

		// Spelled out, not read from the constant: gates in shipped slices are written
		// against this exact name, so renaming it is a breaking change, not a refactor.
		$this->assertSame( '3.15 3.18 3.22', $attrs['data-mw-citizen-html'] );
	}

	/**
	 * The stamp must never be gated on $wgCitizenCompat. Absence of the attribute is
	 * what tells a gate the HTML predates the framework; if a flag-off era produced
	 * unmarked HTML too, every gate would fire against those pages the moment an
	 * operator switched the flag on — which is exactly when they are reading it.
	 *
	 * @covers \MediaWiki\Skins\Citizen\SkinCitizen::getHtmlElementAttributes
	 */
	public function testGenerationMarkerIsStampedRegardlessOfCompatFlag(): void {
		$this->primeSliceVersions( [ '3.15', '3.18' ] );

		$markers = [];
		foreach ( [ false, true ] as $enabled ) {
			$this->overrideConfigValue( 'CitizenCompat', $enabled );
			$attrs = $this->createSkinInstance()->getHtmlElementAttributes();
			$markers[] = $attrs[CompatSlices::GENERATION_ATTRIBUTE] ?? null;
		}

		$this->assertSame( [ '3.15 3.18', '3.15 3.18' ], $markers );
	}

	/**
	 * The marker and the slices must be derived from one directory: a gate ships inside
	 * a slice the module serves and matches on the attribute the skin stamps. If the two
	 * base paths ever diverge, gates load with no marker to match (or the reverse) and
	 * every gate in the window breaks at once, silently.
	 *
	 * @covers \MediaWiki\Skins\Citizen\CompatSlices
	 * @covers \MediaWiki\Skins\Citizen\ResourceLoader\CompatSkinModule
	 */
	public function testMarkerBasePathMatchesTheModuleServingSlices(): void {
		$module = $this->getServiceContainer()->getResourceLoader()
			->getModule( 'skins.citizen.styles' );
		$this->assertInstanceOf( CompatSkinModule::class, $module );

		$moduleBasePath = TestingAccessWrapper::newFromObject( $module )->localBasePath;

		$this->assertSame(
			realpath( CompatSlices::getBasePath() ),
			realpath( $moduleBasePath ),
			'the marker is derived from a different directory than the one slices are served from'
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
