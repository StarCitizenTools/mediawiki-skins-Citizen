<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration\Partials;

use MediaWiki\Skins\Citizen\Partials\PageTools;
use MediaWiki\Skins\Citizen\SkinCitizen;
use MediaWiki\Title\Title;
use MediaWikiIntegrationTestCase;
use MWException;
use RequestContext;

/**
 * @group Citizen
 * @group Database
 */
class PageToolsTest extends MediaWikiIntegrationTestCase {
	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\PageTools
	 * @return void
	 */
	public function testGetPageToolsData() {
		$partial = new PageTools( new SkinCitizen() );

		$parentData = [
			'data-portlets-sidebar' => [
				'array-portlets-rest' => [],
			],
		];

		$data = $partial->getPageToolsData( $parentData );

		$this->assertArrayHasKey( 'pagetools-visible', $data );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\PageTools
	 * @return void
	 */
	public function testGetPageToolsDataToolsNotEmpty() {
		$partial = new PageTools( new SkinCitizen() );

		$parentData = [
			'data-portlets-sidebar' => [
				'array-portlets-rest' => [
					[ 'id' => 'p-tb' ],
				],
			],
		];

		$data = $partial->getPageToolsData( $parentData );

		$this->assertArrayHasKey( 'pagetools-overflow', $data );
		$this->assertTrue( $data['pagetools-overflow'] );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\PageTools
	 * @return void
	 */
	public function testGetPageToolsDataConditionLoginUserAnon() {
		RequestContext::resetMain();
		RequestContext::getMain()->setUser( $this->getServiceContainer()->getUserFactory()->newAnonymous() );

		$this->overrideConfigValues( [
			'CitizenShowPageTools' => 'login',
		] );

		$partial = new PageTools( new SkinCitizen() );

		$parentData = [
			'data-portlets-sidebar' => [
				'array-portlets-rest' => [],
			],
		];

		$data = $partial->getPageToolsData( $parentData );

		$this->assertArrayHasKey( 'pagetools-visible', $data );
		$this->assertFalse( $data['pagetools-visible'] );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\PageTools
	 * @return void
	 * @throws MWException
	 */
	public function testGetPageToolsDataConditionLoginUserRegistered() {
		$user = $this->getServiceContainer()->getUserFactory()->newFromName( 'FooUser' );
		$user->addToDatabase();

		RequestContext::resetMain();
		RequestContext::getMain()->setUser( $user );

		$this->overrideConfigValues( [
			'CitizenShowPageTools' => 'login',
		] );

		$partial = new PageTools( new SkinCitizen() );

		$parentData = [
			'data-portlets-sidebar' => [
				'array-portlets-rest' => [],
			],
		];

		$data = $partial->getPageToolsData( $parentData );

		$this->assertArrayHasKey( 'pagetools-visible', $data );
		$this->assertTrue( $data['pagetools-visible'] );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\PageTools
	 * @return void
	 * @throws MWException
	 */
	public function testGetPageToolsDataConditionPermissionHas() {
		$user = $this->getServiceContainer()->getUserFactory()->newFromName( 'FooUser' );
		$user->addToDatabase();

		$title = Title::makeTitle( NS_MAIN, 'Foo' );

		RequestContext::resetMain();
		RequestContext::getMain()->setUser( $user );
		RequestContext::getMain()->setTitle( $title );

		$this->overrideConfigValues( [
			'CitizenShowPageTools' => 'permission-read',
		] );

		$partial = new PageTools( new SkinCitizen() );

		$parentData = [
			'data-portlets-sidebar' => [
				'array-portlets-rest' => [],
			],
		];

		$data = $partial->getPageToolsData( $parentData );

		$this->assertArrayHasKey( 'pagetools-visible', $data );
		$this->assertTrue( $data['pagetools-visible'] );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\PageTools
	 * @return void
	 * @throws MWException
	 */
	public function testGetPageToolsDataConditionPermissionNotHas() {
		$user = $this->getServiceContainer()->getUserFactory()->newFromName( 'FooUser' );
		$user->addToDatabase();

		$title = Title::makeTitle( NS_MAIN, 'Foo' );

		RequestContext::resetMain();
		RequestContext::getMain()->setUser( $user );
		RequestContext::getMain()->setTitle( $title );

		$this->overrideConfigValues( [
			'CitizenShowPageTools' => 'permission-editinterface',
		] );

		$partial = new PageTools( new SkinCitizen() );

		$parentData = [
			'data-portlets-sidebar' => [
				'array-portlets-rest' => [],
			],
		];

		$data = $partial->getPageToolsData( $parentData );

		$this->assertArrayHasKey( 'pagetools-visible', $data );
		$this->assertFalse( $data['pagetools-visible'] );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\PageTools
	 * @return void
	 * @throws MWException
	 */
	public function testGetPageToolsDataLanguageCount() {
		$partial = new PageTools( new SkinCitizen() );

		$parentData = [
			'data-portlets-sidebar' => [
				'array-portlets-rest' => [],
			],
			'data-portlets' => [
				'data-languages' => [
					'is-empty' => false,
				],
			],
		];

		$data = $partial->getPageToolsData( $parentData );

		$this->assertArrayHasKey( 'has-languages', $data );
		$this->assertArrayHasKey( 'html-language-count', $data );
	}
}
