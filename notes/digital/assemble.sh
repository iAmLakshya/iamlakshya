#!/bin/zsh
# Rebuild ../SD_SELF_NOTES.md from the per-page transcriptions in pages/.
set -e
cd "$(dirname "$0")"
OUT=../SD_SELF_NOTES.md
{
  echo "# System Design — Self Notes"
  echo
  echo "Digital transcription of \`SD_SELF_NOTES.pdf\` (46 handwritten pages)."
  echo
  echo "- Diagrams are reproduced as ASCII art in fenced blocks."
  echo "- \`==text==\` marks highlighter; \`~~text~~\` marks the author's strikethroughs."
  echo "- \`~~[cancelled, illegible]~~\` marks text the author crossed out that cannot be read."
  echo "  No text the author kept is missing."
  echo "- One word on page 36 is cut off at the edge of the scan; it is filled from"
  echo "  context and tagged \`*[inferred]*\`. It is the only word in this document"
  echo "  that was not read off the page."
  echo "- Pages 12, 17, 18, 21 and 22 were unreadable in the original PDF scan and were"
  echo "  re-photographed; their text comes from those rescans."
  echo
  echo "---"
  echo
  for i in $(seq -w 1 46); do
    f="pages/page-$i.md"
    [ -f "$f" ] || { echo "MISSING page-$i" >&2; continue; }
    cat "$f"; echo; echo "---"; echo
  done
} > "$OUT"
