---
title: Theming
description: Customizing the look and feel of Citizen
---

# Theming

Citizen's visual appearance is controlled by CSS custom properties. Override them in `MediaWiki:Citizen.css` to match your wiki's brand.

## Colors

### Color token architecture

Citizen ships two color token pipelines side by side:

- **legacy** (current default): the OKLCH-derivation system, frozen unchanged. Active at default `:root`.
- **new** (opt-in): three layers — Codex primitives (`--color-gray-100`, `--color-red-500`, …), Citizen extensions (`--color-primary-100..1000`, `--color-neutral-100..1000`), and Codex semantic tokens (`--color-base`, `--color-progressive`, …) mapped onto those primitives. Token definitions for every Codex version Citizen targets (1.14 through 2.5.x) are all declared, so consumers can use newer token names regardless of which Codex the bundled MediaWiki ships. Active under `:root.citizen-token-new`.

The new pipeline is opt-in for now — it ships as a parallel option so existing wikis aren't visually shifted without explicit consent. It becomes the default, and legacy is removed, in the next major Citizen release.

All Citizen tokens are wrapped in `@layer citizen-tokens`, which means **anything you write in `MediaWiki:Citizen.css` or user CSS overrides Citizen's defaults regardless of selector specificity** — no `!important` needed.

### Switching modes

You can switch modes at three levels of permanence:

1. **URL query (one render)** — append `?citizenusenewtoken=1` to opt in, or `=0` to opt out. Useful for previewing and inspection. The query also sets a 24-hour cookie so the choice persists in the same browser.
2. **Cookie (per browser)** — set automatically when you use the URL query.
3. **Site-wide** — set `$wgCitizenUseNewToken` in `LocalSettings.php`. This is the fallback when neither URL query nor cookie is present.

```php
// LocalSettings.php
$wgCitizenUseNewToken = true;  // opt in to the new pipeline site-wide
```

### Re-theming with the new pipeline

The whole Citizen primary palette is OKLCH-derived from a single hue seed. Override that one variable and the entire accent palette retunes:

```css
:root.citizen-token-new {
    --color-primary-oklch__h: 130;  /* green-themed wiki */
}
```

To override an individual primitive (for example, to use your own red instead of Codex's):

```css
:root.citizen-token-new {
    --color-red-700: #aa2244;
}
```

To override a specific semantic token (a one-off, e.g. the link color):

```css
:root { /* unlayered, beats both pipelines */
    --color-link: #d34e24;
}
```

### Re-theming with legacy

Legacy uses an OKLCH-derivation system. Override the seed hue and the rest follows:

| Property | Description | Default value |
| :--- | :--- | :--- |
| `--color-progressive-oklch__l` | Lightness. | `53.25%` |
| `--color-progressive-oklch__c` | Chroma (saturation). | `0.1679` |
| `--color-progressive-oklch__h` | Hue — the easiest way to rebrand. | `262.29` |

::: warning Deprecated
The legacy color pipeline is deprecated and will be removed in the next major Citizen release. Migrate by setting `$wgCitizenUseNewToken = true;` and adapting any custom CSS that depended on the OKLCH-derivation variables.

The HSL fallback variables (`--color-progressive-hsl__h/s/l`) are also deprecated and live only in the legacy pipeline.

| Property | Description |
| :--- | :--- |
| `--color-progressive-hsl__h` | Hue |
| `--color-progressive-hsl__s` | Saturation |
| `--color-progressive-hsl__l` | Lightness |

:::

### Migration from legacy to the new pipeline

| Legacy approach | New-pipeline equivalent |
| :--- | :--- |
| Override `--color-progressive-oklch__h` | Override `--color-primary-oklch__h` (under `:root.citizen-token-new`) |
| Override `--color-destructive__h` (was hue 340) | Override the `--color-red-N` ramp directly, or override `--color-destructive` to a specific shade |
| Override `--color-progressive-oklch__l/c` for the accent itself | Override `--color-primary-500` directly |
| Override `--color-surface-0-oklch__l/c` for surface tinting | Override `--color-neutral-100` (which `--color-surface-0` aliases to) |

State colors (destructive, success, warning) shift visibly between pipelines — legacy used Citizen-tweaked hues while the new pipeline routes through Citizen-tuned primitive ramps. If your wiki had custom CSS keyed off the old hue, expect to re-pick those colors after switching.

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
