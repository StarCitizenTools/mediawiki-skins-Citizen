<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MessageLocalizer;

/**
 * CitizenComponentFooter component
 */
class CitizenComponentFooter implements CitizenComponent {

	public function __construct(
		private MessageLocalizer $localizer,
		private array $footerData
	) {
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		$localizer = $this->localizer;
		$footerData = $this->footerData;

		return $footerData + [
			'msg-citizen-footer-desc' => $localizer->msg( "citizen-footer-desc" )->inContentLanguage()->parse(),
			'msg-citizen-footer-tagline' => $localizer->msg( "citizen-footer-tagline" )->inContentLanguage()->parse()
		];
	}
}
