# Briefing agents for a writing pass

This pipeline fans work out to subagents. Three passes were run over the same corpus. The first
two failed and the third worked, and the difference was almost entirely in the brief.

---

## Quota briefs produce uniformity. Judgement briefs do not.

**Pass 2** gave every device a numeric budget: at most 2 turned closers, at most 1 pseudo-cleft,
at most 4 announcement colons. It also required variance: at least 4 paragraphs ending flat,
paragraph lengths spanning under 40 to over 120 words.

What came back:

- Paragraph-opening sentences averaging **15.2 / 15.6 / 15.1 words** across three unrelated files.
  Asking for variance produced uniform variance.
- **Zero** flat paragraph endings written. The flat endings a checker later counted were
  pre-existing note stubs the agents had not touched. The count was identical at 13 in all three
  files while the turned endings scaled with document length, which is how the checker spotted it.
- Every device sitting at exactly its budget, which is its own signature.

**Pass 3** contained no numbers at all. It said: read each paragraph and ask whether a person
explaining this to a colleague would have said it this way. It worked.

---

## Give one calibration example, not a word list

The most effective single element of the successful brief was a real before-and-after, with an
explanation of *why* the first version was wrong:

> "A hit is a lookup in memory, one hop away at worst."
>
> A definitional clause, a comma, then a compressed qualifier that exists for cadence. "at worst"
> carries almost no information. The sentence is built so that it lands rather than so that it
> explains.

Agents calibrated on that found instances of the same tone that shared no vocabulary with it at
all. A banned-words list finds only what is on the list.

---

## Write briefs in instructions, never in publishable sentences

A facts packet contained the line "this is the thing every HBase operator has been burned by" as
*guidance about what was missing*. It came back in the published prose as an authorial claim about
lived experience, in a document with no first person anywhere.

Brief language leaks. If a sentence in your brief would be at home in the output, rewrite it as an
instruction. Say so explicitly in the brief too: *nothing in this brief is a sentence to reuse.*

---

## Give every agent the cross-file findings, not just its own

After a pass where each agent removed its own flagged instance of a commercial metaphor, the
metaphor **reappeared in three files, in new places**. Three agents, no shared context, each
independently reached for it again.

The tic is a default, not a habit. It regenerates. So:

1. Hand every agent the whole cross-file list, not only its chapter's findings.
2. Sweep the corpus again *after* the per-file pass.
3. Fix a recurring construction everywhere in one pass. Removing two of five instances makes the
   survivors read *worse*, because they are now visibly the remainder of a template.

---

## Tell them what to protect

Agents will "fix" the best writing in the file if you do not stop them. Terse fragments carried
over from source notes look like tells and are the opposite:

> `Very opinionated.` `Those need 2PL.` `Not sufficient.`

Three independent forensic readers named these the most human text in the corpus. One rewrite
agent refused to touch them and was right: "reading them as AI tells would be a misread; they are
the page's established register."

Name the protected material in the brief.

---

## Ask them what they left alone

Every good agent report in this project ended with a "left alone deliberately" section, and those
sections caught real judgement calls: an ACID bold run kept because it is the acronym being
defined term by term rather than a pro/con box; a deliberate sentence fragment kept because the
file needed uneven sentence starts; a paper title kept because "comprehensive" is in it.

Require that section. It is where you find out whether the agent understood the brief or was
pattern-matching it.

---

## Send a reader when the target is tone

For anything a regex can express, use the regex. For tone, do not try.

Measured on this corpus, hunting one tic:

| method | result |
|---|---|
| regex over ten files | 129 hits, almost all false positives |
| an agent reading, given one archetype | 54 real instances, each with a rewrite |

The regex could not separate engineered emptiness from engineering that carries a fact, and no
regex can. That judgement is the work.

---

## Verify with agents that did not write it

The model that wrote the draft is the model checking it, and it will pass its own work. Spawn
adversarial checkers with no knowledge of authorship and an explicit instruction to find fault
rather than reassure.

Blind checkers on this corpus caught: a metaphor repeated across two files in the same structural
slot; a fabricated collective-experience claim; paragraph-opening sentence lengths identical to
within half a word across three files; and a punctuation profile they correctly traced to a
suppression rule living in this very repository.

Two smaller verification habits worth keeping:

- **Spot-check research agents by re-fetching.** They hallucinate URLs under pressure to return
  something. Reject any citation whose quote does not contain the figure it claims to support.
- **Require gap markers.** An agent that cannot source a fact should write `<!-- GAP: ... -->`,
  never a plausible-sounding frame. This worked: four gaps came back across the corpus and all
  four turned out to be researchable.

---

## Do not tune the gate until it agrees with you

`scripts/style-gate.py` counts devices. It had genuine false positives worth fixing: heading
colons, the `## Related` list separator, and `y - x` inside a code span counted as a pivot hyphen.

Fixing those was correct. Continuing past that point was not, and the temptation was real.
Refining a metric until it reports success is how the next fingerprint gets made. Once the gate is
roughly right, stop, and let a reader decide.
