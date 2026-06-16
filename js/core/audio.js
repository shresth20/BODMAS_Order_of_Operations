/* audio.js - file-based sounds, zero-delay preloaded */

var _audioCtx = null;
var _sounds   = {};

/* Preload all files immediately — browser fetches/decodes before first interaction */
(function() {
  try {
    var files = {
      click:   { src: 'assets/sounds/button-click.ogg',      vol: 1.0 },
      correct: { src: 'assets/sounds/correct-answer.ogg',    vol: 1.0 },
      wrong:   { src: 'assets/sounds/incorrect-answer.ogg',  vol: 1.0 },
      /* ── Section 1.0 background audio ── */
      s1_chime: { src: 'assets/sounds/intro-chime.ogg',      vol: 0.18 }
    };
    Object.keys(files).forEach(function(k) {
      var a = new Audio(files[k].src);
      a.preload = 'auto';
      a.volume  = files[k].vol;
      a.load();
      _sounds[k] = a;
    });
  } catch(e) {}
})();

/* Single capture-phase listener — plays click sound on every button press */
document.addEventListener('click', function(e) {
  if (e.target.closest('button')) _playSound(_sounds.click);
}, true);

/* Called on first submit — creates AudioContext for playComplete tones */
function initAudio() {
  if (_audioCtx) return;
  try {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch(e) { _audioCtx = null; }
}

function _playSound(snd) {
  if (!snd) return;
  try {
    snd.currentTime = 0;
    snd.play().catch(function() {});
  } catch(e) {}
}

function _playTone(freq, type, duration, gainVal) {
  if (!_audioCtx) return;
  try {
    var osc  = _audioCtx.createOscillator();
    var gain = _audioCtx.createGain();
    osc.connect(gain);
    gain.connect(_audioCtx.destination);
    osc.type            = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainVal || 0.18, _audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + duration);
    osc.start(_audioCtx.currentTime);
    osc.stop(_audioCtx.currentTime + duration);
  } catch(e) {}
}

function playCorrect() { _playSound(_sounds.correct); }
function playWrong()   { _playSound(_sounds.wrong); }

function playStarPop() {
  if (!_audioCtx) initAudio();
  _playTone(880, 'triangle', 0.12, 0.15);
}

function playComplete() {
  if (!_audioCtx) initAudio();
  var notes = [262, 330, 392, 523];
  notes.forEach(function(freq, i) {
    setTimeout(function() { _playTone(freq, 'triangle', 0.22, 0.18); }, i * 110);
  });
}

function playTick() {
  if (!_audioCtx) initAudio();
  _playTone(1200, 'sine', 0.10, 0.06);
}

function playFootstep() {
  if (!_audioCtx) initAudio();
  _playTone(80, 'triangle', 0.22, 0.18);
  setTimeout(function() { _playTone(120, 'triangle', 0.14, 0.12); }, 18);
}

function playStaircaseChime() {
  if (!_audioCtx) initAudio();
  _playTone(523, 'triangle', 0.20, 0.16);
  setTimeout(function() { _playTone(784, 'triangle', 0.22, 0.18); }, 160);
}

function playHintShimmer() {
  if (!_audioCtx) initAudio();
  _playTone(1600, 'sine', 0.08, 0.12);
  setTimeout(function() { _playTone(1200, 'sine', 0.06, 0.10); }, 80);
  setTimeout(function() { _playTone(960,  'sine', 0.04, 0.08); }, 160);
}

function playSweep() {
  if (!_audioCtx) initAudio();
  _playTone(220,  'sine', 0.10, 0.25);
  setTimeout(function() { _playTone(370,  'sine', 0.10, 0.22); }, 100);
  setTimeout(function() { _playTone(550,  'sine', 0.09, 0.18); }, 200);
  setTimeout(function() { _playTone(740,  'sine', 0.07, 0.14); }, 300);
  setTimeout(function() { _playTone(1000, 'sine', 0.05, 0.10); }, 400);
}

function playFlipWhoosh() {
  if (!_audioCtx) initAudio();
  _playTone(900, 'sine', 0.10, 0.18);
  setTimeout(function () { _playTone(600, 'sine', 0.08, 0.14); }, 120);
  setTimeout(function () { _playTone(380, 'sine', 0.06, 0.10); }, 240);
}

function playDescendingChime() {
  if (!_audioCtx) initAudio();
  _playTone(523, 'sine', 0.10, 0.25);
  setTimeout(function () { _playTone(392, 'sine', 0.10, 0.22); }, 160);
  setTimeout(function () { _playTone(330, 'sine', 0.09, 0.18); }, 320);
  setTimeout(function () { _playTone(262, 'sine', 0.08, 0.22); }, 480);
}

function playLightbulbDing() {
  if (!_audioCtx) initAudio();
  _playTone(1047, 'sine', 0.10, 0.35);
  setTimeout(function () { _playTone(1319, 'sine', 0.07, 0.25); }, 150);
}

function playOutroChime() {
  if (!_audioCtx) initAudio();
  _playTone(392, 'sine', 0.08, 0.30);
  setTimeout(function () { _playTone(523, 'sine', 0.08, 0.28); }, 200);
  setTimeout(function () { _playTone(659, 'sine', 0.07, 0.25); }, 400);
  setTimeout(function () { _playTone(784, 'sine', 0.06, 0.40); }, 600);
}

/* ── Section 1.0 background audio ───────────────────── */
function playIntroChime()  { _playSound(_sounds.s1_chime); }

/* ── Page 1.0 (new) — BODMAS welcome intro ─────────── */
function playStartWhoosh() {
  if (!_audioCtx) initAudio();
  _playTone(320, 'sine', 0.10, 0.20);
  setTimeout(function () { _playTone(520, 'sine', 0.09, 0.16); }, 80);
  setTimeout(function () { _playTone(800, 'sine', 0.07, 0.12); }, 180);
  setTimeout(function () { _playTone(1100, 'sine', 0.04, 0.08); }, 310);
}

/* ── Page 2.4 — Addition Practice ───────────────────── */
function playCountUpTick() {
  if (!_audioCtx) initAudio();
  _playTone(1400, 'sine', 0.06, 0.04);
}

function playHintPop() {
  if (!_audioCtx) initAudio();
  _playTone(660, 'triangle', 0.12, 0.14);
  setTimeout(function () { _playTone(880, 'triangle', 0.08, 0.10); }, 80);
}

/* ── Page 4.0 — Multiplication intro / exit ──────────── */
function playLevelUpDing() {
  if (!_audioCtx) initAudio();
  _playTone(523,  'triangle', 0.18, 0.22);
  setTimeout(function () { _playTone(659,  'triangle', 0.16, 0.20); }, 120);
  setTimeout(function () { _playTone(784,  'triangle', 0.14, 0.18); }, 240);
  setTimeout(function () { _playTone(1047, 'triangle', 0.18, 0.30); }, 380);
}

function playWhooshSoft() {
  if (!_audioCtx) initAudio();
  _playTone(600, 'sine', 0.12, 0.20);
  setTimeout(function () { _playTone(450, 'sine', 0.09, 0.18); }, 100);
  setTimeout(function () { _playTone(300, 'sine', 0.06, 0.14); }, 220);
  setTimeout(function () { _playTone(200, 'sine', 0.04, 0.12); }, 360);
}

/* ── Page 8.0 — tile slide-in ─────────────────────── */
function playTileSlide() {
  if (!_audioCtx) initAudio();
  _playTone(380, 'sine',     0.07, 0.14);
  setTimeout(function () { _playTone(540, 'sine',     0.06, 0.10); }, 80);
  setTimeout(function () { _playTone(720, 'triangle', 0.04, 0.08); }, 160);
}
