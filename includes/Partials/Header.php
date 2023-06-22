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
use Skin;
use User;

/**
 * Header partial of Skin Citizen
 * Generates the following partials:
 * - User Menu
 * - Search
 */
final class Header extends Partial {
	/**
	 * Decorate search box template data
	 *
	 * @param array $searchBoxData original data-search-box
	 * @return array
	 */
	public function decorateSearchBoxData( $searchBoxData ): array {
		return $searchBoxData += [
			'msg-citizen-search-toggle-shortcut' => '[/]',
			'html-random-href' => Skin::makeSpecialUrl( 'Randompage' ),
		];
	}

	/**
	 * Get the user info template data for user menu
	 *
	 * TODO: Consider dropping Menu.mustache since the DOM doesn't make much sense
	 *
	 * @param $userPageData data-portlets.data-user-page
	 * @return array
	 */
	public function getUserInfoData( $userPageData ): array {
		$isRegistered = $this->user->isRegistered();

		$html = $this->getUserPageHTML( $isRegistered, $userPageData );

		if ( $isRegistered ) {
			$html .= $this->getUserGroupsHTML();
			$html .= $this->getUserContributionsHTML();
		}

		return [
			'id' => 'p-user-info',
			'html-items' => $html,
		];
	}

	/**
	 * Get the user page HTML
	 *
	 * @param bool $isRegistered
	 * @param array $userPageData data-portlets.data-user-page
	 * @return string
	 */
	private function getUserPageHTML( $isRegistered, $userPageData ): ?string {
		if ( $isRegistered ) {
			$realname = $this->user->getRealName();
			if ( !empty( $realname ) ) {
				$username = $this->user->getName();
				$innerHtml = <<<HTML
					<div id="pt-userpage-realname">$realname</div>
					<div id="pt-userpage-username">$username</div>
				HTML;
				// Dirty but it works
				$html = str_replace(
					">" . $username . "<",
					">" . $innerHtml . "<",
					$userPageData['html-items']
				);
			} else {
				$html = $userPageData['html-items'];
			}
		} else {
			// There must be a cleaner way to do this
			$msg = $this->skin->msg( 'notloggedin' )->text();
			$tooltip = $this->skin->msg( 'tooltip-pt-anonuserpage' )->text();
			$html = <<<HTML
				<li id="pt-anonuserpage" class="mw-list-item">
					<span title="$tooltip">$msg</span>
				</li>
			HTML;
		}

		return $html;
	}

	/**
	 * Get the user groups HTML
	 *
	 * @return string|null
	 */
	private function getUserGroupsHTML(): ?string {
		// This does not return implicit groups
		$groups = MediaWikiServices::getInstance()->getUserGroupManager()->getUserGroups( $this->user );

		if ( empty( $groups ) ) {
			return null;
		}

		$html = '';
		$msgName = 'group-%s-member';

		// There must be a cleaner way
		foreach ( $groups as $group ) {
			$id = sprintf( $msgName, $group );
			$msg = $this->skin->msg( $id )->text();
			$title = $this->title->newFromText(
					$msg,
					NS_PROJECT
				);
			if ( $msg ) {
				// Member names are in lowercase
				$msg = ucfirst( $msg );
			}
			if ( $title ) {
				$href = $title->getLinkURL();
				$html .= <<< HTML
					<li>
						<a href="$href" id="$id">$msg</a>
					</li>
				HTML;
			}
		}

		$html = sprintf( '<li id="pt-usergroups"><ul>%s</ul></li>', $html );

		return $html;
	}

	/**
	 * Get the user contributions HTML
	 *
	 * @return string|null
	 */
	private function getUserContributionsHTML(): ?string {
		// Return user edits
		$edits = MediaWikiServices::getInstance()->getUserEditTracker()->getUserEditCount( $this->user );

		if ( empty( $edits ) ) {
			return null;
		}

		$editsText = $this->skin->msg( 'usereditcount' )
			->numParams( sprintf( '%s', number_format( $edits, 0 ) ) );

		// There must be a cleaner way
		$html = '<li id="pt-usercontris">' . $editsText . '</li>';

		return $html;
	}
}
