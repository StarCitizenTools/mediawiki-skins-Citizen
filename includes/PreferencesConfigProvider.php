<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen;

use MessageLocalizer;

/**
 * Reads on-wiki preferences overrides from MediaWiki:Citizen-preferences.json
 * and resolves custom i18n message keys for the client-side module.
 */
class PreferencesConfigProvider {

	private const PAGE_NAME = 'Citizen-preferences.json';

	private OnWikiJsonReader $reader;
	private MessageLocalizer $messageLocalizer;

	public function __construct(
		OnWikiJsonReader $reader,
		MessageLocalizer $messageLocalizer
	) {
		$this->reader = $reader;
		$this->messageLocalizer = $messageLocalizer;
	}

	/**
	 * Return on-wiki preferences overrides with pre-resolved message texts.
	 *
	 * @param string $langCode Language code for message resolution
	 * @return array{overrides: ?array, messages: array<string, string>}
	 */
	public function getOverrides( string $langCode ): array {
		$overrides = $this->reader->read( self::PAGE_NAME );
		if ( $overrides === null ) {
			return [ 'overrides' => null, 'messages' => [] ];
		}

		$keys = self::extractMessageKeys( $overrides );
		$messages = [];
		foreach ( $keys as $key ) {
			$messages[$key] = $this->messageLocalizer->msg( $key )->inLanguage( $langCode )->plain();
		}

		return [
			'overrides' => $overrides,
			'messages' => $messages
		];
	}

	/**
	 * Extract i18n message keys from an overrides config.
	 *
	 * @param array $config
	 * @return string[]
	 */
	public static function extractMessageKeys( array $config ): array {
		$keys = [];
		$collectMsg = static function ( array $item, string ...$fields ) use ( &$keys ): void {
			foreach ( $fields as $field ) {
				if ( is_string( $item[$field] ?? null ) ) {
					$keys[] = $item[$field];
				}
			}
		};

		foreach ( $config['sections'] ?? [] as $section ) {
			if ( is_array( $section ) ) {
				$collectMsg( $section, 'labelMsg' );
			}
		}

		foreach ( $config['preferences'] ?? [] as $pref ) {
			if ( !is_array( $pref ) ) {
				continue;
			}
			$collectMsg( $pref, 'labelMsg', 'descriptionMsg' );
			foreach ( $pref['options'] ?? [] as $opt ) {
				if ( is_array( $opt ) ) {
					$collectMsg( $opt, 'labelMsg' );
				}
			}
		}

		return array_values( array_unique( $keys ) );
	}
}
