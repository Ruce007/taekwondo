// School finder on /schools/. Filters the list of schools as the visitor types.
// Understands a city, state or province, country, ZIP / postal code, or part of a school name.
(function () {
  'use strict';
  var input = document.getElementById('finder-q');
  var status = document.getElementById('finder-status');
  var list = document.getElementById('finder-results');
  var browse = document.getElementById('finder-browse');
  if (!input || !status || !list) return;

  var schools = null;
  var LIMIT = 40;

  function norm(s) {
    return String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function prep(items) {
    items.forEach(function (s) {
      s._hay = norm([s.n, s.t, s.rn, s.r, s.cn, s.c].join(' '));
      s._place = norm([s.t, s.rn, s.r, s.cn].join(' '));
      s._zip = norm(s.z).replace(/ /g, '');
    });
    return items;
  }

  function search(q) {
    var query = norm(q);
    var digits = query.replace(/ /g, '');
    var out = { hits: [], note: '' };
    if (!query) return out;
    // ZIP or postal code: exact or prefix match, then the same first three digits as "nearby".
    if (/^\d{3,5}$/.test(digits)) {
      out.hits = schools.filter(function (s) { return s._zip.indexOf(digits) === 0; });
      if (!out.hits.length && digits.length >= 4) {
        var area = digits.slice(0, 3);
        out.hits = schools.filter(function (s) { return s._zip.indexOf(area) === 0; });
        if (out.hits.length) out.note = 'No schools are listed in ' + q.trim() + '. These are in nearby ZIP codes (' + area + 'xx).';
      }
      return out;
    }
    var terms = query.split(' ');
    var scored = [];
    schools.forEach(function (s) {
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i];
        if (s._hay.indexOf(t) === -1) return;
        if (norm(s.t) === t || norm(s.rn) === t || norm(s.r) === t) score += 6;
        else if (s._place.indexOf(t) > -1) score += 3;
        else if (norm(s.n).indexOf(t) === 0) score += 4;
        else score += 1;
      }
      scored.push({ s: s, score: score });
    });
    scored.sort(function (a, b) { return b.score - a.score || a.s.n.localeCompare(b.s.n); });
    out.hits = scored.map(function (x) { return x.s; });
    return out;
  }

  function render(q) {
    list.textContent = '';
    if (!norm(q)) {
      status.textContent = '';
      if (browse) browse.hidden = false;
      return;
    }
    if (browse) browse.hidden = true;
    var r = search(q);
    var n = r.hits.length;
    if (!n) {
      status.textContent = 'No schools match “' + q.trim() + '” yet. Try a city, state or ZIP code, or clear the search to browse by place.';
      return;
    }
    status.textContent = (r.note ? r.note + ' ' : '') + n + (n === 1 ? ' school' : ' schools') + (n > LIMIT ? ' (showing the first ' + LIMIT + ')' : '');
    r.hits.slice(0, LIMIT).forEach(function (s) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.className = 'card-link';
      a.href = s.u;
      a.textContent = s.n;
      var sum = document.createElement('span');
      sum.className = 'card-summary';
      sum.textContent = (s.m || [s.t, s.rn].filter(Boolean).join(', ')) + (s.z ? ' \u00b7 ' + s.z : '');
      li.appendChild(a);
      li.appendChild(sum);
      list.appendChild(li);
    });
  }

  function run() {
    var q = input.value;
    try {
      var u = new URL(window.location.href);
      if (q.trim()) u.searchParams.set('q', q.trim()); else u.searchParams.delete('q');
      window.history.replaceState(null, '', u.toString());
    } catch (e) {}
    render(q);
  }

  var timer = null;
  input.addEventListener('input', function () {
    if (!schools) return;
    clearTimeout(timer);
    timer = setTimeout(run, 80);
  });
  input.form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (schools) run();
  });

  fetch('/schools-index.json')
    .then(function (r) { return r.json(); })
    .then(function (items) {
      schools = prep(items);
      var q = new URLSearchParams(window.location.search).get('q') || '';
      if (q) input.value = q;
      render(input.value);
    })
    .catch(function () {
      status.textContent = 'The finder could not load. Browse by place below.';
    });
})();
