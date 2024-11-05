<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MessageLocalizer;

/**
 * CitizenComponentPageFooter component
 * FIXME: Need unit test
 */
class CitizenComponentPageFooter implements CitizenComponent {
	/** @var MessageLocalizer */
	private $localizer;

	/** @var array */
	private $footerData;

	/**
	 * @param MessageLocalizer $localizer
	 * @param array $footerData
	 */
	public function __construct(
		MessageLocalizer $localizer,
		array $footerData
	) {
		$this->localizer = $localizer;
		$this->footerData = $footerData;
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		$footerData = $this->footerData;

		/*
		// Add label to footer-info to use in PageFooter
		foreach ( $footerData['array-items'] as &$item ) {
			$msgKey = 'citizen-page-info-' . $item['name'];
			$item['label'] = $this->localizer->msg( $msgKey )->text();
		}
		*/

		return $footerData;
	}
}
