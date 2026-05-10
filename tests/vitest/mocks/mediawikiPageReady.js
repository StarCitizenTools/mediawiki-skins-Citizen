// Stub for the virtual `mediawiki.page.ready` ResourceLoader module.
//
// Tests that exercise commandPalette.js need a `teleportTarget` element to
// append the palette overlay to. The real module exposes a teleport target
// that lives at the end of <body>; for jsdom we just point at `document.body`
// itself.
//
// Important: this file is loaded once at test start, so `document.body` is
// captured eagerly. Tests typically mutate `document.body.innerHTML` between
// cases — that's safe because we cache the body *element*, not its contents.
// Don't refactor this into something that resolves the body lazily; if a test
// replaces the entire body element (rare), this stub becomes stale.
module.exports = {
	teleportTarget: ( typeof document !== 'undefined' ) ?
		document.body :
		null
};
