/*!
 * JTC Visuals: live charts drawn on the page's dot grid.
 * Reads data/stats.json (rebuilt every morning by a GitHub Action).
 *
 *   <div data-jtc-viz="trend"></div>   line chart: commits per week, and how many had AI as co-author
 *   <div data-jtc-viz="share"></div>   donut: share of commits co-authored with AI
 *   <div data-jtc-viz="blocks"></div>  bar chart: reusable skills, rules, prompts, evals in my repos
 *   <div data-jtc-viz="ledger"></div>  public builds with links
 *   <div data-jtc-viz="next"></div>    milestones for what's next
 * Optional data-src="path/to/stats.json". Needs jtc-dots.js (grid + colours).
 */
(function () {
  var C = { bg: '#0b0c0c', unlit: '#161918', dim: '#30353a', grey: '#9da3a1', ink: '#f7f8f8', signal: '#ff5a60' };
  var ICONS = {"settings": {"size": 24, "r": 1, "dots": [[13.25, 9.83], [14.5, 12], [13.25, 14.17], [10.75, 14.17], [9.5, 12], [10.75, 9.83], [12, 4.8], [14.46, 5.23], [16.63, 6.48], [18.24, 8.4], [19.09, 10.75], [19.09, 13.25], [18.24, 15.6], [16.63, 17.52], [14.46, 18.77], [12, 19.2], [9.54, 18.77], [7.37, 17.52], [5.76, 15.6], [4.91, 13.25], [4.91, 10.75], [5.76, 8.4], [7.37, 6.48], [9.54, 5.23], [10.7, 2.19], [13.3, 2.19], [19.85, 5.97], [21.15, 8.22], [21.15, 15.78], [19.85, 18.03], [13.3, 21.81], [10.7, 21.81], [4.15, 18.03], [2.85, 15.78], [2.85, 8.22], [4.15, 5.97]]}, "rocket": {"size": 24, "r": 1, "dots": [[13.76, 2.76], [10.24, 2.76], [12, 1], [12, 17.72, 1], [12, 23, 1], [10.9, 20.36, 1], [13.32, 20.36, 1], [9.8, 17.72, 1], [14.2, 17.72, 1], [15.52, 4.52], [8.48, 4.52], [15.52, 6.72], [8.48, 6.72], [15.52, 8.92], [15.52, 13.32], [15.52, 15.52], [8.48, 8.92], [8.48, 13.32], [15.52, 11.12], [8.48, 11.12], [5.84, 12.44], [18.16, 12.44], [4.08, 14.2], [19.92, 14.2], [8.48, 15.52], [10.9, 15.52], [13.32, 15.52]]}, "error": {"size": 24, "r": 1, "dots": [[13.5, 3.75], [10.5, 20.25], [10.5, 3.75], [8, 6], [13.5, 20.25], [5.75, 15.75], [16, 6], [5.75, 8.25], [16, 18], [8, 18], [18.25, 8.25], [3.75, 13.25], [20.25, 10.75], [3.75, 10.75], [18.25, 15.75], [20.25, 13.25]], "strokes": ["M12 7.5V12.5", "M12 16.25V16.26"]}, "edit": {"size": 24, "r": 1, "dots": [[3.31, 20.66], [5.92, 20.66], [8.86, 20.34], [10.82, 18.37], [12.78, 16.41], [14.75, 14.45], [16.77, 12.56], [20.69, 8.63], [18.73, 10.59], [3.31, 18.05], [3.63, 15.11], [5.59, 13.14], [7.55, 11.18], [9.52, 9.22], [11.48, 7.26], [15.4, 3.34], [13.44, 5.3], [13.24, 9.03], [17.16, 5.1], [15.01, 10.79], [18.93, 6.87]]}, "compose": {"size": 16, "r": 0.667, "dots": [[5.33, 10.67], [5.33, 8.67], [6.67, 7.33], [8, 6], [9.33, 4.67], [10.67, 3.33], [12, 2], [7.33, 10.67], [8.67, 9.33], [10, 8], [11.33, 6.67], [12.67, 5.33], [14, 4], [14, 2], [5.33, 3.33], [3.33, 3.33], [2, 5.33], [2, 7.15], [2, 8.97], [2, 10.79], [2, 12.61], [3, 14], [4.83, 14], [6.67, 14], [8.5, 14], [10.33, 14], [12.17, 14], [13.33, 12.67], [13.33, 10.67]]}, "bell": {"size": 16, "r": 0.667, "dots": [[5.92, 3.67], [10.08, 3.67], [4.92, 5.67], [11.08, 5.67], [4.58, 7.67], [11.42, 7.67], [3.92, 9.67], [12.08, 9.67], [2.58, 11.67], [13.42, 11.67], [6.92, 11.67], [9.08, 11.67], [7.92, 13.67], [7.92, 2.33], [4.75, 11.67], [11.25, 11.67]]}, "frame": {"size": 16, "r": 0.667, "dots": [[2.0, 2.0], [4.0, 2.0], [6.0, 2.0], [8.0, 2.0], [10.0, 2.0], [12.0, 2.0], [14.0, 2.0], [2.0, 4.0], [8.0, 4.0], [14.0, 4.0], [2.0, 6.0], [8.0, 6.0], [14.0, 6.0], [2.0, 8.0], [4.0, 8.0], [6.0, 8.0], [8.0, 8.0], [10.0, 8.0], [12.0, 8.0], [14.0, 8.0], [2.0, 10.0], [8.0, 10.0], [14.0, 10.0], [2.0, 12.0], [8.0, 12.0], [14.0, 12.0], [2.0, 14.0], [4.0, 14.0], [6.0, 14.0], [8.0, 14.0], [10.0, 14.0], [12.0, 14.0], [14.0, 14.0]]}, "clock": {"size": 16, "r": 0.667, "dots": [[14, 8], [8, 14], [2, 8], [8, 2], [8, 4.33], [8, 8], [9.59, 8.91], [13.71, 9.85], [12.85, 11.53], [11.53, 12.85], [9.85, 13.71], [6.15, 13.71], [4.47, 12.85], [3.15, 11.53], [2.29, 9.85], [2.29, 6.15], [3.15, 4.47], [4.47, 3.15], [6.15, 2.29], [9.85, 2.29], [11.53, 3.15], [12.85, 4.47], [13.71, 6.15], [8, 6.17]]}, "check": {"size": 16, "r": 0.667, "dots": [[3, 8], [6, 11], [13, 4], [4.5, 9.5], [7.4, 9.6], [8.8, 8.2], [10.2, 6.8], [11.6, 5.4]]}, "image": {"size": 16, "r": 0.667, "dots": [[3.33, 3], [12.67, 3], [14, 4.33], [14, 11.67], [12.67, 13], [3.33, 13], [2, 11.67], [2, 4.33], [4.83, 5.33], [6, 8], [9.33, 11], [11, 9.33], [5.2, 3], [7.07, 3], [8.93, 3], [10.8, 3], [14, 6.17], [14, 8], [14, 9.83], [10.8, 13], [8.93, 13], [7.07, 13], [5.2, 13], [2, 9.83], [2, 8], [2, 6.17], [4.17, 9.67], [7.67, 9.5], [12.33, 10.5]]}, "shield": {"size": 16, "r": 0.667, "dots": [[8, 2], [13, 4], [13, 7.33], [8, 14], [3, 7.33], [3, 4], [9.67, 2.67], [11.33, 3.33], [13, 5.67], [12.62, 9.5], [11.53, 11.41], [9.92, 12.91], [6.08, 12.91], [4.47, 11.41], [3.38, 9.5], [3, 5.67], [4.67, 3.33], [6.33, 2.67]]}};
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = document.createElement('style');
  css.textContent = [
    '.jv{position:relative;margin-top:calc(var(--jtc-p) * 10);color:' + C.ink + ';font:700 16px/1.5 Doto,"JetBrains Mono",monospace}',
    '.jv canvas{display:block;width:100%;touch-action:pan-y}',
    '.jv .lbl{font:800 14px/1.4 Doto,monospace;letter-spacing:.06em;text-transform:uppercase;color:' + C.grey + '}',
    '.jv .axis{display:flex;justify-content:space-between;margin-top:8px}',
    '.jv .key{display:flex;flex-wrap:wrap;gap:6px 20px;margin-bottom:calc(var(--jtc-p) * 4)}',
    '.jv .key i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px;vertical-align:middle}',
    '.jv .tip{position:absolute;pointer-events:none;z-index:5;min-width:160px;max-width:260px;padding:10px 12px;background:' + C.bg + ';border:1px dashed ' + C.grey + ';border-radius:8px;font:800 14px/1.45 Doto,monospace;letter-spacing:.03em;opacity:0;transition:opacity .12s}',
    '.jv .tip.on{opacity:1}',
    '.jv .tip b{display:block;font-weight:900;text-transform:uppercase;color:' + C.grey + ';margin-bottom:2px}',
    '.jv .tip .s{color:' + C.signal + '}',
    '.jv .center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;text-align:center}',
    '.jv .center b{font:900 clamp(34px,4.6vw,58px)/1 Doto,monospace}',
    '.jv .barlbl{position:absolute;bottom:0;transform:translateX(-50%);text-align:center;white-space:nowrap}',
    '.jv .empty{color:' + C.grey + '}',
    '.jv .ico{width:24px;height:24px;flex:none}.jv .ico circle{fill:currentColor}.jv .ico .red{fill:' + C.signal + '}',
    '.jv .ico .red-stroke{stroke:' + C.signal + '}',
    '.jv .led{display:grid;border-top:1px dashed ' + C.dim + '}',
    '.jv .it{display:grid;grid-template-columns:28px 1fr;gap:16px;padding:22px 0;border-bottom:1px dashed ' + C.dim + '}',
    '.jv .it h4{margin:0;font:900 22px/1.25 Doto,monospace;text-transform:uppercase;letter-spacing:.04em}',
    '.jv .it p{margin:4px 0 10px;color:' + C.grey + ';text-wrap:pretty}',
    '.jv .it .meta{color:' + C.grey + '} .jv .it .meta .s{color:' + C.signal + '}',
    '.jv .links{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}',
    '.jv .links a{font:900 13px Doto,monospace;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;color:' + C.bg + ';background:' + C.ink + ';padding:6px 12px;border-radius:99px}',
    '.jv .links a:hover{background:' + C.signal + ';color:#fff}',
    '.jv .links a:focus-visible{outline:2px solid ' + C.signal + ';outline-offset:2px}',
    '.jv .steps{display:grid;gap:4px}',
    '.jv .st{display:flex;gap:14px;align-items:center;padding:8px 0;color:' + C.grey + '}',
    '.jv .st.now{color:' + C.ink + '}',
    '.jv .row{opacity:0;transform:translateY(10px);transition:opacity .45s,transform .45s;transition-delay:calc(var(--i) * 110ms)}',
    '.jv.in .row{opacity:1;transform:none}',
    '@media (prefers-reduced-motion:reduce){.jv .row{opacity:1;transform:none;transition:none}}'
  ].join('');
  document.head.appendChild(css);

  function P() { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--jtc-p')) || 4; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(d, opt) { var x = new Date(d + 'T12:00:00'); return x.toLocaleDateString('en-US', opt || { month: 'short', day: 'numeric', year: 'numeric' }); }
  function safe(u) { return /^https:\/\//.test(u || '') ? u : null; }
  function icon(name, cls) {
    var ic = ICONS[name]; if (!ic) return '';
    var h = '<svg class="ico ' + (cls || '') + '" viewBox="0 0 ' + ic.size + ' ' + ic.size + '" aria-hidden="true">';
    ic.dots.forEach(function (d) { h += '<circle cx="' + d[0] + '" cy="' + d[1] + '" r="' + ic.r + '"' + (d[2] ? ' class="red"' : '') + '/>'; });
    (ic.strokes || []).forEach(function (s) { h += '<path d="' + s + '" class="red-stroke" fill="none" stroke-width="2" stroke-linecap="round"/>'; });
    return h + '</svg>';
  }
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };

  var cache = {};
  function load(src) {
    if (window.JTC_STATS) return Promise.resolve(window.JTC_STATS);
    if (!cache[src]) cache[src] = fetch(src + '?t=' + Math.floor(Date.now() / 36e5), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    return cache[src];
  }

  /* ---------- dot canvas: everything snaps to the page grid ---------- */
  function Dots(host, rowsFn) {
    this.host = host; this.rowsFn = rowsFn;
    this.c = document.createElement('canvas');
    this.c.setAttribute('aria-hidden', 'true');
    host.appendChild(this.c);
    this.x = this.c.getContext('2d');
  }
  Dots.prototype.size = function () {
    this.p = P(); this.dpr = window.devicePixelRatio || 1;
    var w = this.host.clientWidth;
    this.cols = Math.floor(w / this.p) - 1;
    this.rows = this.rowsFn(this.cols);
    this.c.width = Math.round(w * this.dpr);
    this.c.height = Math.round((this.rows + 1) * this.p * this.dpr);
    this.c.style.height = (this.rows + 1) * this.p + 'px';
  };
  Dots.prototype.begin = function () {
    var r = this.c.getBoundingClientRect(), p = this.p;
    this.ox = (p - ((r.left + scrollX) % p)) % p;
    this.oy = (p - ((r.top + scrollY) % p)) % p;
    this.x.clearRect(0, 0, this.c.width, this.c.height);
    this.batch = {};
  };
  Dots.prototype.dot = function (col, row, color) {
    if (col < 0 || row < 0 || col > this.cols || row > this.rows) return;
    (this.batch[color] = this.batch[color] || []).push(col, row);
  };
  Dots.prototype.end = function () {
    var p = this.p, d = this.dpr, rad = p * 0.4 * d, x = this.x;
    for (var color in this.batch) {
      var a = this.batch[color]; x.fillStyle = color; x.beginPath();
      for (var i = 0; i < a.length; i += 2) {
        var cx = (this.ox + a[i] * p + p / 2) * d, cy = (this.oy + a[i + 1] * p + p / 2) * d;
        x.moveTo(cx + rad, cy); x.arc(cx, cy, rad, 0, Math.PI * 2);
      }
      x.fill();
    }
  };
  Dots.prototype.cell = function (ev) {
    var r = this.c.getBoundingClientRect();
    return { col: (ev.clientX - r.left - this.ox) / this.p, row: (ev.clientY - r.top - this.oy) / this.p, px: ev.clientX - r.left, py: ev.clientY - r.top };
  };

  function hostXY(host, ev) { var r = host.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
  function tipper(host) {
    var t = document.createElement('div'); t.className = 'tip'; t.setAttribute('role', 'status'); host.appendChild(t);
    return {
      show: function (html, x, y) {
        t.innerHTML = html; t.classList.add('on');
        var w = t.offsetWidth, hw = host.clientWidth;
        t.style.left = Math.max(0, Math.min(hw - w, x + 14)) + 'px';
        t.style.top = Math.max(0, y - t.offsetHeight - 12) + 'px';
      },
      hide: function () { t.classList.remove('on'); }
    };
  }

  function animate(chart) {
    var start = null;
    function tick(now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / 1300);
      chart.progress = ease(t); chart.draw();
      if (t < 1) requestAnimationFrame(tick);
    }
    if (reduced) { chart.progress = 1; chart.draw(); } else requestAnimationFrame(tick);
  }

  /* ---------- line chart ---------- */
  function trend(host, s) {
    var a = s.activity;
    if (!a.commits && !s.sample) { host.innerHTML = '<p class="empty">This chart fills in after the first daily update from GitHub.</p>'; return null; }
    // Daily points, shown as running totals so every day is a point you can hover.
    var days = [];
    a.grid.forEach(function (col) { col.forEach(function (d) { if (!d.future) days.push(d); }); });
    var first = days.findIndex(function (d) { return d.commits > 0; });
    if (first < 0) first = 0;
    first = Math.max(0, Math.min(first, days.length - 21));
    days = days.slice(first);
    var cc = 0, ca = 0;
    var weeks = days.map(function (d) { cc += d.commits; ca += d.ai; return { from: d.date, day: d.commits, dayAi: d.ai, c: cc, ai: ca, ship: d.ship ? [d.ship] : [] }; });
    var max = cc || 1;
    host.innerHTML = '<div class="key lbl"><span><i style="background:' + C.ink + '"></i>Commits, running total</span><span><i style="background:' + C.signal + '"></i>With AI as co-author</span><span>' + weeks.length + ' days</span></div>';
    var d = new Dots(host, function (cols) { return Math.max(34, Math.min(70, Math.round(cols * 0.28))); });
    host.insertAdjacentHTML('beforeend', '<div class="axis lbl"><span>' + fmt(weeks[0].from, { month: 'short', day: 'numeric' }) + '</span><span>Today</span></div>');
    var tip = tipper(host), hover = -1;
    var chart = { progress: 0 };
    function geo() {
      var n = weeks.length, top = 3, base = d.rows - 1, span = base - top;
      return { n: n, top: top, base: base, xs: weeks.map(function (_, i) { return Math.round(i * d.cols / (n - 1)); }),
        y: function (v) { return base - (v / max) * span; } };
    }
    function series(g, key) {
      var pts = [];
      for (var col = 0; col <= d.cols; col++) {
        var f = col / d.cols * (g.n - 1), i = Math.min(g.n - 2, Math.floor(f)), t = f - i;
        pts.push(g.y(weeks[i][key] * (1 - t) + weeks[i + 1][key] * t));
      }
      return pts;
    }
    chart.draw = function () {
      d.begin();
      var g = geo(), lim = Math.round(chart.progress * d.cols), all = series(g, 'c'), ai = series(g, 'ai');
      for (var col = 0; col <= d.cols; col++) d.dot(col, g.base + 1, C.dim);
      if (hover >= 0) for (var r = g.top; r <= g.base; r += 2) d.dot(g.xs[hover], r, C.dim);
      for (col = 0; col <= lim; col++) {
        var y = Math.round(all[col]), ya = Math.round(ai[col]);
        for (var r2 = y + 2; r2 <= g.base; r2++) if ((r2 + col) % 2 === 0) d.dot(col, r2, C.dim);
        d.dot(col, y, C.ink); d.dot(col, y + 1, C.ink);
        d.dot(col, ya, C.signal); d.dot(col, ya + 1, C.signal);
      }
      weeks.forEach(function (w, i) {
        var x = g.xs[i]; if (x > lim) return;
        var yy = Math.round(g.y(w.c));
        if (w.day || i === hover) for (var a1 = -1; a1 <= 1; a1++) for (var b1 = -1; b1 <= 1; b1++) d.dot(x + a1, yy + b1, i === hover ? C.signal : C.ink);
        if (w.ship.length) for (var k = 0; k < 3; k++) d.dot(x, g.top - 3 + k, C.signal);
      });
      d.end();
    };
    function move(ev) {
      var c = d.cell(ev), g = geo(), best = 0;
      g.xs.forEach(function (x, i) { if (Math.abs(x - c.col) < Math.abs(g.xs[best] - c.col)) best = i; });
      hover = best; chart.draw();
      var w = weeks[best];
      tip.show('<b>' + esc(fmt(w.from)) + '</b>' + w.day + ' commit' + (w.day === 1 ? '' : 's') + ' that day' + (w.day ? '<br><span class="s">' + w.dayAi + ' with AI</span>' : '') + '<br>Running total: ' + w.c + ' (' + (w.c ? Math.round(w.ai / w.c * 100) : 0) + '% with AI)' +
        (w.ship.length ? '<br>Shipped: ' + esc(w.ship.join(', ')) : ''), hostXY(host, ev)[0], hostXY(host, ev)[1]);
    }
    d.c.addEventListener('pointermove', move); d.c.addEventListener('pointerdown', move);
    d.c.addEventListener('pointerleave', function () { hover = -1; tip.hide(); chart.draw(); });
    chart.layout = function () { d.size(); chart.draw(); };
    return chart;
  }

  /* ---------- donut ---------- */
  function share(host, s) {
    var a = s.activity;
    if (!a.commits && !s.sample) { host.innerHTML = '<p class="empty">Fills in after the first daily update.</p>'; return null; }
    var f = a.ai_commits / a.commits;
    host.innerHTML = '<div class="key lbl"><span><i style="background:' + C.signal + '"></i>With AI</span><span><i style="background:' + C.grey + '"></i>Without</span></div>';
    var wrap = document.createElement('div'); wrap.style.position = 'relative'; host.appendChild(wrap);
    var d = new Dots(wrap, function (cols) { return Math.min(cols, 64); });
    wrap.insertAdjacentHTML('beforeend', '<div class="center"><b>' + Math.round(f * 100) + '%</b><span class="lbl">with AI</span></div>');
    var tip = tipper(host), hover = null, chart = { progress: 0 };
    function geo() { var R = Math.floor(Math.min(d.cols, d.rows) / 2) - 1; return { cx: Math.floor(d.cols / 2), cy: Math.floor(d.rows / 2), R: R, r: Math.round(R * 0.58) }; }
    function frac(dx, dy) { var t = Math.atan2(dx, -dy); return (t < 0 ? t + 2 * Math.PI : t) / (2 * Math.PI); }
    chart.draw = function () {
      d.begin(); var g = geo();
      for (var y = -g.R; y <= g.R; y++) for (var x = -g.R; x <= g.R; x++) {
        var dist = Math.sqrt(x * x + y * y); if (dist > g.R || dist < g.r) continue;
        var q = frac(x, y);
        if (q > chart.progress) { d.dot(g.cx + x, g.cy + y, C.dim); continue; }
        var isAI = q < f, hot = hover === (isAI ? 'ai' : 'no');
        d.dot(g.cx + x, g.cy + y, isAI ? C.signal : (hot ? C.ink : C.grey));
      }
      d.end();
    };
    function move(ev) {
      var c = d.cell(ev), g = geo(), dx = c.col - g.cx, dy = c.row - g.cy, dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > g.R + 1 || dist < g.r - 1) { hover = null; tip.hide(); chart.draw(); return; }
      hover = frac(dx, dy) < f ? 'ai' : 'no'; chart.draw();
      tip.show(hover === 'ai' ? '<b>Co-authored with AI</b><span class="s">' + a.ai_commits + ' commits (' + Math.round(f * 100) + '%)</span>'
        : '<b>Without AI</b>' + (a.commits - a.ai_commits) + ' commits (' + (100 - Math.round(f * 100)) + '%)', hostXY(host, ev)[0], hostXY(host, ev)[1]);
    }
    d.c.addEventListener('pointermove', move); d.c.addEventListener('pointerdown', move);
    d.c.addEventListener('pointerleave', function () { hover = null; tip.hide(); chart.draw(); });
    chart.layout = function () { d.size(); chart.draw(); };
    return chart;
  }

  /* ---------- bar chart ---------- */
  var BLOCK_NOTES = { 'Skills': 'Reusable how-tos a model loads on demand', 'Rules files': 'CLAUDE.md, DESIGN.md and Cursor rules', 'Prompts': 'Saved prompts that worked', 'Evals': 'Tests that score AI output' };
  function blocks(host, s) {
    var sys = s.system, keys = Object.keys(sys), total = keys.reduce(function (t, k) { return t + sys[k]; }, 0);
    if (total < 3 && !s.sample) {
      // Too little public to chart yet: hide the chart and the sentence that introduces it.
      host.style.display = 'none';
      var intro = document.querySelector('[data-viz-intro="blocks"]'); if (intro) intro.style.display = 'none';
      return null;
    }
    var max = Math.max(10, Math.max.apply(null, keys.map(function (k) { return sys[k]; })));
    var wrap = document.createElement('div'); wrap.style.position = 'relative'; wrap.style.paddingBottom = '30px'; host.appendChild(wrap);
    var d = new Dots(wrap, function (cols) { return Math.max(30, Math.min(56, Math.round(cols * 0.22))); });
    var labels = keys.map(function (k) { var e = document.createElement('span'); e.className = 'barlbl lbl'; e.textContent = k; wrap.appendChild(e); return e; });
    var tip = tipper(host), hover = -1, chart = { progress: 0 };
    function geo() {
      var n = keys.length, gap = Math.max(4, Math.round(d.cols * 0.06)), bw = Math.floor((d.cols - gap * (n - 1)) / n);
      return { n: n, bw: bw, gap: gap, base: d.rows - 1, x: function (i) { return i * (bw + gap); } };
    }
    chart.draw = function () {
      d.begin(); var g = geo();
      for (var col = 0; col <= d.cols; col++) d.dot(col, g.base + 1, C.dim);
      keys.forEach(function (k, i) {
        var h = Math.round((sys[k] / max) * (g.base - 4) * chart.progress), x0 = g.x(i);
        for (var r = 0; r < h; r++) for (var c2 = 0; c2 < g.bw; c2++) d.dot(x0 + c2, g.base - r, r === h - 1 ? C.signal : (hover === i ? C.ink : C.grey));
        labels[i].style.left = (d.ox + (x0 + g.bw / 2) * d.p) + 'px';
      });
      d.end();
    };
    function move(ev) {
      var c = d.cell(ev), g = geo(), i = Math.floor(c.col / (g.bw + g.gap));
      if (i < 0 || i >= g.n || c.col - g.x(i) > g.bw) { hover = -1; tip.hide(); chart.draw(); return; }
      hover = i; chart.draw();
      tip.show('<b>' + esc(keys[i]) + '</b><span class="s">' + sys[keys[i]] + ' files</span><br>' + esc(BLOCK_NOTES[keys[i]] || ''), hostXY(host, ev)[0], hostXY(host, ev)[1]);
    }
    d.c.addEventListener('pointermove', move); d.c.addEventListener('pointerdown', move);
    d.c.addEventListener('pointerleave', function () { hover = -1; tip.hide(); chart.draw(); });
    chart.layout = function () { d.size(); chart.draw(); };
    return chart;
  }

  /* ---------- ledger + next (HTML, Cadence Kit icons) ---------- */
  function ledger(host, s) {
    var items = s.ledger.filter(function (i) { return i.visibility === 'public' && (i.proof || []).some(function (p) { return safe(p.url); }); });
    var rank = function (x) { return x.status !== 'shipped' && (x.stage || x.target) ? 0 : x.status === 'shipped' ? 1 : 2; };
    items.sort(function (a, b) { return rank(a) - rank(b) || String(b.shipped || b.started).localeCompare(String(a.shipped || a.started)); });
    host.innerHTML = '<div class="led">' + items.map(function (it, n) {
      var meta;
      if (it.status === 'shipped') meta = '<span class="s">Shipped ' + esc(fmt(it.shipped)) + '</span>' + (it.auto_shipped ? ' · verified by a GitHub release' : '');
      else if (it.stage) meta = '<span class="s">' + esc(it.stage) + '</span>';
      else if (it.target) { var dd = Math.ceil((new Date(it.target + 'T12:00:00') - new Date()) / 864e5); meta = '<span class="s">' + (dd > 0 ? 'Launches in ' + dd + ' day' + (dd === 1 ? '' : 's') : 'Launching now') + '</span>'; }
      else meta = 'In progress';
      var ic = it.status === 'shipped' ? icon('rocket') : icon('clock');
      return '<div class="it row" style="--i:' + n + '">' + ic + '<div><h4>' + esc(it.name) + '</h4><p>' + esc(it.what) + '</p><div class="meta lbl">' + meta + '</div>' +
        '<div class="links">' + it.proof.filter(function (p) { return safe(p.url); }).map(function (p) { return '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.label) + ' ↗</a>'; }).join('') + '</div></div></div>';
    }).join('') + '</div>';
    return null;
  }
  function next(host, s) {
    var n = s.next; if (!n) return null;
    var ms = n.milestones || [], cur = ms.findIndex(function (m) { return !m.done; });
    host.innerHTML = '<div class="steps">' + ms.map(function (m, i) {
      return '<div class="st row' + (i === cur ? ' now' : '') + '" style="--i:' + i + '">' + icon(m.done ? 'check' : (m.icon || 'clock')) + '<span class="lbl" style="color:inherit">' + esc(m.label) + (i === cur ? ' · now' : '') + '</span></div>';
    }).join('') + '</div>';
    return null;
  }

  var R = { trend: trend, share: share, blocks: blocks, ledger: ledger, next: next };
  var charts = [];
  function mount(el) {
    var type = el.getAttribute('data-jtc-viz');
    if (!R[type]) return;
    el.classList.add('jv');
    load(el.getAttribute('data-src') || 'data/stats.json').then(function (s) {
      var chart = R[type](el, s);
      if (chart) { charts.push(chart); chart.layout(); }
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (!e.isIntersecting) return; el.classList.add('in'); if (chart) animate(chart); io.disconnect(); });
      }, { threshold: 0.3 });
      io.observe(el);
    }).catch(function () { el.innerHTML = '<p class="empty lbl">Live numbers are updating. Check back soon.</p>'; });
  }
  function init() {
    [].forEach.call(document.querySelectorAll('[data-jtc-viz]'), mount);
    var lw = innerWidth, tm;
    addEventListener('resize', function () { if (innerWidth === lw) return; lw = innerWidth; clearTimeout(tm); tm = setTimeout(function () { charts.forEach(function (c) { c.layout(); }); }, 160); });
    new ResizeObserver(function () { charts.forEach(function (c) { c.draw(); }); }).observe(document.body);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.JTCVisuals = { icon: icon, icons: ICONS };
})();
