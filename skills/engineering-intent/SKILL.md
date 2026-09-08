---
name: engineering-intent
description: Apply a durability-first, failure-aware decision framework when designing, planning, implementing, reviewing, testing, or hardening software. Use for substantive work involving state, service or repository boundaries, retries, security, interfaces, contracts, cross-system architecture, observability, lifecycle, deployment, QA strategy, or completion evidence. Do not use for simple factual answers, purely cosmetic edits, or merely running an already specified test command.
---

# Engineering Intent

Use this skill to apply reusable engineering philosophy without replacing explicit user choices or the current system's documented invariants.

## Required reference

Before substantive action, read [references/general-engineering.md](references/general-engineering.md) completely. It defines the shared decision framework for vertical delivery, durability, recoverable atomicity, failure isolation, retry classes, bounded ownership, infrastructure boundaries, observability, lifecycle, security basics, verification, and safe repository work.

## Conditional references

Read every reference whose condition applies to the task. Do not read unrelated references merely because they exist.

- Read [references/quantum-and-monorepo.md](references/quantum-and-monorepo.md) when defining or reviewing a complete independently operable quantum, ownership and data boundaries, monorepo scope, deployable processes, logical infrastructure ownership, package placement, isolated development, release independence, or effective change and failure coupling.
- Read [references/security.md](references/security.md) when the work involves trust boundaries, authentication, authorization, credentials, secrets, personal or sensitive data, cryptography, abuse controls, retention, or deletion.
- Read [references/interfaces-and-contracts.md](references/interfaces-and-contracts.md) when designing or changing APIs, RPCs, events, schemas, storage abstractions, shared libraries, generated clients, error semantics, versioning, or compatibility.
- Read [references/system-architecture.md](references/system-architecture.md) when relating multiple quanta or systems, selecting synchronous versus asynchronous interaction, evaluating dependency direction and failure propagation, or planning cross-system integration and whole-system validation.
- Read [references/logging-and-observability.md](references/logging-and-observability.md) when designing, implementing, reviewing, or operating structured logs, traces, metrics, signal correlation, telemetry collection, observability storage, cardinality, sampling, or telemetry lifecycle.
- Read [references/testing.md](references/testing.md) when implementing a feature or fix, planning or reviewing QA, writing or interpreting unit, integration, end-to-end, smoke, regression, compatibility, failure, concurrency, or performance tests, selecting test doubles or embedded dependencies, deciding whether benchmark code is warranted, or making completion and verification claims.
- Read [references/technology-preferences.md](references/technology-preferences.md) when selecting or reviewing programming languages, runtimes, databases, caches, brokers, storage, transports, serialization, media tooling, browser SDKs, observability stacks, build tools, or deployment tooling. Treat its choices as evidence-backed defaults, not mandates.

When multiple conditions apply, read the relevant references together and resolve overlap in favor of the narrower guidance. The latest explicit user decision remains authoritative.

## Apply the guidance

Use the references to identify the decisions that materially affect the requested work. Make safe, scoped assumptions when they do not alter product behavior. Surface an assumption when it changes durability, security, compatibility, availability, latency, cost, or user-visible behavior.

Keep implementation and verification claims separate. Do not expand a focused task into unrelated infrastructure work merely because a reference describes a broader ideal.

If local contracts deliberately differ from these general defaults, preserve the local contract and note the divergence only when it matters to the request. Do not convert a product-specific choice or isolated failure into a universal rule.
