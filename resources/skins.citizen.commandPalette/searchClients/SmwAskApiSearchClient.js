/**
 * SMW Ask API search client implementation for the command palette
 *
 * @module SmwAskApiSearchClient
 */

const { CitizenCommandPaletteSearchClient, CommandPaletteSearchResponse, AbortableSearchFetch } = require( '../types.js' );
const fetchJson = require( '../utils/fetch.js' );
const { cdxIconArticle, cdxIconEdit } = require( '../icons.json' );

const config = require( '../config.json' );

/**
 * Helper method to get the first string value.
 * SMW return can be empty, string, array, undefined, null.
 *
 * @param {*} s
 * @return {string|undefined}
 */
function getFirstString( s ) {
	if ( s === null || s === undefined || s.length === 0 ) {
		return undefined;
	}
	if ( typeof s === 'string' ) {
		return s;
	}
	if ( Array.isArray( s ) ) {
		for ( let i = 0; i < s.length; i++ ) {
			const result = getFirstString( s[ i ] );
			if ( result !== undefined ) {
				return result;
			}
		}
	}
	return undefined;
}

/**
 * Extract a multi-language text value following user language preference.
 * Language preference order: user lang -> English -> first result.
 *
 * @param {Array} items - Array of multi-lang text objects from SMW printouts
 * @return {string}
 */
function getMultiLangText( items ) {
	if ( !items || !items.length ) {
		return '';
	}

	if ( items[ 0 ][ 'Language code' ] && items[ 0 ].Text &&
		items[ 0 ].Text.item && items[ 0 ].Text.item.length ) {
		const userLang = mw.config.get( 'wgUserLanguage' );
		let textUserLang = '';
		let textEN = '';

		for ( const text of items ) {
			if ( text[ 'Language code' ].item[ 0 ] === userLang ) {
				textUserLang = text.Text.item[ 0 ];
			}
			if ( text[ 'Language code' ].item[ 0 ] === 'en' ) {
				textEN = text.Text.item[ 0 ];
			}
		}

		if ( textUserLang !== '' ) {
			return textUserLang;
		}
		if ( textEN !== '' ) {
			return textEN;
		}
		return items[ 0 ].Text.item[ 0 ];
	}

	const first = getFirstString( items );
	return first !== undefined ? first : '';
}

/**
 * Build the SMW ask query URL from the user's search input.
 *
 * @param {string} input - The raw search input from the user
 * @return {string} The full API URL
 */
function buildAskUrl( input ) {
	const searchApiUrl = config.wgScriptPath + '/api.php';
	const maxResults = config.wgCitizenMaxSearchResults;
	const useCompoundQuery = config.wgCitizenSearchSmwApiAction === 'compoundquery';

	let askQuery = config.wgCitizenSearchSmwAskApiQueryTemplate;

	// Normalize standard ask-queries if compoundquery is enabled
	if ( useCompoundQuery && !askQuery.includes( ';' ) ) {
		askQuery = askQuery.replaceAll( '|', ';' );
	}

	// Detect direct inserted UUID patterns
	const uuidRegex = /([a-f0-9]{8})(_|-| |){1}([a-f0-9]{4})(_|-| |){1}([a-f0-9]{4})(_|-| |){1}([a-f0-9]{4})(_|-| |){1}([a-f0-9]{12})/gm;
	const matches = input.match( uuidRegex );

	if ( matches && matches.length ) {
		let uuidQuery = '';
		for ( const match of matches ) {
			uuidQuery += '[[HasUuid::' + match.replace( uuidRegex, '$1-$3-$5-$7-$9' ) + ']]OR';
		}
		uuidQuery = uuidQuery.replace( /OR+$/, '' );

		if ( useCompoundQuery ) {
			askQuery = askQuery.split( '|' )[ 0 ];
			askQuery = askQuery.replace( askQuery.split( ';' )[ 0 ], uuidQuery );
			askQuery = askQuery.replace( /;?limit=[0-9]+/, '' );
		} else {
			askQuery = askQuery.replace( askQuery.split( '|?' )[ 0 ], uuidQuery );
		}
	} else {
		// Namespace filtering
		if ( input.includes( ':' ) ) {
			let namespace = input.split( ':' )[ 0 ];
			if ( namespace === 'Category' ) {
				namespace = ':' + namespace;
			}
			input = input.split( ':' )[ 1 ];

			if ( useCompoundQuery ) {
				let res = '';
				for ( const subquery of askQuery.split( '|' ) ) {
					if ( subquery.includes( '[[' ) ) {
						res += '[[' + namespace + ':+]]' + subquery + '|';
					}
				}
				res = res.replace( /\|+$/, '' );
				askQuery = res;
			} else {
				askQuery = '[[' + namespace + ':+]]' + askQuery;
			}
		}

		// Replace variables with user input
		askQuery = askQuery.replaceAll( '${input}', input )
			.replaceAll( '${input_lowercase}', input.toLowerCase() )
			.replaceAll( '${input_normalized}', input.toLowerCase().replace( /[^0-9a-z]/gi, '' ) );

		// Handle tokenized normalized input
		if ( askQuery.includes( '${input_normalized_tokenized}' ) ) {
			askQuery = askQuery.replace(
				/(\[\[[\s]*[^\s\[]+[\s]*::[^\[]*)\${input_normalized_tokenized}([\s\S^\]]*\]\])/gm,
				( match, pre, post ) => {
					let res = '';
					for ( const token of input.split( ' ' ) ) {
						if ( token !== '' ) {
							res += pre + token.toLowerCase().replace( /[^0-9a-z]/gi, '' ) + post;
						}
					}
					return res;
				}
			);
		}
	}

	// Ensure limit is set
	if ( useCompoundQuery ) {
		let askQueryWithLimits = '';
		for ( let subquery of askQuery.split( '|' ) ) {
			if ( subquery.includes( '[[' ) && !subquery.includes( ';limit=' ) ) {
				subquery += ';limit=' + maxResults;
			}
			askQueryWithLimits += subquery + '|';
		}
		askQuery = askQueryWithLimits.replace( /\|+$/, '' );
	} else if ( !askQuery.includes( '|limit=' ) ) {
		askQuery += '|limit=' + maxResults;
	}

	const params = new URLSearchParams( {
		format: 'json',
		action: config.wgCitizenSearchSmwApiAction,
		query: askQuery
	} );

	return `${ searchApiUrl }?${ params.toString() }`;
}

/**
 * @class
 * @implements {CitizenCommandPaletteSearchClient}
 */
class SmwAskApiSearchClient {

	constructor() {
		this.editMessage = mw.msg( 'action-edit' );
	}

	/**
	 * Get the display title with optional type/category suffix.
	 *
	 * @private
	 * @param {Object} item - SMW result item
	 * @return {string}
	 */
	getDisplayTitle( item ) {
		let displaytitle = '';
		let categoryOrType = '';

		if ( item.printouts.type && item.printouts.type.length ) {
			categoryOrType = getMultiLangText( item.printouts.type );
		} else if ( item.type && item.type !== '' ) {
			categoryOrType = item.type;
		} else {
			categoryOrType = item.fulltext.includes( ':' ) ? item.fulltext.split( ':' )[ 0 ] : '';
		}

		if ( item.printouts.displaytitle && item.printouts.displaytitle.length ) {
			displaytitle = getMultiLangText( item.printouts.displaytitle );
		}
		if ( displaytitle === '' ) {
			if ( item.displaytitle && item.displaytitle !== '' ) {
				displaytitle = item.displaytitle;
			} else {
				displaytitle = item.fulltext;
			}
		}

		if ( categoryOrType !== '' ) {
			displaytitle += ' (' + categoryOrType + ')';
		}

		return displaytitle;
	}

	/**
	 * Get the description (multi-lang aware).
	 *
	 * @private
	 * @param {Object} item - SMW result item
	 * @return {string|undefined}
	 */
	getDescription( item ) {
		if ( item.printouts.desc && item.printouts.desc.length ) {
			const desc = getMultiLangText( item.printouts.desc );
			return desc || undefined;
		}
		return undefined;
	}

	/**
	 * Get thumbnail from printouts.
	 *
	 * @private
	 * @param {Object} item - SMW result item
	 * @return {Object|undefined}
	 */
	getThumbnail( item ) {
		if ( item.printouts.thumbnail && item.printouts.thumbnail.length ) {
			const imgTitle = item.printouts.thumbnail[ 0 ].fulltext;
			return {
				url: `${ config.wgScriptPath }/index.php?title=Special:Redirect/file/${ imgTitle }&width=200&height=200`,
				width: 200,
				height: 200
			};
		}
		return undefined;
	}

	/**
	 * Adapts the SMW API response to the CommandPaletteSearchResponse format.
	 *
	 * @private
	 * @param {string} query
	 * @param {Object} response
	 * @param {boolean} showDescription
	 * @return {CommandPaletteSearchResponse}
	 */
	adaptApiResponse( query, response, showDescription ) {
		if ( !response.query || !response.query.results ) {
			return { query, results: [] };
		}

		const data = Object.values( response.query.results );

		const results = data.map( ( item ) => {
			const key = item.fulltext.replace( / /g, '_' );
			const label = this.getDisplayTitle( item );
			return {
				id: `citizen-command-palette-item-page-${ key }`,
				type: 'page',
				label: label,
				description: showDescription ? this.getDescription( item ) : undefined,
				url: mw.util.getUrl( item.fulltext ),
				thumbnail: this.getThumbnail( item ),
				thumbnailIcon: cdxIconArticle,
				actions: [
					{
						id: 'edit',
						label: this.editMessage,
						icon: cdxIconEdit,
						url: mw.util.getUrl( item.fulltext, { action: 'edit' } )
					}
				],
				highlightQuery: true
			};
		} );

		// Rank results where title length is closer to query length higher
		results.sort( ( a, b ) => query.length / b.label.length - query.length / a.label.length );

		return {
			query,
			results: results.slice( 0, config.wgCitizenMaxSearchResults )
		};
	}

	/**
	 * @override
	 * @param {string} query The search term
	 * @param {number} [limit=10] Maximum number of results
	 * @param {boolean} [showDescription=true] Whether to show descriptions
	 * @return {AbortableSearchFetch}
	 */
	fetchByQuery( query, limit = config.wgCitizenMaxSearchResults, showDescription = true ) {
		const url = buildAskUrl( query );

		const result = fetchJson( url, {
			headers: {
				accept: 'application/json'
			}
		} );

		const searchResponsePromise = result.fetch
			.then( ( res ) => this.adaptApiResponse( query, res, showDescription ) );

		return {
			abort: result.abort,
			fetch: searchResponsePromise
		};
	}
}

module.exports = SmwAskApiSearchClient;
