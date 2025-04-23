<template>
	<div
		v-if="isOpen"
		class="citizen-command-palette-backdrop"
		@click="close"></div>
	<div v-if="isOpen" class="citizen-command-palette">
		<command-palette-header
			ref="searchHeader"
			:model-value="searchStore.searchQuery"
			:is-pending="searchStore.isPending"
			:show-pending="searchStore.showPending"
			@update:model-value="searchStore.updateQuery( $event )"
			@keydown="onKeydown"
			@close="close"
			@focus-active-item="focusItem( highlightedItemIndex )"
		></command-palette-header>
		<div
			ref="resultsContainer"
			class="citizen-command-palette__results"
		>
			<!-- Show Recent Items (using Presults) when query is empty and not loading -->
			<template v-if="!searchStore.searchQuery && !searchStore.isPending">
				<command-palette-presults
					:recent-items="displayedItems"
					:highlighted-item-index="highlightedItemIndex"
					:search-query="searchStore.searchQuery"
					:set-item-ref="setItemRef"
					@update:highlighted-item-index="updatehighlightedItemIndex"
					@select="selectResult"
					@update:recent-items="searchStore.updateQuery( '' )"
					@focus-input="focusInput"
					@navigate-list="handleListNavigation"
				></command-palette-presults>
			</template>
			<!-- Show Empty State when query exists, not pending, and no results -->
			<template v-else-if="searchStore.searchQuery && !searchStore.isPending && displayedItems.length === 0">
				<command-palette-empty-state
					:title="$i18n( 'citizen-search-noresults-title' ).params( [ searchStore.searchQuery ] ).text()"
					:description="$i18n( 'search-nonefound' ).text()"
					:icon="cdxIconArticleNotFound"
				></command-palette-empty-state>
			</template>
			<!-- Show Regular List for search results or slash commands when query exists and has results, or when loading -->
			<template v-else-if="( searchStore.searchQuery || searchStore.isPending ) && displayedItems.length > 0">
				<command-palette-list
					:items="displayedItems"
					:highlighted-item-index="highlightedItemIndex"
					:search-query="searchStore.searchQuery"
					:set-item-ref="setItemRef"
					@update:highlighted-item-index="updatehighlightedItemIndex"
					@select="selectResult"
					@action="handleAction"
					@focus-input="focusInput"
					@navigate-list="handleListNavigation"
				></command-palette-list>
			</template>
		</div>
		<command-palette-footer
			:has-highlighted-item-with-actions="hasHighlightedItemWithActions"
			:is-action-button-focused="isActionButtonFocused"
		></command-palette-footer>
	</div>
</template>

<script>
const { useSearchStore } = require( '../stores/searchStore.js' );
const { storeToRefs } = require( 'pinia' );
const { defineComponent, ref, nextTick, computed, watch } = require( 'vue' );
const useListNavigation = require( '../composables/useListNavigation.js' );
const CommandPaletteList = require( './CommandPaletteList.vue' );
const CommandPaletteEmptyState = require( './CommandPaletteEmptyState.vue' );
const CommandPalettePresults = require( './CommandPalettePresults.vue' );
const CommandPaletteFooter = require( './CommandPaletteFooter.vue' );
const CommandPaletteHeader = require( './CommandPaletteHeader.vue' );
const { cdxIconArticleNotFound } = require( '../icons.json' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'App',
	compilerOptions: {
		whitespace: 'condense'
	},
	components: {
		CommandPaletteList,
		CommandPaletteEmptyState,
		CommandPalettePresults,
		CommandPaletteFooter,
		CommandPaletteHeader
	},
	props: {},
	setup() {
		const searchStore = useSearchStore();
		const {
			displayedItems,
			searchUrl
		} = storeToRefs( searchStore );

		const isOpen = ref( false );
		const searchHeader = ref( null );
		const resultsContainer = ref( null );
		const isActionButtonFocused = ref( false );
		const itemRefs = ref( [] );

		const { highlightedItemIndex, handleNavigationKeydown } = useListNavigation( displayedItems, itemRefs );

		const focusInput = () => {
			searchHeader.value?.focus();
		};

		const setItemRef = ( el, index ) => {
			if ( el ) {
				itemRefs.value[ index ] = el;
			}
		};

		const open = () => {
			isOpen.value = true;
			searchStore.clearSearch();
			nextTick( focusInput );
		};

		const close = () => {
			isOpen.value = false;
		};

		const updatehighlightedItemIndex = ( index ) => {
			highlightedItemIndex.value = index;
		};

		const hasHighlightedItemWithActions = computed( () => {
			if ( displayedItems.value.length === 0 || highlightedItemIndex.value < 0 ) {
				return false;
			}
			const highlightedItem = displayedItems.value[ highlightedItemIndex.value ];
			return Boolean(
				highlightedItem &&
				highlightedItem.actions &&
				highlightedItem.actions.length > 0
			);
		} );

		const selectResult = ( result ) => {
			if ( !result ) {
				if ( searchStore.searchQuery && !searchStore.searchQuery.startsWith( '/' ) ) {
					window.location.href = searchUrl.value;
					close();
				}
				return;
			}

			switch ( result.type ) {
				case 'command':
					searchStore.updateQuery( result.value + ' ' );
					nextTick( focusInput );
					break;
				case 'namespace':
				case 'commandSuggestion':
					searchStore.updateQuery( result.label + ':' );
					nextTick( focusInput );
					break;
				case 'search':
				case 'recent':
				default:
					window.location.href = result.url;
					searchStore.saveToHistory( result );
					close();
					break;
			}
		};

		const handleAction = ( action ) => {
			if ( action.url ) {
				window.location.href = action.url;
				close();
			} else if ( action.event ) {
				// Use mw.log for debugging in MediaWiki context if preferred
				// console.log( 'Action event:', action.event );
			}
		};

		const onKeydown = ( event ) => {
			if ( handleNavigationKeydown( event ) ) {
				return;
			}

			if ( event.key === 'Enter' ) {
				if ( isActionButtonFocused.value ) {
					return;
				}

				event.preventDefault();
				const selectedItem = highlightedItemIndex.value >= 0 ?
					displayedItems.value[ highlightedItemIndex.value ] :
					null;
				selectResult( selectedItem );
			} else if ( event.key === 'Tab' ) {
				const currentHighlightedItem = hasHighlightedItemWithActions.value ? displayedItems.value[ highlightedItemIndex.value ] : null;
				if ( currentHighlightedItem && !event.shiftKey ) {
					const highlightedElement = itemRefs.value[ highlightedItemIndex.value ];
					const firstActionButton = highlightedElement?.querySelector( 'button, a' );
					if ( firstActionButton ) {
						event.preventDefault();
						firstActionButton.focus();
						isActionButtonFocused.value = true;
					}
				} else if ( isActionButtonFocused.value && event.shiftKey ) {
					event.preventDefault();
					focusInput();
					isActionButtonFocused.value = false;
				}
			} else if ( event.key === 'Escape' ) {
				close();
			}
		};

		const handleListNavigation = ( event ) => {
			onKeydown( event );
		};

		const focusItem = ( index ) => {
			const element = itemRefs.value[ index ];
			element?.focus();
		};

		// Watch for changes in displayed items to potentially reset selection
		watch( displayedItems, ( newItems ) => {
			// Reset selection to the first item if the provider indicated it
			if ( searchStore.autoSelectFirst && newItems.length > 0 ) {
				highlightedItemIndex.value = 0;
			} else if ( newItems.length === 0 ) {
				// Reset if list becomes empty
				highlightedItemIndex.value = -1;
			}
		} );

		return {
			searchStore,
			isOpen,
			displayedItems,
			highlightedItemIndex,
			searchHeader,
			resultsContainer,
			setItemRef,
			// eslint-disable-next-line vue/no-unused-properties
			open,
			close,
			selectResult,
			handleAction,
			onKeydown,
			handleListNavigation,
			updatehighlightedItemIndex,
			cdxIconArticleNotFound,
			hasHighlightedItemWithActions,
			isActionButtonFocused,
			focusItem,
			focusInput
		};
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

	&__results {
		max-height: calc( 100vh - 16rem );
		overflow-y: auto;
		border-top: var( --border-subtle );
	}

	&__no-results {
		padding: var( --space-md ) var( --citizen-command-palette-side-padding );
		text-align: center;
	}
}
</style>
