<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MediaWiki\Title\Title;
use MessageLocalizer;

/**
 * CitizenComponentPageSidebar component
 */
class CitizenComponentPageSidebar implements CitizenComponent {

	public function __construct(
		private MessageLocalizer $localizer,
		private Title $title,
		private array $lastModifiedData
	) {
	}

	private function getLastModData(): array {
		$lastModifiedData = $this->lastModifiedData;
		$timestamp = $this->lastModifiedData['timestamp'];

		if ( $timestamp === null ) {
			return [];
		}

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
						'value' => $this->title->getLocalURL( [ 'diff' => '' ] )
					],
					[
						'key' => 'title',
						'value' => trim( $lastModifiedData['text'] )
					],
					[
						'key' => 'data-timestamp',
						'value' => wfTimestamp( TS_UNIX, $lastModifiedData['timestamp'] )
					]
				],
				'icon' => 'history',
				'text' => $lastModifiedData['date']
			]
		];

		// TODO: We should not use CitizenComponentMenu here, but a custom component
		$menu = new CitizenComponentMenu(
			[
				'id' => 'citizen-sidebar-lastmod',
				'label' => $this->localizer->msg( 'citizen-page-info-lastmod' ),
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
