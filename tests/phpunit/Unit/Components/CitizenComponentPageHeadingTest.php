<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Components;

use Language;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageHeading;
use MediaWikiUnitTestCase;
use MessageLocalizer;
use OutputPage;
use Title;
use UserIdentity;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentPageHeading
 */
class CitizenComponentPageHeadingTest extends MediaWikiUnitTestCase {

	public function testGetTagline_empty(): void {
		$localizer = $this->createMock( MessageLocalizer::class );
		$localizer->expects( $this->never() )
			->method( 'msg' );

		$out = $this->createMock( OutputPage::class );
		$pageLang = $this->createNoopStub( Language::class );
		$title = $this->createMock( Title::class );
		$user = $this->createNoopStub( UserIdentity::class );

		$component = new CitizenComponentPageHeading( $localizer, $out, $pageLang, $title, '', $user );
		$this->assertSame( '', $component->getTagline() );
	}

	public function testGetTagline_namespaceContent(): void {
		$localizer = $this->createMock( MessageLocalizer::class );
		$localizer->expects( $this->never() )
			->method( 'msg' );

		$out = $this->createMock( OutputPage::class );
		$pageLang = $this->createNoopStub( Language::class );
		$title = $this->createMock( Title::class );
		$title->expects( $this->once() )
			->method( 'getNamespace' )
			->willReturn( NS_MAIN );
		$user = $this->createNoopStub( UserIdentity::class );

		$component = new CitizenComponentPageHeading( $localizer, $out, $pageLang, $title, '', $user );
		$this->assertSame( '', $component->getTagline() );
	}

	public function testGetTagline_namespaceSpecial(): void {
		$localizer = $this->createMock( MessageLocalizer::class );
		$localizer->expects( $this->once() )
			->method( 'msg' )
			->withConsecutive(
				[ 'citizen-pageheading-special' ]
			)
			->willReturn( 'msg-citizen-pageheading-special' );

		$out = $this->createMock( OutputPage::class );
		$pageLang = $this->createNoopStub( Language::class );
		$title = $this->createMock( Title::class );
		$title->expects( $this->once() )
			->method( 'getNamespace' )
			->willReturn( NS_SPECIAL );
		$user = $this->createNoopStub( UserIdentity::class );

		$component = new CitizenComponentPageHeading( $localizer, $out, $pageLang, $title, '', $user );
		$this->assertSame( 'msg-citizen-pageheading-special', $component->getTagline() );
	}

	public function testGetTagline_namespaceTalk(): void {
		$localizer = $this->createMock( MessageLocalizer::class );
		$localizer->expects( $this->once() )
			->method( 'msg' )
			->withConsecutive(
				[ 'citizen-pageheading-talk' ]
			)
			->willReturn( 'msg-citizen-pageheading-talk' );

		$out = $this->createMock( OutputPage::class );
		$pageLang = $this->createNoopStub( Language::class );
		$title = $this->createMock( Title::class );
		$title->expects( $this->once() )
			->method( 'getNamespace' )
			->willReturn( NS_TALK );
		$user = $this->createNoopStub( UserIdentity::class );

		$component = new CitizenComponentPageHeading( $localizer, $out, $pageLang, $title, '', $user );
		$this->assertSame( 'msg-citizen-pageheading-talk', $component->getTagline() );
	}

	public function testGetTagline_userPage(): void {
		$localizer = $this->createMock( MessageLocalizer::class );
		$localizer->expects( $this->never() )
			->method( 'msg' );

		$out = $this->createMock( OutputPage::class );
		$pageLang = $this->createNoopStub( Language::class );
		$title = $this->createMock( Title::class );
		$title->expects( $this->once() )
			->method( 'getNamespace' )
			->willReturn( NS_USER );
		$user = $this->createNoopStub( UserIdentity::class );

		$component = new CitizenComponentPageHeading( $localizer, $out, $pageLang, $title, '', $user );
		$this->assertSame( '', $component->getTagline() );
	}

	public function testGetTagline_ipPage(): void {
		$localizer = $this->createMock( MessageLocalizer::class );
		$localizer->expects( $this->never() )
			->method( 'msg' );

		$out = $this->createMock( OutputPage::class );
		$pageLang = $this->createNoopStub( Language::class );
		$title = $this->createMock( Title::class );
		$title->expects( $this->once() )
			->method( 'getNamespace' )
			->willReturn( NS_USER_TALK );
		$user = $this->createNoopStub( UserIdentity::class );

		$component = new CitizenComponentPageHeading( $localizer, $out, $pageLang, $title, '192.0.2.1', $user );
		$this->assertSame( '', $component->getTagline() );
	}
}
