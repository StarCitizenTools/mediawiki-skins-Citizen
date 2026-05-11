---
title: Performance mode
description: A lightweight mode that strips animations and visual effects for fast page loads.
---

# Performance mode

Performance mode dials back animations and visual effects so the skin feels fast on any device.

## How it works

With performance mode on, Citizen:

- Turns off transitions and animations across the whole skin (every element, not just ones using Citizen's transition tokens)
- Disables smooth scrolling
- Drops frosted-glass backdrop effects
- Skips the frosted overlay on the mobile header, leaving the default solid background

::: tip Relationship with `prefers-reduced-motion`
MediaWiki core handles the OS-level `prefers-reduced-motion` media query on its own. Performance mode is a skin-level toggle that goes further — it also strips out frosted glass and other visual flourishes that reduced motion doesn't cover.
:::

Performance mode is on by default. On the first page load, Citizen probes the browser for WebGL support — if the device can render WebGL, performance mode turns off; otherwise it stays on. The result is saved in the browser, so the check only runs once. Users can flip the toggle in their preferences at any time.

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

Citizen sets a class on the root element that you can target in your own styles:

| Class | State |
| :--- | :--- |
| `.citizen-feature-performance-mode-clientpref-0` | Performance mode **off** |
| `.citizen-feature-performance-mode-clientpref-1` | Performance mode **on** |

Use these to gate heavy effects, swap in lighter alternatives, or simplify layouts when the user or device prefers a leaner experience:

```css
/* Full effect when performance mode is off */
.citizen-feature-performance-mode-clientpref-0 .my-element {
  backdrop-filter: blur( 16px );
}

/* Lighter fallback when performance mode is on */
.citizen-feature-performance-mode-clientpref-1 .my-element {
  background-color: var( --color-surface-1 );
}
```

#### Animation readiness

Citizen also prevents transitions from firing during initial page load. The `.citizen-animations-ready` class is added to the root element after the skin finishes its deferred startup tasks (scheduled via `requestIdleCallback`) — transition tokens like `--transition-duration-base`, `--transition-hover`, and `--transition-menu` are only defined under this class.

Gate your own transitions the same way to avoid jank on first paint:

```css
.citizen-animations-ready .my-element {
  transition: opacity var( --transition-duration-medium );
}
```

#### Affected custom properties

Performance mode overrides these custom properties, so anything that references them adapts without extra work:

| Property | Default | Performance mode |
| :--- | :--- | :--- |
| `--backdrop-filter-frosted-glass` | `blur(…)` | `none` |
| `--opacity-glass` | `<0–1>` | `1` |

On top of that, performance mode applies `transition-duration: 0ms !important` and `animation-duration: 0.01ms !important` to every element via the universal selector, so transitions and animations are flattened even when your styles don't reference Citizen's tokens.
