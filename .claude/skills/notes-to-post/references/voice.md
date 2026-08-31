# Voice specification

Calibrated on shav.dev (blog) and wiki.shav.dev (knowledge repo), August 2026. Every quoted
passage below is verbatim from a published post and is there as evidence, not decoration.

---

## The one-line summary

A working engineer writing up something they actually did, for another engineer, with the
numbers in. Calm, opinionated, specific, occasionally funny about their own mistakes. Never
selling anything.

---

## The eleven fingerprints

### 1. Open on the stake, in the first person, with no throat-clearing

The first sentence names what the author did or is trying to work out. There is no "In today's
rapidly evolving landscape", no definition of the topic, no promise of what the post will cover
before the post covers it.

> "I built this map as an exercise to stretch my thinking beyond traditional SaaS."
> - *The Tech Frontier*

> "I've been racking my brain over which businesses continue to survive the next few years, and which ones die."
> - *The Last Moats*

> "This is a cautionary tale mixed with post-mortem solutions."
> - *Git Disasters and Process Debt*

> "There's such a difference between a working demo and a system you'd trust with real customers when it comes to voice. I learnt this the hard way when we first tried hacking together SAMMY 3 in a week-long sprint."
> - *Our Lessons from Building Production Voice AI*

Bad opener: "Voice AI is an increasingly important area of AI development." Nobody wrote that
because they had something to say.

### 2. A contract line near the top

Within the first three paragraphs, one plain sentence saying what the reader gets and where the
authority comes from. Often an explicit `tl;dr`.

> "This post walks through where I'm seeing MCP implementations fail, why most barely work, and what actually works in production. The tl;dr: we need to move from endpoint wrappers to intent-based workflows."
> - *When MCP Fails*

> "After deploying to hundreds of end users, I've distilled our internal memos and codebase into this post. Every section exists because something broke in production."
> - *Our Lessons from Building Production Voice AI*

> "It's meant to inspire more than predict - it worked on me, so I thought I'd share it."
> - *The Tech Frontier*

Note what the third one does: it declines to overclaim. The contract line is honest about the
post's ambition, which is why the rest of the post is believable.

### 3. The spaced hyphen, never the em dash

` - ` does all the work an em dash would. This is consistent across every post.

> "It mixes prediction, provocation, and reality: the wonderful, the weird, and the sort of worrying."

> "the median gap between the story and the shipping product is 24 years - one working career, which makes the map less century-scale dreaming and more a preview of the 2040s"

> "Process debt doesn't just slow you down - it stops you cold."

Rule: zero `—` in output. Where you would reach for one, use ` - `, a full stop, or brackets.

### 4. Numbers, always, and always specific

The voice does not say "significantly faster" or "a lot of users". It gives the figure, and
usually the breakdown.

> "Even the best-in-class pipeline (at that time) achieved ~510ms voice-to-voice latency (Deepgram STT: 100ms, GPT-4: 320ms, Cartesia TTS: 90ms). Human conversational turn-taking happens at ~230ms."

> "Of the 3,746 ideas in the sheet, 2,780 have no real-world counterpart yet, and the built quarter skews digital - 32% of the software ideas exist against 23% of the hardware ones"

> "PR size exploded from ~200 lines to 2000+ lines"

`~` is used freely for approximations. That is honest, not vague: `~510ms` is a measurement
with a tolerance, "quite fast" is nothing.

### 5. Footnotes for every external claim

Numbered footnotes, and each one is a small paragraph: what the source is, what is in it, and
which figure came from it. Not a bare URL.

> "**Technovelgy** - an index of inventions and ideas from science fiction, each tagged with the originating story, author, and year. Stats from the Not Boring compilation of it in this Google Sheet: 3,746 entries, 966 of which have been built."

If a claim needs a footnote and there is no source, the claim does not ship. See the
`[[SOURCE?:]]` marker in Stage 2.

### 6. British English, with hedges that are real

Consistent British spelling: "commoditises", "specialised", "optimisable", "realised",
"learnt", "analyse", "catalogued". And genuine first-person uncertainty, including `imho`.

> "SaaS as a moat category is dead imho."

> "And I agree, this sounds like doomer logic you hear on X. It might be. I've also heard 'death of SaaS' thrown around so often it makes me roll my eyes."

That second passage is the voice at its best: it states the objection to its own thesis in the
strongest form, concedes it might be right, and then says why the thesis survives anyway. Hedge
where you are actually uncertain. Assert flatly where you are not.

**British English rules for this pipeline:**

| Use | Not |
|---|---|
| -ise, -isation: realise, specialise, optimise, organisation, commoditise | -ize, -ization |
| -yse: analyse, paralyse | -yze |
| -our: behaviour, colour, favour, honour | -or |
| -re: centre, metre, fibre, theatre | -er |
| -lled/-lling: modelled, labelled, travelling, cancelled | -led/-ling |
| learnt, spelt, burnt, dreamt | learned, spelled, burnt |
| licence (noun) / license (verb) | license for both |
| practice (noun) / practise (verb) | practice for both |
| defence, offence, pretence | defense, offense |
| catalogue, dialogue, analogue | catalog, dialog, analog |
| maths, whilst→prefer "while", among→prefer over "amongst", towards | math |

**Exempt from British spelling** (leave exactly as written): code, identifiers, filenames, CLI
flags, API fields, CSS properties (`color`), library names (`normalize.css`), quoted paper and
product titles ("Layer Normalization"), and direct quotations from other people.

### 7. Named specifics, never placeholders

Not "a customer" but the customer and what they said. Not "a TTS provider" but Cartesia.

> "One of our customers, a customer-success leader, would openly talk about how he'd torn a well-known CS platform out of two different companies he'd been at. He explicitly told us his team is 'very much build versus buy.'"

> "We used to sell a screen-aware voice AI agent as an NPM package (`@sammy-labs/sammy-three`)"

Where a name genuinely cannot be published, describe the role concretely rather than
abstracting it away. "A customer-success leader at a mid-market SaaS company" beats "a user".

### 8. Short noun-phrase headings

Two to three words. No gerund filler, no "Understanding X", no "The Ultimate Guide to Y".

> Two Motions · The Moat Ledger · Moats That Die · The Same Playbook · Going Duplex ·
> Duplex Trade-offs · The Spider Web Effect · One-Way Flow · Process Debt Compounds ·
> 400ms Budget · Noise in Production · Push Over Pull · Phantom Actions · The Takeaway

Long posts nest: H2 for the movement, H3 for the beats inside it. *Voice AI* has 12 H2s and
~50 H3s and the H3 names alone read as a table of contents worth scanning.

### 9. Bold lead-ins in reference sections

In recipe, rule and verdict sections, list items are `**Label**` then the explanation. This is
a real convention for genuinely enumerable material, not a way of faking a framework.

> "**Bidirectional merges**: `dev → staging`, then `staging → main`, then `main → staging`"

> "**Single directional promotion** - No more `main → staging` or `staging → dev` merges."

> "**Constraints beat freedom.** Complete Git autonomy creates chaos. Clear rules prevent problems."

The test: could this be a row in a table? If yes, the bold lead-in is earned. If it is three
abstract nouns dressed up as a framework, write prose instead.

### 10. Owns the failure, in plain and sometimes rude language

> "Merge conflicts became my main job for an entire week. It did my head in."

> "The first time we deployed to a real customer, the agent activated on background noise and started chatting to itself."

> "I tried this architecture with the confidence of someone following a well-written framework. For us, it fell apart fast."

> "I implemented all of these. They helped - sometimes dramatically. But I arrived at an uncomfortable conclusion: we were building increasingly sophisticated band-aids and workarounds for a fundamentally flawed architecture."

British idiom ("it did my head in") is welcome. Performed vulnerability is not: no "I'll be
honest", no "can I be real for a second". The failure is just reported.

### 11. Close on a compressed law, not a summary

The last line is a rule you could carry away, or a flat asymmetry. It never recaps the post.

> "Process debt compounds faster than technical debt. Fix it before it fixes you."
> - *Git Disasters and Process Debt*

> "The easy futures were software. The unclaimed ones are physical."
> - *The Tech Frontier*

> "You can make pipeline systems better. You can't make them feel natural."
> - *When MCP Fails* / *Voice AI*

**This directly contradicts the `humanize` skill's default**, which flags aphoristic closers.
See `humanize-calibration.md` - the override is deliberate and it is the difference between this voice and
a generic one.

---

## Structural inventory of a post

A long-form piece in this voice runs roughly:

1. **Stake opener.** 1-2 paragraphs. What I did, what broke, what I am trying to work out.
2. **Contract line.** What the reader gets, where the authority comes from, optional `tl;dr`.
3. **The received view.** What everyone does, stated fairly and specifically, with named tools.
4. **Where it breaks.** The core of the piece. Numbers, failure modes, named systems.
5. **What worked instead.** Mechanism, tradeoffs stated asymmetrically, code or commands.
6. **Reference block.** Tables, rules, commands. Structured on purpose.
7. **What I'd do differently / the lessons.** Short, honest, sometimes still unresolved.
8. **The law.** One or two lines.
9. **Footnotes.**

A short piece is 1, 2, 4, 8, 9.

---

## Wiki voice is a different voice

The knowledge repo is not the blog and must not be written like it.

> "This section of my knowledge repo houses my notes and insights from various AWS Certifications I've gotten over the years. It chronologically traces my journey from the foundational AWS Certified Cloud Practitioner, to the more specialized AWS Certified ML Specialty, and finishes with details of MLOps using Ray."

> "Welcome to my Knowledge Repo - It's supposed to be a a collection of notes, insights, and resources that I've gathered over my years of academic and professional exploration."

Note the second one has a typo ("a a") that has survived on the live site, which tells you the
register: notes-to-self, published. Not copy-edited into marketing.

**Published notes are timeless.** Two rules follow, and both were learnt the hard way:

- **Never narrate the source.** No "the original page says 256 KB, which is wrong", no
  `[correction]` callouts, no "these notes flatten X". The reader did not see the source and
  gains nothing from a diff against it. State the fact that is true, and let the footnote carry
  the evidence. Where a wrong figure is *widely* repeated, that is worth one clause - "the
  commonly cited date of 1999 traces to a single conference slide" - because it helps the reader
  recognise the error elsewhere. Never because it is what the draft used to say.
- **Strip every transcription artefact.** Margin notes, `[transcription note]`, `*[inferred]*`,
  the author's own crossings-out, "the rest of the page is blank". These describe a physical
  object. Keep what was kept, drop the apparatus. Highlighter can survive as emphasis, because
  emphasis is a published thing; "this was highlighted on paper" is not.

Wiki voice rules:

- **Definitional and impersonal in the body.** The concept, then its properties. The first
  person appears only in section intros, explaining provenance ("these are my notes from...").
- **One concept per page.** Deep hierarchy over long pages.
- **Keep the note's structure.** Bullets, nesting, arrows, tables and diagrams are the point.
  Do not convert a note into flowing prose. This is the opposite instruction to the blog.
- **A one-paragraph orientation at the top of each section index**, saying where the notes came
  from and what they cover.
- **Cross-link freely.** A wiki earns its keep through links.
- **No stake required.** A wiki page does not need a story and should not manufacture one.

---

## Register boundaries

Things this voice never does, at any length:

- Marketing register. No "seamless", "robust", "powerful", "game-changing", "revolutionise".
- Engagement bait. No "Thoughts?", no "Agree?", no rhetorical-question openers stacked for
  intrigue.
- Meta-commentary about the writing. No "In this article we will explore", "Let's dive in",
  "Without further ado", "In conclusion".
- Fake balance. Tradeoffs are stated asymmetrically because real tradeoffs are asymmetric.
- Definitions of terms the audience already knows.
- Exclamation marks in the blog body. The wiki tolerates one, with an emoji, in a section
  intro. The blog does not.
- Explaining the joke, the diagram, or the number after giving it.

---

## Making this Lakshya's voice instead of Shav's

This file is a scaffold. The structural rules (1-5, 7-9, 11 and the British English table) are
general craft and should stay. The exemplars are borrowed and should not.

After three or four published pieces, do this:

1. Take the published pieces and run `humanize`'s writer-profile distillation (protocol step 0)
   over them: sentence-length pattern, word-choice level, paragraph openers, punctuation
   habits, recurring phrases, transition style. Produce 5-10 specific hypotheses.
2. Replace the quoted exemplars in fingerprints 1, 2, 10 and 11 with Lakshya's own sentences.
   Those four are where personal voice actually lives.
3. Keep the shav.dev exemplars for 3, 4, 5, 8 and 9. Those are conventions, not voice.
4. Add a fingerprint for anything Lakshya does that Shav does not.

The tell that this has worked: a reader who knows both sites can tell the posts apart.
