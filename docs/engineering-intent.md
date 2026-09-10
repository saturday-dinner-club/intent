# Engineering Intent

The agent-facing source uses progressive references so a task loads only the guidance it needs. This page is the human-readable index and does not duplicate their contents.

## Normative core

- [General engineering](../skills/engineering-intent/references/general-engineering.md): always-loaded vertical delivery, authority, durability, recovery, retries, failure isolation, capacity, lifecycle, baseline security, verification, and repository safety.

## Engineering domains

- [Quantum and monorepo](../skills/engineering-intent/references/quantum-and-monorepo.md): complete independently operable quanta, logical ownership, repository cohesion, and intended versus effective boundaries.
- [System architecture](../skills/engineering-intent/references/system-architecture.md): composition between quanta, dependency classes, consistency, scaling, ownership movement, regions, failure propagation, and umbrella validation.
- [Interfaces and contracts](../skills/engineering-intent/references/interfaces-and-contracts.md): command/query/event semantics, acknowledgments, stable errors, time and ordering, capacity, long-lived sessions, compatibility, serialization, adapters, REST, and OpenAPI.
- [Security](../skills/engineering-intent/references/security.md): threat-model-first controls, authentication and authorization, credentials, secrets, rotation, compromise recovery, sensitive data, audit, and security verification.
- [Logging and observability](../skills/engineering-intent/references/logging-and-observability.md): logs, traces, metrics, audit and domain-event distinctions, correlation, hot-path isolation, collection, cardinality, retention, and lifecycle visibility.

## Implementation and evidence

- [Testing and QA](../skills/engineering-intent/references/testing.md): unit, integration, end-to-end, and mandatory per-feature smoke evidence; embedded implementations and narrow doubles; external skips; failure, lifecycle, fixtures, suites, and honest reporting.
- [Performance and benchmarks](../skills/engineering-intent/references/performance-and-benchmarks.md): conditional benchmark-code requirement, representative workloads, reproducibility, evidence boundaries, and noisy-environment interpretation.
- [Code style](../skills/engineering-intent/references/code-style.md): familiar precise names, intent-focused comments, local readability, and repository conventions.
- [Runtime artifacts and local deployment](../skills/engineering-intent/references/runtime-artifacts-and-local-deployment.md): reproducible processes, practical mandatory Dockerfiles, container contracts, Compose or local Kubernetes fixtures, readiness, shutdown, smoke, and scoped cleanup.

## Project knowledge

- [Project delivery workflow](../skills/engineering-intent/references/project-delivery-workflow.md): project blueprints, milestone work specifications, continuously maintained READMEs, living documents, ADR lifecycle, ownership, and drift prevention.
- [Documentation artifacts](../skills/engineering-intent/references/documentation-artifacts.md): architecture documents and Draw.io, Typst reports, executable examples, localization, releases, migrations, runbooks, provenance, and sensitive-information handling.

## Technology defaults

- [Technology preferences](../skills/engineering-intent/references/technology-preferences.md): requirement-first selection plus general language and runtime defaults.
- [Data and messaging preferences](../skills/engineering-intent/references/data-and-messaging-preferences.md): PostgreSQL, CDC, SQLite, Pebble, Redis, Kafka, NATS, Cassandra, S3-compatible storage, and search projections.
- [Protocol and client preferences](../skills/engineering-intent/references/protocol-and-client-preferences.md): HTTP/JSON and edge proxies, Protobuf/gRPC/Buf, browser transports, clients, and frontend tooling.
- [Media technology preferences](../skills/engineering-intent/references/media-technology-preferences.md): Stream-family FFmpeg, codec, packaging, acceleration, and Shaka Player choices.
- [Identity and cryptography preferences](../skills/engineering-intent/references/identity-and-cryptography-preferences.md): Accounts-family identity, credential, secret, signing, and internal hashing choices.
- [Observability and build preferences](../skills/engineering-intent/references/observability-and-build-preferences.md): logging and telemetry stack, backend selection, VM/container baseline, and site/build tools.

The latest explicit user decision and the current system's documented invariants take precedence over these references.
