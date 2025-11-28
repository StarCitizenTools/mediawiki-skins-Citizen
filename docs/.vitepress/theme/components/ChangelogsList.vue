<template>
	<div
		v-for="( release, index ) of changelogs"
		:key="release.tag_name"
	>
		<h2 :id="index === 0 ? 'latest' : release.tag_name">
			<a
				:href="withBase( `/changelogs/${release.tag_name}` )"
			>
				{{ release.tag_name.substring( 1 ) }}
			</a>
			<Badge
				v-if="index === 0"
				type="tip"
				text="Latest" />
			<a
				class="header-anchor"
				:href="index === 0 ? '#latest' : `#${release.tag_name}`"
				:aria-label="`Permalink to &quot;${release.tag_name}&quot;`"
			/>
		</h2>
		<time :datetime="release.published_at!">
			{{ dateFormatter.format( new Date( release.published_at! ) ) }}
		</time>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div v-html="renderMarkdown( release.body )" />
		<ContributorList
			:body="release.body!"
			:author="release.author.login"
			:tag="release.tag_name"
		/>
	</div>
</template>

<script setup lang="ts">
import { withBase } from 'vitepress';
import MarkdownIt from 'markdown-it';
import { data as changelogs } from '../data/changelogs.data';
import { formatChangelog } from '../utils/formatChangelog.ts';
import ContributorList from './ContributorList.vue';
import { GITHUB_OWNER, GITHUB_REPO } from '../../constants';

const md = new MarkdownIt( { html: true } );

function renderMarkdown( string: string | null | undefined ) {
	const pre = ( string ?? '' ).replace(
		`Check out the [past release notes](https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases) if you’re upgrading from an earlier version. `,
		''
	);
	return formatChangelog( md, pre );
}

const dateFormatter = new Intl.DateTimeFormat( 'en', {
	dateStyle: 'medium'
} );
</script>

<style lang="less" scoped>
h2 {
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

time {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
