# Saturday Dinner Club Engineering Intent

Status: living document

Last consolidated: 2026-09-06

Audience: maintainers, reviewers, and coding agents working across the quanta

## 1. Purpose and authority

This document preserves the intent behind the current architecture. It should answer three questions before work begins:

1. What behavior has already been decided?
2. Which failure and consistency trade-offs are deliberate?
3. What evidence is required before a change is considered complete?

The keywords **MUST**, **SHOULD**, and **MAY** are normative. They describe a default, not an excuse to ignore new evidence.

When sources conflict, use this order:

1. the user's latest explicit decision;
2. the owning quantum's current contract, schema, and architecture document;
3. this cross-quantum intent;
4. implementation convenience.

A local exception is valid when it is documented in the owning repository. A reusable change in direction SHOULD also update this repository. Do not silently reinterpret a deliberate trade-off as unfinished work.

## 2. Product and engineering philosophy

### 2.1 Build a complete path, not disconnected components

Work SHOULD land as the smallest useful vertical slice: contract, state transition, runtime path, failure handling, observability, tests, container, and documentation. A component that compiles but is not connected to its callers and operators is not a finished feature.

“Atomic feature” means the externally meaningful transition is coherent. It does not mean forcing unrelated fast and durable systems into a global distributed transaction. Durable commands, outboxes, idempotency, monotonic projections, and retryable materialization are preferred over pretending that heterogeneous stores commit atomically.

### 2.2 Separate truth from acceleration

Every important path MUST identify its durability boundary and recovery source.

- A durable ACK is meaningful only after the chosen source of truth accepts the operation.
- Redis caches, Core NATS delivery, local process state, and client-side state MAY be lost when their role is acceleration.
- Loss on a fast path is acceptable when the client or service can detect a gap and recover from the durable path.
- Duplicate delivery is normal. Commands and events MUST carry stable identifiers and consumers SHOULD be idempotent.

Fast-path loss is not itself a service-wide failure. Loss of the durable recovery path, inability to make progress, or silent corruption is.

### 2.3 Isolate failure by process, node, region, and dependency

Services are independent processes and SHOULD assume separate VM nodes in production. A local single-instance Compose is a development convenience, not an architectural singleton.

- Stateless services SHOULD scale horizontally.
- Worker admission MUST be separable from existing work: draining a node blocks new assignments while allowing current sessions to finish.
- Queues, payloads, timeouts, and in-flight work MUST be bounded.
- Retriable failures use bounded exponential backoff with jitter where synchronized retries are possible.
- A failed dependency SHOULD degrade only the capability for which it is authoritative.
- Graceful shutdown applies to every process that owns listeners, leases, buffered work, child processes, or durable checkpoints—not only the final writer.

Make-before-break is preferred for reassignment: establish and validate the replacement before retiring the healthy path. Epochs, leases, or compare-and-swap transitions MUST fence stale owners.

### 2.4 Interfaces own infrastructure boundaries

Domain packages MUST NOT expose FFmpeg, Redis topology, Cassandra drivers, S3 SDK types, HTTP frameworks, or a particular hardware encoder. External systems sit behind narrow interfaces with local and test implementations.

The interface contract includes error semantics. For object storage:

- `Put` creates an immutable object and fails when the key exists;
- `Replace` is the explicit mutable operation;
- `Delete` is idempotent from the caller's perspective;
- object keys are opaque identifiers, not authorization or DRM.

### 2.5 Operability is part of the feature

Logs, traces, metrics, readiness, graceful shutdown, migrations, and deployment examples are implementation work, not a later polish phase.

Every critical state transition SHOULD expose:

- structured logs with service, instance, domain IDs, operation, result, and error;
- a trace span with propagated W3C context where a causal request exists;
- bounded-cardinality metrics for throughput, latency, queue depth, retries, rejection, and failure;
- readiness that represents the ability to accept new work, not merely a live process.

Media IDs, room IDs, user IDs, and event IDs belong in logs and spans when useful, but MUST NOT become unbounded metric labels. Credentials, opaque admission tokens, publish keys, private signing material, and sensitive payloads MUST NOT be logged.

## 3. Shared system defaults

### 3.1 Runtime and repository shape

- Go is the default backend language.
- Each quantum MAY be a monorepo containing multiple independently runnable commands.
- Every deployable command SHOULD have its own Dockerfile under `cmd/<service>/Dockerfile`.
- Each quantum SHOULD provide a resource-conscious local Docker Compose that starts only its own dependencies.
- VM deployment is the baseline. Containers MUST remain portable to other schedulers.
- Images SHOULD run as non-root, pin required native tools, and build from vendored Go dependencies when the repository follows the vendoring model.
- Generated protobuf/gRPC code is preferred over handwritten wire facsimiles once a contract stabilizes.

Local Compose files MUST NOT imply that production databases, brokers, or workers run as one replica. Multi-replica correctness belongs in contracts, leases, idempotency, and tests.

### 3.2 Internal communication

Choose transport by semantics:

| Need | Default direction |
| --- | --- |
| request/response control | generated gRPC |
| continuous large media | bounded framed TCP |
| durable ordered work or recovery log | Kafka, Redis Streams, or an outbox according to the owning domain |
| low-latency expendable notification | Core NATS |
| public/browser streaming | HTTP, WebSocket, and optionally WebTransport |

Internal gRPC does not require mTLS in the current trusted network model. Internal control APIs are protected by network access policy. This does not remove authentication or TLS requirements from public account/session boundaries.

An application-level ACK confirms a defined semantic milestone—such as validation, durable append, or replacement readiness—not just receipt of TCP bytes. The milestone MUST be named in the protocol or owning documentation.

### 3.3 Redis

Go services using Redis SHOULD use `rueidis` and server-assisted client-side caching where reads benefit from it.

Redis roles MUST be separated from the beginning:

- **Control/Auth/Policy Redis:** durable control state; AOF is required where Redis is authoritative for recoverable control data.
- **Media/Cache Redis:** disposable hot data; persistence is disabled and durable storage remains the recovery source.

Production assumes clustering. Losing some cluster nodes MUST NOT make healthy shards unusable. Local development MAY use one instance per role. Cross-region Redis policy propagation is allowed to converge loosely unless a specific security transition requires a stricter durable command path.

Redis Streams fan-out semantics must be explicit. A single consumer group load-balances messages; it does not broadcast them. When every interested service must observe an event, use independent consumer groups or independent cursors. Blocking reads make delivery prompt but not magically push-based or exactly-once.

### 3.4 Durable stores and lifecycle

- PostgreSQL outboxes use `FOR UPDATE SKIP LOCKED` for horizontally scaled publishers.
- An outbox row MAY be deleted after the operation's declared durable boundary succeeds. Best-effort fan-out must not keep an already durable row alive indefinitely.
- Cassandra tables SHOULD be query-shaped and time-bucketed for long-running or high-volume histories.
- Event IDs provide deduplication. Timestamps or time-sortable IDs allow independently produced data to merge naturally without imposing a global room leader.
- Deletion and retention jobs SHOULD be restartable, idempotent, bounded, and observable.

Media object storage is expected to be highly reliable, so the synchronous path uses minimal bounded retry. The current publisher-side asynchronous storage backlog is ten seconds. Moving that queue into Redis is explicitly deferred.

Production media S3 buckets MUST have versioning disabled. Media deletion uses ordinary `DeleteObject`; the application does not enumerate historical versions or mutate bucket-level versioning. CDN invalidation is intentionally omitted: cached immutable objects expire according to CDN TTL, which defines the stale-availability bound after origin deletion.

### 3.5 Identity and public security

- One-time cross-service credentials are opaque tokens unless a signed token is explicitly required.
- Public/browser sessions use TLS, `HttpOnly` and `Secure` cookies where cookies are involved.
- DBSC-bound browser sessions are a first-class path: a successful DBSC challenge replaces a reusable refresh-token exchange and serves as ongoing proof of the bound device key.
- Password-only login is not acceptable. Initial login combines password with TOTP or Passkey; Passkey is also an authenticator in its own right.
- OAuth identities are modeled separately and linked to an account. An account MAY exist without a password.
- Accounts owns identity and authentication; domain credentials such as chat admission tokens and stream publish keys belong to their domain services.

## 4. Reliability and state-transition rules

### 4.1 Durable command pattern

When a feature changes durable audit state and a fast projection, prefer:

1. validate authority and preconditions;
2. durably append or commit the command/state transition;
3. acknowledge the durable boundary;
4. materialize Redis, NATS, indexes, or other fast projections;
5. retry materialization with a stable operation/event ID;
6. let readers re-evaluate when a delayed projection arrives.

This is required for moderation and security policy changes whose Redis projection can lag. Temporary movement between regions does not need strict global fencing unless abuse or correctness evidence justifies it.

### 4.2 Retry and idempotency

- Retry only errors classified as transient.
- Use exponential backoff and cap both attempts and total time on request paths.
- Background reconciliation MAY continue indefinitely, but each sweep remains bounded and yields between failures.
- Stable `event_id`, operation ID, epoch, checksum, or expected version MUST make a repeated operation safe.
- Never depend on exactly-once delivery from NATS, Kafka, Redis Streams, HTTP, or a process boundary.
- Partial progress MUST be discoverable so restart resumes rather than begins an unsafe duplicate transition.

### 4.3 Admission, drain, and reassignment

Worker discovery and assignment SHOULD expose capability, capacity, health, draining state, and a lease heartbeat. Redis is an acceptable discovery registry.

- `ACTIVE`: existing and new work allowed.
- `DRAINING`: existing broadcasts or sessions remain; new assignment is rejected.
- expired lease/unhealthy: no new assignment and reassignment may begin.

Reassignment establishes a new epoch. The replacement must reach its declared ready milestone before routing changes. Stale epochs cannot publish or finalize current state.

## 5. Observability conventions

The shared logging implementation lives in the `log` quantum and combines zerolog with OpenTelemetry correlation. Other quanta consume it through the agreed dependency or vendored copy; they SHOULD NOT grow bespoke logging facades.

Required common resource fields include:

- `service.name`
- `service.version`
- `service.instance.id`
- `deployment.environment`
- region, zone, node, or worker identity when applicable

Use one structured event for one state transition. Child-process stdout/stderr is structured with process name and domain context. Expected disconnects and shutdown cancellation are not errors unless data finalization fails.

Cross-process latency SHOULD carry both trace context and domain timestamps. For media, an ingress timestamp allows glass-to-manifest measurement even when sampling omits a complete trace. For durable messaging, producer occurrence time and durable append coordinates distinguish queueing delay from handler time.

Before broad instrumentation, audit the code and maintain a TODO document. Then make a second pass to implement the selected signals. Do not add high-cardinality metrics merely because equivalent log fields exist.

## 6. Testing and delivery discipline

### 6.1 Evidence ladder

A change SHOULD be verified at the cheapest meaningful levels:

1. formatting and static checks;
2. focused unit and contract tests;
3. repository-wide tests;
4. race tests for concurrent state owners, using a container when the host lacks CGO tooling;
5. Compose configuration validation and affected-image clean build;
6. readiness and logs from the deployed local services;
7. protocol, browser, OBS, hardware, soak, packet-loss, or chaos testing when the environment exists.

Do not claim production readiness from unit tests. Clearly separate implementation completion from external compatibility and load evidence.

Golden compatibility suites freeze wire bytes, manifests, event envelopes, and backward-reader behavior. They protect protocol evolution; they do not replace real OBS, browser, GPU, Kafka, Cassandra, Redis Cluster, or object-storage tests.

The user normally performs subjective video/audio and UI QA. The coding agent SHOULD still inspect service logs, queue depth, throughput, manifests, API responses, and container health before handoff.

### 6.2 Change hygiene

- Inspect the current repository and dirty worktree before editing.
- Preserve unrelated user changes.
- Update the plan/TODO document when the task changes scope, then keep it truthful while implementing.
- Use migrations for existing durable schemas; do not assume a fresh database.
- Rebuild and recreate every affected local container after implementation changes.
- Keep resource-heavy quanta stopped when another quantum's local stack is under test.
- Commit cohesive increments during long work. Current project convention places commit timestamps at or after 19:00 Asia/Seoul.
- Do not push unless the user requests it or the current task explicitly includes publication.

## 7. Stream quantum intent

### 7.1 Media path and codecs

- Ingress supports Enhanced RTMP and SRT; OBS is the first-party sender.
- AV1 input and output are the priority. H.264 remains a later compatibility path.
- AAC is the baseline audio codec.
- Continuous media flows `Ingress → Transcoder → Publisher` over chunked, bounded framed TCP.
- Control uses generated gRPC and Redis Streams rather than placing media bodies on a signaling bus.
- Input color characteristics SHOULD be preserved.

The transcoder uses one FFmpeg worker per selected rendition so one slow ladder output does not stall all others. Renditions are configured per publish key. Current guide values are:

| Rendition | Video bitrate |
| --- | ---: |
| 1440p | 10,000 Kbps |
| 1080p | 6,000 Kbps |
| 720p | 2,500 Kbps |
| 480p | 1,500 Kbps |
| 360p | 800 Kbps |

Hardware paths SHOULD support NVIDIA NVENC, Intel QSV/Arc, and Apple VideoToolbox where FFmpeg and hardware permit. Decode and scaling should also use the selected hardware path. If hardware AV1 becomes unavailable, the emergency CPU fallback produces **480p only**, regardless of the requested ladder. It is a degraded continuity mode, not equivalent capacity.

### 7.2 Live packaging and playback

- Target: CMAF LL-HLS with approximately 200 ms parts and one-second complete segments.
- Senders are guided toward CBR and one-second keyframe cadence.
- Live manifests retain about six complete segments; media Redis TTL is approximately 8–10 seconds.
- Sub-two-second latency is aspirational; about four seconds is the realistic service goal under ordinary conditions.
- DRM is not implemented, but object naming, manifests, and storage interfaces should leave an extension boundary.

Playback reads Redis first and falls back to Storage. CDN reads immutable storage objects directly. The framework-independent Shaka-based player is the reference client and must remain usable from vanilla JavaScript, React, and Svelte. Its live default includes a one-second safety delay. A new stream joining the active series may require rebuilding the playback engine while preserving the series-level user experience.

### 7.3 Stream identity and reconnect

Terms are fixed:

- **streamer**: owner identity stored with the publish key;
- **series**: a logical broadcast that may contain multiple stream attempts;
- **stream**: one concrete ingress/transcode/publish attempt with its own ID and codec/init timeline.

A reconnect within five minutes creates a new stream ID and joins the preceding series, even if output settings differ. The first stream ID is normally also the series ID. Boundaries carry discontinuities and new init/config when required. Revocation, force-stop with key deletion, or grace expiry prevents accidental continuation.

### 7.4 Storage, DVR, thumbnails, and deletion

- Complete segments and metadata are durably committed for VoD and time-range manifests.
- Media object names include a random-looking keyed suffix so adjacent sequence numbers cannot be enumerated.
- Thumbnails are generated during transcoding/publishing, stored as history, exposed as latest images, and may be assembled into sprite/VTT previews.
- The player may seek through up to one hour of DVR history and transition smoothly back to live.

Deletion is series-only. Manual deletion and retention first hide the series, then idempotently purge its streams, manifests, media objects, descriptors, and thumbnails. Only final `CLOSED` series qualify; reconnect `GRACE` must finish first. After final close, 200 ms LL-HLS parts are removed while one-second segments remain for VoD. Whole-series automatic deletion is based on `closed_at` and remains opt-in until a retention duration is configured.

## 8. Chat quantum intent

### 8.1 Regional path

Chat is multi-region and multi-DC by design. Each region can accept messages without routing every room through a global home leader.

The durable send path is:

`Edge → regional PostgreSQL outbox → Publisher → regional Kafka → Cassandra projection`

Kafka ACK is the outbox durability boundary. After Kafka succeeds, the outbox row may be deleted. Core NATS delivery is attempted separately and is deliberately best-effort; a NATS failure does not roll back Kafka success.

Embedded Core NATS belongs to the Publisher/Edge fan-out design and MAY share Publisher lifecycle. Redis-based Publisher discovery can advertise the currently reachable fan-out endpoints. Core NATS queue groups MUST NOT be used when every Edge with interested room members must receive an event.

### 8.2 Ordering, history, and recovery

- Messages carry an `event_id` and occurrence timestamp, preferably a time-sortable UUID/ULID representation.
- Cassandra naturally merges independently produced regional data by the declared clustering order.
- Clients and the SDK deduplicate by `event_id`.
- When NATS delivery is missed, history is read from Cassandra; strict NATS recovery is unnecessary.
- Kafka coordinates and ingest timestamps remain useful diagnostics but do not define a mandatory global leader order.
- Cassandra stores chat by default. Optional retention is implemented by a scheduled purge job, not an implicit default TTL.
- `removed_at` is reserved for future deletion/moderation representation; do not invent a separate deletion event until required.

Chat messages on the wire are string envelopes. The envelope describes message/event type and references or embeds the appropriate string payload; image, file, reaction, and other product payloads are not assumed to be one hard-coded chat struct.

### 8.3 Admission and moderation

An internal API creates a one-time opaque admission token containing or referencing user ID, nickname, room ID, role/capabilities, issuer region, and expiry. Token issuance and redemption use a dedicated Auth Redis. Policy/rate-limit state uses a separate Policy Redis from the beginning.

Session resume is owned by a future service-facing Accounts API; Chat does not turn the one-time token into a universal long-lived identity token. WebSocket is the baseline transport. WebTransport is implemented behind the same SDK contract but may remain disabled until it provides a real advantage.

Edge enforces config and per-user overrides for:

- sends per minute;
- temporary send suspension;
- temporary read suspension;
- kick and ban state;
- role/capability thresholds for applying moderation.

Moderation results are broadcast to the room when room-wide visibility is useful. Durable moderation commands/audit state precede Redis policy materialization. Delayed cross-region Redis propagation causes re-evaluation when it arrives. Cassandra stores durable kick/ban history and active-ban query projections. Loose regional convergence is intentional; ordinary user movement does not need a globally serialized handoff.

## 9. Accounts quantum intent

Accounts owns account identity, login, profile, aliases, authentication factors, sessions, and public verification keys. It does not own Chat admission policy, Stream publish keys, Broadcast authorization, or Channel domain rules.

### 9.1 Identity and lifecycle

- Initial password login requires TOTP or Passkey MFA.
- Passkey flows are supported directly.
- OAuth providers are future external identities linked through a separate table; password credentials are optional at the account level.
- Profiles are globally owned by Accounts by default, with explicit service/tenant/room aliases available.
- Account deactivation has a 90-day recoverable period before physical deletion.
- Single logout, all-session logout, and durable logout propagation exist; selecting and revoking one named session is a documented future extension.

### 9.2 DBSC and token signing

For a DBSC-bound browser session, the DBSC challenge/response is the refresh mechanism. Do not issue an effectively unlimited reusable refresh token alongside it. Periodic device-key proof replaces repeated MFA for that bound session; recovery and high-risk policy can still require reauthentication.

Access tokens and fallback refresh tokens use the internal signing system. Signing services:

1. generate Ed25519 keys;
2. register public metadata in Redis with TTL;
3. create and publish a replacement sufficiently before expiry;
4. expose list and lookup through the public-key/JWKS service;
5. retain private material only in signing processes and use protected memory such as memguard where practical.

Algorithm identifiers on internal tokens MUST be an internal opaque mapping rather than exposing implementation names as a permanent domain contract. The registry must allow future ML-DSA, Falcon, or hybrid schemes without changing token consumers' domain logic. Standard JWKS output may still expose standards-required cryptographic fields at the verification boundary.

Limited-region active-active is the target. Sensitive account data is replicated only among selected regions. Home shard, account/session epochs, ownership/fencing, and routing are explicit; “multi-region” must not mean uncontrolled copies in every region.

## 10. Channel and Log quantum intent

### 10.1 Channel

Channel connects an Accounts owner to channel identity, Stream series/streams, and Chat rooms. It is an ownership and catalog layer, not a reason to boot every other quantum in normal tests.

- External quantum clients sit behind narrow interfaces.
- Unit and integration tests use contract-compatible in-process fakes.
- Cross-quantum E2E belongs in an umbrella environment or dedicated CI stack.
- The local Channel Compose starts Channel and its direct persistence only.
- Domain implementation may proceed from agreed contracts even while full infrastructure is unavailable, but production readiness remains unclaimed.

### 10.2 Log

The Log quantum owns the reusable zerolog and OpenTelemetry integration, documentation, correlation conventions, and safe defaults. Consumers may vendor it for reproducible/offline builds. Logging implementation details should move there rather than diverging in every repository.

## 11. Explicit non-goals and deferred work

The following are not accidental omissions:

- Stream H.264 and DRM are extension points, not current priorities.
- CDN deletion uses TTL expiry; vendor invalidation is out of scope.
- S3 media version-aware deletion is out of scope because bucket versioning is disabled by policy.
- The publisher storage backlog is not yet moved to Redis.
- NATS is not made durable merely to avoid designing recovery from Kafka/Cassandra.
- Chat does not impose a global room leader solely for total order.
- Accounts does not mint every domain's credential.
- Channel's default development stack does not boot all quanta.
- Hardware, browser, OBS, multi-region, and failure-isolation claims remain conditional until tested in the corresponding environment.

## 12. Re-entry checklist for a maintainer or coding agent

Before implementing:

1. Read this document and the owning repository's README, architecture, status, and current TODO.
2. Inspect Git status and recent commits; preserve unrelated work.
3. Name the durability boundary, fast path, recovery source, idempotency key, timeout, and retry policy.
4. Check whether the service is multi-instance, multi-node, draining, reconnecting, or replaying—even if local Compose has one replica.
5. Identify which external dependencies need interfaces and fakes.
6. State any material assumption that changes product behavior.

While implementing:

1. Keep the feature vertically connected.
2. Add logs, spans, metrics, readiness, and graceful shutdown at the state-owning boundaries.
3. Bound queues, payload sizes, blocking waits, and retries.
4. Add migrations and compatibility behavior before relying on new schema fields.
5. Test interruption and duplicate execution around the durable boundary.
6. Keep documentation and TODO state accurate as discoveries change the work.

Before handing off:

1. Run formatting, focused tests, full tests, vet/static checks, and relevant race tests.
2. Validate Compose, rebuild every affected image, and confirm readiness plus startup/error logs.
3. Report what was implemented separately from what was actually exercised.
4. List hardware, external service, browser, load, or subjective media checks still owned by the user.
5. Commit a cohesive change after 19:00 Asia/Seoul; push only when requested.

## 13. Updating this intent

Prefer a small amendment over rewriting history. Each update should explain:

- the decision that changed;
- why the previous trade-off no longer fits;
- which quanta and contracts are affected;
- whether data migration, compatibility, or operational rollout is required.

This repository exists to prevent rediscovering the same constraints. It should remain opinionated, current, and short enough to read before making a cross-quantum change.
