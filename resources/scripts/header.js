/*
 * Scroll up Header
 * Modified from https://codepen.io/sajjad/pen/vgEZNy
 */

(function () {
	// Hide header on scroll down
	let didScroll;
	let lastScrollTop = 0;
	const delta = 0;
	const header = document.getElementsByTagName('header')[0];
	let navbarHeight = 0;
	const headerContainer = document.querySelector('.mw-header-container');
	if (headerContainer !== null) {
		navbarHeight = headerContainer.offsetHeight;
	}

	window.addEventListener('scroll', () => {
		didScroll = true;
	});

	setInterval(function () {
		if (didScroll) {
			hasScrolled();
			didScroll = false;
		}
	}, 250);

	function hasScrolled() {
		const st = window.scrollY;

		// Make scroll more than delta
		if (Math.abs(lastScrollTop - st) <= delta) {
			return;
		}

		if (st > lastScrollTop && st > navbarHeight) {
			// If scrolled down and past the navbar, add class .nav-up.
			// Scroll Down
			header.classList.remove('nav-down');
			header.classList.add('nav-up');
		} else {
			// Scroll Up
			const body = document.body;
			const html = document.documentElement;

			const documentHeight = Math.max(body.scrollHeight, body.offsetHeight,
				html.clientHeight, html.scrollHeight, html.offsetHeight);

			if (st + window.innerHeight < documentHeight) {
				header.classList.remove('nav-up');
				header.classList.add('nav-down');
			}
		}

		lastScrollTop = st;
	}
})();
