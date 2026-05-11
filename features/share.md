---
url: /mediawiki-skins-Citizen/features/share.md
description: >-
  Share the current page via the browser's native share sheet or a configurable
  grid of services.
---

# Share

The share panel lets readers send the current page to other people — through their device's native share sheet, a configurable grid of services on the wiki, or as a short URL or QR code.

## How it works

Citizen offers three share modes:

* **Native** — surfaces the device's OS-level share sheet (apps, contacts, AirDrop, etc.). Available on mobile devices and desktop Safari, Chrome, and Edge; on browsers without Web Share API support it falls back to a clipboard copy with a toast notification.
* **Panel** — opens Citizen's in-page panel. Always includes a copy-link field, and if you've configured services on your wiki, a grid of branded service tiles below it. Optionally adds short URL and QR code buttons when [Extension:UrlShortener](https://www.mediawiki.org/wiki/Extension:UrlShortener) is installed.
* **Auto** *(default)* — uses Native when the browser supports it, falls back to Panel otherwise.

Wiki admins choose which mode is active — see [Configuration](#configuration) below.

Citizen doesn't ship with a built-in service list. The right services depend on your audience — a German federated wiki may want Diaspora; a corporate intranet may want none at all. You pick.

::: tip Which URL gets shared
Native mode reads `<link rel="canonical">` and shares the canonical URL. The in-page panel — both the copy-link field and the service tiles — shares the current page URL without the hash. If you rely on canonical URLs for analytics or social previews, prefer Native mode.
:::

### Short URLs and QR codes

When [Extension:UrlShortener](https://www.mediawiki.org/wiki/Extension:UrlShortener) is installed, the share panel adds two buttons below the copy-link field:

* **Copy short URL** — copies a shortened URL to the clipboard in one click, with a brief success state on the button. The result is cached for the lifetime of the dialog, so clicking again or reopening the panel is instant.
* **Show QR code** — opens a focused QR view inside the same panel, with the short URL printed below as a fallback for anything that can't scan. Only appears when `$wgUrlShortenerEnableQrCode` is enabled.

If the UrlShortener API call fails, both buttons disappear together and the panel falls back to its copy-link-and-services layout.

The copy-link field and the share tiles always use the full page URL — short URLs are reserved for the dedicated button and the QR view. If UrlShortener isn't installed, neither button appears and the rest of the panel works the same.

## Configuration

Share is enabled by default. To turn it off entirely, set `$wgCitizenEnableShare = false;` in `LocalSettings.php`.

When enabled, pick how share behaves with `$wgCitizenShareMode`:

```php
$wgCitizenShareMode = 'auto'; // 'auto' | 'panel' | 'native'
```

| Value | When to use |
| :--- | :--- |
| `'auto'` *(default)* | Best of both worlds — most wikis should keep the default. |
| `'panel'` | When you want consistent branding across all browsers, or when your curated share targets are central to your wiki's identity. |
| `'native'` | When you want to defer entirely to the OS share experience. |

## Extending the share panel

### On-wiki JSON

Create the page `MediaWiki:Citizen-share-services.json` on your wiki and paste a JSON array of service entries. Save the page, and the new services appear the next time anyone opens the panel.

::: warning Allowed URL protocols
Citizen drops any service whose `url` uses a protocol not in MediaWiki's `$wgUrlProtocols` list (`http://`, `https://`, `mailto:` and a handful of others by default). If a service silently disappears after you add it, check the protocol first.
:::

#### Starter pack

Here's a Facebook / X / Mastodon / Bluesky setup you can copy in as-is. Icons are embedded directly, so nothing extra needs to be uploaded:

```json
[
  {
    "name": "facebook",
    "label": "Facebook",
    "url": "https://www.facebook.com/sharer/sharer.php?u={{url}}",
    "color": "#0865FE",
    "icon": "data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+RmFjZWJvb2s8L3RpdGxlPjxwYXRoIGQ9Ik05LjEwMSAyMy42OTF2LTcuOThINi42Mjd2LTMuNjY3aDIuNDc0di0xLjU4YzAtNC4wODUgMS44NDgtNS45NzggNS44NTgtNS45NzguNDAxIDAgLjk1NS4wNDIgMS40NjguMTAzYTguNjggOC42OCAwIDAgMSAxLjE0MS4xOTV2My4zMjVhOC42MjMgOC42MjMgMCAwIDAtLjY1My0uMDM2IDI2LjgwNSAyNi44MDUgMCAwIDAtLjczMy0uMDA5Yy0uNzA3IDAtMS4yNTkuMDk2LTEuNjc1LjMwOWExLjY4NiAxLjY4NiAwIDAgMC0uNjc5LjYyMmMtLjI1OC40Mi0uMzc0Ljk5NS0uMzc0IDEuNzUydjEuMjk3aDMuOTE5bC0uMzg2IDIuMTAzLS4yODcgMS41NjRoLTMuMjQ2djguMjQ1QzE5LjM5NiAyMy4yMzggMjQgMTguMTc5IDI0IDEyLjA0NGMwLTYuNjI3LTUuMzczLTEyLTEyLTEycy0xMiA1LjM3My0xMiAxMmMwIDUuNjI4IDMuODc0IDEwLjM1IDkuMTAxIDExLjY0N1oiLz48L3N2Zz4="
  },
  {
    "name": "x",
    "label": "X",
    "url": "https://x.com/intent/tweet?url={{url}}&text={{title}}",
    "color": "#000000",
    "open_in_modal": true,
    "icon": "data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+WDwvdGl0bGU+PHBhdGggZD0iTTE0LjIzNCAxMC4xNjIgMjIuOTc3IDBoLTIuMDcybC03LjU5MSA4LjgyNEw3LjI1MSAwSC4yNThsOS4xNjggMTMuMzQzTC4yNTggMjRIMi4zM2w4LjAxNi05LjMxOEwxNi43NDkgMjRoNi45OTN6bS0yLjgzNyAzLjI5OS0uOTI5LTEuMzI5TDMuMDc2IDEuNTZoMy4xODJsNS45NjUgOC41MzIuOTI5IDEuMzI5IDcuNzU0IDExLjA5aC0zLjE4MnoiLz48L3N2Zz4="
  },
  {
    "name": "mastodon",
    "label": "Mastodon",
    "url": "https://mastodon.social/share?text={{title}}%20{{url}}",
    "color": "#6364FF",
    "icon": "data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+TWFzdG9kb248L3RpdGxlPjxwYXRoIGQ9Ik0yMy4yNjggNS4zMTNjLS4zNS0yLjU3OC0yLjYxNy00LjYxLTUuMzA0LTUuMDA0QzE3LjUxLjI0MiAxNS43OTIgMCAxMS44MTMgMGgtLjAzYy0zLjk4IDAtNC44MzUuMjQyLTUuMjg4LjMwOUMzLjg4Mi42OTIgMS40OTYgMi41MTguOTE3IDUuMTI3LjY0IDYuNDEyLjYxIDcuODM3LjY2MSA5LjE0M2MuMDc0IDEuODc0LjA4OCAzLjc0NS4yNiA1LjYxMS4xMTggMS4yNC4zMjUgMi40Ny42MiAzLjY4LjU1IDIuMjM3IDIuNzc3IDQuMDk4IDQuOTYgNC44NTcgMi4zMzYuNzkyIDQuODQ5LjkyMyA3LjI1Ni4zOC4yNjUtLjA2MS41MjctLjEzMi43ODYtLjIxMy41ODUtLjE4NCAxLjI3LS4zOSAxLjc3NC0uNzUzYS4wNTcuMDU3IDAgMCAwIC4wMjMtLjA0M3YtMS44MDlhLjA1Mi4wNTIgMCAwIDAtLjAyLS4wNDEuMDUzLjA1MyAwIDAgMC0uMDQ2LS4wMSAyMC4yODIgMjAuMjgyIDAgMCAxLTQuNzA5LjU0NWMtMi43MyAwLTMuNDYzLTEuMjg0LTMuNjc0LTEuODE4YTUuNTkzIDUuNTkzIDAgMCAxLS4zMTktMS40MzMuMDUzLjA1MyAwIDAgMSAuMDY2LS4wNTRjMS41MTcuMzYzIDMuMDcyLjU0NiA0LjYzMi41NDYuMzc2IDAgLjc1IDAgMS4xMjUtLjAxIDEuNTctLjA0NCAzLjIyNC0uMTI0IDQuNzY4LS40MjIuMDM4LS4wMDguMDc3LS4wMTUuMTEtLjAyNCAyLjQzNS0uNDY0IDQuNzUzLTEuOTIgNC45ODktNS42MDQuMDA4LS4xNDUuMDMtMS41Mi4wMy0xLjY3LjAwMi0uNTEyLjE2Ny0zLjYzLS4wMjQtNS41NDV6bS0zLjc0OCA5LjE5NWgtMi41NjFWOC4yOWMwLTEuMzA5LS41NS0xLjk3Ni0xLjY3LTEuOTc2LTEuMjMgMC0xLjg0Ni43OS0xLjg0NiAyLjM1djMuNDAzaC0yLjU0NlY4LjY2M2MwLTEuNTYtLjYxNy0yLjM1LTEuODQ4LTIuMzUtMS4xMTIgMC0xLjY2OC42NjgtMS42NyAxLjk3N3Y2LjIxOEg0LjgyMlY4LjEwMmMwLTEuMzEuMzM3LTIuMzUgMS4wMTEtMy4xMi42OTYtLjc3IDEuNjA4LTEuMTY0IDIuNzQtMS4xNjQgMS4zMTEgMCAyLjMwMi41IDIuOTYyIDEuNDk4bC42MzggMS4wNi42MzgtMS4wNmMuNjYtLjk5OSAxLjY1LTEuNDk4IDIuOTYtMS40OTggMS4xMyAwIDIuMDQzLjM5NSAyLjc0IDEuMTY0LjY3NS43NyAxLjAxMiAxLjgxIDEuMDEyIDMuMTJ6Ii8+PC9zdmc+"
  },
  {
    "name": "bluesky",
    "label": "Bluesky",
    "url": "https://bsky.app/intent/compose?text={{title}}%20{{url}}",
    "color": "#1185FE",
    "icon": "data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+Qmx1ZXNreTwvdGl0bGU+PHBhdGggZD0iTTUuMjAyIDIuODU3QzcuOTU0IDQuOTIyIDEwLjkxMyA5LjExIDEyIDExLjM1OGMxLjA4Ny0yLjI0NyA0LjA0Ni02LjQzNiA2Ljc5OC04LjUwMUMyMC43ODMgMS4zNjYgMjQgLjIxMyAyNCAzLjg4M2MwIC43MzItLjQyIDYuMTU2LS42NjcgNy4wMzctLjg1NiAzLjA2MS0zLjk3OCAzLjg0Mi02Ljc1NSAzLjM3IDQuODU0LjgyNiA2LjA4OSAzLjU2MiAzLjQyMiA2LjI5OS01LjA2NSA1LjE5Ni03LjI4LTEuMzA0LTcuODQ3LTIuOTctLjEwNC0uMzA1LS4xNTItLjQ0OC0uMTUzLS4zMjcgMC0uMTIxLS4wNS4wMjItLjE1My4zMjctLjU2OCAxLjY2Ni0yLjc4MiA4LjE2Ni03Ljg0NyAyLjk3LTIuNjY3LTIuNzM3LTEuNDMyLTUuNDczIDMuNDIyLTYuMy0yLjc3Ny40NzMtNS44OTktLjMwOC02Ljc1NS0zLjM2OUMuNDIgMTAuMDQgMCA0LjYxNSAwIDMuODgzYzAtMy42NyAzLjIxNy0yLjUxNyA1LjIwMi0xLjAyNiIvPjwvc3ZnPg=="
  }
]
```

Icons are [Simple Icons](https://simpleicons.org/) (CC0).

#### Service fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | string | Internal identifier. Used as the tile's CSS id (`citizen-share-service-<name>`) so you can target it with custom CSS on your wiki. Characters outside `[a-zA-Z0-9_-]` are stripped from the id. |
| `label` | string | The name your users see — read by screen readers and shown on hover. |
| `url` | string | The link opened when the tile is clicked. Use `{{url}}` and `{{title}}` placeholders for the current page's URL and title. |
| `color` | string | Background color of the tile. Match the service's brand color when possible. |
| `open_in_modal` | boolean | Open in a small popup window instead of a new tab. Useful for services that show a share dialog, like X. `mailto:` links always open in the same tab and ignore this flag. |
| `icon` | string | The icon shown on the tile. See [Icons](#icons) below. |
| `file` | string | Alternative to `icon`: the filename of an SVG uploaded to your wiki. See [Icons](#icons) below. |

#### Icons

The icon is shown in white on the brand color, so single-color glyphs work best. Three ways to provide one:

1. **Embedded** — paste the SVG directly into the JSON as a `data:image/svg+xml;base64,...` value (like the starter pack above). Nothing extra to upload, nothing external to depend on. Best for most wikis.
2. **From your wiki's media library** — upload the SVG via `Special:Upload`, then leave `icon` out and add a `file` field with the filename. Useful if you already maintain icons as wiki files.
3. **External URL** — point `icon` at any image URL. Quick to set up, but the icon comes from a third party — first-time visitors pay a network round-trip for it (cached afterwards), and your share panel breaks if that host goes down or removes the file. Best avoided.
