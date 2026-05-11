<script setup lang="ts">
import { computed, onMounted, ref, useId } from "vue";
import { useData, useRoute } from "vitepress";

interface VersionEntry {
	id: string;
	label: string;
	path: string;
}

interface VersionsManifest {
	main: string;
	stable?: string;
	versions: VersionEntry[];
}

const { theme, site } = useData();
const route = useRoute();

const currentVersion = computed<string>(() => {
	const v = (theme.value as { docsVersion?: string }).docsVersion;
	return v && v.length > 0 ? v : "main";
});

const siteRoot = computed<string>(() => {
	const base = site.value.base;
	const version = currentVersion.value;
	if (version === "main") {
		return base;
	}
	const segment = `${version}/`;
	return base.endsWith(segment) ? base.slice(0, -segment.length) : base;
});

function fromSiteRoot(rootRelative: string): string {
	const stripped = rootRelative.startsWith("/") ? rootRelative.slice(1) : rootRelative;
	return `${siteRoot.value}${stripped}`;
}

const manifest = ref<VersionsManifest | undefined>(undefined);
const manifestError = ref(false);
const open = ref(false);
const root = ref<HTMLElement | undefined>(undefined);
const buttonId = useId();
const menuId = useId();

onMounted(async () => {
	try {
		const res = await fetch(fromSiteRoot("/versions.json"), { cache: "no-cache" });
		if (!res.ok) {
			throw new Error(`status ${res.status}`);
		}
		manifest.value = (await res.json()) as VersionsManifest;
	} catch (error) {
		manifestError.value = true;
		console.warn("[VersionSwitcher] failed to load versions.json", error);
	}
});

const entries = computed<VersionEntry[]>(() => {
	if (!manifest.value) {
		return [];
	}
	const mainEntry: VersionEntry = { id: "main", label: "main", path: manifest.value.main };
	return [mainEntry, ...manifest.value.versions];
});

function badgeFor(entry: VersionEntry): string | undefined {
	if (entry.id === currentVersion.value) {
		return "current";
	}
	if (entry.id === "main") {
		return "unreleased";
	}
	if (manifest.value && entry.id === manifest.value.stable) {
		return "stable";
	}
	return undefined;
}

function basePathFor(entry: VersionEntry): string {
	return entry.path.endsWith("/") ? entry.path : `${entry.path}/`;
}

function pathAfterBase(): string {
	const baseAttr = site.value.base;
	const currentPath = route.path;
	return currentPath.startsWith(baseAttr)
		? currentPath.slice(baseAttr.length)
		: currentPath.replace(/^\//, "");
}

async function resolveTarget(targetBase: string, candidate: string): Promise<string> {
	try {
		const res = await fetch(candidate, { method: "HEAD", cache: "no-cache" });
		return res.ok ? candidate : targetBase;
	} catch {
		return targetBase;
	}
}

async function selectVersion(entry: VersionEntry): Promise<void> {
	open.value = false;
	if (entry.id === currentVersion.value) {
		return;
	}
	const targetBase = fromSiteRoot(basePathFor(entry));
	const candidate = `${targetBase}${pathAfterBase()}`;
	globalThis.location.href = await resolveTarget(targetBase, candidate);
}

function onBlur(event: FocusEvent) {
	const next = event.relatedTarget as Node | null;
	if (!root.value || !next || !root.value.contains(next)) {
		open.value = false;
	}
}
</script>

<template>
	<div
		ref="root"
		class="VersionSwitcher"
		@mouseenter="open = true"
		@mouseleave="open = false"
		@focusout="onBlur"
	>
		<button
			:id="buttonId"
			type="button"
			class="VersionSwitcher__button"
			:aria-expanded="open"
			:aria-controls="menuId"
			aria-haspopup="menu"
			@click="open = !open"
		>
			<span class="VersionSwitcher__text">
				<span>{{ currentVersion }}</span>
				<span class="vpi-chevron-down VersionSwitcher__chevron" aria-hidden="true" />
			</span>
		</button>
		<div :id="menuId" class="VersionSwitcher__menu" role="menu">
			<div class="VersionSwitcher__panel">
				<template v-if="manifestError">
					<div
						class="VersionSwitcher__item VersionSwitcher__item--disabled"
						role="menuitem"
						aria-disabled="true"
					>
						Other versions unavailable
					</div>
				</template>
				<template v-else>
					<button
						v-for="entry in entries"
						:key="entry.id"
						type="button"
						class="VersionSwitcher__item"
						role="menuitem"
						:aria-current="entry.id === currentVersion ? 'true' : undefined"
						@click="selectVersion(entry)"
					>
						<span>{{ entry.label }}</span>
						<span v-if="badgeFor(entry)" class="VersionSwitcher__badge">{{
							badgeFor(entry)
						}}</span>
					</button>
				</template>
			</div>
		</div>
	</div>
</template>

<style scoped>
.VersionSwitcher {
	position: relative;
}

.VersionSwitcher:hover .VersionSwitcher__text,
.VersionSwitcher__button:focus-visible .VersionSwitcher__text {
	color: var(--vp-c-text-2);
}

.VersionSwitcher__button {
	display: flex;
	align-items: center;
	padding: 0 12px;
	height: var(--vp-nav-height);
	color: var(--vp-c-text-1);
	background: transparent;
	border: 0;
	cursor: pointer;
	transition: color 0.5s;
}

.VersionSwitcher__text {
	display: flex;
	align-items: center;
	line-height: var(--vp-nav-height);
	font-size: 14px;
	font-weight: 500;
	color: var(--vp-c-text-1);
	transition: color 0.25s;
}

.VersionSwitcher__chevron {
	margin-left: 4px;
	font-size: 14px;
}

.VersionSwitcher__menu {
	position: absolute;
	top: calc(var(--vp-nav-height) / 2 + 20px);
	right: 0;
	opacity: 0;
	visibility: hidden;
	transition:
		opacity 0.25s,
		visibility 0.25s,
		transform 0.25s;
}

.VersionSwitcher:hover .VersionSwitcher__menu,
.VersionSwitcher__button[aria-expanded="true"] + .VersionSwitcher__menu {
	opacity: 1;
	visibility: visible;
}

.VersionSwitcher__panel {
	min-width: 192px;
	padding: 12px;
	border: 1px solid var(--vp-c-divider);
	border-radius: 12px;
	background-color: var(--vp-c-bg-elv);
	box-shadow: var(--vp-shadow-3);
	transition: background-color 0.5s;
}

.VersionSwitcher__item {
	display: flex;
	width: 100%;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	padding: 0 12px;
	line-height: 32px;
	border-radius: 6px;
	font-size: 14px;
	font-weight: 500;
	color: var(--vp-c-text-1);
	background: transparent;
	border: 0;
	cursor: pointer;
	text-align: left;
	white-space: nowrap;
	transition:
		background-color 0.25s,
		color 0.25s;
}

.VersionSwitcher__item:hover {
	background-color: var(--vp-c-default-soft);
	color: var(--vp-c-brand-1);
}

.VersionSwitcher__item[aria-current="true"] {
	color: var(--vp-c-brand-1);
}

.VersionSwitcher__item--disabled {
	color: var(--vp-c-text-3);
	cursor: not-allowed;
}

.VersionSwitcher__item--disabled:hover {
	background-color: transparent;
	color: var(--vp-c-text-3);
}

.VersionSwitcher__badge {
	font-size: 11px;
	font-weight: 500;
	color: var(--vp-c-text-2);
	background: var(--vp-c-default-soft);
	padding: 2px 6px;
	border-radius: 999px;
	line-height: 1;
}
</style>
