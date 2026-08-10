/* voiceovers.js - File-based audio narration for content pages.
   Cue keys, file names and triggers come from VO-narration.md (repo root):
   one MP3 per cue, all files in assets/sounds/vo/<cueId>.mp3. */

var Narration = (function () {

  var VO_DIR = 'assets/sounds/vo/';

  /* ── Cue keys — must match VO-narration.md exactly ─── */
  var _keys = (function () {
    var k = [];
    ['1', '2', '3', '4', '5', '6'].forEach(function (L) {
      /* SX.0 — intro */
      ['scenario', 'question'].forEach(function (s) { k.push('s' + L + '_0_' + s); });
      /* SX.1 — math lab */
      ['intro', 'wrong_tap', 'correct_tap', 'tap_finish', 'compare', 'next_round', 'complete']
        .forEach(function (s) { k.push('s' + L + '_1_' + s); });
      /* SX.2 — rule reveal */
      ['rule', 'worked', 'bodmas_tag'].forEach(function (s) { k.push('s' + L + '_2_' + s); });
      /* SX.3 — practice */
      ['q1', 'q1_correct', 'q1_wrong', 'q2', 'q2_correct', 'q2_wrong', 'q3', 'q3_correct', 'q3_wrong', 'complete']
        .forEach(function (s) { k.push('s' + L + '_3_' + s); });
    });
    /* S8.0 — BODMAS ladder */
    ['intro', 'wrong', 'correct', 'recite'].forEach(function (s) { k.push('s8_0_' + s); });
    /* S9.0 — nested brackets */
    ['intro', 'hint_middle', 'hint_last', 'wrong', 'step_correct', 'q_complete', 'next_q', 'complete']
      .forEach(function (s) { k.push('s9_0_' + s); });
    /* S9.1 — insert the brackets */
    ['intro', 'tap_close', 'wrong', 'correct', 'next', 'complete']
      .forEach(function (s) { k.push('s9_1_' + s); });
    /* S9.2 — final BODMAS review */
    ['intro', 'q1_correct', 'q2_correct', 'q3_correct', 'q4_correct', 'q5_correct', 'q6_correct', 'wrong', 'complete']
      .forEach(function (s) { k.push('s9_2_' + s); });
    /* S9.3 — champion results */
    ['champion', 'recap'].forEach(function (s) { k.push('s9_3_' + s); });
    return k;
  }());

  var _srcs = {};
  _keys.forEach(function (k) { _srcs[k] = VO_DIR + k + '.mp3'; });

  var _cache        = {};   /* key -> preloaded Audio */
  var _current      = null;
  var _pendingKey   = null;
  var _gen          = 0;    /* incremented on stop/play to cancel in-flight chains */
  var _playedMounts = {};   /* pageId -> true (mount cues fire on fresh entry only) */
  var _queued       = [];   /* keys waiting for the current clip/chain to end */
  var _mountActive  = false;/* a playMount chain is in progress */
  var _idleCbs      = [];   /* callbacks waiting for narration to go idle */

  /* ── Input gate: while narration speaks, user input is paused ───────────
     A transparent overlay swallows pointer input and Enter/Space activation
     until the current clip (and anything queued) finishes. It is released on
     ended/error/autoplay-block/stop, plus a watchdog, so a bad file can never
     lock the learner out. The narration itself stays supplementary — a muted
     device just sees the gate lift almost immediately (no audio => idle). */
  var _gateEl    = null;
  var _gateTimer = null;
  var _gateSince = 0;

  function _isIdle() {
    return !_mountActive && _queued.length === 0 &&
           (!_current || _current.paused || _current.ended);
  }

  function _gateKeydown(e) {
    if (_gateEl && _gateEl.parentNode && (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function _gateShow() {
    if (!_gateEl) {
      _gateEl = document.createElement('div');
      _gateEl.id = 'vo-input-gate';
      _gateEl.setAttribute('aria-hidden', 'true');
      _gateEl.style.cssText =
        'position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483000;' +
        'background:transparent;cursor:default;';
      document.addEventListener('keydown', _gateKeydown, true);
    }
    if (!_gateEl.parentNode) {
      document.body.appendChild(_gateEl);
      _gateSince = Date.now();
    }
    if (!_gateTimer) _gateTimer = setInterval(_syncGate, 400);
  }

  function _gateHide() {
    if (_gateEl && _gateEl.parentNode) _gateEl.parentNode.removeChild(_gateEl);
    if (_gateTimer) { clearInterval(_gateTimer); _gateTimer = null; }
  }

  /* Recompute gate + flush idle callbacks. Called after every state change
     and by the watchdog interval while the gate is up. */
  function _syncGate() {
    if (_isIdle()) {
      _gateHide();
      if (_idleCbs.length) {
        var cbs = _idleCbs;
        _idleCbs = [];
        cbs.forEach(function (cb) { try { cb(); } catch (e) {} });
      }
    } else {
      /* Watchdog: no clip in this module exceeds ~15s — a gate up for 25s
         means a wedged element. Release everything rather than trap input. */
      if (_gateEl && _gateEl.parentNode && Date.now() - _gateSince > 25000) {
        console.warn('[Narration] input gate watchdog fired — releasing');
        stop();
        return;
      }
      _gateShow();
    }
  }

  /* Run cb once narration is fully idle (current clip + queue + mount chain
     all done). Fires immediately if nothing is speaking. */
  function onIdle(cb) {
    if (typeof cb !== 'function') return;
    if (_isIdle()) { cb(); return; }
    _idleCbs.push(cb);
  }

  /* Warm the browser cache for one cue so playback starts instantly. */
  function _prefetch(key) {
    var src = _srcs[key];
    if (!src || _cache[key]) return;
    try {
      var a = new Audio(src);
      a.preload = 'auto';
      a.load();
      _cache[key] = a;
    } catch (e) {}
  }

  /* Prefetch every cue belonging to one page id (e.g. '1.1' -> s1_1_*). */
  function prefetchPage(pageId) {
    if (!pageId) return;
    var prefix = 's' + String(pageId).replace('.', '_') + '_';
    _keys.forEach(function (k) {
      if (k.indexOf(prefix) === 0) _prefetch(k);
    });
  }

  function _stopCurrent() {
    if (_current) {
      try { _current.pause(); _current.currentTime = 0; } catch (e) {}
      _current = null;
    }
  }

  /* Play the next queued cue, if any (see queue()). */
  function _drainQueue(myGen) {
    if (_gen !== myGen || !_queued.length) return;
    _tryPlay(_queued.shift());
  }

  /* Always creates/reuses an Audio element. When called synchronously from a
     click handler it is within the user-gesture chain and browser autoplay
     policy always permits it. */
  function _tryPlay(key) {
    _stopCurrent();
    var src = _srcs[key];
    if (!src) return;
    var audio = _cache[key] || new Audio(src);
    _cache[key] = audio;
    _current = audio;
    var myGen = _gen;
    audio.addEventListener('ended', function () { _drainQueue(myGen); _syncGate(); }, { once: true });
    audio.addEventListener('error', function () {
      if (_current === audio) _current = null;
      _drainQueue(myGen);
      _syncGate();
    }, { once: true });
    try {
      audio.currentTime = 0;
      var p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {
          if (_current === audio) _current = null;
          if (_pendingKey === null) _pendingKey = key;
          _drainQueue(myGen);
          _syncGate();
        });
      }
      _syncGate();
    } catch (e) {
      _current = null;
      if (_pendingKey === null) _pendingKey = key;
      _drainQueue(myGen);
      _syncGate();
    }
  }

  /* First user interaction (capture phase) — replays a pending blocked key. */
  function _onFirstInteraction() {
    document.removeEventListener('click',      _onFirstInteraction, true);
    document.removeEventListener('touchstart', _onFirstInteraction, true);
    setTimeout(function () {
      if (_pendingKey) {
        var key = _pendingKey;
        _pendingKey = null;
        _tryPlay(key);
      }
    }, 0);
  }
  document.addEventListener('click',      _onFirstInteraction, true);
  document.addEventListener('touchstart', _onFirstInteraction, { capture: true, passive: true });

  /* ── Public API ─────────────────────────────────────── */

  function stop() {
    _stopCurrent();
    _pendingKey = null;
    _queued = [];
    _mountActive = false;
    _gen++;
    _syncGate();
  }

  /* Explicit one-shot play (wrong tap, correct tap, reveal, etc.).
     Interrupts whatever is speaking — feedback beats narration. */
  function play(key) {
    stop();
    _tryPlay(key);
  }

  /* Play after the current clip (and anything already queued) ends, or
     immediately if idle. Use for chained reveal cues that must not cut off
     the clip before them. stop()/play() discards the queue. */
  function queue(key) {
    if (!_srcs[key]) return;
    if (_current && !_current.paused && !_current.ended) {
      _queued.push(key);
    } else {
      _tryPlay(key);
    }
  }

  /*
   * Play a screen's mount cue chain (one or more clips back to back).
   * Fires on fresh entry only — re-renders/revisits skip straight to onEnded.
   * opts: { onEnded, next }.
   * onEnded fires exactly once — after the last clip's natural end, or on
   * error / autoplay-block / safety timeout — so callers can gate a button
   * on it without ever trapping the learner behind a bad file.
   */
  function playMount(pageId, keys, opts) {
    opts = opts || {};
    var done  = false;
    var timer = null;

    function finish() {
      if (done) return;
      done = true;
      _mountActive = false;
      if (timer) { clearTimeout(timer); timer = null; }
      if (typeof opts.onEnded === 'function') opts.onEnded();
      _drainQueue(_gen);   /* cues queued while the chain spoke play now */
      _syncGate();
    }

    if (_playedMounts[pageId] || !keys || !keys.length) { finish(); return; }
    _playedMounts[pageId] = true;

    prefetchPage(pageId);
    if (opts.next) prefetchPage(opts.next);

    stop();
    _mountActive = true;   /* gate input across the whole chain, incl. gaps */
    _syncGate();
    var myGen = _gen;
    var idx   = 0;

    /* Safety timeout (fallback only): clip duration + buffer, or a hard cap
       if metadata never loads. Never the primary trigger — 'ended' is. */
    function _armTimeout(audio) {
      if (timer) clearTimeout(timer);
      var ms = (isFinite(audio.duration) && audio.duration > 0)
        ? (audio.duration * 1000 + 1500)
        : 20000;
      timer = setTimeout(function () {
        if (_gen !== myGen || done) return;
        console.warn('[Narration] safety timeout in mount chain for page ' + pageId);
        _playNext();
      }, ms);
      audio.addEventListener('loadedmetadata', function () {
        if (_gen !== myGen || done) return;
        _armTimeout(audio);
      }, { once: true });
    }

    function _playNext() {
      if (_gen !== myGen || done) return;
      if (idx >= keys.length) { finish(); return; }
      var key = keys[idx++];
      var src = _srcs[key];
      if (!src) { _playNext(); return; }

      var audio = _cache[key] || new Audio(src);
      _cache[key] = audio;
      _stopCurrent();
      _current = audio;
      try { audio.currentTime = 0; } catch (e) {}

      audio.addEventListener('ended', function () {
        if (_gen !== myGen) return;   /* navigated away — abort */
        _playNext();
      }, { once: true });

      audio.addEventListener('error', function () {
        if (_gen !== myGen) return;
        console.warn('[Narration] audio error for cue ' + key + ' (' + src + ')');
        _playNext();
      }, { once: true });

      _armTimeout(audio);

      try {
        var p = audio.play();
        if (p && typeof p.catch === 'function') {
          p.catch(function () {
            if (_gen !== myGen) return;
            console.warn('[Narration] playback blocked/failed for cue ' + key);
            var resumeFrom = idx - 1;   /* this key's index in the chain */
            finish();   /* never trap the student behind a blocked clip */
            _armMountRetry(keys, resumeFrom, myGen);
          });
        }
      } catch (e) {
        if (_gen === myGen) {
          console.warn('[Narration] play() threw for cue ' + key, e);
          var resumeFrom2 = idx - 1;
          finish();
          _armMountRetry(keys, resumeFrom2, myGen);
        }
      }
    }

    _playNext();
  }

  /* If a mount chain was autoplay-blocked, replay it from the blocked clip on
     the next user gesture (any gated button is already enabled, so this only
     restores the missed audio). The rest of the chain rides the drain queue. */
  function _armMountRetry(keys, fromIdx, gen) {
    var fn = function () {
      document.removeEventListener('click',      fn, true);
      document.removeEventListener('touchstart', fn, true);
      if (_gen !== gen) return;   /* navigated away or new audio started — drop it */
      _queued = keys.slice(fromIdx + 1).concat(_queued);
      _tryPlay(keys[fromIdx]);
    };
    document.addEventListener('click',      fn, true);
    document.addEventListener('touchstart', fn, { capture: true, passive: true });
  }

  function speak() {}

  /* Eagerly warm the very first screen so it starts the instant 1.0 renders. */
  prefetchPage('1.0');

  return {
    play: play, stop: stop, queue: queue, speak: speak,
    playMount: playMount, prefetchPage: prefetchPage, onIdle: onIdle
  };
}());
