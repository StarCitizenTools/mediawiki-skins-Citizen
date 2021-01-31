/* eslint-disable */
/*
 * Citizen - Inline script used in SkinCitizen.php
 *
 * https://starcitizen.tools
 *
 * Mangle using https://jscompress.com/
 */
window.switchTheme = () => {
	// Generates an array of prefix-(auto|dark|light) strings
	const classNames = (prefix) => {
		return ['auto', 'dark', 'light'].map(themeType => {
			return prefix + themeType;
		});
	}

	const themeToggle = document.getElementById('theme-toggle');

	try {
		const cookieTheme = document.cookie.match(/skin-citizen-theme=(dark|light|auto)/);
		const theme = cookieTheme !== null ? cookieTheme.pop() : null;

		if (theme !== null) {
			// First remove all theme classes
			document.documentElement.classList.remove(...classNames('skin-citizen-'));
			// Then add the right one
			document.documentElement.classList.add('skin-citizen-' + theme);
			themeToggle.classList.remove(...classNames('theme-toggle'))
			themeToggle.classList.add('theme-toggle-' + theme);
		}
	} catch (e) {
	}
}

(() => {
	window.switchTheme()
})();
