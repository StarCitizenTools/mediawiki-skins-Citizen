/*
 * Citizen - Theme Switcher JS
 * https://starcitizen.tools
 */

(() => {
    if (typeof window.mw === 'undefined') {
        return;
    }

    const isGlobalAutoSet = window.mw.config.get('wgCitizenColorScheme') === 'auto' || window.mw.config.get('wgCitizenColorScheme') === null;

    const isUserPreferenceAuto = window.mw.user.options.get('citizen-color-scheme') === 'auto';

    const enable = isGlobalAutoSet || isUserPreferenceAuto;

    if (!enable) {
        return;
    }

    const switchColorScheme = (useDark) => {
        let dark;
        
        if (useDark) {
            document.documentElement.classList.add('skin-citizen-dark');
            document.documentElement.classList.remove('skin-citizen-light');
            dark = true
        } else {
            document.documentElement.classList.add('skin-citizen-light');
            document.documentElement.classList.remove('skin-citizen-dark');
            dark = false
        }

        try {
            localStorage.setItem('skin-citizen-dark', dark);
        } catch (e) {}
    };

    let useDarkTheme;
    try {
        useDarkTheme = localStorage.getItem('skin-citizen-dark');
    } catch (e) {}

    const prefersColorSchemeDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    if (useDarkTheme || prefersColorSchemeDarkQuery.matches) {
        switchColorScheme(true)
    }
})();