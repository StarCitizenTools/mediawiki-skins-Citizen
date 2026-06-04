---
url: /mediawiki-skins-Citizen/v3.17/features/performance-mode.md
description: >-
  A lightweight mode that strips animations and visual effects for fast page
  loads.
---

# Performance mode

Performance mode dials back animations and visual effects so the skin feels fast on any device.

## How it works

With performance mode on, Citizen:

* Turns off all transitions and animations site-wide — not just its own
* Disables smooth scrolling
* Drops frosted-glass effects, including the mobile header overlay

::: tip Relationship with `prefers-reduced-motion`
MediaWiki core handles the OS-level `prefers-reduced-motion` media query on its own. Performance mode is a skin-level toggle that goes further — it also strips out frosted glass and other visual flourishes that reduced motion doesn't cover.
:::

By default, performance mode adapts to the device. On the first page load, Citizen checks for WebGL support: capable devices get the full visual treatment, while older or limited ones stay on performance mode. The check runs once and the result is saved in the browser. Users can override it from their preferences at any time.

## Extending performance mode

### On-wiki JSON

You can hide the performance mode toggle or lock it to a specific value through [preference overrides](./preferences#removing-a-built-in-preference). To remove it from the preferences panel entirely:

```json
{
  "preferences": {
    "citizen-feature-performance-mode": null
  }
}
```

Place this on `MediaWiki:Citizen-preferences.json`.

### Custom styles

When you're writing styles for your wiki — in `MediaWiki:Common.css`, `MediaWiki:Citizen.css`, gadgets, or an extension — there are two ways to adapt them to performance mode. Reach for the first in most cases; the second is an escape hatch for everything else.

#### Best practice: build on Citizen's tokens

The shortest path is to reference the same CSS custom properties Citizen uses for its own visual effects. Performance mode overrides these tokens, so anything that points at them adapts automatically — no second rule, no class selector, no duplication.

| Property | Default | Performance mode |
| :--- | :--- | :--- |
| `--backdrop-filter-frosted-glass` | `blur( 16px ) saturate( 140% )` | `none` |
| `--opacity-glass` | `0.9` (light theme), `0.8` (dark theme) | `1` |

For example, this frosted card loses the blur and becomes fully opaque under performance mode — with no extra code:

```css
.my-floating-card {
  background-color: color-mix(
    in oklch,
    var( --color-surface-1 ) calc( var( --opacity-glass ) * 100% ),
    transparent
  );
  backdrop-filter: var( --backdrop-filter-frosted-glass );
}
```

The same goes for transitions and animations. Performance mode applies `transition-duration: 0ms !important` and `animation-duration: 0.01ms !important` to every element on the page, so your own animations are disabled too — even if they never touch a Citizen token.

#### Gating other expensive styles with the class

Performance mode is a signal that the user wants a lighter experience overall — not only less blur. If your wiki layers on heavy background images, decorative SVGs, large box-shadows, complex pseudo-element effects, or any other styles that strain weaker devices, gate them on the class Citizen sets on the `<html>` element:

| Class | State |
| :--- | :--- |
| `.citizen-feature-performance-mode-clientpref-0` | Performance mode **off** |
| `.citizen-feature-performance-mode-clientpref-1` | Performance mode **on** |

```css
/* Decorative background pattern when performance mode is off */
.citizen-feature-performance-mode-clientpref-0 .my-banner {
  background-image: url( /resources/assets/banner-pattern.svg );
}

/* Flat fallback when performance mode is on */
.citizen-feature-performance-mode-clientpref-1 .my-banner {
  background-color: var( --color-surface-1 );
}
```

#### Animation readiness

Citizen also stops transitions from firing during the initial page load, so elements don't slide around while the page is settling in. The `.citizen-animations-ready` class is added to the `<html>` element once the skin finishes its deferred startup work — and Citizen's transition tokens (`--transition-duration-base`, `--transition-hover`, `--transition-menu`, and so on) are only defined under that class.

Gate your own transitions the same way to avoid first-paint jank:

```css
.citizen-animations-ready .my-element {
  transition: opacity var( --transition-duration-medium );
}
```

### Custom scripts

If your gadgets or custom scripts run expensive work — heavy animations, intersection observers, third-party widgets, costly DOM operations — check the same class before kicking off that work:

```js
const perfModeOn = document.documentElement.classList.contains(
  'citizen-feature-performance-mode-clientpref-1'
);

if ( !perfModeOn ) {
  loadFancyVisualization();
}
```

To react to changes mid-session — so users who toggle performance mode without reloading see the new behavior — listen for the preferences hook:

```js
mw.hook( 'citizen.preferences.changed' ).add( ( featureName, value ) => {
  if ( featureName === 'citizen-feature-performance-mode' ) {
    // value is '0' (off) or '1' (on)
  }
} );
```
