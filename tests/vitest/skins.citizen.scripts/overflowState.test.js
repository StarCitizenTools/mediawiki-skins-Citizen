const { createOverflowState } = require( '../../../resources/skins.citizen.scripts/overflowElements/state.js' );

describe( 'createOverflowState', () => {
	let element;
	let content;
	let wrapper;
	let win;

	beforeEach( () => {
		element = { scrollWidth: 500 };
		content = { scrollLeft: 0, offsetWidth: 300 };
		wrapper = {
			classList: {
				contains: vi.fn().mockReturnValue( false ),
				add: vi.fn(),
				remove: vi.fn()
			}
		};
		win = {
			requestAnimationFrame: vi.fn( ( cb ) => cb() )
		};
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	function create( overrides = {} ) {
		return createOverflowState( {
			window: win,
			element,
			content,
			wrapper,
			stickyHeader: null,
			...overrides
		} );
	}

	describe( 'updateState', () => {
		it( 'should detect right overflow when scrolled to start', () => {
			element.scrollWidth = 500;
			content.scrollLeft = 0;
			content.offsetWidth = 300;

			const state = create();
			state.updateState();

			expect( wrapper.classList.add ).toHaveBeenCalledWith( 'citizen-overflow--right' );
			expect( wrapper.classList.add ).not.toHaveBeenCalledWith( 'citizen-overflow--left' );
		} );

		it( 'should detect left overflow when scrolled past start', () => {
			element.scrollWidth = 500;
			content.scrollLeft = 100;
			content.offsetWidth = 300;

			const state = create();
			state.updateState();

			expect( wrapper.classList.add ).toHaveBeenCalledWith( 'citizen-overflow--left' );
			expect( wrapper.classList.add ).toHaveBeenCalledWith( 'citizen-overflow--right' );
		} );

		it( 'should detect only left overflow when scrolled to end', () => {
			element.scrollWidth = 500;
			content.scrollLeft = 200;
			content.offsetWidth = 300;

			const state = create();
			state.updateState();

			expect( wrapper.classList.add ).toHaveBeenCalledWith( 'citizen-overflow--left' );
			expect( wrapper.classList.add ).not.toHaveBeenCalledWith( 'citizen-overflow--right' );
		} );

		it( 'should remove overflow classes when element fits within content', () => {
			element.scrollWidth = 300;
			content.scrollLeft = 0;
			content.offsetWidth = 300;

			wrapper.classList.contains.mockReturnValue( true );

			const state = create();
			state.updateState();

			expect( wrapper.classList.remove ).toHaveBeenCalledWith( 'citizen-overflow--left' );
			expect( wrapper.classList.remove ).toHaveBeenCalledWith( 'citizen-overflow--right' );
		} );

		it( 'should no-op when state has not changed', () => {
			element.scrollWidth = 500;
			content.scrollLeft = 0;
			content.offsetWidth = 300;

			const state = create();
			state.updateState();

			// Reset mocks
			wrapper.classList.add.mockClear();
			wrapper.classList.remove.mockClear();
			win.requestAnimationFrame.mockClear();

			// Same state — should be a no-op
			state.updateState();

			expect( win.requestAnimationFrame ).not.toHaveBeenCalled();
		} );

		it( 'should sync sticky header scroll CSS variable', () => {
			element.scrollWidth = 500;
			content.scrollLeft = 50;
			content.offsetWidth = 300;

			const stickyHeaderEl = {
				style: { setProperty: vi.fn() }
			};

			const state = create( { stickyHeader: stickyHeaderEl } );
			state.updateState();

			expect( stickyHeaderEl.style.setProperty ).toHaveBeenCalledWith(
				'--citizen-overflow-scroll-x', '50px'
			);
		} );
	} );

	describe( 'hasOverflowed', () => {
		it( 'should return true when element is wider than content', () => {
			element.scrollWidth = 500;
			content.offsetWidth = 300;

			const state = create();

			expect( state.hasOverflowed() ).toBe( true );
		} );

		it( 'should return false when element fits within content', () => {
			element.scrollWidth = 300;
			content.offsetWidth = 300;

			const state = create();

			expect( state.hasOverflowed() ).toBe( false );
		} );
	} );
} );
