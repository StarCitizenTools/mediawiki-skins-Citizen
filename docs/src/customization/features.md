---
title: Features
description: See the exclusive features that Citizen has to offer
---

# Features

Citizen includes several exclusive features designed to improve and enhance wiki functionality.

## Command palette

See [command palette](./command-palette).

## Utility classes

Citizen provides several utility classes to help with content formatting and interaction.

### Layout

| Class | Description |
| :--- | :--- |
| <CopyCode code=".floatright" /> | Floats content to the right and clears other floats. Stacks vertically on small screens. |
| <CopyCode code=".floatleft" /> | Floats content to the left and clears other floats. Stacks vertically on small screens. |
| <CopyCode code=".floatnone" /> | Clears floating alignment on both sides. |
| <CopyCode code=".citizen-overflow" /> | Wraps content in a horizontally scrollable container with scroll indicators. |
| <CopyCode code=".citizen-overflow-sticky-header" /> | Makes an element (like a table row) sticky while scrolling within a `.citizen-overflow` container. |

#### Element sticky header

Sticky header can be added to elements wrapped by `citizen-overflow` (e.g. wikitable) by adding the `citizen-overflow-sticky-header` class to the element to be stickied.

For div elements:

```html
<div class="citizen-overflow">
  <div class="citizen-overflow-sticky-header">I am sticky 👍</div>
  <div>I am not sticky 👎</div>
</div>
```

For tables:

```wikitext
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

### Tables

| Class | Description |
| :--- | :--- |
| <CopyCode code=".wikitable" /> | Applies standard Citizen table styling. Automatically wrapped in `.citizen-overflow`. |
| <CopyCode code=".wikitable--border" /> | Adds vertical borders to a `.wikitable`. |
| <CopyCode code=".wikitable--stripe" /> | Adds zebra striping to a `.wikitable`. |
| <CopyCode code=".wikitable--fluid" /> | Expands the table to fill 100% of the available width. |
| <CopyCode code=".citizen-table-nowrap" /> | Prevents the table from being wrapped by `.citizen-overflow` |

### Interaction

| Class | Description |
| :--- | :--- |
| <CopyCode code=".citizen-search-trigger" /> | Opens the site search interface when clicked. |

#### Search trigger

Citizen has an utility class called `.citizen-search-trigger` that can be used to trigger the search popup.

To create a button that opens search, simply do:

```html
<div class="citizen-search-trigger">Click me to open search</div>
```

To create a button that opens search with prefill, simply do:

```html
<div class="citizen-search-trigger" data-citizen-search-prefill="Template:">Click me to search templates</div>
```

## Dark mode inversion

Images might need to be "flipped" to be visible in dark theme. Simply add the following rule to the direct element that contains the icon:

```css
filter: var( --filter-invert );
```
