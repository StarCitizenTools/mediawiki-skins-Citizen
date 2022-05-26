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

use Html;
use MediaWiki\MediaWikiServices;

/**
 * Title partial of Skin Citizen
 */
final class Title extends Partial {

	/**
	 * Build the HTML for html-title-heading
	 * Backported from 1.39 to 1.35
	 * TODO: Deprecate this when we move to 1.39 and T306440 is resolved
	 *
	 * @param array $parentData
	 * @param Title $title
	 * @return string html
	 */
	public function buildTitle( $parentData, $title ) {
		// @since 1.38
		$blankedHeading = $parentData['is-title-blank'] ?? false;
		$htmlTitle = $parentData['html-title'];

		$data = Html::rawElement(
			 'h1',
			 [
				 'id' => 'firstHeading',
				 'class' => 'firstHeading mw-first-heading',
				 'style' => $blankedHeading ? 'display: none' : null
			 ] + $this->getUserLanguageAttributes(),
			 $this->decorateTitle( $htmlTitle )
		 );

		return $data;
	}

	/**
	 * Wrap text within parenthesis with a span tag
	 *
	 * @param string $html title of the page
	 * @return string html
	 */
	private function decorateTitle( $html ) {
		$pattern = '/(\(.+\))/';
		$replacement = '<span class="firstHeading-parenthesis">$1</span>';
		$$html = preg_replace( $pattern, $replacement, $html );

		return $html;
	}

	/**
	 * From core because it is private
	 *
	 * @return array
	 */
	private function getUserLanguageAttributes() {
		$userLang = $this->skin->getLanguage();
		$userLangCode = $userLang->getHtmlCode();
		$userLangDir = $userLang->getDir();
		$contLang = MediaWikiServices::getInstance()->getContentLanguage();
		if (
			$userLangCode !== $contLang->getHtmlCode() ||
			$userLangDir !== $contLang->getDir()
		) {
			return [
			'lang' => $userLangCode,
			'dir' => $userLangDir,
			];
		}
		return [];
	}
}
