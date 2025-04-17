<template>
	<div
		v-if="isOpen"
		class="citizen-command-palette-backdrop"
		@click="close"></div>
	<div v-if="isOpen" class="citizen-command-palette">
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
		<div
			v-if="isPending && showPending"
			class="citizen-command-palette__progress-indicator citizen-loading"
		></div>
		<div
			ref="resultsContainer"
			class="citizen-command-palette__results"
		>
			<template v-if="!searchQuery">
				<command-palette-presults
					:recent-items="recentItems"
					:highlighted-item-index="highlightedItemIndex"
					:search-query="searchQuery"
					@update:highlighted-item-index="updatehighlightedItemIndex"
					@select="selectResult"
				></command-palette-presults>
			</template>
			<template v-else-if="itemsLength === 0 && !isPending">
				<command-palette-empty-state
					:title="$i18n( 'citizen-search-noresults-title' ).params( [ searchQuery ] ).text()"
					:description="$i18n( 'search-nonefound' ).text()"
					:icon="cdxIconArticleNotFound"
				></command-palette-empty-state>
			</template>
			<template v-else>
				<template
					v-for="( resultGroup, key ) in searchResults"
					:key="key"
				>
					<command-palette-list
						v-if="resultGroup.items.length > 0"
						:items="resultGroup.items"
						:highlighted-item-index="highlightedItemIndex"
						:show-thumbnail="resultGroup.showThumbnail"
						:search-query="searchQuery"
						@update:highlighted-item-index="updatehighlightedItemIndex"
						@select="selectResult"
					></command-palette-list>
				</template>
			</template>
		</div>
		<div class="citizen-command-palette__footer">
			<div class="citizen-command-palette__footer-note">
				Thanks for trying our new Command Palette!
				<a href="https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues">Give us feedback</a>
			</div>
			<div class="citizen-command-palette__footer-hints">
				<div class="citizen-keyboard-hint">
					<span class="citizen-keyboard-hint-label">{{ $i18n( 'citizen-command-palette-keyhint-select' ).text() }}</span>
					<kbd class="citizen-keyboard-hint-key">↵</kbd>
				</div>
				<div class="citizen-keyboard-hint">
					<span class="citizen-keyboard-hint-label">{{ $i18n( 'citizen-command-palette-keyhint-navigate' ).text() }}</span>
					<kbd class="citizen-keyboard-hint-key">↑↓</kbd>
				</div>
				<div class="citizen-keyboard-hint">
					<span class="citizen-keyboard-hint-label">{{ $i18n( 'citizen-command-palette-keyhint-exit' ).text() }}</span>
					<kbd class="citizen-keyboard-hint-key">esc</kbd>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
const { defineComponent, ref, watch, nextTick, computed } = require( 'vue' );
const createSearchService = require( '../searchService.js' );
const createSearchHistoryService = require( '../searchHistoryService.js' );
const urlGenerator = require( '../urlGenerator.js' )();
const CommandPaletteList = require( './CommandPaletteList.vue' );
const CommandPaletteEmptyState = require( './CommandPaletteEmptyState.vue' );
const CommandPalettePresults = require( './CommandPalettePresults.vue' );
const { CdxTextInput } = mw.loader.require( 'skins.citizen.commandPalette.codex' );
const { cdxIconArticle, cdxIconArticleNotFound, cdxIconSearch } = require( '../icons.json' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'App',
	compilerOptions: {
		whitespace: 'condense'
	},
	components: {
		CdxTextInput,
		CommandPaletteList,
		CommandPaletteEmptyState,
		CommandPalettePresults
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
				items: [],
				showThumbnail: true
			}
		} );
		const highlightedItemIndex = ref( -1 );
		const debounceTimeout = ref( null );
		const searchInput = ref( null );
		const resultsContainer = ref( null );
		const searchService = ref( createSearchService( mw.config ) );
		const searchHistoryService = ref( createSearchHistoryService() );
		const recentItems = ref( {
			pages: {
				items: [],
				showThumbnail: true
			}
		} );

		// Load recent items
		const loadRecentItems = () => {
			recentItems.value = searchHistoryService.value.getRecentItems();
		};

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
			if ( !result ) {
				window.location.href = getSearchUrl();
				// Save the search query as a recent item when there are no results
				if ( searchQuery.value.trim() !== '' ) {
					searchHistoryService.value.saveSearchQuery( searchQuery.value, getSearchUrl() );
				}
				isOpen.value = false;
				return;
			}

			// If we have a valid result with URL, navigate to it
			if ( result.url ) {
				window.location.href = result.url;
				// Save the entire result object to recent items
				searchHistoryService.value.saveRecentItem( result );
			} else {
				// If no URL, fall back to search and save the query
				window.location.href = getSearchUrl();
				searchHistoryService.value.saveSearchQuery( searchQuery.value, getSearchUrl() );
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
				loadRecentItems();
				return;
			}

			showPending.value = true;

			try {
				const results = await searchService.value.search( query, 10 );
				const items = results.map( ( result ) => ( {
					type: 'page',
					id: `citizen-command-palette-result-page-${ result.id }`,
					label: result.label,
					description: result.description,
					thumbnail: result.thumbnail,
					thumbnailIcon: cdxIconArticle,
					url: result.url,
					metadata: result.metadata
				} ) );
				searchResults.value = {
					pages: {
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
			isPending.value = true;
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
			recentItems,
			highlightedItemIndex,
			searchInput,
			resultsContainer,

			// Icons
			cdxIconArticleNotFound,
			cdxIconSearch,

			// Methods
			highlightNext,
			highlightPrevious,
			highlightFirst,
			highlightLast,
			updatehighlightedItemIndex,
			selectResult,
			executeCommand,
			itemsLength,
			loadRecentItems
		};
	},
	methods: {
		/**
		 * @public
		 */
		open() {
			this.isOpen = true;
			this.loadRecentItems();
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
	top: var( --space-xs );
	right: var( --space-xs );
	left: var( --space-xs );
	max-width: @size-5600;
	margin-inline: auto;
	overflow: hidden;
	font-size: var( --font-size-medium );
	line-height: var( --line-height-xx-small );
	background-color: var( --color-surface-1 );
	border: var( --border-base );
	border-radius: var( --border-radius-medium );
	box-shadow: var( --box-shadow-drop-xx-large );

	@media ( min-width: @max-width-breakpoint-tablet ) {
		top: 3rem;
	}

	&-overlay {
		position: absolute;
		top: 0;
		left: 0;
	}

	&-backdrop {
		position: fixed;
		inset: 0;
		background-color: var( --background-color-backdrop-light );
	}

	&__progress-indicator {
		position: absolute;
		right: 0;
		left: 0;
	}

	&__search {
		/* 8px from CdxTextInput */
		padding: var( --space-sm ) calc( var( --citizen-command-palette-side-padding ) - @spacing-50 );
	}

	&__input {
		.cdx-text-input__input {
			padding-block: 0;
			padding-left: calc( @spacing-50 + @size-icon-medium + var( --space-sm ) );
			outline: 0 !important;
			background-color: transparent !important;
			border: 0 !important;
			/* Let the container handles the states */
			box-shadow: none !important;
		}
	}

	&__results {
		max-height: calc( 100vh - 16rem );
		overflow-y: auto;
		border-top: var( --border-subtle );
	}

	&__footer {
		display: flex;
		gap: var( --space-sm );
		align-items: center;
		justify-content: space-between;
		padding: var( --space-sm ) var( --citizen-command-palette-side-padding );
		font-size: var( --font-size-x-small );
		color: var( --color-subtle );
		border-top: var( --border-subtle );
	}

	&__footer-hints {
		display: flex;
		gap: var( --space-md );
	}

	&__footer-note {
		color: var( --color-subtle );
	}

	&__no-results {
		padding: var( --space-md ) var( --citizen-command-palette-side-padding );
		text-align: center;
	}
}
</style>
