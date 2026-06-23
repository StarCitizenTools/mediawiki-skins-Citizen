<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit\Components;

use MediaWiki\Skins\Citizen\Components\CitizenComponentStickyHeader;
use MediaWikiUnitTestCase;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentStickyHeader
 */
class CitizenComponentStickyHeaderTest extends MediaWikiUnitTestCase {

	/**
	 * @covers ::__construct
	 * @covers ::getIconButtons
	 * @covers ::getTemplateData
	 * @dataProvider provideVisualEditorTabPosition
	 */
	public function testGetTemplateData(
		bool $veTabFirst,
		string $expectedFirstEditIcon,
		string $expectedSecondEditIcon
	): void {
		$header = new CitizenComponentStickyHeader( $veTabFirst );
		$data = $header->getTemplateData();

		$this->assertArrayHasKey( 'array-icon-buttons', $data );
		$buttons = $data['array-icon-buttons'];
		$this->assertCount( 9, $buttons, 'There should be 9 icon buttons' );

		// Verify button properties for the first button as a sample check
		$firstButton = $buttons[0];
		$this->assertSame( 'quiet', $this->getButtonProperty( $firstButton['class'], 'weight' ) );
		$this->assertSame( 'large', $this->getButtonProperty( $firstButton['class'], 'size' ) );
		$this->assertStringContainsString( 'cdx-button--icon-only', $firstButton['class'] );
		$this->assertContains( [ 'key' => 'tabindex', 'value' => '-1' ], $firstButton['array-attributes'] );

		// The read/view button comes first (after share) and targets the read view
		// tab, which (unlike the old #ca-subject) exists in MediaWiki output (#1586).
		$viewButton = $buttons[1];
		$this->assertSame( 'eye', $viewButton['icon'] );
		$this->assertContains(
			[ 'key' => 'data-mw-citizen-click-target', 'value' => '#ca-view > a' ],
			$viewButton['array-attributes']
		);

		// The subject button targets the (namespace-specific, unselected) associated
		// page tab, i.e. the "back to the article" link shown on talk pages.
		$subjectButton = $buttons[2];
		$this->assertSame( 'article', $subjectButton['icon'] );
		$this->assertContains(
			[ 'key' => 'data-mw-citizen-click-target', 'value' => "[id^='ca-nstab-']:not(.selected) > a" ],
			$subjectButton['array-attributes']
		);

		// Verify the order of edit icons
		$this->assertSame( $expectedFirstEditIcon, $buttons[4]['icon'] );
		$this->assertSame( $expectedSecondEditIcon, $buttons[5]['icon'] );
	}

	public static function provideVisualEditorTabPosition(): iterable {
		yield 'VE tab first' => [
			'veTabFirst' => true,
			'expectedFirstEditIcon' => 'wikimedia-edit',
			'expectedSecondEditIcon' => 'wikimedia-wikiText'
		];
		yield 'Wikitext tab first (default)' => [
			'veTabFirst' => false,
			'expectedFirstEditIcon' => 'wikimedia-wikiText',
			'expectedSecondEditIcon' => 'wikimedia-edit'
		];
	}

	/**
	 * Helper function to extract button property from class string.
	 * e.g., 'cdx-button--weight-quiet' -> 'quiet'
	 */
	private function getButtonProperty( string $class, string $property ): string {
		$matches = [];
		preg_match( "/cdx-button--{$property}-(\w+)/", $class, $matches );
		return $matches[1] ?? '';
	}
}
