<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen;

use MediaWiki\Content\TextContent;
use MediaWiki\Revision\RevisionLookup;
use MediaWiki\Revision\SlotRecord;
use MediaWiki\Title\TitleFactory;

/**
 * Reads and parses a JSON document stored on-wiki under the MediaWiki namespace.
 *
 * Shared by the share and preferences config providers, which each treat
 * a specific `MediaWiki:Citizen-*.json` page as their override source.
 */
class OnWikiJsonReader {

	public function __construct(
		private readonly RevisionLookup $revisionLookup,
		private readonly TitleFactory $titleFactory
	) {
	}

	/**
	 * @param string $pageName Title text under the MediaWiki namespace
	 *   (e.g. 'Citizen-share-services.json').
	 * @return ?array Parsed JSON if the page exists, contains text, and
	 *   parses to an array. Null for any other case (missing page, no
	 *   revision, non-text content, invalid JSON, scalar root).
	 */
	public function read( string $pageName ): ?array {
		$title = $this->titleFactory->newFromText( $pageName, NS_MEDIAWIKI );
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
}
