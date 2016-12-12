<?php
# Protect against web entry
if ( !defined( 'MEDIAWIKI' ) ) {
	exit;
}

#General Settings
$wgSitename = "Star Citizen";
$wgMetaNamespace = "Star_Citizen";

## The URL base path to the directory containing the wiki;
## defaults for all runtime URL paths are based off of this.
## For more information on customizing the URLs
## (like /w/index.php/Page_title to /wiki/Page_title) please see:
## https://www.mediawiki.org/wiki/Manual:Short_URL
$wgScriptPath = "";
$wgScriptExtension = "$wgScriptPath/index.php";
$wgRedirectScript   = "$wgScriptPath/redirect.php";
$wgArticlePath = "/$1";

## The protocol and server name to use in fully-qualified URLs
$wgServer = "https://starcitizen.tools";

## The URL path to static resources (images, scripts, etc.)
$wgResourceBasePath = $wgScriptPath;

## The URL path to the logo.  Make sure you change this from the default,
## or else you'll overwrite your logo when you upgrade!
$wgLogo = "$wgResourceBasePath/resources/assets/sclogo.png";

## UPO means: this is also a user preference option
$wgEnableEmail = true;
$wgEnableUserEmail = true; # UPO

$wgEmergencyContact = "root@scw.czen.me";
$wgPasswordSender = "do-not-reply@starcitizen.tools";

$wgEnotifUserTalk = false; # UPO
$wgEnotifWatchlist = false; # UPO
$wgEmailAuthentication = true;

# MySQL table options to use during installation or update
$wgDBTableOptions = "ENGINE=InnoDB, DEFAULT CHARSET=utf8";

# Experimental charset support for MySQL 5.0.
$wgDBmysql5 = false;

## Shared memory settings
$wgMainCacheType = 'redis';
$wgSessionCacheType = 'redis';
$wgMemCachedServers = array();

## To enable image uploads, make sure the 'images' directory
## is writable, then set this to true:
$wgEnableUploads = true;
$wgGenerateThumbnailOnParse = true;
$wgUseImageMagick = true;
$wgImageMagickConvertCommand = "/usr/bin/convert";

# InstantCommons allows wiki to use images from https://commons.wikimedia.org
$wgUseInstantCommons = false;

## If you use ImageMagick (or any other shell command) on a
## Linux server, this will need to be set to the name of an
## available UTF-8 locale
$wgShellLocale = "en_US.utf8";

## If you want to use image uploads under safe mode,
## create the directories images/archive, images/thumb and
## images/temp, and make them all writable. Then uncomment
## this, if it's not already uncommented:
#$wgHashedUploadDirectory = false;

## Set $wgCacheDirectory to a writable directory on the web server
## to make your wiki go slightly faster. The directory should not
## be publically accessible from the web.
$wgCacheDirectory = "$IP/cache";

# Site language code, should be one of the list in ./languages/Names.php
$wgLanguageCode = "en";

## For attaching licensing metadata to pages, and displaying an
## appropriate copyright notice / icon. GNU Free Documentation
## License and Creative Commons licenses are supported so far.
$wgRightsPage = ""; # Set to the title of a wiki page that describes your license/copyright
$wgRightsUrl = "https://creativecommons.org/licenses/by-sa/3.0/";
$wgRightsText = "Creative Commons Attribution-ShareAlike";
$wgRightsIcon = "$wgResourceBasePath/resources/assets/licenses/cc-by-sa.png";
$wgFavicon = "$wgScriptPath/favicon.png";

# Path to the GNU diff3 utility. Used for conflict resolution.
$wgDiff3 = "/usr/bin/diff3";

# The following permissions were set based on your choice in the installer

$wgAllowUserCss = true;


## Default skin: you can change the default skin. Use the internal symbolic
## names, ie 'vector', 'monobook':
$wgDefaultSkin = "vector";

# Enabled skins.
# The following skins were automatically enabled:
wfLoadSkin( 'Vector' );
wfLoadSkin( 'Citizen' );

#Maintenance
#$wgReadOnly = 'Maintenance is underway. Website is on read-only mode';

#SVG Support
$wgFileExtensions[] = 'svg';
$wgAllowTitlesInSVG = true;
$wgSVGConverter = 'ImageMagick';

#Javascript
$wgHooks['BeforePageDisplay'][] ='onBeforePageDisplay';

function onBeforePageDisplay( OutputPage &$out, Skin &$skin )
{
    $script = '<script></script>';
    $out->addHeadItem("head script", $script);
    return true;
};
#=============================================== External Includes ===============================================

require_once("/home/www-data/external_includes/mysql_pw.php")
require_once("/home/www-data/external_includes/secret_keys.php")

#=============================================== Extension Load ===============================================

wfLoadExtension( 'ParserFunctions' );
wfLoadExtension( 'EmbedVideo' );
wfLoadExtension( 'MsUpload' );
wfLoadExtension( 'InputBox' );
wfLoadExtension( 'WikiSEO' );
wfLoadExtension( 'Cite' );
wfLoadExtension("DynamicPageList");
wfLoadExtension( 'Nuke' );
wfLoadExtension( 'CommonsMetadata' );
wfLoadExtension( 'ReplaceText' );
wfLoadExtension( 'TextExtracts' );
wfLoadExtension( 'Popups' );
wfLoadExtension( 'RevisionSlider' );
wfLoadExtension( 'CheckUser' );
wfLoadExtension( 'Babel' );
wfLoadExtension( 'cldr' );
#wfLoadExtension( 'CleanChanges' );
wfLoadExtension( 'LocalisationUpdate' );
wfLoadExtension( 'UniversalLanguageSelector' );
wfLoadExtensions( array( 'ConfirmEdit', 'ConfirmEdit/ReCaptchaNoCaptcha' ) );
require_once "$IP/extensions/Tabber/Tabber.php";
require_once "$IP/extensions/RSS/RSS.php";
require_once "$IP/extensions/PageImages/PageImages.php";
require_once "$IP/extensions/MultimediaViewer/MultimediaViewer.php";
require_once "$IP/extensions/Echo/Echo.php";
require_once "$IP/extensions/Flow/Flow.php";
require_once "$IP/extensions/Translate/Translate.php";
require_once "$IP/extensions/googleAnalytics/googleAnalytics.php";
require_once "$IP/extensions/VisualEditor/VisualEditor.php";
require_once "$IP/extensions/Scribunto/Scribunto.php";
require_once( "$IP/extensions/UploadWizard/UploadWizard.php" );
require_once "$IP/extensions/EventLogging/EventLogging.php";
require_once "$IP/extensions/ExternalData/ExternalData.php";
#require_once "$IP/extensions/Antispam/Antispam.php";

#=============================================== Extension Config ===============================================

#Flow
$wgFlowEditorList = array( 'visualeditor', 'none' );
$wgFlowContentFormat = 'html';

#UploadWizard
$wgApiFrameOptions = 'SAMEORIGIN';
$wgUploadNavigationUrl = '/Special:UploadWizard';
$wgUploadWizardConfig = array(
	'debug' => false,
	'altUploadForm' => 'Special:Upload',
	'fallbackToAltUploadForm' => false,
	'enableFormData' => true,
	'enableMultipleFiles' => true,
	'enableMultiFileSelect' => false,
	'tutorial' => array(
	 	'skip' => true
		),
	'maxUploads' => 15,
	'fileExtensions' => $wgFileExtensions
	);

#TextExtracts
$wgExtractsRemoveClasses[] = 'dablink';
$wgExtractsRemoveClasses[] = 'translate';

#MsUpload
$wgMSU_useDragDrop = true;
$wgMSU_showAutoCat = true;

#MultimediaViewer
$wgMediaViewerEnableByDefault = true;
$wgMediaViewerEnableByDefaultForAnonymous = true;

#ConfirmEdit
$wgCaptchaClass = 'ReCaptchaNoCaptcha';

#CleanChanges
$wgCCTrailerFilter = true;
$wgCCUserFilter = false;
$wgDefaultUserOptions['usenewrc'] = 1;

#Translate
$wgLocalisationUpdateDirectory = "$IP/cache";
$wgTranslateDocumentationLanguageCode = 'qqq';
$wgExtraLanguageNames['qqq'] = 'Message documentation'; # No linguistic content. Used for documenting messages

#Google Analytics
$wgGoogleAnalyticsAccount = 'UA-48789297-5';

#ExternalData
# $edgCacheTable = 'ed_url_cache'; Need to run ExternalData.sql first
$edgCacheExpireTime = 3 * 24 * 60 * 60;
$edgAllowExternalDataFrom = 'http://starcitizendb.com/';

#Visual Editor
$wgDefaultUserOptions['visualeditor-enable'] = 1;
$wgHiddenPrefs[] = 'visualeditor-enable';

#Eventlogging
$wgEventLoggingBaseUri = 'https://starcitizen.tools:8080/event.gif';
$wgEventLoggingFile = '/var/log/mediawiki/events.log';

#Scribunto
$wgScribuntoDefaultEngine = 'luasandbox';

#Redis
/** @see RedisBagOStuff for a full explanation of these options. **/
$wgObjectCaches['redis'] = array(
    'class'                => 'RedisBagOStuff',
    'servers'              => array( '127.0.0.1:6379' ),
    // 'connectTimeout'    => 1,
    // 'persistent'        => false,
    // 'password'          => 'secret',
    // 'automaticFailOver' => true,
);

#$wgJobTypeConf['default'] = array(
#  'class'          => 'JobQueueRedis',
#  'redisServer'    => '127.0.0.1:6379',
#  'redisConfig'    => array(),
#  'claimTTL'       => 3600
#);

#parsoid
$wgVirtualRestConfig['modules']['parsoid'] = array(
  // URL to the Parsoid instance
  // Use port 8142 if you use the Debian package
  'url' => 'http://localhost:8142',
  'domain' => 'localhost'
);

#=============================================== Namespaces ===============================================

$wgNamespaceContentModels[NS_TALK] = CONTENT_MODEL_FLOW_BOARD;
$wgNamespaceContentModels[NS_USER_TALK] = CONTENT_MODEL_FLOW_BOARD;
$wgNamespaceContentModels[NS_COMMLINK_TALK] = CONTENT_MODEL_FLOW_BOARD;
$wgNamespaceContentModels[NS_PROJECT_TALK] = CONTENT_MODEL_FLOW_BOARD;
$wgNamespaceContentModels[NS_FILE_TALK] = CONTENT_MODEL_FLOW_BOARD;
$wgNamespaceContentModels[NS_MEDIAWIKI_TALK] = CONTENT_MODEL_FLOW_BOARD;
$wgNamespaceContentModels[NS_TEMPLATE_TALK] = CONTENT_MODEL_FLOW_BOARD;
$wgNamespaceContentModels[NS_HELP_TALK] = CONTENT_MODEL_FLOW_BOARD;
$wgNamespaceContentModels[NS_CATEGORY_TALK] = CONTENT_MODEL_FLOW_BOARD;
$wgNamespaceContentModels[NS_TRANSLATIONS_TALK] = CONTENT_MODEL_FLOW_BOARD;
$wgNamespaceContentModels[NS_PROJMGMT_TALK] = CONTENT_MODEL_FLOW_BOARD;
$wgNamespaceContentModels[NS_ISSUE_TALK] = CONTENT_MODEL_FLOW_BOARD;

$wgNamespaceProtection[NS_TEMPLATE] = array( 'template-edit' );

define("NS_COMMLINK", 3000);
define("NS_COMMLINK_TALK", 3001);
$wgExtraNamespaces[NS_COMMLINK] = "Comm-Link";
$wgExtraNamespaces[NS_COMMLINK_TALK] = "Comm-Link_talk";
$wgNamespacesWithSubpages[3001] = true;
$wgNamespacesToBeSearchedDefault[NS_COMMLINK] = true;

define("NS_PROJMGMT", 3002);
define("NS_PROJMGMT_TALK", 3003);
$wgExtraNamespaces[NS_PROJMGMT] = "ProjMGMT";
$wgExtraNamespaces[NS_PROJMGMT_TALK] = "ProjMGMT_talk";
$wgNamespacesWithSubpages[NS_PROJMGMT] = true;
#$wgNamespacesToBeSearchedDefault[NS_PROJMGMT] = true;

define("NS_ISSUE", 3004);
define("NS_ISSUE_TALK", 3005);
$wgExtraNamespaces[NS_ISSUE] = "Issue";
$wgExtraNamespaces[NS_ISSUE_TALK] = "Issue_talk";
$wgNamespacesWithSubpages[NS_ISSUE] = true;
#$wgNamespacesToBeSearchedDefault[NS_ISSUE] = true;

$wgVisualEditorAvailableNamespaces = array(
NS_MAIN     => true,
NS_USER     => true,
NS_HELP     => true,
NS_PROJECT  => true,
NS_COMMLINK => true,
NS_PROJMGMT => true,
NS_ISSUE		=> true
);

#=============================================== Permissions ===============================================
#All
$wgGroupPermissions['*']['createaccount'] = true;
$wgGroupPermissions['*']['edit'] = false;

#User
$wgGroupPermissions['user']['edit'] = false;
$wgGroupPermissions['user']['minoredit'] = false;
$wgGroupPermissions['user']['move'] = false;
$wgGroupPermissions['user']['movefile'] = false;
$wgGroupPermissions['user']['move-categorypages'] = false;
$wgGroupPermissions['user']['move-rootuserpages'] = false;
$wgGroupPermissions['user']['move-subpages'] = false;
$wgGroupPermissions['user']['reupload'] = false;
$wgGroupPermissions['user']['translate'] = false;
$wgGroupPermissions['user']['translate-import'] = false;
$wgGroupPermissions['user']['translate-groupreview'] = false;
$wgGroupPermissions['user']['flow-lock'] = false;

#Verified
$wgGroupPermissions['Verified'] = $wgGroupPermissions['user'];
$wgGroupPermissions['Verified']['edit'] = true;
$wgGroupPermissions['Verified']['skipcaptcha'] = true;

#Translator
$wgGroupPermissions['Translator'] = $wgGroupPermissions['Verified'];
$wgGroupPermissions['Translator']['translate'] = true;
$wgGroupPermissions['Translator']['translate-import'] = true;
$wgGroupPermissions['Translator']['translate-messagereview'] = true;

#Trusted
$wgGroupPermissions['Trusted'] = $wgGroupPermissions['Verified'];
$wgGroupPermissions['Trusted']['minoredit'] = true;
$wgGroupPermissions['Trusted']['autoconfirmed'] = true;
$wgGroupPermissions['Trusted']['move'] = true;
$wgGroupPermissions['Trusted']['move-subpages'] = true;
$wgGroupPermissions['Trusted']['reupload'] = true;

#Editor
$wgGroupPermissions['Editor'] = $wgGroupPermissions['Trusted'];
$wgGroupPermissions['Editor']['noratelimit'] = true;
$wgGroupPermissions['Editor']['patrol'] = true;
$wgGroupPermissions['Editor']['delete'] = true;
$wgGroupPermissions['Editor']['movefile'] = true;
$wgGroupPermissions['Editor']['move-categorypages'] = true;
$wgGroupPermissions['Editor']['template-edit'] = true;
$wgGroupPermissions['Editor']['pagetranslation'] = true;
$wgAddGroups['Editor'] = array( 'Verified' );

#Chief Editor
$wgAddGroups['ChiefEditor'] = array( 'Verified', 'Trusted', 'Translator' );
$wgGroupPermissions['ChiefEditor'] = $wgGroupPermissions['Editor'];
$wgGroupPermissions['ChiefEditor']['autopatrol'] = true;
$wgGroupPermissions['ChiefEditor']['editinterface'] = true;
$wgGroupPermissions['ChiefEditor']['block'] = true;
$wgGroupPermissions['ChiefEditor']['protect'] = true;
$wgGroupPermissions['ChiefEditor']['editprotected'] = true;
$wgGroupPermissions['ChiefEditor']['suppressredirect'] = true;
$wgGroupPermissions['ChiefEditor']['undelete'] = true;
$wgGroupPermissions['ChiefEditor']['mergehistory'] = true;
$wgGroupPermissions['ChiefEditor']['bigdelete'] = true;
$wgGroupPermissions['ChiefEditor']['browserarchive'] = true;
$wgGroupPermissions['ChiefEditor']['rollback'] = true;
$wgGroupPermissions['ChiefEditor']['deletedhistory'] = true;
$wgGroupPermissions['ChiefEditor']['deletedtext'] = true;
$wgGroupPermissions['ChiefEditor']['checkuser'] = true;
$wgGroupPermissions['ChiefEditor']['checkuser-log'] = true;
$wgGroupPermissions['ChiefEditor']['flow-create-board'] = true;
$wgGroupPermissions['ChiefEditor']['translate-proofr'] = true;
$wgGroupPermissions['ChiefEditor']['translate-manage'] = true;
$wgGroupPermissions['ChiefEditor']['translate'] = true;
$wgGroupPermissions['ChiefEditor']['translate-groupreview'] = true;
$wgGroupPermissions['ChiefEditor']['replacetext'] = true;

#Administrator
$wgGroupPermissions['Admin']['userrights'] = true;

#Sysop
$wgGroupPermissions['sysop']['pagetranslation'] = true;
$wgGroupPermissions['sysop']['translate-manage'] = true;
$wgGroupPermissions['sysop']['edit'] = true;
