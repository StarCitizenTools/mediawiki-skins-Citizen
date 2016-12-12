<?php
/**
 * Initialization file for the External Data extension
 *
 * @file
 * @ingroup ExternalData
 * @author Yaron Koren
 */

// Disabled for now until global variable naming issue is resolved.
if ( false ) { // function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'ExternalData' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
	$wgMessagesDirs['ExternalData'] = __DIR__ . '/i18n';
	$wgExtensionMessagesFiles['ExternalDataMagic'] = __DIR__ . '/ExternalData.i18n.magic.php';
	/* wfWarn(
	'Deprecated PHP entry point used for External Data extension. Please use wfLoadExtension instead, ' .
	'see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	); */
	return;
}

if ( !defined( 'MEDIAWIKI' ) ) die();

$wgExtensionCredits['parserhook'][] = array(
	'path'           => __FILE__,
	'name'           => 'External Data',
	'version'        => '1.8.2',
	'author'         => array( 'Yaron Koren', '...' ),
	'url'            => 'https://www.mediawiki.org/wiki/Extension:External_Data',
	'descriptionmsg' => 'externaldata-desc',
	'license-name'   => 'GPL-2.0+'
);

$wgHooks['ParserFirstCallInit'][] = 'ExternalDataHooks::registerParser';
$wgMessagesDirs['ExternalData'] = __DIR__ . '/i18n';
$wgExtensionMessagesFiles['ExternalData'] = __DIR__ . '/ExternalData.i18n.php';
$wgExtensionMessagesFiles['ExternalDataMagic'] = __DIR__ . '/ExternalData.i18n.magic.php';

// Register all special pages and other classes
$wgAutoloadClasses['ExternalDataHooks'] = __DIR__ . '/ExternalData.hooks.php';
$wgAutoloadClasses['EDUtils'] = __DIR__ . '/ED_Utils.php';
$wgAutoloadClasses['EDParserFunctions'] = __DIR__ . '/ED_ParserFunctions.php';
$wgSpecialPages['GetData'] = 'EDGetData';
$wgAutoloadClasses['EDGetData'] = __DIR__ . '/ED_GetData.php';

$edgValues = array();
$edgStringReplacements = array();
$edgCacheTable = null;
$edgAllowSSL = true;
$edgExternalValueVerbose = true;

// Value is in seconds - set to one week
$edgCacheExpireTime = 60 * 60 * 24 * 7;

$edgDBServer = array();
$edgDBServerType = array();
$edgDBName = array();
$edgDBUser = array();
$edgDBPass = array();
$edgDBDirectory = array();
$edgDBFlags = array();
$edgDBTablePrefix = array();

$edgDirectoryPath = array();
$edgFilePath = array();

function edgRegisterParser( &$parser ) {
	$parser->setFunctionHook( 'get_web_data', array( 'EDParserFunctions', 'doGetWebData' ) );
	$parser->setFunctionHook( 'get_file_data', array( 'EDParserFunctions', 'doGetFileData' ) );
	$parser->setFunctionHook( 'get_soap_data', array( 'EDParserFunctions', 'doGetSOAPData' ) );
	$parser->setFunctionHook( 'get_ldap_data', array( 'EDParserFunctions', 'doGetLDAPData' ) );
	$parser->setFunctionHook( 'get_db_data', array( 'EDParserFunctions', 'doGetDBData' ) );
	$parser->setFunctionHook( 'external_value', array( 'EDParserFunctions', 'doExternalValue' ) );
	$parser->setFunctionHook( 'for_external_table', array( 'EDParserFunctions', 'doForExternalTable' ) );
	$parser->setFunctionHook( 'display_external_table', array( 'EDParserFunctions', 'doDisplayExternalTable' ) );
	$parser->setFunctionHook( 'store_external_table', array( 'EDParserFunctions', 'doStoreExternalTable' ) );
	$parser->setFunctionHook( 'clear_external_data', array( 'EDParserFunctions', 'doClearExternalData' ) );

	return true; // always return true, in order not to stop MW's hook processing!
}
