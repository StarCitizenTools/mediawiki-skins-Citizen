/**
 * A mode or command's help as detail-panel data: its icon, name and short
 * description as the header, then its triggers and long description.
 *
 * @param {import('../types.js').PaletteHandler} handler
 * @return {import('../types.js').CommandPaletteItemDetail}
 */
function modeHelpDetail( handler ) {
	const pairs = [];
	const triggers = Array.isArray( handler.triggers ) ? handler.triggers : [];
	if ( triggers.length > 0 ) {
		pairs.push( {
			key: 'triggers',
			label: mw.message( 'citizen-command-palette-help-section-triggers' ).text(),
			// Single-character aliases lead and canonical triggers follow; the
			// sort is stable, so source order holds within a length.
			keys: triggers.slice().sort( ( a, b ) => a.length - b.length )
		} );
	}
	const descriptionKey = handler.help && handler.help.description;
	if ( descriptionKey ) {
		pairs.push( {
			key: 'description',
			label: mw.message( 'citizen-command-palette-help-section-description' ).text(),
			// eslint-disable-next-line mediawiki/msg-doc -- the key is whichever help.description the handler declares
			html: mw.message( descriptionKey ).parse()
		} );
	}
	return {
		header: {
			icon: 'icon' in handler ? handler.icon : undefined,
			label: handler.label || handler.id,
			description: handler.description
		},
		pairs
	};
}

module.exports = modeHelpDetail;
