# Reconstruction Status

Updated: 2026-07-12

## Current Gate

Phase 0 and Loops 1-4 independently passed. The repository is now at the
maintenance and cutover gate: content/privacy decisions and legacy retirement
still require the user's explicit acceptance.

## Deliverable

Finish every safe pre-cutover task:

- final production verification and crawl of all fixed routes/states/assets;
- representative comparison against Phase 0 baselines and Loop 1 actuals;
- keyboard/mobile-menu regression review;
- README and architecture documentation for the reconstructed public site,
  Studio, verification, publishing boundary, and maintenance workflow;
- concrete rollback instructions before and after legacy retirement;
- a concise content/privacy decision table based on current public copy and
  rendered PDF review;
- an exact proposed legacy-retirement list, without deleting it yet;
- a running local public site and Studio for user acceptance.

## Worker Scope

The Loop 4 preparation worker owns only:

- `README.md` and `AGENT.md`;
- `docs/reconstruction/current.md` and the Cutover acceptance section;
- temporary PDF renders/review files under `/tmp`, removed after review.

The worker is not alone in the repository. It must not edit public content,
uploads, application/configuration, publishing code, handoff/audit/baselines,
legacy files, or Git state. No copy correction, privacy redaction, deletion,
commit, push, or deployment occurs in preparation.

## Documentation Contract

README becomes the operator-facing source for:

- supported Node setup and `npm install`;
- `npm start`, `npm run studio`, `npm run verify`, and production preview;
- canonical ownership of `content/site.json`, `content/articles/**`, and
  `public/uploads/**`;
- stable hash routes and fixed code-owned templates;
- Studio saved-draft semantics, real iframe preview, conflict behavior, and
  single-file operations;
- Verify/Publish allowlist, diff confirmation, one-commit/push/retry behavior,
  and the fact that `Pushed` is not `Deployed`;
- normal code/dependency/config changes remaining outside Studio publishing;
- rollback and current pre-retirement status.

`AGENT.md` becomes the concise technical architecture/maintenance map for the
reconstructed system. It must stop claiming the Tkinter/generated-data path is
active, while clearly marking legacy root files as temporary rollback material
pending user-approved retirement.

Do not repeat the full handoff, add another runbook, or describe unimplemented
features.

## Production Acceptance Contract

Run `npm run verify`, then immediately serve that exact unchanged `dist` with:

```bash
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Do not use Vite dev or the Studio iframe for final production evidence. Record a
compact route table in this file derived from the validated visible slugs. Every
row records route, expected entity/recovery marker, actual marker, metadata
result, asset/article result where applicable, and console-error result. Crawl:

```text
#/
#/research
#/research/<2 visible slugs>
#/projects
#/projects/<5 visible slugs>
#/garden
#/garden/<2 visible slugs>
#/research/missing
#/projects/missing
#/garden/missing
#/definitely-missing
```

Confirm each visible detail renders the matching entity, missing routes render
recovery, both article bodies and KaTeX render from the production bundle, all
three PDFs resolve, Home/shell CV targets match, metadata updates, Back/Forward
work once per namespace, and no browser console error appears.

Compare only this frozen matrix against the existing Phase 0 baselines and Loop
1 actuals at their existing 1440, 960, and 390 sizes, with 320 only for menu:

- Home;
- Research, Projects, and Garden lists;
- one project article detail and one Garden article/KaTeX detail;
- one metadata-only Research/PDF detail;
- unknown/missing recovery;
- mobile menu open/closed.

Record each as `Pass`, `approved defect fix`, or `new defect`. Human comparison
is authoritative. Keyboard review is limited to menu open/close, Escape/focus
restoration, no closed-menu tab stops, visible focus, route activation, and one
Back/Forward cycle per namespace. Do not create more screenshots or a visual
framework unless a new defect needs evidence.

## PDF And Privacy Review Contract

Review the current CV and two research PDFs locally without editing them:

- inspect PDF metadata and extracted text for public personal fields, author and
  collaborator names, draft/status language, comments/placeholders, and tool or
  hidden-document metadata;
- render every page and inspect for visible draft marks, placeholder sections,
  comments, clipping, or obvious disclosure concerns;
- record categories and decision questions, not private values such as the full
  phone number;
- do not infer collaborator approval or legal/privacy consent.

For each PDF, record only filename, SHA-256, page count, metadata inspection
complete, text extraction complete/failed, and rendered/inspected page count.
Every page must render and be inspected; unreadable metadata/text or any
unrendered page blocks review completion. Do not record raw extraction, phone,
email, location, GPA, hidden metadata strings, or a collaborator-name dump.

The decision table must cover at least:

1. `natrual` and `heckathon` typo corrections.
2. Current role, 2025 Recent items, dates, awards, and paper status.
3. The `Content coming soon...` Garden body.
4. GKP manuscript draft/placeholder language and collaborator approval.
5. Public CV categories: phone, email, city/location, GPA, academic timeline,
   employment/awards, and document metadata.
6. Both research PDFs' public draft status, author/collaborator approval,
   comments/placeholders, accessibility, and metadata.
7. Public naming/title consistency and optional favicon/social image choices.

Each row records `Keep`, `Correct`, `Remove/replace`, or `User decision pending`.
Preparation leaves every row pending unless the user has already made the exact
decision.

## Rollback Contract

Document two bounded paths:

- before legacy retirement, and only while the complete legacy set/dependencies
  still exist, an emergency renderer rollback is the single `index.tsx` import
  switch from `./src/App` back to root `./App`. This serves the legacy data
  snapshot, not newer canonical CMS content. Run `npm run verify` and inspect the
  local production preview before any push;
- after retirement, use `git revert <reviewed-cutover-commit>` through normal
  review, then run verification and inspect production preview before push. Do
  not reset, check out individual files, or manually reconstruct a partial tree.

The final cutover commit must be scoped and reviewed outside Studio because it
contains code/docs/deletions. Studio publishing remains content-only.

## Proposed Retirement List

Do not delete these in preparation. After user acceptance, inspect the final
diff and retire the superseded runtime/content path:

- root `App.tsx`, `constants.tsx`, `types.ts`, `data.ts`, `data.json`, `cms.py`,
  `metadata.json`;
- legacy root `components/**`, `pages/**`, and `posts/**` after confirming no
  active import/reference;
- obsolete Tailwind scan entries and README/AGENT legacy caveats.

Historical investigation/design/handoff documents remain evidence and are not
retired.

Audit every candidate reference and classify it as `active runtime/import
blocker`, `expected cutover edit`, `legacy-internal`, or `historical-doc
evidence`. Any active blocker fails retirement eligibility. The current
`index.tsx` root-App option is the rollback seam, and Tailwind legacy scan globs
are expected cutover edits; neither may be misreported as absent.

Before and after preparation, record unchanged HEAD, empty index, an aggregate
SHA-256 manifest for canonical content/uploads, and an aggregate manifest for
all proposed legacy files. Do not delete or correct anything.

## Essential Checks

1. `npm run verify` and the final production crawl pass.
2. Public visual/keyboard/mobile review finds no new regression and only approved
   differences from baselines.
3. README and AGENT accurately match the implemented system and commands.
4. PDF review records SHA/page-count/completion evidence for all pages/metadata
   and produces the bounded decision table without exposing private values.
5. Rollback instructions are literal, scoped, and do not use destructive Git.
6. Every retirement reference is classified; no active runtime/import blocker
   remains, and the rollback seam/Tailwind edits are explicitly identified.
7. No legacy file, public content/upload, Git index/HEAD, or deployed state is
   changed during preparation.
8. Public and Studio loopback URLs are running for user acceptance.

## Evaluator Sheet

The independent evaluator reviews:

1. final verify/crawl and production artifact behavior;
2. visual/interaction fidelity against existing evidence;
3. README/AGENT factual accuracy and command boundaries;
4. PDF review completeness and privacy-safe decision phrasing;
5. rollback correctness and retirement reference audit;
6. strict no-delete/no-content-change/no-Git-mutation scope.

Preparation fails on a public regression, undocumented active dependency on a
proposed retirement file, inaccurate publishing/rollback instructions, omitted
privacy category, leaked private value in docs, or any premature deletion/content
correction/Git mutation.

## User Acceptance Gate

Legacy retirement and final cutover require the user to:

- approve visual fidelity and interaction behavior;
- decide every content/privacy row;
- approve the public CV and both PDFs in their chosen form;
- confirm the rollback approach;
- explicitly authorize legacy retirement and final content corrections.

Until then, the legacy path remains present and the reconstruction remains
rollback-ready.

## Loop 4 Evidence

`npm run verify` passed content validation, TypeScript, the single production
build, and artifact smoke checks. The unchanged verified `dist` is served at
`http://127.0.0.1:4173/`.

### Production Route Crawl

All metadata results below include a route-specific title, non-empty
description, and matching canonical URL. `None` means no browser console error
was captured during the fixed crawl.

| Route | Expected marker | Actual marker | Metadata | Asset/article result | Console errors |
| --- | --- | --- | --- | --- | --- |
| `#/` | Home hero | `子根斋` | Pass | Shell and Home CV hrefs match; CV HTTP 200 | None |
| `#/research` | Research list | `Research` | Pass | 2 visible papers; both PDF links HTTP 200 | None |
| `#/research/energy-scaled-zero-noise-extrapolation` | GKP paper | Matching title | Pass | GKP PDF HTTP 200 | None |
| `#/research/contextual-quantum-fisher-information-verification` | Contextual QFI paper | Matching title | Pass | Contextual PDF HTTP 200 | None |
| `#/projects` | Projects list | `Projects` | Pass | 5 visible projects | None |
| `#/projects/badger-solar-car-optimization` | Badger Solar project | Matching title | Pass | Metadata detail rendered | None |
| `#/projects/campus-dining-optimization` | Campus Dining project | Matching title | Pass | Metadata detail rendered | None |
| `#/projects/multi-qubit-crosstalk-simulation` | Crosstalk project | Matching title | Pass | Metadata detail rendered | None |
| `#/projects/brachistochrone-fea-solution` | Brachistochrone project | Matching title | Pass | Bundled article rendered; KaTeX present | None |
| `#/projects/deep-time-steps-patterns-of-wear` | Deep-time project | Matching title | Pass | Metadata detail rendered | None |
| `#/garden` | Garden list | `Garden` | Pass | 2 visible posts | None |
| `#/garden/solving-the-brachistochrone-with-fea` | Brachistochrone post | Matching title | Pass | Bundled article rendered; KaTeX present | None |
| `#/garden/simulating-quantum-crosstalk` | Crosstalk post | Matching title | Pass | Bundled placeholder body rendered | None |
| `#/research/missing` | Research recovery | `Research item not found` | Pass | Recovery action rendered | None |
| `#/projects/missing` | Project recovery | `Project not found` | Pass | Recovery action rendered | None |
| `#/garden/missing` | Garden recovery | `Garden post not found` | Pass | Recovery action rendered | None |
| `#/definitely-missing` | Unknown-route recovery | `Page not found` | Pass | Recovery action rendered | None |

Direct loopback checks returned HTTP 200 and `application/pdf` for
`ContextualQM.pdf`, `GKP_paperv7.pdf`, and `Harry CV.pdf`. One Back/Forward
cycle passed for each of Research, Projects, and Garden.

### Frozen Visual And Interaction Matrix

The existing Phase 0 baselines and Loop 1 actuals were inspected at their
stored 1440, 960, and 390 sizes, with 320 used only for the menu. Some stored
Loop 1 JPEGs contain capture masking; accepted visible structure and the live
verified route evidence, not masked pixels, were used for the comparison.

| Template/state | Result | Evidence summary |
| --- | --- | --- |
| Home | Pass | Accepted shell, hero, Recent, Featured, and mobile stack retained |
| Research list | Pass | Both entries, actions, tags, and responsive ordering retained |
| Projects list | Pass | Five-card layout and accepted narrow-title wrapping retained |
| Garden list | Pass | Two-post layout and accepted collision fix retained |
| Project article detail | Pass | Article structure and KaTeX retained |
| Garden article/KaTeX detail | Pass | Garden metadata, shared article, and KaTeX retained |
| Research metadata/PDF detail | Pass | Detail hierarchy and PDF action retained |
| Unknown/missing recovery | approved defect fix | Useful recovery replaces the Phase 0 empty main area |
| Mobile menu open/closed | Pass | Stored 390/320 open and 390 closed evidence remains consistent |

Loop 4 re-ran route activation through the three Back/Forward cycles. Independent
live review at 390px passed the bounded mobile keyboard matrix: keyboard-open
moved focus to the first menu link with a visible 3px outline; Escape and the
explicit close control restored focus to the menu button; Tab from the closed
menu skipped hidden sidebar links and reached Download CV; keyboard activation
of Research closed the menu, navigated to `#/research`, focused `main`, and kept
the visible 3px focus outline.

### PDF Review

| Filename | SHA-256 | Pages | Metadata | Text extraction | Rendered/inspected |
| --- | --- | ---: | --- | --- | ---: |
| `ContextualQM.pdf` | `6bd027378ed07789f0342368e317626bc79d26df6a3f7402aa9a0f050d9c1bdb` | 7 | Complete | Complete; one chart-only page has no text | 7/7 |
| `GKP_paperv7.pdf` | `7baac87fca8e451370249e1e8978ef0ea4289b2012096df74fe8ff35ed7e32ca` | 15 | Complete | Complete | 15/15 |
| `Harry CV.pdf` | `914fd557853b57ff98442ee536fbe1d21f082a7bbde2e279ad55ad4e53ac9461` | 2 | Complete | Complete | 2/2 |

All pages rendered without clipping or broken glyphs. The review found public
draft/status and placeholder categories in the research material, and the
expected personal, education, timeline, employment, award, and document
metadata categories in the CV. No private values or collaborator-name dump is
recorded here.

### Content And Privacy Decisions

| Decision category | Status | Evidence requiring a decision |
| --- | --- | --- |
| `natrual` and `heckathon` copy | User decision pending | Both spellings are currently public |
| Current role, 2025 Recent items, dates, awards, and paper status | User decision pending | Current site and CV should be reconciled by the user |
| `Content coming soon...` Garden body | User decision pending | The body is visibly public and intentionally unchanged |
| GKP draft/placeholder language and collaborator approval | User decision pending | Draft/status and placeholder categories are visible; approval cannot be inferred |
| CV phone, email, location, GPA, timeline, employment/awards, and metadata | User decision pending | All categories were found; no values are repeated in this record |
| Both research PDFs: public status, approvals, comments/placeholders, accessibility, metadata | User decision pending | Review completed, but publication consent and final status require the user |
| Public naming/title consistency, favicon, and social image | User decision pending | Naming varies by surface; optional assets are not selected |

### Retirement Reference Audit

| Reference group | Classification | Result |
| --- | --- | --- |
| Active `index.tsx` import and `src/**` imports | Active runtime checked | `index.tsx` imports `./src/App`; no active import reaches a proposed legacy file |
| Root `App.tsx` import option | Expected cutover/rollback seam | The documented one-import pre-retirement rollback remains available |
| Tailwind root/component/page scan globs | Expected cutover edit | Root legacy scans must be narrowed with retirement; `src/**` remains active |
| README/AGENT legacy caveats | Expected cutover edit | Remove only after the reviewed retirement commit |
| Root `App.tsx`, `constants.tsx`, `data.ts`, `data.json`, `cms.py`, root `components/**`, `pages/**`, `posts/**` references | Legacy-internal | References stay within the former renderer/content path |
| Investigation, handoff, reconstruction, and 2026 design records | Historical-doc evidence | Preserve as evidence; do not rewrite or retire |

Path-bounded inspection distinguishes active `src/components/**` and
`src/pages/**` from the same-named root legacy directories. No active
runtime/import blocker was found.

### Integrity And Process Ownership

The aggregate manifest sorts files by relative path first, emits each line as
`<file-sha256>  <relative-path>\n` in that order, concatenates the lines, and
computes SHA-256 of the result.

| Check | Before preparation | After preparation |
| --- | --- | --- |
| HEAD | `f87c655fadb7b615e7f2a28c0d221966ac14a8c9` | unchanged |
| Git index | Empty | Empty |
| Canonical content/uploads | 6 files; `6eb766ebc8010ccda32832b840144cb7df6adc6401d3d3b495ee1cf0bb38bd9a` | unchanged |
| Proposed legacy set | 14 files; `b73dc9101ceda0a43701e606612cf3756ba207a38e6aee8a891715292ffe04bc` | unchanged |

At the Loop 4 evidence timestamp, the verified production preview was observed
at `http://127.0.0.1:4173/` (worker session `3440`) and Studio at
`http://127.0.0.1:8080/studio.html` with API `127.0.0.1:8787` (worker session
`3315`). This is timestamped acceptance evidence, not a durable availability
promise; check current listeners before relying on those processes.

## Maintenance Documentation Checkpoint

The future-maintainer documentation now matches the implemented content,
Studio, Verify, Publish, CI, and rollback boundaries. `AGENTS.md` is the concise
repository instruction entrypoint, `AGENT.md` is the operational architecture
map, and `README.md` is the human workflow and troubleshooting guide. The docs
also record why blocked Publish remains focusable, how its hover/focus checklist
maps to server-enforced readiness, and when work must leave Studio for normal
review. This checkpoint changed documentation only; it did not alter content,
runtime code, configuration, or acceptance evidence, and it did not stage,
commit, push, or deploy anything.

## State

Phase 0: independently evaluated PASS.

Loop 1: independently evaluated PASS.

Loop 2: independently evaluated PASS.

Loop 3: independently evaluated PASS.

Loop 4 preparation: independently evaluated PASS. Final cutover remains gated on
user acceptance.

## Blockers

Final cutover is intentionally gated on user acceptance. No preparation blocker
remains.
