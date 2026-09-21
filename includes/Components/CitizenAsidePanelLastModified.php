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
			'href' => $this->title->getLocalURL( [ 'diff' => '' ] ),
			// From core's date and time fields rather than its pre-parsed
			// sentence, which is HTML and can carry a lagged-replica notice.
			'title' => $this->localizer->msg(
				'lastmodifiedat',
				$this->lastModifiedData['date'],
				$this->lastModifiedData['time']
			)->text(),
			'datetime' => wfTimestamp( TS_ISO_8601, $this->lastModifiedData['timestamp'] ),
			'date' => $this->lastModifiedData['date'],
			'icon' => $this->getIcon(),
		];
	}
}
