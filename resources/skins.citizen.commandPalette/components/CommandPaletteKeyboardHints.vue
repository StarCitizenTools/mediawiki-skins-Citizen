<template>
	<div class="citizen-command-palette__footer-hints">
		<!-- Select hint -->
		<div class="citizen-keyboard-hint">
			<span class="citizen-keyboard-hint-label">{{ $i18n( 'citizen-command-palette-keyhint-select' ).text() }}</span>
			<kbd class="citizen-keyboard-hint-key">↵</kbd>
		</div>
		<!-- Navigate hint -->
		<div class="citizen-keyboard-hint">
			<span class="citizen-keyboard-hint-label">{{ $i18n( 'citizen-command-palette-keyhint-navigate' ).text() }}</span>
			<kbd class="citizen-keyboard-hint-key">↑↓</kbd>
		</div>
		<!-- Actions hint - only shown when item has actions -->
		<div v-if="hasHighlightedItemWithActions && !isActionButtonFocused" class="citizen-keyboard-hint">
			<span class="citizen-keyboard-hint-label">{{ $i18n( 'citizen-command-palette-keyhint-actions' ).text() }}</span>
			<kbd class="citizen-keyboard-hint-key">→</kbd>
		</div>
		<!-- Return hint - only shown when action is focused -->
		<div v-if="isActionButtonFocused" class="citizen-keyboard-hint">
			<span class="citizen-keyboard-hint-label">{{ $i18n( 'citizen-command-palette-keyhint-return' ).text() }}</span>
			<kbd class="citizen-keyboard-hint-key">←</kbd>
		</div>
		<!-- Exit hint -->
		<div class="citizen-keyboard-hint">
			<span class="citizen-keyboard-hint-label">{{ $i18n( 'citizen-command-palette-keyhint-exit' ).text() }}</span>
			<kbd class="citizen-keyboard-hint-key">esc</kbd>
		</div>
	</div>
</template>

<script>
const { defineComponent } = require( 'vue' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteKeyboardHints',
	props: {
		hasHighlightedItemWithActions: {
			type: Boolean,
			required: true
		},
		isActionButtonFocused: {
			type: Boolean,
			required: true
		}
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.citizen-command-palette__footer-hints {
	display: flex;
	gap: var( --space-sm );
}
</style>
