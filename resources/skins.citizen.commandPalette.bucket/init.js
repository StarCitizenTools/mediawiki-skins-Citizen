/**
 * Bucket drill-down mode, registered only when Extension:Bucket is here.
 *
 * Three levels live in the palette's mode-context stack: the wiki's
 * buckets, one bucket's fields, one field's values. Picking a value pushes
 * a `filter` entry, so the stack doubles as the filter chain and Backspace
 * drops the last filter for free. Inside a bucket the list holds fields
 * then matching pages, as the category mode holds subcategories then pages.
 *
 * Bucket has no aggregate queries, so a field's values are sampled from a
 * capped fetch and counted here — exact only when the sample covered the
 * bucket, and marked when it did not.
 */
const {
	cdxIconArticle,
	cdxIconCopy,
	cdxIconDatabase,
	cdxIconEdit,
	cdxIconFunnel,
	cdxIconListBullet,
	cdxIconTable
} = require( './icons.json' );
const config = require( './config.json' );
const createApiClient = require( './apiClient.js' );
const createCatalog = require( './catalog.js' );
const { buildQuery } = require( './luaQuery.js' );

const NUMERIC_TYPES = [ 'INTEGER', 'DOUBLE' ];
// Plain decimals only: Number() would also take '0x10' and '1e5', labelling
// the row with text that does not match what the query filters on.
const DECIMAL_TEXT = /^-?\d+(?:\.\d+)?$/;
const PAGE_LIMIT = 50;
const VALUE_SAMPLE_LIMIT = 500;
const VALUE_DISPLAY_LIMIT = 30;

/**
 * Resolves one of this mode's i18n messages.
 *
 * @param {string} key Key suffix after `citizen-command-palette-mode-bucket-`.
 * @param {...*} params Message parameters.
 * @return {string}
 */
function msg( key, ...params ) {
	return mw.message( 'citizen-command-palette-mode-bucket-' + key, ...params ).text();
}

/**
 * Builds an emptyState / noResults payload.
 *
 * @param {string} key Message key suffix, e.g. 'empty' or 'noresults'.
 * @return {{ title: string, description: string, icon: string }}
 */
function makeState( key ) {
	return {
		title: msg( key + '-title' ),
		description: msg( key + '-description' ),
		icon: cdxIconDatabase
	};
}

/**
 * Case-insensitive prefix test. Bucket's where clause has no LIKE, so
 * narrowing a fetched list happens here.
 *
 * @param {string} text
 * @param {string} query
 * @return {boolean}
 */
function matchesPrefix( text, query ) {
	if ( !query ) {
		return true;
	}
	return String( text ).toLowerCase().startsWith( query.toLowerCase() );
}

/**
 * Reads the drill payload a result carries. It rides in the item's `value`
 * because a mouse click rebuilds the item from the list component's
 * declared props, dropping any custom key.
 *
 * @param {Object} item
 * @return {?Object}
 */
function decodePayload( item ) {
	try {
		const payload = JSON.parse( item.value );
		return ( payload && typeof payload === 'object' ) ? payload : null;
	} catch ( error ) {
		mw.log.warn( '[commandPalette] Unreadable bucket item payload:', item.value );
		return null;
	}
}

/**
 * Normalises a raw field value into the values it contributes. A repeated
 * field arrives as an array or as a JSON string, depending on the row.
 *
 * @param {*} raw
 * @return {string[]}
 */
function toValues( raw ) {
	if ( raw === null || raw === undefined || raw === '' ) {
		return [];
	}

	if ( Array.isArray( raw ) ) {
		return raw.flatMap( toValues );
	}

	if ( typeof raw === 'string' && raw.startsWith( '[' ) ) {
		try {
			const parsed = JSON.parse( raw );
			if ( Array.isArray( parsed ) ) {
				return parsed.flatMap( toValues );
			}
		} catch ( error ) {
			// Not JSON after all — fall through and treat it as a plain value.
		}
	}

	return [ String( raw ) ];
}

/**
 * Renders a field value for the detail panel: a repeated field as a
 * comma-separated list, an absent one as '', which the caller drops.
 *
 * @param {*} raw
 * @return {string}
 */
function formatFieldValue( raw ) {
	return toValues( raw ).join( ', ' );
}

/**
 * Counts how often each value appears, most frequent first. Ties break by
 * magnitude on a numeric field and alphabetically elsewhere, so numbers do
 * not come back in string order (1200000 before 50).
 *
 * @param {Object[]} rows
 * @param {string} fieldName
 * @param {string} fieldType Bucket value type of the field.
 * @return {Array<{ value: string, count: number }>}
 */
function tally( rows, fieldName, fieldType ) {
	const counts = new Map();
	rows.forEach( ( row ) => {
		toValues( row[ fieldName ] ).forEach( ( value ) => {
			counts.set( value, ( counts.get( value ) || 0 ) + 1 );
		} );
	} );

	const numeric = NUMERIC_TYPES.includes( fieldType );
	return Array.from( counts, ( [ value, count ] ) => ( { value, count } ) )
		.sort( ( a, b ) => b.count - a.count || ( numeric ?
			Number( a.value ) - Number( b.value ) :
			a.value.localeCompare( b.value ) ) );
}

/**
 * Creates the Bucket mode.
 *
 * @param {typeof mw.Api} ApiConstructor
 * @param {number} namespaceId Id of NS_BUCKET on this wiki.
 * @return {Object} Mode definition for the palette registry.
 */
function createBucketMode( ApiConstructor, namespaceId ) {
	const request = createApiClient( ApiConstructor );
	const catalog = createCatalog( ApiConstructor, namespaceId );

	/**
	 * Runs a Lua query through Bucket's API. formatversion 2 is
	 * load-bearing: under version 1 a boolean true arrives as an empty
	 * string and false is dropped from the row.
	 *
	 * @param {string} query Lua expression from buildQuery.
	 * @param {AbortSignal} [signal]
	 * @return {Promise<Object[]>} Result rows, empty on failure.
	 */
	async function runQuery( query, signal ) {
		const data = await request( {
			action: 'bucket',
			format: 'json',
			formatversion: 2,
			query: query,
			maxage: config.wgSearchSuggestCacheExpiry,
			smaxage: config.wgSearchSuggestCacheExpiry
		}, { signal }, 'Bucket query' );

		if ( !data ) {
			return [];
		}

		if ( !Array.isArray( data.bucket ) ) {
			// A rate-limited request returns before Bucket adds anything,
			// leaving neither rows nor an error — an empty list, unexplained.
			mw.log.warn(
				'[commandPalette] Bucket query returned no rows and no error; ' +
				'the request may have been rate limited.'
			);
			return [];
		}

		return data.bucket;
	}

	/**
	 * @param {Object} bucket Bucket definition from the catalog.
	 * @return {Object} CommandPaletteItem.
	 */
	function adaptBucketItem( bucket ) {
		return {
			id: 'citizen-command-palette-item-bucket-' + bucket.name,
			type: 'bucket',
			label: bucket.label,
			description: msg( 'field-count', bucket.fields.length ),
			thumbnailIcon: cdxIconDatabase,
			value: bucket.name,
			highlightQuery: true,
			actions: [
				{
					id: 'view',
					label: mw.message( 'citizen-command-palette-action-view' ).text(),
					icon: cdxIconArticle,
					url: mw.util.getUrl( bucket.title )
				},
				{
					id: 'browse',
					label: msg( 'action-browse' ),
					icon: cdxIconTable,
					url: mw.util.getUrl( 'Special:Bucket', { bucket: bucket.name } )
				}
			]
		};
	}

	/**
	 * Renders a schema flag as a localised yes/no.
	 *
	 * @param {boolean} flag
	 * @return {string}
	 */
	function yesNo( flag ) {
		return mw.message( flag ? 'htmlform-yes' : 'htmlform-no' ).text();
	}

	/**
	 * Builds a field result, each carrying a card of its own so the panel
	 * is not empty until the user arrows past the fields to a page.
	 *
	 * @param {Object} field Field definition from the catalog.
	 * @return {Object} CommandPaletteItem.
	 */
	function adaptFieldItem( field ) {
		return {
			id: 'citizen-command-palette-item-bucket-field-' + field.name,
			type: 'bucket-field',
			label: field.name,
			description: field.repeated ?
				msg( 'field-type-repeated', field.type ) :
				field.type,
			thumbnailIcon: cdxIconListBullet,
			value: JSON.stringify( { field: field.name, type: field.type } ),
			highlightQuery: true,
			detail: {
				header: { label: field.name },
				pairs: [
					{ label: msg( 'field-detail-type' ), value: field.type },
					{ label: msg( 'field-detail-repeated' ), value: yesNo( field.repeated ) },
					{ label: msg( 'field-detail-indexed' ), value: yesNo( field.indexed ) }
				]
			}
		};
	}

	/**
	 * Builds a page result. The row travels with it as detail pairs, so
	 * arrowing the list shows each page's stored data, not just its title.
	 *
	 * A page writing several rows is still listed once: the panel shows the
	 * first and a badge gives the count, the rest under "View data".
	 *
	 * @param {string} title Page title from a row's page_name.
	 * @param {Object[]} rows That page's rows, in query order.
	 * @param {Object} definition Bucket definition, for field order.
	 * @return {Object} CommandPaletteItem.
	 */
	function adaptPageItem( title, rows, definition ) {
		const pairs = [];
		definition.fields.forEach( ( field ) => {
			const value = formatFieldValue( rows[ 0 ][ field.name ] );
			if ( value !== '' ) {
				pairs.push( { label: field.name, value } );
			}
		} );

		const item = {
			id: 'citizen-command-palette-item-bucket-page-' + title,
			type: 'page',
			label: title,
			url: mw.util.getUrl( title ),
			thumbnailIcon: cdxIconArticle,
			highlightQuery: true,
			detail: {
				header: { label: title },
				pairs
			},
			actions: [
				{
					id: 'edit',
					label: mw.message( 'edit' ).text(),
					icon: cdxIconEdit,
					url: mw.util.getUrl( title, { action: 'edit' } )
				},
				{
					id: 'data',
					label: msg( 'action-data' ),
					icon: cdxIconDatabase,
					url: mw.util.getUrl( title, { action: 'bucket' } )
				}
			]
		};

		if ( rows.length > 1 ) {
			item.metadata = [ { label: msg( 'row-count', rows.length ) } ];
		}

		return item;
	}

	/**
	 * Builds a filter result: picking it narrows the query by one condition.
	 *
	 * @param {Object} spec
	 * @param {Object} spec.field Field definition.
	 * @param {string} spec.op Where operator.
	 * @param {*} spec.value Value to compare against.
	 * @param {string} spec.label Display label.
	 * @param {string} spec.id Unique id suffix.
	 * @param {Array} [spec.metadata] Optional badge, e.g. a sample count.
	 * @param {Object} [spec.detail] Optional detail-panel content.
	 * @return {Object} CommandPaletteItem.
	 */
	function adaptFilterItem( spec ) {
		const item = {
			id: 'citizen-command-palette-item-bucket-value-' + spec.id,
			type: 'bucket-value',
			label: spec.label,
			thumbnailIcon: cdxIconFunnel,
			value: JSON.stringify( {
				field: spec.field.name,
				type: spec.field.type,
				op: spec.op,
				value: spec.value
			} ),
			highlightQuery: true
		};

		if ( spec.metadata ) {
			item.metadata = spec.metadata;
		}
		if ( spec.detail ) {
			item.detail = spec.detail;
		}

		return item;
	}

	/**
	 * Turns a sampled value into a filter result. A truncated sample marks
	 * its badge and explains itself in the detail panel.
	 *
	 * @param {Object} field
	 * @param {{ value: string, count: number }} entry
	 * @param {number} index
	 * @param {boolean} truncated
	 * @return {Object} CommandPaletteItem.
	 */
	function adaptSampledValueItem( field, entry, index, truncated ) {
		const count = mw.language.convertNumber( entry.count );
		return adaptFilterItem( {
			field,
			op: '=',
			value: entry.value,
			label: entry.value,
			id: index + '-' + entry.value,
			metadata: [ {
				label: truncated ? msg( 'value-count-partial', count ) : count
			} ],
			detail: truncated ? {
				pairs: [ {
					label: msg( 'value-sample-label' ),
					value: msg(
						'value-sample-description',
						mw.language.convertNumber( VALUE_SAMPLE_LIMIT )
					)
				} ]
			} : undefined
		} );
	}

	/**
	 * Builds the "copy as Lua" row: the bucket, its fields and the active
	 * filters, written with the `mw.ext.bucket` entry point a Scribunto
	 * module uses. Unfiltered it is the bucket's skeleton query, the nearest
	 * thing to a copy action on the bucket itself — row action buttons only
	 * navigate, so they cannot copy.
	 *
	 * @param {Object} spec Query spec, as handed to buildQuery.
	 * @return {Object} CommandPaletteItem.
	 */
	function adaptCopyQueryItem( spec ) {
		// Ordering and row cap belong to the list, not the query: a module
		// editor sets their own paging, and Bucket's server-side default
		// limit means dropping ours leaves nothing unbounded.
		const snippet = 'mw.ext.' + buildQuery( {
			bucket: spec.bucket,
			select: spec.select,
			filters: spec.filters
		} );

		// No `detail`, no description: this row is highlighted on arrival,
		// and a panel here would open the two-pane layout on a single
		// string instead of row data. The snippet is also far too long to
		// survive as a list subtitle.
		return {
			id: 'citizen-command-palette-item-bucket-query',
			type: 'bucket-query',
			label: msg( 'copy-query-label' ),
			thumbnailIcon: cdxIconCopy,
			value: snippet,
			highlightQuery: false
		};
	}

	/**
	 * Writes text to the clipboard, reporting success the way the skin
	 * reports other background actions.
	 *
	 * @param {string} text
	 */
	function copyToClipboard( text ) {
		// eslint-disable-next-line compat/compat -- guarded below; MW 1.43+ targets modern browsers
		const clipboard = typeof navigator !== 'undefined' && navigator.clipboard;
		if ( !clipboard ) {
			mw.log.error( '[commandPalette] Clipboard API unavailable' );
			return;
		}
		clipboard.writeText( text ).then( () => {
			mw.notify( msg( 'copy-query-done' ) );
		} ).catch( ( error ) => {
			mw.log.error( '[commandPalette] Clipboard write failed:', error );
		} );
	}

	/**
	 * Root level: the buckets on the wiki.
	 *
	 * @param {Object[]} buckets
	 * @param {string} query
	 * @return {Object[]}
	 */
	function listBuckets( buckets, query ) {
		return buckets
			.filter( ( bucket ) => matchesPrefix( bucket.label, query ) )
			.map( adaptBucketItem );
	}

	/**
	 * Bucket level: the fields still available to filter on, followed by
	 * the pages currently matching.
	 *
	 * @param {Object} definition
	 * @param {Object[]} filters
	 * @param {string} query
	 * @param {AbortSignal} [signal]
	 * @return {Promise<Object[]>}
	 */
	async function listFieldsAndPages( definition, filters, query, signal ) {
		const filtered = new Set( filters.map( ( filter ) => filter.field ) );
		const fields = definition.fields
			.filter( ( field ) => !filtered.has( field.name ) )
			.filter( ( field ) => matchesPrefix( field.name, query ) )
			.map( adaptFieldItem );

		// Rows come back ordered by page_name, so a typed prefix seeks into
		// that order rather than filtering whatever the first window held —
		// otherwise a late letter finds nothing in a large bucket. The seek
		// only picks the starting point; matchesPrefix still decides.
		const seek = query ?
			filters.concat( [ {
				field: 'page_name', op: '>=', value: query, type: 'PAGE'
			} ] ) :
			filters;

		const spec = {
			bucket: definition.name,
			select: [ 'page_name' ].concat(
				definition.fields.map( ( field ) => field.name )
			),
			filters: seek,
			orderBy: 'page_name',
			limit: PAGE_LIMIT
		};
		const rows = await runQuery( buildQuery( spec ), signal );

		// A page can write several rows, so the same page_name comes back
		// more than once; they collect under one result.
		const byPage = new Map();
		rows.forEach( ( row ) => {
			const title = row.page_name;
			if ( !title || !matchesPrefix( title, query ) ) {
				return;
			}
			if ( !byPage.has( title ) ) {
				byPage.set( title, [] );
			}
			byPage.get( title ).push( row );
		} );

		const pages = Array.from( byPage, ( [ title, pageRows ] ) => adaptPageItem(
			title, pageRows, definition
		) );

		// Leads the list as the query-action row leads a search: the one
		// row acting on the whole query rather than on a single result. It
		// drops out while the user is typing, matching nothing they seek.
		const copyRow = query ? [] : [ adaptCopyQueryItem( spec ) ];

		return copyRow.concat( fields, pages );
	}

	/**
	 * Value level: what this field actually holds.
	 *
	 * @param {Object} definition
	 * @param {Object} field
	 * @param {Object[]} filters
	 * @param {string} query
	 * @param {AbortSignal} [signal]
	 * @return {Promise<Object[]>}
	 */
	async function listValues( definition, field, filters, query, signal ) {
		// A boolean field has two values; sampling for them wastes a request.
		if ( field.type === 'BOOLEAN' ) {
			return [ true, false ]
				.filter( ( value ) => matchesPrefix( String( value ), query ) )
				.map( ( value ) => adaptFilterItem( {
					field,
					op: '=',
					value,
					label: String( value ),
					id: String( value )
				} ) );
		}

		const rows = await runQuery( buildQuery( {
			bucket: definition.name,
			select: [ field.name ],
			filters,
			limit: VALUE_SAMPLE_LIMIT
		} ), signal );

		const truncated = rows.length >= VALUE_SAMPLE_LIMIT;
		const counts = tally( rows, field.name, field.type );
		const sampled = counts
			.filter( ( entry ) => matchesPrefix( entry.value, query ) )
			.slice( 0, VALUE_DISPLAY_LIMIT )
			.map( ( entry, index ) => adaptSampledValueItem(
				field, entry, index, truncated
			) );

		const literal = literalFilters( field, query, counts );
		return literal.leading.concat( sampled, literal.trailing );
	}

	/**
	 * Filters built from the typed text rather than the sample. A number
	 * typed into a numeric field reads as a comparison, so comparisons
	 * lead; anything else is an exact match, offered only when the sample
	 * did not already turn it up.
	 *
	 * @param {Object} field
	 * @param {string} query
	 * @param {Array<{ value: string }>} counts
	 * @return {{ leading: Object[], trailing: Object[] }}
	 */
	function literalFilters( field, query, counts ) {
		const empty = { leading: [], trailing: [] };
		if ( !query ) {
			return empty;
		}

		const known = counts.some(
			( entry ) => entry.value.toLowerCase() === query.toLowerCase()
		);

		if ( NUMERIC_TYPES.includes( field.type ) && DECIMAL_TEXT.test( query ) ) {
			// The sample already offers an exact match for what it holds.
			const operators = known ? [ '>', '<' ] : [ '>', '<', '=' ];
			return {
				leading: operators.map( ( op ) => adaptFilterItem( {
					field,
					op,
					value: query,
					label: msg( 'filter-comparison', field.name, op, query ),
					id: 'literal-' + op
				} ) ),
				trailing: []
			};
		}

		if ( known ) {
			return empty;
		}

		return {
			leading: [],
			trailing: [ adaptFilterItem( {
				field,
				op: '=',
				value: query,
				label: msg( 'filter-comparison', field.name, '=', query ),
				id: 'literal-equals'
			} ) ]
		};
	}

	/**
	 * @param {string} subQuery
	 * @param {AbortSignal} [signal]
	 * @param {Array} [tokens] Unused; this mode keeps its state in the context stack.
	 * @param {Array} [modeContext]
	 * @return {Promise<Object[]>}
	 */
	async function getResults( subQuery, signal, tokens, modeContext ) {
		const stack = Array.isArray( modeContext ) ? modeContext : [];
		const query = ( subQuery || '' ).trim();
		const buckets = await catalog.getBuckets();

		const entered = stack.find( ( entry ) => entry.kind === 'bucket' );
		if ( !entered ) {
			return listBuckets( buckets, query );
		}

		const definition = buckets.find( ( bucket ) => bucket.name === entered.name );
		if ( !definition ) {
			return [];
		}

		const filters = stack.filter( ( entry ) => entry.kind === 'filter' );
		const last = stack[ stack.length - 1 ];

		if ( last && last.kind === 'field' ) {
			// The schema is authoritative on a field's type; the stack entry
			// is only what was recorded when it was picked.
			const field = definition.fields.find( ( f ) => f.name === last.name ) ||
				{ name: last.name, type: last.type, repeated: false };
			return listValues( definition, field, filters, query, signal );
		}

		return listFieldsAndPages( definition, filters, query, signal );
	}

	/**
	 * @param {Object} item
	 * @return {Object} Palette action.
	 */
	function onResultSelect( item ) {
		if ( item.type === 'bucket' ) {
			return {
				action: 'pushModeContext',
				payload: { kind: 'bucket', name: item.value, label: item.label }
			};
		}

		if ( item.type === 'bucket-query' ) {
			copyToClipboard( item.value );
			return { action: 'none' };
		}

		if ( item.type === 'bucket-field' ) {
			const payload = decodePayload( item );
			return payload ? {
				action: 'pushModeContext',
				payload: { kind: 'field', name: payload.field, type: payload.type }
			} : { action: 'none' };
		}

		if ( item.type === 'bucket-value' ) {
			const payload = decodePayload( item );
			return payload ? {
				action: 'pushModeContext',
				payload: {
					kind: 'filter',
					field: payload.field,
					op: payload.op,
					value: payload.value,
					type: payload.type
				}
			} : { action: 'none' };
		}

		return item.url ?
			{ action: 'navigate', payload: item.url } :
			{ action: 'none' };
	}

	/**
	 * Renders the drill stack as a breadcrumb, leaving out a field a filter
	 * has already answered so the path reads `Buckets / Item / item_type:
	 * Weapon` rather than repeating the field name.
	 *
	 * @param {Array} modeContext
	 * @return {?string}
	 */
	function headerLabel( modeContext ) {
		const stack = Array.isArray( modeContext ) ? modeContext : [];
		if ( stack.length === 0 ) {
			return null;
		}

		const segments = [ msg( 'breadcrumb-root' ) ];
		stack.forEach( ( entry, index ) => {
			if ( entry.kind === 'bucket' ) {
				segments.push( entry.label || entry.name );
				return;
			}

			if ( entry.kind === 'field' ) {
				const next = stack[ index + 1 ];
				if ( !next || next.kind !== 'filter' || next.field !== entry.name ) {
					segments.push( entry.name );
				}
				return;
			}

			if ( entry.kind === 'filter' ) {
				segments.push( entry.op === '=' ?
					entry.field + ': ' + entry.value :
					entry.field + ' ' + entry.op + ' ' + entry.value );
			}
		} );

		return segments.join( ' / ' );
	}

	return {
		id: 'bucket',
		triggers: [ '/bucket:' ],
		icon: cdxIconDatabase,
		compactResults: true,
		label: mw.message( 'citizen-command-palette-command-bucket-label' ).text(),
		description: mw.message( 'citizen-command-palette-command-bucket-description' ).text(),
		placeholder: msg( 'placeholder' ),
		emptyState: makeState( 'empty' ),
		noResults() {
			return makeState( 'noresults' );
		},
		help: {
			description: 'citizen-command-palette-mode-bucket-description-help'
		},
		getResults,
		onResultSelect,
		headerLabel
	};
}

module.exports = createBucketMode;
