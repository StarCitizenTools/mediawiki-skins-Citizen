<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit;

use MediaWiki\Skins\Citizen\SkinCitizen;
use MediaWikiUnitTestCase;
use ReflectionClass;
use ReflectionNamedType;

/**
 * Guards the positional contract between skin.json's service list and
 * SkinCitizen's constructor. ObjectFactory passes services by position, so
 * inserting a name anywhere but the end — or adding a constructor parameter
 * without its service — hands the wrong object to the wrong parameter. Every
 * service parameter is typed, so that throws a TypeError at construction; but
 * nothing else in the suite constructs the skin through skin.json, so the
 * TypeError would first surface on a real page view — Special:Preferences
 * among them, which instantiates every registered skin and so goes down with
 * it.
 *
 * @group Citizen
 * @coversNothing
 */
class SkinJsonServiceWiringTest extends MediaWikiUnitTestCase {

	/**
	 * Services whose name does not match their class's short name.
	 */
	private const SERVICE_CLASS_ALIASES = [
		'MobileFrontend.Context' => 'MobileContext',
	];

	private function getSkinSpec(): array {
		$skinJson = json_decode(
			file_get_contents( dirname( __DIR__, 3 ) . '/skin.json' ),
			true,
			512,
			JSON_THROW_ON_ERROR
		);

		return $skinJson['ValidSkinNames']['citizen'];
	}

	/**
	 * @return string[] Constructor parameter type short names, in order
	 */
	private function getConstructorParameterTypes(): array {
		$constructor = ( new ReflectionClass( SkinCitizen::class ) )->getConstructor();
		$types = [];

		foreach ( $constructor->getParameters() as $parameter ) {
			$type = $parameter->getType();
			if ( !( $type instanceof ReflectionNamedType ) || $type->isBuiltin() ) {
				// The trailing $options array; services stop here.
				break;
			}
			$parts = explode( '\\', $type->getName() );
			$types[] = end( $parts );
		}

		return $types;
	}

	public function testServiceOrderMatchesConstructorParameterOrder(): void {
		$spec = $this->getSkinSpec();
		$declared = array_merge( $spec['services'], $spec['optional_services'] ?? [] );

		$expected = array_map(
			static fn ( string $service ): string => self::SERVICE_CLASS_ALIASES[$service] ?? $service,
			$declared
		);

		$this->assertSame(
			$expected,
			$this->getConstructorParameterTypes(),
			'skin.json service order must match SkinCitizen constructor parameter order'
		);
	}
}
