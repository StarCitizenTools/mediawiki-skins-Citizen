<!--
Partially based on the MenuItem component from Codex.
@see https://github.com/wikimedia/design-codex/blob/main/packages/codex/src/components/menu-item/MenuItem.vue
-->
<!-- eslint-disable max-len -->
<template>
	<li
		:id="id"
		ref="rootRef"
		role="option"
		class="citizen-command-palette-list-item"
		:class="rootClasses"
		:data-type="type"
		:tabindex="highlighted ? 0 : -1"
		@mousemove="onMouseMove"
		@mouseleave="onMouseLeave"
		@mousedown.prevent="onMouseDown"
		@click.prevent="onClick"
		@focus="onFocus"
		@keydown="onKeydown"
	>
		<command-palette-list-item-content
			:label="label"
			:description="description"
			:thumbnail="thumbnail"
			:thumbnail-icon="thumbnailIcon"
			:metadata="metadata"
			:type="type"
			:type-label="typeLabel"
			:search-query="searchQuery"
			:url="url"
		></command-palette-list-item-content>
		<command-palette-list-item-actions
			ref="actionsRef"
			:item-id="id"
			:actions="actions"
			:highlighted="highlighted"
			@action="onAction"
		></command-palette-list-item-actions>
	</li>
</template>

<script>
const { defineComponent, computed, ref } = require( 'vue' );
// Import the new sub-components
const CommandPaletteListItemContent = require( './CommandPaletteListItemContent.vue' );
const CommandPaletteListItemActions = require( './CommandPaletteListItemActions.vue' );
// Note: Cdx components are now only needed in sub-components, so mw.loader.require is removed here.
// Note: useActionNavigation is now only used in CommandPaletteListItemActions.

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteListItem',
	components: {
		// Register the new sub-components
		CommandPaletteListItemContent,
		CommandPaletteListItemActions
	},
	props: {
		id: {
			type: String,
			required: true
		},
		active: {
			type: Boolean,
			default: false
		},
		highlighted: {
			type: Boolean,
			default: false
		},
		type: {
			type: String,
			required: true
		},
		label: {
			type: String,
			required: true
		},
		url: {
			type: String,
			default: ''
		},
		value: {
			type: String,
			default: ''
		},
		thumbnail: {
			type: [ Object, null ],
			default: null
		},
		thumbnailIcon: {
			type: [ String, Object ],
			default: ''
		},
		description: {
			type: [ String, null ],
			default: ''
		},
		searchQuery: {
			type: String,
			default: ''
		},
		metadata: {
			type: Array,
			default: () => []
		},
		actions: {
			type: Array,
			default: () => []
		}
	},
	emits: [
		'change',
		'select',
		'action',
		'focus-input', // Still potentially needed from actions sub-component? Check useActionNavigation emits
		'navigate-list' // Still potentially needed from actions sub-component? Check useActionNavigation emits
	],
	setup( props, { emit, expose } ) {
		const rootRef = ref( null );
		const actionsRef = ref( null ); // Ref for the actions sub-component

		// --- Item Interaction Logic ---
		const onMouseMove = () => {
			if ( !props.highlighted ) {
				emit( 'change', 'highlighted', true );
			}
		};

		const onMouseLeave = () => {
			emit( 'change', 'highlighted', false );
		};

		const onMouseDown = ( e ) => {
			if ( e.button === 0 ) {
				emit( 'change', 'active', true );
			}
		};

		const onClick = () => {
			// Emit the full item data on select
			emit( 'select', {
				id: props.id,
				label: props.label,
				url: props.url,
				type: props.type,
				value: props.value,
				thumbnail: props.thumbnail,
				thumbnailIcon: props.thumbnailIcon,
				description: props.description,
				metadata: props.metadata,
				actions: props.actions
			} );
		};

		// --- Action Handling ---
		const onAction = ( actionPayload ) => {
			// Simply forward the event from the actions sub-component
			emit( 'action', actionPayload );
		};

		// --- Focus Handling ---
		const onFocus = ( event ) => {
			// When the list item itself receives focus, try focusing the first action button if available
			if ( props.actions && props.actions.length > 0 && !rootRef.value.contains( event.relatedTarget ) ) {
				actionsRef.value?.focusFirstButton();
			}
		};

		// --- Keydown Handling ---
		const onKeydown = ( e ) => {
			// Keydown logic is now simplified:
			// - Action button navigation (Arrows, Home, End, Tab) is handled *within* CommandPaletteListItemActions
			// - We only need to handle Enter/Space on the list item itself for selection.

			// Only handle keys if the event target is the list item itself
			if ( e.target !== rootRef.value ) {
				return;
			}

			let handled = false;
			switch ( e.key ) {
				case 'Enter':
				case ' ': // Allow space to select as well
					onClick();
					handled = true;
					break;
				// Arrow keys (Up/Down) are handled by the parent list for list navigation.
				// Arrow keys (Left/Right), Home, End, Tab are potentially handled by the actions component if it has focus.
			}

			if ( handled ) {
				e.preventDefault();
				e.stopPropagation();
			}
		};

		// --- Computed Properties ---
		const rootClasses = computed( () => ( {
			'citizen-command-palette-list-item--active': props.active && props.highlighted,
			'citizen-command-palette-list-item--highlighted': props.highlighted
		} ) );

		// Messages that can be used here:
		// * citizen-command-palette-type-page
		// eslint-disable-next-line mediawiki/msg-doc
		const typeLabel = computed( () => mw.message( `citizen-command-palette-type-${ props.type }` ).text() );

		// --- Expose Methods ---
		expose( {
			// Expose method to focus the list item itself
			focus: () => rootRef.value?.focus(),
			// Expose methods to focus buttons within the actions sub-component
			focusFirstButton: () => actionsRef.value?.focusFirstButton(),
			focusLastButton: () => actionsRef.value?.focusLastButton()
		} );

		return {
			// Refs
			rootRef,
			actionsRef,
			// Event Handlers
			onMouseMove,
			onMouseLeave,
			onMouseDown,
			onClick,
			onAction,
			onFocus,
			onKeydown,
			// Computed
			rootClasses,
			typeLabel // Pass computed typeLabel to content sub-component
		};
	}
} );
</script>

<style lang="less">
.citizen-command-palette-list-item {
	position: relative;
	list-style: none;
	outline: none;

	&--highlighted {
		cursor: pointer;
		background-color: var( --background-color-interactive-subtle--hover );
		--actions-fade-color: var( --background-color-interactive-subtle--hover );
	}

	&--active {
		background-color: var( --background-color-interactive-subtle--active );
		--actions-fade-color: var( --background-color-interactive-subtle--active );
	}
}
</style>
