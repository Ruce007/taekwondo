// Contents column: highlights the section being read, opens its subsections, and lets the
// visitor hide the column (remembered on this device). Without JavaScript the column still
// works as a plain list of links.
(function () {
  var entry = document.querySelector('.entry.has-toc');
  if (!entry) return;
  var KEY = 'tkd-toc';
  var side = entry.querySelector('.toc--side');
  var hideBtn = entry.querySelector('.toc-hide');
  var showBtn = entry.querySelector('.toc-show');

  function setHidden(hidden, save) {
    entry.classList.toggle('toc-hidden', hidden);
    if (showBtn) showBtn.hidden = !hidden;
    if (hideBtn) hideBtn.setAttribute('aria-expanded', hidden ? 'false' : 'true');
    if (save) { try { if (hidden) localStorage.setItem(KEY, 'hidden'); else localStorage.removeItem(KEY); } catch (e) {} }
  }
  var saved = false;
  try { saved = localStorage.getItem(KEY) === 'hidden'; } catch (e) {}
  setHidden(saved, false);
  if (hideBtn) hideBtn.addEventListener('click', function () { setHidden(true, true); });
  if (showBtn) showBtn.addEventListener('click', function () { setHidden(false, true); });

  // Scroll tracking
  if (!side) return;
  var links = side.querySelectorAll('a[href^="#"]');
  var pairs = [];
  for (var i = 0; i < links.length; i++) {
    var id = links[i].getAttribute('href').slice(1);
    var target = id && id !== 'top' ? document.getElementById(id) : null;
    if (target) pairs.push({ el: target, li: links[i].parentNode });
  }
  if (!pairs.length) return;
  var current = null;
  function update() {
    var line = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 120;
    var found = null;
    for (var k = 0; k < pairs.length; k++) {
      if (pairs[k].el.getBoundingClientRect().top <= line + 4) found = pairs[k]; else break;
    }
    if (found === current) return;
    var all = side.querySelectorAll('li.is-current');
    for (var j = 0; j < all.length; j++) all[j].classList.remove('is-current');
    current = found;
    if (current) {
      current.li.classList.add('is-current');
      var parent = current.li.parentNode && current.li.parentNode.parentNode;
      if (parent && parent.tagName === 'LI') parent.classList.add('is-current');
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }, { passive: true });
  update();
})();
