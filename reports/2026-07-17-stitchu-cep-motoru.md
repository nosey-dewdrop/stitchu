# stitchu — cep motoru (patch 3.12)

2026-07-17 · RAY 1 motor loop · worktree agent · 0 credit spent

## What shipped
The engine now drafts TWO honest pocket constructions, each an opt-in post-pass
that leaves every existing outline byte-identical when off.

1. **Patch pocket (yama cep)** — a separate flat pocket piece sewn onto the
   outside of the front panel. A rounded-corner rectangle, top folds a 35 mm
   self-hem for the mouth, sized to the measured front-panel width (bust / 4) and
   **trued** to it (the cut note quotes it; the size grows with the body). An
   L-bracket placement mark is stamped on the front panel at its upper-hip band.
   `cut 2`.
2. **Side-seam pocket (yan dikiş cebi / in-seam)** — a hidden bag set into the
   side seam. One mirrored teardrop bag piece (`cut 2 pairs` = 4), straight edge
   into the side seam, curved edge to its mate. Mouth opening 155 mm, bag depth
   175 mm below it, both **measured from the drafted side-seam length** so the bag
   never runs past the hem. Mouth-opening mark stamped on the side seam.

`PocketStyle { None, Patch, SideSeam }`, default None → golden byte-identical.

## Why pockets, why these two
The data pointed here. `dataset/vocab-frequency` (market compass) and the 60s/70s
collection both flag **side pocket (freq 14) + patch pocket (freq 13) = 27**, the
highest drawable out-of-vocab cluster. Damla's rule ("accuracy + moat neyse onu
yap") → the data says pocket.

Only the two lowest-risk, most-common constructions are drawn. A **welt / besom /
bound / jetted** pocket, a **cargo / flap** pocket and a **kangaroo** pouch are
different constructions and stay honest (missing.js). There is no enum for them —
the surface is exactly `{None, Patch, SideSeam}`, so a welt request can never be
silently substituted with a patch.

## Byte-identical + truing
- Golden dump unchanged (23034 lines) with pockets off.
- Neither pocket rewrites an existing outline. A patch/mouth MARK is added to the
  host panel's `markings`, but the OUTLINE (`commands`) of every piece stays
  byte-identical (pocket_check asserts this piece by piece).
- Patch width = `clamp(bust/4 · 0.55, 110, 210)` mm, reproduced in the test.
- Side-seam bag depth = `min(175, sideLen − opening − 20)` from the drafted side
  seam, so it is trued to the real seam, not a bare scalar.
- Validator fix: a "Pocket" piece is excluded from the skirt-waist sum (a pocket
  is an attachment, not a waist-bearing panel), so it never distorts the
  waist-join check. (This was the one real integration bug the tests caught — the
  patch/bag top edge was being counted into the skirt waist.)

## Proof regime
- `ctest 23/23` — new **pocket_check**: patch adds one piece + a placement mark,
  sized/trued to the front-panel width; side-seam adds one bag piece + a mouth
  mark, deeper than the opening; existing outlines byte-identical; a cropped top
  skips the side-seam bag honestly (false + one note, no silent no-op); the enum
  surface is exactly {None, Patch, SideSeam} (no welt); patch + placket + peplum
  coexist on one top.
- golden byte-identical (23034 lines, diff clean).
- precision-report 0.00 mm worst pair.
- web-fuzz **20270 drafts / 0 failures** (new pocket sweep: patch + side-seam ×
  dress/skirt/top × princess/dart + straight/gathered skirt).
- vocab-sweep **37800 / 0**.
- style-lint clean (53 pages + 7 css), header-diff clean (46 pages).
- **RENDER-ONAY** (Chrome headless PNG, read by eye):
  - `patch-pocket-dress` — the Patch Pocket piece is a separate rounded rectangle
    with a dashed fold line (mouth hem) and a grainline arrow; the Skirt/Bodice
    front carries a dashed rectangular placement mark. Cut + sew lines both
    present, register grid + page codes intact, no page-boundary clipping.
  - `sideseam-pocket-skirt` — the Pocket Bag piece is a teardrop pouch with a
    straight side-seam edge and a grainline; the Side Front carries the mouth
    ticks on the side seam. No clipping.

## Bridge (create.js / missing.js / engine.js / backend / bindings)
- `pickPocket(seen)` reads oov/details for "pocket" (not welt/besom/bound/jetted/
  cargo/flap/kangaroo/zip) → sideSeam on side/in-seam/hidden/slash cues, else
  patch. A manual "cep" picker covers the no-photo path.
- `seen.pocketDrawn` suppresses the missing.js pocket note + the outOfVocab pocket
  term (welt etc. stay honest).
- `pocketStyleValue` in engine.js, `pocketStyleInt` + ENUM whitelist in backend/
  draft.js, `pocketStyle` int param in wasm/bindings.cpp (draftJSON + gradeJSON +
  buildSpec). Both wasm targets rebuilt (browser SINGLE_FILE + CF worker).
- Worker vision prompt UNCHANGED.

## Benchmark
Held at **37/54**, honestly. This is a motor loop; the benchmark counts FULL
patterns, and pocket photos are mostly clustered with other missing elements.
Pocket photos can reclassify to FULL via the offline (0-credit) reclassify against
the private label set — that needs the local benchmark manifest, which is
gitignored and not present in this isolated worktree, so it was not run here. No
credit was spent.

## Next (RAY 1)
The mining cluster's next drawable groups (button cuff / hood / dropped shoulder),
or the welt/besom pocket (a different, harder construction — bound opening, not an
applied piece).
