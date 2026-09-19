/**
 * The bucket catalog: which buckets exist here, and what fields each holds.
 *
 * Bucket has no schema API and needs none — a `Bucket:Foo` page *is* the
 * schema for bucket `foo`. One generator query therefore returns the whole
 * catalog, cached for the session since only an edit can change it.
 */
const config = require( './config.json' );
const createApiClient = require( './apiClient.js' );

// `gaplimit: 'max'` caps at 500 pages, and the result-size limit can cut a
// response shorter still, so continuation is followed rather than listing
// part of the wiki. Bounded: a server always reporting more must not hang.
const MAX_CATALOG_REQUESTS = 20;

/**
 * @typedef {Object} BucketField
 * @property {string} name Field name as used in queries.
 * @property {string} type Bucket value type (TEXT, PAGE, INTEGER, DOUBLE, BOOLEAN).
 * @property {boolean} repeated Whether the field holds a list of values.
 * @property {boolean} indexed Whether the field is indexed in the database.
 */

/**
 * @typedef {Object} BucketDefinition
 * @property {string} name Lua bucket name (the lowercased page key).
 * @property {string} title Full page title, e.g. 'Bucket:Item'.
 * @property {string} label Human-readable bucket name.
 * @property {BucketField[]} fields Editor-declared fields, in schema order.
 */

/**
 * Turns a bucket page's JSON schema into a field list, dropping the
 * internal columns Bucket adds for itself (`_page_id`, `_index`).
 *
 * @param {Object} schema Decoded schema JSON.
 * @return {BucketField[]}
 */
function adaptFields( schema ) {
	return Object.keys( schema )
		.filter( ( name ) => !name.startsWith( '_' ) )
		.map( ( name ) => {
			const field = schema[ name ] || {};
			return {
				// Bucket lowercases field names when it creates the column
				// (Bucket::getValidFieldName), so a capitalised schema key
				// would not match the column its own schema made.
				name: name.toLowerCase(),
				type: String( field.type || 'TEXT' ),
				repeated: !!field.repeated,
				// A schema that leaves `index` out gets an indexed column.
				indexed: field.index !== false
			};
		} );
}

/**
 * Adapts one API page entry into a bucket definition.
 *
 * @param {Object} page Page object from the generator query.
 * @return {?BucketDefinition} Null when the page carries no usable schema.
 */
function adaptBucket( page ) {
	const content = page?.revisions?.[ 0 ]?.slots?.main?.content;
	if ( typeof content !== 'string' ) {
		return null;
	}

	let schema;
	try {
		schema = JSON.parse( content );
	} catch ( error ) {
		mw.log.warn( '[commandPalette] Bucket schema is not valid JSON:', page.title );
		return null;
	}

	if ( !schema || typeof schema !== 'object' || Array.isArray( schema ) ) {
		mw.log.warn( '[commandPalette] Bucket schema is not an object:', page.title );
		return null;
	}

	// Bucket names a bucket after the page's DBkey, lowercased, but the API
	// hands back prefixed *text* — spaces, never underscores. The spaces have
	// to go back before the name reaches a query: `bucket('item drop')` is
	// refused with "Bucket name item drop is invalid".
	const key = String( page.title ).split( ':' ).slice( 1 ).join( ':' );
	return {
		name: key.replace( / /g, '_' ).toLowerCase(),
		title: page.title,
		label: key,
		fields: adaptFields( schema )
	};
}

/**
 * Creates a catalog bound to an API constructor and the wiki's Bucket
 * namespace id.
 *
 * @param {typeof mw.Api} ApiConstructor
 * @param {number} namespaceId Id of NS_BUCKET on this wiki.
 * @return {{ getBuckets: function(): Promise<BucketDefinition[]> }}
 */
function createCatalog( ApiConstructor, namespaceId ) {
	const request = createApiClient( ApiConstructor );
	let cached = null;

	const baseParams = {
		action: 'query',
		format: 'json',
		formatversion: 2,
		generator: 'allpages',
		gapnamespace: namespaceId,
		gaplimit: 'max',
		prop: 'revisions',
		rvprop: 'content',
		rvslots: 'main',
		maxage: config.wgSearchSuggestCacheExpiry,
		smaxage: config.wgSearchSuggestCacheExpiry
	};

	// Deliberately unsignalled: the result is shared, so binding it to
	// whichever keystroke asked first would let that keystroke's abort
	// resolve an empty catalog for everyone.
	async function fetchBuckets() {
		const collected = [];
		let params = baseParams;

		for ( let requests = 1; requests <= MAX_CATALOG_REQUESTS; requests++ ) {
			const data = await request( params, undefined, 'Bucket catalog fetch' );
			if ( !data ) {
				// Already logged. Keep what was read, so a late failure
				// costs the tail of the list rather than all of it.
				break;
			}

			collected.push( ...( data?.query?.pages || [] ) );

			if ( !data.continue ) {
				break;
			}

			if ( requests === MAX_CATALOG_REQUESTS ) {
				mw.log.warn(
					'[commandPalette] Bucket catalog stopped after ' +
					MAX_CATALOG_REQUESTS + ' requests; some buckets are missing.'
				);
				break;
			}

			params = Object.assign( {}, baseParams, data.continue );
		}

		// filter( Boolean ) does not narrow the nulls away for the checker.
		return collected.reduce( ( buckets, page ) => {
			const bucket = adaptBucket( page );
			if ( bucket ) {
				buckets.push( bucket );
			}
			return buckets;
		}, /** @type {BucketDefinition[]} */ ( [] ) );
	}

	return {
		/**
		 * @return {Promise<BucketDefinition[]>}
		 */
		getBuckets() {
			if ( cached ) {
				return cached;
			}
			// An empty catalog means the request failed; the next keystroke
			// should retry rather than reuse it.
			const pending = fetchBuckets().then( ( buckets ) => {
				if ( buckets.length === 0 ) {
					cached = null;
				}
				return buckets;
			} );
			cached = pending;
			return pending;
		}
	};
}

module.exports = createCatalog;
