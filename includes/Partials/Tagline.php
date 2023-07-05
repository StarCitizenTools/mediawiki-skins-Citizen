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
use MWTimestamp;
use SpecialPage;
use Title;
use User;
use Wikimedia\IPUtils;

/**
 * Tagline partial of Skin Citizen
 */
final class Tagline extends Partial {

	/**
	 * Get tagline message
	 *
	 * @return string
	 */
	public function getTagline() {
		$skin = $this->skin;
		$out = $this->out;
		$title = $this->title;

		$shortdesc = $out->getProperty( 'shortdesc' );
		$tagline = '';

		if ( $title ) {
			// Use short description if there is any
			// from Extension:ShortDescription
			if ( $shortdesc ) {
				$tagline = $shortdesc;
			} else {
				$namespaceText = $title->getNsText();
				// Check if namespaceText exists
				// Return null if main namespace or not defined
				if ( $namespaceText ) {
					$msg = $skin->msg( 'citizen-tagline-ns-' . strtolower( $namespaceText ) );
					// Use custom message if exists
					if ( !$msg->isDisabled() ) {
						$tagline = $msg->parse();
					} else {
						if ( $title->isSpecialPage() ) {
							// No tagline if special page
							$tagline = '';
						} elseif ( $title->isTalkPage() ) {
							// Use generic talk page message if talk page
							$tagline = $skin->msg( 'citizen-tagline-ns-talk' )->parse();
						} elseif ( ( $title->inNamespace( NS_USER ) || ( defined( 'NS_USER_WIKI' ) && $title->inNamespace( NS_USER_WIKI ) ) || ( defined( 'NS_USER_WIKI' ) && $title->inNamespace( NS_USER_PROFILE ) ) ) && !$title->isSubpage() ) {
							// Build user tagline if it is a top-level user page
							$tagline = $this->buildUserTagline( $title );
						} elseif ( !$skin->msg( 'citizen-tagline' )->isDisabled() ) {
							$tagline = $skin->msg( 'citizen-tagline' )->parse();
						} else {
							// Fallback to site tagline
							$tagline = $skin->msg( 'tagline' )->text();
						}
					}
				} elseif ( !$skin->msg( 'citizen-tagline' )->isDisabled() ) {
					$tagline = $skin->msg( 'citizen-tagline' )->parse();
				} else {
					$tagline = $skin->msg( 'tagline' )->text();
				}
			}
		}

		// Apply language variant conversion
		if ( !empty( $tagline ) ) {
			$services = MediaWikiServices::getInstance();
			$langConv = $services
					->getLanguageConverterFactory()
					->getLanguageConverter( $services->getContentLanguage() );
			$tagline = $langConv->convert( $tagline );
		}

		return $tagline;
	}

	/**
	 * Return user tagline message
	 *
	 * @param Title $title
	 * @return string
	 */
	private function buildUserTagline( $title ) {
		$user = $this->buildPageUserObject( $title );
		if ( $user ) {
			$skin = $this->skin;
			$tagline = '<div id="citizen-tagline-user">';
			$editCount = $user->getEditCount();
			$regDate = $user->getRegistration();
			$gender = MediaWikiServices::getInstance()->getGenderCache()->getGenderOf( $user, __METHOD__ );

			if ( $gender === 'male' ) {
				$msgGender = '♂';
			} elseif ( $gender === 'female' ) {
				$msgGender = '♀';
			}
			if ( isset( $msgGender ) ) {
				$tagline .= "<span id=\"citizen-tagline-user-gender\" data-user-gender=\"$gender\">$msgGender</span>";
			}

			if ( $editCount ) {
				$msgEditCount = $skin->msg( 'usereditcount' )->numParams( sprintf( '%s', number_format( $editCount, 0 ) ) );
				$editCountHref = SpecialPage::getTitleFor( 'Contributions', $user )->getLocalURL();
				$tagline .= "<span id=\"citizen-tagline-user-editcount\" data-user-editcount=\"$editCount\"><a href=\"$editCountHref\">$msgEditCount</a></span>";
			}

			if ( is_string( $regDate ) ) {
				$regDateTs = wfTimestamp( TS_UNIX, $regDate );
				$msgRegDate = $skin->msg( 'citizen-tagline-user-regdate', $skin->getLanguage()->userDate( new MWTimestamp( $regDate ), $skin->getUser() ), $user );
				$tagline .= "<span id=\"citizen-tagline-user-regdate\" data-user-regdate=\"$regDateTs\">$msgRegDate</span>";
			}

			$tagline .= '</div>';
			return $tagline;
		}
		return null;
	}

	/**
	 * Return new User object based on username or IP address.
	 * Based on MinervaNeue
	 *
	 * @param Title $title
	 * @return User|null
	 */
	private function buildPageUserObject( $title ) {
		$titleText = $title->getText();
		$user = $this->user;

		if ( IPUtils::isIPAddress( $titleText ) ) {
			return $user->newFromAnyId( null, $titleText, null );
		}

		$pageUserId = $user->idFromName( $titleText );
		if ( $pageUserId ) {
			return $user->newFromId( $pageUserId );
		}

		return null;
	}
}
