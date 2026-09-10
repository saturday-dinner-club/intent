# Code Style

Status: living reference

Use this reference for source-level readability. Repository conventions and the language's formatter take precedence over these defaults when they remain coherent and safe.

## Prefer visible, ordinary code

Source is part of the maintained explanation of the system. Keep responsibility, control flow, state transitions, errors, lifecycle, and cleanup easy to follow. Do not compress meaningful behavior into clever expressions merely to reduce line count.

Make the smallest style change that supports the requested work. Avoid unrelated renaming, formatting churn, or comment rewrites in a focused feature or fix.

Keep local structure aligned with ownership. Separate parsing, validation, domain decisions, persistence, and transport adaptation when their failure semantics differ, but do not create layers that only forward arguments. Prefer early returns for rejected preconditions when they clarify the main path. Keep resource acquisition near its cleanup owner and make cancellation or error propagation visible rather than hiding it in convenience helpers.

## Use familiar and precise names

Prefer common words from the language, standard library, repository, and problem domain when they express the behavior accurately. Familiar verbs often include:

- `Get`, `List`, `Find`, and `Search` for distinct reads;
- `Create`, `Add`, `Append`, `Update`, `Replace`, and `Delete` for distinct mutations;
- `Load`, `Save`, `Open`, and `Close` for resources;
- `Start`, `Stop`, `Drain`, `Resume`, and `Shutdown` for lifecycle;
- `Parse`, `Validate`, `Encode`, `Decode`, and `Convert` for transformations.

A name should express one responsibility, reuse established vocabulary, and distinguish operations with different contracts. Prefer an exact domain term over a common but misleading word. Avoid unexplained abbreviations, invented synonyms, and vague names such as `Do`, `Manage`, or `ProcessData` when a precise name exists.

Use scope to control length: a local variable may be short when obvious, while a public symbol should remain recognizable without nearby implementation. Treat public renaming as compatibility work, not private cleanup.

Use paired vocabulary consistently: `Start` versus `Ready`, `Stop` versus `Drain`, `Create` versus `Replace`, `Event` versus `Notification`, and `Delete` versus `Purge` should not collapse when the underlying milestones differ. Boolean names should reveal the true predicate rather than require the reader to mentally negate an ambiguous flag.

## Comment intent and constraints

Add concise orientation where it changes understanding:

- exported APIs when the language or repository expects documentation;
- the purpose or phases of a substantial component or workflow;
- non-obvious algorithms, ordering rules, bounds, and workarounds;
- concurrency, durability, ownership, security, compatibility, or lifecycle invariants;
- behavior that looks removable but preserves an external contract;
- temporary behavior with an owner or removal condition.

Explain why, the governing constraint, or the consequence. Do not narrate syntax, repeat a clear name, preserve commented-out code, or add prose to meet an artificial density. Keep lengthy contracts, architecture, operations, and decision history in their owning documents.

Update or remove comments with the behavior. A stale comment is a false contract.

Comments are not a substitute for expressive types and APIs. Prefer a type, enum, unit-bearing field, or stable error that makes misuse difficult; use the comment to explain the remaining invariant or reason. Generated code, copied upstream code, and protocol declarations follow their owning source and should not receive hand-edited explanatory drift.

## Local review

Before finishing code work, check that changed names express the actual contract, non-obvious constraints are locally visible, comments still match behavior, and the repository formatter and established idioms are satisfied.
