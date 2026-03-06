---
title: Hooks
description: JavaScript hooks provided by Citizen for extensions and gadgets
---

# Hooks

Citizen fires several [`mw.hook`](https://doc.wikimedia.org/mediawiki-core/master/js/mw.hook.html) events that extensions, gadgets, and user scripts can subscribe to. This page is a quick reference — see the linked feature pages for full details and examples.

## Hook reference

| Hook | Parameters | Description |
| :--- | :--- | :--- |
| `citizen.commandPalette.register` | `{ register }` | Register custom modes and commands in the [command palette](/customization/command-palette#extending-the-command-palette). `register( entry )` accepts a mode or command object. |
| `citizen.preferences.register` | `register` | Register custom sections and preferences in the [preferences panel](/customization/preferences#javascript-api). `register( config )` accepts a config object with `sections` and `preferences`. |
| `citizen.preferences.changed` | `featureName, value` | Fired when a user changes a preference. Use this to [react to changes](/customization/preferences#listening-for-changes) in real time. |

## Usage pattern

All Citizen hooks follow the standard `mw.hook` pattern:

```js
mw.hook( 'citizen.commandPalette.register' ).add( function ( data ) {
    data.register( myEntry );
} );
```

```js
mw.hook( 'citizen.preferences.register' ).add( function ( register ) {
    register( myConfig );
} );
```

```js
mw.hook( 'citizen.preferences.changed' ).add( function ( featureName, value ) {
    if ( featureName === 'my-feature' ) {
        // React to the change
    }
} );
```

## Timing

`mw.hook` replays previously fired data to late subscribers. You don't need to worry about load order — your `.add()` callback will receive the data regardless of whether the firing module has loaded yet.

## Deprecated hooks

| Hook | Replacement |
| :--- | :--- |
| `skins.citizen.commandPalette.registerCommand` | [`citizen.commandPalette.register`](/customization/command-palette#migration-from-previous-api) |

The old hook still works but logs a deprecation warning. See the [migration guide](/customization/command-palette#migration-from-previous-api) for details.
