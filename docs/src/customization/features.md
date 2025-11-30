---
title: Features
description: Explore the exclusive features that Citizen offers
---

# Features

Citizen includes several built-in features designed to enhance the functionality and interactivity of your wiki.

## Command palette

The command palette is a powerful tool for quick navigation and actions. Learn more about how to configure and use it in the [command palette documentation](./command-palette).

## Utility classes

Citizen provides a set of utility classes to help you format content and add interactivity without writing custom CSS.

### Layout

Control the positioning and flow of your content.

| Class | Description |
| :--- | :--- |
| <CopyCode code=".floatright" /> | Floats content to the right. Stacks vertically on small screens. |
| <CopyCode code=".floatleft" /> | Floats content to the left. Stacks vertically on small screens. |
| <CopyCode code=".floatnone" /> | Clears floating alignment. |
| <CopyCode code=".citizen-overflow" /> | Wraps content in a horizontally scrollable container with indicators. |
| <CopyCode code=".citizen-overflow-sticky-header" /> | Makes an element sticky within a `.citizen-overflow` container. |

#### Element sticky header

You can make headers sticky within a scrollable area (like a wide table) by adding the `citizen-overflow-sticky-header` class. This works for both `div` elements and wikitables.

For `div` elements:

```html
<div class="citizen-overflow">
  <div class="citizen-overflow-sticky-header">I am sticky 👍</div>
  <div>I am not sticky 👎</div>
</div>
```

For wikitables:

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

Enhance the look and feel of your tables.

| Class | Description |
| :--- | :--- |
| <CopyCode code=".wikitable" /> | Applies standard Citizen styling. Automatically wrapped in `.citizen-overflow`. |
| <CopyCode code=".wikitable--border" /> | Adds vertical borders. |
| <CopyCode code=".wikitable--stripe" /> | Adds zebra striping for better readability. |
| <CopyCode code=".wikitable--fluid" /> | Expands the table to fill 100% of the available width. |
| <CopyCode code=".citizen-table-nowrap" /> | Prevents the table from being wrapped in a scrollable container. |

### Interaction

Add interactive elements to your pages.

| Class | Description |
| :--- | :--- |
| <CopyCode code=".citizen-search-trigger" /> | Opens the site search interface when clicked. |

#### Search trigger

You can create buttons or links that trigger the search popup using the `.citizen-search-trigger` class.

To create a simple search button:

```html
<div class="citizen-search-trigger">Click me to open search</div>
```

To prefill the search query (for example, to search only templates):

```html
<div class="citizen-search-trigger" data-citizen-search-prefill="Template:">Click me to search templates</div>
```

## Dark mode support

Some images, especially black text or icons, might not be visible in dark mode. You can invert their colors using the `--filter-invert` variable.

Simply add this CSS rule to the element containing the image:

```css
filter: var( --filter-invert );
```
