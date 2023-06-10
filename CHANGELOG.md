# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
