# Future Ideas (not scoped, not scheduled)

Ideas captured for later — not part of the current build-plan.md timeline. Revisit after MVP (weeks 1-3) and after evaluating against real usage.

## Kata video comparison + AI feedback

Record your own kata on camera, then compare it side-by-side against a reference video —
either a pasted YouTube link or a video you upload yourself — of the same kata. AI assists by
analyzing the two side by side and giving feedback: timing differences, stance/technique gaps,
areas where your performance diverges from the reference.

Rough shape (unscoped, needs real design later):
- Video capture/upload in-browser (or mobile camera).
- A reference video source — either a YouTube embed or an uploaded file.
- Side-by-side playback, probably synced.
- AI analysis layer — likely computer vision / pose estimation (not just an LLM reading text,
  since this is comparing physical movement), which is a meaningfully different and heavier
  build than the OpenAI text-insight stretch feature in build-plan.md Section 4.
- Related prior art found during GitHub research: aud10pilot/kata-analysis (Python/Flask +
  MediaPipe pose-detection on kata video) — different stack than this app (React/TS), but
  worth a look for how pose-comparison is approached if this gets built out.

Not scoped for effort, storage cost (video is expensive to store/serve), or which AI/CV
approach to use. Bigger lift than anything currently in build-plan.md — treat as a distinct
future project phase, not a stretch pick to slot into Week 4.
