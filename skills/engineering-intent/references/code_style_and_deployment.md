# Code Style and Deployment

Status: living document

Last consolidated: 2026-09-08

Audience: maintainers, reviewers, and coding agents

## 1. Purpose

Use this reference to keep source code understandable at its point of ownership and to make runnable artifacts reproducible outside one developer's machine.

This guidance covers:

- familiar function and method names;
- concise comments that preserve intent and constraints;
- practical Dockerfile requirements;
- bounded Docker Compose or Kubernetes local deployment;
- container lifecycle, state, security, and verification.

It does not select the project's language, framework, database, or deployment platform. Those choices follow the owning system's requirements and the technology preferences.

The keywords **MUST**, **SHOULD**, and **MAY** describe defaults. They do not override the user's latest explicit direction or established repository conventions.

## 2. Keep source code readable

Source code is part of the maintained explanation of the system. When writing or changing code, leave enough local context that another maintainer can understand the responsibility, intent, and non-obvious constraints without reconstructing them from the whole implementation.

Prefer straightforward control flow and visible ownership. Do not compress meaningful state transitions, error handling, lifecycle, or cleanup into clever expressions merely to reduce line count.

Follow the language formatter and the repository's established style. A local convention that is coherent and safe takes precedence over cosmetic normalization from this general reference.

## 3. Use familiar and precise names

Name functions and methods with common, conventional words from the language, standard library, repository, and problem domain whenever those words express the behavior accurately.

Prefer familiar verbs such as:

- `Get`, `List`, `Find`, and `Search` for distinct read semantics;
- `Create`, `Add`, `Append`, `Update`, `Replace`, and `Delete` for distinct mutations;
- `Load`, `Save`, `Open`, and `Close` for resources and persistence;
- `Start`, `Stop`, `Drain`, `Resume`, and `Shutdown` for lifecycle;
- `Parse`, `Validate`, `Encode`, `Decode`, and `Convert` for transformations.

Names SHOULD:

- state one clear responsibility;
- match existing vocabulary for the same concept;
- use ordinary language and ecosystem idioms;
- avoid unexplained abbreviations, uncommon synonyms, and invented terminology;
- distinguish operations whose contracts differ, such as create versus replace or stop versus drain;
- preserve a precise canonical domain term when simplifying it would lose meaning.

Do not force every name into a generic verb. A specific domain operation is better than a familiar but misleading name. Avoid vague names such as `Do`, `RunThing`, `Manage`, or `ProcessData` when a more precise common term exists.

Use the scope to control name length. A local variable may be short when its role is obvious; a public operation should remain recognizable without relying on nearby implementation details.

When renaming an established public symbol, account for compatibility and migration rather than treating naming cleanup as a private refactor.

## 4. Comment intent and constraints

Add concise comments where they provide useful orientation:

- public or exported types, functions, methods, and fields when the language or repository convention expects them;
- the purpose and high-level flow of a substantial component or workflow;
- why a non-obvious algorithm, ordering rule, workaround, bound, or failure policy exists;
- invariants around concurrency, durability, ownership, security, compatibility, or lifecycle;
- behavior that appears simplifiable but must remain for an external contract;
- temporary behavior with an owner or removal condition.

Comments SHOULD explain intent, reason, constraint, or consequence. Do not narrate syntax line by line, repeat a clear name, preserve commented-out code, or add vague prose merely to increase comment density.

Use a short overview comment before a multi-stage workflow when its phases or durability boundaries are not apparent. Keep detailed public contracts, architecture, operational procedures, and decision history in their owning documentation rather than embedding an essay in source code.

Update or remove a comment when the behavior it describes changes. A stale comment is a false contract.

## 5. Deliver reproducible artifacts

A feature is not fully connected when it runs only through an IDE, an undeclared local toolchain, or one developer's environment.

For every runnable command or process, identify:

- how it is built;
- its entry point and arguments;
- required configuration and secrets;
- owned ports, files, volumes, and child processes;
- startup, readiness, drain, shutdown, and cleanup behavior;
- the smallest smoke path;
- whether it can be packaged or run in a container.

Keep build and runtime dependencies explicit. Do not rely on an unrecorded globally installed package, local sibling checkout, credential, or generated artifact.

## 6. Provide a Dockerfile whenever practical

When a project or owned process can be built, tested, packaged, or run reproducibly in a container, it MUST include a Dockerfile. Container support is part of the deliverable rather than optional cleanup.

A practical Dockerfile exists when the required toolchain and dependencies can be obtained non-interactively and the container can provide a meaningful:

- build or test environment;
- release or packaging artifact;
- CLI execution;
- worker or service runtime.

A project need not pretend that a GUI, mobile application, hardware-bound runtime, kernel feature, or host-specific integration works inside a container when the platform contract makes that false. A build or packaging container may still be useful even when the final application cannot run there.

Prefer one Dockerfile per independently runnable command or process. Explicit named build targets MAY share one file when they preserve ownership, inputs, output, and runtime lifecycle clearly.

If a useful Dockerfile genuinely cannot be written, record the exact platform or runtime constraint in the blueprint, README, or milestone specification. Do not add a nonfunctional placeholder merely to satisfy the filename requirement.

## 7. Construct container images deliberately

The Dockerfile SHOULD:

- use reproducible, appropriately pinned builder and runtime bases;
- separate build and runtime stages when it reduces image size or attack surface;
- copy dependency manifests before frequently changing source when the build cache benefits;
- keep the build context bounded with a maintained `.dockerignore`;
- avoid copying credentials, local state, test output, or unrelated repository data;
- use build secrets or runtime secret injection rather than image layers or build arguments for sensitive values;
- run the final process as a non-root user when the workload permits;
- expose an explicit entry point, working directory, owned paths, and required ports;
- preserve signal handling and graceful shutdown;
- create writable directories with intentional ownership;
- include a health or readiness check only when it represents the process's real admission contract;
- avoid shells, compilers, package caches, and debug tools in a production runtime image without an operational need.

Do not optimize image size by removing certificates, time-zone data, codecs, shared libraries, or other runtime dependencies the declared behavior needs.

Keep architecture and platform support honest. A multi-architecture image requires actual build and smoke evidence for each claimed target, not only a cross-compilation flag.

## 8. Preserve runtime contracts

Containerization must not change domain authority, durability, or lifecycle semantics.

Document and implement:

- configuration and secret injection;
- listener addresses and ports;
- persistent versus disposable paths;
- file ownership and read-only filesystem expectations;
- resource limits and backpressure;
- dependency-aware readiness;
- graceful drain and shutdown deadlines;
- migration or initialization ownership;
- log and telemetry output;
- restart and duplicate-execution behavior.

Do not store authoritative state in an unnamed disposable container layer. Do not run schema migration independently in every replica unless the migration contract makes concurrent execution safe.

Use an init process only when the application cannot correctly reap children or receive signals itself. Prefer fixing application lifecycle ownership over hiding it behind a container wrapper.

## 9. Allow Compose or Kubernetes for local deployment

Assume Docker or an equivalent container engine may be available for local work. Docker, Podman, nerdctl with containerd, and compatible engines are acceptable when they can build and run the repository's declared artifact faithfully.

When local deployment helps integration, end-to-end, smoke, lifecycle, or packaging verification, the implementation MAY add and use:

- a Docker Compose file or an engine-compatible Compose configuration; or
- Kubernetes manifests for a confirmed local cluster such as kind, minikube, k3d, or Docker Desktop Kubernetes.

Choose the smaller topology that can expose the behavior under test.

Prefer Compose when one quantum or runnable process only needs a few local dependencies and Kubernetes semantics are not part of the claim.

Kubernetes manifests are appropriate when:

- the target runtime already uses Kubernetes;
- several processes, Services, configuration objects, volumes, or network edges must compose;
- readiness, restart, rollout, scheduling, replica, or service-discovery behavior is part of the test;
- the milestone needs a closer local approximation of its deployment contract.

Use plain manifests or the repository's existing Kustomize or Helm convention. Do not introduce a packaging layer solely to wrap a few stable local manifests.

Local deployment artifacts SHOULD:

- use an isolated Compose project name or Kubernetes namespace;
- use deterministic labels, service names, networks, volumes, and ports;
- deploy only the quantum and dependencies required by the test;
- use locally built or explicitly pinned images;
- expose only the interfaces needed by the developer or test;
- use readiness checks for dependency ordering instead of fixed sleeps;
- keep credentials synthetic and local;
- reference secrets through runtime injection and avoid committing secret values;
- distinguish disposable from persistent state and provide a scoped reset path;
- include resource requests or limits when scheduling and overload behavior matter;
- provide exact start, readiness, smoke, log, stop, and cleanup commands;
- avoid presenting a single-node fixture as production high availability.

Before applying Kubernetes manifests, verify that the selected context is a deliberately local cluster. If that cannot be established, writing and validating the manifests is allowed but applying them is not. This guidance does not authorize mutation of a remote, shared, staging, or production cluster.

Avoid cluster-scoped resources, operators, CRDs, host mounts, privileged containers, host networking, and fixed host ports unless the local test genuinely requires them and their consequence is documented.

Cleanup must target only resources owned by the local deployment. Resolve the exact Compose project, namespace, volumes, and other state before removal. Do not delete shared volumes, namespaces, images, or cluster resources as part of a generic reset command.

Compose and local Kubernetes are development and QA fixtures. They do not replace the Dockerfile, production deployment specification, capacity model, security review, or application-level recovery design.

## 10. Verify the artifact

Build the image whenever the environment provides Docker or a compatible builder. A successful file parse or image build does not prove the runtime works.

When the product claims container execution or local container deployment:

1. build the intended image or target;
2. inspect the build for leaked secrets and unintended files where material;
3. run it directly or deploy it through the selected Compose or local Kubernetes path with documented configuration and owned temporary state;
4. wait for real readiness rather than a fixed sleep;
5. execute the mandatory smoke path through the exposed user interface;
6. observe the expected result and critical side effect;
7. stop it through the normal signal path;
8. verify bounded shutdown and clean up only the deployment's owned resources.

Run integration or end-to-end tests against the image when container wiring, filesystem permissions, native dependencies, networking, or signal handling are part of the claim.

If the builder or required target platform is unavailable, still validate the Dockerfile as far as practical and report the image build and smoke test as unverified. Do not describe an unbuilt image as working.

## 11. Complete the vertical slice

A cohesive implementation change SHOULD include, where applicable:

- precise, familiar names;
- comments for non-obvious intent and constraints;
- updated public and operational documentation;
- a Dockerfile and `.dockerignore` for every practical container artifact;
- a bounded Compose or local Kubernetes deployment when it materially improves verification;
- build, integration, and smoke evidence for the container;
- documented reasons for any unavailable or impossible packaging path.

Avoid unrelated renaming, comment churn, or deployment redesign in a focused feature change. Improve the code and artifact paths that the requested behavior actually touches.

## 12. Review questions

| Concern | Question |
| --- | --- |
| Names | Do functions and methods use precise, familiar language and repository vocabulary? |
| Semantics | Do names distinguish operations whose contracts or lifecycle differ? |
| Comments | Do comments explain non-obvious intent, invariants, constraints, and consequences? |
| Accuracy | Did changed behavior update or remove stale comments? |
| Artifact | Can each runnable process be built and started without undeclared local state? |
| Dockerfile | Is there a useful Dockerfile whenever build, test, packaging, or runtime containerization is practical? |
| Local deployment | Is Compose or Kubernetes the smallest topology that can verify the required behavior? |
| Cluster | Before applying manifests, was the Kubernetes context confirmed to be local and isolated? |
| Image | Are build inputs reproducible and runtime contents appropriately minimal? |
| Security | Are secrets absent from build context, layers, arguments, and committed configuration? |
| State | Are persistent and disposable paths distinguished honestly? |
| Lifecycle | Do readiness, signals, drain, shutdown, and child processes behave correctly? |
| Verification | Was the image built and its real user-facing smoke path executed? |
| Cleanup | Can the local deployment remove only its own namespace, project, volumes, and state? |
| Limits | Are unavailable platforms and unverified container claims reported explicitly? |
