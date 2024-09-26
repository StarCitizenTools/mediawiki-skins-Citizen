<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

/**
 * CitizenComponentKeyboardHint component
 */
class CitizenComponentKeyboardHint implements CitizenComponent {
	/** @var string */
	private $label;
	/** @var string */
	private $key;

	/**
	 * @param string $label
	 * @param string $key
	 */
	public function __construct( string $label = '', string $key = '' ) {
		$this->label = $label;
		$this->key = $key;
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		return [
			'label' => $this->label,
			'key' => $this->key,
		];
	}
}
