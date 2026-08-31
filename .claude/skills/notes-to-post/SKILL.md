---
name: notes-to-post
description: >
  Turn raw notes into publishable writing: a blog post (MDX), a wiki/knowledge-repo note, or a
  Substack draft, written in a calibrated technical voice modelled on shav.dev. Orchestrates
  five stages: triage the material, extract a claim inventory, draft under strict no-invention
  rules, research and cite via the research-cite skill, humanise via the humanize skill, then
  emit in the target format with front matter and a gap report.
  Use whenever the user wants to publish, polish, write up, or turn notes into a post, article,
  essay, wiki page, newsletter or Substack issue; when they say "make this publishable",
  "write this up", "turn my notes into a post", "draft a blog post from this", "Substack
  version of this", "add this to the wiki"; or when they hand over rough notes, a transcript,
  a scratch file, or handwritten-note transcriptions and ask for something readable at the
  other end. British English throughout.
---

# Notes to Post

Raw notes in, publishable writing out. This skill owns **triage, extraction, drafting and
formatting**. Completion and humanisation are separate skills and are invoked, not inlined.

```
 Stage 0     Stage 1      Stage 2a      Stage 2b        Stage 3        Stage 4
 TRIAGE  →   EXTRACT  →   DRAFT     →   RESEARCH    →   HUMANISE   →   FORMAT
                                        + CITE
 what is     what does    say it in     source every    strip the      MDX / wiki /
 it? where   the source   full, mark    external        machine        Substack,
 does it     actually     every gap     claim,          texture        front matter,
 go?         claim?                     footnote it                    gap report

                                        ↓ skill:        ↓ skill:
                                        research-cite   humanize
```

**Why 2b and 3 are separate skills.** They have opposite failure modes. Completion fails by
inventing facts; humanisation fails by sanding off voice. Run together, a well-polished sentence
launders an unsourced claim and nobody catches it. Keep them apart, in that order, always.

---

## Non-negotiables

1. **British English.** -ise/-isation, -our, -re, learnt, analyse, licence (noun) / license
   (verb), practice (noun) / practise (verb), maths. Code, identifiers, CLI flags, API fields,
   CSS properties, library names, quoted titles and direct quotations keep their original
   spelling. Table in `references/voice.md`.
2. **Spaced hyphen, never an em dash.** ` - ` is the house style for a mid-sentence break.
3. **Nothing enters the draft that was not in the source, verified by Stage 2b, or confirmed by
   the user.** No invented numbers, dates, benchmarks, quotes, attributions or anecdotes.
4. **Every output ships a Gap Report**, outside the article body.
5. **Never publish or push without being asked.** Write the file. Stop there.

---

## Stage 0: Triage

Read all the raw material before deciding anything.

**Destination.** The question is whether the material carries a *stake* - something the author
did, broke, measured, chose, or got wrong.

| Material | Destination | Why |
|---|---|---|
| Reference knowledge: definitions, mechanisms, canonical facts, course or book notes | **Wiki note** | It is a thing to look up, not an argument. Keep the hierarchy, don't essay-ify it. |
| A stake: a system that broke, a number measured, a decision made, a position held | **Blog post** | There is a first person in it. That is what makes it worth reading. |
| Either, aimed at an inbox rather than a site | **Substack** | Same draft, different packaging. See `references/formats.md`. |

`notes/` in this repo shows the split. `SD_SELF_NOTES.md` is 46 pages of system-design reference
and is almost entirely wiki material. One cluster of it - quorums, `W + R > N`, write conflicts
- plus one production incident becomes a blog post. The notes are the substrate; the stake makes
the post.

**Shape.** Estimate from source volume. Never pad to hit a length.

- **Short (3-8 min, 700-1,800 words).** One claim, evidence, done. No H3s.
- **Long (15-40+ min).** A thesis needing sections. H2 for movements, H3 for beats.
- **Wiki note.** One concept per page, deep nesting, cross-linked.

State destination and shape before writing.

---

## Stage 1: Extract

Build a **claim inventory** before drafting a sentence:

- **Claims.** Every assertion, in the notes' own terms.
- **Anchors.** Every number, name, date, tool, version, command, error string, benchmark.
- **The stake.** What the author actually did or observed. Quote the source on it.
- **Structure.** Diagrams, tables, code, ASCII art that must survive as-is.
- **Holes.** Where the notes trail off, contradict themselves, or assume a step.
- **External claims.** Anything asserting a fact about the world rather than about the author's
  own work. Tag these now; they become Stage 2b's research queue.

Keep the inventory. Stage 2a drafts *from the inventory*. Stage 4 checks the finished piece back
against it.

For handwritten sources, respect the transcription conventions already in use.
`notes/SD_SELF_NOTES.md` marks highlighter as `==text==`, deletions as `~~text~~`, and the one
word not read off the page as `*[inferred]*`. That instinct is right and this pipeline extends it.

---

## Stage 2a: Draft

Write the piece in full, in the target voice, per `references/voice.md`.

**Read `references/drafting.md` before writing a sentence.** It is the catalogue of what an LLM
reaches for by default when asked to expand terse notes into explanatory prose, with the archetype
for each. Three full rewrites of this corpus were needed because that file did not exist; the
whole point of it is that the next draft should not need them. It carries the calibration
sentence, the punctuation floor, and the two things never to write.

**You may add:** transitions, worked explanations of a mechanism the notes name, restatements,
section framing, the "why this matters" left implicit, and structure.

**You may not add:** any fact. Numbers, dates, versions, benchmark results, quotes, company
names, incident details, citations, or a story that did not happen.

**Mark every addition inline:**

- `[[ADDED: ...]]` - connective material the notes did not contain.
- `[[INFERRED: ...]]` - derived from the notes but not stated in them.
- `[[NEED: ...]]` - a hole where a real fact belongs.
- `[[SOURCE?: ...]]` - probably true, needs a citation.

Markers survive into Stage 2b, which resolves the `SOURCE?` ones and some `NEED` ones. They come
out at Stage 4. A `[[NEED:]]` is never resolved by guessing.

If the notes are too thin for the destination picked in Stage 0, say so now and propose the
smaller piece the material supports.

---

## Stage 2b: Research and cite → `research-cite`

Invoke the **`research-cite`** skill with the Stage 2a draft and the Stage 1 inventory.

It fans out parallel research subagents, one per claim cluster, and returns three things:
numbered footnotes in the shav.dev style, the sentence each `[^n]` attaches to, and a citation
ledger with a verdict per claim.

**Your job with what comes back:**

- `SUPPORTED` → merge the footnote, place the marker.
- `PARTIAL` → the draft's figure is off. Correct the draft to the source. Do not correct the
  source to the draft.
- `CONTRADICTED` → **stop and fix.** Cut the claim or rewrite it to what the evidence shows.
  Never carry a contradicted claim into Stage 3, where humanisation will make it read better.
- `NOT FOUND` → cut the claim, attribute it explicitly to the author's own experience, or soften
  it to what can be shown. Then log it in the Gap Report.

Run this stage even when the draft has no markers. A draft asserting nothing external is either
genuinely first-hand, which is rare and fine, or it is stating received wisdom as observation.

Wiki notes get this stage too, at lower intensity: canonical textbook material does not need a
footnote per line, but a specific figure or a named result does.

---

## Stage 3: Humanise → `humanize`

Invoke the **`humanize`** skill (vendored at `.claude/skills/humanize/`, copied from
github.com/harshaneel/humanize).

**Read `references/humanize-calibration.md` first.** It carries four deliberate overrides of
humanize's defaults plus the prose-zone scoping rules. Two of them matter a great deal: applying
humanize's structural flattening and its ban on aphoristic closers unmodified will strip out
exactly what makes a post read like shav.dev.

Humanise **prose zones only**. Tables, code blocks, command listings, ASCII diagrams, reference
lists and footnote bodies are left alone. The sentences leading into them are prose.

**Send a reader, not a regex.** Mechanical scanning cannot separate engineered emptiness from
engineering that carries a fact. Measured on this corpus: a regex for the compressed-flourish tic
returned 129 hits, almost all false positives (abbreviations, ordinary prepositional tails); an
agent told to read for the same tic by judgement, given one archetype sentence, returned 54 real
instances with rewrites. Spawn an agent whose only job is to read for tone and report quotes.

**Then sweep cross-file.** Constructions that recur across chapters regenerate: after a pass in
which every agent removed its own flagged instance of a metaphor, the metaphor reappeared in three
files in new places. Check the whole corpus after the per-file work, not before.

Optionally grade the result with the **`ai-check`** skill (also vendored). Target: "Human" or
"Likely Human". If it flags Signal E (specificity), that is a Stage 1 or 2 problem, not a
Stage 3 one - go get the facts or publish shorter.

**Verify with readers who did not write it.** Grading your own output is worthless here: the model
that wrote the draft is the model checking it. Spawn adversarial `ai-check` agents with no
knowledge of authorship. On this corpus they caught, among other things, a fabricated experience
claim, a metaphor repeated across two files in the same structural slot, and a paragraph-opening
sentence length identical to within half a word across three unrelated files.

---

## Stage 4: Format and emit

Strip the Stage 2a markers, then emit per `references/formats.md`.

Run this gate. Write the actual count next to each item; "looks fine" is not a check.

- [ ] Em dashes `—`: 0. Spaced hyphens ` - ` used instead.
- [ ] Curly quotes: 0.
- [ ] `[[ADDED:]]` / `[[INFERRED:]]` / `[[NEED:]]` / `[[SOURCE?:]]` in the body: 0.
- [ ] US spellings in prose: 0. (Code and quoted titles exempt.)
- [ ] Every paragraph has an anchor: a number, name, date or concrete example.
- [ ] Every external claim carries a footnote, or appears in the Gap Report.
- [ ] Zero `CONTRADICTED` claims survive from Stage 2b.
- [ ] Every claim traces to a Stage 1 inventory line.
- [ ] Footnotes numbered in first-appearance order, no duplicate sources.
- [ ] Front matter complete and valid for the destination.

Then output, in this order:

1. The file path written.
2. The **Gap Report**: added / inferred / still needed / unsourced-and-cut. Folds in Stage 2b's
   `NOT FOUND` and `PARTIAL` items. This is the part the user acts on.
3. One line on destination, shape and reading time.

Nothing else. No changelog of edits, no summary of the argument back at the user.

---

## Reference files

- `references/drafting.md` - how to write the expansion prose so it does not need a humanisation
  pass. Read at Stage 2a. The most useful file here.
- `references/voice.md` - the voice spec, eleven fingerprints with verbatim shav.dev evidence,
  the British English table, the separate wiki voice, and how to migrate the exemplars to
  Lakshya's own voice once there are published pieces to distil from.
- `references/briefing-agents.md` - how to brief the subagents this pipeline fans out to. Quota
  briefs versus judgement briefs, the calibration-example technique, what to protect, and how to
  verify. Read before spawning writing agents.
- `references/humanize-calibration.md` - how this pipeline uses the `humanize` skill: zone
  scoping and the overrides.
- `references/formats.md` - MDX front matter, wiki note schema, Substack constraints, the
  reading-time formula, the Gap Report shape.
- `references/worked-example.md` - the whole pipeline run on `notes/digital/pages/page-12.md`,
  including the triage decision that sends it to the wiki rather than the blog. Read once before
  the first real run.

## Related skills

- **`research-cite`** - Stage 2b. Subagent fan-out, structured citation records, shav.dev-style
  footnotes. Separate skill by design.
- **`humanize`** - Stage 3. Vendored verbatim, MIT. Do not edit it; put deviations in
  `references/humanize-calibration.md`.
- **`ai-check`** - optional grading after Stage 3. Vendored verbatim, MIT.
