(function () {
  var root = document.documentElement;
  var KEY = 'tkd-theme';
  function stored() {
    try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : 'system'; } catch (e) { return 'system'; }
  }
  function apply(choice) {
    if (choice === 'light' || choice === 'dark') root.setAttribute('data-theme', choice);
    else root.removeAttribute('data-theme');
  }
  function mark(choice) {
    var btns = document.querySelectorAll('[data-theme-choice]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-pressed', btns[i].getAttribute('data-theme-choice') === choice ? 'true' : 'false');
    }
  }
  apply(stored());
  root.classList.add('js');
  document.addEventListener('DOMContentLoaded', function () {
    mark(stored());
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.menu-toggle');
    function setMenu(open) {
      if (!header || !toggle) return;
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    if (toggle) {
      toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); toggle.focus(); } });
      var nav = document.getElementById('site-nav');
      if (nav) nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
      window.addEventListener('resize', function () { if (window.innerWidth >= 832) setMenu(false); });
    }
    var lang = document.querySelector('.lang-menu');
    if (lang) {
      document.addEventListener('click', function (e) { if (lang.open && !lang.contains(e.target)) lang.open = false; });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lang.open) { lang.open = false; lang.querySelector('summary').focus(); } });
    }
    var group = document.querySelector('.theme-switch');
    if (!group) return;
    group.addEventListener('click', function (e) {
      var b = e.target.closest('[data-theme-choice]');
      if (!b) return;
      var c = b.getAttribute('data-theme-choice');
      try { if (c === 'system') localStorage.removeItem(KEY); else localStorage.setItem(KEY, c); } catch (err) {}
      apply(c); mark(c);
    });
  });
})();
