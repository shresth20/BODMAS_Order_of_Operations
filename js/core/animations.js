/* Anime.js animation functions — accept DOM elements, return anime instances */

var animeAvailable = (typeof anime !== 'undefined');

function animeFallback() { return { finished: Promise.resolve() }; }

/* ── Content-asset helpers ──────────────────────────────────────────────
   "Content assets" are the meaningful images on a page (classroom
   backgrounds, character images, guide avatars, illustrative visuals).
   Feedback GIFs and the hand-nudge live outside content-area or carry
   their own animation, so they are excluded.
──────────────────────────────────────────────────────────────────────── */
function _contentAssets(el) {
  if (!el) return [];
  return Array.prototype.slice.call(
    el.querySelectorAll('img:not(.feedback-char-gif)')
  );
}

/* Returns all .content-deco elements that are currently display:block */
function _visibleDecos() {
  return Array.prototype.filter.call(
    document.querySelectorAll('.content-deco'),
    function (d) { return window.getComputedStyle(d).display !== 'none'; }
  );
}

var _reducedMotion = typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Content-deco layer appear animation ────────────────────────────────
   A MutationObserver on #content-area watches for page swaps. When CSS
   :has() makes new .content-deco elements visible (display:block), it
   sets them to opacity:0 before the next paint, then stagger-fades them
   in. Runs synchronously as a microtask so there is no visible flash.
──────────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  var area = document.getElementById('content-area');
  if (!area) return;

  var _prevActive = [];

  new MutationObserver(function () {
    if (!animeAvailable) return;

    var active  = _visibleDecos();
    var appeared = active.filter(function (d) { return _prevActive.indexOf(d) === -1; });

    if (appeared.length) {
      anime.set(appeared, {
        opacity:    0,
        scale:      _reducedMotion ? 1 : 0.86,
        translateY: _reducedMotion ? 0 : 16
      });
      anime({
        targets:    appeared,
        opacity:    1,
        scale:      1,
        translateY: 0,
        duration:   _reducedMotion ? 280 : 500,
        delay:      anime.stagger(90, { start: 160 }),
        easing:     _reducedMotion ? 'linear' : 'easeOutBack'
      });
    }

    _prevActive = active;
  }).observe(area, { childList: true });
});

/* ── Screen transitions ─────────────────────────────────────────────── */

function animateScreenIn(el) {
  if (!el) return animeFallback();

  /* Pre-set content assets to invisible so they can animate in separately */
  var assets = _contentAssets(el);
  if (assets.length && animeAvailable) {
    anime.set(assets, { opacity: 0, scale: _reducedMotion ? 1 : 0.88 });
  }

  if (!animeAvailable) {
    el.style.opacity    = '1';
    el.style.transform  = '';
    assets.forEach(function (a) { a.style.opacity = '1'; a.style.transform = ''; });
    return animeFallback();
  }

  /* Container enters */
  var containerAnim = anime({
    targets:  el,
    opacity:  [0, 1],
    translateY: [18, 0],
    duration: 380,
    easing:   'easeOutQuad'
  });

  /* Assets stagger in after the container is visible */
  if (assets.length) {
    if (_reducedMotion) {
      anime({ targets: assets, opacity: [0, 1], duration: 300, delay: anime.stagger(60, { start: 220 }) });
    } else {
      anime({
        targets:    assets,
        opacity:    [0, 1],
        scale:      [0.88, 1],
        translateY: [14, 0],
        duration:   440,
        delay:      anime.stagger(80, { start: 220 }),
        easing:     'easeOutBack'
      });
    }
  }

  return containerAnim;
}

function animateScreenOut(el) {
  if (!el || !animeAvailable) return animeFallback();

  /* Animate assets out first — they exit slightly ahead of the container */
  var assets = _contentAssets(el);
  if (assets.length) {
    anime({
      targets:  assets,
      opacity:  [1, 0],
      scale:    _reducedMotion ? 1 : [1, 0.84],
      duration: 160,
      easing:   'easeInQuad'
    });
  }

  /* Container exits */
  return anime({
    targets:    el,
    opacity:    [1, 0],
    translateY: [0, -10],
    duration:   200,
    easing:     'easeInQuad'
  });
}

function animateExploreHighlight(exprEl, highlightText) {
  if (!exprEl || !highlightText) return animeFallback();
  var text = exprEl.textContent;
  var idx = text.indexOf(highlightText);
  if (idx === -1) return animeFallback();

  var before = document.createTextNode(text.slice(0, idx));
  var span   = document.createElement('span');
  span.className = 'step-highlight';
  span.textContent = highlightText;
  var after  = document.createTextNode(text.slice(idx + highlightText.length));

  exprEl.textContent = '';
  exprEl.appendChild(before);
  exprEl.appendChild(span);
  exprEl.appendChild(after);

  if (!animeAvailable) return animeFallback();
  return anime({
    targets: span,
    scale: [1, 1.08, 1],
    duration: 500,
    easing: 'easeOutBack'
  });
}

function animateExploreResolve(exprEl, newText) {
  if (!exprEl) return animeFallback();
  if (!animeAvailable) {
    exprEl.textContent = newText;
    return animeFallback();
  }
  var tl = anime.timeline({ easing: 'easeOutQuad' });
  tl.add({
    targets: exprEl,
    opacity: [1, 0],
    translateY: [0, -8],
    duration: 220
  }).add({
    targets: exprEl,
    duration: 1,
    complete: function() {
      exprEl.textContent = newText;
    }
  }).add({
    targets: exprEl,
    opacity: [0, 1],
    translateY: [8, 0],
    duration: 320
  });
  return tl;
}

function animateExploreAnnotation(annoEl) {
  if (!annoEl) return animeFallback();
  if (!animeAvailable) return animeFallback();
  return anime({
    targets: annoEl,
    opacity: [0, 1],
    translateY: [12, 0],
    duration: 340,
    easing: 'easeOutQuad'
  });
}

function animateCorrectCard(cardEl) {
  if (!cardEl) return;
  if (animeAvailable) {
    anime({
      targets: cardEl,
      scale: [1, 1.07, 1],
      duration: 480,
      easing: 'easeOutBack'
    });
  }
  cardEl.classList.add('card-correct-pulse');
}

function animateWrongCard(cardEl) {
  if (!cardEl) return;
  if (animeAvailable) {
    anime({
      targets: cardEl,
      translateX: [0, -9, 9, -7, 7, -4, 4, 0],
      duration: 500,
      easing: 'easeOutQuad'
    });
  } else {
    cardEl.classList.add('card-shake');
    setTimeout(function() { cardEl.classList.remove('card-shake'); }, 600);
  }
}
