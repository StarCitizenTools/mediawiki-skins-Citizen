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

Single-character aliases like `@`, `>`, and `:` can be typed directly to enter the mode instantly, without needing the `/` prefix.

### Mode behavior

When you enter a mode:

- The search icon changes to the mode's icon
- The placeholder updates (e.g., "Search users")
- A back button appears to exit the mode
- Escape follows a three-level pattern: **clear query** → **exit mode** → **close palette**

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
| `getResults` | `function` | No | `(subQuery, signal?) => Promise<Array>` — if provided, this entry is a mode. An optional `AbortSignal` is passed for cancellation. |
| `onResultSelect` | `function` | No | `(item) => { action, payload }` — handles selection of a result item. |

### Action results

`onResultSelect` should return an action object telling the palette what to do:

| Action | Payload | Effect |
| :--- | :--- | :--- |
| `{ action: 'none' }` | - | Stay in the palette, do nothing. |
| `{ action: 'navigate', payload: url }` | URL string | Close the palette and navigate to the URL. |
| `{ action: 'updateQuery', payload: query }` | Query string | Update the search input with a new query. |

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

    getResults: function ( subQuery ) {
        // Return a Promise resolving to an array of result items
        return new Promise( function ( resolve ) {
            setTimeout( resolve, 150 ); // Simulate network delay
        } ).then( function () {
            if ( !subQuery ) {
                return [
                    {
                        id: 'subquery-default',
                        label: 'Default action',
                        description: 'Shown when no sub-query is provided.',
                        type: 'command-subquery'
                    }
                ];
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
