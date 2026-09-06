# System Architecture

Status: reference scaffold

Use this reference when relating multiple quanta, evaluating whole-system topology, choosing synchronous or asynchronous interaction, or planning cross-quantum integration and failure tests.

## Intended scope

This reference will define how autonomous quanta compose into a system without turning this repository into a catalog of actual services.

## Topics reserved for expansion

- domain data and decision ownership;
- dependency direction and avoidance of synchronous cycles;
- synchronous request, durable asynchronous work, and disposable notification criteria;
- failure-containment and degraded-mode boundaries;
- cross-quantum identity, correlation, and causal context;
- independent deployment, compatibility windows, rollback, and migration sequencing;
- local fakes and contract-compatible substitutes;
- distinction between quantum-level tests and umbrella end-to-end environments;
- architecture diagrams as explanations of ownership, flow, and failure rather than inventories;
- evidence required before claiming system-wide availability or consistency.

Actual quanta, service names, routes, infrastructure products, and live topology belong to an umbrella architecture repository or the owning systems.
