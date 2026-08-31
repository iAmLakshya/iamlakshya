# Attribution

`SKILL.md` and `references/research.md` are copied verbatim from
**https://github.com/harshaneel/humanize** (MIT, Copyright (c) 2026 Harshaneel Gokhale).
Full licence in `LICENSE`.

Vendored rather than installed via `./install.sh` so the pipeline has no external setup step.

**Do not edit `SKILL.md`.** Keeping it byte-identical to upstream means it can be refreshed
with a single curl:

```bash
curl -sfL https://raw.githubusercontent.com/harshaneel/humanize/HEAD/humanize/SKILL.md \
  -o .claude/skills/humanize/SKILL.md
```

Project-specific deviations from its defaults live in
`.claude/skills/notes-to-post/references/humanize-calibration.md`, never in this directory.
