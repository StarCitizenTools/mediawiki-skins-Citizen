<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Components;

use MediaWiki\Skins\Citizen\Components\CitizenComponentUserInfo;
use MediaWiki\Title\Title;
use MediaWiki\User\UserIdentity;
use MediaWikiUnitTestCase;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentUserInfo
 */
class CitizenComponentUserInfoTest extends MediaWikiUnitTestCase {

	public function testGetTemplateData(): void {
		$isRegistered = true;
		$isTemp = false;
		$localizer = $this->createMock( MessageLocalizer::class );
		$localizer->expects( $this->any() )
			->method( 'msg' )
			->willReturn( 'mock message' );
		$title = $this->createMock( Title::class );
		$user = $this->createMock( UserIdentity::class );
		$user->expects( $this->any() )
			->method( 'getName' )
			->willReturn( 'mock user' );
		$userPageData = [
			'editcount' => 1
		];

		$component = new CitizenComponentUserInfo(
			$isRegistered,
			$isTemp,
			$localizer,
			$title,
			$user,
			$userPageData
		);
		$templateData = $component->getTemplateData();

		$this->assertSame( $userPageData['editcount'], $templateData['editcount'] );
		$this->assertSame( $user->getName(), $templateData['username'] );
		$this->assertSame( 'mock message', $templateData['title'] );
	}
}

