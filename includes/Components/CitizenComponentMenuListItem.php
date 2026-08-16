<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

/**
 * CitizenComponentMenuListItem component
 */
class CitizenComponentMenuListItem implements CitizenComponent {

	/**
	 * A null $link renders $text as plain content, for items that have no
	 * meaningful target.
	 */
	public function __construct(
		private readonly ?CitizenComponentLink $link,
		private readonly string $class = '',
		private readonly string $id = '',
		private readonly string $text = ''
	) {
	}

	public function getTemplateData(): array {
		return [
			'array-links' => $this->link?->getTemplateData(),
			'item-class' => $this->class,
			'item-id' => $this->id,
			'text' => $this->text,
		];
	}
}
