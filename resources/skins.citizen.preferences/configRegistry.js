const {
	PreferencesConfig, NormalizedPreferencesConfig,
	PreferenceOption, SectionConfig, PreferenceConfig
} = require( './types.js' );

/**
 * Merge admin overrides into built-in defaults.
 *
 * @param {PreferencesConfig} defaults
 * @param {PreferencesConfig|null} overrides
 * @return {PreferencesConfig}
 */
function mergeConfigs( defaults, overrides ) {
	if ( !overrides ) {
		return defaults;
	}

	const merged = {
		sections: Object.assign( {}, defaults.sections ),
		preferences: Object.assign( {}, defaults.preferences )
	};

	if ( overrides.sections ) {
		Object.assign( merged.sections, overrides.sections );
	}

	if ( overrides.preferences ) {
		for ( const [ key, value ] of Object.entries( overrides.preferences ) ) {
			if ( value === null ) {
				delete merged.preferences[ key ];
			} else if ( merged.preferences[ key ] ) {
				merged.preferences[ key ] = Object.assign(
					{}, merged.preferences[ key ], value
				);
			} else {
				merged.preferences[ key ] = value;
			}
		}
	}

	return merged;
}

/**
 * Normalize a merged config: convert short-form options to long-form,
 * auto-detect widget types when omitted.
 *
 * @param {PreferencesConfig} config
 * @return {NormalizedPreferencesConfig}
 */
function normalizeConfig( config ) {
	// Copy sections, filtering out any null entries (null = deleted by override)
	const sections = {};
	for ( const [ key, val ] of Object.entries( config.sections ) ) {
		if ( val && typeof val === 'object' ) {
			sections[ key ] = val;
		}
	}

	const normalized = {
		sections,
		preferences: {}
	};

	for ( const [ key, pref ] of Object.entries( config.preferences ) ) {
		const p = Object.assign( {}, pref );

		// Normalize options: short-form strings -> { value: string }
		if ( Array.isArray( p.options ) ) {
			p.options = p.options.map( ( opt ) => ( typeof opt === 'string' ? { value: opt } : opt ) );
		}

		// Auto-detect type if not specified
		if ( !p.type && Array.isArray( p.options ) ) {
			p.type = p.options.length === 2 ? 'switch' : 'select';
		}

		normalized.preferences[ key ] = p;
	}

	return normalized;
}

/**
 * Resolve a label from an item with label/labelMsg fields.
 *
 * @param {SectionConfig|PreferenceConfig|PreferenceOption} item
 * @param {'label'|'description'} field
 * @return {string}
 */
function resolveLabel( item, field ) {
	const msgKey = field === 'description' ? 'descriptionMsg' : 'labelMsg';
	if ( item[ msgKey ] ) {
		return mw.message( item[ msgKey ] ).text();
	}
	return item[ field ] || '';
}

module.exports = {
	mergeConfigs,
	normalizeConfig,
	resolveLabel
};
