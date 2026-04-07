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

By default, the share control uses the [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) when available, with a clipboard fallback. The service list below applies only when the customizable share panel is enabled with `$wgCitizenEnableCustomizableSharePanel = true;` in `LocalSettings.php`.

Admins can replace the default share targets by creating the `MediaWiki:Citizen-share-services.json` page. Valid JSON **fully replaces** the built-in default services list provided by Citizen. If the page isn't set or is invalid, the wiki falls back to those defaults.

```json
[
  {
    "name": "service-name-or-id",
    "label": "Service Name",
    "url": "https://example.com/share?u={{url}}&t={{title}}",
    "color": "#336699",
    "open_in_modal": true,
    "icon": "https://simpleicons.org/icons/facebook.svg"
  }
]
```

### Service configuration reference

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | string | The ID or name of the service. Can be used to add custom styling to a service button (i.e., `citizen-share-service-<name>`)  |
| `label` | string | The label for the service (usually its name). While mainly icons are shown for each service, this value will be used as the user-facing name of the service that will be passed to screen readers, the alt text, and other related browser functionality. |
| `url` | string | The URL that will open when a user clicks the service button. Use ``{{url}}`` and `{{title}}` to fill in the URL of the page and the title of it. |
| `color` | string | The background color of the service's button. Consider using the correct HEX color based on the company's branding guidelines if applicable. |
| `open_in_modal` | string | If clicking the service's button should open the URL in a popup browser window/modal. |
| `icon` | string | The icon of the service. Displayed directly on the service's button in the share menu. Directly use a URL, a valid data URI, or any URL valid in CSS `url(...)`. Icons glyphs are always monochrome on the colored tile. |


Optional legacy field: if **`icon`** isn't included, but **`file`** is set, the skin resolves `Special:FilePath/<file>` and uses that URL instead, allowing you to use an image or SVG on your wiki.

Please note that if you operate a large wiki and wish to use custom services along with icons that you should consider using data URIs directly and filenames if that is not possible. This prevents depending on a third-party service and can also sometimes be more effecient.