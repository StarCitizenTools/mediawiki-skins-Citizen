<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MediaWiki\Config\Config;
use MessageLocalizer;

/**
 * CitizenComponentTableOfContents component
 *
 * Enriches MW core's data-toc with Citizen-specific template data.
 */
class CitizenComponentTableOfContents implements CitizenComponent {

	public function __construct(
		private array $tocData,
		private readonly MessageLocalizer $localizer,
		private readonly Config $config
	) {
	}

	public function getTemplateData(): array {
		$sections = $this->tocData['array-sections'] ?? [];
		if ( !$sections ) {
			return [];
		}

		foreach ( $sections as &$section ) {
			if ( $section['is-top-level-section'] && $section['is-parent-section'] ) {
				$section['citizen-button-label'] =
					// @phan-suppress-next-line SecurityCheck-XSS $section['line'] is pre-escaped HTML from the parser
					$this->localizer->msg( 'citizen-toc-toggle-button-label' )
						->rawParams( $section['line'] )
						->escaped();
			}
		}

		$this->tocData['array-sections'] = $sections;

		return array_merge( $this->tocData, [
			'citizen-is-collapse-sections-enabled' =>
				count( $sections ) > 3 &&
				( $this->tocData['number-section-count'] ?? 0 ) >=
					$this->config->get( 'CitizenTableOfContentsCollapseAtCount' ),
		] );
	}
}
