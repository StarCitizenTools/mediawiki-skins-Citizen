<template>
	<div
		class="citizen-pref-radio"
		:style="{ '--pref-columns': columns }"
	>
		<cdx-radio
			v-for="option in options"
			:key="option.value"
			:model-value="modelValue"
			:input-value="option.value"
			:name="featureName"
			@update:model-value="$emit( 'update:modelValue', $event )"
		>
			<span class="citizen-pref-card">
				<span
					v-if="option.previewColors"
					class="citizen-pref-card__preview citizen-pref-card__preview--theme"
					:style="{
						'--preview-bg': option.previewColors.surface,
						'--preview-text': option.previewColors.text
					}"
				>
					<span class="citizen-pref-card__line citizen-pref-card__line--long"></span>
					<span class="citizen-pref-card__line citizen-pref-card__line--short"></span>
					<span class="citizen-pref-card__line citizen-pref-card__line--medium"></span>
				</span>
				<span class="citizen-pref-card__label">{{ option.label }}</span>
			</span>
		</cdx-radio>
	</div>
</template>

<script>
const { defineComponent } = require( 'vue' );
const { CdxRadio } = mw.loader.require( 'skins.citizen.preferences.codex' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'RadioGroup',
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
		columns: {
			type: Number,
			default: 2
		}
	},
	emits: [ 'update:modelValue' ]
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.citizen-pref-radio {
	display: grid;
	grid-template-columns: repeat( var( --pref-columns, 2 ), 1fr );
	gap: var( --space-xxs );

	// Make radios fill their grid cells evenly (width + height)
	.cdx-radio,
	.cdx-radio__wrapper,
	.cdx-label,
	.cdx-label__label {
		width: 100%;
		min-width: 0;
		height: 100%;
	}

	.cdx-radio {
		margin-bottom: 0;
	}

	// Visually hide the radio dot; keep input accessible for keyboard/screen readers
	.cdx-radio__icon {
		display: none;
	}

	// Reset Codex wrapper and label spacing for card layout
	.cdx-radio__wrapper {
		gap: 0;
	}

	.cdx-label {
		padding: 0;
	}
}

.citizen-pref-card {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
	cursor: pointer;
	border: var( --border-width-thick ) solid var( --border-color-base );
	border-radius: var( --border-radius-medium );
	transition-duration: var( --transition-duration-base );
	transition-property: border-color, background-color;

	.cdx-radio:has( .cdx-radio__input:checked ) & {
		background-color: var( --background-color-progressive-subtle );
		border-color: var( --color-progressive );
	}

	.cdx-radio:has( .cdx-radio__input:focus-visible ) & {
		outline: 2px solid var( --color-progressive );
		outline-offset: 1px;
	}

	&__label {
		padding: var( --space-xxs ) var( --space-xs );
		font-size: var( --font-size-small );
		color: var( --color-subtle );
		text-align: center;

		.cdx-radio:has( .cdx-radio__input:checked ) & {
			font-weight: var( --font-weight-semi-bold );
			color: var( --color-progressive );
		}
	}

	&__preview {
		display: flex;
		flex-direction: column;
		gap: 3px;
		align-items: center;
		justify-content: center;
		width: 100%;
		aspect-ratio: 3 / 2;
		padding: var( --space-xs );
		background-color: var( --preview-bg );
	}

	&__line {
		display: block;
		height: 3px;
		background-color: var( --preview-text );
		border-radius: 1px;
		opacity: 0.6;

		&--long {
			width: 80%;
		}

		&--medium {
			width: 60%;
		}

		&--short {
			width: 40%;
		}
	}
}
</style>
