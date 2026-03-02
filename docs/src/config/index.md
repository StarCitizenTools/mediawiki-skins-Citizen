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

Enables the user preferences menu, allowing visitors to customize their reading experience (e.g., font size, width).

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

## Command palette

### `$wgCitizenEnableCommandPalette`

Enables the modern command palette (search bar). If disabled, the wiki will fall back to the standard MediaWiki search module.

```php [LocalSettings.php]
$wgCitizenEnableCommandPalette = true;
```

**Values**: `true`, `false`

## Search

### `$wgCitizenSearchGateway`

Selects the backend used to fetch search results in both the command palette and the legacy search module.

```php [LocalSettings.php]
$wgCitizenSearchGateway = 'mwRestApi';
```

**Values**:

- `'mwRestApi'`: MediaWiki REST API (default, recommended for most wikis)
- `'mwActionApi'`: MediaWiki Action API
- `'smwAskApi'`: [Semantic MediaWiki](https://www.semantic-mediawiki.org/) Ask API — uses SMW queries to fetch results with custom properties like display titles, thumbnails, and descriptions

### `$wgCitizenMaxSearchResults`

The maximum number of search results to display at once.

```php [LocalSettings.php]
$wgCitizenMaxSearchResults = 10;
```

### `$wgCitizenSearchSmwApiAction`

The Semantic MediaWiki query action to use. Only applies when `$wgCitizenSearchGateway` is set to `'smwAskApi'`.

```php [LocalSettings.php]
$wgCitizenSearchSmwApiAction = 'ask';
```

**Values**:

- `'ask'`: Standard SMW [ask](https://www.semantic-mediawiki.org/wiki/Ask_API) action — uses a single query string
- `'compoundquery'`: SMW [compoundquery](https://www.mediawiki.org/wiki/Extension:SemanticCompoundQueries) action — allows multiple sub-queries separated by `|`, each with their own conditions and printouts (requires the [SemanticCompoundQueries](https://www.mediawiki.org/wiki/Extension:SemanticCompoundQueries) extension)

### `$wgCitizenSearchSmwAskApiQueryTemplate`

The SMW query template used to fetch search suggestions. Only applies when `$wgCitizenSearchGateway` is set to `'smwAskApi'`.

```php [LocalSettings.php]
// Single query (action: 'ask')
$wgCitizenSearchSmwAskApiQueryTemplate = '[[Display_title_of::~*${input}*]]|?Display_title_of=displaytitle|?Page_Image=thumbnail|?Description=desc';

// Compound query (action: 'compoundquery') — exact match first, then fuzzy
$wgCitizenSearchSmwAskApiQueryTemplate = '
[[HasNormalizedLabel::${input_normalized}]][[HasId::!~*#*]];?HasLabel=displaytitle;?HasImage=thumbnail;?HasDescription=desc;limit=1
|[[HasNormalizedLabel::~*${input_normalized_tokenized}*]][[HasId::!~*#*]];?HasLabel=displaytitle;?HasImage=thumbnail;?HasDescription=desc;limit=7
';
```

**Template variables** — these placeholders are replaced at query time:

| Variable | Description |
| :--- | :--- |
| `${input}` | The raw user input |
| `${input_lowercase}` | Lowercased input |
| `${input_normalized}` | Lowercased with non-alphanumeric characters removed |
| `${input_normalized_tokenized}` | Each word normalized separately, joined with `*` wildcards |

**Printout aliases** — use these aliases in your `?Property=alias` printouts to map results to the search UI:

| Alias | Maps to |
| :--- | :--- |
| `displaytitle` | Result label (supports multi-language JSON values) |
| `thumbnail` | Result thumbnail image |
| `desc` | Result description (supports multi-language JSON values) |
| `type` | Result type badge |

**Special behaviors:**

- **UUID detection**: If the input matches a UUID pattern (`xxxxxxxx-xxxx-...`), the query automatically switches to `[[HasUuid::{input}]]` for direct lookup
- **Namespace filtering**: Input like `Category:Something` automatically adds a `[[Category:+]]` condition and searches for `Something` only
- **Multi-language support**: Properties returning JSON objects (e.g. `{"en": "Battery", "de": "Batterie"}`) are resolved based on the user's language preference, falling back to English, then the first available value

### Deprecated search settings

::: warning Deprecated
These settings only apply to the legacy search module (`skins.citizen.search`) and have no effect when the command palette is enabled.
:::

### `$wgCitizenSearchModule`

Selects which search module powers the search suggestions.

```php [LocalSettings.php]
$wgCitizenSearchModule = 'skins.citizen.search';
```

**Values**: `'skins.citizen.search'`, `'mediawiki.searchSuggest'`, other ResourceLoader module names

### `$wgCitizenSearchDescriptionSource`

Determines where the short description text in search results comes from (only applies if using `'mwActionApi'`).

```php [LocalSettings.php]
$wgCitizenSearchDescriptionSource = 'textextracts';
```

- `wikidata`: [Wikibase](https://www.mediawiki.org/wiki/Extension:Wikibase) or [ShortDescription](https://www.mediawiki.org/wiki/Extension:ShortDescription).
- `textextracts`: [TextExtracts](https://www.mediawiki.org/wiki/Extension:TextExtracts).
- `pagedescription`: [Description2](https://www.mediawiki.org/wiki/Extension:Description2) or other extensions that sets the `description` page property.

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
