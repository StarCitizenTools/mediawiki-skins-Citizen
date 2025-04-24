<template>
	<command-palette-list
		v-if="itemsWithActions.length > 0"
		:heading="$i18n( 'citizen-command-palette-recent' ).text()"
		:items="itemsWithActions"
		:highlighted-item-index="highlightedItemIndex"
		:search-query="searchQuery"
		:set-item-ref="setItemRef"
		@update:highlighted-item-index="$emit( 'update:highlighted-item-index', $event )"
		@select="$emit( 'select', $event )"
		@action="handleAction"
		@focus-input="$emit( 'focus-input' )"
		@navigate-list="( direction ) => $emit( 'navigate-list', direction )"
	></command-palette-list>
	<command-palette-empty-state
		v-else
		:title="$i18n( 'searchsuggest-search' ).text()"
		:description="$i18n( 'citizen-search-empty-desc' ).text()"
		:icon="cdxIconArticlesSearch"
	></command-palette-empty-state>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );
const CommandPaletteList = require( './CommandPaletteList.vue' );
const CommandPaletteEmptyState = require( './CommandPaletteEmptyState.vue' );
const { cdxIconArticlesSearch, cdxIconTrash } = require( '../icons.json' );
const createRecentItems = require( '../services/recentItems.js' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPalettePresults',
	components: {
		CommandPaletteList,
		CommandPaletteEmptyState
	},
	props: {
		recentItems: {
			type: Array,
			required: true
		},
		highlightedItemIndex: {
			type: Number,
			required: true
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
	emits: [ 'update:highlighted-item-index', 'select', 'update:recent-items', 'focus-input', 'navigate-list' ],
	setup( props, { emit } ) {
		const recentItemsService = createRecentItems();

		// Add dismiss action to recent items
		const itemsWithActions = computed( () => props.recentItems.map( ( item ) => ( {
			...item,
			actions: [
				{
					id: 'dismiss',
					label: mw.msg( 'citizen-command-palette-dismiss' ),
					icon: cdxIconTrash
				}
			]
		} ) ) );

		const handleAction = ( action ) => {
			if ( action.actionId === 'dismiss' ) {
				const itemToRemove = props.recentItems.find( ( item ) => String( item.id ) === action.itemId );
				if ( itemToRemove ) {
					recentItemsService.removeRecentItem( itemToRemove );
					emit( 'update:recent-items' );
				}
			}
		};

		return {
			cdxIconArticlesSearch,
			handleAction,
			itemsWithActions
		};
	}
} );
</script>
