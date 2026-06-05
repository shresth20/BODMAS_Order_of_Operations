/* content-observer.js — Persistent developer nav bar for jumping between pages.
   Depends on: CONTENT_PAGES, ContentRenderer */

var ContentObserver = (function () {

  var _container = null;
  var _initialized = false;

  function init() {
    if (_initialized) return;
    _initialized = true;

    _container = document.createElement('nav');
    _container.className = 'content-observer';
    _container.setAttribute('aria-label', 'Content page navigator');
    _container.setAttribute('role', 'navigation');

    var desc = document.createElement('p');
    desc.className = 'content-observer__desc';
    desc.textContent =
      'Static PPT content flow: main pages use 1.0, 2.0, 3.0… ' +
      'and layer reveals use subpages such as 2.1, 2.2, 2.3, 2.4.';
    _container.appendChild(desc);

    var nav = document.createElement('div');
    nav.className = 'content-observer__nav';
    nav.id = 'observer-nav';
    _container.appendChild(nav);

    /* Insert between header and board-container */
    var header = document.getElementById('header');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(_container, header.nextSibling);
    } else {
      document.body.insertBefore(_container, document.body.firstChild);
    }

    _build();
    document.body.classList.add('has-observer');
    _syncHeight();
    window.addEventListener('resize', _syncHeight);
  }

  function _build() {
    var nav = document.getElementById('observer-nav');
    if (!nav) return;
    nav.innerHTML = '';

    CONTENT_PAGES.forEach(function (page) {
      var btn = document.createElement('button');
      btn.className = 'content-observer__btn' +
        (page.id.indexOf('.0', page.id.length - 2) !== -1 ? ' is-main' : '');
      btn.textContent = page.id;
      btn.dataset.pageId = page.id;
      btn.title = page.badge || page.title || page.id;
      btn.addEventListener('click', function () {
        ContentRenderer.renderPage(page.id);
      });
      nav.appendChild(btn);
    });
  }

  function setActive(pageId) {
    var btns = document.querySelectorAll('.content-observer__btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('is-active', btns[i].dataset.pageId === pageId);
    }
  }

  /* Keep --observer-h in sync so board-container top adjusts correctly */
  function _syncHeight() {
    if (!_container) return;
    document.documentElement.style.setProperty(
      '--observer-h', _container.offsetHeight + 'px'
    );
  }

  return { init: init, setActive: setActive };

}());
