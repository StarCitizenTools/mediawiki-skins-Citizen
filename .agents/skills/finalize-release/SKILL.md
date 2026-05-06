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
gh api repos/{owner}/{repo}/compare/v<PREV>...v<VERSION> \
  --jq '.commits[] | "\(.sha[0:7]) \(.author.login // "unknown") \(.commit.message | split("\n")[0])"'
```

Map each changelog entry to its author. Add `(by @username)` before the commit link in every line.

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

### 7. Trigger docs CI

```bash
gh workflow run "<Docs CI workflow name>" --ref main
gh run watch <RUN_ID> --exit-status
```

Wait for it to succeed before reporting done.

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
| Guessing new contributors | Always use `generate-notes` API — do not infer from git history |
| Technical jargon in highlights | Rewrite from the user's perspective — what changed for them? |
| Forgetting to trigger docs CI | Always run the docs workflow as the final step |
