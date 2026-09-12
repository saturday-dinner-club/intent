# Runtime Artifacts and Local Deployment

Status: living reference

Use this reference when work creates or changes a runnable process, Dockerfile, container contract, Compose setup, local Kubernetes manifest, or artifact-level verification. It does not select the project's language or production platform.

## Make runnable artifacts reproducible

For a runnable command or process being created, packaged, or prepared for others, identify the items needed by its current contract:

- build method, entry point, arguments, and required configuration;
- secrets and how they enter at runtime;
- owned ports, paths, volumes, children, and persistent state;
- startup, readiness, admission, drain, shutdown, and cleanup;
- the smallest user-facing smoke path;
- whether build, test, packaging, or runtime can use a container.

Do not rely on an undeclared global tool, sibling checkout, credential, generated file, or IDE state.

Keep build inputs and runtime inputs distinct. Generated assets needed at runtime must be produced by a declared build step or checked in under repository policy. Record supported architectures and native-library requirements instead of allowing the local host to satisfy them invisibly.

## Add a Dockerfile when it serves the delivery

Add or change a Dockerfile when the user requests a container, the repository already treats it as a supported artifact, deployment will use it, or a specific build/runtime claim needs container evidence. The fact that a project could run in a container is not enough. Do not add container packaging to a library, CLI, prototype, or focused feature solely for completeness.

A GUI, mobile app, hardware-bound runtime, kernel feature, or host integration need not pretend to run in a container. A build container may still be valuable when requested. Explain the absence of a Dockerfile only when users reasonably expect one or the task is evaluating packaging; do not add a placeholder or a document solely to record that it was skipped.

Prefer one Dockerfile per independently runnable process. Named targets may share a file when inputs, outputs, ownership, and lifecycle remain clear.

The Dockerfile requirement follows practical value, not the presence of a network listener. Libraries may benefit from reproducible test/build targets; CLIs and workers can have meaningful runtime images; a host-bound application may still use a packaging stage. Avoid one enormous image whose only purpose is to contain every repository tool and process.

## Build images deliberately

A Dockerfile should:

- use reproducible, appropriately pinned builder and runtime bases;
- separate build and runtime stages when useful;
- bound context with `.dockerignore` and exclude credentials, local state, output, and unrelated files;
- use build-secret or runtime-secret injection rather than layers or ordinary build arguments;
- run non-root when the workload permits;
- declare the working directory, entry point, owned paths, and ports;
- preserve signal delivery and graceful shutdown;
- create writable paths with intentional ownership;
- include health or readiness only when it represents real admission;
- omit compilers, shells, caches, and debug tools from a production image unless needed.

Do not remove certificates, time-zone data, codecs, or libraries required by the declared runtime. Claim an architecture or platform only after its build and smoke path are verified.

## Preserve the runtime contract

Containerization must not change authority or durability. Document configuration precedence, listener addresses, persistent and disposable paths, filesystem permissions, resource limits, readiness dependencies, drain deadlines, migration ownership, telemetry output, and restart or duplicate behavior.

Never store authoritative state only in an unnamed disposable layer. Do not run a migration from every replica unless concurrent execution is safe. Use an init process only when the application cannot correctly reap children or receive signals itself.

Readiness should fail when the process cannot accept its intended new work, but should not necessarily depend on optional accelerators. Liveness should not restart a process merely because one downstream call is slow. Restart policy must account for duplicate execution and backoff at the orchestrator as well as inside the application.

## Use Compose or local Kubernetes when useful

Assume Docker or a compatible container engine may be available. Compose and Kubernetes manifests are allowed when they improve local integration, end-to-end, smoke, lifecycle, or packaging evidence. Choose the smallest topology that exposes the claim.

Prefer Compose for one quantum or a few dependencies. Use Kubernetes when the target already uses it or when Services, readiness, restart, rollout, replica, scheduling, or discovery semantics are part of the evidence. Follow an existing Helm or Kustomize convention; do not add a packaging layer solely to wrap a few local manifests.

Local fixtures should:

- use an isolated Compose project or Kubernetes namespace;
- deploy only the required quantum and dependencies;
- use locally built or pinned images and synthetic credentials;
- expose only needed interfaces;
- use readiness rather than fixed sleeps;
- distinguish disposable from persistent state;
- bound resources where scheduling or overload matters;
- document exact start, readiness, smoke, logs, stop, and scoped cleanup commands;
- avoid claiming single-node fixtures prove production availability.

Before applying Kubernetes resources, verify the selected context is a deliberately local cluster such as kind, minikube, k3d, or Docker Desktop Kubernetes. If that cannot be established, writing and static validation are allowed; application is not. This reference never authorizes changes to remote, shared, staging, or production clusters.

Use plain manifests when sufficient. Existing Kustomize or Helm conventions may parameterize local values, but generated output should be inspectable and validation should use the same rendered form that would be applied. Compose dependency order does not replace application-level retries and readiness.

Avoid cluster-wide resources, operators, CRDs, host mounts, privileged containers, host networking, and fixed host ports unless the local test requires them. Cleanup must resolve and target only resources owned by the fixture.

## Verify the artifact

When the task creates or changes an intended image and the environment provides a compatible builder, build it. When container execution is part of the claim:

1. run the image directly or through the selected local fixture;
2. wait for real readiness;
3. execute a representative smoke path through the exposed user interface;
4. observe the result, critical side effect, and fatal runtime signals;
5. stop through the normal signal path;
6. verify bounded shutdown and scoped cleanup.

Run integration or end-to-end tests against the image when wiring, permissions, native dependencies, networking, or signals are material. If the builder or platform is unavailable, validate as far as possible and report build and runtime smoke evidence as unverified, not passed.

Inspect final image contents and history when secret leakage, unintended source, package managers, test fixtures, or large native dependencies are a risk. A successful build proves neither a minimal image nor correct runtime permissions. Multi-platform claims require at least build plus representative execution evidence for each supported target.

Review only questions that match the changed artifact: Can another user reproduce the supported process? Are secrets and state handled honestly? If an image or readiness contract changed, did the relevant build, run, smoke, stop, and cleanup behavior work?
