# Logging and Observability

Status: living reference

Observability explains what the system did, why, where time went, and which capacity or dependency degraded. It is operational evidence, not business authority. Add or revise signals for a concrete operator, debugging, or product question; a new feature does not automatically need a complete logs-traces-metrics package. This reference owns signal semantics and behavior; backend preferences live in [observability-and-build-preferences.md](observability-and-build-preferences.md).

## Keep signal roles distinct

| Signal | Primary question | Normal shape |
| --- | --- | --- |
| Log | What meaningful fact or diagnostic condition was observed? | Structured event with stable name, result, and context |
| Trace | Which causal path did one execution take and where was time spent? | Linked spans with propagated context |
| Metric | How much, how often, how full, or how slow? | Bounded-cardinality counter, gauge, or histogram |
| Audit record | Who performed a consequential action against which authority? | Durable controlled record of actor, target, decision, and outcome |
| Domain event | Which durable owned fact occurred? | Versioned contract with identity and replay semantics |

Shared collectors, storage, or identifiers do not erase these differences. Do not parse logs as domain events, use telemetry as command state, or make authoritative success depend on a log backend. Audit requires its own durability, access, tamper, and retention contract. When one fact produces several signals, name its authority and derive the rest.

## Use span, state, trend, and context intentionally

- **Span:** trace a request, dependency call, job, or operation when causality and duration matter. Use stable operation names and bounded attributes. Avoid spans for every frame, packet, or loop iteration and duplicate start/finish logs.
- **State:** log meaningful transitions with entity kind, previous/next state, reason, operation, and result where available. Snapshots belong at bounded checkpoints such as initialization or recovery, not full object dumps.
- **Trend:** represent aggregate change with counters, gauges, and histograms. A periodic aggregate log is acceptable only with explicit window and loss semantics.
- **Context:** use W3C trace context for executions, request IDs for client handles, operation/event IDs for durable retries and replay, and typed entity IDs for domain correlation.

Trace context describes one execution; it cannot replace durable event identity, occurrence time, causality, or domain version. Expected cancellation, not-found, disconnect, cache miss, or graceful drain is not warning/error unless a contract is violated or required work is lost.

Cross-process latency often needs both traces and domain timestamps. A sampled trace shows causal work that survived sampling; occurrence, commit, publication, and application times allow delayed or replayed flows to be measured even when no complete trace exists. Link asynchronous work to its cause without pretending it remains one synchronous span lifetime.

## Emit useful structured events

Application logs should be one structured event per record, normally JSON at the process boundary. Include only fields that answer an operational question: timestamp, level, service/version/instance when useful, stable event name, operation/result, typed IDs, duration/size/count with units, safe error/reason code, and lifecycle or fallback mode.

Prefer typed fields over formatted prose. Use standard OpenTelemetry resource and semantic attributes where they fit; domain fields remain locally owned. Machine-consumed event families need an owner and additive schema policy, with an explicit version when incompatible meanings must coexist.

Apply levels by consequence:

- `trace`: temporary deep diagnosis, normally disabled;
- `debug`: ordinary successful calls and investigation detail;
- `info`: process lifecycle and meaningful normal transitions;
- `warn`: handled degradation, fallback, partial loss, or approaching capacity;
- `error`: failure of a request, durable operation, finalization, or owned responsibility.

An error value alone does not determine level. Fatal logging is not general error handling; the composition root owns bounded reporting and process exit for startup failure or unrecoverable invariants.

State transition records should use stable event and reason names even when their human message changes. Snapshot only the fields required to diagnose initialization, assignment, recovery, or finalization. Configuration logging should expose the effective non-secret mode and provenance, not dump environment maps or raw configuration objects.

## Protect the hot path and isolate collection

Domain code should use a narrow facade instead of a vendor fluent API. Prefer structured stdout or another local bounded writer, collected outside the process, plus OpenTelemetry SDK export for traces and metrics.

Do not synchronously call remote backends from latency-sensitive request, media, or messaging paths. Buffers must be bounded and expose drops, blocks, or rejection. Decide which severity may drop or sample, whether a producer blocks briefly, and whether local fallback exists. One slow sink must not stall unrelated work. Aggregate or rate-limit high-frequency retries, packets, frames, heartbeats, and cache hits.

Collectors may enrich resource metadata, redact, sample repetition, and route signals, but not invent domain meaning. A durable broker is justified only by explicit loss, replay, burst, fan-out, or routing needs. Competing consumers are not fan-out. Collector or backend failure normally reduces visibility, not business correctness.

Collect stdout or a rotating file intentionally; collecting both creates duplicates unless an identity and deduplication rule exists. File offsets and collector queues are delivery state, not proof of permanent retention. If telemetry itself has a durability requirement—commonly audit—separate that contract from ordinary diagnostic export.

## Control cardinality, payload, and sensitive data

Metric dimensions should be enumerable, such as route template, method, status class, role, protocol, result, or bounded reason. Keep request, trace, user, session, stream, raw URL, IP, arbitrary error, and other unbounded identities out of labels; they may belong in controlled logs or traces.

Never emit passwords, tokens, cookies, authorization headers, private keys, OTPs, publish/DRM material, recovery codes, or sensitive content. Avoid full requests, headers, URLs, configuration, environment maps, and payloads by default. Bound event size, nesting, stack traces, collections, and child-process lines; mark truncation. Treat log access as sensitive-data access.

Each quantum owns domain classification and redaction. A shared library can deny known-dangerous fields, not infer every secret.

When correlation needs a sensitive value, prefer a stable non-secret identifier or carefully scoped keyed digest rather than the original. Hashing does not automatically anonymize low-entropy or enumerable data. Record truncation and redaction as structured facts so missing detail is not mistaken for an empty source value.

## Match storage and retention to questions

Log storage is a query projection. Select by filters, aggregation, text search, volume, retention, latency, and operating cost rather than making the backend a domain contract. During migrations, dual-ingest deliberately and compare coverage, results, lag, cost, retention, and failure before moving dashboards and retiring the old path.

Schema, sort/partition keys, indexes, materialized views, and TTL should follow actual operator queries. Structured time-range aggregation and free-text relevance impose different storage costs. Do not preserve benchmark numbers as universal expectations; measure representative event shapes and queries in the intended topology.

Retention follows data class and investigation need. Separate debug, normal operations, security audit, and regulated data; define the starting timestamp and late-arrival behavior; account for queues, replicas, exports, archives, backups, dashboards, and indexes. Keep telemetry only for a concrete operational, security, legal, or analytical purpose.

## Preserve lifecycle visibility

A production long-running process should expose the lifecycle transitions operators actually need. Select among startup mode, dependency initialization, readiness, admission, degradation, recovery, drain, reassignment, shutdown, and flush rather than emitting every transition for a prototype or short-lived command.

Stop admission and drain owned work before closing telemetry. Flush with a deadline, continue cleanup after exporter failure, and use only a safe local fallback after remote providers close. Crash-time flush is unreliable; recovery-critical evidence also belongs in durable domain state, events, or checkpoints.

Shared observability code may own logger facades, trace/metric bootstrap, resource metadata, propagation, common adapters, bounded shutdown, and baseline redaction. Each quantum owns meaningful domain events and spans, metric units and dimensions, SLOs, dashboards, alerts, and evidence. The platform owner owns collectors, credentials, routing, storage capacity, and shared retention.

Instrumentation should follow an explicit signal gap. First trace the runtime path and identify the transition, edge, or capacity question that cannot currently be answered; then add the smallest signal that answers it. Broad instrumentation without a question often creates cost and cardinality while still missing the real failure boundary.

## Verify useful visibility

Test the signal properties changed or relied on by the current claim. Options include structured fields, levels, correlation, redaction, size bounds, overflow, sampling, sink isolation, exporter failure, shutdown, schema compatibility, metric units/cardinality, or burst behavior. Inspect deployed or local-runtime output only when collector or backend behavior is part of the claim; unit tests cannot prove those external properties.

Observability-specific review questions are: Which operator question does each signal answer? Are signal types and authority distinct? Which identities correlate execution versus durable work? What bounds the hot path? What happens during exporter failure? Which sensitive fields and retention apply? Can lifecycle and recovery be observed in the actual runtime?
