# Stitchu

Sewing pattern app. Upload a photo of any garment (or design one) and get a custom sewing pattern fitted to your body, plus fabric recommendations, notions (zipper, interfacing, thread), and a step-by-step sewing guide. A pocket sewing teacher.

DOC SPLIT (2026-07-18): agents/loops load ENV.md + RULES.md ONLY. This file is Damla's living doc.
STRATEGY.md holds competitors, moat, market thinking and detailed session history — never fed to an agent.
Current platform/scope decisions live at the bottom of RULES.md (latest wins).

Formerly named Pattew. Renamed to Stitchu on 2026-07-02.

## Status
Current phase: LIVE product, benchmark era (web v75, 37/54 full patterns). BREADTH → DEPTH: prove fit, sew up.
Detailed session logs: STRATEGY.md "Session history". Latest report: reports/2026-07-17-stitchu-cep-motoru.md.

## Open suspicions (audit findings 2026-07-18 — this section is never empty; see RULES invariant 7)
1. RENDER-ONAY claims before 2026-07-18 are UNVERIFIED: discipline step 6 ("PNG → eyes") was
   satisfiable only by claiming, so past "read by eye" lines are checkbox-filling, not proof.
   All prior visual approvals need re-render with artifact paths (RULES invariant 3).
2. Bridge silently drops unknown spec values: sleeveStyle 'puff' was dropped with no error — the
   README's "never silently dropped" guarantee is documented but NOT enforced in code.
   Fix: unknown enum → Result::Err + a round-trip test per spec field (RULES invariants 1-2).
3. Today's pattern-vs-dress mismatch came from exactly that silent drop — audit which OTHER spec
   fields lack a round-trip test (systematic sweep needed, not just puff).
4. Docs asserted "ALL PASS / 0.00mm / byte-identical / no engine limit found" as standing facts —
   any decision made on those doc lines (not fresh test output) is suspect until re-run.
5. Contradictory decisions coexisted in this file (web-only vs all-three, iOS retired vs Phase W5,
   3D REQUIRED vs 2D-first) and steered loops toward "most plausible" readings — e.g. the guide
   pulling princess/gore text. Resolved set now lives in RULES.md; watch for stale echoes in other docs.
6. Princess-seam/gore-panel default: DECIDED 2026-07-12, NEVER CODED. Engine still drafts dart-first.
   Any doc/guide implying princess is current behavior is wrong.

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

## North Star (one line)
Photo + YOUR measurements = a custom, sewable pattern for ANY garment — the expert part (pattern-making) democratised, with a construction guide. Full framing: STRATEGY.md.

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
- [x] cowl + pussy-bow neckline (patch 3.16): Neckline enum appended (Cowl, PussyBow); cowl = wide+deep front cut on the bias with drape excess (a shape, no new piece); pussy-bow = high stand band trued to the neckline + a long self-lined tie strip (2 pieces). Opt-in → 7 originals byte-identical (golden 0.000000mm). ctest neckline_ext_check, render-onay (cowl dress + pussy-bow blouse PNG by eye). Vocabulary add, not accuracy on this set (no cowl photo, bow already an applied tie — honest). Bridge: bindings + draft.js ENUMS + create.js picker + missing.js suppression + worker.js vision schema (deploy Damla) + two wasm.
- [x] cuff family (manşet, patch 3.13): button + ribbed sleeve-end band, opt-in post-pass on a full-length straight sleeve (long/elbow), wrist band trued to the sleeve hem; sleeveless/cap/short skip honestly; French/elastic/ruffle cuff stays honest. CuffStyle enum, byte-identical off. ctest cuff_check + full bridge + two wasm.
- [x] hem SHAPE (2026-07-17, patch 3.15): shirttail (sides up, center long) + high-low (front short, back long) reshape the fitted lower edge in place (no piece added), gore seam + side seam trued (F/B side hems lift equal), cropped/gathered/handkerchief refused honestly, dress bodice untouched. HemShape enum, byte-identical off. engine+hem_check+web-fuzz+render+bridge+patch 3.15. Benchmark 34/54 UNCHANGED (no shirttail/high-low in the 54-set; market-pusula freq=12 capability, proven not claimed).
- [ ] wrap styles, collars, pockets, off-shoulder/peplum (specs drafted in engine/SPECS-next-vocabulary.md — REVIEW before building)
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
- GRADING — SHIPPED 2026-07-15 (v46): one design → a full EU34-52 size run from the same engine (grading = drafting the spec against each standard body; sizechart.hpp = the grade rules as bodies, no separate rules to drift). gradeJSON returns each size's bust/waist/hip cm; POST /api/grade (needs wrangler redeploy to go live); web seller size-run panel prints all sizes as one doc with a real size chart + per-sheet size stamp. grade_check proves clean + monotonic growth; golden byte-identical. NEXT LEVER (the real competitor-beater, deferred for Damla's call): NESTED multi-size PDF — all sizes overlaid on the same pieces, one line style per size, print once (industry standard; StitchLift/Etsy sellers expect it). Today's run prints size-separated, not nested. Also: PDF-per-size download instead of one merged browser print job.
- Full-bust adjustment polish: the FBA now does front width+length+dart+back frame; a future pass could split the cup add differently for princess vs dart, and expose a cup-based estimate when the user only knows their cup letter.
- Real API playground on api.html (sandbox key + pricing) — persona jury's remaining seller ask; needs a payment decision.

## Companion + content hub: SHIPPED 2026-07-17 (v72) — details in STRATEGY.md
