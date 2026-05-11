---
title: Performance mode
description: A lightweight mode that strips animations and visual effects for fast page loads.
---

# Performance mode

Performance mode dials back animations and visual effects so the skin feels fast on any device.

## How it works

When performance mode is on, Citizen:

- Turns off CSS animations and transitions
- Drops frosted glass backdrop effects
- Replaces the blurred mobile header with a solid background

::: tip Relationship with `prefers-reduced-motion`
MediaWiki core handles the OS-level `prefers-reduced-motion` media query on its own. Performance mode is a skin-level toggle that goes further — it also strips out frosted glass and other visual flourishes that reduced motion doesn't cover.
:::

Performance mode starts **on by default**. On the first page load, Citizen checks for WebGL support and quietly turns it off if the device has GPU acceleration. Without a GPU, it stays on. The result is saved in the browser, so the check only runs once. Users can always flip it in their preferences.

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

Citizen also prevents transitions from firing during initial page load. The `.citizen-animations-ready` class is added to the root element once the skin's JavaScript has loaded — transition tokens like `--transition-hover` and `--transition-menu` are only defined under this class.

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
