# Citizen
![](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/workflows/MediaWiki%20CI/badge.svg)

Citizen is a responsive skin for [MediaWiki](https://www.mediawiki.org) built by the [Star Citizen Wiki](https://starcitizen.tools) team. Although it is specifically built for the Star Citizen Wiki, the skin should be able to run on any Mediawiki installation that is **1.35 or higher**. Due to resource constraints, we might not be able to provide full support for setups that are vastly different than us, but please feel free to submit patches or bug report!

Live demo can be seen at the [Star Citizen Wiki](https://starcitizen.tools), more avaliable [here](https://wikiapiary.com/wiki/Skin:Citizen).

## Notable features
* **Fully responsive skin**: Responsive and able to adapt to different screen sizes. 📱💻🖥️
* **Persistent ToC**: Access ToC anywhere in the article. ***Tracking require JS.*** 🔍📖
* **Rich search suggestions**: More helpful search suggestions with images and descriptions. ***Require JS.*** 🔍👀
* **Lazyload images**: Improve load time of your wiki and avoid unnecessary image downloads. ***Require JS.*** 🚀
* **Light/dark mode support**: Switch between light and dark mode. ☀️🌙
* **Webapp manifest**: Give a more app-like experience when user add your wiki to their home screen. 📱
* **HTTP security response headers**: Enhance the security of your wiki from HTTP response headers. 🔒🔑

## Installation
1. [Download](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/archive/master.zip) place the file(s) in a directory called `Citizen` in your `skins/` folder.
2. Add the following code at the bottom of your LocalSettings.php:
```php
wfLoadSkin( 'Citizen' );
```
3. **✔️Done** - Navigate to Special:Version on your wiki to verify that the skin is successfully installed.

## Configurations
**The skin works out of the box without any configurations.** 
The config flags allow more customization on the specific features in the skin. 

Note that:
* By default, all security-related features are turned off to ensure maximum compatibility.
* If you have a lot of users that do not use javascript, it is recommended to turn off lazyloading of images as it requires javascript to display images properly.

### Appearance
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenThemeDefault` | The default theme of the skin | `auto` - switch between light and dark according to OS/browser settings; `light`; `dark` | `auto`
`$wgCitizenShowPageTools` | The condition of page tools visibility | `true` - always visible; `login` - visible to logged-in users; `permission` - visible to users with the right permissions | `true`
`$wgCitizenPortalAttach` | Label of the portal to attach links to upload and special pages to | string | `first`
`$wgCitizenThemeColor` | The color defined in the `theme-color` meta tag | Hex color code | `#11151d`

### Search suggestions
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenEnableSearch` | Enable or disable rich search suggestions |`true` - enable; `false` - disable | `true`
`$wgCitizenSearchDescriptionSource` | Source of description text on search suggestions | `wikidata` - Use description provided by [WikibaseLib](Extension:WikibaseLib) or [ShortDescription](https://www.mediawiki.org/wiki/Extension:ShortDescription); `textextracts` - Use description provided by [TextExtracts](https://www.mediawiki.org/wiki/Extension:TextExtracts); `pagedescription` - Use description provided by [Description2](https://www.mediawiki.org/wiki/Extension:Description2) or any other extension that sets the `description` page property | `textextracts`
`$wgCitizenMaxSearchResults` | Max number of search suggestions | Integer > 0 | `6`

### Image lazyload
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenEnableLazyload` | Enable or disable image lazyloading | `true` - enable; `false` - disable | `false`

### Security-related
#### Content Security Policy (CSP)
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenEnableCSP` | Enable or disable [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy), as an alternative to [`$wgCSPHeader`](https://www.mediawiki.org/wiki/Manual:$wgCSPHeader) in Mediawiki 1.32+ | `true` - enable; `false` - disable | `false`
`$wgCitizenEnableCSPReportMode` | Enable or disable [CSP report only mode](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only), overrides `$wgCitizenEnableCSP` | `true` - enable; `false` - disable | `false`
`$wgCitizenCSPDirective` | The string of yourr CSP directive | See the [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) page | 

#### HTTP Strict Transport Security (HSTS)
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenEnableHSTS` | Enable or disable [HTTP Strict Transport Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) | `true` - enable; `false` - disable | `false`
`$wgCitizenHSTSMaxAge` | Time in second that the browser should remember that a site is only to be accessed using HTTPS | Integer > 0 | `300`
`$wgCitizenHSTSIncludeSubdomains` | Apply HSTS to all of the site's subdomains | `true` - enable; `false` - disable | `false`
`$wgCitizenHSTSPreload` | Enable or disable [HSTS preload](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security#Preloading_Strict_Transport_Security) | `true` - enable; `false` - disable | `false`

#### Other security headers
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenEnableDenyXFrameOptions` | Enable or disable the deny [X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options) header | `true` - enable; `false` - disable | `false`
`$wgCitizenEnableXXSSProtection` | Enable or disable the [X-XSS-Protection header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection) | `true` - enable; `false` - disable | `false`
`$wgCitizenEnableStrictReferrerPolicy` | Enable or disable `strict-origin-when-cross-origin` [referrer policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy) header, should be used in conjunction with [`$wgReferrerPolicy`](https://www.mediawiki.org/wiki/Manual:$wgReferrerPolicy) as that only outputs the meta tags | `true` - enable; `false` - disable | `false`
`$wgCitizenEnableFeaturePolicy` | Enable or disable [Feature Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy) | `true` - enable; `false` - disable | `false`
`$wgCitizenFeaturePolicyDirective` | The string of your Feature Policy directive | See the [Feature Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy) page | 

### Webapp manifest
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenEnableManifest` | Enable or disable [web app manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) | `true` - enable; `false` - disable | `true`
`$wgCitizenManifestThemeColor` | [Theme color](https://developer.mozilla.org/en-US/docs/Web/Manifest/theme_color) of the web app manifest | Hex color code | `#11151d`
`$wgCitizenManifestBackgroundColor` | [Background color](https://developer.mozilla.org/en-US/docs/Web/Manifest/background_color) of the web app manifest | Hex color code | `#fff`

### Miscellaneous
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenEnablePreconnect` | Enable or disable [preconnect to required origin](https://web.dev/uses-rel-preconnect/) | `true` - enable; `false` - disable | `false`
`$wgCitizenPreconnectURL` | The URL for preconnect to required origin | URL | 
`$wgCitizenThemeColor` | The color defined in the `theme-color` meta tag | Hex color code | `#11151d`
    
## Requirements
* [MediaWiki](https://www.mediawiki.org) 1.35 or later
* For the legacy versions, check the other release branches.

