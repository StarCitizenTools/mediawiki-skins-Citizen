<template>
	<div v-if="isOpen" class="citizen-command-palette">
		<div class="citizen-command-palette__overlay" @click="close"></div>
		<div class="citizen-command-palette__container">
			<div class="citizen-command-palette__search">
				<cdx-text-input
					ref="searchInput"
					v-model="searchQuery"
					class="citizen-command-palette__input"
					input-type="search"
					:start-icon="cdxIconSearch"
					:clearable="true"
					:placeholder="placeholder"
					@keydown.down.prevent="highlightNext"
					@keydown.up.prevent="highlightPrevious"
					@keydown.home.prevent="highlightFirst"
					@keydown.end.prevent="highlightLast"
					@keydown.enter.prevent="executeCommand"
					@keydown.esc="close"
				></cdx-text-input>
			</div>
			<div
				ref="resultsContainer"
				class="citizen-command-palette__results"
			>
				<template v-for="( resultGroup, key ) in searchResults" :key="key">
					<command-palette-list
						v-if="resultGroup.items.length > 0"
						:items="resultGroup.items"
						:highlighted-item-index="highlightedItemIndex"
						:show-thumbnail="resultGroup.showThumbnail"
						:search-query="searchQuery"
						:heading="resultGroup.heading"
						@update:highlighted-item-index="updatehighlightedItemIndex"
						@select="selectResult"
					></command-palette-list>
				</template>
			</div>
			<div class="citizen-command-palette__footer">
				🧪 Citizen Command Palette is in beta.
			</div>
		</div>
	</div>
</template>

<script>
const { defineComponent, ref, watch, nextTick, computed } = require( 'vue' );
const fetchJson = require( '../fetch.js' );
const urlGenerator = require( '../urlGenerator.js' )();
const CommandPaletteList = require( './CommandPaletteList.vue' );
const { CdxTextInput } = mw.loader.require( 'skins.citizen.commandPalette.codex' );
const { cdxIconSearch } = require( '../icons.json' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'App',
	compilerOptions: {
		whitespace: 'condense'
	},
	components: {
		CdxTextInput,
		CommandPaletteList
	},
	props: {},
	setup() {
		// State
		const isOpen = ref( false );
		const searchQuery = ref( '' );
		const searchResults = ref( {
			pages: {
				heading: 'Pages',
				items: [],
				showThumbnail: true
			}
		} );
		const highlightedItemIndex = ref( -1 );
		const placeholder = ref( mw.message( 'citizen-command-palette-placeholder' ).text() );
		const debounceTimeout = ref( null );
		const searchInput = ref( null );
		const resultsContainer = ref( null );

		// Computed
		const itemsLength = computed( () => Object.values( searchResults.value ).reduce( ( acc, group ) => acc + group.items.length, 0 ) );

		// Navigation methods
		const highlightNext = () => {
			if ( itemsLength.value === 0 ) {
				return;
			}
			highlightedItemIndex.value = ( highlightedItemIndex.value + 1 ) % itemsLength.value;
		};

		const highlightPrevious = () => {
			if ( itemsLength.value === 0 ) {
				return;
			}
			highlightedItemIndex.value = ( highlightedItemIndex.value - 1 + itemsLength.value ) % itemsLength.value;
		};

		const highlightFirst = () => {
			if ( itemsLength.value > 0 ) {
				highlightedItemIndex.value = 0;
			} else {
				highlightedItemIndex.value = -1;
			}
		};

		const highlightLast = () => {
			if ( itemsLength.value > 0 ) {
				highlightedItemIndex.value = itemsLength.value - 1;
			}
		};

		// Scroll handling
		const maybeScrollIntoView = () => {
			if ( !resultsContainer.value ) {
				return;
			}

			const isResultsScrollable =
				resultsContainer.value.scrollHeight > resultsContainer.value.clientHeight;

			if ( !isResultsScrollable ) {
				return;
			}

			const highlightedElement = resultsContainer.value.querySelector( '.citizen-command-palette-list-item--highlighted' );
			highlightedElement?.scrollIntoView( {
				block: 'nearest',
				behavior: 'smooth'
			} );
		};

		// Selection handling
		const updatehighlightedItemIndex = ( index ) => {
			highlightedItemIndex.value = index;
		};

		const selectResult = ( result ) => {
			window.location.href = result.url;
			isOpen.value = false;
		};

		const executeCommand = () => {
			const allItems = Object.values( searchResults.value ).reduce( ( acc, group ) => acc.concat( group.items ), [] );
			if ( allItems.length > 0 ) {
				selectResult( allItems[ highlightedItemIndex.value ] );
			} else {
				window.location.href = urlGenerator.generateUrl();
				isOpen.value = false;
			}
		};

		// Search method
		// TODO: Make this generic so that it can be used for other search types
		// eslint-disable-next-line es-x/no-async-functions
		const search = async ( query ) => {
			highlightedItemIndex.value = -1;

			if ( !query ) {
				searchResults.value.pages.items = [];
				return;
			}

			try {
				// TODO: Do not hardcode rest.php path, we need to build the URL based on config
				// TODO: Do not hardcode limit, we need to use the config
				const { fetch } = fetchJson( `/w/rest.php/v1/search/title?q=${ encodeURIComponent( query ) }&limit=10`, {
					headers: {
						accept: 'application/json'
					}
				} );
				const data = await fetch;
				const items = data.pages.map( ( result ) => ( {
					id: `citizen-command-palette-result-page-${ result.id }`,
					label: result.title,
					description: result.description,
					thumbnail: result.thumbnail,
					url: urlGenerator.generateUrl( result.title )
				} ) );
				searchResults.value = {
					pages: {
						heading: 'Pages',
						items,
						showThumbnail: true
					}
				};
			} catch ( error ) {
				mw.log.error( 'Error searching:', error );
				searchResults.value.pages.items = [];
			}
		};

		// Watchers
		watch( searchQuery, ( newQuery ) => {
			if ( debounceTimeout.value ) {
				clearTimeout( debounceTimeout.value );
			}
			debounceTimeout.value = setTimeout( () => {
				search( newQuery );
			}, 300 );
		} );

		watch( highlightedItemIndex, () => {
			nextTick( () => {
				maybeScrollIntoView();
			} );
		} );

		watch( searchResults, () => {
			nextTick( () => {
				maybeScrollIntoView();
			} );
		}, { deep: true } );

		return {
			// State
			isOpen,
			searchQuery,
			searchResults,
			highlightedItemIndex,
			placeholder,
			searchInput,
			resultsContainer,

			cdxIconSearch,

			// Methods
			highlightNext,
			highlightPrevious,
			highlightFirst,
			highlightLast,
			updatehighlightedItemIndex,
			selectResult,
			executeCommand
		};
	},
	methods: {
		/**
		 * @public
		 */
		open() {
			this.isOpen = true;
			this.$nextTick( () => {
				this.$refs.searchInput?.focus();
			} );
		},
		close() {
			this.isOpen = false;
			this.searchQuery = '';
			this.searchResults = {};
			this.highlightedItemIndex = 0;
		}
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.citizen-command-palette {
	--citizen-command-palette-side-padding: var( --space-md );

	position: fixed;
	inset: 0;

	&__overlay {
		position: absolute;
		inset: 0;
		background-color: var( --background-color-backdrop-light );
	}

	&__container {
		position: absolute;
		top: 3.5rem;
		left: 0;
		right: 0;
		margin-inline: auto;
		min-width: 16rem;
		max-width: 80vw;
		font-size: var( --font-size-base );
		background-color: var( --color-surface-1 );
		border: var( --border-base );
		border-radius: var( --border-radius-medium );
		box-shadow: var( --box-shadow-drop-xx-large );
		line-height: var( --line-height-xx-small );
		overflow: hidden;
	}

	&__input {
		/* 8px from CdxTextInput */
		margin: var( --space-sm ) calc( var( --citizen-command-palette-side-padding ) - 8px );

		.cdx-text-input__input {
			padding-left: calc( 8px + 1.25rem + var( --space-sm ) );
			padding-block: 0;
			/* Let the container handles the states */
			box-shadow: none !important;
			background-color: transparent !important;
			border: 0 !important;
			outline: none !important;
		}
	}

	&__results {
		border-top: var( --border-subtle );
		max-height: 60vh;
		overflow-y: auto;
	}

	&__footer {
		border-top: var( --border-subtle );
		padding: var( --space-sm ) var( --citizen-command-palette-side-padding );
		font-size: var( --font-size-x-small );
		color: var( --color-subtle );
	}
}
</style>
