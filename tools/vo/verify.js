#!/usr/bin/env node
/* tools/vo/verify.js — offline integrity check for assets/sounds/vo/.
 *
 * Makes no network calls and needs no API key. Run it before generating (to
 * snapshot the current state) and after applying (to prove the swap is sound).
 *
 * Checks
 *   - every cue in VO-narration.md has an MP3 on disk
 *   - no orphan MP3s that no cue references
 *   - every file is valid MP3 with a readable frame header
 *   - no clip exceeds the length the playback engine assumes (15 s)
 *   - reports total payload size (matters for low-end Android, CLAUDE.md §6)
 *
 * Usage
 *   node tools/vo/verify.js
 *   node tools/vo/verify.js --list        # per-cue table
 *   node tools/vo/verify.js --dir tools/vo/.out   # check staging instead
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const L    = require('./lib');

const args = L.parseArgs(process.argv.slice(2));
const dir  = args.dir ? path.resolve(L.ROOT, String(args.dir)) : L.VO_DIR;

const cues = L.parseTable();
const ov   = L.loadOverrides();

/* Re-running prepareText here means a placeholder left unresolved in the cue
   sheet is caught by verify too, not only at generation time. */
cues.forEach((c) => L.prepareText(c, ov));

if (!fs.existsSync(dir)) L.die(`Directory not found: ${dir}`);

const onDisk = new Set(fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.mp3')));
const errors = [];
const warns  = [];

let totalBytes = 0;
let totalSecs  = 0;
let longest    = { cueId: '-', secs: 0 };
const rows     = [];

for (const c of cues) {
  const file = `${c.cueId}.mp3`;
  const p    = path.join(dir, file);

  if (!onDisk.has(file)) {
    errors.push(`missing: ${file}  ${L.C.dim}(VO-narration.md:${c.line})${L.C.x}`);
    continue;
  }
  onDisk.delete(file);

  const buf  = fs.readFileSync(p);
  const secs = L.mp3Duration(buf);
  totalBytes += buf.length;

  if (buf.length < L.MIN_CLIP_BYTES) {
    errors.push(`${c.cueId}: only ${buf.length} bytes — likely a truncated or failed clip`);
  } else if (secs == null) {
    errors.push(`${c.cueId}: no MP3 frame header — not a valid MP3`);
  } else {
    totalSecs += secs;
    if (secs > longest.secs) longest = { cueId: c.cueId, secs };
    if (secs > L.MAX_CLIP_SECONDS) {
      errors.push(`${c.cueId}: ${secs.toFixed(1)}s exceeds the ${L.MAX_CLIP_SECONDS}s hard limit — the ` +
                  `mount-chain fallback timeout (js/content/voiceovers.js:282) can cut this clip off`);
    } else if (secs > L.WARN_CLIP_SECONDS) {
      warns.push(`${c.cueId}: ${secs.toFixed(1)}s — over the ~${L.WARN_CLIP_SECONDS}s the engine is ` +
                 `documented to assume (js/content/voiceovers.js:107); ${(L.MAX_CLIP_SECONDS - secs).toFixed(1)}s of headroom left`);
    }
  }

  rows.push({ cueId: c.cueId, kb: buf.length, secs, words: c.text.split(/\s+/).length });
}

for (const orphan of onDisk) {
  warns.push(`orphan: ${orphan} is on disk but no cue in VO-narration.md references it`);
}

/* ── Report ───────────────────────────────────────────────── */

L.say('');
L.info(`Directory : ${path.relative(L.ROOT, dir) || '.'}`);
L.info(`Cues      : ${cues.length} in VO-narration.md`);
L.info(`Files     : ${rows.length} present`);
L.info(`Payload   : ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
L.info(`Narration : ${Math.floor(totalSecs / 60)}m ${Math.round(totalSecs % 60)}s total`);
L.info(`Longest   : ${longest.cueId} at ${longest.secs.toFixed(1)}s`);
L.say('');

if (args.list) {
  rows.sort((a, b) => b.secs - a.secs);
  L.say(`  ${'CUE'.padEnd(22)} ${'SIZE'.padStart(6)} ${'DUR'.padStart(6)}  WORDS`);
  for (const r of rows) {
    const flag = r.secs > L.MAX_CLIP_SECONDS ? `${L.C.red} ← too long${L.C.x}`
               : r.secs > L.WARN_CLIP_SECONDS ? `${L.C.yel} ← near limit${L.C.x}` : '';
    L.say(`  ${r.cueId.padEnd(22)} ${L.fmtKB(r.kb)} ${L.fmtSec(r.secs)}  ${String(r.words).padStart(5)}${flag}`);
  }
  L.say('');
}

for (const w of warns)  L.warn(w);
for (const e of errors) L.bad(e);

L.say('');
if (errors.length) {
  L.bad(`${errors.length} error(s), ${warns.length} warning(s) — the module is NOT safe to ship.`);
  process.exit(1);
}
L.ok(`All ${cues.length} cues present and valid${warns.length ? ` (${warns.length} warning(s))` : ''}.`);
