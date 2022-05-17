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
		// TODO: Remove notifications since MW 1.36 from buildPersonalUrls
		if ( isset( $personalTools['notifications-alert'] ) ) {
			unset( $personalTools['notifications-alert'] );
		}
		if ( isset( $personalTools['notifications-notice'] ) ) {
			unset( $personalTools['notifications-notice'] );
		}

		// TODO: Decorate personal menu for anon users in the future
		if ( $user->isRegistered() ) {
			$personalTools = $this->decoratePersonalMenu( $personalTools, $user );
		}

		$personalMenu = $this->skin->getPortletData( 'personal', $personalTools );

		// Hide label for personal tools
		$personalMenu[ 'label-class' ] = 'screen-reader-text';

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
	public function getNotifications(): array {
		$personalTools = $this->skin->getPersonalToolsForMakeListItem(
			$this->skin->buildPersonalUrlsPublic()
		);

		// Create the Echo badges
		$notifications = [];
		if ( isset( $personalTools['notifications-alert'] ) ) {
			$notifications['notifications-alert'] = $personalTools['notifications-alert'];
		}
		if ( isset( $personalTools['notifications-notice'] ) ) {
			$notifications['notifications-notice'] = $personalTools['notifications-notice'];
		}

		$html = $this->skin->getPortletData( 'notifications', $notifications );

		// Hide label for extra tools
		$html[ 'label-class' ] = 'screen-reader-text';

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
	 * Decorate the personal menu
	 *
	 * @param array $personalTools The original personal tools urls
	 * @param User $user
	 *
	 * @return array
	 */
	private function decoratePersonalMenu( $personalTools, $user ): array {
		$personalMenu = [
			'userpage' => $personalTools['userpage'] ?? null,
			'usergroups' => $this->getUserGroupsData( $personalTools, $user ),
			'usercontris' => $this->getUserContributionsData( $user ),
		];

		return array_merge( $personalMenu, $personalTools );
	}

	/**
	 * Build and return user groups data
	 *
	 * @param array $personalTools The original personal tools urls
	 * @param User $user
	 *
	 * @return array
	 */
	private function getUserGroupsData( $personalTools, $user ): array {
		// This does not return implicit groups
		$groups = MediaWikiServices::getInstance()->getUserGroupManager()->getUserGroups( $user );

		if ( empty( $groups ) ) {
			return null;
		}

		// Add user group
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

		return [
			'id' => 'pt-usergroups',
			'links' => $groupLinks
		];
	}

	/**
	 * Build and return user contributions data
	 *
	 * @param User $user
	 *
	 * @return array
	 */
	private function getUserContributionsData( $user ): array {
		// Return user edits
		$edits = MediaWikiServices::getInstance()->getUserEditTracker()->getUserEditCount( $user );

		if ( empty( $edits ) ) {
			return null;
		}

		return [
			'text' => $this->skin->msg( 'usereditcount' )
				->numParams( sprintf( '%s', number_format( $edits, 0 ) ) ),
			'id' => 'pt-usercontris'
		];
	}
}
