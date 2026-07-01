# Stitchu

Sewing pattern app for iOS. Upload a photo of any garment (or design one) and get a custom sewing pattern fitted to your body, plus fabric recommendations, notions (zipper, interfacing, thread), and a step-by-step sewing guide. A pocket sewing teacher.

Formerly named Pattew. Renamed to Stitchu on 2026-07-02.

## Status
Current phase: Foundation (pre-code)
Last session: 2026-07-02 — renamed to Stitchu, rebranded mock + asset guides to baby blue palette and Quicksand font, created this file, set up git/GitHub

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
- [ ] Xcode project setup
- [ ] data models (Measurement, Pattern, PatternPiece)
- [ ] onboarding flow (measurement input)
- [ ] room navigation skeleton

### Phase 2: Pattern Engine
- [ ] bodice block from measurements
- [ ] skirt block
- [ ] sleeve block
- [ ] SVG pattern rendering
- [ ] PDF export with A4 splitting + calibration square

### Phase 3: Modular Designer
- [ ] body silhouette view from measurements
- [ ] component pickers (neckline, sleeve, bodice, skirt, waist)
- [ ] real-time silhouette preview
- [ ] designer selections → engine → pattern

### Phase 4: Photo Analysis
- [ ] photo upload/capture UI
- [ ] Claude API garment analysis
- [ ] map analysis to engine components
- [ ] pattern from photo end-to-end

### Phase 5: Sewing Guide
- [ ] step-by-step instruction generation
- [ ] instruction UI (steps, pro tips, materials list)
- [ ] fabric estimation + meter calculation

### Phase 6: Persistence & Polish
- [ ] save/load patterns (SwiftData)
- [ ] pattern history in Closet
- [ ] PDF re-download

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
