<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use Countable;

/**
 * CitizenComponentMenu component
 */
class CitizenComponentMenu implements CitizenComponent, Countable {

	public function __construct( private array $data ) {
	}

	/**
	 * Counts how many items the menu has.
	 *
	 * @return int
	 */
	public function count(): int {
		$items = $this->data['array-list-items'] ?? null;
		if ( $items ) {
			return count( $items );
		}
		$htmlItems = $this->data['html-items'] ?? '';
		return substr_count( $htmlItems, '<li' );
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		return $this->data + [
			'class' => '',
			'label' => '',
			'html-tooltip' => '',
			'label-class' => '',
			'html-before-portal' => '',
			'html-items' => '',
			'html-after-portal' => '',
			'array-list-items' => null,
		];
	}
}
