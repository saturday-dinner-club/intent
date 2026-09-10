# Protocol and Client Preferences

Status: living reference

Apply [interfaces-and-contracts.md](interfaces-and-contracts.md) for semantics and OpenAPI. These are transport and client defaults, not substitutes for workload and threat analysis.

## HTTP and JSON

Prefer HTTP with bounded JSON for public or control APIs used by browsers or humans. Define body/decompression limits, unknown fields, single-value decoding, structured errors, timeouts, caching, and idempotency.

JSON is selected for interoperability and inspection, not because payload and parsing cost are irrelevant. Reject trailing or multiple top-level values when the contract expects one, distinguish missing from explicit zero/null where needed, and cap both compressed and expanded bodies before expensive validation.

When practical, terminate external TLS at Nginx, Caddy, or an equivalent edge and use plain HTTP on a controlled private application network. There is no global preference between Nginx and Caddy; choose by certificate automation, discovery, configuration, and operations. Use backend TLS or mTLS for shared/untrusted networks, cross-region links, regulation, or a concrete peer-authentication threat.

Strip or overwrite untrusted `Forwarded` and `X-Forwarded-*` headers. Trust proxy metadata only from configured proxies, especially when scheme, host, address, redirects, cookies, authorization, or audit depends on it. Prevent internal listeners and health endpoints from reaching public ingress.

An internal HTTP endpoint is still a trust boundary. Private-network placement may be the deliberate control, but it must be expressed in deployment and ingress policy. Edge termination does not remove confidentiality or peer-authentication requirements on later network segments.

## Protobuf, gRPC, and Buf

Prefer Protocol Buffers and gRPC for typed internal control RPCs, streaming commands/watches, and cross-language generated clients. Prefer Buf for linting, breaking checks, and reproducible generation.

Do not force a high-volume data plane through gRPC. Generated gRPC may control a bounded framed TCP or other specialized path, with Protobuf only for the frame header. Select Protobuf, FlatBuffers, or AntiSerial under the interface reference's workload rules.

Version schemas and generated packages together, publish them from one authority, and test breaking changes before regeneration. Keep domain workflow, authorization, retries, and caching outside generated handlers and DTOs so transport upgrades do not rewrite business policy.

## Browser transports and clients

WebSocket is the current compatibility and operational default for bidirectional browser sessions. WebTransport may implement the same application protocol but remains experimental until browser/proxy compatibility and a meaningful performance benefit are demonstrated. A transport change must preserve identity, authentication, acknowledgment, resume, duplicate, ordering, and backpressure semantics.

Prefer TypeScript framework-neutral browser cores against DOM and standard Web APIs. Use Vite for interactive applications or demos when appropriate, with thin Svelte-first or React-when-required wrappers. Tooling choices do not make a UI framework part of the wire or domain contract.

Browser compatibility requires real target engines and proxy paths for connection establishment, reconnect, backgrounding, autoplay/media capabilities, and teardown. A Node or jsdom test can establish portable logic but not the browser transport claim.
