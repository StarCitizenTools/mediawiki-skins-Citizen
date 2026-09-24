<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MediaWiki\Config\Config;
use MessageLocalizer;

/**
 * CitizenAsidePanelTableOfContents component
 *
 * Enriches MW core's data-toc with Citizen-specific template data.
 */
class CitizenAsidePanelTableOfContents implements CitizenAsidePanel {

	public function __construct(
		private array $tocData,
		private readonly MessageLocalizer $localizer,
		private readonly Config $config
	) {
	}

	public function getId(): string {
		return 'toc';
	}

	public function getLabel(): string {
		return $this->localizer->msg( 'toc' )->text();
	}

	public function getIcon(): string {
		return 'listBullet';
	}

	public function getOrder(): int {
		return 20;
	}

	public function hasContent(): bool {
		return ( $this->tocData['array-sections'] ?? [] ) !== [];
	}

	public function getPlacement(): string {
		return self::PLACEMENT_STICKY;
	}

	public function getTemplateData(): array {
		if ( !$this->hasContent() ) {
			return [];
		}

		$sections = $this->tocData['array-sections'] ?? [];

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

		return [
			'data-toc' => array_merge( $this->tocData, [
				'citizen-is-collapse-sections-enabled' =>
					count( $sections ) > 3 &&
					( $this->tocData['number-section-count'] ?? 0 ) >=
						$this->config->get( 'CitizenTableOfContentsCollapseAtCount' ),
			] ),
		];
	}
}
