<?php

if ( function_exists( 'wfLoadSkin' ) ) {
	wfLoadSkin( 'Citizen' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
	$wgMessagesDirs['Citizen'] = __DIR__ . '/i18n';

	return true;
}

die( 'This version of the Citizen skin requires MediaWiki 1.31+' );
