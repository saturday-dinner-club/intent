# General Engineering

Status: living document

Last consolidated: 2026-09-07

Audience: maintainers, reviewers, and coding agents

## 1. Purpose

This reference records a reusable way of designing and delivering software. It deliberately avoids product architecture, repository layouts, service names, technology selections, ports, and current implementation status. Those belong to the system that owns them.

The intent is to preserve how decisions are made when requirements are incomplete, systems fail partially, and implementation evidence differs from operational evidence.

The keywords **MUST**, **SHOULD**, and **MAY** describe defaults. They do not override explicit user direction or evidence from the system being changed.

When guidance conflicts, use this order:

1. the user's latest explicit decision;
2. the current system's contracts and documented invariants;
3. this general engineering guidance;
4. implementation convenience.

### Preserve reproducible reasoning

The reusable result of engineering work is not only the code that happened to work once. Preserve enough context to repeat and revise the decision:

- the observed problem and constraints;
- the authority and invariants that shaped the solution;
- the meaningful alternatives and trade-offs;
- the implementation and migration path;
- the tests and runtime evidence obtained;
- the remaining uncertainty and externally owned validation.

This is especially important for AI-assisted work. Treat generated code as a proposed implementation inside the system's context, not as an unexplained successful roll of the dice. The human or agent continuing the work should be able to understand why the boundaries and mechanisms exist and reproduce the verification path.

## 2. Build complete behavior

Prefer the smallest useful vertical slice over a collection of disconnected components. A feature is complete when its externally meaningful behavior is connected through the relevant contract, state transition, runtime path, failure handling, observability, tests, deployment shape, and documentation.

This does not require doing every possible test or production integration in one change. It requires being precise about which behavior works, which evidence exists, and which validation remains external.

Do not describe code that merely compiles as an implemented system. Do not describe an implemented system as production-ready without the environment, compatibility, failure, and load evidence needed to support that claim.

## 3. Separate truth from acceleration

Every stateful path MUST identify:

- its durability boundary;
- its source of truth;
- any faster but disposable projection or delivery path;
- how a reader detects missing or stale data;
- how the system recovers.

A fast path may be allowed to lose data when loss is expected, bounded, observable, and recoverable from a durable path. A cache, notification channel, in-memory index, or client projection should not silently become authoritative merely because it is convenient to read.

An acknowledgment MUST name the milestone it represents. Receiving bytes, validating a command, durably appending an event, completing a projection, and making a replacement ready are different acknowledgments.

Duplicate delivery is normal. Important commands and events SHOULD carry a stable identity so consumers can be idempotent. Exactly-once behavior should be constructed at the domain boundary where it is needed, not assumed from a transport.

## 4. Prefer recoverable atomicity

“Atomic feature” means the externally meaningful transition remains coherent across failure. It does not mean forcing unrelated systems into a global transaction.

When one operation spans durable state and fast projections, prefer:

1. validate authority and preconditions;
2. durably record the command or state transition;
3. acknowledge the declared durability boundary;
4. materialize caches, indexes, notifications, and other projections;
5. retry projection with the same operation identity;
6. reconcile delayed or partial progress after restart.

Use an outbox, append-only command, compare-and-swap transition, epoch, lease, monotonic version, or another explicit recovery mechanism when it makes the state transition safer. Do not introduce such machinery when the failure has no meaningful consequence.

Partial progress MUST be discoverable. Restart should resume or safely repeat the operation rather than guess whether it happened.

## 5. Design for failure isolation

Assume independently deployed processes, multiple replicas, separate nodes, and partial dependency failures unless the product explicitly requires a singleton.

- Local single-instance development does not establish a production singleton.
- Admission of new work SHOULD be separable from completion of existing work.
- A draining instance stops receiving new work while preserving healthy in-flight work.
- Stale owners MUST be fenced when two actors could publish or finalize the same state.
- Make-before-break is preferred when replacing a healthy path: establish and validate the replacement before retiring the current one.
- Failure of an acceleration dependency SHOULD degrade only the capability for which it is authoritative.

Do not strengthen consistency reflexively. If loose convergence is acceptable and recovery is available, avoid paying the latency and availability cost of strict global coordination.

## 6. Choose retry behavior by recovery objective

There is no universal retry policy. Classify the operation before adding delay.

### 6.1 Immediate real-time recovery

Latency-critical internal connections MAY retry immediately without exponential or fixed-delay backoff when added delay directly worsens continuity.

Each connection or handshake attempt MUST still:

- perform real I/O or yield rather than busy-spin;
- have a timeout;
- honor cancellation and shutdown;
- respect bounded per-peer concurrency and admission limits;
- suppress, sample, or aggregate repetitive logs and metrics.

A prolonged outage MUST NOT silently turn this path into a slow backoff loop when rapid recovery remains the stated objective. Resource protection belongs in bounded attempts, timeouts, and concurrency rather than arbitrary recovery latency.

### 6.2 Bounded request retry

User-facing and synchronous operations SHOULD retry only transient failures, cap attempts and elapsed time, and use backoff with jitter when repeated attempts could amplify load.

### 6.3 Background reconciliation

Background repair MAY continue until convergence. Each sweep remains bounded, exposes progress, and normally backs off between repeated failures so it does not starve foreground work.

Permanent validation, authorization, schema, or configuration failures are not made transient by retrying them.

## 7. Bound resource ownership

Queues, payloads, batches, blocking waits, child processes, goroutines, retries, and in-flight work MUST have explicit bounds or lifecycle ownership.

Backpressure is a product behavior. Decide whether overload should reject new work, reduce quality, shed optional work, pause a producer, or consume a bounded backlog. Do not allow an unbounded queue to make that decision accidentally through memory exhaustion.

Degraded modes SHOULD be visible and deliberately less capable. They must not present themselves as normal capacity.

## 8. Keep infrastructure behind contracts

Domain behavior SHOULD depend on narrow interfaces rather than vendor clients, transport topology, process launch details, or hardware APIs.

An infrastructure boundary is not complete until its error semantics are defined. Callers need to distinguish, when relevant:

- not found;
- already exists;
- version or precondition conflict;
- invalid input;
- unavailable or transient failure;
- permanent failure.

Create and replace operations SHOULD be distinct when accidental overwrite could destroy data. Deletion SHOULD be idempotent from the workflow's perspective even when the underlying provider exposes more states.

Interfaces should enable local implementations, deterministic tests, migration, and alternate providers. Avoid abstraction that merely renames a concrete library without protecting a domain boundary.

## 9. Treat observability as behavior

Logs, traces, metrics, readiness, and graceful lifecycle handling are part of the implementation.

Critical transitions SHOULD expose:

- structured logs with operation, result, relevant domain identities, and error;
- trace spans with causal context across process boundaries;
- bounded-cardinality metrics for latency, throughput, queue depth, rejection, retry, and failure;
- readiness that means the instance can accept its intended new work.

High-cardinality identities belong in logs and traces, not metric labels. Credentials, secrets, signing material, and sensitive payloads MUST NOT be logged.

Cross-process latency often needs both tracing and domain timestamps. Traces explain causality when sampled; timestamps allow end-to-end delay measurement even when no complete trace survives.

Expected cancellation, disconnect, cache miss, or graceful shutdown is not an error unless it violates a declared state transition or loses required data.

Before broad instrumentation, inspect the runtime paths and write down the missing signals. Then make a second pass to implement the selected signals. This avoids noisy instrumentation that still misses the actual failure boundary.

## 10. Own the whole lifecycle

Graceful shutdown applies to every process that owns listeners, leases, assignments, buffered work, child processes, durable checkpoints, or finalization—not only the last writer.

A normal shutdown sequence SHOULD:

1. become unready and stop new admission;
2. notify or release owned assignments when the protocol supports it;
3. drain bounded in-flight work;
4. finalize durable state that is safe to finalize;
5. stop child processes and background loops;
6. close clients, telemetry providers, and listeners in an explicit order;
7. exit when the drain budget expires rather than hang indefinitely.

Shutdown and crash recovery are different paths and both require tests. Graceful shutdown should reduce unnecessary recovery work; crash recovery must not rely on graceful shutdown having occurred.

## 11. Make security boundaries explicit

Network placement, transport security, authentication, authorization, and data secrecy are separate controls. A trusted network may justify omitting one control, but the omission MUST be intentional and documented rather than inferred from convenience.

- Minimize secret lifetime and distribution.
- Keep raw credentials out of logs, events, URLs, and durable records unless storage is their explicit purpose.
- Prefer one-time or narrowly scoped credentials for handoff between domains.
- Separate identity proof from domain authorization.
- Treat opaque identifiers as enumeration resistance, not authorization or encryption.
- Make deletion semantics honest about replicas, caches, backups, and provider lifecycle behavior.

Do not add speculative cryptography or global coordination without a threat or correctness requirement. Preserve extension boundaries when future change is likely, but implement the current security contract completely.

## 12. Verify according to risk

Use the cheapest evidence that can disprove the change, then climb toward the environment where the behavior matters:

1. formatting and static checks;
2. focused unit and contract tests;
3. repository-wide tests;
4. race, property, fuzz, or interruption tests for concurrent and stateful code;
5. migration and backward-compatibility checks;
6. container build and deployment configuration validation;
7. readiness and runtime log inspection;
8. protocol, browser, hardware, external-service, load, soak, packet-loss, or chaos testing where applicable.

Golden compatibility tests freeze wire bytes, schemas, manifests, or reader behavior. They protect evolution but do not replace real external clients and environments.

Tests SHOULD exercise duplicate execution and failure immediately before and after the durability boundary. A happy-path test alone is weak evidence for a distributed state transition.

Report implementation and verification separately. State which checks passed, which were impossible in the current environment, and which remain subjective or operator-owned.

## 13. Work safely in an existing repository

- Read the repository's own instructions, architecture, status, and recent history before changing it.
- Inspect the worktree and preserve unrelated user changes.
- Prefer informed, reversible assumptions that stay within the requested scope.
- Do not expand authority because a broader action would be convenient.
- Update plans and TODO documents when discoveries materially change the work.
- Add migrations and compatibility behavior before relying on durable schema changes.
- Rebuild and recreate affected local services after implementation changes when a local deployment exists.
- Keep resource-heavy unrelated systems stopped during focused local tests.
- Commit cohesive increments according to the user's requested history and timestamp conventions.
- Push, publish, deploy externally, delete data, or mutate unrelated systems only when the task authorizes it.

## 14. Decision frame

Before a substantive design or implementation, answer the questions that matter:

| Concern | Question |
| --- | --- |
| Outcome | What externally observable behavior must work? |
| Authority | Which system owns the decision and data? |
| Durability | At what exact milestone may success be acknowledged? |
| Recovery | What restores missing fast-path state or interrupted work? |
| Idempotency | What stable identity makes repetition safe? |
| Concurrency | What fences stale or competing owners? |
| Retry | Is this immediate recovery, bounded request retry, or background reconciliation? |
| Capacity | What is bounded, and what happens at the bound? |
| Lifecycle | How do start, readiness, drain, shutdown, and crash differ? |
| Observability | How will an operator locate delay, loss, rejection, or stale state? |
| Evidence | Which claims can be tested here, and which remain external? |

Not every task needs a written answer to every row. Every material decision should have an answer somewhere in the implementation or its owning documentation.

## 15. Common failure patterns to avoid

- Treating a cache or notification path as durable by accident.
- Calling transport receipt a durable acknowledgment.
- Retrying every error with one shared backoff policy.
- Adding backoff to a latency-critical recovery loop without measuring the continuity cost.
- Assuming a local singleton proves multi-replica correctness.
- Destroying the healthy path before its replacement is ready.
- Growing an unbounded queue instead of choosing overload behavior.
- Claiming exactly-once behavior without domain idempotency.
- Hiding partial progress so restart cannot reconcile it.
- Adding metrics with unbounded identity labels.
- Treating graceful shutdown as crash recovery.
- Encoding a product-specific workaround as a universal engineering rule.
- Reporting production readiness from compilation or unit tests alone.

## 16. Updating this intent

Prefer a narrow amendment supported by repeated need or evidence. Do not add a universal rule for every isolated incident.

An update SHOULD explain:

- what decision changed;
- why the previous trade-off no longer fits;
- whether the change is a principle, a local product decision, or a temporary workaround;
- what compatibility, migration, or operational consequence follows.

This reference should remain opinionated enough to change decisions and general enough to apply without knowing which repository is open.
