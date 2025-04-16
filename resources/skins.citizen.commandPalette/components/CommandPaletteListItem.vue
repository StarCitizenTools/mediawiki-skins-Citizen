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
		@mousemove="onMouseMove"
		@mouseleave="onMouseLeave"
		@mousedown.prevent="onMouseDown"
	>
		<slot>
			<a
				:href="url"
				class="citizen-command-palette-list-item__content"
			>
				<cdx-thumbnail
					v-if="showThumbnail"
					:thumbnail="thumbnail"
					class="citizen-command-palette-list-item__thumbnail"
				></cdx-thumbnail>

				<cdx-icon
					v-else-if="icon"
					:icon="icon"
					class="citizen-command-palette-list-item__icon"
				></cdx-icon>

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
			</a>
		</slot>
	</li>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );
const { CdxIcon, CdxSearchResultTitle, CdxThumbnail } = mw.loader.require( 'skins.citizen.commandPalette.codex' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteListItem',
	components: {
		CdxIcon,
		CdxSearchResultTitle,
		CdxThumbnail
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
		showThumbnail: {
			type: Boolean,
			default: false
		},
		thumbnail: {
			type: [ Object, null ],
			default: null
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
		}
	},
	emits: [
		'change'
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
			rootClasses,
			typeLabel
		};
	}
} );
</script>

<style lang="less">
.citizen-command-palette-list-item {
	list-style: none;
	position: relative;

	&__content {
		padding: var( --space-sm ) var( --citizen-command-palette-side-padding );
		display: flex;
		align-items: center;
		text-decoration: none;
		column-gap: var(--space-sm );

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
			color: var( --color-emphasized );
			font-weight: var( --font-weight-semi-bold );

			.cdx-search-result-title {
				/* So that text-overflow works */
				display: inline;
			}
		}

		&__description {
			color: var( --color-subtle );
			font-size: var( --font-size-x-small );
		}

		.cdx-search-result-title {
			color: var( --color-emphasized );
			font-weight: var( --font-weight-semi-bold );

			&__match {
				color: var( --color-subtle );
			}
		}
	}

	&__metadata {
		color: var( --color-subtle );
		font-size: var( --font-size-x-small );
		display: flex;
		gap: var( --space-xxs );

		&__item {
			display: flex;
			align-items: center;
			column-gap: var( --space-xxs );
			// TODO: Should probably create a Citizen badge component
			padding: var(--space-xxs) var(--space-xs);
			background: var( --color-surface-3 );
			border: var( --border-subtle );
			border-radius: var( --border-radius-base );
			line-height: var( --line-height-xxx-small );
		}
	}

	&--highlighted {
		background-color: var( --background-color-interactive-subtle--hover );
		cursor: pointer;
	}

	&--active {
		background-color: var( --background-color-interactive-subtle--active );
	}
}
</style>
