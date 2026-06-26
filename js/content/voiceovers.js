/* voiceovers.js - File-based audio narration for content pages. */

var Narration = (function () {

  /* ── Source paths — fresh Audio created on every play ── */
  var _srcs = {
    'line_1_0_1':      'assets/voiceovers/1.0_Line_1.ogg',
    'line_1_0_2':      'assets/voiceovers/1.0_Line_2.ogg',
    'line_1_0_3':      'assets/voiceovers/1.0_Line_3.ogg',
    'line_1_0_4':      'assets/voiceovers/1.0_Line_4.ogg',
    /* ── Section 2 ── */

  };

  /* ── Preload hint — asks browser to cache files now ── */
  (function () {
    Object.keys(_srcs).forEach(function (k) {
      try {
        var a = new Audio(_srcs[k]);
        a.preload = 'auto';
        a.load();
      } catch (e) {}
    });
  }());

  var _current    = null;
  var _timers     = [];
  var _pendingKey = null;
  var _gen        = 0;   /* incremented on stop/play to cancel in-flight afterPrev chains */

  function _clearTimers() {
    _timers.forEach(function (t) { clearTimeout(t); });
    _timers = [];
  }

  function _stopCurrent() {
    if (_current) {
      try { _current.pause(); _current.currentTime = 0; } catch (e) {}
      _current = null;
    }
  }

  /* Always creates a fresh Audio element to avoid stale element failures.
     When called synchronously from a click handler it is within the
     user-gesture chain and browser autoplay policy always permits it. */
  function _tryPlay(key) {
    _stopCurrent();
    var src = _srcs[key];
    if (!src) return;
    var audio = new Audio(src);
    _current = audio;
    try {
      var p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {
          _current = null;
          if (_pendingKey === null) _pendingKey = key;
        });
      }
    } catch (e) {
      _current = null;
      if (_pendingKey === null) _pendingKey = key;
    }
  }

  /* First user interaction (capture phase) — replays a pending blocked key
     only if no game interaction (onTap) has already cleared it. */
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
    _clearTimers();
    _stopCurrent();
    _stopScreen();
    _pendingKey = null;
    _gen++;
  }

  /* Explicit one-shot play (wrong-tap, reveal, etc.). Cancels any schedule. */
  function play(key) {
    stop();
    _tryPlay(key);
  }

  /*
   * Schedule a sequence of voiceover entries:
   *
   *   { delay: 0,        file: 'key' }  — play immediately (synchronous; stays in gesture chain)
   *   { delay: N,        file: 'key' }  — play N ms after schedule() is called
   *   { afterPrev: N,    file: 'key' }  — play N ms after the PREVIOUS entry's audio ends
   *                                        (use this to chain narration without knowing durations)
   */
  function schedule(entries) {
    stop();
    var myGen    = _gen;
    var prevAudio = null;

    entries.forEach(function (entry) {
      var fileKey = entry.file;

      if (entry.afterPrev !== undefined) {
        /* Chain off previous audio's ended event */
        var gap  = entry.afterPrev;
        var prev = prevAudio;
        if (prev) {
          prev.addEventListener('ended', function () {
            if (_gen !== myGen) return;          /* stop() was called — abort */
            var t = setTimeout(function () {
              if (_gen !== myGen) return;
              _tryPlay(fileKey);
            }, gap);
            _timers.push(t);
          });
        } else {
          /* No previous audio — fall back to treating gap as absolute delay */
          var t = setTimeout(function () {
            if (_gen !== myGen) return;
            _tryPlay(fileKey);
          }, gap);
          _timers.push(t);
        }
        prevAudio = null;

      } else if (entry.delay === 0) {
        _tryPlay(fileKey);               /* synchronous — stays in gesture chain */
        prevAudio = _current;            /* capture so next afterPrev can chain off it */

      } else {
        var t = setTimeout(function () {
          if (_gen !== myGen) return;
          _tryPlay(fileKey);
        }, entry.delay);
        _timers.push(t);
        prevAudio = null;
      }
    });
  }

  function speak() {}

  /* ══════════════════════════════════════════════════════
     PER-SCREEN NARRATION  (one audio clip per content page)
     ──────────────────────────────────────────────────────
     Maps a page id (e.g. '1.0') to a single narration file. The clip
     auto-plays when the screen is shown; callers gate a forward button on
     the natural 'ended' event via the onEnded callback. Safe fallbacks
     (autoplay-block, load/play error, and a duration-based timeout) all
     resolve through the same onEnded so a bad file can never trap the user.
  ══════════════════════════════════════════════════════ */

  /* Single source of truth: screen id -> audio file. Editable / extensible —
     screens with no entry simply get no narration (button enabled normally). */
  var _screenSrcs = {
    '1.0': 'assets/voiceover/screen-1.0.mp3',
    '1.1': 'assets/voiceover/screen-1.1.mp3',
    '1.2': 'assets/voiceover/screen-1.2.mp3',
    '1.3': 'assets/voiceover/screen-1.3.mp3'
    /* ── Sections 2–9: add files here as they arrive ── */
  };

  var _screenCache   = {};   /* pageId -> preloaded Audio (prefetch) */
  var _playedScreens = {};   /* pageId -> true (no auto-replay on revisit) */
  var _screenAudio   = null; /* currently-playing screen narration */
  var _screenTimer   = null; /* safety-timeout handle */

  function _stopScreen() {
    if (_screenAudio) {
      try { _screenAudio.pause(); _screenAudio.currentTime = 0; } catch (e) {}
      _screenAudio = null;
    }
    if (_screenTimer) { clearTimeout(_screenTimer); _screenTimer = null; }
  }

  /* Warm the browser cache for a screen's clip so playback starts instantly. */
  function _prefetch(pageId) {
    var src = _screenSrcs[pageId];
    if (!src || _screenCache[pageId]) return;
    try {
      var a = new Audio(src);
      a.preload = 'auto';
      a.load();
      _screenCache[pageId] = a;
    } catch (e) {}
  }

  /* Play a screen's narration. opts: { onEnded, next }.
     onEnded fires exactly once — on natural end, error, autoplay-block, or
     the safety timeout — and is the caller's cue to enable the gated button. */
  function playScreen(pageId, opts) {
    opts = opts || {};
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      if (_screenTimer) { clearTimeout(_screenTimer); _screenTimer = null; }
      if (typeof opts.onEnded === 'function') opts.onEnded();
    }

    var src = _screenSrcs[pageId];

    /* No clip mapped, or already heard this screen → enable immediately. */
    if (!src || _playedScreens[pageId]) { finish(); return; }

    _stopScreen();
    var myGen = ++_gen;
    _playedScreens[pageId] = true;
    if (opts.next) _prefetch(opts.next);

    var audio = _screenCache[pageId] || new Audio(src);
    _screenCache[pageId] = audio;
    _screenAudio = audio;
    try { audio.currentTime = 0; } catch (e) {}

    audio.addEventListener('ended', function () {
      if (_gen !== myGen) return;   /* navigated away — abort */
      finish();
    }, { once: true });

    audio.addEventListener('error', function () {
      if (_gen !== myGen) return;
      console.warn('[Narration] audio error for screen ' + pageId + ' (' + src + ')');
      finish();
    }, { once: true });

    /* Safety timeout (fallback only): clip duration + buffer, or a hard cap
       if metadata never loads. Never the primary trigger — 'ended' is. */
    function _armTimeout() {
      if (_screenTimer) clearTimeout(_screenTimer);
      var ms = (isFinite(audio.duration) && audio.duration > 0)
        ? (audio.duration * 1000 + 1500)
        : 20000;
      _screenTimer = setTimeout(function () {
        if (_gen !== myGen) return;
        console.warn('[Narration] safety timeout for screen ' + pageId);
        finish();
      }, ms);
    }
    if (isFinite(audio.duration) && audio.duration > 0) {
      _armTimeout();
    } else {
      _armTimeout(); /* provisional 20s cap until metadata refines it */
      audio.addEventListener('loadedmetadata', function () {
        if (_gen !== myGen || done) return;
        _armTimeout();
      }, { once: true });
    }

    try {
      var p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {
          if (_gen !== myGen) return;
          console.warn('[Narration] playback blocked/failed for screen ' + pageId);
          finish();                         /* never trap the student behind a blocked clip */
          _armScreenRetry(pageId, myGen);   /* still try to play it on the next gesture */
        });
      }
    } catch (e) {
      if (_gen === myGen) {
        console.warn('[Narration] play() threw for screen ' + pageId, e);
        finish();
        _armScreenRetry(pageId, myGen);
      }
    }
  }

  /* If the first clip was autoplay-blocked, replay it on the next user gesture
     (the button is already enabled, so this only restores the missed audio). */
  function _armScreenRetry(pageId, gen) {
    var fn = function () {
      document.removeEventListener('click',      fn, true);
      document.removeEventListener('touchstart', fn, true);
      if (_gen !== gen) return;             /* navigated away — drop it */
      var a = _screenCache[pageId];
      if (!a) return;
      try { a.currentTime = 0; _screenAudio = a; a.play().catch(function () {}); } catch (e) {}
    };
    document.addEventListener('click',      fn, true);
    document.addEventListener('touchstart', fn, { capture: true, passive: true });
  }

  /* Eagerly warm the very first screen so it starts the instant 1.0 renders. */
  _prefetch('1.0');

  return {
    play: play, stop: stop, schedule: schedule, speak: speak,
    playScreen: playScreen
  };
}());
