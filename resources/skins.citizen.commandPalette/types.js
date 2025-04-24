/**
 * @module types
 * Shared JSDoc type definitions for the Command Palette.
 */

/**
 * @typedef {Object} CommandPaletteItemAction
 * @property {string} id Action identifier (e.g., 'edit').
 * @property {string} label Localized action label.
 * @property {string} icon SVG icon string or object.
 * @property {string} url URL for the action.
 */

/**
 * @typedef {Object} CommandPaletteItemMetadata
 * @property {string} [icon] Optional SVG icon string or object.
 * @property {string} label Metadata label (e.g., matched title for redirect).
 * @property {boolean} [highlightQuery] Whether to highlight the query in the label.
 */

/**
 * @typedef {Object} CommandPaletteItemThumbnail
 * @property {string} url Thumbnail URL.
 * @property {number} [width] Thumbnail width.
 * @property {number} [height] Thumbnail height.
 */

/**
 * Represents a display item in the Command Palette list.
 * Based on the props of CommandPaletteListItem.vue.
 *
 * @typedef {Object} CommandPaletteItem
 * @property {string} id Unique identifier for the item (used as :key and element id).
 * @property {string} type Type identifier (e.g., 'page', 'command', 'namespace', 'recent-item'). Used for styling and type labels via mw.message( `citizen-command-palette-type-${type}` ).
 * @property {string} label The primary display label (e.g., page title, command name).
 * @property {string} [url] The primary URL to navigate to when the item is selected. May not apply to all types (e.g., commands that trigger other actions).
 * @property {string} [description] Optional secondary description text.
 * @property {CommandPaletteItemThumbnail} [thumbnail] Optional thumbnail object.
 * @property {string} [thumbnailIcon] Optional placeholder icon identifier (e.g., cdxIcon...) if thumbnail URL is missing. Passed to cdx-thumbnail :placeholder-icon prop.
 * @property {Array<CommandPaletteItemMetadata>} [metadata] Optional list of metadata badges/tags.
 * @property {Array<CommandPaletteItemAction>} [actions] Optional list of actions available for the item.
 * @property {string} [value] Optional value associated with the item, used for specific types like commands (e.g. the command trigger string '/ns').
 */

/**
 * Defines the interface for a Slash Command handler.
 * Each command handler module should export an object conforming to this type.
 *
 * @typedef {Object} CommandHandler
 * @property {string} label The user-facing label for the command (used in root '/' suggestions).
 * @property {string} description The user-facing description for the command (used in root '/' suggestions).
 * @property {function(string): Promise<Array<Object>>} getResults Asynchronously fetches raw suggestion data based on the sub-query.
 * @property {function(Object): CommandPaletteItem} adaptResult Synchronously transforms a single raw result object into a CommandPaletteItem.
 */

/**
 * Describes the action the UI should take after an item selection is handled.
 *
 * @typedef {Object} CommandPaletteActionResult
 * @property {'navigate'|'updateQuery'|'none'} action The type of action the UI should perform.
 * @property {*} [payload] Optional data needed for the action (e.g., URL for 'navigate').
 */

/**
 * @typedef {Object} CommandPaletteSearchResponse
 * @property {string} query
 * @property {CommandPaletteItem[]} results
 */

/**
 * @typedef {Object} NamespaceResult
 * @property {string} label The namespace label.
 * @property {number} value The namespace ID.
 */

/**
 * Below are types for SearchProvider
 * TODO: We should use types/mediawiki package for these types
 */

/**
 * @typedef {Object} SearchClient
 * @property {Function} fetchByQuery
 * @property {Function} [loadMore]
 */

module.exports = {};
