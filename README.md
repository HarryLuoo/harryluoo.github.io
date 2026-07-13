# Personal Academic Portfolio

React 18 and Vite 5 power the public portfolio. A local browser-based Studio
edits the site's canonical content without making layout or code changes.

## Setup

Use Node.js 20 and npm from the repository root:

```bash
npm install
```

## Run Modes

### GitHub authentication on a new computer

Studio pushes are intentionally noninteractive. Install the
[GitHub CLI](https://cli.github.com/), then authenticate once:

```bash
gh auth login --hostname github.com --git-protocol https --web
npm run auth:github
```

Run `npm run auth:github` once in every fresh clone before publishing from
Studio. It stores no token in the repository. It installs only a
`github.com`-scoped credential-helper entry in that clone's `.git/config`,
pointing to the authenticated `gh` executable and its secure credential store.

Ordinary `gh auth setup-git` configures global Git state, which Studio
deliberately ignores. The repository command creates the narrower clone-local
bridge that Studio can use while global/system Git configuration and terminal
prompts remain disabled.

### Public development

```bash
npm start
```

This starts the ordinary Vite development site on port `8080`. Studio is not
available in this mode, and `/studio.html` returns 404.

### Local Studio

```bash
npm run studio
```

Open `http://127.0.0.1:8080/studio.html`. The launcher supervises both the
Studio-enabled Vite server on `127.0.0.1:8080` and its local API on
`127.0.0.1:8787`. If either child exits, the launcher stops the other one.

The Studio iframe is the real public renderer, but it shows saved disk state,
not unsaved form state.

### Production verification and preview

```bash
npm run verify
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

`npm run verify` validates content and references, typechecks, builds `dist`
once, and smoke-checks those production artifacts. For production evidence,
start the preview immediately afterward without rebuilding or changing `dist`.

## Source Boundaries

The only canonical content paths are:

```text
content/site.json
content/articles/**
public/uploads/**
```

- `content/site.json` owns structured copy, SEO, navigation, visibility,
  ordering, tags, links, entity metadata, and article/upload references.
- `content/articles/<slug>.md` owns each Markdown body once. Multiple entities
  may reference the same stable article slug.
- `public/uploads/` owns public PDFs and images.
- `src/content/schema.ts` and `src/content/validate.server.ts` define and check
  the allowed content shape and references.
- `src/pages/`, `src/components/`, `index.css`, and configuration own layout,
  interaction, and presentation. Studio cannot edit them.

Public routes use `HashRouter`:

```text
#/
#/about
#/research
#/research/:slug
#/projects
#/projects/:slug
#/garden
#/garden/:slug
```

Unknown routes and missing entities render code-owned recovery states.

## Editing In Studio

The Studio has Shell, Home, About, Research, Projects, Garden, Articles,
Uploads, SEO, and Verify/Publish areas. Structured saves validate the complete
candidate. Article and upload operations affect one file at a time.

Every mutation:

- requires the exact local Studio Origin;
- accepts a bounded, purpose-specific JSON shape;
- checks a SHA-256 revision before writing;
- runs through one serialized mutation queue;
- atomically replaces a single file where replacement is needed.

If a file changed on disk after Studio loaded it, the API returns a conflict
instead of overwriting the newer version. Reload the Studio snapshot, review
the external change, and reapply only the intended edit. Referenced articles
and uploads cannot be deleted until their usage is removed.

Saving creates a working-tree draft. It does not commit, push, or deploy.

## Verify And Publish

Use Studio publishing only for content-only changes inside the three canonical
paths. The safe sequence is:

1. Save the intended content edits.
2. Open Verify/Publish and review the CMS path list, upload summary, and complete
   text diff.
3. Run Verify.
4. Confirm the complete displayed CMS diff and enter a commit message.
5. Publish.

A grey Publish button is deliberate. It remains keyboard-focusable through
`aria-disabled`; hover it or focus it to open the **Before publishing**
checklist. Publish becomes actionable only when all of these are true:

- no Verify/Publish operation is running;
- no committed push is waiting for Retry Push;
- verification is fresh for the displayed repository fingerprint;
- Publish readiness lists no unrelated, staged, ignored-CMS, Git identity, or
  other blocking state;
- at least one CMS-owned file changed;
- the displayed text diff is complete, not truncated;
- the review checkbox is checked;
- the commit message is non-empty.

Publish rechecks all conditions server-side. It stages only
`content/site.json`, `content/articles/**`, and `public/uploads/**`, proves the
staged blobs match the verified bytes, creates one commit, and pushes the
branch's already configured upstream destination. It cannot publish code,
dependencies, configuration, tests, documentation, or retirement deletions.

If commit succeeds but push fails, use **Retry Push**. Retry sends the exact
pending commit and does not stage or commit again. Do not start a second
Publish. `Pushed` means Git accepted the push; it does not mean the site is
deployed.

## Change Workflows

For content-only work:

1. Run `npm run studio`.
2. Save and inspect the CMS-only diff.
3. Verify and Publish from Studio.
4. Check the GitHub Pages workflow separately for deployment.

For code, styling, dependencies, configuration, tests, docs, or mixed changes:

1. Edit and review them outside Studio.
2. Run `npm run verify`.
3. Preview the unchanged verified `dist` when visual inspection is needed.
4. Commit and push through the normal reviewed Git workflow.

Do not use Studio to work around an unrelated or pre-staged change. Its refusal
to Publish is a scope boundary, not an error to bypass.

## Troubleshooting

- **Studio will not start:** ports `8080` and `8787` are fixed and strict in
  Studio mode. Stop the process using either port, then start the launcher
  again.
- **A save reports a revision conflict:** reload Studio, inspect the newer disk
  state, and reapply the edit. Do not force an overwrite.
- **Publish is grey:** hover or focus it and follow the displayed checklist.
  Refresh Publish readiness after resolving repository state, then run Verify
  again if verification is missing or stale.
- **Verify became stale after a save or Git change:** this is expected because
  verification is tied to HEAD, upstream identity, CMS bytes, worktree/index
  state, and ignored CMS paths. Run Verify again after the repository settles.
- **A push is pending:** leave the repository and upstream binding unchanged
  and use Retry Push. If authentication is missing, run `gh auth login` and
  `npm run auth:github` in a terminal, then retry the same pending commit. If
  HEAD, the worktree/index, or upstream changed, stop and review the Git state
  outside Studio.
- **GitHub CLI is missing or logged out:** install `gh`, run the two setup
  commands above, and restart Studio if the helper executable moved. The setup
  command fails without changing Git configuration when login is invalid.
- **Studio restarted after a failed committed push:** pending-push state lives
  only in the Studio API process. Inspect HEAD and its upstream and finish the
  existing commit through normal reviewed Git; do not click Publish again to
  manufacture a second commit.
- **The preview looks old:** run `npm run verify` again, then restart the exact
  production preview command. Do not treat the Studio iframe as production
  evidence.
- **Push succeeded but the site is unchanged:** inspect the GitHub Actions Pages
  deployment. Studio reports `Pushed`, never `Deployed`.

## CI And Deployment

Pushes to `main` and manual workflow dispatches run
`.github/workflows/deploy.yml`. CI uses Node 20, runs `npm ci`, executes the same
`npm run verify`, uploads that command's `dist`, and deploys the artifact with
GitHub Pages. There is no second production build in the deployment job.

## Pre-Retirement Status

The reconstructed renderer is active through `index.tsx -> src/App.tsx`.
Legacy root `App.tsx`, `constants.tsx`, `types.ts`, `data.ts`, `data.json`,
`cms.py`, `metadata.json`, `components/`, `pages/`, and `posts/` remain only as
temporary rollback material. Do not update them as a second content source and
do not delete them without explicit user-approved retirement.

Before retirement, the emergency renderer rollback is the single `index.tsx`
import change from `./src/App` to root `./App`, and it serves the older legacy
snapshot rather than newer Studio content. Verify and preview before any push.

After a reviewed retirement commit, rollback through normal history:

```bash
git revert <reviewed-cutover-commit>
```

Review the revert, run `npm run verify`, and inspect the production preview
before pushing. Do not reconstruct or restore only part of the retired tree.
