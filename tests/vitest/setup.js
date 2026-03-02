/**
 * Vitest setup file.
 *
 * Registers a custom require extension for .mustache files (loads real
 * template content) and stubs virtual ResourceLoader modules that don't
 * exist on disk.
 */

const Module = require( 'module' );
const fs = require( 'fs' );
const path = require( 'path' );

// Register .mustache as a loadable extension — read actual template content.
Module._extensions[ '.mustache' ] = function ( mod, filename ) {
	mod.exports = fs.readFileSync( filename, 'utf8' );
};

// Redirect virtual ResourceLoader modules and template paths that don't
// resolve correctly outside MediaWiki's ResourceLoader environment.
const originalResolveFilename = Module._resolveFilename;
const TEMPLATES_DIR = path.resolve( __dirname, '../../templates' );
Module._resolveFilename = function ( request, parent, ...rest ) {
	if ( parent && parent.filename &&
		parent.filename.includes( 'skins.citizen.scripts' ) ) {
		if ( request === './tableOfContentsConfig.json' ) {
			return path.resolve( __dirname, 'mocks/tableOfContentsConfig.js' );
		}
		if ( request === './config.json' ) {
			return path.resolve( __dirname, 'mocks/config.js' );
		}
		// Redirect template requires to the real templates at the project root.
		// ResourceLoader packages these from templates/ but the module's
		// relative path (./templates/Foo.mustache) would resolve to a
		// non-existent subdirectory inside resources/skins.citizen.scripts/.
		const templateMatch = request.match( /^\.\/templates\/(.+\.mustache)$/ );
		if ( templateMatch ) {
			return path.resolve( TEMPLATES_DIR, templateMatch[ 1 ] );
		}
	}
	if ( parent && parent.filename &&
		parent.filename.includes( 'skins.citizen.preferences' ) ) {
		if ( request === './config.json' ) {
			return path.resolve( __dirname, 'mocks/preferencesConfig.js' );
		}
		if ( request === './overrides.json' ) {
			return path.resolve( __dirname, 'mocks/preferencesOverrides.js' );
		}
		// Stub .vue imports from non-Vue JS files (e.g. init.js).
		// Vue SFCs go through Vite's plugin pipeline and don't hit this path.
		if ( request === './App.vue' ) {
			return path.resolve( __dirname, 'mocks/AppStub.js' );
		}
	}
	return originalResolveFilename.call( this, request, parent, ...rest );
};
