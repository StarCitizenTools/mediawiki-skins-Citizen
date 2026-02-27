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
	if ( request === './tableOfContentsConfig.json' &&
		parent && parent.filename &&
		parent.filename.includes( 'skins.citizen.scripts' ) ) {
		return path.resolve( __dirname, 'mocks/tableOfContentsConfig.js' );
	}
	return originalResolveFilename.call( this, request, parent, ...rest );
};
