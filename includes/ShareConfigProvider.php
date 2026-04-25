<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen;

use MediaWiki\Content\TextContent;
use MediaWiki\Revision\RevisionLookup;
use MediaWiki\Revision\SlotRecord;
use MediaWiki\Title\TitleFactory;

/**
 * Reads on-wiki share service configuration from MediaWiki:Citizen-share-services.json.
 */
class ShareConfigProvider {

	private const PAGE_NAME = 'Citizen-share-services.json';

	public function __construct(
		private readonly RevisionLookup $revisionLookup,
		private readonly TitleFactory $titleFactory
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
		$data = $this->readOnWikiConfig();
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

		$normalized = [];
		foreach ( $services as $service ) {
			if ( is_array( $service ) ) {
				$normalized[] = $service;
			}
		}

		return $normalized;
	}

	/**
	 * Read and parse MediaWiki:Citizen-share-services.json.
	 *
	 * @return ?array Parsed JSON or null if the page is missing/invalid
	 */
	private function readOnWikiConfig(): ?array {
		$title = $this->titleFactory->newFromText(
			self::PAGE_NAME,
			NS_MEDIAWIKI
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
