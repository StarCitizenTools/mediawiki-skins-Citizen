import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

/**
 * Vite plugin that transforms MediaWiki-style CommonJS patterns in Vue SFC
 * script blocks into ESM-compatible code for Vitest.
 *
 * MediaWiki's ResourceLoader expects:
 *   const { ... } = require( 'vue' );
 *   const Foo = require( './Foo.vue' );
 *   module.exports = exports = defineComponent( ... );
 *
 * Vite's Vue SFC compiler processes scripts as ESM, where module/exports
 * are read-only and CJS require() of .vue files cannot go through the SFC
 * compiler. This plugin rewrites:
 * 1. module.exports = exports = ... → export default ...
 * 2. const Foo = require( './Foo.vue' ) → import Foo from './Foo.vue'
 *    (hoisted to the top of the script block)
 *
 * Note: Non-.vue require() calls (e.g. require('vue')) are left as-is.
 * vite-node provides a CJS-compatible require shim for those.
 */
function mediawikiVueCjsPlugin() {
	return {
		name: 'mediawiki-vue-cjs',
		enforce: 'pre',
		transform( code, id ) {
			if ( !id.endsWith( '.vue' ) ) {
				return null;
			}
			let transformed = code;
			// Replace module.exports = exports = ... with export default ...
			transformed = transformed.replace(
				/module\.exports\s*=\s*exports\s*=\s*/g,
				'export default '
			);
			// Rewrite const Foo = require( './Foo.vue' ) to import Foo from './Foo.vue'
			// and hoist the import to the top of the <script> block.
			const vueRequirePattern = /^(const\s+(\w+)\s*=\s*require\(\s*'([^']+\.vue)'\s*\);?\s*)$/gm;
			const imports = [];
			transformed = transformed.replace( vueRequirePattern, ( match, fullLine, varName, modulePath ) => {
				imports.push( `import ${ varName } from '${ modulePath }';` );
				return '';
			} );
			if ( imports.length > 0 ) {
				transformed = transformed.replace(
					/<script>/,
					'<script>\n' + imports.join( '\n' )
				);
			}
			if ( transformed !== code ) {
				return { code: transformed, map: null };
			}
			return null;
		}
	};
}

export default defineConfig( {
	plugins: [
		mediawikiVueCjsPlugin(),
		vue()
	],
	test: {
		include: [ 'tests/vitest/**/*.test.js' ],
		globals: true,
		setupFiles: [ 'tests/vitest/setup.js' ],
		coverage: {
			provider: 'v8',
			reportsDirectory: 'coverage/js',
			reporter: [ 'lcov', 'text' ],
			include: [ 'resources/**/*.{js,vue}' ]
		}
	}
} );
