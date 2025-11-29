---
title: Citizen's features
description: See the exclusive features that Citizen has to offer
---

# Citizen's features

Citizen includes several exclusive features designed to improve and enhance wiki functionality.

## Command palette

::: tip
See also: [Command Palette](./command-palette)
:::

## Search trigger

Citizen has an utility class called `.citizen-search-trigger` that can be used to trigger the search popup. 

To create a button that opens search, simply do:

```html
<div class="citizen-search-trigger">Click me to open search</div>
```

To create a button that opens search with prefill, simply do:

```html
<div class="citizen-search-trigger" data-citizen-search-prefill="Template:">Click me to search templates</div>
```

## Element sticky header

Sticky header can be added to elements wrapped by `citizen-overflow` (e.g. wikitable) by adding the `citizen-overflow-sticky-header` class to the element to be stickied.

For div elements:

```html
<div class="citizen-overflow">
  <div class="citizen-overflow-sticky-header">I am sticky 👍</div>
  <div>I am not sticky 👎</div>
</div>
```

For tables:

```
{| class="wikitable"
|- class="citizen-overflow-sticky-header"
! Header text !! Header text !! Header text
|-
| Example || Example || Example
|-
| Example || Example || Example
|-
| Example || Example || Example
|}
```

## Dark mode inversion

Images might need to be "flipped" to be visible in dark theme. Simply add the following rule to the direct element that contains the icon:

```css
filter: var( --filter-invert );
``` 
