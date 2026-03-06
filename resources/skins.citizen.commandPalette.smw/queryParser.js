/**
 * Parses the user's free text to detect an incomplete SMW condition.
 * Finds the last unclosed `[[` and determines what stage of input the user is in.
 *
 * @param {string} text The free text from the input.
 * @return {{ stage: 'property'|'category'|'value', fragment: string, property?: string }|null}
 *   Parse result, or null if no unclosed condition exists.
 */
function parseIncompleteCondition( text ) {
	// Find the last [[ that has no matching ]]
	let openPos = -1;
	let searchFrom = 0;

	while ( true ) {
		const nextOpen = text.indexOf( '[[', searchFrom );
		if ( nextOpen === -1 ) {
			break;
		}
		const nextClose = text.indexOf( ']]', nextOpen + 2 );
		if ( nextClose === -1 ) {
			openPos = nextOpen;
			break;
		}
		searchFrom = nextClose + 2;
	}

	if ( openPos === -1 ) {
		return null;
	}

	const inner = text.slice( openPos + 2 );

	if ( inner.startsWith( 'Category:' ) ) {
		return { stage: 'category', fragment: inner.slice( 'Category:'.length ) };
	}

	const separatorIndex = inner.indexOf( '::' );
	if ( separatorIndex !== -1 ) {
		return {
			stage: 'value',
			property: inner.slice( 0, separatorIndex ),
			fragment: inner.slice( separatorIndex + 2 )
		};
	}

	return { stage: 'property', fragment: inner };
}

module.exports = parseIncompleteCondition;
