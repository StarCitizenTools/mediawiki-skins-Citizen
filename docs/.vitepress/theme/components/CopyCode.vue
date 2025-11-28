<template>
	<div class="copy-code">
		<code>{{ code }}</code>
		<button
			class="copy-btn"
			:title="copied ? 'Copied' : 'Copy to clipboard'"
			@click="copy">
			<span
				v-if="!copied"
				class="icon-copy"
				:style="{ maskImage: `url('${copyIcon}')` }"
			/>
			<span
				v-else
				class="icon-check"
				:style="{ maskImage: `url('${checkIcon}')` }"
			/>
		</button>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { withBase } from 'vitepress';

const props = defineProps<{
  code: string
}>();

const copied = ref( false );
const copyIcon = withBase( '/img/copy.svg' );
const checkIcon = withBase( '/img/check.svg' );

async function copy() {
	const clipboard = navigator.clipboard;

	try {
		if ( !clipboard ) {
			throw new Error( 'Clipboard API not supported' );
		}
		await clipboard.writeText( props.code );
		copied.value = true;
		setTimeout( () => {
			copied.value = false;
		}, 2000 );
	} catch {
		copied.value = false;
	}
}
</script>

<style scoped>
.copy-code {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25rem;
}

.copy-code > code {
  padding: 2px 4px;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--vp-c-text-3);
  transition: opacity 0.25s, color 0.25s;
  padding: 0;
  transform: translateY(2px);
  opacity: 0;
  pointer-events: none;
}

.copy-code:hover .copy-btn,
.copy-code:focus-within .copy-btn {
  opacity: 1;
  pointer-events: auto;
}

.copy-btn:hover {
  color: var(--vp-c-text-1);
}

.icon-copy,
.icon-check {
  display: block;
  width: 100%;
  height: 100%;
  background-color: currentColor;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
}

.icon-check {
  color: var(--vp-c-green-1);
}
</style>
