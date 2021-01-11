/* eslint-disable */
/*
 * Citizen - Inline script used in SkinCitizen.php
 *
 * https://starcitizen.tools
 */
window.switchTheme = () => {
	try {
		const cookieTheme = document.cookie.match(/skin-citizen-theme=(dark|light|auto)/);
		const theme = cookieTheme !== null ? cookieTheme.pop() : null;

		if (theme !== null) {
			document.documentElement.classList.remove(...['auto', 'dark', 'light'].map(theme => {
				return 'skin-citizen-' + theme;
			}));
			document.documentElement.classList.add('skin-citizen-' + theme);
		}
	} catch (e) {
	}
}

(() => {
	window.switchTheme()
})();
