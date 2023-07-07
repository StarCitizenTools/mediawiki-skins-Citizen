const config = require( '../config.json' );

/**
 * Build URL used for fetch request
 *
 * @param {string} input
 * @return {string} url
 */
function getUrl( input ) {
	const endpoint = config.wgScriptPath + '/api.php?format=json',
		maxResults = config.wgCitizenMaxSearchResults,
		askQueryTemplate = config.wgCitizenSearchSmwAskApiQueryTemplate;

	let askQuery = '';

	if ( input.includes( ':' ) ) {
		let namespace = input.split( ':' )[ 0 ];
		if ( namespace === 'Category' ) {
			namespace = ':' + namespace;
		}
		input = input.split( ':' )[ 1 ];
		askQuery += '[[' + namespace + ':+]]';
	}

	/* eslint-disable-next-line es-x/no-string-prototype-replaceall */
	askQuery += askQueryTemplate.replaceAll( '${input}', input );
	askQuery += '|limit=' + maxResults;

	const query = {
		action: 'ask',
		query: encodeURIComponent( askQuery )
	};

	let queryString = '';
	for ( const property in query ) {
		queryString += '&' + property + '=' + query[ property ];
	}

	return endpoint + queryString;
}

/**
 * Map raw response to Results object
 *
 * @param {Object} data
 * @return {Object} Results
 */
function convertDataToResults( data ) {
	const userLang = mw.config.get( 'wgUserLanguage' );

	const getDisplayTitle = ( item ) => {
		if ( item.printouts.displaytitle && item.printouts.displaytitle.length &&
			item.printouts.displaytitle[ 0 ][ 'Language code' ] && item.printouts.displaytitle[ 0 ].Text.item.length ) {
			// multi-lang string preference: user lang => English => first result
			let textEN = '';
			let textResult = '';
			for ( const text of item.printouts.displaytitle ) {
				if ( text[ 'Language code' ].item[ 0 ] === userLang ) {
					textResult = text.Text.item[ 0 ];
				}
				if ( text[ 'Language code' ].item[ 0 ] === 'en' ) {
					textEN = text.Text.item[ 0 ];
				}
			}
			if ( textResult === '' ) {
				textResult = textEN;
			}
			if ( textResult === '' ) {
				textResult = item.printouts.displaytitle[ 0 ].Text.item[ 0 ];
			}
			return textResult;
		} else if ( item.printouts.displaytitle && item.printouts.displaytitle.length ) {
			return item.printouts.displaytitle[ 0 ];
		} else if ( item.displaytitle && item.displaytitle !== '' ) {
			return item.displaytitle;
		} else { return item.fulltext; }
	};

	const getDescription = ( item ) => {
		if ( item.printouts.desc && item.printouts.desc.length &&
			item.printouts.desc[ 0 ][ 'Language code' ] && item.printouts.desc[ 0 ].Text.item.length ) {
			// multi-lang string preference: user lang => English => first result
			let textEN = '';
			let textResult = '';
			for ( const text of item.printouts.desc ) {
				if ( text[ 'Language code' ].item[ 0 ] === userLang ) {
					textResult = text.Text.item[ 0 ];
				}
				if ( text[ 'Language code' ].item[ 0 ] === 'en' ) {
					textEN = text.Text.item[ 0 ];
				}
			}
			if ( textResult === '' ) {
				textResult = textEN;
			}
			if ( textResult === '' ) {
				textResult = item.printouts.desc[ 0 ].Text.item[ 0 ];
			}
			return textResult;
		} else if ( item.printouts.desc && item.printouts.desc.length ) {
			return item.printouts.desc[ 0 ];
		} else { return ''; }
	};

	const getThumbnail = ( item ) => {
		if ( item.printouts.thumbnail && item.printouts.thumbnail.length ) {
			const imgTitle = item.printouts.thumbnail[ 0 ].fulltext;
			return config.wgScriptPath + '/index.php?title=Special:Redirect/file/' + imgTitle + '&width=200&height=200';
		} else { return undefined; }
	};

	const results = [];

	data = Object.values( data.query.results );

	for ( let i = 0; i < data.length; i++ ) {
		results[ i ] = {
			id: i,
			key: data[ i ].fulltext,
			title: getDisplayTitle( data[ i ] ),
			desc: getDescription( data[ i ] ),
			thumbnail: getThumbnail( data[ i ] )
		};
	}

	return results;
}

module.exports = {
	getUrl: getUrl,
	convertDataToResults: convertDataToResults
};
