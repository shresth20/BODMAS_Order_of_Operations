# VO Guideline — Voice-Over Authoring & Sequencing Rules

This file governs *how narration cues are written* AND *how they actually play back
in the shipped code* — the two are kept in one document because the authoring rules
only make sense in light of what the engine really does. `narration-table-prompt.md`
governs how to *produce the cue-sheet table itself* (format, columns, tabs) — read that
alongside this one. `VO-narration.md` is the output that must satisfy both.

The single most important rule in this document: **the narrator reads the screen.**
A cue's VO Text is the on-screen text at its trigger moment, verbatim (§7). Only when
a moment genuinely has no usable on-screen text may a line be authored — and then it
must describe what is actually shown, and be flagged as authored in the cue sheet.

Part A (§1–8) is for anyone writing or editing cue text. Part B (§9) documents the
actual playback engine as implemented — read it before changing any sequencing code,
not just before writing new lines.

---

## Part A — Writing cues

### 1. Core principles

- **One idea per cue, one or two short sentences.** A cue is one spoken beat, not a
  monologue. If a moment needs several ideas, split it into ordered cues rather than
  writing one long clip — long clips get truncated in recording/playback.
- **Number- / value-agnostic when the value changes across cases.** If a screen (or a
  round within a screen) cycles through different numbers, fruits, primes, etc., write
  the line with bracketed placeholders — `Is [sum] divisible by 3?`, `[number] divided
  by [prime] equals [result].` — instead of baking in one specific case. Only voice an
  exact number when the storyboard/data says that value is fixed for that screen (e.g.
  a root number that never changes).
- **Supplementary, never the only channel.** Every spoken instruction, correct/wrong
  state, and reveal must also exist as on-screen text, state, or visual change — a
  muted device must remain fully playable. VO adds warmth and pacing; it never carries
  information found nowhere else. (§7 enforces this from the other direction: because
  VO Text *is* the screen text, muting can never lose information — the only permitted
  exception is an authored cue for a moment the screen conveys visually, see §7.)
- **Calm classroom pace, plain language.** Write for a Grade-6 (or the module's stated
  grade) learner, including younger / low-literacy learners. Short sentences, everyday
  words, no jargon beyond what the module itself teaches.
- **Encouraging, non-punitive wrong-answer lines.** Never "Wrong" or "No." Guide the
  retry: "Try again — check whether it divides evenly." Wrong-answer cues are
  deterministic (the same wrong input always gets the same cue) so a learner isn't
  confused by inconsistent feedback on a repeated mistake.

### 2. Triggers — controlled vocabulary

Use one of these trigger phrases wherever it fits, with a short parenthetical for
specifics (e.g. `Wrong pair chosen (2×5 or 3×5)`):

`Screen mounts` · `on load` · `on appear` · `on reveal` · `on update` · `on correct` ·
`on wrong` · `on complete` · `on all inputs complete`

- **`on all inputs complete`** is for a screen that pauses partway through and waits
  for the learner to interact with **several** targets (not just one) before
  continuing. Use this instead of `on reveal`/`on complete` when the cue's real gate is
  "every one of a set has been interacted with," not a single event.

- **A cue must be tied to an explicit, observable state or event — never to a raw
  wall-clock timer.** This is a real, code-level constraint, not just a writing
  convention: every cue in this codebase is triggered either by a direct user action
  (an event handler calling `_vo(page, '…')`), by a screen mounting
  (`_voMount(page, […])`), or by chaining off the previous clip's real `ended` event
  (`Narration.queue` / the mount chain — see §9.3). There is no
  `setTimeout(() => _vo(...), N)` anywhere in the sequencing code, and new cues must
  not introduce one. (The `playMount` safety timeout in §9.3 is a *fallback* for a
  clip that never ends — never the primary trigger.)
- **T+** is a rough pacing hint for the *first* cue of a screen only (`0 ms`,
  `~400 ms`) — not a hard schedule. Every cue after the first is sequenced off the
  *previous clip's real end* (its `onEnded` firing) or off the real trigger event,
  whichever comes later — never off a fixed offset from screen-mount.
- Response cues (correct / wrong / reveal / update) always use the event name in the
  Trigger column, not a T+ value.

### 3. Cue ID & file naming

- `s<screenNumber>_<slug>` — lowercase snake_case, unique across the whole sheet.
  `screenNumber` matches the number the **app itself displays** to the learner (the
  in-game "Screen N of ..." label), not the array/loop index in code — so cue IDs stay
  meaningful if unrelated screens are ever inserted or reordered in the data.
- The slug names the *moment*, not the words spoken (`s8_correct_choice`, not
  `s8_3_times_4_equals_12`) — slugs must stay stable even if the VO Text is rewritten.
- **File** is always exactly `<Cue ID>.mp3`, dropped in `assets/sounds/vo/`. No
  suffixes, no subfolders, no renaming between the sheet and the delivered asset. (A
  same-named `.wav` in that folder is tolerated as a fallback — see §9.1 — but the
  sheet and recording brief only ever promise `.mp3`.)
- These IDs are used verbatim as code keys once wired into `voiceovers.js` / the
  screen's `vo('…')` calls — treat them as an API, not a label.

### 4. Which cues a screen typically needs

Include only what the screen actually has; never force a cue type that doesn't apply
(e.g. don't invent a "wrong" cue for an activity with no incorrect state):

- **Mount / title** — fires on fresh entry. Say whether it replays on every revisit or
  fires once (see §5 / §9.5).
- **Instruction** — what the learner is meant to do.
- **Challenge / prompt** — the specific question or target for this attempt, when
  distinct from the general instruction.
- **Correct cue(s)** — one per distinct correct branch, *only if that branch has its own
  on-screen text to draw from* (see §7). Where the game only shows a color/burst/shake
  and no text, there is no correct or wrong cue for that moment.
- **Wrong cue(s)** — gentle, deterministic retry guidance, same on-screen-text
  requirement as above.
- **Reveal / result / equation cue** — when an answer, worked step, or summary is shown
  *as text* (the equation itself, e.g. "12 = 3 × 2 × 2", is not voiced — only its fixed
  label, e.g. "All factors achieved").
- **Complete cue** — screen or activity finished, moving on — only when there's a
  distinct "done" moment (a finale, a completion banner) beyond a generic Next click.
- Optional: **hint**, **per-round / per-case load cue** (e.g. "next number," "next
  round"), **demo/walkthrough cues** for any scripted worked-example sequence.

### 5. Revisit behaviour

In this module **every mount cue chain is fresh-entry-only by construction**: the
engine records each page id the first time its mount chain fires
(`_playedMounts` in `js/content/voiceovers.js`) and silently skips the chain — while
still firing its `onEnded` callback, so gated buttons never stay locked — on every
later visit to that page. For cue-writing purposes:

- Mark the mount/title cue **"fresh entry only"** in Notes (this is what the engine
  does; the note keeps the sheet honest).
- Do not expect correct/wrong/reveal cues to refire on a revisit to an
  already-completed activity — they only fire on the learner's live interaction.

### 6. Per-case / looping data

When a screen (or a round within a screen) cycles through multiple values — different
target numbers, different fruits, different prime sets — write the cue **once**, with
placeholders, and note in the cue's Notes column how many times / for which cases it
fires (e.g. "fires per leaf, shared across both leaves," "fires for questions 2–5").
Do not create a near-duplicate cue per case unless the wording genuinely must differ.

### 7. VO text follows the screen text — read it, don't rewrite it

This is the governing rule for all cue text; it overrides §1's general "supplementary"
rule wherever the two would conflict:

- **If the cue's trigger moment has on-screen text, the VO Text IS that text,
  verbatim** — a title, instruction, question, coach-bubble line, feedback line, fixed
  caption or label. Same words, same order. Not a paraphrase, not a shortened or
  "improved" version, not added commentary, not an explanation of *why* something is
  correct unless that explanation is itself already printed on screen.
- **Permitted trims only** — things that cannot be spoken: strip emoji/icons and
  decorative punctuation spacing (`Watch the board !` is read as "Watch the board!"),
  expand symbols to words where they'd be misread aloud (`÷` → "divided by",
  `×` → "times"), and split one long on-screen block into two ordered cues if it
  exceeds §1's one-idea-per-cue rule — without changing the words.
- **Only author a new line when the moment has no usable on-screen text** — a purely
  visual reveal, an animation beat, a correct/wrong state shown only by color, shake,
  or confetti with no caption. An authored line is allowed there *if the moment
  genuinely needs narration*; it must describe what is actually shown on screen at
  that moment — nothing the learner can't see — and follow §1's tone rules. Mark every
  such cue `authored — no on-screen text for this moment` in Notes. A blank Notes cell
  asserts the row is verbatim screen text; any non-verbatim cue must say so in Notes.
  (Silence is still fine too: if animation and color already carry the feedback, the
  moment may simply have no cue.)
- **Practice / quiz screens never voice the answer.** On any screen where the learner
  is answering a question (the `SX.3` practice screens, the S9.2 rapid round, the S9.0
  nested-brackets steps), correct/wrong cues voice **only a short confirmation** —
  "Correct!", "Right!", "Try again!" — never the rule, the worked equation, or the
  solved value, even though the screen prints them. The full feedback line stays
  on-screen text only; the question prompt / instruction is the only substantive
  narration on these screens. This is a deliberate, standing exception to the verbatim
  rule above: the confirmation word is trimmed *out of* the screen's feedback line
  ("Correct!" out of "Correct ! × is solved before +."), and the neutral retry line is
  an authored cue flagged in Notes.
- **Never invent narration that competes with or contradicts the screen.** If the
  on-screen text seems weak or wrong, keep the VO verbatim anyway and flag the string
  for a human in Notes — do not silently fix it in the VO. Fix the screen text first;
  the VO follows it.
- **Numbers and computed values** follow §1: if the value varies across cases/rounds,
  the cue uses a bracketed placeholder (`[answer]`, `[sum]`) and the recording voices
  it generically or the line is written to avoid the value; if the storyboard fixes the
  value for that screen (a worked example like "10 minus 6. That's 4."), voice it
  exactly as printed.
- When in doubt, open the actual rendered screen (or the string it's built from —
  `locales/content.json`, or the literal in `js/core/content-renderer.js`) and check:
  is there a string that shows this exact text at this moment? If yes, voice it
  verbatim. If no, either author a flagged line (if the moment needs one) or drop the
  cue and say so in the cue sheet's per-screen note — never leave a gap unexplained.

### 8. QA checklist before handing off to recording

- **Verbatim check (§7):** for every cue with a blank Notes cell, diff its VO Text
  against the on-screen string at its trigger moment (`locales/content.json` key or
  renderer literal) — they must match word-for-word after the permitted trims. Every
  non-verbatim cue carries `authored — no on-screen text for this moment` (or an
  explicit flag) in Notes.
- **No-answers check (§7):** on every practice/quiz screen, no correct/wrong cue
  voices an answer, rule, or worked value — correct cues are confirmation-only
  ("Correct!" / "Right!"), wrong cues a neutral retry ("Try again!").
- **Sync check:** for every cue, confirm the `_vo` / `_voQueue` / `_voMount` call
  sits in the same code path that shows (or has already shown) the text it reads —
  the cue must never speak text the learner can't yet see, and text must never wait
  on audio to appear (see §9.4). Mount chains that gate a button must do it via
  `onEnded`, never a timer.
- Every cue in a screen's table appears in that screen's `Clips` count in the Summary.
- If a cue is defined but you expect it never to fire with the current data/build
  (e.g. an edge case that isn't reachable), keep the row and say so in Notes — never
  silently drop it.
- No cue is the *only* source of an instruction, state, or feedback — check each
  against the on-screen text/state it accompanies.
- Wrong-answer lines read as encouragement, not correction.
- Placeholders (`[number]`, `[answer]`, etc.) are used everywhere the underlying value
  actually varies, and nowhere the value is genuinely fixed.
- Play the screen with sound off. Every piece of text that was supposed to appear must
  still appear, at a readable pace — if it doesn't, the cue was wired wrong, not the
  text.

---

## Part B — How playback actually works right now

This section describes the real, current behavior of the engine **in this module** —
`Narration` (`js/content/voiceovers.js`) plus the `_vo` / `_voQueue` / `_voMount`
helpers in `js/core/content-renderer.js`. If code and this section ever disagree,
trust the code and fix this file.

### 9.1 One clip at a time, `.mp3` only

- Every cue key maps to exactly `assets/sounds/vo/<cueId>.mp3`. There is no `.wav`
  fallback in this module — the sheet promises `.mp3` and the engine loads only that.
- `Narration.play(key)` — used by `_vo(page, suffix)` for correct/wrong/update
  feedback — **stops whatever is speaking and plays the new cue immediately**.
  Feedback beats narration; cues never overlap.
- `Narration.queue(key)` — used by `_voQueue(page, suffix)` for chained reveals —
  plays after the current clip (and anything already queued) ends, or immediately if
  idle. This is the only sanctioned way to sequence a reveal cue behind the clip
  before it; `stop()`/`play()` discards the queue.
- `Narration.stop()` halts playback, clears the queue, and bumps an internal
  generation counter that cancels any in-flight mount chain. `renderPage()` calls it
  on every navigation, so a cue can never leak across a screen change.
- A missing or broken file never blocks the game: load errors and autoplay rejections
  advance the chain / drain the queue instead of stalling.

### 9.2 Cue keys are derived, not typed

- `_voKey(page, suffix)` builds the key as `'s' + page.id` with `.` → `_`, plus
  `'_' + suffix` — page `1.1` + `'wrong_tap'` → `s1_1_wrong_tap`. The suffix
  vocabulary in the renderer must therefore match `VO-narration.md` exactly; a typo'd
  suffix silently no-ops (no such key, no such file).
- `Narration.prefetchPage(pageId)` warms every cue belonging to one page; mount
  chains prefetch the current page and (via `opts.next`) the next one, so the first
  clip of the next screen starts instantly.

### 9.3 Mount chains: `playMount`, fresh-entry-only, `onEnded` gating

- `_voMount(page, ['scenario', 'question'], { onEnded, next })` plays a screen's
  entry clips back to back — each subsequent clip is started off the previous clip's
  real `ended` event, never off a guessed delay.
- **Fresh entry only, by construction:** the first time a page's mount chain fires,
  the page id is recorded in `_playedMounts`; every later visit skips the chain but
  still calls `onEnded`, so anything gated on it is never left locked.
- `onEnded` fires **exactly once** — after the last clip's natural end, or on file
  error, autoplay block, or the safety timeout (clip duration + 1.5 s once metadata
  is known, hard 20 s cap otherwise). Screens gate buttons on it (each `SX.0` intro
  reveals its Start button via `onEnded`; the L1 rule-reveal gates its button the
  same way) — a learner is never trapped behind a bad or blocked file. The timeout is
  a fallback only; `ended` is always the primary trigger (§2).
- If autoplay blocks a mount chain, the blocked clip is re-armed to replay on the
  next user gesture and the rest of the chain rides the queue (`_armMountRetry`);
  a blocked one-shot `play()` likewise replays on the first interaction.

### 9.4 On-screen text never waits for audio — but input and navigation do

This module has **no clip-duration-paced text reveal**: titles, scenarios, questions
and feedback strings are shown by their own animation timelines (anime.js) the moment
their event happens, regardless of whether audio is playing, muted, or missing.

- **Input gate:** while any cue is speaking (single clip, queue, or mount chain), a
  transparent overlay (`#vo-input-gate` in `voiceovers.js`) blocks pointer input and
  Enter/Space activation. The learner can only interact once the narration for the
  current moment has finished — e.g. practice options are not tappable until the
  question cue ends. The gate releases on `ended`, file error, autoplay block, or a
  25 s watchdog, so a bad/blocked file can never lock the learner out.
- **VO-synced advance:** every auto-advance (next practice question, completion wipe,
  next nested-brackets question, next bracket puzzle, review advance) runs through
  `_voIdle(page, minMs, fn)` in `content-renderer.js` — `fn` fires after **both** the
  minimum delay elapsed **and** `Narration.onIdle` reports nothing is speaking. A page
  or question never changes mid-clip.
- **Animation-triggered cues queue:** cues fired by animations rather than user input
  (`tap_finish`, `compare`, lab `complete`) use `_voQueue` so a fast animation cannot
  cut off the clip that is still speaking; user-triggered cues still use `play()`
  (interrupting is safe there — the gate guarantees nothing is speaking when the
  learner can act).
- A muted device or a missing clip gives an identical *text* experience — the engine
  is idle whenever no audio is actually playing, so the gate lifts and `_voIdle`
  advances on the minimum delay alone; `onEnded`-gated buttons (§9.3) fire either way.
- The flip side: **voice↔screen sync is enforced at authoring time, not by the
  engine.** The engine will happily speak whatever the table says over whatever the
  screen shows. §7's verbatim rule plus §8's sync check are the only things keeping
  the two aligned — so whenever an on-screen string changes (`locales/content.json`
  or a renderer literal), the cue's VO Text in `VO-narration.md` **and** the recorded
  MP3 must be updated in the same change.

### 9.5 SFX and VO are independent channels

`js/core/audio.js` is a simple SFX player (click, correct, wrong, confetti, chime).
There is **no VO-priority coordination** in this module: an SFX can sound over a
speaking cue. Correct/wrong handlers that play a stinger and fire a cue in the same
tick will overlap the stinger with the cue's first syllables — acceptable for short
stingers, not for long sounds. Keep SFX short; don't add long SFX to moments that
also speak.

### 9.6 Where this lives in code

| Concern | File |
|---|---|
| VO engine: `play`/`queue`/`stop`, `playMount` chains, prefetch, autoplay retry, `_playedMounts` | `js/content/voiceovers.js` |
| `_voKey`/`_vo`/`_voQueue`/`_voMount` helpers and every per-screen cue firing site | `js/core/content-renderer.js` |
| SFX (click / correct / wrong / confetti) | `js/core/audio.js` |
| On-screen strings — the source of most VO text | `locales/content.json` (+ a few literals in `content-renderer.js`) |
| Cue sheet — source of truth for keys, text, and MP3 file names | `VO-narration.md` |
