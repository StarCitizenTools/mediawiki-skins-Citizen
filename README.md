# Versioned documentation deployments

This branch holds the deployed documentation site for the [Citizen MediaWiki skin](https://github.com/StarCitizenTools/mediawiki-skins-Citizen).

- `/` — main (latest unreleased)
- `/v{minor}/` — latest patch of each released minor (e.g. `/v3.15/`)
- `/versions.json` — manifest consumed by the in-app version switcher

Contents are generated automatically by the `Docs CI` and `Deploy version docs` workflows. Don't commit to this branch by hand.
