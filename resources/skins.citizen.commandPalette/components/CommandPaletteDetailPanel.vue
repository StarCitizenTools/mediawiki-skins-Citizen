<template>
	<div class="citizen-command-palette-detail-panel" aria-live="polite">
		<slot name="header"></slot>
		<dl
			v-if="detail.pairs && detail.pairs.length > 0"
			class="citizen-command-palette-detail-panel__pairs"
		>
			<div
				v-for="( pair, index ) in detail.pairs"
				:key="pair.key || index"
				class="citizen-command-palette-detail-panel__pair"
			>
				<dt class="citizen-command-palette-detail-panel__label">
					{{ pair.label }}
				</dt>
				<dd class="citizen-command-palette-detail-panel__value">
					<!-- eslint-disable-next-line mediawiki/no-vue-dynamic-i18n -- slot name is the consumer's pair key, not an i18n message -->
					<slot :name="pair.key || `pair-${index}`" :pair="pair">
						{{ pair.value }}
					</slot>
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

	&__pair {
		display: flex;
		flex-direction: column;
		gap: var( --space-xs );
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
