<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MessageLocalizer;

/**
 * CitizenComponentFooter component
 * FIXME: Need unit test
 */
class CitizenComponentFooter implements CitizenComponent {
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
		$localizer = $this->localizer;
		$footerData = $this->footerData;

		return $footerData;
	}
}
