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

	/**
	 * Render page-related tools
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
				$viewshtml = $this->skin->getMenuData( 'views', $contentNavigation[ 'views' ] ?? [] );
				$actionshtml = $this->skin->getMenuData( 'actions', $contentNavigation[ 'actions' ] ?? [] );
				$namespaceshtml = $this->skin->getMenuData( 'namespaces', $contentNavigation[ 'namespaces' ] ?? [] );
				$variantshtml = $this->skin->getMenuData( 'variants', $contentNavigation[ 'variants' ] ?? [] );
				$toolboxhtml = $this->skin->getMenuData( 'tb',  $portals['TOOLBOX'] ?? [] );
			} else {
				$viewshtml = $parentData['data-portlets']['data-views'];
				$actionshtml = $parentData['data-portlets']['data-actions'];
				$namespaceshtml = $parentData['data-portlets']['data-namespaces'];
				$variantshtml = $parentData['data-portlets']['data-variants'];
				// Finds the toolbox in the sidebar.
				$sidebar = [ $parentData['data-portlets-sidebar']['data-portlets-first'],
					...$parentData['data-portlets-sidebar']['array-portlets-rest'] ];
				$toolboxhtml = null;
				foreach ( $sidebar as $portlet ) {
					if ( $portlet['id'] === 'p-tb' ) {
						$toolboxhtml = $portlet;
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
				'data-variants' => $variantshtml,
				'data-page-toolbox' => $toolboxhtml,
			];
		}

		return $props;
	}
}
