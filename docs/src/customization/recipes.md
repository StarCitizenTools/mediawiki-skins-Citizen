---
title: Recipes
description: Common customizations and CSS snippets for Citizen
---

# Recipes

Quick snippets and examples for common Citizen customizations. CSS recipes go in `MediaWiki:Citizen.css`, and for theme-mode selectors, see the [theming reference](/customization/theming#theme-modes).

## Change the primary color

Citizen uses OKLCH for its accent color, so you only need to adjust the hue. This example sets it to purple in light mode:

```css
:root.skin-theme-clientpref-day {
    --color-progressive-oklch__h: 301.11;
}
```

If your wiki uses automatic mode, you'll also need a media query so the change applies when the device is in dark mode:

```css
@media screen and (prefers-color-scheme: dark) {
    :root.skin-theme-clientpref-os {
        --color-progressive-oklch__h: 301.11;
    }
}
```

::: tip
To target standard dark mode without affecting pure black mode, use `.skin-theme-clientpref-night.citizen-feature-pure-black-clientpref-0`.
:::

## Turn off image hover zoom

Images slightly scale up on hover by default. To keep them static:

```css
:root {
    --transform-image-hover: none;
}
```

## Turn off backdrop blur

Overlays like dropdowns and the command palette apply a subtle blur to the content behind them. To disable it:

```css
:root {
    --backdrop-filter-blur: none;
}
```

## Turn off frosted glass

The sticky header and some overlays use a frosted glass effect — a heavier blur combined with transparency. To make them fully opaque instead:

```css
:root {
    --backdrop-filter-frosted-glass: none;
    --opacity-glass: 1;
}
```

## Remove or modify preferences

Admins can remove or customize any built-in preference through `MediaWiki:Citizen-preferences.json`. See the [preferences documentation](/customization/preferences) for the full schema.

For example, to keep only light and dark in the theme switcher (removing automatic mode):

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

To hide a preference from the panel entirely, set it to `null`:

```json
{
  "preferences": {
    "citizen-feature-pure-black": null,
    "citizen-feature-autohide-navigation": null
  }
}
```

## Configure share services

Admins can replace the default share targets by creating the `MediaWiki:Citizen-share-services.json` page. Valid JSON **fully replaces** the built-in default services list provided by Citizen. If the page isn't set or is invalid, the wiki falls back to those defaults.

Each service uses a single **`icon`** value (data URI or any URL valid in CSS `url(...)`). Icons glyphs are always monochrome on the colored tile.

Optional legacy field: if **`icon`** is omitted but **`file`** is set, the skin resolves `Special:FilePath/<file>` and uses that URL.

```json
[
  {
    "name": "example",
    "label": "Example",
    "url": "https://example.com/share?u={{url}}&t={{title}}",
    "color": "#336699",
    "open_in_modal": true,
    "icon": "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%20fill%3D%22%23000%22%2F%3E%3C%2Fsvg%3E"
  }
]
```

Use **`name`** for a stable DOM id: each tile is `citizen-share-service-<name>` (letters, digits, `_`, and `-` only). If `name` is missing, the index is used instead. Use **`label`** as the user-facing name that will be passed to screen readers, the alt text, and other related browser functionality.
