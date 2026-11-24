/**
 * Training extras layered on the modules: interactive visuals, deep-dive notes, extra chapters and
 * multiple-choice questions. NumSum's own wording; clause references point to the editions in each module.
 */
import type { Chapter, Mcq, VisualKey } from "../codes-types";

type Extra = { visuals?: Record<string, VisualKey>; deep?: Record<string, [string, string][]>; add?: { after: string; ch: Chapter }[]; mcq: Mcq[] };

export const EXTRAS: Record<string, Extra> = {
  "api-571-damage-mechanisms": {
    visuals: { groups: "dm-families" },
    deep: {
      "critical-factors": [["Why ‘critical’", "A mechanism needs every one of its essential factors at once. Screening works by finding the one factor that is missing — and writing down why — rather than by proving every factor is present."], ["Upset conditions", "Factors often appear only during start-up, shutdown, steam-out or upsets: dew-point corrosion, polythionic acid SCC during shutdown air exposure, brittle fracture during depressurisation. A review that only looks at normal operation misses them."]],
      dmr: [["Who should be in the room", "Inspector (history), corrosion/materials engineer (mechanisms), process engineer (chemistry and upsets) and operations (what really happens). One person alone rarely gets it right."], ["What a good output looks like", "A table per corrosion loop: mechanism, why it is credible, expected rate or susceptibility, where it acts (location), the inspection method and coverage, and the IOWs that control it."]],
    },
    add: [{ after: "groups", ch: { id: "top-twelve", ref: "§3 (selected)", title: "Twelve mechanisms every inspector should know", tags: ["damage"], tool: ["Open the library", "/learn/damage-mechanisms"],
      summary: "If you learn only a dozen mechanisms, learn these — together they cause most fixed-equipment failures in refineries and petrochemical plants.",
      points: ["Corrosion under insulation (§3.22) — insulated carbon steel and low alloy in the wet temperature range.", "Sulfidation (§3.61) — hot sulfur-containing hydrocarbons; carbon and low-Cr steels corrode increasingly fast from roughly 230–260 °C upward.", "High-temperature hydrogen attack (§3.36) — carbon and C-½Mo steels in hot hydrogen; fissuring that thickness readings cannot see.", "Wet H₂S damage (§3.67) — blisters, HIC, SOHIC and SSC in sour water services.", "Chloride SCC (§3.17) — austenitic stainless with chlorides, water and temperature (often under insulation).", "Amine SCC and caustic SCC (§3.3, §3.15) — non-PWHT carbon steel welds in amine or caustic service.", "Polythionic acid SCC (§3.52) — sensitized stainless exposed to air and moisture during shutdowns.", "Creep and stress rupture (§3.23) — heater tubes and hot piping over long times at temperature.", "Brittle fracture (§3.11) — low temperature plus a flaw plus stress, often during hydrotest or depressurising.", "Mechanical and vibration-induced fatigue (§3.43) — small-bore connections, pumps, compressors.", "Erosion / erosion-corrosion (§3.27) — high velocity, solids, two-phase flow at elbows and downstream of valves.", "Microbiologically influenced corrosion (§3.45) — stagnant water, fire water, hydrotest water left in."] } }],
    mcq: [
      { q: "Which inspection method would NOT find chloride SCC in a stainless line?", options: ["Liquid penetrant", "Eddy current", "UT thickness readings", "Phased-array UT"], answer: 2, why: "SCC is cracking with little wall loss, so thickness readings miss it. Crack-detection methods (PT, ET, shear-wave/PAUT) are needed." },
      { q: "A mechanism's critical factors are: susceptible material, temperature window and chlorides. The material is carbon steel. What do you record?", options: ["Credible — inspect anyway", "Not credible — material not susceptible", "Credible only during shutdown", "Unknown"], answer: 1, why: "If one essential factor is missing the mechanism can be ruled out — but write down the reason." },
      { q: "Which family does sulfidation belong to?", options: ["Environment-assisted cracking", "High-temperature corrosion", "Mechanical and metallurgical", "Uniform low-temperature corrosion"], answer: 1, why: "Sulfidation is a high-temperature corrosion mechanism driven by sulfur compounds in hot hydrocarbons." },
      { q: "Polythionic acid SCC most often appears…", options: ["During normal operation at high temperature", "During shutdowns when sensitized stainless meets air and moisture", "Only in cooling-water service", "Only in carbon steel"], answer: 1, why: "Sulfide scale reacts with oxygen and water during shutdowns to form polythionic acids that crack sensitized austenitic stainless steel." },
      { q: "What is the main purpose of the Section 4 process-flow diagrams in API 571?", options: ["Design of process units", "A starting checklist of where mechanisms usually act in each unit", "Calculating corrosion rates", "Selecting NDE procedures"], answer: 1, why: "They show typical locations of mechanisms in common refinery units — a starting point for a damage mechanism review." },
      { q: "Which output of a damage mechanism review feeds API 581 directly?", options: ["Equipment drawings", "Credible mechanisms with rates/susceptibility per circuit", "The site layout", "Operator shift logs"], answer: 1, why: "The damage factors in API 581 are calculated per mechanism using the rates and susceptibility identified in the review." },
      { q: "CUI on carbon steel is mainly a concern…", options: ["Above 400 °C", "Below −50 °C", "In the wet range, roughly −12 °C to 175 °C", "Only on bare pipe"], answer: 2, why: "Water under insulation in this temperature range drives corrosion; hotter equipment stays dry, colder stays frozen." },
      { q: "HTHA is hard to find because…", options: ["It causes rapid general thinning", "It forms internal fissures and decarburization with little wall loss", "It only affects stainless steel", "It occurs only at room temperature"], answer: 1, why: "HTHA attacks the steel internally; specialised advanced UT techniques are needed, not thickness readings." },
    ],
  },

  "api-580-risk-based-inspection": {
    visuals: { risk: "risk-matrix", "what-is-risk": "code-flow" },
    deep: {
      types: [["Choosing the level", "Use qualitative screening for a whole site to find the 10–20% of items that matter; then semi-quantitative or quantitative work on those. Mixing levels is normal and allowed if the method is documented."]],
      "inspection-strategy": [["Effectiveness beats frequency", "Two poor inspections do not equal one good one. A spot UT reading on a vessel with localized corrosion has low effectiveness however often you repeat it; a scanning UT survey of the right area can lower the risk far more."]],
    },
    mcq: [
      { q: "In RBI, risk is…", options: ["Probability + consequence", "Probability × consequence", "Consequence only", "Corrosion rate × age"], answer: 1, why: "Risk combines the likelihood of failure and the consequence of failure as their product." },
      { q: "How does inspection reduce risk?", options: ["It reduces the damage rate", "It reduces uncertainty about the damage state, lowering the estimated probability", "It reduces the consequence", "It does not affect risk"], answer: 1, why: "Inspection improves knowledge; only repair, replacement or process change reduces the damage itself." },
      { q: "Which is NOT one of the four elements of an RBI program?", options: ["Management system", "Documented POF method", "Documented COF method", "Fixed 5-year inspection interval"], answer: 3, why: "The fourth element is a documented method for managing risk through inspection and other mitigation — not a fixed interval." },
      { q: "A quantitative model built on poor data…", options: ["Is always better than qualitative", "Can give precise-looking but inaccurate results", "Needs no review", "Removes the need for inspection"], answer: 1, why: "Precision is not accuracy; data quality limits the result." },
      { q: "Which event should trigger an RBI reassessment?", options: ["A process change", "New damage found", "An IOW exceedance", "All of these"], answer: 3, why: "Any change that makes the previous assumptions unreliable is a trigger, as is the maximum time set by the program." },
      { q: "On a 5 × 5 matrix, a cell one row up from another represents…", options: ["Twice the probability", "About ten times the probability", "Same probability", "Lower consequence"], answer: 1, why: "Probability categories are usually decades — each step is roughly a factor of ten." },
      { q: "Which is a non-inspection way to reduce risk?", options: ["Reducing inventory or adding isolation valves", "Repeating the same inspection", "Ignoring low-risk items", "Changing the risk target after results"], answer: 0, why: "Reducing inventory, adding isolation or detection reduces the consequence side of risk." },
      { q: "Who should set the acceptable risk thresholds, and when?", options: ["The inspector after seeing results", "The owner/user, before the results are known", "The software vendor", "Nobody — RBI has no thresholds"], answer: 1, why: "Thresholds are an owner decision and should be agreed in advance to avoid bias." },
    ],
  },

  "api-581-rbi-methodology": {
    visuals: { "pof-equation": "pof-builder", "risk-matrix": "risk-matrix" },
    deep: {
      "pof-equation": [["The management systems factor", "FMS comes from an audit score (pscore, 0–100%): FMS = 10^(−0.02·pscore + 1). A score of 50% gives 1.0; 100% gives 0.1; 0% gives 10. A good integrity program can lower every item's probability tenfold."], ["Why gff is per hole size", "Small leaks are far more common than ruptures. Splitting gff by hole size lets the consequence model weight each release size realistically."]],
      effectiveness: [["Counting several inspections", "Lower-grade inspections can be combined into an equivalent higher grade under the rules in Part 2 (for example several ‘C’ inspections counting toward a ‘B’). They cannot add up indefinitely — the method limits the credit."]],
    },
    mcq: [
      { q: "API 581 probability of failure for a vessel is…", options: ["gff × FMS × Df(t)", "gff + Df(t)", "COF × FMS", "Corrosion rate ÷ thickness"], answer: 0, why: "Generic failure frequency × management systems factor × damage factor." },
      { q: "With pscore = 50%, the management systems factor is…", options: ["0.1", "0.5", "1.0", "10"], answer: 2, why: "FMS = 10^(−0.02·50 + 1) = 10^0 = 1.0." },
      { q: "Probability category 3 corresponds to a total damage factor of…", options: ["≤ 1", "1–10", "10–100", "> 1,000"], answer: 2, why: "Categories follow decades of the damage factor: 1 (≤1), 2 (1–10), 3 (10–100), 4 (100–1,000), 5 (>1,000)." },
      { q: "Which equipment uses Weibull curves for probability?", options: ["Vessels", "Piping", "Pressure-relief devices and exchanger bundles", "Storage tank shells"], answer: 2, why: "PRDs and heat-exchanger tube bundles use two-parameter Weibull models." },
      { q: "Local thinning and local external damage on the same component are combined by…", options: ["Adding them", "Taking the larger", "Multiplying them", "Ignoring external damage"], answer: 1, why: "If both are local they are unlikely to coincide, so the larger governs; if either is general they are added." },
      { q: "Among several SCC damage factors, the governing value is…", options: ["The sum", "The largest", "The average", "The smallest"], answer: 1, why: "The largest SCC damage factor governs, then it is added to the other categories." },
      { q: "Inspection effectiveness ‘A’ means…", options: ["Ineffective", "Fairly effective", "Highly effective", "No inspection"], answer: 2, why: "A = highly effective, E = ineffective or none." },
      { q: "The inspection due date in a risk-based plan is…", options: ["Always 5 years", "When projected risk reaches the risk target", "When the damage factor is 1", "Set by the vendor"], answer: 1, why: "Risk grows with the damage factor over time; the plan date is when it would reach the target." },
    ],
  },

  "api-510-pressure-vessel-inspection": {
    visuals: { "corrosion-rate": "corrosion-timeline" },
    deep: {
      "internal-interval": [["Reading the 4-year rule", "If remaining life is under 4 years, the interval may equal the full remaining life but not more than 2 years. The idea: with little life left, inspect at least before it runs out, but not so often that it becomes impractical."], ["When on-stream replaces internal", "All conditions must hold together: low general corrosion rate, long remaining life, no cracking mechanisms, no unbonded liners, below creep, and enough service history. If one fails, the internal inspection stays."]],
      mawp: [["Why ‘twice’ the corrosion", "Using t_actual − 2 × CR × interval builds in margin: the vessel must still meet its rating at the next inspection even if the rate is somewhat higher than estimated."]],
      "corroded-areas": [["Averaging in practice", "Take the thinnest reading, centre the averaging length on it, average along the most critical plane (longitudinal for circumferential stress), and compare the average with t_required. Pits are handled separately."]],
    },
    add: [{ after: "types", ch: { id: "cui-vessels", ref: "§5.5.6", title: "Corrosion under insulation on vessels", tags: ["cui", "methods"],
      summary: "CUI is one of the commonest causes of vessel leaks. API 510 asks the plan to look for it where the temperature and insulation condition make it credible.",
      points: ["Susceptible: insulated carbon and low-alloy steel operating in, or cycling through, the wet temperature range; austenitic stainless is at risk of external chloride SCC.", "Look first at damaged jacketing, penetrations (nozzles, ladders, platforms), insulation support rings, low points and vessel skirts.", "Screening methods (pulsed eddy current, profile RT, infrared to find wet insulation) followed by insulation removal and UT where indications are found.", "Repair the insulation and coating after inspection — a hole left in the jacketing creates the next CUI site."], tool: ["CUI explained", "/learn/damage-mechanisms/corrosion-under-insulation-cui"] } }],
    mcq: [
      { q: "Remaining life is 14 years. With no RBI, the maximum internal inspection interval is…", options: ["14 years", "10 years", "7 years", "5 years"], answer: 2, why: "Lesser of half the remaining life (7) and 10 years." },
      { q: "Remaining life is 3 years. The interval may be…", options: ["1.5 years only", "Up to 2 years", "3 years", "5 years"], answer: 1, why: "With remaining life under 4 years, the interval may be the full remaining life up to 2 years." },
      { q: "Readings: 12.0 mm (2014), 10.6 mm (2022), 10.0 mm (2024). The short-term rate is…", options: ["0.20 mm/y", "0.30 mm/y", "0.60 mm/y", "0.175 mm/y"], answer: 1, why: "(10.6 − 10.0) ÷ 2 years = 0.30 mm/y." },
      { q: "Default maximum interval for a visual external inspection is…", options: ["2 years", "5 years (or the internal interval if shorter)", "10 years", "15 years"], answer: 1, why: "At least every five years or at the internal/on-stream interval, whichever is less." },
      { q: "Thickness used to calculate MAWP for continued service is…", options: ["Today's thickness", "Nominal thickness", "Today's thickness minus twice the corrosion expected before the next inspection", "t_required"], answer: 2, why: "API 510 §7.3 uses t_actual − 2 × (corrosion over the interval)." },
      { q: "Typical maximum test interval for relief valves in clean, non-corrosive service is…", options: ["2 years", "5 years", "10 years", "15 years"], answer: 2, why: "5 years in typical process service and 10 years in clean, non-fouling service, unless justified otherwise." },
      { q: "Who authorizes repairs under API 510?", options: ["Any welder", "The authorized pressure vessel inspector", "The operator", "The NDE examiner"], answer: 1, why: "Repairs are authorized by the inspector (with engineer involvement for alterations) and done by a qualified repair organization." },
      { q: "For a vessel with ID 1,200 mm, the averaging length for corroded areas is the lesser of…", options: ["D/3 or 1,000 mm", "D/2 or 500 mm", "D or 1,500 mm", "100 mm"], answer: 1, why: "Up to 1,500 mm ID: half the diameter or 500 mm, whichever is less (here 500 mm)." },
    ],
  },

  "api-570-piping-inspection": {
    visuals: { "special-locations": "piping-circuit", intervals: "corrosion-timeline" },
    deep: {
      classes: [["Choosing the class", "Ask: if this line leaked, would it cause an immediate emergency (Class 1), a serious but manageable incident (Class 2), or a minor one (Class 3)? Document the choice per circuit; RBI can replace classes."]],
      "cui-extent": [["Using the percentages", "The percentages apply to suspect areas found by external visual inspection — damaged insulation and the susceptible temperature range — not to the whole line. If CUI is found, widen the inspection."]],
    },
    mcq: [
      { q: "Maximum thickness-measurement interval for Class 2 piping (no RBI)?", options: ["3 years", "5 years", "10 years", "15 years"], answer: 2, why: "Class 2: 10 years, limited to half the remaining life." },
      { q: "Default thickness interval for injection points?", options: ["1 year", "3 years", "5 years", "10 years"], answer: 1, why: "Injection points are inspected every 3 years unless RBI sets otherwise." },
      { q: "The soil-to-air interface zone runs roughly…", options: ["1 m below to 1 m above grade", "300 mm below to 150 mm above grade", "Only at grade", "150 mm below to 300 mm above"], answer: 1, why: "About 12 in. (300 mm) below to 6 in. (150 mm) above the soil." },
      { q: "Class 1 CUI follow-up covers about what share of areas with damaged insulation?", options: ["10%", "25%", "50%", "75%"], answer: 3, why: "Class 1: about 75% of damaged-insulation areas and 50% of suspect areas in the susceptible temperature range." },
      { q: "Without cathodic protection, buried piping in soil of 5,000 Ω·cm is inspected every…", options: ["3 years", "5 years", "10 years", "15 years"], answer: 2, why: "2,000–10,000 Ω·cm: 10 years; below 2,000: 5 years; above 10,000: 15 years." },
      { q: "Light hydrocarbons that flash on release (e.g. C3/C4) are normally…", options: ["Class 1", "Class 2", "Class 3", "Class 4"], answer: 0, why: "Services that can cause an immediate emergency on release, such as flashing light hydrocarbons, are Class 1." },
      { q: "Where should CMLs be placed on an elbow in erosive service?", options: ["Inner radius only", "Outer radius (extrados)", "Only on the straight pipe", "Anywhere"], answer: 1, why: "Erosion concentrates on the outer radius where the flow impinges." },
      { q: "Retirement thickness for straight pipe is…", options: ["Pressure design thickness only", "The larger of pressure design and structural minimum thickness", "Nominal minus 12.5%", "Always 3 mm"], answer: 1, why: "Pipe must carry both pressure and mechanical loads; the larger governs." },
    ],
  },

  "api-574-piping-inspection-practices": {
    visuals: { plans: "piping-circuit" },
    deep: { procedures: [["Making readings comparable", "Record the instrument, probe, couplant, temperature and exact CML location. A different probe or a surface coating can shift a reading by tenths of a millimetre — enough to invent or hide a corrosion rate."]] },
    mcq: [
      { q: "Why record the thickness method at each CML?", options: ["For billing", "So later readings are comparable and rates are not distorted", "It is not needed", "To choose the paint colour"], answer: 1, why: "Method changes cause apparent thinning or growth that is not real." },
      { q: "Hammer testing for thickness is considered…", options: ["The preferred method", "Largely outdated for thickness; still useful for bolt/support tightness", "Required by API 570", "More accurate than UT"], answer: 1, why: "API 574 treats hammer testing as outdated for wall thickness." },
      { q: "Retirement thickness for valves and flanged fittings uses a factor of…", options: ["1.0", "1.25", "1.5", "2.0"], answer: 2, why: "t = 1.5 × P·D/(2·S·E), reflecting extra stresses in valve bodies and flanged fittings." },
      { q: "Which joint type is especially sensitive to vibration fatigue?", options: ["Butt-welded", "Socket-welded and threaded small-bore", "Flanged large-bore", "Seamless pipe"], answer: 1, why: "Small-bore socket-welded and threaded connections concentrate stress and often fail by vibration fatigue." },
      { q: "Best thickness method for an NPS 1 drain with suspected pitting?", options: ["Hammer test", "Profile radiography", "Single spot UT", "Visual only"], answer: 1, why: "Profile RT images the wall of small-bore piping including local pits." },
      { q: "Where does a mix point need attention?", options: ["Only for paint", "Thermal fatigue and corrosion where streams of different temperature/composition meet", "Nowhere special", "Only during commissioning"], answer: 1, why: "Mix points concentrate thermal cycling and corrosive mixing." },
    ],
  },

  "api-579-fitness-for-service": {
    visuals: { procedure: "ffs-part-map", "local-metal-loss": "lta-rsf" },
    deep: {
      "general-metal-loss": [["Point readings or profiles?", "Calculate the coefficient of variation (standard deviation ÷ mean) of the point readings. Up to 10% the average is meaningful; above it the thinning is too uneven, so measure critical thickness profiles across the thinnest area instead."]],
      "local-metal-loss": [["What λ means", "λ compares the length of the thin area with the shell's natural bending length √(D·t). Short areas (small λ) are supported by the thick metal around them; long areas behave like uniform thinning."]],
      cracks: [["Reading the FAD", "The vertical axis (Kr) is the fracture risk, the horizontal axis (Lr) the plastic-collapse risk. A point inside the curve is acceptable; the distance to the curve shows the margin. Crack growth moves the point outward over time — that gives remaining life."]],
    },
    mcq: [
      { q: "Usual allowable remaining strength factor RSFa?", options: ["0.75", "0.80", "0.90", "1.00"], answer: 2, why: "RSFa = 0.90 is the normal value." },
      { q: "RSF = 0.81, MAWP = 20 bar. MAWPr = ?", options: ["16.2 bar", "18 bar", "20 bar", "22 bar"], answer: 1, why: "20 × 0.81 ÷ 0.90 = 18 bar." },
      { q: "Which Part assesses a local thin area?", options: ["Part 4", "Part 5", "Part 6", "Part 9"], answer: 1, why: "Part 5 covers local metal loss (LTAs, grooves, gouges)." },
      { q: "Crack-like flaws are assessed with…", options: ["Pit charts", "The failure assessment diagram (Part 9)", "Simple averaging", "Hardness only"], answer: 1, why: "Part 9 uses the FAD combining fracture and plastic collapse." },
      { q: "When should you NOT average point thickness readings in Part 4?", options: ["When COV > 10%", "When COV < 10%", "Never average", "Only for spheres"], answer: 0, why: "High scatter means a simple average is unrepresentative — use critical thickness profiles." },
      { q: "Rt for t_mm = 7 mm, FCA = 1 mm, t_c = 10 mm?", options: ["0.50", "0.60", "0.70", "0.80"], answer: 1, why: "(7 − 1) ÷ 10 = 0.60." },
      { q: "Step 1 of every FFS assessment is…", options: ["Calculate RSF", "Identify the flaw type and damage mechanism", "Repair the flaw", "Hydrotest"], answer: 1, why: "Flaw and damage-mechanism identification comes first; the rest depends on it." },
      { q: "Part 11 places fire-exposed equipment into…", options: ["Risk categories", "Heat-exposure zones", "Piping classes", "Inspection grades A–E"], answer: 1, why: "Heat-exposure zones based on site evidence decide the depth of assessment." },
    ],
  },

  "asme-section-ii-materials": {
    visuals: { anatomy: "spec-anatomy", "general-requirements": "parent-specs", "heat-treatment": "heat-treatment", "part-d": "allowable-stress" },
    deep: {
      "mechanical-tests": [["Plate-as-rolled vs heat", "For plate, ‘plate-as-rolled’ means one rolled plate from one slab or ingot; the tension test frequency counts these, not heats. A 20-plate order from one heat can mean 20 tension tests."], ["Specimen orientation", "Transverse specimens (across the rolling direction) usually give lower toughness than longitudinal ones. Check which orientation the spec and the design code require."]],
      certification: [["How to review an MTR in five minutes", "1) Spec, grade, class and year-date match the PO. 2) Heat number matches the marking on the item. 3) Chemistry within the table, including product analysis if ordered. 4) Every mandatory test and every ordered supplementary result is reported with its acceptance. 5) Heat treatment, hydro/NDE and special markings (LTV, NH, NDE) are stated."]],
    },
    add: [{ after: "product-tests", ch: { id: "impact-mdmt", ref: "SA-20 §12 + Section VIII UG-84/UCS-66", title: "Impact testing and the design MDMT", tags: ["material-tests", "materials"],
      summary: "Material specs say how to impact-test; the construction code decides whether impact tests are needed and at what temperature. QAPs fail when the two are not connected.",
      points: ["The design code (e.g. Section VIII-1 UCS-66) uses the material's toughness curve, thickness and MDMT to decide if impact testing is required, with reductions for low stress (coincident ratio) and PWHT.", "If required, the PO must name the test temperature (at or below MDMT) and the energy or lateral-expansion criteria from the code (UG-84).", "For plate, order SA-20 S5 with the temperature; the plate is marked LTV.", "For pipe, forgings, fittings and castings use the low-temperature specs (SA-333, SA-350, SA-420, SA-352) — check their standard test temperature against MDMT.", "Weld metal and HAZ need impact tests in the welding procedure qualification too — not just the base metal."] } },
    { after: "certification", ch: { id: "pmi-traceability", ref: "Product analysis + API 578", title: "Heat analysis, product analysis and PMI", tags: ["material-tests", "qap"],
      summary: "Three different checks answer three different questions: what the melt was, what this piece is, and whether the right alloy reached the right place.",
      points: ["Heat (ladle) analysis — taken from the melt by the steelmaker; always on the MTR.", "Product (check) analysis — taken from the finished product; optional unless ordered (often a supplementary requirement); has its own tolerance over the heat limits.", "PMI (positive material identification) — a quick check at receipt or after fabrication, by XRF or OES, to catch mix-ups. Not an ASME II requirement; set by owner standards (e.g. API 578).", "Traceability: heat number transfer before cutting plate or pipe, recorded on cutting plans and the material register."] } }],
    mcq: [
      { q: "Where are SA-516's tension-test frequency rules?", options: ["SA-516 only", "SA-20", "SA-370", "Section VIII"], answer: 1, why: "SA-516 refers to its general-requirements spec SA-20, which sets one test per plate-as-rolled." },
      { q: "Supplementary requirement S5 (Charpy) applies…", options: ["Always", "Only when named in the purchase order", "Only for plates over 50 mm", "Only to stainless"], answer: 1, why: "Supplementary requirements apply only when specified by the purchaser." },
      { q: "Pipe marked ‘NH’ means…", options: ["Normalized and hardened", "Not hydrostatically tested", "Nickel-hardened", "Non-heat-treated"], answer: 1, why: "NH = not hydro-tested (and no NDE in its place); the certificate must state it." },
      { q: "Room-temperature allowable stress for 485 MPa tensile / 260 MPa yield is about…", options: ["173 MPa", "139 MPa", "162 MPa", "121 MPa"], answer: 1, why: "Lower of 485/3.5 = 138.6 and ⅔ × 260 = 173 → about 138–139 MPa." },
      { q: "Which parent spec covers flanges and forged fittings like SA-105?", options: ["SA-20", "SA-961", "SA-530", "SA-703"], answer: 1, why: "SA-961 is the general-requirements spec for flanges, forged fittings and valves." },
      { q: "Austenitic stainless plate SA-240 is normally supplied…", options: ["As-rolled", "Normalized", "Solution annealed", "Quenched and tempered"], answer: 2, why: "Austenitic and duplex grades are solution annealed (SA-480 heat-treatment rules)." },
      { q: "E7018-1 H4R — what does H4 mean?", options: ["4 mm diameter", "Diffusible hydrogen ≤ 4 mL/100 g", "4 passes maximum", "Heat-treatment class 4"], answer: 1, why: "H4 is the optional diffusible-hydrogen designator." },
      { q: "SA-105 heat treatment is mandatory for…", options: ["All flanges", "Flanges above Class 300 (and some other components)", "Only flanges below NPS 2", "Never"], answer: 1, why: "Heat treatment is required for flanges above Class 300, special-design flanges and certain larger components; otherwise optional." },
    ],
  },

  "asme-section-v-nde": {
    visuals: { choose: "nde-selector", rt: "rt-geometry", "ut-welds": "ut-skip", pt: "pt-timeline", mt: "mt-directions" },
    deep: {
      rt: [["IQI selection and placement — step by step", "1) Choose the IQI material from the same or a lower-absorbing alloy group (SE-1025 hole type, SE-747 wire type); for dissimilar weld metal base it on the weld metal. 2) Pick the IQI designation and essential hole or wire for the material thickness plus allowed reinforcement. 3) Place it on the source side, next to or on the weld; film-side placement only when source side is inaccessible, with an ‘F’ marker. 4) Add more IQIs when density varies beyond the allowed range. 5) On a separate block, keep it as close as possible and no closer to the film than the part."], ["Location markers", "Markers show where each film sits on the weld. Source-side markers are needed for flat plates, longitudinal seams and some curved cases; double-wall techniques need at least one marker per radiograph. If markers cannot be placed as required, attach a dimensioned marker map."]],
      "ut-welds": [["Building a DAC — step by step", "1) Use the same couplant, wedge and instrument settings as for the examination; block and part within 14 °C. 2) Peak the side-drilled hole that gives the highest response and set it to 80% of full screen height. 3) Mark the peaks of the other holes at increasing depth without changing gain; join them — that is the DAC. 4) No point may fall below 20% of full screen height; if it would, use a split DAC. 5) Record the gain as the reference level and add the scanning gain on top."]],
    },
    mcq: [
      { q: "Which document sets RT acceptance criteria for a Section VIII-1 weld?", options: ["Section V Article 2", "Section VIII-1 (e.g. UW-51)", "SNT-TC-1A", "ASTM E94"], answer: 1, why: "Section V gives the method; the referencing code gives acceptance." },
      { q: "Minimum density in the area of interest for single-film X-ray?", options: ["1.3", "1.8", "2.0", "4.0"], answer: 1, why: "1.8 for X-ray single-film viewing (2.0 for gamma)." },
      { q: "Ug for F = 3 mm, D = 600 mm, d = 25 mm?", options: ["0.125 mm", "0.25 mm", "0.5 mm", "1.0 mm"], answer: 0, why: "Ug = F·d/D = 3 × 25 ÷ 600 = 0.125 mm." },
      { q: "Standard PT temperature range without qualification?", options: ["0–60 °C", "5–52 °C", "10–40 °C", "−10–80 °C"], answer: 1, why: "5–52 °C; outside it qualify with a comparator block." },
      { q: "When is PT interpretation done?", options: ["Immediately after developer", "10–60 min after the developer dries", "After 24 h", "Any time"], answer: 1, why: "Final interpretation between 10 and 60 minutes after the developer is dry." },
      { q: "Minimum lifting power of a DC or permanent-magnet yoke?", options: ["4.5 kg", "10 kg", "18 kg", "23 kg"], answer: 2, why: "18 kg (40 lb) at the maximum pole spacing; AC yokes need 4.5 kg (10 lb)." },
      { q: "Why examine MT in two directions?", options: ["To save time", "Cracks parallel to the field give weak or no indications", "Code says so for fun", "To demagnetize"], answer: 1, why: "Indications form when the crack cuts across the field." },
      { q: "On a DAC, the first reference point is typically set to…", options: ["20% FSH", "50% FSH", "80% FSH", "100% FSH"], answer: 2, why: "The highest-responding reflector is set to 80% of full screen height; no DAC point may fall below 20%." },
      { q: "Half-skip for a 60° probe on 20 mm plate?", options: ["11.5 mm", "20 mm", "34.6 mm", "69.3 mm"], answer: 2, why: "T·tanθ = 20 × tan 60° ≈ 34.6 mm." },
      { q: "Minimum white light for direct visual examination (Art 9)?", options: ["100 lx", "500 lx", "1,000 lx", "2,000 lx"], answer: 2, why: "100 fc (1,000 lx) at the examination surface." },
    ],
  },
};

/** Apply extras to a module's chapter list. */
export function withExtras(slug: string, chapters: Chapter[]): Chapter[] {
  const e = EXTRAS[slug]; if (!e) return chapters;
  const out: Chapter[] = [];
  for (const ch of chapters) {
    out.push({ ...ch, visual: ch.visual ?? e.visuals?.[ch.id], deep: [...(ch.deep || []), ...(e.deep?.[ch.id] || [])] });
    for (const a of e.add || []) if (a.after === ch.id) out.push({ ...a.ch, visual: a.ch.visual ?? e.visuals?.[a.ch.id], deep: [...(a.ch.deep || []), ...(e.deep?.[a.ch.id] || [])] });
  }
  return out;
}
