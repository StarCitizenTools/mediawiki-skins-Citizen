<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use Skin;

/**
 * CitizenComponentSearchBox component
 */
class CitizenComponentSearchBox implements CitizenComponent {
	/** @var array */
	private $searchBoxData;

	/** @var Skin */
	private $skin;

	/**
	 * @param array $searchBoxData
	 */
	public function __construct(
		array $searchBoxData,
		Skin $skin
	) {
		$this->searchBoxData = $searchBoxData;
		$this->skin = $skin;
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		$searchBoxData = $this->searchBoxData;

		return $searchBoxData += [
			'msg-citizen-search-toggle-shortcut' => '[/]',
			'html-random-href' => $this->skin->makeSpecialUrl( 'Randompage' ),
		];
	}
}
