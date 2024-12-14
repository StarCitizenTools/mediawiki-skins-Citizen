<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Components;

use MediaWiki\Skins\Citizen\Components\CitizenComponentPageSidebar;
use MediaWikiUnitTestCase;
use MessageLocalizer;
use OutputPage;
use Title;
use UserIdentity;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentPageSidebar
 */
class CitizenComponentPageSidebarTest extends MediaWikiUnitTestCase {

	/**
	 * @covers ::getTemplateData
	 */
	public function testGetTemplateData(): void {
		// TODO: Add tests
		$this->expectNotToPerformAssertions();
	}
}
