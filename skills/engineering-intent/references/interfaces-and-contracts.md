# Interfaces and Contracts

Status: reference scaffold

Use this reference when designing or changing APIs, RPCs, events, schemas, storage adapters, shared libraries, generated clients, or compatibility rules.

## Intended scope

This reference will define interfaces and common contracts as semantic boundaries with explicit ownership and evolution rules, not as wrappers around whichever implementation is currently convenient.

## Topics reserved for expansion

- contract owner and source of truth;
- separation of commands, queries, events, projections, and bulk data paths;
- semantic operations and stable error taxonomy;
- idempotency, epochs, expected versions, cursors, and time semantics;
- payload, timeout, pagination, ordering, and backpressure contracts;
- additive evolution, deprecation, unknown fields, enums, and version negotiation;
- generated code versus handwritten adapters;
- tracing and correlation context across boundaries;
- contract tests, golden vectors, compatibility matrices, and migration order;
- small shared wire contracts without shared business logic or synchronized releases.

Technology-specific wire formats and endpoint catalogs remain in their owning repositories.
