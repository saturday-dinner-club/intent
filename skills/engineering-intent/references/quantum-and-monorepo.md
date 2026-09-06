# Quantum and Monorepo

Status: reference scaffold

Use this reference when defining ownership boundaries, deciding whether code belongs in one repository, splitting runtime processes, or designing isolated development and release workflows.

## Intended scope

This reference will define a **quantum** as a boundary of ownership and independent evolution rather than a synonym for one binary, process, or microservice. It will describe how a quantum may use a monorepo while retaining multiple independently deployable processes and explicit internal boundaries.

## Topics reserved for expansion

- criteria for creating, splitting, and merging a quantum;
- relationship among domain ownership, repository ownership, and deployment units;
- permitted code sharing inside a quantum;
- dependency direction and prevention of accidental shared lifecycle;
- independent build, test, release, rollback, and migration expectations;
- local development without booting unrelated quanta;
- placement of generated contracts, adapters, commands, and internal packages.

Do not place the names, topology, or current state of particular products in this reference.
