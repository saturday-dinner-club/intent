# Saturday Dinner Club Intent

This repository records the engineering intent shared by the Saturday Dinner Club quanta. It is not an API specification and does not replace each repository's architecture documents. Its purpose is to preserve the reasoning, defaults, and working rules that should survive across implementations and future sessions.

Start with [`docs/engineering-intent.md`](docs/engineering-intent.md). It contains:

- the hierarchy used when requirements conflict;
- system-wide architecture and reliability principles;
- durable and best-effort messaging boundaries;
- implementation, observability, testing, deployment, and Git conventions;
- current Stream, Chat, Accounts, Channel, and Log decisions;
- a re-entry checklist for maintainers and coding agents.

When a quantum intentionally diverges, record the exception in that quantum first and then update this repository if the decision is reusable. The latest explicit product decision takes precedence over this document.
