## Page 23

```
                        +-----------+
                        | Name Node |  <---  Metadata store
                        +-----------+

  +-----------+        +-----------+          +-----------+
  | Data Node |        | Data Node |          | data Node |
  +-----------+        +-----------+          +-----------+
                                                    ^
                                        storage ____/
```

### Name node

- ↳ tell us all the replicas and ver. of files on them
- → Keeps metadata in memory
  - ↳ WAL on disk for fault tolerance
- → When the name node starts up, asks each data node which files it contains and replicate if necessary
- → Replicate file on data node if no. of replicas are less

### Reading files

- ↳ We expect to be reading our data for more than it is written
  - ↳ 1. Client ask name node for file location
    2. NameNode responds with best replica for client
    3. Client caches the file location
    4. Read from data node

### Writing Files

- ↳ When picking the location of replica, the name node tries to be rack aware
  - ↳ 1. Client wants to write a file
    2. NN: file will be on A, B, C
    3. NN → Client: Primary: A, Secondary B, tertiary: C
    4. Client writes to DN-A

```
  W ---->  +----------------+  +----------------+
           | DN-A <=> DN-B <-|--> DN-c <=> DN-D |
           +----------------+  +----------------+
                  DC-1                DC-2
```
