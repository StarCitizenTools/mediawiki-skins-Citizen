#! /bin/bash

set -e

MW_BRANCH=$1

wget "https://github.com/wikimedia/mediawiki/archive/refs/heads/$MW_BRANCH.tar.gz" -nv

tar -zxf $MW_BRANCH.tar.gz
mv mediawiki-$MW_BRANCH mediawiki

cd mediawiki

# Tarball doesn't include phpunit.xml.dist, which is needed for PHPUnit tests
wget "https://raw.githubusercontent.com/wikimedia/mediawiki/$MW_BRANCH/phpunit.xml.dist" -nv

composer install
php maintenance/install.php --dbtype sqlite --dbuser root --dbname mw --dbpath $(pwd) --pass AdminPassword WikiName AdminUser

cat <<'EOT' >> LocalSettings.php
error_reporting(E_ALL| E_STRICT);
ini_set("display_errors", "1");
$wgShowExceptionDetails = true;
$wgShowDBErrorBacktrace = true;
$wgDevelopmentWarnings = true;
wfLoadSkin( "Citizen" );
EOT
