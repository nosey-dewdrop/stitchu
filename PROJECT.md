# Stitchu

Sewing pattern app. Upload a photo of any garment (or design one) and get a custom sewing pattern fitted to your body, plus fabric recommendations, notions (zipper, interfacing, thread), and a step-by-step sewing guide. A pocket sewing teacher.

Formerly named Pattew. Renamed to Stitchu on 2026-07-02.
2026-07-10: platform decision — Stitchu moves to the WEB (see Web Rework below). The printed-PDF workflow lives on desktop/printer, not on a phone. iOS code stays in the repo as reference; the web app is the product.
2026-07-10 (later, Damla): Stitchu is ALL THREE platforms — web + iOS + Android. One C++ engine core feeds every platform: WASM for web, native static lib for iOS, NDK for Android. Ship order: web first (fastest to revenue, everything decided), then iOS reskin on the C++ core (Phase W5), then Android (Phase W6). Landing says "iOS app · Android coming soon".

## Status
Current phase: LIVE product, customer-ready era (web v43)
Last session: 2026-07-15 (overnight loop, ~51 commits, all pushed + deployed v43). THREE fronts. ENGINE: 6 real fit bugs fixed (halter center-back kink, set-in sleeve too narrow for the biceps, fuller-bust/short-back sleeve rejection → armscye deepened to the arm, sleeve underarm self-intersection on wide-shallow caps, impossible-body → clean proportion gate, empire seam dragged below the waist). COMPLETE FULL-BUST ADJUSTMENT: optional 8th upperBust measurement — back+armhole fit the ribcage AND front gets extra width+length+a bigger bust dart (105→182mm on a full cup); an adversarial pattern-maker audit caught my first version was back-only and I completed the front; byte-identical when omitted; ctest 11/11, golden clean, fba_check. HONEST accuracy benchmark (measures DRAWN geometry, not trued scalars — an audit caught it reading x−x and I rewrote it): seams 0.00mm max 0.000023mm independent, cap ease 3.9-4.1%, waist median 9.3mm, proportional integrity vs a real scaled block. New tools: vocab-sweep.cpp (37,800 DECOUPLED body×vocab drafts — catches bugs the balanced 70,200 matrix + 3-golden miss), fit_proof, accuracy-benchmark, fba_check. API: POST /api/draft runs the WASM engine server-side (zero LLM cost), security-hardened; /api/waitlist; api.html. LANDING now SELLS + fully TURKISH (TR/EN toggle). CUSTOMER EYE (Damla's final compass — 4-persona jury): fixed 6/7 breaks — Turkish end-to-end (landing+guide+print cover+tool), the full-bust adjustment, plus-size fit-proof card, tap-to-learn glossary, body diagram per measurement, named multi-body profiles for sellers, demo-first flow. VISION prompt couture-hardened — NEEDS WRANGLER REDEPLOY; corpus 778 photos; Track B plan written. Reports: 2026-07-15-stitchu-gece-doncusu.md, -accuracy-benchmark.md, -vision-training-plan.md. OPEN: wrangler redeploy, physical sew test, key rotation, real API playground/pricing, thousands-photo vision training. Steps toward the AccuMark-quality/triple-audience vision below (grade correctly on every body).
Earlier session: 2026-07-13 (full day + night, Fable) — the vocabulary + proof marathon. Track A 1-4 SHIPPED LIVE end-to-end (tiered ruffle with exponential fabric math, sweetheart via eye-picked candidate curves, keyhole as stitch-line + facing with honest skip, halter via frame-shift over the same skeleton with bias binding + cramped-back-falls-to-dart rule). Full ship-check as PM+customer: print packer CLIPPED >950mm pieces (fixed; strips now chalk notes), blocked-draft copy, worker hardening; new web-fuzz tool (19,555 drafts / 0 failures). Track B v0 MEASURED: zero-shot CLIP 44% / SigLIP 65% = dead end; Opus teacher 86% vs eye labels → v1 = distill into browser ONNX student; corpus pipeline + 70 licensed images in vision/. Live E2E proof: quinceañera photo → production → sweetheart+tiered+keyhole all correct. NIGHT: Damla decided seam allowance gets DRAWN — double line shipped (outer cut / inner sew, fold-aware offset with envelope guarantee); precision-report.js (tailor's micrometer) found and ZEROED two real gaps: shoulder pair 8-10mm, empire side seam ~2mm; golden re-pinned into repo (engine/golden-reference.csv). Matrix now 70,200 ALL PASS, ctest 8/8. Content: linkedin.md 21 essay drafts, devlog.md 40 reels units (series A-J). League analysis done: missing signals = fit proof (Damla sews), usage curve (blitz), working API (next).
Earlier session: 2026-07-12 — strategy pivot talk (deep CS + engine-as-moat: the same C++ engine sells twice, as a motorlu site AND later an API). Build-in-public started: devlog-tr.md (Turkish narrative for reels/vlogs). ENGINE DECISION logged (not yet coded): default shaping goes dart -> princess seam, skirt -> gore panels, dart demoted to an advanced option; reason = princess seam is how a real person sews (no dart apex to fight). Real surgery on the 2805-draft engine + full matrix re-run still to do. Landing COUTURE redesign in heavy iteration (mocks/landing-couture.html): full-background vişne poplin gingham (pötikare, small checks), Didot headline, centered white copy explaining what/how/engine + "api: coming soon", Damla's own red buttons (tomato/heart/flower/round, backgrounds removed into mocks/assets/buttons/) sewn at the 4 screen edges. NOT approved yet. Also added .gitattributes so GitHub shows the repo as JS/C++ (web app + engine), not HTML/Swift.
Earlier session: 2026-07-10 — THE BIG DAY: web rework decided AND shipped live in one day. Theme locked (flat/Helvetica/teal + anti-generic bans + no human figures), C++ engine ported (2805 drafts pass, 0.0001mm golden diff vs Swift), WASM built, real landing + create + closet + privacy + EN/TR live on GitHub Pages, Worker deployed with vision key (photo->pattern VERIFIED live), shared stitch wall live, packed A4 print pipeline, iOS design approved (7 screens). Damla's validation idea: sew MINIATURE garments first (scaled-down patterns = cheap fabric test before full muslins) — added to roadmap 24.
Previous session: 2026-07-07 — block validation (the launch blocker): built PatternValidator (geometric invariants) + engine-check harness (2805 drafts, EU 34-52 + tall/petite/pear/apple/edge bodies, all garment/neckline/sleeve/skirt combos, ALL PASS), fixed 8 real engine bugs it caught (side seam balance, bust ease loss, waist suppression, sleeve cap convergence, half-circle doubling, dress waist mismatch, missing CB seam for dress zipper, v-neck fold-back), wired runtime validation so a broken pattern can never reach the PDF.

### What works today
- Onboarding: 7 measurements with body silhouette highlights, validation, back navigation
- Create → photo path: pick photo → Claude analysis (if API key set) or manual pick → user confirms → A-line/straight skirt drafted from real measurements (FreeSewing-verified formula philosophy: measurement + % ease)
- Pattern result: piece previews with darts/grainline, fabric meters estimate, step-by-step sewing guide (invisible zipper order from verified source), true-scale tiled A4 PDF with 3 cm calibration square
- Closet: saved patterns, delete, reopen
- Profile: edit measurements, Anthropic API key stored in Keychain only

### Honest gaps (v0)
- Trousers not drafted (needs 2 measurements we don't collect: crotch depth + cross seam); sleeves not drafted (no verified formulas) — v1 dress/top are sleeveless with bound armholes
- Bodice uses documented assumptions (underbust = bust - 7cm, standard shoulder slope); guide tells users to sew a muslin first; geometric block validation done (engine-check harness) — a physical sew test against a commercial pattern is still a good idea before launch
- Modular designer + describe paths are placeholder cards
- Crepe missing from fabric knowledge (no authoritative source reachable)
- No onboarding sign-in (local only), no paywall yet
- Doodle assets are v1 (drawn by Claude); Damla may add 2 butterflies for personalization

## Brand
Web rework direction (Damla, 2026-07-10, reference: terminal-teal screenshot): flat and plain.
- Palette: white and black dominant, teal accent (~#3EB8AF, matched from reference; final hex locked with Damla in W2). Other colors allowed as free accents.
- Font: Helvetica
- Style: flat, simple, no decoration; sharp corners (0-3px radius house rule)
- BUT dynamic, and unmistakably about stitching: interactive stitch moments — e.g. the user drags to sew a running stitch (landing hero, loading states, section dividers as seam lines, dashed stitch motifs). Flat visual language, alive in motion.
- ANTI-GENERIC bans (Damla, hard rules): no single colored word inside black text; no bold weights / loud saturated tones; no pill badges, no gradient hero, no emoji bullets, no element with a single colored edge (left-accent-border cards etc. — a border is either full or not there), none of the usual AI-site tells. Layout uses space WELL: not cramped, not airy-everywhere — deliberate density, generous only where it earns it.
- NO human figure drawings anywhere (Damla, 2026-07-10, after 3 rejected croquis attempts) — measurement visuals use sewing objects instead (measuring tape with a stitch marker)
- Old iOS brand (baby blue + Quicksand + doodles, 101-asset checklist) retired with the iOS app

## Product
- 3 creation paths: photo upload → AI analysis → pattern (free), Stardoll-style modular designer (free), describe → AI visual → pattern (premium)
- Pattern output: numbered pieces, A4 PDF with calibration square, fabric estimate + meters, step-by-step sewing guide (interfacing, sewing order, stitch types, notions like zippers)
- Fabric intelligence: suggests suitable fabrics, warns when a fabric won't work for the design (e.g. viscose on a structured bodice)
- 4 rooms, no tab bar: Inspire / Create / Closet / Community — pills to switch
- Onboarding: sign up (Apple/Google/Email) + body measurements, 10 slides, one measurement per screen with body silhouette highlight
- Revenue: freemium + subscription ($5-10/mo) — premium unlocks describe-path, visual guide diagrams, unlimited patterns
- Pattern engine: parametric drafting compiled from Muller & Sohn + Winifred Aldrich + FreeSewing.org formulas
- Tech: SwiftUI + SwiftData, Claude API (photo analysis + guide), Gemini/DALL-E (visual generation), SVG + PDFKit, StoreKit 2

## Web Rework (decided 2026-07-10)
Goal: make Stitchu genuinely usable. Web-first because the output is a print-at-home PDF (desktop/printer context), App Store review friction disappears, and patterns become shareable URLs.

Architecture: pattern engine in C++ compiled to WebAssembly (Emscripten), running client-side in the browser — zero server cost per draft, measurements/photos never need to leave the device for drafting. Pattern rendering in SVG. Vision analysis keeps the existing Cloudflare Worker (server-side Claude key, app-token auth). C++ chosen over Rust deliberately: synergy with Damla's CS201 coursework.

### North Star (the purpose, so we never lose it)
Stitchu exists so a person who sews can photograph a garment, get a pattern drafted to HER OWN measurements, print it (or project it) at true scale, and sew a garment that actually fits. Every item below serves that sentence; anything that doesn't is a cut candidate. "Done" for the whole rework = a real garment, sewn from a Stitchu web pattern, fits its owner.

### Phase W0: ground work
- [x] repo layout: engine/ (C++), web/ (site), backend/ (existing Worker); iOS app stays in App/ as reference
- [x] toolchain on Damla's machine: CMake + Emscripten SDK (Claude writes the setup script, Damla runs it in her terminal)
- [x] extract the Swift engine's formulas/constants into a reference sheet (ease tables, dart rules, documented assumptions) so the port is spec-driven, not line-by-line translation

### Phase W1: C++ engine port (the backbone)
Definition of done: the same 2805-draft matrix that passes in Swift passes in C++, then a draft runs in a browser.
- [x] 1. geometry core: Point/Path/Bezier, seam-length measurement, offsets, intersection checks — unit tests first, these primitives carry everything
- [x] 2. measurement model + size matrix loader (EU 34-52, tall/petite/pear/apple/edge bodies)
- [x] 3. skirt blocks: A-line, straight, gathered, half-circle (darts, waistband)
- [x] 4. bodice block (assumptions carried over and documented: underbust = bust - 7 cm, standard shoulder slope)
- [x] 5. dress (bodice + skirt join, CB invisible zipper) and top (cropped/hip/tunic hems)
- [x] 6. sleeve block (straight + balloon, iterative cap-to-armhole convergence)
- [x] 7. manipulation layer v1: necklines (crew/scoop/v/square/boat), skirt styles, sleeves
- [x] 8. PatternValidator port: all geometric invariants (side-seam balance, dart sums, armhole/cap ease, waist joins, self-intersection, print fit)
- [x] 9. engine-check harness port → full matrix green; keep Swift outputs as golden files and diff deterministic values against them
- [x] 10. Emscripten build: WASM + thin embind bindings, size budget under ~1 MB, smoke page proving a draft runs in the browser
Working style: engine code is Claude's; Damla reviews formulas as the sewing domain expert.

### Phase W2: web app (where "işe yaramaz" dies)
Design spec locked in Brand above (flat, Helvetica, white/black + teal, sharp corners, anti-generic bans, dynamic stitch identity). Damla approves every screen.
- [x] 11. design tokens + base layout: single CSS token file, same discipline as the YKS app
- [x] 12. landing: drag-to-sew hero + STITCH WALL — communal embroidery, per-visitor thread color, stitches persist for everyone (Worker + KV, just path coordinates), guestbook seam of short notes underneath; guardrails built in: length cap, per-IP rate limit, TR/EN profanity filter, anonymous (no accounts, no PII — KVKK-clean)
- [x] 13. onboarding: 7 measurements with silhouette highlights, validation, stored locally (IndexedDB) — no sign-up
- [x] 14. create flow: photo upload → Worker vision → user confirms analysis → WASM draft → result (manual-pick fallback stays for when the Worker is unreachable)
- [x] 15. pattern result: SVG pieces (darts, grainline, labels), fabric meters estimate, step-by-step sewing guide (ported content incl. verified invisible-zipper order), fabric suitability advice
- [x] 16. print pipeline: client-side tiled A4 PDF, 3 cm calibration square, page map showing taping order
- [x] 17. closet: saved patterns — reopen, delete, re-download (full CRUD, local)
- [ ] 18. stitch micro-interactions only where they earn their place: loading = a seam being sewn, section dividers = stitch lines; not on every surface
- [ ] 19. EN/TR, keyboard + screen-reader pass, empty states, error states (photo too dark, analysis failed, print quirks)
- [ ] 20. responsive: desktop-first (printing context) but fully usable on a phone

### Phase W3: money + launch (sellable, not just live)
- [ ] 21. free/premium line (proposal, Damla decides): free = full flow, 1 saved pattern, watermarked PDF; premium = unlimited, clean PDF, projector mode, fabric layout plan
- [ ] 22. merchant of record: compare Paddle vs Lemon Squeezy (fees, TR payout), pick, integrate checkout; premium token validated by the Worker (KV)
- [ ] 23. privacy policy + KVKK/GDPR consent (photo leaves the device only for vision; stitch wall anonymous) — ships with the upload flow, never after
- [ ] 24. THE REAL TEST: physical sew validation — Damla's plan: start with MINIATURE garments (print at reduced scale, sew doll-size versions — cheap fabric, fast, catches assembly errors early), then 2-3 full muslins (skirt, top, dress) against a commercial-pattern equivalent; the promise is fit and only fabric proves it; findings feed back into engine constants. NOTE for minis: a simple scale % on the print pipeline is enough for geometry, but seam allowance and zipper lengths do NOT scale linearly — print mini at 30-50% and treat it as an assembly test, not a fit test
- [ ] 25. Worker deploy (Damla: wrangler steps in backend/DEPLOY.md) + custom domain decision
- [x] hosting decision (2026-07-10): Cloudflare Pages — one provider with the Worker + KV, zero monthly cost, no Supabase/Vercel needed
- [ ] 26. full ship-check (Five Doors included) → blockers to zero → launch
- [ ] 27. launch loop: shareable pattern links if picked; Pinterest/IG content is Damla's side

### Phase W4: AI eval pipeline (Python, the learning project)
Format: Claude teaches and reviews, Damla writes the critical code.
- [ ] 28. label set: 30-50 garment photos with hand-labeled ground truth (garment type, neckline, sleeve, skirt style) — labels are Damla's, domain knowledge again
- [ ] 29. harness: Python batch runner → Worker → per-field accuracy report
- [ ] 30. regression mode: two prompts or two models in, score diff out — answers "opus → sonnet?" with numbers instead of vibes
- [ ] 31. act on it: pick the cheapest model that holds accuracy, update the Worker
- [ ] 32. copy the harness pattern to lingolingo (separate session)

### Phase W5: iOS on the shared core (after web launch)
- [x] DESIGN APPROVED (Damla, 2026-07-10): mocks/ios-app.html — 7 screens: welcome (sew-the-heart to start, no sign-up), measurements (draggable tape + haptic tick per cm), create (camera first, centered hand-pick chips), confirm analysis (tap row to fix, details feed fabric advice), pattern (swipeable pieces + reading legend, PDF via share sheet), closet (swipe-delete with undo), describe→design (PREMIUM: voice/text → AI sketch → confirm → pattern). iPhone-shell frames; app UI stays sharp-cornered.
- [ ] build the C++ engine as a native library for iOS (same code, no WASM); delete the Swift drafting code once parity is proven by the harness
- [ ] reskin the existing SwiftUI app to the approved design above
- [ ] port web-decided features (tape input, stitch micro-interactions in native gestures)
- [ ] StoreKit 2 paywall mapped to the same premium entitlements as the web (one premium, both platforms)
- [ ] App Store ship-check + submission

### Phase W6: Android (coming soon becomes real)
- [ ] C++ engine via NDK, Kotlin UI on the same design spec
- [ ] Play Billing mapped to the same entitlements
- [ ] Play Store ship-check + launch

### Feature candidates (Damla picks which make the cut)
- projector mode: full-screen true-scale pattern with calibration grid, projecting straight onto fabric (big sewing-community trend; kills A4 taping)
- A0/copyshop single-sheet PDF export
- fabric yardage + cutting layout plan ("1.8 m at 150 cm width, place pieces like this") — fabric DB already exists
- fit warnings from measurement profile ("this may run tight at the waist")
- shareable pattern links (free marketing loop; pairs with the watermark)

### What Damla learns from this project
1. Production C++ — real geometry code with a test suite; CS201 coursework becomes shipped product code.
2. WebAssembly — compiling native code for the browser, JS bindings, size/perf budgets; genuinely rare junior skill.
3. System boundaries (the CTO muscle) — one engine, multiple consumers (web UI, test harness, potentially iOS again); UI ↔ engine ↔ Worker each behind a clean contract.
4. AI engineering past the API call — eval sets, regression testing, model/cost decisions made with data (Python).
5. Serverless backend — Cloudflare Worker + KV: token auth, rate limiting, abuse guardrails, zero-cost scaling.
6. Selling from Turkey — merchant-of-record payments (Paddle/LS), paywall design, free-tier psychology.
7. Privacy as architecture — client-side drafting is simultaneously the KVKK answer and a marketing line.
8. Cross-language golden testing — the 2805-draft matrix as a spec that survives a full rewrite; how real teams migrate engines safely.
9. Interaction craft under constraint — flat but alive (drag-to-stitch, SVG/canvas) with zero generic tells.

## Roadmap
### Phase 1: Foundation
- [x] product plan + competitor research
- [x] interactive mock (mock.html)
- [x] asset checklist + drawing guide (101 assets)
- [x] rebrand: Stitchu, baby blue, Quicksand
- [x] Xcode project setup (xcodegen, Quicksand bundled, builds clean)
- [x] data models (BodyMeasurements, SavedPattern, PatternPiece)
- [x] onboarding flow (measurement input)
- [x] room navigation skeleton

### Phase 2: Pattern Engine
- [x] bodice block from measurements (Bella formulas; underbust/shoulder-slope assumptions documented, muslin warning in guide)
- [x] skirt block (A-line + straight, darts, waistband)
- [x] dress block (bodice + skirt, waist seam, CB invisible zipper)
- [x] top block (bodice extended to cropped/hip/tunic hem)
- [x] sleeve block (straight + balloon; cap fitted to drafted armhole length by iterative convergence; biceps assumption documented)
- [x] manipulation layer v1: necklines (crew/scoop/v/square/boat), skirt styles (A-line/straight/gathered/half-circle), sleeves — photo details now shape the pattern
- [x] validate blocks: geometric invariant suite (side seams, armhole/cap ease, dart sums, waist joins, self intersection, print fit) across EU 34-52 + edge bodies via engine-check harness; runtime safety net blocks invalid patterns before the PDF
- [x] manipulation layer v2 (2026-07-13): pleated skirt, tiered ruffle, sweetheart, keyhole, halter — each engine+test+render+UI+vision, matrix 70,200
- [x] seam allowance DRAWN (double line: outer cut / inner sew, fold-aware offset) + precision truing (shoulder pair + empire side seam → 0.00mm, tools/precision-report.js)
- [ ] wrap styles, collars, pockets, off-shoulder/cowl/peplum (specs drafted in engine/SPECS-next-vocabulary.md — REVIEW before building)
- [x] pattern rendering (SwiftUI Canvas)
- [x] PDF export with A4 splitting + calibration square

### Phase 3: Modular Designer
- [ ] body silhouette view from measurements
- [ ] component pickers (neckline, sleeve, bodice, skirt, waist)
- [ ] real-time silhouette preview
- [ ] designer selections → engine → pattern

### Phase 4: Photo Analysis
- [x] photo upload UI (PhotosPicker)
- [x] Claude API garment analysis (key in Keychain, user confirms result)
- [x] map analysis to engine components (skirt style + length)
- [x] pattern from photo end-to-end (skirts)

### Phase 5: Sewing Guide
- [x] step-by-step guide (skirt/dress/top, incl. verified invisible zipper order)
- [x] instruction UI (numbered steps)
- [x] fabric meter estimate (rough, refine later)
- [x] fabric suitability advice (5 fabrics from university extension sources; crepe pending a reachable source)

### Phase 6: Persistence & Polish
- [x] save/load patterns (SwiftData)
- [x] pattern history in Closet (+ delete)
- [x] PDF re-download from saved patterns

### Phase 7: Premium
- [ ] describe → AI visual path
- [ ] enhanced guide (diagrams)
- [ ] StoreKit 2 subscription + paywall

### Phase 8: Suggestion Engine & Blog
- [ ] fabric photo → "what can I make" suggestions
- [ ] trend feed in Inspire
- [ ] blog section

## Ideas
- Sewing school (people enroll, gamified lessons) — decide later whether in-app or separate app
- Community room: sharing, follows, favorites (Etsy/Instagram feel, no selling)
- GRADING (2026-07-15, aligns with the AccuMark vision): auto-generate every size from one block using industry grade rules — the next big engine lever for the seller/brand audience. The proportional-integrity benchmark + FBA are groundwork.
- Full-bust adjustment polish: the FBA now does front width+length+dart+back frame; a future pass could split the cup add differently for princess vs dart, and expose a cup-based estimate when the user only knows their cup letter.
- Real API playground on api.html (sandbox key + pricing) — persona jury's remaining seller ask; needs a payment decision.

## Bugs / Issues
- none known. 2026-07-15: 6 real fit bugs found and fixed (halter center-back kink, set-in sleeve too narrow for the biceps, fuller-bust/short-back sleeve rejection, sleeve underarm self-intersection on wide-shallow caps, impossible-body cryptic errors, empire seam below the waist) — all with tests + guards; the FBA's first version was back-only (audit-caught) and completed. Coverage: ctest 11/11, golden clean, vocab-sweep 37,800 decoupled 0 fail, web-fuzz 19,555 0 fail. (Earlier: 8 drafting bugs fixed 2026-07-07, see engine-check/.)
- DEPLOY gotcha (fixed): after a ?v bump, `git add web/` ALL files before subtree split — staging only touched files shipped stale HTML (v41 HTML with v43 JS = cache mismatch).

## Competitors
- StitchLift: thrift flips only, no pattern generation
- Sewist/Lekala: web only, no mobile
- Seamly2D: desktop, complex
- Clo3D: $50/mo professional tool
- Ribblr: crochet/knitting patterns marketplace, not generation

## Competitor deep-dive (2026-07-15, one-by-one with Damla's verdict)
VISION (Damla): stitchu must reach INDUSTRIAL grade (AccuMark-level), not "Etsy pattern maker".
One custom engine serving THREE customers at once — home sewists + Etsy sellers + brands.
That triple-audience-at-industrial-quality IS the moat (AccuMark only serves brands).

Engine capabilities this implies (target, not all built yet):
1. GRADING — from one block auto-generate every size (this = the "validate on every body" work).
2. MARKER MAKING — nest pieces on fabric width with minimal waste (fabric = money). NOT BUILT.
3. CUTTER OUTPUT — export ready for an automatic cutting machine. NOT BUILT.
Damla open to cutting scope where needed ("kesmemiz gereken varsa keselim").

1. **Gerber AccuMark** — VERDICT: this is the QUALITY BAR Damla wants to reach.
   - What: industry factory CAD (US, now Lectra). Not consumer.
   - How: a human pattern maker draws the block; AccuMark grades it to all sizes,
     nests markers with min fabric waste, sends to auto cutter. Does NOT draft for you.
   - Data: not a learned system — intelligence is (a) the maker's block, (b) decades-old
     industry GRADE RULES (how much bust/arm grows size-to-size).
   - Relevance: NOT a direct competitor (needs an expert; opposite user), but its grade
     rules are the KANUN for stitchu's "grow correctly on every body" goal — reference, not copy.

## CORE ARCHITECTURE INSIGHT (2026-07-15, Damla) — 3D-derived 2D
Damla's engineering thesis, and it is correct:
"patterns are 2D PREPARED FOR 3D" — a good pattern is the correct FLATTENING of a 3D body surface.
- Two different "3D", do NOT confuse:
  (a) 3D body SCAN from a photo → NOT needed (that's 3DLOOK/Zozo, a separate million-$ problem).
  (b) 3D-DERIVED 2D pattern → REQUIRED. Engine must think in 3D (body=volume, garment=surface
      wrapping it), then UNWRAP that surface to 2D paper with darts. Output is 2D but BORN of 3D.
- Why cheap Etsy patterns / flat-2D tools fail: they draft straight in 2D with a fixed formula
  ("bust/4 + x"), never modeling the body's 3D turns (bust apex, shoulder curve, waist-hip) —
  so they gape and pull. "The ones who don't do it" = the ones who SKIP the 3D step.
- CLO3D/Optitex DO the 3D→2D chain but drape a HUMAN-drawn pattern. Nobody builds one that
  auto-constructs 3D from MEASUREMENTS and unwraps couture-correct 2D, open to everyone.
- THE MOAT, one line: 3D-correct patterns, without an expert, for everyone
  ("düz insanların bile couture dikmesi"). Target quality = AccuMark. Audience = home + Etsy + brands.
- Correct pipeline (Damla's instinct): measurements → 3D body surface (from measurements, NOT photo)
  → drape garment on it → unwrap to 2D + darts → grade → cut-ready. Today's engine is flat-2D; this
  is the architecture it must move toward. DECISION PENDING: rebuild vs extend (decide after competitor tour).

## Competitor tour verdicts (cont.)
3. **Optitex** — VERDICT: not a rival, a COMPASS. Proof the 3D→2D chain works.
   - What: industrial CAD that adds 3D DRAPE + cloth-physics simulation.
   - How: human draws 2D pattern → Optitex sews+drapes it on a 3D avatar (fabric weight/stretch/
     drape via physics) → two-way: edit 2D→3D updates, spot a pull in 3D→fix 2D. This IS Damla's
     "2D prepared for 3D" loop, commercially solved.
   - Data: pattern geometry (human) + fabric-physics tables (gramaj/stretch/bending measured).
   - Gap vs stitchu: (1) human DRAFTS it, Optitex only drapes — Damla wants auto-from-measurements;
     (2) factory price + expert only — opposite of the three-audience vision.
   - Moat framing: Optitex locks 3D-correct drape behind expert+factory; stitchu = same 3D
     correctness but auto-built from measurements, open to everyone.
   - Damla note: 3D body SCAN (photo→body) = LATER phase, not scrapped, still on the roadmap.
