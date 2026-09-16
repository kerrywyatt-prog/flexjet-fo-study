(() => {
  const PASSWORD = 'flexjet!';
  const UNLOCK_KEY = 'flexjet_fo_unlocked';
  const NOTES_PREFIX = 'flexjet_fo_notes_';
  const ADMIN_KEY = 'flexjet_fo_admin_items';

  const SYSTEMS = [
    'Electrical',
    'Fuel',
    'Hydraulics',
    'Flight Controls',
    'Avionics / FMS',
    'Pressurization / Env',
    'Ice Protection',
    'Landing Gear / Brakes',
    'Fire Protection',
    'Limitations',
  ];

  const ACFT = {
    phenom: { id: 'phenom', name: 'Embraer Phenom 300', short: 'Phenom 300' },
    praetor: { id: 'praetor', name: 'Embraer Praetor', short: 'Praetor' },
  };

  const DEFAULT_ADMIN = [
    { id: 'dinner', text: 'Thu Welcome Dinner 5:15p — Hyde Park Beachwood (on calendar)', done: true },
    { id: 'tolltag', text: 'DFW: TollTag/BlueDiamond + email CathyC@Flexjet.com before OE', done: false },
    { id: 'parking-spot', text: 'Parking Spot app + code BOMB1525', done: false },
    { id: 'ukg', text: 'Watch company email for UKG benefits enrollment', done: false },
    { id: 'uniform', text: 'A Cut Above order after fitting; update shipping; bomber jacket email', done: false },
    { id: 'concur', text: 'Wait for Concur email; finish MFA (Authenticator path)', done: false },
    { id: 'rental', text: 'Photo rental-car corporate codes; keep DL + preferred current', done: false },
  ];

  const $ = (sel, el = document) => el.querySelector(sel);
  const app = $('#app');

  function isUnlocked() {
    try { return sessionStorage.getItem(UNLOCK_KEY) === '1'; } catch { return false; }
  }
  function setUnlocked() {
    try { sessionStorage.setItem(UNLOCK_KEY, '1'); } catch {}
  }

  function parseHash() {
    const raw = (location.hash || '#/').replace(/^#/, '') || '/';
    const parts = raw.split('/').filter(Boolean);
    return { parts, path: '/' + parts.join('/') };
  }

  function go(path) {
    location.hash = path.startsWith('#') ? path : '#' + path;
  }

  function svg(name) {
    const icons = {
      plane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 16l8-3.5L22 6l-2 6-6 2.5L10 20l-1.5-4L2 16z"/></svg>',
      lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>',
      back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
      chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
      check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
    };
    return icons[name] || '';
  }

  function topbar(title, crumb, backTo) {
    return `
      <header class="topbar">
        ${backTo ? `<button class="back" type="button" data-nav="${backTo}" aria-label="Back">${svg('back')}</button>` : `<div style="width:12px"></div>`}
        <div class="titles">
          ${crumb ? `<div class="crumb">${esc(crumb)}</div>` : ''}
          <h1>${esc(title)}</h1>
        </div>
      </header>`;
  }

  
  function shellClass() {
    const { parts } = parseHash();
    const root = parts[0] || '';
    if (!root) return 'shell shell-home';
    if (root === 'phenom') return 'shell shell-phenom';
    if (root === 'praetor') return 'shell shell-praetor';
    if (root === 'orientation' || root === 'indoc' || root === 'ritual' || root === 'admin') return 'shell shell-aspire';
    return 'shell shell-home';
  }

function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ——— Views ——— */
  function viewGate() {
    app.innerHTML = `
      <div class="gate gate-hero">
        <div class="gate-mark" aria-hidden="true"><img src="icons/icon-192.png" alt="" width="72" height="72" /></div>
        <h1>FO Study</h1>
        <p class="sub">Private study framework for Kerry Wyatt<br/>Flexjet · First Officer track</p>
        <form id="gate-form" autocomplete="off">
          <label for="pw">Access password</label>
          <input id="pw" type="password" name="password" placeholder="Enter password" autofocus enterkeyhint="go" />
          <div class="error" id="gate-err"></div>
          <button class="btn btn-primary btn-block" type="submit">Unlock</button>
        </form>
        <p class="gate-foot">Session unlock · stored in this tab only</p>
      </div>`;
    $('#gate-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const val = ($('#pw').value || '').trim();
      if (val === PASSWORD) {
        setUnlocked();
        go('/');
        render();
      } else {
        $('#gate-err').textContent = 'Incorrect password';
        $('#pw').value = '';
        $('#pw').focus();
      }
    });
  }

  function viewHome() {
    const tiles = [
      { path: '/orientation', icon: '🧭', title: 'New hire / Orientation', desc: 'CLE Day 1–3 · dinner · parking · benefits', cls: '' },
      { path: '/indoc', icon: '📚', title: 'Indoc', desc: 'Ground school capture & encode loop', cls: '' },
      { path: '/phenom', icon: '✈️', title: 'Embraer Phenom 300', desc: 'Systems shelves · memory · flows', cls: 'gold', bg: 'phenom' },
      { path: '/praetor', icon: '🛫', title: 'Embraer Praetor', desc: 'Separate track · empty shelves', cls: 'gold', bg: 'praetor' },
      { path: '/ritual', icon: '⏱️', title: 'Study ritual', desc: '20–30 min daily framework', cls: '' },
      { path: '/admin', icon: '✅', title: 'Admin / open items', desc: 'Checklist with local persistence', cls: '' },
      { path: null, icon: '🃏', title: 'Flashcards', desc: 'Spaced recall deck', stub: 'Coming next' },
      { path: null, icon: '🔔', title: 'Notifications', desc: 'Study reminders', stub: 'Later' },
    ];

    app.innerHTML = `
      <div class="${shellClass()}">
        ${topbar('FO Study', 'Kerry Wyatt')}
        <main class="content">
          <div class="hero">
            <div class="eyebrow">Flexjet · FO track</div>
            <h2>Study dashboard</h2>
            <p>Framework only — empty shelves ready for your notes. No proprietary manual content.</p>
          </div>
          <div class="tiles">
            ${tiles.map(t => t.path ? `
              <button type="button" class="tile ${t.bg ? 'tile-photo tile-' + t.bg : ''}" data-nav="${t.path}">
                <div class="tile-icon ${t.cls || ''}">${t.icon}</div>
                <div class="tile-body">
                  <h3>${esc(t.title)}</h3>
                  <p>${esc(t.desc)}</p>
                </div>
                <span class="tile-chevron">${svg('chev')}</span>
              </button>` : `
              <div class="tile stub" aria-disabled="true">
                <div class="tile-icon mute">${t.icon}</div>
                <div class="tile-body">
                  <h3>${esc(t.title)}</h3>
                  <p>${esc(t.desc)}</p>
                  <span class="badge">${esc(t.stub)}</span>
                </div>
              </div>`).join('')}
          </div>
        </main>
      </div>`;
    bindNav();
  }

  function viewOrientation() {
    app.innerHTML = `
      <div class="${shellClass()}">
        ${topbar('New hire / Orientation', 'Home', '/')}
        <main class="content">
          <div class="card">
            <h3><span class="dot"></span>CLE Week — Sep 16–18</h3>
            <ul>
              <li><strong>Day 1 (Wed):</strong> Tour · paperwork · lunch · IT / uniform fit / photo / fingerprints · Flight welcome</li>
              <li><strong>Day 2 (Thu):</strong> Company / culture · drug &amp; alcohol · HR welcome · salary · benefits · payroll · social · <strong>Welcome dinner 5:15p</strong></li>
              <li><strong>Day 3 (Fri):</strong> Flight admin · ops · Tailwind/expense · fleet overview · maintenance · logistics</li>
            </ul>
            <div class="note">Process / people / logistics only — no proprietary manuals.</div>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Must lock — Day 1</h3>
            <ul>
              <li><strong>Dinner:</strong> Thu 5:15p · Hyde Park Prime, 26300 Chagrin Blvd, Beachwood OH · Flexjet / Emily Chinchar / Bri Izzo · <em>already on calendar</em></li>
              <li><strong>DFW parking:</strong> Never Flexjet FBO (tow). Planet Lincoln garage levels 6–7 free. TollTag (ntta.org) and/or BlueDiamond. Email Cathy Cunningham CathyC@Flexjet.com before OE: name, TollTag #, plate, color/make/model</li>
              <li><strong>Parking Spot:</strong> code BOMB1525 (≥20% · OK personal/family)</li>
              <li><strong>Benefits:</strong> email from no-reply@probenefitsadmin.ukg.com → UKG Myself → Benefits → Manage My Benefits → Get Started (Voya included). Deeper dive Day 2</li>
              <li><strong>Safety Hotline:</strong> 216.797.8170 · InfoLink QR</li>
              <li><strong>Uniform:</strong> A Cut Above · uniforms@flexjet.com · alanna@acutaboveuniforms.com · acutaboveuniforms.com — forgot password w/ company email; update shipping; ~$640/yr (portal buffer ≠ extra cash). Bomber jacket emailed separately</li>
              <li><strong>Concur:</strong> wait for setup email; Comp Portal → Authenticator + SAP Concur; use “Unable to enter authentication code” path if stuck</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>People to know</h3>
            <ul>
              <li>Joe Salata — Sr. VP Flight Ops</li>
              <li>Dennis Florian — VP Flight Admin</li>
              <li>Tim Montie — Director, Operations</li>
              <li>Joe Scott — Chief Pilot</li>
              <li>John Christensen — VP Flight Ops, ILC</li>
              <li>Bri Izzo — Director, HR · Mike Cirino — HR BP</li>
              <li>Josh Cherok — Training Admin · Sandy Carroll — Pilot Recruitment</li>
              <li>Cathy Cunningham — DFW parking / building</li>
              <li>Alex Howard — Crew Services (bids / PTO / schedule)</li>
              <li>Alanna (?) — A Cut Above account manager</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>How Flexjet works (Day 1 audio)</h3>
            <ul>
              <li><strong>FO seat:</strong> fly left seat; you are not PIC</li>
              <li><strong>PTO:</strong> request via Crew Services — not UKG/HR portal</li>
              <li><strong>Bids:</strong> 13 × 28-day periods; prefer tour length; blank vacation dates are protected</li>
              <li><strong>Vacation bids:</strong> 2×/year via crew portal (more Fri); ~40 hrs PTO to bid a block</li>
              <li><strong>Call-in well:</strong> by 14:00 Cleveland time; need &gt;1 day left on tour</li>
              <li><strong>Life events:</strong> ~30 days notice to scheduling</li>
              <li><strong>Ops advocate:</strong> pilot manager on duty in Ops Control</li>
              <li><strong>Parking $:</strong> full charge on company card; daily stipend; payroll claws overage; tips reimburse to linked bank in ~2–3 days</li>
              <li><strong>Rentals:</strong> photo corporate codes; keep preferred + DL current; personal use of discount OK</li>
              <li><strong>Passwords:</strong> memorize employee ID; don’t casually change issued system passwords</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Note-taking that sticks</h3>
            <ol>
              <li><strong>Capture raw</strong> during the day — don’t filter yet.</li>
              <li><strong>Encode nightly</strong> — rewrite into your own words + questions.</li>
              <li><strong>Tag open items</strong> — anything unclear goes to Admin checklist.</li>
              <li><strong>Link to shelves</strong> — drop systems facts into Phenom / Praetor later.</li>
            </ol>
          </div>
        </main>
      </div>`;
    bindNav();
  }

  function viewIndoc() {
    app.innerHTML = `
      <div class="${shellClass()}">
        ${topbar('Indoc', 'Home', '/')}
        <main class="content">
          <div class="card">
            <h3><span class="dot"></span>Ground school framework</h3>
            <p>Indoc / ground school is where you build the mental model. Use a daily loop: capture → encode → quiz yourself → park open items.</p>
          </div>
          <p class="section-label">Daily loop</p>
          <div class="steps">
            <div class="step">
              <div class="step-num">1</div>
              <div>
                <h4>Capture</h4>
                <p>During class: keywords, diagrams, “why it matters,” instructor emphasis.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-num">2</div>
              <div>
                <h4>Encode</h4>
                <p>Same night: rewrite in your words. One page max per major topic.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-num">3</div>
              <div>
                <h4>Open items</h4>
                <p>Anything fuzzy → Admin checklist or Personal notes on the jet shelf.</p>
              </div>
            </div>
          </div>
          <p class="section-label">Schedule placeholders</p>
          <div class="card">
            <h3><span class="dot"></span>Generic week skeleton</h3>
            <ul>
              <li><strong>Day 1–2:</strong> Company / ops overview · admin · expectations</li>
              <li><strong>Day 3–5:</strong> Aircraft systems block (placeholder)</li>
              <li><strong>Midweek:</strong> Procedures / flows orientation (placeholder)</li>
              <li><strong>Late week:</strong> Performance / limitations review (placeholder)</li>
              <li><strong>Ongoing:</strong> Nightly encode + 20–30 min Study ritual</li>
            </ul>
            <div class="note">Replace placeholders with your actual training calendar — no proprietary schedule content here.</div>
          </div>
        </main>
      </div>`;
    bindNav();
  }

  function viewAircraftHub(acKey) {
    const ac = ACFT[acKey];
    if (!ac) return viewHome();
    const base = '/' + acKey;
    const shelves = [
      { path: `${base}/systems`, title: 'Systems', meta: `${SYSTEMS.length} shelves` },
      { path: `${base}/memory`, title: 'Memory items', meta: 'Empty' },
      { path: `${base}/limitations`, title: 'Limitations', meta: 'Empty' },
      { path: `${base}/flows`, title: 'Flows / procedures', meta: 'Empty' },
      { path: `${base}/notes`, title: 'Personal notes', meta: 'localStorage' },
    ];
    app.innerHTML = `
      <div class="${shellClass()}">
        ${topbar(ac.short, 'Aircraft', '/')}
        <main class="content">
          <div class="hero" style="margin-bottom:12px">
            <div class="eyebrow">Empty shelves</div>
            <h2 style="font-size:1.35rem">${esc(ac.name)}</h2>
            <p>Add your own study content later. Nothing proprietary preloaded.</p>
          </div>
          <div class="shelf-list">
            ${shelves.map(s => `
              <button type="button" class="shelf-item" data-nav="${s.path}">
                <span class="name">${esc(s.title)}</span>
                <span class="meta">${esc(s.meta)}</span>
                ${svg('chev')}
              </button>`).join('')}
          </div>
        </main>
      </div>`;
    bindNav();
  }

  function viewSystemsList(acKey) {
    const ac = ACFT[acKey];
    if (!ac) return viewHome();
    const base = '/' + acKey;
    app.innerHTML = `
      <div class="${shellClass()}">
        ${topbar('Systems', ac.short, base)}
        <main class="content">
          <div class="shelf-list">
            ${SYSTEMS.map((name, i) => `
              <button type="button" class="shelf-item" data-nav="${base}/systems/${i}">
                <span class="name">${esc(name)}</span>
                <span class="meta">Empty</span>
                ${svg('chev')}
              </button>`).join('')}
          </div>
        </main>
      </div>`;
    bindNav();
  }

  function viewEmptyShelf(acKey, title, backPath, crumb) {
    const ac = ACFT[acKey];
    app.innerHTML = `
      <div class="${shellClass()}">
        ${topbar(title, crumb || ac.short, backPath)}
        <main class="content">
          <div class="empty-shelf">
            <div class="icon">📭</div>
            <h3>Add content later</h3>
            <p>This shelf is intentionally empty. Drop in your own summaries, diagrams, and cues from official training materials when you are ready.</p>
          </div>
        </main>
      </div>`;
    bindNav();
  }

  function viewNotes(acKey) {
    const ac = ACFT[acKey];
    const key = NOTES_PREFIX + acKey;
    let saved = '';
    try { saved = localStorage.getItem(key) || ''; } catch {}
    app.innerHTML = `
      <div class="${shellClass()}">
        ${topbar('Personal notes', ac.short, '/' + acKey)}
        <main class="content">
          <div class="card notes-area">
            <h3><span class="dot"></span>Your notes · ${esc(ac.short)}</h3>
            <p style="margin-bottom:12px">Stored only on this device (localStorage).</p>
            <textarea id="notes" placeholder="Capture questions, mnemonics, open items…">${esc(saved)}</textarea>
            <div class="notes-meta">
              <span id="notes-status">Ready</span>
              <button type="button" class="btn btn-ghost" id="notes-clear" style="min-height:36px;padding:6px 12px;font-size:0.8rem">Clear</button>
            </div>
          </div>
        </main>
      </div>`;
    bindNav();
    const ta = $('#notes');
    const status = $('#notes-status');
    let t;
    ta.addEventListener('input', () => {
      status.textContent = 'Saving…';
      clearTimeout(t);
      t = setTimeout(() => {
        try {
          localStorage.setItem(key, ta.value);
          status.innerHTML = '<span class="saved">Saved</span>';
        } catch {
          status.textContent = 'Save failed';
        }
      }, 250);
    });
    $('#notes-clear').addEventListener('click', () => {
      ta.value = '';
      try { localStorage.removeItem(key); } catch {}
      status.textContent = 'Cleared';
    });
  }

  function viewRitual() {
    app.innerHTML = `
      <div class="${shellClass()}">
        ${topbar('Study ritual', 'Home', '/')}
        <main class="content">
          <div class="card">
            <h3><span class="dot"></span>20–30 minutes · daily</h3>
            <p>No systems deep-dive required. Consistency beats marathon sessions — especially during indoc.</p>
          </div>
          <div class="steps">
            <div class="step">
              <div class="step-num">1</div>
              <div>
                <h4>2 min · Settle</h4>
                <p>Phone away. Open yesterday’s open items. Pick one focus.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-num">2</div>
              <div>
                <h4>10–15 min · Active recall</h4>
                <p>Close notes. Speak or write what you remember. Check gaps after.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-num">3</div>
              <div>
                <h4>5–8 min · Encode</h4>
                <p>One clean summary sentence + one question you still can’t answer.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-num">4</div>
              <div>
                <h4>3 min · Park</h4>
                <p>Add open items to Admin. Done. Protect sleep.</p>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="note">Flashcards module coming next — until then, paper cards or a simple Q/A list works.</div>
          </div>
        </main>
      </div>`;
    bindNav();
  }

  function loadAdmin() {
    try {
      const raw = localStorage.getItem(ADMIN_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_ADMIN.map(x => ({ ...x }));
  }
  function saveAdmin(items) {
    try { localStorage.setItem(ADMIN_KEY, JSON.stringify(items)); } catch {}
  }

  function viewAdmin() {
    let items = loadAdmin();
    function paint() {
      app.innerHTML = `
        <div class="${shellClass()}">
          ${topbar('Admin / open items', 'Home', '/')}
          <main class="content">
            <div class="card" style="margin-bottom:14px">
              <h3><span class="dot"></span>Checklist</h3>
              <p>Persists on this device via localStorage. Tap to toggle.</p>
            </div>
            <div class="check-list" id="checks">
              ${items.map((it, i) => `
                <button type="button" class="check-item ${it.done ? 'done' : ''}" data-idx="${i}">
                  <span class="check-box">${svg('check')}</span>
                  <span class="check-label">${esc(it.text)}</span>
                </button>`).join('') || '<p style="color:var(--text-mute);padding:12px">No items yet.</p>'}
            </div>
            <div class="add-row">
              <input id="new-item" type="text" placeholder="Add open item…" enterkeyhint="done" />
              <button type="button" class="btn btn-primary" id="add-btn">Add</button>
            </div>
            <div style="margin-top:16px">
              <button type="button" class="btn btn-ghost btn-block" id="reset-btn">Reset to starter items</button>
            </div>
          </main>
        </div>`;
      bindNav();
      $('#checks')?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-idx]');
        if (!btn) return;
        const i = +btn.dataset.idx;
        items[i].done = !items[i].done;
        saveAdmin(items);
        paint();
      });
      const add = () => {
        const input = $('#new-item');
        const text = (input.value || '').trim();
        if (!text) return;
        items.push({ id: 'c' + Date.now(), text, done: false });
        saveAdmin(items);
        paint();
      };
      $('#add-btn').addEventListener('click', add);
      $('#new-item').addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
      $('#reset-btn').addEventListener('click', () => {
        items = DEFAULT_ADMIN.map(x => ({ ...x }));
        saveAdmin(items);
        paint();
      });
    }
    paint();
  }

  function bindNav() {
    app.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', () => go(el.getAttribute('data-nav')));
    });
  }

  function render() {
    if (!isUnlocked()) {
      viewGate();
      return;
    }
    const { parts } = parseHash();
    const root = parts[0] || '';

    if (!root) return viewHome();
    if (root === 'orientation') return viewOrientation();
    if (root === 'indoc') return viewIndoc();
    if (root === 'ritual') return viewRitual();
    if (root === 'admin') return viewAdmin();

    if (root === 'phenom' || root === 'praetor') {
      const acKey = root;
      const section = parts[1];
      if (!section) return viewAircraftHub(acKey);
      if (section === 'systems') {
        if (parts[2] != null) {
          const idx = parseInt(parts[2], 10);
          const name = SYSTEMS[idx];
          if (!name) return viewSystemsList(acKey);
          return viewEmptyShelf(acKey, name, `/${acKey}/systems`, 'Systems');
        }
        return viewSystemsList(acKey);
      }
      if (section === 'memory') return viewEmptyShelf(acKey, 'Memory items', `/${acKey}`);
      if (section === 'limitations') return viewEmptyShelf(acKey, 'Limitations', `/${acKey}`);
      if (section === 'flows') return viewEmptyShelf(acKey, 'Flows / procedures', `/${acKey}`);
      if (section === 'notes') return viewNotes(acKey);
      return viewAircraftHub(acKey);
    }

    viewHome();
  }

  window.addEventListener('hashchange', render);
  render();
})();
