(function () {
  'use strict';

  var STORE = 'seedlings.tasks.v2';
  var THEME = 'seedlings.theme';
  var NS = 'http://www.w3.org/2000/svg';

  var STAGES = ['seed', 'sprout', 'bloom'];
  var NAMES = { quick: 'Marigold', steady: 'Poppy', deep: 'Foxglove' };
  var COLORS = { quick: 'var(--marigold)', steady: 'var(--poppy)', deep: 'var(--foxglove)' };
  var STEM_HEIGHT = { quick: 52, steady: 74, deep: 96 };
  var PETALS = { quick: 8, steady: 5, deep: 6 };
  var ACTIONS = ['Water it', 'Help it bloom', 'Back to seed'];

  var tasks = load();
  var filter = 'all';
  var lastGrown = null;

  var $ = function (id) { return document.getElementById(id); };
  var form = $('plant-form');
  var input = $('task-text');
  var dueInput = $('task-due');
  var formMsg = $('form-msg');
  var list = $('task-list');
  var empty = $('empty');
  var plants = $('plants');
  var summary = $('plot-summary');
  var meter = $('meter-fill');
  var themeBtn = $('theme-toggle');
  var themeLabel = $('theme-label');
  var filterBtns = document.querySelectorAll('[data-filter]');

  /* ---------- storage ---------- */

  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(STORE));
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(tasks)); } catch (e) { /* storage unavailable */ }
  }

  /* ---------- SVG plants ---------- */

  function svg(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  // One plant, drawn in a 60 x 120 box with the ground at y = 118.
  function drawPlant(stage, energy) {
    var s = svg('svg', { viewBox: '0 0 60 120', focusable: 'false', 'aria-hidden': 'true' });
    var ink = 'var(--ink)';
    var cx = 30, ground = 116;

    svg('ellipse', { cx: cx, cy: ground, rx: 15, ry: 4, fill: 'var(--soil)', stroke: ink, 'stroke-width': 1.5 }, s);

    if (stage === 0) {
      svg('path', { d: 'M20 116 Q30 100 40 116 Z', fill: 'var(--soil-2)', stroke: ink, 'stroke-width': 1.5 }, s);
      svg('ellipse', { cx: cx, cy: 108, rx: 3, ry: 4.5, fill: COLORS[energy], stroke: ink, 'stroke-width': 1.2 }, s);
      return s;
    }

    var h = stage === 1 ? 34 : STEM_HEIGHT[energy];
    var top = ground - h;

    svg('path', {
      d: 'M30 116 Q' + (cx + 4) + ' ' + (ground - h / 2) + ' ' + cx + ' ' + top,
      fill: 'none', stroke: 'var(--leaf)', 'stroke-width': 3.5, 'stroke-linecap': 'round'
    }, s);

    var leafY = ground - h * 0.4;
    var leafSize = stage === 1 ? 12 : 14;
    svg('path', {
      d: 'M30 ' + leafY + ' q-' + leafSize + ' -2 -' + leafSize + ' -' + (leafSize * 0.8) + ' q' + leafSize + ' 0 ' + leafSize + ' ' + (leafSize * 0.8) + ' z',
      fill: 'var(--leaf-2)', stroke: ink, 'stroke-width': 1.2
    }, s);
    svg('path', {
      d: 'M31 ' + (leafY - 8) + ' q' + leafSize + ' -2 ' + leafSize + ' -' + (leafSize * 0.8) + ' q-' + leafSize + ' 0 -' + leafSize + ' ' + (leafSize * 0.8) + ' z',
      fill: 'var(--leaf)', stroke: ink, 'stroke-width': 1.2
    }, s);

    if (stage === 2) {
      var n = PETALS[energy];
      var r = energy === 'deep' ? 9 : 8;
      var g = svg('g', { transform: 'translate(' + cx + ' ' + top + ')' }, s);
      for (var i = 0; i < n; i++) {
        svg('ellipse', {
          cx: 0, cy: -r, rx: energy === 'steady' ? 7 : 4.2, ry: r,
          fill: COLORS[energy], stroke: ink, 'stroke-width': 1.2,
          transform: 'rotate(' + (360 / n) * i + ')'
        }, g);
      }
      svg('circle', { cx: 0, cy: 0, r: 4.5, fill: 'var(--ink)' }, g);
      svg('circle', { cx: 0, cy: 0, r: 1.6, fill: 'var(--paper)' }, g);
    } else {
      svg('ellipse', { cx: cx, cy: top - 2, rx: 4, ry: 6, fill: 'var(--leaf-2)', stroke: ink, 'stroke-width': 1.2 }, s);
    }
    return s;
  }

  /* ---------- helpers ---------- */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function plural(n, word) {
    return n + ' ' + word + (n === 1 ? '' : 's');
  }

  function todayISO() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function prettyDate(iso) {
    var p = iso.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  /* ---------- render ---------- */

  function visibleTasks() {
    var shown = tasks.filter(function (t) {
      return filter === 'all' || String(t.stage) === filter;
    });
    // blooms sink to the bottom, then earliest harvest date first
    return shown.slice().sort(function (a, b) {
      if ((a.stage === 2) !== (b.stage === 2)) return a.stage === 2 ? 1 : -1;
      var da = a.due || '9999', db = b.due || '9999';
      return da < db ? -1 : da > db ? 1 : a.id - b.id;
    });
  }

  function render() {
    renderList();
    renderGarden();
    filterBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.filter === filter));
    });
  }

  function renderList() {
    list.innerHTML = '';
    var shown = visibleTasks();
    var today = todayISO();

    shown.forEach(function (t) {
      var li = el('li', 'task');
      li.dataset.stage = t.stage;
      li.dataset.id = t.id;

      var thumb = el('div', 'thumb');
      thumb.appendChild(drawPlant(t.stage, t.energy));

      var body = el('div', 'body');
      body.appendChild(el('h3', null, t.text));

      var meta = el('div', 'meta');
      meta.appendChild(el('span', 'stamp ' + t.energy, NAMES[t.energy]));
      meta.appendChild(el('span', null, STAGES[t.stage]));
      if (t.due) {
        var late = t.stage < 2 && t.due < today;
        var due = el('span', late ? 'late' : null, (late ? 'Overdue: ' : 'Harvest ') + prettyDate(t.due));
        meta.appendChild(due);
      }
      body.appendChild(meta);

      var actions = el('div', 'actions');
      var water = el('button', 'water', ACTIONS[t.stage]);
      water.type = 'button';
      water.setAttribute('aria-label', ACTIONS[t.stage] + ': ' + t.text + ' (now a ' + STAGES[t.stage] + ')');
      water.addEventListener('click', function () { advance(t.id); });

      var rm = el('button', 'remove', 'Pull it up');
      rm.type = 'button';
      rm.setAttribute('aria-label', 'Remove ' + t.text);
      rm.addEventListener('click', function () { remove(t.id); });

      actions.appendChild(water);
      actions.appendChild(rm);

      li.appendChild(thumb);
      li.appendChild(body);
      li.appendChild(actions);
      list.appendChild(li);
    });

    if (shown.length) {
      empty.hidden = true;
    } else {
      empty.hidden = false;
      empty.textContent = tasks.length
        ? 'Nothing at this stage right now.'
        : 'The plot is bare. Fill in a seed packet and put your first task in the ground.';
    }
  }

  function renderGarden() {
    plants.innerHTML = '';
    tasks.forEach(function (t) {
      var wrap = el('div', 'plant' + (t.id === lastGrown ? ' grew' : ''));
      wrap.appendChild(drawPlant(t.stage, t.energy));
      plants.appendChild(wrap);
    });
    lastGrown = null;

    var counts = [0, 0, 0];
    tasks.forEach(function (t) { counts[t.stage]++; });
    var total = tasks.length;
    var score = total ? (counts[1] * 0.5 + counts[2]) / total : 0;
    meter.style.width = Math.round(score * 100) + '%';

    if (!total) {
      summary.textContent = 'Your plot is empty. Plant something.';
    } else if (counts[2] === total) {
      summary.textContent = 'Every plant is in bloom. Nice work. ' + total + ' of ' + total + ' done.';
    } else {
      summary.textContent = plural(counts[0], 'seed') + ', ' + plural(counts[1], 'sprout') +
        ' and ' + plural(counts[2], 'bloom') + ' in the ground.';
    }
  }

  /* ---------- actions ---------- */

  function advance(id) {
    tasks.forEach(function (t) {
      if (t.id === id) t.stage = (t.stage + 1) % 3;
    });
    lastGrown = id;
    save();
    render();
    var row = list.querySelector('[data-id="' + id + '"] .water');
    if (row) row.focus();
  }

  function remove(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    save();
    render();
    input.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) {
      formMsg.className = 'form-msg warn';
      formMsg.textContent = 'Name your seed first.';
      input.focus();
      return;
    }
    var task = {
      id: Date.now(),
      text: text,
      energy: form.elements.energy.value,
      due: dueInput.value || '',
      stage: 0
    };
    tasks.push(task);
    lastGrown = task.id;
    save();
    input.value = '';
    dueInput.value = '';
    formMsg.className = 'form-msg';
    formMsg.textContent = 'Planted: ' + text;
    input.focus();
    render();
  });

  filterBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      filter = b.dataset.filter;
      render();
    });
  });

  $('clear-bloomed').addEventListener('click', function () {
    var before = tasks.length;
    tasks = tasks.filter(function (t) { return t.stage !== 2; });
    save();
    render();
    formMsg.className = 'form-msg';
    formMsg.textContent = (before - tasks.length) + ' blooms picked and cleared.';
  });

  /* ---------- theme ---------- */

  function applyTheme(night) {
    document.documentElement.dataset.theme = night ? 'night' : 'day';
    themeBtn.setAttribute('aria-pressed', String(night));
    themeLabel.textContent = night ? 'Switch to day' : 'Switch to night';
  }

  themeBtn.addEventListener('click', function () {
    var night = document.documentElement.dataset.theme !== 'night';
    applyTheme(night);
    try { localStorage.setItem(THEME, night ? 'night' : 'day'); } catch (e) { /* ignore */ }
  });

  var savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME); } catch (e) { /* ignore */ }
  applyTheme(savedTheme === 'night');

  /* ---------- legend + start ---------- */

  $('legend-seed').appendChild(drawPlant(0, 'quick'));
  $('legend-sprout').appendChild(drawPlant(1, 'quick'));
  $('legend-bloom').appendChild(drawPlant(2, 'steady'));

  render();
})();
