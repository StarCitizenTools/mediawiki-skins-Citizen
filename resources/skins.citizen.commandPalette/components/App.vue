<template>
	<div
		v-if="isOpen"
		class="citizen-command-palette-backdrop"
		@click="close"></div>
	<div
		v-if="isOpen"
		class="citizen-command-palette"
		@keydown="keyboard.handleKeydown"
	>
		<command-palette-header
			ref="searchHeader"
			:model-value="query"
			:is-pending="isPending"
			:show-pending="showPending"
			@update:model-value="updateQuery( $event )"
		></command-palette-header>
		<div class="citizen-command-palette__results">
			<!-- Show Presults when query is empty and not loading -->
			<template v-if="!query && !isPending">
				<command-palette-presults
					:items="displayedItems"
					:highlighted-item-index="highlightedItemIndex"
					:search-query="query"
					:set-item-ref="setItemRef"
					@select="selectResult"
					@hover="handleHover"
					@action="handleAction"
				></command-palette-presults>
			</template>
			<!-- Show Empty State when query exists, not pending, and no results -->
			<template v-else-if="query && !isPending && displayedItems.length === 0">
				<command-palette-empty-state
					:title="$i18n( 'citizen-search-noresults-title' ).params( [ query ] ).text()"
					:description="$i18n( 'search-nonefound' ).text()"
					:icon="cdxIconArticleNotFound"
				></command-palette-empty-state>
			</template>
			<!-- Show Regular List for search results or slash commands when query exists and has results, or when loading -->
			<template v-else-if="( query || isPending ) && displayedItems.length > 0">
				<command-palette-list
					:items="displayedItems"
					:highlighted-item-index="highlightedItemIndex"
					:search-query="query"
					:set-item-ref="setItemRef"
					@select="selectResult"
					@action="handleAction"
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
const { defineComponent, ref, nextTick, computed, watch, inject } = require( 'vue' );
const useListNavigation = require( '../composables/useListNavigation.js' );
const useKeyboard = require( '../composables/useKeyboard.js' );
const useProviderOrchestration = require( '../composables/useProviderOrchestration.js' );
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
		// Inject dependencies provided by init.js
		const providers = inject( 'providers' );
		const recentItemsService = inject( 'recentItemsService' );
		const resultDecorator = inject( 'resultDecorator' );
		const recentItemsProvider = inject( 'recentItemsProvider' );
		const relatedArticlesProvider = inject( 'relatedArticlesProvider' );

		// Core refs
		const isOpen = ref( false );
		const searchHeader = ref( null );
		const itemRefs = ref( new Map() );

		// Provider orchestration (replaces Pinia searchStore)
		const orch = useProviderOrchestration( providers, resultDecorator, {
			recentItemsProvider,
			relatedArticlesProvider,
			recentItemsService
		} );

		// List navigation
		const listNav = useListNavigation( orch.displayedItems );

		// Action navigation adapter (managed at App level)
		const actionFocusedIndex = ref( -1 );
		const actionIsActive = computed( () => actionFocusedIndex.value >= 0 );

		function getHighlightedItemComponent() {
			return itemRefs.value.get( listNav.highlightedIndex.value );
		}

		const actionNav = {
			isActive: actionIsActive,
			focusedIndex: actionFocusedIndex,
			focusFirst() {
				const item = getHighlightedItemComponent();
				if ( item && item.focusFirstButton ) {
					item.focusFirstButton();
					actionFocusedIndex.value = 0;
				}
			},
			focusNext() {
				const highlightedIdx = listNav.highlightedIndex.value;
				const items = orch.displayedItems.value;
				const actions = ( highlightedIdx >= 0 && items[ highlightedIdx ] ) ?
					items[ highlightedIdx ].actions || [] : [];
				if ( actionFocusedIndex.value < actions.length - 1 ) {
					actionFocusedIndex.value++;
					const item = getHighlightedItemComponent();
					if ( item && item.focusButtonAtIndex ) {
						item.focusButtonAtIndex( actionFocusedIndex.value );
					}
				}
			},
			focusPrevious() {
				if ( actionFocusedIndex.value <= 0 ) {
					actionFocusedIndex.value = -1;
				} else {
					actionFocusedIndex.value--;
					const item = getHighlightedItemComponent();
					if ( item && item.focusButtonAtIndex ) {
						item.focusButtonAtIndex( actionFocusedIndex.value );
					}
				}
			},
			deactivate() {
				actionFocusedIndex.value = -1;
			},
			clickFocused() {
				const item = getHighlightedItemComponent();
				if ( item && item.clickButtonAtIndex ) {
					item.clickButtonAtIndex( actionFocusedIndex.value );
				}
			}
		};

		const close = () => {
			isOpen.value = false;
		};

		const focusInput = () => {
			searchHeader.value?.focus();
		};

		/**
		 * Handles the selection of a result item.
		 *
		 * @param {Object} result The selected item
		 */
		const selectResult = async ( result ) => {
			const selectionAction = await orch.handleSelection( result );

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

		// Keyboard handler
		const keyboard = useKeyboard( {
			inputRef: searchHeader,
			itemRefs,
			items: orch.displayedItems,
			listNav,
			actionNav,
			onSelect: selectResult,
			onClose: close
		} );

		// setItemRef expects the GLOBAL index within displayedItems
		const setItemRef = ( el, globalIndex ) => {
			if ( el ) {
				itemRefs.value.set( globalIndex, el );
			} else {
				itemRefs.value.delete( globalIndex );
			}
		};

		/**
		 * Updates the highlighted index only if it has changed.
		 * Prevents unnecessary updates from frequent hover events.
		 *
		 * @param {number} newIndex The index received from the hover event.
		 */
		const handleHover = ( newIndex ) => {
			if ( newIndex !== listNav.highlightedIndex.value ) {
				listNav.highlightedIndex.value = newIndex;
			}
		};

		/**
		 * Handles custom actions triggered by buttons within list items.
		 *
		 * @param {Object} action The action event payload.
		 */
		const handleAction = ( action ) => {
			switch ( action.type ) {
				case 'dismiss':
					if ( action.itemId !== undefined ) {
						orch.dismissRecentItem( action.itemId );
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
					break;
				default:
					mw.log.warn( '[CommandPalette] Unknown or missing action type received:', action );
			}
		};

		// Watch for changes in displayed items to adjust highlighting
		watch( orch.displayedItems, ( newItems ) => {
			itemRefs.value.clear();
			actionNav.deactivate();
			if ( newItems.length === 0 ) {
				listNav.highlightedIndex.value = -1;
			} else if ( listNav.highlightedIndex.value < 0 || listNav.highlightedIndex.value >= newItems.length ) {
				listNav.highlightedIndex.value = 0;
			}
		}, { flush: 'post' } );

		// This function is called externally from init.js
		const open = () => {
			isOpen.value = true;
			orch.clearSearch();
			nextTick( focusInput );
		};

		// Footer computed props
		const itemCount = computed( () => orch.displayedItems.value.length );
		const currentItem = computed( () => {
			const idx = listNav.highlightedIndex.value;
			return ( idx >= 0 && orch.displayedItems.value.length > idx ) ?
				orch.displayedItems.value[ idx ] : null;
		} );
		const highlightedItemType = computed( () => currentItem.value?.type || null );
		const actionCount = computed( () => currentItem.value?.actions?.length || 0 );
		const firstActionFocusActive = computed( () => actionFocusedIndex.value === 0 );

		return {
			// State
			isOpen,
			searchHeader,
			// Orchestration
			query: orch.query,
			displayedItems: orch.displayedItems,
			isPending: orch.isPending,
			showPending: orch.showPending,
			updateQuery: orch.updateQuery,
			// Keyboard
			keyboard,
			// List nav
			highlightedItemIndex: listNav.highlightedIndex,
			// Methods
			// eslint-disable-next-line vue/no-unused-properties -- Used externally by init.js
			open,
			close,
			selectResult,
			handleAction,
			handleHover,
			setItemRef,
			// Footer props
			hasHighlightedItemWithActions: keyboard.highlightedItemHasActions,
			itemCount,
			highlightedItemType,
			actionFocusActive: actionIsActive,
			firstActionFocusActive,
			focusedActionIndex: actionFocusedIndex,
			actionCount,
			// Icons
			cdxIconArticleNotFound
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
	transform: unset;
	transition-timing-function: var( --transition-timing-function-ease-out );
	transition-duration: var( --transition-duration-medium );
	transition-property: transform;
	.mixin-citizen-frosted-glass;
	.mixin-citizen-font-styles( 'small' );

	@starting-style {
		transform: scale( 0 ) translateY( -200% );
	}

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

	.citizen-command-palette-list-item:not( [ data-type='action' ] ) {
		opacity: 1;
		transition: opacity var( --transition-duration-medium );
		/* stylelint-disable-next-line time-min-milliseconds */
		transition-delay: calc( 0.05s * ( sibling-index() - 1 ) );

		@starting-style {
			opacity: 0;
		}
	}
}
</style>
