# About Page Evaluation Sheet

**Evaluator role:** Read-only. Record findings; do not edit implementation
files. Evaluate the complete working tree against the approved spec and current
repository architecture.

## Functional Contract

- [ ] `ABOUT` appears immediately after `HOME` and routes internally to
      `#/about`.
- [ ] The sidebar active state, mobile menu closing, focus transfer, and direct
      route loading follow existing internal-route behavior.
- [ ] About renders exactly Background and Current Work plus CV/email actions.
- [ ] CV and email are sourced from the existing shell fields.
- [ ] Home receives no About promotional card.
- [ ] Page metadata and canonical route are correct.

## Content And Restraint

- [ ] Copy matches the approved factual draft and remains near 150-250 words.
- [ ] Status is consistently incoming before August 2026 across About, Home,
      shell profile, recent entry, and SEO.
- [ ] No achievement inventory, inflated positioning, speculative research
      catalogue, or duplicated CV chronology appears.

## Figure Model

- [ ] Each section accepts zero to two figures.
- [ ] Each figure stores only upload, alt, optional caption, and order.
- [ ] Schema requires safe image uploads and non-empty alt text.
- [ ] Studio excludes PDFs and prevents more than two figures per section.
- [ ] All upload-reference and usage collectors include About figures.
- [ ] Missing or in-use About uploads fail closed under existing mechanisms.
- [ ] Zero figures leave no empty rail; one and two figures render correctly.
- [ ] Desktop uses a narrow right margin rail; mobile places figures after their
      section; images are not cropped or grayscaled.

## Architecture And Scope

- [ ] Implementation follows existing page, router, schema, Studio, validation,
      upload, metadata, and artifact patterns.
- [ ] Existing controls and helpers are reused where practical.
- [ ] No generic builder, unnecessary abstraction, dependency, legacy edit, or
      unrelated refactor was introduced.
- [ ] Canonical content remains confined to approved CMS roots.

## Quality

- [ ] `npm run verify` passes.
- [ ] `git diff --check` passes.
- [ ] Complete scoped diff has been reviewed.
- [ ] Verified `dist` is inspected at desktop and mobile widths.
- [ ] No overflow, overlap, illegible figure, broken caption, or unexpected
      responsive shift is visible.
- [ ] Keyboard navigation and links work.

## Findings

Record each finding with severity, file/line reference, observed behavior, and
the smallest recommended correction. If no findings remain, state that clearly
and identify any residual test gap.
