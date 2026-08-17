# VO Regeneration Tooling

Standalone Node tooling that re-records every narration clip in a different
ElevenLabs voice — for this module, **Mitali – Kids Mythology Storyteller**.

**It does not touch game code.** Nothing in `tools/` is loaded by the browser,
referenced from `index.html`, or imported by any file under `js/`. The only
thing it changes is the contents of `assets/sounds/vo/`.

That works because the game addresses narration purely by filename. From
`js/content/voiceovers.js`:

```js
var VO_DIR = 'assets/sounds/vo/';
_keys.forEach(function (k) { _srcs[k] = VO_DIR + k + '.mp3'; });
```

Swap the bytes behind those 161 filenames and the voice changes. No JS edit,
no config flag, no new asset path.

---

## Files

| File | Purpose |
|---|---|
| `generate.js` | Reads `VO-narration.md`, calls ElevenLabs, stages, validates, swaps in. Also `--restore`. |
| `verify.js` | Offline integrity + duration report. No API key needed. |
| `lib.js` | Cue-sheet parser, MP3 duration reader, config loading, path guard. |
| `overrides.json` | Voice settings, model, and per-cue text fixes. **The only file you normally edit.** |
| `.env.local.example` | Template for credentials. Copy to `.env.local` (gitignored). |

Requires Node 18+ for built-in `fetch`. This repo has no `package.json` and the
tooling adds no dependencies — it is plain Node, consistent with CLAUDE.md §0.4.

---

## One-time setup

1. **Add the voice to your account.** ElevenLabs → Voice Library → search
   *Mitali – Kids Mythology Storyteller* → Add to my voices. Voices in the
   Library are not usable by ID until you add them.
2. **Copy its voice ID** from ElevenLabs → Voices.
3. **Create the credentials file:**

   ```bash
   cp tools/vo/.env.local.example tools/vo/.env.local
   ```

   Fill in `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID`. A service-account key
   scoped to `text_to_speech` only is sufficient:

   ```bash
   curl -X POST https://api.elevenlabs.io/v1/service-accounts/<service_account_user_id>/api-keys \
        -H "xi-api-key: $ELEVENLABS_ADMIN_KEY" \
        -H "Content-Type: application/json" \
        -d '{"name":"mt06a01-vo-generator","permissions":["text_to_speech"]}'
   ```

   Such a key **cannot list voices**, so set `ELEVENLABS_VOICE_ID` explicitly
   rather than relying on `--voice-name`.

`.env.local` is gitignored. Never commit a key (CLAUDE.md §9).

---

## Running it

```bash
node tools/vo/verify.js                 # snapshot the current state first
node tools/vo/generate.js --dry-run     # show every line, no API call, no cost
node tools/vo/generate.js               # generate → validate → back up → swap in
node tools/vo/verify.js --list          # confirm the result
```

The whole cue sheet is **6,487 characters**, so a full re-record is one cheap
run — roughly a tenth of a Starter month's quota.

### Useful flags

| Flag | Effect |
|---|---|
| `--dry-run` | Print the exact text of every cue. No network, no cost. |
| `--only s1_0_scenario,s1_1_intro` | Regenerate specific cues. |
| `--screen s3_` | Regenerate everything for one level. |
| `--no-apply` | Stage into `.out/` but don't touch `assets/`. Audition first. |
| `--force` | Re-synthesise even if a staged file already exists. |
| `--concurrency 3` | Parallel requests. Lower it if you hit 429s. |
| `--restore .backup-<stamp>` | Roll back to the clips replaced by that run. |

### Safety model

1. Everything generates into `tools/vo/.out/` — **staging**, not the live folder.
2. Staged clips are validated before anything is replaced: non-empty, parseable
   MP3, and under the length limit the playback engine assumes.
3. If **any** cue fails, nothing is swapped in. Successful clips stay cached in
   `.out/`, so a re-run only retries the failures.
4. Current clips are copied to `tools/vo/.backup-<timestamp>/` before being
   overwritten. `--restore` puts them back.
5. `assertSafeWrite()` refuses to write anywhere outside `assets/sounds/vo/`
   and `tools/vo/`.

---

## Tuning the result — `overrides.json`

**`voiceSettings`** goes straight to the API.

| Setting | Effect |
|---|---|
| `stability` | Lower = more expressive and variable; higher = flatter, more consistent across 161 clips. `0.5` balances a storyteller read against clip-to-clip consistency. |
| `similarity_boost` | How tightly it hugs the original voice. `0.75` is the usual sweet spot. |
| `style` | Storyteller exaggeration. Raising it costs latency and can destabilise; `0.3` keeps warmth without drama. |
| `use_speaker_boost` | Clarity on cheap tablet speakers. Keep `true`. |

Optional `"speed"` (roughly 0.7–1.2) is supported on current models — add it if
the mythology-storyteller cadence runs long for a maths lesson. It is left out
of the defaults because support varies by model; if a request 422s, remove it.

**`cueText`** replaces a cue's text wholesale. Six cues need this: the
`_1_compare` lines carry `[answer]` placeholders, which `VO-guideline.md` §1
mandates for the cue sheet but which a TTS engine would read aloud as "bracket
answer bracket". The generator **hard-fails** on any unresolved placeholder
rather than shipping it (CLAUDE.md §8).

**`pronunciation`** is applied to every cue as whole-word, case-insensitive
substitution — seeded with `laddoos → luh-doos` from `Voiceover_S07.md`.

---

## Clip-length limits

`verify.js` enforces what `js/content/voiceovers.js` actually does:

- **> 15 s → warning.** Line 107 documents "no clip in this module exceeds
  ~15s". Intent, not an invariant — the shipped `s9_3_recap` is already 18.6 s.
- **> 20 s → error.** When a clip's metadata never loads, the mount-chain
  safety timeout (line 282) falls back to a hard 20 s and advances anyway, so a
  longer clip can be cut off on a slow connection.

A storyteller voice typically reads slower than the current audio, so expect
durations to grow. If a clip crosses 20 s: shorten the line in
`VO-narration.md`, add a tighter `cueText` override, or raise `speed`.

---

## After a successful run

`git status` will show ~161 modified MP3s. Review, listen to a few, then commit.
There is no service worker or asset manifest in this repo, so nothing else needs
updating — but a deployed copy may serve cached audio, so hard-refresh when
checking a live URL.

---

## Licensing — check before shipping

Voice Library voices carry sharing terms set by the voice's owner, and
commercial usage rights depend on those terms plus your plan tier. This module
ships to schools, so confirm the voice permits that use before committing 161
regenerated clips.
