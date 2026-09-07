# Interfaces and Contracts

Status: living document

Last consolidated: 2026-09-07

Audience: maintainers, reviewers, and coding agents

## 1. Purpose

Use this reference when designing or changing APIs, RPCs, events, schemas, storage adapters, shared libraries, generated clients, or compatibility rules.

An interface is a semantic boundary. It states what another component may rely on without exposing how the current implementation happens to work. A contract includes behavior, errors, time, ordering, ownership, capacity, evolution, and recovery—not only field names or method signatures.

## 2. Assign an owner and source of truth

Every contract MUST have an owning quantum or component responsible for:

- semantic definitions;
- the authoritative IDL, schema, or explicitly designated code declaration;
- compatibility policy;
- version publication;
- deprecation and migration;
- conformance tests;
- security classification and access rules.

Shared ownership usually means no ownership. Consumers may contribute changes, but one owner accepts the compatibility and operational consequences.

The owner MUST designate exactly one source of truth. IDL-first, schema-first, and code-first contracts are all valid when their authority is explicit. Generated artifacts and copied declarations are derivatives; they do not become authoritative merely because consumers import them.

## 3. Model domain operations, not vendor calls

Contracts SHOULD describe meaningful capabilities such as create-if-absent, replace-if-version, append event, acquire lease, list after cursor, or consume token. Avoid interfaces that merely rename a database command, HTTP client, broker call, or SDK method.

A useful boundary:

- lets domain code express intent without knowing the provider;
- preserves the distinctions callers need to recover safely;
- supports a deterministic local implementation or fake;
- permits a future implementation without pretending all providers behave identically.

Do not abstract everything. Introduce an interface where substitution, ownership, testing, failure semantics, or migration matters.

## 4. Keep interfaces cohesive and substitutable

An implementation is valid only if callers can replace another implementation without changing the promised behavior.

- Keep an interface focused on one role.
- Avoid deep inheritance and implicit behavioral coupling.
- Do not add unrelated methods merely because one implementation exposes them.
- Do not split an operation so finely that every caller must reconstruct the same invariant.
- Document concurrency safety, lifecycle ownership, blocking behavior, and resource limits.
- Make zero values, optional values, and missing values unambiguous.

A fake that returns success for behavior the real provider cannot guarantee violates the contract even if it satisfies the type checker.

## 5. Distinguish interaction kinds

Do not use one undifferentiated message or endpoint model for every interaction.

### Commands

A command asks an authority to change state. Define:

- stable operation or idempotency identity;
- authority and preconditions;
- validation and authorization point;
- acknowledgment milestone;
- duplicate behavior;
- conflict and retry semantics;
- observable terminal state.

### Queries

A query returns a view. Define:

- authoritative versus projected source;
- possible staleness;
- pagination and cursor stability;
- filtering and ordering;
- cache behavior;
- not-found and partial-result semantics.

### Events

An event reports a fact that already occurred. Define:

- stable event identity;
- producer and schema owner;
- occurrence time and publication time;
- aggregate or entity identity;
- causal, epoch, or monotonic version when required;
- ordering scope;
- duplicate, delayed, and unknown-field behavior;
- retention and replay expectations.

### Projections and notifications

A projection is derived state and MUST identify its repair source.

Notifications fall into two classes:

- A state-significant notification accelerates awareness of a durable fact. If it may be lost, the recipient needs a way to detect stale or missing state and recover from the authority or durable log.
- A purely ephemeral notification, such as a transient presence pulse or typing indication, MAY be lost without repair when the product contract explicitly accepts its disappearance.

Do not make an ephemeral signal durable by accident. Do not classify a state-significant transition as ephemeral merely because the current transport is lossy.

### Bulk and media data

Large or continuous data paths should not be forced through a control contract designed for small messages. Use a control plane to authorize, locate, negotiate, or signal the data plane, then transfer data through a bounded protocol suited to its volume and latency.

## 6. Define acknowledgment precisely

Avoid bare words such as accepted, sent, stored, or complete. Name the milestone:

- parsed;
- authenticated and authorized;
- accepted into bounded memory;
- durably committed;
- published to a durable log;
- projected to a read model;
- delivered to a disposable notification path;
- applied by a target;
- finalized and externally readable.

If a caller relies on durability, an acknowledgment before the durability boundary is a contract bug.

## 7. Use stable error semantics

Errors are machine-readable outcomes first and diagnostic text second.

Classify errors along independent axes rather than encoding every property into one code:

- **Domain meaning:** invalid input, not found, conflict, failed precondition, or another domain outcome.
- **Retry disposition:** transient, permanent, or unknown until reconciled.
- **Exposure:** safe public detail versus internal diagnostic context.

Define stable domain codes where callers need different actions, commonly:

- invalid input;
- unauthenticated;
- unauthorized;
- not found;
- already exists;
- failed precondition;
- version or ownership conflict;
- rate limited or overloaded;
- unavailable or transient dependency failure;
- deadline exceeded or canceled;
- internal failure.

Error identity must not depend on comparing human text. Wrap lower-level causes without leaking provider internals or sensitive data across the boundary.

Do not infer retryability from whether an error is internal. An internal error may be a transient dependency failure, an unknown partial transition, or a permanent implementation defect. The contract should expose retry guidance only when the authority can state it safely.

For HTTP, use a standard structured problem representation and ordinary status semantics. For RPC or events, provide an equivalent stable code and optional typed details. Keep debugging context in internal logs and traces.

## 8. Make time and ordering explicit

Distributed systems contain several clocks and orders. Contracts SHOULD distinguish the following times when they differ materially for correctness, latency, replay, or presentation:

- when the domain fact occurred;
- when the producer observed it;
- when it was durably stored;
- when it was published;
- when a consumer applied it;
- media or logical time when relevant.

Wall-clock timestamps help merge and presentation but do not alone prove causality or total order. When correctness needs stronger ordering, include an epoch, sequence, expected version, log offset, or domain-specific conflict rule.

Define timestamp precision, timezone, clock-skew tolerance, inclusive and exclusive range boundaries, and behavior for delayed events.

## 9. Bound the wire contract

Specify operational limits as part of compatibility:

- maximum payload and field sizes;
- maximum batch and page size;
- timeout and blocking limits;
- queue or in-flight bounds;
- rate-limit scope;
- compression and decompression limits;
- ordering scope;
- backpressure or overload response;
- cursor lifetime;
- retention and replay window.

Without these bounds, consumers build assumptions that fail only under load.

### Long-lived sessions and streams

WebSocket, WebTransport, media, subscription, and other long-lived contracts need lifecycle semantics beyond an initial handshake. Define, when applicable:

- connection establishment, authentication, capability negotiation, and readiness;
- message or frame boundaries and maximum sizes;
- ownership of heartbeats, idle timeout, and liveness detection;
- ordering and concurrency within one connection;
- normal close, half-close, cancellation, and abnormal disconnect;
- reconnect policy, session identity, resume cursor, and replay window;
- duplicate behavior after resume or retransmission;
- make-before-break replacement when an existing healthy path must survive handoff;
- server drain, client migration, and the point at which new work is refused;
- protocol-version and feature downgrade behavior.

A transport reconnect is not automatically a domain resume. State which session state survives, where it is stored, and which acknowledgment or cursor lets both sides agree on the continuation point.

## 10. Evolve additively, but deliberately

Additive change is the default, not a substitute for policy.

- Preserve existing field meanings.
- Reserve removed field numbers and names where the format supports it.
- Define unknown-field and unknown-enum behavior.
- Use explicit presence when absent differs from a zero value.
- Avoid reusing a field for a new semantic meaning.
- Publish compatibility windows before requiring new behavior.
- Deprecate with an owner, evidence of remaining use, and a removal condition.
- Support mixed-version deployment and rollback across the declared window.

Breaking change may be correct when the old contract is unsafe or misleading. Make the break explicit, version it, migrate in stages, and retain evidence that old consumers are gone.

Use an expand-migrate-contract sequence when persisted data or independently deployed consumers cannot change atomically:

1. expand writers, readers, and schemas so old and new representations can coexist;
2. migrate or backfill durable state with observable progress and restart safety;
3. switch authority only after compatibility evidence exists;
4. retain rollback compatibility for the declared window;
5. contract the old representation after remaining use is disproven.

### Compatibility dimensions

Review compatibility along every dimension material to the boundary:

- **Wire compatibility:** can each side parse and preserve the exchanged representation?
- **Semantic compatibility:** do fields, codes, absence, and defaults retain the same meaning?
- **Behavioral compatibility:** do operations preserve preconditions, state transitions, and duplicate behavior?
- **Operational compatibility:** do size, latency, timeout, ordering, and throughput assumptions still hold?
- **Capability compatibility:** can peers negotiate optional algorithms, codecs, features, and protocol extensions without unsafe downgrade?

A message that still decodes may nevertheless be semantically or operationally incompatible.

## 11. Generate repetitive transport code

An IDL can serve multiple languages and reduce hand-written serialization drift. Automate linting, compatibility checks, generation, and publication.

### Select serialization by workload

Use these project defaults after confirming language support, ecosystem compatibility, schema evolution, payload shape, and measured workload:

- Prefer **Protocol Buffers** when serialization and deserialization costs are both material and a mature, balanced general-purpose contract is needed.
- Prefer **FlatBuffers** when reads and deserialization dominate, and zero-copy or direct field access justifies its builder and object-model trade-offs.
- Prefer [**AntiSerial**](https://github.com/snowmerak/antiserial) for structurally simple objects that require extreme serialization and deserialization performance, when its static tagless layout and stricter evolution rules are acceptable.

AntiSerial's compact and projected representation depends on compile-time schema agreement. Its append-only field evolution, zero-versus-absent semantics, length bounds, generated-language support, and input-buffer lifetime are part of the contract rather than implementation details.

Do not select a binary format from generic benchmark rankings alone. Benchmark representative schemas, field distributions, buffer ownership, generated code, target languages, and end-to-end copies. Wire stability and operational simplicity may outweigh local nanoseconds.

Generated clients and DTOs SHOULD remain transport artifacts. Keep domain decisions, retries, authorization, caching, and workflow policy in handwritten code owned by the relevant quantum.

Version generated packages and schemas together. A repository that regenerates locally but cannot identify the schema version used by a deployed consumer has not solved contract distribution.

Do not require every quantum to update and deploy simultaneously merely because they share generated code.

## 12. Treat adapters and sidecars as boundaries

Adapters translate a stable domain contract to a provider. A sidecar or local helper can also provide cross-language reuse, batching, caching, protocol translation, or specialized computation.

Use a sidecar only when it contributes enough capability to justify:

- another process lifecycle;
- local transport and serialization;
- readiness and version compatibility;
- resource limits and backpressure;
- partial failure and restart behavior;
- deployment and observability cost.

A sidecar that only proxies a readily usable client library is usually moving complexity rather than reducing it.

## 13. Propagate context without coupling internals

Boundary metadata MAY include:

- request and operation identifiers;
- trace context;
- authenticated subject and credential metadata;
- deadline and cancellation where the protocol supports them;
- locale or client capability when semantically required.

Do not place transport context inside durable domain events unless it remains meaningful after replay. Trace context explains one execution; domain identities and timestamps explain the durable fact.

## 14. Test behavior and compatibility

Contract verification SHOULD include:

- provider implementation conformance against the same behavioral suite;
- deterministic fake conformance;
- schema or IDL compatibility checks;
- golden wire vectors where byte or parser compatibility matters;
- old-reader/new-writer and new-reader/old-writer tests;
- capability negotiation and downgrade behavior;
- unknown fields and enum values;
- duplicate commands and events;
- conflict, timeout, cancellation, and partial failure;
- pagination during concurrent mutation;
- maximum-size and overload behavior;
- disconnect, reconnect, resume, duplicate, and drain behavior for long-lived sessions;
- external reference clients where actual ecosystem compatibility matters.

Golden vectors protect a known representation. They do not prove compatibility with real clients, browsers, hardware, or provider behavior.

## 15. Contract review questions

Before approving a boundary, answer:

| Concern | Question |
| --- | --- |
| Ownership | Who defines and versions the semantics? |
| Authority | Who may accept the command or answer the query? |
| Durability | What exact milestone does success acknowledge? |
| Identity | What makes a duplicate safe? |
| Time | Which timestamp or sequence has domain meaning? |
| Failure | Which errors change caller behavior? |
| Capacity | What is bounded and how is overload reported? |
| Evolution | Can old and new versions coexist and roll back? |
| Capability | How do peers negotiate optional features and reject unsafe downgrade? |
| Recovery | How is lost or stale derived state repaired? |
| Evidence | Which tests prove implementations are substitutable? |

## 16. Historical source notes

This reference distills recurring ideas from snowmerak's writings on testable code, interface substitution, structured errors, Protobuf and Buf, project boundaries, architecture quanta, and useful sidecars. Concrete package layouts, old generator versions, and protocol-specific examples remain historical examples rather than universal rules.

Primary source material:

- [에러 처리 in Go](https://github.com/snowmerak/snowmerak/blob/main/content/posts/001_error-handling.md) and [RFC 7807](https://github.com/snowmerak/snowmerak/blob/main/content/posts/029_rfc_7807.md) — stable machine-readable errors separated from diagnostic text.
- [테스트 가능한 코드](https://github.com/snowmerak/snowmerak/blob/main/content/posts/016_testable_code.md) and [Liskov Substitution Principle](https://github.com/snowmerak/snowmerak/blob/main/content/posts/031_liskov_substitution_principle.md) — dependency inversion, cohesive roles, and behavioral substitution.
- [Protobuf with Buf](https://github.com/snowmerak/snowmerak/blob/main/content/posts/025_protobuf_with_buf.md) — one IDL, automated generation, compatibility, and versioned distribution.
- [AntiSerial](https://github.com/snowmerak/antiserial) — a static tagless format for simple high-performance objects with explicit append-only and buffer-lifetime trade-offs.
- [Quantum Modular Architecture](https://github.com/snowmerak/snowmerak/blob/main/content/posts/048_qma.md) — separation of abstract contracts from concrete implementations and composition roots.
- [Sidecar](https://github.com/snowmerak/snowmerak/blob/main/content/posts/050_sidecar.md) — process boundaries that add real cross-language or operational capability.
