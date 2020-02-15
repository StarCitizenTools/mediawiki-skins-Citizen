/*
 * Citizen - ToC JS
 * https://starcitizen.tools
 *
 * Smooth scroll fallback and Scrollspy
 */

function SmoothScroll() {
	var navLinks, eventListener, link;
	if (!("scrollBehavior" in document.documentElement.style)) {
		navLinks = document.querySelectorAll("#toc a"),
			eventListener = function eventListener(e) {
				e.preventDefault();
				e.target.scrollIntoView({
					behavior: "smooth"
				});
			};

		for (link in navLinks) {
			if (Object.prototype.hasOwnProperty.call(navLinks, link)) {
				navLinks[link].addEventListener("click", eventListener);
			}
		}
	}
},
function ScrollSpy() {
	var sections = document.querySelectorAll(".mw-headline");
	window.addEventListener("scroll", function() {
		var scrollPos =
			document.documentElement.scrollTop || document.body.scrollTop;

		for (var section in sections) {
			if (
				Object.prototype.hasOwnProperty.call(sections, section) &&
				sections[section].offsetTop <= scrollPos
			) {
				var id = mw.util.escapeIdForAttribute(sections[section].id),
					node = document.querySelector('a[href * = "'.concat(id, '"]'))
					.parentNode,
					active = document.querySelector(".active");

				if (active !== null) {
					active.classList.remove("active");
				}

				if (node !== null) {
					node.classList.add("active");
				}
			}
		}
	});
},
function CheckToC() {
	if (document.getElementById("toc")) {
		SmoothScroll();
		ScrollSpy();
	}
};

if (document.readyState !== "loading") {
	CheckToC();
} else if (document.addEventListener) {
	// All modern browsers to register DOMContentLoaded
	document.addEventListener("DOMContentLoaded", CheckToC);
} else {
	// Old IE browsers
	document.attachEvent("onreadystatechange", function() {
		if (document.readyState === "complete") {
			CheckToC();
		}
	});
}