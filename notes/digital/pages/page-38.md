## Page 38

Flink snapshots are super <u>lightweight</u>
- ↳ Run in background
- ↳ Allow ensuring that all messages affect state exactly once.
- ↳ Ensures that we don't have to replay every single message in the event of a crash

→ ### ==Search Indexes==

Tokenize → Inverted index (or multiple)

### Prefix searching
- ↳ Keeping tokens sorted gives log time complexities when searching docs
- ↳ Find all doc that have words starting with "c" (eg)

### Suffix searching
- → token → reverse string → inverted index
- ↳ Eg: apple : [10] ← prefix inverted index
  - elppa : [10] ← suffix inverted index
- ↳ Eg. search for fruits ending in "berry"

Both/All inverted indexes are sorted

### ==Apache Lucene==
- ↳ Most popular <u>Opensource search index</u> (1999)
- ↳ Many types of Idxs supported for complicated variants of search (text, numbers, coordinates)
- ↳ Uses an LSM tree variant to support fast doc ingestion
  - ↳ writes to memory first.
- ↳ Meant to be used on single node
