<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen;

use MediaWiki\Config\ConfigException;
use MediaWiki\Output\OutputPage;

trait GetConfigTrait {

	/**
	 * getConfig() wrapper to catch exceptions.
	 * Returns null on exception
	 *
	 * @param string $key
	 * @param OutputPage|null $out
	 * @return mixed
	 * @see SkinTemplate::getConfig()
	 */
	protected function getConfigValue( string $key, ?OutputPage $out = null ): mixed {
		if ( isset( $this->out ) ) {
			$out = $this->out;
		}

		if ( is_callable( [ $this, 'getOutput' ] ) ) {
			$out = $this->getOutput();
		}

		try {
			$value = $out->getConfig()->get( $key );
		} catch ( ConfigException $e ) {
			$value = null;
		}

		return $value;
	}
}
