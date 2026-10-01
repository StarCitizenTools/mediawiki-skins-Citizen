// specialPages.json has no file on disk; ResourceLoader generates it per request
// from ResourceLoaderHooks::getCitizenCommandPaletteSpecialPages.
// Each entry is a canonical special page name when the page has no other name,
// or else [ canonical name, local name, ...other aliases ], where the local name
// is the one the wiki redirects every other name to.
declare const specialPages: ( string | [ string, string, ...string[] ] )[];

export = specialPages;
