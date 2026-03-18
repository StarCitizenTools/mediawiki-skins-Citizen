<template>
	<Transition name="citizen-command-palette-backdrop">
		<div
			v-if="isOpen"
			class="citizen-command-palette-backdrop"
			@click="close"></div>
	</Transition>
	<Transition
		name="citizen-command-palette"
		@enter="updateBodyHeight"
		@after-enter="setupResizeObserver"
		@after-leave="teardownResizeObserver"
	>
		<div
			v-if="isOpen"
			class="citizen-command-palette"
			@keydown="keyboard.handleKeydown"
		>
			<command-palette-header
				ref="searchHeader"
				:tokens="tokenInput.tokens.value"
				:free-text="tokenInput.freeText.value"
				:selected-token-index="tokenInput.selectedIndex.value"
				:is-pending="isPending"
				:show-pending="showPending"
				:active-mode="activeMode"
				@exit-mode="exitMode"
				@update:free-text="handleFreeTextUpdate( $event )"
				@select-token="tokenInput.selectToken( $event )"
				@remove-token="handleRemoveToken( $event )"
			></command-palette-header>
			<div
				ref="bodyContainer"
				class="citizen-command-palette__body"
				:class="{ 'citizen-command-palette__body--has-detail': highlightedItemDetail }"
			>
				<div ref="bodyInner" class="citizen-command-palette__results">
					<command-palette-empty-state
						v-if="!showPending && flatItems.length === 0"
						:title="emptyStateContent.title"
						:description="emptyStateContent.description"
						:icon="emptyStateContent.icon"
					></command-palette-empty-state>
					<command-palette-list
						v-else-if="displayedItems.length > 0"
						:sections="displayedItems"
						:highlighted-item-index="highlightedItemIndex"
						:search-query="query"
						:set-item-ref="setItemRef"
						@select="selectResult"
						@action="handleAction"
						@hover="handleHover"
					></command-palette-list>
				</div>
				<command-palette-detail-panel
					v-if="highlightedItemDetail"
					class="citizen-command-palette__detail"
					:detail="highlightedItemDetail"
				></command-palette-detail-panel>
			</div>
			<command-palette-footer
				:hints="keyboard.keyboardHints.value"
			></command-palette-footer>
		</div>
	</Transition>
</template>

<script>
const { defineComponent, ref, nextTick, computed, watch, inject, onBeforeUnmount } = require( 'vue' );
const useListNavigation = require( '../composables/useListNavigation.js' );
const useKeyboard = require( '../composables/useKeyboard.js' );
const useProviderOrchestration = require( '../composables/useProviderOrchestration.js' );
const useTokenizedInput = require( '../composables/useTokenizedInput.js' );
const CommandPaletteList = require( './CommandPaletteList.vue' );
const CommandPaletteEmptyState = require( './CommandPaletteEmptyState.vue' );
const CommandPaletteFooter = require( './CommandPaletteFooter.vue' );
const CommandPaletteHeader = require( './CommandPaletteHeader.vue' );
const CommandPaletteDetailPanel = require( './CommandPaletteDetailPanel.vue' );
const { cdxIconArticleNotFound, cdxIconArticlesSearch } = require( '../icons.json' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'App',
	compilerOptions: {
		whitespace: 'condense'
	},
	components: {
		CommandPaletteList,
		CommandPaletteEmptyState,
		CommandPaletteDetailPanel,
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
		const findModeByTrigger = inject( 'findModeByTrigger' );
		const findModeByQuery = inject( 'findModeByQuery' );
		const getTokenPatterns = inject( 'getTokenPatterns' );

		// Core refs
		const isOpen = ref( false );
		const searchHeader = ref( null );
		const itemRefs = ref( new Map() );
		const bodyContainer = ref( null );
		const bodyInner = ref( null );
		let resizeObserver = null;

		const updateBodyHeight = () => {
			const container = bodyContainer.value;
			const inner = bodyInner.value;
			if ( container && inner ) {
				container.style.setProperty(
					'--citizen-command-palette-body-height',
					inner.scrollHeight + 'px'
				);
			}
		};

		const setupResizeObserver = () => {
			if ( !bodyInner.value ) {
				return;
			}
			resizeObserver = new ResizeObserver( updateBodyHeight );
			resizeObserver.observe( bodyInner.value );
		};

		const teardownResizeObserver = () => {
			if ( resizeObserver ) {
				resizeObserver.disconnect();
				resizeObserver = null;
			}
		};

		onBeforeUnmount( teardownResizeObserver );

		// Provider orchestration (replaces Pinia searchStore)
		const orchDeps = {
			recentItemsProvider,
			relatedArticlesProvider,
			recentItemsService
		};
		const orch = useProviderOrchestration( providers, resultDecorator, orchDeps );

		const tokenInput = useTokenizedInput( getTokenPatterns, orch.activeMode );
		// Late-bind tokens so handleModeQuery can read them at call time
		orchDeps.tokens = tokenInput.tokens;

		const flatItems = computed( () => orch.flatItems.value );

		const emptyStateContent = computed( () => {
			const config = orch.stateConfig.value;
			if ( orch.query.value ) {
				const content = config.noResults( orch.query.value, tokenInput.tokens.value );
				return {
					title: content.title,
					description: content.description,
					icon: content.icon || cdxIconArticleNotFound
				};
			}
			return {
				title: config.emptyState.title,
				description: config.emptyState.description,
				icon: config.emptyState.icon || cdxIconArticlesSearch
			};
		} );

		// List navigation
		const listNav = useListNavigation( orch.flatItems );

		const highlightedItemDetail = computed( () => {
			const index = listNav.highlightedIndex.value;
			const items = orch.flatItems.value;
			if ( index >= 0 && index < items.length ) {
				const detail = items[ index ].detail;
				if ( detail && detail.pairs && detail.pairs.length ) {
					return detail;
				}
			}
			return null;
		} );

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
				const items = orch.flatItems.value;
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
				case 'exitWithQuery':
					if ( orch.activeMode.value ) {
						// From within a mode: exit and add token
						orch.exitMode();
						tokenInput.setFreeText( selectionAction.payload );
					} else {
						// From root: try to enter a matching mode
						const match = findModeByQuery( selectionAction.payload );
						if ( match ) {
							tokenInput.clear();
							orch.enterMode( match.mode );
						}
					}
					nextTick( focusInput );
					break;
				case 'updateQuery':
					tokenInput.setFreeText( selectionAction.payload );
					nextTick( focusInput );
					break;
				case 'addToken':
					tokenInput.addToken( selectionAction.payload );
					tokenInput.setFreeText( '' );
					// Force re-query: adding a token while clearing freeText
					// produces the same fullQuery string, so the watcher won't fire.
					// TODO: A generation counter on useTokenizedInput could replace
					// this workaround by making the watcher always see a new value.
					orch.updateQuery( tokenInput.fullQuery.value );
					nextTick( focusInput );
					break;
				case 'none':
				default:
					break;
			}
		};

		const handleRemoveToken = ( index ) => {
			const token = tokenInput.tokens.value[ index ];
			if ( !token ) {
				return;
			}
			tokenInput.removeToken( index );
			// Prepend the raw text back to freeText (detection is suppressed)
			tokenInput.setFreeText( token.raw + tokenInput.freeText.value );
		};

		// Keyboard handler
		const keyboard = useKeyboard( {
			inputRef: searchHeader,
			itemRefs,
			items: orch.flatItems,
			listNav,
			actionNav,
			onSelect: selectResult,
			onClose: close,
			query: orch.query,
			activeMode: orch.activeMode,
			onClearQuery: () => {
				tokenInput.clear();
				orch.updateQuery( '' );
			},
			onExitMode: () => orch.exitMode(),
			onEnterMode: ( mode ) => orch.enterMode( mode ),
			findModeByTrigger,
			tokens: tokenInput.tokens,
			selectedTokenIndex: tokenInput.selectedIndex,
			onSelectToken: ( index ) => tokenInput.selectToken( index ),
			onRemoveToken: handleRemoveToken
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

		const handleFreeTextUpdate = ( text ) => {
			tokenInput.setFreeText( text );
			// When detection consumed part of the text (creating tokens),
			// the DOM input still holds the old value until Vue flushes.
			// Force-sync it so the next keystroke event carries the correct value.
			if ( tokenInput.freeText.value !== text ) {
				nextTick( () => {
					const el = searchHeader.value?.getInputElement?.();
					if ( el && el.value !== tokenInput.freeText.value ) {
						el.value = tokenInput.freeText.value;
					}
				} );
			}
		};

		// Sync tokenized fullQuery to orchestrator
		// Auto-enter mode when typed query matches a multi-char trigger (e.g. '/smw:')
		watch( tokenInput.fullQuery, ( newQuery ) => {
			if ( !orch.activeMode.value && newQuery ) {
				const match = findModeByQuery( newQuery );
				if ( match ) {
					const subQuery = newQuery.slice( match.trigger.length );
					orch.enterMode( match.mode );
					tokenInput.setFreeText( subQuery );
					nextTick( focusInput );
					return;
				}
			}
			orch.updateQuery( newQuery );
		} );

		// Watch for changes in displayed items to adjust highlighting
		watch( orch.flatItems, ( newItems ) => {
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
			if ( orch.activeMode.value ) {
				orch.exitMode();
			} else {
				orch.clearSearch();
			}
			tokenInput.clear();
			nextTick( focusInput );
		};

		return {
			// State
			isOpen,
			searchHeader,
			bodyContainer,
			bodyInner,
			// Body height animation
			setupResizeObserver,
			teardownResizeObserver,
			updateBodyHeight,
			// Orchestration
			activeMode: orch.activeMode,
			exitMode: orch.exitMode,
			query: orch.query,
			displayedItems: orch.displayedItems,
			flatItems,
			isPending: orch.isPending,
			showPending: orch.showPending,
			// Token state
			tokenInput,
			handleFreeTextUpdate,
			handleRemoveToken,
			// Keyboard
			keyboard,
			// List nav
			highlightedItemIndex: listNav.highlightedIndex,
			// Empty state
			emptyStateContent,
			// Detail panel
			highlightedItemDetail,
			// Methods
			// eslint-disable-next-line vue/no-unused-properties -- Used externally by init.js
			open,
			close,
			selectResult,
			handleAction,
			handleHover,
			setItemRef
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
	.mixin-citizen-frosted-glass;
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
		-webkit-backdrop-filter: var( --backdrop-filter-blur );
		backdrop-filter: var( --backdrop-filter-blur );
	}

	&__body {
		height: var( --citizen-command-palette-body-height );
		overflow: hidden;
		border-top: var( --border-subtle );
		transition-timing-function: var( --transition-timing-function-ease-out );
		transition-duration: var( --transition-duration-medium );
		transition-property: height;

		@media ( min-width: @min-width-breakpoint-tablet ) {
			&--has-detail {
				display: flex;
			}
		}
	}

	&__results {
		max-height: calc( 100vh - 16rem );
		overflow-y: auto;

		.citizen-command-palette__body--has-detail & {
			@media ( min-width: @min-width-breakpoint-tablet ) {
				flex: 3;
				border-inline-end: var( --border-subtle );
			}
		}
	}

	&__detail {
		display: none;

		@media ( min-width: @min-width-breakpoint-tablet ) {
			display: block;
			flex: 2;
			max-height: calc( 100vh - 16rem );
		}
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

// Palette entrance/exit
.citizen-command-palette-enter-active,
.citizen-command-palette-leave-active {
	transition-timing-function: var( --transition-timing-function-ease-out );
	transition-duration: var( --transition-duration-medium );
	transition-property: transform, opacity;
}

.citizen-command-palette-enter-from {
	opacity: 0;
	transform: scale( 1.06 );
	transform-origin: 50% 0;
}

.citizen-command-palette-leave-to {
	opacity: 0;
	transform: scale( 1.04 );
	transform-origin: 50% 0;
}

// Backdrop entrance/exit
.citizen-command-palette-backdrop-enter-active,
.citizen-command-palette-backdrop-leave-active {
	transition-timing-function: var( --transition-timing-function-ease-out );
	transition-duration: var( --transition-duration-medium );
	transition-property: opacity;
}

.citizen-command-palette-backdrop-enter-from,
.citizen-command-palette-backdrop-leave-to {
	opacity: 0;
}
</style>
