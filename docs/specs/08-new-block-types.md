# Spec: New Block Types (Video, Carousel, List, Quote, Iframe)

## Problem Statement

The page builder ships 12 Block types — section, grid, flex, title, paragraph, button,
separator, icon, form, field, htmltext, image. Three everyday content needs are missing
from the editor: embedding media (video, iframe), grouping repeated items (carousels),
and simple structured text (lists, quotes). Editors must hand-write raw HTML in an
`htmltext` block or ask a developer to extend the builder, which defeats the purpose of
a visual CMS.

## Solution

Add five Block types to the builder: `video` (remote video embed with a fallback
poster), `carousel` (container Block of slides, each slide an image or text via child
Blocks), `list` (ordered/unordered list of items), `quote` (blockquote with
attribution), and `iframe` (embedded third-party content with a URL allowlist). Each
type gets the same treatment as existing Blocks: builder editing UI, server-side
validation, sanitization, rendering on the public site, and support in templates and
revisions.

## User Stories

1. As an editor, I want to embed a video (YouTube, Vimeo) into a Page so that I can add
   media without writing HTML.
2. As an editor, I want the video Block to support a poster image and a caption so that
   the embed looks polished even before playback.
3. As an editor, I want to add an image carousel with arrows and dots so that I can
   present multiple images compactly.
4. As an editor, I want carousel slides to support text/caption content so that I can
   annotate each slide.
5. As an editor, I want an ordered or unordered list Block so that I can present simple
   structured text without hand-writing HTML.
6. As an editor, I want a quote Block with optional attribution and a configurable
   style so that I can feature testimonial-style content.
7. As an editor, I want an iframe Block to embed third-party content so that I can add
   maps, polls, or widgets.
8. As an admin, I want the iframe Block to only allow URLs from a configurable
   allowlist so that arbitrary third-party embeds cannot be injected.
9. As an editor, I want all five Block types to support the existing responsive prop
   system so that layout breaks behave consistently.
10. As an editor, I want the new Blocks to appear in the builder's Block picker so that
    I can discover them without a code change.
11. As an admin, I want the new Blocks to be sanitized like all other rich content so
    that the public site stays safe.
12. As an editor, I want the new Blocks to work inside the existing collaborative
    builder (locking, presence, drafts) so that my team can edit them together.
13. As an editor, I want the new Blocks to save and restore through Templates and
    Revisions so that they behave like all other content.
14. As a developer, I want the new Blocks to produce no CLS (stable aspect-ratio
    containers) so that page layout does not jump on load.

## Implementation Decisions

- Extend the `BlockType` union and `BlockPropsMap` / `ResolvedBlockPropsMap` with the
  five new types, following the existing pattern (props interfaces per type, responsive
  where applicable).
- `video`: stores a provider + URL, optional poster FileRef, caption; renderer computes
  the embed URL server-side for known providers (YouTube/Vimeo) and falls back to a
  direct `video` tag for direct sources.
- `carousel`: a container Block whose children are slides; the renderer ships a
  lightweight, dependency-free carousel (arrow + dot controls) and the editor manages
  slide children with the existing BlockTree.
- `list` and `quote`: leaf Blocks with structured props (ordered/unordered items, quote
  text + attribution); rendered as standard `<ul>/<ol>` and `<blockquote>` markup.
- `iframe`: stores the URL plus title, height/ratio; server-side allowlist
  (config-driven) is enforced at save time in the builder validator and again at render
  time, with `sandbox` and `referrerpolicy` attributes applied.
- Rich-text and URL inputs are sanitized with the existing DOMPurify pipeline; video
  embeds only render for allowlisted providers.
- CSS safelist entries are added for the new block classes following the existing
  safelist mechanism, and CLS is avoided via intrinsic ratios on video/iframe/carousel
  containers.
- The builder validator gains per-type schemas; templates/revisions need no change
  because they store the generic Block tree.

## Testing Decisions

- A good test asserts that each new Block validates/sanitizes correctly, that iframe
  allowlist enforcement rejects non-allowlisted URLs at both save and render, and that
  video embeds only render for known providers — external behavior, not component
  internals.
- The main seam is the builder validator/operation pipeline (unit-tested), mirroring
  `tests/unit/validators/builder_validator.spec.ts` and the sanitize-content tests.
- Renderer behavior is covered by the existing page-rendering action/renderer tests,
  with fixture content containing the new Block types.
- A browser test covers adding a video and a carousel in the builder and seeing them
  render on the public page, stacking on the existing `tests/browser/` setup.

## Out of Scope

- A full featured lightbox or gallery, custom video players, or lazy-loading
  optimisation beyond intrinsic ratios.
- Editor-internal custom logic for the carousel beyond managing slide children via the
  existing BlockTree (no bespoke slide editor).
- New embed providers beyond the documented allowlist; arbitrary-site embedding stays
  limited to iframe allowlist entries.

## Further Notes

- These Blocks are pure additions: existing Blocks, saved Pages, Templates, and
  Revisions remain untouched and continue to render as before.
- The domain glossary "Block" definition is broadened to mention the new types but its
  semantics (a node in the content tree, containers can hold children) are unchanged.
