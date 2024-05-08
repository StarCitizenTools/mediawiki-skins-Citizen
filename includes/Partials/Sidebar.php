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

/**
 * Based on SkinComponentLastModified.php in MediaWiki core
 * TODO: Use core instead when update to MW 1.43
 */
final class Sidebar extends Partial {
	/** @var Language */
	private $language;

	/** @var string|null|false */
	private $timestamp;

	/**
	 * Get sidebar template data
	 *
	 * @param array $parentData
	 * @return array html
	 */
	public function getSidebarData( $parentData ): array {
		$data = [
			'data-sidebar-lastmod' => $this->getLastModData()
		];

		return $data;
	}

	/**
	 * Build last modified template data
	 *
	 * @return array|null
	 */
	private function getLastModData() {
		$skin = $this->skin;
		$out = $this->out;
		$user = $this->user;
		$title = $this->title;
		$language = $skin->getLanguage();
		$timestamp = $out->getRevisionTimestamp();

		if ( $timestamp ) {
			$d = $language->userDate( $timestamp, $user );
			$t = $language->userTime( $timestamp, $user );
			$s = ' ' . $skin->msg( 'lastmodifiedat', $d, $t )->parse();
		} else {
			return;
		}

		$items = [
			'id' => 'lm-time',
			'class' => 'mw-list-item',
			'array-links' => [
				'array-attributes' => [
					[
						'key' => 'id',
						'value' => 'citizen-lastmod-relative'
					],
					[
						'key' => 'href',
						'value' => $title->getLocalURL( [ 'diff' => '' ] )
					],
					[
						'key' => 'title',
						'value' => $s
					],
					[
						'key' => 'data-timestamp',
						'value' => wfTimestamp( TS_UNIX, $timestamp )
					]
				],
				'icon' => 'history',
				'text' => $d
			]
		];

		return [
			'id' => 'citizen-sidebar-lastmod',
			'label' => $skin->msg( 'citizen-page-info-lastmod' ),
			'array-list-items' => $items
		];
	}
}
