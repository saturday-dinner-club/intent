# Testing and QA

Status: living document

Last consolidated: 2026-09-08

Audience: maintainers, reviewers, and coding agents

## 1. Purpose

Testing is executable quality assurance for completed behavior. Its purpose is not to maximize test count, coverage percentage, or framework usage. Its purpose is to establish, with evidence at the right boundaries, that:

- the feature itself behaves correctly;
- components connect and compose correctly;
- the completed system works through the interface a user actually uses;
- important failure and recovery paths remain safe;
- performance remains measurable where a meaningful workload exists.

The keywords **MUST**, **SHOULD**, and **MAY** describe defaults. They do not override the user's latest explicit direction or the owning system's contracts.

When guidance conflicts, use this order:

1. the user's latest explicit decision;
2. the current system's documented behavior and invariants;
3. this testing and QA guidance;
4. testing convenience or framework convention.

## 2. Use three complementary QA layers

Unit, integration, and end-to-end tests answer different questions. They are not prestige levels and one does not replace another.

| Layer | Question | Primary evidence | Does not establish by itself |
| --- | --- | --- | --- |
| Unit | Does the feature and its internal logic behave correctly? | Domain rules, transformations, state machines, validation, errors, and local failure handling | Real connection, adapter, process, or user-interface behavior |
| Integration | Do real boundaries connect, and does composition logic work? | Adapters, storage, protocols, serialization, configuration, migrations, dependency errors, and component lifecycle | The workflow as experienced through the user's interface |
| End-to-end | Does the running system work from the user's side? | A real browser, CLI, API, SDK, protocol client, or other user-facing entry point driving the connected workflow | Every internal branch, failure transition, or capacity limit |

A completed user-visible feature MUST have evidence through all three applicable layers:

- unit tests for its functional behavior;
- integration tests for every new or changed connection and composition path;
- end-to-end tests for the user-visible workflow.

Do not duplicate every assertion at every layer. Put each risk at the narrowest boundary that can actually expose it, then add higher-level evidence for the connections and user path that narrower tests cannot prove.

If a layer is genuinely inapplicable because the feature has no such boundary, state that explicitly. Do not call a layer inapplicable merely because its environment is inconvenient.

Static analysis, race detection, fuzzing, property tests, compatibility tests, smoke tests, benchmarks, load tests, and manual visual or quality review complement these three layers. They do not silently substitute for them.

## 3. Derive tests from the behavior being delivered

Before implementation, identify:

- the user-observable outcome;
- the domain rules and state transitions that produce it;
- the components and infrastructure boundaries it crosses;
- the user-facing entry point;
- the material failures before, during, and after state change;
- any performance characteristic that can be measured meaningfully.

Use those facts to select QA evidence. A useful test should be able to disprove a meaningful claim. Avoid tests that merely execute lines, repeat type checks, freeze incidental implementation details, or verify a mock's script.

For a defect, add a regression test at the boundary where the defect should have been caught. When practical, demonstrate that the test observes the defect before relying on it as evidence for the fix.

## 4. Use unit tests to verify feature behavior

Unit tests are the primary evidence for feature logic. Keep them fast, deterministic, local, and focused enough that a failure identifies the violated behavior.

Unit tests SHOULD cover, where relevant:

- representative success cases;
- validation and rejection;
- boundary values and empty input;
- domain state transitions and invariants;
- error classification and propagation;
- duplicate or repeated execution;
- cancellation and timeout decisions;
- internal recovery logic whose external dependency is not under test;
- the specific regression behind a defect.

Assert stable behavior, returned errors, durable or domain state, and declared side effects. Avoid asserting private call order, helper structure, generated wording, incidental SQL, scheduler accidents, or framework internals unless one is deliberately part of the contract.

### Go

Use Go's built-in `testing` package actively:

- table-driven tests and subtests when they make cases clearer;
- `t.Helper` for shared test diagnostics;
- `t.TempDir`, `t.Setenv`, and cleanup hooks for isolated ownership;
- `t.Parallel` only when state and resources are genuinely independent;
- the race detector for shared mutable state and concurrent lifecycle code;
- built-in fuzzing and benchmarks when they fit the risk.

Prefer direct assertions with useful failure messages. Do not add a third-party assertion or mocking framework solely to make ordinary unit tests look shorter.

### Other languages

Use the simplest mature test runner already natural to the language and repository. Keep assertions direct and dependencies small. Add plugins, matchers, or mocking frameworks only when they provide evidence that would otherwise be materially harder to express.

This framework preference primarily concerns unit tests. Integration and end-to-end tooling should be chosen by the real boundary and user interface being exercised, not by loyalty to a unit-test framework.

## 5. Prefer real local behavior over mocks

Mocking is not the default. Use the highest-fidelity implementation that remains local, bounded, and appropriate for the claim.

Prefer, in order when practical:

1. the real component running in-process;
2. an official or faithful embedded implementation;
3. a real disposable resource such as a temporary filesystem, SQLite database, embedded broker, in-memory transport, or local protocol server;
4. a thin fake or stub at a narrow external boundary;
5. a strict interaction mock only when interaction order is itself meaningful behavior.

An embedded implementation is preferred when it preserves the semantics needed by the test without requiring the external deployment. A local HTTP server is preferred when request shape, headers, response handling, retry classification, or protocol behavior matters.

A thin fake, stub, or mock MAY be used when:

- the test concerns internal logic rather than external connectivity;
- an external system is unavailable, expensive, destructive, slow, or nondeterministic;
- a rare response or failure must be produced deterministically;
- hardware or a hosted model must be isolated from ordinary local tests.

Keep the double limited to the contract needed by the test. Do not build a second implementation of the external system inside the mock. Do not treat a scripted mock response or expected method sequence as evidence that the real integration works.

Where substitutability matters, run the same conformance cases against the embedded or fake implementation and the real adapter when available. Record which evidence came from a substitute and which exercised the real boundary.

## 6. Use integration tests for connectivity and composition

Integration tests verify that components cooperate through their real contracts. Merely constructing several objects in one test does not make it an integration test.

Exercise the material connection and composition behavior:

- configuration and dependency discovery;
- request, event, command, and response serialization;
- adapter error identity and translation;
- storage transactions, migrations, constraints, and reopen behavior;
- broker acknowledgment, ordering, redelivery, and consumer topology;
- process startup, readiness, reconnection, shutdown, and cleanup;
- generated client or schema compatibility;
- retries, cancellation, deadlines, and unknown outcomes;
- composition order when that order is part of the system contract.

Use real local or embedded infrastructure when it can represent the required semantics. Use isolated databases, namespaces, ports, directories, identities, and cleanup so one run cannot contaminate another.

### External dependency availability

When an integration depends on a real external service, browser, operating system capability, hardware device, or hosted model:

- detect its configured availability safely;
- run the integration test when the required endpoint, credential, executable, device, or other prerequisite is present;
- skip the test when the prerequisite is absent;
- include the missing prerequisite and the unverified boundary in the skip reason;
- bound connection attempts, execution time, concurrency, cost, and cleanup.

Absence of an optional external dependency is a skip, not a product failure. A skip is also not a pass: report the missing QA evidence honestly.

Do not probe arbitrary networks, discover production credentials, or use destructive production resources merely to decide whether a test can run. Availability means the environment has deliberately supplied or exposed the dependency to the test.

## 7. Use end-to-end tests from the user's side

End-to-end tests start at an interface the user actually uses and observe results the user can observe. The system should be started and composed in substantially the same way as the claimed workflow.

Examples include:

- driving a web feature through a real browser;
- invoking the built CLI rather than calling its command handler directly;
- sending requests through the public API or protocol client;
- consuming a library through its exported API as a downstream program would;
- submitting work through the product entry point and observing its externally visible result;
- exercising media, hardware, or model behavior through the supported user-facing control path.

An end-to-end test SHOULD verify:

- the entry point is discoverable and accepts the intended input;
- real routing, configuration, and composition reach the owning behavior;
- the user-visible result is correct;
- critical durable or externally visible side effects occur;
- actionable errors appear at the same interface;
- resources and child processes are cleaned up.

Prefer automation for repeatable behavior. Rendering, media quality, model quality, accessibility, or other perceptual outcomes MAY also require visual, metric-based, or human review. Record that evidence separately rather than pretending a shallow DOM or status-code assertion proves subjective quality.

When an indispensable external prerequisite is absent, skip with a precise reason and report the end-to-end path as unverified in that environment.

## 8. Run a smoke test after every feature

After implementing one coherent feature, a smoke test through the closest real user-facing entry point is **mandatory** before declaring that feature complete. Run it after the feature is connected, not only after a batch of unrelated changes.

The smoke test is the smallest bounded execution that demonstrates the feature can start and perform its representative successful action:

1. build or launch the actual artifact;
2. enter through the real user-facing interface;
3. perform one representative action;
4. observe the user-visible result and any critical side effect;
5. inspect fatal errors or critical runtime signals;
6. stop the system and clean up owned resources.

Examples:

- for a CLI, run the built executable with a representative command;
- for a web application, load it in a browser and complete the smallest real interaction;
- for a service, start the service and call its public API or protocol;
- for a library, compile and run a minimal downstream-style consumer against the exported API;
- for a worker, submit work through its supported ingress and observe the external result.

A unit test, successful compilation, or direct call into an internal handler is not a smoke test.

Use an embedded or local dependency when it supports the real entry path. If an indispensable external prerequisite is not available, the smoke test MAY be skipped according to the external-dependency rule, but the attempt and reason MUST be reported and the missing smoke evidence MUST NOT be described as a pass.

Automate a smoke path when it will be repeated or when manual setup could hide wiring mistakes. Keep it fast enough to run after each feature while preserving the real entry point.

## 9. Test failure, durability, and lifecycle

Happy-path evidence is insufficient for stateful, concurrent, or externally connected behavior. Test at the transitions where interruption changes the outcome.

Where material, cover:

- failure immediately before durable state change;
- interruption after commit but before acknowledgment or projection;
- duplicate commands, callbacks, or event delivery;
- stale or competing owners;
- restart with partial progress;
- delayed, missing, or failed optional work;
- recovery from the authoritative source;
- dependency loss during in-flight work;
- graceful drain versus abrupt termination;
- resource exhaustion and declared backpressure;
- cleanup when one shutdown step fails.

Assert the intended durable state, degraded behavior, retry disposition, resource bound, recovery path, and operator-visible signal. Merely asserting that an error occurred does not demonstrate safe containment.

Prefer explicit clocks, barriers, channels, local servers, and bounded eventual assertions over arbitrary sleeps. Some runtime behavior requires real scheduling or polling; bound it, preserve diagnostics, and do not confuse a generous timeout with a latency guarantee.

Use race detection, repetition, randomized schedules, property tests, fuzzing, or interruption tests when concurrency and state space make example tests weak. Preserve seeds and minimized failures so the result is reproducible.

## 10. Preserve representative contracts and fixtures

Fixtures should represent the formats and boundaries the product actually supports:

- wire messages and generated bindings;
- database schemas and migrations;
- documents, archives, images, audio, and video;
- language, formatting, escaping, and placeholder cases;
- browser sizes and platform capabilities;
- old and new client or storage versions.

Use golden files when exact bytes, schemas, manifests, rendering, or reader behavior are the contract. Keep generation and drift checks connected to the authoritative source.

Fixtures must be minimal enough to maintain, broad enough to expose the claimed compatibility, reproducible, isolated, and free of production credentials or personal data. A golden fixture does not replace a real external parser, browser, client, or provider when interoperability is the claim.

## 11. Write benchmark code when performance is meaningfully measurable

For every feature, decide whether a useful performance metric and a stable, representative workload can be defined. When meaningful measurement is possible, reproducible benchmark code is **required** in the same change, even when no performance target was requested explicitly.

Performance is meaningfully measurable when one or more of these apply:

- the feature introduces or changes an algorithm, parser, serializer, query, index, cache, queue, codec, allocator-heavy path, or hot request path;
- latency, throughput, allocation, startup time, model time, or resource use affects user or operator experience;
- input size or concurrency can be varied deliberately;
- a before-and-after comparison can guide an engineering decision;
- a regression could be detected under a controlled local or test environment.

Do not create a benchmark merely to produce a number when setup noise, uncontrolled networks, third-party rate limits, changing hosted models, or unrelated system load dominate the result. When measurement is not meaningful, state why instead of presenting misleading precision.

Benchmark code SHOULD:

- live in the repository and be runnable again;
- generate or load representative, versioned input;
- separate setup and warm-up from the measured region;
- measure the metric tied to the feature's risk;
- vary meaningful sizes or concurrency levels;
- prevent the compiler or runtime from eliminating the work;
- report errors as well as latency or throughput;
- document the command, workload, and environment assumptions.

For Go, prefer `testing.B`, named sub-benchmarks, `b.ReportAllocs`, and correct timer control. Use `go test -bench` and `-benchmem` as the discoverable entry point. For other languages, use the smallest maintained benchmark harness or a focused workload driver that produces repeatable results.

Distinguish:

- a microbenchmark of one component;
- an integration benchmark of a real local boundary;
- an end-to-end workload through the user interface;
- a capacity, soak, or production-like test.

Do not present one as evidence for another. Record code revision, dependency versions, hardware or topology, dataset shape, concurrency, warm-up, repetitions, error rate, and relevant latency distributions when a decision depends on the result.

Avoid brittle pass/fail thresholds on noisy shared machines. A hard performance gate is appropriate only when the environment and variance are controlled and the threshold corresponds to a real requirement. Otherwise retain comparable raw output and evaluate statistically against a relevant baseline.

Benchmarks that call paid, scarce, destructive, or externally rate-limited dependencies must be clearly separated, bounded, and activated only when the environment deliberately provides them.

## 12. Keep the suite simple and operable

The repository should expose discoverable commands for the applicable QA layers. A top-level task or script SHOULD compose the relevant module and language-specific commands without hiding which evidence ran.

Prefer recognizable entry points for:

- unit tests;
- local and embedded integration tests;
- real external integration tests that run or skip by availability;
- end-to-end tests;
- the mandatory feature smoke path;
- benchmarks and heavier load or soak tests.

They need not all run in one default command when prerequisites, cost, or duration differ. Document the commands and make the fast local path easy to execute.

Keep helpers focused on shared semantics. Avoid a custom test framework that obscures ordinary assertions, process ownership, external prerequisites, or cleanup. Bound parallelism, time, subprocesses, network calls, payloads, and external cost.

Treat flakiness as lost evidence. Capture timing, seed, environment, resource pressure, and logs; fix undeclared dependencies, shared state, arbitrary sleeps, and cleanup failures. Retries may gather diagnostics but must not erase the original failure.

Coverage is a discovery tool, not a universal completion percentage. Prefer evidence for important branches, invariants, contracts, failure classes, and recovery transitions over maximizing a repository-wide number.

## 13. Complete the vertical slice

Tests and documentation are part of the feature, not deferred cleanup. A cohesive feature change SHOULD include:

- the implementation and connected runtime path;
- unit coverage for functional behavior;
- integration coverage for changed connections and composition;
- end-to-end coverage for the affected user interface;
- a smoke execution after the feature is assembled;
- benchmark code when meaningful measurement is possible;
- updated user, contract, operational, migration, and implementation-status documentation where behavior changed.

Do not describe code that merely compiles or passes unit tests as a QA-complete feature. If an applicable integration, end-to-end, smoke, benchmark, hardware, provider, or subjective check could not run, preserve the implementation but report the remaining validation accurately.

## 14. Report evidence honestly

Separate:

- what behavior was implemented or changed;
- which unit, integration, end-to-end, and smoke commands ran;
- which real, embedded, or mocked dependencies they exercised;
- which checks passed, failed, or skipped;
- every skip reason and the boundary left unverified;
- benchmark commands, workload, environment, and result when measured;
- subjective or operator-owned QA that remains.

`Tests pass` should name the relevant commands or suites. A skipped external integration or smoke test is useful information, not successful evidence. Production readiness requires environment, compatibility, failure, security, and capacity evidence appropriate to the system.

## 15. Review questions

| Concern | Question |
| --- | --- |
| Feature | Which unit tests establish that the feature's logic works? |
| Connection | Which integration tests exercise the real composition and adapter boundaries? |
| User | Which end-to-end path uses the same interface as the user? |
| Smoke | Was the completed feature run once through its actual entry point? |
| Doubles | Could an embedded or disposable real implementation replace this mock? |
| External | Did available dependencies run, and do absent ones produce an explicit skip? |
| State | Are duplicate, interrupted, reopened, and recovered transitions covered where material? |
| Lifecycle | Are startup, readiness, cancellation, drain, shutdown, and cleanup bounded? |
| Contracts | Do fixtures and golden data represent real formats and supported versions? |
| Performance | Can this feature be measured meaningfully, and if so, is benchmark code included? |
| Vertical slice | Did implementation, tests, runtime wiring, and affected documentation change together? |
| Evidence | What passed, what skipped, and what remains unverified? |
