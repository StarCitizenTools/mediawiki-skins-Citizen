<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MediaWiki\Html\Html;
use MediaWiki\Language\Language;
use MediaWiki\User\TempUser\TempUserConfig;
use MediaWiki\User\User;
use MediaWiki\User\UserGroupManager;
use MediaWiki\User\UserGroupMembership;
use MessageLocalizer;
use Wikimedia\Parsoid\Utils\DOMCompat;
use Wikimedia\Parsoid\Utils\DOMUtils;

/**
 * CitizenComponentUserInfo component
 */
class CitizenComponentUserInfo implements CitizenComponent {

	public function __construct(
		private readonly UserGroupManager $userGroupManager,
		private readonly Language $lang,
		private readonly MessageLocalizer $localizer,
		private readonly User $user,
		private readonly TempUserConfig $tempUserConfig,
		private readonly array $userPageData,
	) {
	}

	/**
	 * Get the user edit count
	 */
	private function getUserEditCount(): ?array {
		$edits = $this->user->getEditCount();

		if ( $edits === null ) {
			return null;
		}

		return [
			'value' => number_format( $edits, 0 ),
			'label' => $this->localizer->msg( 'citizen-user-info-edits-label' )->text()
		];
	}

	/**
	 * Get the user registration date
	 */
	private function getUserRegistration(): ?array {
		$timestamp = $this->user->getRegistration();

		if ( $timestamp === false || $timestamp === null ) {
			return null;
		}

		// Since this is not accessible by anon, we can use user language
		$date = $this->lang->userDate( $timestamp, $this->user );
		$html = Html::element(
			'time',
			[
				'class' => 'citizen-user-regdate',
				'datetime' => wfTimestamp( TS_ISO_8601, $timestamp )
			],
			$date
		);

		return [
			'value' => $html,
			'label' => $this->localizer->msg( 'citizen-user-info-joined-label' )->text()
		];
	}

	/**
	 * Build the template data for the user groups
	 *
	 * Follows UserGroupMembership::getLinkHTML(), as used by Special:Preferences:
	 * the label is the group member name in the user's interface language (with
	 * GENDER), while the target comes from grouppage-<group> in the content
	 * language. Groups without that message render as plain text, since there is
	 * no page to point at.
	 *
	 * One deliberate difference: the label is capitalised. Core leaves it lower
	 * case because it reads inside a sentence there ("member of: administrator"),
	 * whereas here each name stands on its own.
	 */
	private function getUserGroups(): ?array {
		$groups = $this->userGroupManager->getUserGroups( $this->user );

		if ( !$groups ) {
			return null;
		}

		$listItems = [];
		foreach ( $groups as $group ) {
			$text = $this->lang->ucfirst(
				$this->lang->getGroupMemberName( $group, $this->user )
			);

			if ( $text === '' ) {
				continue;
			}

			$title = UserGroupMembership::getGroupPage( $group );
			$link = $title
				? new CitizenComponentLink( $title->getLinkURL(), $text )
				: null;

			$listItem = new CitizenComponentMenuListItem(
				$link,
				'citizen-userInfo-usergroup',
				sprintf( 'group-%s-member', $group ),
				$link ? '' : $text
			);

			$listItems[] = $listItem->getTemplateData();
		}

		return [
			'array-list-items' => $listItems
		];
	}

	/**
	 * Build the template data for the user page menu
	 */
	private function getUserPage(): array {
		$user = $this->user;
		$userPageData = $this->userPageData;

		$htmlItems = $userPageData['html-items'];
		$realname = $user->getRealName();
		if ( $realname !== '' ) {
			$username = $user->getName();
			$htmlItems = $this->replaceUsernameWithRealName( $htmlItems, $username, $realname );
		}

		$menu = new CitizenComponentMenu( [
			'id' => 'citizen-user-menu-userpage',
			'class' => null,
			'label' => null,
			'html-items' => $htmlItems
		] );

		return $menu->getTemplateData();
	}

	/**
	 * Replace the username text inside anchor elements with a real name + username span structure.
	 * Uses DOM manipulation to handle HTML entity encoding correctly.
	 */
	private function replaceUsernameWithRealName( string $html, string $username, string $realname ): string {
		$doc = DOMUtils::parseHTML( $html );
		$body = DOMCompat::getBody( $doc );

		foreach ( DOMCompat::querySelectorAll( $body, 'a' ) as $anchor ) {
			foreach ( $anchor->childNodes as $child ) {
				if ( $child->nodeType === XML_TEXT_NODE && $child->textContent === $username ) {
					$realnameSpan = $doc->createElement( 'span' );
					$realnameSpan->setAttribute( 'id', 'pt-userpage-realname' );
					$realnameSpan->appendChild( $doc->createTextNode( $realname ) );

					$usernameSpan = $doc->createElement( 'span' );
					$usernameSpan->setAttribute( 'id', 'pt-userpage-username' );
					$usernameSpan->appendChild( $doc->createTextNode( $username ) );

					$anchor->replaceChild( $usernameSpan, $child );
					$anchor->insertBefore( $realnameSpan, $usernameSpan );
					$anchor->insertBefore( $doc->createTextNode( ' ' ), $usernameSpan );
					break 2;
				}
			}
		}

		return DOMCompat::getInnerHTML( $body );
	}

	public function getTemplateData(): array {
		$localizer = $this->localizer;
		$user = $this->user;
		$data = [];

		if ( $user->isRegistered() ) {
			$data = [
				'data-user-page' => $this->getUserPage(),
				'data-user-stats' => [
					'array-stats-items' => [
						$this->getUserEditCount(),
						$this->getUserRegistration()
					]
				]
			];

			if ( $user->isTemp() ) {
				$data['text'] = $localizer->msg( 'citizen-user-info-text-temp' );
			} else {
				$data['data-user-groups'] = $this->getUserGroups();
			}
		} else {
			// When an edit auto-creates a temporary account, the visitor's IP
			// is not publicly exposed, so the IP-visibility warning would be
			// inaccurate. Key on the 'edit' action specifically (rather than
			// isEnabled()) since the message is about editing — a wiki could
			// enable temp accounts for other actions only.
			$anonText = $this->tempUserConfig->isAutoCreateAction( 'edit' )
				? 'citizen-user-info-text-anon-temp'
				: 'citizen-user-info-text-anon';
			$data = [
				'title' => $localizer->msg( 'notloggedin' ),
				'text' => $localizer->msg( $anonText )
			];
		}

		return $data;
	}
}
