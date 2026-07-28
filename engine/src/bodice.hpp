#pragma once
// Parametric bodice block (FreeSewing Bella + Muller & Sohn). See FORMULAS.md.
#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {

struct BodiceDraft {
    // Dart mode: back + front only. Princess mode: back/front are the CENTER
    // panels and backSide/frontSide carry the side panels (princess = true).
    PatternPiece back;
    PatternPiece front;
    PatternPiece backSide;
    PatternPiece frontSide;
    bool frontPrincess = false; // a half with near-zero intake stays unsplit
    bool backPrincess = false;
    // Princess seam lengths (split point -> apex -> waist leg) per panel edge;
    // the two edges of one seam must match to be sewable.
    double frontSeamCenterLen = 0;
    double frontSeamSideLen = 0;
    double backSeamCenterLen = 0;
    double backSeamSideLen = 0;
    double backWaistHalf = 0;
    double frontWaistHalf = 0;
    double frontLength = 0;
    double backLength = 0;
    // Piece-frame waist levels/lengths (== body frame except the halter's
    // shifted halves) — what extendPiece must match against the geometry.
    double frontPieceWaistY = 0;
    double backPieceWaistY = 0;
    double frontPieceLength = 0;
    double backPieceLength = 0;
    // Halter: total raw edge (both sides, front neck + strap + sweep, back
    // top + stub) the bias binding must cover, measured from THIS geometry.
    double halterBindingEdgeMM = 0;
    double armholeLength = 0;   // one arm, front half + back half, sewing line
    double armholeDepth = 0;
    double sideWaistY = 0;      // shared side waist basis (= waist seam level)
    double waistSeamY = 0;      // absolute y of the waist seam (empire < natural)
    // Audit values consumed by the validator.
    double frontSideSeam = 0;
    double backSideSeam = 0;
    double frontSewnWaist = 0;  // along drafted curve, dart intake excluded
    double backSewnWaist = 0;
    // Arc from the center edge to the princess seam along the sewn waist —
    // the skirt places its gore seam at the same arc so the seams meet.
    double frontWaistCenterArc = 0;
    double backWaistCenterArc = 0;
    double frontStraightWaist = 0;
    double backStraightWaist = 0;
    double frontChestWidth = 0;
    double backChestWidth = 0;
    // Extra chest width added to BOTH halves by a dropped shoulder (0 otherwise).
    // The validator reads this back so its "ease being eaten" chest check knows
    // the widen is intentional. Set/Raglan → 0 → byte-identical expectation.
    double droppedWiden = 0;
};

namespace BodiceBlock {

inline constexpr double chestEase = 0.11;
inline constexpr double waistEase = 0.05;
// Knits stretch; they need a fraction of the woven ease.
inline constexpr double knitChestEase = 0.04;
inline constexpr double knitWaistEase = 0.02;
inline double chestEaseFor(Fabric f) { return f == Fabric::Knit ? knitChestEase : chestEase; }
inline double waistEaseFor(Fabric f) { return f == Fabric::Knit ? knitWaistEase : waistEase; }
// Empire waist seam: this far below the armhole line, girth = underbust.
inline constexpr double empireDrop = 60;
inline constexpr double empireBalanceDrop = 15; // CF drop at underbust (M&S balance, reduced)
inline constexpr double armholeDepthFactor = 0.44;
// Armscye-for-arm floor: the armhole must be deep enough to seat the biceps on
// a short-backed, fuller-armed body (else the set-in sleeve can't ease in).
// bicepsRatioForArmscye mirrors the sleeve's biceps ratio (bare arm, no ease);
// armscyeArmFactor sets how much armhole depth one unit of biceps girth needs
// (tuned so the sleeve cap ease lands in 1-9%); armscyeMaxDepthShare clamps the
// underarm above the waist so deepening never eats the whole bodice.
inline constexpr double bicepsRatioForArmscye = constants::kBicepsBustRatio;
inline constexpr double armscyeArmFactor = 0.60;
inline constexpr double armscyeMaxDepthShare = 0.72;
inline constexpr double backNeckWidthFactor = 0.197;
inline constexpr double frontNeckWidthFactor = 0.17;
inline constexpr double backNeckCutoutFactor = 0.06;
inline constexpr double centerBackReduction = 0.35;
inline constexpr double underbustOffset = constants::kUnderbustOffsetMM; // ASSUMPTION: B/C cup (constants.yaml)
inline constexpr double shoulderDropFactor = constants::kShoulderDropFactorDeprecated; // DEPRECATED (constants.yaml: refuted; still frames neckFacings)
// Aldrich shoulder seam (2026-07-18): the neck-point -> shoulder-tip seam is drawn
// at a fixed SLOPE over a fixed LENGTH, independent of neckline width, so a boat
// neck no longer collapses the run into a short/steep seam. EU38 shoulder ~120 mm
// at ~22 deg from horizontal (Aldrich womenswear block).
inline constexpr double shoulderSlopeDeg = constants::kShoulderSlopeDeg;      // seam angle from horizontal (constants.yaml)
inline constexpr double shoulderSeamTargetMM = constants::kShoulderSeamTargetMM; // neck point -> tip; drawn seam ~118 after
                                                      // the neck/armhole curves trim the corners
// How much of the front waist suppression slants the side seam (rest = bust dart).
// Lowered from 15 mm to 5 mm so the single waist->apex dart deepens to the Aldrich
// B-cup range (~15 deg) instead of the old flat ~11.5 deg.
inline constexpr double frontSideTakeMM = 3.0;
inline constexpr double frontBalanceDrop = 40;     // M&S front balance
inline constexpr double backWaistShare = 0.48;     // ASSUMPTION
inline constexpr double maxNeckShoulderShare = 0.72;

// Princess split: where the seam leaves the armhole, as a share of the
// armhole depth below the shoulder tip (kept above the bust apex).
inline constexpr double princessArmholeShare = 0.38;
inline constexpr double princessApexClearance = 30; // split at least this far above apex

// Halter (no shoulder seam): the front rises this far above the shoulder line
// into a nape strap this wide; the back top edge is cut down to this share of
// the armhole depth. Edges are finished with one bias binding strip.
inline constexpr double halterStrapRise = 55;
inline constexpr double halterStrapWidth = 40;
inline constexpr double halterBackDropShare = 0.55;
inline constexpr double halterBindingWidth = 32;

// extendBelowWaist/hipHalfQuarter (tops, princess only): the panels continue
// through the waist to the hem, staying fitted. Dart mode ignores them (the
// top block extends dart pieces with its own boxy extension).
struct BodiceOptions {
    Neckline neckline = Neckline::Crew;
    Shaping shaping = Shaping::Princess;
    Waistline waistline = Waistline::Natural; // Empire: seam at underbust
    Fabric fabric = Fabric::Woven;
    double extendBelowWaist = 0;
    double hipHalfQuarter = 0;
    // Shoulder/sleeve-join style (patch 3.13). Set (default) is byte-identical:
    // the Dropped branch only runs when this is Dropped, so every existing draft
    // is untouched. Raglan is a post-pass in garment.cpp, not here.
    ShoulderStyle shoulderStyle = ShoulderStyle::Set;
    // Armhole shape (patch: smoother, correctly hollowed scye). A sleeveless
    // armhole is cut in slightly at the shoulder and raised a touch at the
    // underarm so a strapless/tank edge does not gape on the bare shoulder — the
    // real pattern-maker's sleeveless armhole. A set-in-sleeve armhole keeps the
    // full width so the sleeve cap seats. Set by garment.cpp from the sleeve.
    bool sleeveless = false;
    // Corset fit (Bugra Buttoned Corset Bustier, cupSeam == Bugra only): a
    // fitted buttoned corset is drafted at ZERO wearing ease — the purchased
    // Buğra size-36 pieces measure the front half at ~underbust/4 exactly, no
    // ease band. false (default) keeps chestEaseFor/waistEaseFor byte-identical.
    bool corsetEase = false;
    double corsetChestEase = 0;  // used only when corsetEase (set from bugra::)
    double corsetWaistEase = 0;
    // WHERE the princess seam sits across the waist span (0.5 = the classic
    // dart-center default, byte-identical). The Buğra corset carries its front
    // seam nearer the side (the whole cup region above the underbust is one
    // piece, so the seam is a style line, not an apex line) and its back seam
    // nearer the fold. Only the corset construction moves these.
    double princessShareFront = 0.5;
    double princessShareBack = 0.5;
    // WHERE the side seam sits around the body (Bugra Locket Top, locketTop ==
    // Bugra only): the purchased Locket pieces measure the front half WIDER and
    // the back half NARROWER than the even bust/4 split — the side seam is moved
    // toward the back. Positive = mm moved from the back quarter into the front
    // quarter at BOTH the chest and the waist, so the total girth and the total
    // suppression are unchanged (only the seam walks). 0 (default) keeps every
    // existing draft byte-identical.
    double sideSeamShiftMM = 0;
};

// Armhole scye shape (Aldrich / Armstrong bodice block). The armhole is NOT a
// lazy diagonal — it hollows in below the shoulder, is deepest (most concave)
// near the underarm, and the FRONT scye is scooped deeper than the BACK. These
// shares drive the single cubic's control points so the curve renders smooth
// AND carries the correct scye hollow.
// hollowShare = how far the mid-armhole pulls INSIDE the shoulder->underarm
// chord (fraction of the chest width span); front deeper than back.
inline constexpr double armholeHollowShareFront = 0.34;
inline constexpr double armholeHollowShareBack  = 0.24;
// Where along the drop the two control points sit (upper leaves the shoulder
// heading down + slightly out; lower approaches the underarm near-tangent to
// the side seam so the underarm is a smooth turn, not a corner).
inline constexpr double armholeUpperDropShare = 0.30; // cp1 y, below shoulder
inline constexpr double armholeLowerDropShare = 0.78; // cp2 y, above underarm
// How far cp1 reaches out along the SHOULDER-SEAM tangent before the hollow
// pulls it back in. This is what makes the scye leave the shoulder tip tangent-
// continuous with the shoulder seam (kills the old ~77 deg V-kink / spike the
// render-audit flagged). A fraction of the shoulder->underarm chord.
inline constexpr double armholeShoulderTangentShare = 0.26;
// Sleeveless cut-in: shoulder tip moved in, underarm raised, so a bare-shoulder
// armhole sits close to the body instead of gaping.
inline constexpr double sleevelessShoulderCutInMM = 9.0;
inline constexpr double sleevelessUnderarmRaiseMM = 6.0;
// Set-in-sleeve armscye (opt-in; the sleeveless/default scye above is UNCHANGED).
// A set-in armhole is NOT tangent-continuous with the shoulder seam: it breaks at
// the shoulder tip and the sleeve-cap seam covers that corner. cp1 leaves the tip
// heading DOWN into the scye (its own direction, not along the shoulder seam), and
// the scye is scooped deeper than a sleeveless one; the FRONT is deeper than BACK.
// Measured (Bugra-Locket front 38, 2026-07-28): freeing cp1 from the shoulder-
// tangent lock drops the traced scye residual 20.6 -> ~11 mm, and the optimum
// leaves the tip near-perpendicular to the shoulder line — i.e. a real set-in scye.
inline constexpr double setInArmholeHollowShareFront = 0.42; // deeper than sleeveless 0.34
inline constexpr double setInArmholeHollowShareBack  = 0.30; // deeper than sleeveless 0.24
inline constexpr double setInArmholeCp1OutShare      = 0.06; // cp1 x: near shoulder, slight outward
inline constexpr double setInArmholeUpperDropShare   = 0.42; // cp1 y: drops into the scye (own direction)
inline constexpr double setInArmholeLowerDropShare   = 0.70; // cp2 y: above the underarm

BodiceDraft draft(const BodyMeasurementsSnapshot& m, const BodiceOptions& options);
// Convenience overload (defaults: natural waist, woven).
BodiceDraft draft(const BodyMeasurementsSnapshot& m, Neckline neckline = Neckline::Crew,
                  Shaping shaping = Shaping::Princess,
                  double extendBelowWaist = 0, double hipHalfQuarter = 0);

// Neckline facing pieces (front + back) for dress and top blocks. The inner
// edge repeats the garment neckline commands exactly, so the seam matches by
// construction; the outer edge is a 55 mm normal offset of the neckline.
inline constexpr double facingDepth = 55;
// Fabric the facings add to dress/top estimates. Golden dumps subtract this:
// the Swift reference engine predates facings.
inline constexpr double facingFabricMeters = 0.2;
// Fabric for the sleeveless armhole finish: both armholes are bias-bound (the
// guide's "finish the armholes with bias binding" step). One 40 mm bias strip
// per armhole; a self-fabric bias strip cut across the grain eats ~1.4x its
// finished length in length once you account for the diagonal. Estimate in
// meters from the drafted single-arm armhole length (front half + back half).
inline constexpr double armholeBiasStripWidthMM = 40;
inline double armholeBiasFabricMeters(double singleArmholeLengthMM) {
    // two armholes x armhole length x 1.4 bias factor, strip 40 mm deep, +10%
    // handling; a thin sliver of fabric, but real and now counted honestly.
    return (2.0 * singleArmholeLengthMM * 1.4) * armholeBiasStripWidthMM / 1.0e6 * 1.1;
}
std::vector<PatternPiece> neckFacings(const BodyMeasurementsSnapshot& m, Neckline neckline,
                                      const std::string& frontCut, const std::string& backCut);

// Halter replaces the facings: ONE bias strip binds every raw edge (neckline,
// strap, sweep, back top). edgeMM comes from BodiceDraft.halterBindingEdgeMM
// so the strip can never drift from the drawn geometry.
PatternPiece halterBinding(double edgeMM);

// Bias binding edge finish (patch 3.10, DEFAULT). A thin 45°-bias strip cut to
// the finished edge circumference + overlap, wrapped over a raw curved edge —
// the couture neckline/armhole finish, cleaner than a facing on curves.
// Finished bias width bindingFinishedWidth (6 mm), cut ~4× that so it folds
// double and wraps. edgeMM is measured off the DRAWN edge (neck edge / armhole
// circumference) so the strip length can never drift from the geometry.
inline constexpr double bindingFinishedWidth = 6;          // finished bias width
inline constexpr double bindingCutWidth = bindingFinishedWidth * 4 + 1; // 25 mm cut
inline constexpr double bindingOverlap = 20;               // seam/overlap allowance
// Fabric a bias binding pair adds to dress/top estimates (thin — much less than
// a facing). Golden dumps subtract this the same way as facingFabricMeters.
inline constexpr double bindingFabricMeters = 0.1;
PatternPiece biasBinding(double edgeMM, const std::string& label);

// The finished neck edge circumference (front neck edge + back neck edge),
// measured off the SAME drafted neckline commands the bodice/facing use, so a
// bias neck strip is trued to the exact edge it binds. One truth, one place.
double neckEdgeLength(const BodyMeasurementsSnapshot& m, Neckline neckline);

} // namespace BodiceBlock

} // namespace stitchu
