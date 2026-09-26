---
title: Contribute
description: How to contribute to the Citizen skin.
---

<!--@include: ../../../CONTRIBUTING.md-->

## Documentation previews

Every pull request that changes the documentation gets its own live preview site — a bot comments on the PR with the link shortly after you push, and the preview updates on every subsequent push. No local setup needed to see your changes rendered.

Previews are built for branches in the main repository. Pull requests from forks still run the documentation lint and build checks, but don't get a preview link.

## Adding a wiki to the showcase

The [showcase](../community/showcase.md) is built from `docs/data/showcase.json`. Wiki owners can ask to be listed with the [submission form](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/new?template=showcase_submission.yml); adding an entry by hand is one line — the wiki's name, its URL and one tag from `games`, `media`, `technology` or `real-world`:

```json
{ "name": "Star Citizen Wiki", "url": "https://starcitizen.tools", "tags": ["games"] }
```

An unknown tag fails the build on purpose: a handful of broad topics is what makes the filter worth using, and a vocabulary that grows with every submission would sort nothing.

Everything else is filled in for you. A maintainer periodically refreshes the article counts from each wiki's own API and retakes the screenshots, which are published to Cloudflare R2 rather than committed here. Counts and screenshots are written to separate files, so either can be refreshed without touching the other. Until the first capture, a new wiki shows a monogram tile made from its initials — that's the intended look rather than a missing image, and it's also what you see if a screenshot ever fails to load.

Counts are rounded down and shown with a `+`, as in `1.1M+ articles`. That's why the page carries no "last updated" date: a rounded-down figure only gets truer as the wiki grows.

If a wiki's API can't be reached at all — a firewall that turns bots away, say, or a static site with no API — add `"expectUnreachable": true` to its entry so the refresh stops flagging it every time. It only quiets the alert: the screenshot is still captured as usual.

::: tip Maintainer note: how the refresh runs
The three scripts under `docs/scripts/showcase/` are run by hand from a maintainer's machine, not on a schedule. They used to be scheduled workflows, and that failed: from a GitHub-hosted runner, 13 of the 24 wikis listed at the time answered HTTP 403 to every request, and a real browser driven by Playwright reached only two more. The same requests succeed from an ordinary connection, so it's the runner's address range rather than anything about the client — mostly Miraheze-hosted and Cloudflare-fronted sites turning it away. Half a refresh reads as a dozen dead wikis, which is worse than no refresh at all.

The step-by-step runbook — including the one ordering constraint that matters, cleaning up superseded images only after the pull request has merged — lives in `.agents/skills/refresh-showcase/SKILL.md`.

The screenshots live under the `shots/` prefix of `mwcitizen-media`, the Cloudflare R2 bucket that holds the docs site's media, published through the custom domain `media.mwcitizen.skin` bound to that bucket. `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` reach it, read from a gitignored `docs/.env`. The token needs R2 **write and delete** permission — write alone publishes fine but can't clean up.
:::

## Contributors

<a href="https://github.com/StarCitizenTools/mediawiki-skins-citizen/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=StarCitizenTools/mediawiki-skins-citizen" alt="Citizen contributors" title="Citizen contributors" width="812px" />
</a>
