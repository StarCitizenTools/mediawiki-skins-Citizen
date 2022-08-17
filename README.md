# Citizen
[![](https://img.shields.io/github/contributors/badges/shields.svg)](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/graphs/contributors) ![](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/workflows/MediaWiki%20CI/badge.svg) [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![MediaWiki: >=1.35.0](https://img.shields.io/badge/MediaWiki-%3E%3D1.35.2-%2336c)](https://www.mediawiki.org)

Citizen is a responsive skin for [MediaWiki](https://www.mediawiki.org) built by the [Star Citizen Wiki](https://starcitizen.tools) team. Although it is specifically built for the Star Citizen Wiki, the skin is designed to be flexible to run on any Mediawiki installation that is **1.35.2 or higher**. Due to resource constraints, we might not be able to provide full support for setups that are vastly different than us, but please feel free to submit patches or bug report!

Live demo can be seen at the [Star Citizen Wiki](https://starcitizen.tools), more avaliable [here](https://wikiapiary.com/wiki/Skin:Citizen).

## Notable features
- **Fully responsive skin**: Responsive and able to adapt to different screen sizes. 📱💻🖥️
- **Light/dark mode support**: Switch between light and dark mode. ***Require JS*** ☀️🌙
- **Adjustable font size and page width**: Read the article the way you wanted. ***Require JS*** 👀📃
- **Collapsible sections**: Collapse and expand article sections. ***Require JS*** 📖📕
- **Persistent ToC**: Access ToC anywhere in the article. ***Tracking require JS*** 🔍📖
- **Rich search suggestions**: More helpful search suggestions with images and descriptions. ***Require JS*** 🔍👀
- **Webapp manifest**: Give a more app-like experience when user add your wiki to their home screen. 📱

## SkinStyles
Citizen includes numerous skinStyles that applies custom styling to extensions and core libraries. Please feel free to submit PRs if you want to add support for more extensions! Unless the extension has never supported the current minimum required MediaWiki version of the skin, the skinStyles are based on the latest version of the said MW release branch (e.g. `REL1_35` for MediaWiki 1.35).

- **Grade A - Overhaul** - Major adjustments to UI, plus Grade B.
- **Grade B - Dynamic** - Colors are converted into CSS variables, little to none style adjustments.
- **Grade E - Legacy** - Dark mode colors are hardcored as LESS variables. These should be updated to at least Grade B support.

### Core
Name | Grade | Version | Last updated
:--- | :--- | :--- | :---
MediaWiki UI | B | 1.35.3 | 2021-07-27
OOUI | B | 0.39.3 `086b4f1` | 2021-07-26

### Extensions
Name | Grade | Version | Last updated
:--- | :--- | :--- | :---
[AdvancedSearch](https://www.mediawiki.org/wiki/Extension:AdvancedSearch) | B | REL1_35 `fae6250` | 2021-08-26
[ApprovedRevs](https://www.mediawiki.org/wiki/Extension:Approved_Revs) | B | N/A | N/A
[Babel](https://www.mediawiki.org/wiki/Extension:Babel) | B | MLEB 2021.07 | 2021-07-29
[Capiunto](https://www.mediawiki.org/wiki/Extension:Capiunto) | B | REL1_35 `30049a7` | 2021-08-26
[Cargo](https://www.mediawiki.org/wiki/Extension:Cargo) | B | REL1_35 `df13273` | 2021-08-31
[CategoryTree](https://www.mediawiki.org/wiki/Extension:CategoryTree) | B | N/A | N/A
[CentralNotice](https://www.mediawiki.org/wiki/Extension:CentralNotice) | B | REL1_35 `4aa2a8f` | 2022-06-16
[Cite](https://www.mediawiki.org/wiki/Extension:Cite) | A | N/A | N/A
[CleanChanges](https://www.mediawiki.org/wiki/Extension:CleanChanges) | B | MLEB 2021.07 | 2021-07-29
[CodeMirror](https://www.mediawiki.org/wiki/Extension:CodeMirror) | A | REL1_35 `a326407` | 2021-08-25
[CookieWarning](https://www.mediawiki.org/wiki/Extension:CookieWarning) | A | REL1_35 `3c2ae6a` | 2022-04-29
[DiscussionTools](https://www.mediawiki.org/wiki/Extension:DiscussionTools) | A | REL1_35 `7aa0a9b` | 2022-05-06
[DismissableSiteNotice](https://www.mediawiki.org/wiki/Extension:DismissableSiteNotice) | A | N/A | N/A
[Echo](https://www.mediawiki.org/wiki/Extension:Echo) | A | REL1_35 `347c30e` | 2021-08-11
[Flow (StructuredDiscussions)](https://www.mediawiki.org/wiki/Extension:StructuredDiscussions) | B | REL1_35 `e3379f0` | 2022-04-27
[Graph](https://www.mediawiki.org/wiki/Extension:Graph) | B | N/A | N/A
[Interwiki](https://www.mediawiki.org/wiki/Extension:Interwiki) | B | REL1_35 `a65a18e` | 2022-05-15
[Lingo](https://www.mediawiki.org/wiki/Extension:Lingo) | B | REL1_35 `e948775` | 2022-04-29
[Math](https://www.mediawiki.org/wiki/Extension:Math) | E | REL1_35 `b7a7939` | 2022-08-16
[ManageWiki](https://www.mediawiki.org/wiki/Extension:ManageWiki) | B | master `60a2f51` | 2022-06-16
[MsUpload](https://www.mediawiki.org/wiki/Extension:MsUpload) | A | REL1_35 `32eb420` | 2021-08-25
[MultimediaViewer](https://www.mediawiki.org/wiki/Extension:MultimediaViewer) | A | N/A | N/A
[OAuth](https://www.mediawiki.org/wiki/Extension:OAuth) | B | REL1_35 `451ed95` | 2021-08-31
[Popups](https://www.mediawiki.org/wiki/Extension:Popups) | A | REL1_35 `dccd607` | 2021-09-02
[PortableInfobox](https://www.mediawiki.org/wiki/Extension:PortableInfobox) | B | 0.6 `16a77dc` | 2022-04-14
[RelatedArticles](https://www.mediawiki.org/wiki/Extension:RelatedArticles) | A | REL1_35 `0f27333` | 2021-08-31
[RevisionSlider](https://www.mediawiki.org/wiki/Extension:RevisionSlider) | B | REL1_35 `4c4e368` | 2022-06-02
[Semantic MediaWiki](https://www.mediawiki.org/wiki/Extension:Semantic_MediaWiki) | E | N/A | N/A
[Semantic Result Formats](https://www.mediawiki.org/wiki/Extension:Semantic_Result_Formats) | E | N/A | N/A
[SimpleTooltip](https://www.mediawiki.org/wiki/Extension:SimpleTooltip) | B | N/A | 2022-02-19
[SyntaxHighlight](https://www.mediawiki.org/wiki/Extension:SyntaxHighlight) | A | REL1_35 `05598b3` | 2021-08-26
[Tabber](https://www.mediawiki.org/wiki/Extension:Tabber) | A | N/A | N/A
[TabberNeue](https://www.mediawiki.org/wiki/Extension:TabberNeue) | A | 1.3.1 `c045490` | 2022-04-19
[TimedMediaHandler](https://www.mediawiki.org/wiki/Extension:TimedMediaHandler) | B | N/A | N/A
[Translate](https://www.mediawiki.org/wiki/Extension:Translate) | B | MLEB 2021.07 | 2021-07-29
[UniversalLanguageSelector](https://www.mediawiki.org/wiki/Extension:UniversalLanguageSelector) | B | MLEB 2021.12 | 2022-05-17
[UploadWizard](https://www.mediawiki.org/wiki/Extension:UploadWizard) | A | N/A | N/A
[VisualEditor](https://www.mediawiki.org/wiki/Extension:VisualEditor) | A | REL1_35 `cc3466a` | 2021-08-04
[Wikibase](https://www.mediawiki.org/wiki/Extension:Wikibase) | B | REL1_35 `7bb503b` | 2022-05-11
[WikiEditor](https://www.mediawiki.org/wiki/Extension:WikiEditor) | B | REL1_35 `e18315e` | 2021-08-11
[WSSearchFront](https://www.mediawiki.org/wiki/Extension:WSSearchFront) | B | 3.5.4 `c27ebcb5` | 2021-11-23

Some of the field are tagged as N/A because the information was not tracked before.
If you are interested in adding skinstyles, please check out [this page on the wiki](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/wiki/Adding-extension-SkinStyles)!

## Installation
1. [Download](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/archive/main.zip) place the file(s) in a directory called `Citizen` in your `skins/` folder.
2. Add the following code at the bottom of your LocalSettings.php:
```php
wfLoadSkin( 'Citizen' );
```
3. **✔️Done** - Navigate to Special:Version on your wiki to verify that the skin is successfully installed.

## Configurations
**The skin works out of the box without any configurations.**
The config flags allow more customization on the specific features in the skin.
Check out [this wiki page](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/wiki/Adapting-Citizen-styles) on how to adapt Citizen styles on your wiki.

### Appearance
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenThemeDefault` | The default theme of the skin | `auto` - switch between light and dark according to OS/browser settings; `light`; `dark` | `auto`
`$wgCitizenEnableCollapsibleSections` | Enables or disable collapsible sections on content pages | `true` - enable; `false` - disable | `true`
`$wgCitizenShowPageTools` | The condition of page tools visibility | `true` - always visible; `login` - visible to logged-in users; `permission` - visible to users with the right permissions | `true`
`$wgCitizenSiteToolsPortlet` | ID of the portlet to attach the site tools | string |
`$wgCitizenEnableDrawerSiteStats` | Enables the site statistics in drawer menu | `true` - enable; `false` - disable | `true`
`$wgCitizenUseNumberFormatter` | Use NumberFormatter for site statistics, which allows formatting number in a localized way | `true` - enable; `false` - disable | `true`
`$wgCitizenThemeColor` | The color defined in the `theme-color` meta tag | Hex color code | `#131a21`

### Search suggestions
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenEnableSearch` | Enable or disable rich search suggestions |`true` - enable; `false` - disable | `true`
`$wgCitizenSearchGateway` | Which gateway to use for fetching search suggestion |`mwActionApi`; `mwRestApi` | `mwActionApi`
`$wgCitizenSearchDescriptionSource` | Source of description text on search suggestions (only takes effect if `$wgCitizenSearchGateway` is `mwActionApi`) | `wikidata` - Use description provided by [WikibaseLib](Extension:WikibaseLib) or [ShortDescription](https://www.mediawiki.org/wiki/Extension:ShortDescription); `textextracts` - Use description provided by [TextExtracts](https://www.mediawiki.org/wiki/Extension:TextExtracts); `pagedescription` - Use description provided by [Description2](https://www.mediawiki.org/wiki/Extension:Description2) or any other extension that sets the `description` page property | `textextracts`
`$wgCitizenMaxSearchResults` | Max number of search suggestions | Integer > 0 | `6`

### Webapp manifest
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenEnableManifest` | Enable or disable [web app manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) | `true` - enable; `false` - disable | `true`
`$wgCitizenManifestThemeColor` | [Theme color](https://developer.mozilla.org/en-US/docs/Web/Manifest/theme_color) of the web app manifest | Hex color code | `#131a21`
`$wgCitizenManifestBackgroundColor` | [Background color](https://developer.mozilla.org/en-US/docs/Web/Manifest/background_color) of the web app manifest | Hex color code | `#131a21`

### Miscellaneous
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenEnablePreconnect` | Enable or disable [preconnect to required origin](https://web.dev/uses-rel-preconnect/) | `true` - enable; `false` - disable | `false`
`$wgCitizenPreconnectURL` | The URL for preconnect to required origin | URL |
`$wgCitizenThemeColor` | The color defined in the `theme-color` meta tag | Hex color code | `#11151d`

## Requirements
* [MediaWiki](https://www.mediawiki.org) 1.35.2 or later
* For the legacy versions, check the other release branches.

