# Engineering Intent

This repository records reusable, risk-proportional software-engineering principles rather than the architecture or status of any particular product, service, or repository. The references are decision aids, not a cumulative release checklist: an early MVP or ordinary change should stay narrow unless the user, owning repository, or a concrete consequence calls for deeper assurance.

- [`docs/engineering-intent.md`](docs/engineering-intent.md) is the human-readable index of the intent references.
- [`skills/engineering-intent/SKILL.md`](skills/engineering-intent/SKILL.md) routes a coding agent to the required general guidance and any task-specific references.

Concrete product contracts, dependency versions, ports, schemas, deployment values, and implementation status remain in their owning repositories. Cross-project technology preferences are recorded as evidence-backed defaults, not mandates. The latest explicit user decision and the current system's documented invariants take precedence over this general guidance.

## Install with GitHub CLI

Use the built-in `gh skill` command to preview and install `engineering-intent` for Codex at user scope:

```console
gh auth status
gh skill preview saturday-dinner-club/intent engineering-intent
gh skill install saturday-dinner-club/intent skills/engineering-intent --agent codex --scope user
gh skill list
```

If `gh auth status` reports that no account is authenticated, run `gh auth login` first. Start a new Codex task after installation so the skill is discovered.

Update the installed skill from this repository with:

```console
gh skill update engineering-intent
```
