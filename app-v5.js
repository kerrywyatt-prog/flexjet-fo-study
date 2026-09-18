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
      { path: '/orientation', icon: '🧭', title: 'New hire / Orientation', desc: 'CLE Days 1–3 · payroll · ops · logistics · expense · MX', cls: '' },
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
            <h3><span class="dot"></span>CLE Week — Sep 16–18 · shareable</h3>
            <ul>
              <li><strong>Day 1 (Wed):</strong> Tour · paperwork · lunch · IT / uniform fit / photo / fingerprints · Flight welcome</li>
              <li><strong>Day 2 (Thu):</strong> Company / culture · D&amp;A · HR · salary enhancement · benefits · <strong>payroll</strong> · social · <strong>Welcome dinner 5:15p</strong></li>
              <li><strong>Day 3 (Fri):</strong> Flight admin · ops · Tailwind/expense · fleet · maintenance · logistics</li>
            </ul>
            <div class="note">Classmate-safe process notes — no personal sizes/addresses. Day 2/3 video clips not in usable audio; Day 3 MX (Kevin COO) on tape and folded in. Plaud 10:03 ~56m still missing.</div>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Must lock — logistics</h3>
            <ul>
              <li><strong>Dinner:</strong> Thu 5:15p · Hyde Park Prime, 26300 Chagrin Blvd, Beachwood OH · Flexjet / Emily Chinchar / Bri Izzo</li>
              <li><strong>DFW parking:</strong> Never Flexjet FBO (tow). Planet Lincoln garage levels 6–7 free. TollTag (ntta.org) and/or BlueDiamond. Email Cathy Cunningham CathyC@Flexjet.com before OE: name, TollTag #, plate, color/make/model</li>
              <li><strong>Parking Spot:</strong> code BOMB1525 (≥20% · OK personal/family)</li>
              <li><strong>Safety Hotline:</strong> 216.797.8170 · InfoLink QR</li>
              <li><strong>Uniform:</strong> A Cut Above · uniforms@flexjet.com · alanna@acutaboveuniforms.com · acutaboveuniforms.com — company email forgot-password; update shipping; ~$640/yr. Bomber jacket emailed separately</li>
              <li><strong>Concur:</strong> wait for setup email; Comp Portal → Authenticator + SAP Concur; “Unable to enter authentication code” path if stuck</li>
              <li><strong>Benefits:</strong> no-reply@probenefitsadmin.ukg.com → UKG Myself → Benefits → Manage My Benefits → Get Started (Voya)</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Must lock — payroll (Day 2)</h3>
            <ul>
              <li><strong>Cadence:</strong> 15th + last day (24/yr); weekend → prior Friday</li>
              <li><strong>Training:</strong> salary. <strong>Line:</strong> daily rate × days; reconcile prior month on first check of next month</li>
              <li><strong>Per diem:</strong> tax-exempt (confirm $ on handout); often estimate then reconcile</li>
              <li><strong>OT:</strong> 12–14h OT past 12; past 14h = triple; early start if duty-on before 07:00; extended day (can’t domicile before midnight) = 1.5× daily. Ops reports it — you don’t track. Pays first check next month</li>
              <li><strong>Stub:</strong> UKG “hours” often = days; rate is daily. Prefer UKG web. Verify DD + tax elections. HR payroll email on handout</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Must lock — 401(k) / enhanced retirement (Day 2)</h3>
            <ul>
              <li><strong>401(k) Voya:</strong> Traditional + Roth; company <strong>6% match</strong> on qualified/base earnings</li>
              <li><strong>IRS 2026 (class):</strong> $24,500 employee deferral; ≈ limit÷24 per paycheck to max. Catch-up 50+ ≠ “maxed” for tax gross-up</li>
              <li><strong>Deferred comp:</strong> up to $30k/yr (current; raised July) → $7,500/quarter; ~3-year deferral from hire; after 6 years’ service pays quarter-after accrual. Sep start pro-rates Q1. ~45 days worked/quarter for full amount; PTO does not count</li>
              <li><strong>Gross-up:</strong> if on pace to max 401(k) in the year you receive the payment → net the quarterly $. Else taxed. Set max elections by January of payout year</li>
              <li><strong>Docs:</strong> portal Documents → Enhanced Retirement FAQ. Ask Dennis Florian clarifying Qs</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Must lock — Day 3 ops / logistics / expense / fleet</h3>
            <ul>
              <li><strong>Tailwind:</strong> primary crew↔ops channel (trip, logistics, pax, catering). Prefer in-app trip thread. Silence notifications when off duty</li>
              <li><strong>Nick Riglin:</strong> Director Scheduling &amp; GCC (near-term trip/crew scheduling). Crew Services = bids / tour lines</li>
              <li><strong>Logistics:</strong> logistics@flexjet.com · always 4-letter ID + tail · not 24/7 — after-hours via ops</li>
              <li><strong>Airlines:</strong> scheduling picks flights; logistics tickets. No “standby ticket.” Do not jump earlier flights. Stay reachable on connections while on duty</li>
              <li><strong>Hotels:</strong> ≈ Holiday Inn–standard+; ≤30 min from FBO; training hotels different program. Chase missing briefing ~30 min before landing</li>
              <li><strong>Expense:</strong> per diem $42/day stated in class (confirm handout). Meals on company card — no alcohol; be reasonable. Uber direct-bill hotel↔FBO↔restaurant only</li>
              <li><strong>Show times:</strong> 60 min wheels-up from FBO; 90 min from hotel. Captains confirm final fuel. ~600 min / 10h flight-time gate</li>
              <li><strong>Upgrades:</strong> classes ~every 2–3 months; ~2-week portal window. ILC / dedicated-tail = application + interview</li>
              <li><strong>After CLE:</strong> Monday assignment email locks Dallas vs Orlando / go-home week — don’t invent travel</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Must lock — Day 3 maintenance (Kevin COO)</h3>
            <ul>
              <li><strong>Kevin Dilling</strong> — COO, Maintenance / Global Services (intro ASR said “CEO”; he runs MX ops)</li>
              <li><strong>In-house MX:</strong> ~13 bases · ~1600 mechanics — Flexjet techs do Flexjet aircraft work</li>
              <li><strong>MX controllers:</strong> share GCC floor; ~15 yr avg; <strong>24/7/365</strong>. Road discrepancy → MX controllers via ops/GCC. Always 4-letter ID + tail</li>
              <li><strong>AOG:</strong> ~130 senior techs; dispatch ≤24h; most within ~5h; goal on-location ≤~10h. TEB/HPN, Naples, Dallas, Rockies, FL, Europe</li>
              <li><strong>Cabin:</strong> iPad rating app (~75 items red→green) coming to crews — report worn seats. Seat kits swap fast. Don’t freestyle alcohol on leather</li>
              <li><strong>Context:</strong> completions/paint/engineering in-house; completions ~10 weeks; own STCs (Starlink) / PMAs</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>People to know</h3>
            <ul>
              <li>Joe Salata — Sr. VP Flight Ops</li>
              <li>Dennis Florian — VP Flight Admin · deferred-comp champion</li>
              <li>Tim Montie — Director, Operations · Joe Scott — Chief Pilot</li>
              <li>John Christensen — VP Flight Ops, ILC</li>
              <li>Bri Izzo — Director, HR · Mike Cirino — HR BP</li>
              <li>Josh Cherok (?) — Training Admin / Day 2 deferred-comp presenter</li>
              <li>Cathy Cunningham — DFW parking / building</li>
              <li>Alex Howard — Crew Services (bids / PTO / schedule)</li>
              <li>Nick Riglin — Director Scheduling &amp; GCC · Christina (?) — Flight Admin / expense</li>
              <li>Kevin Dilling — COO, Maintenance / Global Services</li>

              <li>Alanna (?) — A Cut Above · Voya — 401(k)</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>How Flexjet works</h3>
            <ul>
              <li><strong>FO seat:</strong> fly left seat; you are not PIC</li>
              <li><strong>PTO:</strong> request via Crew Services — not UKG/HR portal</li>
              <li><strong>Bids:</strong> 13 × 28-day periods; prefer tour length; blank vacation dates are protected</li>
              <li><strong>Vacation bids:</strong> 2×/year via crew portal; ~40 hrs PTO to bid a block</li>
              <li><strong>Call-in well:</strong> by 14:00 Cleveland time; need &gt;1 day left on tour</li>
              <li><strong>Life events:</strong> ~30 days notice to scheduling</li>
              <li><strong>Ops advocate:</strong> pilot manager on duty in Ops Control</li>
              <li><strong>Parking $:</strong> full charge on company card; daily stipend; payroll claws overage; tips ~2–3 days to bank</li>
              <li><strong>Rentals:</strong> photo corporate codes; keep preferred + DL current; personal use of discount OK</li>
              <li><strong>Passwords:</strong> memorize employee ID; don’t casually change issued system passwords</li>
              <li><strong>Tailwind:</strong> silence at night when off duty; use trip-thread to ops</li>
              <li><strong>Identify:</strong> 4-letter ID + tail on every ops/logistics contact</li>
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
