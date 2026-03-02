<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen;

use MediaWiki\Content\TextContent;
use MediaWiki\Revision\RevisionLookup;
use MediaWiki\Revision\SlotRecord;
use MediaWiki\Title\TitleFactory;
use MessageLocalizer;

/**
 * Reads on-wiki preferences overrides from MediaWiki:Citizen-preferences.json
 * and resolves custom i18n message keys for the client-side module.
 */
class PreferencesConfigProvider {

	private const PAGE_NAME = 'Citizen-preferences.json';

	private RevisionLookup $revisionLookup;
	private TitleFactory $titleFactory;
	private MessageLocalizer $messageLocalizer;

	public function __construct(
		RevisionLookup $revisionLookup,
		TitleFactory $titleFactory,
		MessageLocalizer $messageLocalizer
	) {
		$this->revisionLookup = $revisionLookup;
		$this->titleFactory = $titleFactory;
		$this->messageLocalizer = $messageLocalizer;
	}

	/**
	 * Return on-wiki preferences overrides with pre-resolved message texts.
	 *
	 * @param string $langCode Language code for message resolution
	 * @return array{overrides: ?array, messages: array<string, string>}
	 */
	public function getOverrides( string $langCode ): array {
		$overrides = $this->readOnWikiConfig();
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
	 * Read and parse MediaWiki:Citizen-preferences.json.
	 *
	 * @return ?array Parsed JSON or null if the page is missing/invalid
	 */
	private function readOnWikiConfig(): ?array {
		$title = $this->titleFactory->newFromText(
			self::PAGE_NAME, NS_MEDIAWIKI
		);

		if ( !$title || !$title->exists() ) {
			return null;
		}

		$rev = $this->revisionLookup->getRevisionByTitle( $title );
		if ( !$rev ) {
			return null;
		}

		$content = $rev->getContent( SlotRecord::MAIN );
		if ( !( $content instanceof TextContent ) ) {
			return null;
		}

		$data = json_decode( $content->getText(), true );
		return is_array( $data ) ? $data : null;
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
