import { defineConfig } from 'vitest/config';

export default defineConfig( {
	test: {
		include: [ 'tests/vitest/**/*.test.js' ],
		globals: true,
		coverage: {
			provider: 'v8',
			reportsDirectory: 'coverage/js',
			reporter: [ 'lcov', 'text' ],
			include: [ 'resources/**/*.js' ]
		}
	}
} );
