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
		<cdx-thumbnail
			:thumbnail="thumbnail"
			:placeholder-icon="thumbnailIcon || undefined"
			class="citizen-command-palette-gallery-item__thumbnail"
		></cdx-thumbnail>
	</component>
</template>

<script>
const { defineComponent, computed, ref } = require( 'vue' );
const { CdxThumbnail } = mw.loader.require( 'skins.citizen.commandPalette.codex' );
const { CommandPaletteItem } = require( '../types.js' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteGalleryItem',
	components: {
		CdxThumbnail
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

	// CdxThumbnail at gallery scale: fill the tile, square aspect ratio,
	// and scale the placeholder icon up from its 1.25rem default so it
	// stays readable inside a ~140px tile. CdxThumbnail defaults to
	// `display: inline-flex`, which leaves a line-box descender below
	// the tile — switching to block removes that gap.
	&__thumbnail.cdx-thumbnail {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 1 / 1;
		border-radius: var( --border-radius-medium );

		.cdx-thumbnail__image,
		.cdx-thumbnail__placeholder {
			width: 100%;
			min-width: 0;
			height: 100%;
			min-height: 0;
			border-color: var( --border-color-subtle );
			border-radius: inherit;
		}

		// __image stretches to cover; __placeholder must keep its
		// flex centering so the icon stays in the middle of the tile.
		.cdx-thumbnail__image {
			display: block;
		}

		.cdx-thumbnail__placeholder__icon {
			width: 3.5rem;
			min-width: 0;
			height: 3.5rem;
			min-height: 0;
			-webkit-mask-size: 3.5rem;
			mask-size: 3.5rem;
		}
	}

	// Focus ring matches Codex's interactive-focus pattern (inset 2px
	// progressive border) — visible against any thumbnail content
	// without enlarging the tile or pushing siblings around.
	&--highlighted &__thumbnail.cdx-thumbnail {
		.cdx-thumbnail__image,
		.cdx-thumbnail__placeholder {
			border-color: var( --border-color-progressive );
			box-shadow: inset 0 0 0 2px var( --border-color-progressive );
		}
	}

	&--active &__thumbnail.cdx-thumbnail {
		.cdx-thumbnail__image,
		.cdx-thumbnail__placeholder {
			border-color: var( --border-color-progressive--active );
			box-shadow: inset 0 0 0 2px var( --border-color-progressive--active );
		}
	}
}
</style>
