# Repository Instructions

Read `AGENT.md` before maintenance work; it is the authoritative architecture
and operations map. `README.md` is the human/operator guide.

## Working Discipline

- Do not begin edits without an explicit user request.
- Use a worker/evaluator loop for complex agreed implementation. Keep simple,
  bounded work direct; do not create process machinery for its own sake.
- Start with `git status --short --branch`. Preserve every unrelated user change
  and never clean, reset, restore, stage, commit, or push outside the authorized
  scope.
- Classify the task before editing: `content-only`, `code/config`, or `mixed`.
  The classification determines the workflow below.

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

## Agent Content Workflow

Agents do not need to operate the browser Studio. The Studio is the human
editor; agents may edit canonical files directly using structured parsers and
normal repository tools.

For content-only work:

1. Read `src/content/schema.ts` and the relevant canonical data before changing
   fields. Do not infer a second schema from UI components or legacy data.
2. Edit only `content/site.json`, `content/articles/**`, or `public/uploads/**`.
   Keep JSON valid and preserve the established formatting.
3. Treat slugs and IDs as stable public identifiers. Do not rename an existing
   slug/ID or move an upload while references exist unless the user explicitly
   requests a migration and every reference is updated together.
4. Add structured fields to the Zod schema first only when the request truly
   changes the content model. A schema/editor/renderer change is `mixed`, not
   content-only.
5. Keep article bodies in `content/articles/<slug>.md`; structured entities
   reference them by slug. Do not duplicate Markdown into JSON.
6. Put public PDFs/images in `public/uploads/` with safe filenames and supported
   PDF/PNG/JPEG/WebP bytes. Never publish private material merely because it is
   present locally; confirm intended public exposure when privacy is unclear.
7. Run `npm run verify`, then review `git diff --check`, `git status`, and the
   complete scoped diff. Narrow checks are diagnostic only.

Direct agent edits and Studio edits share the same canonical files. Do not run
both writers concurrently. If Studio is open, reload it after direct edits so
its SHA-256 revisions are current; never defeat a 409 conflict with a blind
overwrite.

## Agent Code Workflow

For renderer, Studio, schema, validation, scripts, styles, dependencies,
configuration, tests, documentation, or mixed changes:

1. Work outside Studio and follow existing patterns in `src/`, `studio/`, and
   `scripts/`. Keep the Studio API narrow, loopback-only, bounded, revisioned,
   serialized, and fail-closed.
2. When adding a content field, update its single Zod authority, reference
   validation, Studio control/types, public selector/template, metadata or
   discovery behavior where relevant, and artifact expectations.
3. Run `npm run verify`. For visual or interaction changes, inspect the
   unchanged verified `dist` with the strict preview command in `README.md`.
4. Never use Studio Publish for code or mixed work. It is intentionally blocked
   by unrelated worktree or staged changes.

## Agent Git And Publication Workflow

- Git mutations require explicit user authorization. Before staging, re-read
  status and name the exact paths in scope; never use `git add .`.
- Keep the index empty outside an active, reviewed commit operation. Review the
  staged name/status list and staged diff before committing.
- For authorized pushes, use the configured branch upstream and an explicit
  refspec. `Pushed` is not `Deployed`; verify the separate GitHub Actions Pages
  run before claiming deployment.
- On a fresh clone, authenticate with
  `gh auth login --hostname github.com --git-protocol https --web`, then run
  `npm run auth:github`. Tokens belong in the GitHub CLI credential store,
  never repository files, prompts, or logs.
- A failed Studio push may already have created one commit. Preserve its pending
  SHA and use Retry Push only when offered; do not create a replacement commit.
- Do not amend, force-push, rewrite history, or retire the legacy tree without
  explicit authorization.

## Handoff Standard

Report the exact files changed, behavioral effect, verification performed, and
whether anything was committed, pushed, or deployed. State any unrun check or
remaining risk plainly. Do not leave required servers or command sessions in an
unknown state.

Pre-retirement caution: the active renderer is `index.tsx -> src/App.tsx`.
Legacy root renderer/data/CMS files remain rollback-only material. Do not edit,
delete, or treat them as a second authority without explicit user-approved
retirement. See `docs/reconstruction/current.md` for the current acceptance
state.
