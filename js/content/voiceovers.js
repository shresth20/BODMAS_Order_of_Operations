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

  return { play: play, stop: stop, schedule: schedule, speak: speak };
}());
