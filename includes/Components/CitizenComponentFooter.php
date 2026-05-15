<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MessageLocalizer;

/**
 * CitizenComponentFooter component
 *
 * Consumes the polyfilled $parentData['data-portlets'] footer slice
 * (data-footer-places, data-footer-icons) produced by
 * SkinCitizen::polyfillFooterPortlets().
 */
class CitizenComponentFooter implements CitizenComponent {

	public function __construct(
		private readonly MessageLocalizer $localizer,
		private readonly array $footerPortlets
	) {
	}

	public function getTemplateData(): array {
		return [
			'data-footer-places' => $this->footerPortlets['data-footer-places'] ?? [],
			'data-footer-icons' => $this->footerPortlets['data-footer-icons'] ?? [],
			'msg-citizen-footer-desc' => $this->localizer
				->msg( 'citizen-footer-desc' )->inContentLanguage()->parse(),
			'msg-citizen-footer-tagline' => $this->localizer
				->msg( 'citizen-footer-tagline' )->inContentLanguage()->parse(),
		];
	}
}
