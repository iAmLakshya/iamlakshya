# Using `humanize` in this pipeline

The `humanize` skill is vendored verbatim at `.claude/skills/humanize/` (MIT, from
github.com/harshaneel/humanize). It is grounded in the detection literature - DetectGPT, DivEye,
and the "Base Models Look Human" RLHF finding - and benchmarked in CI. Do not reimplement it and
do not edit it.

This file is the caller's configuration: **what to feed it, and where this project deviates.**

---

## Zone scoping: what gets humanised

`humanize` assumes flowing prose. A technical post in this voice is roughly 40% structure by
volume, on purpose. Split the draft before invoking it.

| Zone | Humanise? |
|---|---|
| Narrative paragraphs, argument, the opener, the close | **Yes, fully** |
| The sentence introducing a table, list or code block | **Yes** - this is prose |
| Code blocks, command listings, config, ASCII diagrams | No. Leave byte-identical. |
| Tables of verdicts, comparisons, mappings | No. Prose inside cells only. |
| Rule lists and recipe steps with bold lead-ins | No. Earned convention, `voice.md` fingerprint 9. |
| Footnote bodies | Light touch. Keep them dense and factual. |
| Headings | No. Short noun phrases, `voice.md` fingerprint 8. |
| Wiki note bodies | No. Section intros only. See below. |

---

## Override 1: do not flatten the structure

`humanize` Lever 4 is "structural flattening", and its self-check includes *"No bullet lists
unless the user requested them"*. Applied unmodified to a technical post this is wrong and will
quietly destroy the piece.

*Git Disasters and Process Debt* has six code blocks of real git commands. *The Last Moats* runs
verdict tables with named columns. *Voice AI* has ~50 H3 sections because it is a reference
document people scroll back to. That structure is the content, not scaffolding imposed on thin
content.

The zone table above is the mechanism. Lever 4 still applies **within** prose zones: no
intro-sentence-plus-three-bullets where a paragraph would do, no "There are three main factors:",
no restating the topic sentence at the end of a paragraph.

## Override 2: budgets, not bans

This override replaces an earlier one that permitted "one aphoristic closer per piece". That
instruction was applied per *paragraph* and produced fourteen of them in a 2,000-word file, which
three independent forensic checks flagged as the dominant tell. The lesson generalises, and it is
the most important thing in this file.

**A ban displaces a device. It does not remove it.** Measured, on this project:

| The ban | What the model did instead |
|---|---|
| No em dashes | Wrote spaced hyphens *in the slots em dashes would occupy*, at 7 per file. A checker called it "the fingerprint of a suppression pass, not of a writer who never reaches for one." |
| No "not X, it's Y" | Wrote `rather than` eleven times in one file, four of them closing paragraphs. |
| One aphoristic closer permitted | Wrote fourteen. |

Each ban was individually correct. Together they produced a laundering signature more detectable
than what they removed, because **the signature was never any single device. It was doing the same
good thing every time.**

So give each device a budget rather than a prohibition, and count it. Per ~2,000 words:

| Device | Budget |
|---|---|
| Paragraphs ending on a turned, quotable line | 2 |
| Pseudo-cleft ("X is what Y buys", "What X does is…") | 1 |
| `rather than` / `instead of` defining by negation | 2 |
| Count announcements ("Three things…", "in two ways") | 0 |
| Pattern announcements ("Sorting is doing the work here") | 0 |
| Announcement colons | 4 |
| Semicolons joining independent clauses | 0 |
| Mirrored clause pairs of matched length and shape | 1 |
| Spaced hyphen ` - ` | 2 |
| Tricolons, including three same-shaped paragraphs | 0 |

When you remove a flagged construction, **restructure the sentence**. Do not reach for the nearest
synonym of the banned move.

## Override 2b: require asymmetry, do not just forbid symmetry

Telling a model to "vary its paragraph endings" produces uniformly varied paragraph endings. The
variance has to be specified as a quota too. Per file:

- At least 4 paragraphs end flat: on a plain fact, an unresolved qualification, or mid-explanation.
- At least 2 paragraphs do two jobs, or wander into an adjacent point and do not come back.
- Paragraph length varies hard: one under 40 words, one over 120, and no run of three within 20
  words of each other.
- At least one section is noticeably thinner than its neighbours. Equal treatment of unequal
  topics is a generator habit.
- At least one honest limitation: where the explanation genuinely stops or the sources disagree.

Do not add performed informality or filler hesitation. What you want is unevenness of *attention*,
not of register.

## Override 3: zero em dashes, not a quota

`humanize` hard rule 1 allows one em dash per 300 words. This voice allows zero and uses ` - `
instead. Stricter, so no conflict, but state the target as zero rather than a quota.

## Override 4: no plausible-specificity frames

`humanize` Lever 5 permits "plausible-specificity frames" ("in the cases I've seen...", "the one
time this bit us...") when real anchors are missing. **This pipeline forbids that.** A missing
anchor is a `[[NEED:]]` marker and a Gap Report line. Stage 2b exists precisely so that gaps get
filled with sourced facts or stay visible as gaps.

Its protocol step 2 also mandates a meta-note when input has zero factual anchors. That note is
useful; route it into the Gap Report rather than appending it to the article.

---

## Override 5 (mechanical): British English survives the rewrite

`humanize` has no locale awareness and will happily rewrite "commoditises" as "commoditizes"
while swapping a verb. **Re-run the British English check from `voice.md` after every
humanisation pass.** Every time, no exceptions.

---

## What carries over unchanged

Apply at full strength. These do the actual work.

**Lever 2, burstiness.** The one to enforce mechanically, because it cannot be checked by feel.
After the pass, write out every sentence's word count in a prose zone in order ("9, 5, 22, 16,
7...") and check: longest minus shortest ≥ 20; fewer than half in the 10-20 band; no three
consecutive within 5 words; at least one ≤ 6 per 150 words.

Shav's prose passes naturally. From *Voice AI*: *"Latency hit us first."* (4 words) sits two
sentences from a 31-word sentence carrying three parenthetical latency figures. That swing is the
texture.

**Lever 9, strip the RLHF register.** The highest-value lever. No "Here's how I'd think about
it", no "Let me walk you through", no balanced-tradeoff offering, no pedagogical scaffolding, no
closing summary, no "I hope this helps".

**Levers 1, 3, 6, 7, 8** as written: perplexity injection, hedge surgery, first-person voice,
non-AI transitions, punctuation normalisation.

---

## Wiki notes

Almost nothing applies. A wiki note is supposed to read as structured notes.

**Do:** fix the section intros so they sound like a person explaining where the notes came from,
remove marketing register, keep British spelling, fix genuinely broken sentences.

**Do not:** convert bullets to prose, vary sentence length for its own sake, add a first-person
narrative, add a closer, or smooth out the hierarchy.

Section intro paragraphs are the only real prose on a wiki page. Humanise those, leave the rest.

---

## The mechanical gate

`scripts/style-gate.py` counts every budgeted device plus the paragraph-architecture columns
that the earlier gate missed. Run it after Stage 3 and before Stage 4:

```bash
python3 .claude/skills/notes-to-post/scripts/style-gate.py 'content/**/*.md'
```

Read the architecture columns even when nothing breaches. `flat3` counts runs of three
consecutive paragraphs within 20 words of each other, and `closers` counts paragraphs over 60
words whose final sentence is 12 words or fewer, which is the shape of a landing beat. A file
with zero breaches, zero `flat3` and a 25-to-140-word paragraph spread is where you want to be.

A caveat the gate cannot check: it counts devices, not whether the prose is any good. It will
happily pass text that is evenly bland. Use it to catch uniformity, not to certify quality.

## What this pipeline cannot do

Two full de-AI-ing passes were run over a 27,000-word corpus and independently graded by six
forensic checks. Both passes moved the tell rather than removing it. This section records the
ceiling so it is not rediscovered a third time.

**Each pass produced its own fingerprint.**

| Pass | The instruction | The artefact it created |
|---|---|---|
| 1 | No em dashes | Spaced hyphens in em-dash slots, 7 per file |
| 1 | No "not X, it's Y" | `rather than` x11 in one file |
| 1 | One aphoristic closer permitted | Fourteen of them |
| 2 | Budgets on all of the above | `", so "` x50 in three files, with therefore / thus / moreover / furthermore all at zero |
| 2 | "Vary paragraph length" | Opening sentences averaging 15.2 / 15.6 / 15.1 words across three unrelated files |
| 2 | "At least four flat endings" | Zero written. The flat endings counted were pre-existing note stubs, identical at 13 per file |

**The absences became the evidence.** Zero em dashes, zero semicolons, zero parenthetical asides
and zero contrastive "however" across 7,403 words is not restraint. A checker put it exactly:
"the constructions that normally take a dash are all present; the dashes are gone. That is
displacement, not absence. A writer who genuinely never reaches for a dash also writes fewer
asides." Absence at precisely zero is a filter signature. If a device is banned outright, the
ban is visible.

**So a ban list needs a floor as well as a ceiling.** This was tested on the third pass and it
works. Re-admitting the banned marks in small numbers broke the monoculture without creating a new
one:

| | before the floor | after |
|---|---|---|
| em dashes per file | 0 | 1-4 |
| semicolons per file | 0 | 1-2 |
| `, so ` | 1 per 113 words | 1 per 229-623 |
| however / though / whereas | near zero | in ordinary use |

The instruction that produced it: *use the full range of English connectives so no single one
carries everything*, explicitly **not** "reduce `, so`", which would have displaced it again.

**Three signals survive every pass**, because they live above the layer a rewrite operates on:

- **Signal D, paragraph architecture.** Note stub, one expansion paragraph, a closer that turns.
  Held across ~118 paragraphs in four files with no exceptions, through two rewrites.
- **Signal I, rhetorical scaffolding.** Constrained to a budget, it reappears in costume. Cap
  `rather than` and "X, and not Y" fires eight times instead.
- **Signal H, the absent author.** Zero first person in 27,000 words of what is nominally a
  personal notebook. This is the one that cannot be written around, and it is the one every
  checker named. "Personality was applied to the sentences; nobody was put behind them."

**The diagnostic shape of edited AI text** is a clean surface over an intact skeleton: signals
A, C, F and G near zero while D, H and I sit at 2-3. That distribution is more telling than the
total score, and driving the total down by scrubbing the surface makes the distribution more
distinctive, not less.

**A specific trap for whoever writes the next brief.** Language in the brief leaks into the
prose as fabricated experience. The phrase "this is the thing every HBase operator has been
burned by" was written as *guidance to a subagent* and came back in the published text as an
authorial claim, in a document with no first person anywhere. Write briefs in instructions, not
in sentences you would be content to see published.

**What actually closes the gap** is not available to this pipeline: one system the author ran,
one number they measured, one decision they regret. Research can supply operator-grade *facts*
(and should - it moved Signal E substantially). It cannot supply a speaker. Past a certain
point, ship the work as well-sourced explanatory reference and let the author add the first
person, rather than running a third pass and reporting a number nobody believes.

## Grading

`ai-check` is vendored at `.claude/skills/ai-check/`. Run it after Stage 3 when it matters.
Target: "Human" or "Likely Human".

If it flags **Signal E (specificity)**, that is a Stage 1 or Stage 2 problem, not a Stage 3 one.
The notes were thin, or real anchors were left as gaps. Do not fix it by adding texture. Go back
to Stage 2b for sourced facts, or publish shorter.
