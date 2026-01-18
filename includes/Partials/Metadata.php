<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Partials;

use Exception;
use MediaWiki\MainConfigNames;
use MediaWiki\Skins\Citizen\SkinCitizen;
use MediaWiki\Utils\UrlUtils;

final class Metadata extends Partial {

	public function __construct(
		SkinCitizen $skin,
		private readonly UrlUtils $urlUtils
	) {
		parent::__construct( $skin );
	}

	/**
	 * Adds metadata to the output page
	 */
	public function addMetadata(): void {
		// Theme color
		$this->out->addMeta( 'theme-color', $this->getConfigValue( 'CitizenThemeColor' ) ?? '' );

		// Generate webapp manifest
		$this->addManifest();
	}

	/**
	 * Adds the manifest if:
	 * * Enabled in 'CitizenEnableManifest'
	 * * User has read access (i.e. not a private wiki)
	 * Manifest link will be empty if wfExpandUrl throws an exception.
	 */
	private function addManifest(): void {
		if (
			$this->getConfigValue( 'CitizenEnableManifest' ) !== true ||
			$this->getConfigValue( MainConfigNames::GroupPermissions )['*']['read'] !== true
		) {
			return;
		}

		try {
			$href = $this->urlUtils->expand( wfAppendQuery( wfScript( 'api' ),
					[ 'action' => 'appmanifest' ] ), PROTO_RELATIVE );
		} catch ( Exception $e ) {
			$href = '';
		}

		$this->out->addLink( [
			'rel' => 'manifest',
			'href' => $href,
		] );
	}
}
