<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

/**
 * CitizenComponentUserMenu component
 */
class CitizenComponentUserMenu implements CitizenComponent {
	/** @var array */
	private $userMenuData;

	/**
	 * @param array $userMenuData
	 */
	public function __construct( array $userMenuData ) {
		$this->userMenuData = $userMenuData;
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
	}
}
