---
name: refresh-showcase
description: Use when the showcase page's article counts or screenshots need refreshing, or when a wiki has just been added to docs/data/showcase.json and needs its first capture. Runs locally because GitHub-hosted runners cannot reach many of the listed wikis.
---

# Refresh the showcase

Bring `docs/data/showcase-metadata.json` (article counts) and
`docs/data/showcase-shots.json` (screenshots) up to date, and publish the new
screenshots to Cloudflare R2.

## Why this is not a scheduled job

It was, and it did not work. From a GitHub-hosted runner, 13 of the 24 listed
wikis answer **HTTP 403 to every request** — home page and both API candidates.
Driving a real browser through Playwright is refused almost as hard: 11 of the
same set. The identical request from an ordinary connection returns 200, so it
is not the client fingerprint but the runner's address range, which the
Miraheze-hosted and Cloudflare-fronted sites on the list turn away.

Half a refresh is worse than none, because the failures read as dead wikis. Run
it from a machine the wikis will talk to.

## Before you start

- `docs/.env` holds `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`. The
  token needs R2 **write and delete** — write alone publishes but cannot clean
  up. The file is gitignored; `git clean -fdx` deletes it.
- `wrangler` on `PATH`, invoked off `PATH` rather than through `npx` so a run
  holding a delete-scoped token cannot resolve some other CLI:
  `npm install --global wrangler@4.135.0`.
- Chromium for Playwright: `npx playwright install --with-deps chromium`.

Everything up to the merge runs from `docs/`.

## 1. Refresh the article counts

```bash
node scripts/showcase/metadata.js
```

No credentials — it only reads each wiki's `api.php`. Expect
`Checked 24 wikis`. A wiki that fails keeps its previous record and has its
failure counter incremented; nothing is blanked.

## 2. Judge the alerts

```bash
cat showcase-alerts.json
```

An alert means one of two things: the wiki now reports a default skin other
than Citizen and should probably leave the list, or it has failed four runs in
a row. Judge each one — a 403 means the wiki refused you, not that it died.

A wiki whose API genuinely cannot be reached — a firewall that turns bots away,
or no API at all — gets `"expectUnreachable": true` in
`docs/data/showcase.json`. That quiets the alert only; it is still screenshotted
as usual.

## 3. Capture and upload the screenshots

```bash
node --env-file=.env scripts/showcase/capture.js --out ./tmp-shots --upload
cat showcase-failures.json
```

Expect `Captured 24 of 24`. Only keys the manifest does not already hold are
uploaded, so a re-run of an unchanged wiki costs nothing.

The first refused upload aborts the whole run rather than being collected: a
wrangler failure is the credentials, the scope or the bucket, never the wiki.
A capture that failed, by contrast, keeps the screenshot it already had — so a
run where half the wikis refused still produces a manifest diff that looks
healthy, and `showcase-failures.json` is the only place that says otherwise.

## 4. Look at the captures

```bash
npm run docs:build && npm run docs:preview   # then open /community/showcase
```

Open `tmp-shots/` too and check for error pages, consent banners and blank
frames. A non-OK response is fatal, but a wiki that serves a cookie wall or a
maintenance notice with HTTP 200 gets content-addressed and published like any
other screenshot — your eyes are the only check for that.

## 5. Commit and open a pull request

```bash
rm -rf tmp-shots
git add data/showcase-metadata.json data/showcase-shots.json
```

Commit as `chore(showcase):`, then ask before opening the pull request. The
screenshots are already in R2 under their content hashes, so its docs preview
shows exactly what merging publishes.

## 6. Collect the superseded objects — after the merge, never before

From the repository root, on a freshly pulled `main`:

```bash
git checkout main && git pull
node --env-file=docs/.env docs/scripts/showcase/gc.js
```

**Only after the pull request has merged.** While it is open, `main` still
serves the old screenshots and the preview serves the new ones, so both sets
have to stay alive. Running this early deletes images the live site is using.

It deletes the keys that left the manifest between `HEAD~1` and `HEAD`, which is
why it wants the merge commit pulled and nothing else on top. If two refreshes
merged before anyone collected, `HEAD~1` sees only the later one, so name the
commit before both: `GC_BEFORE_SHA=<sha> node …`. Nothing lists
the bucket — `wrangler r2 object` has no list subcommand — so the manifest diff
is the only record of what is in there: a deleted screenshot cannot be
restored, only recaptured.

Three guards refuse rather than guess: an unreadable manifest at `HEAD`, a
delete set that would cover everything, and any key outside the `shots/` prefix
— the bucket holds the whole docs site's media. If one fires, do not work
around it; the manifest is wrong, and fixing that comes first.
