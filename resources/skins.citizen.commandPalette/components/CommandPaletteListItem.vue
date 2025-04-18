<!--
Partially based on the MenuItem component from Codex.
@see https://github.com/wikimedia/design-codex/blob/main/packages/codex/src/components/menu-item/MenuItem.vue
-->
<!-- eslint-disable max-len -->
<template>
	<li
		:id="id"
		role="option"
		class="citizen-command-palette-list-item"
		:class="rootClasses"
		:data-type="type"
		:tabindex="0"
		@mousemove="onMouseMove"
		@mouseleave="onMouseLeave"
		@mousedown.prevent="onMouseDown"
		@click.prevent="onClick"
	>
		<slot>
			<a
				:href="url"
				class="citizen-command-palette-list-item__content"
			>
				<cdx-thumbnail
					:thumbnail="thumbnail"
					:placeholder-icon="thumbnailIcon || undefined"
					class="citizen-command-palette-list-item__thumbnail"
				></cdx-thumbnail>

				<div class="citizen-command-palette-list-item__text">
					<div class="citizen-command-palette-list-item__text__label">
						<!-- Techinally you are not supposed to use CdxSearchResultTitle... -->
						<cdx-search-result-title
							:title="label"
							:search-query="searchQuery"
						></cdx-search-result-title>
					</div>
					<div
						v-if="description"
						class="citizen-command-palette-list-item__text__description"
					>
						<bdi>{{ description }}</bdi>
					</div>
				</div>
				<div class="citizen-command-palette-list-item__metadata">
					<div
						v-for="item in metadata"
						:key="item.label"
						class="citizen-command-palette-list-item__metadata__item"
					>
						<cdx-icon
							v-if="item.icon"
							:icon="item.icon"
							size="small"
							class="citizen-command-palette-list-item__metadata__item__icon"
						></cdx-icon>
						<cdx-search-result-title
							v-if="item.label && item.highlightQuery"
							class="citizen-command-palette-list-item__metadata__item__label"
							:title="item.label"
							:search-query="searchQuery"
						></cdx-search-result-title>
						<span
							v-else
							class="citizen-command-palette-list-item__metadata__item__label"
						>
							{{ item.label }}
						</span>
					</div>
					<div
						v-if="type"
						class="citizen-command-palette-list-item__metadata__item citizen-command-palette-list-item__metadata__item--type"
					>
						{{ typeLabel }}
					</div>
				</div>
				<div v-if="actions && actions.length > 0" class="citizen-command-palette-list-item__actions">
					<cdx-button
						v-for="action in actions"
						:key="action.id"
						class="citizen-command-palette-list-item__action"
						:aria-label="action.label"
						weight="quiet"
						:tabindex="highlighted ? 0 : -1"
						@click.stop.prevent="onActionClick( action )"
					>
						<cdx-icon
							:icon="action.icon"
							size="small"
							class="citizen-command-palette-list-item__action__icon"
						></cdx-icon>
					</cdx-button>
				</div>
			</a>
		</slot>
	</li>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );
const { CdxIcon, CdxSearchResultTitle, CdxThumbnail, CdxButton } = mw.loader.require( 'skins.citizen.commandPalette.codex' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteListItem',
	components: {
		CdxIcon,
		CdxSearchResultTitle,
		CdxThumbnail,
		CdxButton
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
		icon: {
			type: [ String, Object ],
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
		'action'
	],
	setup( props, { emit } ) {
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
				icon: props.icon,
				thumbnail: props.thumbnail,
				thumbnailIcon: props.thumbnailIcon,
				description: props.description,
				metadata: props.metadata,
				actions: props.actions
			} );
		};

		const onActionClick = ( action ) => {
			emit( 'action', {
				itemId: props.id,
				actionId: action.id,
				actionUrl: action.url
			} );
		};

		const rootClasses = computed( () => ( {
			'citizen-command-palette-list-item--active': props.active && props.highlighted,
			'citizen-command-palette-list-item--highlighted': props.highlighted
		} ) );

		// Messages that can be used here:
		// * citizen-command-palette-type-page
		// eslint-disable-next-line mediawiki/msg-doc
		const typeLabel = computed( () => mw.message( `citizen-command-palette-type-${ props.type }` ).text() );

		return {
			onMouseMove,
			onMouseLeave,
			onMouseDown,
			onClick,
			onActionClick,
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

	&__content {
		display: flex;
		column-gap: var( --space-sm );
		align-items: center;
		padding: var( --space-sm ) var( --citizen-command-palette-side-padding );
		text-decoration: none;

		&:hover {
			text-decoration: none;
		}
	}

	&__text {
		flex: 1;
		min-width: 0;
		overflow: hidden;

		&__label,
		&__description {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		&__label {
			font-weight: var( --font-weight-semi-bold );
			color: var( --color-emphasized );

			.cdx-search-result-title {
				/* So that text-overflow works */
				display: inline;
			}
		}

		&__description {
			font-size: var( --font-size-x-small );
			color: var( --color-subtle );
		}

		.cdx-search-result-title {
			font-weight: var( --font-weight-semi-bold );
			color: var( --color-emphasized );

			&__match {
				color: var( --color-subtle );
			}
		}
	}

	&__metadata {
		display: flex;
		gap: var( --space-xxs );
		font-size: var( --font-size-x-small );
		color: var( --color-subtle );

		&__item {
			display: flex;
			column-gap: var( --space-xxs );
			align-items: center;
			// TODO: Should probably create a Citizen badge component
			padding: var( --space-xxs ) var( --space-xs );
			line-height: var( --line-height-xxx-small );
			background: var( --color-surface-3 );
			border: var( --border-subtle );
			border-radius: var( --border-radius-base );
		}
	}

	&__actions {
		position: absolute;
		inset-inline-end: var( --citizen-command-palette-side-padding );
		display: flex;
		gap: var( --space-xxs );
		padding-left: var( --space-xl );
		background-color: inherit;
		background-image: linear-gradient( to right, transparent 0%, transparent 30%, var( --background-color-interactive-subtle--hover ) 70% );
		opacity: 0;
		transition: opacity var( --transition-quick );
	}

	&__action {
		border-radius: var( --border-radius-base );

		&--active {
			color: var( --color-emphasized );
			background: var( --background-color-interactive-subtle--active );
		}
	}

	&--highlighted {
		cursor: pointer;
		background-color: var( --background-color-interactive-subtle--hover );

		.citizen-command-palette-list-item__actions {
			opacity: 1;
		}
	}

	&--active {
		background-color: var( --background-color-interactive-subtle--active );
	}
}
</style>
