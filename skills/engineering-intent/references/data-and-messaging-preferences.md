# Data and Messaging Preferences

Status: living reference

Apply [technology-preferences.md](technology-preferences.md)'s requirement-first rule. These choices preserve deliberate Saturday Dinner Club defaults while keeping authority, projections, and disposable delivery distinct.

## Transactional and embedded state

Prefer PostgreSQL for canonical relational state and transactional outboxes. In Go, prefer `pgx/v5` plus `sqlc`: explicit SQL and transaction boundaries with generated type-safe bindings. Use direct drivers for genuinely small or dynamic queries. Prefer Prisma for relational access in NestJS. MySQL remains valid when workload, environment, or expertise fits better.

Define whether success is OLTP commit, durable-log acknowledgment, or projection completion. Bound or archive outboxes after declared handoff. Treat migrations, backups, point-in-time recovery, and connection exhaustion as selection concerns. “Multi-primary” is incomplete without authority, fencing, conflict, and replication rules.

Transactions, unique constraints, row locks, and compare/update operations are the first choice for invariants owned by one relational authority. `FOR UPDATE SKIP LOCKED` can distribute an owned backlog among workers, but its ordering and starvation behavior must match the workflow. Keep explicit SQL visible enough to inspect indexes, locks, query plans, and transaction scope.

For local single-process persistence, consider SQLite for relational schemas, transactions, indexes, and ad hoc queries; Pebble for ordered key-value, prefix/range scans, and application encodings. Neither supplies distributed consensus. The application owns file concurrency, backup/restore, corruption recovery, and migration; a sole durable copy requires stronger evidence than a rebuildable projection.

## CDC and projections

For low-latency reads derived from OLTP, prefer transaction-log CDC into Kafka or an equivalent durable log, then idempotent materialization into Redis or Cassandra:

```text
PostgreSQL / MySQL authority -> log CDC -> durable log -> materializer -> read projection
```

Avoid application dual writes. Carry a stable change/source coordinate, entity identity, schema/version, and required ordering. Bootstrap snapshot plus continuing log without gaps, persist resume, define tombstones and out-of-order handling, and observe lag/rebuild. Queries requiring fresh authority need a version check, fallback, or fail-closed policy.

The projection is replaceable even when it is operationally important. Rebuild procedures need bounded scans, checkpoints, idempotent writes, progress, cutover, and capacity protection so repair does not starve live traffic. Near-zero serving latency is a goal for a current projection, not a claim of zero propagation delay.

## Redis

Use Redis for acceleration and short-lived coordination: rebuildable sessions or policy/JWKS, one-time ceremonies, leases/discovery, rate counters, bounded retry receipts, short media hot paths, or Streams when Redis already owns the workflow state. Prefer `rueidis` in Go. Client-side caching must define staleness, invalidation loss, bypass, and authority fallback.

Separate deployments whose durability/failure policies differ. Choose AOF/recovery for control state that must survive; disable persistence for genuinely rebuildable acceleration when appropriate. Set memory and eviction by data meaning; `noeviction` exposes overload, not infinite capacity. Design multi-key atomic work for Cluster hash slots.

Do not mix authentication ceremonies, policy projections, discovery, control state, and media bytes into one Redis failure and retention policy merely because the commands are convenient. A lease or cached session also needs expiry, stale-read, clock, and restart semantics owned by the application.

Redis Streams is not a universal Kafka or broadcast substitute. A consumer group distributes work; it does not fan every item to every interested receiver.

## Durable and disposable messaging

Prefer Kafka with `franz-go` for durable regional logs when messages survive process loss, consumers own offsets, and projections must rebuild. Derive partitions, replication, acknowledgment, in-sync minimums, retention, and batching from workload and failure objectives. Local single-node settings are fixtures, not production defaults.

Partition keys express ordering and parallelism. Consumer lag, replay windows, poison records, schema compatibility, and offset/side-effect atomicity belong to the application contract. A Kafka acknowledgment can be the durable milestone only when topic replication and producer configuration actually satisfy the declared failure model.

Prefer Core NATS and its official Go client/server for low-latency fan-out, request/reply, and discovery when loss is accepted or repaired. Embedding a NATS server is appropriate when the fan-out is intentionally part of a Publisher's lifecycle. Do not use queue groups for broadcasts every Edge must receive. JetStream is conditional: compare it with Kafka and Redis Streams when delivery becomes durable.

If NATS is deliberately disposable, losing a notification after the owned fact reached its durable boundary is degradation rather than corruption. Do not turn every miss into an unbounded retry backlog that defeats the latency and isolation reason for choosing Core NATS.

## History and objects

Conditionally prefer Cassandra with `gocql` for large append-heavy, time-range history or multi-DC mergeable events. Design partition/clustering keys, buckets, TTL/reapers, tombstones, and compaction from queries and retention. Use deterministic merge order such as `(occurred_at, event_id)` and idempotent writes. Do not use it for small relational authority.

A durable upstream log can repair Cassandra after a writer outage. Multi-DC replication does not define domain conflict semantics by itself: preserve event identity, choose the merge order, and state whether regions can accept independent writes for the same entity. Validate large deletion behavior before relying on TTL or broad reapers.

Use S3-compatible storage behind a semantic interface for large immutable objects. The production default is AWS SDK for Go v2; local development uses a filesystem adapter. Preserve create-only put, explicit replace, ranges, ETags, and conditions. The bucket owner defines versioning, replication, lifecycle, retention, and deletion. Stream-specific no-versioning and part-cleanup policy does not generalize to every object class.

Object keys and provider errors should not leak into domain code as the only semantics. Test local adapter conformance and real provider behavior separately, including partial upload, conditional conflict, ranges, cleanup, and lifecycle delay. CDN delivery remains a projection of object authority and needs its own invalidation and stale-content policy.

## Search projections

Search indexes are rebuildable projections. Version analyzers, tokenizers, embedding models, and schema; apply versions/deletions idempotently; define rebuild and alias swap.

| Workload | Preference |
| --- | --- |
| Embedded BM25/full text | Bleve |
| Shared/distributed BM25 | OpenSearch |
| BM25 plus vector hybrid | OpenSearch |
| Vector-only | Qdrant |
| Vector search within an existing OpenSearch estate | OpenSearch |

Bleve makes the process own single-writer files and recovery. OpenSearch and Qdrant require readiness, timeout, bulk backpressure, sizing, and degraded-query behavior. Validate relevance, recall, latency, and cost on representative queries; engine selection alone is not search-quality evidence.

Do not mix analyzer or embedding revisions silently within one logical index. Store document/model versions, rebuild into a new index or collection, compare quality and coverage, then move an alias or routing decision with rollback. Search failure should degrade according to product contract rather than silently becoming authoritative absence.
