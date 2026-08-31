# Writing the expansion prose

Stage 2a guidance. Read this before drafting, not after.

Everything here was learnt by writing 27,000 words the wrong way, having three independent
forensic readers grade it "Likely AI, high confidence", and rewriting it three times. The point
of this file is that the third version should have been the first.

---

## The one test

Before writing a sentence, and again after: **would a person explaining this to a colleague have
said it this way, or is this shaped?**

The reader who commissioned this work pointed at one line and said "this is such an AI tone":

> "A hit is a lookup in memory, one hop away at worst."

Nothing in it is wrong. All of it is assembled. A definitional clause, a comma, then a
compressed qualifier that exists for cadence. "at worst" carries almost no information; it is
there so the sentence finishes neatly.

What it became:

> "A cache hit is a memory lookup. A miss pays for that lookup anyway, and then for everything
> the cache was supposed to prevent: parsing the query, walking the index, reading pages off
> disk, sending the result back, and writing the value in on the way out."

Longer. Plainer. Says more. **Length is not the enemy; shape is.**

Keep that pair somewhere visible while drafting. A concrete before-and-after calibrates far
better than any list of banned words, and it is the single most effective instruction found in
this whole exercise.

---

## The tics, with the archetype for each

Each of these was found in the drafts. They are what an LLM reaches for by default.

**Compressed flourish.** A terse qualifier doing rhythm rather than meaning: "at worst", "if
that", "and no more", "or worse", "once", "every time". Delete it and check whether the sentence
lost a fact. Usually not.

**Definition, comma, verbless appositive.**
> "A **sparse index** stores one entry per block, one entry per key being far too many."

The reason is real, the construction is for cadence. Say it with a verb: "...because storing one
entry per key would make the index far too large."

**Aphoristic paragraph closer.** A quotable line that restates what the paragraph already
established. "Compaction is the bill for cheap writes." "The error is one-sided." Most can simply
be deleted. Better, replace with the explanation they were standing in for: one-sidedness became
"When the filter says no, the key is genuinely absent and the read stops there without touching
disk. When it says yes, the key is probably present but might not be."

**Bare adjective fragment plus coordinate.** "Rare, but used." "Cheap, and no coordination."
"Slow, and it puts a distributed transaction on the write path." Punchy once, a template four
times. Give it a subject and a verb.

**Chiasmus and balanced antithesis.** "A schema tuned for the scan is tuned against the write."
The repetition is what the sentence is built around. Real trade-offs are asymmetric: "Designing
the schema for fast scans makes the writes worse, and designing it to spread the writes makes
the scans worse."

**Contorted brevity.** Word order twisted to save words. "Missing costs that same lookup,
wasted, plus the whole expense it was meant to avoid." "Widening means the page size" (the
subject and predicate do not agree). Unpick it and let it be longer.

**Count and pattern announcements.** "Three things could be sent to a replica." "Sorting is
doing the work here." "That assumption does all the work." Telling the reader a point is coming
before making it. Just make it.

**Connective standing in for punctuation.** A list introduced by "so" or "and then" where the
logic does not follow. Usually a colon or a full stop was wanted, or a dash.

**The glossary run.** Six consecutive `**Bold term.**` definition paragraphs render a glossary
as prose. One or two genuine first-use definitions are fine. A run is a template.

---

## The distinction that matters

The tic is engineered **emptiness**, not engineering as such.

These were flagged and correctly left alone, because removing the construction would cost a fact:

- "LRU here is a sample and not an ordering"
- "A predicate lock is a condition and not an address"
- "gives every shard an equal amount of land and a wildly unequal amount of work"

No regex can tell these apart from the tics above. Do not try to write one. This judgement is the
work.

---

## Punctuation: leave a floor, not a ban

The first two drafts banned em dashes and semicolons outright. Result: **zero of each across
27,000 words**, which a forensic reader identified instantly.

> "The constructions that normally take a dash are all present; the dashes are gone. That is
> displacement, not absence. A writer who genuinely never reaches for a dash also writes fewer
> asides."

Worse, the load fell onto whatever survived. `", so "` fired **once every 113 words** with
*therefore*, *thus*, *moreover*, *furthermore* and contrastive *however* all at exactly zero. A
monoculture that severe is a filter artefact, not a voice.

The floor was then tested and it works. Per file of roughly 2,000 words, aim for:

| | target | was |
|---|---|---|
| em dash | 1-2, where a dash is genuinely right | 0 |
| semicolon | 1-2, where two clauses are truly bound | 0 |
| `, so ` | around 1 per 300-600 words | 1 per 113 |
| however / though / whereas / because / therefore | in ordinary use | near zero |

**Do not fix a monoculture by banning the substitute.** That just moves it again. Fix it by using
the full range so no single connective carries everything.

---

## Paragraph architecture

Sentence-length variance is easy to fake and was faked: the second draft had paragraph-opening
sentences averaging **15.2 / 15.6 / 15.1 words across three unrelated files.** Asking for
variance produces uniform variance.

What actually reads as human is uneven *attention*:

- Some paragraphs stop when the information stops. They do not land.
- Some do two jobs, or wander into an adjacent point and never come back.
- Some sections are thinner than their neighbours, because not everything deserves equal depth.
  Equal treatment of unequal topics is a generator habit.
- Paragraph lengths genuinely range, from under 40 words to over 150.

A warning from experience: a required quota of "at least four flat endings" produced **zero**.
The flat endings the checker counted were pre-existing note stubs the agent had not touched. You
cannot instruct this numerically. You can only write it.

---

## Two things never to write

**Never invent experience.** These both appeared and both had to be cut:

> "this is the thing every HBase operator has been burned by"
> "usually by somebody who has just watched a deleted row come back"

An appeal to lived experience in a document with no first person anywhere. The first one is worse
than it looks: that phrase was in a *brief* as guidance, and came back as an authorial claim.

**So: write briefs in instructions, not in sentences you would be content to see published.**
Brief language leaks.

**Never invent a figure.** No number, date, version, default or benchmark that is not in the
source or verified this session. If you want one you do not have, leave `<!-- GAP: ... -->`.
Research can supply operator-grade facts and it moves the specificity signal a long way. It
cannot supply a speaker.

---

## Protect the human residue

Terse fragments carried over from the source notes look like tells and are the opposite.

> `Very opinionated.` `Those need 2PL.` `Not sufficient.` `Index ⇒ R↑ W↓`

Three forensic readers independently identified these as the most human text in the corpus. One
rewrite agent was right to refuse them: "reading them as AI tells would be a misread; they are
the page's established register."

Leave them. An over-eager pass sands off the only genuinely human writing in the file.

---

## Fix templates everywhere or nowhere

A commercial metaphor appeared in five files. Two instances were removed, and the survivors
immediately read *worse* than before, because they were now visibly the remainder of a template
rather than an incidental figure.

Then, after a full rewrite pass in which every agent removed its own flagged instance, the
metaphor **reappeared in three files in new places**. Three agents, no shared context, each
reached for it again.

Two rules follow:

1. When a construction recurs across files, decide once and apply everywhere in the same pass.
2. Sweep cross-file **after** the per-file work, because the default regenerates. Give every
   agent the cross-file list, not only its own chapter's findings.
