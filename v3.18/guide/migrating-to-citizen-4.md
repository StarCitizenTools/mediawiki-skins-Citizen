---
url: /mediawiki-skins-Citizen/v3.18/guide/migrating-to-citizen-4.md
description: Preview the Citizen 4 changes and migrate your wiki before the release
---

# Migrating to Citizen 4

Citizen 4 will be released some time after MediaWiki 1.47 LTS. Use the [preview channel](../contribute/preview-channel.md) to test the changes.

## What's changing

* **New color token pipeline** — colors are defined as `light-dark()` pairs built from primitive ramps instead of computed channel math. Most existing overrides keep working; see [Migrate your token overrides](#migrate-your-token-overrides).
* **Pure black mode becomes the Black theme** — the switch is retired in favor of a real theme; see [Pure black mode becomes the Black theme](#pure-black-mode-becomes-the-black-theme).

## Migration steps

Preview the changes in your own browser, deploy your fixes behind a guard, then turn the whole wiki on when you're ready. Every step is safe to do ahead of the release.

### 1. Try it in your browser

Append `?citizenpreview=4` to any page URL on your wiki. The choice persists in a 24-hour cookie for your browser only; readers are unaffected. Append `?citizenpreview=0` to switch back.

### 2. Deploy fixes behind a guard

Wrap your fixes so they apply only in the preview. The `citizen-v4` class is inert for stable readers, so a guarded fix is safe to deploy right away:

| Where | How to target it |
| :--- | :--- |
| CSS | `:root.citizen-v4 { … }` |
| JavaScript | `document.documentElement.classList.contains( 'citizen-v4' )` |

The class stays on `<html>` for the whole Citizen 4 release, so your guarded fixes keep working after you upgrade. Drop the guards once you've finished migrating; the class itself is removed in Citizen 5.

### 3. Turn it on wiki-wide

Once your fixes are in place, you can put the whole wiki on the preview with [`$wgCitizenPreview`](../config/index.md#wgcitizenpreview):

```php [LocalSettings.php]
$wgCitizenPreview = 4;
```

Only the value `4` activates the preview during this cycle; `0` or any other value keeps the stable experience.

## Migrate your token overrides

Most token names are unchanged — the big shift is **how** values resolve.

### Light and dark are one declaration now

The new pipeline defines colors as `light-dark()` pairs and drives them with `color-scheme`.

The Citizen 3 pattern, which still works:

```css
:root {
    --color-surface-0: #fffaf0;
}

:root.skin-theme-clientpref-night {
    --color-surface-0: #16130e;
}

@media ( prefers-color-scheme: dark ) {
    :root.skin-theme-clientpref-os {
        --color-surface-0: #16130e;
    }
}
```

The recommended Citizen 4 form — one declaration covers all three modes:

```css
:root.citizen-v4 {
    --color-surface-0: light-dark( #fffaf0, #16130e );
}
```

The `light-dark()` form is also simpler, and it lets custom themes build on the base — a theme sets `color-scheme`, overrides only the colors it changes, and everything else falls back to the right light or dark value.

### Removed tokens

| If you overrode… | To migrate |
| :--- | :--- |
| A surface, text, border, or background token | Nothing — the names are unchanged. |
| A color's channel to retune it (e.g. `--color-base-oklch__l`) | Set the color token itself (e.g. `--color-base`). |
| An HSL color fallback (`…-hsl__*`) | Nothing — Citizen 4 drops the HSL fallback, but modern browsers already used the OKLCH colors in Citizen 3. |
| A `--delta-lightness-*` state or surface delta | Set the affected token directly (e.g. `--color-surface-1--hover`). |
| The primary-color hue (`--color-progressive-oklch__h`) | See [Rebranding the primary color](#rebranding-the-primary-color). |

::: details Full list of removed tokens

Channel key: `__l` lightness, `__c` chroma, `__s` saturation, `__h` hue.

**State and surface deltas:**

* `--delta-lightness-hover-state`
* `--delta-lightness-active-state`
* `--delta-lightness-state-base`
* `--delta-lightness-surface-base`

**OKLCH channels:**

* `--color-base-oklch__c`, `--color-base-oklch__l`
* `--color-disabled-oklch__c`, `--color-disabled-oklch__l`
* `--color-emphasized-oklch__c`, `--color-emphasized-oklch__l`
* `--color-placeholder-oklch__c`, `--color-placeholder-oklch__l`
* `--color-progressive-oklch__c`, `--color-progressive-oklch__l`
* `--color-subtle-oklch__c`, `--color-subtle-oklch__l`
* `--color-surface-0-oklch__c`, `--color-surface-0-oklch__l`
* `--color-surface-1-oklch__c`, `--color-surface-1-oklch__l`
* `--color-surface-2-oklch__c`, `--color-surface-2-oklch__l`
* `--color-surface-3-oklch__c`, `--color-surface-3-oklch__l`
* `--color-surface-4-oklch__c`, `--color-surface-4-oklch__l`
* `--shadow-color-oklch__c`, `--shadow-color-oklch__l`

**HSL channels:**

* `--color-base-hsl__l`, `--color-base-hsl__s`
* `--color-disabled-hsl__l`, `--color-disabled-hsl__s`
* `--color-emphasized-hsl__l`, `--color-emphasized-hsl__s`
* `--color-placeholder-hsl__l`, `--color-placeholder-hsl__s`
* `--color-subtle-hsl__l`, `--color-subtle-hsl__s`
* `--color-surface-0-hsl__l`, `--color-surface-0-hsl__s`
* `--color-surface-1-hsl__l`, `--color-surface-1-hsl__s`
* `--color-surface-2-hsl__l`, `--color-surface-2-hsl__s`
* `--color-surface-3-hsl__l`, `--color-surface-3-hsl__s`
* `--color-surface-4-hsl__l`, `--color-surface-4-hsl__s`
* `--shadow-color-hsl__l`, `--shadow-color-hsl__s`

**Standalone channels:**

* `--background-color-subtle__l`, `--background-color-subtle__s`
* `--color-destructive__h`, `--color-destructive__l`
* `--color-success__h`, `--color-success__l`
* `--color-warning__h`, `--color-warning__l`

:::

### Rebranding the primary color

Move your hue override from `--color-progressive-oklch__h` to `--color-primary-oklch__h`. The value is the same:

```css
/* Citizen 3 */
:root {
    --color-progressive-oklch__h: 150;
}

/* Citizen 4 preview */
:root.citizen-v4 {
    --color-primary-oklch__h: 150;
}
```

Citizen 4 can tint the neutral surfaces separately from the accent. `--color-neutral-oklch__h` sets their hue and defaults to the primary hue — set it to a different value to decouple the two.

## Pure black mode becomes the Black theme

The pure black switch is now a theme in the theme picker. The switch retires without carry-over — if you had it enabled, pick the [Black theme](../customization/theming.md#themes-citizen-4-preview) in the preferences panel to get the same look.
