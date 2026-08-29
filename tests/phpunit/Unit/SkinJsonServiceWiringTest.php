<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit;

use MediaWiki\Skins\Citizen\Api\ApiWebappManifest;
use MediaWiki\Skins\Citizen\SkinCitizen;
use MediaWikiUnitTestCase;
use ReflectionClass;
use ReflectionNamedType;

/**
 * Guards the positional contract between skin.json's service lists and the
 * constructors they feed. ObjectFactory passes services by position, so
 * inserting a name anywhere but the end — or adding a constructor parameter
 * without its service — hands the wrong object to the wrong parameter. Every
 * service parameter is typed, so that throws a TypeError at construction; but
 * nothing else in the suite constructs these through skin.json, so the
 * TypeError would first surface on a real request — a page view for the skin
 * (Special:Preferences among them, which instantiates every registered skin
 * and so goes down with it), or ?action=appmanifest for the API module.
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
		'ContentLanguage' => 'Language',
		'MainWANObjectCache' => 'WANObjectCache',
	];

	/**
	 * ApiModuleManager hands ObjectFactory the parent ApiMain and the module
	 * name as extraArgs, so an API module's declared services start at the
	 * third constructor parameter.
	 */
	private const API_MODULE_EXTRA_ARGS = 2;

	private function readSkinJson(): array {
		return json_decode(
			file_get_contents( dirname( __DIR__, 3 ) . '/skin.json' ),
			true,
			512,
			JSON_THROW_ON_ERROR
		);
	}

	/**
	 * @return string[] Constructor parameter type short names, in order
	 */
	private function getConstructorParameterTypes( string $class, int $skip = 0 ): array {
		$constructor = ( new ReflectionClass( $class ) )->getConstructor();
		$types = [];

		foreach ( array_slice( $constructor->getParameters(), $skip ) as $parameter ) {
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

	/**
	 * @param string[] $declared
	 * @return string[]
	 */
	private function toClassShortNames( array $declared ): array {
		return array_map(
			static fn ( string $service ): string => self::SERVICE_CLASS_ALIASES[$service] ?? $service,
			$declared
		);
	}

	public function testServiceOrderMatchesConstructorParameterOrder(): void {
		$spec = $this->readSkinJson()['ValidSkinNames']['citizen'];
		$declared = array_merge( $spec['services'], $spec['optional_services'] ?? [] );

		$this->assertSame(
			$this->toClassShortNames( $declared ),
			$this->getConstructorParameterTypes( SkinCitizen::class ),
			'skin.json service order must match SkinCitizen constructor parameter order'
		);
	}

	public function testApiModuleServiceOrderMatchesConstructorParameterOrder(): void {
		$spec = $this->readSkinJson()['APIModules']['appmanifest'];

		$declared = array_merge( $spec['services'], $spec['optional_services'] ?? [] );

		$this->assertSame(
			$this->toClassShortNames( $declared ),
			$this->getConstructorParameterTypes( ApiWebappManifest::class, self::API_MODULE_EXTRA_ARGS ),
			'skin.json service order must match ApiWebappManifest constructor parameter order'
		);
	}
}
