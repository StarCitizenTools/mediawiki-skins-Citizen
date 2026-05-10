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
