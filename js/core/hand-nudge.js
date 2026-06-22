/* hand-nudge.js — Tap / drag gesture hint shown on page load.
   Disappears the moment the user touches any interactive element. */

var HandNudge = (function () {
  'use strict';

  var _img       = null;
  var _showTimer = null;
  var _hideTimer = null;
  var _observer  = null;

  /* px offset applied to the target centre so the hand image sits naturally
     on the element (≈ half the hand-image footprint) */
  var HAND_OFFSET_X = 35;
  var HAND_OFFSET_Y = 16;

  /* ── Selectors ───────────────────────────────────────────────────────── */

  var SEL_L8_TILE = '.cp-l8bl-tile';

  var SEL_DRAG_TILE = [
    '.cp-ds-tile:not(.cp-ds-tile--locked)',
    '.cp-dar-tile:not(.cp-dar-tile--locked)',
    '.cp-dp-tile:not(.cp-dp-tile--locked)',
    '.cp-sdp-tile:not(.cp-sdp-tile--locked)',
    '.cp-rr-tile:not(.cp-rr-tile--locked)'
  ].join(', ');

  var SEL_DRAG_SLOT = [
    '.cp-ds-slot:not(.cp-ds-slot--locked)',
    '.cp-dar-slot:not(.cp-dar-slot--locked)',
    '.cp-dp-slot:not(.cp-dp-slot--locked)',
    '.cp-sdp-slot:not(.cp-sdp-slot--locked)',
    '.cp-rr-slot:not(.cp-rr-slot--locked)'
  ].join(', ');

  /* The specific operator tile the student must tap first per level */
  var SEL_PRIORITY_OP = [
    '.cp-l1l-tile--mul-op',
    '.cp-l2l-tile--mul-op',
    '.cp-l3l-tile--div-op',
    '.cp-l4l-tile--sub-op',
    '.cp-l4l-tile--add-op',
    '.cp-l5l-tile--mul-op',
    '.cp-l5l-tile--div-op',
    '.cp-l6l-tile--mul-op'
  ].join(', ');

  /* All other tappable / clickable interactive elements */
  var SEL_TAPPABLE = [
    '[class*="l-tiles"] > button:not(:disabled)',
    '.cp-l9ib-gap',
    '.cp-digit-col--tappable',
    '.cp-hook-card:not(:disabled)',
    '.cp-rt-card:not(:disabled)',
    '.cp-ar-option',
    '.cp-btn-mission:not(:disabled)',
    '.cp-btn-intro:not(:disabled)',
    '.cp-btn-primary:not(:disabled)',
    '.cp-l8bl-check-btn:not(:disabled)',
    /* Practice pages (l1-practice … l6-practice) */
    '[class*="p-op-btn"]:not(:disabled)',
    '[class*="p-rule-opt"]:not(:disabled)',
    '[class*="p-choice-btn"]:not(:disabled)',
    '[class*="p-method-card"]:not(:disabled)'
  ].join(', ');

  /* ── Singleton image element ─────────────────────────────────────────── */

  function _getImg() {
    if (!_img) {
      _img = document.createElement('img');
      _img.className = 'hand-nudge';
      _img.src = 'assets/images/Swiftee-HandNudge.webp';
      _img.alt = '';
      _img.setAttribute('aria-hidden', 'true');
      _img.setAttribute('draggable', 'false');
      document.body.appendChild(_img);
    }
    return _img;
  }

  /* ── Dismiss helpers ─────────────────────────────────────────────────── */

  function hide() {
    clearTimeout(_hideTimer);
    if (_img) {
      _img.className = 'hand-nudge'; /* strips animation class → opacity:0 */
      _img.style.opacity = '0';
    }
    document.removeEventListener('pointerdown', hide, true);
    document.removeEventListener('touchstart',  hide, true);
  }

  function _armDismiss() {
    document.addEventListener('pointerdown', hide, { capture: true, once: true });
    document.addEventListener('touchstart',  hide, { capture: true, once: true, passive: true });
  }

  /* ── Tap animation ───────────────────────────────────────────────────── */

  function showTap(el) {
    if (!el) return;
    var rect = el.getBoundingClientRect();
    if (!rect.width && !rect.height) return;

    var hand = _getImg();
    hand.style.opacity = '';
    hand.style.left    = (rect.left + rect.width  * 0.5 - HAND_OFFSET_X) + 'px';
    hand.style.top     = (rect.top  + rect.height * 0.5 - HAND_OFFSET_Y) + 'px';
    hand.className     = 'hand-nudge hand-nudge--tap';

    _hideTimer = setTimeout(hide, 4600);
    _armDismiss();
  }

  /* ── Drag animation (anime.js) ───────────────────────────────────────── */

  function showDrag(fromEl, toEl) {
    if (!fromEl || !toEl) return;
    var fR = fromEl.getBoundingClientRect();
    var tR = toEl.getBoundingClientRect();
    if (!fR.width || !tR.width) return;

    /* Fall back to tap if anime is unavailable */
    if (typeof anime === 'undefined') { showTap(fromEl); return; }

    var hand = _getImg();
    var sx = fR.left + fR.width  * 0.5 - HAND_OFFSET_X;
    var sy = fR.top  + fR.height * 0.5 - HAND_OFFSET_Y;
    var ex = tR.left + tR.width  * 0.5 - HAND_OFFSET_X;
    var ey = tR.top  + tR.height * 0.5 - HAND_OFFSET_Y;

    hand.className     = 'hand-nudge hand-nudge--drag';
    hand.style.left    = sx + 'px';
    hand.style.top     = sy + 'px';
    hand.style.opacity = '0';

    anime({
      targets:   hand,
      keyframes: [
        { opacity: 1, top: sy,      left: sx, duration: 280, easing: 'easeOutQuad'   },
        { opacity: 1, top: sy + 10, left: sx, duration: 240, easing: 'easeInQuad'    },
        { opacity: 1, top: ey + 10, left: ex, duration: 680, easing: 'easeInOutQuad' },
        { opacity: 1, top: ey,      left: ex, duration: 200, easing: 'easeOutQuad'   },
        { opacity: 0, top: ey - 12, left: ex, duration: 340, delay: 260, easing: 'easeInQuad' }
      ],
      complete: function () {
        if (_img) _img.style.opacity = '0';
      }
    });

    _hideTimer = setTimeout(hide, 5200);
    _armDismiss();
  }

  /* ── Auto-detect the first interactive element ───────────────────────── */

  function _autoShow(area) {
    if (!area) return;

    /* 1. L8 BODMAS ladder — drag one tile onto another to reorder */
    var l8tiles = area.querySelectorAll(SEL_L8_TILE);
    if (l8tiles.length >= 2) {
      showDrag(l8tiles[0], l8tiles[1]);
      return;
    }

    /* 2. Generic drag-sort tiles with a matching empty slot */
    var tile = area.querySelector(SEL_DRAG_TILE);
    var slot = tile ? area.querySelector(SEL_DRAG_SLOT) : null;
    if (tile && slot) {
      showDrag(tile, slot);
      return;
    }

    /* 3. Priority operator (the specific op the student must tap first) */
    var opTile = area.querySelector(SEL_PRIORITY_OP);
    if (opTile) {
      showTap(opTile);
      return;
    }

    /* 4. Any other tappable element */
    var tap = area.querySelector(SEL_TAPPABLE);
    if (tap) showTap(tap);
  }

  /* ── Init — observe #content-area for page transitions ──────────────── */

  function init() {
    var area = document.getElementById('content-area');
    if (!area) return;

    _observer = new MutationObserver(function () {
      hide();
      clearTimeout(_showTimer);
      /* 900 ms: enough for page-enter animations (most are ≤ 650 ms) */
      _showTimer = setTimeout(function () { _autoShow(area); }, 900);
    });

    _observer.observe(area, { childList: true });

    /* Handle race where first page was already rendered before we init */
    if (area.children.length > 0) {
      _showTimer = setTimeout(function () { _autoShow(area); }, 900);
    }
  }

  return { init: init, showTap: showTap, showDrag: showDrag, hide: hide };

}());

document.addEventListener('DOMContentLoaded', function () { HandNudge.init(); });
