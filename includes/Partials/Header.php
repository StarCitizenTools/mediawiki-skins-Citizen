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

use MediaWiki\MediaWikiServices;
use MWException;
use Skin;
use SpecialPage;
use Title;

/**
 * Header partial of Skin Citizen
 * Generates the following partials:
 * - Personal Menu
 * - Extra Tools
 * - Search
 */
final class Header extends Partial {

	/**
	 * Build Personal Tools menu
	 *
	 * @return array
	 */
	public function buildPersonalMenu(): array {
		$personalTools = $this->skin->getPersonalToolsForMakeListItem(
			$this->skin->buildPersonalUrlsPublic()
		);
		$user = $this->skin->getUser();

		// Move the Echo badges out of default list
		if ( isset( $personalTools['notifications-alert'] ) ) {
			unset( $personalTools['notifications-alert'] );
		}
		if ( isset( $personalTools['notifications-notice'] ) ) {
			unset( $personalTools['notifications-notice'] );
		}

		if ( $user->isRegistered() ) {
			$personalTools = $this->addUserInfoToMenu( $personalTools, $user );
		}

		$personalMenu = $this->skin->getMenuData( 'personal', $personalTools );
		// Hide label for personal tools
		$personalMenu[ 'label-class' ] .= 'screen-reader-text';

		return [
			'msg-citizen-personalmenu-toggle' => $this->skin->msg( 'citizen-personalmenu-toggle' )->text(),
			'data-personal-menu-list' => $personalMenu,
		];
	}

	/**
	 * Echo notification badges button
	 *
	 * @return array
	 */
	public function getExtratools(): array {
		$personalTools = $this->skin->getPersonalToolsForMakeListItem(
			$this->skin->buildPersonalUrlsPublic()
		);

		// Create the Echo badges
		$extraTools = [];
		if ( isset( $personalTools['notifications-alert'] ) ) {
			$extraTools['notifications-alert'] = $personalTools['notifications-alert'];
		}
		if ( isset( $personalTools['notifications-notice'] ) ) {
			$extraTools['notifications-notice'] = $personalTools['notifications-notice'];
		}

		$html = $this->skin->getMenuData( 'personal-extra', $extraTools );

		// Hide label for extra tools
		$html[ 'label-class' ] .= 'screen-reader-text';

		return $html;
	}

	/**
	 * Render the search box
	 *
	 * @return array
	 * @throws MWException
	 */
	public function buildSearchProps(): array {
		$toggleMsg = $this->skin->msg( 'citizen-search-toggle' )->text();

		return [
			'msg-citizen-search-toggle' => $toggleMsg,
			'msg-citizen-search-toggle-shortcut' => $toggleMsg . ' [/]',
			'form-action' => $this->getConfigValue( 'Script' ),
			'html-input' => $this->skin->makeSearchInput( [ 'id' => 'searchInput' ] ),
			'msg-search' => $this->skin->msg( 'search' ),
			'page-title' => SpecialPage::getTitleFor( 'Search' )->getPrefixedDBkey(),
			'html-random-href' => Skin::makeSpecialUrl( 'Randompage' ),
			'msg-random' => $this->skin->msg( 'Randompage' )->text(),
		];
	}

	/**
	 * Adds user info to the personal menu
	 * Adds all explicit user groups as links to the personal menu
	 * Links are added right below the user page link
	 * Wrapped in an <li> element with id 'pt-usergroups'
	 *
	 * @param array $originalUrls The original personal tools urls
	 * @param User $user
	 *
	 * @return array
	 */
	private function addUserInfoToMenu( $originalUrls, $user ) {
		$personalTools = [];

		// This does not return implicit groups
		$groups = MediaWikiServices::getInstance()->getUserGroupManager()->getUserGroups( $user );

		// Return user edits
		$edits = MediaWikiServices::getInstance()->getUserEditTracker()->getUserEditCount( $user );

		// Add user group
		if ( !empty( $groups ) ) {
			$userPage = array_shift( $originalUrls );
			$groupLinks = [];
			$msgName = 'group-%s';

			foreach ( $groups as $group ) {
				$groupPage = Title::newFromText(
					$this->skin->msg( sprintf( $msgName, $group ) )->text(),
					NS_PROJECT
				);

				$groupLinks[$group] = [
					'msg' => sprintf( $msgName, $group ),
					// Nullpointer should not happen
					'href' => $groupPage->getLinkURL(),
					'tooltiponly' => true,
					'id' => sprintf( $msgName, $group ),
					// 'exists' => $groupPage->exists() - This will add an additional DB call
				];
			}

			$userGroups = [
				'id' => 'pt-usergroups',
				'links' => $groupLinks
			];
		}

		$userContris = [
			'text' => $this->skin->msg( 'usereditcount' )->numParams( sprintf( '%s', number_format( $edits, 0 ) ) ),
			'id' => 'pt-usercontris'
		];

		// The following defines the order of links added
		if ( isset( $userPage ) ) {
			$personalTools['userpage'] = $userPage;
		}
		if ( isset( $userGroups ) ) {
			$personalTools['usergroups'] = $userGroups;
		}
		$personalTools['usercontris'] = $userContris;

		foreach ( $originalUrls as $key => $url ) {
			$personalTools[$key] = $url;
		}

		return $personalTools;
	}
}
