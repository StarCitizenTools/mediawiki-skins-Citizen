<?php

$cfg = require __DIR__ . '/../vendor/mediawiki/mediawiki-phan-config/src/config.php';

// Minimum PHP version for MediaWiki 1.43
// Core config is still using 7.4.3
$cfg['minimum_target_php_version'] = '8.1.0';

return $cfg;
