<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit\Components;

use MediaWiki\Language\Language;
use MediaWiki\Skins\Citizen\Components\CitizenComponentUserInfo;
use MediaWiki\User\TempUser\TempUserConfig;
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

	private function createMockTempUserConfig( bool $autoCreateOnEdit ): TempUserConfig {
		$tempUserConfig = $this->createMock( TempUserConfig::class );
		$tempUserConfig->method( 'isAutoCreateAction' )
			->with( 'edit' )
			->willReturn( $autoCreateOnEdit );

		return $tempUserConfig;
	}

	/**
	 * Localizer whose Message objects echo back the requested key via text(),
	 * so tests can assert which message key was selected.
	 */
	private function createKeyEchoLocalizer(): MessageLocalizer {
		$localizer = $this->createMock( MessageLocalizer::class );
		$localizer->method( 'msg' )->willReturnCallback( function ( $key ) {
			$msg = $this->createMock( Message::class );
			$msg->method( 'text' )->willReturn( $key );
			return $msg;
		} );

		return $localizer;
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

		// Taken from real skin output: core wraps portlet link text in a span, so
		// the username is never a direct text child of the anchor. A fixture without
		// that span passes even when the replacement cannot fire.
		$encodedUsername = htmlspecialchars( $username, ENT_QUOTES );
		$htmlItems = '<li id="pt-userpage-2" class="mw-list-item"><a href="/wiki/User:'
			. $encodedUsername . '" class="new" accesskey="."><span>'
			. $encodedUsername . '</span></a></li>';

		$userPageData = [
			'html-items' => $htmlItems,
		];

		$component = new CitizenComponentUserInfo(
			$userGroupManager,
			$lang,
			$localizer,
			$user,
			$this->createMockTempUserConfig( false ),
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
	 * Realnames ships a same-name style, so real name equal to username is a
	 * configuration people actually run. Printing both would repeat the word.
	 *
	 * @covers ::getTemplateData
	 */
	public function testRealNameMatchingUsernameIsNotDuplicated(): void {
		$username = 'NotifTest';

		$user = $this->createMockUser( $username, $username );
		$userGroupManager = $this->createMock( UserGroupManager::class );
		$userGroupManager->method( 'getUserGroups' )->willReturn( [] );

		$htmlItems = '<li id="pt-userpage-2" class="mw-list-item">'
			. '<a href="/wiki/User:' . $username . '" class="new" accesskey="."><span>'
			. $username . '</span></a></li>';

		$component = new CitizenComponentUserInfo(
			$userGroupManager,
			$this->createMock( Language::class ),
			$this->createMockLocalizer(),
			$user,
			$this->createMockTempUserConfig( false ),
			[ 'html-items' => $htmlItems ]
		);

		$data = $component->getTemplateData();

		$this->assertSame( $htmlItems, $data['data-user-page']['html-items'] );
	}

	/**
	 * Extension:Realnames rewrites the portlet text before Citizen sees it, so the
	 * username is no longer present verbatim and the replacement must not fire.
	 *
	 * @covers ::getTemplateData
	 */
	public function testRealNamesExtensionOutputIsLeftAlone(): void {
		$username = 'NotifTest';

		$user = $this->createMockUser( $username, 'Test Person' );
		$userGroupManager = $this->createMock( UserGroupManager::class );
		$userGroupManager->method( 'getUserGroups' )->willReturn( [] );

		// Exactly what Realnames' paren-reverse style leaves in data-portlets.
		$htmlItems = '<li id="pt-userpage-2" class="mw-list-item">'
			. '<a href="/wiki/User:' . $username . '" class="new" accesskey=".">'
			. '<span>Test Person (' . $username . ')</span></a></li>';

		$component = new CitizenComponentUserInfo(
			$userGroupManager,
			$this->createMock( Language::class ),
			$this->createMockLocalizer(),
			$user,
			$this->createMockTempUserConfig( false ),
			[ 'html-items' => $htmlItems ]
		);

		$data = $component->getTemplateData();

		$this->assertSame( $htmlItems, $data['data-user-page']['html-items'] );
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

		$encodedUsername = htmlspecialchars( $username, ENT_QUOTES );
		$htmlItems = '<li id="pt-userpage-2" class="mw-list-item"><a href="/wiki/User:'
			. $encodedUsername . '" class="new" accesskey="."><span>'
			. $encodedUsername . '</span></a></li>';

		$userPageData = [
			'html-items' => $htmlItems,
		];

		$component = new CitizenComponentUserInfo(
			$userGroupManager,
			$lang,
			$localizer,
			$user,
			$this->createMockTempUserConfig( false ),
			$userPageData
		);

		$data = $component->getTemplateData();

		$resultHtml = $data['data-user-page']['html-items'];

		// HTML should stay unchanged — no realname/username spans injected
		$this->assertStringNotContainsString( 'pt-userpage-realname', $resultHtml );
		$this->assertStringNotContainsString( 'pt-userpage-username', $resultHtml );
		$this->assertStringContainsString( $encodedUsername, $resultHtml );
	}

	/**
	 * @covers ::getTemplateData
	 */
	public function testAnonUserSeesIpWarningWhenTempAccountsDisabled(): void {
		$user = $this->createMock( User::class );
		$user->method( 'isRegistered' )->willReturn( false );

		$component = new CitizenComponentUserInfo(
			$this->createMock( UserGroupManager::class ),
			$this->createMock( Language::class ),
			$this->createKeyEchoLocalizer(),
			$user,
			$this->createMockTempUserConfig( false ),
			[]
		);

		$data = $component->getTemplateData();

		$this->assertSame( 'citizen-user-info-text-anon', $data['text']->text() );
	}

	/**
	 * @covers ::getTemplateData
	 */
	public function testAnonUserSeesTempWarningWhenTempAccountsEnabled(): void {
		$user = $this->createMock( User::class );
		$user->method( 'isRegistered' )->willReturn( false );

		$component = new CitizenComponentUserInfo(
			$this->createMock( UserGroupManager::class ),
			$this->createMock( Language::class ),
			$this->createKeyEchoLocalizer(),
			$user,
			$this->createMockTempUserConfig( true ),
			[]
		);

		$data = $component->getTemplateData();

		$this->assertSame( 'citizen-user-info-text-anon-temp', $data['text']->text() );
	}
}
