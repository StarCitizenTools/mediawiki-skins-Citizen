---
title: Overflow handling
description: Stop wide tables and code blocks from pushing the whole page sideways — Citizen scrolls them in place, with navigation buttons and sticky headers.
---

# Overflow handling

When a table, code block, or other element is wider than the page, the whole page scrolls sideways to fit it — and everything else slides off-screen along with it. Citizen confines that sideways scrolling to the wide element alone, so the page stays put and only the element itself scrolls.

## How it works

Citizen makes that sideways scrolling easy to spot and use:

- **Navigation buttons** — on devices with a mouse or trackpad, buttons appear at each edge to scroll the content left and right.
- **Scroll indicators** — a soft fade appears at any edge where the content continues, so it's clear there's more to see.

Tables with the `wikitable` class are wrapped automatically.

### Opting in

Give any element the same treatment by adding the `citizen-overflow` class:

```html
<div class="citizen-overflow">
  Wide content that should scroll on its own instead of pushing the page sideways.
</div>
```

### Opting out

To leave an element as-is — for example a table you lay out yourself — add the `citizen-table-nowrap` class:

```wikitext
{| class="wikitable citizen-table-nowrap"
! Header !! Header
|-
| Example || Example
|}
```

The list of opt-out classes is configurable — see [`$wgCitizenOverflowNowrapClasses`](#wgcitizenoverflownowrapclasses).

### Sticky headers

Keep a header visible while the rest of a wide element scrolls by adding the `citizen-overflow-sticky-header` class. It works for both `div` elements and wikitables.

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

## Configuration

### `$wgCitizenOverflowNowrapClasses`

Classes that make Citizen skip an element entirely. Set this in `LocalSettings.php`. Default:

```php [LocalSettings.php]
$wgCitizenOverflowNowrapClasses = [
    'noresize',
    'citizen-table-nowrap',
    'cargoDynamicTable',
    'dataTable',
    'smw-datatable',
    'srf-datatable',
];
```

The defaults cover `citizen-table-nowrap` and the table classes used by common extensions (Cargo, DataTables, Semantic MediaWiki) that manage their own layout. Add your own classes to skip them too.
