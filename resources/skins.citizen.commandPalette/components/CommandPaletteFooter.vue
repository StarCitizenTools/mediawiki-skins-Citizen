<template>
	<div class="citizen-command-palette__footer">
		<command-palette-keyboard-hints :hints="hints"></command-palette-keyboard-hints>
	</div>
</template>

<script>
const { defineComponent } = require( 'vue' );
const CommandPaletteKeyboardHints = require( './CommandPaletteKeyboardHints.vue' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteFooter',
	components: {
		CommandPaletteKeyboardHints
	},
	props: {
		hints: {
			type: Array,
			required: true
		}
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.citizen-command-palette__footer {
	display: flex;
	justify-content: flex-end;
	padding: var( --space-sm ) var( --citizen-command-palette-side-padding );
	color: var( --color-subtle );
	border-top: var( --border-subtle );
}
</style>
