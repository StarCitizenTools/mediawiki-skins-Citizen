---
title: Site configuration
description: MediaWiki site configuration for the Citizen skin.
---

# Site configuration

**Citizen works out of the box without any configurations!**
The site configs allow more customization on the specific features in the skin.

## Appearance

### <CopyCode code="$wgCitizenHeaderPosition" /> {#wg-citizen-header-position}

- **Default**: `'left'`
- **Type**: `string`
- **Values**: `'left'`, `'right'`, `'top'`, `'bottom'`

Determines where the site header appears on desktop screens.

### <CopyCode code="$wgCitizenThemeDefault" /> {#wg-citizen-theme-default}

- **Default**: `'auto'`
- **Type**: `string`
- **Values**:
  - `'auto'`: Matches the user's system or browser preference
  - `'light'`: Always starts in light mode
  - `'dark'`: Always starts in dark mode

Sets the default color theme for new visitors.

### <CopyCode code="$wgCitizenEnableCollapsibleSections" /> {#wg-citizen-enable-collapsible-sections}

- **Default**: `true`
- **Type**: `boolean`
- **Values**: `true`, `false`

Allows users to collapse and expand sections on pages, making long articles easier to navigate.

### <CopyCode code="$wgCitizenShowPageTools" /> {#wg-citizen-show-page-tools}

- **Default**: `true`
- **Type**: `string` or `true`
- **Values**:
  - `true`: Always visible to everyone
  - `'login'`: Visible only to logged-in users
  - `'permission'`: Visible only to users with specific permissions

Controls who can see the page tools menu (edit, history, etc.).

### <CopyCode code="$wgCitizenGlobalToolsPortlet" /> {#wg-citizen-global-tools-portlet}

- **Default**: (empty)
- **Type**: `string`

The ID of the menu where global tools (like user preferences) should appear. Leave this empty to use the default location.

### <CopyCode code="$wgCitizenEnableDrawerSiteStats" /> {#wg-citizen-enable-drawer-site-stats}

- **Default**: `true`
- **Type**: `boolean`
- **Values**: `true`, `false`

Shows site statistics, such as the total page count, at the header of the side drawer menu.

### <CopyCode code="$wgCitizenUseNumberFormatter" /> {#wg-citizen-use-number-formatter}

- **Default**: `true`
- **Type**: `boolean`
- **Values**: `true`, `false`

Formats numbers in site statistics according to the wiki's language rules (e.g., using commas or dots as separators).

### <CopyCode code="$wgCitizenThemeColor" /> {#wg-citizen-theme-color}

- **Default**: `'#0d0e12'`
- **Type**: `string`
- **Values**: Hex color code

Sets the color of the browser address bar on mobile devices to match your brand.

### <CopyCode code="$wgCitizenEnableARFonts" /> {#wg-citizen-enable-ar-fonts}

- **Default**: `false`
- **Type**: `boolean`
- **Values**: `true`, `false`

Loads the "Noto Naskh Arabic" font, improving readability for wikis that use Arabic script.

### <CopyCode code="$wgCitizenEnableCJKFonts" /> {#wg-citizen-enable-cjk-fonts}

- **Default**: `false`
- **Type**: `boolean`
- **Values**: `true`, `false`

Loads the "Noto Sans CJK" font, improving readability for wikis that use Chinese, Japanese, or Korean characters.

### <CopyCode code="$wgCitizenEnablePreferences" /> {#wg-citizen-enable-preferences}

- **Default**: `true`
- **Type**: `boolean`
- **Values**: `true`, `false`

Enables the user preferences menu, allowing visitors to customize their reading experience (e.g., font size, width).

### <CopyCode code="$wgCitizenOverflowInheritedClasses" /> {#wg-citizen-overflow-inherited-classes}

- **Default**: `['floatleft', 'floatright']`
- **Type**: `array` of CSS class names

A list of CSS classes that should be preserved when tables or images are wrapped in a scrollable container.

### <CopyCode code="$wgCitizenOverflowNowrapClasses" /> {#wg-citizen-overflow-nowrap-classes}

- **Default**: `["noresize", "citizen-table-nowrap", "cargoDynamicTable", "dataTable", "smw-datatable", "srf-datatable"]`
- **Type**: `array` of CSS class names

A list of CSS classes that prevent an element from being wrapped in a scrollable container. Use this for elements that should always display fully.

### <CopyCode code="$wgCitizenTableOfContentsCollapseAtCount" /> {#wg-citizen-table-of-contents-collapse-at-count}

- **Default**: `28`
- **Type**: `integer`

The minimum number of headings required before the sticky table of contents automatically collapses its sub-sections to save space.

## Command palette

### <CopyCode code="$wgCitizenEnableCommandPalette" /> {#wg-citizen-enable-command-palette}

- **Default**: `true`
- **Type**: `boolean`
- **Values**: `true`, `false`

Enables the modern command palette (search bar). If disabled, the wiki will fall back to the standard MediaWiki search module.

## Search suggestions

::: warning Deprecated
The old search module is soft-deprecated. Please use the command palette instead.
:::

### <CopyCode code="$wgCitizenSearchModule" /> {#wg-citizen-search-module}

- **Default**: `'skins.citizen.search'`
- **Type**: `string`
- **Values**: `'skins.citizen.search'`, `'mediawiki.searchSuggest'`, `string`

Selects which search module powers the search suggestions.

### <CopyCode code="$wgCitizenSearchGateway" /> {#wg-citizen-search-gateway}

- **Default**: `'mwRestApi'`
- **Type**: `string`
- **Values**: `'mwActionApi'`, `'mwRestApi'`, `'smwAskApi'`

Selects the API method used to fetch search results. `'mwRestApi'` is generally faster and recommended.

### <CopyCode code="$wgCitizenSearchDescriptionSource" /> {#wg-citizen-search-description-source}

- **Default**: `'textextracts'`
- **Type**: `string`

Determines where the short description text in search results comes from (only applies if using `'mwActionApi'`).

- `wikidata`: [Wikibase](https://www.mediawiki.org/wiki/Extension:Wikibase) or [ShortDescription](https://www.mediawiki.org/wiki/Extension:ShortDescription).
- `textextracts`: [TextExtracts](https://www.mediawiki.org/wiki/Extension:TextExtracts).
- `pagedescription`: [Description2](https://www.mediawiki.org/wiki/Extension:Description2) or other extensions that sets the `description` page property.

### <CopyCode code="$wgCitizenMaxSearchResults" /> {#wg-citizen-max-search-results}

- **Default**: `10`
- **Type**: `integer` > 0

The maximum number of search suggestions to display at once.

## Webapp manifest

### <CopyCode code="$wgCitizenEnableManifest" /> {#wg-citizen-enable-manifest}

- **Default**: `true`
- **Type**: `boolean`
- **Values**: `true`, `false`

Enables the [web app manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest), allowing users to install your wiki as a standalone app on their device.

### <CopyCode code="$wgCitizenManifestOptions" /> {#wg-citizen-manifest-options}

- **Type**: `array`

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
