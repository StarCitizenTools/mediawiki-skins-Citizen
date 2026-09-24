<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit\Components;

use MediaWiki\Skins\Citizen\Components\CitizenAsidePanel;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageAside;
use MediaWikiUnitTestCase;
use PHPUnit\Framework\MockObject\MockObject;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentPageAside
 */
class CitizenComponentPageAsideTest extends MediaWikiUnitTestCase {

	/**
	 * @return CitizenAsidePanel&MockObject
	 */
	private function panel(
		string $id,
		int $order,
		bool $hasContent,
		array $data = [],
		string $placement = CitizenAsidePanel::PLACEMENT_FLOW
	): CitizenAsidePanel&MockObject {
		$mock = $this->createMock( CitizenAsidePanel::class );
		$mock->method( 'getId' )->willReturn( $id );
		$mock->method( 'getLabel' )->willReturn( ucfirst( $id ) );
		$mock->method( 'getIcon' )->willReturn( 'article' );
		$mock->method( 'getOrder' )->willReturn( $order );
		$mock->method( 'hasContent' )->willReturn( $hasContent );
		$mock->method( 'getPlacement' )->willReturn( $placement );
		$mock->method( 'getTemplateData' )->willReturn( $hasContent ? $data : [] );
		return $mock;
	}

	/**
	 * @covers ::getTemplateData
	 */
	public function testPanelsAreSplitByPlacementAndSortedByOrder(): void {
		$component = new CitizenComponentPageAside( [
			$this->panel(
				'toc',
				20,
				true,
				[ 'data-toc' => [ 'array-sections' => [] ] ],
				CitizenAsidePanel::PLACEMENT_STICKY
			),
			$this->panel( 'notes', 30, true, [ 'href' => 'n' ] ),
			$this->panel( 'lastmod', 10, true, [ 'href' => 'mock-url' ] ),
		] );

		$data = $component->getTemplateData();

		$this->assertSame( [ 'lastmod', 'notes' ], array_column( $data['array-flow-panels'], 'panel-id' ) );
		$this->assertSame( [ 'toc' ], array_column( $data['array-sticky-panels'], 'panel-id' ) );
		$this->assertTrue( $data['has-sticky-panels'] );
		$this->assertTrue( array_is_list( $data['array-flow-panels'] ) );
		$this->assertTrue( array_is_list( $data['array-sticky-panels'] ) );

		$lastmod = $data['array-flow-panels'][0];
		$this->assertSame( 'Lastmod', $lastmod['panel-label'] );
		$this->assertSame( 10, $lastmod['panel-order'] );
		$this->assertSame( CitizenAsidePanel::PLACEMENT_FLOW, $lastmod['panel-placement'] );
		$this->assertTrue( $lastmod['is-lastmod'] );
		$this->assertSame( [ 'href' => 'mock-url' ], $lastmod['body'] );
	}

	/**
	 * @covers ::getTemplateData
	 */
	public function testEmptyPanelsAreDropped(): void {
		$component = new CitizenComponentPageAside( [
			$this->panel( 'lastmod', 10, false ),
			$this->panel(
				'toc',
				20,
				true,
				[ 'data-toc' => [ 'array-sections' => [] ] ],
				CitizenAsidePanel::PLACEMENT_STICKY
			),
		] );

		$data = $component->getTemplateData();

		$this->assertSame( [], $data['array-flow-panels'] );
		$this->assertSame( [ 'toc' ], array_column( $data['array-sticky-panels'], 'panel-id' ) );
	}

	/**
	 * @covers ::getTemplateData
	 */
	public function testNoPanelsYieldsEmptyZones(): void {
		$expected = [ 'array-flow-panels' => [], 'array-sticky-panels' => [], 'has-sticky-panels' => false ];

		$this->assertSame( $expected, ( new CitizenComponentPageAside( [] ) )->getTemplateData() );
		$this->assertSame(
			$expected,
			( new CitizenComponentPageAside( [ $this->panel( 'toc', 20, false ) ] ) )->getTemplateData()
		);
	}

	/**
	 * @covers ::getTemplateData
	 */
	public function testPanelDataIsNestedUnderBody(): void {
		// A panel returning the container's own key names cannot disturb
		// them: its data lives under `body`, beside the container's keys, not
		// merged into them.
		$component = new CitizenComponentPageAside( [
			$this->panel( 'lastmod', 10, true, [
				'href' => 'mock-url',
				'panel-id' => 'from-panel',
				'panel-label' => 'from-panel',
				'panel-order' => 99,
				'panel-placement' => CitizenAsidePanel::PLACEMENT_STICKY,
				'is-lastmod' => false,
			] ),
		] );

		$panel = $component->getTemplateData()['array-flow-panels'][0];

		$this->assertSame( 'lastmod', $panel['panel-id'] );
		$this->assertSame( 'Lastmod', $panel['panel-label'] );
		$this->assertSame( 10, $panel['panel-order'] );
		$this->assertSame( CitizenAsidePanel::PLACEMENT_FLOW, $panel['panel-placement'] );
		$this->assertTrue( $panel['is-lastmod'] );

		$this->assertSame( 'mock-url', $panel['body']['href'] );
		$this->assertSame( 'from-panel', $panel['body']['panel-label'] );
		$this->assertSame( 99, $panel['body']['panel-order'] );
		$this->assertSame( 'from-panel', $panel['body']['panel-id'] );
		$this->assertFalse( $panel['body']['is-lastmod'] );
		$this->assertArrayNotHasKey( 'href', $panel );
	}
}
