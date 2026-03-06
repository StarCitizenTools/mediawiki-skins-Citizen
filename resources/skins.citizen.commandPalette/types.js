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
 * @property {string} [value] Optional mode-specific payload associated with the item (e.g. the namespace trigger '/ns:', or the SMW property name for value suggestions).
 * @property {boolean} [highlightQuery] Whether to highlight the query in the label.
 * @property {string} [source] Identifier of the provider that generated this item (e.g., 'recent', 'command', 'search').
 * @property {boolean} [isMouseClick] True if the selection was triggered by a mouse click.
 */

/**
 * Content displayed in the empty or no-results state of the command palette.
 *
 * @typedef {Object} StateContent
 * @property {string} title The heading text.
 * @property {string} description The body text.
 * @property {Object} icon Codex icon object.
 */

/**
 * A mode switches the palette into a different search/browse context.
 *
 * @typedef {Object} PaletteMode
 * @property {string} id Unique identifier for this mode.
 * @property {string[]} triggers Prefixes that activate the mode (e.g., ['/ns:', ':']).
 * @property {string} [label] Display label for this mode in the command list.
 * @property {string} [description] Short explanation shown in the command list.
 * @property {string} [placeholder] Input placeholder when mode is active (e.g., "Search users").
 * @property {Object} [icon] Codex icon object for the header when mode is active.
 * @property {StateContent} [emptyState] Content shown when the mode is active with no query. Falls back to default search messaging.
 * @property {function(string, Array?): StateContent} [noResults] Returns content shown when query produces no results. Receives the query string and optional tokens array. Falls back to default no-results messaging.
 * @property {TokenPattern} [tokenPattern] Optional token detection pattern for auto-tokenization.
 * @property {function(string, AbortSignal?, Array?): Promise<CommandPaletteItem[]>} getResults Returns result items for the given sub-query. Optional signal for abort, optional tokens array.
 * @property {function(CommandPaletteItem): (CommandPaletteActionResult|Promise<CommandPaletteActionResult>)} [onResultSelect] Handles selection of a result item.
 */

/**
 * Defines a token detection pattern for auto-tokenization in the input field.
 *
 * @typedef {Object} TokenPattern
 * @property {string} modeId Which mode produced this pattern.
 * @property {'prefix'|'any'} position Where the token must appear in the query.
 * @property {'root'|string} activeIn Controls when pattern is eligible: 'root' = only when no mode active, a mode id string = only when that mode is active.
 * @property {function(string): {label: string, raw: string}|null} match Tests text and returns token data or null.
 */

/**
 * A command executes an action immediately on selection (no sub-query).
 *
 * @typedef {Object} PaletteCommand
 * @property {string} id Unique identifier for this command.
 * @property {string[]} triggers Prefixes that activate the command.
 * @property {string} [label] Display label for this command in the command list.
 * @property {string} [description] Short explanation shown in the command list.
 * @property {function(CommandPaletteItem): (CommandPaletteActionResult|Promise<CommandPaletteActionResult>)} [onResultSelect] Handles selection — executes the command action.
 */

/**
 * Action to navigate to a URL in the current tab.
 *
 * @typedef {Object} CommandPaletteNavigateAction
 * @property {'navigate'} action
 * @property {string} payload - The URL to navigate to.
 */

/**
 * Action to exit the current mode and set the query string.
 *
 * @typedef {Object} CommandPaletteExitWithQueryAction
 * @property {'exitWithQuery'} action
 * @property {string} payload - The new query string.
 */

/**
 * Action to update the query string within the current mode without exiting.
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
 * @typedef {CommandPaletteNavigateAction | CommandPaletteExitWithQueryAction | CommandPaletteUpdateQueryAction | CommandPaletteNoneAction} CommandPaletteActionResult
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

/**
 * Result returned by a provider's getResults method.
 *
 * @typedef {Object} ProviderResult
 * @property {Array<CommandPaletteItem>} items The result items.
 * @property {boolean} [stale] If true, these are stale results shown while fresh ones load.
 */

/**
 * Configuration for a provider, passed to createProvider.
 *
 * @typedef {Object} ProviderConfig
 * @property {number} [debounceMs=250] Debounce delay in milliseconds.
 * @property {boolean} [keepStaleResults=false] Whether to show previous results while loading.
 */

module.exports = {/* Types are only used for JSDoc */};
