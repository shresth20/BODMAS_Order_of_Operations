---
description: Replace the module's AI narration with ElevenLabs-generated audio (Mitali – Kids Mythology Storyteller)
argument-hint: "[--dry-run | --screen s3_ | --only cue1,cue2 | --restore .backup-<stamp>]"
allowed-tools: Bash, Read, Edit, Glob, Grep
---

# Replace module narration with an ElevenLabs voice

Run the VO regeneration tooling in `tools/vo/` to re-record every narration clip
in the configured ElevenLabs voice. Extra arguments from the user: `$ARGUMENTS`

Read `tools/vo/README.md` before starting if you have not already.

## Non-negotiable rules

1. **Never edit game code.** Do not modify anything under `js/`, `css/`,
   `index.html`, `locales/`, or `game.config.json`. The voice swap is an asset
   swap; if you find yourself wanting to change `js/content/voiceovers.js`, stop
   and report why instead.
2. **Never edit `VO-narration.md` to make generation succeed.** It is the
   pedagogical cue sheet governed by `VO-guideline.md`. Text problems get fixed
   in `tools/vo/overrides.json`. Changing the cue sheet is a content decision
   that needs the user's explicit approval.
3. **Never print, echo, log, or commit an API key.** If you need to check
   whether one is set, test for presence only — never display the value.
4. **Never run `git commit` or `git push`** unless the user explicitly asks.
5. **Never report success on a partial run.** A run where some cues failed
   leaves the module speaking in two different voices. Say so plainly.

## Procedure

### 1 — Preflight

Run these and report the results as a short table:

```bash
node --version
node tools/vo/verify.js
git status --short
```

Check and report:
- Node is 18 or newer (`fetch` is required).
- `tools/vo/.env.local` exists — check **presence only**, never contents.
- `verify.js` passes against the current audio. Record the current payload size,
  total narration length, and longest clip; this is the "before" baseline you
  will compare against at the end.
- The working tree is clean, or the user knows what is already modified. A dirty
  tree makes the ~161-file diff hard to review and rollback harder.

If `.env.local` is missing, stop and tell the user to follow the one-time setup
in `tools/vo/README.md`. Do not attempt to create credentials yourself.

### 2 — Dry run

```bash
node tools/vo/generate.js --dry-run
```

This makes no API calls and costs nothing. Report the cue count, the character
total, and any cue whose spoken text looks wrong. Confirm the cue count matches
the file count from step 1.

If it fails on an unresolved `[placeholder]`, add a rewrite under `cueText` in
`tools/vo/overrides.json` that keeps the line's meaning while removing the
bracket — and show the user the exact wording you chose. Do not invent
information the screen does not display (`VO-guideline.md` §7).

### 3 — Confirm before spending

Report to the user before generating:
- how many clips will be replaced,
- the character count (this is what ElevenLabs bills),
- the voice ID that will be used, from `.env.local` (the ID is not a secret; the
  key is),
- where the rollback backup will be written.

**Wait for the user to approve.** This spends their credits and rewrites ~161
committed binary files.

### 4 — Generate

```bash
node tools/vo/generate.js
```

Let it run to completion — it retries 429s and 5xx with backoff on its own. Do
not re-run it in a loop or reduce the cue set to make it pass.

If it fails, the tool has already refused to swap anything in. Diagnose from the
error text it printed:

| Symptom | Cause | Fix |
|---|---|---|
| `HTTP 401` | Bad or missing key | User re-checks `.env.local` |
| `HTTP 404` on the voice | Voice not added to the account | User adds it from the Voice Library |
| `HTTP 429` after retries | Plan concurrency limit | Re-run with `--concurrency 1` |
| `quota` / `402` in the body | Out of credits | Stop; report to the user |
| `exceeds the 20s hard limit` | Storyteller read runs long | See below |

For a clip over the 20 s limit, present the user with the options rather than
picking one silently: add a tighter `cueText` override, add
`"speed": 1.05`–`1.1` to `voiceSettings`, or shorten the line in
`VO-narration.md` (their call, per rule 2). Then re-run — cached clips in
`.out/` are reused, so only the failures cost anything.

### 5 — Verify and report

```bash
node tools/vo/verify.js --list
git status --short | measure
```

Report:
- pass/fail, plus any warnings,
- **before vs after**: payload size, total narration duration, longest clip.
  A storyteller voice usually runs longer — call out the delta explicitly,
  because total payload matters on low-end Android (CLAUDE.md §6),
- the count of modified files (expect ~161),
- the exact rollback command:
  `node tools/vo/generate.js --restore .backup-<stamp>`.

Then tell the user to listen to a few clips before committing — suggest
`s1_0_scenario` (first thing a learner hears), `s1_1_wrong_tap` (the tone of
wrong-answer feedback matters most), and `s9_3_recap` (the longest clip).

Do not commit. Leave that to the user.
