---
title: Migrating to Citizen 4
description: Preview the Citizen 4 changes and migrate your wiki before the release
---

# Migrating to Citizen 4

Citizen 4.0 will ship breaking changes. This cycle, that means the new color token pipeline becoming the default — tokens are the CSS custom properties documented in [Theming](../customization/theming.md). This guide walks you through migrating your wiki ahead of the release, using the **preview channel** to rehearse everything safely on your production wiki. Citizen majors ship alongside MediaWiki LTS releases, so there's a long runway — start whenever it suits you.

Preview features are production-quality, but their shape may change during the cycle — changes are announced in the release notes.

## Try it in your browser

Append `?citizenpreview=4` to any page URL on your wiki. The choice persists in a 24-hour cookie for your browser only; readers are unaffected. Append `?citizenpreview=0` to switch back.

While previewing, check:

- Your site CSS (`MediaWiki:Citizen.css`, `MediaWiki:Common.css`) in **both** light and dark schemes
- Gadgets that style or read skin colors
- Any hardcoded colors that clash with the new palette

::: warning Shared caches
On wikis behind a CDN, the URL parameter varies the cache key but the **cookie does not**. Rehearse anonymous views via the URL parameter, or while logged in — logged-in traffic typically bypasses the CDN.
:::

## Fix things, guarded

Write your migration fixes inside a `:root.citizen-v4` guard. Guarded rules are inert for stable readers and active in preview — safe to deploy immediately:

```css
:root.citizen-v4 {
    --color-surface-1: light-dark( #f7f2ea, #201d18 );
}
```

Note the two-value `light-dark()` form — a single value would silently break dark mode; see [Light and dark are one declaration now](#light-and-dark-are-one-declaration-now).

The `citizen-v4` class stays on `<html>` through the **whole 4.x lifetime**, so your guarded fixes keep applying after you upgrade. Unguard them at your leisure during 4.x; the class is removed in 5.0. The guard itself survives the upgrade, but if a preview feature's shape changes during the cycle — see the rebrand note below — you may still need to update what's inside it.

Gadget JavaScript can detect the channel the same way:

```js
const isCitizen4 = document.documentElement.classList.contains( 'citizen-v4' );
```

## Wiki-wide preview

Once your rehearsal looks clean, you can put the whole wiki on the preview with [`$wgCitizenPreview`](../config/index.md#wgcitizenpreview):

```php [LocalSettings.php]
$wgCitizenPreview = 4;
```

Only the value `4` activates the preview during this cycle; `0` or any other value keeps the stable experience. The URL parameter and cookie take precedence over the config, so individual browsers can still switch back with `?citizenpreview=0` while the wiki is on the preview.

## Migrating your token overrides

Most token names are unchanged — the big shift is **how** values resolve.

### Light and dark are one declaration now

The new pipeline defines colors as `light-dark()` pairs and drives them with `color-scheme`. A plain override wins in **both** schemes and silently breaks dark mode:

```css
/* Breaks dark mode: applies this light value in both schemes */
:root.citizen-v4 {
    --color-surface-0: #fffaf0;
}

/* Correct: provide both halves */
:root.citizen-v4 {
    --color-surface-0: light-dark( #fffaf0, #16130e );
}
```

### Your CSS still wins

Citizen's new tokens live in a CSS cascade layer (`@layer citizen-tokens`). Site CSS is unlayered, and unlayered styles beat layered ones — your `:root` overrides always win without specificity tricks. This is by design.

### Removed tokens

A diff of the two pipelines' compiled stylesheets shows 58 custom properties removed. All of them are internal color math. The legacy pipeline decomposed each color into separate channel properties (lightness, chroma, saturation, hue) and computed surface and state shades from them with `calc()`; the new pipeline ships static `light-dark()` pairs instead, so the intermediates no longer exist. **No surface, text, border, or background token is removed** — if you only ever overrode tokens like `--color-surface-1` or `--color-base`, this section doesn't affect you.

Overriding a removed property is a silent no-op in the preview. Four of them were global tuning knobs, so they get their own migration advice:

| Removed token | What to do instead |
| :--- | :--- |
| `--delta-lightness-hover-state` | No replacement — hover shades are no longer computed. Override the affected state token directly, as a `light-dark()` pair (for example `--color-surface-1--hover`). |
| `--delta-lightness-active-state` | Same, for active shades (for example `--color-surface-1--active`). |
| `--delta-lightness-state-base` | The base value the hover and active deltas derived from. Same guidance. |
| `--delta-lightness-surface-base` | Stepped the surface ramp (`--color-surface-1` to `--color-surface-4`) away from the page background. Override the surface tokens directly. |

The remaining 54 are per-color channel decompositions. If you overrode one of them to retune a color, override the color token itself now. Two of them (`--color-progressive-oklch__l` and `--color-progressive-oklch__c`) are the primary-color rebrand knobs from the [Theming](../customization/theming.md#primary-color) guide — see [Rebranding the primary color](#rebranding-the-primary-color) below.

::: details Full list of removed internal tokens

Channel key: `__l` lightness, `__c` chroma, `__s` saturation, `__h` hue.

**OKLCH channel properties (24):**

- `--color-base-oklch__c`, `--color-base-oklch__l`
- `--color-disabled-oklch__c`, `--color-disabled-oklch__l`
- `--color-emphasized-oklch__c`, `--color-emphasized-oklch__l`
- `--color-placeholder-oklch__c`, `--color-placeholder-oklch__l`
- `--color-progressive-oklch__c`, `--color-progressive-oklch__l`
- `--color-subtle-oklch__c`, `--color-subtle-oklch__l`
- `--color-surface-0-oklch__c`, `--color-surface-0-oklch__l`
- `--color-surface-1-oklch__c`, `--color-surface-1-oklch__l`
- `--color-surface-2-oklch__c`, `--color-surface-2-oklch__l`
- `--color-surface-3-oklch__c`, `--color-surface-3-oklch__l`
- `--color-surface-4-oklch__c`, `--color-surface-4-oklch__l`
- `--shadow-color-oklch__c`, `--shadow-color-oklch__l`

**HSL channel properties (22):**

- `--color-base-hsl__l`, `--color-base-hsl__s`
- `--color-disabled-hsl__l`, `--color-disabled-hsl__s`
- `--color-emphasized-hsl__l`, `--color-emphasized-hsl__s`
- `--color-placeholder-hsl__l`, `--color-placeholder-hsl__s`
- `--color-subtle-hsl__l`, `--color-subtle-hsl__s`
- `--color-surface-0-hsl__l`, `--color-surface-0-hsl__s`
- `--color-surface-1-hsl__l`, `--color-surface-1-hsl__s`
- `--color-surface-2-hsl__l`, `--color-surface-2-hsl__s`
- `--color-surface-3-hsl__l`, `--color-surface-3-hsl__s`
- `--color-surface-4-hsl__l`, `--color-surface-4-hsl__s`
- `--shadow-color-hsl__l`, `--shadow-color-hsl__s`

**Standalone channel properties (8):**

- `--background-color-subtle__l`, `--background-color-subtle__s`
- `--color-destructive__h`, `--color-destructive__l`
- `--color-success__h`, `--color-success__l`
- `--color-warning__h`, `--color-warning__l`

:::

Every other custom property the legacy pipeline defines is also emitted by the new one under the same name. The diff also adds 170 properties that only exist in the new pipeline — mostly the primitive color ramps everything is now built from, plus additional state variants.

### Rebranding the primary color

In Citizen 3, the [Theming](../customization/theming.md#primary-color) guide's rebrand recipe was to override the progressive channel properties — usually just the hue. The new pipeline builds the primary color differently: a single hue property, `--color-primary-oklch__h`, generates a full ramp of primary shades (`--color-primary-50` through `--color-primary-1000`), and semantic tokens like `--color-progressive` pick their light and dark stops from that ramp.

Here is how the old knobs map:

- **Hue** (`--color-progressive-oklch__h`): still emitted as an alias of the new property, so styles that *read* it keep resolving — but overriding it no longer changes the skin. Move your override to `--color-primary-oklch__h`. The value stays the same, and since it's a plain hue angle rather than a color, it doesn't need a `light-dark()` pair:

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

- **Lightness and chroma** (`--color-progressive-oklch__l`, `--color-progressive-oklch__c`): removed. Each ramp stop bakes in its own lightness and chroma, so there is no single knob anymore. If the hue alone doesn't get you there, override the semantic tokens (`--color-progressive`, `--color-progressive--hover`, `--color-progressive--active`) directly with `light-dark()` pairs.

The hue also does more than before: UI surfaces carry a subtle tint of it by default. A second knob, `--color-neutral-oklch__h`, controls that tint: it defaults to the primary hue, and setting it to a different value decouples the chrome from the accent (for example, gray chrome with a colorful accent).

The soft-deprecated HSL fallback properties (`--color-progressive-hsl__h`, `__s`, `__l`) are still emitted for the few styles that read them, but they no longer feed the accent color anywhere — migrate to the new hue property.

One caveat: of everything in the preview, the retheme surface is the most likely to still evolve before 4.0 ships — keep an eye on the release notes and the [Theming](../customization/theming.md) guide.

Whichever way it evolves, guarded fixes stay inert until a reader is on the preview, and `?citizenpreview=0` reverts your own browser instantly.
