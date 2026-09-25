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

  const RECURRENT_JSON_URL = 'data/135-recurrent-qa.json';
  const RECURRENT_135_EMBED = {"source":"https://flex-135-study.netlify.app/","title":"135 Recurrent Study Guide — full bank","count":201,"pass_pct":80,"mock_size":50,"questions":[{"n":1,"question":"After ditching in water, passengers and crewmembers should wait to inflate their life vests until they have exited the aircraft.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"An inflated life vest can trap you against the ceiling if the cabin floods, so you inflate it only after you're out of the aircraft.","source":"FOM 8.3.5","group":"u1"},{"n":2,"question":"The APG or RWA Analysis will specify an altitude for acceleration and clean up from second segment to final segment climb speed/configuration.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"\"The APG or RWA Analysis will specify an altitude for acceleration and clean up from second segment to final segment climb speed/configuration.\"","source":"FOM 4.9.8.7.1","group":"g12"},{"n":3,"question":"Prior to each departure during IMC, crewmembers will obtain and review the appropriate APG or RWA airport obstacle analysis and aircraft performance information pertinent to the airport and runway of intended use to determine the takeoff weight limit for the aircraft to satisfy OEI obstacle clearance requirements.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Before an IMC departure you review the obstacle analysis to find the max takeoff weight that still clears obstacles on one engine.","source":"FOM 4.9.8.2","group":"g12"},{"n":4,"question":"The takeoff weight must be limited so as not to exceed any brake energy limitation for the flight.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Takeoff weight also has to stay under the brakes' maximum energy limit so a rejected takeoff won't overheat or fail the brakes.","source":"FOM 4.9.7.1","group":"u4"},{"n":5,"question":"All Company flights will be required to ensure obstacle avoidance for every flight regardless whether the flight is operated under Part 91, Part 91K, or Part 135. As a general rule the methods for obstacle avoidance and analysis are:","choices":{"a":"Aircraft certification requirements.","b":"SID climb requirements.","c":"APG or RWA data."},"answer":"c","answer_text":"APG or RWA data.","explanation":"The company's obstacle-avoidance methods are APG/RWA analysis (IMC), see-and-avoid in VMC, and special visual procedures at mountain airports — of the choices, APG/RWA data is the one listed.","source":"FOM 4.9.8.1","group":"u5"},{"n":6,"question":"If contaminated runway data exists (approved or non-approved) for the aircraft, it will be used to determine required runway for departure and landing on contaminated runways.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"\"When the runway for departure is wet or contaminated, takeoff weight will be limited by applicable wet/contaminated AFM supplemental performance data, APG, or RWA.\"","source":"FOM 4.9.7.1","group":"u6"},{"n":7,"question":"Crews are authorized to accept and fly RNAV Q Routes.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Q routes (high-altitude RNAV routes) are authorized.","source":"Ops Specs B035","group":"u7"},{"n":8,"question":"Prior to using GPS based navigation systems crews must verify that RAIM is available.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"You must confirm RAIM (GPS integrity monitoring) is available before relying on GPS navigation.","source":"FOM 4.9.1","group":"u8"},{"n":9,"question":"When cleared for an RNAV departure, crews must ensure that the following is correctly loaded in the navigation system...","choices":{"a":"The first fix.","b":"The first fix, and the first altitude.","c":"The current version of the cleared RNAV procedure and the first fix.","d":"The current version of the cleared RNAV procedure, the take-off runway, and the assigned transition."},"answer":"d","answer_text":"The current version of the cleared RNAV procedure, the take-off runway, and the assigned transition.","explanation":"For an RNAV departure you load the current cleared procedure, the takeoff runway, and the assigned transition — not just the first fix.","source":"FOM 4.9.3","group":"u9"},{"n":10,"question":"Pilot crewmembers will receive an updated weather briefing within 30 minutes prior to landing at the destination.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"You get an updated weather briefing within 30 minutes of landing.","source":"FOM 4.14.2","group":"g0"},{"n":11,"question":"When flying RNAV departures and arrivals, manually selecting bank limiting (half bank) may reduce ability to satisfy ATC path expectations.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Half-bank can keep the airplane from turning tightly enough to stay on the RNAV path ATC expects.","source":"FOM 4.7.1","group":"u11"},{"n":12,"question":"Government charts (NACO) are not authorized. Jeppesen charts that are provided on the EFBs must be used for all passenger carrying operations.","choices":{"a":"True","b":"False"},"answer":"b","answer_text":"False","explanation":"The FOM allows Jeppesen OR NACO charts when paper is required, so NACO isn't prohibited — the statement is false.","source":"FOM 4.8.8","group":"u12"},{"n":13,"question":"When are you prohibited from accepting a “line up and wait” clearance?","choices":{"a":"At night with visibility less than 1 mile and the departure runway is being used only for departures.","b":"A line up and wait clearance is not authorized","c":"Night or day with visibility less than 1 mile, unless the crew can be assured that the departure runway is not being used for arrivals.","d":"At TEB when departing runway 24."},"answer":"c","answer_text":"Night or day with visibility less than 1 mile, unless the crew can be assured that the departure runway is not being used for arrivals.","explanation":"You can't accept 'line up and wait' day or night with visibility under 1 mile unless you're sure the runway isn't being used for arrivals.","source":"FOM 4.11.7","group":"u13"},{"n":14,"question":"Unless otherwise stated in the notes section in Tailwinds, visual approaches from sunset to sunrise are only authorized at airports that are served by...","choices":{"a":"A VASI/PAPI or a precision approach.","b":"Weather reporting.","c":"An Instrument approach with Category D circling minimums","d":"A control tower."},"answer":"c","answer_text":"An Instrument approach with Category D circling minimums","explanation":"At night, visual approaches are only allowed at airports served by an instrument approach with Category D circling minimums.","source":"FOM 4.14.15.2","group":"u14"},{"n":15,"question":"Airports that have specific restrictions will be found…","choices":{"a":"In FOM Section 4.","b":"In the Jeppesen General Airway Manual.","c":"In the notes section in Tailwinds and in the Additional Airport Information folder in ForeFlight.","d":"In each aircraft’s CFM."},"answer":"c","answer_text":"In the notes section in Tailwinds and in the Additional Airport Information folder in ForeFlight.","explanation":"Airport-specific restrictions are in the Tailwinds notes and the ForeFlight Additional Airport Information folder.","source":"Tailwinds Airport Notes / ForeFlight","group":"u15"},{"n":16,"question":"When the autopilot is engaged the PF will make and verbalize changes on the flight director panel.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"\"When the autopilot is engaged the PF will make and verbalize changes on the flight director panel.\"","source":"FOM 4.7.3","group":"u16"},{"n":17,"question":"If a visual approach is planned to a runway that is served by a precision IAP, the crew is required to have that approach tuned and displayed on the navigation unit and shall use the navigation information to correctly identify the intended airport and runway.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"The crew \"is required to have that approach tuned and displayed on the navigation unit and shall use the navigation information to correctly identify the intended airport and runway.\"","source":"FOM 4.14.15.3","group":"u17"},{"n":18,"question":"Pilots are authorized to conduct contact approaches.","choices":{"a":"True","b":"False"},"answer":"b","answer_text":"False","explanation":"Contact approaches are not authorized, so the statement is false.","source":"FOM 4.14.17","group":"u18"},{"n":19,"question":"Which document(s) contain information regarding operations during ground icing conditions?","choices":{"a":"FOM Section 7","b":"Op Spec A041","c":"CFM","d":"All the above"},"answer":"d","answer_text":"All the above","explanation":"\"Ops Spec A041 requires a pre-takeoff contamination check whenever operating in ground icing conditions\" — covered in FOM Section 7, Ops Spec A041, and the CFM.","source":"FOM 7.3.9 / Ops Specs A041","group":"g3"},{"n":20,"question":"As part of the post de-icing inspection, the crew must verify that which of the following items are free of frozen contaminants?","choices":{"a":"Aircraft critical surfaces, and all pitot/static ports.","b":"Engine inlets and inlet protection devices, main and nose gear wells.","c":"Cabin/baggage doors, and verify flight control unrestricted full range of movement.","d":"All are correct."},"answer":"d","answer_text":"All are correct.","explanation":"\"Check all critical surfaces are free of frozen contaminants\" — all of the listed items must be verified in the post-deicing inspection.","source":"FOM 7.3.6.7","group":"u20"},{"n":21,"question":"A Pre-Takeoff Contamination Check will be conducted whenever...","choices":{"a":"operations are conducted with visibility less than 2 SM.","b":"ground icing conditions exist and hold over time has been exceeded.","c":"ground icing conditions exist, and you have used a Type IV anti-ice fluid.","d":"operating in ground-icing conditions."},"answer":"d","answer_text":"operating in ground-icing conditions.","explanation":"\"Ops Spec A041 requires a pre-takeoff contamination check whenever operating in ground icing conditions.\"","source":"FOM 7.3.9","group":"g15"},{"n":22,"question":"A tactile pre-takeoff contamination check will be conducted...","choices":{"a":"during preflight when ground icing conditions exist.","b":"after deicing and/or anti-icing.","c":"before takeoff when the crew is unable to determine that aircraft surfaces are free from contamination using a visual check.","d":"before takeoff with freezing drizzle or light freezing rain.","e":"All the above."},"answer":"e","answer_text":"All the above.","explanation":"Instructor (Indoc Day 3) and the official key both say E. FOM 7.3.11 satisfies all of the above (preflight in ground icing, after de/anti-icing, freezing drizzle / light freezing rain, and when a visual check can't confirm clean surfaces).","source":"FOM 7.3.11","group":"u22"},{"n":23,"question":"When conducting operations in ground icing conditions, holdover timetables are only required to be referenced if using a Type IV anti-ice solution.","choices":{"a":"True","b":"False"},"answer":"b","answer_text":"False","explanation":"\"The use of holdover times is for reference only and may not be solely relied upon to determine if the aircraft surfaces are free of contamination\" — so it isn't only for Type IV. False.","source":"FOM 7.3.6","group":"u23"},{"n":24,"question":"You have determined that a Pre-Takeoff Contamination Check must be conducted. When must the check be completed?","choices":{"a":"Any time before takeoff.","b":"Within 10 minutes prior to beginning takeoff.","c":"Prior to taxi.","d":"Within 5 minutes prior to beginning takeoff."},"answer":"d","answer_text":"Within 5 minutes prior to beginning takeoff.","explanation":"The contamination check is done \"within 5 minutes prior to beginning takeoff.\"","source":"FOM 7.3.1","group":"g5"},{"n":25,"question":"Winter operations information is found in which source document(s)?","choices":{"a":"FOM section 8","b":"FOM section 9","c":"FOM section 4","d":"FOM section 7"},"answer":"d","answer_text":"FOM section 7","explanation":"Winter/weather operations are in FOM Section 7.","source":"FOM 7","group":"g3"},{"n":26,"question":"The preferred fluids for anti-icing are...","choices":{"a":"Type I and IV","b":"Type II and IV","c":"Type I, II, and IV","d":"Type I, II, III and IV"},"answer":"b","answer_text":"Type II and IV","explanation":"\"The preferred fluids for anti-icing are Type II and IV.\"","source":"FOM 7.3.6.3","group":"g13"},{"n":27,"question":"What can be said about de-ice/anti-ice fluids?","choices":{"a":"De-icing fluids are used to remove frozen contaminants from aircraft critical surfaces.","b":"Anti-icing fluids should be applied in a uniform layer and in sufficient quantity until it starts to flow off the aircraft surfaces.","c":"The preferred fluids for anti-icing are Type II and IV.","d":"All the above statements are true."},"answer":"d","answer_text":"All the above statements are true.","explanation":"\"De-icing fluids are used to remove frozen contaminants from aircraft critical surfaces\" — all three statements are true.","source":"FOM 7.3.6.2","group":"g13"},{"n":28,"question":"We are prohibited from departing during ground icing conditions, if our holdover time (HOT) has been exceeded.","choices":{"a":"True","b":"False"},"answer":"b","answer_text":"False","explanation":"\"Unless it can be positively determined that the aircraft surfaces are free of contamination immediately prior to takeoff (within five minutes), the crew may need to repeat the de/anti-ice process or delay\" — an expired HOT alone doesn't ground you. False.","source":"FOM 7.3.9","group":"u28"},{"n":29,"question":"When does holdover time begin on a 2 step de-ice/anti-ice?","choices":{"a":"At the end of the final application of de-ice/anti-ice fluid.","b":"At the beginning of the first application of de-ice/anti-ice fluid.","c":"When the final application of de-icing/anti-icing fluid commences.","d":"None of the above."},"answer":"c","answer_text":"When the final application of de-icing/anti-icing fluid commences.","explanation":"\"HOT begins when the final application of de-icing/anti-icing fluid commences.\"","source":"FOM 7.3.9","group":"u29"},{"n":30,"question":"It is acceptable to polish frost smooth using something such as a rag or paper prior to departure.","choices":{"a":"True","b":"False"},"answer":"b","answer_text":"False","explanation":"\"'Polishing' frost smooth and conducting a takeoff is prohibited. Frost must be removed as any other frozen contaminant.\"","source":"FOM 7.3.3","group":"u30"},{"n":31,"question":"When conducting a night arrival into KEGE, crews may only use runway 25 and must use the LDA/DME RWY 25 or RNAV Y RWY 25 approach. The PAPI and GS must be operational.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"At night into Eagle you may use only Runway 25 via the LDA DME or RNAV Y RWY 25, and the PAPI and glideslope must be working.","source":"KEGE Airport Guide","group":"u31"},{"n":32,"question":"A high minimums PIC may not use lower than standard takeoff minimums authorized in Op Spec C079.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"A high-minimums PIC can't use the lower-than-standard takeoff minimums from Ops Spec C079.","source":"FOM 4.2.3","group":"u32"},{"n":33,"question":"If ATC does not specify any other particular departure procedure prior to takeoff, a crewmember must comply with the departure procedure established by the FAA for the airport and runway to be used.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"If ATC doesn't specify a departure procedure, you fly the FAA-published DP/ODP for obstacle clearance.","source":"FOM 4.9.8.5","group":"g7"},{"n":34,"question":"When a filed flight plan has been amended within 30 minutes of scheduled departure time by either Flight Planning or the flight crew, it is the flight crew’s responsibility to advise ATC/FSS of the possibility of two flight plans on file. When a change has occurred within 30 minutes of scheduled departure, the flight crew must request a full route clearance from ATC/FSS.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"If the flight plan changes within 30 minutes of departure, tell ATC/FSS about the possible duplicate and request a full route clearance.","source":"FOM 4.9.21","group":"u34"},{"n":35,"question":"If ATC issues an instruction that is contrary to a TCAS RA, you must comply with ATC’s instructions.","choices":{"a":"True","b":"False"},"answer":"b","answer_text":"False","explanation":"You follow the TCAS RA over a conflicting ATC instruction — \"Respond immediately to any 'increase' or 'reversal' RA maneuver advisories.\" False.","source":"FOM 4.13.5","group":"u35"},{"n":36,"question":"When conducting a visual approach, the multi-function display (MFD), if available, should be continuously adjusted to the lowest scale which allows the destination airport to remain visible.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"On a visual, keep the moving map at the lowest scale that still shows the destination airport.","source":"FOM 4.14.15.2","group":"u36"},{"n":37,"question":"For destination airport planning a grooved/porous runway can be considered effectively dry when the forecast for precipitation at the estimated time of arrival is less than moderate.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"\"A grooved/porous runway can be considered effectively dry when the forecast for precipitation at the estimated time of arrival is less than moderate.\"","source":"FOM 7.5.1","group":"u37"},{"n":38,"question":"What is the minimum length of available runway necessary for land and hold short operations (LAHSO)?","choices":{"a":"5500 feet.","b":"The minimum runway length required in the aircraft CFM.","c":"When the hold short point is near the end of a very long runway.","d":"The Company is not authorized to conduct land and hold short operations."},"answer":"d","answer_text":"The Company is not authorized to conduct land and hold short operations.","explanation":"The company is not authorized to conduct land-and-hold-short (LAHSO) at any airport.","source":"FOM 4.14.18","group":"g1"},{"n":39,"question":"When more than 25 percent of the runway surface area (whether in isolated areas or not) within the required length and width being used is covered by standing water, snow (dry or wet), loose snow, compacted snow, slush or ice (including wet ice), the runway is considered to be...","choices":{"a":"Dry","b":"Wet","c":"Contaminated","d":"Unusable"},"answer":"c","answer_text":"Contaminated","explanation":"\"A runway is contaminated when more than 25 percent of the runway... is covered by standing water, snow, loose snow, compacted snow, slush or ice.\"","source":"FOM 4.9.10","group":"u39"},{"n":40,"question":"DAAP restrictions include... the runway must have an approved and operational visual guidance system or serviced by an operational glide slope (i.e., ILS, LPV, LNAV/VNAV, FMS Visual with VGP) unless a DAAP exception has been granted.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"DAAP requires an operational visual guidance system or glideslope unless a DAAP exception is granted — the statement is true.","source":"FOM 4.9.11.2","group":"g14"},{"n":41,"question":"Which of the following conditions precludes the use of DAAP?","choices":{"a":"Light turbulence is reported on final approach.","b":"Anti-skid is inoperative.","c":"The runway has loose snow.","d":"The runway is wet."},"answer":"b","answer_text":"Anti-skid is inoperative.","explanation":"Inoperative anti-skid rules out DAAP — anti-skid must be operational.","source":"FOM 4.9.11.2","group":"u41"},{"n":42,"question":"Under what limitation may company pilots file to, and begin an instrument approach procedure to, an airport that does not have a weather reporting facility?","choices":{"a":"The weather at the intended destination must be at least 1000/3.","b":"The airport must have an operational control tower.","c":"An alternate airport is filed that has a weather reporting facility.","d":"You must first contact the FODM on duty."},"answer":"c","answer_text":"An alternate airport is filed that has a weather reporting facility.","explanation":"As an Eligible On-Demand operator you may start an approach to an airport with no weather reporting if you file an alternate that does have weather reporting.","source":"FOM 4.9.11","group":"g16"},{"n":43,"question":"The PM typically enters data which should be confirmed with the PF before activation. The Confirm, Activate, Monitor and Intervene (CAMI) procedure shall be used to assure desired outcomes whenever interfacing with automation systems.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"CAMI (Confirm, Activate, Monitor, Intervene) is the procedure used when working with the automation.","source":"FOM 4.7.3","group":"g6"},{"n":44,"question":"Which is false with regards to entering a runway (active or non-active) for the purpose of crossing or positioning for takeoff?","choices":{"a":"The anti-collision light must be turned on.","b":"Both pilots must hear and understand the taxi clearance and verbally agree before crossing any hold short line.","c":"Both pilots must be task free.","d":"Checklists and FBO communications may be accomplished during runway crossing."},"answer":"d","answer_text":"Checklists and FBO communications may be accomplished during runway crossing.","explanation":"The false statement is that checklists/FBO comms may be done during a runway crossing — both pilots must be task-free. (Kept per FOM; the official key marks b.)","source":"FOM 4.11.1.4","group":"u44"},{"n":45,"question":"When using a marshaller/wing walker, what is the minimum distance we must maintain from an obstacle/aircraft?","choices":{"a":"5 feet.","b":"10 feet.","c":"15 feet.","d":"There is no minimum distance. Just use caution when being marshaled in by the line personnel."},"answer":"a","answer_text":"5 feet.","explanation":"Even with a wing-walker you never taxi under your own power within 5 feet of another aircraft or obstacle.","source":"FOM 4.11.1.3","group":"g10"},{"n":46,"question":"When NOT using a marshaller/wing walker, what is the minimum distance we must maintain from an obstacle/aircraft?","choices":{"a":"5 feet.","b":"10 feet.","c":"15 feet.","d":"20 feet."},"answer":"b","answer_text":"10 feet.","explanation":"Without a marshaller/wing-walker you keep at least 10 feet — under 10 feet you're required to use one.","source":"FOM 4.11.1.3","group":"g10"},{"n":47,"question":"When conditions at the destination or alternate require the use of the 80% rule for landing, an SIC with less than 100 hours in type may make the landing when...","choices":{"a":"Visibility is less than ¾ of a mile.","b":"Braking action is less than good.","c":"Crosswind component is greater than 10 knots but less than 15 knots.","d":"Wind shear is reported at the airport."},"answer":"c","answer_text":"Crosswind component is greater than 10 knots but less than 15 knots.","explanation":"A sub-100-hour SIC may still land with a 10–15 kt crosswind; it's a crosswind over 15 kt (or low vis, poor braking, windshear, contamination) that stops them.","source":"FOM 4.9.11.2","group":"u47"},{"n":48,"question":"Hazardous materials may not be accepted for transport on company aircraft, but there are certain exceptions.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Flexjet is a \"Will Not Carry\" hazmat certificate holder — hazmat isn't accepted except for the specific listed exceptions. True.","source":"HazMat Manual","group":"u48"},{"n":49,"question":"Oxygen for medical use by passengers is allowed under specific conditions. Which statement regarding the carriage of oxygen is TRUE?”","choices":{"a":"Compressed gas medical oxygen required for the duration of the flight, may be transported in the cabin of the aircraft.","b":"Because it is considered “for medical purposes”, liquid oxygen may be carried on Company aircraft.","c":"Recreational or flavored oxygen may be carried in containers of less than 20 ounces.","d":"Only approved portable oxygen concentrators (POCs) may be carried. Compressed gas medical oxygen may never be carried onboard company aircraft."},"answer":"d","answer_text":"Only approved portable oxygen concentrators (POCs) may be carried. Compressed gas medical oxygen may never be carried onboard company aircraft.","explanation":"Only approved portable oxygen concentrators may be carried — compressed-gas and liquid medical oxygen are never allowed onboard.","source":"FOM 4.9.22.13","group":"u49"},{"n":50,"question":"Flights under Part 91 and 91K will be conducted to the same standards as Part 135 operations except where noted in the FOM. Exceptions include...","choices":{"a":"Passenger ID checks are not required.","b":"Part 91 oxygen requirements apply.","c":"ETOPS 180 limitation does not apply.","d":"Direct communication with an air/ground communication facility per Ops Spec C077 does not apply.","e":"All of the above."},"answer":"e","answer_text":"All of the above.","explanation":"All of the listed Part 91/91K differences from Part 135 apply.","source":"FOM 4.9.2","group":"u50"},{"n":51,"question":"When the crosswind, including gusts, at the destination airport exceeds the aircraft demonstrated crosswind, but less than the Landing Wind Limitations guidance in this section, an alternate airport will be selected or coordinated with Flight Planning by the PIC.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"When crosswind exceeds the demonstrated value but is below the limit, the PIC selects or coordinates an alternate with Flight Planning — the statement is true. (Kept per FOM; the official key marks False.)","source":"FOM 4.14.7","group":"u51"},{"n":52,"question":"Section 4 of the FOM addresses all the policies and procedures regarding operational control.","choices":{"a":"True","b":"False"},"answer":"b","answer_text":"False","explanation":"Section 4 is 'Flight Operations,' not operational control, so the statement is false.","source":"FOM 4","group":"u52"},{"n":53,"question":"Winter operations guidance is located in FOM Section 7.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Winter operations guidance is in FOM Section 7 — true.","source":"FOM 7","group":"g3"},{"n":54,"question":"Operations Specifications authorize crews to conduct certain operations, while the Flight Operations Manual provides standard operating procedures, which allow Company personnel to carry out their duties and responsibilities in accordance with company policies, FAA regulations, Ops Specs, and M Specs.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Ops Specs authorize what you're allowed to do; the FOM gives the standard procedures to do it — true.","source":"FOM / Ops Specs","group":"u54"},{"n":55,"question":"Although the Company may provide flight planning services for the crewmembers, the PIC is responsible for the accuracy, safety, and regulatory compliance of all facets of flight planning.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Even when the company plans the flight, the PIC is responsible for its accuracy and legality — true.","source":"Ops Specs","group":"u55"},{"n":56,"question":"Crews are required to turn their aircraft’s anti-collision lights on while taxiing across a runway.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Anti-collision lights go on when taxiing across a runway — true.","source":"FOM 4.11.1.4","group":"u56"},{"n":57,"question":"Prior to engine start for each departure, the PIC will initiate the AWARE briefing.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"The PIC starts the AWARE briefing before engine start — true.","source":"FOM 4.9.17","group":"u57"},{"n":58,"question":"The acronym AWARE stands for...","choices":{"a":"Aircraft Status, Weather, Airport, Route verification, and Extras.","b":"Aircraft Status, Weather, Arrival, Runway, and Extras.","c":"Airport Status, Weather, Arrival, Route, and Emergency review.","d":"Airport, Weather, Aircraft, Runway, and Emergency exits."},"answer":"a","answer_text":"Aircraft Status, Weather, Airport, Route verification, and Extras.","explanation":"AWARE = Aircraft status, Weather, Airport, Route verification, Extras.","source":"FOM 4.9.17","group":"u58"},{"n":59,"question":"The following restrictions apply anytime crews are using the DAAP relief for preflight planning...","choices":{"a":"Lift dump devices, if installed, must be operational.","b":"Thrust reversers, if installed, must be operational for operations on wet runways.","c":"Anti-skid, if installed, must be operational.","d":"The runway must have an approved and operational visual guidance system or serviced by an operational glide slope (i.e., ILS, LPV, LNAV/VNAV, FMS Visual with VGP) unless a DAAP exception has been granted.","e":"All the above."},"answer":"e","answer_text":"All the above.","explanation":"All of the listed DAAP restrictions apply.","source":"FOM 4.9.11.2","group":"g14"},{"n":60,"question":"Company pilots may use DAAP in their pre-flight planning when the destination runway is contaminated.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"DAAP can be used into a contaminated destination as long as the runway is at least 115% of the length needed for a dry runway — so it's true.","source":"FOM 4.9.11.2","group":"u60"},{"n":61,"question":"Prior to boarding the aircraft, the PIC will ensure __________ is completed.","choices":{"a":"A final walk around","b":"The AWARE Briefing","c":"The Pre-Taxi Briefing","d":"The Pre-Departure Briefing"},"answer":"a","answer_text":"A final walk around","explanation":"Before boarding, the PIC makes sure a final walk-around is completed.","source":"FOM 4.9.24","group":"u61"},{"n":62,"question":"Prior to the first flight on an aircraft during a PIC’s rotation and following any maintenance being performed during the rotation, the PIC will conduct a thorough review of the aircraft status book with the Maintenance Controller.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"At the start of a rotation and after any maintenance, the PIC reviews the aircraft status book with Maintenance Control — true.","source":"FOM 5.1.3","group":"u62"},{"n":63,"question":"The PIC is the final authority in determining safe fuel loads. As safety allows he/she will follow the Fuel Guide recommendation as published on the flight plan located in the total fuel field (TOTL). If the PIC determines more or less fuel is required (greater than +/- ___ pounds), he/she must inform the Flight Planning Department of the changed fuel load with the applicable reason by either responding via email to the flight plan or by phone.","choices":{"a":"100","b":"200","c":"300","d":"400"},"answer":"b","answer_text":"200","explanation":"If you need more or less fuel than the plan by more than ±200 lb, you must tell Flight Planning why.","source":"FOM 4.9.12","group":"u63"},{"n":64,"question":"What is the maximum allowable gust factor for all flight operations according to the FOM?","choices":{"a":"15 kts.","b":"20 kts.","c":"25 kts.","d":"30 kts."},"answer":"b","answer_text":"20 kts.","explanation":"The maximum gust factor is 20 knots (15 for a high-minimums PIC).","source":"FOM 4.14.7","group":"u64"},{"n":65,"question":"When computing a weight and balance, standard average weights, actual weights, or a combination of both weights shall be used per the guidance in…","choices":{"a":"FOM Section 3.","b":"FOM Section 5.","c":"FOM Appendix 1.","d":"FOM Appendix 3."},"answer":"d","answer_text":"FOM Appendix 3.","explanation":"Weight-and-balance guidance (standard, actual, or combined weights) is in FOM Appendix 3. (Section 4.9.13's 'Appendix 1' reference is a typo — Appendix 1 has no W&B data.)","source":"FOM Appendix 3","group":"u65"},{"n":66,"question":"You are scheduled to fly 3 legs, totaling 9.6 hours of flying. During the first leg of the day, due to circumstances outside of your control, it becomes apparent that you will exceed 10 hours of flying. According to our FOM are you legal to complete your flights?","choices":{"a":"The crew can legally complete the remaining flights, provided the series of flights was realistically planned. The aircrew will be provided rest as required by 14 CFR, or otherwise required, prior to the next Duty Period if the total flight time exceeded the ten-hours.","b":"A flight crew may never exceed a 10-in-24 warning under any circumstance.","c":"The crew can legally complete the remaining flights provided the series of flights if the remaining legs are conducted under FAR Part 91.","d":"Flight crews can exceed 10 hours of flight time in 24 hours but never 14 hours of duty within a 24-hour period."},"answer":"a","answer_text":"The crew can legally complete the remaining flights, provided the series of flights was realistically planned. The aircrew will be provided rest as required by 14 CFR, or otherwise required, prior to the next Duty Period if the total flight time exceeded the ten-hours.","explanation":"Legal if the flights were \"realistically planned\"; rest is then provided as required by 14 CFR before the next duty period.","source":"FOM 4.4.1","group":"u66"},{"n":67,"question":"May you still operate a Part 135 flight if your passenger has forgotten their REAL ID?","choices":{"a":"Yes, as long as they have an approved alternate form of Federal ID.","b":"Yes, ID’s are not required to be checked.","c":"Yes, you can call the Safety department and in very rare instances get a waiver for the passenger.","d":"None of the above."},"answer":"a","answer_text":"Yes, as long as they have an approved alternate form of Federal ID.","explanation":"On a Part 135 flight, a passenger without their REAL ID can still be identified with two other forms of ID, one of which is government-issued.","source":"FOM Appendix 2","group":"u67"},{"n":68,"question":"While preparing for a flight, a maintenance discrepancy is found. Maintenance is notified and the item is deferred under the MEL but TAILWINDS still shows a Maintenance Alert. Which statement below is most accurate?","choices":{"a":"You may depart as long as scheduling tells you it is ok.","b":"You may depart as long as the Maintenance Duty Manager sends you the required release via Tailwinds, email, or FAX stating that you are cleared to depart.","c":"You cannot depart.","d":"You can depart as long as the FODM sends you an email saying all items have been cleared."},"answer":"b","answer_text":"You may depart as long as the Maintenance Duty Manager sends you the required release via Tailwinds, email, or FAX stating that you are cleared to depart.","explanation":"If a Tailwinds warning is present the PIC must \"receive the following release via the Tailwinds App, email, or fax from the MDM.\"","source":"FOM 5.1.4","group":"u68"},{"n":69,"question":"Who has operational control on a Flexjet Part 91K flight?","choices":{"a":"The Company and share owner are jointly and individually responsible.","b":"All tasks associated with exercising operational control on a program flight are delegated by the owner to the Company.","c":"The passenger on board the aircraft.","d":"Both A and B are correct."},"answer":"d","answer_text":"Both A and B are correct.","explanation":"On a program (91K) flight, tasks \"associated with exercising Operational Control on a program flight are delegated by the owner to the Company\" — and both are jointly responsible.","source":"FOM 3.2.1","group":"g9"},{"n":70,"question":"The circadian low period is defined by the hours of ___to ___ based on the local time zone where a crewmember’s duty day begins.","choices":{"a":"1200 to 0400","b":"0100 to 0300","c":"0130 to 0400","d":"0200 to 0430"},"answer":"c","answer_text":"0130 to 0400","explanation":"The circadian low is 0130–0400 local to where your duty day starts.","source":"FOM 4.4.5","group":"u70"},{"n":71,"question":"The Company defines levels of automation with which of the following terms?","choices":{"a":"Manual, Shared, and Auto-flight","b":"Level I, II, III, and IV","c":"CAMI","d":"Autopilot on, Autopilot off"},"answer":"a","answer_text":"Manual, Shared, and Auto-flight","explanation":"The three automation levels are Manual, Shared, and Auto-flight.","source":"FOM 4.7.2","group":"u71"},{"n":72,"question":"Crewmembers will not donate blood within ___ hours of reporting for duty.","choices":{"a":"24","b":"36","c":"48","d":"72"},"answer":"d","answer_text":"72","explanation":"You can't donate blood within 72 hours of reporting for duty.","source":"FOM 4.3.7","group":"u72"},{"n":73,"question":"Engine starts and the before taxi checklists may be completed by a single pilot…","choices":{"a":"False","b":"at the discretion of the PIC.","c":"at the discretion of either crew member.","d":"only if approved by the FODM."},"answer":"b","answer_text":"at the discretion of the PIC.","explanation":"\"Engine starts and the before taxi checklist may be completed by a single pilot at the discretion of the PIC.\"","source":"FOM 4.11","group":"u73"},{"n":74,"question":"For all taxi operations, which following statement is true...","choices":{"a":"The PM will have the airport diagram out and available during the taxi.","b":"Maintain a “heads up” lookout during taxi.","c":"Both pilots must be task free when crossing runways.","d":"All the above are true."},"answer":"d","answer_text":"All the above are true.","explanation":"\"The PM will have the airport diagram out and available during taxi. Maintain a 'heads up' lookout during taxi.\" Both pilots task-free crossing runways — all true.","source":"FOM 4.11.1.1","group":"u74"},{"n":75,"question":"The standard DP/ODP or SID climb gradient is...","choices":{"a":"200 feet per nautical mile or 3.3%","b":"2.1% net","c":"1.6% net","d":"152 feet per nautical mile or 2.4%"},"answer":"a","answer_text":"200 feet per nautical mile or 3.3%","explanation":"The standard DP/ODP/SID climb gradient is 200 feet per nautical mile (3.3%).","source":"FOM 4.9.7.1","group":"u75"},{"n":76,"question":"Non-essential communication in the cockpit is prohibited during the following defined critical phases of flight.","choices":{"a":"All ground operation involving taxi, takeoff or landing, and any flight operations below 10,000 feet AGL except normal cruise flight, and within 1,000 feet of level- off altitude during climb or descent.","b":"Any flight operations below 10,000 feet AGL, and within 1,000 feet of level-off altitude during climb or descent.","c":"All operations within Class B, C, D, and E airspace.","d":"All operations below 25,000 feet."},"answer":"a","answer_text":"All ground operation involving taxi, takeoff or landing, and any flight operations below 10,000 feet AGL except normal cruise flight, and within 1,000 feet of level- off altitude during climb or descent.","explanation":"Sterile cockpit applies to taxi/takeoff/landing, below 10,000 ft AGL except normal cruise, and within 1,000 ft of a level-off.","source":"FOM 4.6.3","group":"g8"},{"n":77,"question":"Prior to takeoff, the flight crew will confirm that the altitude selector is set to the initial altitude.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"The departure briefing confirms the initial heading and altitude and that the altitude selector is set to the initial altitude.","source":"FOM 4.9.17","group":"u77"},{"n":78,"question":"Acceptance of any IFR departure clearance requires compliance with the minimum TERPS (Terminal Instrument Procedures) climb gradient requirements with...","choices":{"a":"One-engine inoperative to the MEA, MOCA, or other minimum IFR altitude.","b":"All engines operating.","c":"All engines operating with gear down.","d":"One-engine inoperative with takeoff flap setting."},"answer":"b","answer_text":"All engines operating.","explanation":"TERPS climb-gradient requirements are met with all engines operating.","source":"FOM 4.9.7.1","group":"u78"},{"n":79,"question":"For IFR departures, if ATC does not specify any other particular departure procedure prior to takeoff, a crewmember must comply with the departure procedure (DP or ODP) established by the FAA for the airport and runway to be used.","choices":{"a":"True, use of this procedure will provide obstacle clearance, and they are considered the standard IFR departure procedure.","b":"False, no specification of a departure procedure in the clearance implies that the crew is cleared direct to the first filed waypoint."},"answer":"a","answer_text":"True, use of this procedure will provide obstacle clearance, and they are considered the standard IFR departure procedure.","explanation":"With no ATC-specified procedure you fly the FAA DP/ODP, which provides obstacle clearance and is the standard — true.","source":"FOM 4.9.8.5","group":"g7"},{"n":80,"question":"In the approach chart you note that the missed approach point is a circled waypoint symbol. This icon indicates that the MAP is a...","choices":{"a":"fly-over waypoint.","b":"fly-by waypoint.","c":"visual point on the approach.","d":"VOR."},"answer":"a","answer_text":"fly-over waypoint.","explanation":"\"Fly-over waypoints are used when an aircraft should begin a turn to the next course over the waypoint\" — a circled symbol marks a fly-over waypoint.","source":"FOM 4.9.3.1","group":"u80"},{"n":81,"question":"What does the acronym CAMI stand for?","choices":{"a":"Confirm, Activate, Monitor, Intervene","b":"Catch, Activate, Manage, Interact","c":"Confirm, Accept, Manage, Intervene","d":"Capture, Accept, Monitor, Interact"},"answer":"a","answer_text":"Confirm, Activate, Monitor, Intervene","explanation":"CAMI = Confirm, Activate, Monitor, Intervene.","source":"FOM 4.7.3","group":"g6"},{"n":82,"question":"When any of the events that requires an incident report occur, or when otherwise required, the PIC (or other crewmember when requested), shall:","choices":{"a":"Immediately notify a Flight Department manager or Maintenance Duty Manager by calling the GCC.","b":"The GCC will generate an internal incident report which will provide initial notification to stake holders within the company.","c":"Complete an incident report submission listing all pertinent details of the event by logging in to https://www.oneskysafety.com","d":"All the above are true."},"answer":"d","answer_text":"All the above are true.","explanation":"When an event requires an incident report the PIC notifies a manager via the GCC and files the report at oneskysafety.com — all of the above.","source":"FOM 8.4","group":"u82"},{"n":83,"question":"When is the PIC required to do a manual obstacle analysis?","choices":{"a":"A crew is utilizing the “see and avoid” concept in VMC with the following conditions: An obstacle on the departure path cannot be avoided laterally, and an obstacle may impede the emergency briefing plan.","b":"For IFR departures from Class G air space for the portion of the departure prior to entering controlled airspace.","c":"A VFR flight is being conducted that needs to satisfy Ops Spec C077.","d":"All are correct."},"answer":"a","answer_text":"A crew is utilizing the “see and avoid” concept in VMC with the following conditions: An obstacle on the departure path cannot be avoided laterally, and an obstacle may impede the emergency briefing plan.","explanation":"A manual obstacle analysis is required when using see-and-avoid in VMC with an obstacle you can't avoid laterally that could interfere with the emergency plan. (Official key: answer a.)","source":"FOM 4.9.9","group":"u83"},{"n":84,"question":"If a potential discrepancy is discovered during taxi, the crew should...","choices":{"a":"Comply with section 5 of the FOM and complete the “Discrepancy Discovered After Blockout” procedures.","b":"Return to the ramp.","c":"Continue the flight and write up the discrepancy after landing at the destination.","d":"Ignore the item and hope it goes away."},"answer":"a","answer_text":"Comply with section 5 of the FOM and complete the “Discrepancy Discovered After Blockout” procedures.","explanation":"A discrepancy found during taxi follows the Section 5 'Discovered After Block Out' procedure.","source":"FOM 5.2.3","group":"u84"},{"n":85,"question":"When preparing the aircraft for a live leg, which of the following statements regarding the crewmembers proper actions is true?","choices":{"a":"The lavatory shall be checked for servicing, functionality, freshness and appearance.","b":"All trash shall be removed from the aircraft prior to each flight.","c":"Each seatbelt should be arranged in a crossed pattern on the seat with any excess belt material neatly tucked within the seat.","d":"Sit in the lead passenger seat and inspect the aircraft from the passenger perspective.","e":"All the above are true."},"answer":"e","answer_text":"All the above are true.","explanation":"All the listed live-leg cabin-prep items are true (lavatory serviced, trash removed, seatbelts arranged, inspect from the passenger seat).","source":"FOM 4.9","group":"u85"},{"n":86,"question":"The Maintenance Resolution process can be initiated by...","choices":{"a":"The PIC.","b":"Flight Department Manager.","c":"Maintenance Duty Manager.","d":"Maintenance Controller.","e":"All are correct."},"answer":"e","answer_text":"All are correct.","explanation":"Any of the listed roles can start the Maintenance Resolution process — all are correct.","source":"FOM 5.6","group":"u86"},{"n":87,"question":"Which of the following may the crew NOT connect to the onboard Wi-Fi and use during a flight?","choices":{"a":"Company issued iPad","b":"Personal electronic device(s)","c":"Company issued iPhone","d":"Answers A and C"},"answer":"b","answer_text":"Personal electronic device(s)","explanation":"\"Crewmembers may not use their personal PEDs during flight\" — onboard Wi-Fi is only for official business via company devices.","source":"FOM 4.9.22.16","group":"u87"},{"n":88,"question":"An approach that becomes unstabilized inside the 500-foot window requires an immediate go-around unless...","choices":{"a":"The PIC has more than 100 hours in type.","b":"The deviations are small and momentary in airspeed, sink rate, glide path and course and only require minor corrections.","c":"The pilot flying feels that the outcome is never in doubt.","d":"There are passengers on board."},"answer":"b","answer_text":"The deviations are small and momentary in airspeed, sink rate, glide path and course and only require minor corrections.","explanation":"\"The only acceptable outcome of an approach that is unstabilized at or inside the 500' window is a [go-around]\" unless deviations are small and momentary.","source":"FOM 4.14.11","group":"u88"},{"n":89,"question":"One of the SIC’s duties is to assume control of the aircraft as necessary to avoid a dangerous situation.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"An SIC's duties include assuming control of the aircraft as necessary to avoid a dangerous situation.","source":"FOM 4.6.1","group":"u89"},{"n":90,"question":"The emergency briefing acronym TEST stands for...","choices":{"a":"Train for success, Execute your plan, Survive, Time before rescue","b":"Type of emergency, Evacuation plan, Signals, Time before touchdown","c":"Tell ATC, Estimate landing site, Send for help, Try to communicate","d":"Tell Passengers, Estimate time till landing, Speed to minimum, Touchdown smoothly"},"answer":"b","answer_text":"Type of emergency, Evacuation plan, Signals, Time before touchdown","explanation":"TEST = Type of emergency, Evacuation plan, Signals, Time before touchdown.","source":"FOM 8","group":"g17"},{"n":91,"question":"Scheduling shall be advised if owners/passengers are more than ___ minutes late.","choices":{"a":"10","b":"15","c":"30","d":"45"},"answer":"b","answer_text":"15","explanation":"Notify Scheduling if owners or passengers are more than 15 minutes late.","source":"FOM Appendix 2","group":"u91"},{"n":92,"question":"The Company authorizes an aircraft to be taxied with only one crew member in their seat with seat belts fastened while the other crew member is dealing with passengers.","choices":{"a":"This is acceptable if one or all passengers require additional time during the brief.","b":"This is acceptable because one crew member may be assisting passenger with drinks and/or catering.","c":"This is not acceptable. Both pilots should be seated with belts fastened. One crew member then can begin to taxi while the other programs the FMS.","d":"This is never acceptable. The aircraft will not be moved under its own power until the pre-taxi brief is completed and both pilots are in their seats with their seat belt fastened."},"answer":"d","answer_text":"This is never acceptable. The aircraft will not be moved under its own power until the pre-taxi brief is completed and both pilots are in their seats with their seat belt fastened.","explanation":"\"The aircraft will not be moved under its own power until the pre-taxi brief is completed and both pilots are in their seats with their seat belt fastened.\"","source":"FOM 4.11","group":"u92"},{"n":93,"question":"If a crewmember requires hospitalization for any reason, another crewmember shall...","choices":{"a":"remain at the hotel and await further duty instructions.","b":"accompany that crewmember to the hospital and notify the GCC as soon as possible.","c":"remain with the aircraft and await further instructions.","d":"Both A and C are correct."},"answer":"b","answer_text":"accompany that crewmember to the hospital and notify the GCC as soon as possible.","explanation":"The other crewmember goes with the hospitalized crewmember and notifies the GCC as soon as possible.","source":"FOM 4.3.2","group":"u93"},{"n":94,"question":"No individual shall consume alcohol while on duty or within ____ hours prior to the end of a “required rest” period or “extended rest” period.","choices":{"a":"8","b":"10","c":"12","d":"24"},"answer":"a","answer_text":"8","explanation":"No alcohol within 8 hours before the end of a required rest period (or while on duty).","source":"FOM 4.3.4","group":"u94"},{"n":95,"question":"Section ___ of the FOM provides information on Flight Operations.","choices":{"a":"3","b":"5","c":"4","d":"8"},"answer":"c","answer_text":"4","explanation":"Section 4 of the FOM is titled \"Flight Operations.\"","source":"FOM 4","group":"u95"},{"n":96,"question":"A Rest Period is a period of time free of all responsibility for work or duty prior to the commencement of, or following completion of, a Duty Period, and during which the pilot or flight attendant cannot be required to receive contact from the Company.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"\"Rest Period – is a period of time free of all responsibility for work or duty... during which the pilot or flight attendant cannot be required to receive contact from the Company.\"","source":"FOM 4.4.1","group":"u96"},{"n":97,"question":"Which statement is TRUE regarding fatigue...","choices":{"a":"a crewmember needs to use countermeasures overcome his/her fatigue such as conversation, caffeine, etc…","b":"each crewmember has a duty to decline any assigned flight when they cannot safely operate a flight due to fatigue.","c":"a crewmember should only take one more flight assignment when feeling tired.","d":"each crewmember should manage assigned rest periods to not become fatigued."},"answer":"b","answer_text":"each crewmember has a duty to decline any assigned flight when they cannot safely operate a flight due to fatigue.","explanation":"\"[Each] crewmember has a duty to decline any assigned flight when they cannot safely operate a flight due to fatigue.\"","source":"FOM 4.4.4","group":"u97"},{"n":98,"question":"Trip times in Tailwinds may differ from flight plan times because passenger trips are scheduled in Tailwinds based on Boeing 85% probability annual wind aloft data while flight plans calculate times based on short term forecast conditions.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Tailwinds times are \"predicated on data derived from the Boeing 85% probability annual wind aloft data\"; flight plans use short-term forecasts.","source":"FOM 4.4.7","group":"u98"},{"n":99,"question":"After landing, checklists shall not be started until...","choices":{"a":"the aircraft has slowed on the landing roll to below 65 KIAS.","b":"the thrust reversers have been stowed by the pilot flying.","c":"the aircraft has cleared the active runway.","d":"the aircraft is stopped on the runway."},"answer":"c","answer_text":"the aircraft has cleared the active runway.","explanation":"\"After landing, checklists shall not be started until the aircraft has cleared the active runway.\"","source":"FOM 4.6.6","group":"u99"},{"n":100,"question":"Should the PM (Pilot Monitoring) call out a flight deviation or condition to the PF (Pilot Flying) and there is no response after the ___ challenge, the PM shall verbally announce that he/she is assuming control of the aircraft and take the necessary action to correct the deviation to ensure the safety of the aircraft.","choices":{"a":"first","b":"second","c":"third","d":"fourth"},"answer":"b","answer_text":"second","explanation":"If the pilot flying doesn't respond after the second challenge, the monitoring pilot takes control.","source":"FOM 4.6.6.2","group":"u100"},{"n":101,"question":"When flows are authorized in the CFM, the flow followed by the challenge and response method will be used to complete required checklists.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"\"When flows are authorized in the CFM, the flow followed by the challenge and response method will be used to complete required checklists.\"","source":"FOM 4.6.6","group":"u101"},{"n":102,"question":"The responsibility for command and control of aircraft is _____ delegated to automation.","choices":{"a":"never","b":"always","c":"sometimes","d":"required to be"},"answer":"a","answer_text":"never","explanation":"The crew keeps \"responsibility for command and control of the aircraft flight path; this responsibility is never delegated to automation.\"","source":"FOM 4.7.1","group":"u102"},{"n":103,"question":"The practice of loading the flight plan route prior to picking up the ATC clearance is…","choices":{"a":"discouraged.","b":"encouraged because it helps the crew get ahead.","c":"encouraged but should never be placed in the primary FMS.","d":"encouraged because you can review fixes along the route."},"answer":"a","answer_text":"discouraged.","explanation":"Loading the flight-plan route before you have the ATC clearance is discouraged.","source":"FOM 4","group":"u103"},{"n":104,"question":"VFR charts (electronic or paper) are required onboard an aircraft...","choices":{"a":"always.","b":"only when VFR operations are conducted.","c":"never because we have IFR charts.","d":"never because we do not operate VFR."},"answer":"b","answer_text":"only when VFR operations are conducted.","explanation":"VFR charts are required only when VFR operations are conducted — not needed if you're IFR the whole flight.","source":"FOM 4.8.26.2","group":"u104"},{"n":105,"question":"For aircraft without operative outlets installed in the cockpit, minimum dispatch battery power available (at block out) as indicated on the iPad is___. If below ___ on either EFB, paper approach charts must be printed before flight.","choices":{"a":"25 25","b":"30 25","c":"30 30","d":"50 25"},"answer":"c","answer_text":"30 30","explanation":"Minimum dispatch battery is 30%; below 30% on either EFB, print paper approach charts.","source":"FOM 4.8.25.2","group":"u105"},{"n":106,"question":"Display of Own-Ship position on approved portable and installed EFB units while on the ground or inflight is required to aid situational awareness.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Displaying own-ship position (on the ground or in flight) is required to help situational awareness — true.","source":"FOM 4.8.23","group":"u106"},{"n":107,"question":"Crewmembers shall discontinue the use of own-ship during ground operations whenever any discrepancies (no more than 30 meters) are observed between the actual aircraft position and the own-ship position display.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Stop using own-ship on the ground whenever you see a discrepancy (within 30 meters) between the actual and displayed position — true.","source":"FOM 4.8.23","group":"u107"},{"n":108,"question":"A runway is considered as “wet” when it is well soaked but without significant areas of standing water. A runway is considered well soaked when there is sufficient moisture on the runway surface to cause it to appear reflective.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"A runway is 'wet' when it's soaked and looks reflective but has no significant standing water — true.","source":"FOM 4.9.10","group":"u108"},{"n":109,"question":"Runway Condition definitions in the FOM are not intended to, and will not be used to, supersede any applicable aircraft AFM information or limitation.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"The FOM's runway definitions never override the aircraft AFM limitations — true.","source":"FOM 4.9.10","group":"u109"},{"n":110,"question":"Any items secured to an aircraft seat cannot exceed the floor loading limitations and cannot obstruct the emergency exit or aisle.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Items secured to a seat can't exceed the floor loading limits or obstruct an emergency exit or aisle.","source":"FOM 4.9.13","group":"u110"},{"n":111,"question":"Flexjet LLC has been designated an “Eligible On-Demand Operator.” This means that during FAR 135 operations the operator...","choices":{"a":"may file to, and begin an instrument approach procedure to, an airport that does not have a weather reporting facility but must file an alternate airport that has a weather reporting facility.","b":"may utilize the 80 percent rule for landing when a destination airport analysis has been completed and approved for that destination.","c":"may select an airport as an alternate if the aircraft can be brought to a full stop within 80 percent of the effective runway.","d":"All are correct."},"answer":"d","answer_text":"All are correct.","explanation":"As an Eligible On-Demand operator, all the listed statements are correct.","source":"FOM 4.9.11","group":"g16"},{"n":112,"question":"With regard to DAAP operations, a first officer who has logged fewer than 100 hours in their assigned aircraft type shall not conduct any takeoffs or landings under the following conditions...","choices":{"a":"Windshear is reported in the vicinity of the airport.","b":"When braking action is reported to be less than “Good” for the runway.","c":"When the runway has contamination which may adversely affect aircraft performance.","d":"All are correct."},"answer":"d","answer_text":"All are correct.","explanation":"For a sub-100-hour FO, all the listed conditions (windshear, braking less than good, contamination) prohibit their takeoff or landing.","source":"FOM 4.9.11.2","group":"u112"},{"n":113,"question":"A Duty Period may be extended, with crew concurrence, when....","choices":{"a":"a delay occurs due to circumstances beyond the control of the company or the flight crew.","b":"all the scheduled flight assignments for the Duty Period were realistically planned within regulatory limits.","c":"the FODM approves an extension.","d":"All are correct."},"answer":"d","answer_text":"All are correct.","explanation":"A duty period can be extended (with crew agreement) for delays beyond your control when the day was realistically planned and the FODM approves — all correct.","source":"FOM 4.4.8","group":"u113"},{"n":114,"question":"The FODM may only approve extensions to the duty period up to a maximum of…","choices":{"a":"15 hours for a 2 pilot crew.","b":"19 hours for a 3 pilot crew.","c":"21 hours for a 4 pilot crew.","d":"All are correct."},"answer":"d","answer_text":"All are correct.","explanation":"The FODM can approve extensions up to 15, 19, and 21 hours for a 2-, 3-, and 4-pilot crew.","source":"FOM 4.4.9","group":"u114"},{"n":115,"question":"Should a crewmember need to be removed from duty due to fatigue, that crewmember shall...","choices":{"a":"Advise the GCC as soon as possible.","b":"Contact the Chief Pilot within 24 hours to discuss the circumstances of the fatigue related schedule adjustment.","c":"Submit an “Incident” or “ASAP” report within 24 hours.","d":"All of the above."},"answer":"a","answer_text":"Advise the GCC as soon as possible.","explanation":"The crewmember's job is to advise the GCC as soon as possible; the GCC then removes them and generates the report.","source":"FOM 4","group":"u115"},{"n":116,"question":"If an aircraft discrepancy has been entered onto the Form 501 by the flight crew and the crew determines that the entry requires modification...","choices":{"a":"The crewmember my draw a single line through the entire text affected. Initial and date next to the stricken text. Rewrite the entry as required.","b":"The PIC, Maintenance Control, and Company management must all agree to the correction before it may be modified.","c":"The entire 501 form must be voided out.","d":"All are correct."},"answer":"a","answer_text":"The crewmember my draw a single line through the entire text affected. Initial and date next to the stricken text. Rewrite the entry as required.","explanation":"To fix a 501 entry, draw one line through it, initial and date it, and rewrite it.","source":"FOM 5.2.9","group":"u116"},{"n":117,"question":"At least one crewmember, at the controls, must wear, secured and sealed, an O 2 mask above what pressure altitude under FAR 135?","choices":{"a":"Flight Level 410.","b":"Flight Level 350.","c":"Flight Level 250, any time one crewmember has left a duty station.","d":"Both B and C are correct"},"answer":"d","answer_text":"Both B and C are correct","explanation":"Wear the O2 mask above FL350, and above FL250 any time one pilot leaves the station — both B and C.","source":"FOM 4 / FAR 135.89","group":"g4"},{"n":118,"question":"A rejected takeoff is any action by the pilot that prevents a normal takeoff once the aircraft has been cleared into position for takeoff. If this occurs...","choices":{"a":"The PIC must submit an incident report to the Company within 24 hours.","b":"The event will be immediately reported to a Flight Department manager by calling GCC.","c":"No action is required.","d":"Both A and B are correct."},"answer":"d","answer_text":"Both A and B are correct.","explanation":"A rejected takeoff is reported both ways: notify a Flight Department manager via GCC and file an incident report within 24 hours.","source":"FOM 8.4.1.1","group":"u118"},{"n":119,"question":"A Passenger Safety Briefing shall be given to the passengers on an FAR 91K or FAR 135 trip...","choices":{"a":"for passengers who indicate that they are unfamiliar with the safety briefing.","b":"on the first flight of each day.","c":"prior to each takeoff.","d":"for any passenger who has not flown within the preceding 90 days."},"answer":"c","answer_text":"prior to each takeoff.","explanation":"A passenger safety briefing is required by the FOM and is given prior to each takeoff.","source":"FOM App. 2, A2.3","group":"u119"},{"n":120,"question":"What announcements must be made to passengers using the PA system on an FAR 135 trip?","choices":{"a":"“Prepare for takeoff” – when takeoff is imminent.","b":"“Prepare the cabin for landing” – approximately 10 minutes from landing.","c":"“Prepare for landing” – approximately 2 to 3 minutes from landing.","d":"None are correct."},"answer":"d","answer_text":"None are correct.","explanation":"None are correct — the PA system is avoided; takeoff, arrival, and landing cues are given with seat-belt signs and cabin chimes, not PA announcements.","source":"FOM Appendix 2","group":"u120"},{"n":121,"question":"Entering a runway (active or non-active) for the purpose of crossing or positioning for takeoff, crewmembers shall do the following before crossing the hold short lines:","choices":{"a":"Both pilots must hear and understand the taxi clearance and verbally agree before crossing any runway hold short line.","b":"Both pilots must be task free.","c":"The left seat pilot must ensure the area on the left is clear and then state “Clear left”. The right seat pilot must check the area on the right is clear then state “Clear right”.","d":"All are correct."},"answer":"d","answer_text":"All are correct.","explanation":"All the listed runway-entry actions are required before crossing the hold-short line.","source":"FOM 4.11.1.4","group":"u121"},{"n":122,"question":"The flight crew shall maintain ___________ for all flight operations conducted __________.","choices":{"a":"A quiet environment / with passengers aboard","b":"Sterile cockpit / below 10,000’ (AGL)","c":"Sterile cockpit / only during takeoff and landing","d":"Absolute silence / below 10,000’ (AGL)"},"answer":"b","answer_text":"Sterile cockpit / below 10,000’ (AGL)","explanation":"Maintain a sterile cockpit for all operations below 10,000 ft AGL.","source":"FOM 4.6.3","group":"g8"},{"n":123,"question":"A “Land and Hold Short” clearance can only be accepted if the flight crew can assure ATC that the aircraft can be stopped well short of the point specified.","choices":{"a":"True","b":"False"},"answer":"b","answer_text":"False","explanation":"The company isn't authorized to do LAHSO, so a hold-short clearance can't be accepted — the statement is false.","source":"FOM 4.14.18","group":"g1"},{"n":124,"question":"IVSI should not exceed ________ fpm to be considered a “stabilized approach.”","choices":{"a":"500","b":"1000","c":"1500","d":"2000"},"answer":"b","answer_text":"1000","explanation":"\"The descent rate should not be allowed to exceed 1,000 feet per minute at any time\" to be a stabilized approach (IVSI less than 1000 fpm).","source":"FOM 4.14.11","group":"u124"},{"n":125,"question":"Prior to takeoff in icing conditions, which of the following statements is true?","choices":{"a":"The aircraft must be free of all frozen contaminants adhering to the wings, control surfaces, engine inlets, or other critical surfaces before takeoff.","b":"Always increase rotation speeds to account for the increase in stall speed with ice on the wings.","c":"Always make sure that there is approximately the same amount of ice on each wing.","d":"Make sure to move the controls forcefully during taxi to break loose any ice that might be binding them."},"answer":"a","answer_text":"The aircraft must be free of all frozen contaminants adhering to the wings, control surfaces, engine inlets, or other critical surfaces before takeoff.","explanation":"The aircraft must be \"free of all frozen contaminants prior to takeoff.\"","source":"FOM 7.3.1","group":"u125"},{"n":126,"question":"Regardless of the “Holdover Times,” a pre-takeoff contamination check must be accomplished within _________ before takeoff in ground-icing conditions.","choices":{"a":"10 minutes","b":"Just before","c":"5 minutes","d":"2 minutes"},"answer":"c","answer_text":"5 minutes","explanation":"Regardless of holdover time, do the pre-takeoff contamination check within 5 minutes of takeoff.","source":"FOM 7","group":"g5"},{"n":127,"question":"You are given a braking action report of “NIL” from a G-IV that landed just prior to starting your approach. Upon receiving that report you must...","choices":{"a":"Not takeoff or land on a runway that is reporting “nil” breaking action from a reliable and timely breaking action report.","b":"Exercise extreme caution upon touchdown.","c":"Avoid using the brakes, as they will be ineffective.","d":"Ensure that you’re using the longest available runway."},"answer":"a","answer_text":"Not takeoff or land on a runway that is reporting “nil” breaking action from a reliable and timely breaking action report.","explanation":"With a reliable and timely 'NIL' braking report you will not take off or land on that runway.","source":"FOM 7","group":"u127"},{"n":128,"question":"Which of the following is true regarding anti-icing holdover time (HOT)?","choices":{"a":"Holdover times are revised every year and are located on EFBs and/or the Aircrew Portal.","b":"Crew members may reference the Holdover Calculator application by Kilo Lima Management via their Company iPhone.","c":"HOT’s are advisory only. A pre-takeoff contamination check must be accomplished within 5 minutes of takeoff whenever operating in ground icing conditions.","d":"All are true."},"answer":"d","answer_text":"All are true.","explanation":"All the listed holdover-time statements are true.","source":"FOM 7.3.9","group":"g15"},{"n":129,"question":"After an accident, is it permissible to move or damage an aircraft’s parts or records?","choices":{"a":"No.","b":"Not unless you are one of the crewmembers.","c":"Yes, but only if it is necessary to assist persons injured or trapped.","d":"Only at the direction of the Chief Pilot."},"answer":"c","answer_text":"Yes, but only if it is necessary to assist persons injured or trapped.","explanation":"You may \"remove persons injured or trapped if appropriate\" — wreckage may be moved only to help injured or trapped people.","source":"FOM 8.2.1","group":"u129"},{"n":130,"question":"In the event of an aircraft accident/incident...","choices":{"a":"Do not give any statement to anyone, including the FAA, until cleared to do so by company management.","b":"Do not speak to the media or make any statements regarding the accident/incident to anyone.","c":"Do not, under any circumstances, speculate as to the cause of the accident/incident.","d":"All are correct."},"answer":"d","answer_text":"All are correct.","explanation":"\"DO NOT GIVE ANY STATEMENT TO ANYONE, INCLUDING THE FEDERAL AVIATION ADMINISTRATION, UNTIL CLEARED TO DO SO BY COMPANY MANAGEMENT\" — and don't speak to media or speculate.","source":"FOM 8.2.1","group":"u130"},{"n":131,"question":"For international operations, a check of passports and other appropriate documents for the international travel is required.","choices":{"a":"True, except that minors do not need proof of citizenship.","b":"True.","c":"False."},"answer":"b","answer_text":"True.","explanation":"\"A check of passports and other appropriate documents for the international travel is required\" — minors are not exempt.","source":"FOM App. 2, A2.3.3.1","group":"u131"},{"n":132,"question":"When calculating aircraft weight and balance, the crew may utilize...","choices":{"a":"Approved average passenger weights.","b":"Actual passenger weights.","c":"The crew’s own estimates based upon previous weight guessing experience.","d":"Both A and B."},"answer":"d","answer_text":"Both A and B.","explanation":"Weight and balance may use approved average passenger weights or actual weights.","source":"FOM App. 3","group":"u132"},{"n":133,"question":"Pilot crewmembers will receive an updated weather briefing within ____ minutes prior to landing at the destination.","choices":{"a":"10","b":"30","c":"45","d":"There is no requirement to update weather info. in flight."},"answer":"b","answer_text":"30","explanation":"Updated weather briefing within 30 minutes of landing.","source":"FOM 4.14.2","group":"g0"},{"n":134,"question":"The appropriate Takeoff and Landing (TOLD) information card is to be completed prior to each takeoff and landing. The takeoff section shall be completed prior to departure. The landing section shall be completed during the enroute phase of flight during the landing assessment check. The only exception to this is a very short leg.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"\"The appropriate Takeoff and Landing (TOLD) information card is to be completed prior to each takeoff and landing.\"","source":"FOM 4.9.20","group":"u134"},{"n":135,"question":"During Takeoff and Landing, pilots will be alert for windshear warnings or indications and perform the aircraft specific windshear escape maneuver when applicable.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"On the warning the \"PF will execute the manufacturers CFIT escape maneuver and associated memory items.\"","source":"FOM 4.13.4","group":"u135"},{"n":136,"question":"Which of the following is true about thunderstorms?","choices":{"a":"If thunderstorm activity is forecast along the route of flight, the thunderstorm detection equipment must be operational.","b":"The aircraft should never be flown closer than 5 miles to any visible storm cloud with overhanging areas because of the possibility of encountering hail.","c":"While enroute, crewmembers will avoid suspected “severe” storm cells by at least 20 miles, and it is recommended that all thunderstorms will be avoided by a minimum of 10 miles.","d":"All are true."},"answer":"d","answer_text":"All are true.","explanation":"Avoid severe cells by at least 20 miles and all thunderstorms by 10 miles; \"turbulence may be encountered within 20 miles of very strong thunderstorms.\" All true.","source":"FOM 7.4.2","group":"u136"},{"n":137,"question":"Advanced Passenger Information System (APIS) reports must be submitted for each flight...","choices":{"a":"At least 60 minutes prior to departure for all inbound/outbound flights to/from the United States.","b":"At least 72 hours prior to departure for inbound/outbound flights to/from the United States.","c":"Only for flights designated as “threat locations” by the Department of Homeland Security.","d":"None of the above."},"answer":"a","answer_text":"At least 60 minutes prior to departure for all inbound/outbound flights to/from the United States.","explanation":"eAPIS must be submitted at least 60 minutes before departure to or from the US.","source":"IOM Appendix M","group":"u137"},{"n":138,"question":"When operating a trip into Canada, a minimum of 2 hours (no more than 48 hours) notice is required to inform Canadian Border Services Agency (CBSA) of your ETA using the 1-888-CANPASS number.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"For Canada, give CANPASS at least 2 hours' (max 48) notice — true.","source":"IOM 5.2.1.4","group":"u138"},{"n":139,"question":"On flights along routes utilizing Long Range Navigation Systems as the primary source of navigation, how many “Master Documents” will be kept by the crew?","choices":{"a":"Each crewmember is responsible for their own Master Document so that they may be compared to each other.","b":"The Master Document is kept by the GCC.","c":"Three. One for each crewmember plus one to be turned into the company.","d":"Only one Master Document shall be used on the flight deck."},"answer":"d","answer_text":"Only one Master Document shall be used on the flight deck.","explanation":"Only one Master Document is used on the flight deck.","source":"IOM Appendix B","group":"u139"},{"n":140,"question":"For oceanic operations, each pilot will check clearances against the Master Document, track messages, and plotting charts.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Each pilot checks clearances against the Master Document — true.","source":"IOM 2","group":"u140"},{"n":141,"question":"You are flying eastbound from Wilmington, DE to Bermuda at FL390, not in radar contact. You request a weather deviation north of course for a thunderstorm. If an amended clearance cannot be obtained from ATC, you should...","choices":{"a":"Deviate around the weather without advising ATC.","b":"Advise ATC, and deviate to the north. When 5 from original track, descend to FL387.","c":"Advise ATC, and deviate to the north. When 5 from original track, descend to FL380.","d":"None of the above."},"answer":"b","answer_text":"Advise ATC, and deviate to the north. When 5 from original track, descend to FL387.","explanation":"Advise ATC and, deviating north of an eastbound track, descend 300 ft to FL387 when about 5 NM off track.","source":"IOM 3.1.2","group":"u141"},{"n":142,"question":"IOM Altimetry Procedures require the crew to monitor the altitude control system and not allow the aircraft to overshoot or undershoot a cleared flight level by more than...","choices":{"a":"150’","b":"50’","c":"100’","d":"None of the above"},"answer":"a","answer_text":"150’","explanation":"Don't let the aircraft overshoot or undershoot the cleared flight level by more than 150 feet.","source":"IOM 2.3.8","group":"u142"},{"n":143,"question":"The Strategic Lateral Offset Procedure (SLOP) is intended to mitigate wake vortex encounters, and can be applied in U.S. Domestic Airspace without advising ATC.","choices":{"a":"True","b":"False"},"answer":"b","answer_text":"False","explanation":"SLOP is an oceanic/remote procedure, not for US domestic airspace — so the statement is false.","source":"IOM 2.3.10.2","group":"u143"},{"n":144,"question":"Which document may be referenced for international operations?","choices":{"a":"International Operations Manual","b":"Jeppesen Manuals","c":"Oceanic Flight Folder","d":"FOM Appendix 4","e":"All the above."},"answer":"e","answer_text":"All the above.","explanation":"All the listed international references may be used.","source":"IOM","group":"u144"},{"n":145,"question":"Trips may be conducted under FAR Part 91 for the purposes of...","choices":{"a":"Crewmember training.","b":"Maintenance tests.","c":"Ferrying and repositioning.","d":"All of the above."},"answer":"d","answer_text":"All of the above.","explanation":"Part 91 is allowed for training, maintenance tests, and ferry/repositioning — all of the above.","source":"Ops Specs","group":"u145"},{"n":146,"question":"Survey-Derived Average Baggage Weights in pounds are as follows: Personal Item ____, Checked Bags ____.","choices":{"a":"10, 20","b":"12, 30","c":"30, 40","d":"20, 30"},"answer":"b","answer_text":"12, 30","explanation":"Survey-derived average weights: personal item 12 lb, checked bag 30 lb.","source":"Ops Specs A097","group":"u146"},{"n":147,"question":"In which document(s) will you find our requirements for Alternate Airport IFR weather minimums?","choices":{"a":"On the Instrument Approach Procedure","b":"Op Spec C079","c":"Ground Deicing Program Manual","d":"Op Spec C055"},"answer":"d","answer_text":"Op Spec C055","explanation":"Alternate-airport IFR weather minimums are in Ops Spec C055 (C079 is takeoff minimums).","source":"Ops Specs C055","group":"u147"},{"n":148,"question":"Pilots are authorized to depart VFR and pick up an IFR clearance en route if...","choices":{"a":"VFR cloud clearances can be maintained.","b":"an IFR clearance is obtained within 50nm.","c":"it is not otherwise possible to obtain an IFR clearance.","d":"All are correct."},"answer":"d","answer_text":"All are correct.","explanation":"You can depart VFR and pick up IFR if you keep VFR cloud clearances, get the clearance within 50 NM, and it wasn't otherwise possible — all correct.","source":"Ops Specs C077","group":"u148"},{"n":149,"question":"What is the lowest minimum visibility that we are authorized to use for takeoff when RVR is not available?","choices":{"a":"1 nm","b":"1 sm","c":"¼ sm","d":"¼ nm"},"answer":"c","answer_text":"¼ sm","explanation":"With no RVR available, the lowest takeoff visibility is 1/4 statute mile.","source":"Ops Specs C079","group":"g11"},{"n":150,"question":"What is the lowest RVR minimum that we are authorized to use for takeoff, when RVR is available?","choices":{"a":"500 RVR","b":"600 RVR","c":"1600 RVR","d":"1800 RVR"},"answer":"a","answer_text":"500 RVR","explanation":"The lowest takeoff RVR authorized is 500.","source":"Ops Specs C079","group":"g11"},{"n":151,"question":"Where is the Ops Spec authorization to conduct operations in RVSM airspace found?","choices":{"a":"D085","b":"B046","c":"A041","d":"C055"},"answer":"b","answer_text":"B046","explanation":"RVSM authorization is Ops Spec B046.","source":"Ops Specs B046","group":"u151"},{"n":152,"question":"Which of the following instrument approach procedure is NOT authorized?","choices":{"a":"LDA PRM","b":"RNAV (GPS) or RNP","c":"RNAV (GPS) PRM","d":"RNAV (RNP) or RNP AR"},"answer":"d","answer_text":"RNAV (RNP) or RNP AR","explanation":"RNAV (RNP) / RNP AR is the one not authorized — LDA PRM, RNAV-GPS PRM, and ILS/PRM are.","source":"Ops Specs","group":"g2"},{"n":153,"question":"What is the lowest IFR landing minimums authorized for use?","choices":{"a":"2400 RVR","b":"½ SM","c":"1800 RVR","d":"4500 RVR"},"answer":"c","answer_text":"1800 RVR","explanation":"The lowest landing minimum is 1800 RVR.","source":"Ops Specs C059","group":"u153"},{"n":154,"question":"When determining the minimum weather to be used for an alternate airport, we may apply the weather minimums that are published on the Instrument approach procedure in the FOR FILING AS AN ALTERNATE section.","choices":{"a":"True","b":"False"},"answer":"b","answer_text":"False","explanation":"Alternate minimums must be derived from the C055 table (add 400-1 / 600-2), not taken from the chart's 'for filing as alternate' box — so the statement is false.","source":"Ops Specs C055","group":"u154"},{"n":155,"question":"Which flights do Management Specs apply to?","choices":{"a":"Part 91K","b":"Part 91","c":"Part 135","d":"All flights"},"answer":"a","answer_text":"Part 91K","explanation":"Management Specs apply to the 91K program (all its flights).","source":"M Specs","group":"u155"},{"n":156,"question":"Flexjet is authorized to conduct flights under _________ using the applicable authorizations in the Operations Specifications.","choices":{"a":"Part 91K","b":"Part 135 and Part 91","c":"All flights","d":"None of the above"},"answer":"b","answer_text":"Part 135 and Part 91","explanation":"Under the Ops Specs, Flexjet conducts Part 135 and Part 91 (the 91K program uses the Management Specs).","source":"Ops Specs A001","group":"u156"},{"n":157,"question":"Select the statement that is true regarding operations in RVSM airspace...","choices":{"a":"Aircraft must have two independent altitude measurement systems.","b":"Aircraft must have an altitude alert system.","c":"Aircraft must have an operational autopilot with altitude hold and the aircraft must have an operational SSR altitude reporting transponder","d":"All are true."},"answer":"d","answer_text":"All are true.","explanation":"All the listed RVSM statements are true.","source":"Ops Specs B046","group":"u157"},{"n":158,"question":"When it is not possible for the flight crew to obtain an IFR clearance to depart on an IFR flight plan, VFR departures are authorized, but subject to the provisions of Op Spec...","choices":{"a":"C077","b":"C055","c":"A041","d":"B036"},"answer":"a","answer_text":"C077","explanation":"VFR departures fall under Ops Spec C077.","source":"Ops Specs C077","group":"u158"},{"n":159,"question":"Crews are authorized to conduct RNAV (GPS) PRM approaches.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"RNAV (GPS) PRM approaches are authorized — true.","source":"Ops Specs","group":"g2"},{"n":160,"question":"Pilots may use weather from which of the following approved sources?","choices":{"a":"The National Weather Services for those United States and its territories located outside of the 48 contiguous States.","b":"U.S. and North Atlantic Treaty Organization (NATO) military observing and forecasting sources.","c":"A meteorological station, or automated observation weather product, authorized by an ICAO member State.","d":"All are correct."},"answer":"d","answer_text":"All are correct.","explanation":"All the listed weather sources are approved.","source":"Ops Specs","group":"u160"},{"n":161,"question":"Crewmembers are authorized to use MDA as a DA during a non-precision approach as long as certain requirements are satisfied.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"You may use the MDA as a DA when the C073 requirements are met — true.","source":"Ops Specs C073","group":"u161"},{"n":162,"question":"During an operation conducted under FAR 135, who has operational control?","choices":{"a":"The Company and the share owner are jointly and individually responsible.","b":"The FAA.","c":"The Company.","d":"FODM."},"answer":"c","answer_text":"The Company.","explanation":"Under Part 135, the company has operational control.","source":"Ops Specs","group":"g9"},{"n":163,"question":"What minimums may be used for approach Procedures Using GPS or GPS Wide Area Augmentation System (WAAS) aboard company aircraft?","choices":{"a":"LPV minimums if aircraft is approved.","b":"LNAV/VNAV minimums if aircraft is approved.","c":"LP or LNAV minimums if aircraft is approved.","d":"All are correct."},"answer":"d","answer_text":"All are correct.","explanation":"LPV, LNAV/VNAV, and LP/LNAV minimums are all usable if the aircraft is approved.","source":"Ops Specs","group":"u163"},{"n":164,"question":"Under Part 135 an IFR flight plan may only be cancelled at an uncontrolled airport...","choices":{"a":"When asked to do so by ATC to expedite another departure from the airport.","b":"If crewmembers are in direct communication with an air/ground facility at the destination that can provide airport traffic advisories and information pertinent to conditions on and around the landing surface.","c":"IFR must be maintained until clear of the landing runway.","d":"When visual reference with the landing surface is established and can be maintained.","e":"Both b and d"},"answer":"e","answer_text":"Both b and d","explanation":"You can cancel IFR at an uncontrolled field only under both conditions b and d.","source":"Ops Specs","group":"u164"},{"n":165,"question":"You’re at an airport with an operable ASOS that is reporting a visibility of ¼ statute mile. The airport has medium intensity runway lights and no visible centerline stripes. At this airport, you may...","choices":{"a":"Not takeoff.","b":"Takeoff only if you are provided with other visual references that will adequately allow you to continuously identify the takeoff surface and maintain directional control.","c":"Only takeoff with the delegated approval of flight control.","d":"Takeoff only with a localizer on the runway to be used that will allow the aircraft to maintain runway centerline during the takeoff roll."},"answer":"b","answer_text":"Takeoff only if you are provided with other visual references that will adequately allow you to continuously identify the takeoff surface and maintain directional control.","explanation":"You may take off at 1/4 SM only if you have adequate visual references to identify the surface and keep directional control.","source":"Ops Specs C079","group":"u165"},{"n":166,"question":"You’re at an airport that has only one functioning RVR transmissometer on the runway to be used. That transmissometer is reporting 700 RVR. You may...","choices":{"a":"Takeoff since it is above the Company minimums of 500 RVR.","b":"Takeoff only if other visual references are available to identify the takeoff surface.","c":"Takeoff if you can get a pilot report that is better than the official report.","d":"Not takeoff since at least two RVR reports would be required."},"answer":"d","answer_text":"Not takeoff since at least two RVR reports would be required.","explanation":"You can't take off — below RVR 1600 you need at least two working RVR sensors, and here there's only one.","source":"Ops Specs C079","group":"u166"},{"n":167,"question":"Required equipment for operating in RVSM airspace includes...","choices":{"a":"An automatic altitude control system and altitude alert system.","b":"Two independent altimeter systems.","c":"One altitude reporting transponder.","d":"All are correct."},"answer":"d","answer_text":"All are correct.","explanation":"All the listed RVSM equipment is required.","source":"Ops Specs B046","group":"u167"},{"n":168,"question":"Company pilots may carry a tire/wheel assembly with a serviceable tire, provided the tire is not over inflated, and the tire is protected from damage during transport.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"A serviceable tire/wheel assembly may be carried if it isn't over-inflated and is protected from damage — true.","source":"HazMat Manual","group":"u168"},{"n":169,"question":"Passengers or crewmembers may carry a small medical or clinical mercury thermometer for personal use when in protective cases in checked baggage.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"A small medical mercury thermometer in a protective case is allowed in checked baggage — true.","source":"HazMat Manual","group":"u169"},{"n":170,"question":"A maximum of _____ pounds of dry ice per person may be carried in the cabin area.","choices":{"a":"3","b":"4.4","c":"5.5","d":"enough to keep perishables fresh"},"answer":"c","answer_text":"5.5","explanation":"Up to 5.5 lb (2.5 kg) of dry ice per person.","source":"HazMat Manual","group":"u170"},{"n":171,"question":"Electric wheelchairs may be accepted for transport. What limitation(s) exist if the battery is considered to be spill-able?","choices":{"a":"The battery must be disconnected and terminals must be insulated.","b":"If the battery is removed, it must be stored in a strong container.","c":"If the battery is removed the packaging must be labeled with a CORROSIVE label, marked to indicate proper orientation, and marked with the words, “Battery, wet, with wheelchair.”","d":"All answers are correct."},"answer":"d","answer_text":"All answers are correct.","explanation":"For a spillable-battery wheelchair all the listed conditions apply — disconnect and insulate, strong packaging, and a CORROSIVE label with orientation and wording.","source":"HazMat Manual","group":"u171"},{"n":172,"question":"A current copy of the hazmat manual shall be available on board each aircraft in electronic or paper format. Where do crewmembers find this manual?","choices":{"a":"In the Aircraft Flight Manual.","b":"In Foreflight Documents and in the Flexjet Documents drive","c":"In the quick reference handbook (QRH).","d":"Flight crew members do not have access to the hazmat manual while on the flight deck and should carry a hard copy in their flight bag."},"answer":"b","answer_text":"In Foreflight Documents and in the Flexjet Documents drive","explanation":"The hazmat manual is in ForeFlight Documents and the Flexjet Documents drive.","source":"HazMat Manual","group":"u172"},{"n":173,"question":"Small arms ammunition for personal use carried by a crewmember or passenger in his baggage, excluding carry-on baggage, is approved if securely packed in boxes or other packaging specifically designed to carry small amounts of ammunition.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Small-arms ammunition for personal use is allowed in checked baggage if securely packed — true.","source":"HazMat Manual","group":"u173"},{"n":174,"question":"Curling irons containing a hydrocarbon gas (example... butane) are a HAZMAT exception. No more than one per passenger or crewmember, may be carried aboard company aircraft provided that the safety cover is securely fitted over the heating element. Gas refills for such curlers are not permitted in checked or carry-on baggage.","choices":{"a":"False, butane is listed on the most current DOT chart, and therefore, may not be carried.","b":"False, butane curling irons are no longer being produced.","c":"True","d":"False, curling irons are not approved"},"answer":"c","answer_text":"True","explanation":"A butane curling iron is allowed with its safety cover on; gas refills are not — true.","source":"HazMat Manual","group":"u174"},{"n":175,"question":"One self-defense spray, not exceeding 4 fluid ounces by volume that incorporates a positive means to prevent accidental discharge, may be carried in checked baggage only.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"One self-defense spray up to 4 oz is allowed in checked baggage only — true.","source":"HazMat Manual","group":"u175"},{"n":176,"question":"Battery powered heat-producing articles (e.g., battery-operated equipment such as diving lamps and soldering equipment) are only permitted in checked or carry-on baggage as long as the heat-producing component, or the energy source, is removed so as to prevent unintentional functioning during transport.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Battery heat-producing gear is allowed only with the heating element or power source removed — true.","source":"HazMat Manual","group":"u176"},{"n":177,"question":"Which of the following exceptions to the HAZMAT regulations are permitted to be carried aboard Company aircraft as long as they are carried on one’s person?","choices":{"a":"Strike anywhere matches.","b":"Lighters containing unabsorbed liquid fuel.","c":"Lighter fluid.","d":"Safety matches and one lighter for personal use."},"answer":"d","answer_text":"Safety matches and one lighter for personal use.","explanation":"Safety matches and one lighter may be carried on your person.","source":"HazMat Manual","group":"u177"},{"n":178,"question":"Supercooled Large Drops (SLDs) are common in freezing rain. SLDs are particularly dangerous and indicates the real potential for severe icing because...","choices":{"a":"The typical SLD is 100 times larger than a typical cloud droplet.","b":"The typical raindrop is the same size of the cloud droplet encountered if experiencing rime ice.","c":"SLDs are only dangerous if you have the flaps extended and approaching to land.","d":"Hail is likely to be present."},"answer":"a","answer_text":"The typical SLD is 100 times larger than a typical cloud droplet.","explanation":"SLDs (freezing drizzle/rain) can be up to about 100 times bigger than a normal cloud droplet, which is why they're so dangerous.","source":"AC 91-74","group":"u178"},{"n":179,"question":"This type of fog is commonly found along the western coast of the United States. It requires a light wind for its formation.","choices":{"a":"Radiation fog.","b":"Advection fog.","c":"Upslope fog.","d":"Precipitation fog."},"answer":"b","answer_text":"Advection fog.","explanation":"West-coast fog that needs a light wind to form is advection fog.","source":"AC 00-6","group":"u179"},{"n":180,"question":"What type of fog occurs when an air mass passes over an area of gradually increasing elevation?","choices":{"a":"Advection fog","b":"Radiation Fog","c":"Upslope Fog","d":"Precipitation Fog"},"answer":"c","answer_text":"Upslope Fog","explanation":"Fog that forms as air moves up rising terrain is upslope fog.","source":"AC 00-6","group":"u180"},{"n":181,"question":"What stage of a thunderstorm would crews most likely encounter hail, heavy rain, frequent lightning, strong winds, and tornadoes?","choices":{"a":"Dissipating stage","b":"Cumulus stage","c":"Mature stage","d":"Developing Stage"},"answer":"c","answer_text":"Mature stage","explanation":"Hail, heavy rain, lightning, and tornadoes happen in the mature stage.","source":"AC 00-6","group":"u181"},{"n":182,"question":"Shower and thunderstorm cells sometimes produce intense downdrafts called downbursts that create strong, often damaging winds. Downbursts can create hazardous conditions for pilots and have been responsible for many low-level wind shear accidents. Smaller, shorter-lived downbursts are called microbursts.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Those strong sinking winds are downbursts, and the small ones are microbursts — true.","source":"AC 00-6","group":"u182"},{"n":183,"question":"Clear Air Turbulence (CAT) is a higher altitude (~20,000 to 50,000 feet) turbulence phenomenon occurring in cloud-free regions associated with wind shear, particularly between the core of a jet stream and the surrounding air.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Clear-air turbulence occurs at high altitude near the jet stream with no clouds — true.","source":"AC 00-6","group":"u183"},{"n":184,"question":"Fronts do not exist only at the surface of the Earth; they have a vertical structure in which the front slopes over the colder (denser) air mass.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Fronts have a vertical slope over the colder, denser air — true.","source":"AC 00-6","group":"u184"},{"n":185,"question":"METAR KCLE 311751Z 27011G20KT 1SM SN OVC002 -01/-03 A2992. What is the intensity of the snowfall according to the Holdover Tables?","choices":{"a":"Very Light","b":"Light","c":"Moderate","d":"Heavy"},"answer":"b","answer_text":"Light","explanation":"At 1 SM, -1°C, in daytime, the snowfall intensity is Light.","source":"FAA Holdover Tables","group":"u185"},{"n":186,"question":"METAR KCLE 311751Z 27011G20KT 1SM SN OVC002 -01/-03 A2992. What is your anticipated holdover time if you use Type I de-ice fluid?","choices":{"a":"0:18-0:22","b":"0:08-0:04","c":"0:11-0:18","d":"0:06-0:11"},"answer":"c","answer_text":"0:11-0:18","explanation":"For Type I fluid in those conditions (light snow, warm temp) the holdover time is 0:11–0:18.","source":"FAA Holdover Tables","group":"u186"},{"n":187,"question":"To validate the holdover times of a Type I de-ice fluid, what is the minimum required temperature at the nozzle of the fluid during application?","choices":{"a":"120 degrees F","b":"140 degrees F","c":"180 degrees F","d":"212 degrees F"},"answer":"b","answer_text":"140 degrees F","explanation":"Type I fluid must be at least 60°C / 140°F at the nozzle.","source":"FAA Holdover Tables","group":"u187"},{"n":188,"question":"The visual glide path of a VASI provides safe obstruction clearance within plus or minus__________ of the extended runway centerline and ____ from the runway threshold.","choices":{"a":"15 degrees/5 NM","b":"10 degrees/4 NM","c":"25 degrees/5 SM","d":"VASI provides safe obstruction clearance from anywhere the glide path is discernable."},"answer":"b","answer_text":"10 degrees/4 NM","explanation":"A VASI protects you within plus or minus 10° of centerline out to 4 NM.","source":"AIM","group":"u188"},{"n":189,"question":"While examining the RNAV approach chart during preparation for the approach briefing, you notice a bold font V shown on the approach course profile view. With regard to this notation you should...","choices":{"a":"Ignore it, as we are not authorized to fly to VNAV minimums.","b":"The pilot should not descend below the MDA prior to reaching the VDP.","c":"Ignore it, since it stands for Visual Descent Point, and we are not planning a visual approach.","d":"Note it, but there is no need to plan for or brief a VDP, it is just recommended technique in some cases."},"answer":"b","answer_text":"The pilot should not descend below the MDA prior to reaching the VDP.","explanation":"The bold 'V' marks a Visual Descent Point — don't descend below the MDA until you reach it.","source":"AIM","group":"u189"},{"n":190,"question":"If you see a “negative C” symbol next to the circling minimums on a Jeppesen approach chart, it means...","choices":{"a":"Circling is not approved.","b":"All circling aircraft must land on a specific preferred runway.","c":"Expanded circling area for TERPS obstacle protection is applied.","d":"Circling approaches are only approved for Category C aircraft."},"answer":"c","answer_text":"Expanded circling area for TERPS obstacle protection is applied.","explanation":"The 'negative/inverse C' means the expanded circling area for TERPS obstacle protection — not 'no circling.'","source":"Jeppesen Chart Legend","group":"u190"},{"n":191,"question":"With APPR mode selected and on final approach during an RNAV(GNSS) or RNP approach, without an SBAS receiver that uses WAAS, the course indicator will reach full deflection if off course by...","choices":{"a":"0.5 NM.","b":"0.2 NM.","c":"0.3 NM.","d":"1 NM."},"answer":"c","answer_text":"0.3 NM.","explanation":"Without WAAS, the RNAV course needle reaches full deflection at 0.3 NM off course.","source":"AIM","group":"u191"},{"n":192,"question":"Crewmembers are required to keep in their possession when acting as a crewmember:","choices":{"a":"Pilot certificate (temporary and permanent)","b":"Medical certificate","c":"Government issued REAL ID.","d":"All are correct."},"answer":"d","answer_text":"All are correct.","explanation":"\"Crewmembers are required to keep in their possession when acting as a crewmember... Pilot certificate (temporary and permanent), Medical certificate\" and a government ID — all required.","source":"FOM 4.1.1","group":"u192"},{"n":193,"question":"What is the lowest RVR minimum that we are authorized to use for takeoff Part 91K, when RVR is available?","choices":{"a":"500 RVR","b":"600 RVR","c":"1800 RVR","d":"1000 RVR"},"answer":"b","answer_text":"600 RVR","explanation":"Under Part 91K, the lowest takeoff RVR authorized is 600.","source":"FAR 91.1000","group":"u193"},{"n":194,"question":"According to the FAR’s, above what altitude is a pilot required to wear his oxygen mask if the other pilot leaves the duty station on a Part 135 flight?","choices":{"a":"25,000","b":"35,000","c":"41,000","d":"Pilots are not required to wear an oxygen mask in a pressurized aircraft."},"answer":"a","answer_text":"25,000","explanation":"Under Part 135 you wear the O2 mask above 25,000 ft if the other pilot leaves the station.","source":"FAR 135.89","group":"g4"},{"n":195,"question":"An approved flotation device is required for each occupant aboard the aircraft. If there are only 6 vests the aircraft is limited to carrying no more than 2 crew and 4 passengers beyond power off gliding distance from shore.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"You need a flotation device per occupant, so 6 vests limits you to 6 people beyond gliding distance from shore — true.","source":"FAR 91.509","group":"u195"},{"n":196,"question":"If an aircraft is light and Vref will be within a lower approach category, the crew may fly to the minimums of that lower approach category.","choices":{"a":"True","b":"False"},"answer":"b","answer_text":"False","explanation":"You can't drop to a lower approach category just because you're light — so the statement is false.","source":"SAFO 12005","group":"u196"},{"n":197,"question":"What indications are given that the crew is allowed to perform an (M) procedure listed in the MEL?","choices":{"a":"The crew is never allowed to perform (M) procedures.","b":"The “Flight Crew Deferral Item” column indicates “YES.”","c":"Crewmembers may only perform (M) procedures if approved by Flexjet management in advance.","d":"Crewmembers may only perform (M) procedures if approved by the FAA in writing."},"answer":"b","answer_text":"The “Flight Crew Deferral Item” column indicates “YES.”","explanation":"You may do an (M) procedure when the MEL's 'Flight Crew Deferral Item' column says YES.","source":"MEL","group":"u197"},{"n":198,"question":"A category “C” MEL item must be repaired within 10 consecutive calendar-days excluding the date of discovery.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"A Category C MEL item must be fixed within 10 calendar days, not counting the day it was found — true.","source":"MEL","group":"u198"},{"n":199,"question":"During single engine operations, unless otherwise stated in the Engine Out Procedure, pilots should make all turns at 15 degrees angle of bank.","choices":{"a":"True","b":"False"},"answer":"a","answer_text":"True","explanation":"Unless the engine-out procedure says otherwise, make turns at 15° of bank — true.","source":"AC 120-91","group":"u199"},{"n":200,"question":"Which statement below is NOT a Company fundamental principle?","choices":{"a":"Paying Fanatical Attention to Detail.","b":"Taking a Long Term approach to relationships.","c":"Treating Employees as the Foundation of a Service Company.","d":"The Company is a Will-Not-Carry HAZMAT operator."},"answer":"d","answer_text":"The Company is a Will-Not-Carry HAZMAT operator.","explanation":"The odd one out (not a fundamental principle) is 'the company is a will-not-carry hazmat operator.'","source":"Employee Handbook","group":"u200"},{"n":201,"question":"Which of the following describes a “Reporting Culture” in accordance with Flexjet’s Safety Policy?","choices":{"a":"Applying appropriate quality and risk management systems and processes as part of our decision making.","b":"Crewmembers shall submit all “other commercial flying” to the Safety Department for each calendar quarter.","c":"Employees are expected to raise safety concerns and take the initiative to report hazards, threats, and errors, enabling appropriate and timely safety actions to be taken.","d":"When people report deficiencies, expose hazards, and raise safety concerns, there is a clear understanding that it is non-punitive and should be done so without fear of retribution."},"answer":"c","answer_text":"Employees are expected to raise safety concerns and take the initiative to report hazards, threats, and errors, enabling appropriate and timely safety actions to be taken.","explanation":"A 'reporting culture' means employees are expected to raise concerns and report hazards, threats, and errors so timely safety action can be taken.","source":"SMS Manual","group":"u201"}]};

  let recurrentBankCache = null;
  let quizRun = { Q: [], idx: 0, ans: [], mode: 'mock', len: 0 };

  /** Bank Q#s matched COVERED to instructor test cues (spoken "on the test" + table-smack pass).
   *  Source: instructor test flags vs 135 bank notes (2026-09-24). Questions are the locked bank, word-for-word. */
  const FLAGGED_QS = [19, 22, 32, 35, 40, 41, 47, 59, 60, 69, 70, 111, 112, 146, 147, 148, 149, 150, 154, 155, 156, 158, 162, 165, 166, 170, 193];
  const PRACTICE_LENS = [25, 50, 100, 201];

  const SG_MAST_KEY = 'sg_mastered';
  const SG_EMPH_KEY = 'sg_emph';
  const SG_TOG_KEYS = ['tSrc', 'tExp', 'tOth'];

  async function loadRecurrentBank() {
    if (recurrentBankCache) return recurrentBankCache;
    try {
      const res = await fetch(RECURRENT_JSON_URL, { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.questions) && data.questions.length) {
          recurrentBankCache = normalizeRecurrent(data);
          return recurrentBankCache;
        }
      }
    } catch (_) { /* file:// or offline */ }
    recurrentBankCache = normalizeRecurrent(RECURRENT_135_EMBED);
    return recurrentBankCache;
  }

  function normalizeRecurrent(data) {
    const questions = (data.questions || []).map((q) => ({
      n: q.n,
      q: q.question || q.q,
      o: q.choices || q.o,
      a: q.answer || q.a,
      e: q.explanation || q.e,
      s: q.source || q.s || '',
      g: q.group || q.g || ('u' + q.n),
      hl: q.hl || [q.answer || q.a],
    }));
    const byN = {};
    questions.forEach((q) => { byN[q.n] = q; });
    return {
      source: data.source || '',
      title: data.title || '135 Recurrent Study Guide',
      count: questions.length,
      pass_pct: data.pass_pct || 80,
      mock_size: data.mock_size || 50,
      questions,
      byN,
    };
  }

  function choiceLetters(q) {
    return ['a', 'b', 'c', 'd', 'e'].filter((k) => q.o && q.o[k] !== undefined);
  }

  function loadEmph() {
    try { return JSON.parse(localStorage.getItem(SG_EMPH_KEY) || '[]'); } catch { return []; }
  }
  function saveEmph(a) {
    try { localStorage.setItem(SG_EMPH_KEY, JSON.stringify(a)); } catch {}
  }
  function loadMast() {
    try { return JSON.parse(localStorage.getItem(SG_MAST_KEY) || '[]'); } catch { return []; }
  }
  function saveMast(a) {
    try { localStorage.setItem(SG_MAST_KEY, JSON.stringify(a)); } catch {}
  }
  function loadStudyTogs() {
    const o = { tSrc: true, tExp: true, tOth: true };
    try {
      SG_TOG_KEYS.forEach((id) => {
        const v = localStorage.getItem('sg_' + id);
        if (v === '1') o[id] = true;
        else if (v === '0') o[id] = false;
      });
    } catch {}
    return o;
  }
  function saveStudyTog(id, on) {
    try { localStorage.setItem('sg_' + id, on ? '1' : '0'); } catch {}
  }

  function shuffleCopy(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Prefer unmastered; always include emphasis; avoid duplicate groups; size = mock_size (50). */
  function pickQuiz(bank, n) {
    let mastered = new Set(loadMast());
    if (mastered.size >= bank.questions.length) {
      mastered = new Set();
      saveMast([]);
    }
    const emph = shuffleCopy(loadEmph());
    const out = [];
    const used = new Set();
    const chosen = new Set();
    for (const num of emph) {
      if (out.length >= n) break;
      const q = bank.byN[num];
      if (!q) continue;
      out.push(q);
      used.add(q.g);
      chosen.add(q.n);
    }
    for (const q of shuffleCopy(bank.questions)) {
      if (out.length >= n) break;
      if (chosen.has(q.n) || mastered.has(q.n) || used.has(q.g)) continue;
      used.add(q.g);
      chosen.add(q.n);
      out.push(q);
    }
    return shuffleCopy(out);
  }

  function srcTagHtml(s) {
    return (s && s !== 'None') ? `<span class="sg-src">${esc(s)}</span>` : '';
  }

  function viewIndoc135Hub() {
    app.innerHTML = `
      <div class="${shellClass()}">
        ${topbar('135 Recurrent', 'Indoc', '/indoc')}
        <main class="content">
          <div class="card">
            <h3><span class="dot"></span>Academy mock exam prep</h3>
            <p>Full bank: <strong>201</strong> questions · Sunday mock is <strong>50Q</strong> · pass <strong>80%</strong>. Word-for-word from the Flexjet 135 Recurrent Study Guide. Correct answers drop out until all 201 clear, then the cycle restarts. More Emphasis Needed stays until you get them right on a quiz.</p>
            <div class="note">Open-book style like Academy iPad. Memory items + limitations remain closed-book elsewhere.</div>
          </div>
          <div class="shelf-list">
            <button type="button" class="shelf-item" data-nav="/indoc/135/study">
              <span class="name">Study</span>
              <span class="meta">Browse all 201 · answers + why</span>
              ${svg('chev')}
            </button>
            <button type="button" class="shelf-item" data-nav="/indoc/135/quiz">
              <span class="name">Quiz · Mock + practice tests</span>
              <span class="meta">50Q mock · full bank (25/50/100/201) · instructor-flagged</span>
              ${svg('chev')}
            </button>
          </div>
        </main>
      </div>`;
    bindNav();
  }

  async function viewIndoc135Study() {
    app.innerHTML = `
      <div class="${shellClass()}">
        ${topbar('135 Study', 'Indoc · 135', '/indoc/135')}
        <main class="content">
          <div class="card"><p class="muted">Loading question bank…</p></div>
        </main>
      </div>`;
    bindNav();
    const bank = await loadRecurrentBank();
    let togs = loadStudyTogs();
    let search = '';

    const paint = (refocusSearch) => {
      const emph = new Set(loadEmph());
      const term = search.toLowerCase().trim();
      const match = (q) => !term || (`q${q.n} ${q.q} ${Object.values(q.o).join(' ')} ${q.e} ${q.s}`).toLowerCase().includes(term);
      const emphQ = bank.questions.filter((q) => emph.has(q.n) && match(q));
      const rest = bank.questions.filter(match);

      const cardHTML = (q, isEmph) => {
        const hl = q.hl || [q.a];
        let oh = '';
        for (const k of choiceLetters(q)) {
          const correct = hl.indexOf(k) >= 0;
          if (!correct && !togs.tOth) continue;
          oh += `<div class="sg-opt${correct ? ' correct' : ''}"><span class="k">${k.toUpperCase()}</span><span class="kv">${esc(q.o[k])}</span></div>`;
        }
        const tag = isEmph ? '<span class="sg-tagE">EMPHASIS</span>' : '';
        const markLabel = isEmph ? 'Clear emphasis' : 'More Emphasis Needed';
        return `<div class="sg-qc${isEmph ? ' emph' : ''}" data-qn="${q.n}">
          <div class="sg-qtop"><span class="sg-qn">Q${q.n} ${tag}</span>${togs.tSrc ? srcTagHtml(q.s) : ''}</div>
          <div class="sg-stem">${esc(q.q)}</div>
          <div class="sg-opts">${oh}</div>
          ${togs.tExp ? `<div class="sg-expl"><b>Why:</b> ${esc(q.e)}</div>` : ''}
          <button type="button" class="sg-emph-btn" data-toggle-emph="${q.n}">${markLabel}</button>
        </div>`;
      };

      let list = '';
      if (emph.size) {
        list += `<div class="sg-emphhead"><div><div class="t">More Emphasis Needed (${emph.size})</div>
          <div class="d">Missed on a quiz, or marked here. Get one right on a quiz to clear it.</div></div>
          <button type="button" class="sg-link" id="sg-clear-emph">Clear all</button></div>`;
        list += emphQ.length
          ? emphQ.map((q) => cardHTML(q, true)).join('')
          : `<div class="muted" style="margin-top:10px">No matches in your focus area for this search.</div>`;
        list += `<div class="sg-sechead">All Questions</div>`;
      }
      list += `<div class="muted" style="margin-top:8px">${rest.length} question(s)</div>` + rest.map((q) => cardHTML(q, emph.has(q.n))).join('');

      app.innerHTML = `
        <div class="${shellClass()}">
          ${topbar('135 Study', 'Indoc · 135', '/indoc/135')}
          <div class="sg-togbar">
            <span class="lbl">Show:</span>
            <label class="sg-tog"><input type="checkbox" id="sg-tSrc" ${togs.tSrc ? 'checked' : ''}><span class="sw"></span>Source</label>
            <label class="sg-tog"><input type="checkbox" id="sg-tExp" ${togs.tExp ? 'checked' : ''}><span class="sw"></span>Explanation</label>
            <label class="sg-tog"><input type="checkbox" id="sg-tOth" ${togs.tOth ? 'checked' : ''}><span class="sw"></span>Other options</label>
            <input class="sg-search" id="sg-search" placeholder="Search questions…" value="${esc(search)}">
          </div>
          <main class="content" id="sg-study-list">${list}</main>
        </div>`;
      bindNav();
      const searchEl = $('#sg-search');
      $('#sg-tSrc')?.addEventListener('change', (e) => { togs.tSrc = e.target.checked; saveStudyTog('tSrc', togs.tSrc); paint(); });
      $('#sg-tExp')?.addEventListener('change', (e) => { togs.tExp = e.target.checked; saveStudyTog('tExp', togs.tExp); paint(); });
      $('#sg-tOth')?.addEventListener('change', (e) => { togs.tOth = e.target.checked; saveStudyTog('tOth', togs.tOth); paint(); });
      searchEl?.addEventListener('input', (e) => { search = e.target.value; paint(true); });
      if (refocusSearch && searchEl) {
        searchEl.focus();
        searchEl.setSelectionRange(searchEl.value.length, searchEl.value.length);
      }
      $('#sg-clear-emph')?.addEventListener('click', () => {
        if (confirm('Clear all questions from More Emphasis Needed?')) { saveEmph([]); paint(); }
      });
      app.querySelectorAll('[data-toggle-emph]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const n = Number(btn.getAttribute('data-toggle-emph'));
          const set = new Set(loadEmph());
          if (set.has(n)) set.delete(n); else set.add(n);
          saveEmph([...set]);
          paint();
        });
      });
    };
    paint();
  }

  async function viewIndoc135Quiz() {
    const bank = await loadRecurrentBank();
    const MOCK = bank.mock_size || 50;
    const PASS = bank.pass_pct || 80;

    const flaggedQs = () => FLAGGED_QS.map((n) => bank.byN[n]).filter(Boolean);
    const modeLabel = () => (quizRun.mode === 'full' ? `Full bank · ${quizRun.Q.length}Q practice`
      : quizRun.mode === 'flagged' ? 'Instructor-flagged practice'
      : quizRun.mode === 'missed' ? 'Retake missed' : '50Q mock exam');
    const startRun = (mode, qs) => {
      quizRun.mode = mode;
      quizRun.Q = qs;
      quizRun.idx = 0;
      quizRun.ans = new Array(quizRun.Q.length).fill(null);
      paintRun();
    };
    const startMode = (mode, len) => {
      if (mode === 'mock') return startRun('mock', pickQuiz(bank, MOCK));
      if (mode === 'flagged') return startRun('flagged', shuffleCopy(flaggedQs()));
      quizRun.len = Math.min(len || bank.questions.length, bank.questions.length);
      return startRun('full', shuffleCopy(bank.questions).slice(0, quizRun.len));
    };
    let pickLen = bank.questions.length;

    const paintStart = () => {
      let m = loadMast().length;
      if (m >= bank.questions.length) m = 0;
      const n = loadEmph().length;
      const emphNote = n
        ? `<span class="sg-emph-note">${n} emphasis question${n > 1 ? 's' : ''} will be included.</span>`
        : '';
      const lenBtns = PRACTICE_LENS.map((L) => {
        const v = Math.min(L, bank.questions.length);
        return `<button type="button" class="btn ${pickLen === v ? 'btn-primary' : 'btn-ghost'} sg-len" data-len="${v}" style="min-width:64px;margin:3px">${v === bank.questions.length ? 'All ' + v : v}</button>`;
      }).join('');
      app.innerHTML = `
        <div class="${shellClass()}">
          ${topbar('135 Quiz', 'Indoc · 135', '/indoc/135')}
          <main class="content">
            <div class="card center sg-quiz-start">
              <div class="sg-big">50-Question Mock Exam</div>
              <p class="muted" style="max-width:480px;margin:6px auto 8px">Questions you've already gotten right drop out until you've cleared all ${bank.count} — then the cycle restarts. Your <b style="color:var(--gold)">More Emphasis Needed</b> questions are always included and stay until you get them right. Scored at the end; pass is ${PASS}%.</p>
              <div style="margin:14px auto 4px">
                <div class="muted">Cycle progress: <b style="color:var(--text)">${m} / ${bank.questions.length}</b> answered correctly</div>
                <div class="sg-bar2"><div style="width:${(m / bank.questions.length) * 100}%"></div></div>
              </div>
              <p class="muted" style="margin:0 auto 16px">${emphNote}</p>
              <button type="button" class="btn btn-primary" id="sg-start-quiz">Start quiz</button>
            </div>
            <div class="card center sg-quiz-start" style="margin-top:16px">
              <div class="sg-big">Full-Bank Practice Test</div>
              <p class="muted" style="max-width:480px;margin:6px auto 8px">Random questions from all ${bank.count}, shuffled, scored at the end with a missed-questions review. Pick a length. Doesn't change your mock cycle progress.</p>
              <div style="margin:8px auto 14px">${lenBtns}</div>
              <button type="button" class="btn btn-primary" id="sg-start-full">Start ${pickLen === bank.questions.length ? 'all ' + pickLen : pickLen}-question test</button>
            </div>
            <div class="card center sg-quiz-start" style="margin-top:16px">
              <div class="sg-big">Instructor-Flagged Only</div>
              <p class="muted" style="max-width:480px;margin:6px auto 8px">The ${flaggedQs().length} bank questions that match what the Indoc instructors said is on the test. Shuffled, scored, missed-questions review.</p>
              <button type="button" class="btn btn-primary" id="sg-start-flagged">Start ${flaggedQs().length}-question test</button>
            </div>
          </main>
        </div>`;
      bindNav();
      $('#sg-start-quiz')?.addEventListener('click', () => startMode('mock'));
      $('#sg-start-full')?.addEventListener('click', () => startMode('full', pickLen));
      $('#sg-start-flagged')?.addEventListener('click', () => startMode('flagged'));
      app.querySelectorAll('.sg-len').forEach((b) => b.addEventListener('click', () => { pickLen = Number(b.getAttribute('data-len')); paintStart(); }));
    };

    const paintRun = () => {
      const q = quizRun.Q[quizRun.idx];
      const opts = choiceLetters(q).map((k) => {
        const sel = quizRun.ans[quizRun.idx] === k ? ' sel' : '';
        return `<button type="button" class="sg-opt pick${sel}" data-pick="${k}"><span class="k">${k.toUpperCase()}</span><span>${esc(q.o[k])}</span></button>`;
      }).join('');
      app.innerHTML = `
        <div class="${shellClass()}">
          ${topbar('135 Quiz', 'Indoc · 135', '/indoc/135')}
          <main class="content">
            <div class="sg-prog"><div style="width:${(quizRun.idx / quizRun.Q.length) * 100}%"></div></div>
            <div class="sg-qmeta"><span class="sg-qn">Q${q.n}</span><span class="muted">${esc(modeLabel())} · ${quizRun.idx + 1} / ${quizRun.Q.length}</span></div>
            <div class="sg-stem" style="margin:12px 0 16px">${esc(q.q)}</div>
            <div class="sg-opts">${opts}</div>
            <div class="sg-nav">
              <button type="button" class="btn btn-ghost" id="sg-quiz-quit">Quit</button>
              <button type="button" class="btn btn-primary" id="sg-quiz-next">${quizRun.idx === quizRun.Q.length - 1 ? 'Finish' : 'Next'}</button>
            </div>
          </main>
        </div>`;
      bindNav();
      app.querySelectorAll('[data-pick]').forEach((btn) => {
        btn.addEventListener('click', () => {
          quizRun.ans[quizRun.idx] = btn.getAttribute('data-pick');
          paintRun();
        });
      });
      $('#sg-quiz-quit')?.addEventListener('click', () => { paintStart(); });
      $('#sg-quiz-next')?.addEventListener('click', () => {
        if (quizRun.ans[quizRun.idx] === null) { alert('Pick an answer first.'); return; }
        if (quizRun.idx === quizRun.Q.length - 1) { (quizRun.mode === 'mock' ? paintResult : paintPracticeResult)(); return; }
        quizRun.idx++;
        paintRun();
      });
    };

    const paintResult = () => {
      let correct = 0;
      quizRun.Q.forEach((q, i) => { if (quizRun.ans[i] === q.a) correct++; });
      const pct = Math.round((correct / quizRun.Q.length) * 100);
      const pass = pct >= PASS;
      let mastered = new Set(loadMast());
      let emph = new Set(loadEmph());
      let added = 0, cleared = 0;
      quizRun.Q.forEach((q, i) => {
        if (quizRun.ans[i] === q.a) {
          mastered.add(q.n);
          if (emph.has(q.n)) { emph.delete(q.n); cleared++; }
        } else {
          mastered.delete(q.n);
          if (!emph.has(q.n)) { emph.add(q.n); added++; }
        }
      });
      let cycleDone = false;
      if (mastered.size >= bank.questions.length) { mastered = new Set(); cycleDone = true; }
      saveMast([...mastered]);
      saveEmph([...emph]);
      const mnow = cycleDone ? 0 : mastered.size;
      const cyc = cycleDone
        ? `<div class="sg-pill" style="margin-top:10px;color:var(--success)">Cycle complete — all ${bank.questions.length} cleared! Resetting.</div>`
        : `<div class="sg-pill" style="margin-top:10px">Cycle progress: ${mnow} / ${bank.questions.length} correct</div>`;
      const emphLine = (added || cleared)
        ? `<div class="sg-pill" style="margin-top:10px;color:var(--gold)">Focus area: +${added} · ${cleared} cleared · ${emph.size} total</div>`
        : `<div class="muted" style="margin-top:10px">Focus area: ${emph.size} total</div>`;

      let review = '';
      quizRun.Q.forEach((q, i) => {
        const you = quizRun.ans[i];
        const ok = you === q.a;
        review += `<div class="sg-rev ${ok ? 'ok' : 'no'}">
          <div class="sg-qtop"><span class="sg-qn">Q${q.n}${ok ? '' : ' <span class="sg-tagE">ADDED</span>'}</span>${srcTagHtml(q.s)}</div>
          <div style="font-size:14px;font-weight:500;margin-bottom:6px">${esc(q.q)}</div>
          <div class="l ${ok ? 'cb' : 'yb'}">Your answer: ${you ? you.toUpperCase() + ') ' + esc(q.o[you]) : '(blank)'} ${ok ? 'OK' : 'X'}</div>
          ${ok ? '' : `<div class="l cb">Correct: ${q.a.toUpperCase()}) ${esc(q.o[q.a])}</div>`}
          <div class="l" style="color:var(--text-mute);margin-top:5px"><b style="color:var(--accent)">Why:</b> ${esc(q.e)}</div>
        </div>`;
      });

      app.innerHTML = `
        <div class="${shellClass()}">
          ${topbar('135 Quiz', 'Indoc · 135', '/indoc/135')}
          <main class="content">
            <div class="card center">
              <div class="muted">Quiz complete</div>
              <div class="sg-score ${pass ? 'pass' : 'fail'}">${pct}%</div>
              <div class="sg-pill">${correct} / ${quizRun.Q.length} correct · ${pass ? 'PASS (≥' + PASS + '%)' : 'below ' + PASS + '%'}</div>
              <div>${cyc}</div><div>${emphLine}</div>
              <div class="sg-nav" style="justify-content:center;margin-top:18px">
                <button type="button" class="btn btn-primary" id="sg-new-quiz">New quiz</button>
                <button type="button" class="btn btn-ghost" id="sg-back-start">Back</button>
              </div>
            </div>
            <div style="margin-top:20px">
              <div class="sg-big" style="margin-bottom:4px">Review and feedback</div>
              <div class="muted" style="margin-bottom:6px">Every question, with why the correct answer is right.</div>
              ${review}
            </div>
          </main>
        </div>`;
      bindNav();
      $('#sg-new-quiz')?.addEventListener('click', () => {
        quizRun.Q = pickQuiz(bank, MOCK);
        quizRun.idx = 0;
        quizRun.ans = new Array(quizRun.Q.length).fill(null);
        paintRun();
      });
      $('#sg-back-start')?.addEventListener('click', paintStart);
    };

    const paintPracticeResult = () => {
      let correct = 0;
      const missed = [];
      quizRun.Q.forEach((q, i) => { if (quizRun.ans[i] === q.a) correct++; else missed.push(i); });
      const pct = Math.round((correct / quizRun.Q.length) * 100);
      const pass = pct >= PASS;
      const revCard = (i) => {
        const q = quizRun.Q[i]; const you = quizRun.ans[i]; const ok = you === q.a;
        return `<div class="sg-rev ${ok ? 'ok' : 'no'}">
          <div class="sg-qtop"><span class="sg-qn">Q${q.n}</span>${srcTagHtml(q.s)}</div>
          <div style="font-size:14px;font-weight:500;margin-bottom:6px">${esc(q.q)}</div>
          <div class="l ${ok ? 'cb' : 'yb'}">Your answer: ${you ? you.toUpperCase() + ') ' + esc(q.o[you]) : '(blank)'} ${ok ? 'OK' : 'X'}</div>
          ${ok ? '' : `<div class="l cb">Correct: ${q.a.toUpperCase()}) ${esc(q.o[q.a])}</div>`}
          <div class="l" style="color:var(--text-mute);margin-top:5px"><b style="color:var(--accent)">Why:</b> ${esc(q.e)}</div>
        </div>`;
      };
      const mode = quizRun.mode;
      const lastQ = quizRun.Q.slice();
      app.innerHTML = `
        <div class="${shellClass()}">
          ${topbar('135 Quiz', 'Indoc · 135', '/indoc/135')}
          <main class="content">
            <div class="card center">
              <div class="muted">${esc(modeLabel())} complete</div>
              <div class="sg-score ${pass ? 'pass' : 'fail'}">${pct}%</div>
              <div class="sg-pill">${correct} / ${quizRun.Q.length} correct · ${pass ? 'PASS (≥' + PASS + '%)' : 'below ' + PASS + '%'}</div>
              <div class="muted" style="margin-top:10px">Practice mode — mock cycle progress unchanged.</div>
              <div class="sg-nav" style="justify-content:center;margin-top:18px;flex-wrap:wrap;gap:8px">
                ${missed.length ? '<button type="button" class="btn btn-primary" id="sg-retake-missed">Retake ' + missed.length + ' missed</button>' : ''}
                ${missed.length ? '<button type="button" class="btn btn-ghost" id="sg-emph-missed">Add missed to Emphasis</button>' : ''}
                <button type="button" class="btn btn-ghost" id="sg-again">New ${mode === 'missed' ? 'full-bank' : 'same-mode'} test</button>
                <button type="button" class="btn btn-ghost" id="sg-back-start">Back</button>
              </div>
            </div>
            <div style="margin-top:20px">
              <div class="sg-big" style="margin-bottom:4px">Missed questions (${missed.length})</div>
              ${missed.length ? missed.map(revCard).join('') : '<div class="muted">None missed. Nice.</div>'}
              <details style="margin-top:14px"><summary class="muted">Show all ${quizRun.Q.length} with answers</summary>${quizRun.Q.map((_, i) => revCard(i)).join('')}</details>
            </div>
          </main>
        </div>`;
      bindNav();
      $('#sg-retake-missed')?.addEventListener('click', () => startRun('missed', shuffleCopy(missed.map((i) => lastQ[i]))));
      $('#sg-emph-missed')?.addEventListener('click', (e) => {
        const set = new Set(loadEmph()); missed.forEach((i) => set.add(lastQ[i].n)); saveEmph([...set]);
        e.target.disabled = true; e.target.textContent = 'Added to Emphasis';
      });
      $('#sg-again')?.addEventListener('click', () => startMode(mode === 'missed' ? 'full' : mode, quizRun.len || bank.questions.length));
      $('#sg-back-start')?.addEventListener('click', paintStart);
    };

    paintStart();
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
    { id: 'dinner', text: 'Thu Welcome Dinner 5:15p — Hyde Park Beachwood', done: true },
    { id: 'tolltag', text: 'DFW: TollTag/BlueDiamond + email CathyC@Flexjet.com before OE', done: false },
    { id: 'parking-spot', text: 'Parking Spot app + code BOMB1525', done: false },
    { id: 'ukg', text: 'Benefits enrollment — UKG Myself when company email arrives', done: false },
    { id: 'uniform', text: 'Submit uniform order — A Cut Above after fitting; update shipping; bomber email if needed', done: false },
    { id: 'concur', text: 'Wait for Concur email; finish MFA (Authenticator path)', done: false },
    { id: 'rental', text: 'Photo rental-car corporate codes; keep DL + preferred current', done: false },
    { id: 'academy', text: 'Indoc: finish Heather Bey Academy modules (~11) by Sunday for 135 credit', done: false },
    { id: 'sunday50', text: 'Indoc: work ~201Q study guide; Sunday 50Q open-book on Academy iPad', done: false },
    { id: 'flyembraer', text: 'Indoc: download Fly Embraer tech pubs + verify ForeFlight CTH Praetor', done: false },
    { id: 'everest', text: 'Indoc: Everest Fuel process — sign ticket · gallons in Tailwind (clip 04 captured)', done: true },
    { id: 'lowertakeoff', text: 'Indoc: verify lower-than-standard takeoff RVR/equipment tables in live OpSpec', done: false },
    { id: 'foodda', text: 'Indoc: food-safety leftovers rule + D&A 8-hr / random / refusal basics', done: false },
    { id: 'rda', text: 'Indoc Day 2: confirm RDA access on training email', done: false },
    { id: 'techpub', text: 'Indoc Day 2: download Embraer TechPub app + check EFB currency guide', done: false },
    { id: 'day3mins', text: 'Indoc Day 3: verify OpSpec takeoff mins / dual-RVR / alternate tables', done: false },
    { id: 'day3ice', text: 'Indoc Day 3: confirm FOM 7.3.11 icing HOT/tactile rules', done: false },
    { id: 'day3fuel', text: 'Indoc Day 3: confirm Praetor land-with fuel target in FOM', done: false },
    { id: 'day4haz', text: 'Indoc Day 4: verify hazmat exception numbers on the written card (dry ice / alcohol / spray / lithium Wh)', done: false },
    { id: 'day4desc', text: 'Indoc Day 4: Praetor emergency-descent memory items from QRH (not generic slide)', done: false },
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

  async function hardReload() {
    const buttons = app.querySelectorAll('[data-reload]');
    buttons.forEach(button => {
      button.disabled = true;
      const label = button.querySelector('.reload-label');
      if (label) label.textContent = 'Reloading…';
      else button.textContent = 'Reloading…';
    });
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
      }
    } catch {}
    try {
      if ('caches' in window && typeof window.caches.keys === 'function') {
        const keys = await window.caches.keys();
        await Promise.all(keys.map(key => window.caches.delete(key)));
      }
    } catch {}
    // Bust Home Screen PWA / Safari cache with a fresh query string
    const bust = location.pathname + '?v=' + Date.now() + (location.hash || '');
    location.href = bust;
  }

  function topbar(title, crumb, backTo) {
    return `
      <header class="topbar">
        ${backTo ? `<button class="back" type="button" data-nav="${backTo}" aria-label="Back">${svg('back')}</button>` : `<div style="width:12px"></div>`}
        <div class="titles">
          ${crumb ? `<div class="crumb">${esc(crumb)}</div>` : ''}
          <h1>${esc(title)}</h1>
        </div>
        <button class="btn btn-primary reload" type="button" data-reload aria-label="Reload app">
          <span class="reload-icon" aria-hidden="true">↻</span>
          <span class="reload-label">Reload</span>
        </button>
      </header>`;
  }

  function mobileReloadBar(opts = {}) {
    const fleet = opts.fleetRefresh
      ? `<button type="button" class="btn btn-ghost mobile-reload-fleet" id="fleet-refresh-mobile">Refresh aircraft</button>`
      : '';
    return `
      <nav class="mobile-reload-bar" aria-label="Reload controls">
        <button type="button" class="btn btn-primary mobile-reload-app" data-reload aria-label="Reload app">
          <span class="reload-icon" aria-hidden="true">↻</span>
          <span class="reload-label">Reload app</span>
        </button>
        ${fleet}
      </nav>`;
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


  /* ——— Fleet Map ——— */
  // Live feed: box relay (scripts/fleet-live-daemon.py) publishes to the `fleet-live`
  // branch. raw.githubusercontent.com sends Access-Control-Allow-Origin: *, whereas
  // ADSB.lol / adsb.fi / airplanes.live do not (browser fetches are CORS-blocked).
  // raw caches each URL ~5 min (query strings ignored), so the relay writes per-minute
  // files m/<floor(unix/60)>.json (current + next minutes); we fetch the current minute's
  // file at ~:25 past the minute, after the relay's cycle for that minute has published.
  const FLEET_LIVE_BASE = 'https://raw.githubusercontent.com/kerrywyatt-prog/flexjet-fo-study/fleet-live/';
  const FLEET_LIVE_URL = FLEET_LIVE_BASE + 'live.json';
  const FLEET_SNAPSHOT_URL = 'data/fleet-map-snapshot.json';
  const FLEET_LAST_KNOWN_URL = 'data/fleet-last-known.json';
  const FLEET_ROSTER_URL = 'data/praetor-fleet-roster.json';
  const FLEET_REFRESH_MS = 60 * 1000;   // aligned to minute boundaries (+25 s)
  const FLEET_REFRESH_OFFSET_MS = 25 * 1000;
  const FLEET_LIVE_WINDOW_S = 180;      // aircraft position newer than this = LIVE
  const FLEET_FEED_STALE_S = 420;       // relay file older than this = feed not live
  const FLEET_TZ = 'America/New_York';
  let fleetMap = null;
  let fleetMarkers = [];
  let fleetTrailLayer = null;
  let fleetAircraft = [];
  let fleetAllAircraft = [];
  let fleetFilterMode = 'all'; // 'live' | 'all'
  let fleetRefreshTimer = null;
  let fleetCooldownTimer = null;
  let fleetAbortController = null;
  let fleetLastRequestAt = 0;
  let fleetLoading = false;
  let fleetRoster = null;
  let fleetRosterByHex = new Map();
  let fleetRosterByReg = new Map();
  let fleetMeta = { mode: 'loading', generatedAt: null };
  let fleetSelectedKey = null;
  let fleetFitDone = false;
  let fleetVisibilityBound = false;

  async function loadFleetRoster() {
    if (fleetRoster) return fleetRoster;
    try {
      const response = await fetch(FLEET_ROSTER_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('roster fetch failed');
      fleetRoster = await response.json();
      fleetRosterByHex = new Map();
      fleetRosterByReg = new Map();
      (fleetRoster.aircraft || []).forEach(ac => {
        if (ac.hex) fleetRosterByHex.set(String(ac.hex).toLowerCase(), ac);
        if (ac.registration) fleetRosterByReg.set(String(ac.registration).toUpperCase(), ac);
      });
    } catch {
      fleetRoster = null;
    }
    return fleetRoster;
  }

  function fleetRosterEntry(ac) {
    return (ac.hex && fleetRosterByHex.get(String(ac.hex).toLowerCase()))
      || fleetRosterByReg.get(String(ac.registration || '').toUpperCase())
      || null;
  }

  function fleetNum(v) {
    const n = Number(v);
    return v === null || v === undefined || v === '' || !Number.isFinite(n) ? null : n;
  }

  function fleetTimeET(value) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'Unknown';
    const today = new Date().toLocaleDateString('en-US', { timeZone: FLEET_TZ });
    const day = d.toLocaleDateString('en-US', { timeZone: FLEET_TZ });
    const t = d.toLocaleTimeString('en-US', { timeZone: FLEET_TZ, hour: 'numeric', minute: '2-digit' });
    return day === today ? `${t} ET` : `${d.toLocaleDateString('en-US', { timeZone: FLEET_TZ, month: 'short', day: 'numeric' })} ${t} ET`;
  }

  function fleetAge(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return 'Unknown';
    if (seconds < 90) return `${Math.round(seconds)} s ago`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hr ago`;
    return `${Math.round(seconds / 86400)} days ago`;
  }

  function fleetAgeSeconds(value) {
    const t = new Date(value).getTime();
    return Number.isFinite(t) ? Math.max(0, (Date.now() - t) / 1000) : NaN;
  }

  // Normalise any record (relay live.json, last-known store, snapshot) into one shape.
  function fleetNormalize(e, key, origin) {
    const lat = fleetNum(e.lat);
    const lon = fleetNum(e.lon);
    if (lat === null || lon === null) return null;
    const hex = String(e.hex || (key && /^[0-9a-f]{6}$/i.test(key) ? key : '') || '').toLowerCase();
    const r = fleetRosterEntry({ hex, registration: e.registration || e.r });
    const type = String(e.type || e.t || (r && r.icao_type) || '').toUpperCase();
    const altRaw = e.alt_baro ?? e.altBaro ?? null;
    const gs = fleetNum(e.gs);
    const onGround = e.on_ground === true || String(altRaw).toLowerCase() === 'ground';
    return {
      hex,
      registration: String((r && r.registration) || e.registration || e.r || 'Unknown').trim().toUpperCase(),
      type: type || 'E545',
      model: (r && r.label) || e.model || (type === 'E550' ? 'Praetor 600' : 'Praetor 500'),
      serial: (r && r.serial_number) || e.serial_number || null,
      rosterFlag: (r && r.flag) || e.roster_flag || null,
      callsign: String(e.callsign || e.flight || '').trim().toUpperCase(),
      lat, lon,
      altBaro: altRaw,
      altGeom: e.alt_geom ?? null,
      speed: gs,
      track: fleetNum(e.track),
      trueHeading: fleetNum(e.true_heading),
      magHeading: fleetNum(e.mag_heading),
      vertRate: fleetNum(e.baro_rate) ?? fleetNum(e.geom_rate),
      squawk: e.squawk || null,
      emergency: e.emergency && e.emergency !== 'none' ? e.emergency : null,
      onGround,
      posTime: e.pos_time || e.last_seen || e.lastSeen || null,
      source: e.source || null,
      origin,
      departedEst: e.departed_est || null,
      firstSeen: e.first_seen_this_flight || null,
      onGroundAtEst: e.on_ground_at_est || null,
      groundSince: e.ground_since || null,
      lastLandedEst: e.last_landed_est || null,
      route: e.route || null,
      trail: Array.isArray(e.trail) ? e.trail : [],
    };
  }

  function fleetIsLive(ac) {
    if (fleetMeta.mode !== 'live') return false;
    return fleetAgeSeconds(ac.posTime) <= FLEET_LIVE_WINDOW_S;
  }

  function fleetAltitude(ac) {
    if (ac.onGround) return 'On ground';
    const a = fleetNum(ac.altBaro);
    if (a !== null) {
      const ft = `${Math.round(a).toLocaleString()} ft baro`;
      return a >= 18000 ? `FL${String(Math.round(a / 100)).padStart(3, '0')} · ${ft}` : ft;
    }
    const g = fleetNum(ac.altGeom);
    if (g !== null) return `${Math.round(g).toLocaleString()} ft geometric`;
    return 'Unavailable';
  }

  function fleetAltShort(ac) {
    if (ac.onGround) return 'On ground';
    const a = fleetNum(ac.altBaro);
    if (a === null) return 'Airborne';
    return a >= 18000 ? `FL${String(Math.round(a / 100)).padStart(3, '0')}` : `${Math.round(a).toLocaleString()} ft`;
  }

  function fleetHeading(ac) {
    const parts = [];
    if (ac.track !== null) parts.push(`${Math.round(ac.track)}° track`);
    if (ac.trueHeading !== null) parts.push(`${Math.round(ac.trueHeading)}° true hdg`);
    else if (ac.magHeading !== null) parts.push(`${Math.round(ac.magHeading)}° mag hdg`);
    return parts.length ? parts.join(' · ') : 'Unavailable';
  }

  function fleetVertRate(ac) {
    if (ac.vertRate === null) return 'Unavailable';
    const v = Math.round(ac.vertRate / 10) * 10;
    if (Math.abs(v) < 100) return `Level (${v >= 0 ? '+' : ''}${v} fpm)`;
    return `${v > 0 ? '↑ +' : '↓ −'}${Math.abs(v).toLocaleString()} fpm`;
  }

  function fleetAirport(a) {
    if (!a) return null;
    const where = [a.city, a.region ? String(a.region).replace(/^US-/, '') : ''].filter(Boolean).join(', ');
    return `${a.code || ''} ${a.name || ''}${where ? ` (${where})` : ''}`.trim();
  }

  function fleetStatusLabel(ac) {
    if (!fleetIsLive(ac)) return `Last known · ${fleetTimeET(ac.posTime)}`;
    return ac.onGround ? 'LIVE · On ground' : `LIVE · Airborne ${fleetAltShort(ac)}`;
  }

  function cleanupFleetMap() {
    if (fleetRefreshTimer) clearTimeout(fleetRefreshTimer);
    if (fleetCooldownTimer) clearInterval(fleetCooldownTimer);
    fleetRefreshTimer = null;
    fleetCooldownTimer = null;
    if (fleetAbortController) fleetAbortController.abort();
    fleetAbortController = null;
    if (fleetMap) {
      try { fleetMap.remove(); } catch {}
    }
    fleetMap = null;
    fleetMarkers = [];
    fleetTrailLayer = null;
    fleetAircraft = [];
    fleetAllAircraft = [];
    fleetLastRequestAt = 0;
    fleetLoading = false;
    fleetSelectedKey = null;
    fleetFitDone = false;
  }

  function isFleetRoute() {
    return parseHash().parts[0] === 'fleet-map';
  }

  function updateFleetBadge() {
    const badge = $('#fleet-status-badge');
    if (!badge) return;
    if (fleetMeta.mode === 'live') {
      badge.className = 'fleet-status-badge live';
      badge.textContent = `LIVE · updated ${fleetAge(fleetAgeSeconds(fleetMeta.generatedAt))}`;
    } else if (fleetMeta.mode === 'last_known' || fleetMeta.mode === 'snapshot') {
      badge.className = `fleet-status-badge ${fleetMeta.mode}`;
      badge.textContent = `Last known · ${fleetMeta.generatedAt ? fleetTimeET(fleetMeta.generatedAt) : '—'}`;
    } else if (fleetMeta.mode === 'error') {
      badge.className = 'fleet-status-badge error';
      badge.textContent = 'Unavailable';
    } else {
      badge.className = 'fleet-status-badge loading';
      badge.textContent = 'Loading';
    }
  }

  function updateFleetRefreshButton() {
    updateFleetBadge();
    const remaining = Math.ceil(fleetNextRefreshWait() / 1000);
    const label = fleetLoading ? 'Refreshing…' : 'Refresh aircraft';
    ['#fleet-refresh', '#fleet-refresh-mobile'].forEach(sel => {
      const button = $(sel);
      if (!button) return;
      button.disabled = fleetLoading;
      button.textContent = label;
      button.setAttribute('aria-busy', fleetLoading ? 'true' : 'false');
    });
    const hint = $('#fleet-refresh-hint');
    if (hint) hint.textContent = fleetLoading
      ? 'Fetching latest positions…'
      : document.visibilityState === 'hidden'
        ? 'Paused while hidden'
        : remaining > 0 ? `Next refresh in ${remaining}s` : 'Refresh available';
  }

  function setFleetState(message, kind = '') {
    const state = $('#fleet-state');
    if (!state) return;
    state.className = `fleet-state ${kind}`.trim();
    state.textContent = message;
    state.hidden = !message;
  }

  function fleetMarkerHtml(ac) {
    const live = fleetIsLive(ac);
    if (ac.onGround) {
      return `<span class="fleet-marker fleet-marker-ground${live ? '' : ' fleet-marker-ghost'}" aria-hidden="true">■</span>`;
    }
    const rot = ac.track ?? ac.trueHeading ?? ac.magHeading ?? 0;
    return `<span class="fleet-marker fleet-marker-air${live ? '' : ' fleet-marker-ghost'}" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" style="transform:rotate(${Math.round(rot)}deg)"><path fill="currentColor" d="M12 2c.8 0 1.3.9 1.3 2v5.2l7.7 4.6v2l-7.7-2.3v4.6l2.2 1.7V21L12 20.1 8.5 21v-1.2l2.2-1.7v-4.6L3 15.8v-2l7.7-4.6V4c0-1.1.5-2 1.3-2z"/></svg></span>`;
  }

  function renderFleetMapMarkers(aircraft) {
    const mapEl = $('#fleet-map-canvas');
    const unavailable = $('#fleet-map-unavailable');
    if (!mapEl) return;
    if (!window.L) {
      mapEl.hidden = true;
      if (unavailable) {
        unavailable.hidden = false;
        unavailable.textContent = 'Map library unavailable. Aircraft and details remain available below.';
      }
      return;
    }
    if (!fleetMap) {
      fleetMap = L.map(mapEl, { zoomControl: true, worldCopyJump: true }).setView([38.5, -96], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      }).addTo(fleetMap);
    }
    fleetMarkers.forEach(marker => marker.remove());
    fleetMarkers = [];
    const points = [];
    aircraft.forEach((ac, index) => {
      const live = fleetIsLive(ac);
      const icon = L.divIcon({
        className: 'fleet-marker-shell',
        html: fleetMarkerHtml(ac),
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const marker = L.marker([ac.lat, ac.lon], {
        icon,
        title: `${ac.registration} ${ac.callsign || ''} (${fleetStatusLabel(ac)})`,
        opacity: live ? 1 : 0.6,
        zIndexOffset: live ? (ac.onGround ? 500 : 1000) : 0,
      }).addTo(fleetMap);
      marker.bindTooltip(`${esc(ac.registration)} · ${esc(live ? (ac.onGround ? 'On ground' : fleetAltShort(ac)) : 'Last known')}`, { direction: 'top', offset: [0, -14] });
      marker.on('click', () => selectFleetAircraft(index, false));
      fleetMarkers.push(marker);
      if (live || fleetMeta.mode !== 'live') points.push([ac.lat, ac.lon]);
    });
    if (!fleetFitDone && points.length) {
      fleetMap.fitBounds(points, { padding: [34, 34], maxZoom: 7 });
      fleetFitDone = true;
    }
    window.setTimeout(() => fleetMap && fleetMap.invalidateSize(), 0);
  }

  function drawFleetTrail(ac) {
    if (!fleetMap || !window.L) return;
    if (fleetTrailLayer) { fleetTrailLayer.remove(); fleetTrailLayer = null; }
    const pts = (ac.trail || []).filter(p => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1])).map(p => [p[0], p[1]]);
    if (pts.length) pts.push([ac.lat, ac.lon]);
    if (pts.length >= 2) {
      fleetTrailLayer = L.polyline(pts, { color: '#39c6ff', weight: 3, opacity: 0.85, dashArray: fleetIsLive(ac) ? null : '6 6' }).addTo(fleetMap);
    }
  }

  function selectFleetAircraft(index, pan = true, reveal = true) {
    const ac = fleetAircraft[index];
    const panel = $('#fleet-details');
    if (!ac || !panel) return;
    fleetSelectedKey = ac.hex || ac.registration;
    app.querySelectorAll('.fleet-aircraft-button').forEach((el, i) => el.classList.toggle('selected', i === index));
    const live = fleetIsLive(ac);
    const ageS = fleetAgeSeconds(ac.posTime);
    const trackerUrl = ac.hex ? `https://adsb.lol/?icao=${encodeURIComponent(ac.hex)}` : null;
    let departed;
    if (ac.onGround) {
      departed = '—';
    } else if (ac.departedEst && ac.departedEst.airport) {
      departed = `${esc(fleetAirport(ac.departedEst.airport))}<span class="fleet-est">Estimate — ${esc(ac.departedEst.method || 'nearest airport')}${ac.departedEst.time ? `, ${esc(fleetTimeET(ac.departedEst.time))}` : ''}</span>`;
    } else if (ac.firstSeen) {
      departed = `Not determined<span class="fleet-est">First seen airborne ${esc(ac.firstSeen.alt_baro != null ? `at ${Number(ac.firstSeen.alt_baro).toLocaleString()} ft` : '')} ${esc(fleetTimeET(ac.firstSeen.time))} — no ground fix</span>`;
    } else {
      departed = 'Not determined';
    }
    let destination;
    if (ac.route && ac.route.destination) {
      destination = `${esc(ac.route.destination.code || '')} ${esc(ac.route.destination.name || '')}<span class="fleet-est">${esc(ac.route.source || 'route DB')} — unverified</span>`;
    } else {
      destination = 'Not published (fractional flight)';
    }
    const groundAt = ac.onGround
      ? (ac.onGroundAtEst ? `${esc(fleetAirport(ac.onGroundAtEst))}<span class="fleet-est">Estimate — nearest airport to ground position${ac.groundSince ? `, on ground since ${esc(fleetTimeET(ac.groundSince))}` : ''}</span>` : 'Not near a known jet airport')
      : null;
    const landed = ac.lastLandedEst && ac.lastLandedEst.airport
      ? `${esc(fleetAirport(ac.lastLandedEst.airport))}<span class="fleet-est">Estimate — ${esc(fleetTimeET(ac.lastLandedEst.time))}</span>`
      : null;
    const trailPts = (ac.trail || []).length;
    const sourceText = ac.origin === 'relay'
      ? `Public ADS-B (${esc(ac.source || 'ADSB.lol')}) via box relay`
      : ac.origin === 'snapshot' ? 'ADSB.lol snapshot (not live)' : `ADSB.lol last-known store (hourly)`;
    panel.innerHTML = `
      <div class="fleet-detail-head">
        <div>
          <div class="fleet-detail-kicker">${esc(ac.model)} · ${esc(ac.type)}</div>
          <h2>${esc(ac.registration)}</h2>
        </div>
        <span class="fleet-source-chip ${live ? (ac.onGround ? 'ground' : 'live') : 'last-known'}">${
          live ? (ac.onGround ? 'LIVE · Ground' : 'LIVE · Airborne') : 'Last known'
        }</span>
      </div>
      ${ac.emergency ? `<div class="fleet-emergency">Emergency status: ${esc(ac.emergency)}</div>` : ''}
      <dl class="fleet-detail-grid">
        <div><dt>S/N</dt><dd>${esc(ac.serial || '—')}</dd></div>
        <div><dt>Callsign</dt><dd>${esc(ac.callsign || '—')}</dd></div>
        <div><dt>Altitude</dt><dd>${esc(fleetAltitude(ac))}</dd></div>
        <div><dt>Ground speed</dt><dd>${ac.speed === null ? 'Unavailable' : `${Math.round(ac.speed)} kt`}</dd></div>
        <div><dt>Track / heading</dt><dd>${esc(fleetHeading(ac))}</dd></div>
        <div><dt>Vertical rate</dt><dd>${esc(fleetVertRate(ac))}</dd></div>
        <div><dt>Squawk</dt><dd>${esc(ac.squawk || '—')}</dd></div>
        <div><dt>On ground</dt><dd>${ac.onGround ? 'Yes' : 'No'}</dd></div>
        <div><dt>Position age</dt><dd>${esc(fleetAge(ageS))}<br><small>${esc(fleetTimeET(ac.posTime))}</small></dd></div>
        <div><dt>Status</dt><dd>${live ? 'Live' : 'Last known'}</dd></div>
        ${ac.onGround
          ? `<div class="wide"><dt>On ground at (est.)</dt><dd>${groundAt}</dd></div>`
          : `<div class="wide"><dt>Departed (est.)</dt><dd>${departed}</dd></div>
             <div class="wide"><dt>Destination</dt><dd>${destination}</dd></div>`}
        ${landed ? `<div class="wide"><dt>Last landed (est.)</dt><dd>${landed}</dd></div>` : ''}
        <div class="wide"><dt>Track line</dt><dd>${trailPts >= 2 ? `${trailPts} recent positions drawn on map` : 'No recent history yet'}</dd></div>
        ${ac.rosterFlag ? `<div class="wide"><dt>Roster note</dt><dd>${esc(ac.rosterFlag)}</dd></div>` : ''}
        <div class="wide"><dt>Coordinates</dt><dd>${ac.lat.toFixed(4)}, ${ac.lon.toFixed(4)}</dd></div>
        <div class="wide"><dt>Data source</dt><dd>${sourceText}</dd></div>
      </dl>
      ${trackerUrl ? `<a class="btn btn-primary fleet-tracker-link" href="${trackerUrl}" target="_blank" rel="noopener noreferrer">Open ADSB.lol tracker</a>` : ''}`;
    drawFleetTrail(ac);
    if (fleetMap && fleetMarkers[index]) {
      if (pan) fleetMap.panTo([ac.lat, ac.lon]);
      fleetMarkers[index].openTooltip();
    }
    if (reveal && window.innerWidth < 900) {
      const sticky = document.querySelector('.fleet-map-intro');
      const topbarEl = document.querySelector('.topbar');
      const stickyBottom = Math.max(
        sticky && getComputedStyle(sticky).position === 'sticky' ? sticky.getBoundingClientRect().bottom : 0,
        topbarEl ? topbarEl.getBoundingClientRect().bottom : 0
      );
      window.scrollTo({ top: panel.getBoundingClientRect().top + window.scrollY - stickyBottom - 8, behavior: 'smooth' });
    }
  }

  function applyFleetFilter() {
    const source = fleetAllAircraft.slice();
    fleetAircraft = fleetFilterMode === 'live' ? source.filter(fleetIsLive) : source;
    const rank = ac => (fleetIsLive(ac) ? (ac.onGround ? 1 : 0) : 2);
    fleetAircraft.sort((a, b) => rank(a) - rank(b) || String(a.registration).localeCompare(String(b.registration)));
    const list = $('#fleet-aircraft-list');
    const details = $('#fleet-details');
    const liveList = fleetAllAircraft.filter(fleetIsLive);
    const airborne = liveList.filter(ac => !ac.onGround).length;
    const emptyDetails = '<div class="fleet-details-empty">Tap an aircraft marker or list item for details.</div>';
    if (!fleetAircraft.length) {
      setFleetState(
        fleetFilterMode === 'live'
          ? 'No live Flexjet Praetors visible right now. Switch to All fleet for last-known.'
          : 'No fleet positions available yet.',
        'empty'
      );
      if (list) list.innerHTML = '';
      if (details) details.innerHTML = emptyDetails;
    } else {
      setFleetState('', '');
      if (list) list.innerHTML = fleetAircraft.map((ac, index) => {
        const live = fleetIsLive(ac);
        return `
        <button type="button" class="fleet-aircraft-button ${live ? (ac.onGround ? 'is-ground' : 'is-live') : 'is-last-known'}" data-fleet-index="${index}">
          <strong>${esc(ac.registration)} <em class="fleet-list-status">${esc(live ? (ac.onGround ? 'On ground' : fleetAltShort(ac)) : 'Last known')}</em></strong>
          <span>${esc(ac.callsign || '—')} · ${esc(ac.model)}${ac.serial ? ` · S/N ${esc(ac.serial)}` : ''}${live && !ac.onGround && ac.speed !== null ? ` · ${Math.round(ac.speed)} kt` : ''}${!live ? ` · ${esc(fleetTimeET(ac.posTime))}` : ''}</span>
        </button>`;
      }).join('');
      app.querySelectorAll('[data-fleet-index]').forEach(el => {
        el.addEventListener('click', () => selectFleetAircraft(Number(el.getAttribute('data-fleet-index'))));
      });
      if (details) details.innerHTML = emptyDetails;
    }
    const counts = $('#fleet-filter-counts');
    if (counts) counts.textContent = `${liveList.length} live (${airborne} airborne) · ${fleetAllAircraft.length} with position`;
    app.querySelectorAll('[data-fleet-filter]').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-fleet-filter') === fleetFilterMode);
      el.setAttribute('aria-pressed', el.getAttribute('data-fleet-filter') === fleetFilterMode ? 'true' : 'false');
    });
    renderFleetMapMarkers(fleetAircraft);
    renderFleetRosterTable();
    if (fleetSelectedKey) {
      const idx = fleetAircraft.findIndex(ac => (ac.hex || ac.registration) === fleetSelectedKey);
      if (idx >= 0) selectFleetAircraft(idx, false, false);
    }
  }

  function renderFleetRosterTable() {
    const wrap = $('#fleet-roster');
    if (!wrap) return;
    if (!fleetRoster || !Array.isArray(fleetRoster.aircraft)) {
      wrap.innerHTML = '<p class="fleet-roster-note">Roster unavailable.</p>';
      return;
    }
    const wasOpen = !!wrap.querySelector('details[open]');
    const seen = new Map();
    fleetAllAircraft.forEach(ac => {
      const r = fleetRosterEntry(ac);
      if (r) seen.set(r.registration, ac);
    });
    const c = fleetRoster.counts || {};
    const rows = fleetRoster.aircraft.slice().sort((a, b) => {
      if (!!a.flag !== !!b.flag) return a.flag ? 1 : -1;
      if (a.icao_type !== b.icao_type) return a.icao_type === 'E545' ? -1 : 1;
      return String(a.registration).localeCompare(String(b.registration));
    });
    wrap.innerHTML = `
      <details class="fleet-roster-details"${wasOpen ? ' open' : ''}>
        <summary>Fleet roster — ${esc(c.company_fleet_list ?? '—')} tails (${esc(c.company_fleet_list_E545 ?? '—')} Praetor 500 · ${esc(c.company_fleet_list_E550 ?? '—')} Praetor 600)${c.flagged_not_on_company_list ? ` + ${esc(c.flagged_not_on_company_list)} flagged` : ''}</summary>
        <p class="fleet-roster-note">Source: ${esc(fleetRoster.source || 'Flexjet fleet list (Oct 30 2025)')}. Tail / serial / model cross-checked against the public FAA Aircraft Registry. Flagged tails are not on the company fleet list dated Oct 30 2025.</p>
        <div class="fleet-roster-scroll">
          <table class="fleet-roster-table">
            <thead><tr><th>Tail</th><th>Type</th><th>Serial</th><th>Position</th><th>Note</th></tr></thead>
            <tbody>${rows.map(r => {
              const ac = seen.get(r.registration);
              const pos = ac ? (fleetIsLive(ac) ? (ac.onGround ? 'Live · ground' : `Live · ${fleetAltShort(ac)}`) : 'Last known') : '—';
              return `<tr class="${r.flag ? 'is-flagged' : ''}"><td><strong>${esc(r.registration)}</strong></td><td>${esc(r.label || r.icao_type)}</td><td>${esc(r.serial_number || '—')}</td><td>${esc(pos)}</td><td>${r.flag ? esc(r.flag) : ''}</td></tr>`;
            }).join('')}</tbody>
          </table>
        </div>
      </details>`;
  }

  function renderFleetAircraft(aircraft, meta) {
    if (!isFleetRoute()) return;
    fleetMeta = meta;
    fleetAllAircraft = aircraft;
    updateFleetBadge();
    const updated = $('#fleet-updated');
    const fallback = $('#fleet-fallback');
    if (updated) updated.textContent = meta.generatedAt ? `Feed time: ${fleetTimeET(meta.generatedAt)}` : 'Feed time: —';
    if (fallback) {
      if (meta.note) {
        fallback.hidden = false;
        fallback.innerHTML = esc(meta.note);
      } else {
        fallback.hidden = true;
        fallback.textContent = '';
      }
    }
    applyFleetFilter();
  }

  async function fetchJson(url, signal) {
    const response = await fetch(url, { cache: 'no-store', signal });
    if (!response.ok) throw new Error(`${url} → HTTP ${response.status}`);
    return response.json();
  }

  async function fetchFleetRelay(signal) {
    // Minute of (now − 25 s): before :25 use the previous minute's (final) file so we never
    // make the CDN cache the current minute's file before the relay has refreshed it.
    const bucket = Math.floor((Date.now() - FLEET_REFRESH_OFFSET_MS) / 60000);
    const urls = [`${FLEET_LIVE_BASE}m/${bucket}.json`, `${FLEET_LIVE_BASE}m/${bucket - 1}.json`, FLEET_LIVE_URL];
    for (const url of urls) {
      try {
        return await fetchJson(url, signal);
      } catch (err) {
        if (err && err.name === 'AbortError') throw err;
        console.warn('Fleet relay miss:', url, String(err && err.message || err));
      }
    }
    return null;
  }

  function mergeFleet(primary, secondary) {
    const byKey = new Map();
    const key = ac => ac.hex || ac.registration;
    secondary.forEach(ac => byKey.set(key(ac), ac));
    primary.forEach(ac => {
      const prev = byKey.get(key(ac));
      if (!prev || new Date(ac.posTime) >= new Date(prev.posTime)) byKey.set(key(ac), ac);
    });
    return Array.from(byKey.values());
  }

  async function loadFleetMapData() {
    if (!isFleetRoute() || fleetLoading) return;
    fleetLoading = true;
    fleetLastRequestAt = Date.now();
    updateFleetRefreshButton();
    if (!fleetAllAircraft.length) setFleetState('Loading positions…', 'loading');
    fleetAbortController = new AbortController();
    const signal = fleetAbortController.signal;
    try {
      await loadFleetRoster();
      const [relay, lastKnown] = await Promise.all([
        fetchFleetRelay(signal),
        fetchJson(FLEET_LAST_KNOWN_URL, signal).catch(err => { if (err && err.name === 'AbortError') throw err; return null; }),
      ]);
      const lkList = lastKnown && lastKnown.aircraft
        ? Object.entries(lastKnown.aircraft).map(([k, e]) => fleetNormalize(e, k, 'last_known')).filter(Boolean)
        : [];
      if (relay && Array.isArray(relay.aircraft)) {
        const relayList = relay.aircraft.map(e => fleetNormalize(e, e.hex, 'relay')).filter(Boolean);
        const fresh = fleetAgeSeconds(relay.generated_at) <= FLEET_FEED_STALE_S;
        renderFleetAircraft(mergeFleet(relayList, lkList), {
          mode: fresh ? 'live' : 'last_known',
          generatedAt: relay.generated_at,
          note: fresh ? null : `Live relay last updated ${fleetTimeET(relay.generated_at)} — positions are not live right now.`,
        });
        return;
      }
      if (lkList.length) {
        renderFleetAircraft(lkList, {
          mode: 'last_known',
          generatedAt: lastKnown.updated_at || null,
          note: 'Live relay unreachable — showing the hourly last-known store. Positions are not live.',
        });
        return;
      }
      const snapshot = await fetchJson(FLEET_SNAPSHOT_URL, signal);
      renderFleetAircraft((snapshot.aircraft || []).map(e => fleetNormalize({ ...e, last_seen: snapshot.snapshot_at }, e.hex, 'snapshot')).filter(Boolean), {
        mode: 'snapshot',
        generatedAt: snapshot.snapshot_at,
        note: 'Snapshot fallback — not live.',
      });
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      console.warn('Fleet data unavailable:', err);
      fleetMeta = { mode: 'error', generatedAt: null };
      updateFleetBadge();
      setFleetState('Fleet positions are unavailable right now. Tap Refresh aircraft to retry.', 'error');
    } finally {
      fleetLoading = false;
      fleetAbortController = null;
      updateFleetRefreshButton();
    }
  }

  function fleetNextRefreshWait() {
    const ms = Date.now() % FLEET_REFRESH_MS;
    return ms < FLEET_REFRESH_OFFSET_MS ? FLEET_REFRESH_OFFSET_MS - ms : FLEET_REFRESH_MS + FLEET_REFRESH_OFFSET_MS - ms;
  }

  function scheduleFleetRefresh() {
    if (fleetRefreshTimer) clearTimeout(fleetRefreshTimer);
    const wait = fleetNextRefreshWait();
    fleetRefreshTimer = window.setTimeout(() => {
      if (!isFleetRoute()) return;
      if (document.visibilityState === 'visible') loadFleetMapData();
      scheduleFleetRefresh();
    }, wait);
  }

  function onFleetVisibility() {
    if (!isFleetRoute()) return;
    if (document.visibilityState === 'visible' && Date.now() - fleetLastRequestAt > 15000) loadFleetMapData();
    updateFleetRefreshButton();
  }

  /* ——— Views ——— */
  function viewGate() {
    app.innerHTML = `
      <div class="gate gate-hero">
        <div class="gate-mark" aria-hidden="true"><img src="icons/icon-192.png" alt="" width="72" height="72" /></div>
        <h1>FO Study</h1>
        <p class="sub">Praetor FO study framework<br/>Flexjet · First Officer track</p>
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
      { path: '/indoc', icon: '📚', title: 'Indoc', desc: 'DFW Days 1–4 · Ops Specs · icing/duty/mins · hazmat/evac/physiology', cls: '' },
      { path: '/praetor', icon: '🛫', title: 'Embraer Praetor 500/600', desc: 'Systems shelves · memory · flows', cls: 'gold', bg: 'praetor' },
      { path: '/fleet-map', icon: '🗺️', title: 'Fleet Map', desc: 'Public ADS-B · visible Flexjet Praetor 500/600 aircraft', cls: 'gold' },
      { path: '/ritual', icon: '⏱️', title: 'Study ritual', desc: '20–30 min daily framework', cls: '' },
      { path: '/admin', icon: '✅', title: 'Admin / open items', desc: 'Checklist with local persistence', cls: '' },
      { path: '/flashcards', icon: '🃏', title: 'Flashcards', desc: 'IAI memory items · Praetor · word-for-word', cls: 'gold' },
      { path: null, icon: '🔔', title: 'Notifications', desc: 'Study reminders', stub: 'Later' },
    ];

    app.innerHTML = `
      <div class="${shellClass()}">
        ${topbar('FO Study', 'Praetor FO Study')}
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
        ${mobileReloadBar()}
      </div>`;
    bindNav();
  }


  function viewFleetMap() {
    cleanupFleetMap();
    app.innerHTML = `
      <div class="${shellClass()} shell-fleet-map">
        ${topbar('Fleet Map', 'Home', '/')}
        <main class="content fleet-map-content">
          <section class="fleet-map-intro" aria-labelledby="fleet-map-title">
            <div>
              <div class="eyebrow">Praetor 500/600 · public tracking</div>
              <h2 id="fleet-map-title">Flexjet Praetor fleet</h2>
              <p>Live public ADS-B for the roster (relayed by the box about every 60 s) plus last-known positions. Tap a plane for details.</p>
            </div>
            <button type="button" class="btn btn-primary" id="fleet-refresh">Refresh aircraft</button>
          </section>
          <div class="fleet-filter-bar" role="group" aria-label="Fleet list filter">
            <button type="button" class="fleet-filter-btn active" data-fleet-filter="all" aria-pressed="true">All fleet</button>
            <button type="button" class="fleet-filter-btn" data-fleet-filter="live" aria-pressed="false">Live only</button>
            <span class="fleet-filter-counts" id="fleet-filter-counts">—</span>
          </div>
          <div class="fleet-meta" aria-live="polite">
            <span class="fleet-status-badge loading" id="fleet-status-badge">Loading</span>
            <span id="fleet-updated">Feed time: —</span>
            <span>Auto-refresh: every minute while open</span>
            <span class="fleet-refresh-hint" id="fleet-refresh-hint">Manual refresh available</span>
          </div>
          <div class="fleet-fallback" id="fleet-fallback" role="alert" hidden></div>
          <div class="fleet-state loading" id="fleet-state" role="status">Loading public ADS-B positions…</div>
          <div class="fleet-map-layout">
            <section class="fleet-map-panel" aria-label="Aircraft map">
              <div id="fleet-map-canvas"></div>
              <div class="fleet-map-unavailable" id="fleet-map-unavailable" hidden></div>
            </section>
            <aside class="fleet-details" id="fleet-details" aria-live="polite">
              <div class="fleet-details-empty">Tap an aircraft marker or list item for details.</div>
            </aside>
          </div>
          <div class="fleet-aircraft-list" id="fleet-aircraft-list" aria-label="Fleet aircraft"></div>
          <section class="fleet-roster" id="fleet-roster" aria-label="Fleet roster"></section>
          <section class="fleet-disclaimer">
            <strong>Coverage limitation</strong>
            <p>Public ADS-B coverage can be incomplete, delayed, or filtered. LIVE = position less than ~2.5 min old from the box relay; dimmed markers are last-known sightings, not live. ✈ = airborne (pointing along track), ■ = on ground. "Departed (est.)" / "On ground at (est.)" are estimates from the nearest airport to ADS-B fixes; fractional flights publish no destination. Informational only — not Flexjet dispatch or Tailwind data.</p>
          </section>
        </main>
        ${mobileReloadBar({ fleetRefresh: true })}
      </div>`;
    bindNav();
    $('#fleet-refresh')?.addEventListener('click', loadFleetMapData);
    $('#fleet-refresh-mobile')?.addEventListener('click', loadFleetMapData);
    app.querySelectorAll('[data-fleet-filter]').forEach(el => {
      el.addEventListener('click', () => {
        fleetFilterMode = el.getAttribute('data-fleet-filter') || 'all';
        applyFleetFilter();
      });
    });
    fleetCooldownTimer = window.setInterval(updateFleetRefreshButton, 1000);
    scheduleFleetRefresh();
    if (!fleetVisibilityBound) {
      document.addEventListener('visibilitychange', onFleetVisibility);
      window.addEventListener('pageshow', onFleetVisibility);
      fleetVisibilityBound = true;
    }
    loadFleetMapData();
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
            <div class="note">Classmate-safe process notes — no personal sizes/addresses. Day 2/3 video clips still empty. Full large-v3 compare 2026-09-19 folded (Phenom 8–9 mo · seat locks).</div>
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
              <li><strong>Training vs line:</strong> rates per the HR handout. <strong>Line:</strong> daily rate × days; reconcile prior month on first check of next month</li>
              <li><strong>Per diem:</strong> tax-exempt $42/work day (confirm handout); often estimate then reconcile</li>
              <li><strong>OT:</strong> 12–14h OT past 12; past 14h = triple; early start if duty-on before 07:00; extended day (can’t domicile before midnight) = 1.5× daily. Ops reports it — you don’t track. Pays first check next month</li>
              <li><strong>Stub:</strong> UKG “hours” often = days; rate is daily. Prefer UKG web. Verify DD + tax elections. HR payroll email on handout</li>
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
              <li>Dennis Florian — VP Flight Admin</li>
              <li>Tim Montie — Director, Operations · Joe Scott — Chief Pilot</li>
              <li>John Christensen — VP Flight Ops, ILC</li>
              <li>Bri Izzo — Director, HR · Mike Cirino — HR BP</li>
              <li>Josh Rock — Director, Flight Administration</li>
              <li>Cathy Cunningham — DFW parking / building</li>
              <li>Alex Howard — Crew Services (bids / PTO / schedule)</li>
              <li>Nick Riglin — Director Scheduling &amp; GCC · Christina (?) — Flight Admin / expense</li>
              <li>Andrew (?) — FOATM / Flight Ops supervisor · Praetor program · Tailwind/Concur</li>
              <li>Kevin Dillon/Dilling (?) — COO, Maintenance / Global Services</li>

              <li>Alanna (?) — A Cut Above (uniforms)</li>
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
      blurb: 'Issuance, aircraft, management, op control, EFB, eligible on-demand, contamination/icing, D&A/food-safety hooks.',
      bullets: [
        'Bucket: definitions · authorized aircraft/configs · exemptions · management personnel · operational control · contract training · eligible on-demand · EFBs.',
        'Op control (A006): only the company initiates/conducts/terminates flights. PIC may delay/cancel/divert/refuse unsafe — not self-dispatch. Class list: Jim Dunn · Doug Leitkamp (?) · Tim Monti · Joe Scott (+ delegates).',
        'Legal stack: legal crew (employee/agent, current 293/297/299/annual) · legal aircraft (CAMP, MEL/CDL, Form 501, exclusive possession) · legal pax (APIS; 135 photo ID) · legal flight (A006 initiator + specific aircraft/PIC/SIC in Tailwind).',
        'Driver story: Platinum Jet / Darby (Teterboro) freelancers on another certificate — why these rules exist.',
        'EFB: Type A (general docs) vs Type B (ForeFlight charts/taxi). Databases current; EFB care in FOM. Ramp-check ready.',
        'High-mins: do not pair A+B. High-mins ≈100 hrs type; B pairing floor ≈75 hrs captain — speak up if wrong.',
        'Always fly/duty as 135 even if release says 91 repo. Flexjet/POI killed 91 duty loopholes.',
        'Alcohol (135): served by company employee. Hold stowage/safety lines; write continuity notes.',
        'Contamination / ground icing: open-book opspec lookup (A041 family named in class). Must be covered on 8410 oral.',
        'Flight locating: Global Ops tracks IFR/VFR via ATC feed; VFR intent notify; C077 family (~50 NM theme — verify).',
        'D&A + food safety + MedAire programs briefed Day 1 — durable process (see Must lock).',
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
      blurb: 'DAAP, approach/takeoff/alternate mins, foreign procedures, specials, visual/VFR, lower-than-standard takeoff.',
      bullets: [
        'C49 DAAP — required when landing RVR below 4000 or vis below 3/4 SM, contaminated runway, braking less than good, xwind over 15 kt, wind shear, or PIC deems necessary.',
        'C51 foreign terminal instrument procedures / RVR conversion / lighting.',
        'C52 CAT I lighting/RVR: TDZ controlling; mid+rollout advisory; still need two RVR sources when required. Verify chart numbers — don’t memorize ASR figures.',
        'C54 approach/landing limits + high-mins PIC; PIC must be qualified for <¾ SM / RVR 4000 approaches.',
        'C55 alternate mins — use the table; chart NA = cannot use as alternate.',
        'C57 IFR takeoff mins — standard 1 SM / RVR 5000; lower when authorized + TDZ RVR available.',
        'NEW: lower-than-standard takeoff path ~500 RVR (135) / ~600 (91K) with required lights/equipment; two-pilot + trained; SIC 100-in-type to manipulate — verify live OpSpec.',
        'Also touched: C63 RNP AR · C64 Class B no tower (missed + approved wx + advisories) · C73 VDAP/CDFA · C75 CAT I · C77 visual/cancel IFR.',
        'Dispatchers are opspec-fluent — use them.',
      ],
    },
    d: {
      title: 'D · Maint',
      blurb: 'CAMP/Form 501/ferry/FCF hooks from Day 1. MEL/CDL deep dive still later — do not invent.',
      bullets: [
        'Board bucket D = Maintenance opspecs. Day 1 now has usable hooks (not empty label-only).',
        'Airworthiness/status via CAMP; discrepancies via Form 501.',
        'Special flight / ferry permits + functional check flights after MX (Indoc qualifies; some need test pilot). Ferry permit in ForeFlight; not for AD-grounded aircraft.',
        'Line discrepancies still: MX controllers via ops/GCC (CLE Day 3) — 4-letter ID + tail.',
        'Aircraft weigh program ties to W&B (every 36 months — verify paragraph).',
        'Shelf status: Day 1 hooks + Day 3 Form 501/CDL/ferry/MVF/status-book deep dive. Verify live MEL/FOM.',
      ],
    },
    e: {
      title: 'E · W&B',
      blurb: 'Electronic W&B, average weights, Tailwind push/save, captain final fuel, Everest Fuel process.',
      bullets: [
        'Aircraft weighed every 36 months (program/opspec — verify live docs).',
        'Electronic W&B in ForeFlight; small-cabin standard average passenger weights; longhand backup exists in program.',
        'Load manifest: pax count, total weight, MTOW check, CG limits — ForeFlight + Tailwind.',
        'Flight plans + W&B built/pushed to crew. Recent rule: once saved, partner device sees it — no separate send (confirm current SOP).',
        'Captain confirms final fuel. Everest Fuel (Day 1 clip 04): contract FBOs — sign ticket · gallons in Tailwind; non-contract — card on field release; Multi-Service card on aircraft backup (~1%).',
        'Preferred FBO airport-specific (Signature common, not universal). Tankering software currently glitched — captain mission judgment. Report bad fueling / contamination.',
      ],
    },
  };

  function viewIndoc() {
    app.innerHTML = `
      <div class="${shellClass()}">
        ${topbar('Indoc · DFW Days 1–4', 'Home', '/')}
        <main class="content">
          <div class="card">
            <h3><span class="dot"></span>Mon Sep 21, 2026 · CAE Dallas West</h3>
            <p>Dense capture from Plaud 01–06 (~208 min) + whiteboard. Ops Specs spine = <strong>A General · B Enroute · C Term · D Maint · E W&B</strong> (mnemonic: Get More Whiskey And Beer). Know <em>where</em> to find answers. Memory items + limitations = closed-book.</p>
            <div class="note">Praetor 500/600 track only. Phenom/Challenger appear as fleet types in Indoc overview — no Phenom shelves.</div>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Must lock — Day 1</h3>
            <ul>
              <li><strong>CTH first:</strong> ForeFlight Praetor 500/600 Crew Training Handbook (~80 pp) ≈ 99% of type prep (memory · limitations · systems Qs). <strong>CFM</strong> for flows/profiles/checklist usage. AFM later via Fly Embraer — don’t AFM-cram early.</li>
              <li><strong>Aircrew Training Manual:</strong> Flexjet Docs → Training &amp; Checking → Instructor/Check Airman → ATM → type appendix (curriculum map).</li>
              <li><strong>Sunday 50Q:</strong> open-book on Flexjet Academy (iPad). Prep from ~201Q study guide. Gerald (135 mgr) writes wording gotchas.</li>
              <li><strong>Academy ~11 modules:</strong> Heather Bey assign · required for 135 credit · done by Sunday. academy.flexjet.com · Flexjet email · pw <code>Flexjet1</code> (change first login). Issues → heather.bey@flexjet.com</li>
              <li><strong>Duty always 135:</strong> 14 duty / 10 fly / 10 rest (two-pilot). Tailwind tracks; speak up if reality breaks plan. Non-local deadhead ≠ rest.</li>
              <li><strong>Op control:</strong> company only initiates/conducts/terminates. Legal crew+aircraft+pax+flight. A006 names from class (verify spelling). Platinum Jet/Darby lesson.</li>
              <li><strong>Everest Fuel:</strong> contract FBO — sign ticket · gallons in Tailwind. Non-contract — release card; Multi-Service backup on aircraft. Report bad fueling. Tankering SW glitched — captain judgment.</li>
              <li><strong>Lower T/O mins:</strong> ~500 RVR (135) / ~600 (91K) class numbers — verify OpSpec. SIC 100-in-type to manipulate.</li>
              <li><strong>Ferry / FCF:</strong> OpSpec D permits in ForeFlight; not AD-grounded; Indoc qualifies many FCFs — call MX if unsure.</li>
              <li><strong>Pax ID / brief:</strong> 135 photo ID ≥18; prefer face-to-face over PA; seatbelt culture; Real ID / enhanced DL states named in class.</li>
              <li><strong>Food safety:</strong> keep cold; danger zone ~41–140°F; leftovers = give away/trash; never reheat twice.</li>
              <li><strong>D&amp;A:</strong> 8-hr bottle-to-throttle; random via Safety; leave site = refusal; ≥0.04 path + FAA; meds via AME/company.</li>
              <li><strong>High-mins:</strong> no A+B pair; ~100 hrs high-mins; ~75 hrs B floor.</li>
              <li><strong>Priorities:</strong> Safety → Compliance → Customer service.</li>
              <li><strong>ASAP:</strong> both pilots file → company + FAA/POI. Not obligated to call ATC deviation phone if ASAP filed. No shield for intentional/careless/D&amp;A.</li>
              <li><strong>Medical:</strong> first-class only; by 25th of expiration month. Spare glasses if required on medical. Temp type cert 120 days — chase plastic early.</li>
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
              <li>Also named: Gerald (135 mgr) · Jim Dunn (DOT) · Joe Scott (CP) · Tim Monti (DO) · Doug Leitkamp (?) · Everest Fuel presenter · Brandon (Everest audits) · Scott (watching Day 2+) · POI Jeff Carlson/Piles (?)</li>
            </ul>
          </div>


          <p class="section-label">135 Recurrent · Academy mock</p>
          <div class="shelf-list" style="margin-bottom:18px">
            <button type="button" class="shelf-item" data-nav="/indoc/135">
              <span class="name">135 Recurrent</span>
              <span class="meta">201Q study · 50Q mock · pass 80%</span>
              ${svg('chev')}
            </button>
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
              <li>Fly Embraer / <strong>Embraer TechPub</strong> download · verify CTH in ForeFlight</li>
              <li>Confirm <strong>RDA</strong> on training email (Day 2)</li>
              <li><s>Everest Fuel 13:00 brief</s> — captured Day 1 clip 04</li>
              <li>Day 3 verify: OpSpec takeoff/alternate mins · FOM 7.3.11 icing · Praetor land-with fuel · “MPL” label</li>
              <li>Day 4 verify: hazmat exception numbers on the card · COAST/PREP letters · Praetor emergency-descent items (QRH)</li>
              <li>Confirm W&amp;B save-vs-send SOP · POI spelling · official type-travel email</li>
            </ul>
          </div>


          <div class="card">
            <h3><span class="dot"></span>Tue Sep 22, 2026 · Day 2 — video day</h3>
            <p><strong>Lots of videos Day 2</strong> — CFIT, runway incursions, wake turbulence, upset/stall, PRM/breakout-type. Skim/archive the videos. Do <em>not</em> dense-study video narration. Durable process below only.</p>
            <div class="note">Plaud 01–06 · ~229 min · LIGHT notes only. Praetor 500/600 track.</div>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Must lock — Day 2</h3>
            <ul>
              <li><strong>Military / PPR:</strong> civil landing permit on file · Flight Control obtains permission/PPR · permit copy to crew · originals with the pilot manager (verify FOM). Read Tailwind airport notes.</li>
              <li><strong>Praetor path:</strong> separate systems-integration week → <strong>~6 sims + checkride + walk</strong> (ASR first said eight, then clarified). Challenger/Phenom combine ground + SI.</li>
              <li><strong>EFB:</strong> <strong>ForeFlight</strong> primary (plans/WX/NOTAMs/plates/charts/company docs). Download <strong>Embraer TechPub</strong>. MyFreeFlight still for W&amp;B/runway-analysis exposure. iPad for all work assignments. EFB currency guide under Documents → resources.</li>
              <li><strong>RDA:</strong> access coming via training email (classmates got it Day 2) — confirm yours.</li>
              <li><strong>People:</strong> Jim Dunn (Director of Training) · David Cooper (managers / lead check airmen context).</li>
              <li><strong>Study:</strong> keep question-bank / study-guide lookups going (know sources for Sunday open-book).</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Wed Sep 23, 2026 · Day 3 — classroom dense</h3>
            <p>MX forms · CDL/ferry/MVF · ForeFlight W&amp;B/performance · icing HOT/tactile · duty/rest/FOTM · status book/501 · takeoff/alternate mins · taxi CRM. Plaud <strong>01–07</strong> (~224.5 min; clips <strong>02–03 non-speech</strong>).</p>
            <div class="note">Praetor 500/600 track. Classmate-safe process only — no personal PII. Verify live OpSpec/FOM numbers before checkride.</div>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Must lock — Day 3</h3>
            <ul>
              <li><strong>Form 501:</strong> never erase — line through · initial+date · rewrite. Error 501 → “generated in error / no MX.” Pink copy stays; no next flight until corrected/deferred.</li>
              <li><strong>Remote MX:</strong> approved video link · controller Form 500 + CAMP · fail → PIC writes 501.</li>
              <li><strong>CDL:</strong> back of MEL · performance penalties · stack with other deviations.</li>
              <li><strong>Ferry / MVF:</strong> MX inspect before ferry · FO-03 on board · no revenue · no post-accident ferry until NTSB/FAA release. Cat 1 MVF no MX sign-off; speak up on structural/flight-control ferries; no pax on required MVF/FCF unless needed.</li>
              <li><strong>Circuit breakers:</strong> no in-flight reset unless needed for safe flight; QRH-only pulls; ground OK.</li>
              <li><strong>Weigh:</strong> empty weight/CG every 36 months.</li>
              <li><strong>Icing:</strong> HOT advisory; contamination check still required. Inside HOT + visible → visual (~5 min prior). Exceed HOT → tactile required. Freezing drizzle/light freezing rain / can’t determine → tactile (FOM 7.3.11 — verify).</li>
              <li><strong>Contaminated landing:</strong> ~1.15 factor class · braking-action fair/nil advisories · stabilized Vref.</li>
              <li><strong>Performance:</strong> Part 135 baseline · ForeFlight primary · fail → AFM. Landing planning 60% rule; DAAP/80% path — verify live use.</li>
              <li><strong>W&amp;B / fuel:</strong> Save to flight files. Bag ~30 lb class. Land-with targets class: ~2000 lb large-cabin / ~800 lb Phenom-Praetor class — verify Praetor FOM. Don’t abuse tankering.</li>
              <li><strong>Duty/rest:</strong> 14/10 baseline. &gt;10 flight in 24h → table rest. FOTM may extend duty to max 15h two-pilot if beyond company control + realistically planned. Circadian low ~0130 local where duty begins (test item — confirm card). Hotel 90/120 standby.</li>
              <li><strong>Status book (FOM §5):</strong> PIC airworthiness every flight — tires, consumables, docs, open discrepancies. Aim ~90+ min early on day-one tight turns.</li>
              <li><strong>Takeoff/alternate mins:</strong> OpSpec tables. Dual operable RVR when vis &lt;¼ SM / ~1600 RVR class + lighting. Takeoff alternate ≤1 hour still air if can’t return. Alternate weather from OpSpec approach table.</li>
              <li><strong>Taxi CRM:</strong> chart + brief before taxi · heads-up · verify crossings · <em>stop</em> for FMS programming · runway/departure change checklist after push.</li>
              <li><strong>Oral tip:</strong> limitations + memory items ≈ ~85% of oral (class).</li>
              <li><strong>Class B under shelf:</strong> 200 kt — controller cannot authorize faster.</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>People — Day 3</h3>
            <ul>
              <li><strong>Mike Sliva</strong> — Indoc instructor (continuing)</li>
              <li><strong>Scott</strong> — co-instruct · icing/CRM/mins blocks</li>
              <li><strong>FOTM</strong> — duty extensions (max 15h two-pilot)</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Thu Sep 24, 2026 · Day 4 — hazmat · evac · physiology</h3>
            <p>Hazmat (will-not-carry) · raft/ditching video · emergency evacuation · disabled passengers · service culture · altitude physiology. Plaud <strong>01–05</strong> (~145.6 min; clip <strong>05 non-speech</strong>).</p>
            <div class="note">Praetor 500/600 track. Classmate-safe, generic takeaways only. Verify numbers against the written hazmat card / QRH before a checkride.</div>
          </div>

          <div class="card">
            <h3><span class="dot"></span>Must lock — Day 4</h3>
            <ul>
              <li><strong>Hazmat:</strong> Flexjet is a <em>will-not-carry</em> operator. No hazmat authorization; only items that qualify as exceptions (company materials too). Training per 14 CFR 135.505, recurrent every 24 months.</li>
              <li><strong>Dry ice (test item):</strong> 5.5 lb per person (class). <strong>Alcohol:</strong> ≤1.3 gal, ≤70%. <strong>Self-defense spray:</strong> ≤4 oz with safety clip.</li>
              <li><strong>Lithium:</strong> spare batteries and vapes carry-on only. Mobility-aid Li battery ≤300 Wh; one spare, or two at ≤160 Wh. Terminals protected. PIC told where it is.</li>
              <li><strong>Hidden hazmat:</strong> ask what’s in the bag. Bleach, drain cleaner, pool chemicals, spray starch, fireworks, magnets = no. Fuel-engine gear only if fully purged. If it looks or smells wrong, don’t load it.</li>
              <li><strong>In-flight spill/fumes:</strong> consider emergency descent + landing · mask + smoke goggles · tell ATC.</li>
              <li><strong>Evac:</strong> PIC runs it (SIC if PIC can’t) · tell ATC early · look outside before opening any exit · sweep cabin · don’t re-enter · account for everyone. On the ramp, main cabin door is best.</li>
              <li><strong>TEST pax brief:</strong> Type of emergency · Exit to use · Signals (brace call) · Time to touchdown.</li>
              <li><strong>Raft:</strong> preflight inspection card + handles out + painter line clear (snag = inflation inside the cabin). From aircraft: tie painter line, throw away from aircraft, pull line. In water: quick-deploy ring. Never drink seawater. Whistle is the best voice you have.</li>
              <li><strong>Disabled pax:</strong> ask how to help · enlist able pax · don’t injure yourself · slow down, call EMS to help board.</li>
              <li><strong>PIC owns parking:</strong> don’t accept a ramp spot that’s unsafe for passengers (ice).</li>
              <li><strong>Service:</strong> call ahead so the car is planeside at shutdown · door to door · smile at the stairs · last thing they see is you closing the door.</li>
              <li><strong>Physiology:</strong> 61.31(g) high-altitude endorsement · hypoxia types: hypoxic / hypemic / stagnant / histotoxic · mask 100% early · DCS can appear hours later · use the Praetor QRH for emergency-descent memory items.</li>
              <li><strong>Devices:</strong> keep company and personal phone/email separate; use personal email for government/benefit accounts.</li>
            </ul>
          </div>

          <div class="card">
            <h3><span class="dot"></span>People — Day 4</h3>
            <ul>
              <li><strong>Mike Sliva</strong> — Indoc instructor (continuing)</li>
              <li><strong>Scott</strong> — co-instruct · disabled-pax / service culture</li>
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
    app.querySelectorAll('[data-reload]').forEach(el => {
      el.addEventListener('click', hardReload);
    });
  }

  function render() {
    if (!isUnlocked()) {
      cleanupFleetMap();
      viewGate();
      return;
    }
    const { parts } = parseHash();
    const root = parts[0] || '';
    if (root !== 'fleet-map') cleanupFleetMap();

    // v25: study-v25.js (FOStudyExt) owns Home, Indoc hub, Checkride prep, Drill, Checklists, Search, Gaps.
    if (window.FOStudyExt && window.FOStudyExt.route(parts)) return;
    if (!root) return viewHome();
    if (root === 'fleet-map') return viewFleetMap();
    if (root === 'orientation') return viewOrientation();
    if (root === 'indoc') {
      if (parts[1] === '135') {
        if (parts[2] === 'study') return void viewIndoc135Study();
        if (parts[2] === 'quiz') return void viewIndoc135Quiz();
        return viewIndoc135Hub();
      }
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

  window.FOStudy = {
    app, $, esc, svg, topbar, shellClass, bindNav, go, parseHash, hardReload,
    loadMemoryDeck, loadRecurrentBank, shuffleInPlace, flashState, INDOC_AE, cleanupFleetMap,
    views: { viewIndoc135Hub, viewIndoc135Study, viewIndoc135Quiz, viewIndocShelf, viewMemoryItems, viewNotes,
             viewFlashcards, viewOrientation, viewRitual, viewAdmin, viewFleetMap, viewHome, viewIndoc },
  };

  window.addEventListener('hashchange', render);
  render();
})();
