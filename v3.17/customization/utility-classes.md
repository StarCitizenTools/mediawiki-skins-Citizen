---
url: /v3.17/customization/utility-classes.md
description: CSS classes Citizen exposes for formatting and interactivity
---

# Utility classes

Citizen provides a set of utility classes you can use directly in wikitext, templates, and gadgets to format content and add interactivity without writing custom CSS.

## Layout

Control the positioning and flow of your content.

| Class | Description |
| :--- | :--- |
|  | Floats content to the right. Stacks vertically on small screens. |
|  | Floats content to the left. Stacks vertically on small screens. |
|  | Clears floating alignment. |
|  | Wraps content in a horizontally scrollable container with indicators. |
|  | Makes an element sticky within a `.citizen-overflow` container. |

### Element sticky header

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

## Tables

Enhance the look and feel of your tables.

| Class | Description |
| :--- | :--- |
|  | Applies standard Citizen styling. Automatically wrapped in `.citizen-overflow`. |
|  | Adds vertical borders. |
|  | Adds zebra striping for better readability. |
|  | Expands the table to fill 100% of the available width. |
|  | Prevents the table from being wrapped in a scrollable container. |

## Interaction

Add interactive elements to your pages.

| Class | Description |
| :--- | :--- |
|  | Opens the site search interface when clicked. |

### Search trigger

You can create buttons or links that trigger the search popup using the `.citizen-search-trigger` class.

To create a simple search button:

```html
<div class="citizen-search-trigger">Click me to open search</div>
```

To prefill the search query (for example, to search only templates):

```html
<div class="citizen-search-trigger" data-citizen-search-prefill="Template:">Click me to search templates</div>
```
