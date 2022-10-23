// TODO: Make it actually do something
// See https://gerrit.wikimedia.org/r/c/mediawiki/extensions/MobileFrontend/+/273388/
self.addEventListener( 'install', ( event ) => {
	console.log( 'Service worker installed' );
} );

self.addEventListener( 'activate', ( event ) => {
	console.log( 'Service worker activated' );
} );

self.addEventListener( 'fetch', ( event ) => {
	console.log( 'Service worker fetch' );
} );