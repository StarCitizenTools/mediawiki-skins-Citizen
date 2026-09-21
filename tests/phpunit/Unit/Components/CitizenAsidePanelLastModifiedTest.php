<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit\Components;

use MediaWiki\Message\Message;
use MediaWiki\Skins\Citizen\Components\CitizenAsidePanel;
use MediaWiki\Skins\Citizen\Components\CitizenAsidePanelLastModified;
use MediaWiki\Title\Title;
use MediaWikiUnitTestCase;
use MessageLocalizer;
use PHPUnit\Framework\MockObject\MockObject;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenAsidePanelLastModified
 */
class CitizenAsidePanelLastModifiedTest extends MediaWikiUnitTestCase {

	/**
	 * @return Title&MockObject
	 */
	private function getMockTitle(): Title&MockObject {
		$mock = $this->createMock( Title::class );
		$mock->method( 'getLocalURL' )->willReturn( 'mock-url' );
		return $mock;
	}

	/**
	 * getLabel() calls ->text() on the Message, so msg() has to return a
	 * Message, not a string. The deleted PageSidebar test could return a
	 * string only because that component passed the Message through untouched.
	 *
	 * @return MessageLocalizer&MockObject
	 */
	private function getMockMessageLocalizer(): MessageLocalizer&MockObject {
		$message = $this->createMock( Message::class );
		$message->method( 'text' )->willReturn( 'Last modified' );

		$mock = $this->createMock( MessageLocalizer::class );
		$mock->method( 'msg' )->willReturn( $message );
		return $mock;
	}

	private function newComponent( array $lastModifiedData ): CitizenAsidePanelLastModified {
		return new CitizenAsidePanelLastModified(
			$this->getMockMessageLocalizer(),
			$this->getMockTitle(),
			$lastModifiedData
		);
	}

	private function populatedData(): array {
		return [
			'timestamp' => '20240315100000',
			'text' => 'Last modified text',
			'date' => 'March 15, 2024',
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
		$component = $this->newComponent( $this->populatedData() );

		$this->assertSame( 'lastmod', $component->getId() );
		$this->assertSame( 'Last modified', $component->getLabel() );
		$this->assertSame( 'history', $component->getIcon() );
		$this->assertSame( CitizenAsidePanel::PLACEMENT_FLOW, $component->getPlacement() );
		$this->assertIsInt( $component->getOrder() );
	}

	/**
	 * @covers ::hasContent
	 */
	public function testHasContentIsFalseWithoutTimestamp(): void {
		$component = $this->newComponent( [ 'timestamp' => null, 'text' => '', 'date' => '' ] );

		$this->assertFalse( $component->hasContent() );
		$this->assertSame( [], $component->getTemplateData() );
	}

	/**
	 * @covers ::hasContent
	 * @covers ::getTemplateData
	 */
	public function testGetTemplateData(): void {
		$component = $this->newComponent( $this->populatedData() );

		$this->assertTrue( $component->hasContent() );

		$data = $component->getTemplateData();

		$this->assertSame( 'citizen-sidebar-lastmod', $data['id'] );
		$this->assertSame( 'Last modified', $data['label'] );
		$this->assertStringContainsString( 'citizen-page-aside__panel', $data['class'] );
		$this->assertStringContainsString( 'citizen-page-aside__panel--lastmod', $data['class'] );

		$items = $data['array-list-items'];
		$this->assertSame( 'lm-time', $items['item-id'] );
		$this->assertSame( 'mw-list-item', $items['item-class'] );

		$links = $items['array-links'];
		$this->assertSame( 'history', $links['icon'] );
		$this->assertSame( 'March 15, 2024', $links['text'] );

		$this->assertContainsEquals(
			[ 'key' => 'id', 'value' => 'citizen-lastmod-relative' ],
			$links['array-attributes']
		);
		$this->assertContainsEquals(
			[ 'key' => 'href', 'value' => 'mock-url' ],
			$links['array-attributes']
		);
		$this->assertContainsEquals(
			[ 'key' => 'title', 'value' => 'Last modified text' ],
			$links['array-attributes']
		);

		$foundTimestamp = false;
		foreach ( $links['array-attributes'] as $attribute ) {
			if ( $attribute['key'] === 'data-timestamp' ) {
				$foundTimestamp = true;
				$this->assertMatchesRegularExpression( '/^[0-9]+$/', $attribute['value'] );
			}
		}
		$this->assertTrue( $foundTimestamp, 'data-timestamp attribute not found' );

		// Menu defaults are filled in by CitizenComponentMenu, not here.
		$this->assertArrayNotHasKey( 'html-tooltip', $data );
		$this->assertArrayNotHasKey( 'html-before-portal', $data );
		$this->assertArrayNotHasKey( 'html-after-portal', $data );
		$this->assertArrayNotHasKey( 'label-class', $data );
	}
}
