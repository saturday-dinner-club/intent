# Quantum and Monorepo

Status: living reference

Conceptual source: *아키텍처의 퀀텀*, snowmerak, 2025-07-04. This reference preserves its central intent while making deployment, infrastructure ownership, and sizing criteria more explicit.

Use this reference when defining ownership boundaries, deciding whether code belongs in one repository, splitting runtime processes, or designing isolated development, deployment, and operation.

## 1. Definition

An architecture **quantum** is the smallest cohesive set of capabilities and owned resources that can be provisioned, deployed, and operated independently as a complete unit.

“Deployed as a unit” means that the quantum can be brought up and provide its declared responsibility without requiring a coordinated deployment of another application quantum. It does **not** mean that every process, schema, or supporting resource inside the quantum must roll out at the same instant.

A quantum may contain:

- one or more independently runnable processes;
- domain logic and its authoritative data;
- caches, indexes, queues, topics, or other logical infrastructure resources;
- schema definitions and migrations;
- internal protocols and public contracts;
- configuration, deployment manifests, operational controls, and observability;
- local adapters, test doubles, and recovery tools needed to develop and operate it.

One process is not automatically one quantum. One repository is not automatically one quantum. One physical database or broker cluster is not automatically one quantum. The boundary is defined by cohesive responsibility and the ability to stand up, evolve, operate, and recover the capability independently.

## 2. Independent operation

A quantum should be independently operable in a concrete, testable sense.

- Its owned capability can be started from declared platform prerequisites.
- Its authoritative state can be created, migrated, backed up where required, repaired, and deleted without reaching into another quantum's private data.
- Its internal components may be deployed separately, provided compatible versions allow the quantum as a whole to remain operable.
- Its release and rollback do not require an unrelated quantum to release at the same time.
- Failure of an optional integration has a documented degraded mode.
- Failure of another application quantum does not silently destroy the quantum's already accepted durable work.
- Operators can determine readiness, health, ownership, backlog, and recovery state within the quantum's own operational surface.

Independent does not mean dependency-free. A quantum may depend on shared platform services, external providers, and public contracts from other quanta. Those dependencies must be explicit, versioned where necessary, and assigned a failure behavior.

If another application quantum must be available for the primary capability to start, accept work, preserve accepted work, and recover, the effective operational quantum may be larger than the diagram claims.

## 3. Intended and effective boundaries

Architecture diagrams describe an **intended quantum**. Runtime coupling reveals the **effective quantum**. Evaluate both.

Five views are useful:

| View | Boundary question |
| --- | --- |
| Domain and ownership | Which cohesive business or system responsibility does this unit own? |
| Data | Which unit creates, preserves, migrates, and deletes the authoritative data? |
| Change | Which components normally require coordinated code or contract changes? |
| Deployment and operation | What can be provisioned, released, rolled back, and operated without another application unit? |
| Failure | Which components stop providing their primary capability together during a dependency or node failure? |

The ideal boundary aligns these views closely. Perfect alignment is not mandatory, but a material mismatch must be understood.

Examples of mismatch:

- Separate repositories that always require coordinated changes form a larger effective change quantum.
- Separately deployed services connected by a mandatory synchronous chain may form a larger effective failure quantum.
- One repository containing several independently owned and independently released domains may contain more than one quantum.
- Two logical data owners placed on one physical cluster may remain separate data quanta while sharing a correlated platform failure domain.

Use the effective boundary to reason about availability and delivery risk. Do not rely on repository names or boxes in a diagram as proof of independence.

## 4. Responsibility and data ownership

A quantum owns the production and preservation of the data required by its responsibility.

Ownership includes:

- defining the authoritative representation;
- validating writes and enforcing domain invariants;
- publishing supported read or event contracts;
- choosing retention, migration, repair, and deletion behavior;
- operating the indexes and projections required for its own capability;
- deciding which derived uses are public and which internals remain private.

Another quantum may search, aggregate, recommend, analyze, or otherwise derive value from the data. It does so through an owned contract or explicitly replicated projection. It does not become a co-owner merely because it consumes the data.

Direct reads or writes against another quantum's private tables, cache keys, topic internals, filesystem layout, or implementation-specific object names bypass ownership and create hidden compatibility coupling. Avoid them.

When data must exist in multiple quanta, identify whether it is:

- authoritative data owned by one quantum;
- an immutable event copied for local use;
- a rebuildable projection;
- a cache with bounded staleness;
- a deliberate second source of truth with explicit conflict rules.

Do not call several independent mutable copies “replicas” unless their convergence and conflict semantics are defined.

## 5. Physical infrastructure and logical ownership

Physical isolation is not required for every quantum. A database cluster, broker cluster, cache fleet, object store, compute pool, or observability platform may be shared when doing so is operationally sensible.

Logical resources on shared infrastructure remain owned:

- schemas, databases, tables, buckets, prefixes, topics, streams, consumer identities, and cache namespaces have an owning quantum;
- access policy prevents other quanta from depending on private representations;
- migrations, retention, quotas, recovery, and destructive operations have a named owner;
- resource names and credentials avoid accidental collision;
- capacity and noisy-neighbor behavior are measured and bounded;
- shared-platform outages are recorded as correlated failure risk.

Sharing a physical cluster does not authorize cross-quantum data access. Conversely, allocating one physical cluster per quantum does not create a sound boundary if contracts and ownership remain tangled.

A shared platform may itself be operated as a platform quantum. Application quanta then depend on its public service contract rather than owning the platform's internal lifecycle.

## 6. Quantum and monorepo

A quantum often fits naturally in one monorepo because its processes, domain packages, migrations, contracts, deployment definitions, tests, and operational tools evolve around one responsibility. This is a useful default, not an identity rule.

Inside a quantum monorepo:

- multiple commands may produce independently deployable processes;
- shared internal packages may implement genuinely shared domain or operational behavior;
- public contracts are separated from private implementation;
- schemas and migrations are versioned with their owning code;
- containers and deployment manifests make each runtime artifact explicit;
- repository-wide tests check invariants that span internal processes;
- each process still owns its startup, readiness, drain, shutdown, and resource limits;
- internal compatibility permits staged rollout rather than forcing simultaneous replacement.

The compile graph, repository graph, deployment graph, and runtime call graph are different. Do not assume one dictates all the others.

### 6.1 Code sharing

Share code inside the monorepo when it represents one stable meaning owned by the quantum. Avoid a generic common package that becomes a dumping ground for unrelated helpers or silently couples every process.

Good candidates include:

- domain value types and invariant validation;
- generated protocol bindings;
- common error identities;
- narrowly shared observability and lifecycle utilities;
- deterministic codecs or storage contracts owned by the quantum.

Questionable candidates include:

- mutable global configuration shared only for convenience;
- direct database models reused as public API types;
- helpers that expose one process's private persistence layout;
- shared startup code that forces unrelated processes to initialize every dependency;
- business logic with no clear owner.

### 6.2 Release independence inside the monorepo

A monorepo may build and release only affected artifacts. Repository-wide versioning is optional. What matters is that compatible contracts allow old and new internal processes to coexist during rollout and rollback.

If every small change requires rebuilding every artifact, restarting every process, or migrating every data store, the monorepo is creating an unnecessarily large deployment quantum. Fix the coupling or document why lockstep behavior is a real invariant.

## 7. Cross-quantum dependencies

Cross-quantum interaction occurs through explicit public contracts. Choose the interaction form from the required semantics rather than convenience.

- Use a synchronous request when the caller cannot complete its current decision without the authoritative answer and the availability coupling is acceptable.
- Use durable asynchronous work when accepted work must survive receiver or network failure.
- Use disposable notification when low latency matters and the receiver can recover or refresh elsewhere.
- Use a locally materialized projection when repeated synchronous lookup would create unacceptable latency or failure coupling.
- Use a narrowly scoped credential or signed assertion when one quantum can prove a decision once and another can continue independently.

A mandatory synchronous runtime dependency widens the effective failure quantum. Reduce that coupling when independent operation matters, but do not replace a required authoritative decision with stale local data without defining the correctness cost.

Avoid synchronous dependency cycles. A cycle makes startup, incident isolation, timeout budgeting, testing, and rollback harder. Break it by moving authority, introducing an asynchronous boundary, materializing a projection, or redesigning the workflow.

## 8. Local development and testing

A quantum should be developable and testable without booting every other quantum.

- Put cross-quantum clients behind interfaces.
- Provide contract-compatible in-process fakes or lightweight substitutes.
- Test generated clients and wire compatibility separately from domain logic.
- Keep the default local environment scoped to the quantum and its direct infrastructure.
- Put multi-quantum end-to-end testing in an umbrella environment or dedicated CI topology.
- Distinguish a contract-compatible fake from evidence that the real external system interoperates.

If ordinary development requires every adjacent quantum to be live, the boundary is operationally expensive and probably underspecified. This may be acceptable for a deliberate integration test, not as the only way to test local behavior.

## 9. Sizing and boundary signals

Team size, lines of code, table count, endpoint count, and deployment frequency can signal complexity. They are not normative limits and do not define a quantum.

Prefer questions about coupling:

- Can this responsibility change without coordinated implementation work in another quantum?
- Can it be provisioned, deployed, rolled back, and recovered independently?
- Does its failure interrupt another quantum's already accepted or existing work?
- Is every authoritative datum owned by exactly one clear boundary?
- Can contracts tolerate version skew, or do releases require lockstep deployment?
- Can it be tested without starting the entire surrounding system?
- Do routine changes repeatedly require edits across several repositories?
- Can one team or ownership group understand and operate the responsibility without hidden authority elsewhere?
- Are reliability, security, compliance, or scaling requirements substantially different from neighboring responsibilities?

Use quantitative thresholds as prompts for review. A large quantum with strong cohesion and independent operation may be healthy. A tiny service with hidden runtime and data coupling may be an unhealthy boundary.

## 10. Split, merge, and retain

Consider splitting a quantum when:

- responsibilities change for unrelated reasons;
- scaling, availability, security, or compliance requirements diverge materially;
- independent release is repeatedly blocked by unrelated code or data;
- one failure mode unnecessarily removes several capabilities;
- ownership of data or decisions is persistently ambiguous;
- local testing and operation require too much unrelated infrastructure.

Consider merging boundaries when:

- nearly every meaningful change is coordinated;
- the same team, data invariants, and deployment window always move together;
- network and consistency machinery exists only to preserve an artificial separation;
- neither side can provide a useful capability or recovery path independently;
- duplicated projections and reconciliation cost exceed any real isolation benefit.

Do not split or merge from fashion, repository size alone, or a desire to maximize service count. State which coupling or ownership problem the change resolves.

## 11. Anti-patterns

### Excessive fragmentation

Splitting cohesive behavior into tiny services can replace code complexity with network, deployment, observability, and consistency complexity without creating real independence.

### Shared private database

Multiple quanta reading and writing the same private representation erase ownership and force hidden coordinated migrations. Physical infrastructure may be shared; private logical models may not.

### Circular dependency

Mutual synchronous authority makes startup and recovery order fragile and expands the failure quantum.

### Long synchronous chain

Each mandatory hop compounds latency and availability risk. Keep synchronous authority checks intentional and move recoverable follow-up work off the critical path.

### Repository equals architecture

Creating or moving a repository does not create independent ownership, operation, or failure isolation. Measure the effective boundary.

### Infrastructure inventory as a quantum definition

A list of technologies does not explain responsibility. Begin with capability, authority, and data, then include the logical resources needed to operate them.

### Numeric boundary theater

Meeting a preferred team, code, table, or endpoint count does not prove cohesion or independence.

## 12. Review record

When a new quantum or material boundary change is proposed, record the answers that affect the decision:

| Concern | Prompt |
| --- | --- |
| Responsibility | What complete capability does the quantum provide? |
| Authority | Which decisions can only this quantum make? |
| Data | What authoritative data does it create, preserve, migrate, and delete? |
| Composition | Which processes and logical infrastructure resources are required? |
| Independent operation | What can be provisioned and operated without another application quantum? |
| Dependencies | Which synchronous, durable asynchronous, notification, projection, and credential boundaries exist? |
| Failure | What happens to accepted and existing work when each dependency fails? |
| Evolution | Can contracts tolerate staged rollout, version skew, and rollback? |
| Development | Can ordinary tests run with local substitutes rather than every adjacent quantum? |
| Shared infrastructure | Which physical resources are shared, and who owns each logical resource and migration? |
| Evidence | Which tests demonstrate the claimed independence and which remain external? |

The record need not be a large document. It must make hidden coupling and ownership decisions visible.

## 13. Agent application

When applying this reference:

1. Start from capability, authority, and authoritative data—not from desired service count.
2. Distinguish intended boundaries from effective change, deployment, data, and failure coupling.
3. Treat independent deployment as the ability to stand up and operate the complete quantum, not a requirement for simultaneous rollout of every internal component.
4. Permit physical infrastructure sharing while preserving logical ownership, access boundaries, and migration responsibility.
5. Use qualitative coupling questions as primary evidence; treat quantitative size measures only as review signals.
6. Keep product names, live topology, ports, vendors, and current implementation state in their owning documentation.
7. Preserve an explicit local boundary even when it differs from this default, and explain the consequence when relevant to the task.
