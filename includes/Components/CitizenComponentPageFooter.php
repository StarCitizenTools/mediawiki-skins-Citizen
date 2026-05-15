<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MessageLocalizer;

/**
 * CitizenComponentPageFooter component
 *
 * Consumes $parentData['data-portlets']['data-footer-info'] (polyfilled
 * by SkinCitizen::polyfillFooterPortlets() for MW 1.43–1.46 compatibility).
 */
class CitizenComponentPageFooter implements CitizenComponent {

	public function __construct(
		private readonly MessageLocalizer $localizer,
		private readonly array $footerData
	) {
	}

	public function getTemplateData(): array {
		$footerData = $this->footerData;

		if ( !isset( $footerData['array-items'] ) ) {
			return $footerData;
		}

		foreach ( $footerData['array-items'] as &$item ) {
			$name = $item['name'] ?? '';
			$msg = $this->localizer->msg( 'citizen-page-info-' . $name );
			$item['label'] = $msg->exists() ? $msg->text() : ( $item['label'] ?? '' );
		}

		return $footerData;
	}
}
