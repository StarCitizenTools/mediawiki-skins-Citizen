---
url: /mediawiki-skins-Citizen/v3.17/features/command-palette.md
description: >-
  A keyboard-driven palette for jumping to pages, running actions, and searching
  the wiki.
---

# Command palette

The command palette is a keyboard-driven launcher for the wiki. Press `/` to see all available entries, or just start typing to search.

## How it works

The palette has two kinds of entries:

* **Modes** change the palette's search context. The header shows the mode's icon and placeholder, and a back button appears. Type to search within the mode.
* **Commands** run their action when you pick them. No input needed.

### Built-in entries

| Trigger | Alias | Type | Description |
| :--- | :--- | :--- | :--- |
| `/` | - | - | Show all available modes and commands. |
| `/ns:` | `:` | Mode | Browse and select a namespace. |
| `/action:` | `>` | Mode | Search for actions and special pages. |
| `/user:` | `@` | Mode | Search for a user. |
| `/cat:` | `#` | Mode | Find a category, then step inside to see its subcategories and pages. |
| `/hist:` | `!` | Mode | Browse the current page's edit history and jump to a diff. |
| `/file:` | `~` | Mode | Find images, PDFs, audio, video, and other files as a gallery. |
| `/smw:` | - | Mode | Query pages with Semantic MediaWiki Ask syntax. Only available when SMW is installed. |
| `/help` | `?` | Command | Open the help overlay to browse every available mode. |

You can type the single-character aliases (`@`, `>`, `:`, `#`, `!`, `~`, `?`) directly — no `/` prefix needed.

### Help overlay

Press `?` at an empty input to open the help overlay. The footer shows the `?` shortcut as a hint whenever it's available. While help is open, the header swaps to a help indicator with a back button, and Esc closes help before any other action.

Help is an overlay — opening it preserves your active mode, query, and any drill-down position, so you can peek and return to where you were.

What you see depends on where you are:

* **At root**: a list of every registered mode on the left and a detail pane on the right. As you arrow through the list, the right pane shows the highlighted mode's icon, name, short description, triggers, and a longer description. Selecting a mode enters it and closes help.
* **Inside a mode**: the same detail pane fills the dialog, describing whichever mode you're currently in.

The overlay focuses on *what each mode is for* — keyboard shortcuts live in the palette footer, where they update contextually as you move around.

### Mode behavior

When you enter a mode:

* The search icon changes to the mode's icon
* The placeholder updates (e.g., "Search users")
* A back button appears to exit the mode
* Escape follows the pattern: **close help (if open)** → **clear query** → **exit mode** → **close palette**

### Tags

Some modes turn parts of your query into tags. For example, typing `Talk:` in default search becomes a `Talk:` tag, so the rest of what you type searches within the Talk namespace.

To change a tag, press Backspace on an empty input. The first press highlights the last tag (footer hint: **Select tag**). A second press turns it back into editable text (footer hint: **Edit tag**), so you can fix a typo without retyping the whole thing. Keep pressing to delete the text character by character.

### Built-in modes

Most built-in modes (namespace, action, user) work as straightforward search — type a query, get results. The modes below have additional behavior worth knowing about.

#### Categories

The category mode helps you find a category and see what's inside it. Open it with `/cat:` or `#`.

* **An empty input** shows the current page's categories — a quick way to see what this article belongs to without scrolling to the bottom of the page.
* **Type a query** to search every category on the wiki by name.
* **Pick a category** to step inside. The header turns into a breadcrumb (e.g. `Categories / Animals / Mammals`), and the list shows the category's subcategories first, then its pages. Keep typing to filter what's at the current level.
* **Backspace on an empty input** backs out one level. At the top, Backspace closes the mode.
* **Each result has action buttons** on the right — focus them with →. Categories offer **View** (the actual `Category:` page) and **Edit**; pages offer **Edit**.

#### Revision history

The history mode lists recent edits to the current page so you can scan who changed what and jump to a diff. Open it with `/hist:` or `!`.

* **An empty input** shows the last 50 revisions, newest first.
* **Type to filter** by editor name or any text in the edit summary — either field can match.
* **Press ↵** on a revision to open the diff against the previous revision. The page's first edit has no previous revision, so it opens that revision directly.
* **Open a wiki page first.** On a special page (or anywhere without a real article), the mode shows an empty state.

::: tip Pair with the Instant Diffs gadget
If users have the [Instant Diffs](https://www.mediawiki.org/wiki/Instant_Diffs) gadget enabled, activating a revision opens the gadget's preview dialog above the still-mounted palette, so they can dismiss it and pick another revision without losing their place. See [Extensions and gadgets](../config/extensions.md#gadget-enhancements) for details.
:::

#### Files and media

The file mode finds images, PDFs, audio, video, and other files on the wiki and renders them as a gallery of thumbnails. Open it with `/file:` or `~`.

* **An empty input on a content page** shows the files used on the current page — a quick way to grab the filename of an image you're looking at without leaving the article. Off-article (or on pages with no file usage) the mode shows its idle empty state.
* **Type a query** to search the wiki's media library. Results appear as tiles with a thumbnail (or a fallback icon for non-visual files like audio or archives).
* **Arrow keys move 2D**: ←/→ step within a row, ↑/↓ jump between rows.
* **The detail panel** on the right shows the file's type, size (dimensions and byte count), upload info (timestamp and uploader), and the license short-name when available. A copy-to-clipboard button next to the filename — or ⌘C / Ctrl+C — copies the filename for use in wikitext.
* **Press ↵** to open the file's `File:` description page.

The mode matches file titles by prefix first, so typing the start of a filename works on every wiki regardless of search backend. If nothing matches by prefix, it falls back to a full-text search — which surfaces deeper hits when [CirrusSearch](https://www.mediawiki.org/wiki/Extension:CirrusSearch) is installed.

#### Semantic MediaWiki

When [Semantic MediaWiki](https://www.semantic-mediawiki.org/) is installed, the `/smw:` mode lets you run Ask queries interactively. Type conditions like `[[Category:City]]` or `[[Located in::Germany]]` — each completed `[[...]]` condition becomes a token chip, and matching pages appear as results.

You can chain multiple conditions together. Each chip narrows the query further, just like conditions in a regular SMW Ask query.

This mode is loaded conditionally and only registered when SMW is available on the wiki.

## Extending the command palette

Administrators and developers can add custom entries to the command palette. Use this to create shortcuts for external tools, streamlined workflows, or handy redirects.

Entries are registered via the `citizen.commandPalette.register` hook:

```js
mw.hook( 'citizen.commandPalette.register' ).add( function ( data ) {
    data.register( myEntry );
} );
```

The hook payload exposes three things:

| Field | Purpose |
| :--- | :--- |
| `register( entry )` | Add a mode or command to the palette. |
| `defineMode( config )` | Validate a mode and fill in defaults. Returns the normalized config, or `null` if validation fails. |
| `defineCommand( config )` | Same as `defineMode`, but for entries that fire an action immediately on selection. |

Wrapping your entry with `defineMode` or `defineCommand` is optional — `register()` accepts plain objects too — but it catches mistakes at load time instead of letting them slip through silently. You get:

* **Typo warnings.** Write `placholder` instead of `placeholder` and the console flags it. The field is kept on the config, so a newer Citizen version that knows about the new key can still use it.
* **Sane defaults.** An unknown `layout` falls back to `'list'`, `compactResults` is coerced to a boolean, and `compactResults: true` paired with `layout: 'gallery'` is dropped (gallery has no rows to compact).
* **Refusal on broken shapes.** Modes missing an `id`, with empty `triggers`, with non-string trigger entries, or without `getResults` return `null` instead of registering a broken entry.

`register()` accepts `null` safely — it logs a warning and skips registration without touching other modes — so you can chain `data.register( data.defineMode( ... ) )` without a null guard.

Check out these live examples from other wikis. To try them, visit the site, press `/` to open the palette, and type the command:

### Entry properties

Every entry must have at minimum an `id`, `triggers`, and `description`. If the entry provides a `getResults` function, it becomes a **mode**. Without `getResults`, it's a **command**.

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Unique identifier. |
| `triggers` | `string[]` | Yes | Prefixes that activate this entry. Triggers ending with `:` accept a sub-query. |
| `description` | `string` | Yes | Short explanation shown in the command list. |
| `label` | `string` | No | Display label shown for the entry in command lists. Falls back to a humanised form of `id` when omitted. |
| `placeholder` | `string` | No | Input placeholder when the mode is active (e.g., "Search users"). Modes only. |
| `icon` | `Object` | No | Codex icon for the header when the mode is active. Modes only. |
| `compactResults` | `boolean` | No | Render results in a denser layout — a small icon instead of a thumbnail and the description inline beside the label. Use this for command-style modes whose items don't have real thumbnail images. Ignored in gallery layout. Modes only. |
| `layout` | `'list' \| 'gallery'` | No | Result layout. `'list'` (default) renders a vertical list. `'gallery'` renders a tiled grid for thumbnail-driven content like media browsers, and widens the palette to fit. Modes only. |
| `getResults` | `function` | No | `(subQuery, signal?, tokens?, modeContext?) => Promise<Array>` — if provided, this entry is a mode. The optional fourth argument is the current [mode context](#mode-context) stack. |
| `getItemDetail` | `function` | No | `(item, signal?) => Promise<Object>` — lazy detail-pane data for the highlighted item. Use this when the detail is too heavy to compute for every item upfront (the file mode uses it for image metadata and licensing). Modes only. |
| `onResultSelect` | `function` | No | `(item) => { action, payload }` — handles selection of a result item. |
| `headerLabel` | `function` | No | `(modeContext) => string \| null` — replaces the input placeholder with a custom label. Return `null` to fall back to the regular placeholder — useful for showing a breadcrumb only when the mode is drilled in. Typically used with [mode context](#mode-context). Modes only. |
| `emptyState` | `Object` | No | `{ title, description, icon }` — content shown when the mode is active with no query. Falls back to default search messaging. Modes only. |
| `noResults` | `function` | No | `(query, tokens?) => { title, description, icon }` — returns content shown when a query produces no results. Falls back to default no-results messaging. Modes only. |
| `tokenPattern` | `Object \| Object[]` | No | Token detection pattern (or array of patterns) for auto-tokenization. See [token patterns](#token-patterns). Modes only. |
| `keybindings` | `KeyBinding[]` | No | Mode-contributed keyboard bindings, active while the mode is active. See [keybindings](#keybindings). Modes only. |
| `help` | `Object` | No | Content surfaced by the help overlay when this entry is active. See [help content](#help-content). |

### Action results

`onResultSelect` should return an action object telling the palette what to do:

| Action | Payload | Effect |
| :--- | :--- | :--- |
| `{ action: 'none' }` | - | Stay in the palette, do nothing. |
| `{ action: 'navigate', payload: url }` | URL string | Close the palette and navigate to the URL. |
| `{ action: 'exitWithQuery', payload: query }` | Query string | Exit the current mode and set the query string. |
| `{ action: 'updateQuery', payload: query }` | Query string | Update the query within the current mode without exiting. |
| `{ action: 'addToken', payload: token }` | Token object | Append a token chip to the input and clear the free text. Use this when picking a result should add a structured condition to the query — like the SMW mode appending `[[Property::]]` after you pick a property. |
| `{ action: 'pushModeContext', payload: any }` | Any | Step the active mode into a new level. Appends to the [mode context](#mode-context) stack and clears the input. |
| `{ action: 'toggleHelp' }` | - | Toggle the help overlay. |

### Token patterns

Modes can declare a `tokenPattern` to enable auto-tokenization — when the user's input matches the pattern, the matched text is converted into a chip. This is how the namespace mode turns `Talk:` into a chip, and how the SMW mode turns `[[Category:City]]` into one.

| Property | Type | Description |
| :--- | :--- | :--- |
| `modeId` | `string` | Identifies which mode owns this token. |
| `position` | `'prefix' \| 'any'` | Where tokens can appear — `prefix` means only at the start, `any` means anywhere in the input. |
| `activeIn` | `string` | Which mode context this pattern is active in (`'root'` for default search, or a mode id like `'smw'`). |
| `match` | `function` | `(text) => { label, raw } \| null` — tests whether the text starts with a tokenizable pattern. Returns `label` (display text) and `raw` (the original text) on match, or `null`. |
| `eagerMatch` | `function` | Optional lenient matcher used after the standard `match` pass has produced at least one token (useful for paste handling). Allows end-of-string as a valid terminator. Same signature as `match`. |
| `variant` | `string` | Optional visual variant for the chip — e.g. `'outlined'` for chips that should look different from the default solid style. |

Tokens are passed to `getResults` and `noResults` so modes can incorporate them into queries. For example, the SMW mode reconstructs the full Ask query from its token chips plus any free text.

Modes that need multiple tokenization rules — like SMW, which tokenizes both `[[…]]` conditions and printout selectors — can declare `tokenPattern` as an array of pattern objects instead of a single one.

### Help content

The optional `help` field declares the long-form description shown in the help overlay's detail pane, below the triggers.

```js
help: {
    description: 'my-extension-mode-description-help'
}
```

| Property | Type | Description |
| :--- | :--- | :--- |
| `description` | `string` | An i18n message key. The message is rendered with `mw.message().parse()`, so inline markup like `<code>` and `<kbd>` works. |

The mode's existing one-line `description` still appears beside the icon at the top of the help summary; `help.description` is the longer prose continuation that explains how the mode actually behaves — drill-down rules, chip behaviour, anything a user can't infer from the short label.

Keyboard shortcuts live in the palette footer rather than here, so the help overlay can stay focused on what a mode is *for*.

### Mode context

Some modes need to step *into* a result rather than navigate away from it — the category mode walks through nested categories, for example. Mode context is the primitive that supports this: a small stack the active mode owns and pushes onto when the user picks a result.

It's opt-in. Modes that don't need it can ignore it entirely.

* The stack is empty when a mode is entered, and is cleared when the mode exits.
* `{ action: 'pushModeContext', payload }` appends the payload and clears the input, so the user starts fresh at the new level.
* `getResults` gets the current stack as its fourth argument and decides what to show per level.
* `headerLabel( modeContext )` renders a breadcrumb in the header so the user can always tell where they are. Returning `null` falls back to the regular placeholder, so the breadcrumb only shows when there's actually a path to display.
* Backspace on an empty input pops one level. With an empty stack, it falls through to the normal exit-mode behavior.

A minimal example of a drill-down mode:

```js
const myDrillMode = {
    id: 'mydrill',
    triggers: [ '/drill:' ],
    description: 'Drill through nested folders.',

    getResults: function ( subQuery, signal, tokens, modeContext ) {
        const path = modeContext || [];
        const current = path.length ? path[ path.length - 1 ] : null;
        return fetchFolderContents( current, subQuery );
    },

    onResultSelect: function ( item ) {
        if ( item.type === 'folder' ) {
            return { action: 'pushModeContext', payload: { id: item.value } };
        }
        return item.url ?
            { action: 'navigate', payload: item.url } :
            { action: 'none' };
    },

    headerLabel: function ( modeContext ) {
        if ( modeContext.length === 0 ) {
            return null; // fall back to the placeholder at the root
        }
        return [ 'Folders' ].concat( modeContext.map( ( c ) => c.id ) ).join( ' / ' );
    }
};
```

### Keybindings

Modes can contribute their own keyboard bindings via the `keybindings` array. Each binding declares when it fires, what it does, and (optionally) what hint to show in the palette footer.

```js
keybindings: [
    {
        id: 'mydrill.refresh',
        zone: 'input',
        keys: [ 'r' ],
        when: ( state ) => state.modifierKey,
        handle: ( state, event ) => {
            event.preventDefault();
            refreshResults();
        },
        hint: {
            msgKey: 'my-extension-mode-refresh-hint',
            kbd: '⌘R'
        }
    }
]
```

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique binding identifier (used for debugging). |
| `zone` | `'input' \| 'action'` | Which focus zone the binding applies to. |
| `keys` | `string[]` | Event `key` values that fire `handle`. An empty array marks the binding as hint-only. |
| `when` | `function` | `(state) => boolean` — predicate over the dispatch state. False suppresses both the handler and the hint. |
| `handle` | `function` | `(state, event) => void` — called when a `keys` entry matches and `when` passes. Call `event.preventDefault()` to claim the keystroke. |
| `worksDuringHelp` | `boolean` | When true, the binding fires even with the help overlay open. Defaults to false. |
| `hint` | `Object \| null` | Footer hint to surface, or `null` to omit one. |

Hint shape:

| Property | Type | Description |
| :--- | :--- | :--- |
| `msgKey` | `string` | i18n message key for the hint label. |
| `kbd` | `string` | Keyboard glyph shown next to the label (e.g. `↵`, `↑↓`, `⌘C`). |
| `order` | `number` | Sort order within the footer (lower = leftmost). |

Mode keybindings are prepended to the core bindings while the mode is active, so a mode binding wins on key collisions within its own focus zone. Footer hints derive from the same list, so a hint is visible iff its handler will fire — no risk of stale hints.

### Example: simple command

A command triggers an action directly when selected. Triggers should **not** end with a colon since there is no sub-query.

::: details Toggle code

```js
mw.hook( 'citizen.commandPalette.register' ).add( function ( data ) {
    data.register( data.defineCommand( {
        id: 'my-simple-command',
        triggers: [ '/simple', '/sim' ],
        description: 'Executes a simple action directly.',
        onResultSelect: function ( item ) {
            mw.notify( 'Simple command executed!' );
            return { action: 'none' };
        }
    } ) );
} );
```

:::

### Example: custom mode

A mode accepts a sub-query and returns dynamic results. Triggers **must** end with a colon (`:`) to indicate that a sub-query is expected.

::: details Toggle code

```js
mw.hook( 'citizen.commandPalette.register' ).add( function ( data ) {
    data.register( data.defineMode( {
        id: 'my-mode',
        triggers: [ '/mymode:', '/mm:' ],
        description: 'Shows results based on your input.',
        placeholder: 'Search my items',
        // icon: cdxIconMyIcon, // Optional Codex icon

        // Shown when the mode is active but no query has been typed
        emptyState: {
            title: 'My custom mode',
            description: 'Type something to search your items.'
            // icon: cdxIconMyIcon // Optional Codex icon
        },

        // Shown when a query returns no results
        noResults: function ( query ) {
            return {
                title: 'No items found',
                description: 'Try a different search term.'
                // icon: cdxIconMyIcon // Optional Codex icon
            };
        },

        getResults: function ( subQuery ) {
            // Return a Promise resolving to an array of result items
            return new Promise( function ( resolve ) {
                setTimeout( resolve, 150 ); // Simulate network delay
            } ).then( function () {
                if ( !subQuery ) {
                    return [];
                }

                return [
                    {
                        id: 'subquery-result-1',
                        label: 'Result for "' + subQuery + '"',
                        description: 'First result.',
                        url: mw.util.getUrl( subQuery ),
                        type: 'command-subquery',
                        highlightQuery: true
                    }
                ];
            } );
        },

        onResultSelect: function ( item ) {
            if ( item.url ) {
                return { action: 'navigate', payload: item.url };
            }
            return { action: 'none' };
        }
    } ) );
} );
```

:::

### Migration from previous API

::: warning Breaking change
If you have custom commands registered with the previous API, you'll need to update them:

* The hook has been renamed from `skins.citizen.commandPalette.registerCommand` to `citizen.commandPalette.register`
* The hook callback now receives `{ register }` instead of `{ registerCommand }`
* The `onCommandSelect` property has been renamed to `onResultSelect`
* The `type` property on the command object is no longer needed (set it on individual result items instead)

The old hook name still works but will log a deprecation warning. Please migrate to the new name.

**Before:**

```js
mw.hook( 'skins.citizen.commandPalette.registerCommand' ).add( function ( data ) {
    data.registerCommand( myCommand ); // [!code --]
} );
```

**After:**

```js
mw.hook( 'citizen.commandPalette.register' ).add( function ( data ) {
    data.register( myCommand ); // [!code ++]
} );
```

:::
