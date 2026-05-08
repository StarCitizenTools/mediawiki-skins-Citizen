# AGENTS.md

## Overview

Citizen is a MediaWiki skin (requires MW 1.43+) built on `SkinMustache`. It uses PHP for server-side rendering, Mustache templates, LESS for styles, and vanilla JS/Vue 3 for client-side interactivity via MediaWiki's ResourceLoader.

## Verification

Run only what's relevant to the files you changed.

| Files changed | Command |
| --- | --- |
| `*.php` | `composer preflight` (lint, style, Phan, and PHPUnit) |
| `*.js`, `*.vue` | `npm run lint:js` then `npm test` |
| `*.less`, `*.css`, `*.vue` | `npm run lint:styles` |
| `i18n/` | `npm run lint:i18n` |
| `*.md` | `npm run lint:md` |

Auto-fix commands: `composer fix` (PHP), `npm run lint:fix:js` (JS), `npm run lint:fix:styles` (styles), `npm run lint:fix:md` (markdown).

**Preflight**: Run `npm run preflight` to execute all Node-based lints and JS tests in one command. Run `composer preflight` from within a MediaWiki installation to execute all PHP lints, style checks, Phan static analysis, and PHPUnit tests.

**Always run the relevant checks before committing.** Read the full output — PHPCS warnings must be fixed, not just errors. The command exits 0 even with warnings, so do not treat exit code alone as a pass.

### Dev environment

This project's standard dev environment is the MediaWiki Docker setup defined in the parent `mediawiki/` directory — see `../../DEVELOPERS.md` for setup instructions. The user may be using a different environment. Ask the user for their dev environment URL and how to run commands if not already known.

To run composer commands in the standard Docker environment:

```sh
docker compose exec mediawiki bash -c "cd /var/www/html/w/skins/Citizen && composer preflight"
```

### Browser testing

When your test plan includes steps that require a browser (e.g., verifying scripts load, checking runtime behavior, confirming interactions work):

- Use available browser automation tools (e.g., Chrome DevTools MCP, Playwright MCP) to test against the dev environment URL before asking the user to test manually
- Always check the browser console for warnings and errors, not just visual correctness
- **XSS testing for i18n**: When changes touch interface messages or how they are rendered, append `?uselang=x-xss` to the URL. This replaces all i18n messages with XSS payloads — if any script executes or markup is injected, the message output is not properly escaped. See [Manual:$wgUseXssLanguage](https://www.mediawiki.org/wiki/Manual:$wgUseXssLanguage)

## Skills

Project-local agent skills live in `.agents/skills/<name>/SKILL.md`. They are auto-discovered by Claude Code, Codex, Copilot CLI, and other compatible agent tooling. Each skill's frontmatter `description` declares when the skill should be invoked.

Available skills:

| Skill | Use when |
| --- | --- |
| `finalize-release` | A Release Please PR has been merged and the GitHub release needs author tags, highlights, new contributors, and a docs CI rebuild |

To add a new skill, create `.agents/skills/<name>/SKILL.md` with frontmatter (`name`, `description`) and a body that describes the workflow. Add a row to the table above so it is discoverable.

## Coding conventions

### PHP

- All files start with `declare( strict_types=1 );`
- Use native PHP types (properties, parameters, return values); use PHPDoc only for collection types like `string[]`
- Avoid boolean parameters; use class constants or named arrays instead
- Always use MediaWiki-namespaced imports (`use MediaWiki\Title\Title;`, `use MediaWiki\Content\TextContent;`), never legacy shims (`use Title;`) — the old `class_alias` names may be removed in future MW versions
- PHPUnit test class names match the class under test (`FooTest` for `Foo`); use `@covers` with FQN

### JavaScript

- CommonJS modules: `require()` for imports, `module.exports` for exports
- JS tests use Vitest (`tests/vitest/`)

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
- When a new i18n message key is read by JS via `mw.message()`, also add it to the relevant ResourceLoader module's `messages` array in `skin.json` — adding the key only to `i18n/en.json` and `i18n/qqq.json` is not enough; messages not listed in the module render as `⧼key⧽` in the UI
- When adding support for a new extension, add a LESS file under `skinStyles/` and register it in `skin.json` under `ResourceModuleSkinStyles`
- Config variables are declared under `config` in `skin.json` (prefixed `wgCitizen`). In PHP they are accessed via `$this->getConfig()->get( 'CitizenFoo' )`, and can be injected into JS via `ResourceLoaderHooks`

### Commits

- Use [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `fix(tests):`, `feat:`, `refactor:`)
- Use `ci:` or `chore:` for non-user-facing changes (tooling, config, dependencies)
- Do **not** include emojis — a pre-commit hook adds them automatically based on the commit type prefix
- Subject lines are surfaced in the auto-generated changelog. Write them in plain user-facing language, not implementation jargon — compare `suggest Category as a primitive in SMW property stage` (jargon) with `suggest Category in SMW mode` (clear). The body is where implementation detail belongs.

### Tests

- Use Arrange-Act-Assert with blank lines separating each phase
- In Vitest, set up DOM fixtures with `document.body.innerHTML` and an HTML string rather than imperative `createElement` chains — it's more readable and mirrors the actual markup

### Documentation

- User-facing docs live in `docs/src/` (VitePress site)
- When changing public APIs, hooks, config options, or user-facing behavior, update the corresponding docs in `docs/src/`
- When renaming internal concepts that are referenced in docs (e.g., "commands" → "modes"), update the docs to match

### Caching considerations

PHP-generated HTML (Mustache templates, `SkinMustache` output) is cached by the parser, page cache, and edge caches. CSS and JS are loaded fresh via ResourceLoader. This means after a deploy, users may see **old cached HTML with new CSS/JS**. If a change renames classes, changes selectors, or restructures markup, the new CSS/JS will break against the old cached HTML. To avoid this, split the work into two commits:

- **Part 1/2**: Add the new HTML and new CSS/JS, but **keep the old CSS/JS** so it still works with cached HTML
- **Part 2/2**: Remove the old CSS/JS (deploy after caches have expired)

This only applies to PHP-generated HTML. Client-rendered HTML (e.g. Vue components) is not parser-cached and does not need this treatment.

#### Alternative: defensive JS fallback

The two-commit pattern is additive — new state coexists with old during the deploy window. When a change *removes* a load or mount mechanism that the old HTML depends on, coexistence costs more (double-binding handlers across two flows) than the alternative.

For those changes, the new JS detects when expected new HTML is missing (`getElementById(...) === null`) and reconstructs it at runtime as a one-time safety net. Single deploy, robust to any cache state.

Track the fallback's removal as a GitHub issue: it must ship with the release that lands the migration, and can be removed in the next release.

### i18n

- Any user-facing string needs a message key in `i18n/en.json`
- Every key in `en.json` must also have a documentation entry in `i18n/qqq.json`
