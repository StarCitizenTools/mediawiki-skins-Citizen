<div align="center">
👋
<h1>Citizen</h1>
<p>

[![](https://img.shields.io/github/contributors/StarCitizenTools/mediawiki-skins-Citizen?style=flat-square&logo=github)](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/graphs/contributors)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=flat-square&logo=GNU)](https://www.gnu.org/licenses/gpl-3.0)
[![MediaWiki: >=1.43.0](https://img.shields.io/badge/MediaWiki-%3E%3D1.43.0-%2336c?style=flat-square&logo=Wikipedia)](https://www.mediawiki.org)
[![](https://img.shields.io/badge/translations-translatewiki-%23013467?style=flat-square&logo=GoogleTranslate)](https://translatewiki.net/w/i.php?title=Special:Translate&group=mwgithub-star-citizen)
</p>
</div>

![](https://upload.wikimedia.org/wikipedia/commons/0/07/Screenshot-skin-citizen.png)

Citizen is a beautiful, usable, responsive [MediaWiki](https://www.mediawiki.org) skin that makes [extensions](https://www.mediawiki.org/wiki/Manual:Extensions) part of the cohesive experience. It was initially created for the [Star Citizen Wiki](https://starcitizen.tools) but is flexible to run on various MediaWiki configurations.

Live demo: [English](https://starcitizen.tools), [German](https://star-citizen.wiki), [Chinese](https://citizenwiki.cn)

## Notable features
- **Responsive layout**: Responsive and able to adapt to different screen sizes. 📱💻🖥️
- **Light/dark mode**: Switch between light and dark mode. ☀️🌙
- **Improved extension UI**: Adjust supported extensions to be more usable and cohesive. 🤝🔗
- **Reading preferences**: Adjust page width, font size, and line height. 👀📃
- **Collapsible sections**: Collapse and expand article sections. 📖📕
- **Persistent ToC**: Access ToC anywhere in the article. 🔍📖
- **Rich search suggestions**: More helpful search suggestions with images and descriptions. 🔍👀
- **Progressive Web App**: Give a more app-like experience when user add your wiki to their home screen. 📱

## Installation
1. [Download](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/archive/main.zip) place the file(s) in a directory called `Citizen` in your `skins/` folder.
2. Add the following code at the bottom of your LocalSettings.php and **after all other extensions**:
```php
wfLoadSkin( 'Citizen' );
```
3. **✔️Done** - Navigate to Special:Version on your wiki to verify that the skin is successfully installed.

## Configurations
**The skin works out of the box without any configurations.**
The config flags allow more customization on the specific features in the skin.
Check out [this wiki page](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/wiki/Using-Citizen-styles) on how to adapt Citizen styles on your wiki.

### Appearance
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenThemeDefault` | The default theme of the skin | `auto` - switch between light and dark according to OS/browser settings; `light`; `dark` | `auto`
`$wgCitizenEnableCollapsibleSections` | Enables or disable collapsible sections on content pages | `true` - enable; `false` - disable | `true`
`$wgCitizenShowPageTools` | The condition of page tools visibility | `true` - always visible; `login` - visible to logged-in users; `permission` - visible to users with the right permissions | `true`
`$wgCitizenGlobalToolsPortlet` | ID of the portlet to attach the global tools | string |
`$wgCitizenEnableDrawerSiteStats` | Enables the site statistics in drawer menu | `true` - enable; `false` - disable | `true`
`$wgCitizenUseNumberFormatter` | Use NumberFormatter for site statistics, which allows formatting number in a localized way | `true` - enable; `false` - disable | `true`
`$wgCitizenThemeColor` | The color defined in the `theme-color` meta tag | Hex color code | `#0d0e12`
`$wgCitizenEnableARFonts` | Enable included Noto Naskh Arabic for wikis that serve Arabic | `true` - enable; `false` - disable | `false`
`$wgCitizenEnableCJKFonts` | Enable included Noto Sans CJK for wikis that serves CJK languages | `true` - enable; `false` - disable | `false`
`$wgCitizenEnablePreferences` | Enable the preferences menu | `true` - enable; `false` - disable | `true`
`$wgCitizenOverflowInheritedClasses` | Defines css classes inherited by the overflow wrapper | List of css classes. Extend with `$wgCitizenOverflowInheritedClasses[] = 'my_class';` | `["floatleft", "floatright" ]`
`$wgCitizenOverflowNowrapClasses` | Defines css classes ignored by the overflow wrapper | List of css classes. Extend with `$wgCitizenOverflowNowrapClasses[] = 'my_class';` | `["citizen-table-nowrap", "diff", "mw-changeslist-line", "mw-recentchanges-table", "infobox", "cargoDynamicTable", "dataTable", "srf-datatable", "smw-datatable", "mw-capiunto-infobox" ]`

### Search suggestions
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenSearchModule` | Which ResourceLoader module to use for search suggestion | `skins.citizen.search`; `mediawiki.searchSuggest`; string | `skins.citizen.search`
`$wgCitizenSearchGateway` | Which gateway to use for fetching search suggestion |`mwActionApi`; `mwRestApi`; `smwAskApi`; string | `mwRestApi`
`$wgCitizenSearchDescriptionSource` | Source of description text on search suggestions (only takes effect if `$wgCitizenSearchGateway` is `mwActionApi`) | `wikidata` - Use description provided by [WikibaseLib](Extension:WikibaseLib) or [ShortDescription](https://www.mediawiki.org/wiki/Extension:ShortDescription); `textextracts` - Use description provided by [TextExtracts](https://www.mediawiki.org/wiki/Extension:TextExtracts); `pagedescription` - Use description provided by [Description2](https://www.mediawiki.org/wiki/Extension:Description2) or any other extension that sets the `description` page property | `textextracts`
`$wgCitizenMaxSearchResults` | Max number of search suggestions | Integer > 0 | `10`

### Webapp manifest
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenEnableManifest` | Enable or disable [web app manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) | `true` - enable; `false` - disable | `true`
`$wgCitizenManifestOptions` | Options of the web app manifest | - | See below

### Development
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenEnableCommandPalette` | [EXPERIMENTAL] Enables or disable the command palette. Command palette is in active development and may not work as expected. | `true` - enable; `false` - disable | `false`

```php
$wgCitizenManifestOptions = [
	'background_color' => '#0d0e12',
	'description' => '',
	'short_name' => '',
	'theme_color' => "#0d0e12",
	'icons' => [],
];
```

## Requirements
* [MediaWiki](https://www.mediawiki.org) 1.43.0 or later
* For the legacy versions, check the other release branches:

Version | MediaWiki version
:--- | :---
[2.40.2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/releases/tag/v2.40.2) | > 1.39.4
[1.17.9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/releases/tag/v1.17.9) | > 1.35.2

## Recommended extensions
These extensions are optional. They are recommended to enable additional feature in Citizen.
- [PageImages](https://www.mediawiki.org/wiki/Extension:PageImages) (bundled with MediaWiki) - Add image to search suggestion results
- [TextExtracts](https://www.mediawiki.org/wiki/Extension:TextExtracts) (bundled with MediaWiki) - Add description to search suggestion results
- [ShortDescription](https://www.mediawiki.org/wiki/Extension:ShortDescription) - Add short description to under page title and search suggestion results (needs to set `$wgCitizenSearchDescriptionSource` to `wikidata`)
- [TemplateStylesExtender](https://www.mediawiki.org/wiki/Extension:TemplateStylesExtender) (if you use [TemplateStyles](https://www.mediawiki.org/wiki/Extension:TemplateStyles)) - Allow the use of CSS variables in TemplateStyles, including the ones provided by Citizen

## Extension styles
Citizen overrides some extension styles through skinStyles that applies custom styling to extensions and core libraries.
Please feel free to submit PRs if you want to add support for more extensions!

### Extensions
Name | Version
:--- | :---
[AccountInfo](https://www.mediawiki.org/wiki/Extension:AccountInfo) | REL1_39 `3145de8`
[AdvancedSearch](https://www.mediawiki.org/wiki/Extension:AdvancedSearch) | REL1_39 `3a0eed7`
[AJAXPoll](https://www.mediawiki.org/wiki/Extension:AJAXPoll) | REL1_39 `8429d8d`
[ApprovedRevs](https://www.mediawiki.org/wiki/Extension:Approved_Revs) | N/A
[Babel](https://www.mediawiki.org/wiki/Extension:Babel) | MLEB 2021.07
[Capiunto](https://www.mediawiki.org/wiki/Extension:Capiunto) | REL1_39 `3a6d523`
[Cargo](https://www.mediawiki.org/wiki/Extension:Cargo) | REL1_39 `b4c6314`
[CategoryTree](https://www.mediawiki.org/wiki/Extension:CategoryTree) | N/A
[CentralNotice](https://www.mediawiki.org/wiki/Extension:CentralNotice) | REL1_35 `4aa2a8f`
[Cite](https://www.mediawiki.org/wiki/Extension:Cite) | N/A
[CiteThisPage](https://www.mediawiki.org/wiki/Extension:CiteThisPage) | REL1_39 `1d21f67`
[CleanChanges](https://www.mediawiki.org/wiki/Extension:CleanChanges) | MLEB 2021.07
[CodeEditor](https://www.mediawiki.org/wiki/Extension:CodeEditor) | REL1_39 `67c012c`
[CodeMirror](https://www.mediawiki.org/wiki/Extension:CodeMirror) | REL1_43
[CommentStreams](https://www.mediawiki.org/wiki/Extension:CommentStreams) | REL1_43
[CookieWarning](https://www.mediawiki.org/wiki/Extension:CookieWarning) | REL1_39 `021d9ea`
[DataMaps](https://www.mediawiki.org/wiki/Extension:DataMaps) | 0.17.7 `9c448d3`
[DiscussionTools](https://www.mediawiki.org/wiki/Extension:DiscussionTools) | REL1_39 `1aae2cc`
[DismissableSiteNotice](https://www.mediawiki.org/wiki/Extension:DismissableSiteNotice) | N/A
[Echo](https://www.mediawiki.org/wiki/Extension:Echo) | REL1_35 `347c30e`
[FloatingUI](https://www.mediawiki.org/wiki/Extension:FloatingUI) | 0.0.1
[Flow (StructuredDiscussions)](https://www.mediawiki.org/wiki/Extension:StructuredDiscussions) | REL1_35 `e3379f0`
[FlaggedRevs](https://www.mediawiki.org/wiki/Extension:FlaggedRevs) | REL1_39 `130a28f`
[Graph](https://www.mediawiki.org/wiki/Extension:Graph) | N/A
[Interwiki](https://www.mediawiki.org/wiki/Extension:Interwiki) | REL1_35 `a65a18e`
[Lingo](https://www.mediawiki.org/wiki/Extension:Lingo) | REL1_35 `e948775`
[Math](https://www.mediawiki.org/wiki/Extension:Math) | REL1_35 `b7a7939`
[ManageWiki](https://www.mediawiki.org/wiki/Extension:ManageWiki) | master `e626a9f`
[MediaSearch](https://www.mediawiki.org/wiki/Extension:MediaSearch) | REL1_39 `e0aa7bb`
[MsUpload](https://www.mediawiki.org/wiki/Extension:MsUpload) | REL1_35 `32eb420`
[MultimediaViewer](https://www.mediawiki.org/wiki/Extension:MultimediaViewer) | REL1_43
[OAuth](https://www.mediawiki.org/wiki/Extension:OAuth) | REL1_35 `451ed95`
[Popups](https://www.mediawiki.org/wiki/Extension:Popups) | REL1_43
[PortableInfobox](https://www.mediawiki.org/wiki/Extension:PortableInfobox) | 0.6 `16a77dc`
[RelatedArticles](https://www.mediawiki.org/wiki/Extension:RelatedArticles) | REL1_43
[ReplaceText](https://www.mediawiki.org/wiki/Extension:ReplaceText) | REL1_39 `af4840a`
[RevisionSlider](https://www.mediawiki.org/wiki/Extension:RevisionSlider) | REL1_35 `4c4e368`
[Score](https://www.mediawiki.org/wiki/Extension:Score) | REL1_39 `0a66cef`
[Scribunto](https://www.mediawiki.org/wiki/Extension:Scribunto) | REL1_39 `ebb91f2`
[SearchDigest](https://www.mediawiki.org/wiki/Extension:SearchDigest) | Master `ddd4665`
[Semantic MediaWiki](https://www.mediawiki.org/wiki/Extension:Semantic_MediaWiki) | 4.0.2 `0fcdfce`
[Semantic Result Formats](https://www.mediawiki.org/wiki/Extension:Semantic_Result_Formats) | 5.0.0
[SimpleTooltip](https://www.mediawiki.org/wiki/Extension:SimpleTooltip) | N/A
[SmiteSpam](https://www.mediawiki.org/wiki/Extension:SmiteSpam) | REL1_39 `c81b04b`
[StructuredNavigation](https://www.mediawiki.org/wiki/Extension:StructuredNavigation) | REL1_39 `55e2ec0`
[SyntaxHighlight](https://www.mediawiki.org/wiki/Extension:SyntaxHighlight) | REL1_35 `05598b3`
[Tabs](https://www.mediawiki.org/wiki/Extension:Tabs) | REL1_39 `63ccef2`
[Tabber](https://www.mediawiki.org/wiki/Extension:Tabber) | N/A
[TabberNeue](https://www.mediawiki.org/wiki/Extension:TabberNeue) | 2.6.0
[TemplateData](https://www.mediawiki.org/wiki/Extension:TemplateData) | REL1_43
[TimedMediaHandler](https://www.mediawiki.org/wiki/Extension:TimedMediaHandler) | N/A
[TinyMCE](https://www.mediawiki.org/wiki/Extension:TinyMCE) | 1.1.2
[Translate](https://www.mediawiki.org/wiki/Extension:Translate) | MLEB 2023.01
[TwoColConflict](https://www.mediawiki.org/wiki/Extension:TwoColConflict) | REL1_39 5a2a947
[UniversalLanguageSelector](https://www.mediawiki.org/wiki/Extension:UniversalLanguageSelector) | MLEB 2021.12
[UploadWizard](https://www.mediawiki.org/wiki/Extension:UploadWizard) | REL1_43
[UserProfileV2](https://gitlab.com/telepedia/extensions/userprofilev2) | Main `effb3b1`
[VEForAll](https://www.mediawiki.org/wiki/Extension:VEForAll) | REL1_39 `0de7158`
[VisualEditor](https://www.mediawiki.org/wiki/Extension:VisualEditor) | REL1_43
[Wikibase](https://www.mediawiki.org/wiki/Extension:Wikibase) | REL1_35 `7bb503b`
[WikiEditor](https://www.mediawiki.org/wiki/Extension:WikiEditor) | REL1_43
[WikiHiero](https://www.mediawiki.org/wiki/Extension:WikiHiero) | REL1_39 `3a2be51`
[WSSearchFront](https://www.mediawiki.org/wiki/Extension:WSSearchFront) | 3.5.4 `c27ebcb5`

Some of the field are tagged as N/A because the information was not tracked before.
If you are interested in adding skinstyles, please check out [this page on the wiki](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/wiki/Adding-extension-SkinStyles)!
