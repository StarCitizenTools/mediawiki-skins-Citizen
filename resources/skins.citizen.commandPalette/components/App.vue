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
					:placeholder="$i18n( 'searchsuggest-search' ).text()"
					@keydown.down.prevent="highlightNext"
					@keydown.up.prevent="highlightPrevious"
					@keydown.home.prevent="highlightFirst"
					@keydown.end.prevent="highlightLast"
					@keydown.enter.prevent="executeCommand"
					@keydown.esc="close"
				></cdx-text-input>
			</div>
			<div v-if="isPending && showPending" class="citizen-loading"></div>
			<div
				ref="resultsContainer"
				class="citizen-command-palette__results"
			>
				<template v-if="itemsLength === 0 && searchQuery">
					<div class="citizen-command-palette__no-results">
						{{ $i18n( 'search-nonefound' ).text() }}
					</div>
				</template>

				<template
					v-for="( resultGroup, key ) in searchResults"
					v-else
					:key="key"
				>
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
				Command Palette is experimental and in active development.
			</div>
		</div>
	</div>
</template>

<script>
const { defineComponent, ref, watch, nextTick, computed } = require( 'vue' );
const createSearchService = require( '../searchService.js' );
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
		const isPending = ref( false );
		const showPending = ref( false );
		const searchQuery = ref( '' );
		const searchResults = ref( {
			pages: {
				heading: 'Pages',
				items: [],
				showThumbnail: true
			}
		} );
		const highlightedItemIndex = ref( -1 );
		const debounceTimeout = ref( null );
		const searchInput = ref( null );
		const resultsContainer = ref( null );
		const searchService = ref( createSearchService( mw.config ) );

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

		const getSearchUrl = () => urlGenerator.generateUrl( 'Special:Search', {
			search: searchQuery.value
		} );

		const selectResult = ( result ) => {
			if ( !result || !result.url ) {
				window.location.href = getSearchUrl();
			} else {
				window.location.href = result.url;
			}
			isOpen.value = false;
		};

		const executeCommand = () => {
			const allItems = Object.values( searchResults.value ).reduce( ( acc, group ) => acc.concat( group.items ), [] );
			selectResult( allItems[ highlightedItemIndex.value ] );
		};

		// Search method
		// eslint-disable-next-line es-x/no-async-functions
		const search = async ( query ) => {
			highlightedItemIndex.value = -1;

			if ( !query ) {
				searchResults.value = {
					pages: {
						heading: 'Pages',
						items: [],
						showThumbnail: true
					}
				};
				return;
			}

			isPending.value = true;
			showPending.value = true;

			try {
				const results = await searchService.value.search( query, 10 );
				const items = results.map( ( result ) => ( {
					id: `citizen-command-palette-result-page-${ result.id }`,
					label: result.label,
					description: result.description,
					thumbnail: result.thumbnail,
					url: result.url,
					metadata: result.metadata
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
			} finally {
				isPending.value = false;
				// Delay hiding the pending state to prevent flicker
				setTimeout( () => {
					showPending.value = false;
				}, 300 );
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
			isPending,
			showPending,
			searchQuery,
			searchResults,
			highlightedItemIndex,
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
			executeCommand,
			itemsLength
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
		top: var(--space-xs );
		left: var( --space-xs );
		right: var( --space-xs );
		margin-inline: auto;
		max-width: @size-5600;
		font-size: var( --font-size-base );
		background-color: var( --color-surface-1 );
		border: var( --border-base );
		border-radius: var( --border-radius-medium );
		box-shadow: var( --box-shadow-drop-xx-large );
		line-height: var( --line-height-xx-small );
		overflow: hidden;

		@media ( min-width: @max-width-breakpoint-tablet ) {
			top: 3rem;
		}
	}

	&__search {
		/* 8px from CdxTextInput */
		padding: var( --space-sm ) calc( var( --citizen-command-palette-side-padding ) - @spacing-50 );
	}

	&__input {
		.cdx-text-input__input {
			padding-left: calc( @spacing-50 + @size-icon-medium + var( --space-sm ) );
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
		max-height: calc( 100vh - 16rem );
		overflow-y: auto;
	}

	&__footer {
		border-top: var( --border-subtle );
		padding: var( --space-sm ) var( --citizen-command-palette-side-padding );
		font-size: var( --font-size-x-small );
		color: var( --color-subtle );
	}

	&__no-results {
		padding: var( --space-md ) var( --citizen-command-palette-side-padding );
		text-align: center;
	}
}
</style>
