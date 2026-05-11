#!/usr/bin/env node
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { argv, exit } from "node:process";

const VERSION_RE = /^v(\d+)\.(\d+)$/;

export function buildManifest( entries ) {
	const versions = entries
		.map( ( name ) => {
			const m = VERSION_RE.exec( name );
			if ( !m ) {
				return null;
			}
			return {
				id: name,
				label: name,
				path: `/${ name }/`,
				_sort: [ Number( m[ 1 ] ), Number( m[ 2 ] ) ],
			};
		} )
		.filter( ( v ) => v !== null )
		.sort( ( a, b ) => b._sort[ 0 ] - a._sort[ 0 ] || b._sort[ 1 ] - a._sort[ 1 ] )
		.map( ( { _sort, ...rest } ) => rest );

	const manifest = { main: "/", versions };
	if ( versions.length > 0 ) {
		manifest.stable = versions[ 0 ].id;
	}
	return manifest;
}

export function listDir( dir ) {
	return readdirSync( dir ).filter( ( name ) => {
		try {
			return statSync( join( dir, name ) ).isDirectory();
		} catch {
			return false;
		}
	} );
}

function main() {
	const dir = argv[ 2 ];
	if ( !dir ) {
		console.error( "usage: generate-versions-json.mjs <gh-pages-dir>" );
		exit( 1 );
	}
	const manifest = buildManifest( listDir( dir ) );
	writeFileSync( join( dir, "versions.json" ), `${ JSON.stringify( manifest, null, 2 ) }\n` );
	console.log( `wrote ${ dir }/versions.json (${ manifest.versions.length } versions)` );
}

if ( import.meta.url === `file://${ argv[ 1 ] }` ) {
	main();
}
