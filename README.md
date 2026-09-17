# Intent

This repository records reusable, risk-proportional guidance rather than the architecture, status, or operating procedures of any particular product, service, or repository. The references are decision aids, not cumulative checklists. The latest explicit user decision and the current system's documented invariants take precedence.

- [`docs/engineering-intent.md`](docs/engineering-intent.md) indexes guidance for designing, implementing, and verifying software changes. Its agent entrypoint is [`skills/engineering-intent/SKILL.md`](skills/engineering-intent/SKILL.md).
- [`docs/operational-intent.md`](docs/operational-intent.md) indexes guidance for investigating, reviewing, supporting, and responding to existing behavior. Its agent entrypoint is [`skills/operational-intent/SKILL.md`](skills/operational-intent/SKILL.md).

Concrete product contracts, dependency versions, ports, schemas, deployment values, incident severities, support commitments, escalation paths, and implementation status remain in their owning repositories. Cross-project preferences are defaults, not mandates.

## Install with GitHub CLI

Use the built-in `gh skill` command to preview and install either or both skills for Codex at user scope:

```console
gh auth status
gh skill preview saturday-dinner-club/intent engineering-intent
gh skill preview saturday-dinner-club/intent operational-intent
gh skill install saturday-dinner-club/intent skills/engineering-intent --agent codex --scope user
gh skill install saturday-dinner-club/intent skills/operational-intent --agent codex --scope user
gh skill list
```

If `gh auth status` reports that no account is authenticated, run `gh auth login` first. Start a new Codex task after installation so the skill is discovered.

Update installed skills from this repository with:

```console
gh skill update engineering-intent
gh skill update operational-intent
```

## Landing page

The English landing page lives at `/`, with a Korean version at `/ko/`. It is a static Vite site in [`web/`](web/) using `merak-protocol-design-system`.

```console
cd web
npm install
npm run dev
npm run build
```

Cloudflare Pages settings: root directory `web`, build command `npm run build`, output directory `dist`. Publishing and domain setup are separate from this repository.
