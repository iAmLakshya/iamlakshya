## Page 01

### Database

- Index ⇒ R↑ W↓ speed

- → ==Hash Indexes==

- h (Key) → Value

- Probing (Key available slot) or Chaining if 2 keys have same value.

- Easy scan for key → O(1) R/W

- Hash map are bad for disk
  - ↳ Values all over the disk
  - → As a result, alway kept in RAM
    - ↳ Expensive
    - ↳ Keys have to fit in RAM
      - ↳ Not durable
  - ↳ No Range Queries.

```
Hash map are bad for disk
 |  ↳ Values all over the disk
 |  → As a result, alway kept in RAM
 |          ↳ Expensive
 |          ↳ Keys have to fit in RAM
 |                        ↳ Not durable
 |                              ↓
 |          Slow  ←—  Repopulate  ←—  (WAL)
 ↳ No Range Queries.
```

```
+-----------------------------------------------------+
| Binary Tree → Invariance → Good for Range Queries   |
+-----------------------------------------------------+
```
