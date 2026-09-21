---
url: /v3.23/contribute.md
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

Everything else fills in by itself. A weekly job refreshes the article counts from each wiki's own API, and a monthly job takes the screenshots and uploads them to Cloudflare R2. The two are independent: separate files, separate pull requests, so they can't conflict. Until the first capture runs, a new wiki shows a monogram tile made from its initials — that's the intended look rather than a missing image, and it's also what you see if a screenshot ever fails to load.

Counts are rounded down and shown with a `+`, as in `1.1M+ articles`. That's why the page carries no "last updated" date: a rounded-down figure only gets truer as the wiki grows.

If a wiki's API can't be reached at all — a firewall that turns bots away, say, or a static site with no API — add `"expectUnreachable": true` to its entry so the weekly job stops opening an issue about it every week. It only quiets the alert: the monthly job still captures a screenshot as usual.

::: tip Maintainer note: what the showcase jobs need
Three workflows keep the showcase current, and each one needs something set up outside the repository.

**The refresh pull requests.** Both jobs open their pull request as the Actions bot, so the docs CI run on it is created but held for approval — and that's the run that builds the Cloudflare preview the capture pull request asks you to look at, so the link goes nowhere until you hit **Approve and run** on the pull request. Adding a `SHOWCASE_PAT` repository secret for the jobs to use removes the click. It's optional; nothing else depends on it, and `release-please.yml` already uses a `WORKFLOW_TOKEN` personal access token for exactly the same reason — so check that one first rather than creating a second secret that does the same job.

Without a token, both jobs fall back to `GITHUB_TOKEN`, and no workflow here has ever opened a pull request that way. That path needs **Allow GitHub Actions to create and approve pull requests** turned on under **Settings ▸ Actions ▸ General**. If it's off, both jobs fail at the pull request step on their very first run.

**The screenshots.** They live under the `shots/` prefix of `mwcitizen-media`, the Cloudflare R2 bucket that holds the docs site's media, published through the custom domain `media.mwcitizen.skin` bound to that bucket. Two repository secrets reach it: `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`. The token needs R2 **write and delete** permission — write alone publishes fine but can't clean up, and the cleanup job then fails on every run. Both jobs install their own `wrangler` from `.github/actions/setup-wrangler`, which pins the exact version; that file is the only place to bump it.

**The cleanup.** `showcase-gc.yml` runs on every push to `main` that touches `docs/data/showcase-shots.json` and permanently deletes the R2 objects that push dropped from the manifest. It runs after merge on purpose: while a capture pull request is open, `main` still serves the old screenshots and the preview serves the new ones, so both sets have to stay alive. Nothing lists the bucket, so the manifest diff is the only record of what's in it — a deleted screenshot can't be restored, only recaptured.
:::

## Contributors
