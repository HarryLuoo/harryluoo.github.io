# Reconstruction Acceptance

Updated: 2026-07-12

This is the editable-field inventory and end-to-end acceptance checklist. Phase
0 fills the inventory and baseline evidence. Later loops update status without
duplicating this record.

## Status Legend

- `[ ]` not yet satisfied
- `[x]` satisfied with evidence
- `Studio area` names the future handwritten editor that owns the value
- `Code-owned` means presentation or interaction, not editable information
- An inventory row may describe a repeated record field; it applies to every
  item in that list. Each field is assigned to exactly one owner.
- Uploads owns file records and bytes. The editor that displays an asset owns
  the reference selecting that upload; those are separate fields, not shared
  ownership.

## Editable-Field Inventory

### Shared Shell

| Field or control | Current rendering / state | Exactly one future owner | Status / evidence |
| --- | --- | --- | --- |
| Profile name | Desktop identity, mobile header, and copyright name | Shell | [x] Home and list baselines |
| Role | Desktop sidebar subtitle (`Undergrad`) | Shell | [x] Desktop baselines |
| Affiliation | Desktop sidebar institution | Shell | [x] Desktop baselines |
| Bio | Optional sidebar paragraph | Shell | [x] Currently hidden; `showBio` is false |
| Bio visibility | Controls whether the optional bio is rendered | Shell | [x] Current absence recorded above |
| Email address | Mail link destination | Shell | [x] DOM inspection; link has no visible label |
| Social link platform and URL | GitHub and LinkedIn icon destinations; empty platforms are absent | Shell | [x] Desktop and menu baselines |
| Social link visibility and order | Presence and sequence of social icons | Shell | [x] Desktop and menu baselines |
| Navigation item label | HOME, RESEARCH, PROJECTS, GARDEN, CV | Shell | [x] All baselines |
| Navigation item destination | Internal hash destination or external asset/link | Shell | [x] DOM inspection |
| Navigation external flag | Controls internal navigation versus new-tab link behavior | Shell | [x] CV is the current external item |
| Navigation visibility and order | Presence and sequence of navigation items | Shell | [x] All baselines |
| Shared CV upload reference | Canonical target reused by the shell CV item and future Home CV action | Shell | [x] Current shell target is `/uploads/Harry CV.pdf`; Home is incorrectly divergent |
| Copyright year | Current calendar year | Code-owned | [x] Dynamic `2026`; not editorial content |
| Active marker, icons, mobile header/menu controls, and menu close behavior | Presentation and interaction | Code-owned | [x] All baselines; open state captured separately |

### Home

| Field or control | Current rendering / state | Exactly one future owner | Status / evidence |
| --- | --- | --- | --- |
| Hero headline | `子根斋` | Home | [x] Home baselines |
| Hero subheadline | Introductory sentence below the hero rule | Home | [x] Home baselines |
| Recent source mode | Chooses automatic entity references or handwritten entries | Home | [x] Current output uses the two handwritten entries |
| Recent automatic limit | Maximum automatic entries when automatic mode is used | Home | [x] Control mapped; not visible in current manual state |
| Recent entry title | Bold entry title | Home | [x] Home baselines |
| Recent entry date label | `11-2025`, `08-2025` | Home | [x] Home baselines |
| Recent entry description | Sentence following each title | Home | [x] Home baselines |
| Recent entry optional destination and CTA label | Makes a handwritten entry actionable | Home | [x] Both are currently empty, so no recent-entry CTA is rendered |
| Recent entry optional image reference | Selects an uploaded image for an entry | Home | [x] Currently empty; no recent images are rendered |
| Recent entry visibility and order | Inclusion and displayed sequence | Home | [x] Two entries are visible in stored order |
| Automatic recent entity reference | Entity type plus immutable slug when automatic mode is used | Home | [x] Cross-reference mapped; not active in the current rendered state |
| Featured entity reference | Entity type plus immutable slug; displayed title and description remain owned by the referenced entity editor rather than duplicated on Home | Home | [x] Current reference is research paper `p1`, whose visible fields are Research-owned |
| Featured optional image override reference | Selects an upload instead of the entity image | Home | [x] Currently empty; featured card has no image |
| Featured visibility and placement | Whether and where the selected entity appears in the fixed Home template | Home | [x] Current entity is visible in the featured placement |
| Projects teaser description | `Fun projects that I do.` | Home | [x] Home baselines |
| Garden teaser description | `Notes, thoughts, and derivations. A digital garden.` | Home | [x] Home baselines |
| Home CV target | Reuses the shared Shell CV upload reference | Shell | [x] Current Home link incorrectly points to absent `/cv.pdf` |
| Section headings, spotlight label, entity-derived CTA, teaser titles, and command labels | RECENT, FEATURED, Projects, Garden, Download CV, and fixed link labels | Code-owned | [x] Fixed template copy; not freeform informational content |
| Typography, font selection, sizes, rules, card composition, and placement | Visual template | Code-owned | [x] Explicitly excluded from content by the handoff |

### Research

| Field or control | Current rendering / state | Exactly one future owner | Status / evidence |
| --- | --- | --- | --- |
| Page description | Introductory sentence beneath `Research` | Research | [x] Research-list baselines |
| Paper immutable slug | Stable detail identity and cross-reference target | Research | [x] Future route/control mapped; current records use `p1` and `p2` IDs |
| Paper title | List title and future detail heading | Research | [x] Research-list baselines |
| Authors and author order | Comma-separated byline | Research | [x] Research-list baselines |
| Venue/status | `Preparing` or `Research Experience` | Research | [x] Research-list baselines |
| Year | Year beside venue/status | Research | [x] Research-list baselines |
| Description | List summary | Research | [x] Research-list baselines |
| Tags and tag order | Tag chips below each paper | Research | [x] Research-list baselines |
| PDF upload reference | PDF and View PDF action target | Research | [x] Both current papers reference uploads |
| Optional code URL | Code and View Code action target | Research | [x] Current `p1` placeholder `#` renders no action; `p2` has no value |
| BibTeX visibility | Enables the BibTeX action | Research | [x] Currently absent/false on both papers |
| Optional BibTeX override | Copied citation text when the action is enabled | Research | [x] Currently absent; generated fallback is not visible |
| Article reference | Immutable article slug used by the detail body | Research | [x] Currently absent on both papers, so no Research detail is exposed |
| Paper visibility and order | Inclusion and displayed sequence | Research | [x] Two papers are visible in stored order |
| Detail body | Canonical Markdown for a referenced article | Articles | [x] Current-state absence recorded; no body was manufactured |
| Page heading, PDF/Code/BibTeX/Read More labels, loading/error feedback, and back label | Fixed commands and states | Code-owned | [x] List captured; current detail unavailable |

### Projects

| Field or control | Current rendering / state | Exactly one future owner | Status / evidence |
| --- | --- | --- | --- |
| Project immutable slug | Stable detail identity and cross-reference target | Projects | [x] Future route/control mapped; current records use `pr1`-`pr5` IDs |
| Title | Card and detail heading | Projects | [x] Project list/detail baselines |
| Description | Card summary | Projects | [x] Project-list baselines |
| Technology tags and order | Chips at the bottom of each card | Projects | [x] Project-list baselines |
| Optional image upload reference | Card and detail image | Projects | [x] Empty on all current projects; no project image is rendered |
| Optional repository URL | Card icon and detail View Code action | Projects | [x] Two real URLs; `#` placeholders render no action |
| Optional live-demo URL | Card icon and detail Live Demo action | Projects | [x] Currently absent on every project |
| Article reference | Immutable article slug used by the detail body | Projects | [x] Only Brachistochrone currently references a Markdown path |
| Project visibility and order | Inclusion and displayed sequence | Projects | [x] Five projects are visible in stored order |
| Detail body | Canonical Markdown for the referenced article | Articles | [x] Brachistochrone representative body captured |
| Page heading, Click for details, link labels, loading/error feedback, and back label | Fixed commands and states | Code-owned | [x] Project list/detail baselines |

### Garden

| Field or control | Current rendering / state | Exactly one future owner | Status / evidence |
| --- | --- | --- | --- |
| Page description | `A collection of notes, derivations, and thoughts...` | Garden | [x] Garden-list baselines |
| Post immutable slug | Stable detail identity and cross-reference target | Garden | [x] Future route/control mapped; current records use `b1` and `b2` IDs |
| Title | Card and detail heading | Garden | [x] Garden list/detail baselines |
| Publication date label | Card date and detail metadata | Garden | [x] Garden list/detail baselines |
| Excerpt | Card summary | Garden | [x] Garden-list baselines |
| Tags and tag order | Card chips and comma-separated detail metadata | Garden | [x] Garden list/detail baselines |
| Article reference | Immutable article slug used by the detail body | Garden | [x] Brachistochrone references Markdown; Crosstalk currently stores inline placeholder text |
| Optional PDF attachment upload reference | Detail attachment action | Garden | [x] Current `#` placeholder renders no attachment |
| Post visibility and order | Inclusion and displayed sequence | Garden | [x] Two posts are visible in stored order |
| Detail body | Canonical Markdown for the referenced article | Articles | [x] Brachistochrone captured; Crosstalk body is only `Content coming soon...` and is not expanded here |
| Page heading, metadata separator, attachment labels, loading/error feedback, and back label | Fixed commands and states | Code-owned | [x] Garden list/detail baselines |

### Articles And Uploads

| Field or control | Current rendering / state | Exactly one future owner | Status / evidence |
| --- | --- | --- | --- |
| Article immutable slug and filename | Registry identity for `content/articles/<slug>.md` | Articles | [x] Future canonical location mapped |
| Article Markdown body | Long-form headings, prose, math, links, and inline/code blocks | Articles | [x] One current Brachistochrone body is shared by a project and post |
| Article usage references | Read-only display of papers/projects/posts using the article | Articles | [x] Cross-reference control mapped; source references remain owned by their entity editors |
| Upload path/filename and bytes | CV, paper PDFs, optional images, and post attachments | Uploads | [x] Current uploads are one CV and two research PDFs |
| Upload replace/delete operation and usage display | File lifecycle and reference safety | Uploads | [x] Future control mapped; no current public field invented |
| Independent image alt text | None exists; current image alt text is derived from the owning entity title | Code-owned | [x] Current-state absence recorded rather than adding content |

### SEO And Code-Owned Template Copy

| Field or control | Current rendering / state | Exactly one future owner | Status / evidence |
| --- | --- | --- | --- |
| Default site title | Initial document title `G.Z. Luo` | SEO | [x] Current `index.html` inspected |
| Home document title | `G. Z. Luo` after Home mounts | SEO | [x] Current Home-specific value inspected |
| Per-list and per-detail title | Browser-tab title for each route/entity | SEO | [x] Currently absent; non-Home routes retain the Home/generic title |
| Default and per-route description | Search/social summary | SEO | [x] Currently absent |
| Canonical URL | Default and route canonical | SEO | [x] Currently absent |
| Open Graph/Twitter title, description, and image upload reference | Social-share metadata | SEO | [x] Currently absent |
| Favicon upload reference | Browser/site icon | SEO | [x] Currently absent |
| Structured-data identity and profile links | Machine-readable person/site metadata | SEO | [x] Currently absent |
| Robots and sitemap policy | Search discovery metadata | SEO | [x] Currently absent |
| Fixed page headings, action labels, accessibility names, focus/loading/error/empty/404 copy | Template vocabulary and interaction feedback | Code-owned | [x] Existing labels captured; useful 404 content is currently absent |

## Baseline Evidence

| Template / state | 1440 | 960 | 390 | 320 exception | Notes |
| --- | --- | --- | --- | --- | --- |
| Home / default | [x] [1440](baselines/home-default-1440.jpg) | [x] [960](baselines/home-default-960.jpg) | [x] [390](baselines/home-default-390.jpg) | Not needed | Current Home |
| Research / list | [x] [1440](baselines/research-list-1440.jpg) | [x] [960](baselines/research-list-960.jpg) | [x] [390](baselines/research-list-390.jpg) | Not needed | Both papers shown |
| Research / detail | [x] Current-state absence | [x] Current-state absence | [x] Current-state absence | Not applicable | No paper has an article/content reference, so no current Research detail can be opened |
| Projects / list | [x] [1440](baselines/projects-list-1440.jpg) | [x] [960](baselines/projects-list-960.jpg) | [x] [390](baselines/projects-list-390.jpg) | Not needed | 960 records narrow-card title pressure |
| Projects / detail / Brachistochrone | [x] [1440](baselines/projects-detail-brachistochrone-1440.jpg) | [x] [960](baselines/projects-detail-brachistochrone-960.jpg) | [x] [390](baselines/projects-detail-brachistochrone-390.jpg) | Not needed | Representative current Markdown detail |
| Garden / list | [x] [1440](baselines/garden-list-1440.jpg) | [x] [960](baselines/garden-list-960.jpg) | [x] [390](baselines/garden-list-390.jpg) | Not needed | 960 records title collision |
| Garden / detail / Brachistochrone | [x] [1440](baselines/garden-detail-brachistochrone-1440.jpg) | [x] [960](baselines/garden-detail-brachistochrone-960.jpg) | [x] [390](baselines/garden-detail-brachistochrone-390.jpg) | Not needed | Representative current Markdown detail |
| Unknown route / empty main | [x] [1440](baselines/unknown-route-empty-1440.jpg) | [x] [960](baselines/unknown-route-empty-960.jpg) | [x] [390](baselines/unknown-route-empty-390.jpg) | Not needed | Records the current empty main area; no 404 content invented |
| Mobile menu / open on Home | n/a | n/a | [x] [390](baselines/mobile-menu-open-home-390.jpg) | [x] [320](baselines/mobile-menu-open-home-320.jpg) | Literal viewport frames show the open fixed-height overlay at each requested size |

The screenshot API produced JPEG evidence. Home, list, and open-menu mobile
states are literal viewport frames rather than full-page stitches: every 390
file is exactly 390x844, and the 320 menu exception is exactly 320x568. The
frames show the intended state legibly without including content below the
viewport.

## Public Reconstruction

- [x] One Zod schema is the sole content/type authority (`src/content/schema.ts`).
- [x] `content/site.json` is the sole structured content authority consumed by
      the reconstructed renderer.
- [x] Each long-form body has one canonical `content/articles/<slug>.md` file;
      the project and Garden post share `brachistochrone.md`.
- [x] Invalid values, extra keys, duplicate slugs, broken placements/references,
      unknown tags, missing files/assets, and unsafe paths fail the table-driven
      temporary-copy validation probes.
- [x] Home, Research, Projects, Garden, metadata/article detail, and recovery
      templates remain fixed in code and pass human comparison in
      `docs/reconstruction/loop1-actual/`.
- [x] Stable `#/research/:slug`, `#/projects/:slug`, and `#/garden/:slug` routes
      pass direct load, refresh, Back, and Forward for every namespace.
- [x] Production output bundles both article bodies in JavaScript, emits no
      Markdown files, and contains every referenced upload.
- [x] The Home and shell CV links both resolve to `/uploads/Harry CV.pdf`.
- [x] Representative 1440/960/390 keyboard and visual review passes; 320/390
      mobile-menu focus, Escape, focus restoration, scroll lock, inert
      background, and overflow checks pass.
- [x] Unknown routes and one missing slug per entity namespace show useful
      recovery states.

## Local Studio

- [x] `npm run studio` supervises the Vite site/studio and narrow Node API and
      stops both when either exits. Exact-port startup, collision failure,
      normal SIGINT cleanup, and forced API-child termination were observed;
      the forced case returned launcher exit `1` and removed both listeners.
- [x] Both services bind only to loopback and Vite proxies `/api`.
- [x] The real public site is the only preview renderer; unsaved edits did not
      enter the iframe, while a saved Shell edit and article edit did.
- [x] Shell, Home, Research, Projects, Garden, Articles, Uploads, and SEO have
      handwritten editors covering the inventory. The worker browser walk
      exercised profile/bio/social/nav/CV; Home hero/recent/manual/automatic/
      featured/teasers; Research description/shared tags/paper fields;
      project fields; Garden description/post fields; article body/slug/usage;
      upload create/replace/delete/usage controls; and all SEO controls.
- [x] Dirty state, save state, navigation warnings, validation errors, and disk
      conflicts are clear.
      Dirty/save/discard, tab confirmation, isolated validation failures, and
      disk conflicts passed. The standard `beforeunload` prevention handler was
      independently reviewed; the automation backend bypassed the native dialog.
- [x] The API is the sole Studio writer; isolated checks exercised validated,
      serialized, atomic, path-constrained, origin-checked mutations.
- [x] Referenced articles and uploads are blocked from deletion with usage, and
      unreferenced create/update/delete operations passed in a temporary root.
- [x] External modifications return a conflict rather than being overwritten.
- [x] No recovery record exists because every implemented mutation is
      single-file and referenced multi-file deletes are blocked.

Correction evidence: a temporary PNG was created through the existing proxied
upload API, selected in the Home asset picker, saved, and loaded by the real
iframe as `/uploads/studio-check.png` with natural size `1x1`. Clearing the
picker and saving removed the preview image. The orchestrator then used the real
Uploads editor Delete action, accepted its native confirmation, and observed the
unreferenced upload row removed. The isolated API upload create/replace/delete
lifecycle also passed. Cleanup retained exactly
`ContextualQM.pdf`, `GKP_paperv7.pdf`, and `Harry CV.pdf`; `site.json` matched
its pre-check bytes.

Normal-mode/production evidence: `npm start` returned `404` for `/studio.html`
and opened no `8787` listener. The clean production build emitted no Studio
HTML/chunk/API strings and contained only the three canonical uploads.

Responsive evidence: desktop, 900px, and 390px inspection found no document
overflow, overlapping controls, or clipped form fields. At 390px, area tabs use
their own horizontal scroller while the document remains exactly viewport-wide;
native controls and focus-visible styling passed code/DOM review.

## Verification and Publishing

- [x] One verification command validates content/references, typechecks, builds,
      and smoke-checks routes, articles, and assets.
- [x] CI runs the same verification command and uploads the `dist` produced by
      that successful job without a second build.
- [x] Publish requires fresh verification and a worktree containing only
      CMS-owned changes.
- [x] The Studio shows the diff and stages only `content/site.json`,
      `content/articles/**`, and `public/uploads/**`.
- [x] Publish commits before push; retrying a failed push creates no second
      commit.
- [x] Push success is reported as `Pushed`, not `Deployed`.

Worker evidence used one full temporary workspace/repository and a local bare
upstream for every mutating Git check. Allowed-only publication pushed one
commit and left clean state. A rejecting remote produced one pending commit;
Retry Push later pushed that exact SHA without another commit, while a second
Publish remained blocked. Stale verification, unrelated tracked/untracked and
staged files, ignored CMS content, oversized diff, unexpected request fields,
invalid messages, and a post-stage allowed-file mutation all failed before
commit. Fixed Git environment tests suppressed malicious inherited redirection
and local commit/pre-push hooks while preserving remote rejection behavior.

A focused destination regression configured the tracked upstream as
`origin/main`, set `remote.pushDefault=evil` and `push.default=current`, and
proved that both initial Publish and rejected-then-retried Push advanced only
the bound `origin/main`. The `evil` bare remote never gained a `main` ref.

The real reconstruction worktree displayed a complete 310-line CMS text diff
and its unrelated blockers, passed Studio Verify, and retained an empty index
and unchanged HEAD. Desktop and 390px UI review found no document overflow or
inaccessible command state; Publish remained disabled while blocked.

## Cutover

- [ ] Approved content corrections and privacy decisions are recorded.
- [x] The fixed 17-route verified-dist production crawl and frozen visual
      evidence comparison pass.
- [x] Loop 4 live mobile keyboard recheck passes: open/close, Escape/focus
      restoration, closed-menu tab stops, visible focus, and route activation.
- [x] README and architecture documentation describe the reconstructed system.
- [x] Bounded pre/post-retirement rollback instructions and the reference audit
      are recorded; user confirmation remains part of final acceptance.
- [x] All 24 PDF pages and metadata/text categories were reviewed and a
      privacy-safe user decision table was prepared.
- [ ] Tkinter CMS, `data.ts`, and duplicate content paths retire only after user
      acceptance.
