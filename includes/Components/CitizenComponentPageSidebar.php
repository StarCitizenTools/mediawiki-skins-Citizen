<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MediaWiki\Language\Language;
use MediaWiki\Output\OutputPage;
use MediaWiki\StubObject\StubUserLang;
use MediaWiki\Title\Title;
use MediaWiki\User\UserIdentity;
use MessageLocalizer;

/**
 * CitizenComponentPageSidebar component
 * FIXME: Need unit test
 */
class CitizenComponentPageSidebar implements CitizenComponent {
	/** @var MessageLocalizer */
	private $localizer;

	/** @var OutputPage */
	private $out;

	/** @var Language|StubUserLang */
	private $pageLang;

	/** @var Title */
	private $title;

	/** @var UserIdentity */
	private $user;

	/**
	 * @param MessageLocalizer $localizer
	 * @param OutputPage $out
	 * @param Language|StubUserLang $pageLang
	 * @param Title $title
	 * @param UserIdentity $user
	 */
	public function __construct(
		MessageLocalizer $localizer,
		OutputPage $out,
		$pageLang,
		Title $title,
		UserIdentity $user
	) {
		$this->localizer = $localizer;
		$this->out = $out;
		$this->pageLang = $pageLang;
		$this->title = $title;
		$this->user = $user;
	}

	/**
	 * Get the last modified data
	 * TODO: Use core instead when update to MW 1.43
	 * @return array
	 */
	private function getLastModData() {
		$timestamp = $this->out->getRevisionTimestamp();

		if ( !$timestamp ) {
			return [];
		}

		$localizer = $this->localizer;
		$pageLang = $this->pageLang;
		$title = $this->title;
		$user = $this->user;

		$d = $pageLang->userDate( $timestamp, $user );
		$t = $pageLang->userTime( $timestamp, $user );
		$s = $localizer->msg( 'lastmodifiedat', $d, $t );

		// FIXME: Use CitizenComponentMenuListItem
		$items = [
			'item-id' => 'lm-time',
			'item-class' => 'mw-list-item',
			'array-links' => [
				'array-attributes' => [
					[
						'key' => 'id',
						'value' => 'citizen-lastmod-relative'
					],
					[
						'key' => 'href',
						'value' => $title->getLocalURL( [ 'diff' => '' ] )
					],
					[
						'key' => 'title',
						'value' => $s
					],
					[
						'key' => 'data-timestamp',
						'value' => wfTimestamp( TS_UNIX, $timestamp )
					]
				],
				'icon' => 'history',
				'text' => $d
			]
		];

		$menu = new CitizenComponentMenu(
			[
				'id' => 'citizen-sidebar-lastmod',
				'label' => $localizer->msg( 'citizen-page-info-lastmod' ),
				'array-list-items' => $items
			]
		);

		return $menu->getTemplateData();
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		return [
			'data-page-sidebar-lastmod' => $this->getLastModData()
		];
	}
}
