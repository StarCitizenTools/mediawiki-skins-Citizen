<template>
	<command-palette-list
		v-if="recentItems.length > 0"
		:heading="$i18n( 'citizen-command-palette-recent' ).text()"
		:items="recentItems"
		:highlighted-item-index="highlightedItemIndex"
		:search-query="searchQuery"
		:set-item-ref="setItemRef"
		@update:highlighted-item-index="$emit( 'update:highlighted-item-index', $event )"
		@select="$emit( 'select', $event )"
		@action="handleAction"
		@navigate-list="( direction ) => $emit( 'navigate-list', direction )"
		@focus-action="( payload ) => $emit( 'focus-action', payload )"
		@blur-actions="() => $emit( 'blur-actions' )"
	></command-palette-list>
	<command-palette-empty-state
		v-else
		:title="$i18n( 'searchsuggest-search' ).text()"
		:description="$i18n( 'citizen-search-empty-desc' ).text()"
		:icon="cdxIconArticlesSearch"
	></command-palette-empty-state>
</template>

<script>
const { defineComponent } = require( 'vue' );
const CommandPaletteList = require( './CommandPaletteList.vue' );
const CommandPaletteEmptyState = require( './CommandPaletteEmptyState.vue' );
const { cdxIconArticlesSearch } = require( '../icons.json' );
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
	emits: [ 'update:highlighted-item-index', 'select', 'update:recent-items', 'navigate-list', 'focus-action', 'blur-actions' ],
	setup( props, { emit } ) {
		const recentItemsService = createRecentItems();

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
			handleAction
		};
	}
} );
</script>
