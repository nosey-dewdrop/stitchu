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

## DIRECTION INSIGHT (2026-07-15, Damla) — stitchu is an API, everything derives from it
Damla, after seeing AccuMark/Lectra/Optitex/CLO3D: "let's build stitchu as an API — all of these
feel like things that can DERIVE from that API." Correct, and it matches the earlier engine-as-moat call.
- Every competitor's core is the SAME thing: a geometry ENGINE (measurements/pattern → 3D-correct
  geometry: grade, drape, unwrap). Their UIs (CLO's designer canvas, AccuMark's factory flow) are
  just FACES on that engine. stitchu's value = the engine, not the UI. Engine = API.
- Why API-first fits the three-audience vision: home sewist wants a simple web form, Etsy seller
  wants a batch/multi-body panel, brand wants INTEGRATION. One API + three thin UIs, not three apps.
  Everything (photo→pattern, measure→block, grade, bag family, couture) = different CALLS to one engine.
- B2B door: a brand doesn't want "the stitchu app", it wants "an API that drafts patterns into our
  system". API = that door. App for home, API for brands, one core.
- MENTOR FRED (do not skip): API is an INTERFACE decision, not a QUALITY one. Building an API does
  NOT create the trust the engine currently lacks ("can't cut fabric on it"). ORDER MUST BE:
  (1) make the engine CORRECT (Aldrich+Armstrong + 3D→2D), THEN (2) package it as the API.
  Reverse = gymgyme's "grew it but it didn't work". Validate → package, never package → hope.
- Good news: the API core ALREADY EXISTS — POST /api/draft runs the WASM engine server-side today.
  Not from scratch; the skeleton is live. Work = validate engine, then turn that endpoint into a
  real product API (documented, versioned, open to all three audiences).

## WHY DIFFERENT BRANDS USE DIFFERENT CAD (2026-07-15) — the "mafya?" question
Not a cartel. Four real reasons — and each is also the incumbents' WEAKNESS = stitchu's opening.
1. They are NOT the same — different centers of gravity:
   - Gerber/Lectra (Zara): deep in GRADE + MARKER + CUT (factory throughput, min fabric waste).
   - CLO3D (Dior/couture): deep in real-time 3D DRAPE + visuals (aesthetics, fast iteration).
   - Browzwear/Optitex (Adidas): deep in TECHNICAL product + function + PLM INTEGRATION.
   Everyone buys the one that solves THEIR pain; nobody wants the others' strength.
2. Switching cost = the real "lock-in" (legal, not mafia): staff trained, thousands of patterns in
   that format, whole factory flow wired to it. Changing = redo everything, $M + downtime. Picked
   20yrs ago = still on it.
3. History/geography: Gerber US, Lectra FR (EU luxury), CLO Korea (Asia manufacturing boom).
4. Price/segment: same tech sliced to different pockets; Gerber won't sell to a home sewist,
   CLO won't sell to a factory line.
=> These 4 reasons are ALSO the weakness: locked-in, segment-siloed, expert-required, expensive/old
   (desktop, license). stitchu breaks all four: API-first (no lock-in, plugs into anything),
   ONE engine for three segments (home+Etsy+brand), AUTOMATIC (no expert), web/cheap.
   The market is 50yrs old, locked, siloed, undemocratized — the opening is exactly where Damla stands:
   same geometric correctness, but open, automatic, for everyone.

## AI-speeds-it-up note (2026-07-15, Damla) — half true, channel it right
Damla: "with AI, 20 years of work became 2 days." Partly true, partly a trap:
- TRUE: cloth sim needn't be written from scratch (NVIDIA Warp/PhysX/three.js cloth exist; AI makes
  INTEGRATION go from months to days; neural cloth sim now approximates physics fast).
- TRAP: "2 days" is hype. AI speeds up WIRING a known thing, not producing Dior-grade correctness in
  2 days. Demo ≠ product (gymgyme lesson). And physics/wrinkle sim does NOT fix the real problem —
  it only SHOWS drape, it does not make the PATTERN fit. Fastest cloth sim still can't save a pattern
  that doesn't sit right.
- CHANNEL IT: aim the AI speed at the GEOMETRIC UNWRAP engine (measure→3D surface→2D pattern),
  where ready mesh-flattening libs + AI genuinely accelerate, and the output IS the product (a
  pattern that fits). Wrinkle RENDER = last, optional showroom; maybe plug a cloth API someday.
  Order: fitting pattern FIRST, pretty render later.
- DECISION (rebuild-3D vs extend-2D vs physics) DEFERRED until competitor tour finishes.

## Competitor CLUSTER 1 CLOSED (2026-07-15, Damla's framing) — "the industry's Figma"
6. TUKAcad = cheap industrial CAD, no new lesson (just a half-attempt at democratizing pricey CAD).
Damla's verdict on the WHOLE cluster (Gerber, Lectra, Optitex, CLO3D, Browzwear, TUKAcad):
"these are CAD — the industry's FIGMA, not us." Correct framing:
- They are the PRO'S DRAWING BENCH: an expert opens them and DRAFTS by hand (like Figma = a designer
  tool). Not stitchu's product — stitchu's user is the person who does NOT want to learn "Figma".
- So they are NOT rivals — they are the QUALITY BAR the engine envies. stitchu doesn't compete with
  Figma; it produces Figma-grade OUTPUT without an expert.
- Lessons banked from this cluster: grade rules (AccuMark), 3D→2D drape works (Optitex/CLO), API/PLM
  integration is a real model (Browzwear), democratizing is unfinished (TUKAcad). All reference, not rival.
NEXT CLUSTER = the REAL rivals: consumer auto-drafters (Valentina/Seamly, Tailornova, Bootstrap,
Sewist, MyBodyModel) — tools that draft FOR the user. Moat fight is here.

## Competitor tour — cluster 2 (real rivals: consumer auto-drafters)
7. **Valentina / Seamly2D** — VERDICT: NOT a rival (relieved Damla's "free open-source exists, why me?").
   - What: free open-source parametric pattern tool. Sounds made-to-measure but is SEMI-automatic:
     you enter a measurement table, but SOMEONE must build the formula ("put this point at bust/4+2cm");
     once built, changing measurements updates parametrically. = smart drawing board + calculator,
     user brings the drafting knowledge. A zero-knowledge person opens it and sees a blank page.
   - Two lenses: 3D→2D = NONE (flat 2D formula, opposite of stitchu's thesis); automatic = NO (human
     sets formula); API = no (desktop); user = hobbyist/semi-pro who can draft.
   - Why not a rival: it gives an EXPERT a free bench (open-source Figma); stitchu gives a
     ZERO-knowledge person AUTOMATIC couture. Different sentence. And stitchu goes beyond technically
     (3D-derived vs flat 2D).
## NEW IDEA (2026-07-15, Damla) — fuse gymgyme's camera engine with stitchu's geometry engine
Damla: "gymgyme has camera body-tracking, stitchu has the geometry engine — let me turn in front of
the camera, it projects/reads my body, then preview with photo." Two motors, one chain. Split it:
- GOLD half: camera → MEASUREMENTS. gymgyme's pose engine already finds body points (shoulder/waist/
  hip width, One Euro, IK). Derive measurements from a turn → feed stitchu → pattern. Kills Damla's
  biggest pain (entering 7 measurements by hand). KEY: earlier we said "photo→3D body = million-$
  problem" — but Damla ALREADY has a working pose engine from gymgyme, so part of it is done.
  Nobody in the competitor tour does "camera-measure + draft pattern" in one product (Tailornova =
  manual measure; 3DLOOK = measures but no pattern). Real moat, real fusion of her two engines.
- TRAP half: camera → GARMENT PREVIEW (drape it on you). That's CLO's cloth-physics/AR — the thing we
  just closed as "can't/needn't". Classic gymgyme trap (chasing the flashy visual, forgetting the
  fitting pattern). Later/never.
- Correct version: camera→measurement (gymgyme) → pattern (stitchu). NOT camera→drape preview.

## PREVIEW split (2026-07-15) — one is a trap, one is doable
Damla revisited "preview it on me". Two different previews, do NOT conflate:
- TRAP: LIVE dressing = AR + real-time cloth simulation (elbise moves as you turn, drapes/wrinkles).
  = CLO's physics + AR. Can't build, shadows the real job (fitting pattern). Confirmed trap.
- DOABLE: STATIC GEOMETRIC preview = the engine already builds a 3D body surface from measurements;
  wrap the pattern pieces onto it and SHOW the static silhouette ("here's how it'll sit on your
  size"). No wrinkles, not live, no physics — just visualizing geometry the engine already computes
  (like Tailornova's simple avatar preview). Comes ~free from the geometric engine.
- Rule: live+physics = trap; static+geometric = doable. Couture needs to see FIT, not wrinkles;
  static geometric preview shows fit. Damla's "see it on me" is satisfied by the DOABLE one.

## Competitor tour — cluster 2 finished (rapid, 2026-07-15)
9. **Bootstrap Fashion** — Tailornova's uncoated ancestor: measure→pattern PDF, weak 3D, tool-like UX,
   flat-2D, no photo, no API. Same job done worse. No new lesson.
10. **Sewist** — web measure→pattern + in-browser edit; between Tailornova & Valentina. 3D weak, no
    photo, no API. Lesson: "edit pattern in browser" UX is nice (editor inspiration); core still 2D+catalog.
11. **MyBodyModel** — does NOT draft; draws a personal croquis/figure from your measurements, you design
    on it by hand. Supports the static-preview idea; not a pattern engine. Neighbor, not rival.
12. **3DLOOK / Bold Metrics** — extracts BODY MEASUREMENTS from a photo (not a pattern); e-commerce
    "what size fits you". KEY: commercial proof that photo→measurement is SOLVED. They don't tie it to
    patterns (suggest ready-to-wear size). If stitchu ties measurement→PATTERN, it builds the chain
    nobody does. Proof that Damla's camera→measure→pattern idea is buildable.

CLUSTER 2 VERDICT: real rivals = Tailornova (closest: auto + polished, but catalog-limited, no photo,
likely 2D+decoration-3D, no API) and its weaker cousins. NONE combine: photo→pattern + true 3D-derived
correctness + camera-measure + API. That intersection = stitchu's moat. Tailornova's catalog is Etsy-like
(closed showroom); stitchu = closed catalog PLUS open photo path.

## SCOPE DECISION (2026-07-15, Damla) — 2D first, defer 3D & cloth
- 3D-derived thesis is right but DEFERRED: start from 2D, make today's engine Tailornova-reliable
  first (jumping to 3D now = gymgyme trap again).
- Camera → body MEASUREMENT: KEEP (good, for projection/auto-fill measurements). Buildable now
  (gymgyme pose engine + 3DLOOK proof). Not the 3D rebuild — just measurement capture.
- Cloth/physics motor: LATER (coming months), not scrapped, correctly sequenced.
- ORDER LOCKED: (1) 2D engine reliable + reduce measurement pain (camera-measure) → (2) 3D-derived
  correctness → (3) cloth/preview. Ship trust before spectacle.

## TECH STACK TODAY (2026-07-15, read from code) + what's missing for Tailornova-parity
Engine (core value): C++ 4258 lines — bodice/sleeve/skirt/ruffle/keyhole/garment modules +
geometry.cpp + validator.cpp + sizechart.hpp. 2D drafting, tested, works.
Web: plain JS (16 files, no framework) + WASM (runs C++ engine in browser, build-wasm.sh).
Backend: Cloudflare Worker (worker.js) proxies Anthropic photo analysis; POST /api/draft = API skeleton EXISTS.
Vision: CLIP/SigLIP dead (zero-shot 44-65%); photo recognition currently via Opus API.
HAVE: 2D engine, WASM (zero server cost — advantage over Tailornova), API skeleton, true-scale A4 PDF.
MISSING for parity: (1) STYLE CATALOG UX (Tailornova's strength, biggest gap), (2) static preview,
(3) camera→measure, (4) grade-flow polish. NO new framework/language needed — 4 things on top of what exists.

## HOW TO BUILD THE CATALOG (2026-07-15) — you DON'T draw it, the engine does
Damla asked "how do I draw a catalog". Answer: you DON'T draw styles — you DEFINE them; the engine draws.
Three layers, none is hand-drawing:
- A) STYLE = a recipe (JSON data), e.g. {name:"Halter Midi", neck:"halter", bodice:"fitted",
  skirt:"a-line", length:"midi"}. Engine already knows these parts — new style = new COMBINATION, not
  new code. 20 styles = 20 recipe lines.
- B) CARD IMAGE = engine-generated. Feed the recipe to the engine → it outputs the flat technical
  sketch (like Etsy's line-drawing icons) → put it on the card. You don't draw; the engine draws.
- C) FLOW = simple UI: grid of cards → tap → take measurements → engine drafts that style at your
  size → PDF. create.js already does half of this.
So catalog = a GALLERY of the engine's own output (this is exactly what Tailornova does — they don't
hand-draw the catalog, their engine renders it). Only decision: which styles ship first (Etsy tour
already answered: linen dress, halter, wrap, tank, palazzo, corset...). NEXT-SESSION first task.

## Competitor tour (cont.)
10. **Sewist** — auto + in-browser pattern EDITING; core still 2D+catalog (Tailornova's shadow).
   WHAT PORTS TO STITCHU (Damla asked "what's addable"):
   - ✅ ADD: controlled ADJUSTMENT SLIDERS — length short↔long, sleeve +/−cm, neck depth closed↔open,
     ease slim↔loose. These are ALREADY engine parameters; just expose as sliders. Safe (bounded, not
     free-draw), doesn't scare the home sewist, satisfies the tinkerer, technically easy.
   - ⚠️ MAYBE (v2): add/remove PIECES (pocket, belt, lining) — engine must know each piece; defer.
   - ❌ DON'T ADD (trap): free-line editing (drag points). Scares non-experts + breaks engine
     correctness (user draws a wrong line → bad fit → "doesn't work"). It pierces the moat
     ("the ENGINE draws the correct line"). Keep control with the engine, not the user.
   Net: add bounded personalization sliders on top of "pick from catalog"; never free-draw.

11. **MyBodyModel** — not a pattern tool: draws a personal CROQUIS (fashion figure) at YOUR
   proportions, you design on it by hand. Neighbor, not rival. Lesson: people WANT to "see their own
   body at correct proportion" → supports the static-preview idea. It stops at the croquis (user must
   design by hand = expert work); stitchu wins by showing the silhouette AND giving the real pattern.
   PORTS TO STITCHU: personal-silhouette preview before/after drafting (demand proven by MyBodyModel).

## ADD-LIST (next sessions, not now — Damla: "let's add these") 
Decided this session, build later with a fresh head (order under SCOPE DECISION):
1. STYLE CATALOG UX (engine renders cards from style-recipe JSON; biggest gap vs Tailornova)
2. adjustment SLIDERS (length/sleeve/neck/ease — already engine params, from Sewist)
3. STATIC personal-silhouette preview (from MyBodyModel demand + geometric engine)
4. CAMERA → MEASUREMENT (gymgyme pose engine, kills the 7-measure pain)

## PLATFORMS — one C++ engine, three faces (confirmed 2026-07-15, matches 2026-07-10 decision)
Damla: "after the stitchu engine, iOS and Android apps come from it too, right?" YES — that's exactly
why C++ engine + API is the right call. ONE C++ core compiles to every platform:
- Web → WASM (already live)
- iOS → C++ native static lib (inside Swift)
- Android → NDK build (inside Kotlin)
Write the engine ONCE (done), all three share it — the garment math is identical everywhere because
they all call the same C++. Not three engines, one. Ship order: web first (fastest, everything
decided) → iOS reskin on the core → Android. With API-first, mobile apps can also just call the API.
One core, infinite faces: web, mobile, brand integration.

## WHY MOBILE IS THE REAL PRODUCT (2026-07-15, Damla) — "phone scans, instantly gets pattern"
Mobile isn't a shrunk web app — the phone is the NATURAL body-scanning device (in hand, everywhere).
Its one superpower: lift phone → turn around → app reads your body (gymgyme pose engine) → derives
measurements → engine drafts → you hold the pattern. No measuring tape, no 7 fields. TURN AND GET IT.
Solves every pain at once:
- "entering measurements is torture" → phone measures.
- "I don't trust it" → uses YOUR real scanned measurement, not a guess → actually fits.
- Tailornova can't: it asks for manual measurements; stitchu SCANS.
Buildable because gymgyme ALREADY has the scan engine (pose/skeleton/One Euro). "Phone scan" = fusing
her two engines, not a from-scratch dream: stitchu geometry + gymgyme camera = "turn, scan, get pattern".
SHARPEST MOAT: nobody says "scan your body with your phone, get a couture pattern." 3DLOOK scans but
suggests ready-to-wear size (no pattern); Tailornova drafts but wants manual measurements (no scan).
stitchu = the only product that fuses both.

12. **3DLOOK / Bold Metrics** — extracts BODY MEASUREMENTS from phone photos; e-commerce uses it for
   "which size fits you". ✅ photo→measurement is COMMERCIALLY SOLVED (Damla's phone-scan idea is
   proven, not a dream). ❌ but they DON'T tie it to a pattern — they suggest ready-to-wear size.
   stitchu adds the second half: scan→PATTERN. The chain nobody joins.

## COMPETITOR TOUR COMPLETE (12 rivals, 2026-07-15)
- Cluster 1 (Gerber/Lectra/Optitex/CLO3D/Browzwear/TUKAcad) = "industry's Figma": expert-drawn,
  factory/brand, locked, expensive. NOT rivals — the quality bar. Banked: grade rules, 3D→2D works,
  API/PLM model, democratizing unfinished.
- Cluster 2 (Tailornova + Bootstrap/Sewist/MyBodyModel/3DLOOK) = consumer auto-drafters (real rivals).
  Tailornova closest (auto + polished) BUT catalog-limited, manual measure, likely 2D+deco-3D, no API.
- MOAT (nobody combines all): phone SCAN→measurement + true 3D-derived correctness + measure→PATTERN
  + API/one-C++-core-many-platforms. Tailornova's catalog is Etsy-like (closed); stitchu = closed
  catalog PLUS open photo path PLUS phone scan.

## "3DLOOK has millions, we don't" — why that's the WRONG conclusion (2026-07-15)
Damla worried: they spent millions, we can't. Reverse is true:
- 3DLOOK spent millions ~2018 because photo→measurement was ZERO then (pose estimation just emerging,
  ML scarce, phone cameras weak). They PAVED the road; the millions went into paving.
- Today the road is OPEN & FREE: MediaPipe pose engine is free, runs in-browser; cameras are great.
  And Damla ALREADY built the pose engine (gymgyme: tracking/skeleton/One Euro). The "find body
  points" part 3DLOOK spent millions on = already in her hand.
- Analogy: first car took millions/years; today you don't build a car, you take a ready engine and
  build your own on top. 3DLOOK invented the car; stitchu drives with a ready engine.
- Honest fence: 3DLOOK's e-commerce PRECISION (mm-accurate, return-rate grade) is where the millions
  went — stitchu does NOT need that. User wants a pattern for THEIR OWN body, not "which RTW size";
  a rough-correct scan + a user confirm (or one tape check) beats hand-entry. Just needs to be BETTER
  THAN typing 7 numbers, not perfect.

## PRECISION DECISION + NIGHT LOOP (2026-07-15, Damla: "both, but in order" + "start the loop, be precise now")
- Precision order: (1) PATTERN correct first (engine, law-aligned + fits), scan can be rough+confirm;
  (2) raise SCAN precision months later while the pattern already sits. Both, sequenced.
- NIGHT LOOP started (separate window): a MEASURE-ONLY audit — compares every bodice formula/constant
  to Aldrich + Armstrong, outputs a deviation table to reports/2026-07-16-stitchu-aldrich-armstrong-sapma.md.
  RULES: does NOT modify the engine, does NOT deploy/commit/push, does NOT fabricate reference values
  (marks "DOĞRULANMALI" when unsure), STOPS when bodice measures are all tabled (task-bound, not clock).
  This is what "precise" means tonight = gather PROOF first, fix later with Damla's eyes. Avoids the
  gymgyme trap (won't grow an unproven engine; measures where it stands vs the law first).
- Good news from reading code: FORMULAS.md already traces constants to FreeSewing/Müller&Sohn/ALDRICH —
  written but never MEASURED against the law. The loop measures the gap.
