<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

/**
 * Component interface for managing Citizen-modified components
 *
 * @internal
 */
interface CitizenComponent {

	public function getTemplateData(): array;
}
