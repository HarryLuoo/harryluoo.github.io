# Website Reconstruction Handoff

Date: 2026-07-12  
Status: Architecture approved; implementation has not started

## Authority

This is the active reconstruction contract. Read it with
`docs/investigations/2026-07-12-site-audit.md`, which contains the defect
evidence. The current site is the visual reference. The April 2026 CMS design is
historical and is superseded where it conflicts with this handoff.

Do not reopen the architecture unless implementation exposes a concrete
contradiction.

## Goal

Reconstruct the site internally while preserving its visual identity and overall
layout. Deliver:

- a reliable React/Vite static site;
- a browser-accessed local CMS;
- CMS editing for every visible informational field;
- fixed, code-owned visual templates;
- one content authority;
- stable detail routes;
- safe drafts and publishing;
- code that one person can understand and maintain.

This is not a redesign, page builder, or reusable CMS product.

## Non-Negotiables

1. Preserve the composition, typography, palette, spacing, borders, and overall
   character.
2. Fix documented visual, routing, accessibility, Markdown, and mobile-menu
   defects without using them as permission to redesign.
3. Keep React/Vite as the only public renderer.
4. Keep Home, Research, Projects, Garden, and detail layouts fixed in code.
5. Make every visible informational field CMS-editable.
6. Keep layout and freeform styling out of content.
7. Use one structured authority and one canonical body per article.
8. Preview only through the real site.
9. Bind CMS services to loopback.
10. Fail invalid saves, verification, and publishing closed.
11. Never publish unrelated files from the CMS.
12. Prefer explicit modules and handwritten editors over internal frameworks.

## Architecture

### Public Site

React/Vite remains the only renderer. Establish these boundaries as the work
needs them; do not perform a standalone directory reshuffle.

```text
src/
  content/               # Zod schema, loader, small selectors
  components/content/    # Cards and article renderers
  components/layout/     # Sidebar and shell
  pages/                  # Fixed page and detail templates
  routes.ts
  App.tsx
```

Use stable GitHub Pages-compatible routes:

```text
#/research/:slug
#/projects/:slug
#/garden/:slug
```

### Content

The CMS owns exactly:

```text
content/site.json
content/articles/<slug>.md
public/uploads/**
```

`site.json` owns metadata, shell content, page copy, papers, projects, posts,
order, visibility, tags, links, and placements. Article files own long-form
bodies. A post, project, or paper may reference the same immutable article slug;
the filesystem is the article registry.

Zod is the sole schema/type authority. Validate unique slugs, references,
article/assets existence, paths, and allowed values. Content must not contain
Tailwind classes, component names, arbitrary CSS, or freeform layout data.

There is no `data.ts`, generated manifest, adapter, database, or duplicated
metadata store.

### Studio

Use handwritten editors for Shell, Home, Research, Projects, Garden, Articles,
Uploads, and SEO. Share only small controls such as text fields, list editors,
entity pickers, and asset pickers. Do not generate forms from schemas.

The real site appears in an iframe and reflects saved disk state. Unsaved form
state must be obvious.

`npm run studio` supervises two ordinary loopback processes:

1. Vite for the site and studio UI.
2. A narrow Node API for reads, writes, verification, and publishing.

Vite proxies `/api`. A small launcher labels logs, forwards termination, stops
both processes, and fails if either dies. Use one Vite configuration; the studio
entry exists only in studio mode and is excluded from production.

The API is the sole writer. It validates origins and paths, limits requests,
serializes writes, and exposes no arbitrary filesystem, Git, or shell endpoint.

### Drafts and Recovery

Unsaved browser state is editing. Saved CMS files are drafts in the Git working
tree. Git commits are published history.

Begin with atomic same-directory replacement for single-file saves. Add
multi-file recovery only when article or upload editing demonstrates the need.
Use one gitignored `.studio/previous-save.json` record for interrupted-write
recovery and one-step restore. Unknown external changes must block overwrite.

Do not build timestamped snapshots, a recovery database, or a filesystem failure
matrix.

### Verification and Publishing

Use one verification command locally and in CI:

- validate schema and references;
- typecheck;
- build production output;
- smoke-check built routes, articles, and assets.

Run visual checks when public templates change and at final acceptance, not on
every save or CI run.

Add publishing only after local editing works. It requires a fresh verification,
a worktree containing only CMS-owned changes, visible diff confirmation, staging
only the three CMS-owned paths, commit before push, and push retry without a
second commit.

Push success means `Pushed`, not `Deployed`; CI owns deployment. The CMS never
publishes code, dependencies, tests, or configuration.

## Visual Contract

Before changing public templates, capture one example of each distinct template
at:

- 1440px desktop;
- approximately 918-1024px tablet/narrow desktop;
- 390px mobile;
- 320px only for overflow and menu behavior.

Human comparison is authoritative. Do not create pixel gates for every route,
item, and width.

Permitted deliberate changes are limited to documented clipping, overlap,
responsive failures, accessibility/focus behavior, mobile-menu behavior, missing
states, and user-approved content corrections. Review other meaningful visual
differences.

## Lean Loop Method

Maintain only:

```text
docs/reconstruction/current.md       # Current scope, state, decisions, blockers
docs/reconstruction/acceptance.md    # Editable-field and acceptance checklist
```

For each loop:

1. record files, deliverable, and pass conditions in `current.md`;
2. give a worker a non-overlapping file scope;
3. inspect the diff and run tests relevant to that loop;
4. fix concrete failures;
5. update the two records before continuing.

Do not create separate spec, eval, worker-contract, checkpoint, and evaluation
files for every loop. Do not require an independent evaluator for routine work.

Use an independent evaluator only after:

1. the reconstructed public site is visually and behaviorally complete;
2. persistence, verification, and publishing are complete.

Workers must not revert other changes or expand into later loops.

## Phases

### Phase 0: Acceptance Setup

Create the two reconstruction records, an editable-field checklist,
representative screenshots, and a short list of defects allowed to change.

Pass when every visible field has a future editor location and each distinct
template has a baseline. Do not create a permanent inventory subsystem.

### Loop 1: Public Reconstruction

Build one coherent public vertical slice:

- `site.json`, article files, and Zod schema;
- one-time import from current data;
- validated build-time loader;
- stable routes and 404;
- fixed page and detail templates;
- production Markdown inclusion and CV correction;
- metadata, responsive fixes, and accessibility.

Essential checks:

- production build succeeds;
- invalid references fail;
- production articles never resolve to SPA HTML;
- CV and referenced assets exist;
- direct load, refresh, Back, and Forward work;
- representative visual and keyboard review passes.

Use the first independent evaluator. Keep the old path until comparison passes
and rollback is obvious.

### Loop 2: Usable Local CMS

Build the studio vertically:

- supervisor, loopback API, studio-only entry, and real-site iframe;
- dirty state and navigation warnings;
- all structured editors;
- article editing and usage display;
- upload/replace/delete with collision and reference handling;
- validation and atomic saves;
- recovery only when the first multi-file operation requires it.

Essential checks:

- one command starts and stops both services;
- only loopback access is possible;
- CMS and site share the canonical content;
- saved and unsaved states are clear;
- the editable-field checklist reaches 100%;
- invalid state cannot replace valid content;
- referenced content cannot be deleted silently;
- external modifications are not overwritten.

Do not build publishing here.

### Loop 3: Verify and Publish

Add the shared verification command, artifact smoke checks, diff review,
allowlisted staging, commit, push, and failed-push retry.

Test only meaningful failures:

- failed verification blocks publish;
- unrelated dirt blocks publish;
- only CMS-owned paths are staged;
- failed push retry creates no duplicate commit;
- one representative partial-save recovery case, if recovery exists.

Use the second independent evaluator. Do not create exhaustive filesystem or Git
failure matrices.

### Loop 4: Migration and Cutover

Complete final migration, approved copy corrections, privacy review, visual and
interaction review, production crawl, README/architecture updates, rollback
instructions, and retirement of the Tkinter CMS and duplicate content path.

Cut over only when public articles/assets resolve from production output and the
user approves visual fidelity and content/privacy decisions. Cutover is
acceptance work, not a new infrastructure phase.

## Essential Gates

1. One structured authority and one canonical body per article.
2. Every visible informational field is editable locally.
3. Production output contains real articles and assets.
4. Routes, refresh, navigation, and 404 behavior work.
5. Representative desktop/tablet/mobile review passes.
6. Keyboard and mobile-menu accessibility pass.
7. Invalid state cannot replace valid content.
8. CMS services are loopback-only and preview the real site.
9. One verification command passes validation, typecheck, build, and artifact
   smoke checks.
10. Publishing stages only CMS-owned paths and handles failed push without a
    duplicate commit.
11. Privacy approval and rollback understanding precede cutover.

## Do Not Add Prematurely

- visual gates for every item and viewport;
- visual tests on every CMS save or CI run;
- failure injection at every save instruction;
- duplicate local and CI acceptance systems;
- publishing tests before publishing exists;
- recovery before multi-file saves exist;
- tests for hypothetical plugins, migrations, multi-user behavior, or reuse;
- process documents created only to reassure the agent.

Testing follows demonstrated risk, not imagined completeness.

## Architectural Non-Goals

No Astro, SSR, clean-path routing in v1, monorepo, internal packages, database,
generic block registry, page builder, schema-generated forms, duplicate preview,
generated content layers, rich-text editor, taxonomy or asset subsystem,
timestamped snapshots, worktrees, migration framework, plugin system,
productization seams, deployment polling, arbitrary CMS Git/shell access,
dependency installation, code publishing, or arbitrary styling controls.

A worker requesting one must prove a concrete blocker; future possibility is not
enough.

## Stop Conditions

Pause when visual fidelity conflicts with a module boundary, content would gain a
second authority, safe saves cannot be deterministic, unrelated user changes
overlap the worker, scope expands into a later loop, or success exists only in
the dev server rather than production output.

Do not solve blockers by weakening the product goals.

## Next Session

1. Read this handoff and the audit.
2. Confirm the worktree and preserve unrelated changes.
3. Create a reconstruction branch only after implementation is authorized.
4. Create the two reconstruction records.
5. Complete Phase 0.
6. Open Loop 1 with a narrow worker scope.
7. Do not start CMS work until the public reconstruction passes evaluation.

No reconstruction code was implemented in the session that produced this
handoff.
