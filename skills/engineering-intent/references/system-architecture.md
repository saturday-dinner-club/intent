# System Architecture

Status: living document

Last consolidated: 2026-09-07

Audience: maintainers, reviewers, and coding agents

## 1. Purpose

Use this reference when composing multiple quanta, choosing synchronous or asynchronous interactions, assigning cross-system responsibility, or planning integration and failure tests.

The system architecture explains ownership, decisions, data flow, durability, dependency, and failure propagation. It is not merely an inventory of services and infrastructure products.

## 2. Start with domain and data ownership

Divide the backend by cohesive domain capability and owned data, not by a screen, endpoint, client request shape, programming language, or current team task list.

For every important fact, identify one quantum that owns:

- its authoritative representation;
- mutation and validation rules;
- lifecycle and deletion;
- publication to other quanta;
- compatibility and migration;
- operational recovery.

Other quanta consume contracts or projections. They do not read or mutate the owner's private database, cache keys, object layout, or internal topic schema.

When a responsibility falls into a gray zone, assign an owner explicitly. Leaving it shared usually produces duplicated state, extra hops, ambiguous shutdown, and failure handling that no component owns end to end.

## 3. Compose quanta without erasing autonomy

Within one quantum, implementation may be strongly cohesive at build time while its independently deployed processes remain loosely coupled at runtime. Across quanta, even build-time sharing must preserve independent versioning and deployment.

A quantum may expose:

- a public or internal facade for commands and queries;
- durable events representing owned facts;
- disposable notifications for acceleration;
- scoped credentials or discovery information for a direct data path.

It should not expose internal persistence as its integration API.

Physical infrastructure may be shared, but logical schemas, topics, buckets, namespaces, access policy, migrations, quotas, and recovery responsibility remain owned.

## 4. Separate platform and business responsibility

Shared gateways, messaging, identity primitives, observability, deployment systems, or service connectivity may form platform capabilities. Business quanta use those capabilities without transferring their domain authority to the platform.

- A gateway routes, authenticates according to its contract, and applies cross-cutting policy; it should not accumulate arbitrary domain aggregation.
- A broker transports messages; it does not become the owner of their meaning.
- An identity service establishes identity; the resource owner retains domain authorization.
- An observability platform records evidence; it does not define business truth.

A shared platform itself needs an owner, version policy, capacity model, failure boundary, and a way for business quanta to develop against compatible substitutes.

## 5. Give composition its own layer

Client request shapes often span several domain owners. Use an aggregator or backend-for-frontend when one consumer needs coordinated reads or presentation-specific composition.

The composition layer may:

- call relevant domain facades;
- schedule and parallelize reads;
- shape a client-specific response;
- tolerate optional partial data according to contract;
- cache a composed projection when ownership remains clear.

It should not quietly become the source of truth or move domain writes into the frontend-shaped layer. A new screen is not evidence that a new domain quantum is needed.

A composition layer or workflow coordinator MAY orchestrate commands across several quanta. It owns the workflow's progress, retry, timeout, and compensation state; each participating quantum still owns its domain facts and validates its own transition. Composition does not create authority to bypass domain facades or combine private stores into an accidental distributed database.

## 6. Choose the interaction class deliberately

### Synchronous request

Use when the caller needs an immediate answer from the authority before proceeding. Define timeout, cancellation, bounded concurrency, failure mapping, and whether stale or degraded data is acceptable.

Synchronous dependencies contribute to the caller's runtime failure quantum. Avoid cycles such as `A -> B -> C -> A`, and avoid placing a synchronous hop on a hot path merely to fetch data that could be verified or projected locally.

### Durable asynchronous work

Use when accepted work must survive process failure or be replayed. The path needs a durability boundary, stable identity, idempotent consumers, ordering scope, retry policy, poison-item handling, lag visibility, and reconciliation.

### Disposable notification

Use when low latency matters more than guaranteed delivery.

- A state-significant notification accelerates awareness of a durable fact. If it may be lost, consumers need a way to detect stale state and recover from the authority or durable log.
- A purely ephemeral notification MAY disappear without repair when the product contract accepts that loss.

Failure of a disposable path should degrade immediacy or an explicitly optional experience, not corrupt truth.

### Discovery and direct data paths

A message bus or registry may signal availability, assignment, or connection details, after which peers establish a bounded direct connection for high-volume data. Keep control-plane ownership separate from data-plane throughput and lifecycle.

## 7. Separate truth, projection, and delivery

A robust flow often has three distinct layers:

1. an authoritative write or durable log;
2. projections optimized for reading, routing, or local policy;
3. fast delivery or notification optimized for latency.

They need not share the same availability or consistency guarantees.

- The durable layer allows restart and repair.
- The projection layer allows local and scalable reads.
- The fast path makes the common case responsive and may be lossy when recovery exists.

Do not require the disposable path to become durable merely to avoid acknowledging its limitations. Do not pretend a projection is current without a version, timestamp, invalidation, or fallback policy.

## 8. Select consistency from correctness needs

Across independently operated quanta, the general default is durable local acceptance followed by eventual convergence of subsequent stages, replicas, projections, indexes, and notifications. Do not place a strong distributed transaction around every step merely to hide intermediate states.

This default does not weaken the authoritative transition itself. The owning quantum SHOULD use a local transaction, compare-and-swap, unique constraint, serialized command path, or another appropriate mechanism to preserve its domain invariants at the declared durability boundary.

Strong consistency is appropriate when accepting two conflicting states, observing an intermediate state, or acting on stale authority would immediately violate an important domain rule. The domain consequence, not a general preference for strictness, determines whether the latency and availability cost of coordination is justified.

Prefer placing a strict invariant under one authority before introducing a cross-quantum transaction. If the invariant genuinely spans owners, document the coordinator, lock or consensus scope, timeout, partial-failure state, recovery process, and reduced availability during partition.

Eventual consistency is appropriate when temporary divergence is acceptable, observable, and repairable. Each stage should be independently repeatable and expose enough identity and progress for reconciliation.

Useful mechanisms include:

- transactional outbox or change capture from an authoritative write;
- command orchestration or a saga for multi-owner workflows;
- read projections built from durable facts;
- expected versions and compare-and-swap transitions;
- epochs or fencing tokens for ownership changes;
- monotonic versions, offsets, timestamps, or domain merge rules for delayed events;
- periodic reconciliation against authoritative state.

Wall-clock timestamps can support natural merge and presentation, but they do not alone prevent clock skew, duplicates, or conflicting concurrent writes. Define the tie-break and consequence of reordering where it matters.

Do not make every projection globally strict because one special action needs coordination. Isolate strict transitions and let the rest converge at the weakest consistency that meets product behavior.

Do not hold a local database transaction or lock open across a remote call unless the domain and failure analysis explicitly require it. Prefer committing the owned fact, recording durable follow-up work, and converging later.

## 9. Design multi-region and failure-domain behavior

Regions, availability zones, data centers, clusters, nodes, and processes are distinct failure and latency domains. The architecture SHOULD state which failures it intends to survive and which capabilities degrade at each boundary.

For state and authority distributed across regions, define:

- which regions may store, read, and mutate each data class;
- whether writes are active-active, assigned to a home region, or partitioned by entity;
- when a request remains local and when it may cross a region;
- replication direction, expected lag, and acceptable divergence;
- behavior during network partition and when remote authority is unreachable;
- failover ownership, epoch or fencing, and treatment of the previous owner;
- conflict detection, merge policy, and the meaning of timestamps or versions;
- failback and reconciliation after the partition heals;
- regulatory, privacy, and key-placement constraints.

Do not introduce a universal home-region rule when independent writes can merge safely. Do not claim active-active writes when conflicting operations lack a deterministic domain policy. Strongly consistent global operations should remain narrow and explicit because their failure and latency domain is correspondingly wider.

## 10. Design scaling and partitioning together

Name the unit that can scale independently and the resource that actually constrains it. Adding process replicas does not increase capacity when all work is serialized through one partition, database row, connection, hardware device, or downstream service.

Define, where relevant:

- partition, shard, routing, and affinity keys;
- the scope in which ordering must be preserved;
- how work moves when membership or ownership changes;
- how hot entities, rooms, streams, accounts, or tenants are detected and isolated;
- whether consumers compete for work or every interested destination must receive it;
- fan-out amplification and per-recipient buffering;
- admission, overload, quality reduction, and backlog behavior;
- capacity signals used for placement or autoscaling;
- the migration path when a partitioning choice no longer fits.

A consumer group usually distributes messages among its members; it does not provide fan-out to every relevant process. Subscription and routing topology are part of the delivery contract, not merely broker configuration.

## 11. Treat failure containment as a topology property

For every edge between quanta, ask:

- Does failure reject new work, interrupt existing work, return stale data, or remove an optional feature?
- Does the caller have a compatible degraded mode?
- Can retries amplify the outage?
- Is there a bounded backlog and an overload policy?
- Can restart replay or reconcile partial progress?
- Can a stale owner still act after reassignment?
- What operator evidence identifies the failing edge?

An independent deployment unit whose normal operation synchronously requires every other quantum is independent only in packaging. Evaluate the effective failure quantum, not only repository and process boundaries.

Prefer make-before-break replacement for live connections and ownership changes. Stop new admission separately from draining healthy work. Use epochs, leases, or fencing when an old and new actor could both finalize the same state.

## 12. Make lifecycle ownership explicit

Service discovery, assignment, readiness, draining, shutdown, crash recovery, and reassignment are architectural contracts.

An instance advertisement SHOULD expose orthogonal facts rather than compressing them into one ambiguous health value:

- lease identity and freshness, from which consumers derive liveness;
- readiness and admission of new work;
- draining state and relevant in-flight ownership;
- protocol version and capabilities;
- current load or remaining placement capacity when used for assignment.

Advertisements and leases need a freshness rule and a consumer behavior when updates are delayed. Suppressing new assignments is different from terminating existing ones.

Do not depend on a crashed instance advertising itself as unhealthy. Lease expiry, failed probes, fenced epochs, or another observer-owned mechanism must remove stale candidates.

Graceful shutdown reduces avoidable interruption, but crash recovery cannot depend on it. Durable ownership and reconciliation must handle a process disappearing without notification.

## 13. Control dependency direction

Layer and service dependencies should follow data and decision ownership.

- Domain policy depends on abstract capabilities, not concrete vendors.
- Controllers translate external requests into domain operations.
- Infrastructure adapters implement domain-facing contracts.
- Composition roots select concrete implementations.
- Aggregators depend on domain facades, not their private storage.
- Consumers depend on published event schemas, not producer internals.

The exact folder names and number of layers may vary. The invariant is that low-level implementation choices do not define high-level policy, and cross-quantum consumers do not reach behind a facade.

## 14. Use sidecars and shared components for real leverage

A sidecar, local proxy, or shared runtime can be useful for cross-language protocol reuse, batching, cache, cryptographic isolation, or specialized computation. It also creates another lifecycle and failure boundary.

Require an explicit benefit over an ordinary library or service. Define local protocol compatibility, readiness, resource ownership, restart order, and observability. A pass-through proxy with no operational or semantic value is architecture debt.

Within one quantum, libraries MAY share cohesive business behavior because they participate in the same ownership and release boundary. Libraries shared across quanta SHOULD contain stable technical contracts or primitives, not business policy that forces otherwise independent quanta into synchronized releases.

## 15. Design system-wide observability

Every cross-quantum flow needs identities that survive its actual lifetime:

- request and trace identifiers for an execution;
- operation and event identifiers for retries and replay;
- domain entity identifiers;
- occurrence, durability, publication, and application timestamps where latency matters;
- owner epoch or version where authority can move.

Traces explain sampled causality. Durable timestamps and identifiers explain replayed or delayed facts. Metrics expose aggregate capacity and failure without using high-cardinality entity labels.

Readiness should mean the instance can accept its intended new work, not merely that its process is alive.

## 16. Test at the correct boundary

Each quantum SHOULD be developable and testable using contract-compatible substitutes for external quanta. Its local suite covers domain behavior, adapters, durable transitions, lifecycle, and exported contracts.

An umbrella environment separately validates:

- mixed-version compatibility;
- identity and authorization flow;
- network and discovery behavior;
- durable event propagation and projection repair;
- retries during partial outage;
- multi-replica assignment and fencing;
- region partition, failover, failback, and delayed reconciliation;
- competing-consumer versus fan-out delivery behavior;
- hotspot, backlog, overload, and placement behavior;
- graceful shutdown and abrupt loss;
- externally visible workflows;
- capacity and failure isolation.

Do not require every developer to run the complete production topology to test one quantum. Do not claim system-wide availability from local fakes alone.

## 17. Draw decisions, not boxes

Architecture diagrams SHOULD make at least one important relationship visible:

- ownership and trust boundaries;
- command, query, event, and bulk-data direction;
- durability acknowledgments;
- source of truth and projections;
- normal and degraded paths;
- assignment and lifecycle transitions;
- region, cluster, node, and process failure boundaries;
- scaling, partitioning, ordering, and fan-out scopes;
- failure propagation and recovery.

A diagram containing product logos and bidirectional arrows but no semantics is an inventory. Use separate views when one drawing cannot clearly express topology, sequence, ownership, and failure.

## 18. Architecture review questions

| Concern | Question |
| --- | --- |
| Domain | Which quantum owns each important decision and fact? |
| Composition | Who combines data for each consumer without taking ownership? |
| Dependency | Which synchronous edges widen the failure quantum? |
| Durability | Where may accepted work survive process loss? |
| Delivery | Which paths may lose data and how is loss repaired? |
| Consistency | What divergence is acceptable, for how long, and with what merge rule? |
| Region | Where may authority and data live, and what happens during partition and failover? |
| Scale | What is the scaling and partitioning unit, and where can hotspots form? |
| Fan-out | Is each item assigned to one worker or delivered to every required destination? |
| Ownership | How are stale owners fenced after reassignment? |
| Lifecycle | How do readiness, drain, shutdown, crash, and restart differ? |
| Capacity | What bounds queues, retries, fan-out, and in-flight work? |
| Evolution | Can adjacent versions coexist and roll back independently? |
| Evidence | Which claims require umbrella, failure, load, or external-client tests? |

## 19. Historical source notes

This reference distills recurring ideas from snowmerak's writings on project architecture, distributed roles and responsibilities, service planning, log streams, eventual consistency, quantum modular architecture, and sidecars. Exact cloud products, message brokers, folder layouts, and language choices remain examples; the reusable content is the ownership and failure reasoning behind them.

Primary source material:

- [프로젝트 설계에 대해](https://github.com/snowmerak/snowmerak/blob/main/content/posts/030_architect.md) — role-focused components, dependency direction, aggregation, messaging, and lifecycle bounds.
- [분산 서비스에서의 R&R](https://github.com/snowmerak/snowmerak/blob/main/content/posts/034_RnR.md) — gray-zone ownership, domain boundaries, aggregation, and authentication dependencies.
- [서비스 기획자](https://github.com/snowmerak/snowmerak/blob/main/content/posts/035_service_planner.md) — architecture foundations, operational conventions, and explicit boundary responsibility.
- [로그 스트림](https://github.com/snowmerak/snowmerak/blob/main/content/posts/041_log_stream.md) — durable event flow, indexing, replay, and observation as separate responsibilities.
- [MSA에서 데이터 일관성](https://github.com/snowmerak/snowmerak/blob/main/content/posts/043_data_consistency_in_msa.md) — strong versus eventual consistency, projections, sagas, and delayed-event recovery.
- [Quantum Modular Architecture](https://github.com/snowmerak/snowmerak/blob/main/content/posts/048_qma.md) — independently operable quanta, platform separation, facades, and runtime loose coupling.
- [Sidecar](https://github.com/snowmerak/snowmerak/blob/main/content/posts/050_sidecar.md) — capability-bearing local processes and their lifecycle cost.
