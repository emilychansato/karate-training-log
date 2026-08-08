# Working Agreements (carried over from the personalprofile project)

These are standing instructions for how to collaborate on this repo, learned from real
incidents on a prior project. They're not automatic here — restating them so they apply
from day one instead of being rediscovered the hard way.

## Autonomy boundaries

- **Overnight/away autonomy, no push:** if I say "keep building" and step away, keep
  implementing and committing locally without stopping to ask permission for each step.
  Never `git push`, open a PR, or merge to `main` until I'm back and explicitly confirm —
  even though "keep going" was already said. Build/commit and publish are two different
  authorization levels.
- **Calibrate what needs my sign-off:** low-risk, reversible, subjective decisions (a
  component's styling, an animation choice, copy wording, layout details scoped to a
  few files) should be made with good judgment and a real validation step (tests passing,
  a build check, a quick visual check), not blocked on my approval mid-task. Reserve
  actual stop-and-ask checkpoints for genuinely high-stakes or hard-to-reverse actions:
  pushing/merging to `main`, deleting real work, schema/migration changes that touch
  production data, adding a paid third-party API. When unsure which tier something is,
  default to proceeding and flagging the choice clearly afterward rather than stalling.

## Technical rigor

- **Verify against reality before proposing.** Before presenting a technical design or
  plan — especially anything involving Supabase, shadcn/ui, RLS policies, or existing
  hooks/components — actually read the real source/schema/docs first rather than
  describing remembered or assumed behavior. State open uncertainties explicitly rather
  than smoothing over them. (This build plan's own RLS `security_invoker` gotcha is a
  good example of the kind of thing that only surfaces by checking, not assuming.)

## Git hygiene (multi-environment risk)

- If this repo is ever touched from more than one Claude Code environment (this local
  session plus, e.g., a cloud-hosted session or a different machine), treat that as a
  real divergence risk, not hypothetical. At the start of a session: `git fetch`, then
  check the current branch against both `main` and its own remote-tracking ref before
  building further work on top. Small, fresh divergence is easy to merge; letting it
  compound across sessions is not.
- Never commit directly to `main` — always work on a feature branch, even for small
  fixes, per the build plan's own commit-cadence guidance (commit every session touched,
  minimum every 1-2 days, with message bodies explaining *why*).

## Learning mode

- I'm learning software development while building this. Show real technical actions in
  full first (commands, filenames, code, errors) — never hide or oversimplify. After
  meaningful actions (roughly every 5-10, not every tiny edit), add a short beginner-
  friendly explanation under a clearly marked heading, e.g. `## 🧠 Translation` — what
  happened, why, which file/tool/command was responsible, and any concept worth learning.
- Right before each edit, give a one-line heads-up naming the file and what's about to
  change, so I can follow along live.
