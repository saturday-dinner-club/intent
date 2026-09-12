# General Engineering

Status: living reference

Audience: maintainers, reviewers, and coding agents

## Purpose and precedence

This is the shared core for consequential engineering work. It owns reusable principles; specialized references describe only their domain consequences. It is not a universal release checklist.

Defaults never replace a deliberate local contract. Resolve conflicts in this order: the latest explicit user decision, the current system's contracts and documented invariants, this reference, then implementation convenience.

Preserve enough reasoning to revisit a material decision. Depending on consequence, that may be a short code comment or a fuller record of the problem, constraints, alternatives, path, evidence, and uncertainty. Do not require a formal artifact for a small or reversible choice. Generated code is a proposed implementation within that context, not evidence by itself.

## Match depth to the requested horizon

Start with the user's stated outcome, the repository's maturity, and the consequence of being wrong. Exploration and early MVP work normally optimize for learning with a narrow working path; ordinary delivery preserves existing contracts with focused evidence; production-readiness or audit work justifies broader failure, security, compatibility, and operational treatment.

Do not silently promote a prototype or MVP into a production platform. Vocabulary such as durable, distributed, secure, or observable identifies important design properties, but does not require every possible mechanism or proof in the first slice. Capture only the decisions needed now and briefly name a deferred issue only when it affects use, safety, or the next decision.

The following sections provide questions and techniques to choose from. Apply a section when it changes the design or evidence for the current scope. Do not translate every paragraph into an acceptance criterion, task, document, or test.

## Complete the smallest useful behavior

Prefer a coherent vertical slice over disconnected components. Completion means the requested externally meaningful behavior works at the boundary named by the task, with the contracts and evidence needed for that claim. It does not imply every possible state transition, signal, deployment artifact, or document is production-ready.

This is scope-sensitive. A narrow change need not create unrelated infrastructure or documents. State precisely what works, what evidence exists, and what remains external. Compilation is not implemented behavior; implementation is not production readiness.

Specialized references define the evidence or artifact their domain contributes. They do not create independent, cumulative definitions of feature completion.

Treat the slice boundary as a decision, not a license to touch everything nearby. Include a contract, migration, artifact, or document when the requested behavior depends on it or the repository already treats it as part of the change; otherwise leave the neighboring concern alone. Record a limitation only when it affects safe use or the stated claim. A small internal refactor may need only focused tests. A public endpoint may need routing and authorization now while broader publication or operational evidence waits for the milestone that owns it.

## Separate authority, durability, projection, and delivery

For a stateful path where loss, duplication, or stale decisions have material consequences, identify the applicable distinctions:

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

Use the topology the user or repository actually targets. Do not design for multiple replicas, regions, or failover unless they are in scope or a near-term constraint; when they are, account for partial dependency failures and competing owners.

- Separate admission of new work from completion of accepted work.
- Prefer make-before-break replacement for a healthy live path.
- Fence stale owners when more than one actor could finalize the same state.
- Let acceleration failures remove only the capability they own.
- Make degraded modes explicit; they must not masquerade as normal capacity.

Bound externally controlled, potentially unbounded, expensive, or long-lived work when exhaustion is a credible risk. Prefer existing repository limits for ordinary local work. When backpressure is product behavior, choose rejection, reduced quality, shedding, producer pause, or bounded backlog deliberately.

Local single-instance success does not prove replica safety. When replica safety or dependency degradation is part of the claim, decide how loss affects new and accepted work. A system with separately packaged services but mandatory synchronous availability across all of them still has one effective failure boundary; an MVP may simply state that limitation instead of solving it.

## Match retries to the recovery objective

- **Immediate real-time recovery:** latency-critical internal connections may retry without delay when backoff directly harms continuity. Attempts must perform real I/O or yield, time out, honor cancellation, stay concurrency-bounded, and aggregate repetitive signals.
- **Bounded request retry:** synchronous work retries only appropriate transient failures, within attempt and elapsed-time budgets, normally with jittered backoff.
- **Background reconciliation:** repair may continue until convergence, but each sweep is bounded, visible, cancellable, and normally backs off after repeated failure.

Validation, authorization, schema, and configuration failures do not become transient through repetition. Unknown partial outcomes require reconciliation, not blind replay.

## Keep infrastructure behind semantic contracts

Domain behavior should depend on narrow capabilities rather than vendor clients, transport topology, launch details, or hardware APIs. A useful boundary preserves the distinctions callers need, including not found, already exists, invalid input, precondition or version conflict, transient unavailability, and permanent failure.

Separate create from replace when overwrite can destroy data. Make deletion workflow-idempotent. Support local implementations and migration without inventing an abstraction that only renames one library.

## Treat observability as behavior

Critical production transitions need enough visibility to locate important delay, loss, rejection, stale state, or recovery. Reuse existing logging and telemetry patterns and add the smallest signal that closes a concrete gap; a new feature does not automatically require logs, traces, metrics, readiness, and domain timestamps together. High-cardinality identities belong in logs or traces, not metric labels. Never emit credentials, signing material, or sensitive payloads.

Expected cancellation, disconnect, cache miss, or graceful shutdown is not an error unless it violates a declared transition or loses required work. Telemetry should reveal behavior without becoming the source of business truth or a synchronous dependency of the hot path.

## Own lifecycle and recovery

A long-running process that owns accepted work or external resources should own the lifecycle stages that matter to its current runtime contract. Production services may need readiness, admission stop, bounded drain, finalization, child cleanup, dependency closure, and a shutdown deadline; a local prototype or short-lived command may need only reliable cancellation and cleanup.

Graceful shutdown and crash recovery are distinct. Grace reduces avoidable recovery work; crash recovery cannot depend on it having occurred.

Startup and readiness are also different. Process liveness says the runtime exists; readiness says it can accept its declared new work with required authority and capacity. Optional acceleration may produce an explicit degraded-ready mode, while an unavailable authoritative dependency may keep the process unready. Assign each resource exactly one cleanup owner and make partial startup failure unwind already acquired resources.

## Keep security controls distinct

Network placement, transport security, authentication, authorization, confidentiality, abuse controls, and audit solve different problems. Make an omitted control explicit when its absence could surprise a user, widen exposure, or contradict the stated readiness level; do not require a full threat model for unrelated ordinary work.

Minimize credential scope, lifetime, and distribution. Keep raw credentials out of URLs, logs, events, and ordinary durable state. Separate identity proof from domain authorization. Opaque identifiers resist enumeration; they are not authorization or encryption. Make deletion claims honest about caches, replicas, backups, and provider lifecycles. Add cryptography or global coordination only for a concrete threat or correctness need.

## Build verification evidence by risk

Use the cheapest evidence able to disprove the changed behavior. Focused static checks or tests are often enough for ordinary work. Move toward repository-wide, integration, end-to-end, artifact, real-provider, load, soak, or chaos evidence only when the claim crosses that boundary, the repository expects it, or the user asks for the corresponding assurance.

Consider failures immediately before and after a durability boundary when the consequence is material and the task claims recovery behavior. A focused MVP may test the main durable transition and defer a crash-point matrix. Golden representations protect compatibility but do not prove interoperability with real clients or environments.

Choose evidence by the claim: unit tests for owned logic, integration tests for real adapters and composition, end-to-end tests for user workflows, smoke for the assembled artifact, compatibility tests for version skew, and operational tests for the deployment environment. Failure, race, fuzz, load, soak, and chaos evidence is conditional on the risk rather than a ceremonial checklist.

Report implementation separately from evidence. Name the checks actually run and any material boundary they do not cover. Do not enumerate every test category that was out of scope.

## Work safely in an existing repository

Read local instructions, architecture, status, and relevant history. Inspect the worktree and preserve unrelated changes. Prefer scoped, reversible assumptions. Add compatibility and migration behavior before relying on durable schema changes. Rebuild or recreate affected local services when authorized and relevant.

External publication, deployment, destructive data changes, and mutation of unrelated systems require task authority. Commit history should be cohesive and follow the user's requested conventions.

Do not hide an unavailable check behind a substitute. An embedded implementation can prove internal behavior and a fake can prove caller policy, but neither proves the external provider, browser, device, network, or production topology. Mark skipped and externally owned evidence explicitly.

## Decision frame

Use only the rows that expose a consequential decision. Do not reproduce the table or answer every row by default:

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

Amend this core only for a repeated cross-cutting need. Keep product topology, vendors, versions, and temporary workarounds in their owning repositories or specialized references. The absence of an answer to an immaterial row is not incomplete work.
