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
 * @property {boolean} [highlightQuery] Whether to highlight the query in the label.
 * @property {string} [source] Identifier of the provider that generated this item (e.g., 'recent', 'command', 'search').
 * @property {boolean} [isMouseClick] True if the selection was triggered by a mouse click.
 */

/**
 * Defines the interface for a Slash Command handler.
 * Each command handler module should export an object conforming to this type.
 *
 * @typedef {Object} CommandPaletteCommand
 * @property {string} id A unique programmatic identifier for the command.
 * @property {string[]} triggers The triggers for the command.
 * @property {string} [description] The user-facing description for the command (used in root '/' suggestions).
 * @property {function(CommandPaletteItem): (CommandPaletteActionResult|Promise<CommandPaletteActionResult>)} [onCommandSelect] Optional: Handles selection of the command item itself.
 * @property {function(string): Promise<Array<CommandPaletteItem>>} [getResults] Optional: Asynchronously fetches and adapts suggestion data based on the sub-query, returning CommandPaletteItems.
 * @property {function(CommandPaletteItem): (CommandPaletteActionResult|Promise<CommandPaletteActionResult>)} [onResultSelect] Optional: Handles selection of an item *generated* by this command.
 */

/**
 * Action to navigate to a URL in the current tab.
 *
 * @typedef {Object} CommandPaletteNavigateAction
 * @property {'navigate'} action
 * @property {string} payload - The URL to navigate to.
 */

/**
 * Action to update the command palette's query string.
 *
 * @typedef {Object} CommandPaletteUpdateQueryAction
 * @property {'updateQuery'} action
 * @property {string} payload - The new query string.
 */

/**
 * Action indicating no operation or that the action was self-contained.
 *
 * @typedef {Object} CommandPaletteNoneAction
 * @property {'none'} action
 * @property {undefined} [payload] - Payload is not applicable for 'none' action.
 */

/**
 * Describes the action the UI should take after an item selection is handled.
 * This is a discriminated union based on the 'action' property.
 *
 * @typedef {CommandPaletteNavigateAction | CommandPaletteUpdateQueryAction | CommandPaletteNoneAction} CommandPaletteActionResult
 */

/**
 * Describes the payload emitted when an action button within a CommandPaletteItem is clicked.
 *
 * @typedef {Object} CommandPaletteActionEvent
 * @property {'dismiss'|'navigate'|'event'|string} type The type of action triggered.
 * @property {string} itemId The ID of the parent CommandPaletteItem.
 * @property {string} actionId The ID of the specific action that was clicked (e.g., 'dismiss', 'edit').
 * @property {string} [url] The URL associated with the action, if any.
 * @property {*} [event] Optional event data for 'event' type actions.
 */

/**
 * @typedef {Object} CitizenCommandPaletteSearchClient
 * @property {function(string): Promise<CommandPaletteSearchResponse>} fetchByQuery
 * @property {function(): Promise<CommandPaletteSearchResponse>} [loadMore]
 */

/**
 * @typedef {Object} CommandPaletteSearchResponse
 * @property {string} query
 * @property {CommandPaletteItem[]} results
 */

/**
 * Defines the interface for a provider of search results for the Command Palette.
 *
 * @interface CommandPaletteProvider
 * @property {string} id - Unique identifier for the provider.
 * @property {boolean} isAsync - Whether the provider fetches results asynchronously.
 * @property {?number} debounceMs - Debounce time in milliseconds for async providers.
 * @property {boolean} keepStaleResultsOnQueryChange - Whether to keep stale results when the query changes.
 * @property {function(string): boolean} canProvide - Method to check if the provider can handle the query.
 * @property {function(string): Array<CommandPaletteItem>|Promise<Array<CommandPaletteItem>>} getResults - Method to fetch results.
 * @property {?function(CommandPaletteItem): CommandPaletteActionResult|Promise<CommandPaletteActionResult>} onResultSelect - Optional method to handle result selection.
 */

module.exports = {/* Types are only used for JSDoc */};
