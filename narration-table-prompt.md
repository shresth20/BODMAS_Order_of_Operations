# Narration Table Prompt

A reusable prompt for generating a **narration table** (voice-over cue sheet) for an
interactive learning-game module, in the exact format used by
`VO-cue-sheet.xlsx` in this repo. Paste the prompt below into a fresh chat, fill in
the two inputs, and you get a screen-by-screen cue sheet ready to hand to the VO
generation pipeline.

Read `VO-guideline.md` for the authoring/sequencing rules the table must satisfy;
this file only governs how to *produce the table*.

---

## The prompt (copy from here)

> You are authoring the **narration table** (voice-over cue sheet) for an interactive
> math-learning game module. Produce it in the exact format below — do not invent new
> columns, tabs, or naming schemes.
>
> ### Inputs I will give you
> 1. **Module ID** (e.g. `MT06A01_L06_S03`) and its topic (e.g. "Divisibility by 2").
> 2. **The storyboard**: an ordered list of screens `S0…Sn`, each with its title, its
>    `render*` JS function name, and what happens on the screen (the interaction, the
>    correct/wrong states, any reveals, any per-case data that changes).
> 3. **The on-screen text of every screen** — the exact strings the learner sees:
>    titles, instructions, button labels, feedback lines, reveal/equation text. Pull
>    these from the screen source / locale files (e.g. `js/content/`, `locales/`) if I
>    point you at a repo instead of pasting them. The VO text is authored FROM these
>    strings — see the VO text rules below.
>
> ### What to produce
> A **Summary tab** followed by **one tab per screen**. One tab = one screen. One row =
> one narration cue.
>
> **Summary tab** — a header line `Voice-Over Cue Sheet — <ModuleID> — <Topic>`, the
> line `Drop all MP3 files into: assets/sounds/vo/`, then this table:
>
> | Screen | JS Function | Clips | Sheet tab |
> |--------|-------------|-------|-----------|
> | S0 — <name> | render…() | <count> | S0 — <name> |
> | …           | …          | …       | …          |
>
> **Each screen tab** — a header `S<n> — <name>   —   render…()`, then this table:
>
> | # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
> |---|--------|------|---------|----|---------|-----------|-------|
> | 1 | s<n>_welcome | s<n>_welcome.mp3 | Screen mounts | 0 ms | … |  |  |
>
> ### Column rules
> - **Cue ID** — `s<screenNumber>_<slug>`, lowercase snake_case, unique across the whole
>   sheet (e.g. `s0_welcome`, `s3_ask_div3`, `s3_correct_div9`). The slug names the
>   moment, not the words. These IDs are used verbatim as code keys, so keep them stable.
> - **File** — always exactly `<Cue ID>.mp3`. No suffixes, no folders, no renaming.
> - **Trigger** — the *event* that fires the cue, from this controlled vocabulary where
>   it fits: `Screen mounts`, `on load`, `on appear`, `on reveal`, `on update`,
>   `on correct`, `on wrong`, `on complete`. Add a short parenthetical for specifics
>   (e.g. `Problem 1 loads (36 ÷ 6)`, `Correct answer to div-by-3`). A cue must be tied
>   to explicit state/event, never to a wall-clock timer.
> - **T+** — rough offset after the trigger for the *first* cue of a screen (`0 ms`,
>   `~400 ms`, `~600 ms`); for response cues use `on correct` / `on wrong` / `on reveal`
>   / `on update`. This is a hint for pacing, not a hard schedule — chained cues are
>   sequenced off the previous clip's `ended` event, not off T+.
> - **VO Text** — the spoken line. See VO text rules below.
> - **Approved?** — leave blank (a human ticks it).
> - **Notes** — blank unless a cue needs one (e.g. "wired but never fires with
>   current data", "number voiced generically", "authored — no on-screen text for
>   this moment"). Any cue whose VO Text is NOT verbatim on-screen text must say so
>   here — a blank Notes cell asserts the line matches the screen word-for-word.
>
> ### VO text rules (these come from VO-guideline.md — obey them)
> - **RULE 0 — Read the screen, don't rewrite it.** If the moment a cue fires has
>   on-screen text (title, instruction, feedback line, reveal text), the VO Text **is
>   that on-screen text, verbatim** — same words, same order. Do not paraphrase it,
>   "improve" it, shorten it, or add extra sentences around it. The narrator reads the
>   screen; the narrator does not write a new script. Trim only what cannot be
>   spoken: strip emoji/icons, expand symbols to words (`÷` → "divided by") only
>   where the guideline requires it, and split one long on-screen block into two
>   ordered cues if it exceeds the one-idea-per-cue rule — without changing the words.
> - **Only author a new line when the screen has no usable text for that moment**
>   (e.g. a purely visual reveal, an animation beat, a correct/wrong state with no
>   feedback string). The new line must describe what is actually on screen at that
>   moment — nothing that isn't shown — and must follow the tone rules below. Mark
>   every such cue with `authored — no on-screen text for this moment` in Notes.
> - **Practice / quiz screens never voice the answer.** Wherever the learner is
>   answering a question, correct/wrong cues voice only a short confirmation —
>   "Correct!", "Right!", "Try again!" — never the rule, the worked equation, or the
>   solved value, even though the screen prints them. The full feedback line stays
>   on-screen text only; the question prompt is the only substantive narration on
>   these screens. Mark the neutral retry line as authored in Notes.
> - **Never invent narration that competes with or contradicts the screen.** If the
>   on-screen text seems wrong or weak, keep the VO verbatim anyway and flag it in
>   Notes for a human — do not silently fix it in the VO.
> - **One idea per cue, one or two short sentences.** Long monologue clips get
>   truncated — split them into ordered cues instead.
> - **Number- / value-agnostic when the value changes across cases.** If a screen cycles
>   through different numbers, write `Is [sum] divisible by 3?` / `[number] divided by 3
>   equals [result].` with bracketed placeholders — do not bake a specific number into
>   the line. Only voice an exact number when the storyboard says that value is fixed.
> - **Supplementary, never the only channel.** Every spoken instruction must also exist
>   as on-screen text/state, so a muted device is fully playable.
> - Calm, classroom pace; plain language for younger / low-literacy learners.
> - Encouraging, non-punitive wrong-answer lines ("Try again. Add every digit.").
>
> ### Which cues each screen needs (typical set — include only what the screen has)
>
> For every cue below, first look for the on-screen text at that moment and read it
> verbatim (Rule 0); only author a line when that moment truly has none.
>
> - **Mount / title** cue (`s<n>_title` or `s<n>_welcome` / `s<n>_intro`) — fires once on
>   fresh entry. If the screen re-renders in place across cases, note "fresh entry only".
> - **Instruction** cue — what the learner must do.
> - **Correct** cue(s) — one per distinct correct branch; state the rule/why, not just
>   "correct".
> - **Wrong** cue(s) — gentle retry guidance; deterministic (same wrong answer replays
>   the same cue).
> - **Reveal / result / equation** cue — when an answer or worked step is shown.
> - **Complete** cue — screen finished / moving on.
> - Optional: **hint**, **explore**, per-problem load cues.
>
> ### Output — write a `VO-narration.md` file
>
> **Create a file named `VO-narration.md` in the new game's repo root** containing the
> whole narration table. Do not just print the tables in chat — write the file.
>
> The file must contain, in this order:
>
> 1. A title line: `# VO Narration Table — <ModuleID> — <Topic>`.
> 2. The line `Drop all MP3 files into: assets/sounds/vo/`.
> 3. A `## Summary` section with the Summary table.
> 4. One `## S<n> — <name>   —   render…()` section per screen, each with its cue table.
>
> Use GitHub-flavored Markdown tables (one section per tab, with its header line). Do not
> add prose between tables beyond the header lines. Keep the clip counts in the Summary
> consistent with the rows you actually produce. If a cue is defined but you expect it
> never to fire with the given data, still include it and say so in Notes — never
> silently drop a cue.
>
> After writing the file, confirm the path and give a one-line count of screens and total
> cues. `VO-narration.md` is then the source of truth the VO generation pipeline reads to
> produce the MP3s (see `VO-guideline.md`).

---

## Worked reference (from this module)

**Summary tab**

| Screen | JS Function | Clips | Sheet tab |
|--------|-------------|-------|-----------|
| S0 — Visualise Divisibility | renderIntro | 6 | S0 — Visualise Divisibility |
| S3 — Div by 3 and 9 | renderCheckpoint | 11 | S3 — Div by 3 and 9 |

**S3 — Div by 3 and 9   —   renderCheckpoint()**

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s3_title | s3_title.mp3 | Screen mounts | 0 ms | Divisibility by 3 and 9. |  | fresh entry only |
| 2 | s3_instruction | s3_instruction.mp3 | Digit cards appear | ~400 ms | Enter the digit sum. |  |  |
| 3 | s3_wrong_sum | s3_wrong_sum.mp3 | Wrong digit sum entered | on wrong | Try again. Add every digit. |  |  |
| 4 | s3_sum_found | s3_sum_found.mp3 | Correct digit sum entered | on correct | Digit sum found. |  |  |
| 5 | s3_ask_div3 | s3_ask_div3.mp3 | Div-by-3 question appears | on appear | Is [sum] divisible by 3? |  | number voiced generically |
| 6 | s3_correct_div3 | s3_correct_div3.mp3 | Correct answer to div-by-3 | on correct | If the sum of digits is divisible by 3, then the number is divisible by 3. |  |  |
| 7 | s3_not_div3 | s3_not_div3.mp3 | Number not divisible by 3 reveal | on reveal | So [number] is not divisible by 3. The digit sum is not a multiple of 3. |  | wired but never fires with current all-divisible data |

Cue IDs here match the keys in `js/content/voiceovers.js` and every `vo('…')` call in
`js/core/app.js` exactly — that is the point of the table.
