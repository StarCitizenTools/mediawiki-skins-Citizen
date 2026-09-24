---
title: Side column
description: The column beside the article that holds Last modified, the table of contents, and any panels a wiki adds.
---

# Side column

Citizen renders a column beside the article (`citizen-page-aside` in markup) on every page that has a last-modified timestamp or headings, except the main page. It holds the **Last modified** panel when the page has a timestamp and the **Contents** panel when it has headings, so some special pages, such as Special:Version, show Contents alone. Below the desktop breakpoint only the Contents control is shown; every other panel is desktop-only.

The column has two zones. Flow panels, such as Last modified, scroll with the page; sticky panels, such as Contents, ride together in one sticky block, where the outline shrinks to make room for the other panels in it.

Wikis and extensions can add their own panels from JavaScript. Citizen builds the panel's frame; you fill its body.

## JavaScript API

```js
mw.hook( 'citizen.pageAside.register' ).add( function ( data ) {
    var body = data.register( {
        id: 'mygadget-notes',
        label: 'Notes',
        order: 15
    } );
    if ( body ) {
        body.textContent = 'Loading…';
    }
} );
```

`register( definition )` returns the panel's body element, or `null` when no panel was added.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | string | Required. Lowercase letters, digits and hyphens, starting with a letter. Becomes the element id `citizen-page-aside-{id}`, the heading id `citizen-page-aside-{id}-heading`, and the modifier class `citizen-page-aside__panel--{id}`. Must be unique on the page; `lastmod` and `toc` are taken by the built-in panels. Prefix it with your gadget or extension name, such as `mygadget-notes`: a built-in panel added later with the same id would make `register()` refuse yours. |
| `label` | string | Required. The panel's heading, inserted as text. |
| `placement` | string | Optional, `'flow'` (default) or `'sticky'`. Flow panels scroll with the page; sticky panels join Contents in the sticky block. |
| `order` | number | Optional, default `100`. Sorts the panel within its zone: Last modified is `10` (flow) and Contents is `20` (sticky), so the default `100` lands last in the zone. A flow panel always comes before the sticky block, whatever its order. |

Keep sticky panels short. The outline gives up height to the panels beside it, so a tall sticky panel shrinks Contents and can push its own bottom past the viewport. A sticky panel with an `order` below `20` sits above Contents.

On any page, `register()` returns `null` and logs a warning through `mw.log.warn` when the definition is not an object, `id` or `label` is missing or invalid, `placement` is neither `'flow'` nor `'sticky'`, `order` is not a finite number, or a panel with that id already exists. On pages where the side column is not rendered — the main page, and pages with neither a last-modified timestamp nor headings — a valid definition returns `null` without a warning. Check the return value before using it.

### Timing

The hook fires once per page load and `mw.hook` replays it to late subscribers, so your callback runs whether your script loads before or after the skin's.

### Filling the body

The body is an empty `div`. Append whatever your panel needs; it inherits the column's smaller text size. The body has no inline padding of its own — give bare text or a plain list `padding-inline: var( --space-xs )` to line up with the heading; the button-styled rows below already do. For button-styled rows, give links the classes the built-in panels use:

```html
<a class="citizen-page-aside__link cdx-button cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--weight-quiet" href="/wiki/Special:RecentChanges">
    Show more…
</a>
```

### Removing a panel

There is no unregister call. Remove the panel's root, which is the body's parent:

```js
body.parentElement.remove();
```

The duplicate-id check looks at the page itself, so once the panel is removed its id is free to register again. A panel that fills its body asynchronously should remove itself when the request fails or returns nothing, so no heading is left above an empty body.

### Styling a panel

Target your panel through its modifier class, for example `.citizen-page-aside__panel--mygadget-notes`. The heading is `.citizen-page-aside__heading` and the body `.citizen-page-aside__body`; do not restyle those classes globally — they belong to every panel.

## Panel markup

Every panel, built-in or registered, has the same shape:

```html
<div id="citizen-page-aside-{id}" class="citizen-page-aside__panel citizen-page-aside__panel--{id}" data-order="{order}">
    <div id="citizen-page-aside-{id}-heading" class="citizen-page-aside__heading">{label}</div>
    <div class="citizen-page-aside__body">…</div>
</div>
```

Flow panels are direct children of the column. Sticky panels sit inside one `div.citizen-page-aside__sticky` after the flow panels; the server renders that block only when the page has Contents, and registering a sticky panel creates the block when the page has none. A page with both built-in panels looks like this:

```html
<aside class="citizen-page-aside" aria-label="Side column">
    <div id="citizen-page-aside-lastmod" class="citizen-page-aside__panel citizen-page-aside__panel--lastmod" data-order="10">…</div>
    <div class="citizen-page-aside__sticky">
        <nav id="citizen-toc" class="citizen-toc … citizen-page-aside__panel citizen-page-aside__panel--toc" aria-labelledby="citizen-page-aside-toc-heading" data-order="20">…</nav>
    </div>
</aside>
```

The Contents panel is the one exception in element choice: its root is a `nav` (id `citizen-toc`) named by its heading, and it carries the small-screen control between heading and body. Its ids and classes are stable; scripts that position against `#citizen-toc` keep working; an element inserted next to it now sits inside the sticky block, so it rides with the outline instead of scrolling with the page.
