<template>
	<div
		class="citizen-command-palette-list-item__content"
	>
		<cdx-thumbnail
			:thumbnail="thumbnail"
			:placeholder-icon="thumbnailIcon || undefined"
			class="citizen-command-palette-list-item__thumbnail"
		></cdx-thumbnail>

		<div class="citizen-command-palette-list-item__text">
			<div class="citizen-command-palette-list-item__text__label">
				<!-- Technically you are not supposed to use CdxSearchResultTitle... -->
				<cdx-search-result-title
					v-if="highlightQuery"
					:title="label"
					:search-query="searchQuery"
				></cdx-search-result-title>
				<span
					v-else
					class="citizen-command-palette-list-item__text__label"
				>
					{{ label }}
				</span>
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
	</div>
</template>

<script>
const { defineComponent } = require( 'vue' );
const { CdxIcon, CdxSearchResultTitle, CdxThumbnail } = mw.loader.require( 'skins.citizen.commandPalette.codex' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteListItemContent',
	components: {
		CdxIcon,
		CdxSearchResultTitle,
		CdxThumbnail
	},
	props: {
		label: {
			type: String,
			required: true
		},
		description: {
			type: [ String, null ],
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
		metadata: {
			type: Array,
			default: () => []
		},
		type: {
			type: String,
			required: true
		},
		typeLabel: {
			type: String,
			required: true
		},
		searchQuery: {
			type: String,
			default: ''
		},
		highlightQuery: {
			type: Boolean,
			default: false
		}
	}
} );
</script>

<style lang="less">
.citizen-command-palette-list-item {
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
			padding: var( --space-xxs ) var( --space-xs );
			line-height: var( --line-height-xxx-small );
			background: var( --color-surface-3 );
			border: var( --border-subtle );
			border-radius: var( --border-radius-base );
		}
	}
}
</style>
