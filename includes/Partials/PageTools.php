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

use Exception;
use MediaWiki\MediaWikiServices;
use SkinTemplate;

final class PageTools extends Partial {
	/** @var null|array for caching purposes */
	private $languages;

	/**
	 * Render page-related tools
	 * TODO: Break this down and clean up when 1.39
	 *
	 * Possible visibility conditions:
	 * * true: always visible (bool)
	 * * false: never visible (bool)
	 * * 'login': only visible if logged in (string)
	 * * 'permission-*': only visible if user has permission
	 *   e.g. permission-edit = only visible if user can edit pages
	 *
	 * @param array $parentData
	 * @return array html
	 */
	public function buildPageTools( $parentData ): array {
		$condition = $this->getConfigValue( 'CitizenShowPageTools' );
		$contentNavigation = $this->skin->buildContentNavigationUrlsPublic();
		$portals = $this->skin->buildSidebar();
		$props = [];

		// Login-based condition, return true if condition is met
		if ( $condition === 'login' ) {
			$condition = $this->skin->getUser()->isRegistered();
		}

		// Permission-based condition, return true if condition is met
		if ( is_string( $condition ) && strpos( $condition, 'permission' ) === 0 ) {
			$permission = substr( $condition, 11 );
			try {
				$condition = MediaWikiServices::getInstance()->getPermissionManager()->userCan(
					$permission, $this->skin->getUser(), $this->skin->getTitle() );
			} catch ( Exception $e ) {
				$condition = false;
			}
		}

		if ( $condition === true ) {

			if ( !method_exists( SkinTemplate::class, 'runOnSkinTemplateNavigationHooks' ) ) {
				$viewshtml = $this->skin->getPortletData( 'views', $contentNavigation[ 'views' ] ?? [] );
				$actionshtml = $this->skin->getPortletData( 'actions', $contentNavigation[ 'actions' ] ?? [] );
				$namespaceshtml = $this->skin->getPortletData( 'namespaces', $contentNavigation[ 'namespaces' ] ?? [] );
				$variantshtml = $this->skin->getPortletData( 'variants', $contentNavigation[ 'variants' ] ?? [] );
				$toolboxhtml = $this->skin->getPortletData( 'tb',  $portals['TOOLBOX'] ?? [] );
				$languageshtml = $this->skin->getPortletData( 'lang',  $portals['LANGUAGES'] ?? [] );
			} else {
				$viewshtml = $parentData['data-portlets']['data-views'];
				$actionshtml = $parentData['data-portlets']['data-actions'];
				$namespaceshtml = $parentData['data-portlets']['data-namespaces'];
				$variantshtml = $parentData['data-portlets']['data-variants'];
				// data-languages can be undefined index
				$languageshtml = $parentData['data-portlets']['data-languages'] ?? [];
				// For some reason core does not set this
				if ( empty( $languageshtml ) ) {
					$languageshtml['is-empty'] = true;
				}
				// Finds the toolbox in the sidebar.
				// The reason we do this is because we removed some site-wide tools from
				// the toolbar in Drawer.php, now we just want the leftovers
				$sidebar = [ $parentData['data-portlets-sidebar']['data-portlets-first'],
					...$parentData['data-portlets-sidebar']['array-portlets-rest'] ];
				$toolboxhtml = [
					'is-empty' => true,
				];
				foreach ( $sidebar as $portlet ) {
					if ( $portlet['id'] === 'p-tb' ) {
						$toolboxhtml = $portlet;
						$toolboxhtml['is-empty'] = false;
						break;
					}
				}
			}

			if ( $viewshtml ) {
				$viewshtml[ 'label-class' ] ??= '';
				$viewshtml[ 'label-class' ] .= 'screen-reader-text';
			}

			if ( $actionshtml ) {
				$actionshtml[ 'label-class' ] ??= '';
				$actionshtml[ 'label-class' ] .= 'screen-reader-text';
			}

			if ( $namespaceshtml ) {
				$namespaceshtml[ 'label-class' ] ??= '';
				$namespaceshtml[ 'label-class' ] .= 'screen-reader-text';
			}

			$props = [
				'data-page-views' => $viewshtml,
				'data-page-actions' => $actionshtml,
				'data-namespaces' => $namespaceshtml,
				'has-languages' => $this->shouldShowLanguages( $languageshtml, $variantshtml ),
				'data-languages' => $languageshtml,
				'data-variants' => $variantshtml,
				'data-page-toolbox' => $toolboxhtml,
			];
		}

		return $props;
	}

	/**
	 * Calls getLanguages with caching.
	 *
	 * Based on Vector
	 *
	 * @return array
	 */
	private function getLanguagesCached(): array {
		$skin = $this->skin;

		if ( $this->languages === null ) {
			$this->languages = $skin->getLanguages();
		}
		return $this->languages;
	}

	/**
	 * This should be upstreamed to the Skin class in core once the logic is finalized.
	 * Returns false if the page is a special page without any languages, or if an action
	 * other than view is being used.
	 *
	 * Based on Vector
	 *
	 * @return bool
	 */
	private function canHaveLanguages(): bool {
		$skin = $this->skin;

		if ( $skin->getContext()->getActionName() !== 'view' ) {
			return false;
		}
		$title = $skin->getTitle();
		// Defensive programming - if a special page has added languages explicitly, best to show it.
		if ( $title && $title->isSpecialPage() && empty( $this->getLanguagesCached() ) ) {
			return false;
		}
		return true;
	}

	/**
	 * Show or hide the language button
	 *
	 * @param array $languageshtml
	 * @param array $variantshtml
	 * @return bool
	 */
	private function shouldShowLanguages( $languageshtml, $variantshtml ): bool {
		if ( !$this->canHaveLanguages() ) {
			return false;
		}

		// If both language and variant menu contains nothing
		if ( $languageshtml['is-empty'] && $variantshtml['is-empty'] ) {
			return false;
		}

		return true;
	}
}
