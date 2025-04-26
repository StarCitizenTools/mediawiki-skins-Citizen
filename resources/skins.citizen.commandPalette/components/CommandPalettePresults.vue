<template>
	<!-- Related Articles List -->
	<command-palette-list
		v-if="computedRelatedItems.length > 0"
		:heading="$i18n( 'citizen-command-palette-heading-related' ).text()"
		:items="computedRelatedItems"
		:highlighted-item-index="relatedHighlightIndex"
		:search-query="searchQuery"
		:set-item-ref="setRelatedItemRef"
		@select="$emit( 'select', $event )"
		@navigate-list="( direction ) => $emit( 'navigate-list', direction )"
		@focus-action="( payload ) => $emit( 'focus-action', payload )"
		@blur-actions="() => $emit( 'blur-actions' )"
		@hover="( localIndex ) => handleListHover( 'related', localIndex )"
		@action="$emit( 'action', $event )"
	></command-palette-list>

	<!-- Recent Items List -->
	<command-palette-list
		v-if="computedRecentItems.length > 0"
		:heading="$i18n( 'citizen-command-palette-heading-recent' ).text()"
		:items="computedRecentItems"
		:highlighted-item-index="recentHighlightIndex"
		:search-query="searchQuery"
		:set-item-ref="setRecentItemRef"
		@select="$emit( 'select', $event )"
		@action="$emit( 'action', $event )"
		@navigate-list="( direction ) => $emit( 'navigate-list', direction )"
		@focus-action="( payload ) => $emit( 'focus-action', payload )"
		@blur-actions="() => $emit( 'blur-actions' )"
		@hover="( localIndex ) => handleListHover( 'recent', localIndex )"
	></command-palette-list>

	<!-- Empty State if no related or recent items -->
	<command-palette-empty-state
		v-if="computedRelatedItems.length === 0 && computedRecentItems.length === 0"
		:title="$i18n( 'searchsuggest-search' ).text()"
		:description="$i18n( 'citizen-search-empty-desc' ).text()"
		:icon="cdxIconArticlesSearch"
	></command-palette-empty-state>
</template>

<script>
const { defineComponent } = require( 'vue' );
const { computed } = require( 'vue' );
const CommandPaletteList = require( './CommandPaletteList.vue' );
const CommandPaletteEmptyState = require( './CommandPaletteEmptyState.vue' );
const { cdxIconArticlesSearch } = require( '../icons.json' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPalettePresults',
	components: {
		CommandPaletteList,
		CommandPaletteEmptyState
	},
	props: {
		// Removed relatedArticles and recentItems props
		items: {
			type: Array,
			required: true
		},
		highlightedItemIndex: {
			type: Number,
			default: -1
		},
		searchQuery: {
			type: String,
			required: true
		},
		setItemRef: {
			type: Function,
			default: null
		}
	},
	emits: [ 'select', 'action', 'navigate-list', 'focus-action', 'blur-actions', 'hover' ],
	setup( props, { emit } ) {
		// Computed properties to filter items by source
		const computedRelatedItems = computed( () => props.items.filter( ( item ) => item.source === 'related' ) );
		const computedRecentItems = computed( () => props.items.filter( ( item ) => item.source === 'recent' ) );

		const relatedCount = computed( () => computedRelatedItems.value.length );

		// Calculate local highlight index for the related articles list
		const relatedHighlightIndex = computed( () => {
			const globalIndex = props.highlightedItemIndex;
			// Check if the global index falls within the range of related items
			return ( globalIndex >= 0 && globalIndex < relatedCount.value ) ? globalIndex : -1;
		} );

		// Calculate local highlight index for the recent items list
		const recentHighlightIndex = computed( () => {
			const globalIndex = props.highlightedItemIndex;
			// Check if the global index falls within the range of recent items (after related items)
			return ( globalIndex >= relatedCount.value && globalIndex < props.items.length ) ?
				globalIndex - relatedCount.value :
				-1;
		} );

		// Wrapper for setItemRef to pass the correct global index
		// Finds the original item in props.items to get its global index
		const findGlobalIndex = ( item ) => {
			// Use item.id as the unique identifier, ensuring comparison handles types (e.g., string vs number)
			if ( !item || item.id === undefined || item.id === null ) {
				return -1;
			}
			const itemIdStr = String( item.id );
			return props.items.findIndex( ( originalItem ) => String( originalItem.id ) === itemIdStr );
		};

		const setRelatedItemRef = ( el, localIndex ) => {
			if ( props.setItemRef ) {
				const item = computedRelatedItems.value[ localIndex ];
				const globalIndex = findGlobalIndex( item );
				if ( globalIndex !== -1 ) {
					props.setItemRef( el, globalIndex );
				}
			}
		};

		const setRecentItemRef = ( el, localIndex ) => {
			if ( props.setItemRef ) {
				const item = computedRecentItems.value[ localIndex ];
				const globalIndex = findGlobalIndex( item );
				if ( globalIndex !== -1 ) {
					props.setItemRef( el, globalIndex );
				}
			}
		};

		const handleListHover = ( listType, localIndex ) => {
			let globalIndex = -1;
			if ( localIndex !== -1 ) { // Only calculate if it's not a mouseleave (-1)
				let item;
				if ( listType === 'related' ) {
					item = computedRelatedItems.value[ localIndex ];
				} else if ( listType === 'recent' ) {
					item = computedRecentItems.value[ localIndex ];
				}
				globalIndex = findGlobalIndex( item );
			}
			emit( 'hover', globalIndex );
		};

		return {
			cdxIconArticlesSearch,
			computedRelatedItems,
			computedRecentItems,
			relatedHighlightIndex,
			recentHighlightIndex,
			setRelatedItemRef,
			setRecentItemRef,
			handleListHover
		};
	}
} );
</script>
