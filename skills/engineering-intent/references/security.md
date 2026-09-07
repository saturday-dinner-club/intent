# Security

Status: living document

Last consolidated: 2026-09-07

Audience: maintainers, reviewers, and coding agents

## 1. Purpose

Use this reference when work crosses a trust boundary or handles identity, authority, credentials, signing material, personal data, abuse controls, retention, or deletion.

Security decisions MUST follow the current threat model and the owning system's explicit contracts. This reference provides a decision framework; it does not mandate one identity provider, cipher suite, transport, or deployment topology.

## 2. Name the protected capability

Before selecting a control, identify:

- the subject acting;
- the resource or capability being protected;
- the authority that makes the decision;
- the attacker and failure modes being considered;
- the data exposed if the control fails;
- the acceptable revocation and convergence delay;
- the recovery consequence if keys or durable identity state are lost.

Do not use a security mechanism merely because it is available. A mechanism that protects the wrong boundary can add operational cost without reducing the relevant risk.

## 3. Keep controls distinct

Network placement, transport security, authentication, authorization, confidentiality, integrity, abuse prevention, and audit are separate controls.

- Network policy limits who can reach an endpoint.
- Transport security protects a connection and may authenticate peers.
- Authentication establishes an identity or possession claim.
- Authorization decides whether that identity may perform a specific operation.
- Encryption protects data from disclosure; it does not grant authority.
- Rate limits and moderation constrain allowed use; they do not replace authorization.
- Audit records explain consequential actions; they do not enforce them.

A trusted network MAY justify omitting application-level peer authentication for a specific internal path. That choice must be explicit, scoped, and revisited when topology or exposure changes.

### Treat external input as both data and work

Every boundary input is untrusted until its syntax, semantics, authority, and resource cost have been evaluated. This includes API fields, URLs, redirects, uploaded files, media streams, serialized messages, compressed bodies, archive members, templates, and generated content.

Apply limits before expensive work whenever possible:

- bound encoded and decoded size, nesting depth, collection count, field length, duration, and processing time;
- allow only required URL schemes, destinations, ports, redirect behavior, and resolved network ranges for server-side fetches;
- reapply destination policy after DNS resolution and every redirect rather than validating only the original URL text;
- detect file type from validated content when type matters instead of trusting a name or client header;
- account for decompression, parsing, transcoding, rendering, regex, and fan-out amplification;
- isolate high-risk parsers or converters according to their actual exploit and resource impact;
- reject ambiguous encodings and avoid validating one representation before executing a differently normalized representation.

Validation errors should reveal enough for the caller to correct safe input without exposing internal paths, queries, credentials, parser state, or neighboring resources. Fuzzing, malformed-input suites, and maximum-cost cases are appropriate evidence for parsers and externally supplied binary formats.

## 4. Separate identity proof from domain authority

An identity system proves or asserts who is acting. The quantum that owns a resource SHOULD decide what that identity may do with the resource.

Prefer credentials containing only the claims needed at the receiving boundary. Avoid sending primary session credentials or raw authentication factors through unrelated systems.

When local verification reduces a harmful synchronous dependency, a signing authority MAY issue short-lived signed assertions and publish verification keys. The contract then includes:

- issuer and audience;
- credential kind and allowed use;
- issued, not-before, and expiry times;
- stable key identifier;
- algorithm identifier and registry semantics;
- clock-skew policy;
- key publication overlap;
- revocation or account-state convergence expectations.

Local verification trades immediate central revocation for availability. Make that window deliberate rather than implying that a valid signature proves current account or resource state.

Use one-time opaque credentials for admission or handoff when replay would grant a new session or capability. Store only a verifier or hash when the raw token does not need to be recovered. Consume it atomically at the authority that owns its use.

## 5. Make authorization explainable

Authorization models should be expressive enough for the domain and constrained enough to operate safely.

- Represent grants and denials as domain facts, not scattered endpoint conditionals.
- Define inheritance direction and scope explicitly.
- Define conflict rules, including whether denial takes precedence.
- Preserve a reason path so an operator can answer why access was allowed or denied.
- Keep runtime attributes such as time, device trust, network, or MFA state in an explicit policy layer when they do not fit the relationship model.
- Treat cached decisions as projections with known staleness and invalidation behavior.

For hierarchical domains, separating subject, permission, and object hierarchies can make grants easier to inspect. A grant such as `(subject, permission, object)` should remain one atomic relationship; decomposing it into unrelated edges can create unintended combinations.

Do not adopt a general graph authorization system merely for theoretical expressiveness. Prefer the smallest model that can represent required policy, simulate changes, explain decisions, and support revocation.

## 6. Minimize credential power and lifetime

Credentials SHOULD be:

- scoped to a purpose, audience, resource, and capability;
- short-lived enough to bound theft and revocation impact;
- independently rotatable from primary account credentials;
- represented by stable non-secret identifiers in logs and audit records;
- excluded from URLs, error messages, traces, analytics, and ordinary events.

One credential should not silently serve unrelated purposes. Session credentials, refresh or device-bound credentials, publish keys, admission tokens, signing keys, storage credentials, and operator break-glass access have different lifecycles and consequences.

Opaque identifiers reduce enumeration. They are not authorization, encryption, or DRM.

## 7. Own the secret lifecycle

For every secret, define:

1. how it is generated with an approved source of randomness;
2. where its plaintext first exists;
3. how it enters the process;
4. which process and code paths may use it;
5. whether it is persisted, replicated, backed up, or exported;
6. how it is rotated and how old and new versions overlap;
7. how compromise revokes or fences it;
8. how memory, files, logs, crash dumps, and telemetry avoid retaining it;
9. what happens if it is permanently lost.

Environment variables, configuration files, secret stores, hardware-backed keys, and in-memory protected buffers solve different parts of this lifecycle. Naming one of them does not complete the design.

### Protected memory

Locked or guarded memory MAY reduce swapping, accidental copying, and post-use remnants for high-value plaintext such as signing keys. Use it selectively:

- keep plaintext scopes small;
- avoid conversions that create unmanaged copies;
- wipe or destroy buffers after use;
- keep secrets out of formatted strings and ordinary immutable values where practical;
- understand crash dumps, foreign-function calls, garbage collection, and operating-system limits;
- measure the system-call and encryption overhead of sealed-memory abstractions.

Protected memory is defense in depth. It does not protect a secret from code already executing with the process's authority.

### Protect the software supply chain

Source code is only one input to a deployed system. Dependencies, build tools, generated code, base images, CI actions, package registries, and release credentials also cross trust boundaries.

- Keep direct dependencies intentional and remove unused ones.
- Lock or otherwise record resolved dependency versions so builds can be reproduced and reviewed.
- Obtain packages and tools from known sources and verify checksums, signatures, or provenance when the ecosystem supports them.
- Make generated code reproducible from a reviewed schema, generator, and configuration; treat unexplained generated diffs as code changes.
- Associate an artifact with its source revision, build inputs, and builder identity where operational risk justifies it.
- Keep build workers and release credentials least-privileged and separate from ordinary application credentials.
- Prefer minimal runtime images and exclude compilers, test fixtures, source credentials, and unrelated tools from the final artifact.
- Produce a software inventory or SBOM when incident response, customer assurance, or regulation needs reliable dependency discovery.

Automated vulnerability and secret scanners provide evidence, not a proof of safety. Triage findings according to reachability, exposure, compensating controls, and update risk. Conversely, the absence of a published vulnerability does not establish that an abandoned or unverifiable dependency is safe.

## 8. Design key rotation as a protocol

Rotation is not a periodic key-generation job alone. It is a compatibility window between issuers and verifiers.

A signing-key lifecycle SHOULD distinguish:

- generated but not yet used;
- active for signing;
- published and accepted for verification;
- retired from signing but retained for verification;
- expired and removable;
- revoked due to compromise.

Publish the next verification key before it can be used for signing. Retain the previous public key until every credential it signed, plus tolerated clock and cache skew, can no longer be accepted.

Algorithm identifiers SHOULD be stable protocol values backed by an internal registry. They may be opaque to discourage external coupling, but obscurity is not a security property. The registry must still define verification behavior, key encoding, status, and migration rules.

Cryptographic agility means an algorithm can be introduced, overlapped, selected, and retired without ambiguous downgrade behavior or synchronized replacement of every consumer. It does not mean enabling unreviewed algorithms dynamically.

## 9. Choose fail-open and fail-closed per capability

Do not set one universal failure policy.

- Operations that create authority, disclose sensitive data, or mutate protected state normally fail closed.
- A short-lived locally verifiable session may continue through a key-service outage if its verification key is already valid and cached.
- A moderation or abuse-control projection may converge loosely only if the product accepts the temporary gap and durable state can repair it.
- Break-glass behavior requires narrow scope, strong audit, expiry, and explicit operator intent.

Record which dependency is authoritative, which projection may be stale, and how a delayed revocation is re-evaluated.

### Plan for compromise and recovery

Design high-impact credentials and security services under the assumption that either a secret may be exposed or an authorized component may act incorrectly.

For each material compromise class, define:

- how it is detected and who may declare the incident;
- the identities, credentials, data, regions, and time range in its possible blast radius;
- how issuance or mutation can be stopped without relying on the suspected component;
- how keys, sessions, tokens, grants, caches, and derived projections are revoked or re-evaluated;
- how clean replacements are generated, distributed, and activated;
- which durable audit evidence must be preserved without retaining the compromised secret;
- how service is restored in stages and how recovery is verified;
- how affected users or operators are notified when required.

Distinguish secret compromise from permanent key loss. Compromise requires distrust and replacement; loss may make encrypted data or signed-state recovery impossible even when no attacker is present.

Emergency controls should be narrow, authenticated through an independent path where practical, time-bounded, and strongly audited. Periodically exercise rotation, revocation, cache invalidation, restore, and break-glass procedures before an incident makes them the only available path.

## 10. Treat sensitive data placement as architecture

Classify data before choosing replication and retention. For each class, define:

- allowed regions and legal jurisdictions;
- encryption and key ownership;
- replication and backup scope;
- access roles and audit requirements;
- retention trigger and expiry calculation;
- deletion, tombstone, backup, cache, and CDN behavior;
- whether derived indexes and telemetry contain the same sensitivity.

Deletion promises must describe the full lifecycle honestly. Removing the primary row does not immediately remove replicas, caches, immutable backups, provider versions, or previously distributed ciphertext.

Collect no security-sensitive field merely because it may become useful. Data that does not exist cannot be leaked.

## 11. Audit without reproducing the secret

Audit consequential decisions and transitions with:

- actor and authenticated subject identifiers;
- target resource and capability;
- decision and stable reason code;
- policy or credential version when material;
- request, trace, and operation identifiers;
- timestamp and responsible component;
- outcome, including partial or delayed application.

Do not log raw tokens, passwords, OTPs, private keys, session cookies, authorization headers, recovery codes, or sensitive content payloads. Hashing a low-entropy secret does not automatically make it safe to log.

## 12. Verify the security contract

Security tests SHOULD cover the boundaries rather than only cryptographic happy paths:

- replay and double consumption;
- expired, premature, wrong-audience, wrong-purpose, and unknown-key credentials;
- rotation overlap and stale verifier caches;
- revocation and delayed projection convergence;
- privilege inheritance, denial conflicts, and tenant isolation;
- concurrent grants, removals, and session creation;
- redaction in logs, traces, metrics, and errors;
- restart, backup restore, and key loss;
- downgrade and algorithm-confusion attempts;
- deletion across primary data and derived projections.

Use official test vectors and maintained libraries for cryptographic primitives. Do not invent a primitive or protocol as part of ordinary application work.

## 13. Historical source notes

This reference distills recurring ideas from snowmerak's writings on namespace authentication and public-key verification, protected secret memory, and explainable relationship authorization. Algorithm-specific experiments in older posts are historical evidence, not current recommendations. Revalidate standards, libraries, and cryptographic algorithms against current primary sources before implementation.

Primary source material:

- [더 나은 제안, KEMTLS](https://github.com/snowmerak/snowmerak/blob/main/content/posts/000_kemtls.md) — historical post-quantum protocol exploration; retain the agility lesson, not its algorithm selection.
- [분산 서비스에서의 R&R](https://github.com/snowmerak/snowmerak/blob/main/content/posts/034_RnR.md) — local verification and public-key distribution across service boundaries.
- [메모리에 소금 뿌리기](https://github.com/snowmerak/snowmerak/blob/main/content/posts/052_libsodium.md) — protected-memory lifecycle, zeroization, and selective use according to cost.
- [Opinionated Zanzibar](https://github.com/snowmerak/snowmerak/blob/main/content/posts/058_rebac.md) — constrained and explainable relationship authorization.
