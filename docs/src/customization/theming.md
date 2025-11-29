---
title: Theming
description: Customizing the look and feel of Citizen
---

# Theming
Citizen allows users with the ability to customise interface to change the look and feel of their wiki with just a few variables.

## Primary color
Citizen uses the **OKLCH** syntax for primary color to calculate right colors for different themes, including surface colors, text colors, etc. For browser that does not support OKLCH, it will fallback to HSL colors. Primary colors are then applied throughout all UI elements, including all supported extensions through skinStyles.

By default, Citizen uses the Codex default progressive color: `#36c`. To change the primary color, simply convert the desired color to OKLCH to set the following variables in the table below. 

| Property	| Description	| Default value |
| --------- | ----------- | ------------- |
| `--color-progressive-oklch__l` | Lightness of primary color | `53.25%` |
| `--color-progressive-oklch__c` | Chroma of primary color | `0.1679` |
| `--color-progressive-oklch__h` | Hue of primary color, this will affect other text and surface colors | `262.29` |

::: info DEPRECATION
Primary colors can be customised further with HSL fallback variables. However, it has been soft-deprecated, and will be discontinued in the future.
| Property	| Description	| Default value |
| --------- | ----------- | ------------- |
| `--color-progressive-hsl__h` | Hue of primary color, this will affect other text and surface colors |
| `--color-progressive-hsl__s` | Saturation of primary color |
| `--color-progressive-hsl__l` | Lightness of primary color |
:::

Primary colors can also be changed as a whole via `--color-progressive` itself.

## Surface color
| Property            | Description |
| ------------------- | ----------- |
| `--color-surface-0` | Site background only (e.g. surface that has the same color as site background) |
| `--color-surface-1` | Surface background 1 (e.g. modal, dropdown) (this has the same color as site background (#fff) in light mode) |
| `--color-surface-2` | Surface background 2 |
| `--color-surface-3` | Surface background 3 |
| `--color-surface-4` | Surface background 4 |

## Text color
Citizen is able to customise text colors with ease.
| Property             | Description                        |
| -------------------- | ---------------------------------- |
| `--color-base`       | Base text color (e.g. body text)   |
| `--color-emphasized` | Emphasized text color (e.g. title) |
| `--color-subtle`     | Subtle text color (e.g. caption)   |

## Appearance
Citizen provides multiple appearance options including light, dark, and pure black modes.
| Theme            | Class    | Notes |
| ---------------- | -------- | ---- |
| Light mode       | `.skin-theme-clientpref-day` | |
| Dark mode        | `.skin-theme-clientpref-night` | |
| Pure black mode  | `.skin-theme-clientpref-night.citizen-feature-pure-black-clientpref-1` | Pure black mode is only accessible if the user selects dark mode. | 
| Automatic mode   | `.skin-theme-clientpref-os` | Uses your device's appearance. |
| Performance mode | `.citizen-feature-performance-mode-clientpref-1` | Disables any filter using `--backdrop-filter-frosted-glass`. |

### Customising the appearance
::: tip
If customising both dark and pure black mode, use `.skin-theme-clientpref-night.citizen-feature-pure-black-clientpref-0` to select only dark mode.
:::

Users with the ability to customise the interface can adjust any of these modes further using CSS. For example, to customise the primary color's hue to purple in **light mode**, do this:
```css
:root.skin-theme-clientpref-day {
    --color-progressive-oklch__h: 301.11;
}
```

To customise the **automatic mode**'s dark mode, do this. Note that you will need to set automatic mode in addition of the night mode color.
```css
/* Automatic mode */
@media screen and (prefers-color-scheme: dark) {
    :root.skin-theme-clientpref-os {
      --color-progressive-oklch__h: 301.11;
    }
}
```

## Fonts
Citizen uses CSS variable to define fonts used through the skin and extension styles. Dfault fonts can be changed by simply redefining the CSS variables.

Since Citizen uses variable fonts heavily, it is recommended to use a variable font for replacement so the font styles are preserved.
| Property                          | Description                                      | Default value    |
| --------------------------------- | ------------------------------------------------ | ---------------- |
| `--font-family-citizen-base`      | Default fonts, used in most places               | `'Roboto'`       |
| `--font-family-citizen-serif`     | Serif fonts, used in blockquotes and some cases  | `'Roboto Serif'` |
| `--font-family-citizen-monospace` | Monospace fonts, used in editors and code blocks | `'Roboto Mono'`  |

## Page width
Citizen uses CSS variable `--width-layout` to define page content width. The variable can be redefined on either the html or the body element.

| Option   | Selector                                                 | Default value |
| -------- | -------------------------------------------------------- | ------------- |
| Standard | `:root.citizen-feature-custom-width-clientpref-standard` | `1080px`      |
| Wide     | `:root.citizen-feature-custom-width-clientpref-wide`     | `1600px`      |
| Full     | `:root.citizen-feature-custom-width-clientpref-full`     | `100vw`       |
