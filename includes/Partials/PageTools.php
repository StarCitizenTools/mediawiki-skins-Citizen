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

use Exception;
use ExtensionRegistry;
use MediaWiki\MediaWikiServices;

final class PageTools extends Partial {
	/** @var null|array for caching purposes */
	private $languages;

	/**
	 * Get page-related tools template data
	 * TODO: Break this down and clean up when 1.39
	 * TODO: Use SkinTemplateNavigation::Universal instead of dirty CSS when 1.39
	 *
	 * @param array $parentData
	 * @return array html
	 */
	public function getPageToolsData( $parentData ): array {
		$data = [
			'data-article-tools' => $this->getArticleToolsData( $parentData['data-portlets-sidebar'] ),
			'pagetools-visible' => $this->shouldShowPageTools(),
		];

		// There are edge cases where the menu is completely empty
		if ( $data['data-article-tools']['is-empty'] === false ) {
			$data['pagetools-overflow'] = true;
		}

		// NOTE: There must be a better way to handle this
		// Can be undefined index
		$languagesData = $parentData['data-portlets']['data-languages'] ?? [ 'is-empty' => true ];
		$variantsData = $parentData['data-portlets']['data-variants'] ?? [ 'is-empty' => true ];
		$hasLanguages = ( !$languagesData['is-empty'] || !$variantsData['is-empty'] );

		if ( $hasLanguages ) {
			$data += [
				'has-languages' => $hasLanguages,
				/*
				 * FIXME: ULS does not trigger for some reason, disabling it for now
				 * 'is-uls-ready' => $this->shouldShowULS( $variantsData ),
				 */
				'is-uls-ready' => false,
				'html-language-count' => $this->getLanguagesCount(),
			];
		}

		return $data;
	}

	/**
	 * Extract article tools from sidebar and return the data
	 *
	 * The reason we do this is because:
	 * 1. We removed some site-wide tools from the toolbar in Drawer.php,
	 * 	  now we just want the leftovers
	 * 2. Toolbox is not currently avaliable as data-portlet, have to wait
	 *    till Desktop Improvements
	 *
	 * @param array sidebarData
	 * @return bool
	 */
	private function getArticleToolsData( $sidebarData ) {
		$data = [
			'is-empty' => true,
		];

		foreach ( $sidebarData['array-portlets-rest'] as $portlet ) {
			if ( $portlet['id'] === 'p-tb' ) {
				$data = $portlet;
				$data['is-empty'] = false;
				break;
			}
		}

		return $data;
	}

	/**
	 * Check if views and actions should show
	 *
	 * Possible visibility conditions:
	 * * true: always visible (bool)
	 * * false: never visible (bool)
	 * * 'login': only visible if logged in (string)
	 * * 'permission-*': only visible if user has permission
	 *   e.g. permission-edit = only visible if user can edit pages
	 *
	 * @return bool
	 */
	private function shouldShowPageTools(): bool {
		$condition = $this->getConfigValue( 'CitizenShowPageTools' );
		$user = $this->user;

		// Login-based condition, return true if condition is met
		if ( $condition === 'login' ) {
			$condition = $user->isRegistered();
		}

		// Permission-based condition, return true if condition is met
		if ( is_string( $condition ) && strpos( $condition, 'permission' ) === 0 ) {
			$permission = substr( $condition, 11 );
			try {
				$title = $this->title;
				$condition = MediaWikiServices::getInstance()->getPermissionManager()->userCan(
					$permission, $user, $title );
			} catch ( Exception $e ) {
				$condition = false;
			}
		}

		return (bool)$condition;
	}

	/**
	 * Check if UniversalLanguageSelector can be used to replace the language menu
	 *
	 * @param array $variantsData
	 * @return bool
	 */
	private function shouldShowULS( $variantsData ): bool {
		// ULS does not support variants
		if ( !$variantsData['is-empty'] ) {
			return false;
		}

		return ExtensionRegistry::getInstance()->isLoaded( 'UniversalLanguageSelector' );
	}

	/**
	 * Count languages avaliable
	 * TODO: Consider having an option to count for variants?
	 *
	 * @return int
	 */
	private function getLanguagesCount(): int {
		if ( $this->languages === null ) {
			$this->languages = $this->skin->getLanguages();
		}

		return count( $this->languages );
	}
}
