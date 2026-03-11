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
		getUrl: vi.fn( ( title, params ) => {
			let url = '/wiki/' + ( title || '' );
			if ( params && typeof params === 'object' ) {
				const search = new URLSearchParams( params );
				url += '?' + search.toString();
			}
			return url;
		} ),
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
				const listeners = [];
				let lastArgs = null;
				registry[ name ] = {
					add: vi.fn( ( fn ) => {
						listeners.push( fn );
						// Replay last fire to late subscriber
						if ( lastArgs !== null ) {
							fn( ...lastArgs );
						}
					} ),
					fire: vi.fn( ( ...args ) => {
						lastArgs = args;
						listeners.forEach( ( fn ) => fn( ...args ) );
					} ),
					remove: vi.fn( ( fn ) => {
						const idx = listeners.indexOf( fn );
						if ( idx !== -1 ) {
							listeners.splice( idx, 1 );
						}
					} ),
					_reset() {
						listeners.length = 0;
						lastArgs = null;
						registry[ name ].add.mockClear();
						registry[ name ].fire.mockClear();
						registry[ name ].remove.mockClear();
					}
				};
			}
			return registry[ name ];
		};
	} )() ),
	html: {
		escape: vi.fn( ( s ) => s )
	},
	messages: {
		set: vi.fn(),
		get: vi.fn( ( key ) => key )
	},
	message: vi.fn( ( key ) => ( {
		text: vi.fn( () => key ),
		exists: vi.fn( () => true ),
		parse: vi.fn( () => key )
	} ) ),
	msg: vi.fn( ( key ) => key ),
	language: {
		convertNumber: vi.fn( ( n ) => String( n ) )
	},
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
