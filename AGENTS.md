# AGENTS.md

## Overview

Citizen is a MediaWiki skin (requires MW 1.43+) built on `SkinMustache`. It uses PHP for server-side rendering, Mustache templates, LESS for styles, and vanilla JS/Vue 3 for client-side interactivity via MediaWiki's ResourceLoader.

## Verification

Run only what's relevant to the files you changed.

| Files changed | Command |
| --- | --- |
| `*.php` | `composer preflight` (lint, style, Phan, and PHPUnit) |
| `*.js`, `*.vue` | `npm run lint:js`, `npm run lint:types`, then `npm test` |
| `*.less`, `*.css`, `*.vue` | `npm run lint:styles` |
| `i18n/` | `npm run lint:i18n` |
| `*.md` | `npm run lint:md` |

Auto-fix commands: `composer fix` (PHP), `npm run lint:fix:js` (JS), `npm run lint:fix:styles` (styles), `npm run lint:fix:md` (markdown).

**Type checking**: `npm run lint:types` runs `tsc --checkJs` over the JSDoc annotations; CI runs it via the shared lint workflow's `lint-types` input. Note that workflow invokes each `lint:*` script individually and never `npm run lint`, so adding a new lint script to the `lint` chain does not put it in CI — it needs an input on the shared workflow as well.

`tsconfig.json`'s `include` names every checked path explicitly rather than relying on imports to pull files in, so coverage does not shrink silently when an import is removed. Vue SFC script bodies are not covered — those need `vue-tsc`.

`strict` is enabled a flag at a time rather than as a bundle, because its members cost very different amounts here. All are on except `noImplicitAny`, which is 524 diagnostics of missing parameter annotations rather than defects. Do not switch on bare `strict` — it turns that one on too.

Two idioms the checker cannot follow, both of which appear in this codebase: a parameter defaulted with `x = x || {}` in the body does not stay narrowed inside a closure, so use a default parameter; and a `typeof obj.method === 'function'` guard does not survive into a callback, so bind the method to a local first.

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

### Code comments

- Add a comment only when the behavior is not obvious from the code itself
- Write comments to be durable: state the constraint or invariant a future reader needs, not the change being made, its justification to a reviewer, or what the next line does

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
- A module's `codex.js` is generated at request time and has no on-disk counterpart, so Vitest resolves the components' `require( '…/codex.js' )` to `tests/vitest/mocks/codex.js`. Register stubs with `setCodexStubs()` **before** importing the component — it destructures at module-evaluation time.

### skin.json

`skin.json` is the source of truth for how the skin is wired — ResourceLoader modules, hooks, config variables, and extension skin styles are all declared here.

- When adding or removing files under `resources/`, update the corresponding `packageFiles` or `styles` list in `skin.json`
- ResourceLoader replaces `config.json` and `icons.json` per request, so the checked-in copies are dev stubs and the real shape lives in the `.json.d.ts` beside each. Changing a `callbackParam` icon list or a config callback means updating that declaration too — nothing checks it for you.
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

### Cache compatibility (compat slices)

PHP-generated HTML is cached (parser cache, page/CDN/file caches) and outlives
CSS/JS, which ResourceLoader always serves fresh. Old HTML + new assets must
stay acceptable. Citizen handles this with **compat slices** behind
`$wgCitizenCompat` — see `resources/compat/README.md` and
`includes/CompatSlices.php`.

**Decision rule.** A change is cache-breaking if it renames or removes a
class/ID that styles or JS target, or restructures markup emitted by PHP
(`templates/`, components, head elements). Client-rendered (Vue) markup is
exempt.

For every cache-breaking change, in the **same commit**:

1. **Rewrite** the dying CSS rules into `resources/compat/<next-version>.less`
   instead of deleting them, under a comment naming the covered change/PR. Do
   not delete assets those rules reference — assets referenced by a live slice
   stay in place for the window.

   **One slice per breaking change — never append to an existing one.** If
   `<next-version>.less` is already there (a second breaking change in the same
   cycle), take the next free patch-level name: `3.22.less`, then
   `3.22.1.less`, then `3.22.2.less`. The suffix is a sequence number within
   the cycle, not a release. Appending instead would leave the HTML that
   continuous-deployment wikis served *between* the two merges carrying a
   marker no gate can distinguish from post-second-merge HTML. Discovery,
   sorting, the marker and `npm run lint:compat` all handle patch-level names.

   **A slice is a standalone stylesheet, not a fragment of `skin.less`.**
   ResourceLoader compiles every style file as its own LESS entry point, and
   `CompatSkinModule` appends slices *after* all base styles. Copy-pasting a
   rule verbatim is therefore wrong. Adapt each rule you move:

   - **Carry the imports.** Open the slice with
     `@import ( reference ) '../variables.less';` and
     `@import ( reference ) '../mixins.less';`. `skin.less` imports those once
     for all 48 of its stylesheets and none of that scope reaches a slice. Miss
     one and the slice throws a compile error, at which point ResourceLoader
     drops the **whole `skins.citizen.styles` module** — the wiki renders with
     no skin CSS. (`mediawiki.skin.variables.less`, `mediawiki.mixins` and the
     Codex paths need no help; import dirs are module-wide.)
   - **Component-local mixins: import only if the body has no `url()`.** A mixin
     defined in a component file needs that file reference-imported as well —
     `@import ( reference ) '../skins.citizen.styles/components/OverflowElements.less';`
     for `.showOverflowButton()`, say. But `@import ( reference )` does **not**
     rebase `url()` inside the imported file: the mixin's own paths still
     resolve against `resources/compat/`, and there is no `url()` in your slice
     for the rebase rule below to act on. `.mixin-citizen-section-chevron()`
     (`components/Sections.less`) is the only mixin in the skin whose body
     carries a relative `url()`; importing it emits
     `url( …/resources/compat/assets/images/cdxIconCollapse.svg )`, which does
     not exist, and `CompatSliceCompileTest` fails listing exactly that path as
     a missing local file ref. For any mixin whose body contains a `url()`,
     **inline the expansion** and rebase the paths by hand instead of importing.
     Inlining is also the safer default generally: reference-importing couples a
     slice — whose whole job is to freeze old CSS — to a file that keeps
     changing, so a later edit to the mixin silently rewrites frozen output.
   - **Re-apply the media wrapper.** `skin.less` wraps 40 imports in
     `@media screen` and `common/print.less` in `@media print`; the wrapper
     belongs to the import site, not the file. Re-declare the same one in the
     slice, or the rule silently becomes media-`all` *and* — being concatenated
     last — outranks `common/print.less` when printing. Seven imports are
     genuinely media-`all` (`tokens-citizen.less`, `fonts.less`, `icons.less`,
     `common/typography.less`, `skinning/elements.less`,
     `skinning/content.media-common.less`, `skinning/interface-subtitle.less`);
     do **not** wrap rules from those. Not every cache-breaking rule comes from
     `skin.less`: `templates/Notifications.mustache` server-renders
     `.citizen-notifications__skeleton`, which is styled by the separate
     `skins.citizen.notifications` module. When the rule comes from another
     module, take its media from that module's `styles` entry in `skin.json`
     (an unkeyed list means `all`) — and note that the slice makes that CSS
     render-blocking on every page even if the source module was lazy-loaded.
   - **Rebase `url()`.** Paths resolve against the *slice's* directory, so
     `url( assets/images/foo.svg )` must become
     `url( ../skins.citizen.styles/assets/images/foo.svg )` — or
     `../<source module directory>/…` when the rule came from a module other
     than `skins.citizen.styles`. Do not copy assets into `resources/compat/`.
   - **Rebuild the selector; never lift a nested block.** Citizen's stylesheets
     nest deeply, and the ancestors do not travel with an inner block. Write the
     full chain flat (`.citizen-page-sidebar .citizen-menu__heading { … }`) and
     put any generation gate at the front of that reconstructed chain. An
     orphaned inner block without `&` is valid CSS that applies everywhere; with
     `&` it resolves against an empty parent and silently loses its gate.
   - **Re-open `@layer citizen-tokens` — for token-module rules only.** The
     layer belongs to rules whose home is `skins.citizen.tokens` /
     `skins.citizen.tokens.new`, and only those. Unlayered rules beat layered
     ones, so an unwrapped copy of one starts overriding operator CSS in
     `MediaWiki:Citizen.css` — and it renders *identically* to the layered
     original on every wiki that has no such override, so eyeballing cannot find
     it.

     **Everything else stays unlayered, including root-scoped custom
     properties.** `skins.citizen.styles` declares plenty of those outside any
     layer, by design: `common/features.less` (`--width-layout`,
     `--backdrop-filter-frosted-glass`, `--opacity-glass`,
     `--filter-image-brightness`, each gated on a server-rendered
     `citizen-feature-*-clientpref-*` root class — the textbook cache-breaking
     shape), `common/print.less` and `tokens-citizen.less`. Wrapping one of
     those in `@layer citizen-tokens` makes the slice copy **lose to the
     unlayered base declaration and stop applying at all**: it compiles, it
     lints, and it ships completely inert — the exact failure the slice existed
     to prevent. When in doubt, keep the slice at the layering its source had.

     `CompatSliceCompileTest` derives the owned set at run time — everything the
     two token modules declare inside `@layer citizen-tokens`, minus everything
     `skins.citizen.styles` declares root-scoped outside it — and fails only a
     slice that declares an *owned* property on a `:root`/`html` selector
     outside the layer.
   - **Check what used to override it.** Slices win cascade ties. If anything
     later in `skin.less`'s import order restates the same property for an
     equally specific selector (e.g. `common/links.less` layers a Citizen link
     colour over a Codex mixin), move the pair together in their original order,
     or gate the slice copy so it cannot match current HTML at all.

   RTL/CSSJanus, `/* @noflip */` and reading `var( --token )` all survive a move
   untouched — no action needed for those.

   **Coverage:** `composer phpunit` compiles every slice
   (`CompatSliceCompileTest`) and catches missing imports, unresolvable `url()`
   — including one emitted by an imported mixin, reported as a missing local
   file ref under `resources/compat/` — and a *token-module-owned* custom
   property left on a `:root`/`html` selector outside `@layer citizen-tokens`.
   It deliberately does **not** flag a root-scoped property that
   `skins.citizen.styles` also declares unlayered (layering that would break
   it), and it cannot see a token rule moved onto a non-root selector, nor a
   slice wrapped in the layer that should not have been — that one renders as
   "no change at all" on the frozen page, so browser-test steps 3–4 are what
   catch it. `npm run lint:styles` catches an orphaned `&` — fix the selector,
   never silence it by deleting the `&`. Nothing static catches the media
   wrapper (browser-test step 5), an over-broad rebuilt selector (step 6) or
   cascade order (step 7).
2. Creating the slice file **is** the generation bump. `<html>` carries
   `data-mw-citizen-html="<every slice version present, oldest first>"` (e.g.
   `"3.15 3.18 3.22"`), derived from the directory listing — there is no
   constant to update. Each token means *this HTML is at or after that
   generation*, so a gate only ever names its **own** version, and expiring a
   slice cannot orphan a gate. The attribute is stamped whether or not
   `$wgCitizenCompat` is on, so its absence always means "older than the
   framework".
3. **Gate only when the change reuses a class** with a new meaning. Renames and
   removals need no gate — the old selector cannot match new HTML.

   **Check for an existing gate first.** Grep the live slices for the class you
   are about to gate — `grep -rn --include='*.less' 'citizen-foo' resources/compat/`. A hit
   means this is a *repeat reuse*, and neither plain form below is safe on its
   own; read "Repeat reuse" at the end of this step before writing the gate.
   Nothing static catches a missed one: both plain forms compile, lint and
   render correctly on the newest old generation.

   **Preferred: a local discriminator.** Reuse means the class sits on an
   element in *both* markups, so mark the new one and gate the slice on its
   absence:

   ```less
   /* new markup adds .citizen-foo--v2 on the same element */
   .citizen-foo:not( .citizen-foo--v2 ) {
       /* old meaning */
   }
   ```

   For a **first** reuse the two selectors are mutually exclusive, so nothing
   depends on source order. Delete the discriminator class in the same commit
   that deletes the slice. (Same shape as the `citizen-v4` preview gate, but
   element-scoped, so any number of flips coexist.)

   **Fallback: the root marker**, when no single element can carry a
   discriminator. Reference your own slice's version — never enumerate
   generations, and never `:not()` a version other than yours:

   ```less
   /* pre-3.22 HTML only */
   :root:not( [ data-mw-citizen-html~='3.22' ] ) .citizen-foo {
       /* old meaning */
   }
   ```

   `~=` matches whole tokens, so `'3.2'` never matches `3.22` HTML — `*=` and
   `^=` would.

   **Repeat reuse: bound the *colliding declarations* from below.** Both forms
   above carry the same trap, and it is not about the class — it is about the
   declaration. HTML older than both reuses carries neither the earlier version
   token nor the earlier discriminator, so it matches both gates. When both
   slices gate the same way the selectors are equally specific and the newer
   wins on source order, because slices are appended oldest-first; when they
   gate differently — a discriminator is `(0,2,0)`, a root marker `(0,3,0)` —
   the more specific one wins outright. Either way the newer meaning can land
   on HTML that predates it.

   Winning that tie is only *wrong* for a declaration both slices set. A slice
   freezes what its own release would have deleted, so two slices normally
   freeze different properties — and then pre-both HTML matching both gates is
   exactly right, because it predates both deletions. Bounding such a
   declaration below deletes coverage the oldest in-window generation still
   needs. So add the lower bound **only to those declarations an older live
   slice also sets** — unless that slice's selector is strictly more specific
   than yours, in which case it already wins and needs no help — and leave
   every other declaration on the plain form:

   ```less
   /* 3.18.less, still live */
   .citizen-foo:not( .citizen-foo--v2 ) {
       padding: 8px;
   }

   /* 3.22.less — padding collides with 3.18.less, so bound it below */
   .citizen-foo.citizen-foo--v2:not( .citizen-foo--v3 ) {
       padding: 4px;
   }

   /* …while margin, which no live slice restates, keeps the plain form */
   .citizen-foo:not( .citizen-foo--v3 ) {
       margin: 4px;
   }
   ```

   The root marker bounds the same way, with the earlier slice's version:

   ```less
   /* 3.18 up to 3.22 */
   :root[ data-mw-citizen-html~='3.18' ]:not( [ data-mw-citizen-html~='3.22' ] ) .citizen-foo {
       padding: 4px;
   }
   ```

   The bound is always available: it is needed only while the earlier slice is
   still in the window, and the rule to delete a discriminator class with its
   slice keeps `--v2` on the element for exactly that long.

4. If old HTML references a **renamed/removed RL module**, keep a stub module
   under the old name and record it in `resources/compat/stubs.json`
   (`"old.module.name": "<version added>"`).
5. If CSS cannot bridge the change (e.g. JS binds to renamed IDs, removed
   mount targets): do **not** force a slice. Add a **"purge required"**
   warning to the release notes instead. The styles pipeline is the only
   wired delivery today — a `<version>.js` DOM patch beside the slice would
   additionally have to be spliced into the `skins.citizen.scripts` package,
   which is **not yet implemented**, so until that exists a change that needs
   JS to bridge it is purge-required.
6. **Mandatory browser test** — every mitigation MUST be verified in a real
   browser before commit (recipe below). A slice that has not been
   browser-tested against frozen old HTML does not ship.
7. Release notes: state the release's cache status
   (`clean` / `covered by compat` / `purge required`).

**Browser test recipe (mandatory for every slice):**

1. *Before* applying the breaking change (clean tree), freeze old HTML for
   every page type the change touches, and take reference screenshots. Write
   the file into the MediaWiki checkout root, which is served under `/w/`, so
   the frozen page keeps the wiki's **own origin**:

   ```sh
   curl -s 'http://localhost:8080/wiki/<Page>' > /path/to/mediawiki/frozen-old.html
   # then open http://localhost:8080/w/frozen-old.html
   ```

   Do not serve it from a second origin (`file://`, `python3 -m http.server`)
   and do not rewrite its `/w/…` paths. Citizen draws its icons with
   `mask-image`, and masks are CORS-restricted exactly like webfonts: from
   another origin every icon and the webfont fail to load, so the screenshots
   compare harness artefacts, and a `url()` that 404s looks identical to one
   that resolves — the single failure this recipe exists to catch.

   **Repeat reuse needs one frozen page per era.** This step gives you the
   *newest* pre-change generation, and that is the one era where a missing
   lower bound still looks right. Freeze a page from every in-window generation
   the class was gated in as well — or hand-edit the frozen page's
   `data-mw-citizen-html` value and discriminator classes down to that era —
   and run step 4 against each.
2. Apply the breaking change + slice. Set `$wgCitizenCompat = true;` in the
   dev `LocalSettings.php`.
3. Open `http://localhost:8080/w/frozen-old.html`: old HTML + new assets +
   slice, exactly what a stale cached page experiences.
4. Screenshot and compare against the reference: layout intact, text readable,
   chrome usable. Check the console for new errors *and* the network panel for
   404s — a mis-rebased mask `url()` paints an empty box and raises no console
   error, so only the network panel names it. A slice that reads as *no change
   at all* is the other tell: something in it is inert, most often a rule
   wrapped in `@layer citizen-tokens` that never belonged there and now loses to
   the unlayered base declaration.
5. Repeat step 4 with print emulated (DevTools ▸ Rendering ▸ *Emulate CSS media
   type: print*, or the Ctrl+P preview). A slice that forgot its
   `@media screen` wrapper shows up here and nowhere else.
6. Load a normal live page with the flag on and confirm fresh HTML is
   unaffected (the slice must be inert against new markup) — including pages
   the moved rule was never meant to touch, since a rebuilt selector that is
   too broad renders and lints cleanly.
7. **Cascade check.** Steps 3–6 cannot see a slice that merely started
   *winning* something: it renders exactly like the rule it replaced until
   competing CSS exists. Put a competing declaration in `MediaWiki:Citizen.css`
   — `:root { --<moved-token>: #f0f; }` for a moved token, otherwise the same
   property on an equally specific selector — reload the frozen page, and
   confirm the site CSS still wins. (`CompatSliceCompileTest` already fails a
   token-module rule that lost `@layer citizen-tokens`; this step covers the
   ties it cannot see.) Revert the test CSS afterwards.
8. Remove the flag from `LocalSettings.php` and delete `frozen-old.html`.

**Expiry.** `npm run lint:compat` (part of `npm run lint`) fails when a slice
or stub outlives the 6-release window. Fix by deleting the slice file (and any
expired `stubs.json` entries plus their stub modules) — nothing else
references them. Accepted trade: **downgrading** to a build that still holds a
since-deleted slice applies that slice's old rules to *newer* cached HTML,
because the marker token its gate excludes is no longer stamped. A downgrade
already implies a purge, and expiry is CI-forced, so this is a stated cost of
"absence means older", not a surprise.

A **major version bump expires every prior-major slice at once** — this is
intended. The release PR that bumps the major deletes them all (CI enforces
it), and compat for the flip itself ships as the new `<major>.0.less` slice.
HTML older than that generation is out of the window: give it a **"purge
required"** note in the release.

This only applies to PHP-generated HTML. Client-rendered HTML (e.g. Vue
components) is not parser-cached and does not need this treatment.

### Preview channel (breaking changes)

Breaking changes never ship unguarded — they ride the preview channel until the next major release. Full conventions: `docs/src/contribute/preview-channel.md`.

- Gating is for unavoidable breaking changes only — anything that works in both worlds ships normally, ungated.
- One resolution per request: `PreviewChannel::isPreview()` via `SkinHooks::applyPreviewChannel()`. Never re-read `$wgCitizenPreview`/cookie/URL elsewhere.
- New-world code gates on the `citizen-v4` generation class (`:root.citizen-v4` in LESS, `is-v4` template data, `classList.contains( 'citizen-v4' )` in JS).
- Legacy-side code that dies at the 4.0 flip carries a `citizen-v4-remove` comment.
- Gate CSS on the class, not on module presence — the class travels with cached HTML.
- Gated user-facing commits get a "(preview)" suffix in the subject.

### Lazy-loaded Vue modules

Vue and per-module bundles are not part of the initial page load — they're loaded on intent via `mw.loader`. Any control that mounts a Vue app needs:

- **Intent prefetch** via `bindIntentPrefetch()` on the trigger so hover/focus/touch starts the network round-trip before the click. Pass `{ vue: true }` so Vue is claimed as its own request. Its optional `onReady` callback fires when the module is ready and can be used to also pre-mount the app during idle time, so the eventual click only pays for the first render — see `createCommandPalette` for the reference implementation (it skips `touchstart` intents, where the tap follows too closely for an idle mount to win).
- **Lazy load on activation** via `usingWithVue()` from `vueBatch.js` on the actual click/toggle event — never `mw.loader.using()` directly. `mw.loader` batches a module with every dependency still in state `registered`, so a bare `using()` welds a private copy of Vue into that panel's `load.php` URL. Vue is past `mw.loader.store`'s 100 kB cap, so such a copy is reusable by neither the module store nor the browser's URL-keyed HTTP cache, and every panel re-downloads Vue. `vueBatch.js` documents the ordering invariant that keeps the split free.
- **Server-rendered skeleton** inside the mount target for in-place panels (Preferences, Share). Vue's `mount()` replaces it on success. The skeleton must be server-rendered because the JS that would render it isn't there yet.
- **A failure path** sized to the UI's tolerance for staying broken. Pick what fits:
  - Retry the load in place (Preferences renders a retry button beside the skeleton).
  - Degrade to a non-Vue path that achieves the same goal (Share closes the panel and triggers the browser's native share sheet).
  - Surface a toast and dismiss the UI (Command palette uses `mw.notify`; the overlay sits empty during the load and disappears on failure).

See `createPreferences`, `createShare`, and `createCommandPalette` for the patterns, and `vueBatch.js` for why Vue is requested separately.

### i18n

- Any user-facing string needs a message key in `i18n/en.json`
- Every key in `en.json` must also have a documentation entry in `i18n/qqq.json`
