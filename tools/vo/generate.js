#!/usr/bin/env node
/* tools/vo/generate.js — regenerate every VO clip in a chosen ElevenLabs voice.
 *
 * Reads VO-narration.md, synthesises one MP3 per cue, and swaps the results
 * into assets/sounds/vo/. No game code is read, imported or modified — the
 * only contract is the filename layout the game already expects.
 *
 * Safety model:
 *   1. Everything is generated into tools/vo/.out/ first (staging).
 *   2. Staged files are validated (non-empty, parseable, under the clip-length
 *      limit the playback engine assumes) BEFORE anything is replaced.
 *   3. The current clips are copied to tools/vo/.backup-<timestamp>/ and only
 *      then overwritten. `--restore` puts them back.
 *
 * Usage
 *   node tools/vo/generate.js --dry-run
 *   node tools/vo/generate.js
 *   node tools/vo/generate.js --only s1_0_scenario,s1_1_intro
 *   node tools/vo/generate.js --screen s3_
 *   node tools/vo/generate.js --no-apply          # stage only, don't swap in
 *   node tools/vo/generate.js --restore .backup-2026-08-11T10-12-33
 *
 * Credentials (never committed — see tools/vo/.env.local, which is gitignored):
 *   ELEVENLABS_API_KEY   required
 *   ELEVENLABS_VOICE_ID  required unless --voice-name is used
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const L    = require('./lib');

const API = 'https://api.elevenlabs.io';

/* ─────────────────────────────────────────────────────────── */

async function main() {
  L.loadDotEnv();
  const args = L.parseArgs(process.argv.slice(2));

  if (args.help || args.h) return usage();
  if (args.restore) return restore(String(args.restore));

  const cues = L.parseTable();
  const ov   = L.loadOverrides();

  /* prepareText() dies on any unresolved [placeholder] — do it for the whole
     set up front so a bad table fails before a single credit is spent. */
  const all = cues.map((c) => ({ ...c, spoken: L.prepareText(c, ov) }));

  const selected = select(all, args);
  if (!selected.length) L.die('No cues matched the --only / --screen filter.');

  const partial = selected.length !== all.length;
  const chars   = selected.reduce((n, c) => n + c.spoken.length, 0);

  L.say('');
  L.info(`Cue sheet   : VO-narration.md (${all.length} cues)`);
  L.info(`Selected    : ${selected.length}${partial ? ` ${L.C.yel}(partial run)${L.C.x}` : ''}`);
  L.info(`Model       : ${ov.modelId}`);
  L.info(`Format      : ${ov.outputFormat}`);
  L.info(`Characters  : ${chars.toLocaleString()}  ${L.C.dim}(ElevenLabs bills per character)${L.C.x}`);
  L.info(`Staging dir : tools/vo/.out/`);
  L.say('');

  if (args['dry-run']) {
    for (const c of selected) L.say(`  ${c.cueId.padEnd(22)} ${L.C.dim}${c.spoken}${L.C.x}`);
    L.say('');
    L.ok(`Dry run — nothing called, nothing written. ${chars.toLocaleString()} characters would be synthesised.`);
    return;
  }

  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    L.die('ELEVENLABS_API_KEY is not set.\n' +
          '  Put it in tools/vo/.env.local (gitignored) or export it in your shell.\n' +
          '  A service-account key with the "text_to_speech" permission is enough.');
  }

  const voiceId = await resolveVoice(key, args);
  L.info(`Voice       : ${voiceId}${args['voice-name'] ? ` (${args['voice-name']})` : ''}`);
  L.info(`API key     : ${L.maskKey(key)}`);
  L.say('');

  fs.mkdirSync(L.OUT_DIR, { recursive: true });

  const conc  = Math.max(1, parseInt(args.concurrency || '3', 10));
  const force = !!args.force;
  const stats = { made: 0, skipped: 0, failed: [] };

  await runPool(selected, conc, async (cue, idx) => {
    const dest = path.join(L.OUT_DIR, `${cue.cueId}.mp3`);
    L.assertSafeWrite(dest);

    if (!force && fs.existsSync(dest) && fs.statSync(dest).size >= L.MIN_CLIP_BYTES) {
      stats.skipped++;
      progress(idx, selected.length, cue.cueId, `${L.C.dim}cached${L.C.x}`);
      return;
    }

    /* Neighbouring lines from the same screen keep prosody continuous across
       clips that play back to back (playMount chains in voiceovers.js). */
    const sibs = selected.filter((c) => c.screen === cue.screen);
    const at   = sibs.indexOf(cue);

    try {
      const buf = await synthesise(key, voiceId, cue.spoken, ov, {
        previous_text: at > 0 ? sibs[at - 1].spoken : undefined,
        next_text:     at > -1 && at < sibs.length - 1 ? sibs[at + 1].spoken : undefined
      });
      fs.writeFileSync(dest, buf);
      stats.made++;
      const d = L.mp3Duration(buf);
      progress(idx, selected.length, cue.cueId, `${L.fmtKB(buf.length)} ${L.fmtSec(d)}`);
    } catch (e) {
      stats.failed.push({ cueId: cue.cueId, error: e.message });
      progress(idx, selected.length, cue.cueId, `${L.C.red}FAILED${L.C.x}`);
    }
  });

  L.say('');
  L.info(`Generated ${stats.made}, reused ${stats.skipped}, failed ${stats.failed.length}`);

  if (stats.failed.length) {
    L.say('');
    for (const f of stats.failed) L.bad(`${f.cueId}: ${f.error}`);
    L.say('');
    L.die('Generation incomplete — nothing was swapped into assets/sounds/vo/.\n' +
          '  Fix the errors above and re-run; already-generated clips are cached in tools/vo/.out/.');
  }

  const problems = validateStaged(selected);
  if (problems.length) {
    L.say('');
    for (const p of problems) L.bad(p);
    L.say('');
    L.die('Staged audio failed validation — nothing was swapped in. See tools/vo/README.md.');
  }
  L.ok('Staged audio passed validation (size + clip length).');

  if (args['no-apply']) {
    L.say('');
    L.ok(`Staged in tools/vo/.out/ — not applied. Re-run without --no-apply to swap them in.`);
    return;
  }

  apply(selected, partial);
}

/* ─────────────────────────────────────────────────────────────
   Selection
   ───────────────────────────────────────────────────────────── */

function select(all, args) {
  let out = all;
  if (args.only) {
    const want = new Set(String(args.only).split(',').map((s) => s.trim()).filter(Boolean));
    const known = new Set(all.map((c) => c.cueId));
    for (const w of want) if (!known.has(w)) L.die(`--only: "${w}" is not a cue ID in VO-narration.md`);
    out = out.filter((c) => want.has(c.cueId));
  }
  if (args.screen) {
    const pre = String(args.screen);
    out = out.filter((c) => c.cueId.startsWith(pre));
    if (!out.length) L.die(`--screen: no cue ID starts with "${pre}"`);
  }
  return out;
}

/* ─────────────────────────────────────────────────────────────
   ElevenLabs API
   ───────────────────────────────────────────────────────────── */

async function resolveVoice(key, args) {
  const id = args.voice || process.env.ELEVENLABS_VOICE_ID;
  if (id) return String(id);

  const name = args['voice-name'] || process.env.ELEVENLABS_VOICE_NAME;
  if (!name) {
    L.die('No voice specified.\n' +
          '  Set ELEVENLABS_VOICE_ID in tools/vo/.env.local (recommended — works with a\n' +
          '  text_to_speech-only key), or pass --voice-name "Mitali" if your key also has\n' +
          '  the voices_read permission.');
  }

  const res = await fetch(`${API}/v2/voices?search=${encodeURIComponent(name)}&page_size=100`, {
    headers: { 'xi-api-key': key }
  });
  if (res.status === 401 || res.status === 403) {
    L.die(`Cannot list voices (HTTP ${res.status}). A text_to_speech-only key cannot resolve a\n` +
          '  voice by name. Copy the voice ID from the ElevenLabs Voices page and set\n' +
          '  ELEVENLABS_VOICE_ID instead.');
  }
  if (!res.ok) L.die(`Voice lookup failed: HTTP ${res.status} ${await res.text()}`);

  const list = (await res.json()).voices || [];
  const hits = list.filter((v) => (v.name || '').toLowerCase().includes(String(name).toLowerCase()));

  if (!hits.length) {
    L.die(`No voice matching "${name}" in this account.\n` +
          '  Open the ElevenLabs Voice Library, add the voice to your VoiceLab, then re-run.');
  }
  if (hits.length > 1) {
    L.warn(`${hits.length} voices match "${name}":`);
    for (const v of hits) L.say(`    ${v.voice_id}  ${v.name}`);
    L.die('Ambiguous — set ELEVENLABS_VOICE_ID to the exact one you want.');
  }

  args['voice-name'] = hits[0].name;
  return hits[0].voice_id;
}

const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);

async function synthesise(key, voiceId, text, ov, extra) {
  const url  = `${API}/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=${encodeURIComponent(ov.outputFormat)}`;
  const body = { text, model_id: ov.modelId, voice_settings: ov.voiceSettings };
  if (ov.seed != null) body.seed = ov.seed;
  if (extra.previous_text) body.previous_text = extra.previous_text;
  if (extra.next_text)     body.next_text     = extra.next_text;

  let lastErr = 'unknown error';

  for (let attempt = 1; attempt <= 4; attempt++) {
    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'audio/mpeg' },
        body: JSON.stringify(body)
      });
    } catch (e) {
      lastErr = `network error: ${e.message}`;
      await sleep(backoff(attempt));
      continue;
    }

    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < L.MIN_CLIP_BYTES) throw new Error(`response was only ${buf.length} bytes — treated as a failure`);
      return buf;
    }

    /* Surface the API's own message verbatim — never swallow it (CLAUDE.md §8). */
    const detail = (await res.text().catch(() => '')).slice(0, 400);
    lastErr = `HTTP ${res.status} ${detail}`;

    if (!RETRYABLE.has(res.status)) throw new Error(lastErr);

    const ra = parseFloat(res.headers.get('retry-after') || '');
    await sleep(isFinite(ra) ? ra * 1000 : backoff(attempt));
  }

  throw new Error(`${lastErr} (gave up after 4 attempts)`);
}

const backoff = (n) => Math.min(16000, 800 * 2 ** (n - 1));
const sleep   = (ms) => new Promise((r) => setTimeout(r, ms));

/* Bounded-concurrency worker pool. */
async function runPool(items, size, fn) {
  let next = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      await fn(items[i], i);
    }
  });
  await Promise.all(workers);
}

let done = 0;
function progress(_i, total, cueId, note) {
  done++;
  const pct = String(Math.round((done / total) * 100)).padStart(3);
  L.say(`  ${pct}%  ${cueId.padEnd(22)} ${note}`);
}

/* ─────────────────────────────────────────────────────────────
   Validation + apply + restore
   ───────────────────────────────────────────────────────────── */

function validateStaged(cues) {
  const problems = [];
  for (const c of cues) {
    const p = path.join(L.OUT_DIR, `${c.cueId}.mp3`);
    if (!fs.existsSync(p)) { problems.push(`${c.cueId}: missing from staging`); continue; }

    const buf = fs.readFileSync(p);
    if (buf.length < L.MIN_CLIP_BYTES) {
      problems.push(`${c.cueId}: only ${buf.length} bytes — almost certainly a failed synthesis`);
      continue;
    }

    const d = L.mp3Duration(buf);
    if (d == null) {
      problems.push(`${c.cueId}: no MP3 frame header found — file is not valid MP3`);
    } else if (d > L.MAX_CLIP_SECONDS) {
      problems.push(`${c.cueId}: ${d.toFixed(1)}s exceeds the ${L.MAX_CLIP_SECONDS}s hard limit — the ` +
                    `mount-chain fallback timeout (js/content/voiceovers.js:282) can cut it off. Shorten ` +
                    `the line in VO-narration.md, add a shorter rewrite to overrides.json, or raise ` +
                    `voiceSettings.speed.`);
    } else if (d > L.WARN_CLIP_SECONDS) {
      L.warn(`${c.cueId}: ${d.toFixed(1)}s — over the ~${L.WARN_CLIP_SECONDS}s the engine documents (voiceovers.js:107)`);
    }
  }
  return problems;
}

function apply(cues, partial) {
  const stamp  = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backup = path.join(L.TOOL_DIR, `.backup-${stamp}`);
  L.assertSafeWrite(backup);
  fs.mkdirSync(backup, { recursive: true });

  let saved = 0;
  for (const c of cues) {
    const live = path.join(L.VO_DIR, `${c.cueId}.mp3`);
    if (fs.existsSync(live)) { fs.copyFileSync(live, path.join(backup, `${c.cueId}.mp3`)); saved++; }
  }
  L.ok(`Backed up ${saved} existing clip(s) to tools/vo/.backup-${stamp}/`);

  fs.mkdirSync(L.VO_DIR, { recursive: true });
  for (const c of cues) {
    const src = path.join(L.OUT_DIR, `${c.cueId}.mp3`);
    const dst = path.join(L.VO_DIR, `${c.cueId}.mp3`);
    L.assertSafeWrite(dst);
    fs.copyFileSync(src, dst);
  }

  L.say('');
  L.ok(`Replaced ${cues.length} clip(s) in assets/sounds/vo/`);

  if (partial) {
    L.say('');
    L.warn('PARTIAL RUN — only the selected cues were replaced. The rest of the module is');
    L.warn('still the previous voice, so narration will switch voices mid-lesson.');
    L.warn('Run without --only/--screen to make the whole module one voice.');
  }

  L.say('');
  L.info('Next:');
  L.say('    node tools/vo/verify.js          # full integrity + duration report');
  L.say('    git status                       # review, then commit the mp3s');
  L.say(`    node tools/vo/generate.js --restore .backup-${stamp}   # roll back`);
}

function restore(dirName) {
  const dir = path.isAbsolute(dirName) ? dirName : path.join(L.TOOL_DIR, dirName);
  if (!fs.existsSync(dir)) {
    const found = fs.readdirSync(L.TOOL_DIR).filter((d) => d.startsWith('.backup-'));
    L.die(`Backup "${dirName}" not found.` +
          (found.length ? `\n  Available: ${found.join(', ')}` : '\n  No backups exist yet.'));
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mp3'));
  if (!files.length) L.die(`Backup "${dirName}" contains no MP3s.`);

  for (const f of files) {
    const dst = path.join(L.VO_DIR, f);
    L.assertSafeWrite(dst);
    fs.copyFileSync(path.join(dir, f), dst);
  }
  L.ok(`Restored ${files.length} clip(s) from ${path.basename(dir)} into assets/sounds/vo/`);
}

function usage() {
  L.say(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^\/\*|^ \* ?|^ ?\*/gm, ''));
}

main().catch((e) => L.die(e && e.stack ? e.stack : String(e)));
