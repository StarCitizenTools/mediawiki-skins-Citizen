// Shapes mirror codex-icons: a plain path string, or a direction-aware
// object for an icon that flips in RTL.
module.exports = {
	cdxIconBright: '<path d="M17.07 7.07V2.93h-4.14L10 0 7.07 2.93H2.93v4.14L0 10z"/>',
	cdxIconHalfBright: {
		ltr: '<path d="M17 6.67V3h-4.2L9.87.07 6.94 3H3v3.67L.07 9.6 3 12.53V17z"/>',
		shouldFlip: true
	},
	cdxIconMoon: '<path d="M17.39 15.14A7.33 7.33 0 0111.75 1.6c.23-.11.56-.23.79-.34z"/>'
};
