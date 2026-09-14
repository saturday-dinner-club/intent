---
name: operational-intent
description: Apply evidence-driven, risk-proportional judgment to debugging, technical reviews, customer-support investigations, incident triage, and operational handoffs. Use when the task is primarily to understand, assess, respond to, or communicate about existing behavior. Do not use as a universal operations checklist or as the primary guide for designing and implementing a change.
---
# Operational Intent

Help the user reach a sound operational outcome with the least evidence and ceremony that the consequence requires. Preserve the latest explicit user decision, the owning system's contracts, and its local support or incident procedures over these defaults.

## Calibrate the response

Choose depth from actual or plausible impact, reversibility, urgency, coordination cost, and uncertainty.

- A routine question, local defect, or focused review usually needs a narrow investigation and concise result.
- A consequential case may need a durable record, explicit uncertainty, owner handoff, or broader verification.
- A live incident or risky operation may require separated roles, impact-first mitigation, controlled changes, a timeline, and recovery criteria.

Do not infer an incident, root-cause analysis, postmortem, customer communication, or knowledge article merely from the words production, customer, alert, outage, or security. A nearby operational concern may need one decision, not an entire response process.

## Use an evidence loop

Treat this as a flexible loop, not a required sequence or output template:

1. Frame the requested outcome, expected and actual behavior, affected boundary, impact, and relevant time window.
2. Distinguish reports and direct observations from inferences, hypotheses, and unknowns when the difference affects a decision.
3. Build only enough of the system model to choose the next check. Prefer the cheapest safe evidence that most clearly distinguishes plausible explanations.
4. Before a material mutation, name its expected signal, scope, stopping condition, and rollback or recovery path. Stay within the authority granted by the user and the owning system.
5. Verify the outcome at the boundary that experienced the problem, then stop when the requested decision or result is supported.

Do not collect every available log, test every theory, or keep investigating after additional evidence cannot change the requested outcome. Do not confuse activity volume with confidence.

## Route to relevant guidance

Read a reference completely only when the task needs that operating mode. Do not load adjacent references because a case could hypothetically escalate into them.

- [Debugging and investigation](references/debugging-and-investigation.md): diagnosing unexpected behavior, reproducing a problem, testing hypotheses, determining cause, or proposing diagnostic actions.
- [Technical review](references/technical-review.md): reviewing a change, diff, implementation, test, or technical artifact for actionable findings.
- [Customer support](references/customer-support.md): investigating or responding to a customer or user request, providing a workaround, escalating a case, or turning support experience into reusable knowledge.
- [Incidents and live operations](references/incidents-and-live-operations.md): active impact, production intervention, coordinated response, recovery, status communication, debriefing, game days, or other live operational action.

When a task crosses modes, use only the references needed for the current work. If investigation leads to a requested code or system change, follow the owning repository's engineering guidance for that implementation and return to the operational outcome afterward.

## Preserve authority boundaries

A request to diagnose, review, or explain does not by itself authorize edits, deployment, restarts, data changes, state repair, ticket mutation, customer contact, or public communication. Drafting a message and sending it are separate actions. Access to a system does not imply authority to expose, alter, or broaden use of its data.

Prefer read-only evidence until a mutation is necessary for the requested outcome. For external or difficult-to-reverse action, resolve the exact target and current state, use the narrowest effective change, and stop when the expected checkpoint fails or the risk changes materially.

## Close and hand off honestly

Report the current condition, material evidence and actions, supported conclusion, remaining uncertainty, and next owner or action when those facts help the user continue. Separate mitigated, diagnosed, corrected, verified, and communicated; they are different milestones.

Use the smallest useful record. A brief answer may be enough for a routine case. A complex handoff may need impact, timeline, attempted actions and results, current owner, blockers, and the next decision. Do not create a formal artifact solely to show compliance with this skill.

## Let experience improve the guidance

Search and reuse existing knowledge before creating another account of the same issue. Improve a maintained source at the point of use when the new context is broadly useful. Promote an incident lesson into shared guidance only when it is reusable beyond the original event, and keep its scope visible.

Do not turn every case into a document or every failure into a universal rule. Repeated use, recurring confusion, material impact, or a costly rediscovery is stronger evidence for durable guidance than the mere existence of one case.
