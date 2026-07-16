<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen;

use MediaWiki\Config\Config;

/**
 * Resolves whether a request runs the stable experience or the preview
 * of the next major Citizen release — the "preview channel".
 *
 * Value semantics are version-scoped: only TARGET_MAJOR activates the
 * preview. A stale value (an already-shipped major, or one whose cycle
 * has not opened) is inert, so a forgotten setting never silently
 * enrolls a wiki into a later cycle.
 *
 * This class is pure — no request I/O, no logging. SkinHooks is the
 * single call site that extracts raw values and applies the result.
 *
 * @see docs/src/contribute/preview-channel.md
 */
final class PreviewChannel {

	/** Major release currently previewable through the channel */
	public const TARGET_MAJOR = 4;

	/** URL query parameter and cookie name */
	public const REQUEST_KEY = 'citizenpreview';

	/**
	 * Generation class stamped on <html> in preview. Becomes
	 * unconditional at the 4.0 flip, removed at 5.0, so site CSS
	 * guarded with :root.citizen-v4 survives the flip.
	 */
	public const HTML_CLASS = 'citizen-v4';

	/**
	 * Resolve the channel for one request.
	 *
	 * Precedence: URL param > cookie > $wgCitizenPreview. At the
	 * URL/cookie level '0' is an explicit opt-out and TARGET_MAJOR an
	 * explicit opt-in; any other value (including absent) is inert and
	 * falls through. $wgCitizenPreview is an opt-in-only signal — there
	 * is no config-level opt-out; stable is simply the default.
	 *
	 * @param ?string $urlVal Raw ?citizenpreview= value, null if absent
	 * @param ?string $cookieVal Raw citizenpreview cookie value, null if absent
	 * @param Config $config Skin config
	 */
	public static function isPreview( ?string $urlVal, ?string $cookieVal, Config $config ): bool {
		$explicit = self::parse( $urlVal ) ?? self::parse( $cookieVal );
		if ( $explicit !== null ) {
			return $explicit;
		}

		return (int)$config->get( 'CitizenPreview' ) === self::TARGET_MAJOR;
	}

	/**
	 * Whether a raw URL value is an explicit channel choice worth
	 * persisting to the cookie.
	 */
	public static function isExplicitValue( ?string $raw ): bool {
		return self::parse( $raw ) !== null;
	}

	/**
	 * Interpret a raw request value: '0' opts out, TARGET_MAJOR opts in,
	 * anything else (including null) is inert.
	 */
	private static function parse( ?string $raw ): ?bool {
		if ( $raw === '0' ) {
			return false;
		}
		if ( $raw === (string)self::TARGET_MAJOR ) {
			return true;
		}
		return null;
	}
}
