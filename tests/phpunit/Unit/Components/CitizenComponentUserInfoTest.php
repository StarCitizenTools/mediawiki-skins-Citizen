<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit\Components;

use MediaWiki\Language\Language;
use MediaWiki\Skins\Citizen\Components\CitizenComponentUserInfo;
use MediaWiki\Title\Title;
use MediaWiki\User\User;
use MediaWiki\User\UserGroupManager;
use MediaWikiUnitTestCase;
use Message;
use MessageLocalizer;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentUserInfo
 */
class CitizenComponentUserInfoTest extends MediaWikiUnitTestCase {

	private function createMockLocalizer(): MessageLocalizer {
		$msg = $this->createMock( Message::class );
		$msg->method( 'text' )->willReturn( 'mocked-text' );

		$localizer = $this->createMock( MessageLocalizer::class );
		$localizer->method( 'msg' )->willReturn( $msg );

		return $localizer;
	}

	private function createMockUser( string $username, string $realname ): User {
		$user = $this->createMock( User::class );
		$user->method( 'getName' )->willReturn( $username );
		$user->method( 'getRealName' )->willReturn( $realname );
		$user->method( 'isRegistered' )->willReturn( true );
		$user->method( 'isTemp' )->willReturn( false );
		$user->method( 'getEditCount' )->willReturn( 42 );
		$user->method( 'getRegistration' )->willReturn( null );

		return $user;
	}

	/**
	 * @covers ::getTemplateData
	 */
	public function testGetTemplateDataWithHtmlEntityUsername(): void {
		$username = "O'Brien";
		$realname = 'Miles Edward';

		$user = $this->createMockUser( $username, $realname );
		$userGroupManager = $this->createMock( UserGroupManager::class );
		$userGroupManager->method( 'getUserGroups' )->willReturn( [] );

		$lang = $this->createMock( Language::class );
		$localizer = $this->createMockLocalizer();
		$title = $this->createMock( Title::class );

		// Simulate MediaWiki's HTML output where O'Brien becomes O&#039;Brien
		$encodedUsername = htmlspecialchars( $username, ENT_QUOTES );
		$htmlItems = '<li id="pt-userpage"><a href="/wiki/User:'
			. $encodedUsername . '">' . $encodedUsername . '</a></li>';

		$userPageData = [
			'html-items' => $htmlItems,
		];

		$component = new CitizenComponentUserInfo(
			$userGroupManager,
			$lang,
			$localizer,
			$title,
			$user,
			$userPageData
		);

		$data = $component->getTemplateData();

		$resultHtml = $data['data-user-page']['html-items'];

		$this->assertStringContainsString( 'pt-userpage-realname', $resultHtml );
		$this->assertStringContainsString( 'pt-userpage-username', $resultHtml );
		$this->assertStringContainsString( $realname, $resultHtml );
		$this->assertStringContainsString( $username, $resultHtml );
	}

	/**
	 * @covers ::getTemplateData
	 */
	public function testGetTemplateDataWithNoRealName(): void {
		$username = "O'Brien";

		$user = $this->createMockUser( $username, '' );
		$userGroupManager = $this->createMock( UserGroupManager::class );
		$userGroupManager->method( 'getUserGroups' )->willReturn( [] );

		$lang = $this->createMock( Language::class );
		$localizer = $this->createMockLocalizer();
		$title = $this->createMock( Title::class );

		$encodedUsername = htmlspecialchars( $username, ENT_QUOTES );
		$htmlItems = '<li id="pt-userpage"><a href="/wiki/User:'
			. $encodedUsername . '">' . $encodedUsername . '</a></li>';

		$userPageData = [
			'html-items' => $htmlItems,
		];

		$component = new CitizenComponentUserInfo(
			$userGroupManager,
			$lang,
			$localizer,
			$title,
			$user,
			$userPageData
		);

		$data = $component->getTemplateData();

		$resultHtml = $data['data-user-page']['html-items'];

		// HTML should stay unchanged — no realname/username spans injected
		$this->assertStringNotContainsString( 'pt-userpage-realname', $resultHtml );
		$this->assertStringNotContainsString( 'pt-userpage-username', $resultHtml );
		$this->assertStringContainsString( $encodedUsername, $resultHtml );
	}
}
