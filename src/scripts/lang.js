// Language choice. Never redirects a first-time visitor (links stay shareable and search engines see every
// version). Instead, when the browser prefers a language this page exists in, a slim bar offers it in that
// language. Choosing a language, from the bar or the menu, is remembered and applied on later pages.
(function () {
  var KEY = 'tkd-lang';
  var DISMISS = 'tkd-lang-offer-dismissed';
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var links = {};
  var all = document.querySelectorAll('a[data-lang]');
  for (var i = 0; i < all.length; i++) {
    var a = all[i];
    a.addEventListener('click', function (e) { set(KEY, e.currentTarget.getAttribute('data-lang')); });
    if (a.hasAttribute('data-exact') && !links[a.getAttribute('data-lang')]) links[a.getAttribute('data-lang')] = a;
  }
  var current = document.documentElement.lang;
  if (current !== 'en') return; // offers and automatic switching start from the English page

  var stored = get(KEY);
  if (stored && stored !== 'en' && links[stored]) { location.replace(links[stored].href); return; }
  if (stored || get(DISMISS)) return;

  // Browser language codes -> our codes (Traditional Chinese for Taiwan, Hong Kong, Macau and "Hant").
  function map(tag) {
    var t = String(tag).toLowerCase();
    if (t.indexOf('zh') === 0) return /hant|-tw|-hk|-mo/.test(t) ? 'zh-Hant' : 'zh-Hans';
    return t.split('-')[0];
  }
  var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
  var pick = null;
  for (var p = 0; p < prefs.length && !pick; p++) {
    var code = map(prefs[p]);
    if (code === 'en') break;
    if (links[code]) pick = links[code];
  }
  if (!pick) return;

  var bar = document.createElement('div');
  bar.className = 'lang-offer';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', pick.getAttribute('data-offer'));
  var flag = pick.querySelector('svg');
  var go = document.createElement('a');
  go.href = pick.href;
  go.lang = pick.getAttribute('data-lang');
  go.hreflang = go.lang;
  go.setAttribute('data-lang', go.lang);
  if (flag) go.appendChild(flag.cloneNode(true));
  var label = document.createElement('span');
  label.textContent = pick.getAttribute('data-offer');
  go.appendChild(label);
  go.addEventListener('click', function () { set(KEY, go.lang); });
  var close = document.createElement('button');
  close.type = 'button';
  close.className = 'lang-offer-close';
  close.setAttribute('aria-label', pick.getAttribute('data-hide'));
  close.textContent = '×';
  close.addEventListener('click', function () { set(DISMISS, '1'); bar.remove(); });
  var inner = document.createElement('div');
  inner.className = 'wrap lang-offer-row';
  inner.appendChild(go);
  inner.appendChild(close);
  bar.appendChild(inner);
  var main = document.getElementById('main');
  if (main) main.parentNode.insertBefore(bar, main);
})();
