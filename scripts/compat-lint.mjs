#!/usr/bin/env node
/**
 * Enforces the cache-compat window: slices and stubs must not outlive
 * WINDOW minor releases (see AGENTS.md "Cache compatibility").
 *
 *   node scripts/compat-lint.mjs   # exits 1 and lists every violation
 *
 * Slices live in resources/compat/ and are named <major>.<minor>[.<patch>].less
 * or .js. stubs.json maps a renamed-away ResourceLoader module to the version
 * that introduced its stub.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const WINDOW = 6;

export function parseVersion( fileName ) {
	const m = /^(\d+)\.(\d+)(?:\.\d+)?\.(?:less|js)$/.exec( fileName );
	return m ? { major: Number( m[ 1 ] ), minor: Number( m[ 2 ] ) } : null;
}

function isExpired( version, current ) {
	return version.major < current.major ||
		( version.major === current.major && current.minor - version.minor > WINDOW );
}

export function findViolations( compatFiles, stubs, moduleNames, current ) {
	const violations = [];
	for ( const file of compatFiles ) {
		if ( file === 'README.md' || file === 'stubs.json' ) {
			continue;
		}
		const version = parseVersion( file );
		if ( !version ) {
			violations.push( `resources/compat/${ file }: filename does not parse as <version>.less|.js` );
		} else if ( isExpired( version, current ) ) {
			violations.push( `resources/compat/${ file }: outside the ${ WINDOW }-release compat window — delete it` );
		}
	}
	for ( const [ stub, added ] of Object.entries( stubs ) ) {
		const version = parseVersion( `${ added }.less` );
		if ( !version || isExpired( version, current ) ) {
			violations.push( `stubs.json: stub "${ stub }" (added ${ added }) is outside the window — remove the stub module and entry` );
		}
		if ( !moduleNames.includes( stub ) ) {
			violations.push( `stubs.json: stub "${ stub }" is not declared in skin.json` );
		}
	}
	return violations;
}

const isCli = process.argv[ 1 ] && fileURLToPath( import.meta.url ) === path.resolve( process.argv[ 1 ] );
if ( isCli ) {
	const root = path.join( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
	const skin = JSON.parse( readFileSync( path.join( root, 'skin.json' ), 'utf8' ) );
	const [ major, minor ] = skin.version.split( '.' ).map( Number );
	const compatDir = path.join( root, 'resources/compat' );
	const compatFiles = existsSync( compatDir ) ? readdirSync( compatDir ) : [];
	const stubsPath = path.join( compatDir, 'stubs.json' );
	const stubs = existsSync( stubsPath ) ? JSON.parse( readFileSync( stubsPath, 'utf8' ) ) : {};
	const moduleNames = Object.keys( skin.ResourceModules ?? {} );

	const violations = findViolations( compatFiles, stubs, moduleNames, { major, minor } );
	if ( violations.length > 0 ) {
		console.error( 'compat-lint failures:\n' + violations.map( ( v ) => `  - ${ v }` ).join( '\n' ) );
		process.exit( 1 );
	}
	console.log( 'compat-lint: OK' );
}
