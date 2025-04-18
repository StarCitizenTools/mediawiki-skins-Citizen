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
				v-bind="getListItemBindings( item )"
				@change="( property, value ) => onItemChange( item.id, property, value, index )"
				@select="( result ) => $emit( 'select', result )"
				@action="( action ) => $emit( 'action', action )"
			></command-palette-list-item>
		</ul>
	</section>
</template>

<script>
const { defineComponent, ref, watch } = require( 'vue' );
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
			default: 0
		},
		searchQuery: {
			type: String,
			default: ''
		},
		heading: {
			type: String,
			default: ''
		}
	},
	emits: [ 'update:highlightedItemIndex', 'select', 'action' ],
	setup( props, { emit } ) {
		const listRef = ref( null );
		const highlightedItemId = ref( null );
		const activeItemId = ref( null );

		// Watch for changes in highlightedItemIndex and update highlightedItemId accordingly
		watch( () => props.highlightedItemIndex, ( newIndex ) => {
			if ( props.items[ newIndex ] ) {
				highlightedItemId.value = props.items[ newIndex ].id;
			}
		} );

		function getListItemBindings( listItem ) {
			return {
				active: listItem.id === activeItemId.value,
				highlighted: listItem.id === highlightedItemId.value,
				searchQuery: props.searchQuery,
				...listItem
			};
		}

		function onItemChange( itemId, property, value, index ) {
			if ( property === 'highlighted' ) {
				highlightedItemId.value = value ? itemId : null;
				if ( value ) {
					emit( 'update:highlightedItemIndex', index );
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
