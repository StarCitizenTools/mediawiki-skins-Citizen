---
url: /contribute.md
description: How to contribute to the Citizen skin.
---

# Contributing

Thank you for considering contributing to *Citizen*!

*Citizen* is a small open-source project, and we appreciate any help. Here are some ways you can contribute:

* [Code patches](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/pulls)
* [Documentation improvements](https://mwcitizen.skin/)
* [Bug reports](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/new?template=bug_report.yml)
* [Feature requests and suggestions](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/new?template=feature_request.yml)
* [Translations](#translations)

## How to submit a contribution

1. [Fork](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/fork) the *Citizen* repository.
2. Create a new branch in your fork to make your changes.
3. Commit your changes to your new branch.
4. Push your changes to your fork on GitHub.
5. Submit a pull request from your branch to the *Citizen* repository.

We will review your pull request and, if everything looks good, merge it into the main codebase.

## AI-assisted contributions

The maintainers of *Citizen* use AI tools (such as LLMs and code assistants) as part of their development workflow. Contributors are welcome to do the same, subject to the following expectations:

### Human accountability

The person submitting a contribution is fully responsible for it, regardless of how it was produced. If you use AI to help write code, you must understand what the code does, verify that it works, and be prepared to maintain it.

### Licensing and copyright

You must ensure that your contribution is compatible with the project's license ([GPL-3.0-or-later](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/blob/main/LICENSE)) and does not incorporate third-party code in a way that violates its copyright or license terms. This applies to all contributions — whether written by hand, copied from a reference, or generated with a tool.

### Quality over volume

Every submission should be purposeful, well-tested, and reviewed for correctness, style, and fit with the project. PRs that appear to be unreviewed AI output — large dumps of generated code, generic boilerplate, or changes that ignore the project's conventions — will be closed.

### Communication

Commit messages, PR descriptions, and review comments should be clear, specific, and relevant — regardless of how they were drafted. Generic filler like "This PR improves code quality and enhances maintainability" tells reviewers nothing. Make sure your communication actually describes what changed and why.

## Translations

You can submit translations via [TranslateWiki.net](https://translatewiki.net/w/i.php?title=Special:Translate\&group=mwgithub-star-citizen). They are usually merged bi-weekly.

## Questions

If you have any questions about contributing, feel free to [open an issue](https://github.com/StarCitizenTools/mediawiki-skins-Citizen/issues/new/choose) and ask.

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
