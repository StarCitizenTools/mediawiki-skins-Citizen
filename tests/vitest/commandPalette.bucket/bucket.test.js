const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

const createBucketMode = require(
	'../../../resources/skins.citizen.commandPalette.bucket/init.js'
);

const BUCKET_NS = 9592;

const ITEM_SCHEMA = JSON.stringify( {
	item_type: { type: 'TEXT', index: true, repeated: false },
	value: { type: 'INTEGER', index: false, repeated: false },
	members: { type: 'BOOLEAN', index: true, repeated: false },
	tags: { type: 'TEXT', index: true, repeated: true }
} );

const SKILL_SCHEMA = JSON.stringify( {
	skill_name: { type: 'TEXT', index: true, repeated: false }
} );

const CATALOG = {
	query: {
		pages: [
			{
				title: 'Bucket:Item',
				revisions: [ { slots: { main: { content: ITEM_SCHEMA } } } ]
			},
			{
				title: 'Bucket:Skill',
				revisions: [ { slots: { main: { content: SKILL_SCHEMA } } } ]
			}
		]
	}
};

const ITEM_CONTEXT = [ { kind: 'bucket', name: 'item', label: 'Item' } ];

/**
 * mw.Api rejects jQuery-style, with (code, details) rather than a single
 * Error. A Bucket-side failure arrives as ('unknown', { error: '<message>' })
 * and an abort as ('http', { textStatus: 'abort' }).
 *
 * @param {*} code
 * @param {*} details
 * @return {Object} A thenable shaped like the one mw.Api returns.
 */
function apiRejection( code, details ) {
	return {
		then: ( onSuccess, onFailure ) => Promise.resolve( onFailure( code, details ) )
	};
}

/**
 * Convenience: the drill payload a result carries for onResultSelect.
 *
 * @param {Object} item
 * @return {Object}
 */
function payloadOf( item ) {
	return JSON.parse( item.value );
}

describe( 'bucket mode', () => {
	let mode;
	let mockGet;
	let bucketQueries;
	let bucketRows;

	beforeEach( () => {
		bucketQueries = [];
		bucketRows = [];

		mockGet = vi.fn( ( params ) => {
			if ( params.action === 'bucket' ) {
				bucketQueries.push( params.query );
				return Promise.resolve( { bucket: bucketRows } );
			}
			return Promise.resolve( CATALOG );
		} );

		const ApiConstructor = function () {
			this.get = mockGet;
		};

		mw.log.error.mockClear();
		mw.log.warn.mockClear();
		mode = createBucketMode( ApiConstructor, BUCKET_NS );
	} );

	describe( 'mode definition', () => {
		it( 'has the bucket id and trigger', () => {
			expect( mode.id ).toBe( 'bucket' );
			expect( mode.triggers ).toEqual( [ '/bucket:' ] );
		} );

		it( 'has an emptyState with title and description', () => {
			expect( mode.emptyState.title ).toBeTruthy();
			expect( mode.emptyState.description ).toBeTruthy();
		} );

		it( 'has a noResults function returning title and description', () => {
			const state = mode.noResults( 'foo' );

			expect( state.title ).toBeTruthy();
			expect( state.description ).toBeTruthy();
		} );
	} );

	describe( 'root level', () => {
		it( 'lists every bucket on the wiki', async () => {
			const results = await mode.getResults( '', undefined, [], [] );

			expect( results.map( ( r ) => r.label ) ).toEqual( [ 'Item', 'Skill' ] );
			expect( results[ 0 ].type ).toBe( 'bucket' );
		} );

		it( 'never runs a data query while listing buckets', async () => {
			await mode.getResults( '', undefined, [], [] );

			expect( bucketQueries ).toEqual( [] );
		} );

		it( 'offers view and browse actions for each bucket', async () => {
			const results = await mode.getResults( '', undefined, [], [] );

			const actions = results[ 0 ].actions;
			expect( actions.map( ( a ) => a.id ) ).toEqual( [ 'view', 'browse' ] );
			expect( actions[ 0 ].url ).toContain( 'Bucket:Item' );
			expect( actions[ 1 ].url ).toContain( 'Special:Bucket' );
			expect( actions[ 1 ].url ).toContain( 'bucket=item' );
		} );

		it( 'filters buckets by what was typed, ignoring case', async () => {
			const results = await mode.getResults( 'sk', undefined, [], [] );

			expect( results.map( ( r ) => r.label ) ).toEqual( [ 'Skill' ] );
		} );

		it( 'carries the bucket name as its drill payload', async () => {
			const results = await mode.getResults( '', undefined, [], [] );

			expect( results[ 0 ].value ).toBe( 'item' );
		} );
	} );

	describe( 'bucket level', () => {
		beforeEach( () => {
			bucketRows = [
				{ page_name: 'Abyssal whip' },
				{ page_name: 'Dragon dagger' }
			];
		} );

		it( 'lists the fields first, then the matching pages', async () => {
			const results = await mode.getResults( '', undefined, [], ITEM_CONTEXT );

			expect( results.map( ( r ) => r.type ) ).toEqual( [
				'bucket-query',
				'bucket-field', 'bucket-field', 'bucket-field', 'bucket-field',
				'page', 'page'
			] );
			expect( results.slice( 1, 5 ).map( ( r ) => r.label ) ).toEqual( [
				'item_type', 'value', 'members', 'tags'
			] );
		} );

		it( 'queries the bucket once, ordered by page name', async () => {
			await mode.getResults( '', undefined, [], ITEM_CONTEXT );

			expect( bucketQueries ).toHaveLength( 1 );
			expect( bucketQueries[ 0 ] ).toContain( "bucket('item')" );
			expect( bucketQueries[ 0 ] ).toContain( ".orderBy('page_name')" );
		} );

		it( 'shows one row per page when a page writes several rows', async () => {
			bucketRows = [
				{ page_name: 'Abyssal whip' },
				{ page_name: 'Abyssal whip' },
				{ page_name: 'Dragon dagger' }
			];

			const results = await mode.getResults( '', undefined, [], ITEM_CONTEXT );

			const pages = results.filter( ( r ) => r.type === 'page' );
			expect( pages.map( ( r ) => r.label ) ).toEqual( [
				'Abyssal whip', 'Dragon dagger'
			] );
		} );

		it( 'links each page and offers edit and bucket-data actions', async () => {
			const results = await mode.getResults( '', undefined, [], ITEM_CONTEXT );

			const page = results.find( ( r ) => r.type === 'page' );
			expect( page.url ).toContain( 'Abyssal whip' );
			expect( page.actions.map( ( a ) => a.id ) ).toEqual( [ 'edit', 'data' ] );
			expect( page.actions[ 1 ].url ).toContain( 'action=bucket' );
		} );

		it( 'selects every schema field so a row can be shown beside the list', async () => {
			await mode.getResults( '', undefined, [], ITEM_CONTEXT );

			expect( bucketQueries[ 0 ] ).toContain(
				".select('page_name','item_type','value','members','tags')"
			);
		} );

		it( 'shows the row values beside the page as detail pairs', async () => {
			bucketRows = [ {
				page_name: 'Abyssal whip',
				item_type: 'Weapon',
				value: 1200000,
				members: true,
				tags: [ 'melee', 'rare' ]
			} ];

			const results = await mode.getResults( '', undefined, [], ITEM_CONTEXT );

			const page = results.find( ( r ) => r.type === 'page' );
			expect( page.detail.pairs ).toEqual( [
				{ label: 'item_type', value: 'Weapon' },
				{ label: 'value', value: '1200000' },
				{ label: 'members', value: 'true' },
				{ label: 'tags', value: 'melee, rare' }
			] );
		} );

		it( 'names the page in the detail header', async () => {
			bucketRows = [ { page_name: 'Abyssal whip', item_type: 'Weapon' } ];

			const results = await mode.getResults( '', undefined, [], ITEM_CONTEXT );

			const page = results.find( ( r ) => r.type === 'page' );
			expect( page.detail.header.label ).toBe( 'Abyssal whip' );
		} );

		it( 'leaves a field out of the pairs when the row has no value for it', async () => {
			bucketRows = [ { page_name: 'Lobster', item_type: 'Consumable' } ];

			const results = await mode.getResults( '', undefined, [], ITEM_CONTEXT );

			const page = results.find( ( r ) => r.type === 'page' );
			expect( page.detail.pairs.map( ( pair ) => pair.label ) ).toEqual( [ 'item_type' ] );
		} );

		it( 'keeps a false boolean in the pairs rather than treating it as absent', async () => {
			bucketRows = [ { page_name: 'Bronze dagger', members: false } ];

			const results = await mode.getResults( '', undefined, [], ITEM_CONTEXT );

			const page = results.find( ( r ) => r.type === 'page' );
			expect( page.detail.pairs ).toEqual( [ { label: 'members', value: 'false' } ] );
		} );

		it( 'counts the rows when one page writes several, still listing it once', async () => {
			bucketRows = [
				{ page_name: 'Abyssal whip', item_type: 'Weapon' },
				{ page_name: 'Abyssal whip', item_type: 'Tool' }
			];

			const results = await mode.getResults( '', undefined, [], ITEM_CONTEXT );

			const pages = results.filter( ( r ) => r.type === 'page' );
			expect( pages ).toHaveLength( 1 );
			expect( pages[ 0 ].metadata[ 0 ].label ).toBeTruthy();
			expect( pages[ 0 ].detail.pairs[ 0 ].value ).toBe( 'Weapon' );
		} );

		it( 'applies the filters held in the drill stack to the page query', async () => {
			await mode.getResults( '', undefined, [], ITEM_CONTEXT.concat( [
				{ kind: 'field', name: 'item_type', type: 'TEXT' },
				{ kind: 'filter', field: 'item_type', op: '=', value: 'Weapon', type: 'TEXT' }
			] ) );

			expect( bucketQueries[ 0 ] ).toContain( ".where('item_type','=','Weapon')" );
		} );

		it( 'stops offering a field that is already filtered', async () => {
			const results = await mode.getResults( '', undefined, [], ITEM_CONTEXT.concat( [
				{ kind: 'filter', field: 'item_type', op: '=', value: 'Weapon', type: 'TEXT' }
			] ) );

			const fields = results.filter( ( r ) => r.type === 'bucket-field' );
			expect( fields.map( ( r ) => r.label ) ).toEqual( [ 'value', 'members', 'tags' ] );
		} );

		it( 'filters both fields and pages by what was typed', async () => {
			bucketRows = [
				{ page_name: 'Abyssal whip' },
				{ page_name: 'Dragon dagger' }
			];

			const results = await mode.getResults( 'd', undefined, [], ITEM_CONTEXT );

			expect( results.map( ( r ) => r.label ) ).toEqual( [ 'Dragon dagger' ] );
		} );

		it( 'describes the highlighted field beside the list', async () => {
			const results = await mode.getResults( '', undefined, [], ITEM_CONTEXT );

			const field = results.find( ( r ) => r.type === 'bucket-field' );
			expect( field.detail.header.label ).toBe( 'item_type' );
			expect( field.detail.header.description ).toBeUndefined();
			expect( field.detail.pairs.map( ( pair ) => pair.value ) ).toHaveLength( 3 );
			expect( field.detail.pairs[ 0 ].value ).toBe( 'TEXT' );
		} );

		it( 'seeks to what was typed instead of filtering the first page of rows', async () => {
			await mode.getResults( 'dra', undefined, [], ITEM_CONTEXT );

			// Without this the window is always the alphabetically first
			// rows, so typing a late letter finds nothing in a big bucket.
			expect( bucketQueries[ 0 ] ).toContain( ".where('page_name','>=','dra')" );
		} );

		it( 'does not constrain the window when nothing has been typed', async () => {
			await mode.getResults( '', undefined, [], ITEM_CONTEXT );

			expect( bucketQueries[ 0 ] ).not.toContain( "page_name','>='" );
		} );

		it( 'carries the field name and type as the field drill payload', async () => {
			const results = await mode.getResults( '', undefined, [], ITEM_CONTEXT );

			const field = results.find( ( r ) => r.type === 'bucket-field' );
			expect( payloadOf( field ) ).toEqual( {
				field: 'item_type',
				type: 'TEXT'
			} );
		} );

		it( 'surfaces the message Bucket sent back when a query fails', async () => {
			mockGet = vi.fn( ( params ) => {
				if ( params.action === 'bucket' ) {
					return apiRejection( 'unknown', {
						error: 'Lua error: Bucket name item drop is invalid.'
					} );
				}
				return Promise.resolve( CATALOG );
			} );
			const ApiConstructor = function () {
				this.get = mockGet;
			};
			mode = createBucketMode( ApiConstructor, BUCKET_NS );

			const results = await mode.getResults( '', undefined, [], ITEM_CONTEXT );

			expect( results.some( ( r ) => r.type === 'page' ) ).toBe( false );
			const logged = mw.log.error.mock.calls.map( ( c ) => c.join( ' ' ) ).join( ' ' );
			expect( logged ).toContain( 'Bucket name item drop is invalid' );
		} );

		it( 'says so when a response carries neither rows nor an error', async () => {
			// What a rate-limited Bucket request looks like: BucketApi returns
			// before adding anything, so the response is neither rows nor a
			// reported failure, and the list would otherwise just be empty.
			mockGet = vi.fn( ( params ) => {
				if ( params.action === 'bucket' ) {
					return Promise.resolve( {} );
				}
				return Promise.resolve( CATALOG );
			} );
			const ApiConstructor = function () {
				this.get = mockGet;
			};
			mode = createBucketMode( ApiConstructor, BUCKET_NS );

			const results = await mode.getResults( '', undefined, [], ITEM_CONTEXT );

			expect( results.some( ( r ) => r.type === 'page' ) ).toBe( false );
			expect( mw.log.warn ).toHaveBeenCalled();
		} );

		it( 'stays quiet when a query is aborted mid-keystroke', async () => {
			mockGet = vi.fn( ( params ) => {
				if ( params.action === 'bucket' ) {
					return apiRejection( 'http', { textStatus: 'abort', exception: 'abort' } );
				}
				return Promise.resolve( CATALOG );
			} );
			const ApiConstructor = function () {
				this.get = mockGet;
			};
			mode = createBucketMode( ApiConstructor, BUCKET_NS );

			await mode.getResults( '', undefined, [], ITEM_CONTEXT );

			expect( mw.log.error ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'copying the query', () => {
		const filtered = ITEM_CONTEXT.concat( [
			{ kind: 'field', name: 'item_type', type: 'TEXT' },
			{ kind: 'filter', field: 'item_type', op: '=', value: 'Weapon', type: 'TEXT' }
		] );

		it( 'offers the unfiltered query as a starting skeleton', async () => {
			const results = await mode.getResults( '', undefined, [], ITEM_CONTEXT );

			const copy = results.find( ( r ) => r.type === 'bucket-query' );
			expect( copy.value ).toContain( "mw.ext.bucket('item')" );
			expect( copy.value ).not.toContain( '.where(' );
		} );

		it( 'leads the list', async () => {
			bucketRows = [ { page_name: 'Abyssal whip', item_type: 'Weapon' } ];

			const results = await mode.getResults( '', undefined, [], filtered );

			expect( results[ 0 ].type ).toBe( 'bucket-query' );
		} );

		it( 'carries a snippet that pastes straight into a module', async () => {
			const results = await mode.getResults( '', undefined, [], filtered );

			const copy = results.find( ( r ) => r.type === 'bucket-query' );
			expect( copy.value ).toContain( "mw.ext.bucket('item')" );
			expect( copy.value ).toContain( ".where('item_type','=','Weapon')" );
		} );

		it( 'leaves out the list\'s own ordering and row cap', async () => {
			const results = await mode.getResults( '', undefined, [], filtered );

			const copy = results.find( ( r ) => r.type === 'bucket-query' );
			expect( copy.value ).not.toContain( '.limit(' );
			expect( copy.value ).not.toContain( '.orderBy(' );
		} );

		it( 'stays a plain row — no detail panel, no truncated query text', async () => {
			const results = await mode.getResults( '', undefined, [], filtered );

			const copy = results.find( ( r ) => r.type === 'bucket-query' );
			expect( copy.detail ).toBeUndefined();
			expect( copy.description ).toBeUndefined();
			expect( copy.label ).toBeTruthy();
		} );

		it( 'drops out of the way while the user is typing', async () => {
			const results = await mode.getResults( 'dra', undefined, [], filtered );

			expect( results.some( ( r ) => r.type === 'bucket-query' ) ).toBe( false );
		} );

		it( 'copies to the clipboard and stays in the palette when selected', async () => {
			const writeText = vi.fn().mockResolvedValue( undefined );
			vi.stubGlobal( 'navigator', { clipboard: { writeText } } );

			const action = mode.onResultSelect( {
				type: 'bucket-query',
				label: 'copy',
				value: "mw.ext.bucket('item').run()"
			} );

			expect( writeText ).toHaveBeenCalledWith( "mw.ext.bucket('item').run()" );
			expect( action ).toEqual( { action: 'none' } );
			vi.unstubAllGlobals();
		} );
	} );

	describe( 'value level', () => {
		const textFieldContext = ITEM_CONTEXT.concat( [
			{ kind: 'field', name: 'item_type', type: 'TEXT' }
		] );

		it( 'queries only the drilled field', async () => {
			bucketRows = [ { item_type: 'Weapon' } ];

			await mode.getResults( '', undefined, [], textFieldContext );

			expect( bucketQueries[ 0 ] ).toContain( ".select('item_type')" );
			expect( bucketQueries[ 0 ] ).not.toContain( 'page_name' );
		} );

		it( 'keeps earlier filters while sampling values for the next facet', async () => {
			bucketRows = [ { item_type: 'Weapon' } ];

			await mode.getResults( '', undefined, [], ITEM_CONTEXT.concat( [
				{ kind: 'filter', field: 'members', op: '=', value: true, type: 'BOOLEAN' },
				{ kind: 'field', name: 'item_type', type: 'TEXT' }
			] ) );

			expect( bucketQueries[ 0 ] ).toContain( ".where('members','=',true)" );
		} );

		it( 'collapses the sample into distinct values, most common first', async () => {
			bucketRows = [
				{ item_type: 'Armour' },
				{ item_type: 'Weapon' },
				{ item_type: 'Weapon' }
			];

			const results = await mode.getResults( '', undefined, [], textFieldContext );

			expect( results.map( ( r ) => r.label ) ).toEqual( [ 'Weapon', 'Armour' ] );
			expect( results[ 0 ].metadata[ 0 ].label ).toBe( '2' );
		} );

		it( 'counts each entry of a repeated field separately', async () => {
			bucketRows = [
				{ tags: [ 'melee', 'rare' ] },
				{ tags: '["melee"]' }
			];

			const results = await mode.getResults( '', undefined, [], ITEM_CONTEXT.concat( [
				{ kind: 'field', name: 'tags', type: 'TEXT' }
			] ) );

			expect( results.map( ( r ) => r.label ) ).toEqual( [ 'melee', 'rare' ] );
			expect( results[ 0 ].metadata[ 0 ].label ).toBe( '2' );
		} );

		it( 'orders a numeric field by magnitude, not as text', async () => {
			bucketRows = [
				{ value: 50 },
				{ value: 1200000 },
				{ value: 1500 },
				{ value: 30000 }
			];

			const results = await mode.getResults( '', undefined, [], ITEM_CONTEXT.concat( [
				{ kind: 'field', name: 'value', type: 'INTEGER' }
			] ) );

			expect( results.map( ( r ) => r.label ) ).toEqual( [
				'50', '1500', '30000', '1200000'
			] );
		} );

		it( 'leaves out rows with no value for the field', async () => {
			bucketRows = [
				{ item_type: 'Weapon' },
				{ item_type: null },
				{ item_type: '' }
			];

			const results = await mode.getResults( '', undefined, [], textFieldContext );

			expect( results.map( ( r ) => r.label ) ).toEqual( [ 'Weapon' ] );
		} );

		it( 'presents plain counts when the sample covered the whole bucket', async () => {
			bucketRows = [ { item_type: 'Weapon' } ];

			const results = await mode.getResults( '', undefined, [], textFieldContext );

			expect( results[ 0 ].metadata[ 0 ].label ).toBe( '1' );
			expect( results[ 0 ].detail ).toBeUndefined();
		} );

		it( 'flags counts as partial when the sample hit its cap', async () => {
			bucketRows = Array.from( { length: 500 }, () => ( { item_type: 'Weapon' } ) );

			const results = await mode.getResults( '', undefined, [], textFieldContext );

			expect( results[ 0 ].metadata[ 0 ].label ).not.toBe( '500' );
			expect( results[ 0 ].detail.pairs.length ).toBeGreaterThan( 0 );
		} );

		it( 'filters the sampled values by what was typed', async () => {
			bucketRows = [
				{ item_type: 'Weapon' },
				{ item_type: 'Armour' }
			];

			const results = await mode.getResults( 'ar', undefined, [], textFieldContext );

			expect( results.map( ( r ) => r.label ) ).toContain( 'Armour' );
			expect( results.map( ( r ) => r.label ) ).not.toContain( 'Weapon' );
		} );

		it( 'offers the typed text as an exact filter when the sample does not hold it', async () => {
			bucketRows = [ { item_type: 'Weapon' } ];

			const results = await mode.getResults( 'Gem', undefined, [], textFieldContext );

			const literal = results.find( ( r ) => payloadOf( r ).value === 'Gem' );
			expect( literal ).toBeDefined();
			expect( payloadOf( literal ).op ).toBe( '=' );
		} );

		it( 'offers greater-than and less-than filters on a numeric field', async () => {
			bucketRows = [ { value: 100 } ];

			const results = await mode.getResults( '1000', undefined, [], ITEM_CONTEXT.concat( [
				{ kind: 'field', name: 'value', type: 'INTEGER' }
			] ) );

			const ops = results.map( ( r ) => payloadOf( r ).op );
			expect( ops ).toContain( '>' );
			expect( ops ).toContain( '<' );
		} );

		it( 'does not repeat a value the sample already listed as an exact filter', async () => {
			bucketRows = [ { value: 1000 } ];

			const results = await mode.getResults( '1000', undefined, [], ITEM_CONTEXT.concat( [
				{ kind: 'field', name: 'value', type: 'INTEGER' }
			] ) );

			const equals = results.filter( ( r ) => payloadOf( r ).op === '=' );
			expect( equals ).toHaveLength( 1 );
		} );

		it( 'does not read hex or exponent text as a number to compare against', async () => {
			bucketRows = [ { value: 16 } ];

			const results = await mode.getResults( '0x10', undefined, [], ITEM_CONTEXT.concat( [
				{ kind: 'field', name: 'value', type: 'INTEGER' }
			] ) );

			expect( results.every( ( r ) => payloadOf( r ).op !== '>' ) ).toBe( true );
		} );

		it( 'offers true and false on a boolean field without sampling', async () => {
			const results = await mode.getResults( '', undefined, [], ITEM_CONTEXT.concat( [
				{ kind: 'field', name: 'members', type: 'BOOLEAN' }
			] ) );

			expect( results.map( ( r ) => r.label ) ).toEqual( [ 'true', 'false' ] );
			expect( bucketQueries ).toEqual( [] );
		} );

		it( 'carries field, value and operator as the filter drill payload', async () => {
			bucketRows = [ { item_type: 'Weapon' } ];

			const results = await mode.getResults( '', undefined, [], textFieldContext );

			expect( payloadOf( results[ 0 ] ) ).toEqual( {
				field: 'item_type',
				type: 'TEXT',
				op: '=',
				value: 'Weapon'
			} );
		} );
	} );

	describe( 'onResultSelect', () => {
		it( 'steps into a bucket', () => {
			const action = mode.onResultSelect( {
				type: 'bucket', label: 'Item', value: 'item'
			} );

			expect( action ).toEqual( {
				action: 'pushModeContext',
				payload: { kind: 'bucket', name: 'item', label: 'Item' }
			} );
		} );

		it( 'steps into a field', () => {
			const action = mode.onResultSelect( {
				type: 'bucket-field',
				label: 'item_type',
				value: JSON.stringify( { field: 'item_type', type: 'TEXT' } )
			} );

			expect( action ).toEqual( {
				action: 'pushModeContext',
				payload: { kind: 'field', name: 'item_type', type: 'TEXT' }
			} );
		} );

		it( 'adds a filter when a value is picked', () => {
			const action = mode.onResultSelect( {
				type: 'bucket-value',
				label: 'Weapon',
				value: JSON.stringify( {
					field: 'item_type', type: 'TEXT', op: '=', value: 'Weapon'
				} )
			} );

			expect( action ).toEqual( {
				action: 'pushModeContext',
				payload: {
					kind: 'filter', field: 'item_type', op: '=', value: 'Weapon', type: 'TEXT'
				}
			} );
		} );

		it( 'navigates to a page result', () => {
			const action = mode.onResultSelect( {
				type: 'page', label: 'Abyssal whip', url: '/wiki/Abyssal whip'
			} );

			expect( action ).toEqual( {
				action: 'navigate', payload: '/wiki/Abyssal whip'
			} );
		} );

		it( 'does nothing for an item it cannot read', () => {
			const action = mode.onResultSelect( {
				type: 'bucket-field', label: 'broken', value: 'not json'
			} );

			expect( action ).toEqual( { action: 'none' } );
		} );
	} );

	describe( 'headerLabel', () => {
		it( 'falls back to the placeholder at the root', () => {
			expect( mode.headerLabel( [] ) ).toBeNull();
			expect( mode.headerLabel( undefined ) ).toBeNull();
		} );

		it( 'names the bucket once one is picked', () => {
			const label = mode.headerLabel( ITEM_CONTEXT );

			expect( label ).toMatch( /Item$/ );
		} );

		it( 'names the field being explored', () => {
			const label = mode.headerLabel( ITEM_CONTEXT.concat( [
				{ kind: 'field', name: 'item_type', type: 'TEXT' }
			] ) );

			expect( label ).toMatch( /Item \/ item_type$/ );
		} );

		it( 'shows a chosen filter once, not the field twice', () => {
			const label = mode.headerLabel( ITEM_CONTEXT.concat( [
				{ kind: 'field', name: 'item_type', type: 'TEXT' },
				{ kind: 'filter', field: 'item_type', op: '=', value: 'Weapon', type: 'TEXT' }
			] ) );

			expect( label ).toMatch( /Item \/ item_type: Weapon$/ );
		} );

		it( 'spells out a comparison operator', () => {
			const label = mode.headerLabel( ITEM_CONTEXT.concat( [
				{ kind: 'filter', field: 'value', op: '>', value: '1000', type: 'INTEGER' }
			] ) );

			expect( label ).toMatch( /value > 1000$/ );
		} );
	} );
} );
