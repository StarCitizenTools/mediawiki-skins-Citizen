<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MediaWiki\MediaWikiServices;
use MediaWiki\Title\Title;

/**
 * CitizenComponentPageHeading component
 * FIXME: Need unit test
 */
class CitizenComponentPageHeading implements CitizenComponent {
	/** @var Title */
	private $title;

	/** @var string */
	private $titleData;

	/**
	 * @param Title $title
	 * @param string $titleData
	 */
	public function __construct( Title $title, string $titleData ) {
		$this->title = $title;
		$this->titleData = $titleData;
	}

	/**
	 * Check if the current page is in the content namespace
	 *
	 * @return bool
	 */
	private function shouldAddParenthesis(): bool {
		$ns = $this->title->getNamespace();
		$contentNs = MediaWikiServices::getInstance()->getNamespaceInfo()->getContentNamespaces();
		return in_array( $ns, $contentNs );
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		$titleData = $this->titleData;

		if ( $this->shouldAddParenthesis() ) {
			// Look for the </span> to ensure that it is the last parenthesis of the title
			$pattern = '/\s(\(.+\))<\/span>/';
			$replacement = ' <span class="mw-page-title-parenthesis">$1</span></span>';
			$titleData = preg_replace( $pattern, $replacement, $titleData );
		}

		return [
			'html-title-heading' => $titleData
		];
	}
}
