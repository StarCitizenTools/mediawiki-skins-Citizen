/*
 * Citizen - ToC JS
 * https://starcitizen.tools
 *
 * Smooth scroll fallback and Scrollspy
 */

const SmoothScroll = () => {
    if (!'scrollBehavior' in document.documentElement.style) {
        const navLinks = document.querySelectorAll('#toc a');

        for (let n in navLinks) {
            if (navLinks.hasOwnProperty(n)) {
                navLinks[n].addEventListener('click', e => {
                    e.preventDefault();
                    document.querySelector(navLinks[n].hash)
                        .scrollIntoView({
                            behavior: "smooth"
                        });
                });
            }
        }
    }
}

const ScrollSpy = () => {
    const sections = document.querySelectorAll('.mw-headline');

    window.onscroll = () => {
        const scrollPos = document.documentElement.scrollTop || document.body.scrollTop;

        for (let s in sections)
            if (sections.hasOwnProperty(s) && sections[s].offsetTop <= scrollPos) {
                const id = mw.util.escapeIdForAttribute(sections[s].id);
                document.querySelector('.active').classList.remove('active');
                document.querySelector(`a[href*="${ id }"]`).parentNode.classList.add('active');
            }
    }
}

const CheckToC = () => {
    if (document.getElementById("toc")) {
        SmoothScroll();
        ScrollSpy();
    }
}

if (document.readyState !== 'loading') {
    CheckToC();
} else if (document.addEventListener) {
    // All modern browsers to register DOMContentLoaded
    document.addEventListener('DOMContentLoaded', CheckToC);
} else {
    // Old IE browsers
    document.attachEvent('onreadystatechange', function() {
        if (document.readyState === 'complete') {
            CheckToC();
        }
    });
}