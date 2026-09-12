# DRESSES REWORK — round ledger

Every dress until it matches. Each round: faults → ROOT DIAGNOSIS → repair.
Rule: if only a JSON number changed, the round DOESN'T COUNT. The engine changes.
Independent variable = a number I set. Dependent = what moves with it.

Gate: `node src/gate/gate.mjs <spec.json>` after every round.

---

## THE TWENTY

| # | dress | what it teaches the engine | state |
|---|---|---|---|
| 01 | pink bow keyhole mini | band collar, stepped opening, hourglass | 119 rounds, gate 7/7 — **"it's shit"** |
| 02 | white ruffle smock | shirred bodice, tiered ruffle skirt, puff sleeve | |
| 03 | yellow maxi shoulder tie | shoulder tie, dropped waist, gathered full skirt, maxi | |
| 04 | pink peplum bow | waist drape bow, layered skirt (cream under) | |
| 05 | pink bow wrap layered | asymmetric wrap, pleated underlayer | |
| 06 | pink striped back bow | **back is the face** — deep U back, back bow | |
| 07 | pink gingham collar corset | oversize collar, corset seams, box pleats | |
| 08 | red gingham buttons pleat | asymmetric button run, pleats | |
| 09 | navy gingham cap sleeve | asymmetric placket, cap sleeve | |
| 10 | blue plaid asym collar | folded asymmetric collar, gathered skirt | |
| 11 | cream polka halter | halter neck, polka fill | |
| 12 | **navy gingham + REAL PATTERN SHEET** | ground truth: photo + pattern + size chart | |
| 13 | pink tweed shoulder bows | shoulder bows, dropped waist, gathered skirt | |
| 14 | pink gingham side ties | side shirring with ties | |
| 15 | yellow lilac plaid belt | belt + buckle, inverted box pleats | |
| 16 | red gingham side tie top | peplum top, side bow ties | |
| 17 | blue pink plaid belt | (same as 15, second proof) | |
| 18 | yellow mini bubble | bubble hem, dropped waist | |
| 19 | pink gingham ruffle | hem ruffle, dropped waist | |
| 20 | red gingham ombre top | gradient fill, tie straps, ruffle hem | |

**#12 is the only ground truth** — one image carries the product photo, the real
pattern sheet (front/back bodice, skirt, sleeve cap, facings) and a size chart.
The pattern output can be compared piece by piece.

**Shared structure (already built on 01):** boat/bateau neck · sleeveless or cap
· mini A-line or dropped waist · hourglass body · fabric colour, weave, shade

---

## 01 — PINK BOW KEYHOLE MINI

### Rounds 1-119 (12 Sep, old run)
Faults seen: flat body, no hourglass, ruler shoulders, ugly neckline, white
output for a pink dress, bad shade, seam allowance drawn on a look.

Roots cut in the engine:
1. `gogusAyri >= 30` — the bust was dropped from the side seam whenever it sat
   within 30mm of the underarm. In croquis the gap is 15mm, so the bust was
   **always** dropped and the widest part of the body was never drawn.
2. Armhole parameter order reversed on the left half — body and sleeve diverged
   by 7.6mm; that was the white line at the shoulder.
3. Body fill hardcoded `#fff` — fabric colour never reached the engine.
4. `o.X || N` in 24 places — in JS `0 || 3 = 3`, so a reading of zero silently
   took the default.
5. The fan rule rounded **every** opening bottom; a square neckline was impossible.
6. `yakaYolu` with 6 control points never used the last one — a stepped opening
   could not be drawn.
7. The body contour didn't start at the neck base, so the band sat in empty space.
8. Shade applied evenly around the whole edge — a hard band.

Laws corrected by measurement: line weight ratio, skin fill, `gercek36` waist
(it had none: 0.940 vs Buğra's real 0.7727), inconsistent targets, perspective.

**Result: gate 7/7 ratios + 6/6 objects. Damla looked: "it's shit."**
**Lesson: a green gate does not mean the product is good.**

### Round 120 (13 Sep) — OPEN
Three roots measured today, all open:
- **K1** the pattern never reads the photo (`grep -c "ogeler" src/pattern/pattern.mjs` → 0)
- **K2** the gate treats the A-line as law and forces the engine there
- **K3** the gate's 7 targets are memorised from this one dress
