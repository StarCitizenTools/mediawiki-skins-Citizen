<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MediaWiki\Registration\ExtensionRegistry;
use MediaWiki\Skin\SkinComponentUtils;
use MessageLocalizer;

/**
 * CitizenComponentSearchBox component
 */
class CitizenComponentSearchBox implements CitizenComponent {
	/** @var MessageLocalizer */
	private $localizer;

	/** @var array */
	private $searchBoxData;

	/**
	 * @param MessageLocalizer $localizer
	 * @param array $searchBoxData
	 */
	public function __construct(
		MessageLocalizer $localizer,
		array $searchBoxData
	) {
		$this->localizer = $localizer;
		$this->searchBoxData = $searchBoxData;
	}

	/**
	 * Get the keyboard hint data
	 * @return array
	 */
	private function getKeyboardHintData() {
		$data = [];
		// There is probably a cleaner way to handle this
		$map = [
			'↑ ↓' => $this->localizer->msg( "citizen-search-keyhint-select" )->text(),
			'/' => $this->localizer->msg( "citizen-search-keyhint-open" )->text(),
			'Esc' => $this->localizer->msg( "citizen-search-keyhint-exit" )->text()
		];

		foreach ( $map as $key => $label ) {
			$keyhint = new CitizenComponentKeyboardHint( $label, $key );
			$data[] = $keyhint->getTemplateData();
		}
		return $data;
	}

	/**
	 * Get the footer message
	 * @return string
	 */
	private function getFooterMessage(): string {
		$isCirrusSearchExtensionEnabled = ExtensionRegistry::getInstance()->isLoaded( 'CirrusSearch' );
		$searchBackend = $isCirrusSearchExtensionEnabled ? 'cirrussearch' : 'mediawiki';
		return $this->localizer->msg(
			'citizen-search-poweredby',
			$this->localizer->msg( "citizen-search-poweredby-$searchBackend" )
		)->text();
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		$searchBoxData = $this->searchBoxData + [
			'array-keyboard-hint' => $this->getKeyboardHintData(),
			'msg-citizen-search-footer' => $this->getFooterMessage(),
			'msg-citizen-search-toggle-shortcut' => '[/]',
			'html-random-href' => SkinComponentUtils::makeSpecialUrl( 'Randompage' )
		];
		return $searchBoxData;
	}
}
