<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

/**
 * CitizenComponentMenuListItem component
 */
class CitizenComponentMenuListItem implements CitizenComponent {
	/** @var CitizenComponentLink */
	private $link;
	/** @var string */
	private $class;
	/** @var string */
	private $id;

	/**
	 * @param CitizenComponentLink $link
	 * @param string $class
	 * @param string $id
	 */
	public function __construct( CitizenComponentLink $link, string $class = '', string $id = '' ) {
		$this->link = $link;
		$this->class = $class;
		$this->id = $id;
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		return [
			'array-links' => $this->link->getTemplateData(),
			'item-class' => $this->class,
			'item-id' => $this->id,
		];
	}
}
