<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Components;

use MediaWiki\Skins\Citizen\Components\CitizenComponentLink;
use MediaWiki\Skins\Citizen\Components\CitizenComponentMenuListItem;
use MediaWikiUnitTestCase;
use PHPUnit\Framework\MockObject\MockObject;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentMenuListItem
 */
class CitizenComponentMenuListItemTest extends MediaWikiUnitTestCase {

	/**
	 * @covers ::__construct
	 * @covers ::getTemplateData
	 * @dataProvider provideMenuListItemData
	 */
	public function testGetTemplateData(
		string $class,
		string $id,
		string $expectedClass,
		string $expectedId
	): void {
		$menuItem = new CitizenComponentMenuListItem(
			$this->getMockLink(),
			$class,
			$id
		);

		$templateData = $menuItem->getTemplateData();

		$this->assertArrayHasKey( 'array-links', $templateData );
		$this->assertArrayHasKey( 'item-class', $templateData );
		$this->assertArrayHasKey( 'item-id', $templateData );
		$this->assertSame( $expectedClass, $templateData['item-class'] );
		$this->assertSame( $expectedId, $templateData['item-id'] );
		$this->assertSame( '/test', $templateData['array-links']['href'] );
		$this->assertSame( 'Test Link', $templateData['array-links']['text'] );
	}

	public static function provideMenuListItemData(): array {
		return [
			'minimal parameters' => [
				'',
				'',
				'',
				'',
			],
			'with class and id' => [
				'test-class',
				'test-id',
				'test-class',
				'test-id',
			],
		];
	}

	private function getMockLink(): CitizenComponentLink&MockObject {
		$mockLink = $this->createMock( CitizenComponentLink::class );
		$mockLink->expects( $this->once() )
			->method( 'getTemplateData' )
			->willReturn( [
				'href' => '/test',
				'text' => 'Test Link'
			] );

		return $mockLink;
	}
}
