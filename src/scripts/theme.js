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
  document.addEventListener('DOMContentLoaded', function () {
    mark(stored());
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
