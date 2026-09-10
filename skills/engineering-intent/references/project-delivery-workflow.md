# Project Delivery Workflow

Status: living reference

This reference owns the lifecycle, authority, and maintenance of project knowledge. Documentation should let its audience understand current behavior, continue the work, reproduce important decisions and evidence, and distinguish plans from implementation.

Use the smallest document topology that gives each fact one clear owner. Do not create every artifact by default or duplicate the same normative contract in several places.

## Match artifacts to lifecycle

| Need | Primary artifact | Lifecycle |
| --- | --- | --- |
| Project framing | Blueprint | Current project map |
| Milestone execution | Work specification | Living while active; historical when complete |
| Use and contribution | README | Continuous current entry point |
| Active design or investigation | Design, plan, research, or status document | Living until resolved |
| Settled consequential decision | ADR | Immutable history, later superseded by another ADR |
| Public integration | Owned contract and derived reference | Updated with the interface |
| Operations and change | Runbook, migration, deployment, or release guide | Current for supported versions |
| Bounded analysis | Markdown or Typst report | Versioned evidence |

Follow established paths. Otherwise use simple locations such as `docs/blueprint.md`, `docs/milestones/`, `docs/adr/`, `docs/architecture.md`, `docs/reports/`, and `docs/runbooks/` only as needed. Organize current-state documents by reader concepts, not implementation chronology.

For each maintained artifact, make its audience, authority, status, and change trigger apparent. A document may describe current truth, an active proposal, an execution record, or historical reasoning; ambiguity between those states creates drift. Links should lead from broad entry points to the narrow owner rather than copying the same explanation upward.

## Start substantive projects with a blueprint

Every substantive project must begin with a blueprint. Before a major expansion of an existing project without one, reconstruct the smallest accurate blueprint.

Include the concerns that shape delivery:

- purpose, users, desired outcomes, context, goals, non-goals, and scope;
- representative user journeys and functional capabilities;
- quality targets expressed through measurable workloads, threats, or acceptance conditions;
- assumptions, constraints, external dependencies, and unresolved risks;
- quanta, deployables, ownership, dependency direction, and major interfaces;
- authoritative data, durability, projections, recovery, runtime topology, lifecycle, and failure isolation;
- trust boundaries, credentials, sensitive data, observability, and operations;
- unit, integration, end-to-end, smoke, and performance QA strategy;
- milestone map, sequencing constraints, pending decisions, and links to authoritative contracts.

Do not invent providers, ports, schemas, or topology to fill a template. Mark status, ownership when known, meaningful update date, and superseding decisions. Keep the blueprint as the current project map; move settled consequential reasoning to ADRs.

A blueprint is intentionally broader than one milestone but shall not become an aspirational handbook. Distinguish committed scope from possible later work, and link changing implementation details to their owning specifications. Update it when the project purpose, quantum boundaries, quality goals, milestone map, or principal risks change—not for every local refactor.

## Specify every milestone

Before implementation, create or update a work specification for each coherent milestone outcome. It should make the work executable and reviewable without dictating incidental implementation details.

Record:

- objective and user or operator outcome;
- starting state and available evidence;
- in-scope and out-of-scope behavior;
- prerequisites, dependencies, and sequencing;
- affected contracts, data, components, and user entry points;
- coherent tasks or vertical slices and their dependencies;
- migration, compatibility, rollout, rollback, cleanup, failure, recovery, lifecycle, security, and observability where material;
- observable acceptance criteria and planned unit, integration, end-to-end, mandatory smoke, and conditional benchmark evidence;
- expected README, architecture, interface, operational, release, localization, diagram, and report updates;
- risks, assumptions, open questions, status, deviations, and remaining work.

Update the specification when discovery changes scope, architecture, sequence, acceptance, or risk. At completion, record delivered behavior and deviations, link evidence and affected artifacts, mark remaining work explicitly, and extract settled architectural decisions to ADRs. The completed specification records execution; an ADR records why a consequential choice was accepted.

Do not mark a milestone complete from task checkboxes alone. Its acceptance record should say which externally observable outcome exists, which verification ran, which prerequisites caused skips, and which operational or subjective checks remain. Preserve the initial intent and final result without leaving contradictory current-status paragraphs.

## Keep the README current

Every usable project needs a README from which a new reader can understand and begin using the current project. Cover applicable current capabilities, audience, prerequisites, installation, build, configuration, execution, smallest successful workflow, entry points, state and security considerations, fallbacks, limits, unsupported cases, QA commands, and links to deeper documents.

Lead with current usable behavior. Keep commands copyable, placeholders obvious, and expected results visible. Link to authoritative detail instead of duplicating it.

Update the README in the same change when user-visible behavior, platforms, formats, setup, configuration, commands, limits, fallback, security expectations, verification, or known limitations change. Label plans, prototypes, and unverified paths; never document them as current capability.

The README is a map, not a mirror of every reference. It should link the blueprint for project intent, architecture for relationships, contract authority for exact interfaces, and runbooks for operational detail. Avoid badges, history, or aspirational roadmaps obscuring how to perform the smallest successful workflow now.

## Maintain living documents; preserve settled decisions

An active design, plan, investigation, or status document should state its status, current baseline and evidence, accepted decisions, unresolved questions, completed work, remaining work, and last meaningful consolidation. Rewrite contradictions into a current coherent view; use version control and historical artifacts for chronology.

Once the responsible authority accepts a consequential decision, create an ADR. Include identifier, title, date, status and owner when known; context and constraints; accepted decision; meaningful alternatives; trade-offs and consequences; compatibility, migration, security, operational, and cost impact; implementation and verification references; and related ADRs.

Do not rewrite an accepted ADR to make a later choice appear inevitable. Create a superseding ADR and link both directions. README and living architecture describe what is true now; ADRs explain why decisions were made.

Not every implementation choice deserves an ADR. Use one when alternatives and consequences affect architecture, compatibility, security, operations, data ownership, or cost beyond the immediate edit. Keep minor reversible choices in code, the active specification, or ordinary review history.

## Own contracts without duplicating semantics

[Interfaces and contracts](interfaces-and-contracts.md) is the normative owner for API, protocol, event, schema, error, compatibility, and OpenAPI semantics. Delivery documentation must identify the authoritative schema or code, publish the appropriate human or generated reference, link it from entry points, and keep derivatives synchronized in the same change.

Never maintain two apparently authoritative descriptions by hand. Generate one, or state which wins and verify drift. Documentation describes how consumers discover and use the contract; it does not redefine the contract model.

During implementation, create a focused document only when a concern has a different audience or lifecycle: architecture, contracts and configuration, data/migration, deployment and recovery, security, experiments and compatibility, release notes, or long-running implementation status. Each should state who uses it, which source wins, when it changes, and how its claims are checked.

For long-running work, a current implementation-status document may summarize what exists by capability, not by commit chronology. Tie each status claim to code, tests, runtime evidence, or an explicit external blocker. Remove completed temporary checklists when the milestone record and current documentation now own the facts; otherwise stale progress documents become a second source of truth.

Research and provider comparisons should separate official capability, observed behavior, inference, and local preference. Record the version, environment, date, representative workload, and decision consequence when those facts can change. A vendor claim may inform a proposal but does not substitute for compatibility or operational evidence in the intended system.

## Prevent drift

When behavior changes, search its README and localized variants, blueprint, active milestone, architecture and diagrams, ADR links, contracts and generated references, examples and sample configuration, QA commands and reports, releases, migrations, runbooks, and known limitations. Update or remove stale claims in the same vertical slice.

Automate semantic drift checks when practical: compile examples, validate links and paths, parse schemas and configuration, compare generated artifacts with their authority, test documented commands and served documentation, and render owned diagrams or reports. Avoid tests that freeze prose or heading count.

Generated references should record the generator and authoritative input. When regeneration changes output unexpectedly, review it as a contract change rather than overwriting by habit. When manual prose and generated material overlap, reduce the prose to interpretation and navigation so the generator owns exact fields and shapes.

An internal refactor with no change to documented behavior, boundary, command, interface, operation, or architectural relationship does not require artificial documentation churn. Confirm that the owning facts remain accurate.

## Report documentation evidence

On handoff, distinguish artifacts changed, behavior or contracts covered, checks performed, current sources and renders inspected, intentionally unchanged documents, and stale, blocked, proposed, subjective, or externally owned claims.

Workflow-specific review questions are: Is there a current blueprint? Is the active milestone executable and current? Can a new reader safely use the project from the README? Does every fact have one owner and lifecycle? Did a settled decision become an ADR? Which documents or derivatives can drift, and how were they checked?
