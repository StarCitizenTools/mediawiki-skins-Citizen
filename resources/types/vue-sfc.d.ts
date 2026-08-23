// Kept apart from globals.d.ts on purpose: a top-level `import` would turn this
// file into a module, and `declare module '*.vue'` inside a module is a module
// augmentation, which never matches the wildcard.
declare module '*.vue' {
	import type { DefineComponent } from 'vue';
	const component: DefineComponent;
	export default component;
}
