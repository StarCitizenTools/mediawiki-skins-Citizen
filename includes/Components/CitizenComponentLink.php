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
	/** @var MessageLocalizer */
	private $localizer;
	/** @var string */
	private $icon;
	/** @var string */
	private $href;
	/** @var string */
	private $text;
	/** @var string */
	private $accessKeyHint;

	/**
	 * @param string $href
	 * @param string $text
	 * @param null|string $icon
	 * @param null|MessageLocalizer $localizer for generation of tooltip and access keys
	 * @param null|string $accessKeyHint will be used to derive HTML attributes such as title, accesskey
	 *   and aria-label ("$accessKeyHint-label")
	 */
	public function __construct( string $href, string $text, $icon = null, $localizer = null, $accessKeyHint = null ) {
		$this->href = $href;
		$this->text = $text;
		$this->icon = $icon;
		$this->localizer = $localizer;
		$this->accessKeyHint = $accessKeyHint;
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
