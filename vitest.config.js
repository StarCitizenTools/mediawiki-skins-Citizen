import { defineConfig } from 'vitest/config';

export default defineConfig( {
	test: {
		include: [ 'tests/vitest/**/*.test.js' ],
		globals: true
	}
} );
