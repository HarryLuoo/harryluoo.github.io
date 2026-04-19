# Portfolio CMS Design

Date: 2026-04-19
Repo: `c:\Users\luoog\Documents\harryluoo.github.io`
Status: Approved for specification, not yet implemented

## 1. Summary

This document defines a replacement CMS architecture for the portfolio website.

The current site has a strong visual language that should be preserved. The current CMS is functionally limited because it edits a mostly flat data model and has no real notion of draft state, visual layout management, publish verification, or rollback.

The replacement CMS should be:

- local-only
- script-backed
- safe to publish from
- modular and reproducible
- designed first for this site, but with clean seams that could later support productization

The design target is a local web studio that acts like a publishing desk. The visual system remains code-owned in the React site, while editable content, section composition, layout choices, and publishing metadata become CMS-managed.

## 2. Goals

- Preserve the existing visual language of the website.
- Preserve the current frontpage information and migrate it deliberately.
- Replace the current Python `tkinter` CMS with a local web-based studio.
- Make all appropriate content visually editable through the CMS.
- Make layout management visual, but controlled.
- Keep posts as Markdown files that can be edited externally.
- Allow basic Markdown editing and preview inside the CMS for quick updates.
- Support draft-first editing with explicit publish actions.
- Create rollback snapshots on publish.
- Support both local publish and publish-and-push workflows.
- Verify the generated site by starting localhost preview immediately after publish.
- Keep the architecture modular so it is reproducible and extensible later.

## 3. Non-Goals

- Building a multi-tenant or reusable CMS product in phase 1
- Supporting arbitrary freeform page building
- Supporting collaborative editing
- Adding a rich text editor beyond basic Markdown support
- Generalizing theme systems or multi-site support
- Keeping backward compatibility with the current internal file structure
- Continuing to extend `cms.py`

## 4. Current System

The current architecture is:

- `cms.py` edits `data.json`
- save regenerates `data.ts`
- React pages import compiled constants from `data.ts`
- visual layout lives in code, especially `pages/Home.tsx`, `pages/Research.tsx`, `pages/Projects.tsx`, `pages/Garden.tsx`, and `components/Sidebar.tsx`

This architecture works for flat records but fails for:

- visual layout management
- draft vs published state
- rollback
- repeatable publish verification
- page/shell-aware editing
- modular content ownership

## 5. Design Decisions

### 5.1 Editing Model

The CMS will use a page-centric local web studio.

Why:

- It is the most intuitive model for the user.
- It allows direct visual management of what visitors will see.
- It supports shell and page editing without turning into a page builder.

### 5.2 Layout Model

The CMS will use a curated section catalog.

Each page or shell surface can:

- add approved section types
- remove approved section types
- reorder section instances
- hide/show section instances
- configure section props

Each page or shell surface cannot:

- invent arbitrary new layout primitives from the CMS
- bypass code-owned visual rules

Why:

- This preserves the visual language in code.
- It gives enough flexibility for evolution.
- It avoids the maintenance cost of a freeform builder.

### 5.3 Content Ownership Boundary

The final boundary is:

- code-owned: rendering, visual language, routes, section renderers
- CMS-owned: draft content, entities, shell config, page section composition, placements, post metadata, publish actions

### 5.4 Post Workflow

Posts remain real Markdown files.

Primary workflow:

- edit Markdown externally
- use CMS to preview, lightly edit, tag, place, pin, and publish posts

Why:

- This matches the user's authoring preference.
- It avoids forcing document editing into the CMS.
- It preserves portability of written content.

### 5.5 Safety Model

The CMS will be draft-first with snapshots.

Publishing is explicit and comes in two forms:

- `Publish Local`
- `Publish and Push`

Both publish flows create snapshots before advancing the repo state.

### 5.6 Publish Verification

After local publish, the CMS must immediately attempt to host the newly generated site on localhost and verify that it is reachable.

Why:

- errors are caught quickly
- preview is warm immediately after publish
- browser preview has minimal wait time

If localhost boot fails, publish is considered failed and commit/push must not proceed.

## 6. Editable Taxonomy

The editable system is organized into these categories.

### 6.1 Documents

- Markdown posts in `content/draft/posts/*.md`

### 6.2 Entities

- papers
- projects
- homepage updates
- link records
- future reusable content records

### 6.3 Shell

- sidebar identity
- navigation
- social links
- footer
- document links such as CV

### 6.4 Pages

- Home
- Research
- Projects
- Garden

Each page is an ordered list of section instances.

### 6.5 Sections

Phase-1 catalog:

- hero
- recentUpdates
- featuredItem
- introText
- paperList
- projectGrid
- postFeed
- teaserCard
- linkList
- profileBlock
- navigationBlock
- socialLinksBlock

### 6.6 Surfaces

These are editorial placements or displays that determine where content appears:

- homepage featured
- homepage recent
- pinned updates
- page-specific teasers

### 6.7 Assets and Links

- uploads
- PDFs
- image references
- external links

## 7. Proposed File Structure

```text
/
|- cms/
|  |- app/
|  |- server/
|  |  |- index.ts
|  |  |- storage/
|  |  |- schema/
|  |  |- preview/
|  |  |- compiler/
|  |  |- snapshot/
|  |  `- git/
|  |- schemas/
|  `- section-catalog/
|
|- content/
|  |- draft/
|  |  |- surfaces/
|  |  |  |- pages/
|  |  |  |  |- home.json
|  |  |  |  |- research.json
|  |  |  |  |- projects.json
|  |  |  |  `- garden.json
|  |  |  `- shell/
|  |  |     |- sidebar.json
|  |  |     `- footer.json
|  |  |- entities/
|  |  |  |- papers/
|  |  |  |- projects/
|  |  |  |- updates/
|  |  |  `- links/
|  |  |- posts/
|  |  |- post-meta/
|  |  |- taxonomy/
|  |  `- assets/
|  |
|  `- published-manifest.json
|
|- generated/
|  `- site-content.json
|
`- snapshots/
   `- <timestamp>/
      |- draft/
      |- published-manifest.json
      |- site-content.json
      `- meta.json
```

## 8. Data Model Principles

### 8.1 Draft Storage

`content/draft/` is the editable source of truth.

It should be:

- modular
- human-inspectable
- schema-validated
- safe to write from the CMS

### 8.2 Posts and Post Metadata

Post body and post metadata are intentionally separated.

- body: `content/draft/posts/<slug>.md`
- metadata: `content/draft/post-meta/<slug>.json`

Why:

- the user only wants to edit Markdown directly
- CMS metadata should not force frontmatter editing
- placement and publishing metadata can evolve independently of the document body

### 8.3 Published Manifest

`content/published-manifest.json` is the normalized published site state.

It is the productizable seam between the CMS core and the site-specific compiler target.

### 8.4 Site Adapter Output

`generated/site-content.json` is the current website's compiled adapter output.

The current site will render from this generated output instead of the current `data.ts` pattern after migration.

## 9. Conceptual Surface Model

Example page surface:

```json
{
  "id": "home",
  "title": "Home",
  "sections": [
    {
      "id": "hero-main",
      "type": "hero",
      "visible": true,
      "variant": "homeHero",
      "props": {
        "headlineSource": "entity:profile.main",
        "subheadlineSource": "entity:profile.tagline"
      }
    },
    {
      "id": "featured-primary",
      "type": "featuredItem",
      "visible": true,
      "props": {
        "sourceType": "paper",
        "sourceId": "p1"
      }
    }
  ]
}
```

Important rule:

- sections are instances of approved types
- section types are defined in the section catalog
- page data chooses composition, ordering, visibility, and configuration
- code chooses appearance and rendering behavior

## 10. Studio UX

The CMS studio will be a local web app.

Primary surfaces:

- page/shell navigator
- page-centric visual editor
- section catalog picker
- block settings inspector
- entity management views
- post metadata management
- basic Markdown editor and preview for quick edits
- publish controls
- snapshot/restore controls

Expected editing behavior:

- open a page or shell surface
- see its section composition visually
- add/remove/reorder approved sections
- configure block settings through forms
- preview the result immediately

## 11. Preview Model

Preview has two layers.

### 11.1 In-Studio Preview

A fast preview panel inside the CMS renders draft content using the real section renderers and the current visual language.

Purpose:

- immediate editing feedback
- no context switching for simple layout edits

### 11.2 Browser Preview

The CMS must support an `Open Preview` action.

Behavior:

- start the real site preview server if it is not already running
- or reuse the running server
- wait until localhost is reachable
- open the system default browser to the real localhost URL

This preview must use the actual site code and generated content, not a separate fake renderer.

## 12. Publish Lifecycle

### 12.1 Publish Local

`Publish Local` does:

1. persist current draft changes
2. validate all relevant schemas
3. compile `content/draft/` to `content/published-manifest.json`
4. generate `generated/site-content.json`
5. create a timestamped snapshot
6. start or restart the localhost preview server against the new generated output
7. wait until localhost is reachable
8. if successful, create a local git commit
9. keep preview warm for later browser opening

If localhost preview does not start correctly, publish fails and the commit must not happen.

### 12.2 Publish and Push

`Publish and Push` does everything in `Publish Local`, then pushes to GitHub only after localhost verification succeeds.

### 12.3 Restore

Restore should:

- select a snapshot
- restore draft and generated outputs
- surface what was restored
- allow previewing the restored state

## 13. Snapshots

Snapshots must be deterministic and local.

Each snapshot stores:

- draft files
- published manifest
- generated site output
- metadata such as timestamp and action type

At minimum, `meta.json` should record:

- timestamp
- action
- commit hash if available
- preview URL if available

## 14. Git Integration

Git integration is part of the CMS backend.

Required actions:

- detect repo status
- create local commit after verified local publish
- optionally push after verified publish

Important constraints:

- commit should happen only after localhost verification succeeds
- push should happen only after commit succeeds
- errors must be visible in the CMS

## 15. Backend Entry Points

The backend should have a single local entrypoint with multiple actions.

Conceptual examples:

```text
node cms/server/index.ts studio
node cms/server/index.ts publish
node cms/server/index.ts publish --push
node cms/server/index.ts preview
node cms/server/index.ts restore <snapshot-id>
```

This keeps one backend architecture with separable modules.

## 16. Migration Strategy

Migration should preserve the frontpage and shell carefully but treat most other current textual content as provisional.

### 16.1 Preserve Carefully

- current frontpage information
- current visual language
- sidebar identity and shell behavior
- navigation
- socials
- document links such as CV
- existing valid Markdown posts

### 16.2 Migrate Structurally, Not Canonically

Research, projects, and garden records currently contain text that was generated or adapted from CV material and still needs heavy editing.

These should be migrated as:

- structured entities
- editable records
- easy-to-rewrite content

They should not be treated as final canonical copy.

### 16.3 One-Time Import

Phase 1 should include an importer from the current `data.json` and frontpage structure into the new draft layout.

The importer should:

- preserve frontpage hero and homepage placements
- extract shell/sidebar content
- migrate current papers/projects/posts into entity and metadata records
- preserve existing file references where useful

## 17. Phase-1 Scope

Phase 1 should build the minimum complete system for this repo.

### 17.1 In Scope

- local web studio shell
- modular draft storage
- section catalog for this site
- page-centric editor
- in-studio preview
- real localhost preview manager
- publish and push pipeline
- snapshots and restore
- one-time importer from current data model
- replacement of the current CMS workflow

### 17.2 Out of Scope

- reusable commercial/general product design
- multi-site support
- arbitrary page builder
- shared global section instances across pages
- collaborative editing
- advanced asset pipeline beyond uploads and references
- rich text editing beyond Markdown support

## 18. Recommended Implementation Order

1. define schemas and draft file layout
2. build importer from current data model
3. build compiler to generated site output
4. build localhost preview manager
5. build snapshot and git pipeline
6. build page-centric studio UI
7. switch site consumption from old data path to generated output
8. retire `cms.py` after parity is reached

## 19. Risks and Controls

### 19.1 Risk: CMS becomes a page builder

Control:

- keep section catalog curated
- keep rendering code-owned
- restrict arbitrary layout freedom

### 19.2 Risk: publish writes broken output

Control:

- validate schemas before compile
- verify localhost preview before commit/push
- create snapshots before advancing repo state

### 19.3 Risk: content model becomes site-specific and brittle

Control:

- keep `published-manifest.json` normalized
- keep compiler target separate from CMS draft model
- keep section catalog and schemas modular

### 19.4 Risk: migration preserves too much bad copy

Control:

- preserve frontpage carefully
- treat other textual records as provisional and easy to rewrite

## 20. Final Recommendation

Build a local web-based publishing desk CMS that:

- uses modular draft files
- keeps posts as Markdown
- manages all non-post editing visually
- composes pages from a curated section catalog
- preserves the site's visual language in code
- publishes through a verified localhost-first pipeline
- snapshots before commit/push
- keeps clean architectural seams for future productization

This design is approved for specification and ready for implementation planning in a later session.
