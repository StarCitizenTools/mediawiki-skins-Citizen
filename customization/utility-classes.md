---
url: /mediawiki-skins-Citizen/customization/utility-classes.md
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
|  | Wraps content in a horizontal scroll container. See [Overflow handling](/features/overflow). |
|  | Keeps an element sticky within a `.citizen-overflow` container. See [Overflow handling](/features/overflow#sticky-headers). |

## Tables

Enhance the look and feel of your tables.

| Class | Description |
| :--- | :--- |
|  | Applies standard Citizen styling. Automatically [wrapped for overflow](/features/overflow). |
|  | Adds vertical borders. |
|  | Adds zebra striping for better readability. |
|  | Expands the table to fill 100% of the available width. |
|  | Prevents the table from being [wrapped for overflow](/features/overflow#opting-out). |

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
