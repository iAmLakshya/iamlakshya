## Page 06

```
        LSM tree

            (O)
           /   \
        (O)    (O) ----- too big ----->        Col1.Txt        Col2.Txt
               /  \                          +----------+    +----------+
            (O)   (O)                        |          |    |          |
      ^                                      |          |    |          |
      |                                      |          |    |          |
      |                                      |          |    |          |
      +---> Most rows                        +----------+    +----------+
                                              |________________________|
                                                          |
                                    Eventually export to colmn
                                          oriented files
```

### → ==Data Serialization Frameworks==

- JSON, XML → human readable
  - ↳ (-ve) lack type annotations
  - ↳ (-ve) overhead
- Use of predefined data schema to reduce size of data
  - ↳ not human readable (Binary)
    - ↳ CPU penalty minor
  - ↳ Protobuf / thrift
- (-ve) What if data changes without us knowing

- Apach Avro → create schema base off the colmn names
  - ↳ Avro Schema DB → use to decode data
    - ↳ ### Reader Schema & Writer Schema

```
        Reader Schema & Writer Schema
                    ↓
        Match based on common fields
                    ↓
        Fill with default value for
              missing data
```

  - ↳ Update schema on the fly
