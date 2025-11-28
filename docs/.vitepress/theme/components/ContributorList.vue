<template>
	<div v-if="contributors.length > 0" class="contributors">
		<h3>Contributors</h3>
		<ul>
			<li
				v-for="contributor of contributors"
				:key="contributor"
			>
				<a
					:href="`https://github.com/${contributor}`"
					target="_blank"
					:title="`${contributor} profile on GitHub`"
					:aria-label="`${contributor} profile on GitHub`"
				>
					<img
						:src="`https://github.com/${contributor}.png?size=32`"
						:alt="`@${contributor} profile picture`"
						loading="lazy"
						class="avatar"
						@error="addToNonExistent( contributor )"
					>
				</a>
			</li>
		</ul>
		<div class="names">
			{{ contributorsText }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { extractContributors } from '../utils/contributors';

const props = defineProps<{ body: string }>();
const { body } = toRefs( props );

const nonExistent = ref<Set<string>>( new Set() );

const contributors = computed( () => {
	return extractContributors( body.value )
		.filter( user => !nonExistent.value.has( user ) );
} );

const listFormatter = new Intl.ListFormat( 'en', {
	style: 'long',
	type: 'conjunction'
} );

const contributorsText = computed( () => {
	if ( contributors.value.length <= 3 ) {
		return listFormatter.format( contributors.value );
	}

	return listFormatter.format( [
		...contributors.value.slice( 0, 2 ),
		`${contributors.value.length - 2} other contributors`
	] );
} );

function addToNonExistent( user: string ) {
	if ( !nonExistent.value.has( user ) ) {
		nonExistent.value.add( user );
	}
}
</script>

<style lang="less" scoped>
.contributors {
  ul {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    list-style-type: none;
    padding-left: 0;

    li + li {
      margin-top: 0;
    }
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    box-shadow: var(--vp-shadow-1);
    border: 1px solid var(--vp-c-divider);
  }

  .names {
    font-size: 0.875rem;
    color: var(--vp-c-text-2);
  }
}
</style>
