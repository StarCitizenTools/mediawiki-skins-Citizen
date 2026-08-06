---
title: Preferences
description: A panel for personalizing the skin, extensible with on-wiki JSON or JavaScript.
---

# Preferences

Citizen's preferences panel lets readers personalize the skin — theme, font size, page width, and any toggles your wiki adds. You extend the panel through two paths, both using the same configuration schema.

<LinkGrid>
    <LinkCard title="On-wiki JSON" href="#on-wiki-json" target="_self">
        Create MediaWiki:Citizen-preferences.json for site-wide configuration managed by admins.
    </LinkCard>
    <LinkCard title="JavaScript API" href="#javascript-api" target="_self">
        Register preferences from any gadget or user script using mw.hook.
    </LinkCard>
</LinkGrid>

## How it works

Citizen ships with two built-in sections:

| Section | Preferences |
| :--- | :--- |
| `appearance` | Theme, font size, page width, pure black, image dimming |
| `behavior` | Auto-hide navigation, performance mode |

The panel is lazy-loaded, so it doesn't ship in the initial page bundle. Changes to preference configuration — through on-wiki JSON or the JavaScript API — take effect the next time a user opens the panel, with no cache purge required.

## Extending preferences

Admins can override any built-in preference, or add entirely new ones, through `MediaWiki:Citizen-preferences.json`. Gadgets and user scripts can do the same thing via the JavaScript API. Both paths share the same configuration schema.

### Configuration schema

Whether you're writing JSON on-wiki or passing a config object to the JavaScript API, the shape is the same. There are two top-level keys: `sections` and `preferences`.

#### Sections

Sections group related preferences together. Each section needs either an i18n message key or a literal label.

Using an i18n message key:

```json
{
  "sections": {
    "my-section": {
      "labelMsg": "my-extension-section-label"
    }
  }
}
```

Using a literal label:

```json
{
  "sections": {
    "my-section": {
      "label": "My Section"
    }
  }
}
```

#### Preference entries

Each preference is keyed by its feature name.

```json
{
  "preferences": {
    "my-feature": {
      "section": "my-section",
      "type": "switch",
      "options": ["0", "1"],
      "labelMsg": "my-feature-name",
      "descriptionMsg": "my-feature-description"
    }
  }
}
```

**Field reference:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `section` | string | Which section this preference belongs to. |
| `type` | string | `"switch"`, `"select"`, or `"radio"`. Switch and select are auto-detected from the option count (2 options = switch, 3+ = select); `"radio"` must be set explicitly. |
| `options` | array | Short form `["0", "1"]` or long form `[{"value": "0", "labelMsg": "..."}]`. Long-form options also accept `"label"` for literal text instead of an i18n key. |
| `labelMsg` / `label` | string | i18n message key or literal text for the preference name. |
| `descriptionMsg` / `description` | string | i18n message key or literal text for the description. |
| `columns` | number | For radio type, number of columns (default: 2). |
| `visibilityCondition` | string | Optional gate on when the preference appears: `"always"` (default), `"dark-theme"` (visible only in dark theme), `"tablet-viewport"` (visible only at tablet width or above). |
| `default` | string | The value that applies when the user hasn't made a choice. Must be one of the `options` values, letters and numbers only. For preferences defined on-wiki this is applied to every page by the server; for preferences registered through the JavaScript API it sets the panel's initial selection. See [Setting defaults](#setting-defaults). |
| `hidden` | boolean | Set `true` to remove the preference from the panel while keeping it active — for preferences defined on-wiki, its `default` still applies site-wide. Use together with `default` to force a value. Sections whose preferences are all hidden disappear automatically. |

### `label` vs `labelMsg`

Both sections and preferences support two ways to set their display text:

- **`labelMsg`** (and `descriptionMsg`) references an i18n message key. The message must be loadable via the MediaWiki API. Use this for multilingual wikis so labels are translated automatically.
- **`label`** (and `description`) is a literal string used as-is. Use this for single-language wikis or quick prototyping.

The same pattern applies to `descriptionMsg` / `description`.

### On-wiki JSON

The simplest way to manage preferences — create a JSON page on your wiki at `MediaWiki:Citizen-preferences.json`.

#### Merge behavior

Your configuration is merged with the built-in defaults:

- **Omitting** a built-in preference or section keeps its default.
- Setting a preference to **`null`** removes it from the panel. Sections with no remaining preferences are dropped automatically. Unlike [`hidden`](#preference-entries), a `null` preference is gone entirely — it can't carry a `default`, and a `null` `skin-theme` stops informing theme-dependent visibility. Prefer `hidden: true` when the feature should stay active.
- **Overriding** specific fields of a built-in preference merges them — unspecified fields keep their default values.
- **Options arrays** are replaced wholesale, not merged element-by-element. If you override `options`, provide the full list.

#### Examples

##### Adding a custom toggle

```json
{
  "sections": {
    "extensions": {
      "label": "Extensions"
    }
  },
  "preferences": {
    "my-extension-dark-reader": {
      "section": "extensions",
      "type": "switch",
      "options": ["0", "1"],
      "label": "Dark Reader",
      "description": "Enable Dark Reader extension"
    }
  }
}
```

##### Removing a built-in preference

```json
{
  "preferences": {
    "citizen-feature-performance-mode": null
  }
}
```

##### Modifying theme options

This removes the "auto" option from the theme preference, leaving only day and night:

```json
{
  "preferences": {
    "skin-theme": {
      "options": [
        { "value": "day", "labelMsg": "citizen-theme-day-label" },
        { "value": "night", "labelMsg": "citizen-theme-night-label" }
      ],
      "columns": 2
    }
  }
}
```

### Setting defaults

Every preference can declare a `default` — the value that applies when a visitor hasn't made a choice. For preferences managed on-wiki (built-in or added in the JSON), Citizen applies the default on the server: the `<feature>-clientpref-<value>` class is on the `<html>` element from the first paint, so CSS keyed to it always works. The server read relies on database messages, so on a wiki running `$wgUseDatabaseMessages = false` a `default` only affects the panel's selection, not the served page.

Changing a built-in default:

```json
{
  "preferences": {
    "citizen-feature-custom-width": { "default": "wide" }
  }
}
```

An added preference with a default:

```json
{
  "preferences": {
    "my-extension-dark-reader": {
      "section": "extensions",
      "type": "switch",
      "options": ["0", "1"],
      "default": "1",
      "label": "Dark Reader"
    }
  }
}
```

The theme works the same way — `"skin-theme": { "default": "night" }` — and supersedes the deprecated [`$wgCitizenThemeDefault`](../config/index.md#wgcitizenthemedefault) config (the JSON value wins when both are set).

The built-in defaults, when you don't override them:

| Preference | Default |
| :--- | :--- |
| `skin-theme` | `os` |
| `citizen-feature-custom-font-size` | `standard` |
| `citizen-feature-custom-width` | `standard` |
| `citizen-feature-pure-black` <!-- citizen-v4-remove — the pure-black preference is deleted at the 4.0 flip; drop this row with it. --> | `0` |
| `citizen-feature-image-dimming` | `0` |
| `citizen-feature-autohide-navigation` | `1` |
| `citizen-feature-performance-mode` | `1` |

::: warning Performance mode detects the device
`citizen-feature-performance-mode` is the one preference where your default doesn't stick. On a visitor's first page load, Citizen checks whether their device has GPU acceleration and stores the answer for them — so your `default` only holds until that check runs, and the detected value applies from their next page load on.
:::

::: info Preferences registered from JavaScript
The server never sees preferences registered through the JavaScript API, so it can't apply their class ahead of time. Their `default` sets the panel's initial selection, and your CSS should treat "no class on `<html>`" and "class equals the default value" as the same state — a user who explicitly picks the default does get the class.
:::

### JavaScript API

Gadgets and user scripts can register preferences at runtime via `mw.hook`. Use this when a gadget needs to ship its own preference toggle without requiring an admin to edit the on-wiki JSON.

#### Usage

```js
mw.hook( 'citizen.preferences.register' ).add( function ( register ) {
    register( {
        sections: { /* ... */ },
        preferences: { /* ... */ }
    } );
} );
```

The `register` function accepts the same config schema as the on-wiki JSON — `sections` and `preferences` with the same field reference.

#### Timing

You don't need to worry about load order. `mw.hook` replays previously fired data to late subscribers, so your `.add()` callback receives the `register` function regardless of whether the preferences panel has loaded. The panel's config is reactive too — calling `register()` after the panel is open updates it in place, no reload needed.

#### Example

A gadget registering a simple toggle:

```js
mw.hook( 'citizen.preferences.register' ).add( function ( register ) {
    register( {
        sections: {
            'my-gadget': { label: 'My Gadget' }
        },
        preferences: {
            'gadget-dark-mode': {
                section: 'my-gadget',
                type: 'switch',
                options: [ '0', '1' ],
                label: 'Dark mode',
                description: 'Enable dark mode for this gadget'
            }
        }
    } );
} );
```

#### Full gadget example

A complete example that registers a preference and reacts to changes — the kind of thing you'd put in a gadget's JavaScript file:

```js
// Register the preference
mw.hook( 'citizen.preferences.register' ).add( function ( register ) {
    register( {
        sections: {
            gadgets: { label: 'Gadgets' }
        },
        preferences: {
            'gadget-enhanced-rc': {
                section: 'gadgets',
                type: 'switch',
                options: [ '0', '1' ],
                label: 'Enhanced recent changes',
                description: 'Use the enhanced recent changes interface'
            }
        }
    } );
} );

// React to changes
mw.hook( 'citizen.preferences.changed' ).add( function ( featureName, value ) {
    if ( featureName === 'gadget-enhanced-rc' ) {
        toggleEnhancedRC( value === '1' );
    }
} );
```

### Custom styles

When a user selects a value, Citizen adds a CSS class to the `<html>` element in the format `<feature>-clientpref-<value>`. You can target these classes in `MediaWiki:Common.css` or gadget styles:

```css
html.my-extension-dark-reader-clientpref-1 {
  /* styles when dark reader is enabled */
}
```

For preferences with a `default`, remember the contract above: style the default state as the base, and key your overrides to the non-default classes.

### Listening for changes

React to preference changes in JavaScript using `mw.hook`:

```js
mw.hook( 'citizen.preferences.changed' ).add( function ( featureName, value ) {
    console.log( featureName + ' changed to ' + value );
} );
```
