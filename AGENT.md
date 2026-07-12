# Architecture And Maintenance Map

`AGENTS.md` is the concise instruction entrypoint. This file is the fuller
operational map for maintainers and future agents.

## Non-Negotiable Boundaries

```text
Canonical structured content    content/site.json
Canonical Markdown bodies       content/articles/*.md
Canonical public files          public/uploads/*
Content schema and validation   src/content/schema.ts
                                src/content/validate.server.ts
Public renderer                 src/App.tsx, src/pages/, src/components/
Studio client                   studio.html, src/studio/
Studio API                      studio/server.mjs
Verification                    scripts/verify.mjs
Production smoke checks         scripts/artifact-smoke.mjs
Publishing boundary             scripts/publish.mjs
```

Content can own copy, metadata, ordering, visibility, links, tags, placements,
and references. It cannot own React component names, CSS classes, arbitrary
styles, or template layout. Do not introduce a second schema or content
adapter; `src/content/schema.ts` is the TypeScript authority.

## Runtime Modes

- `npm start` runs ordinary Vite development on port `8080`. The Vite plugin
  deliberately returns 404 for `/studio.html` outside Studio mode.
- `npm run studio` launches strict loopback services: Studio-enabled Vite on
  `127.0.0.1:8080` and the API on `127.0.0.1:8787`. The launcher stops the
  sibling if either child exits.
- `npm run verify` validates, typechecks, builds production once, and checks the
  generated artifacts.
- `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort` serves the
  already verified `dist`. Do not rebuild between verification and an
  acceptance preview.

`vite.config.ts` validates canonical content during config loading, injects
default metadata, and emits `robots.txt` and `sitemap.xml`. `HashRouter` owns
GitHub Pages-safe public routes and fixed missing-entity/recovery states.

## Content Loading And Validation

`src/content/loader.ts` parses `content/site.json` with Zod and eagerly bundles
`content/articles/*.md` as raw strings keyed by filename slug. References are
semantic slugs, never component or filesystem instructions.

`validateProjectContent` rejects extra schema keys, unsafe paths, duplicate
slugs/navigation/social identities, unknown tags, invisible or missing Home
placements, missing article files, and missing referenced uploads. Keep new
fields strict and add reference checks when a field can point at another entity
or file.

Public uploads must use safe root-relative `/uploads/...` paths. Studio accepts
only PDF, PNG, JPEG, and WebP uploads with safe names, bounded decoded size, and
a file signature matching the extension.

## Studio Write Model

The Studio iframe renders saved public state only. Unsaved structured edits,
article edits, and upload changes stay in their editors until saved.

`studio/server.mjs` is the sole Studio writer. Mutating requests require the
exact `http://127.0.0.1:8080` Origin, exact bounded JSON shapes, safe path
segments, and current SHA-256 revisions. A single promise queue serializes all
mutations. Replacements write a same-directory temporary file, sync it, and
rename it atomically.

Revision mismatches return HTTP 409 and must be resolved by reloading and
reconciling, never by blind overwrite. Deletes re-read canonical usage and
reject referenced articles or uploads. Each implemented operation changes one
file, so there is no multi-file recovery record.

Any successful Studio save invalidates the in-memory verification token.
Verification and pending-push state also live only in the running API process.

## Verify Contract

`scripts/verify.mjs` is the single local and CI acceptance command:

1. Load and validate the canonical authority.
2. Run TypeScript with the repository compiler.
3. Run one Vite production build.
4. Smoke-check that exact `dist`.

The artifact check requires the expected public entry assets, exact copies of
every referenced upload, all visible route/entity markers, bundled article
markers, recovery markers, default metadata, `robots.txt`, and `sitemap.xml`.
It rejects emitted Markdown, raw `content/site.json`, Studio HTML, and Studio/API
markers in the production bundle.

Run `npm run verify` after every content, code, style, dependency,
configuration, or test change. A narrower command may help diagnose a failure,
but it does not replace Verify before handoff or publication.

## Publish Contract

Studio Publish is content-only. `scripts/publish.mjs` allows exactly:

```text
content/site.json
content/articles/**
public/uploads/**
```

Publish status parses complete NUL-delimited porcelain-v2 Git state. It blocks
unrelated paths, any pre-existing staged state, unmerged or unsupported
submodule state, ignored files in CMS roots, missing branch/upstream identity,
unsafe CMS file types/nesting, and truncated review output.

The verification fingerprint binds HEAD, branch/upstream destination and URLs,
all CMS file bytes/deletions, raw worktree/index state, and ignored CMS paths.
Publish rechecks the fingerprint, the displayed diff fingerprint, blockers,
the allowlist, and staged blob identity before committing.

Git commands use fixed arguments without a shell, ignore local hooks, suppress
signing, sanitize inherited Git/askpass redirection, and push explicitly to the
verified remote name and merge ref. Studio creates at most one commit per
Publish. After a failed push, the API's in-memory pending record binds the
commit SHA to its branch, upstream identity, fetch/push URLs, merge ref, and
failure detail; the public Studio status exposes only the SHA. Retry Push
revalidates that bound state and sends the exact commit without staging or
committing again.

### Grey Publish Button

The button is intentionally `aria-disabled`, not natively disabled, so it stays
hoverable and keyboard-focusable. Hover or focus reveals the **Before
publishing** tooltip. Its checklist is derived from live state:

- current operation finished;
- no pending push;
- verification fresh;
- no Publish readiness blockers;
- at least one CMS change;
- complete, non-truncated diff;
- review checkbox checked;
- non-empty commit message.

The click handler is a no-op until all conditions pass, and the API repeats the
security and freshness checks. Do not change this to a cosmetic-only disabled
state or weaken the server checks to match UI behavior.

### GitHub Credential Boundary

`npm run auth:github` is the only supported credential bridge for Studio. It
requires an already authenticated GitHub CLI, resolves its absolute executable
path, and writes an exact `https://github.com` helper chain to this clone's
`.git/config`: an empty helper resets inherited chains, followed by the resolved
`gh auth git-credential` helper. It then proves read access with the same
sanitized environment used by publishing.

No token is read, printed, or stored in repository files. Global and system Git
configuration remain disabled, terminal/askpass prompting remains disabled,
and the helper supplies credentials only; it cannot select the remote, branch,
or refspec. Setup must remain idempotent, URL-scoped, and fail closed before a
config change when `gh`, authentication, HTTPS upstream identity, or branch
binding is invalid. If its final probe fails, it restores the prior local helper
values.

`Pushed` is not `Deployed`. GitHub Actions remains deployment authority.

## Maintenance Recipes

For content-only changes:

1. Start Studio and save the intended canonical edits.
2. Review the CMS path list, upload summary, and complete text diff.
3. Verify, confirm the diff, Publish, and use Retry Push only if offered.

For code, CSS, dependencies, config, tests, docs, legacy retirement, or mixed
changes:

1. Work outside Studio and preserve unrelated user changes.
2. Review the scoped diff and run `npm run verify`.
3. Inspect the unchanged verified production preview when behavior or visuals
   changed.
4. Commit and push through normal review, never Studio.

When adding a content field, update the schema, validator/reference collection,
Studio editor/types, public selector/template, metadata behavior if relevant,
and Verify artifact expectations. Keep one owner for every value.

## Troubleshooting And Recovery

- Port collision: Studio ports are fixed; stop the existing listener and
  restart the launcher rather than silently choosing another port.
- Save conflict: reload the snapshot, inspect the disk change, and reapply the
  intended edit. Do not bypass revisions.
- Grey Publish: hover/focus the button, resolve every checklist item, refresh
  status, and rerun Verify after repository changes.
- Stale verification: expected after any save or fingerprint-changing Git
  state. Run Verify again only after the repository is settled.
- Pending push: use Retry Push without changing HEAD, the worktree/index, or
  upstream binding. If they changed, stop and use normal Git review.
- CI/deployment: `.github/workflows/deploy.yml` uses Node 20, `npm ci`, the same
  Verify command, and uploads its existing `dist` before GitHub Pages deploys.

## Pre-Retirement Legacy

The active entry is `index.tsx -> ./src/App`. Root `App.tsx`, `constants.tsx`,
`types.ts`, `data.ts`, `data.json`, `cms.py`, `metadata.json`, `components/`,
`pages/`, and `posts/` are inactive rollback material, not a second authority.
Do not edit or delete them without explicit user-approved retirement.

While the complete legacy tree and dependencies remain, the bounded emergency
rollback is the single `index.tsx` import switch to root `./App`. It serves the
older legacy snapshot, not newer canonical content. Verify and preview before
any push.

After a reviewed retirement commit, rollback with a reviewed
`git revert <reviewed-cutover-commit>`, then Verify and preview. Do not reset or
manually reconstruct a partial legacy tree. Preserve reconstruction,
investigation, handoff, and design documents as historical evidence.
