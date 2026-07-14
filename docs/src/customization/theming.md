---
title: Theming
description: Customizing the look and feel of Citizen
---

# Theming

Citizen's visual appearance is controlled by CSS custom properties. Override them in `MediaWiki:Citizen.css` to match your wiki's brand.

::: tip
To truly make the wiki your own, you would need CSS to style the skin and templates.
If you are getting started, check out the [How to use Dev Tools guide](https://river.me/blog/dev-tools) from River!
:::

## Colors

### Primary color

Citizen uses the **OKLCH** color model for its primary color (called "progressive" in MediaWiki). OKLCH keeps colors perceptually consistent across light and dark mode. The default is a standard blue (`#36c`) — most wikis only need to change the hue.

| Property | Description | Default value |
| :--- | :--- | :--- |
| `--color-progressive-oklch__l` | Lightness. | `53.25%` |
| `--color-progressive-oklch__c` | Chroma (saturation). | `0.1679` |
| `--color-progressive-oklch__h` | Hue — the easiest way to rebrand. | `262.29` |

::: warning Deprecated
The HSL fallback variables are soft-deprecated and will be removed in a future version. Use the OKLCH variables above instead.

| Property | Description |
| :--- | :--- |
| `--color-progressive-hsl__h` | Hue |
| `--color-progressive-hsl__s` | Saturation |
| `--color-progressive-hsl__l` | Lightness |

:::

### Surface colors

Surface colors form the depth hierarchy of the UI — lower numbers sit further back.

| Property | Description |
| :--- | :--- |
| `--color-surface-0` | Page background. |
| `--color-surface-1` | Cards, modals, and dropdowns. |
| `--color-surface-2` | Raised elements within cards. |
| `--color-surface-3` | Hover states and subtle highlights. |
| `--color-surface-4` | Active states and strong highlights. |

### Text colors

| Property | Description |
| :--- | :--- |
| `--color-base` | Default body text. |
| `--color-emphasized` | Titles and headings. |
| `--color-subtle` | Captions and metadata. |
| `--color-link` | Link text. |

## Typography

Citizen ships with [Roboto Flex](https://fonts.google.com/specimen/Roboto+Flex) as its default typeface. You can swap it out by overriding the font family variables:

| Property | Description | Default value |
| :--- | :--- | :--- |
| `--font-family-citizen-base` | Most text in the UI. | `'Roboto'` |
| `--font-family-citizen-serif` | Serif option in the editor and some extensions. | `'Roboto Serif'` |
| `--font-family-citizen-monospace` | Code blocks and editors. | `'Roboto Mono'` |

To use a font from [Google Fonts](https://fonts.google.com) (or any other source), import it and set the variable in `MediaWiki:Citizen.css`. Request the full weight range so all of Citizen's weight variations work correctly:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

:root {
    --font-family-citizen-base: 'Inter';
}
```

::: tip
Set just the font name. Citizen adds `system-ui`, `sans-serif`, and language-specific fallbacks downstream — putting them here yourself can short-circuit the chain for users on the CJK or Arabic modules.
:::

::: tip
Any font works, but [variable fonts](https://fonts.google.com/variablefonts) are recommended — Citizen uses multiple font weights, and a variable font serves them all from a single file.
:::

### Avoiding font flicker

Web fonts load asynchronously — until yours arrives, the browser shows a system fallback. If the two fonts have different metrics, text visibly resizes or shifts when the swap happens.

Citizen ships a metric-matched fallback for Roboto Flex that hides this. If you've swapped Roboto for another font, you can do the same:

1. Generate override descriptors with a tool like [font-style-matcher](https://meowni.ca/font-style-matcher/) or [screenspan.net/fallback](https://screenspan.net/fallback).
2. Add the resulting `@font-face` to your CSS under a distinct family name like `'Inter-fallback'`.
3. Reference it right after your font in the variable:

```css
:root {
    --font-family-citizen-base: 'Inter', 'Inter-fallback';
}
```

## Layout

The page width options are user preferences — users pick from Standard, Wide, or Full in the preferences panel. You can override the widths for each option:

| Option | Selector | Default value |
| :--- | :--- | :--- |
| Standard | `:root.citizen-feature-custom-width-clientpref-standard` | `1080px` |
| Wide | `:root.citizen-feature-custom-width-clientpref-wide` | `1600px` |
| Full | `:root.citizen-feature-custom-width-clientpref-full` | `100vw` |

## Theme modes

Citizen supports Light, Dark, Pure Black, and Automatic modes. Use these selectors in `MediaWiki:Citizen.css` to apply mode-specific styles:

| Mode | Selector |
| :--- | :--- |
| Light | `.skin-theme-clientpref-day` |
| Dark | `.skin-theme-clientpref-night` |
| Pure black | `.skin-theme-clientpref-night.citizen-feature-pure-black-clientpref-1` |
| Automatic | `.skin-theme-clientpref-os` |

Theming works differently on the Citizen 4 preview — see [Themes (Citizen 4 preview)](#themes-citizen-4-preview) below.

### Inverting images in dark mode

Some images, especially black text or icons on a transparent background, become invisible in dark mode. Citizen exposes a `--filter-invert` CSS variable that inverts colors only when a dark theme is active. Apply it to the element containing the image:

```css
filter: var( --filter-invert );
```

## Themes (Citizen 4 preview)

::: warning Preview (Citizen 4)
This section describes theming in Citizen 4. Until it ships, these features require the [preview channel](../contribute/preview-channel.md).
:::

In Citizen 4, themes replace theme modes: a theme is a named set of overrides for the CSS custom properties documented throughout this page. The picker offers Black alongside Light, Dark, and Automatic, and the pure black switch is retired: its look ships as the Black theme, so pick Black in the preferences panel if you had it enabled.

| Theme | Selector |
| :--- | :--- |
| Light | `.skin-theme-clientpref-day` |
| Dark | `.skin-theme-clientpref-night` |
| Black | `.skin-theme-clientpref-black` |
| Automatic | `.skin-theme-clientpref-os` |
| Wiki-defined | `.skin-theme-clientpref-<value>` |

### Creating a theme

Citizen's own Black theme is defined as a small set of overrides, so a theme you add on your wiki appears in the preferences panel right next to the built-in ones. Creating one takes two steps.

#### Register the theme in the picker

Add your theme to the `skin-theme` options in `MediaWiki:Citizen-preferences.json` — see [Extending preferences](../features/preferences.md#extending-preferences) for the full schema. The `options` array replaces the built-in list, so include the built-in themes you want to keep:

```json
{
  "preferences": {
    "skin-theme": {
      "options": [
        { "value": "os", "labelMsg": "citizen-theme-os-label" },
        { "value": "day", "labelMsg": "citizen-theme-day-label" },
        { "value": "night", "labelMsg": "citizen-theme-night-label" },
        { "value": "black", "labelMsg": "citizen-theme-black-label" },
        { "value": "ocean", "label": "Ocean" }
      ]
    }
  }
}
```

The picker sizes itself, so you don't set a column count. Use `label` for a plain-text name, or `labelMsg` with an interface message (e.g. `MediaWiki:Ocean-theme-label`) on multilingual wikis. Theme values may contain letters and numbers only.

#### Define the theme in CSS

Add a block to `MediaWiki:Citizen.css` keyed to your theme's value, starting with a `color-scheme` declaration — the comments walk through the rest:

```css
.skin-theme-clientpref-ocean {
    color-scheme: dark;

    /* Dark baseline for effects light-dark() can't express — copy as-is */
    --opacity-glass: 0.8;
    --shadow-opacity: 0.44;
    --font-grade: 0;
    --filter-invert: invert( 1 ) hue-rotate( 180deg );

    /* Your palette — override only what differs from the default dark theme */
    --color-primary-oklch__h: 220;
    --color-neutral-oklch__h: 220;
}
```

Use the bare `.skin-theme-clientpref-<value>` class (no `:root` prefix) — that is what lets the preferences panel paint a true-color preview of your theme.

Every property you don't override falls through to the default palette's [`light-dark()` pairs](../guide/migrating-to-citizen-4.md#light-and-dark-are-one-declaration-now) — color values that carry a light and a dark side and resolve per `color-scheme`. A dark theme starts from the built-in dark palette, a light theme (`color-scheme: light`) from the light palette, and you sculpt from there. The hue channels are the most useful knobs — `--color-primary-oklch__h` alone rebrands the accent, and `--color-neutral-oklch__h` tints the surfaces to match; see [Rebranding the primary color](../guide/migrating-to-citizen-4.md#rebranding-the-primary-color) for how the two relate.

One limitation to know about: a few dark-mode extras are keyed to the built-in themes by name — the image dimming preference, and dark-mode fixes for some extensions — so they don't fire for custom themes. If your theme needs one of them, replicate it in your theme's CSS block.

::: tip
To make your theme the default for new visitors, set `$wgCitizenThemeDefault = 'ocean';`. Keep the theme registered in the picker too — the preferences panel can't show a selection for a value it doesn't know about.
:::

::: tip
On Citizen 4 the preview is live: because your theme uses the bare `.skin-theme-clientpref-<value>` class, the preferences panel paints each circle in the theme's real colors, so what you see in the picker matches what visitors get.
:::

## Performance considerations

When you're customizing Citizen, two areas reward extra attention:

- **Expensive styles and scripts.** Citizen lets users opt into a lighter experience that strips animations and visual effects. If your customizations include anything weighty — frosted glass, transitions, heavy background images, decorative SVGs, or scripts doing expensive work — adapt them so users on performance mode get a lighter version. See [Performance mode → Custom styles](../features/performance-mode.md#custom-styles) and [→ Custom scripts](../features/performance-mode.md#custom-scripts) for the patterns.
- **Font flicker.** Custom web fonts swap in after the page renders, which can shift layout if their metrics don't match the system fallback. See [Avoiding font flicker](#avoiding-font-flicker) above for how to ship a metric-matched fallback.
