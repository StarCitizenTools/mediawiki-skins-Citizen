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
	 * @covers ::getTemplateData
	 */
	public function getTemplateData() {
		// TODO: Add tests
		$this->expectNotToPerformAssertions();
	}
}

