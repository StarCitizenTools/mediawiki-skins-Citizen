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
	emits: [ 'update:modelValue', 'keydown', 'close' ],
	setup( props, { emit } ) {
		const searchInputRef = ref( null );
		const value = computed( () => props.modelValue );

		const onKeydown = ( event ) => {
			emit( 'keydown', event );
		};

		return {
			searchInputRef,
			value,
			cdxIconSearch,
			onKeydown
		};
	},
	methods: {
		/**
		 * @public
		 */
		focus() {
			this.$refs.searchInputRef?.$el.querySelector( 'input' )?.focus();
		}
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.citizen-command-palette {
	&__search {
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
		left: 0;
	}
}
</style>
