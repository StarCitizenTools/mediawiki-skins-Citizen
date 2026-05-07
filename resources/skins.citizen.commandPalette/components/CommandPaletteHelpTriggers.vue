<template>
	<div class="citizen-command-palette-help__triggers">
		<kbd
			v-for="trigger in sortedTriggers"
			:key="trigger"
			class="citizen-command-palette-help__trigger-chip"
		>{{ trigger }}</kbd>
	</div>
</template>

<script>
const { defineComponent, computed } = require( 'vue' );

// @vue/component
module.exports = exports = defineComponent( {
	name: 'CommandPaletteHelpTriggers',
	compilerOptions: {
		whitespace: 'condense'
	},
	props: {
		triggers: {
			type: Array,
			required: true
		}
	},
	setup( props ) {
		// Single-character aliases (e.g. `#`, `:`) lead, longer canonical
		// triggers (e.g. `/cat:`) follow. Falls back to source order when
		// lengths are equal so author intent is preserved within a tier.
		const sortedTriggers = computed( () => props.triggers.slice().sort(
			( a, b ) => a.length - b.length
		) );

		return {
			sortedTriggers
		};
	}
} );
</script>
