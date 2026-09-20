<template>
	<div
		class="citizen-preferences-radio"
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
			<span class="citizen-preferences-card">
				<span class="citizen-preferences-card__label">{{ option.label }}</span>
			</span>
		</cdx-radio>
	</div>
</template>

<script>
const { defineComponent } = require( 'vue' );
const { CdxRadio } = require( '../../codex.js' );

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

.citizen-preferences-radio {
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

.citizen-preferences-card {
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
}
</style>
