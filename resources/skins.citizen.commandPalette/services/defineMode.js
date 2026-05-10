/**
 * Factories for declaring command-palette modes and commands with
 * runtime validation, default-filling, and typo-warning. The mode
 * contract is implicit — `paletteRegistry.register` accepts any
 * object with an `id` — and these factories add a layer that
 * surfaces shape mistakes loudly instead of letting them rot
 * silently into "this mode quietly does nothing."
 *
 * Use `defineMode( config )` for entries that take a sub-query and
 * return results; use `defineCommand( config )` for entries that
 * fire an action immediately on selection. Both return the input
 * with defaults filled, or `null` when validation fails hard. The
 * registry already accepts `null` and warns, so a single bad
 * third-party mode never crashes the whole palette.
 */

const VALID_LAYOUTS = [ 'list', 'gallery' ];

// Fields any registry entry may carry. Anything outside this set
// triggers an "unknown field" warning to catch typos. Mode- and
// command-specific allowlists extend this base.
const COMMON_FIELDS = [
	'id',
	'triggers',
	'label',
	'description',
	'help',
	'onResultSelect'
];

const MODE_FIELDS = COMMON_FIELDS.concat( [
	'placeholder',
	'icon',
	'layout',
	'compactResults',
	'keybindings',
	'emptyState',
	'noResults',
	'tokenPattern',
	'getResults',
	'getItemDetail',
	'headerLabel'
] );

const COMMAND_FIELDS = COMMON_FIELDS;

/**
 * Shared shape checks for a registry entry. Returns true when the
 * entry has the universal required pieces (object, id, triggers).
 * Hard-fails are logged to mw.log.error so build-time test runs
 * surface them.
 *
 * @param {*} config
 * @param {string} kind 'mode' or 'command' — used in log messages
 * @return {boolean}
 */
function validateBase( config, kind ) {
	if ( typeof config !== 'object' || config === null || Array.isArray( config ) ) {
		mw.log.error( `[commandPalette] ${ kind } config must be a non-array object.` );
		return false;
	}

	if ( typeof config.id !== 'string' || config.id.trim() === '' ) {
		mw.log.error( `[commandPalette] ${ kind } config is missing a non-empty string \`id\`.` );
		return false;
	}

	if ( !Array.isArray( config.triggers ) || config.triggers.length === 0 ) {
		mw.log.error( `[commandPalette] ${ kind } "${ config.id }" must declare a non-empty \`triggers\` array.` );
		return false;
	}
	if ( !config.triggers.every( ( t ) => typeof t === 'string' && t.trim() !== '' ) ) {
		mw.log.error( `[commandPalette] ${ kind } "${ config.id }" \`triggers\` must contain only non-empty strings.` );
		return false;
	}

	if ( config.onResultSelect !== undefined && typeof config.onResultSelect !== 'function' ) {
		mw.log.error( `[commandPalette] ${ kind } "${ config.id }" \`onResultSelect\` must be a function when present.` );
		return false;
	}

	return true;
}

/**
 * Warn for any top-level key not in `allowedFields`. Catches typos
 * like `placholder` or `layoput` at registration time. Doesn't
 * mutate the config — the unknown field is preserved so future
 * Citizen versions reading new fields keep working when registered
 * against an older defineMode build.
 *
 * @param {Object} config
 * @param {string[]} allowedFields
 * @param {string} kind 'mode' or 'command'
 */
function warnUnknownFields( config, allowedFields, kind ) {
	const allowed = new Set( allowedFields );
	Object.keys( config ).forEach( ( key ) => {
		if ( !allowed.has( key ) ) {
			mw.log.warn(
				`[commandPalette] ${ kind } "${ config.id }" has unknown field \`${ key }\`. ` +
				'Typo, or a field added in a newer Citizen version?'
			);
		}
	} );
}

/**
 * Validate optional fields and coerce / drop ones that are present
 * but malformed. Returns a new object — the caller's config is
 * never mutated.
 *
 * @param {Object} config
 * @return {Object}
 */
function applyOptionalFieldChecks( config ) {
	const out = Object.assign( {}, config );

	if ( out.layout !== undefined && !VALID_LAYOUTS.includes( out.layout ) ) {
		mw.log.warn(
			`[commandPalette] mode "${ out.id }" has invalid \`layout\` ` +
			`"${ out.layout }". Valid values: ${ VALID_LAYOUTS.join( ', ' ) }. Falling back to "list".`
		);
		out.layout = 'list';
	}

	if ( out.compactResults !== undefined && typeof out.compactResults !== 'boolean' ) {
		mw.log.warn(
			`[commandPalette] mode "${ out.id }" \`compactResults\` must be a boolean. Coercing.`
		);
		out.compactResults = Boolean( out.compactResults );
	}

	// compactResults is meaningless in gallery layout (gallery has no
	// rows to compact). Drop it so downstream code can rely on the
	// fields being mutually exclusive.
	if ( out.compactResults && out.layout === 'gallery' ) {
		mw.log.warn(
			`[commandPalette] mode "${ out.id }" combines \`compactResults: true\` with ` +
			'`layout: "gallery"`. Gallery has no rows to compact — ignoring `compactResults`.'
		);
		out.compactResults = false;
	}

	if ( out.keybindings !== undefined && !Array.isArray( out.keybindings ) ) {
		mw.log.warn(
			`[commandPalette] mode "${ out.id }" \`keybindings\` must be an array. Dropping the field.`
		);
		delete out.keybindings;
	}

	if ( out.getItemDetail !== undefined && typeof out.getItemDetail !== 'function' ) {
		mw.log.warn(
			`[commandPalette] mode "${ out.id }" \`getItemDetail\` must be a function. Dropping the field.`
		);
		delete out.getItemDetail;
	}

	if (
		out.tokenPattern !== undefined &&
		( out.tokenPattern === null || typeof out.tokenPattern !== 'object' )
	) {
		// `typeof null === 'object'` in JS, so the null branch is explicit —
		// otherwise `tokenPattern: null` would slip through without a warning
		// and contradict the contract this rule enforces.
		mw.log.warn(
			`[commandPalette] mode "${ out.id }" \`tokenPattern\` must be an object or array. Dropping the field.`
		);
		delete out.tokenPattern;
	}

	return out;
}

/**
 * Apply default values for fields that have one. Today this is just
 * `layout: 'list'` and `compactResults: false`. Other optional
 * fields stay absent so the rest of the palette can use truthiness
 * checks without false positives.
 *
 * Argument order matters: defaults come first, caller config second,
 * so any value the caller already set (including a coerced one from
 * `applyOptionalFieldChecks`) wins over the default.
 *
 * @param {Object} config
 * @return {Object}
 */
function applyDefaults( config ) {
	return Object.assign( {
		layout: 'list',
		compactResults: false
	}, config );
}

/**
 * Validate and normalize a mode (sub-query-driven entry that produces
 * results via `getResults`). Returns the normalized object, or `null`
 * when validation fails hard.
 *
 * @param {Object} config
 * @return {import('../types.js').PaletteMode|null}
 */
function defineMode( config ) {
	if ( !validateBase( config, 'mode' ) ) {
		return null;
	}

	if ( typeof config.getResults !== 'function' ) {
		mw.log.error(
			`[commandPalette] mode "${ config.id }" must declare a \`getResults\` function. ` +
			'Use `defineCommand` for entries that fire an action immediately on selection.'
		);
		return null;
	}

	warnUnknownFields( config, MODE_FIELDS, 'mode' );

	const checked = applyOptionalFieldChecks( config );
	return applyDefaults( checked );
}

/**
 * Validate and normalize a command (no sub-query; fires an action
 * immediately on selection). Returns the normalized object, or
 * `null` when validation fails hard.
 *
 * @param {Object} config
 * @return {import('../types.js').PaletteCommand|null}
 */
function defineCommand( config ) {
	if ( !validateBase( config, 'command' ) ) {
		return null;
	}

	if ( config.onResultSelect === undefined ) {
		mw.log.error(
			`[commandPalette] command "${ config.id }" must declare an \`onResultSelect\` function. ` +
			'Use `defineMode` for entries that take a sub-query and return results.'
		);
		return null;
	}

	warnUnknownFields( config, COMMAND_FIELDS, 'command' );

	// Commands don't carry layout / compactResults / keybindings, so no
	// defaults to fill. Return the validated config as-is.
	return Object.assign( {}, config );
}

module.exports = {
	defineMode,
	defineCommand
};
