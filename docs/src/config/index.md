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

### `$wgCitizenThemeDefault`

Sets the default color theme for new visitors.

```php [LocalSettings.php]
$wgCitizenThemeDefault = 'auto';
```

**Values**:

- `'auto'`: Matches the user's system or browser preference
- `'light'`: Always starts in light mode
- `'dark'`: Always starts in dark mode

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

The ID of the menu where global tools (like user preferences) should appear. Leave this empty to use the default location.

```php [LocalSettings.php]
$wgCitizenGlobalToolsPortlet = '';
```

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

Enables the user [preferences panel](/customization/preferences), allowing visitors to customize their experience. The panel is extensible — admins can add custom preferences via on-wiki JSON, and gadgets can register their own options at runtime.

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

## Webapp manifest

### `$wgCitizenEnableManifest`

Enables the [web app manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest), allowing users to install your wiki as a standalone app on their device.

```php [LocalSettings.php]
$wgCitizenEnableManifest = true;
```

**Values**: `true`, `false`

### `$wgCitizenManifestOptions`

Customizes the web app manifest settings, such as the app name, colors, and icons.

::: details View default configuration

```php
$wgCitizenManifestOptions = [
    'background_color' => '#0d0e12',
    'description' => '',
    'short_name' => '',
    'theme_color' => "#0d0e12",
    'icons' => [],
];
```

:::
