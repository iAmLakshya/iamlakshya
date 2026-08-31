# Stage 4: output formats

Three destinations, three schemas. Pick in Stage 0.

---

## Reading time

`ceil(prose_words / 250)`, minimum 1. Prose words only: exclude code blocks, front matter,
footnote bodies and table markup. shav.dev's figures sit between 230 and 280 wpm across short
and long posts, so 250 tracks it closely enough.

Display as `3 MIN`, `36 MIN`. Store as an integer.

---

## Blog post: MDX

`app/blog/` currently holds a stub page with placeholder text and no MDX pipeline, so this
schema is a proposal rather than a fit to existing code. It matches what shav.dev renders
(title, date, description, reading time, tags, footnotes) and it can change freely - but change
it here, in this file, so the skill and the renderer stay in step.

**Path:** `content/blog/<slug>.mdx`, slug in kebab-case, derived from the title but shortened
where the title is long. shav.dev does exactly this: *"Cultural Alignment of Open-Weight LLMs
on the Inglehart-Welzel Map"* lives at `/blog/cultural-alignment-of-open-weight-llms-on-the-inglehart-welzel-map`,
but *"Our Lessons from Building Production Voice AI"* is just `/blog/voice-ai-lessons`. Prefer
the short form.

```yaml
---
title: "Quorums Are Not Consistency"
slug: "quorum-consistency"
date: "2026-08-31"              # ISO 8601, the publication date
description: "W + R > N guarantees one node has the latest write. It does not guarantee anyone reads it."
tags: ["distributed-systems", "databases", "consistency"]
readingTime: 7                   # integer minutes, see formula above
draft: true                      # true until explicitly published
# provenance - not rendered, kept so a post can be traced back to its notes
source:
  notes: ["notes/digital/pages/page-12.md", "notes/digital/pages/page-13.md"]
  pipeline: "notes-to-post"
---
```

**The `description` field states the finding, not the topic.** This is the single most
copyable thing about shav.dev's metadata. Compare:

- Topic (wrong): "An analysis of cultural bias in large language models."
- Finding (right): *"Seventeen frontier open-weight LLMs, surveyed in English and Chinese on the Inglehart-Welzel cultural map, all land in the same secular, self-expressive corner"*
- Finding (right): *"Scaling from 2 to 6 developers broke our Git workflow. These patterns fixed it"*
- Finding (right): *"What broke when we shipped voice agents to real users, and what we learned fixing it"*

No full stop at the end. One sentence. If you cannot write the finding, the post does not have
one yet.

**Body rules:**

- No H1 in the body. The `title` field renders it.
- H2 for movements, H3 for beats. Short noun phrases (`voice.md`, fingerprint 8).
- Fenced code blocks with a language tag. Real commands, commented, never pseudo-code.
- Footnotes as `[^1]` inline, definitions at the bottom under a `## Footnotes` heading or via
  the MDX footnote plugin. Each definition is a sentence or two: what the source is, what is in
  it, which figure came from it.
- Internal links to other posts as relative paths (`/blog/other-post`), and use them - this
  voice cross-references its own prior arguments.
- Tables for verdicts and comparisons, with named columns.
- ASCII diagrams from handwritten notes go in a fenced block with no language tag, preserved
  exactly. Do not redraw them as prose.

---

## Wiki note

**Path:** `content/wiki/<section>/<subsection>/<page>.md`, mirroring the hierarchy.

```yaml
---
title: "Quorums"
description: "Read and write quorums, W + R > N, and why it is not strong consistency"
section: "system-design"
order: 12                        # position within the parent section
tags: ["replication", "consistency"]
source:
  notes: ["notes/digital/pages/page-12.md"]
---
```

**Body rules:**

- One concept per page. If a page covers two, split it.
- Keep the note's structure: nesting, arrows, bullets, tables, ASCII diagrams. Do not convert
  to prose. This is the opposite of the blog rule and it is deliberate.
- H2/H3 mirror the note's own hierarchy.
- Cross-link aggressively with relative links.
- Each *section index* page opens with one paragraph of provenance: where these notes came from
  and what they cover. That paragraph is the only real prose on the page, and it is the only
  part that gets a humanisation pass.
- Transcription markers from the source survive: `==highlight==`, `~~struck through~~`,
  `*[inferred]*`. They are honest metadata about what was actually on the page.

**Section index template** (matching wiki.shav.dev's introduction pages):

```markdown
# <Section Name> <emoji>

<One paragraph: what this section is, where the notes came from, what period of work or study
they cover, and what a reader will find. First person, plain, no marketing.>

## <Subsection>

<One or two sentences on what this subsection covers and why it is here.>
```

---

## Substack

Substack is not MDX and will silently mangle anything clever. Constraints:

- **No front matter.** Title and subtitle are separate fields in the composer. Output them as
  labelled lines above the body so they can be pasted in.
- **No H1 in the body.** Title is a field. Start at H2.
- **No MDX components, no JSX, no custom syntax.** Plain markdown only.
- **Footnotes:** Substack has native footnotes but they do not paste in as `[^1]`. Convert to
  inline parentheticals with the source named, or a `Sources` section at the end as a plain
  numbered list. Choose one per piece and be consistent.
- **Tables render poorly** on mobile. Anything wider than three columns becomes a list.
- **Code blocks work** but are not syntax highlighted. Keep them short. A 40-line git session
  belongs on the site with a link from the newsletter.
- **Images need alt text** and must be uploaded separately.
- **Link out to the canonical version** on the site once, near the top or bottom. Do not
  duplicate long reference sections in both places.

**Output shape:**

```
TITLE: Quorums Are Not Consistency
SUBTITLE: W + R > N guarantees one node has the latest write. It does not guarantee anyone reads it.

<body, starting at H2, plain markdown>

---
Sources
1. ...
```

**Blog-to-Substack adaptation.** The two are not the same piece. When converting:

- Cut the deep reference sections. Link to the site version for those.
- Keep the stake, the argument, the numbers and the close.
- A 36-minute site post becomes an 8-minute newsletter plus a link, not a 36-minute email.
- The subtitle is the `description` field, unchanged.

---

## Shorthand is not a diagram

Handwritten notes are full of arrow-and-indent outlines: `Hash map bad for disk | ↳ values all
over the disk | → kept in RAM | ↳ expensive`. These are compression for the person who wrote
them. They are **not** diagrams, and preserving them as ASCII ships someone's private shorthand
as if it were a figure.

Classify every fenced block from the source before deciding:

| The block is really | Becomes |
|---|---|
| An indent/arrow outline restating a hierarchy | Prose. Usually the adjacent paragraph already says it, in which case delete the block outright. |
| Rows and columns drawn in pipes and dashes | A real markdown table. |
| A linear A → B → C flow | A prose sentence, or a small reusable flow component. |
| Genuinely spatial: a topology, a tree, a pipeline with feedback, a grid | A figure. Build it properly. |
| Code, signatures, or commands | A fenced code block. This is the only case that stays fenced. |

The test: read the block aloud. If it comes out as a sentence, it was always a sentence.

## Figures do not announce themselves

Do not badge a figure "Interactive", and do not tell the reader in prose which figures can be
changed. A control that looks like a control is discovered by touching it; a label announcing
interactivity is noise on every subsequent read. Spend the effort on hover and active states
instead. The same rule covers any UI affordance: if the interface can show it, do not write it.

## The Gap Report

Emitted after the file path, every time, in this shape:

```
## Gap Report

**Added** (connective material, no new facts)
- Transition into the Merkle tree section explaining why anti-entropy needs one.

**Inferred** (derived from the notes, not stated in them)
- That the quorum failure mode described on p.12 is the same one Dynamo's paper calls
  sloppy quorums. The notes do not name it. Confirm or cut.

**Needed** (holes left open - resolve before publishing)
- p.13 gives no figure for replication lag. The paragraph currently reads around it.

**Needs a source** (probably true, currently uncited)
- "W + R > N" is standard, but the post asserts a specific failure rate. Cite or remove.
```

Empty sections get the word "None". Never omit a section, and never move any of this into the
article body.
