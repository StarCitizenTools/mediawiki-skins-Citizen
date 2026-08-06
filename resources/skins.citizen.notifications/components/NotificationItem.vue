<template>
	<li
		class="citizen-notifications__item"
		:class="{ 'citizen-notifications__item--read': item.read }"
		@click="onClick"
	>
		<!--
			Primary action stretched over the whole row: an empty link whose
			::after covers the card, so the click target mouse users get by
			clicking anywhere is also a real, keyboard-focusable link. Nested
			links (in the header/body/actions) sit above it and stay clickable.
		-->
		<a
			v-if="item.primaryUrl"
			class="citizen-notifications__item-primary"
			:href="item.primaryUrl"
			:aria-label="plainHeader"
		></a>
		<span class="citizen-notifications__item-badge" aria-hidden="true">
			<span
				v-if="iconStyle"
				class="citizen-notifications__item-icon"
				:style="iconStyle"
			></span>
		</span>
		<div class="citizen-notifications__item-content">
			<div class="citizen-notifications__item-meta">
				<span
					v-if="item.categoryLabel"
					class="citizen-notifications__item-category"
				>{{ item.categoryLabel }}</span>
				<span class="citizen-notifications__item-time">{{ formattedTime }}</span>
			</div>
			<!-- eslint-disable vue/no-v-html -- header/body are messages Echo has already parsed and escaped. -->
			<div
				class="citizen-notifications__item-header"
				v-html="item.header"
			></div>
			<div
				v-if="item.body"
				class="citizen-notifications__item-body"
				v-html="item.body"
			></div>
			<!-- eslint-enable vue/no-v-html -->
			<div
				v-if="item.secondaryLinks.length > 0"
				class="citizen-notifications__item-actions"
			>
				<a
					v-for="link in item.secondaryLinks"
					:key="link.url"
					class="citizen-notifications__item-link"
					:class="actionButtonClass"
					:href="link.url"
				>{{ link.label }}</a>
			</div>
		</div>
	</li>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );
const formatRelativeTime = require( '../relativeTime.js' );

// Action links rendered as quiet progressive Codex buttons; links need the
// fake-button variants since they are <a>, not <button>.
const ACTION_BUTTON_CLASS = [
	'cdx-button',
	'cdx-button--fake-button',
	'cdx-button--fake-button--enabled',
	'cdx-button--weight-quiet',
	'cdx-button--action-progressive'
];

// Only URL shapes Echo legitimately emits (absolute http(s),
// protocol-relative, or root-relative), with no characters that could
// escape a CSS url() string. Anything else renders no glyph.
const ICON_URL_PATTERN = /^(?:https?:\/\/|\/\/|\/)[^"'\\\s]*$/;

// @vue/component
module.exports = exports = defineComponent( {
	name: 'NotificationItem',
	props: {
		item: {
			type: Object,
			required: true
		}
	},
	emits: [ 'read' ],
	setup( props, { emit } ) {
		const formattedTime = computed( () => formatRelativeTime( props.item.timestamp ) );

		// Plain-text accessible name for the stretched primary link (the header
		// is parsed HTML; the link itself has no visible text).
		const plainHeader = computed( () => {
			const el = document.createElement( 'div' );
			el.innerHTML = props.item.header || '';
			return ( el.textContent || '' ).trim();
		} );

		// The icon file only contributes its alpha shape: it is applied as a
		// mask and painted with theme tokens, so any icon matches any theme.
		const iconStyle = computed( () => {
			const url = props.item.iconUrl || '';
			if ( !ICON_URL_PATTERN.test( url ) ) {
				return null;
			}
			return { '--citizen-notification-icon': `url( "${ url }" )` };
		} );

		/**
		 * Whole-row click: mark read once. Navigation to the primary action is
		 * handled natively by the stretched link (or by a nested link the user
		 * clicked); the click bubbles here either way.
		 */
		function onClick() {
			if ( props.item.read ) {
				return;
			}
			emit( 'read', props.item.id );
		}

		return {
			formattedTime,
			plainHeader,
			iconStyle,
			actionButtonClass: ACTION_BUTTON_CLASS,
			onClick
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.citizen-notifications {
	&__item {
		position: relative;
		display: grid;
		grid-template-columns: auto 1fr;
		column-gap: var( --space-sm );
		padding: var( --space-sm ) var( --space-md );
		cursor: pointer;
		transition: background-color var( --transition-duration-base );

		&:hover {
			background-color: var( --color-surface-1--hover );
		}

		// Everything here is waiting to be read, so the resting state is plain.
		// A row recedes once read, marking what you have dealt with this
		// session; the next open drops it from the list entirely. This shifts
		// the surface and steps the text down to the palette's own subtle
		// colour rather than fading the row, which would take the text below
		// the contrast floor and dim the focus ring with it.
		&--read {
			background-color: var( --color-surface-1 );

			.citizen-notifications__item-header {
				color: var( --color-subtle );
			}
		}
	}

	// The divider belongs between rows, never after the last one — a trailing
	// line would hang under the end of the list, worst of all above the
	// borderless footer.
	&__item + &__item {
		border-top: var( --border-subtle );
	}

	// Stretched primary link: an empty link whose ::after is the row-wide hit
	// area and focus surface. Taken out of flow so it is not a grid item of the
	// row — otherwise it would claim the badge's column and push the content on
	// to a second row. Its box is the row's padding box, so the ::after below
	// still resolves to exactly the area it covered before.
	&__item-primary {
		position: absolute;
		inset: 0;

		&::after {
			position: absolute;
			inset: 0;
			z-index: 1;
			content: '';
		}

		&:focus-visible::after {
			// Inset box-shadow ring (visible) keeps the focus indicator inside
			// the scrolling list's clip; the transparent outline carries it
			// into forced-colors mode.
			outline: @outline-base--focus;
			box-shadow: inset 0 0 0 2px var( --outline-color-progressive--focus );
		}
	}

	// Keep in-content links above the stretched link so they stay
	// independently clickable; plain text stays below it, so a click there
	// triggers the row's primary action.
	&__item-header a,
	&__item-body a,
	&__item-link {
		position: relative;
		z-index: 2;
	}

	// Decorative icon badge: neutral circle, glyph masked from the backend's
	// icon file and painted with the text ink so every theme restyles it.
	&__item-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		margin-block-start: 0.125rem;
		background-color: var( --color-surface-3 );
		border-radius: var( --border-radius-circle );
	}

	&__item-icon {
		width: 1rem;
		height: 1rem;
		background-color: var( --color-base );
		-webkit-mask-image: var( --citizen-notification-icon );
		mask-image: var( --citizen-notification-icon );
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		-webkit-mask-position: center;
		mask-position: center;
		-webkit-mask-size: contain;
		mask-size: contain;
	}

	&__item-content {
		min-width: 0;
	}

	// First row: category label (start) and relative time pinned top-right.
	&__item-meta {
		display: flex;
		gap: var( --space-xs );
		align-items: baseline;
		font-size: var( --font-size-x-small );
		color: var( --color-subtle );
	}

	&__item-category {
		overflow: hidden;
		text-overflow: ellipsis;
		font-weight: var( --font-weight-medium );
		white-space: nowrap;
	}

	&__item-time {
		flex-shrink: 0;
		// Pin to the right even when there is no category label.
		margin-inline-start: auto;
	}

	&__item-header {
		margin-block-start: var( --space-xxs );
		color: var( --color-base );
	}

	&__item-body {
		margin-block-start: var( --space-xxs );
		color: var( --color-subtle );
	}

	// Last row: secondary action links.
	&__item-actions {
		display: flex;
		flex-wrap: wrap;
		margin-block-start: var( --space-xxs );
		margin-inline: @spacing-horizontal-button * -1;
	}
}
</style>
