<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Components;

use Config;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageTools;
use MediaWikiUnitTestCase;
use MessageLocalizer;
use Title;
use UserIdentity;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentPageTools
 */
class CitizenComponentPageToolsTest extends MediaWikiUnitTestCase {

	/**
	 * @dataProvider provideGetArticleToolsDataData
	 * @covers ::getArticleToolsData
	 */
	public function testGetArticleToolsData( $input, $expected ) {
		$component = new CitizenComponentPageTools(
			$this->createNoopStub( Config::class ),
			$this->createNoopStub( MessageLocalizer::class ),
			$this->createNoopStub( Title::class ),
			$this->createNoopStub( UserIdentity::class ),
			0,
			$input,
			[],
			[]
		);

		$output = $component->getArticleToolsData();

		$this->assertSame( $expected, $output );
	}

	public function provideGetArticleToolsDataData(): array {
		return [
			// Empty sidebar data
			[
				[],
				[
					'is-empty' => true,
				],
			],
			// Sidebar data with non-toolbox items
			[
				[
					'foo' => [],
					'bar' => [],
				],
				[
					'is-empty' => true,
				],
			],
			// Sidebar data with toolbox items
			[
				[
					'array-portlets-rest' => [
						[
							'id' => 'p-tb',
							'item1' => [],
							'item2' => [],
							'item3' => [],
						]
					]
				],
				[
					'id' => 'p-tb',
					'item1' => [],
					'item2' => [],
					'item3' => [],
					'is-empty' => false,
				],
			],
		];
	}
}

