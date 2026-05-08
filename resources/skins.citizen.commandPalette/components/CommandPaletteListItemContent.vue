<template>
	<component
		:is="url ? 'a' : 'button'"
		:href="url || undefined"
		:type="url ? undefined : 'button'"
		:data-instantdiffs-link="( url && previewable ) ? 'event' : undefined"
		class="citizen-command-palette-list-item__content"
		:class="{ 'citizen-command-palette-list-item__content--compact': compact }"
	>
		<cdx-icon
			v-if="compact"
			:icon="thumbnailIcon"
			size="medium"
			class="citizen-command-palette-list-item__icon"
		></cdx-icon>
		<cdx-thumbnail
			v-else
			:thumbnail="thumbnail"
			:placeholder-icon="thumbnailIcon || undefined"
			class="citizen-command-palette-list-item__thumbnail"
		></cdx-thumbnail>

		<div
			v-if="compact"
			class="citizen-command-palette-list-item__text-inline"
		>
			<span class="citizen-command-palette-list-item__text__label">
				<cdx-search-result-title
					v-if="highlightQuery"
					:title="label"
					:search-query="searchQuery"
				></cdx-search-result-title>
				<template v-else>{{ label }}</template>
			</span>
			<span
				v-if="description"
				class="citizen-command-palette-list-item__text-inline__description"
			>
				<bdi>{{ description }}</bdi>
			</span>
		</div>
		<div
			v-else
			class="citizen-command-palette-list-item__text"
		>
			<div class="citizen-command-palette-list-item__text__label">
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
				:class="item.status && `citizen-command-palette-list-item__metadata__item--status-${ item.status }`"
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
	</component>
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
		url: {
			type: String,
			default: ''
		},
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
		},
		compact: {
			type: Boolean,
			default: false
		},
		previewable: {
			type: Boolean,
			default: false
		}
	}
} );
</script>

<style lang="less">
@import '../../mixins.less';

.citizen-command-palette-list-item {
	&__content {
		display: flex;
		column-gap: var( --space-sm );
		align-items: center;
		padding: var( --space-sm ) var( --citizen-command-palette-side-padding );
		text-decoration: none;

		// Reset button styles
		button& {
			width: 100%;
			font: inherit;
			color: inherit;
			text-align: inherit;
			cursor: pointer;
			background: none;
			border: 0;
		}

		&:hover {
			text-decoration: none;
		}

		&--compact {
			padding-block: var( --space-xs );
		}
	}

	&__icon {
		flex-shrink: 0;
		color: var( --color-subtle );
	}

	&__text {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		line-height: 1.125rem; // Match height of the thumbnail

		&__label {
			font-weight: var( --font-weight-semi-bold );
			color: var( --color-emphasized );
			.mixin-citizen-font-styles( 'body' );

			.cdx-search-result-title {
				/* So that text-overflow works */
				display: inline;
			}
		}

		&__description {
			color: var( --color-subtle );
		}

		.cdx-search-result-title {
			font-weight: var( --font-weight-semi-bold );
			color: var( --color-emphasized );

			&__match {
				color: var( --color-subtle );
			}
		}

		&__label,
		&__description {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	&__text-inline {
		display: flex;
		flex: 1;
		column-gap: var( --space-xs );
		align-items: baseline;
		min-width: 0;
		.mixin-citizen-font-styles( 'body' );

		.citizen-command-palette-list-item__text__label {
			flex-shrink: 0;
			min-width: 0;
			max-width: 100%;
			overflow: hidden;
			text-overflow: ellipsis;
			font-weight: var( --font-weight-semi-bold );
			color: var( --color-emphasized );
			white-space: nowrap;

			.cdx-search-result-title {
				display: inline;
				font-weight: var( --font-weight-semi-bold );
				color: var( --color-emphasized );

				&__match {
					color: var( --color-subtle );
				}
			}
		}

		&__description {
			flex: 1 1 0;
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			color: var( --color-subtle );
			white-space: nowrap;
		}
	}

	&__metadata {
		display: flex;
		gap: var( --space-xxs );
		color: var( --color-subtle );

		&__item {
			display: flex;
			column-gap: var( --space-xxs );
			align-items: center;
			padding: 2px var( --space-xs );
			line-height: var( --line-height-small );
			background: var( --color-surface-2 );
			border: var( --border-subtle );
			border-radius: var( --border-radius-base );

			.cdx-icon {
				color: var( --color-subtle );
			}

			&--status-success {
				color: var( --color-success );
				background-color: var( --background-color-success-subtle );
				border-color: var( --border-color-success );
			}

			&--status-error {
				color: var( --color-error );
				background-color: var( --background-color-error-subtle );
				border-color: var( --border-color-error );
			}
		}
	}
}
</style>
