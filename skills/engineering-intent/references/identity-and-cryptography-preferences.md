# Identity and Cryptography Preferences

Status: living reference

Apply [security.md](security.md) and the Accounts-owned threat model before these implementation defaults.

## Accounts-family defaults

- Argon2id with per-account random salt and root-derived pepper for password verification.
- An HMAC-derived lookup key separated from an XChaCha20-Poly1305-encrypted original for searchable email identity.
- TOTP or Passkey/WebAuthn for MFA, with user verification required.
- DBSC device proof as browser session-extension authority where supported; it is not a fallback refresh token.
- Ed25519 plus JWKS for current internal AcT and RfT signing.
- An opaque signature profile on the wire rather than algorithm names embedded in domain semantics, preserving reviewed migration to ML-DSA, Falcon, or another choice.
- File-mounted secrets, label-derived subkeys, explicit zeroization, `memguard`, and the Go protected-secret facility where supported for root and private signing material.

The owning contract defines parameters, lifetimes, overlap, downgrade, and migration. Agility is not arbitrary runtime algorithm selection.

Password pepper derivation, email lookup/encryption separation, and signing subkeys must use distinct labels and purposes. Public JWKS overlap should precede signing activation and outlive the longest accepted credential plus skew. Protected-memory facilities reduce accidental exposure but do not replace process isolation, authorization, or compromise recovery.

TOTP, passkeys, and DBSC have different proof and recovery properties. Account recovery, factor replacement, device loss, and revocation must not silently collapse to the weakest factor. Browser support gaps should produce an explicit supported fallback defined by Accounts, not reinterpret DBSC as a reusable bearer refresh credential.

## New internal hashes

When no external standard or wire protocol mandates an algorithm, prefer BLAKE2 or BLAKE3 for new content identity, deduplication, cache-key derivation, and high-throughput integrity fingerprints. Choose by maintained language support, interoperability, keyed mode, streaming/parallel workload, and digest lifetime.

Version the algorithm and digest length in persisted or wire values. Do not replace protocol-required SHA uses such as JWT/JWK thumbprints, WebAuthn, or HMAC contracts; use Argon2id for passwords; and keep fast checksums such as CRC32C for accidental corruption when cryptographic integrity is not required. This does not require immediate migration of existing values.

Benchmark representative input sizes before choosing BLAKE2 versus BLAKE3 for throughput. Keyed hashing, content identity, integrity, and password verification are separate purposes even when all produce byte strings; keep their types, domains, and migration paths distinct.
