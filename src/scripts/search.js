// Client-side search for /search/. Loads the small search-index.json and filters it in the browser.
(function () {
  'use strict';
  var params = new URLSearchParams(window.location.search);
  var q = (params.get('q') || '').trim();
  var input = document.getElementById('search-q');
  var status = document.getElementById('search-status');
  var list = document.getElementById('search-results');
  if (!status || !list) return;
  if (input) input.value = q;
  if (!q) {
    status.textContent = 'Type a name, place or topic to search.';
    return;
  }
  var terms = q.toLowerCase().split(/\s+/).filter(Boolean);

  fetch('/search-index.json')
    .then(function (r) {
      return r.json();
    })
    .then(function (items) {
      var hits = [];
      items.forEach(function (it) {
        var title = it.t.toLowerCase();
        var aliases = it.a.map(function (a) {
          return a.toLowerCase();
        });
        var hay = (title + ' ' + aliases.join(' ') + ' ' + it.s.toLowerCase());
        var score = 0;
        for (var i = 0; i < terms.length; i++) {
          var t = terms[i];
          if (hay.indexOf(t) === -1) return;
          if (title === t) score += 10;
          else if (title.indexOf(t) === 0) score += 6;
          else if (title.indexOf(t) > -1) score += 4;
          else if (aliases.join(' ').indexOf(t) > -1) score += 3;
          else score += 1;
        }
        hits.push({ it: it, score: score });
      });
      hits.sort(function (a, b) {
        return b.score - a.score || a.it.t.localeCompare(b.it.t);
      });
      status.textContent = hits.length + (hits.length === 1 ? ' result' : ' results') + ' for “' + q + '”';
      hits.forEach(function (h) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.className = 'card-link';
        a.href = h.it.u;
        a.textContent = h.it.t;
        var kind = document.createElement('span');
        kind.className = 'meta';
        kind.textContent = h.it.k;
        var sum = document.createElement('span');
        sum.className = 'card-summary';
        sum.textContent = h.it.s;
        li.appendChild(a);
        li.appendChild(document.createTextNode(' '));
        li.appendChild(kind);
        li.appendChild(sum);
        list.appendChild(li);
      });
    })
    .catch(function () {
      status.textContent = 'Search is unavailable right now. Please browse the indexes instead.';
    });
})();
