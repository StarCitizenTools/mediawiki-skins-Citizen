<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MediaWiki\Html\Html;
use MediaWiki\Linker\Linker;
use MessageLocalizer;

/**
 * CitizenComponentLink component
 */
class CitizenComponentLink implements CitizenComponent {

	public function __construct(
		private string $href,
		private string $text,
		private ?string $icon = null,
		private ?MessageLocalizer $localizer = null,
		private ?string $accessKeyHint = null
	) {
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		$localizer = $this->localizer;
		$accessKeyHint = $this->accessKeyHint;
		$additionalAttributes = [];
		if ( $localizer ) {
			$msg = $localizer->msg( $accessKeyHint . '-label' );
			if ( $msg->exists() ) {
				$additionalAttributes[ 'aria-label' ] = $msg->text();
			}
		}
		return [
			'href' => $this->href,
			'icon' => $this->icon,
			'text' => $this->text,
			'array-attributes' => [
				[
					'key' => 'href',
					'value' => $this->href
				]
			],
			'html-attributes' => $localizer && $accessKeyHint ? Html::expandAttributes(
				Linker::tooltipAndAccesskeyAttribs(
					$accessKeyHint,
					[],
					[],
					$localizer
				) + $additionalAttributes
			) : '',
		];
	}
}
