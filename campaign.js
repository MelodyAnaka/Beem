// Beem campaign page: filter buttons + full-screen viewer
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile'));
  var filtersBox = $('filters');
  var current = 'All', openIndex = 0, lastFocus = null;

  // Build the filter buttons from the product names found on the tiles
  var names = ['All'];
  tiles.forEach(function (t) {
    if (names.indexOf(t.dataset.p) === -1) names.push(t.dataset.p);
  });
  names.forEach(function (name) {
    var count = name === 'All' ? tiles.length :
      tiles.filter(function (t) { return t.dataset.p === name; }).length;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'f';
    b.dataset.name = name;
    b.setAttribute('aria-pressed', name === 'All' ? 'true' : 'false');
    b.innerHTML = name + ' <small>' + count + '</small>';
    b.addEventListener('click', function () { current = name; render(); });
    filtersBox.appendChild(b);
  });

  function render() {
    tiles.forEach(function (t) { t.hidden = !(current === 'All' || t.dataset.p === current); });
    Array.prototype.forEach.call(filtersBox.children, function (b) {
      b.setAttribute('aria-pressed', b.dataset.name === current ? 'true' : 'false');
    });
  }

  function visible() { return tiles.filter(function (t) { return !t.hidden; }); }

  function show(i) {
    var list = visible();
    if (!list.length) return;
    openIndex = (i + list.length) % list.length;
    var t = list[openIndex], img = t.querySelector('img');
    $('lbimg').src = img.currentSrc || img.src;
    $('lbimg').alt = img.alt;
    $('lbtag').textContent = t.querySelector('.tag').textContent;
    $('lbcap').textContent = t.querySelector('.cap').textContent;
  }

  function close() {
    $('lb').hidden = true;
    if (lastFocus) lastFocus.focus();
  }

  tiles.forEach(function (t) {
    t.addEventListener('click', function () {
      lastFocus = t;
      show(visible().indexOf(t));
      $('lb').hidden = false;
      $('lbx').focus();
    });
  });

  $('lbx').addEventListener('click', close);
  $('lbp').addEventListener('click', function () { show(openIndex - 1); });
  $('lbn').addEventListener('click', function () { show(openIndex + 1); });
  $('lb').addEventListener('click', function (e) { if (e.target === $('lb')) close(); });
  document.addEventListener('keydown', function (e) {
    if ($('lb').hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(openIndex - 1);
    if (e.key === 'ArrowRight') show(openIndex + 1);
  });
})();
