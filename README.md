# Citizen
![](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/workflows/Composer/badge.svg) ![](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/workflows/Grunt/badge.svg)

Citizen is a responsive skin for [MediaWiki](https://www.mediawiki.org) built by the [Star Citizen Wiki](https://starcitizen.tools) team. Although it is specifically built for the Star Citizen Wiki, the skin should be able to run on any Mediawiki installation that is 1.31 or higher. Due to resource constraints, we might not be able to provide full support for setups that are vastly different than us, but feel free to submit a pull request or bug report if you find a bug!

## Notable features
* **Fully responsive skin**: Responsive and able to adapt to different screen sizes. 📱💻🖥️
* **Rich search suggestions**: More helpful search suggestions with images and descriptions. 🔍👀
* **Lazyload images**: Improve load time of your wiki and avoid unnessecary image downloads. 🚀
* **Native light/dark mode support**: Respect OS and app configuration for light and dark mode. ☀️🌙
* **Webapp manifest**: Give a more app-like experience when user add your wiki to their home screen. 📱
* **HTTP security response headers**: Enhance the security of your wiki from HTTP response headers. 🔒🔑

## Configurations
WIP section, refer to below:

		"ThemeColor": {
			"value": "#11151d",
			"description": "The theme color defined in the meta tag",
			"descriptionmsg": "citizen-config-themecolor",
			"public": true
		},
		"EnablePreconnect": {
			"value": false,
			"description": "Enable or disable preconnect to required origin",
			"descriptionmsg": "citizen-config-enablepreconnect",
			"public": true
		},
		"PreconnectURL": {
			"value": "",
			"description": "The URL for preconnect to required origin",
			"descriptionmsg": "citizen-config-preconnectorigin",
			"public": true
		},
		"EnableCSP": {
			"value": false,
			"description": "Enable or disable Content Security Policy",
			"descriptionmsg": "citizen-config-enablecsp",
			"public": true
		},
		"EnableCSPReportMode": {
			"value": false,
			"description": "Enable or disable Content Security Policy report only mode, it will override the CSP when enabled",
			"descriptionmsg": "citizen-config-enablecspreportmode",
			"public": true
		},
		"CSPDirective": {
			"value": "",
			"description": "The string of your CSP directive",
			"descriptionmsg": "citizen-config-cspdirective",
			"public": true
		},
		"EnableHSTS": {
			"value": false,
			"description": "Enable or disable HTTP Strict Transport Security",
			"descriptionmsg": "citizen-config-enablehsts",
			"public": true
		},
		"HSTSMaxAge": {
			"value": 300,
			"description": "Time in second that the browser should remember that a site is only to be accessed using HTTPS",
			"descriptionmsg": "citizen-config-hstsmaxage",
			"public": true
		},
		"HSTSIncludeSubdomains": {
			"value": false,
			"description": "Apply HSTS to all of the site's subdomains",
			"descriptionmsg": "citizen-config-hstsincludesubdomains",
			"public": true
		},
		"HSTSPreload": {
			"value": false,
			"description": "Enable or disable HSTS preload",
			"descriptionmsg": "citizen-config-hstspreload",
			"public": true
		},
		"EnableDenyXFrameOptions": {
			"value": false,
			"description": "Enable or disable the deny X-Frame-Options header",
			"descriptionmsg": "citizen-config-enabledenyxframeoptions",
			"public": true
		},
		"EnableXXSSProtection": {
			"value": false,
			"description": "Enable or disable the X-XSS-Protection header",
			"descriptionmsg": "citizen-config-enablexxssprotection",
			"public": true
		},
		"EnableFeaturePolicy": {
			"value": false,
			"description": "Enable or disable Feature Policy",
			"descriptionmsg": "citizen-config-enablefeaturepolicy",
			"public": true
		},
		"FeaturePolicyDirective": {
			"value": "",
			"description": "The string of your Feature Policy directive",
			"descriptionmsg": "citizen-config-featurepolicydirective",
			"public": true
		},
		"EnableManifest": {
			"value": true,
			"description": "Enable or disable web app manifest",
			"descriptionmsg": "citizen-config-enablemanifest",
			"public": true
		},
		"ManifestThemeColor": {
			"value": "#11151d",
			"description": "The theme color defined in the web app manifest",
			"descriptionmsg": "citizen-config-manfiestthemecolor",
			"public": true
		},
		"ManifestBackgroundColor": {
			"value": "#fff",
			"description": "The background color defined in the web app manifest",
			"descriptionmsg": "citizen-config-manifestbackgroundcolor",
			"public": true
		},
		"MaxSearchResults": {
			"value": 6,
			"description": "The max number of suggestions in search result",
			"descriptionmsg": "citizen-config-maxsearchresults",
			"public": true
		},
		"SearchExchars": {
			"value": 60,
			"description": "The character limit for the description in search suggestion",
			"descriptionmsg": "citizen-config-searchexchars",
			"public": true
		},
		"EnableButton": {
			"value": false,
			"description": "Enable or disable the floating action button on the bottom left",
			"descriptionmsg": "citizen-config-enablebutton",
			"public": true
		},
		"ButtonLink": {
			"value": "",
			"description": "The URL of the FAB button",
			"descriptionmsg": "citizen-config-buttonlink",
			"public": true
		},
		"ButtonTitle": {
			"value": "",
			"description": "The title of the link element on the FAB",
			"descriptionmsg": "citizen-config-buttontitle",
			"public": true
		},
		"ButtonText": {
			"value": "",
			"description": "The text of the FAB",
			"descriptionmsg": "citizen-config-buttontext",
			"public": true
		},
		"ShowPageTools": {
			"value": true,
			"description": "Page tools visibility condition",
			"descriptionmsg": "citizen-config-showpagetools",
			"public": true
		}
    
## Requirements
* [MediaWiki](https://www.mediawiki.org) 1.31 or later
