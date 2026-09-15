---
name: engineering-intent
description: Apply risk-proportional, failure-aware judgment to consequential software architecture, state, interfaces, purpose-built configuration, security, reliability, or production-readiness work. Use lightly for ordinary implementation and more deeply only when the user, repository, or concrete risk calls for it. Do not use as a release checklist for routine changes, prototypes, simple answers, cosmetic edits, or specified commands.
---
# Engineering Intent

Apply only the guidance that changes a decision in the requested work. Preserve the latest explicit user decision and the repository's established contracts over these defaults.

## Calibrate first

Treat these references as decision aids, not cumulative acceptance criteria.

- For exploration, prototypes, and early MVPs, favor a thin working path and fast feedback. Address only risks that would invalidate the learning, create an unsafe default, or be expensive to unwind; defer production hardening explicitly but briefly.
- For ordinary delivery, follow the repository's existing contracts and verify the changed behavior at the cheapest useful boundary.
- Broaden into production-readiness, reliability, security, compatibility, or operational evidence only when the user requests it, the repository already requires it, or a concrete consequence makes it necessary.

Do not infer the highest assurance level from an empty repository, distributed-systems vocabulary, or the mere presence of a database, queue, credential, container, or external service. A relevant concern may need one local decision, not a design section, implementation, test suite, and document. Do not create infrastructure, diagrams, ADRs, compatibility matrices, exhaustive failure tests, or release artifacts solely to demonstrate compliance with this skill.

## Core reference

Before consequential engineering action, read [references/general-engineering.md](references/general-engineering.md) completely. For routine work, apply only its scope and safety guidance that is material. It owns the cross-cutting decision model: vertical delivery, authority and durability, recovery, retries, capacity, infrastructure boundaries, observability, lifecycle, baseline security, verification, and repository safety.

## Conditional references

Read a reference completely only when the task must decide, change, or review that domain. Mentioning a technology or touching a nearby file is not enough. Do not load adjacent concerns merely because they share vocabulary.

- [Quantum and monorepo](references/quantum-and-monorepo.md): defining or changing a quantum, ownership boundary, repository scope, logical infrastructure ownership, internal deployables, or effective change/deployment/failure coupling.
- [System architecture](references/system-architecture.md): composing multiple quanta, cross-system workflows, dependency classes, consistency, partitioning, failover, or umbrella validation.
- [Interfaces and contracts](references/interfaces-and-contracts.md): APIs, REST/OpenAPI, RPCs, events, schemas, storage abstractions, generated clients, errors, versioning, serialization, or compatibility.
- [Security](references/security.md): trust boundaries, authentication, authorization, credentials, secrets, sensitive data, cryptography, abuse controls, retention, or deletion.
- [Logging and observability](references/logging-and-observability.md): signal semantics, instrumentation, correlation, telemetry collection, cardinality, sampling, retention, or lifecycle visibility.
- [Testing and QA](references/testing.md): implementing a feature or fix, selecting evidence or test doubles, or reviewing unit, integration, end-to-end, smoke, failure, lifecycle, or compatibility tests.
- [Performance and benchmarks](references/performance-and-benchmarks.md): performance is a requirement or risk, a meaningful workload can be measured, or the testing review determines that benchmark code is required.
- [Code style](references/code-style.md): writing, reviewing, or refactoring code, especially names, comments, readability, and repository conventions.
- [Runtime artifacts and local deployment](references/runtime-artifacts-and-local-deployment.md): runnable processes, Dockerfiles, container contracts, Compose, local Kubernetes, readiness, shutdown, cleanup, or artifact smoke verification.
- [Project delivery workflow](references/project-delivery-workflow.md): starting or advancing a project or milestone, maintaining a blueprint, work specification, README, living design/status document, ADR, or documentation ownership and drift.
- [Documentation artifacts](references/documentation-artifacts.md): architecture documents or Draw.io diagrams, Typst reports, executable examples, localization, runbooks, releases, or migrations.
- [Technology preferences](references/technology-preferences.md): selecting languages, runtimes, or broadly reusable implementation defaults.
- [Data and messaging preferences](references/data-and-messaging-preferences.md): selecting databases, caches, brokers, CDC, object storage, or search engines.
- [Protocol and client preferences](references/protocol-and-client-preferences.md): selecting HTTP, proxies, Protobuf/gRPC, browser transports, SDKs, or frontend tooling.
- [Media technology preferences](references/media-technology-preferences.md): Stream-family codec, packaging, FFmpeg, playback, or hardware-acceleration work.
- [Identity and cryptography preferences](references/identity-and-cryptography-preferences.md): Accounts-family identity/credential design or choosing a new internal hash.
- [Observability and build preferences](references/observability-and-build-preferences.md): selecting telemetry backends, shared logging facilities, site/build tools, or VM/container development defaults.

## Application rules

Use the core decision frame only for decisions with meaningful consequences; do not output it as a template or repeat it under every specialized concern. Review questions and enumerations are prompts to select from, not required sections or test matrices. Specialized references own domain consequences and evidence, not a second copy of the general doctrine.

Keep implementation claims separate from verification evidence, but report both at the level useful to the task. Surface assumptions that materially change durability, security, compatibility, availability, latency, cost, or user-visible behavior. Do not expand a focused task into unrelated architecture, deployment, documentation, or benchmark work, and do not turn deferred hardening into a blocker for an explicitly exploratory or MVP outcome.

When local contracts deliberately differ, preserve them. Record a divergence only when it matters to the requested work.
