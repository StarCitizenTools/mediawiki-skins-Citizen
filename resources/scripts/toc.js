/*
 * Citizen - ToC JS
 * https://starcitizen.tools
 *
 * Smooth scroll fallback and Scrollspy
 */

const SmoothScroll = () => {
	if (!('scrollBehavior' in document.documentElement.style)) {
		const navLinks = document.querySelectorAll('#toc a');

		const eventListener = e => {
			e.preventDefault();
			document.querySelector(navLinks[n].hash)
				.scrollIntoView({
					behavior: "smooth"
				});
		};

		for (let n in navLinks) {
			if (navLinks.hasOwnProperty(n)) {
				navLinks[n].addEventListener('click', eventListener);
			}
		}
	}
};

const ScrollSpy = () => {
	const sections = document.querySelectorAll('.mw-headline');

	window.addEventListener('scroll', () => {
		const scrollPos = document.documentElement.scrollTop || document.body.scrollTop;

		for (let s in sections) {
			if (sections.hasOwnProperty(s) && sections[s].offsetTop <= scrollPos) {
				const id = mw.util.escapeIdForAttribute(sections[s].id);
				document.querySelector('.active').classList.remove('active');

				const node = document.querySelector(`a[href * = "${id}"]`).parentNode;
				if (node !== null) {
					node.classList.add('active');
				}
			}
		}
	});
};

const CheckToC = () => {
	if (document.getElementById('toc')) {
		SmoothScroll();
		ScrollSpy();
	}
};

if (document.readyState !== 'loading') {
	CheckToC();
} else if (document.addEventListener) {
	// All modern browsers to register DOMContentLoaded
	document.addEventListener('DOMContentLoaded', CheckToC);
} else {
	// Old IE browsers
	document.attachEvent('onreadystatechange', function () {
		if (document.readyState === 'complete') {
			CheckToC();
		}
	});
}