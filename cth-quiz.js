/* FO Study v25.3 — CTH §7 Systems Review + Quiz.
   Source: data/cth-systems-quiz.json, built from the Crew Training Handbook (Praetor 500/600, Rev 2.5)
   Section 7 Systems Review Questions. The correct answer and reference always come from the CTH text,
   word for word. Wrong options are written to be plausible but wrong per the book.
   Loaded after study-v25.js and before app-v5.js. Wraps FOStudyExt.route and handles #/checkride/cthquiz/... */
(() => {
  const X = window.FOStudyExt;
  if (!X || !X.ui) { console.warn('cth-quiz: FOStudyExt.ui missing'); return; }
  const { page, esc, nl, list, row, label } = X.ui;
  const DATA_URL = 'data/cth-systems-quiz.json?v=25.3';
  const PASS = 80;
  const ALL_LENS = [25, 50, 100];
  let DATA = null;
  let run = null; // current quiz run

  async function load() {
    if (DATA) return DATA;
    const r = await fetch(DATA_URL, { cache: 'no-cache' });
    if (!r.ok) throw new Error('cth-systems-quiz.json ' + r.status);
    const d = await r.json();
    d.byId = {};
    d.systems.forEach((s) => { d.byId[s.id] = s; s.items.forEach((it) => { it.sysId = s.id; it.sec = s.sec; }); });
    DATA = d;
    return d;
  }
  const quizable = (s) => s.items.filter((i) => !i.dup);
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const title = (s) => s.title.replace(/\s*\(INDICATING AND RECORDING SYSTEMS\)/, '').replace(/\b([A-Z])([A-Z]+)\b/g, (m, a, b) => (['APU', 'FMS', 'CPDLC'].includes(m) ? m : a + b.toLowerCase()));
  const best = (id) => { try { return JSON.parse(localStorage.getItem('cthq_best_' + id) || 'null'); } catch (e) { return null; } };
  const saveBest = (id, pct) => { try { const b = best(id); if (b == null || pct > b) localStorage.setItem('cthq_best_' + id, JSON.stringify(pct)); } catch (e) { /* ignore */ } };
  const noteHtml = (it) => (it.note ? `<div class="cthq-note">as printed in CTH — ${esc(it.note)}</div>` : '');
  const tblHtml = (it) => (it.tbl ? '<div class="cthq-note">table in the CTH, shown as text</div>' : '');
  const L = 'ABCD';

  function mkQ(it) {
    if (it.t === 'tf') return { it, tf: true, opts: ['True', 'False'], correct: it.ans ? 0 : 1 };
    const opts = shuffle([it.a, ...it.d]);
    return { it, tf: false, opts, correct: opts.indexOf(it.a) };
  }

  // ---------- hub ----------
  async function viewHub() {
    const d = await load();
    const nQuiz = d.systems.reduce((a, s) => a + quizable(s).length, 0);
    page('Systems Review + Quiz', 'Checkride Prep · CTH §7', '/checkride', `
      <div class="card"><p>Every CTH §7 Systems Review Question (${d.total} across ${d.systems.length} systems), with the book answer and reference. Each system has a <b>Review</b> mode (question, book answer, reference) and a <b>Quiz</b> mode: every question for that system, shuffled, multiple choice or true/false, with a missed-question review at the end. Correct answers are the CTH text word for word; the wrong options are made up to sound plausible.</p>
      <div class="btnrow"><button class="btn btn-primary" data-nav="/checkride/cthquiz/all">All-systems mixed quiz</button><button class="btn btn-ghost" data-nav="/checkride/systems">Systems cards (by AOM chapter)</button></div></div>
      ${label('Systems · CTH §7')}
      ${list(d.systems.map((s) => { const b = best(s.id); return row('/checkride/cthquiz/' + s.id, `${esc(s.sec)} ${esc(title(s))}`, `${s.items.length} Qs · p.${s.page}${b != null ? ' · best ' + b + '%' : ''}`); }))}
      <p class="muted small">${nQuiz} unique quiz questions (the CTH prints ${d.total - nQuiz} questions twice; each is quizzed once but listed in Review both times).</p>`);
  }

  // ---------- per-system ----------
  async function viewSystem(id) {
    const d = await load();
    const s = d.byId[id];
    if (!s) return viewHub();
    const q = quizable(s);
    const nTF = q.filter((i) => i.t === 'tf').length;
    const b = best(id);
    page(title(s), 'CTH §' + s.sec + ' · Review + Quiz', '/checkride/cthquiz', `
      <div class="card center sg-quiz-start">
        <div class="sg-big">Review</div>
        <p class="muted" style="max-width:480px;margin:6px auto 12px">All ${s.items.length} CTH questions with the book answer and reference. Use it as a list or as flashcards.</p>
        <div class="btnrow" style="justify-content:center"><button type="button" class="btn btn-primary" data-nav="/checkride/cthquiz/${esc(id)}/review">Review list</button><button type="button" class="btn btn-ghost" data-nav="/checkride/cthquiz/${esc(id)}/cards">Flashcards</button></div>
      </div>
      <div class="card center sg-quiz-start" style="margin-top:16px">
        <div class="sg-big">Quiz</div>
        <p class="muted" style="max-width:480px;margin:6px auto 8px">All ${q.length} questions, shuffled (${q.length - nTF} multiple choice${nTF ? ', ' + nTF + ' true/false' : ''}). Scored at the end with a missed-questions review. Pass mark ${PASS}%.${b != null ? ' Your best: <b>' + b + '%</b>.' : ''}</p>
        <button type="button" class="btn btn-primary" data-nav="/checkride/cthquiz/${esc(id)}/quiz">Start ${q.length}-question quiz</button>
      </div>
      <p class="muted small" style="margin-top:14px">Source: CTH Rev 2.5 §${esc(s.sec)} ${esc(s.title)}, starting on p.${s.page}.</p>`);
  }

  function viewReview(s) {
    const cards = s.items.map((it) => `<div class="sg-qc" id="cthq-${esc(it.id)}">
        <div class="sg-qtop"><span class="sg-qn">${esc(s.sec)} · Q${it.n}${it.dup ? ' <span class="muted">(printed twice in CTH)</span>' : ''}</span><span class="sg-src">${esc(it.cite)}</span></div>
        <div class="sg-stem">${esc(it.q)}</div>
        <div class="cthq-ans"><div class="sg-opt correct"><span class="k">✓</span><span>${nl(it.a)}</span></div>${noteHtml(it)}${tblHtml(it)}</div>
        <button type="button" class="sg-link cthq-reveal">Show answer</button>
      </div>`).join('');
    page(title(s) + ' · Review', 'CTH §' + s.sec, '/checkride/cthquiz/' + s.id, `
      <div class="card"><p>${s.items.length} questions from CTH §${esc(s.sec)}, each with the book answer and its reference.</p>
      <div class="btnrow"><button type="button" class="btn btn-ghost" id="cthq-hide">Hide answers (self-test)</button><button type="button" class="btn btn-ghost" data-nav="/checkride/cthquiz/${esc(s.id)}/cards">Flashcards</button><button type="button" class="btn btn-primary" data-nav="/checkride/cthquiz/${esc(s.id)}/quiz">Quiz</button></div></div>
      <div id="cthq-list">${cards}</div>`, 'cthq');
    const app = window.FOStudy.app;
    const host = app.querySelector('#cthq-list');
    const btn = app.querySelector('#cthq-hide');
    btn.addEventListener('click', () => {
      const hid = host.classList.toggle('hide-ans');
      host.querySelectorAll('.sg-qc').forEach((c) => c.classList.remove('shown'));
      btn.textContent = hid ? 'Show all answers' : 'Hide answers (self-test)';
    });
    host.querySelectorAll('.cthq-reveal').forEach((b) => b.addEventListener('click', () => b.parentElement.classList.add('shown')));
    window.scrollTo(0, 0);
  }

  function viewCards(s) {
    let order = s.items.slice();
    let i = 0; let open = false;
    const paint = () => {
      const it = order[i];
      page(title(s) + ' · Flashcards', 'CTH §' + s.sec, '/checkride/cthquiz/' + s.id, `
        <div class="sg-prog"><div style="width:${((i + 1) / order.length) * 100}%"></div></div>
        <div class="sg-qmeta"><span class="sg-qn">${esc(s.sec)} · Q${it.n}</span><span class="muted">${i + 1} / ${order.length}</span></div>
        <div class="sg-qc" id="cthq-card" style="cursor:pointer">
          <div class="sg-stem">${esc(it.q)}</div>
          ${open ? `<div class="sg-opt correct"><span class="k">✓</span><span>${nl(it.a)}</span></div>${noteHtml(it)}${tblHtml(it)}<div style="margin-top:10px"><span class="sg-src">${esc(it.cite)}</span></div>` : '<p class="muted small">Tap to show the book answer</p>'}
        </div>
        <div class="sg-nav">
          <button type="button" class="btn btn-ghost" id="cthq-prev" ${i === 0 ? 'disabled' : ''}>Prev</button>
          <button type="button" class="btn btn-ghost" id="cthq-shuf">Shuffle</button>
          <button type="button" class="btn btn-primary" id="cthq-next">${i === order.length - 1 ? 'Done' : 'Next'}</button>
        </div>`, 'cthq');
      const app = window.FOStudy.app;
      app.querySelector('#cthq-card').addEventListener('click', () => { open = !open; paint(); });
      app.querySelector('#cthq-prev').addEventListener('click', () => { if (i > 0) { i--; open = false; paint(); } });
      app.querySelector('#cthq-next').addEventListener('click', () => { if (i < order.length - 1) { i++; open = false; paint(); } else location.hash = '#/checkride/cthquiz/' + s.id; });
      app.querySelector('#cthq-shuf').addEventListener('click', () => { order = shuffle(order); i = 0; open = false; paint(); });
    };
    paint();
    window.scrollTo(0, 0);
  }

  // ---------- quiz ----------
  function startRun(ctx, items) {
    run = { ctx, Q: shuffle(items).map(mkQ), idx: 0, ans: [] };
    run.ans = new Array(run.Q.length).fill(null);
    paintRun();
  }
  const optText = (q, k) => (q.tf ? '' : L[k] + ') ') + q.opts[k];
  const nav = (path) => { if (location.hash === '#' + path) dispatch(path.slice(1).split('/')); else location.hash = '#' + path; };
  function paintRun() {
    const q = run.Q[run.idx];
    const it = q.it;
    const opts = q.opts.map((o, k) => `<button type="button" class="sg-opt pick${run.ans[run.idx] === k ? ' sel' : ''}" data-pick="${k}"><span class="k">${q.tf ? (k === 0 ? 'T' : 'F') : L[k]}</span><span>${nl(o)}</span></button>`).join('');
    const stem = q.tf
      ? `<div class="muted small" style="margin-bottom:6px">True or false?</div>${esc(it.s)}`
      : esc(it.q);
    page(run.ctx.title, run.ctx.crumb, run.ctx.back, `
      <div class="sg-prog"><div style="width:${(run.idx / run.Q.length) * 100}%"></div></div>
      <div class="sg-qmeta"><span class="sg-qn">${esc(it.sec)} · Q${it.n}</span><span class="muted">${esc(run.ctx.label)} · ${run.idx + 1} / ${run.Q.length}</span></div>
      <div class="sg-stem" style="margin:12px 0 16px">${stem}</div>
      <div class="sg-opts">${opts}</div>
      ${it.note ? '<div class="cthq-note" style="margin-top:8px">Book text is kept as printed in the CTH.</div>' : ''}
      <div class="sg-nav">
        <button type="button" class="btn btn-ghost" id="sg-quiz-quit">Quit</button>
        <button type="button" class="btn btn-primary" id="sg-quiz-next">${run.idx === run.Q.length - 1 ? 'Finish' : 'Next'}</button>
      </div>`, 'cthq');
    const app = window.FOStudy.app;
    app.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => { run.ans[run.idx] = Number(b.getAttribute('data-pick')); paintRun(); }));
    app.querySelector('#sg-quiz-quit').addEventListener('click', () => { if (confirm('Quit this quiz?')) { run = null; nav(run_back()); } });
    app.querySelector('#sg-quiz-next').addEventListener('click', () => {
      if (run.ans[run.idx] === null) { alert('Pick an answer first.'); return; }
      if (run.idx === run.Q.length - 1) { paintResult(); return; }
      run.idx++; paintRun(); window.scrollTo(0, 0);
    });
  }
  let lastBack = '/checkride/cthquiz';
  const run_back = () => lastBack;

  function revCard(q, you) {
    const it = q.it; const ok = you === q.correct;
    return `<div class="sg-rev ${ok ? 'ok' : 'no'}">
      <div class="sg-qtop"><span class="sg-qn">${esc(it.sec)} · Q${it.n}</span></div>
      <div style="font-size:14px;font-weight:500;margin-bottom:6px">${q.tf ? 'True or false? ' + esc(it.s) : esc(it.q)}</div>
      <div class="l ${ok ? 'cb' : 'yb'}">Your answer: ${you == null ? '(blank)' : nl(optText(q, you))} ${ok ? 'OK' : 'X'}</div>
      ${ok ? '' : `<div class="l cb">Correct: ${nl(optText(q, q.correct))}</div>`}
      <div class="l" style="color:var(--text-mute);margin-top:5px"><b style="color:var(--accent)">Why:</b> ${nl(it.x)}</div>
      ${noteHtml(it)}${tblHtml(it)}
      <div class="l" style="margin-top:5px"><span class="cite">Ref: ${esc(it.cite)}</span></div>
    </div>`;
  }

  function paintResult() {
    let correct = 0; const missed = [];
    run.Q.forEach((q, i) => { if (run.ans[i] === q.correct) correct++; else missed.push(i); });
    const pct = Math.round((correct / run.Q.length) * 100);
    const pass = pct >= PASS;
    if (run.ctx.bestKey && run.ctx.full) saveBest(run.ctx.bestKey, pct);
    const cur = run;
    page(cur.ctx.title, cur.ctx.crumb, cur.ctx.back, `
      <div class="card center">
        <div class="muted">${esc(cur.ctx.label)} complete</div>
        <div class="sg-score ${pass ? 'pass' : 'fail'}">${pct}%</div>
        <div class="sg-pill">${correct} / ${cur.Q.length} correct · ${pass ? 'PASS (≥' + PASS + '%)' : 'below ' + PASS + '%'}</div>
        <div class="sg-nav" style="justify-content:center;margin-top:18px;flex-wrap:wrap;gap:8px">
          ${missed.length ? `<button type="button" class="btn btn-primary" id="sg-retake-missed">Retake ${missed.length} missed</button>` : ''}
          <button type="button" class="btn btn-ghost" id="sg-again">New test</button>
          ${cur.ctx.reviewPath ? `<button type="button" class="btn btn-ghost" data-nav="${cur.ctx.reviewPath}">Review</button>` : ''}
          <button type="button" class="btn btn-ghost" id="cthq-back">Back</button>
        </div>
      </div>
      <div style="margin-top:20px">
        <div class="sg-big" style="margin-bottom:4px">Missed questions (${missed.length})</div>
        ${missed.length ? missed.map((i) => revCard(cur.Q[i], cur.ans[i])).join('') : '<div class="muted">None missed. Nice.</div>'}
        <details style="margin-top:14px"><summary class="muted">Show all ${cur.Q.length} with answers</summary>${cur.Q.map((q, i) => revCard(q, cur.ans[i])).join('')}</details>
      </div>`, 'cthq');
    const app = window.FOStudy.app;
    app.querySelector('#sg-retake-missed')?.addEventListener('click', () => startRun(Object.assign({}, cur.ctx, { label: 'Retake missed', full: false }), missed.map((i) => cur.Q[i].it)));
    app.querySelector('#cthq-back')?.addEventListener('click', () => nav(cur.ctx.back));
    app.querySelector('#sg-again')?.addEventListener('click', () => { const c = cur.ctx.origCtx || cur.ctx; startRun(c, c.pool()); });
    window.scrollTo(0, 0);
  }

  async function viewQuiz(id) {
    const d = await load();
    const s = d.byId[id];
    if (!s) return viewHub();
    lastBack = '/checkride/cthquiz/' + id;
    const ctx = { title: title(s) + ' · Quiz', crumb: 'CTH §' + s.sec, back: lastBack, label: `${s.sec} ${title(s)}`, bestKey: id, full: true, reviewPath: '/checkride/cthquiz/' + id + '/review', pool: () => quizable(s) };
    ctx.origCtx = ctx;
    startRun(ctx, ctx.pool());
  }

  async function viewAll() {
    const d = await load();
    const pool = d.systems.flatMap(quizable);
    let len = 50;
    lastBack = '/checkride/cthquiz/all';
    const paint = () => {
      const btns = [...ALL_LENS, pool.length].map((v) => `<button type="button" class="btn ${len === v ? 'btn-primary' : 'btn-ghost'} sg-len" data-len="${v}" style="min-width:64px;margin:3px">${v === pool.length ? 'All ' + v : v}</button>`).join('');
      page('All systems · Quiz', 'CTH §7 · Review + Quiz', '/checkride/cthquiz', `
        <div class="card center sg-quiz-start">
          <div class="sg-big">All-Systems Mixed Quiz</div>
          <p class="muted" style="max-width:480px;margin:6px auto 8px">Random questions drawn from all ${d.systems.length} CTH §7 systems (${pool.length} unique questions), shuffled, scored at the end with a missed-questions review. Pick a length.</p>
          <div style="margin:8px auto 14px">${btns}</div>
          <button type="button" class="btn btn-primary" id="cthq-start-all">Start ${len === pool.length ? 'all ' + len : len}-question test</button>
        </div>`, 'cthq');
      const app = window.FOStudy.app;
      app.querySelectorAll('.sg-len').forEach((b) => b.addEventListener('click', () => { len = Number(b.getAttribute('data-len')); paint(); }));
      app.querySelector('#cthq-start-all').addEventListener('click', () => {
        const ctx = { title: 'All systems · Quiz', crumb: 'CTH §7', back: '/checkride/cthquiz', label: `All systems · ${len}Q`, bestKey: 'all', full: false, pool: () => shuffle(pool).slice(0, len) };
        ctx.origCtx = ctx;
        startRun(ctx, ctx.pool());
      });
    };
    paint();
  }

  async function dispatch(parts) {
    const [, , id, mode] = parts;
    if (!id) return viewHub();
    if (id === 'all') return viewAll();
    if (!mode) return viewSystem(id);
    const d = await load();
    const s = d.byId[id];
    if (!s) return viewHub();
    if (mode === 'review') return viewReview(s);
    if (mode === 'cards') return viewCards(s);
    if (mode === 'quiz') return viewQuiz(id);
    return viewSystem(id);
  }

  const orig = X.route;
  X.route = function (parts) {
    if (parts[0] === 'checkride' && parts[1] === 'cthquiz') {
      Promise.resolve(dispatch(parts)).catch((err) => {
        console.error(err);
        page('Error', 'Checkride Prep', '/checkride', `<div class="card"><p>Could not load the CTH systems quiz. Try Reload.</p><p class="muted small">${esc(err && err.message)}</p></div>`);
      });
      return true;
    }
    return orig(parts);
  };
  X.cthQuiz = { load, version: '25.3' };
})();
