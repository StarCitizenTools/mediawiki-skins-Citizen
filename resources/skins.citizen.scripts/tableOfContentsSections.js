/**
 * @typedef {Object} Section
 * @property {number} toclevel
 * @property {string} anchor
 * @property {string} line
 * @property {string} number
 * @property {string} index
 * @property {number} byteoffset
 * @property {string} fromtitle
 * @property {boolean} is-parent-section
 * @property {boolean} is-top-level-section
 * @property {Section[]} array-sections
 * @property {string} level
 */

/**
 * Prepares the data for rendering the table of contents,
 * nesting child sections within their parent sections.
 * This should yield the same result as the php function
 * CitizenComponentTableOfContents::getTemplateData(),
 * please make sure to keep them in sync.
 *
 * TODO: CitizenComponentTableOfContents is not implemented as we need to support MW 1.39
 *
 * @param {Section[]} sections
 * @param {number} toclevel
 * @return {Section[]}
 */
function getTableOfContentsSectionsData( sections, toclevel = 1 ) {
	const data = [];
	for ( let i = 0; i < sections.length; i++ ) {
		const section = sections[ i ];
		if ( section.toclevel === toclevel ) {
			const childSections = getTableOfContentsSectionsData(
				sections.slice( i + 1 ),
				toclevel + 1
			);
			section[ 'array-sections' ] = childSections;
			section[ 'is-top-level-section' ] = toclevel === 1;
			section[ 'is-parent-section' ] = childSections.length > 0;
			data.push( section );
		}
		// Child section belongs to a higher parent.
		if ( section.toclevel < toclevel ) {
			return data;
		}
	}

	return data;
}

module.exports = { getTableOfContentsSectionsData };
