# Interfaces and Contracts

Status: living reference

An interface is a semantic boundary: what another component may rely on without depending on the current implementation. Cover behavior, authority, errors, time, ordering, capacity, lifecycle, evolution, and recovery only to the extent they affect the current consumer or compatibility promise. An exploratory private interface can remain explicitly unstable.

## Assign one owner and authority

A maintained or shared contract needs a clear owning quantum or component and one authoritative declaration. Add explicit compatibility, versions, deprecation, conformance, and access classification when independent consumers or lifecycle require them; do not invent each mechanism for a local prototype boundary.

Designate exactly one source of truth. Schema-first, IDL-first, and code-first are valid. Generated and copied declarations remain derivatives and must be reproducible and checked for drift.

## Model domain operations

Describe capabilities such as create-if-absent, replace-if-version, append event, acquire lease, list after cursor, or consume token rather than renaming a vendor API. A boundary should preserve recovery-relevant distinctions, admit deterministic local implementations, and allow migration without pretending providers behave identically.

Keep interfaces cohesive and substitutable. Define concurrency safety, lifecycle ownership, blocking, limits, zero/absent semantics, and stable outcomes. Do not add unrelated methods because one provider exposes them or split an invariant until every caller must rebuild it. A fake that promises behavior the real implementation cannot provide violates the contract.

Create and replace should remain distinct when overwrite can destroy information. Delete should be idempotent from the workflow perspective even if the provider exposes several physical states. Pagination and list operations must not make unstable ordering or private storage cursors into accidental public guarantees.

## Distinguish interaction semantics

Choose the semantics that change caller behavior now. An early internal contract may begin with input, output, ownership, one meaningful success point, and a small error set; add ordering, replay, compatibility, and lifecycle detail as independent consumers or failure consequences appear.

### Commands

Define the authority, preconditions, and acknowledgment meaning needed by the command. Add stable operation identity, duplicate behavior, conflicts, retry disposition, and terminal-state detail when retries or asynchronous completion are part of the contract.

### Queries

Define the source and result semantics the current query exposes. Add staleness, pagination, ordering, cache, and partial-result rules when those capabilities exist.

### Events

Define producer, owner, and the identity needed to consume the event. Add occurrence/publication times, causality, versions, ordering, duplicates, delay, retention, and replay according to the delivery and compatibility promise.

### Projections and notifications

A projection identifies its repair source. A state-significant notification accelerates awareness of a durable fact and needs missing/stale detection plus recovery if lossy. A purely ephemeral signal may disappear only when the product explicitly accepts it. Do not make an ephemeral signal durable accidentally or hide a state transition behind a disposable transport.

### Bulk and media data

Keep high-volume or continuous data out of small-message control contracts. Use the control plane to authorize, locate, negotiate, and signal a bounded data plane suited to the workload.

## Name acknowledgments and errors precisely

State whether success means parsed, authenticated and authorized, accepted into bounded memory, durably committed, published to a durable log, projected, delivered to a disposable path, applied, or externally finalized. An early acknowledgment is a bug when callers rely on a later milestone.

Errors are machine-readable outcomes with optional safe diagnostics. Separate domain meaning, retry disposition, and public exposure. Stable codes commonly distinguish invalid input, unauthenticated, unauthorized, not found, already exists, precondition/version/ownership conflict, overload, unavailable, deadline/cancellation, and internal failure.

Do not compare human messages or leak provider internals. Internal does not imply transient; unknown partial outcomes may need reconciliation. HTTP should use ordinary status semantics and a standard structured problem form; other transports need equivalent stable codes and typed detail.

Preserve lower-level causes for internal diagnosis while exposing only stable safe fields. A caller should know whether to correct input, reauthenticate, retry within a budget, wait for reconciliation, refresh a version, or stop. It should not need to recognize a database message, broker code, or translated English sentence.

## Define time, order, limits, and sessions

Distinguish occurrence, observation, durability, publication, application, and logical/media time where they affect correctness, latency, replay, or presentation. Wall clocks do not prove causality. Use epochs, sequences, expected versions, offsets, or explicit merge rules when stronger order matters. Define precision, timezone, skew, range boundaries, and delayed-event behavior.

Wire contracts include maximum payload, fields, batch/page, timeout, blocking, in-flight work, rate scope, decompression, ordering, overload response, cursor lifetime, retention, and replay window.

Long-lived WebSocket, WebTransport, subscription, media, and streaming contracts also define handshake, authentication, negotiation, readiness, frames, heartbeats, idle timeout, concurrency, close/cancellation, reconnect, session identity, resume cursor, replay, duplicates, replacement/drain, and downgrade. Transport reconnect is not automatically domain resume; say which state survives and how peers agree on continuation.

Make-before-break is appropriate when a replacement session must be proven ready before retiring a healthy one. During server drain, distinguish refusal of new sessions, migration of existing sessions, completion of in-flight messages, and the deadline after which abrupt recovery semantics apply.

## Evolve deliberately

Prefer additive changes: preserve meanings; reserve removed identifiers; define unknown fields and enums; use explicit presence; avoid semantic reuse; publish compatibility windows; assign deprecation owners and removal evidence; support mixed versions and rollback.

When a break is necessary, version and migrate it. For persisted or independently deployed consumers use expand-migrate-contract: allow both representations, backfill with observable restart-safe progress, switch authority after evidence, retain rollback through the declared window, then remove the old path after use is disproven.

Review wire, semantic, behavioral, operational, and capability compatibility separately. Parse success does not prove preserved meaning, capacity, or safe feature negotiation.

- **Wire:** each side can parse and preserve the representation.
- **Semantic:** fields, defaults, absence, codes, and timestamps retain meaning.
- **Behavioral:** preconditions, transitions, idempotency, and duplicate handling remain stable.
- **Operational:** size, latency, timeout, order, and throughput assumptions still fit.
- **Capability:** optional algorithms, codecs, and extensions negotiate without unsafe downgrade.

Deprecation needs an owner, evidence of remaining use, and a removal condition. A breaking change may be correct when the old contract is unsafe or misleading, but compatibility cost must be explicit rather than hidden behind a regenerated client.

## Use OpenAPI for maintained REST contracts

Use an OpenAPI description when a REST API is a maintained integration surface, has independent consumers, generates clients or references, is intended for publication, or the repository already uses OpenAPI. A short-lived prototype or purely local endpoint may begin from code and tests without OpenAPI if its instability is understood. Do not add OpenAPI solely because an internal route exists.

When OpenAPI is the maintained contract or derivative, update it with route and contract changes.

Choose one authority:

- schema-first: OpenAPI owns the contract and generated or implemented artifacts conform to it;
- code-first: declared routes and types own the contract and OpenAPI is generated reproducibly.

Cover applicable servers/base paths, methods and routes, path/query/header/cookie parameters, content types and bodies, success and error responses, schemas, required/default/example/constraint semantics, authentication and authorization schemes, pagination, idempotency, limits, headers, deprecation, and versioning.

Use a version supported by the toolchain and consumers. When practical, serve or publish the document and interactive reference. Parse it in tests, verify route/method parity, validate representative traffic, and detect generated client/server drift. OpenAPI is contract evidence, not decorative documentation.

Project documentation owns publication, discoverability, and synchronized derivatives; this reference owns REST semantics.

## Generate transport code selectively

Automate IDL linting, compatibility, generation, and publication when it reduces cross-language drift. Generated clients and DTOs remain transport artifacts; domain decisions, retries, authorization, caching, and workflows remain handwritten at the owner.

Select serialization by representative schema, language support, evolution, workload, copies, and buffer ownership:

- Prefer Protocol Buffers for a mature balanced general-purpose contract when both serialization and deserialization matter.
- Prefer FlatBuffers when reads and deserialization dominate enough to justify its builder and object-model trade-offs.
- Prefer [AntiSerial](https://github.com/snowmerak/antiserial) for structurally simple objects needing extreme encode/decode performance when static tagless layout and stricter evolution are acceptable.

For AntiSerial, append-only evolution, zero-versus-absent behavior, length bounds, generated-language support, and input-buffer lifetime are contractual. Do not choose a format from generic benchmark rankings or force synchronized deployment because code is generated.

Benchmark representative schemas, field distributions, ownership/copy patterns, generated implementations, and target languages. Wire stability, debuggability, and operational simplicity may outweigh local encode/decode speed. Version schema and generated packages together so a deployed consumer's contract revision can be identified.

## Treat adapters and context as boundaries

Adapters translate stable semantics to providers. Sidecars are justified only by enough cross-language reuse, batching, caching, protocol translation, isolation, or specialized computation to pay for another process, local protocol, compatibility, readiness, limits, partial failure, and observability.

Boundary metadata may carry request/operation IDs, trace context, authenticated subject metadata, deadline/cancellation, locale, or capabilities. Do not persist execution trace context as a substitute for durable identity, occurrence time, causality, or version.

Context propagation is also a compatibility surface. Define which deadlines can cross a boundary, whether cancellation is advisory or authoritative, and whether request metadata survives asynchronous handoff. Do not let transport-specific context objects leak through domain APIs or durable records.

## Verify contract behavior

Select contract evidence that matches the changed promise. Options include common conformance cases, schema/IDL compatibility, representative wire vectors, old/new readers, unknown fields, duplicates, conflicts, deadlines, cancellation, limits, reconnect, negotiation, or a real external client. Do not require the whole matrix for every interface.

Contract-specific review questions are: Who owns and publishes the authority? Which interaction kind and acknowledgment apply? Which stable errors change caller behavior? What are the time, ordering, capacity, and session rules? Can adjacent versions coexist and roll back? Do real and local adapters satisfy the same behavior?
