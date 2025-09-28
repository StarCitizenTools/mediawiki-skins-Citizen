<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MediaWiki\Config\Config;
use MediaWiki\Registration\ExtensionRegistry;
use MediaWiki\Skin\SkinComponentUtils;
use MessageLocalizer;

/**
 * CitizenComponentSearchBox component
 */
class CitizenComponentSearchBox implements CitizenComponent {

	public function __construct(
		private Config $config,
		private MessageLocalizer $localizer,
		private ExtensionRegistry $extensionRegistry,
		private array $searchBoxData
	) {
	}

	/**
	 * Get the keyboard hint data
	 */
	private function getKeyboardHintData(): array {
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
	 */
	private function getFooterMessage(): string {
		$isCirrusSearchExtensionEnabled = $this->extensionRegistry->isLoaded( 'CirrusSearch' );
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
			'html-random-href' => SkinComponentUtils::makeSpecialUrl( 'Randompage' ),
			'id-controls' => $this->config->get( 'CitizenEnableCommandPalette' ) ? false : 'citizen-search__card',
		];
		return $searchBoxData;
	}
}
