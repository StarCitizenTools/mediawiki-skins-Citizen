<template>
	<div class="citizen-notifications__panel">
		<header class="citizen-notifications__header">
			<h2 class="citizen-notifications__title">
				{{ msg.title }}
			</h2>
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
					<div class="citizen-notifications__scroll">
						<notification-list
							v-if="items.length > 0"
							:items="items"
							:clearing="clearing"
							@read="onItemRead"
						></notification-list>
						<div
							v-else
							class="citizen-notifications__empty"
						>
							{{ msg.empty }}
						</div>
					</div>
					<panel-footer
						:has-items="items.length > 0"
						:can-clear="canMarkAll"
						@clear="onMarkAll"
					></panel-footer>
				</cdx-tab>
				<cdx-tab
					name="foreign"
					:label="msg.sourceForeign"
				>
					<div class="citizen-notifications__scroll">
						<wiki-list
							:wikis="wikis"
							:fetch-wiki="fetchWiki"
						></wiki-list>
					</div>
				</cdx-tab>
			</cdx-tabs>
			<template v-else>
				<div class="citizen-notifications__scroll">
					<notification-list
						v-if="items.length > 0"
						:items="items"
						:clearing="clearing"
						@read="onItemRead"
					></notification-list>
					<div
						v-else
						class="citizen-notifications__empty"
					>
						{{ msg.empty }}
					</div>
				</div>
				<panel-footer
					:has-items="items.length > 0"
					:can-clear="canMarkAll"
					@clear="onMarkAll"
				></panel-footer>
			</template>
		</div>
	</div>
</template>

<script>
const { defineComponent, ref, computed, inject, onMounted } = require( 'vue' );
const { CdxButton, CdxTab, CdxTabs } = mw.loader.require( 'skins.citizen.notifications.codex' );
const NotificationList = require( './NotificationList.vue' );
const WikiList = require( './WikiList.vue' );
const PanelFooter = require( './PanelFooter.vue' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'NotificationsApp',
	components: {
		CdxButton,
		CdxTab,
		CdxTabs,
		NotificationList,
		WikiList,
		PanelFooter
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

		// True while the clear-all sweep plays; the list empties when it ends.
		const clearing = ref( false );
		// The sweep's pending list swap, so fresher data can cancel it.
		let clearSweepTimer = null;

		const msg = {
			title: mw.message( 'citizen-notifications-title' ).text(),
			empty: mw.message( 'citizen-notifications-empty' ).text(),
			error: mw.message( 'citizen-notifications-error' ).text(),
			retry: mw.message( 'citizen-notifications-retry' ).text(),
			sourceLocal: mw.message( 'citizen-notifications-source-local' ).text(),
			sourceForeign: mw.message( 'citizen-notifications-source-other' ).text()
		};

		// Mark-all clears this wiki's notifications; the other wikis simply
		// have no footer, so there is nothing to gate on the active source.
		const canMarkAll = computed(
			() => !clearing.value && items.value.some( ( item ) => !item.read )
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
			// Server truth supersedes a clear-all sweep still in flight (the
			// panel was reopened mid-sweep): cancel the pending swap so it
			// cannot wipe this fresh list, and stop the sweep so the new rows
			// don't inherit its exit animation.
			if ( clearSweepTimer !== null ) {
				clearTimeout( clearSweepTimer );
				clearSweepTimer = null;
			}
			clearing.value = false;
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
			if ( clearing.value ) {
				return;
			}
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

		// How long the clear-all sweep takes end to end: the last row's capped
		// stagger plus one row's animation (NotificationList.vue owns those
		// numbers; keep the two files in step).
		const CLEAR_SWEEP_MS = 560;

		function onMarkAll() {
			if ( clearing.value ) {
				return;
			}
			// Best-effort, like onItemRead: swallow rejections (the next open's
			// refresh() refetches authoritative state).
			source.markAllRead().catch( () => {} );
			// The badge clears on the click; the rows sweep out and the emptied
			// panel follows — the button promises "Clear all", so unlike a
			// single read row nothing lingers. Skip straight to empty when
			// motion is unwelcome.
			counts.value = {
				total: counts.value.foreign,
				local: 0,
				foreign: counts.value.foreign
			};
			reportCounts();
			if ( window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
				items.value = [];
				return;
			}
			clearing.value = true;
			clearSweepTimer = setTimeout( () => {
				clearSweepTimer = null;
				items.value = [];
				clearing.value = false;
			}, CLEAR_SWEEP_MS );
		}

		onMounted( load );

		return {
			status,
			items,
			clearing,
			wikis,
			fetchWiki: ( wiki ) => source.fetchWiki( wiki ),
			activeSource,
			canMarkAll,
			msg,
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

	// Holds the loading, tabs or error state. Nothing scrolls here: each view
	// brings its own scroller so its footer can stay pinned below it.
	&__body {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
	}

	// The view's list scrolls under its pinned per-view footer.
	&__scroll {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	// Source tabs: the bar stays put and the active panel's scroller scrolls.
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
	}

	// The tab panel passes the height band on to the view inside it, so the
	// scroller can take the space its footer leaves. `v-show` toggles the
	// inline display, so the inactive panel is still hidden.
	.cdx-tab {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
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
}
</style>
