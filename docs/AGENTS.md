# AGENTS.md

This is the VitePress documentation site for the Citizen MediaWiki skin. Content lives in `src/`.

## Verification

| Files changed | Command |
| --- | --- |
| `*.md` | `npm run lint:md` |
| `*.ts`, `*.js`, `*.vue` | `npm run lint:js` |

Auto-fix: `npm run lint:fix`.

## Writing style

- Use sentence case, not title case.
- Keep text easy to understand, friendly and casual.

## Conventions

- Prefer VitePress built-in styles and components.
- Use LESS instead of CSS.
- Use VitePress CSS variables when applicable.
- VitePress config files under `.vitepress/` use TypeScript.
- To suppress an oxlint warning on a single line, use `// oxlint-disable-next-line rule-name`. Old `// eslint-disable-*` comments are inert under oxlint and should be removed when encountered.
