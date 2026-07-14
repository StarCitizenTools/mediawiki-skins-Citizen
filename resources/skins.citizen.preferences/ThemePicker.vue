<template>
	<div class="citizen-preferences-themepicker">
		<div
			class="citizen-preferences-themepicker__grid"
			@mouseleave="hovered = null"
		>
			<cdx-radio
				v-for="option in options"
				:key="option.value"
				:model-value="modelValue"
				:input-value="option.value"
				:name="featureName"
				@update:model-value="$emit( 'update:modelValue', $event )"
				@mouseenter="hovered = option.value"
			>
				<span
					class="citizen-preferences-themecircle"
					:class="option.value === 'os' ?
						'citizen-preferences-themecircle--adaptive' :
						'skin-theme-clientpref-' + option.value"
				></span>
				<span class="citizen-preferences-themepicker__srlabel">{{ option.label }}</span>
			</cdx-radio>
		</div>
		<div
			class="citizen-preferences-themepicker__readout"
			aria-hidden="true"
		>
			{{ readoutLabel }}
		</div>
	</div>
</template>

<script>
const { defineComponent, ref, computed, watch } = require( 'vue' );
const { CdxRadio } = mw.loader.require( 'skins.citizen.preferences.codex' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'ThemePicker',
	components: { CdxRadio },
	props: {
		modelValue: { type: String, required: true },
		options: { type: Array, required: true },
		featureName: { type: String, required: true }
	},
	emits: [ 'update:modelValue' ],
	setup( props ) {
		const hovered = ref( null );
		// A selection change (including keyboard arrow-key navigation, which
		// doesn't fire mouseenter/leave) must win over a stuck hover so the
		// readout always reflects the current choice.
		watch( () => props.modelValue, () => {
			hovered.value = null;
		} );
		const readoutLabel = computed( () => {
			const value = hovered.value !== null ? hovered.value : props.modelValue;
			const option = props.options.find( ( o ) => o.value === value );
			return option ? option.label : '';
		} );
		return { hovered, readoutLabel };
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';
@import '../mixins.less';

.citizen-preferences-themepicker {
	&__grid {
		display: flex;
		flex-wrap: wrap;
		gap: var( --space-sm );
	}

	// The circle is the control's visual; hide Codex's native radio dot
	// and reset wrapper/label spacing.
	.cdx-radio__icon {
		display: none;
	}

	// The whole radio is one small circular control: keep the pointer
	// cursor across all of it — Codex's invisible input overlay and label
	// wrappers otherwise reset the cursor over parts of the circle.
	.cdx-radio,
	.cdx-radio * {
		cursor: pointer;
	}

	.cdx-radio {
		margin-bottom: 0;
	}

	.cdx-radio__wrapper {
		gap: 0;
	}

	.cdx-label {
		padding: 0;
	}

	// Visually hidden, but present in the accessibility tree so each radio
	// has an accessible name even though no label is shown.
	&__srlabel {
		.mixin-citizen-screen-reader-only();
	}

	&__readout {
		min-height: 1.25em;
		margin-top: var( --space-sm );
		font-size: var( --font-size-small );
		color: var( --color-subtle );
	}
}

.citizen-preferences-themecircle {
	display: block;
	width: @min-size-interactive-touch;
	height: @min-size-interactive-touch;
	// The circle wears the theme's clientpref class, so these tokens
	// resolve to that theme's real surface + accent.
	background: conic-gradient( from 0deg, var( --color-surface-0 ) 0 50%, var( --color-progressive ) 50% 100% );
	border-radius: var( --border-radius-circle );
	// Keep a light-surface circle visible against a light panel.
	box-shadow: inset 0 0 0 1px var( --border-color-subtle );

	// os / Auto — adaptive: a static light/dark split (a live media query
	// can't be shown in a static swatch).
	&--adaptive {
		background: conic-gradient( from -45deg, var( --color-white ) 0 50%, var( --color-neutral-1000 ) 50% 100% );
	}

	.cdx-radio:has( .cdx-radio__input:checked ) & {
		outline: 2px solid var( --color-progressive );
		outline-offset: 2px;
	}

	.cdx-radio:has( .cdx-radio__input:focus-visible ) & {
		outline: 2px solid var( --color-progressive );
		outline-offset: 2px;
	}
}
</style>
