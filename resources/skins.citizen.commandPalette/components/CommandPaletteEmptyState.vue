<template>
	<div class="citizen-command-palette-empty-state">
		<div class="citizen-command-palette-empty-state__icon">
			<slot name="icon">
				<cdx-icon :icon="icon"></cdx-icon>
			</slot>
		</div>
		<div class="citizen-command-palette-empty-state__content">
			<div class="citizen-command-palette-empty-state__title">
				{{ title }}
			</div>
			<div
				v-if="description"
				class="citizen-command-palette-empty-state__description"
			>
				{{ description }}
			</div>
		</div>
	</div>
</template>

<script>
const { defineComponent } = require( 'vue' );
const { CdxIcon } = mw.loader.require( 'skins.citizen.commandPalette.codex' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteEmptyState',
	components: {
		CdxIcon
	},
	props: {
		title: {
			type: String,
			required: true
		},
		description: {
			type: String,
			default: ''
		},
		icon: {
			type: [ String, Object ],
			default: 'cdxIconInfo'
		}
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.citizen-command-palette-empty-state {
	display: flex;
	flex-direction: column;
	gap: var( --space-xs );
	align-items: center;
	justify-content: center;
	padding: var( --space-xxl ) var( --citizen-command-palette-side-padding );
	text-align: center;

	&__icon {
		width: 5rem;
		height: 5rem;

		.cdx-icon {
			width: 100%;
			height: 100%;
		}
	}

	&__content {
		display: flex;
		flex-direction: column;
	}

	&__title {
		font-weight: var( --font-weight-semi-bold );
		color: var( --color-emphasized );
	}

	&__description {
		font-size: var( --font-size-small );
		color: var( --color-subtle );
	}
}
</style>
