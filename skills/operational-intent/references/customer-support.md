# Customer Support

Status: living reference

Customer support aims to move the requestor toward a safe, truthful, and usable outcome while turning genuinely reusable experience into better product knowledge. Ticket closure, message count, and diagnostic volume are not substitutes for customer progress.

## Understand the requestor's situation

Capture the request in the requestor's language, then identify the desired outcome, expected and actual behavior, business or user impact, environment and version where relevant, time window, and safe correlation identifiers. Ask only questions that can change the next action, and group related questions so the requestor does not have to reconstruct the same context repeatedly.

Distinguish a technical case, a product request, a service incident, an account or relationship concern, and a question whose answer already exists. Route to the owner of the actual need rather than forcing every concern through technical debugging.

Treat customer-provided claims as important evidence without presenting an unverified mechanism as fact. Preserve uncertainty internally and externally. Do not ask for passwords, tokens, private keys, full data exports, or unrestricted access when a bounded, redacted artifact is sufficient. Follow the owning organization's identity, consent, access, retention, and disclosure rules.

## Reuse knowledge while solving

Search maintained product documentation, known issues, resolved cases, and current operational status early enough to avoid rediscovery. Use the requestor's terminology first, then refine the search with system terms. Confirm that an existing answer matches the customer's version, environment, symptoms, and constraints before applying it.

Improve an existing maintained source when use reveals a broadly useful gap. Create new durable knowledge when the answer does not exist and future reuse is plausible. A one-off conversation, internal implementation detail, or uncertain workaround need not become a published article.

Keep exact product contracts in their authoritative source. Support notes may explain how a customer recognizes and resolves a condition, but should not become a second source of truth for configuration, compatibility, or security behavior.

## Offer the smallest safe next action

Prefer a resolution or workaround that is scoped, reversible when practical, and clear about its effects. Distinguish workaround, mitigation, correction, and planned product change. Do not trade away data integrity, security, or future recoverability without an explicit owning decision.

When asking the customer to run a diagnostic or action, explain what it will reveal or change, provide safe placeholders, avoid collecting unnecessary output, and say how to stop or undo a material action. Verify the result using the customer's experienced boundary instead of assuming a successful command resolved their goal.

Diagnosis does not authorize modifying the product, customer environment, ticket, or external status. Drafting a response does not authorize sending it. Use the available authority and obtain the missing decision through the owning workflow.

## Communicate for progress

Lead with the current status and the next usable action. Separate what is confirmed, what is suspected, what has been tried, and what is still needed. Use customer-facing language rather than internal organizational detail, avoid blame, and do not promise a cause, fix, date, or service level that the responsible owner has not committed.

If progress is blocked, say what is blocking it, who owns the next step, and what the customer can safely do meanwhile. A substantive update can be brief; repeated messages without new information do not create progress. Match update cadence and channel to the actual impact and local commitment.

## Escalate with enough context

An escalation should let the next owner act without forcing the customer to repeat the investigation. Select the useful items:

- desired outcome and customer impact;
- expected and actual behavior;
- environment, version, timing, and safe identifiers;
- reproduction or frequency;
- material evidence and where it came from;
- actions already tried and their exact results;
- current workaround and its limits;
- confirmed facts, hypotheses, and unknowns;
- requested decision or expertise and current customer commitment.

Do not fill every field when a smaller handoff is sufficient. Escalate early when impact, authorization, domain ownership, security, data integrity, or communication commitments exceed the current responder's scope.

## Close the loop

Close when the requested outcome is achieved, the customer accepts a documented limitation or workaround, or the case is transferred with clear ownership under the local process. Silence alone is not technical proof of resolution.

Record the final customer-visible outcome, material evidence, remaining limitation, and linked product or documentation issue when they support future use. Feed recurring or high-impact patterns back to the appropriate product, documentation, or operational owner; do not convert every closed case into a universal rule.
