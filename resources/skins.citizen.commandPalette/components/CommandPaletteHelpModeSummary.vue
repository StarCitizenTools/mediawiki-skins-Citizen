<template>
	<div class="citizen-command-palette-help__mode-summary">
		<cdx-thumbnail
			v-if="mode.icon"
			:placeholder-icon="mode.icon"
			class="citizen-command-palette-help__mode-thumbnail"
		></cdx-thumbnail>
		<div class="citizen-command-palette-help__mode-text">
			<div class="citizen-command-palette-help__mode-label">
				{{ mode.label || mode.id }}
			</div>
			<div
				v-if="mode.description"
				class="citizen-command-palette-help__mode-description"
			>
				{{ mode.description }}
			</div>
		</div>
	</div>
</template>

<script>
const { defineComponent } = require( 'vue' );
const { CdxThumbnail } = mw.loader.require( 'skins.citizen.commandPalette.codex' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteHelpModeSummary',
	compilerOptions: {
		whitespace: 'condense'
	},
	components: {
		CdxThumbnail
	},
	props: {
		mode: {
			type: Object,
			required: true
		}
	}
} );
</script>
