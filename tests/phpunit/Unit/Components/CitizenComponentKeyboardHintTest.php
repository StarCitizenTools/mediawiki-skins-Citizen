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

	public function testGetTemplateData(): void {
		$expected = [
			'accesskey' => 'mock-accesskey',
			'label' => 'Mock aria label',
		];

		$component = new CitizenComponentKeyboardHint( 'mock-accesskey', 'Mock aria label' );
		$templateData = $component->getTemplateData();

		$this->assertSame( $expected, $templateData );
	}
}
