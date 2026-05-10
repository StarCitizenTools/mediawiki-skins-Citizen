<template>
	<div v-if="release">
		<h1 :id="isLatest ? 'latest' : release.tag_name">
			{{ release.tag_name.substring(1) }}
			<Badge v-if="isLatest" type="tip" text="Latest" />
			<a
				class="header-anchor"
				:href="isLatest ? '#latest' : `#${release.tag_name}`"
				:aria-label="`Permalink to &quot;${release.tag_name}&quot;`"
			/>
		</h1>
		<time :datetime="release.published_at!">
			{{ new Date(release.published_at!).toLocaleDateString("en", { dateStyle: "medium" }) }}
		</time>
		<div v-html="renderMarkdown(release.body)" />
		<ContributorList :body="release.body!" />
	</div>
	<div v-else>
		<p>Release not found.</p>
	</div>
</template>

<script setup lang="ts">
import MarkdownIt from "markdown-it";
import { computed } from "vue";
import { data as changelogs } from "../data/changelogs.data";
import { formatChangelog } from "../utils/formatChangelog.ts";
import ContributorList from "./ContributorList.vue";

const { tag } = defineProps<{ tag: string }>();

const md = new MarkdownIt({ html: true });

function renderMarkdown(string: string | null | undefined) {
	return formatChangelog(md, string);
}

const release = computed(() => changelogs.find((r) => r.tag_name === tag));
const latestStableTag = computed(() => {
	const stable = changelogs
		.filter((r) => !r.draft && !r.prerelease)
		.toSorted(
			(a, b) => new Date(b.published_at!).getTime() - new Date(a.published_at!).getTime(),
		);
	return stable[0]?.tag_name;
});
const isLatest = computed(() => latestStableTag.value === tag);
</script>

<style lang="less" scoped>
h1 {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}
</style>
