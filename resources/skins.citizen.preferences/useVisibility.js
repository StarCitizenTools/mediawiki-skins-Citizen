const { computed, onMounted, onUnmounted, ref } = require( 'vue' );

/**
 * Tablet breakpoint from Codex design tokens.
 *
 * @see @max-width-breakpoint-tablet = calc( 1120px - 1px )
 */
const TABLET_BREAKPOINT = 1119;

/**
 * Composable that determines whether a preference group should be visible
 * based on its visibility condition and the current theme value.
 *
 * @param {string} condition - Visibility condition:
 *   'always', 'dark-theme', or 'tablet-viewport'
 * @param {import('vue').Ref<string>} themeValue - Reactive current theme value
 * @return {{ isVisible: import('vue').ComputedRef<boolean> }}
 */
function useVisibility( condition, themeValue ) {
	const isDarkScheme = ref( false );
	const isTabletViewport = ref( false );

	let darkMediaQuery = null;
	let tabletMediaQuery = null;
	let darkHandler = null;
	let tabletHandler = null;

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
			case 'dark-theme':
				if ( themeValue.value === 'night' ) {
					return true;
				}
				if ( themeValue.value === 'os' ) {
					return isDarkScheme.value;
				}
				return false;
			case 'tablet-viewport':
				return isTabletViewport.value;
			default:
				return true;
		}
	} );

	return { isVisible };
}

module.exports = useVisibility;
