/* App orchestrator — rendering, event handling, screen transitions */

var _htpShownOnce = false;
var _htpIsIntro   = false;
var _feedbackTimeout = null;

/* ── Init ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  I18n.load(function(lang) {
    document.documentElement.lang = lang;
    applyStaticTranslations();
    attachPersistentListeners();
    transitionToScreen('loading');
  });
});

/* ── Apply translations to all static DOM elements ─── */
function applyStaticTranslations() {
  /* Generic data-i18n* bindings (textContent / html / title / aria-label / alt) */
  _applyI18nAttributes(document);

  /* Document title */
  document.title = I18n.t('pageTitle');

  /* CSS-generated "Tap to Begin" label (loader pseudo-element reads this var) */
  if (document.documentElement && document.documentElement.style) {
    document.documentElement.style.setProperty('--i18n-tap-to-begin', JSON.stringify(I18n.t('tapToBegin')));
  }

  /* Language modal */
  _setText('#lang-title',    I18n.t('langPopupTitle'));
  _setText('#lang-subtitle', I18n.t('langPopupSubtitle'));
  _setText('#btn-lang-cancel', I18n.t('cancelButton'));
  _setText('#btn-lang-apply',  I18n.t('applyButton'));
  _setText('#lang-confirm-title', I18n.t('langSelectedTitle'));

  /* Header icon-button tooltips */
  _setTooltip('#btn-reset', I18n.t('resetTitle'));
  _setTooltip('#btn-info',  I18n.t('helpTitle'));
  _setTooltip('#btn-globe', I18n.t('languageTitle'));
  var fsBtn = qs('#btn-fullscreen');
  if (fsBtn) {
    var fsKey = document.fullscreenElement ? 'btnFullscreenExit' : 'btnFullscreenEnter';
    fsBtn.title = I18n.t(fsKey);
    fsBtn.setAttribute('aria-label', I18n.t(fsKey));
  }
}

/* Translate any element carrying a data-i18n* attribute within `root`.
   data-i18n → textContent, data-i18n-html → innerHTML,
   data-i18n-title → title, data-i18n-aria → aria-label, data-i18n-alt → alt. */
function _applyI18nAttributes(root) {
  if (!root || !root.querySelectorAll) return;
  var attrMap = [
    ['data-i18n',       function(el, txt) { el.textContent = txt; }],
    ['data-i18n-html',  function(el, txt) { el.innerHTML = txt; }],
    ['data-i18n-title', function(el, txt) { el.title = txt; }],
    ['data-i18n-aria',  function(el, txt) { el.setAttribute('aria-label', txt); }],
    ['data-i18n-alt',   function(el, txt) { el.setAttribute('alt', txt); }]
  ];
  attrMap.forEach(function(pair) {
    var attr = pair[0], apply = pair[1];
    var nodes = root.querySelectorAll('[' + attr + ']');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute(attr);
      if (key) apply(nodes[i], I18n.t(key));
    }
  });
}

function _setText(sel, text) {
  var el = qs(sel);
  if (el && typeof text === 'string') el.textContent = text;
}

function _setHTML(sel, html) {
  var el = qs(sel);
  if (el && typeof html === 'string') el.innerHTML = html;
}

function _setTooltip(sel, text) {
  var el = qs(sel);
  if (el && typeof text === 'string') {
    el.title = text;
    el.setAttribute('aria-label', text);
  }
}

/* ── Persistent listeners (header — attached once) ── */
function attachPersistentListeners() {
  var btnReset      = qs('#btn-reset');
  var btnFullscreen = qs('#btn-fullscreen');
  var btnInfo       = qs('#btn-info');
  var btnGlobe      = qs('#btn-globe');
  var modalClose    = qs('#modal-close');
  var htpOverlay    = qs('#htp-modal');
  var langClose     = qs('#lang-close');
  var langOverlay   = qs('#lang-modal');

  if (btnReset)      btnReset.addEventListener('click', handleReset);
  if (btnFullscreen) btnFullscreen.addEventListener('click', handleFullscreen);
  if (btnInfo)       btnInfo.addEventListener('click', openHowToPlay);
  if (btnGlobe)      btnGlobe.addEventListener('click', openLangModal);
  if (modalClose)    modalClose.addEventListener('click', closeHowToPlay);
  if (htpOverlay)    htpOverlay.addEventListener('click', function(e) {
    if (e.target === htpOverlay) closeHowToPlay();
  });
  if (langClose)     langClose.addEventListener('click', closeLangModal);
  if (langOverlay)   langOverlay.addEventListener('click', function(e) {
    if (e.target === langOverlay) closeLangModal();
  });

  document.addEventListener('fullscreenchange', function() {
    var btn = qs('#btn-fullscreen');
    if (!btn) return;
    var img = btn.querySelector('img');
    var isFs = !!document.fullscreenElement;
    if (img) img.src = isFs ? 'assets/icons/Exit_Fullscreen_icon.svg' : 'assets/icons/Fullscreen_icon.svg';
    var fsKey = isFs ? 'btnFullscreenExit' : 'btnFullscreenEnter';
    btn.title = I18n.t(fsKey);
    btn.setAttribute('aria-label', I18n.t(fsKey));
  });
}

/* ── Screen transition ─────────────────────────────── */
function transitionToScreen(screenName) {
  if (GameState.isAnimating) return;
  GameState.isAnimating = true;
  hideFeedback();

  var content = qs('#content-area');
  var out = animateScreenOut(content);
  var outDone = out && out.finished ? out.finished : Promise.resolve();

  outDone.then(function() {
    GameState.currentScreen = screenName;
    renderScreen(screenName);

    if (content) {
      content.style.opacity = '0';
      content.style.transform = 'translateY(18px)';
    }
    var inAnim = animateScreenIn(content);
    var inDone = inAnim && inAnim.finished ? inAnim.finished : Promise.resolve();
    inDone.then(function() {
      GameState.isAnimating = false;
      if (screenName === 'loading') {
        var loaderOv = qs('#loader-overlay');
        if (loaderOv) loaderOv.classList.remove('loader--hidden');
        scheduleAutoAdvanceFromLoading();
      }
    });
  });
}

/* ── Screen dispatcher ─────────────────────────────── */
function renderScreen(screenName) {
  var content = qs('#content-area');
  if (!content) return;

  if (screenName === 'loading') content.innerHTML = buildLoadingHTML();
}

/* ── HTML builders ─────────────────────────────────── */
function buildLoadingHTML() {
  return '<div class="loading-screen"></div>';
}

/* ── Event handlers ────────────────────────────────── */
function handleReset() {
  if (window.CONTENT_MODE && typeof ContentRenderer !== 'undefined') {
    var pageId = ContentRenderer.getCurrentPageId();
    if (pageId) ContentRenderer.renderPage(pageId);
  }
}

function handleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen && document.exitFullscreen();
  }
}

/* ── Feedback ──────────────────────────────────────── */
function hideFeedback() {
  if (_feedbackTimeout) { clearTimeout(_feedbackTimeout); _feedbackTimeout = null; }
  var overlay = qs('#feedback-overlay');
  if (overlay) overlay.hidden = true;
}

/* ── Confetti (used by content-renderer.js) ────────── */
function launchConfetti() {
  var existing = document.querySelector('.celebration');
  if (existing) existing.remove();

  if (typeof window.matchMedia === 'function' && window.matchMedia('(orientation: portrait)').matches) {
    return;
  }

  var el = document.createElement('div');
  el.className = 'celebration';

  var total    = 150;
  var topCount = Math.floor(total * 0.35);

  for (var i = 0; i < total; i++) {
    var piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left            = (Math.random() * 100) + 'vw';
    piece.style.backgroundColor = 'hsl(' + Math.floor(Math.random() * 360) + ', 100%, 50%)';
    piece.style.width           = (6 + Math.random() * 8) + 'px';
    piece.style.height          = (6 + Math.random() * 8) + 'px';

    if (i < topCount) {
      piece.style.top                     = (Math.random() * 8) + '%';
      piece.style.animationName           = 'confetti-stay';
      piece.style.animationDuration       = (4 + Math.random() * 3) + 's';
      piece.style.animationDelay          = (Math.random() * 2) + 's';
      piece.style.animationTimingFunction = 'ease-out';
      piece.style.animationFillMode       = 'forwards';
    } else {
      piece.style.animationDelay    = (Math.random() * 2) + 's';
      piece.style.animationDuration = (2 + Math.random() * 2) + 's';
    }
    el.appendChild(piece);
  }

  document.body.appendChild(el);
  setTimeout(function() { if (el.parentNode) el.remove(); }, 8000);
}

/* ── Loading auto-advance ──────────────────────────── */
function scheduleAutoAdvanceFromLoading() {
  setTimeout(function() {
    if (window.CONTENT_MODE) {
      var overlay = qs('#loader-overlay');
      if (overlay) overlay.classList.add('loader--hidden');
      document.body.classList.add('content-page-active');
      _htpIsIntro = true;
      openHowToPlay();
    }
  }, 2200);
}

/* ── Helpers ───────────────────────────────────────── */
function escapeText(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ── How to Play modal ── */
function openHowToPlay() {
  var modal = qs('#htp-modal');
  if (!modal) return;

  if (typeof GAME_HTP !== 'undefined') {
    var subtitleEl = qs('#htp-subtitle');
    var stepsEl    = qs('#htp-steps');
    if (subtitleEl && GAME_HTP.subtitle) subtitleEl.textContent = I18n.t(GAME_HTP.subtitle);
    if (stepsEl && Array.isArray(GAME_HTP.steps)) {
      stepsEl.innerHTML = '';
      GAME_HTP.steps.forEach(function(stepKey, i) {
        var step = I18n.t(stepKey);
        var li   = document.createElement('li');
        li.className = 'modal-step';

        var num  = document.createElement('span');
        num.className = 'modal-step__num';
        num.setAttribute('aria-hidden', 'true');
        num.textContent = i + 1;

        var text = document.createElement('span');
        text.className = 'modal-step__text';
        text.innerHTML = step;

        li.appendChild(num);
        li.appendChild(text);
        stepsEl.appendChild(li);
      });
    }
  }

  modal.classList.add('modal--open');
  modal.setAttribute('aria-hidden', 'false');
  document.addEventListener('keydown', handleModalKeydown);
  var closeBtn = qs('#modal-close');
  if (closeBtn) setTimeout(function() { closeBtn.focus(); }, 50);
}

function closeHowToPlay() {
  var modal = qs('#htp-modal');
  if (!modal) return;
  modal.classList.remove('modal--open');
  modal.setAttribute('aria-hidden', 'true');
  document.removeEventListener('keydown', handleModalKeydown);

  if (_htpIsIntro) {
    _htpIsIntro = false;
    if (typeof ContentRenderer !== 'undefined') ContentRenderer.renderPage('1.0');
    return;
  }

  var btnInfo = qs('#btn-info');
  if (btnInfo) btnInfo.focus();
}

function handleModalKeydown(e) {
  if (e.key === 'Escape') closeHowToPlay();
}

/* ── Language modal ── */
function openLangModal() {
  var modal = qs('#lang-modal');
  if (!modal) return;
  _showLangSelectView();
  modal.classList.add('modal--open');
  modal.setAttribute('aria-hidden', 'false');
  document.addEventListener('keydown', handleLangKeydown);
  var trigger = qs('#lang-trigger');
  if (trigger) setTimeout(function() { trigger.focus(); }, 50);
}

function closeLangModal() {
  var modal = qs('#lang-modal');
  if (!modal) return;
  var list = qs('#lang-list');
  if (list) list.hidden = true;
  var trigger = qs('#lang-trigger');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
  modal.classList.remove('modal--open');
  modal.setAttribute('aria-hidden', 'true');
  document.removeEventListener('keydown', handleLangKeydown);
  var btnGlobe = qs('#btn-globe');
  if (btnGlobe) btnGlobe.focus();
}

function _showLangSelectView() {
  var selectView  = qs('#lang-select-view');
  var confirmView = qs('#lang-confirm-view');
  if (selectView)  selectView.hidden  = false;
  if (confirmView) confirmView.hidden = true;

  var trigger     = qs('#lang-trigger');
  var list        = qs('#lang-list');
  var currentText = qs('#lang-current-text');
  var cancelBtn   = qs('#btn-lang-cancel');
  var applyBtn    = qs('#btn-lang-apply');

  /* Populate dropdown from I18n supported languages (all 5, native names) */
  var supported = I18n.getSupportedLanguages();
  if (list) {
    list.innerHTML = '';
    var activeLang = I18n.getLang();
    Object.keys(supported).forEach(function(code) {
      var nativeName = supported[code];
      var li = document.createElement('li');
      li.className = 'lang-option' + (code === activeLang ? ' lang-option--selected' : '');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', code === activeLang ? 'true' : 'false');
      li.setAttribute('data-lang', code);
      li.setAttribute('data-label', nativeName);
      li.textContent = nativeName;
      list.appendChild(li);
    });
  }

  var _pendingLang      = I18n.getLang();
  var _pendingLabel     = supported[_pendingLang] || _pendingLang;
  var _originalLang     = _pendingLang;

  if (currentText) currentText.textContent = _pendingLabel;
  if (!trigger || !list) return;

  list.hidden = true;
  trigger.setAttribute('aria-expanded', 'false');

  function _syncApplyBtn() {
    if (!applyBtn) return;
    var changed = _pendingLang !== _originalLang;
    applyBtn.disabled = !changed;
    applyBtn.setAttribute('aria-disabled', changed ? 'false' : 'true');
  }
  _syncApplyBtn();

  trigger.onclick = function() {
    var open = list.hidden;
    if (open) {
      var rect       = trigger.getBoundingClientRect();
      var spaceBelow = window.innerHeight - rect.bottom - 12;
      var spaceAbove = rect.top - 12;
      var maxH       = 210;
      if (spaceBelow < maxH && spaceAbove > spaceBelow) {
        list.classList.add('lang-list--upward');
        list.style.maxHeight = Math.min(maxH, spaceAbove) + 'px';
      } else {
        list.classList.remove('lang-list--upward');
        list.style.maxHeight = Math.min(maxH, spaceBelow) + 'px';
      }
    }
    list.hidden = !open;
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  list.onclick = function(e) {
    var opt = e.target.closest('.lang-option');
    if (!opt) return;
    _pendingLang  = opt.getAttribute('data-lang');
    _pendingLabel = opt.getAttribute('data-label');
    if (currentText) currentText.textContent = _pendingLabel;
    qsa('.lang-option', list).forEach(function(o) {
      o.classList.remove('lang-option--selected');
      o.setAttribute('aria-selected', 'false');
    });
    opt.classList.add('lang-option--selected');
    opt.setAttribute('aria-selected', 'true');
    list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    _syncApplyBtn();
  };

  if (cancelBtn) cancelBtn.onclick = function() {
    closeLangModal();
  };

  if (applyBtn) applyBtn.onclick = function() {
    _applyLanguage(_pendingLang, _pendingLabel);
  };
}

function _applyLanguage(langCode, langLabel) {
  I18n.setLang(langCode);

  var selectView  = qs('#lang-select-view');
  var confirmView = qs('#lang-confirm-view');
  var confirmTitle = qs('#lang-confirm-title');

  if (confirmTitle) confirmTitle.textContent = I18n.t('langSelectedTitle');

  var msgEl = qs('#lang-confirm-msg');
  if (msgEl) {
    var msgTemplate = I18n.t('langSelectedMessageStart');
    var parts = msgTemplate.split('{language}');
    var before = parts[0] || '';
    var after  = parts.length > 1 ? parts[1] : '';
    msgEl.innerHTML =
      escapeText(before) +
      '<strong class="lang-highlight">' + escapeText(langLabel) + '</strong>' +
      escapeText(after) +
      '<br><span>' + escapeText(I18n.t('langSelectedMessageEnd')) + '</span>';
  }

  if (selectView)   selectView.hidden  = true;
  if (confirmView)  confirmView.hidden = false;

  setTimeout(function() {
    closeLangModal();
    GameState.selectedAnswer = null;
    GameState.isSubmitted    = false;
    applyStaticTranslations();
    if (window.CONTENT_MODE && typeof ContentRenderer !== 'undefined') {
      var _pid = ContentRenderer.getCurrentPageId();
      if (_pid) ContentRenderer.renderPage(_pid);
    } else {
      renderScreen(GameState.currentScreen);
    }
  }, 1800);
}

function handleLangKeydown(e) {
  if (e.key === 'Escape') closeLangModal();
}
