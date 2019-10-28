/*
 * Scroll up Header
 * Modified from https://codepen.io/sajjad/pen/vgEZNy
 * TODO: Convert to Vanilla JS
 */

// Hide header on scroll down
var didScroll;
var lastScrollTop = 0;
var delta = 0;
var navbarHeight = $('.mw-header-container').outerHeight();

$(window).scroll(function(event) {
    didScroll = true;
});

setInterval(function() {
    if (didScroll) {
        hasScrolled();
        didScroll = false;
    }
}, 250);

function hasScrolled() {
    var st = $(this).scrollTop();

    // Make scroll more than delta
    if (Math.abs(lastScrollTop - st) <= delta)
        return;

    // Remove class when header is back in place
    if (document.body.scrollTop == 0) {
        $('header').removeClass('nav-down');
    } else if (st > lastScrollTop && st > navbarHeight) {
        // If scrolled down and past the navbar, add class .nav-up.
        // Scroll Down
        $('header').removeClass('nav-down').addClass('nav-up');
    } else {
        // Scroll Up
        if (st + $(window).height() < $(document).height()) {
            $('header').removeClass('nav-up').addClass('nav-down');
        }
    }

    lastScrollTop = st;
}