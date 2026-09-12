# Documentation Artifacts

Status: living reference

Use this reference for specialized architecture, report, example, localization, release, migration, and runbook artifacts. The project-delivery reference owns when project knowledge changes; this file owns how these artifact forms remain useful and verifiable.

## Architecture documents and Draw.io

Architecture documentation should explain relationships source code does not: context and actors; quanta, deployables, and ownership; dependency and data-flow direction; public interfaces; authority, projections, and durability; runtime topology and failure propagation; trust boundaries; lifecycle and recovery; observability; limits and unsupported topologies.

Create or update an architecture diagram when the relationships are materially clearer visually and the user or repository benefits from maintaining it. A planning conversation, prototype, early MVP, or first multi-component sketch does not automatically require a committed Draw.io source and render. Prefer the repository's existing format; introduce Draw.io only when its editable artifact earns the maintenance cost.

When the repository maintains Draw.io artifacts, normally store the editable `.drawio` source with a reviewable `.svg` render, update them together, and link the render from the owning document.

Draw responsibility and directional semantics, not only product logos and bidirectional arrows. Distinguish authoritative and derived state, external systems, materially different flows, and trust or failure boundaries where relevant. Use separate views when one drawing cannot express topology, sequence, ownership, and failure clearly.

Useful views include system context, runtime/container topology, authority and data flow, a critical sequence, and failure or recovery behavior. Do not force them into one unreadable canvas. Name components by responsibility rather than transient instance IDs, and use a legend only when visual encoding is not self-evident.

When a diagram is changed, verify the source opens, the render matches, text is legible, links resolve, and both agree with the architecture. Report unavailable tooling only when diagram verification is part of the requested claim.

## Typst reports

Markdown is the default for living, diff-oriented documentation. Prefer Typst when a bounded report benefits from stable pagination, tables, figures, citations, equations, or print-quality review. Good candidates include benchmarks, architecture or technology assessments, research comparisons, incidents, readiness reviews, migrations, security and compatibility audits, and experiments.

When practical, keep `.typ` as authority, inputs reproducible, version and render command recorded, and a visually inspected PDF synchronized with source. Commit the PDF when repository policy accepts renders; otherwise publish it through the authorized artifact path and link it.

A report should state purpose, scope, method, environment, evidence, findings, limitations, and conclusion. Do not hide current operational truth only in a PDF. If Typst or required fonts are unavailable, use Markdown and preserve a future render path only when it retains concrete value.

Benchmark reports additionally preserve workload generation, warm-up, repetitions, hardware/topology, errors, distributions, and raw data needed to compare a later run. Incident and readiness reports distinguish observed facts, inference, and recommendations so conclusions can be challenged without rewriting evidence.

## Executable commands and examples

Examples are product interfaces. Begin from declared prerequisites and a known directory; use current names, paths, flags, configuration, and endpoints; distinguish shell syntax when material; mark synthetic placeholders clearly; show expected success; and include cleanup for created resources.

Do not inherit hidden state from the author's machine. Examples should say whether they require an account, device, network, local container engine, seeded data, or generated artifact. If output varies, describe the stable success condition rather than pasting a brittle full transcript.

Compile or execute examples, validate snippets, exercise documented commands, check links, and inspect generated references when practical. Prefer semantic checks—a route exists, schema parses, example compiles, command succeeds, or generated output is fresh—over wording snapshots.

## Localized documentation

When maintained language variants exist, a behavior or contract change must update all applicable variants in the same change. Establish one canonical factual source while keeping each language natural. Versions, dates, platforms, commands, identifiers, defaults, limitations, and security or migration warnings must agree.

If a maintained translation cannot be updated accurately, documentation synchronization is incomplete; report the blocker rather than merging a knowingly stale claim silently.

Keep code, identifiers, commands, and configuration semantically identical across languages unless the interface itself is localized. A translation may restructure prose naturally, but it must not omit limitations, soften warnings, or invent support.

## Releases, migrations, and runbooks

Release and migration guides should describe user and operator impact: added, changed, fixed, deprecated, or removed behavior; compatibility and minimum versions; configuration, data, dependencies, platforms, security, and performance; prerequisites; progress and restart behavior; upgrade and rollback; known limitations; and supporting ADRs, reports, and contracts.

Runbooks begin with an observable symptom or objective. State prerequisites, authority, safety boundary, diagnostics, bounded actions, success, rollback or stopping conditions, and escalation. Never include a destructive command without exact scope and consequence.

Migration instructions must identify source and target versions, compatibility window, backup or recovery prerequisite, restart-safe progress, validation, cutover, rollback limit, and cleanup. Release notes should describe user/operator impact rather than repeat commit subjects and must label externally unverified platforms or providers.

## Provenance and sensitive information

For external facts, preserve direct authoritative sources, applicable version or environment, check date when unstable, and whether the statement is official guidance, observed behavior, project policy, inference, or experiment. Reports should retain method, inputs, environment, raw results when useful, and limitations. Keep implementation evidence distinct from operational evidence and measurements distinct from subjective review.

Documents, examples, screenshots, diagrams, generated references, reports, and fixtures must not expose credentials, private keys, recovery material, real personal data, unsanitized production output, or sensitive internal details whose disclosure creates risk. Use synthetic values and redact by meaning. Explain secret delivery and lifecycle without embedding the secret.

## Verify the artifact, not only its source

Where the format has a rendered or executable form, inspect that form before claiming completion. Open Draw.io sources and their SVG renders, compile Typst and inspect the PDF, run example commands from declared prerequisites, parse configuration and interface samples, follow links, and compare localized facts. Record unavailable tools as missing evidence rather than assuming the source will render correctly elsewhere.

Keep verification proportional to change: a corrected link needs a link check, while a reorganized architecture diagram needs layout, labeling, source/render parity, and written-architecture review. Generated output should be reproducible from repository-owned inputs and should not contain machine-specific paths, timestamps, credentials, or nondeterministic data unless the artifact contract requires them.

Artifact-specific review questions are: Does the chosen format serve a distinct audience? Are editable sources authoritative and renders synchronized? Can commands and examples run? Are translations factually aligned? Are operational actions bounded and recoverable? Is provenance sufficient to revisit the claim? Is sensitive information excluded?
