<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit\Components;

use MediaWiki\Message\Message;
use MediaWiki\Skins\Citizen\Components\CitizenAsidePanel;
use MediaWiki\Skins\Citizen\Components\CitizenAsidePanelDeclared;
use MediaWikiUnitTestCase;
use MessageLocalizer;
use PHPUnit\Framework\MockObject\MockObject;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenAsidePanelDeclared
 */
class CitizenAsidePanelDeclaredTest extends MediaWikiUnitTestCase {

	/**
	 * Answers every message with its key in brackets, so a test can tell a
	 * resolved message from literal text.
	 *
	 * @return MessageLocalizer&MockObject
	 */
	private function getMockMessageLocalizer(): MessageLocalizer&MockObject {
		$mock = $this->createMock( MessageLocalizer::class );
		$mock->method( 'msg' )->willReturnCallback(
			function ( string $key ): Message {
				$message = $this->createMock( Message::class );
				$message->method( 'text' )->willReturn( "($key)" );
				return $message;
			}
		);
		return $mock;
	}

	/**
	 * @param array $panels The `panels` object of the declaration page
	 * @param string[] $loadedModules
	 * @return CitizenAsidePanelDeclared[]
	 */
	private function fromPanels( array $panels, array $loadedModules = [ 'ext.gadget.Notes' ] ): array {
		return CitizenAsidePanelDeclared::fromConfig(
			[ 'panels' => $panels ],
			$loadedModules,
			$this->getMockMessageLocalizer()
		);
	}

	/**
	 * @covers ::fromConfig
	 * @covers ::getId
	 * @covers ::getLabel
	 * @covers ::getModule
	 * @covers ::getPlacement
	 * @covers ::getOrder
	 * @covers ::getTemplateData
	 */
	public function testAFullDeclarationDescribesThePanel(): void {
		[ $panel ] = $this->fromPanels( [
			'mygadget-notes' => [
				'module' => 'ext.gadget.Notes',
				'labelMsg' => 'mygadget-notes-label',
				'placement' => 'sticky',
				'order' => 30,
			],
		] );

		$this->assertSame( 'mygadget-notes', $panel->getId() );
		$this->assertSame( '(mygadget-notes-label)', $panel->getLabel() );
		$this->assertSame( 'ext.gadget.Notes', $panel->getModule() );
		$this->assertSame( CitizenAsidePanel::PLACEMENT_STICKY, $panel->getPlacement() );
		$this->assertSame( 30, $panel->getOrder() );
		// The script fills the body; the server renders only the frame.
		$this->assertSame( [], $panel->getTemplateData() );
	}

	/**
	 * @covers ::fromConfig
	 * @covers ::getPlacement
	 * @covers ::getOrder
	 */
	public function testPlacementAndOrderDefaultLikeTheRegistry(): void {
		[ $panel ] = $this->fromPanels( [
			'mygadget-notes' => [ 'module' => 'ext.gadget.Notes', 'label' => 'Notes' ],
		] );

		$this->assertSame( CitizenAsidePanel::PLACEMENT_FLOW, $panel->getPlacement() );
		$this->assertSame( 100, $panel->getOrder() );
	}

	/**
	 * @covers ::getLabel
	 */
	public function testLiteralLabelIsUsedAsIs(): void {
		[ $panel ] = $this->fromPanels( [
			'mygadget-notes' => [ 'module' => 'ext.gadget.Notes', 'label' => 'Notes' ],
		] );

		$this->assertSame( 'Notes', $panel->getLabel() );
	}

	/**
	 * @covers ::getLabel
	 */
	public function testMessageKeyWinsOverLiteralLabel(): void {
		[ $panel ] = $this->fromPanels( [
			'mygadget-notes' => [
				'module' => 'ext.gadget.Notes',
				'labelMsg' => 'mygadget-notes-label',
				'label' => 'Notes',
			],
		] );

		$this->assertSame( '(mygadget-notes-label)', $panel->getLabel() );
	}

	/**
	 * @covers ::hasContent
	 */
	public function testHasContentOnlyWhenItsModuleIsLoaded(): void {
		$panels = $this->fromPanels( [
			'mygadget-notes' => [ 'module' => 'ext.gadget.Notes', 'label' => 'Notes' ],
			'mygadget-other' => [ 'module' => 'ext.gadget.Other', 'label' => 'Other' ],
		] );

		$this->assertTrue( $panels[0]->hasContent() );
		$this->assertFalse( $panels[1]->hasContent() );
	}

	public static function provideInvalidDeclarations(): iterable {
		$valid = [ 'module' => 'ext.gadget.Notes', 'label' => 'Notes' ];
		yield 'id with a capital' => [ [ 'MyGadget' => $valid ] ];
		yield 'id starting with a digit' => [ [ '1notes' => $valid ] ];
		yield 'numeric id' => [ [ 0 => $valid ] ];
		yield 'declaration is not an object' => [ [ 'mygadget-notes' => 'ext.gadget.Notes' ] ];
		yield 'no module' => [ [ 'mygadget-notes' => [ 'label' => 'Notes' ] ] ];
		yield 'empty module' => [ [ 'mygadget-notes' => [ 'module' => '', 'label' => 'Notes' ] ] ];
		yield 'no label' => [ [ 'mygadget-notes' => [ 'module' => 'ext.gadget.Notes' ] ] ];
		yield 'blank label' => [ [ 'mygadget-notes' => [ 'module' => 'ext.gadget.Notes', 'label' => '  ' ] ] ];
		yield 'unknown placement' => [ [ 'mygadget-notes' => $valid + [ 'placement' => 'pinned' ] ] ];
		yield 'non-integer order' => [ [ 'mygadget-notes' => $valid + [ 'order' => '30' ] ] ];
	}

	/**
	 * @covers ::fromConfig
	 * @dataProvider provideInvalidDeclarations
	 */
	public function testAnInvalidDeclarationIsSkipped( array $panels ): void {
		$this->assertSame( [], $this->fromPanels( $panels ) );
	}

	/**
	 * @covers ::fromConfig
	 */
	public function testAnInvalidDeclarationDoesNotSinkTheOthers(): void {
		$panels = $this->fromPanels( [
			'BadId' => [ 'module' => 'ext.gadget.Notes', 'label' => 'Notes' ],
			'mygadget-notes' => [ 'module' => 'ext.gadget.Notes', 'label' => 'Notes' ],
		] );

		$this->assertSame( [ 'mygadget-notes' ], array_map(
			static fn ( CitizenAsidePanel $panel ): string => $panel->getId(),
			$panels
		) );
	}

	public static function provideMalformedPages(): iterable {
		yield 'no panels key' => [ [] ];
		yield 'panels is not an object' => [ [ 'panels' => 'mygadget-notes' ] ];
	}

	/**
	 * @covers ::fromConfig
	 * @dataProvider provideMalformedPages
	 */
	public function testAMalformedPageDeclaresNothing( array $config ): void {
		$panels = CitizenAsidePanelDeclared::fromConfig(
			$config,
			[ 'ext.gadget.Notes' ],
			$this->getMockMessageLocalizer()
		);

		$this->assertSame( [], $panels );
	}
}
