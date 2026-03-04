---
title: Command palette
description: Citizen's search feature and command palette
---

# Command palette

The command palette lets you search for articles quickly and efficiently. Unlike traditional search systems, it supports custom commands that allow you to jump to specific sections, perform actions, or execute tools using simple prefixes.

By default, Citizen includes these commands:

| Command | Alias | Functionality |
| :--- | :--- | :--- |
| `/` | - | Show a list of available commands. |
| `/ns:` | `:` | Search for a page in a specific namespace. |
| `/action:` | `>` | Search for actions available on the current page. |
| `/user:` | `@` | Search for a user. |

## Creating custom commands

Administrators and developers can extend the command palette with custom commands. Use this feature to create shortcuts for external tools, streamlined workflows, or handy redirects.

Commands are registered via the `citizen.commandPalette.register` hook. The hook fires with an object containing a `register` function that accepts your command definition.

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

### Command object

Every command must have at minimum an `id`, `triggers`, and `description`. Depending on whether the command accepts a sub-query, you'll also implement `getResults` and `onResultSelect`.

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Unique identifier for this command. |
| `triggers` | `string[]` | Yes | Prefixes that activate the command. Triggers ending with `:` accept a sub-query. |
| `description` | `string` | Yes | Short explanation shown in the command list. |
| `getResults` | `function` | No | `(subQuery) => Promise<Array>` — returns result items for the given sub-query. |
| `onResultSelect` | `function` | No | `(item) => { action, payload }` — handles selection of a result item. |

#### Action results

`onResultSelect` should return an action object telling the palette what to do:

| Action | Payload | Effect |
| :--- | :--- | :--- |
| `{ action: 'none' }` | - | Stay in the palette, do nothing. |
| `{ action: 'navigate', payload: url }` | URL string | Close the palette and navigate to the URL. |
| `{ action: 'updateQuery', payload: query }` | Query string | Update the search input with a new query. |

### Example: Simple command

This example creates a command that triggers an action directly when selected, without needing any additional input. Triggers should **not** end with a colon since there is no sub-query.

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

### Example: Command with sub-query

This example shows how to create a command that accepts additional input (a "sub-query") to generate dynamic results. Triggers **must** end with a colon (`:`) to indicate that a sub-query is expected.

::: details Toggle code

```js
const mySubqueryCommand = {
    id: 'my-subquery-command',
    triggers: [ '/subquery:', '/sub:' ],
    description: 'Shows results based on your input.',

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
    data.register( mySubqueryCommand );
} );
```

:::

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
