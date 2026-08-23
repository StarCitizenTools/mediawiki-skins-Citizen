<template>
	<footer class="citizen-notifications__footer">
		<a
			class="citizen-notifications__footer-history"
			:class="historyClass"
			:href="urls.all"
			:aria-label="msg.seeAll"
			:title="msg.seeAll"
		>
			<cdx-icon :icon="icons.cdxIconHistory"></cdx-icon>
			<template v-if="!hasItems">
				{{ msg.seeAll }}
			</template>
		</a>
		<cdx-button
			v-if="hasItems"
			class="citizen-notifications__footer-clear"
			:disabled="!canClear"
			:title="msg.markAll"
			@click="$emit( 'clear' )"
		>
			<cdx-icon :icon="icons.cdxIconCheckAll"></cdx-icon>
			{{ msg.clearAll }}
		</cdx-button>
		<a
			class="citizen-notifications__footer-prefs"
			:class="fakeIconButtonClass"
			:href="urls.prefs"
			:aria-label="msg.prefs"
			:title="msg.prefs"
		>
			<cdx-icon :icon="icons.cdxIconSettings"></cdx-icon>
		</a>
	</footer>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );
const { CdxButton, CdxIcon } = require( '../../../codex.js' );
const icons = require( '../icons.json' );

// Links styled as normal-weight cdx buttons need the fake-button variants;
// unlike the old quiet footer, no weight modifier — the framed default
// carries the row.
const FAKE_BUTTON_CLASS = [
	'cdx-button',
	'cdx-button--fake-button',
	'cdx-button--fake-button--enabled'
];
const FAKE_ICON_BUTTON_CLASS = FAKE_BUTTON_CLASS.concat( [ 'cdx-button--icon-only' ] );
const HISTORY_EXPANDED_CLASS = FAKE_BUTTON_CLASS.concat(
	[ 'citizen-notifications__footer-history--expanded' ]
);

// @vue/component
module.exports = exports = defineComponent( {
	name: 'PanelFooter',
	components: { CdxButton, CdxIcon },
	props: {
		hasItems: {
			type: Boolean,
			default: false
		},
		canClear: {
			type: Boolean,
			default: false
		}
	},
	emits: [ 'clear' ],
	setup( props ) {
		const msg = {
			clearAll: mw.message( 'citizen-notifications-clear-all' ).text(),
			markAll: mw.message( 'citizen-notifications-mark-all-read' ).text(),
			seeAll: mw.message( 'citizen-notifications-see-all' ).text(),
			prefs: mw.message( 'citizen-notifications-preferences' ).text()
		};
		const urls = {
			all: mw.util.getUrl( 'Special:Notifications' ),
			prefs: mw.util.getUrl( 'Special:Preferences' ) + '#mw-prefsection-echo'
		};
		// With nothing waiting there is no Clear all to share the row with, so
		// the history link takes its place: label out, icon-only trim off.
		const historyClass = computed(
			() => ( props.hasItems ? FAKE_ICON_BUTTON_CLASS : HISTORY_EXPANDED_CLASS )
		);
		return { msg, urls, icons, historyClass, fakeIconButtonClass: FAKE_ICON_BUTTON_CLASS };
	}
} );
</script>

<style lang="less">
.citizen-notifications {
	// Every action here is local-wiki-scoped, so the footer ships with the
	// local view only — the Other-wikis tab renders none. The framed buttons
	// carry their own edges, so the row needs no top border.
	&__footer {
		display: flex;
		flex-shrink: 0;
		gap: var( --space-xs );
		// No top padding: the row hugs the list's bottom edge so the framed
		// buttons read as floating over the notifications.
		padding: 0 var( --space-md ) var( --space-sm );
	}

	&__footer-clear,
	&__footer-history--expanded {
		flex: 1;
	}

	// Core's `a:where( :not( [role='button'] ) ) .cdx-icon:last-child` rule
	// applies trailing-link-icon sizing/padding to the icon links; override so
	// the icon matches the icon-only button (centred, no left padding). The
	// extra :not() lifts this above the core rule's specificity.
	&__footer-history .cdx-icon:not( .cdx-thumbnail__placeholder__icon--vue ):last-child,
	&__footer-prefs .cdx-icon:not( .cdx-thumbnail__placeholder__icon--vue ):last-child {
		width: var( --size-icon-medium, 1.25rem );
		min-width: var( --size-icon-medium, 1.25rem );
		height: var( --size-icon-medium, 1.25rem );
		min-height: var( --size-icon-medium, 1.25rem );
		padding-left: 0;
	}
}
</style>
