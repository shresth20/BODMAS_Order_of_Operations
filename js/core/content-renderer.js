/* content-renderer.js — Dispatches page data to type-specific renderers.
   Depends on: CONTENT_PAGES, ContentAnimations */

var ContentRenderer = (function () {

  var _currentPageId  = null;
  var _s9Round        = 0;     /* 0-indexed round shown in 9.0 */
  var _s9FromFeedback = false; /* set true when 9.1 navigates back to 9.0 */
  var _additionLabResult       = null; /* { firstNumber, secondNumber } — set by 2.1, read by 2.2 */
  var _subtractionLabResult    = null; /* { firstNumber, secondNumber } — set by 3.1, read by 3.2 */
  var _multiplicationLabResult = null; /* { bigNumber, multiplier, product } — set by 4.1, read by 4.2 */

  /* ── Public: render a page by id into #content-area ── */
  function renderPage(pageId) {
    var page = _findPage(pageId);
    if (!page) {
      console.warn('[ContentRenderer] Page not found:', pageId);
      return;
    }

    var area = document.getElementById('content-area');
    if (!area) return;

    area.classList.add('content-mode');
    area.innerHTML = '';
    if (typeof Narration !== 'undefined') Narration.stop();
    _currentPageId = pageId;

    /* Switch frame: welcome/winner-reveal use the explanation frame,
       all activity/interactive pages use the question frame */
    if (typeof FrameManager !== 'undefined') {
      FrameManager.switchTo(
        (page.type === 'welcome' || page.type === 'winner-reveal' ||
         page.type === 'column-reveal' ||
         page.type === 'staircase-concept' || page.type === 'hint-card' ||
         page.type === 'staircase-flip' ||
         page.type === 'architect-intro' || page.type === 'digit-prompt' ||
         page.type === 'smallest-intro' || page.type === 'section-intro' ||
         page.type === 'round-feedback' || page.type === 'level-complete' ||
         page.type === 'session-summary' || page.type === 'key-insight' ||
         page.type === 'end-screen' ||
         page.type === 'bodmas-ask' || page.type === 'bodmas-reveal') ? 1 : 2
      );
    }

    switch (page.type) {
      case 'welcome':                   _renderWelcome(page, area);           break;
      case 'winner-reveal':             _renderWinnerReveal(page, area);      break;
      case 'concept':                   _renderConcept(page, area);           break;
      case 'reveal-step':               _renderRevealStep(page, area);        break;
      case 'predict-column':            _renderPredictColumn(page, area);     break;
      case 'question':                  _renderQuestion(page, area);          break;
      case 'pattern-prompt':            _renderPatternPrompt(page, area);     break;
      case 'ask-and-try':               _renderAskAndTry(page, area);         break;
      case 'column-reveal':             _renderColumnReveal(page, area);      break;
      case 'apply-rule':                _renderApplyRule(page, area);         break;
      case 'challenge':                 _renderChallenge(page, area);         break;
      case 'reveal-walkthrough':        _renderRevealWalkthrough(page, area); break;
      case 'insight-card':              _renderInsightCard(page, area);       break;
      case 'compare-place-value-intro': _renderComparePlaceValue(page, area); break;
      case 'layer-reveal':              _renderLayerReveal(page, area);       break;
      case 'rapid-tap':                 _renderRapidTap(page, area);          break;
      case 'apply-real-life':           _renderApplyRealLife(page, area);     break;
      case 'concept-intro':             _renderConceptIntro(page, area);      break;
      case 'staircase-concept':         _renderStaircaseConcept(page, area);  break;
      case 'hint-card':                 _renderHintCard(page, area);          break;
      case 'drag-sort':                 _renderDragSort(page, area);          break;
      case 'drag-and-rank':            _renderDragAndRank(page, area);       break;
      case 'completion-reveal':         _renderCompletionReveal(page, area);  break;
      case 'ascending-pattern':         _renderAscendingPattern(page, area);  break;
      case 'staircase-flip':            _renderStaircaseFlip(page, area);     break;
      case 'flip-rule-card':            _renderFlipRuleCard(page, area);      break;
      case 'architect-intro':           _renderArchitectIntro(page, area);    break;
      case 'digit-prompt':              _renderDigitPrompt(page, area);       break;
      case 'digit-place':               _renderDigitPlace(page, area);        break;
      case 'number-lock-reveal':        _renderNumberLockReveal(page, area);  break;
      case 'greatest-pattern':          _renderGreatestPattern(page, area);   break;
      case 'smallest-intro':            _renderSmallestIntro(page, area);        break;
      case 'smallest-digit-place':      _renderSmallestDigitPlace(page, area);   break;
      case 'zero-rule-reveal':          _renderZeroRuleReveal(page, area);       break;
      case 'smallest-lock-reveal':      _renderSmallestLockReveal(page, area);   break;
      case 'rapid-round':               _renderRapidRound(page, area);           break;
      case 'round-feedback':            _renderRoundFeedback(page, area);        break;
      case 'level-complete':            _renderLevelComplete(page, area);        break;
      case 'session-summary':           _renderSessionSummary(page, area);       break;
      case 'key-insight':               _renderKeyInsight(page, area);           break;
      case 'end-screen':                _renderEndScreen(page, area);            break;
      case 'section-intro':             _renderSectionIntro(page, area);         break;
      case 'addition-lab':              _renderAdditionLab(page, area);          break;
      case 'add-column-by-column':      _renderAddColumnByColumn(page, area);    break;
      case 'split-methods':             _renderSplitMethods(page, area);         break;
      case 'addition-practice':         _renderAdditionPractice(page, area);     break;
      case 'subtraction-lab':              _renderSubtractionLab(page, area);              break;
      case 'subtract-column-by-column':  _renderSubtractColumnByColumn(page, area);      break;
      case 'subtraction-practice':       _renderSubtractionPractice(page, area);         break;
      case 'multiplication-lab':         _renderMultiplicationLab(page, area);           break;
      case 'multiplication-builder':     _renderMultiplicationBuilder(page, area);       break;
      case 'multiply-and-check':         _renderMultiplyAndCheck(page, area);            break;
      case 'division-lab':               _renderDivisionLab(page, area);                 break;
      case 'division-practice-zero-trick': _renderDivisionPracticeZeroTrick(page, area); break;
      case 'two-step-story':               _renderTwoStepStory(page, area);              break;
      case 'operation-hq':                 _renderOperationHQ(page, area);               break;
      case 'number-solver':                _renderNumberSolver(page, area);              break;
      case 'operation-rush':               _renderOperationRush(page, area);             break;
      case 'operation-master':             _renderOperationMaster(page, area);           break;
      case 'bodmas-ask':                   _renderBodmasAsk(page, area);                break;
      case 'bodmas-try':                   _renderBodmasTry(page, area);                break;
      case 'bodmas-reveal':                _renderBodmasReveal(page, area);             break;
      case 'bodmas-practice':              _renderBodmasPractice(page, area);           break;
      case 'mbs-ask':                      _renderMbsAsk(page, area);                   break;
      case 'mbs-try':                      _renderMbsTry(page, area);                   break;
      case 'mbs-reveal':                   _renderMbsReveal(page, area);                break;
      case 'mbs-practice':                 _renderMbsPractice(page, area);              break;
      default:
        console.warn('[ContentRenderer] Unknown page type:', page.type);
    }

    if (page.animation && typeof ContentAnimations !== 'undefined') {
      ContentAnimations.run(page.animation);
    }
  }

  /* ══════════════════════════════════════════════════════
     PAGE 1.0 — welcome
  ══════════════════════════════════════════════════════ */

  function _renderWelcome(page, area) {
    if (page.heroSum) { _renderWelcomeIntro(page, area); return; }

    var wrap = _el('div', 'cp-welcome cp-welcome--mission');
    wrap.dataset.pageId = page.id;

    /* operator pill (+, −, ×, ÷) */
    var pill = _el('div', 'cp-operator-pill');
    pill.setAttribute('aria-label', 'Operators: add, subtract, multiply, divide');
    var opClasses = ['add', 'sub', 'mul', 'div'];
    (page.operators || []).forEach(function (sym, i) {
      var badge = _el('span', 'cp-op-badge cp-op-badge--' + opClasses[i]);
      badge.textContent = sym;
      badge.setAttribute('aria-hidden', 'true');
      pill.appendChild(badge);
    });
    wrap.appendChild(pill);

    /* hero title — \n becomes <br>, title text is static config (not user input) */
    var title = _el('h1', 'cp-title cp-title--bubble');
    title.innerHTML = (page.title || '').replace(/\n/g, '<br>');
    wrap.appendChild(title);

    /* subtitle */
    var sub = _el('p', 'cp-subtitle');
    sub.innerHTML = (page.subtitle || '').replace(/\n/g, '<br>');
    wrap.appendChild(sub);

    /* CTA button */
    var btn = _el('button', 'cp-btn-mission');
    btn.textContent = page.buttonLabel || 'Start Mission →';
    btn.addEventListener('click', function () {
      if (typeof playSweep === 'function') playSweep();
      renderPage(page.next);
    });
    wrap.appendChild(btn);

    area.appendChild(wrap);
  }

  /* ── Page 1.0 (new intro layout) ── */
  function _renderWelcomeIntro(page, area) {
    var wrap = _el('div', 'cp-welcome cp-welcome--intro');
    wrap.dataset.pageId = page.id;

    /* "Intro" progress badge */
    var badge = _el('div', 'cp-intro-badge');
    badge.textContent = 'Intro';
    wrap.appendChild(badge);

    /* Title + subtitle */
    var head = _el('div', 'cp-intro-head');
    var title = _el('h1', 'cp-intro-title');
    title.textContent = page.title || '';
    var sub = _el('p', 'cp-intro-sub');
    sub.textContent = page.subtitle || '';
    head.appendChild(title);
    head.appendChild(sub);
    wrap.appendChild(head);

    /* Hero sum — split on × to wrap it in a span */
    var heroDiv = _el('div', 'cp-hero-sum');
    heroDiv.setAttribute('aria-label', page.heroSum || '');
    var heroText = page.heroSum || '';
    var parts = heroText.split('×');
    if (parts.length === 2) {
      heroDiv.appendChild(document.createTextNode(parts[0]));
      var timesSpan = _el('span', 'cp-hero-sum__times');
      timesSpan.textContent = '×';
      heroDiv.appendChild(timesSpan);
      heroDiv.appendChild(document.createTextNode(parts[1]));
    } else {
      heroDiv.textContent = heroText;
    }
    wrap.appendChild(heroDiv);

    /* Answer tags (display-only, not interactive) */
    var tagsRow = _el('div', 'cp-answer-tags');
    tagsRow.setAttribute('aria-hidden', 'true');
    (page.answerTags || []).forEach(function (tag) {
      var tagEl = _el('div', 'cp-answer-tag');
      tagEl.dataset.side = tag.side;
      tagEl.textContent = tag.label;
      tagsRow.appendChild(tagEl);
    });
    wrap.appendChild(tagsRow);

    /* Caption */
    var caption = _el('p', 'cp-intro-caption');
    caption.textContent = page.caption || '';
    wrap.appendChild(caption);

    /* CTA button */
    var btn = _el('button', 'cp-btn-intro');
    btn.textContent = page.buttonLabel || 'Let\'s Begin →';
    btn.addEventListener('click', function () {
      if (typeof playStartWhoosh === 'function') playStartWhoosh();
      var timesEl = wrap.querySelector('.cp-hero-sum__times');
      if (typeof anime !== 'undefined' && timesEl) {
        anime({
          targets: timesEl,
          scale: [1, 1.6, 1],
          color: ['#F5B61A', '#1B3A6B'],
          duration: 280,
          easing: 'easeInOutQuad',
          complete: function () { _wipeLeftTo(page.next); }
        });
      } else {
        _wipeLeftTo(page.next);
      }
    });
    wrap.appendChild(btn);

    area.appendChild(wrap);
  }

  function _wipeLeftTo(pageId) {
    var area = document.getElementById('content-area');
    if (typeof anime !== 'undefined' && area) {
      anime({
        targets: area,
        translateX: [0, '-100%'],
        opacity:    [1, 0],
        duration: 450,
        easing: 'easeInQuad',
        complete: function () {
          anime.set(area, { translateX: 0, opacity: 1 });
          renderPage(pageId);
        }
      });
    } else {
      renderPage(pageId);
    }
  }

  /* ══════════════════════════════════════════════════════
     PAGE 1.1 — winner-reveal
  ══════════════════════════════════════════════════════ */

  function _renderWinnerReveal(page, area) {
    var wrap = _el('div', 'cp-winner-reveal');
    wrap.dataset.pageId = page.id;

    var ring = _el('div', 'cp-winner-ring');
    var card = _el('div', 'cp-winner-card');
    card.textContent = page.winnerNumber;
    ring.appendChild(card);
    wrap.appendChild(ring);

    area.appendChild(wrap);

    if (typeof launchConfetti === 'function') launchConfetti();

    if (typeof Narration !== 'undefined') {
      Narration.schedule([
        { delay: 700, file: 'reveal_1_1' }
      ]);
    }

    setTimeout(function () { if (_currentPageId === page.id) renderPage(page.next); }, 6000);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 2.0 — concept
  ══════════════════════════════════════════════════════ */

  function _renderConcept(page, area) {
    var wrap = _el('div', 'cp-concept');
    wrap.dataset.pageId = page.id;

    var title = _el('h1', 'cp-title');
    title.textContent = page.title;
    wrap.appendChild(title);

    var line = _el('p', 'cp-concept__line');
    line.textContent = page.line;
    wrap.appendChild(line);

    var cards = _el('div', 'cp-concept__cards');

    var cardA = _el('div', 'cp-concept__card');
    cardA.textContent = page.numbers[0].value;
    cards.appendChild(cardA);

    var vs = _el('span', 'cp-vs');
    vs.textContent = 'vs';
    cards.appendChild(vs);

    var cardB = _el('div', 'cp-concept__card');
    cardB.textContent = page.numbers[1].value;
    cards.appendChild(cardB);

    wrap.appendChild(cards);

    var btn = _el('button', 'cp-btn-primary');
    btn.textContent = page.primaryAction.label;
    var nextId = page.primaryAction.next;
    btn.addEventListener('click', function () { renderPage(nextId); });
    wrap.appendChild(btn);

    area.appendChild(wrap);

    if (typeof Narration !== 'undefined' && page.id === '2.0') {
      Narration.schedule([
        { delay: 0,    file: 'load_2_0' },
        { delay: 8000, file: 'load_2_0_2' }
      ]);
    }
  }

  /* ══════════════════════════════════════════════════════
     PAGE 2.1 — predict-column (tap the different column)
  ══════════════════════════════════════════════════════ */

  function _renderPredictColumn(page, area) {
    var parent = _findPage(page.parent);
    if (!parent) {
      console.warn('[ContentRenderer] Parent not found for', page.id);
      return;
    }

    var wrap = _el('div', 'cp-predict-col');
    wrap.dataset.pageId = page.id;

    var title = _el('h1', 'cp-title');
    title.textContent = page.title;
    wrap.appendChild(title);

    /* vs-row */
    var vsRow = _el('div', 'cp-vs-row');
    var numA = _el('span', 'cp-vs-num'); numA.textContent = parent.numbers[0].value;
    var sep  = _el('span', 'cp-vs-sep'); sep.textContent  = 'vs';
    var numB = _el('span', 'cp-vs-num'); numB.textContent = parent.numbers[1].value;
    vsRow.appendChild(numA); vsRow.appendChild(sep); vsRow.appendChild(numB);
    wrap.appendChild(vsRow);

    /* Tappable digit grid */
    var grid = _el('div', 'cp-digit-grid');
    var answered = false;

    parent.columns.forEach(function (col, i) {
      var colEl = _el('button', 'cp-digit-col cp-digit-col--tappable');
      colEl.setAttribute('aria-label', col + ' column');
      colEl.setAttribute('tabindex', '0');

      var lbl = _el('span', 'cp-digit-col__label'); lbl.textContent = col;
      var dA  = _el('span', 'cp-digit-col__a');     dA.textContent  = parent.numbers[0].digits[i];
      var dB  = _el('span', 'cp-digit-col__b');     dB.textContent  = parent.numbers[1].digits[i];
      colEl.appendChild(lbl); colEl.appendChild(dA); colEl.appendChild(dB);

      function onTap() {
        if (answered) return;
        if (i === page.correctColIndex) {
          answered = true;
          colEl.className = 'cp-digit-col cp-digit-col--correct-tap';
          if (typeof anime !== 'undefined') {
            anime({ targets: colEl, scale: [1, 1.12, 1.06], duration: 420, easing: 'easeOutBack' });
          }
          if (typeof playCorrect === 'function') playCorrect();
          if (typeof Narration !== 'undefined' && page.id === '2.1') Narration.play('correct_tap_2_1');
          setTimeout(function () { if (_currentPageId === page.id) renderPage(page.next); }, 4000);
        } else {
          colEl.classList.add('cp-digit-col--wrong-tap');
          if (typeof playWrong === 'function') playWrong();
          if (typeof Narration !== 'undefined' && page.id === '2.1') Narration.play('wrong_tap_2_1');
          setTimeout(function () { colEl.classList.remove('cp-digit-col--wrong-tap'); }, 600);
        }
      }

      colEl.addEventListener('click', onTap);
      colEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(); }
      });

      grid.appendChild(colEl);
    });

    wrap.appendChild(grid);
    area.appendChild(wrap);

    if (typeof Narration !== 'undefined' && page.id === '2.1') {
      Narration.schedule([{ delay: 0, file: 'load_2_1' }]);
    }

  }

  /* ══════════════════════════════════════════════════════
     PAGES 2.2–2.5 — reveal-step
  ══════════════════════════════════════════════════════ */

  function _renderRevealStep(page, area) {
    var parent = _findPage(page.parent);
    if (!parent) {
      console.warn('[ContentRenderer] Parent not found for', page.id);
      return;
    }

    var wrap = _el('div', 'cp-reveal-step');
    wrap.dataset.pageId = page.id;

    /* Numbers row */
    var vsRow = _el('div', 'cp-vs-row');
    var numA = _el('span', 'cp-vs-num');
    numA.textContent = parent.numbers[0].value;
    var sep = _el('span', 'cp-vs-sep');
    sep.textContent = 'vs';
    var numB = _el('span', 'cp-vs-num');
    numB.textContent = parent.numbers[1].value;
    vsRow.appendChild(numA);
    vsRow.appendChild(sep);
    vsRow.appendChild(numB);
    wrap.appendChild(vsRow);

    /* Digit grid */
    var grid = _el('div', 'cp-digit-grid');
    parent.columns.forEach(function (col, i) {
      var cls = 'cp-digit-col';
      if (i < page.columnIndex) {
        cls += ' cp-digit-col--done';
      } else if (i === page.columnIndex) {
        cls += page.result === 'same'
          ? ' cp-digit-col--same cp-digit-col--active'
          : ' cp-digit-col--diff cp-digit-col--active';
      } else {
        cls += ' cp-digit-col--pending';
      }

      var colEl = _el('div', cls);

      var lbl = _el('span', 'cp-digit-col__label');
      lbl.textContent = col;
      colEl.appendChild(lbl);

      var dA = _el('span', 'cp-digit-col__a');
      dA.textContent = parent.numbers[0].digits[i];
      colEl.appendChild(dA);

      var dB = _el('span', 'cp-digit-col__b');
      dB.textContent = parent.numbers[1].digits[i];
      colEl.appendChild(dB);

      grid.appendChild(colEl);
    });
    wrap.appendChild(grid);

    /* DIFFERENT arrow */
    if (page.result === 'different') {
      var arrow = _el('div', 'cp-diff-arrow');
      arrow.textContent = 'First difference here!';
      wrap.appendChild(arrow);
    }

    /* Result badge */
    var badge = _el('div', 'cp-result-badge' + (page.result === 'different' ? ' cp-result-badge--diff' : ''));
    badge.textContent = page.result === 'same' ? 'SAME' : 'DIFFERENT!';
    wrap.appendChild(badge);

    area.appendChild(wrap);

    if (typeof Narration !== 'undefined') {
      var _s2RevealMap = { '2.2': 'reveal_2_2', '2.3': 'reveal_2_3', '2.4': 'reveal_2_4', '2.5': 'reveal_2_5' };
      var _s2RevealKey = _s2RevealMap[page.id];
      if (_s2RevealKey) {
        /* 200ms: voice leads the active-column pop-in (which starts at 260ms) */
        Narration.schedule([{ delay: 200, file: _s2RevealKey }]);
      }
    }

    /* Auto-advance */
    setTimeout(function () { if (_currentPageId === page.id) renderPage(page.next); }, page.autoDelay);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 2.5 — question (auto-validated tap)
  ══════════════════════════════════════════════════════ */

  function _renderQuestion(page, area) {
    var wrap = _el('div', 'cp-question');
    wrap.dataset.pageId = page.id;

    var title = _el('h1', 'cp-title');
    title.textContent = page.title;
    wrap.appendChild(title);

    var cards = _el('div', 'cp-hook-cards');
    var answered = false;

    page.numbers.forEach(function (num) {
      var card = _el('button', 'cp-hook-card');
      card.textContent = num.value;
      card.setAttribute('aria-label', num.value);
      card.setAttribute('tabindex', '0');

      function onTap() {
        if (answered) return;
        if (num.isCorrect) {
          answered = true;
          card.classList.add('cp-hook-card--happy');
          if (typeof playCorrect === 'function') playCorrect();
          if (typeof Narration !== 'undefined' && page.id === '2.6') Narration.play('correct_2_6');
          setTimeout(function () { renderPage(page.next); }, 900);
        } else {
          card.classList.add('cp-hook-card--shake');
          if (typeof playWrong === 'function') playWrong();
          if (typeof Narration !== 'undefined' && page.id === '2.6') Narration.play('wrong_2_6');
          setTimeout(function () { card.classList.remove('cp-hook-card--shake'); }, 600);
        }
      }

      card.addEventListener('click', onTap);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(); }
      });

      cards.appendChild(card);
    });

    wrap.appendChild(cards);
    area.appendChild(wrap);

    if (typeof Narration !== 'undefined' && page.id === '2.6') {
      Narration.schedule([{ delay: 0, file: 'load_2_6' }]);
    }
  }

  /* ══════════════════════════════════════════════════════
     PAGE 2.6 — pattern-prompt
  ══════════════════════════════════════════════════════ */

  function _renderPatternPrompt(page, area) {
    var wrap = _el('div', 'cp-pattern-prompt');
    wrap.dataset.pageId = page.id;

    var title = _el('h1', 'cp-title');
    title.textContent = page.title;
    wrap.appendChild(title);

    var rule = _el('p', 'cp-rule-line');
    rule.innerHTML = page.rule
      .replace('LEFT', '<strong>LEFT</strong>')
      .replace('DIFFERENT', '<strong>DIFFERENT</strong>');
    wrap.appendChild(rule);

    var fingerGrid = _el('div', 'cp-finger-grid');
    page.columns.forEach(function (col, i) {
      if (page.digitsB) {
        var colEl = _el('div', 'cp-digit-col' + (i === page.diffIndex ? ' cp-digit-col--diff' : ''));
        var lbl = _el('span', 'cp-digit-col__label'); lbl.textContent = col;
        var dA  = _el('span', 'cp-digit-col__a');     dA.textContent  = page.digits[i];
        var dB  = _el('span', 'cp-digit-col__b');     dB.textContent  = page.digitsB[i];
        colEl.appendChild(lbl); colEl.appendChild(dA); colEl.appendChild(dB);
        fingerGrid.appendChild(colEl);
      } else {
        var colEl = _el('div', 'cp-finger-col' + (i === page.diffIndex ? ' cp-finger-col--diff' : ''));
        var lbl = _el('span', 'cp-finger-col__label'); lbl.textContent = col;
        var dig = _el('span', 'cp-finger-col__digit'); dig.textContent = page.digits[i];
        colEl.appendChild(lbl); colEl.appendChild(dig);
        fingerGrid.appendChild(colEl);
      }
    });
    wrap.appendChild(fingerGrid);

    var btn = _el('button', 'cp-btn-primary');
    btn.textContent = page.primaryAction.label;
    var nextId = page.primaryAction.next;
    btn.addEventListener('click', function () {
      if (typeof Narration !== 'undefined' && page.id === '2.7') {
        Narration.play('continue_2_7');
        setTimeout(function () { renderPage(nextId); }, 3000);
      } else {
        renderPage(nextId);
      }
    });
    wrap.appendChild(btn);

    area.appendChild(wrap);

    if (typeof Narration !== 'undefined' && page.id === '2.7') {
      Narration.schedule([{ delay: 0, file: 'reveal_2_7' }]);
    }
  }

  /* ══════════════════════════════════════════════════════
     PAGE 2.0 — ask-and-try (State A: ask, State B: tap grid)
  ══════════════════════════════════════════════════════ */

  function _renderAskAndTry(page, area) {
    var wrap = _el('div', 'cp-ask-and-try');
    wrap.dataset.pageId = page.id;

    var inner = _el('div', 'cp-aat-state-a');

    var heading = _el('h1', 'cp-title');
    heading.textContent = page.heading;
    inner.appendChild(heading);

    var subtitle = _el('p', 'cp-aat-subtitle');
    subtitle.textContent = page.subtitle;
    inner.appendChild(subtitle);

    var cardsRow = _el('div', 'cp-aat-cards');
    var cardA = _el('div', 'cp-aat-card'); cardA.textContent = page.numbers[0];
    var vs    = _el('span', 'cp-vs');      vs.textContent    = 'vs';
    var cardB = _el('div', 'cp-aat-card'); cardB.textContent = page.numbers[1];
    cardsRow.appendChild(cardA); cardsRow.appendChild(vs); cardsRow.appendChild(cardB);
    inner.appendChild(cardsRow);

    var letsCheckBtn = _el('button', 'cp-lets-begin cp-aat-lets-check');
    letsCheckBtn.textContent = page.buttonLabel || "Let's Check →";
    inner.appendChild(letsCheckBtn);

    /* Question appears in State B alongside the grid — hidden in State A */
    var question = _el('p', 'cp-aat-question');
    question.textContent = page.question;
    question.style.display = 'none';

    /* Grid and hint — hidden until button click */
    var grid     = _el('div', 'cp-digit-grid');
    grid.style.display = 'none';
    var answered = false;
    var hint     = _el('p', 'cp-aat-hint');
    hint.textContent = page.wrongHint || 'Look again — from left to right.';
    hint.style.display = 'none';

    page.columns.forEach(function (col, i) {
      var colEl = _el('button', 'cp-digit-col cp-digit-col--tappable');
      colEl.setAttribute('aria-label', col + ' column');
      colEl.setAttribute('tabindex', '0');
      var lbl = _el('span', 'cp-digit-col__label'); lbl.textContent = col;
      var dA  = _el('span', 'cp-digit-col__a');     dA.textContent  = page.digits[0][i];
      var dB  = _el('span', 'cp-digit-col__b');     dB.textContent  = page.digits[1][i];
      colEl.appendChild(lbl); colEl.appendChild(dA); colEl.appendChild(dB);

      function onTap() {
        if (answered) return;
        if (i === page.correctColIndex) {
          answered = true;
          colEl.className = 'cp-digit-col cp-digit-col--correct-tap';
          if (typeof anime !== 'undefined') {
            anime({ targets: colEl, scale: [1, 1.12, 1.06], duration: 420, easing: 'easeOutBack' });
          }
          if (typeof playCorrect === 'function') playCorrect();
          setTimeout(function () { if (_currentPageId === page.id) renderPage(page.next); }, 1200);
        } else {
          colEl.classList.add('cp-digit-col--wrong-tap');
          if (typeof playWrong === 'function') playWrong();
          hint.style.display = '';
          if (typeof anime !== 'undefined') {
            anime({ targets: hint, opacity: 1, duration: 200 });
          } else { hint.style.opacity = '1'; }
          setTimeout(function () {
            colEl.classList.remove('cp-digit-col--wrong-tap');
            if (typeof anime !== 'undefined') {
              anime({ targets: hint, opacity: 0, duration: 300 });
            } else { hint.style.opacity = '0'; }
          }, 1200);
        }
      }

      colEl.addEventListener('click', onTap);
      colEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(); }
      });
      grid.appendChild(colEl);
    });

    inner.appendChild(question);
    inner.appendChild(grid);
    inner.appendChild(hint);
    wrap.appendChild(inner);
    area.appendChild(wrap);

    /* ── Button click: fade out subtitle+btn, nudge content to center, grid slides in ── */
    letsCheckBtn.addEventListener('click', function () {
      if (typeof anime === 'undefined') {
        subtitle.style.display = 'none';
        letsCheckBtn.style.display = 'none';
        question.style.display = '';
        grid.style.display = '';
        hint.style.display = '';
        grid.querySelectorAll('.cp-digit-col').forEach(function (c) { c.style.opacity = '1'; });
        return;
      }
      anime({
        targets: [subtitle, letsCheckBtn],
        opacity: 0, translateY: -6,
        duration: 200, easing: 'easeInQuad',
        complete: function () {
          subtitle.style.display = 'none';
          letsCheckBtn.style.display = 'none';
          /* Nudge heading + cards then settle — masks the layout reflow */
          anime.set([heading, cardsRow], { translateY: 14 });
          anime({ targets: [heading, cardsRow], translateY: 0, duration: 300, easing: 'easeOutQuad' });
          /* Question + grid slide up together */
          question.style.display = '';
          grid.style.display = '';
          hint.style.display = '';
          anime.set(question, { opacity: 0, translateY: 14 });
          anime({ targets: question, opacity: 1, translateY: 0, duration: 280, delay: 60, easing: 'easeOutQuad' });
          var cols = Array.prototype.slice.call(grid.querySelectorAll('.cp-digit-col'));
          anime.set(grid, { opacity: 0, translateY: 28 });
          anime.set(cols, { opacity: 0, translateY: 20, scale: 0.92 });
          anime({ targets: grid, opacity: 1, translateY: 0, duration: 320, delay: 120, easing: 'easeOutQuad' });
          anime({
            targets: cols, opacity: 1, translateY: 0, scale: 1,
            duration: 350,
            delay: anime.stagger(50, { start: 200 }),
            easing: 'easeOutBack'
          });
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     PAGE 2.1 — column-reveal (sequential animated reveal)
  ══════════════════════════════════════════════════════ */

  function _renderColumnReveal(page, area) {
    var parent = _findPage(page.parent);
    if (!parent) {
      console.warn('[ContentRenderer] Parent not found for', page.id);
      return;
    }

    var wrap = _el('div', 'cp-column-reveal');
    wrap.dataset.pageId = page.id;

    var heading = _el('h1', 'cp-title');
    heading.textContent = page.heading;
    wrap.appendChild(heading);

    var cardsRow = _el('div', 'cp-aat-cards cp-colrev-cards');
    var cardA = _el('div', 'cp-aat-card'); cardA.textContent = parent.numbers[0];
    var vsEl  = _el('span', 'cp-vs');      vsEl.textContent  = 'vs';
    var cardB = _el('div', 'cp-aat-card'); cardB.textContent = parent.numbers[1];
    cardsRow.appendChild(cardA); cardsRow.appendChild(vsEl); cardsRow.appendChild(cardB);
    wrap.appendChild(cardsRow);

    /* Grid — all pending initially */
    var grid   = _el('div', 'cp-digit-grid');
    var colEls = [];
    parent.columns.forEach(function (col, i) {
      var colEl = _el('div', 'cp-digit-col cp-digit-col--pending');
      var lbl   = _el('span', 'cp-digit-col__label'); lbl.textContent = col;
      var dA    = _el('span', 'cp-digit-col__a');     dA.textContent  = parent.digits[0][i];
      var dB    = _el('span', 'cp-digit-col__b');     dB.textContent  = parent.digits[1][i];
      colEl.appendChild(lbl); colEl.appendChild(dA); colEl.appendChild(dB);
      colEls.push(colEl);
      grid.appendChild(colEl);
    });
    wrap.appendChild(grid);

    /* Status badge — SAME / DIFFERENT! shown during reveal sequence */
    var statusWrap  = _el('div', 'cp-colrev-status');
    statusWrap.style.opacity = '0';
    var statusArrow = _el('div', 'cp-diff-arrow');
    statusArrow.textContent   = 'First difference here!';
    statusArrow.style.opacity = '1';
    statusArrow.style.display = 'none';
    var statusBadge = _el('div', 'cp-result-badge');
    statusBadge.textContent   = 'SAME';
    statusBadge.style.opacity = '1';
    statusWrap.appendChild(statusArrow);
    statusWrap.appendChild(statusBadge);
    wrap.appendChild(statusWrap);

    var resultCard = _el('div', 'cp-colrev-result');
    resultCard.textContent = page.resultText;
    resultCard.style.display = 'none';
    wrap.appendChild(resultCard);

    var ruleCard = _el('div', 'cp-colrev-rule');
    ruleCard.textContent = page.ruleText;
    ruleCard.style.display = 'none';
    wrap.appendChild(ruleCard);

    var btn = _el('button', 'cp-btn-primary cp-colrev-btn');
    btn.textContent = 'Continue →';
    btn.style.display = 'none';
    btn.addEventListener('click', function () { renderPage(page.next); });
    wrap.appendChild(btn);

    area.appendChild(wrap);

    /* Sequential column reveals */
    var steps = page.revealSteps;
    var BASE  = 1200, STEP = 1000;
    var statusVisible = false;

    steps.forEach(function (step, idx) {
      setTimeout(function () {
        if (_currentPageId !== page.id) return;
        if (idx > 0) {
          colEls[steps[idx - 1].colIndex].className = 'cp-digit-col cp-digit-col--done';
        }
        var cur    = colEls[step.colIndex];
        var isSame = step.result === 'same';
        cur.className = 'cp-digit-col cp-digit-col--active ' +
          (isSame ? 'cp-digit-col--same' : 'cp-digit-col--diff');
        if (typeof anime !== 'undefined') {
          anime.set(cur, { scale: 0.9 });
          anime({ targets: cur, scale: 1, duration: 380, easing: 'easeOutBack' });
        }
        if (isSame  && typeof playTick    === 'function') playTick();
        if (!isSame && typeof playCorrect === 'function') playCorrect();

        /* Update status badge */
        statusBadge.className   = 'cp-result-badge' + (isSame ? '' : ' cp-result-badge--diff');
        statusBadge.textContent = isSame ? 'SAME' : 'DIFFERENT!';
        statusBadge.style.opacity = '1';
        statusArrow.style.display = isSame ? 'none' : '';

        if (!statusVisible) {
          statusVisible = true;
          if (typeof anime !== 'undefined') {
            anime({ targets: statusWrap, opacity: 1, translateY: [10, 0], duration: 300, easing: 'easeOutQuad' });
          } else { statusWrap.style.opacity = '1'; }
        } else if (typeof anime !== 'undefined') {
          anime({ targets: statusBadge, scale: [1.15, 1], duration: 280, easing: 'easeOutBack' });
        }
      }, BASE + idx * STEP);
    });

    var afterLast = BASE + (steps.length - 1) * STEP + 1300;

    /* Fade out + collapse status, then reveal result card */
    setTimeout(function () {
      if (_currentPageId !== page.id) return;
      var showResult = function () {
        statusWrap.style.display = 'none';   /* collapse layout space */
        resultCard.style.display = '';
        if (typeof anime !== 'undefined') {
          anime.set(resultCard, { opacity: 0, translateY: 18 });
          anime({ targets: resultCard, opacity: 1, translateY: 0, duration: 380, easing: 'easeOutBack' });
        } else { resultCard.style.opacity = '1'; }
      };
      if (typeof anime !== 'undefined') {
        anime({ targets: statusWrap, opacity: 0, duration: 250, easing: 'easeInQuad', complete: showResult });
      } else {
        showResult();
      }
    }, afterLast);

    setTimeout(function () {
      if (_currentPageId !== page.id) return;
      ruleCard.style.display = '';
      if (typeof anime !== 'undefined') {
        anime.set(ruleCard, { opacity: 0, translateY: 18 });
        anime({ targets: ruleCard, opacity: 1, translateY: 0, duration: 380, easing: 'easeOutBack' });
      } else { ruleCard.style.opacity = '1'; }
    }, afterLast + 800);

    setTimeout(function () {
      if (_currentPageId !== page.id) return;
      btn.style.display = '';
      if (typeof anime !== 'undefined') {
        anime.set(btn, { opacity: 0 });
        anime({ targets: btn, opacity: 1, duration: 280, easing: 'easeOutQuad',
                complete: function () { btn.classList.add('cp-colrev-btn--pulse'); } });
      } else { btn.style.opacity = '1'; }
    }, afterLast + 1600);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 3.0 — challenge (auto-validated tap, wrong → auto-hint)
  ══════════════════════════════════════════════════════ */

  function _renderChallenge(page, area) {
    var wrap = _el('div', 'cp-challenge');
    wrap.dataset.pageId = page.id;

    if (typeof playDrumroll === 'function') playDrumroll();

    var title = _el('h1', 'cp-title');
    title.textContent = page.title;
    wrap.appendChild(title);

    var cards = _el('div', 'cp-hook-cards');
    var answered = false;

    page.numbers.forEach(function (num) {
      var card = _el('button', 'cp-hook-card');
      card.textContent = num.value;
      card.setAttribute('aria-label', num.value);
      card.setAttribute('tabindex', '0');

      function onTap() {
        if (answered) return;
        answered = true;
        if (num.isCorrect) {
          card.classList.add('cp-hook-card--happy');
          if (typeof playCorrect === 'function') playCorrect();
          if (typeof launchConfetti === 'function') launchConfetti();
          setTimeout(function () { renderPage(page.next); }, 900);
        } else {
          card.classList.add('cp-hook-card--shake');
          if (typeof playWrong === 'function') playWrong();
          setTimeout(function () {
            card.classList.remove('cp-hook-card--shake');
            renderPage(page.next);
          }, 1400);
        }
      }

      card.addEventListener('click', onTap);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(); }
      });
      cards.appendChild(card);
    });

    wrap.appendChild(cards);
    area.appendChild(wrap);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 3.1 — reveal-walkthrough (single-page animated reveal)
  ══════════════════════════════════════════════════════ */

  function _renderRevealWalkthrough(page, area) {
    var parent = _findPage(page.parent);
    if (!parent) {
      console.warn('[ContentRenderer] Parent not found for', page.id);
      return;
    }

    var wrap = _el('div', 'cp-reveal-walkthrough');
    wrap.dataset.pageId = page.id;

    /* vs-row */
    var vsRow = _el('div', 'cp-vs-row');
    var numA = _el('span', 'cp-vs-num'); numA.textContent = parent.numbers[0].value;
    var sep  = _el('span', 'cp-vs-sep'); sep.textContent  = 'vs';
    var numB = _el('span', 'cp-vs-num'); numB.textContent = parent.numbers[1].value;
    vsRow.appendChild(numA); vsRow.appendChild(sep); vsRow.appendChild(numB);
    wrap.appendChild(vsRow);

    /* Digit grid — all pending initially */
    var grid = _el('div', 'cp-digit-grid');
    var colEls = [];
    parent.columns.forEach(function (col, i) {
      var colEl = _el('div', 'cp-digit-col cp-digit-col--pending');
      var lbl = _el('span', 'cp-digit-col__label'); lbl.textContent = col;
      var dA  = _el('span', 'cp-digit-col__a');     dA.textContent  = parent.numbers[0].digits[i];
      var dB  = _el('span', 'cp-digit-col__b');     dB.textContent  = parent.numbers[1].digits[i];
      colEl.appendChild(lbl); colEl.appendChild(dA); colEl.appendChild(dB);
      colEls.push(colEl);
      grid.appendChild(colEl);
    });
    wrap.appendChild(grid);

    /* Winner badge — hidden until last step resolves */
    var badge = _el('div', 'cp-result-badge cp-result-badge--diff');
    var winnerNum = page.winnerSide === 'B' ? parent.numbers[1].value : parent.numbers[0].value;
    badge.textContent = winnerNum + ' wins!';
    wrap.appendChild(badge);

    area.appendChild(wrap);

    /* Sequential column reveals */
    var steps = page.revealSteps;
    var BASE = 700, STEP = 1400;

    steps.forEach(function (step, idx) {
      setTimeout(function () {
        if (idx > 0) {
          colEls[steps[idx - 1].colIndex].className = 'cp-digit-col cp-digit-col--done';
        }
        var cur = colEls[step.colIndex];
        cur.className = 'cp-digit-col cp-digit-col--active ' +
          (step.result === 'same' ? 'cp-digit-col--same' : 'cp-digit-col--diff');
        if (typeof anime !== 'undefined') {
          anime.set(cur, { opacity: 0, scale: 0.9 });
          anime({ targets: cur, opacity: 1, scale: 1, duration: 380, easing: 'easeOutBack' });
        } else {
          cur.style.opacity = '1';
        }
        if (step.result === 'same' && typeof playTick === 'function') playTick();
        if (step.result === 'diff' && typeof playCorrect === 'function') playCorrect();
      }, BASE + idx * STEP);
    });

    /* Badge after last step */
    setTimeout(function () {
      if (typeof anime !== 'undefined') {
        anime.set(badge, { opacity: 0, scale: 0.8 });
        anime({ targets: badge, opacity: 1, scale: 1, duration: 380, easing: 'easeOutBack' });
      } else {
        badge.style.opacity = '1';
      }
    }, BASE + (steps.length - 1) * STEP + 700);

    setTimeout(function () { if (_currentPageId === page.id) renderPage(page.next); }, page.autoDelay || 5800);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 3.2 — insight-card
  ══════════════════════════════════════════════════════ */

  function _renderInsightCard(page, area) {
    var wrap = _el('div', 'cp-insight-card');
    wrap.dataset.pageId = page.id;

    var title = _el('h1', 'cp-title');
    title.textContent = page.title;
    wrap.appendChild(title);

    var body = _el('div', 'cp-insight-body');
    var insightText = _el('p', 'cp-insight-text');
    insightText.textContent = page.insight;
    body.appendChild(insightText);
    wrap.appendChild(body);

    var examples = _el('div', 'cp-insight-examples');
    page.examples.forEach(function (ex) {
      var row = _el('div', 'cp-insight-row');
      var lbl   = _el('span', 'cp-insight-row__label'); lbl.textContent   = ex.label;
      var arrow = _el('span', 'cp-insight-row__arrow'); arrow.textContent = '→';
      var nums  = _el('span', 'cp-insight-row__nums');  nums.textContent  = ex.numA + '  vs  ' + ex.numB;
      row.appendChild(lbl); row.appendChild(arrow); row.appendChild(nums);
      examples.appendChild(row);
    });
    wrap.appendChild(examples);

    var btn = _el('button', 'cp-btn-primary');
    btn.textContent = page.primaryAction.label;
    var nextId = page.primaryAction.next;
    btn.addEventListener('click', function () { renderPage(nextId); });
    wrap.appendChild(btn);

    area.appendChild(wrap);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 2.0 (legacy) — compare-place-value-intro
  ══════════════════════════════════════════════════════ */

  function _renderComparePlaceValue(page, area) {
    var wrap = _el('div', 'cp-compare');
    wrap.dataset.pageId = page.id;

    var badge = _el('div', 'cp-badge');
    badge.textContent = page.badge;
    wrap.appendChild(badge);

    var kicker = _el('p', 'cp-kicker');
    kicker.textContent = page.kicker;
    wrap.appendChild(kicker);

    var title = _el('h1', 'cp-title');
    title.textContent = page.title;
    wrap.appendChild(title);

    var sub = _el('p', 'cp-subtitle');
    sub.textContent = page.subtitle;
    wrap.appendChild(sub);

    wrap.appendChild(_buildNumberPair(page.numbers, false));

    /* Activity slot — grid first (opacity 0, layout reserved), then reveal cards */
    var activitySlot = _el('div', 'cp-activity-slot');
    var focusColIdx = page.grid.columns.indexOf(page.grid.focusColumn);
    var gridEl = _buildPlaceGrid(page.grid, focusColIdx, true);
    gridEl.style.pointerEvents = 'none';
    activitySlot.appendChild(gridEl);
    wrap.appendChild(activitySlot);

    /* Tap hint — appears with grid, hidden during reveal phase */
    var hint = _el('p', 'cp-tap-hint');
    hint.textContent = 'Tap the column where A and B first differ';
    wrap.appendChild(hint);

    /* Continue button — hidden until after correct answer + reveal */
    var btn = _el('button', 'cp-btn-primary');
    btn.textContent = 'Continue →';
    btn.style.display = 'none';
    var finalNext = _findTerminusNext(page.id) || page.next;
    btn.addEventListener('click', function () { renderPage(finalNext); });
    wrap.appendChild(btn);

    area.appendChild(wrap);

    /* Animate top section (badge → kicker → title → subtitle → num cards) */
    if (typeof ContentAnimations !== 'undefined') {
      ContentAnimations.run(page.animation);
    }

    /* After 2 s — slide grid in, enable interaction */
    setTimeout(function () {
      gridEl.style.pointerEvents = '';
      if (typeof ContentAnimations !== 'undefined') {
        ContentAnimations.run('gridAppear');
      } else {
        gridEl.style.opacity = '1';
        hint.style.opacity = '1';
      }

      _attachGridInteraction(
        gridEl.querySelector('.cp-grid__table'),
        focusColIdx,
        function onCorrect() {
          _showFeedback('Nice. Now watch the rule appear.', false);
          setTimeout(function () {
            _hideFeedback();
            /* Swap grid for reveal cards */
            activitySlot.removeChild(gridEl);
            hint.style.display = 'none';
            btn.style.display = '';

            var cardsWrap = _el('div', 'cp-reveal-cards');
            _getLayerRevealSiblings(page.id).forEach(function (sib) {
              cardsWrap.appendChild(_buildRevealCard(sib));
            });
            activitySlot.appendChild(cardsWrap);

            if (page.microLog) {
              var log = _el('div', 'cp-micro-log');
              log.textContent = page.microLog;
              activitySlot.appendChild(log);
            }

            if (typeof ContentAnimations !== 'undefined') {
              ContentAnimations.run('revealCardsAppear');
            } else {
              cardsWrap.querySelectorAll('.cp-reveal-card').forEach(function (c) { c.style.opacity = '1'; });
            }
          }, 1500);
        },
        function onWrong() {
          _showFeedback('Try again', true);
          setTimeout(_hideFeedback, 1500);
        }
      );
    }, 2000);
  }

  /* ══════════════════════════════════════════════════════
     PAGES 2.1 – 2.4 — layer-reveal
  ══════════════════════════════════════════════════════ */

  function _renderLayerReveal(page, area) {
    var parent = _findPage(page.parent);
    if (!parent) {
      console.warn('[ContentRenderer] Parent not found for', page.id);
      return;
    }

    var wrap = _el('div', 'cp-layer-reveal');
    wrap.dataset.pageId = page.id;

    /* Compact number pair from parent data */
    wrap.appendChild(_buildNumberPair(parent.numbers, true));

    /* Frozen grid — H column highlighted, header hidden */
    var focusColIdx = parent.grid.columns.indexOf(parent.grid.focusColumn);
    wrap.appendChild(_buildPlaceGrid(parent.grid, focusColIdx, false));

    /* Reveal content — grows with each step */
    if (page.revealIndex === 1) {
      /* 2.1: just the prompt banner */
      var banner = _el('div', 'cp-prompt-banner');
      banner.textContent = page.prompt;
      wrap.appendChild(banner);

    } else {
      /* 2.2 / 2.3 / 2.4: accumulate reveal cards */
      var cardsWrap = _el('div', 'cp-reveal-cards');
      var siblings = [];
      for (var i = 0; i < CONTENT_PAGES.length; i++) {
        var sib = CONTENT_PAGES[i];
        if (sib.parent === page.parent &&
            sib.type  === 'layer-reveal' &&
            sib.revealIndex >= 2 &&
            sib.revealIndex <= page.revealIndex) {
          siblings.push(sib);
        }
      }
      siblings.sort(function (a, b) { return a.revealIndex - b.revealIndex; });
      siblings.forEach(function (sib) { cardsWrap.appendChild(_buildRevealCard(sib)); });
      wrap.appendChild(cardsWrap);

      /* Micro log only on the final reveal */
      if (page.revealIndex === 4 && parent.microLog) {
        var log = _el('div', 'cp-micro-log');
        log.textContent = parent.microLog;
        wrap.appendChild(log);
      }
    }

    /* Next / Continue CTA */
    var btn = _el('button', 'cp-btn-primary');
    btn.textContent = page.revealIndex === 4 ? 'Continue →' : 'Next →';
    var nextId = page.next;
    btn.addEventListener('click', function () { renderPage(nextId); });
    wrap.appendChild(btn);

    area.appendChild(wrap);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 4.0 — rapid-tap (Quick Compare Round)
  ══════════════════════════════════════════════════════ */

  function _renderRapidTap(page, area) {
    var roundIndex = 0;
    var stars      = 0;
    var answered   = false;
    var totalRounds = page.rounds.length;

    var wrap = _el('div', 'cp-rapid-tap');
    wrap.dataset.pageId = page.id;

    /* Header: round counter + stars */
    var header = _el('div', 'cp-rt-header');

    var counter = _el('span', 'cp-rt-round-counter');
    counter.textContent = '1 / ' + totalRounds;
    header.appendChild(counter);

    var starsRow = _el('div', 'cp-rt-stars');
    var starEls  = [];
    for (var s = 0; s < totalRounds; s++) {
      var starEl = _el('img', 'cp-rt-star');
      starEl.src = 'assets/icons/star.svg';
      starEl.alt = '';
      starsRow.appendChild(starEl);
      starEls.push(starEl);
    }
    header.appendChild(starsRow);
    wrap.appendChild(header);

    /* Title */
    var title = _el('h1', 'cp-title');
    title.textContent = page.title;
    wrap.appendChild(title);

    /* Cards */
    var cardsWrap = _el('div', 'cp-rt-cards');
    var cardLeft  = _el('button', 'cp-rt-card');
    cardLeft.dataset.side  = 'left';
    var cardRight = _el('button', 'cp-rt-card');
    cardRight.dataset.side = 'right';
    cardsWrap.appendChild(cardLeft);
    cardsWrap.appendChild(cardRight);
    wrap.appendChild(cardsWrap);

    area.appendChild(wrap);

    function _loadRound(idx) {
      var round = page.rounds[idx];
      answered  = false;

      /* Reset card state */
      cardLeft.className  = 'cp-rt-card';
      cardRight.className = 'cp-rt-card';
      cardLeft.textContent  = round.left.value;
      cardRight.textContent = round.right.value;

      counter.textContent = (idx + 1) + ' / ' + totalRounds;

      /* Slide-in animation for subsequent rounds */
      if (idx > 0 && typeof anime !== 'undefined') {
        anime.set(cardLeft,  { opacity: 0, translateX: -80 });
        anime.set(cardRight, { opacity: 0, translateX:  80 });
        anime({
          targets: [cardLeft, cardRight],
          opacity: 1, translateX: 0,
          duration: 380,
          delay: anime.stagger(80, { start: 120 }),
          easing: 'easeOutBack'
        });
      }
    }

    function _fillStar(idx) {
      if (!starEls[idx]) return;
      starEls[idx].classList.add('cp-rt-star--filled');
      if (typeof playStarPop === 'function') playStarPop();
    }

    function _advance() {
      roundIndex++;
      if (roundIndex < totalRounds) {
        _loadRound(roundIndex);
      } else {
        renderPage(page.next);
      }
    }

    function _onTap(tappedCard, otherCard, tappedSide) {
      if (answered) return;
      answered = true;

      var round       = page.rounds[roundIndex];
      var correctSide = round.left.numericValue > round.right.numericValue ? 'left' : 'right';

      if (tappedSide === correctSide) {
        tappedCard.classList.add('cp-rt-card--correct', 'cp-rt-card--fly');
        if (typeof playCorrect === 'function') playCorrect();
        _fillStar(stars);
        stars++;
        setTimeout(_advance, 900);
      } else {
        tappedCard.classList.add('cp-rt-card--wrong');
        otherCard.classList.add('cp-rt-card--correct');
        if (typeof playWrong === 'function') playWrong();
        setTimeout(_advance, 1100);
      }
    }

    cardLeft.addEventListener('click',  function () { _onTap(cardLeft,  cardRight, 'left');  });
    cardRight.addEventListener('click', function () { _onTap(cardRight, cardLeft,  'right'); });

    _loadRound(0);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 5.0 — staircase-concept
  ══════════════════════════════════════════════════════ */

  function _renderStaircaseConcept(page, area) {
    var wrap = _el('div', 'cp-staircase');
    wrap.dataset.pageId = page.id;

    if (page.title) {
      var titleEl = _el('h1', 'cp-title cp-staircase__title');
      titleEl.textContent = page.title;
      wrap.appendChild(titleEl);
    }

    var stepsRow = _el('div', 'cp-staircase__steps');
    page.steps.forEach(function (step, i) {
      var stepEl = _el('div', 'cp-staircase__step');
      var baseH  = 60 + i * 40;
      var vhH    = 8  + i * 4;
      var maxH   = 80 + i * 45;
      stepEl.style.height = 'clamp(' + baseH + 'px, ' + vhH + 'vh, ' + maxH + 'px)';

      var val = _el('div', 'cp-staircase__step-value');
      val.textContent = step.value;
      stepEl.appendChild(val);
      stepsRow.appendChild(stepEl);
    });
    wrap.appendChild(stepsRow);

    var btn = _el('button', 'cp-btn-primary');
    btn.textContent = 'Next →';
    btn.style.opacity = '0';
    btn.addEventListener('click', function () { renderPage(page.next); });
    wrap.appendChild(btn);

    area.appendChild(wrap);

    setTimeout(function () {
      if (_currentPageId === page.id) renderPage(page.next);
    }, 7000);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 6.0 — staircase-flip
  ══════════════════════════════════════════════════════ */

  function _renderStaircaseFlip(page, area) {
    var wrap = _el('div', 'cp-staircase cp-staircase--flipped');
    wrap.dataset.pageId = page.id;

    var stepsRow = _el('div', 'cp-staircase__steps');
    page.steps.forEach(function (step, i) {
      var j = page.steps.length - 1 - i;
      var stepEl = _el('div', 'cp-staircase__step');
      stepEl.style.height = 'clamp(' + (60 + j * 40) + 'px, ' + (8 + j * 4) + 'vh, ' + (80 + j * 45) + 'px)';
      var val = _el('div', 'cp-staircase__step-value');
      val.textContent = step.value;
      stepEl.appendChild(val);
      stepsRow.appendChild(stepEl);
    });
    wrap.appendChild(stepsRow);

    var dirArrow = _el('div', 'cp-staircase__dir-arrow');
    dirArrow.textContent = '↓';
    wrap.appendChild(dirArrow);

    var btn = _el('button', 'cp-btn-primary');
    btn.textContent = 'Next →';
    btn.style.opacity = '0';
    btn.addEventListener('click', function () { renderPage(page.next); });
    wrap.appendChild(btn);

    area.appendChild(wrap);

    setTimeout(function () {
      if (_currentPageId === page.id) renderPage(page.next);
    }, 7000);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 5.1 — hint-card
  ══════════════════════════════════════════════════════ */

  function _renderHintCard(page, area) {
    var wrap = _el('div', 'cp-hint-card');
    wrap.dataset.pageId = page.id;

    /* ─── Rich path: operators pill + title typewriter + subhint ─── */
    if (page.operators && page.title) {
      var card = _el('div', 'cp-si-card');

      var pill = _el('div', 'cp-si-op-pill');
      pill.setAttribute('aria-hidden', 'true');
      page.operators.forEach(function (op) {
        var badge = _el('span', 'cp-si-op-badge');
        badge.textContent = op;
        pill.appendChild(badge);
      });
      card.appendChild(pill);

      var richTitleEl = _el('div', 'cp-si-title');
      richTitleEl.setAttribute('aria-live', 'polite');
      card.appendChild(richTitleEl);

      var richSubhintEl = _el('p', 'cp-si-subhint');
      richSubhintEl.textContent = page.subhint || '';
      card.appendChild(richSubhintEl);

      wrap.appendChild(card);
      area.appendChild(wrap);

      var richChars = page.title.split('');
      var richIdx   = 0;

      function richTypeNext() {
        if (_currentPageId !== page.id) return;
        if (richIdx < richChars.length) {
          richTitleEl.textContent += richChars[richIdx];
          richIdx++;
          if (typeof playTick === 'function') playTick();
          setTimeout(richTypeNext, 80);
        } else {
          richSubhintEl.classList.add('cp-si-subhint--visible');
          setTimeout(function () {
            if (_currentPageId !== page.id) return;
            if (typeof anime !== 'undefined') {
              anime({
                targets: card,
                opacity: 0,
                scale: 0.92,
                duration: 500,
                easing: 'easeInBack',
                complete: function () {
                  if (_currentPageId === page.id) renderPage(page.next);
                }
              });
            } else {
              renderPage(page.next);
            }
          }, page.autoDelay);
        }
      }

      setTimeout(richTypeNext, 900);
      return;
    }

    /* ─── Legacy path: simple typewriter (e.g. page 5.1) ─── */
    var textEl = _el('div', 'cp-hint-card__text');
    textEl.setAttribute('aria-live', 'polite');
    wrap.appendChild(textEl);
    area.appendChild(wrap);

    var chars = page.text.split('');
    var idx   = 0;

    function typeNext() {
      if (_currentPageId !== page.id) return;
      if (idx < chars.length) {
        textEl.textContent += chars[idx];
        idx++;
        if (typeof playTick === 'function') playTick();
        setTimeout(typeNext, 80);
      } else {
        setTimeout(function () {
          if (_currentPageId === page.id) renderPage(page.next);
        }, page.autoDelay);
      }
    }

    setTimeout(typeNext, 300);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 5.2 — drag-sort
  ══════════════════════════════════════════════════════ */

  function _renderDragSort(page, area) {
    var wrap = _el('div', 'cp-drag-sort');
    wrap.dataset.pageId = page.id;

    var title = _el('h1', 'cp-title');
    title.textContent = page.title;
    wrap.appendChild(title);

    var tilesRow = _el('div', 'cp-ds-tiles');
    var slotsRow = _el('div', 'cp-ds-slots');

    var lockedCount   = 0;
    var draggedTileId = null;
    var tileRegistry  = {};

    function _handleDrop(tileId, slot) {
      if (slot.classList.contains('cp-ds-slot--locked')) return;
      var reg = tileRegistry[tileId];
      if (!reg) return;
      var tile = reg.el;

      if (slot.dataset.correctTileId === tileId) {
        slot.classList.add('cp-ds-slot--locked');
        tile.classList.remove('cp-ds-tile--wrong');
        tile.classList.add('cp-ds-tile--locked', 'cp-ds-tile--bounce');
        slot.appendChild(tile);
        if (typeof playCorrect === 'function') playCorrect();
        lockedCount++;
        if (lockedCount === page.slots.length) {
          setTimeout(function () {
            if (_currentPageId === page.id) renderPage(page.next);
          }, 500);
        }
      } else {
        tile.classList.add('cp-ds-tile--wrong');
        if (typeof playWrong === 'function') playWrong();
        setTimeout(function () {
          tile.classList.remove('cp-ds-tile--wrong');
          if (!reg.originContainer.contains(tile)) {
            reg.originContainer.appendChild(tile);
          }
        }, 600);
      }
    }

    page.tiles.forEach(function (tileData) {
      var placeholder = _el('div', 'cp-ds-tile-placeholder');

      var tile = _el('div', 'cp-ds-tile');
      tile.textContent = tileData.display;
      tile.setAttribute('draggable', 'true');
      tile.dataset.tileId = tileData.id;

      tileRegistry[tileData.id] = { el: tile, originContainer: placeholder };
      placeholder.appendChild(tile);
      tilesRow.appendChild(placeholder);

      /* HTML5 drag events */
      tile.addEventListener('dragstart', function (e) {
        if (tile.classList.contains('cp-ds-tile--locked')) { e.preventDefault(); return; }
        draggedTileId = tileData.id;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tileData.id);
        tile.classList.add('cp-ds-tile--dragging');
      });
      tile.addEventListener('dragend', function () {
        tile.classList.remove('cp-ds-tile--dragging');
      });

      /* Touch drag events */
      var ghost = null;
      var offsetX, offsetY;

      tile.addEventListener('touchstart', function (e) {
        if (tile.classList.contains('cp-ds-tile--locked')) return;
        e.preventDefault();
        var touch = e.touches[0];
        var rect  = tile.getBoundingClientRect();
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;
        draggedTileId = tileData.id;

        ghost = tile.cloneNode(true);
        ghost.classList.add('cp-ds-tile--ghost');
        ghost.style.position = 'fixed';
        ghost.style.width    = rect.width  + 'px';
        ghost.style.height   = rect.height + 'px';
        ghost.style.left     = (touch.clientX - offsetX) + 'px';
        ghost.style.top      = (touch.clientY - offsetY) + 'px';
        ghost.style.zIndex   = '9990';
        document.body.appendChild(ghost);
        tile.classList.add('cp-ds-tile--dragging');
      }, { passive: false });

      tile.addEventListener('touchmove', function (e) {
        if (!ghost) return;
        e.preventDefault();
        var touch = e.touches[0];
        ghost.style.left = (touch.clientX - offsetX) + 'px';
        ghost.style.top  = (touch.clientY - offsetY) + 'px';

        ghost.style.display = 'none';
        var el = document.elementFromPoint(touch.clientX, touch.clientY);
        ghost.style.display = '';

        document.querySelectorAll('.cp-ds-slot').forEach(function (s) {
          s.classList.remove('cp-ds-slot--hover');
        });
        var hoveredSlot = el && el.closest('.cp-ds-slot');
        if (hoveredSlot && !hoveredSlot.classList.contains('cp-ds-slot--locked')) {
          hoveredSlot.classList.add('cp-ds-slot--hover');
        }
      }, { passive: false });

      tile.addEventListener('touchend', function (e) {
        if (!ghost) return;
        var touch = e.changedTouches[0];
        ghost.style.display = 'none';
        var el = document.elementFromPoint(touch.clientX, touch.clientY);
        ghost.style.display = '';
        document.body.removeChild(ghost);
        ghost = null;
        tile.classList.remove('cp-ds-tile--dragging');

        document.querySelectorAll('.cp-ds-slot').forEach(function (s) {
          s.classList.remove('cp-ds-slot--hover');
        });

        var slot = el && el.closest('.cp-ds-slot');
        if (slot) _handleDrop(tileData.id, slot);
      });
    });

    page.slots.forEach(function (slotData, i) {
      var slot = _el('div', 'cp-ds-slot');
      slot.dataset.slotIdx       = i;
      slot.dataset.correctTileId = slotData.correctTileId;

      var arrow = _el('div', 'cp-ds-slot__arrow');
      arrow.textContent = '↑';
      var label = _el('div', 'cp-ds-slot__label');
      label.textContent = slotData.label;
      slot.appendChild(arrow);
      slot.appendChild(label);

      slot.addEventListener('dragover', function (e) {
        if (slot.classList.contains('cp-ds-slot--locked')) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        slot.classList.add('cp-ds-slot--hover');
      });
      slot.addEventListener('dragleave', function () {
        slot.classList.remove('cp-ds-slot--hover');
      });
      slot.addEventListener('drop', function (e) {
        e.preventDefault();
        slot.classList.remove('cp-ds-slot--hover');
        if (slot.classList.contains('cp-ds-slot--locked')) return;
        var id = e.dataTransfer.getData('text/plain') || draggedTileId;
        _handleDrop(id, slot);
      });

      slotsRow.appendChild(slot);
    });

    wrap.appendChild(tilesRow);
    wrap.appendChild(slotsRow);
    area.appendChild(wrap);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 5.2 — drag-and-rank (leaderboard)
  ══════════════════════════════════════════════════════ */

  function _renderDragAndRank(page, area) {
    var wrap = _el('div', 'cp-dar');
    wrap.dataset.pageId = page.id;
    var guardId = _currentPageId;

    var heading = _el('h1', 'cp-title cp-dar-heading');
    heading.textContent = page.heading;
    wrap.appendChild(heading);

    if (page.subtitle) {
      var subtitle = _el('p', 'cp-dar-subtitle');
      subtitle.textContent = page.subtitle;
      wrap.appendChild(subtitle);
    }

    if (page.storyText) {
      var storyCard = _el('div', 'cp-dar-story');
      var storyP = _el('p', 'cp-dar-story-text');
      storyP.textContent = page.storyText;
      storyCard.appendChild(storyP);
      wrap.appendChild(storyCard);
    }

    var arrowEl = null;
    if (page.showArrow) {
      arrowEl = _el('div', 'cp-dar-arrow');
      arrowEl.textContent = '↓';
      arrowEl.setAttribute('aria-hidden', 'true');
      wrap.appendChild(arrowEl);
    }

    var tilesRow = _el('div', 'cp-dar-tiles');
    var slotsRow = _el('div', 'cp-dar-slots');

    var lockedCount   = 0;
    var draggedTileId = null;
    var tileRegistry  = {};

    function _handleDrop(tileId, slot) {
      if (slot.classList.contains('cp-dar-slot--locked')) return;
      var reg = tileRegistry[tileId];
      if (!reg) return;
      var tile = reg.el;

      if (slot.dataset.correctTileId === tileId) {
        slot.classList.add('cp-dar-slot--locked');
        tile.classList.remove('cp-dar-tile--wrong');
        tile.classList.add('cp-dar-tile--locked');
        slot.appendChild(tile);
        if (typeof playCorrect === 'function') playCorrect();
        lockedCount++;
        if (lockedCount === page.slots.length) {
          if (resultCard) {
            /* Cascade glow left → right on all locked tiles */
            var lockedEls = [];
            slotsRow.querySelectorAll('.cp-dar-slot--locked').forEach(function (s) {
              var t = s.querySelector('.cp-dar-tile--locked');
              if (t) lockedEls.push(t);
            });
            if (typeof anime !== 'undefined') {
              lockedEls.forEach(function (t, i) {
                anime({
                  targets: t,
                  boxShadow: [
                    { value: '0 0 0 0 rgba(52,211,153,0)',    duration: 0 },
                    { value: '0 0 0 8px rgba(52,211,153,0.6)', duration: 400, delay: i * 280 },
                    { value: '0 0 0 0 rgba(52,211,153,0)',    duration: 400 }
                  ],
                  easing: 'easeOutSine'
                });
              });
            }
            if (typeof playComplete === 'function') playComplete();

            /* Reveal result card */
            setTimeout(function () {
              if (_currentPageId !== guardId) return;
              resultCard.style.display = '';
              if (typeof anime !== 'undefined') {
                anime.set(resultCard, { opacity: 0, translateY: 18 });
                anime({ targets: resultCard, opacity: 1, translateY: 0, duration: 480, easing: 'easeOutBack' });
              }
            }, 1600);

            /* Highlight key number */
            if (resultHighlightEl) {
              setTimeout(function () {
                if (_currentPageId !== guardId) return;
                if (typeof anime !== 'undefined') {
                  anime({
                    targets: resultHighlightEl,
                    backgroundColor: ['rgba(255,210,60,0.2)', 'rgba(255,210,60,0.72)'],
                    duration: 500, direction: 'alternate', loop: 2, easing: 'easeInOutSine'
                  });
                }
              }, 2000);
            }

            /* Reveal continue button */
            setTimeout(function () {
              if (_currentPageId !== guardId) return;
              continueBtn.style.display = '';
              if (typeof anime !== 'undefined') {
                anime.set(continueBtn, { opacity: 0 });
                anime({ targets: continueBtn, opacity: 1, duration: 320, easing: 'easeOutQuad',
                  complete: function () { continueBtn.classList.add('cp-dar-continue--pulse'); }
                });
              }
            }, 3800);

          } else {
            setTimeout(function () {
              if (_currentPageId === guardId) renderPage(page.next);
            }, 500);
          }
        }
      } else {
        tile.classList.add('cp-dar-tile--wrong');
        hintEl.textContent = page.wrongHint || 'Try a smaller number here';
        if (typeof anime !== 'undefined') {
          anime.set(hintEl, { opacity: 0 });
          anime({ targets: hintEl, opacity: 1, duration: 200, easing: 'easeOutQuad' });
        }
        if (typeof playWrong === 'function') playWrong();
        setTimeout(function () {
          tile.classList.remove('cp-dar-tile--wrong');
          if (!reg.originContainer.contains(tile)) {
            reg.originContainer.appendChild(tile);
          }
          if (typeof anime !== 'undefined') {
            anime({ targets: hintEl, opacity: 0, duration: 250, easing: 'easeInQuad',
              complete: function () { hintEl.textContent = ''; }
            });
          } else {
            hintEl.textContent = '';
          }
        }, 800);
      }
    }

    page.tiles.forEach(function (tileData) {
      var placeholder = _el('div', 'cp-dar-tile-placeholder');

      var tile = _el('div', 'cp-dar-tile');
      tile.setAttribute('draggable', 'true');
      tile.dataset.tileId = tileData.id;

      var nameEl = _el('p', 'cp-dar-tile__name');
      nameEl.textContent = tileData.name;
      var scoreEl = _el('p', 'cp-dar-tile__score');
      scoreEl.textContent = tileData.score;
      tile.appendChild(nameEl);
      tile.appendChild(scoreEl);

      tileRegistry[tileData.id] = { el: tile, originContainer: placeholder };
      placeholder.appendChild(tile);
      tilesRow.appendChild(placeholder);

      /* HTML5 drag */
      tile.addEventListener('dragstart', function (e) {
        if (tile.classList.contains('cp-dar-tile--locked')) { e.preventDefault(); return; }
        draggedTileId = tileData.id;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tileData.id);
        tile.classList.add('cp-dar-tile--dragging');
      });
      tile.addEventListener('dragend', function () {
        tile.classList.remove('cp-dar-tile--dragging');
      });

      /* Touch drag */
      var ghost = null;
      var offsetX, offsetY;

      tile.addEventListener('touchstart', function (e) {
        if (tile.classList.contains('cp-dar-tile--locked')) return;
        e.preventDefault();
        var touch = e.touches[0];
        var rect  = tile.getBoundingClientRect();
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;
        draggedTileId = tileData.id;

        ghost = tile.cloneNode(true);
        ghost.classList.add('cp-dar-tile--ghost');
        ghost.style.position = 'fixed';
        ghost.style.width    = rect.width  + 'px';
        ghost.style.height   = rect.height + 'px';
        ghost.style.left     = (touch.clientX - offsetX) + 'px';
        ghost.style.top      = (touch.clientY - offsetY) + 'px';
        ghost.style.zIndex   = '9990';
        document.body.appendChild(ghost);
        tile.classList.add('cp-dar-tile--dragging');
      }, { passive: false });

      tile.addEventListener('touchmove', function (e) {
        if (!ghost) return;
        e.preventDefault();
        var touch = e.touches[0];
        ghost.style.left = (touch.clientX - offsetX) + 'px';
        ghost.style.top  = (touch.clientY - offsetY) + 'px';

        ghost.style.display = 'none';
        var el = document.elementFromPoint(touch.clientX, touch.clientY);
        ghost.style.display = '';

        document.querySelectorAll('.cp-dar-slot').forEach(function (s) {
          s.classList.remove('cp-dar-slot--hover');
        });
        var hoveredSlot = el && el.closest('.cp-dar-slot');
        if (hoveredSlot && !hoveredSlot.classList.contains('cp-dar-slot--locked')) {
          hoveredSlot.classList.add('cp-dar-slot--hover');
        }
      }, { passive: false });

      tile.addEventListener('touchend', function (e) {
        if (!ghost) return;
        var touch = e.changedTouches[0];
        ghost.style.display = 'none';
        var el = document.elementFromPoint(touch.clientX, touch.clientY);
        ghost.style.display = '';
        document.body.removeChild(ghost);
        ghost = null;
        tile.classList.remove('cp-dar-tile--dragging');

        document.querySelectorAll('.cp-dar-slot').forEach(function (s) {
          s.classList.remove('cp-dar-slot--hover');
        });

        var slot = el && el.closest('.cp-dar-slot');
        if (slot) _handleDrop(tileData.id, slot);
      });
    });

    page.slots.forEach(function (slotData, i) {
      var slot = _el('div', 'cp-dar-slot');
      slot.dataset.slotIdx       = i;
      slot.dataset.correctTileId = slotData.correctTileId;

      var label = _el('div', 'cp-dar-slot__label');
      label.textContent = slotData.label;
      slot.appendChild(label);

      slot.addEventListener('dragover', function (e) {
        if (slot.classList.contains('cp-dar-slot--locked')) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        slot.classList.add('cp-dar-slot--hover');
      });
      slot.addEventListener('dragleave', function () {
        slot.classList.remove('cp-dar-slot--hover');
      });
      slot.addEventListener('drop', function (e) {
        e.preventDefault();
        slot.classList.remove('cp-dar-slot--hover');
        if (slot.classList.contains('cp-dar-slot--locked')) return;
        var id = e.dataTransfer.getData('text/plain') || draggedTileId;
        _handleDrop(id, slot);
      });

      slotsRow.appendChild(slot);
    });

    var hintEl = _el('div', 'cp-dar-hint');
    hintEl.setAttribute('aria-live', 'polite');

    /* Result card — pre-built, hidden until all correct */
    var resultCard = null;
    var resultHighlightEl = null;
    if (page.resultLines && page.resultLines.length) {
      resultCard = _el('div', 'cp-dar-result');
      resultCard.setAttribute('aria-live', 'polite');
      resultCard.style.display = 'none';
      (page.resultLines || []).forEach(function (line) {
        var p = _el('p', 'cp-dar-result-line');
        if (page.resultHighlight && line.indexOf(page.resultHighlight) !== -1) {
          var parts = line.split(page.resultHighlight);
          p.appendChild(document.createTextNode(parts[0]));
          resultHighlightEl = _el('span', 'cp-dar-result-highlight');
          resultHighlightEl.textContent = page.resultHighlight;
          p.appendChild(resultHighlightEl);
          if (parts[1]) p.appendChild(document.createTextNode(parts[1]));
        } else {
          p.textContent = line;
        }
        resultCard.appendChild(p);
      });
    }

    /* Continue button — pre-built, hidden until all correct */
    var continueBtn = null;
    if (page.resultLines && page.resultLines.length) {
      continueBtn = _el('button', 'cp-btn-primary cp-dar-continue');
      continueBtn.textContent = 'Continue →';
      continueBtn.style.display = 'none';
      continueBtn.addEventListener('click', function () { renderPage(page.next); });
    }

    wrap.appendChild(tilesRow);
    wrap.appendChild(slotsRow);
    wrap.appendChild(hintEl);
    if (resultCard) wrap.appendChild(resultCard);
    if (continueBtn) wrap.appendChild(continueBtn);
    area.appendChild(wrap);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 5.3 — completion-reveal
  ══════════════════════════════════════════════════════ */

  function _renderCompletionReveal(page, area) {
    var parent = _findPage(page.parent);
    if (!parent) return;

    var wrap = _el('div', 'cp-completion-reveal');
    wrap.dataset.pageId = page.id;

    var arrow = _el('div', 'cp-cr-arrow');
    arrow.textContent = page.arrow || '↑';
    wrap.appendChild(arrow);

    var tilesRow = _el('div', 'cp-cr-tiles');
    parent.slots.forEach(function (slotData) {
      var tileData = null;
      for (var i = 0; i < parent.tiles.length; i++) {
        if (parent.tiles[i].id === slotData.correctTileId) { tileData = parent.tiles[i]; break; }
      }
      if (!tileData) return;
      var tile = _el('div', 'cp-cr-tile');
      tile.textContent = tileData.display;
      tilesRow.appendChild(tile);
    });
    wrap.appendChild(tilesRow);
    area.appendChild(wrap);

    setTimeout(function () {
      if (_currentPageId === page.id) renderPage(page.next);
    }, page.autoDelay);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 5.4 — ascending-pattern
  ══════════════════════════════════════════════════════ */

  function _renderAscendingPattern(page, area) {
    var wrap = _el('div', 'cp-ascending-pattern');
    wrap.dataset.pageId = page.id;

    var title = _el('h1', 'cp-title');
    title.textContent = page.title;
    wrap.appendChild(title);

    var rule = _el('p', 'cp-rule-line');
    rule.textContent = page.rule;
    wrap.appendChild(rule);

    var compareRow = _el('div', 'cp-ap-compare-row');
    page.compareNumbers.forEach(function (num) {
      var card = _el('div', 'cp-ap-num-card');
      var digitsEl = _el('div', 'cp-ap-digits');
      num.digits.forEach(function (d, i) {
        var span = _el('span', 'cp-ap-digit' + (i === num.diffIndex ? ' cp-ap-digit--highlight' : ''));
        span.textContent = d;
        digitsEl.appendChild(span);
      });
      card.appendChild(digitsEl);
      compareRow.appendChild(card);
    });
    wrap.appendChild(compareRow);

    var btn = _el('button', 'cp-btn-primary');
    btn.textContent = page.primaryAction.label;
    var nextId = page.primaryAction.next;
    btn.addEventListener('click', function () { renderPage(nextId); });
    wrap.appendChild(btn);

    area.appendChild(wrap);
  }

  /* ══════════════════════════════════════════════════════
     Section 7 — Architect / Digit-Place / Greatest
  ══════════════════════════════════════════════════════ */

  function _renderArchitectIntro(page, area) {
    var wrap = _el('div', 'cp-architect-intro');

    var icon = _el('div', 'cp-architect-icon');
    icon.textContent = '🏗️';
    wrap.appendChild(icon);

    var h1 = _el('h1', 'cp-title');
    h1.textContent = page.title;
    wrap.appendChild(h1);

    var sub = _el('p', 'cp-subtitle');
    sub.textContent = page.subtitle;
    wrap.appendChild(sub);

    var boxes = _el('div', 'cp-architect-boxes');
    for (var b = 0; b < 6; b++) {
      boxes.appendChild(_el('div', 'cp-architect-box'));
    }
    wrap.appendChild(boxes);

    var btn = _el('button', 'cp-btn-primary');
    btn.textContent = 'Let\'s Build →';
    btn.style.opacity = '0';
    btn.addEventListener('click', function () { renderPage(page.next); });
    wrap.appendChild(btn);

    area.appendChild(wrap);
  }

  function _renderDigitPrompt(page, area) {
    var wrap = _el('div', 'cp-digit-prompt');

    var tilesRow = _el('div', 'cp-dp-tiles');
    page.digits.forEach(function (d) {
      var tile = _el('div', 'cp-dp-tile');
      tile.textContent = d;
      tilesRow.appendChild(tile);
    });
    wrap.appendChild(tilesRow);

    var slotsRow = _el('div', 'cp-dp-slots');
    page.columns.forEach(function (col) {
      var slot = _el('div', 'cp-dp-slot');
      var lbl = _el('span', 'cp-dp-slot__label');
      lbl.textContent = col;
      slot.appendChild(lbl);
      slotsRow.appendChild(slot);
    });
    wrap.appendChild(slotsRow);

    area.appendChild(wrap);

    var pid = _currentPageId;
    setTimeout(function () {
      if (_currentPageId !== pid) return;
      renderPage(page.next);
    }, page.autoDelay || 3800);
  }

  function _renderDigitPlace(page, area) {
    var wrap = _el('div', 'cp-digit-place');

    var h1 = _el('h1', 'cp-title');
    h1.textContent = page.title;
    wrap.appendChild(h1);

    if (page.subtitle) {
      var subtitleEl = _el('p', 'cp-subtitle');
      subtitleEl.textContent = page.subtitle;
      wrap.appendChild(subtitleEl);
    }

    var placedCount  = 0;
    var draggedDigit = null;
    var tileRegistry = {};

    /* Build tiles row */
    var tilesRow = _el('div', 'cp-dp-tiles');
    page.digits.forEach(function (d) {
      var placeholder = _el('div', 'cp-dp-tile-placeholder');
      var tile = _el('div', 'cp-dp-tile');
      tile.setAttribute('draggable', 'true');
      tile.dataset.digit = d;
      tile.textContent = d;
      placeholder.appendChild(tile);
      tilesRow.appendChild(placeholder);
      tileRegistry[d] = { el: tile, originContainer: placeholder };
    });
    wrap.appendChild(tilesRow);

    /* Build slots row */
    var slotsRow = _el('div', 'cp-dp-slots');
    var slotEls = [];
    page.columns.forEach(function (col, idx) {
      var slot = _el('div', 'cp-dp-slot');
      slot.dataset.slotIdx = idx;
      slot.dataset.column  = col;
      var lbl = _el('span', 'cp-dp-slot__label');
      lbl.textContent = col;
      slot.appendChild(lbl);
      slotsRow.appendChild(slot);
      slotEls.push(slot);
    });
    wrap.appendChild(slotsRow);
    area.appendChild(wrap);

    /* Mark first slot active */
    slotEls[0].classList.add('cp-dp-slot--active');

    var pid = _currentPageId;

    function _handleDigitDrop(digit, slotEl) {
      var slotIdx = parseInt(slotEl.dataset.slotIdx, 10);
      if (slotIdx !== placedCount) return;
      if (slotEl.classList.contains('cp-dp-slot--locked')) return;

      var reg          = tileRegistry[digit];
      var tile         = reg ? reg.el : null;
      if (!tile) return;

      var correctDigit = page.correctOrder[placedCount];

      if (digit === correctDigit) {
        slotEl.classList.remove('cp-dp-slot--active');
        slotEl.classList.add('cp-dp-slot--locked');
        tile.classList.add('cp-dp-tile--locked', 'cp-dp-tile--bounce');
        tile.style.animation = '';
        slotEl.appendChild(tile);
        if (typeof playCorrect === 'function') playCorrect();
        placedCount++;
        if (placedCount < slotEls.length) {
          slotEls[placedCount].classList.add('cp-dp-slot--active');
        }
        if (placedCount === page.digits.length) {
          setTimeout(function () {
            if (_currentPageId !== pid) return;
            renderPage(page.next);
          }, 500);
        }
      } else {
        tile.classList.add('cp-dp-tile--wrong');
        if (typeof playWrong === 'function') playWrong();

        var hintReg  = tileRegistry[correctDigit];
        var hintTile = hintReg ? hintReg.el : null;
        if (hintTile && !hintTile.classList.contains('cp-dp-tile--locked')) {
          hintTile.classList.add('cp-dp-tile--hint');
          if (typeof playHintShimmer === 'function') playHintShimmer();
          setTimeout(function () {
            hintTile.classList.remove('cp-dp-tile--hint');
          }, 1000);
        }

        setTimeout(function () {
          if (_currentPageId !== pid) return;
          tile.classList.remove('cp-dp-tile--wrong');
          if (reg.originContainer && !tile.classList.contains('cp-dp-tile--locked')) {
            reg.originContainer.appendChild(tile);
          }
        }, 600);
      }
    }

    /* HTML5 Drag events */
    Object.keys(tileRegistry).forEach(function (d) {
      var tile = tileRegistry[d].el;

      tile.addEventListener('dragstart', function (e) {
        draggedDigit = d;
        tile.classList.add('cp-dp-tile--dragging');
        e.dataTransfer.setData('text/plain', d);
        e.dataTransfer.effectAllowed = 'move';
      });

      tile.addEventListener('dragend', function () {
        tile.classList.remove('cp-dp-tile--dragging');
      });
    });

    slotEls.forEach(function (slot) {
      slot.addEventListener('dragover', function (e) {
        e.preventDefault();
        var idx = parseInt(slot.dataset.slotIdx, 10);
        if (idx === placedCount) slot.classList.add('cp-dp-slot--hover');
      });

      slot.addEventListener('dragleave', function () {
        slot.classList.remove('cp-dp-slot--hover');
      });

      slot.addEventListener('drop', function (e) {
        e.preventDefault();
        slot.classList.remove('cp-dp-slot--hover');
        if (draggedDigit) _handleDigitDrop(draggedDigit, slot);
      });
    });

    /* Touch drag */
    Object.keys(tileRegistry).forEach(function (d) {
      var tile      = tileRegistry[d].el;
      var ghost     = null;
      var touchOffX = 0;
      var touchOffY = 0;
      var activeSlot = null;

      tile.addEventListener('touchstart', function (e) {
        if (tile.classList.contains('cp-dp-tile--locked')) return;
        e.preventDefault();
        var touch = e.touches[0];
        var rect  = tile.getBoundingClientRect();
        touchOffX = touch.clientX - rect.left;
        touchOffY = touch.clientY - rect.top;

        ghost = tile.cloneNode(true);
        ghost.classList.add('cp-dp-tile--ghost');
        ghost.classList.remove('cp-dp-tile--locked', 'cp-dp-tile--bounce',
                               'cp-dp-tile--wrong', 'cp-dp-tile--hint');
        ghost.style.width  = rect.width  + 'px';
        ghost.style.height = rect.height + 'px';
        ghost.style.left   = (touch.clientX - touchOffX) + 'px';
        ghost.style.top    = (touch.clientY - touchOffY) + 'px';
        document.body.appendChild(ghost);
      }, { passive: false });

      tile.addEventListener('touchmove', function (e) {
        if (!ghost) return;
        e.preventDefault();
        var touch = e.touches[0];
        ghost.style.left = (touch.clientX - touchOffX) + 'px';
        ghost.style.top  = (touch.clientY - touchOffY) + 'px';

        ghost.style.display = 'none';
        var el = document.elementFromPoint(touch.clientX, touch.clientY);
        ghost.style.display = '';

        var found = el ? el.closest('.cp-dp-slot') : null;
        if (activeSlot && activeSlot !== found) {
          activeSlot.classList.remove('cp-dp-slot--hover');
        }
        activeSlot = found;
        if (found) {
          var idx = parseInt(found.dataset.slotIdx, 10);
          if (idx === placedCount) found.classList.add('cp-dp-slot--hover');
        }
      }, { passive: false });

      tile.addEventListener('touchend', function (e) {
        if (!ghost) return;
        e.preventDefault();
        var touch = e.changedTouches[0];

        ghost.style.display = 'none';
        var el = document.elementFromPoint(touch.clientX, touch.clientY);
        ghost.style.display = '';
        document.body.removeChild(ghost);
        ghost = null;

        if (activeSlot) {
          activeSlot.classList.remove('cp-dp-slot--hover');
          activeSlot = null;
        }

        var target = el ? el.closest('.cp-dp-slot') : null;
        if (target) _handleDigitDrop(d, target);
      }, { passive: false });
    });
  }

  function _renderNumberLockReveal(page, area) {
    var wrap = _el('div', 'cp-number-lock-reveal');

    var lbl = _el('p', 'cp-nlr-label');
    lbl.textContent = 'Greatest 6-digit number:';
    wrap.appendChild(lbl);

    var num = _el('div', 'cp-nlr-number');
    num.textContent = page.number;
    wrap.appendChild(num);

    area.appendChild(wrap);

    var pid = _currentPageId;
    setTimeout(function () {
      if (_currentPageId !== pid) return;
      renderPage(page.next);
    }, page.autoDelay || 3200);
  }

  function _renderGreatestPattern(page, area) {
    var wrap = _el('div', 'cp-greatest-pattern');

    var h1 = _el('h1', 'cp-title');
    h1.textContent = page.title;
    wrap.appendChild(h1);

    var sub = _el('p', 'cp-gp-subtitle');
    sub.textContent = page.subtitle;
    wrap.appendChild(sub);

    var numRow = _el('div', 'cp-gp-number');
    page.digits.forEach(function (d, i) {
      var span = _el('span', 'cp-gp-digit');
      if (i === page.biggestIndex)  span.classList.add('cp-gp-digit--biggest');
      if (i === page.smallestIndex) span.classList.add('cp-gp-digit--smallest');
      span.textContent = d;
      numRow.appendChild(span);
    });
    wrap.appendChild(numRow);

    var arrow = _el('div', 'cp-gp-arrow');
    arrow.textContent = '←';
    wrap.appendChild(arrow);

    var btn = _el('button', 'cp-btn-primary');
    btn.textContent = page.primaryAction.label;
    var nextId = page.primaryAction.next;
    btn.addEventListener('click', function () { renderPage(nextId); });
    wrap.appendChild(btn);

    area.appendChild(wrap);
  }

  /* ══════════════════════════════════════════════════════
     SECTION 8 — Smallest Number / Spot the Trap
  ══════════════════════════════════════════════════════ */

  function _renderSmallestIntro(page, area) {
    var wrap = _el('div', 'cp-smallest-intro');
    wrap.dataset.pageId = page.id;

    var h1 = _el('h1', 'cp-title');
    h1.textContent = page.title;
    wrap.appendChild(h1);

    var tilesRow = _el('div', 'cp-sdp-tiles');
    page.digits.forEach(function (d) {
      var tile = _el('div', 'cp-sdp-tile');
      tile.textContent = d;
      tilesRow.appendChild(tile);
    });
    wrap.appendChild(tilesRow);

    var slotsRow = _el('div', 'cp-sdp-slots');
    page.columns.forEach(function (col) {
      var slot = _el('div', 'cp-sdp-slot');
      var lbl = _el('span', 'cp-sdp-slot__label');
      lbl.textContent = col;
      slot.appendChild(lbl);
      slotsRow.appendChild(slot);
    });
    wrap.appendChild(slotsRow);

    area.appendChild(wrap);

    if (typeof playFlipWhoosh === 'function') playFlipWhoosh();

    var pid = _currentPageId;
    setTimeout(function () {
      if (_currentPageId !== pid) return;
      renderPage(page.next);
    }, page.autoDelay || 2500);
  }

  function _renderSmallestDigitPlace(page, area) {
    var wrap = _el('div', 'cp-smallest-digit-place');
    wrap.dataset.pageId = page.id;

    var h1 = _el('h1', 'cp-title');
    h1.textContent = page.title;
    wrap.appendChild(h1);

    if (page.subtitle) {
      var subtitleEl = _el('p', 'cp-subtitle');
      subtitleEl.textContent = page.subtitle;
      wrap.appendChild(subtitleEl);
    }

    var placedCount  = 0;
    var draggedDigit = null;
    var tileRegistry = {};

    /* Build tiles row */
    var tilesRow = _el('div', 'cp-sdp-tiles');
    page.digits.forEach(function (d) {
      var placeholder = _el('div', 'cp-sdp-tile-placeholder');
      var tile = _el('div', 'cp-sdp-tile');
      tile.setAttribute('draggable', 'true');
      tile.dataset.digit = d;
      tile.textContent = d;
      placeholder.appendChild(tile);
      tilesRow.appendChild(placeholder);
      tileRegistry[d] = { el: tile, originContainer: placeholder };
    });
    wrap.appendChild(tilesRow);

    /* Build slots row */
    var slotsRow = _el('div', 'cp-sdp-slots');
    var slotEls = [];
    page.columns.forEach(function (col, idx) {
      var slot = _el('div', 'cp-sdp-slot');
      slot.dataset.slotIdx = idx;
      slot.dataset.column  = col;
      var lbl = _el('span', 'cp-sdp-slot__label');
      lbl.textContent = col;
      slot.appendChild(lbl);
      slotsRow.appendChild(slot);
      slotEls.push(slot);
    });
    wrap.appendChild(slotsRow);
    area.appendChild(wrap);

    slotEls[0].classList.add('cp-sdp-slot--active');

    var pid = _currentPageId;

    function _showZeroTrapPopup(slotEl) {
      var popup = _el('div', 'cp-zero-trap-popup');
      popup.textContent = "Smallest 6-digit number cannot start with 0";
      slotEl.appendChild(popup);
      setTimeout(function () {
        popup.classList.add('cp-zero-trap-popup--exit');
        setTimeout(function () {
          if (popup.parentNode) popup.parentNode.removeChild(popup);
        }, 300);
      }, 1200);
    }

    function _handleDigitDrop(digit, slotEl) {
      var slotIdx = parseInt(slotEl.dataset.slotIdx, 10);
      if (slotIdx !== placedCount) return;
      if (slotEl.classList.contains('cp-sdp-slot--locked')) return;

      var reg  = tileRegistry[digit];
      var tile = reg ? reg.el : null;
      if (!tile) return;

      var correctDigit = page.correctOrder[placedCount];

      if (digit === correctDigit) {
        slotEl.classList.remove('cp-sdp-slot--active');
        slotEl.classList.add('cp-sdp-slot--locked', 'cp-sdp-slot--correct-pulse');
        tile.classList.add('cp-sdp-tile--locked', 'cp-sdp-tile--bounce');
        tile.style.animation = '';
        slotEl.appendChild(tile);
        if (typeof playCorrect === 'function') playCorrect();
        setTimeout(function () { slotEl.classList.remove('cp-sdp-slot--correct-pulse'); }, 600);
        placedCount++;
        if (placedCount < slotEls.length) {
          slotEls[placedCount].classList.add('cp-sdp-slot--active');
        }
        if (placedCount === page.digits.length) {
          setTimeout(function () {
            if (_currentPageId !== pid) return;
            renderPage(page.next);
          }, 500);
        }
      } else {
        /* 0-trap: 0 dropped in Lakhs slot */
        if (digit === '0' && slotIdx === 0) {
          tile.classList.add('cp-sdp-tile--wrong');
          if (typeof playWrong === 'function') playWrong();
          _showZeroTrapPopup(slotEl);
        } else {
          tile.classList.add('cp-sdp-tile--wrong');
          if (typeof playWrong === 'function') playWrong();
          var hintReg  = tileRegistry[correctDigit];
          var hintTile = hintReg ? hintReg.el : null;
          if (hintTile && !hintTile.classList.contains('cp-sdp-tile--locked')) {
            hintTile.classList.add('cp-sdp-tile--hint');
            if (typeof playHintShimmer === 'function') playHintShimmer();
            setTimeout(function () { hintTile.classList.remove('cp-sdp-tile--hint'); }, 1000);
          }
        }
        setTimeout(function () {
          if (_currentPageId !== pid) return;
          tile.classList.remove('cp-sdp-tile--wrong');
          if (reg.originContainer && !tile.classList.contains('cp-sdp-tile--locked')) {
            reg.originContainer.appendChild(tile);
          }
        }, 600);
      }
    }

    /* HTML5 drag events */
    Object.keys(tileRegistry).forEach(function (d) {
      var tile = tileRegistry[d].el;

      tile.addEventListener('dragstart', function (e) {
        if (tile.classList.contains('cp-sdp-tile--locked')) { e.preventDefault(); return; }
        draggedDigit = d;
        tile.classList.add('cp-sdp-tile--dragging');
        e.dataTransfer.setData('text/plain', d);
        e.dataTransfer.effectAllowed = 'move';
        if (typeof playTick === 'function') playTick();
      });

      tile.addEventListener('dragend', function () {
        tile.classList.remove('cp-sdp-tile--dragging');
      });
    });

    slotEls.forEach(function (slot) {
      slot.addEventListener('dragover', function (e) {
        e.preventDefault();
        var idx = parseInt(slot.dataset.slotIdx, 10);
        if (idx === placedCount) slot.classList.add('cp-sdp-slot--hover');
      });
      slot.addEventListener('dragleave', function () {
        slot.classList.remove('cp-sdp-slot--hover');
      });
      slot.addEventListener('drop', function (e) {
        e.preventDefault();
        slot.classList.remove('cp-sdp-slot--hover');
        if (draggedDigit) _handleDigitDrop(draggedDigit, slot);
      });
    });

    /* Touch drag */
    Object.keys(tileRegistry).forEach(function (d) {
      var tile       = tileRegistry[d].el;
      var ghost      = null;
      var touchOffX  = 0;
      var touchOffY  = 0;
      var activeSlot = null;

      tile.addEventListener('touchstart', function (e) {
        if (tile.classList.contains('cp-sdp-tile--locked')) return;
        e.preventDefault();
        var touch = e.touches[0];
        var rect  = tile.getBoundingClientRect();
        touchOffX = touch.clientX - rect.left;
        touchOffY = touch.clientY - rect.top;

        ghost = tile.cloneNode(true);
        ghost.classList.add('cp-sdp-tile--ghost');
        ghost.classList.remove('cp-sdp-tile--locked', 'cp-sdp-tile--bounce',
                               'cp-sdp-tile--wrong', 'cp-sdp-tile--hint');
        ghost.style.width  = rect.width  + 'px';
        ghost.style.height = rect.height + 'px';
        ghost.style.left   = (touch.clientX - touchOffX) + 'px';
        ghost.style.top    = (touch.clientY - touchOffY) + 'px';
        document.body.appendChild(ghost);
        if (typeof playTick === 'function') playTick();
      }, { passive: false });

      tile.addEventListener('touchmove', function (e) {
        if (!ghost) return;
        e.preventDefault();
        var touch = e.touches[0];
        ghost.style.left = (touch.clientX - touchOffX) + 'px';
        ghost.style.top  = (touch.clientY - touchOffY) + 'px';

        ghost.style.display = 'none';
        var el = document.elementFromPoint(touch.clientX, touch.clientY);
        ghost.style.display = '';

        var found = el ? el.closest('.cp-sdp-slot') : null;
        if (activeSlot && activeSlot !== found) activeSlot.classList.remove('cp-sdp-slot--hover');
        activeSlot = found;
        if (found) {
          var idx = parseInt(found.dataset.slotIdx, 10);
          if (idx === placedCount) found.classList.add('cp-sdp-slot--hover');
        }
      }, { passive: false });

      tile.addEventListener('touchend', function (e) {
        if (!ghost) return;
        e.preventDefault();
        var touch = e.changedTouches[0];

        ghost.style.display = 'none';
        var el = document.elementFromPoint(touch.clientX, touch.clientY);
        ghost.style.display = '';
        document.body.removeChild(ghost);
        ghost = null;

        if (activeSlot) { activeSlot.classList.remove('cp-sdp-slot--hover'); activeSlot = null; }

        var target = el ? el.closest('.cp-sdp-slot') : null;
        if (target) _handleDigitDrop(d, target);
      }, { passive: false });
    });
  }

  function _renderZeroRuleReveal(page, area) {
    var wrap = _el('div', 'cp-zrr-wrap');
    wrap.dataset.pageId = page.id;

    var card = _el('div', 'cp-zrr-card');
    card.textContent = page.rule;
    wrap.appendChild(card);

    var demoRow = _el('div', 'cp-zrr-demo');

    var slotEl = _el('div', 'cp-zrr-slot');
    var slotLbl = _el('span', 'cp-sdp-slot__label');
    slotLbl.textContent = 'L';
    slotEl.appendChild(slotLbl);
    demoRow.appendChild(slotEl);

    var zeroTile = _el('div', 'cp-zrr-tile cp-zrr-tile--zero');
    zeroTile.textContent = '0';
    var badge = _el('span', 'cp-zrr-badge');
    badge.textContent = '🚫';
    zeroTile.appendChild(badge);
    demoRow.appendChild(zeroTile);

    var oneTile = _el('div', 'cp-zrr-tile cp-zrr-tile--one');
    oneTile.textContent = '1';
    demoRow.appendChild(oneTile);

    wrap.appendChild(demoRow);
    area.appendChild(wrap);

    /* Swap animation: after 800ms, 0-tile moves out, 1-tile moves into slot */
    setTimeout(function () {
      if (_currentPageId !== page.id) return;
      if (typeof playFlipWhoosh === 'function') playFlipWhoosh();
      if (typeof anime !== 'undefined') {
        anime({ targets: zeroTile, translateX: 80, opacity: 0, duration: 380, easing: 'easeInBack' });
        anime({ targets: oneTile,  translateX: -80, duration: 0 });
        anime({
          targets: oneTile,
          translateX: 0,
          opacity: [0, 1],
          duration: 400,
          delay: 260,
          easing: 'easeOutBack',
          complete: function () {
            oneTile.classList.add('cp-zrr-tile--locked');
          }
        });
      } else {
        zeroTile.style.display = 'none';
        oneTile.classList.add('cp-zrr-tile--locked');
      }
    }, 800);

    var pid = _currentPageId;
    setTimeout(function () {
      if (_currentPageId !== pid) return;
      renderPage(page.next);
    }, page.autoDelay || 3500);
  }

  function _renderSmallestLockReveal(page, area) {
    var wrap = _el('div', 'cp-smallest-lock-reveal');
    wrap.dataset.pageId = page.id;

    var lbl = _el('p', 'cp-slr-label');
    lbl.textContent = page.label;
    wrap.appendChild(lbl);

    var num = _el('div', 'cp-slr-number');
    num.textContent = page.number;
    wrap.appendChild(num);

    var swapRow = _el('div', 'cp-slr-swap');
    var d1 = _el('span', 'cp-slr-digit-one');
    d1.textContent = '1';
    var arrow = _el('span', 'cp-slr-swap-arrow');
    arrow.textContent = '↔';
    var d0 = _el('span', 'cp-slr-digit-zero');
    d0.textContent = '0';
    swapRow.appendChild(d1);
    swapRow.appendChild(arrow);
    swapRow.appendChild(d0);
    wrap.appendChild(swapRow);

    area.appendChild(wrap);

    var pid = _currentPageId;
    setTimeout(function () {
      if (_currentPageId !== pid) return;
      renderPage(page.next);
    }, page.autoDelay || 4000);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 6.4 — flip-rule-card
  ══════════════════════════════════════════════════════ */

  function _renderFlipRuleCard(page, area) {
    var wrap = _el('div', 'cp-flip-rule-card');
    wrap.dataset.pageId = page.id;

    var title = _el('h1', 'cp-title');
    title.textContent = page.title;
    wrap.appendChild(title);

    var rulesRow = _el('div', 'cp-frc-rules');
    var ruleEls = [];
    page.rules.forEach(function (r) {
      var card = _el('div', 'cp-frc-rule');
      var icon = _el('div', 'cp-frc-rule__icon'); icon.textContent = r.icon;
      var lbl  = _el('div', 'cp-frc-rule__label'); lbl.textContent = r.label;
      var txt  = _el('div', 'cp-frc-rule__text');  txt.textContent = r.text;
      card.appendChild(icon); card.appendChild(lbl); card.appendChild(txt);
      rulesRow.appendChild(card);
      ruleEls.push(card);
    });
    wrap.appendChild(rulesRow);

    var isSwapped = false;
    function doSwap() {
      if (typeof anime === 'undefined') return;
      var dist = ruleEls[0].offsetWidth + 32;
      if (!isSwapped) {
        anime({ targets: ruleEls[0], translateX: dist,  duration: 400, easing: 'easeInOutBack' });
        anime({ targets: ruleEls[1], translateX: -dist, duration: 400, easing: 'easeInOutBack' });
      } else {
        anime({ targets: ruleEls[0], translateX: 0,     duration: 400, easing: 'easeInOutBack' });
        anime({ targets: ruleEls[1], translateX: 0,     duration: 400, easing: 'easeInOutBack' });
      }
      isSwapped = !isSwapped;
    }
    ruleEls.forEach(function (card) {
      card.addEventListener('click', doSwap);
      card.addEventListener('touchend', function (e) { e.preventDefault(); doSwap(); });
    });

    var btn = _el('button', 'cp-btn-primary');
    btn.textContent = page.primaryAction.label;
    btn.style.opacity = '0';
    btn.addEventListener('click', function () { renderPage(page.primaryAction.next); });
    wrap.appendChild(btn);

    area.appendChild(wrap);
  }

  /* ══════════════════════════════════════════════════════
     Shared builders
  ══════════════════════════════════════════════════════ */

  function _buildNumberPair(numbers, compact) {
    var pair = _el('div', 'cp-number-pair' + (compact ? ' cp-number-pair--compact' : ''));
    numbers.forEach(function (num) {
      var card = _el('div', 'cp-num-card');

      var lbl = _el('span', 'cp-num-card__label');
      lbl.textContent = num.label;
      card.appendChild(lbl);

      var val = _el('span', 'cp-num-card__value');
      val.textContent = num.value;
      card.appendChild(val);

      var note = _el('p', 'cp-num-card__note');
      note.textContent = num.note;
      card.appendChild(note);

      pair.appendChild(card);
    });
    return pair;
  }

  function _buildPlaceGrid(grid, focusColIdx, interactive) {
    var outer = _el('div', 'cp-place-grid' + (interactive ? '' : ' cp-place-grid--frozen'));
    outer.setAttribute('aria-label', grid.ariaLabel);

    /* Header shown only in interactive mode */
    if (interactive) {
      var header  = _el('div', 'cp-grid__header');
      var titleRow = _el('div', 'cp-grid__title-row');

      var titleEl = _el('span', 'cp-grid__title');
      titleEl.textContent = grid.title;
      titleRow.appendChild(titleEl);

      if (grid.chip) {
        var chip = _el('span', 'cp-grid__chip');
        chip.textContent = grid.chip;
        titleRow.appendChild(chip);
      }
      header.appendChild(titleRow);

      if (grid.meta) {
        var meta = _el('p', 'cp-grid__meta');
        meta.textContent = grid.meta;
        header.appendChild(meta);
      }
      outer.appendChild(header);
    }

    /* Grid table */
    var table = _el('div', 'cp-grid__table');

    /* Column headers */
    grid.columns.forEach(function (col, colIdx) {
      var isFocus = (colIdx === focusColIdx);
      var cls = 'cp-grid__cell cp-grid__cell--header' + (isFocus ? ' cp-grid__cell--focus' : '');
      var cell = _el('div', cls);
      cell.textContent = col;
      cell.dataset.col = String(colIdx);
      cell.setAttribute('role', 'columnheader');
      if (interactive) {
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('aria-label', col + ' column – tap to select');
      }
      table.appendChild(cell);
    });

    /* Data rows */
    grid.rows.forEach(function (row, rowIdx) {
      row.digits.forEach(function (digit, colIdx) {
        var isFocus = (colIdx === focusColIdx);
        var cell = _el('div', 'cp-grid__cell' + (isFocus ? ' cp-grid__cell--focus' : ''));
        cell.textContent = digit;
        cell.dataset.col = String(colIdx);
        cell.dataset.row = String(rowIdx);
        table.appendChild(cell);
      });
    });

    outer.appendChild(table);
    return outer;
  }

  function _buildRevealCard(page) {
    var isWinner = (page.label === 'Winner');
    var card = _el('div', 'cp-reveal-card' + (isWinner ? ' cp-reveal-card--winner' : ''));

    var lbl = _el('span', 'cp-reveal-card__label');
    lbl.textContent = page.label;
    card.appendChild(lbl);

    var ttl = _el('p', 'cp-reveal-card__title');
    ttl.textContent = page.title;
    card.appendChild(ttl);

    var copy = _el('p', 'cp-reveal-card__copy');
    copy.textContent = page.copy;
    card.appendChild(copy);

    return card;
  }

  /* ══════════════════════════════════════════════════════
     Grid column-tap interaction (page 2.0 only)
  ══════════════════════════════════════════════════════ */

  function _attachGridInteraction(table, focusColIdx, onCorrect, onWrong) {
    var headers  = table.querySelectorAll('.cp-grid__cell--header');
    var answered = false;

    function setColClass(colIdx, cls) {
      var cells = table.querySelectorAll('[data-col="' + colIdx + '"]');
      cells.forEach(function (c) {
        c.classList.remove('cp-grid__cell--correct', 'cp-grid__cell--wrong');
        if (cls) c.classList.add('cp-grid__cell--' + cls);
      });
    }

    headers.forEach(function (header) {
      function onTap() {
        if (answered) return;
        var idx = parseInt(header.dataset.col, 10);
        if (idx === focusColIdx) {
          answered = true;
          setColClass(idx, 'correct');
          onCorrect();
        } else {
          setColClass(idx, 'wrong');
          setTimeout(function () { setColClass(idx, null); }, 800);
          onWrong();
        }
      }
      header.addEventListener('click', onTap);
      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(); }
      });
    });
  }

  /* ── Helpers ────────────────────────────────────────── */

  function _showFeedback(text, isWrong) {
    var overlay = document.getElementById('feedback-overlay');
    var toast   = document.getElementById('feedback-toast');
    var gif     = document.getElementById('feedback-char-gif');
    if (!overlay || !toast) return;

    if (isWrong) {
      toast.className   = 'feedback-toast feedback-toast--wrong';
      toast.textContent = text;
      if (gif) { gif.src = 'assets/GIFs/incorrect.gif'; gif.alt = 'Incorrect'; gif.className = 'feedback-char-gif'; }
      if (typeof playWrong   === 'function') playWrong();
    } else {
      toast.className   = 'feedback-toast';
      toast.textContent = text;
      if (gif) { gif.src = 'assets/GIFs/correct.gif'; gif.alt = 'Correct'; gif.className = 'feedback-char-gif feedback-char-gif--correct'; }
      if (typeof playCorrect === 'function') playCorrect();
    }
    overlay.hidden = false;
  }

  function _hideFeedback() {
    var overlay = document.getElementById('feedback-overlay');
    var toast   = document.getElementById('feedback-toast');
    var gif     = document.getElementById('feedback-char-gif');
    if (!overlay) return;
    overlay.hidden = true;
    if (toast) { toast.textContent = ''; toast.className = 'feedback-toast'; }
    if (gif)   { gif.src = ''; gif.alt = ''; }
  }

  function _getLayerRevealSiblings(parentId) {
    var siblings = [];
    for (var i = 0; i < CONTENT_PAGES.length; i++) {
      var p = CONTENT_PAGES[i];
      if (p.parent === parentId && p.type === 'layer-reveal' && p.revealIndex >= 2) {
        siblings.push(p);
      }
    }
    siblings.sort(function (a, b) { return a.revealIndex - b.revealIndex; });
    return siblings;
  }

  function _findTerminusNext(parentId) {
    var sibs = _getLayerRevealSiblings(parentId);
    return sibs.length ? sibs[sibs.length - 1].next : null;
  }

  /* ══════════════════════════════════════════════════════
     SECTION 9 — Rapid Round (9.0 / 9.1 / 9.2)
  ══════════════════════════════════════════════════════ */

  function _renderRapidRound(page, area) {
    if (!_s9FromFeedback) _s9Round = 0;
    _s9FromFeedback = false;
    var guardId = _currentPageId;

    var wrap = _el('div', 'cp-rr-wrap');
    wrap.dataset.pageId = page.id;

    /* Header */
    var header = _el('div', 'cp-rr-header');
    var titleEl = _el('span', 'cp-rr-title');
    titleEl.textContent = page.title;

    var counterEl = _el('span', 'cp-rr-counter');
    counterEl.textContent = (_s9Round + 1) + ' / ' + page.rounds.length;

    var starsEl = _el('div', 'cp-rr-stars');
    for (var s = 0; s < page.rounds.length; s++) {
      var starSpan = _el('span', 'cp-rr-star' + (s < _s9Round ? ' cp-rr-star--filled' : ''));
      starSpan.textContent = '★';
      starsEl.appendChild(starSpan);
    }
    header.appendChild(titleEl);
    header.appendChild(counterEl);
    header.appendChild(starsEl);
    wrap.appendChild(header);

    /* Round label */
    var round = page.rounds[_s9Round];
    var labelEl = _el('div', 'cp-rr-label');
    labelEl.textContent = round.label;
    wrap.appendChild(labelEl);

    /* Activity area */
    var activityEl = _el('div', 'cp-rr-activity');
    wrap.appendChild(activityEl);
    area.appendChild(wrap);

    /* Round-complete callback */
    function onRoundComplete() {
      if (_currentPageId !== guardId) return;
      if (typeof playComplete === 'function') playComplete();
      _s9Round++;
      if (_s9Round >= page.rounds.length) {
        renderPage('9.2');
      } else {
        _s9FromFeedback = true;
        renderPage(page.next);
      }
    }

    if (round.type === 'digit-place') {
      _renderRR_DigitPlace(round, activityEl, guardId, onRoundComplete);
    } else if (round.type === 'drag-sort') {
      _renderRR_DragSort(round, activityEl, guardId, onRoundComplete);
    }
  }

  function _renderRR_DigitPlace(round, activityEl, guardId, onComplete) {
    var placedCount  = 0;
    var draggedDigit = null;
    var tileRegistry = {};

    var tilesRow = _el('div', 'cp-rr-tiles');
    round.digits.forEach(function (d) {
      var placeholder = _el('div', 'cp-rr-tile-placeholder');
      var tile = _el('div', 'cp-rr-tile');
      tile.setAttribute('draggable', 'true');
      tile.dataset.digit = d;
      tile.textContent = d;
      placeholder.appendChild(tile);
      tilesRow.appendChild(placeholder);
      tileRegistry[d] = { el: tile, originContainer: placeholder };
    });

    var slotsRow = _el('div', 'cp-rr-slots');
    var slotEls = [];
    round.columns.forEach(function (col, idx) {
      var slot = _el('div', 'cp-rr-slot');
      slot.dataset.slotIdx = idx;
      slot.dataset.column  = col;
      var lbl = _el('span', 'cp-rr-slot__label');
      lbl.textContent = col;
      slot.appendChild(lbl);
      slotsRow.appendChild(slot);
      slotEls.push(slot);
    });

    activityEl.appendChild(tilesRow);
    activityEl.appendChild(slotsRow);
    slotEls[0].classList.add('cp-rr-slot--active');

    function _showZeroTrap(slotEl) {
      var popup = _el('div', 'cp-zero-trap-popup');
      popup.textContent = "Smallest 6-digit number cannot start with 0";
      slotEl.appendChild(popup);
      setTimeout(function () {
        popup.classList.add('cp-zero-trap-popup--exit');
        setTimeout(function () {
          if (popup.parentNode) popup.parentNode.removeChild(popup);
        }, 300);
      }, 1200);
    }

    function _handleDrop(digit, slotEl) {
      var slotIdx = parseInt(slotEl.dataset.slotIdx, 10);
      if (slotIdx !== placedCount) return;
      if (slotEl.classList.contains('cp-rr-slot--locked')) return;
      var reg  = tileRegistry[digit];
      var tile = reg ? reg.el : null;
      if (!tile) return;
      var correctDigit = round.correctOrder[placedCount];

      if (digit === correctDigit) {
        slotEl.classList.remove('cp-rr-slot--active');
        slotEl.classList.add('cp-rr-slot--locked', 'cp-rr-slot--correct-pulse');
        tile.classList.add('cp-rr-tile--locked', 'cp-rr-tile--bounce');
        tile.style.animation = '';
        slotEl.appendChild(tile);
        if (typeof playCorrect === 'function') playCorrect();
        setTimeout(function () { slotEl.classList.remove('cp-rr-slot--correct-pulse'); }, 600);
        placedCount++;
        if (placedCount < slotEls.length) slotEls[placedCount].classList.add('cp-rr-slot--active');
        if (placedCount === round.digits.length) {
          setTimeout(function () {
            if (_currentPageId !== guardId) return;
            onComplete();
          }, 500);
        }
      } else {
        if (round.hasZeroTrap && digit === '0' && slotIdx === 0) {
          tile.classList.add('cp-rr-tile--wrong');
          if (typeof playWrong === 'function') playWrong();
          _showZeroTrap(slotEl);
        } else {
          tile.classList.add('cp-rr-tile--wrong');
          if (typeof playWrong === 'function') playWrong();
          var hintTile = tileRegistry[correctDigit] ? tileRegistry[correctDigit].el : null;
          if (hintTile && !hintTile.classList.contains('cp-rr-tile--locked')) {
            hintTile.classList.add('cp-rr-tile--hint');
            if (typeof playHintShimmer === 'function') playHintShimmer();
            setTimeout(function () { hintTile.classList.remove('cp-rr-tile--hint'); }, 1000);
          }
        }
        setTimeout(function () {
          if (_currentPageId !== guardId) return;
          tile.classList.remove('cp-rr-tile--wrong');
          if (reg.originContainer && !tile.classList.contains('cp-rr-tile--locked')) {
            reg.originContainer.appendChild(tile);
          }
        }, 600);
      }
    }

    /* HTML5 drag */
    Object.keys(tileRegistry).forEach(function (d) {
      var tile = tileRegistry[d].el;
      tile.addEventListener('dragstart', function (e) {
        if (tile.classList.contains('cp-rr-tile--locked')) { e.preventDefault(); return; }
        draggedDigit = d;
        tile.classList.add('cp-rr-tile--dragging');
        e.dataTransfer.setData('text/plain', d);
        e.dataTransfer.effectAllowed = 'move';
        if (typeof playTick === 'function') playTick();
      });
      tile.addEventListener('dragend', function () {
        tile.classList.remove('cp-rr-tile--dragging');
      });
    });

    slotEls.forEach(function (slot) {
      slot.addEventListener('dragover', function (e) {
        e.preventDefault();
        var idx = parseInt(slot.dataset.slotIdx, 10);
        if (idx === placedCount) slot.classList.add('cp-rr-slot--hover');
      });
      slot.addEventListener('dragleave', function () {
        slot.classList.remove('cp-rr-slot--hover');
      });
      slot.addEventListener('drop', function (e) {
        e.preventDefault();
        slot.classList.remove('cp-rr-slot--hover');
        if (draggedDigit) _handleDrop(draggedDigit, slot);
      });
    });

    /* Touch drag */
    Object.keys(tileRegistry).forEach(function (d) {
      var tile      = tileRegistry[d].el;
      var ghost     = null;
      var tOffX     = 0;
      var tOffY     = 0;
      var activeSlot = null;

      tile.addEventListener('touchstart', function (e) {
        if (tile.classList.contains('cp-rr-tile--locked')) return;
        e.preventDefault();
        var touch = e.touches[0];
        var rect  = tile.getBoundingClientRect();
        tOffX = touch.clientX - rect.left;
        tOffY = touch.clientY - rect.top;
        ghost = tile.cloneNode(true);
        ghost.classList.add('cp-rr-tile--ghost');
        ghost.classList.remove('cp-rr-tile--locked','cp-rr-tile--bounce',
                               'cp-rr-tile--wrong','cp-rr-tile--hint');
        ghost.style.width  = rect.width  + 'px';
        ghost.style.height = rect.height + 'px';
        ghost.style.left   = (touch.clientX - tOffX) + 'px';
        ghost.style.top    = (touch.clientY - tOffY) + 'px';
        document.body.appendChild(ghost);
        if (typeof playTick === 'function') playTick();
      }, { passive: false });

      tile.addEventListener('touchmove', function (e) {
        if (!ghost) return;
        e.preventDefault();
        var touch = e.touches[0];
        ghost.style.left = (touch.clientX - tOffX) + 'px';
        ghost.style.top  = (touch.clientY - tOffY) + 'px';
        ghost.style.display = 'none';
        var el = document.elementFromPoint(touch.clientX, touch.clientY);
        ghost.style.display = '';
        var found = el ? el.closest('.cp-rr-slot') : null;
        if (activeSlot && activeSlot !== found) activeSlot.classList.remove('cp-rr-slot--hover');
        activeSlot = found;
        if (found) {
          var idx = parseInt(found.dataset.slotIdx, 10);
          if (idx === placedCount) found.classList.add('cp-rr-slot--hover');
        }
      }, { passive: false });

      tile.addEventListener('touchend', function (e) {
        if (!ghost) return;
        e.preventDefault();
        var touch = e.changedTouches[0];
        ghost.style.display = 'none';
        var el = document.elementFromPoint(touch.clientX, touch.clientY);
        ghost.style.display = '';
        document.body.removeChild(ghost);
        ghost = null;
        if (activeSlot) { activeSlot.classList.remove('cp-rr-slot--hover'); activeSlot = null; }
        var target = el ? el.closest('.cp-rr-slot') : null;
        if (target) _handleDrop(d, target);
      }, { passive: false });
    });
  }

  function _renderRR_DragSort(round, activityEl, guardId, onComplete) {
    var placedCount  = 0;
    var draggedId    = null;
    var tileRegistry = {};

    var tilesRow = _el('div', 'cp-rr-tiles');
    round.tiles.forEach(function (tileData) {
      var placeholder = _el('div', 'cp-rr-tile-placeholder');
      var tile = _el('div', 'cp-rr-tile cp-rr-tile--number');
      tile.setAttribute('draggable', 'true');
      tile.dataset.tileId = tileData.id;
      tile.textContent = tileData.display;
      placeholder.appendChild(tile);
      tilesRow.appendChild(placeholder);
      tileRegistry[tileData.id] = { el: tile, originContainer: placeholder };
    });

    var slotsRow = _el('div', 'cp-rr-slots');
    var slotEls  = [];
    round.slots.forEach(function (slotData, i) {
      var slot = _el('div', 'cp-rr-slot');
      slot.dataset.slotIdx       = i;
      slot.dataset.correctTileId = slotData.correctTileId;
      var lbl = _el('span', 'cp-rr-slot__label');
      lbl.textContent = slotData.label;
      slot.appendChild(lbl);
      slotsRow.appendChild(slot);
      slotEls.push(slot);
    });

    activityEl.appendChild(tilesRow);
    activityEl.appendChild(slotsRow);
    slotEls[0].classList.add('cp-rr-slot--active');

    function _handleDrop(tileId, slot) {
      var slotIdx = parseInt(slot.dataset.slotIdx, 10);
      if (slotIdx !== placedCount) return;
      if (slot.classList.contains('cp-rr-slot--locked')) return;
      var reg  = tileRegistry[tileId];
      if (!reg) return;
      var tile = reg.el;

      if (slot.dataset.correctTileId === tileId) {
        slot.classList.remove('cp-rr-slot--active');
        slot.classList.add('cp-rr-slot--locked', 'cp-rr-slot--correct-pulse');
        tile.classList.add('cp-rr-tile--locked', 'cp-rr-tile--bounce');
        tile.style.animation = '';
        slot.appendChild(tile);
        if (typeof playCorrect === 'function') playCorrect();
        setTimeout(function () { slot.classList.remove('cp-rr-slot--correct-pulse'); }, 600);
        placedCount++;
        if (placedCount < slotEls.length) slotEls[placedCount].classList.add('cp-rr-slot--active');
        if (placedCount === round.slots.length) {
          setTimeout(function () {
            if (_currentPageId !== guardId) return;
            onComplete();
          }, 500);
        }
      } else {
        tile.classList.add('cp-rr-tile--wrong');
        if (typeof playWrong === 'function') playWrong();
        setTimeout(function () {
          if (_currentPageId !== guardId) return;
          tile.classList.remove('cp-rr-tile--wrong');
          if (reg.originContainer && !tile.classList.contains('cp-rr-tile--locked')) {
            reg.originContainer.appendChild(tile);
          }
        }, 600);
      }
    }

    /* HTML5 drag */
    round.tiles.forEach(function (tileData) {
      var tile = tileRegistry[tileData.id].el;
      tile.addEventListener('dragstart', function (e) {
        if (tile.classList.contains('cp-rr-tile--locked')) { e.preventDefault(); return; }
        draggedId = tileData.id;
        tile.classList.add('cp-rr-tile--dragging');
        e.dataTransfer.setData('text/plain', tileData.id);
        e.dataTransfer.effectAllowed = 'move';
        if (typeof playTick === 'function') playTick();
      });
      tile.addEventListener('dragend', function () {
        tile.classList.remove('cp-rr-tile--dragging');
      });
    });

    slotEls.forEach(function (slot) {
      slot.addEventListener('dragover', function (e) {
        if (slot.classList.contains('cp-rr-slot--locked')) return;
        var idx = parseInt(slot.dataset.slotIdx, 10);
        if (idx !== placedCount) return;
        e.preventDefault();
        slot.classList.add('cp-rr-slot--hover');
      });
      slot.addEventListener('dragleave', function () {
        slot.classList.remove('cp-rr-slot--hover');
      });
      slot.addEventListener('drop', function (e) {
        e.preventDefault();
        slot.classList.remove('cp-rr-slot--hover');
        var id = e.dataTransfer.getData('text/plain') || draggedId;
        if (id) _handleDrop(id, slot);
      });
    });

    /* Touch drag */
    round.tiles.forEach(function (tileData) {
      var tile      = tileRegistry[tileData.id].el;
      var ghost     = null;
      var tOffX     = 0;
      var tOffY     = 0;
      var activeSlot = null;

      tile.addEventListener('touchstart', function (e) {
        if (tile.classList.contains('cp-rr-tile--locked')) return;
        e.preventDefault();
        var touch = e.touches[0];
        var rect  = tile.getBoundingClientRect();
        tOffX = touch.clientX - rect.left;
        tOffY = touch.clientY - rect.top;
        draggedId = tileData.id;
        ghost = tile.cloneNode(true);
        ghost.classList.add('cp-rr-tile--ghost');
        ghost.classList.remove('cp-rr-tile--locked','cp-rr-tile--bounce',
                               'cp-rr-tile--wrong','cp-rr-tile--number');
        ghost.style.width  = rect.width  + 'px';
        ghost.style.height = rect.height + 'px';
        ghost.style.left   = (touch.clientX - tOffX) + 'px';
        ghost.style.top    = (touch.clientY - tOffY) + 'px';
        document.body.appendChild(ghost);
        tile.classList.add('cp-rr-tile--dragging');
        if (typeof playTick === 'function') playTick();
      }, { passive: false });

      tile.addEventListener('touchmove', function (e) {
        if (!ghost) return;
        e.preventDefault();
        var touch = e.touches[0];
        ghost.style.left = (touch.clientX - tOffX) + 'px';
        ghost.style.top  = (touch.clientY - tOffY) + 'px';
        ghost.style.display = 'none';
        var el = document.elementFromPoint(touch.clientX, touch.clientY);
        ghost.style.display = '';
        var found = el ? el.closest('.cp-rr-slot') : null;
        if (activeSlot && activeSlot !== found) activeSlot.classList.remove('cp-rr-slot--hover');
        activeSlot = found;
        if (found && !found.classList.contains('cp-rr-slot--locked')) {
          var idx = parseInt(found.dataset.slotIdx, 10);
          if (idx === placedCount) found.classList.add('cp-rr-slot--hover');
        }
      }, { passive: false });

      tile.addEventListener('touchend', function (e) {
        if (!ghost) return;
        e.preventDefault();
        var touch = e.changedTouches[0];
        ghost.style.display = 'none';
        var el = document.elementFromPoint(touch.clientX, touch.clientY);
        ghost.style.display = '';
        document.body.removeChild(ghost);
        ghost = null;
        tile.classList.remove('cp-rr-tile--dragging');
        if (activeSlot) { activeSlot.classList.remove('cp-rr-slot--hover'); activeSlot = null; }
        var target = el ? el.closest('.cp-rr-slot') : null;
        if (target) _handleDrop(tileData.id, target);
      }, { passive: false });
    });
  }

  function _renderRoundFeedback(page, area) {
    var wrap = _el('div', 'cp-rf-wrap');
    wrap.dataset.pageId = page.id;

    var banner = _el('div', 'cp-rf-banner');
    banner.textContent = 'Round ' + _s9Round + ' ✓';
    wrap.appendChild(banner);

    var star = _el('div', 'cp-rf-star');
    star.textContent = '★';
    wrap.appendChild(star);

    area.appendChild(wrap);
    if (typeof playTick === 'function') playTick();

    var guardId = _currentPageId;
    setTimeout(function () {
      if (_currentPageId !== guardId) return;
      _s9FromFeedback = true;
      renderPage('9.0');
    }, 1000);
  }

  function _renderLevelComplete(page, area) {
    var wrap = _el('div', 'cp-lc-wrap');
    wrap.dataset.pageId = page.id;

    var starsEl = _el('div', 'cp-lc-stars');
    for (var i = 0; i < 3; i++) {
      var s = _el('span', 'cp-lc-star');
      s.textContent = '★';
      starsEl.appendChild(s);
    }
    wrap.appendChild(starsEl);

    var badge = _el('div', 'cp-lc-badge');
    badge.textContent = 'Level Cleared!';
    wrap.appendChild(badge);

    /* Confetti */
    var confettiEl = _el('div', 'cp-lc-confetti');
    wrap.appendChild(confettiEl);
    area.appendChild(wrap);

    var colors = ['#F59E0B','#22C55E','#3B82F6','#EF4444','#A855F7','#EC4899'];
    var pieces = [];
    for (var j = 0; j < 30; j++) {
      var piece = _el('div', 'cp-lc-piece');
      piece.style.left       = (Math.random() * 100) + '%';
      piece.style.top        = '-12px';
      piece.style.background = colors[j % colors.length];
      if (j % 3 === 0) { piece.style.borderRadius = '2px'; piece.style.width = '8px'; piece.style.height = '14px'; }
      confettiEl.appendChild(piece);
      pieces.push(piece);
    }

    if (typeof anime !== 'undefined') {
      anime({
        targets: pieces,
        translateY: function () { return 400 + Math.random() * 220; },
        rotate:     function () { return Math.random() * 380 - 190; },
        opacity:    [1, 0],
        duration:   function () { return 1200 + Math.random() * 600; },
        delay:      anime.stagger(40),
        easing:     'easeOutCubic'
      });
    }

    if (typeof playFlipWhoosh === 'function') playFlipWhoosh();
    setTimeout(function () { if (typeof playComplete === 'function') playComplete(); }, 400);
    setTimeout(function () { if (typeof playComplete === 'function') playComplete(); }, 900);

    var guardId = _currentPageId;
    setTimeout(function () {
      if (_currentPageId !== guardId) return;
      renderPage(page.next);
    }, page.autoDelay);
  }

  /* ── Section 10.0 — Session Summary ───────────────── */
  function _renderSessionSummary(page, area) {
    var wrap = _el('div', 'cp-session-summary');
    wrap.dataset.pageId = page.id;

    var title = _el('h1', 'cp-title');
    title.textContent = page.title;
    wrap.appendChild(title);

    var cards = _el('div', 'cp-ss-cards');
    (page.rules || []).forEach(function (r) {
      var card = _el('div', 'cp-ss-card');
      var em   = _el('span', 'cp-ss-card__emoji');
      em.textContent = r.emoji;
      var body  = _el('div', 'cp-ss-card__body');
      var label = _el('div', 'cp-ss-card__label');
      label.textContent = r.label;
      var rule  = _el('div', 'cp-ss-card__rule');
      rule.textContent = r.rule;
      body.appendChild(label);
      body.appendChild(rule);
      card.appendChild(em);
      card.appendChild(body);
      cards.appendChild(card);
    });
    wrap.appendChild(cards);
    area.appendChild(wrap);

    var allCards = cards.querySelectorAll('.cp-ss-card');
    var guardId  = _currentPageId;
    allCards.forEach(function (card, i) {
      setTimeout(function () {
        if (_currentPageId !== guardId) return;
        card.classList.add('cp-ss-card--visible');
        if (typeof playFlipWhoosh === 'function') playFlipWhoosh();
      }, (i + 1) * 1000);
    });

    setTimeout(function () {
      if (_currentPageId !== guardId) return;
      renderPage(page.next);
    }, page.autoDelay);
  }

  /* ── Section 10.1 — Key Insight ───────────────────── */
  function _renderKeyInsight(page, area) {
    var wrap = _el('div', 'cp-key-insight');
    wrap.dataset.pageId = page.id;

    var textEl = _el('div', 'cp-ki-text');
    textEl.id  = 'cp-ki-text';
    var bulbEl = _el('div', 'cp-ki-bulb');
    bulbEl.id  = 'cp-ki-bulb';
    bulbEl.textContent = '💡';
    wrap.appendChild(textEl);
    wrap.appendChild(bulbEl);
    area.appendChild(wrap);

    var sentence = page.sentence || '';
    var chars    = sentence.split('');
    var idx      = 0;
    var guardId  = _currentPageId;

    var ticker = setInterval(function () {
      if (_currentPageId !== guardId) { clearInterval(ticker); return; }
      if (idx < chars.length) {
        textEl.textContent += chars[idx];
        idx++;
      } else {
        clearInterval(ticker);
        bulbEl.classList.add('cp-ki-bulb--visible');
        if (typeof playLightbulbDing === 'function') playLightbulbDing();
      }
    }, 40);

    setTimeout(function () {
      if (_currentPageId !== guardId) return;
      renderPage(page.next);
    }, page.autoDelay);
  }

  /* ── Section 10.2 — End Screen ────────────────────── */
  function _renderEndScreen(page, area) {
    var wrap = _el('div', 'cp-end-screen');
    wrap.dataset.pageId = page.id;

    var btns = _el('div', 'cp-es-buttons');

    var btnPractice = _el('button', 'cp-es-btn cp-es-btn--practice');
    btnPractice.textContent = '🔁 Practice Again';
    btnPractice.addEventListener('click', function () { renderPage('4.0'); });

    var btnHome = _el('button', 'cp-es-btn cp-es-btn--home');
    btnHome.textContent = '🏠 Home';
    btnHome.addEventListener('click', function () {
      try { window.parent.postMessage({ type: 'SESSION_COMPLETE' }, '*'); } catch (e) {}
    });

    btns.appendChild(btnPractice);
    btns.appendChild(btnHome);
    wrap.appendChild(btns);
    area.appendChild(wrap);

    if (typeof playOutroChime === 'function') playOutroChime();
  }

  /* ══════════════════════════════════════════════════════
     PAGE 3.0 — apply-rule (multi-question, no grid)
  ══════════════════════════════════════════════════════ */

  function _renderApplyRule(page, area) {
    var wrap = _el('div', 'cp-apply-rule');
    wrap.dataset.pageId = page.id;

    var heading = _el('h1', 'cp-title cp-ar-heading');
    heading.textContent = page.heading;
    wrap.appendChild(heading);

    var subtitle = _el('p', 'cp-ar-subtitle');
    subtitle.textContent = page.subtitle;
    wrap.appendChild(subtitle);

    var slideZone = _el('div', 'cp-ar-slide-zone');

    var counter = _el('div', 'cp-ar-counter');
    slideZone.appendChild(counter);

    var cardsRow = _el('div', 'cp-ar-cards');
    var cardAEl  = _el('div', 'cp-ar-card cp-ar-card--a');
    var vsEl     = _el('span', 'cp-vs');
    vsEl.textContent = 'vs';
    var cardBEl  = _el('div', 'cp-ar-card cp-ar-card--b');
    cardsRow.appendChild(cardAEl);
    cardsRow.appendChild(vsEl);
    cardsRow.appendChild(cardBEl);
    slideZone.appendChild(cardsRow);

    var optionsRow = _el('div', 'cp-ar-options');
    var optA = _el('button', 'cp-ar-option');
    optA.textContent = 'A is greater';
    var optB = _el('button', 'cp-ar-option');
    optB.textContent = 'B is greater';
    optionsRow.appendChild(optA);
    optionsRow.appendChild(optB);
    slideZone.appendChild(optionsRow);

    wrap.appendChild(slideZone);

    /* Feedback panel — always present at bottom, fills in after each tap */
    var feedbackEl = _el('div', 'cp-ar-feedback');
    feedbackEl.setAttribute('aria-live', 'polite');
    wrap.appendChild(feedbackEl);

    area.appendChild(wrap);

    var qIndex  = 0;
    var answered = false;

    function clearFeedback() {
      feedbackEl.className = 'cp-ar-feedback';
      feedbackEl.style.opacity = '0';
      while (feedbackEl.firstChild) feedbackEl.removeChild(feedbackEl.firstChild);
    }

    function showFeedback(isCorrect, q) {
      clearFeedback();
      feedbackEl.className = 'cp-ar-feedback ' +
        (isCorrect ? 'cp-ar-feedback--correct' : 'cp-ar-feedback--incorrect');

      var statusEl = _el('p', 'cp-ar-feedback__status');
      statusEl.textContent = isCorrect ? '✅ Correct!' : '❌ Not quite.';
      feedbackEl.appendChild(statusEl);

      var lines = (q.feedback && (isCorrect ? q.feedback.correct : q.feedback.incorrect)) || [];
      lines.forEach(function (line) {
        var p = _el('p', 'cp-ar-feedback__line');
        p.textContent = line;
        feedbackEl.appendChild(p);
      });

      if (typeof anime !== 'undefined') {
        anime.set(feedbackEl, { opacity: 0, translateY: 6 });
        anime({ targets: feedbackEl, opacity: 1, translateY: 0, duration: 300, easing: 'easeOutQuad' });
      }
    }

    function advanceAfterFeedback() {
      if (_currentPageId !== page.id) return;
      qIndex++;
      var doSlide = function () {
        if (qIndex < page.questions.length) {
          if (typeof anime !== 'undefined') {
            anime({ targets: slideZone, opacity: 0, translateX: -80, duration: 350, easing: 'easeInQuad',
              complete: function () { loadQuestion(qIndex, true); }
            });
          } else {
            loadQuestion(qIndex, true);
          }
        } else {
          renderPage(page.next);
        }
      };
      if (typeof anime !== 'undefined') {
        anime({ targets: feedbackEl, opacity: 0, duration: 200, easing: 'easeInQuad',
          complete: doSlide });
      } else {
        doSlide();
      }
    }

    function loadQuestion(idx, isTransition) {
      var q = page.questions[idx];
      answered = false;
      optA.disabled = false;
      optB.disabled = false;
      counter.textContent = q.label;
      cardAEl.textContent = q.cardA;
      cardBEl.textContent = q.cardB;

      clearFeedback();

      if (isTransition) {
        cardAEl.className = 'cp-ar-card cp-ar-card--a';
        cardBEl.className = 'cp-ar-card cp-ar-card--b';
        optA.className    = 'cp-ar-option';
        optB.className    = 'cp-ar-option';
        if (typeof anime !== 'undefined') {
          anime.set(slideZone, { opacity: 0, translateX: 80 });
          anime({ targets: slideZone, opacity: 1, translateX: 0, duration: 400, easing: 'easeOutBack' });
        }
      }
    }

    function onTap(chosen) {
      if (answered) return;
      answered = true;
      optA.disabled = true;
      optB.disabled = true;

      var q = page.questions[qIndex];
      var isCorrect = chosen === q.answer;
      var tappedOpt = chosen === 'A' ? optA : optB;
      var winCard   = q.answer === 'A' ? cardAEl : cardBEl;

      if (isCorrect) {
        tappedOpt.classList.add('cp-ar-option--correct');
        winCard.classList.add('cp-ar-card--winner');
        if (typeof playCorrect === 'function') playCorrect();
      } else {
        tappedOpt.classList.add('cp-ar-option--wrong');
        winCard.classList.add('cp-ar-card--winner');
        if (typeof playWrong === 'function') playWrong();
      }

      showFeedback(isCorrect, q);
      setTimeout(advanceAfterFeedback, 4000);
    }

    optA.addEventListener('click', function () { onTap('A'); });
    optB.addEventListener('click', function () { onTap('B'); });

    loadQuestion(0, false);
  }

  function _showApplyRuleSuccess(wrap, slideZone, page, extras) {
    function buildCard() {
      (extras || []).forEach(function (el) { if (el) el.style.display = 'none'; });
      wrap.classList.add('cp-apply-rule--success');

      var card = _el('div', 'cp-ar-success');
      var icon = _el('div', 'cp-ar-success__icon');
      icon.textContent = page.successIcon || '🎉';
      var title = _el('div', 'cp-ar-success__title');
      title.textContent = page.successTitle || "You've got the rule!";
      card.appendChild(icon);
      card.appendChild(title);

      var ruleLines = page.successLines || [
        'Start from the leftmost digit.',
        'Move right until digits differ.',
        'The number with the GREATER digit at that position is larger.'
      ];
      var ruleBlock = _el('div', 'cp-ar-success__rule');
      ruleLines.forEach(function (line) {
        var p = _el('p', 'cp-ar-success__rule-line');
        p.textContent = line;
        ruleBlock.appendChild(p);
      });
      card.appendChild(ruleBlock);
      wrap.appendChild(card);

      if (typeof launchConfetti === 'function') launchConfetti();

      var btn = _el('button', 'cp-btn-primary cp-ar-continue');
      btn.textContent = page.continueLabel || 'Continue →';
      btn.style.opacity = '0';
      var _advanced = false;
      function goNext() { if (_advanced) return; _advanced = true; renderPage(page.next); }
      btn.addEventListener('click', goNext);
      wrap.appendChild(btn);

      if (typeof anime !== 'undefined') {
        anime.set(card, { opacity: 0, scale: 0.85 });
        anime({ targets: card, opacity: 1, scale: 1, duration: 480, easing: 'easeOutBack' });
        setTimeout(function () {
          anime({ targets: btn, opacity: 1, duration: 300, easing: 'easeOutQuad',
            complete: function () { btn.classList.add('cp-ar-continue--pulse'); }
          });
          setTimeout(goNext, 3000);
        }, 1200);
      } else {
        card.style.opacity = '1';
        btn.style.opacity  = '1';
        setTimeout(goNext, 4000);
      }
    }

    if (typeof anime !== 'undefined') {
      anime({ targets: slideZone, opacity: 0, scale: 0.96, duration: 280, easing: 'easeInQuad',
        complete: function () { slideZone.style.display = 'none'; buildCard(); }
      });
    } else {
      slideZone.style.display = 'none';
      buildCard();
    }
  }

  /* ══════════════════════════════════════════════════════
     PAGE 4.0 — apply-real-life (story → choose → reveal)
  ══════════════════════════════════════════════════════ */

  function _renderApplyRealLife(page, area) {
    var wrap = _el('div', 'cp-arl');
    wrap.dataset.pageId = page.id;
    var guardId = _currentPageId;
    var answered = false;

    /* Heading */
    var heading = _el('h1', 'cp-title cp-arl-heading');
    heading.textContent = page.heading;
    wrap.appendChild(heading);

    /* Subtitle */
    var subtitle = _el('p', 'cp-arl-subtitle');
    subtitle.textContent = page.subtitle;
    wrap.appendChild(subtitle);

    /* Story card — key numbers highlighted via DOM (no innerHTML) */
    var storyCard = _el('div', 'cp-arl-story');
    var storyP = _el('p', 'cp-arl-story-text');
    var segments = [page.storyText || ''];
    (page.keyNumbers || []).forEach(function (kn) {
      var next = [];
      segments.forEach(function (seg) {
        if (typeof seg === 'string') {
          var parts = seg.split(kn);
          parts.forEach(function (part, i) {
            if (i > 0) {
              var span = _el('span', 'cp-arl-story-highlight');
              span.textContent = kn;
              next.push(span);
            }
            if (part) next.push(part);
          });
        } else {
          next.push(seg);
        }
      });
      segments = next;
    });
    segments.forEach(function (seg) {
      storyP.appendChild(typeof seg === 'string' ? document.createTextNode(seg) : seg);
    });
    storyCard.appendChild(storyP);
    if (page.animation === 'section60Entrance' || page.trophyIcon) {
      var trophyEl = _el('span', 'cp-arl-trophy');
      trophyEl.textContent = '🏆';
      trophyEl.setAttribute('aria-hidden', 'true');
      storyCard.appendChild(trophyEl);
    }
    wrap.appendChild(storyCard);

    /* Question */
    var questionEl = _el('p', 'cp-arl-question');
    questionEl.textContent = page.question;
    wrap.appendChild(questionEl);

    /* Options */
    var optionsRow = _el('div', 'cp-arl-options');
    wrap.appendChild(optionsRow);

    /* Hint — no min-height; appears/disappears without reserving space */
    var hintEl = _el('div', 'cp-arl-hint');
    hintEl.setAttribute('aria-live', 'polite');
    wrap.appendChild(hintEl);

    /* Result card — pre-built, hidden until correct answer */
    var resultCard = _el('div', 'cp-arl-result');
    resultCard.setAttribute('aria-live', 'polite');
    resultCard.style.display = 'none';
    (page.resultLines || []).forEach(function (line) {
      var p = _el('p', 'cp-arl-result-line');
      p.textContent = line;
      resultCard.appendChild(p);
    });
    wrap.appendChild(resultCard);

    /* Continue button — pre-built, hidden until correct answer */
    var continueBtn = _el('button', 'cp-btn-primary cp-arl-continue');
    continueBtn.textContent = 'Continue';
    continueBtn.style.display = 'none';
    continueBtn.addEventListener('click', function () { renderPage(page.next); });
    wrap.appendChild(continueBtn);

    area.appendChild(wrap);

    /* Option buttons — built last so they can close over the pre-built elements */
    (page.options || []).forEach(function (optText, idx) {
      var btn = _el('button', 'cp-arl-option');
      btn.textContent = optText;

      btn.addEventListener('click', function () {
        if (answered) return;

        if (idx === page.correctIndex) {
          answered = true;
          btn.classList.add('cp-arl-option--correct');
          var badge = _el('span', 'cp-arl-check-badge');
          badge.textContent = '✓';
          btn.appendChild(badge);
          if (typeof playCorrect === 'function') playCorrect();

          /* Reveal result card */
          setTimeout(function () {
            if (_currentPageId !== guardId) return;
            resultCard.style.display = '';
            if (typeof anime !== 'undefined') {
              anime.set(resultCard, { opacity: 0, translateY: 12 });
              anime({ targets: resultCard, opacity: 1, translateY: 0, duration: 400, easing: 'easeOutBack' });
            }
          }, 600);

          /* Reveal continue button */
          setTimeout(function () {
            if (_currentPageId !== guardId) return;
            continueBtn.style.display = '';
            if (typeof anime !== 'undefined') {
              anime.set(continueBtn, { opacity: 0 });
              anime({ targets: continueBtn, opacity: 1, duration: 320, easing: 'easeOutQuad',
                complete: function () { continueBtn.classList.add('cp-arl-continue--pulse'); }
              });
            } else {
              continueBtn.style.opacity = '1';
            }
            if (typeof launchConfetti === 'function') launchConfetti();
          }, 1400);

        } else {
          btn.classList.add('cp-arl-option--wrong');
          hintEl.textContent = page.wrongHint || 'Check from the left';
          if (typeof anime !== 'undefined') {
            anime.set(hintEl, { opacity: 0 });
            anime({ targets: hintEl, opacity: 1, duration: 200, easing: 'easeOutQuad' });
          } else {
            hintEl.style.opacity = '1';
          }
          if (typeof playWrong === 'function') playWrong();
          setTimeout(function () {
            btn.classList.remove('cp-arl-option--wrong');
            if (typeof anime !== 'undefined') {
              anime({ targets: hintEl, opacity: 0, duration: 250, easing: 'easeInQuad',
                complete: function () { hintEl.textContent = ''; }
              });
            } else {
              hintEl.style.opacity = '0';
              hintEl.textContent = '';
            }
          }, 800);
        }
      });

      optionsRow.appendChild(btn);
    });
  }

  /* ══════════════════════════════════════════════════════
     PAGE 5.0 — concept-intro (same rule, 7-digit numbers)
  ══════════════════════════════════════════════════════ */

  function _renderConceptIntro(page, area) {
    var wrap = _el('div', 'cp-ci-wrap');
    wrap.dataset.pageId = page.id;

    var topLabel = _el('h2', 'cp-title cp-arl-heading cp-ci-top-label');
    topLabel.textContent = page.topLabel || '';
    wrap.appendChild(topLabel);

    var headlineCard = _el('div', 'cp-ci-headline-card');
    var headline = _el('p', 'cp-ci-headline');
    headline.textContent = page.headline;
    headlineCard.appendChild(headline);
    wrap.appendChild(headlineCard);

    var exList = _el('div', 'cp-ci-ex-list');
    (page.examples || []).forEach(function (ex) {
      var row = _el('div', 'cp-ci-ex-row');
      var sizeLabel = _el('span', 'cp-ci-ex-size-label');
      sizeLabel.textContent = ex.sizeLabel;
      var arrow = _el('span', 'cp-ci-ex-arrow');
      arrow.textContent = '→';
      var nums = _el('span', 'cp-ci-ex-nums');
      nums.textContent = ex.numA + ' vs ' + ex.numB;
      row.appendChild(sizeLabel);
      row.appendChild(arrow);
      row.appendChild(nums);
      exList.appendChild(row);
    });
    wrap.appendChild(exList);

    var btn = _el('button', 'cp-btn-primary cp-ci-btn');
    btn.textContent = page.buttonLabel || 'Continue →';
    btn.addEventListener('click', function () { renderPage(page.next); });
    wrap.appendChild(btn);

    area.appendChild(wrap);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 2.0 — section-intro
  ══════════════════════════════════════════════════════ */

  function _renderSectionIntro(page, area) {
    var wrap = _el('div', 'cp-section-intro');
    wrap.dataset.pageId = page.id;

    var card = _el('div', 'cp-si-card');

    var iconEl = _el('div', 'cp-si-icon');
    iconEl.textContent = page.icon;
    iconEl.setAttribute('aria-hidden', 'true');
    card.appendChild(iconEl);

    var titleEl = _el('div', 'cp-si-title');
    titleEl.setAttribute('aria-live', 'polite');
    card.appendChild(titleEl);

    var subhintEl = _el('p', 'cp-si-subhint');
    subhintEl.textContent = page.subhint;
    card.appendChild(subhintEl);

    wrap.appendChild(card);
    area.appendChild(wrap);

    var loadFn = page.sfxLoad && typeof window[page.sfxLoad] === 'function'
      ? window[page.sfxLoad]
      : (typeof playIntroChime === 'function' ? playIntroChime : null);
    if (loadFn) loadFn();

    var chars = page.title.split('');
    var idx = 0;

    function typeNext() {
      if (_currentPageId !== page.id) return;
      if (idx < chars.length) {
        titleEl.textContent += chars[idx];
        idx++;
        if (typeof playTick === 'function') playTick();
        setTimeout(typeNext, 80);
      } else {
        subhintEl.classList.add('cp-si-subhint--visible');
        setTimeout(function () {
          if (_currentPageId !== page.id) return;
          if (page.sfxExit && typeof window[page.sfxExit] === 'function') {
            window[page.sfxExit]();
          }
          if (typeof anime !== 'undefined') {
            anime({
              targets: card,
              opacity: 0,
              scale: 0.92,
              duration: 500,
              easing: 'easeInBack',
              complete: function () {
                if (_currentPageId === page.id) renderPage(page.next);
              }
            });
          } else {
            renderPage(page.next);
          }
        }, page.autoDelay);
      }
    }

    setTimeout(typeNext, 900);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 2.1 — addition-lab
  ══════════════════════════════════════════════════════ */

  function _renderAdditionLab(page, area) {
    var wrap = _el('div', 'cp-addition-lab');
    wrap.dataset.pageId = page.id;

    /* ── Random number generation ─────────────────────────
       top  ∈ [1,00,000 – 69,99,999]  (100 000 – 6 999 999)
       bottom ∈ [1,00,000 – min(29,99,999, 99,99,999 − top)]
    ──────────────────────────────────────────────────────── */
    function _toIndianFormat(n) {
      var s = String(n);
      if (s.length <= 3) return s;
      var res = s.slice(-3);
      var rem = s.slice(0, -3);
      while (rem.length > 2) { res = rem.slice(-2) + ',' + res; rem = rem.slice(0, -2); }
      return rem ? rem + ',' + res : res;
    }

    function _numToDigits8(n) {
      var s = String(n);
      while (s.length < 8) s = '0' + s;
      return s.split('');
    }

    var firstNumber, secondNumber;
    if (page.randomNumbers) {
      var _top  = Math.floor(Math.random() * (6999999 - 100000 + 1)) + 100000;
      var _bMax = Math.min(2999999, 9999999 - _top);
      var _bot  = Math.floor(Math.random() * (_bMax - 100000 + 1)) + 100000;
      firstNumber  = { digits8: _numToDigits8(_top), caption: 'Number: ' + _toIndianFormat(_top) };
      secondNumber = { digits8: _numToDigits8(_bot), caption: 'Number: ' + _toIndianFormat(_bot) };
    } else {
      firstNumber  = page.firstNumber;
      secondNumber = page.secondNumber;
    }
    _additionLabResult = { firstNumber: firstNumber, secondNumber: secondNumber };

    /* ── Title ── */
    var titleEl = _el('h1', 'cp-title');
    titleEl.textContent = page.title;
    wrap.appendChild(titleEl);

    /* ── Subtitle (updated per sub-stage) ── */
    var subtitleEl = _el('p', 'cp-al-subtitle');
    wrap.appendChild(subtitleEl);

    /* ── Status message ── */
    var statusEl = _el('p', 'cp-al-status-msg');
    wrap.appendChild(statusEl);

    /* ── Top card: place-value board ── */
    var topCard = _el('div', 'cp-al-top-card');
    var boardArea = _el('div', 'cp-al-board-area');

    var opSign = _el('div', 'cp-al-op-sign');
    opSign.textContent = '+';
    opSign.setAttribute('aria-hidden', 'true');
    boardArea.appendChild(opSign);

    var board = _el('div', 'cp-al-board');

    var headersEl = _el('div', 'cp-al-data-row cp-al-headers');
    (page.headers || []).forEach(function (h) {
      var cell = _el('div', 'cp-al-header-cell');
      cell.textContent = h;
      headersEl.appendChild(cell);
    });
    board.appendChild(headersEl);

    var topRow = _el('div', 'cp-al-data-row cp-al-top-row');
    board.appendChild(topRow);
    var divider = _el('div', 'cp-al-divider');
    board.appendChild(divider);
    var botRow = _el('div', 'cp-al-data-row cp-al-bot-row');
    board.appendChild(botRow);

    boardArea.appendChild(board);
    topCard.appendChild(boardArea);
    wrap.appendChild(topCard);

    function renderEmptyCells(row) {
      row.innerHTML = '';
      row.classList.remove('cp-al-row--filled', 'cp-al-row--error');
      for (var i = 0; i < 8; i++) row.appendChild(_el('div', 'cp-al-cell'));
    }
    renderEmptyCells(topRow);
    renderEmptyCells(botRow);

    function fillRow(row, digits8) {
      row.innerHTML = '';
      row.classList.remove('cp-al-row--error');
      digits8.forEach(function (d) {
        var cell = _el('div', 'cp-al-cell cp-al-cell--filled');
        cell.textContent = d;
        row.appendChild(cell);
      });
      row.classList.add('cp-al-row--filled');
    }

    /* ── Bottom card: source + token ── */
    var bottomCard = _el('div', 'cp-al-bottom-card');
    var sourceTitle = _el('p', 'cp-al-source-title');
    bottomCard.appendChild(sourceTitle);

    var sourceStage = _el('div', 'cp-al-source-stage');
    var token = _el('div', 'cp-al-token');
    sourceStage.appendChild(token);
    bottomCard.appendChild(sourceStage);

    var captionEl = _el('p', 'cp-al-caption');
    bottomCard.appendChild(captionEl);
    wrap.appendChild(bottomCard);

    /* ── Snap-preview ghost (positioned absolute in wrap) ── */
    var ghost = _el('div', 'cp-al-token cp-al-token--ghost');
    ghost.style.display = 'none';
    ghost.setAttribute('aria-hidden', 'true');
    wrap.appendChild(ghost);

    /* ── Action buttons ── */
    var actions = _el('div', 'cp-al-actions');

    var checkBtn = _el('button', 'cp-btn-primary cp-al-check-btn');
    checkBtn.textContent = 'Check';
    checkBtn.style.display = 'none';
    actions.appendChild(checkBtn);

    var addBtn = _el('button', 'cp-btn-primary cp-al-add-btn');
    addBtn.textContent = 'Add Now →';
    addBtn.style.display = 'none';
    actions.appendChild(addBtn);

    var resetBtn = _el('button', 'cp-al-reset-btn');
    resetBtn.textContent = 'Reset';
    resetBtn.style.display = 'none';
    actions.appendChild(resetBtn);

    wrap.appendChild(actions);
    area.appendChild(wrap);

    /* ── State ── */
    var step         = 1;
    var tokenPlaced  = false;
    var tokenSnapRow = null;
    var tokenSnapCol = 0;
    var _wiggleTimer = null;

    /* ── Helpers ── */
    function getCellUnit() {
      var cell = topRow.querySelector('.cp-al-cell');
      if (!cell) return 55;
      var cs  = getComputedStyle(topRow);
      var gap = parseFloat(cs.columnGap || cs.gridColumnGap) || 5;
      return cell.offsetWidth + gap;
    }

    function visibleDigits(digits8) {
      var i = 0;
      while (i < digits8.length - 1 && digits8[i] === '0') i++;
      return digits8.slice(i);
    }

    function activeData() {
      return step === 1 ? firstNumber : secondNumber;
    }

    /* ── Status messages ── */
    function showStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className   = 'cp-al-status-msg' + (type ? ' cp-al-status-msg--' + type : '');
      if (typeof anime !== 'undefined') {
        anime.set(statusEl, { opacity: 0, translateY: 4 });
        anime({ targets: statusEl, opacity: 1, translateY: 0, duration: 280, easing: 'easeOutQuad' });
      }
    }

    function clearStatus() {
      statusEl.textContent = '';
      statusEl.className   = 'cp-al-status-msg';
    }

    /* ── Confetti micro-burst above board row ── */
    function spawnConfetti(anchorEl) {
      if (typeof anime === 'undefined') return;
      var anchorRect = anchorEl.getBoundingClientRect();
      var wrapRect   = wrap.getBoundingClientRect();
      var cx = anchorRect.left + anchorRect.width / 2 - wrapRect.left;
      var cy = anchorRect.top - wrapRect.top;
      var colors = ['#60a5fa', '#f59e0b', '#34d399', '#f472b6', '#a78bfa', '#fb923c'];
      for (var _ci = 0; _ci < 14; _ci++) {
        (function (idx) {
          var dot = document.createElement('div');
          dot.className = 'cp-al-confetti-piece';
          dot.style.cssText = 'position:absolute;width:7px;height:7px;border-radius:50%;' +
            'left:' + cx + 'px;top:' + cy + 'px;' +
            'background:' + colors[idx % colors.length] + ';' +
            'pointer-events:none;z-index:20;';
          wrap.appendChild(dot);
          var angle = (idx / 14) * Math.PI * 2;
          var dist  = 44 + (idx % 3) * 24;
          anime({
            targets: dot,
            translateX: Math.cos(angle) * dist,
            translateY: Math.sin(angle) * dist - 32,
            opacity: [1, 0],
            scale: [1.2, 0.2],
            duration: 650 + (idx % 4) * 90,
            easing: 'easeOutCubic',
            complete: function () { if (dot.parentNode) dot.parentNode.removeChild(dot); }
          });
        }(_ci));
      }
    }

    /* ── Cell reveal pop after fillRow ── */
    function animateCellPop(row) {
      if (typeof anime === 'undefined') return;
      var cells = row.querySelectorAll('.cp-al-cell--filled');
      anime.set(cells, { scale: 0, opacity: 0 });
      anime({
        targets: cells,
        scale: [0, 1.15, 1],
        opacity: [0, 1],
        duration: 320,
        delay: anime.stagger(35),
        easing: 'easeOutBack'
      });
    }

    /* ── Token shake on wrong ── */
    function shakeToken() {
      if (typeof anime !== 'undefined') {
        anime({ targets: token, translateX: [0, -7, 7, -5, 5, -3, 3, 0], duration: 400, easing: 'easeInOutSine' });
      }
    }

    /* ── Idle wiggle every 3 s (hints user to drag) ── */
    function scheduleWiggle() {
      clearTimeout(_wiggleTimer);
      _wiggleTimer = setTimeout(function () {
        if (tokenPlaced) return;
        if (typeof anime !== 'undefined') {
          anime({
            targets: token,
            translateX: [0, -5, 5, -3, 3, 0],
            duration: 480,
            easing: 'easeInOutSine',
            complete: scheduleWiggle
          });
        } else {
          scheduleWiggle();
        }
      }, 3000);
    }

    /* ── Ghost snap-preview helpers ── */
    function _buildGhostCells(digits, cellSz, gap, cellCls) {
      ghost.innerHTML = '';
      ghost.style.gridTemplateColumns = 'repeat(' + digits.length + ', ' + cellSz + 'px)';
      ghost.style.gap = gap + 'px';
      digits.forEach(function (d) {
        var gc = _el('div', cellCls);
        gc.textContent = d;
        ghost.appendChild(gc);
      });
    }

    function _positionGhost(boardRect, wrapRect, rowRect, tokenRect, CELL_UNIT, maxStartCol) {
      var centerY = tokenRect.top + tokenRect.height / 2;
      if (centerY >= rowRect.top - 20 && centerY <= rowRect.bottom + 20) {
        var relLeft  = Math.max(0, Math.min(tokenRect.left - boardRect.left, maxStartCol * CELL_UNIT));
        var snapCol  = Math.max(0, Math.min(Math.round(relLeft / CELL_UNIT), maxStartCol));
        ghost.style.left    = (boardRect.left - wrapRect.left + snapCol * CELL_UNIT) + 'px';
        ghost.style.top     = (rowRect.top - wrapRect.top) + 'px';
        ghost.style.display = '';
      } else {
        ghost.style.display = 'none';
      }
    }

    /* ── Render token (+ rebuild ghost cells) ── */
    function renderToken() {
      token.innerHTML = '';
      ghost.style.display = 'none';
      token.classList.remove('cp-al-token--error');
      var data    = activeData();
      var digits  = visibleDigits(data.digits8);
      var cell    = topRow.querySelector('.cp-al-cell');
      var cellSz  = cell ? cell.offsetWidth : 42;
      var cs      = getComputedStyle(topRow);
      var gap     = parseFloat(cs.columnGap || cs.gridColumnGap) || 5;
      var cellCls = step === 1 ? 'cp-al-cell cp-al-cell--first' : 'cp-al-cell cp-al-cell--second';
      token.style.gridTemplateColumns = 'repeat(' + digits.length + ', ' + cellSz + 'px)';
      token.style.gap = gap + 'px';
      digits.forEach(function (d) {
        var c = _el('div', cellCls);
        c.textContent = d;
        token.appendChild(c);
      });
      _buildGhostCells(digits, cellSz, gap, cellCls);
      token.onmousedown  = startTokenDrag;
      token.ontouchstart = startTokenDrag;
      resetTokenPosition();
    }

    function resetTokenPosition() {
      var stageW = sourceStage.offsetWidth  || 300;
      var stageH = sourceStage.offsetHeight || 70;
      var tokW   = token.offsetWidth;
      var cell   = topRow.querySelector('.cp-al-cell');
      var cellH  = cell ? cell.offsetHeight : 42;
      var centeredLeft = tokW > 0 ? Math.max(8, Math.round((stageW - tokW) / 2)) : 16;
      var centeredTop  = Math.max(8, Math.round((stageH - cellH) / 2));
      token.style.left      = centeredLeft + 'px';
      token.style.top       = centeredTop  + 'px';
      token.style.transform = '';
      token.classList.remove('cp-al-token--error');
      tokenPlaced  = false;
      tokenSnapRow = null;
      tokenSnapCol = 0;
      checkBtn.style.display = 'none';
      resetBtn.style.display = 'none';
      scheduleWiggle();
    }

    function setPrompt() {
      var isFirst = step === 1;
      var data    = activeData();
      sourceTitle.textContent = isFirst ? 'First Number To Place' : 'Second Number To Place';
      captionEl.textContent   = data.caption || '';
      subtitleEl.textContent  = isFirst
        ? 'Place the first number on the grid. Drag the whole number to the correct place-value columns.'
        : 'Great. Now place the second number so it lines up correctly under the first number.';
      topRow.classList.toggle('cp-al-row--ready', isFirst);
      botRow.classList.toggle('cp-al-row--ready', !isFirst);
    }

    function prepareStep(s) {
      step = s;
      clearStatus();
      setPrompt();
      renderToken();
    }

    /* ── Drag ── */
    function startTokenDrag(e) {
      if (token.classList.contains('cp-al-token--locked')) return;
      e.preventDefault();

      var boardRect = board.getBoundingClientRect();
      var stageRect = sourceStage.getBoundingClientRect();
      var wrapRect  = wrap.getBoundingClientRect();
      var activeRow = step === 1 ? topRow : botRow;
      var rowRect   = activeRow.getBoundingClientRect();
      var tokenRect = token.getBoundingClientRect();
      var CELL_UNIT = getCellUnit();
      var isTouch   = e.type.indexOf('mouse') === -1;
      var startX    = isTouch ? e.touches[0].clientX : e.clientX;
      var startY    = isTouch ? e.touches[0].clientY : e.clientY;
      var leftStart = parseFloat(token.style.left) || 16;
      var topStart  = parseFloat(token.style.top)  || 10;
      var data      = activeData();
      var maxStartCol = 8 - visibleDigits(data.digits8).length;

      token.classList.remove('cp-al-token--error');
      if (tokenSnapRow) tokenSnapRow.classList.remove('cp-al-row--error');
      resetBtn.style.display = 'none';
      clearStatus();
      token.classList.add('cp-al-token--dragging');
      clearTimeout(_wiggleTimer);
      if (typeof anime !== 'undefined') {
        anime({ targets: token, scale: 1.05, duration: 120, easing: 'easeOutQuad' });
      }

      function onMove(ev) {
        ev.preventDefault();
        var isT = ev.type.indexOf('mouse') === -1;
        var cx  = isT ? ev.touches[0].clientX : ev.clientX;
        var cy  = isT ? ev.touches[0].clientY : ev.clientY;
        token.style.left = (leftStart + (cx - startX)) + 'px';
        token.style.top  = (topStart  + (cy - startY)) + 'px';
        _positionGhost(boardRect, wrapRect, rowRect, token.getBoundingClientRect(), CELL_UNIT, maxStartCol);
      }

      function onEnd() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend',  onEnd);
        token.classList.remove('cp-al-token--dragging');
        ghost.style.display = 'none';
        if (typeof anime !== 'undefined') {
          anime({ targets: token, scale: 1, duration: 80, easing: 'easeOutQuad' });
        }

        var finalRect    = token.getBoundingClientRect();
        var tokenCenterY = finalRect.top + tokenRect.height / 2;
        var visDigits    = visibleDigits(data.digits8);
        var maxCol       = 8 - visDigits.length;

        if (tokenCenterY >= rowRect.top - 20 && tokenCenterY <= rowRect.bottom + 20) {
          var relLeft    = Math.max(0, Math.min(finalRect.left - boardRect.left, maxCol * CELL_UNIT));
          var snappedCol = Math.max(0, Math.min(Math.round(relLeft / CELL_UNIT), maxCol));
          token.style.left      = ((boardRect.left - stageRect.left) + snappedCol * CELL_UNIT) + 'px';
          token.style.top       = (rowRect.top - stageRect.top) + 'px';
          token.style.transform = '';
          tokenPlaced  = true;
          tokenSnapCol = snappedCol;
          tokenSnapRow = activeRow;
          if (typeof playTick === 'function') playTick();

          /* Auto-check after snap settles */
          setTimeout(runCheck, 350);
        } else {
          /* Dropped outside row Y-band */
          resetTokenPosition();
          showStatus(
            'drop the whole number onto the highlighted row first so the digits can line up with the place-value columns.',
            'warn'
          );
        }
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend',  onEnd);
    }

    /* ── Check (auto-called on drop) ── */
    function runCheck() {
      if (!tokenPlaced) return;
      var data        = activeData();
      var visDigits   = visibleDigits(data.digits8);
      var expectedCol = 8 - visDigits.length;
      var numLabel    = step === 1 ? 'first' : 'second';

      if (tokenSnapCol === expectedCol) {
        /* ── Correct ── */
        var row = step === 1 ? topRow : botRow;
        fillRow(row, data.digits8);
        animateCellPop(row);
        spawnConfetti(row);
        checkBtn.style.display = 'none';
        resetBtn.style.display = 'none';
        clearTimeout(_wiggleTimer);
        if (typeof playCorrect === 'function') playCorrect();

        if (step === 1) {
          showStatus(
            'Correct drag. The first number ends at the Ones column, so every digit is in its proper place-value column.',
            'correct'
          );
          setTimeout(function () {
            if (_currentPageId === page.id) prepareStep(2);
          }, 1400);
        } else {
          showStatus(
            'Correct drag. The second number is lined up under the first one, so each digit matches the same place value.',
            'correct'
          );
          /* Synchronized green flash for both rows */
          setTimeout(function () {
            topRow.classList.add('cp-al-row--success');
            botRow.classList.add('cp-al-row--success');
            setTimeout(function () {
              topRow.classList.remove('cp-al-row--success');
              botRow.classList.remove('cp-al-row--success');
            }, 500);
          }, 600);
          /* Second status + source update + Add Now */
          setTimeout(function () {
            if (_currentPageId !== page.id) return;
            if (typeof playComplete === 'function') playComplete();
            showStatus('Excellent! Both numbers are lined up correctly for addition.', 'correct');
            sourceTitle.textContent = 'Great Job!';
            captionEl.textContent   = firstNumber.caption.replace(/^Number:\s*/, '')
                                    + ' + '
                                    + secondNumber.caption.replace(/^Number:\s*/, '');
            token.innerHTML         = '';
            token.onmousedown       = null;
            token.ontouchstart      = null;
            subtitleEl.textContent  = 'Both numbers are lined up correctly for addition!';
            if (typeof anime !== 'undefined') {
              anime.set(addBtn, { opacity: 0, translateY: 16 });
              addBtn.style.display = '';
              anime({
                targets: addBtn, opacity: 1, translateY: 0, duration: 500, easing: 'easeOutBack',
                complete: function () {
                  anime({
                    targets: addBtn,
                    boxShadow: [
                      '0 0 0 0 rgba(59,130,246,0)',
                      '0 0 0 8px rgba(59,130,246,0.45)',
                      '0 0 0 0 rgba(59,130,246,0)'
                    ],
                    duration: 1400, loop: true, easing: 'easeInOutSine'
                  });
                }
              });
            } else {
              addBtn.style.display = '';
            }
          }, 1200);
        }
      } else {
        /* ── Wrong column ── */
        token.classList.add('cp-al-token--error');
        if (tokenSnapRow) tokenSnapRow.classList.add('cp-al-row--error');
        shakeToken();
        if (typeof playWrong === 'function') playWrong();
        var wrongMsg = step === 1
          ? 'Incorrect drag. The first number must end at the Ones column on the far right, otherwise every digit shifts into the wrong place value.'
          : 'Incorrect drag. The second number must end at the Ones column so its Ones digit sits directly below the first number\'s Ones digit.';
        showStatus(wrongMsg, 'error');
        if (typeof anime !== 'undefined') {
          anime.set(resetBtn, { opacity: 0, translateY: 10 });
          resetBtn.style.display = '';
          anime({ targets: resetBtn, opacity: 1, translateY: 0, duration: 300, easing: 'easeOutBack' });
        } else {
          resetBtn.style.display = '';
        }
      }
    }

    /* ── Reset ── */
    resetBtn.addEventListener('click', function () {
      if (tokenSnapRow) tokenSnapRow.classList.remove('cp-al-row--error');
      renderToken();
      showStatus('Reset done. Try placing the same number again.', 'info');
    });

    /* ── Add Now ── */
    addBtn.addEventListener('click', function () {
      clearTimeout(_wiggleTimer);
      if (typeof playSweep === 'function') playSweep();
      renderPage(page.next);
    });

    /* Initial setup */
    prepareStep(1);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 3.1 — subtraction-lab
  ══════════════════════════════════════════════════════ */

  function _renderSubtractionLab(page, area) {
    var wrap = _el('div', 'cp-subtraction-lab');
    wrap.dataset.pageId = page.id;

    /* ── Helpers ─────────────────────────────────────────── */
    function _toIndianFormat(n) {
      var s = String(n);
      if (s.length <= 3) return s;
      var res = s.slice(-3);
      var rem = s.slice(0, -3);
      while (rem.length > 2) { res = rem.slice(-2) + ',' + res; rem = rem.slice(0, -2); }
      return rem ? rem + ',' + res : res;
    }

    function _numToDigits8(n) {
      var s = String(n);
      while (s.length < 8) s = '0' + s;
      return s.split('');
    }

    function _subtractionNeedsBorrow(top, bot) {
      var borrow = 0, needed = false;
      while (top > 0 || bot > 0) {
        var td = top % 10, bd = bot % 10;
        if (td - borrow < bd) { needed = true; borrow = 1; } else { borrow = 0; }
        top = Math.floor(top / 10); bot = Math.floor(bot / 10);
      }
      return needed;
    }

    /* ── Random number generation ─────────────────────────
       top  ∈ [3,00,000 – 69,99,999]
       bottom ∈ [1,00,000 – min(29,99,999, top − 1000)]
       Retry until at least one borrow is required.
    ──────────────────────────────────────────────────────── */
    var firstNumber, secondNumber;
    if (page.randomNumbers) {
      var _top, _bot;
      var _attempts = 0;
      do {
        _top = Math.floor(Math.random() * (6999999 - 300000 + 1)) + 300000;
        _bot = Math.floor(Math.random() * (Math.min(2999999, _top - 1000) - 100000 + 1)) + 100000;
        _attempts++;
      } while (!_subtractionNeedsBorrow(_top, _bot) && _attempts < 200);
      firstNumber  = { digits8: _numToDigits8(_top), caption: 'Number: ' + _toIndianFormat(_top), value: _top };
      secondNumber = { digits8: _numToDigits8(_bot), caption: 'Number: ' + _toIndianFormat(_bot), value: _bot };
    } else {
      firstNumber  = page.firstNumber;
      secondNumber = page.secondNumber;
    }
    _subtractionLabResult = { firstNumber: firstNumber, secondNumber: secondNumber };

    /* ── Title ── */
    var titleEl = _el('h1', 'cp-title');
    titleEl.textContent = page.title;
    wrap.appendChild(titleEl);

    /* ── Subtitle ── */
    var subtitleEl = _el('p', 'cp-al-subtitle');
    wrap.appendChild(subtitleEl);

    /* ── Status message ── */
    var statusEl = _el('p', 'cp-al-status-msg');
    wrap.appendChild(statusEl);

    /* ── Board ── */
    var topCard = _el('div', 'cp-al-top-card');
    var boardArea = _el('div', 'cp-al-board-area');

    var opSign = _el('div', 'cp-al-op-sign');
    opSign.textContent = '−';
    opSign.setAttribute('aria-hidden', 'true');
    boardArea.appendChild(opSign);

    var board = _el('div', 'cp-al-board');

    var headersEl = _el('div', 'cp-al-data-row cp-al-headers');
    (page.headers || []).forEach(function (h) {
      var cell = _el('div', 'cp-al-header-cell');
      cell.textContent = h;
      headersEl.appendChild(cell);
    });
    board.appendChild(headersEl);

    var topRow = _el('div', 'cp-al-data-row cp-al-top-row');
    board.appendChild(topRow);
    var divider = _el('div', 'cp-al-divider');
    board.appendChild(divider);
    var botRow = _el('div', 'cp-al-data-row cp-al-bot-row');
    board.appendChild(botRow);

    boardArea.appendChild(board);
    topCard.appendChild(boardArea);
    wrap.appendChild(topCard);

    function renderEmptyCells(row) {
      row.innerHTML = '';
      row.classList.remove('cp-al-row--filled', 'cp-al-row--error');
      for (var i = 0; i < 8; i++) row.appendChild(_el('div', 'cp-al-cell'));
    }
    renderEmptyCells(topRow);
    renderEmptyCells(botRow);

    function fillRow(row, digits8) {
      row.innerHTML = '';
      row.classList.remove('cp-al-row--error');
      digits8.forEach(function (d) {
        var cell = _el('div', 'cp-al-cell cp-al-cell--filled');
        cell.textContent = d;
        row.appendChild(cell);
      });
      row.classList.add('cp-al-row--filled');
    }

    /* ── Source panel ── */
    var bottomCard = _el('div', 'cp-al-bottom-card');
    var sourceTitle = _el('p', 'cp-al-source-title');
    bottomCard.appendChild(sourceTitle);

    var sourceStage = _el('div', 'cp-al-source-stage');
    var token = _el('div', 'cp-al-token');
    sourceStage.appendChild(token);
    bottomCard.appendChild(sourceStage);

    var captionEl = _el('p', 'cp-al-caption');
    bottomCard.appendChild(captionEl);
    wrap.appendChild(bottomCard);

    /* ── Ghost snap-preview ── */
    var ghost = _el('div', 'cp-al-token cp-al-token--ghost');
    ghost.style.display = 'none';
    ghost.setAttribute('aria-hidden', 'true');
    wrap.appendChild(ghost);

    /* ── Action buttons ── */
    var actions = _el('div', 'cp-al-actions');

    var checkBtn = _el('button', 'cp-btn-primary cp-al-check-btn');
    checkBtn.textContent = 'Check';
    checkBtn.style.display = 'none';
    actions.appendChild(checkBtn);

    var subtractBtn = _el('button', 'cp-btn-primary cp-al-add-btn');
    subtractBtn.textContent = 'Subtract Now →';
    subtractBtn.style.display = 'none';
    actions.appendChild(subtractBtn);

    var resetBtn = _el('button', 'cp-al-reset-btn');
    resetBtn.textContent = 'Reset';
    resetBtn.style.display = 'none';
    actions.appendChild(resetBtn);

    wrap.appendChild(actions);
    area.appendChild(wrap);

    /* ── State ── */
    var step         = 1;
    var tokenPlaced  = false;
    var tokenSnapRow = null;
    var tokenSnapCol = 0;
    var _wiggleTimer = null;

    /* ── Helpers ── */
    function getCellUnit() {
      var cell = topRow.querySelector('.cp-al-cell');
      if (!cell) return 55;
      var cs  = getComputedStyle(topRow);
      var gap = parseFloat(cs.columnGap || cs.gridColumnGap) || 5;
      return cell.offsetWidth + gap;
    }

    function visibleDigits(digits8) {
      var i = 0;
      while (i < digits8.length - 1 && digits8[i] === '0') i++;
      return digits8.slice(i);
    }

    function activeData() {
      return step === 1 ? firstNumber : secondNumber;
    }

    function showStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className   = 'cp-al-status-msg' + (type ? ' cp-al-status-msg--' + type : '');
      if (typeof anime !== 'undefined') {
        anime.set(statusEl, { opacity: 0, translateY: 4 });
        anime({ targets: statusEl, opacity: 1, translateY: 0, duration: 280, easing: 'easeOutQuad' });
      }
    }

    function clearStatus() {
      statusEl.textContent = '';
      statusEl.className   = 'cp-al-status-msg';
    }

    function spawnConfetti(anchorEl) {
      if (typeof anime === 'undefined') return;
      var anchorRect = anchorEl.getBoundingClientRect();
      var wrapRect   = wrap.getBoundingClientRect();
      var cx = anchorRect.left + anchorRect.width / 2 - wrapRect.left;
      var cy = anchorRect.top - wrapRect.top;
      var colors = ['#60a5fa', '#f59e0b', '#34d399', '#f472b6', '#a78bfa', '#fb923c'];
      for (var _ci = 0; _ci < 14; _ci++) {
        (function (idx) {
          var dot = document.createElement('div');
          dot.className = 'cp-al-confetti-piece';
          dot.style.cssText = 'position:absolute;width:7px;height:7px;border-radius:50%;' +
            'left:' + cx + 'px;top:' + cy + 'px;' +
            'background:' + colors[idx % colors.length] + ';' +
            'pointer-events:none;z-index:20;';
          wrap.appendChild(dot);
          var angle = (idx / 14) * Math.PI * 2;
          var dist  = 44 + (idx % 3) * 24;
          anime({
            targets: dot,
            translateX: Math.cos(angle) * dist,
            translateY: Math.sin(angle) * dist - 32,
            opacity: [1, 0],
            scale: [1.2, 0.2],
            duration: 650 + (idx % 4) * 90,
            easing: 'easeOutCubic',
            complete: function () { if (dot.parentNode) dot.parentNode.removeChild(dot); }
          });
        }(_ci));
      }
    }

    function animateCellPop(row) {
      if (typeof anime === 'undefined') return;
      var cells = row.querySelectorAll('.cp-al-cell--filled');
      anime.set(cells, { scale: 0, opacity: 0 });
      anime({
        targets: cells,
        scale: [0, 1.15, 1],
        opacity: [0, 1],
        duration: 320,
        delay: anime.stagger(35),
        easing: 'easeOutBack'
      });
    }

    function shakeToken() {
      if (typeof anime !== 'undefined') {
        anime({ targets: token, translateX: [0, -7, 7, -5, 5, -3, 3, 0], duration: 400, easing: 'easeInOutSine' });
      }
    }

    function scheduleWiggle() {
      clearTimeout(_wiggleTimer);
      _wiggleTimer = setTimeout(function () {
        if (tokenPlaced) return;
        if (typeof anime !== 'undefined') {
          anime({
            targets: token,
            translateX: [0, -5, 5, -3, 3, 0],
            duration: 480,
            easing: 'easeInOutSine',
            complete: scheduleWiggle
          });
        } else {
          scheduleWiggle();
        }
      }, 3000);
    }

    function _buildGhostCells(digits, cellSz, gap, cellCls) {
      ghost.innerHTML = '';
      ghost.style.gridTemplateColumns = 'repeat(' + digits.length + ', ' + cellSz + 'px)';
      ghost.style.gap = gap + 'px';
      digits.forEach(function (d) {
        var gc = _el('div', cellCls);
        gc.textContent = d;
        ghost.appendChild(gc);
      });
    }

    function _positionGhost(boardRect, wrapRect, rowRect, tokenRect, CELL_UNIT, maxStartCol) {
      var centerY = tokenRect.top + tokenRect.height / 2;
      if (centerY >= rowRect.top - 20 && centerY <= rowRect.bottom + 20) {
        var relLeft  = Math.max(0, Math.min(tokenRect.left - boardRect.left, maxStartCol * CELL_UNIT));
        var snapCol  = Math.max(0, Math.min(Math.round(relLeft / CELL_UNIT), maxStartCol));
        ghost.style.left    = (boardRect.left - wrapRect.left + snapCol * CELL_UNIT) + 'px';
        ghost.style.top     = (rowRect.top - wrapRect.top) + 'px';
        ghost.style.display = '';
      } else {
        ghost.style.display = 'none';
      }
    }

    function renderToken() {
      token.innerHTML = '';
      ghost.style.display = 'none';
      token.classList.remove('cp-al-token--error');
      var data    = activeData();
      var digits  = visibleDigits(data.digits8);
      var cell    = topRow.querySelector('.cp-al-cell');
      var cellSz  = cell ? cell.offsetWidth : 42;
      var cs      = getComputedStyle(topRow);
      var gap     = parseFloat(cs.columnGap || cs.gridColumnGap) || 5;
      var cellCls = step === 1 ? 'cp-al-cell cp-al-cell--first' : 'cp-al-cell cp-al-cell--second';
      token.style.gridTemplateColumns = 'repeat(' + digits.length + ', ' + cellSz + 'px)';
      token.style.gap = gap + 'px';
      digits.forEach(function (d) {
        var c = _el('div', cellCls);
        c.textContent = d;
        token.appendChild(c);
      });
      _buildGhostCells(digits, cellSz, gap, cellCls);
      token.onmousedown  = startTokenDrag;
      token.ontouchstart = startTokenDrag;
      resetTokenPosition();
    }

    function resetTokenPosition() {
      var stageW = sourceStage.offsetWidth  || 300;
      var stageH = sourceStage.offsetHeight || 70;
      var tokW   = token.offsetWidth;
      var cell   = topRow.querySelector('.cp-al-cell');
      var cellH  = cell ? cell.offsetHeight : 42;
      var centeredLeft = tokW > 0 ? Math.max(8, Math.round((stageW - tokW) / 2)) : 16;
      var centeredTop  = Math.max(8, Math.round((stageH - cellH) / 2));
      token.style.left      = centeredLeft + 'px';
      token.style.top       = centeredTop  + 'px';
      token.style.transform = '';
      token.classList.remove('cp-al-token--error');
      tokenPlaced  = false;
      tokenSnapRow = null;
      tokenSnapCol = 0;
      checkBtn.style.display  = 'none';
      resetBtn.style.display  = 'none';
      scheduleWiggle();
    }

    function setPrompt() {
      var isFirst = step === 1;
      var data    = activeData();
      sourceTitle.textContent = isFirst ? 'First Number To Place' : 'Second Number To Place';
      captionEl.textContent   = data.caption || '';
      subtitleEl.textContent  = isFirst
        ? 'Place the first number on the grid. Drag the whole number to the correct place-value columns.'
        : 'Great. Now place the second number so it lines up correctly under the first number.';
      topRow.classList.toggle('cp-al-row--ready', isFirst);
      botRow.classList.toggle('cp-al-row--ready', !isFirst);
    }

    function prepareStep(s) {
      step = s;
      clearStatus();
      setPrompt();
      renderToken();
    }

    /* ── Drag ── */
    function startTokenDrag(e) {
      if (token.classList.contains('cp-al-token--locked')) return;
      e.preventDefault();

      var boardRect = board.getBoundingClientRect();
      var stageRect = sourceStage.getBoundingClientRect();
      var wrapRect  = wrap.getBoundingClientRect();
      var activeRow = step === 1 ? topRow : botRow;
      var rowRect   = activeRow.getBoundingClientRect();
      var tokenRect = token.getBoundingClientRect();
      var CELL_UNIT = getCellUnit();
      var isTouch   = e.type.indexOf('mouse') === -1;
      var startX    = isTouch ? e.touches[0].clientX : e.clientX;
      var startY    = isTouch ? e.touches[0].clientY : e.clientY;
      var leftStart = parseFloat(token.style.left) || 16;
      var topStart  = parseFloat(token.style.top)  || 10;
      var data      = activeData();
      var maxStartCol = 8 - visibleDigits(data.digits8).length;

      token.classList.remove('cp-al-token--error');
      if (tokenSnapRow) tokenSnapRow.classList.remove('cp-al-row--error');
      resetBtn.style.display = 'none';
      clearStatus();
      token.classList.add('cp-al-token--dragging');
      clearTimeout(_wiggleTimer);
      if (typeof anime !== 'undefined') {
        anime({ targets: token, scale: 1.05, duration: 120, easing: 'easeOutQuad' });
      }

      function onMove(ev) {
        ev.preventDefault();
        var isT = ev.type.indexOf('mouse') === -1;
        var cx  = isT ? ev.touches[0].clientX : ev.clientX;
        var cy  = isT ? ev.touches[0].clientY : ev.clientY;
        token.style.left = (leftStart + (cx - startX)) + 'px';
        token.style.top  = (topStart  + (cy - startY)) + 'px';
        _positionGhost(boardRect, wrapRect, rowRect, token.getBoundingClientRect(), CELL_UNIT, maxStartCol);
      }

      function onEnd() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend',  onEnd);
        token.classList.remove('cp-al-token--dragging');
        ghost.style.display = 'none';
        if (typeof anime !== 'undefined') {
          anime({ targets: token, scale: 1, duration: 80, easing: 'easeOutQuad' });
        }

        var finalRect    = token.getBoundingClientRect();
        var tokenCenterY = finalRect.top + tokenRect.height / 2;
        var visDigits    = visibleDigits(data.digits8);
        var maxCol       = 8 - visDigits.length;

        if (tokenCenterY >= rowRect.top - 20 && tokenCenterY <= rowRect.bottom + 20) {
          var relLeft    = Math.max(0, Math.min(finalRect.left - boardRect.left, maxCol * CELL_UNIT));
          var snappedCol = Math.max(0, Math.min(Math.round(relLeft / CELL_UNIT), maxCol));
          token.style.left      = ((boardRect.left - stageRect.left) + snappedCol * CELL_UNIT) + 'px';
          token.style.top       = (rowRect.top - stageRect.top) + 'px';
          token.style.transform = '';
          tokenPlaced  = true;
          tokenSnapCol = snappedCol;
          tokenSnapRow = activeRow;
          if (typeof playTick === 'function') playTick();
          setTimeout(runCheck, 350);
        } else {
          resetTokenPosition();
          showStatus(
            'drop the whole number onto the highlighted row first so the digits can line up with the place-value columns.',
            'warn'
          );
        }
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend',  onEnd);
    }

    /* ── Check ── */
    function runCheck() {
      if (!tokenPlaced) return;
      var data        = activeData();
      var visDigits   = visibleDigits(data.digits8);
      var expectedCol = 8 - visDigits.length;

      if (tokenSnapCol === expectedCol) {
        /* ── Correct ── */
        var row = step === 1 ? topRow : botRow;
        fillRow(row, data.digits8);
        animateCellPop(row);
        spawnConfetti(row);
        checkBtn.style.display = 'none';
        resetBtn.style.display = 'none';
        clearTimeout(_wiggleTimer);
        if (typeof playCorrect === 'function') playCorrect();

        if (step === 1) {
          showStatus(
            'Correct drag. The first number ends at the Ones column, so every digit is in its proper place-value column.',
            'correct'
          );
          setTimeout(function () {
            if (_currentPageId === page.id) {
              showStatus('Correct! The first number is placed properly. Now place the second number below it.', 'correct');
              prepareStep(2);
            }
          }, 1400);
        } else {
          showStatus(
            'Correct drag. The second number is lined up under the first one, so each digit matches the same place value.',
            'correct'
          );
          setTimeout(function () {
            topRow.classList.add('cp-al-row--success');
            botRow.classList.add('cp-al-row--success');
            setTimeout(function () {
              topRow.classList.remove('cp-al-row--success');
              botRow.classList.remove('cp-al-row--success');
            }, 500);
          }, 600);
          setTimeout(function () {
            if (_currentPageId !== page.id) return;
            if (typeof playComplete === 'function') playComplete();
            showStatus('Excellent! Both numbers are lined up correctly for subtraction.', 'correct');
            sourceTitle.textContent = 'Great Job!';
            captionEl.textContent   = firstNumber.caption.replace(/^Number:\s*/, '')
                                    + ' − '
                                    + secondNumber.caption.replace(/^Number:\s*/, '');
            token.innerHTML    = '';
            token.onmousedown  = null;
            token.ontouchstart = null;
            subtitleEl.textContent = 'Both numbers are lined up correctly for subtraction!';
            if (typeof anime !== 'undefined') {
              anime.set(subtractBtn, { opacity: 0, translateY: 16 });
              subtractBtn.style.display = '';
              anime({
                targets: subtractBtn, opacity: 1, translateY: 0, duration: 500, easing: 'easeOutBack',
                complete: function () {
                  anime({
                    targets: subtractBtn,
                    boxShadow: [
                      '0 0 0 0 rgba(234,88,12,0)',
                      '0 0 0 8px rgba(234,88,12,0.45)',
                      '0 0 0 0 rgba(234,88,12,0)'
                    ],
                    duration: 1400, loop: true, easing: 'easeInOutSine'
                  });
                }
              });
            } else {
              subtractBtn.style.display = '';
            }
          }, 1200);
        }
      } else {
        /* ── Wrong column ── */
        token.classList.add('cp-al-token--error');
        if (tokenSnapRow) tokenSnapRow.classList.add('cp-al-row--error');
        shakeToken();
        if (typeof playWrong === 'function') playWrong();
        var wrongMsg = step === 1
          ? 'Incorrect drag. The first number must end at the Ones column on the far right, otherwise every digit shifts into the wrong place value.'
          : 'Incorrect drag. The second number must end at the Ones column so its Ones digit sits directly below the first number\'s Ones digit.';
        showStatus(wrongMsg, 'error');
        if (typeof anime !== 'undefined') {
          anime.set(resetBtn, { opacity: 0, translateY: 10 });
          resetBtn.style.display = '';
          anime({ targets: resetBtn, opacity: 1, translateY: 0, duration: 300, easing: 'easeOutBack' });
        } else {
          resetBtn.style.display = '';
        }
      }
    }

    /* ── Reset ── */
    resetBtn.addEventListener('click', function () {
      if (tokenSnapRow) tokenSnapRow.classList.remove('cp-al-row--error');
      renderToken();
      showStatus('Reset done. Try placing the same number again.', 'info');
    });

    /* ── Subtract Now ── */
    subtractBtn.addEventListener('click', function () {
      clearTimeout(_wiggleTimer);
      if (typeof playSweep === 'function') playSweep();
      renderPage(page.next);
    });

    /* Initial setup */
    prepareStep(1);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 2.2 — Add Column by Column
  ══════════════════════════════════════════════════════ */

  function _renderAddColumnByColumn(page, area) {
    var labData = _additionLabResult;
    /* Indian number format helper (used below for generation and completion) */
    function _toInd(numStr) {
      var str = numStr.replace(/^0+/, '') || '0';
      if (str.length <= 3) return str;
      var r = str.slice(-3);
      var rem = str.slice(0, -3);
      while (rem.length > 2) { r = rem.slice(-2) + ',' + r; rem = rem.slice(0, -2); }
      return rem ? rem + ',' + r : r;
    }

    /* Use numbers from page 2.1 if available, otherwise generate fresh ones */
    var firstNumber, secondNumber;
    if (labData) {
      firstNumber  = labData.firstNumber;
      secondNumber = labData.secondNumber;
    } else {
      function _toD8(n) {
        var s = String(n);
        while (s.length < 8) s = '0' + s;
        return s.split('');
      }
      var _top  = Math.floor(Math.random() * (6999999 - 100000 + 1)) + 100000;
      var _bMax = Math.min(2999999, 9999999 - _top);
      var _bot  = Math.floor(Math.random() * (_bMax - 100000 + 1)) + 100000;
      firstNumber  = { digits8: _toD8(_top), caption: 'Number: ' + _toInd(String(_top)) };
      secondNumber = { digits8: _toD8(_bot), caption: 'Number: ' + _toInd(String(_bot)) };
      _additionLabResult = { firstNumber: firstNumber, secondNumber: secondNumber };
    }

    /* 7-digit arrays: strip the C column (index 0 of digits8) */
    var top7 = firstNumber.digits8.slice(1);
    var bot7 = secondNumber.digits8.slice(1);

    /* Count leading zeros for blank rendering */
    function _leadingZeros(arr) {
      var z = 0;
      while (z < arr.length - 1 && arr[z] === '0') z++;
      return z;
    }
    var topLeading = _leadingZeros(top7);
    var botLeading = _leadingZeros(bot7);

    /* Pre-compute per-column answers and carries
       carryArr[col] = carry INTO this column (from the column to its right) */
    var carryArr = [0, 0, 0, 0, 0, 0, 0];
    var ansArr   = [];
    var carry = 0;
    for (var c = 6; c >= 0; c--) {
      carryArr[c] = carry;
      var s = (+top7[c]) + (+bot7[c]) + carry;
      ansArr[c] = s % 10;
      carry = Math.floor(s / 10);
    }

    /* ── DOM ── */
    var wrap = _el('div', 'cp-acbc');
    wrap.dataset.pageId = page.id;

    var titleEl = _el('h1', 'cp-title');
    titleEl.textContent = page.title || 'Add Column by Column';
    wrap.appendChild(titleEl);

    var subtitleEl = _el('p', 'cp-acbc-subtitle');
    subtitleEl.textContent = 'Start from Ones.';
    wrap.appendChild(subtitleEl);

    var statusEl = _el('p', 'cp-acbc-status-msg');
    wrap.appendChild(statusEl);

    var body = _el('div', 'cp-acbc-body');

    /* ── Board side ── */
    var boardWrap = _el('div', 'cp-acbc-board-wrap');

    var opSign = _el('div', 'cp-acbc-op-sign');
    opSign.textContent = '+';
    opSign.setAttribute('aria-hidden', 'true');
    boardWrap.appendChild(opSign);

    var board = _el('div', 'cp-acbc-board');

    /* Header row */
    var headers = ['TL', 'L', 'TTh', 'Th', 'H', 'T', 'O'];
    var headerRow = _el('div', 'cp-acbc-header-row');
    headers.forEach(function (h, idx) {
      var cell = _el('div', 'cp-acbc-header-cell');
      cell.textContent = h;
      cell.dataset.col = String(idx);
      headerRow.appendChild(cell);
    });
    board.appendChild(headerRow);

    /* Carry row */
    var carryRowEl = _el('div', 'cp-acbc-carry-row');
    var carryCells = [];
    for (var ci = 0; ci < 7; ci++) {
      var cc = _el('div', 'cp-acbc-carry-cell');
      cc.dataset.col = String(ci);
      carryCells.push(cc);
      carryRowEl.appendChild(cc);
    }
    board.appendChild(carryRowEl);

    /* Top row */
    var topRowEl = _el('div', 'cp-acbc-row cp-acbc-top-row');
    top7.forEach(function (d, idx) {
      var cell = _el('div', 'cp-acbc-cell cp-acbc-cell--top');
      cell.textContent = idx < topLeading ? '' : d;
      cell.dataset.col = String(idx);
      topRowEl.appendChild(cell);
    });
    board.appendChild(topRowEl);

    /* Bottom row */
    var botRowEl = _el('div', 'cp-acbc-row cp-acbc-bot-row');
    bot7.forEach(function (d, idx) {
      var cell = _el('div', 'cp-acbc-cell cp-acbc-cell--bot');
      cell.textContent = idx < botLeading ? '' : d;
      cell.dataset.col = String(idx);
      botRowEl.appendChild(cell);
    });
    board.appendChild(botRowEl);

    board.appendChild(_el('div', 'cp-acbc-divider'));

    /* Answer row */
    var ansRowEl = _el('div', 'cp-acbc-row cp-acbc-ans-row');
    var ansCells = [];
    for (var ai = 0; ai < 7; ai++) {
      var ac = _el('div', 'cp-acbc-cell cp-acbc-ans-cell');
      ac.dataset.col = String(ai);
      ansCells.push(ac);
      ansRowEl.appendChild(ac);
    }
    board.appendChild(ansRowEl);

    boardWrap.appendChild(board);
    body.appendChild(boardWrap);

    /* ── Number pad ── */
    var numpad = _el('div', 'cp-acbc-numpad');
    var padGrid = _el('div', 'cp-acbc-pad-grid');
    var padKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', 'Del'];
    var padBtns = {};
    padKeys.forEach(function (k) {
      var isCtrl = k === 'Clear' || k === 'Del';
      var btn = _el('button', 'cp-acbc-pad-btn' + (isCtrl ? ' cp-acbc-pad-btn--ctrl' : ''));
      btn.textContent = k;
      btn.setAttribute('aria-label', k);
      padGrid.appendChild(btn);
      padBtns[k] = btn;
    });
    numpad.appendChild(padGrid);

    var submitBtn = _el('button', 'cp-acbc-submit-btn');
    submitBtn.textContent = 'Submit';
    numpad.appendChild(submitBtn);

    body.appendChild(numpad);
    wrap.appendChild(body);
    area.appendChild(wrap);

    /* ── State ── */
    var activeCol   = 6;
    var inputBuffer = '';
    var solved      = false;

    /* ── Helpers ── */
    function showStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className   = 'cp-acbc-status-msg' + (type ? ' cp-acbc-status-msg--' + type : '');
      if (typeof anime !== 'undefined') {
        anime.set(statusEl, { opacity: 0, translateY: 4 });
        anime({ targets: statusEl, opacity: 1, translateY: 0, duration: 280, easing: 'easeOutQuad' });
      }
    }

    function setActiveCol(col) {
      activeCol   = col;
      inputBuffer = '';
      ansCells[col].textContent = '';
      /* Toggle active class on all column cells */
      var rows = [headerRow, topRowEl, botRowEl, ansRowEl];
      rows.forEach(function (row) {
        row.querySelectorAll('[data-col]').forEach(function (cell) {
          cell.classList.toggle('cp-acbc-cell--active', +cell.dataset.col === col);
        });
      });
    }

    function animateCarry(col) {
      if (col < 0 || col >= 7) return;
      var cell = carryCells[col];
      cell.textContent = '1';
      cell.classList.add('cp-acbc-carry-cell--active');
      if (typeof anime !== 'undefined') {
        anime.set(cell, { opacity: 0, translateY: 8, scale: 0.6 });
        anime({ targets: cell, opacity: 1, translateY: 0, scale: 1, duration: 300, easing: 'easeOutBack' });
      }
    }

    function spawnConfettiAt(anchorEl) {
      if (typeof anime === 'undefined') return;
      var anchorRect = anchorEl.getBoundingClientRect();
      var wrapRect   = wrap.getBoundingClientRect();
      var cx = anchorRect.left + anchorRect.width / 2 - wrapRect.left;
      var cy = anchorRect.top - wrapRect.top;
      var colors = ['#60a5fa', '#f59e0b', '#34d399', '#f472b6', '#a78bfa', '#fb923c'];
      for (var di = 0; di < 14; di++) {
        (function (idx) {
          var dot = document.createElement('div');
          dot.className = 'cp-al-confetti-piece';
          dot.style.cssText = 'position:absolute;width:7px;height:7px;border-radius:50%;' +
            'left:' + cx + 'px;top:' + cy + 'px;' +
            'background:' + colors[idx % colors.length] + ';pointer-events:none;z-index:20;';
          wrap.appendChild(dot);
          var angle = (idx / 14) * Math.PI * 2;
          var dist  = 44 + (idx % 3) * 24;
          anime({
            targets: dot,
            translateX: Math.cos(angle) * dist,
            translateY: Math.sin(angle) * dist - 32,
            opacity: [1, 0], scale: [1.2, 0.2],
            duration: 650 + (idx % 4) * 90, easing: 'easeOutCubic',
            complete: function () { if (dot.parentNode) dot.parentNode.removeChild(dot); }
          });
        }(di));
      }
    }

    function onComplete() {
      solved = true;
      /* Green pulse wave across answer cells */
      if (typeof anime !== 'undefined') {
        anime({
          targets: ansCells,
          backgroundColor: ['#dcfce7', '#ffffff'],
          duration: 600,
          delay: anime.stagger(60),
          easing: 'easeOutQuad'
        });
      }
      spawnConfettiAt(ansRowEl);
      if (typeof playComplete === 'function') playComplete();

      /* Equation in subtitle */
      var topStr = top7.join('').replace(/^0+/, '') || '0';
      var botStr = bot7.join('').replace(/^0+/, '') || '0';
      var sumStr = ansArr.join('');
      subtitleEl.textContent = _toInd(topStr) + ' + ' + _toInd(botStr) + ' = ' + _toInd(sumStr);
      showStatus('Addition Complete!', 'correct');

      /* Completion buttons */
      var btnRow = _el('div', 'cp-acbc-btn-row');

      var nextBtn = _el('button', 'cp-btn-primary cp-acbc-next-btn');
      nextBtn.textContent = 'Next →';
      nextBtn.addEventListener('click', function () {
        if (page.next) renderPage(page.next);
      });

      var retryBtn = _el('button', 'cp-acbc-retry-btn');
      retryBtn.textContent = 'Try New Number';
      retryBtn.addEventListener('click', function () {
        _additionLabResult = null; /* force fresh generation on re-render */
        renderPage(page.id);
      });

      btnRow.appendChild(nextBtn);
      btnRow.appendChild(retryBtn);
      wrap.appendChild(btnRow);

      if (typeof anime !== 'undefined') {
        anime.set(btnRow, { opacity: 0, translateY: 12 });
        anime({
          targets: btnRow, opacity: 1, translateY: 0, duration: 450, easing: 'easeOutBack',
          complete: function () {
            anime({ targets: nextBtn, scale: [1, 1.03, 1], duration: 900, loop: true, easing: 'easeInOutSine' });
          }
        });
      }
    }

    function onSubmit() {
      if (solved) return;
      var digit = parseInt(inputBuffer, 10);
      if (isNaN(digit)) {
        showStatus('Tap a digit on the pad first.', 'warn');
        return;
      }

      var expected = ansArr[activeCol];
      var cell = ansCells[activeCol];

      if (digit === expected) {
        cell.textContent = String(digit);
        cell.classList.add('cp-acbc-ans-cell--correct');
        cell.classList.remove('cp-acbc-cell--active');
        if (typeof playCorrect === 'function') playCorrect();
        if (typeof anime !== 'undefined') {
          anime.set(cell, { scale: 0.8 });
          anime({ targets: cell, scale: [0.8, 1.12, 1], duration: 280, easing: 'easeOutBack' });
        }

        var prevCol = activeCol - 1;
        if (prevCol >= 0 && carryArr[prevCol] > 0) {
          showStatus('Correct. Carry 1 to the next place.', 'correct');
          setTimeout(function () { animateCarry(prevCol); }, 200);
        } else {
          showStatus('Correct!', 'correct');
        }

        if (activeCol > 0) {
          var nextCol = activeCol - 1;
          setTimeout(function () {
            if (_currentPageId === page.id) setActiveCol(nextCol);
          }, 400);
        } else {
          setTimeout(function () {
            if (_currentPageId === page.id) onComplete();
          }, 500);
        }
      } else {
        if (typeof anime !== 'undefined') {
          anime({ targets: cell, translateX: [0, -5, 5, -3, 3, 0], duration: 360, easing: 'easeInOutSine' });
        }
        if (typeof playWrong === 'function') playWrong();
        showStatus('Not quite. Hint: add only the highlighted column, including any carry shown above it.', 'error');
        inputBuffer = '';
        cell.textContent = '';
      }
    }

    /* ── Numpad event handlers — digit auto-submits immediately ── */
    padKeys.forEach(function (k) {
      padBtns[k].addEventListener('click', function () {
        if (solved) return;
        if (typeof playTick === 'function') playTick();
        if (k === 'Clear' || k === 'Del') {
          inputBuffer = '';
          ansCells[activeCol].textContent = '';
        } else {
          inputBuffer = k;
          ansCells[activeCol].textContent = k;
          if (typeof anime !== 'undefined') {
            anime.set(ansCells[activeCol], { scale: 0.85 });
            anime({ targets: ansCells[activeCol], scale: 1, duration: 150, easing: 'easeOutBack',
                    complete: onSubmit });
          } else {
            onSubmit();
          }
        }
      });
    });

    submitBtn.style.display = 'none';

    /* ── Entry animations ── */
    if (typeof anime !== 'undefined') {
      anime.set([titleEl, subtitleEl], { opacity: 0, translateY: -8 });
      anime({ targets: [titleEl, subtitleEl], opacity: 1, translateY: 0,
              duration: 500, delay: anime.stagger(120), easing: 'easeOutQuad' });
      anime.set(boardWrap, { opacity: 0, translateX: -30 });
      anime({ targets: boardWrap, opacity: 1, translateX: 0, duration: 500, delay: 600, easing: 'easeOutQuad' });
      anime.set(numpad, { opacity: 0, translateX: 30 });
      anime({ targets: numpad, opacity: 1, translateX: 0, duration: 500, delay: 600, easing: 'easeOutQuad' });
      var digitCells = Array.prototype.slice.call(topRowEl.querySelectorAll('.cp-acbc-cell'))
                       .concat(Array.prototype.slice.call(botRowEl.querySelectorAll('.cp-acbc-cell')));
      anime.set(digitCells, { scale: 0, opacity: 0 });
      anime({ targets: digitCells, scale: 1, opacity: 1,
              duration: 280, delay: anime.stagger(60, { start: 1300 }), easing: 'easeOutBack' });
    }

    /* ── Initial state ── */
    setActiveCol(6);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 2.3 — Split Methods  (.cp-sm-*)
  ══════════════════════════════════════════════════════ */

  function _renderSplitMethods(page, area) {

    /* ── DOM ── */
    var wrap = _el('div', 'cp-sm');
    wrap.dataset.pageId = page.id;

    var titleEl = _el('h1', 'cp-title');
    titleEl.textContent = page.title || 'Different Methods To Add Two Numbers';
    wrap.appendChild(titleEl);

    var subtitleEl = _el('p', 'cp-sm-subtitle');
    subtitleEl.textContent = 'Method 1: Tap each number to split it into large parts and the last 3 digits, then find the total.';
    wrap.appendChild(subtitleEl);

    var statusEl = _el('p', 'cp-sm-status');
    wrap.appendChild(statusEl);

    var body = _el('div', 'cp-sm-body');

    /* ── Left column ── */
    var leftCol = _el('div', 'cp-sm-left');

    /* M1 block */
    var m1Block = _el('div', 'cp-sm-m1');

    var cardsRow = _el('div', 'cp-sm-cards-row');
    var cardA = _el('div', 'cp-sm-card cp-sm-card--glow');
    cardA.textContent = '24,73,651';
    cardA.setAttribute('role', 'button');
    cardA.setAttribute('tabindex', '0');
    cardA.setAttribute('aria-label', 'Tap to expand 24,73,651');

    var opSpan = _el('span', 'cp-sm-op');
    opSpan.textContent = '+';
    opSpan.setAttribute('aria-hidden', 'true');

    var cardB = _el('div', 'cp-sm-card cp-sm-card--dim');
    cardB.textContent = '13,24,876';
    cardB.setAttribute('role', 'button');
    cardB.setAttribute('tabindex', '0');
    cardB.setAttribute('aria-label', 'Tap to expand 13,24,876');

    cardsRow.appendChild(cardA);
    cardsRow.appendChild(opSpan);
    cardsRow.appendChild(cardB);
    m1Block.appendChild(cardsRow);

    var expandA = _el('div', 'cp-sm-expand cp-sm-expand--a');
    expandA.style.display = 'none';
    m1Block.appendChild(expandA);

    var expandB = _el('div', 'cp-sm-expand cp-sm-expand--b');
    expandB.style.display = 'none';
    m1Block.appendChild(expandB);

    var sumsBlock = _el('div', 'cp-sm-sums');
    sumsBlock.style.display = 'none';
    var sumData = [
      '24,00,000 + 13,00,000 = 37,00,000',
      '73,000 + 24,000 = 97,000',
      '651 + 876 = 1,527'
    ];
    sumData.forEach(function (txt) {
      var row = _el('div', 'cp-sm-sum-row');
      row.textContent = txt;
      sumsBlock.appendChild(row);
    });
    var sumsHint = _el('p', 'cp-sm-sums-hint');
    sumsHint.style.display = 'none';
    sumsBlock.appendChild(sumsHint);
    m1Block.appendChild(sumsBlock);
    leftCol.appendChild(m1Block);

    /* M2 block — hidden until M1 solved */
    var m2Block = _el('div', 'cp-sm-m2');
    m2Block.style.display = 'none';

    var probBox = _el('div', 'cp-sm-prob-box cp-sm-prob-box--glow');
    probBox.textContent = '18,46,320 + 12,53,480';
    probBox.setAttribute('role', 'button');
    probBox.setAttribute('tabindex', '0');
    probBox.setAttribute('aria-label', 'Tap to expand 18,46,320 + 12,53,480');
    m2Block.appendChild(probBox);

    var expandFull = _el('div', 'cp-sm-expand-full');
    expandFull.style.display = 'none';
    m2Block.appendChild(expandFull);
    leftCol.appendChild(m2Block);
    body.appendChild(leftCol);

    /* ── Right column (input + numpad) ── */
    var rightCol = _el('div', 'cp-sm-right');
    rightCol.style.display = 'none';

    var inputDisplay = _el('div', 'cp-sm-input-display');
    inputDisplay.textContent = '?';
    inputDisplay.setAttribute('aria-live', 'polite');
    rightCol.appendChild(inputDisplay);

    var numpad = _el('div', 'cp-sm-numpad');
    var padGrid = _el('div', 'cp-sm-pad-grid');
    var padKeys = ['1','2','3','4','5','6','7','8','9','Clear','0','Del'];
    var padBtns = {};
    padKeys.forEach(function (k) {
      var isCtrl = (k === 'Clear' || k === 'Del');
      var btn = _el('button', 'cp-sm-pad-btn' + (isCtrl ? ' cp-sm-pad-btn--ctrl' : ''));
      btn.textContent = k;
      btn.setAttribute('aria-label', k);
      padGrid.appendChild(btn);
      padBtns[k] = btn;
    });
    numpad.appendChild(padGrid);
    rightCol.appendChild(numpad);

    body.appendChild(rightCol);
    wrap.appendChild(body);

    /* ── Bottom action row (centre, outside body) ── */
    var actionRow = _el('div', 'cp-sm-action-row');

    var showM2Btn = _el('button', 'cp-btn-primary cp-sm-show-m2-btn');
    showM2Btn.textContent = 'Show Method 2 →';
    showM2Btn.style.display = 'none';
    actionRow.appendChild(showM2Btn);

    var nextBtn = _el('button', 'cp-btn-primary cp-sm-next-btn');
    nextBtn.textContent = 'Next →';
    nextBtn.style.display = 'none';
    actionRow.appendChild(nextBtn);

    wrap.appendChild(actionRow);
    area.appendChild(wrap);

    /* ── State ── */
    var m1Stage    = 0;   /* 0=initial 1=A-tapped 2=B-tapped(sums shown) 3=correct */
    var m2Stage    = 0;   /* 0=initial 1=box-tapped 2=correct */
    var activeStage = 'm1';
    var m1Buf      = '';
    var m2Buf      = '';

    /* ── Helpers ── */
    function showStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className = 'cp-sm-status' + (type ? ' cp-sm-status--' + type : '');
      if (typeof anime !== 'undefined') {
        anime.set(statusEl, { opacity: 0, translateY: 4 });
        anime({ targets: statusEl, opacity: 1, translateY: 0, duration: 280, easing: 'easeOutQuad' });
      }
    }

    function typewriterTo(el, text, charDelay, doneCb) {
      var i = 0;
      el.textContent = '';
      function next() {
        if (_currentPageId !== page.id) return;
        if (i >= text.length) { if (doneCb) doneCb(); return; }
        el.textContent += text[i++];
        setTimeout(next, charDelay);
      }
      next();
    }

    function slideIn(el) {
      el.style.display = '';
      if (typeof anime !== 'undefined') {
        anime.set(el, { opacity: 0, translateY: 16 });
        anime({ targets: el, opacity: 1, translateY: 0, duration: 380, easing: 'easeOutQuad' });
      }
    }

    function flashCard(el, doneCb) {
      if (typeof anime !== 'undefined') {
        anime({ targets: el, scale: [1, 1.08, 1], duration: 260, easing: 'easeOutBack',
                complete: function () { if (doneCb) doneCb(); } });
      } else {
        if (doneCb) doneCb();
      }
    }

    function spawnConfettiAt(anchorEl) {
      if (typeof anime === 'undefined') return;
      var aRect = anchorEl.getBoundingClientRect();
      var wRect = wrap.getBoundingClientRect();
      var cx = aRect.left + aRect.width / 2 - wRect.left;
      var cy = aRect.top - wRect.top;
      var colors = ['#60a5fa','#f59e0b','#34d399','#f472b6','#a78bfa','#fb923c'];
      for (var di = 0; di < 14; di++) {
        (function (idx) {
          var dot = document.createElement('div');
          dot.style.cssText = 'position:absolute;width:7px;height:7px;border-radius:50%;' +
            'left:' + cx + 'px;top:' + cy + 'px;background:' + colors[idx % colors.length] +
            ';pointer-events:none;z-index:20;';
          wrap.appendChild(dot);
          var angle = (idx / 14) * Math.PI * 2;
          var dist  = 44 + (idx % 3) * 24;
          anime({ targets: dot,
            translateX: Math.cos(angle) * dist,
            translateY: Math.sin(angle) * dist - 32,
            opacity: [1, 0], scale: [1.2, 0.2],
            duration: 650 + (idx % 4) * 90, easing: 'easeOutCubic',
            complete: function () { if (dot.parentNode) dot.parentNode.removeChild(dot); } });
        }(di));
      }
    }

    function updateDisplay(buf) {
      inputDisplay.textContent = buf.length > 0 ? buf : '?';
    }

    function shakeDisplay() {
      if (typeof anime !== 'undefined') {
        anime({ targets: inputDisplay,
          translateX: [0,-6,6,-4,4,-2,2,0], duration: 420, easing: 'easeInOutSine' });
      }
    }

    function greenBounce() {
      inputDisplay.classList.add('cp-sm-input-display--correct');
      if (typeof anime !== 'undefined') {
        anime.set(inputDisplay, { scale: 0.9 });
        anime({ targets: inputDisplay, scale: [0.9,1.1,1], duration: 340, easing: 'easeOutBack' });
      }
    }

    function showRightPanel() {
      if (rightCol.style.display !== 'none') return;
      rightCol.style.display = '';
      if (typeof anime !== 'undefined') {
        anime.set(rightCol, { opacity: 0, translateX: 28 });
        anime({ targets: rightCol, opacity: 1, translateX: 0, duration: 440, easing: 'easeOutQuad' });
      }
    }

    /* ── M1 key handler ── */
    function m1OnKey(k) {
      if (m1Stage !== 2) return;
      if (k === 'Clear') {
        m1Buf = '';
        inputDisplay.classList.remove('cp-sm-input-display--error');
        updateDisplay(m1Buf);
        return;
      }
      if (k === 'Del') {
        m1Buf = m1Buf.slice(0, -1);
        inputDisplay.classList.remove('cp-sm-input-display--error');
        updateDisplay(m1Buf);
        return;
      }
      if (m1Buf.length >= 7) return;
      m1Buf += k;
      updateDisplay(m1Buf);
      if (m1Buf.length === 7) {
        if (parseInt(m1Buf, 10) === 3798527) {
          m1Stage = 3;
          if (typeof playCorrect === 'function') playCorrect();
          greenBounce();
          spawnConfettiAt(inputDisplay);
          showStatus('Correct! You combined the three partial sums correctly.', 'correct');
          setTimeout(function () {
            if (_currentPageId !== page.id) return;
            showM2Btn.style.display = '';
            if (typeof anime !== 'undefined') {
              anime.set(showM2Btn, { opacity: 0, translateY: 10 });
              anime({ targets: showM2Btn, opacity: 1, translateY: 0, duration: 380, easing: 'easeOutBack',
                complete: function () {
                  anime({ targets: showM2Btn, scale: [1,1.04,1], duration: 900, loop: true, easing: 'easeInOutSine' });
                }
              });
            }
          }, 600);
        } else {
          if (typeof playWrong === 'function') playWrong();
          inputDisplay.classList.add('cp-sm-input-display--error');
          shakeDisplay();
          showStatus('Not quite. Hint: add 37,00,000 + 97,000 + 1,527 to get the final total.', 'error');
          sumsHint.textContent = 'Try: 37,00,000 + 97,000 + 1,527';
          sumsHint.style.display = '';
          setTimeout(function () {
            if (_currentPageId !== page.id) return;
            m1Buf = '';
            inputDisplay.classList.remove('cp-sm-input-display--error');
            updateDisplay(m1Buf);
          }, 1200);
        }
      }
    }

    /* ── M2 key handler ── */
    function m2OnKey(k) {
      if (m2Stage !== 1) return;
      if (k === 'Clear') {
        m2Buf = '';
        inputDisplay.classList.remove('cp-sm-input-display--error');
        updateDisplay(m2Buf);
        return;
      }
      if (k === 'Del') {
        m2Buf = m2Buf.slice(0, -1);
        inputDisplay.classList.remove('cp-sm-input-display--error');
        updateDisplay(m2Buf);
        return;
      }
      if (m2Buf.length >= 7) return;
      m2Buf += k;
      updateDisplay(m2Buf);
      if (m2Buf.length === 7) {
        if (parseInt(m2Buf, 10) === 3099800) {
          m2Stage = 2;
          if (typeof playCorrect === 'function') playCorrect();
          greenBounce();
          spawnConfettiAt(inputDisplay);
          if (typeof playComplete === 'function') playComplete();
          showStatus('Correct! You combined both parts of the addition accurately.', 'correct');
          setTimeout(function () {
            if (_currentPageId !== page.id) return;
            nextBtn.style.display = '';
            if (typeof anime !== 'undefined') {
              anime.set(nextBtn, { opacity: 0, translateY: 10 });
              anime({ targets: nextBtn, opacity: 1, translateY: 0, duration: 380, easing: 'easeOutBack',
                complete: function () {
                  anime({ targets: nextBtn, scale: [1,1.04,1], duration: 900, loop: true, easing: 'easeInOutSine' });
                }
              });
            }
          }, 600);
        } else {
          if (typeof playWrong === 'function') playWrong();
          inputDisplay.classList.add('cp-sm-input-display--error');
          shakeDisplay();
          showStatus('Not quite. Hint: add all the expanded parts carefully, then enter the final total.', 'error');
          setTimeout(function () {
            if (_currentPageId !== page.id) return;
            m2Buf = '';
            inputDisplay.classList.remove('cp-sm-input-display--error');
            updateDisplay(m2Buf);
          }, 1200);
        }
      }
    }

    /* ── Unified numpad handler ── */
    padKeys.forEach(function (k) {
      padBtns[k].addEventListener('click', function () {
        if (typeof playTick === 'function') playTick();
        if (activeStage === 'm1') m1OnKey(k);
        else m2OnKey(k);
      });
    });

    /* ── Card A tap ── */
    function onCardA() {
      if (m1Stage !== 0) return;
      if (typeof playTick === 'function') playTick();
      flashCard(cardA, function () {
        cardA.classList.remove('cp-sm-card--glow');
        cardA.classList.add('cp-sm-card--settled');
        cardB.classList.remove('cp-sm-card--dim');
        cardB.classList.add('cp-sm-card--glow');
        m1Stage = 1;
        slideIn(expandA);
        typewriterTo(expandA, '24,73,651 = 24,00,000 + 73,000 + 651', 28, null);
        showStatus('Correct. The first number is split into lakh, thousand, and last 3-digit parts.', 'correct');
        setTimeout(function () {
          if (_currentPageId !== page.id) return;
          showStatus('Now tap the second number.', 'info');
        }, 1800);
      });
    }
    cardA.addEventListener('click', onCardA);
    cardA.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardA(); }
    });

    /* ── Card B tap ── */
    function onCardB() {
      if (m1Stage === 0) {
        showStatus('Tap the glowing first number to reveal its expanded form.', 'warn');
        return;
      }
      if (m1Stage !== 1) return;
      if (typeof playTick === 'function') playTick();
      flashCard(cardB, function () {
        cardB.classList.remove('cp-sm-card--glow');
        cardB.classList.add('cp-sm-card--settled');
        m1Stage = 2;
        slideIn(expandB);
        typewriterTo(expandB, '13,24,876 = 13,00,000 + 24,000 + 876', 28, function () {
          setTimeout(function () {
            if (_currentPageId !== page.id) return;
            slideIn(sumsBlock);
            showStatus('Look at the three partial sums, then write the final total.', 'info');
            setTimeout(function () {
              if (_currentPageId !== page.id) return;
              showRightPanel();
            }, 300);
          }, 500);
        });
      });
    }
    cardB.addEventListener('click', onCardB);
    cardB.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardB(); }
    });

    /* ── Prob box tap (M2) ── */
    function onProbBox() {
      if (m2Stage !== 0) return;
      m2Stage = 1;
      probBox.classList.remove('cp-sm-prob-box--glow');
      if (typeof playTick === 'function') playTick();
      flashCard(probBox, null);
      expandFull.style.display = '';
      if (typeof anime !== 'undefined') {
        anime.set(expandFull, { opacity: 0, translateY: 16 });
        anime({ targets: expandFull, opacity: 1, translateY: 0, duration: 380, easing: 'easeOutQuad' });
      }
      var m2Lines = [
        '18,46,320 + 12,53,480',
        '= 18,00,000 + 46,000 + 300 + 20',
        '+ 12,00,000 + 53,000 + 400 + 80',
        'Add all these parts and write the final total sum.'
      ];
      var lineIdx = 0;
      function showNextLine() {
        if (_currentPageId !== page.id) return;
        if (lineIdx >= m2Lines.length) {
          showStatus('Both numbers are shown in full expanded form. Add all the parts and write the total sum.', 'info');
          return;
        }
        var lineEl = _el('p', 'cp-sm-expand-line');
        expandFull.appendChild(lineEl);
        typewriterTo(lineEl, m2Lines[lineIdx], 20, function () {
          lineIdx++;
          setTimeout(showNextLine, 200);
        });
      }
      showNextLine();
    }
    probBox.addEventListener('click', onProbBox);
    probBox.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onProbBox(); }
    });

    /* ── Show Method 2 transition ── */
    showM2Btn.addEventListener('click', function () {
      showM2Btn.style.display = 'none';
      m2Buf = '';
      inputDisplay.classList.remove('cp-sm-input-display--correct', 'cp-sm-input-display--error');
      updateDisplay(m2Buf);
      if (typeof anime !== 'undefined') {
        anime({ targets: m1Block, opacity: 0, translateY: -12, duration: 480, easing: 'easeInQuad',
          complete: function () {
            m1Block.style.display = 'none';
            m2Block.style.display = '';
            anime.set(m2Block, { opacity: 0, translateY: 16 });
            anime({ targets: m2Block, opacity: 1, translateY: 0, duration: 420, easing: 'easeOutQuad',
              complete: function () {
                anime.set(probBox, { scale: 0.88 });
                anime({ targets: probBox, scale: 1, duration: 320, easing: 'easeOutBack' });
              }
            });
          }
        });
      } else {
        m1Block.style.display = 'none';
        m2Block.style.display = '';
      }
      subtitleEl.textContent = 'Method 2: Tap the box to reveal both numbers in full expanded form, then find the total sum.';
      if (typeof anime !== 'undefined') {
        anime.set(subtitleEl, { opacity: 0 });
        anime({ targets: subtitleEl, opacity: 1, duration: 320, easing: 'easeOutQuad' });
      }
      activeStage = 'm2';
      showStatus('Tap the box to reveal both numbers in expanded form.', 'info');
    });

    /* ── Next button ── */
    nextBtn.addEventListener('click', function () {
      if (page.next) renderPage(page.next);
    });

    /* ── Entry animations ── */
    if (typeof anime !== 'undefined') {
      anime.set([titleEl, subtitleEl, statusEl], { opacity: 0, translateY: -10 });
      anime({ targets: [titleEl, subtitleEl, statusEl], opacity: 1, translateY: 0,
              duration: 480, delay: anime.stagger(100), easing: 'easeOutQuad' });
      anime.set(m1Block, { opacity: 0, translateX: -20 });
      anime({ targets: m1Block, opacity: 1, translateX: 0, duration: 460, delay: 340, easing: 'easeOutQuad' });
    }

    /* ── Initial instruction ── */
    setTimeout(function () {
      if (_currentPageId !== page.id) return;
      showStatus('Tap the first number.', 'info');
    }, 900);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 2.4 — Addition Practice (Word Problem)
  ══════════════════════════════════════════════════════ */
  function _renderAdditionPractice(page, area) {

    if (typeof playIntroChime === 'function') playIntroChime();

    /* ── DOM ── */
    var wrap = _el('div', 'cp-ap');
    wrap.dataset.pageId = page.id;

    var titleEl = _el('h1', 'cp-title');
    titleEl.textContent = page.title || 'Addition Practice';
    wrap.appendChild(titleEl);

    /* Story card */
    var storyCard = _el('div', 'cp-ap-story');

    var storyText = _el('p', 'cp-ap-story-text');
    storyText.textContent = 'A city metro system recorded passenger trips on one weekend.';
    storyCard.appendChild(storyText);

    var satRow = _el('div', 'cp-ap-data-row');
    var satLabel = _el('span', 'cp-ap-data-label');
    satLabel.textContent = 'Saturday:';
    var satVal = _el('span', 'cp-ap-data-val');
    satVal.textContent = '4,86,750';
    satRow.appendChild(satLabel);
    satRow.appendChild(satVal);
    storyCard.appendChild(satRow);

    var sunRow = _el('div', 'cp-ap-data-row');
    var sunLabel = _el('span', 'cp-ap-data-label');
    sunLabel.textContent = 'Sunday:';
    var sunVal = _el('span', 'cp-ap-data-val');
    sunVal.textContent = '2,79,865';
    sunRow.appendChild(sunLabel);
    sunRow.appendChild(sunVal);
    storyCard.appendChild(sunRow);

    var goalLine = _el('p', 'cp-ap-goal');
    goalLine.textContent = 'Find the total number of passenger trips.';
    storyCard.appendChild(goalLine);

    wrap.appendChild(storyCard);

    /* Status */
    var statusEl = _el('p', 'cp-ap-status');
    wrap.appendChild(statusEl);

    /* Body */
    var body = _el('div', 'cp-ap-body');

    /* Work area */
    var workArea = _el('div', 'cp-ap-work');
    var equation = _el('div', 'cp-ap-equation');

    var digits1 = ['4','8','6','7','5','0'];
    var digits2 = ['2','7','9','8','6','5'];
    var colEls  = [[], [], [], [], [], []]; /* [colIndex][0=top,1=bot] */

    /* Row 1 — first number */
    var row1 = _el('div', 'cp-ap-num-row');
    var opPlaceholder = _el('span', 'cp-ap-op-placeholder');
    row1.appendChild(opPlaceholder);
    digits1.forEach(function (d, i) {
      var cell = _el('span', 'cp-ap-digit cp-ap-digit--top');
      cell.textContent = d;
      cell.dataset.col = i;
      row1.appendChild(cell);
      colEls[i].push(cell);
    });
    equation.appendChild(row1);

    /* Row 2 — second number with + sign */
    var row2 = _el('div', 'cp-ap-num-row');
    var opSign = _el('span', 'cp-ap-op-sign');
    opSign.textContent = '+';
    row2.appendChild(opSign);
    digits2.forEach(function (d, i) {
      var cell = _el('span', 'cp-ap-digit cp-ap-digit--bottom');
      cell.textContent = d;
      cell.dataset.col = i;
      row2.appendChild(cell);
      colEls[i].push(cell);
    });
    equation.appendChild(row2);

    /* Divider */
    var divider = _el('div', 'cp-ap-divider');
    equation.appendChild(divider);

    /* Answer display */
    var answerDisplay = _el('div', 'cp-ap-answer-display');
    answerDisplay.textContent = '';
    answerDisplay.setAttribute('aria-live', 'polite');
    answerDisplay.setAttribute('aria-label', 'Answer');
    equation.appendChild(answerDisplay);

    workArea.appendChild(equation);
    body.appendChild(workArea);

    /* Numpad */
    var numpad = _el('div', 'cp-ap-numpad');
    var padGrid = _el('div', 'cp-ap-pad-grid');
    var padKeys = ['1','2','3','4','5','6','7','8','9','Clear','0','Del'];
    var padBtns = {};
    padKeys.forEach(function (k) {
      var isCtrl = (k === 'Clear' || k === 'Del');
      var btn = _el('button', 'cp-ap-pad-btn' + (isCtrl ? ' cp-ap-pad-btn--ctrl' : ''));
      btn.textContent = k;
      btn.setAttribute('aria-label', k);
      padGrid.appendChild(btn);
      padBtns[k] = btn;
    });
    numpad.appendChild(padGrid);
    body.appendChild(numpad);
    wrap.appendChild(body);

    /* Next button — hidden until correct */
    var nextBtn = _el('button', 'cp-ap-next-btn');
    nextBtn.textContent = 'Next: Subtraction Lab →';
    nextBtn.style.display = 'none';
    wrap.appendChild(nextBtn);

    area.appendChild(wrap);

    /* ── State ── */
    var buf        = '';
    var wrongCount = 0;
    var solved     = false;
    var hintShown  = false;
    var hintCard   = null;
    var pulseTween = null;

    /* ── Helpers ── */

    function formatIndian(n) {
      n = Math.floor(n);
      if (n === 0) return '0';
      var s = String(n);
      var result = s.slice(-3);
      s = s.slice(0, -3);
      while (s.length > 0) {
        result = s.slice(-2) + ',' + result;
        s = s.slice(0, -2);
      }
      return result;
    }

    function showStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className   = 'cp-ap-status' + (type ? ' cp-ap-status--' + type : '');
      if (typeof anime !== 'undefined') {
        anime.set(statusEl, { opacity: 0, translateY: 4 });
        anime({ targets: statusEl, opacity: 1, translateY: 0, duration: 280, easing: 'easeOutQuad' });
      }
    }

    function highlightColumn(typedLen) {
      colEls.forEach(function (col, i) {
        col.forEach(function (cell) {
          if (i === typedLen && typedLen < 6) {
            cell.classList.add('cp-ap-digit--active-col');
          } else {
            cell.classList.remove('cp-ap-digit--active-col');
          }
        });
      });
    }

    function updateDisplay(val) {
      answerDisplay.textContent = val;
      highlightColumn(val.length);
    }

    function shakeDisplay() {
      if (typeof anime !== 'undefined') {
        anime({ targets: answerDisplay,
          translateX: [0, -8, 8, -6, 6, -3, 3, 0],
          duration: 420, easing: 'linear' });
      }
    }

    function bounceDisplay() {
      if (typeof anime !== 'undefined') {
        anime({ targets: answerDisplay,
          scale: [1, 1.12, 0.95, 1.05, 1],
          duration: 560, easing: 'easeOutElastic(1, 0.6)' });
      }
    }

    function spawnConfetti() {
      var container = _el('div', 'cp-ap-confetti');
      workArea.appendChild(container);
      var colors = ['#60a5fa','#f59e0b','#34d399','#f472b6','#a78bfa','#fb923c'];
      var pieces = [];
      for (var i = 0; i < 20; i++) {
        var piece = _el('div', 'cp-ap-confetti-piece');
        piece.style.background = colors[i % colors.length];
        piece.style.left  = '50%';
        piece.style.top   = '50%';
        container.appendChild(piece);
        pieces.push(piece);
      }
      if (typeof anime !== 'undefined') {
        pieces.forEach(function (p, idx) {
          var angle    = (idx / 20) * Math.PI * 2;
          var distance = 50 + Math.random() * 50;
          anime({
            targets: p,
            translateX: Math.cos(angle) * distance,
            translateY: Math.sin(angle) * distance,
            opacity:    [1, 0],
            scale:      [1.2, 0.2],
            duration:   650 + Math.random() * 300,
            easing:     'easeOutCubic',
            complete:   function () { if (container.parentNode) container.parentNode.removeChild(container); }
          });
        });
      } else {
        setTimeout(function () {
          if (container.parentNode) container.parentNode.removeChild(container);
        }, 1200);
      }
    }

    function showHintCard() {
      if (hintCard) return;
      hintCard = _el('div', 'cp-ap-hint-card');
      var lines = [
        'Ones:    0 + 5 = 5',
        'Tens:    5 + 6 = 11, carry 1',
        'Hundreds: 7 + 8 + 1 = 16, carry 1',
        'Thousands: 6 + 9 + 1 = 16, carry 1',
        'Ten-Th:  8 + 7 + 1 = 16, carry 1',
        'Lakhs:   4 + 2 + 1 = 7'
      ];
      lines.forEach(function (line) {
        var p = _el('p', 'cp-ap-hint-line');
        p.textContent = line;
        hintCard.appendChild(p);
      });
      workArea.insertBefore(hintCard, workArea.firstChild);
      if (typeof playHintPop === 'function') playHintPop();
      if (typeof anime !== 'undefined') {
        anime.set(hintCard, { opacity: 0, translateY: -10 });
        anime({ targets: hintCard, opacity: 1, translateY: 0, duration: 350, easing: 'easeOutQuad',
          complete: function () {
            setTimeout(function () {
              if (!hintCard) return;
              anime({ targets: hintCard, opacity: 0, translateY: -10, duration: 400, easing: 'easeInQuad',
                complete: function () {
                  if (hintCard && hintCard.parentNode) hintCard.parentNode.removeChild(hintCard);
                  hintCard = null;
                }
              });
            }, 2500);
          }
        });
      } else {
        setTimeout(function () {
          if (hintCard && hintCard.parentNode) hintCard.parentNode.removeChild(hintCard);
          hintCard = null;
        }, 2900);
      }
    }

    /* ── Key / submit handlers ── */

    function onKey(k) {
      if (solved) return;
      if (k === 'Clear') {
        buf = '';
        updateDisplay(buf);
        showStatus('', '');
      } else if (k === 'Del') {
        buf = buf.slice(0, -1);
        updateDisplay(buf);
      } else if (/^[0-9]$/.test(k) && buf.length < 6) {
        buf += k;
        updateDisplay(buf);
        if (typeof playTick === 'function') playTick();
        if (buf.length === 6) {
          setTimeout(function () { handleSubmit(); }, 120);
        }
      }
    }

    function handleSubmit() {
      if (_currentPageId !== page.id) return;
      if (solved) return;
      if (typeof initAudio === 'function') initAudio();

      if (buf === '') {
        showStatus('Please enter your answer first.', 'warn');
        return;
      }

      if (buf === '766615') {
        /* Correct */
        solved = true;

        /* Stop pulse loop */
        if (pulseTween && typeof pulseTween.pause === 'function') pulseTween.pause();

        if (typeof playCorrect === 'function') playCorrect();
        setTimeout(function () { if (typeof playComplete === 'function') playComplete(); }, 300);
        setTimeout(function () { if (typeof playStarPop  === 'function') playStarPop();  }, 500);

        answerDisplay.classList.add('cp-ap-answer--correct');
        bounceDisplay();

        goalLine.textContent = '✓ Find the total number of passenger trips.';
        goalLine.classList.add('cp-ap-goal--done');

        showStatus('Correct! Total passenger trips = 7,66,615', 'correct');
        spawnConfetti();

        /* Clear column highlights */
        colEls.forEach(function (col) {
          col.forEach(function (cell) { cell.classList.remove('cp-ap-digit--active-col'); });
        });

        /* Show next button */
        setTimeout(function () {
          if (_currentPageId !== page.id) return;
          nextBtn.style.display = '';
          if (typeof anime !== 'undefined') {
            anime.set(nextBtn, { opacity: 0, translateY: 20 });
            anime({ targets: nextBtn, opacity: 1, translateY: 0, duration: 480, easing: 'easeOutBack' });
          }
          if (typeof playTick === 'function') playTick();
        }, 600);

      } else {
        /* Wrong */
        wrongCount++;
        if (typeof playWrong === 'function') playWrong();

        answerDisplay.classList.add('cp-ap-answer--wrong');
        shakeDisplay();

        setTimeout(function () {
          answerDisplay.classList.remove('cp-ap-answer--wrong');
          buf = '';
          updateDisplay(buf);
        }, 600);

        showStatus('Not quite. Hint: recheck the Hundreds and Thousands places after carrying.', 'error');

        if (wrongCount >= 2 && !hintShown) {
          hintShown = true;
          setTimeout(function () {
            if (_currentPageId !== page.id) return;
            showHintCard();
          }, 700);
        }
      }
    }

    /* ── Event listeners ── */

    padKeys.forEach(function (k) {
      padBtns[k].addEventListener('click', function () { onKey(k); });
    });

    nextBtn.addEventListener('click', function () {
      if (typeof playFlipWhoosh === 'function') playFlipWhoosh();
      if (typeof anime !== 'undefined') {
        anime({ targets: wrap, opacity: 0, translateX: -40, duration: 380, easing: 'easeInQuad',
          complete: function () { if (page.next) renderPage(page.next); }
        });
      } else {
        if (page.next) renderPage(page.next);
      }
    });

    function onKeydown(e) {
      if (_currentPageId !== page.id) { document.removeEventListener('keydown', onKeydown); return; }
      if (e.key >= '0' && e.key <= '9')   { e.preventDefault(); onKey(e.key); }
      else if (e.key === 'Backspace')      { e.preventDefault(); onKey('Del'); }
      else if (e.key === 'Escape')         { e.preventDefault(); onKey('Clear'); }
    }
    document.addEventListener('keydown', onKeydown);

    /* ── Entry animations ── */

    if (typeof anime !== 'undefined') {

      /* Title */
      anime.set(titleEl, { opacity: 0, translateY: -16 });
      anime({ targets: titleEl, opacity: 1, translateY: 0, duration: 500, easing: 'easeOutQuad' });

      /* Story card — slides down, then triggers count-up */
      anime.set(storyCard, { opacity: 0, translateY: -20 });
      anime({ targets: storyCard, opacity: 1, translateY: 0, duration: 700, delay: 500,
        easing: 'easeOutQuad',
        complete: function () {
          var satTarget  = 486750;
          var sunTarget  = 279865;
          var startTime  = null;
          var tickStep   = -1;
          var countDur   = 800;

          function countUp(ts) {
            if (_currentPageId !== page.id) return;
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / countDur, 1);
            var step = Math.floor(progress * 8);
            if (step > tickStep) {
              tickStep = step;
              if (typeof playCountUpTick === 'function') playCountUpTick();
            }
            satVal.textContent = formatIndian(Math.floor(satTarget * progress));
            sunVal.textContent = formatIndian(Math.floor(sunTarget * progress));
            if (progress < 1) {
              requestAnimationFrame(countUp);
            } else {
              satVal.textContent = '4,86,750';
              sunVal.textContent = '2,79,865';
              /* Goal pulse */
              setTimeout(function () {
                if (_currentPageId !== page.id) return;
                goalLine.classList.add('cp-ap-goal--pulse');
                if (typeof playHintShimmer === 'function') playHintShimmer();
                setTimeout(function () { goalLine.classList.remove('cp-ap-goal--pulse'); }, 400);
              }, 300);
            }
          }
          requestAnimationFrame(countUp);
        }
      });

      /* Work area slides up */
      anime.set(workArea, { opacity: 0, translateY: 20 });
      anime({ targets: workArea, opacity: 1, translateY: 0, duration: 600, delay: 1400, easing: 'easeOutQuad' });

      /* Numpad slides in from right */
      anime.set(numpad, { opacity: 0, translateX: 40 });
      anime({ targets: numpad, opacity: 1, translateX: 0, duration: 600, delay: 1600, easing: 'easeOutQuad' });

      /* Answer display pulse loop */
      setTimeout(function () {
        if (_currentPageId !== page.id || solved) return;
        pulseTween = anime({
          targets:  answerDisplay,
          scale:    [1, 1.03, 1],
          duration: 1200,
          easing:   'easeInOutSine',
          loop:     true
        });
      }, 2200);

    }

    /* Initial status */
    setTimeout(function () {
      if (_currentPageId !== page.id) return;
      showStatus('Type the total number of passenger trips.', 'info');
    }, 1000);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 3.2 — Subtract Column by Column (.cp-scbc-*)
  ══════════════════════════════════════════════════════ */

  function _renderSubtractColumnByColumn(page, area) {

    function _toInd(numStr) {
      var str = numStr.replace(/^0+/, '') || '0';
      if (str.length <= 3) return str;
      var r = str.slice(-3);
      var rem = str.slice(0, -3);
      while (rem.length > 2) { r = rem.slice(-2) + ',' + r; rem = rem.slice(0, -2); }
      return rem ? rem + ',' + r : r;
    }

    /* ── Data from 3.1 ── */
    var labData = _subtractionLabResult;
    var firstNumber, secondNumber;
    if (labData) {
      firstNumber  = labData.firstNumber;
      secondNumber = labData.secondNumber;
    } else {
      /* Fallback: generate fresh pair (should not occur in normal flow) */
      function _toD8b(n) {
        var s = String(n);
        while (s.length < 8) s = '0' + s;
        return s.split('');
      }
      var _t = Math.floor(Math.random() * (6999999 - 300000 + 1)) + 300000;
      var _b = Math.floor(Math.random() * (Math.min(2999999, _t - 1000) - 100000 + 1)) + 100000;
      firstNumber  = { digits8: _toD8b(_t), value: _t };
      secondNumber = { digits8: _toD8b(_b), value: _b };
      _subtractionLabResult = { firstNumber: firstNumber, secondNumber: secondNumber };
    }

    /* 7-digit arrays: drop the C column (index 0) */
    var top7    = firstNumber.digits8.slice(1);
    var bot7    = secondNumber.digits8.slice(1);
    var workTop = top7.map(Number);   /* mutable; modified by each borrow */

    function _leadingZeros(arr) {
      var z = 0;
      while (z < arr.length - 1 && arr[z] === '0') z++;
      return z;
    }
    var topLeading = _leadingZeros(top7);
    var botLeading = _leadingZeros(bot7);

    /* ── DOM ── */
    var wrap = _el('div', 'cp-scbc');
    wrap.dataset.pageId = page.id;

    var titleEl = _el('h1', 'cp-title');
    titleEl.textContent = page.title || 'Subtract Column by Column';
    wrap.appendChild(titleEl);

    var subtitleEl = _el('p', 'cp-scbc-subtitle');
    subtitleEl.textContent = 'Start from Ones.';
    wrap.appendChild(subtitleEl);

    var statusEl = _el('p', 'cp-scbc-status-msg');
    wrap.appendChild(statusEl);

    var body = _el('div', 'cp-scbc-body');

    /* ── Board side ── */
    var boardWrap = _el('div', 'cp-scbc-board-wrap');

    var opSign = _el('div', 'cp-scbc-op-sign');
    opSign.textContent = '−';
    opSign.setAttribute('aria-hidden', 'true');
    boardWrap.appendChild(opSign);

    var board = _el('div', 'cp-scbc-board');

    /* Header row */
    var headers3 = ['TL', 'L', 'TTh', 'Th', 'H', 'T', 'O'];
    var headerRow3 = _el('div', 'cp-scbc-header-row');
    headers3.forEach(function (h, idx) {
      var cell = _el('div', 'cp-scbc-header-cell');
      cell.textContent = h;
      cell.dataset.col = String(idx);
      headerRow3.appendChild(cell);
    });
    board.appendChild(headerRow3);

    /* Borrow row — shows reduced values above borrowed/active cells */
    var borrowRowEl = _el('div', 'cp-scbc-borrow-row');
    var borrowCells = [];
    for (var bi = 0; bi < 7; bi++) {
      var bc = _el('div', 'cp-scbc-borrow-cell');
      bc.dataset.col = String(bi);
      borrowCells.push(bc);
      borrowRowEl.appendChild(bc);
    }
    board.appendChild(borrowRowEl);

    /* Top row */
    var topRowEl3 = _el('div', 'cp-scbc-row cp-scbc-top-row');
    var topCells = [];
    top7.forEach(function (d, idx) {
      var cell = _el('div', 'cp-scbc-cell cp-scbc-cell--top');
      cell.textContent = idx < topLeading ? '' : d;
      cell.dataset.col = String(idx);
      topCells.push(cell);
      topRowEl3.appendChild(cell);
    });
    board.appendChild(topRowEl3);

    /* Bottom row */
    var botRowEl3 = _el('div', 'cp-scbc-row cp-scbc-bot-row');
    bot7.forEach(function (d, idx) {
      var cell = _el('div', 'cp-scbc-cell cp-scbc-cell--bot');
      cell.textContent = idx < botLeading ? '' : d;
      cell.dataset.col = String(idx);
      botRowEl3.appendChild(cell);
    });
    board.appendChild(botRowEl3);

    board.appendChild(_el('div', 'cp-scbc-divider'));

    /* Answer row */
    var ansRowEl3 = _el('div', 'cp-scbc-row cp-scbc-ans-row');
    var ansCells3 = [];
    for (var ai3 = 0; ai3 < 7; ai3++) {
      var ac3 = _el('div', 'cp-scbc-cell cp-scbc-ans-cell');
      ac3.dataset.col = String(ai3);
      ansCells3.push(ac3);
      ansRowEl3.appendChild(ac3);
    }
    board.appendChild(ansRowEl3);

    boardWrap.appendChild(board);
    body.appendChild(boardWrap);

    /* ── Number pad side ── */
    var numpad3 = _el('div', 'cp-scbc-numpad');

    var borrowBtn = _el('button', 'cp-scbc-borrow-btn');
    borrowBtn.textContent = 'Borrow';
    numpad3.appendChild(borrowBtn);

    var padGrid3 = _el('div', 'cp-scbc-pad-grid');
    var padKeys3 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', 'Del'];
    var padBtns3 = {};
    padKeys3.forEach(function (k) {
      var isCtrl = k === 'Clear' || k === 'Del';
      var btn = _el('button', 'cp-scbc-pad-btn' + (isCtrl ? ' cp-scbc-pad-btn--ctrl' : ''));
      btn.textContent = k;
      btn.setAttribute('aria-label', k);
      padGrid3.appendChild(btn);
      padBtns3[k] = btn;
    });
    numpad3.appendChild(padGrid3);

    body.appendChild(numpad3);
    wrap.appendChild(body);
    area.appendChild(wrap);

    /* ── State ── */
    var activeCol3       = 6;
    var inputBuffer3     = '';
    var solved3          = false;
    var borrowedThisCol  = false;

    /* ── Helpers ── */
    function needsBorrow(col) {
      return workTop[col] < (+bot7[col]);
    }

    function showStatus3(msg, type) {
      statusEl.textContent = msg;
      statusEl.className   = 'cp-scbc-status-msg' + (type ? ' cp-scbc-status-msg--' + type : '');
      if (typeof anime !== 'undefined') {
        anime.set(statusEl, { opacity: 0, translateY: 4 });
        anime({ targets: statusEl, opacity: 1, translateY: 0, duration: 280, easing: 'easeOutQuad' });
      }
    }

    function setActiveCol3(col) {
      activeCol3       = col;
      inputBuffer3     = '';
      borrowedThisCol  = false;
      ansCells3[col].textContent = '';

      /* Toggle active class on all column cells */
      var rows3 = [headerRow3, topRowEl3, botRowEl3, ansRowEl3];
      rows3.forEach(function (row) {
        row.querySelectorAll('[data-col]').forEach(function (cell) {
          cell.classList.toggle('cp-scbc-cell--active', +cell.dataset.col === col);
        });
      });

      /* Borrow button & pulse */
      if (needsBorrow(col)) {
        borrowBtn.classList.add('visible');
        topCells[col].classList.add('cp-scbc-cell--pulse');
        showStatus3(
          'Can ' + workTop[col] + ' subtract ' + bot7[col] + '? Borrow first.',
          'warn'
        );
      } else {
        borrowBtn.classList.remove('visible');
        topCells[col].classList.remove('cp-scbc-cell--pulse');
      }
    }

    function spawnConfetti3(anchorEl) {
      if (typeof anime === 'undefined') return;
      var aRect = anchorEl.getBoundingClientRect();
      var wRect = wrap.getBoundingClientRect();
      var cx = aRect.left + aRect.width / 2 - wRect.left;
      var cy = aRect.top - wRect.top;
      var colors = ['#60a5fa', '#f59e0b', '#34d399', '#f472b6', '#a78bfa', '#fb923c'];
      for (var di = 0; di < 14; di++) {
        (function (idx) {
          var dot = document.createElement('div');
          dot.className = 'cp-al-confetti-piece';
          dot.style.cssText = 'position:absolute;width:7px;height:7px;border-radius:50%;' +
            'left:' + cx + 'px;top:' + cy + 'px;' +
            'background:' + colors[idx % colors.length] + ';pointer-events:none;z-index:20;';
          wrap.appendChild(dot);
          var angle = (idx / 14) * Math.PI * 2;
          var dist  = 44 + (idx % 3) * 24;
          anime({
            targets: dot,
            translateX: Math.cos(angle) * dist,
            translateY: Math.sin(angle) * dist - 32,
            opacity: [1, 0], scale: [1.2, 0.2],
            duration: 650 + (idx % 4) * 90, easing: 'easeOutCubic',
            complete: function () { if (dot.parentNode) dot.parentNode.removeChild(dot); }
          });
        }(di));
      }
    }

    function onComplete3() {
      solved3 = true;

      /* Green pulse wave across answer cells */
      if (typeof anime !== 'undefined') {
        anime({
          targets: ansCells3,
          backgroundColor: ['#dcfce7', '#ffffff'],
          duration: 600, delay: anime.stagger(60), easing: 'easeOutQuad'
        });
      }
      spawnConfetti3(ansRowEl3);
      if (typeof playComplete === 'function') playComplete();

      /* Build equation string */
      var topStr3 = top7.join('').replace(/^0+/, '') || '0';
      var botStr3 = bot7.join('').replace(/^0+/, '') || '0';
      /* Recompute answer from originals */
      var ansArr3 = [];
      var bw = 0;
      for (var c3 = 6; c3 >= 0; c3--) {
        var t3 = (+top7[c3]) - bw;
        var b3 = (+bot7[c3]);
        if (t3 < b3) { ansArr3[c3] = t3 + 10 - b3; bw = 1; }
        else { ansArr3[c3] = t3 - b3; bw = 0; }
      }
      var diffStr = ansArr3.join('').replace(/^0+/, '') || '0';
      subtitleEl.textContent = _toInd(topStr3) + ' − ' + _toInd(botStr3) + ' = ' + _toInd(diffStr);
      showStatus3('Subtraction Complete!', 'correct');

      /* Completion buttons */
      var btnRow3 = _el('div', 'cp-scbc-btn-row');

      var nextBtn3 = _el('button', 'cp-btn-primary cp-scbc-next-btn');
      nextBtn3.textContent = 'Next →';
      nextBtn3.addEventListener('click', function () {
        if (page.next) renderPage(page.next);
      });

      var retryBtn3 = _el('button', 'cp-scbc-retry-btn');
      retryBtn3.textContent = 'Try New Number';
      retryBtn3.addEventListener('click', function () {
        _subtractionLabResult = null;
        renderPage('3.1');
      });

      btnRow3.appendChild(nextBtn3);
      btnRow3.appendChild(retryBtn3);
      wrap.appendChild(btnRow3);

      if (typeof anime !== 'undefined') {
        anime.set(btnRow3, { opacity: 0, translateY: 12 });
        anime({
          targets: btnRow3, opacity: 1, translateY: 0, duration: 450, easing: 'easeOutBack',
          complete: function () {
            anime({ targets: nextBtn3, scale: [1, 1.03, 1], duration: 900, loop: true, easing: 'easeInOutSine' });
          }
        });
      }
    }

    function onSubmit3() {
      if (solved3) return;
      var digit = parseInt(inputBuffer3, 10);
      if (isNaN(digit)) {
        showStatus3('Tap a digit on the pad first.', 'warn');
        return;
      }

      /* Block if borrow required but not yet performed */
      if (needsBorrow(activeCol3) && !borrowedThisCol) {
        if (typeof anime !== 'undefined') {
          anime({ targets: ansCells3[activeCol3], translateX: [0, -5, 5, -3, 3, 0], duration: 360, easing: 'easeInOutSine' });
          anime({ targets: topCells[activeCol3], scale: [1, 1.08, 1], duration: 300, easing: 'easeOutBack' });
        }
        if (typeof playWrong === 'function') playWrong();
        showStatus3('Not quite. Hint: borrow from the left before subtracting in this highlighted column.', 'error');
        inputBuffer3 = '';
        ansCells3[activeCol3].textContent = '';
        return;
      }

      var expected3 = workTop[activeCol3] - (+bot7[activeCol3]);
      var cell3 = ansCells3[activeCol3];

      if (digit === expected3) {
        cell3.textContent = String(digit);
        cell3.classList.add('cp-scbc-ans-cell--correct');
        cell3.classList.remove('cp-scbc-cell--active');
        topCells[activeCol3].classList.remove('cp-scbc-cell--pulse');
        if (typeof playCorrect === 'function') playCorrect();
        if (typeof anime !== 'undefined') {
          anime.set(cell3, { scale: 0.8 });
          anime({ targets: cell3, scale: [0.8, 1.12, 1], duration: 280, easing: 'easeOutBack' });
        }

        var prevCol3 = activeCol3 - 1;
        if (prevCol3 >= 0) {
          showStatus3('Correct. Move to the next column.', 'correct');
          setTimeout(function () {
            if (_currentPageId === page.id) setActiveCol3(prevCol3);
          }, 400);
        } else {
          showStatus3('Correct!', 'correct');
          setTimeout(function () {
            if (_currentPageId === page.id) onComplete3();
          }, 500);
        }
      } else {
        if (typeof anime !== 'undefined') {
          anime({ targets: cell3, translateX: [0, -5, 5, -3, 3, 0], duration: 360, easing: 'easeInOutSine' });
        }
        if (typeof playWrong === 'function') playWrong();
        showStatus3('Not quite. Hint: subtract the highlighted column carefully and use the borrowed value if it appears above.', 'error');
        inputBuffer3 = '';
        cell3.textContent = '';
      }
    }

    /* ── Borrow button handler ── */
    borrowBtn.addEventListener('click', function () {
      if (solved3) return;
      if (!needsBorrow(activeCol3)) return;

      /* Walk left to find first non-zero digit in workTop */
      var src = activeCol3 - 1;
      while (src >= 0 && workTop[src] === 0) src--;

      if (src < 0) {
        showStatus3('There is no value on the left to borrow from, so recheck the numbers.', 'warn');
        return;
      }

      if (typeof playTick === 'function') playTick();

      /* Reduce source digit */
      workTop[src] -= 1;
      borrowCells[src].textContent = String(workTop[src]);
      topCells[src].classList.add('cp-scbc-cell--borrowed');
      if (typeof anime !== 'undefined') {
        anime.set(borrowCells[src], { opacity: 0, scale: 0.6, translateY: 6 });
        anime({ targets: borrowCells[src], opacity: 1, scale: 1, translateY: 0, duration: 280, easing: 'easeOutBack' });
      }

      /* Propagate 9s for zeros between source and active column */
      for (var z = src + 1; z < activeCol3; z++) {
        workTop[z] = 9;
        borrowCells[z].textContent = '9';
        topCells[z].classList.add('cp-scbc-cell--borrowed');
        if (typeof anime !== 'undefined') {
          (function (zi) {
            anime.set(borrowCells[zi], { opacity: 0, scale: 0.6, translateY: 6 });
            anime({ targets: borrowCells[zi], opacity: 1, scale: 1, translateY: 0,
                    duration: 280, delay: (zi - src) * 80, easing: 'easeOutBack' });
          }(z));
        }
      }

      /* Add 10 to active column's workTop value */
      workTop[activeCol3] += 10;
      borrowCells[activeCol3].textContent = String(workTop[activeCol3]);
      borrowCells[activeCol3].classList.add('cp-scbc-borrow-cell--highlight');
      if (typeof anime !== 'undefined') {
        var delay3 = (activeCol3 - src) * 80;
        anime.set(borrowCells[activeCol3], { opacity: 0, scale: 0.6, translateY: 6 });
        anime({
          targets: borrowCells[activeCol3], opacity: 1, scale: 1.2, translateY: 0,
          duration: 320, delay: delay3, easing: 'easeOutBack',
          complete: function () {
            anime({ targets: borrowCells[activeCol3], scale: 1, duration: 200 });
          }
        });
      }

      /* Update UI */
      topCells[activeCol3].classList.remove('cp-scbc-cell--pulse');
      borrowBtn.classList.remove('visible');
      borrowedThisCol = true;
      showStatus3('Borrowed successfully. Now subtract in the highlighted column.', 'correct');
    });

    /* ── Numpad handlers — digit auto-submits immediately ── */
    padKeys3.forEach(function (k) {
      padBtns3[k].addEventListener('click', function () {
        if (solved3) return;
        if (typeof playTick === 'function') playTick();
        if (k === 'Clear' || k === 'Del') {
          inputBuffer3 = '';
          ansCells3[activeCol3].textContent = '';
        } else {
          inputBuffer3 = k;
          ansCells3[activeCol3].textContent = k;
          if (typeof anime !== 'undefined') {
            anime.set(ansCells3[activeCol3], { scale: 0.85 });
            anime({ targets: ansCells3[activeCol3], scale: 1, duration: 150, easing: 'easeOutBack',
                    complete: onSubmit3 });
          } else {
            onSubmit3();
          }
        }
      });
    });

    /* ── Entry animations ── */
    if (typeof anime !== 'undefined') {
      anime.set([titleEl, subtitleEl], { opacity: 0, translateY: -8 });
      anime({ targets: [titleEl, subtitleEl], opacity: 1, translateY: 0,
              duration: 500, delay: anime.stagger(120), easing: 'easeOutQuad' });
      anime.set(boardWrap, { opacity: 0, translateX: -30 });
      anime({ targets: boardWrap, opacity: 1, translateX: 0, duration: 500, delay: 600, easing: 'easeOutQuad' });
      anime.set(numpad3, { opacity: 0, translateX: 30 });
      anime({ targets: numpad3, opacity: 1, translateX: 0, duration: 500, delay: 600, easing: 'easeOutQuad' });
      var digitCells3 = Array.prototype.slice.call(topRowEl3.querySelectorAll('.cp-scbc-cell'))
                        .concat(Array.prototype.slice.call(botRowEl3.querySelectorAll('.cp-scbc-cell')));
      anime.set(digitCells3, { scale: 0, opacity: 0 });
      anime({ targets: digitCells3, scale: 1, opacity: 1,
              duration: 280, delay: anime.stagger(60, { start: 1300 }), easing: 'easeOutBack' });
    }

    /* ── Initial state: activate Ones column after animations settle ── */
    setTimeout(function () {
      if (_currentPageId === page.id) setActiveCol3(6);
    }, 2100);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 3.3 — Subtraction Practice (.cp-sp-*)
  ══════════════════════════════════════════════════════ */

  function _renderSubtractionPractice(page, area) {

    var ANSWER = '173465';

    function _toInd3(numStr) {
      var str = numStr.replace(/^0+/, '') || '0';
      if (str.length <= 3) return str;
      var r = str.slice(-3);
      var rem = str.slice(0, -3);
      while (rem.length > 2) { r = rem.slice(-2) + ',' + r; rem = rem.slice(0, -2); }
      return rem ? rem + ',' + r : r;
    }

    /* ── DOM ── */
    var wrap = _el('div', 'cp-sp');
    wrap.dataset.pageId = page.id;
    area.appendChild(wrap);

    var titleEl = _el('h1', 'cp-title');
    titleEl.textContent = page.title || 'Subtraction Practice';
    wrap.appendChild(titleEl);

    var statusEl = _el('p', 'cp-sp-status-msg');
    wrap.appendChild(statusEl);

    var body = _el('div', 'cp-sp-body');
    var leftCol = _el('div', 'cp-sp-left-col');

    /* ── Story card ── */
    var storyCard = _el('div', 'cp-sp-story-card');
    var line1 = _el('p', 'cp-sp-story-line');
    line1.innerHTML = 'A warehouse packed <strong>6,52,430</strong> snack boxes for a festival order.';
    storyCard.appendChild(line1);
    var line2 = _el('p', 'cp-sp-story-line');
    line2.innerHTML = 'So far, <strong>4,78,965</strong> boxes have already been loaded onto delivery trucks.';
    storyCard.appendChild(line2);
    var goal = _el('p', 'cp-sp-goal');
    goal.textContent = 'How many snack boxes are still left in the warehouse?';
    storyCard.appendChild(goal);
    leftCol.appendChild(storyCard);

    /* ── Work area ── */
    var workWrap = _el('div', 'cp-sp-work-wrap');
    var eqAnsCol = _el('div', 'cp-sp-eq-ans-col');

    var eqBox = _el('div', 'cp-sp-equation');
    var eqTop = _el('div', 'cp-sp-eq-line');
    eqTop.textContent = '  652430';
    eqBox.appendChild(eqTop);
    var eqBot = _el('div', 'cp-sp-eq-line');
    eqBot.textContent = '−478965';
    eqBox.appendChild(eqBot);
    var eqDivEl = _el('div', 'cp-sp-eq-divider');
    eqDivEl.textContent = '−−−−−−−−';
    eqBox.appendChild(eqDivEl);
    eqAnsCol.appendChild(eqBox);

    var ansCell = _el('div', 'cp-sp-ans-cell');
    ansCell.textContent = 'Difference';
    ansCell.setAttribute('role', 'textbox');
    ansCell.setAttribute('aria-label', 'Enter the difference');
    eqAnsCol.appendChild(ansCell);
    workWrap.appendChild(eqAnsCol);

    /* numpad inside workWrap — auto-submits on 6th digit */
    var numpadSP = _el('div', 'cp-sp-numpad');
    var padGridSP = _el('div', 'cp-sp-pad-grid');
    var padKeysSP = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', 'Del'];
    var padBtnsSP = {};
    padKeysSP.forEach(function (k) {
      var isCtrl = k === 'Clear' || k === 'Del';
      var btn = _el('button', 'cp-sp-pad-btn' + (isCtrl ? ' cp-sp-pad-btn--ctrl' : ''));
      btn.textContent = k;
      btn.setAttribute('aria-label', k);
      padGridSP.appendChild(btn);
      padBtnsSP[k] = btn;
    });
    numpadSP.appendChild(padGridSP);
    workWrap.appendChild(numpadSP);

    leftCol.appendChild(workWrap);
    body.appendChild(leftCol);
    wrap.appendChild(body);

    /* ── State ── */
    var inputBufSP = '';
    var wrongCount  = 0;
    var solvedSP    = false;

    /* ── Helpers ── */
    function showStatusSP(msg, type) {
      statusEl.textContent = msg;
      statusEl.className   = 'cp-sp-status-msg' + (type ? ' cp-sp-status-msg--' + type : '');
      if (typeof anime !== 'undefined') {
        anime.set(statusEl, { opacity: 0, translateY: 4 });
        anime({ targets: statusEl, opacity: 1, translateY: 0, duration: 280, easing: 'easeOutQuad' });
      }
    }

    function updateAnsDisplay() {
      if (inputBufSP === '') {
        ansCell.textContent = 'Difference';
        ansCell.classList.remove('cp-sp-ans-cell--typing');
      } else {
        ansCell.textContent = inputBufSP;
        ansCell.classList.add('cp-sp-ans-cell--typing');
      }
    }

    function showBorrowHint() {
      var hint = _el('div', 'cp-sp-borrow-hint');
      hint.innerHTML =
        '<strong>Borrow walkthrough:</strong><br>' +
        'Ones: 0 &lt; 5 → borrow → 10−5 = 5<br>' +
        'Tens: 3→2 → 2 &lt; 6 → borrow → 12−6 = 6<br>' +
        'Hundreds: 4→3 → 3 &lt; 9 → borrow → 13−9 = 4<br>' +
        'Thousands: 2→1 → 1 &lt; 8 → borrow → 11−8 = 3<br>' +
        'Ten-Thousands: 5→4 → 4 &lt; 7 → borrow → 14−7 = 7<br>' +
        'Lakhs: 6→5 → 5−4 = 1';
      workWrap.insertBefore(hint, eqBox);
      if (typeof anime !== 'undefined') {
        anime.set(hint, { opacity: 0, translateY: -8 });
        anime({
          targets: hint, opacity: 1, translateY: 0, duration: 350, easing: 'easeOutQuad',
          complete: function () {
            setTimeout(function () {
              if (hint.parentNode) {
                anime({ targets: hint, opacity: 0, duration: 500, easing: 'easeInQuad',
                  complete: function () { if (hint.parentNode) hint.parentNode.removeChild(hint); }
                });
              }
            }, 2500);
          }
        });
      } else {
        setTimeout(function () { if (hint.parentNode) hint.parentNode.removeChild(hint); }, 3000);
      }
    }

    function onSubmitSP() {
      if (solvedSP) return;
      if (inputBufSP === '') {
        showStatusSP('Tap a digit on the pad first.', 'warn');
        return;
      }

      if (inputBufSP === ANSWER) {
        solvedSP = true;
        ansCell.textContent = _toInd3(ANSWER);
        ansCell.classList.remove('cp-sp-ans-cell--typing');
        ansCell.classList.remove('cp-sp-ans-cell--glow');
        ansCell.classList.add('cp-sp-ans-cell--correct');
        goal.classList.add('cp-sp-goal--done');
        if (typeof playComplete === 'function') playComplete();
        if (typeof anime !== 'undefined') {
          anime.set(ansCell, { scale: 0.9 });
          anime({ targets: ansCell, scale: [0.9, 1.1, 1], duration: 350, easing: 'easeOutBack' });
        }
        showStatusSP('Correct! Boxes still in the warehouse = 1,73,465', 'correct');

        /* Next button */
        var btnRowSP = _el('div', 'cp-sp-btn-row');
        var nextBtnSP = _el('button', 'cp-btn-primary cp-sp-next-btn');
        nextBtnSP.textContent = 'Next: Multiplication Lab →';
        nextBtnSP.addEventListener('click', function () {
          if (page.next) renderPage(page.next);
        });
        btnRowSP.appendChild(nextBtnSP);
        wrap.appendChild(btnRowSP);

        if (typeof anime !== 'undefined') {
          anime.set(btnRowSP, { opacity: 0, translateY: 12 });
          anime({
            targets: btnRowSP, opacity: 1, translateY: 0, duration: 450, easing: 'easeOutBack',
            complete: function () {
              anime({ targets: nextBtnSP, scale: [1, 1.03, 1], duration: 900, loop: true, easing: 'easeInOutSine' });
            }
          });
        }
      } else {
        wrongCount++;
        if (typeof anime !== 'undefined') {
          anime({ targets: ansCell, translateX: [0, -6, 6, -4, 4, 0], duration: 360, easing: 'easeInOutSine' });
        }
        if (typeof playWrong === 'function') playWrong();
        showStatusSP('Not quite. Hint: start from the Ones place and recheck the Tens and Hundreds after borrowing.', 'error');
        inputBufSP = '';
        updateAnsDisplay();

        if (wrongCount >= 2) {
          setTimeout(function () {
            if (_currentPageId === page.id) showBorrowHint();
          }, 500);
        }
      }
    }

    /* ── Numpad handlers — multi-digit entry; Submit validates ── */
    padKeysSP.forEach(function (k) {
      padBtnsSP[k].addEventListener('click', function () {
        if (solvedSP) return;
        if (typeof playTick === 'function') playTick();
        if (k === 'Clear') {
          inputBufSP = '';
        } else if (k === 'Del') {
          inputBufSP = inputBufSP.slice(0, -1);
        } else {
          if (inputBufSP.length < 6) inputBufSP += k;
        }
        updateAnsDisplay();
        if (!solvedSP && inputBufSP.length === 6) {
          setTimeout(onSubmitSP, 120);
        }
      });
    });

    /* ── Entry animations ── */
    if (typeof anime !== 'undefined') {
      anime.set(titleEl, { opacity: 0, translateY: -10 });
      anime({ targets: titleEl, opacity: 1, translateY: 0, duration: 500, easing: 'easeOutQuad' });

      anime.set(storyCard, { opacity: 0, translateY: -15 });
      anime({ targets: storyCard, opacity: 1, translateY: 0, duration: 560, delay: 500, easing: 'easeOutQuad' });

      anime.set(workWrap, { opacity: 0, translateY: 15 });
      anime({ targets: workWrap, opacity: 1, translateY: 0, duration: 500, delay: 1400, easing: 'easeOutQuad' });

      /* Goal line orange pulse once */
      setTimeout(function () {
        if (_currentPageId !== page.id) return;
        anime({ targets: goal, color: ['#f97316', '#ea580c', '#f97316'], duration: 800, easing: 'easeInOutSine' });
      }, 2100);

      /* Answer cell pulse-glow loop */
      setTimeout(function () {
        if (_currentPageId === page.id) ansCell.classList.add('cp-sp-ans-cell--glow');
      }, 2200);
    }
  }

  /* ══════════════════════════════════════════════════════
     PAGE 2.0 — bodmas-ask
  ══════════════════════════════════════════════════════ */

  function _renderBodmasAsk(page, area) {
    var wrap = _el('div', 'cp-ba-wrap');
    wrap.dataset.pageId = page.id;

    /* Heading */
    var title = _el('h2', 'cp-ba-title');
    title.textContent = page.title || 'Multiply before Add';
    wrap.appendChild(title);

    /* Visual strip — 3 crayon packs + separator + 2 loose crayons */
    var visual = _el('div', 'cp-ba-visual');
    for (var p = 0; p < 3; p++) {
      var pack = _el('div', 'cp-ba-pack');
      pack.setAttribute('aria-hidden', 'true');
      pack.innerHTML = '<svg class="cp-ba-pack-svg" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="6" y="4" width="28" height="36" rx="6" fill="#F59E0B"/><rect x="6" y="4" width="28" height="10" rx="5" fill="#D97706"/><rect x="14" y="40" width="12" height="6" rx="3" fill="#92400E"/><rect x="10" y="12" width="20" height="2" rx="1" fill="#FEF3C7" opacity=".6"/><rect x="10" y="17" width="20" height="2" rx="1" fill="#FEF3C7" opacity=".4"/></svg>';
      var packLabel = _el('span', 'cp-ba-pack__label');
      packLabel.setAttribute('aria-hidden', 'true');
      packLabel.textContent = '× 4';
      pack.appendChild(packLabel);
      visual.appendChild(pack);
    }
    var plusSep = _el('span', 'cp-ba-plus-sep');
    plusSep.textContent = '+';
    plusSep.setAttribute('aria-hidden', 'true');
    visual.appendChild(plusSep);
    for (var l = 0; l < 2; l++) {
      var loose = _el('div', 'cp-ba-loose');
      loose.setAttribute('aria-hidden', 'true');
      loose.innerHTML = '<svg class="cp-ba-crayon-svg" viewBox="0 0 20 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="4" y="8" width="12" height="34" rx="4" fill="#EF4444"/><polygon points="4,42 16,42 10,52" fill="#B91C1C"/><rect x="4" y="8" width="12" height="8" rx="3" fill="#991B1B"/></svg>';
      visual.appendChild(loose);
    }
    wrap.appendChild(visual);

    /* Expression */
    var exprEl = _el('div', 'cp-ba-expr');
    exprEl.setAttribute('aria-label', page.expression || '3 × 4 + 2');
    var exprParts = [
      { text: '3', cls: 'cp-ba-expr__num' },
      { text: '×', cls: 'cp-ba-expr__op cp-ba-expr__op--mul' },
      { text: '4', cls: 'cp-ba-expr__num' },
      { text: '+', cls: 'cp-ba-expr__op cp-ba-expr__op--add' },
      { text: '2', cls: 'cp-ba-expr__num' }
    ];
    exprParts.forEach(function (part) {
      var span = _el('span', part.cls);
      span.setAttribute('aria-hidden', 'true');
      span.textContent = part.text;
      exprEl.appendChild(span);
    });
    wrap.appendChild(exprEl);

    /* Question */
    var qEl = _el('p', 'cp-ba-question');
    qEl.setAttribute('aria-live', 'polite');
    qEl.textContent = page.question || 'Which part do you solve FIRST?';
    wrap.appendChild(qEl);

    /* CTA button */
    var cta = _el('button', 'cp-ba-cta');
    cta.textContent = page.buttonLabel || "Let's Try →";
    cta.addEventListener('click', function () {
      if (typeof playStartWhoosh === 'function') playStartWhoosh();
      _wipeLeftTo(page.next);
    });
    wrap.appendChild(cta);

    area.appendChild(wrap);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 2.1 — bodmas-try
  ══════════════════════════════════════════════════════ */

  function _renderBodmasTry(page, area) {
    var wrap = _el('div', 'cp-bt-wrap');
    wrap.dataset.pageId = page.id;

    /* Header row */
    var header = _el('div', 'cp-bt-header');
    var progressEl = _el('p', 'cp-bt-progress');
    progressEl.setAttribute('aria-live', 'polite');
    var dotsEl = _el('div', 'cp-bt-dots');
    var dotEls = [];
    var examples = page.examples || [];
    for (var d = 0; d < examples.length; d++) {
      var dot = _el('span', 'cp-bt-dot');
      dotsEl.appendChild(dot);
      dotEls.push(dot);
    }
    var replayBtn = _el('button', 'cp-bt-replay');
    replayBtn.setAttribute('aria-label', 'Replay this example');
    replayBtn.textContent = '↺';
    header.appendChild(progressEl);
    header.appendChild(dotsEl);
    header.appendChild(replayBtn);
    wrap.appendChild(header);

    /* Tile board */
    var boardEl = _el('div', 'cp-bt-board');
    wrap.appendChild(boardEl);

    /* Streak chip */
    var streakEl = _el('div', 'cp-bt-streak');
    streakEl.setAttribute('aria-live', 'polite');
    streakEl.textContent = '';
    wrap.appendChild(streakEl);

    /* Compare panel */
    var compareEl = _el('div', 'cp-bt-compare');
    compareEl.hidden = true;
    wrap.appendChild(compareEl);

    /* Guide bar */
    var guide = _el('div', 'cp-bt-guide');
    var guideEl = _el('p', 'cp-bt-guide__text');
    guideEl.setAttribute('aria-live', 'assertive');
    var nextBtn = _el('button', 'cp-bt-next');
    nextBtn.textContent = 'Next ▶';
    nextBtn.hidden = true;
    guide.appendChild(guideEl);
    guide.appendChild(nextBtn);
    wrap.appendChild(guide);

    area.appendChild(wrap);

    /* ── State ── */
    var exIdx      = 0;
    var phase      = 'tap';
    var streakCount = 0;
    var answered   = false;

    /* ── Helpers ── */
    function _buildCompare(ex) {
      compareEl.innerHTML = '';
      var cards = [
        { label: 'Left → right', value: ex.compareLeft,  verdict: '✗', cls: 'cp-bt-compare__card--wrong' },
        { label: '× first',      value: ex.compareRight, verdict: '✓', cls: 'cp-bt-compare__card--right' }
      ];
      cards.forEach(function (c) {
        var card = _el('div', 'cp-bt-compare__card ' + c.cls);
        var lbl  = _el('span', 'cp-bt-compare__label');
        lbl.textContent = c.label;
        var val  = _el('span', 'cp-bt-compare__val');
        val.textContent = c.value;
        var verd = _el('span', 'cp-bt-compare__verdict');
        verd.textContent = c.verdict;
        verd.setAttribute('aria-hidden', 'true');
        card.appendChild(lbl);
        card.appendChild(val);
        card.appendChild(verd);
        compareEl.appendChild(card);
      });
    }

    function _afterBuild(ex, i) {
      phase = 'done';

      /* Streak chip */
      streakCount++;
      var streakText = 'First pick: ×';
      for (var s = 0; s < streakCount; s++) streakText += ' ✓';
      streakEl.textContent = streakText;
      streakEl.setAttribute('aria-label', streakText);

      /* Compare panel (examples 0 and 2 only) */
      if (ex.hasCompare) {
        _buildCompare(ex);
        compareEl.hidden = false;
        if (typeof anime !== 'undefined') {
          anime.set(compareEl, { opacity: 0, translateY: 10 });
          anime({ targets: compareEl, opacity: 1, translateY: 0, duration: 400, easing: 'easeOutBack' });
        } else {
          compareEl.style.opacity = '1';
        }
      }

      guideEl.textContent = i < examples.length - 1
        ? 'Great! Tap Next for the next one.'
        : "Excellent! You've got the rule!";

      nextBtn.hidden = false;
      if (typeof anime !== 'undefined') {
        anime.set(nextBtn, { opacity: 0 });
        anime({ targets: nextBtn, opacity: 1, duration: 280, easing: 'easeOutQuad' });
      } else {
        nextBtn.style.opacity = '1';
      }

      /* Last example auto-advances */
      if (i === examples.length - 1) {
        setTimeout(function () {
          if (_currentPageId === page.id) _wipeLeftTo(page.next);
        }, 2800);
      }
    }

    function _runBuildAnimation(ex, i) {
      var tiles     = Array.prototype.slice.call(boardEl.querySelectorAll('.cp-bt-tile'));
      var mulTiles  = tiles.filter(function (t) { return t.classList.contains('cp-bt-tile--mul'); });
      var addTiles  = tiles.filter(function (t) { return !t.classList.contains('cp-bt-tile--mul'); });

      /* Step 1: glow on × tiles */
      mulTiles.forEach(function (t) { t.classList.add('cp-bt-tile--mul-glow'); });

      if (typeof anime === 'undefined') {
        /* No anime — instant finish */
        boardEl.innerHTML = '';
        var ansDiv = _el('div', 'cp-bt-board');
        var ansSpan = _el('span', 'cp-bt-tile cp-bt-tile--answer');
        ansSpan.textContent = ex.answer;
        boardEl.appendChild(ansSpan);
        if (typeof launchConfetti === 'function') launchConfetti();
        setTimeout(function () { _afterBuild(ex, i); }, 300);
        return;
      }

      /* Step 2: animate × numbers sliding together */
      setTimeout(function () {
        /* Rebuild board with product token */
        boardEl.innerHTML = '';
        ex.finalExpr.forEach(function (tok, ti) {
          var isLastNum = (ti === ex.finalExpr.length - 1);
          var t = _el('button', 'cp-bt-tile ' + (isLastNum ? 'cp-bt-tile--num' : (tok === '+' || tok === '−' ? 'cp-bt-tile--add' : 'cp-bt-tile--num')));
          t.textContent = tok;
          t.setAttribute('aria-disabled', 'true');
          t.setAttribute('tabindex', '-1');
          t.style.opacity = '0';
          boardEl.appendChild(t);
        });
        var newTiles = Array.prototype.slice.call(boardEl.querySelectorAll('.cp-bt-tile'));
        anime.set(newTiles, { opacity: 0, scale: 0.7 });
        anime({ targets: newTiles, opacity: 1, scale: 1, duration: 380, delay: anime.stagger(60), easing: 'easeOutBack' });
      }, 600);

      /* Step 3: answer tile bursts in */
      setTimeout(function () {
        boardEl.innerHTML = '';
        var ansDiv = _el('div', 'cp-bt-tile-answer-row');
        var ansEq  = _el('button', 'cp-bt-tile cp-bt-tile--add');
        ansEq.textContent = '=';
        ansEq.setAttribute('aria-disabled', 'true');
        ansEq.setAttribute('tabindex', '-1');
        var ansTile = _el('button', 'cp-bt-tile cp-bt-tile--answer');
        ansTile.textContent = ex.answer;
        ansTile.setAttribute('aria-label', 'Answer: ' + ex.answer);
        ansTile.setAttribute('aria-disabled', 'true');
        ansTile.setAttribute('tabindex', '-1');

        /* Re-add final expr tiles */
        ex.finalExpr.forEach(function (tok) {
          var t = _el('button', 'cp-bt-tile cp-bt-tile--num');
          t.textContent = tok;
          t.setAttribute('aria-disabled', 'true');
          t.setAttribute('tabindex', '-1');
          boardEl.appendChild(t);
        });
        boardEl.appendChild(ansEq);
        boardEl.appendChild(ansTile);

        anime.set(ansTile, { opacity: 0, scale: 0.5 });
        anime({
          targets: ansTile,
          opacity: 1,
          scale: [0.5, 1.3, 1],
          duration: 600,
          easing: 'easeOutBack',
          complete: function () {
            if (typeof launchConfetti === 'function') launchConfetti();
            _afterBuild(ex, i);
          }
        });
        if (typeof playStarPop === 'function') playStarPop();
      }, 1200);
    }

    function _onTileTap(tile, ex, i, isMultiply) {
      if (answered || phase !== 'tap') return;

      if (!isMultiply) {
        /* WRONG */
        if (typeof playWrong === 'function') playWrong();
        tile.classList.add('cp-bt-tile--wrong');
        setTimeout(function () { tile.classList.remove('cp-bt-tile--wrong'); }, 700);
        if (typeof anime !== 'undefined') {
          anime({ targets: tile, translateX: [0, -8, 8, -6, 6, 0], duration: 380, easing: 'easeInOutSine' });
          var mulTiles = Array.prototype.slice.call(boardEl.querySelectorAll('.cp-bt-tile--mul'));
          if (mulTiles.length) {
            anime({ targets: mulTiles, scale: [1, 1.1, 1], duration: 500, delay: 150, easing: 'easeInOutSine' });
          }
        }
        guideEl.textContent = 'Try tapping the × group instead.';
        return;
      }

      /* CORRECT */
      answered = true;
      phase = 'build';
      if (typeof playCorrect === 'function') playCorrect();
      guideEl.textContent = 'Nice! Watch the calculation build…';
      _runBuildAnimation(ex, i);
    }

    function _loadExample(ex, i) {
      phase    = 'tap';
      answered = false;

      progressEl.textContent = 'Example ' + (i + 1) + ' of ' + examples.length;
      dotEls.forEach(function (d, di) {
        d.className = 'cp-bt-dot' + (di === i ? ' cp-bt-dot--active' : (di < i ? ' cp-bt-dot--done' : ''));
      });

      boardEl.innerHTML = '';
      compareEl.hidden  = true;
      nextBtn.hidden    = true;
      guideEl.textContent = 'Tap the × part to solve it first.';

      ex.tokens.forEach(function (tok, ti) {
        var isMultiply = ex.multiplyIndices.indexOf(ti) !== -1;
        var isPlus     = ex.plusIndices.indexOf(ti) !== -1;
        var cls = 'cp-bt-tile';
        if (isMultiply) {
          cls += ' cp-bt-tile--mul';
        } else if (!isPlus && tok !== '+' && tok !== '−') {
          cls += ' cp-bt-tile--num';
        } else {
          cls += ' cp-bt-tile--add';
        }
        var tile = _el('button', cls);
        tile.textContent = tok;
        tile.dataset.idx = ti;
        tile.setAttribute('aria-label', 'Tap ' + tok);
        (function (t, ex2, i2, isMul) {
          t.addEventListener('click', function () { _onTileTap(t, ex2, i2, isMul); });
          t.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.click(); }
          });
        }(tile, ex, i, isMultiply));
        boardEl.appendChild(tile);
      });

      /* Trigger tile entrance animation */
      if (typeof ContentAnimations !== 'undefined') {
        ContentAnimations.run('bodmasTry');
      }
    }

    /* ── Event Listeners ── */
    nextBtn.addEventListener('click', function () {
      if (exIdx < examples.length - 1) {
        exIdx++;
        _loadExample(examples[exIdx], exIdx);
      }
    });

    replayBtn.addEventListener('click', function () {
      if (phase === 'done') return;
      _loadExample(examples[exIdx], exIdx);
    });

    /* ── Boot ── */
    _loadExample(examples[0], 0);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 2.2 — bodmas-reveal
  ══════════════════════════════════════════════════════ */

  function _renderBodmasReveal(page, area) {
    var wrap = _el('div', 'cp-br-wrap');
    wrap.dataset.pageId = page.id;

    var card = _el('div', 'cp-br-card');

    /* Badge */
    var badge = _el('div', 'cp-br-card__badge');
    badge.textContent = page.title || 'You found the rule!';
    card.appendChild(badge);

    /* Rule text */
    var ruleEl = _el('p', 'cp-br-card__rule');
    ruleEl.textContent = page.ruleText || '';
    card.appendChild(ruleEl);

    /* Worked example */
    var workedEl = _el('div', 'cp-br-worked');
    (page.workedSteps || []).forEach(function (step) {
      var line = _el('div', 'cp-br-worked__line');
      var tokens = step.expr.split(' ');
      tokens.forEach(function (tok, ti) {
        if (ti > 0) line.appendChild(document.createTextNode(' '));
        var isHL = step.highlight && step.highlight.indexOf(ti) !== -1;
        if (isHL) {
          var hl = _el('span', 'cp-br-worked__hl');
          hl.textContent = tok;
          line.appendChild(hl);
        } else {
          line.appendChild(document.createTextNode(tok));
        }
      });
      workedEl.appendChild(line);
    });
    card.appendChild(workedEl);

    /* BODMAS tag */
    var tagEl = _el('p', 'cp-br-bodmas-tag');
    tagEl.textContent = page.bodmasTag || '';
    card.appendChild(tagEl);

    /* Recap chips */
    var chipsEl = _el('div', 'cp-br-chips');
    (page.chips || []).forEach(function (chipText) {
      var chip = _el('span', 'cp-br-chip');
      chip.textContent = chipText;
      chipsEl.appendChild(chip);
    });
    card.appendChild(chipsEl);

    /* Buttons */
    var btnsEl = _el('div', 'cp-br-btns');
    var pracBtn = _el('button', 'cp-br-btn cp-br-btn--practice');
    pracBtn.textContent = page.buttonPractice || 'Practice →';
    pracBtn.addEventListener('click', function () { _wipeLeftTo(page.next); });
    var nextMissionBtn = _el('button', 'cp-br-btn cp-br-btn--next');
    nextMissionBtn.textContent = page.buttonNext || 'Next Mission ▶';
    nextMissionBtn.addEventListener('click', function () { _wipeLeftTo('3.0'); });
    btnsEl.appendChild(pracBtn);
    btnsEl.appendChild(nextMissionBtn);
    card.appendChild(btnsEl);

    wrap.appendChild(card);
    area.appendChild(wrap);

    /* Confetti burst after badge pops */
    setTimeout(function () {
      if (typeof launchConfetti === 'function') launchConfetti();
    }, 800);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 2.3 — bodmas-practice
  ══════════════════════════════════════════════════════ */

  function _renderBodmasPractice(page, area) {
    var wrap = _el('div', 'cp-bp-wrap');
    wrap.dataset.pageId = page.id;

    /* Progress bar */
    var barEl  = _el('div', 'cp-bp-progress-bar');
    var fillEl = _el('div', 'cp-bp-progress-bar__fill');
    fillEl.style.width = '0%';
    barEl.appendChild(fillEl);
    wrap.appendChild(barEl);

    /* Quiz card */
    var cardEl    = _el('div', 'cp-bp-card');
    var headerEl  = _el('div', 'cp-bp-card__header');
    var labelEl   = _el('p',   'cp-bp-card__label');
    labelEl.setAttribute('aria-live', 'polite');
    var exprEl    = _el('p',   'cp-bp-card__expr');
    var promptEl  = _el('p',   'cp-bp-card__prompt');
    var bodyEl    = _el('div', 'cp-bp-card__body');
    var feedbackEl = _el('p',  'cp-bp-feedback');
    feedbackEl.setAttribute('aria-live', 'assertive');

    headerEl.appendChild(labelEl);
    cardEl.appendChild(headerEl);
    cardEl.appendChild(exprEl);
    cardEl.appendChild(promptEl);
    cardEl.appendChild(bodyEl);
    cardEl.appendChild(feedbackEl);
    wrap.appendChild(cardEl);

    area.appendChild(wrap);

    /* ── State ── */
    var qIdx     = 0;
    var qDone    = 0;
    var stepIdx  = 0;
    var answered = false;
    var questions = page.questions || [];

    /* ── Helpers ── */
    function _onAnswerWrong(q, hintText) {
      feedbackEl.textContent = hintText || q.wrongHint || '';
      feedbackEl.className   = 'cp-bp-feedback cp-bp-feedback--hint';
      if (typeof playWrong === 'function') playWrong();
      if (typeof anime !== 'undefined') {
        anime({ targets: cardEl, translateX: [0, -8, 8, -6, 6, 0], duration: 380, easing: 'easeInOutSine' });
        anime.set(feedbackEl, { opacity: 0 });
        anime({ targets: feedbackEl, opacity: 1, duration: 220, easing: 'easeOutQuad' });
      } else {
        feedbackEl.style.opacity = '1';
      }
    }

    function _showCompletion() {
      cardEl.innerHTML = '';
      var msg = _el('p', 'cp-bp-completion');
      msg.textContent = page.completionMsg || 'Well done!';
      var homeBtn = _el('button', 'cp-bp-home-btn');
      homeBtn.textContent = '🏠 Menu';
      homeBtn.addEventListener('click', function () { location.reload(); });
      cardEl.appendChild(msg);
      cardEl.appendChild(homeBtn);
      if (typeof launchConfetti === 'function') launchConfetti();
      if (typeof anime !== 'undefined') {
        anime.set(cardEl, { opacity: 0, scale: 0.92 });
        anime({ targets: cardEl, opacity: 1, scale: 1, duration: 500, easing: 'easeOutBack' });
      } else {
        cardEl.style.opacity = '1';
      }
    }

    function _onAnswerCorrect(q, i) {
      answered = true;
      feedbackEl.textContent = q.okMsg || 'Correct!';
      feedbackEl.className   = 'cp-bp-feedback cp-bp-feedback--ok';
      if (typeof playCorrect === 'function') playCorrect();
      if (typeof anime !== 'undefined') {
        anime.set(feedbackEl, { opacity: 0 });
        anime({ targets: feedbackEl, opacity: 1, duration: 220, easing: 'easeOutQuad' });
      } else {
        feedbackEl.style.opacity = '1';
      }

      /* Fill bar */
      qDone++;
      var pct = (qDone / questions.length) * 100;
      if (typeof anime !== 'undefined') {
        anime({ targets: fillEl, width: pct + '%', duration: 500, easing: 'easeOutQuad' });
      } else {
        fillEl.style.width = pct + '%';
      }

      setTimeout(function () {
        if (_currentPageId !== page.id) return;
        if (i < questions.length - 1) {
          qIdx     = i + 1;
          answered = false;
          stepIdx  = 0;
          _loadQuestion(questions[qIdx], qIdx);
        } else {
          _showCompletion();
        }
      }, 1600);
    }

    function _loadQuestion(q, i) {
      labelEl.textContent   = 'Question ' + (i + 1) + ' of ' + questions.length;
      exprEl.textContent    = q.expression || '';
      exprEl.style.display  = q.expression ? '' : 'none';
      promptEl.textContent  = q.prompt || '';
      feedbackEl.textContent = '';
      feedbackEl.className   = 'cp-bp-feedback';
      bodyEl.innerHTML       = '';
      answered               = false;
      stepIdx                = 0;

      if (typeof anime !== 'undefined') {
        anime.set(bodyEl, { opacity: 0 });
        anime({ targets: bodyEl, opacity: 1, duration: 300, easing: 'easeOutQuad' });
      }

      if (q.kind === 'tap-operator') {
        /* Show expression row with tappable + and × */
        var row = _el('div', 'cp-bp-op-row');
        var nums = ['3', null, '4', null, '2'];
        var ops  = ['+', '×'];
        var opIdx = 0;
        nums.forEach(function (n) {
          if (n !== null) {
            var numSpan = _el('span', 'cp-bp-num');
            numSpan.textContent = n;
            row.appendChild(numSpan);
          } else {
            var opTok = ops[opIdx++];
            var opBtn = _el('button', 'cp-bp-tile');
            opBtn.textContent = opTok;
            var localOpIdx = opIdx - 1;
            opBtn.addEventListener('click', function () {
              if (answered) return;
              if (localOpIdx === q.correctIndex) {
                opBtn.classList.add('cp-bp-tile--correct');
                _onAnswerCorrect(q, i);
              } else {
                opBtn.classList.add('cp-bp-tile--wrong');
                setTimeout(function () { opBtn.classList.remove('cp-bp-tile--wrong'); }, 700);
                _onAnswerWrong(q);
              }
            });
            row.appendChild(opBtn);
          }
        });
        bodyEl.appendChild(row);

      } else if (q.kind === 'choose-rule') {
        var optRow = _el('div', 'cp-bp-opt-row');
        (q.options || []).forEach(function (opt, oi) {
          var btn = _el('button', 'cp-bp-option');
          btn.textContent = opt;
          btn.addEventListener('click', function () {
            if (answered) return;
            if (oi === q.correctIndex) {
              btn.classList.add('cp-bp-option--correct');
              _onAnswerCorrect(q, i);
            } else {
              btn.classList.add('cp-bp-option--wrong');
              setTimeout(function () { btn.classList.remove('cp-bp-option--wrong'); }, 700);
              _onAnswerWrong(q);
            }
          });
          optRow.appendChild(btn);
        });
        bodyEl.appendChild(optRow);

      } else if (q.kind === 'step-by-step') {
        function _showStep(sIdx) {
          bodyEl.innerHTML = '';
          var step = q.steps[sIdx];
          var instEl = _el('p', 'cp-bp-step-inst');
          instEl.textContent = step.instruction;
          var subEl  = _el('p', 'cp-bp-step-expr');
          subEl.textContent = step.subExpr;
          var choiceRow = _el('div', 'cp-bp-choice-row');
          step.choices.forEach(function (ch) {
            var btn = _el('button', 'cp-bp-choice');
            btn.textContent = ch;
            btn.addEventListener('click', function () {
              if (answered) return;
              if (ch === step.correct) {
                btn.classList.add('cp-bp-choice--correct');
                if (typeof playCorrect === 'function') playCorrect();
                if (sIdx < q.steps.length - 1) {
                  setTimeout(function () { _showStep(sIdx + 1); }, 800);
                } else {
                  _onAnswerCorrect(q, i);
                }
              } else {
                btn.classList.add('cp-bp-choice--wrong');
                setTimeout(function () { btn.classList.remove('cp-bp-choice--wrong'); }, 700);
                _onAnswerWrong(q);
              }
            });
            choiceRow.appendChild(btn);
          });
          bodyEl.appendChild(instEl);
          bodyEl.appendChild(subEl);
          bodyEl.appendChild(choiceRow);
          if (typeof anime !== 'undefined') {
            anime.set(bodyEl, { opacity: 0 });
            anime({ targets: bodyEl, opacity: 1, duration: 300, easing: 'easeOutQuad' });
          }
        }
        _showStep(0);

      } else if (q.kind === 'which-method') {
        var methodRow = _el('div', 'cp-bp-method-row');
        (q.methods || []).forEach(function (m, mi) {
          var card = _el('button', 'cp-bp-method-card');
          var lbl  = _el('span', 'cp-bp-method-card__label');
          lbl.textContent = m.label;
          var steps = _el('span', 'cp-bp-method-card__steps');
          steps.textContent = m.steps;
          card.appendChild(lbl);
          card.appendChild(steps);
          card.addEventListener('click', function () {
            if (answered) return;
            if (mi === q.correctIndex) {
              card.classList.add('cp-bp-method-card--correct');
              _onAnswerCorrect(q, i);
            } else {
              card.classList.add('cp-bp-method-card--wrong');
              setTimeout(function () { card.classList.remove('cp-bp-method-card--wrong'); }, 700);
              _onAnswerWrong(q);
            }
          });
          methodRow.appendChild(card);
        });
        bodyEl.appendChild(methodRow);
      }
    }

    /* Boot */
    _loadQuestion(questions[0], 0);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 3.0 — mbs-ask  (Multiply before Subtract hook)
  ══════════════════════════════════════════════════════ */

  function _renderMbsAsk(page, area) {
    var wrap = _el('div', 'cp-mba-wrap');
    wrap.dataset.pageId = page.id;

    /* Heading */
    var title = _el('h2', 'cp-mba-title');
    title.textContent = page.title || 'Multiply before Subtract';
    wrap.appendChild(title);

    /* Visual strip — banana pile + minus sep + 3 baskets */
    var visual = _el('div', 'cp-mba-visual');

    /* Banana pile */
    var pile = _el('div', 'cp-mba-pile');
    pile.setAttribute('aria-hidden', 'true');
    pile.innerHTML =
      '<svg class="cp-mba-pile__svg" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M8,42 Q12,18 42,10" stroke="#F59E0B" stroke-width="8" fill="none" stroke-linecap="round"/>' +
        '<path d="M8,42 Q14,22 40,14" stroke="#FDE68A" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M18,40 Q22,16 52,8" stroke="#F59E0B" stroke-width="8" fill="none" stroke-linecap="round"/>' +
        '<path d="M18,40 Q24,20 50,12" stroke="#FDE68A" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M4,44 Q6,22 34,12" stroke="#FBBF24" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '<circle cx="8" cy="42" r="4" fill="#92400E"/>' +
        '<circle cx="18" cy="40" r="4" fill="#92400E"/>' +
        '<circle cx="4" cy="44" r="3" fill="#92400E"/>' +
      '</svg>';
    var pileCount = _el('span', 'cp-mba-pile__count');
    pileCount.textContent = '0';
    pileCount.setAttribute('aria-label', '20 bananas');
    pile.appendChild(pileCount);
    visual.appendChild(pile);

    /* Minus separator */
    var minusSep = _el('span', 'cp-mba-minus-sep');
    minusSep.textContent = '−';
    minusSep.setAttribute('aria-hidden', 'true');
    visual.appendChild(minusSep);

    /* 3 baskets × 4 */
    for (var b = 0; b < 3; b++) {
      var basket = _el('div', 'cp-mba-basket');
      basket.setAttribute('aria-hidden', 'true');
      basket.innerHTML =
        '<svg class="cp-mba-basket__svg" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
          '<path d="M6,22 Q4,44 34,44 Q36,44 34,22" fill="#D97706" opacity="0.9"/>' +
          '<ellipse cx="20" cy="22" rx="14" ry="5" fill="#92400E"/>' +
          '<line x1="8" y1="29" x2="32" y2="29" stroke="#B45309" stroke-width="1.5" opacity="0.5"/>' +
          '<line x1="7" y1="36" x2="33" y2="36" stroke="#B45309" stroke-width="1.5" opacity="0.5"/>' +
          '<path d="M10,22 Q20,6 30,22" fill="none" stroke="#92400E" stroke-width="3" stroke-linecap="round"/>' +
        '</svg>';
      var basketLabel = _el('span', 'cp-mba-basket__label');
      basketLabel.setAttribute('aria-hidden', 'true');
      basketLabel.textContent = '× 4';
      basket.appendChild(basketLabel);
      visual.appendChild(basket);
    }
    wrap.appendChild(visual);

    /* Expression */
    var exprEl = _el('div', 'cp-mba-expr');
    exprEl.setAttribute('aria-label', page.expression || '20 − 3 × 4');
    var exprParts = [
      { text: '20', cls: 'cp-mba-expr__num' },
      { text: '−',  cls: 'cp-mba-expr__op cp-mba-expr__op--sub' },
      { text: '3',  cls: 'cp-mba-expr__num' },
      { text: '×',  cls: 'cp-mba-expr__op cp-mba-expr__op--mul' },
      { text: '4',  cls: 'cp-mba-expr__num' }
    ];
    exprParts.forEach(function (part) {
      var span = _el('span', part.cls);
      span.setAttribute('aria-hidden', 'true');
      span.textContent = part.text;
      exprEl.appendChild(span);
    });
    wrap.appendChild(exprEl);

    /* Question */
    var qEl = _el('p', 'cp-mba-question');
    qEl.setAttribute('aria-live', 'polite');
    qEl.textContent = page.question || 'Which part do you solve FIRST?';
    wrap.appendChild(qEl);

    /* CTA button */
    var cta = _el('button', 'cp-mba-cta');
    cta.textContent = page.buttonLabel || "Let's Try →";
    cta.addEventListener('click', function () {
      if (typeof playStartWhoosh === 'function') playStartWhoosh();
      _wipeLeftTo(page.next);
    });
    wrap.appendChild(cta);

    area.appendChild(wrap);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 3.1 — mbs-try  (× before − interactive discovery)
  ══════════════════════════════════════════════════════ */

  function _renderMbsTry(page, area) {
    var wrap = _el('div', 'cp-bt-wrap');
    wrap.dataset.pageId = page.id;

    /* Header row */
    var header = _el('div', 'cp-bt-header');
    var progressEl = _el('p', 'cp-bt-progress');
    progressEl.setAttribute('aria-live', 'polite');
    var dotsEl = _el('div', 'cp-bt-dots');
    var dotEls = [];
    var examples = page.examples || [];
    for (var d = 0; d < examples.length; d++) {
      var dot = _el('span', 'cp-bt-dot');
      dotsEl.appendChild(dot);
      dotEls.push(dot);
    }
    var replayBtn = _el('button', 'cp-bt-replay');
    replayBtn.setAttribute('aria-label', 'Replay this example');
    replayBtn.textContent = '↺';
    header.appendChild(progressEl);
    header.appendChild(dotsEl);
    header.appendChild(replayBtn);
    wrap.appendChild(header);

    /* Tile board */
    var boardEl = _el('div', 'cp-bt-board');
    wrap.appendChild(boardEl);

    /* Streak chip */
    var streakEl = _el('div', 'cp-bt-streak');
    streakEl.setAttribute('aria-live', 'polite');
    streakEl.textContent = '';
    wrap.appendChild(streakEl);

    /* Compare panel */
    var compareEl = _el('div', 'cp-bt-compare');
    compareEl.hidden = true;
    wrap.appendChild(compareEl);

    /* Guide bar */
    var guide = _el('div', 'cp-bt-guide');
    var guideEl = _el('p', 'cp-bt-guide__text');
    guideEl.setAttribute('aria-live', 'assertive');
    var nextBtn = _el('button', 'cp-bt-next');
    nextBtn.textContent = 'Next ▶';
    nextBtn.hidden = true;
    guide.appendChild(guideEl);
    guide.appendChild(nextBtn);
    wrap.appendChild(guide);

    area.appendChild(wrap);

    /* ── State ── */
    var exIdx      = 0;
    var phase      = 'tap';
    var streakCount = 0;
    var answered   = false;

    /* ── Helpers ── */
    function _buildCompare(ex) {
      compareEl.innerHTML = '';
      var cards = [
        { label: 'Left → right', value: ex.compareLeft,  verdict: '✗', cls: 'cp-bt-compare__card--wrong' },
        { label: '× first',      value: ex.compareRight, verdict: '✓', cls: 'cp-bt-compare__card--right' }
      ];
      cards.forEach(function (c) {
        var card = _el('div', 'cp-bt-compare__card ' + c.cls);
        var lbl  = _el('span', 'cp-bt-compare__label');
        lbl.textContent = c.label;
        var val  = _el('span', 'cp-bt-compare__val');
        val.textContent = c.value;
        var verd = _el('span', 'cp-bt-compare__verdict');
        verd.textContent = c.verdict;
        verd.setAttribute('aria-hidden', 'true');
        card.appendChild(lbl);
        card.appendChild(val);
        card.appendChild(verd);
        compareEl.appendChild(card);
      });
    }

    function _afterBuild(ex, i) {
      phase = 'done';

      /* Streak chip */
      streakCount++;
      var streakText = 'First pick: ×';
      for (var s = 0; s < streakCount; s++) streakText += ' ✓';
      streakEl.textContent = streakText;
      streakEl.setAttribute('aria-label', streakText);

      /* Compare panel */
      if (ex.hasCompare) {
        _buildCompare(ex);
        compareEl.hidden = false;
        if (typeof anime !== 'undefined') {
          anime.set(compareEl, { opacity: 0, translateY: 10 });
          anime({ targets: compareEl, opacity: 1, translateY: 0, duration: 400, easing: 'easeOutBack' });
        } else {
          compareEl.style.opacity = '1';
        }
      }

      guideEl.textContent = i < examples.length - 1
        ? 'Great! Tap Next for the next one.'
        : "Excellent! You've got the rule!";

      nextBtn.hidden = false;
      if (typeof anime !== 'undefined') {
        anime.set(nextBtn, { opacity: 0 });
        anime({ targets: nextBtn, opacity: 1, duration: 280, easing: 'easeOutQuad' });
      } else {
        nextBtn.style.opacity = '1';
      }

      /* Last example auto-advances */
      if (i === examples.length - 1) {
        setTimeout(function () {
          if (_currentPageId === page.id) _wipeLeftTo(page.next);
        }, 2800);
      }
    }

    function _runBuildAnimation(ex, i) {
      var tiles    = Array.prototype.slice.call(boardEl.querySelectorAll('.cp-bt-tile'));
      var mulTiles = tiles.filter(function (t) { return t.classList.contains('cp-bt-tile--mul'); });

      /* Step 1: glow on × tiles */
      mulTiles.forEach(function (t) { t.classList.add('cp-bt-tile--mul-glow'); });

      if (typeof anime === 'undefined') {
        boardEl.innerHTML = '';
        var ansSpan = _el('button', 'cp-bt-tile cp-bt-tile--answer');
        ansSpan.textContent = ex.answer;
        boardEl.appendChild(ansSpan);
        if (typeof launchConfetti === 'function') launchConfetti();
        setTimeout(function () { _afterBuild(ex, i); }, 300);
        return;
      }

      /* Step 2: show simplified expression */
      setTimeout(function () {
        boardEl.innerHTML = '';
        ex.finalExpr.forEach(function (tok) {
          var t = _el('button', 'cp-bt-tile ' + (tok === '−' ? 'cp-bt-tile--add' : 'cp-bt-tile--num'));
          t.textContent = tok;
          t.setAttribute('aria-disabled', 'true');
          t.setAttribute('tabindex', '-1');
          boardEl.appendChild(t);
        });
        var newTiles = Array.prototype.slice.call(boardEl.querySelectorAll('.cp-bt-tile'));
        anime.set(newTiles, { opacity: 0, scale: 0.7 });
        anime({ targets: newTiles, opacity: 1, scale: 1, duration: 380, delay: anime.stagger(60), easing: 'easeOutBack' });
      }, 600);

      /* Step 3: answer tile bursts in */
      setTimeout(function () {
        boardEl.innerHTML = '';
        var ansEq = _el('button', 'cp-bt-tile cp-bt-tile--add');
        ansEq.textContent = '=';
        ansEq.setAttribute('aria-disabled', 'true');
        ansEq.setAttribute('tabindex', '-1');
        var ansTile = _el('button', 'cp-bt-tile cp-bt-tile--answer');
        ansTile.textContent = ex.answer;
        ansTile.setAttribute('aria-label', 'Answer: ' + ex.answer);
        ansTile.setAttribute('aria-disabled', 'true');
        ansTile.setAttribute('tabindex', '-1');

        ex.finalExpr.forEach(function (tok) {
          var t = _el('button', 'cp-bt-tile cp-bt-tile--num');
          t.textContent = tok;
          t.setAttribute('aria-disabled', 'true');
          t.setAttribute('tabindex', '-1');
          boardEl.appendChild(t);
        });
        boardEl.appendChild(ansEq);
        boardEl.appendChild(ansTile);

        anime.set(ansTile, { opacity: 0, scale: 0.5 });
        anime({
          targets: ansTile,
          opacity: 1,
          scale: [0.5, 1.3, 1],
          duration: 600,
          easing: 'easeOutBack',
          complete: function () {
            if (typeof launchConfetti === 'function') launchConfetti();
            _afterBuild(ex, i);
          }
        });
        if (typeof playStarPop === 'function') playStarPop();
      }, 1200);
    }

    function _onTileTap(tile, ex, i, isMultiply) {
      if (answered || phase !== 'tap') return;

      if (!isMultiply) {
        /* WRONG */
        if (typeof playWrong === 'function') playWrong();
        tile.classList.add('cp-bt-tile--wrong');
        setTimeout(function () { tile.classList.remove('cp-bt-tile--wrong'); }, 700);
        if (typeof anime !== 'undefined') {
          anime({ targets: tile, translateX: [0, -8, 8, -6, 6, 0], duration: 380, easing: 'easeInOutSine' });
          var mulTiles = Array.prototype.slice.call(boardEl.querySelectorAll('.cp-bt-tile--mul'));
          if (mulTiles.length) {
            anime({ targets: mulTiles, scale: [1, 1.1, 1], duration: 500, delay: 150, easing: 'easeInOutSine' });
          }
        }
        guideEl.textContent = 'Try tapping the × group instead.';
        return;
      }

      /* CORRECT */
      answered = true;
      phase = 'build';
      if (typeof playCorrect === 'function') playCorrect();
      guideEl.textContent = 'Nice! Watch the calculation build…';
      _runBuildAnimation(ex, i);
    }

    function _loadExample(ex, i) {
      phase    = 'tap';
      answered = false;

      progressEl.textContent = 'Example ' + (i + 1) + ' of ' + examples.length;
      dotEls.forEach(function (d, di) {
        d.className = 'cp-bt-dot' + (di === i ? ' cp-bt-dot--active' : (di < i ? ' cp-bt-dot--done' : ''));
      });

      boardEl.innerHTML = '';
      compareEl.hidden  = true;
      nextBtn.hidden    = true;
      guideEl.textContent = 'Tap the × part to solve it first.';

      ex.tokens.forEach(function (tok, ti) {
        var isMultiply = ex.multiplyIndices.indexOf(ti) !== -1;
        var isMinus    = ex.minusIndices.indexOf(ti) !== -1;
        var cls = 'cp-bt-tile';
        if (isMultiply) {
          cls += ' cp-bt-tile--mul';
        } else if (isMinus || tok === '−') {
          cls += ' cp-bt-tile--add';
        } else {
          cls += ' cp-bt-tile--num';
        }
        var tile = _el('button', cls);
        tile.textContent = tok;
        tile.dataset.idx = ti;
        tile.setAttribute('aria-label', 'Tap ' + tok);
        (function (t, ex2, i2, isMul) {
          t.addEventListener('click', function () { _onTileTap(t, ex2, i2, isMul); });
          t.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.click(); }
          });
        }(tile, ex, i, isMultiply));
        boardEl.appendChild(tile);
      });

      if (typeof ContentAnimations !== 'undefined') {
        ContentAnimations.run('mbsTry');
      }
    }

    /* ── Event Listeners ── */
    nextBtn.addEventListener('click', function () {
      if (exIdx < examples.length - 1) {
        exIdx++;
        _loadExample(examples[exIdx], exIdx);
      }
    });

    replayBtn.addEventListener('click', function () {
      if (phase === 'done') return;
      _loadExample(examples[exIdx], exIdx);
    });

    /* ── Boot ── */
    _loadExample(examples[0], 0);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 3.2 — mbs-reveal  (× before − rule card)
  ══════════════════════════════════════════════════════ */

  function _renderMbsReveal(page, area) {
    var wrap = _el('div', 'cp-br-wrap');
    wrap.dataset.pageId = page.id;

    var card = _el('div', 'cp-br-card');

    /* Badge */
    var badge = _el('div', 'cp-br-card__badge');
    badge.textContent = page.title || 'You found the rule!';
    card.appendChild(badge);

    /* Rule text */
    var ruleEl = _el('p', 'cp-br-card__rule');
    ruleEl.textContent = page.ruleText || '';
    card.appendChild(ruleEl);

    /* Worked example */
    var workedEl = _el('div', 'cp-br-worked');
    (page.workedSteps || []).forEach(function (step) {
      var line = _el('div', 'cp-br-worked__line');
      var tokens = step.expr.split(' ');
      tokens.forEach(function (tok, ti) {
        if (ti > 0) line.appendChild(document.createTextNode(' '));
        var isHL = step.highlight && step.highlight.indexOf(ti) !== -1;
        if (isHL) {
          var hl = _el('span', 'cp-br-worked__hl');
          hl.textContent = tok;
          line.appendChild(hl);
        } else {
          line.appendChild(document.createTextNode(tok));
        }
      });
      workedEl.appendChild(line);
    });
    card.appendChild(workedEl);

    /* BODMAS tag */
    var tagEl = _el('p', 'cp-br-bodmas-tag');
    tagEl.textContent = page.bodmasTag || '';
    card.appendChild(tagEl);

    /* Connect line */
    if (page.connectLine) {
      var connectEl = _el('p', 'cp-br-connect');
      connectEl.textContent = page.connectLine;
      card.appendChild(connectEl);
    }

    /* Recap chips */
    var chipsEl = _el('div', 'cp-br-chips');
    (page.chips || []).forEach(function (chipText) {
      var chip = _el('span', 'cp-br-chip');
      chip.textContent = chipText;
      chipsEl.appendChild(chip);
    });
    card.appendChild(chipsEl);

    /* Buttons */
    var btnsEl = _el('div', 'cp-br-btns');
    var pracBtn = _el('button', 'cp-br-btn cp-br-btn--practice');
    pracBtn.textContent = page.buttonPractice || 'Practice →';
    pracBtn.addEventListener('click', function () { _wipeLeftTo(page.next); });
    var nextMissionBtn = _el('button', 'cp-br-btn cp-br-btn--next');
    nextMissionBtn.textContent = page.buttonNext || 'Next Mission ▶';
    nextMissionBtn.addEventListener('click', function () { _wipeLeftTo('4.0'); });
    btnsEl.appendChild(pracBtn);
    btnsEl.appendChild(nextMissionBtn);
    card.appendChild(btnsEl);

    wrap.appendChild(card);
    area.appendChild(wrap);

    /* Confetti burst after badge pops */
    setTimeout(function () {
      if (typeof launchConfetti === 'function') launchConfetti();
    }, 800);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 3.3 — mbs-practice  (4-question quiz)
  ══════════════════════════════════════════════════════ */

  function _renderMbsPractice(page, area) {
    var wrap = _el('div', 'cp-bp-wrap');
    wrap.dataset.pageId = page.id;

    /* Progress bar */
    var barEl  = _el('div', 'cp-bp-progress-bar');
    var fillEl = _el('div', 'cp-bp-progress-bar__fill');
    fillEl.style.width = '0%';
    barEl.appendChild(fillEl);
    wrap.appendChild(barEl);

    /* Quiz card */
    var cardEl    = _el('div', 'cp-bp-card');
    var headerEl  = _el('div', 'cp-bp-card__header');
    var labelEl   = _el('p',   'cp-bp-card__label');
    labelEl.setAttribute('aria-live', 'polite');
    var exprEl    = _el('p',   'cp-bp-card__expr');
    var promptEl  = _el('p',   'cp-bp-card__prompt');
    var bodyEl    = _el('div', 'cp-bp-card__body');
    var feedbackEl = _el('p',  'cp-bp-feedback');
    feedbackEl.setAttribute('aria-live', 'assertive');

    headerEl.appendChild(labelEl);
    cardEl.appendChild(headerEl);
    cardEl.appendChild(exprEl);
    cardEl.appendChild(promptEl);
    cardEl.appendChild(bodyEl);
    cardEl.appendChild(feedbackEl);
    wrap.appendChild(cardEl);

    area.appendChild(wrap);

    /* ── State ── */
    var qIdx     = 0;
    var qDone    = 0;
    var stepIdx  = 0;
    var answered = false;
    var questions = page.questions || [];

    /* ── Helpers ── */
    function _onAnswerWrong(q, hintText) {
      feedbackEl.textContent = hintText || q.wrongHint || '';
      feedbackEl.className   = 'cp-bp-feedback cp-bp-feedback--hint';
      if (typeof playWrong === 'function') playWrong();
      if (typeof anime !== 'undefined') {
        anime({ targets: cardEl, translateX: [0, -8, 8, -6, 6, 0], duration: 380, easing: 'easeInOutSine' });
        anime.set(feedbackEl, { opacity: 0 });
        anime({ targets: feedbackEl, opacity: 1, duration: 220, easing: 'easeOutQuad' });
      } else {
        feedbackEl.style.opacity = '1';
      }
    }

    function _showCompletion() {
      cardEl.innerHTML = '';
      var msg = _el('p', 'cp-bp-completion');
      msg.textContent = page.completionMsg || 'Well done!';
      var homeBtn = _el('button', 'cp-bp-home-btn');
      homeBtn.textContent = '🏠 Menu';
      homeBtn.addEventListener('click', function () { _wipeLeftTo(page.next); });
      cardEl.appendChild(msg);
      cardEl.appendChild(homeBtn);
      if (typeof launchConfetti === 'function') launchConfetti();
      if (typeof anime !== 'undefined') {
        anime.set(cardEl, { opacity: 0, scale: 0.92 });
        anime({ targets: cardEl, opacity: 1, scale: 1, duration: 500, easing: 'easeOutBack' });
      } else {
        cardEl.style.opacity = '1';
      }
    }

    function _onAnswerCorrect(q, i) {
      answered = true;
      feedbackEl.textContent = q.okMsg || 'Correct!';
      feedbackEl.className   = 'cp-bp-feedback cp-bp-feedback--ok';
      if (typeof playCorrect === 'function') playCorrect();
      if (typeof anime !== 'undefined') {
        anime.set(feedbackEl, { opacity: 0 });
        anime({ targets: feedbackEl, opacity: 1, duration: 220, easing: 'easeOutQuad' });
      } else {
        feedbackEl.style.opacity = '1';
      }

      /* Fill bar */
      qDone++;
      var pct = (qDone / questions.length) * 100;
      if (typeof anime !== 'undefined') {
        anime({ targets: fillEl, width: pct + '%', duration: 500, easing: 'easeOutQuad' });
      } else {
        fillEl.style.width = pct + '%';
      }

      setTimeout(function () {
        if (_currentPageId !== page.id) return;
        if (i < questions.length - 1) {
          qIdx     = i + 1;
          answered = false;
          stepIdx  = 0;
          _loadQuestion(questions[qIdx], qIdx);
        } else {
          _showCompletion();
        }
      }, 1600);
    }

    function _loadQuestion(q, i) {
      labelEl.textContent    = 'Question ' + (i + 1) + ' of ' + questions.length;
      exprEl.textContent     = q.expression || '';
      exprEl.style.display   = q.expression ? '' : 'none';
      promptEl.textContent   = q.prompt || '';
      feedbackEl.textContent = '';
      feedbackEl.className   = 'cp-bp-feedback';
      bodyEl.innerHTML       = '';
      answered               = false;
      stepIdx                = 0;

      if (typeof anime !== 'undefined') {
        anime.set(bodyEl, { opacity: 0 });
        anime({ targets: bodyEl, opacity: 1, duration: 300, easing: 'easeOutQuad' });
      }

      if (q.kind === 'tap-operator') {
        /* Show expression row: 10 [−] 3 [×] 2 — operators are tappable */
        var row = _el('div', 'cp-bp-op-row');
        var nums = ['10', null, '3', null, '2'];
        var ops  = q.tokens || ['−', '×'];
        var opIdx = 0;
        nums.forEach(function (n) {
          if (n !== null) {
            var numSpan = _el('span', 'cp-bp-num');
            numSpan.textContent = n;
            row.appendChild(numSpan);
          } else {
            var opTok = ops[opIdx++];
            var opBtn = _el('button', 'cp-bp-tile');
            opBtn.textContent = opTok;
            var localOpIdx = opIdx - 1;
            opBtn.addEventListener('click', function () {
              if (answered) return;
              if (localOpIdx === q.correctIndex) {
                opBtn.classList.add('cp-bp-tile--correct');
                _onAnswerCorrect(q, i);
              } else {
                opBtn.classList.add('cp-bp-tile--wrong');
                setTimeout(function () { opBtn.classList.remove('cp-bp-tile--wrong'); }, 700);
                _onAnswerWrong(q);
              }
            });
            row.appendChild(opBtn);
          }
        });
        bodyEl.appendChild(row);

      } else if (q.kind === 'choose-rule') {
        var optRow = _el('div', 'cp-bp-opt-row');
        (q.options || []).forEach(function (opt, oi) {
          var btn = _el('button', 'cp-bp-option');
          btn.textContent = opt;
          btn.addEventListener('click', function () {
            if (answered) return;
            if (oi === q.correctIndex) {
              btn.classList.add('cp-bp-option--correct');
              _onAnswerCorrect(q, i);
            } else {
              btn.classList.add('cp-bp-option--wrong');
              setTimeout(function () { btn.classList.remove('cp-bp-option--wrong'); }, 700);
              _onAnswerWrong(q);
            }
          });
          optRow.appendChild(btn);
        });
        bodyEl.appendChild(optRow);

      } else if (q.kind === 'step-by-step') {
        function _showStep(sIdx) {
          bodyEl.innerHTML = '';
          var step = q.steps[sIdx];
          var instEl = _el('p', 'cp-bp-step-inst');
          instEl.textContent = step.instruction;
          var subEl  = _el('p', 'cp-bp-step-expr');
          subEl.textContent = step.subExpr;
          var choiceRow = _el('div', 'cp-bp-choice-row');
          step.choices.forEach(function (ch) {
            var btn = _el('button', 'cp-bp-choice');
            btn.textContent = ch;
            btn.addEventListener('click', function () {
              if (answered) return;
              if (ch === step.correct) {
                btn.classList.add('cp-bp-choice--correct');
                if (typeof playCorrect === 'function') playCorrect();
                if (sIdx < q.steps.length - 1) {
                  setTimeout(function () { _showStep(sIdx + 1); }, 800);
                } else {
                  _onAnswerCorrect(q, i);
                }
              } else {
                btn.classList.add('cp-bp-choice--wrong');
                setTimeout(function () { btn.classList.remove('cp-bp-choice--wrong'); }, 700);
                _onAnswerWrong(q);
              }
            });
            choiceRow.appendChild(btn);
          });
          bodyEl.appendChild(instEl);
          bodyEl.appendChild(subEl);
          bodyEl.appendChild(choiceRow);
          if (typeof anime !== 'undefined') {
            anime.set(bodyEl, { opacity: 0 });
            anime({ targets: bodyEl, opacity: 1, duration: 300, easing: 'easeOutQuad' });
          }
        }
        _showStep(0);

      } else if (q.kind === 'which-method') {
        var methodRow = _el('div', 'cp-bp-method-row');
        (q.methods || []).forEach(function (m, mi) {
          var mCard = _el('button', 'cp-bp-method-card');
          var lbl   = _el('span', 'cp-bp-method-card__label');
          lbl.textContent = m.label;
          var stepsEl = _el('span', 'cp-bp-method-card__steps');
          stepsEl.textContent = m.steps;
          mCard.appendChild(lbl);
          mCard.appendChild(stepsEl);
          mCard.addEventListener('click', function () {
            if (answered) return;
            if (mi === q.correctIndex) {
              mCard.classList.add('cp-bp-method-card--correct');
              _onAnswerCorrect(q, i);
            } else {
              mCard.classList.add('cp-bp-method-card--wrong');
              setTimeout(function () { mCard.classList.remove('cp-bp-method-card--wrong'); }, 700);
              _onAnswerWrong(q);
            }
          });
          methodRow.appendChild(mCard);
        });
        bodyEl.appendChild(methodRow);
      }
    }

    /* Boot */
    _loadQuestion(questions[0], 0);
  }

  function _findPage(id) {
    for (var i = 0; i < CONTENT_PAGES.length; i++) {
      if (CONTENT_PAGES[i].id === id) return CONTENT_PAGES[i];
    }
    return null;
  }

  function _el(tag, cls) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
  }

  /* ══════════════════════════════════════════════════════
     PAGE 4.1 — multiplication-lab
  ══════════════════════════════════════════════════════ */

  function _renderMultiplicationLab(page, area) {

    /* ── Number generation with retry ───────────────── */
    function _mlToIndian(n) {
      var s = String(n), res = s.slice(-3), rem = s.slice(0, -3);
      while (rem.length > 0) { res = rem.slice(-2) + ',' + res; rem = rem.slice(0, -2); }
      return res;
    }
    function _mlDigits8(n) {
      return ('00000000' + String(n)).slice(-8).split('');
    }

    var bigNumber, multiplier, onesDigit, tensDigit, part1, part2, finalSum;
    var attempts = 0;
    do {
      var is7digit = Math.random() < 0.45;
      bigNumber = is7digit
        ? Math.floor(Math.random() * (3200000 - 1000000 + 1)) + 1000000
        : Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
      do {
        multiplier = Math.floor(Math.random() * (98 - 11 + 1)) + 11;
      } while (multiplier % 10 === 0 || Math.floor(multiplier / 10) === 0);
      attempts++;
    } while ((bigNumber * multiplier) > 99999999 && attempts < 200);

    onesDigit = multiplier % 10;
    tensDigit = Math.floor(multiplier / 10);
    part1     = bigNumber * onesDigit;
    part2     = bigNumber * tensDigit * 10;
    finalSum  = bigNumber * multiplier;

    _multiplicationLabResult = { bigNumber: bigNumber, multiplier: multiplier, product: finalSum };

    var bigDigits8  = _mlDigits8(bigNumber);
    var multDigits8 = _mlDigits8(multiplier);
    var bigFmt      = _mlToIndian(bigNumber);
    var multFmt     = _mlToIndian(multiplier);

    /* ── State ──────────────────────────────────────── */
    var step         = 'a';
    var tokenPlaced  = false;
    var tokenSnapCol = 0;
    var _wigTimer    = null;

    /* ── DOM build ──────────────────────────────────── */
    var wrap = _el('div', 'cp-multiplication-lab');
    wrap.dataset.pageId = '4.1';

    var titleEl = _el('h1', 'cp-title');
    titleEl.textContent = page.title || 'Multiplication Lab';
    wrap.appendChild(titleEl);

    var subtitleEl = _el('p', 'cp-ml-subtitle');
    wrap.appendChild(subtitleEl);

    var statusEl = _el('p', 'cp-ml-status-msg');
    wrap.appendChild(statusEl);

    /* Header card — always visible */
    var headerCard = _el('div', 'cp-ml-header-card');
    var hcBig   = _el('span', 'cp-ml-hc-big');   hcBig.textContent   = bigFmt;
    var hcOp    = _el('span', 'cp-ml-hc-op');    hcOp.textContent    = '×';
    var hcSmall = _el('span', 'cp-ml-hc-small'); hcSmall.textContent = multFmt;
    var hcEqEl  = _el('span', 'cp-ml-hc-eq');
    headerCard.appendChild(hcBig);
    headerCard.appendChild(hcOp);
    headerCard.appendChild(hcSmall);
    headerCard.appendChild(hcEqEl);
    wrap.appendChild(headerCard);

    /* Placement board */
    var topCard = _el('div', 'cp-ml-top-card');
    var boardArea = _el('div', 'cp-ml-board-area');

    var opSign = _el('div', 'cp-ml-op-sign');
    opSign.textContent = '×';
    opSign.style.opacity = '0';
    boardArea.appendChild(opSign);

    var board = _el('div', 'cp-ml-board');

    var headerRow = _el('div', 'cp-ml-data-row cp-ml-headers');
    (page.headers || ['C','TL','L','TTh','Th','H','T','O']).forEach(function (h) {
      var c = _el('div', 'cp-ml-header-cell'); c.textContent = h; headerRow.appendChild(c);
    });
    board.appendChild(headerRow);

    var topRow = _el('div', 'cp-ml-data-row cp-ml-top-row');
    for (var i = 0; i < 8; i++) topRow.appendChild(_el('div', 'cp-ml-cell'));
    board.appendChild(topRow);
    board.appendChild(_el('div', 'cp-ml-divider'));

    var botRow = _el('div', 'cp-ml-data-row cp-ml-bot-row');
    for (var j = 0; j < 8; j++) botRow.appendChild(_el('div', 'cp-ml-cell'));
    board.appendChild(botRow);

    boardArea.appendChild(board);
    topCard.appendChild(boardArea);
    wrap.appendChild(topCard);

    /* Source panel (steps a & b) */
    var bottomCard = _el('div', 'cp-ml-bottom-card');
    var sourceTitle = _el('p', 'cp-ml-source-title');
    bottomCard.appendChild(sourceTitle);

    var sourceStage = _el('div', 'cp-ml-source-stage');
    var token = _el('div', 'cp-ml-token');
    sourceStage.appendChild(token);
    bottomCard.appendChild(sourceStage);

    var caption = _el('p', 'cp-ml-caption');
    bottomCard.appendChild(caption);
    wrap.appendChild(bottomCard);

    /* Ghost snap preview */
    var ghostToken = _el('div', 'cp-ml-token cp-ml-token--ghost');
    ghostToken.style.display = 'none';
    wrap.appendChild(ghostToken);

    /* Work area (steps c–e, hidden initially) — 2-column layout */
    var workArea = _el('div', 'cp-ml-work-area');
    workArea.style.display = 'none';

    /* Left column: step instruction + grid */
    var workLeft = _el('div', 'cp-ml-work-left');
    var workSubtitle = _el('p', 'cp-ml-work-subtitle');
    workLeft.appendChild(workSubtitle);

    var workBoardWrap = _el('div', 'cp-ml-work-board');
    var workBoardArea = _el('div', 'cp-ml-board-area');
    var workOpSign = _el('div', 'cp-ml-op-sign');
    workOpSign.textContent = '×';
    workBoardArea.appendChild(workOpSign);

    var workGrid = _el('div', 'cp-ml-board');
    var wkHdrRow = _el('div', 'cp-ml-data-row cp-ml-headers');
    (page.headers || ['C','TL','L','TTh','Th','H','T','O']).forEach(function (h) {
      var c = _el('div', 'cp-ml-header-cell'); c.textContent = h; wkHdrRow.appendChild(c);
    });
    workGrid.appendChild(wkHdrRow);

    var wkTopRow = _el('div', 'cp-ml-data-row cp-ml-wk-top');
    workGrid.appendChild(wkTopRow);

    var wkBotRow = _el('div', 'cp-ml-data-row cp-ml-wk-bot');
    workGrid.appendChild(wkBotRow);
    workGrid.appendChild(_el('div', 'cp-ml-divider'));

    var part1Row = _el('div', 'cp-ml-data-row cp-ml-part1-row');
    for (var p = 0; p < 8; p++) part1Row.appendChild(_el('div', 'cp-ml-cell'));
    workGrid.appendChild(part1Row);

    var part2Row = _el('div', 'cp-ml-data-row cp-ml-part2-row');
    for (var q = 0; q < 8; q++) part2Row.appendChild(_el('div', 'cp-ml-cell'));
    var part2Cells = part2Row.querySelectorAll('.cp-ml-cell');
    var ghostZeroEl = _el('span', 'cp-ml-ghost-zero');
    ghostZeroEl.setAttribute('aria-hidden', 'true');
    ghostZeroEl.textContent = '0';
    var ghostArrow = _el('span', 'cp-ml-ghost-zero-arrow');
    ghostArrow.textContent = '← starts with 0';
    part2Cells[7].style.position = 'relative';
    part2Cells[7].appendChild(ghostZeroEl);
    part2Cells[7].appendChild(ghostArrow);
    part2Row.style.display = 'none';
    workGrid.appendChild(part2Row);

    var addBlock = _el('div', 'cp-ml-add-block');
    addBlock.style.display = 'none';
    var plusMark = _el('div', 'cp-ml-plus-mark');
    plusMark.textContent = '+';
    addBlock.appendChild(plusMark);
    addBlock.appendChild(_el('div', 'cp-ml-add-divider'));
    workGrid.appendChild(addBlock);

    var sumRow = _el('div', 'cp-ml-data-row cp-ml-sum-row');
    for (var r = 0; r < 8; r++) sumRow.appendChild(_el('div', 'cp-ml-cell'));
    sumRow.style.display = 'none';
    workGrid.appendChild(sumRow);

    workBoardArea.appendChild(workGrid);
    workBoardWrap.appendChild(workBoardArea);
    workLeft.appendChild(workBoardWrap);
    workArea.appendChild(workLeft);

    /* Right column: label + input + numpad */
    var workRight = _el('div', 'cp-ml-work-right');
    var answerLabel = _el('p', 'cp-ml-answer-label');
    answerLabel.textContent = 'First row answer';
    workRight.appendChild(answerLabel);

    var answerInput = _el('input', 'cp-ml-answer-input');
    answerInput.type = 'text';
    answerInput.setAttribute('readonly', 'true');
    answerInput.setAttribute('aria-label', 'Your answer');
    workRight.appendChild(answerInput);

    /* Numpad */
    var keyboard = _el('div', 'cp-ml-keyboard');
    [1,2,3,4,5,6,7,8,9,'Clear',0,'Del'].forEach(function (k) {
      var cls = 'cp-ml-key';
      if (k === 'Clear') cls += ' cp-ml-key--clear';
      if (k === 'Del')   cls += ' cp-ml-key--del';
      var btn = _el('button', cls);
      btn.textContent = k;
      btn.addEventListener('click', function () {
        if (k === 'Clear') { answerInput.value = ''; }
        else if (k === 'Del') { answerInput.value = answerInput.value.slice(0, -1); }
        else if (answerInput.value.length < 10) {
          answerInput.value += k;
          tryAutoCheck();
        }
      });
      keyboard.appendChild(btn);
    });
    workRight.appendChild(keyboard);
    workArea.appendChild(workRight);

    wrap.appendChild(workArea);

    /* Actions row */
    var actionsEl = _el('div', 'cp-ml-actions');

    var checkBtn = _el('button', 'cp-btn-primary cp-ml-check-btn');
    checkBtn.textContent = 'Check';
    checkBtn.style.display = 'none';
    actionsEl.appendChild(checkBtn);

    var tryNewBtn = _el('button', 'cp-ml-try-new-btn');
    tryNewBtn.textContent = 'Try New Problem';
    tryNewBtn.style.display = 'none';
    actionsEl.appendChild(tryNewBtn);

    var multiplyBtn = _el('button', 'cp-btn-primary cp-ml-multiply-btn');
    multiplyBtn.textContent = 'Multiply Now →';
    multiplyBtn.style.display = 'none';
    actionsEl.appendChild(multiplyBtn);

    var resetBtn = _el('button', 'cp-ml-reset-btn');
    resetBtn.textContent = 'Reset';
    resetBtn.style.display = 'none';
    actionsEl.appendChild(resetBtn);

    wrap.appendChild(actionsEl);
    area.appendChild(wrap);

    /* ── Intro audio ────────────────────────────────── */
    if (typeof playLevelUpDing === 'function') playLevelUpDing();

    /* ── Helpers ────────────────────────────────────── */
    function showStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className = 'cp-ml-status-msg' + (type ? ' cp-ml-status-msg--' + type : '');
      if (typeof anime !== 'undefined') {
        anime.set(statusEl, { opacity: 0, translateY: 4 });
        anime({ targets: statusEl, opacity: 1, translateY: 0, duration: 280, easing: 'easeOutQuad' });
      }
    }

    function clearStatus() {
      statusEl.textContent = '';
      statusEl.className = 'cp-ml-status-msg';
    }

    function spawnMlConfetti(anchorEl) {
      if (!anchorEl) return;
      var rect  = anchorEl.getBoundingClientRect();
      var wRect = wrap.getBoundingClientRect();
      var cols  = ['#a78bfa','#7c3aed','#2563eb','#f97316','#22c55e','#fbbf24'];
      for (var ci = 0; ci < 14; ci++) {
        var dot = document.createElement('div');
        dot.style.cssText = 'position:absolute;width:7px;height:7px;border-radius:50%;pointer-events:none;z-index:20;';
        dot.style.background = cols[ci % cols.length];
        dot.style.left = ((rect.left - wRect.left) + rect.width / 2) + 'px';
        dot.style.top  = ((rect.top  - wRect.top)  + rect.height / 2) + 'px';
        wrap.appendChild(dot);
        if (typeof anime !== 'undefined') {
          anime({
            targets: dot,
            translateX: (Math.random() - 0.5) * 120,
            translateY: (Math.random() - 0.5) * 80 - 30,
            opacity: [1, 0], duration: 700 + Math.random() * 400, easing: 'easeOutCubic',
            complete: function (an) { if (an.animatables[0]) an.animatables[0].target.remove(); }
          });
        } else { dot.remove(); }
      }
    }

    function animateMlCellPop(row) {
      if (typeof anime === 'undefined') return;
      var cells = row.querySelectorAll('.cp-ml-cell');
      anime.set(cells, { scale: 0, opacity: 0 });
      anime({ targets: cells, scale: [0, 1.15, 1], opacity: 1, duration: 350, delay: anime.stagger(35), easing: 'easeOutBack' });
    }

    function shakeMlEl(el) {
      if (typeof anime !== 'undefined') {
        anime({ targets: el, translateX: [0, -7, 7, -5, 5, -3, 3, 0], duration: 400, easing: 'easeInOutSine' });
      }
    }

    function tryAutoCheck() {
      var raw = answerInput.value.replace(/[^0-9]/g, '');
      if (!raw) return;
      var ent = parseInt(raw, 10);

      /* Exact correct match — submit immediately */
      var match = false;
      if (step === 'c')      match = (ent === part1);
      else if (step === 'd') match = (ent === part2 || ent === bigNumber * tensDigit);
      else                   match = (ent === finalSum);
      if (match) { checkWorkAnswer(); return; }

      /* Auto-submit once the digit count reaches the canonical answer length */
      var expectedLen;
      if (step === 'c')      expectedLen = String(part1).length;
      else if (step === 'd') expectedLen = String(part2).length;
      else                   expectedLen = String(finalSum).length;
      if (raw.length >= expectedLen) checkWorkAnswer();
    }

    function scheduleWiggle() {
      if (_wigTimer) clearTimeout(_wigTimer);
      _wigTimer = setTimeout(function () {
        if (_currentPageId !== '4.1' || tokenPlaced || (step !== 'a' && step !== 'b')) return;
        if (typeof anime !== 'undefined') {
          anime({ targets: token, translateX: [0, -5, 5, -4, 4, 0], duration: 500, easing: 'easeInOutSine' });
        }
        scheduleWiggle();
      }, 3000);
    }

    function getCellUnit() {
      var cell = topRow.querySelector('.cp-ml-cell');
      if (!cell) return 55;
      var cs  = getComputedStyle(topRow);
      var gap = parseFloat(cs.columnGap || cs.gridColumnGap) || 5;
      return cell.offsetWidth + gap;
    }

    function visibleDigits(d8) {
      var idx = 0;
      while (idx < d8.length - 1 && d8[idx] === '0') idx++;
      return d8.slice(idx);
    }

    function fillMlRow(row, digits8) {
      row.innerHTML = '';
      row.classList.remove('cp-ml-row--error', 'cp-ml-row--ready');
      digits8.forEach(function (d) {
        var cell = _el('div', 'cp-ml-cell cp-ml-cell--filled');
        cell.textContent = d;
        row.appendChild(cell);
      });
      row.classList.add('cp-ml-row--filled');
    }

    function fillMlRowCls(row, digits8, cls) {
      row.innerHTML = '';
      row.classList.remove('cp-ml-row--error', 'cp-ml-row--ready');
      digits8.forEach(function (d) {
        var cell = _el('div', 'cp-ml-cell cp-ml-cell--filled ' + cls);
        cell.textContent = d;
        row.appendChild(cell);
      });
      row.classList.add('cp-ml-row--filled');
    }

    /* ── Ghost helpers ────────────────────────────── */
    function buildGhostCells(vd, cellSz, gap) {
      ghostToken.innerHTML = '';
      ghostToken.style.gridTemplateColumns = 'repeat(' + vd.length + ', ' + cellSz + 'px)';
      ghostToken.style.gap = gap + 'px';
      vd.forEach(function (d) {
        var c = _el('div', 'cp-ml-cell cp-ml-cell--big'); c.textContent = d;
        ghostToken.appendChild(c);
      });
    }

    function positionGhost(boardRect, wrapRect, rowRect, tokRect, CELL_UNIT, maxCol) {
      var cy = tokRect.top + tokRect.height / 2;
      if (cy >= rowRect.top - 20 && cy <= rowRect.bottom + 20) {
        var col = Math.round((tokRect.left - boardRect.left) / CELL_UNIT);
        col = Math.max(0, Math.min(maxCol, col));
        ghostToken.style.display = 'grid';
        ghostToken.style.left = (boardRect.left - wrapRect.left + col * CELL_UNIT) + 'px';
        ghostToken.style.top  = (rowRect.top - wrapRect.top) + 'px';
      } else {
        ghostToken.style.display = 'none';
      }
    }

    /* ── Token render ─────────────────────────────── */
    function renderToken() {
      token.innerHTML = '';
      token.className = 'cp-ml-token';
      ghostToken.innerHTML = '';
      ghostToken.style.display = 'none';

      var d8   = step === 'a' ? bigDigits8 : multDigits8;
      var vd   = visibleDigits(d8);
      var cls  = step === 'a' ? 'cp-ml-cell--big' : 'cp-ml-cell--mult';
      var cell0 = topRow.querySelector('.cp-ml-cell');
      var cellSz = cell0 ? cell0.offsetWidth : 42;
      var cs     = getComputedStyle(topRow);
      var gap    = parseFloat(cs.columnGap || cs.gridColumnGap) || 5;

      token.style.gridTemplateColumns = 'repeat(' + vd.length + ', ' + cellSz + 'px)';
      token.style.gap = gap + 'px';
      vd.forEach(function (d) {
        var c = _el('div', 'cp-ml-cell ' + cls); c.textContent = d; token.appendChild(c);
      });

      buildGhostCells(vd, cellSz, gap);
      token.onmousedown  = startTokenDrag;
      token.ontouchstart = startTokenDrag;
      resetTokenPosition();
    }

    function resetTokenPosition() {
      var stageRect = sourceStage.getBoundingClientRect();
      var tokW = token.offsetWidth  || 80;
      var tokH = token.offsetHeight || 42;
      token.style.left = Math.max(0, (stageRect.width  - tokW) / 2) + 'px';
      token.style.top  = Math.max(0, (stageRect.height - tokH) / 2) + 'px';
      token.style.transform = '';
      token.classList.remove('cp-ml-token--error');
      tokenPlaced  = false;
      tokenSnapCol = 0;
      checkBtn.style.display = 'none';
      resetBtn.style.display = 'none';
      scheduleWiggle();
    }

    /* ── Prompt per drag step ─────────────────────── */
    function setDragPrompt() {
      if (step === 'a') {
        subtitleEl.textContent = 'Place the large number on the grid. Drag the whole number to the correct place-value columns.';
        sourceTitle.textContent = 'Large Number To Place';
        caption.textContent = 'Number: ' + bigFmt;
        topRow.classList.add('cp-ml-row--ready');
        botRow.classList.remove('cp-ml-row--ready');
      } else {
        subtitleEl.textContent = 'Great. Now drag the 2-digit number so it lines up in the Tens and Ones places.';
        sourceTitle.textContent = '2-Digit Number To Place';
        caption.textContent = 'Number: ' + multFmt;
        topRow.classList.remove('cp-ml-row--ready');
        botRow.classList.add('cp-ml-row--ready');
      }
    }

    function prepareStepDrag(s) {
      step = s;
      clearStatus();
      setDragPrompt();
      renderToken();
    }

    /* ── Drag-and-drop ────────────────────────────── */
    function startTokenDrag(e) {
      if (tokenPlaced) return;
      e.preventDefault();
      var touch  = e.touches ? e.touches[0] : e;
      var startX = touch.clientX;
      var startY = touch.clientY;
      var startL = parseFloat(token.style.left) || 0;
      var startT = parseFloat(token.style.top)  || 0;

      var activeRow  = step === 'a' ? topRow : botRow;
      var boardRect  = board.getBoundingClientRect();
      var wrapRect   = wrap.getBoundingClientRect();
      var rowRect    = activeRow.getBoundingClientRect();
      var CELL_UNIT  = getCellUnit();
      var vd         = visibleDigits(step === 'a' ? bigDigits8 : multDigits8);
      var maxCol     = 8 - vd.length;

      token.classList.add('cp-ml-token--dragging');
      if (typeof anime !== 'undefined') anime({ targets: token, scale: 1.05, duration: 120, easing: 'easeOutQuad' });

      function onMove(ev) {
        var t2 = ev.touches ? ev.touches[0] : ev;
        token.style.left = (startL + t2.clientX - startX) + 'px';
        token.style.top  = (startT + t2.clientY - startY) + 'px';
        positionGhost(boardRect, wrapRect, rowRect, token.getBoundingClientRect(), CELL_UNIT, maxCol);
      }

      function onEnd() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend',  onEnd);

        token.classList.remove('cp-ml-token--dragging');
        ghostToken.style.display = 'none';
        if (typeof anime !== 'undefined') anime({ targets: token, scale: 1, duration: 120, easing: 'easeOutQuad' });

        var tokRect = token.getBoundingClientRect();
        var cy      = tokRect.top + tokRect.height / 2;

        if (cy >= rowRect.top - 20 && cy <= rowRect.bottom + 20) {
          var col = Math.round((tokRect.left - boardRect.left) / CELL_UNIT);
          col = Math.max(0, Math.min(maxCol, col));
          tokenSnapCol = col;
          var snapStageRect = sourceStage.getBoundingClientRect();
          token.style.left = (boardRect.left - snapStageRect.left + col * CELL_UNIT) + 'px';
          token.style.top  = (rowRect.top    - snapStageRect.top) + 'px';
          tokenPlaced = true;
          if (typeof playTick === 'function') playTick();
          setTimeout(runDragCheck, 350);
        } else {
          showStatus('Drop the whole number onto the highlighted row first so the digits can line up.', 'warn');
          resetTokenPosition();
        }
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend',  onEnd);
    }

    /* ── Check drag placement ─────────────────────── */
    function runDragCheck() {
      if (!tokenPlaced) return;
      var d8          = step === 'a' ? bigDigits8 : multDigits8;
      var expectedCol = 8 - visibleDigits(d8).length;
      var activeRow   = step === 'a' ? topRow : botRow;

      if (tokenSnapCol === expectedCol) {
        /* Correct */
        fillMlRowCls(activeRow, d8, step === 'a' ? 'cp-ml-cell--big' : 'cp-ml-cell--mult');
        animateMlCellPop(activeRow);
        spawnMlConfetti(activeRow);
        if (typeof playCorrect === 'function') playCorrect();
        checkBtn.style.display = 'none';
        token.onmousedown  = null;
        token.ontouchstart = null;
        if (_wigTimer) { clearTimeout(_wigTimer); _wigTimer = null; }

        if (step === 'a') {
          showStatus('Correct drag. The large number is placed correctly in the place-value grid.', 'correct');
          setTimeout(function () {
            if (_currentPageId !== '4.1') return;
            showStatus('Great. Now place the 2-digit multiplier under the large number.', 'info');
            prepareStepDrag('b');
          }, 1400);
        } else {
          showStatus('Correct drag. The 2-digit number is lined up in the Tens and Ones places.', 'correct');
          topRow.classList.add('cp-ml-row--success');
          botRow.classList.add('cp-ml-row--success');
          setTimeout(function () {
            topRow.classList.remove('cp-ml-row--success');
            botRow.classList.remove('cp-ml-row--success');
          }, 500);
          if (typeof anime !== 'undefined') {
            anime({ targets: opSign, opacity: 1, duration: 400, easing: 'easeOutQuad' });
          } else { opSign.style.opacity = '1'; }
          setTimeout(function () {
            if (_currentPageId !== '4.1') return;
            showStatus('Both numbers are placed correctly. Now solve the multiplication step by step.', 'info');
            transitionToWorkArea();
          }, 800);
        }
      } else {
        /* Wrong */
        token.classList.add('cp-ml-token--error');
        shakeMlEl(token);
        if (typeof playWrong === 'function') playWrong();
        checkBtn.style.display = 'none';
        tokenPlaced = false;
        showStatus(
          step === 'a'
            ? 'Incorrect drag. The large number must end at the Ones column on the far right.'
            : 'Incorrect drag. The 2-digit number must sit in the Tens and Ones columns.',
          'error'
        );
        resetBtn.style.display = '';
        if (typeof anime !== 'undefined') {
          anime.set(resetBtn, { opacity: 0, translateY: 10 });
          anime({ targets: resetBtn, opacity: 1, translateY: 0, duration: 280, easing: 'easeOutBack' });
        }
      }
    }
    checkBtn.addEventListener('click', runDragCheck);

    /* ── Transition to work area ──────────────────── */
    function transitionToWorkArea() {
      if (typeof anime !== 'undefined') {
        anime({
          targets: bottomCard, opacity: 0, translateY: 20, duration: 400, easing: 'easeInQuad',
          complete: function () {
            bottomCard.style.display = 'none';
            activateWorkArea();
          }
        });
      } else {
        bottomCard.style.display = 'none';
        activateWorkArea();
      }
    }

    function activateWorkArea() {
      topCard.style.display = 'none';
      subtitleEl.style.display = 'none';
      fillMlRowCls(wkTopRow, bigDigits8, 'cp-ml-cell--big');
      fillMlRowCls(wkBotRow, multDigits8, 'cp-ml-cell--mult');
      workArea.style.display = 'flex';
      if (typeof anime !== 'undefined') {
        anime.set(workArea, { opacity: 0, translateY: 30 });
        anime({ targets: workArea, opacity: 1, translateY: 0, duration: 600, easing: 'easeOutQuad' });
      }
      prepareWorkStep('c');
    }

    /* ── Work step management ─────────────────────── */
    function prepareWorkStep(s) {
      step = s;
      clearStatus();
      answerInput.value = '';
      answerInput.classList.remove('cp-ml-input--correct', 'cp-ml-input--error');
      resetBtn.style.display = 'none';

      if (s === 'c') {
        workSubtitle.textContent = 'Step 1: Multiply ' + bigFmt + ' by ' + onesDigit + '. Write the first row.';
        answerLabel.textContent = 'First row answer';
        answerInput.placeholder = '';
        part1Row.classList.add('cp-ml-row--ready');
        if (typeof anime !== 'undefined') {
          anime.set(part1Row, { opacity: 0 });
          anime({ targets: part1Row, opacity: 1, duration: 400, delay: 400, easing: 'easeOutQuad' });
        }
      } else if (s === 'd') {
        workSubtitle.textContent = 'Step 2: Multiply ' + bigFmt + ' × ' + tensDigit + '. The row shifts left by one place.';
        answerLabel.textContent = 'Second row answer';
        answerInput.placeholder = '';
        part1Row.classList.remove('cp-ml-row--ready');
        part2Row.style.display = '';
        part2Row.classList.add('cp-ml-row--ready');
        if (typeof anime !== 'undefined') {
          anime.set(part2Row, { opacity: 0, translateY: 10 });
          anime({ targets: part2Row, opacity: 1, translateY: 0, duration: 400, easing: 'easeOutQuad',
            complete: function () {
              anime({ targets: [ghostZeroEl, ghostArrow], opacity: 1, duration: 280, easing: 'easeOutQuad' });
              var botCells = wkBotRow.querySelectorAll('.cp-ml-cell');
              if (botCells[6]) {
                anime({ targets: botCells[6],
                  boxShadow: ['0 0 0px rgba(249,115,22,0)', '0 0 10px rgba(249,115,22,0.85)', '0 0 0px rgba(249,115,22,0)'],
                  duration: 800, easing: 'easeInOutSine' });
              }
              var p2Cells = part2Row.querySelectorAll('.cp-ml-cell');
              anime({ targets: p2Cells,
                boxShadow: [
                  { value: 'inset 0 0 0px rgba(249,115,22,0)', duration: 0 },
                  { value: 'inset 0 0 8px rgba(249,115,22,0.55)', duration: 180 },
                  { value: 'inset 0 0 0px rgba(249,115,22,0)', duration: 300 }
                ],
                delay: anime.stagger(55, { from: 'last' }), easing: 'easeOutSine'
              });
            }
          });
        }
      } else if (s === 'e') {
        workSubtitle.textContent = 'Step 3: Add the two partial products to get the final product.';
        answerLabel.textContent = 'Final product';
        answerInput.placeholder = '';
        part2Row.classList.remove('cp-ml-row--ready');
        addBlock.style.display = '';
        sumRow.style.display = '';
        sumRow.classList.add('cp-ml-row--ready');
        if (typeof anime !== 'undefined') {
          anime.set([addBlock, sumRow], { opacity: 0 });
          anime({ targets: addBlock, opacity: 1, duration: 400, easing: 'easeOutQuad' });
          anime({ targets: sumRow, opacity: 1, duration: 400, delay: 400, easing: 'easeOutQuad' });
          var sCells = sumRow.querySelectorAll('.cp-ml-cell');
          anime({ targets: sCells,
            boxShadow: [
              { value: 'inset 0 0 0px rgba(34,197,94,0)', duration: 0 },
              { value: 'inset 0 0 10px rgba(34,197,94,0.6)', duration: 200 },
              { value: 'inset 0 0 0px rgba(34,197,94,0)', duration: 350 }
            ],
            delay: anime.stagger(70, { from: 'last', start: 800 }), easing: 'easeOutSine'
          });
        }
      }
    }

    /* ── Work answer check ────────────────────────── */
    function checkWorkAnswer() {
      var raw     = answerInput.value.replace(/[^0-9]/g, '');
      var entered = parseInt(raw, 10);
      var expected, displayVal, activeRow;

      if (step === 'c') {
        expected = part1; displayVal = part1; activeRow = part1Row;
      } else if (step === 'd') {
        /* Accept multiplication result with OR without the trailing positional zero */
        var p2Base = bigNumber * tensDigit;
        expected   = (entered === p2Base) ? p2Base : part2;
        displayVal = part2;  /* always fill the row with the shifted value */
        activeRow  = part2Row;
      } else {
        expected = finalSum; displayVal = finalSum; activeRow = sumRow;
      }

      if (!raw || isNaN(entered)) {
        shakeMlEl(answerInput);
        showStatus('Please enter a number first.', 'warn');
        return;
      }

      if (entered === expected) {
        answerInput.value = '';
        answerInput.classList.remove('cp-ml-input--error');
        if (typeof playCorrect === 'function') playCorrect();
        fillMlRow(activeRow, _mlDigits8(displayVal));
        activeRow.classList.remove('cp-ml-row--ready');
        if (step === 'd' && typeof anime !== 'undefined') {
          anime.set(part2Row.querySelectorAll('.cp-ml-cell'), { scale: 0, opacity: 0 });
        }
        if (step !== 'd') animateMlCellPop(activeRow);
        spawnMlConfetti(activeRow);

        if (step === 'c') {
          showStatus('Correct! That is the first partial product using the ones digit.', 'correct');
          setTimeout(function () { if (_currentPageId === '4.1') prepareWorkStep('d'); }, 1200);
        } else if (step === 'd') {
          var p2AllCells = part2Row.querySelectorAll('.cp-ml-cell');
          if (typeof anime !== 'undefined') {
            anime({ targets: p2AllCells[7], scale: [0, 1.3, 1], opacity: 1, duration: 350, easing: 'easeOutBack' });
            anime({ targets: Array.prototype.slice.call(p2AllCells, 0, 7), scale: [0, 1.15, 1], opacity: 1,
              duration: 350, delay: anime.stagger(35, { start: 120 }), easing: 'easeOutBack' });
            setTimeout(function () {
              anime({ targets: p2AllCells[7],
                boxShadow: ['0 0 0px rgba(249,115,22,0)', '0 0 16px rgba(249,115,22,0.9)', '0 0 0px rgba(249,115,22,0)'],
                duration: 500, easing: 'easeOutSine' });
            }, 60);
          }
          showStatus('Correct! The second row is shifted because you multiplied by tens.', 'correct');
          setTimeout(function () { if (_currentPageId === '4.1') prepareWorkStep('e'); }, 1200);
        } else {
          showStatus('Correct! ' + _mlToIndian(finalSum) + ' is the full product.', 'correct');
          spawnMlConfetti(sumRow);
          workSubtitle.textContent = 'Excellent work. You completed the long multiplication.';
          var eqStr = ' = ' + _mlToIndian(finalSum);
          var eqIdx = 0;
          var typeTimer = setInterval(function () {
            if (eqIdx < eqStr.length) { hcEqEl.textContent += eqStr[eqIdx]; eqIdx++; }
            else clearInterval(typeTimer);
          }, 60);
          tryNewBtn.style.display = '';
          multiplyBtn.style.display = '';
          if (typeof anime !== 'undefined') {
            anime.set([tryNewBtn, multiplyBtn], { opacity: 0, translateY: 10 });
            anime({
              targets: [tryNewBtn, multiplyBtn], opacity: 1, translateY: 0, duration: 400,
              delay: anime.stagger(120), easing: 'easeOutBack',
              complete: function () {
                anime({
                  targets: multiplyBtn,
                  boxShadow: ['0 0 0px rgba(124,58,237,0)', '0 0 14px rgba(124,58,237,0.65)', '0 0 0px rgba(124,58,237,0)'],
                  duration: 1200, loop: true, easing: 'easeInOutSine'
                });
              }
            });
          }
          if (typeof playComplete === 'function') playComplete();
        }
      } else {
        answerInput.value = '';
        shakeMlEl(answerInput);
        if (typeof playWrong === 'function') playWrong();
        if (step === 'c') {
          showStatus('Not quite. Hint: multiply ' + bigFmt + ' by ' + onesDigit + ' to fill the first row.', 'error');
        } else if (step === 'd') {
          showStatus('Not quite. Hint: multiply ' + bigFmt + ' × ' + tensDigit + ' and enter that result.', 'error');
        } else {
          showStatus('Not quite. Hint: add both partial products carefully to get the final product.', 'error');
        }
        resetBtn.style.display = '';
        if (typeof anime !== 'undefined') {
          anime.set(resetBtn, { opacity: 0, translateY: 10 });
          anime({ targets: resetBtn, opacity: 1, translateY: 0, duration: 280, easing: 'easeOutBack' });
        }
      }
    }

    /* ── Buttons ──────────────────────────────────── */
    resetBtn.addEventListener('click', function () {
      if (_wigTimer) { clearTimeout(_wigTimer); _wigTimer = null; }
      area.innerHTML = '';
      _renderMultiplicationLab(page, area);
    });

    multiplyBtn.addEventListener('click', function () {
      if (_wigTimer) { clearTimeout(_wigTimer); _wigTimer = null; }
      if (typeof playSweep === 'function') playSweep();
      renderPage(page.next);
    });

    tryNewBtn.addEventListener('click', function () {
      if (_wigTimer) { clearTimeout(_wigTimer); _wigTimer = null; }
      area.innerHTML = '';
      _renderMultiplicationLab(page, area);
    });

    /* ── Kick off step a ──────────────────────────── */
    prepareStepDrag('a');
  }

  /* ══════════════════════════════════════════════════════
     PAGE 5.1 — division-lab
  ══════════════════════════════════════════════════════ */

  function _renderDivisionLab(page, area) {

    /* ── Helpers ────────────────────────────────────── */
    function _dlToIndian(n) {
      var s = String(n), res = s.slice(-3), rem = s.slice(0, -3);
      while (rem.length > 0) { res = rem.slice(-2) + ',' + res; rem = rem.slice(0, -2); }
      return res;
    }

    /* ── Number generation ──────────────────────────── */
    var divisor, quotient, dividend;
    var attempts = 0;
    do {
      divisor  = Math.floor(Math.random() * (28 - 12 + 1)) + 12;
      var use5 = Math.random() < 0.55;
      if (use5) {
        quotient = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
      } else {
        var maxQ = Math.min(999999, Math.floor(9999999 / divisor));
        quotient = Math.floor(Math.random() * (maxQ - 100000 + 1)) + 100000;
      }
      dividend = divisor * quotient;
      attempts++;
    } while ((dividend < 100000 || dividend > 9999999) && attempts < 200);

    /* ── buildS11Steps ──────────────────────────────── */
    function buildS11Steps(dvd, dvs) {
      var s = String(dvd), carry = 0, i = 0, steps = [];
      while (i < s.length && carry < dvs) carry = carry * 10 + parseInt(s[i++]);
      var numSteps = s.length - (i - 1);
      for (var k = 0; k < numSteps; k++) {
        var qd   = Math.floor(carry / dvs);
        var prod = qd * dvs;
        var rem  = carry - prod;
        var bd   = i < s.length ? parseInt(s[i]) : null;
        steps.push({ working: carry, quotientDigit: qd, product: prod,
                     remainder: rem, bringDown: bd,
                     endDigitIndex: i - 1,
                     next: bd !== null ? rem * 10 + bd : rem });
        i++;
        carry = steps[k].next;
      }
      return steps;
    }

    /* ── State ──────────────────────────────────────── */
    var s11Data = {
      steps:       buildS11Steps(dividend, divisor),
      currentStep: 0,
      phase:       'intro'
    };
    var s11InitialEndIdx = s11Data.steps[0].endDigitIndex;

    var divFmt = _dlToIndian(dividend);
    var divStr = String(dividend);

    /* ── DOM build ──────────────────────────────────── */
    var wrap = _el('div', 'cp-division-lab');
    wrap.dataset.pageId = '5.1';

    /* Inner 70%-wide centred wrapper (wrap stays full-width for bg) */
    var inner = _el('div', 'cp-dl-inner');
    wrap.appendChild(inner);

    var titleEl = _el('h1', 'cp-dl-title');
    titleEl.textContent = page.title || 'Division Lab';
    inner.appendChild(titleEl);

    var statusEl = _el('p', 'cp-dl-status-msg');
    inner.appendChild(statusEl);

    /* Problem bar */
    var probBar = _el('div', 'cp-dl-problem-bar');
    var pbDiv   = _el('span', 'cp-dl-pb-num'); pbDiv.textContent = divFmt;
    var pbOp    = _el('span', 'cp-dl-pb-op');  pbOp.textContent  = '÷';
    var pbDvs   = _el('span', 'cp-dl-pb-num'); pbDvs.textContent = String(divisor);
    probBar.appendChild(pbDiv);
    probBar.appendChild(pbOp);
    probBar.appendChild(pbDvs);
    inner.appendChild(probBar);

    /* Shell (animated as a unit) */
    var shell = _el('div', 'cp-dl-shell');

    var toplineEl = _el('p', 'cp-dl-topline');
    toplineEl.textContent = 'Solve the long division problem: ' + divFmt + ' ÷ ' + divisor;
    shell.appendChild(toplineEl);

    var instrEl = _el('p', 'cp-dl-instruction');
    shell.appendChild(instrEl);

    /* Main 2-column row */
    var mainRow = _el('div', 'cp-dl-main-row');

    /* ── Left column: board + actions ── */
    var leftCol = _el('div', 'cp-dl-left-col');

    /* Board main — Pixi canvas long-division board (full left-col width) */
    var boardMain = _el('div', 'cp-dl-board-main');

    /* ── Pixi layout constants ─────────────────────── */
    var DL_FSIZE = 24, DL_ROW_H = 40, DL_TOP_Y = 100, DL_QUOT_Y = 56;
    var DL_W = 480;
    /* Height sized to fit all steps so no scrolling is needed */
    var DL_H = DL_TOP_Y + (s11Data.steps.length * 2 + 1) * DL_ROW_H + 70;
    var DL_COL_W = 18, DL_DIV_X = 18, DL_BRKT_X = 0, DL_DIVD_X = 0;
    var dlApp = null;
    var dlDividendTxts = [], dlQuotientTxts = [], dlGlowGfx = null;
    var dlStepObjs = [], dlScrollY = 0;
    var dlRemGlowGfx = null, dlRemTypingTxt = null;

    /* dlMkStyle — safe even when PIXI absent */
    function dlMkStyle(c) {
      if (!window.PIXI) return null;
      return new PIXI.TextStyle({ fontFamily: '"Lilita One", cursive', fontWeight: 'bold',
        fontSize: DL_FSIZE, fill: (c !== undefined ? c : 0x1b3a6b) });
    }

    var dlCanvas = document.createElement('canvas');
    boardMain.appendChild(dlCanvas);

    if (window.PIXI) {
      dlApp = new PIXI.Application({ view: dlCanvas, width: DL_W, height: DL_H,
        backgroundAlpha: 0, transparent: true, antialias: true,
        resolution: window.devicePixelRatio || 1, autoDensity: true });
      /* Override PIXI's inline styles so the canvas fills the container via CSS */
      dlCanvas.style.width = '100%';
      dlCanvas.style.height = 'auto';

      /* Measure digit width */
      var _mTxt = new PIXI.Text('0', dlMkStyle());
      DL_COL_W = Math.max(16, _mTxt.width);
      _mTxt.destroy();
      DL_BRKT_X = DL_DIV_X + String(divisor).length * DL_COL_W + 16;
      DL_DIVD_X = DL_BRKT_X + 14;

      /* Static bracket */
      var _carryLY = DL_QUOT_Y + DL_FSIZE + 9;
      var _vBotY   = DL_TOP_Y + DL_FSIZE + 6;
      var _hRightX = DL_DIVD_X + divStr.length * DL_COL_W + 10;
      var _bktGfx  = new PIXI.Graphics();
      _bktGfx.lineStyle(3, 0x1b3a6b, 1)
        .moveTo(DL_BRKT_X, _carryLY).lineTo(_hRightX, _carryLY)
        .moveTo(DL_BRKT_X, _carryLY).lineTo(DL_BRKT_X, _vBotY);
      dlApp.stage.addChild(_bktGfx);

      /* Divisor */
      var _dlDivTxt = new PIXI.Text(String(divisor), dlMkStyle());
      _dlDivTxt.position.set(DL_DIV_X, DL_TOP_Y);
      dlApp.stage.addChild(_dlDivTxt);

      /* Dividend digit texts */
      for (var _di = 0; _di < divStr.length; _di++) {
        var _dt = new PIXI.Text(divStr[_di], dlMkStyle());
        _dt.position.set(DL_DIVD_X + _di * DL_COL_W, DL_TOP_Y);
        dlApp.stage.addChild(_dt);
        dlDividendTxts.push(_dt);
      }

      /* Quotient text placeholders — one per step */
      for (var _qi = 0; _qi < s11Data.steps.length; _qi++) {
        var _qt = new PIXI.Text('', dlMkStyle());
        _qt.position.set(DL_DIVD_X + s11Data.steps[_qi].endDigitIndex * DL_COL_W, DL_QUOT_Y);
        dlApp.stage.addChild(_qt);
        dlQuotientTxts.push(_qt);
      }

      /* Active quotient glow box */
      dlGlowGfx = new PIXI.Graphics();
      dlGlowGfx.visible = false;
      dlApp.stage.addChild(dlGlowGfx);

      /* Per-step object slots */
      for (var _sk = 0; _sk < s11Data.steps.length; _sk++) {
        dlStepObjs.push({ minusTxt: null, productTxts: [], subLine: null, remTxts: [], bdTxt: null });
      }
    }
    /* ── End Pixi board init ── */

    /* Step card */
    var stepCard  = _el('div', 'cp-dl-step-card');
    var scBadge   = _el('span', 'cp-dl-sc-badge');
    var scMath    = _el('div',  'cp-dl-sc-math');
    var scHelp    = _el('p',    'cp-dl-sc-help');
    scBadge.textContent = 'Layer 1';
    scMath.textContent  = s11Data.steps[0].working + ' ÷ ' + divisor;
    scHelp.textContent  = 'Follow the shown step and enter the answer.';
    stepCard.appendChild(scBadge);
    stepCard.appendChild(scMath);
    stepCard.appendChild(scHelp);
    leftCol.appendChild(boardMain);

    /* Left actions: Try New, Practice (Start removed — auto-starts) */
    var leftActionsEl = _el('div', 'cp-dl-left-actions');

    var tryNewBtn = _el('button', 'cp-dl-try-new-btn');
    tryNewBtn.textContent = 'Try New Problem';
    tryNewBtn.style.display = 'none';
    leftActionsEl.appendChild(tryNewBtn);

    var practiceBtn = _el('button', 'cp-btn-primary cp-dl-practice-btn');
    practiceBtn.textContent = 'Practice Division →';
    practiceBtn.style.display = 'none';
    leftActionsEl.appendChild(practiceBtn);

    leftCol.appendChild(leftActionsEl);
    mainRow.appendChild(leftCol);

    /* ── Right column: numpad panel ── */
    var rightCol = _el('div', 'cp-dl-right-col');
    rightCol.appendChild(stepCard);

    var numpadHeaderEl = _el('div', 'cp-dl-numpad-header');
    numpadHeaderEl.textContent = 'Quotient digit';
    rightCol.appendChild(numpadHeaderEl);

    var answerInput = _el('input', 'cp-dl-answer-input');
    answerInput.type = 'text';
    answerInput.setAttribute('readonly', 'true');
    answerInput.setAttribute('aria-label', 'Your answer');
    answerInput.placeholder = '—';
    rightCol.appendChild(answerInput);

    /* Numpad — auto-submit on digit tap, no Submit key */
    var numpadDisabled = true;
    var numpad = _el('div', 'cp-dl-numpad');
    [1,2,3,4,5,6,7,8,9,'Clear',0,'Del'].forEach(function (k) {
      var cls = 'cp-dl-key';
      if (k === 'Clear') cls += ' cp-dl-key--clear';
      if (k === 'Del')   cls += ' cp-dl-key--del';
      var btn = _el('button', cls);
      btn.textContent = k;
      btn.addEventListener('click', function () {
        if (numpadDisabled) return;
        if (k === 'Clear') {
          answerInput.value = '';
          if (s11Data.phase === 'subtract') dlUpdateRemInput('');
          return;
        }
        if (k === 'Del') {
          answerInput.value = answerInput.value.slice(0, -1);
          if (s11Data.phase === 'subtract') dlUpdateRemInput(answerInput.value);
          return;
        }
        if (s11Data.phase === 'quotient') {
          answerInput.value = String(k);
          setTimeout(function () { checkS11Answer(); }, 80);
        } else if (s11Data.phase === 'subtract') {
          if (answerInput.value.length < 8) answerInput.value += k;
          dlUpdateRemInput(answerInput.value);
          var step = s11Data.steps[s11Data.currentStep];
          if (answerInput.value.length >= String(step.remainder).length) {
            setTimeout(function () { checkS11Answer(); }, 80);
          }
        }
      });
      numpad.appendChild(btn);
    });
    rightCol.appendChild(numpad);

    /* Helper card — collapsible table of multiples */
    var helperCard   = _el('div', 'cp-dl-helper-card');
    var helperToggle = _el('button', 'cp-dl-helper-toggle');
    helperToggle.textContent = 'Table of ' + divisor + ' ▼';
    var helperBody = _el('div', 'cp-dl-helper-body');
    helperBody.style.display = 'none';
    helperBody.setAttribute('aria-hidden', 'true');
    for (var mi = 1; mi <= 9; mi++) {
      var ms = _el('span', ''); ms.textContent = divisor + '×' + mi + '=' + (divisor * mi);
      helperBody.appendChild(ms);
    }
    helperToggle.addEventListener('click', function () {
      var open = helperBody.style.display !== 'none';
      helperToggle.textContent = 'Table of ' + divisor + (open ? ' ▼' : ' ▲');
      helperBody.setAttribute('aria-hidden', String(open));
      if (typeof anime !== 'undefined') {
        if (open) {
          anime({ targets: helperBody, opacity: 0, duration: 200, easing: 'easeInQuad',
            complete: function () { helperBody.style.display = 'none'; } });
        } else {
          helperBody.style.display = '';
          anime.set(helperBody, { opacity: 0 });
          anime({ targets: helperBody, opacity: 1, duration: 250, easing: 'easeOutQuad' });
        }
      } else {
        helperBody.style.display = open ? 'none' : '';
      }
    });
    helperCard.appendChild(helperToggle);
    helperCard.appendChild(helperBody);
    rightCol.appendChild(helperCard);

    mainRow.appendChild(rightCol);

    shell.appendChild(mainRow);
    inner.appendChild(shell);
    area.appendChild(wrap);

    /* ── Intro audio ────────────────────────────────── */
    if (typeof playLevelUpDing === 'function') playLevelUpDing();

    /* ── Status helpers ─────────────────────────────── */
    function showStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className = 'cp-dl-status-msg' + (type ? ' cp-dl-status-msg--' + type : '');
      if (typeof anime !== 'undefined') {
        anime.set(statusEl, { opacity: 0, translateY: 4 });
        anime({ targets: statusEl, opacity: 1, translateY: 0, duration: 280, easing: 'easeOutQuad' });
      }
    }
    function clearStatus() {
      statusEl.textContent = '';
      statusEl.className = 'cp-dl-status-msg';
    }

    /* ── Confetti ───────────────────────────────────── */
    function spawnDlConfetti(anchorEl) {
      if (!anchorEl || typeof anime === 'undefined') return;
      var rect  = anchorEl.getBoundingClientRect();
      var wRect = wrap.getBoundingClientRect();
      var cols  = ['#34d399','#059669','#2563eb','#f97316','#a78bfa','#fbbf24'];
      for (var ci = 0; ci < 12; ci++) {
        var dot = document.createElement('div');
        dot.style.cssText = 'position:absolute;width:7px;height:7px;border-radius:50%;pointer-events:none;z-index:20;';
        dot.style.background = cols[ci % cols.length];
        dot.style.left = ((rect.left - wRect.left) + rect.width  / 2) + 'px';
        dot.style.top  = ((rect.top  - wRect.top)  + rect.height / 2) + 'px';
        wrap.appendChild(dot);
        anime({ targets: dot,
          translateX: (Math.random() - 0.5) * 110,
          translateY: (Math.random() - 0.5) * 80 - 25,
          opacity: [1, 0], duration: 650 + Math.random() * 350, easing: 'easeOutCubic',
          complete: function (an) { if (an.animatables[0]) an.animatables[0].target.remove(); }
        });
      }
    }

    /* ── Shake helper ───────────────────────────────── */
    function shakeDlEl(el) {
      if (typeof anime !== 'undefined') {
        anime({ targets: el, translateX: [0,-6,6,-5,5,-3,3,0], duration: 380, easing: 'easeInOutSine' });
      }
    }

    /* instrEl is populated by enterQuotientPhase via dlTypewriter */

    /* ── Pixi board helpers ──────────────────────────── */
    function dlProdY(si) { return DL_TOP_Y + (2 * si + 1) * DL_ROW_H; }
    function dlDiffY(si) { return DL_TOP_Y + (2 * si + 2) * DL_ROW_H; }

    function dlScrollTo() { /* no-op — canvas height sized to contain all steps */ }

    function dlRevealProduct(si) {
      if (!dlApp) return;
      var step     = s11Data.steps[si];
      var prodStr  = String(step.product);
      var endCol   = step.endDigitIndex;
      var prodY    = dlProdY(si);
      var mt = new PIXI.Text('−', dlMkStyle(0x475569));
      mt.position.set(DL_DIVD_X + (endCol - prodStr.length) * DL_COL_W - DL_COL_W * 0.6, prodY);
      dlApp.stage.addChild(mt);
      dlStepObjs[si].minusTxt = mt;
      for (var _pi = 0; _pi < prodStr.length; _pi++) {
        var _pt = new PIXI.Text(prodStr[_pi], dlMkStyle());
        _pt.position.set(DL_DIVD_X + (endCol - prodStr.length + 1 + _pi) * DL_COL_W, prodY);
        dlApp.stage.addChild(_pt);
        dlStepObjs[si].productTxts.push(_pt);
      }
      var lineY = prodY + DL_FSIZE + 4;
      var x1    = DL_DIVD_X + (endCol - prodStr.length) * DL_COL_W - 4;
      var x2    = DL_DIVD_X + (endCol + 1) * DL_COL_W + 4;
      var sl = new PIXI.Graphics();
      sl.lineStyle(2, 0x94a3b8, 1).moveTo(x1, lineY).lineTo(x2, lineY);
      dlApp.stage.addChild(sl);
      dlStepObjs[si].subLine = sl;
      dlScrollTo(dlDiffY(si) + DL_ROW_H);
    }

    function dlRevealRemainder(si) {
      if (!dlApp) return;
      var step   = s11Data.steps[si];
      var remStr = String(step.remainder);
      var endCol = step.endDigitIndex;
      var remY   = dlDiffY(si);
      for (var _ri = 0; _ri < remStr.length; _ri++) {
        var _rt = new PIXI.Text(remStr[_ri], dlMkStyle());
        _rt.position.set(DL_DIVD_X + (endCol - remStr.length + 1 + _ri) * DL_COL_W, remY);
        dlApp.stage.addChild(_rt);
        dlStepObjs[si].remTxts.push(_rt);
      }
      if (step.bringDown !== null) {
        var bdt = new PIXI.Text(String(step.bringDown), dlMkStyle(0x386af6));
        bdt.position.set(DL_DIVD_X + (endCol + 1) * DL_COL_W, remY);
        bdt.alpha = 0;
        dlApp.stage.addChild(bdt);
        dlStepObjs[si].bdTxt = bdt;
      }
    }
    /* ── Remainder glow box (PIXI — same style as quotient indicator) ── */
    function dlShowRemInput(si) {
      dlHideRemInput();
      if (!dlApp) return;
      var step   = s11Data.steps[si];
      var remLen = Math.max(1, String(step.remainder).length);
      var endCol = step.endDigitIndex;
      var remY   = dlDiffY(si);
      var gx     = DL_DIVD_X + (endCol - remLen + 1) * DL_COL_W - 4;
      var gw     = remLen * DL_COL_W + 8;
      dlRemGlowGfx = new PIXI.Graphics();
      dlRemGlowGfx.lineStyle(2, 0xfcb717, 1)
        .beginFill(0xfcb717, 0.22)
        .drawRoundedRect(gx, remY - 3, gw, DL_FSIZE + 8, 4)
        .endFill();
      dlApp.stage.addChild(dlRemGlowGfx);
      dlRemTypingTxt = new PIXI.Text('', dlMkStyle(0x1b3a6b));
      dlRemTypingTxt.anchor.set(1, 0);
      dlRemTypingTxt.position.set(gx + gw - 4, remY);
      dlApp.stage.addChild(dlRemTypingTxt);
    }
    function dlUpdateRemInput(val) {
      if (dlRemTypingTxt) dlRemTypingTxt.text = val || '';
    }
    function dlHideRemInput() {
      if (dlRemGlowGfx) {
        if (dlRemGlowGfx.parent) dlRemGlowGfx.parent.removeChild(dlRemGlowGfx);
        dlRemGlowGfx.destroy(); dlRemGlowGfx = null;
      }
      if (dlRemTypingTxt) {
        if (dlRemTypingTxt.parent) dlRemTypingTxt.parent.removeChild(dlRemTypingTxt);
        dlRemTypingTxt.destroy(); dlRemTypingTxt = null;
      }
    }
    /* ── End Pixi helpers ── */

    /* ── dlTypewriter ────────────────────────────────── */
    function dlTypewriter(el, txt) {
      el.textContent = '';
      var idx = 0;
      var iv = setInterval(function () {
        if (_currentPageId !== '5.1') { clearInterval(iv); return; }
        el.textContent += txt[idx++];
        if (idx >= txt.length) clearInterval(iv);
      }, 22);
    }

    /* ── s11QuotientHint ─────────────────────────────── */
    function s11QuotientHint(step, dvs) {
      var qd = step.quotientDigit;
      if (qd < 9) {
        return dvs + ' goes into ' + step.working + ' ' + qd + ' times because ' +
               dvs + ' × ' + qd + ' = ' + step.product + ', but ' +
               dvs + ' × ' + (qd + 1) + ' = ' + ((qd + 1) * dvs) + ' is too large.';
      }
      return dvs + ' goes into ' + step.working + ' 9 times because ' +
             dvs + ' × 9 = ' + step.product + '.';
    }

    /* ── showFeedbackCard ────────────────────────────── */
    function showFeedbackCard(msg, type) {
      var old = wrap.querySelector('.cp-dl-feedback');
      if (old) old.remove();
      var card = _el('div', 'cp-dl-feedback cp-dl-feedback--' + type);
      card.textContent = msg;
      inner.appendChild(card);
      if (typeof anime !== 'undefined') {
        anime.set(card, { opacity: 0, translateY: 12 });
        anime({ targets: card, opacity: 1, translateY: 0, duration: 320, easing: 'easeOutQuad' });
      }
      setTimeout(function () {
        if (!card.parentNode) return;
        if (typeof anime !== 'undefined') {
          anime({ targets: card, opacity: 0, translateY: -8, duration: 280, easing: 'easeInQuad',
            complete: function () { if (card.parentNode) card.parentNode.removeChild(card); } });
        } else {
          card.parentNode.removeChild(card);
        }
      }, 3000);
    }

    /* ── addStepRowToBoard (Pixi) ────────────────────── */
    function addStepRowToBoard(stepIdx) {
      dlRevealProduct(stepIdx);
    }

    /* ── animateBringDown (Pixi) ─────────────────────── */
    function animateBringDown(step) {
      if (!dlApp) return;
      var si = s11Data.currentStep; /* called before currentStep is incremented */
      /* Highlight source dividend digit */
      var srcIdx = step.endDigitIndex + 1;
      if (dlDividendTxts[srcIdx]) dlDividendTxts[srcIdx].style = dlMkStyle(0x386af6);
      /* Animate brought-down digit appearing */
      var bdt = dlStepObjs[si] && dlStepObjs[si].bdTxt;
      if (bdt) {
        if (typeof anime !== 'undefined') {
          anime({ targets: bdt, alpha: 1, duration: 500, easing: 'easeOutQuad' });
        } else { bdt.alpha = 1; }
      }
      /* Dotted arrow from dividend row to diff row */
      var arrowX   = DL_DIVD_X + (step.endDigitIndex + 1) * DL_COL_W + DL_COL_W * 0.4;
      var arrowTop = DL_TOP_Y + DL_FSIZE + 6;
      var arrowBot = dlDiffY(si) - 2;
      var arrowGfx = new PIXI.Graphics();
      for (var _ay = arrowTop; _ay < arrowBot - 8; _ay += 8) {
        arrowGfx.lineStyle(2, 0x27ae60, 1).moveTo(arrowX, _ay).lineTo(arrowX, _ay + 4);
      }
      arrowGfx.lineStyle(0).beginFill(0x27ae60)
        .moveTo(arrowX, arrowBot).lineTo(arrowX - 4, arrowBot - 8).lineTo(arrowX + 4, arrowBot - 8)
        .closePath().endFill();
      dlApp.stage.addChild(arrowGfx);
      setTimeout(function() { if (arrowGfx.parent) arrowGfx.parent.removeChild(arrowGfx); }, 1000);
      dlScrollTo(dlDiffY(si));
    }

    /* ── enterQuotientPhase (Pixi) ───────────────────── */
    function enterQuotientPhase() {
      var step   = s11Data.steps[s11Data.currentStep];
      var prevSI = s11Data.currentStep - 1;
      if (dlApp) {
        /* Reset dividend digit colours */
        dlDividendTxts.forEach(function(t) { if (t) t.style = dlMkStyle(); });
        /* Reset prev step rem colours */
        if (prevSI >= 0 && dlStepObjs[prevSI]) {
          dlStepObjs[prevSI].remTxts.forEach(function(t) { if (t) t.style = dlMkStyle(); });
        }
        if (s11Data.currentStep === 0) {
          /* Highlight initial working digits */
          for (var _ci = 0; _ci <= step.endDigitIndex; _ci++) {
            if (dlDividendTxts[_ci]) dlDividendTxts[_ci].style = dlMkStyle(0x386af6);
          }
        } else {
          /* Highlight rem + bd from previous step */
          if (prevSI >= 0 && dlStepObjs[prevSI]) {
            dlStepObjs[prevSI].remTxts.forEach(function(t) { if (t) t.style = dlMkStyle(0x386af6); });
            var _bd = dlStepObjs[prevSI].bdTxt;
            if (_bd) _bd.style = dlMkStyle(0x386af6);
          }
          if (dlDividendTxts[step.endDigitIndex]) dlDividendTxts[step.endDigitIndex].style = dlMkStyle(0x386af6);
        }
        /* Glow box behind active quotient column */
        var _gx = DL_DIVD_X + step.endDigitIndex * DL_COL_W - 3;
        dlGlowGfx.clear()
          .lineStyle(2, 0xfcb717, 1)
          .beginFill(0xfcb717, 0.22)
          .drawRoundedRect(_gx, DL_QUOT_Y - 3, DL_COL_W + 6, DL_FSIZE + 8, 4)
          .endFill();
        dlGlowGfx.visible = true;
      }
      scBadge.textContent = 'Layer ' + (s11Data.currentStep + 1);
      scMath.textContent  = step.working + ' ÷ ' + divisor;
      scHelp.textContent  = 'Find the biggest multiple of ' + divisor + ' that fits into ' + step.working + '.';
      numpadHeaderEl.textContent = 'Quotient digit';
      dlTypewriter(instrEl, 'What is ' + step.working + ' ÷ ' + divisor + '? Write the next quotient digit.');
      answerInput.placeholder = '—';
      answerInput.value = '';
      answerInput.classList.remove('cp-dl-input--correct', 'cp-dl-input--error');
      answerInput.classList.add('cp-dl-answer-input--pulse');
    }

    /* ── enterSubtractPhase (Pixi) ───────────────────── */
    function enterSubtractPhase(digit) {
      var step   = s11Data.steps[s11Data.currentStep];
      var prevSI = s11Data.currentStep - 1;
      if (dlApp) {
        /* Place quotient digit on canvas */
        var _qt = dlQuotientTxts[s11Data.currentStep];
        if (_qt) _qt.text = String(digit);
        dlGlowGfx.visible = false;
        /* Clear highlight colours */
        dlDividendTxts.forEach(function(t) { if (t) t.style = dlMkStyle(); });
        if (prevSI >= 0 && dlStepObjs[prevSI]) {
          dlStepObjs[prevSI].remTxts.forEach(function(t) { if (t) t.style = dlMkStyle(); });
        }
        /* Reveal product row on canvas */
        addStepRowToBoard(s11Data.currentStep);
      }
      dlTypewriter(instrEl, 'Great! Subtract: ' + step.working + ' − ' + step.product + ' = ?');
      scHelp.textContent = 'Subtract the product from the chunk.';
      numpadHeaderEl.textContent = 'Remainder';
      answerInput.placeholder = '—';
      answerInput.value = '';
      answerInput.classList.remove('cp-dl-answer-input--pulse');
      setTimeout(function () { dlShowRemInput(s11Data.currentStep); }, 120);
    }

    /* ── completeS11Lab ──────────────────────────────── */
    function completeS11Lab() {
      s11Data.phase = 'final';
      dlHideRemInput();
      shell.classList.add('cp-dl-shell--done');
      toplineEl.classList.add('cp-dl-topline--success');
      spawnDlConfetti(boardMain);
      dlTypewriter(instrEl, 'Excellent! The quotient is ' + _dlToIndian(quotient) + '.');
      answerInput.value = _dlToIndian(quotient);
      answerInput.setAttribute('readonly', 'true');
      answerInput.classList.add('cp-dl-input--correct');
      answerInput.classList.remove('cp-dl-answer-input--pulse');
      scBadge.textContent = 'Complete';
      scMath.textContent  = _dlToIndian(dividend) + ' ÷ ' + divisor + ' = ' + _dlToIndian(quotient);
      scHelp.textContent  = 'All steps done!';
      showFeedbackCard('Excellent work! ' + _dlToIndian(dividend) + ' ÷ ' + divisor +
                       ' = ' + _dlToIndian(quotient) + '.', 'good');
      numpadDisabled = true;
      numpadHeaderEl.textContent = 'Done!';
      [tryNewBtn, practiceBtn].forEach(function (btn, idx) {
        btn.style.display = '';
        if (typeof anime !== 'undefined') {
          anime.set(btn, { opacity: 0, translateY: 12 });
          anime({ targets: btn, opacity: 1, translateY: 0, duration: 350,
            delay: 400 + idx * 100, easing: 'easeOutBack' });
        }
      });
      practiceBtn.classList.add('cp-dl-practice-btn--pulse');
      if (typeof playComplete === 'function') playComplete();
    }

    /* ── startS11Lab ─────────────────────────────────── */
    function startS11Lab() {
      s11Data.phase = 'quotient';
      numpadDisabled = false;
      enterQuotientPhase();
    }
    setTimeout(startS11Lab, 600);

    /* ── checkS11Answer ──────────────────────────────── */
    function checkS11Answer() {
      var raw = answerInput.value.trim();
      if (!raw) return;
      var step = s11Data.steps[s11Data.currentStep];

      if (s11Data.phase === 'quotient') {
        var entered = parseInt(raw, 10);
        if (entered === step.quotientDigit) {
          answerInput.value = '';
          answerInput.classList.remove('cp-dl-answer-input--pulse');
          if (typeof playCorrect === 'function') playCorrect();
          showStatus('Correct quotient digit.', 'correct');
          showFeedbackCard(divisor + ' × ' + step.quotientDigit + ' = ' + step.product +
                           '. Now subtract to find the remainder.', 'good');
          s11Data.phase = 'subtract';
          setTimeout(function () { enterSubtractPhase(step.quotientDigit); }, 500);
        } else {
          answerInput.value = '';
          if (typeof playWrong === 'function') playWrong();
          shakeDlEl(answerInput);
          helperCard.classList.add('cp-dl-helper-card--nudge');
          setTimeout(function () { helperCard.classList.remove('cp-dl-helper-card--nudge'); }, 1600);
          showStatus('Not quite. Hint: Look for the biggest multiple of ' + divisor +
                     ' that does not go past ' + step.working + '.', 'error');
          showFeedbackCard(s11QuotientHint(step, divisor), 'bad');
        }

      } else if (s11Data.phase === 'subtract') {
        var enteredRem = parseInt(raw, 10);
        if (enteredRem === step.remainder) {
          answerInput.value = '';
          dlHideRemInput();
          if (typeof playCorrect === 'function') playCorrect();
          /* Reveal remainder row on Pixi canvas */
          dlRevealRemainder(s11Data.currentStep);
          if (step.bringDown !== null) {
            showStatus('Bring down ' + step.bringDown + ' and keep going.', 'correct');
            showFeedbackCard('Nice subtraction! Bring down ' + step.bringDown +
                             ' to make ' + step.next + '.', 'good');
            animateBringDown(step);
            s11Data.currentStep++;
            s11Data.phase = 'quotient';
            setTimeout(function () { enterQuotientPhase(); }, 900);
          } else {
            setTimeout(function () { completeS11Lab(); }, 600);
          }
        } else {
          answerInput.value = '';
          if (typeof playWrong === 'function') playWrong();
          shakeDlEl(answerInput);
          /* Flash product texts on canvas */
          if (dlApp && dlStepObjs[s11Data.currentStep]) {
            var _prodTxts = dlStepObjs[s11Data.currentStep].productTxts;
            if (_prodTxts.length > 0 && typeof anime !== 'undefined') {
              anime({ targets: _prodTxts, alpha: [1, 0.3, 1, 0.3, 1], duration: 600, easing: 'easeInOutSine' });
            }
          }
          showStatus('Not quite. Hint: Try ' + step.working + ' minus ' + step.product + ' again.', 'error');
          showFeedbackCard('Not yet. Subtract ' + step.product + ' from ' + step.working +
                           ' carefully to get the remainder before bringing down the next digit.', 'bad');
        }
      }
    }
    /* ── Try New / Practice ─────────────────────────── */
    tryNewBtn.addEventListener('click', function () {
      area.innerHTML = '';
      _renderDivisionLab(page, area);
    });
    practiceBtn.addEventListener('click', function () {
      if (typeof playSweep === 'function') playSweep();
      renderPage(page.next);
    });
  }

  /* ── Page 5.2 — Division Practice (The Zero-Trick) ──────── */
  function _renderDivisionPracticeZeroTrick(page, area) {
    var EXPECTED = '8000';
    var wrongCount = 0;
    var solved = false;
    var vizTimers = [];

    function clearVizTimers() {
      while (vizTimers.length) clearTimeout(vizTimers.pop());
    }

    function later(delay, fn) {
      var t = setTimeout(function () {
        if (_currentPageId !== page.id) return;
        fn();
      }, delay);
      vizTimers.push(t);
      return t;
    }

    var wrap = _el('div', 'cp-dpz');
    wrap.dataset.pageId = page.id;

    var inner = _el('div', 'cp-dpz-inner');

    var titleEl = _el('h1', 'cp-dpz-title');
    titleEl.textContent = page.title || 'Division Practice';
    inner.appendChild(titleEl);

    var statusEl = _el('p', 'cp-dpz-status');
    statusEl.setAttribute('aria-live', 'polite');
    inner.appendChild(statusEl);

    var storyCard = _el('div', 'cp-dpz-story');
    var line1 = _el('p', 'cp-dpz-story-line');
    var bottlesNum = _el('span', 'cp-dpz-count-num');
    bottlesNum.dataset.target = '200000';
    bottlesNum.dataset.format = 'indian';
    bottlesNum.textContent = '2,00,000';
    line1.appendChild(bottlesNum);
    line1.appendChild(document.createTextNode(' bottles of mineral water are ready for delivery.'));
    storyCard.appendChild(line1);

    var line2 = _el('p', 'cp-dpz-story-line');
    line2.appendChild(document.createTextNode('Each crate holds '));
    var crateNum = _el('span', 'cp-dpz-count-num');
    crateNum.dataset.target = '25';
    crateNum.textContent = '25';
    line2.appendChild(crateNum);
    line2.appendChild(document.createTextNode(' bottles.'));
    storyCard.appendChild(line2);

    var goalEl = _el('p', 'cp-dpz-goal');
    goalEl.textContent = 'How many crates are needed to pack all the bottles?';
    storyCard.appendChild(goalEl);
    inner.appendChild(storyCard);

    /* Two-column work area */
    var workArea = _el('div', 'cp-dpz-work');

    var leftCol = _el('div', 'cp-dpz-left-col');
    var promptEl = _el('div', 'cp-dpz-prompt');
    promptEl.textContent = '2,00,000 \u00f7 25 = ?';
    leftCol.appendChild(promptEl);
    var hintBtn = _el('button', 'cp-dpz-hint-btn');
    hintBtn.type = 'button';
    hintBtn.textContent = 'Hint: Use 200 \u00f7 25';
    leftCol.appendChild(hintBtn);
    var visualizerSlot = _el('div', 'cp-dpz-visualizer-slot');
    leftCol.appendChild(visualizerSlot);
    workArea.appendChild(leftCol);

    var rightCol = _el('div', 'cp-dpz-right-col');
    var inputWrap = _el('div', 'cp-dpz-input-wrap');
    var answerInput = _el('input', 'cp-dpz-input cp-dpz-input--pulse');
    answerInput.type = 'text';
    answerInput.placeholder = 'Crates';
    answerInput.setAttribute('readonly', 'true');
    answerInput.setAttribute('aria-label', 'Number of crates');
    inputWrap.appendChild(answerInput);
    rightCol.appendChild(inputWrap);

    var numpad = _el('div', 'cp-dpz-numpad');
    ['1','2','3','4','5','6','7','8','9','Clear','0','Del'].forEach(function (k) {
      var cls = 'cp-dpz-key';
      if (k === 'Clear') cls += ' cp-dpz-key--clear';
      if (k === 'Del') cls += ' cp-dpz-key--del';
      var btn = _el('button', cls);
      btn.type = 'button';
      btn.textContent = k;
      btn.addEventListener('click', function () {
        if (solved) return;
        if (typeof playTick === 'function') playTick();
        if (k === 'Clear') {
          answerInput.value = '';
        } else if (k === 'Del') {
          answerInput.value = answerInput.value.slice(0, -1);
        } else if (answerInput.value.length < 6) {
          answerInput.value += k;
          if (answerInput.value.length === EXPECTED.length) {
            setTimeout(onSubmit, 80);
          }
        }
      });
      numpad.appendChild(btn);
    });
    rightCol.appendChild(numpad);
    workArea.appendChild(rightCol);
    inner.appendChild(workArea);

    var nextBtn = _el('button', 'cp-btn-primary cp-dpz-next-btn');
    nextBtn.type = 'button';
    nextBtn.textContent = 'Begin Two-Step Story';
    nextBtn.style.display = 'none';
    nextBtn.addEventListener('click', beginTwoStepStory);
    inner.appendChild(nextBtn);

    wrap.appendChild(inner);
    area.appendChild(wrap);

    if (typeof playLevelUpDing === 'function') playLevelUpDing();

    function showStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className = 'cp-dpz-status' + (type ? ' cp-dpz-status--' + type : '');
      if (typeof anime !== 'undefined') {
        anime.remove(statusEl);
        anime.set(statusEl, { opacity: 0, translateY: 4 });
        anime({ targets: statusEl, opacity: 1, translateY: 0, duration: 250, easing: 'easeOutQuad' });
      }
    }

    function shakeEl(el) {
      if (typeof anime !== 'undefined') {
        anime.remove(el);
        anime({ targets: el, translateX: [0,-8,8,-6,6,-3,3,0], duration: 420, easing: 'easeInOutSine' });
      }
    }

    function bounceEl(el) {
      if (typeof anime !== 'undefined') {
        anime.remove(el);
        anime({ targets: el, scale: [1, 1.08, 1], duration: 360, easing: 'easeOutBack' });
      }
    }

    function pulseHintButton() {
      hintBtn.classList.add('cp-dpz-hint-btn--encourage');
      setTimeout(function () {
        if (_currentPageId === page.id) hintBtn.classList.remove('cp-dpz-hint-btn--encourage');
      }, 950);
    }

    function spawnConfetti(anchorEl) {
      if (!anchorEl) return;
      var rect = anchorEl.getBoundingClientRect();
      var wRect = wrap.getBoundingClientRect();
      var colors = ['#7c3aed', '#f97316', '#22c55e', '#2563eb', '#fbbf24', '#ec4899'];
      for (var i = 0; i < 18; i++) {
        var dot = document.createElement('div');
        dot.className = 'cp-dpz-confetti';
        dot.style.background = colors[i % colors.length];
        dot.style.left = ((rect.left - wRect.left) + rect.width / 2) + 'px';
        dot.style.top = ((rect.top - wRect.top) + rect.height / 2) + 'px';
        wrap.appendChild(dot);
        if (typeof anime !== 'undefined') {
          anime({
            targets: dot,
            translateX: (Math.random() - 0.5) * 150,
            translateY: (Math.random() - 0.5) * 95 - 30,
            rotate: Math.random() * 220,
            opacity: [1, 0],
            duration: 850 + Math.random() * 450,
            easing: 'easeOutCubic',
            complete: function (an) {
              if (an.animatables[0]) an.animatables[0].target.remove();
            }
          });
        } else {
          (function (piece) {
            setTimeout(function () { if (piece.parentNode) piece.remove(); }, 900);
          })(dot);
        }
      }
    }

    function makeZeroVizTile(text, extraClass) {
      var tile = _el('span', 'cp-dpz-zv-tile' + (extraClass || ''));
      var label = _el('span', 'cp-dpz-zv-tile-label');
      label.textContent = text;
      tile.appendChild(label);
      var strike = _el('span', 'cp-dpz-zv-strike');
      tile.appendChild(strike);
      return tile;
    }

    function showZeroTrickVisualizer() {
      clearVizTimers();
      var old = visualizerSlot.querySelector('.cp-dpz-zero-viz');
      if (old) old.remove();

      var viz = _el('div', 'cp-dpz-zero-viz');
      viz.setAttribute('aria-live', 'polite');

      var expression = _el('div', 'cp-dpz-zv-expression');
      var dividendGroup = _el('div', 'cp-dpz-zv-group cp-dpz-zv-dividend');
      var savedTiles = [];
      '200000'.split('').forEach(function (digit, idx) {
        var tile = makeZeroVizTile(digit, idx >= 3 ? ' cp-dpz-zv-tile--saved-zero' : '');
        if (idx >= 3) savedTiles.push(tile);
        dividendGroup.appendChild(tile);
      });
      expression.appendChild(dividendGroup);
      var op = _el('span', 'cp-dpz-zv-op');
      op.textContent = '\u00f7';
      expression.appendChild(op);
      var divisorGroup = _el('div', 'cp-dpz-zv-group cp-dpz-zv-divisor');
      '25'.split('').forEach(function (digit) {
        divisorGroup.appendChild(makeZeroVizTile(digit, ' cp-dpz-zv-tile--divisor'));
      });
      expression.appendChild(divisorGroup);
      viz.appendChild(expression);

      var caption = _el('p', 'cp-dpz-zv-caption');
      caption.textContent = 'Spread the numbers out.';
      viz.appendChild(caption);

      var simplified = _el('div', 'cp-dpz-zv-simplified');
      simplified.innerHTML = '<span>200</span><span>\u00f7</span><span>25</span>';
      viz.appendChild(simplified);

      var answer = _el('div', 'cp-dpz-zv-answer');
      answer.textContent = '= 8';
      viz.appendChild(answer);

      var finalRow = _el('div', 'cp-dpz-zv-final');
      var eight = _el('span', 'cp-dpz-zv-final-eight');
      eight.textContent = '8';
      finalRow.appendChild(eight);
      var returningZeros = [];
      for (var zi = 0; zi < 3; zi++) {
        var z = _el('span', 'cp-dpz-zv-return-zero');
        z.textContent = '0';
        returningZeros.push(z);
        finalRow.appendChild(z);
      }
      viz.appendChild(finalRow);

      visualizerSlot.appendChild(viz);

      var allTiles = viz.querySelectorAll('.cp-dpz-zv-tile, .cp-dpz-zv-op');
      var strikes = viz.querySelectorAll('.cp-dpz-zv-tile--saved-zero .cp-dpz-zv-strike');

      if (typeof anime === 'undefined') {
        savedTiles.forEach(function (tile) { tile.classList.add('cp-dpz-zv-tile--lifted'); });
        Array.prototype.forEach.call(strikes, function (line) { line.style.transform = 'scaleX(1)'; });
        simplified.style.opacity = '1';
        answer.style.opacity = '1';
        finalRow.style.opacity = '1';
        caption.textContent = 'Now bring the zeros back \u2192 8,000';
        later(5000, function () { if (viz.parentNode) viz.remove(); });
        return;
      }

      anime.set(viz, { opacity: 0, translateY: 16, scale: 0.96 });
      anime.set(allTiles, { opacity: 0, translateY: 8 });
      anime.set([simplified, answer, finalRow], { opacity: 0, translateY: 8 });
      anime.set(strikes, { scaleX: 0, transformOrigin: 'left center' });
      anime.set(returningZeros, { opacity: 0, translateY: -26 });

      anime({ targets: viz, opacity: 1, translateY: 0, scale: 1, duration: 300, easing: 'easeOutQuad' });
      anime({
        targets: allTiles,
        opacity: 1,
        translateY: 0,
        duration: 330,
        delay: anime.stagger(35, { start: 120 }),
        easing: 'easeOutBack'
      });

      later(650, function () {
        caption.textContent = 'Save these zeros for later.';
        savedTiles.forEach(function (tile) { tile.classList.add('cp-dpz-zv-tile--lifted'); });
        anime({
          targets: savedTiles,
          translateY: -16,
          duration: 350,
          delay: anime.stagger(60),
          easing: 'easeOutQuad'
        });
      });

      later(1050, function () {
        anime({
          targets: strikes,
          scaleX: 1,
          duration: 260,
          delay: anime.stagger(90),
          easing: 'easeOutQuad'
        });
      });

      later(1650, function () {
        caption.textContent = 'Now solve the smaller division.';
        anime({ targets: simplified, opacity: 1, translateY: 0, duration: 420, easing: 'easeOutQuad' });
      });

      later(2250, function () {
        anime({ targets: answer, opacity: 1, translateY: 0, scale: [0.88, 1.08, 1], duration: 380, easing: 'easeOutBack' });
      });

      later(2650, function () {
        caption.textContent = 'Now bring the zeros back \u2192 8,000';
        anime({ targets: finalRow, opacity: 1, translateY: 0, duration: 260, easing: 'easeOutQuad' });
        anime({
          targets: returningZeros,
          opacity: 1,
          translateY: 0,
          duration: 520,
          delay: anime.stagger(110),
          easing: 'easeOutBack'
        });
      });

      later(4800, function () {
        anime({
          targets: viz,
          opacity: 0,
          translateY: -12,
          duration: 380,
          easing: 'easeInQuad',
          complete: function () { if (viz.parentNode) viz.remove(); }
        });
      });
    }

    function markCorrect() {
      solved = true;
      clearVizTimers();
      var openViz = visualizerSlot.querySelector('.cp-dpz-zero-viz');
      if (openViz) openViz.remove();
      answerInput.value = '8,000';
      answerInput.classList.remove('cp-dpz-input--pulse', 'cp-dpz-input--error');
      answerInput.classList.add('cp-dpz-input--correct');
      bounceEl(answerInput);
      goalEl.classList.add('cp-dpz-goal--done');
      if (!goalEl.querySelector('.cp-dpz-goal-check')) {
        var check = _el('span', 'cp-dpz-goal-check');
        check.textContent = '\u2713';
        goalEl.appendChild(check);
      }
      showStatus('Correct! 8,000 crates.', 'correct');
      spawnConfetti(answerInput);
      if (typeof playCorrect === 'function') playCorrect();
      if (typeof playComplete === 'function') setTimeout(playComplete, 250);
      nextBtn.style.display = '';
      if (typeof anime !== 'undefined') {
        anime.set(nextBtn, { opacity: 0, translateY: 14 });
        anime({
          targets: nextBtn,
          opacity: 1,
          translateY: 0,
          duration: 420,
          easing: 'easeOutBack',
          complete: function () { nextBtn.classList.add('cp-dpz-next-btn--pulse'); }
        });
      } else {
        nextBtn.classList.add('cp-dpz-next-btn--pulse');
      }
      setTimeout(function () {
        if (_currentPageId === page.id && nextBtn.scrollIntoView) {
          nextBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
      }, 120);
    }

    function markWrong() {
      wrongCount++;
      answerInput.value = '';
      answerInput.classList.remove('cp-dpz-input--correct');
      answerInput.classList.add('cp-dpz-input--error');
      shakeEl(answerInput);
      showStatus('Not quite. Hint: first solve 200 \u00f7 25, then bring back the remaining zeros.', 'error');
      pulseHintButton();
      if (typeof playWrong === 'function') playWrong();
      setTimeout(function () {
        if (_currentPageId === page.id) answerInput.classList.remove('cp-dpz-input--error');
      }, 650);
      if (wrongCount >= 2) {
        later(240, showZeroTrickVisualizer);
      }
    }

    function onSubmit() {
      if (solved) return;
      var raw = answerInput.value.replace(/[^0-9]/g, '');
      if (!raw) {
        showStatus('Tap a digit first.', 'warn');
        pulseHintButton();
        return;
      }
      if (raw === EXPECTED) {
        markCorrect();
      } else {
        markWrong();
      }
    }

    function beginTwoStepStory() {
      if (typeof playWhooshSoft === 'function') playWhooshSoft();
      if (!_findPage(page.next)) {
        showStatus('Section 06 is next in the flow.', 'warn');
        return;
      }
      if (typeof anime !== 'undefined') {
        anime({
          targets: wrap,
          opacity: 0,
          translateY: 18,
          duration: 360,
          easing: 'easeInQuad',
          complete: function () { renderPage(page.next); }
        });
      } else {
        renderPage(page.next);
      }
    }

    hintBtn.addEventListener('click', function () {
      showStatus('Helpful start: divide 200 by 25 first. That gives 8, then bring back the remaining zeros.', 'warn');
      showZeroTrickVisualizer();
    });
  }

  /* ── Page 4.2 — Multiplication Builder ─────────────────── */
  function _renderMultiplicationBuilder(page, area) {

    /* Fixed numbers */
    var BIG      = 128450;
    var EXPECTED = [0, 513800, 2569000, 3082800]; /* 1-indexed */

    function _toInd(n) {
      var s = String(n), res = s.slice(-3), rem = s.slice(0, -3);
      while (rem.length > 0) { res = rem.slice(-2) + ',' + res; rem = rem.slice(0, -2); }
      return res;
    }

    /* ── DOM ── */
    var wrap = _el('div', 'cp-mb');
    wrap.dataset.pageId = page.id;
    area.appendChild(wrap);

    var titleEl = _el('h1', 'cp-title');
    titleEl.textContent = page.title || 'Multiplication Builder';
    wrap.appendChild(titleEl);

    var statusEl = _el('p', 'cp-mb-status');
    wrap.appendChild(statusEl);

    /* Story card */
    var storyCard = _el('div', 'cp-mb-story');
    var sLine1 = _el('p', 'cp-mb-story-line');
    sLine1.textContent = 'A printing company makes 1,28,450 event flyers each day.';
    storyCard.appendChild(sLine1);
    var sLine2 = _el('p', 'cp-mb-story-line');
    sLine2.textContent = 'The company prints flyers for 24 days before the festival.';
    storyCard.appendChild(sLine2);
    var goalEl = _el('p', 'cp-mb-goal');
    goalEl.textContent = 'How many flyers are printed altogether?';
    storyCard.appendChild(goalEl);
    wrap.appendChild(storyCard);

    /* Prompt */
    var promptEl = _el('p', 'cp-mb-prompt');
    promptEl.textContent = 'Split 24 into 20 and 4. Solve both parts, then add.';
    wrap.appendChild(promptEl);

    /* Body */
    var body = _el('div', 'cp-mb-body');

    /* Left column */
    var leftCol = _el('div', 'cp-mb-left');

    /* Split visualizer */
    var splitViz = _el('div', 'cp-mb-split-viz');
    var splitNum = _el('span', 'cp-mb-split-viz-num');
    splitNum.textContent = '24';
    splitViz.appendChild(splitNum);
    var splitParts = _el('div', 'cp-mb-split-viz-parts');
    var sp20 = _el('span', ''); sp20.textContent = '20';
    var spPlus = document.createTextNode(' + ');
    var sp4 = _el('span', ''); sp4.textContent = '4';
    splitParts.appendChild(sp20);
    splitParts.appendChild(document.createTextNode(' + '));
    splitParts.appendChild(sp4);
    splitViz.appendChild(splitParts);
    leftCol.appendChild(splitViz);

    /* Box 1 */
    var box1 = _el('div', 'cp-mb-box cp-mb-box--1');
    var hdr1 = _el('div', 'cp-mb-box-header cp-mb-box-header--blue');
    hdr1.textContent = 'Part 1: × 4';
    box1.appendChild(hdr1);
    var disp1 = _el('div', 'cp-mb-box-display');
    disp1.textContent = '1,28,450 × 4 =';
    box1.appendChild(disp1);
    var inp1 = _el('input', 'cp-mb-input cp-mb-input--active-pulse');
    inp1.type = 'text'; inp1.setAttribute('readonly', 'true');
    inp1.setAttribute('aria-label', 'Part 1 answer');
    box1.appendChild(inp1);
    leftCol.appendChild(box1);

    /* Box 2 (hidden) */
    var box2 = _el('div', 'cp-mb-box cp-mb-box--2 cp-mb-box--hidden');
    var hdr2 = _el('div', 'cp-mb-box-header cp-mb-box-header--orange');
    hdr2.textContent = 'Part 2: × 20';
    box2.appendChild(hdr2);
    var disp2 = _el('div', 'cp-mb-box-display');
    disp2.textContent = '1,28,450 × 20 =';
    box2.appendChild(disp2);
    var inp2 = _el('input', 'cp-mb-input');
    inp2.type = 'text'; inp2.setAttribute('readonly', 'true');
    inp2.setAttribute('aria-label', 'Part 2 answer');
    box2.appendChild(inp2);
    leftCol.appendChild(box2);

    /* Box 3 (hidden) */
    var box3 = _el('div', 'cp-mb-box cp-mb-box--3 cp-mb-box--hidden');
    var hdr3 = _el('div', 'cp-mb-box-header cp-mb-box-header--green');
    hdr3.textContent = 'Add Parts';
    box3.appendChild(hdr3);
    var disp3 = _el('div', 'cp-mb-box-display');
    disp3.textContent = '  5,13,800\n+25,69,000\n──────────';
    box3.appendChild(disp3);
    var inp3 = _el('input', 'cp-mb-input');
    inp3.type = 'text'; inp3.setAttribute('readonly', 'true');
    inp3.setAttribute('aria-label', 'Sum answer');
    box3.appendChild(inp3);
    leftCol.appendChild(box3);

    body.appendChild(leftCol);

    /* Right column — numpad */
    var rightCol = _el('div', 'cp-mb-right');
    var numpad = _el('div', 'cp-mb-numpad');
    var padGrid = _el('div', 'cp-mb-pad-grid');
    ['1','2','3','4','5','6','7','8','9','Clear','0','Del'].forEach(function (k) {
      var isCtrl = k === 'Clear' || k === 'Del';
      var btn = _el('button', 'cp-mb-key' + (isCtrl ? ' cp-mb-key--' + k.toLowerCase() : ''));
      btn.textContent = k;
      btn.setAttribute('aria-label', k);
      btn.addEventListener('click', function () {
        if (solved) return;
        if (k === 'Clear')    { activeInput.value = ''; }
        else if (k === 'Del') { activeInput.value = activeInput.value.slice(0, -1); }
        else if (activeInput.value.length < 8) { activeInput.value += k; tryAutoCheck(); }
      });
      padGrid.appendChild(btn);
    });
    numpad.appendChild(padGrid);
    rightCol.appendChild(numpad);
    body.appendChild(rightCol);
    wrap.appendChild(body);

    /* Next button */
    var nextBtn = _el('button', 'cp-mb-next-btn');
    nextBtn.textContent = 'Next →';
    nextBtn.style.display = 'none';
    nextBtn.addEventListener('click', function () { renderPage(page.next); });
    wrap.appendChild(nextBtn);

    /* ── State ── */
    var step        = 1;
    var activeInput = inp1;
    var solved      = false;

    /* ── Helpers ── */
    function showStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className   = 'cp-mb-status' + (type ? ' cp-mb-status--' + type : '');
      if (typeof anime !== 'undefined') {
        anime.set(statusEl, { opacity: 0, translateY: 4 });
        anime({ targets: statusEl, opacity: 1, translateY: 0, duration: 280, easing: 'easeOutQuad' });
      }
    }

    function shakeEl(el) {
      if (typeof anime !== 'undefined') {
        anime({ targets: el, translateX: [0,-7,7,-5,5,-3,3,0], duration: 400, easing: 'easeInOutSine' });
      }
    }

    function bounceEl(el) {
      if (typeof anime !== 'undefined') {
        anime({ targets: el, scale: [1,1.12,0.95,1.05,1], duration: 500, easing: 'easeOutElastic(1,0.6)' });
      }
    }

    function spawnConfetti(anchorEl) {
      if (!anchorEl) return;
      var rect  = anchorEl.getBoundingClientRect();
      var wRect = wrap.getBoundingClientRect();
      var cols  = ['#a78bfa','#7c3aed','#2563eb','#f97316','#22c55e','#fbbf24'];
      for (var ci = 0; ci < 18; ci++) {
        var dot = document.createElement('div');
        dot.style.cssText = 'position:absolute;width:7px;height:7px;border-radius:50%;pointer-events:none;z-index:20;';
        dot.style.background = cols[ci % cols.length];
        dot.style.left = ((rect.left - wRect.left) + rect.width / 2) + 'px';
        dot.style.top  = ((rect.top  - wRect.top)  + rect.height / 2) + 'px';
        wrap.style.position = 'relative';
        wrap.appendChild(dot);
        if (typeof anime !== 'undefined') {
          anime({
            targets: dot,
            translateX: (Math.random() - 0.5) * 130,
            translateY: (Math.random() - 0.5) * 90 - 30,
            opacity: [1, 0], duration: 700 + Math.random() * 400, easing: 'easeOutCubic',
            complete: function (an) { if (an.animatables[0]) an.animatables[0].target.remove(); }
          });
        } else { dot.remove(); }
      }
    }

    function revealBox(boxEl) {
      boxEl.classList.remove('cp-mb-box--hidden');
      if (typeof anime !== 'undefined') {
        anime.set(boxEl, { opacity: 0, translateY: 18 });
        anime({ targets: boxEl, opacity: 1, translateY: 0, duration: 420, easing: 'easeOutQuad' });
      }
    }

    function setActiveInput(newInp) {
      if (activeInput) activeInput.classList.remove('cp-mb-input--active-pulse');
      activeInput = newInp;
      if (activeInput) activeInput.classList.add('cp-mb-input--active-pulse');
    }

    function showTrickReveal() {
      var card = _el('div', 'cp-mb-trick-card');
      card.textContent = '1,28,450 × 2 = 2,56,900 → × 10 = 25,69,000';
      box3.style.position = 'relative';
      box3.appendChild(card);
      if (typeof anime !== 'undefined') {
        anime.set(card, { opacity: 0, translateY: -6 });
        anime({
          targets: card, opacity: 1, translateY: 0, duration: 300, easing: 'easeOutQuad',
          complete: function () {
            setTimeout(function () {
              anime({
                targets: card, opacity: 0, duration: 400, easing: 'easeInQuad',
                complete: function () { if (card.parentNode) card.parentNode.removeChild(card); }
              });
            }, 1500);
          }
        });
      } else {
        setTimeout(function () { if (card.parentNode) card.parentNode.removeChild(card); }, 2000);
      }
    }

    /* ── Auto-check after each digit ── */
    function tryAutoCheck() {
      var raw = activeInput.value.replace(/[^0-9]/g, '');
      if (!raw) return;
      var ent = parseInt(raw, 10);
      var expected = EXPECTED[step];
      if (ent === expected) { onSubmit(); return; }
      if (raw.length >= String(expected).length) onSubmit();
    }

    /* ── Submit handler ── */
    function onSubmit() {
      if (solved) return;
      var raw = activeInput.value.replace(/[^0-9]/g, '');
      if (!raw) {
        showStatus('Tap a digit first.', 'warn');
        return;
      }
      var entered = parseInt(raw, 10);
      var expected = EXPECTED[step];

      if (entered === expected) {
        /* Correct */
        activeInput.classList.remove('cp-mb-input--active-pulse');
        activeInput.classList.add('cp-mb-input--correct');
        activeInput.value = _toInd(expected);
        bounceEl(activeInput);
        if (typeof playCorrect === 'function') playCorrect();

        if (step === 1) {
          showStatus('Good. Now multiply by 20.', 'correct');
          revealBox(box2);
          setTimeout(function () {
            if (_currentPageId !== page.id) return;
            setActiveInput(inp2);
          }, 440);
          step = 2;
        } else if (step === 2) {
          showStatus('Add both parts.', 'correct');
          revealBox(box3);
          setTimeout(function () {
            if (_currentPageId !== page.id) return;
            setActiveInput(inp3);
            showTrickReveal();
          }, 440);
          step = 3;
        } else {
          solved = true;
          if (typeof playComplete === 'function') playComplete();
          goalEl.textContent += ' ✓';
          spawnConfetti(box3);
          showStatus('Correct! Total flyers = 30,82,800', 'correct');
          nextBtn.style.display = 'block';
          if (typeof anime !== 'undefined') {
            anime.set(nextBtn, { opacity: 0, translateY: 12 });
            anime({ targets: nextBtn, opacity: 1, translateY: 0, duration: 400, easing: 'easeOutBack' });
          }
        }
      } else {
        /* Wrong */
        shakeEl(activeInput);
        activeInput.value = '';
        if (typeof playWrong === 'function') playWrong();
        if (step === 1) {
          showStatus('Not quite. Hint: multiply 1,28,450 by 4 to get the first partial product.', 'error');
        } else if (step === 2) {
          showStatus('Not quite. Hint: first find 1,28,450 × 2, then multiply that by 10 to make × 20.', 'error');
        } else {
          showStatus('Not quite. Hint: add the two partial products: 5,13,800 and 25,69,000.', 'error');
        }
      }
    }
  }

  /* ── Page 4.3 — Multiply and Check ──────────────────────── */
  function _renderMultiplyAndCheck(page, area) {

    /* Fixed numbers */
    var EXPECTED = [0, 2825, 84750, 87575]; /* 1-indexed */

    function _toInd(n) {
      var s = String(n), res = s.slice(-3), rem = s.slice(0, -3);
      while (rem.length > 0) { res = rem.slice(-2) + ',' + res; rem = rem.slice(0, -2); }
      return res;
    }

    /* ── DOM ── */
    var wrap = _el('div', 'cp-mac');
    wrap.dataset.pageId = page.id;
    area.appendChild(wrap);

    var titleEl = _el('h1', 'cp-title');
    titleEl.textContent = page.title || 'Multiply and Check';
    wrap.appendChild(titleEl);

    var statusEl = _el('p', 'cp-mac-status');
    wrap.appendChild(statusEl);

    /* Story card */
    var storyCard = _el('div', 'cp-mac-story');
    var sLine1 = _el('p', 'cp-mac-story-line');
    sLine1.textContent = 'A factory makes 2,825 screws a day.';
    storyCard.appendChild(sLine1);
    var goalEl = _el('p', 'cp-mac-goal');
    goalEl.textContent = 'How many screws in 31 days?';
    storyCard.appendChild(goalEl);
    wrap.appendChild(storyCard);

    /* Prompt */
    var promptEl = _el('p', 'cp-mac-prompt');
    promptEl.textContent = 'Split 31 into 30 + 1';
    wrap.appendChild(promptEl);

    /* Body */
    var body = _el('div', 'cp-mac-body');

    /* Left column — input rows */
    var leftCol = _el('div', 'cp-mac-left');

    /* Row 1 */
    var row1 = _el('div', 'cp-mac-row cp-mac-row--1');
    var lbl1 = _el('span', 'cp-mac-row-label');
    lbl1.textContent = '2825 × 1 =';
    row1.appendChild(lbl1);
    var inp1 = _el('input', 'cp-mac-input cp-mac-input--active-pulse');
    inp1.type = 'text'; inp1.setAttribute('readonly', 'true');
    inp1.setAttribute('aria-label', 'Row 1 answer');
    row1.appendChild(inp1);
    leftCol.appendChild(row1);

    /* Row 2 (hidden) */
    var row2 = _el('div', 'cp-mac-row cp-mac-row--2 cp-mac-row--hidden');
    row2.style.position = 'relative';
    var lbl2 = _el('span', 'cp-mac-row-label');
    lbl2.textContent = '2825 × 30 =';
    row2.appendChild(lbl2);
    var inp2 = _el('input', 'cp-mac-input');
    inp2.type = 'text'; inp2.setAttribute('readonly', 'true');
    inp2.setAttribute('aria-label', 'Row 2 answer');
    row2.appendChild(inp2);
    leftCol.appendChild(row2);

    /* Row 3 (hidden) */
    var row3 = _el('div', 'cp-mac-row cp-mac-row--3 cp-mac-row--hidden');
    var lbl3 = _el('span', 'cp-mac-row-label');
    lbl3.textContent = 'Add them =';
    row3.appendChild(lbl3);
    var inp3 = _el('input', 'cp-mac-input');
    inp3.type = 'text'; inp3.setAttribute('readonly', 'true');
    inp3.setAttribute('aria-label', 'Sum answer');
    row3.appendChild(inp3);
    leftCol.appendChild(row3);

    body.appendChild(leftCol);

    /* Right column — numpad */
    var rightCol = _el('div', 'cp-mac-right');
    var numpad = _el('div', 'cp-mac-numpad');
    var padGrid = _el('div', 'cp-mac-pad-grid');
    ['1','2','3','4','5','6','7','8','9','Clear','0','Del'].forEach(function (k) {
      var isCtrl = k === 'Clear' || k === 'Del';
      var btn = _el('button', 'cp-mac-key' + (isCtrl ? ' cp-mac-key--' + k.toLowerCase() : ''));
      btn.textContent = k;
      btn.setAttribute('aria-label', k);
      btn.addEventListener('click', function () {
        if (solved) return;
        if (k === 'Clear')    { activeInput.value = ''; }
        else if (k === 'Del') { activeInput.value = activeInput.value.slice(0, -1); }
        else if (activeInput.value.length < 8) { activeInput.value += k; tryAutoCheck(); }
      });
      padGrid.appendChild(btn);
    });
    numpad.appendChild(padGrid);
    rightCol.appendChild(numpad);
    body.appendChild(rightCol);
    wrap.appendChild(body);

    /* Next button */
    var nextBtn = _el('button', 'cp-mac-next-btn');
    nextBtn.textContent = 'Next: Division Lab →';
    nextBtn.style.display = 'none';
    nextBtn.addEventListener('click', function () { renderPage(page.next); });
    wrap.appendChild(nextBtn);

    /* ── State ── */
    var step        = 1;
    var activeInput = inp1;
    var wrong2Count = 0;
    var solved      = false;

    /* ── Helpers ── */
    function showStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className   = 'cp-mac-status' + (type ? ' cp-mac-status--' + type : '');
      if (typeof anime !== 'undefined') {
        anime.set(statusEl, { opacity: 0, translateY: 4 });
        anime({ targets: statusEl, opacity: 1, translateY: 0, duration: 280, easing: 'easeOutQuad' });
      }
    }

    function shakeEl(el) {
      if (typeof anime !== 'undefined') {
        anime({ targets: el, translateX: [0,-7,7,-5,5,-3,3,0], duration: 400, easing: 'easeInOutSine' });
      }
    }

    function bounceEl(el) {
      if (typeof anime !== 'undefined') {
        anime({ targets: el, scale: [1,1.12,0.95,1.05,1], duration: 500, easing: 'easeOutElastic(1,0.6)' });
      }
    }

    function spawnConfetti(anchorEl) {
      if (!anchorEl) return;
      var rect  = anchorEl.getBoundingClientRect();
      var wRect = wrap.getBoundingClientRect();
      var cols  = ['#a78bfa','#7c3aed','#2563eb','#f97316','#22c55e','#fbbf24'];
      for (var ci = 0; ci < 18; ci++) {
        var dot = document.createElement('div');
        dot.style.cssText = 'position:absolute;width:7px;height:7px;border-radius:50%;pointer-events:none;z-index:20;';
        dot.style.background = cols[ci % cols.length];
        dot.style.left = ((rect.left - wRect.left) + rect.width / 2) + 'px';
        dot.style.top  = ((rect.top  - wRect.top)  + rect.height / 2) + 'px';
        wrap.style.position = 'relative';
        wrap.appendChild(dot);
        if (typeof anime !== 'undefined') {
          anime({
            targets: dot,
            translateX: (Math.random() - 0.5) * 130,
            translateY: (Math.random() - 0.5) * 90 - 30,
            opacity: [1, 0], duration: 700 + Math.random() * 400, easing: 'easeOutCubic',
            complete: function (an) { if (an.animatables[0]) an.animatables[0].target.remove(); }
          });
        } else { dot.remove(); }
      }
    }

    function revealRow(rowEl) {
      rowEl.classList.remove('cp-mac-row--hidden');
      if (typeof anime !== 'undefined') {
        anime.set(rowEl, { opacity: 0, translateY: 16 });
        anime({ targets: rowEl, opacity: 1, translateY: 0, duration: 400, easing: 'easeOutQuad' });
      }
    }

    function setActiveInput(newInp) {
      if (activeInput) activeInput.classList.remove('cp-mac-input--active-pulse');
      activeInput = newInp;
      if (activeInput) activeInput.classList.add('cp-mac-input--active-pulse');
    }

    function showRow2TrickCard() {
      var card = _el('div', 'cp-mac-trick-card');
      card.textContent = '2825 × 3 = 8,475 → × 10 = 84,750';
      row2.appendChild(card);
      if (typeof anime !== 'undefined') {
        anime.set(card, { opacity: 0, translateY: -6 });
        anime({
          targets: card, opacity: 1, translateY: 0, duration: 300, easing: 'easeOutQuad',
          complete: function () {
            setTimeout(function () {
              anime({
                targets: card, opacity: 0, duration: 400, easing: 'easeInQuad',
                complete: function () { if (card.parentNode) card.parentNode.removeChild(card); }
              });
            }, 2500);
          }
        });
      } else {
        setTimeout(function () { if (card.parentNode) card.parentNode.removeChild(card); }, 3000);
      }
    }

    /* ── Auto-check after each digit ── */
    function tryAutoCheck() {
      var raw = activeInput.value.replace(/[^0-9]/g, '');
      if (!raw) return;
      var ent = parseInt(raw, 10);
      var expected = EXPECTED[step];
      if (ent === expected) { onSubmit(); return; }
      if (raw.length >= String(expected).length) onSubmit();
    }

    /* ── Submit handler ── */
    function onSubmit() {
      if (solved) return;
      var raw = activeInput.value.replace(/[^0-9]/g, '');
      if (!raw) {
        showStatus('Tap a digit first.', 'warn');
        return;
      }
      var entered  = parseInt(raw, 10);
      var expected = EXPECTED[step];

      if (entered === expected) {
        /* Correct */
        activeInput.classList.remove('cp-mac-input--active-pulse');
        activeInput.classList.add('cp-mac-input--correct');
        activeInput.value = _toInd(expected);
        bounceEl(activeInput);
        if (typeof playCorrect === 'function') playCorrect();

        if (step === 1) {
          revealRow(row2);
          setTimeout(function () {
            if (_currentPageId !== page.id) return;
            setActiveInput(inp2);
          }, 420);
          step = 2;
        } else if (step === 2) {
          revealRow(row3);
          setTimeout(function () {
            if (_currentPageId !== page.id) return;
            setActiveInput(inp3);
          }, 420);
          step = 3;
        } else {
          solved = true;
          if (typeof playComplete === 'function') playComplete();
          goalEl.textContent += ' ✓';
          spawnConfetti(row3);
          showStatus('Correct! 87,575 screws', 'correct');
          nextBtn.style.display = 'block';
          if (typeof anime !== 'undefined') {
            anime.set(nextBtn, { opacity: 0, translateY: 12 });
            anime({ targets: nextBtn, opacity: 1, translateY: 0, duration: 400, easing: 'easeOutBack' });
          }
        }
      } else {
        /* Wrong */
        shakeEl(activeInput);
        activeInput.value = '';
        if (typeof playWrong === 'function') playWrong();
        if (step === 1) {
          showStatus('Not quite. Hint: first solve 2,825 × 1.', 'error');
        } else if (step === 2) {
          wrong2Count++;
          showStatus('Not quite. Hint: now solve 2,825 × 30 by multiplying by 3 tens.', 'error');
          if (wrong2Count >= 2) showRow2TrickCard();
        } else {
          showStatus('Not quite. Hint: add the two partial answers to get the final total.', 'error');
        }
      }
    }
  }

  /* ══════════════════════════════════════════════════════
     PAGE 6.1 — Two-Step Story (Library Books)
  ══════════════════════════════════════════════════════ */

  function _renderTwoStepStory(page, area) {
    var stepIdx   = 0;
    var opPicked  = false;
    var inputVal  = '';
    var done      = false;

    var wrap = _el('div', 'cp-ts-wrap');
    wrap.dataset.pageId = page.id;

    var titleEl = _el('h1', 'cp-ts-title');
    titleEl.textContent = page.title || 'Two-Step Story';
    wrap.appendChild(titleEl);

    /* ── Story card ─────────────────────────────── */
    var storyCard = _el('div', 'cp-ts-story');
    (page.story || []).forEach(function (line, i) {
      var p = _el('p', 'cp-ts-story-line' + (i === page.story.length - 1 ? ' cp-ts-story-line--question' : ''));
      p.textContent = line;
      storyCard.appendChild(p);
    });
    wrap.appendChild(storyCard);

    /* ── Body: 2-column (left: step card │ right: answer panel) */
    var body    = _el('div', 'cp-ts-body');
    var leftCol = _el('div', 'cp-ts-left');

    /* ── Step card ──────────────────────────────── */
    var stepCard = _el('div', 'cp-ts-step-card');

    var dotsRow = _el('div', 'cp-ts-dots');
    var dots = [];
    (page.steps || []).forEach(function (_, i) {
      var dot = _el('span', 'cp-ts-dot' + (i === 0 ? ' cp-ts-dot--active' : ''));
      dot.setAttribute('aria-hidden', 'true');
      dotsRow.appendChild(dot);
      dots.push(dot);
    });
    stepCard.appendChild(dotsRow);

    var chipEl  = _el('span', 'cp-ts-chip');
    var leadEl  = _el('p', 'cp-ts-lead');
    var askEl   = _el('p', 'cp-ts-ask');
    stepCard.appendChild(chipEl);
    stepCard.appendChild(leadEl);
    stepCard.appendChild(askEl);

    /* ── Op console ─────────────────────────────── */
    var opConsole = _el('div', 'cp-ts-op-console');
    stepCard.appendChild(opConsole);
    leftCol.appendChild(stepCard);
    body.appendChild(leftCol);

    /* ── Right: answer panel (always visible, locked until op picked) */
    var ansPanel = _el('div', 'cp-ts-ans-panel');
    ansPanel.classList.add('cp-ts-ans-panel--locked');
    ansPanel.setAttribute('aria-live', 'polite');

    var ansInput = _el('input', 'cp-ts-input');
    ansInput.type = 'text';
    ansInput.placeholder = 'Answer';
    ansInput.setAttribute('readonly', 'true');
    ansInput.setAttribute('aria-label', 'Your answer');
    ansPanel.appendChild(ansInput);

    var numpad = _el('div', 'cp-ts-numpad');
    var padGrid = _el('div', 'cp-ts-pad-grid');
    ['1','2','3','4','5','6','7','8','9','Clear','0','Del'].forEach(function (k) {
      var cls = 'cp-ts-pad-btn';
      if (k === 'Clear') cls += ' cp-ts-pad-btn--clear';
      if (k === 'Del')   cls += ' cp-ts-pad-btn--del';
      var btn = _el('button', cls);
      btn.type = 'button';
      btn.textContent = k;
      btn.addEventListener('click', function () {
        if (done || !opPicked) return;
        if (typeof playTick === 'function') playTick();
        if (k === 'Clear') {
          inputVal = '';
        } else if (k === 'Del') {
          inputVal = inputVal.slice(0, -1);
        } else if (inputVal.length < 8) {
          inputVal += k;
        }
        ansInput.value = inputVal;
        var stepData = page.steps[stepIdx];
        if (inputVal.length > 0 && inputVal.length === String(stepData.expectedAns).length) {
          onSubmit();
        }
      });
      padGrid.appendChild(btn);
    });
    numpad.appendChild(padGrid);
    ansPanel.appendChild(numpad);
    body.appendChild(ansPanel);
    wrap.appendChild(body);

    /* ── Work strip ─────────────────────────────── */
    var workStrip = _el('div', 'cp-ts-work-strip');
    wrap.appendChild(workStrip);

    /* ── Enter HQ button ────────────────────────── */
    var enterBtn = _el('button', 'cp-ts-enter-btn');
    enterBtn.type = 'button';
    enterBtn.textContent = 'Enter Operation HQ →';
    enterBtn.style.display = 'none';
    enterBtn.addEventListener('click', function () {
      if (typeof playSweep === 'function') playSweep();
      renderPage(page.next);
    });
    wrap.appendChild(enterBtn);

    /* ── Status ─────────────────────────────────── */
    var statusEl = _el('p', 'cp-ts-status');
    statusEl.setAttribute('aria-live', 'polite');
    wrap.appendChild(statusEl);

    area.appendChild(wrap);

    /* ── Helpers ────────────────────────────────── */
    function showStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className = 'cp-ts-status' + (type ? ' cp-ts-status--' + type : '');
      if (typeof anime !== 'undefined') {
        anime.remove(statusEl);
        anime.set(statusEl, { opacity: 0, translateY: 4 });
        anime({ targets: statusEl, opacity: 1, translateY: 0, duration: 250, easing: 'easeOutQuad' });
      }
    }

    function shakeEl(el) {
      if (typeof anime !== 'undefined') {
        anime.remove(el);
        anime({ targets: el, translateX: [0,-8,8,-6,6,-3,3,0], duration: 420, easing: 'easeInOutSine' });
      }
    }

    function showSolveRow() {
      ansPanel.classList.remove('cp-ts-ans-panel--locked');
      ansInput.value = '';
      inputVal = '';
      if (typeof anime !== 'undefined') {
        anime.remove(ansPanel);
        anime({ targets: ansPanel, opacity: 1, scale: [0.96, 1], duration: 300, easing: 'easeOutBack' });
      }
    }

    function hideSolveRow() {
      ansPanel.classList.add('cp-ts-ans-panel--locked');
      ansInput.classList.remove('cp-ts-input--correct', 'cp-ts-input--error');
      ansInput.value = '';
      inputVal = '';
    }

    function spawnConfettiTs(anchorEl) {
      if (!anchorEl) return;
      var rect  = anchorEl.getBoundingClientRect();
      var wRect = wrap.getBoundingClientRect();
      var colors = ['#b45309','#16a34a','#2563eb','#7c3aed','#f97316','#fbbf24'];
      for (var i = 0; i < 18; i++) {
        var dot = document.createElement('div');
        dot.className = 'cp-ts-confetti';
        dot.style.background = colors[i % colors.length];
        dot.style.left = ((rect.left - wRect.left) + rect.width / 2) + 'px';
        dot.style.top  = ((rect.top  - wRect.top)  + rect.height / 2) + 'px';
        wrap.appendChild(dot);
        if (typeof anime !== 'undefined') {
          anime({
            targets: dot,
            translateX: (Math.random() - 0.5) * 160,
            translateY: (Math.random() - 0.5) * 100 - 40,
            rotate: Math.random() * 280,
            opacity: [1, 0],
            duration: 900 + Math.random() * 500,
            easing: 'easeOutCubic',
            complete: function (an) {
              if (an.animatables[0]) an.animatables[0].target.remove();
            }
          });
        } else {
          (function (piece) { setTimeout(function () { if (piece.parentNode) piece.remove(); }, 950); })(dot);
        }
      }
    }

    /* ── Build op console for a given step ─────── */
    function buildOpConsole(stepData) {
      opConsole.innerHTML = '';
      opPicked = false;
      ['+', '−', '×', '÷'].forEach(function (sym) {
        var btn = _el('button', 'cp-ts-op-btn');
        btn.type = 'button';
        btn.textContent = sym;
        btn.setAttribute('aria-label', ({ '+': 'Add', '−': 'Subtract', '×': 'Multiply', '÷': 'Divide' })[sym]);
        btn.addEventListener('click', function () {
          if (done || opPicked) return;
          if (sym === stepData.correctOp) {
            opPicked = true;
            btn.classList.add('cp-ts-op-btn--selected');
            Array.prototype.forEach.call(opConsole.querySelectorAll('.cp-ts-op-btn'), function (b) {
              if (b !== btn) {
                b.style.opacity = '0.3';
                b.style.pointerEvents = 'none';
              }
            });
            if (typeof anime !== 'undefined') {
              anime.remove(btn);
              anime({ targets: btn, scale: [1, 1.18, 1], duration: 320, easing: 'easeOutBack' });
            }
            showStatus(stepData.statusOpCorrect, 'ok');
            showSolveRow();
          } else {
            shakeEl(btn);
            showStatus(stepData.statusOpWrong, 'err');
          }
        });
        opConsole.appendChild(btn);
      });
    }

    /* ── Load step content ──────────────────────── */
    function loadStep(idx) {
      var stepData = page.steps[idx];
      chipEl.textContent  = stepData.chip;
      leadEl.textContent  = stepData.lead;
      askEl.textContent   = stepData.ask;
      buildOpConsole(stepData);
      hideSolveRow();
      statusEl.textContent = '';
      statusEl.className   = 'cp-ts-status';

      dots.forEach(function (d, i) {
        d.className = 'cp-ts-dot';
        if (i < idx)  d.classList.add('cp-ts-dot--done');
        if (i === idx) d.classList.add('cp-ts-dot--active');
      });
    }

    /* ── Submit handler ─────────────────────────── */
    function onSubmit() {
      if (done || !opPicked) return;
      var stepData  = page.steps[stepIdx];
      var isLast    = stepIdx === page.steps.length - 1;
      var parsed    = parseInt(inputVal.replace(/[^0-9]/g, ''), 10);

      if (parsed === stepData.expectedAns) {
        if (typeof playCorrect === 'function') playCorrect();
        ansInput.classList.add('cp-ts-input--correct');
        if (typeof anime !== 'undefined') {
          anime.remove(ansInput);
          anime({ targets: ansInput, scale: [1, 1.06, 1], duration: 380, easing: 'easeOutBack' });
        }
        showStatus(stepData.statusAnsCorrect, 'ok');

        setTimeout(function () {
          if (_currentPageId !== page.id) return;

          /* Append summary to work strip */
          var item = _el('div', 'cp-ts-work-item');
          item.textContent = stepData.summary;
          workStrip.appendChild(item);
          if (typeof anime !== 'undefined') {
            anime.set(item, { opacity: 0, translateY: 8 });
            anime({ targets: item, opacity: 1, translateY: 0, duration: 350, easing: 'easeOutQuad' });
          }

          if (isLast) {
            done = true;
            dots[stepIdx].classList.remove('cp-ts-dot--active');
            dots[stepIdx].classList.add('cp-ts-dot--done');
            askEl.textContent = stepData.doneText;
            spawnConfettiTs(stepCard);
            enterBtn.style.display = 'block';
            if (typeof anime !== 'undefined') {
              anime.set(enterBtn, { opacity: 0, translateY: 14 });
              anime({ targets: enterBtn, opacity: 1, translateY: 0, duration: 420, easing: 'easeOutBack',
                complete: function () { enterBtn.classList.add('cp-ts-enter-btn--pulse'); }
              });
            }
          } else {
            dots[stepIdx].classList.remove('cp-ts-dot--active');
            dots[stepIdx].classList.add('cp-ts-dot--done');
            stepIdx = 1;
            ansInput.classList.remove('cp-ts-input--correct');
            loadStep(stepIdx);
          }
        }, 500);

      } else {
        if (typeof playWrong === 'function') playWrong();
        ansInput.classList.add('cp-ts-input--error');
        shakeEl(ansInput);
        setTimeout(function () {
          if (_currentPageId !== page.id) return;
          ansInput.classList.remove('cp-ts-input--error');
          ansInput.value = '';
          inputVal = '';
        }, 420);
        showStatus(stepData.statusAnsWrong, 'err');
      }
    }

    /* ── Initial load ───────────────────────────── */
    loadStep(0);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 6.2 — Operation HQ (4 sequential rounds)
  ══════════════════════════════════════════════════════ */

  function _renderOperationHQ(page, area) {
    var hqCur    = 0;
    var opPicked = false;
    var inputVal = '';
    var roundDone = false;

    var wrap = _el('div', 'cp-hq-wrap');
    wrap.dataset.pageId = page.id;

    /* ── Header strip ───────────────────────────── */
    var header = _el('div', 'cp-hq-header');

    var hqLabel = _el('span', 'cp-hq-label');
    hqLabel.textContent = 'OPERATION HQ';
    header.appendChild(hqLabel);

    var dotsRow = _el('div', 'cp-hq-dots');
    var hqDots = [];
    (page.rounds || []).forEach(function () {
      var dot = _el('span', 'cp-hq-dot');
      dot.setAttribute('aria-hidden', 'true');
      dotsRow.appendChild(dot);
      hqDots.push(dot);
    });
    header.appendChild(dotsRow);

    var roundChip = _el('span', 'cp-hq-round-chip');
    header.appendChild(roundChip);

    wrap.appendChild(header);

    /* ── Per-round title ────────────────────────── */
    var titleEl = _el('h1', 'cp-hq-title');
    wrap.appendChild(titleEl);

    /* ── Round card ─────────────────────────────── */
    var roundCard = _el('div', 'cp-hq-round-card');
    var descEl    = _el('div', 'cp-hq-desc');
    roundCard.appendChild(descEl);
    /* ── Body: 2-column (left: round card + ops │ right: answer panel) */
    var body    = _el('div', 'cp-hq-body');
    var leftCol = _el('div', 'cp-hq-left');
    leftCol.appendChild(roundCard);

    /* ── Op console ─────────────────────────────── */
    var opConsole = _el('div', 'cp-hq-op-console');
    leftCol.appendChild(opConsole);
    body.appendChild(leftCol);

    /* ── Right: answer panel (always visible, locked until op picked) */
    var ansPanel = _el('div', 'cp-hq-ans-panel');
    ansPanel.classList.add('cp-hq-ans-panel--locked');
    ansPanel.setAttribute('aria-live', 'polite');

    var ansInput = _el('input', 'cp-hq-input');
    ansInput.type = 'text';
    ansInput.placeholder = 'Answer';
    ansInput.setAttribute('readonly', 'true');
    ansInput.setAttribute('aria-label', 'Your answer');
    ansPanel.appendChild(ansInput);

    var numpad  = _el('div', 'cp-hq-numpad');
    var padGrid = _el('div', 'cp-hq-pad-grid');
    ['1','2','3','4','5','6','7','8','9','Clear','0','Del'].forEach(function (k) {
      var cls = 'cp-hq-pad-btn';
      if (k === 'Clear') cls += ' cp-hq-pad-btn--clear';
      if (k === 'Del')   cls += ' cp-hq-pad-btn--del';
      var btn = _el('button', cls);
      btn.type = 'button';
      btn.textContent = k;
      btn.addEventListener('click', function () {
        if (roundDone || !opPicked) return;
        if (typeof playTick === 'function') playTick();
        if (k === 'Clear') {
          inputVal = '';
        } else if (k === 'Del') {
          inputVal = inputVal.slice(0, -1);
        } else if (inputVal.length < 9) {
          inputVal += k;
        }
        ansInput.value = inputVal;
        var round = page.rounds[hqCur];
        if (inputVal.length > 0 && inputVal.length === String(round.expectedAns).length) {
          onHqSubmit();
        }
      });
      padGrid.appendChild(btn);
    });
    numpad.appendChild(padGrid);
    ansPanel.appendChild(numpad);
    body.appendChild(ansPanel);
    wrap.appendChild(body);

    /* ── Next round button ──────────────────────── */
    var nextBtn = _el('button', 'cp-hq-next-btn');
    nextBtn.type = 'button';
    nextBtn.style.display = 'none';
    nextBtn.addEventListener('click', onNextRound);
    wrap.appendChild(nextBtn);

    /* ── Status ─────────────────────────────────── */
    var statusEl = _el('p', 'cp-hq-status');
    statusEl.setAttribute('aria-live', 'polite');
    wrap.appendChild(statusEl);

    area.appendChild(wrap);

    /* ── Helpers ────────────────────────────────── */
    function showStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className = 'cp-hq-status' + (type ? ' cp-hq-status--' + type : '');
      if (typeof anime !== 'undefined') {
        anime.remove(statusEl);
        anime.set(statusEl, { opacity: 0, translateY: 4 });
        anime({ targets: statusEl, opacity: 1, translateY: 0, duration: 250, easing: 'easeOutQuad' });
      }
    }

    function shakeEl(el) {
      if (typeof anime !== 'undefined') {
        anime.remove(el);
        anime({ targets: el, translateX: [0,-8,8,-6,6,-3,3,0], duration: 420, easing: 'easeInOutSine' });
      }
    }

    function showSolveRow() {
      ansPanel.classList.remove('cp-hq-ans-panel--locked');
      ansInput.value = '';
      inputVal = '';
      if (typeof anime !== 'undefined') {
        anime.remove(ansPanel);
        anime({ targets: ansPanel, opacity: 1, scale: [0.96, 1], duration: 300, easing: 'easeOutBack' });
      }
    }

    function spawnConfettiHq(anchorEl) {
      if (!anchorEl) return;
      var rect  = anchorEl.getBoundingClientRect();
      var wRect = wrap.getBoundingClientRect();
      var colors = ['#b45309','#16a34a','#2563eb','#7c3aed','#f97316','#fbbf24','#ec4899'];
      for (var i = 0; i < 24; i++) {
        var dot = document.createElement('div');
        dot.className = 'cp-hq-confetti';
        dot.style.background = colors[i % colors.length];
        dot.style.left = ((rect.left - wRect.left) + rect.width / 2) + 'px';
        dot.style.top  = ((rect.top  - wRect.top)  + rect.height / 2) + 'px';
        wrap.appendChild(dot);
        if (typeof anime !== 'undefined') {
          anime({
            targets: dot,
            translateX: (Math.random() - 0.5) * 200,
            translateY: (Math.random() - 0.5) * 120 - 30,
            rotate: Math.random() * 360,
            opacity: [1, 0],
            duration: 1000 + Math.random() * 600,
            easing: 'easeOutCubic',
            complete: function (an) {
              if (an.animatables[0]) an.animatables[0].target.remove();
            }
          });
        } else {
          (function (piece) { setTimeout(function () { if (piece.parentNode) piece.remove(); }, 1100); })(dot);
        }
      }
    }

    /* ── Build op console for current round ─────── */
    function buildOpConsole(round) {
      opConsole.innerHTML = '';
      opPicked  = false;
      roundDone = false;
      ['+', '−', '×', '÷'].forEach(function (sym) {
        var btn = _el('button', 'cp-hq-op-btn');
        btn.type = 'button';
        btn.textContent = sym;
        btn.setAttribute('aria-label', ({ '+': 'Add', '−': 'Subtract', '×': 'Multiply', '÷': 'Divide' })[sym]);
        btn.addEventListener('click', function () {
          if (roundDone || opPicked) return;
          if (sym === round.correctOp) {
            opPicked = true;
            btn.classList.add('cp-hq-op-btn--selected');
            Array.prototype.forEach.call(opConsole.querySelectorAll('.cp-hq-op-btn'), function (b) {
              if (b !== btn) { b.style.opacity = '0.3'; b.style.pointerEvents = 'none'; }
            });
            if (typeof anime !== 'undefined') {
              anime.remove(btn);
              anime({ targets: btn, scale: [1, 1.18, 1], duration: 320, easing: 'easeOutBack' });
            }
            showStatus('Correct operation. Now solve this round.', 'ok');
            showSolveRow();
          } else {
            shakeEl(btn);
            showStatus(page.statusWrongOp, 'err');
          }
        });
        opConsole.appendChild(btn);
      });
    }

    /* ── Load a round ───────────────────────────── */
    function loadHqRound(idx) {
      var round = page.rounds[idx];
      roundDone = false;
      opPicked  = false;
      inputVal  = '';

      titleEl.textContent     = round.title;
      descEl.textContent      = round.desc;
      roundChip.textContent   = 'Round ' + (idx + 1) + ' of ' + page.rounds.length;
      nextBtn.textContent     = (idx === page.rounds.length - 1) ? 'Finish Mission →' : 'Next Round →';
      nextBtn.style.display   = 'none';
      nextBtn.classList.remove('cp-hq-next-btn--pulse');
      ansPanel.classList.add('cp-hq-ans-panel--locked');
      ansInput.classList.remove('cp-hq-input--correct', 'cp-hq-input--error');
      ansInput.value          = '';
      statusEl.textContent    = '';
      statusEl.className      = 'cp-hq-status';

      hqDots.forEach(function (d, i) {
        d.className = 'cp-hq-dot';
        if (i < idx) d.classList.add('cp-hq-dot--done');
        if (i === idx) d.classList.add('cp-hq-dot--active');
      });

      buildOpConsole(round);

      if (typeof anime !== 'undefined') {
        var isFirst = idx === 0;
        var opDelay = isFirst ? 1600 : 200;
        var cardDelay = isFirst ? 500 : 0;
        anime.set(roundCard, { opacity: 0, translateY: 16 });
        anime({ targets: roundCard, opacity: 1, translateY: 0, duration: 400, delay: cardDelay, easing: 'easeOutQuad' });
        anime.set(opConsole.querySelectorAll('.cp-hq-op-btn'), { opacity: 0, scale: 0.5 });
        anime({
          targets: opConsole.querySelectorAll('.cp-hq-op-btn'),
          opacity: 1, scale: [0.5, 1.12, 1],
          duration: 300,
          delay: anime.stagger(80, { start: opDelay }),
          easing: 'easeOutBack'
        });
      }
    }

    /* ── Submit answer ──────────────────────────── */
    function onHqSubmit() {
      if (roundDone || !opPicked) return;
      var round  = page.rounds[hqCur];
      var parsed = parseInt(inputVal.replace(/[^0-9]/g, ''), 10);

      if (parsed === round.expectedAns) {
        roundDone = true;
        if (typeof playCorrect === 'function') playCorrect();
        ansInput.classList.add('cp-hq-input--correct');
        if (typeof anime !== 'undefined') {
          anime.remove(ansInput);
          anime({ targets: ansInput, scale: [1, 1.06, 1], duration: 380, easing: 'easeOutBack' });
        }
        showStatus(round.successMsg, 'ok');

        hqDots[hqCur].classList.remove('cp-hq-dot--active');
        hqDots[hqCur].classList.add('cp-hq-dot--done');
        if (typeof anime !== 'undefined') {
          anime.remove(hqDots[hqCur]);
          anime({ targets: hqDots[hqCur], scale: [1, 1.4, 1], duration: 350, easing: 'easeOutBack' });
        }

        nextBtn.style.display = 'block';
        if (typeof anime !== 'undefined') {
          anime.set(nextBtn, { opacity: 0, translateY: 14 });
          anime({ targets: nextBtn, opacity: 1, translateY: 0, duration: 400, easing: 'easeOutBack',
            complete: function () { nextBtn.classList.add('cp-hq-next-btn--pulse'); }
          });
        }
      } else {
        if (typeof playWrong === 'function') playWrong();
        ansInput.classList.add('cp-hq-input--error');
        shakeEl(ansInput);
        setTimeout(function () {
          if (_currentPageId !== page.id) return;
          ansInput.classList.remove('cp-hq-input--error');
          ansInput.value = '';
          inputVal = '';
        }, 420);
        showStatus(page.statusWrongAns, 'err');
      }
    }

    /* ── Next round ─────────────────────────────── */
    function onNextRound() {
      hqCur++;
      if (hqCur >= (page.rounds || []).length) {
        _hqFinish();
      } else {
        ansInput.classList.remove('cp-hq-input--correct');
        loadHqRound(hqCur);
      }
    }

    /* ── Finish: all rounds done ────────────────── */
    function _hqFinish() {
      if (_currentPageId !== page.id) return;
      spawnConfettiHq(header);
      if (typeof anime !== 'undefined') {
        anime({
          targets: hqDots,
          backgroundColor: ['#16a34a', '#fbbf24', '#16a34a'],
          scale: [1, 1.3, 1],
          duration: 600,
          delay: anime.stagger(120),
          easing: 'easeOutBack'
        });
      }
      setTimeout(function () {
        if (_currentPageId !== page.id) return;
        if (typeof playSweep === 'function') playSweep();
        renderPage(page.next);
      }, 1400);
    }

    /* ── Initial load ───────────────────────────── */
    loadHqRound(0);
  }

  /* ══════════════════════════════════════════════════════
     PAGE 6.3 — Number Solver
  ══════════════════════════════════════════════════════ */
  function _renderNumberSolver(page, area) {
    var rlSolved  = 0;
    var activeIdx = -1;
    var opPicked  = false;
    var inputVal  = '';
    var isOpen    = false;   /* inline panel visible */

    var opLabelMap = { '+': '+', '-': '−', 'x': '×', '/': '÷' };

    var wrap = _el('div', 'cp-ns-wrap');
    wrap.dataset.pageId = page.id;

    /* ── Inner column (70% centered; wrap carries full-bleed bg) ── */
    var inner = _el('div', 'cp-ns-inner');
    wrap.appendChild(inner);

    /* ── Header ─────────────────────────────────── */
    var header = _el('div', 'cp-ns-header');
    var titleEl = _el('h1', 'cp-title');
    titleEl.textContent = page.title;
    var subtitleEl = _el('p', 'cp-subtitle');
    subtitleEl.textContent = page.subtitle;
    header.appendChild(titleEl);
    header.appendChild(subtitleEl);
    inner.appendChild(header);

    /* ── Progress chip ──────────────────────────── */
    var chip = _el('div', 'cp-ns-chip');
    chip.setAttribute('aria-live', 'polite');
    chip.textContent = 'Solved: 0 / 4';
    inner.appendChild(chip);

    /* ── Card grid ──────────────────────────────── */
    var grid = _el('div', 'cp-ns-grid');
    var cardEls = [];
    (page.cards || []).forEach(function (cardData, i) {
      var card = _el('div', 'cp-ns-card');
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Solve ' + cardData.title);

      var hdr = _el('div', 'cp-ns-card-hdr');
      hdr.textContent = cardData.title;
      card.appendChild(hdr);

      var body = _el('div', 'cp-ns-card-body');
      (cardData.body || []).forEach(function (line) {
        var p = _el('p', '');
        p.textContent = line;
        body.appendChild(p);
      });
      card.appendChild(body);

      card.addEventListener('click', function () {
        if (card.classList.contains('cp-ns-card--solved') || isOpen) return;
        openCard(i);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!card.classList.contains('cp-ns-card--solved') && !isOpen) openCard(i);
        }
      });
      grid.appendChild(card);
      cardEls.push(card);
    });
    inner.appendChild(grid);

    /* ── Inline active area (shown instead of modal) ── */
    var activeArea = _el('div', 'cp-ns-active-area');
    activeArea.style.display = 'none';

    /* Left: card info */
    var activeLeft = _el('div', 'cp-ns-active-card');
    var activeCardHdr  = _el('div', 'cp-ns-card-hdr');
    var activeCardBody = _el('div', 'cp-ns-card-body');
    activeLeft.appendChild(activeCardHdr);
    activeLeft.appendChild(activeCardBody);
    activeArea.appendChild(activeLeft);

    /* Right: interaction */
    var activeRight = _el('div', 'cp-ns-active-interact');

    var activeTitle = _el('h2', 'cp-ns-active-title');
    activeRight.appendChild(activeTitle);

    /* Op console */
    var opConsole = _el('div', 'cp-ns-op-console');
    ['+', '-', 'x', '/'].forEach(function (opKey) {
      var btn = _el('button', 'cp-ns-op-btn');
      btn.type = 'button';
      btn.textContent = opLabelMap[opKey];
      btn.dataset.op = opKey;
      btn.setAttribute('aria-label', ({ '+': 'Add', '-': 'Subtract', 'x': 'Multiply', '/': 'Divide' })[opKey]);
      btn.addEventListener('click', function () {
        if (opPicked) return;
        var correctOp = (page.cards[activeIdx] || {}).op;
        if (opKey === correctOp) {
          opPicked = true;
          btn.classList.add('cp-ns-op-btn--selected');
          Array.prototype.forEach.call(opConsole.querySelectorAll('.cp-ns-op-btn'), function (b) {
            if (b !== btn) { b.style.opacity = '0.3'; b.style.pointerEvents = 'none'; }
          });
          if (typeof anime !== 'undefined') {
            anime.remove(btn);
            anime({ targets: btn, scale: [1, 1.18, 1], duration: 320, easing: 'easeOutBack' });
          }
          showNsStatus('Correct operation. Now type the answer.', 'ok');
          showNsSolveArea();
        } else {
          shakeNs(btn);
          showNsStatus(page.statusWrongOp, 'err');
        }
      });
      opConsole.appendChild(btn);
    });
    activeRight.appendChild(opConsole);

    /* Solve area (hidden until op picked) */
    var solveArea = _el('div', 'cp-ns-solve-area');
    solveArea.style.display = 'none';

    var ansInput = _el('input', 'cp-ns-input');
    ansInput.type = 'text';
    ansInput.placeholder = 'Answer';
    ansInput.setAttribute('readonly', 'true');
    ansInput.setAttribute('aria-label', 'Your answer');
    solveArea.appendChild(ansInput);

    var numpad  = _el('div', 'cp-ns-numpad');
    var padGrid = _el('div', 'cp-ns-pad-grid');
    ['1','2','3','4','5','6','7','8','9','Clear','0','Del'].forEach(function (k) {
      var cls = 'cp-ns-pad-btn';
      if (k === 'Clear') cls += ' cp-ns-pad-btn--clear';
      if (k === 'Del')   cls += ' cp-ns-pad-btn--del';
      var btn = _el('button', cls);
      btn.type = 'button';
      btn.textContent = k;
      btn.addEventListener('click', function () {
        if (!opPicked) return;
        if (typeof playTick === 'function') playTick();
        if (k === 'Clear') {
          inputVal = '';
          ansInput.className = 'cp-ns-input';
        } else if (k === 'Del') {
          inputVal = inputVal.slice(0, -1);
          ansInput.className = 'cp-ns-input';
        } else if (inputVal.length < 8) {
          inputVal += k;
        }
        ansInput.value = inputVal;
        /* auto-check after every digit */
        autoCheckNs();
      });
      padGrid.appendChild(btn);
    });
    numpad.appendChild(padGrid);
    solveArea.appendChild(numpad);

    activeRight.appendChild(solveArea);

    /* Status */
    var statusEl = _el('p', 'cp-ns-status');
    statusEl.setAttribute('aria-live', 'polite');
    activeRight.appendChild(statusEl);

    activeArea.appendChild(activeRight);
    inner.appendChild(activeArea);

    /* ── Final Game button ──────────────────────── */
    var finalBtn = _el('button', 'cp-ns-final-btn');
    finalBtn.type = 'button';
    finalBtn.textContent = 'Final Game →';
    finalBtn.style.display = 'none';
    finalBtn.addEventListener('click', function () {
      if (typeof playSweep === 'function') playSweep();
      renderPage(page.next);
    });
    inner.appendChild(finalBtn);

    area.appendChild(wrap);

    /* ── Helpers ────────────────────────────────── */
    function showNsStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className = 'cp-ns-status' + (type ? ' cp-ns-status--' + type : '');
      if (typeof anime !== 'undefined') {
        anime.remove(statusEl);
        anime.set(statusEl, { opacity: 0, translateY: 4 });
        anime({ targets: statusEl, opacity: 1, translateY: 0, duration: 250, easing: 'easeOutQuad' });
      }
    }

    function shakeNs(el) {
      if (typeof anime !== 'undefined') {
        anime.remove(el);
        anime({ targets: el, translateX: [0,-8,8,-6,6,-3,3,0], duration: 420, easing: 'easeInOutSine' });
      }
    }

    function showNsSolveArea() {
      solveArea.style.display = 'flex';
      ansInput.value = '';
      inputVal = '';
      if (typeof anime !== 'undefined') {
        anime.set(solveArea, { opacity: 0, translateY: 10 });
        anime({ targets: solveArea, opacity: 1, translateY: 0, duration: 350, easing: 'easeOutBack' });
      }
    }

    function openCard(i) {
      if (isOpen) return;
      activeIdx = i;
      isOpen    = true;
      opPicked  = false;
      inputVal  = '';

      var cardData = page.cards[i];

      /* Populate left panel */
      activeCardHdr.textContent = cardData.title;
      while (activeCardBody.firstChild) activeCardBody.removeChild(activeCardBody.firstChild);
      (cardData.body || []).forEach(function (line) {
        var p = _el('p', '');
        p.textContent = line;
        activeCardBody.appendChild(p);
      });

      /* Populate right panel */
      activeTitle.textContent = cardData.title;
      statusEl.textContent    = '';
      statusEl.className      = 'cp-ns-status';
      solveArea.style.display = 'none';
      ansInput.value = '';
      ansInput.className = 'cp-ns-input';

      /* Reset op console */
      Array.prototype.forEach.call(opConsole.querySelectorAll('.cp-ns-op-btn'), function (b) {
        b.classList.remove('cp-ns-op-btn--selected');
        b.style.opacity = '';
        b.style.pointerEvents = '';
      });

      /* Hide grid, show active area */
      if (typeof anime !== 'undefined') {
        anime.remove(grid);
        anime({
          targets: grid, opacity: 0, translateY: -10, duration: 220, easing: 'easeInQuad',
          complete: function () {
            grid.style.display = 'none';
            activeArea.style.display = 'flex';
            anime.set(activeArea, { opacity: 0, translateY: 16 });
            anime({ targets: activeArea, opacity: 1, translateY: 0, duration: 360, easing: 'easeOutBack' });
            /* cascade-pop op buttons */
            anime.set(opConsole.querySelectorAll('.cp-ns-op-btn'), { opacity: 0, scale: 0.5 });
            anime({
              targets: opConsole.querySelectorAll('.cp-ns-op-btn'),
              opacity: 1, scale: [0.5, 1.12, 1],
              duration: 300,
              delay: anime.stagger(70, { start: 200 }),
              easing: 'easeOutBack'
            });
          }
        });
      } else {
        grid.style.display = 'none';
        activeArea.style.display = 'flex';
      }
    }

    function closeActiveArea(callback) {
      isOpen = false;
      if (typeof anime !== 'undefined') {
        anime.remove(activeArea);
        anime({
          targets: activeArea, opacity: 0, translateY: 10, duration: 240, easing: 'easeInQuad',
          complete: function () {
            activeArea.style.display = 'none';
            grid.style.display = '';
            anime.set(grid, { opacity: 0, translateY: 10 });
            anime({ targets: grid, opacity: 1, translateY: 0, duration: 320, easing: 'easeOutBack' });
            if (callback) callback();
          }
        });
      } else {
        activeArea.style.display = 'none';
        grid.style.display = '';
        if (callback) callback();
      }
    }

    function markCardSolved(i) {
      var card = cardEls[i];
      card.classList.add('cp-ns-card--solved');
      card.style.pointerEvents = 'none';
      card.removeAttribute('tabindex');

      var check = _el('div', 'cp-ns-card-check');
      check.textContent = '✓ Solved!';
      card.appendChild(check);

      if (typeof anime !== 'undefined') {
        anime.set(check, { opacity: 0, scale: 0.5 });
        anime({ targets: check, opacity: 1, scale: 1, duration: 400, delay: 100, easing: 'easeOutBack' });
      }
    }

    function updateChip() {
      chip.textContent = 'Solved: ' + rlSolved + ' / 4';
      if (typeof anime !== 'undefined') {
        anime.remove(chip);
        anime({ targets: chip, scale: [1, 1.14, 1], duration: 300, easing: 'easeOutBack' });
      }
      if (rlSolved === 4) {
        chip.classList.add('cp-ns-chip--gold');
      }
    }

    function spawnConfettiNs() {
      var colors = ['#b45309','#16a34a','#2563eb','#7c3aed','#f97316','#fbbf24','#ec4899'];
      var wRect = wrap.getBoundingClientRect();
      for (var ci = 0; ci < 30; ci++) {
        var dot = document.createElement('div');
        dot.className = 'cp-ns-confetti';
        dot.style.background = colors[ci % colors.length];
        dot.style.left = (wRect.width * 0.5) + 'px';
        dot.style.top  = (wRect.height * 0.4) + 'px';
        wrap.appendChild(dot);
        if (typeof anime !== 'undefined') {
          anime({
            targets: dot,
            translateX: (Math.random() - 0.5) * 300,
            translateY: (Math.random() - 0.5) * 200 - 50,
            rotate: Math.random() * 360,
            opacity: [1, 0],
            duration: 1100 + Math.random() * 600,
            easing: 'easeOutCubic',
            complete: function (an) {
              if (an.animatables[0]) an.animatables[0].target.remove();
            }
          });
        } else {
          (function (p) { setTimeout(function () { if (p.parentNode) p.remove(); }, 1200); })(dot);
        }
      }
    }

    /* ── Auto-check on every numpad press ──────── */
    function autoCheckNs() {
      if (!opPicked || activeIdx < 0) return;
      var cardData = page.cards[activeIdx];
      var parsed   = parseInt(inputVal.replace(/[^0-9]/g, ''), 10);

      if (parsed === cardData.answer) {
        /* Correct */
        if (typeof playCorrect === 'function') playCorrect();
        ansInput.classList.add('cp-ns-input--correct');
        if (typeof anime !== 'undefined') {
          anime.remove(ansInput);
          anime({ targets: ansInput, scale: [1, 1.06, 1], duration: 380, easing: 'easeOutBack' });
        }
        showNsStatus('Solved!', 'ok');

        /* Disable further numpad presses */
        opPicked = false;

        var solvedIdx = activeIdx;
        setTimeout(function () {
          if (_currentPageId !== page.id) return;
          closeActiveArea(function () {
            if (_currentPageId !== page.id) return;
            rlSolved++;
            markCardSolved(solvedIdx);
            updateChip();
            if (rlSolved === 4) {
              spawnConfettiNs();
              finalBtn.style.display = 'block';
              if (typeof anime !== 'undefined') {
                anime.set(finalBtn, { opacity: 0, translateY: 20 });
                anime({
                  targets: finalBtn,
                  opacity: 1, translateY: 0,
                  duration: 500,
                  easing: 'easeOutBack',
                  complete: function () { finalBtn.classList.add('cp-ns-final-btn--pulse'); }
                });
              }
            }
          });
        }, 800);
      } else if (inputVal.length >= String(cardData.answer).length) {
        /* Wrong — typed enough digits but doesn't match */
        if (typeof playWrong === 'function') playWrong();
        ansInput.classList.add('cp-ns-input--error');
        shakeNs(ansInput);
        setTimeout(function () {
          if (_currentPageId !== page.id) return;
          ansInput.classList.remove('cp-ns-input--error');
          ansInput.value = '';
          inputVal = '';
        }, 420);
        showNsStatus(page.statusWrongAns, 'err');
      }
    }
  }

  /* ══════════════════════════════════════════════════════
     PAGE 6.4 — Operation Rush
  ══════════════════════════════════════════════════════ */
  function _renderOperationRush(page, area) {
    var rushQ     = -1;
    var rushScore = 0;
    var streak    = 0;
    var inputVal  = '';
    var advanced  = false;
    var answering = false;

    /* ── Outer wrap — full-bleed bg ─────────────── */
    var wrap = _el('div', 'cp-rush-wrap');
    wrap.dataset.pageId = page.id;

    /* ── Inner column — centered 80% ────────────── */
    var inner = _el('div', 'cp-rush-inner');
    wrap.appendChild(inner);

    /* ── Header ─────────────────────────────────── */
    var header = _el('div', 'cp-rush-header');
    var titleEl = _el('h1', 'cp-title');
    titleEl.textContent = page.title;
    header.appendChild(titleEl);
    inner.appendChild(header);

    /* ── Top chips strip ────────────────────────── */
    var topStrip = _el('div', 'cp-rush-top');

    var qChip = _el('span', 'cp-rush-chip');
    qChip.textContent = 'Q 1 / 5';
    topStrip.appendChild(qChip);

    var scoreEl = _el('span', 'cp-rush-score');
    scoreEl.textContent = 'Score: 0 / 5';
    topStrip.appendChild(scoreEl);

    var streakEl = _el('span', 'cp-rush-streak');
    streakEl.textContent = '🔥';
    streakEl.style.display = 'none';
    topStrip.appendChild(streakEl);

    inner.appendChild(topStrip);

    /* ── Body: two-column ───────────────────────── */
    var bodyEl = _el('div', 'cp-rush-body');

    /* Left — question card */
    var qCard = _el('div', 'cp-rush-q-card');
    var qText = _el('p', 'cp-rush-q-text');
    qCard.appendChild(qText);
    bodyEl.appendChild(qCard);

    /* Right — numpad panel (white card) */
    var numpadPanel = _el('div', 'cp-rush-numpad-panel');

    var ansInput = _el('input', 'cp-rush-input');
    ansInput.type = 'text';
    ansInput.placeholder = 'Answer';
    ansInput.setAttribute('readonly', 'true');
    ansInput.setAttribute('aria-label', 'Your answer');
    numpadPanel.appendChild(ansInput);

    var padGrid = _el('div', 'cp-rush-pad-grid');
    ['1','2','3','4','5','6','7','8','9','Clear','0','Del'].forEach(function (k) {
      var cls = 'cp-rush-pad-btn';
      if (k === 'Clear') cls += ' cp-rush-pad-btn--clear';
      if (k === 'Del')   cls += ' cp-rush-pad-btn--del';
      var btn = _el('button', cls);
      btn.type = 'button';
      btn.textContent = k;
      btn.addEventListener('click', function () {
        if (answering) return;
        if (typeof playTick === 'function') playTick();
        if (k === 'Clear') {
          inputVal = '';
          ansInput.className = 'cp-rush-input';
        } else if (k === 'Del') {
          inputVal = inputVal.slice(0, -1);
          ansInput.className = 'cp-rush-input';
        } else if (inputVal.length < 9) {
          inputVal += k;
        }
        ansInput.value = inputVal;
        autoCheckRush();
      });
      padGrid.appendChild(btn);
    });
    numpadPanel.appendChild(padGrid);

    bodyEl.appendChild(numpadPanel);
    inner.appendChild(bodyEl);

    /* ── Status ─────────────────────────────────── */
    var statusEl = _el('p', 'cp-rush-status');
    statusEl.setAttribute('aria-live', 'polite');
    inner.appendChild(statusEl);

    area.appendChild(wrap);

    /* ── Load first question immediately ────────── */
    loadQuestion(0);
    if (typeof anime !== 'undefined') {
      anime.set(inner, { opacity: 0, translateY: 18 });
      anime({ targets: inner, opacity: 1, translateY: 0, duration: 420, easing: 'easeOutBack' });
    }

    /* ── Helpers ────────────────────────────────── */
    function showRushStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className = 'cp-rush-status' + (type ? ' cp-rush-status--' + type : '');
      if (typeof anime !== 'undefined') {
        anime.remove(statusEl);
        anime.set(statusEl, { opacity: 0, translateY: 4 });
        anime({ targets: statusEl, opacity: 1, translateY: 0, duration: 250, easing: 'easeOutQuad' });
      }
    }

    function shakeRush(el) {
      if (typeof anime !== 'undefined') {
        anime.remove(el);
        anime({ targets: el, translateX: [0,-8,8,-6,6,-3,3,0], duration: 420, easing: 'easeInOutSine' });
      }
    }

    function updateStreakDisplay() {
      if (streak >= 2) {
        if (streakEl.style.display === 'none') {
          streakEl.style.display = 'inline';
          if (typeof anime !== 'undefined') {
            anime.set(streakEl, { opacity: 0, scale: 0 });
            anime({ targets: streakEl, opacity: 1, scale: 1, duration: 350, easing: 'easeOutBack' });
          }
        }
        var scale = streak >= 5 ? 1.5 : streak >= 3 ? 1.25 : 1.0;
        if (typeof anime !== 'undefined') {
          anime.remove(streakEl);
          anime({ targets: streakEl, scale: scale, duration: 300, easing: 'easeOutBack' });
        } else {
          streakEl.style.transform = 'scale(' + scale + ')';
        }
      } else {
        if (typeof anime !== 'undefined') {
          anime({ targets: streakEl, opacity: 0, scale: 0, duration: 250, easing: 'easeInQuad',
            complete: function () { streakEl.style.display = 'none'; }
          });
        } else {
          streakEl.style.display = 'none';
        }
      }
    }

    /* ── Load question ──────────────────────────── */
    function loadQuestion(idx) {
      rushQ    = idx;
      inputVal = '';
      ansInput.value = '';
      ansInput.className = 'cp-rush-input';
      statusEl.textContent = '';
      statusEl.className = 'cp-rush-status';
      answering = false;

      qChip.textContent   = 'Q ' + (idx + 1) + ' / 5';
      scoreEl.textContent = 'Score: ' + rushScore + ' / 5';
      qText.textContent   = page.questions[idx].text;
    }

    /* ── Auto-check on every numpad press ──────── */
    function autoCheckRush() {
      if (answering || rushQ < 0) return;
      var q      = page.questions[rushQ];
      var parsed = parseInt(inputVal.replace(/[^0-9]/g, ''), 10);

      if (parsed === q.answer) {
        answering = true;
        rushScore++;
        streak++;
        if (typeof playCorrect === 'function') playCorrect();

        qCard.classList.add('cp-rush-q-card--correct');
        ansInput.classList.add('cp-rush-input--correct');
        scoreEl.textContent = 'Score: ' + rushScore + ' / 5';
        showRushStatus('Mission Accomplished!', 'ok');
        updateStreakDisplay();

        if (typeof anime !== 'undefined') {
          anime.remove(ansInput);
          anime({ targets: ansInput, scale: [1, 1.06, 1], duration: 350, easing: 'easeOutBack' });
        }

        setTimeout(function () {
          if (_currentPageId !== page.id) return;
          qCard.classList.remove('cp-rush-q-card--correct');

          if (rushQ >= 4) {
            if (advanced) return;
            advanced = true;
            if (typeof playSweep === 'function') playSweep();
            renderPage(page.next);
            return;
          }

          var nextIdx = rushQ + 1;
          if (typeof anime !== 'undefined') {
            anime({
              targets: qCard,
              translateX: '-110%', opacity: 0,
              duration: 350, easing: 'easeInQuad',
              complete: function () {
                loadQuestion(nextIdx);
                anime.set(qCard, { translateX: '110%', opacity: 0 });
                anime({ targets: qCard, translateX: '0%', opacity: 1, duration: 380, easing: 'easeOutBack' });
              }
            });
          } else {
            loadQuestion(nextIdx);
          }
        }, 1000);

      } else if (inputVal.length >= String(q.answer).length) {
        streak = 0;
        if (typeof playWrong === 'function') playWrong();
        qCard.classList.add('cp-rush-q-card--wrong');
        ansInput.classList.add('cp-rush-input--error');
        shakeRush(ansInput);
        showRushStatus(q.hint, 'err');
        updateStreakDisplay();
        setTimeout(function () {
          if (_currentPageId !== page.id) return;
          qCard.classList.remove('cp-rush-q-card--wrong');
          ansInput.classList.remove('cp-rush-input--error');
          ansInput.value = '';
          inputVal = '';
        }, 420);
      }
    }
  }

  /* ══════════════════════════════════════════════════════
     PAGE 6.5 — Operation Master
  ══════════════════════════════════════════════════════ */
  function _renderOperationMaster(page, area) {
    var wrap = _el('div', 'cp-om-wrap');
    wrap.dataset.pageId = page.id;

    /* ── Hero ───────────────────────────────────── */
    var hero = _el('div', 'cp-om-hero');

    var starEl = _el('div', 'cp-om-star');
    starEl.textContent = '★';
    hero.appendChild(starEl);

    var titleEl = _el('h1', 'cp-om-title');
    titleEl.textContent = page.title;
    hero.appendChild(titleEl);

    var subtitleEl = _el('p', 'cp-om-subtitle');
    subtitleEl.textContent = page.subtitle;
    hero.appendChild(subtitleEl);

    wrap.appendChild(hero);

    /* ── Badge grid ─────────────────────────────── */
    var badgeGrid = _el('div', 'cp-om-badge-grid');
    (page.badges || []).forEach(function (badgeData) {
      var badge = _el('div', 'cp-om-badge');
      badge.setAttribute('tabindex', '0');
      badge.setAttribute('role', 'button');
      badge.setAttribute('aria-label', badgeData.label);

      var iconEl = _el('div', 'cp-om-badge-icon');
      iconEl.textContent = badgeData.icon;
      badge.appendChild(iconEl);

      var labelEl = _el('div', 'cp-om-badge-label');
      labelEl.textContent = badgeData.label;
      badge.appendChild(labelEl);

      badge.addEventListener('click', function () {
        if (typeof playCorrect === 'function') playCorrect();
        if (typeof anime !== 'undefined') {
          anime.remove(badge);
          anime({ targets: badge, scale: [1, 1.08, 1], duration: 380, easing: 'easeOutBack' });
        }
      });
      badge.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); badge.click(); }
      });
      badgeGrid.appendChild(badge);
    });
    wrap.appendChild(badgeGrid);

    /* ── Count ──────────────────────────────────── */
    var countEl = _el('p', 'cp-om-count');
    countEl.textContent = '🏆 5 / 5 mastered';
    wrap.appendChild(countEl);

    /* ── Play Again ─────────────────────────────── */
    var playBtn = _el('button', 'cp-om-play-btn');
    playBtn.type = 'button';
    playBtn.textContent = 'Play Again';
    playBtn.addEventListener('click', function () {
      if (typeof anime !== 'undefined') {
        anime({ targets: wrap, opacity: 0, duration: 300, easing: 'easeInQuad',
          complete: function () { location.reload(); }
        });
      } else {
        location.reload();
      }
    });
    wrap.appendChild(playBtn);

    area.appendChild(wrap);
  }

  return {
    renderPage: renderPage,
    getCurrentPageId: function () { return _currentPageId; }
  };

}());
