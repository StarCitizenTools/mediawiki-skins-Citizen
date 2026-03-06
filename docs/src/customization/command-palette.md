---
title: Command palette
description: Citizen's search feature and command palette
---

# Command palette

The command palette lets you search for articles quickly and efficiently. Press `/` to see all available entries, or type to start searching right away.

## Modes and commands

The palette supports two kinds of entries:

- **Modes** switch the palette into a different search context. When you enter a mode, the header updates with the mode's icon and placeholder, and a back button appears. Type a query to search within that mode.
- **Commands** execute an action immediately when selected — no additional input needed.

### Built-in entries

| Trigger | Alias | Type | Description |
| :--- | :--- | :--- | :--- |
| `/` | - | - | Show all available modes and commands. |
| `/ns:` | `:` | Mode | Browse and select a namespace. |
| `/action:` | `>` | Mode | Search for actions and special pages. |
| `/user:` | `@` | Mode | Search for a user. |
| `/smw:` | - | Mode | Query pages with Semantic MediaWiki Ask syntax. Only available when SMW is installed. |

Single-character aliases like `@`, `>`, and `:` can be typed directly to enter the mode instantly, without needing the `/` prefix.

### Mode behavior

When you enter a mode:

- The search icon changes to the mode's icon
- The placeholder updates (e.g., "Search users")
- A back button appears to exit the mode
- Escape follows a three-level pattern: **clear query** → **exit mode** → **close palette**

### Tokenized input

Some modes support **tokenized input**, where structured parts of the query are displayed as chips in the search field. For example, typing `Talk:` in the default search converts the prefix into a chip, so further input searches within the Talk namespace. Press backspace on an empty input to remove the last chip.

## Built-in modes

Most built-in modes (namespace, action, user) work as straightforward search — type a query, get results. The modes below have additional behavior worth knowing about.

### Semantic MediaWiki

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

Check out these live examples from other wikis. To try them, visit the site, press `/` to open the palette, and type the command:

<LinkGrid>
    <LinkCard title="Music command" href="https://tagging.wiki">
        Command: `/music`
    </LinkCard>
    <LinkCard title="Kit Builder redirect" href="https://itemasylum.miraheze.org">
        Command: `/kit builder`
    </LinkCard>
    <LinkCard title="Roblox game redirect" href="https://tagging.wiki">
        Command: `/play`
    </LinkCard>
    <LinkCard title="Confetti" href="https://starcitizen.tools/MediaWiki:Gadget-Confetti.js#L-17">
        Command: `/confetti`
    </LinkCard>
</LinkGrid>

### Entry properties

Every entry must have at minimum an `id`, `triggers`, and `description`. If the entry provides a `getResults` function, it becomes a **mode**. Without `getResults`, it's a **command**.

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Unique identifier. |
| `triggers` | `string[]` | Yes | Prefixes that activate this entry. Triggers ending with `:` accept a sub-query. |
| `description` | `string` | Yes | Short explanation shown in the command list. |
| `placeholder` | `string` | No | Input placeholder when mode is active (e.g., "Search users"). Modes only. |
| `icon` | `Object` | No | Codex icon for the header when mode is active. Modes only. |
| `getResults` | `function` | No | `(subQuery, signal?, tokens?) => Promise<Array>` — if provided, this entry is a mode. An optional `AbortSignal` and the current token array are passed as additional arguments. |
| `onResultSelect` | `function` | No | `(item) => { action, payload }` — handles selection of a result item. |
| `emptyState` | `Object` | No | `{ title, description, icon }` — content shown when the mode is active with no query. Falls back to default search messaging. Modes only. |
| `noResults` | `function` | No | `(query, tokens?) => { title, description, icon }` — returns content shown when a query produces no results. Falls back to default no-results messaging. Modes only. |
| `tokenPattern` | `Object` | No | Token detection pattern for auto-tokenization. See [token patterns](#token-patterns). Modes only. |

### Action results

`onResultSelect` should return an action object telling the palette what to do:

| Action | Payload | Effect |
| :--- | :--- | :--- |
| `{ action: 'none' }` | - | Stay in the palette, do nothing. |
| `{ action: 'navigate', payload: url }` | URL string | Close the palette and navigate to the URL. |
| `{ action: 'updateQuery', payload: query }` | Query string | Update the search input with a new query. |

### Token patterns

Modes can declare a `tokenPattern` to enable auto-tokenization — when the user's input matches the pattern, the matched text is converted into a chip. This is how the namespace mode turns `Talk:` into a chip, and how the SMW mode turns `[[Category:City]]` into one.

| Property | Type | Description |
| :--- | :--- | :--- |
| `modeId` | `string` | Identifies which mode owns this token. |
| `position` | `'prefix' \| 'any'` | Where tokens can appear — `prefix` means only at the start, `any` means anywhere in the input. |
| `activeIn` | `string` | Which mode context this pattern is active in (`'root'` for default search, or a mode id like `'smw'`). |
| `match` | `function` | `(text) => { label, raw } \| null` — tests whether the text starts with a tokenizable pattern. Returns `label` (display text) and `raw` (the original text) on match, or `null`. |

Tokens are passed to `getResults` and `noResults` so modes can incorporate them into queries. For example, the SMW mode reconstructs the full Ask query from its token chips plus any free text.

### Example: simple command

A command triggers an action directly when selected. Triggers should **not** end with a colon since there is no sub-query.

::: details Toggle code

```js
const myCommand = {
    id: 'my-simple-command',
    triggers: [ '/simple', '/sim' ],
    description: 'Executes a simple action directly.',
    onResultSelect: function ( item ) {
        mw.notify( 'Simple command executed!' );
        return { action: 'none' };
    }
};

mw.hook( 'citizen.commandPalette.register' ).add( function ( data ) {
    data.register( myCommand );
} );
```

:::

### Example: custom mode

A mode accepts a sub-query and returns dynamic results. Triggers **must** end with a colon (`:`) to indicate that a sub-query is expected.

::: details Toggle code

```js
const myMode = {
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
};

mw.hook( 'citizen.commandPalette.register' ).add( function ( data ) {
    data.register( myMode );
} );
```

:::

## Migration from previous API

::: warning Breaking change
If you have custom commands registered with the previous API, you'll need to update them:

- The hook has been renamed from `skins.citizen.commandPalette.registerCommand` to `citizen.commandPalette.register`
- The hook callback now receives `{ register }` instead of `{ registerCommand }`
- The `onCommandSelect` property has been renamed to `onResultSelect`
- The `type` property on the command object is no longer needed (set it on individual result items instead)

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
