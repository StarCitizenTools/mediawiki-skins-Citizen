/*
 * Scroll up Header
 * Modified from https://codepen.io/sajjad/pen/vgEZNy
 */

(function() {
	// Hide header on scroll down
	var didScroll,
		lastScrollTop = 0,
		navbarHeight = 0,
		delta = 0,
		header = document.getElementsByTagName('header')[0],
		headerContainer = document.querySelector('.mw-header-container');

	if (headerContainer !== null) {
		navbarHeight = headerContainer.offsetHeight;
	}

	window.addEventListener('scroll', function() {
		didScroll = true;
	});

	function hasScrolled() {
		var st = window.scrollY,
			body,
			html,
			documentHeight;

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
			body = document.body;
			html = document.documentElement;
			documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

			if (st + window.innerHeight < documentHeight) {
				header.classList.remove('nav-up');
				header.classList.add('nav-down');
			}
		}

		lastScrollTop = st;
	}

	setInterval(function() {
		if (didScroll) {
			hasScrolled();
			didScroll = false;
		}
	}, 250);
})();