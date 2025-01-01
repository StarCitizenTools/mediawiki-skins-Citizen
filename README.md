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
`$wgCitizenSearchGateway` | Which gateway to use for fetching search suggestion |`mwActionApi`; `mwRestApi`; `smwAskApi`; string | `mwActionApi`
`$wgCitizenSearchDescriptionSource` | Source of description text on search suggestions (only takes effect if `$wgCitizenSearchGateway` is `mwActionApi`) | `wikidata` - Use description provided by [WikibaseLib](Extension:WikibaseLib) or [ShortDescription](https://www.mediawiki.org/wiki/Extension:ShortDescription); `textextracts` - Use description provided by [TextExtracts](https://www.mediawiki.org/wiki/Extension:TextExtracts); `pagedescription` - Use description provided by [Description2](https://www.mediawiki.org/wiki/Extension:Description2) or any other extension that sets the `description` page property | `textextracts`
`$wgCitizenMaxSearchResults` | Max number of search suggestions | Integer > 0 | `6`

### Webapp manifest
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenEnableManifest` | Enable or disable [web app manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) | `true` - enable; `false` - disable | `true`
`$wgCitizenManifestOptions` | Options of the web app manifest | - | See below

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

- **Grade A - Overhaul** - Major adjustments to UI, plus Grade B.
- **Grade B - Dynamic** - Colors are converted into CSS variables, little to none style adjustments.
- **Grade E - Legacy** - Dark mode colors are hardcored as LESS variables. These should be updated to at least Grade B support.

Please feel free to submit PRs if you want to add support for more extensions!

### Core
Name | Grade | Version | Last updated
:--- | :--- | :--- | :---
MediaWiki UI | A | 1.39.0 | 2023-07-04
Codex | A | 0.1.1 | 2022-12-01
OOUI | A | 0.44.3 | 2023-06-24

### Extensions
Name | Grade | Version | Last updated
:--- | :--- | :--- | :---
[AccountInfo](https://www.mediawiki.org/wiki/Extension:AccountInfo) | A | REL1_39 `3145de8` | 2024-07-13
[AdvancedSearch](https://www.mediawiki.org/wiki/Extension:AdvancedSearch) | B | REL1_39 `3a0eed7` | 2022-12-12
[AJAXPoll](https://www.mediawiki.org/wiki/Extension:AJAXPoll) | A | REL1_39 `8429d8d` | 2022-10-25
[ApprovedRevs](https://www.mediawiki.org/wiki/Extension:Approved_Revs) | B | N/A | N/A
[Babel](https://www.mediawiki.org/wiki/Extension:Babel) | B | MLEB 2021.07 | 2021-07-29
[Capiunto](https://www.mediawiki.org/wiki/Extension:Capiunto) | A | REL1_39 `3a6d523` | 2023-07-14
[Cargo](https://www.mediawiki.org/wiki/Extension:Cargo) | B | REL1_39 `b4c6314` | 2023-01-03
[CategoryTree](https://www.mediawiki.org/wiki/Extension:CategoryTree) | B | N/A | N/A
[CentralNotice](https://www.mediawiki.org/wiki/Extension:CentralNotice) | B | REL1_35 `4aa2a8f` | 2022-06-16
[Cite](https://www.mediawiki.org/wiki/Extension:Cite) | A | N/A | N/A
[CiteThisPage](https://www.mediawiki.org/wiki/Extension:CiteThisPage) | A | REL1_39 `1d21f67` | 2024-07-08
[CleanChanges](https://www.mediawiki.org/wiki/Extension:CleanChanges) | B | MLEB 2021.07 | 2021-07-29
[CodeEditor](https://www.mediawiki.org/wiki/Extension:CodeEditor) | A | REL1_39 `67c012c` | 2023-06-03
[CodeMirror](https://www.mediawiki.org/wiki/Extension:CodeMirror) | A | REL1_35 `a326407` | 2023-05-24
[CommentStreams](https://www.mediawiki.org/wiki/Extension:CommentStreams) | B | REL1_39 `f75ff3b` | 2023-06-02
[CookieWarning](https://www.mediawiki.org/wiki/Extension:CookieWarning) | A | REL1_39 `021d9ea` | 2023-07-30
[DataMaps](https://www.mediawiki.org/wiki/Extension:DataMaps) | A | 0.17.7 `9c448d3` | 2024-07-11
[DiscussionTools](https://www.mediawiki.org/wiki/Extension:DiscussionTools) | A | REL1_39 `1aae2cc` | 2023-06-19
[DismissableSiteNotice](https://www.mediawiki.org/wiki/Extension:DismissableSiteNotice) | A | N/A | N/A
[Echo](https://www.mediawiki.org/wiki/Extension:Echo) | A | REL1_35 `347c30e` | 2023-06-29
[FloatingUI](https://www.mediawiki.org/wiki/Extension:FloatingUI) | A | 0.0.1 | 2024-09-04
[Flow (StructuredDiscussions)](https://www.mediawiki.org/wiki/Extension:StructuredDiscussions) | B | REL1_35 `e3379f0` | 2022-04-27
[FlaggedRevs](https://www.mediawiki.org/wiki/Extension:FlaggedRevs) | B | REL1_39 `130a28f` | 2023-08-03
[Graph](https://www.mediawiki.org/wiki/Extension:Graph) | B | N/A | N/A
[Interwiki](https://www.mediawiki.org/wiki/Extension:Interwiki) | B | REL1_35 `a65a18e` | 2022-05-15
[Lingo](https://www.mediawiki.org/wiki/Extension:Lingo) | B | REL1_35 `e948775` | 2022-04-29
[Math](https://www.mediawiki.org/wiki/Extension:Math) | B | REL1_35 `b7a7939` | 2023-06-04
[ManageWiki](https://www.mediawiki.org/wiki/Extension:ManageWiki) | B | master `e626a9f` | 2023-06-02
[MediaSearch](https://www.mediawiki.org/wiki/Extension:MediaSearch) | A | REL1_39 `e0aa7bb` | 2022-12-09
[MsUpload](https://www.mediawiki.org/wiki/Extension:MsUpload) | A | REL1_35 `32eb420` | 2021-08-25
[MultimediaViewer](https://www.mediawiki.org/wiki/Extension:MultimediaViewer) | A | REL1_39 `1b97775` | 2022-11-26
[OAuth](https://www.mediawiki.org/wiki/Extension:OAuth) | B | REL1_35 `451ed95` | 2021-08-31
[Popups](https://www.mediawiki.org/wiki/Extension:Popups) | A | REL1_39 `a40ebc1` | 2024-10-05
[PortableInfobox](https://www.mediawiki.org/wiki/Extension:PortableInfobox) | A | 0.6 `16a77dc` | 2024-04-17
[RelatedArticles](https://www.mediawiki.org/wiki/Extension:RelatedArticles) | A | REL1_39 `f513e5c` | 2022-11-16
[ReplaceText](https://www.mediawiki.org/wiki/Extension:ReplaceText) | B | REL1_39 `af4840a` | 2023-01-03
[RevisionSlider](https://www.mediawiki.org/wiki/Extension:RevisionSlider) | B | REL1_35 `4c4e368` | 2022-06-02
[Score](https://www.mediawiki.org/wiki/Extension:Score) | B | REL1_39 `0a66cef` | 2023-06-10
[Scribunto](https://www.mediawiki.org/wiki/Extension:Scribunto) | B | REL1_39 `ebb91f2` | 2023-05-29
[SearchDigest](https://www.mediawiki.org/wiki/Extension:SearchDigest) | A | Master `ddd4665` | 2024-07-05
[Semantic MediaWiki](https://www.mediawiki.org/wiki/Extension:Semantic_MediaWiki) | A | 4.0.2 `0fcdfce` | 2022-10-21
[Semantic Result Formats](https://www.mediawiki.org/wiki/Extension:Semantic_Result_Formats) | E | N/A | N/A
[SimpleTooltip](https://www.mediawiki.org/wiki/Extension:SimpleTooltip) | B | N/A | 2022-02-19
[SmiteSpam](https://www.mediawiki.org/wiki/Extension:SmiteSpam) | B | REL1_39 `c81b04b` | 2023-05-30
[StructuredNavigation](https://www.mediawiki.org/wiki/Extension:StructuredNavigation) | A | REL1_39 `55e2ec0` | 2024-09-06
[SyntaxHighlight](https://www.mediawiki.org/wiki/Extension:SyntaxHighlight) | A | REL1_35 `05598b3` | 2023-05-22
[Tabs](https://www.mediawiki.org/wiki/Extension:Tabs) | A | REL1_39 `63ccef2` | 2023-07-11
[Tabber](https://www.mediawiki.org/wiki/Extension:Tabber) | A | N/A | N/A
[TabberNeue](https://www.mediawiki.org/wiki/Extension:TabberNeue) | A | 2.6.0 | 2024-11-16
[TemplateData](https://www.mediawiki.org/wiki/Extension:TemplateData) | A | REL1_39 `7f8c5a8` | 2024-08-19
[TimedMediaHandler](https://www.mediawiki.org/wiki/Extension:TimedMediaHandler) | B | N/A | N/A
[TinyMCE](https://www.mediawiki.org/wiki/Extension:TinyMCE) | A | 1.1.2 | 2024-12-19
[Translate](https://www.mediawiki.org/wiki/Extension:Translate) | A | MLEB 2023.01 | 2023-02-17
[TwoColConflict](https://www.mediawiki.org/wiki/Extension:TwoColConflict) | B | REL1_39 5a2a947 | 2023-01-09
[UniversalLanguageSelector](https://www.mediawiki.org/wiki/Extension:UniversalLanguageSelector) | B | MLEB 2021.12 | 2022-05-17
[UploadWizard](https://www.mediawiki.org/wiki/Extension:UploadWizard) | A | REL1_39 `9cd7a02` | 2023-01-08
[UserProfileV2](https://gitlab.com/telepedia/extensions/userprofilev2) | A | Main `effb3b1` | 2024-07-25
[VEForAll](https://www.mediawiki.org/wiki/Extension:VEForAll) | B | REL1_39 `0de7158` | 2023-05-27
[VisualEditor](https://www.mediawiki.org/wiki/Extension:VisualEditor) | A | REL1_39 `65d89c9` | 2023-02-06
[Wikibase](https://www.mediawiki.org/wiki/Extension:Wikibase) | B | REL1_35 `7bb503b` | 2022-05-11
[WikiEditor](https://www.mediawiki.org/wiki/Extension:WikiEditor) | A | REL1_39 `02e1c70` | 2023-06-03
[WikiHiero](https://www.mediawiki.org/wiki/Extension:WikiHiero) | B | REL1_39 `3a2be51` | 2023-06-04
[WSSearchFront](https://www.mediawiki.org/wiki/Extension:WSSearchFront) | B | 3.5.4 `c27ebcb5` | 2021-11-23

Some of the field are tagged as N/A because the information was not tracked before.
If you are interested in adding skinstyles, please check out [this page on the wiki](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/wiki/Adding-extension-SkinStyles)!
