# Stitchu

Sewing pattern app. Upload a photo of any garment (or design one) and get a custom sewing pattern fitted to your body, plus fabric recommendations, notions (zipper, interfacing, thread), and a step-by-step sewing guide. A pocket sewing teacher.

Formerly named Pattew. Renamed to Stitchu on 2026-07-02.
2026-07-10: platform decision — Stitchu moves to the WEB (see Web Rework below). The printed-PDF workflow lives on desktop/printer, not on a phone. iOS code stays in the repo as reference; the web app is the product.

## Status
Current phase: Core (app builds and runs the photo → skirt pattern path end-to-end)
Last session: 2026-07-07 — block validation (the launch blocker): built PatternValidator (geometric invariants) + engine-check harness (2805 drafts, EU 34-52 + tall/petite/pear/apple/edge bodies, all garment/neckline/sleeve/skirt combos, ALL PASS), fixed 8 real engine bugs it caught (side seam balance, bust ease loss, waist suppression, sleeve cap convergence, half-circle doubling, dress waist mismatch, missing CB seam for dress zipper, v-neck fold-back), wired runtime validation so a broken pattern can never reach the PDF.

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
- ANTI-GENERIC bans (Damla, hard rules): no single colored word inside black text; no bold weights / loud saturated tones; no pill badges, no gradient hero, no emoji bullets, none of the usual AI-site tells. Layout uses space WELL: not cramped, not airy-everywhere — deliberate density, generous only where it earns it.
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

### Phase W1: C++ engine port (the backbone)
- [ ] port drafting blocks from Swift to C++: bodice, skirt (A-line/straight/gathered/half-circle), dress, top, sleeve
- [ ] port manipulation layer v1 (necklines, skirt styles, sleeves)
- [ ] port PatternValidator (geometric invariants) as C++ tests
- [ ] port engine-check harness: the same 2805-draft matrix (EU 34-52 + edge bodies) must pass in C++ before anything else proceeds — this is the port's definition of done
- [ ] Emscripten build → WASM module + thin JS bindings

### Phase W2: web app
- [ ] app shell: onboarding (7 measurements, silhouette highlights), Create/Closet rooms — design direction from Damla, whimsy doodle style, sharp corners
- [ ] photo upload → Cloudflare Worker vision → user confirms → WASM engine → pattern
- [ ] SVG pattern rendering (pieces, darts, grainline)
- [ ] client-side tiled A4 PDF with 3 cm calibration square
- [ ] sewing guide + fabric advice content ported from iOS
- [ ] local persistence (saved patterns in IndexedDB/localStorage)

### Phase W3: money + launch
- [ ] merchant of record paywall — Paddle or Lemon Squeezy (both work from Turkey; pick after comparing fees) — gating via the existing Worker
- [ ] privacy policy + KVKK/GDPR consent (photo leaves device only for vision analysis) — ships in the same session the upload flow does
- [ ] hosting decision: Cloudflare Pages (pairs with the Worker) vs GitHub Pages
- [ ] ship-check before public launch

### Phase W4: AI eval pipeline (Python, learning project)
- [ ] fixed test set: garment photos with hand-labeled expected analysis (garment type, neckline, sleeve, skirt style)
- [ ] Python harness: send set through the Worker, score outputs against labels, report accuracy
- [ ] regression compare: prompt/model change → score diff (answers "can we drop opus → sonnet" with numbers)
- [ ] format: Claude teaches, Damla writes the critical code
- [ ] once proven, copy the harness pattern to lingolingo

### Feature candidates (Damla picks which make the cut)
- projector mode: full-screen true-scale pattern with calibration grid, for projecting straight onto fabric (big sewing-community trend; kills A4 taping)
- A0/copyshop single-sheet PDF export
- fabric yardage + cutting layout plan ("1.8 m at 150 cm width, place pieces like this") — fabric DB already exists
- fit warnings from measurement profile ("this may run tight at the waist")
- shareable pattern links (free marketing loop; free tier = watermarked PDF)

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
- [ ] pleats, wrap styles, collars, pockets (manipulation layer v2)
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

## Bugs / Issues
- none known (engine matrix passes; 8 drafting bugs found and fixed 2026-07-07, see engine-check/)

## Competitors
- StitchLift: thrift flips only, no pattern generation
- Sewist/Lekala: web only, no mobile
- Seamly2D: desktop, complex
- Clo3D: $50/mo professional tool
- Ribblr: crochet/knitting patterns marketplace, not generation
