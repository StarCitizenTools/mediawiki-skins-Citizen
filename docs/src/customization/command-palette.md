---
title: Command palette
description: Citizen's search feature
---

# Command palette

The command palette lets users search for articles quickly and efficiently. Unlike the older search system, it also supports custom commands, so users can use prefixes to jump to specific sections or tools without hassle.

Currently, these commands are built-in by default:

| Command    | Alias | Functionality |
| ---------- | ----- | ------------- |
| `/ns:`     | `:`   | Search for a page in a specific namespace. |
| `/action:` | `>`   | Search for actions in the `Special` namespace. |
| `/user:`   | `@`   | Search for a user. |

## Adding custom commands

Users with the ability to edit JavaScript pages are able to add custom commands in the command palette. 

Here a few examples that utilise custom commands in the command palette:
<LinkGrid>
 <LinkCard title="Music command" href="https://tagging.wiki" />
 <LinkCard title="Kit Builder redirect" href="https://itemasylum.miraheze.org" />
 <LinkCard title="Roblox game redirect command" href="https://tagging.wiki" />
</LinkGrid>


### Command without sub-query

This code snippet demonstrates registering a simple command without a sub-query, performing an action directly when selected.

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

### Command with sub-query

This code snippet demonstrates registering a command that uses a sub-query to generate results.

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

		// We always return a Promise, even if it's synchronous.
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
				// Example: Return items based on the sub-query
				results = [
					{
						id: `example-subquery-item-${ subQuery }-1`,
						label: `Result 1 for "${ subQuery }"`,
						description: 'First simulated result.',
						value: `/subquery ${ subQuery } item1`,
						highlightQuery: true // Tell the provider to highlight the subQuery
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
				// Example: Default results when no sub-query is provided yet
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
