# About Page Implementation Spec

**Status:** Approved for implementation on 2026-07-13.

## Goal

Add a restrained first-class About page to the current site and Studio. The
page should help a visitor place Harry quickly without reproducing the CV or
turning the site into a personal-branding exercise.

Preserve the current modular architecture. Reuse the established route, page,
content, upload, Studio control, validation, metadata, and artifact-checking
patterns. Do not add a generic page builder or refactor unrelated pages.

## Public Experience

- Add the internal route `/about` and navigation item `ABOUT` immediately after
  `HOME`.
- Keep `CV` as a separate external document link.
- Do not add an About teaser or promotional card to Home.
- Match the unframed list-page treatment used by Research and Garden: cream
  background, established page-title scale, short orange rule, and restrained
  spacing.
- Render exactly two fixed content sections: `BACKGROUND` and `CURRENT WORK`.
  Their labels are small monospace text, not display headings.
- End with quiet CV and email links sourced from the existing shell fields.
- Reuse `useDocumentMeta` for title, description, and canonical route.

## About Copy

Use two plain-text fields in canonical structured content. Do not use an
article Markdown file for this short page.

### Background

> I will begin a Ph.D. in Electrical Engineering at the University of Minnesota Twin Cities in August 2026, working with Tony Low in computational condensed matter. I completed my undergraduate studies at the University of Wisconsin-Madison through the Applied Mathematics, Engineering and Physics program, with additional training in mathematics and physics. My research there focused on quantum information science, including open-system simulation and quantum error mitigation for bosonic codes.

### Current Work

> I am currently finishing work on finite-energy Gottesman-Kitaev-Preskill codes under photon-loss noise. The project asks whether code energy can serve as a controlled scaling parameter for zero-noise extrapolation and how recovery and decoding affect the resulting logical observables. During this work, I have been interested in the connection between physical noise models, encoded states, and quantities that can be recovered numerically. As I move into condensed matter, I am beginning to study how band geometry and symmetry shape measurable responses in quantum materials. These directions remain exploratory and will narrow as my doctoral project develops.

The combined About body should stay near 150-250 words. The Studio may show a
soft word-count warning, but content validation should not fail solely because
of a word-count change.

## Margin Figures

Each section supports zero to two optional figures. Launch with no figures; do
not invent or generate assets for this change.

Each figure owns only:

- an existing PNG, JPEG, or WebP upload reference;
- required non-empty alternative text;
- an optional caption;
- array order within its section.

The renderer owns all presentation. Content must not contain side, width,
crop, coordinates, CSS classes, or other layout instructions.

Desktop behavior:

- Use a text column and a narrow right margin rail for each section.
- Align the rail with the top of its section.
- Stack two figures vertically.
- Preserve complete scientific images with `object-fit: contain`.
- Use no grayscale conversion, hover animation, card treatment, or shadow.

Mobile behavior:

- Collapse to one column.
- Place figures directly after their associated section text.
- Keep each caption attached to its figure and preserve image legibility.

When a section has no figures, it must not reserve an empty rail or leave the
text visibly off-center.

## Canonical Model

Add a strict `about` object to `SiteContent`:

```ts
about: {
  background: {
    text: string;
    figures: AboutFigure[]; // max 2
  };
  currentWork: {
    text: string;
    figures: AboutFigure[]; // max 2
  };
}

type AboutFigure = {
  upload: UploadPath;
  alt: string;
  caption?: string;
};
```

Use the existing safe upload-path schema. Add About figure references to every
existing upload-reference and usage collector so missing files and deletion of
in-use files remain fail-closed.

## Studio Experience

- Add an `About` structured area immediately after `Home`.
- Reuse the existing textarea, asset selector, ordering, removal, save,
  revision, preview, and upload infrastructure.
- Show Background and Current Work textareas.
- Show a combined word count and a soft warning outside 150-250 words.
- For each section, allow adding, ordering, and removing at most two figures.
- Filter figure selectors to supported image uploads, excluding PDFs.
- Require alt text and allow an optional caption.
- Do not expose layout controls.

## Temporal Consistency

The appointment begins in August 2026. During this implementation, make the
smallest required corrections so Home, shell profile, SEO description, recent
entry, and About consistently describe Harry as incoming rather than already
having begun the Ph.D. After the appointment begins, those canonical fields can
be updated together as a later content-only change.

## Verification And Acceptance

- Extend existing validation and artifact expectations for About and its
  referenced uploads; do not weaken current checks.
- Run `npm run verify` after the complete change.
- Preview the unchanged verified `dist` with the strict command documented in
  `README.md`.
- Inspect desktop and mobile screenshots, including About with no figures and
  a temporary or test-state exercise of one and two figure layouts without
  committing invented content.
- Confirm keyboard navigation, active sidebar state, CV/email targets, image
  alternatives, captions, overflow, and missing-route behavior.

## Non-Goals

- No generic page or block builder.
- No Markdown About article.
- No arbitrary figure layout controls.
- No personal-interest paragraph, timeline, milestones, awards, publication
  list, collaboration pitch, portrait hero, or Home promotion.
- No unrelated visual redesign, shared-component refactor, dependency change,
  legacy-tree edit, Git mutation, commit, push, or deployment.
