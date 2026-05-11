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
</script>

<template>
	<div class="VersionSwitcher">
		<button
			:id="buttonId"
			class="VPNavBarMenuLink VersionSwitcher__button"
			:aria-expanded="open"
			:aria-controls="menuId"
			aria-haspopup="menu"
			@click="open = !open"
		>
			<span class="VersionSwitcher__label">{{ currentVersion }}</span>
			<span class="VersionSwitcher__caret" aria-hidden="true">▾</span>
		</button>
		<div v-if="open" :id="menuId" class="VersionSwitcher__menu" role="menu">
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
</template>

<style scoped>
.VersionSwitcher {
	position: relative;
	display: inline-flex;
	align-items: center;
}

.VersionSwitcher__button {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	font-size: 14px;
	font-weight: 500;
	color: var(--vp-c-text-1);
	background: transparent;
	border: 0;
	padding: 0 12px;
	height: var(--vp-nav-height);
	cursor: pointer;
}

.VersionSwitcher__button:hover {
	color: var(--vp-c-brand-1);
}

.VersionSwitcher__caret {
	font-size: 10px;
	transform: translateY(1px);
}

.VersionSwitcher__menu {
	position: absolute;
	top: calc(var(--vp-nav-height) - 4px);
	right: 0;
	min-width: 180px;
	background: var(--vp-c-bg-elv);
	border: 1px solid var(--vp-c-divider);
	border-radius: 12px;
	padding: 6px;
	box-shadow: var(--vp-shadow-3);
	z-index: var(--vp-z-index-nav);
}

.VersionSwitcher__item {
	display: flex;
	width: 100%;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	padding: 6px 10px;
	border-radius: 8px;
	font-size: 14px;
	color: var(--vp-c-text-1);
	background: transparent;
	border: 0;
	cursor: pointer;
	text-align: left;
}

.VersionSwitcher__item:hover {
	background: var(--vp-c-default-soft);
	color: var(--vp-c-brand-1);
}

.VersionSwitcher__item--disabled {
	color: var(--vp-c-text-3);
	cursor: not-allowed;
}

.VersionSwitcher__badge {
	font-size: 11px;
	font-weight: 500;
	color: var(--vp-c-text-2);
	background: var(--vp-c-default-soft);
	padding: 2px 6px;
	border-radius: 999px;
}
</style>
