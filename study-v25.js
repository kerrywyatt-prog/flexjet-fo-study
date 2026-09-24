/* FO Study v25 — training-path restructure: Home dashboard, Indoc hub, Checkride Prep, Drill (flashcards/quiz),
   Checklists, Bulletins, Search, Gaps. Loaded BEFORE app-v5.js; app-v5.js calls FOStudyExt.route(parts) from render().
   Content comes from data/*.json (study.json, limitations.json, systems.json, indoc-days.json, memory-items.json,
   135-recurrent-qa.json). Excluded-topic rules: see README. Memory items are rendered word-for-word from memory-items.json. */
(() => {
  const V = 25;
  const WHATS_NEW = 'v25 · Site rebuilt around the training path: Where-am-I dashboard, Checkride Prep (maneuvers, flows/callouts, memory items, limitations, systems, MEL, FMS, 68 Q&A), checklists, drills, and search across everything.';
  const TIMELINE = [
    { id: 'indoc', title: 'Indoc', when: 'Sep 21–24, 2026', start: '2026-09-21', end: '2026-09-23', path: '/indoc' },
    { id: 'exam', title: '135 exam (50Q, open-book)', when: 'Sun Sep 27, 2026', start: '2026-09-24', end: '2026-09-27', path: '/indoc/135' },
    { id: 'simcom', title: 'SIMCOM Initial', when: 'Sep 29 – Nov 7, 2026', start: '2026-09-28', end: '2026-11-07', path: '/checkride' },
    { id: 'check', title: 'Checkride', when: 'End of SIMCOM (date TBD)', start: '2026-11-08', end: '2026-11-21', path: '/checkride/structure' },
    { id: 'ioe', title: 'IOE', when: 'After the checkride (TBD)', start: '2026-11-22', end: '2027-12-31', path: '/checklists' },
  ];
  const VTAG = '<span class="vtag">verify vs AFM/AOM when available</span>';
  const cache = {};
  const F = () => window.FOStudy;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const strip = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  const chev = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';

  async function getJSON(name, optional) {
    if (name in cache) return cache[name];
    try {
      const r = await fetch('data/' + name + '?v=' + V, { cache: 'no-cache' });
      if (!r.ok) throw new Error(r.status);
      cache[name] = await r.json();
    } catch (e) {
      if (!optional) console.warn('load failed', name, e);
      cache[name] = null;
    }
    return cache[name];
  }
  const study = () => getJSON('study.json');
  const limits = () => getJSON('limitations.json', true);
  const systems = () => getJSON('systems.json', true);
  const indocDays = () => getJSON('indoc-days.json');
  const memDeck = () => F().loadMemoryDeck();
  const bank135 = () => F().loadRecurrentBank();

  // ---------- shell ----------
  const TABS = [
    { path: '/', label: 'Home', icon: '⌂', root: '' },
    { path: '/indoc', label: 'Indoc', icon: '📚', root: 'indoc' },
    { path: '/checkride', label: 'Checkride', icon: '🛫', root: 'checkride' },
    { path: '/drill', label: 'Drill', icon: '🃏', root: 'drill' },
    { path: '/search', label: 'Search', icon: '🔎', root: 'search' },
  ];
  function tabbar() {
    const root = F().parseHash().parts[0] || '';
    const active = ['checklists', 'bulletins', 'gaps', 'praetor', 'flashcards'].includes(root) ? 'checkride' : root;
    return `<nav class="tabbar" aria-label="Main">${TABS.map(t => `
      <button type="button" class="tab ${t.root === active ? 'on' : ''}" data-nav="${t.path}" aria-label="${t.label}">
        <span class="ti" aria-hidden="true">${t.icon}</span><span class="tl">${t.label}</span></button>`).join('')}</nav>`;
  }
  function page(title, crumb, back, body, cls = '') {
    const f = F();
    f.app.innerHTML = `<div class="${f.shellClass()} has-tabbar v25 ${cls}">${f.topbar(title, crumb, back)}
      <main class="content v25-content">${body}</main>${tabbar()}</div>`;
    f.bindNav();
    bindLocal();
  }
  function loading(title, crumb, back) { page(title, crumb, back, '<div class="card"><p class="muted">Loading…</p></div>'); }
  function bindLocal() {
    const f = F();
    f.app.querySelectorAll('a[data-nav]').forEach(a => a.setAttribute('href', '#' + a.getAttribute('data-nav')));
  }
  function focusTarget(id) {
    if (!id) { window.scrollTo(0, 0); return; }
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) { window.scrollTo(0, 0); return; }
      if (el.tagName === 'DETAILS') el.open = true;
      el.classList.add('hl');
      el.scrollIntoView({ block: 'start' });
      window.scrollBy(0, -76);
    });
  }
  const row = (path, name, meta, extra = '') => `
    <button type="button" class="shelf-item" data-nav="${path}"><span class="name">${name}</span>
      <span class="meta">${meta || ''}</span>${extra}${chev}</button>`;
  const list = (rows) => `<div class="shelf-list">${rows.join('')}</div>`;
  const label = (t) => `<p class="section-label">${t}</p>`;
  const card = (title, html, id = '') => `<div class="card"${id ? ` id="${id}"` : ''}>${title ? `<h3><span class="dot"></span>${title}</h3>` : ''}<div class="rich">${html}</div></div>`;
  const pendingNote = (what) => `<div class="card loadnote"><p>⏳ <b>Loading content.</b> ${what} is being compiled from the CTH/CFM/MEL and will appear after the next update.</p></div>`;

  // ---------- where am I ----------
  function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function phase() {
    const t = today();
    let cur = TIMELINE.find(p => t >= p.start && t <= p.end);
    if (!cur) cur = t < TIMELINE[0].start ? TIMELINE[0] : TIMELINE[TIMELINE.length - 1];
    return cur;
  }
  function dayIndex() { return Math.floor(Date.now() / 86400000); }
  function studyToday(sys) {
    const p = phase().id;
    const chs = (sys && sys.systems) ? sys.systems : [];
    const sysPick = chs.length ? chs[dayIndex() % chs.length] : null;
    const sysLink = sysPick ? { path: '/drill/systems/' + sysPick.id, t: `Systems of the day: ${esc(sysPick.title)}`, d: `AOM ${esc(sysPick.aom_chapter || '')} · ${(sysPick.cards || []).length} cards` }
                            : { path: '/checkride/systems', t: 'Systems', d: 'CTH §7 by AOM chapter' };
    const L = {
      bank: { path: '/indoc/135/quiz', t: '135 mock quiz', d: '50Q · pass 80% · word-for-word bank' },
      flags: { path: '/indoc/flags', t: 'Instructor "on the test" flags', d: '25 items + table smacks' },
      iai: { path: '/flashcards', t: 'Memory items (IAI)', d: 'Word-for-word flashcards' },
      lim: { path: '/drill/limits', t: 'Limitations drill', d: 'CTH §5 / CFM cards with cites' },
      calls: { path: '/drill/callouts', t: 'Callout drill', d: 'CFM Rev 3.3 profiles' },
      flows: { path: '/drill/flows', t: 'Flow drill', d: 'The 9 CFM flows' },
      man: { path: '/drill/maneuvers', t: 'Maneuver cards', d: '29 cards · ACS + callouts' },
      qa: { path: '/drill/qa', t: 'Checkride Q&A', d: '68 oral-style questions' },
      cl: { path: '/checklists', t: 'Normal checklist', d: 'Both S/N versions' },
      sys: sysLink,
    };
    const pick = { indoc: ['bank', 'flags', 'iai', 'lim'], exam: ['bank', 'flags', 'iai', 'lim'],
      simcom: ['iai', 'lim', 'sys', 'calls', 'flows', 'man'], check: ['qa', 'man', 'iai', 'lim', 'calls', 'sys'], ioe: ['cl', 'flows', 'calls', 'lim'] }[p];
    return pick.map(k => L[k]);
  }

  async function viewHome() {
    const sys = await systems();
    const cur = phase(), t = today();
    const tl = TIMELINE.map(p => {
      const st = t > p.end ? 'done' : (p.id === cur.id ? 'now' : 'next');
      return `<button type="button" class="tl-step ${st}" data-nav="${p.path}"><span class="tl-dot">${st === 'done' ? '✓' : ''}</span>
        <span class="tl-body"><b>${esc(p.title)}</b><small>${esc(p.when)}</small></span>${st === 'now' ? '<span class="badge now">You are here</span>' : ''}</button>`;
    }).join('');
    const st = studyToday(sys);
    page('FO Study', 'Kerry Wyatt · Flexjet Praetor', null, `
      <form class="home-search" data-search-form><input type="search" placeholder="Search everything (e.g. crosswind, XFEED, EAP6-3)" aria-label="Search" /><button class="btn btn-primary" type="submit">Search</button></form>
      <div class="card whereami"><h3><span class="dot"></span>Where am I</h3><div class="timeline">${tl}</div></div>
      ${label('Study today · ' + esc(cur.title))}
      <div class="tiles today">${st.map(x => `<button type="button" class="tile" data-nav="${x.path}"><div class="tile-body"><h3>${x.t}</h3><p>${x.d}</p></div><span class="tile-chevron">${chev}</span></button>`).join('')}</div>
      ${label('Training path')}
      ${list([
        row('/indoc', '📚 Indoc', 'Days 1–4 · 135 bank · instructor flags'),
        row('/checkride', '🛫 Checkride Prep', 'Structure · maneuvers · flows · limits · systems · Q&A'),
        row('/checklists', '✅ Checklists', 'Normal (both S/N) · walkaround · HP cart · flows'),
        row('/drill', '🃏 Drill', 'Flashcards & quizzes for every deck'),
        row('/bulletins', '📄 Bulletins', 'Operational Bulletin (HYD LO QTY)'),
        row('/fleet-map', '🗺️ Tail Tracker', 'Fleet map + roster'),
        row('/gaps', '⏳ Gaps & conflicts', 'What has no source yet · ask-instructor list'),
      ])}
      ${label('More')}
      ${list([row('/orientation', 'New hire / Orientation', 'CLE Days 1–3'), row('/ritual', 'Study ritual', '20–30 min daily'), row('/admin', 'Admin / open items', 'Checklist'), row('/praetor/notes', 'Personal notes', 'This device only')])}
      <p class="whatsnew"><b>What's new</b> — ${esc(WHATS_NEW)}</p>`, 'home25');
    bindSearchForm();
  }
  function bindSearchForm() {
    F().app.querySelectorAll('[data-search-form]').forEach(f => f.addEventListener('submit', (e) => {
      e.preventDefault(); const q = f.querySelector('input').value.trim(); F().go('/search/' + encodeURIComponent(q));
    }));
  }

  // ---------- Indoc ----------
  async function viewIndocHub() {
    const days = await indocDays();
    const d = days ? days.days : {};
    page('Indoc · DFW', 'Home', '/', `
      <div class="card"><h3><span class="dot"></span>Indoc complete · Sep 21–24</h3><p>Next: the Sunday 50-question open-book 135 exam, then SIMCOM Initial (Sep 29 – Nov 7).</p></div>
      ${label('Exam prep')}
      ${list([row('/indoc/135', '135 Recurrent bank', '201Q study · 50Q mock · pass 80%'), row('/indoc/flags', 'Instructor flags & table smacks', '25 items · 14 covered · 8 partial · 3 not in bank'), row('/drill/flags', 'Drill the instructor flags', 'Flashcards')])}
      ${label('Day notes')}
      ${list(Object.keys(d).map(k => row('/indoc/day/' + k, esc(d[k].title), esc(d[k].date))))}
      ${label('Ops Specs A–E')}
      ${list(Object.entries(F().INDOC_AE).map(([k, v]) => row('/indoc/' + k, esc(v.title), esc(v.blurb.slice(0, 44)) + '…')))}`);
  }
  async function viewIndocDay(n) {
    const days = await indocDays();
    const d = days && days.days[n];
    if (!d) return viewIndocHub();
    const nav = `<div class="pager">${days.days[n - 1] ? `<button class="btn btn-ghost" data-nav="/indoc/day/${n - 1}">‹ Day ${n - 1}</button>` : '<span></span>'}${days.days[n + 1] ? `<button class="btn btn-ghost" data-nav="/indoc/day/${n + 1}">Day ${n + 1} ›</button>` : '<span></span>'}</div>`;
    page('Day ' + n, 'Indoc', '/indoc', `<p class="muted small">${esc(d.date)} · ${esc(days.source)}</p><div class="indoc-day">${d.html}</div>${nav}`);
  }
  async function viewIndocFlags(target) {
    loading('Instructor flags', 'Indoc', '/indoc');
    const s = await study(); const f = s.indocFlags;
    page('Instructor flags', 'Indoc', '/indoc', `
      <div class="card"><p><b>${esc(f.summary)}</b></p><div class="btnrow"><button class="btn btn-primary" data-nav="/drill/flags">Drill flags</button><button class="btn btn-ghost" data-nav="/indoc/135/quiz">135 mock quiz</button></div></div>
      ${card('What the instructors said about the exam', f.examContext)}
      ${label('The 25 flagged items')}
      ${f.items.map(it => `<details class="qa" id="flag-${it.n}"><summary><span class="qn">#${it.n}</span> ${it.item} <span class="chip st-${slug(it.status)}">${esc(it.status)}</span></summary>
        <div class="rich"><p><b>Said:</b> ${it.said}</p><p><b>Where:</b> ${it.where} · <b>Cue:</b> ${it.cue}</p><p><b>135 bank:</b> ${it.bank}</p></div></details>`).join('')}
      ${card('⚠ Bank vs instructor conflicts', f.conflicts)}
      ${card('Not in the bank', f.notInBank)}
      ${card('Explicitly "not on the test"', f.notOnTest)}
      ${card('Table smacks — confirmed', f.smackConfirmed)}
      ${card('Table smacks — possible (not counted)', f.smackPossible)}
      ${card('Bottom line', f.smackBottom)}`);
    focusTarget(target);
  }

  // ---------- Checkride hub + pages ----------
  async function viewCheckride() {
    const s = await study(); const lim = await limits(); const sys = await systems();
    const nL = lim ? lim.categories.reduce((a, c) => a + c.items.length, 0) : 0;
    const nS = sys ? sys.systems.reduce((a, c) => a + (c.cards || []).length, 0) : 0;
    page('Checkride Prep', 'Praetor 500/600', '/', `
      <div class="card"><p>Your SIMCOM Initial / type-ride prep, built from the CTH Rev 2.5, CFM Rev 3.3, ACS, MEL Rev 14 and your Indoc notes. Every line is cited. ${VTAG}</p>
      <div class="btnrow"><button class="btn btn-primary" data-nav="/drill">Drill</button><button class="btn btn-ghost" data-nav="/search">Search</button></div></div>
      ${label('Know the check')}
      ${list([row('/checkride/structure', 'What the check consists of', s.structure.length + ' sections'), row('/checkride/oral-flags', 'Instructor-flagged oral topics', s.orFlagCards.length + ' topics')])}
      ${label('Fly it')}
      ${list([row('/checkride/maneuvers', 'Maneuver cards', s.maneuvers.length + ' cards · ACS + callouts'), row('/checkride/flows', 'Flows & callouts', s.flows.length + ' flows · ' + s.callouts.length + ' callouts'), row('/checkride/memory', 'Memory items (IAI)', 'Word-for-word'), row('/checklists', 'Checklists', 'Normal · walkaround · HP cart')])}
      ${label('Know it')}
      ${list([row('/checkride/limits', 'Limitations', lim ? nL + ' cards · ' + lim.categories.length + ' categories' : 'loading content'), row('/checkride/systems', 'Systems', sys ? nS + ' cards · ' + sys.systems.length + ' systems' : 'loading content'), row('/checkride/mel', 'MEL / NEF', s.mel.length + ' topics'), row('/checkride/fms', 'FMS (Collins Pro Line Fusion)', 'Brief notes'), row('/checkride/qa', 'Oral Q&A', s.qa.length + ' questions'), row('/bulletins', 'Operational Bulletins', 'HYD LO QTY')])}
      ${label('Sources')}
      ${list([row('/gaps', 'Gaps, PENDING & conflicts', s.pending.length + ' pending')])}`);
  }
  async function viewStructure() {
    const s = await study();
    page('The checkride', 'Checkride Prep', '/checkride', s.structure.map(x => card(esc(x.title), x.html, x.id)).join(''));
  }
  async function viewOralFlags() {
    const s = await study();
    page('Oral flags', 'Checkride Prep', '/checkride', s.orFlagCards.map(g => `<div class="card" id="${g.id}"><h3><span class="dot"></span>${g.id} · ${g.topic}</h3><div class="rich"><p><b>Said:</b> ${g.said}</p><p><b>Prep:</b> ${g.prep}</p></div></div>`).join('') + card('CTH §3 check-airman emphasis', s.orFlagsCTH));
  }
  async function viewManeuvers(n) {
    const s = await study();
    if (n) {
      const i = s.maneuvers.findIndex(m => m.n === n); const m = s.maneuvers[i];
      if (!m) return viewManeuvers();
      const prev = s.maneuvers[i - 1], next = s.maneuvers[i + 1];
      page(`${m.n}. ${m.title}`, 'Maneuvers', '/checkride/maneuvers', `
        <div class="chips">${m.acs.map(a => `<span class="chip">${esc(a)}</span>`).join('')}${m.pending ? '<span class="chip pend">⏳ has PENDING items</span>' : ''}${m.conflict ? '<span class="chip conf">⚠ conflict</span>' : ''}</div>
        <div class="card"><div class="rich">${m.html}</div></div>
        <div class="pager">${prev ? `<button class="btn btn-ghost" data-nav="/checkride/maneuvers/${prev.n}">‹ ${prev.n}</button>` : '<span></span>'}<button class="btn btn-primary" data-nav="/drill/maneuvers">Drill</button>${next ? `<button class="btn btn-ghost" data-nav="/checkride/maneuvers/${next.n}">${next.n} ›</button>` : '<span></span>'}</div>`);
      return;
    }
    page('Maneuver cards', 'Checkride Prep', '/checkride', `<div class="card rich">${s.maneuversIntro}<div class="btnrow"><button class="btn btn-primary" data-nav="/drill/maneuvers">Drill all ${s.maneuvers.length}</button></div></div>
      ${list(s.maneuvers.map(m => row('/checkride/maneuvers/' + m.n, `${m.n}. ${esc(m.title)}`, m.acs.join(' ') + (m.conflict ? ' ⚠' : ''))))}`);
  }
  async function viewFlows(target) {
    const s = await study();
    page('Flows & callouts', 'Checkride Prep', '/checkride', `
      <div class="btnrow"><button class="btn btn-primary" data-nav="/drill/flows">Drill flows</button><button class="btn btn-primary" data-nav="/drill/callouts">Drill callouts</button></div>
      ${card(esc(s.flowRules.title), s.flowRules.html)}
      ${label('The 9 flows (CFM Rev 3.3)')}
      ${s.flows.map(f => `<div class="card flow" id="flow-${f.n}"><h3><span class="dot"></span>${f.n}. ${esc(f.name)} <span class="chip">${f.whoHtml}</span></h3><ol>${f.items.map(i => `<li>${i}</li>`).join('')}</ol><p class="cite">[CFM p.${esc(f.page)}]</p></div>`).join('')}
      <div class="card rich">${s.flowsAfter}</div>
      ${label('Callouts')}
      <div class="card" id="callouts"><div class="tbl"><table><thead><tr><th>When</th><th>Call</th><th>CFM</th></tr></thead><tbody>${s.callouts.map(c => `<tr><td>${c.trigger}</td><td>${c.call}</td><td>p.${esc(c.page)}</td></tr>`).join('')}</tbody></table></div></div>`);
    focusTarget(target);
  }
  async function viewMemory(target) {
    const s = await study(); const deck = await memDeck();
    page('Memory items', 'Checkride Prep', '/checkride', `
      <div class="card"><p>Immediate Action Items, word-for-word (CTH Rev 2.5 §4 pp.14–15). Never paraphrase.</p><div class="btnrow"><button class="btn btn-primary" data-nav="/flashcards">IAI flashcards</button></div></div>
      ${deck.cards.map(c => `<div class="card iai" id="iai-${esc(c.id)}"><h3><span class="banner-dot banner-${esc(c.banner || 'black')}"></span>${esc(c.title)}</h3>${c.condition ? `<p class="fc-condition">${esc(c.condition)}</p>` : ''}<ol class="fc-steps">${c.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>${(c.notes || []).length ? `<ul class="fc-notes">${c.notes.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</div>`).join('')}
      ${card('How to drill them', s.memoryDrill)}`);
    focusTarget(target);
  }
  function conflictHtml(c) {
    if (!c) return '';
    return `<div class="conflict"><b>⚠ conflict — ask instructor</b><div>Other value: ${esc(c.other_value || '')}${c.other_cite ? ` <span class="cite">[${esc(c.other_cite)}]</span>` : ''}</div>${c.note ? `<div class="muted small">${esc(c.note)}</div>` : ''}</div>`;
  }
  async function viewLimits(sub, target) {
    const lim = await limits();
    if (!lim) return page('Limitations', 'Checkride Prep', '/checkride', pendingNote('The limitations set (CTH §5, CFM §4, MEL numbers)'));
    const cats = lim.categories;
    let catId = sub;
    if (sub && !cats.find(c => c.id === sub)) { const c = cats.find(c => c.items.some(i => i.id === sub)); if (c) { catId = c.id; target = 'lim-' + sub; } }
    const c = catId && cats.find(c => c.id === catId);
    if (c) {
      page(c.title, 'Limitations', '/checkride/limits', `
        <div class="btnrow"><button class="btn btn-primary" data-nav="/drill/limits/${esc(c.id)}">Drill this category (${c.items.length})</button></div>
        ${c.items.map(i => `<div class="card limcard" id="lim-${esc(i.id)}"><div class="lim-label">${esc(i.label)}</div><div class="lim-value">${esc(i.value)}</div>
          <div class="lim-foot"><span class="cite">[${esc(i.cite)}]</span>${i.verify_tag ? VTAG : ''}</div>${conflictHtml(i.conflict)}</div>`).join('')}`);
      return focusTarget(target);
    }
    const n = cats.reduce((a, c) => a + c.items.length, 0), nc = cats.reduce((a, c) => a + c.items.filter(i => i.conflict).length, 0);
    page('Limitations', 'Checkride Prep', '/checkride', `
      <div class="card"><p>${n} limitation cards from the CTH §5, CFM §4 and MEL, each with a page cite. ${VTAG} Conflicts show both values: <span class="conf">conflict — ask instructor</span>.</p>
      <div class="btnrow"><button class="btn btn-primary" data-nav="/drill/limits">Drill all ${n}</button>${nc ? `<button class="btn btn-ghost" data-nav="/drill/limits/conflicts">Conflicts (${nc})</button>` : ''}</div></div>
      ${list(cats.map(c => row('/checkride/limits/' + c.id, esc(c.title), c.items.length + ' cards' + (c.items.some(i => i.conflict) ? ' · ⚠' : ''))))}`);
  }
  async function viewSystems(sub, target) {
    const sys = await systems();
    if (!sys) return page('Systems', 'Checkride Prep', '/checkride', pendingNote('The systems set (CTH §7 review questions by AOM chapter, with MEL and OB notes)'));
    let sid = sub;
    if (sub && !sys.systems.find(x => x.id === sub)) { const x = sys.systems.find(x => (x.cards || []).some(c => c.id === sub)); if (x) { sid = x.id; target = 'sys-' + sub; } }
    const x = sid && sys.systems.find(y => y.id === sid);
    if (x) {
      const pts = (a) => (a || []).map(p => `<li>${esc(p.text)} <span class="cite">[${esc(p.cite)}]</span></li>`).join('');
      page(x.title, 'Systems · AOM ' + (x.aom_chapter || ''), '/checkride/systems', `
        <div class="card"><p>${VTAG}</p><div class="btnrow"><button class="btn btn-primary" data-nav="/drill/systems/${esc(x.id)}">Drill ${(x.cards || []).length} cards</button></div></div>
        ${(x.summary_points || []).length ? `<div class="card"><h3><span class="dot"></span>Key points</h3><ul>${pts(x.summary_points)}</ul></div>` : ''}
        ${(x.mel_notes || []).length ? `<div class="card"><h3><span class="dot"></span>MEL notes</h3><ul>${pts(x.mel_notes)}</ul></div>` : ''}
        ${(x.ob_notes || []).length ? `<div class="card"><h3><span class="dot"></span>Operational Bulletin notes</h3><ul>${pts(x.ob_notes)}</ul><button class="btn btn-ghost" data-nav="/bulletins">Bulletins</button></div>` : ''}
        ${label('Review questions (tap to reveal)')}
        ${(x.cards || []).map(c => `<details class="qa" id="sys-${esc(c.id)}"><summary>${esc(c.q)}</summary><div class="rich"><p>${esc(c.a)}</p><p class="cite">(${esc(c.cite)})</p></div></details>`).join('')}`);
      return focusTarget(target);
    }
    const n = sys.systems.reduce((a, c) => a + (c.cards || []).length, 0);
    page('Systems', 'Checkride Prep', '/checkride', `
      <div class="card"><p>${n} systems cards from the CTH §7 review questions, grouped by AOM chapter. Cites read “(CTH, citing AOM 9-xx-xx)”. ${VTAG}</p>
      <div class="btnrow"><button class="btn btn-primary" data-nav="/drill/systems">Drill all ${n}</button></div></div>
      ${list(sys.systems.map(x => row('/checkride/systems/' + x.id, esc(x.title), `AOM ${esc(x.aom_chapter || '—')} · ${(x.cards || []).length} cards`)))}`);
  }
  async function viewMEL(target) {
    const s = await study();
    page('MEL / NEF', 'Checkride Prep', '/checkride', `<div class="card rich">${s.melIntro}</div>${s.mel.map(m => card(esc(m.title), m.html, m.id)).join('')}`);
    focusTarget(target);
  }
  async function viewFMS() {
    const s = await study();
    page('FMS notes', 'Checkride Prep', '/checkride', `<div class="card"><p class="muted small">Brief, cited notes only (Collins Pro Line Fusion Operator's Guide, 3rd Ed 2019). The CFM governs.</p><div class="rich">${s.fms}</div></div>`);
  }
  async function viewQA(n) {
    const s = await study();
    const tags = [...new Set(s.qa.flatMap(q => q.tags))];
    page('Oral Q&A', 'Checkride Prep', '/checkride', `
      <div class="card rich">${s.qaIntro}<div class="btnrow"><button class="btn btn-primary" data-nav="/drill/qa">Quiz all ${s.qa.length}</button></div></div>
      <div class="chips">${tags.map(t => `<button class="chip btnchip" data-nav="/drill/qa/${esc(t)}">${esc(t)} (${s.qa.filter(q => q.tags.includes(t)).length})</button>`).join('')}</div>
      ${s.qa.map(q => `<details class="qa" id="qa-${q.n}"><summary><span class="qn">Q${q.n}</span> ${q.q}</summary><div class="rich"><p>${q.a}</p><p class="chips">${q.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</p></div></details>`).join('')}`);
    focusTarget(n ? 'qa-' + n : null);
  }

  // ---------- checklists ----------
  function clSection(s, uniqLabel) {
    const items = (s.items || []).map(i => `<div class="cl-row${i.only ? ' only' : ''}"><span class="cl-item">${esc(i.item)}${i.who ? ` <span class="cl-who">${esc(i.who)}</span>` : ''}${i.only ? ` <span class="chip uniq">${uniqLabel}</span>` : ''}</span><span class="cl-dots"></span><span class="cl-resp">${esc(i.resp)}</span>${i.note ? `<div class="cl-note">${esc(i.note)}</div>` : ''}</div>`).join('');
    const text = (s.text || []).map(t => `<p class="cl-text">${esc(t)}</p>`).join('');
    const notes = (s.notes || []).map(t => `<p class="cl-note">${esc(t)}</p>`).join('');
    return `<div class="card cl-sec" id="cl-${esc(s.id)}"><h3>${s.group ? `<small>${esc(s.group)} · </small>` : ''}${esc(s.title)}</h3>${s.intro ? `<p class="cl-text">${esc(s.intro)}</p>` : ''}${items}${text}${notes}${s.complete ? `<p class="cl-complete">“${esc(s.complete)}”</p>` : ''}</div>`;
  }
  async function viewChecklists(kind, sub, target) {
    const s = await study(); const C = s.checklists;
    const eff = '<div class="note">Use the version that applies to your aircraft per company guidance. This site does <b>not</b> map tail numbers or serials to checklist versions.</div>';
    if (kind === 'normal' && C.normal[sub]) {
      const c = C.normal[sub], other = sub === '10069' ? '10070' : '10069';
      page(sub === '10069' ? 'Normal · S/N 10069 & below' : 'Normal · S/N 10070 & above', 'Checklists', '/checklists', `
        <div class="card"><p><b>${esc(c.title)}</b> · ${esc(c.rev)}</p>${eff}<div class="btnrow"><button class="btn btn-ghost" data-nav="/checklists/normal/${other}">Switch to S/N ${other === '10069' ? '10069 & below' : '10070 & above'}</button></div></div>
        <div class="chips jump">${c.sections.map(x => `<a class="chip" data-nav="/checklists/normal/${sub}/${esc(x.id)}">${esc(x.title)}</a>`).join('')}</div>
        ${c.sections.map(x => clSection(x, 'only in this version')).join('')}`);
      return focusTarget(target ? 'cl-' + target : null);
    }
    if (kind === 'walkaround' || kind === 'hpcart') {
      const c = C[kind];
      page(kind === 'hpcart' ? 'HP cart start' : 'Walkaround', 'Checklists', '/checklists', `<div class="card"><p><b>${esc(c.title)}</b> · ${esc(c.rev)}</p></div>
        <div class="chips jump">${c.sections.map(x => `<a class="chip" data-nav="/checklists/${kind}/${esc(x.id)}">${esc(x.title)}</a>`).join('')}</div>${c.sections.map(x => clSection(x, '')).join('')}`);
      return focusTarget(sub ? 'cl-' + sub : null);
    }
    page('Checklists', 'Home', '/', `${eff}
      ${label('Normal procedures (Rev 3.2)')}
      ${list([row('/checklists/normal/10069', 'S/N 10069 & below', C.normal['10069'].sections.length + ' sections'), row('/checklists/normal/10070', 'S/N 10070 & above', C.normal['10070'].sections.length + ' sections · adds LAV DOOR (After Takeoff)')])}
      ${label('Ground')}
      ${list([row('/checklists/walkaround', 'Aircraft prep / walkaround', C.walkaround.rev), row('/checklists/hpcart', 'HP cart start (Legacy 450 / Praetor 500)', C.hpcart.sections.length + ' parts')])}
      ${label('Flows')}
      ${list([row('/checkride/flows', 'The 9 CFM flows + callouts', s.flows.length + ' flows'), row('/drill/flows', 'Drill the flows', 'Flashcards')])}`);
  }

  // ---------- bulletins / gaps ----------
  async function viewBulletins() {
    const s = await study();
    page('Bulletins', 'Home', '/', s.bulletins.map(b => `<div class="card" id="ob-${b.id}"><h3><span class="dot"></span>${b.numbers.map(esc).join(' · ')}</h3>
      <p class="muted small">${esc(b.date)} · ${esc(b.subject)}</p><p><b>Why:</b> ${esc(b.reason)}</p><p><b>Background:</b> ${esc(b.background)}</p><p><b>Crew action:</b> ${esc(b.action)}</p>
      <p class="cite">[${esc(b.cite)}]</p><p class="pendline">⏳ ${esc(b.pending)}</p><div class="btnrow"><button class="btn btn-primary" data-nav="/drill/ob">Drill (${b.drill.length})</button></div></div>`).join(''));
  }
  async function viewGaps() {
    const s = await study(); const lim = await limits();
    const conf = lim ? lim.categories.flatMap(c => c.items.filter(i => i.conflict).map(i => ({ c, i }))) : [];
    page('Gaps & conflicts', 'Home', '/', `
      <div class="card rich">${s.pendingNote}</div>
      ${label('⏳ PENDING — no source on file')}
      ${s.pending.map(p => `<div class="card pendcard"><p><b>${p.item}</b></p><p class="muted small">Needs: ${p.fills}</p></div>`).join('')}
      ${label('⚠ Conflicts — ask the instructor')}
      ${conf.length ? list(conf.map(({ c, i }) => row('/checkride/limits/' + i.id, esc(i.label), esc(c.title)))) : '<p class="muted small">Limitation conflicts load with the limitations set.</p>'}
      ${card('Other source notes', s.gaps)}
      ${card('Sources & cite keys', s.sources.html + s.sources.legend + s.sources.disclaimer)}`);
  }

  // ---------- drill engine ----------
  const DKEY = (id) => 'fo25_drill_' + id;
  const loadD = (id) => { try { return JSON.parse(localStorage.getItem(DKEY(id))) || null; } catch { return null; } };
  const saveD = (id, st) => { try { localStorage.setItem(DKEY(id), JSON.stringify(st)); } catch {} };
  async function deckFor(deck, sub) {
    const s = await study();
    if (deck === 'qa') {
      const qs = sub ? s.qa.filter(q => q.tags.includes(sub)) : s.qa;
      return { title: 'Oral Q&A' + (sub ? ' · ' + sub : ''), back: '/checkride/qa', cards: qs.map(q => ({ id: 'q' + q.n, front: `<div class="fc-section">Q${q.n} · ${q.tags.join(' ')}</div><h2 class="fc-q">${q.q}</h2>`, back: `<div class="rich">${q.a}</div>`, link: '/checkride/qa/' + q.n })) };
    }
    if (deck === 'maneuvers') return { title: 'Maneuver cards', back: '/checkride/maneuvers', cards: s.maneuvers.map(m => ({ id: 'm' + m.n, front: `<div class="fc-section">${m.acs.join(' ')}</div><h2 class="fc-q">${m.n}. ${esc(m.title)}</h2><p class="fc-hint">Recall: tolerances, callouts, flow, then reveal.</p>`, back: `<div class="rich">${m.html}</div>`, link: '/checkride/maneuvers/' + m.n })) };
    if (deck === 'callouts') return { title: 'Callout drill', back: '/checkride/flows', cards: s.callouts.map((c, i) => ({ id: 'c' + i, front: `<div class="fc-section">When…</div><h2 class="fc-q">${c.trigger}</h2>`, back: `<p class="fc-big">${c.call}</p><p class="cite">[CFM p.${esc(c.page)}]</p>`, link: '/checkride/flows/callouts' })) };
    if (deck === 'flows') return { title: 'Flow drill', back: '/checkride/flows', cards: s.flows.map(f => ({ id: 'f' + f.n, front: `<div class="fc-section">Flow ${f.n} · ${f.whoHtml}</div><h2 class="fc-q">${esc(f.name)}</h2><p class="fc-hint">Say every item in order.</p>`, back: `<ol class="fc-steps">${f.items.map(i => `<li>${i}</li>`).join('')}</ol><p class="cite">[CFM p.${esc(f.page)}]</p>`, link: '/checkride/flows/flow-' + f.n })) };
    if (deck === 'flags') return { title: 'Instructor flags', back: '/indoc/flags', cards: s.indocFlags.items.map(i => ({ id: 'g' + i.n, front: `<div class="fc-section">Flag #${i.n} · ${esc(i.status)}</div><h2 class="fc-q">${i.item}</h2>`, back: `<div class="rich"><p>${i.said}</p><p><b>135 bank:</b> ${i.bank}</p></div>`, link: '/indoc/flags/' + i.n })) };
    if (deck === 'ob') return { title: 'Bulletin drill', back: '/bulletins', cards: s.bulletins.flatMap(b => b.drill.map((d, i) => ({ id: b.id + i, front: `<div class="fc-section">OB · HYD LO QTY</div><h2 class="fc-q">${esc(d[0])}</h2>`, back: `<p class="fc-big">${esc(d[1])}</p><p class="cite">[${esc(b.cite)}]</p>`, link: '/bulletins' }))) };
    if (deck === 'iai') {
      const d = await memDeck();
      return { title: 'Memory items', back: '/checkride/memory', cards: d.cards.map(c => ({ id: c.id, front: `<div class="fc-section">${esc(c.section || '')}</div><h2 class="fc-q">${esc(c.title)}</h2>`, back: `${c.condition ? `<p class="fc-condition">${esc(c.condition)}</p>` : ''}<ol class="fc-steps">${c.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>`, link: '/checkride/memory/' + c.id })) };
    }
    if (deck === 'limits') {
      const lim = await limits(); if (!lim) return { missing: 'The limitations set', back: '/checkride/limits' };
      let items = lim.categories.flatMap(c => c.items.map(i => ({ c, i })));
      if (sub === 'conflicts') items = items.filter(x => x.i.conflict); else if (sub) items = items.filter(x => x.c.id === sub);
      const cat = sub && lim.categories.find(c => c.id === sub);
      return { title: 'Limitations' + (cat ? ' · ' + cat.title : sub === 'conflicts' ? ' · conflicts' : ''), back: '/checkride/limits' + (cat ? '/' + cat.id : ''),
        cards: items.map(({ c, i }) => ({ id: i.id, front: `<div class="fc-section">${esc(c.title)}</div><h2 class="fc-q">${esc(i.label)}</h2>`, back: `<p class="fc-big">${esc(i.value)}</p><p class="cite">[${esc(i.cite)}]</p>${i.verify_tag ? VTAG : ''}${conflictHtml(i.conflict)}`, link: '/checkride/limits/' + i.id })) };
    }
    if (deck === 'systems') {
      const sys = await systems(); if (!sys) return { missing: 'The systems set', back: '/checkride/systems' };
      const pick = sub ? sys.systems.filter(x => x.id === sub || x.aom_chapter === sub) : sys.systems;
      return { title: 'Systems' + (sub && pick[0] ? ' · ' + pick[0].title : ''), back: '/checkride/systems' + (sub && pick.length === 1 ? '/' + pick[0].id : ''),
        cards: pick.flatMap(x => (x.cards || []).map(c => ({ id: c.id, front: `<div class="fc-section">${esc(x.title)} · AOM ${esc(x.aom_chapter || '')}</div><h2 class="fc-q">${esc(c.q)}</h2>`, back: `<p class="fc-big">${esc(c.a)}</p><p class="cite">(${esc(c.cite)})</p>${VTAG}`, link: '/checkride/systems/' + c.id }))) };
    }
    return null;
  }
  async function viewDrill(deck, sub) {
    if (!deck) return viewDrillHub();
    loading('Drill', 'Drill', '/drill');
    const D = await deckFor(deck, sub);
    if (!D) return viewDrillHub();
    if (D.missing) return page('Drill', 'Drill', '/drill', pendingNote(D.missing));
    const id = deck + (sub ? '_' + sub : '');
    const ids = D.cards.map(c => c.id);
    let st = loadD(id);
    if (!st || !Array.isArray(st.order) || st.order.some(x => !ids.includes(x)) || st.order.length === 0) st = { order: ids.slice(), i: 0, got: [], missed: [], mode: 'all' };
    const byId = Object.fromEntries(D.cards.map(c => [c.id, c]));
    let flipped = false;
    const paint = () => {
      saveD(id, st);
      const total = st.order.length;
      const done = st.i >= total;
      const pct = Math.round(100 * Math.min(st.i, total) / Math.max(total, 1));
      let body;
      if (done) {
        body = `<div class="card drill-done"><h3>Round complete</h3><p class="fc-big">${st.got.length} got it · ${st.missed.length} missed</p>
          <div class="btnrow">${st.missed.length ? `<button class="btn btn-primary" id="d-retry">Retry missed (${st.missed.length})</button>` : ''}<button class="btn btn-ghost" id="d-restart">Restart all (${ids.length})</button><button class="btn btn-ghost" id="d-shuffle">Shuffle & restart</button></div></div>`;
      } else {
        const c = byId[st.order[st.i]];
        body = `<div class="fc-toolbar"><span class="fc-progress">${st.i + 1} / ${total}${st.mode === 'missed' ? ' · missed only' : ''}</span><span class="drill-score">✓ ${st.got.length} · ✗ ${st.missed.length}</span></div>
          <div class="progress"><span style="width:${pct}%"></span></div>
          <div class="fc-card drill-card ${flipped ? 'is-flipped' : ''}" id="d-card" role="button" tabindex="0" aria-label="Reveal answer">
            <div class="d-front">${c.front}${flipped ? '' : '<p class="fc-hint">Tap to reveal</p>'}</div>
            ${flipped ? `<div class="d-back">${c.back}<p><a class="small" data-nav="${c.link}">Open in context ›</a></p></div>` : ''}</div>
          <div class="fc-nav drill-nav">${flipped ? `<button class="btn btn-miss" id="d-miss">✗ Missed</button><button class="btn btn-got" id="d-got">✓ Got it</button>` : `<button class="btn btn-ghost" id="d-prev" ${st.i ? '' : 'disabled'}>Prev</button><button class="btn btn-primary" id="d-flip">Reveal</button><button class="btn btn-ghost" id="d-skip">Skip</button>`}</div>
          <div class="btnrow small"><button class="btn btn-ghost" id="d-shuffle">Shuffle</button><button class="btn btn-ghost" id="d-restart">Restart</button></div>`;
      }
      page(D.title, 'Drill', D.back, `<div class="drill">${body}</div>`, 'drill25');
      const $ = (q) => F().app.querySelector(q);
      const flip = () => { flipped = !flipped; paint(); };
      const mark = (ok) => {
        const cid = st.order[st.i];
        st.got = st.got.filter(x => x !== cid); st.missed = st.missed.filter(x => x !== cid);
        (ok ? st.got : st.missed).push(cid); st.i++; flipped = false; paint();
      };
      $('#d-card')?.addEventListener('click', (e) => { if (e.target.closest('a')) return; if (!flipped) flip(); });
      $('#d-card')?.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!flipped) flip(); } });
      $('#d-flip')?.addEventListener('click', flip);
      $('#d-got')?.addEventListener('click', () => mark(true));
      $('#d-miss')?.addEventListener('click', () => mark(false));
      $('#d-prev')?.addEventListener('click', () => { if (st.i > 0) { st.i--; flipped = false; paint(); } });
      $('#d-skip')?.addEventListener('click', () => { st.order.push(st.order.splice(st.i, 1)[0]); flipped = false; paint(); });
      $('#d-retry')?.addEventListener('click', () => { st = { order: F().shuffleInPlace(st.missed.slice()), i: 0, got: [], missed: [], mode: 'missed' }; paint(); });
      $('#d-restart')?.addEventListener('click', () => { st = { order: ids.slice(), i: 0, got: [], missed: [], mode: 'all' }; flipped = false; paint(); });
      $('#d-shuffle')?.addEventListener('click', () => { st = { order: F().shuffleInPlace(ids.slice()), i: 0, got: [], missed: [], mode: 'all' }; flipped = false; paint(); });
    };
    paint();
  }
  async function viewDrillHub() {
    const s = await study(); const lim = await limits(); const sys = await systems();
    const prog = (id, n) => { const st = loadD(id); return st ? ` · ${st.got.length}/${n} ✓` : ''; };
    const nL = lim ? lim.categories.reduce((a, c) => a + c.items.length, 0) : 0;
    const nS = sys ? sys.systems.reduce((a, c) => a + (c.cards || []).length, 0) : 0;
    page('Drill', 'Flashcards & quizzes', '/', `
      <p class="muted small">Tap to reveal, then mark ✓ Got it or ✗ Missed. Progress is saved on this device; retry the missed ones at the end of a round.</p>
      ${label('Checkride')}
      ${list([
        row('/flashcards', 'Memory items (IAI)', 'Word-for-word flashcards'),
        row('/drill/limits', 'Limitations', lim ? nL + ' cards' + prog('limits', nL) : 'loading content'),
        row('/drill/systems', 'Systems (all)', sys ? nS + ' cards' + prog('systems', nS) : 'loading content'),
        row('/drill/callouts', 'Callouts', s.callouts.length + ' cards' + prog('callouts', s.callouts.length)),
        row('/drill/flows', 'Flows', s.flows.length + ' cards' + prog('flows', s.flows.length)),
        row('/drill/maneuvers', 'Maneuver cards', s.maneuvers.length + ' cards' + prog('maneuvers', s.maneuvers.length)),
        row('/drill/qa', 'Oral Q&A', s.qa.length + ' questions' + prog('qa', s.qa.length)),
        row('/drill/ob', 'Bulletin (HYD LO QTY)', '3 cards'),
      ])}
      ${sys ? label('Systems by AOM chapter') + list(sys.systems.map(x => row('/drill/systems/' + x.id, esc(x.title), `AOM ${esc(x.aom_chapter || '')} · ${(x.cards || []).length}` + prog('systems_' + x.id, (x.cards || []).length)))) : ''}
      ${lim ? label('Limitations by category') + list(lim.categories.map(c => row('/drill/limits/' + c.id, esc(c.title), c.items.length + prog('limits_' + c.id, c.items.length)))) : ''}
      ${label('Indoc')}
      ${list([row('/indoc/135/quiz', '135 mock quiz', '50Q · pass 80%'), row('/drill/flags', 'Instructor flags', '25 cards')])}`);
  }

  // ---------- search ----------
  let IDX = null;
  async function buildIndex() {
    if (IDX) return IDX;
    const s = await study(); const lim = await limits(); const sys = await systems(); const days = await indocDays();
    let deck = null, bank = null; try { deck = await memDeck(); } catch {} try { bank = await bank135(); } catch {}
    const E = [];
    const add = (kind, title, text, path) => E.push({ kind, title: strip(title), text: strip(text), path, x: (strip(title) + ' ' + strip(text)).toLowerCase() });
    s.qa.forEach(q => add('Checkride Q&A', 'Q' + q.n + ' ' + q.q, q.a, '/checkride/qa/' + q.n));
    s.maneuvers.forEach(m => add('Maneuvers', m.n + '. ' + m.title, m.html, '/checkride/maneuvers/' + m.n));
    s.flows.forEach(f => add('Flows', f.name + ' flow', f.items.join(' · '), '/checkride/flows/flow-' + f.n));
    s.callouts.forEach(c => add('Callouts', c.trigger, c.call + ' CFM p.' + c.page, '/checkride/flows/callouts'));
    s.structure.forEach(x => add('Checkride structure', x.title, x.html, '/checkride/structure'));
    s.orFlagCards.forEach(g => add('Oral flags', g.id + ' ' + g.topic, g.said + ' ' + g.prep, '/checkride/oral-flags'));
    s.mel.forEach(m => add('MEL / NEF', m.title, m.html, '/checkride/mel/' + m.id));
    add('FMS', 'FMS notes (Collins Pro Line Fusion)', s.fms, '/checkride/fms');
    s.bulletins.forEach(b => add('Bulletins', b.numbers.join(' / ') + ' ' + b.subject, b.action + ' ' + b.background, '/bulletins'));
    s.indocFlags.items.forEach(i => add('Instructor flags', '#' + i.n + ' ' + i.item, i.said + ' ' + i.bank, '/indoc/flags/' + i.n));
    s.pending.forEach(p => add('PENDING', p.item, 'Needs ' + p.fills, '/gaps'));
    const cl = (k, name, secs, base) => secs.forEach(x => add('Checklists', name + ' · ' + x.title, (x.items || []).map(i => i.item + ' ' + i.resp).join(' · ') + ' ' + (x.text || []).join(' ') + ' ' + (x.intro || ''), base + x.id));
    cl('n1', 'Normal S/N 10069 & below', s.checklists.normal['10069'].sections, '/checklists/normal/10069/');
    cl('n2', 'Normal S/N 10070 & above', s.checklists.normal['10070'].sections, '/checklists/normal/10070/');
    cl('w', 'Walkaround', s.checklists.walkaround.sections, '/checklists/walkaround/');
    cl('h', 'HP cart start', s.checklists.hpcart.sections, '/checklists/hpcart/');
    if (lim) lim.categories.forEach(c => c.items.forEach(i => add('Limitations', i.label, i.value + ' ' + i.cite + ' ' + c.title, '/checkride/limits/' + i.id)));
    if (sys) sys.systems.forEach(x => {
      (x.cards || []).forEach(c => add('Systems', c.q, c.a + ' ' + c.cite + ' ' + x.title, '/checkride/systems/' + c.id));
      [...(x.summary_points || []), ...(x.mel_notes || []), ...(x.ob_notes || [])].forEach(p => add('Systems', x.title, p.text + ' ' + p.cite, '/checkride/systems/' + x.id));
    });
    if (deck) deck.cards.forEach(c => add('Memory items', c.title, (c.condition || '') + ' ' + c.steps.join(' · '), '/checkride/memory/' + c.id));
    if (bank) bank.questions.forEach(q => add('135 bank', 'Q' + q.n + ' ' + q.q, Object.values(q.o).join(' · ') + ' ' + (q.e || ''), '/indoc/135/study/' + q.n));
    if (days) Object.entries(days.days).forEach(([n, d]) => {
      const div = document.createElement('div'); div.innerHTML = d.html;
      div.querySelectorAll('li, p').forEach(el => add('Indoc notes', 'Day ' + n + ' · ' + d.date, el.textContent, '/indoc/day/' + n));
    });
    Object.entries(F().INDOC_AE).forEach(([k, v]) => v.bullets.forEach(b => add('Ops Specs A–E', v.title, b, '/indoc/' + k)));
    IDX = E; return E;
  }
  function snippet(text, terms) {
    const low = text.toLowerCase(); let at = -1;
    for (const t of terms) { at = low.indexOf(t); if (at >= 0) break; }
    let s = text.slice(Math.max(0, at - 60), Math.max(0, at - 60) + 180);
    if (at > 60) s = '…' + s;
    let h = esc(s);
    terms.forEach(t => { if (t.length > 1) h = h.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); });
    return h;
  }
  async function viewSearch(q) {
    q = q || '';
    page('Search', 'All study content', '/', `<form class="home-search" data-search-form2><input type="search" id="s-q" value="${esc(q)}" placeholder="Search everything" aria-label="Search" autocomplete="off" /></form><div id="s-res"><p class="muted small">Indexing…</p></div>`);
    const E = await buildIndex();
    const input = F().app.querySelector('#s-q');
    const run = () => {
      const v = input.value.trim();
      history.replaceState(null, '', '#/search' + (v ? '/' + encodeURIComponent(v) : ''));
      const terms = v.toLowerCase().split(/\s+/).filter(Boolean);
      const host = F().app.querySelector('#s-res');
      if (!terms.length) { host.innerHTML = `<p class="muted small">${E.length} items indexed: checkride Q&A, maneuvers, flows, callouts, limitations, systems, memory items, checklists, MEL, bulletins, Indoc notes, instructor flags, 135 bank.</p>`; return; }
      const hits = E.map(e => { if (!terms.every(t => e.x.includes(t))) return null; const tl = e.title.toLowerCase(); return { e, sc: terms.reduce((a, t) => a + (tl.includes(t) ? 5 : 0) + 1, 0) }; }).filter(Boolean).sort((a, b) => b.sc - a.sc);
      const groups = {};
      hits.forEach(h => (groups[h.e.kind] = groups[h.e.kind] || []).push(h.e));
      host.innerHTML = hits.length ? `<p class="muted small">${hits.length} results</p>` + Object.entries(groups).map(([k, arr]) => `<p class="section-label">${esc(k)} (${arr.length})</p><div class="shelf-list">${arr.slice(0, 25).map(e => `<button type="button" class="shelf-item sres" data-nav="${esc(e.path)}"><span class="name">${snippet(e.title, terms)}<small>${snippet(e.text, terms)}</small></span>${chev}</button>`).join('')}</div>${arr.length > 25 ? `<p class="muted small">+${arr.length - 25} more — refine the search</p>` : ''}`).join('') : '<p class="muted">No matches.</p>';
      F().bindNav();
    };
    input.addEventListener('input', run);
    F().app.querySelector('[data-search-form2]').addEventListener('submit', (e) => { e.preventDefault(); input.blur(); });
    run();
    if (!q) input.focus();
  }

  // ---------- Praetor hub (legacy routes) ----------
  function viewPraetorHub() {
    page('Praetor 500/600', 'Aircraft', '/', list([
      row('/checkride', 'Checkride Prep', 'Everything for the type ride'), row('/praetor/memory', 'Memory items', '22 IAI cards'),
      row('/checkride/limits', 'Limitations', 'CTH §5 / CFM / MEL'), row('/checkride/systems', 'Systems', 'CTH §7 by AOM chapter'),
      row('/checkride/flows', 'Flows & callouts', 'CFM Rev 3.3'), row('/checklists', 'Checklists', 'Normal · walkaround · HP cart'), row('/praetor/notes', 'Personal notes', 'This device only')]));
  }

  // ---------- router ----------
  function route(parts) {
    const [a, b, c, d] = parts;
    const run = (p) => { Promise.resolve(p).catch(err => { console.error(err); page('Error', 'Home', '/', `<div class="card"><p>Could not load this page. Try Reload.</p><p class="muted small">${esc(err && err.message)}</p></div>`); }); return true; };
    if (!a) return run(viewHome());
    if (a === 'search') return run(viewSearch(b ? decodeURIComponent(parts.slice(1).join('/')) : ''));
    if (a === 'indoc') {
      if (!b) return run(viewIndocHub());
      if (b === 'day') return run(viewIndocDay(parseInt(c, 10)));
      if (b === 'flags') return run(viewIndocFlags(c ? 'flag-' + c : null));
      if (b === '135' && c === 'study' && d) {
        run(F().views.viewIndoc135Study().then(() => { const els = F().app.querySelectorAll(`[data-qn="${d}"]`); const el = els[els.length - 1]; if (el) { el.classList.add('hl'); el.scrollIntoView({ block: 'center' }); } }));
        return true;
      }
      return false;
    }
    if (a === 'checkride') {
      if (!b) return run(viewCheckride());
      if (b === 'structure') return run(viewStructure());
      if (b === 'oral-flags') return run(viewOralFlags());
      if (b === 'maneuvers') return run(viewManeuvers(c ? parseInt(c, 10) : null));
      if (b === 'flows') return run(viewFlows(c || null));
      if (b === 'memory') return run(viewMemory(c ? 'iai-' + c : null));
      if (b === 'limits') return run(viewLimits(c || null, null));
      if (b === 'systems') return run(viewSystems(c || null, null));
      if (b === 'mel') return run(viewMEL(c || null));
      if (b === 'fms') return run(viewFMS());
      if (b === 'qa') return run(viewQA(c ? parseInt(c, 10) : null));
      return run(viewCheckride());
    }
    if (a === 'drill') return run(viewDrill(b || null, c ? decodeURIComponent(c) : null));
    if (a === 'checklists') return run(viewChecklists(b || null, c || null, d || null));
    if (a === 'bulletins') return run(viewBulletins());
    if (a === 'gaps') return run(viewGaps());
    if (a === 'praetor') {
      if (!b) { viewPraetorHub(); return true; }
      if (b === 'limitations') { location.replace('#/checkride/limits'); return true; }
      if (b === 'flows') { location.replace('#/checkride/flows'); return true; }
      if (b === 'systems') { location.replace('#/checkride/systems'); return true; }
      return false;
    }
    return false;
  }
  window.FOStudyExt = { route, version: V };
})();
