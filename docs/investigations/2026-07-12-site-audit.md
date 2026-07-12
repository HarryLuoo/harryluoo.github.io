# Personal Website Investigation

Date: 2026-07-12  
Scope: investigation only; no website or CMS fixes were made

## Executive Summary

The site is a small React 18/Vite application with four hash routes and a local
Tkinter CMS. The production build succeeds, and the main list pages render, but
two important public workflows are broken:

1. Markdown project/post detail pages fetch `posts/*.md`, but Vite does not put
   those files in `dist`. The production preview returns `index.html` for the
   missing Markdown URL, so the detail view visibly prints the site's HTML
   source instead of the article.
2. The Home page's Download CV button points to `/cv.pdf`, which does not exist.
   The working CMS-managed link is `/uploads/Harry CV.pdf`.

The current CMS also cannot launch with the machine's documented `python`
command because Python 3.14 has no `_tkinter` module installed. Independently of
that environment failure, the CMS has substantial data-integrity and usability
risks: process-working-directory paths, non-atomic duplicated output, no schema
or reference validation, incomplete CRUD, silent file overwrites, and no
draft/undo/rollback model.

The visual design is distinctive and generally coherent on wide desktop and
small mobile. The weakest responsive range is tablet/narrow desktop: long card
titles visibly clip or collide. Navigation and content cards also have major
keyboard, focus, and shareability problems.

## Architecture Map

- Runtime: React 18, React Router 6, Vite 5, Tailwind 3.
- Routes: `#/`, `#/research`, `#/projects`, `#/garden`.
- Content authority claimed by docs: `data.json`.
- Actual site input: generated `data.ts`, imported by `constants.tsx`.
- Long-form content: Markdown in root `posts/`, fetched at runtime.
- Assets: PDFs in `public/uploads/`.
- Current CMS: `cms.py`, a 1,240-line Tkinter application.
- Deployment: GitHub Actions builds `dist` and deploys a Pages artifact.
- Future CMS design: `docs/superpowers/specs/2026-04-19-portfolio-cms-design.md`.

## Findings

### P0: Production Markdown Details Render the App HTML

Evidence:

- `data.ts:189` and `data.ts:211` reference `posts/brachistochrone.md`.
- `pages/Projects.tsx:16-30` and `pages/Garden.tsx:16-30` fetch that string.
- The file exists at `posts/brachistochrone.md`, outside `public/`.
- The production build contains PDFs but no `dist/posts/` directory.
- `GET /posts/brachistochrone.md` on the Vite production preview returns the
  795-byte `text/html` app shell with status 200.
- Opening the Brachistochrone project in the production preview prints
  `<!DOCTYPE html> ... <div id="root"></div> ...` as the article body.

This affects both the Projects detail and the Garden post. It is not visible in
the development server because Vite serves root source files during development.

### P0: The Current CMS Does Not Start on This Machine

`python cms.py` fails immediately:

```text
ModuleNotFoundError: No module named '_tkinter'
```

The file parses successfully as Python, but the documented runtime dependency is
not available in the installed Homebrew Python 3.14. The README has no setup or
diagnostic guidance for Tk.

### P1: Broken Home CV Button

`pages/Home.tsx:116-122` hard-codes `/cv.pdf`. The file does not exist; the
actual asset is `public/uploads/Harry CV.pdf`, already used by the sidebar through
`data.ts:96-98`.

On the development server, the failure is especially deceptive: Vite returns the
SPA shell for `/cv.pdf`, so the URL changes while the Home page appears again. On
GitHub Pages the path is expected to fail directly.

### P1: Detail Views Are Not Routes

Research, Project, and Garden details live only in component state. Consequences:

- a detail cannot be bookmarked, shared, or indexed;
- refreshing loses the selected item;
- browser Back leaves the entire section rather than returning to its list;
- browser Forward cannot restore the detail;
- Home's featured item links only to the Research list, not the featured paper.

This was reproduced by opening the second Garden post and pressing browser Back;
the browser returned to Projects, not the Garden list.

### P1: Tablet and Narrow-Desktop Card Typography Breaks

In Chrome's normal 918px window:

- Projects shows three narrow columns; `Optimization` is visibly clipped in the
  first two headings.
- Garden shows two columns; `Brachistochrone` extends into the second title, so
  the headings visually collide.

The small 320px and 390px mobile layouts use one column and are substantially
better. The issue is the combination of fixed 320px sidebar, large page padding,
multi-column breakpoints, large serif titles, and no long-word fallback.

### P1: Keyboard and Focus Accessibility

- Project cards are clickable `div` elements without `role`, `tabIndex`, or
  Enter/Space handling (`pages/Projects.tsx:94-149`).
- Garden cards have the same problem (`pages/Garden.tsx:104-127`).
- The mobile menu button has no accessible name, `aria-expanded`, or
  `aria-controls` (`components/Sidebar.tsx:20-26`).
- The email icon link has no accessible name (`components/Sidebar.tsx:116-118`).
- The off-canvas mobile menu does not manage focus, Escape, or inert background
  content.
- Loading indicators and clipboard feedback are not announced.
- The Markdown renderer treats inline code as block code because it depends on
  the removed React Markdown `inline` prop.

### P1: Mobile Menu Scrolls the Hidden Page

At 390x844, opening the mobile menu and scrolling changed `window.scrollY` from
0 to 533 while `body` and `html` overflow remained `visible`. Closing the menu
revealed the Home page at the new scroll position. The overlay needs background
scroll locking and focus management.

### P1: CMS Writes Are Unsafe and Ambiguous

- Paths derive from the process working directory, not `cms.py`'s location.
- `data.json` and `data.ts` are written separately and non-atomically.
- A failed second write can leave the editable source and deployed input out of
  sync.
- Creating a post writes Markdown before the catalog entry is saved, so a crash
  or close can leave an orphan file.
- Uploads and posts can silently overwrite same-name files.
- IDs are random four-digit values without collision checks.
- Dates, URLs, asset paths, required fields, Tailwind classes, and entity
  references are not schema-validated.
- Deleting content can leave dangling featured references and unused assets.
- No dirty state, undo, discard, autosave, snapshots, or exit warning exists.
- Navigation, ordering, asset usage, and existing Markdown editing have incomplete
  CRUD coverage.

### P1: Content Credibility and Privacy Review Is Needed

- Public copy contains `natrual` and `heckathon` typos.
- The role `Undergrad`, 2025 recent items, and paper status may now be stale.
- The second Garden post opens to only `Content coming soon...`.
- The public manuscript contains an `ACKNOWLEDGMENTS` section whose content is
  literally `Placeholder`.
- The CV publicly exposes a phone number, city/location, GPA, academic timeline,
  and other personal history in addition to the public email. This may be
  intentional, but it should be an explicit privacy decision.
- Manuscript and note PDFs should be reviewed for collaborator approval, comments,
  draft marks, hidden metadata, and accessibility.

### P2: Missing 404 Experience

Unknown hash routes render an empty main area beside the persistent navigation.
There is no catch-all route or recovery link (`App.tsx:34-39`).

### P2: SEO and Document Metadata Are Nearly Absent

`index.html` has a title and viewport only. It lacks a description, canonical,
Open Graph/Twitter metadata, favicon, structured data, sitemap, and robots file.
Only Home updates `document.title`; all other routes and details retain the same
generic title.

`metadata.json` is not connected to page metadata and is stale: it identifies a
different surname and a robotics focus. Naming also varies among `G.Z. Luo`,
`G. Z. Luo`, `Harry Luo | Researcher`, and the full profile name.

### P2: CMS Replacement Spec Needs Re-Scoping

The April design correctly identifies draft/publish/rollback needs, but it is not
implementation-ready:

- publish order and failure rollback are underspecified;
- worktree dirtiness and commit allowlisting are unspecified;
- "localhost reachable" is too weak; the production build must pass and smoke
  expected routes/assets/content;
- the proposed generic section catalog, normalized manifest, adapter, two preview
  systems, snapshots, git, and importer may be too large for four fixed pages;
- exact in-studio renderer reuse implies a major site refactor not costed by the
  spec;
- asset/Markdown URL semantics, schema versions, migrations, ID rules, deletion,
  and draft-vs-published Git authority are unresolved;
- loopback binding, path controls, locking, overwrite behavior, and crash recovery
  are missing from the local-server threat model.

A smaller first release may be better: typed content forms, asset/Markdown
management, homepage placement, production build/preview, transactional publish,
and snapshots. Generic page composition can wait until concrete layout needs are
known.

### P2: Build, CI, and Documentation Gaps

- No tests, lint script, dedicated typecheck, schema validation, generated-data
  drift check, broken-asset check, or post-build crawler exists.
- CI runs only install and build.
- The production JS bundle is about 595 kB minified (183 kB gzip), triggering
  Vite's chunk-size warning.
- Workflow permissions grant Pages write and OIDC token access at workflow scope,
  including the build job; action tags use mutable major versions.
- KaTeX JS and CDN CSS versions differ.
- README describes the wrong Pages source mode for the actual Actions deployment.
- `AGENT.md` says React 19 and Tailwind CDN, while the code uses React 18 and a
  PostCSS/Tailwind build.

## Interaction Crawl

Tested in actual Chrome through Computer Use:

- Home, Research, Projects, Garden navigation.
- Home Download CV failure.
- Sidebar CV success and both pages of the PDF.
- Both research PDFs.
- Brachistochrone project detail, rendered math, Back button, and repository link.
- Both project repository links; both public GitHub repositories resolve.
- Both Garden posts and their Back buttons.
- Browser Back from a state-only post detail.
- GitHub profile link; it resolves.
- LinkedIn profile link; it reaches LinkedIn's auth wall.
- Mobile menu open/close, route selection, and background scroll behavior.
- 390x844 and 320x568 mobile layouts.

Tested in the in-app browser and production preview:

- DOM/accessibility inventories for every route.
- Unknown route behavior.
- Production Brachistochrone fetch/render failure.
- Console errors/warnings on the tested production detail: none; the missing
  Markdown is incorrectly returned as successful HTML, so normal error handling
  never runs.

Not invoked:

- The `mailto:` link, to avoid opening a draft in the local mail client. Its href
  was verified.
- CMS editing actions, because the CMS cannot launch with the documented Python
  runtime and this investigation was intentionally non-mutating.

## Verification Results

- TypeScript check: passed.
- Production Vite build: passed.
- Build output: app assets and three PDFs only; no Markdown posts.
- Dev server: `http://127.0.0.1:8080/`.
- Production preview used for investigation: `http://127.0.0.1:4173/`.
- `data.json` and `data.ts`: semantically synchronized at time of investigation.
- `cms.py`: Python syntax valid; runtime launch fails on missing `_tkinter`.

## Decisions Needed Before Fixing

1. Decide whether Markdown is compiled into the app, copied into `public`, or
   served from a generated content manifest.
2. Decide whether content details become real routes and what their stable slug
   contract is.
3. Decide what personal/CV/manuscript information should remain public.
4. Define one canonical content authority and make generated artifacts disposable.
5. Define an atomic draft/publish/rollback transaction and dirty-worktree policy.
6. Define schemas, migrations, IDs, references, ordering, deletion, and asset
   collision/usage rules.
7. Re-scope CMS v1 around demonstrated editing needs before building a generic
   page-composition system.
8. Establish acceptance baselines for desktop, tablet, and mobile before changing
   the visual system.

## Suggested Repair Order for a Later Session

1. Fix production Markdown delivery and the Home CV URL.
2. Add stable detail routes, 404 handling, and per-route titles.
3. Fix tablet card/title sizing and mobile menu behavior.
4. Repair keyboard semantics and focus management.
5. Add schema/asset/build smoke checks to CI.
6. Correct stale public copy and complete the privacy/content review.
7. Finalize a smaller, transactional CMS contract before implementation.
