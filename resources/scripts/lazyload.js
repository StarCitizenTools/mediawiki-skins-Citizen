/*
 * Citizen - Lazyload JS
 * https://starcitizen.tools
 *
 * Lazyloading images with Native API or IntersectionObserver
 */

// TODO: Implement Native API 

// IntersectionObserver API
if( typeof IntersectionObserver !== "undefined" && "forEach" in NodeList.prototype ) {
    var observer = new IntersectionObserver(function(changes) {
        if ("connection" in navigator && navigator.connection.saveData === true) {
            return;
        }
        changes.forEach(function(change) {
            if(change.isIntersecting) {
                change.target.setAttribute("src", change.target.getAttribute("data-src"));
                if(change.target.hasAttribute("data-srcset")) {
                    change.target.setAttribute("srcset", change.target.getAttribute("data-srcset"));
                }
                observer.unobserve(change.target);
            }
        });
    });
    document.querySelectorAll("img[data-src]").forEach(function(img) {
        observer.observe(img);
    });
}