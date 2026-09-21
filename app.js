(() => {
  const PASSWORD = 'flexjet!';
  const UNLOCK_KEY = 'flexjet_fo_unlocked';
  const NOTES_PREFIX = 'flexjet_fo_notes_';
  const ADMIN_KEY = 'flexjet_fo_admin_items';
  const MEMORY_JSON_URL = 'data/memory-items.json';
  /** Exact IAI deck fallback (same as data/memory-items.json) for file:// */
  const MEMORY_ITEMS_EMBED = {"aircraft":"Embraer Praetor 500/600 (EMB-545/550)","source":"CREW TRAINING HANDBOOK EMB-545/550 Rev 2.5 pp14-15 · Flexjet Immediate Action Items","rule":"word-for-word — never paraphrase","cards":[{"id":"smoke-evac","section":"SMOKE","title":"SMOKE EVACUATION","banner":"black","steps":["Crew Oxygen Masks ··· DON, EMGCY","Smoke Goggles ··· DON","Communication ··· ESTABLISH","OXYGEN Selector ··· CREW ONLY","DUMP Button ··· PUSH IN"],"notes":["EMGCY may be selected for 2 minutes maximum then set to 100%"]},{"id":"smoke-fire-fumes","section":"SMOKE","title":"SMOKE/FIRE/FUMES","banner":"black","steps":["Crew Oxygen Masks ··· DON, EMGCY","Smoke Goggles ··· DON","Communication ··· ESTABLISH"],"notes":["EMGCY may be selected for 2 minutes maximum then set to 100%"]},{"id":"cargo-smoke","section":"SMOKE","title":"CARGO SMOKE","banner":"red","steps":["Fire Protection CARGO Button ··· PUSH IN"]},{"id":"dual-eng-fail","section":"NON-ANNUNCIATED","title":"DUAL ENGINE FAILURE","banner":"black","steps":["EICAS Indication: >ENG 1 FAIL and >ENG 2 FAIL","EICAS Indication: FAIL icon inside both N1 Indicators","Crew Oxygen Masks ··· DON, N (Normal)","Airspeed ··· MIN 250 KIAS","RAT Manual Deploy Lever ··· PULL","Communication ··· ESTABLISH"]},{"id":"emerg-descent","section":"NON-ANNUNCIATED","title":"EMERGENCY DESCENT","banner":"black","steps":["Crew Oxygen Masks ··· DON, 100%","THRUST Levers ··· IDLE","SPEED BRAKE Lever ··· FULL","Airspeed ··· MAX APPROPRIATE","Altitude ··· 10,000 ft OR MEA, WHICHEVER IS HIGHER"]},{"id":"eng-abn-start","section":"NON-ANNUNCIATED","title":"ENGINE ABNORMAL START","banner":"black","steps":["ENG START/STOP Selector (affected engine) ··· STOP","Engine ITT Parameter (affected engine) ··· MONITOR"]},{"id":"eng-severe","section":"NON-ANNUNCIATED","title":"ENGINE SEVERE DAMAGE OR SEPARATION","banner":"black","steps":["Autothrottle ··· DISENGAGE","Thrust Lever (affected engine) ··· IDLE","ENG Start/Stop Selector (affected engine) ··· STOP","Engine Fire SHUTOFF Button (affected engine) ··· PUSH IN"]},{"id":"fltctrl-misbeh","section":"NON-ANNUNCIATED","title":"FLTCTRL N-MODE MISBEHAVIOR","banner":"black","steps":["NORMAL MODE Button ··· PRESS AND RELEASE","PITCH Switch ··· ACTUATE MANUALLY"],"condition":"A flight control normal mode misbehavior is any airplane behavior that flight crew realize airplane is behaving unexpectedly, not responding adequately to flight crew commands or is presenting lack of response."},{"id":"jammed-ss","section":"NON-ANNUNCIATED","title":"JAMMED SIDESTICK","banner":"black","steps":["Cross Side AP/PTY Button ··· PRESS AND HOLD FOR MORE THAN 20 SECONDS"]},{"id":"gear-lever-up","section":"NON-ANNUNCIATED","title":"GEAR LEVER CAN NOT BE MOVED UP","banner":"black","steps":["DN LCK REL Button ··· PRESS","LDG GEAR Lever ··· UP"],"condition":"If climb performance is required to clear obstacles:"},{"id":"cabin-alt-hi","section":"AMS","title":"CABIN ALTITUDE HI","banner":"red","steps":["Crew Oxygen Masks ··· DON, 100%","THRUST Levers ··· IDLE","SPEED BRAKE Lever ··· FULL","Airspeed ··· MAX APPROPRIATE","Altitude ··· 10000 ft OR MEA, WHICHEVER IS HIGHER"]},{"id":"batt-disch","section":"ELECTRICAL","title":"BATT DISCHARGING","banner":"red","steps":["ELEC EMER Button ··· PUSH IN","RAT Manual Deploy Lever ··· PULL"]},{"id":"elec-emerg","section":"ELECTRICAL","title":"> ELEC EMERGENCY","banner":"red","steps":["PITCH Switch ··· ACTUATE MANUALLY"]},{"id":"apu-fire","section":"FIRE PROTECTION","title":"APU FIRE","banner":"red","steps":["APU SHUTOFF Button ··· PUSH IN"]},{"id":"eng1-fire","section":"FIRE PROTECTION","title":"ENG 1 FIRE","banner":"red","steps":["Autothrottle ··· DISENGAGE","Engine 1 THRUST Lever ··· IDLE","ENG 1 START/STOP Selector ··· STOP","Engine Fire SHUTOFF 1 Button ··· PUSH IN"]},{"id":"eng2-fire","section":"FIRE PROTECTION","title":"ENG 2 FIRE","banner":"red","steps":["Autothrottle ··· DISENGAGE","Engine 2 THRUST Lever ··· IDLE","ENG 2 START/STOP Selector ··· STOP","Engine Fire SHUTOFF 2 Button ··· PUSH IN"]},{"id":"fltctrl-nmode-fail","section":"FLIGHT CONTROLS","title":"> FLTCTRL N-MODE FAIL","banner":"red","steps":["PITCH Switch ··· ACTUATE MANUALLY"]},{"id":"sidestick-fail","section":"FLIGHT CONTROLS","title":"SIDE STICK LH (RH) FAIL","banner":"red","steps":["Cross-Side Sidestick ··· USE"]},{"id":"lg-wow","section":"LANDING GEAR AND BRAKES","title":"LG WOW MISCOMPARE","banner":"red","steps":["NORMAL MODE Button ··· PRESS AND RELEASE","PITCH SWITCH ··· ACTUATE MANUALLY"]},{"id":"ai-wingstab","section":"ICE & RAIN / GEAR","title":"A-I WINGSTAB LEAK","banner":"red","steps":["Ice Prot WINGSTAB Button ··· PUSH OUT"]},{"id":"windshear","section":"SOPM","title":"WINDSHEAR WITH FD ESCAPE MANEUVER (Airplanes equipped with Windshear Detection System)","banner":"black","steps":["Thrust Levers ··· MAX"]},{"id":"rto","section":"SOPM","title":"REJECTED TAKEOFF (At or below V1)","banner":"black","steps":["Thrust Levers ··· IDLE","Thrust Reversers ··· AS REQUIRED","Brake Pedals ··· MAX APPLY (If Autobrake is not armed)"]}]};

  let memoryDeckCache = null;
  let flashState = { order: null, index: 0, flipped: false, shuffled: false };

  async function loadMemoryDeck() {
    if (memoryDeckCache) return memoryDeckCache;
    try {
      const res = await fetch(MEMORY_JSON_URL, { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.cards) && data.cards.length) {
          memoryDeckCache = data;
          return memoryDeckCache;
        }
      }
    } catch (_) { /* file:// or offline */ }
    memoryDeckCache = MEMORY_ITEMS_EMBED;
    return memoryDeckCache;
  }

  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function ensureFlashOrder(cards) {
    if (!flashState.order || flashState.order.length !== cards.length) {
      flashState.order = cards.map((_, i) => i);
      flashState.index = 0;
      flashState.flipped = false;
      flashState.shuffled = false;
    }
  }


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
    praetor: { id: 'praetor', name: 'Embraer Praetor 500/600', short: 'Praetor 500/600' },
  };

  const DEFAULT_ADMIN = [
    { id: 'dinner', text: 'Thu Welcome Dinner 5:15p — Hyde Park Beachwood (on calendar)', done: true },
    { id: 'tolltag', text: 'DFW: TollTag/BlueDiamond + email CathyC@Flexjet.com before OE', done: false },
    { id: 'parking-spot', text: 'Parking Spot app + code BOMB1525', done: false },
    { id: 'ukg', text: 'Benefits enrollment — UKG Myself when company email arrives', done: false },
    { id: 'uniform', text: 'Submit uniform order — A Cut Above after fitting; update shipping; bomber email if needed', done: false },
    { id: 'concur', text: 'Wait for Concur email; finish MFA (Authenticator path)', done: false },
    { id: 'rental', text: 'Photo rental-car corporate codes; keep DL + preferred current', done: false },
    { id: 'academy', text: 'Indoc: finish Heather Bey Academy modules (~11) by Sunday for 135 credit', done: false },
    { id: 'sunday50', text: 'Indoc: work ~201Q study guide; Sunday 50Q open-book on Academy iPad', done: false },
    { id: 'flyembraer', text: 'Indoc: download Fly Embraer tech pubs + verify ForeFlight CTH Praetor', done: false },
    { id: 'spare-glasses', text: 'If medical requires lenses — carry spare glasses (ramp check)', done: false },
  ];

  const $ = (sel, el = document) => el.querySelector(sel);
  const app = $('#app');

  function isUnlocked() {
    try { return localStorage.getItem(UNLOCK_KEY) === '1'; } catch { return false; }
  }
  function setUnlocked() {
    try { localStorage.setItem(UNLOCK_KEY, '1'); } catch {}
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
    if (root === 'praetor' || root === 'flashcards') return 'shell shell-praetor';
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
        <p class="gate-foot">One-time unlock · remembered on this device</p>
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
      { path: '/indoc', icon: '📚', title: 'Indoc', desc: 'DFW Day 1 · Ops Specs A–E · Academy · Praetor study path', cls: '' },
      { path: '/praetor', icon: '🛫', title: 'Embraer Praetor 500/600', desc: 'Systems shelves · memory · flows', cls: 'gold', bg: 'praetor' },
      { path: '/ritual', icon: '⏱️', title: 'Study ritual', desc: '20–30 min daily framework', cls: '' },
      { path: '/admin', icon: '✅', title: 'Admin / open items', desc: 'Checklist with local persistence', cls: '' },
      { path: '/flashcards', icon: '🃏', title: 'Flashcards', desc: 'IAI memory items · Praetor · word-for-word', cls: 'gold' },
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
            <div class="note">Classmate-safe process notes — no personal sizes/addresses. Day 2/3 video clips still empty. Full large-v3 compare 2026-09-19 folded (Phenom 8–9 mo · Josh Rock · deferred in-addition-to-6% match · seat locks · class pay figures).</div>
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
              <li><strong>Training:</strong> salary — class ~$146,445/yr (confirm handout). <strong>Line:</strong> PBS ~$751/day × days (confirm handout); reconcile prior month on first check of next month</li>
              <li><strong>Per diem:</strong> tax-exempt $42/work day (confirm handout); often estimate then reconcile</li>
              <li><strong>OT:</strong> 12–14h OT past 12; past 14h = triple; early start if duty-on before 07:00; extended day (can’t domicile before midnight) = 1.5× daily. Ops reports it — you don’t track. Pays first check next month</li>
              <li><strong>Stub:</strong> UKG “hours” often = days; rate is daily. Prefer UKG web. Verify DD + tax elections. HR payroll email on handout</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Must lock — 401(k) / enhanced retirement (Day 2)</h3>
            <ul>
              <li><strong>401(k) Voya:</strong> Traditional + Roth; company <strong>6% match</strong> on qualified/base earnings</li>
              <li><strong>IRS 2026 (class):</strong> $24,500 employee deferral; ≈ limit÷24 per paycheck to max. Catch-up 50+ ≠ “maxed” for tax gross-up</li>
              <li><strong>Deferred comp:</strong> <strong>$30k/yr ($7,500/qtr) in addition to</strong> the 401(k) <strong>6% match</strong> (not “greater of / or 6%”); ~3-year deferral from hire; after 6 years’ service pays quarter-after accrual. Sep start pro-rates Q1. ~45 days worked/quarter for full amount; PTO does not count</li>
              <li><strong>Gross-up:</strong> if on pace to max 401(k) in the year you receive the payment → net the quarterly $. Else taxed. Set max elections by January of payout year</li>
              <li><strong>Docs:</strong> portal Documents → Enhanced Retirement FAQ. Ask Dennis Florian clarifying Qs</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Must lock — Day 3 ops / logistics / expense / fleet</h3>
            <ul>
              <li><strong>Tailwind:</strong> primary crew↔ops “bible” (trip, logistics, pax, catering, timeline). Prefer in-app trip thread. Silence notifications when off duty. FlexBid needs live network</li>
              <li><strong>Nick Riglin:</strong> Director Scheduling &amp; GCC (near-term trip/crew scheduling). Crew Services = bids / tour lines</li>
              <li><strong>FOATM:</strong> Flight Ops supervisor on duty — road POC for questions / concerns / safety (Andrew — Praetor program)</li>
              <li><strong>Logistics:</strong> logistics@flexjet.com · always 4-letter ID + tail · desk 0700–midnight (hotels) / 0700–2200 (airlines); after-hours via ops</li>
              <li><strong>Airlines:</strong> scheduling picks flights; logistics tickets. No “standby ticket.” Do not jump earlier flights. Stay reachable on connections while on duty</li>
              <li><strong>Hotels:</strong> ≈ Holiday Inn–standard+; ≤30 min from FBO; training hotels different program. Chase missing briefing ~30 min before landing</li>
              <li><strong>Expense / Concur:</strong> per diem $42/day (confirm handout). No alcohol. Uber direct-bill hotel↔FBO↔restaurant. Report name = 4-letter + dates + domicile; itemized receipts; company pays card; overage → paycheck</li>
              <li><strong>Show times:</strong> 60 min FBO · 90 min hotel · 100 min residence (?). ~10 recovery jets/day (≤1 day). Captains confirm final fuel (Everest release ?). ~600 min / 10h gate</li>
              <li><strong>Upgrades:</strong> classes ~every 2–3 months; ~2-week portal window. Seat locks: SIC none · Phenom CAPT ~24 mo · Praetor/Challenger DRL ~36 mo (confirm). ILC / dedicated-tail = application + interview</li>
              <li><strong>After CLE:</strong> typically Dallas 135 INDOC → off → type → POE/IOE. Monday email locks path — don’t invent travel</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Must lock — Day 3 maintenance (Kevin COO)</h3>
            <ul>
              <li><strong>Kevin Dillon/Dilling (?)</strong> — COO, Maintenance / Global Services (intro: COO; he runs MX ops)</li>
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
              <li>Josh Rock — Director, Flight Administration · Day 2 deferred-comp presenter</li>
              <li>Cathy Cunningham — DFW parking / building</li>
              <li>Alex Howard — Crew Services (bids / PTO / schedule)</li>
              <li>Nick Riglin — Director Scheduling &amp; GCC · Christina (?) — Flight Admin / expense</li>
              <li>Andrew (?) — FOATM / Flight Ops supervisor · Praetor program · Tailwind/Concur</li>
              <li>Kevin Dillon/Dilling (?) — COO, Maintenance / Global Services</li>

              <li>Alanna (?) — A Cut Above · Voya — 401(k)</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>How Flexjet works</h3>
            <ul>
              <li><strong>FO seat:</strong> fly left seat; not PIC (299 to act); can log PIC but not act. Phenom PIC window ~8–9 mo from CLE if you take it; Challenger/Praetor hold-out ~24–27 mo</li>
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
              <li><strong>Link to shelves</strong> — drop systems facts into Praetor 500/600 later.</li>
            </ol>
          </div>
        </main>
      </div>`;
    bindNav();
  }

  const INDOC_AE = {
    a: {
      title: 'A · General',
      blurb: 'Issuance, aircraft, management, op control, EFB, eligible on-demand, contamination/icing lookups.',
      bullets: [
        'Bucket: definitions · authorized aircraft/configs · exemptions · management personnel · operational control · contract training · eligible on-demand · EFBs.',
        'Op control: only the company initiates/conducts/terminates flights. PIC may delay/cancel/divert/refuse unsafe — not self-dispatch.',
        'EFB: Type A (general docs) vs Type B (ForeFlight charts/taxi). Databases current; EFB care in FOM. Ramp-check ready.',
        'High-mins: do not pair A+B. High-mins ≈100 hrs type; B pairing floor ≈75 hrs captain — speak up if wrong.',
        'Always fly/duty as 135 even if release says 91 repo. Flexjet/POI killed 91 duty loopholes.',
        'Alcohol (135): served by company employee. Hold stowage/safety lines; write continuity notes.',
        'Contamination / ground icing: open-book opspec lookup (A041 family named in class). Must be covered on 8410 oral.',
        'Records + load manifest tools live in ForeFlight / Tailwind / company systems.',
      ],
    },
    b: {
      title: 'B · Enroute',
      blurb: 'Airspace, RNAV/RNP, LRNS, oceanic, RVSM, overwater — know the bucket, search the paragraph.',
      bullets: [
        'Bucket: areas of enroute ops · equipment authorizations · RNAV/RNP · Class A LRN · oceanic · RVSM · overwater LRNS.',
        'Lecture map (verify live docs): B31 areas; B33 IFR enroute; B34 RNAV/RNP; B35 Class A LRN; B36 Oceania/LRN tables; B46 RVSM.',
        'Not approved into northern “keyhole” domestic airspace (Yellowknife-area example). Dispatch knows — don’t freestyle.',
        'Proving runs largely complete; weird airports still go through dispatch/opspecs.',
        'Oceanic / LRNS detail flagged for later Indoc block — shelf stays light until then.',
      ],
    },
    c: {
      title: 'C · Terminal',
      blurb: 'DAAP, approach/takeoff/alternate mins, foreign procedures, specials, visual/VFR.',
      bullets: [
        'C49 DAAP — required when landing RVR below 4000 or vis below 3/4 SM, contaminated runway, braking less than good, xwind over 15 kt, wind shear, or PIC deems necessary.',
        'C51 foreign terminal instrument procedures / RVR conversion / lighting.',
        'C52 CAT I lighting/RVR: TDZ controlling; mid+rollout advisory; still need two RVR sources when required. Verify chart numbers — don’t memorize ASR figures.',
        'C54 approach/landing limits + high-mins PIC; PIC must be qualified for <¾ SM / RVR 4000 approaches.',
        'C55 alternate mins — use the table; chart NA = cannot use as alternate.',
        'C57 IFR takeoff mins — standard 1 SM / RVR 5000; lower when authorized + TDZ RVR available.',
        'Also touched: C63 RNP AR · C64 Class B no tower (missed + approved wx + advisories) · C73 VDAP/CDFA · C75 CAT I · C77 visual/cancel IFR.',
        'Dispatchers are opspec-fluent — use them.',
      ],
    },
    d: {
      title: 'D · Maint',
      blurb: 'Outline label locked Day 1. Durable MX procedures = later Indoc / CLE MX notes — do not invent MEL/CDL here.',
      bullets: [
        'Board bucket D = Maintenance opspecs. Day 1 audio mostly navigated the PDF — few durable MX procedures locked.',
        'Airworthiness/status docs ride with the certificate package in ForeFlight.',
        'Line discrepancies still: MX controllers via ops/GCC (CLE Day 3) — 4-letter ID + tail.',
        'Aircraft weigh program ties to W&B (every 36 months — verify paragraph).',
        'Shelf status: from Day 1 lecture = label only · TBD for MEL/CDL/AOG Indoc deep dive.',
      ],
    },
    e: {
      title: 'E · W&B',
      blurb: 'Electronic W&B, average weights, Tailwind push/save, captain final fuel.',
      bullets: [
        'Aircraft weighed every 36 months (program/opspec — verify live docs).',
        'Electronic W&B in ForeFlight; small-cabin standard average passenger weights; longhand backup exists in program.',
        'Load manifest: pax count, total weight, MTOW check, CG limits — ForeFlight + Tailwind.',
        'Flight plans + W&B built/pushed to crew. Recent rule: once saved, partner device sees it — no separate send (confirm current SOP).',
        'Captain confirms final fuel. Everest Fuel brief was Day 1 @ 13:00 — content not on Plaud 01/02 (open item).',
      ],
    },
  };

  function viewIndoc() {
    app.innerHTML = `
      <div class="${shellClass()}">
        ${topbar('Indoc · DFW Day 1', 'Home', '/')}
        <main class="content">
          <div class="card">
            <h3><span class="dot"></span>Mon Sep 21, 2026 · CAE Dallas West</h3>
            <p>Dense capture from Plaud + whiteboard. Ops Specs spine = <strong>A General · B Enroute · C Term · D Maint · E W&B</strong> (mnemonic: Get More Whiskey And Beer). Know <em>where</em> to find answers. Memory items + limitations = closed-book.</p>
            <div class="note">Praetor 500/600 track only. Phenom/Challenger appear as fleet types in Indoc overview — no Phenom shelves.</div>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Must lock — Day 1</h3>
            <ul>
              <li><strong>CTH first:</strong> ForeFlight Praetor 500/600 Crew Training Handbook (~80 pp) ≈ 99% of type prep (memory · limitations · systems Qs). <strong>CFM</strong> for flows/profiles/checklist usage. AFM later via Fly Embraer — don’t AFM-cram early.</li>
              <li><strong>Sunday 50Q:</strong> open-book on Flexjet Academy (iPad). Prep from ~201Q study guide. Gerald (135 mgr) writes wording gotchas.</li>
              <li><strong>Academy ~11 modules:</strong> Heather Bey assign · required for 135 credit · done by Sunday. academy.flexjet.com · Flexjet email · pw <code>Flexjet1</code> (change first login). Issues → heather.bey@flexjet.com</li>
              <li><strong>Security/TSA test</strong> later in week (~15Q) — separate from Sunday exam.</li>
              <li><strong>Duty always 135:</strong> 14 duty / 10 fly / 10 rest (two-pilot). Tailwind tracks; speak up if reality breaks plan. Non-local deadhead ≠ rest.</li>
              <li><strong>High-mins:</strong> no A+B pair; ~100 hrs high-mins; ~75 hrs B floor.</li>
              <li><strong>Priorities:</strong> Safety → Compliance → Customer service. Op control = company initiates.</li>
              <li><strong>ASAP:</strong> both pilots file → company + FAA/POI. Not obligated to call ATC deviation phone if ASAP filed. No shield for intentional/careless/D&amp;A.</li>
              <li><strong>Medical:</strong> first-class only; by 25th of expiration month. Spare glasses if required on medical.</li>
              <li><strong>Temp type cert:</strong> 120 days — chase plastic early. Jim Dunn / training if stuck.</li>
              <li><strong>Confidentiality</strong> of clients; PIC↔SIC ID check; badge left; iPad case on.</li>
              <li><strong>FO:</strong> left seat; log SIC until designated captain; 100 hrs in type to manipulate controls (opspec — verify FOM).</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>People / logistics</h3>
            <ul>
              <li><strong>Mike Sliva</strong> — mike.sliva@flexjet.com · m 469-578-3665</li>
              <li><strong>Heather Bey</strong> — heather.bey@flexjet.com</li>
              <li><strong>Tech Pubs</strong> — technicalpublications@flexjet.com</li>
              <li><strong>CAE Wi‑Fi</strong> — <code>A1rbr8ke</code></li>
              <li>Also named: Gerald (135 mgr) · Jim Dunn (DOT) · Joe Scott (CP) · Tim Montie (DO) · Doug Lightcap (?) · POI Jeff Carlson/Piles (?)</li>
            </ul>
          </div>

          <p class="section-label">Ops Specs A–E · tap for dense shelf</p>
          <div class="shelf-list">
            ${Object.entries(INDOC_AE).map(([k, v]) => `
              <button type="button" class="shelf-item" data-nav="/indoc/${k}">
                <span class="name">${esc(v.title)}</span>
                <span class="meta">${esc(v.blurb.slice(0, 48))}…</span>
                ${svg('chev')}
              </button>`).join('')}
          </div>

          <div class="card">
            <h3><span class="dot"></span>Praetor study path (from Day 1)</h3>
            <ul>
              <li><strong>Now:</strong> CTH memory items + limitations + callouts + normal takeoff/ILS flows from expanded CFM.</li>
              <li><strong>IPT / Systems Integration:</strong> free-play after hours if CAE customers aren’t using; paper-tiger poster in hotel.</li>
              <li><strong>Sims:</strong> ~6 + check · ~4h sessions · ~5h check. Scenario orals with cockpit poster — show switchology.</li>
              <li><strong>500 vs 600:</strong> study as identical systems; match the SIM you are assigned.</li>
              <li>Link facts into <strong>Praetor shelves</strong> as ground school fills them — empty systems OK until lecture says so.</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Open items</h3>
            <ul>
              <li>Academy modules + Sunday 50Q prep</li>
              <li>Fly Embraer download/login · verify CTH in ForeFlight</li>
              <li>Everest Fuel 13:00 brief missing from Plaud 01/02 — capture if clip appears</li>
              <li>Confirm W&amp;B save-vs-send SOP · POI spelling · official type-travel email</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Daily encode loop</h3>
            <ol>
              <li>Capture raw in class.</li>
              <li>Encode same night into A–E shelves + Praetor notes.</li>
              <li>Park fuzzy items on Admin checklist.</li>
              <li>Quiz: “Which opspec bucket?” before memorizing paragraph numbers.</li>
            </ol>
          </div>
        </main>
      </div>`;
    bindNav();
  }

  function viewIndocShelf(key) {
    const shelf = INDOC_AE[key];
    if (!shelf) return viewIndoc();
    app.innerHTML = `
      <div class="${shellClass()}">
        ${topbar(shelf.title, 'Indoc', '/indoc')}
        <main class="content">
          <div class="card">
            <h3><span class="dot"></span>${esc(shelf.title)}</h3>
            <p>${esc(shelf.blurb)}</p>
            <div class="note">From Indoc Day 1 lecture + board. Verify live Ops Specs / FOM before checkride. Empty detail = TBD later day.</div>
          </div>
          <div class="card">
            <ul>
              ${shelf.bullets.map(b => `<li>${esc(b)}</li>`).join('')}
            </ul>
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
      { path: `${base}/memory`, title: 'Memory items', meta: '22 IAI cards' },
      { path: `${base}/limitations`, title: 'Limitations', meta: 'Empty' },
      { path: `${base}/flows`, title: 'Flows / procedures', meta: 'Empty' },
      { path: `${base}/notes`, title: 'Personal notes', meta: 'localStorage' },
    ];
    app.innerHTML = `
      <div class="${shellClass()}">
        ${topbar(ac.short, 'Aircraft', '/')}
        <main class="content">
          <div class="hero" style="margin-bottom:12px">
            <div class="eyebrow">Praetor track · Indoc Day 1 seeded</div>
            <h2 style="font-size:1.35rem">${esc(ac.name)}</h2>
            <p>Study path from Day 1: CTH (memory/limitations/systems Qs) → CFM flows → IPT → sims. Systems shelves stay empty until lecture fills them — no invented AFM facts.</p>
          </div>
          <div class="card" style="margin-bottom:12px">
            <h3><span class="dot"></span>Day 1 study path</h3>
            <ul>
              <li><strong>CTH ~80 pp</strong> in ForeFlight = primary closed-book prep</li>
              <li><strong>CFM</strong> expanded flows / callouts / normal takeoff &amp; ILS</li>
              <li><strong>Ops Specs A–E</strong> open-book navigation → Indoc shelves</li>
              <li><strong>Fly Embraer</strong> tech pubs for AFM depth after ground school starts</li>
              <li>500/600 systems treated identical for study; match assigned SIM</li>
            </ul>
          </div>
          <div class="shelf-list">
            <button type="button" class="shelf-item" data-nav="/indoc">
              <span class="name">Indoc Ops Specs A–E</span>
              <span class="meta">Day 1 dense</span>
              ${svg('chev')}
            </button>
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
            <h3>Encode after lecture</h3>
            <p>Day 1 direction: closed-book items from Praetor <strong>CTH</strong>; flows from <strong>CFM</strong>. Systems facts only after ground school says so — no invented AFM numbers.</p>
            <p style="margin-top:10px;color:var(--text-mute);font-size:0.9rem">IAI flashcards = home · Flashcards. Ops Specs A–E = Indoc.</p>
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
            <div class="note">Use <strong>Flashcards</strong> on the home screen for Praetor Immediate Action Items (word-for-word).</div>
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


  function viewMemoryItems(acKey) {
    const ac = ACFT[acKey];
    if (!ac) return viewHome();
    const base = '/' + acKey;
    app.innerHTML = `
      <div class="${shellClass()}">
        ${topbar('Memory items', ac.short, base)}
        <main class="content">
          <div class="card">
            <h3><span class="dot"></span>Immediate Action Items</h3>
            <p>Praetor 500/600 · CTH EMB-545/550 Rev 2.5 pp14–15 · Flexjet IAI</p>
            <p style="margin-top:8px">Word-for-word — never paraphrase. Training purposes only; AFM/AOM/QRH govern.</p>
            <div style="margin-top:14px">
              <button type="button" class="btn btn-primary btn-block" data-nav="/flashcards">Open flashcards</button>
            </div>
          </div>
          <div id="memory-list"><p class="section-label">Loading…</p></div>
          <div class="card" style="margin-top:14px">
            <div class="note">Training purposes only — not all-inclusive. Current AFM / AOM / QRH govern.</div>
          </div>
        </main>
      </div>`;
    bindNav();
    loadMemoryDeck().then((deck) => {
      const host = $('#memory-list');
      if (!host) return;
      const bySection = {};
      deck.cards.forEach((c) => {
        const sec = c.section || 'OTHER';
        (bySection[sec] || (bySection[sec] = [])).push(c);
      });
      const sections = Object.keys(bySection);
      host.innerHTML = sections.map((sec) => `
        <p class="section-label">${esc(sec)}</p>
        <div class="shelf-list" style="margin-bottom:14px">
          ${bySection[sec].map((c) => `
            <button type="button" class="shelf-item memory-row" data-card-id="${esc(c.id)}">
              <span class="banner-dot banner-${esc(c.banner || 'black')}" title="${c.banner === 'red' ? 'Red banner (EICAS warning)' : 'Black banner (non-EICAS)'}"></span>
              <span class="name">${esc(c.title)}</span>
              <span class="meta">${c.steps.length} step${c.steps.length === 1 ? '' : 's'}</span>
              ${svg('chev')}
            </button>`).join('')}
        </div>`).join('');
      host.querySelectorAll('[data-card-id]').forEach((el) => {
        el.addEventListener('click', () => {
          const id = el.getAttribute('data-card-id');
          const idx = deck.cards.findIndex((c) => c.id === id);
          flashState.order = deck.cards.map((_, i) => i);
          flashState.index = idx >= 0 ? idx : 0;
          flashState.flipped = false;
          flashState.shuffled = false;
          go('/flashcards');
        });
      });
    });
  }

  function viewFlashcards() {
    app.innerHTML = `
      <div class="${shellClass()}">
        ${topbar('Flashcards', 'IAI · Praetor', '/')}
        <main class="content" id="fc-root">
          <p class="section-label">Loading memory items…</p>
        </main>
      </div>`;
    bindNav();
    loadMemoryDeck().then((deck) => {
      const cards = deck.cards;
      ensureFlashOrder(cards);
      paintFlash();

      function paintFlash() {
        const root = $('#fc-root');
        if (!root) return;
        const total = cards.length;
        if (!total) {
          root.innerHTML = '<div class="empty-shelf"><h3>No cards</h3></div>';
          return;
        }
        if (flashState.index < 0) flashState.index = 0;
        if (flashState.index >= total) flashState.index = total - 1;
        const card = cards[flashState.order[flashState.index]];
        const n = flashState.index + 1;
        const bannerCls = card.banner === 'red' ? 'fc-banner-red' : 'fc-banner-black';
        const bannerLabel = card.banner === 'red' ? 'RED · EICAS warning' : 'BLACK · non-EICAS';
        const stepsHtml = (card.steps || []).map((s) => `<li>${esc(s)}</li>`).join('');
        const notesHtml = (card.notes || []).map((n) => `<li class="fc-note-item">${esc(n)}</li>`).join('');
        const condHtml = card.condition ? `<p class="fc-condition">${esc(card.condition)}</p>` : '';
        root.innerHTML = `
          <div class="fc-toolbar">
            <span class="fc-progress">${n} / ${total}</span>
            <button type="button" class="btn btn-ghost fc-shuffle" id="fc-shuffle">${flashState.shuffled ? 'Unshuffle' : 'Shuffle'}</button>
          </div>
          <div class="fc-card ${bannerCls} ${flashState.flipped ? 'is-flipped' : ''}" id="fc-card" role="button" tabindex="0" aria-label="Flip card">
            <div class="fc-face fc-front">
              <div class="fc-banner-tag">${esc(bannerLabel)}</div>
              <div class="fc-section">${esc(card.section || '')}</div>
              <h2 class="fc-title">${esc(card.title)}</h2>
              <p class="fc-hint">Tap to reveal steps</p>
            </div>
            <div class="fc-face fc-back">
              <div class="fc-banner-tag">${esc(bannerLabel)}</div>
              <div class="fc-section">${esc(card.section || '')}</div>
              <h3 class="fc-back-title">${esc(card.title)}</h3>
              ${condHtml}
              <ol class="fc-steps">${stepsHtml}</ol>
              ${notesHtml ? `<ul class="fc-notes">${notesHtml}</ul>` : ''}
            </div>
          </div>
          <div class="fc-nav">
            <button type="button" class="btn btn-ghost" id="fc-prev" ${flashState.index === 0 ? 'disabled' : ''}>Prev</button>
            <button type="button" class="btn btn-primary" id="fc-flip">${flashState.flipped ? 'Hide' : 'Reveal'}</button>
            <button type="button" class="btn btn-ghost" id="fc-next" ${flashState.index >= total - 1 ? 'disabled' : ''}>Next</button>
          </div>
          <p class="fc-footer">Training purposes only — not all-inclusive. Current AFM / AOM / QRH govern. Do not invent procedures.</p>
          <p class="fc-source">${esc(deck.source || '')}</p>
        `;
        const flip = () => { flashState.flipped = !flashState.flipped; paintFlash(); };
        $('#fc-flip')?.addEventListener('click', flip);
        $('#fc-card')?.addEventListener('click', flip);
        $('#fc-card')?.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
        });
        $('#fc-prev')?.addEventListener('click', () => {
          if (flashState.index > 0) { flashState.index--; flashState.flipped = false; paintFlash(); }
        });
        $('#fc-next')?.addEventListener('click', () => {
          if (flashState.index < total - 1) { flashState.index++; flashState.flipped = false; paintFlash(); }
        });
        $('#fc-shuffle')?.addEventListener('click', () => {
          if (flashState.shuffled) {
            flashState.order = cards.map((_, i) => i);
            flashState.shuffled = false;
          } else {
            flashState.order = shuffleInPlace(cards.map((_, i) => i));
            flashState.shuffled = true;
          }
          flashState.index = 0;
          flashState.flipped = false;
          paintFlash();
        });
      }
    });
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
    if (root === 'indoc') {
      if (parts[1] && INDOC_AE[parts[1]]) return viewIndocShelf(parts[1]);
      return viewIndoc();
    }
    if (root === 'ritual') return viewRitual();
    if (root === 'admin') return viewAdmin();
    if (root === 'flashcards') return viewFlashcards();

    if (root === 'phenom') {
      const rest = parts.slice(1).join('/');
      location.replace('#' + (rest ? '/praetor/' + rest : '/praetor'));
      return;
    }

    if (root === 'praetor') {
      const acKey = 'praetor';
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
      if (section === 'memory') return viewMemoryItems(acKey);
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
