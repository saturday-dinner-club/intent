# Debugging and Investigation

Status: living reference

Use debugging to reduce uncertainty until the requested explanation, decision, or recovery action is supported. The goal is not to perform every diagnostic technique or produce a complete theory of the system.

## Frame the actual problem

Start from expected behavior, observed behavior, affected users or components, impact, time window, environment, and the smallest known reproduction. Preserve the reporter's wording while translating it into testable system behavior. A report is evidence of experience, not yet proof of a mechanism.

Clarify only facts that change the next useful check. Do not make the reporter supply an exhaustive environment inventory before investigating an obvious local path. Never request secrets, full credential material, or broad sensitive data when a safe identifier or bounded excerpt is enough.

Learn how the relevant path is supposed to work from the owning repository, runtime configuration, contracts, tests, and operational documents. Build a local model of the path under investigation; do not redesign the whole system merely to explain one symptom.

## Investigate by discrimination

Keep observations, inferences, hypotheses, and unknowns distinct when reporting or acting on them. A useful hypothesis explains the observed facts and predicts evidence that could support or weaken it.

Choose checks for information value, safety, and cost. A good next check separates multiple plausible explanations; a large log dump that confirms none of them does not. Useful techniques include tracing one request or entity across boundaries, comparing a known-good and failing case, simplifying inputs, bisecting a pipeline, checking recent changes without anchoring on them, and inspecting state before and after a transition.

Reproduce when it materially improves confidence or creates a safe place for invasive inspection. An exact reproduction is not mandatory when production evidence, a deterministic code path, or a focused test already answers the question. State when a conclusion depends on an unverified reproduction assumption.

Do not chase every anomaly found along the way. Connect evidence to the reported behavior or label it as a separate observation. Past incidents can suggest a hypothesis but do not make recurrence the default explanation.

## Use tools and signals deliberately

Inspect the cheapest authoritative source first: the reported request or artifact, relevant code and configuration, focused tests, then runtime signals needed to resolve remaining uncertainty. Authority depends on the question; a log can show that a process emitted a message but not that an external side effect completed unless that is the log's verified contract.

Add temporary instrumentation only when existing evidence cannot answer a material question and the requested scope permits a change. Bound sensitive data, volume, cardinality, and cleanup. Remove diagnostic changes or clearly identify them before handoff.

When a command or query may mutate state, treat it as an action rather than observation. Resolve the target, predict the expected result, identify an abort condition, and capture the before/after evidence needed to interpret the outcome.

## Separate mitigation, diagnosis, and correction

During material active impact, first prevent additional harm and restore the safest available service level while preserving useful evidence. A reversible mitigation or known workaround may be appropriate before root cause is known. Do not present mitigation as correction or the disappearance of symptoms as proof of cause.

Name the level of explanation actually supported:

- a symptom describes what was experienced;
- a proximate cause explains the immediate mechanism;
- contributing conditions explain why the mechanism was possible or hard to detect;
- a root-cause claim asserts a deeper prevention boundary and therefore needs stronger evidence.

Do not force a single root cause for a complex interaction. Do not extend a diagnosis request into implementation, rollout, or postmortem work unless the user asks or active safety requires a narrower immediate action.

## Finish at the claimed boundary

Verify a recovery or fix from the boundary that experienced the failure when possible. A passing unit test may support a code-path diagnosis but cannot prove a live dependency recovered. Conversely, a recovered service does not prove the suspected code path was the cause.

On completion, state the reproduced or observed behavior, decisive evidence, conclusion and confidence, mitigation or changes actually performed, verification, and any uncertainty that affects use or the next decision. Omit categories that add no value to a routine result.
