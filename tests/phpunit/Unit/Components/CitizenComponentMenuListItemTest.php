<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Components;

use MediaWiki\Skins\Citizen\Components\CitizenComponentMenuListItem;
use MediaWikiUnitTestCase;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentMenuListItem
 */
class CitizenComponentMenuListItemTest extends MediaWikiUnitTestCase {

	public function testGetTemplateData(): void {
		$expected = [
			'array-links' => [
				'accesskey' => 'mock-accesskey',
				'label' => 'Mock aria label',
				'href' => 'mock-href',
				'text' => 'Mock text',
				'extra-data' => 'Mock extra data',
			],
			'item-class' => 'mock-class',
			'item-id' => 'mock-id',
		];

		$component = new CitizenComponentMenuListItem(
			$this->createMock( CitizenComponentLink::class ),
			'mock-class',
			'mock-id'
		);
		$templateData = $component->getTemplateData();

		$this->assertSame( $expected, $templateData );
	}
}
