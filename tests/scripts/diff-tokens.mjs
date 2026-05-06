/**
 * Compute a diff between two token capture JSON objects.
 *
 * @param {Object} a Capture from one mode (e.g. legacy)
 * @param {Object} b Capture from another mode (e.g. v2)
 * @return {Array<{token: string, a?: string, b?: string, status: 'added'|'removed'|'changed'}>}
 *   Sorted alphabetically by token name.
 */
export function computeDiff( a, b ) {
	const tokensA = a.tokens || {};
	const tokensB = b.tokens || {};
	const allKeys = new Set( [ ...Object.keys( tokensA ), ...Object.keys( tokensB ) ] );
	const diff = [];

	for ( const token of [ ...allKeys ].sort() ) {
		const valA = tokensA[ token ];
		const valB = tokensB[ token ];

		if ( valA === undefined && valB !== undefined ) {
			diff.push( { token, b: valB, status: 'added' } );
		} else if ( valA !== undefined && valB === undefined ) {
			diff.push( { token, a: valA, status: 'removed' } );
		} else if ( valA !== valB ) {
			diff.push( { token, a: valA, b: valB, status: 'changed' } );
		}
	}

	return diff;
}

/**
 * Format a diff as a markdown table.
 *
 * @param {Array} diff Output of computeDiff
 * @return {string} Markdown
 */
export function formatMarkdownTable( diff ) {
	if ( diff.length === 0 ) {
		return 'No differences between captures.\n';
	}

	const lines = [
		'| Token | A | B | Status |',
		'| --- | --- | --- | --- |'
	];

	for ( const row of diff ) {
		lines.push( `| \`${ row.token }\` | \`${ row.a ?? '—' }\` | \`${ row.b ?? '—' }\` | ${ row.status } |` );
	}

	return lines.join( '\n' ) + '\n';
}

// CLI entry: node diff-tokens.mjs <a.json> <b.json>
// Detect direct invocation (ESM equivalent of require.main === module).
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { argv, stdout, stderr, exit } from 'node:process';

if ( process.argv[ 1 ] && fileURLToPath( import.meta.url ) === process.argv[ 1 ] ) {
	const [ , , aPath, bPath ] = argv;
	if ( !aPath || !bPath ) {
		stderr.write( 'Usage: node diff-tokens.mjs <a.json> <b.json>\n' );
		exit( 1 );
	}

	const a = JSON.parse( readFileSync( aPath, 'utf8' ) );
	const b = JSON.parse( readFileSync( bPath, 'utf8' ) );
	const diff = computeDiff( a, b );

	stdout.write( formatMarkdownTable( diff ) );
}
