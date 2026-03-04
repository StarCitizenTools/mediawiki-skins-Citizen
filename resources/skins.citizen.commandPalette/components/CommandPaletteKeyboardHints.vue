<template>
	<div class="citizen-command-palette__footer-hints">
		<div
			v-for="hint in resolvedHints"
			:key="hint.kbd"
			class="citizen-keyboard-hint"
		>
			<span class="citizen-keyboard-hint-label">{{ hint.label }}</span>
			<kbd class="citizen-keyboard-hint-key">{{ hint.kbd }}</kbd>
		</div>
	</div>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteKeyboardHints',
	props: {
		hints: {
			type: Array,
			required: true
		}
	},
	setup( props ) {
		/* eslint-disable mediawiki/msg-doc -- msgKeys are all documented; passed dynamically from useKeyboard */
		const resolvedHints = computed( () => props.hints.map( ( hint ) => ( {
			label: mw.message( hint.msgKey ).text(),
			kbd: hint.kbd
		} ) ) );
		/* eslint-enable mediawiki/msg-doc */

		return {
			resolvedHints
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.citizen-command-palette__footer-hints {
	display: flex;
	flex-wrap: wrap;
	gap: var( --space-sm );
}
</style>
