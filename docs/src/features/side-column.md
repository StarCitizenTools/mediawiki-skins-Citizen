---
title: Side column
description: The column beside the article that holds Last modified, the table of contents, and any panels a wiki adds.
---

# Side column

Citizen renders a column beside the article (`citizen-page-aside` in markup) on every page that has a sticky panel, except the main page. Sticky panels are **Contents**, when the page has headings, and any panel the wiki [declares](#declaring-a-panel) as sticky. Below the desktop breakpoint only the Contents control is shown; every other panel is desktop-only.

The column has two zones. Flow panels, such as **Last modified**, scroll with the page; sticky panels, such as Contents, ride together in one sticky block, where the outline shrinks to make room for the other panels in it. Flow panels join the column wherever it is rendered but never open it on their own, because a column of flow panels alone would be blank below the first screen. So a page with headings shows Last modified above Contents, and a page without headings has no column unless a declared sticky panel opens it.

Wikis and extensions can add their own panels from JavaScript. Citizen builds the panel's frame; you fill its body. [Declare the panel](#declaring-a-panel) as well to have its frame in place from the first paint, on every page that loads your script's module.

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

On any page, `register()` returns `null` and logs a warning through `mw.log.warn` when the definition is not an object, `id` or `label` is missing or invalid, `placement` is neither `'flow'` nor `'sticky'`, `order` is not a finite number, or a panel with that id already exists, other than a [declared](#declaring-a-panel) frame waiting to be claimed. On pages where the side column is not rendered — the main page, and pages with no sticky panel — a valid definition returns `null` without a warning. Check the return value before using it.

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

## Declaring a panel

A panel registered from JavaScript is added after the page has rendered, and only where the column already is. Declaring it on-wiki lets Citizen render the panel's frame with the page instead: in its place from the first paint, and, for a sticky panel, on pages that would otherwise have no column.

Interface administrators declare panels in `MediaWiki:Citizen-page-aside.json`:

```json
{
    "panels": {
        "mygadget-recent": {
            "module": "ext.gadget.RecentChangesPanel",
            "labelMsg": "mygadget-recent-label",
            "placement": "sticky",
            "order": 30
        }
    }
}
```

Each key under `panels` is a panel id, with the same rules as the `id` passed to `register()`.

| Field | Type | Description |
| :--- | :--- | :--- |
| `module` | string | Required. The ResourceLoader module whose script fills the panel. |
| `labelMsg` / `label` | string | One is required. An i18n message key, or literal text, for the panel's heading. Prefer `labelMsg` on a multilingual wiki; it wins when both are set. |
| `placement` | string | Optional, `"flow"` (default) or `"sticky"`, as for `register()`. Only a sticky panel opens the column on its own. |
| `order` | integer | Optional, default `100`. Sorts the panel within its zone, against the same values as `register()`'s `order`. |

A declared panel's frame renders on pages that load its module and have the column — which a declared sticky panel opens by itself everywhere but the main page. The module must be one the page loads itself, as it does for an enabled gadget; a module that another script loads later does not count. Where the module is not loaded, nothing renders, so a gadget's own settings decide where its panel appears. An entry with an invalid id or field is ignored, and the rest of the page still applies.

Your script fills the frame with the same [`register()`](#javascript-api) call it would make without a declaration. With a declared id, `register()` returns the declared frame's body instead of building a panel. The declaration's label, placement and order stand; the ones in the definition apply only on a wiki that does not declare the panel, where the same code builds the panel itself. Register the id once: a second call is refused as a duplicate.

If the module fails to load before its script claims the frame, Citizen removes the frame. A module that loads but never registers the declared id leaves an empty frame, so check that the two ids match. A script that decides not to show its panel on a page should still register it and then [remove it](#removing-a-panel). Without JavaScript, declared panels are hidden.

### Reserving space

A declared panel's body is empty until your script fills it. Reserve its height in `MediaWiki:Citizen.css`, so the content below does not move when the body fills:

```css
.citizen-page-aside__panel--mygadget-recent .citizen-page-aside__body:empty {
    min-height: 12rem;
}
```

### Caching

The frames are part of each page's HTML. A logged-in reader sees a change to `MediaWiki:Citizen-page-aside.json` on their next page view; a page served from a cache keeps its old frames until that cache expires or the page is purged, as it does for any interface message.

## Panel markup

Every panel, built-in or registered, has the same shape:

```html
<div id="citizen-page-aside-{id}" class="citizen-page-aside__panel citizen-page-aside__panel--{id}" data-order="{order}">
    <div id="citizen-page-aside-{id}-heading" class="citizen-page-aside__heading">{label}</div>
    <div class="citizen-page-aside__body">…</div>
</div>
```

A declared frame also carries `data-module`, naming its module, until a registration claims it.

Flow panels are direct children of the column. Sticky panels sit inside one `div.citizen-page-aside__sticky` after the flow panels; the server renders that block whenever it renders the column, and registering a sticky panel creates the block on older cached pages that have none. A page with both built-in panels looks like this:

```html
<aside class="citizen-page-aside" aria-label="Side column">
    <div id="citizen-page-aside-lastmod" class="citizen-page-aside__panel citizen-page-aside__panel--lastmod" data-order="10">…</div>
    <div class="citizen-page-aside__sticky">
        <nav id="citizen-toc" class="citizen-toc … citizen-page-aside__panel citizen-page-aside__panel--toc" aria-labelledby="citizen-page-aside-toc-heading" data-order="20">…</nav>
    </div>
</aside>
```

The Contents panel is the one exception in element choice: its root is a `nav` (id `citizen-toc`) named by its heading, and it carries the small-screen control between heading and body. Its ids and classes are stable; scripts that position against `#citizen-toc` keep working; an element inserted next to it now sits inside the sticky block, so it rides with the outline instead of scrolling with the page.
