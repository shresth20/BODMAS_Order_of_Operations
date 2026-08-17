/* tools/vo/lib.js — shared helpers for the VO regeneration tooling.
 *
 * This directory is BUILD-TIME TOOLING ONLY. Nothing here ships to the browser
 * and nothing here is loaded by the game. The single contract with the game is
 * the file layout it already expects (js/content/voiceovers.js:7,41):
 *
 *     assets/sounds/vo/<cueId>.mp3
 *
 * Source of truth for cue IDs and spoken text is VO-narration.md at repo root,
 * exactly as js/content/voiceovers.js states in its header comment.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT       = path.resolve(__dirname, '..', '..');
const TABLE_PATH = path.join(ROOT, 'VO-narration.md');
const VO_DIR     = path.join(ROOT, 'assets', 'sounds', 'vo');
const TOOL_DIR   = __dirname;
const OUT_DIR    = path.join(TOOL_DIR, '.out');
const OVERRIDES  = path.join(TOOL_DIR, 'overrides.json');

/* Playback engine limits — see js/content/voiceovers.js:
   - line 107 comment asserts "no clip in this module exceeds ~15s". That is the
     design intent, so 15 s is a WARNING. (The shipped s9_3_recap is 18.6 s, so
     it is already only an intent, not an invariant.)
   - line 282: when a clip's metadata never loads, the mount-chain safety
     timeout falls back to a hard 20 s and advances to the next clip. A clip
     longer than that can be cut off on a slow/blocked network, so 20 s is a
     hard FAILURE.
   - line 109: the input-gate watchdog force-releases at 25 s. */
const MAX_CLIP_SECONDS  = 20;
const WARN_CLIP_SECONDS = 15;
const MIN_CLIP_BYTES    = 2048;   /* below this the API almost certainly errored */

/* ─────────────────────────────────────────────────────────────
   Console helpers (no deps, no colour libs)
   ───────────────────────────────────────────────────────────── */

const C = process.stdout.isTTY
  ? { dim: '\x1b[2m', red: '\x1b[31m', grn: '\x1b[32m', yel: '\x1b[33m', cyn: '\x1b[36m', b: '\x1b[1m', x: '\x1b[0m' }
  : { dim: '', red: '', grn: '', yel: '', cyn: '', b: '', x: '' };

const say  = (m) => console.log(m);
const info = (m) => console.log(`${C.cyn}·${C.x} ${m}`);
const ok   = (m) => console.log(`${C.grn}✓${C.x} ${m}`);
const warn = (m) => console.log(`${C.yel}!${C.x} ${m}`);
const bad  = (m) => console.log(`${C.red}✗${C.x} ${m}`);

/* Fail loudly — CLAUDE.md §8. Never swallow a tooling error. */
function die(msg) {
  bad(msg);
  process.exit(1);
}

/* ─────────────────────────────────────────────────────────────
   VO-narration.md parsing
   ───────────────────────────────────────────────────────────── */

function splitRow(line) {
  /* Trim the leading/trailing pipes, then split. Cell text in this table never
     contains an escaped pipe; if that ever changes this will need a real
     tokeniser rather than a split. */
  const t = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return t.split('|').map((c) => c.trim());
}

function isSeparatorRow(cells) {
  return cells.length > 1 && cells.every((c) => /^:?-{2,}:?$/.test(c));
}

/**
 * Parse VO-narration.md into an ordered cue list.
 * Column positions are resolved from each table's header row rather than
 * hard-coded, so re-ordering columns in the doc does not break the tool.
 *
 * @returns {Array<{cueId,file,text,trigger,screen,notes,line}>}
 */
function parseTable() {
  if (!fs.existsSync(TABLE_PATH)) die(`VO-narration.md not found at ${TABLE_PATH}`);

  const lines = fs.readFileSync(TABLE_PATH, 'utf8').split(/\r?\n/);
  const cues  = [];
  const seen  = new Map();

  let screen = '(none)';
  let cols   = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) { screen = heading[1]; cols = null; continue; }

    if (!/^\s*\|/.test(line)) { cols = null; continue; }

    const cells = splitRow(line);
    if (isSeparatorRow(cells)) continue;

    /* Header row of a cue table? */
    const lower = cells.map((c) => c.toLowerCase());
    if (lower.includes('cue id') && lower.includes('vo text')) {
      cols = {
        cueId:   lower.indexOf('cue id'),
        file:    lower.indexOf('file'),
        text:    lower.indexOf('vo text'),
        trigger: lower.indexOf('trigger'),
        notes:   lower.indexOf('notes')
      };
      continue;
    }

    /* The Summary table at the top has no "Cue ID" column, so cols stays null
       and its rows are skipped. */
    if (!cols) continue;

    const cueId = cells[cols.cueId] || '';
    if (!/^s\d+_\d+_[a-z0-9_]+$/.test(cueId)) continue;

    const text = (cells[cols.text] || '').trim();
    if (!text) die(`VO-narration.md:${i + 1} — cue "${cueId}" has empty VO Text`);

    const file = (cells[cols.file] || `${cueId}.mp3`).trim();
    if (file !== `${cueId}.mp3`) {
      die(`VO-narration.md:${i + 1} — File "${file}" does not match Cue ID "${cueId}". ` +
          `The game derives filenames from cue IDs (js/content/voiceovers.js:41), so they must agree.`);
    }

    if (seen.has(cueId)) {
      die(`VO-narration.md:${i + 1} — duplicate cue ID "${cueId}" (first seen at line ${seen.get(cueId)})`);
    }
    seen.set(cueId, i + 1);

    cues.push({
      cueId,
      file,
      text,
      trigger: cols.trigger >= 0 ? cells[cols.trigger] : '',
      notes:   cols.notes   >= 0 ? cells[cols.notes]   : '',
      screen,
      line: i + 1
    });
  }

  if (!cues.length) die('VO-narration.md parsed to zero cues — the table format changed. Fix the parser before generating.');
  return cues;
}

/* ─────────────────────────────────────────────────────────────
   Text preparation
   ───────────────────────────────────────────────────────────── */

function loadOverrides() {
  if (!fs.existsSync(OVERRIDES)) die(`overrides.json not found at ${OVERRIDES}`);
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(OVERRIDES, 'utf8'));
  } catch (e) {
    die(`overrides.json is not valid JSON: ${e.message}`);
  }
  return {
    cueText:       raw.cueText       || {},
    pronunciation: raw.pronunciation || {},
    voiceSettings: raw.voiceSettings || {},
    modelId:       raw.modelId       || 'eleven_multilingual_v2',
    outputFormat:  raw.outputFormat  || 'mp3_44100_128',
    seed:          typeof raw.seed === 'number' ? raw.seed : null
  };
}

/**
 * Turn a cue's table text into the exact string sent to the TTS API.
 *
 * 1. A per-cue override in overrides.json wins outright.
 * 2. Otherwise global pronunciation substitutions are applied.
 * 3. Any surviving [placeholder] is a hard error: VO-guideline.md §1 allows
 *    bracketed placeholders in the cue sheet, but a TTS engine would literally
 *    speak the brackets. Every one must be resolved in overrides.json.
 */
function prepareText(cue, ov) {
  let text = Object.prototype.hasOwnProperty.call(ov.cueText, cue.cueId)
    ? String(ov.cueText[cue.cueId])
    : cue.text;

  for (const [from, to] of Object.entries(ov.pronunciation)) {
    text = text.replace(new RegExp(`\\b${escapeRe(from)}\\b`, 'gi'), to);
  }

  const leftover = text.match(/\[[^\]]+\]/g);
  if (leftover) {
    die(`Cue "${cue.cueId}" (VO-narration.md:${cue.line}) still contains ${leftover.join(', ')}.\n` +
        `  A placeholder would be spoken aloud verbatim. Add a rewrite under "cueText" in\n` +
        `  tools/vo/overrides.json, e.g.  "${cue.cueId}": "…rewritten line…"`);
  }

  return text.replace(/\s+/g, ' ').trim();
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/* ─────────────────────────────────────────────────────────────
   MP3 duration (CBR frame-header maths — no external decoder)
   ───────────────────────────────────────────────────────────── */

const BR_V1_L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const BR_V2_L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
const SR_TABLE = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };

/**
 * Duration in seconds, or null if no frame header could be found.
 * ElevenLabs emits constant-bitrate MP3, so bytes ÷ bitrate is exact enough
 * for a length guard (we only need to know "is this clip under 15 s?").
 */
function mp3Duration(buf) {
  let off = 0;

  if (buf.length > 10 && buf.toString('latin1', 0, 3) === 'ID3') {
    off = 10 + (((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f));
  }

  const limit = Math.min(buf.length - 4, off + 65536);
  for (let i = off; i < limit; i++) {
    if (buf[i] !== 0xff || (buf[i + 1] & 0xe0) !== 0xe0) continue;

    const ver   = (buf[i + 1] >> 3) & 0x03;   /* 3=MPEG1 2=MPEG2 0=MPEG2.5 */
    const layer = (buf[i + 1] >> 1) & 0x03;   /* 1=Layer III */
    const brIdx = (buf[i + 2] >> 4) & 0x0f;
    const srIdx = (buf[i + 2] >> 2) & 0x03;

    if (ver === 1 || layer !== 1 || brIdx === 0 || brIdx === 15 || srIdx === 3) continue;
    if (!SR_TABLE[ver]) continue;

    const kbps = (ver === 3 ? BR_V1_L3 : BR_V2_L3)[brIdx];
    if (!kbps) continue;

    return (buf.length - i) * 8 / (kbps * 1000);
  }
  return null;
}

function fmtSec(s) { return s == null ? '  ?  ' : `${s.toFixed(1)}s`.padStart(6); }
function fmtKB(b)  { return `${(b / 1024).toFixed(0)}KB`.padStart(6); }

/* ─────────────────────────────────────────────────────────────
   Config: env, .env.local, CLI args
   ───────────────────────────────────────────────────────────── */

/* Reads tools/vo/.env.local (gitignored) as KEY=VALUE lines. Env wins over
   the file, so CI can inject a key without touching disk. */
function loadDotEnv() {
  const p = path.join(TOOL_DIR, '.env.local');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m) continue;
    const val = m[2].replace(/^["']|["']$/g, '');
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { args._.push(a); continue; }
    const eq = a.indexOf('=');
    if (eq > -1) args[a.slice(2, eq)] = a.slice(eq + 1);
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) args[a.slice(2)] = argv[++i];
    else args[a.slice(2)] = true;
  }
  return args;
}

/* Never print a key. Used only in diagnostics. */
function maskKey(k) {
  if (!k) return '(unset)';
  return k.length <= 8 ? '****' : `${k.slice(0, 4)}…${k.slice(-4)}`;
}

/* ─────────────────────────────────────────────────────────────
   Path guard — this tool may only ever write inside these two dirs
   ───────────────────────────────────────────────────────────── */

function assertSafeWrite(target) {
  const abs = path.resolve(target);
  const allowed = [VO_DIR, TOOL_DIR].map((d) => path.resolve(d) + path.sep);
  if (!allowed.some((d) => abs.startsWith(d))) {
    die(`Refusing to write outside assets/sounds/vo or tools/vo: ${abs}`);
  }
}

module.exports = {
  ROOT, TABLE_PATH, VO_DIR, TOOL_DIR, OUT_DIR, OVERRIDES,
  MAX_CLIP_SECONDS, WARN_CLIP_SECONDS, MIN_CLIP_BYTES,
  C, say, info, ok, warn, bad, die,
  parseTable, loadOverrides, prepareText,
  mp3Duration, fmtSec, fmtKB,
  loadDotEnv, parseArgs, maskKey, assertSafeWrite
};
