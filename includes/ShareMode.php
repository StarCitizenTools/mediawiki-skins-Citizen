<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen;

use MediaWiki\Logger\LoggerFactory;

/**
 * Valid values for `$wgCitizenShareMode` and the resolution logic that
 * normalises anything else to the default.
 *
 * Centralised so the PHP code path that decides whether to render the
 * panel scaffolding (CitizenComponentPageTools) and the path that
 * forwards the mode to JS (ResourceLoaderHooks) agree on the same set
 * of valid values and the same fallback.
 */
final class ShareMode {

	public const AUTO = 'auto';
	public const PANEL = 'panel';
	public const NATIVE = 'native';

	private const VALID = [ self::AUTO, self::PANEL, self::NATIVE ];

	/**
	 * Normalise a configured share mode value to one of the valid modes,
	 * logging a warning for anything unrecognised. Falls back to AUTO so
	 * a typo in LocalSettings.php degrades to the sensible default
	 * rather than silently disabling the panel entirely.
	 */
	public static function resolve( mixed $configured ): string {
		if ( is_string( $configured ) && in_array( $configured, self::VALID, true ) ) {
			return $configured;
		}

		LoggerFactory::getInstance( 'Citizen' )->warning(
			'Invalid $wgCitizenShareMode value {value}; falling back to {default}.',
			[
				'value' => is_scalar( $configured ) ? (string)$configured : gettype( $configured ),
				'default' => self::AUTO,
			]
		);
		return self::AUTO;
	}

	/**
	 * Whether the given (already-resolved) mode needs the server-rendered
	 * panel scaffolding in the initial HTML.
	 */
	public static function rendersPanelMarkup( string $mode ): bool {
		return $mode === self::AUTO || $mode === self::PANEL;
	}
}
