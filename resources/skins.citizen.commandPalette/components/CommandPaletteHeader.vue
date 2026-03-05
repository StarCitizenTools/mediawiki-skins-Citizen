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
		<div class="citizen-command-palette-header__input-area">
			<cdx-icon
				class="citizen-command-palette-header__icon"
				:icon="currentIcon"
			></cdx-icon>
			<cdx-info-chip
				v-for="( token, index ) in tokens"
				v-show="!activeMode"
				:key="token.id"
				class="citizen-command-palette-header__chip"
				:class="{ 'citizen-command-palette-header__chip--selected': index === selectedTokenIndex }"
				@click="$emit( 'select-token', index )"
			>
				{{ token.label }}
			</cdx-info-chip>
			<cdx-text-input
				ref="searchInputRef"
				:model-value="freeText"
				class="citizen-command-palette-header__input"
				input-type="search"
				:clearable="true"
				:placeholder="currentPlaceholder"
				@update:model-value="$emit( 'update:freeText', $event )"
			></cdx-text-input>
		</div>
		<div
			v-if="isPending && showPending"
			class="citizen-command-palette-header__progress-indicator citizen-loading"
		></div>
	</div>
</template>

<script>
const { defineComponent, ref, computed } = require( 'vue' );
const { CdxButton, CdxInfoChip, CdxTextInput, CdxIcon } = mw.loader.require( 'skins.citizen.commandPalette.codex' );
const { cdxIconArrowPrevious, cdxIconSearch } = require( '../icons.json' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteHeader',
	components: {
		CdxButton,
		CdxInfoChip,
		CdxTextInput,
		CdxIcon
	},
	props: {
		tokens: {
			type: Array,
			default: () => []
		},
		freeText: {
			type: String,
			default: ''
		},
		selectedTokenIndex: {
			type: Number,
			default: -1
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
	emits: [ 'update:freeText', 'select-token', 'exit-mode' ],
	setup( props, { expose } ) {
		const searchInputRef = ref( null );

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

	&__chip {
		flex-shrink: 0;
		font-weight: var( --font-weight-medium );
		background-color: var( --background-color-interactive );
		border: var( --border-base );
		border-radius: var( --border-radius-base );

		&--selected {
			background-color: transparent;
			border-color: var( --border-color-subtle );
		}
	}

	&__input-area {
		display: flex;
		flex-grow: 1;
		flex-wrap: nowrap;
		gap: @spacing-25;
		align-items: center;
	}

	&__icon {
		flex-shrink: 0;
		color: @color-placeholder;
		transition-timing-function: var( --transition-timing-function-ease );
		transition-duration: var( --transition-duration-base );
		transition-property: opacity, transform;

		&.cdx-icon {
			width: 40px;
		}
	}

	&__input {
		flex-grow: 1;
		min-width: 0;

		.cdx-text-input__input {
			padding-block: 0;
			padding-inline-start: 0;
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
