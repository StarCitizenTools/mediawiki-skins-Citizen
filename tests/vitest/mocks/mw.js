/**
 * Shared mock for MediaWiki's `mw` global object.
 *
 * Provides stubs for commonly used mw APIs. Tests can override
 * individual methods via vi.spyOn() or by assigning directly.
 */

const mw = {
	config: {
		get: vi.fn( () => null )
	},
	storage: {
		get: vi.fn( () => null ),
		set: vi.fn()
	},
	util: {
		throttle: vi.fn( ( fn ) => fn ),
		debounce: vi.fn( ( fn ) => fn ),
		getTargetFromFragment: vi.fn( () => null ),
		escapeRegExp: vi.fn( ( str ) => str.replace( /[\\^$.*+?()[\]{}|]/g, '\\$&' ) )
	},
	loader: {
		using: vi.fn( () => Promise.resolve() ),
		load: vi.fn(),
		require: vi.fn( () => ( {} ) ),
		getState: vi.fn( () => 'ready' ),
		moduleRegistry: {}
	},
	hook: vi.fn( ( () => {
		const registry = {};
		return ( name ) => {
			if ( !registry[ name ] ) {
				registry[ name ] = {
					add: vi.fn(),
					fire: vi.fn(),
					remove: vi.fn()
				};
			}
			return registry[ name ];
		};
	} )() ),
	html: {
		escape: vi.fn( ( s ) => s )
	},
	message: vi.fn( ( key ) => ( {
		text: vi.fn( () => key ),
		exists: vi.fn( () => true ),
		parse: vi.fn( () => key )
	} ) ),
	msg: vi.fn( ( key ) => key ),
	log: {
		error: vi.fn(),
		warn: vi.fn()
	},
	notify: vi.fn(),
	template: {
		getCompiler: vi.fn( () => ( {
			compile: vi.fn( () => ( {
				render: vi.fn( () => ( {
					html: vi.fn( () => '' )
				} ) )
			} ) )
		} ) )
	},
	requestIdleCallback: vi.fn( ( fn ) => fn() )
};

module.exports = mw;
