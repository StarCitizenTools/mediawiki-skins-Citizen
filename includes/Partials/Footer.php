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

namespace Citizen\Partials;

/**
 * Footer partial of Skin Citizen
 */
final class Footer extends Partial {

	/**
	 * Get rows that make up the footer
	 * @return array for use in Mustache template describing the footer elements.
	 */
	public function getFooterData(): array {
		$footerLinks = $this->skin->getFooterLinksPublic();
		$lastMod = null;

		// Get last modified message
		if ( $footerLinks['info']['lastmod'] && isset( $footerLinks['info']['lastmod'] ) ) {
			$lastMod = $footerLinks['info']['lastmod'];
		}

		return [
			'html-lastmodified' => $lastMod,
			'array-footer-rows' => $this->getFooterRows( $footerLinks ),
			'array-footer-icons' => $this->getFooterIcons(),
			'msg-citizen-footer-desc' => $this->skin->msg( 'citizen-footer-desc' )->text(),
			'msg-citizen-footer-tagline' => $this->skin->msg( 'citizen-footer-tagline' )->text(),
		];
	}

	/**
	 * The footer rows
	 *
	 * @param array $footerLinks
	 * @return array
	 */
	private function getFooterRows( array $footerLinks ) {
		$footerRows = [];

		foreach ( $footerLinks as $category => $links ) {
			$items = [];
			$rowId = "footer-$category";

			// Unset footer-info
			if ( $category === 'info' ) {
				continue;
			}

			foreach ( $links as $key => $link ) {
				// Link may be null. If so don't include it.
				if ( $link ) {
					$items[] = [
						'id' => "$rowId-$key",
						'html' => $link,
					];
				}
			}

			$footerRows[] = [
				'id' => $rowId,
				'className' => null,
				'array-items' => $items
			];
		}

		// Append footer-info after links
		if ( isset( $footerLinks['info'] ) ) {
			$items = [];
			$rowId = "footer-info";

			foreach ( $footerLinks['info'] as $key => $link ) {
				// Don't include lastmod and null link
				if ( $key !== 'lastmod' && $link ) {
					$items[] = [
						'id' => "$rowId-$key",
						'html' => $link,
					];
				}
			}

			$footerRows[] = [
				'id' => $rowId,
				'className' => null,
				'array-items' => $items
			];
		}

		return $footerRows;
	}

	/**
	 * Footer Icons
	 *
	 * @return array|array[]
	 */
	private function getFooterIcons() {
		// If footer icons are enabled append to the end of the rows
		$footerIcons = $this->skin->getFooterIconsPublic();
		if ( empty( $footerIcons ) ) {
			return [];
		}

		$items = [];
		foreach ( $footerIcons as $blockName => $blockIcons ) {
			$html = '';
			foreach ( $blockIcons as $icon ) {
				// Only output icons which have an image.
				// For historic reasons this mimics the `icononly` option
				// for BaseTemplate::getFooterIcons.
				if ( is_string( $icon ) || isset( $icon['src'] ) ) {
					$html .= $this->skin->makeFooterIcon( $icon );
				}
			}
			// For historic reasons this mimics the `icononly` option
			// for BaseTemplate::getFooterIcons. Empty rows should not be output.
			if ( $html ) {
				$items[] = [
					'id' => 'footer-' . htmlspecialchars( $blockName ) . 'ico',
					'html' => $html,
				];
			}
		}

		return [
			[
				'id' => 'footer-icons',
				'className' => 'noprint',
				'array-items' => $items,
			]
		];
	}
}
