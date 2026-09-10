# General Engineering

Status: living reference

Audience: maintainers, reviewers, and coding agents

## Purpose and precedence

This is the normative core for substantive engineering work. It owns the reusable principles; specialized references describe only their domain consequences.

Defaults never replace a deliberate local contract. Resolve conflicts in this order: the latest explicit user decision, the current system's contracts and documented invariants, this reference, then implementation convenience.

Preserve enough reasoning to revisit a material decision: observed problem, constraints, authority and invariants, alternatives, implementation or migration path, evidence obtained, and remaining uncertainty. Generated code is a proposed implementation within that context, not evidence by itself.

## Complete the smallest useful behavior

Prefer a coherent vertical slice over disconnected components. Completion means the requested externally meaningful behavior is connected through every applicable contract, state transition, runtime path, failure policy, signal, verification layer, runnable artifact, and owning document.

This is scope-sensitive. A narrow change need not create unrelated infrastructure or documents. State precisely what works, what evidence exists, and what remains external. Compilation is not implemented behavior; implementation is not production readiness.

Specialized references define the evidence or artifact their domain contributes. They do not create independent, cumulative definitions of feature completion.

Treat the slice boundary as a decision, not a license to touch everything nearby. Include a contract, migration, artifact, or document when the requested behavior depends on it; otherwise leave the neighboring concern alone and record the limitation only if it affects the claim. A small internal refactor may need focused tests and no new deployment shape, while one new public endpoint may need routing, schema, authorization, OpenAPI, runtime smoke, and README changes because those are all parts of that behavior.

## Separate authority, durability, projection, and delivery

For a stateful path identify:

- the authority that may decide and mutate;
- the source of truth and exact durability boundary;
- rebuildable projections and caches;
- disposable delivery or notification paths;
- how missing or stale derived state is detected and repaired.

An acknowledgment must name its milestone. Receiving bytes, validating a command, committing authority, publishing a durable event, completing a projection, and notifying a client are different facts.

A fast path may lose data only when loss is deliberate, bounded, observable, and recoverable. Convenience does not turn a cache, notification, or client projection into authority. Important operations and events should carry stable identities; construct idempotency at the domain boundary instead of assuming transport-level exactly-once behavior.

Durable delivery and disposable notification solve different problems. A durable log or authoritative row must survive the failures named by its contract and support replay or reconciliation. A notification may optimize latency and disappear, but it cannot be the only record of a state-significant fact unless the product explicitly accepts permanent loss. A projection improves reads but remains derived even when most traffic never reaches the authority.

## Prefer recoverable atomicity

Atomic behavior means the externally meaningful transition remains coherent across failure, not that unrelated systems share a global transaction. A common safe shape is:

1. validate authority and preconditions;
2. durably record the owned transition;
3. acknowledge the declared milestone;
4. materialize projections and notifications;
5. retry derived work with the same identity;
6. reconcile partial progress after restart.

Use transactions, outboxes, append-only commands, compare-and-swap, epochs, leases, fencing, or monotonic versions when the failure consequence justifies them. Partial progress must be discoverable and safely resumable or repeatable.

## Isolate failure and bound resources

Assume multiple processes, replicas, nodes, and partial dependency failures unless the product explicitly requires a singleton.

- Separate admission of new work from completion of accepted work.
- Prefer make-before-break replacement for a healthy live path.
- Fence stale owners when more than one actor could finalize the same state.
- Let acceleration failures remove only the capability they own.
- Make degraded modes explicit; they must not masquerade as normal capacity.

Every queue, payload, batch, wait, child process, goroutine or task, retry loop, and in-flight operation needs a bound or lifecycle owner. Backpressure is product behavior: choose rejection, reduced quality, shedding, producer pause, or bounded backlog before memory exhaustion chooses for you.

Local single-instance success does not prove replica safety. For each dependency edge, decide whether its loss rejects new work, interrupts accepted work, returns stale data, or removes an optional capability. A system with separately packaged services but mandatory synchronous availability across all of them still has one effective failure boundary.

## Match retries to the recovery objective

- **Immediate real-time recovery:** latency-critical internal connections may retry without delay when backoff directly harms continuity. Attempts must perform real I/O or yield, time out, honor cancellation, stay concurrency-bounded, and aggregate repetitive signals.
- **Bounded request retry:** synchronous work retries only appropriate transient failures, within attempt and elapsed-time budgets, normally with jittered backoff.
- **Background reconciliation:** repair may continue until convergence, but each sweep is bounded, visible, cancellable, and normally backs off after repeated failure.

Validation, authorization, schema, and configuration failures do not become transient through repetition. Unknown partial outcomes require reconciliation, not blind replay.

## Keep infrastructure behind semantic contracts

Domain behavior should depend on narrow capabilities rather than vendor clients, transport topology, launch details, or hardware APIs. A useful boundary preserves the distinctions callers need, including not found, already exists, invalid input, precondition or version conflict, transient unavailability, and permanent failure.

Separate create from replace when overwrite can destroy data. Make deletion workflow-idempotent. Support local implementations and migration without inventing an abstraction that only renames one library.

## Treat observability as behavior

Critical transitions need enough structured logs, traces, bounded-cardinality metrics, readiness, and domain timestamps to locate delay, loss, rejection, stale state, and recovery. High-cardinality identities belong in logs or traces, not metric labels. Never emit credentials, signing material, or sensitive payloads.

Expected cancellation, disconnect, cache miss, or graceful shutdown is not an error unless it violates a declared transition or loses required work. Telemetry should reveal behavior without becoming the source of business truth or a synchronous dependency of the hot path.

## Own lifecycle and recovery

Every process that owns listeners, leases, assignments, buffered work, child processes, checkpoints, or finalization owns its full lifecycle. Normal shutdown should become unready, stop admission, release or drain bounded work, finalize safe durable state, stop children and loops, close dependencies and telemetry in order, and exit when the budget expires.

Graceful shutdown and crash recovery are distinct. Grace reduces avoidable recovery work; crash recovery cannot depend on it having occurred.

Startup and readiness are also different. Process liveness says the runtime exists; readiness says it can accept its declared new work with required authority and capacity. Optional acceleration may produce an explicit degraded-ready mode, while an unavailable authoritative dependency may keep the process unready. Assign each resource exactly one cleanup owner and make partial startup failure unwind already acquired resources.

## Keep security controls distinct

Network placement, transport security, authentication, authorization, confidentiality, abuse controls, and audit solve different problems. Any omitted control must be explicit and scoped.

Minimize credential scope, lifetime, and distribution. Keep raw credentials out of URLs, logs, events, and ordinary durable state. Separate identity proof from domain authorization. Opaque identifiers resist enumeration; they are not authorization or encryption. Make deletion claims honest about caches, replicas, backups, and provider lifecycles. Add cryptography or global coordination only for a concrete threat or correctness need.

## Build verification evidence by risk

Use the cheapest evidence able to disprove the change, then move toward the boundary where the behavior matters: static checks; focused unit and contract tests; repository-wide tests; race, property, fuzz, or interruption tests; migrations and compatibility; artifact builds; readiness and runtime inspection; then real protocol, browser, hardware, provider, load, soak, or chaos evidence where applicable.

Test failures immediately before and after durability boundaries when state is material. Golden representations protect compatibility but do not prove interoperability with real clients or environments.

Choose evidence by the claim: unit tests for owned logic, integration tests for real adapters and composition, end-to-end tests for user workflows, smoke for the assembled artifact, compatibility tests for version skew, and operational tests for the deployment environment. Failure, race, fuzz, load, soak, and chaos evidence is conditional on the risk rather than a ceremonial checklist.

Report implementation separately from evidence. Name checks that passed, failed, or skipped, the real or substituted dependencies exercised, and externally owned validation that remains.

## Work safely in an existing repository

Read local instructions, architecture, status, and relevant history. Inspect the worktree and preserve unrelated changes. Prefer scoped, reversible assumptions. Add compatibility and migration behavior before relying on durable schema changes. Rebuild or recreate affected local services when authorized and relevant.

External publication, deployment, destructive data changes, and mutation of unrelated systems require task authority. Commit history should be cohesive and follow the user's requested conventions.

Do not hide an unavailable check behind a substitute. An embedded implementation can prove internal behavior and a fake can prove caller policy, but neither proves the external provider, browser, device, network, or production topology. Mark skipped and externally owned evidence explicitly.

## Decision frame

Answer only the rows material to the task, in code or its owning documentation:

| Concern | Question |
| --- | --- |
| Outcome | What externally observable behavior must work? |
| Authority | Who owns the decision and authoritative data? |
| Durability | At what milestone may success be acknowledged? |
| Recovery | What repairs stale state or interrupted work? |
| Identity | What makes retries, replay, or duplicate delivery safe? |
| Concurrency | What prevents stale or competing ownership? |
| Retry | Which recovery class applies? |
| Capacity | What is bounded and what happens at the bound? |
| Lifecycle | How do readiness, drain, shutdown, and crash differ? |
| Observability | How will delay, loss, rejection, or degradation be found? |
| Evidence | Which claims are verified here and which remain external? |

Amend this core only for a repeated cross-cutting need. Keep product topology, vendors, versions, and temporary workarounds in their owning repositories or specialized references.
