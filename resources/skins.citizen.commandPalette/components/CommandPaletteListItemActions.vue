<template>
	<div
		v-if="actions && actions.length > 0"
		class="citizen-command-palette-list-item__actions"
		:class="{ 'citizen-command-palette-list-item__actions--visible': highlighted }"
	>
		<cdx-button
			v-for="action in actions"
			:key="action.id"
			:ref="( el ) => setButtonRef( el, action.id )"
			class="citizen-command-palette-list-item__action"
			:aria-label="action.label"
			weight="quiet"
			:tabindex="-1"
			@click.stop.prevent="onActionClick( action )"
			@focus="onButtonFocus( action.id )"
			@keydown="handleActionButtonKeydown"
		>
			<cdx-icon
				:icon="action.icon"
				size="small"
				class="citizen-command-palette-list-item__action__icon"
			></cdx-icon>
		</cdx-button>
	</div>
</template>

<script>
const { defineComponent, ref, computed, onBeforeUpdate } = require( 'vue' );
const { CdxIcon, CdxButton } = mw.loader.require( 'skins.citizen.commandPalette.codex' );
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

		// Use the composable here
		const { handleActionButtonKeydown, onButtonFocus, focusFirstButton, focusLastButton } =
			useActionNavigation( computed( () => props.actions ), buttonRefs, emit );

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

		// Handle clicks on action buttons
		const onActionClick = ( action ) => {
			// Determine the type based on the action details
			let actionType = 'event'; // Default to 'event' or a specific type if needed
			if ( action.id === 'dismiss' ) {
				actionType = 'dismiss';
			} else if ( action.url ) {
				actionType = 'navigate';
			} // Add other conditions if action.id determines other types like 'edit' (that aren't navigation)

			/** @type {import('../types.js').CommandPaletteActionEvent} */
			const payload = {
				type: actionType,
				itemId: props.itemId, // Include parent item ID
				actionId: action.id,
				url: action.url
				// Pass any other relevant action properties if needed
			};
			emit( 'action', payload );
		};

		// Expose focus methods for parent component
		expose( {
			focusFirstButton,
			focusLastButton
		} );

		return {
			// buttonRefs needed by setButtonRef
			setButtonRef,
			onActionClick,
			// Pass composable methods to template
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
		transition: opacity var( --transition-quick );

		&--visible {
			pointer-events: auto;
			opacity: 1;
		}
	}

	&__action {
		border-radius: var( --border-radius-base );
	}
}
</style>
