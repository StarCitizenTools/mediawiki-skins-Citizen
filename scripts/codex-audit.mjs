#!/usr/bin/env node
/**
 * Audits Citizen's new-pipeline color tokens against Codex sources
 * across every MW version Citizen supports. Outputs a markdown report:
 * primitives table, semantics tables (light + dark), Codex primitive
 * history, documented deviations, and a drift summary.
 *
 *   node scripts/codex-audit.mjs              # markdown to stdout
 *   node scripts/codex-audit.mjs > audit.md   # save to file
 *   node scripts/codex-audit.mjs --no-cache   # bypass local cache
 *
 * Needs `gh` CLI for fetching. Cache: scripts/.cache/ (gitignored).
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname( fileURLToPath( import.meta.url ) );
const ROOT = join( __dirname, '..' );
const CACHE = join( __dirname, '.cache' );

const NO_CACHE = process.argv.includes( '--no-cache' );

const MW_BRANCHES = [ 'REL1_43', 'REL1_44', 'REL1_45', 'master' ];
const MW_REPO = 'wikimedia/mediawiki';
const CODEX_REPO = 'wikimedia/design-codex';

const CITIZEN_PRIMITIVES = join( ROOT, 'resources/skins.citizen.tokens.new/primitives-codex.less' );
const CITIZEN_TOKENS_DIR = join( ROOT, 'resources/skins.citizen.tokens.new' );
const DEVIATIONS_FILE = join( __dirname, 'codex-deviations.json' );

// Names that count as a "primitive" — chain resolution stops here.
const PRIMITIVE_PREFIXES = [
	'gray-', 'blue-', 'red-', 'green-', 'lime-', 'orange-',
	'yellow-', 'purple-', 'pink-', 'maroon-',
	'primary-', 'neutral-'
];
const PRIMITIVE_SINGLETONS = new Set( [ 'white', 'black', 'transparent' ] );

function isPrimitive( name ) {
	if ( PRIMITIVE_SINGLETONS.has( name ) ) {
		return true;
	}
	return PRIMITIVE_PREFIXES.some( p => name.startsWith( p ) );
}

// ---------------- gh fetch helpers ----------------

function ghFetch( path, ref ) {
	const result = spawnSync(
		'gh',
		[ 'api', `repos/${ path }?ref=${ ref }`, '--jq', '.content' ],
		{ encoding: 'utf8' }
	);
	if ( result.status !== 0 ) {
		return null;
	}
	const content = result.stdout.trim();
	if ( !content ) {
		return null;
	}
	return Buffer.from( content, 'base64' ).toString( 'utf8' );
}

function cached( key, fetcher ) {
	if ( !existsSync( CACHE ) ) {
		mkdirSync( CACHE, { recursive: true } );
	}
	const path = join( CACHE, key );
	if ( !NO_CACHE && existsSync( path ) ) {
		return readFileSync( path, 'utf8' );
	}
	const data = fetcher();
	if ( data !== null ) {
		writeFileSync( path, data );
	}
	return data;
}

// ---------------- Detect Codex version per MW branch ----------------

function detectCodex( mwBranch ) {
	const cacheKey = `mw-${ mwBranch }-package.json`;
	const pkgJson = cached( cacheKey, () =>
		ghFetch( `${ MW_REPO }/contents/package.json`, mwBranch )
	);
	if ( !pkgJson ) {
		return null;
	}
	const pkg = JSON.parse( pkgJson );
	const dep = ( pkg.dependencies && pkg.dependencies[ '@wikimedia/codex' ] ) ||
		( pkg.devDependencies && pkg.devDependencies[ '@wikimedia/codex' ] );
	if ( !dep ) {
		return null;
	}
	// e.g. "1.14.0", "^2.3.2", "~1.23.0" → strip range prefix
	return dep.replace( /^[\^~]/, '' );
}

// ---------------- Fetch Codex tokens ----------------

function fetchCodexFile( codexVersion, path ) {
	const cacheKey = `codex-${ codexVersion }-${ path.replace( /\//g, '_' ) }`;
	const data = cached( cacheKey, () =>
		ghFetch( `${ CODEX_REPO }/contents/packages/codex-design-tokens/src/${ path }`, `v${ codexVersion }` )
	);
	return data ? JSON.parse( data ) : null;
}

function fetchCodexAll( codexVersion ) {
	const themes = fetchCodexFile( codexVersion, 'themes/wikimedia-ui.json' );
	const application = fetchCodexFile( codexVersion, 'application.json' );
	const dark = fetchCodexFile( codexVersion, 'modes/dark.json' );
	return { themes, application, dark };
}

// ---------------- Citizen LESS parsing ----------------

function parseCitizenPrimitives() {
	const text = readFileSync( CITIZEN_PRIMITIVES, 'utf8' );
	const map = {};
	// Match any --color-* hex declaration: chromatic ramps (--color-gray-100)
	// and achromatic singletons (--color-white, --color-black).
	const re = /--color-([a-z][a-z0-9-]*?):\s*(#[0-9a-fA-F]{3,8})\s*;/g;
	let m;
	while ( ( m = re.exec( text ) ) !== null ) {
		map[ m[ 1 ] ] = m[ 2 ].toLowerCase();
	}
	return map;
}

function parseCitizenSemantics() {
	// Parse every .less file in the new-token module directory except
	// the entry (tokens.less) and the primitive files (already handled
	// by parseCitizenPrimitives). Each category file emits at
	// :root.citizen-v4 and is parsed for token declarations.
	const SKIP = new Set( [ 'tokens.less', 'primitives-codex.less', 'primitives-citizen.less' ] );
	const files = readdirSync( CITIZEN_TOKENS_DIR )
		.filter( name => name.endsWith( '.less' ) && !SKIP.has( name ) )
		.map( name => join( CITIZEN_TOKENS_DIR, name ) );

	const map = {}; // tokenName → { light, dark } (with 'both' if theme-invariant)

	const ldRe = /--([a-zA-Z][a-zA-Z0-9_-]*?):\s*light-dark\(\s*var\(\s*--color-([a-zA-Z0-9-]+)\s*\)\s*,\s*var\(\s*--color-([a-zA-Z0-9-]+)\s*\)\s*\)\s*;/g;
	const plainRe = /--([a-zA-Z][a-zA-Z0-9_-]*?):\s*var\(\s*--color-([a-zA-Z0-9-]+)\s*\)\s*;/g;
	// Literal `transparent` keyword (theme-invariant).
	const transRe = /--([a-zA-Z][a-zA-Z0-9_-]*?):\s*transparent\s*;/g;

	for ( const file of files ) {
		if ( !existsSync( file ) ) {
			continue;
		}
		const text = readFileSync( file, 'utf8' );
		let m;

		while ( ( m = ldRe.exec( text ) ) !== null ) {
			if ( !map[ m[ 1 ] ] ) {
				map[ m[ 1 ] ] = { light: m[ 2 ], dark: m[ 3 ] };
			}
		}

		while ( ( m = plainRe.exec( text ) ) !== null ) {
			if ( !map[ m[ 1 ] ] ) {
				map[ m[ 1 ] ] = { both: m[ 2 ] };
			}
		}

		while ( ( m = transRe.exec( text ) ) !== null ) {
			if ( !map[ m[ 1 ] ] ) {
				map[ m[ 1 ] ] = { both: 'transparent' };
			}
		}
	}

	return map;
}

// Follow Citizen's chain from a semantic name down to a primitive (or
// give up if the chain breaks or loops). Returns the primitive name, or
// the name we got stuck on.
function resolveCitizenChain( name, mode, citizenSems, depth = 0 ) {
	if ( depth > 10 || !name ) {
		return name;
	}
	if ( isPrimitive( name ) ) {
		return name;
	}
	// Citizen references use just the suffix after "--color-" (e.g. an entry
	// `--color-progressive` stores its value as "primary-700", and a chain
	// `--bg-progressive: var( --color-progressive )` records the next-link
	// as just "progressive"). Map keys, in contrast, retain their full LHS
	// name ("color-progressive"). So when following a chain, try the bare
	// name first, then prepend "color-" to find color-* semantic entries.
	const candidates = [ name, `color-${ name }` ];
	let entry = null;
	for ( const c of candidates ) {
		if ( citizenSems[ c ] ) {
			entry = citizenSems[ c ];
			break;
		}
	}
	if ( !entry ) {
		return name;
	}
	const next = entry.both || ( mode === 'light' ? entry.light : entry.dark );
	if ( !next ) {
		return name;
	}
	return resolveCitizenChain( next, mode, citizenSems, depth + 1 );
}

// ---------------- Codex token resolution ----------------

// Codex token names use camelCase ("gray100"); Citizen and Codex CSS output
// use kebab-case ("gray-100"). Normalize for cross-comparison.
function camelToKebab( name ) {
	return name.replace( /([a-z])(\d)/g, '$1-$2' );
}
function kebabToCamel( name ) {
	return name.replace( /-(\d)/, '$1' );
}

function resolveCodexRef( valueStr ) {
	// "{ color.gray1000 }" → { kind: 'ref', name: 'gray-1000' }
	// "#101418"           → { kind: 'literal', value: '#101418' }
	if ( !valueStr ) {
		return null;
	}
	const refMatch = valueStr.match( /\{\s*color\.([a-zA-Z0-9]+)\s*\}/ );
	if ( refMatch ) {
		return { kind: 'ref', name: camelToKebab( refMatch[ 1 ] ) };
	}
	const literalMatch = valueStr.match( /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|transparent)$/ );
	if ( literalMatch ) {
		return { kind: 'literal', value: literalMatch[ 1 ].toLowerCase() };
	}
	// Other expressions (color-mix, opacity refs, etc.) — pass through as-is
	return { kind: 'expr', value: valueStr };
}

function getCodexPrimitive( codex, kebabName ) {
	if ( !codex.themes || !codex.themes.color ) {
		return null;
	}
	const camel = kebabToCamel( kebabName );
	const entry = codex.themes.color[ camel ];
	return entry && entry.value ? entry.value.toLowerCase() : null;
}

function getCodexSemantic( codex, mode, category, name ) {
	// Codex's modes/dark.json only lists tokens that *override* the light
	// value. Tokens absent from dark.json inherit from application.json —
	// i.e. they are theme-invariant. So when checking dark, fall back to
	// application.json if dark.json doesn't override.
	const primary = mode === 'dark' ? codex.dark : codex.application;
	const fallback = mode === 'dark' ? codex.application : null;
	for ( const file of [ primary, fallback ] ) {
		if ( !file || !file[ category ] ) {
			continue;
		}
		const entry = file[ category ][ name ];
		if ( entry && entry.value ) {
			return resolveCodexRef( entry.value );
		}
	}
	return null;
}

// ---------------- Build tables ----------------

function unionKeys( ...maps ) {
	const set = new Set();
	for ( const map of maps ) {
		if ( map ) {
			for ( const k of Object.keys( map ) ) {
				set.add( k );
			}
		}
	}
	return [ ...set ].sort();
}

function buildPrimitivesTable( versions, codexData, citizenPrims ) {
	// Union of all primitive names across all Codex versions, then add any
	// Citizen-only primitives (e.g. neutral-N, primary-N) at the bottom.
	const codexUnion = unionKeys(
		...versions.map( v => codexData[ v ] && codexData[ v ].themes && codexData[ v ].themes.color )
	);

	const lines = [];
	lines.push( '## Primitives\n' );
	lines.push( `| Codex token | Citizen value | ${ versions.map( v => `Codex ${ v }` ).join( ' | ' ) } |` );
	lines.push( `| --- | --- | ${ versions.map( () => '---' ).join( ' | ' ) } |` );

	for ( const camel of codexUnion ) {
		const kebab = camelToKebab( camel );
		const citizenVal = citizenPrims[ kebab ] || '—';
		const codexVals = versions.map( v => {
			const val = getCodexPrimitive( codexData[ v ], kebab );
			return val || '—';
		} );

		// Flag drift: any cell where the value changed from the previous version
		const flagged = codexVals.map( ( v, i ) => {
			if ( i === 0 || v === '—' || codexVals[ i - 1 ] === '—' ) {
				return v;
			}
			return v !== codexVals[ i - 1 ] ? `**${ v }**` : v;
		} );

		// Flag if Citizen's stored value diverges from the latest Codex value
		const latestCodex = codexVals[ codexVals.length - 1 ];
		let citizenCell = citizenVal;
		if ( citizenVal !== '—' && latestCodex !== '—' && citizenVal !== latestCodex ) {
			citizenCell = `**${ citizenVal }** (Codex: ${ latestCodex })`;
		}

		lines.push( `| ${ kebab } | ${ citizenCell } | ${ flagged.join( ' | ' ) } |` );
	}

	return lines.join( '\n' );
}

function buildSemanticsTable( mode, versions, codexData, citizenSems, category ) {
	// Union of category keys across all Codex versions
	const codexUnion = unionKeys(
		...versions.map( v => {
			const file = mode === 'dark' ?
				codexData[ v ] && codexData[ v ].dark :
				codexData[ v ] && codexData[ v ].application;
			return file && file[ category ];
		} )
	);

	const lines = [];
	lines.push( `\n## Semantics — ${ category } (${ mode } mode)\n` );
	lines.push( `| Codex token | Citizen primitive | ${ versions.map( v => `Codex ${ v }` ).join( ' | ' ) } |` );
	lines.push( `| --- | --- | ${ versions.map( () => '---' ).join( ' | ' ) } |` );

	for ( const tokenName of codexUnion ) {
		const fullTokenKey = `${ category }-${ tokenName }`;
		const citizenEntry = citizenSems[ fullTokenKey ];
		let citizenPrim = '—';
		if ( citizenEntry ) {
			const immediate = citizenEntry.both ||
				( mode === 'light' ? citizenEntry.light : citizenEntry.dark );
			if ( immediate ) {
				// Follow Citizen's chain to a primitive (e.g.
				// bg-progressive → color-progressive → primary-700).
				citizenPrim = resolveCitizenChain( immediate, mode, citizenSems );
			}
		}

		const codexVals = versions.map( v => {
			const ref = getCodexSemantic( codexData[ v ], mode, category, tokenName );
			if ( !ref ) {
				return '—';
			}
			if ( ref.kind === 'ref' ) {
				return ref.name;
			}
			if ( ref.kind === 'literal' ) {
				return ref.value;
			}
			return ref.value;
		} );

		const flagged = codexVals.map( ( v, i ) => {
			if ( i === 0 || v === '—' || codexVals[ i - 1 ] === '—' ) {
				return v;
			}
			return v !== codexVals[ i - 1 ] ? `**${ v }**` : v;
		} );

		// Compare Citizen primitive choice against the latest Codex semantic
		// (with gray-N → neutral-N substitution for the comparison).
		const latestCodex = codexVals[ codexVals.length - 1 ];
		let citizenCell = citizenPrim;
		if ( citizenPrim !== '—' && latestCodex !== '—' ) {
			const expected = latestCodex.replace( /^gray-/, 'neutral-' );
			if ( citizenPrim !== expected && citizenPrim !== latestCodex ) {
				citizenCell = `**${ citizenPrim }** (Codex: ${ latestCodex })`;
			}
		}

		lines.push( `| ${ tokenName } | ${ citizenCell } | ${ flagged.join( ' | ' ) } |` );
	}

	return lines.join( '\n' );
}

function loadDeviations() {
	if ( !existsSync( DEVIATIONS_FILE ) ) {
		return { primitives: {}, semantics: {} };
	}
	const data = JSON.parse( readFileSync( DEVIATIONS_FILE, 'utf8' ) );
	return {
		primitives: data.primitives || {},
		semantics: data.semantics || {}
	};
}

// Look up a semantic token in the deviations map, honoring optional
// :light / :dark mode suffixes. Most-specific match wins.
function findDeviation( deviations, tokenName, mode ) {
	const scoped = `${ tokenName }:${ mode }`;
	if ( deviations[ scoped ] ) {
		return deviations[ scoped ];
	}
	if ( deviations[ tokenName ] ) {
		return deviations[ tokenName ];
	}
	return null;
}

function buildDriftSection( versions, codexData, citizenPrims, citizenSems, deviations ) {
	const lines = [];
	const documented = [];
	const codexHistory = [];
	const issues = [];

	const latest = versions[ versions.length - 1 ];
	const latestCodex = codexData[ latest ];
	if ( !latestCodex ) {
		return '\n## Drift summary\n\n_(latest Codex data unavailable)_';
	}

	function record( token, mode, message ) {
		const reason = mode === null ?
			deviations.primitives[ token ] :
			findDeviation( deviations.semantics, token, mode );
		if ( reason ) {
			documented.push( `${ message } _(${ reason })_` );
		} else {
			issues.push( message );
		}
	}

	// Primitive drift: Citizen value diverges from latest Codex.
	// Only check entries whose Codex value is a hex literal — alias entries
	// (e.g. accent → blue-700) and rgba/opacity tokens (modifier-*, opacity-*,
	// transparent, *-999) are reported in the primitives table but excluded
	// from the drift summary.
	if ( latestCodex.themes && latestCodex.themes.color ) {
		for ( const camel of Object.keys( latestCodex.themes.color ) ) {
			const entry = latestCodex.themes.color[ camel ];
			if ( !entry || !entry.value || !entry.value.startsWith( '#' ) ) {
				continue;
			}
			const kebab = camelToKebab( camel );
			const codexVal = entry.value.toLowerCase();
			const citizenVal = citizenPrims[ kebab ];
			if ( citizenVal && codexVal !== citizenVal ) {
				record( kebab, null, `- Primitive **${ kebab }**: Citizen has \`${ citizenVal }\`, Codex ${ latest } has \`${ codexVal }\`` );
			}
			if ( !citizenVal ) {
				record( kebab, null, `- Primitive **${ kebab }**: present in Codex ${ latest } but missing from Citizen \`primitives-codex.less\`` );
			}
		}
	}

	// Primitive value changed across Codex versions (informational)
	if ( latestCodex.themes && latestCodex.themes.color ) {
		for ( const camel of Object.keys( latestCodex.themes.color ) ) {
			const kebab = camelToKebab( camel );
			const valuesByVersion = versions.map( v => {
				const val = getCodexPrimitive( codexData[ v ], kebab );
				return { v, val };
			} ).filter( x => x.val );
			if ( valuesByVersion.length < 2 ) {
				continue;
			}
			const distinctValues = new Set( valuesByVersion.map( x => x.val ) );
			if ( distinctValues.size > 1 ) {
				const trail = valuesByVersion.map( x => `${ x.v }=\`${ x.val }\`` ).join( ', ' );
				// Citizen intentionally ships the latest Codex primitive
				// values to all MW versions — this is informational, not
				// drift from Citizen's perspective.
				codexHistory.push( `- **${ kebab }**: ${ trail }` );
			}
		}
	}

	// Semantic drift: missing tokens, divergent primitive choices.
	// For dark mode, take the union of dark.json keys and application.json
	// keys — tokens not overridden in dark.json still need their inherited
	// (light) value compared against Citizen's dark side.
	for ( const mode of [ 'light', 'dark' ] ) {
		for ( const category of [ 'background-color', 'color', 'border-color' ] ) {
			const primary = mode === 'dark' ? latestCodex.dark : latestCodex.application;
			const fallback = mode === 'dark' ? latestCodex.application : null;
			const tokenNames = new Set( [
				...( primary && primary[ category ] ? Object.keys( primary[ category ] ) : [] ),
				...( fallback && fallback[ category ] ? Object.keys( fallback[ category ] ) : [] )
			] );
			if ( tokenNames.size === 0 ) {
				continue;
			}
			for ( const tokenName of tokenNames ) {
				const fullKey = `${ category }-${ tokenName }`;
				const ref = getCodexSemantic( latestCodex, mode, category, tokenName );
				const citizen = citizenSems[ fullKey ];
				if ( !ref || ref.kind !== 'ref' ) {
					continue;
				}
				if ( !citizen ) {
					record( fullKey, mode, `- Semantic **${ fullKey }** (${ mode }): Codex maps to \`${ ref.name }\`, missing from Citizen` );
					continue;
				}
				const immediate = citizen.both ||
					( mode === 'light' ? citizen.light : citizen.dark );
				if ( !immediate ) {
					continue;
				}
				const citizenPrim = resolveCitizenChain( immediate, mode, citizenSems );
				// Codex gray-N → Citizen neutral-N (tinted neutrals);
				// Codex blue-N → Citizen primary-N (progressive accent).
				const expected = ref.name
					.replace( /^gray-/, 'neutral-' )
					.replace( /^blue-/, 'primary-' );
				if ( citizenPrim !== expected && citizenPrim !== ref.name ) {
					record( fullKey, mode, `- Semantic **${ fullKey }** (${ mode }): Codex maps to \`${ ref.name }\`, Citizen maps to \`${ citizenPrim }\`` );
				}
			}
		}
	}

	lines.push( '\n## Documented deviations\n' );
	if ( documented.length === 0 ) {
		lines.push( '_None._' );
	} else {
		lines.push( ...documented );
	}

	lines.push( '\n## Codex primitive history (informational)\n' );
	lines.push( '_Primitives that Codex retuned between versions. Citizen intentionally ships the latest value across all supported MW versions, so these entries do not represent drift in Citizen — they document Codex\'s own evolution._' );
	lines.push( '' );
	if ( codexHistory.length === 0 ) {
		lines.push( '_No primitive values changed across the supported Codex versions._' );
	} else {
		lines.push( ...codexHistory );
	}

	lines.push( '\n## Drift summary\n' );
	if ( issues.length === 0 ) {
		lines.push( '_No drift detected. Citizen new pipeline mappings are aligned with the latest Codex._' );
	} else {
		lines.push( ...issues );
	}

	return lines.join( '\n' );
}

// ---------------- Main ----------------

function main() {
	process.stderr.write( 'Detecting Codex versions per MW branch…\n' );
	const versions = {}; // codexVersion → mwBranch
	for ( const branch of MW_BRANCHES ) {
		const codex = detectCodex( branch );
		if ( codex ) {
			if ( !versions[ codex ] ) {
				versions[ codex ] = [];
			}
			versions[ codex ].push( branch );
			process.stderr.write( `  ${ branch } → Codex ${ codex }\n` );
		} else {
			process.stderr.write( `  ${ branch } → (could not detect)\n` );
		}
	}

	const codexVersions = Object.keys( versions ).sort( ( a, b ) => {
		// Crude semver sort
		const pa = a.split( '.' ).map( Number );
		const pb = b.split( '.' ).map( Number );
		for ( let i = 0; i < 3; i++ ) {
			if ( pa[ i ] !== pb[ i ] ) {
				return pa[ i ] - pb[ i ];
			}
		}
		return 0;
	} );

	process.stderr.write( '\nFetching Codex token data…\n' );
	const codexData = {};
	for ( const v of codexVersions ) {
		process.stderr.write( `  v${ v }…\n` );
		codexData[ v ] = fetchCodexAll( v );
	}

	process.stderr.write( '\nParsing Citizen LESS…\n' );
	const citizenPrims = parseCitizenPrimitives();
	const citizenSems = parseCitizenSemantics();
	const deviations = loadDeviations();
	const deviationCount = Object.keys( deviations.primitives ).length + Object.keys( deviations.semantics ).length;
	process.stderr.write( `  ${ Object.keys( citizenPrims ).length } primitives, ${ Object.keys( citizenSems ).length } semantic mappings, ${ deviationCount } documented deviations\n\n` );

	// ---------------- Output ----------------

	const out = [];
	out.push( '# Codex token audit\n' );
	out.push( '_Generated by `scripts/codex-audit.mjs`. Bold cells flag drift between Citizen and the latest Codex, or value changes across Codex versions._\n' );

	out.push( '## MediaWiki ↔ Codex version map\n' );
	out.push( '| MW branch | Codex version |' );
	out.push( '| --- | --- |' );
	for ( const branch of MW_BRANCHES ) {
		const matched = codexVersions.find( cv => versions[ cv ].includes( branch ) );
		out.push( `| ${ branch } | ${ matched ? `v${ matched }` : '_(detection failed)_' } |` );
	}
	out.push( '' );

	out.push( buildPrimitivesTable( codexVersions, codexData, citizenPrims ) );
	for ( const category of [ 'background-color', 'color', 'border-color' ] ) {
		out.push( buildSemanticsTable( 'light', codexVersions, codexData, citizenSems, category ) );
		out.push( buildSemanticsTable( 'dark', codexVersions, codexData, citizenSems, category ) );
	}
	out.push( buildDriftSection( codexVersions, codexData, citizenPrims, citizenSems, deviations ) );

	process.stdout.write( out.join( '\n' ) + '\n' );
}

main();
