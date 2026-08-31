## Page 12

### Anti-entropy

- ↳ Propagate changes in the Bg
- ↳ Merkle Tree
  - ↳ Hash each row
  - ↳ Sum up pair of hashes, take hs
  - ↳ Do again, until root value

```
              (305)                    V/S                506
             ↗     ↖                                     ↗    ↖
        (119)       407                              201       407
        ↗   ↖      ↗   ↖                            ↗   ↖     ↗   ↖
     123   (247)  301   210                      123    472  301   210
     a=1    b=6   c=3   d=4                      a=1    b=2  c=3   d=4
              \____________________________________________↗

              log time comp. of tree → BFS
```

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
