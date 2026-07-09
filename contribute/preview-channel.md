---
url: /mediawiki-skins-Citizen/contribute/preview-channel.md
description: >-
  How the preview channel ships upcoming Citizen features ahead of a stable
  release
---

# Preview channel

The **preview channel** lets you safely test upcoming Citizen features before they reach a stable release. A feature is gated behind the channel only when it has to be — for one of two reasons:

* **A breaking change** — it must wait for the next major.
* **Still experimental** — it isn't ready to ship yet.

Anything that works in both worlds ships normally, never gated.

::: info Release policy
Citizen introduces breaking changes only in major versions, and a new major ships only alongside a MediaWiki LTS release (roughly every two years). The preview channel lets that work land on `main` early instead of waiting for the major.
:::

## Opting in

Turn the preview on for your browser, or for the whole wiki.

**Per browser** — append `?citizenpreview=4` to any page URL. The choice persists in a 24-hour cookie for your browser only; readers are unaffected. Append `?citizenpreview=0` to switch back.

**Wiki-wide** — set [`$wgCitizenPreview`](../config/index.md#wgcitizenpreview):

```php [LocalSettings.php]
$wgCitizenPreview = 4;
```

Only the value `4` activates the preview during this cycle; `0` or any other value keeps the stable experience. The URL parameter and cookie take precedence over the config, so a browser can opt in or out regardless of the wiki default.

Preview requests carry the `citizen-v4` class on `<html>`, and it stays there for the whole Citizen 4 release. For what changes and how to migrate your customizations, see the [Migrating to Citizen 4 guide](../guide/migrating-to-citizen-4.md).

## Gating a feature

Gate preview-only code on the `citizen-v4` class. It is present exactly when the preview is active, and it travels with the HTML the page was served with — even from an edge cache — so gate on the class, never on "did the module load."

| Surface | Convention |
| :--- | :--- |
| CSS, large surface | Separate ResourceLoader module; the hook loads exactly one per request (the token-module pattern). Use this for whole-stylesheet surfaces; when in doubt, start with a co-located guard block and promote if it grows. |
| CSS, small delta | Co-located `:root.citizen-v4 &` block in the component's LESS file. |
| Extension `skinStyles/` | Guard-block only — skinStyles attach to the extension's modules and cannot be swapped per-request. |
| PHP | Consume the resolved value from `PreviewChannel::isPreview()`; never re-read the config, cookie, or URL elsewhere. |
| Mustache / markup | Prefer additive markup both worlds can style. Genuine forks use an `is-v4` template-data boolean. Markup forks are the rarest gate — each is a cache-window hazard. |
| JS | `document.documentElement.classList.contains( 'citizen-v4' )`. |

Legacy-side code that the next major will delete gets a `// citizen-v4-remove` comment, so the eventual cleanup is a grep.

When you gate a feature:

* Ship it production-quality — it reaches early-adopter wikis through ordinary minor releases, even though its shape may still evolve.
* Give user-facing changelog entries a "(preview)" suffix, so wikis can tell what does and doesn't affect them.
* Make preview-only config and preference options degrade gracefully under stable: documented fallback, hidden UI.
* Open a preview-only feature's docs page with a `::: warning Preview (Citizen 4)` note stating it becomes the default in 4.0.
* Cover both sides wherever behavior forks — Vitest toggles the class on the fixture root; PHPUnit passes both resolved values.
