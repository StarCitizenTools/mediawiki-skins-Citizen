<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\ResourceLoader;

use MediaWiki\ResourceLoader\Context;
use MediaWiki\ResourceLoader\SkinModule;
use MediaWiki\Skins\Citizen\CompatSlices;

/**
 * SkinModule that splices cache-compat slices into this module's styles while
 * $wgCitizenCompat is enabled. Slices ride the EXISTING module name because
 * old cached HTML only references module names that existed when it was
 * generated — a new module could never reach stale pages render-blocking.
 *
 * @see resources/compat/README.md
 */
class CompatSkinModule extends SkinModule {

	/**
	 * @return string[] slice paths relative to the skin directory, oldest first
	 */
	private function getCompatStyleFiles(): array {
		if ( !$this->getConfig()->get( 'CitizenCompat' ) ) {
			return [];
		}

		return CompatSlices::getSliceStyleFiles( $this->localBasePath );
	}

	/**
	 * @inheritDoc
	 */
	public function getStyleFiles( Context $context ) {
		$styles = parent::getStyleFiles( $context );
		foreach ( $this->getCompatStyleFiles() as $file ) {
			// Appended last so newer compat wins cascade ties over base styles
			$styles['all'][] = $file;
		}

		return $styles;
	}

	/**
	 * @inheritDoc
	 */
	public function getDefinitionSummary( Context $context ) {
		$summary = parent::getDefinitionSummary( $context );
		$summary[] = [ 'citizenCompatSlices' => $this->getCompatStyleFiles() ];

		return $summary;
	}
}
