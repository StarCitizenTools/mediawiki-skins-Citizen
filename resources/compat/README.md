# Cache-compat slices

This directory is the registry: each `<version>.less` file holds the CSS that
version's breaking HTML change would otherwise have deleted, so old cached HTML
keeps rendering acceptably while `$wgCitizenCompat` is enabled. The filenames
here also define the generation marker stamped on `<html>`:
`data-mw-citizen-html="3.15 3.18 3.22"` — every slice version present, oldest
first.

- Creating a slice **is** the generation bump — no constant to update. The
  marker is stamped whether or not `$wgCitizenCompat` is on, so its absence
  always means "older than the framework".
- **One slice per breaking change, never an append.** A second breaking change
  in the same cycle takes the next free patch-level name (`3.22.less`, then
  `3.22.1.less`) — appending would leave the HTML a continuous-deployment wiki
  served between the two merges indistinguishable from post-merge HTML.
- Slices are spliced into `skins.citizen.styles` (never a new module name).
- A slice is a **standalone stylesheet**, compiled as its own LESS entry point
  and appended after all base styles — never a verbatim copy-paste out of
  `skin.less`. Rewrite each rule you move:
  - open with `@import ( reference ) '../variables.less';` +
    `'../mixins.less';` — an unresolved variable or mixin throws and
    ResourceLoader drops the entire `skins.citizen.styles` module;
  - a mixin defined in a component file needs that file reference-imported too,
    **unless its body contains a `url()`** — importing does not rebase those
    paths, so they stay pointed at `resources/compat/` and 404 with nothing in
    your slice to fix. `.mixin-citizen-section-chevron()` is the one such mixin
    in the skin: inline its expansion and rebase by hand. Inlining is the safer
    default anyway — importing a live file un-freezes the frozen copy;
  - re-declare the media wrapper the rule had at its import site
    (`@media screen` for most of `skin.less`, `@media print` for
    `common/print.less`, none for the seven media-`all` imports). If the rule
    came from a different module (e.g. `.citizen-notifications__skeleton` is
    server-rendered but styled by `skins.citizen.notifications`), take its
    media from that module's `styles` entry in `skin.json` — an unkeyed list
    means `all` — and expect the slice to load on every page even when the
    source module was lazy;
  - rebase `url()` onto the source module's directory, usually
    `../skins.citizen.styles/…`;
  - write the full ancestor selector chain flat instead of lifting a nested
    block;
  - re-open `@layer citizen-tokens` **only** for rules moved out of
    `skins.citizen.tokens` / `skins.citizen.tokens.new` — an unlayered copy of
    one silently beats operator CSS while looking unchanged. Everything else
    stays unlayered, root-scoped custom properties included:
    `common/features.less` (`--width-layout`, `--backdrop-filter-frosted-glass`,
    `--opacity-glass`, `--filter-image-brightness`, gated on
    `citizen-feature-*-clientpref-*` root classes), `common/print.less` and
    `tokens-citizen.less` are unlayered by design, and wrapping one of them in
    the layer makes the slice lose to the base declaration and ship completely
    inert;
  - check nothing later in `skin.less` used to override the rule — slices win
    cascade ties.
- **Gating** (needed only when a change *reuses* a class; renames and removals
  cannot match new HTML). Grep the live slices for the class first — a hit
  means a repeat reuse, and the plain forms below are not enough on their own:
  - preferred — put a discriminator class on the new element and gate locally,
    `.citizen-foo:not( .citizen-foo--v2 )`. For a **first** reuse the selectors
    are mutually exclusive, so nothing depends on source order; the
    discriminator dies with the slice;
  - fallback — the root marker, naming **your own** slice's version and nothing
    else: `:root:not( [ data-mw-citizen-html~='3.22' ] ) .citizen-foo`;
  - on a repeat reuse **both** forms need a lower bound, but only for the
    declarations that actually collide: HTML older than both reuses matches
    both gates, and the newer slice wins — on source order when the two gates
    are equally specific, or outright when it is the more specific of the two
    (a discriminator is `(0,2,0)`, a root marker `(0,3,0)`). That is only wrong
    where the older live slice sets the *same declaration*, unless its selector
    is strictly more specific than yours — two slices normally freeze different
    properties, and then pre-both HTML wants both rules, so bounding them would
    delete coverage the oldest in-window generation still needs. Bound just the
    colliding declarations: `.citizen-foo.citizen-foo--v2:not( .citizen-foo--v3 )`
    or `:root[ data-mw-citizen-html~='3.18' ]:not( [ data-mw-citizen-html~='3.22' ] )`.
    Either is only ever needed while the older slice still exists;
  - `~=` matches whole tokens, so `'3.2'` never matches `3.22` HTML. Never use
    `*=` or `^=`.
- `CompatSliceCompileTest` compiles every slice here in `composer phpunit`, and
  fails on a missing import, an unresolvable `url()` (including one an imported
  mixin emitted) or a *token-module-owned* custom property on a `:root`/`html`
  selector outside `@layer citizen-tokens`. Ownership is derived at run time:
  what the token modules declare inside the layer, minus what
  `skins.citizen.styles` declares root-scoped outside it. Nothing static catches
  the reverse mistake — a rule needlessly wrapped in the layer, which renders as
  no change at all on the frozen page — and `npm run lint:styles` does **not**
  resolve LESS imports. That test also compiles the real `skins.citizen.styles`
  module, which imports core's Codex design tokens, so a compile failure there can
  be an upstream token removal on a newer MediaWiki rather than a slice defect —
  check the variable against the target branch before debugging your slice.
- Styles are the only wired delivery: a `<version>.js` DOM patch would also need
  splicing into the `skins.citizen.scripts` package, which is not implemented
  yet, so changes that need JS to bridge them are purge-required for now.
- CI fails when a slice outlives the 6-release window; fix by deleting the file.
  Accepted trade of "absence means older": **rolling back** to a build that
  still contains a since-deleted slice applies that slice's old rules to newer
  cached HTML, whose marker no longer carries the token the gate excludes. A
  downgrade already implies a purge, and expiry is CI-forced — but it is a
  stated cost, not a surprise during an incident.
- A major bump expires all prior-major slices at once — intended. The release PR
  that bumps the major deletes them, compat for the flip ships as the new
  `<major>.0.less` slice, and older HTML gets a "purge required" note.
- `stubs.json` maps renamed-away RL module stubs to the version that added them.
- The full process (decision rule, mandatory browser test) lives in AGENTS.md.
