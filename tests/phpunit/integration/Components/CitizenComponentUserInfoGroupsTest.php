<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration\Components;

use MediaWiki\Context\RequestContext;
use MediaWiki\Skins\Citizen\Components\CitizenComponentUserInfo;
use MediaWikiIntegrationTestCase;

/**
 * Group links resolve through UserGroupMembership::getGroupPage(), which reads
 * grouppage-<group> via wfMessage(), so these need real services rather than a
 * unit-test double.
 *
 * @group Citizen
 * @group Components
 * @group Database
 * @covers \MediaWiki\Skins\Citizen\Components\CitizenComponentUserInfo
 */
class CitizenComponentUserInfoGroupsTest extends MediaWikiIntegrationTestCase {

	/**
	 * @param string[] $groups
	 * @param string $langCode Interface language the component renders labels in
	 */
	private function buildGroupItems( array $groups, string $langCode = 'en' ): array {
		$user = $this->getMutableTestUser( $groups )->getUser();

		$component = new CitizenComponentUserInfo(
			$this->getServiceContainer()->getUserGroupManager(),
			$this->getServiceContainer()->getLanguageFactory()->getLanguage( $langCode ),
			RequestContext::getMain(),
			$user,
			$this->getServiceContainer()->getTempUserConfig(),
			[ 'html-items' => '' ]
		);

		$data = $component->getTemplateData();

		return $data['data-user-groups']['array-list-items'] ?? [];
	}

	public function testGroupWithGroupPageMessageLinksToIt(): void {
		$items = $this->buildGroupItems( [ 'sysop' ] );

		$this->assertCount( 1, $items );
		$item = $items[0];

		$this->assertSame( 'group-sysop-member', $item['item-id'] );
		$this->assertSame( 'citizen-userInfo-usergroup', $item['item-class'] );
		$this->assertNotNull( $item['array-links'], 'sysop has a grouppage message, so it must link' );
		$this->assertSame( '', $item['text'], 'a linked group carries no plain-text fallback' );
		$this->assertStringContainsString(
			'Administrators',
			$item['array-links']['href'],
			'target comes from grouppage-sysop, not the singular member name'
		);
		$this->assertSame( 'Administrator', $item['array-links']['text'] );
	}

	public function testGroupWithoutGroupPageMessageRendersAsPlainText(): void {
		$items = $this->buildGroupItems( [ 'citizen-test-nogrouppage' ] );

		$this->assertCount( 1, $items );
		$item = $items[0];

		$this->assertNull( $item['array-links'], 'no grouppage message means no link' );
		$this->assertNotSame( '', $item['text'], 'the name still has to be shown' );
	}

	/**
	 * The bug this component had: the target was derived from the translated
	 * member name, so it moved with the interface language. Label and target must
	 * come from different languages — interface for one, content for the other.
	 */
	public function testInterfaceLanguageMovesTheLabelButNotTheTarget(): void {
		$items = $this->buildGroupItems( [ 'interface-admin' ], 'de' );
		$link = $items[0]['array-links'];

		$this->assertSame(
			'Oberflächenadministrator',
			$link['text'],
			'label follows the interface language'
		);
		$this->assertStringContainsString(
			'Interface_administrators',
			$link['href'],
			'target stays on the content-language grouppage message'
		);
		$this->assertStringNotContainsString( 'Oberfl', $link['href'] );
	}

	public function testNoGroupsProducesNoSection(): void {
		$this->assertSame( [], $this->buildGroupItems( [] ) );
	}
}
