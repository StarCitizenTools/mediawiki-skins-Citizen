<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MessageLocalizer;

/**
 * CitizenComponentPageFooter component
 * FIXME: Need unit test
 */
class CitizenComponentPageFooter implements CitizenComponent {

	public function __construct(
		private MessageLocalizer $localizer,
		private array $footerData
	) {
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		$footerData = $this->footerData;

		// Add label to footer-info to use in PageFooter
		foreach ( $footerData['array-items'] as &$item ) {
			$msgKey = 'citizen-page-info-' . $item['name'];
			$item['label'] = $this->localizer->msg( $msgKey )->text();
		}

		return $footerData;
	}
}
