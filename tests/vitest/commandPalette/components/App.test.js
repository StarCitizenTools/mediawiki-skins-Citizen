// @vitest-environment jsdom

const { shallowMount } = require( '@vue/test-utils' );
const { nextTick } = require( 'vue' );
const mw = require( '../../mocks/mw.js' );
const { setCodexStubs } = require( '../../mocks/codex.js' );
globalThis.mw = mw;

setCodexStubs( {} );

let App;

function mountApp() {
	const noResults = { getResults: () => Promise.resolve( [] ) };
	return shallowMount( App, {
		global: {
			mocks: { $i18n: ( key ) => ( { text: () => key } ) },
			stubs: {
				// Opening focuses the input through the header's exposed API.
				CommandPaletteHeader: {
					template: '<div></div>',
					methods: {
						focus() {},
						getInputElement: () => null
					}
				}
			},
			provide: {
				providers: [],
				recentItemsService: null,
				resultDecorator: { queryActions: () => ( { lead: [], trail: [] } ) },
				recentItemsProvider: noResults,
				relatedArticlesProvider: noResults,
				findModeByTrigger: () => null,
				findModeByQuery: () => null,
				getTokenPatterns: () => [],
				getHandler: () => null,
				previewService: {
					isAvailable: () => false,
					processContext: () => {},
					triggerForAnchor: () => {},
					onReady: () => {}
				}
			}
		}
	} );
}

beforeAll( async () => {
	App = ( await import( '../../../../resources/skins.citizen.commandPalette/components/App.vue' ) ).default;
} );

describe( 'App', () => {
	it( 'lets the palette itself hold focus, so a click on a part that takes none keeps it inside', async () => {
		const wrapper = mountApp();

		wrapper.vm.open();
		await nextTick();

		expect( wrapper.get( '.citizen-command-palette' ).attributes( 'tabindex' ) ).toBe( '-1' );
	} );
} );
