---
title: Configuration
description: MediaWiki skin configuration for the Citizen skin.
---

# Configuration

::: tip Citizen works out of the box without any configurations!

The skin configs allow more customization on the specific features in the skin.
:::

## Appearance

### `$wgCitizenHeaderPosition`

Determines where the site header appears on desktop screens.

```php [LocalSettings.php]
$wgCitizenHeaderPosition = 'left';
```

**Values**: `'left'`, `'right'`, `'top'`, `'bottom'`

### `$wgCitizenHeaderPositionMobile`

Determines where the site header appears below the desktop breakpoint, tablets included. Side placements do not fit small screens, so only the top and bottom edges are supported.

```php [LocalSettings.php]
$wgCitizenHeaderPositionMobile = 'bottom';
```

**Values**: `'top'`, `'bottom'`

### `$wgCitizenThemeDefault`

::: warning Deprecated
Set the default with the `skin-theme` preference's [`default` field](../features/preferences.md#setting-defaults) in `MediaWiki:Citizen-preferences.json` instead. This config keeps working until Citizen 4 as a fallback — the JSON value wins when both are set.
:::

Sets the default color theme for new visitors.

```php [LocalSettings.php]
$wgCitizenThemeDefault = 'auto';
```

**Values**:

- `'auto'`: Matches the user's system or browser preference
- `'light'`: Always starts in light mode
- `'dark'`: Always starts in dark mode
- `'black'`: Always starts in the Black theme

The option also accepts any theme value registered on the wiki, e.g. `'ocean'` for a [custom theme](../customization/theming.md#creating-a-theme). The config itself is not gated — but the Black theme and custom themes ride the [preview channel](../contribute/preview-channel.md) until Citizen 4. Outside the preview, `'black'` falls back to an equivalent dark rendering, and custom themes won't render correctly.

### `$wgCitizenEnableCollapsibleSections`

Allows users to collapse and expand sections on pages, making long articles easier to navigate.

```php [LocalSettings.php]
$wgCitizenEnableCollapsibleSections = true;
```

**Values**: `true`, `false`

### `$wgCitizenShowPageTools`

Controls who can see the page tools menu (edit, history, etc.).

```php [LocalSettings.php]
$wgCitizenShowPageTools = true;
```

**Values**:

- `true`: Always visible to everyone
- `'login'`: Visible only to logged-in users
- `'permission'`: Visible only to users with specific permissions

### `$wgCitizenGlobalToolsPortlet`

Chooses which sidebar menu Citizen moves the "Upload file" link into. Leave it empty and Citizen uses the first menu in [`MediaWiki:Sidebar`](https://www.mediawiki.org/wiki/Manual:Interface/Sidebar) that isn't `SEARCH`, `TOOLBOX` or `LANGUAGES` — Navigation on a stock wiki.

```php [LocalSettings.php]
$wgCitizenGlobalToolsPortlet = '';
```

**Values**: A menu name from `MediaWiki:Sidebar`, such as `'navigation'`. A leading `p-` is optional, so `'p-navigation'` works the same way.

The upload link is the one MediaWiki builds, so it only appears for people who are allowed to upload — see [point the upload link somewhere else](../customization/recipes.md#point-the-upload-link-somewhere-else). On MediaWiki 1.43 the "Special pages" link moves along with it.

::: warning
A name that doesn't match a menu in `MediaWiki:Sidebar` isn't an error — Citizen creates a new menu with that name, so a typo gets you a stray menu rather than a warning.
:::

### `$wgCitizenEnableDrawerSiteStats`

Shows site statistics, such as the total page count, at the header of the side drawer menu.

```php [LocalSettings.php]
$wgCitizenEnableDrawerSiteStats = true;
```

**Values**: `true`, `false`

### `$wgCitizenThemeColor`

Sets the color of the browser address bar on mobile devices to match your brand.

```php [LocalSettings.php]
$wgCitizenThemeColor = '#0d0e12';
```

**Values**: Hex color code

### `$wgCitizenPreview`

::: warning Preview channel
Preview features are production-quality, but their shape may change during the cycle. Changes are announced in the release notes.
:::

Version-scoped switch for the [preview channel](../guide/migrating-to-citizen-4). Set it to the upcoming major release number to run that preview ahead of release. During the current cycle the number is `4`, which enables the new color token pipeline (`skins.citizen.tokens.new`) — exactly one token module ships per request, and `<html>` gets the `citizen-v4` generation class.

```php [LocalSettings.php]
$wgCitizenPreview = 0;
```

**Values**: `0` (stable, default), `4` (preview Citizen 4). Any other value behaves like `0`, so a stale setting never enrolls the wiki in a later cycle.

The channel can also be toggled per-browser without editing `LocalSettings.php`:

- Append `?citizenpreview=4` to any wiki URL to opt in for the current browser. The choice persists in a 24-hour cookie.
- Append `?citizenpreview=0` to opt back out.

When neither the URL parameter nor the cookie is present, `$wgCitizenPreview` decides.

### `$wgCitizenCompat`

Serves compatibility styles so HTML cached by older Citizen versions — up to 6 minor releases back — keeps rendering acceptably while your caches expire. Turn it on before an upgrade, and turn it off once the last stale page is gone. See [Upgrading](../guide/upgrading) for the full lifecycle.

```php [LocalSettings.php]
$wgCitizenCompat = false;
```

**Values**: `true`, `false`

### `$wgCitizenEnableARFonts`

Loads the "Noto Naskh Arabic" font, improving readability for wikis that use Arabic script.

```php [LocalSettings.php]
$wgCitizenEnableARFonts = false;
```

**Values**: `true`, `false`

### `$wgCitizenEnableCJKFonts`

Loads the "Noto Sans CJK" font, improving readability for wikis that use Chinese, Japanese, or Korean characters.

```php [LocalSettings.php]
$wgCitizenEnableCJKFonts = false;
```

**Values**: `true`, `false`

### `$wgCitizenEnablePreferences`

Enables the user [preferences panel](/features/preferences), allowing visitors to customize their experience. The panel is extensible — admins can add custom preferences via on-wiki JSON, and gadgets can register their own options at runtime.

```php [LocalSettings.php]
$wgCitizenEnablePreferences = true;
```

**Values**: `true`, `false`

### `$wgCitizenOverflowInheritedClasses`

A list of CSS classes that should be preserved when tables or images are wrapped in a scrollable container.

```php [LocalSettings.php]
$wgCitizenOverflowInheritedClasses = [ 'floatleft', 'floatright' ];
```

### `$wgCitizenOverflowNowrapClasses`

A list of CSS classes that prevent an element from being wrapped in a scrollable container. Use this for elements that should always display fully.

```php [LocalSettings.php]
$wgCitizenOverflowNowrapClasses = [
    'noresize',
    'citizen-table-nowrap',
    'cargoDynamicTable',
    'dataTable',
    'smw-datatable',
    'srf-datatable'
];
```

### `$wgCitizenTableOfContentsCollapseAtCount`

The minimum number of headings required before the sticky table of contents automatically collapses its sub-sections to save space.

```php [LocalSettings.php]
$wgCitizenTableOfContentsCollapseAtCount = 28;
```

## Share

### `$wgCitizenEnableShare`

Shows the share option on content pages (when the page exists).

```php [LocalSettings.php]
$wgCitizenEnableShare = true;
```

**Values**: `true`, `false`

### `$wgCitizenShareMode`

Which share UI to present.

```php [LocalSettings.php]
$wgCitizenShareMode = 'auto';
```

**Values**:

- `'auto'` (default) — try the browser's Web Share API first; fall back to Citizen's panel when the API isn't available (e.g. desktop Firefox).
- `'panel'` — always use Citizen's panel.
- `'native'` — always use the Web Share API, with a clipboard fallback on browsers that don't support it.

See the [Share customization page](/features/share) for the panel's JSON shape and a starter pack.

## Webapp manifest

### `$wgCitizenEnableManifest`

Enables the [web app manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest), allowing users to install your wiki as a standalone app on their device.

```php [LocalSettings.php]
$wgCitizenEnableManifest = true;
```

**Values**: `true`, `false`

### `$wgCitizenManifestOptions`

Customizes the web app manifest, such as the app description, colors, icons, shortcuts, and screenshots.

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

See the [Progressive web app page](/features/progressive-web-app) for what each option accepts, and for what browsers need before they will offer to install your wiki.
