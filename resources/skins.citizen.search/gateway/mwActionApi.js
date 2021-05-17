const descriptionSource = mw.config.get( 'wgCitizenSearchDescriptionSource' );

/**
 * Build URL used for fetch request
 *
 * @param {string} input
 * @return {string} url
 */
function getUrl( input ) {
	const wgScriptPath = mw.config.get( 'wgScriptPath' ),
		endpoint = wgScriptPath + '/api.php?format=json',
		maxSearchResults = mw.config.get( 'wgCitizenMaxSearchResults' ),
		cacheExpiry = mw.config.get( 'wgSearchSuggestCacheExpiry' ),
		query = {
			action: 'query',
			smaxage: cacheExpiry,
			maxage: cacheExpiry,
			generator: 'prefixsearch',
			prop: 'pageprops|pageimages',
			redirects: '',
			ppprop: 'displaytitle',
			piprop: 'thumbnail',
			pithumbsize: 200,
			pilimit: maxSearchResults,
			gpssearch: input,
			gpsnamespace: 0,
			gpslimit: maxSearchResults
		};

	switch ( descriptionSource ) {
		case 'wikidata':
			query.prop += '|description';
			break;
		case 'textextracts':
			query.prop += '|extracts';
			query.exchars = '60';
			query.exintro = '1';
			query.exlimit = maxSearchResults;
			query.explaintext = '1';
			break;
		case 'pagedescription':
			query.prop += '|pageprops';
			query.ppprop = 'description';
			break;
	}

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
	const getTitle = ( item ) => {
		if ( item.pageprops && item.pageprops.displaytitle ) {
			return item.pageprops.displaytitle;
		} else {
			return item.title;
		}
	};

	const getDescription = ( item ) => {
		switch ( descriptionSource ) {
			case 'wikidata':
				return item.description || '';
			case 'textextracts':
				return item.extract || '';
			case 'pagedescription':
				return item.pageprops.description.substring( 0, 60 ) + '...' || '';
		}
	};

	const results = [];

	/* eslint-disable-next-line compat/compat, es/no-object-values */
	data = Object.values( data.query.pages );

	// Sort the data with the index property since it is not in order
	data.sort( ( a, b ) => {
		return a.index - b.index;
	} );

	for ( let i = 0; i < data.length; i++ ) {
		results[ i ] = {
			id: data[ i ].pageid,
			title: getTitle( data[ i ] ),
			description: getDescription( data[ i ] )
		};
		if ( data[ i ].thumbnail && data[ i ].thumbnail.source ) {
			results[ i ].thumbnail = data[ i ].thumbnail.source;
		}
	}

	return results;
}

module.exports = {
	getUrl: getUrl,
	convertDataToResults: convertDataToResults
};
