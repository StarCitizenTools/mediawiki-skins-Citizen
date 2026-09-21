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
	public function testPanelsAreSortedByOrder(): void {
		$component = new CitizenComponentPageAside( [
			$this->panel(
				'toc',
				20,
				true,
				[ 'data-toc' => [ 'array-sections' => [] ] ],
				CitizenAsidePanel::PLACEMENT_PINNED
			),
			$this->panel( 'lastmod', 10, true, [ 'href' => 'mock-url' ] ),
		] );

		$panels = $component->getTemplateData()['array-panels'];

		$this->assertCount( 2, $panels );
		$this->assertSame( 'lastmod', $panels[0]['panel-id'] );
		$this->assertSame( 'toc', $panels[1]['panel-id'] );

		// The chrome partial renders the heading from this; the panel no
		// longer carries its own label.
		$this->assertSame( 'Lastmod', $panels[0]['panel-label'] );
		$this->assertSame( 'Toc', $panels[1]['panel-label'] );

		// PageAside.mustache dispatches on these; without them every panel
		// section is falsy and the aside renders empty.
		$this->assertTrue( $panels[0]['is-lastmod'] );
		$this->assertTrue( $panels[1]['is-toc'] );

		$this->assertSame( CitizenAsidePanel::PLACEMENT_FLOW, $panels[0]['panel-placement'] );
		$this->assertSame( CitizenAsidePanel::PLACEMENT_PINNED, $panels[1]['panel-placement'] );

		// The panel's own data is what its partial renders from, unchanged.
		$this->assertSame( [ 'href' => 'mock-url' ], $panels[0]['body'] );
		$this->assertSame( [ 'data-toc' => [ 'array-sections' => [] ] ], $panels[1]['body'] );
	}

	/**
	 * @covers ::getTemplateData
	 */
	public function testEmptyPanelsAreDropped(): void {
		// The dropped panel is the first one, so the survivor's key only lands
		// at 0 because usort reindexes what array_filter key-preserves — the
		// list-ness Mustache needs to iterate at all.
		$component = new CitizenComponentPageAside( [
			$this->panel( 'lastmod', 10, false ),
			$this->panel( 'toc', 20, true, [ 'data-toc' => [ 'array-sections' => [] ] ] ),
		] );

		$panels = $component->getTemplateData()['array-panels'];

		$this->assertCount( 1, $panels );
		$this->assertTrue( array_is_list( $panels ) );
		$this->assertSame( 'toc', $panels[0]['panel-id'] );
	}

	/**
	 * @covers ::getTemplateData
	 */
	public function testNoPanelsYieldsEmptyList(): void {
		$this->assertSame( [], ( new CitizenComponentPageAside( [] ) )->getTemplateData()['array-panels'] );

		$component = new CitizenComponentPageAside( [ $this->panel( 'toc', 20, false ) ] );
		$this->assertSame( [], $component->getTemplateData()['array-panels'] );
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
				'panel-placement' => CitizenAsidePanel::PLACEMENT_PINNED,
				'is-lastmod' => false,
			] ),
		] );

		$panel = $component->getTemplateData()['array-panels'][0];

		$this->assertSame( 'lastmod', $panel['panel-id'] );
		$this->assertSame( 'Lastmod', $panel['panel-label'] );
		$this->assertSame( CitizenAsidePanel::PLACEMENT_FLOW, $panel['panel-placement'] );
		$this->assertTrue( $panel['is-lastmod'] );

		$this->assertSame( 'mock-url', $panel['body']['href'] );
		$this->assertSame( 'from-panel', $panel['body']['panel-label'] );
		$this->assertSame( 'from-panel', $panel['body']['panel-id'] );
		$this->assertFalse( $panel['body']['is-lastmod'] );
		$this->assertArrayNotHasKey( 'href', $panel );
	}
}
