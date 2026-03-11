---
title: Extensions
description: Extension enhancements and supported extensions for Citizen
outline: [2, 3]
---

# Extensions

## Extension enhancements

Citizen works out of the box, but these extensions unlock additional features when installed.

### [PageImages](https://www.mediawiki.org/wiki/Extension:PageImages)

Bundled with MediaWiki. Adds thumbnails to command palette results.

### [TextExtracts](https://www.mediawiki.org/wiki/Extension:TextExtracts)

Bundled with MediaWiki. Adds descriptions to command palette results.

```php [LocalSettings.php]
$wgExtractsExtendRestSearch = true;
```

### [ShortDescription](https://www.mediawiki.org/wiki/Extension:ShortDescription)

Displays a short description under the page title and in command palette results. Takes priority over TextExtracts when set.

### [MediaSearch](https://www.mediawiki.org/wiki/Extension:MediaSearch)

Adds a media search action to command palette results. Works automatically when installed.

### [MobileFrontend](https://www.mediawiki.org/wiki/Extension:MobileFrontend)

::: warning Not recommended
Citizen is a fully responsive skin, so MobileFrontend's separate mobile experience is redundant and may conflict with Citizen's layout.
:::

If you still need MobileFrontend, set the default mobile skin to Citizen:

```php [LocalSettings.php]
$wgDefaultMobileSkin = 'citizen';
```

### [RelatedArticles](https://www.mediawiki.org/wiki/Extension:RelatedArticles)

Shows related pages in the command palette when no query is entered. To also show them at the bottom of pages:

```php [LocalSettings.php]
$wgRelatedArticlesFooterAllowedSkins[] = 'citizen';
```

### [Semantic MediaWiki](https://www.mediawiki.org/wiki/Extension:Semantic_MediaWiki)

Adds an Ask query mode to the command palette. Type `/smw:` to build structured queries with autocomplete for properties, categories, and values. Works automatically when installed.

### [TemplateStylesExtender](https://www.mediawiki.org/wiki/Extension:TemplateStylesExtender)

Only needed if you use [TemplateStyles](https://www.mediawiki.org/wiki/Extension:TemplateStyles). Enables CSS variables in TemplateStyles, including Citizen's design tokens.

## Extension styles

::: tip
Citizen provides custom styles for many popular extensions via [skinStyles](https://www.mediawiki.org/wiki/Manual:$wgResourceModuleSkinStyles). These apply automatically when the extension is installed.
:::

### Supported extensions

- [AccountInfo](https://www.mediawiki.org/wiki/Extension:AccountInfo)
- [AdvancedSearch](https://www.mediawiki.org/wiki/Extension:AdvancedSearch)
- [AJAXPoll](https://www.mediawiki.org/wiki/Extension:AJAXPoll)
- [ApprovedRevs](https://www.mediawiki.org/wiki/Extension:Approved_Revs)
- [Capiunto](https://www.mediawiki.org/wiki/Extension:Capiunto)
- [Cargo](https://www.mediawiki.org/wiki/Extension:Cargo)
- [CategoryTree](https://www.mediawiki.org/wiki/Extension:CategoryTree)
- [CentralNotice](https://www.mediawiki.org/wiki/Extension:CentralNotice)
- [Cite](https://www.mediawiki.org/wiki/Extension:Cite)
- [CiteThisPage](https://www.mediawiki.org/wiki/Extension:CiteThisPage)
- [CleanChanges](https://www.mediawiki.org/wiki/Extension:CleanChanges)
- [CodeEditor](https://www.mediawiki.org/wiki/Extension:CodeEditor)
- [CodeMirror](https://www.mediawiki.org/wiki/Extension:CodeMirror)
- [CommentStreams](https://www.mediawiki.org/wiki/Extension:CommentStreams)
- [CookieWarning](https://www.mediawiki.org/wiki/Extension:CookieWarning)
- [DataMaps](https://www.mediawiki.org/wiki/Extension:DataMaps)
- [DiscussionTools](https://www.mediawiki.org/wiki/Extension:DiscussionTools)
- [DismissableSiteNotice](https://www.mediawiki.org/wiki/Extension:DismissableSiteNotice)
- [Echo](https://www.mediawiki.org/wiki/Extension:Echo)
- [FlaggedRevs](https://www.mediawiki.org/wiki/Extension:FlaggedRevs)
- [FloatingUI](https://www.mediawiki.org/wiki/Extension:FloatingUI)
- [Flow (StructuredDiscussions)](https://www.mediawiki.org/wiki/Extension:StructuredDiscussions)
- [Graph](https://www.mediawiki.org/wiki/Extension:Graph)
- [Interwiki](https://www.mediawiki.org/wiki/Extension:Interwiki)
- [Lingo](https://www.mediawiki.org/wiki/Extension:Lingo)
- [MediaSearch](https://www.mediawiki.org/wiki/Extension:MediaSearch)
- [MsUpload](https://www.mediawiki.org/wiki/Extension:MsUpload)
- [MultimediaViewer](https://www.mediawiki.org/wiki/Extension:MultimediaViewer)
- [OAuth](https://www.mediawiki.org/wiki/Extension:OAuth)
- [Popups](https://www.mediawiki.org/wiki/Extension:Popups)
- [PortableInfobox](https://www.mediawiki.org/wiki/Extension:PortableInfobox)
- [RelatedArticles](https://www.mediawiki.org/wiki/Extension:RelatedArticles)
- [ReplaceText](https://www.mediawiki.org/wiki/Extension:ReplaceText)
- [RevisionSlider](https://www.mediawiki.org/wiki/Extension:RevisionSlider)
- [Score](https://www.mediawiki.org/wiki/Extension:Score)
- [Scribunto](https://www.mediawiki.org/wiki/Extension:Scribunto)
- [SearchDigest](https://www.mediawiki.org/wiki/Extension:SearchDigest)
- [Semantic MediaWiki](https://www.mediawiki.org/wiki/Extension:Semantic_MediaWiki)
- [Semantic Result Formats](https://www.mediawiki.org/wiki/Extension:Semantic_Result_Formats)
- [SimpleTooltip](https://www.mediawiki.org/wiki/Extension:SimpleTooltip)
- [SmiteSpam](https://www.mediawiki.org/wiki/Extension:SmiteSpam)
- [StructuredNavigation](https://www.mediawiki.org/wiki/Extension:StructuredNavigation)
- [SyntaxHighlight](https://www.mediawiki.org/wiki/Extension:SyntaxHighlight)
- [Tabber](https://www.mediawiki.org/wiki/Extension:Tabber)
- [TabberNeue](https://www.mediawiki.org/wiki/Extension:TabberNeue)
- [Tabs](https://www.mediawiki.org/wiki/Extension:Tabs)
- [TemplateData](https://www.mediawiki.org/wiki/Extension:TemplateData)
- [TimedMediaHandler](https://www.mediawiki.org/wiki/Extension:TimedMediaHandler)
- [TinyMCE](https://www.mediawiki.org/wiki/Extension:TinyMCE)
- [Translate](https://www.mediawiki.org/wiki/Extension:Translate)
- [TwoColConflict](https://www.mediawiki.org/wiki/Extension:TwoColConflict)
- [UniversalLanguageSelector](https://www.mediawiki.org/wiki/Extension:UniversalLanguageSelector)
- [UploadWizard](https://www.mediawiki.org/wiki/Extension:UploadWizard)
- [UserProfileV2](https://gitlab.com/telepedia/extensions/userprofilev2)
- [VEForAll](https://www.mediawiki.org/wiki/Extension:VEForAll)
- [VisualEditor](https://www.mediawiki.org/wiki/Extension:VisualEditor)
- [Wikibase](https://www.mediawiki.org/wiki/Extension:Wikibase)
- [WikiEditor](https://www.mediawiki.org/wiki/Extension:WikiEditor)
- [WSSearchFront](https://www.mediawiki.org/wiki/Extension:WSSearchFront)
