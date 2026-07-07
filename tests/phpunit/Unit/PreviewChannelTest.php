<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit;

use MediaWiki\Config\HashConfig;
use MediaWiki\Skins\Citizen\PreviewChannel;
use MediaWikiUnitTestCase;

/**
 * @group Citizen
 * @covers \MediaWiki\Skins\Citizen\PreviewChannel
 */
class PreviewChannelTest extends MediaWikiUnitTestCase {

	/**
	 * @return iterable<string, array{?string, ?string, mixed, mixed, bool}>
	 */
	public static function providePrecedence(): iterable {
		// [ urlVal, cookieVal, CitizenPreview, CitizenUseNewToken, expected ]
		yield 'all defaults → stable' => [ null, null, 0, false, false ];
		yield 'config targets the current major' => [ null, null, 4, false, true ];
		yield 'config accepts a numeric string' => [ null, null, '4', false, true ];
		yield 'config for a future cycle is inert' => [ null, null, 5, false, false ];
		yield 'boolean true config is inert' => [ null, null, true, false, false ];
		yield 'deprecated alias activates preview' => [ null, null, 0, true, true ];
		yield 'inert config falls through to alias' => [ null, null, 5, true, true ];
		yield 'truthy non-boolean alias activates preview' => [ null, null, 0, 1, true ];
		yield 'cookie opt-out beats active alias' => [ null, '0', 0, true, false ];
		yield 'cookie opts in over config off' => [ null, '4', 0, false, true ];
		yield 'cookie opts out over config on' => [ null, '0', 4, false, false ];
		yield 'legacy cookie value 1 is inert' => [ null, '1', 0, false, false ];
		yield 'inert cookie falls through to config' => [ null, '5', 4, false, true ];
		yield 'url opts in over everything' => [ '4', '0', 0, false, true ];
		yield 'url opts out over everything' => [ '0', '4', 4, true, false ];
		yield 'garbage url falls through to cookie' => [ 'x', '0', 4, false, false ];
		yield 'empty url falls through to config' => [ '', null, 4, false, true ];
	}

	/**
	 * @dataProvider providePrecedence
	 */
	public function testIsPreview(
		?string $urlVal,
		?string $cookieVal,
		mixed $configVal,
		mixed $aliasVal,
		bool $expected
	): void {
		$config = new HashConfig( [
			'CitizenPreview' => $configVal,
			'CitizenUseNewToken' => $aliasVal,
		] );

		$actual = PreviewChannel::isPreview( $urlVal, $cookieVal, $config );

		$this->assertSame( $expected, $actual );
	}

	/**
	 * @return iterable<string, array{?string, bool}>
	 */
	public static function provideExplicitValues(): iterable {
		yield 'target major is explicit' => [ '4', true ];
		yield 'zero is explicit' => [ '0', true ];
		yield 'other number is not explicit' => [ '5', false ];
		yield 'empty string is not explicit' => [ '', false ];
		yield 'null is not explicit' => [ null, false ];
	}

	/**
	 * @dataProvider provideExplicitValues
	 */
	public function testIsExplicitValue( ?string $raw, bool $expected ): void {
		$this->assertSame( $expected, PreviewChannel::isExplicitValue( $raw ) );
	}

	public function testConstants(): void {
		$this->assertSame( 4, PreviewChannel::TARGET_MAJOR );
		$this->assertSame( 'citizenpreview', PreviewChannel::REQUEST_KEY );
		$this->assertSame( 'citizen-v4', PreviewChannel::HTML_CLASS );
		$this->assertSame( 'citizen-token-new', PreviewChannel::HTML_CLASS_LEGACY );
	}
}
