<template>
	<div
		class="citizen-command-palette-header"
		:class="{ 'citizen-command-palette-header--mode-active': activeMode }"
	>
		<transition name="citizen-command-palette-header-back">
			<cdx-button
				v-if="activeMode"
				class="citizen-command-palette-header__back"
				weight="quiet"
				icon-only
				:aria-label="$i18n( 'citizen-command-palette-back' ).text()"
				@click="$emit( 'exit-mode' )"
			>
				<cdx-icon
					:icon="cdxIconArrowPrevious"
					size="small"
				></cdx-icon>
			</cdx-button>
		</transition>
		<cdx-text-input
			ref="searchInputRef"
			:model-value="value"
			class="citizen-command-palette-header__input"
			input-type="search"
			:start-icon="currentIcon"
			:clearable="true"
			:placeholder="currentPlaceholder"
			@update:model-value="$emit( 'update:modelValue', $event )"
		></cdx-text-input>
		<div
			v-if="isPending && showPending"
			class="citizen-command-palette-header__progress-indicator citizen-loading"
		></div>
	</div>
</template>

<script>
const { defineComponent, ref, computed } = require( 'vue' );
const { CdxButton, CdxTextInput, CdxIcon } = mw.loader.require( 'skins.citizen.commandPalette.codex' );
const { cdxIconArrowPrevious, cdxIconSearch } = require( '../icons.json' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteHeader',
	components: {
		CdxButton,
		CdxTextInput,
		CdxIcon
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
		},
		activeMode: {
			type: Object,
			default: null
		}
	},
	emits: [ 'update:modelValue', 'exit-mode' ],
	setup( props, { expose } ) {
		const searchInputRef = ref( null );
		const value = computed( () => props.modelValue );

		const currentIcon = computed( () => {
			if ( props.activeMode && props.activeMode.icon ) {
				return props.activeMode.icon;
			}
			return cdxIconSearch;
		} );

		const currentPlaceholder = computed( () => {
			if ( props.activeMode && props.activeMode.placeholder ) {
				return props.activeMode.placeholder;
			}
			return mw.message( 'searchsuggest-search' ).text();
		} );

		const getInputElement = () => searchInputRef.value?.$el?.querySelector( 'input' ) || null;

		const focus = () => {
			getInputElement()?.focus();
		};

		expose( {
			focus,
			getInputElement
		} );

		return {
			searchInputRef,
			value,
			currentIcon,
			currentPlaceholder,
			cdxIconArrowPrevious
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';
@import '../../mixins.less';

.citizen-command-palette-header {
	--citizen-command-palette-back-button-size: 24px;
	position: relative;
	/* 8px from CdxTextInput */
	padding: var( --space-sm ) calc( var( --citizen-command-palette-side-padding ) - @spacing-50 );
	transition-timing-function: var( --transition-timing-function-ease );
	transition-duration: var( --transition-duration-base );
	transition-property: padding-inline-start;
	.mixin-citizen-font-styles( 'body' );

	&--mode-active {
		padding-inline-start: calc( var( --citizen-command-palette-side-padding ) - @spacing-50 + var( --citizen-command-palette-back-button-size ) );
	}

	&__back {
		position: absolute;
		inset-block: 0;
		inset-inline-start: calc( var( --citizen-command-palette-side-padding ) - @spacing-50 );
		min-width: var( --citizen-command-palette-back-button-size );
		margin-block: auto;
	}

	&-back-enter-active,
	&-back-leave-active {
		transition-timing-function: var( --transition-timing-function-ease );
		transition-duration: var( --transition-duration-base );
		transition-property: opacity, transform;
	}

	&-back-enter-from,
	&-back-leave-to {
		opacity: 0;
		transform: translateX( -25% );
	}

	&__input {
		.cdx-text-input__start-icon {
			transition-timing-function: var( --transition-timing-function-ease );
			transition-duration: var( --transition-duration-base );
			transition-property: opacity, transform;
		}

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
