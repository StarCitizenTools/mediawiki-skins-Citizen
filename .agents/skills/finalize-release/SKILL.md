---
name: finalize-release
description: Use after a Release Please PR has been merged to enrich the auto-generated GitHub release with author tags, highlights, and new contributors, then trigger the docs site rebuild
---

# Finalize Release

Finish a GitHub release after Release Please creates it. Adds author attribution, a user-facing highlights section, and a new contributors section, then triggers the docs site rebuild.

## Steps

### 1. Fetch the current release and a reference release

```bash
gh release view v<VERSION>
gh release view v<RECENT_PRIOR_VERSION>   # e.g. one or two versions back, for format reference
```

### 2. Get commit authors

```bash
gh api repos/{owner}/{repo}/compare/v<PREV>...v<VERSION> --paginate \
  --jq '.commits[] | "\(.sha[0:7]) \(.author.login // "unknown") \(.commit.message | split("\n")[0])"'
```

Map each changelog entry to its primary author. Add `(by @username)` before the commit link in every line.

**Then check for co-authors** — `Co-Authored-By:` trailers in the commit body are *not* in `.author.login`:

```bash
gh api repos/{owner}/{repo}/compare/v<PREV>...v<VERSION> --paginate \
  --jq '.commits[] | select(.commit.message | test("Co-authored-by"; "i")) | {sha: .sha[0:7], primary: (.author.login // "unknown"), trailers: ([.commit.message | scan("(?im)^Co-Authored-By:\\s*(.+)$")[]])}'
```

For each non-AI co-author trailer (skip `Claude`, `Copilot`, etc. — credit humans only):

- The trailer format is `Name <id+username@users.noreply.github.com>`. The GitHub handle is the part after the `+`.
- If two trailers share the same numeric ID, the user renamed their account. Resolve the canonical handle with `gh api user/<id> --jq .login` and use that one.
- Update the entry to `(by @primary and @coauthor)` — or `(by @primary, @co1, and @co2)` for multiple.

### 3. Check for new contributors

```bash
gh api repos/{owner}/{repo}/releases/generate-notes \
  -f tag_name=v<VERSION> -f previous_tag_name=v<PREV> --jq '.body'
```

If the output contains a "New Contributors" section, include it verbatim. If not, omit the section entirely.

### 4. Write the highlights section

Place this between the version heading and the changelog.

**Rules:**

- 2-4 bullets covering the most significant **user-facing** changes
- Each bullet: emoji + bold title + one-sentence description
- **UX copywriting tone** — describe what users see and can do, not implementation details
  - Yes: "type a prefix to switch between searching pages, users, or namespaces"
  - No: "Pinia replaced with composable + dependency-injection architecture"
- If there is a breaking change, add a `> warning` callout above the highlights (see v3.14.0 for format)

### 5. Show draft and get approval

Present the full release body to the user for review before pushing.

### 6. Update the release

```bash
gh release edit v<VERSION> --notes "$(cat <<'EOF'
...
EOF
)"
```

### 7. Rebuild the docs site

The versioned docs (`/v<MINOR>/`) deploy **automatically** when Release Please publishes the release — `📚 Docs deploy` (`docs-deploy.yml`) runs its `deploy-version` job on the `release: published` event. Don't trigger that.

The **root docs** still need a manual rebuild: the changelogs page is built from the GitHub releases API, so it won't show the new release (with the notes you just wrote) until the root docs rebuild. Editing the release fires `release: edited`, **not** `published`, so step 6 does not re-trigger any deploy. Dispatch it after editing:

```bash
gh workflow run docs-deploy.yml --ref main
# the dispatched run takes a few seconds to register, then capture and watch it
sleep 5
RUN_ID=$(gh run list --workflow=docs-deploy.yml --event=workflow_dispatch -L 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$RUN_ID" --exit-status
```

This runs only the `deploy-main` job (`deploy-version` is skipped on `workflow_dispatch` — expected). Wait for it to succeed, then confirm the live changelogs page lists the new version before reporting done.

> `📖 Docs CI` (`ci-docs.yml`) only lints and builds docs PRs — it does **not** deploy. Don't use it here.

## Release body format

```markdown
## [X.Y.Z](compare-url) (YYYY-MM-DD)

> optional breaking change callout

## Highlights

* <emoji> **Short title**
<One sentence, UX-focused.>

## Changelog

### Features

* **scope:** <emoji> description (by @author) ([hash](url))

### Bug Fixes
...

### Performance Improvements
...

### Miscellaneous Chores
...

## New Contributors
* @user made their first contribution in <PR URL>

**Full Changelog**: compare-url
```

## Common mistakes

| Mistake | Fix |
| --- | --- |
| Missing `(by @author)` on entries | Cross-reference every entry against the compare API output |
| Missing co-authors | `.author.login` only returns the primary. Always scan commit bodies for `Co-Authored-By:` trailers |
| Crediting AI co-authors | Skip `Claude`, `Copilot`, etc. — release notes credit humans |
| Stale username when account was renamed | Two trailers with the same numeric ID = same user. Resolve via `gh api user/<id>` |
| Guessing new contributors | Always use `generate-notes` API — do not infer from git history |
| Technical jargon in highlights | Rewrite from the user's perspective — what changed for them? |
| Forgetting to rebuild the docs site | Dispatch `📚 Docs deploy` (`docs-deploy.yml`) as the final step — `📖 Docs CI` only lints |
| Expecting the release edit to rebuild docs | `gh release edit` fires `release: edited`, not `published` — dispatch `deploy-main` manually after editing |
