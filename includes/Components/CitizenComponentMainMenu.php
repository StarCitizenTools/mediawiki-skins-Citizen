<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

/**
 * CitizenComponentMainMenu component
 */
class CitizenComponentMainMenu implements CitizenComponent {

	public function __construct( private array $sidebarData ) {
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		return [
			'data-portlets-first' => ( new CitizenComponentMenu( $this->sidebarData['data-portlets-first'] ) )->getTemplateData(),
			'array-portlets-rest' => array_map(
				static fn ( array $data ): array => ( new CitizenComponentMenu( $data ) )->getTemplateData(),
				$this->sidebarData[ 'array-portlets-rest' ]
			)
		];
	}
}
