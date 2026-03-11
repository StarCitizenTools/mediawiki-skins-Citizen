const { Dropdown } = require( '../../../resources/skins.citizen.scripts/dropdown.js' );

describe( 'Dropdown', () => {
	let details;
	let summary;
	let target;
	let win;
	let doc;

	beforeEach( () => {
		details = {
			open: false,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		};
		summary = {
			contains: vi.fn().mockReturnValue( false )
		};
		target = {
			contains: vi.fn().mockReturnValue( false ),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			querySelectorAll: vi.fn().mockReturnValue( [] )
		};
		win = {
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			jQuery: {
				fn: {
					updateTooltipAccessKeys: {
						getAccessKeyPrefix: vi.fn().mockReturnValue( 'ctrl-' )
					}
				}
			}
		};
		doc = {
			createElement: vi.fn().mockReturnValue( {
				classList: { add: vi.fn() },
				innerText: ''
			} )
		};
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	function create( overrides = {} ) {
		return new Dropdown( {
			details,
			summary,
			target,
			window: win,
			document: doc,
			isPointerDevice: true,
			...overrides
		} );
	}

	describe( 'dismiss', () => {
		it( 'should close details when open', () => {
			const dropdown = create();
			details.open = true;

			dropdown.dismiss();

			expect( details.open ).toBe( false );
		} );

		it( 'should no-op when details is already closed', () => {
			const dropdown = create();
			details.open = false;

			dropdown.dismiss();

			expect( details.open ).toBe( false );
		} );
	} );

	describe( 'init', () => {
		it( 'should register toggle listener on details', () => {
			const dropdown = create();

			dropdown.init();

			expect( details.addEventListener ).toHaveBeenCalledWith(
				'toggle',
				expect.any( Function )
			);
		} );

		it( 'should register beforeunload listener on window', () => {
			const dropdown = create();

			dropdown.init();

			expect( win.addEventListener ).toHaveBeenCalledWith(
				'beforeunload',
				expect.any( Function )
			);
		} );
	} );

	describe( 'dismissOnEscape', () => {
		it( 'should dismiss on Escape key', () => {
			const dropdown = create();
			dropdown.init();
			details.open = true;

			const toggleHandler = details.addEventListener.mock.calls
				.find( ( call ) => call[ 0 ] === 'toggle' )[ 1 ];
			toggleHandler();

			const keyupHandler = win.addEventListener.mock.calls
				.find( ( call ) => call[ 0 ] === 'keyup' )[ 1 ];
			keyupHandler( { key: 'Escape' } );

			expect( details.open ).toBe( false );
		} );

		it( 'should not dismiss on other keys', () => {
			const dropdown = create();
			dropdown.init();
			details.open = true;

			const toggleHandler = details.addEventListener.mock.calls
				.find( ( call ) => call[ 0 ] === 'toggle' )[ 1 ];
			toggleHandler();

			const keyupHandler = win.addEventListener.mock.calls
				.find( ( call ) => call[ 0 ] === 'keyup' )[ 1 ];
			keyupHandler( { key: 'Enter' } );

			expect( details.open ).toBe( true );
		} );
	} );

	describe( 'dismissIfExternalEventTarget', () => {
		it( 'should dismiss when click is outside target and summary', () => {
			const dropdown = create();
			dropdown.init();
			details.open = true;

			const toggleHandler = details.addEventListener.mock.calls
				.find( ( call ) => call[ 0 ] === 'toggle' )[ 1 ];
			toggleHandler();

			target.contains.mockReturnValue( false );
			summary.contains.mockReturnValue( false );

			const mousedownHandler = win.addEventListener.mock.calls
				.find( ( call ) => call[ 0 ] === 'mousedown' )[ 1 ];
			mousedownHandler( { target: {} } );

			expect( details.open ).toBe( false );
		} );

		it( 'should not dismiss when click is inside target', () => {
			const dropdown = create();
			dropdown.init();
			details.open = true;

			const toggleHandler = details.addEventListener.mock.calls
				.find( ( call ) => call[ 0 ] === 'toggle' )[ 1 ];
			toggleHandler();

			target.contains.mockReturnValue( true );

			const mousedownHandler = win.addEventListener.mock.calls
				.find( ( call ) => call[ 0 ] === 'mousedown' )[ 1 ];
			mousedownHandler( { target: {} } );

			expect( details.open ).toBe( true );
		} );

		it( 'should not dismiss when click is inside summary', () => {
			const dropdown = create();
			dropdown.init();
			details.open = true;

			const toggleHandler = details.addEventListener.mock.calls
				.find( ( call ) => call[ 0 ] === 'toggle' )[ 1 ];
			toggleHandler();

			summary.contains.mockReturnValue( true );

			const mousedownHandler = win.addEventListener.mock.calls
				.find( ( call ) => call[ 0 ] === 'mousedown' )[ 1 ];
			mousedownHandler( { target: {} } );

			expect( details.open ).toBe( true );
		} );
	} );

	describe( 'dismissOnLinkClick', () => {
		it( 'should dismiss when clicking a link', () => {
			const dropdown = create();
			dropdown.init();
			details.open = true;

			const toggleHandler = details.addEventListener.mock.calls
				.find( ( call ) => call[ 0 ] === 'toggle' )[ 1 ];
			toggleHandler();

			const clickHandler = target.addEventListener.mock.calls
				.find( ( call ) => call[ 0 ] === 'click' )[ 1 ];
			clickHandler( { target: { closest: vi.fn().mockReturnValue( {} ) } } );

			expect( details.open ).toBe( false );
		} );

		it( 'should not dismiss when clicking a non-link element', () => {
			const dropdown = create();
			dropdown.init();
			details.open = true;

			const toggleHandler = details.addEventListener.mock.calls
				.find( ( call ) => call[ 0 ] === 'toggle' )[ 1 ];
			toggleHandler();

			const clickHandler = target.addEventListener.mock.calls
				.find( ( call ) => call[ 0 ] === 'click' )[ 1 ];
			clickHandler( { target: { closest: vi.fn().mockReturnValue( null ) } } );

			expect( details.open ).toBe( true );
		} );
	} );

	describe( 'bind/unbind', () => {
		it( 'should bind listeners when details opens', () => {
			const dropdown = create();
			dropdown.init();
			details.open = true;

			const toggleHandler = details.addEventListener.mock.calls
				.find( ( call ) => call[ 0 ] === 'toggle' )[ 1 ];
			toggleHandler();

			expect( target.addEventListener ).toHaveBeenCalledWith(
				'click', expect.any( Function )
			);
			expect( win.addEventListener ).toHaveBeenCalledWith(
				'mousedown', expect.any( Function )
			);
			expect( win.addEventListener ).toHaveBeenCalledWith(
				'keyup', expect.any( Function )
			);
		} );

		it( 'should unbind listeners when details closes', () => {
			const dropdown = create();
			dropdown.init();

			// Open then close
			details.open = true;
			const toggleHandler = details.addEventListener.mock.calls
				.find( ( call ) => call[ 0 ] === 'toggle' )[ 1 ];
			toggleHandler();

			details.open = false;
			toggleHandler();

			expect( target.removeEventListener ).toHaveBeenCalledWith(
				'click', expect.any( Function )
			);
			expect( win.removeEventListener ).toHaveBeenCalledWith(
				'mousedown', expect.any( Function )
			);
			expect( win.removeEventListener ).toHaveBeenCalledWith(
				'keyup', expect.any( Function )
			);
		} );
	} );

	describe( 'addKeyhint', () => {
		it( 'should skip keyhints for non-pointer devices', () => {
			const dropdown = create( { isPointerDevice: false } );

			dropdown.init();

			expect( target.querySelectorAll ).not.toHaveBeenCalled();
		} );

		it( 'should skip keyhints when jQuery is not available', () => {
			const dropdown = create( { window: { ...win, jQuery: undefined } } );

			dropdown.init();

			expect( target.querySelectorAll ).not.toHaveBeenCalled();
		} );

		it( 'should skip keyhints when getAccessKeyPrefix is not available', () => {
			const dropdown = create( {
				window: {
					...win,
					jQuery: { fn: { updateTooltipAccessKeys: {} } }
				}
			} );

			dropdown.init();

			expect( target.querySelectorAll ).not.toHaveBeenCalled();
		} );

		it( 'should create kbd elements for links with accesskeys', () => {
			const link = {
				getAttribute: vi.fn().mockReturnValue( 'e' ),
				append: vi.fn()
			};
			target.querySelectorAll.mockReturnValue( [ link ] );
			const kbd = { classList: { add: vi.fn() }, innerText: '' };
			doc.createElement.mockReturnValue( kbd );

			const dropdown = create();
			dropdown.init();

			expect( doc.createElement ).toHaveBeenCalledWith( 'kbd' );
			expect( kbd.classList.add ).toHaveBeenCalledWith( 'citizen-keyboard-hint-key' );
			expect( link.append ).toHaveBeenCalledWith( kbd );
			expect( kbd.innerText ).toBe( '⌃ e' );
		} );
	} );
} );
