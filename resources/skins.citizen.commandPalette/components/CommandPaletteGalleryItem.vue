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
		<span class="citizen-command-palette-gallery-item__thumbnail">
			<!--
				Native <img> with `loading="lazy"` and `decoding="async"`
				so the browser schedules thumbnail fetches on its own —
				the gallery can render up to 50 tiles at once.
				CdxImage is the right Codex equivalent but isn't
				available in MW 1.43; switch to it on the next LTS.
			-->
			<img
				v-if="thumbnail"
				:src="thumbnail.url"
				:width="thumbnail.width"
				:height="thumbnail.height"
				loading="lazy"
				decoding="async"
				alt=""
				class="citizen-command-palette-gallery-item__thumbnail-image"
			>
			<span
				v-else
				class="citizen-command-palette-gallery-item__thumbnail-placeholder"
			>
				<cdx-icon
					v-if="thumbnailIcon"
					:icon="thumbnailIcon"
					class="cdx-thumbnail__placeholder__icon--vue"
				></cdx-icon>
			</span>
		</span>
	</component>
</template>

<script>
const { defineComponent, computed, ref } = require( 'vue' );
const { CdxIcon } = mw.loader.require( 'skins.citizen.commandPalette.codex' );
const { CommandPaletteItem } = require( '../types.js' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteGalleryItem',
	components: {
		CdxIcon
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

	// Square 1:1 tile that holds either a lazy-loaded <img> (when the
	// file has a thumbnail) or a centred placeholder icon (audio, archive,
	// 3D, etc.). overflow:hidden keeps the corners rounded against the
	// image's intrinsic edges. position:relative is the containing block
	// for the ::after focus-ring overlay.
	&__thumbnail {
		position: relative;
		display: block;
		width: 100%;
		aspect-ratio: 1 / 1;
		overflow: hidden;
		background-color: var( --background-color-neutral-subtle );
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

	&__thumbnail-image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	&__thumbnail-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		color: var( --color-subtle );

		// Codex's CdxIcon defaults to a `cdx-icon--medium` (1.25rem) size
		// modifier — too small for a 140px tile. Override the modifier
		// dimensions; the SVG inside fills 100% / 100% via Codex's own
		// rule, so it scales up cleanly.
		.cdx-icon--medium {
			width: @size-200;
			min-width: 0;
			height: @size-200;
			min-height: 0;
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
