<template>
	<ul class="citizen-notifications__list">
		<notification-item
			v-for="item in items"
			:key="item.id"
			:item="item"
			@read="$emit( 'read', $event )"
		></notification-item>
	</ul>
</template>

<script>
const { defineComponent } = require( 'vue' );
const NotificationItem = require( './NotificationItem.vue' );

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
		}
	},
	emits: [ 'read' ]
} );
</script>

<style lang="less">
.citizen-notifications__list {
	padding: 0;
	margin: 0;
	list-style: none;
}
</style>
