# Force phpcbf to exit with zero
# See https://github.com/squizlabs/PHP_CodeSniffer/issues/1818#issuecomment-354420927

root=$( dirname $0 )/..

$root/vendor/bin/phpcbf

exit 0
