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

	public function testGetTemplateData(): void {
		$localizer = $this->createMock( MessageLocalizer::class );
		$out = $this->createMock( OutputPage::class );
		$pageLang = $this->createNoopStub( Language::class );
		$title = $this->createMock( Title::class );
		$user = $this->createNoopStub( UserIdentity::class );

		$component = new CitizenComponentPageSidebar( $localizer, $out, $pageLang, $title, $user );
		$templateData = $component->getTemplateData();

		$this->assertSame( [ 'data-page-sidebar-lastmod' => [] ], $templateData );
	}
}
