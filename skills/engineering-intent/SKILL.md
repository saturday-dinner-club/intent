---
name: engineering-intent
description: Apply a durability-first, failure-aware decision framework when designing, planning, implementing, reviewing, or hardening stateful and distributed software. Use for work involving service boundaries, state transitions, retries, concurrency, recovery, observability, lifecycle, deployment, or completion evidence. Do not use for simple factual answers or purely cosmetic edits.
---

# Engineering Intent

Use these principles to improve decisions without replacing explicit user choices or the repository's established contracts.

## Establish the decision frame

For each material path, identify only the concerns that affect the task:

- externally observable outcome;
- authority and source of truth;
- exact durability and acknowledgment boundary;
- disposable fast paths and their recovery source;
- stable identity for idempotency;
- concurrency fencing or ownership;
- retry class;
- resource bounds and overload behavior;
- readiness, drain, shutdown, and crash behavior;
- observability and available verification evidence.

Do not stop merely because every detail is not stated. Make safe, scoped assumptions when they do not change product behavior, and call out assumptions that materially affect the result.

## Build a vertical behavior slice

Connect the smallest useful behavior through its relevant contract, state transition, runtime path, failure handling, observability, tests, deployment shape, and documentation. Match verification depth to risk; do not expand a focused task into unrelated infrastructure work.

Report separately:

- what was implemented;
- what was exercised successfully;
- what remains dependent on hardware, external services, load, subjective QA, or operator action.

Never infer production readiness from compilation or unit tests alone.

## Separate truth from acceleration

Name the durable source of truth before relying on a cache, notification path, local state, or client projection. Fast-path loss is acceptable only when it is expected, observable, and recoverable.

Treat duplicate delivery as normal. Use stable operation or event identities and make important consumers idempotent. Do not claim exactly-once behavior from transport semantics.

An ACK must correspond to a named milestone. Distinguish byte receipt, validation, durable acceptance, projection completion, and replacement readiness.

## Preserve recoverable atomicity

Do not force heterogeneous systems into a global transaction merely to call a feature atomic. When durable state drives fast projections:

1. validate authority and preconditions;
2. record the durable command or transition;
3. acknowledge the declared boundary;
4. materialize disposable projections;
5. retry with the same identity;
6. make partial progress discoverable and reconcilable.

Use outboxes, epochs, leases, monotonic versions, compare-and-swap, or similar mechanisms only when they address a real failure mode.

## Isolate failures and bound ownership

Assume multiple replicas and separate nodes unless a singleton is explicit. A local one-instance setup is not evidence of singleton semantics.

- Separate new-work admission from existing-work completion.
- Prefer draining over abruptly abandoning healthy work.
- Fence stale owners.
- Prefer make-before-break replacement.
- Bound queues, payloads, blocking waits, attempts, in-flight work, child processes, and background tasks.
- Choose overload behavior deliberately: reject, shed optional work, reduce quality, pause, or consume a bounded backlog.

Keep external providers, transports, persistence clients, and hardware details behind meaningful domain contracts. Define error semantics; avoid wrappers that only rename a concrete library.

## Classify retry behavior

Use one of three classes:

### Immediate real-time recovery

Latency-critical internal connections may retry consecutively with no exponential or fixed-delay backoff. Each attempt must perform real I/O or yield, have a timeout, honor cancellation, and respect bounded concurrency. Sample or aggregate repetitive telemetry. Do not silently slow this loop during a prolonged outage when rapid recovery is the requirement.

### Bounded request retry

User-facing and synchronous paths retry transient errors within attempt and elapsed-time limits. Use backoff and jitter when immediate repetition could amplify load.

### Background reconciliation

Repair and projection loops may continue until convergence. Keep each sweep bounded, visible, resumable, and normally backed off between recurring failures.

Never retry permanent validation, authorization, schema, or configuration failures as if they were transient.

## Make operability part of completion

At state-owning boundaries, add the useful subset of:

- structured transition logs;
- trace context and spans;
- bounded-cardinality latency, throughput, queue, retry, rejection, and failure metrics;
- readiness that represents ability to accept intended new work;
- explicit drain and graceful shutdown ordering.

Keep high-cardinality identities in logs and traces, not metric labels. Never log credentials, secrets, private material, or sensitive payloads.

Expected cancellation, disconnect, cache miss, or shutdown is not an error unless it violates a declared transition or loses required data.

## Verify and hand off honestly

Use the cheapest meaningful evidence first, then expand according to risk:

1. formatting and static checks;
2. focused unit and contract tests;
3. repository-wide tests;
4. concurrency, interruption, migration, and compatibility tests;
5. container and deployment configuration validation;
6. readiness and runtime log inspection;
7. real client, hardware, external-service, load, soak, network, or chaos tests.

Exercise duplicate execution and interruption around the durability boundary when state correctness matters.

Before editing, inspect repository instructions, architecture, history, and the dirty worktree. Preserve unrelated changes. Rebuild affected local services when the repository provides them. Push, publish, externally deploy, delete data, or mutate unrelated systems only when authorized.

## Avoid overgeneralization

Do not turn a product-specific technology, parameter, workaround, or isolated incident into a universal rule. Prefer a narrow amendment supported by repeated need or evidence. Explicit user direction and local documented invariants always take precedence over this skill.
