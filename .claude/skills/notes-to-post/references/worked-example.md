# Worked example

Run on real material from this repo: `notes/digital/pages/page-12.md`, one page of a 46-page
handwritten system-design transcription. It is chosen because it is the *common* case, not the
flattering one, and because it triages to the wiki rather than the blog.

---

## The raw input

```markdown
## Page 12

### Anti-entropy

- ↳ Propagate changes in the Bg
- ↳ Merkle Tree
  - ↳ Hash each row
  - ↳ Sum up pair of hashes, take hs
  - ↳ Do again, until root value

[ASCII diagram of two Merkle trees, one with differing hashes]

              log time comp. of tree → BFS

### ==→ Quorums - LLR==

Write to W nodes
Read from R nodes

W + R > N

> **[transcription note]** The glyph after `+` is shaped like the author's N
> on the page (`W + N > N`); confirmed by the author as R.

- ↳ Quorum R/w
- ↳ well atleast one node will have latest value

Not strongly consistent → bcz not all nodes consist.
- ↳ Prone to write conflicts

↓

Issues with failed writes, if rollbacks fails
```

---

## Stage 0: Triage

**Destination: wiki.** There is no stake here. Nothing broke, nothing was measured, no decision
was made. It is canonical distributed-systems reference material, transcribed from a lecture or
a book. Writing it up as a blog post would mean inventing an incident, which Stage 2 forbids,
or padding it into a generic explainer that a hundred other sites already have.

**Shape: two wiki pages.** Anti-entropy and quorums are separate concepts and the note already
separates them with an H3. One concept per page.

**What would make it a blog post.** Worth stating explicitly, because the user may want one:
a quorum post needs a system Lakshya ran, a configuration he chose (`N=3, W=2, R=2` and why),
and something that went wrong because of it. That is a `[[NEED:]]` the notes cannot fill. The
right move is the wiki page now, and a blog post later if the incident ever happens.

---

## Stage 1: Claim inventory

**Claims**

1. Anti-entropy propagates changes in the background.
2. Merkle trees are the mechanism: hash each row, hash pairs upward, until a root value.
3. Comparing two trees is logarithmic; traversal is BFS.
4. Quorum: write to W nodes, read from R nodes.
5. `W + R > N` guarantees at least one node in the read set has the latest write.
6. This is not strong consistency, because not all nodes are consistent.
7. Quorums are prone to write conflicts.
8. Failed writes are a problem when rollbacks also fail.

**Anchors**: `W`, `R`, `N`, the inequality `W + R > N`, `log n`, BFS, the two-tree diagram
with hashes 305/506, 119/201, 407, 123/247/472/301/210.

**Stake**: none.

**Structure to preserve**: the ASCII Merkle tree comparison diagram, the arrow hierarchy, the
`==highlight==` on the quorums heading, the transcription note about the ambiguous glyph.

**Holes**
- Claim 3 says "log time comp. of tree" but does not say log of what, or what the comparison
  procedure is beyond "BFS".
- Claim 6 is asserted, not explained. *Why* does `W + R > N` fail to give strong consistency?
- Claim 8 trails off mid-thought. The note ends on "if rollbacks fails" with nothing after.
- "LLR" in the quorums heading is unexplained and may be a transcription artefact.

---

## Stage 2a: Draft with markers

Only the quorums page shown. Note the marker density: this is what an honest draft of a thin
source looks like.

```markdown
# Quorums

A quorum read/write scheme replicates data across `N` nodes. A write is acknowledged once `W`
nodes confirm it. A read queries `R` nodes.

The condition that makes this useful:

    W + R > N

[[ADDED: the following two sentences explain the pigeonhole argument. The notes assert the
guarantee without justifying it.]]
If the write set and the read set together exceed the number of nodes, they must overlap. At
least one node in any read set therefore holds the most recent acknowledged write.

## Not strong consistency

The overlap guarantee is weaker than it sounds. It says one node in the read set *has* the
latest value. It does not say the reader can tell which one.

[[INFERRED: the notes state "not strongly consistent bcz not all nodes consist" without
elaborating. The version-comparison point below follows from the note but is not in it.
Confirm or cut.]]
Without a version or timestamp to compare responses against, the client has no way to
distinguish the current value from a stale one sitting alongside it.

[[NEED: what the notes call "LLR" in the section heading. Possibly a transcription artefact,
possibly an abbreviation used in the source lecture. Cannot resolve from the page.]]

## Failure modes

- **Write conflicts.** Concurrent writes to overlapping but non-identical `W` sets leave
  different nodes holding different values, with no ordering between them.
- **Failed writes with failed rollback.** [[NEED: page 12 ends mid-thought at "if rollbacks
  fails". Page 13 may continue it - check before publishing.]]

## Related

- [[Anti-entropy]] - the background repair process that reconciles these divergences.
```

Five markers on one page from one page of notes. That ratio is normal and it is the point:
the alternative is five confident sentences that nobody checked.

---

## Stage 2b: Research and cite

Invoke `research-cite` with the draft and the inventory.

**Research queue** - four items, which is small enough that clustering into a single subagent is
right. Under three claims this stage runs inline with no subagent at all.

1. `[[NEED:]]` "LLR" in the original heading - unexplained abbreviation or transcription artefact.
2. `[[INFERRED:]]` that the reason quorums are not strongly consistent is the client's inability
   to distinguish stale from current without version metadata.
3. The `W + R > N` overlap guarantee itself - canonical, but the page states it flatly and a
   primary citation costs nothing.
4. "Prone to write conflicts" - is this the failure mode Dynamo names, and what does it call it?

Note what is **not** queued: nothing here is first-hand, because there is no stake on this page.
On a blog post the author's own measurements would be excluded from the queue entirely.

**Ledger that comes back** (illustrative shape, not a real run):

```
SUPPORTED (2)
- W + R > N overlap guarantee → [^1], primary. Dynamo paper §4.5, exact statement.
- Write conflicts under concurrent writes → [^1], primary. Same section, named
  explicitly as the reason for vector clocks.

PARTIAL (1)
- The version-metadata inference. The paper supports the mechanism but does not frame
  it as "why quorums are not strongly consistent". Soften the draft or cite it as
  the reader's own inference rather than the source's.

NOT FOUND (1)
- "LLR". No source located. It is almost certainly a transcription artefact of the
  author's handwriting. Cut the token from the heading and log it.
```

**What that changes in the draft:** footnote `[^1]` gets placed on the `W + R > N` line and on
the write-conflicts bullet. The `[[INFERRED:]]` marker survives as a softened sentence. The
`[[NEED:]]` for "LLR" is resolved by deletion, not by invention - which is the correct resolution
and the one a pipeline without this stage would have got wrong by guessing an expansion.

Page 13 turns out to carry the continuation of the truncated sentence: it opens with "sloppy
Quorums → When cluster goes down" and "Recovery → hinted handoff". That is a source-material
answer, not a research answer, and it resolves the second `[[NEED:]]` for free. Always check the
adjacent pages before queueing research.

---

## Stage 3: Humanise

Barely applies. This is a wiki note, so per `humanize-calibration.md` the structure stays and only the
prose gets touched. The actual edits:

- "The condition that makes this useful" - kept. It is a plain framing sentence, not scaffolding.
- "weaker than it sounds" - kept. Mild voice in a definitional register is fine.
- Checked for US spellings: none present.
- Checked for em dashes: none. The ` - ` in the bold lead-ins is the house style.
- The bold lead-ins under "Failure modes" stay. Reference zone, earned convention.

No burstiness enforcement, no first-person insertion, no closing law. A wiki page that ends on
an aphorism is a wiki page pretending to be a blog post.

---

## Stage 4: Output

**File:** `content/wiki/system-design/replication/quorums.md`

```yaml
---
title: "Quorums"
description: "Read and write quorums, W + R > N, and why it is not strong consistency"
section: "system-design"
order: 12
tags: ["replication", "consistency", "distributed-systems"]
source:
  notes: ["notes/digital/pages/page-12.md"]
---
```

**Gate:** em dashes 0, curly quotes 0, markers 0 in body (all four converted to Gap Report
lines), US spellings 0, front matter valid.

**Gap Report:**

```
## Gap Report

**Added** (connective material, no new facts)
- The pigeonhole justification for why W + R > N forces an overlap. The notes assert the
  guarantee without explaining it.

**Inferred** (derived from the notes, not stated in them)
- That the reason quorums are not strongly consistent is the client's inability to
  distinguish stale from current without version metadata. The notes say only "bcz not all
  nodes consist". Confirm or cut.

**Needed** (holes left open - resolve before publishing)
- "LLR" in the original heading is unexplained. Transcription artefact or abbreviation?
- Page 12 ends mid-sentence at "if rollbacks fails". Check page 13 for the continuation
  before publishing the failure-modes section.

**Needs a source** (probably true, currently uncited)
- None. Everything here is canonical and uncontroversial; a link to the Dynamo paper would
  strengthen the page but nothing asserted requires one.
```

---

## What this example is meant to teach

1. **Most raw notes are wiki material.** The blog is for the subset with a stake in it. Routing
   honestly is the highest-leverage decision in the pipeline and it happens in Stage 0.
2. **Marker density is a feature.** Five markers on a thin page is the pipeline working. A
   confident, marker-free draft from a source this sparse would mean facts got invented.
3. **A hole stays a hole.** "LLR" does not get a plausible expansion. The unfinished sentence
   does not get finished from general knowledge. Both go in the Gap Report and wait.
4. **Stage 3 is nearly a no-op on wiki notes**, and that is correct. Humanising a reference page
   into flowing prose destroys the thing that made it useful.
5. **Research resolves gaps by deletion as often as by citation.** "LLR" got cut, not expanded.
   A pipeline that ran completion and humanisation in one pass would have invented a plausible
   expansion and then written it beautifully.
6. **Check adjacent source pages before spawning a subagent.** Page 13 answered a `[[NEED:]]`
   that would otherwise have gone out to research and come back empty.
