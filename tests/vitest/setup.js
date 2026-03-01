/**
 * Vitest setup file.
 *
 * Registers a custom require extension for .mustache files and stubs
 * virtual ResourceLoader modules that don't exist on disk.
 */

const Module = require( 'module' );
const path = require( 'path' );

// Register .mustache as a loadable extension — return empty string (template content)
Module._extensions[ '.mustache' ] = function ( mod ) {
	mod.exports = '';
};

// Stub virtual ResourceLoader JSON configs that don't exist on disk.
// Intercept require() for specific virtual modules.
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function ( request, parent, ...rest ) {
	if ( parent && parent.filename &&
		parent.filename.includes( 'skins.citizen.scripts' ) ) {
		if ( request === './tableOfContentsConfig.json' ) {
			return path.resolve( __dirname, 'mocks/tableOfContentsConfig.js' );
		}
		if ( request === './config.json' ) {
			return path.resolve( __dirname, 'mocks/config.js' );
		}
	}
	return originalResolveFilename.call( this, request, parent, ...rest );
};
