<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit\Components;

use MediaWiki\Config\HashConfig;
use MediaWiki\Skins\Citizen\Components\CitizenComponentTableOfContents;
use MediaWikiUnitTestCase;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentTableOfContents
 */
class CitizenComponentTableOfContentsTest extends MediaWikiUnitTestCase {

	private function createLocalizer(): \MessageLocalizer {
		$message = $this->createMock( \Message::class );
		$message->method( 'rawParams' )->willReturnSelf();
		$message->method( 'escaped' )->willReturn( 'Toggle Test subsection' );

		$localizer = $this->createMock( \MessageLocalizer::class );
		$localizer->method( 'msg' )->willReturn( $message );

		return $localizer;
	}

	private function createConfig( int $collapseAtCount = 28 ): HashConfig {
		return new HashConfig( [
			'CitizenTableOfContentsCollapseAtCount' => $collapseAtCount,
		] );
	}

	/**
	 * @covers ::__construct
	 * @covers ::getTemplateData
	 */
	public function testEmptySectionsReturnsEmptyArray(): void {
		$component = new CitizenComponentTableOfContents(
			[],
			$this->createLocalizer(),
			$this->createConfig()
		);

		$result = $component->getTemplateData();

		$this->assertSame( [], $result );
	}

	/**
	 * @covers ::__construct
	 * @covers ::getTemplateData
	 */
	public function testEmptyArraySectionsReturnsEmptyArray(): void {
		$component = new CitizenComponentTableOfContents(
			[ 'array-sections' => [] ],
			$this->createLocalizer(),
			$this->createConfig()
		);

		$result = $component->getTemplateData();

		$this->assertSame( [], $result );
	}

	/**
	 * @covers ::__construct
	 * @covers ::getTemplateData
	 */
	public function testTopLevelParentSectionGetsButtonLabel(): void {
		$tocData = [
			'array-sections' => [
				[
					'is-top-level-section' => true,
					'is-parent-section' => true,
					'line' => 'Test subsection',
				],
			],
			'number-section-count' => 1,
		];

		$component = new CitizenComponentTableOfContents(
			$tocData,
			$this->createLocalizer(),
			$this->createConfig()
		);

		$result = $component->getTemplateData();

		$this->assertArrayHasKey( 'citizen-button-label', $result['array-sections'][0] );
		$this->assertSame( 'Toggle Test subsection', $result['array-sections'][0]['citizen-button-label'] );
	}

	/**
	 * @covers ::__construct
	 * @covers ::getTemplateData
	 */
	public function testTopLevelNonParentSectionDoesNotGetButtonLabel(): void {
		$tocData = [
			'array-sections' => [
				[
					'is-top-level-section' => true,
					'is-parent-section' => false,
					'line' => 'Leaf section',
				],
			],
			'number-section-count' => 1,
		];

		$component = new CitizenComponentTableOfContents(
			$tocData,
			$this->createLocalizer(),
			$this->createConfig()
		);

		$result = $component->getTemplateData();

		$this->assertArrayNotHasKey( 'citizen-button-label', $result['array-sections'][0] );
	}

	/**
	 * @covers ::__construct
	 * @covers ::getTemplateData
	 */
	public function testNonTopLevelSectionDoesNotGetButtonLabel(): void {
		$tocData = [
			'array-sections' => [
				[
					'is-top-level-section' => true,
					'is-parent-section' => true,
					'line' => 'Parent',
					'array-sections' => [
						[
							'is-top-level-section' => false,
							'is-parent-section' => false,
							'line' => 'Child section',
						],
					],
				],
			],
			'number-section-count' => 2,
		];

		$component = new CitizenComponentTableOfContents(
			$tocData,
			$this->createLocalizer(),
			$this->createConfig()
		);

		$result = $component->getTemplateData();

		$childSection = $result['array-sections'][0]['array-sections'][0];
		$this->assertArrayNotHasKey( 'citizen-button-label', $childSection );
	}

	/**
	 * @covers ::__construct
	 * @covers ::getTemplateData
	 * @dataProvider provideCollapseScenarios
	 */
	public function testCollapseSectionsEnabled(
		int $topLevelCount,
		int $totalSectionCount,
		int $collapseAtCount,
		bool $expected,
		string $scenario
	): void {
		$sections = [];
		for ( $i = 0; $i < $topLevelCount; $i++ ) {
			$sections[] = [
				'is-top-level-section' => true,
				'is-parent-section' => false,
				'line' => "Section $i",
			];
		}

		$tocData = [
			'array-sections' => $sections,
			'number-section-count' => $totalSectionCount,
		];

		$component = new CitizenComponentTableOfContents(
			$tocData,
			$this->createLocalizer(),
			$this->createConfig( $collapseAtCount )
		);

		$result = $component->getTemplateData();

		$this->assertSame(
			$expected,
			$result['citizen-is-collapse-sections-enabled'],
			$scenario
		);
	}

	public static function provideCollapseScenarios(): iterable {
		yield 'many top-level and total above threshold' => [
			'topLevelCount' => 5,
			'totalSectionCount' => 30,
			'collapseAtCount' => 28,
			'expected' => true,
			'scenario' => 'Should collapse when top-level > 3 and total >= threshold',
		];

		yield 'few top-level sections even with total above threshold' => [
			'topLevelCount' => 2,
			'totalSectionCount' => 30,
			'collapseAtCount' => 28,
			'expected' => false,
			'scenario' => 'Should not collapse when top-level <= 3',
		];

		yield 'top-level above 3 but total below threshold' => [
			'topLevelCount' => 5,
			'totalSectionCount' => 10,
			'collapseAtCount' => 28,
			'expected' => false,
			'scenario' => 'Should not collapse when total < threshold',
		];

		yield 'exactly 3 top-level sections' => [
			'topLevelCount' => 3,
			'totalSectionCount' => 30,
			'collapseAtCount' => 28,
			'expected' => false,
			'scenario' => 'Should not collapse when top-level is exactly 3 (need > 3)',
		];
	}
}
