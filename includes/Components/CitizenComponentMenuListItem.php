<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

/**
 * CitizenComponentMenuListItem component
 */
class CitizenComponentMenuListItem implements CitizenComponent {

	public function __construct(
		private readonly CitizenComponentLink $link,
		private readonly string $class = '',
		private readonly string $id = ''
	) {
	}

	public function getTemplateData(): array {
		return [
			'array-links' => $this->link->getTemplateData(),
			'item-class' => $this->class,
			'item-id' => $this->id,
		];
	}
}
