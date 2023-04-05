<?php
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

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Partials;

use MediaWiki\MediaWikiServices;

/**
 * Title partial of Skin Citizen
 */
final class PageTitle extends Partial {
	/**
	 * Wrap text within parenthesis with a span tag
	 *
	 * @param string $data title of the page
	 * @return string
	 */
	public function decorateTitle( $data ) {
		if ( $this->shouldAddParenthesis() ) {
			$pattern = '/(\(.+\))/';
			$replacement = '<span class="mw-page-title-parenthesis">$1</span>';
			return preg_replace( $pattern, $replacement, $data );
		}
		return $data;
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
}
