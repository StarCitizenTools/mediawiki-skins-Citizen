---
url: /v3.24/features/side-column.md
description: >-
  Add your own panel to the column beside the article, next to Last modified and
  the table of contents.
---

# Side column

On wide screens, Citizen shows a column of **panels** beside the article: the built-in **Last modified** and **Contents**, and any panel your wiki adds. A panel is either:

* **Flow**, like Last modified: it scrolls away with the page.
* **Sticky**, like Contents: it stays in view. Sticky panels share their space with the outline, which shrinks to fit them.

The column only appears on pages with at least one sticky panel, and never on the main page. Flow panels show up only where the column already is.

## Adding a panel

A panel takes a script that fills it and a declaration that tells Citizen to draw it. The declaration puts the panel on the page before the script runs, and lets a sticky panel bring the column to pages without a table of contents.

### 1. Write the script

```js
mw.hook( 'citizen.pageAside.register' ).add( function ( data ) {
    var body = data.register( {
        id: 'mygadget-notes',
        label: 'Notes',
        placement: 'sticky',
        order: 30
    } );
    // null on pages without the column
    if ( !body ) {
        return;
    }
    body.textContent = 'Notes for this page';
} );
```

If the script has nothing to show on a page, it still has to register the panel, then [remove it](#removing-a-panel). Otherwise the declared panel's heading stays with nothing under it.

Load the script in one of two places, and note its ResourceLoader module for the next step:

* **A [gadget](https://www.mediawiki.org/wiki/Extension:Gadgets)**, for a panel on some pages or for some readers. The gadget's settings decide where the panel appears. The module is `ext.gadget.` plus the gadget's name, such as `ext.gadget.MyNotes`.
* **A site script** (`MediaWiki:Common.js` or `MediaWiki:Citizen.js`), for a panel on every page. The module is `site`. A sticky panel loaded this way puts the column on every page except the main page.

### 2. Declare the panel

In `MediaWiki:Citizen-page-aside.json`, add the panel under `panels`, keyed by the same id:

```json
{
    "panels": {
        "mygadget-notes": {
            "module": "ext.gadget.MyNotes",
            "labelMsg": "mygadget-notes-label",
            "placement": "sticky",
            "order": 30
        }
    }
}
```

Citizen now draws the panel's heading and an empty body on the pages that load the module, wherever the column is, and `register()` hands that body to your script. If the declaration and the script disagree on a [field](#panel-fields), the declaration wins.

### 3. Reserve its space

Give the empty body a height in `MediaWiki:Citizen.css`, so the content below doesn't move when the script fills it:

```css
.citizen-page-aside__panel--mygadget-notes .citizen-page-aside__body:empty {
    min-height: 6rem;
}
```

### Troubleshooting

* **The panel doesn't appear.** Check that the script runs on the page and that `module` names the module it's loaded in. Citizen ignores a declaration with an invalid field, so check it against [Panel fields](#panel-fields).
* **It only appears on pages with headings.** It isn't declared, or it's declared as a flow panel.
* **The heading shows with nothing under it.** The script never registered the declared id. Check that the ids match.
* **It's missing on narrow screens.** Below the desktop breakpoint, the column shows only the Contents control.
* **A change to the declaration doesn't show.** Cached pages keep their old panels until the cache expires or the page is purged.
* **The console warns `citizen.pageAside.register: …`.** The definition is malformed, or a panel with that id is already on the page.

## Reference

### Panel fields

The declaration and `register()` take the same fields, except where noted.

| Field | Type | Description |
| :--- | :--- | :--- |
| id | string | Required. Lowercase letters, digits and hyphens, starting with a letter: the key under `panels` in the declaration, `id` in `register()`. `lastmod` and `toc` are taken. Prefix it with a name of your own, such as `mygadget-`, so a built-in panel added later can't take it. |
| `module` | string | Declaration only, required. The module the page loads the script in: a gadget's, or `site`. A module that another script loads later doesn't count. |
| `labelMsg` / `label` | string | The heading, as an i18n message key or literal text. The declaration takes either, and `labelMsg` wins if both are set; `register()` requires `label`. |
| `placement` | string | Optional. `"flow"` (default) or `"sticky"`. Only a declared sticky panel brings the column to a page. |
| `order` | number | Optional, default `100`; a whole number in the declaration. Sorts panels within their zone: Last modified is `10`, Contents is `20`. Flow panels always come before sticky ones, whatever their order. |

Keep sticky panels short: each one takes height from the outline, and a tall one can push past the bottom of the screen.

### JavaScript API

The `citizen.pageAside.register` hook passes `{ register }`. Your callback runs whether your script loads before or after Citizen's.

`register( definition )` returns the panel's body to fill:

* For a declared id, the declared panel's body. Without a declaration, the same call adds the panel itself, but only where the column already is.
* `null`, silently, on pages without the column.
* `null` with a warning through `mw.log.warn` when the definition is invalid or the id is taken, including registering a declared id twice.

Citizen removes a declared panel whose module fails to load, and hides declared panels when JavaScript is off.

### Filling the body

The body has no padding of its own. Give text or a plain list `padding-inline: var( --space-xs )` to line up with the heading, or use the classes the built-in panels use for button-style rows:

```html
<a class="citizen-page-aside__link cdx-button cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--weight-quiet" href="/wiki/Special:RecentChanges">
    Show more…
</a>
```

### Removing a panel

There's no unregister call. Remove the panel's root, which is the body's parent:

```js
body.parentElement.remove();
```

### Styling a panel

Target your panel with its modifier class, such as `.citizen-page-aside__panel--mygadget-notes`. Don't restyle `.citizen-page-aside__heading` or `.citizen-page-aside__body` on their own, because every panel uses them.

### Panel markup

```html
<div id="citizen-page-aside-{id}" class="citizen-page-aside__panel citizen-page-aside__panel--{id}" data-order="{order}">
    <div id="citizen-page-aside-{id}-heading" class="citizen-page-aside__heading">{label}</div>
    <div class="citizen-page-aside__body">…</div>
</div>
```

Flow panels are direct children of `aside.citizen-page-aside`; sticky panels sit in its `div.citizen-page-aside__sticky`.
