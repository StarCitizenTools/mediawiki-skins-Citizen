<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen;

use MediaWiki\Utils\UrlUtils;

/**
 * Reads on-wiki share service configuration from MediaWiki:Citizen-share-services.json.
 */
class ShareConfigProvider {

	private const PAGE_NAME = 'Citizen-share-services.json';

	public function __construct(
		private readonly OnWikiJsonReader $reader,
		private readonly UrlUtils $urlUtils
	) {
	}

	/**
	 * Returns share service options from on-wiki JSON.
	 *
	 * Replacement semantics are implemented by callers: if this returns non-null,
	 * the returned list should fully replace the default list from skin.json.
	 *
	 * The JSON can be either:
	 * - an array of service objects (recommended for simplicity), or
	 * - an object with a top-level `services` array.
	 *
	 * @return ?array<int, array<string, mixed>>
	 */
	public function getServiceOptions(): ?array {
		$data = $this->reader->read( self::PAGE_NAME );
		if ( $data === null ) {
			return null;
		}

		$services = null;
		if ( self::isList( $data ) ) {
			$services = $data;
		} elseif ( is_array( $data['services'] ?? null ) && self::isList( $data['services'] ) ) {
			$services = $data['services'];
		}

		if ( $services === null ) {
			return null;
		}

		return $this->sanitizeServices( $services );
	}

	/**
	 * Drop entries that are not arrays or whose `url` does not use an allowed protocol.
	 * `url` is rendered into `data-url` and passed to `window.open`, so a `javascript:`
	 * URL would execute — defer to `$wgUrlProtocols` for the allow-list.
	 *
	 * @param array $services
	 * @return array<int, array<string, mixed>>
	 */
	public function sanitizeServices( array $services ): array {
		$sanitized = [];
		foreach ( $services as $service ) {
			$entry = $this->sanitizeService( $service );
			if ( $entry !== null ) {
				$sanitized[] = $entry;
			}
		}
		return $sanitized;
	}

	/**
	 * @param mixed $service
	 * @return ?array<string, mixed>
	 */
	private function sanitizeService( $service ): ?array {
		if ( !is_array( $service ) ) {
			return null;
		}
		$url = $service['url'] ?? null;
		if ( !is_string( $url ) || !$this->hasAllowedProtocol( $url ) ) {
			return null;
		}
		return $service;
	}

	private function hasAllowedProtocol( string $url ): bool {
		$protocols = $this->urlUtils->validAbsoluteProtocols();
		if ( $protocols === '' ) {
			return false;
		}
		return preg_match( '/^(?:' . $protocols . ')/i', $url ) === 1;
	}

	/**
	 * @param array $arr
	 * @return bool
	 */
	private static function isList( array $arr ): bool {
		$i = 0;
		foreach ( $arr as $k => $_ ) {
			if ( $k !== $i ) {
				return false;
			}
			$i++;
		}
		return true;
	}
}
