<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Partials;

use MediaWiki\Skins\Citizen\Partials\Footer;
use MediaWiki\Skins\Citizen\SkinCitizen;
use MediaWikiIntegrationTestCase;

/**
 * @group Citizen
 */
class FooterTest extends MediaWikiIntegrationTestCase {
	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\Footer::decorateFooterData
	 * @return void
	 */
	public function testDecorateFooterData() {
		$partial = new Footer( new SkinCitizen() );

		$data = [
			'data-info' => [
				'array-items' => [
					[ 'name' => 'copyright' ]
				]
			]
		];

		$out = $partial->decorateFooterData( $data );

		$this->assertArraySubmapSame( [
			'data-info' => [
				'array-items' => [
					[
						'name' => 'copyright',
						'label' => wfMessage( 'citizen-page-info-copyright' )->text()
					]
				],
			]
		], $out );
	}
}
