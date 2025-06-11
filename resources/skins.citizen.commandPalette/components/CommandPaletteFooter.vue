<template>
	<div class="citizen-command-palette__footer">
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div class="citizen-command-palette__footer-note" v-html="currentTip"></div>
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
const { ref, computed, onMounted } = require( 'vue' );
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
	},
	setup() {
		// TODO: Make this expandable with more tips, probably with a mw hook
		// TODO: Maybe we should move this to store?
		const tips = [
			mw.message( 'citizen-command-palette-tip-commands' ).parse(),
			mw.message( 'citizen-command-palette-tip-users' ).parse(),
			mw.message( 'citizen-command-palette-tip-namespace' ).parse(),
			mw.message( 'citizen-command-palette-tip-templates' ).parse()
		];

		const currentTipIndex = ref( 0 );
		const currentTip = computed( () => tips[ currentTipIndex.value ] );

		onMounted( () => {
			// Randomly select a tip when component is mounted
			currentTipIndex.value = Math.floor( Math.random() * tips.length );
		} );

		return {
			currentTip
		};
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
	color: var( --color-subtle );
	border-top: var( --border-subtle );

	&-note {
		color: var( --color-subtle );
	}
}
</style>
