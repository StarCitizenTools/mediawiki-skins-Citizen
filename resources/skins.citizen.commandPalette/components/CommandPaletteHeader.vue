<template>
	<div class="citizen-command-palette__search">
		<cdx-text-input
			ref="searchInputRef"
			:model-value="value"
			class="citizen-command-palette__input"
			input-type="search"
			:start-icon="cdxIconSearch"
			:clearable="true"
			:placeholder="$i18n( 'searchsuggest-search' ).text()"
			@update:model-value="$emit( 'update:modelValue', $event )"
			@keydown="onKeydown"
			@keydown.esc="$emit( 'close' )"
			@keydown.tab="$emit( 'close' )"
		></cdx-text-input>
		<div
			v-if="isPending && showPending"
			class="citizen-command-palette__progress-indicator citizen-loading"
		></div>
	</div>
</template>

<script>
const { defineComponent, ref, computed } = require( 'vue' );
const { CdxTextInput } = mw.loader.require( 'skins.citizen.commandPalette.codex' );
const { cdxIconSearch } = require( '../icons.json' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteHeader',
	components: {
		CdxTextInput
	},
	props: {
		modelValue: {
			type: String,
			default: ''
		},
		isPending: {
			type: Boolean,
			default: false
		},
		showPending: {
			type: Boolean,
			default: false
		}
	},
	emits: [ 'update:modelValue', 'keydown', 'close', 'focus-active-item' ],
	setup( props, { emit, expose } ) {
		const searchInputRef = ref( null );
		const value = computed( () => props.modelValue );

		const getInputElement = () => searchInputRef.value?.$el?.querySelector( 'input' ) || null;

		const focus = () => {
			getInputElement()?.focus();
		};

		const onKeydown = ( event ) => {
			switch ( event.key ) {
				case 'ArrowUp':
				case 'ArrowDown':
					// Prevent default input cursor movement
					event.preventDefault();
					// Emit the event for parent (App.vue) to handle list navigation
					emit( 'keydown', event );
					break;
				case 'ArrowRight': {
					const inputEl = event.target;
					// Check if cursor is at the end of the input
					if ( inputEl.selectionStart === inputEl.value.length ) {
						// Prevent default cursor movement
						event.preventDefault();
						// Signal parent to focus the active list item
						emit( 'focus-active-item' );
					}
					// If not at the end, allow default right arrow behavior within the input
					// and don't emit 'keydown' to avoid potential double handling.
					break;
				}
				// For other keys like Enter, alphanumeric, etc., let the parent handle or allow default.
				// We specifically don't emit 'keydown' for ArrowRight when not at the end.
				default:
					// Only emit general keydown for keys not specifically handled here
					// (e.g., Enter for selection, other keys for typing)
					emit( 'keydown', event );
					break;
			}
		};

		expose( {
			focus,
			getInputElement
		} );

		return {
			searchInputRef,
			value,
			cdxIconSearch,
			onKeydown
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.citizen-command-palette {
	&__search {
		position: relative;
		/* 8px from CdxTextInput */
		padding: var( --space-sm ) calc( var( --citizen-command-palette-side-padding ) - @spacing-50 );
	}

	&__input {
		.cdx-text-input__input {
			padding-block: 0;
			padding-left: calc( @spacing-50 + @size-icon-medium + var( --space-sm ) );
			outline: 0 !important;
			background-color: transparent !important;
			border: 0 !important;
			/* Let the container handles the states */
			box-shadow: none !important;
		}
	}

	&__progress-indicator {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
	}
}
</style>
