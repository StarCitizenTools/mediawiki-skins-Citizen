# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
