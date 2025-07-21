# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.5.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v3.4.0...v3.5.0) (2025-07-21)


### Features

* **CommandPalette:** ✨ use `<a>` or `<button>` respectively ([7e6bfe4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7e6bfe454712b3044bf23a7a40269b777f8c44be)), closes [#1089](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1089)
* **core:** ✨ add disabled styles for default HTML elements ([6445ecd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6445ecdd1d53bf7f19df4c3d5e139570cd11f2b1)), closes [#885](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/885)
* **core:** ✨ tweak box shadow styles ([0847197](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0847197c340443097973aef38928e9abc95204c6))
* **Search:** ✨ enhance citizen-search-trigger to support pre-filling input ([5dce5a2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5dce5a289c34ad8691ce23a9a8728432d7384a25))
* **tokens:** ✨ deprecate box-shadow-drop variables ([6c1c60f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6c1c60f062fac9994de41c492f7cd825da7f4126))


### Bug Fixes

* [#885](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/885) ([6445ecd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6445ecdd1d53bf7f19df4c3d5e139570cd11f2b1))

## [3.4.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v3.3.2...v3.4.0) (2025-07-03)


### Features

* **catlinks:** ✨ update category pill styles ([eaa043e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/eaa043ec748348e7b4e3af5ba9e7f8efe15e8f43))
* **commandPalette:** ✨ add transition to list actions ([3eb5275](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3eb5275af0cd4ebe3e4098dac613b21c79aa9b3a))
* **commandPalette:** ✨ use frosted glass effect as background ([dfdcc2a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dfdcc2a0bf28621d9d4a8aac2a40a5948fb03f15))
* **ManageWiki:** ✨ drop unused ManageWiki styles ([e498e9a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e498e9ac5de153e4cfcb976505afef068d76c1dd))
* **ReplaceText:** ✨ revamp ReplaceText styles ([cf4ff02](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cf4ff025240fe3e912637a4f59cac7cc6396d876))
* **SemanticMediaWiki:** ✨ update styles to 5.0.2 ([5720476](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/57204762bfebd49e4f76bfdd748f15f85ac40617))


### Bug Fixes

* **search:** 🐛 fix incorrect position for old search card ([10b336f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/10b336fa45c1244d2d599323ae267107d5a7b305))
* **SECURITY:** 🐛 🔒️ sanitize search result descriptions in old search module ([aedbceb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/aedbceb3380bb48db6b59e272fc187529c71c8ca))
* **SECURITY:** 🐛 🔒️ sanitize short description page tagline ([c85a40b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c85a40bddc8651fff66df83a72debddcb34f0521))
* **stickyHeader:** 🐛 fix sticky header title alignment on user pages ([835e02d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/835e02da0b5ba18882bc5b12c83f35cc20f727a7)), closes [#1080](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1080)


### Performance Improvements

* **commandPalette:** ⚡️ use regex exec over string match ([426105c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/426105c4a9609fd5db67c8f2edee81b921202c75))
* **pageHeading:** ⚡️ remove redundant method call ([b554d03](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b554d0369576fbf12743fd27fe9e68aed4659740))
* **prefs:** ⚡️ use regex exec over string match ([0d22c32](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0d22c3206f8373facd9e733fe093a64e775a967a))

## [3.3.2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v3.3.1...v3.3.2) (2025-06-12)


### Bug Fixes

* **CookieWarning:** add missing styles import ([#1078](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1078)) ([ab5efaf](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ab5efafa65df4305c0bdebaa4b79c42a89f5880f))
* **DataMaps:** add missing styles import ([44782c8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/44782c89afdd014310d5bdca0b40ed0ce42e9775))
* **typography:** 🐛 rollback &lt;small&gt; element styles ([37ee040](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/37ee040e88feccc1396fcc08d0da1a4a761e57a4)), closes [#1074](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1074)


### Miscellaneous Chores

* **Math:** 🔧 🗑️ remove Math extension styles and references ([6fba95e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6fba95efeed84a0acbf336678550edd71761a2f5))
* **variables:** 🔧 🗑️ remove unused variables ([d2f7561](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d2f7561d62619ca70dedffc33cce71921a51b4a1))
* **WikiHiero:** 🔧 🗑️ remove WikiHiero extension and associated styles ([cea735a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cea735a160232a79483cc462632b610b3c22069f))

## [3.3.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v3.3.0...v3.3.1) (2025-06-11)


### Bug Fixes

* **layout:** 🐛 fix incorrect --width-page for extended pages ([ac273af](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ac273af04fa1eac805d12a2367ed935280fbc9eb))
* **security:** 🐛 🔒️ fix various stored XSS system message vulnerabilities ([93c36ac](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/93c36ac778397e0e7c46cf7adb1e5d848265f1bd)) (CVE-2025-49575, CVE-2025-49576, CVE-2025-49577, CVE-2025-49578, CVE-2025-49579)
* **styles:** 🐛 correct font-family variable for overline text ([407052e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/407052e7069bdeae927d6f1a2a1c9a45b473bf9a))


### Miscellaneous Chores

* 🔧 add stylelint Baseline config ([4b44f69](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4b44f69d7f5c8f630cfc9ae226729c6d2866ab47))

## [3.3.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v3.2.0...v3.3.0) (2025-06-07)


### Features

* **contentEnhancements:** ✨ add user anniversary feature and improve registration date display ([64cb5d7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/64cb5d7ab3a6dc0381fae54b31e8fc4afadc8beb))
* **core:** ✨ add --transform-image-hover variable that controls image hover zoom ([d84e4c5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d84e4c557e913389780f07749161b4c7a1a01bd6))
* **preferences:** ✨ add extra large font size option ([dc7d3bd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dc7d3bd8cb412344527e1bc0ff99471d0e0a0155))
* **preferences:** ✨ restrict font size to body content ([2d89125](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2d891252ccca26ae14284312fb104f69abe09e76))
* **stickyHeader:** ✨ add 'Add Section' button to sticky header ([0bc62b6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0bc62b643c212aeb1addf8bc9b694bfaec91bed8))
* **stickyHeader:** ✨ add language dropdown to sticky header ([3260022](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/32600222feefef31d33b13242c2b2c47f041f0a3))
* **stickyHeader:** ✨ re-implement sticky header ([#1073](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1073)) ([fbb1d4f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fbb1d4fe9627281567706f3f6fc99a42ce16fdc4)), closes [#906](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/906)
* **typography:** ✨ add utility classes for typography styles ([4251f3c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4251f3c31740397cd45012f36b831fd89d6a41f6))
* **typography:** ✨ backport and use Codex 2.0 font tokens ([0e13c8e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0e13c8e7ee13f93768fee5e0e5b488dd3dc08969))
* **typography:** ✨ implement Codex 2.0 font styles across components ([bfd7e63](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bfd7e6394cbbbef94c253eea69693f765b752f66))
* **typography:** ✨ move CJK line-height adjustment to citizen-body styles ([111fb03](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/111fb03f38899c4ceaa3766e165423d4e9a9296a))
* **userMenu:** ✨ improve user stats layout and add registration date ([87eb6c7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/87eb6c746bf65a5d417a62f40f6ba594b4238a56))


### Bug Fixes

* **commandPalette:** 🐛 fix incorrect msg call for tips ([fdee8f4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fdee8f486ae6b12622b09f14fb29d83801604244))
* **commandPalette:** 🐛 use matched title for URL when available ([e538bb8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e538bb81b1f0e97a41a89028d6a68055ba77c6b8)), closes [#1065](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1065)
* **core:** 🐛 correct import path for mixins in edit styles ([8b25299](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8b252998d91d310c163c81531c682587266b702c))
* **core:** 🐛 default link to be not underlined ([8e7e57b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8e7e57b5c182afb1ad72341f1855445ab01ca5e9))
* **links:** 🐛 fix various broken link styles in diff and log pages ([066191d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/066191d062fd5aada5f4581cd96052514c842c6b))
* **toc:** 🐛 prevent applying Codex link styles to toc links ([15adb98](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/15adb98a51b858e50303d97738a76bc54392946a))
* **typography:** 🐛 citizen-body should use unitless line height ([783eb6e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/783eb6e61f5c2db6186a7be829457b4aad99be68))
* **VisualEditor:** 🐛 allow categories to be clicked ([4135a49](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4135a493dfe039cf531d3324fd56ec0b3f51208e))

## [3.2.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v3.1.0...v3.2.0) (2025-05-19)


### Features

* **commandPalette:** ✨ add media search action if supported ([04157d8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/04157d84217c4bc65df46df28a63529402f49c9c))
* **commandPalette:** ✨ add page edit action ([55addaf](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/55addaf9004144f3c7753abad032d95ac14de979))
* **commandPalette:** ✨ add tips for command palette usage ([4fa69e1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4fa69e1d062dca7e407cc0530cf1da3e2baaf0b5))
* **commandPalette:** ✨ add user command ([#1061](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1061)) ([104adbd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/104adbdb07fdbc527c06c382c89200daa4cdc963))
* **commandPalette:** ✨ enable command palette by default ([a00ebba](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a00ebba3c7936dc26a76b23cdb73e1c5ed508b5f))
* **commandPalette:** ✨ improve result action handling ([#1064](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1064)) ([5b90efa](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5b90efae451ac6bcd58d16d915a9149ae79c4035))
* **commandPalette:** ✨ improve results transition logic ([8ff903d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8ff903d92293bd30b8500d1083f33773dbc29967))
* **footer:** ✨ add wiki icon to footer if avaliable ([e431222](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e43122291c5d25e14811a18e713f6377535adefe))
* **footer:** ✨ update footer styles ([6ab4db4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6ab4db4d385babafc100ab02c786816575f6e7e3))
* **search:** ✨ add the citizen-search-trigger class to trigger search UI ([577788e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/577788eda7fb6975270c0350b058d396c693a6ec))
* **sectionLinks:** ✨ reimplement edit section and use Codex button ([2152ac5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2152ac52228f66af70fc1711ad33795e52cca296))


### Bug Fixes

* **commandPalette:** 🐛 always clear the results on new query ([1392ae0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1392ae00a978de5313d83de37db938737dd5e6a9))
* **commandPalette:** 🐛 fix incorrect URL generation for RelatedArticles ([21bf5f1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/21bf5f11ceae89341defc7fe4a35982159ec45a0))
* **commandPalette:** 🐛 fix incorrect URL generation for REST search ([d062fd5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d062fd563b5665347a345322bfd791c116186d0a))
* **commandPalette:** 🐛 fulltext search should be updated instantly ([814f306](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/814f3068c780a46a2320f58803f391e73f8d6327))
* **CommandPalette:** 🐛 ignore trailing space in search query highlight ([eca18e3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/eca18e3a7739406298c3109ec10b02016772f6fb))
* **commandPalette:** 🐛 prevent duplicate dismiss action in recent items ([901935b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/901935baa534d620af5fb98d141c0ce8774fdf20))
* **commandPalette:** 🐛 update URL generation for media search to include type parameter ([460803b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/460803b2de77c75ea3f4e5bc99fb82bc32986fc7))
* **footer:** 🐛 fix incorrect footer icon wrapping ([73e38ed](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/73e38ededa03f4f8efc48fe26d36fbdbb4316173))
* **footer:** 🐛 fix incorrect footer styles ([66c7253](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/66c7253851eedf4e5c9b2fabf7f59f1965a6cae8))
* **header:** 🐛 fix missing home icon in header ([9ba86b9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9ba86b9194532be32c80b90565c5ea2d06f0ef0b))
* **SyntaxHighlight:** 🐛 add background for line numbers ([#1059](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1059)) ([2aabdab](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2aabdab560fddc8a851e70e5f364fd0a17de12aa))
* **toc:** 🐛 fix scrolling when sticky header is disabled ([#1058](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1058)) ([6ea7a57](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6ea7a57202fe727e29f952d79fb457fa1a5a74d7))
* **typography:** 🐛 do not use negative top margin for nested elements after paragraphs ([bd38820](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bd388201030e33d157da09f930bec5855ce1885b))


### Miscellaneous Chores

* **Babel:** 🔧 remove unnessecary extension styles ([ceacb7a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ceacb7a60fc0ff6db7d3a0b6f8ef87dbc1493947))

## [3.1.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v3.0.0...v3.1.0) (2025-04-27)


### Features

* **commandPalette:** ✨ add action command ([#1049](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1049)) ([a5360c3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a5360c3a9a38cdb0c49d9b799271e77b10dd619b))
* **commandPalette:** ✨ add ctrl/cmd+k binding ([49961f5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/49961f5dfca9fd06bbcd8e074809afab2a671e0f))
* **commandPalette:** ✨ add edit action to page results ([85a48c1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/85a48c1ad3a9fe9b6f8a0a2a71fc01f5bb47787e))
* **commandPalette:** ✨ add fulltext search as a result  ([86375c0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/86375c07eae1e334436a3c89580be19c2949e60d))
* **commandPalette:** ✨ add keyboard hints ([b482d27](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b482d277e2b8af44e547a065a73e46ebb973a1d8))
* **commandPalette:** ✨ add loading state to command palette search results ([#1033](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1033)) ([2389466](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2389466c93dd75b43b98d98d802d15874babb1cb))
* **commandPalette:** ✨ add namespace command and various refactor ([#1043](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1043)) ([4de089d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4de089d99b4541b435791dcefc253a9c47b2c72c))
* **commandPalette:** ✨ add recent search ([19ea550](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/19ea550158c200e23bfdddcb2904753c0d674df0))
* **commandPalette:** ✨ add redirect title to search results ([#1032](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1032)) ([4b29b4c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4b29b4c9b4451df52a79666d5ba96042f24d9eaa))
* **commandPalette:** ✨ add RelatedArticles to presults if supported ([#1048](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1048)) ([cbfb03f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cbfb03f485c966f0322c4ebdf31d1b09a60f34aa))
* **commandPalette:** ✨ add tab key functionality to close input ([8eccfeb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8eccfeb0098047748d1610039a343278d16ef839))
* **commandPalette:** ✨ allow `:` the namespace command ([0e6fe57](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0e6fe574eefdc1864fa9c6cf7c511da0e4ed5f11))
* **CommandPalette:** ✨ allow command to be extensible through mw.hook ([#1050](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1050)) ([8b2ef4c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8b2ef4c8af9c675df9efba92a100198af461bd6c))
* **commandPalette:** ✨ allow recent items to be removed ([08425a6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/08425a6707f5f2a02593de053b4bd67c64a22714))
* **commandPalette:** ✨ handle wikilink and template syntax in query ([a1a38af](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a1a38afd4ed7958108aad172b26cd4f979f986a2))
* **commandPalette:** ✨ improve enter key logic ([4adb6c6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4adb6c6f217a075ea3b5a83d4b76ebe60cd18976))
* **commandPalette:** ✨ improve no results empty state ([19f7d86](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/19f7d86193c0bc60486d481908ee217a4bd96256))
* **commandPalette:** ✨ increase max-height for results container ([b49c5ba](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b49c5baebbc219874e33eeb633e7d20fe0a068f2))
* **commandPalette:** ✨ initial implementation of Command Palette ([55cb33b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/55cb33b2dd1339bc7ba41d8b50ead69db45a7f56))
* **commandPalette:** ✨ make command search case-insensitive ([34d9483](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/34d9483c4c01f24a6d22b54bfa1c8998bc9541a3))
* **commandPalette:** ✨ set up foundation for result type ([b1cc5d7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b1cc5d77f7a88f2f524848bd6055e571e8d893dc))
* **commandPalette:** ✨ show command as metadata in result ([4c1063d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4c1063d6d4da692d2771dee60875d027efe10799))
* **commandPalette:** ✨ show keyhints conditionally ([32b46a0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/32b46a02f7afcce80019b3b9e775a17f1069df45))
* **commandPalette:** ✨ tweak various styles ([79c4ee7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/79c4ee7f21096a2982d053fcf36471f05f2a2fb9))
* **commandPalette:** ✨ use Pinia for state management ([56a9e91](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/56a9e912f738a255386cb5e8bff10d8450f988ef))
* **commandPalette:** ✨ use prefix search for command list ([10d3dfb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/10d3dfb22c95d4201f8de3d428149333844b3e4e))
* **composer:** 🐛 allow Composer v2 for installation ([2960a7d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2960a7d4807b3fba0fcf10c97597b00a735bb4ea))
* **core:** ✨ add padding for device safe area ([9db68fb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9db68fbaeece7009512a5d4fc5e733c5ff080e5d))
* **core:** ✨ apply font grade to light mode instead of dark mode ([ab3853a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ab3853aa6fd304a1f5addb1543f5ec299c3e9673))
* **core:** ✨ drop view transitions ([17e76eb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/17e76eb42fbec0de742e8dd1de5d56e0d5ddc3d1))
* **core:** ✨ reduce spacing between paragraph element and other elements that have top margin ([6339841](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6339841b5fb5a3e869f00eb25f203c11d64cdea1))
* **core:** ✨ reduce subtle background color brightness ([12ce5e4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/12ce5e4c344d2060d672d91279b9efbfe41a4280))
* **core:** ✨ use darker surface colors ([c6ec6d8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c6ec6d804d976dbb4984c5faa48fbe67b2b2fc75))
* **dropdown:** ✨ use &lt;kbd&gt; tag for keyboard hint ([4128bd4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4128bd4b67116688d27333e835dd16bc42b836da))
* **Echo:** ✨ use red dot for alert badge ([216bdff](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/216bdffab4e56bd55f28d229e4a628a26b6f0ff7)), closes [#1027](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1027)
* **typography:** ✨ tweak label text font styles ([d753c03](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d753c038d88671e49b12c6729016931a6364e4e0))
* **wikitable:** ✨ add wikitable--fluid utitlity class for full width tables ([ff64f43](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ff64f439c81c0beea0e80e4b5e686d531029a662))


### Bug Fixes

* **commandPalatte:** 🐛 fix incorrect list item header color ([53e0c55](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/53e0c55c7ec241f316e54784ca24c571afb6c8bc))
* **commandPalette:** 🐛 add missing components ([892ca23](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/892ca23f735e2e62a19f0b92e84054a3b4b03c70))
* **commandPalette:** 🐛 allow icon prop to accept both String and Object types ([5e18f04](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5e18f043eac9e20a77711acce49dee152aa6ad1b))
* **commandPalette:** 🐛 fix conflict with OOUI overlay ([be51f79](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/be51f79b70d47530b6b97e85ecaf94b1762412d0))
* **CommandPalette:** 🐛 fix incorrect URL for related articles ([cf8fe3c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cf8fe3c382751fcb85416f4c54093292d46e485d))
* **commandPalette:** 🐛 fix misaligned progress bar ([d474817](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d474817e571f38c99d9534101f2605c39e5881a0))
* **commandPalette:** 🐛 fix missing aria-label for edit action ([5711804](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/57118043317dd6662fe09c5f785a98eaa581bc7d))
* **commandPalette:** 🐛 fix missing message for namespace command ([a09470e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a09470e6bbbc0bd00cbe4fea4776dd55445fa307))
* **CommandPalette:** 🐛 make selectResult function asynchronous for improved handling ([b3d9d78](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b3d9d7853f6f5c0bd28cb7065fecd45918add7cd))
* **commandPalette:** 🐛 persist results before fetching new results ([957d042](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/957d0424c07e6bd24382d4bdf68879e6abc01d28))
* **commandPalette:** 🐛 prevent saving empty search queries to history ([51371a3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/51371a362515dc927d8d8c5a5eb053aa92364ea7))
* **commandPalette:** 🐛 remove reference to non-existing file ([b1b854d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b1b854d950eeba1e9d5c19e515e5501d5ae8393c))
* **commandPalette:** 🐛 save the entire result item in recent items ([cede0bb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cede0bb2dd9bad86bbebbf030a91e3dfed196020))
* **CommandPalette:** 🐛 use page.description if available for RelatedArticle ([afef5ce](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/afef5cefbf8ea3fb87e7484464cec2be80f53914))
* **CommandPaletteListItem:** 🐛 add aria-selected to selected result ([21bf426](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/21bf426a6119be20c3cd6a768984a9937ea32d4d))
* **CommentStreams:** 🐛 fix broken `font-weight` ([8ebbf53](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8ebbf5302835f3fdaa9d829407c994a6351170fd))
* **core:** 🐛 fix padding for device safe area ([c52085d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c52085de5c576217755a71c128e98416ab6db8cf))
* **core:** 🐛 use a more sane viewport meta tag ([db64579](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/db64579926fd470740759cf3f146dd61e1bcaa06))
* **DiscussionTools:** 🐛 remove additional space in title ([19a1f71](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/19a1f716f7fe05a7a6beca6c315c3ea34faed364))
* **FloatingUI:** 🐛 update box-shadow variable ([fab3d98](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fab3d984fd5fd9d84bfbcd8ac20134ae6116859a))
* **header:** 🐛 prevent header wrapping ([af49110](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/af49110e6659a3832202c9dd504adb4afb115572))
* **Popups:** 🐛 fix broken `background-image` for references ([75f2618](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/75f2618083daf62efa85fc232540fa342e8b1568))
* **README:** 🐛 fix incorrect command palette configuration name ([0247962](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/024796251614ece23cb8b0ed86c5e427f886ae86))
* **VisualEditor:** 🐛 fix toolbar `z-index` ([5bbf2d8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5bbf2d846e9831262474c8732122053cba83cc46))


### Performance Improvements

* **CommandPalette:** cache special page API request ([9337142](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/93371428f9ccf16c86ad7a19b0c72cd9d1e62eab))


### Miscellaneous Chores

* **commandPalette:** 🔧 add dummy ResourceLoader and Codex icon configurations for development ([7de5671](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7de5671938e45b2b81ef9f4676ea3114d8daebb8))
* **package:** 🔧 sync Vue and Pinia version with MW 1.43 ([394c9e1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/394c9e186c03d00cd168c399adc424642dd4b3da))

## [3.0.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.40.2...v3.0.0) (2025-03-28)


### ⚠ BREAKING CHANGES

* **tokens:** All primary colors tokens are renamed. Please refer to tokens-theme-base.less for the new names
* **tokens:** CSS variables that are previously deprecated are now hard-deprecated.
* Citizen is targeting MW 1.43 now and start development on the v3 version

### Features

* **CodeMirror:** ✨ add initial styles for CodeMirror v6 ([87fc5ca](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/87fc5ca2e02fe6051e8cc7492437689726bd72ce))
* **CodeMirror:** ✨ add WikiEditor and VE styles for CodeMirror v6 ([b8fa2c7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b8fa2c7ad7b2159ac28050ee3f28490f4236e877))
* **CommentStreams:** ✨ update styles for 1.43 ([dbb1da0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dbb1da0794d86a500180dfd739e9588115d0b371))
* **core:** ✨ add frosted glass effect to menu cards ([c20082c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c20082ce5f8e20c048a5a389d9fd974e2439c694))
* **core:** ✨ add top margin to mw-content-text ([7c6237e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7c6237ef9b885ec477f22c1454ca9b5e6fc4dea7))
* **core:** ✨ adding vertical padding to text editor ([1ec112d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1ec112d727244fd1f7492a1c9f97a36cec675ea6))
* **core:** ✨ bump dark border color contrast ([f94d0a4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f94d0a45607c5060d4b05a0ebabd10d4b4d94be9))
* **core:** ✨ drop letter-spacing from legend ([85588ff](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/85588ffb569a7b626e40d4109db60601ef9436f9))
* **core:** ✨ improve site notice handling ([7dac6d2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7dac6d2fbf8bf7adc6ea5e7b64ec86ee0d2c8401))
* **core:** ✨ only apply main page-specific styles on read view ([fb8be79](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fb8be792c9bd1672272b9cb17691e19959a9e1a0))
* **core:** ✨ set mwRestApi as the default search gateway ([ed5f11a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ed5f11a08d5855fc7b36b17ca2b7869090f1a91b))
* **core:** ✨ update mw-indicators spacing ([cc1843e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cc1843e387bd65faebd22e0741104507bcbdad94))
* **core:** ✨ use mask-image instead of background-image for Citizen UI icons ([bc828b3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bc828b3e1e5b49d80a7b24a33caf2313b0d4ed7c))
* **DiscussionTools:** ✨ update DiscussionTools styles to 1.43 ([9f750be](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9f750be8429228103b284f52bf982a9732102ce0))
* **Echo:** ✨ add backdrop when modal is opened ([6b9fc0a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6b9fc0a4ebcf00b5ab8a80f4bc0153de5fbca6ab))
* **Echo:** ✨ improve Echo badge icon replacement logic ([86ba574](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/86ba57453bd1c0492fdbb23fce3acaa4298e8e20))
* **Echo:** ✨ update Echo for 1.43 ([6740eac](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6740eace8ba1310f6bba7c9574dee35b67a3eee3))
* **header:** ✨ simplify header icon color logic ([57711a9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/57711a9db6ad0ded31d449af9978cb5bfd0daaa1))
* **mediawiki:** ✨ add border to mw-tag-marker ([3c626d9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3c626d9fdff3fc9da7ed5ffdbbcef4b40f9d52c0))
* **mediawiki:** ✨ adjust installed software cell width ([42321c0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/42321c07025252022c480f68a0383ce1fd61c4ef))
* **mediawiki:** ✨ allow Special:SpecialPages legends to float ([0a4d42e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0a4d42ec64d7a34fda6114dc99f9e9c58bd058c8))
* **mediawiki:** ✨ increase input field height in signup and login pages ([898580a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/898580ae6fc534980993fbb7b9237f1fa1ba29e3))
* **mediawiki:** ✨ rework login and signup page styles ([c10ca94](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c10ca94dd3d699ba6a2e15190bb45a7b2ccf9502))
* **mediawiki:** ✨ start-align installed software in Special:Version ([f152da9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f152da9719ec94b7eca527b1bfa6e5a0fe42f024))
* **mediawiki:** ✨ update styles for Special:Preferences ([597abc1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/597abc160155dff7133719fb1362932000cd1449))
* **MultimediaViewer:** ✨ add hover state to description button ([ebe1979](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ebe19790fcd22c9f78b2abb64d65ac1337ef694a))
* **MultimediaViewer:** ✨ add styles for error box ([6ea13ff](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6ea13ffd8a2a31edd665a380b91dc0db29b89756))
* **MultimediaViewer:** ✨ scale down the description button ([99d926f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/99d926f8e1a41d8c7d8f18387964b948e46c9040))
* **MultimediaViewer:** ✨ simplify title max-height calculation ([9fb16c6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9fb16c69d148a41f8825093f278e94da063a50d9))
* **MultimediaViewer:** ✨ update styles to 1.43 ([4497ac1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4497ac1ee4a19f18213be72069789044b6b748c9))
* **OOUI:** ✨ drop unnessecary OOUI styles for 1.43 ([7be2ec1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7be2ec19117fea7fd1003764d3418b684e9ec6be))
* **OOUI:** ✨ standardize border-radius ([6f6d96c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6f6d96c6b963a830defdf477e9be097f03eeb2f9))
* **Popups:** ✨ update Popups to 1.43 ([e21d75b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e21d75bfffe6f53e6914d94ff2665bf0262848e2))
* **RelatedArticles:** ✨ update RelatedArticles styles ([bd340e7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bd340e7420191de8f1439c2a07bdca61a87e6892))
* **share:** ✨ do not show share button if page is not a content page ([8c29416](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8c2941673800513ad7136bd164b49729094c1c21))
* **stickyHeader:** ✨ make sticky header more compact ([8e62594](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8e6259463c02fe6f6193b0b23760ce8258016932))
* **stickyHeader:** ✨ use fancy frosted glass for page header ([ad50e8d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ad50e8d2d539dab26735b20463f8376440aa1f3b))
* **TemplateData:** ✨ update styles for 1.43 ([6110a5d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6110a5dddf762d7421334ce2253a36cc61c5a1ff))
* **toc:** ✨ match ToC link color with color-base ([67852e7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/67852e73ddea9c559f856ae34133e63f3958cadd))
* **tokens:** ✨ add backdrop-opacity CSS variable ([76727b1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/76727b16cfdaad4609cfd38712a74a592a7183ad))
* **tokens:** ✨ add more saturation to frosted glass ([cb14c43](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cb14c4398bf6cb44f2b10912716136f7e16cf3eb))
* **tokens:** ✨ backport Codex tokens from latest master ([6252e24](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6252e24a5cbb2b2b3dbed3d62cb0701342d3344d))
* **tokens:** ✨ revamp colors that are related to progressive/primary colors ([a5f5a3c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a5f5a3cd621eec4fcbb140849b9197519c8be07c))
* **tokens:** ✨ update Codex tokens to v1.14.0 ([7ef2375](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7ef23758754f84b0c89f0ec66bc9c3ff95afa63c))
* **tokens:** 💥 ✨ drop deprecated tokens ([b82923a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b82923a9f49eef79d6f4ce72a70d6f7776f093ab))
* **UploadWizard:** ✨ clean up spacing ([1a062a8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1a062a8f4ec235e8236ce91062562aaaa4d516b9))
* **UploadWizard:** ✨ update UploadWizard to 1.43 ([f241493](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f241493a6d02923c5aeaf8593e40d6ddc45a9b69))
* **VisualEditor:** ✨ update styles to 1.43 ([c91135d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c91135dcb2faa6b2c6f3ca6189969022c2a217fd))
* **WikiEditor:** ✨ add responsive handling for advanced toolbar ([1f4045a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1f4045a0bb355bdeed4564a5c54c0c8ab7ab5092))
* **WikiEditor:** ✨ update styles to 1.43 ([808f7b1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/808f7b1cb07e7281cabcc04a074b22b922ff1c64))


### Bug Fixes

* **CodeMirror:** 🐛 fix text selection background color for links ([#1007](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1007)) ([e66605f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e66605fb6955536300e6a625f1bf5ac88e390369))
* **CodeMirror:** 🐛 override default dark mode color ([32e78ff](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/32e78ff279156ea8dfdeb615430211354922954e)), closes [#1001](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1001)
* **core:** 🐛 do not invert mw-indicator ([6f33824](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6f3382486f850670eb9d0d7fd48dd72ddaeef595))
* **core:** 🐛 drop the use of SkinModule class in font modules ([367dbde](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/367dbdeaf0f7545e9ef2d351a8b94032caf4e6ec))
* **core:** 🐛 drop unused Codex skinStyles ([ddbe205](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ddbe20500e33ef02bde5c874a03611b3efb95fa0)), closes [#1004](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1004)
* **core:** 🐛 fix incorrect dark border interactive color ([0019b6c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0019b6c37f8ec28e53e64764e8e1ad1717006aef))
* **core:** 🐛 fix incorrect type declaration ([33d577f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/33d577ff395eb7717b6f103a8a2cf91faa73ec37))
* **core:** 🐛 fix incorrect type declaration again ([37b36e8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/37b36e8ce9da1da6929dedd241e1dce2d44ea490))
* **core:** 🐛 fix typo in sr-only class ([4d6eed9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4d6eed9ff44a2ac17fa630db1e1ff99c5795ad88))
* **core:** 🐛 override Codex tokens even when they are same as default ([ff6f75b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ff6f75b8c194c061e1af98f562d0920a64f28748))
* **core:** 🐛 remove bottom margin from contentSub ([633578d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/633578d9bab272f6dd340d6a751925862dd80a2a))
* **dropdown:** 🐛 remove unnecessary content-visibility on icons ([b1f7529](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b1f75296e62760e8b899bfce3f9c599f89edc345))
* **footer:** 🐛 force footer icon to have light background color ([e7b3550](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e7b3550ef2109dc0824b56d9fb756f67bffc3744))
* **header:** 🐛 fix invisible home button in header ([e5f0fb2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e5f0fb2aee1f9da1da35f560ba8ff9817d9bc54d))
* **icons:** 🐛 add fallback for browser that does not support CSS mask ([4279397](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/427939756cfd77f1b1b0472528fca039dc0e0913))
* **icons:** 🐛 load unBlock icon ([e2fe673](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e2fe673255fbbd2bfa93f0537602a6fc547d72b0)), closes [#1011](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1011)
* **links:** 🐛 ensure self link does not have hover state colors ([229a13c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/229a13c1da920842f1f093ecdf674816eab8025a))
* **mediawiki:** 🐛 fix debug toolbar z-index ([e36fe02](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e36fe026470457e1a905c9a3ed8665a34ccdb72c))
* **mediawiki:** 🐛 fix various layout issues on Special:Version ([75af101](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/75af1019a2cfdc611749338ae4d27705551873d8))
* **menu:** 🐛 fix incorrect width overflow ([880ec7d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/880ec7daafd0bdd2c9fa5bc4919cb108c9cba695))
* **MultimediaViewer:** 🐛 fix incorrect layout in narrow viewport ([00705cc](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/00705ccc89089506c3fad31d06a20092e809adbf))
* **MultimediaViewer:** 🐛 remove unused styles ([da990b4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/da990b4d4bf504d9513a2d3070045fa3d4804c24))
* **OOUI:** 🐛 fix incorrect border-radius for connected elements ([250948f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/250948f535cc68fab1be3dc55fc111635041d86e))
* **OOUI:** 🐛 fix incorrect property for tab styles ([43c5897](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/43c5897e58ac0b1ba64f8e83cdeeffc1b09b576b))
* **OOUI:** 🐛 fix tab option selected border-bottom ([#1008](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1008)) ([b3a9623](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b3a962373546a8d742356630de2c607cb8c0e1cc))
* **overflowElements:** 🐛 fix incorrect z-index for overflow sticky header ([bd05c25](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bd05c252c09310f92dd151de3fdac88546ed2d63))
* **Popups:** 🐛 ensure text fade color get applied across all themes ([2bfdb67](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2bfdb671aa0e6216d210926492df85c69ae4af47))
* **RelatedArticles:** 🐛 hide in VisualEditor ([#1009](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1009)) ([b95cb85](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b95cb8560b6bbdc2999737a9dab2a637f5761bbb))
* **styles:** 🐛 remove unnecessary night theme indicator styles ([402e8d5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/402e8d5e299668fad38b1b4cfc77bd94b9ceb104))
* **SyntaxHighlight:** 🐛 use Citizen colors for dark theme ([cedf9c7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cedf9c7742d38ffec6a4cbf68faca28abed110d8))
* **tokens:** 🐛 enhance pure black mode color variables ([274e7b6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/274e7b6b453e49e14163a407b7c82ddfcbdaf336))
* **tokens:** 🐛 fix incorrect backdrop light color ([017a387](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/017a387a57b0e9167c0bf2f1cf74053f8e0fb364))
* **tokens:** 🐛 fix incorrect colors for pure black mode ([53fab3c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/53fab3c262bcaf99bf33297018d698136fbfcc0a))
* **tokens:** 🐛 fix incorrect fallback color definitions ([f4e9e70](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f4e9e70d591f350d086007ffac7df1bff5b54f5a))
* **tokens:** 🐛 fix incorrect supports tag and add color-base--hover ([2430932](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2430932432fc6515c5448d735c4d6f455affc30f))
* **UploadWizard:** 🐛 add small fixes to layout ([443278f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/443278f781352449963f3d9aa225eeba243d2654))
* **UploadWizard:** 🐛 fix message box styles ([4261645](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4261645e1d935faef1c4a246a8ab6debb47cb532))
* **UserProfileV2:** 🐛 fix deprecations and add fixes for mobile ([#1023](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/1023)) ([949a733](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/949a7339a1527cce6232c51a68c07e4d9a1b3cb1))


### Miscellaneous Chores

* 💥 🔧 raise minimum MW requirement to 1.43 ([b5080bd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b5080bd2ee5431ba6d930744cc013f25dd46cbb1))
* 🔧 add coverage directory to .gitignore ([d021452](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d021452aa4b34c19c46155c18c6fc8b13ab9f046))
* 🔧 ignore package-lock.json ([b969f10](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b969f10f8c136bbac18c1f83f3449915c2917837))
* 🔧 remove coverage.xml file from the repository ([83edb63](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/83edb636d848ff171cd94bc536558330a0aecd28))
* **eslint:** 🔧 update ESLint configuration to use wikimedia/client preset ([b12cd9f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b12cd9fe6a34e3c7d1cb8a5f41ed7adb89afbed4))
* **release:** 🚀 bump version to 3.0.0-beta ([1f9c58c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1f9c58cc1d9ca67dca8c135bc5dae83555ef5210))

## [2.40.2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.40.1...v2.40.2) (2025-01-01)


### Bug Fixes

* **overflowElements:** 🐛 fix pinned sticky header on the top of the page ([a09193c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a09193c4939097541efe292df11a02d4e0616eb4)), closes [#991](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/991)

## [2.40.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.40.0...v2.40.1) (2024-12-31)


### Bug Fixes

* **CodeMirror:** 🐛 fix incorrect highlight for VE CodeMirror ([8aa185c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8aa185c5addea71bb35c4b1e8db8bb6bc9f4ed88))

## [2.40.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.39.4...v2.40.0) (2024-12-30)


### Features

* **overflowElements:** ✨ add sticky header for overflow elements ([#989](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/989)) ([dfdb2e6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dfdb2e63cdb8d0cec097bb89315cc57df3e69b63))
* **SemanticResultFormats:** ✨ add styles for fixedHeader ([1c00950](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1c009508912a989dc5b4386b5f18ffa707e6966f))
* **SemanticResultFormats:** ✨ update DataTables styles to match with current 5.0-dev version ([dc49c64](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dc49c642dadd8df5a7955964e81652038bb4f53f))


### Bug Fixes

* **core:** 🐛 remove outline styles for focus-visible as it is not working as intended ([f2cc4fd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f2cc4fd8763c71ca3bf5f9c82119b6f9be38ae6c))
* **core:** 🐛 use break-word for word wrap ([e8fc354](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e8fc3545491853142a3f6de51996df9294256ed9))
* **mediawiki:** 🐛 fix hidden MW version in Special:Version ([4fc1847](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4fc184776c0636cc939e420bfca9d2b30958b330))
* **mediawiki:** 🐛 fix incorrect Codex message wrapping in Special:UserLogin ([576bcb6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/576bcb69e239438d072129c3fe3eae3829536e8d))
* **mediawiki:** 🐛 fix incorrect message box wrapping in Special:UserLogin ([380f360](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/380f360871e47fa9b11a57caef89f381ab30f8eb))
* **Popups:** 🐛 fix Popups text gradient color ([985df51](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/985df5199dcfafee1e69eab7f33f29835a5ee1df))
* **TinyMCE:** 🐛 prevent TinyMCE editor from expanding limitlessly ([a01001e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a01001e9bbdb786870403d9ec48cb12b65380990)), closes [#978](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/978)
* **WikiEditor:** 🐛 fix dark on dark link button in MW 1.43 ([781822d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/781822d4e67176dee38c670c87b931fb0f036159))

## [2.39.4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.39.3...v2.39.4) (2024-12-14)


### Bug Fixes

* **pageHeading:** 🐛 fix incorrect indicator placement when displaytitle is used ([504c237](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/504c2373a080a91e1023eb1858fbd63433e07989))
* **pageHeading:** 🐛 fix parenthesis for displaytitle ([1a6e53c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1a6e53c798eb06499b304e7199163276fd7bb001))
* **pageHeading:** 🐛 remove debug logging ([3fe4e3d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3fe4e3ddae8827b931ee4b7abcdee3cd8f35c3c2))

## [2.39.3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.39.2...v2.39.3) (2024-12-03)


### Features

* **dropdown:** ✨ use symbol when possible for keyhint ([0d19f7f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0d19f7f72aa3cae710ff2bc3082ab10d7d432334))


### Bug Fixes

* **DiscussionTools:** 🐛 add wrapping hotfixes for DiscussionTools header for MW 1.42 ([d71f31d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d71f31d9b6cf10eff68b4ec368608c37fc510d44))
* **DiscussionTools:** 🐛 fix incorrect color for timestamp ([c52c1f2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c52c1f23478da3c0b20f559214e71067b658a79c))
* **header:** 🐛 fix misalign home button in Safari ([346b25e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/346b25e6edbe621f6ebe65cdfed5baacf2dd3fd2))
* **mediawiki:** 🐛 do not override link color on Special:Version ([0c7a2d9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0c7a2d97729c5750c8d19836a81443bbe926c971))


### Miscellaneous Chores

* 🔧 release 2.39.3 ([d5e8076](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d5e807696da44402858cb23e11803a3d716e8924))

## [2.39.2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.39.1...v2.39.2) (2024-11-17)


### Bug Fixes

* **core:** 🐛 use mw.requestIdleCallback for polyfill ([daef66f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/daef66f141a1cc8d6c4ba538cd1e26c69defcd30))

## [2.39.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.39.0...v2.39.1) (2024-11-16)


### Features

* **TabberNeue:** ✨ update styles for Extension:TabberNeue ([6a70ae4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6a70ae459c8202912b8372e3826ce5393e42dc0f))


### Bug Fixes

* **speculationRules:** 🐛 stricter selector to pages to prerender ([34c9ae5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/34c9ae5fd4826b7b543cc31edc15e18451b842c6))


### Miscellaneous Chores

* 🔧 release 2.39.1 ([afffbfd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/afffbfd6f549c8705ba9f4147410b989aa347751))

## [2.39.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.38.3...v2.39.0) (2024-11-13)


### Features

* **PWA:** ✨ add support for description field ([3073f52](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3073f52a61b7311a4c3de7bef09cc46be70400d4))
* **PWA:** ✨ add support for short_name field ([79c0e45](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/79c0e453d316cd4ad993b057fc744442a1bbca76))
* **PWA:** ✨ allow custom icons definition with wgCitizenManifestIcons ([5436cc4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5436cc46da14e57bb197139e7c5e49e847b062f0))
* **PWA:** ✨ fallback to clipboard share if Web Share API is not supported ([5794207](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/57942075cce825bf76e7d817e4b075dfae97ffd3))
* **PWA:** ✨ merge all PWA config into wgCitizenManifestOptions ([586cf2c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/586cf2c0027929c4280078e61d41a3ebef606dbd))
* **PWA:** ✨ sync meta and manifest theme colors with skin default ([6690263](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6690263d7e141557605fe36fd7e904cbe1fa3d46))
* **speculationRules:** ✨ add basic implementation of Speculation Rules API ([368ceb6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/368ceb659ac7139701f115d433f1f1046c252e66))


### Bug Fixes

* **mediawiki:** 🐛 fix incorrect gallery layout ([571e9ed](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/571e9edd7abe4abfcc7460ec2d72f7c7daaa6346))
* **preferences:** 🐛 add missing padding to pref card ([937b3c7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/937b3c7f5eb836b2adaa6c7dd4465134ed0e00e9))
* **PWA:** 🐛 add missing use class ([dcce74a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dcce74a583112187b669a8e699ac63df45887079))
* **PWA:** 🐛 don't save icon if no sizes are detected ([71aada9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/71aada9d1271427b4f53aeb6d318903b6b0c41c7))
* **PWA:** 🐛 revert to old behavior to fix missing icons in manifest ([28970f6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/28970f6867ffcea1f2eeb4220843e4f40050a594))
* **stickyHeader:** 🐛 do not reset stickyHeader when page title is visible ([8819757](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/881975791338a4f2e8070ffabb381b79bb2535fd))
* **stickyHeader:** 🐛 VE should use the same methods to handle sticky header state ([98e6c2d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/98e6c2d7f1a3ea3a499907c415e3418bd1c51aed))
* **toc:** 🐛 fix clipping toc on desktop ([b78df56](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b78df56695c4ad49e2006ac86faa84e674005aed))


### Performance Improvements

* **core:** ⚡️ defer background main scripts with requestIdleCallback ([9556478](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/955647844370d125d444f60a1cca04ebb8f77439))
* **core:** ⚡️ move sticky header handling to observers ([30fca94](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/30fca942a75bfd0a5b3cbcd65cc2f05d895c9226))
* **core:** ⚡️ move window.resize to resizeObserver ([241ef66](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/241ef66893cd329628c388dbafd4fc896f553403))
* **preferences:** ⚡️ rewrite to use dropdown component ([76a39ea](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/76a39eafdf5083856e106aebc67a0a081cd2d13c))
* **share:** ⚡️ prerender the HTML for the share button ([0c3786c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0c3786c754583d87a5f8364e39c6cec154970a83))
* **stickyHeader:** ⚡️ improve responsiveness for sticky header ([252e98b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/252e98b085d433d78bda24608972262c2d066398))
* **stickyHeader:** ⚡️ improve scroll performance ([a74d17e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a74d17e1303ece923dbfe8417364a0ef678987ca))
* **stickyHeader:** ⚡️ only recalc stickyHeader height when width changes ([d4d6345](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d4d63450500382d4cda95d5a078b7caa18dc7484))
* **stickyHeader:** ⚡️ use transition instead of position secondary sticky elements ([5975e51](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5975e51f587ed5d75a7bb100fde726a9c09fb4e1))

## [2.38.3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.38.2...v2.38.3) (2024-11-06)


### Bug Fixes

* **toc:** 🐛 invisible toc icons on desktop ([ded49e6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ded49e61d817ade26f3734a1d55b7b2e2bf0b51f))

## [2.38.2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.38.1...v2.38.2) (2024-11-06)


### Bug Fixes

* **toc:** 🐛 fix invisible toc on desktop ([6523c5d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6523c5d3ab8ebaabc78499265e97c2d69e56a763))

## [2.38.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.38.0...v2.38.1) (2024-11-06)


### Bug Fixes

* **search:** 🐛 do not set content-visbility for search card ([0607e9f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0607e9fa24ad97c6028bb48775007aecc8beaa89))

## [2.38.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.37.0...v2.38.0) (2024-11-06)


### Features

* **core:** ✨ account for safe area for body element ([b81ed67](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b81ed673a7a8c3f6edb60143b2b22e85f901af24))
* **core:** ✨ add basic cross-document transition ([8e578b8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8e578b8a382fc7d83fed41d73cec7da5ea554ad6))
* **core:** ✨ use newer method to set safe height ([2dc7270](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2dc72705d2d1c27bfc6332a5058ad0611e341992))
* **fonts:** ✨ define fallback fonts to avoid CLS ([d46855c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d46855c0c283ba9c6707bf91fb8aa7b676b5566e))
* **search:** ✨ use 220px thumbnail for Action API search ([a9ff2da](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a9ff2da26d7454648cbefbedf575a2d7ea449366))
* **skinning:** ✨ apply floatleft and floatright to all elements ([a480cc2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a480cc27afa883fe4207f7bf08161ea094ba656f))
* **skinning:** ✨ update message box styles to current standard ([582a354](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/582a3544bd8a5bd1aac8a71e46d2015daf674b19))
* **tokens:** ✨ increase saturation on surface colors ([168a53d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/168a53d6effd8fd7ede440a82fc84c44f6bd5b65))


### Bug Fixes

* **core:** 🐛 emit resize event after clientPref change ([c37560a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c37560a2a9add2c521453f326683c48d0690f725))
* **fonts:** 🐛 remove serif and monospace fallback fonts ([eab9bcf](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/eab9bcf228aa9d5d2a3f156a1b63a0c518681eb1))
* **skinning:** 🐛 stricter selector to select a element containing thumbnail ([b9cfd0e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b9cfd0ebc8fcd7bac0379fe2df42007cd24fbada))
* **toc:** 🐛 incorrect toc button height ([bbc6069](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bbc6069748b85f826eb52764cbc8666b5e995f26))
* **viewTransition:** 🐛 remove unnessecary definitions ([09f8f0c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/09f8f0c70bad3a9047aa979da85f81cc145ced9d))


### Performance Improvements

* **core:** ⚡️ defer non-essential init scripts ([07179d5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/07179d50b1bdf6dc73bf2ee5abdc95f2fd324af5))
* **core:** ⚡️ do not use throttle for scroll direction observer ([50a75c5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/50a75c550cd5917ab7e91dec0418fda5fdf88929))
* **core:** ⚡️ only embed base variant of the OOUI icon ([b7dad17](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b7dad17d6fd427cc0c176e6729a225c6947ae915))
* **core:** ⚡️ only fire scroll direction function when direction changes ([ec097f2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ec097f2e428d35e0cf55a251b3065f48ffeaef13))
* **core:** ⚡️ put sticky header elements in DOM instead of creating them on init ([e79ae59](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e79ae5939c7ce20c92d78aa0665a36dae5c30c7c))
* **core:** ⚡️ use CSS containment for search card and sidebar ([196f3d9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/196f3d906341cd0a5f368582017abf8de1bdcdd5))
* **dropdown:** ⚡️ use content-visibility for icons and dropdown menus ([70193eb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/70193eb56850e9353e7d8f17172ebff3bb6d5983))
* **footer:** ⚡️ add CSS containment to footer ([a32bc92](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a32bc92a99a9ca90bb59e86e3f5d587596243cce))
* **SMW:** ⚡️ use stricter selector to get icons ([a395471](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a3954713e336c73d0e0463435b5c1c2bc9bc0c42))
* **tokens:** ⚡️ reduce lang selector cost ([2d9febf](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2d9febf0e2f5210e14d4a998d6b720674ec54046))


### Miscellaneous Chores

* 🔧 add .vscode to gitignore ([76eb63a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/76eb63a32e87b84316ce77c435e4a5194e8f5c8a))

## [2.37.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.36.0...v2.37.0) (2024-10-25)


### Features

* **core:** ✨ backport  class from MW core ([9660faa](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9660faaa25dd713f3360cd09ebc94060465672b1))
* **core:** ✨ move page header to the bottom on main page ([6d44586](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6d44586adc49af224a6eab049a77d408fe2debd3))
* **header:** ✨ add microinteraction to wiki logo/home button ([06b6f6c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/06b6f6c19444db8beea2e17b47f7e5ec5a324e84))
* **tokens:** ✨ deprecate old font-weight-semibold variables ([c88df2d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c88df2d1944414007950b1a4be018e271b329b07))
* **tokens:** ✨ deprecate old line height variables ([90862b1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/90862b193e7ef33614becbe1edf6670b782af08b))


### Bug Fixes

* **core:** 🐛 fix section collapsing not functioning on Firefox ([#965](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/965)) ([0248af9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0248af942528af1aa8cb743c40c1878c2a396b42))


### Performance Improvements

* **sections:** ⚡️ re-order conditions to short circuit earlier ([01419e7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/01419e76192957fb01189fcfdd31517d59221b18))

## [2.36.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.35.0...v2.36.0) (2024-10-23)


### Features

* **Echo:** ✨ sync Echo alert styles with mw.notifications ([cabf6b4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cabf6b4e07296c0d27028ec44c561df0a1c69df6))
* **MediaWiki:** ✨ add styles for usermessage ([b66ce9d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b66ce9dbe853bceff08add9d086f80186d350f66))
* **MediaWiki:** ✨ update mw.notification styles ([cb5d4a7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cb5d4a79f5285d3ae86bd9b4f52f56f22e2a99fd))
* **menu:** ✨ increase line-height of menu items ([4849c64](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4849c648dca367787f708c19d42d9d4a147ad2e0))
* **toc:** ✨ add wrapper for TOC link to hold summary ([2157bcf](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2157bcf490216817ce7bfd588ed7eb511bb8ffa7))
* **tokens:** ✨ lower the brightness of destructive color in dark mode ([2a53abe](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2a53abed2f44cd7647d9e0d56aad743a13bde40d))
* **tokens:** ✨ update state colors ([db4d8a0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/db4d8a010336bfd116194d2a131751a27ce6aa3d))


### Bug Fixes

* **DiscussionTools:** 🐛 fix invisible highlighted section text ([b68cc3a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b68cc3aa2f92bb4589972c58804c26fc815816e2))
* **Echo:** 🐛 increase specificity for the selector to apply padding properly ([5e749ed](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5e749ed13702fcf578f9c98b671152342a55b80f))
* **menu:** 🐛 prevent dropdown menus from overflowing the viewport ([50832a7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/50832a7d5db5ae516f358abe162633edd1ca0fc6))
* **pageActions:** 🐛 add missing transition property ([7867ad9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7867ad990c8f6680e0b70e02165c6e13b27df4d4))
* **toc:** 🐛 incorrect closing tag for toc summary ([51c7110](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/51c7110b9241da7acb643a19c465e628b2965033))
* **toc:** 🐛 summary should not be escaped ([00bda1f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/00bda1f2b33099da243e3fa83f89347a9ca1400c))


### Performance Improvements

* **RecentChanges:** ⚡️ disable sticky header on RC page due to performance issue ([243738a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/243738a282947a7a605952438541b8b3888c45c8))

## [2.35.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.34.0...v2.35.0) (2024-10-21)


### Features

* **core:** ✨ add animation for more icons ([457bc87](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/457bc87c52ab4c3d5151d84fe09a340b5b253195))
* **core:** ✨ add some microinteractions to some of the icons ([dd16582](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dd1658214212136c552453f4d05259df00851f78))
* **core:** ✨ improve and clean up various CSS transitions ([bb9ed44](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bb9ed449f67263d2691a797508b50f6e908c4b5b))
* **features:** ✨ make black theme color darker ([f96cd74](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f96cd7435e33a1705c9e0d44a1749be7024a8087))
* **features:** ✨ remove saturation from black mode colors ([0259645](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0259645eb5dde29fc099d9de62520e6f912c4c1e))
* **mediawiki:** ✨ improve responsive layout in software table ([ddeaa39](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ddeaa3928846d5bd9b1f0243fcd0667850c97e9d))
* **mediawiki:** ✨ make Special:Version software more compact ([c458252](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c458252f913f2da209bdeabd41e377354117ba5a))
* **overflow:** ✨ add noresize class to citizen nowrap classes ([7702361](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/77023614025777a4d85fa166827afe823f866d94))
* **search:** ✨ use trash icon instead of clear icon for clear input text button ([fe514e9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fe514e94ce0a12f4be7c0909612f4293629acbd0))
* **tokens:** ✨ simplify box shadow and align closer with Codex styles ([9519134](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/951913458ce5a5c0bb520dca91d2c2fa603cb0ae))


### Bug Fixes

* **core:** 🐛 escape CSS variable in HSL color ([43ed770](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/43ed770b6200ed78e8e23e2c76804b4fd9fea6b0))
* **core:** 🐛 fix ellipsis icon rotate direction ([118bd6a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/118bd6a2be281aa160adc623ee44139fee5a07ef))
* **mediawiki:** 🐛 add missing LESS import for mediawiki.special ([a614152](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a614152388170c92ec3ec018faa5593fda6468bd))
* **mediawiki:** 🐛 apply body styles to overlay outside of citizen-body ([95c355d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/95c355d9b33a370fd5412f6cbbb1db1ca92b80ab))
* **pref:** 🐛 only apply transition to transform property ([8ac332a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8ac332a8c0eb5076a53b2a292a10098cc16363c8))
* **tokens:** 🐛 incorrect shadow opacity for dark theme ([a353b14](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a353b14dc7b3b416ce58b8a80a5bd656140357e2))


### Performance Improvements

* **core:** ⚡️ disable all CSS transition during window resize ([10d3c17](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/10d3c17f185441c5424dfbee4318648313a50417))

## [2.34.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.33.0...v2.34.0) (2024-10-17)


### Features

* **core:** ✨ add more saturation to text colors ([b9a92b4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b9a92b46920e000b8c398ed773086d5df14e50a7))
* **core:** ✨ extend page header background to full width ([53742a0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/53742a0dd24e3450a4376bdb65e5304eba306e42))
* **core:** ✨ simplify section implementation and update support for new headings ([20f484d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/20f484d9a3c2cc06af4f475ca1a16f2a548336d2))
* **keyhint:** ✨ remove hyphens between keys ([cf1e55d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cf1e55dc5547fe51452f0846a0222ab80e652073))
* **Keyhint:** ✨ tweak keyboard hint styles ([d2e92da](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d2e92da3c5881f96d12b4bb58d67ce42200da973))
* **RecentChanges:** ✨ remove skeleton screen loading ([d76e8a9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d76e8a9a3f294fc19be002f1030694ad50b2ed62))
* **stickyHeader:** ✨ collapse page tools label in sticky header ([1752552](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/17525528f5e2f87e11637e2cfa64867e3e207a84))


### Bug Fixes

* **core:** 🐛 use CSS calc instead of LESS calculation ([bd71ac7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bd71ac747b95c57b73ace3297f4a00c9ceae8301))
* **core:** fix LESS compile error on 1.39 with multiline rules ([c90fe6c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c90fe6cea58c3f67721930d3c5d391fe9f5bfa06))
* **pagetools:** 🐛 fix incorrect background color for language badge ([17c8caa](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/17c8caace971423e0b0af96d8e6dce9887fe11a7))
* **tokens:** 🐛 fix LESS parsing error for box shadow in MW 1.43 ([ecdf9f2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ecdf9f2a2a932bc2ff78385d4cc26c68234695c6))

## [2.33.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.32.0...v2.33.0) (2024-10-15)


### Features

* **core:** ✨ make border color more visible in pure black mode ([ec68a30](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ec68a305792563c137e4a392905f5164c180d09f))
* **core:** ✨ make dark mode surface colors a bit darker ([3601fbd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3601fbd3ee2431d0425a36b0450afebc6d9e77b0))
* **core:** ✨ update to new Codex external link icon ([10f5d11](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/10f5d118f67d8a41e26aa81bf72ed960a9bd613a))
* **pagetools:** ✨ add border to floating buttons ([0858378](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/085837807f15dbbcdf4c89bd559f02b44f73bced))
* **Popups:** ✨ make popup cards more compact ([5a3a94a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5a3a94a6e0400464e7499b7ac5178aacc493f55a))


### Bug Fixes

* **menu:** 🐛 hide keyhint in main menu items ([249ce64](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/249ce640e90a67c48e313db53c38e8012e1115ff))
* **pagetools:** 🐛 do not bound the width of page action card to page tools ([96004fd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/96004fd30dd41d754d6a5ae99a6c5107eb27fa5b))
* **search:** 🐛 correct Elasticsearch spelling ([#958](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/958)) ([575acaf](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/575acaf8e6b95da0b9146030ad102f79852c14ff))
* **search:** 🐛 fix invisible progress bar ([01365d9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/01365d90ec78fdb22cd7d7001566437aadd3bcc8))
* **usermenu:** 🐛 hide keyhint for create account button ([5f328c0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5f328c074375e313206ee097669734b00a77416d))

## [2.32.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.31.0...v2.32.0) (2024-10-03)


### Features

* **core:** ✨ enable heading HTML change for 1.43 ([c64b2ff](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c64b2ff5e6a15ad57798b2943468e58b2db4addb))
* **menu:** ✨ add accesskey hint to menu items ([10a28ac](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/10a28ac476ac168ef3fa93b3e61867d1c040a370))
* **search:** ✨ change search text label to advanced search if AdvancedSearch is enabled ([dea1628](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dea1628ce37b502e73adaa3d39546911e08cac97))
* **search:** ✨ show Elasticsearch at search footer if it is enabled ([3e63a3f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3e63a3f6cce49b1b2d21b827162ecbcb642babdf))


### Bug Fixes

* **icon:** 🐛 prevent icon from shrinking in size ([a2cc968](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a2cc968d2b52839615e96e6754a6291c37faf8cf))
* **prefs:** 🐛 fix incorrect option spacing ([325c26f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/325c26fe4af7aa79c6f67ab39ed6ad04c8cdda8f))
* **search:** 🐛 add missing advancedsearch message ([9e3f454](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9e3f4548c404dc3ce8e27b93e958f72b7a62466a))
* **search:** 🐛 fix incorrect delimiter for gpsnamespace ([b630a91](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b630a914df9e996ded9d32bac31e1d4ad17617a9))


### Miscellaneous Chores

* **dist:** 🔧 exclude .versionrc.json from dist package ([3634f8c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3634f8cde00fb6277b44d20491d3c5c372711ce7))
* **dist:** 🔧 exclude development files from dist package ([dbd0fdc](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dbd0fdc0fe225bfbe4ce63bcab8655ea34bd432b))

## [2.31.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.30.0...v2.31.0) (2024-09-28)


### Features

* **search:** ✨ hide scrollbar on chip list ([640ecf8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/640ecf824c8f1a4dd72c84d8a76b2a081a832f4f))
* **search:** ✨ migrate most typeahead elements to Mustache ([c327dc4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c327dc4fa99bc72f67bbefe9ba40f7a3d4bf4994))
* **search:** ✨ migrate typeahead to Mustache template part 2 ([a0296af](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a0296afaedbe1a277337a2d8f1da83cb3a79b9ab))


### Bug Fixes

* **search:** 🐛 add spacing between title and desc in typeahead item ([b448ac3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b448ac3077c26db7938427ef2ab8929e310fac9f))
* **search:** 🐛 fix broken search history ([6cccf7c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6cccf7cddfe6e37d9c8b7e285a56e2de159cb0e3))
* **search:** 🐛 fix namespace parameter for Action API ([723421f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/723421f6917de20f4f23ab316dd9cb066b07255a))
* **search:** 🐛 incorrect alignment for typeahead item text ([527a767](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/527a76785ecaad421ee63772fe5b07171b977cd7))
* **userInfo:** 🐛 escape html characters for real name ([86da3e0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/86da3e07718c8d8da6f4310386fef85599606f9b)) (CVE-2024-47536)

## [2.30.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.29.0...v2.30.0) (2024-09-27)


### Features

* **core:** ✨ add placeholder text color ([7b3f8f5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7b3f8f5823e123a455913300d058b68d613cf86b))
* **core:** ✨ increase max-height for menus in mobile layout ([6f6aa82](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6f6aa827437de9539051ea4789015ea01b617963))
* **search:** ✨ add keyboard hint to search card ([a213f1d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a213f1d6a06bddc3e9a31e0820b33afe3d0bf2d6))
* **search:** ✨ add message to search footer ([138f7a9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/138f7a9bd57569cef22fb1310575d6d934d0a145))
* **search:** ✨ clean up and simplify styles ([151d60f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/151d60f10f2f7c7c22829bfb86c022c393ac0928))
* **search:** ✨ clean up HTML structure ([c35d86f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c35d86f43f6ad0633149fe465c1ba1908db15ca6))
* **search:** ✨ clean up search suggestion padding ([f1bf40a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f1bf40ac783fb8c20a93d86014360c6220cc9ecb))
* **search:** ✨ clean up spacing and alignment in typehead elements ([5605d18](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5605d18f49dd8b122fe636bbdb2d886302764b74))
* **search:** ✨ remove search form and footer glass effect ([3ad8902](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3ad890206d5ada6471c3e035212b16caf8420e63))
* **search:** ✨ tweak search box to be more center for desktop ([28b117d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/28b117d99075d9b2d894573e27649202bf21665e))
* **search:** ✨ tweak various search styles ([55227e6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/55227e6847e541e32121d8de8e1758edfd8750ce))
* **search:** ✨ use glass effect on search form and footer ([d90ba79](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d90ba797b316d5159de2fd5727e591ed116258e3))


### Bug Fixes

* **search:** 🐛 add missing reset style for li ([8800ca6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8800ca672fe59f6cab5ce6d528ff6c14ac0290d3))
* **search:** 🐛 add missing search footer background color ([d6a7c9d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d6a7c9ddd060cc1285af4dcae5e7df24b193489b))
* **search:** 🐛 fix incorrect max height for search card ([eb3927a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/eb3927ac0f00351059c5a67c0494869a6ba2c830))
* **search:** 🐛 fix search button icon clipping ([73eb950](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/73eb950c310f39bbed878e6bdefb838bdf796647))
* **search:** 🐛 search all content namespaces for Action API ([3719897](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3719897e93122a6530449796196ebb2d437efb66))
* **VisualEditor:** 🐛 unstick page header in VE ([3804574](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3804574ccb849701cda95c723664e368b7fac235))


### Miscellaneous Chores

* **dev-deps:** 🔧 update browserlist ([60e96f7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/60e96f7f47b3329b7c0279523e0f289dfa853239))

## [2.29.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.28.0...v2.29.0) (2024-09-12)


### Features

* **core:** ✨ add indent line to changelist ([a00fe11](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a00fe11e786a55450f8eaef71f4897c94c95a27c))
* **core:** ✨ add support for mw-sticky-header-element ([2569749](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/25697495e5cdb13c178a7c6bc64c41a11a3efc6f))
* **core:** ✨ add support for skin-invert and skin-invert-image ([8f61265](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8f61265cec46c336cf0f75d531131684771ad38a))
* **core:** ✨ do not hardcode scroll padding top ([8354f8e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8354f8e263c0e062ec870730efd9fc5863eb8833))
* **core:** ✨ minor tweaks to changelist styles ([2c862b0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2c862b0cc1c6e94f8d28b3bc0b86c591368e917e))
* **toc:** ✨ allow ToC to be collapsible ([257673a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/257673a588361f3ca78eb00f6b33230e4cbd5f36)), closes [#556](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/556)
* **toc:** ✨ expand the current active section ([1b7025e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1b7025ef858f4e307064148137e471a1dd077b92))
* **toc:** ✨ reduce the size of toc toggle icon ([07dd936](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/07dd936115ceed17cfd16d5993af8cbb9be9b13d))
* **toc:** ✨ switch to ToC implementation based on Vector 2022 ([8640d4e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8640d4ef30adb0c11ad2abbef9c1ec6dd2a2044e))


### Bug Fixes

* **toc:** 🐛 exclude toggle from top section hover ([ab62d65](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ab62d65768f1bdfc1a365748c6ae5fffadca7c83))
* **userinfo:** 🐛 use more appropiate i18n for edit label ([19441d8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/19441d8a749ffa9649b728216c57cc400a3ce617)), closes [#944](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/944)

## [2.28.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.27.0...v2.28.0) (2024-09-09)


### Features

* **FloatingUI:** ✨ add support for Extension:FloatingUI ([bb44e05](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bb44e05f976a6847b73f8c5324c800cbdae38cd4))
* **FloatingUI:** ✨ sync styles with the latest version ([4dd8e54](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4dd8e5492e95cd5fa9cd4e1d2195b4729c057496))
* **SemanticMediaWiki:** ✨ update jsonview styles ([6fef375](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6fef375dbef9df23a0c0252a03249483352d1d25))
* **StructuredNavigation:** add styles for StructuredNavigation ([#943](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/943)) ([8eb6e51](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8eb6e51110e799f7d869920717a6aec3d8ca7ec5))
* **TabberNeue:** ✨ drop CSS variable definition for TabberNeue ([12196cb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/12196cb94050575848eed8e1cb77d51fa2f5071f))


### Bug Fixes

* **SemanticMediaWiki:** 🐛 fix undefined LESS mixin ([c698990](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c6989906a3d721a5e66bf0975556917fbd9e871b))
* **StructuredDiscussions:** 🐛 fix missing LESS import ([81a3cd1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/81a3cd1bf864227d494456a12ab6f96ed6d69f4d)), closes [#711](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/711)

## [2.27.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.26.0...v2.27.0) (2024-08-19)


### Features

* **Cargo:** ✨ make Cargo dynamicTable responsive ([2730769](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2730769b041c76de2459147e5b2e39aeaa466827)), closes [#924](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/924)
* **Cargo:** ✨ update Cargo table styles to match with wikitables ([8099399](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8099399ff42243660c16598b6ea0cfbf8f18a4f1)), closes [#923](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/923)
* **DataTables:** ✨ let scoll wrapper handles borders instead ([8f03aad](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8f03aade5110cbe5d7cd778debeb21da1d25e222))
* **search:** ✨ append fragment to search suggestion URLs, if one is provided ([5e4e57f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5e4e57f082a33965fb2caf9c93dcefdf6e708e5b))
* **TemplateData:** ✨ update TemplateData styles ([0b397ee](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0b397eeb6e4c016275053a938f4305ab462996c4))
* **UploadWizard:** add basic styles for campaign ([#925](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/925)) ([118f9d4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/118f9d47c7eb6b977d1313072687343932c76076))


### Bug Fixes

* **category:** 🐛 fix incorrect hover text color for visited new category ([fd0346e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fd0346eb4fe4bb75144373e4d159e4715b772fe7)), closes [#933](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/933)
* **DiscussionTools:** 🐛 fix incorrect font-family for headings ([e3dc77f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e3dc77f36a4d0b782465b50488bbfef44f99e899)), closes [#930](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/930)
* **OOUI:** 🐛 add missing invert color rules for framed progressive buttons ([1461172](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/146117223862ff5f130b85c28a6adeafa3ab7826))
* **ooui:** 🐛 remove incorrect OOUI checkbox invert rule ([8de13a1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8de13a1f85e6a292a5c812ed09196abf070c9456))
* **pagetools:** 🐛 add additional check for source edit button ([fadd989](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fadd9893eaee020e96e7247a5ba9a1ae4eafb3ff)), closes [#929](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/929)
* **pagetools:** 🐛 fix incorrect selector for edit buttons ([a4fdcf3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a4fdcf3572cede87c8c18c5d4eb19c3e25386a04))
* **wikitable:** 🐛 fix missing bordered wikitable borders when rowspan is used ([14591ad](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/14591adcf2aca7f33954f96a7be13d21a52ec0c7)), closes [#932](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/932)
* **wikitable:** 🐛 stricter selector for border separator ([7dbdf27](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7dbdf27ca7f3a7b82281a363a5878b5249f403d1))

## [2.26.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.25.0...v2.26.0) (2024-08-06)


### Features

* **core:** ✨ add reset styles for border-width and border-color ([2fe9443](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2fe94438ee5ac93b73588b65e262890b45bb3abc))
* **core:** ✨ tweak changelist and toc border width ([b9cd270](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b9cd27043d73ef1dea0395c66123505c695e9f1d))
* **core:** ✨ update box-shadow CSS variables ([c1370e9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c1370e95f04622d1f19be7cb38aa5133b6f4d763))
* **fonts:** ✨ bump Roboto Flex to 3.200 ([4d803f8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4d803f841ddd227c097151fa434631253f1062de))
* **OOUI:** ✨ update filter invert rules ([b922b03](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b922b035ccf9a7bea58f971ae69d55fbd2435967))
* **SMW:** ✨ tweak Tippy styles to match with Citizen ([f1e2130](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f1e2130ed4440dfcb08c11e3b1fa2a8edc4b3d87))
* **stickyHeader:** ✨ add transition to secondary sticky header ([1703d29](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1703d299455e5a06e0a6c1f5dc9636066b03ed6a))
* **UserProfileV2:** ✨ add UserProfileV2 style ([#914](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/914)) ([ffbaa5b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ffbaa5b9fa2ad60e78ed57a1d4ea827f7c4383b0))
* **wikitable:** ✨ add new wikitable utility classes for additional styling ([362dcd0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/362dcd01cc69a812ad3166b4153bc484dc701985))
* **wikitable:** ✨ use more accurate selectors to apply border and border radius ([cc0820c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cc0820c204aac9addf1a9316fb4026bcd02abe5f))


### Bug Fixes

* **AccountInfo:** 🐛 incorrect CSS var name ([d115a5e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d115a5e5e82192f294feb18a4aa060a653ae28fa))
* **AccountInfo:** 🐛 resetting incorrectly styled elements ([#915](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/915)) ([dad5c26](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dad5c26e02ad2b0da6db461ff8a3c13ff7bd888a))
* **core:** 🐛 do not use inset for box-shadow-border ([6711196](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6711196bdaa3b696145a3f2c60cd5e60c11a41ef))
* **core:** 🐛 fix uneven margin in table cells ([9baf851](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9baf8510ce1854f6eb26dd22a67824318e6438ae))
* **overflow:** 🐛 fix undefined wrapper ([764f759](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/764f7593c3a2d69ed7455b75dc5709794127adcd))
* **stickyHeader:** 🐛 incorrect border box shadow ([9a0ebf4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9a0ebf444651d2a772dd8d99b554f4257ec8da77))
* **WikiEditor:** 🐛 missing border bottom rule ([81348ff](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/81348ff27e2a904519502e95b424a52743451881))
* **wikitable:** 🐛 incorrect border radius when both thead and tbody are present ([15ebea1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/15ebea1c800c43938f680f00bca2b9e5460d1608))
* **wikitable:** 🐛 incorrect selector for tfoot ([08a7a51](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/08a7a5156626fd70d9b96f100643568a5d314e8c))


### Miscellaneous Chores

* **husky:** 🔧 deprecate old commands ([bd0cea7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bd0cea79e49770b9c4eea2f05fb3d343881713a6))

## [2.25.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.24.0...v2.25.0) (2024-07-19)


### Features

* **AccountInfo:** add AccountInfo styles ([#749](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/749)) ([99e7f08](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/99e7f083131e6cc16b9015bf0c83d2d9167276db))
* **core:** ✨ implement Codex border-width tokens ([1fefddd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1fefddd41a4642ea1933e939a09d9d1263c2cd93))
* **print:** ✨ add wikitable styles and hide contentSub ([5296aef](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5296aef9def69c03bb8d9d12ab646f17ebcd9216))
* **print:** ✨ allow font size settings affect print styles ([8641bec](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8641becb2ae7a8e4b226ab65da53b0c09f3e5807))
* **print:** ✨ hide page footer in print styles ([1da57e5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1da57e590230a3c42300eb90f3b34f4c60f32145))
* **print:** ✨ rework print styles ([543400d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/543400d9d5e905773429fd55a941c5e8f1b67d75))
* **stickyHeader:** ✨ add CSS var --height-sticky-header to offset sticky elements ([c9d98e4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c9d98e477a3634d1c71408a65ae8d3666eb31a83))
* **stickyHeader:** ✨ implement sticky header variables into other sticky styles ([a1ad423](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a1ad423f2f6ebf501d4bf23d5e6be06b72a2b018))


### Bug Fixes

* **print:** 🐛 add important declaration to hidden print elements ([aeb083e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/aeb083e74dd14b44cf535db6357abd79d5540973))
* **print:** 🐛 only color variables require important declaration ([a9fb03f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a9fb03fc8e9d9a93b71d0b6fcf7e5a250c29ebb2))
* **toc:** 🐛 ToC should have the same padding as other menu cards ([f3042f5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f3042f5b80f3426f59ec684511f2f952508de8c3))

## [2.24.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.23.0...v2.24.0) (2024-07-12)


### Features

* **core:** ✨ use Codex tokens for z-index ([b5180bf](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b5180bfbda805e475661b3aa61c3fa52d82b8841))
* **DataMaps:** ✨ add DataMaps init styles ([46c139a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/46c139ac86f1c4dca862133bffbe29645488cb8f))
* **DataMaps:** ✨ add styles for Extension:DataMaps ([5fdcfc6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5fdcfc61f67ee93bcee8150fa96dce63e773833e))
* **leaflet:** ✨ add Leaflet styles for Leaflet map extensions ([4c51200](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4c51200ed5b620603f9e6df90a48ceb6b5b4d6e6))
* **Leaflet:** ✨ bump Leaflet button sizes to match Codex ([a67f075](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a67f075a6a92383235f6a534cd434ce71c860b99))
* **Leaflet:** ✨ tweak Leaflet control margin ([fb965e3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fb965e37128e7cf8d57fd237d052ec846a55a161))
* **pref:** ✨ add clientpref to disable auto-hide navigation ([f0d1176](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f0d1176f2a4fd73a4b0003a50b07210d70136d4f)), closes [#841](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/841)
* **stickyHeader:** ✨ reduce page title size ([f66348b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f66348bdbb1daef1934a297113dc5e9815b247ce))


### Bug Fixes

* **Changelist:** 🐛 fix incorrect legends z-index ([cae7c75](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cae7c753ac5faa572de5afa3b8acf82d7958f91f))
* **core:** 🐛 explictly set z-index for body container ([2794a32](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2794a3269cef976c6971a82bdb9fc0459a391f28)), closes [#577](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/577)
* **DataMaps:** 🐛 fix OOUI button width and invert icon on dark mode ([1688b92](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1688b9245676dce577b49e262b6826fee7162ffd))
* **DataMaps:** 🐛 remove unused styles ([0540f0d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0540f0d3934d2015102d87b38b20e1f6cbc8f653))
* **Leaflet:** 🐛 fix button alignment ([7b6520b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7b6520b9ab8f59662dddf5b81b69c9b04d05b2d2))
* **leaflet:** 🐛 incorrect checked label selector ([1471c1b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1471c1bc23c67f9314fb1138d63589740c3cb7d2))
* **leaflet:** 🐛 re-introduce box-shadow back to touch buttons ([51caa71](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/51caa71777a96b90e3014d6e3764feab2378c4a3))
* **stickyHeader:** use cached value for placeholder height if possible ([c3855ff](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c3855ff8b9fdbfdd4d3e448a539ede43fa8b6e5c)), closes [#854](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/854)
* **ToC:** 🐛 increase z-index of ToC backdrop ([c555dfe](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c555dfe1bf7b3207919d3fc75267be8a7452bbdb))

## [2.23.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.22.1...v2.23.0) (2024-07-08)


### Features

* **CiteThisPage:** ✨ add styles for Extension:CiteThisPage ([7178f6d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7178f6d372ebc506c6e0ffb0b207de7db595eca4))
* **codex:** ✨ backport Codex v1.8.0 variables to mediawiki.skin.variables ([2896817](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/28968179ceb4211f9e38b7baa63dc10b875ec0cc))
* **core:** ✨ clean up th styles ([232fd0c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/232fd0cc4b8ae517c6eba75f218bababc77535ee))
* **core:** ✨ theme and unify text selection color using progressive colors ([ba62b92](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ba62b92e296efbd059140345520bfab62fdaab0d))
* **dropdown:** ✨ add fade-in animation to dropdown menu ([20e4f7e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/20e4f7ec6e9ed7efe3d3b9802fad1356c9958c43))
* **PWA:** ✨ set orientation to natural ([1f417ed](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1f417eda0b3d6d4f554d3023e62cc5d4a63ed8ec))
* **SearchDigest:** ✨ tweak stats table styles ([9037fd1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9037fd17842d0e3df42bb1842b594ee849be44b1))
* **stickyHeader:** ✨ add background transition ([8eef0aa](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8eef0aae42182f8b100d553b079958c65c51ba3c))
* **wikitable:** ✨ avoid double border when border attribute is active ([fccc024](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fccc02497886909fd53eaaf642bb108cdeb40a9a))
* **wikitable:** ✨ use box-shadow instead of border hacks to build table border ([442c272](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/442c272cabc3ffc0803eac8fcf5040910d2ad7e0))


### Bug Fixes

* **core:** 🐛 add webkit prefix to backdrop filter rules ([6dfc62b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6dfc62b15d163a6f9626d2cbe6d37b2ebae7ba75))
* **core:** 🐛 fix incorrect screen reader text reset styles ([d3ef4af](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d3ef4afeccf2c0ea744d1021f53178dfe2918209))
* **core:** 🐛 incorrect box-shadow values ([9161988](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/91619884abdaafd38529b05e97f0abbccde1e6bd))
* **dropdown:** 🐛 dropdown button should be above the backdrop ([c2523b1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c2523b141c8f551bf7bdb9ef4c9ac852a04314ec))
* **dropdown:** 🐛 use both touchstart and mousedown event listener for click outside event ([a4593d7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a4593d7dd304e45c6ddcc804c9ea7778eb0a203c)), closes [#895](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/895)
* **search:** 🐛 check if article path has question mark before adding search params ([ecc4cca](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ecc4cca043133ff1f5e72e20f5d64ceb4bde57ed)), closes [#903](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/903)
* **search:** 🐛 fix incorrect parameter for debounce function ([55b310d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/55b310d26debfa4739256d6d10e7a566cf32ac4f))
* **share:** 🐛 incorrect debounce parameter assignment ([e9fd488](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e9fd488ceeb811472a10e44539bd215178d3674a))
* **skinning:** 🐛 only apply top margin to figcaption when it is not empty ([3d7311d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3d7311dbbe5041425050819a7b590e317d53b134))
* **stickyHeader:** 🐛 add a placeholder element to page header to avoid layout shift when stickied ([e5336c4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e5336c46105d002807ff2e2074d3dd0382484b69)), closes [#854](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/854)
* **stickyHeader:** 🐛 only add sticky class on resize when it is applicable ([7f9f975](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7f9f975b9ed7515c28e9e1805681347f263e467e))
* **stickyHeader:** 🐛 use more accurate calculation for placeholder ([a7a763b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a7a763b57ffe259a2fc3ad530a7bd5f010dba366))
* **toc:** 🐛 fix transparent ToC button ([aaa677f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/aaa677f2d6f4a464995349cc712be9215b82bd04))
* **toc:** 🐛 keep ToC button at the same position ([72edb81](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/72edb817bebebf3f382a5b9928193db57943019c))

## [2.22.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.22.0...v2.22.1) (2024-07-06)


### Bug Fixes

* **Echo:** 🐛 incorrect selector for notification count ([9372c74](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9372c743072aab521740d546b3a3a1311eb47081))

## [2.22.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.21.0...v2.22.0) (2024-07-06)


### Features

* **core:** ✨ use px for border-radius ([00b2495](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/00b2495c1ab7a87e8811d28b713998b09e4397bf))
* **core:** ✨ use text-wrap pretty for blockquote elements ([add781a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/add781a4a169c83ad240d8640f705596495dac1e))
* **dropdown:** ✨ revamp dropdown menu handling ([516ef3a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/516ef3a1cb1d11e39f4f835e2ba50536e93a9ef7)), closes [#882](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/882)
* **Echo:** ✨ upgrade Echo buttons for consistency ([fdc6eae](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fdc6eaee202aa2881c417a0491ae9758a46e3c2d))
* **pref:** ✨ extend font-size adjustments to all text ([b53381e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b53381ed12c6d460735dbf0bac768db48383b270))
* **search:** ✨ unify url generation in search typeahead ([9c77c7f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9c77c7f3f294431acaede7c1fb7cc8451710e99e)), closes [#898](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/898)
* **search:** ✨ use Short URL in search suggestion ([c5c47ae](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c5c47aeb5f4258e4a5ddea9f2df4831862a16394))
* **SearchDigest:** ✨ add styles for Extension:SearchDigest ([251109c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/251109c7129c13fb7908f794ea22a56e4c39bbc7))
* **toc:** ✨ drop checkbox hack usage in ToC in favor of dropdown ([#894](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/894)) ([f2ff92e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f2ff92e1ac5e4ba20b07e2a7504a6cdf7127180d)), closes [#855](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/855)


### Bug Fixes

* **core:** 🐛 avoid sr-only text clipping during transform ([111607e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/111607ec9644c3380cd50dc39553c42d6e4947eb))
* **core:** 🐛 fix invalid background-color properties ([23f2667](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/23f2667b24f65687059d836ea1c8054d918b06a5))
* **core:** 🐛 remove git merge artifacts ([3392eb7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3392eb796cfcaf5dfc9a841fa99f9fd1275f2b5f))
* **dropdown:** 🐛 merge conflicting dismiss event handlers ([317296e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/317296e7b0650afb30a596a4e08c00f8ef573603)), closes [#895](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/895)
* **search:** 🐛 incorrect article not found icon size ([9ace83a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9ace83a9bc1c3bd0fcb113b21d1de8bd78e9c710))
* **toc:** 🐛 elements behind collasped ToC should be interactable ([a68626f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a68626f56af0b57ba5726b0fad779326f73ccc16)), closes [#896](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/896)

## [2.21.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.20.0...v2.21.0) (2024-07-03)


### Features

* **core:** ✨ clean up state colors ([ff0a6ed](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ff0a6ed710f547f91797ba98f8143688d4229af4))
* **core:** ✨ convert some CSS variables into Codex equivalent ([5d3ecd9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5d3ecd9edde583f4974570058b466f6595637f51))
* **core:** ✨ convert some CSS variables into Codex equivalent part 2 ([0fdc7c4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0fdc7c4ad72710920f5c51cb7f70d014d6b1f5fd))
* **core:** ✨ convert some CSS variables into Codex equivalent part 3 ([7c9eadb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7c9eadb662e0b4c8c4866485f30800566470651e))
* **core:** ✨ set new link color to color-destructive ([c21a908](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c21a908c12b15a59f66fcc6585d30ad2d9553a6a))
* **menu:** ✨ add blur to menu backdrop ([23b3c33](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/23b3c3326a278aa785454cb5bdedfca9b26cfe9b))
* **mmv:** ✨ tweak button styles in lightbox ([17e9840](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/17e9840a77bed7ced3942b43f46d30f54f5d67c0))
* **mmv:** ✨ tweak lightbox caption text handling ([cb683c7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cb683c79ff3931c83de96aa9636e4107ca1e85e3))
* **pageActions:** ✨ blend language badge into the background ([0a1ac14](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0a1ac146770e3726849c95a4022463cb707e7ed8))
* **stickyHeader:** ✨ reduce direction observer throttle ([5715a29](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5715a29dae38ed5badc0bab346b72ced13424bbf))


### Bug Fixes

* **core:** 🐛 fix max-width breakpoint calculation in LESS ([568dfc7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/568dfc7de306cab724f927482ebee80fd9d43edb))
* **core:** 🐛 remove smooth scrolling for body ([1bce892](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1bce8921d06a1cdbd0d5f3d82057c8346288d844)), closes [#883](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/883)
* **pageActions:** 🐛 language badge should use the same color as its background ([ae4131f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ae4131f51fa91fe282e6c4650a94f3d361b8b8e0))
* **preferences:** 🐛 incorrect active button color ([66e7282](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/66e7282accf5ca96a001b8273f9c31b7c3e07efe))
* **skinning:** 🐛 fix incorrect mw-halign-left left margin ([fbd030a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fbd030afebb72fe99da1006ac52918e241b6521e))
* **stickyHeader:** 🐛 use margin and padding instead of grid gap for body spacing ([2f7ae8f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2f7ae8fc1dcd07bd8624f024c61b10885fdd3d34))


### Miscellaneous Chores

* **dev:** 🔧 disable plugin/no-unsupported-browser-features in Stylelint ([931e94d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/931e94da43f10a1c91e21affc8fd6cd5fc18d201))

## [2.20.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.19.0...v2.20.0) (2024-06-30)


### Features

* **overflow:** ✨ use CSS variable for overflow gradient size ([f0de4f4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f0de4f4c5b7329cd8764df7f762e2632d7a7bfeb))
* **pageActions:** ✨ add share button to page actions for article pages ([327aca0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/327aca0b2ca1aa8d085313cc2d70b07980f5c367))
* **pageActions:** ✨ use neutral color for language badge ([fce1f77](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fce1f775c4228be84530facd03c7d2d81066e0a3))
* **search:** ✨ shorten fulltext and media search button label ([ba1f77d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ba1f77d8a304fd1a11a2c639dc3e5c9f398cbd49))
* **share:** ✨ only share URL ([1edc40e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1edc40e70ce303f0e40cec194da26c33fabfa3d2))


### Bug Fixes

* **core:** 🐛 force selected view button to be visible on revision pages ([3d90051](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3d90051ae667a0de7da80cc7d003db920110993d))
* **datatable:** 🐛 table should not be wider than the wrapper ([7e20daa](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7e20daa70bc6b81122efc8d4e7bac065eabb4e08)), closes [#888](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/888)
* **menu:** 🐛 prevent page from scrolling when dropdown menu is open in small viewport ([dd53576](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dd535769414bcd719d6a862d1477ab45bfc9e430))
* **menu:** 🐛 show view button specifically on revision and diff pages ([eb58bd6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/eb58bd6e9991179fa282bc71501215077781195b)), closes [#845](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/845)
* **overflow:** 🐛 remove unused mask rules ([c34868d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c34868d04edafb2b45bbb7ac60e748aa7f1ad9db))
* **skinning:** 🐛 incorrect text alignement for mw-halign-center ([e4697c4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e4697c48f10a32ec0e0c0a50f1ab702750a6e710))
* **wordmark:** 🐛 wordmark should resize responsively ([7133648](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7133648fe0855682ca25db1cf955d5f3018e4cca))

## [2.19.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.18.1...v2.19.0) (2024-06-24)


### Features

* **skinning:** ✨ remove top and bottom margin from nested lists ([08e63e3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/08e63e3caf8d890b7109a0275eff0f7b9976e4ac)), closes [#886](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/886)
* **wordmark:** ✨ implement wordmark in drawer ([c47531a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c47531a28b2f815a08b6f4d4d6dada48bd2a99c7))


### Bug Fixes

* **footer:** 🐛 incorrect invert rule for footer wordmark ([e0507d4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e0507d489deb5775695110baafe2cb2d48e88456))
* **menu:** 🐛 avoid double view button on talk page ([923dded](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/923ddedcc0fd2495f797548830b595bcdf9d0659))
* **overflow:** 🐛 overflow content should fill parent container ([2639b0f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2639b0f70d3c12334e89aeeb2e48cb20566174c8))
* **overflow:** 🐛 prevent overflow button from triggering form action button ([7fb35f9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7fb35f90f5b5ee533fa17157176584bd3b52e26c))
* **pageHeading:** 🐛 capture brackets even without whitespace prefix ([3e64df8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3e64df8bee03e46c8502ac08323b27e024703886)), closes [#879](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/879)
* **skinning:** 🐛 incorrect margin for right float thumbnails ([fae9dad](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fae9dad9b007536d208fd27482564678f38a7544))
* **WikiEditor:** 🐛 align toolbar buttons ([84d58be](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/84d58be232f025f87a00a7e590249bdc64e39571))

## [2.18.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.18.0...v2.18.1) (2024-06-14)


### Bug Fixes

* **core:** 🐛 incorrect side margin for ul and ol ([d079cc9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d079cc9b29309b94543765002ef13006d73c6c78))
* **menu:** 🐛 fix invisible user menu on desktop Safari ([00dba95](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/00dba9540b8b5036d4926419aab43ecace67f8bd))

## [2.18.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.17.2...v2.18.0) (2024-06-14)


### Features

* **core:** ✨ hide the text from the help indicator ([5bc18b5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5bc18b5f4ac4939dfa027216f7fec691da45164f))
* **pageHeading:** ✨ add support for all Unicode opening and closing punctation marks ([01d14d5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/01d14d55983c4a23c348a07d5e3c88260e1c86e1)), closes [#879](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/879)


### Bug Fixes

* **menu:** 🐛 fix invisible user menu ([a7c74e3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a7c74e3f107a81bdbb426a91a87353b9991ab055))
* **menu:** 🐛 hide Safari details marker ([c52dc49](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c52dc49d6dbac3e6489f773c4f1ad9163538e740))
* **menu:** 🐛 incorrect Safari details marker selector ([3b3bb30](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3b3bb3030db7b26d9c883d9e9a22503b751c6d00))
* **overflow:** 🐛 wrapper should respect float elements ([9bd18ea](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9bd18ea0541b7e19c957e75263a4d8238cf97fbe)), closes [#878](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/878)
* **Popups:** 🐛 invert icon in dark mode ([20fd064](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/20fd0643feebdc089efd94bdad235a5fcd4e397c))

## [2.17.2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.17.1...v2.17.2) (2024-06-12)


### Bug Fixes

* **overflow:** 🐛 allow to click through the nav element ([dd89dab](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dd89daba3979f6840836571f1db3831488b6eca9))
* **pagetools:** 🐛 attach menu to the page actions bar instead of the button ([feae1e6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/feae1e6ad35465de0ee1037e4d07a855cdfaf04d))
* **toc:** 🐛 ToC should have a higher z-index than page actions in smaller viewport ([089a329](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/089a329da91294fe5ea4f0ab8b5b4e57dad4fef6))

## [2.17.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.17.0...v2.17.1) (2024-06-11)


### Bug Fixes

* **overflow:** 🐛 align scroll buttons with content margin ([4b457df](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4b457dfa0880a01950442deeca40367ad57aeeb6))
* **overflow:** 🐛 expand blocklist for nowrap as some tables contain the wikitable class ([f5e9891](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f5e9891079b1e01a236101c1540b378654b67f15))
* **overflow:** 🐛 mark oveflow button as not accessible for screen reader ([7830faa](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7830faa8fed15c6f3566750153f9c6a5df06e80c))
* **overflow:** 🐛 use more accurate rounding method for overflow detection ([cbf6003](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cbf60030f10ac271df933ebc2a5566a9d27ef283))

## [2.17.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.16.1...v2.17.0) (2024-06-11)


### Features

* **cssVar:** ✨ add --color-inverted-primary for text color above primary color ([86ef5ef](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/86ef5ef06d1cae1e777f221b1be50e009320cbd4))
* **overflow:** ✨ add overflow scroll button when using a pointer device ([55d413e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/55d413eeda6359ae802e9f3df495da3333c242fc))


### Bug Fixes

* **core:** 🐛 do not debounce scroll direction script ([ababe58](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ababe581864006e7d2ed0ec586f10ce02c8918a5))
* **core:** 🐛 incorrect opacity and color of icons in button ([8541b7e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8541b7ee8847c4e705d868e62533648480891e5d))
* **ooui:** 🐛 define invert color for progressive buttons ([670d214](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/670d21469ebd6ea1c8ef3155d91091268db9cfd2))
* **search:** 🐛 remove unused param from getRedirectMessage() ([d0e6842](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d0e684236eb77e3a0dbed100b251dd6a44054f72))
* **skinning:** 🐛 incorrect margin value for floating thumbnail ([0a8c49a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0a8c49a573a2793d257a6af28aaa9813b936eb44))
* **tagline:** 🐛 always return string from user tagline ([fe9c0f8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fe9c0f8674b043ac02797636209ffb563506bd69)), closes [#871](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/871)

## [2.16.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.16.0...v2.16.1) (2024-06-06)


### Bug Fixes

* **hooks:** 🐛 add missing article page icon on talk pages ([e372c4b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e372c4b7337d7ec580bfd568c77afcca69663c02)), closes [#867](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/867)
* **hooks:** 🐛 add missing icon for talk pages ([e9cdf04](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e9cdf04c22611d5d675b38211a65116a5cabd2e2))
* **hooks:** 🐛 always add editsection classes as string ([ea5524f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ea5524f9e2c07ad236a12e5cc334adc705669c88)), closes [#829](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/829)
* **hooks:** 🐛 use arrowPrevious icon for return action on talk page ([9556c44](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9556c44183293a91d5ffd1d3e536dfcaa8bd1003))

## [2.16.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.15.1...v2.16.0) (2024-06-01)


### Features

* **core:** ✨ add dismiss affordnance to dropdown menus ([d0691a0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d0691a06d0bddb031f1cc6af2cc418501d71d6f5))
* **core:** ✨ destructure surface colors into hsl variables ([c40c7c7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c40c7c7b841b606f168cba60b65fd0636d024c26))
* **core:** ✨ only handle wikitable instead of all tables ([83ab221](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/83ab2214088a68c99d6614c970d4582b22a1a3c4))
* **core:** ✨ replace checkbox hack with details and summary ([a2d3159](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a2d3159defcf57f2c4b151880536e91f3bc7b5b7))


### Bug Fixes

* **components:** 🐛 escape the contents of MediaWiki:Tagline ([4a43280](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4a43280242f33e54643087da4a7f40970d2640c9)) (CVE-2024-36123)
* **core:** 🐛 avoid using core mw.util.addPortlet for now ([a8daa82](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a8daa82354dec287c6a329b20c93fe1a35d2e29f))
* **core:** 🐛 check if page content model and whether the title can exist before formatting ([06d10b9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/06d10b99ce9573c9a47a17b956029e910442207e))
* **core:** 🐛 hide Safari details marker ([8751345](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/87513459c4eca1a1b268ac575df4ceba9ba0aae4))
* **core:** 🐛 incorrect classes and styles for page action cards ([621adff](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/621adff9fcad7e3385c68659c61e23a11b9f560c))
* **core:** 🐛 incorrect selector to disable search card animation on mobile ([87f15dd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/87f15ddd6df5eb9e15957fdb05ba0eac987fab1d))
* **core:** 🐛 incorrect software alignment on Special:Version ([a6abc3c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a6abc3c993450ef1073bb9806b92e235d5e51246))
* **core:** 🐛 revert max-width rule on installed software ([3b90a46](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3b90a46109b788f83ec7e122610e44f87fb031dd))
* **dropdown:** 🐛 toggle should dismiss the dropdown properly ([32d10f8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/32d10f893bdcbb590d9e45167919247239cfa1fd))
* **search:** 🐛 opening search card should not play animation on mobile ([151e51d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/151e51da2f2ff12d66da0c409cf40cdf71a7748e))


### Performance Improvements

* **core:** ⚡️ check for nowrap classes before constructing class ([2bbb1d9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2bbb1d9408f858b5418c7e598c707978814e2eaf))
* **core:** ⚡️ do not use will-change ([d8b3cad](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d8b3cad2256b819bfa2a7aaae0c1ce6b268e8440))
* **core:** ⚡️ do not use will-change (part 2) ([e9d7cc2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e9d7cc270ad9fa4fc243ec38a98b53c348522da1))


### Miscellaneous Chores

* **dev:** 🔧 add editconfig file ([c17e6a9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c17e6a977093b490cc66a495d1bbddbd4fb6789d))

## [2.15.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.15.0...v2.15.1) (2024-05-28)


### Performance Improvements

* **core:** ⚡️ consolidate citizen-menu card shared styles ([e95d3d3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e95d3d39bd52ca06b5d60073a99a17401b2c1601))
* **core:** ⚡️ tweak menu animation timing ([f74e3d2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f74e3d2f6ab875aabf8512db726d0d8024c49a47))


### Miscellaneous Chores

* **composer:** 🔧 use starcitizentools as vendor since mediawiki is disallowed ([defc1ce](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/defc1ced312565c751d7175585b1579b13939e38))

## [2.15.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.14.1...v2.15.0) (2024-05-27)


### Features

* ✨ improve scrolling performance ([27bca0f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/27bca0fc6624908f0294f14347238967147b1fee))
* **core:** ✨ add config to change overflow inherited classes ([974e6b2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/974e6b27508caf60116548f2342ebb49ae226e48))
* **core:** ✨ change overflow gradient to fixed size ([c3943ca](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c3943ca7cf639f47942491bd47cc11f927ee997e))
* **core:** ✨ rename wgCitizenTableNowrapClasses to wgCitizenOverflowNowrapClasses ([c17aeab](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c17aeab3fd7ae5afdd3f9e1d591c35696a9f1f4b))
* **core:** ✨ wrap any elements tagged with the class citizen-overflow ([4ed68a9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4ed68a924d54a40716933a77736be84485f69c7c))
* **TabberNeue:** ✨ add init styles ([45ee5f8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/45ee5f897c6f17df8479600319fef5181b72d4b2))
* **TabberNeue:** ✨ update Tabber styles ([be01d5b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/be01d5bb6c920108a9cdcb186d6dc2ddfb0aa0b2))


### Bug Fixes

* **core:** 🐛 always reset overflow state ([7b32aee](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7b32aeec7d1753574472114ef8d271c5abe5f83f))
* **core:** 🐛 escape double quotes for toc selector ([ae6d207](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ae6d207fb4d42601e78a51c8d721e00a0c2ba046))
* **core:** 🐛 fix incorrect overflow wrapper class name ([bc356f9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bc356f915de50d7e7a6dc4a1b8fac1e392cdd614))
* **core:** 🐛 incorrect sticky header class assignment ([af3d72a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/af3d72ad7501f5329b18bf90f6e4aaa8cd58085e))
* **core:** 🐛 remove table border expansion before the JS is loaded ([cb1cfde](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cb1cfde785e00112843128e554e9177bece78c73))
* **core:** 🐛 update overflow config name in skin.json ([c1582a8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c1582a8ddcf70d440cca9dfa12be76d7bf8b982a))


### Performance Improvements

* **core:** ⚡️ further improvements to scroll and section observers ([e9289b1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e9289b149a70783ed2f6596bd7d2d7563f0cf0d9))
* **core:** ⚡️ only toggle class when the element is overflowing ([523140f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/523140f62f2ce412937f9217dd502c4aca4ce343))
* **core:** ⚡️ remove scroll eventListener and resizeObserver on tables when not needed ([7a4d433](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7a4d43392d60a816be5b441cac74655c0dae0775))

## [2.14.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.14.0...v2.14.1) (2024-05-25)


### Miscellaneous Chores

* **release-please:** 🔧 add manifest and config files ([cc4e7b1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cc4e7b1d85a41a81fe49e9dda53a747584449165))
* **release-please:** 🔧 fix config file name ([0ed940c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0ed940c7e41f6d3fbcc09cc72331a9b5955e50d9))
* **workflow:** 🔧 check if condition earlier ([6c996b7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6c996b7fff8b6f0913c14e8b4ad9bc5829756a25))
* **workflow:** 🔧 only trigger PHP tests when PHP files are changed ([d6e996b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d6e996b09fef4c1e8aae61d1b6b08567690b5cbe))

## [2.14.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.13.5...v2.14.0) (2024-05-25)


### Features

* **components:** rewrite template data partials into CitizenComponent components ([#846](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/846)) ([03da361](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/03da361b9700faf9f1843018eefb38bb47e84f49))
* **core:** ✨ tweak dark theme color to be darker ([a193d14](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a193d14de7b6728774231d8a37750a70682cc089))
* **mediawiki:** ✨ tweak login and signup page styles ([cae19d7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cae19d7a3020c6181f74f54e5c0cf6086165a7c0))
* **TabberNeue:** ✨ update TabberNeue RL module name ([d7f6c0c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d7f6c0c53e3b8e4dc534d9784f5409bf061594fb))
* **VisualEditor:** ✨ hide less useful buttons when width is limited ([820d612](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/820d612eaff26caffd3745f63ce3b9359136a04a))


### Bug Fixes

* **codex:** 🐛 target new codex style RL module as well ([27eac2d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/27eac2da9572b37623e0e856c36cd5d3bc6420a7))
* **components:** catch MalformedTitleException in titleFromText ([0006db6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0006db65a20f31c07a640fe5a0fbf2b485df392f))
* **core:** 🐛 do not hide view button on revision page ([9969479](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/996947993859a8ddac6943904eb9693851085624)), closes [#845](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/845)
* **core:** 🐛 incorrect label text when edit count contains separator ([c5e8c2b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c5e8c2bfc864c00f668aef78aa1aeaaef8dc240d))
* **core:** 🐛 incorrect section selector ([685901c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/685901cce3a51c5b574a0c56f26bfd214738c4e9))
* **core:** 🐛 incorrect try catch block ([d4d71dc](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d4d71dc34a7300176f185d50a8742fcd160f5147))
* **core:** 🐛 only pass string into str replace ([84a65a3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/84a65a303b86bfe665697b911e1d647f8d55c3ec))
* **core:** 🐛 pass namespace key as string ([f781773](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f781773cbaba9e3ac49610e11daed8e6b084a6d9)), closes [#849](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/849)
* **core:** 🐛 turn message into string before str_replace ([e5fef2a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e5fef2ac09cb61089dc2edf7bd5bff17d4691394))
* **core:** Rename Usermenu.less to UserMenu.less ([c09b82c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c09b82cb07913be5e7243c5eca0869a3007bc3b6))
* **mediawiki:** 🐛 overflow signupstart container ([b922505](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b9225057a786ac3c7b283660769c2a871adaf5a3))
* **search:** 🐛 label can sometimes contain HTML ([b946056](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b946056c13bb3bfd8e3842bab473ab97ce82198b))


### Miscellaneous Chores

* 🔧 add release-please action ([c72a25b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c72a25b02744823615b8ba0f8713707b5db897c3))
* 🔧 drop JSdoc as it is not being used ([b10c1a8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b10c1a8fc2141a07128c7e9a6d3db9983d12d03b))
* 🔧 drop standard-version in favor of release-please ([488f655](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/488f65519c10511379964a256a34c26f492cd0c0))
* 🔧 set release policy to PHP ([2b15ff8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2b15ff8d1147f0fae83d95e2369fa3d0a68d8ce1))
* **dep-dev:** 🔧 remove svgo as it is not used ([0eb9a8a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0eb9a8a7d1dbbd6bc16080f80ec15af1d4207ea0))
* **deps-dev:** bump grunt-banana-checker from 0.12.0 to 0.13.0 ([#847](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/847)) ([18676da](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/18676da2d495fc0da83cd2fb3abc241ea58a9718))
* **eslint:** 🔧 use wikimedia/server for root folder eslint config ([4762102](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4762102d616bce2095d1912e735cf5594191594c))

### [2.13.5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.13.4...v2.13.5) (2024-05-09)


### Bug Fixes

* **core:** 🐛 add missing styles for user menu ([604ee85](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/604ee851d699fe82b3c086a5ebaa79343a9136b9))

### [2.13.4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.13.3...v2.13.4) (2024-05-09)


### Features

* **core:** ✨ add last modified to sidebar ([89b5ff1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/89b5ff1b127ba805106c4bb5006dbd42c748aff3))
* **core:** ✨ only show date in last mod sidebar ([c2c95f0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c2c95f0fdae938f18a10c89e0f6ab1f18b2aa021))
* **core:** ✨ simplify toc styles ([0aa6172](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0aa617262e88f9139f31b52e77658d74cf192da1))
* **core:** ✨ tweak black theme color ([226fd0a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/226fd0a60607b328f28fccea90c71376c69c1e25))
* **core:** ✨ use relative time for sidebar last mod ([f2393a7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f2393a74b84e0f7cfb89843dc0e9ad5bc42c6eef)), closes [#700](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/700)
* **VisualEditor:** ✨ better responsive toolbar handling ([a1e76bc](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a1e76bc195e1b1992c37d204ab7c4f57b47088ea))


### Bug Fixes

* **core:** 🐛 add missing var ([049366a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/049366aaa99b99bcbc6e165462e66e48631d5630))
* **core:** 🐛 hide sidebar lastmod on tablet ([ed54bbf](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ed54bbfc3337fd879c6fc4529ebd5d22801fd86c))
* **ooui:** 🐛 only define border color instead of other border properties ([4d81dff](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4d81dff7fe82899e296abbde459b8fc6d11f3d23))

### [2.13.3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.13.2...v2.13.3) (2024-05-06)


### Features

* **Cargo:** ✨ add icon to purge button ([3aba632](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3aba6323824bed4368d29f59052727b591f2ac9f))
* **CiteThisPage:** ✨ update icon to align with master branch ([3eab91c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3eab91ca07b1374024f02fb6eb9c45b13f366510))
* **core:** ✨ enable caching for inline JS ([5d59a6d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5d59a6d3c0ee46f9b3362b4499c82aa51f3a11f8))
* **core:** ✨ remove scrollbar styles ([4558da3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4558da3a0d24affeebddea34de230ba9791c6357))
* **core:** ✨ switch all icons to OOUI module ([58bab74](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/58bab74eab887b7c5521681d34c7559c4dff65fa))
* **DiscussionTools:** ✨ add icon to page subscribe button ([9f3b7dc](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9f3b7dc178847d96124e3a8eb7027b6621a92e6d))
* **DiscussionTools:** ✨ update header styles ([960dcef](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/960dcefe69f463e331159fcf93a3e79251e57027))


### Bug Fixes

* **core:** 🐛 avoid sticky toolbar from clipping on Firefox ([1d4cdd6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1d4cdd60df1b7105ac8dfd55ad06e6bd225a63e6))
* **Echo:** 🐛 re-implement nojs Echo buttons ([76a93e9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/76a93e962fde8ecaf1cf65fd1caaa1068c094d76))
* **VisualEditor:** 🐛 disable VE icon skin ([9a403ee](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9a403ee44a39e6a1db4002264ab97efb85b2cbc5)), closes [#839](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/839)

### [2.13.2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.13.1...v2.13.2) (2024-05-03)


### Features

* **core:** ✨ align footer links to the end of the footer ([3566e9c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3566e9c919b53a4cbecaff740199bb72de16a5b4))
* **core:** ✨ allow drawer menu to expand in smaller screen ([5a5b4aa](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5a5b4aab0b2b9936fd9da0893edf7e3c46a1d82f))
* **core:** ✨ change primary action links in user menu into buttons ([ffa7d76](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ffa7d76df44ad1b45c34b7ae585a83367f71ee58))
* **core:** ✨ enable menu link text wrapper ([edfb58e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/edfb58e18904d58f993f388d029a8deb978fb740))
* **core:** ✨ increase border color contrast in dark mode ([efa27a5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/efa27a59c6fae3cb4540c7a4cebe1ba57322ea9d))
* **core:** ✨ render Echo icons in skin instead of js ([4f9ded3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4f9ded3c357e36241c1a9d64110d22c2738288d1))
* **core:** ✨ tweak personal menu spacing ([205cee2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/205cee23db40d233b8aaa8c80bc3d90373f0309c))
* **VisualEditor:** ✨ enable edit button icon for MW > 1.42 ([2c16975](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2c16975493ee4633b4fed4b1d04566f12f3100c0))


### Bug Fixes

* **core:** 🐛 declare missing support for user-interface-preferences menu ([642664e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/642664e9a8ede9aea59bacc98235601339aeb3c8))
* **core:** 🐛 incorrect font size for sticky title parenthesis text ([71ef6b7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/71ef6b7a30a951c537bc641d9b5d731e4171b0d7))
* **core:** 🐛 stricter match for title parenthesis ([0015743](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/00157436a5aeda3c733e665b7d7d5d967948001d))

### [2.13.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.13.0...v2.13.1) (2024-04-28)


### Features

* **core:** ✨ add overflow handling to site and content sub ([354ae25](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/354ae255f781f17addf5b499000288ddf32b039a))
* **core:** ✨ add qrcode icon to urlshortener in toolbox ([358f172](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/358f17254276fcf5d12d68d410d3b3f77edbf6cb))
* **core:** ✨ add wikidata icon to wikibase in toolbox ([1997f12](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1997f126c06b50dc9a96707112621b7d08616459))


### Bug Fixes

* **core:** 🐛 add missing file associated page icon ([a09e5e0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a09e5e0b34af8d87f15aab0bc24494b240affa98))
* **core:** 🐛 apply addDefaultPortlets separately ([59fc003](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/59fc003294f271cb88a94676d9878a6a451943f9))
* **prefs:** 🐛 incorrect function call for addPortlet ([99fe5f9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/99fe5f970e84996b8672081293a6a454cb4539ca)), closes [#832](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/832)
* **prefs:** 🐛 incorrect function call for addPortlet ([4bc4301](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4bc4301f90b0f1b9c45f8d20071cfce3ee2177ca)), closes [#832](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/832)

## [2.13.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.12.0...v2.13.0) (2024-04-26)


### Features

* **core:** ✨ add pure black mode for dark theme ([5768ccc](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5768ccc25b57e4c2677a99ebad242a10cef00391))
* **core:** ✨ add transition to body-container width ([8f565b3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8f565b33b320e6a414d0de71a502a7bf48730e2e))
* **core:** ✨ fine tune bottom toolbar animation ([1dcc18a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1dcc18af60c775c32f7d01cf21c53cd644d1408e))
* **core:** ✨ make sticky header more compact in limited screens ([a5bf941](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a5bf9413eac05d96bb6f0ed2362453a147582c85))
* **core:** ✨ move page actions into bottom toolbar when width is limited ([ff909e2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ff909e240d6bf82ca93ca825dd63e44f2d170f43)), closes [#821](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/821)
* **core:** ✨ move theme preferences to clientPrefs ([a741639](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a741639085d70c22a9f49890542a142a223bf981)), closes [#780](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/780)
* **core:** ✨ only load the inline script if EnablePreferences is true ([52f4bab](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/52f4bab1a55c933b593358da7cf0bbedf466c5f3))
* **core:** ✨ reduce opacity of sticky header ([b186efb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b186efba69aa10f26bc97e36da8e569dc2ce1acd))
* **core:** ✨ tweak pure black mode colors ([56046d7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/56046d7e58f7b71a340da2228442550c27a247ed))
* **preferences:** ✨ implement a localStorage version of mw.user.clientPrefs ([ed226a4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ed226a400e70c8680411025114ef0e1c61bb3496)), closes [#780](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/780)
* **prefs:** ✨ add hover state to theme buttons ([b929c2b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b929c2b7eb1092771bc2cd6c86decb862f7e1d95))
* **prefs:** ✨ change theme toggle to 3 col ([316798d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/316798dd57fc90adc7c7ec20a41f1dc0312736ae))
* **prefs:** ✨ migrate font size to client preferences ([0d52046](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0d5204652357cfb45f7351aa9586c1a0c06b7f50))
* **prefs:** ✨ move font size before theme ([f6f1c4d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f6f1c4d1c4ea38d6977ac0101304f384e7077fc4))
* **prefs:** ✨ move page width to clientPrefs ([241dc96](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/241dc96cfe4bbd8fa261db64259eb9eb279e7b97))
* **prefs:** ✨ remove line-height customization for now ([964a4a5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/964a4a534d3ed29b557980951e8072cf9ef2fcee))


### Bug Fixes

* **core:** 🐛 hide notification menu header in header ([e5af171](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e5af1717bded813d0045915efdd2003a1a493c63))
* **core:** 🐛 incorrect class of auto theme on page output ([405eef0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/405eef0b9a8b3bf6b7d6b87828ddd3435494a7ea))
* **core:** 🐛 incorrect delimiter in inline script ([4aefd74](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4aefd74429cb4b202935bff76cce74fd9be30ce3))
* **core:** 🐛 invalid selector ([8bb2d9e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8bb2d9e76de71e6cd9f9a98b81ac9daaeed05f6d))
* **core:** 🐛 make ToC tracking work for non-content pages ([cd21fd0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cd21fd05f3063b1c55e0dc5231c4176601c0972d))
* **core:** 🐛 remove leftover console log ([c2aa796](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c2aa796b68894948f3309fa0906e63adfc6270df))
* **core:** 🐛 remove margin when contentSub is empty ([0a0a663](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0a0a6631b08e3af73db284c7528105b241802cab))
* **core:** 🐛 round scrollLeft to integer ([d9675eb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d9675ebd606745902a39fa9e135ed10d37ca36f3))
* **core:** 🐛 use runOnSkinTemplateNavigationHooks instead ([ff3acf3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ff3acf3b71466c4427021811290271faf6fb1de6)), closes [#812](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/812)
* **ooui:** 🐛 load skinStyles when only styles are initalized ([4aa7a22](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4aa7a220eff62686b8e7fb27ffd78fec9ea6300e))
* **toc:** 🐛 CSS escape ID ([9cd0cc4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9cd0cc45f39498a547c49796a1d4c08ea3d8f407))

## [2.12.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.11.1...v2.12.0) (2024-04-19)


### Features

* **core:** ✨ increase line height for CJK text ([6b6dc5b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6b6dc5b26992995def7d928001000723dbb4286e))
* **core:** ✨ proper em handling for CJK languages ([6dd0f09](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6dd0f09aca3621998c5efce2b6c700f5bb9c846c))
* **core:** ✨ rename border-color variables and increase contrast ([fc47692](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fc47692421f6332032ca479774c68921d2a1f9a4))
* **core:** ✨ tweak light theme colors ([a3e060b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a3e060b90c8e8b1d7b6375f24c51f29369a4c84c))
* **PortableInfobox:** ✨ clean up header styles ([756c87d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/756c87dad72b04f55ea6c5b78738eb6301d623d2))
* **SMW:** ✨ hide entity examiner indicator ([5d8ba9f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5d8ba9f7b10e12ac1b4cdef5530f9ba0cad26465))
* **SMW:** ✨ tweak browse property font size ([7aef0c5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7aef0c5a50a68d09dfd6800dbf1df11738d00dbb))


### Bug Fixes

* **core:** 🐛 hide section indicator unless explictly enabled ([d820947](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d8209474901c90132c2ceddc7f26505d0f10427a))
* **core:** 🐛 incorrect selector for SemanticResultFormats datatables ([84cf306](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/84cf306df1479737f0608f6f58323f4e06681fea))
* **mediawiki:** 🐛 image clipping in packed gallery ([44e7af7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/44e7af78bd71d7f88aeb6b173e70dc7278d59113)), closes [#822](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/822)

### [2.11.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.11.0...v2.11.1) (2024-04-06)


### Features

* **core:** ✨ backport valign styles for images from 1.40+ ([fdc22e4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fdc22e4ce5aa419cc22a65a9c14fdd17cd11a57a))
* **datatables:** ✨ completely hide disabled button for search pane ([e72c460](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e72c4603918472f533c4ee9aa44c5ae33d9b0e55))
* **datatale:** ✨ add scroller styles ([3fcd46d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3fcd46dfc203f1dae9a0bb8c7342b0125cb1c6b6))


### Bug Fixes

* **core:** 🐛 select dropdown menu background ([7fda126](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7fda12693de0ddcbe36853ff1e29f0a017979522))
* **dataTable:** 🐛 do not wrap dataTables_wrapper ([a395e8d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a395e8dd8175a211e57e19610a3b816befd7145e))
* **datatables:** 🐛 minor style fixes ([4e236b3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4e236b393d2083b4ebb9e5b2d515e7ae14ddb634))

## [2.11.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.10.1...v2.11.0) (2024-03-19)


### Features

* **core:** ✨ implement new light theme ([54ca25f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/54ca25fa277878f8f778ea4b9454d68422b762dd))
* **datatables:** ✨ add basic styles for search pane ([b7df8c9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b7df8c9e61b8f0485d2508223e404bb278c46c85))
* **datatables:** ✨ rework search pane and filter styles ([84abe5a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/84abe5a71ccf329a1aea74cbf1fd7afe1cbe975c))
* **datatables:** ✨ sync styles with wikitable ([a85ecb5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a85ecb524e9729a0c652f085959e338d9c628a29))


### Bug Fixes

* **core:** 🐛 remove loading indicator when page is unloaded ([21ce85a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/21ce85a3208a0a290b3350a5e0a2f665c93d4a17)), closes [#811](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/811)

### [2.10.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.10.0...v2.10.1) (2024-03-11)


### Features

* **core:** ✨ increase top margin of content footer ([75548a9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/75548a9bdf3f1594320e31e2da013393bb3838a6))
* **core:** ✨ reduce menu header font size ([1106825](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/11068251c2bf043889f4efdfeb9963f9bfbbcc9c))
* **mediawiki:** ✨ tweak styles on Special:Version ([3a62b5f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3a62b5f01d50ef022c32225b2a6eff5a41abb0c5))
* **toc:** ✨ tweak toc header font size ([cb1f9e6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cb1f9e616a3df6b05af345c107d0c36bd78b9b4b))
* **VisualEditor:** ✨ improve visibility of text highlight colors ([8de5b3d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8de5b3d39ee7011757a84d18e81b75e0ac2e412f))


### Bug Fixes

* **core:** 🐛 file page sticky header overlapping TOC ([9cf358f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9cf358fe9bed87bb1c49ab818b1e2c11dd93213e)), closes [#797](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/797)
* **Echo:** 🐛 missing styles for new talk page alert ([b90dd3d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b90dd3d2c6d87282763f9495ddd984e3e5101c4d))

## [2.10.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.9.1...v2.10.0) (2024-02-26)


### ⚠ BREAKING CHANGES

* **core:** 💥 ✨ rework font-size CSS variables

### Features

* **core:** ✨ override font-size-related skin variables ([3f44789](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3f44789ac6f1ea931e19a06731ddfe39d5ca6697))
* **core:** ✨ use CSS variables for small font sizes ([c9f665e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c9f665ef7805302d17e6e792f188a94a9677705a))
* **core:** ✨ use CSS variables for x-small font sizes ([3162e19](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3162e19a2c34828803bdc76755d32e8d9462752f))
* **core:** 💥 ✨ rework font-size CSS variables ([a9acc08](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a9acc08e273c9e1684fd0ba6db3f862bd88f8845))
* **gallery:** ✨ increase margin for gallery ([bba8398](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bba839819faeab0da9e99497a6a5d453611fda35))
* **gallery:** ✨ use flexbox for packed gallery ([2972726](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/29727263c83fa58b4093d5613e8966e7bad41d96))
* **Scribunto:** ✨ tweak debug console styles ([6947105](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/694710521736fd1c8f4f59a60aea67157bf5702e))
* **wikitable:** ✨ add border to wikitables ([9bd23fd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9bd23fdff26e4de7037710a3f9e42d92d46b4b54))
* **wikitable:** ✨ simplify wikitable border styles ([b6872f9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b6872f9d2a128c84330e1bb609c21fed37a48eee))
* **wikitable:** ✨ use the same font size for th and td ([c13fd3e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c13fd3ea3eef5a14d647ea4be177588634e029c8))


### Bug Fixes

* **CodeMirror:** 🐛 rename VisualEditor RL module ([ea5c10a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ea5c10a6c344bcbb0a20fdbdaa9ab7d16d0cbd48)), closes [#781](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/781)
* **gallery:** 🐛 misalign gallery caption ([c9f6ec6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c9f6ec6d599fcfd8dff617b0dfe9723d541c1f65))
* **Scribunto:** 🐛 incorrect font family ([fc0f469](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fc0f4699aaca9d337ad6398963299b7299fc21cf))
* **VisualEditor:** 🐛 add find and replace dialog background color ([3396cfd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3396cfde123764156210821d53d35b2047b52714)), closes [#794](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/794)

### [2.9.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.9.0...v2.9.1) (2024-02-04)


### Features

* **ar:** add support for Arabic fonts through Noto Arabic ([#755](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/755)) ([e985f86](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e985f863bc00c2158fc87f45884efc13a3b92478))
* **core:** ✨ revert new RC styles ([2a41a0b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2a41a0b1bb5ee6ba3d4745a6105e3a9f3565f29c)), closes [#764](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/764)
* **core:** ✨ use CSS variable to define default Citizen font ([5e575f4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5e575f4c201302b34d6d8dd1704e62654b82c1de))
* **DarkMode:** disable dark mode extension ([#777](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/777)) ([cabd2b9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cabd2b9c78c1bc33b716b8f7937362075d530186))


### Bug Fixes

* **core:** 🐛 deprecate more old ResourceLoader classes ([3a73bdc](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3a73bdc64076c5fbf5caba5055aa4cf7d1b5a697))
* **core:** 🐛 hide pseudo elements instead of deleting them (pt2) ([bdd986d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bdd986db8995babd833160e420e3121e729cbfee))
* **core:** 🐛 typo in skin module classes ([43348d2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/43348d248e88304e5453a805d7f8a0ff8e716768))
* **core:** deprecate old ResourceLoader class ([#784](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/784)) ([9dc952b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9dc952b91702c5998597edba48522adb18b9b885)), closes [#783](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/783)

## [2.9.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.8.5...v2.9.0) (2023-12-14)


### Features

* **core:** ✨ clean up skin variables load order ([f1ddf32](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f1ddf3206b0a5e77cb2ff5538039b5986f63ce97))
* **core:** ✨ make changelist item more readable ([e0f9ac1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e0f9ac1be31ecf2862f63cd00a5a4c0173d853da))
* **core:** ✨ prefer Roboto over language fonts ([b134fbf](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b134fbfec53a30b306c5bf708a8bd85b6c9663ad))
* **core:** ✨ replace breakpoint LESS variables with Codex tokens ([60999eb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/60999eb1d97abfb933ea5332fcb612746d6b30cb)), closes [#735](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/735)
* **core:** ✨ use CSS variable for language-specific fonts ([eee044d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/eee044d1451a2268d876e884353a1a3612ec4666))


### Bug Fixes

* **core:** 🐛 check for read access before attaching manifest ([0da7d8f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0da7d8fe33b8433447fe768758bf56449636b46e)), closes [#747](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/747)
* **mediawiki:** 🐛 add missing preferences styles from 1.41 ([40fffd6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/40fffd610787c6cccf3d2dc4e451590d55732807))
* **toc:** 🐛 incorrect breakpoints for ToC ([21f7cc4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/21f7cc40015d56e53dc5ce976bc8b4052cd6aca4))
* **VE:** 🐛 do not invert image in link preview ([109779c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/109779c84ca31285f8455c331ee573e35b41363e))

### [2.8.5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.8.4...v2.8.5) (2023-11-16)


### Features

* **core:** ✨ remove top margin from siteSub ([47d06bc](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/47d06bc13939615fb9d27803738ce15c933aa816))
* **core:** ✨ remove unnessecary style from siteSub ([92f0692](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/92f069208e3a41af2d921346bf963005ca9eeda1))
* **search:** ✨ turn search actions into chips ([b0f89ba](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b0f89ba311f87f96d3ccc36b24452e372a35f463))


### Bug Fixes

* **core:** let makeSections xpath query cope with multiple classes ([#733](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/733)) ([6f5b761](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6f5b761fe7880a6fe48a1c4e0ebc92efd54bd050))
* **ooui:** rounded button corners in save changes modal ([#736](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/736)) ([906c1fd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/906c1fd6ac584c4bad732382e3a68429ed35cdbc))
* **search:** 🐛 chip text should not wrap ([071a58a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/071a58ab7473fa3a156efb7db63a92d7e2a3ffab))

### [2.8.4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.8.3...v2.8.4) (2023-11-03)


### Bug Fixes

* **core:** 🐛 check for mw-heading wrapper first before mw-parser-output ([672740a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/672740a23ad0c86589893a56f77f69792613782e))
* **core:** 🐛 hide loading indicator when user clicks back button on browser ([201a38f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/201a38f93f7e57b605fd2de297f4bdc2d48fdc54)), closes [#718](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/718)
* **core:** RTL flipping of the progressbar animation keyframe ([#723](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/723)) ([456b75c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/456b75c1b19b71f1008591f07d9fef065176a626))
* **toc:** 🐛 incorrect layout when ToC title has multiple elements ([2c10335](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2c10335ae3080364d83a807fe4dd72b8a6493d50))

### [2.8.3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.8.2...v2.8.3) (2023-09-11)


### Features

* **core:** ✨ prefix citizen section classes ([2f40541](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2f40541bc43d70b73337882971308746ec07d076))
* **PortableInfobox:** ✨ reduce paragraph margin to be similar to Vector ([7b63d86](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7b63d8637ed610a3ed726e46af9b9a9f9adfc2a3))
* **PortableInfobox:** ✨ sync border color ([2d99879](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2d99879ce3147e87e22234ad375ad6bb66913cc5))


### Bug Fixes

* **core:** 🐛 do not wrap diff table ([f38e6bb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f38e6bb120f64c38001ccb6de07da99c8c8f1b03))
* **core:** 🐛 stricter selector for collapsible header ([a6a9fe2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a6a9fe27e40834131a805385e269b68adb7339fc))
* **core:** 🐛 stricter selector for collasible headers in formatter ([45a726d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/45a726d77f4ad7c3dbc82c4ff00ff3e716cb5c04))
* **search:** 🐛 search icon clipping ([68dc715](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/68dc7151388291b7ca49fded3ed547e2b66acd40))
* **search:** 🐛 show presult during init ([2a2d6e3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2a2d6e381fa4e27cceb7c733fc23c22dd75eb264))

### [2.8.2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.8.1...v2.8.2) (2023-09-06)


### Features

* **search:** ✨ add missing border between placeholder and group ([2d54cbd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2d54cbd9307d7fc809ec6c410936313c995cc53f))
* **search:** ✨ add suggestion to edit page ([3d31d08](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3d31d08021e71f75aa3749eeefd66cb7600785bb))
* **search:** ✨ only add divider between groups ([9280e7c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9280e7c4a80cf001ba891c70cb9d464486cc4021))
* **search:** ✨ only add divider between suggestions and footer ([96cf5be](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/96cf5be48c9535901afe62d710142d443fd43db7))
* **search:** ✨ only change search input font size for mobile Safari ([cb02307](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cb02307cda0d8c4c0ce1590bfe874c7a547c2027))
* **search:** ✨ only show edit page action if user has rights ([6f3d82d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6f3d82de046f02d7e2ff6a1268f4064ae027f165))
* **search:** ✨ reorganize DOM structure of the typeahead ([1f0a2e5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1f0a2e5133ada37fb25eac267185fc538be1e51e))
* **search:** ✨ strip wikitext link syntax in search ([0c0f4f4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0c0f4f4ffb892318e06f7fe000188afb9a6f0d8b))
* **search:** ✨ various tweaks to typeahead styles ([969f4f0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/969f4f0d3d64a1db824bb3bbdaef687f8583779f))


### Bug Fixes

* **core:** 🐛 fire input event when search query is cleared ([325f22f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/325f22f0ddd767e86c77037488ffdd3427c9e3a4))
* **search:** 🐛 incorrect thumbnail icon width ([3104280](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/31042804dfba860cc624556af0652de29551438f))
* **search:** 🐛 make search input selectable ([e8f33bd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e8f33bdf93241f6ea0ae80d803fb0b2d3fafdc25))

### [2.8.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.8.0...v2.8.1) (2023-08-26)


### Features

* **core:** ✨ use quiet hover color for menu items ([96f6361](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/96f6361851d4cbb048ef86c6b99cf497c90767ec))
* **search:** ✨ increase description extract character limit to 100 ([853e9a9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/853e9a9190330796965757655a91bbd63a80dbdb))
* **search:** ✨ search template namespace when template syntax {{}} is used ([2f2dc33](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2f2dc3328c68ef3ba6d1ea3871c5791ba9947650))
* **search:** ✨ use square aspect ratio for suggestion thumbnail ([042f2bf](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/042f2bfbba0e90f1eb9df98a81b66fd6570c417f))


### Bug Fixes

* **core:** 🐛 catch IntlException for NumberFormatter ([1cfe3cd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1cfe3cdfc82f038ca2605fb0dfa9c2a9a0e299e6)), closes [#474](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/474)
* **search:** 🐛 search history URL should not force fulltext ([2c1940c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2c1940c4bb89b03b83e8b732f315e5d2fcbf6394))
* **StructuredDiscussion:** 🐛 merge skinStyles into the same RL module ([cb5f4a0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cb5f4a065b82445aaf8bc0b01a08afb93d156207)), closes [#711](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/711)

## [2.8.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.7.11...v2.8.0) (2023-08-24)


### Features

* **core:** ✨ reduce space between section indicator and title ([c8ba546](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c8ba546be802913347ac0341bad892f0ebd98137))
* **core:** ✨ tweak more menu spacing ([dc9f6f0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dc9f6f034cf1b1270d2ed6a83c4ca2fc1730cd81))
* **search:** ✨ add search history to initial state ([f6d3fc9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f6d3fc95e3bb59234b55b3f8c5d2a57e80658312))


### Bug Fixes

* **core:** 🐛 bump search input font size ([122819b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/122819b67e7d5f92edf547159d30643529c914a5)), closes [#513](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/513)
* **core:** 🐛 increase search input font size to 1rem ([07aa883](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/07aa883195f26752c3bf0e1448922f151da720d0)), closes [#513](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/513)
* **core:** 🐛 only increase search input font size for mobile ([87886b3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/87886b39a03796d6289b12fdd304b8bf1c96724f))
* **search:** 🐛 do not add empty term to search history ([bd41516](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bd41516190a17dc4ab6bde26214944148e9dbe4f))

### [2.7.11](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.7.10...v2.7.11) (2023-08-07)


### Bug Fixes

* **core:** 🐛 incorrect value for aria-controls ([29d0f4b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/29d0f4b1fff448563c74297a2aa4441d704417d2))
* **core:** 🐛 remove duplicated id for toc label ([81288a7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/81288a76c88fed60ace802053d29679dca3b6b25))
* **search:** 🐛 avoid double escape for equal sign ([b015647](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b015647cc689e422fcfdd80b94ae9c0b25e3fc0b))
* **search:** 🐛 ensure that onFocus event are properly fired ([9921a00](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9921a00c17643304a7db4b28a9a66c505a4abe1c))
* **search:** 🐛 incorrect SMW search result mapping ([0281037](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/028103799e1946f8f2f76e76d34889e90720a0cb))

### [2.7.10](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.7.9...v2.7.10) (2023-08-04)


### Bug Fixes

* **search:** 🐛 handle multiple redirect key in Action Search Client ([0dd3a82](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0dd3a82c06960cb7e1ab5da43c84e367c9031eb4))

### [2.7.9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.7.8...v2.7.9) (2023-08-04)


### Bug Fixes

* **search:** 🐛 always set label for search clients ([6fb2b1a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6fb2b1aaf911f2b46ac3e93e0fc93026a1451b48))

### [2.7.8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.7.7...v2.7.8) (2023-08-04)


### Bug Fixes

* **search:** 🐛 avoid double encoding conditions and printouts ([4b1a39e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4b1a39eb1cb65d64528060851a71685a38b469b1))
* **search:** 🐛 undefined wgScript config ([69163be](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/69163bee5571561bc7806ef3722e05544d844612))

### [2.7.7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.7.6...v2.7.7) (2023-08-03)


### Features

* **core:** ✨ adapt typography to user preferences ([0afb40f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0afb40fc869359919035a403d4e8832bb8b0e9ce))
* **FlaggedRevs:** ✨ add styles ([dad90d3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dad90d38f25cfa29cabc3223e18c59732a026774)), closes [#701](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/701)
* **search:** ✨ reimplement multi search command experiment ([eec5c6f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/eec5c6fd645bfebe28130b9af172087906320f9e))
* **search:** ✨ reimplement SMW Ask API search ([51db199](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/51db19938cdb4e9583ff755aafa13dd715cb0a13))


### Bug Fixes

* **search:** 🐛 exit early if there are no query results ([4241f85](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4241f8522db780e33b787716d248acadb9340eaa))
* **toc:** 🐛 add null check for link ([e866edc](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e866edc3a5a924ca40664a275f86fee92028ef10))

### [2.7.6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.7.5...v2.7.6) (2023-07-30)


### Features

* ✨ add support for source element in thumbnails ([4f19de3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4f19de3b621e375ec0da3868d0b95c9b9dfff517))
* **CookieWarning:** ✨ update banner styles ([67bb0c1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/67bb0c118d598794419480892053f62e5ec3f4b9))
* **core:** ✨ add overflow handling for citizen inner header ([fab4d27](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fab4d272738ebec01a83369c0a6a46fdc18e9fb5))
* **core:** add overlay transition to header menus ([2f64346](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2f64346c25bd7b1a296da9f9d912ef463dc87c1d))
* **MediaWiki:** update bad file styles for bad image list ([#697](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/697)) ([f0f0a07](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f0f0a07121cb94149af5f41cda8589bd60ad0bfd))
* **toc:** remove background and color transition from top link ([c14889f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c14889f8c02101fa74587438c8beac10ddbf59b8))


### Bug Fixes

* **core:** 🐛 add missing hover styles for source element in thumbnails ([4e931f6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4e931f6812fecbb4627dbf32bb7f63ecab990c77))
* **core:** 🐛 incorrect selector for menu backdrop styles ([65fe56d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/65fe56d2ac3ea9c40e43a54db5c87396cfbb37a4))
* **MediaWiki:** break down long filenames for broken files ([#698](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/698)) ([6e44db8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6e44db80ef07f213830d5cace69a889057a32fe7))
* **VisualEditor:** don't merge edit buttons when JS is disabled ([#696](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/696)) ([69a6350](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/69a6350de3bbb8f0a847a2fbec75aa43c4f77076))

### [2.7.5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.7.4...v2.7.5) (2023-07-17)


### Features

* **core:** ✨ remove expensive CSS animation ([85f036c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/85f036c2f88750c66aeab9374cc58feb18d9d6cf))
* **core:** ✨ sync input styles with Codex and OOUI ([a6bc1a8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a6bc1a8d4beeb0d239c9c4bca53a56bf63cd88a3))
* **MediaWiki:** ✨ light up changelist dot on hover ([4cf9417](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4cf9417c5dd91301a7d71145f6c0d3373da6149f))
* **SemanticMediaWiki:** ✨ add datatable styles ([8cfa260](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8cfa260997b86200a7a8455de24a957b3cd985f5))
* **SemanticMediaWiki:** ✨ tweak SMW datatable styles ([ab70217](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ab70217b26233f57708c898f930fcca052f579b0))
* **SemanticMediaWiki:** ✨ update datatable filter focus styles ([e7ef543](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e7ef5431a2dd58789a9763a17c8b5bfe3b49ede9))


### Bug Fixes

* **core:** 🐛 deprecate User::idFromName ([8605c6c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8605c6c6dc23de4a6f71f77bb153454147df41be))
* **core:** 🐛 enter key should not clear search input ([739fa85](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/739fa8504cd313235d9d6e63edb3de3bd6305a2e))
* **core:** 🐛 inconsistent search focus behavior ([1aba52b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1aba52b8707760670bfbf624d304995c9ab6b72a))
* **core:** 🐛 missing space between logo attributes ([075875c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/075875c574abed81fcc70e6ea0eeef011a0c96ee))
* **core:** 🐛 only apply hover style to wikitable tbody rows ([f555f3c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f555f3c8328f74399cf664decfd011a0da76245c))

### [2.7.4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.7.3...v2.7.4) (2023-07-16)


### Bug Fixes

* **core:** 🐛 do not insert pseudo elements to input element ([0e42030](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0e42030d39883c1880e7594ab63f996e8b7611a3)), closes [#689](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/689)
* **MediaWiki:** 🐛 fix various LESS import error ([2308138](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2308138ef73967b4fa63ffe0d9a213d0a22c409e))

### [2.7.3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.7.2...v2.7.3) (2023-07-15)


### Features

* **core:** ✨ tweak sitestats font size ([7ea3b94](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7ea3b94d2313ab1eacc745e44c07f23715ec1b83))


### Bug Fixes

* **core:** 🐛 fix LESS import error ([6664ceb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6664ceb87fe4278f2813fa7426d4306cae6fc0de))

### [2.7.2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.7.1...v2.7.2) (2023-07-14)


### Features

* **Capiunto:** ✨ add more cohesive infobox styles ([1ba2acb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1ba2acb92885ad3539600e660b343fba97030f03)), closes [#688](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/688)
* **Capiunto:** ✨ add rounded corner to Capiunto infobox ([0d7fff1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0d7fff1188b2ac52f689f153cbe170fc73c15f01))
* **core:** ✨ add overlay as affordnance to popup menus ([703fac6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/703fac62942a15b7ae74b642b3c86a1367047fc2))
* **MediaWiki:** ✨ add border to rc filter ([4678e26](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4678e2633653a3e3eeb23d2c1a2ffb49fee652d5))
* **MediaWiki:** ✨ add color for interface helpers ([ad31d5d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ad31d5dab7b642c2a67b6bc61597877b859b9a79))
* **MediaWiki:** ✨ add non-enhanced changelist styles ([cf82ea8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cf82ea8b28980b231a571849b04794504427f4c9))
* **MediaWiki:** ✨ align contribution list styles with changelist styles ([4badae5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4badae5cc54a2bb34c6a26b1ccac5aea95374b52))
* **MediaWiki:** ✨ minor tweak to color in changelist ([727988a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/727988a213f7755e2309afb58c008a2326984241))
* **MediaWiki:** ✨ revamp changelist styles ([67a5bb4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/67a5bb4357e08110b87bbb603bb39610fee8cd3f))
* **MediaWiki:** ✨ tweak non-js rcfilter styles ([ad3fc27](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ad3fc272c2f926f741aa65684140030e0070a5ac))
* **MediaWiki:** ✨ tweak pager styles on changelist pages ([5af3cdc](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5af3cdc2c2b522ac37b77fc7d36ce3b156581d33))
* **Tabs:** ✨ add support for Extension:Tabs ([42a4030](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/42a40307e444ba4b14225b23dc581b3a7d1aeedc)), closes [#687](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/687)


### Bug Fixes

* **MediaWiki:** 🐛 incorrect legacy rcoptions styles ([1619966](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1619966eb15320d3e159dffcd74d0cf9b9fc7255))
* **MediaWiki:** missing changelist legend styles in 1.40 ([#685](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/685)) ([50ae4d9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/50ae4d9d762a212962c90b5e21c5e275ad4d4039))
* **toc:** 🐛 init observer only when there are headlines ([aef94e3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/aef94e31cb62b5c0c3dc36b9a3e44635b49ba93c))

### [2.7.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.7.0...v2.7.1) (2023-07-11)


### Bug Fixes

* **Capiunto:** 🐛 ignore Capiunto infobox for table wrapper ([a944727](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a9447272dcce9a329913ae10d3b76bafd2b1237f)), closes [#686](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/686)
* **core:** 🐛 incorrect spacing within page tools buttons ([7136c6e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7136c6e96eac6c7ee1232c8dd972583be835e0cb))

## [2.7.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.6.6...v2.7.0) (2023-07-10)


### Features

* **core:** ✨ add icon for Email this user ([eecd21d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/eecd21db761b30817b32455b6228592f233cba3c))
* **core:** ✨ increase spacing between menus in drawer ([45c970e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/45c970e70bc748d26880c3658bc665ab39bc0971))
* **core:** ✨ update hover transition styles and implementation ([a7f9c55](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a7f9c55c88bc437c736c0e922fdfe0a789f21538))
* **core:** ✨ update menu transition styles and implementation ([c7e4517](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c7e45177cd3eefd6cad2c0e3629e586f7d03e948))
* **core:** ✨ use consistent spacing for menu elements ([462d1dd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/462d1dd4acf67990d9624828e58ebe0a45ef08b5))
* **core:** ✨ use filter-invert CSS variable to flip color ([2bf2039](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2bf20397e1d7d1ba89385cac7013fc4d19a62220))
* **core:** ✨ use medium font weight for menu links ([6b1a7d1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6b1a7d1ecef32741ea9c5f3fdf139654f4883202))
* **MediaWiki:** ✨ tweak changelist styles ([e00f9ba](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e00f9ba418ae7cf72a4a8ce8bcc4b7890c4e15a0))
* **MediaWiki:** ✨ tweak rcfilter other review tools styles ([99e475b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/99e475b6353d6cc8cae36f40b516530b8b92f68d))
* **search:** ✨ add clear button to search box ([6cddf85](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6cddf8513119fefb1dd5fbfcfbcc07cfbf90c731))
* **search:** ✨ add experimental multi gateway search ([6adc0d7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6adc0d7eabbeb1d065cebbc5a215ea40826e4d4e))
* **search:** ✨ support all existing gateway in multi search ([608a2be](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/608a2be93217d80e1d8237a137f1e004a8d41394))
* **TabberNeue:** ✨ update TabberNeue selector to match with the latest version ([417c151](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/417c151d0163140e976ee16e851497c87a3839af))


### Bug Fixes

* **core:** 🐛 do not underline footer places links ([2516937](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/25169379a904591981c796ef0a03870bac7e8f36))
* **Echo:** 🐛 incorrect button hover color ([9c59d24](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9c59d246126ead1f5395658f6194f9177e545c21))
* **mediawiki:** 🐛 do not add external link icon to external interwiki ([73ff64f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/73ff64f7dae0f7e5e1d0da8e4cac4ab659a2c2de))
* **search:** 🐛 abort search request if there are no query ([88a5d4d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/88a5d4de9db5c177ef6baab3bc21f03e3576ddbc))
* **search:** 🐛 undefined LESS variables ([f843f4d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f843f4d1eecdd974213d84cecbecbe05eb6a3b8d))

### [2.6.6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.6.5...v2.6.6) (2023-07-05)


### Bug Fixes

* **core:** undefined $msgGender error in Tagline.php ([#684](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/684)) ([4f6e34e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4f6e34e05be5b2f8298b9cf266e9d1c9cc66bfe6))

### [2.6.5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.6.4...v2.6.5) (2023-07-05)


### Features

* **core:** add border to message boxes ([#672](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/672)) ([1137a37](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1137a374d856ca020cd846dc5879ddf2ec17a9c3))
* **core:** add title to logos ([#671](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/671)) ([dfe7167](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dfe7167e97e4c4b0f2b003dc158e015ad5e8dd1f))
* **core:** update MediaWiki notification style ([#673](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/673)) ([32ffa7c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/32ffa7cc2353383e3ac4c64b701c91672406a8b2))
* **DiscussionTools:** exchange icons for subscribe and unsubscribe buttons ([ec3aafc](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ec3aafcfad34e67e5158a4c8e25253ce0b84c0a5))
* **MediaWiki:** add mediawiki.filewarning skinstyle ([#682](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/682)) ([88f8cfb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/88f8cfb43551c01064b769bffeabe6c8ca158181))


### Bug Fixes

* **core:** 🐛 force section indicator and heading to the start ([f74244f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f74244ff4682b5bf380bedc5a124717d2350b364))
* **core:** add webkit prefix for sticky to support Safari < 13 ([#679](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/679)) ([1cd993c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1cd993c664ae10872fb88f01257b5aee1b75f036))
* **core:** header icon position in older browsers ([#670](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/670)) ([a61746b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a61746bf8e5baef89bf9b18305cc4165c516a2bb))
* **core:** prevent propagation of click event on .mw-editsection, .mw-editsection-like ([#667](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/667)) ([07d7a73](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/07d7a730b87735d1a446f661825900119e23cbb4))
* **core:** skin preference support for Safari on iOS < 12.2 ([#680](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/680)) ([2891d04](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2891d042ccdee621babf77fe2725a7738fab3159))
* **DiscussionTools:** icon color in dark theme ([#675](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/675)) ([7e2dcc1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7e2dcc19bb874f8459ed5d45add44b1788e58cfb))
* **ooui:** fix max-width of OOUI TextInputWidget ([#666](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/666)) ([914b810](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/914b81010e0043b1ce45da20aa5a5544b4e59178))
* **OOUI:** z-index of OOUI MenuSelectWidget ([#674](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/674)) ([1f90d15](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1f90d15fbe7e08257648f50094b93d30ae22d579))
* **Tables:** Check if `element.parentNode` is null ([#681](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/681)) ([a1139e7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a1139e7797996f124df4556dfc99265d13cae616))

### [2.6.4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.6.3...v2.6.4) (2023-06-20)


### Features

* **DiscussionTools:** ✨ turn subscribe button into icon ([638cca9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/638cca92cf4787d4ab001cc12d355b8db37d47ee))
* **Lingo:** ✨ tweak Lingo tooltip styles ([1b817b8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1b817b8177887ba6fb9f32968f16ec28a7ed8af6))


### Bug Fixes

* **core:** add menu icons for "Special pages" and "Upload file" ([#664](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/664)) ([e771c72](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e771c728e16624cbf85b6fcc1c9d5d661a104075))
* **Score:** use hue rotate to match dark mode color ([#662](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/662)) ([0acaa01](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0acaa0176f86e521e5dd7be797ae96eaba340386))
* **SemanticMediaWiki:** 🐛 hide indicator divider when entity is loaded ([271d383](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/271d383cf67b2173e04cc4aadb66bc47b796f2f4))

### [2.6.3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.6.2...v2.6.3) (2023-06-10)


### Features

* **core:** ✨ display real name in user menu when exists ([717d16a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/717d16af35b10dab04d434aefddbf991fc8c168c)), closes [#652](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/652)
* **core:** ✨ use gender symbol instead of pronoun in user tagline ([c793959](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c793959416ce28fff0ddebebff6252f005b6aa52)), closes [#657](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/657)
* **core:** expand user page tagline and allow citizen-tagline to be parsed ([#657](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/657)) ([25d25e3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/25d25e381b12172d6b3dadf83d139a9583f18fea))
* **core:** underline content links on hover and focus ([#659](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/659)) ([90d6972](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/90d69720f69383cdbb3cb1310d4baf4ea829dba4))
* **core:** use member names instead of group names in user menu ([#656](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/656)) ([9a0ffcc](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9a0ffcc18620c0a2433f95cf9c24e12794a315c0))
* **core:** use more a11y friendly hidden ([#654](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/654)) ([f9dad61](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f9dad612631772c03c9427f0945662c0284d4694))
* **Score:** add Score support ([#661](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/661)) ([7134a88](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7134a88995748d3dcda6269082a74565f96004af))
* **SemanticMediaWiki:** ✨ replace entity examiner loader with SMW logo ([0ee3153](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0ee31530ecab579e9c80787f086f8efce31012e5))
* **WikiHiero:** add WikiHiero color ([#653](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/653)) ([e69160d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e69160de2f9a77e33bdee9a0db514af2592498b2))


### Bug Fixes

* **core:** typo in dark-color-text-error ([#658](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/658)) ([659c47b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/659c47b3c24eba8a6317e381c754f215b5206c98))
* **SemanticMediaWiki:** 🐛 prevent entity examiner spinner rotate off axis ([5737125](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5737125f0222fa58ef8d6cf703e1ab582240b8fc))

### [2.6.2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.6.1...v2.6.2) (2023-06-04)


### Features

* **CodeEditor:** ✨ add find and replace styles ([2b69011](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2b69011a8fb4f74ebf3e6db22b5797ce964b061d))
* **CodeEditor:** add ACE Editor setting panel style ([#650](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/650)) ([e651e1b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e651e1b8caa60cae1c4ca379813d35e86999d747))
* **CommentStreams:** update CommentStreams style ([#647](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/647)) ([109b681](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/109b68172f7661696f7b1abe53fab0a4c2bf4a6e))
* **ManageWiki:** add ManageWiki search highlight style ([#649](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/649)) ([373f081](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/373f0814f1f9117b94313265ed89ffe55937e5f0))
* **mediawiki:** ✨ add JSON content styles ([53929ce](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/53929ce91c43cfca8cc49d550a080f13118b181e))
* **SyntaxHighlight:** ✨ add line highlight color ([a269d35](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a269d35dac94bfe3e54703b2c80ca0de2eacdbfa))
* **WikiEditor:** ✨ tweak dialog styles ([572bca1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/572bca1467899a621003a398b8b6d842a1fbcb38))
* **WikiEditor:** ✨ tweak toolbar and search and replace styles ([2d425d8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2d425d827635e96405458ca23f9c1630cfcb4d9e))


### Bug Fixes

* **core:** 🐛 avoid page action menu overflow when title is too long ([5c9498a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5c9498a08b580a8223d2594497e1e01670ad0cb3)), closes [#648](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/648)
* **core:** 🐛 undefined items variable in drawer ([403a109](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/403a109cc2d5c1395595528cf2fc525f6d38eb58))

### [2.6.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.6.0...v2.6.1) (2023-06-01)


### Features

* **CommentStreams:** update CommentStreams color ([#636](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/636)) ([dc17bbe](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dc17bbe5cf6ad78115b088e0d0b404ebdf850ddb))
* **core:** ✨ update state background color ([8a618a6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8a618a6a9d4f8cb3c7365d894344bde6033575d2)), closes [#639](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/639)
* **core:** update state text color ([#642](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/642)) ([ba825da](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ba825daa9a6bb6a223ef7b2ce72888027c3b9799))
* **jquery:** add jquery.spinner color ([#640](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/640)) ([866ae58](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/866ae58bd0f08365a78f2a7289e4e723b9a40f4c))
* **SmiteSpam:** add SmiteSpam support ([#641](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/641)) ([9cf37c2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9cf37c20e36e303ccc460a2c4fef4cc379ae2923))
* **VEForAll:** add VEForAll styles([#637](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/637)) ([1158a3c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1158a3c13c5121b24c9aa1d76ebdcea74eb7492d))
* **WikiHiero:** add WikiHiero support ([#645](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/645)) ([151a227](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/151a2270839f079e2c12b6b670881e6b7ef3d629))


### Bug Fixes

* **core:** 🐛 wrap indicator when needed ([c0e0f28](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c0e0f281636658568809fa520c830e42cc7fe59f)), closes [#635](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/635)
* **Echo:** fix Echo popup height ([#638](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/638)) ([bf79397](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bf7939786461088952a03861cc197dbdc0f98d0c))

## [2.6.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.5.2...v2.6.0) (2023-05-23)


### Features

* **CodeEditor:** ✨ add syntax highlight color ([41312d5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/41312d509398f59d976334c5283fa06785ad0b7f))
* **CommentStreams:** add support for CommentStreams ([#624](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/624)) ([0fb2738](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0fb2738d96af90753b85bdedeba1f9710cf814af))
* **core:** ✨ add basic scriptless responsive table support ([6c04fee](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6c04fee280a56fe7bb836b0139e795036e2e3337))
* **core:** add config var 'wgCitizenTableNowrapClasses' ([#621](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/621)) ([a7b99d1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a7b99d11f082c559ce12e1caa70a7fc476ce92d5))
* **Echo:** hide #pt-talk-alert when Echo is enabled ([#626](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/626)) ([9993545](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/99935453dbd1de872f479e2c85fb45e3a361fa41))
* **Scribunto:** ✨ tweak debug console styles ([e665814](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e6658147ea1099ce6fb2ec8d07923aefaaf1c99a))
* **Scribunto:** add support for Scribunto debug console ([#629](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/629)) ([efd0254](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/efd02548a64ec879d84470a2457fca8eb5f89964))
* **search:** add SMW Ask API as search backend option ([#625](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/625)) ([2e3e5fe](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2e3e5feb9b22fc9f0d061a106233e0f569c6c815))
* **SyntaxHighlight:** ✨ unbold some highlight to match with CodeMirror ([0931793](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/09317936dd53a7ca1c49354b3b5a95cf3a199514))


### Bug Fixes

* **core:** 🐛 add missing border between thead and tbody ([5ca0f03](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5ca0f030bc9752665bc688f065470086f4bf2869))
* **core:** 🐛 incorrect max-width value ([d35b1a8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d35b1a8eb5189e787d075428dbdf5b68c08f2d57))
* **core:** add webkit prefix to user-select property ([#631](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/631)) ([d92fd77](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d92fd77e54cf5eb22077e3d0c04e339022cb686b))
* **preferences:** incorrect preferences icon position on Chrome 81 ([b43da4d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b43da4d81ecc0eadc170f3fb6009ef62bbf670b7))

### [2.5.2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.5.1...v2.5.2) (2023-05-06)


### Features

* **core:** ✨ do not wrap changelist tables ([661fbf0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/661fbf0b8ffb07917670496949f2625bf17d8ba5))
* **core:** ✨ ignore cargo dynamic table for table wrapper ([cd93b3d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cd93b3d679750a812d2643eaa487aab7dcc5ec5b))
* **core:** ✨ ignore dataTable for table wrapper ([79daca4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/79daca474a472b2b171606493e9e67a0905eb805))
* **core:** ✨ more saturated base text color ([35821b6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/35821b62ae73535c130ba5802a2dae490295e7af))
* **core:** ✨switch page-container to flex layout ([c2922f6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c2922f6ba29b9594574b19fd9e57a3c593785321))


### Bug Fixes

* **core:** 🐛 add gap between footer icons under the same li ([801eb9a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/801eb9a13bfe72366312dd82e4a5b96477f24da2))
* **core:** 🐛 do not resize image in table ([838a7f5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/838a7f51009d7dd216180bacaf7f96e17c9bee74))
* **core:** 🐛 ensure loading indicator is removed when script is loaded ([09ffed6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/09ffed668d582ffbe3d1f2550ba5b0adc4e3cab1))

### [2.5.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.5.0...v2.5.1) (2023-05-01)


### Features

* **core:** ✨ add HTML class to disable table wrapper ([b2eaf0a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b2eaf0a41aefbff513b0461bcab27606ff552f20))
* **core:** ✨ check parent container for table nowrap class ([587cea1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/587cea1ee9c825cc912cbf01fba4234f243fd6da))
* **core:** ✨ do not wrap nested tables ([3d14f9c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3d14f9cf0b63176caafb634f183cf3033b7a0af9))
* **core:** ✨ ignore infobox class for table wrapper ([81affb8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/81affb88f19bc7be8fd5998b03b30a2f51551b46))
* **core:** ✨ inherit float classes to table wrapper ([d1d49e6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d1d49e62d5e13dfc80874eced46f9b25b59de729))
* **TemplateData:** ✨ add style for TemplateData button in VE ([e139df6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e139df6a24fb25b0e8e0a082d2a1f4bc3fc07f62))

## [2.5.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.4.4...v2.5.0) (2023-05-01)


### Features

* **core:** ✨ add scroll affordance to tables ([e45af9b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e45af9bbbeffe40f195b148d7d7b78b02b34cddd))
* **core:** ✨ make tables responsive without breaking table layout ([8c888a7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8c888a7e1f79bfce9cdf1b2e3b73ccaada2ac6ac))
* **core:** ✨ only apply title transform to content namespaces ([fe4f4a9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fe4f4a91d2e7d28be69c8997001c44d919858a0e))


### Bug Fixes

* **core:** 🐛 avoid double spacing between notice and content ([612382f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/612382f567fa30eeef2816623bfa43829e20b8ab))
* **RelatedArticles:** 🐛 larger min-height to trigger lazyload ([567fc81](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/567fc811ea46430826f42a1d658504bd4c89569b))

### [2.4.4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.4.3...v2.4.4) (2023-04-03)


### Features

* **core:** ✨ add config flag to disable preferences menu ([90890de](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/90890de53fe56884fdbe470784128283e7398020))
* **search:** ✨ trigger typeahead update when character is composed ([aaa82d0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/aaa82d06efe7a9479d47ea63c8420371bff59ca4)), closes [#608](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/608)


### Bug Fixes

* **codex:** update button classes for type->weight change ([#606](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/606)) ([6b8ff22](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6b8ff223833db71ae3287eafb111e017c6e440d1))
* **core:** 🐛 remove redundant override for image height ([b47f265](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b47f2658c72098b6b2f87d626eeaa3cb72e4f265)), closes [#605](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/605)
* **RelatedArticles:** enforce min-height for RA to render ([daf5b3d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/daf5b3d07fc4d5a4c75d41fdf846cd9320c73a09))

### [2.4.3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.4.2...v2.4.3) (2023-03-20)


### Features

* **core:** ✨ add border to Citizen cards ([235a76c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/235a76c2bd48fdf8bdc5416e1977ea9cb5168291))
* **core:** ✨ apply box-sizing: border-box by default ([6831312](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/68313123e9d098c18aeeb6660d19d8c2054c2846))
* **core:** ✨ clean up print styles ([19ddd61](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/19ddd61e1925ff2bc50c5e51b86dd13196ac306f))
* **RelatedArticles:** ✨ add border to RA cards ([2a6e65b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2a6e65b2655cfabdaac4cb76f515e2239cbcb831))


### Bug Fixes

* **CodeMirror:** use same font as edit font ([787ecc3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/787ecc3fcac99559c37fb7f6f934e03824b17c63))
* **core:** 🐛 respect config flag for default theme ([015b1e1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/015b1e1b9a9b7ec639a222d822ac8001465f5e3d))
* **search:** 🐛 align typeahead with input ([0b7c72c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0b7c72ca5ebc068a5a8ad4090628d105492fe039))

### [2.4.2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.4.1...v2.4.2) (2023-02-22)


### Features

* **core:** ✨ add icon for urlshortener ([b04b46d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b04b46d9570bec36f467e0c2e690cef51c8e148b))
* **core:** ✨ convert tagline to langauage variant when appliable ([0c23e50](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0c23e50d62a5472633555a8bee7b140a5ff383a2))
* **core:** ✨ do not synthesize font styles through browser ([9072068](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/907206854b1fcc2b7c05172776fb7c8c540aee9e))
* **core:** ✨ update font stacks ([83f7fc5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/83f7fc5db21aa8857facb1bbb3f402fa44e22496))
* **core:** ✨ use Citizen font stacks for edit font ([736bd9a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/736bd9adc5d38904a3ee64d31de585a045738498))
* **core:** ✨ use same font family instead of serif for blockquote ([af41f98](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/af41f989355be6a1558dc639edfd98b699600403))


### Bug Fixes

* **core:**  🐛 incorrect thumbnail center styles ([8f49101](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8f4910153a1bc3fc69685d612e5fbd644abece41))
* **core:** 🐛 responsive thumbnail on new media structure ([ddb425c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ddb425c4bb43aefd99e61e4dfa3681b6fc995d77))

### [2.4.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.4.0...v2.4.1) (2023-02-15)


### Features

* **core:** ✨ add support for user-interface-preferences menu ([3ec8434](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3ec84349b1149ac5f72e948f9ff71851b9e52cc2)), closes [#587](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/587) [#425](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/425)
* **search:** ✨ support MW default search shortcut key ([e06ed54](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e06ed54c83d129be3059f184e68e22a9cbfeba5e)), closes [#582](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/582)
* **Translate:** ✨ rework Translate header and language tag styles ([f9e872a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f9e872a52ac28181a43cc2f4a95d8a2ca7d74122))


### Bug Fixes

* **core:** 🐛 handle null exception for user group ([081a176](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/081a176edcce7c8469d79af10a159eb1e22c7a56))
* **core:** 🐛 reset array index after removing toolbox from sidebar ([c8d5a6e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c8d5a6e5f40fbe2c451f755207b5a5f1407e8683)), closes [#580](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/580)
* **VisualEditor:** 🐛 VE overlay should have overlay z-index ([e2d1230](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e2d1230064579e155145d06178f7c6d835c310fe)), closes [#583](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/583)

## [2.4.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.3.6...v2.4.0) (2023-02-06)


### Features

* **RelatedArticles:** ✨ tweak RA card color ([8659eab](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8659eab29608a778bc99020be5b31d09799d192d))
* **VisualEditor:** ✨ update VisualEditor styles ([1d10b66](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1d10b669a66a5a97b32ddfe14a9c408cdf105794))


### Bug Fixes

* **core:** 🐛 incorrect sticky header rendering on changelist ([78f79e8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/78f79e8529bbd10525aec9da9590877c90e63063)), closes [#575](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/575)
* **RelatedArtcles:** 🐛 add min-height so that RA cards will render ([5bf0147](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5bf0147499872d7676ac69223bba72dad06b2d35))

### [2.3.6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.3.5...v2.3.6) (2023-01-27)


### Features

* **core:** ✨ remove plainlist styles ([5ebd7ad](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5ebd7ad0255e05eaaa76aae9612b6b954de333ce))
* **core:** ✨ use MW core checkboxHack instead ([ef955c2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ef955c28a0a5644a2f95c66eeb18ce0ddf1ab3bb))


### Bug Fixes

* **core:** 🐛 checkboxHack buttons should be focusable ([afcf37d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/afcf37d529513fd24acfcd992493a4fb5a0bb80f))
* **OOUI:** 🐛 standardize OOUI window z-index ([a3ed766](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a3ed7666e227a7e03d71632ae92b71739d7ec0a8))
* **search:** 🐛 overlay should not cover search box ([7639110](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7639110326c2f381f8f9c656b3e77a4907620e17))

### [2.3.5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.3.4...v2.3.5) (2023-01-21)


### Features

* **core:** ✨ use Citizen monospace fonts for diff ([08cd314](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/08cd314432dc139bca09c03111db70a01ec73802))
* **DiscussionTools:** ✨ update DT styles ([ca503c7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ca503c7f7b51cc368e68af06be0c92c6d6c9e1da))
* **pwa:** ✨ use proper manifest type instead of json ([d73fa67](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d73fa67a3184aef1ffe8a4364484acc183662e7b))
* **RevisionSilder:** ✨ add color to bar chart ([6ce8d2d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6ce8d2d1f4c6b5ecc8e2ff8f606ed1f279a95d8a))


### Bug Fixes

* **core:** 🐛 default to auto theme unless set ([a7406d8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a7406d8e3247b7a3a1a8a97b51d295e1beb4ad87))
* **core:** 🐛 incorrect signup stats selector ([7a6dfc6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7a6dfc6645faa20a8b57e0bbec301a45c2f6b5c4))
* **core:** 🐛 increase mw-body-header z-index ([aeb8e16](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/aeb8e160cfccfe6cc0686bbf909045770f9b1a90))
* **core:** 🐛 stricter selector for sign up form container ([e4851f9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e4851f9de2bc2cd01f650cb55899de17fcf9d104))
* **pwa:** 🐛 declare  before adding array ([68cb9b6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/68cb9b6c68cb63022f59c77604a34288ca04d751))
* **pwa:** 🐛 incorrect var type ([e78ebd7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e78ebd716568dc1362542f2302ca433174a010d3))

### [2.3.4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.3.3...v2.3.4) (2023-01-17)


### Bug Fixes

* **pwa:** 🐛 parse error in manifest API ([d63025f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d63025f08436af5224dc570ad3491030b8842bbe))
* **pwa:** 🐛 syntax error in manifest API ([e40d4e6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e40d4e65fac34a21ec3f7a71e2915e7d4ae469dc))

### [2.3.3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.3.2...v2.3.3) (2023-01-17)


### Features

* **Echo:** ✨ tweak Special:Notifications styles ([5c22145](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5c221452959c891eab7cda043fd24cb9d2270699))
* **search:** ✨ add search portals to empty state ([4b8e128](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4b8e128e4b0dbc8b6d507b7789e3f032ee8c8ee1))


### Bug Fixes

* **Cargo:** 🐛 incorrect hover style for datatable ([f11ad86](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f11ad86a07ad9cef7ae2fa73b9a99f8199adf540))
* **core:** 🐛 disable ULS-enhanced language button for now ([e3bf581](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e3bf5813c8f97f00ce1cbe19a2684d5ce2d8d291))
* **core:** 🐛 incorrect gallery margin and padding styles ([f40c0db](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f40c0db9bfdfa1978a90b630d6fe08b6ee38a43f))
* **core:** 🐛 more defensive check for logo ([7c552fe](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7c552fe76313ab097c9c8b8c9378b96c505c7d8d))
* **search:** 🐛 consistent empty messages ([dc01717](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dc01717c98ad617ec2c53887b9b3d8f7ea7c8ec4))
* **search:** 🐛 incorrect max height for search suggestions ([7416a7f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7416a7f6d13688e635e3031a4eb40d8f5b1a7ecf))
* **VisualEditor:** 🐛 incorrect layout for header in preview dialog ([5589916](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5589916bfa3a72f9f9e75574938dfacee1ccca4f))

### [2.3.2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.3.1...v2.3.2) (2023-01-12)


### Features

* **core:** ✨ add file metadata table styles ([8704cc2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8704cc2d91e40417f8f80de96a712d6aab27588e))
* **core:** ✨ add toolbox icon for CreateRedirect ([aeed04b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/aeed04b86013e1870830f42fbae54737bbb7fa04))
* **toc:** ✨ add bottom margin to sticky toc ([5023f2a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5023f2aa646cb1bf639bb0163f1f35dccd191d6f))
* **TwoColConflict:** ✨ add TwoColConflict skinStyles ([ed36d72](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ed36d72482b9df327df5be6430a473373ff73701))
* **UploadWizard:** ✨ update UploadWizard styles ([7bd30eb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7bd30ebecba8a88de902c9366bf44f75f1bf3a9b))


### Bug Fixes

* **Cargo:** restore table to default behavior ([df7346c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/df7346c937b4a4d80f7f91e42f0fb18269fe5356))
* **codex:** 🐛 incorrect Codex file name ([b7996c5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b7996c5952a6a54eae8b3d2288317b599a60360c))
* **core:** 🐛 incorrect layout when signupstart is present ([4c1ec61](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4c1ec61622294222357bdd8c079a195cca0ea268))
* **search:** 🐛 incorrect keyboard navigation on typeahead items ([242413b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/242413bf4aa7d851bda2f8b4a4f66a9f60791cfc))
* **search:** 🐛 more robust null check for description ([1e47e95](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1e47e95a8dd5d7169a0d0701257da78fed1a0758))

### [2.3.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.3.0...v2.3.1) (2023-01-05)


### Features

* **Cargo:** ✨ add responsive support for datatable ([dd7f21b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dd7f21bc8e966bf4dc2a1f553704b4892585001c))
* **Cargo:** ✨ cargo table should have reduced font size ([5db5620](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5db562008e51a727ead340fce6505affb0d5ef4d))
* **Cargo:** ✨ datatable should have reduced font size ([1dcb37a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1dcb37a4675ee1d75a4a2a6f15da62bc1d419d47))
* **Cargo:** ✨ update partial Cargo styles ([a017bae](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a017bae502b99daf19f8bd8f5694fce133deb858))
* **CodeEditor:** ✨ add CodeEditor support ([5946089](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5946089cbbfd1ed040179e9e057067688d74ad61))
* **CodeMirror:** ✨ sync background color with other editors ([46437d8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/46437d81f663277b13459c5a2a2958113078e9d7))
* **core:** ✨ always truncate sticky header first heading ([0051115](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0051115ce069e039469dc8e463b3ae8789d51c89)), closes [#559](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/559)
* **core:** ✨ increase base layout width to 1080px ([8c8ab99](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8c8ab997ac306d74aa5f11e4cff8209061e893a5))
* **core:** ✨ more colorful emphasized text color ([023ee94](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/023ee9427acbec2c019bee3a332df825e4853a45))
* **core:** ✨ only add upload link when it is enabled ([8c4bd54](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8c4bd54d32b149398f956d53741aaa63d352b32c))
* **core:** tweak content sub spacing ([985ecb2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/985ecb2aa10093a47b1aacfdc95839bbf588cfd6))
* **ReplaceText:** add ReplaceText styles ([#561](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/561)) ([286f4f2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/286f4f2f1d77f2c3c3d1b97d54a0cb5e7fa36f33))
* **search:** contain the overscroll of search suggestion ([60c1270](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/60c12706a5adbb0bffb5802eb0979e1d7bd1a66c))


### Bug Fixes

* **Cargo:** 🐛 add datatable odd row hover styles ([8adf25e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8adf25e350e78f6d12b4533b97371809e6971015))
* **CodeMirror:** 🐛 incorrect selector for CM elements ([3fd4908](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3fd49089535b06af31856fd817d50769e1ea3e3b))
* **core:** add missing WMUI help icon ([#560](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/560)) ([084799f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/084799f58ac4f4fe84ae19d08682d986303d0b04))
* **core:** missing style for the previous commit ([aa13b58](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/aa13b58194cd3cd4df9ce4b2154a9f8f5aed9b49))
* **search:** 🐛 correct URL for MediaSearch ([2e9dffb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2e9dffb7f06470e25170407e619f9a5deb372d67))

## [2.3.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.2.0...v2.3.0) (2022-12-14)


### Features

* **AdvancedSearch:** ✨ update AdvancedSearch styles ([88fca93](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/88fca93c469f7e2918b3b68a6a0381f4a3e5e800))
* **core:** ✨ align inconsistent search styles ([653ba19](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/653ba1913051ef11306de4fd8bda4cc56f44d37b))
* **core:** ✨ deprecate background-color-framed and input ([37cdf91](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/37cdf912571cd8b3b4c19cc45a09b123d0b83476))
* **core:** ✨ do not hardcode min-width for page tools menu ([0187478](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0187478d1aa69bfa2f699fb4790cadc8491c98fd))
* **core:** ✨ do not set fieldset font size ([224c190](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/224c190a475e5079e5e0e8332442643c5e2b571f))
* **core:** ✨ dynamic dark theme color based on primary hue ([3414d59](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3414d5964375de829c129c39d680ef3c9e6b743b))
* **core:** ✨ tweak notification styles ([529fe22](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/529fe221de103bf68302f06cf5a3e941f2206e04))
* **MediaSearch:** ✨ add grade A support for MediaSearch ([9b9916d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9b9916d61bea955f3208e2f1fdb728b63918c66b))
* **search:** ✨ add MediaSearch to typeahead ([203b0b4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/203b0b42c3a388684a51f231d993788632b92ae8))


### Bug Fixes

* **AdvancedSearch:** 🐛 1px layout shift in preloader ([3517453](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/351745374155fe292dd487f0e6f3ea6dd3782765))
* **core:** 🐛 do not make search create and exist link into a card ([80a35ea](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/80a35ea571f8d7ef864b332add827368bc9b0440))
* **core:** 🐛 do not use CSS containment for body content ([7a59e9c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7a59e9c2d720d99a4fe0aa31b2ff83b1c56922b9))
* **core:** 🐛 incorrect z-index in changelist title ([c4bd384](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c4bd3842358920752d8f0abf5a768846b1b2f03f))
* **search:** 🐛 do not collapse whitespace in label text node ([c2da5c5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c2da5c5ade34d0895932a0d120908f02fadb0a28))
* **search:** 🐛 incorrect full text search URL ([074df52](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/074df5272c2cc7739967ded992b48e5bf45da806))

## [2.2.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.1.0...v2.2.0) (2022-12-08)


### Features

* **core:** ✨ add active states to header buttons ([2a8129e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2a8129ec936c643b722a0aac980e4ce83c0dd125))
* **core:** ✨ add icon to all talk page buttons ([323acda](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/323acda0b1a668aa45394707ea59ccb6d4279534))
* **core:** ✨ add rounded corner to mw-message-box ([f3ee780](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f3ee780f8c8d8f916e6c1adb39eb3f65a35535a7))
* **core:** ✨ add rounded corner to mw-ui-button ([c172966](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c172966ce4f6488b747c280f634ce80011cfe413))
* **core:** ✨ add site logo to header ([7bfec28](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7bfec28ef2c6c8d166730e9defad39a056bc7b82))
* **core:** ✨ allow multiple search components on the same page ([1939850](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/193985036980d4f1c001930c7763af76ed3f95bc))
* **core:** ✨ allow the use of custom search suggestion module ([391266c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/391266c0a710a86dabc7c0ddb7d2f8d3540af551))
* **core:** ✨ center align searchbox ([3d0ff75](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3d0ff75249d17dbca23347f9cda06d473412dadc))
* **core:** ✨ do not hardcode footer wordmark size ([22e1324](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/22e1324a80efd75d954dd5e0e074b25e5d1b8dc3))
* **core:** ✨ reduce the click event delay on touch devices ([3d1ca8b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3d1ca8b2ad62b479032c1e83bf0826f9f6da9162))
* **core:** ✨ update MW datatable styles ([75ab097](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/75ab097ba104081629ca865bd96aa8725df5adb4))
* **core:** ✨ update RecentChanges filter styles ([594b0ab](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/594b0abc736d000f3a7e0f7f11fec323450c79f9))
* **MultimediaViewer:** ✨ smaller scroll indicator for MMV ([9bc8d7a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9bc8d7a44c883f77e3883ff29571538ef4ff65bd))
* **search:** ✨ add empty state to typeahead ([9bf737f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9bf737f72016669cdfeff1e6206e8e345423d937))
* **search:** ✨ add no result state to typeahead ([284b0d8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/284b0d8952fd44806ca6d534ab1eb3edaad0ec59))
* **search:** ✨ clean up redirect text implementation ([4293021](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4293021d5c0ebf27294e8ee8cf397c8189f114eb))
* **search:** ✨ merge footer into item element ([c9b03aa](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c9b03aa7fed3240468405d154ba3fc0123bdce04))
* **search:** ✨ show enter key tip when item is active ([3488e29](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3488e29960925b43d7655f7faf53375b3ddd46e9))
* **search:** ✨ use background-image instead for typeahead thumbnails ([fd0978b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fd0978b73d1bb27bd24acf84bc28a191f7c7cf6a))
* **search:** ✨ use WMUI icon for placeholder ([34804e8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/34804e82581cda0c58f00de2e3fa77f7f1f09815))


### Bug Fixes

* **core:** 🐛 changelist legends should not be covered by header ([a3d88aa](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a3d88aa7a1e771e9885feabedbb647967334ddd5))
* **core:** 🐛 message box should be at the top of login form ([31c7779](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/31c7779b82395d104eca61f4bbd8af541cbe8fc2))
* **core:** 🐛 page tool menu should not overflow right ([#555](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/555)) ([71d89bc](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/71d89bc935bae8b94534cba477cffa84ac999a4e))
* **core:** 🐛 remove border as it collides with MMV button ([9d78879](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9d788790951f22b00c66de8eed2ca3ca651e1c82))
* **core:** 🐛 sticky header flickering ([a1b2f7f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a1b2f7f184bf745baf359759ee2319ffa6fe156a))
* **search:** 🐛 do not shrink thumbnail ([cc3e1d4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cc3e1d41d44fee5a44b03c24e18959f98c6cb2c0))
* **search:** 🐛 enter key should click the link in suggestion ([c5e5ff4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c5e5ff40a6a58faa28ac77d57d5ab156ce921c32))
* **search:** 🐛 enter key should click the selected item ([7805b89](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7805b890ff3e28cf09ab00fbde51b3b64659a472))
* **search:** 🐛 enter key should not throw any error ([e6ca664](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e6ca664cc43d96399b0d653a8837e76641dacd50))
* **search:** 🐛 null error when rest api is used ([f81e5b6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f81e5b6f1aa7b354e70e69d46b49733ca553b2e0))
* **search:** 🐛 overlay should be visible on mobile ([9d7c307](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9d7c3070e50ada9a79bc5e6841576ddcc879956b))
* **search:** 🐛 restore ID attribute for suggestion items ([a1aeff2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a1aeff2e523b9911adf6e2801055dd172ec92c4d))
* **search:** 🐛 typeahead thumbnails should be center-aligned ([96ec8e4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/96ec8e4248cc435ff0fbb82f212ea08f66078327))
* **search:** 🐛 update selector for fulltexturl ([501286a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/501286a15d0faeab1a08f7180a39fcff699d1392))

## [2.1.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.0.1...v2.1.0) (2022-12-02)


### Features

* **codex:** ✨ add grade A support for Codex ([dd7270b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dd7270bcd4a65f3375653b7e99e5b6f3a19b199d))
* **core:** ✨ add create account page styles ([fcf2f43](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fcf2f436cdce880e8b6f5a490e9c2879e2e6f4f6))
* **core:** ✨ add hover states to editsection links ([3fb66b3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3fb66b38b256bf6fb9db29ec1208c9782b558c9d))
* **core:** ✨ add htmlform styles ([51c931e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/51c931eed2bd5859c5794a2d6064cd1dcef06e72))
* **core:** ✨ allow collapsible sections with DiscussionTools wrappers on headings ([ad714dc](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ad714dcfedf56a515d3151797479dbf619ea33fe))
* **core:** ✨ only apply letter spacing to text field labels ([f041b2c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f041b2cbead85ce4d503fda3c01ab0761230cb0f))
* **core:** ✨ redo MediaWiki UI styles ([ce9e9de](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ce9e9de25bbb88ec85ecd7a1ad23bc1f984fe3a3))
* **core:** ✨ reduce scroll up header delay ([f70d410](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f70d4107795002c18a68472d1090bd4231c2c1d4))
* **core:** ✨ right align language badge ([bfcd43c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bfcd43ce1198249cd53f3cc50e577975de7b80f2))
* **core:** ✨ tweak content footer styles ([baab7e1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/baab7e17a8eb7ca58fa77816ad0b7fb12a94cc08))
* **core:** ✨ tweak gallery styles ([a863949](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a8639493251b04226b9ad7a33640944b48b173ed))
* **core:** ✨ tweak page actions styles ([069f442](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/069f442d576d408fbe65fc2b9b7bdcc381ae66d7))
* **core:** ✨ tweak RC and Watchlist styles ([faf294e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/faf294e899169b0c057b2b0fa18e399c34d0b63f))
* **core:** ✨ tweak signup, login page styles ([97b8ece](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/97b8ece48f8286d5f349d011d913055044f90345))
* **core:** ✨ unify sticky header styles ([467cf85](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/467cf85be47744efeff8e51ef0ff3d63843f86bc))
* **core:** add underglow to progress indicator ([bf9a485](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bf9a4850f6e20f53c047000e4f6fc38169da2df4))
* **MultimediaViewer:** ✨ revamp mmv styles ([7b6743e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7b6743e4b61faea1b29efeb84b392eecf64e0faf))
* **MultimediaViewer:** ✨ tweak scroll indicator behavior ([28368f3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/28368f3dfa0aa9fd13f16a5839fe1a6570930fca))
* **ooui:** ✨ do not flip OOUI icons that are marked ([93f5f3f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/93f5f3fc067a32a30709e9c72d78d2ad3cd33096))
* **ooui:** ✨ redo OOUI styles ([ca7dd9f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ca7dd9fe86642a321d9984d089b7963a082cb7f4))
* **Popups:** ✨ add responsive support for Popups ([1238799](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1238799a821cc8259201277847fbe42576461c94))
* **Popups:** ✨ update Popups styles ([dcd7a7b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dcd7a7bf21703bc0a4e7995afa1c69fad46a80b9))
* **typography:** ✨ add bottom margin to headings ([be71399](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/be7139968e938a20a9c073c872e62c401e5afecf))
* **typography:** ✨ add label styles ([5e14891](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5e14891088fd8f4b00bd27bb99e8e20cc3d065a8))
* **typography:** ✨ do not change GRAD axis ([027e298](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/027e298e1e81466a44a9d27e326541281c4fe0bf))


### Bug Fixes

* **core:** 🐛 clean up leftover drawer script references ([#554](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/554)) ([e261abf](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e261abf8b5239db167f7336a49c370bbb4708291))
* **core:** 🐛 content should not collaspe margin ([41dd999](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/41dd999f5a606fe34c249cbdc2f62738bc5d3193))
* **core:** 🐛 incorrect height for page action button ([b182872](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b182872ea7882ad6045cfd84e5b107ab6a0de3d4))
* **core:** 🐛 input focus state should use hover background color ([f64f1a2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f64f1a2d5edf7ac857c19c155c0fc365bf344006))

### [2.0.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.0.0...v2.0.1) (2022-11-22)


### Features

* **core:** ✨ reduce space between page header and tools ([ead296c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ead296c46d56b4e9221cb15e317f703183cf022b))


### Bug Fixes

* **core:** 🐛 missing page tool background styles ([53cfa87](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/53cfa8714e3787acdaee3bd92a387bee67439e11))
* **core:** incorrect letter case in file name ([71a7945](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/71a7945a7113fe08ddfe31b299aa6a57ac740e88))

## [2.0.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.0.0-beta.4...v2.0.0) (2022-11-21)


### ⚠ BREAKING CHANGES

* **core:** 💥 🔧 bump MediaWiki requirement to 1.39.0

### Features

* **core:** ✨ add an aria-labelledby attribute to #bodyContent ([fdd5c0d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fdd5c0dd2a9dd0152fcddf7b8627f1bf68552950))
* **core:** ✨ add back to top link to toc ([bc1dd38](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bc1dd38a12ebf8ad7f1b1dac1ab9a3373f9c804a))
* **core:** ✨ add desktop styles for toc ([622f368](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/622f368d1e01dd04699465a16572336dba0c66a4))
* **core:** ✨ add icon support for some extensions in toolbox ([8710a2b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8710a2b90521ba3447b1f521a3022d79bf6dc4a8))
* **core:** ✨ add icon to back to top link ([48173b6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/48173b6eb86a909206f2520b0a118923e1f54e77))
* **core:** ✨ add messagebox styles ([c3652a0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c3652a0e9eee585303b30e826356d62f105f1259))
* **core:** ✨ add missing page tool icons ([b6defbf](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b6defbfb3c54ead099795b7664a8451846ab470f))
* **core:** ✨ add missing user talk icon ([b3c2b2f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b3c2b2f10fd29a47dbad303fb007c5f3d2abdf6b))
* **core:** ✨ add Parsoid media styles ([4bdad41](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4bdad41f8ad83cd28eb09a6abca212d538b203ee))
* **core:** ✨ add pill and circle border radius variables ([d238e93](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d238e932a196d1001d71774907d9119ad5cc3fa0))
* **core:** ✨ add styles for temp user in user menu ([6ab486b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6ab486b82efa5a2bbae71e14ba3528d2573613e2))
* **core:** ✨ align th to the start ([85f5b42](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/85f5b42ec123bce6138ffbb766799d4b2fb9bcc6))
* **core:** ✨ align user menu spacing ([41bfd4d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/41bfd4d4a47602b0ebb4908846bb96e5a3cd22a6))
* **core:** ✨ center align page tools ([39e0466](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/39e04665e30f01950971376ab022f96ae0c384a3))
* **core:** ✨ clean up elements styles ([20d8d0d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/20d8d0d0d4813a01d0b775a2096aab4c749180d9))
* **core:** ✨ clean up site notice styles ([2c2b75f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2c2b75f44fabf58dba197df0fbadea3dc6d22f3d))
* **core:** ✨ clean up subtitle styles ([74fe35e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/74fe35e31a9e26d9289e986086eb62223ec38d27))
* **core:** ✨ combine content footer line height ([e66c4de](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e66c4de0466e6b4bb356582a2f72147fbbabe585))
* **core:** ✨ darker border for broken thumbnail ([976d5ec](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/976d5ec42ae7646d51762c54840fe434a50c4ebe))
* **core:** ✨ deprecate preconnect ([9232c91](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9232c91352aa0fad2dbecf65fa031bb9ed6fad13))
* **core:** ✨ drop data-namespace in favor of data-associated-pages ([43eae7e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/43eae7e91673b2456013e0132b9e87dabda3b42b))
* **core:** ✨ external link icon spacing should be relative ([0268c2d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0268c2d158631c3babf2bd4719f7bcb057da5166))
* **core:** ✨ hide navigation on scroll down ([6b13da3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6b13da33184ee2f24f8b9eb0aac2e2cfc7711024))
* **core:** ✨ make create page card float right in search page ([9d1b62f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9d1b62ffc0f6f47a04189216ece362cf07d1bcde))
* **core:** ✨ mark menus as supported ([87f920c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/87f920c81222140ec24d81d4143a9c4d8854e8b4))
* **core:** ✨ migrate associated pages menu to use RL icon module ([a2d0d31](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a2d0d31d2afdc12172772b614a61069548c868a8))
* **core:** ✨ migrate collapse icon to RL icon module ([997c152](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/997c152a2acb03bbe5e93bcd4984298b9292546f))
* **core:** ✨ migrate misc icons to use RIL icon module ([2d01469](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2d014694a65b5f0110f1a53ab8513104d17b2d73))
* **core:** ✨ migrate searchbox to use RL icon module ([dc77ae4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dc77ae47bde70d4739a6af46f5d99335f88eeaa0))
* **core:** ✨ migrate sidebar menus to use RL icon module ([efac6f1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/efac6f125aa477f80108ca7e080e2cc6a00da326))
* **core:** ✨ migrate sitestats to use RL icon module ([7eae7c6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7eae7c6b14e08e7d316648f004d657aca79a3cd9))
* **core:** ✨ migrate ToC icon to use RL icon module ([7cff9e6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7cff9e678b35100519a82545dec961a0baa0eb07))
* **core:** ✨ migrate user menu to use RL icon module ([ea68ce0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ea68ce0d2507f75d2eacb2d4f90f4e4c2784766e))
* **core:** ✨ migrate user menu to use RL icon module ([f2d1ab3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f2d1ab3d23abd4acfcbb7153de0fa3421f14b521))
* **core:** ✨ migrate VE editsection to WMUI icon module ([ab1981d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ab1981d24ba3f9f90761da3bb0c7a6b3fa9c58b3))
* **core:** ✨ migrate views menu to use RL icon module ([b8ca3f8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b8ca3f8d72c57f535b1e0d1b5c820bea903e4ab1))
* **core:** ✨ more granular spacing units ([fd40b1b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fd40b1b85594c5f5997642d5bcd08ab458694ebe))
* **core:** ✨ normalize browser styles ([f85770a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f85770a3dfb8b387239aae434ffb49b5cc57f2b2))
* **core:** ✨ overhaul MW debug styles ([6def7ab](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6def7ab9900dfb83418f299baa19a3f0b621a8bf))
* **core:** ✨ pre-work for ToC checkbox hack ([1730a8f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1730a8ff9961af8c8b47257539e614d7ff598759))
* **core:** ✨ put non-header elements into a container ([d234ece](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d234ece1464626e52502bc4b4fde83e0311a6625))
* **core:** ✨ re-implement responsive toc ([a1ce408](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a1ce408e43bc11f68b6a05fe8e11f23d25a326ef))
* **core:** ✨ redesign search page ([0bf4b45](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0bf4b4555caeb6a7c63997e5e5070535985ed00c))
* **core:** ✨ remove icons from navigation menu ([6e3727f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6e3727f8f33031b9c1649506d87f3ecb298abfb5))
* **core:** ✨ rename `$wgCitizenSiteToolsPorlet` to `$wgCitizenGlobalToolsPorlet` ([2bc022a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2bc022aba2966c0105f0ce2b0b044d78a9ca9997))
* **core:** ✨ responsive heading font sizes ([35ee861](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/35ee8619cb87071816239a41e405eec26edbd6fa))
* **core:** ✨ responsive page padding ([7b33d7e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7b33d7e2f166ce221b5f94ece56fd18c163a7408))
* **core:** ✨ revamp thumbnail styles ([8eebf68](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8eebf6806dd5f8a0457a25cba23667f1ff8b97b2))
* **core:** ✨ rewrite body layout into flex and grid ([8793a24](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8793a243c300c2a68366763698847b60b9a85222))
* **core:** ✨ smoother transition for ToC toggle states ([c15c159](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c15c1592e3b5e01acdcafe6dd82544024cc4f830))
* **core:** ✨ standardize line height ([034d5c4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/034d5c4b02a8386bf5c1a207ef5331aebd6c243c))
* **core:** ✨ style namespace differently in page title ([c03308a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c03308ad59fd4b20c98908897ee43236a78ceacd))
* **core:** ✨ tweak drawer menu icon size ([95a9b45](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/95a9b4566cd485c4087120ef8fd3bb37f0f11c8d))
* **core:** ✨ tweak layout spacing ([80d3a0a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/80d3a0acbc09d51cf709ab47d50bc6254da02356))
* **core:** ✨ tweak responsive layout ([ceaf3ed](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ceaf3ed844ac089e585c5bf8fcbe35441c02bbff))
* **core:** ✨ tweak sticky header styles ([a1c5ec7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a1c5ec782a6794152c98bfd55caab55c0c0dde49))
* **core:** ✨ tweak sticky header transition ([ab7b9ba](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ab7b9ba17de69838298519c877db4740a80f5e7e))
* **core:** ✨ update catlinks styles ([6bc611a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6bc611adcde9ed6f051031c9c95b657985a58154))
* **core:** ✨ update edit section styles ([2e9f906](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2e9f9067af08d759d91103f441e24c5b8dd7af94))
* **core:** ✨ update external link styles ([8af7357](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8af7357f0678053cf6e60b7af139157ef76e07fe))
* **core:** ✨ update file page design ([bb38bc6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bb38bc6b8b39650f75977771fd5bdf7bb180ac26))
* **core:** ✨ update list styles ([0c4562f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0c4562f235286e3daa39d7d0741b515a1f69fffa))
* **core:** ✨ update old wikitext editor styles ([d11ee1d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d11ee1d4220e6b1449d772d14eff57f33b8c20b0))
* **core:** ✨ update ToC styles ([427d6a4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/427d6a41e1d81b20000cc3e1ead49670a90aaa6b))
* **core:** ✨ update wikitable styles ([2d5246a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2d5246a8a686b2151d4028b84504f83bac829acc))
* **core:** ✨ use different font weight in different themes ([969cd78](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/969cd787d6fe2959131d1e5511a721af9edceb72))
* **core:** ✨ use relative spacing for caption styles ([6ce7247](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6ce72476169618b8ae35782820ac09366d7bd24a))
* **filepage:** ✨ add hover effect for fullres image ([62cea1e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/62cea1e1ed228528506995c9dbd1ab2e0af2c7b1))
* **filepage:** ✨ tweak image transparency background ([4583d12](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4583d1283d9a908420f17483cda0385b77996ce3))
* **font:** ✨ use GRAD instead of font-weight to adjust contrast ([07d39c1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/07d39c17dc08743413109d71e40791112fa59b7a))
* **pwa:** ✨ use wgLogos for PWA icons ([929fbd7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/929fbd7906535acada35db44df47ef0b8272758c))
* **RelatedArticles:** ✨ tweak gap between cards ([481449c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/481449c748aa8101cca43d1425912871288bbd0b))
* **RelatedArticles:** ✨ update RelatedArticles styles ([3c0eea2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3c0eea263789b4b2bd8bc4a3e36818fe516e64b9))
* **srf:** ✨ update some of the legacy styles ([58279bb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/58279bb34eea3c052a6dde4ef731e6bd1dc5e243))
* **toc:** ✨ move ToC together when user scrolls down ([c65f015](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c65f0151da16db5b434eb2e106ed97cab93145ed))
* **typography:** ✨ same font weight for strong and bold ([f611ac9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f611ac9eef5326351577dfd3ab13beef03912179))
* **wikiEditor:** ✨ rework styles for WikiEditor to grade A ([70fbda4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/70fbda4bbaad8e103c969b9573e8796d1b016d30))


### Bug Fixes

* **core:** 🐛 add missing anonuserpage styles ([5d7ec88](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5d7ec88abb7dbe952ee0c8afef16f6cc065e03d4))
* **core:** 🐛 add missing external link hover state ([0e4cf89](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0e4cf89ad87334ba910fd737a9dbe263b0f9b036))
* **core:** 🐛 add missing layout padding ([d827c2e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d827c2ea12fa99e713faa6c8889eb73e4bb939e2))
* **core:** 🐛 avoid grid content overflow ([a584655](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a584655230be3e73a37856413384a4534ca450bb))
* **core:** 🐛 incorrect icon selector for view button ([cea6b98](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cea6b98f1fb6aba7a9a6e1471c1f32032eedc974))
* **core:** 🐛 remove debug message ([4b79b95](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4b79b95d15e6f0b69787c6fda7d458a9ea24d70a))
* **core:** 🐛 toc indicator clipping ([73fa967](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/73fa96757a3c8f9b2dd0317d1ecc572beeedb6e0))
* **toc:** 🐛 toc popup should be higher in z-index ([f250668](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f2506680123b91f351b69c59d53a76b3ebdc8722))


* **core:** 💥 🔧 bump MediaWiki requirement to 1.39.0 ([e289101](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e2891016b7d16ef56f1cecee8b6619b7a498a151))

## [2.0.0-beta.4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.0.0-beta.3...v2.0.0-beta.4) (2022-11-21)


### Features

* **core:** ✨ scroll instead of wrap pre block ([029361b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/029361b066b47f72240c2ae5c45fb76405ce27f5))
* **core:** ✨ use fixed height for header card ([db9065f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/db9065f88e10a55ee0c17c01b30bdd284e07df33))


### Bug Fixes

* **core:** 🐛 keep inline style for a.image ([88be5ba](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/88be5ba08b64955f1785b0cf288226a31da858b5))
* **search:** hide default MW search suggestion ([af85fb4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/af85fb4b40f37674744dacb3cf31f2e5389de7b1))

## [2.0.0-beta.3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.0.0-beta.2...v2.0.0-beta.3) (2022-10-28)


### Features

* **AJAXPoll:** ✨ add skinStyle for AJAXPoll ([#487](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/487)) ([f1fb553](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f1fb5537c9191387726a9add84edb6b7ee9bd003))
* **core:** ✨ reduce scroll top padding ([9b9b361](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9b9b3613c36d86e64f22401ed409146b13c5d6bd))
* **font:** ✨ replace RobotoVF with RobotoFlex ([8e272a5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8e272a5bd49eec5bfefb12ec84729ba0ae42abc9))
* **font:** ✨ sync cjk font weight with RobotoFlex ([dd82c57](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dd82c571557e5935d110f6c610c7c9ccd9e65458))
* **fonts:** ✨ add Noto Sans CJK font support ([b89873d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b89873d99cf92beca64bf4c0c4ba2c0f9161f8a2))
* **pwa:** ✨ add basic support for service worker ([4f651b4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4f651b41cae76025dff3e1e4e708c4dc49e880c2))
* **pwa:** ✨ use standalone mode ([bc8d1a3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bc8d1a320f619cb03c9206df0a7d571f2ec20f7d))
* **pwa:** ✨ use wgLogos instead ([56005ae](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/56005ae627f7f706e5f1c49edce1753de5253f8c))
* **tabberNeue:** ✨ update active tab selector ([0083d2f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0083d2fb8461b828b7803d0879a1d0583798ea26))


### Bug Fixes

* **core:** 🐛 hide sticky header overflow ([6b9fe9c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6b9fe9c2faa9cf4ae2a3c76051d8bd0dfed9ad80))
* **core:** incorrect content header z-index ([fa3582d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fa3582dfd0fae998e66ce3bafa0668c11988045c))
* **search:** 🐛 encode suggestion URL key ([50a0014](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/50a00143b061bc182727b838016daa59854b3d86))

## [2.0.0-beta.2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.0.0-beta.1...v2.0.0-beta.2) (2022-10-22)


### Features

* **core:** ✨ increase scroll padding ([#533](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/533)) ([911f214](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/911f21420f9d29805e15ae3adce13aca557133e9))
* **core:** ✨ use flex layout for mw-indicators ([55f7bcf](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/55f7bcffad08ef1bd300c816be2fbe0b5fcf1455))
* **core:** ✨ use minimal-ui instead of standalone in webapp manifest ([b51b0c2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b51b0c23326b068c848c782e53975777e6598e8c))
* **pwa:** ✨ add helpful shortcuts to manifest ([ffb4e34](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ffb4e34443568b97bf9ec72563552dc2f4d4adf0))
* **pwa:** ✨ define scope parameter ([5e2be1d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5e2be1d974ab752251e52e113926f3a8519e100f))
* **smw:** revamp SMW skinStyles ([#532](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/532)) ([fa1ae98](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fa1ae98497ee231ea53d1949e581d5c01afb3025))
* **tabberNeue:** ✨ update skinStyles ([5fbba91](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5fbba91fd96e3e5af5909efc242d76f003e4e421))


### Bug Fixes

* **core:** 🐛 incorrect max-height for header card ([24a9078](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/24a907865f138d902fc0c57dda48236b48387aa2))
* **pwa:** 🐛 missing services variable ([72dfe31](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/72dfe31667d13fb22471f3c39f47d616748c489e))

## [2.0.0-beta.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.0.0-beta.0...v2.0.0-beta.1) (2022-10-05)


### Features

* **core:** ✨ remove broken recent change styles ([757cd6a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/757cd6ad171a3ea374dfb944720b2ea1ebafa5bb))
* **core:** ✨ use 100vh instead of 100% for min-height ([ac2559e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ac2559ed8b8cba7d1046c4769336b797801564f5))
* **skinStyles:** ✨ add missing VE styles ([4a7489e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4a7489e19f894f8c4a7904445080c18932d3445a))


### Bug Fixes

* **core:** 🐛 incorrect max height for header card ([0633db4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0633db4d7ba69cf057931dd49168f4ca48f282cb))
* **core:** 🐛 missing z-index for mw-body-header ([92c64be](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/92c64be48b9fda655289f2a6ea382b3d0c2073fc))
* **core:** 🐛 mw-data-content should reserve space for header ([979138d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/979138d251e411f7aa4521fcd7a1b6d58b162ae6))
* **core:** 🐛 ToC card should be above page header ([db05e6d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/db05e6d3cf8bc7ffe1ae706e48b7b42829b25b24))
* **skinStyles:** 🐛 fix Echo overflow in small screens ([5e962b7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5e962b785bd6c7c5b4a962a45f042afc562326f9))
* **skinStyles:** 🐛 incorrect VE new paragraph button color ([a59aeff](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a59aeff4a368f4034108c094f80bb0a2eb02aa98))
* **skinStyles:** 🐛 various clipping in VisualEditor ([d2dca07](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d2dca076184206cec24ba780b46e93c5cd4bb3e5))

## [2.0.0-beta.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.0.0-alpha.2...v2.0.0-beta.0) (2022-10-02)


### Features

* **core:** ✨ smaller footer wordmark size on mobile ([c551225](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c551225ec7a9be273a0d21eacba72644827836d1))


### Bug Fixes

* **skinStyles:** 🐛 incorrect VE dark mode background ([9388b92](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9388b92b2715031395e88f6872fa8c304efc0d9f)), closes [#489](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/489) [#525](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/525)

## [2.0.0-alpha.2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.0.0-alpha.1...v2.0.0-alpha.2) (2022-10-01)


### Features

* **core:** ✨ collapse page tool text below desktop ([6aee9f8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6aee9f8e03c21c3230d8015da154048160211639))
* **core:** ✨ move catlinks to body footer ([9de7a1d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9de7a1d4b2d41911b9f8f2a738c6695efa06fcf2))
* **core:** ✨ move footer info into body footer ([aaad2bb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/aaad2bb92ae079240da9625bb121c9d8a31fc4c0))
* **core:** ✨ move sitenotice out of mw-body ([61e8d05](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/61e8d053c450b581e4bcbca7363a8560e7759499))
* **core:** ✨ page actions should take full width with toc ([9532aa4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9532aa4906caf9b03a2bf3d84083b6f04a5bba1c))
* **core:** ✨ redesign site footer ([4902ae7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4902ae76ab2b88018072dfcfc71756960f94388a))
* **core:** ✨ strict selector for category links ([6b47c86](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6b47c86c70a14172006dd9cf43415036639d86d2))
* **core:** ✨ tweak body footer styles ([bf66c60](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bf66c60f3d5f83fa5aac8649c115748740fb3790))
* **core:** ✨ tweak footer wiki name color ([2e8c98b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2e8c98b755ff0b42e165728e412127f64a01ecc4))
* **core:** ✨ use space unit for drawer ([607c3f2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/607c3f22b2d83bd5589c5749c5a7993ae50566c4))


### Bug Fixes

* **core:** 🐛 incorrect color for footer site description ([bdc58fd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bdc58fdeaf2dcaf7968f849de979fef23d5ad07c))
* **core:** 🐛 incorrect CSS variable name ([17907ea](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/17907ead6ded49c7eec8420f7878504b3d182496))

## [2.0.0-alpha.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2022-09-30)


### Features

* **core:** ✨ add extra page padding on desktop view ([87d1918](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/87d19187707da7d31207a7134b46759fca0985b4))
* **core:** ✨ add jump to top link to sticky header ([5be20a2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5be20a256c3d3080b697f79422c852eeeae12cd7))
* **core:** ✨ add sticky body header ([e72d7c0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e72d7c00a3449424b427ca5a153074e13617cd6a))
* **core:** ✨ more responsive layout for sticky header ([9b1325b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9b1325bcb8b20b1ec74756fbb55c654a269a5eb7))
* **core:** ✨ move fluid sticky transition ([f3e4332](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f3e4332e615fdee1c00120e0868193212ca09831))


### Bug Fixes

* **core:** 🐛 mitigate ToC overlap in various max width ([0058081](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/00580810ecb52589e4e5dc0c83e65c54bf441890))
* **core:** 🐛 sticky header should not trigger in edit mode ([639c378](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/639c3787213f62e1644a26e6e03d5a08187d50a0))
* **core:** 🐛 wiki name wrapping in drawer ([20ed41e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/20ed41ec2c4a5155a7edc0c8c525e6a6cf543e45))

## [2.0.0-alpha.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v1.17.9...v2.0.0-alpha.0) (2022-09-30)


### Features

* **core:** redesign site header ([#521](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/521)) ([6de95d4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6de95d4fec06ec7da8c0249f4c18acbec71d31cb))

### [1.17.9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v1.17.8...v1.17.9) (2022-09-28)


### Features

* defer loading menu wiki logo ([#507](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/507)) ([4aa6626](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4aa6626438a8d30521c0146c73e35dcf2e08ccbd))
* **skinStyles:** add Math skinStyles ([#502](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/502)) ([8c6cdc4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8c6cdc4c296ce5ac412206ef331a019cf00e8765))
* use loose comparison for checking if CitizenShowPageTools is true ([#497](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/497)) ([6384d02](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6384d02b74e56cea3c765d9ba2c755f7fd16a905))


### Bug Fixes

* **ci:** add missing boolean argument ([fec969e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fec969e11ab53911ded33f438e93d0ddef2717c0))
* **ci:** allow composer plugin in config ([a9fb8aa](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a9fb8aacca1aa994b7054016441b6c931713a498))
* **core:** hide double MW search suggestion ([7bec9ef](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7bec9ef10b204d97160c452de4797d8e788b1663)), closes [#520](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/520)
* do not collapse space in highlighted search title ([b15a92c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b15a92c2ff82928ac59fa34ecd73aee971f49b02)), closes [#494](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/494)

### [1.17.8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v1.17.7...v1.17.8) (2022-07-16)


### Bug Fixes

* **core:** config CitizenThemeDefault should set theme correctly ([e53afa5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e53afa51dc3cb8572370257168f92865d4e73df3)), closes [#418](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/418)

### [1.17.7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v1.17.6...v1.17.7) (2022-06-21)


### Features

* **core:** add config to use numberformatter without disabling sitestats ([00e1f57](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/00e1f57bad6adb3a954dc92bc8303a0311414f5e)), closes [#474](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/474)
* **core:** tweak spacing between body header and content ([8c4166a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8c4166ae8fe0ef5372b12001ff90b7e513ec1d39))
* **core:** use URL-safe key for search suggestions ([9fe063a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9fe063acb92058ab00393e15e47d244df9af9c52))
* **skinStyles:** add skinStyles for ManageWiki extension ([f03697f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f03697f30950fdd9d7b6ee15d9f3c3db40318e0d))
* **skinStyles:** make wikieditor font size adjustable ([eb0147e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/eb0147e32fb5ca4f140e1f7716b68029f3f90f85)), closes [#479](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/479)


### Bug Fixes

* **skinStyles:** add missing variables.less import ([#480](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/480)) ([496b6f9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/496b6f9403b1f98db4194a3eed4e966e315cdec5))
* **skinStyles:** dismiss button in CentralNotice should be on top ([64f7e18](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/64f7e18837a33dad508eac4cf051e5040a163a43))

### [1.17.6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v1.17.5...v1.17.6) (2022-06-07)


### Features

* **core:** simplify page header spacing ([8ec0400](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8ec0400b1a0bab518bdd7062f14ee6aaf398b28b))
* **skinStyles:** minor style tweak for RecentChanges ([65be4e8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/65be4e826d5ff33f7603bd49e0aa681e8a04c520))


### Bug Fixes

* **core:** add missing plainlinks styles ([0ffc78c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0ffc78ce9ee83cfc670e6e1bb7df8f339aa08651))
* **core:** center class on thumbnails should center ([#476](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/476)) ([34c300d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/34c300d69cbd80e359b30c524e15a4f1f582eadb))
* **core:** delay blur event for search suggestions ([9d8a631](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9d8a631f44aac6ef97d4e2f51820c533352b5a93)), closes [#404](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/404) [#410](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/410)
* **core:** run script when DOM is ready ([eba2235](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/eba22354e5ba8cfcee2883c8cce3179191f6dc66)), closes [#475](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/475)

### [1.17.5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v1.17.4...v1.17.5) (2022-06-02)


### Features

* **core:** add bottom margin to page header ([dca529b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/dca529b1648468c24270134010a28de4be1bed85))
* **core:** tweak category links styles ([4fbe09f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4fbe09f2125fffb0bb765fb25b077daa01f6a5c7))
* **core:** use default MW gallery styles ([cfc71c0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cfc71c05dcd9b2dde988d75e901d8e2eea33879f)), closes [#413](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/413) [#467](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/467)
* **skinStyles:** add grade B support for RevisionSlider ([d7d512c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d7d512c6d4e157e8c14a0d629dd3fa13f9d53c01))
* **skinStyles:** do not lazyload OOUI font size with skinStyles ([47069b6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/47069b613c113d38cebd4b7744c84511148614a1))
* **skinStyles:** tweak page diff styles ([4645cde](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/4645cdeea72073feb771c17d03218b8ec1648db3)), closes [#472](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/472)
* **skinStyles:** tweak ULS trigger styles ([b05a2e8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b05a2e8221111c1e19ce944d186ff27896aaa54f))


### Bug Fixes

* **core:** check if user is registered before getting edit count ([756e398](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/756e398242d2c936ca7c343a310c45a7baa05e86))
* **core:** define template path in constructor instead ([a20e0dc](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a20e0dc5b2a22ea87232ddc18052f0cee54a6557))
* **core:** source edit button should not collapse itself when VE is selected ([c6b8ba9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c6b8ba9e805a7df48be157504130edda356f3b61))
* **core:** use z-index on popup only to avoid clipping ([2f6d383](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2f6d383d9e54786740067c3dcd4cce80b8265603))
* **skinStyles:** add missing Echo dark styles ([982cb8c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/982cb8c7bac1c7a32da252d9547ef9de02791b16)), closes [#468](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/468)
* **skinStyles:** move personal menu ULS button styles to the right module ([2853a05](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2853a05d8f21e5ebddc89473fee6eaafce968f28))
* **skinStyles:** prevent diff table from overflowing the page ([9000a4e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9000a4e3263fdb6ee086693dff41c1e640989e91))

### [1.17.4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v1.17.3...v1.17.4) (2022-05-26)


### Features

* **core:** only use overflow when needed for mw-body ([6f7f548](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6f7f548680a38a7096b5d00faf337ab6bf65f9b7))


### Bug Fixes

* **core:** call to member function null in user tagline ([320b28c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/320b28c6d9151bd9b6cfa6e586450ed2f74ccad7))
* **core:** incorrect z-index for the inner header container ([7b810b2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7b810b2389c78e8f9d102d7d25e5ebbfa8a3c5e0))
* **core:** invalid class name for RL config callback ([ba87e4d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ba87e4dcba5f4c6e34b0c54ffb6612f88031088c))
* **skinStyles:** incorrect file path for DiscussionTools ([0a0456d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0a0456db970f4839bc33f60c587f2775b48eb848))

### [1.17.3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v1.17.2...v1.17.3) (2022-05-23)


### Features

* **core:** add link to talk page next to skin listing ([23aad4d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/23aad4d389a148adf947fbbc9441b9d71b6df6ff))
* **core:** clean up and tweak z-index usage ([be8b9a0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/be8b9a0a0d75eaca1186a03ae138d9c85e328da2)), closes [#462](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/462)
* **core:** decorate personal menu for anon users ([eaad65f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/eaad65fc3ccaecf3dd5a6c25bc79b7255b200127))
* **core:** do not override blockquote font size ([1b72174](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1b7217457aa606a10e14e0a39d9fcb8449e2b1b4))
* **core:** hide redirect message in search results when not needed ([726a348](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/726a3483693ef2bd2b2f5dbc78cbfe7dbdcccb1d))
* **core:** improve handling of number formatter for site stats ([c0cae44](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c0cae44d41e112a6d3b44c2babea05802d591f69))
* **core:** indicate when search results are from redirects ([a5c52e4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a5c52e48b730ed0d13fa2d1be666d97f1accfb1b))
* **core:** intergrate firstHeading changes from MW 1.39 ([1df970e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1df970eb4160a9b701ae724520ce2c9cb0427b2c))
* **core:** rename `$wgCitizenPortalAttach` to `$wgCitizenSiteToolsPortlet` ([851356f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/851356f3d95370c36ce05b322c7b46976a608800))
* **core:** separate header from personal menu list ([21633dc](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/21633dcd3cb5aad7252575d7caca7453d916ab80))
* **core:** use gap instead of margin for spacing in flexbox ([71999f8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/71999f8838c6f856827732a4611f6e92e3b69787))
* **core:** use keywords for transform origin ([ea87523](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ea875234be4237179944fb113344ccbc460340ad))


### Bug Fixes

* **core:** oversized ULS language toggle under tablet viewport ([c81ba1f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c81ba1f07a699e56dee691a5b177dce510a5c71d))

### [1.17.2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v1.17.1...v1.17.2) (2022-05-18)


### Features

* **core:** remove tabindex from checkbox label button ([08ddb60](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/08ddb60bb624a2a42fbb0f2932e107793db4f08b))
* **core:** update menu to be more inlined with MW core ([1df223a](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1df223abfad46bd08bfdb903276bf19d1b25b586))


### Bug Fixes

* **core:** call to undefined method `RequestContext::getAction()` ([d4c7131](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d4c7131c9f92980848893837de24ca2337f8e61a)), closes [#459](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/459)
* **core:** decoratePersonalMenu should only return array ([176adba](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/176adba1fb42a2e7572ff64d95f004d165b69d49))
* **core:** don't use `getActionName` < MW 1.38 ([bbf7fa8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/bbf7fa8b343dc52b2001d72bc393d295507a7615)), closes [#459](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/459)
* **core:** header function can return null ([#459](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/459)) ([2ec20ba](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2ec20bae5da3ebcc243abaa67bf008e6bc93b4de))

### [1.17.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v1.17.0...v1.17.1) (2022-05-18)


### Features

* **core:** use standard external link icon fo external links ([95a4609](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/95a4609c17adca2f702812b8a8d19dd1d72ea591))


### Bug Fixes

* **core:** incorrect folder name for PSR-4 autoloader ([5960790](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/59607905be1d7094060caa8ab819a6c205f11740))

## [1.17.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v1.16.1...v1.17.0) (2022-05-17)


### Features

* **core:** add language count badge ([9926140](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9926140281436647e780f38ef4e198e03d39d1fa))
* **core:** add language menu to page tools ([442f241](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/442f241641067eb3b99dea1e03f4f4cee5ad9341))
* **core:** change ToC toggle behavior and position ([03d853c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/03d853c50ef68ea4cbb4ed4de4dd7a63834cead0))
* **core:** tweak and clean up ToC card styles ([7bfc9f8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7bfc9f88d7875d83222dfb5b023e66c1c1eca95d))
* **core:** use checkboxHack for page actions more menu ([c6e9bc4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c6e9bc44a9449de2c0fa6ff5b0dde14ca9557de5))
* **core:** use ULS for interwiki language menu if possible ([73c61e9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/73c61e9b373339d150741181d753565db62f7f34))
* **skinStyles:** add responsive layout for ULS ([e7b88d3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e7b88d32a833aa940508f67380425d5efbc7d980))
* **skinStyles:** add skinStyles for Interwiki ([6c6883b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6c6883bb11ef759fcf9ebd7aeb17a656915774a9))
* **skinStyles:** update ULS styles ([95e48b1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/95e48b13d55ccde12db54dcf8735d3e5eb5da28e))


### Bug Fixes

* **core:** add missing SkinAfterPorlet hook ([d030c22](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d030c22810dd05a6de55a16e34a87274d3f1aa5f))
* **core:** mw-list-item does not exist in older MW ([7cdd049](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7cdd049ea998018fbc5276c16750c485e9592683))

### [1.16.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v1.16.0...v1.16.1) (2022-05-13)


### Features

* **core:** add missing title text to preferences button ([895d7c2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/895d7c2398124c5649befdd6efd433d3dc941672))
* **core:** make header icon background scale to font size ([9872a82](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9872a820afc1c8c7d7506e594e8b1ba74f85945b))
* **core:** make range indicator text smaller ([d39deb1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d39deb157c5c735716b57cff166445ec75536975))
* **core:** set accent-color as primary color ([c69f292](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c69f2927efe1a81d6bff6f749c4242b5cdc1802a))
* **core:** set toc-enabled through Mustache template ([e0d5eb9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e0d5eb9657751ea6ef58ff5e3ee5f36170c93931))
* **core:** update checkboxHack API ([b73357c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b73357cf7cc4f3d016bb84e2ecef1573e15cafd0))
* **core:** update preferences menu behavior ([1186bdf](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1186bdf10267b04cf213c0f1fd7a9cbc20f85eee))
* **core:** use relative unit for search suggestion ([7ff415d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7ff415db13e8f372a9b7de973c7dbfd8d1df2015))
* **core:** use relative units for page actions ([3e051f0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3e051f0d67c08274acd959d3aa79ac1d763592e8))
* **core:** use relative units for text and spacing ([0e3ecf1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0e3ecf1415883a498ce8bdece55dd3cd629a3e84))
* **skinStyles:** add grade B support Wikibase ([#439](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/439)) ([3867f15](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3867f1588afb019eaa157063ad521fd98f133afb))
* **skinStyles:** style change number text color ([366dcc5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/366dcc55b1b2a3cebf7e641a8adcd869d4b45f62))


### Bug Fixes

* **core:** incorrect table of content modal location ([5dc456c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5dc456cc6a9855d5c9595a477ae62ef2719a275e))
* **core:** invisible search suggestion item ([5ff7b4c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5ff7b4cf90703e3e490bae332f55f1d851e6f14d))
* **core:** undefined toc script ([ac28ef4](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ac28ef46517be9176e7b0fc663b84a3b2b51f4ff))
* **skinStyles:** duplicated entry in skin.json ([c9514d9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c9514d99f35b43d73cc14a0d8605fae9c178e2fe))
* **skinStyles:** echo header icons should use relative size ([cd36ba6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cd36ba642e5a59c1d73aabd3a141f8f8c019afc0))

## [1.16.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v1.15.0...v1.16.0) (2022-05-10)


### Features

* **core:** add missing user page icon ([75cee0c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/75cee0c3f45d1f91733328c79046f1cc872cbd80))
* **core:** style parenthesis text in FirstHeading differently ([44f9bc0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/44f9bc0a7cac65c4cd2478b5ed919cff2260b332))
* **core:** tweak ToC styles ([b00c7dd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b00c7ddf4a8806427841b55660f40cdd4875cc48))
* **skinStyles:** add Citizen styles to OOUI dialog ([8121ecb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8121ecb8558e8ab7dd08014805e8ec1ef926a555))
* **skinStyles:** add dark styles to source edit summary box ([61d13a0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/61d13a0f99e8f2227f9b9a875bf25e665edffe82))
* **skinStyles:** add missing placeholder style for VE ([9c33c3d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9c33c3dab4b091da7fe2f65be4f05236ef979035))
* **skinStyles:** add Popups settings styles ([09d3014](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/09d301476b1a72946bb4fe9f5332b54f4006254d))
* **skinStyles:** add skinStyles for DiscussionTools ([e5b01e8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e5b01e805ceaf0b290fe8770925c54bc5dc7e541))
* **skinStyles:** contain overscoll in Echo ([e47c1a5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e47c1a5ac44cc5ec46376feac6c23f3efaf50178))
* **skinStyles:** remove top margin for TabberNeue ([a47b53b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a47b53bb9079a967ba0b90db782ffaa9c7e6d424))
* **skinStyles:** tweak Echo popup styles ([398f6da](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/398f6da83df3507c5be2c4be8d7af21d2850dfce))


### Bug Fixes

* **core:** fix overflow in search suggestions ([a3d85bb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a3d85bb8a556d40a3cd65ae294ca0bc8bd2afa67))
* **core:** hover state should be visible on card ([f8d90e1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f8d90e1782fbbf4cae67e63558d67ed454e1f385))
* **skinStyle:** missing dark background for Popups ([c871520](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c87152045a609446b73222ec145d2aed26b3c356))

## [1.15.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v1.14.1...v1.15.0) (2022-05-02)


### Features

* **core:** add animation to page tools more menu ([d286afd](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d286afdfb9ea6640bc32546415be7316dad27e8f))
* **core:** add animation to personal menu ([b4959b1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b4959b1972ae931807f77dbd392178d829b1ef98))
* **core:** add animation to preferences menu ([e6a9bd3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e6a9bd38f1bdc2d39937333f6e177bd9f952be14))
* **core:** add ARIA support to collaspible sections ([76a84d9](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/76a84d9e0004acd8f080aa6e455d4700127821a3))
* **core:** add aria-label for preferences button ([c74f168](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c74f1685d63287b7dac86580c48db98ee8133e71))
* **core:** remove animation from searchbox but keep suggestion on mobile ([41e0832](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/41e0832904966554c3a50da175d178d20f94be75))
* **core:** switch searchbox transitions to scale ([60d57de](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/60d57dea85db97e367183930274cb5d83c59e9a8))
* **core:** toggle visbility in CSS when menu is show/hidden ([e2a6a03](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e2a6a0355c134775f57fe7c88507ad2c423badf2))
* **core:** tweak drawer open transition ([e2da010](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e2da010a906f4e98e39c188927c79e5839f1fd09))
* **core:** tweak sitestats style ([87f6e4f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/87f6e4fa19af402738cdcaef268dd418d2f0eee8))
* **core:** tweak transition timing and curve ([fae6062](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fae606277f0351d8798c4bfeef03fdb1e86af318))
* **skinStyles:** tweak CookieWarning styles ([0f38149](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0f381493f18528eefed567f9b5842c0fdc04e0a6))
* **skinStyles:** update Lingo to grade B ([7800f70](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7800f701c3cdfc79f28ae971b49ca10ec01da2a3))


### Bug Fixes

* **core:** incorrect aria-controls ID in section toggle ([ac3ebf5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/ac3ebf56a27673adc8ccf971d1878c294a8261e8))
* find toolbox explicitly ([#448](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/448)) ([2787d49](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2787d49a96c307789b2fd1b6c6b2a1a8f14b804c))
* lower header z-index to 4 ([b69ca82](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b69ca826508ae6c8ab159a5272f2fe7480dddcbf)), closes [#447](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/447)

### [1.14.1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v1.14.0...v1.14.1) (2022-04-28)


### Features

* **core:** tweak code block styles ([571704f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/571704f3a9555d88cc57d68b6a8767ab1e185b68))
* **skinStyles:** tweak Popup styles ([1a7860e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/1a7860ecb88a89bcbf69466c17a55c5d4038716e))
* **skinStyles:** update StructuredDiscussions to grade B ([da0174c](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/da0174c17eb9036cd24e27ed75a1794c27ea4e00)), closes [#438](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/438)
* unify modal styles ([c23a1d7](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c23a1d78385a5e0e5de7d8c5902a1159310913ee))


### Bug Fixes

* add missing selector in older MW version ([eb9cd37](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/eb9cd37cb764281ca574b88ef2cdc956329e402b))

## [1.14.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v1.13.0...v1.14.0) (2022-04-27)


### Features

* add skinStyles for collapsible toggles in MobileFrontend ([f0b9879](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f0b9879fbdb0f6285c27ef273e70b9fc30962c67))
* allow scripts to run when MobileFrontend is active ([37efe85](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/37efe85bb762b1ae7da73b15a3e7216995c05eb5))
* do not format body content if MobileFrontend is active ([#409](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/409)) ([8eaaecf](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/8eaaecf9570da777c2e7a2f7362951420462f3f1))
* show namespace (e.g. Discussion) on page tools ([37beda8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/37beda8e87559cffad4b21f4108708451c00ccee))
* tweak collapsible toggle size ([9eeac80](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9eeac80bf5005579f736a71096627a549e88f243))
* tweak edit button styles when both visual and source edit are present ([a61635e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a61635ea8fe2c41b4ef7cfa9eab1d22272482252))
* use wikiText icon for source edit when VE is present ([0177a06](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0177a06a2270655efdf549b6fef490a80b3e67c8))


### Bug Fixes

* uncaught value when no theme value is saved ([d22f562](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d22f56281699c301e5c183c2fad13ef66be3f500))

## [1.13.0](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/compare/v1.10.0...v1.13.0) (2022-04-26)


### ⚠ BREAKING CHANGES

* drop security header support

### Features

* add a max height to more action menu ([c51c731](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c51c73159ba16cf183ec531ded8ad7a3549fcc59)), closes [#365](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/365)
* add fading to mw-data-after-content ([9134834](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9134834d6d37af8e65e40543e94d1646837927a3))
* add skinstyles for Cargo main ([0c493f3](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0c493f37da13b783a373687be9d9d8de34c4b0a7))
* add styles for PortableInfobox ([#441](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/441)) ([5202ddb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5202ddbebe89ee9cfe55a5534181f8b83b51338d))
* add styles for SimpleTooltip ([#426](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/426)) ([c0003c2](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c0003c223a8fdb9028791f0b38eb6061243c7595))
* add WSSearchFront skinStyles ([#411](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/411)) ([b35e9c6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/b35e9c6c64747e31f0632c2495ae35dc79a380ac))
* deprecate --background-color-dp-XX in favor of --color-surface-X ([96013bb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/96013bb126797e8ab5db2588979884946e7185e5))
* depreciate theme preferences in MW user preferences ([7ecf3a8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7ecf3a81ebd3e488ab8c20367915e2c08628d660))
* hide toc number by default ([7b7641b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7b7641b366e39f21ca5e440516a14b907feaf06e))
* implement a more adaptive smooth shadow ([47e1259](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/47e1259bc3379029ae1033f79261d9b34c955710))
* implement RTL icons ([6217bad](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6217bad7c0afdfeec6e45276f75ce3a0fb7ad5f8))
* improve contrast of SyntaxHighlight ([17c37f5](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/17c37f5e8c4db92fb5ee3e138672e6ab221aeca6))
* make the Echo badge text smaller ([6667c06](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6667c0628f89924491c4af58181909dcbb1693dc))
* move discussion to the top of the more menu ([f052951](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f05295195a2365d0ffaf752086af852483458932))
* pass styles as style element instead of inline ([2c79c06](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/2c79c061c4f1708a3aa3ba193ad53313b9914954))
* remove letter spacing from wordmark ([a2dffec](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a2dffec7eb95f9ee8013a3f247dfc895deaf3cfa))
* revamp drawer header ([6efff7f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/6efff7f5da15be89a949826572cc4375c523333c))
* show footer desc and tagline in the content language ([#444](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/444)) ([cebc35f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/cebc35fd4bbd217dd5d73807f2b685608c26a1a2))
* sitestats should show exact number when it is <10000 ([3c72992](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3c729928d23e3b99ef0b961800900772aaf67b63))
* tweak category styles ([9041cc6](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/9041cc6f223c0d8e87b26d7833412ec87a23cbef))
* tweak SyntaxHighlight color ([3dddd14](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/3dddd14fd4affba86e324721ffc21efd57bbd9d7))
* update OAuth skinStyles to grade B ([d8cf5e1](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d8cf5e1804d9ed440d9f5ee6fbe9d310da4f6242))
* update Popups skinStyles to grade B ([5cc56ac](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/5cc56acec4fb215c7fda97633f14f658e840b6bd))
* update RelatedArticle skinstyle to grade A ([d5ac0ce](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/d5ac0ce295976378e5f00895a0e4a7be6ea3c862))
* update TabberNeue styles to latest version ([02d9f88](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/02d9f887428e4ff068970bc4522bcec4c78bb920))
* upgrade Popups skinStyles to grade A ([c58e917](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/c58e917ae4160a3a50f4cb4485325e17bd295540))
* use neutral background for search suggestion thumbnails ([59ca621](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/59ca621c800e76945708b433b519299d94cbe7c6))
* use template data for page tools if available ([#440](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/440)) ([449278f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/449278f0bee69390834a0d315e396e662a6f76bd))


### Bug Fixes

* add null check for checkboxObj.target ([fed5369](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/fed5369847dfadc62c491a341498cd0865787720)), closes [#432](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/432)
* add null check for user tagline ([7dbbc6b](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7dbbc6b777faf11b1d766bd4e99d672eaa62a149))
* background clipping between data-after-content and footer ([f24ab7d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f24ab7dd97ed2a839f5eb3d341b9b6f737544649))
* ext.uls.displaysettings: Update class name ([#434](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/434)) ([426f611](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/426f611357f18dd88fd2446e2c87ea10a29e7aee))
* fix eslint no-shadow error ([f5c5c99](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f5c5c996faeb39fd6b56f177d3a0504a87f458f8))
* fix inverted Echo badge indicator ([e6c15cb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/e6c15cb612c7ed10823d26035c4cfaaf221a90e2))
* FOUC of light theme when user is using auto theme and prefer dark ([047f830](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/047f830d1a992313ed871bce3980a6b65ef04d1b))
* incorrect color for SyntaxHighlight ([26cfa2d](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/26cfa2d124e262d651557a5f3fd134c9dfbc4605))
* inverted image in VE edit link widget ([0e4c8a8](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/0e4c8a8a1d4277da7bc89be60f882eb49a307929))
* re-add pointers and border styles to Popups ([7a8d6cb](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/7a8d6cb0aaf599865a85a37eaf9bbaacce4e467c))
* remove indentations ([f5d280e](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/f5d280e4c31487eba61931e8a82f32f142e63dc3))
* remove unused debug code ([a8485ac](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/a8485ac76a488b39f765a3e05a705bb828ecd261))


* drop security header support ([42df59f](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/commit/42df59f2b454b9c7928957da24528cbdfd31fc93))
