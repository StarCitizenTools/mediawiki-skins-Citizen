<template>
	<ul
		class="citizen-notifications__list"
		:class="{ 'citizen-notifications__list--clearing': clearing }"
	>
		<notification-item
			v-for="( item, index ) in items"
			:key="item.id"
			:item="item"
			:style="{ '--citizen-notification-sweep-delay': sweepDelay( index ) }"
			@read="$emit( 'read', $event )"
		></notification-item>
	</ul>
</template>

<script>
const { defineComponent } = require( 'vue' );
const NotificationItem = require( './NotificationItem.vue' );

// Clear-all sweep choreography: each row starts this much after the one
// above it, capped so a full list clears as fast as a short one. The cap
// and the row duration are mirrored by CLEAR_SWEEP_MS in App.vue.
const SWEEP_STAGGER_MS = 45;
const SWEEP_STAGGER_CAP_MS = 240;

// @vue/component
module.exports = exports = defineComponent( {
	name: 'NotificationList',
	components: {
		NotificationItem
	},
	props: {
		items: {
			type: Array,
			required: true
		},
		// While true, rows play the clear-all sweep (the owner empties the
		// list when the sweep is over).
		clearing: {
			type: Boolean,
			default: false
		}
	},
	emits: [ 'read' ],
	setup() {
		function sweepDelay( index ) {
			return Math.min( index * SWEEP_STAGGER_MS, SWEEP_STAGGER_CAP_MS ) + 'ms';
		}
		return { sweepDelay };
	}
} );
</script>

<style lang="less">
.citizen-notifications__list {
	padding: 0;
	margin: 0;
	list-style: none;

	// Clear all sweeps the rows out toward inline-end, top row first, then
	// collapses them. The owner swaps in the emptied state once the last
	// row is gone; under prefers-reduced-motion the owner skips the sweep
	// entirely, so no reduced variant is needed here.
	&--clearing .citizen-notifications__item {
		overflow: hidden;
		pointer-events: none;
		animation-name: citizen-notifications-sweep;
		animation-duration: 300ms;
		animation-timing-function: cubic-bezier( 0.4, 0, 0.2, 1 );
		animation-delay: var( --citizen-notification-sweep-delay, 0ms );
		animation-fill-mode: both;
	}
}

// CSSJanus does not flip transform values, so RTL mirrors by hand.
[ dir='rtl' ] .citizen-notifications__list--clearing .citizen-notifications__item {
	animation-name: citizen-notifications-sweep-rtl;
}

@keyframes citizen-notifications-sweep {
	0% {
		max-height: 12rem;
		opacity: 1;
		transform: none;
	}

	55% {
		max-height: 12rem;
		opacity: 0;
		transform: translateX( 1.5rem );
	}

	100% {
		max-height: 0;
		padding-block: 0;
		border-width: 0;
		opacity: 0;
		transform: translateX( 1.5rem );
	}
}

@keyframes citizen-notifications-sweep-rtl {
	0% {
		max-height: 12rem;
		opacity: 1;
		transform: none;
	}

	55% {
		max-height: 12rem;
		opacity: 0;
		transform: translateX( -1.5rem );
	}

	100% {
		max-height: 0;
		padding-block: 0;
		border-width: 0;
		opacity: 0;
		transform: translateX( -1.5rem );
	}
}
</style>
