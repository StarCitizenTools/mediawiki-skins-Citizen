<template>
	<div
		id="citizen-command-palette-listbox"
		ref="galleryRef"
		class="citizen-command-palette-gallery"
		role="listbox"
		:aria-label="$i18n( 'citizen-command-palette-results' ).text()"
		tabindex="-1"
	>
		<template
			v-for="( section, sectionIndex ) in sections"
			:key="sectionIndex"
		>
			<!-- eslint-disable mediawiki/msg-doc, mediawiki/no-vue-dynamic-i18n -- heading keys are provider-defined -->
			<div
				v-if="section.heading"
				class="citizen-command-palette-gallery__heading"
				role="presentation"
			>
				{{ $i18n( section.heading ).text() }}
			</div>
			<!-- eslint-enable mediawiki/msg-doc, mediawiki/no-vue-dynamic-i18n -->
			<div
				class="citizen-command-palette-gallery__grid"
				role="presentation"
			>
				<command-palette-gallery-item
					v-for="( item, localIndex ) in section.items"
					:key="item.id"
					v-bind="getItemBindings( item, getGlobalIndex( sectionIndex, localIndex ) )"
					:ref="( el ) => setItemRef && setItemRef( el, getGlobalIndex( sectionIndex, localIndex ) )"
					@change="( property, value ) => onItemChange( item.id, property, value )"
					@select="( result ) => $emit( 'select', result )"
					@mouseenter="() => $emit( 'hover', getGlobalIndex( sectionIndex, localIndex ) )"
				></command-palette-gallery-item>
			</div>
		</template>
	</div>
</template>

<script>
const { defineComponent, ref } = require( 'vue' );
const CommandPaletteGalleryItem = require( './CommandPaletteGalleryItem.vue' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteGallery',
	components: {
		CommandPaletteGalleryItem
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
		setItemRef: {
			type: Function,
			required: false,
			default: null
		}
	},
	emits: [ 'select', 'hover' ],
	setup( props ) {
		const galleryRef = ref( null );
		const activeItemId = ref( null );

		function getGlobalIndex( sectionIndex, localIndex ) {
			let offset = 0;
			for ( let i = 0; i < sectionIndex; i++ ) {
				// Vue runs a row's `ref` callback during teardown against an
				// already-shortened section list, so a preceding section can
				// be gone while this index still refers to it.
				const preceding = props.sections[ i ];
				offset += preceding ? preceding.items.length : 0;
			}
			return offset + localIndex;
		}

		function getItemBindings( galleryItem, index ) {
			return {
				...galleryItem,
				active: galleryItem.id === activeItemId.value,
				highlighted: index === props.highlightedItemIndex,
				id: String( galleryItem.id )
			};
		}

		function onItemChange( itemId, property, value ) {
			if ( property === 'active' ) {
				activeItemId.value = value ? itemId : null;
			}
		}

		return {
			galleryRef,
			getGlobalIndex,
			getItemBindings,
			onItemChange
		};
	}
} );
</script>

<style lang="less">
@import '../../mixins.less';

.citizen-command-palette-gallery {
	padding-block: var( --space-md );
	padding-inline: var( --citizen-command-palette-side-padding );

	&__heading {
		padding-block: var( --space-xs ) var( --space-xxs );
		color: var( --color-subtle );
		.mixin-citizen-font-styles( 'overline' );
	}

	&__grid {
		display: grid;
		grid-template-columns: repeat( auto-fill, minmax( 140px, 1fr ) );
		gap: var( --space-sm );
	}
}
</style>
