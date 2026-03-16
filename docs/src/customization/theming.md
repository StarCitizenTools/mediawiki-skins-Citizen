---
title: Theming
description: Customizing the look and feel of Citizen
---

# Theming

Citizen's visual appearance is controlled by CSS custom properties. Override them in `MediaWiki:Citizen.css` to match your wiki's brand.

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
    --font-family-citizen-base: 'Inter', sans-serif;
}
```

::: tip
Any font works, but [variable fonts](https://fonts.google.com/variablefonts) are recommended — Citizen uses multiple font weights, and a variable font serves them all from a single file.
:::

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
