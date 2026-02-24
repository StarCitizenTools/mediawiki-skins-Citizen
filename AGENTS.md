# AGENTS.md

## Overview

Citizen is a MediaWiki skin (requires MW 1.43+) built on `SkinMustache`. It uses PHP for server-side rendering, Mustache templates, LESS for styles, and vanilla JS/Vue 3 for client-side interactivity via MediaWiki's ResourceLoader.

## Verification

Run only what's relevant to the files you changed.

| Files changed | Command |
| --- | --- |
| `*.php` | `composer test` (lint and style only) then PHPUnit (see below) |
| `*.js`, `*.vue` | `npm run lint:js` |
| `*.less`, `*.css`, `*.vue` | `npm run lint:styles` |
| `i18n/` | `npm run lint:i18n` |

Auto-fix commands: `composer fix` (PHP), `npm run lint:fix:js` (JS), `npm run lint:fix:styles` (styles).

### PHPUnit

PHPUnit must be run for all PHP changes. Tests must be executed from within the MediaWiki installation that has this skin loaded, targeting `skins/Citizen/tests/phpunit/`.

This project's standard dev environment is the MediaWiki Docker setup defined in the parent `mediawiki/` directory — see `../../DEVELOPERS.md` for setup instructions. Using that environment:

```sh
docker compose exec mediawiki bash -c "cd /var/www/html/w && composer phpunit -- skins/Citizen/tests/phpunit/path/to/MyTest.php"
```

If using a different MediaWiki dev environment, adapt the command to run `composer phpunit` from the MediaWiki root.

## Coding conventions

### PHP

- All files start with `declare( strict_types=1 );`
- Use native PHP types (properties, parameters, return values); use PHPDoc only for collection types like `string[]`
- Avoid boolean parameters; use class constants or named arrays instead
- PHPUnit test class names match the class under test (`FooTest` for `Foo`); use `@covers` with FQN

### JavaScript

- CommonJS modules: `require()` for imports, `module.exports` for exports

### Vue

- Composition API (`setup()`)
- CommonJS: `const { defineComponent } = require( 'vue' );` + `module.exports = exports = defineComponent(...)`

### LESS/CSS

- CSS custom properties (from `tokens-citizen.less`) preferred over LESS variables
- Only import `variables.less` or `mixins.less` when LESS-specific features are needed

### Codex

- Use the Codex version bundled with MediaWiki — do not assume a specific version. The minimum is v1.14.0 (bundled with MW 1.43), but newer MW versions may provide a newer Codex.
- Codex components requiring JS must be listed in `skin.json` under the appropriate `CodexModule`

### skin.json
`skin.json` is the source of truth for how the skin is wired — ResourceLoader modules, hooks, config variables, and extension skin styles are all declared here.

- When adding or removing files under `resources/`, update the corresponding `packageFiles` or `styles` list in `skin.json`
- When adding support for a new extension, add a LESS file under `skinStyles/` and register it in `skin.json` under `ResourceModuleSkinStyles`
- Config variables are declared under `config` in `skin.json` (prefixed `wgCitizen`). In PHP they are accessed via `$this->getConfig()->get( 'CitizenFoo' )`, and can be injected into JS via `ResourceLoaderHooks`

### i18n

- Any user-facing string needs a message key in `i18n/en.json`
- Every key in `en.json` must also have a documentation entry in `i18n/qqq.json`
