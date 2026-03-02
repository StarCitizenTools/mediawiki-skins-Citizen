---
title: Preferences
description: How to customize the Citizen preferences panel
---

# Preferences

Citizen's preferences panel is extensible. Wiki admins can add, modify, or remove preferences by creating the JSON page `MediaWiki:Citizen-preferences.json` on their wiki.

## How it works

Citizen ships with a set of built-in preferences (theme, font size, page width, pure black, auto-hide navigation, performance mode). Admins can override any of these, or add entirely new ones, by placing a JSON configuration on `MediaWiki:Citizen-preferences.json`.

Changes take effect when users next open the preferences panel — the panel is lazy-loaded, so there's no need to purge caches.

## Configuration schema

The JSON has two top-level keys: `sections` and `preferences`.

### Sections

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

#### Field reference

| Field | Type | Description |
| :--- | :--- | :--- |
| `section` | string | Which section this preference belongs to. |
| `type` | string | `"switch"`, `"select"`, or `"radio"`. Auto-detected if omitted (2 options = switch, 3+ = select). |
| `options` | array | Short form `["0", "1"]` or long form `[{"value": "0", "labelMsg": "..."}]`. |
| `labelMsg` / `label` | string | i18n message key or literal text for the preference name. |
| `descriptionMsg` / `description` | string | i18n message key or literal text for the description. |
| `columns` | number | For radio type, number of columns (default: 2). |

## `label` vs `labelMsg`

Both sections and preferences support two ways to set their display text:

- **`labelMsg`** (and `descriptionMsg`): References an i18n message key. The message must be loadable via the MediaWiki API. Use this for multilingual wikis so that labels are translated automatically.
- **`label`** (and `description`): A literal string used as-is. Use this for single-language wikis or quick prototyping.

The same pattern applies to `descriptionMsg` / `description`.

## Merge behavior

When you create `MediaWiki:Citizen-preferences.json`, your configuration is merged with the built-in defaults:

- **Omitting** a built-in preference keeps its default.
- Setting a preference to **`null`** removes it from the panel.
- **Overriding** specific fields of a built-in preference merges them — unspecified fields keep their default values.
- **Options arrays** are replaced wholesale, not merged element-by-element. If you override `options`, provide the full list.

## Built-in sections

Citizen ships with two sections:

| Section | Preferences |
| :--- | :--- |
| `appearance` | Theme, font size, page width, pure black |
| `behavior` | Auto-hide navigation, performance mode |

## Examples

### Adding a custom toggle

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

### Removing a built-in preference

```json
{
  "preferences": {
    "citizen-feature-performance-mode": null
  }
}
```

### Modifying theme options

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

## Styling custom preferences

When a user selects a value, Citizen adds a CSS class to the `<html>` element in the format `<feature>-clientpref-<value>`. You can target these classes in `MediaWiki:Common.css` or gadget styles:

```css
html.my-extension-dark-reader-clientpref-1 {
  /* styles when dark reader is enabled */
}
```

## Listening for changes

You can react to preference changes in JavaScript using `mw.hook`:

```js
mw.hook( 'citizen.preferences.changed' ).add( function ( featureName, value ) {
  console.log( featureName + ' changed to ' + value );
} );
```
