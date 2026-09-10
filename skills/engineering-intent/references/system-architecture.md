# System Architecture

Status: living reference

Use this reference to compose quanta and reason about cross-system workflows, consistency, scaling, regions, ownership movement, failure propagation, and umbrella evidence. [Quantum and monorepo](quantum-and-monorepo.md) owns boundary definition; General Engineering owns generic durability, capacity, and lifecycle principles.

## Compose without erasing ownership

For each important fact and decision, one quantum owns mutation, authoritative representation, lifecycle, publication, compatibility, and recovery. Other quanta consume public contracts or explicit projections rather than private databases, caches, object layouts, or topic internals.

Shared gateways, messaging, identity primitives, observability, deployment, and connectivity are platform capabilities, not domain authorities. A gateway may route and apply cross-cutting policy; a broker transports messages; identity proves a subject; observability records evidence. The resource-owning quantum retains domain authorization and truth.

Each shared platform still needs an owner, version policy, capacity model, failure boundary, and compatible local substitute. A platform outage may correlate failures across many quanta; that operational leverage does not justify moving their business invariants into the platform.

Physical infrastructure can be shared while logical resources, policies, migrations, quotas, and recovery stay owned.

## Give composition and workflows an owner

Use an aggregator or backend-for-frontend when a consumer needs coordinated reads or presentation shaping across owners. It may parallelize calls, tolerate optional partial results, and cache a composed projection while keeping authority explicit. A screen or response shape does not create a new domain quantum.

A workflow coordinator may orchestrate commands across quanta. It owns workflow progress, durable coordination state, retries, timeouts, and compensations; participants still validate and own their domain transitions. Composition never grants access to private stores or creates an accidental distributed database.

Make partial results contractual. A composed read may omit an optional source, return stale projection data, or fail the entire request depending on user impact. A multi-owner command may compensate, wait for reconciliation, or expose a pending state. Do not hide these choices behind a generic gateway success code.

## Choose the cross-quantum interaction class

- **Synchronous request:** use when a current decision needs an authoritative answer and availability coupling is acceptable. Define deadline, cancellation, concurrency, failure mapping, and stale/degraded policy. Avoid cycles and unnecessary hot-path hops.
- **Durable asynchronous work:** use when accepted work must survive receiver or network failure. Define durability, identity, idempotency, ordering, retries, poison handling, lag, and reconciliation.
- **Disposable notification:** use for latency when disappearance is product-acceptable or repaired from durable authority. Loss may reduce immediacy, not corrupt truth.
- **Local projection:** use when repeated authority calls create unacceptable latency or failure coupling. Define source, version/staleness, invalidation, rebuild, and fail-open/closed behavior.
- **Scoped credential or assertion:** use when one authority can prove a decision once and a receiver can verify it locally within an explicit lifetime and revocation window.
- **Direct data path:** use discovery/control to authorize and locate a bounded high-volume connection while keeping its throughput, backpressure, and lifecycle separate.

The chosen edge determines the effective failure quantum. Do not exchange a required authoritative decision for stale local data without naming the correctness cost.

Avoid synchronous dependency cycles such as `A -> B -> C -> A`; they make startup, timeout budgeting, incident isolation, and rollback mutually dependent. Break a cycle by relocating the decision, publishing a durable fact, materializing a projection, or assigning workflow coordination explicitly. Do not add an asynchronous hop merely to appear decoupled when the caller still blocks on its completion.

## Select consistency from consequences

The default across independently operated quanta is durable local acceptance followed by eventual convergence of projections, indexes, replicas, and notifications. The owning quantum still protects local invariants with an appropriate transaction, uniqueness rule, compare-and-swap, or serialized transition.

Use strong coordination when conflicting acceptance, intermediate visibility, or stale authority would violate an important domain rule. First try to place the invariant under one authority. If it genuinely spans owners, define coordinator, lock/consensus scope, timeout, partial state, recovery, and partition availability.

Eventual consistency is valid only when divergence is bounded, observable, and repairable. Common mechanisms include outbox or CDC from authority, sagas, rebuildable read models, expected versions, epochs and fencing, monotonic offsets/versions, domain merge rules, and periodic reconciliation.

For each asynchronous stage, record what has been durably accepted, how duplicate processing is recognized, which order is meaningful, where poison work waits, and how an operator sees lag and terminal failure. A retrying pipeline without a discoverable partial state is not recoverable merely because a broker retains messages.

Wall-clock order alone does not solve concurrent conflicts. Do not make every projection strict for one special action or hold a local transaction across a remote call without explicit failure justification.

## Design region and failure-domain behavior

Distinguish region, zone, data center, cluster, node, and process failures. For multi-region state define allowed placement; read and write regions; active-active, home, or partitioned authority; local versus cross-region paths; replication and lag; partition behavior; failover ownership and fencing; conflict/merge rules; failback and reconciliation; and regulatory, privacy, and key placement.

Avoid universal home-region rules when independent writes merge safely. Do not claim active-active without deterministic domain conflict handling. Keep globally strict operations narrow because their latency and failure domain are wider.

Define partition and healing behavior independently from ordinary replication. During isolation, a capability may reject authority changes, accept only its owned shard, serve a bounded-stale projection, or continue mergeable writes. After healing, specify stale-owner fencing, replay order, conflict inspection, convergence evidence, and when traffic may fail back.

## Scale and partition together

Name the unit that scales and the actual bottleneck. Replicas do not increase capacity if a row, partition, connection, device, or downstream service serializes all work.

Define routing/affinity keys, ordering scope, ownership movement, hot-entity isolation, competing-consumer versus fan-out semantics, amplification and per-destination buffering, admission and backlog policy, scaling signals, and repartitioning migration. A consumer group normally assigns each item to one member; it does not broadcast to every destination.

Ownership movement needs make-before-break where continuity matters and epochs, leases, or fencing where old and new owners could both act. Separate refusal of new work from drain of accepted work.

Hot keys and fan-out deserve explicit treatment. Detect per-tenant, room, stream, or account pressure rather than relying only on aggregate CPU. Bound per-recipient buffers, decide whether a slow destination drops, disconnects, or backpressures, and account for one input expanding into many network writes or storage operations.

## Make discovery and lifecycle system contracts

Advertisements should expose orthogonal facts: lease identity/freshness, readiness/admission, drain and in-flight ownership, protocol capabilities, and placement capacity. Define freshness and consumer behavior on delay.

A crashed instance cannot reliably announce failure. Use observer-owned probes, lease expiry, failed connectivity, or fenced epochs to remove stale candidates. Graceful shutdown reduces interruption; durable recovery must handle disappearance without notice.

Readiness should describe intended admission, not process existence. A lease proves recent ownership advertisement, not necessarily capacity; a health probe proves a response, not domain authority. Keep liveness, readiness, draining, ownership freshness, capabilities, and load as distinguishable facts so schedulers and peers can make the right decision.

## Preserve dependency direction

Domain policy depends on abstract capabilities; controllers translate boundary requests; adapters implement those capabilities; composition roots select implementations; aggregators use facades; consumers use published schemas. Folder names may vary, but vendors do not define domain policy and cross-quantum code does not reach behind ownership.

Libraries shared within a quantum may contain cohesive business behavior. Cross-quantum libraries should contain stable technical contracts or primitives rather than policy that forces synchronized releases. A sidecar or shared runtime needs real leverage—protocol reuse, batching, cache, isolation, or specialized computation—to justify its lifecycle, version, readiness, resource, restart, and observability costs.

## Verify at the umbrella boundary

Each quantum uses contract-compatible substitutes for ordinary development. A separate umbrella topology validates claims that exist only between real components:

- mixed versions, rollout, rollback, and generated contracts;
- identity proof and domain authorization;
- discovery, networking, durable propagation, and projection repair;
- retries and containment during partial outage;
- multi-replica assignment, movement, and fencing;
- regional partition, failover, failback, and delayed convergence;
- competing work versus required fan-out;
- hotspots, backlog, overload, placement, and resource bounds;
- graceful drain, abrupt loss, and externally visible workflows;
- capacity and effective failure isolation.

Local fakes prove neither system interoperability nor availability. Conversely, ordinary feature work should not require the full production topology.

End-to-end timestamps and identities must outlive a sampled trace when workflows are durable: request/trace IDs explain one execution, operation/event IDs explain retries and replay, entity IDs locate domain state, and occurrence/durability/publication/application times expose pipeline delay. Metrics aggregate failure and capacity without entity IDs as labels.

Architecture-specific review questions are: Who owns each cross-quantum workflow and fact? Which synchronous edge widens failure? What divergence and recovery are acceptable? What is the partition and ownership-movement rule? Which region or node failure changes behavior? Which claim requires umbrella rather than local evidence?
