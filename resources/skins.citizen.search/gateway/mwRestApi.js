const config = require( '../config.json' );

/**
 * Build URL used for fetch request
 *
 * @param {string} input
 * @return {string} url
 */
function getUrl( input ) {
	const endpoint = config.wgScriptPath + '/rest.php/v1/search/title?q=',
		query = '&limit=' + config.wgCitizenMaxSearchResults;

	return endpoint + input + query;
}

/**
 * Map raw response to Results object
 *
 * @param {Object} data
 * @return {Object} Results
 */
function convertDataToResults( data ) {
	const results = [];

	data = data?.pages ?? [];

	for ( let i = 0; i < data.length; i++ ) {
		results[ i ] = {
			id: data[ i ].id,
			title: data[ i ].title,
			description: data[ i ].description
		};
		if ( data[ i ].thumbnail && data[ i ].thumbnail.url ) {
			results[ i ].thumbnail = data[ i ].thumbnail.url;
		}
	}

	return results;
}

module.exports = {
	getUrl: getUrl,
	convertDataToResults: convertDataToResults
};
