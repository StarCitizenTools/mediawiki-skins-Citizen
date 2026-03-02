/**
 * @module types
 * Shared JSDoc type definitions for the preferences panel.
 */

/**
 * A single option value for a preference.
 * Short-form strings (e.g., '0', '1') are normalized to this shape
 * by normalizeConfig().
 *
 * @typedef {Object} PreferenceOption
 * @property {string} value The clientpref value written to <html> (e.g., 'os', '0', '1').
 * @property {string} [label] Literal display label.
 * @property {string} [labelMsg] i18n message key for the label.
 */

/**
 * Configuration for a single preference entry.
 * Used in both built-in defaults and admin overrides from
 * MediaWiki:Citizen-preferences.json.
 *
 * @typedef {Object} PreferenceConfig
 * @property {string} section Key of the section this preference belongs to.
 * @property {Array<string|PreferenceOption>} options Available values.
 *   Short-form strings are normalized to PreferenceOption by normalizeConfig().
 * @property {'switch'|'select'|'radio'} [type] Widget type.
 *   Auto-detected if omitted: 2 options = 'switch', 3+ = 'select'.
 * @property {string} [label] Literal heading text.
 * @property {string} [labelMsg] i18n message key for the heading.
 * @property {string} [description] Literal description text.
 * @property {string} [descriptionMsg] i18n message key for the description.
 * @property {'always'|'dark-theme'|'tablet-viewport'} [visibilityCondition]
 *   When the preference is visible. Defaults to 'always'.
 * @property {number} [columns] Grid columns for radio type (default: 2).
 */

/**
 * Configuration for a section that groups related preferences.
 *
 * @typedef {Object} SectionConfig
 * @property {string} [label] Literal section heading.
 * @property {string} [labelMsg] i18n message key for the section heading.
 */

/**
 * Top-level preferences configuration object.
 * Returned by getDefaultConfig(), accepted by mergeConfigs(),
 * and provided to the Vue app via inject('preferencesConfig').
 *
 * @typedef {Object} PreferencesConfig
 * @property {Object<string, SectionConfig>} sections
 *   Section definitions keyed by section identifier.
 * @property {Object<string, PreferenceConfig>} preferences
 *   Preference definitions keyed by feature name
 *   (matches the <feature> in <feature>-clientpref-<value> classes).
 */

/**
 * A normalized preference config where all options are long-form
 * PreferenceOption objects and type is always set.
 * Produced by normalizeConfig().
 *
 * @typedef {Object} NormalizedPreferenceConfig
 * @property {string} section Key of the section this preference belongs to.
 * @property {PreferenceOption[]} options Normalized option objects.
 * @property {'switch'|'select'|'radio'} type Widget type (always present after normalization).
 * @property {string} [label] Literal heading text.
 * @property {string} [labelMsg] i18n message key for the heading.
 * @property {string} [description] Literal description text.
 * @property {string} [descriptionMsg] i18n message key for the description.
 * @property {'always'|'dark-theme'|'tablet-viewport'} [visibilityCondition]
 *   When the preference is visible. Defaults to 'always'.
 * @property {number} [columns] Grid columns for radio type (default: 2).
 */

/**
 * A fully normalized top-level config where all preferences have been
 * through normalizeConfig(). This is the shape provided to the Vue app.
 *
 * @typedef {Object} NormalizedPreferencesConfig
 * @property {Object<string, SectionConfig>} sections Section definitions.
 * @property {Object<string, NormalizedPreferenceConfig>} preferences
 *   Normalized preference definitions.
 */

module.exports = {/* Types are only used for JSDoc */};
