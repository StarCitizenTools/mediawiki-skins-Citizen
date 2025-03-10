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
		$portletsRest = [];
		foreach ( $this->sidebarData[ 'array-portlets-rest' ] as $data ) {
			/**
			 * Remove toolbox from main menu as we moved it to article tools
			 * TODO: Move handling to SkinCitizen.php after we convert pagetools to component
			 */
			if ( $data['id'] === 'p-tb' ) {
				continue;
			}
			$portletsRest[] = ( new CitizenComponentMenu( $data ) )->getTemplateData();
		}
		$firstPortlet = new CitizenComponentMenu( $this->sidebarData['data-portlets-first'] );

		return [
			'data-portlets-first' => $firstPortlet->getTemplateData(),
			'array-portlets-rest' => $portletsRest
		];
	}
}
