# Incidents and Live Operations

Status: living reference

An incident is active impact or credible imminent harm that benefits from coordinated response. Not every production defect, alert, customer report, or failed command is an incident. Scale the response from observed impact, affected scope, data or security risk, duration, rate of change, recovery uncertainty, and coordination needs.

## Prioritize the operational outcome

During active material impact, stop additional harm, restore the safest useful service level, and preserve evidence needed for later understanding. Root cause can wait when investigation competes with containment or recovery. Do not let a plausible causal story delay a known safe mitigation.

Use the owning system's severity definitions, runbooks, service objectives, communication commitments, and decision authority. This general guidance must not invent local thresholds or override a practiced response. If the situation is smaller than the formal process, keep coordination lightweight while retaining a clear owner and next checkpoint.

## Scale roles with complexity

Treat roles as functions rather than titles or seniority:

| Role | Primary responsibility |
| --- | --- |
| Lead | Own current objectives, priorities, coordination, and handoffs. |
| Resolver | Investigate and perform approved mitigation or recovery work. |
| Recorder | Preserve material state, actions, decisions, results, and timing. |
| Liaison | Keep customers or internal stakeholders accurately informed. |

One person may hold several roles in a small response. Separate them when concurrent investigation, communication, coordination, or duration begins to overload one person. The lead should keep the response moving rather than becoming the deepest technical investigator. Maintain one visible current owner; transfer ownership explicitly with current condition, actions in flight, open risks, and the next decision.

Use concise responder updates such as condition, actions, and needs when they reduce interruption. Bring in requested expertise through the lead or owning escalation path. Uncoordinated helpers, duplicate experiments, and conflicting changes can increase impact.

## Control live actions

Before a material live mutation, resolve:

- the exact target and current state;
- the expected customer or system effect;
- the affected and maximum plausible blast radius;
- the observation that will show improvement or harm;
- the stopping condition and next checkpoint;
- the rollback, recovery, or containment path;
- the person or authority responsible for the decision.

Prefer known, reversible, bounded actions. Change one discriminating variable at a time when practical, but do not delay urgent containment for an ideal experiment. If the target, authority, or recovery path is materially uncertain, pause that action and escalate rather than improvising a broader mutation.

Project-specific flight rules can pre-agree go, stop, degrade, rollback, and escalation decisions for recurring high-pressure situations. Keep those rules with the system that owns the risk and test them through appropriate exercises. Do not turn generic examples into universal production commands.

## Maintain useful state and communication

Keep a lightweight current record that supports coordination and later reconstruction. Capture significant observations, changes, decisions, owners, and outcomes with timestamps when ordering matters. Do not transcribe every message or flood the response channel with raw diagnostics; link or summarize evidence so responders can find the authority.

Status communication should state observed impact, current condition, what responders are doing, safe user action if any, and the next update when a cadence is warranted. Do not publish a suspected cause as fact, expose sensitive operational detail, or promise recovery timing without an owned basis. External communication requires the appropriate approval even when the technical facts are known.

Use an out-of-band communication or access path when the affected system also hosts the normal response tools and the owning organization provides one.

## Recover deliberately

Define recovery from user-visible and authoritative system behavior, not merely the disappearance of an alert. Confirm that new work is healthy, accepted work is progressing or reconciled, data and security invariants hold, temporary degradation is understood, and the system remains stable for a proportionate observation window.

Track emergency changes, disabled protections, manual data repairs, temporary capacity, and deferred work that must be reverted or completed. Incident resolution and cleanup completion may be separate milestones, but each needs an owner when the remainder presents material risk.

## Learn without forcing ceremony

Use a debrief when the event's impact, surprise, coordination difficulty, recovery cost, or reusable lesson justifies it or local policy requires it. Reconstruct why actions made sense with the information available at the time. Seek multiple relevant perspectives, contributing conditions, and system defenses instead of stopping at individual error or forcing a single root cause.

Corrective actions should address supported mechanisms and have an owner appropriate to their value. A long action list is not learning. Promote repeated or transferable lessons into runbooks, readiness questions, automation, product changes, or shared guidance; leave one-off details in the incident record.

Game days, fault injection, and chaos experiments are explicit operational changes, not ordinary diagnostic steps. Use them only within requested and authorized scope, with a measurable normal state, a falsifiable hypothesis, bounded blast radius, abort conditions, monitoring, recovery, and cleanup. A production experiment requires the owning system's specific authorization.
