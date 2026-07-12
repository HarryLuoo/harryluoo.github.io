# Repository Instructions

Read `AGENT.md` before maintenance work; it is the authoritative architecture
and operations map. `README.md` is the human/operator guide.

Non-negotiable boundaries:

- Canonical content is only `content/site.json`, `content/articles/**`, and
  `public/uploads/**`.
- Layout, interactions, styling, validation, Studio behavior, scripts, and
  configuration are code-owned. Do not encode them into content.
- Run `npm run verify` after every content or code change and before handoff,
  commit, or publication. Narrow checks do not replace it.
- Studio Publish is content-only. Never use it for code, config, dependencies,
  tests, docs, mixed changes, or legacy retirement.
- Preserve unrelated user changes and do not mutate Git state unless the user
  explicitly authorizes it.

Pre-retirement caution: the active renderer is `index.tsx -> src/App.tsx`.
Legacy root renderer/data/CMS files remain rollback-only material. Do not edit,
delete, or treat them as a second authority without explicit user-approved
retirement. See `docs/reconstruction/current.md` for the current acceptance
state.
