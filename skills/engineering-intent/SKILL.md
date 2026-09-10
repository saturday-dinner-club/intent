---
name: engineering-intent
description: Apply a durability-first, failure-aware decision framework to substantive software design, implementation, review, testing, documentation, and hardening. Use when work affects state, boundaries, retries, security, interfaces, architecture, observability, lifecycle, deployment, QA, or delivery evidence. Do not use for simple factual answers, cosmetic edits, or merely running an already specified command.
---
# Engineering Intent

Apply the references that materially affect the requested work. Preserve the latest explicit user decision and the repository's established contracts over these defaults.

## Required core

Before substantive action, read [references/general-engineering.md](references/general-engineering.md) completely. It owns the cross-cutting decision model: vertical delivery, authority and durability, recovery, retries, capacity, infrastructure boundaries, observability, lifecycle, baseline security, verification, and repository safety.

## Conditional references

Read each applicable reference completely; do not load adjacent concerns merely because they share vocabulary.

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

Use the core decision frame only for material decisions; do not repeat it under every specialized concern. Specialized references own domain consequences and evidence, not a second copy of the general doctrine.

Keep implementation claims separate from verification evidence. Surface assumptions that change durability, security, compatibility, availability, latency, cost, or user-visible behavior. Do not expand a focused task into unrelated architecture, deployment, documentation, or benchmark work.

When local contracts deliberately differ, preserve them. Record a divergence only when it matters to the requested work.
