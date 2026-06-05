/* i18n singleton - loads locales/core.json plus locales/content.json */
var I18n = (function() {
  var _data   = null;
  var _lang   = 'en';
  var _LS_KEY = 'game_lang';

  function _getUrlLang() {
    try {
      return new URLSearchParams(window.location.search).get('lang') || '';
    } catch(e) { return ''; }
  }

  function _setUrlLang(code) {
    try {
      var params = new URLSearchParams(window.location.search);
      params.set('lang', code);
      history.replaceState(null, '', window.location.pathname + '?' + params.toString());
    } catch(e) {}
  }

  function _isSupportedLang(code) {
    return !!(_data && code && _data[code]);
  }

  function _getStoredLang() {
    try { return localStorage.getItem(_LS_KEY) || ''; } catch(e) { return ''; }
  }

  function _setStoredLang(code) {
    try { localStorage.setItem(_LS_KEY, code); } catch(e) {}
  }

  function _resolveInitialLang(defaultLang) {
    var urlLang = _getUrlLang();
    if (_isSupportedLang(urlLang)) {
      _setStoredLang(urlLang);
      return urlLang;
    }

    var storedLang = _getStoredLang();
    if (_isSupportedLang(storedLang)) return storedLang;

    return _isSupportedLang(defaultLang) ? defaultLang : 'en';
  }

  function _emptyData() {
    return { defaultLanguage: 'en', supportedLanguages: {}, languageLabels: {} };
  }

  function _readJson(path, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) return;
      var ok = (xhr.status === 200 || xhr.status === 0);
      if (!ok) return callback(null);
      try {
        callback(JSON.parse(xhr.responseText));
      } catch(e) {
        callback(null);
      }
    };
    try { xhr.send(); } catch(e) {
      callback(null);
    }
  }

  function _mergeData(base, overlay) {
    var merged = _emptyData();
    [base, overlay].forEach(function(src) {
      if (!src) return;
      Object.keys(src).forEach(function(key) {
        var val = src[key];
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          if (!merged[key] || typeof merged[key] !== 'object' || Array.isArray(merged[key])) {
            merged[key] = {};
          }
          Object.keys(val).forEach(function(childKey) {
            merged[key][childKey] = val[childKey];
          });
        } else {
          merged[key] = val;
        }
      });
    });
    return merged;
  }

  function _finishLoad(data, callback) {
    _data = data || _emptyData();
    var resolved = _resolveInitialLang(_data.defaultLanguage);
    _lang = (_data[resolved]) ? resolved : (_data.defaultLanguage || 'en');
    _setUrlLang(_lang);
    callback(_lang);
  }

  function load(callback) {
    _readJson('locales/core.json', function(coreData) {
      _readJson('locales/content.json', function(contentData) {
        if (coreData || contentData) {
          _finishLoad(_mergeData(coreData, contentData), callback);
          return;
        }

        _readJson('locales.json', function(legacyData) {
          _finishLoad(legacyData || _emptyData(), callback);
        });
      });
    });
  }

  function setLang(code) {
    if (!_data || !_data[code]) return;
    _lang = code;
    document.documentElement.lang = code;
    _setStoredLang(code);
    _setUrlLang(code);
  }

  function getLang() { return _lang; }

  function t(key, replacements) {
    if (!_data) return key;
    var dict  = _data[_lang] || {};
    var enDict = _data['en'] || {};
    var val = (key in dict) ? dict[key] : ((key in enDict) ? enDict[key] : key);
    if (Array.isArray(val)) return val;
    if (typeof val !== 'string') return key;
    if (replacements) {
      Object.keys(replacements).forEach(function(k) {
        val = val.replace(new RegExp('\\{' + k + '\\}', 'g'), String(replacements[k]));
      });
    }
    return val;
  }

  function tRandom(key) {
    var val = t(key);
    if (Array.isArray(val) && val.length > 0) {
      return val[Math.floor(Math.random() * val.length)];
    }
    return typeof val === 'string' ? val : key;
  }

  function getSupportedLanguages() {
    return (_data && _data.supportedLanguages) ? _data.supportedLanguages : {};
  }

  return { load: load, setLang: setLang, getLang: getLang, t: t, tRandom: tRandom, getSupportedLanguages: getSupportedLanguages };
})();
