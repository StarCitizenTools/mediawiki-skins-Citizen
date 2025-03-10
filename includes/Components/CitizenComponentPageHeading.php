<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MediaWiki\MediaWikiServices;
use MediaWiki\Language\Language;
use MediaWiki\Output\OutputPage;
use MediaWiki\Skin\SkinComponentUtils;
use MediaWiki\StubObject\StubUserLang;
use MediaWiki\Title\Title;
use MediaWiki\User\User;
use MediaWiki\Utils\MWTimestamp;
use MessageLocalizer;
use Wikimedia\IPUtils;

/**
 * CitizenComponentPageHeading component
 * FIXME: Need unit test
 */
class CitizenComponentPageHeading implements CitizenComponent {

	private MediaWikiServices $services;

	public function __construct(
		private MessageLocalizer $localizer,
		private OutputPage $out,
		private Language|StubUserLang $pageLang,
		private Title $title,
		private string $titleData
	) {
		$this->services = MediaWikiServices::getInstance();
	}

	/**
	 * Return new User object based on username or IP address.
	 * Based on MinervaNeue
	 *
	 * @return User|null
	 */
	private function buildPageUserObject(): ?User {
		$titleText = $this->title->getText();

		if ( IPUtils::isIPAddress( $titleText ) ) {
			return $this->services->getUserFactory()->newFromName( $titleText );
		}

		$userIdentity = $this->services->getUserIdentityLookup()->getUserIdentityByName( $titleText );
		if ( $userIdentity && $userIdentity->isRegistered() ) {
			return $this->services->getUserFactory()->newFromId( $userIdentity->getId() );
		}

		return null;
	}

	/**
	 * Return user tagline message
	 *
	 * @return string
	 */
	private function buildUserTagline(): string {
		$localizer = $this->localizer;

		$user = $this->buildPageUserObject();
		if ( !$user ) {
			return '';
		}

		$tagline = '<div id="citizen-tagline-user">';
		$editCount = $user->getEditCount();
		$regDate = $user->getRegistration();
		$gender = $this->services->getGenderCache()->getGenderOf( $user, __METHOD__ );

		if ( $gender === 'male' ) {
			$msgGender = '♂';
		} elseif ( $gender === 'female' ) {
			$msgGender = '♀';
		}
		if ( isset( $msgGender ) ) {
			$tagline .= "<span id=\"citizen-tagline-user-gender\" data-user-gender=\"$gender\">$msgGender</span>";
		}

		if ( $editCount ) {
			$msgEditCount = $localizer->msg( 'usereditcount' )->numParams( sprintf( '%s', number_format( $editCount, 0 ) ) );
			$editCountHref = SkinComponentUtils::makeSpecialUrlSubpage( 'Contributions', $user );
			$tagline .= "<span id=\"citizen-tagline-user-editcount\" data-user-editcount=\"$editCount\"><a href=\"$editCountHref\">$msgEditCount</a></span>";
		}

		if ( is_string( $regDate ) ) {
			$regDateTs = wfTimestamp( TS_UNIX, $regDate );
			$msgRegDate = $localizer->msg( 'citizen-tagline-user-regdate', $this->pageLang->userDate( new MWTimestamp( $regDate ), $user ), $user );
			$tagline .= "<span id=\"citizen-tagline-user-regdate\" data-user-regdate=\"$regDateTs\">$msgRegDate</span>";
		}

		$tagline .= '</div>';
		return $tagline;
	}

	/**
	 * Return the modified page heading HTML
	 */
	private function getPageHeading(): string {
		$titleHtml = $this->titleData;
		if ( $this->title->isContentPage() ) {
			// Look for the </span> or </h1> to ensure that it is the last parenthesis of the title
			// </h1> occurs when the title is a displaytitle
			$pattern = '/\s?(\p{Ps}.+\p{Pe})<\/(span|h1)>/';
			$replacement = ' <span class="mw-page-title-parenthesis">$1</span></$2>';
			$titleHtml = preg_replace( $pattern, $replacement, $this->titleData );
		}
		return $titleHtml;
	}

	/**
	 * Determine the tagline for the current page based on various conditions:
	 * - If the namespace text is empty, check for specific tagline messages and return accordingly
	 * - If a custom tagline message exists for the namespace, return it
	 * - If the page is a special page or talk page, return specific messages
	 * - If it is a top-level user page, build and return the user tagline
	 * - Otherwise, fallback to the site tagline
	 */
	private function determineTagline(): string {
		$localizer = $this->localizer;
		$title = $this->title;

		$namespaceText = $title->getNsText();
		// Check if namespaceText exists
		if ( empty( $namespaceText ) ) {
			if ( !$localizer->msg( 'citizen-tagline' )->isDisabled() ) {
				return $localizer->msg( 'citizen-tagline' )->parse() ?? '';
			} else {
				return $localizer->msg( 'tagline' )->parse() ?? '';
			}
		}

		$msg = $localizer->msg( 'citizen-tagline-ns-' . strtolower( $namespaceText ) );
		// Use custom message if exists
		if ( !$msg->isDisabled() ) {
			return $msg->parse() ?? '';
		}

		if ( $title->isSpecialPage() ) {
			// No tagline if special page
			return '';
		}

		if ( $title->isTalkPage() ) {
			// Use generic talk page message if talk page
			return $localizer->msg( 'citizen-tagline-ns-talk' )->parse() ?? '';
		}

		$isRootUserPage = (
				$title->inNamespace( NS_USER ) ||
				( defined( 'NS_USER_WIKI' ) && $title->inNamespace( NS_USER_WIKI ) ) ||
				( defined( 'NS_USER_WIKI' ) && $title->inNamespace( NS_USER_PROFILE ) )
			) &&
			!$title->isSubpage();

		if ( $isRootUserPage ) {
			// Build user tagline if it is a top-level user page
			return $this->buildUserTagline();
		}

		// Fallback to site tagline
		return $localizer->msg( 'tagline' )->parse() ?? '';
	}

	/**
	 * Return the page tagline based on the current page
	 *
	 * @return string
	 */
	private function getTagline(): string {
		$title = $this->title;

		if ( !$title ) {
			return '';
		}

	// Use short description if there is any
	// from Extension:ShortDescription
		$shortdesc = $this->out->getProperty( 'shortdesc' );
		if ( $shortdesc ) {
			$tagline = $shortdesc;
		} else {
			$tagline = $this->determineTagline();
		}

		if ( empty( $tagline ) ) {
			return '';
		}

	// Apply language variant conversion
		$langConv = $this->services
		->getLanguageConverterFactory()
		->getLanguageConverter( $this->services->getContentLanguage() );
		$tagline = $langConv->convert( $tagline );

		return $tagline;
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		return [
		'html-tagline' => $this->getTagline(),
		'html-title-heading' => $this->getPageHeading()
		];
	}
}
