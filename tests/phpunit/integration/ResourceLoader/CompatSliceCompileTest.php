<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration\ResourceLoader;

use Less_Exception_Compiler;
use MediaWiki\Request\FauxRequest;
use MediaWiki\ResourceLoader\Context;
use MediaWiki\ResourceLoader\FileModule;
use MediaWiki\Skins\Citizen\CompatSlices;
use MediaWiki\Skins\Citizen\ResourceLoader\CompatSkinModule;
use MediaWikiIntegrationTestCase;
use Wikimedia\TestingAccessWrapper;

/**
 * Compiles every compat slice that actually exists, with $wgCitizenCompat forced on.
 *
 * A slice is a standalone LESS entry point, not a fragment of skin.less: it inherits
 * neither skin.less's imports, nor its @media wrappers, nor its url() base directory.
 * A slice that throws takes the whole skins.citizen.styles module down with it, so the
 * wiki renders with no skin CSS at all — and only for operators who turned the flag on.
 * Nothing else compiles slices: the flag defaults to false, so core's ResourcesTest
 * never sees them, and stylelint does not resolve LESS imports.
 *
 * Compiling also catches the one hazard nothing else can see: a rule whose home is
 * skins.citizen.tokens / skins.citizen.tokens.new and that lost its layer on the way
 * into a slice renders identically to the layered original everywhere except a wiki
 * that overrides the same token in MediaWiki:Citizen.css, where the slice now
 * silently wins.
 *
 * That hazard is narrow, and the check is scoped to match. skins.citizen.styles
 * declares root-scoped custom properties unlayered by design — common/features.less,
 * common/print.less and tokens-citizen.less all do — and a slice preserving one of
 * those must stay unlayered too, or the layered copy loses to the base declaration and
 * the slice quietly stops applying. So the owned-property set is derived at run time:
 * everything the token modules declare inside the layer, minus everything
 * skins.citizen.styles itself declares root-scoped outside it.
 *
 * The fixture tests exist so this suite cannot pass for the wrong reason while
 * resources/compat/ holds no slices: they drive the same helpers as the real-module
 * tests and prove those helpers detect a broken slice.
 *
 * Compiling the real module reaches core: resources/variables.less imports
 * mediawiki.skin.variables.less, which pulls in core's Codex design tokens. That
 * coupling is deliberate — it catches upstream token drift (#1690) — but it means a
 * Less_Exception_Compiler here may be a core-side token removal on a newer MediaWiki
 * rather than a defect in this skin. Check the failing variable against the target
 * branch's mediawiki.skin.codex-design-tokens before debugging the slice.
 *
 * @covers \MediaWiki\Skins\Citizen\ResourceLoader\CompatSkinModule
 * @covers \MediaWiki\Skins\Citizen\CompatSlices
 * @group Citizen
 */
class CompatSliceCompileTest extends MediaWikiIntegrationTestCase {

	private const FIXTURE_SLICE = 'resources/compat/9.9.less';

	/**
	 * A real Context is required, not a mock: compileLessString() calls
	 * $context->getResourceLoader()->getLessCompiler(), and the skin name selects the
	 * SkinLessImportPaths entry that resolves 'mediawiki.skin.variables.less', which
	 * resources/variables.less imports.
	 */
	private function newContext(): Context {
		return new Context(
			$this->getServiceContainer()->getResourceLoader(),
			new FauxRequest( [ 'skin' => 'citizen', 'lang' => 'en' ] )
		);
	}

	/**
	 * Compiles every style file the module serves and reports what it referenced.
	 *
	 * Mirrors core's ResourcesTest::testResourceFiles().
	 *
	 * @return array{0:array<string,string>,1:string[]} [ CSS by media, missing file refs ]
	 */
	private function compile( FileModule $module, Context $context ): array {
		$css = $module->readStyleFiles( $module->getStyleFiles( $context ), $context );

		return [ $css, TestingAccessWrapper::newFromObject( $module )->missingLocalFileRefs ];
	}

	/**
	 * Compiles one style file on its own.
	 *
	 * The layer check has to see a slice in isolation: the module's aggregate CSS
	 * carries skin.less's own unlayered :root token declarations, which are correct
	 * there and would drown any slice-level violation.
	 */
	private function compileOne( FileModule $module, string $path, Context $context ): string {
		return TestingAccessWrapper::newFromObject( $module )->readStyleFile( $path, $context );
	}

	/**
	 * Selectors declaring a token-module-owned custom property outside the layer.
	 *
	 * Unlayered rules beat layered ones, so a rule whose home is a token module and
	 * that loses its layer while being moved into a slice starts overriding an
	 * operator's MediaWiki:Citizen.css. It compiles, it lints, and it looks exactly
	 * like the layered original until such an override exists — hence the check.
	 *
	 * Only properties in $owned are hazardous. One that skins.citizen.styles itself
	 * declares root-scoped and unlayered (the common/features.less shape) is not:
	 * wrapping the slice copy in the layer would make it lose to that base
	 * declaration, so the slice has to stay unlayered to keep working.
	 *
	 * @param string $css compiled CSS of a single slice
	 * @param string[] $owned property names from getTokenModuleOwnedProperties()
	 * @return string[] offending selectors
	 */
	private function findUnlayeredTokenModuleRules( string $css, array $owned ): array {
		$offenders = [];
		foreach ( $this->findUnlayeredRootDeclarations( $css ) as $rule ) {
			if ( array_intersect( $rule['properties'], $owned ) !== [] ) {
				$offenders[] = $rule['selector'];
			}
		}

		return $offenders;
	}

	/**
	 * Root-scoped custom-property declarations sitting outside `@layer citizen-tokens`.
	 *
	 * @return array<int,array{selector:string,properties:string[]}>
	 */
	private function findUnlayeredRootDeclarations( string $css ): array {
		[ , $outside ] = $this->splitLayer( $this->stripComments( $css ), 'citizen-tokens' );
		$rules = [];

		// Innermost blocks only: a declaration block never contains a brace, so this
		// yields [ prelude, declarations ] pairs and skips the at-rules wrapping them.
		preg_match_all( '/([^{}]*)\{([^{}]*)\}/', $outside, $blocks, PREG_SET_ORDER );
		foreach ( $blocks as $block ) {
			$selector = trim( $block[1] );
			$isSelector = $selector !== '' && $selector[0] !== '@';
			$isRootScoped = str_contains( $selector, ':root' )
				|| preg_match( '/(^|[\s,>+~])html\b/', $selector ) === 1;
			if ( !$isSelector || !$isRootScoped ) {
				continue;
			}

			$properties = $this->findDeclaredProperties( $block[2] );
			if ( $properties !== [] ) {
				$rules[] = [ 'selector' => $selector, 'properties' => $properties ];
			}
		}

		return $rules;
	}

	/**
	 * Custom properties $css declares, ignoring `var()` reads of them.
	 *
	 * A declaration name may only follow `{`, `;` or the start of the string; a read
	 * always sits after `(`, `,` or whitespace inside a value.
	 *
	 * Comments are stripped first, or the anchor turns into an escape hatch: a
	 * declaration whose nearest predecessor is the end of a block comment follows none
	 * of the three and goes unseen. That is the shape a slice author is most likely to
	 * write, since every moved rule is supposed to carry a comment naming the change
	 * it covers.
	 *
	 * @return string[]
	 */
	private function findDeclaredProperties( string $css ): array {
		preg_match_all( '/(?:^|[{;])\s*(--[\w-]+)\s*:/', $this->stripComments( $css ), $m );

		return array_values( array_unique( $m[1] ) );
	}

	/**
	 * Drops CSS block comments, which less.php passes through to the compiled output.
	 *
	 * Each is replaced with a space, never removed outright, so a comment sitting
	 * between two tokens cannot fuse them. Comment syntax inside a string or a `url()`
	 * would be mangled, but neither the token modules nor a slice has cause to write
	 * one, and a CSSMin data URI cannot contain the opening sequence — `*` is not in
	 * the base64 alphabet.
	 */
	private function stripComments( string $css ): string {
		return preg_replace( '#/\*.*?\*/#s', ' ', $css );
	}

	/**
	 * Custom properties the token modules declare inside `@layer citizen-tokens` and
	 * that skins.citizen.styles does not also declare root-scoped outside it.
	 *
	 * Deriving the set beats asking slice authors to tag provenance by hand: the
	 * answer changes whenever a token moves between the pipelines, and the author who
	 * would have to remember the tag is exactly the one who gets it wrong.
	 *
	 * @return string[]
	 */
	private function getTokenModuleOwnedProperties( Context $context ): array {
		return array_values( array_diff(
			$this->getTokenLayerProperties( $context ),
			$this->getUnlayeredBaseProperties( $context )
		) );
	}

	/**
	 * Custom properties declared inside `@layer citizen-tokens`, keyed by token module.
	 *
	 * Both modules are scanned even though only one ships per request: a slice may
	 * freeze a rule from either pipeline.
	 *
	 * Each module is asserted to contribute something. A module that restructures —
	 * renames its layer, or moves the `@layer` wrapper into a sub-file it no longer
	 * serves — would otherwise drop out of the owned set in silence, leaving that
	 * pipeline's tokens unguarded while the aggregate set still looks healthy because
	 * the other module fills it.
	 *
	 * @return array<string,string[]>
	 */
	private function getTokenLayerPropertiesByModule( Context $context ): array {
		$byModule = [];
		foreach ( [ 'skins.citizen.tokens', 'skins.citizen.tokens.new' ] as $name ) {
			$module = $this->getServiceContainer()->getResourceLoader()->getModule( $name );
			$this->assertInstanceOf( FileModule::class, $module, "$name must be registered" );
			$css = implode( '', $module->readStyleFiles( $module->getStyleFiles( $context ), $context ) );
			[ $inside ] = $this->splitLayer( $this->stripComments( $css ), 'citizen-tokens' );
			$byModule[$name] = $this->findDeclaredProperties( $inside );
		}

		return $byModule;
	}

	/**
	 * Custom properties declared inside `@layer citizen-tokens` by either token module.
	 *
	 * @return string[]
	 */
	private function getTokenLayerProperties( Context $context ): array {
		return array_values( array_unique(
			array_merge( ...array_values( $this->getTokenLayerPropertiesByModule( $context ) ) )
		) );
	}

	/**
	 * Custom properties skins.citizen.styles declares root-scoped and unlayered.
	 *
	 * common/features.less gates `--width-layout`, `--opacity-glass` and friends on
	 * server-rendered `citizen-feature-*-clientpref-*` root classes; common/print.less
	 * and tokens-citizen.less declare root-scoped tokens of their own. None of that is
	 * layered, by design, so a slice preserving any of it must not be layered either.
	 *
	 * Slices are skipped — a slice must not be able to exempt itself.
	 *
	 * @return string[]
	 */
	private function getUnlayeredBaseProperties( Context $context ): array {
		$module = $this->getServiceContainer()->getResourceLoader()->getModule( 'skins.citizen.styles' );
		$this->assertInstanceOf( CompatSkinModule::class, $module );

		$properties = [];
		foreach ( $module->getStyleFiles( $context ) as $files ) {
			foreach ( $files as $file ) {
				$path = (string)$file;
				if ( !str_starts_with( $path, 'resources/skins.citizen.styles/' ) ) {
					continue;
				}
				$css = $this->compileOne( $module, $path, $context );
				foreach ( $this->findUnlayeredRootDeclarations( $css ) as $rule ) {
					$properties = array_merge( $properties, $rule['properties'] );
				}
			}
		}

		return array_values( array_unique( $properties ) );
	}

	/**
	 * Splits every `@layer <name> { … }` block out of $css, braces balanced.
	 *
	 * @return array{0:string,1:string} [ concatenated layer bodies, everything else ]
	 */
	private function splitLayer( string $css, string $name ): array {
		$inside = '';
		$pattern = '/@layer\s+' . preg_quote( $name, '/' ) . '\s*\{/';
		while ( preg_match( $pattern, $css, $m, PREG_OFFSET_CAPTURE ) === 1 ) {
			$start = $m[0][1];
			$body = $start + strlen( $m[0][0] );
			$cursor = $body;
			$depth = 1;
			$length = strlen( $css );
			while ( $cursor < $length && $depth > 0 ) {
				if ( $css[$cursor] === '{' ) {
					$depth++;
				} elseif ( $css[$cursor] === '}' ) {
					$depth--;
				}
				$cursor++;
			}
			// $cursor sits past the closing brace; the body stops one character short.
			$inside .= substr( $css, $body, max( 0, $cursor - 1 - $body ) ) . "\n";
			$css = substr( $css, 0, $start ) . substr( $css, $cursor );
		}

		return [ $inside, $css ];
	}

	/**
	 * A throwaway skin tree whose only slice is $sliceBody.
	 *
	 * Fixtures are built at runtime rather than committed: a deliberately broken
	 * .less file under tests/ would fail `npm run lint:styles`, and a file under
	 * resources/compat/ would add a version to the generation marker.
	 */
	private function newFixtureModule( string $sliceBody ): CompatSkinModule {
		$dir = $this->getNewTempDirectory();
		mkdir( "$dir/resources/compat", 0777, true );
		mkdir( "$dir/resources/skins.citizen.styles", 0777, true );
		file_put_contents(
			"$dir/resources/skins.citizen.styles/skin.less",
			"@color-base: #000;\n.citizen-base { color: @color-base; }\n"
		);
		file_put_contents( "$dir/" . self::FIXTURE_SLICE, $sliceBody );

		$module = new CompatSkinModule( [
			// Mirrors skin.json. An empty array is NOT list-mode, because
			// range( 0, -1 ) is [ 0, -1 ]; it falls through to
			// DEFAULT_FEATURES_SPECIFIED, which enables `toc`, which adds
			// lessMessages, which needs a database-backed MessageBlobStore.
			'features' => [ 'toc' => false ],
			'styles' => [ 'resources/skins.citizen.styles/skin.less' ],
			'localBasePath' => $dir,
			'remoteBasePath' => '/w/skins/Citizen',
		] );
		$module->setConfig( $this->getServiceContainer()->getMainConfig() );

		return $module;
	}

	public function testRealModuleAndEverySliceCompile(): void {
		$this->overrideConfigValue( 'CitizenCompat', true );
		$module = $this->getServiceContainer()->getResourceLoader()
			->getModule( 'skins.citizen.styles' );
		$this->assertInstanceOf( CompatSkinModule::class, $module );
		$context = $this->newContext();
		$basePath = TestingAccessWrapper::newFromObject( $module )->localBasePath;

		$served = [];
		foreach ( $module->getStyleFiles( $context ) as $files ) {
			foreach ( $files as $file ) {
				$served[] = (string)$file;
			}
		}
		[ $css, $missing ] = $this->compile( $module, $context );

		// Guards against this test silently exercising the flag-off path forever.
		$this->assertTrue(
			$module->getConfig()->get( 'CitizenCompat' ),
			'the config override must reach the registered module'
		);
		foreach ( CompatSlices::getSliceStyleFiles( $basePath ) as $slice ) {
			$this->assertContains( $slice, $served, "compat slice $slice must be served" );
		}
		$this->assertSame( [], $missing, 'styles must not reference missing local files' );
		$this->assertNotSame( '', implode( '', $css ), 'module must produce CSS' );
	}

	public function testEverySliceKeepsTokenModuleRulesInsideTheLayer(): void {
		$this->overrideConfigValue( 'CitizenCompat', true );
		$module = $this->getServiceContainer()->getResourceLoader()
			->getModule( 'skins.citizen.styles' );
		$this->assertInstanceOf( CompatSkinModule::class, $module );
		$context = $this->newContext();
		$basePath = TestingAccessWrapper::newFromObject( $module )->localBasePath;
		$owned = $this->getTokenModuleOwnedProperties( $context );

		$offenders = [];
		foreach ( CompatSlices::getSliceStyleFiles( $basePath ) as $slice ) {
			$css = $this->compileOne( $module, $slice, $context );
			foreach ( $this->findUnlayeredTokenModuleRules( $css, $owned ) as $selector ) {
				$offenders[] = "$slice: $selector";
			}
		}

		$this->assertSame(
			[],
			$offenders,
			'a rule moved out of a token module must stay inside @layer citizen-tokens, '
				. 'or it overrides MediaWiki:Citizen.css'
		);
	}

	/**
	 * The narrowing is the whole point of the check, so it gets asserted directly:
	 * an empty or over-broad owned set would leave the slice scan useless in one
	 * direction or wrong in the other, and neither shows up in the scan's own result.
	 */
	public function testTokenModuleOwnershipExcludesUnlayeredBaseProperties(): void {
		$this->overrideConfigValue( 'CitizenCompat', true );

		$owned = $this->getTokenModuleOwnedProperties( $this->newContext() );

		$this->assertNotSame( [], $owned, 'the token modules must yield layered properties' );
		$this->assertContains(
			'--color-surface-1',
			$owned,
			'a property only the token modules declare is owned'
		);
		$this->assertNotContains(
			'--width-layout',
			$owned,
			'common/features.less declares --width-layout unlayered; it is not token-owned'
		);
		$this->assertNotContains(
			'--backdrop-filter-frosted-glass',
			$owned,
			'declared in the layer AND unlayered by common/features.less — not enforceable'
		);
	}

	/**
	 * The aggregate assertion above cannot see a partial collapse: with the two modules
	 * merged, one contributing nothing still leaves a set that looks healthy because
	 * the other fills it — and that pipeline's tokens are then unguarded in slices.
	 */
	public function testEachTokenModuleContributesLayeredProperties(): void {
		$this->overrideConfigValue( 'CitizenCompat', true );

		$byModule = $this->getTokenLayerPropertiesByModule( $this->newContext() );

		$this->assertSame(
			[ 'skins.citizen.tokens', 'skins.citizen.tokens.new' ],
			array_keys( $byModule ),
			'both token pipelines must be scanned'
		);
		foreach ( $byModule as $name => $properties ) {
			$this->assertNotSame(
				[],
				$properties,
				"$name declares nothing inside @layer citizen-tokens — did the layer move or get renamed?"
			);
		}
	}

	public function testHarnessDetectsUnlayeredTokenRuleInSlice(): void {
		$this->overrideConfigValue( 'CitizenCompat', true );
		$context = $this->newContext();
		$module = $this->newFixtureModule(
			":root.skin-theme-clientpref-night { --color-surface-1: #111; }\n"
		);

		$offenders = $this->findUnlayeredTokenModuleRules(
			$this->compileOne( $module, self::FIXTURE_SLICE, $context ),
			$this->getTokenModuleOwnedProperties( $context )
		);

		$this->assertSame( [ ':root.skin-theme-clientpref-night' ], $offenders );
	}

	public function testHarnessAcceptsLayeredTokenRuleInSlice(): void {
		$this->overrideConfigValue( 'CitizenCompat', true );
		$context = $this->newContext();
		$module = $this->newFixtureModule(
			"@layer citizen-tokens {\n"
			. "\t:root.skin-theme-clientpref-night { --color-surface-1: #111; }\n"
			. "}\n"
			// Reading a token is not declaring one, and this rule is not root-scoped.
			. ".citizen-compat { color: var( --color-surface-1 ); }\n"
		);

		$offenders = $this->findUnlayeredTokenModuleRules(
			$this->compileOne( $module, self::FIXTURE_SLICE, $context ),
			$this->getTokenModuleOwnedProperties( $context )
		);

		$this->assertSame( [], $offenders );
	}

	/**
	 * The commented shape is the common one, not an exotic one: every moved rule is
	 * supposed to open with a comment naming the change it covers, and less.php passes
	 * that comment straight through into the compiled CSS. If the scan anchors on the
	 * character before the property name, the comment hides the declaration and the
	 * slice walks through the layer check untouched.
	 */
	public function testHarnessDetectsUnlayeredTokenRuleBehindComment(): void {
		$this->overrideConfigValue( 'CitizenCompat', true );
		$context = $this->newContext();
		$module = $this->newFixtureModule(
			":root.skin-theme-clientpref-night {\n"
			. "\t/* Covers: theme rework (#1234) */\n"
			. "\t--color-surface-1: #111;\n"
			. "}\n"
		);

		$offenders = $this->findUnlayeredTokenModuleRules(
			$this->compileOne( $module, self::FIXTURE_SLICE, $context ),
			$this->getTokenModuleOwnedProperties( $context )
		);

		$this->assertSame( [ ':root.skin-theme-clientpref-night' ], $offenders );
	}

	/**
	 * The common/features.less shape: a root-scoped custom property whose source was
	 * never layered. Wrapping it in @layer citizen-tokens would make the slice lose to
	 * the unlayered base declaration and stop applying, so the check must let it pass.
	 */
	public function testHarnessAcceptsUnlayeredFeatureRuleInSlice(): void {
		$this->overrideConfigValue( 'CitizenCompat', true );
		$context = $this->newContext();
		$module = $this->newFixtureModule(
			":root.citizen-feature-custom-width-clientpref-standard { --width-layout: 1080px; }\n"
			. ":root.citizen-feature-performance-mode-clientpref-1 {\n"
			. "\t--backdrop-filter-frosted-glass: none;\n"
			. "\t--opacity-glass: 1;\n"
			. "}\n"
		);

		$offenders = $this->findUnlayeredTokenModuleRules(
			$this->compileOne( $module, self::FIXTURE_SLICE, $context ),
			$this->getTokenModuleOwnedProperties( $context )
		);

		$this->assertSame( [], $offenders );
	}

	public function testSliceDoesNotInheritSkinLessScope(): void {
		$this->overrideConfigValue( 'CitizenCompat', true );
		$module = $this->newFixtureModule( ".citizen-compat { color: @color-base; }\n" );

		$this->expectException( Less_Exception_Compiler::class );

		$this->compile( $module, $this->newContext() );
	}

	public function testHarnessDetectsUndefinedMixinInSlice(): void {
		$this->overrideConfigValue( 'CitizenCompat', true );
		$module = $this->newFixtureModule( ".citizen-compat { .no-such-mixin(); }\n" );

		$this->expectException( Less_Exception_Compiler::class );

		$this->compile( $module, $this->newContext() );
	}

	public function testHarnessDetectsMissingAssetInSlice(): void {
		$this->overrideConfigValue( 'CitizenCompat', true );
		$module = $this->newFixtureModule(
			".citizen-compat { background-image: url( nope.svg ); }\n"
		);

		[ , $missing ] = $this->compile( $module, $this->newContext() );

		$this->assertCount( 1, $missing );
		$this->assertStringEndsWith( '/resources/compat/nope.svg', $missing[0] );
	}

	public function testHarnessAcceptsCleanSlice(): void {
		$this->overrideConfigValue( 'CitizenCompat', true );
		$module = $this->newFixtureModule(
			":root:not( [ data-mw-citizen-html~='9.9' ] ) .citizen-compat { color: #000; }\n"
		);

		[ $css, $missing ] = $this->compile( $module, $this->newContext() );

		$this->assertSame( [], $missing );
		$this->assertStringContainsString( '.citizen-compat', implode( '', $css ) );
	}
}
