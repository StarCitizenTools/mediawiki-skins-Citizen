<template>
	<div
		class="citizen-command-palette-detail-panel"
		aria-live="polite"
	>
		<dl class="citizen-command-palette-detail-panel__pairs">
			<div
				v-for="( pair, index ) in detail.pairs"
				:key="index"
				class="citizen-command-palette-detail-panel__pair"
			>
				<dt class="citizen-command-palette-detail-panel__label">
					{{ pair.label }}
				</dt>
				<dd class="citizen-command-palette-detail-panel__value">
					{{ pair.value }}
				</dd>
			</div>
		</dl>
	</div>
</template>

<script>
const { defineComponent } = require( 'vue' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteDetailPanel',
	props: {
		detail: {
			type: Object,
			required: true,
			validator: ( val ) => Array.isArray( val.pairs )
		}
	}
} );
</script>

<style lang="less">
@import '../../mixins.less';

.citizen-command-palette-detail-panel {
	padding: var( --space-md ) var( --citizen-command-palette-side-padding );
	overflow-y: auto;

	&__pairs {
		display: flex;
		flex-direction: column;
		gap: var( --space-sm );
		margin: 0;
	}

	&__label {
		color: var( --color-subtle );
		.mixin-citizen-font-styles( 'overline' );
	}

	&__value {
		margin: 0;
		overflow-wrap: break-word;
	}
}
</style>
