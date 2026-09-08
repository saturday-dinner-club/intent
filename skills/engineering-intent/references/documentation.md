# Documentation

Status: living document

Last consolidated: 2026-09-08

Audience: maintainers, reviewers, and coding agents

## 1. Purpose

Documentation is a maintained interface to the current system and the reasoning that shaped it. A reader should not have to reconstruct essential behavior, boundaries, commands, or decisions from source code and commit history.

Good documentation enables its intended audience to:

- understand what the project is and what it currently does;
- start, use, integrate, test, operate, and troubleshoot it;
- understand ownership, architecture, data, and failure boundaries;
- distinguish implemented behavior from plans and unresolved work;
- reproduce important decisions, experiments, and verification;
- continue a milestone without rediscovering its scope and acceptance criteria.

Documentation is not complete because prose exists. It is complete when it is accurate, appropriately placed, discoverable, and maintained with the behavior it describes.

The keywords **MUST**, **SHOULD**, and **MAY** describe defaults. They do not override the user's latest explicit direction or the owning system's established contracts.

When guidance conflicts, use this order:

1. the user's latest explicit decision;
2. the current system's documented invariants and authoritative specifications;
3. this documentation guidance;
4. formatting preference or documentation convenience.

## 2. Organize documentation by lifecycle and audience

Use the smallest document topology that preserves the necessary truth.

| Stage or need | Primary artifact | Role |
| --- | --- | --- |
| Project initiation | Project blueprint | Defines why the project exists, its boundaries, intended architecture, quality goals, and milestone map |
| Milestone preparation and execution | Milestone work specification | Defines the next coherent outcome, exact scope, tasks, acceptance evidence, and current progress |
| Ordinary use and contribution | README | Provides the complete current entry point for users and contributors |
| Active design or investigation | Living design, plan, research, or status document | Changes as evidence and implementation evolve |
| Settled decision | Architecture Decision Record | Preserves the accepted decision, context, trade-offs, and consequences |
| Public integration | API, schema, configuration, or protocol reference | Defines an exact external contract and compatibility expectations |
| Operations and change | Runbook, migration, deployment, or release document | Makes lifecycle, recovery, rollout, and user impact reproducible |
| Bounded analysis | Typst or Markdown report | Preserves evidence, methods, findings, and conclusions for review |

Do not create every document type by default. Create an artifact when it has a distinct audience, authority, lifecycle, or maintenance need. Prefer a clear README and a few owned references over a taxonomy of empty or overlapping files.

Current-state documents should be organized by the concepts a reader needs, not by the chronology of implementation. Chronology belongs in ADRs, milestone records, releases, incidents, and other historical artifacts.

Follow the repository's established paths when they exist. Otherwise prefer simple defaults such as:

```text
README.md
docs/
├── blueprint.md
├── architecture.md
├── architecture.drawio
├── architecture.svg
├── milestones/
├── adr/
├── reports/
└── runbooks/
```

Create only the paths the project actually needs.

## 3. Create a project blueprint at the start

Every substantive project MUST begin with a blueprint before implementation spreads across disconnected components. For an existing project without one, reconstruct the smallest accurate blueprint before a major expansion or architectural change.

The blueprint defines the initial shared model of the project. Include the sections that materially affect delivery:

- purpose, problem, intended users, and desired outcome;
- current context and why the project should exist;
- goals, non-goals, scope, and explicit exclusions;
- representative user journeys or externally observable workflows;
- functional capabilities;
- quality attributes such as durability, latency, capacity, security, privacy, compatibility, accessibility, or portability;
- assumptions, constraints, and externally owned dependencies;
- system context, architecture quanta, deployables, and ownership boundaries;
- dependency direction and major interfaces;
- authoritative data, durability boundaries, projections, and recovery;
- runtime topology, deployment shape, lifecycle, and failure isolation;
- trust boundaries, credentials, sensitive data, and threat assumptions;
- observability and operational expectations;
- unit, integration, end-to-end, smoke, and performance QA strategy;
- milestone map, sequencing constraints, and major dependencies;
- known risks, unresolved questions, and decisions that must become ADRs;
- links to the authoritative contracts and supporting evidence.

Use measurable statements where measurement matters. Replace vague goals such as `fast`, `secure`, or `scalable` with a declared workload, threat, boundary, or acceptance condition.

The blueprint is not a speculative implementation manual. Preserve room for decisions that legitimately belong to a milestone. Do not invent providers, schemas, ports, or deployment topology solely to fill a section.

Mark the blueprint's status, owner or owning team when known, last meaningful update, and links to superseding decisions. Keep it as the current project map as the system evolves; record settled architectural decisions separately as ADRs.

## 4. Write a work specification for every milestone

Before starting a milestone, create or update a milestone work specification. A milestone is a coherent externally meaningful outcome, not merely a time box or a bucket of unrelated tickets.

The specification MUST make the work executable and reviewable:

- milestone objective and user or operator outcome;
- starting state and evidence already available;
- in-scope and out-of-scope behavior;
- prerequisites, external dependencies, and sequencing constraints;
- affected contracts, data, components, interfaces, and user entry points;
- vertical slices or tasks with clear ownership and dependencies;
- migration, compatibility, rollout, rollback, and cleanup when relevant;
- failure, recovery, lifecycle, security, and observability requirements;
- acceptance criteria expressed as observable behavior;
- planned unit, integration, end-to-end, and mandatory smoke evidence;
- benchmark or performance work when meaningful measurement is possible;
- README, architecture, API, operational, release, localization, diagram, and report updates expected from the milestone;
- risks, assumptions, open questions, and decisions still pending;
- current status, completed evidence, deviations, and remaining work.

Tasks should be specific enough that completion can be demonstrated, but should not prescribe incidental implementation details that the assigned engineer can safely choose.

Keep the specification current while the milestone is active. Update it when discoveries change scope, architecture, sequence, acceptance criteria, or remaining risk. Do not leave a contradicted plan as the apparent source of truth.

At milestone completion:

- record the delivered behavior and meaningful deviations from the initial plan;
- link the implementation, tests, smoke result, benchmark report, release notes, and operational evidence;
- mark remaining work explicitly rather than implying it shipped;
- extract settled architectural decisions into ADRs;
- preserve the completed milestone document as a historical execution record.

A completed milestone specification is not itself an ADR. It records what was planned and delivered; an ADR records why a consequential choice was made.

## 5. Maintain the README as the complete current entry point

Every usable project MUST have a README that lets a new reader understand and begin using the current project without first exploring the source tree.

Adapt the structure to the project, but cover the applicable questions:

- What is the project, who is it for, and what does it currently do?
- Which capabilities are implemented now?
- What platforms, runtimes, tools, accounts, devices, or services are required?
- How is it installed, built, configured, and run?
- What is the smallest successful workflow?
- What are the primary user, CLI, library, API, or service entry points?
- Where is state stored and which security or privacy behavior matters to users?
- Which fallbacks, limits, unsupported cases, and known operational constraints matter?
- How are local tests, external integrations, smoke tests, and benchmarks run?
- Where are deeper architecture, contract, operational, milestone, release, and contribution documents?

Lead with current purpose and usable behavior. Keep commands copyable, placeholders obvious, and expected outcomes clear. Do not fill the opening with internal history, aspirational features, or badges that obscure what the project does.

The README is a map and an operational entry point, not a duplicate of every reference. Summarize the facts necessary to start safely and link to the authoritative deeper document.

Update the README continuously in the same change whenever user-visible behavior, supported platforms or formats, installation, configuration, primary commands, limits, fallbacks, security expectations, verification, or known limitations change.

Do not document planned behavior in the present tense. Label prototypes, incomplete paths, experiments, and externally unverified claims explicitly.

## 6. Create focused documents during implementation

As work proceeds, create focused documents when a concern has its own audience or lifecycle:

- architecture and runtime topology;
- public APIs, protocols, events, schemas, and configuration;
- data ownership, durability, migration, and retention;
- deployment, startup, readiness, shutdown, recovery, and incident runbooks;
- security model, trust assumptions, credential handling, and deletion;
- experiments, provider research, benchmarks, and compatibility findings;
- release notes, upgrade guides, and known limitations;
- agent-facing integration or repository skills;
- current implementation status for long-running work.

Each document should answer:

- who needs this;
- which source or owner is authoritative;
- whether it describes current truth, a proposal, or historical evidence;
- what event requires it to change;
- how a reader verifies its claims.

Avoid documents that merely restate code names or directory structure without explaining decisions, contracts, or consequences. A file tree can orient a reader, but it is not an architecture explanation.

## 7. Keep active work living; preserve settled decisions as ADRs

An active design, plan, investigation, or implementation-status document is a living document. Update it as facts change. It SHOULD state:

- status such as draft, proposed, active, blocked, or complete;
- the current baseline and evidence;
- decisions already made;
- unresolved questions and pending choices;
- work completed and work remaining;
- the date of the last meaningful consolidation.

Do not append contradictory updates indefinitely. Consolidate the current truth so a reader does not need to infer which paragraph is newest. Preserve important history through version control, milestone records, reports, and ADRs.

When a consequential decision becomes settled, record it as an Architecture Decision Record. A decision is settled when the responsible authority has accepted the choice and its intended consequences, even if rollout continues later.

An ADR SHOULD contain:

- identifier, title, date, status, and decision owner when known;
- context and the problem that required a choice;
- governing constraints and invariants;
- the accepted decision;
- meaningful alternatives and why they were not selected;
- trade-offs and expected positive and negative consequences;
- compatibility, migration, security, operational, and cost impact;
- implementation and verification references;
- relationships to earlier or later ADRs.

Accepted ADRs are historical records. Do not rewrite an old ADR to make a later choice appear inevitable. Correct trivial errors visibly; when the decision changes, create a new ADR and mark the prior record superseded or deprecated with links in both directions.

Living architecture and README documents MUST reflect the current system even when the path to that state is preserved in ADRs. ADRs explain why; current-state documents explain what is true now.

## 8. Maintain architecture documentation and Draw.io diagrams

Architecture documentation should explain the relationships and constraints that source code alone does not make clear:

- system context and external actors;
- architecture quanta, deployable processes, and ownership;
- dependency direction and allowed cross-boundary interaction;
- public interfaces, protocols, and data flows;
- authoritative state, projections, caches, and durability boundaries;
- runtime topology, discovery, coordination, and failure propagation;
- trust boundaries and sensitive-data movement;
- startup, readiness, replacement, drain, shutdown, and recovery;
- observability and operator control points;
- important limits, assumptions, and intentionally unsupported topologies.

When a major architecture change is made, creating or updating a Draw.io architecture diagram is required whenever the available environment can produce and verify one.

The first documented architecture of a multi-component project also counts as a major architecture change and SHOULD include the initial Draw.io diagram with the blueprint.

A major architecture change includes a material change to:

- a system or quantum boundary;
- deployable processes or runtime topology;
- data ownership or source of truth;
- a public protocol or dependency direction;
- trust boundaries or sensitive-data flow;
- lifecycle, failover, or failure-containment relationships;
- three or more components whose relationships are easier to understand visually.

Store the editable `.drawio` source in the repository. Also render a reviewable `.svg` by default, or another repository-standard format when SVG cannot represent the result. Commit the source and render together and link the rendered diagram from the relevant README or architecture document.

The diagram SHOULD:

- name components by responsibility rather than transient process IDs;
- show directional relationships and label materially different protocols or flows;
- distinguish authoritative state from disposable projections where relevant;
- identify external systems and trust boundaries when they affect the design;
- remain readable without zooming into implementation-level details;
- use a legend only when visual encoding is not self-explanatory.

Do not use a screenshot as the only source. Do not hand-edit the rendered SVG while leaving the Draw.io source stale.

Verify that the Draw.io file opens, the rendered output matches it, text is not clipped, links resolve, and the diagram still reflects the written architecture. If diagram tooling is unavailable, update the textual architecture immediately and report the missing diagram work explicitly rather than silently waiving it.

## 9. Use Typst for report-shaped deliverables when practical

Markdown remains the default for living repository documentation, READMEs, API references, runbooks, and documents that are reviewed primarily as diffs.

Prefer Typst when a bounded report benefits from stable pagination, tables, figures, citations, equations, print-quality layout, or an immutable review artifact. Suitable reports include:

- benchmark and performance evaluations;
- architecture or technology assessments;
- research and provider comparisons;
- incident reviews and postmortems;
- release-readiness or migration-readiness reports;
- security, compatibility, accessibility, or operational audits;
- experiment findings that combine methods, data, charts, and conclusions.

When Typst is practical:

- keep the `.typ` source authoritative;
- keep figures, data, bibliography, and other inputs reproducible and clearly owned;
- record the Typst version and render command;
- generate and visually verify the PDF;
- commit the PDF with the source when repository policy accepts rendered artifacts, otherwise publish it through the authorized artifact path and link it;
- update the source and rendered result together.

A report SHOULD identify purpose, scope, method, environment, evidence, findings, limitations, and conclusion. A benchmark report must preserve the workload and measurement context required by the testing guidance.

Do not convert a frequently edited current-state document to Typst merely for visual polish. Do not leave conclusions only in a PDF when maintainers need the current operational fact in the README, architecture document, API reference, or runbook.

If Typst or a required font is unavailable, use an appropriate Markdown report and preserve a future render path only when the formatted artifact still has real value.

## 10. Document contracts exactly

Public APIs, protocols, events, storage schemas, generated clients, environment variables, configuration files, and command-line interfaces are contracts. Their documentation SHOULD state the applicable:

- owner and source of truth;
- versions and supported compatibility window;
- request, response, event, or data shape;
- required, optional, defaulted, and unknown values;
- validation and error semantics;
- authentication and authorization behavior;
- ordering, idempotency, retry, timeout, and cancellation behavior;
- durability and acknowledgment milestone;
- configuration precedence and reload behavior;
- pagination, limits, retention, and deletion;
- deprecation, migration, and rollback path;
- complete examples and expected results.

Keep generated references connected to their authoritative schema or implementation. State whether code, OpenAPI, protobuf, database migration, configuration schema, or another artifact owns the contract.

Do not maintain two apparently authoritative descriptions by hand. Generate one from the other or state which one wins and test that the derived representation remains synchronized.

### Require OpenAPI for REST APIs

Every REST API, including an internal REST API, MUST have an OpenAPI description. Create it with the first usable API surface and update it in the same vertical slice as every route or contract change.

Choose and document one authority:

- schema-first, where the OpenAPI document owns the contract and server or client artifacts are generated or checked against it; or
- code-first, where declared routes and types own the contract and OpenAPI is generated reproducibly.

The OpenAPI description MUST cover the applicable:

- server or base-path expectations;
- every public method and route;
- path, query, header, and cookie parameters;
- request and response bodies with content types;
- successful and error status codes;
- reusable schemas, required fields, defaults, examples, and constraints;
- authentication and authorization schemes;
- pagination, idempotency, rate limits, and relevant headers;
- deprecation and versioning.

Use the OpenAPI version supported by the owning toolchain and consumers rather than maintaining a newer document that cannot be validated or served.

Whenever practical, serve the OpenAPI document and an interactive reference from the application or publish them through the project's documentation path. Parse the document during tests, verify route and method parity, validate representative requests and responses, and check generated client or server artifacts for drift.

Do not treat OpenAPI as decorative output. A REST endpoint is not documentation-complete when its implemented route, status, authentication, or payload semantics disagree with the OpenAPI contract.

## 11. Make commands and examples executable

Commands and examples are part of the product interface. A reader should be able to copy them, replace clearly marked values, and obtain the stated result.

Examples SHOULD:

- begin from declared prerequisites and a known directory;
- use current package names, paths, flags, environment variables, and endpoints;
- distinguish PowerShell from Bash or other shell syntax when it differs;
- mark placeholders without making them resemble real secrets;
- show enough expected output or state to confirm success;
- include cleanup when resources, credentials, files, or processes are created;
- identify illustrative servers, models, tool names, or data that must be replaced;
- avoid undocumented setup inherited from the author's machine.

Whenever practical, compile or execute code examples, validate configuration snippets, exercise documented CLI commands, render diagrams and Typst reports, check links, and test generated API documentation.

Prefer semantic verification over tests that freeze prose. Verify that a route exists, a schema parses, an example compiles, a command succeeds, or generated output is fresh. Do not write brittle tests that fail because a sentence was reworded without changing its meaning.

## 12. Keep localized documentation synchronized

When a project maintains more than one language version of a document, every applicable behavior or contract change MUST update all maintained language versions in the same change.

Establish one canonical factual source while preserving natural writing in each language. All localized versions must agree on:

- supported behavior and limitations;
- versions, dates, requirements, and platforms;
- commands, flags, paths, configuration keys, and defaults;
- security, privacy, migration, and operational warnings;
- links to releases, contracts, and deeper documentation.

Do not let translations invent capabilities or omit constraints. Keep code, identifiers, and commands semantically identical unless the interface itself is localized.

If a maintained translation cannot be updated accurately, treat documentation synchronization as incomplete and report the blocker. Do not silently merge a behavior change with known stale localized documentation.

## 13. Document releases, migrations, and operations

Release documentation should describe user and operator impact, not merely repeat commit subjects.

Include, where applicable:

- notable added, changed, fixed, deprecated, and removed behavior;
- compatibility and minimum-version changes;
- configuration, data, dependency, and platform changes;
- upgrade and rollback instructions;
- migration prerequisites, duration, progress, restart, and failure behavior;
- security or privacy impact;
- performance implications supported by evidence;
- known limitations and externally unverified environments;
- links to detailed contracts, ADRs, reports, and complete change history.

Runbooks should begin from an observable symptom or operational objective. State prerequisites, authority, safety boundaries, diagnostic evidence, bounded actions, success conditions, rollback or stopping conditions, and escalation points.

Do not write a destructive recovery command without identifying its exact scope and consequence. Never embed live credentials or copy production-sensitive output into examples.

## 14. Preserve provenance and separate kinds of evidence

When documentation depends on external facts, record enough provenance to review the claim later:

- a direct authoritative source;
- the version, model, provider, standard, or environment to which it applies;
- the date the source or behavior was checked when it can change;
- whether the statement is official guidance, observed behavior, project policy, inference, or experiment.

Keep official recommendations separate from local defaults and experimental findings. Do not present one provider's behavior as a universal protocol guarantee.

For experiments and reports, preserve the method, inputs, environment, raw or machine-readable result when useful, and known limitations. Distinguish implementation evidence from operational evidence and measured results from subjective review.

Quote external material only when exact wording is necessary. Prefer concise attribution and an explanation of the engineering consequence.

## 15. Protect sensitive information

Documentation, examples, screenshots, diagrams, generated references, reports, and fixtures MUST NOT expose:

- access tokens, credentials, private keys, signing material, or recovery secrets;
- real personal data or sensitive payloads;
- internal hostnames, paths, topology, or identifiers whose disclosure creates risk;
- production logs or database contents without deliberate sanitization;
- temporary credentials that remain valid after publication.

Use clearly synthetic values and redact by meaning, not only by substring. A diagram may reveal a trust boundary or data flow without publishing secrets or unnecessary infrastructure detail.

Document how secrets are supplied, scoped, rotated, and omitted from logs without including the secret itself. Preserve honest security and deletion semantics; do not replace them with reassuring but unverifiable language.

## 16. Prevent documentation drift

Incorrect documentation is often more dangerous than missing documentation because it creates false confidence. Treat documentation maintenance as part of implementation and review.

When behavior changes, search for all affected:

- README sections and localized variants;
- blueprint and active milestone specifications;
- current architecture text and diagrams;
- ADR links and status;
- API, schema, configuration, CLI, and generated references;
- examples, sample configuration, and agent skills;
- tests, verification commands, benchmark instructions, and reports;
- release, migration, runbook, and known-limitation documents.

Update, replace, or remove stale claims in the same vertical slice. Do not preserve obsolete instructions merely because they once worked.

Automate drift checks when practical:

- compile examples and snippets;
- validate Markdown links and anchors;
- parse configuration and schema examples;
- compare generated files with their authoritative source;
- serve and test documentation endpoints;
- validate OpenAPI syntax, route parity, and generated artifact freshness;
- render Draw.io and Typst sources;
- verify referenced paths and commands;
- ensure required localized variants changed together.

Use the simplest reliable mechanism already natural to the repository. A documentation test should protect a contract or reproducible workflow, not exact prose or heading count.

## 17. Complete documentation with the vertical slice

Documentation is part of feature completion. A cohesive feature or architectural change SHOULD include, as applicable:

- continuously updated README behavior and commands;
- updated blueprint scope or project map;
- the active milestone's status, deviations, and evidence;
- current architecture text and a Draw.io source plus render for major changes;
- new or superseding ADRs for settled consequential decisions;
- exact API, schema, configuration, and compatibility changes;
- an updated OpenAPI contract for every REST API change;
- updated runbooks, migrations, release notes, and known limitations;
- synchronized localized documentation;
- a Typst report for report-shaped evidence when practical;
- executable examples and documentation drift verification.

Do not wait until the end of the project to reconstruct documentation from memory. Update the owning document when the fact becomes known or changes.

An internal refactor that does not alter any documented behavior, boundary, command, contract, operational procedure, or architectural relationship does not require artificial documentation churn. Confirm that no relevant fact changed rather than editing prose for appearance.

## 18. Report documentation status honestly

When handing off work, distinguish:

- documents created or updated;
- behavior and contracts they now cover;
- commands, links, schemas, diagrams, examples, localized variants, and reports that were verified;
- rendered Draw.io or Typst artifacts inspected;
- OpenAPI validation evidence;
- documents intentionally unchanged because their facts remain valid;
- incomplete, blocked, stale, or externally owned documentation;
- claims that remain proposed, experimental, subjective, or unverified.

Do not call a project documented because a README file exists. Do not call a diagram current unless its editable source and rendered view match the implemented architecture.

## 19. Review questions

| Concern | Question |
| --- | --- |
| Blueprint | Does the project have a current blueprint covering purpose, boundaries, quality goals, architecture, QA, milestones, and risks? |
| Milestone | Is there an executable work specification with scope, vertical tasks, acceptance evidence, and current status? |
| README | Can a new reader understand, start, and safely use the current project from the README? |
| Truth | Is each statement current behavior, a labeled proposal, or historical evidence? |
| Audience | Does each document serve a distinct reader and maintenance need? |
| Authority | Is the source of truth clear where code, schema, generated reference, and prose overlap? |
| Decisions | Are active choices updated as living documents and settled consequential choices preserved as ADRs? |
| Architecture | Did a major change update both the Draw.io source and reviewable render when possible? |
| Reports | Would a reproducible Typst report improve review of this bounded analysis? |
| Contracts | Are interfaces, defaults, errors, lifecycle, compatibility, and limits documented exactly? |
| OpenAPI | Does every REST route agree with a validated OpenAPI contract? |
| Examples | Can documented commands and examples execute from their stated prerequisites? |
| Localization | Did every maintained language version change with the same facts and constraints? |
| Provenance | Are external facts sourced, dated when unstable, and separated from local policy or experiment? |
| Security | Are examples, diagrams, reports, and output free of secrets and sensitive data? |
| Drift | Which claims can be checked automatically, and are those checks connected to the authoritative source? |
| Vertical slice | Did the behavior, tests, README, architecture, decisions, operations, and reports change together where applicable? |
| Evidence | What was verified, what remains stale or blocked, and who owns it? |
