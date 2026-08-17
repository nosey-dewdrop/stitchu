#pragma once
// Measurement snapshot + garment spec enums. Mirrors the Swift engine types.
#include <cmath>
#include <string>

#include "constants.gen.hpp"
#include "contract.gen.hpp"

namespace stitchu {

struct BodyMeasurementsSnapshot {
    double bustCM = 0, waistCM = 0, hipCM = 0, shoulderCM = 0;
    double backLengthCM = 0, armLengthCM = 0, neckCM = 0;
    // OPTIONAL high/upper-bust girth (above the bust, under the arms). This is
    // the ribcage FRAME. When given (> 0), the back and armhole size to it while
    // the front keeps the full bust — a real full-bust adjustment, so a fuller
    // bust no longer gapes at the neck/armhole. When 0, we fall back to the old
    // B/C-cup assumption (bust - 70 mm) and the draft is byte-identical.
    double upperBustCM = 0;

    // BACK share of the girth ARC at each ring — the numbers that give the body
    // a front and a back at all. Source: shaperatios.gen.hpp (mean_all.yaml,
    // MIT, graded by mapping.py); the semantics were verified against
    // GarmentCode's own programs, not assumed. 0 means "not supplied" and the
    // surface falls back to 0.5 — the old symmetric ellipse — so no caller
    // silently changes shape by omitting them.
    double bustBackFrac = 0, waistBackFrac = 0, hipBackFrac = 0;

    // SHOULDER, which a size chart gives as a WIDTH across the body and never as
    // a girth around it. shoulder_w is tip to tip (verified: GarmentCode uses
    // shoulder_w/2 as the shoulder tip's x, bodice.py:58, base_classes.py:37);
    // shoulderInclDeg is the slope in DEGREES (body_params.py keeps it as-is and
    // every use site feeds it to deg2rad). 0 means not supplied and the surface
    // simply has no shoulders, which is what it had before.
    // ★ TUR 16A CORRECTION. This comment used to read "this is NOT the chart's
    // own shoulderCM (37 at EU38) — that is a different quantity, and only the
    // legacy 2D line reads it". The second half is still true; the first half was
    // an ASSERTION and the measurement contradicts it. Driven from shaperatios'
    // width the shoulder line misses Aldrich by -19.3...-10.6mm in eight sizes out
    // of eight, ALL IN THE SAME DIRECTION; driven from the chart column it lands
    // within +5.2...-2.9mm. So the two are not a different quantity — one of them
    // is simply the wrong number for this body, and it is the one still wired in.
    // The switch was built and measured in Tur 16A and BACKED OUT: it costs three
    // shipped gates through spec_census's stitch-count constancy. Full record,
    // numbers and the ordered way out: sizechart.hpp, the note over the grafting
    // loop. DO NOT restore the old "different quantity" sentence.
    double shoulderWidthCM = 0, shoulderInclDeg = 0;

    double bustMM() const { return bustCM * 10; }
    double waistMM() const { return waistCM * 10; }
    double hipMM() const { return hipCM * 10; }
    double shoulderMM() const { return shoulderCM * 10; }
    double backLengthMM() const { return backLengthCM * 10; }
    double neckMM() const { return neckCM * 10; }
    double upperBustMM() const { return upperBustCM * 10; }
};

// Halter is more than a neck shape: the front rises into a nape strap, the
// shoulders are bare (no shoulder seam, no sleeves) and the back is cut low.
// Cowl (patch 3.16): the front neck is cut wide + deep on the BIAS, with drape
// excess so the fabric falls into soft self-facing folds (Aldrich cowl: add
// width + depth to the neckline, bias grainline). PussyBow (patch 3.16): a high
// neck band with a long self-lined tie strip that ties into a bow at the throat
// (band trued to the neckline like a stand collar + a separate tie piece).
enum class Neckline { Crew, Scoop, VNeck, Square, Boat, Sweetheart, Halter, Cowl, PussyBow };
// Gore (F1, 2026-07-19): a multi-panel gored skirt. The skirt is split into N
// vertical panels (default 6 = a six-gore skirt); each panel is narrow at the
// waist (finished waist / N), skims the hip, then flares out like a wedge below
// the hip toward the hem (Aldrich/Armstrong gored skirt). APPEND-only enum — do
// not reorder (int values pin the golden/contract surface).
enum class SkirtStyle { ALine, Straight, Gathered, HalfCircle, Pleated, Gore };
// Dress waist seam level. Empire sits just under the bust (underbust girth);
// empire + gathered = the babydoll silhouette.
enum class Waistline { Natural, Empire };
// Fabric class scales every ease: knits stretch, so they need far less room.
enum class Fabric { Woven, Knit };
enum class SkirtLength { Mini, Midi, Maxi };
enum class SleeveStyle { None, Straight, Balloon };
enum class SleeveLength { Short, Elbow, Long };
// Opt-in sleeve HEAD (cap) treatment (Loop 6 + R1.2). Plain = the classic
// set-in cap (byte-identical default). Gathered = the crown is gathered but the
// cap height is NOT raised (soft high-street puff). Puffed = the crown is
// gathered AND the cap is raised + widened (a puff/gigot that stands up above
// the shoulder). Cap (R1.2) = a SHORT cap-sleeve WING: the set-in cap is kept
// and matched 1:1 to the armhole, but the sleeve is cut off just below the
// notches so only a little wing covers the shoulder (no underarm seam). This is
// the sleeve HEAD; the balloon style gathers the HEM/wrist instead.
enum class SleeveCap { Plain, Gathered, Puffed, Cap };
// How the sleeve joins the body at the shoulder (patch 3.13). Set = the classic
// set-in armhole (byte-identical default). Dropped = the shoulder seam is slid
// DOWN the upper arm (the armhole point drops + widens, the cap flattens) for a
// relaxed/oversized look. Raglan = there is NO shoulder seam; a diagonal seam
// runs from the underarm up to the neckline and the shoulder triangle belongs to
// the sleeve (Aldrich/Armstrong raglan). APPEND-only enum — do not reorder.
enum class ShoulderStyle { Set, Dropped, Raglan };
enum class GarmentType { Skirt, Dress, Top };
enum class TopLength { Cropped, Hip, Tunic };
// How waist suppression is shaped. Princess is the default: seams a person can
// actually sew and the look that justifies the engine; darts are the advanced
// legacy option (also the golden-diff reference against the Swift engine).
enum class Shaping { Princess, Dart };
// How a raw curved edge (neckline / armhole) is finished. Bias binding is the
// DEFAULT (Damla, 17 Jul): a thin 45°-bias strip wrapped over the edge — the
// couture finish, cleaner and thinner on curves than a facing. Facing is the
// opt-in legacy alternative (the old default). A REAL collar always overrides
// the neckline finish (the collar covers the neck edge; no bias there).
enum class EdgeFinish { BiasBinding, Facing };

inline const char* raw(Neckline n) {
    switch (n) {
        case Neckline::Crew: return "crew";
        case Neckline::Scoop: return "scoop";
        case Neckline::VNeck: return "vNeck";
        case Neckline::Square: return "square";
        case Neckline::Boat: return "boat";
        case Neckline::Sweetheart: return "sweetheart";
        case Neckline::Halter: return "halter";
        case Neckline::Cowl: return "cowl";
        case Neckline::PussyBow: return "pussyBow";
    }
    return "";
}
inline const char* title(Neckline n) {
    if (n == Neckline::VNeck) return "v-neck";
    if (n == Neckline::PussyBow) return "pussy-bow";
    return raw(n);
}

inline const char* raw(SkirtStyle s) {
    switch (s) {
        case SkirtStyle::ALine: return "aLine";
        case SkirtStyle::Straight: return "straight";
        case SkirtStyle::Gathered: return "gathered";
        case SkirtStyle::HalfCircle: return "halfCircle";
        case SkirtStyle::Pleated: return "pleated";
        case SkirtStyle::Gore: return "gore";
    }
    return "";
}
inline const char* title(SkirtStyle s) {
    switch (s) {
        case SkirtStyle::ALine: return "A-line";
        case SkirtStyle::Straight: return "straight";
        case SkirtStyle::Gathered: return "gathered";
        case SkirtStyle::HalfCircle: return "half circle";
        case SkirtStyle::Pleated: return "pleated";
        case SkirtStyle::Gore: return "gored";
    }
    return "";
}

inline const char* raw(Waistline w) {
    switch (w) {
        case Waistline::Natural: return "natural";
        case Waistline::Empire: return "empire";
    }
    return "";
}
inline const char* raw(Fabric f) {
    switch (f) {
        case Fabric::Woven: return "woven";
        case Fabric::Knit: return "knit";
    }
    return "";
}

inline const char* raw(SkirtLength l) {
    switch (l) {
        case SkirtLength::Mini: return "mini";
        case SkirtLength::Midi: return "midi";
        case SkirtLength::Maxi: return "maxi";
    }
    return "";
}
// Values live in contract/tables.json (draft.skirtLengthMM) — the K1 single
// contract; contract.gen.hpp is generated from it. Same numbers, one source.
inline double millimeters(SkirtLength l) {
    switch (l) {
        case SkirtLength::Mini: return contract::kSkirtLength_mini;
        case SkirtLength::Midi: return contract::kSkirtLength_midi;
        case SkirtLength::Maxi: return contract::kSkirtLength_maxi;
    }
    return 0;
}

inline const char* raw(SleeveStyle s) {
    switch (s) {
        case SleeveStyle::None: return "none";
        case SleeveStyle::Straight: return "straight";
        case SleeveStyle::Balloon: return "balloon";
    }
    return "";
}
inline const char* title(SleeveStyle s) { return s == SleeveStyle::None ? "sleeveless" : raw(s); }

inline const char* raw(SleeveLength l) {
    switch (l) {
        case SleeveLength::Short: return "short";
        case SleeveLength::Elbow: return "elbow";
        case SleeveLength::Long: return "long";
    }
    return "";
}

inline const char* raw(TopLength t) {
    switch (t) {
        case TopLength::Cropped: return "cropped";
        case TopLength::Hip: return "hip";
        case TopLength::Tunic: return "tunic";
    }
    return "";
}
inline double belowWaist(TopLength t) {
    switch (t) {
        case TopLength::Cropped: return 0;
        case TopLength::Hip: return 180;
        case TopLength::Tunic: return 300;
    }
    return 0;
}

inline const char* raw(GarmentType g) {
    switch (g) {
        case GarmentType::Skirt: return "skirt";
        case GarmentType::Dress: return "dress";
        case GarmentType::Top: return "top";
    }
    return "";
}

inline const char* raw(Shaping s) {
    switch (s) {
        case Shaping::Princess: return "princess";
        case Shaping::Dart: return "dart";
    }
    return "";
}

inline const char* raw(ShoulderStyle s) {
    switch (s) {
        case ShoulderStyle::Set: return "set";
        case ShoulderStyle::Dropped: return "dropped";
        case ShoulderStyle::Raglan: return "raglan";
    }
    return "";
}

struct GarmentSpec {
    GarmentType garment = GarmentType::Dress;
    // Minimal-piece policy (2026-07-17): darts are the DEFAULT bust/waist shaping
    // so a plain bodice stays ONE center-cut panel per side instead of splitting
    // into a center + side panel. Princess seams are OPT-IN (a style the vision
    // layer or the user explicitly requests) — they double the bodice/skirt piece
    // count, which a clean commercial pattern only spends when the style needs it.
    Shaping shaping = Shaping::Dart;
    Waistline waistline = Waistline::Natural; // dress only
    Fabric fabric = Fabric::Woven;
    Neckline neckline = Neckline::Crew;
    SleeveStyle sleeveStyle = SleeveStyle::None;
    SleeveLength sleeveLength = SleeveLength::Short;
    // Opt-in gathered / puff sleeve HEAD (Loop 6). Plain by default → the cap
    // path is byte-identical. See sleeve.hpp / FORMULAS.md "Gathered/puff sleeve cap".
    SleeveCap sleeveCap = SleeveCap::Plain;
    SkirtStyle skirtStyle = SkirtStyle::ALine;
    SkirtLength skirtLength = SkirtLength::Midi;
    // Opt-in CONTINUOUS skirt length (foto-oran kablosu): target waist-seam→hem
    // length in mm, measured from the photo's ratios × the wearer's own body.
    // 0 = off → the mini/midi/maxi contract table drives, byte-identical.
    // Engine clamps to [250, 1200] mm; hip depth is NOT coupled (empire's
    // lengthExtraMM keeps that job).
    double skirtLengthMM = 0;
    TopLength topLength = TopLength::Hip;
    // Opt-in hem ruffle (fırfır). Off by default → existing drafts unchanged.
    bool ruffleHem = false;
    double ruffleFullness = constants::kRuffleFullnessDefault; // gather ratio 2.0–3.0 (constants.yaml)
    double ruffleDepthMM = 80;   // how deep the ruffle hangs
    int ruffleTiers = 1;         // cascading tiers (kademeli); 1 = single ruffle
    // Opt-in keyhole (anahtar deliği) opening below the front neckline.
    bool keyhole = false;
    // Opt-in front button placket (düğme patı): grown-on button stand + fold line
    // + button/buttonhole markings on the front. Off by default → byte-identical.
    bool frontPlacket = false;
    // Opt-in placket VARIANT (R1.2): 0 = None, 1 = Standard (== frontPlacket), 2 =
    // Asymmetric (the CF closure shifted off center, the Jackie gingham). When
    // Asymmetric, the placket is drawn even if frontPlacket is false. 0/1 mirror
    // the bool so the base draft is byte-identical. See placket.hpp / FORMULAS.md
    // "Asymmetric button placket".
    int placketStyle = 0; // PlacketStyle enum value; 0 = None
    // Opt-in fabric ties / sash / bow (bağ / kuşak / fiyonk): adds separate tie
    // pieces (self-fabric strips) + a placement notch. Off by default (None) →
    // byte-identical. See tie.hpp / FORMULAS.md "Fabric ties / sashes".
    int tieClosure = 0; // TiePlacement enum value; 0 = None
    // Opt-in collar family (yaka, Loop 7/8): adds a separate collar piece whose
    // neck edge is trued to the neckline. Off by default (None) → byte-identical.
    // See collar.hpp / FORMULAS.md "Collar family".
    int collarType = 0; // CollarType enum value; 0 = None
    int collarEdge = 0; // CollarEdge enum value (flat family outer edge); 0 = Round
    // Opt-in drawstring / shirred / smocked gathering (büzgü, Loop 8): adds a
    // separate gathered PANEL piece (+ a drawstring cord when drawstring) whose
    // gathered edge is trued to the drafted zone edge. Off by default (None) →
    // byte-identical. See gather.hpp / FORMULAS.md "Drawstring / shirred /
    // smocked gathering".
    int gatherType = 0; // GatherType enum value; 0 = None
    int gatherZone = 0; // GatherZone enum value; 0 = Neckline
    // Opt-in open-back cutout (açık sırt oyuğu, Loop 9b): a shaped opening in the
    // BACK center piece below the nape + a facing whose inner edge is trued to
    // the opening. Off by default (None) → byte-identical. See openback.hpp /
    // FORMULAS.md "Open-back cutout". Can coexist with a tie-back (Loop 4b): the
    // tie draws the closure, this draws the opening it fastens over.
    int backOpening = 0; // BackOpening enum value; 0 = None
    // Opt-in back hem slit / walking vent (arka etek yırtmacı, Loop M1): a walking
    // opening up the center-back seam of a fitted/straight skirt or dress back.
    // Off by default (None) → byte-identical. Only a straight/A-line back with a CB
    // seam candidate hosts one; gathered/pleated/half-circle skirts are skipped
    // honestly. See slit.hpp / FORMULAS.md "Back hem slit / walking vent".
    int backSlit = 0; // HemSlit enum value; 0 = None
    // Opt-in ruffled shoulder straps (fırfırlı askı, queue #3): a gathered
    // self-fabric frill strip drawn as a separate strap pair + a placement notch
    // at each shoulder point. Off by default (None) → byte-identical. Only a
    // sleeveless dress/top carries one; a sleeved/halter garment is skipped
    // honestly. See strap.hpp / FORMULAS.md "Ruffled straps".
    int ruffledStraps = 0; // StrapStyle enum value; 0 = None
    // Opt-in peplum (bele takılan volan, R1.1): a flat circular/part-circular
    // flare hung from the waist as a separate piece, inner arc trued to the
    // finished waist. Off by default (None) → byte-identical. Only a waisted
    // bodice/top hosts one; a pleated/gathered/draped peplum stays honest. See
    // peplum.hpp / FORMULAS.md "Peplum".
    int peplum = 0; // PeplumStyle enum value; 0 = None
    // Neckline + armhole edge finish (patch 3.10). Bias binding is the DEFAULT
    // (Damla, 17 Jul): thin 45°-bias strip pieces, trued to the drafted edge
    // circumference, replacing the neck facings on any open (collarless) neck and
    // adding an armhole binding on any sleeveless armhole. Facing (=1) is opt-in
    // and restores the old facing pieces. A real collar (collarType != None)
    // keeps the collar piece regardless (the collar covers the neck edge).
    // See bodice.cpp biasBinding / FORMULAS.md "Bias binding edge finish".
    int edgeFinish = 0; // EdgeFinish enum value; 0 = BiasBinding (default)
    // Opt-in pocket (cep, patch 3.12): a PATCH pocket (a separate piece sewn onto
    // the outside of a body panel + a placement mark) or a SIDE-SEAM in-seam
    // pocket (two pocket-bag pieces set into the side seam + a mouth-opening
    // mark). Off by default (None) → byte-identical. Welt/besom, cargo, kangaroo
    // stay honest (missing.js). See pocket.hpp / FORMULAS.md "Pockets".
    int pocketStyle = 0; // PocketStyle enum value; 0 = None

    // Opt-in sleeve-end cuff (manşet, patch 3.13): a separate band stitched to
    // the wrist end of a full-length sleeve, the sleeve hem gathered/pleated in.
    // Off by default (None) → byte-identical. Only a garment with a real
    // full-length sleeve (Straight/Long or Elbow) carries a cuff; sleeveless /
    // cap / short skip honestly. See cuff.hpp / cuff.cpp / FORMULAS.md "Cuff family".
    int cuffStyle = 0; // CuffStyle enum value; 0 = None
    // Opt-in hem SHAPE (etek ucu şekli, patch 3.15): reshapes the LOWER-edge line
    // of the fitted skirt/dress-skirt/top pieces. Off by default (0 = Straight) →
    // byte-identical. Shirttail = center front + center back stay long, the sides
    // curve up (soft shirt-tail hem); HighLow = the front is short and the back is
    // dramatically longer. Only ADDS rise at the SIDE hem / drops the back hem; the
    // waist, side-seam LENGTH balance and center hem stay trued. Asymmetric-diagonal
    // and handkerchief (peplum's pointed) hems stay honest (missing.js). See
    // hem.hpp / FORMULAS.md "Hem shape".
    int hemShape = 0; // HemShape enum value; 0 = Straight
    // Opt-in button row (düğme sırası, vocab 2026-07-17): a drawn vertical row of
    // round button circles down the front. 0 = None (byte-identical), 1 =
    // Functional (a real CF button opening — grown stand + buttons + buttonholes,
    // opens for donning, reuses the placket geometry), 2 = Decorative (buttons
    // sewn on for looks, no opening). See buttonrow.hpp / FORMULAS.md "Button rows".
    int buttonRow = 0; // ButtonRow enum value; 0 = None
    // Opt-in exposed/visible zipper (görünür fermuar, vocab 2026-07-17): a VISIBLE
    // design zip drawn as a teeth glyph on the CF or CB seam, exposed-zip seam
    // allowance, opens for donning. 0 = None (byte-identical), 1 = CenterFront,
    // 2 = CenterBack. Distinct from the invisible CB zip a dress always carries.
    // See exposedzip.hpp / FORMULAS.md "Exposed zipper".
    int exposedZip = 0; // ExposedZip enum value; 0 = None
    // Opt-in back detail (arka pelerin/fırfır, vocab 2026-07-17): a separate cut
    // piece attached at the back neck — a gathered ruffle, a draped cape, or a
    // circular flounce, attach edge trued to the back neck edge. 0 = None
    // (byte-identical), 1 = Ruffle, 2 = Cape, 3 = Flounce. See backdetail.hpp /
    // FORMULAS.md "Back detail".
    int backDetail = 0; // BackDetail enum value; 0 = None
    // Opt-in off-shoulder / bardot neckline (omuz açık / bardot, vocab 2026-07-17):
    // reshapes the bodice top edge DOWN below the shoulder + an elastic casing (+
    // optional bardot frill). 0 = None (byte-identical), 1 = Plain, 2 = Frill.
    // Unlocks the off-shoulder gingham dress. See offshoulder.hpp / FORMULAS.md
    // "Off-shoulder / bardot".
    int bardotStyle = 0; // BardotStyle enum value; 0 = None
    // Opt-in shoulder/sleeve-join style: 0 = Set (classic set-in armhole,
    // byte-identical), 1 = Dropped (shoulder seam slid down the arm, armhole
    // lowered + widened, cap flattened), 2 = Raglan (no shoulder seam; diagonal
    // seam from underarm to neckline, shoulder belongs to the sleeve). Off by
    // default (Set) → the base draft is byte-identical. Threaded into the bodice +
    // sleeve draft (not a post-pass) so the armhole/cap reshape trues together.
    // See shoulder.hpp / FORMULAS.md "Dropped shoulder + raglan".
    int shoulderStyle = 0; // ShoulderStyle enum value; 0 = Set
    // Opt-in cup seam (kup dikişi — Corset Bustier, patterns_real/BUGRA-DEFTER.md):
    // splits the princess FRONT panels into an Upper Cup + a Lower Cup along a
    // HORIZONTAL seam through the bust apex — the strapless/sweetheart bustier
    // construction the motor was missing (it gave the bust curve through the
    // vertical princess seam alone). 0 = None (byte-identical), 1 = Horizontal.
    // Only a princess-seamed sweetheart/strapless front hosts one; any other host
    // is refused honestly. See cupseam.hpp / FORMULAS.md "Cup seam".
    int cupSeam = 0; // CupSeam enum value; 0 = None
    // Opt-in yoke split (roba — doll / babydoll / swing dress): splits the FRONT and
    // BACK bodice panels along a HORIZONTAL seam high on the chest into a Yoke (the
    // shoulder panel) + a lower body that flares/gathers from the yoke seam. The
    // highest-frequency missing capability found by a forensic pass over 23 fashion
    // flats. 0 = None (byte-identical), 1 = Plain. The yoke line is MEASURED off each
    // panel's own drawn shoulder-to-hem drop (never hardcoded). Only a dress/top with
    // a bodice front/back hosts one; any other host is refused honestly.
    // See yoke.hpp / FORMULAS.md "Yoke split".
    int yoke = 0; // Yoke enum value; 0 = None
    // Opt-in center inverted box pleat (orta ters kutu pili): the first LOCALIZED
    // fullness — a SINGLE fold at the center front, as opposed to the distributed
    // gather the engine already has. Widens the CF-foldable front panel by a fixed
    // pleat underlay, folded behind so the finished width equals the original; the
    // extra fabric tucks under (an inverted box pleat). Unlocks the swing / doll
    // top (yoke + center box pleat). 0 = None (byte-identical), 1 = CenterInverted.
    // Only a dress/top with a CF-foldable front panel (incl. the yoke "Front Body")
    // hosts one; a skirt-only or cut-2 front is refused honestly.
    // See boxpleat.hpp / FORMULAS.md "Center inverted box pleat".
    int boxPleat = 0; // BoxPleat enum value; 0 = None
    // Opt-in corset lace-up back (korse bağcıklı sırt): an eyelet-laced CENTER-BACK
    // closure — the two back halves leave an open gap spanned by a cord that
    // criss-crosses between two columns of eyelets (one down each back edge). Adds
    // a CB facing strip on each back edge + trued eyelet columns + a lacing cord
    // piece. Off by default (None) → byte-identical. Only a fitted (princess/dart)
    // bodice back on a dress/top hosts one; a skirt or loose/gathered back is
    // refused honestly. The open laced gap is a real donning opening (so no CB
    // zipper is stamped). 0 = None, 1 = Corset. See laceupback.hpp / FORMULAS.md
    // "Corset lace-up back".
    int laceUpBack = 0; // LaceUpBack enum value; 0 = None
    // Opt-in true wrap / surplice crossover front (kruvaze / surplice ön): a REAL
    // crossed double front (the wrap-dress / surplice-bodice family), not a tie.
    // The on-fold half front is REBUILT as a full asymmetric panel whose CF edge is
    // extended past center front into a diagonal WRAP edge that crosses the body
    // centerline; the front is then cut 2 mirror-image (left-wrap + right-wrap) so
    // the two panels lap over each other at CF and the drafted neck edge meets the
    // wrap edge as a surplice V. Off by default (None) → byte-identical. Only a
    // dress/top bodice front (dart or princess center) hosts one; a skirt is refused
    // honestly. The wrap IS the donning opening (no CB zip). 0 = None, 1 = Surplice.
    // See wrapfront.hpp / FORMULAS.md "Wrap / surplice front".
    int wrapFront = 0; // WrapFront enum value; 0 = None
    // Opt-in all-around hem flounce (etek ucu volanı — dropped-waist tiered look):
    // a gathered flounce tier hung from the WHOLE hem (front + back), NOT a peplum
    // (waist) or a back-neck flounce (nape). A flat strip cut ~2:1 wider than the
    // measured hem and drawn up to fit it, attached all the way around. Off by
    // default (None) → byte-identical. Only a dress/top with a real hosting hem
    // carries one; a gathered/flared skirt (already rippling) is refused honestly.
    // 0 = None, 1 = Gathered (Circular reserved for later). See hemflounce.hpp /
    // FORMULAS.md "All-around hem flounce".
    int hemFlounce = 0; // HemFlounce enum value; 0 = None
    // Opt-in Bugra Locket Top construction (patterns_real/BUGRA-DEFTER.md, second
    // purchased pattern): a waist-length buttoned dart top rebuilt as the Locket's
    // six pieces — Front Body (cut 2, big cut-open side bust dart), Back Body
    // (CUT ON FOLD, waist dart), a TWO-PIECE gathered puff-band sleeve (Upper +
    // Lower Sleeve) and the deep-crescent Collar + separate smaller Collar Lining
    // (collarType crescent), with no neck facings (the collar finishes the neck,
    // as the purchased pattern does). 0 = None (byte-identical), 1 = Bugra. Only
    // the exact host class (waist-length dart top, short set-in puffed sleeve,
    // buttoned CF, crescent collar) hosts it; anything else is refused honestly.
    // See locket.hpp.
    int locketTop = 0; // LocketTop enum value; 0 = None
};

inline double roundToPlaces(double value, int places) {
    const double factor = std::pow(10.0, places);
    return std::round(value * factor) / factor;
}

} // namespace stitchu
