# Security

Status: living reference

Use this reference for trust boundaries, identity, authority, credentials, secrets, sensitive data, abuse controls, retention, deletion, or cryptography. Select controls from the current threat model and owning contracts, not from availability of a mechanism.

## Name the protected capability

Identify the subject, protected resource or capability, decision authority, attacker and failure modes, exposed data, acceptable revocation delay, and recovery consequence of lost keys or identity state. A control aimed at the wrong boundary adds cost without reducing the relevant risk.

Network placement, transport security, authentication, authorization, confidentiality, integrity, abuse prevention, and audit are distinct:

- reachability is not identity;
- authentication proves identity or possession, while authorization decides a domain action;
- encryption protects disclosure, not authority;
- rate limits and moderation constrain use, not permission;
- audit explains consequential actions, not enforcement.

A trusted network may justify omitting a specific peer-authentication control only as an explicit scoped decision that is revisited when exposure changes.

Map trust boundaries across external clients, gateways, internal networks, queues, storage, CI, operator tools, and third-party providers. A control at one edge does not automatically protect messages replayed from a broker, data copied to analytics, or credentials used by an internal worker.

## Treat input as data and work

Every boundary input is untrusted in syntax, semantics, authority, and resource cost. Bound encoded/decoded size, depth, counts, field lengths, duration, redirects, parsing/transcoding/rendering time, and fan-out before expensive work where possible.

For server-side fetches, restrict schemes, destinations, ports, redirects, and resolved network ranges; reapply policy after resolution and every redirect. Validate file type from content when it matters, reject ambiguous normalization, and isolate risky parsers or converters according to actual exploit and amplification impact.

Errors should help callers correct safe input without revealing paths, queries, credentials, parser state, or neighboring resources. Fuzz, malformed-input, decompression, and maximum-cost cases are appropriate evidence.

For uploads, archives, media, templates, and generated content, account for work amplification after nominal byte-size validation. Limit members, decoded dimensions or duration, recursive expansion, regex and parser complexity, child processes, and downstream fan-out. Normalize and validate the same representation that execution consumes.

## Separate identity proof from domain authority

Identity systems assert who acts. The quantum owning the resource decides what that subject may do. Pass only claims needed at the receiving boundary; do not relay primary session credentials or raw factors through unrelated systems.

Short-lived signed assertions can remove a harmful synchronous identity dependency. Their contract includes issuer, audience, kind/purpose, issued/not-before/expiry times, key ID, algorithm registry, skew, publication overlap, and revocation/account-state convergence. A valid signature does not prove current domain state; local verification deliberately trades immediate revocation for availability.

Use one-time opaque credentials for admission or handoff when replay grants a new capability. Store a verifier or hash when raw recovery is unnecessary and consume atomically at the authority.

## Make authorization explainable

Represent grants and denials as owned domain facts. Define scope, inheritance direction, conflict rules, and denial precedence. Preserve a reason path. Keep dynamic time, device, network, or MFA attributes in an explicit policy layer. Cached decisions are projections with declared staleness and invalidation.

For hierarchical policy, separating subject, permission, and object hierarchies may help, but a grant `(subject, permission, object)` remains one atomic relationship. Use the smallest model able to express required policy, simulate changes, explain results, and revoke safely; do not adopt a general graph engine for theoretical expressiveness alone.

Authorization caches and signed claims require a defined invalidation or expiry window. Sensitive mutation should re-check current authority when stale acceptance is unacceptable. Explain whether denial wins over inheritance, how tenant boundaries are encoded, and how policy changes affect already established sessions.

## Minimize credential power and lifetime

Scope credentials by purpose, audience, resource, and capability; limit lifetime; rotate independently from primary credentials; log only stable non-secret identifiers; and exclude raw credentials from URLs, errors, traces, analytics, events, and ordinary records.

Sessions, refresh/device credentials, publish keys, admission tokens, signing keys, storage credentials, and break-glass access have distinct lifecycles. One credential must not silently serve unrelated purposes. Opaque IDs are not authorization, encryption, or DRM.

## Own every secret lifecycle

Define generation and randomness; first plaintext location; process entry; allowed consumers; persistence, replication, backup, and export; rotation and overlap; revocation/fencing; avoidance in memory copies, files, logs, dumps, and telemetry; and permanent-loss consequences.

Environment variables, files, secret stores, hardware-backed keys, and protected memory solve different parts. For high-value plaintext, guarded memory may reduce swapping and remnants, but keep scopes small, avoid unmanaged copies and formatted strings, wipe buffers, understand FFI/GC/dumps/OS limits, and measure overhead. It cannot protect against code already holding process authority.

Make secret-loading failures explicit at startup or at the capability boundary. Avoid permissive fallback to test keys, empty secrets, or previous credentials outside a declared recovery window. Separate public verification material from private signing authority and give both stable non-secret identifiers for audit and rotation.

## Treat rotation and compromise as protocols

Signing rotation distinguishes generated, active-for-signing, published-for-verification, retired-but-verifiable, expired, and compromised/revoked states. Publish the next verification key before use; retain the previous public key until all credentials plus allowed skew/cache windows expire.

Stable algorithm identifiers need a registry defining verification, encoding, status, and migration. Agility means controlled introduction, overlap, selection, and retirement without ambiguity or synchronized replacement—not dynamic acceptance of unreviewed algorithms or downgrade.

For material compromise classes define detection and incident authority, blast radius, independent stop control, revocation/re-evaluation of keys/sessions/grants/projections, clean replacement, durable audit evidence, staged restoration, verification, and required notification. Distinguish compromise from permanent key loss. Exercise rotation, revocation, cache invalidation, restore, and narrowly scoped, time-bounded, strongly audited break-glass paths.

Emergency action should not depend solely on the component suspected of compromise. Preserve an independent authenticated control path where practical, and record exactly which issuance, verification, mutation, or disclosure capabilities it can stop. Recovery evidence must prove that stale keys and projections no longer authorize new work.

## Choose fail-open or fail-closed by capability

Authority creation, sensitive disclosure, and protected mutation normally fail closed. A valid short-lived locally verified session may continue during issuer outage; an abuse-control projection may converge later only if the product accepts the gap and authority repairs it. Record the owner, allowed staleness, convergence, and re-evaluation path. There is no universal failure policy.

## Treat sensitive-data placement as architecture

For each data class define regions and jurisdictions, encryption and key ownership, replicas and backups, access and audit, retention trigger, deletion lifecycle, and whether projections or telemetry inherit sensitivity.

Deleting a primary row does not immediately delete replicas, caches, backups, provider versions, or distributed ciphertext. State that lifecycle honestly. Do not collect a sensitive field merely because it might become useful.

Retention begins from a named event—creation, last use, account closure, legal release, or another owned trigger. Derived indexes and telemetry inherit the relevant classification even when they contain only fragments or identifiers. Regional placement and backup restoration must not reintroduce data after its authoritative deletion state.

Audit records should include actor and authenticated subject, target and capability, decision/reason, policy or credential version, request/trace/operation IDs, responsible component, time, and partial or delayed outcome—without passwords, tokens, cookies, authorization headers, keys, OTPs, recovery codes, or sensitive payloads. Hashing a low-entropy secret does not make logging safe.

## Protect the supply chain proportionally

Dependencies, generators, base images, CI actions, registries, build workers, and release credentials are trust boundaries. Keep dependencies intentional and resolved versions reproducible; use known sources and provenance/checks where supported; reproduce generated code from reviewed inputs; associate risky artifacts with source and builder; isolate least-privileged release credentials; keep runtime images minimal; and produce an SBOM when incident response, assurance, or regulation needs it.

Scanners provide findings, not proof. Triage by exposure, reachability, controls, and update risk; absence of a published vulnerability does not make abandoned inputs safe.

## Verify the security contract

Test replay and atomic consumption; expiry/not-before/audience/purpose/key failures; rotation overlap and stale verifier caches; revocation convergence; inheritance and denial conflicts; tenant isolation; concurrent grants/removals/sessions; redaction; restart and restore; loss and compromise; deletion across derived state; malformed and maximum-cost input; and downgrade or algorithm confusion.

Use maintained cryptographic libraries and official vectors. Do not invent primitives or protocols in ordinary application work.

Security-specific review questions are: What capability and attacker are in scope? Which authority makes authorization? What credential lifetime and revocation window are accepted? How are secrets rotated, lost, or compromised? Which capabilities fail open or closed? Where does sensitive data propagate and when does it disappear? Which tests exercise abuse rather than only a valid cryptographic path?
