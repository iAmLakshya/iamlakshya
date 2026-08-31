---
name: research-cite
description: >
  Research the claims in a draft and return sourced, numbered footnotes in the shav.dev style.
  Fans out parallel research subagents, one per claim cluster, each returning a structured
  citation record with a verbatim quote, a fetched URL and a verdict (supported, partial,
  contradicted, not found) rather than prose. Never writes body text and never invents a fact.
  Use when the user asks to research, source, cite, fact-check, add footnotes or add references
  to a draft or a set of notes; when a draft carries [[NEED:]] or [[SOURCE?:]] markers; or as
  the completion stage of the notes-to-post pipeline. British English throughout.
---

# Research and cite

Takes a draft or a claim inventory. Returns footnotes. Does not touch the prose.

This skill is the **completion** stage. It is deliberately separate from humanisation, because
the two have opposite failure modes: completion fails by inventing facts, humanisation fails by
sanding off voice. Running them together lets a polished sentence launder an unsourced claim.

---

## Hard rules

1. **This skill never writes body prose.** It returns citation records and footnote bodies. The
   caller decides what goes in the article.
2. **A claim is sourced only if a subagent fetched a page and quoted it verbatim.** A search
   result title is not a source. A remembered fact is not a source. A plausible URL is not a
   source.
3. **`NOT FOUND` is a valid, final answer.** Never upgrade it. Never substitute a weaker source
   and present it as the claim's citation. An unsourced claim goes back to the caller as a gap
   and either gets cut or gets softened to what the evidence supports.
4. **`CONTRADICTED` is the most valuable result.** Surface it loudly. The draft is wrong and the
   whole point of this stage is to catch that before publishing.
5. **Never adjust a number to match a source, or a source to match a number.** Report both and
   let the caller decide.
6. **British English in footnote bodies.** Quoted material keeps its original spelling.

---

## Procedure

### Step 1: Build the research queue

From the draft or inventory, collect every item needing a source:

- Every `[[SOURCE?:]]` and `[[NEED:]]` marker.
- Every external claim: a benchmark, a statistic, a dated event, a standard, a paper, a
  product behaviour, an attributed quote, anything phrased as "X is known to..." or "research
  shows".
- Every borrowed framing or phrase that came from someone else. shav.dev footnotes these
  explicitly: *"the phrase 'prediction, provocation and reality' is theirs"*.

Do **not** queue the author's own first-hand claims. "Our agent activated on background noise"
needs no citation, it needs the author. If a first-hand claim carries a number the author
cannot confirm, that is a `NEED`, not a research task.

State the queue length before fanning out. If it is zero, say so and stop.

### Step 2: Cluster and fan out

Group the queue into clusters of 3-6 related claims that share a likely source. One subagent
per cluster. **Launch them all in a single message so they run concurrently.**

Sizing: aim for 3-6 subagents. Under 3 claims total, do the research inline rather than
spawning anything. Over ~8 clusters, tighten the clustering instead of spawning more; a queue
that large usually means the draft is asserting more than it needs to.

Use `general-purpose` subagents (they have WebSearch and WebFetch). Give each one this brief,
filled in:

```
Research these claims and return citation records. Do not write prose.

CLAIMS
1. <claim, verbatim from the draft>
2. ...

RULES
- A claim is SUPPORTED only if you fetched a page and can quote the exact sentence
  carrying the figure. Search snippets do not count. Fetch the page.
- Prefer the primary source. If you find the claim in a blog post citing a paper, go
  fetch the paper. Record which one you actually read.
- If the source contradicts the claim, or gives a different figure, say so. That is the
  most useful thing you can return.
- If you cannot source it, return NOT FOUND. Do not substitute an adjacent claim you
  did find. Do not soften the claim so a weaker source fits it.
- Never state a figure you did not read on a page you fetched.

RETURN, one record per claim, nothing else:

CLAIM: <the claim as given>
VERDICT: SUPPORTED | PARTIAL | CONTRADICTED | NOT FOUND
SOURCE: <title>, <author or publisher>, <publication date>
URL: <the exact URL you fetched>
TYPE: primary | secondary
QUOTE: "<verbatim sentence from the page carrying the figure>"
FIGURE: <the number/date/fact as the source states it>
NOTE: <one line: any discrepancy with the claim, scope limit, or caveat. "None" if clean.>
```

### Step 3: Verify before trusting

Subagents hallucinate URLs and quotes under pressure to return something. Before accepting the
batch:

- **Spot-check by fetching.** Pick the two records carrying the most load-bearing figures and
  re-fetch their URLs yourself. Confirm the quote is on the page.
- **Reject any record with a `QUOTE` that does not contain the `FIGURE`.** That is the signature
  of a fabricated citation.
- **Reject `TYPE: primary` on a blog or news URL** unless the blog is the primary source (a
  release announcement on a company blog is primary; a summary of a paper is not).
- If a record fails, re-run that one claim with the failure named, or mark it `NOT FOUND`.

A batch where every claim came back `SUPPORTED` deserves more scepticism, not less.

### Step 4: Write the footnotes

Number in **first-appearance order in the body**, not queue order.

The shav.dev footnote is a small paragraph, not a bare link. The shape:

> **[Source name]** - [what it is, one clause]. [Which specific figures came from it, with the numbers]. [Optional: a caveat, or an acknowledgement of borrowed phrasing.]

Verbatim examples from shav.dev:

> "**Technovelgy** - an index of inventions and ideas from science fiction, each tagged with the originating story, author, and year. Stats from the Not Boring compilation of it in this Google Sheet: 3,746 entries, 966 of which have been built."

> "**Imperial Tech Foresight** - horizon scans of the possible, plausible, and probable futures of technology, and the seed material for the core catalogue. See in particular the Table of Disruptive Technologies (100 potentially disruptive technologies across five themes) and Automated Futures, a celestial-sphere map of how AI tools and techniques link together - the phrase 'prediction, provocation and reality' is theirs."

Rules that follow from those:

- Name the source in bold, then say what it *is*. A reader should know whether to click before
  they click.
- State which figures in the post came from it. This is the part most footnotes skip and it is
  the part that makes them trustworthy.
- Link inline in the prose of the footnote, not as a trailing bare URL.
- One footnote per source, even when it supports four claims. Merge, do not duplicate.
- Spaced hyphen ` - `, never an em dash.
- Where the post borrows someone's phrasing or framing, say so.

### Step 5: Return

Return exactly three blocks. No summary of the research process.

**1. Footnotes**, ready to paste, numbered, in body order:

```markdown
[^1]: **Source name** - what it is. The figure it supports, as stated: 3,746 entries.
      [Link text](https://example.com/page)
```

**2. Inline marker placements** - for each footnote, the sentence in the draft it attaches to,
quoted, so the caller knows exactly where `[^n]` goes.

**3. The citation ledger** - every claim, with its verdict:

```
## Citation ledger

SUPPORTED (n)
- <claim> → [^1], primary, exact figure match.

PARTIAL (n)
- <claim> → [^3]. Source says 24 years median, draft says "about 25". Adjust the draft.

CONTRADICTED (n)
- <claim> → source states the opposite. FIX OR CUT BEFORE PUBLISHING.
  Draft: "..."  Source: "..." <url>

NOT FOUND (n)
- <claim> → no source located. Cut it, attribute it to the author's own experience,
  or soften to what can be shown.
```

Empty sections get "None". Never omit a section. `CONTRADICTED` and `NOT FOUND` are the
deliverable; the supported ones are just bookkeeping.

---

## When the caller is `notes-to-post`

This runs as **Stage 2b**, after the draft exists and before humanisation.

- Input: the Stage 2 draft plus the Stage 1 claim inventory.
- Output: footnotes, placements and ledger.
- The caller merges the footnotes, resolves `CONTRADICTED` and `NOT FOUND` items, and folds
  any survivors into the Gap Report.
- Then, and only then, Stage 3 humanises. Footnote bodies get a light pass at most, per
  `notes-to-post/references/humanize-calibration.md`; they should stay dense and factual.

Run this stage even when the draft has no markers. A draft that asserts nothing external is
either genuinely first-hand, which is fine and rare, or it is stating received wisdom as if it
were observation, which is worth catching.
