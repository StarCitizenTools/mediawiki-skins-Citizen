<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Partials;

use MediaWiki\Skins\Citizen\Partials\Tagline;
use MediaWiki\Skins\Citizen\SkinCitizen;
use MediaWiki\Title\Title;
use OutputPage;
use RequestContext;

/**
 * @group Citizen
 */
class TaglineTest extends \MediaWikiIntegrationTestCase {
	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\Tagline
	 * @return void
	 */
	public function testGetTagLineEmpty() {
		$partial = new Tagline( new SkinCitizen() );

		$this->assertEmpty( $partial->getTagline() );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\Tagline
	 * @return void
	 */
	public function testGetTagLineShortDesc() {
		$title = Title::makeTitle( NS_MAIN, 'Foo' );

		RequestContext::resetMain();

		$out = new OutputPage( RequestContext::getMain() );
		$out->setProperty( 'shortdesc', '<foo-desc>' );

		RequestContext::getMain()->setOutput( $out );
		RequestContext::getMain()->setTitle( $title );

		$partial = new Tagline( new SkinCitizen() );

		$this->assertEquals( '<foo-desc>', $partial->getTagline() );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\Tagline
	 * @return void
	 */
	public function testGetTagLineNoNSText() {
		$title = $this->getMockBuilder( Title::class )->disableOriginalConstructor()->getMock();
		$title->expects( $this->once() )->method( 'getNsText' )->willReturn( false );

		RequestContext::resetMain();

		$out = new OutputPage( RequestContext::getMain() );
		$out->setProperty( 'shortdesc', null );

		RequestContext::getMain()->setOutput( $out );
		RequestContext::getMain()->setTitle( $title );

		$partial = new Tagline( new SkinCitizen() );

		$this->assertEquals(
			wfMessage( 'tagline' )->text(),
			$partial->getTagline()
		);
	}
}
