---
url: /mediawiki-skins-Citizen/contribute/preview-channel.md
description: How breaking changes ship behind the Citizen preview channel
---

# Preview channel

Citizen avoids breaking changes. The rare unavoidable ones — changes that alter defaults, markup, tokens, or config semantics for existing wikis — ship behind the **preview channel** until the next major release. The channel is a pressure valve, never a justification: anything that works in both worlds ships normally and is never gated. The valve exists because Citizen ships a major only alongside a MediaWiki LTS release, roughly every two years. Without the channel, breaking work would either sit unmerged for most of a cycle or force an off-cadence major; with it, the work lands on `main` early, admins can rehearse it, and stable users stay untouched.

Every request resolves to *stable* or *preview* exactly once, in `PreviewChannel::isPreview()` (applied by `SkinHooks::applyPreviewChannel()`). Precedence: URL param > cookie > `$wgCitizenPreview`, with the deprecated alias as a second opt-in signal. Preview requests get the `citizen-v4` generation class on `<html>`; the class stays through all of 4.x — so admin CSS guarded on it survives the flip — and is removed in 5.0. Admins' view of all this lives in the [Migrating to Citizen 4 guide](../guide/migrating-to-citizen-4.md).

## Vocabulary — two greppable markers

* **New-world code references `citizen-v4`** — a selector, a template-data key, a condition, or a `classList` check. The reference itself is the marker. One exception: the `is-v4` template-data key doesn't contain the literal class name, so the flip sweep greps for it separately.
* **Legacy-side code that dies at the flip carries a `citizen-v4-remove` comment** — `// citizen-v4-remove` (LESS/PHP/JS) or `{{! citizen-v4-remove }}` (Mustache). Some marked sites are cleaned up before the flip; their tracking issue lists them explicitly. Early cleanup is issue-driven; the flip grep is the backstop.

`skin.json` cannot carry comments — its flip steps are enumerated in the runbook below instead.

## Per-surface conventions

| Surface | Convention |
| :--- | :--- |
| CSS, large surface | Separate ResourceLoader module; the hook loads exactly one per request (the token-module pattern) — for whole-stylesheet surfaces; when in doubt, start with a co-located guard block and promote if it grows. |
| CSS, small delta | Co-located `:root.citizen-v4 &` block in the component's LESS file (the guard-block pattern); the legacy block it replaces carries the remove marker. |
| Extension `skinStyles/` | Guard-block pattern only — skinStyles attach to the extension's modules and cannot be swapped per-request. |
| PHP | Consume the resolved value; never re-read the config/cookie/URL elsewhere. Legacy branches carry the remove marker. |
| Mustache / markup | Prefer additive markup both worlds can style. Genuine forks use an `is-v4` template-data boolean; the legacy branch carries the remove marker. Markup forks are the rarest gate — each is a cache-window hazard. |
| JS | `document.documentElement.classList.contains( 'citizen-v4' )` — the class matches the HTML the page was served with, even from edge caches. When the first internal JS consumer appears, extract this into a shared util. |

Gate CSS on the **class**, never on "did the module load" — the class travels with cached HTML, so styles apply to the generation the page was rendered in.

## Policy

* Gated work ships production-quality: it reaches early-adopter production wikis through ordinary minor releases.
* Shape may evolve during the cycle; every gated user-facing changelog entry carries a "(preview)" suffix in the commit subject.
* Preview-only config values and preference options degrade gracefully under stable: documented fallback, hidden UI.
* Docs pages for preview-only features open with a `::: warning Preview (Citizen 4)` container stating the feature becomes the default in 4.0.
* Testing: no doubled CI matrix. The resolver has a precedence table; wherever behavior forks, that component's tests cover both sides (Vitest toggles the class on the fixture root; PHPUnit passes both resolved values).

## Flip runbook (per major cycle; instantiate as a tracking issue)

1. Code sweep: grep `citizen-v4` → unguard; grep `is-v4` → collapse template forks; grep `citizen-v4-remove` → delete.
2. Collapse dual-path tests: fork-point tests (resolver precedence rows for the alias, the dual-class and module-choice assertions in `SkinHooksTest`) reduce to the single surviving behavior; then run the full verification (`npm run preflight` + `composer preflight`) before tagging.
3. Module name continuity — for each large-surface module the cycle swapped (this cycle: the token pipeline): the stable module name survives with new contents (`skins.citizen.tokens` becomes the new pipeline); the `.new` name stays registered as a deprecated **module** alias for one release so edge-cached preview HTML keeps resolving its stylesheet, then dies.
4. skin.json: remove the legacy module's file list, the deprecated **config** alias (`$wgCitizenUseNewToken`), and their i18n keys (all languages).
5. The generation class becomes unconditionally stamped; immediately file its next-major removal issue.
6. `$wgCitizenPreview = <shipped major>` goes inert by design — no code change needed; note it in release notes.
7. Docs: "Preview (Citizen N)" badges collapse into "since N.0"; the rehearsal guide stays reachable via the versioned docs.
8. Release N.0.0 aligned with the MediaWiki LTS bump (`requires` update in skin.json).

## Naming for future cycles

The switch (`$wgCitizenPreview`, `?citizenpreview=`) is permanent. Only the generation class is per-cycle: `citizen-v5` for the 5.0 cycle, stamped alongside `citizen-v4` removal.
