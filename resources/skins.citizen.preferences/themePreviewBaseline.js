/**
 * Identity knobs bridged into the theme-preview token scope
 * (themePreview.less). The ThemePicker republishes their measured
 * baseline as `--citizen-preview-<knob-without-dashes>` custom
 * properties, which the preview scope's knob declarations consume via
 * var() fallback.
 *
 * @type {string[]}
 */
const IDENTITY_KNOBS = [
	'--color-primary-oklch__h',
	'--color-neutral-oklch__h',
	'--color-progressive-oklch__h',
	'--color-progressive-hsl__h',
	'--color-progressive-hsl__s',
	'--color-progressive-hsl__l'
];

let cached = null;

/**
 * Measure the wiki's identity-knob baseline: the values the knobs have
 * WITHOUT the active theme's overrides — i.e. defaults plus any admin
 * rebrand from MediaWiki:Citizen.css. The active theme class is
 * removed for one synchronous computed-style read and restored before
 * the browser can paint, so nothing flickers.
 *
 * @return {Object.<string,string>} knob name -> baseline value
 */
function measureIdentityBaseline() {
	if ( cached ) {
		return cached;
	}
	const html = document.documentElement;
	const themeClass = Array.prototype.find.call(
		html.classList,
		( cls ) => cls.startsWith( 'skin-theme-clientpref-' )
	);
	if ( themeClass ) {
		html.classList.remove( themeClass );
	}
	const baseline = {};
	try {
		const styles = getComputedStyle( html );
		for ( const knob of IDENTITY_KNOBS ) {
			const value = styles.getPropertyValue( knob ).trim();
			if ( value ) {
				baseline[ knob ] = value;
			}
		}
	} finally {
		if ( themeClass ) {
			html.classList.add( themeClass );
		}
	}
	cached = baseline;
	return cached;
}

module.exports = { measureIdentityBaseline, IDENTITY_KNOBS };
