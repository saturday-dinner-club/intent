# Operational Intent

Operational Intent guides work whose primary purpose is to understand, assess, respond to, or communicate about existing behavior. It covers debugging, technical review, customer-support investigation, incidents, and live operations without turning every case into a full incident process or postmortem.

This page is the human-readable index. The agent-facing source uses progressive references so a task loads only the guidance that changes its decisions.

## Boundary

Engineering guidance governs how a requested system or code change is designed, implemented, and verified. Operational guidance governs how a current report, change, failure, or customer need is investigated, judged, handled, and handed off.

A task may cross that boundary. For example, a support case may lead to a diagnosis, an authorized engineering change, and then customer-facing confirmation. Crossing the boundary does not imply permission for the next action: diagnosis does not authorize a fix, and drafting a response does not authorize sending it.

## Operational domains

- [Debugging and investigation](../skills/operational-intent/references/debugging-and-investigation.md): problem framing, evidence, hypotheses, discriminating checks, reproduction, mitigation, live-system experiments, root cause, and honest closure.
- [Technical review](../skills/operational-intent/references/technical-review.md): review scope, finding thresholds, consequence-based priority, evidence, author intent, focused verification, and review reporting.
- [Customer support](../skills/operational-intent/references/customer-support.md): requester context, safe diagnostics, useful communication, workarounds, escalation packets, case closure, and demand-driven knowledge reuse.
- [Incidents and live operations](../skills/operational-intent/references/incidents-and-live-operations.md): impact calibration, response roles, mitigation, controlled action, status communication, recovery, debriefing, and operational experiments.

These references are menus of relevant judgment, not required phases or output sections. Small, reversible work should remain small.

## Influences

The guidance is original and locally maintained, but its operating model draws on several established practices:

- [Google SRE effective troubleshooting](https://sre.google/sre-book/effective-troubleshooting/): hypothesis-driven investigation and impact-first triage.
- [Google's code review standard](https://google.github.io/eng-practices/review/reviewer/standard.html): improvement over perfection and evidence over preference.
- [Knowledge-Centered Service](https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/041): reuse, improvement, and capture of knowledge in the support workflow.
- [PagerDuty incident roles](https://response.pagerduty.com/before/different_roles/) and [FEMA incident command characteristics](https://emilms.fema.gov/_is0700b/groups/330.html): scalable separation of command, resolution, recording, and communication.
- [GitLab incident management](https://handbook.gitlab.com/handbook/engineering/infrastructure-platforms/incident-management/): living operational guidance and role scaling by severity.
- [Etsy's debriefing facilitation guide](https://www.etsy.com/codeascraft/debriefing-facilitation-guide): learning from multiple perspectives without premature blame or a single causal story.
- [AWS Operational Readiness Reviews](https://docs.aws.amazon.com/wellarchitected/latest/operational-readiness-reviews/wa-operational-readiness-reviews.html): feeding scoped incident lessons back into future readiness questions.
- [NASA mission rules](https://www.nasa.gov/wp-content/uploads/static/history/afj/ap12fj/pdf/a12_sa507-flightmanual.pdf): pre-agreed boundaries for rapid decisions under pressure.
- [Principles of Chaos Engineering](https://principlesofchaos.org/) and [Toyota's Jidoka](https://global.toyota/en/company/vision-and-philosophy/production-system/): bounded experiments, observable normal behavior, and authority to stop on abnormality.

These sources are influences, not imported procedures. Organization-specific severities, roles, service levels, tools, and runbooks remain locally owned.
