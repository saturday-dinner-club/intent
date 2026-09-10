# Performance and Benchmarks

Status: living reference

Use this reference only when performance is a requirement or material risk, or when feature testing identifies a meaningful measurement opportunity.

## Require meaningful benchmark code

When a stable representative workload and useful metric can be defined for a feature, reproducible benchmark code is **required in the same change**, even without an explicit performance target.

Measurement is commonly meaningful for changed algorithms, parsers, serializers, queries, indexes, caches, queues, codecs, allocation-heavy paths, startup, model execution, or hot requests; when input size or concurrency can vary; when before/after results inform a decision; or when controlled runs can detect regression.

Do not benchmark only to produce a number when uncontrolled networks, hosted-model changes, third-party limits, machine noise, or setup dominate. State why measurement is not credible instead of presenting false precision.

Choose a metric with a decision behind it: latency distribution for an interactive path, throughput for a saturated worker, allocations for a hot library function, startup/readiness time for elastic capacity, memory or storage amplification for bounded resources, or quality-versus-cost for codecs and models. An average without errors, tail behavior, and workload shape often hides the risk.

## Make the workload reproducible

Benchmark code should:

- live in the repository and have a discoverable command;
- generate or load representative versioned input;
- exclude setup and warm-up from the measured region;
- measure the metric tied to the feature risk;
- vary meaningful sizes, distributions, or concurrency;
- prevent compiler or runtime elimination;
- report errors with latency, throughput, allocations, startup time, or resource use;
- document workload and environment assumptions.

For Go, prefer `testing.B`, named sub-benchmarks, `b.ReportAllocs`, correct timer control, and `go test -bench ... -benchmem`. In other languages, use the smallest maintained harness or focused repeatable workload driver.

Use sub-benchmarks for meaningful sizes and modes rather than unrelated loops in one number. Validate outputs so the benchmark cannot become fast by skipping work. Control randomness with recorded seeds and avoid reading large fixtures or starting dependencies inside the timed region unless that startup is the behavior being measured.

## Match evidence to the boundary

Distinguish component microbenchmarks, local integration benchmarks, end-to-end workloads through the user interface, and capacity, soak, or production-like tests. One does not prove another.

When results drive a decision, record code revision, dependencies, hardware or topology, dataset shape, concurrency, warm-up, repetitions, errors, and relevant distributions. Preserve comparable raw output when useful.

Avoid hard pass/fail thresholds on noisy shared machines. Gates are justified only when the environment and variance are controlled and the threshold represents a real requirement. Otherwise compare statistically with a relevant baseline and report uncertainty.

Compare like with like. Pin power mode and concurrency where practical, warm caches deliberately, record whether CPU frequency, GC, network locality, storage state, or background services changed, and repeat enough to separate signal from variance. A local microbenchmark supports optimization of that component, not an end-to-end capacity claim.

Paid, scarce, destructive, hardware-bound, or externally rate-limited benchmarks must be separate, bounded, and enabled only by a deliberately supplied environment. Missing prerequisites leave the measurement unverified; they do not justify silently substituting a mock result.
