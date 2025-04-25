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
		@mousemove="onMouseMove"
		@mouseleave="onMouseLeave"
		@mousedown.prevent="onMouseDown"
		@click.prevent="onClick"
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
			@navigate-list="$emit( 'navigate-list', $event )"
			@focus-action="$emit( 'focus-action', $event )"
			@blur-actions="$emit( 'blur-actions' )"
		></command-palette-list-item-actions>
	</li>
</template>

<script>
const { defineComponent, computed, ref } = require( 'vue' );
// Import the new sub-components
const CommandPaletteListItemContent = require( './CommandPaletteListItemContent.vue' );
const CommandPaletteListItemActions = require( './CommandPaletteListItemActions.vue' );

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
		'navigate-list',
		'focus-action',
		'blur-actions'
	],
	setup( props, { emit, expose } ) {
		const rootRef = ref( null );
		const actionsRef = ref( null );

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
			// Computed
			rootClasses,
			typeLabel
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
