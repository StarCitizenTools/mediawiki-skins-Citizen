<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MediaWiki\Html\Html;
use MediaWiki\Language\Language;
use MediaWiki\MediaWikiServices;
use MediaWiki\Title\MalformedTitleException;
use MediaWiki\Title\Title;
use MediaWiki\User\User;
use MessageLocalizer;

/**
 * CitizenComponentUserInfo component
 */
class CitizenComponentUserInfo implements CitizenComponent {

	public function __construct(
		private MediaWikiServices $services,
		private Language $lang,
		private MessageLocalizer $localizer,
		private Title $title,
		private User $user,
		private array $userPageData,
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
	 */
	private function getUserGroups(): ?array {
		$groups = $this->services->getUserGroupManager()->getUserGroups( $this->user );

		if ( !$groups ) {
			return null;
		}

		$listItems = [];
		$msgKey = 'group-%s-member';
		foreach ( $groups as $group ) {
			$id = sprintf( $msgKey, $group );
			$text = $this->localizer->msg( $id )->text();
			try {
				$title = $this->title->newFromTextThrow( $text, NS_PROJECT );
			} catch ( MalformedTitleException $e ) {
				// ignore
			}

			if ( !$text || !$title ) {
				continue;
			}

			$link = new CitizenComponentLink(
				$title->getLinkURL(),
				ucfirst( $text )
			);

			$listItem = new CitizenComponentMenuListItem( $link, 'citizen-userInfo-usergroup', $id );

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
		$realname = htmlspecialchars( $user->getRealName(), ENT_QUOTES );
		if ( $realname !== '' ) {
			$username = htmlspecialchars( $user->getName(), ENT_QUOTES );
			$innerHtml = <<<HTML
				<span id="pt-userpage-realname">$realname</span>
				<span id="pt-userpage-username">$username</span>
			HTML;
			// Dirty but it works
			$htmlItems = str_replace(
				">" . $username . "<",
				">" . $innerHtml . "<",
				$userPageData['html-items']
			);
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
	 * @inheritDoc
	 */
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
			$data = [
				'title' => $localizer->msg( 'notloggedin' ),
				'text' => $localizer->msg( 'citizen-user-info-text-anon' )
			];
		}

		return $data;
	}
}
