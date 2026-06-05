/* animations.js - Anime.js animations for content pages.
   Depends on: anime (vendor/anime.min.js) */

var ContentAnimations = (function () {

  function run(name) {
    if (typeof _map[name] === 'function') _map[name]();
  }

  var _map = {

    /* ── Page 1.0 — welcome mission ─────────────────── */
    welcomeMission: function () {
      var wrap   = document.querySelector('.cp-welcome--mission');
      var ops    = wrap ? Array.prototype.slice.call(wrap.querySelectorAll('.cp-op-badge')) : [];
      var title  = wrap && wrap.querySelector('.cp-title--bubble');
      var sub    = wrap && wrap.querySelector('.cp-subtitle');
      var btn    = wrap && wrap.querySelector('.cp-btn-mission');

      /* ── Fallback: no anime.js ── */
      if (typeof anime === 'undefined') {
        ops.forEach(function (el)   { el.style.opacity = '1'; });
        if (title) title.style.opacity = '1';
        if (sub)   sub.style.opacity   = '1';
        if (btn) { btn.style.opacity = '1'; btn.classList.add('cp-btn-mission--pulse'); }
        return;
      }

      /* ── Sound: intro chime on screen load ── */
      if (typeof playIntroChime === 'function') playIntroChime();

      /* Step 2 — operator badges bounce-in with stagger (0.2s → 0.8s) */
      if (ops.length) {
        anime.set(ops, { opacity: 0, scale: 0.3 });
        anime({
          targets: ops,
          opacity: 1, scale: 1,
          duration: 500,
          delay: anime.stagger(150, { start: 200 }),
          easing: 'easeOutBack',
          complete: function () {
            /* Sound: soft tick after badges appear */
            if (typeof playTick === 'function') playTick();
            /* Step 6 — gentle ±5° wiggle loop every 4s */
            anime({
              targets: ops,
              rotate: [0, 5, -5, 0],
              duration: 400,
              delay: anime.stagger(80),
              easing: 'easeInOutSine',
              loop: true,
              loopDelay: 4000
            });
          }
        });
      }

      /* Step 3 — hero title fade-in + slide-down (0.9s) */
      if (title) {
        anime.set(title, { opacity: 0, translateY: -20 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 700, delay: 900, easing: 'easeOutQuad' });
      }

      /* Step 4 — subtitle fade-in + slide-up (1.6s) */
      if (sub) {
        anime.set(sub, { opacity: 0, translateY: 20 });
        anime({ targets: sub, opacity: 1, translateY: 0, duration: 600, delay: 1600, easing: 'easeOutQuad' });
      }

      /* Step 5 — button pop-in (2.4s), then glow-pulse loop */
      if (btn) {
        anime.set(btn, { opacity: 0, scale: 0.8 });
        anime({
          targets: btn, opacity: 1, scale: 1,
          duration: 500, delay: 2400, easing: 'easeOutBack',
          complete: function () { btn.classList.add('cp-btn-mission--pulse'); }
        });
      }
    },

    /* ── Page 1.0 (new) — BODMAS welcome intro ─────── */
    welcomeIntro: function () {
      var wrap    = document.querySelector('.cp-welcome--intro');
      if (!wrap) return;

      var badge   = wrap.querySelector('.cp-intro-badge');
      var title   = wrap.querySelector('.cp-intro-title');
      var sub     = wrap.querySelector('.cp-intro-sub');
      var heroSum = wrap.querySelector('.cp-hero-sum');
      var tagLeft = wrap.querySelector('.cp-answer-tag[data-side="left"]');
      var tagRight= wrap.querySelector('.cp-answer-tag[data-side="right"]');
      var caption = wrap.querySelector('.cp-intro-caption');
      var btn     = wrap.querySelector('.cp-btn-intro');

      if (typeof anime === 'undefined') {
        [badge, title, sub, heroSum, tagLeft, tagRight, caption, btn]
          .forEach(function (el) { if (el) el.style.opacity = '1'; });
        if (btn) btn.classList.add('cp-btn-intro--pulse');
        return;
      }

      if (typeof playIntroChime === 'function') playIntroChime();

      /* Step 1 — badge + title + subtitle slide-down (120ms stagger) */
      if (badge) { anime.set(badge, { opacity: 0 }); anime({ targets: badge, opacity: 1, duration: 400, easing: 'easeOutQuad' }); }
      [title, sub].forEach(function (el) { if (el) anime.set(el, { opacity: 0, translateY: -14 }); });
      anime({
        targets: [title, sub].filter(Boolean),
        opacity: 1, translateY: 0,
        duration: 500,
        delay: anime.stagger(120),
        easing: 'easeOutQuad'
      });

      /* Step 2 — hero sum scale-up pop + one soft glow pulse */
      if (heroSum) {
        anime.set(heroSum, { opacity: 0, scale: 0.85 });
        anime({
          targets: heroSum, opacity: 1, scale: 1,
          duration: 600, delay: 700, easing: 'easeOutBack',
          complete: function () {
            if (typeof playHintPop === 'function') playHintPop();
            heroSum.classList.add('cp-hero-sum--glow');
            setTimeout(function () { heroSum.classList.remove('cp-hero-sum--glow'); }, 650);
          }
        });
      }

      /* Step 3 — answer tags float in from each side, then gentle bob loop */
      function _bobLoop(el, delay) {
        anime({
          targets: el,
          translateY: [0, -7, 0],
          duration: 3000,
          delay: delay || 0,
          easing: 'easeInOutSine',
          loop: true
        });
      }
      if (tagLeft) {
        anime.set(tagLeft, { opacity: 0, translateX: -36 });
        anime({
          targets: tagLeft, opacity: 1, translateX: 0,
          duration: 600, delay: 1300, easing: 'easeOutBack',
          complete: function () {
            if (typeof playTick === 'function') playTick();
            _bobLoop(tagLeft, 0);
          }
        });
      }
      if (tagRight) {
        anime.set(tagRight, { opacity: 0, translateX: 36 });
        anime({
          targets: tagRight, opacity: 1, translateX: 0,
          duration: 600, delay: 1550, easing: 'easeOutBack',
          complete: function () {
            if (typeof playTick === 'function') playTick();
            _bobLoop(tagRight, 280);
          }
        });
      }

      /* Step 4 — caption fade-in */
      if (caption) {
        anime.set(caption, { opacity: 0 });
        anime({ targets: caption, opacity: 1, duration: 500, delay: 2100, easing: 'easeOutQuad' });
      }

      /* Step 5 — button fade-up, then breathing pulse */
      if (btn) {
        anime.set(btn, { opacity: 0, translateY: 14 });
        anime({
          targets: btn, opacity: 1, translateY: 0,
          duration: 500, delay: 2800, easing: 'easeOutBack',
          complete: function () { btn.classList.add('cp-btn-intro--pulse'); }
        });
      }
    },

    /* ── Page 1.1 — winner-reveal ───────────────────── */
    winnerReveal: function () {
      var card = document.querySelector('.cp-winner-card');

      if (typeof anime === 'undefined') {
        if (card) { card.style.opacity = '1'; card.style.transform = 'scale(1.2)'; }
        return;
      }

      if (card) {
        anime.set(card, { opacity: 0, scale: 0.82 });
        anime({ targets: card, opacity: 1, scale: 1.2, duration: 560, delay: 120, easing: 'easeOutBack' });
      }
    },

    /* ── Page 2.0 — ask-and-try entrance (State A) ──── */
    askAndTryEntrance: function () {
      var title    = document.querySelector('.cp-ask-and-try .cp-title');
      var subtitle = document.querySelector('.cp-ask-and-try .cp-aat-subtitle');
      var cardA    = document.querySelector('.cp-aat-card:first-child');
      var cardB    = document.querySelector('.cp-aat-card:last-child');
      var question = document.querySelector('.cp-aat-question');
      var btn      = document.querySelector('.cp-aat-lets-check');

      if (typeof anime === 'undefined') {
        [title, subtitle, cardA, cardB, question, btn].forEach(function (el) {
          if (el) el.style.opacity = '1';
        });
        return;
      }

      if (title) {
        anime.set(title, { opacity: 0, translateY: -14 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 500, easing: 'easeOutQuad' });
      }
      if (subtitle) {
        anime.set(subtitle, { opacity: 0 });
        anime({ targets: subtitle, opacity: 1, duration: 400, delay: 500, easing: 'easeOutQuad' });
      }
      if (cardA && cardB) {
        anime.set(cardA, { opacity: 0, scale: 0.88, translateY: 16 });
        anime.set(cardB, { opacity: 0, scale: 0.88, translateY: 16 });
        anime({ targets: cardA, opacity: 1, scale: 1, translateY: 0, duration: 480, delay: 900, easing: 'easeOutBack' });
        anime({ targets: cardB, opacity: 1, scale: 1, translateY: 0, duration: 480, delay: 1200, easing: 'easeOutBack' });
      }
      if (question) {
        anime.set(question, { opacity: 0, scale: 0.9 });
        anime({ targets: question, opacity: 1, scale: 1, duration: 500, delay: 1800, easing: 'easeOutQuad' });
      }
      if (btn) {
        anime.set(btn, { opacity: 0, translateY: 20 });
        anime({
          targets: btn, opacity: 1, translateY: 0,
          duration: 460, delay: 2400, easing: 'easeOutBack',
          complete: function () { btn.classList.add('cp-lets-begin--pulse'); }
        });
      }
    },

    /* ── Page 2.1 — column-reveal entrance ──────────── */
    columnRevealEntrance: function () {
      var heading   = document.querySelector('.cp-column-reveal .cp-title');
      var cardsRow  = document.querySelector('.cp-column-reveal .cp-colrev-cards');
      var cols      = document.querySelectorAll('.cp-column-reveal .cp-digit-col');

      if (typeof anime === 'undefined') {
        if (heading)  heading.style.opacity  = '1';
        if (cardsRow) cardsRow.style.opacity = '1';
        cols.forEach(function (c) { c.style.opacity = '1'; });
        return;
      }

      if (heading) {
        anime.set(heading, { opacity: 0, translateY: -10 });
        anime({ targets: heading, opacity: 1, translateY: 0, duration: 320, easing: 'easeOutQuad' });
      }
      if (cardsRow) {
        anime.set(cardsRow, { opacity: 0, translateY: 14, scale: 0.96 });
        anime({ targets: cardsRow, opacity: 1, translateY: 0, scale: 1, duration: 380, delay: 200, easing: 'easeOutBack' });
      }
      if (cols.length) {
        anime.set(cols, { opacity: 0, translateY: 18 });
        anime({
          targets: Array.prototype.slice.call(cols),
          opacity: 1,
          translateY: 0,
          duration: 300,
          delay: anime.stagger(55, { start: 460 }),
          easing: 'easeOutQuad'
        });
      }
    },

    /* ── Page 2.0 — concept ─────────────────────────── */
    conceptEntrance: function () {
      var title  = document.querySelector('.cp-concept .cp-title');
      var line   = document.querySelector('.cp-concept__line');
      var cardA  = document.querySelector('.cp-concept__cards .cp-concept__card:first-child');
      var cardB  = document.querySelector('.cp-concept__cards .cp-concept__card:last-child');
      var btn    = document.querySelector('.cp-concept .cp-btn-primary');

      if (typeof anime === 'undefined') {
        [title, line, cardA, cardB, btn].forEach(function (el) { if (el) el.style.opacity = '1'; });
        return;
      }

      if (title) { anime.set(title, { opacity: 0, translateY: -10 }); anime({ targets: title, opacity: 1, translateY: 0, duration: 320, easing: 'easeOutQuad' }); }
      if (line)  { anime.set(line,  { opacity: 0 }); anime({ targets: line,  opacity: 1, duration: 280, delay: 120, easing: 'easeOutQuad' }); }
      if (cardA) { anime.set(cardA, { opacity: 0, translateX: -40 }); anime({ targets: cardA, opacity: 1, translateX: 0, duration: 400, delay: 260, easing: 'easeOutBack' }); }
      if (cardB) { anime.set(cardB, { opacity: 0, translateX:  40 }); anime({ targets: cardB, opacity: 1, translateX: 0, duration: 400, delay: 320, easing: 'easeOutBack' }); }
      if (btn)   { anime.set(btn,   { opacity: 0 }); anime({ targets: btn,   opacity: 1, duration: 280, delay: 560, easing: 'easeOutQuad' }); }
    },

    /* ── Page 2.1 — predict-column entrance ────────── */
    predictColumnEntrance: function () {
      var title = document.querySelector('.cp-predict-col .cp-title');
      var vsRow = document.querySelector('.cp-predict-col .cp-vs-row');
      var cols  = document.querySelectorAll('.cp-predict-col .cp-digit-col');

      if (typeof anime === 'undefined') {
        if (title) title.style.opacity = '1';
        if (vsRow) vsRow.style.opacity = '1';
        cols.forEach(function (c) { c.style.opacity = '1'; });
        return;
      }

      if (title) {
        anime.set(title, { opacity: 0, translateY: -10 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 320, easing: 'easeOutQuad' });
      }
      if (vsRow) {
        anime.set(vsRow, { opacity: 0 });
        anime({ targets: vsRow, opacity: 1, duration: 260, delay: 120, easing: 'easeOutQuad' });
      }
      if (cols.length) {
        anime.set(cols, { opacity: 0, translateY: 14, scale: 0.93 });
        anime({
          targets: Array.prototype.slice.call(cols),
          opacity: 1, translateY: 0, scale: 1,
          duration: 380,
          delay: anime.stagger(60, { start: 280 }),
          easing: 'easeOutBack'
        });
      }
    },

    /* ── Pages 2.1–2.3 — reveal-step same ───────────── */
    revealStepSame: function () {
      var vsRow   = document.querySelector('.cp-vs-row');
      var doneCols   = document.querySelectorAll('.cp-digit-col--done');
      var activeCol  = document.querySelector('.cp-digit-col--active');
      var badge   = document.querySelector('.cp-result-badge');

      if (typeof anime === 'undefined') {
        if (vsRow) vsRow.style.opacity = '1';
        doneCols.forEach(function (c) { c.style.opacity = '0.5'; });
        if (activeCol) activeCol.style.opacity = '1';
        if (badge) badge.style.opacity = '1';
        return;
      }

      if (vsRow) { anime.set(vsRow, { opacity: 0 }); anime({ targets: vsRow, opacity: 1, duration: 260, easing: 'easeOutQuad' }); }
      if (doneCols.length) { anime.set(doneCols, { opacity: 0 }); anime({ targets: Array.prototype.slice.call(doneCols), opacity: 0.5, duration: 200, easing: 'easeOutQuad' }); }
      if (activeCol) { anime.set(activeCol, { opacity: 0, scale: 0.9 }); anime({ targets: activeCol, opacity: 1, scale: 1, duration: 380, delay: 260, easing: 'easeOutBack' }); }
      if (badge) { anime.set(badge, { opacity: 0, translateY: 8 }); anime({ targets: badge, opacity: 1, translateY: 0, duration: 320, delay: 560, easing: 'easeOutBack' }); }
    },

    /* ── Page 2.4 — reveal-step different ───────────── */
    revealStepDiff: function () {
      var vsRow   = document.querySelector('.cp-vs-row');
      var doneCols   = document.querySelectorAll('.cp-digit-col--done');
      var activeCol  = document.querySelector('.cp-digit-col--active');
      var arrow   = document.querySelector('.cp-diff-arrow');
      var badge   = document.querySelector('.cp-result-badge');

      if (typeof anime === 'undefined') {
        if (vsRow) vsRow.style.opacity = '1';
        doneCols.forEach(function (c) { c.style.opacity = '0.5'; });
        if (activeCol) activeCol.style.opacity = '1';
        if (arrow) arrow.style.opacity = '1';
        if (badge) badge.style.opacity = '1';
        return;
      }

      if (vsRow) { anime.set(vsRow, { opacity: 0 }); anime({ targets: vsRow, opacity: 1, duration: 260, easing: 'easeOutQuad' }); }
      if (doneCols.length) { anime.set(doneCols, { opacity: 0 }); anime({ targets: Array.prototype.slice.call(doneCols), opacity: 0.5, duration: 200, easing: 'easeOutQuad' }); }
      if (activeCol) { anime.set(activeCol, { opacity: 0, scale: 0.9 }); anime({ targets: activeCol, opacity: 1, scale: 1, duration: 380, delay: 260, easing: 'easeOutBack' }); }
      if (arrow) { anime.set(arrow, { opacity: 0, translateY: -10 }); anime({ targets: arrow, opacity: 1, translateY: 0, duration: 340, delay: 560, easing: 'easeOutQuad' }); }
      if (badge) { anime.set(badge, { opacity: 0, scale: 0.8 }); anime({ targets: badge, opacity: 1, scale: 1, duration: 380, delay: 720, easing: 'easeOutBack' }); }
    },

    /* ── Page 2.5 — question entrance ───────────────── */
    questionEntrance: function () {
      var title = document.querySelector('.cp-question .cp-title');
      var cards = document.querySelectorAll('.cp-question .cp-hook-card');

      if (typeof anime === 'undefined') {
        if (title) title.style.opacity = '1';
        cards.forEach(function (c) { c.style.opacity = '1'; c.classList.add('cp-hook-card--visible'); });
        return;
      }

      if (title) { anime.set(title, { opacity: 0, translateY: -10 }); anime({ targets: title, opacity: 1, translateY: 0, duration: 340, easing: 'easeOutQuad' }); }
      if (cards.length) {
        anime.set(cards, { opacity: 0, translateY: 20, scale: 0.92 });
        anime({
          targets: Array.prototype.slice.call(cards),
          opacity: 1, translateY: 0, scale: 1,
          duration: 480,
          delay: anime.stagger(200, { start: 200 }),
          easing: 'easeOutBack',
          complete: function () {
            cards.forEach(function (c) { c.classList.add('cp-hook-card--visible'); });
          }
        });
      }
    },

    /* ── Page 2.6 — pattern-prompt entrance ─────────── */
    patternPromptEntrance: function () {
      var title      = document.querySelector('.cp-pattern-prompt .cp-title');
      var rule       = document.querySelector('.cp-rule-line');
      var fingerCols = document.querySelectorAll('.cp-finger-col');
      var digitCols  = document.querySelectorAll('.cp-finger-grid .cp-digit-col');
      var cols       = fingerCols.length ? fingerCols : digitCols;
      var btn        = document.querySelector('.cp-pattern-prompt .cp-btn-primary');

      if (typeof anime === 'undefined') {
        [title, rule, btn].forEach(function (el) { if (el) el.style.opacity = '1'; });
        cols.forEach(function (c) { c.style.opacity = '1'; });
        return;
      }

      if (title) { anime.set(title, { opacity: 0 }); anime({ targets: title, opacity: 1, duration: 320, easing: 'easeOutQuad' }); }
      if (rule)  { anime.set(rule,  { opacity: 0 }); anime({ targets: rule,  opacity: 1, duration: 280, delay: 140, easing: 'easeOutQuad' }); }
      if (cols.length) {
        anime({ targets: Array.prototype.slice.call(cols), opacity: 1, duration: 240, delay: anime.stagger(80, { start: 280 }), easing: 'easeOutQuad' });
      }
      if (btn) { anime.set(btn, { opacity: 0 }); anime({ targets: btn, opacity: 1, duration: 260, delay: 900, easing: 'easeOutQuad' }); }
    },

    /* ── Page 2.0 (legacy) — compare-place-value-intro ── */
    compareGridEntrance: function () {
      if (typeof anime === 'undefined') {
        document.querySelectorAll('.cp-badge,.cp-kicker,.cp-title,.cp-subtitle,.cp-num-card')
          .forEach(function (el) { el.style.opacity = '1'; });
        return;
      }

      var badge    = document.querySelector('.cp-badge');
      var kicker   = document.querySelector('.cp-kicker');
      var title    = document.querySelector('.cp-title');
      var sub      = document.querySelector('.cp-subtitle');
      var numCards = document.querySelectorAll('.cp-num-card');

      /* Top text cascade */
      [badge, kicker, title, sub].forEach(function (el, i) {
        if (!el) return;
        anime.set(el, { opacity: 0 });
        anime({ targets: el, opacity: 1, duration: 280, delay: i * 60, easing: 'easeOutQuad' });
      });

      /* A/B number cards stagger up */
      if (numCards.length) {
        anime.set(numCards, { opacity: 0, translateY: 14, scale: 0.97 });
        anime({ targets: numCards, opacity: 1, translateY: 0, scale: 1, duration: 360, delay: anime.stagger(80, { start: 220 }), easing: 'easeOutBack' });
      }
    },

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

    /* ── Page 3.0 — challenge entrance ─────────────── */
    challengeEntrance: function () {
      var title = document.querySelector('.cp-challenge .cp-title');
      var cards = document.querySelectorAll('.cp-challenge .cp-hook-card');

      if (typeof anime === 'undefined') {
        if (title) title.style.opacity = '1';
        cards.forEach(function (c) { c.style.opacity = '1'; c.classList.add('cp-hook-card--visible'); });
        return;
      }

      if (title) {
        anime.set(title, { opacity: 0, translateY: -10 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 320, easing: 'easeOutQuad' });
      }
      if (cards.length) {
        anime.set(cards, { opacity: 0, translateY: -60 });
        anime({
          targets: Array.prototype.slice.call(cards),
          opacity: 1, translateY: 0,
          duration: 560,
          delay: anime.stagger(160, { start: 180 }),
          easing: 'easeOutBounce',
          complete: function () {
            cards.forEach(function (c) { c.classList.add('cp-hook-card--visible'); });
          }
        });
      }
    },

    /* ── Page 3.1 — reveal-walkthrough entrance ─────── */
    revealWalkthrough: function () {
      var vsRow = document.querySelector('.cp-reveal-walkthrough .cp-vs-row');

      if (typeof anime === 'undefined') {
        if (vsRow) vsRow.style.opacity = '1';
        return;
      }

      if (vsRow) {
        anime.set(vsRow, { opacity: 0 });
        anime({ targets: vsRow, opacity: 1, duration: 260, easing: 'easeOutQuad' });
      }
    },

    /* ── Page 3.2 — insight-card entrance ───────────── */
    insightCardEntrance: function () {
      var title = document.querySelector('.cp-insight-card .cp-title');
      var body  = document.querySelector('.cp-insight-body');
      var rows  = document.querySelectorAll('.cp-insight-row');
      var btn   = document.querySelector('.cp-insight-card .cp-btn-primary');

      if (typeof anime === 'undefined') {
        [title, body, btn].forEach(function (el) { if (el) el.style.opacity = '1'; });
        rows.forEach(function (r) { r.style.opacity = '1'; });
        return;
      }

      if (title) {
        anime.set(title, { opacity: 0, translateY: -10 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 380, easing: 'easeOutQuad' });
      }
      if (body) {
        anime.set(body, { opacity: 0, translateY: 16 });
        anime({ targets: body, opacity: 1, translateY: 0, duration: 440, delay: 180, easing: 'easeOutBack' });
      }
      if (rows.length) {
        anime.set(rows, { opacity: 0, translateX: -20 });
        anime({
          targets: Array.prototype.slice.call(rows),
          opacity: 1, translateX: 0,
          duration: 320,
          delay: anime.stagger(150, { start: 400 }),
          easing: 'easeOutQuad'
        });
      }
      if (btn) {
        anime.set(btn, { opacity: 0 });
        anime({ targets: btn, opacity: 1, duration: 280, delay: 900, easing: 'easeOutQuad' });
      }
    },

    /* ── Pages 2.1-2.4 — layer-reveal ───────────────── */
    layerRevealEntrance: function () {
      if (typeof anime === 'undefined') {
        document.querySelectorAll('.cp-num-card,.cp-place-grid,.cp-prompt-banner,.cp-reveal-card,.cp-micro-log,.cp-btn-primary')
          .forEach(function (el) { el.style.opacity = '1'; });
        return;
      }

      var numCards = document.querySelectorAll('.cp-num-card');
      var grid     = document.querySelector('.cp-place-grid');
      var banner   = document.querySelector('.cp-prompt-banner');
      var reveals  = document.querySelectorAll('.cp-reveal-card');
      var log      = document.querySelector('.cp-micro-log');
      var btn      = document.querySelector('.cp-btn-primary');

      /* Number cards — quick fade */
      if (numCards.length) {
        anime.set(numCards, { opacity: 0 });
        anime({ targets: numCards, opacity: 1, duration: 240, delay: anime.stagger(50), easing: 'easeOutQuad' });
      }

      /* Grid — slightly delayed */
      if (grid) {
        anime.set(grid, { opacity: 0 });
        anime({ targets: grid, opacity: 1, duration: 280, delay: 80, easing: 'easeOutQuad' });
      }

      /* Prompt banner (page 2.1) — pop in */
      if (banner) {
        anime.set(banner, { opacity: 0, translateY: 10 });
        anime({ targets: banner, opacity: 1, translateY: 0, duration: 380, delay: 200, easing: 'easeOutBack' });
      }

      /* Reveal cards — existing ones appear quickly, newest pops in */
      if (reveals.length) {
        var existing = Array.prototype.slice.call(reveals, 0, reveals.length - 1);
        var newest   = reveals[reveals.length - 1];

        if (existing.length) {
          anime.set(existing, { opacity: 0 });
          anime({ targets: existing, opacity: 1, duration: 200, delay: 160, easing: 'easeOutQuad' });
        }

        anime.set(newest, { opacity: 0, scale: 0.93, translateY: 10 });
        anime({ targets: newest, opacity: 1, scale: 1, translateY: 0, duration: 400, delay: existing.length ? 300 : 200, easing: 'easeOutBack' });
      }

      /* Micro log */
      if (log) {
        anime.set(log, { opacity: 0 });
        anime({ targets: log, opacity: 1, duration: 300, delay: 440, easing: 'easeOutQuad' });
      }

      /* Button */
      if (btn) {
        anime.set(btn, { opacity: 0 });
        anime({ targets: btn, opacity: 1, duration: 280, delay: reveals.length ? 420 : 320, easing: 'easeOutQuad' });
      }
    },

    /* ── Page 5.0 — staircase-concept build ─────────── */
    staircaseBuild: function () {
      var steps = document.querySelectorAll('.cp-staircase__step');
      var btn   = document.querySelector('.cp-staircase .cp-btn-primary');

      if (typeof anime === 'undefined') {
        steps.forEach(function (s) { s.style.opacity = '1'; });
        if (btn) btn.style.opacity = '1';
        return;
      }

      if (!steps.length) return;

      anime.set(steps, { opacity: 0, translateY: 60 });

      anime({
        targets: Array.prototype.slice.call(steps),
        opacity: 1,
        translateY: 0,
        duration: 500,
        delay: anime.stagger(280),
        easing: 'easeOutBack',
        begin: function () {
          steps.forEach(function (s, i) {
            setTimeout(function () {
              if (typeof playFootstep === 'function') playFootstep();
            }, i * 280);
          });
        },
        complete: function () {
          if (typeof playStaircaseChime === 'function') playStaircaseChime();
          if (btn) {
            anime.set(btn, { opacity: 0 });
            anime({ targets: btn, opacity: 1, duration: 300, delay: 200, easing: 'easeOutQuad' });
          }
        }
      });
    },

    /* ── Page 6.0 — hint-card "Two-Step Stories" ────── */
    hintCardTypewriter: function () {
      var wrap = document.querySelector('.cp-hint-card[data-page-id="6.0"]');
      if (!wrap) return;   /* no-op for other hint-card pages */

      var pill = wrap.querySelector('.cp-si-op-pill');
      var ops  = pill ? Array.prototype.slice.call(pill.querySelectorAll('.cp-si-op-badge')) : [];

      if (typeof anime === 'undefined') {
        if (pill) { pill.style.opacity = '1'; pill.style.transform = 'none'; }
        ops.forEach(function (op) { op.style.opacity = '1'; op.style.transform = 'none'; });
        return;
      }

      /* Step 1 — background wash fade-in (0.0s → 0.4s) */
      anime.set(wrap, { opacity: 0 });
      anime({ targets: wrap, opacity: 1, duration: 400, easing: 'easeOutQuad' });

      /* Step 2 — pill slides down, each op badge pops in with 80ms stagger (0.2s → 0.9s) */
      if (pill) {
        anime.set(pill, { opacity: 0, translateY: -28 });
        anime({ targets: pill, opacity: 1, translateY: 0, duration: 400, delay: 200, easing: 'easeOutBack' });
      }
      if (ops.length) {
        anime.set(ops, { opacity: 0, scale: 0.3 });
        anime({
          targets: ops,
          opacity: 1,
          scale:   [0.3, 1.15, 1],
          duration: 300,
          delay: anime.stagger(80, { start: 300 }),
          easing: 'easeOutBack'
        });
      }
    },

    /* ── Page 5.2 — drag-sort entrance ──────────────── */
    dragSortEntrance: function () {
      var title = document.querySelector('.cp-drag-sort .cp-title');
      var tiles = document.querySelectorAll('.cp-ds-tile');
      var slots = document.querySelectorAll('.cp-ds-slot');

      if (typeof anime === 'undefined') {
        if (title) title.style.opacity = '1';
        tiles.forEach(function (t) { t.style.opacity = '1'; });
        slots.forEach(function (s) { s.style.opacity = '1'; });
        return;
      }

      if (title) {
        anime.set(title, { opacity: 0, translateY: -10 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 320, easing: 'easeOutQuad' });
      }
      if (tiles.length) {
        anime.set(tiles, { opacity: 0, translateY: 30, scale: 0.88 });
        anime({
          targets: Array.prototype.slice.call(tiles),
          opacity: 1, translateY: 0, scale: 1,
          duration: 480,
          delay: anime.stagger(100, { start: 200 }),
          easing: 'easeOutBack'
        });
      }
      if (slots.length) {
        anime.set(slots, { opacity: 0 });
        anime({
          targets: Array.prototype.slice.call(slots),
          opacity: 1,
          duration: 300,
          delay: anime.stagger(60, { start: 560 }),
          easing: 'easeOutQuad'
        });
      }
    },

    /* ── Page 5.2 — drag-and-rank entrance ──────────── */
    dragAndRankEntrance: function () {
      var wrap     = document.querySelector('.cp-dar');
      if (!wrap) return;
      var heading  = wrap.querySelector('.cp-dar-heading');
      var subtitle = wrap.querySelector('.cp-dar-subtitle');
      var story    = wrap.querySelector('.cp-dar-story');
      var tiles    = Array.prototype.slice.call(wrap.querySelectorAll('.cp-dar-tile'));
      var slots    = Array.prototype.slice.call(wrap.querySelectorAll('.cp-dar-slot'));

      if (typeof anime === 'undefined') {
        [heading, subtitle, story].forEach(function (el) { if (el) el.style.opacity = '1'; });
        tiles.forEach(function (t) { t.style.opacity = '1'; });
        slots.forEach(function (s) { s.style.opacity = '1'; });
        return;
      }

      if (heading) {
        anime.set(heading, { opacity: 0, translateY: -14 });
        anime({ targets: heading, opacity: 1, translateY: 0, duration: 400, easing: 'easeOutQuad' });
      }
      if (subtitle) {
        anime.set(subtitle, { opacity: 0 });
        anime({ targets: subtitle, opacity: 1, duration: 350, delay: 400, easing: 'easeOutQuad' });
      }
      if (story) {
        anime.set(story, { opacity: 0, translateX: -50 });
        anime({ targets: story, opacity: 1, translateX: 0, duration: 500, delay: 800, easing: 'easeOutBack' });
      }
      if (tiles.length) {
        anime.set(tiles, { opacity: 0, scale: 0.82, translateY: 20 });
        anime({
          targets: tiles,
          opacity: 1, scale: 1, translateY: 0,
          duration: 400,
          delay: anime.stagger(150, { start: 1700 }),
          easing: 'easeOutBack'
        });
      }
      if (slots.length) {
        anime.set(slots, { opacity: 0 });
        anime({
          targets: slots,
          opacity: 1,
          duration: 300,
          delay: anime.stagger(100, { start: 2800 }),
          easing: 'easeOutQuad'
        });
      }
    },

    /* ── Page 5.3 — completion-reveal gold stagger ───── */
    completionReveal: function () {
      var tiles = document.querySelectorAll('.cp-cr-tile');
      var arrow = document.querySelector('.cp-cr-arrow');

      if (typeof anime === 'undefined') {
        tiles.forEach(function (t) { t.style.opacity = '1'; t.classList.add('cp-cr-tile--gold'); });
        if (arrow) arrow.style.opacity = '1';
        if (typeof playComplete === 'function') playComplete();
        return;
      }

      if (arrow) {
        anime.set(arrow, { opacity: 0 });
        anime({ targets: arrow, opacity: 1, duration: 300, easing: 'easeOutQuad' });
      }
      if (tiles.length) {
        anime.set(tiles, { opacity: 0, scale: 0.85 });
        anime({
          targets: Array.prototype.slice.call(tiles),
          opacity: 1,
          scale: 1,
          duration: 480,
          delay: anime.stagger(400),
          easing: 'easeOutBack',
          complete: function () {
            tiles.forEach(function (t) { t.classList.add('cp-cr-tile--gold'); });
            if (typeof playComplete === 'function') playComplete();
          }
        });
      }
    },

    /* ── Page 5.4 — ascending-pattern entrance ───────── */
    ascendingPatternEntrance: function () {
      var title  = document.querySelector('.cp-ascending-pattern .cp-title');
      var rule   = document.querySelector('.cp-ascending-pattern .cp-rule-line');
      var cards  = document.querySelectorAll('.cp-ap-num-card');
      var digits = document.querySelectorAll('.cp-ap-digit--highlight');
      var btn    = document.querySelector('.cp-ascending-pattern .cp-btn-primary');

      if (typeof anime === 'undefined') {
        [title, rule, btn].forEach(function (el) { if (el) el.style.opacity = '1'; });
        cards.forEach(function (c) { c.style.opacity = '1'; });
        return;
      }

      if (title) { anime.set(title, { opacity: 0, translateY: -10 }); anime({ targets: title, opacity: 1, translateY: 0, duration: 340, easing: 'easeOutQuad' }); }
      if (rule)  { anime.set(rule,  { opacity: 0 }); anime({ targets: rule, opacity: 1, duration: 280, delay: 160, easing: 'easeOutQuad' }); }
      if (cards.length) {
        var cardArr = Array.prototype.slice.call(cards);
        anime.set(cardArr[0], { opacity: 0, translateX: -50 });
        if (cardArr[1]) anime.set(cardArr[1], { opacity: 0, translateX: 50 });
        anime({ targets: cardArr, opacity: 1, translateX: 0, duration: 440, delay: 300, easing: 'easeOutBack' });
      }
      if (digits.length) {
        anime.set(digits, { background: 'transparent', color: 'var(--color-navy)' });
        anime({ targets: Array.prototype.slice.call(digits), background: '#FDE68A', color: '#92400E', duration: 400, delay: 900, easing: 'easeOutQuad' });
      }
      if (btn)   { anime.set(btn, { opacity: 0 }); anime({ targets: btn, opacity: 1, duration: 280, delay: 1100, easing: 'easeOutQuad' }); }
    },

    /* ── Page 6.0 — staircase flip ─────────────────── */
    staircaseFlip: function () {
      var steps = document.querySelectorAll('.cp-staircase--flipped .cp-staircase__step');
      var arrow = document.querySelector('.cp-staircase--flipped .cp-staircase__dir-arrow');
      var btn   = document.querySelector('.cp-staircase--flipped .cp-btn-primary');

      if (typeof anime === 'undefined') {
        Array.prototype.slice.call(steps).forEach(function (s) { s.style.opacity = '1'; });
        if (arrow) arrow.style.opacity = '1';
        if (btn) btn.style.opacity = '1';
        return;
      }
      if (!steps.length) return;

      anime.set(steps, { opacity: 0, translateY: -60 });
      anime({
        targets: Array.prototype.slice.call(steps),
        opacity: 1, translateY: 0,
        duration: 500,
        delay: anime.stagger(280),
        easing: 'easeOutBack',
        begin: function () {
          if (typeof playFlipWhoosh === 'function') playFlipWhoosh();
        },
        complete: function () {
          if (arrow) {
            anime.set(arrow, { opacity: 0 });
            anime({ targets: arrow, opacity: 1, duration: 300, easing: 'easeOutQuad' });
          }
          if (btn) {
            anime.set(btn, { opacity: 0 });
            anime({ targets: btn, opacity: 1, duration: 300, delay: 200, easing: 'easeOutQuad' });
          }
        }
      });
    },

    /* ── Page 6.3 — descending completion reveal ────── */
    descCompletionReveal: function () {
      var tiles = document.querySelectorAll('.cp-cr-tile');
      var arrow = document.querySelector('.cp-cr-arrow');

      if (typeof anime === 'undefined') {
        Array.prototype.slice.call(tiles).forEach(function (t) { t.style.opacity = '1'; t.classList.add('cp-cr-tile--gold'); });
        if (arrow) arrow.style.opacity = '1';
        if (typeof playDescendingChime === 'function') playDescendingChime();
        return;
      }

      if (arrow) {
        anime.set(arrow, { opacity: 0 });
        anime({ targets: arrow, opacity: 1, duration: 300, easing: 'easeOutQuad' });
      }
      if (tiles.length) {
        anime.set(tiles, { opacity: 0, scale: 0.85 });
        anime({
          targets: Array.prototype.slice.call(tiles),
          opacity: 1, scale: 1,
          duration: 480,
          delay: anime.stagger(400),
          easing: 'easeOutBack',
          complete: function () {
            Array.prototype.slice.call(tiles).forEach(function (t) { t.classList.add('cp-cr-tile--gold'); });
            if (typeof playDescendingChime === 'function') playDescendingChime();
          }
        });
      }
    },

    /* ── Page 6.4 — flip rule card entrance ─────────── */
    flipRuleCardEntrance: function () {
      var title = document.querySelector('.cp-flip-rule-card .cp-title');
      var rules = document.querySelectorAll('.cp-frc-rule');
      var btn   = document.querySelector('.cp-flip-rule-card .cp-btn-primary');

      if (typeof anime === 'undefined') {
        if (title) title.style.opacity = '1';
        Array.prototype.slice.call(rules).forEach(function (r) { r.style.opacity = '1'; });
        if (btn) btn.style.opacity = '1';
        return;
      }

      if (title) {
        anime.set(title, { opacity: 0, translateY: -10 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 340, easing: 'easeOutQuad' });
      }
      if (rules.length) {
        anime.set(rules, { opacity: 0, scale: 0.88, translateY: 20 });
        anime({
          targets: Array.prototype.slice.call(rules),
          opacity: 1, scale: 1, translateY: 0,
          duration: 480,
          delay: anime.stagger(160, { start: 220 }),
          easing: 'easeOutBack'
        });
      }
      if (btn) {
        anime({ targets: btn, opacity: 1, duration: 280, delay: 880, easing: 'easeOutQuad' });
      }
    },

    /* ── Page 7.0 — architect intro ─────────────────── */
    architectIntro: function () {
      var icon  = document.querySelector('.cp-architect-icon');
      var title = document.querySelector('.cp-architect-intro .cp-title');
      var sub   = document.querySelector('.cp-architect-intro .cp-subtitle');
      var boxes = document.querySelectorAll('.cp-architect-box');
      var btn   = document.querySelector('.cp-architect-intro .cp-btn-primary');

      if (typeof anime === 'undefined') {
        [icon, title, sub, btn].forEach(function (el) { if (el) el.style.opacity = '1'; });
        Array.prototype.slice.call(boxes).forEach(function (b) { b.style.opacity = '1'; });
        return;
      }

      anime.set([icon, title, sub].filter(Boolean), { opacity: 0, translateY: -20 });
      anime({
        targets: [icon, title, sub].filter(Boolean),
        opacity: 1, translateY: 0,
        duration: 420,
        delay: anime.stagger(120),
        easing: 'easeOutBack'
      });

      if (boxes.length) {
        anime.set(boxes, { opacity: 0, scaleX: 0 });
        anime({
          targets: Array.prototype.slice.call(boxes),
          opacity: 1, scaleX: 1,
          duration: 300,
          delay: anime.stagger(80, { start: 500 }),
          easing: 'easeOutBack'
        });
      }

      if (btn) {
        anime.set(btn, { opacity: 0 });
        anime({ targets: btn, opacity: 1, duration: 280, delay: 1100, easing: 'easeOutQuad' });
      }
    },

    /* ── Page 7.1 — digit prompt entrance ───────────── */
    digitPromptEntrance: function () {
      var tiles = document.querySelectorAll('.cp-digit-prompt .cp-dp-tile');
      var slots = document.querySelectorAll('.cp-digit-prompt .cp-dp-slot');

      if (typeof anime === 'undefined') {
        Array.prototype.slice.call(tiles).forEach(function (t) { t.style.opacity = '1'; });
        Array.prototype.slice.call(slots).forEach(function (s) { s.style.opacity = '1'; });
        return;
      }

      if (tiles.length) {
        anime.set(tiles, { opacity: 0, scale: 0, translateY: 30 });
        anime({
          targets: Array.prototype.slice.call(tiles),
          opacity: 1, scale: 1, translateY: 0,
          duration: 400,
          delay: anime.stagger(260, { start: 100 }),
          easing: 'easeOutBack',
          begin: function () {
            Array.prototype.slice.call(tiles).forEach(function (t, i) {
              setTimeout(function () {
                if (typeof playTick === 'function') playTick();
              }, i * 260);
            });
          }
        });
      }

      if (slots.length) {
        anime.set(slots, { opacity: 0 });
        anime({
          targets: Array.prototype.slice.call(slots),
          opacity: 1,
          duration: 280,
          delay: anime.stagger(60, { start: 1700 }),
          easing: 'easeOutQuad'
        });
      }
    },

    /* ── Page 7.2 — digit place entrance ────────────── */
    digitPlaceEntrance: function () {
      var title = document.querySelector('.cp-digit-place .cp-title');
      var tiles = document.querySelectorAll('.cp-digit-place .cp-dp-tile');
      var slots = document.querySelectorAll('.cp-digit-place .cp-dp-slot');

      if (typeof anime === 'undefined') {
        if (title) title.style.opacity = '1';
        Array.prototype.slice.call(tiles).forEach(function (t) { t.style.opacity = '1'; });
        Array.prototype.slice.call(slots).forEach(function (s) { s.style.opacity = '1'; });
        return;
      }

      if (title) {
        anime.set(title, { opacity: 0, translateY: -10 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 320, easing: 'easeOutQuad' });
      }

      if (tiles.length) {
        anime.set(tiles, { opacity: 0, scale: 0.9 });
        anime({
          targets: Array.prototype.slice.call(tiles),
          opacity: 1, scale: 1,
          duration: 360,
          delay: anime.stagger(80, { start: 150 }),
          easing: 'easeOutBack'
        });
      }

      if (slots.length) {
        anime.set(slots, { opacity: 0 });
        anime({
          targets: Array.prototype.slice.call(slots),
          opacity: 1,
          duration: 280,
          delay: anime.stagger(50, { start: 600 }),
          easing: 'easeOutQuad'
        });
      }
    },

    /* ── Page 7.3 — number lock reveal ──────────────── */
    numberLockReveal: function () {
      var lbl = document.querySelector('.cp-nlr-label');
      var num = document.querySelector('.cp-nlr-number');

      if (typeof anime === 'undefined') {
        if (lbl) lbl.style.opacity = '1';
        if (num) { num.style.opacity = '1'; num.classList.add('cp-nlr-number--locked'); }
        if (typeof playComplete === 'function') playComplete();
        return;
      }

      if (lbl) {
        anime.set(lbl, { opacity: 0 });
        anime({ targets: lbl, opacity: 1, duration: 280, easing: 'easeOutQuad' });
      }

      if (num) {
        anime.set(num, { opacity: 0, scale: 1.3 });
        anime({
          targets: num,
          opacity: 1, scale: 1,
          duration: 400,
          delay: 160,
          easing: 'easeOutBack',
          complete: function () {
            num.classList.add('cp-nlr-number--locked');
            if (typeof playComplete === 'function') playComplete();
          }
        });
      }
    },

    /* ── Page 7.4 — greatest pattern entrance ────────── */
    greatestPatternEntrance: function () {
      var title   = document.querySelector('.cp-greatest-pattern .cp-title');
      var sub     = document.querySelector('.cp-gp-subtitle');
      var digits  = document.querySelectorAll('.cp-gp-digit');
      var arrow   = document.querySelector('.cp-gp-arrow');
      var biggest = document.querySelector('.cp-gp-digit--biggest');
      var smallest = document.querySelector('.cp-gp-digit--smallest');
      var btn     = document.querySelector('.cp-greatest-pattern .cp-btn-primary');

      if (typeof anime === 'undefined') {
        [title, sub, arrow, btn].forEach(function (el) { if (el) el.style.opacity = '1'; });
        Array.prototype.slice.call(digits).forEach(function (d) { d.style.opacity = '1'; });
        return;
      }

      if (title) {
        anime.set(title, { opacity: 0, translateY: -10 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 340, easing: 'easeOutQuad' });
      }

      if (sub) {
        anime.set(sub, { opacity: 0 });
        anime({ targets: sub, opacity: 1, duration: 280, delay: 160, easing: 'easeOutQuad' });
      }

      if (digits.length) {
        anime.set(digits, { opacity: 0, translateY: 20 });
        anime({
          targets: Array.prototype.slice.call(digits),
          opacity: 1, translateY: 0,
          duration: 360,
          delay: anime.stagger(60, { start: 300 }),
          easing: 'easeOutBack'
        });
      }

      if (arrow) {
        anime.set(arrow, { opacity: 0, translateX: 300 });
        anime({
          targets: arrow,
          opacity: 1, translateX: 0,
          duration: 600,
          delay: 800,
          easing: 'easeOutQuad',
          complete: function () {
            if (typeof playSweep === 'function') playSweep();
            if (biggest) {
              anime({ targets: biggest, background: ['#FDE68A', '#FBBF24'],
                      scale: [1, 1.18, 1], duration: 500, easing: 'easeOutBack' });
            }
            if (smallest) {
              anime({ targets: smallest, background: ['#E0F2FE', '#7DD3FC'],
                      scale: [1, 1.18, 1], duration: 500, delay: 200, easing: 'easeOutBack' });
            }
          }
        });
      }

      if (btn) {
        anime.set(btn, { opacity: 0 });
        anime({ targets: btn, opacity: 1, duration: 280, delay: 1800, easing: 'easeOutQuad' });
      }
    },

    /* ── Page 8.0 — smallest intro (flip-in) ────────── */
    smallestIntro: function () {
      var title = document.querySelector('.cp-smallest-intro .cp-title');
      var tiles = document.querySelectorAll('.cp-smallest-intro .cp-sdp-tile');
      var slots = document.querySelectorAll('.cp-smallest-intro .cp-sdp-slot');

      if (typeof anime === 'undefined') {
        if (title) title.style.opacity = '1';
        Array.prototype.slice.call(tiles).forEach(function (t) { t.style.opacity = '1'; });
        Array.prototype.slice.call(slots).forEach(function (s) { s.style.opacity = '1'; });
        return;
      }

      if (title) {
        anime.set(title, { opacity: 0, translateY: -14 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 360, easing: 'easeOutQuad' });
      }

      if (tiles.length) {
        anime.set(tiles, { opacity: 0, rotateY: 90, scale: 0.88 });
        anime({
          targets: Array.prototype.slice.call(tiles),
          opacity: 1, rotateY: 0, scale: 1,
          duration: 420,
          delay: anime.stagger(120, { start: 200 }),
          easing: 'easeOutBack'
        });
      }

      if (slots.length) {
        anime.set(slots, { opacity: 0 });
        anime({
          targets: Array.prototype.slice.call(slots),
          opacity: 1,
          duration: 280,
          delay: anime.stagger(50, { start: 950 }),
          easing: 'easeOutQuad'
        });
      }
    },

    /* ── Page 8.1 — smallest digit place entrance ────── */
    smallestDigitPlaceEntrance: function () {
      var title = document.querySelector('.cp-smallest-digit-place .cp-title');
      var tiles = document.querySelectorAll('.cp-smallest-digit-place .cp-sdp-tile');
      var slots = document.querySelectorAll('.cp-smallest-digit-place .cp-sdp-slot');

      if (typeof anime === 'undefined') {
        if (title) title.style.opacity = '1';
        Array.prototype.slice.call(tiles).forEach(function (t) { t.style.opacity = '1'; });
        Array.prototype.slice.call(slots).forEach(function (s) { s.style.opacity = '1'; });
        return;
      }

      if (title) {
        anime.set(title, { opacity: 0, translateY: -10 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 320, easing: 'easeOutQuad' });
      }

      if (tiles.length) {
        anime.set(tiles, { opacity: 0, scale: 0.9 });
        anime({
          targets: Array.prototype.slice.call(tiles),
          opacity: 1, scale: 1,
          duration: 380,
          delay: anime.stagger(80, { start: 150 }),
          easing: 'easeOutBack'
        });
      }

      if (slots.length) {
        anime.set(slots, { opacity: 0 });
        anime({
          targets: Array.prototype.slice.call(slots),
          opacity: 1,
          duration: 280,
          delay: anime.stagger(50, { start: 640 }),
          easing: 'easeOutQuad'
        });
      }
    },

    /* ── Page 8.2 — zero rule reveal ────────────────── */
    zeroRuleReveal: function () {
      var card     = document.querySelector('.cp-zrr-card');
      var zeroTile = document.querySelector('.cp-zrr-tile--zero');
      var oneTile  = document.querySelector('.cp-zrr-tile--one');
      var slotEl   = document.querySelector('.cp-zrr-slot');

      if (typeof anime === 'undefined') {
        if (card) card.style.opacity = '1';
        if (zeroTile) zeroTile.style.opacity = '1';
        if (oneTile)  oneTile.style.opacity  = '1';
        if (slotEl)   slotEl.style.opacity   = '1';
        return;
      }

      if (card) {
        anime.set(card, { opacity: 0, translateY: 30 });
        anime({ targets: card, opacity: 1, translateY: 0, duration: 400, easing: 'easeOutBack' });
      }

      if (slotEl) {
        anime.set(slotEl, { opacity: 0 });
        anime({ targets: slotEl, opacity: 1, duration: 300, delay: 280, easing: 'easeOutQuad' });
      }

      if (zeroTile) {
        anime.set(zeroTile, { opacity: 0, scale: 0.88 });
        anime({ targets: zeroTile, opacity: 1, scale: 1, duration: 360, delay: 460, easing: 'easeOutBack' });
      }

      if (oneTile) {
        anime.set(oneTile, { opacity: 0 });
      }
    },

    /* ── Page 8.3 — smallest lock reveal ────────────── */
    smallestLockReveal: function () {
      var lbl      = document.querySelector('.cp-slr-label');
      var num      = document.querySelector('.cp-slr-number');
      var swapRow  = document.querySelector('.cp-slr-swap');

      if (typeof anime === 'undefined') {
        if (lbl)     lbl.style.opacity     = '1';
        if (num)     { num.style.opacity = '1'; num.classList.add('cp-slr-number--locked'); }
        if (swapRow) swapRow.style.opacity = '1';
        if (typeof playComplete === 'function') playComplete();
        return;
      }

      if (lbl) {
        anime.set(lbl, { opacity: 0 });
        anime({ targets: lbl, opacity: 1, duration: 280, easing: 'easeOutQuad' });
      }

      if (num) {
        anime.set(num, { opacity: 0, scale: 1.3 });
        anime({
          targets: num,
          opacity: 1, scale: 1,
          duration: 420,
          delay: 140,
          easing: 'easeOutBack',
          complete: function () {
            num.classList.add('cp-slr-number--locked');
            if (typeof playComplete === 'function') playComplete();
          }
        });
      }

      if (swapRow) {
        anime.set(swapRow, { opacity: 0, translateY: 14 });
        anime({
          targets: swapRow,
          opacity: 1, translateY: 0,
          duration: 380,
          delay: 700,
          easing: 'easeOutBack',
          complete: function () {
            if (typeof playSweep === 'function') playSweep();
          }
        });
      }
    },

    /* ── Page 4.0 — rapid-tap entrance ──────────────── */
    rapidTapEntrance: function () {
      var title   = document.querySelector('.cp-rapid-tap .cp-title');
      var counter = document.querySelector('.cp-rt-round-counter');
      var stars   = document.querySelector('.cp-rt-stars');
      var cardL   = document.querySelector('.cp-rt-card[data-side="left"]');
      var cardR   = document.querySelector('.cp-rt-card[data-side="right"]');

      if (typeof anime === 'undefined') {
        [title, counter, stars, cardL, cardR].forEach(function (el) {
          if (el) el.style.opacity = '1';
        });
        return;
      }

      if (title) {
        anime.set(title, { opacity: 0, translateY: -10 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 320, easing: 'easeOutQuad' });
      }
      if (counter) {
        anime.set(counter, { opacity: 0 });
        anime({ targets: counter, opacity: 1, duration: 260, delay: 180, easing: 'easeOutQuad' });
      }
      if (stars) {
        anime.set(stars, { opacity: 0 });
        anime({ targets: stars, opacity: 1, duration: 260, delay: 220, easing: 'easeOutQuad' });
      }
      if (cardL && cardR) {
        anime.set(cardL, { opacity: 0, translateX: -80 });
        anime.set(cardR, { opacity: 0, translateX:  80 });
        anime({
          targets: [cardL, cardR],
          opacity: 1, translateX: 0,
          duration: 460,
          delay: anime.stagger(80, { start: 300 }),
          easing: 'easeOutBack'
        });
      }
    },

    /* ── Section 9.0 — Rapid Round entrance ─────────── */
    rapidRoundEntrance: function () {
      var header   = document.querySelector('.cp-rr-header');
      var label    = document.querySelector('.cp-rr-label');
      var activity = document.querySelector('.cp-rr-activity');
      if (!header && !label && !activity) return;
      if (typeof anime === 'undefined') return;
      if (header) {
        anime.set(header, { opacity: 0, translateY: -10 });
        anime({ targets: header, opacity: 1, translateY: 0, duration: 350, easing: 'easeOutCubic' });
      }
      if (label) {
        anime.set(label, { opacity: 0 });
        anime({ targets: label, opacity: 1, duration: 280, delay: 150, easing: 'easeOutQuad' });
      }
      if (activity) {
        anime.set(activity, { opacity: 0, translateY: 16 });
        anime({ targets: activity, opacity: 1, translateY: 0, duration: 360, delay: 200, easing: 'easeOutCubic' });
      }
    },

    /* ── Section 9.1 — Round Feedback ───────────────── */
    roundFeedbackAnim: function () {
      var banner = document.querySelector('.cp-rf-banner');
      var star   = document.querySelector('.cp-rf-star');
      if (typeof anime === 'undefined') return;
      if (banner) {
        anime.set(banner, { opacity: 0, translateY: -30 });
        anime({ targets: banner, opacity: 1, translateY: 0, duration: 400, easing: 'easeOutBack' });
      }
      if (star) {
        anime.set(star, { opacity: 0, scale: 0 });
        anime({
          targets: star, opacity: 1, scale: [0, 1.4, 1],
          duration: 500, delay: 200, easing: 'easeOutBack',
          complete: function () { if (typeof playTick === 'function') playTick(); }
        });
      }
    },

    /* ── Section 9.2 — Level Complete ───────────────── */
    levelCompleteAnim: function () {
      var stars  = document.querySelectorAll('.cp-lc-star');
      var badge  = document.querySelector('.cp-lc-badge');
      if (typeof anime === 'undefined') return;
      if (stars.length) {
        anime.set(stars, { opacity: 0, scale: 0 });
        anime({ targets: stars, opacity: 1, scale: [0, 1.3, 1],
                duration: 480, delay: anime.stagger(120), easing: 'easeOutBack' });
      }
      if (badge) {
        anime.set(badge, { opacity: 0, translateY: -60 });
        anime({ targets: badge, opacity: 1, translateY: 0, duration: 500, delay: 380, easing: 'easeOutBack' });
      }
    },

    /* ── Section 10.0 — Session Summary ─────────────── */
    sessionSummaryEntrance: function () {
      var title = document.querySelector('.cp-session-summary .cp-title');
      if (typeof anime === 'undefined') {
        if (title) title.style.opacity = '1';
        return;
      }
      if (title) {
        anime.set(title, { opacity: 0, translateY: -10 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 350, easing: 'easeOutQuad' });
      }
    },

    /* ── Section 10.1 — Key Insight ─────────────────── */
    keyInsightEntrance: function () {
      var textEl = document.getElementById('cp-ki-text');
      if (typeof anime === 'undefined') {
        if (textEl) textEl.style.opacity = '1';
        return;
      }
      if (textEl) {
        anime.set(textEl, { opacity: 0 });
        anime({ targets: textEl, opacity: 1, duration: 300, easing: 'easeOutQuad' });
      }
    },

    /* ── Page 3.0 — apply-rule entrance ────────────── */
    applyRuleEntrance: function () {
      var wrap = document.querySelector('.cp-apply-rule');
      if (!wrap) return;

      var heading    = wrap.querySelector('.cp-ar-heading');
      var subtitle   = wrap.querySelector('.cp-ar-subtitle');
      var counter    = wrap.querySelector('.cp-ar-counter');
      var cardA      = wrap.querySelector('.cp-ar-card--a');
      var cardB      = wrap.querySelector('.cp-ar-card--b');
      var options    = wrap.querySelector('.cp-ar-options');

      if (typeof anime === 'undefined') {
        [heading, subtitle, counter, cardA, cardB, options].forEach(function (el) {
          if (el) el.style.opacity = '1';
        });
        return;
      }

      if (heading) {
        anime.set(heading, { opacity: 0, translateY: -14 });
        anime({ targets: heading, opacity: 1, translateY: 0, duration: 500, easing: 'easeOutQuad' });
      }
      if (subtitle) {
        anime.set(subtitle, { opacity: 0 });
        anime({ targets: subtitle, opacity: 1, duration: 400, delay: 500, easing: 'easeOutQuad' });
      }
      if (counter) {
        anime.set(counter, { opacity: 0, scale: 0.9 });
        anime({ targets: counter, opacity: 1, scale: 1, duration: 380, delay: 1000, easing: 'easeOutBack' });
      }
      if (cardA) {
        anime.set(cardA, { opacity: 0, translateX: -60 });
        anime({ targets: cardA, opacity: 1, translateX: 0, duration: 460, delay: 1400, easing: 'easeOutBack' });
      }
      if (cardB) {
        anime.set(cardB, { opacity: 0, translateX: 60 });
        anime({ targets: cardB, opacity: 1, translateX: 0, duration: 460, delay: 1600, easing: 'easeOutBack' });
      }
      if (options) {
        anime.set(options, { opacity: 0, translateY: 20 });
        anime({ targets: options, opacity: 1, translateY: 0, duration: 420, delay: 2300, easing: 'easeOutBack' });
      }
    },

    /* ── Page 4.0 — apply-real-life entrance ───────── */
    applyRealLifeEntrance: function () {
      var wrap = document.querySelector('.cp-arl');
      if (!wrap) return;

      var heading    = wrap.querySelector('.cp-arl-heading');
      var subtitle   = wrap.querySelector('.cp-arl-subtitle');
      var story      = wrap.querySelector('.cp-arl-story');
      var question   = wrap.querySelector('.cp-arl-question');
      var options    = Array.prototype.slice.call(wrap.querySelectorAll('.cp-arl-option'));
      var highlights = Array.prototype.slice.call(wrap.querySelectorAll('.cp-arl-story-highlight'));

      if (typeof anime === 'undefined') {
        [heading, subtitle, story, question].forEach(function (el) { if (el) el.style.opacity = '1'; });
        options.forEach(function (o) { o.style.opacity = '1'; });
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
          targets: story, opacity: 1, translateX: 0, duration: 600, delay: 1000, easing: 'easeOutBack',
          complete: function () {
            if (highlights.length) {
              anime({
                targets: highlights,
                backgroundColor: ['rgba(255,210,60,0.22)', 'rgba(255,210,60,0.70)'],
                duration: 500, direction: 'alternate', loop: 2, easing: 'easeInOutSine'
              });
            }
          }
        });
      }
      if (question) {
        anime.set(question, { opacity: 0, scale: 0.9 });
        anime({ targets: question, opacity: 1, scale: 1, duration: 400, delay: 2000, easing: 'easeOutBack' });
      }
      if (options.length) {
        anime.set(options, { opacity: 0, scale: 0.8, translateY: 20 });
        anime({
          targets: options, opacity: 1, scale: 1, translateY: 0,
          duration: 380, delay: anime.stagger(200, { start: 2600 }), easing: 'easeOutBack'
        });
      }
    },

    /* ── Page 6.3 — drag-and-rank descending entrance ── */
    section63Entrance: function () {
      var wrap = document.querySelector('.cp-dar');
      if (!wrap) return;

      var heading  = wrap.querySelector('.cp-dar-heading');
      var subtitle = wrap.querySelector('.cp-dar-subtitle');
      var story    = wrap.querySelector('.cp-dar-story');
      var arrow    = wrap.querySelector('.cp-dar-arrow');
      var tiles    = Array.prototype.slice.call(wrap.querySelectorAll('.cp-dar-tile'));
      var slots    = Array.prototype.slice.call(wrap.querySelectorAll('.cp-dar-slot'));

      if (typeof anime === 'undefined') {
        [heading, subtitle, story, arrow].forEach(function (el) { if (el) el.style.opacity = '1'; });
        tiles.forEach(function (t) { t.style.opacity = '1'; });
        slots.forEach(function (s) { s.style.opacity = '1'; });
        if (arrow) arrow.classList.add('cp-dar-arrow--pulse');
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
        anime.set(story, { opacity: 0, translateX: -50 });
        anime({ targets: story, opacity: 1, translateX: 0, duration: 550, delay: 1000, easing: 'easeOutBack' });
      }
      if (tiles.length) {
        anime.set(tiles, { opacity: 0, scale: 0.8, translateY: 20 });
        anime({
          targets: tiles, opacity: 1, scale: 1, translateY: 0,
          duration: 400, delay: anime.stagger(150, { start: 1700 }), easing: 'easeOutBack',
          complete: function () {
            anime({
              targets: tiles, translateX: [-3, 3, -3, 0],
              duration: 1200, loop: true, easing: 'easeInOutSine'
            });
          }
        });
      }
      if (slots.length) {
        anime.set(slots, { opacity: 0 });
        anime({
          targets: slots, opacity: 1,
          duration: 300, delay: anime.stagger(100, { start: 2600 }), easing: 'easeOutQuad'
        });
      }
      if (arrow) {
        anime.set(arrow, { opacity: 0 });
        anime({
          targets: arrow, opacity: 1, duration: 400, delay: 3300, easing: 'easeOutQuad',
          complete: function () { arrow.classList.add('cp-dar-arrow--pulse'); }
        });
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

    /* ── Page 5.0 — concept-intro entrance ─────────── */
    conceptIntroEntrance: function () {
      var wrap = document.querySelector('.cp-ci-wrap');
      if (!wrap) return;

      var topLabel     = wrap.querySelector('.cp-ci-top-label');
      var headlineCard = wrap.querySelector('.cp-ci-headline-card');
      var exRows       = Array.prototype.slice.call(wrap.querySelectorAll('.cp-ci-ex-row'));
      var btn          = wrap.querySelector('.cp-ci-btn');

      if (typeof anime === 'undefined') {
        [topLabel, headlineCard, btn].forEach(function (el) { if (el) el.style.opacity = '1'; });
        exRows.forEach(function (el) { el.style.opacity = '1'; });
        return;
      }

      /* Step 1 — top label */
      if (topLabel) {
        anime.set(topLabel, { opacity: 0, translateY: -12 });
        anime({ targets: topLabel, opacity: 1, translateY: 0, duration: 480, easing: 'easeOutQuad' });
      }
      /* Step 2 — headline card */
      if (headlineCard) {
        anime.set(headlineCard, { opacity: 0, translateY: 18 });
        anime({ targets: headlineCard, opacity: 1, translateY: 0, duration: 500, delay: 400, easing: 'easeOutBack' });
      }
      /* Step 3 — example rows staggered */
      if (exRows.length) {
        anime.set(exRows, { opacity: 0, translateX: -16 });
        anime({ targets: exRows, opacity: 1, translateX: 0, duration: 420,
                delay: anime.stagger(150, { start: 900 }), easing: 'easeOutQuad' });
      }
      /* Step 4 — button slide-up then glow pulse */
      if (btn) {
        anime.set(btn, { opacity: 0, translateY: 20 });
        anime({ targets: btn, opacity: 1, translateY: 0, duration: 460, delay: 1700, easing: 'easeOutBack',
          complete: function () { btn.classList.add('cp-ci-btn--pulse'); }
        });
      }
    },

    /* ── Section 10.2 — End Screen ──────────────────── */
    endScreenEntrance: function () {
      var btns = document.querySelectorAll('.cp-es-btn');
      if (typeof anime === 'undefined') {
        btns.forEach(function (b) { b.style.opacity = '1'; b.style.transform = 'none'; });
        return;
      }
      if (btns.length) {
        anime.set(btns, { opacity: 0, translateY: 80 });
        anime({ targets: btns, opacity: 1, translateY: 0,
                duration: 600, delay: anime.stagger(150), easing: 'easeOutBack' });
      }
    },

    /* ── Page 2.0 — section-intro (Addition) ─────────────── */
    sectionIntroAddition: function () {
      var wrap  = document.querySelector('.cp-section-intro');
      var card  = wrap && wrap.querySelector('.cp-si-card');
      var icon  = wrap && wrap.querySelector('.cp-si-icon');

      if (typeof anime === 'undefined') {
        if (icon)  icon.style.opacity  = '1';
        if (card)  card.style.opacity  = '1';
        return;
      }

      /* Step 1 — background fade-in */
      if (wrap) {
        anime.set(wrap, { opacity: 0 });
        anime({ targets: wrap, opacity: 1, duration: 400, easing: 'easeOutQuad' });
      }

      /* Step 2 — icon scale + rotate-in + neon glow */
      if (icon) {
        anime.set(icon, { opacity: 0, scale: 0, rotate: -30 });
        anime({
          targets: icon,
          opacity: 1,
          scale:   [0, 1.15, 1],
          rotate:  [-30, 5, 0],
          duration: 700,
          delay: 200,
          easing: 'easeOutBack',
          complete: function () {
            /* Subtle pulse loop after entrance */
            anime({
              targets: icon,
              scale: [1, 1.06, 1],
              duration: 1200,
              easing: 'easeInOutSine',
              loop: true,
              loopDelay: 3000
            });
          }
        });
      }
    },

    /* ── Page 2.1 — addition-lab ─────────────────────────── */
    additionLab: function () {
      var wrap    = document.querySelector('.cp-addition-lab');
      if (!wrap) return;

      var title   = wrap.querySelector('.cp-title');
      var sub     = wrap.querySelector('.cp-al-subtitle');
      var topCard = wrap.querySelector('.cp-al-top-card');
      var headers = wrap.querySelectorAll('.cp-al-header-cell');
      var botCard = wrap.querySelector('.cp-al-bottom-card');

      if (typeof anime === 'undefined') {
        [title, sub, topCard, botCard].forEach(function (el) {
          if (el) el.style.opacity = '1';
        });
        return;
      }

      [title, sub, topCard, botCard].forEach(function (el) {
        if (el) anime.set(el, { opacity: 0 });
      });
      if (headers.length) anime.set(headers, { opacity: 0 });

      /* Step 1 — title slide-down (0→0.5s) */
      if (title) {
        anime.set(title, { translateY: -18 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 500, easing: 'easeOutQuad' });
      }

      /* Step 2 — subtitle fade-in (0.5→0.9s) */
      if (sub) {
        anime({ targets: sub, opacity: 1, duration: 400, delay: 500, easing: 'easeOutQuad' });
      }

      /* Step 3 — top card slide-up (0.9→1.5s) */
      if (topCard) {
        anime.set(topCard, { translateY: 22 });
        anime({ targets: topCard, opacity: 1, translateY: 0, duration: 600, delay: 900, easing: 'easeOutQuad' });
      }

      /* Step 4 — headers highlight-sweep L→R (1.5→2.2s) */
      if (headers.length) {
        anime({
          targets: headers,
          opacity: 1,
          backgroundColor: [
            { value: 'rgba(96,165,250,0.35)', duration: 160 },
            { value: 'rgba(96,165,250,0)',    duration: 300 }
          ],
          delay: anime.stagger(90, { start: 1500 }),
          easing: 'easeOutSine'
        });
      }

      /* Step 5 — bottom card slide-up (2.2→2.8s) */
      if (botCard) {
        anime.set(botCard, { translateY: 22 });
        anime({ targets: botCard, opacity: 1, translateY: 0, duration: 600, delay: 2200, easing: 'easeOutQuad' });
      }
    },

    /* ── Page 3.0 — section-intro (Subtraction) ─────────── */
    sectionIntroSubtraction: function () {
      var wrap = document.querySelector('.cp-section-intro[data-page-id="3.0"]');
      var card = wrap && wrap.querySelector('.cp-si-card');
      var icon = wrap && wrap.querySelector('.cp-si-icon');

      if (typeof anime === 'undefined') {
        if (icon) icon.style.opacity = '1';
        if (card) card.style.opacity = '1';
        return;
      }

      /* Step 1 — background fade-in */
      if (wrap) {
        anime.set(wrap, { opacity: 0 });
        anime({ targets: wrap, opacity: 1, duration: 400, easing: 'easeOutQuad' });
      }

      /* Step 2 — icon scale-in + soft glow */
      if (icon) {
        anime.set(icon, { opacity: 0, scale: 0, rotate: -30 });
        anime({
          targets: icon,
          opacity: 1,
          scale:   [0, 1.15, 1],
          rotate:  [-30, 5, 0],
          duration: 700,
          delay: 200,
          easing: 'easeOutBack',
          complete: function () {
            anime({
              targets: icon,
              scale: [1, 1.06, 1],
              duration: 1200,
              easing: 'easeInOutSine',
              loop: true,
              loopDelay: 3000
            });
          }
        });
      }
    },

    /* ── Page 4.0 — section-intro (Multiplication) ──────── */
    sectionIntroMultiplication: function () {
      var wrap = document.querySelector('.cp-section-intro[data-page-id="4.0"]');
      var card = wrap && wrap.querySelector('.cp-si-card');
      var icon = wrap && wrap.querySelector('.cp-si-icon');

      if (typeof anime === 'undefined') {
        if (icon) icon.style.opacity = '1';
        if (card) card.style.opacity = '1';
        return;
      }

      /* Step 1 — background wash fade-in (0.0s → 0.4s) */
      if (wrap) {
        anime.set(wrap, { opacity: 0 });
        anime({ targets: wrap, opacity: 1, duration: 400, easing: 'easeOutQuad' });
      }

      /* Step 2 — "×" scale-in + soft rotate + glow (0.2s → 0.9s) */
      if (icon) {
        anime.set(icon, { opacity: 0, scale: 0, rotate: -30 });
        anime({
          targets: icon,
          opacity: 1,
          scale:   [0, 1.15, 1],
          rotate:  [-30, 5, 0],
          duration: 700,
          delay: 200,
          easing: 'easeOutBack',
          complete: function () {
            anime({
              targets: icon,
              scale: [1, 1.06, 1],
              duration: 1200,
              easing: 'easeInOutSine',
              loop: true,
              loopDelay: 3000
            });
          }
        });
      }
    },

    /* ── Page 5.0 — section-intro (Division) ────────────── */
    sectionIntroDivision: function () {
      var wrap = document.querySelector('.cp-section-intro[data-page-id="5.0"]');
      var card = wrap && wrap.querySelector('.cp-si-card');
      var icon = wrap && wrap.querySelector('.cp-si-icon');

      if (typeof anime === 'undefined') {
        if (icon) icon.style.opacity = '1';
        if (card) card.style.opacity = '1';
        return;
      }

      /* Step 1 — background wash fade-in (0.0s → 0.4s) */
      if (wrap) {
        anime.set(wrap, { opacity: 0 });
        anime({ targets: wrap, opacity: 1, duration: 400, easing: 'easeOutQuad' });
      }

      /* Step 2 — "÷" scale-in + soft glow (0.2s → 0.9s) */
      if (icon) {
        anime.set(icon, { opacity: 0, scale: 0, rotate: -30 });
        anime({
          targets: icon,
          opacity: 1,
          scale:   [0, 1.15, 1],
          rotate:  [-30, 5, 0],
          duration: 700,
          delay: 200,
          easing: 'easeOutBack',
          complete: function () {
            anime({
              targets: icon,
              scale: [1, 1.06, 1],
              duration: 1200,
              easing: 'easeInOutSine',
              loop: true,
              loopDelay: 3000
            });
          }
        });
      }
    },

    /* ── Page 5.1 — division-lab ─────────────────────────── */
    divisionLab: function () {
      var wrap = document.querySelector('.cp-division-lab');
      if (!wrap) return;

      var title      = wrap.querySelector('.cp-dl-title');
      var probBar    = wrap.querySelector('.cp-dl-problem-bar');
      var shell      = wrap.querySelector('.cp-dl-shell');
      var vLine      = wrap.querySelector('.cp-dl-vline');
      var hLine      = wrap.querySelector('.cp-dl-hline');
      var divisorNum = wrap.querySelector('.cp-dl-divisor-num');
      var divCells   = wrap.querySelectorAll('.cp-dl-dividend-row .cp-dl-cell');
      var qCells     = wrap.querySelectorAll('.cp-dl-quotient-row .cp-dl-cell');
      var stepCard   = wrap.querySelector('.cp-dl-step-card');
      var helperCard = wrap.querySelector('.cp-dl-helper-card');
      var startBtn   = wrap.querySelector('.cp-dl-start-btn');

      if (typeof anime === 'undefined') {
        [title, probBar, shell, divisorNum, stepCard, helperCard, startBtn].forEach(function (el) {
          if (el) el.style.opacity = '1';
        });
        return;
      }

      [title, probBar, shell, divisorNum, stepCard, helperCard, startBtn].forEach(function (el) {
        if (el) anime.set(el, { opacity: 0 });
      });
      if (vLine) anime.set(vLine, { scaleY: 0, transformOrigin: 'top center' });
      if (hLine) anime.set(hLine, { scaleX: 0, transformOrigin: 'left center' });
      if (divCells.length) anime.set(divCells, { opacity: 0, scale: 0.8 });
      if (qCells.length)   anime.set(qCells,   { opacity: 0 });

      /* Step 1 — title slide-down (0→0.5s) */
      if (title) {
        anime.set(title, { translateY: -18 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 500, easing: 'easeOutQuad' });
      }

      /* Step 2 — problem bar pop-in with tick sounds (0.5→1.3s) */
      if (probBar) {
        anime.set(probBar, { scale: 0.88 });
        anime({ targets: probBar, opacity: 1, scale: 1, duration: 500, delay: 500, easing: 'easeOutBack',
          begin: function () {
            for (var t = 0; t < 5; t++) {
              (function (idx) {
                setTimeout(function () {
                  if (typeof playTick === 'function') playTick();
                }, idx * 130);
              })(t);
            }
          }
        });
      }

      /* Step 3 — shell slides up (1.3→2.0s) */
      if (shell) {
        anime.set(shell, { translateY: 28 });
        anime({ targets: shell, opacity: 1, translateY: 0, duration: 700, delay: 1300, easing: 'easeOutQuad' });
      }

      /* Step 4 — bracket draws in: vertical then horizontal (2.0→2.7s) */
      if (vLine) anime({ targets: vLine, scaleY: 1, duration: 350, delay: 2000, easing: 'easeOutQuad' });
      if (hLine) anime({ targets: hLine, scaleX: 1, duration: 350, delay: 2350, easing: 'easeOutQuad' });

      /* Step 5 — divisor fades in (2.4→2.8s) */
      if (divisorNum) anime({ targets: divisorNum, opacity: 1, duration: 400, delay: 2400, easing: 'easeOutQuad' });

      /* Step 6 — dividend digits pop-in L→R (2.7→3.4s, 60ms stagger) */
      if (divCells.length) {
        anime({ targets: divCells, opacity: 1, scale: [0.8, 1.1, 1],
          delay: anime.stagger(60, { start: 2700 }), duration: 300, easing: 'easeOutBack' });
      }

      /* Step 7 — empty quotient cells fade-in (3.0→3.4s) */
      if (qCells.length) {
        anime({ targets: qCells, opacity: 1,
          delay: anime.stagger(60, { start: 3000 }), duration: 280, easing: 'easeOutQuad' });
      }

      /* Steps 9+10 — step card + helper slide in from right (3.6→4.1s) */
      if (stepCard) {
        anime.set(stepCard, { translateX: 30 });
        anime({ targets: stepCard, opacity: 1, translateX: 0, duration: 500, delay: 3600, easing: 'easeOutBack' });
      }
      if (helperCard) {
        anime.set(helperCard, { translateX: 30 });
        anime({ targets: helperCard, opacity: 1, translateX: 0, duration: 500, delay: 3750, easing: 'easeOutBack' });
      }

      /* Step 11 — start button pulse-glow loop (4.2s→∞) */
      setTimeout(function () {
        if (!document.querySelector('.cp-division-lab')) return;
        if (startBtn) {
          anime({ targets: startBtn, opacity: 1, duration: 300, easing: 'easeOutQuad',
            complete: function () { startBtn.classList.add('cp-dl-start-btn--pulse'); }
          });
        }
      }, 4200);
    },

    /* ── Page 5.2 — division-practice-zero-trick ───────────── */
    divisionPracticeZeroTrick: function () {
      var wrap = document.querySelector('.cp-dpz');
      if (!wrap) return;

      var title = wrap.querySelector('.cp-dpz-title');
      var story = wrap.querySelector('.cp-dpz-story');
      var goal = wrap.querySelector('.cp-dpz-goal');
      var prompt = wrap.querySelector('.cp-dpz-prompt');
      var hint = wrap.querySelector('.cp-dpz-hint-btn');
      var input = wrap.querySelector('.cp-dpz-input');
      var numpad = wrap.querySelector('.cp-dpz-numpad');
      var countNums = wrap.querySelectorAll('.cp-dpz-count-num');

      function toIndian(n) {
        var s = String(Math.floor(n)), res = s.slice(-3), rem = s.slice(0, -3);
        while (rem.length > 0) { res = rem.slice(-2) + ',' + res; rem = rem.slice(0, -2); }
        return res;
      }

      function showFinalCounts() {
        Array.prototype.forEach.call(countNums, function (el) {
          var target = parseInt(el.dataset.target || '0', 10);
          el.textContent = el.dataset.format === 'indian' ? toIndian(target) : String(target);
        });
      }

      if (typeof anime === 'undefined') {
        [title, story, prompt, hint, input, numpad].forEach(function (el) {
          if (el) el.style.opacity = '1';
        });
        showFinalCounts();
        if (input) input.classList.add('cp-dpz-input--pulse');
        return;
      }

      [title, story, prompt, hint, input, numpad].forEach(function (el) {
        if (el) anime.set(el, { opacity: 0 });
      });
      anime.set([title, story, prompt], { translateY: -14 });
      anime.set([input, numpad], { translateY: 18 });
      anime.set(hint, { scale: 0.9 });

      Array.prototype.forEach.call(countNums, function (el) { el.textContent = '0'; });

      if (title) {
        anime({ targets: title, opacity: 1, translateY: 0, duration: 500, easing: 'easeOutQuad' });
      }

      if (story) {
        anime({
          targets: story,
          opacity: 1,
          translateY: 0,
          duration: 700,
          delay: 500,
          easing: 'easeOutQuad',
          begin: function () {
            Array.prototype.forEach.call(countNums, function (el) {
              var target = parseInt(el.dataset.target || '0', 10);
              var obj = { value: 0 };
              anime({
                targets: obj,
                value: target,
                round: 1,
                duration: target > 1000 ? 700 : 420,
                delay: target > 1000 ? 80 : 260,
                easing: 'easeOutCubic',
                update: function () {
                  el.textContent = el.dataset.format === 'indian' ? toIndian(obj.value) : String(Math.floor(obj.value));
                },
                complete: function () {
                  el.textContent = el.dataset.format === 'indian' ? toIndian(target) : String(target);
                  if (typeof playTick === 'function') playTick();
                }
              });
            });
          }
        });
      }

      if (prompt) {
        anime({ targets: prompt, opacity: 1, translateY: 0, duration: 500, delay: 1400, easing: 'easeOutQuad' });
      }

      if (goal) {
        setTimeout(function () {
          if (!document.querySelector('.cp-dpz')) return;
          anime({
            targets: goal,
            color: ['#ea580c', '#f97316', '#ea580c'],
            scale: [1, 1.03, 1],
            duration: 420,
            easing: 'easeInOutSine'
          });
        }, 1600);
      }

      if (hint) {
        anime({
          targets: hint,
          opacity: 1,
          scale: [0.9, 1.06, 1],
          duration: 420,
          delay: 1900,
          easing: 'easeOutBack'
        });
      }

      if (input) {
        anime({
          targets: input,
          opacity: 1,
          translateY: 0,
          duration: 460,
          delay: 2000,
          easing: 'easeOutQuad',
          complete: function () { input.classList.add('cp-dpz-input--pulse'); }
        });
      }

      if (numpad) {
        anime({
          targets: numpad,
          opacity: 1,
          translateY: 0,
          duration: 500,
          delay: 2120,
          easing: 'easeOutQuad'
        });
      }
    },

    /* ── Page 4.1 — multiplication-lab ──────────────────── */
    multiplicationLab: function () {
      var wrap    = document.querySelector('.cp-multiplication-lab');
      if (!wrap) return;
      var title   = wrap.querySelector('.cp-title');
      var sub     = wrap.querySelector('.cp-ml-subtitle');
      var hCard   = wrap.querySelector('.cp-ml-header-card');
      var topCard = wrap.querySelector('.cp-ml-top-card');
      var headers = wrap.querySelectorAll('.cp-ml-header-cell');
      var botCard = wrap.querySelector('.cp-ml-bottom-card');

      if (typeof anime === 'undefined') {
        [title, sub, hCard, topCard, botCard].forEach(function (el) {
          if (el) el.style.opacity = '1';
        });
        if (headers.length) Array.prototype.forEach.call(headers, function (h) { h.style.opacity = '1'; });
        return;
      }

      [title, sub, hCard, topCard, botCard].forEach(function (el) {
        if (el) anime.set(el, { opacity: 0 });
      });
      if (headers.length) anime.set(headers, { opacity: 0 });

      /* Step 1 — title slide-down (0→0.5s) */
      if (title) {
        anime.set(title, { translateY: -18 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 500, easing: 'easeOutQuad' });
      }
      /* Step 2 — subtitle fade-in (0.5→0.9s) */
      if (sub) anime({ targets: sub, opacity: 1, duration: 400, delay: 500, easing: 'easeOutQuad' });

      /* Step 3 — header card pop-in (0.9→1.3s) */
      if (hCard) {
        anime.set(hCard, { scale: 0.85 });
        anime({ targets: hCard, opacity: 1, scale: 1, duration: 400, delay: 900, easing: 'easeOutBack' });
      }
      /* Step 4 — board slide-up (1.3→1.9s) */
      if (topCard) {
        anime.set(topCard, { translateY: 22 });
        anime({ targets: topCard, opacity: 1, translateY: 0, duration: 600, delay: 1300, easing: 'easeOutQuad' });
      }
      /* Step 5 — header cells glow sweep L→R (1.9→2.4s) */
      if (headers.length) {
        anime({
          targets: headers, opacity: 1,
          backgroundColor: [
            { value: 'rgba(168,85,247,0.35)', duration: 160 },
            { value: 'rgba(168,85,247,0)',    duration: 300 }
          ],
          delay: anime.stagger(90, { start: 1900 }), easing: 'easeOutSine'
        });
      }
      /* Step 6 — source panel slide-up (2.2→2.8s) */
      if (botCard) {
        anime.set(botCard, { translateY: 22 });
        anime({ targets: botCard, opacity: 1, translateY: 0, duration: 600, delay: 2200, easing: 'easeOutQuad' });
      }
    },

    /* ── Page 3.1 — subtraction-lab ─────────────────────── */
    subtractionLab: function () {
      var wrap    = document.querySelector('.cp-subtraction-lab');
      if (!wrap) return;

      var title   = wrap.querySelector('.cp-title');
      var sub     = wrap.querySelector('.cp-al-subtitle');
      var topCard = wrap.querySelector('.cp-al-top-card');
      var headers = wrap.querySelectorAll('.cp-al-header-cell');
      var botCard = wrap.querySelector('.cp-al-bottom-card');

      if (typeof anime === 'undefined') {
        [title, sub, topCard, botCard].forEach(function (el) {
          if (el) el.style.opacity = '1';
        });
        return;
      }

      [title, sub, topCard, botCard].forEach(function (el) {
        if (el) anime.set(el, { opacity: 0 });
      });
      if (headers.length) anime.set(headers, { opacity: 0 });

      /* Step 1 — title slide-down */
      if (title) {
        anime.set(title, { translateY: -18 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 500, easing: 'easeOutQuad' });
      }

      /* Step 2 — subtitle fade-in */
      if (sub) {
        anime({ targets: sub, opacity: 1, duration: 400, delay: 500, easing: 'easeOutQuad' });
      }

      /* Step 3 — top card slide-up */
      if (topCard) {
        anime.set(topCard, { translateY: 22 });
        anime({ targets: topCard, opacity: 1, translateY: 0, duration: 600, delay: 900, easing: 'easeOutQuad' });
      }

      /* Step 4 — headers highlight-sweep L→R */
      if (headers.length) {
        anime({
          targets: headers,
          opacity: 1,
          backgroundColor: [
            { value: 'rgba(251,146,60,0.35)', duration: 160 },
            { value: 'rgba(251,146,60,0)',    duration: 300 }
          ],
          delay: anime.stagger(90, { start: 1500 }),
          easing: 'easeOutSine'
        });
      }

      /* Step 5 — bottom card slide-up */
      if (botCard) {
        anime.set(botCard, { translateY: 22 });
        anime({ targets: botCard, opacity: 1, translateY: 0, duration: 600, delay: 2200, easing: 'easeOutQuad' });
      }
    },

    /* ── Page 4.2 — multiplication-builder ──────────────────── */
    multiplicationBuilder: function () {
      var wrap     = document.querySelector('.cp-mb[data-page-id="4.2"]');
      if (!wrap) return;
      var title    = wrap.querySelector('.cp-title');
      var story    = wrap.querySelector('.cp-mb-story');
      var prompt   = wrap.querySelector('.cp-mb-prompt');
      var box1     = wrap.querySelector('.cp-mb-box--1');
      var numpad   = wrap.querySelector('.cp-mb-numpad');
      var goalEl   = wrap.querySelector('.cp-mb-goal');
      var splitNum = wrap.querySelector('.cp-mb-split-viz-num');
      var splitPts = wrap.querySelector('.cp-mb-split-viz-parts');

      if (typeof anime === 'undefined') {
        [title, story, prompt, box1, numpad].forEach(function (el) {
          if (el) el.style.opacity = '1';
        });
        return;
      }

      [title, story, prompt, box1, numpad].forEach(function (el) {
        if (el) anime.set(el, { opacity: 0 });
      });

      /* Step 1 — title slide-down (0→0.5s) */
      if (title) {
        anime.set(title, { translateY: -18 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 500, easing: 'easeOutQuad' });
      }
      /* Step 2 — story card slides down (0.5→1.2s) */
      if (story) {
        anime.set(story, { translateY: -20 });
        anime({ targets: story, opacity: 1, translateY: 0, duration: 700, delay: 500, easing: 'easeOutQuad' });
      }
      /* Step 3 — goal pulse once (1.8→2.2s) */
      if (goalEl) {
        setTimeout(function () {
          if (!document.querySelector('.cp-mb[data-page-id="4.2"]')) return;
          anime({
            targets: goalEl,
            backgroundColor: ['rgba(249,115,22,0)', 'rgba(249,115,22,0.18)', 'rgba(249,115,22,0)'],
            duration: 600, easing: 'easeInOutSine'
          });
        }, 1800);
      }
      /* Step 4 — prompt fade-in (1.4→1.8s) */
      if (prompt) {
        anime({ targets: prompt, opacity: 1, duration: 400, delay: 1400, easing: 'easeOutQuad' });
      }
      /* Step 5 — box1 slides in from left (1.6→2.2s) */
      if (box1) {
        anime.set(box1, { translateX: -24 });
        anime({ targets: box1, opacity: 1, translateX: 0, duration: 600, delay: 1600, easing: 'easeOutQuad' });
      }
      /* Step 6 — numpad slides in from right (1.8→2.4s) */
      if (numpad) {
        anime.set(numpad, { translateX: 24 });
        anime({ targets: numpad, opacity: 1, translateX: 0, duration: 600, delay: 1800, easing: 'easeOutQuad' });
      }
      /* Step 7 — split visualizer: "24" fades, "20 + 4" appears (2.4→4.0s) */
      if (splitNum && splitPts) {
        setTimeout(function () {
          if (!document.querySelector('.cp-mb[data-page-id="4.2"]')) return;
          anime({
            targets: splitNum, opacity: [1, 0], duration: 300, easing: 'easeInQuad',
            complete: function () {
              splitPts.style.display = 'flex';
              anime.set(splitPts, { opacity: 0, scale: 0.8 });
              anime({ targets: splitPts, opacity: 1, scale: 1, duration: 500, easing: 'easeOutBack' });
            }
          });
        }, 2400);
      }
    },

    /* ── Page 4.3 — multiply-and-check ──────────────────────── */
    multiplyAndCheck: function () {
      var wrap   = document.querySelector('.cp-mac[data-page-id="4.3"]');
      if (!wrap) return;
      var title  = wrap.querySelector('.cp-title');
      var story  = wrap.querySelector('.cp-mac-story');
      var prompt = wrap.querySelector('.cp-mac-prompt');
      var row1   = wrap.querySelector('.cp-mac-row--1');
      var numpad = wrap.querySelector('.cp-mac-numpad');
      var goalEl = wrap.querySelector('.cp-mac-goal');

      if (typeof anime === 'undefined') {
        [title, story, prompt, row1, numpad].forEach(function (el) {
          if (el) el.style.opacity = '1';
        });
        return;
      }

      [title, story, prompt, row1, numpad].forEach(function (el) {
        if (el) anime.set(el, { opacity: 0 });
      });

      /* Step 1 — title slide-down (0→0.5s) */
      if (title) {
        anime.set(title, { translateY: -18 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 500, easing: 'easeOutQuad' });
      }
      /* Step 2 — story slides down (0.5→1.2s) */
      if (story) {
        anime.set(story, { translateY: -18 });
        anime({ targets: story, opacity: 1, translateY: 0, duration: 700, delay: 500, easing: 'easeOutQuad' });
      }
      /* Step 3 — goal highlight pulse (1.6→2.0s) */
      if (goalEl) {
        setTimeout(function () {
          if (!document.querySelector('.cp-mac[data-page-id="4.3"]')) return;
          anime({
            targets: goalEl,
            backgroundColor: ['rgba(249,115,22,0)', 'rgba(249,115,22,0.18)', 'rgba(249,115,22,0)'],
            duration: 500, easing: 'easeInOutSine'
          });
        }, 1600);
      }
      /* Step 4 — prompt fade-in (1.4→1.8s) */
      if (prompt) {
        anime({ targets: prompt, opacity: 1, duration: 400, delay: 1400, easing: 'easeOutQuad' });
      }
      /* Step 5 — row1 slides in (1.8→2.4s) */
      if (row1) {
        anime.set(row1, { translateY: 16 });
        anime({ targets: row1, opacity: 1, translateY: 0, duration: 600, delay: 1800, easing: 'easeOutQuad' });
      }
      /* Step 6 — numpad slides in from right (2.0→2.6s) */
      if (numpad) {
        anime.set(numpad, { translateX: 24 });
        anime({ targets: numpad, opacity: 1, translateX: 0, duration: 600, delay: 2000, easing: 'easeOutQuad' });
      }
    },

    /* ── Page 6.1 — Two-Step Story entrance ─────── */
    twoStepStory1: function () {
      var wrap = document.querySelector('.cp-ts-wrap[data-page-id="6.1"]');
      if (!wrap) return;

      var title     = wrap.querySelector('.cp-ts-title');
      var storyCard = wrap.querySelector('.cp-ts-story');
      var stepCard  = wrap.querySelector('.cp-ts-step-card');
      var chip      = wrap.querySelector('.cp-ts-chip');
      var lead      = wrap.querySelector('.cp-ts-lead');
      var ask       = wrap.querySelector('.cp-ts-ask');
      var qLine     = wrap.querySelector('.cp-ts-story-line--question');
      var opBtns    = wrap.querySelectorAll('.cp-ts-op-btn');

      if (typeof anime === 'undefined') {
        [title, storyCard, stepCard, chip, lead, ask].forEach(function (el) {
          if (el) el.style.opacity = '1';
        });
        if (opBtns.length) {
          Array.prototype.forEach.call(opBtns, function (b) { b.style.opacity = '1'; });
        }
        return;
      }

      /* Step 1 — title slide-down */
      if (title) {
        anime.set(title, { opacity: 0, translateY: -18 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 500, easing: 'easeOutQuad' });
      }
      /* Step 2 — story card slides in */
      if (storyCard) {
        anime.set(storyCard, { opacity: 0, translateY: -20 });
        anime({ targets: storyCard, opacity: 1, translateY: 0, duration: 700, delay: 500, easing: 'easeOutQuad' });
      }
      /* Step 3 — question line gold pulse */
      if (qLine) {
        setTimeout(function () {
          anime({
            targets: qLine,
            backgroundColor: ['rgba(180,83,9,0)', 'rgba(180,83,9,0.12)', 'rgba(180,83,9,0)'],
            duration: 500, delay: 1600, easing: 'easeInOutSine'
          });
        }, 1600);
      }
      /* Step 4 — step card slides up */
      if (stepCard) {
        anime.set(stepCard, { opacity: 0, translateY: 20 });
        anime({ targets: stepCard, opacity: 1, translateY: 0, duration: 700, delay: 1300, easing: 'easeOutQuad' });
      }
      /* Step 5 — chip bounces in */
      if (chip) {
        anime.set(chip, { opacity: 0, scale: 0.6 });
        anime({ targets: chip, opacity: 1, scale: [0.6, 1.1, 1], duration: 350, delay: 2000, easing: 'easeOutBack' });
      }
      /* Step 6 — lead + ask fade in */
      if (lead) {
        anime.set(lead, { opacity: 0 });
        anime({ targets: lead, opacity: 1, duration: 400, delay: 2300, easing: 'easeOutQuad' });
      }
      if (ask) {
        anime.set(ask, { opacity: 0 });
        anime({ targets: ask, opacity: 1, duration: 400, delay: 2460, easing: 'easeOutQuad' });
      }
      /* Step 7 — op buttons cascade-pop */
      if (opBtns.length) {
        anime.set(opBtns, { opacity: 0, scale: 0.4 });
        anime({
          targets: opBtns,
          opacity: 1,
          scale: [0.4, 1.12, 1],
          duration: 300,
          delay: anime.stagger(80, { start: 3400 }),
          easing: 'easeOutBack'
        });
      }
    },

    /* ── Page 6.2 — Operation HQ entrance ───────── */
    operationHQ: function () {
      var wrap = document.querySelector('.cp-hq-wrap[data-page-id="6.2"]');
      if (!wrap) return;

      var header    = wrap.querySelector('.cp-hq-header');
      var title     = wrap.querySelector('.cp-hq-title');
      var roundCard = wrap.querySelector('.cp-hq-round-card');
      var opBtns    = wrap.querySelectorAll('.cp-hq-op-btn');

      if (typeof anime === 'undefined') {
        [header, title, roundCard].forEach(function (el) {
          if (el) el.style.opacity = '1';
        });
        if (opBtns.length) {
          Array.prototype.forEach.call(opBtns, function (b) { b.style.opacity = '1'; });
        }
        return;
      }

      /* Step 1 — title fade-in */
      if (title) {
        anime.set(title, { opacity: 0 });
        anime({ targets: title, opacity: 1, duration: 500, easing: 'easeOutQuad' });
      }
      /* Step 2 — header strip slides down */
      if (header) {
        anime.set(header, { opacity: 0, translateY: -24 });
        anime({ targets: header, opacity: 1, translateY: 0, duration: 600, easing: 'easeOutBack' });
      }
      /* Step 3 — round card slides up */
      if (roundCard) {
        anime.set(roundCard, { opacity: 0, translateY: 18 });
        anime({ targets: roundCard, opacity: 1, translateY: 0, duration: 600, delay: 500, easing: 'easeOutQuad' });
      }
      /* Op buttons are animated by loadHqRound() in the renderer with a 1600ms start delay
         to run after the structural entrance above. No separate animation needed here. */
    },

    /* ══════════════════════════════════════════════════════
       PAGE 6.3 — Number Solver entrance
    ══════════════════════════════════════════════════════ */
    numberSolver: function () {
      var wrap = document.querySelector('.cp-ns-wrap[data-page-id="6.3"]');
      if (!wrap) return;

      var title    = wrap.querySelector('.cp-title');
      var subtitle = wrap.querySelector('.cp-subtitle');
      var chip     = wrap.querySelector('.cp-ns-chip');
      var cards    = wrap.querySelectorAll('.cp-ns-card');

      if (typeof anime === 'undefined') {
        if (title)    title.style.opacity = '1';
        if (subtitle) subtitle.style.opacity = '1';
        if (chip)     chip.style.opacity = '1';
        Array.prototype.slice.call(cards).forEach(function (c) { c.style.opacity = '1'; });
        return;
      }

      if (title) {
        anime.set(title, { opacity: 0, translateY: -12 });
        anime({ targets: title, opacity: 1, translateY: 0, duration: 380, easing: 'easeOutQuad' });
      }
      if (subtitle) {
        anime.set(subtitle, { opacity: 0 });
        anime({ targets: subtitle, opacity: 1, duration: 300, delay: 500, easing: 'easeOutQuad' });
      }
      if (chip) {
        anime.set(chip, { opacity: 0, scale: 0.7 });
        anime({ targets: chip, opacity: 1, scale: 1, duration: 350, delay: 900, easing: 'easeOutBack' });
      }
      if (cards.length) {
        anime.set(cards, { opacity: 0, scale: 0.88, translateY: 20 });
        anime({
          targets: Array.prototype.slice.call(cards),
          opacity: 1, scale: 1, translateY: 0,
          duration: 480,
          delay: anime.stagger(100, { start: 1200 }),
          easing: 'easeOutBack'
        });
      }
    },

    /* ══════════════════════════════════════════════════════
       PAGE 6.4 — Operation Rush entrance
    ══════════════════════════════════════════════════════ */
    operationRush: function () {
      /* entrance handled inline by the renderer (inner fade-up); nothing extra needed */
    },

    /* ══════════════════════════════════════════════════════
       PAGE 6.5 — Operation Master entrance
    ══════════════════════════════════════════════════════ */
    operationMaster: function () {
      var wrap = document.querySelector('.cp-om-wrap[data-page-id="6.5"]');
      if (!wrap) return;

      var star     = wrap.querySelector('.cp-om-star');
      var title    = wrap.querySelector('.cp-om-title');
      var subtitle = wrap.querySelector('.cp-om-subtitle');
      var badges   = wrap.querySelectorAll('.cp-om-badge');
      var count    = wrap.querySelector('.cp-om-count');
      var playBtn  = wrap.querySelector('.cp-om-play-btn');

      if (typeof anime === 'undefined') {
        if (star)     star.style.opacity = '1';
        if (title)    title.style.opacity = '1';
        if (subtitle) subtitle.style.opacity = '1';
        Array.prototype.slice.call(badges).forEach(function (b) { b.style.opacity = '1'; });
        if (count)   count.style.opacity = '1';
        if (playBtn) playBtn.style.opacity = '1';
        return;
      }

      if (star) {
        anime.set(star, { opacity: 0, scale: 0, rotate: -30 });
        anime({ targets: star, opacity: 1, scale: 1, rotate: 0, duration: 600, delay: 200, easing: 'easeOutBack' });
      }
      if (title) {
        anime.set(title, { opacity: 0, scale: 0.85 });
        anime({ targets: title, opacity: 1, scale: 1, duration: 600, delay: 600, easing: 'easeOutBack' });
      }
      if (subtitle) {
        anime.set(subtitle, { opacity: 0, translateY: 12 });
        anime({ targets: subtitle, opacity: 1, translateY: 0, duration: 400, delay: 1600, easing: 'easeOutQuad' });
      }
      if (badges.length) {
        anime.set(badges, { opacity: 0, scale: 0, translateY: 20 });
        anime({
          targets: Array.prototype.slice.call(badges),
          opacity: 1, scale: 1, translateY: 0,
          duration: 500,
          delay: anime.stagger(350, { start: 2100 }),
          easing: 'easeOutBack'
        });
      }
      if (count) {
        anime.set(count, { opacity: 0 });
        anime({ targets: count, opacity: 1, duration: 400, delay: 5200, easing: 'easeOutQuad' });
      }
      if (playBtn) {
        anime.set(playBtn, { opacity: 0, translateY: 20 });
        anime({
          targets: playBtn,
          opacity: 1, translateY: 0,
          duration: 500,
          delay: 5600,
          easing: 'easeOutBack',
          complete: function () { playBtn.classList.add('cp-om-play-btn--pulse'); }
        });
      }
    },

    /* ── BODMAS Section 2 Animations ── */

    bodmasAsk: function () {
      var wrap  = document.querySelector('.cp-ba-wrap');
      if (!wrap) return;

      var titleEl = wrap.querySelector('.cp-ba-title');
      var packs   = Array.prototype.slice.call(wrap.querySelectorAll('.cp-ba-pack'));
      var loose   = Array.prototype.slice.call(wrap.querySelectorAll('.cp-ba-loose'));
      var plusSep = wrap.querySelector('.cp-ba-plus-sep');
      var expr    = wrap.querySelector('.cp-ba-expr');
      var qEl     = wrap.querySelector('.cp-ba-question');
      var cta     = wrap.querySelector('.cp-ba-cta');

      if (typeof anime === 'undefined') {
        [titleEl, expr, qEl, cta].forEach(function (el) { if (el) el.style.opacity = '1'; });
        packs.forEach(function (p) { p.style.opacity = '1'; });
        if (plusSep) plusSep.style.opacity = '1';
        loose.forEach(function (l) { l.style.opacity = '1'; });
        if (cta) cta.classList.add('cp-ba-cta--pulse');
        return;
      }

      /* Step 1 — heading slide down */
      if (titleEl) {
        anime.set(titleEl, { opacity: 0, translateY: -16 });
        anime({ targets: titleEl, opacity: 1, translateY: 0, duration: 520, easing: 'easeOutQuad' });
      }

      /* Step 2 — crayon packs pop in one by one */
      if (packs.length) {
        anime.set(packs, { opacity: 0, scale: 0.55 });
        anime({
          targets: packs,
          opacity: 1,
          scale: [0.55, 1.12, 1],
          duration: 430,
          delay: anime.stagger(260, { start: 380 }),
          easing: 'easeOutBack'
        });
      }

      /* Step 3 — plus separator + loose crayons drop in with bounce */
      if (plusSep) {
        anime.set(plusSep, { opacity: 0, translateY: -28 });
        anime({ targets: plusSep, opacity: 1, translateY: 0, duration: 400, delay: 1160, easing: 'easeOutBounce' });
      }
      if (loose.length) {
        anime.set(loose, { opacity: 0, translateY: -28 });
        anime({
          targets: loose,
          opacity: 1,
          translateY: 0,
          duration: 400,
          delay: anime.stagger(110, { start: 1280 }),
          easing: 'easeOutBounce'
        });
      }

      /* Step 4 — expression scale-up pop + glow */
      if (expr) {
        anime.set(expr, { opacity: 0, scale: 0.8 });
        anime({
          targets: expr,
          opacity: 1,
          scale: 1,
          duration: 560,
          delay: 1680,
          easing: 'easeOutBack',
          complete: function () {
            if (typeof playHintPop === 'function') playHintPop();
            expr.classList.add('cp-ba-expr--glow');
            setTimeout(function () { expr.classList.remove('cp-ba-expr--glow'); }, 750);
          }
        });
      }

      /* Step 5 — question fade in */
      if (qEl) {
        anime.set(qEl, { opacity: 0 });
        anime({ targets: qEl, opacity: 1, duration: 460, delay: 2340, easing: 'easeOutQuad' });
      }

      /* Step 6 — CTA fade up + idle breathe */
      if (cta) {
        anime.set(cta, { opacity: 0, translateY: 18 });
        anime({
          targets: cta,
          opacity: 1,
          translateY: 0,
          duration: 490,
          delay: 2920,
          easing: 'easeOutBack',
          complete: function () { cta.classList.add('cp-ba-cta--pulse'); }
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

    bodmasReveal: function () {
      var wrap  = document.querySelector('.cp-br-wrap');
      if (!wrap) return;

      var card   = wrap.querySelector('.cp-br-card');
      var badge  = wrap.querySelector('.cp-br-card__badge');
      var lines  = Array.prototype.slice.call(wrap.querySelectorAll('.cp-br-worked__line'));
      var tag    = wrap.querySelector('.cp-br-bodmas-tag');
      var chips  = Array.prototype.slice.call(wrap.querySelectorAll('.cp-br-chip'));
      var btns   = Array.prototype.slice.call(wrap.querySelectorAll('.cp-br-btn'));

      if (typeof anime === 'undefined') {
        [card, badge, tag].forEach(function (el) { if (el) el.style.opacity = '1'; });
        lines.forEach(function (l) { l.style.opacity = '1'; });
        chips.forEach(function (c) { c.style.opacity = '1'; });
        btns.forEach(function (b) { b.style.opacity = '1'; });
        return;
      }

      /* Step 1 — card scale in */
      if (card) {
        anime.set(card, { opacity: 0, scale: 0.86 });
        anime({ targets: card, opacity: 1, scale: 1, duration: 490, easing: 'easeOutBack' });
      }

      /* Step 2 — badge pop + confetti */
      if (badge) {
        anime.set(badge, { opacity: 0, scale: 0.55 });
        anime({
          targets: badge,
          opacity: 1,
          scale: [0.55, 1.22, 1],
          duration: 440,
          delay: 380,
          easing: 'easeOutBack',
          complete: function () {
            if (typeof playTick === 'function') playTick();
          }
        });
      }

      /* Step 3 — worked example lines reveal one by one */
      if (lines.length) {
        anime.set(lines, { opacity: 0, translateX: -18 });
        anime({
          targets: lines,
          opacity: 1,
          translateX: 0,
          duration: 390,
          delay: anime.stagger(260, { start: 900 }),
          easing: 'easeOutQuad'
        });
      }

      /* Step 4 — BODMAS tag */
      if (tag) {
        anime.set(tag, { opacity: 0 });
        anime({ targets: tag, opacity: 1, duration: 410, delay: 1740, easing: 'easeOutQuad' });
      }

      /* Step 5 — recap chips stagger slide up */
      if (chips.length) {
        anime.set(chips, { opacity: 0, translateY: 18 });
        anime({
          targets: chips,
          opacity: 1,
          translateY: 0,
          duration: 370,
          delay: anime.stagger(190, { start: 2160 }),
          easing: 'easeOutBack'
        });
      }

      /* Step 6 — buttons fade up + pulse */
      if (btns.length) {
        anime.set(btns, { opacity: 0 });
        anime({
          targets: btns,
          opacity: 1,
          duration: 330,
          delay: anime.stagger(110, { start: 2680 }),
          easing: 'easeOutQuad',
          complete: function () {
            btns.forEach(function (b) { b.classList.add('cp-br-btn--pulse'); });
          }
        });
      }
    },

    bodmasPractice: function () {
      var bar  = document.querySelector('.cp-bp-progress-bar');
      var card = document.querySelector('.cp-bp-card');

      if (typeof anime === 'undefined') {
        if (bar)  bar.style.opacity  = '1';
        if (card) card.style.opacity = '1';
        return;
      }

      if (bar) {
        anime.set(bar, { opacity: 0 });
        anime({ targets: bar, opacity: 1, duration: 340, easing: 'easeOutQuad' });
      }
      if (card) {
        anime.set(card, { opacity: 0, scale: 0.88 });
        anime({ targets: card, opacity: 1, scale: 1, duration: 520, delay: 110, easing: 'easeOutBack' });
      }
    },

    /* ── Section 03 animations ── */

    mbsAsk: function () {
      var wrap     = document.querySelector('.cp-mba-wrap');
      if (!wrap) return;

      var titleEl  = wrap.querySelector('.cp-mba-title');
      var pile     = wrap.querySelector('.cp-mba-pile');
      var counter  = wrap.querySelector('.cp-mba-pile__count');
      var minusSep = wrap.querySelector('.cp-mba-minus-sep');
      var baskets  = Array.prototype.slice.call(wrap.querySelectorAll('.cp-mba-basket'));
      var expr     = wrap.querySelector('.cp-mba-expr');
      var qEl      = wrap.querySelector('.cp-mba-question');
      var cta      = wrap.querySelector('.cp-mba-cta');

      if (typeof anime === 'undefined') {
        [titleEl, pile, minusSep, expr, qEl, cta].forEach(function (el) { if (el) el.style.opacity = '1'; });
        baskets.forEach(function (b) { b.style.opacity = '1'; });
        if (counter) counter.textContent = '20';
        if (cta) cta.classList.add('cp-mba-cta--pulse');
        return;
      }

      /* Step 1 — heading slide down */
      if (titleEl) {
        anime.set(titleEl, { opacity: 0, translateY: -16 });
        anime({ targets: titleEl, opacity: 1, translateY: 0, duration: 520, easing: 'easeOutQuad' });
      }

      /* Step 2 — banana pile pop in + count-up 0 → 20 */
      if (pile) {
        anime.set(pile, { opacity: 0, scale: 0.55 });
        anime({
          targets: pile,
          opacity: 1,
          scale: [0.55, 1.12, 1],
          duration: 430,
          delay: 380,
          easing: 'easeOutBack',
          begin: function () {
            if (typeof playCountUpTick === 'function') playCountUpTick();
          }
        });
      }
      if (counter) {
        var obj = { val: 0 };
        anime({
          targets: obj,
          val: 20,
          round: 1,
          duration: 800,
          delay: 600,
          easing: 'easeOutQuad',
          update: function () { counter.textContent = String(Math.round(obj.val)); }
        });
      }

      /* Step 3 — minus separator bounce */
      if (minusSep) {
        anime.set(minusSep, { opacity: 0, translateY: -28 });
        anime({ targets: minusSep, opacity: 1, translateY: 0, duration: 400, delay: 1500, easing: 'easeOutBounce' });
      }

      /* Step 4 — baskets drop in one by one */
      if (baskets.length) {
        anime.set(baskets, { opacity: 0, translateY: -28 });
        anime({
          targets: baskets,
          opacity: 1,
          translateY: 0,
          duration: 400,
          delay: anime.stagger(260, { start: 1600 }),
          easing: 'easeOutBounce',
          begin: function () {
            if (typeof playStarPop === 'function') playStarPop();
          }
        });
      }

      /* Step 5 — expression pop + glow */
      if (expr) {
        anime.set(expr, { opacity: 0, scale: 0.8 });
        anime({
          targets: expr,
          opacity: 1,
          scale: 1,
          duration: 560,
          delay: 2300,
          easing: 'easeOutBack',
          complete: function () {
            if (typeof playHintPop === 'function') playHintPop();
            expr.classList.add('cp-mba-expr--glow');
            setTimeout(function () { expr.classList.remove('cp-mba-expr--glow'); }, 750);
          }
        });
      }

      /* Step 6 — question fade in */
      if (qEl) {
        anime.set(qEl, { opacity: 0 });
        anime({ targets: qEl, opacity: 1, duration: 460, delay: 2960, easing: 'easeOutQuad' });
      }

      /* Step 7 — CTA fade up + idle breathe */
      if (cta) {
        anime.set(cta, { opacity: 0, translateY: 18 });
        anime({
          targets: cta,
          opacity: 1,
          translateY: 0,
          duration: 490,
          delay: 3400,
          easing: 'easeOutBack',
          complete: function () { cta.classList.add('cp-mba-cta--pulse'); }
        });
      }
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

    mbsReveal: function () {
      var wrap  = document.querySelector('.cp-br-wrap');
      if (!wrap) return;

      var card    = wrap.querySelector('.cp-br-card');
      var badge   = wrap.querySelector('.cp-br-card__badge');
      var lines   = Array.prototype.slice.call(wrap.querySelectorAll('.cp-br-worked__line'));
      var tag     = wrap.querySelector('.cp-br-bodmas-tag');
      var connect = wrap.querySelector('.cp-br-connect');
      var chips   = Array.prototype.slice.call(wrap.querySelectorAll('.cp-br-chip'));
      var btns    = Array.prototype.slice.call(wrap.querySelectorAll('.cp-br-btn'));

      if (typeof anime === 'undefined') {
        [card, badge, tag, connect].forEach(function (el) { if (el) el.style.opacity = '1'; });
        lines.forEach(function (l) { l.style.opacity = '1'; });
        chips.forEach(function (c) { c.style.opacity = '1'; });
        btns.forEach(function (b) { b.style.opacity = '1'; });
        return;
      }

      /* Step 1 — card scale in */
      if (card) {
        anime.set(card, { opacity: 0, scale: 0.86 });
        anime({ targets: card, opacity: 1, scale: 1, duration: 490, easing: 'easeOutBack' });
      }

      /* Step 2 — badge pop */
      if (badge) {
        anime.set(badge, { opacity: 0, scale: 0.55 });
        anime({ targets: badge, opacity: 1, scale: [0.55, 1.18, 1], duration: 480, delay: 320, easing: 'easeOutBack' });
      }

      /* Step 3 — worked lines reveal */
      if (lines.length) {
        anime.set(lines, { opacity: 0 });
        anime({
          targets: lines,
          opacity: 1,
          duration: 320,
          delay: anime.stagger(380, { start: 900 }),
          easing: 'easeOutQuad',
          begin: function () { if (typeof playTick === 'function') playTick(); }
        });
      }

      /* Step 4 — BODMAS tag */
      if (tag) {
        anime.set(tag, { opacity: 0 });
        anime({ targets: tag, opacity: 1, duration: 360, delay: 2100, easing: 'easeOutQuad' });
      }

      /* Step 5 — connect line */
      if (connect) {
        anime.set(connect, { opacity: 0 });
        anime({ targets: connect, opacity: 1, duration: 340, delay: 2450, easing: 'easeOutQuad' });
      }

      /* Step 6 — recap chips slide up */
      if (chips.length) {
        anime.set(chips, { opacity: 0, translateY: 18 });
        anime({
          targets: chips,
          opacity: 1,
          translateY: 0,
          duration: 370,
          delay: anime.stagger(190, { start: 2800 }),
          easing: 'easeOutBack'
        });
      }

      /* Step 7 — buttons fade up + pulse */
      if (btns.length) {
        anime.set(btns, { opacity: 0 });
        anime({
          targets: btns,
          opacity: 1,
          duration: 330,
          delay: anime.stagger(110, { start: 3280 }),
          easing: 'easeOutQuad',
          complete: function () {
            btns.forEach(function (b) { b.classList.add('cp-br-btn--pulse'); });
          }
        });
      }
    },

    mbsPractice: function () {
      var bar  = document.querySelector('.cp-bp-progress-bar');
      var card = document.querySelector('.cp-bp-card');

      if (typeof anime === 'undefined') {
        if (bar)  bar.style.opacity  = '1';
        if (card) card.style.opacity = '1';
        return;
      }

      if (bar) {
        anime.set(bar, { opacity: 0 });
        anime({ targets: bar, opacity: 1, duration: 340, easing: 'easeOutQuad' });
      }
      if (card) {
        anime.set(card, { opacity: 0, scale: 0.88 });
        anime({ targets: card, opacity: 1, scale: 1, duration: 520, delay: 110, easing: 'easeOutBack' });
      }
    }

  };

  return { run: run };

}());
