<template>
	<Transition name="citizen-command-palette-backdrop">
		<div
			v-if="isOpen"
			class="citizen-command-palette-backdrop"
			@click="close"></div>
	</Transition>
	<Transition
		name="citizen-command-palette"
		@after-enter="setupResizeObserver"
		@after-leave="teardownResizeObserver"
	>
		<div
			v-if="isOpen"
			ref="paletteRoot"
			class="citizen-command-palette"
			:data-palette-layout="paletteLayout"
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
				:active-mode-context="activeModeContext"
				:help-visible="helpVisible"
				@exit-mode="exitMode"
				@close-help="orchCloseHelp"
				@update:free-text="handleFreeTextUpdate( $event )"
				@select-token="tokenInput.selectToken( $event )"
				@remove-token="handleRemoveToken( $event )"
			></command-palette-header>
			<div
				ref="bodyContainer"
				class="citizen-command-palette__body"
			>
				<div
					ref="bodyViewport"
					class="citizen-command-palette__body-viewport"
					:class="{
						'citizen-command-palette__body-viewport--has-detail': viewportHasDetail,
						'citizen-command-palette__body-viewport--uniform-type': uniformItemType
					}"
				>
					<command-palette-help-view
						v-if="helpVisible"
						:active-mode="activeMode"
						:highlighted-help-mode="highlightedHelpMode"
						:displayed-items="displayedItems"
						:highlighted-item-index="highlightedItemIndex"
						:search-query="query"
						:set-item-ref="setItemRef"
						@select="selectResult"
						@hover="handleHover"
					></command-palette-help-view>
					<template v-else>
						<div class="citizen-command-palette__results">
							<command-palette-empty-state
								v-if="!isPending && flatItems.length === 0"
								:title="emptyStateContent.title"
								:description="emptyStateContent.description"
								:icon="emptyStateContent.icon"
							></command-palette-empty-state>
							<command-palette-gallery
								v-else-if="isGalleryLayout && displayedItems.length > 0"
								ref="galleryRef"
								:sections="displayedItems"
								:highlighted-item-index="highlightedItemIndex"
								:set-item-ref="setItemRef"
								@select="selectResult"
								@hover="handleHover"
							></command-palette-gallery>
							<command-palette-list
								v-else-if="displayedItems.length > 0"
								:sections="displayedItems"
								:highlighted-item-index="highlightedItemIndex"
								:search-query="query"
								:set-item-ref="setItemRef"
								:compact="!!activeMode?.compactResults"
								@select="selectResult"
								@action="handleAction"
								@hover="handleHover"
							></command-palette-list>
						</div>
						<Transition name="citizen-command-palette-detail">
							<command-palette-detail-panel
								v-if="highlightedItemDetail"
								class="citizen-command-palette__detail"
								:detail="highlightedItemDetail"
								:copy-trigger="copyTrigger"
							></command-palette-detail-panel>
						</Transition>
					</template>
				</div>
			</div>
			<command-palette-footer
				:hints="keyboard.keyboardHints.value"
			></command-palette-footer>
		</div>
	</Transition>
</template>

<script>
const { defineComponent, ref, nextTick, computed, watch, inject } = require( 'vue' );
const useActionNavigation = require( '../composables/useActionNavigation.js' );
const useBodyHeightAnimation = require( '../composables/useBodyHeightAnimation.js' );
const useGalleryColumnCount = require( '../composables/useGalleryColumnCount.js' );
const useListNavigation = require( '../composables/useListNavigation.js' );
const useGridNavigation = require( '../composables/useGridNavigation.js' );
const useKeyboard = require( '../composables/useKeyboard.js' );
const useProviderOrchestration = require( '../composables/useProviderOrchestration.js' );
const useResultRouter = require( '../composables/useResultRouter.js' );
const useTokenizedInput = require( '../composables/useTokenizedInput.js' );
const CommandPaletteList = require( './CommandPaletteList.vue' );
const CommandPaletteGallery = require( './CommandPaletteGallery.vue' );
const CommandPaletteEmptyState = require( './CommandPaletteEmptyState.vue' );
const CommandPaletteFooter = require( './CommandPaletteFooter.vue' );
const CommandPaletteHeader = require( './CommandPaletteHeader.vue' );
const CommandPaletteDetailPanel = require( './CommandPaletteDetailPanel.vue' );
const CommandPaletteHelpView = require( './CommandPaletteHelpView.vue' );
const { cdxIconArticleNotFound, cdxIconArticlesSearch } = require( '../icons.json' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'App',
	compilerOptions: {
		whitespace: 'condense'
	},
	components: {
		CommandPaletteList,
		CommandPaletteGallery,
		CommandPaletteEmptyState,
		CommandPaletteDetailPanel,
		CommandPaletteFooter,
		CommandPaletteHeader,
		CommandPaletteHelpView
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
		const getHelpCatalogItems = inject( 'getHelpCatalogItems', null );
		const getHandler = inject( 'getHandler', null );
		// Duck-typed { isAvailable, processContext, triggerForAnchor, onReady }
		// service — today the InstantDiffs gadget bridge, swappable via init.js.
		const previewService = inject( 'previewService' );
		// Provided by commandPalette.js so the trigger orchestrator can hide
		// its overlay wrapper after the palette closes from inside (Esc, backdrop).
		const paletteExternalClose = inject( 'paletteExternalClose', null );

		// Core refs
		const isOpen = ref( false );
		const paletteRoot = ref( null );
		const searchHeader = ref( null );
		const itemRefs = ref( new Map() );
		const bodyContainer = ref( null );
		const bodyViewport = ref( null );
		const galleryRef = ref( null );

		const { setupResizeObserver, teardownResizeObserver } = useBodyHeightAnimation( {
			bodyContainer,
			bodyViewport
		} );

		const galleryColumnCount = useGalleryColumnCount( { galleryRef } );

		// Provider orchestration (replaces Pinia searchStore)
		const orchDeps = {
			recentItemsProvider,
			relatedArticlesProvider,
			recentItemsService,
			getHelpCatalogItems
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

		// List + grid navigation share a single highlightedIndex ref so the
		// active selection is preserved across layout swaps (e.g. entering a
		// gallery mode from a list mode and back).
		const sharedHighlightedIndex = ref( -1 );
		const listNav = useListNavigation( orch.flatItems, {
			highlightedIndex: sharedHighlightedIndex
		} );
		const gridNav = useGridNavigation( orch.flatItems, galleryColumnCount, {
			highlightedIndex: sharedHighlightedIndex
		} );

		const isGalleryLayout = computed(
			() => Boolean( orch.activeMode.value && orch.activeMode.value.layout === 'gallery' )
		);

		// String form for the [data-palette-layout] attribute, which CSS
		// targets to widen the modal in gallery layouts.
		const paletteLayout = computed( () => isGalleryLayout.value ? 'gallery' : 'list' );

		const highlightedItem = computed( () => {
			const index = listNav.highlightedIndex.value;
			const items = orch.flatItems.value;
			return index >= 0 && index < items.length ? items[ index ] : null;
		} );

		const highlightedItemDetail = computed( () => {
			const item = highlightedItem.value;
			if ( !item ) {
				return null;
			}
			const detail = item.detail;
			if ( detail && (
				( detail.pairs && detail.pairs.length ) ||
				detail.header ||
				detail.media
			) ) {
				return detail;
			}
			return null;
		} );

		// Modes that opt in via `getItemDetail` (file mode, currently)
		// fetch per-item detail lazily when an item is focused. The
		// orchestration handles debounce, abort, and reactive mutation
		// — App.vue just needs to call `requestItemDetail` whenever the
		// highlighted item changes. `immediate: true` covers the case
		// where the first item is auto-highlighted on initial render.
		watch( highlightedItem, ( item ) => {
			if ( item ) {
				orch.requestItemDetail( item );
			}
		}, { immediate: true } );

		// While help is open at root, the highlighted catalog row's source
		// (e.g. "command:category") tells us which registered handler to
		// surface in the right pane. Outside the help-at-root case there is
		// no help-detail to render.
		const highlightedHelpMode = computed( () => {
			if ( !orch.helpVisible.value || orch.activeMode.value || !getHandler ) {
				return null;
			}
			const idx = listNav.highlightedIndex.value;
			const items = orch.flatItems.value;
			if ( idx < 0 || idx >= items.length ) {
				return null;
			}
			const item = items[ idx ];
			if ( !item || !item.source ) {
				return null;
			}
			const match = ( /^command:(.+)$/ ).exec( item.source );
			if ( !match ) {
				return null;
			}
			return getHandler( match[ 1 ] ) || null;
		} );

		// Two-pane layout activates when:
		//   - a regular result has structured detail data (existing behaviour), OR
		//   - help is open at root with a highlighted mode to describe.
		const viewportHasDetail = computed( () => {
			if ( orch.helpVisible.value ) {
				return !orch.activeMode.value && highlightedHelpMode.value !== null;
			}
			return highlightedItemDetail.value !== null;
		} );

		// When every visible item shares the same type, the per-row type
		// badge is redundant. We surface this as a class on the viewport so
		// CSS can hide the badge — the underlying item data (including its
		// `type` field, which the click path reads via props) stays intact.
		// Mixed-type listings (default search, drilled category mode,
		// recents+related) keep the badge to disambiguate.
		const uniformItemType = computed( () => {
			const items = orch.flatItems.value;
			if ( items.length === 0 ) {
				return false;
			}
			const firstType = items[ 0 ] && items[ 0 ].type;
			if ( !firstType ) {
				return false;
			}
			return items.every( ( it ) => it.type === firstType );
		} );

		const actionNav = useActionNavigation( {
			items: orch.flatItems,
			highlightedIndex: listNav.highlightedIndex,
			itemRefs
		} );

		const close = () => {
			if ( !isOpen.value ) {
				return;
			}
			isOpen.value = false;
			if ( typeof paletteExternalClose === 'function' ) {
				paletteExternalClose();
			}
		};

		const focusInput = () => {
			searchHeader.value?.focus();
		};

		const { selectResult, handleAction } = useResultRouter( {
			orchestrator: orch,
			tokenInput,
			navigation: { findModeByQuery },
			control: { focusInput, close, paletteRoot },
			preview: previewService
		} );

		const handleRemoveToken = ( index ) => {
			const token = tokenInput.tokens.value[ index ];
			if ( !token ) {
				return;
			}
			tokenInput.removeToken( index );
			// Prepend the raw text back to freeText (detection is suppressed)
			tokenInput.setFreeText( token.raw + tokenInput.freeText.value );
		};

		// Bumped by the keyboard's Cmd/Ctrl+C handler so the detail panel
		// can run the same copy + feedback path the click handler uses.
		// Counter rather than a boolean flag because two copies in a row
		// must each fire — booleans wouldn't trigger the watcher again.
		const copyTrigger = ref( 0 );
		function requestHeaderCopy() {
			copyTrigger.value++;
		}

		// Keyboard handler. Options group into named buckets so each
		// dependency's role is self-documenting at the call site.
		const keyboard = useKeyboard( {
			core: {
				inputRef: searchHeader,
				itemRefs,
				items: orch.flatItems,
				query: orch.query,
				requestHeaderCopy,
				onSelect: selectResult,
				onClose: close,
				onClearQuery: () => {
					tokenInput.clear();
					orch.updateQuery( '' );
				}
			},
			navigation: {
				listNav,
				gridNav,
				isGalleryLayout,
				actionNav
			},
			mode: {
				activeMode: orch.activeMode,
				activeModeContext: orch.activeModeContext,
				findModeByTrigger,
				onEnterMode: ( m ) => orch.enterMode( m ),
				onExitMode: () => orch.exitMode(),
				onPopModeContext: () => orch.popModeContext()
			},
			tokens: {
				tokens: tokenInput.tokens,
				selectedTokenIndex: tokenInput.selectedIndex,
				onSelectToken: ( index ) => tokenInput.selectToken( index ),
				onRemoveToken: handleRemoveToken
			},
			help: {
				helpVisible: orch.helpVisible,
				onToggleHelp: () => orch.toggleHelp(),
				onCloseHelp: () => orch.closeHelp()
			}
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

			// Notify the preview handler (if any) so it can scan the
			// freshly-rendered list for previewable anchors and attach
			// its click listeners. The watcher's `flush: 'post'` already
			// runs us after DOM updates from the items mutation.
			if ( paletteRoot.value ) {
				previewService.processContext( paletteRoot.value );
			}
		}, { flush: 'post' } );

		// Late-load handler: if the preview handler initializes after the
		// palette is already open, re-process whatever is currently
		// rendered so the existing anchors get wired up.
		previewService.onReady( () => {
			if ( paletteRoot.value ) {
				previewService.processContext( paletteRoot.value );
			}
		} );

		// This function is called externally from commandPalette.js
		const open = ( prefillText ) => {
			isOpen.value = true;
			orch.closeHelp();
			if ( orch.activeMode.value ) {
				orch.exitMode();
			} else {
				orch.clearSearch();
			}
			tokenInput.clear();
			if ( typeof prefillText === 'string' && prefillText.length > 0 ) {
				tokenInput.setFreeText( prefillText );
			}
			nextTick( focusInput );
		};

		return {
			// State
			isOpen,
			paletteRoot,
			searchHeader,
			bodyContainer,
			bodyViewport,
			galleryRef,
			isGalleryLayout,
			paletteLayout,
			// Body height animation
			setupResizeObserver,
			teardownResizeObserver,
			// Orchestration
			activeMode: orch.activeMode,
			activeModeContext: orch.activeModeContext,
			exitMode: orch.exitMode,
			query: orch.query,
			displayedItems: orch.displayedItems,
			flatItems,
			isPending: orch.isPending,
			showPending: orch.showPending,
			helpVisible: orch.helpVisible,
			orchCloseHelp: orch.closeHelp,
			// Token state
			tokenInput,
			handleFreeTextUpdate,
			handleRemoveToken,
			// Keyboard
			keyboard,
			highlightedHelpMode,
			viewportHasDetail,
			uniformItemType,
			// List nav
			highlightedItemIndex: listNav.highlightedIndex,
			// Empty state
			emptyStateContent,
			// Detail panel
			highlightedItemDetail,
			copyTrigger,
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
	display: flex;
	flex-direction: column;
	max-width: @size-5600;
	max-height: calc( 100vh - var( --space-xs ) * 2 );
	margin-inline: auto;
	overflow: hidden;
	border: var( --border-base );
	border-radius: var( --border-radius-medium );
	box-shadow: var( --box-shadow-drop-xx-large );
	// Steady-state width transition — when a mode flips the palette
	// into gallery layout (or back), the modal eases between widths
	// so the grid doesn't snap. The mount/unmount entrance and exit
	// transitions override transition-property to transform+opacity,
	// so this only fires on user-driven layout swaps.
	transition-timing-function: var( --transition-timing-function-ease-out );
	transition-duration: var( --transition-duration-medium );
	transition-property: max-width;

	// Modes that declare layout='gallery' (e.g. the file mode) get a wider
	// frame so the tile grid can fit ~6 columns at the desktop breakpoint.
	// In gallery layout the left pane (the tile grid) carries the visual
	// weight, so it gets 60% of the row to the detail panel's 40% — flipped
	// from the list default where rows are compact and the detail pane
	// holds the rich content.
	&[ data-palette-layout='gallery' ] {
		max-width: 60rem;

		.citizen-command-palette__body-viewport--has-detail {
			@media ( min-width: @min-width-breakpoint-tablet ) {
				.citizen-command-palette__results {
					flex: 3;
				}

				.citizen-command-palette__detail {
					flex: 2;
				}
			}
		}
	}
	.mixin-citizen-frosted-glass;
	.mixin-citizen-font-styles( 'small' );

	@media ( min-width: @max-width-breakpoint-tablet ) {
		top: 3rem;
		max-height: calc( 100vh - 3rem * 2 );
	}

	&-backdrop {
		position: fixed;
		inset: 0;
		background-color: var( --background-color-backdrop-light );
		-webkit-backdrop-filter: var( --backdrop-filter-blur );
		backdrop-filter: var( --backdrop-filter-blur );
	}

	&__body {
		min-height: 0;
		overflow: hidden;
		border-top: var( --border-subtle );
		transition-timing-function: var( --transition-timing-function-ease-out );
		transition-duration: var( --transition-duration-medium );
		transition-property: height;
	}

	// Viewport: normal block-flow child of the animated body.
	// Must NOT have explicit height — its clientHeight must be
	// determined solely by its children so the ResizeObserver
	// reads a stable value independent of the body's animated height.
	&__body-viewport {
		@media ( min-width: @min-width-breakpoint-tablet ) {
			&--has-detail {
				display: flex;
			}
		}

		// Uniform-type lists (e.g. the help catalog, /user: results) would
		// repeat the same type label on every row, so hide it.
		&--uniform-type .citizen-command-palette-list-item__metadata__item--type {
			display: none;
		}
	}

	&__results {
		// Self-constraining max-height so the viewport wrapper has a
		// stable clientHeight for the ResizeObserver to read
		max-height: calc( 100vh - 12rem );
		overflow-y: auto;
		overscroll-behavior: contain;

		.citizen-command-palette__body-viewport--has-detail & {
			@media ( min-width: @min-width-breakpoint-tablet ) {
				flex: 2;
				border-inline-end: var( --border-subtle );

				// In two-pane mode the right pane carries the rich content,
				// so the catalog rows on the left stay compact — drop the
				// alias/type badges and inline description that would
				// otherwise crowd the row.
				.citizen-command-palette-list-item__metadata,
				.citizen-command-palette-list-item__text__description,
				.citizen-command-palette-list-item__text-inline__description {
					display: none;
				}
			}
		}
	}

	&__detail {
		display: none;

		@media ( min-width: @min-width-breakpoint-tablet ) {
			display: block;
			flex: 3;
			max-height: calc( 100vh - 12rem );
			overflow-y: auto;
			overscroll-behavior: contain;
		}
	}

	&__no-results {
		padding: var( --space-md ) var( --citizen-command-palette-side-padding );
		text-align: center;
	}
}

// Palette entrance/exit — clip-path expand from top + translate, matching the
// menu animation pattern. Asymmetric timing: decelerate enter, accelerate exit.
.citizen-command-palette-enter-active {
	transition-timing-function: var( --transition-timing-function-ease-out );
	transition-duration: var( --transition-duration-medium );
	transition-property: clip-path, transform, opacity;
}

.citizen-command-palette-leave-active {
	transition-timing-function: var( --transition-timing-function-ease-in );
	transition-duration: var( --transition-duration-base );
	transition-property: clip-path, transform, opacity;
}

.citizen-command-palette-enter-from,
.citizen-command-palette-leave-to {
	opacity: 0;
	clip-path: inset( 0 0 100% 0 );
	transform: translateY( calc( var( --space-xs ) * -1 ) );
}

// Explicit open-state endpoints so clip-path has two inset() values to
// interpolate between. Without this, clip-path animates discretely between
// inset() and the default (none) and the reveal jumps.
.citizen-command-palette-enter-to,
.citizen-command-palette-leave-from {
	opacity: 1;
	clip-path: inset( 0 0 0 0 );
	transform: translateY( 0 );
}

// Backdrop entrance/exit — sync timing with the palette
.citizen-command-palette-backdrop-enter-active {
	transition-timing-function: var( --transition-timing-function-ease-out );
	transition-duration: var( --transition-duration-medium );
	transition-property: opacity;
}

.citizen-command-palette-backdrop-leave-active {
	transition-timing-function: var( --transition-timing-function-ease-in );
	transition-duration: var( --transition-duration-base );
	transition-property: opacity;
}

.citizen-command-palette-backdrop-enter-from,
.citizen-command-palette-backdrop-leave-to {
	opacity: 0;
}

// Detail panel slide-in
.citizen-command-palette-detail-enter-active,
.citizen-command-palette-detail-leave-active {
	transition-timing-function: var( --transition-timing-function-ease-out );
	transition-duration: var( --transition-duration-medium );
	transition-property: flex, opacity;
}

.citizen-command-palette-detail-enter-from,
.citizen-command-palette-detail-leave-to {
	flex: 0;
	opacity: 0;
}
</style>
