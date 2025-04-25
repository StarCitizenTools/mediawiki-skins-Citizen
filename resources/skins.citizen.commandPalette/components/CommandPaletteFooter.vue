<template>
	<div class="citizen-command-palette__footer">
		<div class="citizen-command-palette__footer-note">
			Thanks for trying our new Command Palette!
			<a href="https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues">Give us feedback</a>
		</div>
		<command-palette-keyboard-hints
			:has-highlighted-item-with-actions="hasHighlightedItemWithActions"
			:item-count="itemCount"
			:highlighted-item-type="highlightedItemType"
			:is-action-focused="isActionFocused"
			:is-first-action-focused="isFirstActionFocused"
			:focused-action-index="focusedActionIndex"
			:action-count="actionCount"
		></command-palette-keyboard-hints>
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
		hasHighlightedItemWithActions: {
			type: Boolean,
			required: true
		},
		itemCount: {
			type: Number,
			required: true
		},
		highlightedItemType: {
			type: [ String, null ],
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
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.citizen-command-palette__footer {
	display: flex;
	gap: var( --space-sm );
	align-items: center;
	justify-content: space-between;
	padding: var( --space-sm ) var( --citizen-command-palette-side-padding );
	font-size: var( --font-size-x-small );
	color: var( --color-subtle );
	border-top: var( --border-subtle );

	&-note {
		color: var( --color-subtle );
	}
}
</style>
