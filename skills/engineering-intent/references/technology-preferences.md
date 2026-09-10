# Technology Preferences

Status: living reference

These are recurring Saturday Dinner Club defaults that reduce search space, not architecture mandates.

Choose in this order: define domain invariants, durability, latency, recovery, and operational unit; reuse a preference if it fits; otherwise choose the better technology and record the changed requirement and operational trade-off. Keep versions, topology, schemas, tuning, and implementation status in the owning quantum.

**Default** means consider first. **Conditional** means preferred for a stated workload. **Experimental** means an extension path exists but is not an operational default.

## Languages and runtimes

### Go for authoritative and long-running backends

Prefer Go for authoritative APIs, network edges, workers, publishers, and control-plane services, especially when a process owns transactions, leases, bounded queues, long-lived connections, or several dependency lifecycles.

Single binaries, explicit concurrency and cancellation, and the standard HTTP, context, crypto, and testing packages fit VM and container operation. Prefer the standard library and small adapters over a large application framework. Let each repository pin its toolchain; vendor dependencies when reproducible release builds justify it. A sibling `replace` is local convenience, not a deployment contract.

Prefer explicit composition roots, context propagation, narrow interfaces, and ownership of goroutines and children. A shared runtime and observability facade may normalize lifecycle and diagnostics across quanta, but domain packages should not import deployment topology or vendor clients through that convenience layer.

Do not force browser interfaces, codecs, or data-science work into Go.

### Go or Rust for sidecars

Prefer Go when orchestration, concurrent connections, delivery speed, and existing client reuse dominate. Prefer Rust for strict memory ownership, low-level protocols, predictable resources, or low overhead. In both cases, buffering, backpressure, readiness, drain, and peer compatibility are part of the sidecar contract.

### NestJS or FastAPI for stateless and specialized APIs

NestJS or FastAPI is suitable for lightweight transformation, composition, or specialized functions that do not own authoritative transitions. Prefer NestJS when TypeScript structure, validation, and ecosystem matter; Prisma is the relational default there. Prefer Python and FastAPI for model, analytics, and data workloads.

Database access alone does not establish authority. If the service owns canonical transitions and migrations, reconsider the Go default and document why another runtime fits better. Frameworks do not remove idempotency, timeout, capacity, observability, or shutdown duties.

Do not split the same domain into runtimes merely to use each preferred framework. A second runtime should earn its build, dependency, debugging, deployment, and compatibility cost through a workload or ecosystem benefit.

### TypeScript for browser code

Prefer TypeScript and Node tooling for browser SDKs, framework-independent clients and players, demos, and frontend builds. Implement cores against standard DOM and Web APIs and publish framework-neutral ESM. When a framework is useful, prefer Svelte; choose React for an existing consumer or ecosystem constraint. The order is **vanilla, then Svelte, then React**.

Keep framework wrappers thin and prevent framework state from becoming the authority of a portable core. Use npm workspaces and one lockfile when related packages share a release boundary. Node.js is primarily a browser build/test runtime here, not the default server runtime.

Vite, the TypeScript compiler, Vitest, and jsdom are useful defaults for browser packages. Real-browser evidence remains necessary for platform APIs, rendering, playback, lifecycle, and interoperability that simulated DOMs cannot establish.

### Python with `uv`

Use Python for automation, data processing, ML, analytics, and operational tooling. Prefer `uv` for interpreter, dependency, lock, and command management. Do not infer a broader Python service topology before the workload requires it.

Load the narrower data, protocol/client, media, identity/crypto, or observability/build preference reference only when selecting within that domain.
