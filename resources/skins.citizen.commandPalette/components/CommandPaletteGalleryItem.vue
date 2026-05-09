<template>
	<component
		:is="url ? 'a' : 'button'"
		:id="id"
		ref="rootRef"
		role="option"
		:aria-selected="highlighted"
		:href="url || undefined"
		:type="url ? undefined : 'button'"
		:title="label"
		:data-instantdiffs-link="( url && previewable ) ? 'event' : undefined"
		class="citizen-command-palette-gallery-item"
		:class="rootClasses"
		:data-type="type"
		@mousedown.prevent="onMouseDown"
		@click="onClick"
	>
		<!--
			CommandPaletteImage handles src + lazy-loaded <img>, the
			placeholder fallback, and the broken-image bail. Wraps the
			same square aspect-ratio container the tile previously
			built inline. Mirrors the CdxImage prop API so swapping it
			out (when MW LTS bundles a Codex with CdxImage) is a
			component-rename.
		-->
		<command-palette-image
			class="citizen-command-palette-gallery-item__thumbnail"
			:src="thumbnail ? thumbnail.url : ''"
			:width="thumbnail ? thumbnail.width : null"
			:height="thumbnail ? thumbnail.height : null"
			aspect-ratio="1:1"
			object-fit="cover"
			:placeholder-icon="thumbnailIcon || null"
		></command-palette-image>
	</component>
</template>

<script>
const { defineComponent, computed, ref } = require( 'vue' );
const CommandPaletteImage = require( './CommandPaletteImage.vue' );
const { CommandPaletteItem } = require( '../types.js' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteGalleryItem',
	components: {
		CommandPaletteImage
	},
	props: {
		id: {
			type: String,
			required: true
		},
		active: {
			type: Boolean,
			default: false
		},
		highlighted: {
			type: Boolean,
			default: false
		},
		type: {
			type: String,
			required: true
		},
		label: {
			type: String,
			required: true
		},
		url: {
			type: String,
			default: ''
		},
		value: {
			type: String,
			default: ''
		},
		thumbnail: {
			type: [ Object, null ],
			default: null
		},
		thumbnailIcon: {
			type: [ String, Object ],
			default: ''
		},
		description: {
			type: [ String, null ],
			default: ''
		},
		metadata: {
			type: Array,
			default: () => []
		},
		actions: {
			type: Array,
			default: () => []
		},
		source: {
			type: String,
			default: undefined
		},
		previewable: {
			type: Boolean,
			default: false
		}
	},
	emits: [
		'select',
		'change'
	],
	setup( props, { emit } ) {
		const rootRef = ref( null );

		const onMouseDown = ( e ) => {
			if ( e.button === 0 ) {
				emit( 'change', 'active', true );
			}
		};

		const onClick = ( event ) => {
			const modifierClick = !!( event && (
				event.button > 0 ||
				event.ctrlKey ||
				event.metaKey ||
				event.altKey ||
				event.shiftKey
			) );
			emit( 'select',
				/** @type {CommandPaletteItem} */ ( {
					id: props.id,
					label: props.label,
					url: props.url,
					type: props.type,
					value: props.value,
					thumbnail: props.thumbnail,
					thumbnailIcon: props.thumbnailIcon,
					description: props.description,
					metadata: props.metadata,
					actions: props.actions,
					source: props.source,
					previewable: props.previewable,
					isMouseClick: true,
					modifierClick
				} )
			);
		};

		const rootClasses = computed( () => ( {
			'citizen-command-palette-gallery-item--active': props.active && props.highlighted,
			'citizen-command-palette-gallery-item--highlighted': props.highlighted
		} ) );

		return {
			rootRef,
			onMouseDown,
			onClick,
			rootClasses
		};
	}
} );
</script>

<style lang="less">
@import '../../mixins.less';

.citizen-command-palette-gallery-item {
	display: block;
	padding: 0;
	overflow: hidden;
	color: inherit;
	text-decoration: none;
	cursor: pointer;
	outline: 0;
	background: none;
	border: 0;
	border-radius: var( --border-radius-medium );

	a&,
	button& {
		font: inherit;
		color: inherit;
		text-align: inherit;
	}

	&:hover {
		text-decoration: none;
	}

	// Tile chrome layered on top of CommandPaletteImage's square frame.
	// The image component owns aspect-ratio, background, and the
	// `<img>` / placeholder swap. The gallery item adds the border and
	// the focus-ring overlay so only tiles get them — when the image
	// component is reused in the detail pane, the chrome doesn't follow.
	&__thumbnail {
		border: 1px solid var( --border-color-subtle );
		border-radius: var( --border-radius-medium );

		// Focus/active ring overlay. `box-shadow: inset` on the tile
		// itself paints between the parent's border and its content area
		// — behind the child <img>, which is opaque and covers the
		// shadow. A transparent pseudo-element layered on top is the
		// reliable way to render the ring above image content.
		&::after {
			position: absolute;
			inset: 0;
			pointer-events: none;
			content: '';
			border-radius: inherit;
			box-shadow: inset 0 0 0 2px transparent;
		}
	}

	// Focus ring matches Codex's interactive-focus pattern (inset 2px
	// progressive border) — visible against any thumbnail content
	// without enlarging the tile or pushing siblings around. The ring
	// is drawn on the ::after overlay so it sits above the <img>.
	&--highlighted &__thumbnail {
		border-color: var( --border-color-progressive );

		&::after {
			box-shadow: inset 0 0 0 2px var( --border-color-progressive );
		}
	}

	&--active &__thumbnail {
		border-color: var( --border-color-progressive--active );

		&::after {
			box-shadow: inset 0 0 0 2px var( --border-color-progressive--active );
		}
	}
}
</style>
