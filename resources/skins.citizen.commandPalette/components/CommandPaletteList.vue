<!-- eslint-disable max-len -->
<template>
	<section class="citizen-command-palette-list">
		<div
			v-if="heading"
			class="citizen-command-palette-list__heading"
		>
			{{ heading }}
		</div>
		<ul
			ref="listRef"
			class="citizen-command-palette-list__listbox"
			role="listbox"
			tabindex="-1"
		>
			<command-palette-list-item
				v-for="( item, index ) in items"
				:key="item.id"
				v-bind="getListItemBindings( item, index )"
				:ref="( el ) => setItemRef && setItemRef( el, index )"
				@change="( property, value ) => onItemChange( item.id, property, value, index )"
				@select="( result ) => $emit( 'select', result )"
				@action="( action ) => $emit( 'action', action )"
				@navigate-list="( direction ) => $emit( 'navigate-list', direction )"
				@focus-action="( payload ) => $emit( 'focus-action', payload )"
				@blur-actions="() => $emit( 'blur-actions' )"
				@mouseenter="() => $emit( 'hover', index )"
				@mouseleave="() => $emit( 'hover', -1 )"
			></command-palette-list-item>
		</ul>
	</section>
</template>

<script>
const { defineComponent, ref } = require( 'vue' );
const CommandPaletteListItem = require( './CommandPaletteListItem.vue' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteList',
	components: {
		CommandPaletteListItem
	},
	props: {
		items: {
			type: Array,
			required: true
		},
		highlightedItemIndex: {
			type: Number,
			required: true
		},
		searchQuery: {
			type: String,
			default: ''
		},
		heading: {
			type: String,
			default: ''
		},
		setItemRef: {
			type: Function,
			required: false,
			default: null
		}
	},
	emits: [ /* 'update:highlightedItemIndex', */ 'select', 'action', 'navigate-list', 'focus-action', 'blur-actions', 'hover' ],
	setup( props /* , { emit } */ ) {
		const listRef = ref( null );
		const activeItemId = ref( null );

		function getListItemBindings( listItem, index ) {
			// Determine the query to use for highlighting
			// Use the specific highlightTerm if provided by the provider (for sub-queries),
			// otherwise fall back to the main search query.
			const highlightQuery = listItem.highlightTerm ?? props.searchQuery;

			return {
				...listItem,
				active: listItem.id === activeItemId.value,
				highlighted: index === props.highlightedItemIndex,
				searchQuery: highlightQuery.trim(),
				id: String( listItem.id )
			};
		}

		function onItemChange( itemId, property, value /* , index */ ) {
			if ( property === 'highlighted' ) {
				if ( value ) {
					// No longer emitting index update, parent manages it
				}
			} else if ( property === 'active' ) {
				activeItemId.value = value ? itemId : null;
			}
		}

		return {
			listRef,
			getListItemBindings,
			onItemChange
		};
	}
} );
</script>

<style lang="less">
.citizen-command-palette-list {
	padding-block: var( --space-xs );

	&__heading {
		padding-block: var( --space-xs ) var( --space-xxs );
		padding-inline: var( --citizen-command-palette-side-padding );
		font-size: var( --font-size-x-small );
		font-weight: var( --font-weight-medium );
		color: var( --color-subtle );
	}

	&__listbox {
		padding: 0;
		margin: 0;
		list-style: none;
	}
}
</style>
