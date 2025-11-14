<?php

declare( strict_types=1 );

/**
 * Citizen - A responsive skin developed for the Star Citizen Wiki
 *
 * This file is part of Citizen.
 *
 * Citizen is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Citizen is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Citizen.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @file
 * @ingroup Skins
 */

namespace MediaWiki\Skins\Citizen\Partials;

use MediaWiki\Output\OutputPage;
use MediaWiki\Skins\Citizen\GetConfigTrait;
use MediaWiki\Skins\Citizen\SkinCitizen;
use MediaWiki\Title\Title;
use MediaWiki\User\User;

/**
 * The base class for all skin partials
 * TODO: Use SkinComponentRegistryContext
 */
abstract class Partial {

	use GetConfigTrait;

	protected OutputPage $out;

	protected ?Title $title;

	protected User $user;

	public function __construct(
		protected readonly SkinCitizen $skin
	) {
		$this->out = $skin->getOutput();
		$this->title = $this->out->getTitle();
		$this->user = $this->out->getUser();
	}
}
