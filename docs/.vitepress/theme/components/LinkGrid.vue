<template>
	<div class="link-grid">
		<slot />
	</div>
</template>

<style scoped>
.link-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 1rem;
	margin-top: 1rem;
}
</style>
