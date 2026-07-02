# Stitchu

Sewing pattern app for iOS. Upload a photo of any garment (or design one) and get a custom sewing pattern fitted to your body, plus fabric recommendations, notions (zipper, interfacing, thread), and a step-by-step sewing guide. A pocket sewing teacher.

Formerly named Pattew. Renamed to Stitchu on 2026-07-02.

## Status
Current phase: Core (app builds and runs the photo → skirt pattern path end-to-end)
Last session: 2026-07-02 — built the Xcode app: onboarding with measurements, 4 rooms, photo → confirm → skirt pattern → tiled A4 PDF with calibration square, closet with save/delete, profile with measurement editing + API key. Research knowledge base (verified formulas) shipped in-app. Fabric research round still in progress.

### What works today
- Onboarding: 7 measurements with body silhouette highlights, validation, back navigation
- Create → photo path: pick photo → Claude analysis (if API key set) or manual pick → user confirms → A-line/straight skirt drafted from real measurements (FreeSewing-verified formula philosophy: measurement + % ease)
- Pattern result: piece previews with darts/grainline, fabric meters estimate, step-by-step sewing guide (invisible zipper order from verified source), true-scale tiled A4 PDF with 3 cm calibration square
- Closet: saved patterns, delete, reopen
- Profile: edit measurements, Anthropic API key stored in Keychain only

### Honest gaps (v0)
- Skirt only; dress/top/trousers pickers show "soon"
- Modular designer + describe paths are placeholder cards
- Fabric intelligence waiting on verified research (fabrics.json empty)
- All doodle assets are placeholders until Damla draws them
- No onboarding sign-in (local only), no paywall yet

## Brand
- Name: Stitchu
- Palette: baby blue — bg #F5FAFF, accent #6FB3DE, light #DCEEFA, text #2C3E50 (pastel pink/sage/lavender as secondary)
- Font: Quicksand (400/500/600/700)
- Style: whimsical, hand-drawn doodles, dashed/stitched borders, sketchbook feel
- Assets: 101 items in checklist.md, Damla draws them (placeholders until then)

## Product
- 3 creation paths: photo upload → AI analysis → pattern (free), Stardoll-style modular designer (free), describe → AI visual → pattern (premium)
- Pattern output: numbered pieces, A4 PDF with calibration square, fabric estimate + meters, step-by-step sewing guide (interfacing, sewing order, stitch types, notions like zippers)
- Fabric intelligence: suggests suitable fabrics, warns when a fabric won't work for the design (e.g. viscose on a structured bodice)
- 4 rooms, no tab bar: Inspire / Create / Closet / Community — pills to switch
- Onboarding: sign up (Apple/Google/Email) + body measurements, 10 slides, one measurement per screen with body silhouette highlight
- Revenue: freemium + subscription ($5-10/mo) — premium unlocks describe-path, visual guide diagrams, unlimited patterns
- Pattern engine: parametric drafting compiled from Muller & Sohn + Winifred Aldrich + FreeSewing.org formulas
- Tech: SwiftUI + SwiftData, Claude API (photo analysis + guide), Gemini/DALL-E (visual generation), SVG + PDFKit, StoreKit 2

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
- [ ] bodice block from measurements (formulas verified & in DB, code pending)
- [x] skirt block (A-line + straight, darts, waistband)
- [ ] sleeve block
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
- [x] step-by-step guide (skirt, incl. verified invisible zipper order)
- [x] instruction UI (numbered steps)
- [x] fabric meter estimate (rough, refine later)
- [ ] fabric suitability advice (waiting on verified fabric research)

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
- none yet (no code)

## Competitors
- StitchLift: thrift flips only, no pattern generation
- Sewist/Lekala: web only, no mobile
- Seamly2D: desktop, complex
- Clo3D: $50/mo professional tool
- Ribblr: crochet/knitting patterns marketplace, not generation
