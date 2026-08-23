<template>
	<div
		class="citizen-notifications__panel"
		:class="{ 'citizen-notifications__panel--loading': status === 'loading' }"
	>
		<header class="citizen-notifications__header">
			<h2 class="citizen-notifications__title">
				{{ msg.title }}
			</h2>
		</header>

		<div class="citizen-notifications__body">
			<template v-if="status === 'loading'">
				<div
					class="citizen-notifications__placeholder-body"
					role="status"
					aria-busy="true"
				>
					<div
						v-for="n in placeholderRows"
						:key="n"
						class="citizen-notifications__placeholder-item"
					>
						<span class="citizen-notifications__placeholder-icon"></span>
						<span
							v-for="variant in [ 'title', 'meta' ]"
							:key="variant"
							class="citizen-notifications__placeholder-line"
							:class="'citizen-notifications__placeholder-line--' + variant"
						></span>
					</div>
				</div>
				<!-- The footer is the same with nothing waiting as it is while
				waiting, so rendering it here keeps it from popping in when the
				fetch lands. -->
				<panel-footer
					:has-items="false"
					:can-clear="false"
				></panel-footer>
			</template>
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
const { CdxButton, CdxTab, CdxTabs } = require( '../../../codex.js' );
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
		// Unread count the server rendered onto the bell; null when unknown
		// (markup cached before the attribute existed).
		const initialCount = inject( 'initialCount', null );

		// Rows the skeleton previews at most. Keep in step with
		// NOTIFICATIONS_PLACEHOLDER_ROWS in includes/Hooks/SkinHooks.php, which
		// sizes the server placeholder this one takes over from.
		const PLACEHOLDER_ROWS = 5;
		const placeholderRows = initialCount > 0 ?
			Math.min( initialCount, PLACEHOLDER_ROWS ) :
			PLACEHOLDER_ROWS;

		// A server-rendered zero is a fact, not a guess: the panel opens
		// straight into its empty state and the first fetch confirms it in the
		// background. Any other count starts on the skeleton.
		const seededEmpty = initialCount === 0;

		const status = ref( seededEmpty ? 'ready' : 'loading' ); // 'loading' | 'ready' | 'error'
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

		// Whether the panel is showing something legitimate. Seeded true by a
		// server-confirmed empty state, so a failed first fetch leaves "nothing
		// waiting" on screen rather than replacing a true answer with an error.
		const hasLoaded = ref( seededEmpty );
		// True while a fetch is outstanding, so a hover-mount immediately
		// followed by a click rides the first request instead of issuing a
		// second one.
		let fetching = false;

		// How far Echo's "seen" marker reaches, and the newest thing waiting
		// behind it, both unix seconds from the last fetch. Marking seen is
		// only worth a request when the second is past the first.
		let seenTime = 0;
		// Null until a fetch answers, and that is not the same as nothing
		// waiting: the trigger marks seen as soon as the panel mounts, which is
		// before the panel's own first fetch can possibly have landed. Reading
		// that as "nothing waiting" would drop the marker for the whole visit.
		// A server-confirmed zero is the one case we can answer up front.
		let newestWaiting = seededEmpty ? 0 : null;
		// True while a mark-seen request is outstanding.
		let markingSeen = false;

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
			// Never backwards. A refresh issued before the marker was set comes
			// back carrying the older value, and adopting it would cost a
			// redundant mark on the next open. Echo has no way to move the
			// marker back, so the later of the two is always the truth.
			seenTime = Math.max( seenTime, result.seenTime || 0 );
			newestWaiting = result.newestWaiting || 0;
			hasLoaded.value = true;
			reportCounts();
		}

		/**
		 * Tell Echo the streams were seen, so its other surfaces (page-title
		 * count, cross-wiki badge) stop flagging them as new.
		 *
		 * Called by the trigger when the dropdown opens rather than from the
		 * fetch: the panel now mounts on hover, and a pointer passing over the
		 * bell must not clear the streams. Best-effort — our bell dot is driven
		 * by the unread count, not the seen state, so a failure here is
		 * cosmetic to Echo alone.
		 */
		function markSeen() {
			// Nothing waiting, or the marker already reaches past it: the
			// request would set the marker to a later time that no notification
			// is behind, which changes nothing anyone can observe. Reopening a
			// panel therefore costs one request, not two.
			//
			// The figures come from the last completed fetch, not the refresh
			// the same open just started, so a notification arriving in that
			// window is not counted until the following open. It can only
			// delay the decision, never the effect: Echo marks seen up to the
			// server's clock rather than up to a notification, so a call made
			// here covers whatever the refresh is about to bring anyway. The
			// worst case is Echo's highlight surviving one extra open, which
			// the next one clears.
			// One in flight is enough: Echo marks up to its own clock, so the
			// call already on its way covers anything a second would. Without
			// this a close-and-reopen before the first lands pays twice, which
			// is the cost this whole guard exists to avoid.
			if ( markingSeen ) {
				return;
			}
			if ( newestWaiting !== null && ( !newestWaiting || seenTime >= newestWaiting ) ) {
				return;
			}
			markingSeen = true;
			source.markSeen( 'all' ).then( ( marked ) => {
				markingSeen = false;
				// Carry Echo's own marker forward rather than a local clock, so
				// a skewed client cannot leave this permanently re-marking or
				// permanently skipping. Forward only for the same reason as
				// applyResult, though the guard above is what actually rules
				// out the reordering — nothing can reach this with two answers
				// in flight, so treat it as holding the invariant rather than
				// as a live defence.
				if ( marked ) {
					seenTime = Math.max( seenTime, marked );
				}
			} ).catch( () => {
				// Let the next open try again rather than wedging the guard.
				markingSeen = false;
			} );
		}

		// Fetch, showing the skeleton only when there is nothing legitimate on
		// screen to keep. A reopen therefore holds its content and height
		// instead of flashing back to the skeleton, and a seeded empty state
		// stays put while the first fetch confirms it.
		function load() {
			if ( fetching ) {
				return;
			}
			if ( status.value !== 'ready' ) {
				status.value = 'loading';
			}
			fetching = true;
			source.fetch().then( ( result ) => {
				fetching = false;
				applyResult( result );
				status.value = 'ready';
			} ).catch( () => {
				fetching = false;
				// A refresh that fails must not blank a populated panel; only
				// surface the error when there is nothing to fall back on.
				if ( !hasLoaded.value ) {
					status.value = 'error';
				}
			} );
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
			placeholderRows,
			fetchWiki: ( wiki ) => source.fetchWiki( wiki ),
			activeSource,
			canMarkAll,
			msg,
			load,
			onItemRead,
			onMarkAll,
			// eslint-disable-next-line vue/no-unused-properties -- Called externally by notifications.js on reopen
			refresh: load,
			// eslint-disable-next-line vue/no-unused-properties -- Called externally by notifications.js when the dropdown opens
			markSeen
		};
	}
} );
</script>

<style lang="less">
// The dropdown shell — card, placeholder frame, empty and error states — is
// styled in skins.citizen.styles/components/Notifications.less, which is always
// loaded so the server-rendered placeholder is styled before this module
// arrives. The loading state below reuses those placeholder classes, so both
// the pre-mount and fetching states are one rule set.
.citizen-notifications {
	// Vue panel root mounted inside the dropdown card. Header, filter and
	// footer stay put; only the list scrolls.
	&__panel {
		display: flex;
		flex-direction: column;
		// A stable height band so the loading, empty and populated states
		// share a size (no flash between them), capped so a long list scrolls.
		// Keep in step with `__placeholder` in Notifications.less.
		min-height: ~'min( 20rem, 60vh )';
		max-height: var( --header-card-maxheight );

		// While fetching, stand at the band's floor rather than letting the
		// preview rows set the height: `min-height` caps nothing, so five rows
		// would push the panel past the size it is about to resolve into. The
		// rows clip instead, and the open height never changes under the user.
		&--loading {
			height: ~'min( 20rem, 60vh )';
		}
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
}
</style>
