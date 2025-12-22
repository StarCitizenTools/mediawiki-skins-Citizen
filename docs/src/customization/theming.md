---
title: Theming
description: Customizing the look and feel of Citizen
---

# Theming

Citizen allows you to customize the interface to match your brand or personal preference. With just a few CSS variables, you can completely change the look and feel of your wiki.

## Colors

Citizen's color system is designed to be flexible and accessible.

### Primary color

Citizen uses the **OKLCH** color model for its primary color system to ensure consistent theming across light and dark mode. The default progressive color is a standard blue (`#36c`), but you can change it by updating the hue, chroma, and lightness variables.

| Property | Description | Default value |
| :--- | :--- | :--- |
| `--color-progressive-oklch__l` | Lightness of the primary color. | `53.25%` |
| `--color-progressive-oklch__c` | Chroma (saturation) of the primary color. | `0.1679` |
| `--color-progressive-oklch__h` | Hue of the primary color. affects text and surface accents. | `262.29` |

::: warning Deprecated
The HSL fallback variables are soft-deprecated and will be removed in a future version. We recommend using the OKLCH variables above.

| Property | Description |
| :--- | :--- |
| `--color-progressive-hsl__h` | Hue (affects accents) |
| `--color-progressive-hsl__s` | Saturation |
| `--color-progressive-hsl__l` | Lightness |

:::

### Surface color

These variables control the background colors of various UI elements.

| Property | Description |
| :--- | :--- |
| `--color-surface-0` | The main site background. |
| `--color-surface-1` | Secondary surfaces like modals and dropdowns. |
| `--color-surface-2` | Tertiary surfaces. |
| `--color-surface-3` | Quaternary surfaces. |
| `--color-surface-4` | Quinary surfaces. |

### Text color

Adjust these variables to change the readability and hierarchy of your text.

| Property | Description |
| :--- | :--- |
| `--color-base` | The default body text color. |
| `--color-emphasized` | High-contrast text for titles and headers. |
| `--color-subtle` | Low-contrast text for captions and metadata. |
| `--color-link` | The default body link color. |

## Typography

Define the fonts used throughout your wiki. Since Citizen relies heavily on font weights, we recommend using variable fonts to ensure styles are preserved correctly.

| Property | Description | Default value |
| :--- | :--- | :--- |
| `--font-family-citizen-base` | The default font used for most text. | `'Roboto'` |
| `--font-family-citizen-serif` | Serif font used for blockquotes and specific accents. | `'Roboto Serif'` |
| `--font-family-citizen-monospace` | Monospace font used for code blocks and editors. | `'Roboto Mono'` |

## Layout

You can control the maximum width of the page content using the `--width-layout` variable. This can be applied to the `:root` or `body` element.

| Option | Selector | Default value |
| :--- | :--- | :--- |
| Standard | `:root.citizen-feature-custom-width-clientpref-standard` | `1080px` |
| Wide | `:root.citizen-feature-custom-width-clientpref-wide` | `1600px` |
| Full | `:root.citizen-feature-custom-width-clientpref-full` | `100vw` |

## Theme modes

Citizen provides built-in support for Light, Dark, and Pure Black modes, as well as an Automatic mode that follows the user's device settings.

| Theme | Class | Notes |
| :--- | :--- | :--- |
| Light mode | `.skin-theme-clientpref-day` | |
| Dark mode | `.skin-theme-clientpref-night` | |
| Pure black mode | `.skin-theme-clientpref-night.citizen-feature-pure-black-clientpref-1` | Available only when Dark mode is active. |
| Automatic mode | `.skin-theme-clientpref-os` | Respects the device's system preference. |
| Performance mode | `.citizen-feature-performance-mode-clientpref-1` | Can be used to target low-performance mode |

## Recipes

Here are some common customizations you can apply to your wiki.

### Customizing the primary color

To change the primary color (for example, to purple) only in **light mode**:

```css
:root.skin-theme-clientpref-day {
    /* Set hue to purple */
    --color-progressive-oklch__h: 301.11;
}
```

To change the color for **automatic mode** (when the device is in dark mode):

```css
@media screen and (prefers-color-scheme: dark) {
    :root.skin-theme-clientpref-os {
      --color-progressive-oklch__h: 301.11;
    }
}
```

::: tip
If you are customizing both standard Dark mode and Pure Black mode, you can target standard Dark mode specifically using `.skin-theme-clientpref-night.citizen-feature-pure-black-clientpref-0`.
:::

### Disabling image zoom

By default, images slightly zoom in when hovered. You can disable this effect:

```css
:root {
    --transform-image-hover: none;
}
```

### Disabling frosted glass

To remove the frosted glass effect from sticky headers and other overlays:

```css
:root {
    --backdrop-filter-frosted-glass: none;
    --opacity-glass: 1;
}
```

### Disabling automatic mode

To disable automatic mode, add this in your CSS. Ensure that `$wgCitizenThemeDefault` is set to either light or dark mode.

```css
#skin-client-prefs-skin-theme .citizen-client-prefs-radio:has(input[value="os"]) {
    display: none;
}

#skin-client-prefs-skin-theme form { 
   grid-template-columns: repeat(2,1fr);
}
```

### Disabling autohide navigation for mobile

Add this in your CSS to disable the autohide navigation for mobile devices:

```css
#skin-client-prefs-citizen-feature-autohide-navigation { 
 display: none !important; 
}
```

### Disabling pure black mode

To disable pure black mode:

```css
#skin-client-prefs-citizen-feature-pure-black {
    display: none;
}
```
