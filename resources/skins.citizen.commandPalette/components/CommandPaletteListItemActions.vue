<template>
	<div
		v-if="actions && actions.length > 0"
		class="citizen-command-palette-list-item__actions"
		:class="{ 'citizen-command-palette-list-item__actions--visible': highlighted }"
	>
		<component
			:is="action.url ? 'a' : 'cdx-button'"
			v-for="action in actions"
			:key="action.id"
			:ref="( el ) => setButtonRef( el, action.id )"
			class="citizen-command-palette-list-item__action"
			v-bind="getButtonAttributes( action )"
			@click="handleActionClick( action, $event )"
			@focus="onButtonFocus( action.id )"
			@keydown="handleActionButtonKeydown"
		>
			<cdx-icon
				:icon="action.icon"
				size="small"
				class="citizen-command-palette-list-item__action__icon"
			></cdx-icon>
		</component>
	</div>
</template>

<script>
const { defineComponent, ref, computed, onBeforeUpdate } = require( 'vue' );
const { CdxIcon, CdxButton } = mw.loader.require( 'skins.citizen.commandPalette.codex' );
const { CommandPaletteActionEvent } = require( '../types.js' );
const useActionNavigation = require( '../composables/useActionNavigation.js' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteListItemActions',
	components: {
		CdxIcon,
		CdxButton
	},
	props: {
		actions: {
			type: Array,
			default: () => []
		},
		highlighted: {
			type: Boolean,
			default: false
		},
		itemId: {
			type: String,
			required: true
		}
	},
	emits: [ 'action', 'navigate-list', 'focus-action', 'blur-actions' ],
	setup( props, { emit, expose } ) {
		const buttonRefs = ref( {} );

		const { handleActionButtonKeydown, onButtonFocus, focusFirstButton, focusLastButton } =
			useActionNavigation( computed( () => props.actions ), buttonRefs, emit );

		const getButtonAttributes = ( action ) => {
			const isLink = !!action.url;
			const attributes = {
				'aria-label': action.label,
				tabindex: -1
			};

			if ( isLink ) {
				attributes.class = {
					'cdx-button cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--weight-quiet cdx-button--icon-only': true
				};
				attributes.href = action.url;
			} else {
				attributes.weight = 'quiet';
			}

			return attributes;
		};

		// Reset refs before update
		onBeforeUpdate( () => {
			for ( const key in buttonRefs.value ) {
				delete buttonRefs.value[ key ];
			}
		} );

		const setButtonRef = ( el, actionId ) => {
			if ( el ) {
				buttonRefs.value[ actionId ] = el;
			}
		};

		const onActionClick = ( action ) => {
			let actionType = 'event';
			if ( action.id === 'dismiss' ) {
				actionType = 'dismiss';
			} else if ( action.url ) {
				actionType = 'navigate';
			}

			/** @type {CommandPaletteActionEvent} */
			const payload = {
				type: actionType,
				itemId: props.itemId, // Include parent item ID
				actionId: action.id,
				url: action.url
			};
			emit( 'action', payload );
		};

		const handleActionClick = ( action, event ) => {
			event.stopPropagation();
			if ( !action.url ) {
				event.preventDefault();
			}
			onActionClick( action );
		};

		expose( {
			focusFirstButton,
			focusLastButton
		} );

		return {
			getButtonAttributes,
			setButtonRef,
			handleActionClick,
			handleActionButtonKeydown,
			onButtonFocus
		};
	}
} );
</script>

<style lang="less">
.citizen-command-palette-list-item {
	&__actions {
		position: absolute;
		inset-inline-end: var( --citizen-command-palette-side-padding );
		top: 0;
		display: flex;
		gap: var( --space-xxs );
		align-items: center;
		height: 100%;
		padding-left: var( --space-xl );
		pointer-events: none;
		background-image: linear-gradient( to right, transparent 0%, transparent 30%, var( --actions-fade-color, inherit ) 70% );
		opacity: 0;
		transform: translateX( 16px );
		transition-timing-function: var( --transition-timing-function-ease-in );
		transition-duration: var( --transition-duration-base );
		transition-property: opacity, transform;

		&--visible {
			pointer-events: auto;
			opacity: 1;
			transform: none;
			transition-timing-function: var( --transition-timing-function-ease-out );
		}
	}

	&__action {
		border-radius: var( --border-radius-base );

		// The Codex link styles somehow override the icon padding, so we need to reset it.
		// Original selector: a:where(:not([role='button'])) .cdx-icon:not(.cdx-thumbnail__placeholder__icon--vue):last-child
		a&.cdx-button .cdx-icon {
			padding: 0;
		}
	}
}
</style>
