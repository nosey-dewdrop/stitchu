#pragma once
// Cuff family (manşet) — the SLEEVE-END finish. Patch 3.14.
//
// A cuff is a SEPARATE band stitched to the wrist end of a sleeve; the wide
// sleeve hem is drawn in (gathered / pleated) to the narrower cuff. Two
// structural families, one shared governing constraint:
//   (a) BUTTON CUFF (gömlek manşeti) — a rectangular self-fabric band cut to the
//       wrist girth + a button/buttonhole overlap, interfaced, cut 2 (+ tela).
//       The sleeve hem is wider than the band, so the surplus is gathered or
//       pleated into the cuff. This is the classic shirt cuff.
//   (b) RIBBED CUFF (ribana manşet) — a knit rib band cut SHORTER than the wrist
//       (it stretches on), stitched to the sleeve hem which is gathered down to
//       it. The bomber / sweatshirt cuff. Its finished (relaxed) length is the
//       wrist girth × a stretch-back ratio; cut length is that × 2 for the fold.
//
// THE GOVERNING CONSTRAINT (trued, measured, not asserted): the cuff band's
// attach-edge length and the sleeve-hem fullness are drafted off the FINISHED
// sleeve piece the engine already drew. We measure the drafted sleeve HEM width
// straight off that piece, so the cuff can never drift from the sleeve it sews
// to — truing is by construction, and the ctest re-measures it. The sleeve hem
// (fullness) is proven to equal the cuff attach length × the fullness ratio.
//
// Post-pass like the collar / tie / placket: runs on the finished pattern, adds
// the cuff PIECE + a wrist placement notch on the sleeve hem, and NEVER touches
// an existing outline. With no cuff in the spec (cuffStyle == CuffStyle::None)
// every golden dump stays byte-identical.
//
// HONEST BOUNDARY, only SLEEVED garments: a cuff is drawn ONLY when the draft
// has a real full-length sleeve piece (Straight sleeve, Long or Elbow) with a
// hem to gather. A sleeveless or cap-sleeve or short-sleeve garment has no wrist
// to cuff → honest skip (no silent no-op). A FRENCH cuff (double turn-back,
// folded band, cufflinks) and an ELASTIC-CASING cuff (a channel, no separate
// band) are NOT drawn — they stay in the honesty layer (missing.js). This block
// draws the button (barrel) cuff and the ribbed (knit) cuff only.
#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {

// Which cuff the spec asks for. Off = no cuff piece (byte-identical base).
//   Button — woven barrel cuff: band = wrist + overlap, sleeve hem gathered in.
//   Ribbed — knit rib band cut shorter than the wrist (stretches on).
enum class CuffStyle { None, Button, Ribbed };

namespace CuffBlock {

// Appends the cuff piece for `style` (attach edge trued to the wrist, sleeve hem
// fullness measured off the finished sleeve) + a wrist placement notch on the
// sleeve hem, and a guide step. Does nothing for CuffStyle::None. Returns false
// (with an honest guide note) when there is no full-length sleeve hem to cuff —
// never fails silently, never touches an existing outline. `wristMM` is the
// finished wrist girth the band is drafted to.
bool apply(DraftedPattern& pattern, CuffStyle style, double wristMM);

// The measured sleeve HEM width (mm, the full hem the cuff gathers) off the
// finished sleeve piece — exposed so the ctest can prove the fullness ratio.
// Returns 0 when no full-length sleeve piece is present.
double sleeveHemWidthMM(const DraftedPattern& pattern);

} // namespace CuffBlock
} // namespace stitchu
