# Logging and Observability

Status: living document

Last consolidated: 2026-09-07

Audience: maintainers, reviewers, and coding agents

## 1. Purpose

Use this reference when designing, implementing, reviewing, or operating logs, traces, metrics, telemetry collection, correlation, retention, or observability backends.

Observability exists to explain what the system did, why it did it, where time was spent, and which capacity or dependency became unhealthy. It is part of product behavior and operations, but it is not the source of business truth.

The owning quantum's contracts remain authoritative. This reference defines reusable signal roles and operating defaults without requiring one backend or deployment topology.

## 2. Keep signal roles distinct

Use the smallest signal that answers the intended question.

| Signal | Primary question | Normal shape |
| --- | --- | --- |
| Log | What meaningful fact or diagnostic condition was observed? | Structured event with timestamp, level, stable name, result, and context |
| Trace | Which causal path did one execution take, and where was time spent? | Spans connected by propagated context or links |
| Metric | How much, how often, how full, or how slow is the system? | Bounded-cardinality counters, gauges, and histograms |
| Audit record | Who performed a consequential action against which authority? | Durable, access-controlled record with actor, target, decision, and outcome |
| Domain event | Which durable business fact already occurred? | Owned, versioned contract with stable identity and replay semantics |

These signals may share a collector, broker, storage engine, or correlation identifiers. Shared infrastructure does not erase their semantic and durability differences.

- Diagnostic logs MUST NOT become an accidental command or source of business state.
- Domain events MUST NOT rely on parsing log message text.
- Audit records require their own durability, retention, access, and tamper-resistance policy.
- A log backend outage MUST NOT determine whether an authoritative transition succeeded.
- When one structured fact is intentionally projected into several signals, name the authoritative record and derive the others explicitly.

## 3. Use Span, State, Trend, and Context as a design lens

The four concepts are a review lens rather than a required application API.

### Span

A Span represents the lifetime of a request, method, dependency call, job, or other operation whose causal path and duration matter.

- Prefer an OpenTelemetry span over paired start and finish log lines.
- Name spans by stable operation or route template, not raw URL, user input, or entity ID.
- Record result, error status, relevant bounded attributes, and important child work.
- Do not create a span for every frame, packet, loop iteration, or similarly high-frequency item.
- Emit a completion log only when the completion is independently useful to an operator; do not duplicate every span as two logs.

### State

State records explain meaningful lifecycle and state transitions.

- A transition SHOULD identify the entity kind, previous state, next state, reason code, operation identity, and result when those values exist.
- A snapshot is appropriate at a bounded diagnostic checkpoint such as initialization, assignment, recovery, or finalization.
- Do not dump an entire request, configuration, object graph, or payload merely because it is available.
- A state log observes a transition; it does not replace the authoritative row, event, or state machine.
- Expected lifecycle states such as cancellation, disconnect, cache miss, or graceful drain are not warnings unless they violate an invariant or lose required work.

### Trend

Trend represents aggregate change over a window. It normally belongs in metrics rather than repeated logs.

- Use counters for occurrences and completed outcomes.
- Use gauges for current bounded state such as queue depth, active sessions, or remaining capacity.
- Use histograms for latency, size, age, and wait distributions.
- Derive percentiles from the telemetry backend rather than logging one record per observation.
- A periodic aggregate log MAY be useful when metrics are unavailable, but its window, reset behavior, and loss semantics must be explicit.

### Context

Context connects signals that describe the same execution or durable operation.

- Propagate W3C Trace Context across supported process boundaries.
- Carry the active context through in-process calls instead of replacing it with a background context.
- Use trace and span IDs for one sampled execution.
- Use request IDs when a client or gateway needs a stable request handle independent of sampling.
- Use operation and event IDs for retries, durable work, and replay whose lifetime exceeds one trace.
- Keep domain entity IDs as typed fields rather than embedding them in messages or span names.

Trace context is execution metadata. Do not persist it inside a durable event as a substitute for event identity, occurrence time, causality, or domain version.

## 4. Write structured events

Application logs SHOULD be one structured event per record, normally JSON at the process boundary.

A useful event contains only fields that answer an operational question:

- event timestamp;
- severity level;
- service name and, when useful, version and instance identity;
- stable event name or stable human-readable message;
- operation and result;
- typed domain and correlation identities;
- duration, size, count, or age with an unambiguous unit;
- stable error or reason code and safe diagnostic text;
- lifecycle phase, fallback mode, or retry disposition when material.

Prefer typed fields over formatted prose. Keep messages stable enough to search and aggregate; place IDs, counts, durations, and provider details in separate fields.

Use standard OpenTelemetry resource and semantic attributes where they fit. Domain-specific fields remain owned by the emitting quantum and need not become universal library fields.

Machine-consumed event families SHOULD have an owner and additive schema policy. Add an explicit schema version when consumers need to distinguish incompatible meanings. Do not reuse a field name for a new meaning or silently change its unit.

## 5. Apply levels by operational consequence

- `trace`: highly detailed temporary diagnosis, normally disabled.
- `debug`: repeatable successful calls and ordinary lifecycle detail useful during investigation.
- `info`: process lifecycle, meaningful normal transitions, assignment, recovery, and operator-relevant configuration mode.
- `warn`: handled degradation, fallback, partial loss, approaching capacity, or a condition likely to require attention if repeated.
- `error`: a request, durable operation, required finalization, or owned responsibility failed.

Do not raise a level merely because an error value exists. Cancellation by the caller, an expected not-found result, a rejected duplicate, and a configured fallback may be normal outcomes.

Fatal logging should not be a general error-handling mechanism. The composition root owns process exit after it has reported startup failure or an unrecoverable invariant and attempted bounded telemetry flush.

## 6. Protect the hot path

Logging and export must have explicit capacity and failure behavior.

- Domain code SHOULD write through a narrow logging facade rather than a vendor-specific fluent API.
- The default application path SHOULD write structured records to stdout or another local bounded writer for collection outside the process.
- A logger SHOULD NOT synchronously call a remote backend from a latency-sensitive request, media, or messaging path.
- Asynchronous buffers MUST be bounded and expose dropped, blocked, or rejected telemetry.
- Decide whether overload blocks briefly, drops low-severity events, samples repetition, or falls back to a local sink. Do not let an unbounded queue make the choice through memory exhaustion.
- One slow sink SHOULD NOT silently stall every producer or unrelated sink.
- High-frequency frame, packet, heartbeat, cache-hit, or retry-loop activity SHOULD be aggregated, sampled, or rate-limited.
- Repeated real-time reconnect attempts may remain immediate, but their logs and metrics must be sampled or aggregated so recovery does not create its own outage.

Ordering is scoped. Preserve order where it changes interpretation, such as transitions for one operation, but do not impose a global ordering cost on independent events without an operational need.

## 7. Separate application emission from collection

The preferred default separates local emission from remote export:

```text
application ── structured JSON stdout/file ──> collector ──> log backend
            └─ OTel trace and metric SDK ─────> collector ──> telemetry backends
```

This boundary keeps collector or backend latency away from the application logger and allows deployment-specific routing without coupling domain code to a backend.

- Collect stdout or a rotating file, not both, unless duplicate ingestion is intentionally deduplicated.
- Treat a file offset or collector queue as delivery state, not proof of permanent retention.
- Introduce a durable broker only when loss tolerance, replay, burst absorption, independent consumers, or regional routing justify its operational cost.
- If several consumers need the same record, use actual fan-out semantics; a competing consumer group distributes work instead.
- Collector processors may enrich resource metadata, redact fields, sample repetition, and route signals, but they must not invent domain meaning.
- Exporter and collector failure SHOULD degrade visibility rather than business correctness. Any stronger telemetry durability requirement must be explicit.

## 8. Choose storage for the query

Log storage is a query projection. Select it from the dominant access patterns, volume, retention, and operating cost.

### ClickHouse

Prefer ClickHouse for high-volume structured logs dominated by time ranges, exact field filters, grouping, rate calculations, and aggregate analysis. Its schema, sort key, partitioning, materialized views, and TTL should follow real queries rather than a generic event dump.

### OpenSearch

Prefer OpenSearch when free-text discovery, BM25 relevance, fuzzy matching, language analysis, or search-oriented exploration is a primary requirement. Do not pay its indexing and memory cost merely to run exact filters and time aggregations.

### Other backends

Loki or another log backend may remain the better operational fit for a smaller deployment or an established platform. Backend choice is not a domain contract.

Use dual ingestion during a material backend migration. Compare coverage, query results, ingest lag, retention, cost, and failure behavior before moving dashboards and alerts, then shorten or remove the old path deliberately. Do not preserve numeric benchmark claims as universal expectations; measure representative data and queries.

## 9. Control cardinality, payload, and sensitive data

High-cardinality identities are useful in logs and traces but usually unsafe as metric attributes.

- Use metric attributes that operators can enumerate, such as route template, method, status class, role, protocol, codec, result, or bounded reason code.
- Keep request, trace, operation, user, session, stream, object key, raw URL, IP address, and arbitrary error text out of metric labels.
- Never log passwords, tokens, cookies, authorization headers, private keys, OTPs, publish keys, DRM material, or recovery codes.
- Do not log complete request bodies, headers, URLs, configuration objects, environment maps, or content payloads by default.
- Prefer a stable non-secret identifier or keyed digest when correlation is needed without retaining the original value.
- Bound child-process lines, stack traces, nested fields, collections, and individual event size; record truncation explicitly.
- Treat access to logs as access to the sensitive data they contain.

Each quantum owns the classification and redaction of its domain fields. A shared library can provide safe constructors and deny known-dangerous fields, but it cannot infer every domain secret.

## 10. Define retention and deletion honestly

Retention follows data class and investigation need, not one platform-wide number.

- Separate short-lived debug detail, ordinary operational logs, security audit, and legally constrained data.
- Define the timestamp that starts retention and the behavior of late-arriving records.
- Apply TTL, partition dropping, or lifecycle policy according to the backend's deletion and compaction model.
- Account for replicas, queues, exports, archives, backups, dashboards, and derived indexes when making deletion claims.
- Keep telemetry only as long as it has a concrete operational, security, legal, or analytical purpose.

## 11. Preserve lifecycle visibility

Observability setup and shutdown are owned resources.

A normal process lifecycle SHOULD expose:

1. startup attempt and effective non-secret operating mode;
2. dependency and capability initialization results;
3. readiness and admission changes;
4. degradation, recovery, drain, and reassignment transitions;
5. bounded shutdown and final flush results.

Stop new work and drain owned work before shutting down telemetry providers. Flush metrics and traces with a bounded context, close local sinks, and continue cleanup even if one exporter fails. After remote providers are closed, use only a safe local fallback for final shutdown diagnostics.

A crash cannot flush reliably. Required recovery evidence must also exist in durable domain state, checkpoints, or events rather than only in a final log line.

## 12. Divide ownership

A shared observability library MAY own:

- the structured logger facade and typed fields;
- trace and metric bootstrap;
- resource construction and W3C propagation helpers;
- reusable HTTP, RPC, and process-output adapters;
- bounded provider shutdown and test helpers;
- baseline field, level, and redaction rules.

Each quantum owns:

- domain event names and state transitions worth recording;
- span boundaries and domain attributes;
- metric names, units, buckets, and bounded dimensions;
- dashboards, alerts, SLOs, and operational thresholds;
- domain-specific redaction and retention;
- the evidence that its critical paths are observable.

The platform or deployment owner owns collectors, credentials, backend topology, storage capacity, routing, and shared retention infrastructure. A shared platform records evidence; it does not become the owner of domain truth.

## 13. Verify useful visibility

Logging tests SHOULD prove behavior rather than exact prose alone:

- valid structured output and typed field preservation;
- level filtering and invalid configuration handling;
- trace, span, request, and operation correlation;
- redaction and maximum event size;
- partial child-process writes and line buffering;
- bounded buffer overflow, sampling, and sink failure behavior;
- exporter-disabled local operation;
- collector or backend outage isolation;
- shutdown timeout and cleanup after one provider fails;
- schema compatibility for machine-consumed event families;
- metric cardinality and unit review;
- representative throughput, burst, and retention behavior.

Inspect runtime output after implementation. A passing unit test does not prove that deployment collectors parse fields, preserve timestamps, correlate traces, avoid duplicates, or route data to the intended backend.

## 14. Review questions

| Concern | Question |
| --- | --- |
| Purpose | Which operator or engineering question does this signal answer? |
| Semantics | Is it a log, trace, metric, audit record, or domain event? |
| Authority | What durable state explains the truth if telemetry is missing? |
| Context | Which execution, operation, event, and domain identities must correlate? |
| Capacity | What bounds emission, buffering, event size, and exporter work? |
| Failure | What happens to business traffic when collection or storage is unavailable? |
| Privacy | Which fields are sensitive, who may query them, and when are they deleted? |
| Query | Which filters, aggregations, or text searches drive backend design? |
| Lifecycle | How are startup, readiness, degradation, drain, crash, and shutdown visible? |
| Evidence | Which tests and runtime checks prove the telemetry is actually useful? |
