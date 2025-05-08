<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Components;

use MediaWiki\Skins\Citizen\Components\CitizenComponentPageSidebar;
use MediaWiki\Title\Title;
use MediaWikiUnitTestCase;
use MessageLocalizer;
use PHPUnit\Framework\MockObject\MockObject;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentPageSidebar
 */
class CitizenComponentPageSidebarTest extends MediaWikiUnitTestCase {

	/**
	 * @return Title&MockObject
	 */
	private function getMockTitle(): Title&MockObject {
		$mock = $this->createMock( Title::class );
		$mock->method( 'getLocalURL' )->willReturn( 'mock-url' );
		return $mock;
	}

	/**
	 * @return MessageLocalizer&MockObject
	 */
	private function getMockMessageLocalizer(): MessageLocalizer&MockObject {
		$mock = $this->createMock( MessageLocalizer::class );
		$mock->method( 'msg' )->willReturnCallback( static fn ( string $key ) => $key . '-mocked' );
		return $mock;
	}

	/**
	 * @covers ::__construct
	 * @covers ::getTemplateData
	 * @covers ::getLastModData
	 */
	public function testGetTemplateData(): void {
		$localizer = $this->getMockMessageLocalizer();
		$title = $this->getMockTitle();
		$lastModifiedData = [
			'timestamp' => '20240315100000',
			'text' => 'Last modified text',
			'date' => 'March 15, 2024',
		];

		$component = new CitizenComponentPageSidebar(
			$localizer,
			$title,
			$lastModifiedData
		);

		$templateData = $component->getTemplateData();

		$this->assertArrayHasKey( 'data-page-sidebar-lastmod', $templateData );
		$lastModData = $templateData['data-page-sidebar-lastmod'];

		$this->assertArrayHasKey( 'id', $lastModData );
		$this->assertSame( 'citizen-sidebar-lastmod', $lastModData['id'] );

		$this->assertArrayHasKey( 'label', $lastModData );
		$this->assertSame( 'citizen-page-info-lastmod-mocked', $lastModData['label'] );

		$this->assertArrayHasKey( 'array-list-items', $lastModData );
		$items = $lastModData['array-list-items'];

		$this->assertArrayHasKey( 'item-id', $items );
		$this->assertSame( 'lm-time', $items['item-id'] );

		$this->assertArrayHasKey( 'item-class', $items );
		$this->assertSame( 'mw-list-item', $items['item-class'] );

		$this->assertArrayHasKey( 'array-links', $items );
		$links = $items['array-links'];

		$this->assertArrayHasKey( 'icon', $links );
		$this->assertSame( 'history', $links['icon'] );

		$this->assertArrayHasKey( 'text', $links );
		$this->assertSame( 'March 15, 2024', $links['text'] );

		$this->assertArrayHasKey( 'array-attributes', $links );
		$attributes = $links['array-attributes'];

		$expectedAttributes = [
			[ 'key' => 'id', 'value' => 'citizen-lastmod-relative' ],
			[ 'key' => 'href', 'value' => 'mock-url' ],
			[ 'key' => 'title', 'value' => 'Last modified text' ],
		];

		$this->assertContainsEquals( $expectedAttributes[0], $attributes );
		$this->assertContainsEquals( $expectedAttributes[1], $attributes );
		$this->assertContainsEquals( $expectedAttributes[2], $attributes );

		$foundTimestampAttribute = false;
		foreach ( $attributes as $attribute ) {
			if ( $attribute['key'] === 'data-timestamp' ) {
				$foundTimestampAttribute = true;
				$this->assertIsString( $attribute['value'] );
				$this->assertMatchesRegularExpression( '/^[0-9]+$/', $attribute['value'] );
				break;
			}
		}
		$this->assertTrue( $foundTimestampAttribute, 'data-timestamp attribute not found' );
	}
}
