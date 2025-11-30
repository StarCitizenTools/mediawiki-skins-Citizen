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

Administrators and developers can extend the command palette with custom actions. Use this feature to create shortcuts for external tools, streamlined workflows, or handy redirects.

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

### Example: Simple command

This example creates a command that triggers an action directly when selected, without needing any additional input.

::: details Toggle code

```js
const { CommandPaletteCommand, CommandPaletteItem, CommandPaletteNoneAction } = require( '../types.js' );

const exampleSimpleCommand = {
    /**
     * Unique identifier for this command.
     */
    id: 'example-simple',

    /**
     * Triggers: Keywords that activate this command.
     * Should not end with a colon as there's no sub-query.
     */
    triggers: [ '/simple', '/sim' ],

    /**
     * Description: A short explanation shown below the label.
     */
    description: 'Executes a simple action directly.',

    onCommandSelect( item ) {
        console.debug( '[ExampleSimpleCommand] Command selected:', item );
        mw.notify( `Simple command '${ item.label }' executed!` );
        return { action: 'none' };
    },

    // No getResults or onResultSelect needed for a simple command.
    type: 'command-example-simple' // Add a specific type if needed
};

// Register the command
mw.loader.using( 'skins.citizen.commandPalette' ).then( () => {
    mw.hook( 'skins.citizen.commandPalette.registerCommand' ).add( ( registrationData ) => {
        if ( registrationData && registrationData.registerCommand ) {
            registrationData.registerCommand( exampleSimpleCommand );
        }
    } );
} );
```

:::

### Example: Command with sub-query

This example shows how to create a command that accepts additional input (a "sub-query") to generate dynamic results.

::: details Toggle code

```js
const { CommandPaletteCommand, CommandPaletteItem, CommandPaletteNoneAction } = require( '../types.js' );

const exampleSubqueryCommand = {
    /**
     * Unique identifier for this command.
     */
    id: 'example-subquery',

    /**
     * Triggers: Keywords that activate this command.
     * Must end with a colon (':') to indicate a sub-query is expected.
     */
    triggers: [ '/subquery:', '/sub:' ],

    /**
     * Description: A short explanation shown below the label.
     */
    description: 'Requires a sub-query to show results.',

    getResults( subQuery ) {
        console.debug( `[ExampleSubqueryCommand] Received subQuery: "${ subQuery }"` );

        // Always return a Promise
        return new Promise( ( resolve ) => {
            setTimeout( resolve, 150 ); // Simulate network delay
        } ).then( () => {
            let results = [];

            if ( subQuery.toLowerCase().startsWith( 'help' ) ) {
                results = [
                    {
                        id: 'example-subquery-help',
                        label: 'Sub-query Help',
                        description: 'Shows help info for the sub-query command.',
                        value: '/subquery help' // Value to insert when selected
                    }
                ];
            } else if ( subQuery ) {
                // Return items based on the sub-query
                results = [
                    {
                        id: `example-subquery-item-${ subQuery }-1`,
                        label: `Result 1 for "${ subQuery }"`,
                        description: 'First simulated result.',
                        value: `/subquery ${ subQuery } item1`,
                        highlightQuery: true // Highlight the matched text
                    },
                    {
                        id: `example-subquery-item-${ subQuery }-2`,
                        label: `Result 2 for "${ subQuery }"`,
                        description: 'Second simulated result.',
                        value: `/subquery ${ subQuery } item2`,
                        highlightQuery: true
                    }
                ];
            } else {
                // Default results when no sub-query is provided
                results = [
                    {
                        id: 'example-subquery-default-1',
                        label: 'Default Sub-query Action 1',
                        description: 'Perform the first default sub-query action.',
                        value: '/subquery default1'
                    },
                    {
                        id: 'example-subquery-default-2',
                        label: 'Default Sub-query Action 2',
                        description: 'Perform the second default sub-query action.',
                        value: '/subquery default2'
                    }
                ];
            }

            // Add type: 'command-example-subquery'
            return results.map( ( item ) => Object.assign( {}, item, { type: 'command-example-subquery' } ) );
        } );
    },

    onResultSelect( item ) {
        console.debug( '[ExampleSubqueryCommand] Item selected:', item );

        if ( item.id === 'example-subquery-help' ) {
            mw.notify( 'Displaying help for the sub-query command!' );
            return { action: 'none' }; // Stay in palette
        } else {
            mw.notify( `Action for ${ item.label } would run now.` );
            // Example: Navigate if item has a URL
            // if ( item.url ) {
            //     return { action: 'navigate', payload: item.url };
            // }
            return { action: 'none' };
        }
    }
};

// Register the command
mw.loader.using( 'skins.citizen.commandPalette' ).then( () => {
    mw.hook( 'skins.citizen.commandPalette.registerCommand' ).add( ( registrationData ) => {
        if ( registrationData && registrationData.registerCommand ) {
            registrationData.registerCommand( exampleSubqueryCommand );
        }
    } );
} );
```

:::
