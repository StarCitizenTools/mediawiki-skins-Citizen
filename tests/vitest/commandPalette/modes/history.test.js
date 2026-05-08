// @vitest-environment jsdom

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createHistoryMode = require(
	'../../../../resources/skins.citizen.commandPalette/modes/history.js'
);

const SAMPLE_REVISIONS = [
	{ revid: 105, parentid: 104, timestamp: '2026-05-01T10:00:00Z', user: 'Alice', comment: 'Fix typo', size: 1234, minor: false },
	{ revid: 104, parentid: 103, timestamp: '2026-04-28T08:30:00Z', user: 'Bob', comment: 'Add voting section', size: 1200, minor: false },
	{ revid: 103, parentid: 102, timestamp: '2026-04-27T22:15:00Z', user: 'Alice', comment: '', size: 1100, minor: true },
	{ revid: 102, parentid: 101, timestamp: '2026-04-25T13:45:00Z', user: 'Carol', comment: 'Initial work', size: 1080, minor: false },
	{ revid: 101, parentid: 0, timestamp: '2026-04-20T09:00:00Z', user: 'Dave', comment: 'Page created', size: 800, minor: false }
];

function makeApiData( revisions ) {
	return {
		query: {
			pages: {
				42: { pageid: 42, ns: 0, title: 'Test_Page', revisions }
			}
		}
	};
}

describe( 'history mode', () => {
	let mockGet;
	let mode;

	beforeEach( () => {
		mockGet = vi.fn();
		const ApiConstructor = function () {
			this.get = mockGet;
		};

		mw.config.get = vi.fn( ( key ) => {
			if ( key === 'wgArticleId' ) {
				return 42;
			}
			if ( key === 'wgPageName' ) {
				return 'Test_Page';
			}
			return null;
		} );
		mw.log.error.mockClear();

		mode = createHistoryMode( ApiConstructor );
	} );

	describe( 'mode definition', () => {
		it( 'has correct id and triggers', () => {
			expect( mode.id ).toBe( 'history' );
			expect( mode.triggers ).toEqual( [ '/hist:', '!' ] );
		} );

		it( 'declares compactResults', () => {
			expect( mode.compactResults ).toBe( true );
		} );

		it( 'has emptyState with title, description, icon', () => {
			expect( mode.emptyState ).toBeDefined();
			expect( mode.emptyState.title ).toBeTruthy();
			expect( mode.emptyState.description ).toBeTruthy();
			expect( mode.emptyState.icon ).toBeDefined();
		} );

		it( 'has noResults() returning title, description, icon', () => {
			const result = mode.noResults( 'foo' );

			expect( result.title ).toBeTruthy();
			expect( result.description ).toBeTruthy();
			expect( result.icon ).toBeDefined();
		} );

		it( 'has help.description message key', () => {
			expect( mode.help.description ).toBe( 'citizen-command-palette-mode-history-description-help' );
		} );
	} );

	describe( 'getResults — off-article gate', () => {
		it( 'returns [] and skips the API when wgArticleId is 0', async () => {
			mw.config.get = vi.fn( ( key ) => ( key === 'wgArticleId' ? 0 : 'NotAPage' ) );

			const result = await mode.getResults( '', undefined );

			expect( result ).toEqual( [] );
			expect( mockGet ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'getResults — on article, no query', () => {
		it( 'calls the API with the documented parameters', async () => {
			mockGet.mockResolvedValue( makeApiData( SAMPLE_REVISIONS ) );

			await mode.getResults( '', undefined );

			// Two parallel calls: prop=revisions and list=tags. Find the
			// revisions one and assert its shape.
			const revisionCall = mockGet.mock.calls.find( ( c ) => c[ 0 ].prop === 'revisions' );
			expect( revisionCall ).toBeDefined();
			const params = revisionCall[ 0 ];
			expect( params.action ).toBe( 'query' );
			expect( params.titles ).toBe( 'Test_Page' );
			expect( params.rvlimit ).toBe( 50 );
			expect( params.rvprop ).toBe( 'ids|timestamp|user|comment|size|flags|tags' );
		} );

		it( 'returns adapted items in newest-first order', async () => {
			mockGet.mockResolvedValue( makeApiData( SAMPLE_REVISIONS ) );

			const result = await mode.getResults( '', undefined );

			expect( result ).toHaveLength( 5 );
			expect( result[ 0 ].id ).toContain( '105' );
			expect( result[ 4 ].id ).toContain( '101' );
		} );

		it( 'item has type "revision" and highlightQuery true', async () => {
			mockGet.mockResolvedValue( makeApiData( SAMPLE_REVISIONS ) );

			const [ first ] = await mode.getResults( '', undefined );

			expect( first.type ).toBe( 'revision' );
			expect( first.highlightQuery ).toBe( true );
		} );

		it( 'item label includes timestamp and editor', async () => {
			mockGet.mockResolvedValue( makeApiData( SAMPLE_REVISIONS ) );

			const [ first ] = await mode.getResults( '', undefined );

			expect( first.label ).toContain( 'Alice' );
			expect( first.label.length ).toBeGreaterThan( 'Alice'.length );
		} );

		it( 'item description is the comment when present', async () => {
			mockGet.mockResolvedValue( makeApiData( SAMPLE_REVISIONS ) );

			const [ first ] = await mode.getResults( '', undefined );

			expect( first.description ).toBe( 'Fix typo' );
		} );

		it( 'empty comment shows the no-summary placeholder in description', async () => {
			mockGet.mockResolvedValue( makeApiData( SAMPLE_REVISIONS ) );

			const result = await mode.getResults( '', undefined );

			// SAMPLE_REVISIONS[2] has comment: '' → result index 2
			expect( result[ 2 ].description ).toBe( 'citizen-command-palette-mode-history-no-summary-text' );
		} );

		it( 'computes positive byte delta in metadata', async () => {
			mockGet.mockResolvedValue( makeApiData( SAMPLE_REVISIONS ) );

			const result = await mode.getResults( '', undefined );

			// 1234 - 1200 = +34
			const deltaBadge = result[ 0 ].metadata.find( ( m ) => /\d+/.test( m.label ) );
			expect( deltaBadge.label ).toBe( '+34' );
			expect( deltaBadge.status ).toBe( 'success' );
		} );

		it( 'computes negative byte delta with Unicode minus and error status', async () => {
			const revisions = [
				{ revid: 200, parentid: 199, timestamp: '2026-05-01T10:00:00Z', user: 'Eve', comment: 'Trim section', size: 800, minor: false },
				{ revid: 199, parentid: 0, timestamp: '2026-04-30T09:00:00Z', user: 'Eve', comment: 'Page created', size: 1000, minor: false }
			];
			mockGet.mockResolvedValue( makeApiData( revisions ) );

			const result = await mode.getResults( '', undefined );

			const deltaBadge = result[ 0 ].metadata.find( ( m ) => /^[+\-−±]/.test( m.label ) );
			expect( deltaBadge.label ).toBe( '−200' );
			expect( deltaBadge.status ).toBe( 'error' );
		} );

		it( 'omits delta for the oldest revision in the window', async () => {
			mockGet.mockResolvedValue( makeApiData( SAMPLE_REVISIONS ) );

			const result = await mode.getResults( '', undefined );

			// SAMPLE_REVISIONS[4] is the oldest in the returned slice → no delta in metadata
			const last = result[ 4 ];
			const hasDelta = ( last.metadata || [] ).some( ( m ) => /^[+\-−]\d+/.test( m.label ) );
			expect( hasDelta ).toBe( false );
		} );

		it( 'shows ±0 with no status when the edit is the same size as its parent', async () => {
			const revisions = [
				{ revid: 2, parentid: 1, timestamp: '2026-04-10T11:00:00Z', user: 'X', comment: 'No-op', size: 100, minor: false },
				{ revid: 1, parentid: 0, timestamp: '2026-04-10T10:00:00Z', user: 'X', comment: 'Created', size: 100, minor: false }
			];
			mockGet.mockResolvedValue( makeApiData( revisions ) );

			const result = await mode.getResults( '', undefined );

			const deltaBadge = result[ 0 ].metadata.find( ( m ) => /^[+\-−±]/.test( m.label ) );
			expect( deltaBadge.label ).toBe( '±0' );
			expect( deltaBadge.status ).toBeUndefined();
		} );

		it( 'includes a minor flag in metadata when revision.minor is true', async () => {
			mockGet.mockResolvedValue( makeApiData( SAMPLE_REVISIONS ) );

			const result = await mode.getResults( '', undefined );

			// SAMPLE_REVISIONS[2] is minor → result index 2
			const minorBadge = ( result[ 2 ].metadata || [] ).find( ( m ) => m.label === 'm' );
			expect( minorBadge ).toBeDefined();
		} );

		it( 'omits the minor flag when revision.minor is false', async () => {
			mockGet.mockResolvedValue( makeApiData( SAMPLE_REVISIONS ) );

			const result = await mode.getResults( '', undefined );

			const minorBadge = ( result[ 0 ].metadata || [] ).find( ( m ) => m.label === 'm' );
			expect( minorBadge ).toBeUndefined();
		} );

		it( 'has the revision URL as a top-level url', async () => {
			mockGet.mockResolvedValue( makeApiData( SAMPLE_REVISIONS ) );

			const [ first ] = await mode.getResults( '', undefined );

			expect( first.url ).toContain( 'oldid=105' );
		} );

		it( 'is marked previewable so the row opts into Instant Diffs preview', async () => {
			mockGet.mockResolvedValue( makeApiData( SAMPLE_REVISIONS ) );

			const [ first ] = await mode.getResults( '', undefined );

			expect( first.previewable ).toBe( true );
		} );

		it( 'does not produce any sub-actions (the row itself navigates)', async () => {
			mockGet.mockResolvedValue( makeApiData( SAMPLE_REVISIONS ) );

			const [ first ] = await mode.getResults( '', undefined );

			expect( first.actions ).toBeUndefined();
		} );
	} );

	describe( 'getResults — relative timestamp', () => {
		beforeEach( () => {
			vi.useFakeTimers();
			vi.setSystemTime( new Date( '2026-05-08T10:00:00Z' ) );
		} );

		afterEach( () => {
			vi.useRealTimers();
		} );

		it( 'shows "Nm" for edits in the past hour', async () => {
			const revisions = [
				{ revid: 1, parentid: 0, timestamp: '2026-05-08T09:55:00Z', user: 'X', comment: '', size: 100, minor: false }
			];
			mockGet.mockResolvedValue( makeApiData( revisions ) );

			const [ first ] = await mode.getResults( '', undefined );

			expect( first.label ).toContain( '5m' );
		} );

		it( 'shows "Nh" for edits earlier today', async () => {
			const revisions = [
				{ revid: 1, parentid: 0, timestamp: '2026-05-08T05:00:00Z', user: 'X', comment: '', size: 100, minor: false }
			];
			mockGet.mockResolvedValue( makeApiData( revisions ) );

			const [ first ] = await mode.getResults( '', undefined );

			expect( first.label ).toContain( '5h' );
		} );

		it( 'shows "Nd" for edits within the past week', async () => {
			const revisions = [
				{ revid: 1, parentid: 0, timestamp: '2026-05-05T10:00:00Z', user: 'X', comment: '', size: 100, minor: false }
			];
			mockGet.mockResolvedValue( makeApiData( revisions ) );

			const [ first ] = await mode.getResults( '', undefined );

			expect( first.label ).toContain( '3d' );
		} );

		it( 'shows "now" for edits in the past minute', async () => {
			const revisions = [
				{ revid: 1, parentid: 0, timestamp: '2026-05-08T09:59:30Z', user: 'X', comment: '', size: 100, minor: false }
			];
			mockGet.mockResolvedValue( makeApiData( revisions ) );

			const [ first ] = await mode.getResults( '', undefined );

			expect( first.label ).toContain( 'now' );
		} );

		it( 'shows compact absolute date for edits older than a week', async () => {
			const revisions = [
				{ revid: 1, parentid: 0, timestamp: '2026-04-10T10:00:00Z', user: 'X', comment: '', size: 100, minor: false }
			];
			mockGet.mockResolvedValue( makeApiData( revisions ) );

			const [ first ] = await mode.getResults( '', undefined );

			// Older-than-a-week falls back to an absolute date — no abbreviated "Nm/Nh/Nd" form.
			expect( first.label ).not.toMatch( /\d+[mhd] · /i );
		} );
	} );

	describe( 'getResults — section comment', () => {
		it( 'extracts /* Section */ prefix into a metadata chip', async () => {
			const revisions = [
				{ revid: 1, parentid: 0, timestamp: '2026-04-10T10:00:00Z', user: 'X', comment: '/* Getting started */ tweak the intro', size: 100, minor: false }
			];
			mockGet.mockResolvedValue( makeApiData( revisions ) );

			const [ first ] = await mode.getResults( '', undefined );

			const sectionBadge = first.metadata.find( ( m ) => m.label === 'Getting started' );
			expect( sectionBadge ).toBeDefined();
			expect( first.description ).toBe( 'tweak the intro' );
		} );

		it( 'falls back to no-summary placeholder when only section prefix is present', async () => {
			const revisions = [
				{ revid: 1, parentid: 0, timestamp: '2026-04-10T10:00:00Z', user: 'X', comment: '/* Notes */', size: 100, minor: false }
			];
			mockGet.mockResolvedValue( makeApiData( revisions ) );

			const [ first ] = await mode.getResults( '', undefined );

			expect( first.description ).toBe( 'citizen-command-palette-mode-history-no-summary-text' );
			expect( first.metadata.find( ( m ) => m.label === 'Notes' ) ).toBeDefined();
		} );

		it( 'leaves comment unchanged when there is no section prefix', async () => {
			const revisions = [
				{ revid: 1, parentid: 0, timestamp: '2026-04-10T10:00:00Z', user: 'X', comment: 'Plain comment', size: 100, minor: false }
			];
			mockGet.mockResolvedValue( makeApiData( revisions ) );

			const [ first ] = await mode.getResults( '', undefined );

			expect( first.description ).toBe( 'Plain comment' );
			// No section badges in metadata
			const labels = first.metadata.map( ( m ) => m.label );
			expect( labels ).not.toContain( 'Plain comment' );
		} );
	} );

	describe( 'getResults — tags', () => {
		// Helper: route the api.get() call to either the revisions response
		// or the tag-displayname response based on the params it was called
		// with. Both endpoints are queried in parallel by getResults.
		function routeApiCalls( revisions, tagDisplayNames ) {
			mockGet.mockImplementation( ( params ) => {
				if ( params.list === 'tags' ) {
					return Promise.resolve( {
						query: {
							tags: ( tagDisplayNames || [] ).map( ( t ) => ( {
								name: t.name,
								displayname: t.displayname
							} ) )
						}
					} );
				}
				return Promise.resolve( makeApiData( revisions ) );
			} );
		}

		it( 'resolves tag IDs to display names from list=tags', async () => {
			routeApiCalls(
				[
					{ revid: 1, parentid: 0, timestamp: '2026-04-10T10:00:00Z', user: 'X', comment: 'Reverted', size: 100, minor: false, tags: [ 'mw-rollback', 'mw-blank' ] }
				],
				[
					{ name: 'mw-rollback', displayname: 'Rollback' },
					{ name: 'mw-blank', displayname: 'Blanking' }
				]
			);

			const [ first ] = await mode.getResults( '', undefined );

			const labels = first.metadata.map( ( m ) => m.label );
			expect( labels ).toContain( 'Rollback' );
			expect( labels ).toContain( 'Blanking' );
			expect( labels ).not.toContain( 'mw-rollback' );
		} );

		it( 'falls back to the raw tag ID when no display name is registered', async () => {
			routeApiCalls(
				[
					{ revid: 1, parentid: 0, timestamp: '2026-04-10T10:00:00Z', user: 'X', comment: 'Untagged-display', size: 100, minor: false, tags: [ 'custom-tag' ] }
				],
				[
					{ name: 'mw-rollback', displayname: 'Rollback' }
				]
			);

			const [ first ] = await mode.getResults( '', undefined );

			const labels = first.metadata.map( ( m ) => m.label );
			expect( labels ).toContain( 'custom-tag' );
		} );

		it( 'strips HTML markup from displayname output', async () => {
			routeApiCalls(
				[
					{ revid: 1, parentid: 0, timestamp: '2026-04-10T10:00:00Z', user: 'X', comment: 'X', size: 100, minor: false, tags: [ 'styled' ] }
				],
				[
					{ name: 'styled', displayname: '<b>Bold</b> tag' }
				]
			);

			const [ first ] = await mode.getResults( '', undefined );

			const labels = first.metadata.map( ( m ) => m.label );
			expect( labels ).toContain( 'Bold tag' );
		} );

		it( 'caches the tag map across getResults calls', async () => {
			routeApiCalls(
				[ { revid: 1, parentid: 0, timestamp: '2026-04-10T10:00:00Z', user: 'X', comment: 'A', size: 100, minor: false } ],
				[ { name: 'foo', displayname: 'Foo' } ]
			);

			await mode.getResults( '', undefined );
			await mode.getResults( '', undefined );

			const tagCalls = mockGet.mock.calls.filter( ( c ) => c[ 0 ].list === 'tags' );
			expect( tagCalls ).toHaveLength( 1 );
		} );

		it( 'still renders revisions when the tag fetch fails', async () => {
			mockGet.mockImplementation( ( params ) => {
				if ( params.list === 'tags' ) {
					return Promise.reject( new Error( 'boom' ) );
				}
				return Promise.resolve( makeApiData( [
					{ revid: 1, parentid: 0, timestamp: '2026-04-10T10:00:00Z', user: 'X', comment: 'A', size: 100, minor: false, tags: [ 'mw-rollback' ] }
				] ) );
			} );

			const result = await mode.getResults( '', undefined );

			expect( result ).toHaveLength( 1 );
			// Falls back to the raw tag id when the displayname map is empty
			const labels = result[ 0 ].metadata.map( ( m ) => m.label );
			expect( labels ).toContain( 'mw-rollback' );
		} );

		it( 'omits tag badges when the tags array is empty or missing', async () => {
			routeApiCalls(
				[ { revid: 1, parentid: 0, timestamp: '2026-04-10T10:00:00Z', user: 'X', comment: 'Plain', size: 100, minor: false, tags: [] } ],
				[]
			);

			const [ first ] = await mode.getResults( '', undefined );

			// metadata may have +/- delta or minor badges, but no tag-shaped strings
			expect( first.metadata.length ).toBeLessThanOrEqual( 2 );
		} );
	} );

	describe( 'getResults — filter', () => {
		beforeEach( () => {
			mockGet.mockResolvedValue( makeApiData( SAMPLE_REVISIONS ) );
		} );

		it( 'filters by editor name (case-insensitive)', async () => {
			const result = await mode.getResults( 'alice', undefined );

			expect( result ).toHaveLength( 2 );
			expect( result.every( ( r ) => r.label.toLowerCase().includes( 'alice' ) ) ).toBe( true );
		} );

		it( 'filters by edit summary substring (case-insensitive)', async () => {
			const result = await mode.getResults( 'TYPO', undefined );

			expect( result ).toHaveLength( 1 );
			expect( result[ 0 ].description ).toBe( 'Fix typo' );
		} );

		it( 'matches revisions where either field contains the substring', async () => {
			const result = await mode.getResults( 'voting', undefined );

			expect( result ).toHaveLength( 1 );
			expect( result[ 0 ].description ).toBe( 'Add voting section' );
		} );

		it( 'returns [] when no revisions match', async () => {
			const result = await mode.getResults( 'nothingmatchesthis', undefined );

			expect( result ).toEqual( [] );
		} );
	} );

	describe( 'onResultSelect', () => {
		it( 'navigates to ?diff=prev&oldid=<revid> when parentid is set', async () => {
			const item = { revid: 105, parentid: 104, value: 'Test_Page' };

			const action = await mode.onResultSelect( item );

			expect( action.action ).toBe( 'navigate' );
			expect( action.payload ).toContain( 'diff=prev' );
			expect( action.payload ).toContain( 'oldid=105' );
		} );

		it( 'navigates to ?oldid=<revid> when parentid is 0 (oldest revision)', async () => {
			const item = { revid: 101, parentid: 0, value: 'Test_Page' };

			const action = await mode.onResultSelect( item );

			expect( action.action ).toBe( 'navigate' );
			expect( action.payload ).toContain( 'oldid=101' );
			expect( action.payload ).not.toContain( 'diff=' );
		} );
	} );

	describe( 'getResults — error and abort handling', () => {
		it( 'returns [] and logs when API call fails', async () => {
			mockGet.mockRejectedValue( new Error( 'network blew up' ) );

			const result = await mode.getResults( '', undefined );

			expect( result ).toEqual( [] );
			expect( mw.log.error ).toHaveBeenCalled();
		} );

		it( 'returns [] when the request is aborted, without logging', async () => {
			const abortErr = new Error( 'aborted' );
			abortErr.name = 'AbortError';
			mockGet.mockRejectedValue( abortErr );

			const result = await mode.getResults( '', undefined );

			expect( result ).toEqual( [] );
			expect( mw.log.error ).not.toHaveBeenCalled();
		} );
	} );
} );
