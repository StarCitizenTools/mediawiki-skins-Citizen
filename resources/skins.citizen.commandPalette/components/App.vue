<template>
	<div
		v-if="isOpen"
		class="citizen-command-palette-backdrop"
		@click="close"></div>
	<div
		v-if="isOpen"
		class="citizen-command-palette"
		@keydown="handleRootKeydown"
	>
		<command-palette-header
			ref="searchHeader"
			:model-value="searchStore.searchQuery"
			:is-pending="searchStore.isPending"
			:show-pending="searchStore.showPending"
			@update:model-value="searchStore.updateQuery( $event )"
			@close="close"
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
					@navigate-list="handleNavigationKeydown"
					@focus-action="handleFocusAction"
					@blur-actions="handleBlurActions"
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
					@navigate-list="handleNavigationKeydown"
					@focus-action="handleFocusAction"
					@blur-actions="handleBlurActions"
				></command-palette-list>
			</template>
		</div>
		<command-palette-footer
			:has-highlighted-item-with-actions="hasHighlightedItemWithActions"
			:item-count="itemCount"
			:highlighted-item-type="highlightedItemType"
			:is-action-focused="actionFocusActive"
			:is-first-action-focused="firstActionFocusActive"
			:focused-action-index="focusedActionIndex"
			:action-count="actionCount"
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
			displayedItems
		} = storeToRefs( searchStore );

		const isOpen = ref( false );
		const searchHeader = ref( null );
		const resultsContainer = ref( null );
		const itemRefs = ref( [] );
		const actionFocusActive = ref( false );
		const firstActionFocusActive = ref( false );
		const focusedActionIndex = ref( -1 );

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

		const itemCount = computed( () => displayedItems.value.length );

		const currentItem = computed( () => {
			if ( highlightedItemIndex.value >= 0 && displayedItems.value.length > highlightedItemIndex.value ) {
				return displayedItems.value[ highlightedItemIndex.value ];
			}
			return null;
		} );

		const highlightedItemType = computed( () => currentItem.value?.type || null );
		const actionCount = computed( () => currentItem.value?.actions?.length || 0 );

		const handleFocusAction = ( payload ) => {
			actionFocusActive.value = true;
			firstActionFocusActive.value = payload.isFirst;
			focusedActionIndex.value = payload.index;
		};

		const handleBlurActions = () => {
			actionFocusActive.value = false;
			firstActionFocusActive.value = false;
			focusedActionIndex.value = -1;
		};

		const selectResult = ( result ) => {
			const selectionAction = searchStore.handleSelection( result );

			switch ( selectionAction.action ) {
				case 'navigate':
					if ( selectionAction.payload ) {
						window.location.href = selectionAction.payload;
						close(); // Close after initiating navigation
					}
					break;
				case 'updateQuery':
					// Query already updated by the store action, just focus input
					nextTick( focusInput );
					break;
				case 'none':
				default:
					// No specific action needed from the component side
					// Potential improvement: Maybe close if enter is pressed on empty slash command?
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
			// Handle list navigation (Up/Down/Home/End)
			if ( [ 'ArrowUp', 'ArrowDown', 'Home', 'End' ].includes( event.key ) ) {
				if ( handleNavigationKeydown( event ) ) {
					event.preventDefault();
					nextTick( focusInput );
					return;
				}
			}

			if ( event.key === 'Enter' ) {
				event.preventDefault();
				const selectedItem = highlightedItemIndex.value >= 0 ?
					displayedItems.value[ highlightedItemIndex.value ] :
					null;
				if ( selectedItem ) {
					selectResult( selectedItem );
				}
			} else if ( event.key === 'Escape' ) {
				close();
			} else if ( event.key === 'ArrowRight' ) {
				// Handle moving focus to actions
				const inputElement = event.target;
				const isCursorAtEnd = inputElement.selectionStart === inputElement.value.length && inputElement.selectionEnd === inputElement.value.length;
				const currentItemIndex = highlightedItemIndex.value;
				const itemHasActions = hasHighlightedItemWithActions.value; // Cache computed value

				if ( isCursorAtEnd && currentItemIndex >= 0 && itemHasActions ) {
					const itemComponent = itemRefs.value[ currentItemIndex ];
					if ( itemComponent?.focusFirstButton ) {
						event.preventDefault();
						itemComponent.focusFirstButton();
					}
				}
			}
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

		// Watch for the store flag indicating input focus is needed
		watch( () => searchStore.needsInputFocus, ( needsFocus ) => {
			if ( needsFocus ) {
				focusInput();
				// Reset the flag in the store after focusing
				searchStore.focusHandled();
			}
		} );

		// Global keydown handler for the palette root element
		const handleRootKeydown = ( event ) => {
			// Ignore if modifier keys are pressed
			if ( event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ) {
				return;
			}

			// Get the input element via the header component's method
			const inputElement = searchHeader.value?.getInputElement();

			// Let the header's own handler deal with events originating from the input
			if ( inputElement && event.target === inputElement ) {
				onKeydown( event );
				return;
			}

			// Check if focus is currently within an action button
			const isActionFocused = event.target?.closest( '.citizen-command-palette-list-item__action' );

			if ( isActionFocused ) {
				// Check for specifically handled keys within actions (handled by useActionNavigation)
				const handledByActionNav = [ 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' ' ];
				if ( handledByActionNav.includes( event.key ) ) {
					// Let the action button's own handler manage these
					return;
				}

				// Check for other navigation/control keys we don't want to trigger refocus
				const nonTypingKeys = [ 'Escape', 'Tab', 'Home', 'End', 'PageUp', 'PageDown' ];
				if ( nonTypingKeys.includes( event.key ) ) {
					// Handle Escape globally, ignore others
					if ( event.key === 'Escape' ) {
						close();
					}
					return;
				}

				// If it's likely a typing key (length 1 or Backspace/Delete)
				if ( event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete' ) {
					focusInput();
					// Do not preventDefault, allow the keypress into the input
					return;
				}
			}

			// If focus is not in input or actions, handle Escape globally
			if ( event.key === 'Escape' ) {
				close();
			}
		};

		return {
			searchStore,
			isOpen,
			displayedItems,
			highlightedItemIndex,
			searchHeader,
			resultsContainer,
			setItemRef,
			handleNavigationKeydown,
			// eslint-disable-next-line vue/no-unused-properties
			open,
			close,
			selectResult,
			handleAction,
			handleRootKeydown,
			updatehighlightedItemIndex,
			cdxIconArticleNotFound,
			hasHighlightedItemWithActions,
			itemCount,
			highlightedItemType,
			actionFocusActive,
			firstActionFocusActive,
			focusedActionIndex,
			actionCount,
			handleFocusAction,
			handleBlurActions
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
