# Observability and Build Preferences

Status: living reference

Use [logging-and-observability.md](logging-and-observability.md) for signal behavior and [runtime-artifacts-and-local-deployment.md](runtime-artifacts-and-local-deployment.md) for artifact contracts. This reference selects established tools without making them universal architecture.

## Observability stack

Go services prefer the shared `github.com/saturday-dinner-club/log` zerolog facade for structured JSON and OpenTelemetry for traces and metrics. W3C context and OTLP/HTTP connect quanta while domain code remains independent of exporters.

Prometheus, Grafana, Tempo, Loki, and OpenTelemetry Collector are useful current defaults. Prefer ClickHouse for high-volume structured log filtering, time aggregation, and analytical queries; prefer OpenSearch when free-text relevance, fuzzy search, or language analysis is primary. Loki or an established smaller platform may fit better. Backend choice follows actual query, volume, retention, and operations.

ClickHouse schemas, ordering keys, partitions, materialized views, and TTL should follow common exact filters and aggregations. OpenSearch earns its indexing and memory cost when text analysis and relevance are primary. A migration should dual-ingest long enough to compare coverage, query behavior, lag, retention, failure, and cost before dashboards and alerts move.

The shared logging facade owns common fields, local sinks, context correlation, and bounded provider shutdown; each quantum still owns domain events, redaction, metric dimensions, SLOs, dashboards, and alerts. A collector outage should normally reduce visibility rather than block domain traffic.

## Build and local operation

The current baseline is an independently runnable process on a VM, with the same artifact suitable for containers. Give practical processes Dockerfiles and real readiness; use Compose for one quantum and necessary local dependencies; keep neighboring quanta replaceable by compatible substitutes. Kubernetes is optional and must preserve lifecycle, storage ownership, and failure boundaries.

Use Hugo for content-first sites and Vite for interactive applications or demos when those shapes fit. Nginx or Caddy may own edge TLS, routing, and DNS re-resolution but never business authority. A started container is not necessarily ready for assignment.

VM-first is a priority, not a ban on Kubernetes. Compose versions and single-node data services are reproducible local fixtures rather than capacity or high-availability recommendations. The same process contract—configuration, state, readiness, signals, and recovery—should survive movement between VM and container packaging.
