<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MediaWiki\MediaWikiServices;
use MediaWiki\Title\Title;
use MediaWiki\User\UserIdentity;
use MessageLocalizer;
use MWTimestamp;
use OutputPage;
use SpecialPage;
use Wikimedia\IPUtils;

/**
 * CitizenComponentPageHeading component
 * FIXME: Need unit test
 */
class CitizenComponentPageHeading implements CitizenComponent {
	/** @var MessageLocalizer */
	private $localizer;

	/** @var OutputPage */
	private $out;

	/** @var Language|StubUserLang */
	private $pageLang;

	/** @var Title */
	private $title;

	/** @var string */
	private $titleData;

	/** @var UserIdentity */
	private $user;

	/**
	 * @param MessageLocalizer $localizer
	 * @param Language|StubUserLang $pageLang
	 * @param Title $title
	 * @param OutputPage $out
	 * @param string $titleData
	 * @param UserIdentity $user
	 */
	public function __construct(
		MessageLocalizer $localizer,
		OutputPage $out,
		$pageLang,
		Title $title,
		string $titleData,
		UserIdentity $user
	) {
		$this->localizer = $localizer;
		$this->out = $out;
		$this->pageLang = $pageLang;
		$this->title = $title;
		$this->titleData = $titleData;
		$this->user = $user;
	}

	/**
	 * Check if the current page is in the content namespace
	 *
	 * @return bool
	 */
	private function shouldAddParenthesis(): bool {
		$ns = $this->title->getNamespace();
		$contentNs = MediaWikiServices::getInstance()->getNamespaceInfo()->getContentNamespaces();
		return in_array( $ns, $contentNs );
	}

	/**
	 * Return new User object based on username or IP address.
	 * Based on MinervaNeue
	 *
	 * @return UserIdentity|null
	 */
	private function buildPageUserObject() {
		$titleText = $this->title->getText();
		$user = $this->user;

		if ( IPUtils::isIPAddress( $titleText ) ) {
			return $user->newFromAnyId( null, $titleText, null );
		}

		$userIdentity = MediaWikiServices::getInstance()->getUserIdentityLookup()->getUserIdentityByName( $titleText );
		if ( $userIdentity && $userIdentity->isRegistered() ) {
			return $user->newFromId( $userIdentity->getId() );
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
		if ( $user ) {
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
				$msgEditCount = $localizer->msg( 'usereditcount' )->numParams( sprintf( '%s', number_format( $editCount, 0 ) ) );
				// TODO: Replace with SkinComponentUtils on 1.43
				$editCountHref = SpecialPage::getTitleFor( 'Contributions', $user )->getLocalURL();
				$tagline .= "<span id=\"citizen-tagline-user-editcount\" data-user-editcount=\"$editCount\"><a href=\"$editCountHref\">$msgEditCount</a></span>";
			}

			if ( is_string( $regDate ) ) {
				$regDateTs = wfTimestamp( TS_UNIX, $regDate );
				$msgRegDate = $localizer->msg( 'citizen-tagline-user-regdate', $this->pageLang->userDate( new MWTimestamp( $regDate ), $this->user ), $user );
				$tagline .= "<span id=\"citizen-tagline-user-regdate\" data-user-regdate=\"$regDateTs\">$msgRegDate</span>";
			}

			$tagline .= '</div>';
			return $tagline;
		}
		return '';
	}

	/**
	 * Return the modified page heading HTML
	 *
	 * @return string
	 */
	private function getPageHeading(): string {
		$titleHtml = $this->titleData;
		if ( $this->shouldAddParenthesis() ) {
			// Look for the </span> to ensure that it is the last parenthesis of the title
			$pattern = '/\s?(\p{Ps}.+\p{Pe})<\/span>/';
			$replacement = ' <span class="mw-page-title-parenthesis">$1</span></span>';
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
	 *
	 * @return string The determined tagline for the current page
	 */
	private function determineTagline(): string {
		$localizer = $this->localizer;
		$title = $this->title;

		$namespaceText = $title->getNsText();
		// Check if namespaceText exists
		if ( empty( $namespaceText ) ) {
			if ( !$localizer->msg( 'citizen-tagline' )->isDisabled() ) {
				return $localizer->msg( 'citizen-tagline' )->parse();
			} else {
				return $localizer->msg( 'tagline' )->parse();
			}
		}

		$msg = $localizer->msg( 'citizen-tagline-ns-' . strtolower( $namespaceText ) );
		// Use custom message if exists
		if ( !$msg->isDisabled() ) {
			return $msg->parse();
		}

		if ( $title->isSpecialPage() ) {
			// No tagline if special page
			return '';
		}

		if ( $title->isTalkPage() ) {
			// Use generic talk page message if talk page
			return $localizer->msg( 'citizen-tagline-ns-talk' )->parse();
		}

		$isRootUserPage = $title->inNamespace( NS_USER ) || ( defined( 'NS_USER_WIKI' ) && $title->inNamespace( NS_USER_WIKI ) ) || ( defined( 'NS_USER_WIKI' ) && $title->inNamespace( NS_USER_PROFILE ) ) && !$title->isSubpage();
		if ( $isRootUserPage ) {
			// Build user tagline if it is a top-level user page
			return $this->buildUserTagline();
		}

		// Fallback to site tagline
		return $localizer->msg( 'tagline' )->parse();
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
		$services = MediaWikiServices::getInstance();
		$langConv = $services
		->getLanguageConverterFactory()
		->getLanguageConverter( $services->getContentLanguage() );
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
