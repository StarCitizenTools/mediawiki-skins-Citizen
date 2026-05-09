<template>
	<div
		class="citizen-command-palette-image"
		:class="rootClasses"
	>
		<img
			v-if="src && !isBroken"
			:src="src"
			:width="width || undefined"
			:height="height || undefined"
			:loading="loadingPriority"
			:alt="alt"
			decoding="async"
			class="citizen-command-palette-image__image"
			:class="imageClasses"
			@error="onError"
		>
		<span
			v-else
			class="citizen-command-palette-image__placeholder"
		>
			<cdx-icon
				v-if="placeholderIcon"
				:icon="placeholderIcon"
				class="citizen-command-palette-image__placeholder-icon"
			></cdx-icon>
		</span>
	</div>
</template>

<script>
const { defineComponent, computed, ref, watch } = require( 'vue' );
const { CdxIcon } = mw.loader.require( 'skins.citizen.commandPalette.codex' );

// Mirrors the validators in @wikimedia/codex's CdxImage so this component
// can be swapped for CdxImage with a search-and-replace once MW LTS bundles
// a Codex version that includes it. The aspect-ratio and object-fit values
// come straight from Codex's `constants.ts`.
const VALID_ASPECT_RATIOS = [ '1:1', '4:3', '3:2', '16:9' ];
const VALID_OBJECT_FITS = [ 'fill', 'contain', 'cover', 'none', 'scale-down' ];
const VALID_LOADING = [ 'lazy', 'eager' ];

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteImage',
	components: {
		CdxIcon
	},
	props: {
		src: {
			type: String,
			default: ''
		},
		alt: {
			type: String,
			default: ''
		},
		width: {
			type: [ String, Number ],
			default: null
		},
		height: {
			type: [ String, Number ],
			default: null
		},
		aspectRatio: {
			type: String,
			default: null,
			validator: ( v ) => v === null || VALID_ASPECT_RATIOS.includes( v )
		},
		objectFit: {
			type: String,
			default: 'cover',
			validator: ( v ) => VALID_OBJECT_FITS.includes( v )
		},
		loadingPriority: {
			type: String,
			default: 'lazy',
			validator: ( v ) => VALID_LOADING.includes( v )
		},
		// Codex icon shown when `src` is empty or the image fails to load.
		// CdxImage hard-codes `cdxIconImage`; we accept any icon so file
		// mode can route audio / video / archive / 3D to their own glyphs.
		placeholderIcon: {
			type: [ Object, String ],
			default: null
		}
	},
	setup( props ) {
		const isBroken = ref( false );

		// Reset the broken flag when the source changes — the same instance
		// gets reused across rows when navigation moves the highlight, so a
		// previous row's failure mustn't poison a fresh URL.
		watch( () => props.src, () => {
			isBroken.value = false;
		} );

		const onError = () => {
			isBroken.value = true;
		};

		// Class structure mirrors CdxImage: aspect-ratio is a root-level
		// modifier (Codex: `cdx-image--{ratio}`), object-fit is an img-level
		// modifier (Codex: `cdx-image__image--object-fit-{value}`). Keeping
		// the same split means the migration to CdxImage is a class-prefix
		// rename; nothing structural changes.
		const rootClasses = computed( () => props.aspectRatio ?
			[ `citizen-command-palette-image--ratio-${ props.aspectRatio.replace( ':', '-' ) }` ] :
			[]
		);

		const imageClasses = computed( () => ( {
			[ `citizen-command-palette-image__image--fit-${ props.objectFit }` ]: true
		} ) );

		return {
			isBroken,
			onError,
			rootClasses,
			imageClasses
		};
	}
} );
</script>

<style lang="less">
@import '../../mixins.less';

.citizen-command-palette-image {
	position: relative;
	display: block;
	overflow: hidden;
	background-color: var( --background-color-neutral-subtle );

	// Aspect-ratio variants. The class name format mirrors Codex's
	// `--ratio-1-1`, `--ratio-16-9` so a future swap to CdxImage is a
	// search-and-replace on the prefix.
	&--ratio-1-1 {
		aspect-ratio: 1 / 1;
	}

	&--ratio-4-3 {
		aspect-ratio: 4 / 3;
	}

	&--ratio-3-2 {
		aspect-ratio: 3 / 2;
	}

	&--ratio-16-9 {
		aspect-ratio: 16 / 9;
	}

	&__image {
		display: block;
		width: 100%;
		height: 100%;

		&--fit-fill {
			object-fit: fill;
		}

		&--fit-contain {
			object-fit: contain;
		}

		&--fit-cover {
			object-fit: cover;
		}

		&--fit-none {
			object-fit: none;
		}

		&--fit-scale-down {
			object-fit: scale-down;
		}
	}

	&__placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		color: var( --color-subtle );
	}

	&__placeholder-icon {
		// CdxIcon defaults to `cdx-icon--medium` (1.25rem). Inside a
		// constrained aspect-ratio container that's too small; size the
		// glyph relative to the container so it scales with the tile.
		// 25% of the container reads as a clear glyph without dominating.
		// !important is needed to override Codex link mixin style with this selector:
		// a:where(:not([role='button'])) .cdx-icon:not(.cdx-thumbnail__placeholder__icon--vue):last-child
		&.cdx-icon--medium {
			width: 25% !important;
			min-width: @size-200 !important;
			height: auto !important;
			min-height: 0 !important;
			aspect-ratio: 1 / 1;
		}
	}
}
</style>
