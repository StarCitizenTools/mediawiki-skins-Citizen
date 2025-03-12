<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit\Components;

use MediaWiki\Skins\Citizen\Components\CitizenComponentLink;
use MediaWikiUnitTestCase;
use Message;
use MessageLocalizer;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentLink
 */
class CitizenComponentLinkTest extends MediaWikiUnitTestCase {

	/**
	 * @covers ::__construct
	 * @covers ::getTemplateData
	 */
	public function testGetTemplateData() {
		$href = '/mock-link';
		$text = 'Mock Text';
		$icon = 'mock-icon';
		$accessKeyHint = 'sample-accesskey';

		$localizer = $this->createMock( MessageLocalizer::class );
		// Adjusting mock to prevent calling the service container.
		$localizer->method( 'msg' )
			->willReturnCallback( function ( $key ) use ( $accessKeyHint ) {
				// Directly create Message object without accessing real message texts
				// to avoid 'Premature access to service container' error.
				return $this->createConfiguredMock( Message::class, [
					'exists' => true,
					'text' => $key === $accessKeyHint . '-label' ? 'Mock aria label' : $key,
					'__toString' => 'Mock aria label',
				] );
			} );

		// Create the component
		$linkComponent = new CitizenComponentLink( $href, $text, $icon, $localizer, $accessKeyHint );
		$actual = $linkComponent->getTemplateData();

		// Assert the expected values
		$this->assertEquals( $icon, $actual['icon'] );
		$this->assertEquals( $text, $actual['text'] );
		$this->assertEquals( $href, $actual['href'] );

		// New assertions for HTML attributes
		$expectedTitle = "tooltip-sample-accesskeyword-separatorbrackets";
		$expectedAriaLabel = "Mock aria label";
		$attributesString = $actual['html-attributes'];

		// Assert that the expected attributes are present in the string
		$this->assertStringContainsString( 'title="' . $expectedTitle . '"', $attributesString );
		$this->assertStringContainsString( 'aria-label="' . $expectedAriaLabel . '"', $attributesString );
	}
}
