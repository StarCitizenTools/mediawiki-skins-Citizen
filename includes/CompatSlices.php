<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen;

/**
 * Discovers cache-compat slices in resources/compat/ and derives the HTML
 * generation marker from them. The filesystem is the registry — creating a
 * slice file is the generation bump.
 *
 * @see resources/compat/README.md
 */
final class CompatSlices {

	private const COMPAT_DIR = 'resources/compat';

	/**
	 * Attribute carrying the generation marker on <html>.
	 *
	 * The data-mw- prefix is reserved by core (Sanitizer::isReservedDataAttribute),
	 * so wikitext cannot forge one: a gate can trust the marker it reads.
	 */
	public const GENERATION_ATTRIBUTE = 'data-mw-citizen-html';

	/** @var array<string, string[]> slice versions memoized per base path */
	private static array $versionCache = [];

	/**
	 * The skin root, i.e. the directory holding resources/compat.
	 *
	 * Both sides of the framework must resolve the same one: CompatSkinModule
	 * scans it for slices to serve, and the marker below is derived from it. If
	 * they ever diverge, gates ship without a marker to match (or the reverse)
	 * and every gate in the window breaks at once.
	 */
	public static function getBasePath(): string {
		return dirname( __DIR__ );
	}

	/**
	 * @return string[] slice versions present, oldest first
	 */
	public static function getSliceVersions( string $basePath ): array {
		if ( !isset( self::$versionCache[$basePath] ) ) {
			$versions = [];
			$dir = $basePath . '/' . self::COMPAT_DIR;
			$entries = ( is_dir( $dir ) ? scandir( $dir ) : false ) ?: [];
			foreach ( $entries as $entry ) {
				if ( preg_match( '/^(\d+\.\d+(?:\.\d+)?)\.less$/', $entry, $m ) ) {
					$versions[] = $m[1];
				}
			}
			usort( $versions, 'version_compare' );
			self::$versionCache[$basePath] = $versions;
		}

		return self::$versionCache[$basePath];
	}

	/**
	 * @return string[] style file paths relative to the skin directory, oldest first
	 */
	public static function getSliceStyleFiles( string $basePath ): array {
		return array_map(
			static fn ( string $version ): string => self::COMPAT_DIR . "/$version.less",
			self::getSliceVersions( $basePath )
		);
	}

	/**
	 * Value for GENERATION_ATTRIBUTE: every slice version present, oldest first,
	 * space-separated — e.g. '3.15 3.18 3.22'. Null when no slices exist.
	 *
	 * The list is cumulative, not just the newest version, because slices exist
	 * only for releases that broke something: with 3.15 the newest slice, HTML
	 * from 3.15, 3.16 and 3.17 is all one generation, and a single-token marker
	 * would still read '3.15' after 3.15.less was deleted at 3.22 — while pages
	 * stamped with it sit inside the window. Each token means "this HTML is at
	 * or after that generation", so a gate references only its OWN version,
	 * which lives in the same file as the gate. Deleting an expired slice can
	 * therefore never orphan a gate, and nothing has to enumerate generations.
	 *
	 * Dots are kept: an attribute selector quotes its value anyway
	 * ( [ data-mw-citizen-html~='3.22' ] ), so mangling them buys nothing.
	 */
	public static function getGenerationMarker( string $basePath ): ?string {
		$versions = self::getSliceVersions( $basePath );
		if ( $versions === [] ) {
			return null;
		}

		return implode( ' ', $versions );
	}
}
