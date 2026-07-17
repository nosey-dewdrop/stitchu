# Vocabulary expansion log — 2026-07-17

Direction (Damla): the engine must be able to DRAW the garment features she named
so it can eventually DESIGN. Five orthogonal, opt-in, byte-identical feature
families, each an enum + isolated post-pass, reachable in the create.js picker.

Baseline (before): ctest 29/29, golden byte-identical, engine builds clean.
Existing post-pass template studied: tie.cpp, peplum.cpp, strap.cpp, garment.cpp
drafter chain, bindings.cpp / engine.js / draft.js / create.js SPEC_GROUPS.

## Features to add
1. Button rows / plackets — CENTER-FRONT functional button row + DECORATIVE rows.
   (An asymmetric placket + a symmetric CF placket already exist; add a real
    drawn BUTTON ROW piece-marking + decorative rows as a new orthogonal enum.)
2. Exposed / visible zipper — distinct from the invisible CB zip; a drawn zip
   teeth glyph on CF or CB with the correct exposed-zip seam allowance.
3. Back detail — ruffle / cape / flounce at the back (Damla: "arkası pelerinli/
   fırfırlı"). Separate cut piece trued to the back neck edge.
4. Front-tie variants — front bow, wrap-front tie, tie-front waist (the back-tie
   family exists; add the front placements + wearability where the tie opens).
5. Off-shoulder / bardot neckline — wide neckline off the shoulders with an
   elastic/gathered channel + optional ruffle flounce. Unlocks the gingham dress.

## Progress
(sequential, appended as each ships)
</content>

### SHIPPED (all 5 feature families)
Engine modules added (opt-in post-passes, default OFF → golden byte-identical):
- buttonrow.{hpp,cpp} — ButtonRow {None,Functional,Decorative}; draws real button
  circles; Functional reuses PlacketBlock geometry (opens for donning).
- exposedzip.{hpp,cpp} — ExposedZip {None,CenterFront,CenterBack}; teeth glyph +
  10 mm exposed-zip SA + opens the seam.
- backdetail.{hpp,cpp} — BackDetail {None,Ruffle,Cape,Flounce}; separate piece
  trued to the back neck edge.
- tie.{hpp,cpp} EXTENDED — TiePlacement += {FrontWaistTie,WrapFront,FrontWaistBow}
  (append-only); WrapFront opens the front (donnable).
- offshoulder.{hpp,cpp} — BardotStyle {None,Plain,Frill}; reshapes the bodice top
  edge below the shoulder + elastic casing (+ frill); donnable via the elastic top.

Wiring (each reachable in the create.js manual picker + vision pickers + API):
- measurements.hpp: 4 new spec ints (buttonRow, exposedZip, backDetail, bardotStyle).
- garment.cpp: 5 new post-pass calls + CB-zip / wearability donning logic updated.
- wearability.cpp: functional button row, exposed zip, bardot, wrap-front = donning.
- bindings.cpp: 4 trailing int params through buildSpec/draftJSON/gradeJSON.
- engine.js + backend/draft.js: enum mappers + 4 params + ENUMS + normalize.
- create.js: 6 new SPEC_GROUPS pickers (backDetail, bardotStyle, buttonRow,
  exposedZip, tieClosure/front-tie) + 3 vision pick* fns; specFromParams auto-covers.
- missing.js: suppression flags + oov terms for all 5 (drawn = not "missing").
- CMakeLists.txt + build-wasm.sh: 4 new sources (both targets) + 5 new ctests.

PROOF (before → after):
- ctest: 29/29 → 34/34 (buttonrow/exposedzip/backdetail/fronttie/offshoulder checks).
- golden byte-identical: 23034 lines, 0 diffs (all defaults off).
- vocab-sweep: 37800 drafts, 0 failures. web-fuzz: 26260 drafts, 0 failures.
- precision: worst pair 0.00 mm. wearability-bench: 55 specs, 0 UNWEARABLE.
- WASM rebuilt (browser + worker). Fresh-WASM drive: all 5 features 0 issues.
- RENDER-ONAY (Chrome PNG, eyeballed): off-shoulder gingham = straight bardot band
  below shoulders + elastic line + gathered skirt (the dress Damla wants);
  functional button row = grown CF stand + fold + buttonholes + 6 button circles,
  labelled "button placket (center front)"; exposed CF zip = teeth glyph on CF seam,
  labelled "exposed zipper (center front)"; back cape/ruffle = separate trued piece;
  wrap-front tie = Wrap Front Tie piece, front opens.

HONEST BOUNDARIES (stay in missing.js, not faked): double-breasted/covered/toggle
buttons, separating/two-way/diagonal zips, hooded/watteau back capes, one-shoulder/
strapless/structured off-shoulder, princess-split off-shoulder (needs a plain bodice).
