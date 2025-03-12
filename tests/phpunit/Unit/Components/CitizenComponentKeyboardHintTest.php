<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Components;

use MediaWiki\Skins\Citizen\Components\CitizenComponentKeyboardHint;
use MediaWikiUnitTestCase;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentKeyboardHint
 */
class CitizenComponentKeyboardHintTest extends MediaWikiUnitTestCase {

	/**
	 * @covers ::__construct
	 * @covers ::getTemplateData
	 */
	public function testGetTemplateData(): void {
		$expected = [
			'label' => 'Mock aria label',
			'key' => 'mock-key'
		];

		$component = new CitizenComponentKeyboardHint( 'Mock aria label', 'mock-key' );
		$this->assertSame( $expected, $component->getTemplateData() );
	}
}
