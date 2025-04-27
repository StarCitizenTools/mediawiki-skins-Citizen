<template>
	<div class="citizen-command-palette__footer-hints">
		<!-- Select hint -->
		<div class="citizen-keyboard-hint">
			<span class="citizen-keyboard-hint-label">{{ enterKeyLabel }}</span>
			<kbd class="citizen-keyboard-hint-key">↵</kbd>
		</div>
		<!-- Navigate hint -->
		<div v-if="itemCount > 1 && !isActionFocused" class="citizen-keyboard-hint">
			<span class="citizen-keyboard-hint-label">{{ $i18n( 'citizen-command-palette-keyhint-navigate' ).text() }}</span>
			<kbd class="citizen-keyboard-hint-key">↑↓</kbd>
		</div>
		<!-- Actions hint - only shown when item has actions and not in action focus -->
		<div v-if="hasHighlightedItemWithActions && !isActionFocused" class="citizen-keyboard-hint">
			<span class="citizen-keyboard-hint-label">{{ $i18n( 'citizen-command-palette-keyhint-actions' ).text() }}</span>
			<kbd class="citizen-keyboard-hint-key">→</kbd>
		</div>
		<!-- Return hint - only shown when first action is focused -->
		<div v-if="isFirstActionFocused" class="citizen-keyboard-hint">
			<span class="citizen-keyboard-hint-label">{{ $i18n( 'citizen-command-palette-keyhint-return' ).text() }}</span>
			<kbd class="citizen-keyboard-hint-key">←</kbd>
		</div>
		<!-- Navigate Actions hint - shown when any action focused -->
		<div v-if="isActionFocused" class="citizen-keyboard-hint">
			<span class="citizen-keyboard-hint-label">{{ $i18n( 'citizen-command-palette-keyhint-navigate' ).text() }}</span>
			<kbd class="citizen-keyboard-hint-key">{{ navigateActionsKeys }}</kbd>
		</div>
		<!-- Exit hint -->
		<div class="citizen-keyboard-hint">
			<span class="citizen-keyboard-hint-label">{{ $i18n( 'citizen-command-palette-keyhint-exit' ).text() }}</span>
			<kbd class="citizen-keyboard-hint-key">esc</kbd>
		</div>
	</div>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteKeyboardHints',
	props: {
		hasHighlightedItemWithActions: {
			type: Boolean,
			required: true
		},
		itemCount: {
			type: Number,
			required: true
		},
		highlightedItemType: {
			type: [ String, null ], // Can be null if no item is highlighted
			default: null
		},
		isActionFocused: {
			type: Boolean,
			default: false
		},
		isFirstActionFocused: {
			type: Boolean,
			default: false
		},
		focusedActionIndex: {
			type: Number,
			default: -1
		},
		actionCount: {
			type: Number,
			default: 0
		}
	},
	setup( props ) {
		const enterKeyLabel = computed( () => {
			if ( props.highlightedItemType !== null || props.isActionFocused ) {
				return mw.message( 'citizen-command-palette-keyhint-enter-select' ).text();
			} else {
				return mw.message( 'citizen-command-palette-keyhint-enter-search' ).text();
			}
		} );

		const navigateActionsKeys = computed( () => {
			let keys = '↑↓'; // Always show up/down when action is focused

			if ( props.actionCount <= 1 ) {
				// No left/right if only one action
				return keys;
			}

			// Left arrow is always possible (moves focus or returns to input)
			keys += '←';

			// Right arrow is only possible if not on the last action
			if ( props.focusedActionIndex < props.actionCount - 1 ) {
				keys += '→';
			}

			return keys;
		} );

		return {
			enterKeyLabel,
			navigateActionsKeys
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
