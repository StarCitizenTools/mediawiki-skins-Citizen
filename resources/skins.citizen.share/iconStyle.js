/**
 * CSS-mask style helpers for the share panel's per-service tile icons.
 *
 * Each share tile shows the service's brand icon in white over the
 * brand-coloured background. The icon comes from one of three sources
 * (data URI, on-wiki File:, or external URL) and is rendered via CSS
 * `mask-image` so a single white background flood can colour any icon.
 *
 * Kept out of App.vue so the component can stay focused on dialog state.
 */

/**
 * @param {string} inner
 * @return {string}
 */
function escapeForCssUrl( inner ) {
	return inner.replace( /\\/g, '\\\\' ).replace( /"/g, '\\"' );
}

/**
 * @param {string} href
 * @return {string}
 */
function cssUrlFunction( href ) {
	return `url("${ escapeForCssUrl( href ) }")`;
}

/**
 * @param {string} raw
 * @return {string}
 */
function stripUrlWrapper( raw ) {
	const trimmed = raw.trim();
	if ( /^url\s*\(/i.test( trimmed ) && trimmed.endsWith( ')' ) ) {
		let inner = trimmed.replace( /^url\s*\(\s*/i, '' ).replace( /\s*\)\s*$/, '' );
		if (
			( inner.startsWith( '"' ) && inner.endsWith( '"' ) ) ||
			( inner.startsWith( '\'' ) && inner.endsWith( '\'' ) )
		) {
			inner = inner.slice( 1, -1 );
		}
		return inner.trim();
	}
	return trimmed;
}

/**
 * @param {Object} service
 * @return {string}
 */
function resolveShareIconHref( service ) {
	if ( typeof service.icon === 'string' && service.icon.trim() !== '' ) {
		return stripUrlWrapper( service.icon );
	}
	if ( typeof service.file === 'string' && service.file.trim() !== '' ) {
		return mw.util.getUrl( 'Special:FilePath/' + service.file.trim() );
	}
	return '';
}

/**
 * Build the inline-style object for a service tile's masked icon.
 *
 * Returns `undefined` when the service has no icon source — callers should
 * skip rendering the icon element entirely in that case.
 *
 * @param {Object} service
 * @return {Object|undefined}
 */
function getShareIconMaskStyle( service ) {
	const href = resolveShareIconHref( service );
	if ( !href ) {
		return undefined;
	}
	const u = cssUrlFunction( href );
	return {
		backgroundColor: '#fff',
		maskImage: u,
		WebkitMaskImage: u,
		maskSize: 'contain',
		maskRepeat: 'no-repeat',
		maskPosition: 'center',
		WebkitMaskSize: 'contain',
		WebkitMaskRepeat: 'no-repeat',
		WebkitMaskPosition: 'center'
	};
}

module.exports = { getShareIconMaskStyle };
