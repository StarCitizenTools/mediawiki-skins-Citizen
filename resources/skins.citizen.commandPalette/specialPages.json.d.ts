// specialPages.json has no file on disk; ResourceLoader generates it per request
// from ResourceLoaderHooks::getCitizenCommandPaletteSpecialPages.
// Each entry is a canonical special page name, or a [ canonical name, label ]
// pair when the page's first content-language alias differs from its name.
declare const specialPages: ( string | [ string, string ] )[];

export = specialPages;
