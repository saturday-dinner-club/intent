# Testing and QA

Status: living reference

Testing is executable quality assurance: unit tests establish feature behavior, integration tests establish connections and composition, and end-to-end tests establish the workflow through the user's interface. Test count, coverage percentage, and framework usage are not the objective.

## Use complementary QA layers

| Layer | Primary question | Evidence it does not provide alone |
| --- | --- | --- |
| Unit | Does the feature's local logic and state behavior work? | Real adapter, process, or user-interface behavior |
| Integration | Do components connect through real contracts and compose correctly? | The workflow as experienced by the user |
| End-to-end | Does the running system work through the user's actual entry point? | Every internal branch, failure transition, or capacity limit |

Choose the smallest set of layers that can disprove the current claim. An ordinary change rarely needs every layer: focused unit or contract evidence may be enough for local logic, while integration or end-to-end evidence is warranted when the change crosses that boundary. Put each assertion at the narrowest useful boundary and add higher-level evidence only for distinct wiring or user behavior.

Static analysis, race detection, fuzzing, property and compatibility tests, smoke tests, benchmarks, load tests, and subjective review complement these layers rather than silently replacing them.

Map each risk once at its cheapest trustworthy layer. Unit tests own branch-rich domain behavior. Integration tests own parsing, adapter semantics, transactions, process relationships, and lifecycle across a boundary. End-to-end tests own discoverability, packaging, routing, configuration, and the result visible to a real consumer. Repeat an assertion across layers only when the higher layer proves a different connection or failure mode.

## Derive evidence from delivered behavior

Identify the user outcome, domain rules and transitions, crossed boundaries, user entry point, material failures around state changes, and whether performance is meaningfully measurable. A useful test can disprove one of those claims.

Avoid tests that merely execute lines, repeat the type checker, freeze incidental structure or generated prose, or verify a mock's script. For a defect, add a regression at the boundary where it should have been caught; when practical, demonstrate that the test detects the unfixed defect.

Choose assertions before choosing fixtures. State the observable postcondition, error identity, durable transition, emitted contract, or resource bound first; then use only the setup required to expose it. This keeps tests resilient to internal refactoring while preserving behavior that callers and operators rely on.

## Unit tests verify feature logic

Keep unit tests fast, deterministic, local, and diagnostic. Cover the changed success path and the failures or regressions most likely to matter; select among rejection, boundaries, invariants, state transitions, stable errors, duplicates, cancellation, timeout, and recovery rather than treating them as a mandatory matrix. Assert contracts and state, not private helper order or scheduler accidents.

For Go, actively use the built-in `testing` package: table tests and subtests when clearer, `t.Helper`, `t.TempDir`, `t.Setenv`, cleanup hooks, `t.Parallel` only for truly independent state, and the race detector or built-in fuzzing for concurrent or parser-heavy code. Prefer direct assertions with useful failure messages; do not add assertion or mocking frameworks merely to shorten ordinary tests.

Share helpers only for stable setup or assertions. A helper should mark itself with `t.Helper`, retain the case-specific failure location, and return ownership or cleanup clearly. Parallel subtests must not share environment variables, fixed ports, process-wide configuration, mutable fixtures, or database namespaces.

For other languages, use the simplest mature runner natural to the repository. Keep dependencies and assertions direct. Integration and end-to-end tools follow the real boundary, not the unit-test framework.

## Prefer local real behavior over mocks

Use the highest-fidelity bounded implementation practical for the claim, roughly in this order:

1. real in-process component;
2. official or faithful embedded implementation;
3. disposable resource such as a temporary filesystem, SQLite database, embedded broker, in-memory transport, or local protocol server;
4. thin fake or stub at a narrow external boundary;
5. strict interaction mock only when interaction order is the behavior.

Embedded implementations or a local server are appropriate when they preserve the semantics under test. A thin double is acceptable for internal logic, unavailable or expensive external systems, deterministic rare failures, hardware, or hosted models. Do not recreate the external product inside a mock or call a scripted response proof of interoperability.

When substitutability matters, run common conformance cases against local doubles and the real adapter when available. Record which evidence was real, embedded, or mocked.

Keep doubles honest about guarantees, not only return types. Model stable errors, duplicate behavior, ordering, capacity, cancellation, and persistence only to the extent required by the local contract. If an embedded engine differs from production in locking, isolation, delivery, clock, or durability, keep provider-specific cases in an explicit integration suite and do not generalize the embedded result.

## Integration tests verify connection and composition

Exercise material boundaries, including configuration and discovery; serialization; adapter error translation; storage transactions, constraints, migrations, and reopen; broker acknowledgment, ordering, redelivery, and topology; process startup, readiness, reconnection, shutdown, and cleanup; generated compatibility; retries, deadlines, cancellation, unknown outcomes; and composition order when contractual.

Use isolated namespaces, ports, directories, identities, and disposable data. A test containing several constructed objects is not integration evidence unless it crosses the boundary being claimed.

Integration setup is owned test code. Wait on readiness rather than fixed sleeps, allocate ports safely, terminate children on every path, and retain enough logs or state to diagnose failure. Reopen persistent resources where restart semantics matter. Test migration from the supported previous representation rather than only creating the latest empty schema.

### Optional external dependencies

If an integration requires a real external service, browser, OS capability, device, executable, or hosted model, safely detect deliberately supplied prerequisites. Run when present; when absent, **skip** with the missing prerequisite and unverified boundary. Bound time, concurrency, cost, and cleanup.

Missing optional infrastructure is not a product failure. A skip is also not a pass. Never probe arbitrary networks, discover production credentials, or use destructive production resources merely to make the test run.

## End-to-end tests use the user's interface

Start and compose the system substantially as claimed, then drive a real browser, built CLI, public API or protocol client, exported library API, media control surface, device interface, or other supported entry point.

Verify discoverability and input, real routing and composition, user-visible result, critical durable or external side effects, actionable errors, and cleanup. A shallow DOM or status assertion does not prove perceptual quality, accessibility, media quality, or model quality; record visual, metric, or human review separately when required.

An indispensable missing prerequisite follows the external-dependency skip rule and leaves that user path explicitly unverified.

End-to-end data and accounts should be synthetic and scoped. Avoid production tenants, shared buckets, mutable public fixtures, and credentials discovered from a developer machine. A test that creates external state must identify ownership, cost, timeout, and cleanup, including what remains after an interrupted run.

## Smoke when assembly is part of the claim

Run a smoke test through the closest real user-facing entry point when the change affects assembly, packaging, startup, routing, configuration, deployment, or a workflow that narrower tests cannot represent. A repository's established smoke command should normally continue to run. A local logic change, early prototype, or unavailable environment does not require creating a new smoke harness merely to claim scoped completion.

When smoke is warranted, keep it to the smallest bounded run that:

1. builds or starts the actual artifact;
2. performs one representative action through the real entry point;
3. observes the user-visible result and critical side effect;
4. checks fatal errors or critical runtime signals;
5. stops and cleans up owned resources.

For a CLI, run the built command; for a web app, complete the smallest real browser interaction; for a service, call its public interface; for a library, run a downstream-style consumer; for a worker, submit through supported ingress. Compilation, a unit test, or direct internal handler call is not smoke evidence.

Smoke verifies assembly, not exhaustive correctness. Keep one representative successful action fast and deterministic enough to run after each feature, while deeper error and edge cases remain at unit, integration, and end-to-end layers. When packaging changes, smoke the packaged artifact rather than only the development launcher.

Use embedded or local dependencies when they preserve the entry path. If an indispensable external prerequisite is absent, the smoke may be skipped with a precise reason, but must not be reported as passed. Automate repeated smoke paths without replacing the real entry point.

## Test failure, durability, and lifecycle where material

Exercise transitions where interruption changes the outcome: before commit; after commit but before acknowledgment or projection; duplicate delivery; stale ownership; partial restart; missing optional work; authority-based repair; dependency loss in flight; graceful drain versus abrupt loss; capacity bounds; and cleanup after a failed shutdown step.

Assert durable state, degraded behavior, retry disposition, bound, recovery, and operator-visible evidence—not merely that an error occurred. Prefer explicit clocks, barriers, channels, local servers, and bounded eventual assertions over arbitrary sleeps. Use race, repetition, property, fuzz, randomized scheduling, or interruption tests when examples are weak; retain seeds and minimized failures.

Compatibility tests should exercise supported old/new reader-writer pairs, unknown fields, persisted migrations, and rollback windows. Security tests add replay, privilege, redaction, and malformed-cost cases. Visual, media, hardware, and model work may need perceptual or metric review against a recorded environment. Load, soak, packet-loss, and chaos tests apply when capacity or failure containment is part of the claim; keep them separate from fast local QA.

## Keep contracts, fixtures, and suites operable

Representative fixtures may include wire messages, migrations, documents, archives, media, localization, browser sizes, or old and new versions. Golden files are suitable when exact bytes, schemas, manifests, rendering, or reader behavior are contractual. Keep them reproducible, minimal, synthetic, connected to their authority, and separate from proof against real external consumers.

Expose discoverable commands for applicable unit, local integration, external integration, end-to-end, smoke, and heavier suites. They need not all share a default command. Keep helpers small, ownership and cleanup visible, and parallelism, time, subprocesses, network, payload, and cost bounded.

Treat flakiness as lost evidence. Capture timing, seed, environment, pressure, and logs; repair hidden state and arbitrary waits. Retries may gather diagnostics but may not erase the first failure. Use coverage to find gaps, not as a universal completion percentage.

Organize commands so a contributor can tell exactly which layer ran. The fast default may include unit and embedded integration tests, while real providers, browsers, hardware, benchmarks, load, and soak use discoverable opt-in commands. CI composition may differ, but its output must preserve skips, prerequisites, timeouts, and the boundary represented by each suite.

## Decide whether performance is measurable

Read [performance-and-benchmarks.md](performance-and-benchmarks.md) when performance is an explicit requirement, a plausible regression risk, or a decision that cannot be made credibly without measurement. Do not require a performance decision or benchmark for every feature, and do not manufacture a meaningless number.

## Report evidence honestly

Separate implementation from verification. Name the checks actually run, their result, and any material prerequisite or boundary that limits the claim. List skipped checks only when they were expected by the task or repository, not every theoretically possible layer.

`Tests pass` must name its scope. Production readiness additionally needs the environment, compatibility, failure, security, and capacity evidence appropriate to the system.

Preserve enough output to reproduce failures without publishing secrets: command, relevant version, seed or workload, prerequisite state, and bounded logs. If a check is manual, record what was observed and its limits. If a test was not attempted because it was out of scope, distinguish that from an attempted skip caused by a missing prerequisite.

Testing-specific review prompts are optional: What is the cheapest test that can fail for this change? Does a changed boundary need integration evidence? Is assembly or user interaction part of the claim? Are doubles narrower than the claim? What material behavior remains unverified?
