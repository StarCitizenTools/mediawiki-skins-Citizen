<template>
	<ul class="citizen-notifications__wikis">
		<li
			v-for="wiki in wikis"
			:key="wiki.id"
			class="citizen-notifications__wiki-group"
		>
			<button
				class="citizen-notifications__wiki"
				:aria-expanded="isOpen( wiki ) ? 'true' : 'false'"
				@click="toggle( wiki )"
			>
				<cdx-icon
					class="citizen-notifications__wiki-chevron"
					:icon="isOpen( wiki ) ? icons.cdxIconExpand : icons.cdxIconNext"
				></cdx-icon>
				<span class="citizen-notifications__wiki-name">{{ wiki.name }}</span>
				<span
					v-if="times[ wiki.id ]"
					class="citizen-notifications__wiki-time"
				>{{ times[ wiki.id ] }}</span>
				<span class="citizen-notifications__wiki-dot"></span>
			</button>

			<div
				v-if="isOpen( wiki ) && state( wiki ).status === 'loading'"
				class="citizen-notifications__wiki-status"
				role="status"
			>
				{{ msg.loading }}
			</div>
			<template v-else-if="isOpen( wiki )">
				<notification-list
					v-if="state( wiki ).items.length > 0"
					:items="state( wiki ).items"
				></notification-list>
				<div class="citizen-notifications__wiki-status">
					<span v-if="state( wiki ).status === 'error'">{{ msg.unavailable }}</span>
					<a
						class="citizen-notifications__wiki-open"
						:class="openButtonClass"
						:href="wiki.url"
					>
						<cdx-icon :icon="icons.cdxIconLinkExternal"></cdx-icon>
						{{ openLabel( wiki ) }}
					</a>
				</div>
			</template>
		</li>
	</ul>
</template>

<script>
const { defineComponent, computed, reactive, watch } = require( 'vue' );
const { CdxIcon } = mw.loader.require( 'skins.citizen.notifications.codex' );
const NotificationList = require( './NotificationList.vue' );
const icons = require( '../icons.json' );
const formatRelativeTime = require( '../relativeTime.js' );

// The link out mirrors the panel footer's buttons: a normal-weight framed
// Codex button (fake-button variants since it is an <a>), stretched across
// the closing bar.
const OPEN_BUTTON_CLASS = [
	'cdx-button',
	'cdx-button--fake-button',
	'cdx-button--fake-button--enabled'
];

// @vue/component
module.exports = exports = defineComponent( {
	name: 'WikiList',
	components: { CdxIcon, NotificationList },
	props: {
		wikis: {
			type: Array,
			required: true
		},
		// Returns a promise of { items } for one wiki. Injected rather than
		// imported so this component stays unaware of where they come from.
		fetchWiki: {
			type: Function,
			required: true
		}
	},
	setup( props ) {
		// Per-wiki disclosure state, kept for as long as the panel is mounted so
		// reopening a wiki costs nothing.
		const states = reactive( {} );

		const msg = {
			loading: mw.message( 'citizen-notifications-loading' ).text(),
			unavailable: mw.message( 'citizen-notifications-wiki-unavailable' ).text()
		};

		const times = computed( () => {
			const out = {};
			props.wikis.forEach( ( wiki ) => {
				out[ wiki.id ] = formatRelativeTime( wiki.timestamp );
			} );
			return out;
		} );

		function state( wiki ) {
			return states[ wiki.id ] || { status: 'idle', items: [] };
		}

		// The panel is mounted once and refetched on each open, so a preview
		// kept from a previous open would show what was waiting last time.
		// Watched by roster rather than by array identity: every fetch hands
		// over a fresh array, so watching the array itself would throw away a
		// preview the user is still reading each time the panel reopens.
		watch(
			() => props.wikis.map( ( wiki ) => wiki.id ).join( '|' ),
			() => {
				Object.keys( states ).forEach( ( id ) => delete states[ id ] );
			}
		);

		function isOpen( wiki ) {
			return !!( states[ wiki.id ] && states[ wiki.id ].open );
		}

		function openLabel( wiki ) {
			return mw.message( 'citizen-notifications-wiki-open', wiki.name ).text();
		}

		function toggle( wiki ) {
			const current = states[ wiki.id ];
			if ( current ) {
				// Already fetched once: just flip it, no second request.
				current.open = !current.open;
				return;
			}
			states[ wiki.id ] = { open: true, status: 'loading', items: [] };
			// Wrapped so a constructor that throws on a malformed endpoint
			// lands in the same place as a rejected request.
			Promise.resolve().then( () => props.fetchWiki( wiki ) ).then( ( result ) => {
				// The wikis may have changed while this was in flight, taking
				// this entry with them. Another wiki's slow reply must not
				// resurrect it.
				if ( !states[ wiki.id ] ) {
					return;
				}
				states[ wiki.id ].items = result.items;
				states[ wiki.id ].status = 'ready';
			} ).catch( () => {
				// A farm that shares no login answers with nothing rather than an
				// error, so both land here and offer the wiki itself instead.
				if ( !states[ wiki.id ] ) {
					return;
				}
				states[ wiki.id ].status = 'error';
			} );
		}

		return {
			icons, msg, times, state, isOpen, openLabel, toggle,
			openButtonClass: OPEN_BUTTON_CLASS
		};
	}
} );
</script>

<style lang="less">
@import 'mediawiki.skin.variables.less';

.citizen-notifications {
	&__wikis {
		padding: 0;
		margin: 0;
		list-style: none;
	}

	// The divider belongs between wikis, never after the last one — a trailing
	// line would hang under the end of the list.
	&__wiki-group + &__wiki-group {
		border-top: var( --border-subtle );
	}

	// Deliberately denser than a notification row: this is navigation, not
	// content, and it should not read as something you can act on in place.
	// Sticks to the top of the scroller so you always know whose notifications
	// you are reading, which needs an opaque fill — the card behind it is
	// translucent — and a stacking order above the rows' stretched links.
	&__wiki {
		position: sticky;
		top: 0;
		z-index: 3;
		display: flex;
		gap: var( --space-xs );
		align-items: center;
		width: 100%;
		min-height: @min-size-interactive-touch;
		padding: var( --space-xs ) var( --space-md );
		font-size: var( --font-size-small );
		color: var( --color-emphasized );
		text-align: start;
		cursor: pointer;
		background-color: var( --color-surface-1 );
		border: 0;

		// Only an opened wiki has anything below the row to divide it from;
		// closed, the group divider above does that job.
		&[ aria-expanded='true' ] {
			border-bottom: var( --border-subtle );
		}

		&:hover {
			background-color: var( --color-surface-1--hover );
		}

		// Inset ring, for the reason the notification rows use one: an outward
		// outline is clipped by the scrolling list, and doubly so here, where
		// the row also sits against the top edge while stuck.
		&:focus-visible {
			outline: @outline-base--focus;
			box-shadow: inset 0 0 0 2px var( --outline-color-progressive--focus );
		}
	}

	&__wiki-name {
		overflow: hidden;
		text-overflow: ellipsis;
		font-weight: var( --font-weight-medium );
		white-space: nowrap;
	}

	// Codex icons default to 20px, which overwhelms a row this dense. The box
	// needs sizing as well as the glyph, or it keeps the larger footprint.
	&__wiki-chevron.cdx-icon {
		flex-shrink: 0;
		width: @size-75;
		min-width: @size-75;
		height: @size-75;
		min-height: @size-75;
		color: var( --color-subtle );

		> svg {
			width: @size-75;
			height: @size-75;
		}
	}

	// Same mark the bell wears, at the same end of the row: something is
	// waiting here. Every listed wiki has something, so this reads the row as
	// unread rather than counting it — Echo reports one total across all
	// wikis, never a count each.
	&__wiki-dot {
		flex-shrink: 0;
		width: @size-50;
		height: @size-50;
		background-color: var( --color-progressive );
		border-radius: var( --border-radius-circle );
	}

	&__wiki-time {
		flex-shrink: 0;
		margin-inline-start: auto;
		font-size: var( --font-size-x-small );
		color: var( --color-subtle );
	}

	// With no timestamp to push against, the dot takes the end itself.
	&__wiki-name + &__wiki-dot {
		margin-inline-start: auto;
	}

	// Loading line, and the link out, inside an opened wiki. The closing bar
	// mirrors the panel footer: no top padding and no divider — the framed
	// full-width button carries its own edge.
	&__wiki-status {
		display: flex;
		flex-wrap: wrap;
		gap: var( --space-xs );
		align-items: center;
		justify-content: center;
		padding: 0 var( --space-md ) var( --space-xs );
		font-size: var( --font-size-small );
		color: var( --color-subtle );
		text-align: center;

		// The unavailable note takes its own line above the stretched button.
		> span {
			flex-basis: 100%;
		}
	}

	&__wiki-open {
		flex: 1;
	}
}
</style>
