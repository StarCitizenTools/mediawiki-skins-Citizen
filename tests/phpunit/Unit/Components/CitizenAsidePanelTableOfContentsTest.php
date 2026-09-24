<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit\Components;

use MediaWiki\Config\HashConfig;
use MediaWiki\Skins\Citizen\Components\CitizenAsidePanel;
use MediaWiki\Skins\Citizen\Components\CitizenAsidePanelTableOfContents;
use MediaWikiUnitTestCase;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenAsidePanelTableOfContents
 */
class CitizenAsidePanelTableOfContentsTest extends MediaWikiUnitTestCase {

	private function createLocalizer(): \MessageLocalizer {
		$message = $this->createMock( \Message::class );
		$message->method( 'rawParams' )->willReturnSelf();
		$message->method( 'escaped' )->willReturn( 'Toggle Test subsection' );
		$message->method( 'text' )->willReturn( 'Contents' );

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
		$component = new CitizenAsidePanelTableOfContents(
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
		$component = new CitizenAsidePanelTableOfContents(
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

		$component = new CitizenAsidePanelTableOfContents(
			$tocData,
			$this->createLocalizer(),
			$this->createConfig()
		);

		$result = $component->getTemplateData()['data-toc'];

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

		$component = new CitizenAsidePanelTableOfContents(
			$tocData,
			$this->createLocalizer(),
			$this->createConfig()
		);

		$result = $component->getTemplateData()['data-toc'];

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

		$component = new CitizenAsidePanelTableOfContents(
			$tocData,
			$this->createLocalizer(),
			$this->createConfig()
		);

		$result = $component->getTemplateData()['data-toc'];

		$childSection = $result['array-sections'][0]['array-sections'][0];
		$this->assertArrayNotHasKey( 'citizen-button-label', $childSection );
	}

	/**
	 * @covers ::__construct
	 * @covers ::getTemplateData
	 */
	public function testMissingNumberSectionCountDefaultsToZero(): void {
		$tocData = [
			'array-sections' => [
				[
					'is-top-level-section' => true,
					'is-parent-section' => false,
					'line' => 'Section 1',
				],
				[
					'is-top-level-section' => true,
					'is-parent-section' => false,
					'line' => 'Section 2',
				],
				[
					'is-top-level-section' => true,
					'is-parent-section' => false,
					'line' => 'Section 3',
				],
				[
					'is-top-level-section' => true,
					'is-parent-section' => false,
					'line' => 'Section 4',
				],
			],
			// 'number-section-count' intentionally omitted
		];

		$component = new CitizenAsidePanelTableOfContents(
			$tocData,
			$this->createLocalizer(),
			$this->createConfig( 1 )
		);

		$result = $component->getTemplateData()['data-toc'];

		$this->assertFalse(
			$result['citizen-is-collapse-sections-enabled'],
			'Should not collapse when number-section-count is missing (defaults to 0)'
		);
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

		$component = new CitizenAsidePanelTableOfContents(
			$tocData,
			$this->createLocalizer(),
			$this->createConfig( $collapseAtCount )
		);

		$result = $component->getTemplateData()['data-toc'];

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

	/**
	 * @covers ::getId
	 * @covers ::getLabel
	 * @covers ::getIcon
	 * @covers ::getOrder
	 * @covers ::getPlacement
	 */
	public function testPanelDescription(): void {
		$component = new CitizenAsidePanelTableOfContents(
			[ 'array-sections' => [
				[ 'is-top-level-section' => true, 'is-parent-section' => false, 'line' => 'A' ],
			] ],
			$this->createLocalizer(),
			$this->createConfig()
		);

		$this->assertSame( 'toc', $component->getId() );
		$this->assertSame( 'Contents', $component->getLabel() );
		$this->assertSame( 'listBullet', $component->getIcon() );
		$this->assertSame( CitizenAsidePanel::PLACEMENT_STICKY, $component->getPlacement() );
		$this->assertIsInt( $component->getOrder() );
	}

	/**
	 * @covers ::hasContent
	 */
	public function testHasContentFollowsSections(): void {
		$empty = new CitizenAsidePanelTableOfContents(
			[ 'array-sections' => [] ],
			$this->createLocalizer(),
			$this->createConfig()
		);
		$this->assertFalse( $empty->hasContent() );

		$populated = new CitizenAsidePanelTableOfContents(
			[ 'array-sections' => [
				[ 'is-top-level-section' => true, 'is-parent-section' => false, 'line' => 'A' ],
			] ],
			$this->createLocalizer(),
			$this->createConfig()
		);
		$this->assertTrue( $populated->hasContent() );
	}

	/**
	 * @covers ::getTemplateData
	 */
	public function testTemplateDataIsNestedUnderDataToc(): void {
		$component = new CitizenAsidePanelTableOfContents(
			[ 'array-sections' => [
				[ 'is-top-level-section' => true, 'is-parent-section' => false, 'line' => 'A' ],
			] ],
			$this->createLocalizer(),
			$this->createConfig()
		);

		$data = $component->getTemplateData();

		$this->assertArrayHasKey( 'data-toc', $data );
		$this->assertArrayHasKey( 'array-sections', $data['data-toc'] );
		$this->assertArrayHasKey( 'citizen-is-collapse-sections-enabled', $data['data-toc'] );
	}
}
