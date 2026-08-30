<template>
	<div
		class="citizen-preferences-segmented"
		@mouseleave="$emit( 'update:hovered', null )"
	>
		<cdx-radio
			v-for="( option, index ) in options"
			:key="option.value"
			:model-value="modelValue"
			:input-value="option.value"
			:name="featureName"
			@update:model-value="$emit( 'update:modelValue', $event )"
			@mouseenter="$emit( 'update:hovered', option.value )"
		>
			<span
				v-if="variant === 'font-size'"
				class="citizen-preferences-segmented__sample"
				:style="{ fontSize: sampleSize( index ) }"
				aria-hidden="true"
			>{{ sampleText }}</span>
			<svg
				v-else-if="variant === 'width'"
				class="citizen-preferences-segmented__page"
				:width="GLYPH_WIDTH"
				:height="GLYPH_HEIGHT"
				:viewBox="`0 0 ${ GLYPH_WIDTH } ${ GLYPH_HEIGHT }`"
				aria-hidden="true"
			>
				<rect
					class="citizen-preferences-segmented__page-frame"
					x="0.75"
					y="0.75"
					:width="GLYPH_WIDTH - FRAME_STROKE"
					:height="GLYPH_HEIGHT - FRAME_STROKE"
					rx="2.5"
				/>
				<rect
					class="citizen-preferences-segmented__page-column"
					:x="( GLYPH_WIDTH - columnWidth( index ) ) / 2"
					:y="COLUMN_INSET_BLOCK"
					:width="columnWidth( index )"
					:height="GLYPH_HEIGHT - COLUMN_INSET_BLOCK * 2"
					rx="1"
				/>
			</svg>
			<template v-else>
				{{ option.label }}
			</template>
			<span
				v-if="hasGlyph"
				class="citizen-preferences-segmented__srlabel"
			>{{ option.label }}</span>
		</cdx-radio>
	</div>
</template>

<script>
const { computed, defineComponent } = require( 'vue' );
const { CdxRadio } = require( '../../codex.js' );

// Every glyph is sized from an option's rank in the list, never a lookup on
// its value: an admin override replaces the options array wholesale, so a
// value the skin has never seen still has to land in the right place.

// The real body sizes this preference sets, in rem because Codex's mode
// mixins declare --font-size-medium that way: a px sample would stop matching
// the body the moment a reader changes their browser's default font size. The
// shipped ladder is arithmetic, so ranking across these endpoints reproduces
// it exactly.
const SAMPLE_MIN = 0.875;
const SAMPLE_MAX = 1.25;

// Content column as a fraction of the page glyph, standard through full-bleed.
const COLUMN_MIN = 0.56;
const COLUMN_MAX = 1;

const GLYPH_WIDTH = 38;
const GLYPH_HEIGHT = 24;
// Half the frame's stroke, so the widest column lands on its inner edge.
const FRAME_STROKE = 1.5;
const COLUMN_INSET_BLOCK = 4.5;

/**
 * Position `index` on a ramp between `min` and `max`.
 *
 * @param {number} index Zero-based rank of the option.
 * @param {number} count Total number of options.
 * @param {number} min Value at the first rank.
 * @param {number} max Value at the last rank.
 * @return {number}
 */
function ramp( index, count, min, max ) {
	if ( count < 2 ) {
		return ( min + max ) / 2;
	}
	return min + ( max - min ) * ( index / ( count - 1 ) );
}

// @vue/component
module.exports = exports = defineComponent( {
	name: 'SegmentedPicker',
	components: { CdxRadio },
	props: {
		modelValue: {
			type: String,
			required: true
		},
		options: {
			type: Array,
			required: true
		},
		featureName: {
			type: String,
			required: true
		},
		/**
		 * Which glyph set to draw. Absent or unrecognised renders the
		 * option labels as text.
		 */
		variant: {
			type: String,
			default: ''
		}
	},
	emits: [ 'update:modelValue', 'update:hovered' ],
	setup( props ) {
		// Without a glyph the label is visible text, which already names the
		// segment; a second copy would announce it twice.
		const hasGlyph = computed(
			() => props.variant === 'font-size' || props.variant === 'width'
		);

		/**
		 * @param {number} index
		 * @return {string}
		 */
		function sampleSize( index ) {
			return ramp(
				index, props.options.length, SAMPLE_MIN, SAMPLE_MAX
			).toFixed( 4 ) + 'rem';
		}

		/**
		 * @param {number} index
		 * @return {number}
		 */
		function columnWidth( index ) {
			const inner = GLYPH_WIDTH - FRAME_STROKE * 2;
			return ramp(
				index, props.options.length, COLUMN_MIN, COLUMN_MAX
			) * inner;
		}

		return {
			hasGlyph,
			// Latin 'Aa' means nothing in most scripts.
			sampleText: mw.message( 'citizen-preferences-font-size-sample' ).text(),
			sampleSize,
			columnWidth,
			GLYPH_WIDTH,
			GLYPH_HEIGHT,
			FRAME_STROKE,
			COLUMN_INSET_BLOCK
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';
@import '../mixins.less';

.citizen-preferences-segmented {
	box-sizing: border-box;
	display: grid;
	grid-auto-columns: 1fr;
	grid-auto-flow: column;
	height: @min-size-interactive-touch;
	padding: var( --space-xxs );
	border: var( --border-subtle );
	border-radius: var( --border-radius-medium );

	.cdx-radio {
		position: relative;
		margin-bottom: 0;
		// Transparent rather than absent, or a border appearing on hover
		// reflows the track.
		border: var( --border-width-base ) solid transparent;
		border-radius: var( --border-radius-base );
		transition-duration: var( --transition-duration-base );
		transition-property: background-color, color;
	}

	// The segment is the control's visual; hide Codex's native radio dot.
	.cdx-radio__icon {
		display: none;
	}

	.cdx-radio__wrapper,
	.cdx-label,
	.cdx-label__label {
		width: 100%;
		min-width: 0;
		height: 100%;
	}

	.cdx-radio__wrapper {
		gap: 0;
	}

	.cdx-label {
		padding: 0;
	}

	.cdx-label__label {
		display: flex;
		align-items: center;
		justify-content: center;
		padding-inline: var( --space-xxs );
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: var( --font-size-small );
		color: var( --color-subtle );
		white-space: nowrap;
	}

	// Codex's invisible input overlay and label wrappers reset the cursor over
	// most of the segment. The selected one is a no-op to click.
	.cdx-radio,
	.cdx-radio * {
		cursor: pointer;
	}

	.cdx-radio:has( .cdx-radio__input:checked ),
	.cdx-radio:has( .cdx-radio__input:checked ) * {
		cursor: default;
	}

	// A hairline parts unselected neighbours.
	.cdx-radio + .cdx-radio::before {
		position: absolute;
		inset-block: var( --space-xxs );
		inset-inline-start: 0;
		width: 1px;
		content: '';
		background-color: var( --border-color-base );
	}

	// Hover previews the pill's shape at lower emphasis. Fill alone cannot
	// carry it: the quiet surface steps are ~1.08:1, and the panel already
	// sits on the colour a subtle hover would paint.
	.cdx-radio:hover:not( :has( .cdx-radio__input:checked ) ),
	.cdx-radio:active:not( :has( .cdx-radio__input:checked ) ) {
		background-color: var( --background-color-interactive );
		border-color: var( --border-color-interactive );

		.cdx-label__label {
			color: var( --color-emphasized );
		}

		// A filled segment supplies its own edge.
		&::before,
		+ .cdx-radio::before {
			opacity: 0;
		}
	}

	// Pressing shows the edge the release commits to.
	.cdx-radio:active:not( :has( .cdx-radio__input:checked ) ) {
		border-color: var( --color-progressive );
	}

	.cdx-radio:has( .cdx-radio__input:checked ) {
		background-color: var( --background-color-interactive );
		// Accent, as everywhere else in Appearance. It is also the only option
		// clearing the 3:1 WCAG 1.4.11 wants for a component state: 5.1:1
		// light, 7.7:1 dark, against 1.5:1 for the neutral borders.
		border-color: var( --color-progressive );
		// Reads as 2px without the reflow a wider border would cause.
		box-shadow: inset 0 0 0 var( --border-width-base ) var( --color-progressive );

		.cdx-label__label {
			color: var( --color-emphasized );
		}

		&::before,
		+ .cdx-radio::before {
			opacity: 0;
		}
	}

	.cdx-radio:has( .cdx-radio__input:focus-visible ) {
		outline: 2px solid var( --color-progressive );
		outline-offset: 1px;
	}

	// Inline, the box is the font's ascent plus descent and rounds differently
	// per size, landing the samples 0.5-1.5px high by varying amounts.
	&__sample {
		display: block;
		font-weight: var( --font-weight-medium );
		line-height: 1;
	}

	// Inline, the SVG sits on the text baseline and reserves descender space
	// below it, riding high.
	&__page {
		display: block;
	}

	&__page-frame {
		opacity: 0.45;
		fill: none;
		stroke: currentcolor;
		stroke-width: 1.5;
	}

	&__page-column {
		opacity: 0.75;
		fill: currentcolor;
	}

	// Names a segment that draws only a glyph.
	&__srlabel {
		.mixin-citizen-screen-reader-only();
	}
}
</style>
