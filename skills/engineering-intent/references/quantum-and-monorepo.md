# Quantum and Monorepo

Status: living reference

Conceptual source: *아키텍처의 퀀텀*, snowmerak, 2025-07-04.

Use this reference to define or review ownership boundaries, repository scope, internal deployables, logical infrastructure, isolated development, or effective change and failure coupling.

## Define a complete quantum

An architecture **quantum** is the smallest cohesive set of capabilities and owned resources that can be provisioned, deployed, and operated independently as a complete unit.

It may contain several runnable processes, domain logic and authoritative data, logical schemas/topics/buckets/caches, migrations, internal protocols and public contracts, manifests, operational controls, tests, local substitutes, and recovery tools.

One process, repository, or physical database is not automatically one quantum. “Deployed as a unit” means the declared capability can be brought up without a coordinated deployment of another application quantum; internal processes may still roll out separately through compatible versions.

## Require concrete independent operation

A quantum should be able to start from declared platform prerequisites; create, migrate, preserve, repair, and delete its authoritative state without reaching into another quantum's private data; release and roll back independently; preserve accepted durable work during optional dependency failure; expose documented degraded modes; and reveal readiness, ownership, backlog, and recovery through its own surface.

Independent operation is demonstrated across several concerns:

- internal deployables may release separately while supported versions keep the whole capability available;
- rollback does not require an unrelated application quantum to move at the same time;
- loss of an optional integration does not invalidate already accepted durable work;
- operators can determine which owned resource, lease, projection, or backlog needs recovery;
- backup, restore, repair, retention, and deletion stay within the owner's supported surface;
- the normal developer loop can substitute public dependencies without reaching into their internals.

Independent does not mean dependency-free. Shared platforms, external providers, and other quanta's public contracts are valid dependencies when explicit, versioned where necessary, and assigned failure behavior. If another application quantum must be live for this one to start, accept or preserve work, and recover, the effective operational quantum may be larger than claimed.

## Compare intended and effective boundaries

Diagrams show an **intended quantum**. Runtime and delivery coupling reveal the **effective quantum**. Evaluate five views:

| View | Boundary question |
| --- | --- |
| Capability and authority | Which cohesive responsibility and decisions belong here? |
| Data | Who creates, preserves, migrates, and deletes the authoritative facts? |
| Change | Which components usually require coordinated code or contract work? |
| Deployment and operation | What provisions, releases, rolls back, and recovers independently? |
| Failure | Which capabilities fail together under dependency or node loss? |

Material mismatch matters: separate repositories can form one change quantum; synchronous services can form one failure quantum; one repository can contain several independently released quanta; and logical data owners can remain distinct on one physical cluster while sharing platform failure risk.

Use effective boundaries when reasoning about risk. Repository names and diagram boxes do not prove isolation. Repeated coordinated edits reveal change coupling; mandatory availability reveals failure coupling; shared migration and rollback reveal deployment coupling; and cross-writes reveal that the data boundary is larger than declared.

## Own responsibility, data, and logical resources

The quantum owns validation, authoritative representation, public read/event contracts, retention, migration, deletion, repair, and the projections required by its capability. Other quanta derive value through public contracts or explicit copies; consumption does not create co-ownership.

Classify copied state as authority, immutable event, rebuildable projection, bounded-staleness cache, or deliberate second authority with conflict rules. Do not call independent mutable copies replicas without convergence semantics.

Physical database, broker, cache, object, compute, or observability infrastructure may be shared. Each logical schema, table, bucket/prefix, topic/stream, consumer identity, and namespace still needs an owner, access boundary, migration and retention policy, quota, recovery responsibility, and collision-safe identity. Record noisy-neighbor and correlated failure risk. Physical isolation does not repair tangled ownership; sharing does not authorize private access.

Destructive or global operations on shared infrastructure require particular care: one quantum's reset, retention, migration, compaction, or quota change must not silently mutate another's state. Credentials and administrative tools should reflect logical ownership even when the underlying cluster is shared. Capacity plans must acknowledge shared bottlenecks instead of counting each logical allocation as physically independent.

A shared platform can itself be a quantum whose public capability application quanta consume.

## Use a monorepo as a cohesion default, not an identity

A quantum often fits one monorepo because its processes, domain packages, migrations, contracts, deployment, tests, and tools evolve around one responsibility. Inside it:

- several commands may deploy independently;
- schemas and migrations stay with their owner;
- public contracts remain separate from private implementation;
- repository-wide tests cover invariants spanning internal processes;
- each process still owns startup, readiness, limits, drain, and shutdown;
- compatibility allows staged rollout rather than forced lockstep.

The compile, repository, deployment, and runtime graphs differ. Build and release only affected artifacts when practical. If every small change rebuilds, restarts, or migrates everything, either reduce the coupling or document the real lockstep invariant.

Share code when it has one stable meaning owned by the quantum: domain values, generated bindings, stable errors, focused lifecycle/observability utilities, or deterministic codecs. Avoid generic common packages, public reuse of private persistence types, global initialization of unrelated dependencies, and business logic without a clear owner.

Public contracts should be separable from private implementations and versioned for actual consumers. Repository-wide versioning is optional; compatible internal protocols matter more. A build graph that can select affected artifacts does not by itself prove deployment independence, while rebuilding several artifacts does not necessarily require deploying them together.

## Keep cross-quantum relationships public

Cross-quantum clients depend on explicit contracts rather than private tables, cache keys, topics, files, or object names. System Architecture owns detailed interaction composition; at the boundary, remember that mandatory synchronous authority widens the effective failure quantum, durable asynchronous work preserves accepted work, notifications may be disposable only with accepted loss or repair, local projections trade immediacy for staleness, and scoped assertions can reduce availability coupling without transferring authority.

Avoid synchronous cycles. Break them by moving authority, materializing a projection, adding an asynchronous boundary, or redesigning the workflow—without replacing a correctness-critical decision with stale data silently.

## Preserve isolated development

A quantum should be testable without every adjacent quantum. Put clients behind semantic contracts; provide compatible in-process fakes or lightweight substitutes; test wire/generated compatibility separately; and keep the normal local topology to the quantum plus direct infrastructure. Multi-quantum end-to-end evidence belongs in an umbrella environment.

Substitutes do not prove real interoperability. If ordinary development requires the full surrounding system, the boundary is expensive or underspecified even if that topology remains valid for dedicated integration tests.

Local tooling, migrations, fixtures, and recovery commands belong with the quantum when they are required to operate its capability. An umbrella repository may compose several quanta for system tests, but should not become the hidden owner of their private configuration, schemas, or ordinary release process.

## Size from coupling

Team size, lines, tables, endpoints, and deploy frequency are review signals, not limits. Ask whether responsibility changes independently; provision, rollback, and recovery are autonomous; failures interrupt another quantum's accepted work; every authoritative fact has one owner; versions can skew; tests avoid the whole system; changes routinely cross repositories; ownership remains understandable; and security, reliability, compliance, or scaling needs diverge.

Split when unrelated responsibilities, scaling, regulation, release, data ownership, failure, or local operation diverge materially. Merge when almost every change and deployment is coordinated, invariants and ownership are inseparable, network machinery protects an artificial split, neither side is useful alone, or reconciliation cost exceeds real isolation benefit. State which coupling problem the change solves; do not optimize service count.

Common boundary failures include:

- fragmenting one cohesive invariant into tiny services and replacing code complexity with network coordination;
- reading or writing another quantum's private database under the label of convenience;
- circular synchronous authority and long mandatory call chains;
- treating a repository move or dedicated cluster as proof of independence;
- defining a quantum as a list of infrastructure products rather than a capability;
- using endpoint, table, line, or team counts as pass/fail architecture rules.

A large cohesive quantum can be healthy; a tiny service with hidden authority and runtime coupling can be unhealthy. Quantitative thresholds trigger discussion, while capability, data, change, deployment, and failure evidence decide the boundary.

Quantum-specific review questions are: What complete capability and authority does this unit own? Which logical data and infrastructure resources follow it? Where do intended and effective change/deployment/failure boundaries differ? Can it operate and recover without another application quantum? Which dependency or private-data path disproves independence?
