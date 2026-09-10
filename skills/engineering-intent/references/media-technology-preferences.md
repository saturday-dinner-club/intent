# Media Technology Preferences

Status: living reference

These preferences apply to Stream-family work, not general backend services.

## FFmpeg execution, Go orchestration

Use FFmpeg child processes for codec and hardware acceleration. Let Go own admission, assignment, framing, queues, retries, process lifecycle, metrics, and recovery. This keeps NVENC, Intel QSV, Apple VideoToolbox, and codec evolution behind one testable execution boundary. Separate rendition processes when one stalled output must not block all others.

Current defaults are AV1-first video, AAC-LC audio, CMAF/fMP4 LL-HLS, 200 ms parts, and one-second segments. H.264 remains an ingress and compatibility extension. Probe real decode, scale, encode, and device capability at startup; an advertised backend is not execution evidence. CPU fallback is an explicitly limited emergency rendition, not a promise of real-time full quality.

Treat codec, container, segment timing, rendition identity, and hardware backend as explicit compatibility and capacity inputs. Measure queueing, real-time factor, dropped work, startup latency, and output validity on representative media. Bound FFmpeg stderr, child lifetime, input size/duration, and restart behavior; one child failure should not leak resources or corrupt already finalized output.

## Browser playback

Prefer Shaka Player for current LL-HLS, VoD, and DVR requirements because Stream Lab observed stronger DVR continuity, live-edge tracking, and LL-HLS behavior than hls.js. Keep it behind a framework-independent TypeScript core with thin Svelte or React lifecycle adapters.

Source replacement, destruction, asynchronous teardown, autoplay, codec support, and target browser/device behavior are part of the wrapper contract. This preference is specific to the current AV1/AAC HLS evidence, not a universal media conclusion.

Validate live-edge movement, discontinuities, DVR seeks, rendition changes, source replacement, and cleanup in real browsers. A manifest parser test or successful `load()` call does not establish continuous playback or perceptual quality.
