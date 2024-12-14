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
		// TODO: Add test
	}
}

