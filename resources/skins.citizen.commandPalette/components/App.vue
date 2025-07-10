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
			<!-- Show Presults when query is empty and not loading -->
			<template v-if="!searchStore.searchQuery && !searchStore.isPending">
				<command-palette-presults
					:items="displayedItems"
					:highlighted-item-index="highlightedItemIndex"
					:search-query="searchStore.searchQuery"
					:set-item-ref="setItemRef"
					@select="selectResult"
					@update:recent-items="searchStore.updateQuery( '' )"
					@navigate-list="handleNavigationKeydown"
					@focus-action="handleFocusAction"
					@blur-actions="handleBlurActions"
					@hover="handleHover"
					@action="handleAction"
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
					@select="selectResult"
					@action="handleAction"
					@navigate-list="handleNavigationKeydown"
					@focus-action="handleFocusAction"
					@blur-actions="handleBlurActions"
					@hover="handleHover"
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
const { CommandPaletteItem, CommandPaletteActionEvent } = require( '../types.js' );

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
			displayedItems // Now the single unified list
		} = storeToRefs( searchStore );

		const isOpen = ref( false );
		const searchHeader = ref( null );
		const resultsContainer = ref( null );
		const itemRefs = ref( new Map() );
		const actionFocusActive = ref( false );
		const firstActionFocusActive = ref( false );
		const focusedActionIndex = ref( -1 );

		// Computed property for the list that navigation should operate on
		const navigableItems = computed( () => displayedItems.value );

		const { highlightedItemIndex, handleNavigationKeydown } = useListNavigation( navigableItems, itemRefs ); // Use navigableItems

		const close = () => {
			isOpen.value = false;
		};

		const focusInput = () => {
			searchHeader.value?.focus();
		};

		// setItemRef now expects the GLOBAL index within navigableItems
		const setItemRef = ( el, globalIndex ) => {
			if ( el ) {
				itemRefs.value.set( globalIndex, el );
			} else {
				itemRefs.value.delete( globalIndex );
			}
		};

		const hasHighlightedItemWithActions = computed( () => {
			// Use navigableItems which contains the combined list in Presults view
			if ( navigableItems.value.length === 0 || highlightedItemIndex.value < 0 || highlightedItemIndex.value >= navigableItems.value.length ) {
				return false;
			}
			// Access the correct item using the global index from the combined list
			const highlightedItem = navigableItems.value[ highlightedItemIndex.value ];
			return Boolean(
				highlightedItem &&
				highlightedItem.actions &&
				highlightedItem.actions.length > 0
			);
		} );

		const itemCount = computed( () => navigableItems.value.length );

		const currentItem = computed( () => {
			if ( highlightedItemIndex.value >= 0 && navigableItems.value.length > highlightedItemIndex.value ) {
				return navigableItems.value[ highlightedItemIndex.value ];
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

		/**
		 * Updates the highlighted index only if it has changed.
		 * Prevents unnecessary updates from frequent hover events.
		 *
		 * @param {number} newIndex The index received from the hover event.
		 */
		const handleHover = ( newIndex ) => {
			if ( newIndex !== highlightedItemIndex.value ) {
				highlightedItemIndex.value = newIndex;
			}
		};

		/**
		 * Handles the selection of a result item.
		 *
		 * @param {CommandPaletteItem} result The selected item
		 */
		const selectResult = async ( result ) => {
			const selectionAction = await searchStore.handleSelection( result );

			switch ( selectionAction.action ) {
				case 'navigate':
					if ( selectionAction.payload ) {
						// <a> tags are handled by the browser on mouse click, so we don't need to navigate.
						if ( !result.isMouseClick ) {
							window.location.href = selectionAction.payload;
						}
						close();
					}
					break;
				case 'updateQuery':
					nextTick( focusInput );
					break;
				case 'none':
				default:
					break;
			}
		};

		/**
		 * Handles custom actions triggered by buttons within list items.
		 *
		 * @param {CommandPaletteActionEvent} action The action event payload.
		 */
		const handleAction = ( action ) => {
			switch ( action.type ) {
				case 'dismiss':
					if ( action.itemId !== undefined ) {
						searchStore.dismissRecentItem( action.itemId );
					} else {
						mw.log.warn( '[CommandPalette] Dismiss action missing itemId:', action );
					}
					break;

				case 'navigate':
					if ( action.url ) {
						window.location.href = action.url;
						close();
					} else {
						mw.log.warn( '[CommandPalette] Navigate action missing url:', action );
					}
					break;

				case 'event':
					// Placeholder for custom event handling
					// console.debug( '[CommandPalette] Action event received:', action.event );
					break;

				default:
					// Fallback for unknown or untyped actions
					mw.log.warn( '[CommandPalette] Unknown or missing action type received:', action );
			}
		};

		/**
		 * Handles the Enter key press within the input.
		 *
		 * @param {KeyboardEvent} event The keydown event.
		 */
		const handleEnterKey = ( event ) => {
			event.preventDefault();
			const selectedItem = highlightedItemIndex.value >= 0 ?
				navigableItems.value[ highlightedItemIndex.value ] :
				null;
			if ( selectedItem ) {
				selectResult( selectedItem );
			}
		};

		/**
		 * Handles the ArrowRight key press within the input to potentially focus actions.
		 *
		 * @param {KeyboardEvent} event The keydown event.
		 */
		const handleArrowRightKey = ( event ) => {
			// Only handle moving focus to actions if the event originated from the input element
			const inputElement = searchHeader.value?.getInputElement();
			if ( !inputElement || event.target !== inputElement ) {
				return;
			}

			const isCursorAtEnd = inputElement.selectionStart === inputElement.value.length && inputElement.selectionEnd === inputElement.value.length;
			const currentItemIndex = highlightedItemIndex.value;
			// Use hasHighlightedItemWithActions computed property directly
			const itemHasActions = hasHighlightedItemWithActions.value;

			if ( isCursorAtEnd && currentItemIndex >= 0 && itemHasActions ) {
				const itemComponent = itemRefs.value.get( currentItemIndex );
				if ( itemComponent?.focusFirstButton ) {
					event.preventDefault();
					itemComponent.focusFirstButton();
				}
			}
		};

		/**
		 * Handles keydown events within the palette root element.
		 *
		 * @param {KeyboardEvent} event The keydown event.
		 */
		const onKeydown = ( event ) => {
			// Handle list navigation (Up/Down/Home/End)
			if ( [ 'ArrowUp', 'ArrowDown', 'Home', 'End' ].includes( event.key ) ) {
				if ( handleNavigationKeydown( event ) ) {
					event.preventDefault();
					// Focus input only if navigation actually occurred and changed highlight
					// handleNavigationKeydown returns true if it handled the event
					nextTick( focusInput );
					return; // Navigation handled, exit
				}
				event.preventDefault();
			}

			// Handle specific key actions
			switch ( event.key ) {
				case 'Enter':
					handleEnterKey( event );
					break;
				case 'Escape':
					close();
					break;
				case 'ArrowRight':
					handleArrowRightKey( event );
					break;
			}
		};

		// Watch for changes in displayed items to adjust highlighting
		watch( navigableItems, ( newItems ) => {
			const previousIndex = highlightedItemIndex.value;

			// Always clear refs as the DOM structure might change
			itemRefs.value.clear();

			if ( newItems.length === 0 ) {
				// List is empty, reset highlight
				highlightedItemIndex.value = -1;
			} else {
				// List has items, try to preserve highlight
				if ( previousIndex < 0 || previousIndex >= newItems.length ) {
					// Previous index is invalid (was -1 or now out of bounds), reset to first item
					highlightedItemIndex.value = 0;
				} else {
					// Previous index is still valid, keep it (do nothing)
				}
			}
		}, { flush: 'post' } );

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

		// Define open before close as close is used within other functions defined later
		// This function is called externally from init.js
		const open = () => {
			isOpen.value = true;
			// clearSearch now fetches recent items AND related articles
			searchStore.clearSearch();
			nextTick( focusInput );
		};

		return {
			searchStore,
			displayedItems, // Pass the unified list down
			isOpen,
			searchHeader,
			resultsContainer,
			setItemRef,
			handleNavigationKeydown,
			// eslint-disable-next-line vue/no-unused-properties -- Used externally by init.js
			open,
			close,
			selectResult,
			handleAction,
			handleRootKeydown,
			cdxIconArticleNotFound,
			hasHighlightedItemWithActions,
			itemCount,
			highlightedItemType,
			actionFocusActive,
			firstActionFocusActive,
			focusedActionIndex,
			actionCount,
			handleFocusAction,
			handleBlurActions,
			highlightedItemIndex,
			handleHover
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';
@import '../../mixins.less';

.citizen-command-palette {
	--citizen-command-palette-side-padding: var( --space-md );
	position: fixed;
	top: var( --space-xs );
	right: var( --space-xs );
	left: var( --space-xs );
	max-width: @size-5600;
	margin-inline: auto;
	overflow: hidden;
	border: var( --border-base );
	border-radius: var( --border-radius-medium );
	box-shadow: var( --box-shadow-drop-xx-large );
	.mixin-citizen-frosted-glass-simple;
	.mixin-citizen-font-styles( 'small' );

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
