# Graduate Profile Content Refresh - Worker Contract

## Goal

Refresh the public site from an undergraduate profile to the user's current PhD profile while preserving the existing site structure and visual template. The sole approved engineering exception is an optional research permalink action.

## Allowed Changes

- Canonical content: `content/site.json`.
- Public files: replace `public/uploads/Harry CV.pdf`; add the latest thesis and GKP paper PDFs under clear stable filenames.
- Minimal permalink support only: schema, validation as already provided by the schema, Research rendering, Studio research editor, and existing verification expectations if needed.
- This contract and the evaluator sheet may be updated with brief implementation notes.

## Required Content

- Profile: role `PhD Student`; affiliation `University of Minnesota Twin Cities`; UMN email from the revised CV.
- Hero subheadline: `PhD student in Electrical Engineering at the University of Minnesota, working in computational condensed matter physics.`
- Research description: `My research spans computational condensed matter physics, quantum information science, and numerical methods for quantum systems.`
- Show two research records in this order: 2026 honors thesis, then GKP paper. Hide the NJU record; delete nothing.
- Thesis title/author/venue/year/description follow the approved brief. Attach the latest `Thesis_GZLuo.pdf`; permalink `http://digital.library.wisc.edu/1793/97588`.
- GKP title/authors/year/description follow the approved brief. Venue/status must identify `arXiv:2512.03583` and submission to `npj Quantum Information`. Attach the latest `main.pdf`; permalink `https://arxiv.org/abs/2512.03583`.
- Recent items, in order: PhD study at UMN; Wisconsin Quantum Institute Research Excellence Award; APS Global Physics Summit. Use dates supported by the revised CV and the approved descriptions.
- Projects all remain visible and ordered: solar car, crosstalk, dining, brachistochrone, deep-time.
- Hide both Garden posts; delete nothing.
- Projects description: `Selected computational and scientific projects.`
- Garden description: `Notes, derivations, and technical writing.`
- Replace the public CV with `/Users/harry/Harry CV.pdf`.
- Correct stale `Undergrad`/UW-Madison identity and the known `natrual`/`heckathon` copy errors wherever the edited canonical content exposes them.

Approved research descriptions:

- Thesis: `An introduction to Gottesman-Kitaev-Preskill codes, from their ideal phase-space construction to finite-energy implementations in bosonic systems. The thesis studies GKP states under pure photon loss and develops energy-scaled zero-noise extrapolation as a mitigation strategy.`
- Paper: `Introduces energy-scaled zero-noise extrapolation for finite-energy GKP codes. Numerical simulations under pure photon loss show how mean photon number can serve as an intrinsic noise-scaling parameter for recovering near-ideal logical observables.`

## Permalink Contract

- Add one optional HTTP(S) URL field named `permalinkUrl` to research records.
- When present, render an external `Permalink` action alongside the existing PDF/Code/BibTeX actions on both research list and detail views.
- Add the optional field to the existing Studio research editor.
- Reuse existing action styling and a Lucide icon. Do not redesign or restructure the page.

## Constraints

- No navigation, layout, CSS, interaction, dependency, article Markdown, legacy, Git, or unrelated refactor changes.
- Do not add a year-section system, migration, compatibility adapter, new test framework, or extra schema abstraction.
- Preserve hidden records and unrelated user work.
- Run `npm run verify` after all changes.

## Worker Handoff

Record changed files, verification result, and any narrowly relevant caveat at the bottom of this file.

- Changed `content/site.json`, `src/content/schema.ts`, `src/pages/Research.tsx`, `src/studio/components/StructuredEditors.tsx`, and `scripts/artifact-smoke.mjs`; replaced `public/uploads/Harry CV.pdf`; added `public/uploads/Thesis_GZLuo.pdf` and `public/uploads/GKP_paper.pdf`.
- Verification passed all four stages (`content`, `typecheck`, `build`, and `artifacts`) by running the repository's `scripts/verify.mjs` directly with the bundled Node runtime. The shell has no `npm` executable, so the equivalent script entrypoint was used rather than the literal `npm run verify` wrapper.
- `git diff --check` passes for text files. The all-file form reports whitespace inside the revised binary CV PDF, which is a Git binary-diff false positive; source/upload SHA-256 checksums match for all three PDFs.
