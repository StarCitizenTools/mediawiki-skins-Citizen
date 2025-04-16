<template>
	<command-palette-list
		v-if="recentItems.pages.items.length > 0"
		:heading="$i18n( 'citizen-command-palette-recent' ).text()"
		:items="recentItems.pages.items"
		:highlighted-item-index="highlightedItemIndex"
		:show-thumbnail="recentItems.pages.showThumbnail"
		:search-query="searchQuery"
		@update:highlighted-item-index="$emit( 'update:highlighted-item-index', $event )"
		@select="$emit( 'select', $event )"
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

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPalettePresults',
	components: {
		CommandPaletteList,
		CommandPaletteEmptyState
	},
	props: {
		recentItems: {
			type: Object,
			required: true
		},
		highlightedItemIndex: {
			type: Number,
			required: true
		},
		searchQuery: {
			type: String,
			required: true
		}
	},
	emits: [ 'update:highlighted-item-index', 'select' ],
	setup() {
		return {
			cdxIconArticlesSearch
		};
	}
} );
</script>
