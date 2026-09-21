<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MediaWiki\Title\Title;
use MessageLocalizer;

/**
 * The page aside's Last modified panel.
 */
class CitizenAsidePanelLastModified implements CitizenAsidePanel {

	public function __construct(
		private readonly MessageLocalizer $localizer,
		private readonly Title $title,
		private readonly array $lastModifiedData
	) {
	}

	public function getId(): string {
		return 'lastmod';
	}

	public function getLabel(): string {
		return $this->localizer->msg( 'citizen-page-info-lastmod' )->text();
	}

	public function getIcon(): string {
		return 'history';
	}

	public function getOrder(): int {
		return 10;
	}

	public function hasContent(): bool {
		return ( $this->lastModifiedData['timestamp'] ?? null ) !== null;
	}

	public function getPlacement(): string {
		return self::PLACEMENT_FLOW;
	}

	public function getTemplateData(): array {
		if ( !$this->hasContent() ) {
			return [];
		}

		return [
			'id' => 'citizen-sidebar-lastmod',
			'class' => 'citizen-page-aside__panel citizen-page-aside__panel--lastmod',
			'label' => $this->getLabel(),
			'array-list-items' => [
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
							'value' => trim( $this->lastModifiedData['text'] )
						],
						[
							'key' => 'data-timestamp',
							'value' => wfTimestamp( TS_UNIX, $this->lastModifiedData['timestamp'] )
						]
					],
					'icon' => 'history',
					'text' => $this->lastModifiedData['date']
				]
			]
		];
	}
}
