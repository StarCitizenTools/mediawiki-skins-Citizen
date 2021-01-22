var themeToggle = require( './themeToggle.js' ),
	search = require( './search.js' ),
	checkboxHack = require( './checkboxHack.js' );

/**
 * @return {void}
 */
function main() {
	themeToggle.init();
	search.init();
	checkboxHack.init();
}

main();
