# Citizen
![](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/workflows/Composer/badge.svg) ![](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/workflows/Grunt/badge.svg)

Citizen is a responsive skin for [MediaWiki](https://www.mediawiki.org) built by the [Star Citizen Wiki](https://starcitizen.tools) team. Although it is specifically built for the Star Citizen Wiki, the skin should be able to run on any Mediawiki installation that is 1.31 or higher. Due to resource constraints, we might not be able to provide full support for setups that are vastly different than us, but please feel free to submit patches or bug report!

Live demo can be seen at the [Star Citizen Wiki](https://starcitizen.tools).

## Notable features
* **Fully responsive skin**: Responsive and able to adapt to different screen sizes. 📱💻🖥️
* **Rich search suggestions**: More helpful search suggestions with images and descriptions. 🔍👀
* **Lazyload images**: Improve load time of your wiki and avoid unnessecary image downloads. 🚀
* **Native light/dark mode support**: Respect OS and app configuration for light and dark mode. ☀️🌙
* **Webapp manifest**: Give a more app-like experience when user add your wiki to their home screen. 📱
* **HTTP security response headers**: Enhance the security of your wiki from HTTP response headers. 🔒🔑

## Configurations
### Search suggestions
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenSearchDescriptionSource` | Source of description text on search suggestions | `wikidata` - Use description provided by [WikibaseLib](Extension:WikibaseLib) or [ShortDescription](https://www.mediawiki.org/wiki/Extension:ShortDescription); `textextracts` - Use description provided by [TextExtracts](https://www.mediawiki.org/wiki/Extension:TextExtracts); `pagedescription` - Use description provided by [Description2](https://www.mediawiki.org/wiki/Extension:Description2) or any other extension that sets the `description` page property | `textextracts`
`$wgCitizenMaxSearchResults` | Max number of search suggestions | Integer > 0 | `6`

### Security-related
#### Content Security Policy (CSP)
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenEnableCSP` | Enable or disable [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy), as an alternative to [`$wgCSPHeader`](https://www.mediawiki.org/wiki/Manual:$wgCSPHeader) in Mediawiki 1.32+ | `true` - enable; `false` - disable | `false`
`$wgCitizenEnableCSPReportMode` | Enable or disable [CSP report only mode](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only), overrides `$wgCitizenEnableCSP` | `true` - enable; `false` - disable | `false`
`$wgCitizenCSPDirective` | The string of yourr CSP directive | See the [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) page | ``

#### HTTP Strict Transport Security (HSTS)
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenEnableHSTS` | Enable or disable [HTTP Strict Transport Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) | `true` - enable; `false` - disable | `false`
`$wgCitizenHSTSMaxAge` | Time in second that the browser should remember that a site is only to be accessed using HTTPS | Integer > 0 | `300`
`$wgCitizenHSTSIncludeSubdomains` | Apply HSTS to all of the site's subdomains | `true` - enable; `false` - disable | `false`
`$wgCitizenHSTSPreload` | Enable or disable [HSTS preload](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security#Preloading_Strict_Transport_Security) | `true` - enable; `false` - disable | `false`

### Webapp manifest
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenEnableManifest` | Enable or disable [web app manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) | `true` - enable; `false` - disable | `true`
`$wgCitizenManifestThemeColor` | [Theme color](https://developer.mozilla.org/en-US/docs/Web/Manifest/theme_color) of the web app manifest | Hex color code | `#11151d`
`$wgCitizenManifestBackgroundColor` | [Background color](https://developer.mozilla.org/en-US/docs/Web/Manifest/background_color) of the web app manifest | Hex color code | `#fff`

### Miscellaneous
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgCitizenThemeColor` | The color defined in the `theme-color` meta tag | Hex color code | `#11151d`
    
## Requirements
* [MediaWiki](https://www.mediawiki.org) 1.31 or later
