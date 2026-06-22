/* animations.js - Anime.js animations for content pages.
   Depends on: anime (vendor/anime.min.js)
   Public: ContentAnimations.run(name) invokes _map[name](); each _map entry
   animates one page type and no-ops when anime is unavailable. */

var ContentAnimations = (function () {

  function run(name) {
    if (typeof _map[name] === 'function') _map[name]();
  }

  var _map = {

    /* ── Page 2.0 delayed — grid slides in after 2 s ── */
    gridAppear: function () {
      var grid = document.querySelector('.cp-place-grid');
      var hint = document.querySelector('.cp-tap-hint');
      if (typeof anime === 'undefined') {
        if (grid) grid.style.opacity = '1';
        if (hint) hint.style.opacity = '1';
        return;
      }
      if (grid) {
        anime.set(grid, { opacity: 0, translateY: 16 });
        anime({ targets: grid, opacity: 1, translateY: 0, duration: 400, easing: 'easeOutQuad' });
      }
      if (hint) {
        anime.set(hint, { opacity: 0 });
        anime({ targets: hint, opacity: 1, duration: 300, delay: 220, easing: 'easeOutQuad' });
      }
    },

    /* ── Page 2.0 reveal — cards appear after correct tap ── */
    revealCardsAppear: function () {
      var cards = document.querySelectorAll('.cp-reveal-card');
      var log   = document.querySelector('.cp-micro-log');
      var btn   = document.querySelector('.cp-btn-primary');
      if (typeof anime === 'undefined') {
        cards.forEach(function (c) { c.style.opacity = '1'; });
        if (log) log.style.opacity = '1';
        if (btn) btn.style.opacity = '1';
        return;
      }
      if (cards.length) {
        anime.set(cards, { opacity: 0, translateY: 12, scale: 0.96 });
        anime({ targets: Array.prototype.slice.call(cards), opacity: 1, translateY: 0, scale: 1, duration: 380, delay: anime.stagger(80), easing: 'easeOutBack' });
      }
      if (log) {
        anime.set(log, { opacity: 0 });
        anime({ targets: log, opacity: 1, duration: 280, delay: 380, easing: 'easeOutQuad' });
      }
      if (btn) {
        anime.set(btn, { opacity: 0 });
        anime({ targets: btn, opacity: 1, duration: 280, delay: cards.length ? 420 : 200, easing: 'easeOutQuad' });
      }
    },

    /* ── Page 6.0 — apply-real-life 7-digit entrance ─── */
    section60Entrance: function () {
      var wrap = document.querySelector('.cp-arl');
      if (!wrap) return;

      var heading    = wrap.querySelector('.cp-arl-heading');
      var subtitle   = wrap.querySelector('.cp-arl-subtitle');
      var story      = wrap.querySelector('.cp-arl-story');
      var trophy     = wrap.querySelector('.cp-arl-trophy');
      var question   = wrap.querySelector('.cp-arl-question');
      var options    = Array.prototype.slice.call(wrap.querySelectorAll('.cp-arl-option'));
      var highlights = Array.prototype.slice.call(wrap.querySelectorAll('.cp-arl-story-highlight'));

      if (typeof anime === 'undefined') {
        [heading, subtitle, story, question].forEach(function (el) { if (el) el.style.opacity = '1'; });
        options.forEach(function (o) { o.style.opacity = '1'; });
        if (trophy) { trophy.style.opacity = '1'; trophy.classList.add('cp-arl-trophy--visible'); }
        return;
      }

      if (heading) {
        anime.set(heading, { opacity: 0, translateY: -16 });
        anime({ targets: heading, opacity: 1, translateY: 0, duration: 500, easing: 'easeOutQuad' });
      }
      if (subtitle) {
        anime.set(subtitle, { opacity: 0 });
        anime({ targets: subtitle, opacity: 1, duration: 400, delay: 500, easing: 'easeOutQuad' });
      }
      if (story) {
        anime.set(story, { opacity: 0, translateX: -60 });
        anime({
          targets: story, opacity: 1, translateX: 0, duration: 700, delay: 1000, easing: 'easeOutBack',
          complete: function () {
            if (highlights.length) {
              anime({
                targets: highlights,
                backgroundColor: ['rgba(255,210,60,0.20)', 'rgba(255,210,60,0.72)'],
                duration: 500, direction: 'alternate', loop: 2, easing: 'easeInOutSine'
              });
            }
          }
        });
      }
      if (trophy) {
        anime.set(trophy, { opacity: 0, scale: 0 });
        anime({
          targets: trophy, opacity: 1, scale: 1, duration: 420, delay: 1800, easing: 'easeOutBack',
          complete: function () { trophy.classList.add('cp-arl-trophy--visible'); }
        });
      }
      if (question) {
        anime.set(question, { opacity: 0, scale: 0.9 });
        anime({ targets: question, opacity: 1, scale: 1, duration: 400, delay: 2000, easing: 'easeOutBack' });
      }
      if (options.length) {
        anime.set(options, { opacity: 0, scale: 0.85, translateY: 24 });
        anime({
          targets: options, opacity: 1, scale: 1, translateY: 0,
          duration: 380, delay: anime.stagger(200, { start: 2600 }), easing: 'easeOutBack',
          complete: function () {
            anime({
              targets: options, scale: [1, 1.03, 1],
              duration: 1400, loop: true, easing: 'easeInOutSine'
            });
          }
        });
      }
    },

    bodmasTry: function () {
      var tiles = Array.prototype.slice.call(document.querySelectorAll('.cp-bt-tile'));
      if (!tiles.length) return;

      if (typeof anime === 'undefined') {
        tiles.forEach(function (t) { t.style.opacity = '1'; });
        return;
      }

      anime.set(tiles, { opacity: 0, scale: 0.65, translateY: 20 });
      anime({
        targets: tiles,
        opacity: 1,
        scale: 1,
        translateY: 0,
        duration: 350,
        delay: anime.stagger(60, { start: 60 }),
        easing: 'easeOutBack',
        complete: function () {
          /* Subtle float idle on × tiles */
          var mulTiles = Array.prototype.slice.call(document.querySelectorAll('.cp-bt-tile--mul'));
          if (mulTiles.length && typeof anime !== 'undefined') {
            anime({
              targets: mulTiles,
              translateY: [0, -5, 0],
              duration: 2100,
              loop: true,
              easing: 'easeInOutSine',
              delay: anime.stagger(140)
            });
          }
        }
      });
    },

    mbsTry: function () {
      var tiles = Array.prototype.slice.call(document.querySelectorAll('.cp-bt-tile'));
      if (!tiles.length) return;

      if (typeof anime === 'undefined') {
        tiles.forEach(function (t) { t.style.opacity = '1'; });
        return;
      }

      anime.set(tiles, { opacity: 0, scale: 0.65, translateY: 20 });
      anime({
        targets: tiles,
        opacity: 1,
        scale: 1,
        translateY: 0,
        duration: 350,
        delay: anime.stagger(60, { start: 60 }),
        easing: 'easeOutBack',
        complete: function () {
          var mulTiles = Array.prototype.slice.call(document.querySelectorAll('.cp-bt-tile--mul'));
          if (mulTiles.length && typeof anime !== 'undefined') {
            anime({
              targets: mulTiles,
              translateY: [0, -5, 0],
              duration: 2100,
              loop: true,
              easing: 'easeInOutSine',
              delay: anime.stagger(140)
            });
          }
        }
      });
    },

    /* ── Page 1.3 — l1-practice entrance ───────────── */
    l1PracticeEntrance: function () {
      var bar   = document.querySelector('.cp-l1p-progress-bar');
      var card  = document.querySelector('.cp-l1p-card');
      var inner = card ? [
        card.querySelector('.cp-l1p-card__label'),
        card.querySelector('.cp-l1p-card__expr'),
        card.querySelector('.cp-l1p-card__prompt'),
        card.querySelector('.cp-l1p-card__body')
      ].filter(Boolean) : [];

      if (typeof anime === 'undefined') {
        if (bar)  bar.style.opacity  = '1';
        if (card) card.style.opacity = '1';
        inner.forEach(function (el) { el.style.opacity = '1'; });
        return;
      }

      if (bar) {
        anime.set(bar, { opacity: 0, translateY: -8 });
        anime({ targets: bar, opacity: 1, translateY: 0, duration: 340, easing: 'easeOutQuad' });
      }
      if (card) {
        anime.set(card, { opacity: 0, scale: 0.88, translateY: 16 });
        anime({ targets: card, opacity: 1, scale: 1, translateY: 0, duration: 520, delay: 110, easing: 'easeOutBack' });
      }
      if (inner.length) {
        anime.set(inner, { opacity: 0, translateY: 10 });
        anime({
          targets: inner,
          opacity: 1, translateY: 0,
          duration: 320,
          delay: anime.stagger(80, { start: 380 }),
          easing: 'easeOutQuad'
        });
      }
    },

    /* ── Page 2.3 — l2-practice entrance ───────────── */
    l2PracticeEntrance: function () {
      var bar   = document.querySelector('.cp-l2p-progress-bar');
      var card  = document.querySelector('.cp-l2p-card');
      var inner = card ? [
        card.querySelector('.cp-l2p-card__label'),
        card.querySelector('.cp-l2p-card__expr'),
        card.querySelector('.cp-l2p-card__prompt'),
        card.querySelector('.cp-l2p-card__body')
      ].filter(Boolean) : [];

      if (typeof anime === 'undefined') {
        if (bar)  bar.style.opacity  = '1';
        if (card) card.style.opacity = '1';
        inner.forEach(function (el) { el.style.opacity = '1'; });
        return;
      }

      if (bar) {
        anime.set(bar, { opacity: 0, translateY: -8 });
        anime({ targets: bar, opacity: 1, translateY: 0, duration: 340, easing: 'easeOutQuad' });
      }
      if (card) {
        anime.set(card, { opacity: 0, scale: 0.88, translateY: 16 });
        anime({ targets: card, opacity: 1, scale: 1, translateY: 0, duration: 520, delay: 110, easing: 'easeOutBack' });
      }
      if (inner.length) {
        anime.set(inner, { opacity: 0, translateY: 10 });
        anime({
          targets: inner,
          opacity: 1, translateY: 0,
          duration: 320,
          delay: anime.stagger(80, { start: 380 }),
          easing: 'easeOutQuad'
        });
      }
    },

    /* ── Page 3.3 — l3-practice entrance ───────────── */
    l3PracticeEntrance: function () {
      var bar   = document.querySelector('.cp-l3p-progress-bar');
      var card  = document.querySelector('.cp-l3p-card');
      var inner = card ? [
        card.querySelector('.cp-l3p-card__label'),
        card.querySelector('.cp-l3p-card__expr'),
        card.querySelector('.cp-l3p-card__prompt'),
        card.querySelector('.cp-l3p-card__body')
      ].filter(Boolean) : [];

      if (typeof anime === 'undefined') {
        if (bar)  bar.style.opacity  = '1';
        if (card) card.style.opacity = '1';
        inner.forEach(function (el) { el.style.opacity = '1'; });
        return;
      }

      if (bar) {
        anime.set(bar, { opacity: 0, translateY: -8 });
        anime({ targets: bar, opacity: 1, translateY: 0, duration: 340, easing: 'easeOutQuad' });
      }
      if (card) {
        anime.set(card, { opacity: 0, scale: 0.88, translateY: 16 });
        anime({ targets: card, opacity: 1, scale: 1, translateY: 0, duration: 520, delay: 110, easing: 'easeOutBack' });
      }
      if (inner.length) {
        anime.set(inner, { opacity: 0, translateY: 10 });
        anime({
          targets: inner,
          opacity: 1, translateY: 0,
          duration: 320,
          delay: anime.stagger(80, { start: 380 }),
          easing: 'easeOutQuad'
        });
      }
    },

    /* ── Page 4.3 — l4-practice entrance ───────────── */
    l4PracticeEntrance: function () {
      var bar   = document.querySelector('.cp-l4p-progress-bar');
      var card  = document.querySelector('.cp-l4p-card');
      var inner = card ? [
        card.querySelector('.cp-l4p-card__label'),
        card.querySelector('.cp-l4p-card__expr'),
        card.querySelector('.cp-l4p-card__prompt'),
        card.querySelector('.cp-l4p-card__body')
      ].filter(Boolean) : [];

      if (typeof anime === 'undefined') {
        if (bar)  bar.style.opacity  = '1';
        if (card) card.style.opacity = '1';
        inner.forEach(function (el) { el.style.opacity = '1'; });
        return;
      }

      if (bar) {
        anime.set(bar, { opacity: 0, translateY: -8 });
        anime({ targets: bar, opacity: 1, translateY: 0, duration: 340, easing: 'easeOutQuad' });
      }
      if (card) {
        anime.set(card, { opacity: 0, scale: 0.88, translateY: 16 });
        anime({ targets: card, opacity: 1, scale: 1, translateY: 0, duration: 520, delay: 110, easing: 'easeOutBack' });
      }
      if (inner.length) {
        anime.set(inner, { opacity: 0, translateY: 10 });
        anime({
          targets: inner,
          opacity: 1, translateY: 0,
          duration: 320,
          delay: anime.stagger(80, { start: 380 }),
          easing: 'easeOutQuad'
        });
      }
    },

    /* ── Page 5.3 — l5-practice entrance ───────────── */
    l5PracticeEntrance: function () {
      var bar   = document.querySelector('.cp-l5p-progress-bar');
      var card  = document.querySelector('.cp-l5p-card');
      var inner = card ? [
        card.querySelector('.cp-l5p-card__label'),
        card.querySelector('.cp-l5p-card__expr'),
        card.querySelector('.cp-l5p-card__prompt'),
        card.querySelector('.cp-l5p-card__body')
      ].filter(Boolean) : [];

      if (typeof anime === 'undefined') {
        if (bar)  bar.style.opacity  = '1';
        if (card) card.style.opacity = '1';
        inner.forEach(function (el) { el.style.opacity = '1'; });
        return;
      }

      if (bar) {
        anime.set(bar, { opacity: 0, translateY: -8 });
        anime({ targets: bar, opacity: 1, translateY: 0, duration: 340, easing: 'easeOutQuad' });
      }
      if (card) {
        anime.set(card, { opacity: 0, scale: 0.88, translateY: 16 });
        anime({ targets: card, opacity: 1, scale: 1, translateY: 0, duration: 520, delay: 110, easing: 'easeOutBack' });
      }
      if (inner.length) {
        anime.set(inner, { opacity: 0, translateY: 10 });
        anime({
          targets: inner,
          opacity: 1, translateY: 0,
          duration: 320,
          delay: anime.stagger(80, { start: 380 }),
          easing: 'easeOutQuad'
        });
      }
    },

    /* ── Page 6.3 — l6-practice entrance ───────────── */
    l6PracticeEntrance: function () {
      var bar   = document.querySelector('.cp-l6p-progress-bar');
      var card  = document.querySelector('.cp-l6p-card');
      var inner = card ? [
        card.querySelector('.cp-l6p-card__label'),
        card.querySelector('.cp-l6p-card__expr'),
        card.querySelector('.cp-l6p-card__prompt'),
        card.querySelector('.cp-l6p-card__body')
      ].filter(Boolean) : [];

      if (typeof anime === 'undefined') {
        if (bar)  bar.style.opacity  = '1';
        if (card) card.style.opacity = '1';
        inner.forEach(function (el) { el.style.opacity = '1'; });
        return;
      }

      if (bar) {
        anime.set(bar, { opacity: 0, translateY: -8 });
        anime({ targets: bar, opacity: 1, translateY: 0, duration: 340, easing: 'easeOutQuad' });
      }
      if (card) {
        anime.set(card, { opacity: 0, scale: 0.88, translateY: 16 });
        anime({ targets: card, opacity: 1, scale: 1, translateY: 0, duration: 520, delay: 110, easing: 'easeOutBack' });
      }
      if (inner.length) {
        anime.set(inner, { opacity: 0, translateY: 10 });
        anime({
          targets: inner,
          opacity: 1, translateY: 0,
          duration: 320,
          delay: anime.stagger(80, { start: 380 }),
          easing: 'easeOutQuad'
        });
      }
    },

    /* ── Page 9.0 — l9-nested-brackets entrance ─────────── */
    l9nbEntrance: function () {
      var card  = document.querySelector('.cp-l9nb-card');
      var inner = card ? [
        card.querySelector('.cp-l9nb-card__label'),
        card.querySelector('.cp-l9nb-card__prompt'),
        card.querySelector('.cp-l9nb-card__body')
      ].filter(Boolean) : [];

      if (typeof anime === 'undefined') {
        if (card) card.style.opacity = '1';
        inner.forEach(function (el) { el.style.opacity = '1'; });
        return;
      }

      if (card) {
        anime.set(card, { opacity: 0, scale: 0.88, translateY: 16 });
        anime({ targets: card, opacity: 1, scale: 1, translateY: 0, duration: 520, delay: 110, easing: 'easeOutBack' });
      }
      if (inner.length) {
        anime.set(inner, { opacity: 0, translateY: 10 });
        anime({
          targets: inner,
          opacity: 1, translateY: 0,
          duration: 320,
          delay: anime.stagger(80, { start: 380 }),
          easing: 'easeOutQuad'
        });
      }
    },

    /* ── Page 9.1 — l9-insert-brackets entrance ─────────── */
    l9ibEntrance: function () {
      var bar   = document.querySelector('.cp-l9ib-progress-bar');
      var card  = document.querySelector('.cp-l9ib-card');
      var inner = card ? [
        card.querySelector('.cp-l9ib-card__label'),
        card.querySelector('.cp-l9ib-card__title'),
        card.querySelector('.cp-l9ib-card__prompt'),
        card.querySelector('.cp-l9ib-card__body')
      ].filter(Boolean) : [];

      if (typeof anime === 'undefined') {
        if (bar)  bar.style.opacity  = '1';
        if (card) card.style.opacity = '1';
        inner.forEach(function (el) { el.style.opacity = '1'; });
        return;
      }

      if (bar) {
        anime.set(bar, { opacity: 0, translateY: -8 });
        anime({ targets: bar, opacity: 1, translateY: 0, duration: 340, easing: 'easeOutQuad' });
      }
      if (card) {
        anime.set(card, { opacity: 0, scale: 0.88, translateY: 16 });
        anime({ targets: card, opacity: 1, scale: 1, translateY: 0, duration: 520, delay: 110, easing: 'easeOutBack' });
      }
      if (inner.length) {
        anime.set(inner, { opacity: 0, translateY: 10 });
        anime({
          targets: inner,
          opacity: 1, translateY: 0,
          duration: 320,
          delay: anime.stagger(80, { start: 380 }),
          easing: 'easeOutQuad'
        });
      }
    },

    /* ── Page 9.2 — l9-bodmas-review entrance ───────────── */
    l9brEntrance: function () {
      var card  = document.querySelector('.cp-l9br-card');
      var inner = card ? [
        card.querySelector('.cp-l9br-dots'),
        card.querySelector('.cp-l9br-counter'),
        card.querySelector('.cp-l9br-rule-banner'),
        card.querySelector('.cp-l9br-body')
      ].filter(Boolean) : [];

      if (typeof anime === 'undefined') {
        if (card) card.style.opacity = '1';
        inner.forEach(function (el) { el.style.opacity = '1'; });
        return;
      }

      if (card) {
        anime.set(card, { opacity: 0, scale: 0.88, translateY: 16 });
        anime({ targets: card, opacity: 1, scale: 1, translateY: 0, duration: 520, delay: 110, easing: 'easeOutBack' });
      }
      if (inner.length) {
        anime.set(inner, { opacity: 0, translateY: 10 });
        anime({
          targets: inner,
          opacity: 1, translateY: 0,
          duration: 320,
          delay: anime.stagger(80, { start: 380 }),
          easing: 'easeOutQuad'
        });
      }
    }

  };

  return { run: run };

}());
