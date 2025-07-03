<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Components;

use MediaWiki\Html\Html;
use MediaWiki\Language\Language;
use MediaWiki\MediaWikiServices;
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

	public function __construct(
		private MediaWikiServices $services,
		private MessageLocalizer $localizer,
		private OutputPage $out,
		private Language|StubUserLang $pageLang,
		private Title $title,
		private string $titleData
	) {
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
		$user = $this->buildPageUserObject();
		if ( !$user ) {
			return '';
		}

		$taglineContent = $this->buildGenderTagline( $user ) .
			$this->buildEditCountTagline( $user ) .
			$this->buildRegistrationDateTagline( $user );

		if ( $taglineContent === '' ) {
			return '';
		}

		return Html::rawElement(
			'div',
			[ 'id' => 'citizen-tagline-user' ],
			$taglineContent
		);
	}

	/**
	 * Builds the HTML for the user's gender.
	 *
	 * @param User $user
	 * @return string
	 */
	private function buildGenderTagline( User $user ): string {
		$gender = $this->services->getGenderCache()->getGenderOf( $user, __METHOD__ );
		$msgGender = '';
		if ( $gender === 'male' ) {
			$msgGender = '♂';
		} elseif ( $gender === 'female' ) {
			$msgGender = '♀';
		}

		if ( $msgGender ) {
			return Html::rawElement(
				'span',
				[
					'id' => 'citizen-tagline-user-gender',
					'data-user-gender' => $gender,
				],
				$msgGender
			);
		}
		return '';
	}

	/**
	 * Builds the HTML for the user's edit count.
	 *
	 * @param User $user
	 * @return string
	 */
	private function buildEditCountTagline( User $user ): string {
		$editCount = $user->getEditCount();
		if ( !$editCount ) {
			return '';
		}
		$msgEditCount = $this->localizer->msg( 'usereditcount' )->numParams( number_format( (float)$editCount, 0 ) )->text();
		$editCountHref = SkinComponentUtils::makeSpecialUrlSubpage( 'Contributions', $user );
		$link = Html::element( 'a', [ 'href' => $editCountHref ], $msgEditCount );

		return Html::rawElement(
			'span',
			[
				'id' => 'citizen-tagline-user-editcount',
				'data-user-editcount' => (string)$editCount
			],
			$link
		);
	}

	/**
	 * Builds the HTML for the user's registration date.
	 *
	 * @param User $user
	 * @return string
	 */
	private function buildRegistrationDateTagline( User $user ): string {
		$regDate = $user->getRegistration();
		if ( !is_string( $regDate ) ) {
			return '';
		}

		$regDateTs = wfTimestamp( TS_ISO_8601, $regDate );
		$regDateHtml = Html::rawElement(
			'time',
			[
				'class' => 'citizen-user-regdate',
				'datetime' => $regDateTs,
			],
			$this->pageLang->userDate( new MWTimestamp( $regDate ), $user )
		);

		$msgRegDate = $this->localizer->msg( 'citizen-tagline-user-regdate', $regDateHtml )->parse();

		return Html::rawElement(
			'span',
			[
				'id' => 'citizen-tagline-user-regdate',
				'data-user-regdate' => $regDateTs
			],
			$msgRegDate
		);
	}

	/**
	 * Return the modified page heading HTML
	 */
	private function getPageHeading(): string {
		if ( !$this->title->isContentPage() ) {
			return $this->titleData;
		}

		// Look for the </span> or </h1> to ensure that it is the last parenthesis of the title
		// </h1> occurs when the title is a displaytitle
		$pattern = '/\s?(\p{Ps}.+\p{Pe})<\/(span|h1)>/';
		$replacement = ' <span class="mw-page-title-parenthesis">$1</span></$2>';

		return preg_replace( $pattern, $replacement, $this->titleData );
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
		$title = $this->title;

		if ( $title->isSpecialPage() ) {
			// No tagline if special page
			return '';
		}

		if ( $title->isTalkPage() ) {
			return $this->getCitizenTagline( 'citizen-tagline-ns-talk' );
		}

		if ( $this->isUserPage() ) {
			// Build user tagline if it is a top-level user page
			return $this->buildUserTagline();
		}

		$nsMsgKey = 'citizen-tagline-ns-' . strtolower( $title->getNsText() );
		if ( !$this->localizer->msg( $nsMsgKey )->isDisabled() ) {
			return $this->localizer->msg( $nsMsgKey )->parse();
		}

		return $this->getCitizenTagline( 'citizen-tagline' );
	}

	private function isUserPage(): bool {
		return ( $this->title->inNamespace( NS_USER ) || $this->isSocialProfilePage() ) && !$this->title->isSubpage();
	}

	private function isSocialProfilePage(): bool {
		if ( !defined( 'NS_USER_WIKI' ) || !defined( 'NS_USER_PROFILE' ) ) {
			return false;
		}

		// @phan-suppress-next-line PhanTypeMismatchArgument
		if ( !$this->title->inNamespaces( [ NS_USER_WIKI, NS_USER_PROFILE ] ) ) {
			return false;
		}

		return true;
	}

	private function getCitizenTagline( string $msgKey ): string {
		$msg = $this->localizer->msg( $msgKey );
		if ( $msg->isDisabled() ) {
			$msg = $this->localizer->msg( 'tagline' );
		}
		return $msg->parse();
	}

	/**
	 * Return the page tagline based on the current page
	 */
	private function getTagline(): string {
		// Use short description if there is any
		// from Extension:ShortDescription
		$shortdesc = $this->out->getProperty( 'shortdesc' );
		if ( $shortdesc ) {
			$tagline = htmlspecialchars( $shortdesc, ENT_QUOTES );
		} else {
			$tagline = $this->determineTagline();
		}

		if ( $tagline !== '' ) {
			// Apply language variant conversion
			$langConv = $this->services
				->getLanguageConverterFactory()
				->getLanguageConverter( $this->services->getContentLanguage() );
			$tagline = $langConv->convert( $tagline );
		}

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
