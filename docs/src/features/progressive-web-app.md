---
title: Progressive web app
description: Citizen generates a web app manifest so readers can install your wiki as a standalone app.
---

# Progressive web app

Citizen generates a [web app manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) for your wiki, so readers can install it and open it like any other app on their device — its own window, its own icon, no browser chrome around it.

If progressive web apps are new to you, [web.dev](https://web.dev/explore/progressive-web-apps) and [MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) both have a good overview. This page only covers what Citizen does.

## How it works

When the manifest is enabled, Citizen adds `<link rel="manifest">` to every page, pointing at `api.php?action=appmanifest`. That endpoint builds the manifest from your wiki's settings:

| Manifest member | Where it comes from |
| :--- | :--- |
| `name` | `$wgSitename` |
| `short_name`, `description` | [Manifest options](#manifest-options) — left out when unset |
| `icons` | [Manifest options](#icons), or [`$wgLogos`](https://www.mediawiki.org/wiki/Manual:$wgLogos) when you set none |
| `screenshots` | [Manifest options](#screenshots) — left out when unset |
| `shortcuts` | [Manifest options](#shortcuts), or Citizen's defaults |
| `theme_color`, `background_color` | [Manifest options](#manifest-options) |
| `start_url` | Your wiki's main page |
| `scope` | Your whole server, so `index.php` URLs stay inside the app |
| `lang`, `dir` | Your wiki's content language |
| `display`, `orientation` | Always `standalone` and `natural` |

Citizen also sets a `<meta name="theme-color">` tag from [`$wgCitizenThemeColor`](/config/#wgcitizenthemecolor). That one tints browser UI during an ordinary visit, and is separate from the manifest's `theme_color`, which applies to the installed app.

::: warning Private wikis get no manifest
The manifest link is only added when anonymous users can read your wiki. If `$wgGroupPermissions['*']['read']` is off, nothing is linked and nothing is installable, no matter how the options below are set.
:::

::: tip Changes take a while to appear
The manifest is served with a one-week cache, so a browser that has already fetched it keeps its copy for up to a week. When testing a change, use a fresh private window, or reload the manifest from your browser's developer tools (in Chrome: **Application ▸ Manifest**).
:::

## Making your wiki installable

Browsers decide for themselves when to offer an install — [web.dev's install criteria](https://web.dev/articles/install-criteria) covers what they look for.

The part worth setting up here is icons. Left alone, the manifest carries whatever your `$wgLogos` happen to be; giving it PNGs of its own is more predictable:

```php [LocalSettings.php]
$wgCitizenManifestOptions['icons'] = [
    [ 'src' => '/images/icon-192.png', 'sizes' => '192x192', 'type' => 'image/png' ],
    [ 'src' => '/images/icon-512.png', 'sizes' => '512x512', 'type' => 'image/png' ],
];
```

A 192×192 and a 512×512 PNG is the usual pair to start from. Adding `'purpose' => 'maskable'` on a version with padding around the artwork gives platforms that crop icons to their own shape something safe to crop.

## The richer install dialog

Instead of a bare "Install?" prompt, browsers can show a fuller dialog with your wiki's name, its description, and a carousel of screenshots. Citizen supports this — it needs [`screenshots`](#screenshots), and a [`description`](#description) is worth setting alongside them.

## Configuration

### `$wgCitizenEnableManifest`

Whether to generate the manifest at all. On by default.

```php [LocalSettings.php]
$wgCitizenEnableManifest = true;
```

### Manifest options

Everything else lives in `$wgCitizenManifestOptions`.

::: details View default configuration

```php
$wgCitizenManifestOptions = [
    'background_color' => '#0d0e12',
    'description' => '',
    'short_name' => '',
    'theme_color' => '#0d0e12',
    'icons' => [],
];
```

:::

#### `description`

The sentence browsers show under your wiki's name in the install dialog. Keep it to a couple of lines — a long one gets truncated.

```php [LocalSettings.php]
$wgCitizenManifestOptions['description'] = 'The community encyclopedia of everything.';
```

#### `short_name`

The name used where the full one does not fit, such as under a home screen icon. Falls back to `$wgSitename`.

```php [LocalSettings.php]
$wgCitizenManifestOptions['short_name'] = 'My wiki';
```

Both are empty by default, and an empty value is left out of the manifest entirely rather than shipped blank.

#### `icons`

The icons the installed app is represented by, as defined by the [manifest `icons` member](https://www.w3.org/TR/appmanifest/#icons-member). Each entry may set `src`, `sizes`, `type`, and `purpose`; any other key is dropped.

```php [LocalSettings.php]
$wgCitizenManifestOptions['icons'] = [
    [ 'src' => '/images/icon-192.png', 'sizes' => '192x192', 'type' => 'image/png' ],
    [ 'src' => '/images/icon.svg', 'sizes' => 'any', 'type' => 'image/svg+xml', 'purpose' => 'any maskable' ],
];
```

Leave the list empty to derive the icons from [`$wgLogos`](https://www.mediawiki.org/wiki/Manual:$wgLogos) instead — Citizen reads each logo's dimensions and MIME type off the file itself, and skips any it cannot measure. Setting the list yourself is the more predictable route, since your logos were chosen for the wiki's header rather than for an app icon.

#### `shortcuts`

The shortcuts a long press or right click on the installed app offers, as defined by the [manifest `shortcuts` member](https://www.w3.org/TR/appmanifest/#shortcuts-member). Each entry may set `name`, `short_name`, `description`, `url`, and `icons`; any other key is dropped. `name` and `url` are both required — the spec says so, and Citizen drops entries missing either rather than shipping them incomplete.

```php [LocalSettings.php]
$wgCitizenManifestOptions['shortcuts'] = [
    [ 'name' => 'Search', 'url' => '/wiki/Special:Search' ],
    [
        'name' => 'Guides',
        'short_name' => 'Guides',
        'description' => 'Community guides',
        'url' => '/wiki/Project:Guides',
        'icons' => [
            [ 'src' => '/images/guides.png', 'sizes' => '96x96' ],
        ],
    ],
];
```

Leave the option unset to get Citizen's defaults — Search, Random, and Recent changes, each resolved against your wiki's own article path. Set it to `[]` to ship no shortcuts at all.

#### `screenshots`

Pictures of your wiki that browsers show in the install dialog, as defined by the [manifest `screenshots` member](https://www.w3.org/TR/appmanifest/#screenshots-member). Each entry may set `src`, `sizes`, `type`, `form_factor`, `label`, and `platform`; any other key is dropped. `src` is required — entries without one are dropped.

```php [LocalSettings.php]
$wgCitizenManifestOptions['screenshots'] = [
    [
        'src' => '/images/screenshot-desktop.png',
        'sizes' => '1920x1080',
        'type' => 'image/png',
        'form_factor' => 'wide',
        'label' => 'An article on desktop',
    ],
    [
        'src' => '/images/screenshot-mobile.png',
        'sizes' => '750x1334',
        'type' => 'image/png',
        'form_factor' => 'narrow',
        'label' => 'An article on mobile',
    ],
];
```

Citizen ships no screenshots by default, because they have to be pictures of your wiki. Leave the option unset and the manifest leaves the member out.

Set `form_factor` on every entry, and supply at least one of each value — an entry that leaves it out can end up shown in one place and never the other.

## Service worker

When your wiki is served from the root of its domain rather than a subdirectory, Citizen registers a service worker on every page load — this has nothing to do with whether a reader has installed the app. It is a placeholder: it does no caching and adds no offline support, so it is safe to ignore if you spot it in your browser's developer tools. Wikis served from a subdirectory skip it entirely.
