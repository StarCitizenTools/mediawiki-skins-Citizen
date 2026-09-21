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
	 * Both messages the panel reads are answered through ->text(): the panel
	 * label, and `lastmodifiedat` with the date and time as parameters.
	 *
	 * @return MessageLocalizer&MockObject
	 */
	private function getMockMessageLocalizer(): MessageLocalizer&MockObject {
		$mock = $this->createMock( MessageLocalizer::class );
		$mock->method( 'msg' )->willReturnCallback(
			function ( string $key, ...$params ): Message {
				$message = $this->createMock( Message::class );
				$message->method( 'text' )->willReturn(
					$key === 'lastmodifiedat'
						? "This page was last edited on $params[0], at $params[1]."
						: 'Last modified'
				);
				return $message;
			}
		);
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
			// Core's pre-parsed sentence as a lagged replica serves it: HTML,
			// with the replica notice appended.
			'text' => ' This page was last edited on March 15, 2024, at 10:00. <strong>'
				. '<strong>Warning:</strong> Page may not contain recent updates.</strong>',
			'date' => 'March 15, 2024',
			'time' => '10:00',
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
		$component = $this->newComponent( [ 'timestamp' => null, 'text' => '', 'date' => null, 'time' => null ] );

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
		// A tooltip shows markup literally, so the title is built from the date
		// and time fields, never from core's HTML sentence.
		$this->assertStringNotContainsString( '<', $data['title'] );
		// Flat and complete: the chrome partial owns id, class and label, and
		// the template reads nothing but these five keys.
		$this->assertSame( [
			'href' => 'mock-url',
			'title' => 'This page was last edited on March 15, 2024, at 10:00.',
			'datetime' => '2024-03-15T10:00:00Z',
			'date' => 'March 15, 2024',
			'icon' => 'history',
		], $data );
	}
}
