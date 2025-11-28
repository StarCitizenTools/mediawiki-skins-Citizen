<template>
	<a
		:href="href"
		class="link-card"
		:target="target"
		:rel="target === '_blank' ? 'noopener noreferrer' : undefined">
		<div class="link-card-content">
			<div class="title">
				{{ title }}
			</div>
			<div v-if="$slots.default" class="description">
				<slot />
			</div>
			<div v-else class="url">
				{{ href }}
			</div>
		</div>
	</a>
</template>

<script setup lang="ts">
withDefaults( defineProps<{
	href: string
	title: string
	target?: string
}>(), {
	target: '_blank'
} );
</script>

<style scoped>
.link-card {
	display: block;
	border: 1px solid var(--vp-c-bg-soft);
	border-radius: 12px;
	height: 100%;
	background-color: var(--vp-c-bg-soft);
	transition: border-color 0.25s, background-color 0.25s;
	text-decoration: none !important;
}

.link-card:hover {
	border-color: var(--vp-c-brand-1);
}

.link-card-content {
	padding: 20px;
	height: 100%;
	display: flex;
	flex-direction: column;
}

.title {
	line-height: 24px;
	font-size: 16px;
	font-weight: 600;
	color: var(--vp-c-text-1);
}

.description {
	flex-grow: 1;
	padding-top: 8px;
	line-height: 24px;
	font-size: 14px;
	font-weight: 500;
	color: var(--vp-c-text-2);
}

.url {
	flex-grow: 1;
	padding-top: 8px;
	line-height: 24px;
	font-size: 12px;
	font-weight: 500;
	color: var(--vp-c-text-2);
	word-break: break-all;
}
</style>
