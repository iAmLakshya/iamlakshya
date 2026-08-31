"""Mechanical style gate for notes-to-post.

Counts the devices that survive a humanisation pass. An earlier version measured only
sentence-length variance and passed a corpus that three forensic checks then graded
"Likely AI" - because sentence burstiness was high while *paragraph architecture* was
templated in 14 of 22 paragraphs. This version measures both.

Usage:  python3 .claude/skills/notes-to-post/scripts/style-gate.py [glob]
Default glob: content/wiki/system-design/*.md

Budgets are per ~2,000 words and scale with file length. A breach is not automatically a
bug - it is a prompt to look. Zero breaches with zero variance is its own failure mode,
which is why the architecture columns (shortest/longest paragraph, closers, flat3) are
printed for every file whether or not it breaches.
"""
import pathlib, re, sys, statistics as st

BUDGET = {  # per ~2000 words
    "pseudo_cleft": 1, "rather_than": 2, "count_announce": 0, "announce_colon": 4,
    "ic_semicolon": 0, "spaced_hyphen": 2, "em_dash": 0, "banned": 0,
}
BANNED = ["delve","leverage","utilise","utilize","robust","comprehensive","streamline","foster",
"facilitate","seamless","pivotal","nuanced","multifaceted","tapestry","testament","harness",
"unlock","empower","elevate","realm","myriad","plethora","furthermore","moreover","crucial",
"it is important to note","in today's","at the end of the day","in conclusion","under the hood",
"it is worth noting","worth noting that","the real question is"]

PSEUDO = r"\b(is what|is where|What [a-z]+ (?:does|charges|makes|buys|gives) is|is the part|is doing the work)\b"
COUNT  = r"\b(Two|Three|Four|two|three|four) (reasons|things|ways|shapes|problems|moves|implementations|optimisations|anomalies|properties|leaks|steps)\b|\bin (two|three) ways\b|\bthere are (two|three)\b"
ANNOUNCE = r"\b(is the fix|is what keeps|does all the work|is the part worth|The useful framing|Walk the sequence|The solution is|is doing the work here|follows the cost)\b"

def zones(s):
    """Prose only. Everything stripped here is a zone the budgets do not govern:
    frontmatter, code, footnote definitions, tables, figure markers, headings, inline
    code spans, and the trailing Related list whose ` - ` separators are list syntax
    rather than sentence punctuation. Counting those produced false breaches."""
    s = re.sub(r"^---\n.*?\n---\n", "", s, flags=re.S)
    s = re.sub(r"```.*?```", "", s, flags=re.S)
    s = re.sub(r"^\[\^\d+\]:.*?(?=\n\n|\Z)", "", s, flags=re.S | re.M)
    s = re.sub(r"^\|.*$", "", s, flags=re.M)
    s = re.sub(r"<!--.*?-->", "", s, flags=re.S)
    s = re.sub(r"\n## Related\n.*?(?=\n## |\Z)", "\n", s, flags=re.S)
    s = re.sub(r"^#{1,6} .*$", "", s, flags=re.M)      # heading colons are not reveals
    s = re.sub(r"`[^`\n]*`", "CODE", s)                # `y - x` is a minus, not a pivot
    s = re.sub(r"^>.*$", "", s, flags=re.M)             # quoted source material
    return s

def paras(b):
    out = []
    for p in b.split("\n\n"):
        p = p.strip()
        if len(p.split()) < 25: continue
        if p.startswith(("#", ">", "-", "*", "|", "[^")): continue
        out.append(re.sub(r"\s+", " ", p))
    return out

def sents(p):
    return [x.strip() for x in re.split(r"(?<=[.!?]) +", p) if len(x.strip().split()) > 1]

rows = []
GLOB = sys.argv[1] if len(sys.argv) > 1 else "content/wiki/system-design/*.md"
for f in sorted(pathlib.Path().glob(GLOB)):
    raw = f.read_text(); b = zones(raw); P = paras(b)
    w = len(b.split()); scale = max(1.0, w / 2000)
    m = {
        "pseudo_cleft": len(re.findall(PSEUDO, b)),
        "rather_than": len(re.findall(r"\b(rather than|instead of)\b", b)),
        "count_announce": len(re.findall(COUNT, b)),
        "announce_colon": len(re.findall(r"[a-z][^.\n]{0,60}:\s", b)),
        "ic_semicolon": len(re.findall(r"[a-z], ?[^;\n]*;\s+[a-z]", b)) + len(re.findall(r"\w;\s+(the|it|its|they|a|an|getting|CDC)\b", b)),
        "spaced_hyphen": len(re.findall(r"\S - \S", b)),
        "em_dash": b.count("—"),
        "banned": sum(1 for x in BANNED if re.search(r"\b" + re.escape(x), b, re.I)),
        "announce_sent": len(re.findall(ANNOUNCE, b)),
    }
    # architecture
    plen = [len(p.split()) for p in P]
    # closer proxy: final sentence <=12 words AND paragraph >=60 words = a landing beat
    closers = sum(1 for p in P if len(p.split()) >= 60 and len(sents(p)[-1].split()) <= 12) if P else 0
    flatruns = sum(1 for i in range(len(plen) - 2) if max(plen[i:i+3]) - min(plen[i:i+3]) <= 20)
    rows.append((f.stem, w, len(P), min(plen or [0]), max(plen or [0]), closers, flatruns, m, scale))

print(f"{'file':30}{'words':>6}{'par':>5}{'shortest':>9}{'longest':>8}{'closers':>8}{'flat3':>6}  budget breaches")
bad = 0
for stem, w, np_, mn, mx, cl, fr, m, scale in rows:
    br = []
    for k, lim in BUDGET.items():
        allow = round(lim * scale) if lim else 0
        if m[k] > allow: br.append(f"{k}={m[k]}>{allow}")
    if m["announce_sent"]: br.append(f"announce_sent={m['announce_sent']}")
    if cl > round(2 * scale): br.append(f"closers={cl}>{round(2*scale)}")
    if mn > 40: br.append(f"no short para (min {mn})")
    if mx < 120: br.append(f"no long para (max {mx})")
    if br: bad += 1
    print(f"{stem:30}{w:>6}{np_:>5}{mn:>9}{mx:>8}{cl:>8}{fr:>6}  {'; '.join(br) if br else 'ok'}")
print(f"\n{bad}/{len(rows)} files breach a budget")
