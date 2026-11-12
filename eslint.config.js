'use strict';

const { defineConfig, globalIgnores } = require( 'eslint/config' );
const globals = require( 'globals' );
const wikimedia = require( 'eslint-config-wikimedia/flat' );

// Each of these has its own config, and the root (server) config does not apply to it.
const rootDirs = {
	resources: [ 'resources/**' ],
	vitest: [ 'tests/vitest/**' ]
};

module.exports = defineConfig( [
	globalIgnores( [
		'coverage/',
		'design/',
		'dist/',
		'docs/',
		'i18n/',
		'scripts/',
		'vendor/',
		'vitest.config.js'
	] ),

	// Config files at the repository root
	{
		ignores: Object.values( rootDirs ).flat(),
		extends: [ wikimedia( 'server' ) ]
	},

	// Code which runs in MediaWiki
	{
		files: rootDirs.resources,
		extends: [ wikimedia( 'client', 'mediawiki' ) ],
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: 'module'
		},
		settings: {
			jsdoc: {
				mode: 'typescript'
			}
		},
		rules: {
			'no-implicit-globals': 'warn',
			'es-x/no-object-fromentries': 'warn',
			'es-x/no-object-values': 'off',
			'es-x/no-optional-chaining': 'off',
			'es-x/no-nullish-coalescing-operators': 'off',
			'es-x/no-symbol-prototype-description': 'off',
			'es-x/no-rest-spread-properties': 'off',
			'es-x/no-object-entries': 'off',
			'es-x/no-array-prototype-includes': 'off',
			'es-x/no-async-functions': 'off',
			'es-x/no-array-prototype-flat': 'off',
			'compat/compat': 'warn',
			'mediawiki/class-doc': 'off',
			'mediawiki/no-nodelist-unsupported-methods': 'off',
			'jsdoc/no-undefined-types': [
				'warn',
				{
					definedTypes: [
						'JQuery',
						'RequestInit'
					]
				}
			]
		}
	},
	{
		files: [ 'resources/skins.citizen.commandPalette/**' ],
		rules: {
			'max-len': 'off'
		}
	},

	// Vitest tests
	{
		files: rootDirs.vitest,
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: 'commonjs',
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2015,
				vi: 'readonly',
				describe: 'readonly',
				it: 'readonly',
				test: 'readonly',
				expect: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				beforeAll: 'readonly',
				afterAll: 'readonly',
				globalThis: 'readonly'
			}
		},
		rules: {
			'no-undef': 'error',
			'no-unused-vars': 'warn'
		}
	}
] );
