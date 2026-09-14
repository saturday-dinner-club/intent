# Technical Review

Status: living reference

A review should help the owner make a sound decision about the artifact in scope. Prefer a small number of supported, actionable findings over a broad inventory of hypothetical concerns. Review is not a search for perfection.

## Establish the review contract

Identify what is being reviewed, the intended behavior or decision, the relevant baseline, and whether the user wants defects, risks, design feedback, readiness assessment, or another specific outcome. Inspect the actual diff or artifact plus enough surrounding context to understand its behavior; summaries and filenames alone are not evidence.

Follow the repository's documented contracts and conventions. Do not impose a preferred architecture, style, or process where the current choice is valid. Review the requested change rather than silently auditing the entire codebase. Mention pre-existing issues separately only when they materially affect the change or present an immediate serious risk.

A review request is read-only unless the user also asks for edits. Focused commands and tests may provide evidence when they are safe and relevant, but do not turn every review into a full verification campaign.

## Apply a finding threshold

Before reporting an issue, be able to explain:

- where the issue exists;
- which behavior or contract is affected;
- the realistic condition that triggers it;
- the consequence if it occurs;
- the evidence that supports the claim.

If an important uncertainty cannot yet meet that threshold, ask a focused question or label it as an unverified risk rather than presenting it as a defect. Avoid findings based only on speculative scale, imagined consumers, unavailable infrastructure, or a stylistic alternative.

Rank findings by consequence and likelihood using the repository's or user's severity convention when one exists. Distinguish blocking defects from non-blocking improvements, questions, and minor polish. An educational comment can be useful without becoming a condition of acceptance.

## Review the material behavior

Select the dimensions that can change the outcome. Depending on the artifact, these may include requested functionality, state and data integrity, interface compatibility, authorization and sensitive data, failure and recovery behavior, concurrency, resource use, lifecycle, tests, or maintained documentation. This is a menu, not a requirement to cover every category.

Trace important inputs through their actual execution path and inspect relevant error paths, not just the happy-path shape. Check tests for the behavior they prove and the boundary they omit. Run the smallest useful check when static inspection cannot settle a material claim; broaden only when the change or repository requires it.

Respect author intent when multiple approaches are sound. Technical facts and local contracts outweigh personal preference. A change that clearly improves the system need not be delayed for unrelated cleanup or an idealized redesign.

## Report for action

Lead with findings, ordered by importance. Keep each finding independently understandable and attach it to the narrowest useful location when possible. State the consequence and trigger before offering a fix; the owner may know a better remedy.

If no actionable findings remain, say so directly. Then mention only meaningful residual uncertainty, such as an unavailable environment or untested external dependency. Do not manufacture a finding to make the review appear substantive, and do not claim broad correctness beyond the evidence inspected.

Summaries and positive observations are secondary to findings unless the user asks for a different review format. Record a resolved disagreement or external decision where future readers need it, but do not prolong review when the appropriate owner has made a valid decision.
