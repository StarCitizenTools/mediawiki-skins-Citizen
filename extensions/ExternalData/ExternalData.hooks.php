<?php

/**
 * Hook functions for the External Data extension.
 *
 * @file
 * @ingroup ExternalData
 * @author Yaron Koren
 */
class ExternalDataHooks {

	public static function registerParser( &$parser ) {
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

}
