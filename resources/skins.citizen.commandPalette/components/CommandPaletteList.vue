<template>
	<div
		ref="listRef"
		class="citizen-command-palette-list"
		role="listbox"
		tabindex="-1"
	>
		<template
			v-for="( section, sectionIndex ) in sections"
			:key="sectionIndex"
		>
			<!-- eslint-disable mediawiki/msg-doc, mediawiki/no-vue-dynamic-i18n -- heading keys are provider-defined -->
			<div
				v-if="section.heading"
				class="citizen-command-palette-list__heading"
			>
				{{ $i18n( section.heading ).text() }}
			</div>
			<!-- eslint-enable mediawiki/msg-doc, mediawiki/no-vue-dynamic-i18n -->
			<command-palette-list-item
				v-for="( item, localIndex ) in section.items"
				:key="item.id"
				v-bind="getListItemBindings( item, getGlobalIndex( sectionIndex, localIndex ) )"
				:ref="( el ) => setItemRef && setItemRef( el, getGlobalIndex( sectionIndex, localIndex ) )"
				@change="( property, value ) => onItemChange( item.id, property, value )"
				@select="( result ) => $emit( 'select', result )"
				@action="( action ) => $emit( 'action', action )"
				@mouseenter="() => $emit( 'hover', getGlobalIndex( sectionIndex, localIndex ) )"
				@mouseleave="() => $emit( 'hover', -1 )"
			></command-palette-list-item>
		</template>
	</div>
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
		sections: {
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
		setItemRef: {
			type: Function,
			required: false,
			default: null
		}
	},
	emits: [ 'select', 'action', 'hover' ],
	setup( props /* , { emit } */ ) {
		const listRef = ref( null );
		const activeItemId = ref( null );

		/**
		 * Computes the global index for an item given its section and local index.
		 *
		 * @param {number} sectionIndex Index of the section.
		 * @param {number} localIndex Index within the section.
		 * @return {number} Global index across all sections.
		 */
		function getGlobalIndex( sectionIndex, localIndex ) {
			let offset = 0;
			for ( let i = 0; i < sectionIndex; i++ ) {
				offset += props.sections[ i ].items.length;
			}
			return offset + localIndex;
		}

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

		function onItemChange( itemId, property, value ) {
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
			getGlobalIndex,
			getListItemBindings,
			onItemChange
		};
	}
} );
</script>

<style lang="less">
@import '../../mixins.less';

.citizen-command-palette-list {
	padding-block: var( --space-xs );

	&__heading {
		padding-block: var( --space-xs ) var( --space-xxs );
		padding-inline: var( --citizen-command-palette-side-padding );
		color: var( --color-subtle );
		.mixin-citizen-font-styles( 'overline' );
	}
}
</style>
