<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

/**
 * Component interface for managing Citizen-modified components
 *
 * @internal
 */
interface CitizenComponent {
	/**
	 * @return array of Mustache compatible data
	 */
	public function getTemplateData(): array;
}
