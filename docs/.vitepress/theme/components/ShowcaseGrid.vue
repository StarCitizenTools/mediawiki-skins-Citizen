<template>
	<div class="showcase">
		<div class="showcase-controls">
			<div class="showcase-filter" role="group" aria-label="Filter by topic">
				<button
					type="button"
					:aria-pressed="activeTag === undefined"
					:class="{ 'is-active': activeTag === undefined }"
					@click="activeTag = undefined"
				>
					All {{ data.length }}
				</button>
				<button
					v-for="[slug, label] in tagsWithEntries"
					:key="slug"
					type="button"
					:aria-pressed="activeTag === slug"
					:class="{ 'is-active': activeTag === slug }"
					@click="activeTag = slug"
				>
					{{ label }} {{ countFor(slug) }}
				</button>
			</div>

			<label class="showcase-sort">
				Sort
				<select name="sort" v-model="sortMode" @change="onSortChange">
					<option value="largest">Largest first</option>
					<option value="alpha">A–Z</option>
					<option value="random">Random</option>
				</select>
			</label>
		</div>

		<div ref="grid" class="showcase-grid">
			<a
				v-for="entry in visible"
				:key="entry.url"
				class="showcase-card"
				:href="entry.url"
				target="_blank"
				rel="noopener noreferrer"
			>
				<img
					v-if="entry.shot && !missing.has(entry.url)"
					:src="`${SHOWCASE_MEDIA_BASE}/${entry.shot}`"
					:width="entry.shotW"
					:height="entry.shotH"
					:alt="`The ${entry.name} home page`"
					loading="lazy"
					@error="missing.add(entry.url)"
				/>
				<span v-else class="showcase-card__monogram" aria-hidden="true">
					{{ monogramFor(entry.name) }}
				</span>

				<span class="showcase-card__body">
					<span class="showcase-card__name">{{ entry.name }}</span>
					<span v-if="metaFor(entry)" class="showcase-card__meta">{{
						metaFor(entry)
					}}</span>
					<span class="showcase-card__tags">
						<span v-for="tag in entry.tags" :key="tag" class="showcase-card__tag">
							{{ SHOWCASE_TAGS[tag] }}
						</span>
					</span>
				</span>
			</a>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { SHOWCASE_MEDIA_BASE } from "../../constants.ts";
import { data } from "../data/showcase.data.ts";
import {
	formatArticleCount,
	formatGenerator,
	monogramFor,
	SHOWCASE_TAGS,
	type ShowcaseEntry,
	type ShowcaseTag,
} from "../utils/showcase.ts";

const activeTag = ref<ShowcaseTag>(),
	/** Scopes the mount-time sweep below to this component's own cards. */
	grid = ref<HTMLElement>(),
	/**
	 * Cards whose screenshot did not load, keyed by wiki URL.
	 *
	 * The objects are content-addressed and garbage-collected once a capture
	 * merges, so a page held in a browser or CDN cache can outlive the object it
	 * names. A monogram is an honest tile; a broken-image icon is not.
	 */
	missing = ref(new Set<string>()),
	/** Wiki URLs in shuffled order; empty until the reader picks Random. */
	shuffledUrls = ref<string[]>([]),
	/** Largest-first is the default because it is the order SSR renders. */
	sortMode = ref<"largest" | "alpha" | "random">("largest");

/**
 * Catches the images that had already failed by the time Vue took over.
 *
 * The cards are server-rendered, so `@error` is bound at hydration and not
 * before. An image that 404s ahead of that fires its error event with nothing
 * listening and Vue never replays it, which leaves a broken-image box on the
 * card for as long as the page is open. A 404 from a live CDN is fast, so this
 * is the ordinary path rather than the corner case.
 */
onMounted(() => {
	for (const card of grid.value?.querySelectorAll(".showcase-card") ?? []) {
		const image = card.querySelector("img"),
			url = card.getAttribute("href");

		if (url && image?.complete && image.naturalWidth === 0) {
			missing.value.add(url);
		}
	}
});

function countFor(tag: ShowcaseTag): number {
	return data.filter((entry) => entry.tags.includes(tag)).length;
}

// A chip for a tag nothing carries would always return an empty grid.
const tagsWithEntries = computed(() =>
	Object.entries(SHOWCASE_TAGS).filter(([slug]) => countFor(slug as ShowcaseTag) > 0),
);

/**
 * Fixes a shuffle when the reader asks for one.
 *
 * Held in a ref rather than dealt inside `sorted` so the order stays put for
 * reasons a reader can see. Computed caching happens to give the same result
 * today, but that is incidental: the moment `sorted` gains another dependency
 * — a search box, say — an inline shuffle would re-deal on every keystroke.
 *
 * Client-only. The cards are server-rendered largest-first, and a random order
 * produced during SSR would not survive hydration.
 */
function onSortChange(): void {
	if (sortMode.value !== "random") {
		return;
	}

	const urls = data.map((entry) => entry.url);

	for (let i = urls.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));

		[urls[i], urls[j]] = [urls[j], urls[i]];
	}

	shuffledUrls.value = urls;
}

/** `data` already arrives largest-first, so that mode needs no work. */
const sorted = computed(() => {
		if (sortMode.value === "alpha") {
			return data.toSorted((a, b) => a.name.localeCompare(b.name));
		}

		if (sortMode.value === "random" && shuffledUrls.value.length > 0) {
			const rank = new Map(shuffledUrls.value.map((url, index) => [url, index]));

			return data.toSorted((a, b) => (rank.get(a.url) ?? 0) - (rank.get(b.url) ?? 0));
		}

		return data;
	}),
	visible = computed(() =>
		activeTag.value === undefined
			? sorted.value
			: sorted.value.filter((entry) => entry.tags.includes(activeTag.value!)),
	);

/** Undefined when the wiki has no metadata record, which hides the strip. */
function metaFor(entry: ShowcaseEntry): string | undefined {
	const parts = [
		entry.articles === undefined ? undefined : formatArticleCount(entry.articles),
		entry.lang,
		formatGenerator(entry.generator),
	].filter(Boolean);

	return parts.length > 0 ? parts.join(" · ") : undefined;
}
</script>

<style lang="less" scoped>
.showcase-controls {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 24px;
}

.showcase-sort {
	display: flex;
	align-items: center;
	gap: 8px;
	color: var(--vp-c-text-2);
	font-size: 13px;

	select {
		height: 32px;
		padding: 0 8px;
		border: 1px solid var(--vp-c-divider);
		border-radius: 16px;
		background: var(--vp-c-bg-soft);
		color: var(--vp-c-text-1);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: border-color 0.25s;

		&:hover {
			border-color: var(--vp-c-brand-1);
		}

		// Setting border and background puts the control on the styled paint
		// path, where the browser stops drawing a focus ring of its own.
		&:focus-visible {
			outline: 2px solid var(--vp-c-brand-1);
			outline-offset: 2px;
		}
	}
}

.showcase-filter {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;

	button {
		height: 32px;
		padding: 0 14px;
		border: 1px solid var(--vp-c-divider);
		border-radius: 16px;
		background: transparent;
		color: var(--vp-c-text-2);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition:
			border-color 0.25s,
			color 0.25s;

		&:hover {
			border-color: var(--vp-c-brand-1);
		}

		&.is-active {
			border-color: var(--vp-c-brand-1);
			background: var(--vp-c-brand-soft);
			color: var(--vp-c-brand-1);
			font-weight: 600;
		}
	}
}

.showcase-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 24px;
}

.showcase-card {
	display: flex;
	flex-direction: column;
	border: 1px solid var(--vp-c-divider);
	border-radius: 14px;
	background: var(--vp-c-bg-soft);
	overflow: hidden;
	text-decoration: none !important;
	transition: border-color 0.25s;

	&:hover {
		border-color: var(--vp-c-brand-1);
	}

	img {
		display: block;
		// The page wraps itself in .vp-doc, whose img rule would otherwise put
		// 16px above and below every screenshot, inside the card.
		margin-block: 0;
		width: 100%;
		height: auto;
		aspect-ratio: 16 / 10;
		object-fit: cover;
		object-position: top center;
	}
}

.showcase-card__monogram {
	display: flex;
	align-items: center;
	justify-content: center;
	aspect-ratio: 16 / 10;
	background: var(--vp-c-default-soft);
	color: var(--vp-c-text-2);
	font-size: 32px;
	font-weight: 700;
}

.showcase-card__body {
	display: flex;
	flex-direction: column;
	gap: 6px;
	padding: 14px 16px 16px;
}

.showcase-card__name {
	color: var(--vp-c-text-1);
	font-size: 15px;
	font-weight: 600;
}

.showcase-card__meta {
	color: var(--vp-c-text-2);
	font-size: 13px;
	font-variant-numeric: tabular-nums;
}

.showcase-card__tags {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 4px;
}

.showcase-card__tag {
	padding: 3px 9px;
	border-radius: 10px;
	background: var(--vp-c-brand-soft);
	color: var(--vp-c-brand-1);
	font-size: 12px;
	font-weight: 600;
}
</style>
