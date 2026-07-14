const { computed, onMounted, onUnmounted, ref, watch } = require( 'vue' );

/**
 * Tablet breakpoint from Codex design tokens.
 *
 * @see @max-width-breakpoint-tablet = calc( 1120px - 1px )
 */
const TABLET_BREAKPOINT = 1119;

/**
 * Composable that determines whether a preference group should be visible
 * based on its visibility condition.
 *
 * The `dark-theme` condition derives from the document's computed
 * `color-scheme` rather than from specific theme values, so it works for
 * any theme. The `themeValue` ref is watched to re-resolve the scheme
 * whenever the theme changes.
 *
 * @param {string} condition - Visibility condition:
 *   'always', 'dark-theme', or 'tablet-viewport'
 * @param {import('vue').Ref<string>} themeValue - Reactive current theme value
 * @return {{ isVisible: import('vue').ComputedRef<boolean> }}
 */
function useVisibility( condition, themeValue ) {
	const isDarkScheme = ref( false );
	const isTabletViewport = ref( false );
	const rootColorScheme = ref( 'light' );

	let darkMediaQuery = null;
	let tabletMediaQuery = null;
	let darkHandler = null;
	let tabletHandler = null;

	/**
	 * The dark-theme condition resolves from the document's computed
	 * `color-scheme` — set by both token pipelines and by any custom
	 * theme following the theme contract — so it holds for themes this
	 * module has never heard of.
	 */
	function readRootColorScheme() {
		rootColorScheme.value =
			window.getComputedStyle( document.documentElement ).colorScheme || 'light';
	}

	if ( condition === 'dark-theme' ) {
		readRootColorScheme();
		// Theme switches swap the :root class before themeValue updates
		// (App.vue setValue), so the computed style is fresh when this
		// watcher runs.
		watch( themeValue, readRootColorScheme );
	}

	onMounted( () => {
		if ( condition === 'dark-theme' ) {
			darkMediaQuery = window.matchMedia( '(prefers-color-scheme: dark)' );
			isDarkScheme.value = darkMediaQuery.matches;
			darkHandler = ( e ) => {
				isDarkScheme.value = e.matches;
			};
			darkMediaQuery.addEventListener( 'change', darkHandler );
		}

		if ( condition === 'tablet-viewport' ) {
			tabletMediaQuery = window.matchMedia( `(max-width: ${ TABLET_BREAKPOINT }px)` );
			isTabletViewport.value = tabletMediaQuery.matches;
			tabletHandler = ( e ) => {
				isTabletViewport.value = e.matches;
			};
			tabletMediaQuery.addEventListener( 'change', tabletHandler );
		}
	} );

	onUnmounted( () => {
		if ( darkMediaQuery && darkHandler ) {
			darkMediaQuery.removeEventListener( 'change', darkHandler );
		}
		if ( tabletMediaQuery && tabletHandler ) {
			tabletMediaQuery.removeEventListener( 'change', tabletHandler );
		}
		darkMediaQuery = null;
		tabletMediaQuery = null;
	} );

	const isVisible = computed( () => {
		switch ( condition ) {
			case 'dark-theme': {
				const schemes = rootColorScheme.value.split( /\s+/ );
				if ( !schemes.includes( 'dark' ) ) {
					return false;
				}
				// 'light dark' — the OS decides.
				return schemes.includes( 'light' ) ? isDarkScheme.value : true;
			}
			case 'tablet-viewport':
				return isTabletViewport.value;
			default:
				return true;
		}
	} );

	return { isVisible };
}

module.exports = useVisibility;
