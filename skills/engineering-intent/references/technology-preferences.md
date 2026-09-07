# Technology Preferences

Status: living document

Last consolidated: 2026-09-07

Audience: maintainers, reviewers, and coding agents

## 1. How to use this reference

This reference records technology choices that either recur across Saturday Dinner Club or have been explicitly selected by its owner. They are defaults that reduce the search space for new work, not mandates to use one stack for every problem.

Choose technology in this order:

1. Define the domain invariants, durability boundary, latency target, recovery path, and operational unit.
2. Reuse a preferred technology when it already satisfies those requirements.
3. Choose something else when it fits better, and record the changed requirements and operational trade-offs.
4. Leave concrete versions, topology, schemas, tuning, and implementation status in the owning quantum.

In this document:

- **Default** means a choice that should be considered first because it is established or explicitly preferred.
- **Conditional** means a choice preferred for a particular workload or boundary.
- **Experimental** means a path whose implementation or extension point exists but is not yet an operational default.

## 2. Languages and runtimes

### Go for authoritative and long-running backend processes

Prefer Go for APIs that own authoritative domain state and transitions, network edges, workers, publishers, and control-plane services. This is especially applicable when a process owns transactions, leases, queues, long-lived connections, or the lifecycle of several dependencies.

Why:

- Single binaries and explicit process lifecycles fit both VM and container deployment.
- Concurrency, bounded queues, worker orchestration, and graceful shutdown remain relatively direct.
- The standard HTTP, context, crypto, and testing packages cover much of the baseline without a large framework.
- A shared runtime and observability facade make operations, review, and incident analysis more consistent across quanta.

Go defaults:

- Prefer the standard library and small, explicit adapters over a large application framework.
- Prefer `sqlc` for typed relational data access while retaining explicit SQL, and `pgx/v5` for PostgreSQL connectivity and pooling.
- Prefer `rueidis` for Redis, `gocql` for Cassandra, `franz-go` for Kafka, and the official Go NATS client/server.
- Let each repository pin its own module and toolchain versions; a currently shared Go version is not a permanent platform contract.
- Vendor dependencies when reproducible release or container builds justify it. A sibling `replace` directive is a local-development convenience, not a deployment contract.

Do not force browser interfaces, specialized codecs, or data-science workloads into Go when another ecosystem fits them better.

### Go or Rust for sidecars and ambassadors

Prefer Go or Rust for sidecars, ambassadors, local proxies, and protocol adapters that run alongside another application and mediate a data or control path.

- Prefer Go when orchestration, concurrent connections, delivery speed, and reuse of existing Saturday Dinner Club clients matter most.
- Prefer Rust when low runtime overhead, strict memory ownership, low-level protocol work, or predictable resource use matters most.
- In either language, treat bounded buffering, backpressure, readiness, drain, and peer-version compatibility as part of the sidecar contract.

### NestJS or FastAPI for stateless and specialized APIs

Not every API needs Go. NestJS or FastAPI is acceptable when a service does not own an authoritative transition and mainly performs lightweight request transformation, composition, or a narrow internal function.

- Prefer NestJS when the TypeScript ecosystem, modular application structure, validation, and composition are useful. Prefer Prisma when it needs relational database access.
- Prefer Python for LLM, data-science, analytics, and model-oriented workers or processors. Prefer FastAPI when such a process needs an HTTP surface.
- Merely accessing a database does not make a service authoritative. If it owns canonical transitions, transactions, and schema migrations, reconsider the Go default and document why another runtime remains a better fit.
- Framework choice does not remove responsibility for idempotency, timeouts, backpressure, observability, outbox behavior, or graceful shutdown.

### TypeScript and Node.js for browser SDKs and frontend tooling

Prefer TypeScript and the Node.js ecosystem for browser SDKs, framework-independent clients and players, demo interfaces, and frontend build tooling.

Why:

- Wire contracts and public APIs can be exposed as types while staying close to actual browser behavior.
- A vanilla core can be wrapped by Svelte, React, or another UI layer without duplicating domain behavior.
- Vite, the TypeScript compiler, Vitest, and jsdom provide a fast build and test loop.

Frontend defaults:

- Implement browser capabilities and SDK cores against the DOM and standard Web APIs first. Publish framework-neutral ESM rather than making a UI framework a required runtime dependency.
- When a framework is genuinely useful, prefer Svelte. Choose React when an existing consumer, component ecosystem, or integration constraint justifies it.
- Keep Svelte and React integration as thin lifecycle adapters or examples. The preference order is **vanilla, then Svelte, then React**.
- Do not let framework state become the authority for a framework-independent core contract.
- Use npm workspaces and one lockfile when related packages and demos share a release boundary.
- Treat Node.js primarily as the build, test, and tooling runtime for browser code; it is not the default server runtime.

### Python managed with `uv`

Use Python when it is the natural fit for automation, data processing, machine learning, analytics, or operational tooling. Prefer `uv` to manage the interpreter, dependencies, lock state, and command execution.

FastAPI is the preferred HTTP layer for Python-based model and data workloads when they need one. Do not infer a broader Python service framework or deployment shape before the actual workload requires it.

## 3. Transactional and embedded state

### PostgreSQL with `pgx` and `sqlc`

Prefer PostgreSQL for canonical relational state whose invariants matter: accounts, sessions, ownership, policy commands, and transactional outboxes.

Why:

- Transactions, unique constraints, row locks, and compare/update operations can protect authoritative transitions within one quantum.
- An outbox can commit with the domain change, removing the loss window between a database write, process failure, and an external broker.
- Multiple workers can share a backlog safely with `FOR UPDATE SKIP LOCKED`.
- Canonical rows and outboxes can rebuild projections and caches after loss.

MySQL is also valid when the workload, operating environment, existing expertise, or ecosystem fits it better. The PostgreSQL preference does not exclude MySQL as an OLTP authority.

`sqlc` is the preferred Go data-access layer even though it is not a runtime ORM. It generates type-safe Go code from explicit SQL and schemas, reducing repetitive binding and scanning without hiding query plans or transaction boundaries. Direct driver use remains reasonable for very small or genuinely dynamic queries; do not distort a query contract merely to fit code generation.

Operational rules:

- Define whether success means an OLTP commit, a durable-log acknowledgment, or completion of a projection.
- Delete or boundedly archive outbox rows after their declared durable handoff. Do not let them accumulate indefinitely.
- Treat backup, point-in-time recovery, migrations, and connection exhaustion as part of choosing an OLTP database.
- Do not treat “multi-primary” as a complete active-active design. Define home shards, fencing, conflict rules, and replication scope per domain.

### OLTP CDC to a durable log and hot projections

Prefer capturing committed PostgreSQL or MySQL changes through CDC, carrying them over Kafka or an equivalent durable log, and materializing query-optimized projections into Redis or Cassandra.

```text
PostgreSQL / MySQL authoritative transaction
  -> transaction-log CDC
  -> Kafka or an equivalent durable change log
  -> idempotent materializer
  -> Redis hot cache / Cassandra read model
  -> latency-sensitive query
```

This pattern keeps write authority in OLTP while avoiding an OLTP or remote-authority round trip on the normal read path. It aims for near-zero serving latency when the projection is current; it does not claim zero propagation delay or immediate consistency.

- Use the committed transaction log as the change source instead of dual-writing from application code to OLTP and a cache or broker.
- Preserve a source coordinate or stable change identity, entity identity, operation, schema version, and any ordering or domain version needed by consumers.
- Make materializers idempotent under duplication and replay. Define tombstone, deletion, and out-of-order handling.
- Bootstrap from a snapshot without gaps between that snapshot and the continuing change log; persist the resume point.
- Measure projection lag, consumer failures, and rebuild progress.
- For queries that require current authority, define an authority fallback, version check, or fail-closed behavior.
- Use Redis for small, bounded hot state and Cassandra for durable read models over large key or time ranges. Do not pretend that they have identical cache semantics.

Kafka is the preferred transport for this pattern, but an equivalent durable log is acceptable when connector compatibility, replay needs, or operational scale call for it. Projections remain replaceable, rebuildable derived state; canonical mutations still pass through the OLTP owner.

### SQLite or Pebble for embedded databases

When one process or node should own local persistence without a separate database service, consider SQLite and Pebble first.

- Choose SQLite for relational schemas, transactions, secondary indexes, ad hoc queries, and mature administration tooling.
- Choose Pebble for ordered key-value access, prefix and range scans, LSM-oriented write patterns, and application-defined encodings.
- Neither provides distributed consensus or multi-node replication. The application lifecycle owns file access, concurrency, backup and restore, corruption recovery, and schema or encoding migration.
- Classify the data as disposable cache, rebuildable projection, or sole durable copy. A sole durable copy requires stronger crash-consistency and recovery evidence.

## 4. Redis

### Redis with `rueidis` for fast projections and short-lived state

Use Redis as an acceleration and coordination layer, not as an automatic substitute for a canonical database. Preferred uses include:

- rebuildable session, policy, or JWKS projections;
- one-time credentials and short authentication ceremonies;
- leases, discovery advertisements, and liveness;
- rate-limit counters and bounded retry receipts;
- very short media hot paths or backlogs;
- Streams commands or outboxes when Redis already owns the relevant workflow state.

Prefer `rueidis` in Go for Redis Cluster discovery and server-assisted client-side caching. A client-side cache contract must cover staleness, invalidation failure, bypass behavior, and authoritative fallback.

Separate Redis deployments when their durability and failure semantics differ. Session projections and security ceremonies, authentication policy and publisher discovery, or control state and media bytes should not be forced into the same persistence, backup, or failure policy.

- Use an appropriate AOF policy and recovery procedure for control or authentication state that must survive loss.
- Persistence may be disabled for media, discovery, or other state that is rebuildable and only accelerates latency.
- Set memory and eviction behavior according to data meaning. `noeviction` exposes overload as an error; it does not provide unlimited capacity.
- Design multi-key atomic operations around Redis Cluster hash slots.

Redis Streams is not a universal replacement for Kafka or a broadcast bus. One consumer group distributes work rather than fanning every item out to every interested consumer. Prefer Kafka when durable replay, many independent consumers, long retention, or large-scale reprocessing dominates.

## 5. Durable logs and real-time messaging

### Kafka with `franz-go` for durable regional event logs

Choose Kafka when messages must survive process loss, independent consumers need their own offsets, and read models such as Cassandra must be rebuildable.

Why:

- Producer acknowledgment can define an explicit durability boundary.
- Partition keys can preserve the required ordering scope while exposing consumer lag and replay windows.
- Durable history can repair a lost low-latency notification path.

Prefer `franz-go` in Go. Derive partition count, replication factor, `acks`, minimum in-sync replicas, retention, and batching from workload and failure objectives. Single-node local Compose values are development fixtures, not production recommendations.

Do not insert Kafka merely for request routing, presence pulses, or short control signals. If NATS is deliberately disposable, a NATS failure after the outbox has obtained a Kafka acknowledgment is normal degradation rather than loss of truth.

### Core NATS for disposable low-latency delivery

Prefer Core NATS for room fan-out, system notifications, request/reply, and discovery signals when latency matters and loss is either product-acceptable or repairable from an authority or history store.

Why:

- A small protocol and subject-based routing keep the real-time path simple.
- Separating it from durable OLTP, Kafka, and Cassandra prevents a NATS failure from corrupting truth.
- Embedding a NATS server is appropriate when fan-out is intentionally part of a Publisher process and shares its lifecycle.

Do not use a queue group for room broadcasts that every interested Edge must receive. Reserve queue groups for competing work where exactly one of several handlers should act.

JetStream is not the default. If delivery itself becomes a durable contract, compare JetStream with Kafka and Redis Streams based on ownership, replay, and operations. Turning every Core NATS miss into a retry backlog can defeat its latency and failure-isolation purpose.

## 6. History, object storage, and search

### Cassandra with `gocql` for large time-ordered history

Conditionally prefer Cassandra for room messages, system events, long-running stream catalogs, and similar data that is written heavily, queried by time range, retained for long periods, or merged across data centers.

Why:

- Domain IDs and time buckets allow large append-oriented histories to scale horizontally.
- Multi-DC replication plus idempotent event IDs can merge events accepted independently by several regions.
- A durable upstream log such as Kafka permits replay while a Cassandra writer is unavailable.

Rules:

- Do not choose Cassandra for relational transactions or small canonical control state.
- Design partition keys, clustering keys, bucket sizes, and retention from the intended queries.
- Define deterministic merge order, such as `(occurred_at, event_id)`, and use idempotent upserts.
- State whether retention is indefinite or implemented through TTL or a reaper. Validate tombstone and compaction behavior before large-scale deletion.

### S3-compatible object storage behind a semantic interface

Use object storage as the durable authority for large immutable media or objects, hidden behind an application-level storage interface. The current production default is the AWS SDK for Go v2 against S3 or an S3-compatible service; local development uses a filesystem implementation.

Why:

- Object lifetime is decoupled from application processes, and a CDN can read directly from storage.
- The interface can preserve create-only `Put`, explicit `Replace`, range reads, ETags, and conditional requests.
- A deterministic local adapter keeps ordinary tests fast while provider-specific failure behavior remains in an integration suite.

The bucket owner must define versioning, replication, lifecycle, retention, and deletion according to cost, legal, and recovery requirements. Stream media currently assumes no S3 versioning, series-level deletion, and post-live part cleanup; do not generalize that policy to every object class.

### BM25 and vector search

Treat a search index as a rebuildable query projection rather than a canonical source. Materialize document versions and deletions idempotently from OLTP CDC or a durable event log. Version analyzers, embedding models, and index schemas, and define rebuild plus alias-swap procedures.

| Search requirement | Preferred technology | Selection criterion |
| --- | --- | --- |
| Embedded BM25 or full-text search | Bleve | Small single-node or process-local index that does not justify a search cluster |
| Shared or distributed BM25/full-text search | OpenSearch | Multiple producers or consumers, shards, replicas, aggregations, and centralized operations |
| BM25 plus vector hybrid search | OpenSearch | Lexical and vector scores should share one query and operational boundary |
| Vector-only search | Qdrant | Nearest-neighbor search and vector filtering dominate, without a full-text requirement |
| Distributed vector search within an existing OpenSearch estate | OpenSearch | One search platform is operationally preferable to a separate vector database |

The normal default is **OpenSearch for hybrid search and Qdrant for vector-only search**. Consider Bleve or OpenSearch for BM25, and give OpenSearch and Qdrant high priority for vector workloads.

- A Bleve index is embedded, so the application owns its single-writer rules, files, lifecycle, backup, and rebuild.
- OpenSearch and Qdrant are external cluster dependencies; define readiness, timeouts, bulk backpressure, shard or collection sizing, and degraded-query behavior.
- An analyzer, tokenizer, or embedding model is part of the semantic contract. Do not mix revisions silently within one index.
- Validate relevance, recall, latency, and resource cost against a representative query set. Engine selection alone does not prove search quality.

## 7. APIs, wire formats, and transports

### HTTP and JSON

Prefer HTTP with bounded JSON for public or control APIs used by browsers or humans. Define body limits, unknown-field handling, single-value decoding, structured errors, timeouts, caching, and idempotency along with the endpoint.

An internal HTTP endpoint is still a trust boundary. When private-network access is the selected control, document that deployment requirement and prevent the endpoint from reaching public ingress. mTLS is not a mandatory default for every internal hop; choose it from the actual threat model and operating capability.

Whenever practical, terminate external TLS at Nginx, Caddy, or an equivalent edge reverse proxy or load balancer, then use plain HTTP over a controlled private application network. There is no global preference between Nginx and Caddy; select by certificate automation, dynamic discovery, configuration complexity, and operating environment.

- Remove untrusted incoming `Forwarded` and `X-Forwarded-*` values at the edge, or overwrite them with trusted values. Applications should trust proxy metadata only from configured proxies.
- When scheme, host, client address, or request identity affects authorization, redirects, cookies, or auditing, make its forwarding contract explicit.
- Use backend TLS or mTLS when a shared or untrusted network, cross-region link, regulation, or threat model requires confidentiality or peer authentication. Edge termination does not override that requirement.
- Prevent health checks and internal service ports from being exposed accidentally through listener binding and network policy.

### Protocol Buffers, gRPC, and Buf

Prefer Protocol Buffers and gRPC for typed internal control RPCs, streaming command or watch APIs, and generated clients across languages. Prefer Buf for schema linting, breaking-change checks, and reproducible generation.

Do not force an entire high-volume data plane through gRPC. A system may use generated gRPC for control while moving media through bounded framed TCP and encoding only the frame header with deterministic Protobuf.

Follow [interfaces-and-contracts.md](interfaces-and-contracts.md) when choosing among Protobuf, FlatBuffers, and AntiSerial by serialization workload.

### WebSocket and WebTransport

WebSocket is the current compatibility and operational default for bidirectional browser sessions. The same application protocol may also be implemented over WebTransport, but keep it experimental until browser and proxy compatibility plus a meaningful performance benefit are demonstrated.

Transport changes must not silently change event identity, authentication, acknowledgment, resume, duplicate, or backpressure semantics.

## 8. Media technology

This section applies to Stream-family work rather than general services.

### FFmpeg as the execution engine, Go as the orchestrator

Use FFmpeg child processes for codec and hardware-acceleration execution rather than implementing codecs directly. Let Go own admission, assignment, process lifecycle, framing, queues, retry, metrics, and recovery.

Why:

- NVENC, Intel QSV, and Apple VideoToolbox can be handled through one testable execution boundary.
- Codec implementation and distributed orchestration can evolve and fail independently.
- One process per rendition can prevent one stalled output from blocking every other rendition.

Current domain defaults are AV1-first video, AAC-LC audio, CMAF/fMP4 LL-HLS, 200 ms parts, and one-second segments. H.264 remains an ingress and compatibility extension. Probe real decode, scale, and encode capability at startup; an advertised backend name is not evidence that execution works. CPU fallback cannot promise real-time throughput or full quality, so limit it explicitly to an emergency rendition.

### Shaka Player

Prefer Shaka Player for browser LL-HLS, VoD, and DVR. In Stream Lab it produced more stable DVR continuity, live-edge tracking, and LL-HLS consumption than hls.js.

Keep Shaka behind a framework-independent TypeScript core. Connect React and Svelte through thin lifecycle adapters. Treat source replacement, destruction, asynchronous teardown, autoplay policy, codec support, and target-device testing as part of the wrapper contract.

This is a decision for the current AV1/AAC HLS requirements, not a universal conclusion for every media product.

## 9. Identity and cryptography

Current Accounts-family preferences are:

- Argon2id with a per-account random salt and root-derived pepper for password verification.
- An HMAC-derived lookup key separated from an XChaCha20-Poly1305-encrypted original for searchable email identity.
- TOTP or Passkey/WebAuthn for MFA, with user verification required.
- DBSC device proof as the browser session-extension authority where supported; do not treat it as a fallback refresh token.
- Ed25519 plus JWKS distribution for current internal AcT and RfT signing.
- An opaque signature profile on the wire rather than embedding implementation algorithm names into domain semantics, preserving room for ML-DSA, Falcon, or another reviewed algorithm.
- File-mounted secrets, label-derived subkeys, explicit zeroization, `memguard`, and the Go protected-secret facility where supported for root and private signing material.

Follow [security.md](security.md) and the Accounts-owned contract for concrete parameters, key lifetimes, migrations, and threat models. Cryptographic agility does not mean arbitrary runtime algorithm selection or permissive downgrade.

### Prefer the BLAKE family for new internal hashes

When an external standard or wire protocol does not mandate an algorithm, prefer the BLAKE family for new internal hashing. Choose between BLAKE2 and BLAKE3 based on maintained implementations in the target language, interoperability, keyed-mode needs, streaming or parallel workload, and digest lifetime.

- Typical uses include content identity, deduplication, cache-key derivation, and high-throughput integrity fingerprints.
- Version the algorithm and digest length in persisted data or wire contracts so values can be migrated or recomputed.
- Do not replace protocol-mandated SHA-family uses such as JWT/JWK thumbprints, WebAuthn, or HMAC-based external contracts arbitrarily.
- Continue to use a purpose-built password KDF such as Argon2id for passwords.
- Do not confuse non-cryptographic checksums such as CRC32C with security hashes, and do not replace them with a more expensive hash when accidental-corruption detection is the actual requirement.

This preference guides new work; it does not require an immediate migration of existing stored values or protocols.

## 10. Observability

### A zerolog facade with OpenTelemetry

Go services use the shared `github.com/saturday-dinner-club/log` facade for structured JSON logs and OpenTelemetry for traces and metrics.

Why:

- Domain code does not depend directly on zerolog or exporter details.
- JSON stdout, an optional bounded rotating file, and trace/span correlation share one field policy.
- W3C trace context and OTLP/HTTP connect requests across quantum boundaries while allowing each deployment to choose its collector and backend.

Prometheus, Grafana, Tempo, Loki, and the OpenTelemetry Collector form a useful current observability stack, but are not mandatory backends for every deployment. Each quantum owns domain metrics, cardinality, payload redaction, dashboards, and alert thresholds.

## 11. Build, deployment, and local development

The current operational baseline is an independently runnable process on a VM, with the same artifact also suitable for containers.

- Give each command or process its own Dockerfile and health/readiness contract.
- Use Docker Compose to run one quantum and only its necessary dependencies for local integration.
- Keep ordinary development independent of every neighboring quantum through contract-compatible fakes, stubs, and pairwise tests.
- Kubernetes is not a required deployment platform. If introduced, it must preserve process lifecycle, storage ownership, and failure boundaries rather than obscure them.
- Nginx or Caddy may provide edge TLS termination, routing, and DNS re-resolution, but never becomes a business authority.
- Use Hugo for content-first sites and Vite for interactive applications or demos when those shapes fit.

Graceful shutdown, bounded drain, dependency-aware readiness, and telemetry flush are part of the runtime choice. A started container is not necessarily ready to receive assignments.

## 12. Verification tools and evidence

Preferred tools should support both fast local disproof and validation at real dependency boundaries.

- **Go:** `go test ./...`, focused concurrent or stateful tests, `go vet`, and deterministic fakes.
- **TypeScript:** compiler build/lint, Vitest, jsdom, and framework lifecycle tests.
- **Protocols:** generated-code freshness, Buf lint and breaking checks, golden vectors, and old/new compatibility tests.
- **Infrastructure:** Docker Compose smoke tests, process-kill or HA smoke tests, dependency outage, and recovery checks.
- **Media, browsers, and hardware:** synthetic tests followed by the actual FFmpeg build, GPU, OBS, Shaka, and target browser or device.

A local single-node Kafka, Redis, Cassandra, or PostgreSQL test proves application wiring, not production high availability. Report implementation evidence separately from operational validation.

## 13. Avoid false inferences

Do not elevate incidental evidence into a global standard:

- React is used by Stream Lab but is not a required framework for SDK cores. Svelte is preferred when a framework is needed.
- Svelte compatibility examples do not make framework coupling acceptable; vanilla browser implementations still come first.
- Nginx and Caddy are interchangeable edge TLS and proxy choices rather than one globally mandated product.
- Docker Compose image versions and single-node topologies are reproducible development fixtures, not production recommendations.
- The absence of Kubernetes reflects a VM-first priority, not a permanent prohibition.
- Implementing WebTransport does not mean it has replaced WebSocket.
- One quantum's persistence or retention setting does not automatically apply to another Redis deployment, bucket, table, or data class.
