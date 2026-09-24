<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

/**
 * The page aside: a container of panels beside the article.
 *
 * The container knows nothing about any particular panel. It drops the ones
 * with nothing to show, orders the rest, splits them by placement, and marks
 * each one so the template can render it without the container branching on
 * what it is.
 */
class CitizenComponentPageAside implements CitizenComponent {

	/**
	 * @param CitizenAsidePanel[] $panels
	 */
	public function __construct(
		private readonly array $panels
	) {
	}

	public function getTemplateData(): array {
		$panels = array_filter(
			$this->panels,
			static fn ( CitizenAsidePanel $panel ): bool => $panel->hasContent()
		);

		usort(
			$panels,
			static fn ( CitizenAsidePanel $a, CitizenAsidePanel $b ): int
				=> $a->getOrder() <=> $b->getOrder()
		);

		$entries = array_map(
			static fn ( CitizenAsidePanel $panel ): array => [
				'panel-id' => $panel->getId(),
				'panel-label' => $panel->getLabel(),
				'panel-order' => $panel->getOrder(),
				'panel-placement' => $panel->getPlacement(),
				// The template dispatches on this rather than on a partial
				// name, because MediaWiki's TemplateParser cannot resolve a
				// partial name from data (no FLAG_ADVARNAME). A boolean, so
				// it is not subject to the empty-string section trap.
				'is-' . $panel->getId() => true,
				// Kept under its own key rather than merged, so nothing a
				// panel returns can meet the keys above. The template opens
				// `body` before rendering the panel's partial.
				'body' => $panel->getTemplateData(),
			],
			$panels
		);
		$isSticky = static fn ( array $entry ): bool =>
			$entry['panel-placement'] === CitizenAsidePanel::PLACEMENT_STICKY;
		$sticky = array_values( array_filter( $entries, $isSticky ) );
		$flow = array_values( array_filter( $entries, static fn ( array $entry ): bool => !$isSticky( $entry ) ) );

		return [
			'array-flow-panels' => $flow,
			// Sticky panels share one block, which the template opens only
			// when a panel needs it.
			'array-sticky-panels' => $sticky,
			'has-sticky-panels' => $sticky !== [],
		];
	}
}
