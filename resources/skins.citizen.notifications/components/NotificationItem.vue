<template>
	<li
		class="citizen-notifications__item"
		:class="{ 'citizen-notifications__item--unread': !item.read }"
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

// Action links rendered as quiet progressive Codex buttons; links need the
// fake-button variants since they are <a>, not <button>.
const ACTION_BUTTON_CLASS = [
	'cdx-button',
	'cdx-button--fake-button',
	'cdx-button--fake-button--enabled',
	'cdx-button--weight-quiet',
	'cdx-button--action-progressive'
];

// Largest-first so we pick the coarsest unit that fits.
const RELATIVE_UNITS = [
	[ 'year', 31536000 ],
	[ 'month', 2592000 ],
	[ 'week', 604800 ],
	[ 'day', 86400 ],
	[ 'hour', 3600 ],
	[ 'minute', 60 ]
];

/**
 * Format a unix timestamp (seconds) as a compact localized relative time via
 * Intl's narrow style, e.g. "now", "2m ago", "5h ago", "3d ago". Returns ''
 * for a missing/invalid timestamp, where Intl is unsupported, or where the
 * user language is not a valid BCP 47 tag.
 *
 * @param {number} unixSeconds
 * @return {string}
 */
function formatRelativeTime( unixSeconds ) {
	// Captured through a guarded reference so unsupported browsers degrade to
	// no timestamp rather than throwing (mirrors lastModified.js).
	// eslint-disable-next-line compat/compat
	const RelativeTimeFormat = typeof Intl !== 'undefined' && Intl.RelativeTimeFormat;
	if ( !unixSeconds || !RelativeTimeFormat ) {
		return '';
	}
	const deltaSeconds = unixSeconds - Math.floor( Date.now() / 1000 ); // negative = past
	const abs = Math.abs( deltaSeconds );
	const match = RELATIVE_UNITS.find( ( unit ) => abs >= unit[ 1 ] );
	const unitName = match ? match[ 0 ] : 'second';
	const divisor = match ? match[ 1 ] : 1;

	let rtf;
	try {
		rtf = new RelativeTimeFormat(
			mw.config.get( 'wgUserLanguage' ) || undefined,
			{ style: 'narrow', numeric: 'auto' }
		);
	} catch ( e ) {
		// A structurally invalid BCP 47 tag (e.g. the x-xss testing
		// pseudo-language) makes the constructor throw. Degrade to no relative
		// timestamp rather than breaking the notification row's render.
		mw.log.warn(
			'[Citizen] Skipping the notification relative time; the interface language is not a valid BCP 47 tag:',
			e
		);
		return '';
	}

	return rtf.format( Math.round( deltaSeconds / divisor ), unitName );
}

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

		/**
		 * Whole-row click: mark read once. Navigation to the primary action is
		 * handled natively by the stretched link (or by a nested link the user
		 * clicked); the click bubbles here either way.
		 */
		function onClick() {
			if ( !props.item.read ) {
				emit( 'read', props.item.id );
			}
		}

		return { formattedTime, plainHeader, actionButtonClass: ACTION_BUTTON_CLASS, onClick };
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.citizen-notifications {
	&__item {
		position: relative;
		padding: var( --space-sm ) var( --space-md );
		cursor: pointer;
		border-bottom: var( --border-subtle );
		transition: background-color var( --transition-duration-base );

		&:hover {
			background-color: var( --color-surface-1--hover );
		}

		// Unread rows get a subtle tint (the panel's only read/unread cue).
		&--unread {
			background-color: var( --color-surface-2 );

			&:hover {
				background-color: var( --color-surface-2--hover );
			}
		}
	}

	// Stretched primary link: an empty link whose ::after is the row-wide hit
	// area and focus surface.
	&__item-primary {
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
