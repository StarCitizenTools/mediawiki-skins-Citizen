---
url: /features/preferences.md
description: >-
  A panel for personalizing the skin, extensible with on-wiki JSON or
  JavaScript.
---

# Preferences

Citizen's preferences panel lets readers personalize the skin — theme, font size, page width, and any toggles your wiki adds. You extend it two ways, and both take the same configuration schema: on-wiki JSON that admins manage, or a JavaScript API for gadgets and user scripts.

The panel is lazy-loaded, so it doesn't ship in the initial page bundle. Configuration changes take effect the next time someone opens it, with no cache purge required.

## Built-in preferences

These are the preferences Citizen ships, and the keys, values and message keys an override has to name. The widget column uses the types under [Widget types](#widget-types), the default column is explained under [Defaults](#defaults), and the channel column refers to the [preview channel](../contribute/preview-channel.md).

### `appearance` — Appearance

| Preference | Label | Widget | Default | Visible | Channel |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `skin-theme` | Color | `radio` | `os` | `always` | Stable |
| `skin-theme` | Theme | `radio` | `os` | `always` | Preview |
| `citizen-feature-custom-font-size` | Text | `segmented` | `standard` | `always` | — |
| `citizen-feature-custom-width` | Width | `segmented` | `standard` | `always` | — |
| `citizen-feature-pure-black` | Pure black mode | `switch` | `0` | `dark-theme` | Stable only |
| `citizen-feature-image-dimming` | Image dimming | `switch` | `0` | `dark-theme` | — |

### `behavior` — Behavior

| Preference | Label | Widget | Default | Visible | Channel |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `citizen-feature-autohide-navigation` | Automatically hide navigation | `switch` | `1` | `tablet-viewport` | — |
| `citizen-feature-performance-mode` | Performance mode | `switch` | `1` | `always` | — |

### Option values

Overriding `options` replaces the whole array, so an override that keeps
existing choices has to restate them — these are the values and message
keys to restate. Preferences whose options carry no label message are left
out: the built-in on/off switches all take `["0", "1"]`.

| Preference | Value | Label message | Channel |
| :--- | :--- | :--- | :--- |
| `skin-theme` | `os` | `citizen-theme-os-label` | — |
| `skin-theme` | `day` | `citizen-theme-day-label` | — |
| `skin-theme` | `night` | `citizen-theme-night-label` | — |
| `skin-theme` | `black` | `citizen-theme-black-label` | Preview only |
| `citizen-feature-custom-font-size` | `small` | `citizen-feature-custom-font-size-small-label` | — |
| `citizen-feature-custom-font-size` | `standard` | `citizen-feature-custom-font-size-standard-label` | — |
| `citizen-feature-custom-font-size` | `large` | `citizen-feature-custom-font-size-large-label` | — |
| `citizen-feature-custom-font-size` | `xlarge` | `citizen-feature-custom-font-size-xlarge-label` | — |
| `citizen-feature-custom-width` | `standard` | `citizen-feature-custom-width-standard-label` | — |
| `citizen-feature-custom-width` | `wide` | `citizen-feature-custom-width-wide-label` | — |
| `citizen-feature-custom-width` | `full` | `citizen-feature-custom-width-full-label` | — |

## Configuration schema

Whether you're writing JSON on-wiki or passing a config object to the JavaScript API, the shape is the same. There are two top-level keys: `sections` and `preferences`.

### Sections

Sections group related preferences together. Each one needs a label, given either as an i18n message key:

```json
{
  "sections": {
    "my-section": {
      "labelMsg": "my-extension-section-label"
    }
  }
}
```

or as literal text:

```json
{
  "sections": {
    "my-section": {
      "label": "My Section"
    }
  }
}
```

Prefer `labelMsg` on a multilingual wiki so labels are translated automatically. `label` is used as-is, which suits a single-language wiki or a quick prototype. The same pairing applies to `descriptionMsg` / `description`, and to the labels on individual options.

### Preference entries

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
| `type` | string | Which widget renders the options. See [Widget types](#widget-types). |
| `variant` | string | For segmented type, the glyph each option draws instead of its label. See [Widget types](#widget-types). |
| `options` | array | Short form `["0", "1"]` or long form `[{"value": "0", "labelMsg": "..."}]`. Long-form options also accept `"label"` for literal text instead of an i18n key. |
| `labelMsg` / `label` | string | i18n message key or literal text for the preference name. |
| `descriptionMsg` / `description` | string | i18n message key or literal text for the description. |
| `columns` | number | For radio type, number of columns (default: 2). |
| `visibilityCondition` | string | Optional gate on when the preference appears: `"always"` (default), `"dark-theme"` (visible only in dark theme), `"tablet-viewport"` (visible only at tablet width or above). |
| `default` | string | The value that applies when the user hasn't made a choice. Must be one of the `options` values, letters and numbers only. For preferences defined on-wiki this is applied to every page by the server; for preferences registered through the JavaScript API it sets the panel's initial selection. See [Setting defaults](#defaults). |
| `hidden` | boolean | Set `true` to remove the preference from the panel while keeping it active — for preferences defined on-wiki, its `default` still applies site-wide. Use together with `default` to force a value. Sections whose preferences are all hidden disappear automatically. |

### Widget types

| Type | Renders as | Best for |
| :--- | :--- | :--- |
| `switch` | A toggle | On/off settings. |
| `select` | A dropdown | Long option lists, or labels too long to show side by side. |
| `radio` | A grid of cards | A few options that each need a visible label. `columns` sets the grid width. |
| `segmented` | One connected track | An ordered scale, where the filled segment also shows where the current value sits. |

`switch` and `select` are auto-detected from the option count — 2 options gives
a switch, 3 or more a select. `radio` and `segmented` must be set explicitly.

Keep labels short for `segmented`: a segment is a third to a quarter of the
panel's width, and the current one is shown beside the preference's heading. The
built-in Text and Width preferences add `variant` (`"font-size"` or `"width"`)
to draw a glyph per segment instead of a label, sized by an option's position in
the list, so a trimmed or extended `options` array still renders in order. Set
`"type": "select"` on either to get the dropdown back.

## On-wiki JSON

The simplest way to manage preferences — create a JSON page on your wiki at `MediaWiki:Citizen-preferences.json`.

### Merge behavior

Your configuration is merged with the built-in defaults:

* **Omitting** a built-in preference or section keeps its default.
* Setting a preference to **`null`** removes it from the panel. Sections with no remaining preferences are dropped automatically. Unlike [`hidden`](#preference-entries), a `null` preference is gone entirely — it can't carry a `default`, and a `null` `skin-theme` stops informing theme-dependent visibility. Prefer `hidden: true` when the feature should stay active.
* **Overriding** specific fields of a built-in preference merges them — unspecified fields keep their default values.
* **Options arrays** are replaced wholesale, not merged element-by-element. If you override `options`, provide the full list.

### Examples

#### Adding a custom toggle

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

#### Removing a built-in preference

```json
{
  "preferences": {
    "citizen-feature-performance-mode": null
  }
}
```

#### Modifying theme options

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

## JavaScript API

Gadgets and user scripts can register preferences at runtime via `mw.hook`. Use this when a gadget needs to ship its own preference toggle without requiring an admin to edit the on-wiki JSON.

### Registering

```js
mw.hook( 'citizen.preferences.register' ).add( function ( register ) {
    register( {
        sections: { /* ... */ },
        preferences: { /* ... */ }
    } );
} );
```

The `register` function accepts the same config schema as the on-wiki JSON — `sections` and `preferences` with the same [field reference](#preference-entries).

### Timing

You don't need to worry about load order. `mw.hook` replays previously fired data to late subscribers, so your `.add()` callback receives the `register` function regardless of whether the preferences panel has loaded. The panel's config is reactive too — calling `register()` after the panel is open updates it in place, no reload needed.

### Example

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

## Defaults

Every preference can declare a `default` — the value a visitor gets until they pick something else.

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

What each built-in preference defaults to is in the [Built-in preferences](#built-in-preferences) table.

::: warning Performance mode detects the device
`citizen-feature-performance-mode` is the one preference where your default doesn't stick. On a visitor's first page load, Citizen checks whether their device has GPU acceleration and stores the answer for them — so your `default` only holds until that check runs, and the detected value applies from their next page load on.
:::

## Reacting to a preference

When a user selects a value, Citizen adds a CSS class to the `<html>` element in the format `<feature>-clientpref-<value>`. You can target these classes in `MediaWiki:Common.css` or gadget styles:

```css
html.my-extension-dark-reader-clientpref-1 {
  /* styles when dark reader is enabled */
}
```

For a preference defined on-wiki, the class for its [default](#defaults) is already there on the first paint. A preference registered from JavaScript gets no class until the visitor picks a value, so style its default state as the base and key your overrides to the other classes.

To react in JavaScript instead, listen for `citizen.preferences.changed`:

```js
mw.hook( 'citizen.preferences.changed' ).add( function ( featureName, value ) {
    console.log( featureName + ' changed to ' + value );
} );
```
