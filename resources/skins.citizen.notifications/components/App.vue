<template>
	<div class="citizen-notifications__panel">
		<header class="citizen-notifications__header">
			<h2 class="citizen-notifications__title">
				{{ msg.title }}
			</h2>
			<cdx-button
				class="citizen-notifications__mark-all"
				weight="quiet"
				:disabled="!canMarkAll"
				:aria-label="msg.markAll"
				:title="msg.markAll"
				@click="onMarkAll"
			>
				<cdx-icon :icon="icons.cdxIconCheckAll"></cdx-icon>
			</cdx-button>
		</header>

		<div class="citizen-notifications__body">
			<div
				v-if="status === 'loading'"
				class="citizen-notifications__skeleton"
				role="status"
				aria-busy="true"
			>
				<div
					v-for="n in 5"
					:key="n"
					class="citizen-notifications__skeleton-item
						citizen-notifications__skeleton-item--icon"
				>
					<span class="citizen-notifications__skeleton-icon"></span>
					<span
						v-for="variant in [ 'title', 'meta' ]"
						:key="variant"
						class="citizen-notifications__skeleton-line"
						:class="'citizen-notifications__skeleton-line--' + variant"
					></span>
				</div>
			</div>
			<div
				v-else-if="status === 'error'"
				class="citizen-notifications__error"
			>
				<p>{{ msg.error }}</p>
				<cdx-button
					class="citizen-notifications__retry"
					@click="load"
				>
					{{ msg.retry }}
				</cdx-button>
			</div>
			<cdx-tabs
				v-else-if="wikis.length > 0"
				v-model:active="activeSource"
				:framed="false"
			>
				<cdx-tab
					name="local"
					:label="msg.sourceLocal"
				>
					<notification-list
						v-if="items.length > 0"
						:items="items"
						@read="onItemRead"
					></notification-list>
					<div
						v-else
						class="citizen-notifications__empty"
					>
						{{ msg.empty }}
					</div>
				</cdx-tab>
				<cdx-tab
					name="foreign"
					:label="msg.sourceForeign"
				>
					<wiki-list
						:wikis="wikis"
						:fetch-wiki="fetchWiki"
					></wiki-list>
				</cdx-tab>
			</cdx-tabs>
			<notification-list
				v-else-if="items.length > 0"
				:items="items"
				@read="onItemRead"
			></notification-list>
			<div
				v-else
				class="citizen-notifications__empty"
			>
				{{ msg.empty }}
			</div>
		</div>

		<footer class="citizen-notifications__footer">
			<a
				class="citizen-notifications__see-all"
				:class="fakeQuietButtonClass"
				:href="urls.all"
			>{{ msg.seeAll }}</a>
			<a
				class="citizen-notifications__prefs"
				:class="fakeIconButtonClass"
				:href="urls.prefs"
				:aria-label="msg.prefs"
				:title="msg.prefs"
			>
				<cdx-icon :icon="icons.cdxIconSettings"></cdx-icon>
			</a>
		</footer>
	</div>
</template>

<script>
const { defineComponent, ref, computed, inject, onMounted } = require( 'vue' );
const { CdxButton, CdxIcon, CdxTab, CdxTabs } = mw.loader.require( 'skins.citizen.notifications.codex' );
const NotificationList = require( './NotificationList.vue' );
const WikiList = require( './WikiList.vue' );
const icons = require( '../icons.json' );

// Links styled as quiet cdx buttons need the fake-button variants.
const FAKE_QUIET_BUTTON_CLASS = [
	'cdx-button',
	'cdx-button--fake-button',
	'cdx-button--fake-button--enabled',
	'cdx-button--weight-quiet'
];
const FAKE_QUIET_ICON_BUTTON_CLASS = FAKE_QUIET_BUTTON_CLASS.concat( [ 'cdx-button--icon-only' ] );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'NotificationsApp',
	components: {
		CdxButton,
		CdxIcon,
		CdxTab,
		CdxTabs,
		NotificationList,
		WikiList
	},
	setup() {
		const source = inject( 'source' );
		// Bridge to the (non-Vue) trigger so it can update the bell badge.
		const onCountsChange = inject( 'onCountsChange', null );

		// Starts in 'loading' so the freshly-mounted panel shows the skeleton
		// immediately, before the first fetch resolves.
		const status = ref( 'loading' ); // 'loading' | 'ready' | 'error'
		const items = ref( [] );
		const counts = ref( { total: 0, local: 0, foreign: 0 } );
		// Other wikis with something waiting. Empty on all but a farm, where it
		// is what makes the source switch appear at all.
		const wikis = ref( [] );
		// Which source the list is showing. `source` is taken by the injected
		// data source, hence the longer name.
		const activeSource = ref( 'local' );

		const msg = {
			title: mw.message( 'citizen-notifications-title' ).text(),
			markAll: mw.message( 'citizen-notifications-mark-all-read' ).text(),
			empty: mw.message( 'citizen-notifications-empty' ).text(),
			error: mw.message( 'citizen-notifications-error' ).text(),
			retry: mw.message( 'citizen-notifications-retry' ).text(),
			seeAll: mw.message( 'citizen-notifications-see-all' ).text(),
			prefs: mw.message( 'citizen-notifications-preferences' ).text(),
			sourceLocal: mw.message( 'citizen-notifications-source-local' ).text(),
			sourceForeign: mw.message( 'citizen-notifications-source-other' ).text()
		};

		const urls = {
			all: mw.util.getUrl( 'Special:Notifications' ),
			prefs: mw.util.getUrl( 'Special:Preferences' ) + '#mw-prefsection-echo'
		};

		// Mark-all clears this wiki's notifications, so it stays out of reach
		// while the other wikis are on screen — nothing there would change.
		const canMarkAll = computed(
			() => activeSource.value === 'local' &&
				items.value.some( ( item ) => !item.read )
		);

		function reportCounts() {
			if ( typeof onCountsChange === 'function' ) {
				onCountsChange( Object.assign( {}, counts.value ) );
			}
		}

		// Recompute counts from the items' current read state — keeps the
		// badge accurate after local mark-read mutations without a refetch.
		// Other wikis are carried through untouched: nothing in this panel can
		// clear them, and dropping them would leave the badge disagreeing with
		// the count the server renders.
		function recountFromItems() {
			const local = items.value.filter( ( item ) => !item.read ).length;
			const foreign = counts.value.foreign;
			counts.value = { total: local + foreign, local: local, foreign: foreign };
			reportCounts();
		}

		const hasLoaded = ref( false );

		function applyResult( result ) {
			items.value = result.items;
			counts.value = result.counts;
			wikis.value = result.wikis || [];
			// A farm user who clears the other wikis elsewhere should not be
			// left looking at a switch with nothing behind it.
			if ( !wikis.value.length ) {
				activeSource.value = 'local';
			}
			hasLoaded.value = true;
			reportCounts();
			// Best-effort: tell Echo the streams were seen so its other surfaces
			// (page-title count, cross-wiki badge) stop flagging them as new. Our
			// bell dot is driven by the unread count, not the seen state, so a
			// failure here is cosmetic to Echo alone — swallow it rather than
			// leak an unhandled rejection.
			source.markSeen( 'all' ).catch( () => {} );
		}

		// First load shows the skeleton.
		function load() {
			status.value = 'loading';
			source.fetch().then( ( result ) => {
				applyResult( result );
				status.value = 'ready';
			} ).catch( () => {
				status.value = 'error';
			} );
		}

		// Reopen: refetch silently so the panel keeps its current content and
		// height instead of flashing back to the skeleton. Falls back to a
		// full load (skeleton) if the first load never succeeded.
		function refresh() {
			if ( !hasLoaded.value ) {
				load();
				return;
			}
			source.fetch().then( applyResult ).catch( () => {} );
		}

		function onItemRead( id ) {
			const item = items.value.find( ( i ) => i.id === id );
			if ( !item || item.read ) {
				return;
			}
			// Optimistic: mark read locally now. The click usually navigates away
			// (NotificationItem follows the notification's primary link), so this
			// POST may be aborted mid-flight — that's fine, the next open's
			// refresh() refetches authoritative state and re-shows it unread if
			// the server never recorded it. Swallow rejections (incl. the abort).
			source.markRead( [ id ] ).catch( () => {} );
			item.read = true;
			recountFromItems();
		}

		function onMarkAll() {
			// Best-effort, like onItemRead: swallow rejections (the next open's
			// refresh() refetches authoritative state).
			source.markAllRead().catch( () => {} );
			items.value.forEach( ( item ) => {
				item.read = true;
			} );
			recountFromItems();
		}

		onMounted( load );

		return {
			status,
			items,
			wikis,
			fetchWiki: ( wiki ) => source.fetchWiki( wiki ),
			activeSource,
			canMarkAll,
			msg,
			urls,
			icons,
			fakeQuietButtonClass: FAKE_QUIET_BUTTON_CLASS,
			fakeIconButtonClass: FAKE_QUIET_ICON_BUTTON_CLASS,
			load,
			onItemRead,
			onMarkAll,
			// eslint-disable-next-line vue/no-unused-properties -- Called externally by notifications.js on reopen
			refresh
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';
@import '../../mixins.less';

.citizen-notifications {
	.mixin-citizen-font-styles( 'small' );

	// Vue panel root mounted inside the dropdown card. Header, filter and
	// footer stay put; only the list scrolls.
	&__panel {
		display: flex;
		flex-direction: column;
		// A stable height band so the loading, empty and populated states
		// share a size (no flash between them), capped so a long list scrolls.
		min-height: ~'min( 20rem, 60vh )';
		max-height: var( --header-card-maxheight );
	}

	&__header {
		display: flex;
		flex-shrink: 0;
		gap: var( --space-sm );
		align-items: center;
		justify-content: space-between;
		padding: var( --space-sm ) var( --space-md );
	}

	&__title {
		margin: 0;
		font-size: var( --font-size-medium );
		font-weight: var( --font-weight-semi-bold );
	}

	// Holds the loading, tabs or error state. The active tab panel scrolls,
	// not this container.
	// Without tabs the body is the scroller; with them, the tab panel is.
	&__body {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	// Source tabs: the bar stays put and the active panel scrolls.
	.cdx-tabs {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;

		// Override default styles
		&:not( .cdx-tabs--framed ) > .cdx-tabs__header {
			margin-inline: 0;
			background-color: transparent;
		}
	}

	.cdx-tabs__header {
		flex-shrink: 0;
	}

	.cdx-tabs__list {
		flex-grow: 1;
	}

	.cdx-tabs__content {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.cdx-tabs__list__item {
		flex-grow: 1;
		padding-block: var( --space-xs );
		font-size: var( --font-size-small );
	}

	&__empty {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: var( --space-sm );
		align-items: center;
		justify-content: center;
		padding: var( --space-xl ) var( --space-md );
		color: var( --color-subtle );
		text-align: center;
	}

	&__footer {
		display: flex;
		flex-shrink: 0;
		gap: var( --space-sm );
		justify-content: space-between;
		padding: var( --space-xs ) var( --space-md );
		border-top: var( --border-subtle );
	}

	&__see-all.cdx-button {
		margin-inline-start: @spacing-horizontal-button * -1;
	}

	// The settings link is styled as an icon button. Core's
	// `a:where( :not( [role='button'] ) ) .cdx-icon:last-child` rule applies
	// trailing-link-icon sizing/padding to it; override so the icon matches the
	// icon-only button (centred, no left padding). The extra :not() lifts this
	// above the core rule's specificity.
	&__prefs .cdx-icon:not( .cdx-thumbnail__placeholder__icon--vue ):last-child {
		width: var( --size-icon-medium, 1.25rem );
		min-width: var( --size-icon-medium, 1.25rem );
		height: var( --size-icon-medium, 1.25rem );
		min-height: var( --size-icon-medium, 1.25rem );
		padding-left: 0;
	}
}
</style>
